import { build } from "esbuild";
import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile, stat, rename } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import electron from "electron";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(root);
const usage = 'Uso: npm run produce -- --input out/pedido.json (ou --input - para JSON via stdin). Campos: narration, instructions; opcionais: name, projectId, media.';
const args = process.argv.slice(2);
if (args.length === 1 && args[0] === "--help") { console.log(usage); process.exit(0); }
let directory;
let interrupted = false;
let child;
try {
  if (args.length !== 2 || args[0] !== "--input") throw new Error(usage);
  let raw;
  if (args[1] === "-") {
    raw = "";
    for await (const chunk of process.stdin) { raw += chunk; if (Buffer.byteLength(raw) > 100000) throw new Error("Pedido maior que 100 KB."); }
  } else {
    if ((await stat(args[1])).size > 100000) throw new Error("Pedido maior que 100 KB.");
    raw = await readFile(args[1], "utf8");
  }
  let input;
  try { input = JSON.parse(raw); } catch { throw new Error("Pedido deve ser JSON válido."); }
  if (!input || typeof input.narration !== "string" || !input.narration.trim() || input.narration.length > 10000 ||
      typeof input.instructions !== "string" || !input.instructions.trim() || input.instructions.length > 29000)
    throw new Error("Informe narration (até 10.000 caracteres) e instructions (até 29.000 caracteres).");
  // Do not copy unknown fields such as accidentally supplied API keys into the spool.
  const request = { narration: input.narration, instructions: input.instructions,
    ...Object.fromEntries(["name", "projectId", "media"].filter(key => input[key] !== undefined).map(key => [key, input[key]])) };
  if (request.media !== undefined) {
    if (!Array.isArray(request.media) || request.media.length > 40 || request.media.some(file => typeof file !== "string")) throw new Error("media deve conter até 40 caminhos locais.");
    request.media = request.media.map(file => path.resolve(root, file));
  }
  try { await stat(path.join(root, "dist/render/index.html")); }
  catch { throw new Error("Bundle Remotion desktop ausente. Execute npm run desktop:build antes da produção."); }
  directory = path.join(root, "out", "cli", randomUUID());
  await mkdir(directory, { recursive: true });
  const requestFile = path.join(directory, "request.json");
  const events = path.join(directory, "events.jsonl");
  await writeFile(requestFile, JSON.stringify(request), { flag: "wx", mode: 0o600 });
  await writeFile(events, "", { flag: "wx", mode: 0o600 });
  // Build just the existing main entry, never the library/presets or a second pipeline.
  const compiled = await build({ entryPoints: [path.join(root, "desktop/main.ts")], outfile: path.join(root, "dist/desktop/main.cjs"), bundle: true,
    platform: "node", format: "cjs", target: "node22", external: ["electron", "@remotion/renderer", "@remotion/bundler", "typescript", "esbuild"], sourcemap: true, write: false });
  await mkdir(path.join(root, "dist/desktop"), { recursive: true });
  for (const output of compiled.outputFiles) {
    const temporary = `${output.path}.${path.basename(directory)}.tmp`;
    await writeFile(temporary, output.contents, { flag: "wx" });
    await rename(temporary, output.path);
  }
  const env = { ...process.env };
  delete env.ELECTRON_RUN_AS_NODE;
  let exitCode;
  child = spawn(electron, [path.join(root, "dist/desktop/main.cjs"), "--produce-request", requestFile], { cwd: root, env, windowsHide: true, stdio: "ignore" });
  child.on("error", () => { exitCode = 1; });
  child.on("exit", code => { exitCode = code ?? 1; });
  const cancel = () => { interrupted = true; void writeFile(`${events}.cancel`, "cancel"); };
  process.on("SIGINT", cancel); process.on("SIGTERM", cancel);
  let offset = 0;
  let terminal = false;
  const started = Date.now();
  while (!terminal) {
    const contents = await readFile(events, "utf8");
    const end = contents.lastIndexOf("\n") + 1;
    for (const line of contents.slice(offset, end).split("\n").filter(Boolean)) {
      const event = JSON.parse(line);
      process.stdout.write(JSON.stringify(event) + "\n");
      if (event.type === "completed" || event.type === "error") {
        terminal = true; process.exitCode = event.type === "completed" ? 0 : 1;
        await writeFile(path.join(directory, "result.json"), JSON.stringify(event, null, 2));
      }
    }
    offset = end;
    if (terminal) break;
    if (exitCode !== undefined && exitCode !== 0) throw new Error("Electron não iniciou ou encerrou antes do resultado. Verifique o runtime e as preferências do workspace.");
    if (!offset && Date.now() - started > 120000) throw new Error("O aplicativo não confirmou o pedido CLI em 120 segundos. Reinicie uma instância antiga após atualizar o main.");
    if (interrupted && Date.now() - started > 1800000) throw new Error("Cancelamento solicitado; consulte os eventos do pedido.");
    await new Promise(resolve => setTimeout(resolve, 300));
  }
} catch (error) {
  if (directory) await writeFile(path.join(directory, "events.jsonl.cancel"), "cancel").catch(() => undefined);
  process.stdout.write(JSON.stringify({ type: "error", error: error instanceof Error ? error.message : "Falha na CLI." }) + "\n");
  process.exitCode = 1;
}
