// Explicit opt-in real pipeline test. Uses existing narration cache when present.
import { spawn } from "node:child_process";
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
const directory = path.resolve(`out/cli-smoke-${randomUUID()}`);
const workspace = path.join(directory, "workspace");
await mkdir(path.join(workspace, "production/speech"), { recursive: true });
const previous = JSON.parse(await readFile("out/elevenlabs-smoke/validation.json", "utf8"));
for (const suffix of ["", ".json"]) await copyFile(`${previous.file}${suffix}`, path.join(workspace, "production/speech", `${path.basename(previous.file)}${suffix}`));
const configured = path.join(process.env.APPDATA ?? "", "ClipRush Editor Studio/workspace/codex.json");
await copyFile(configured, path.join(workspace, "codex.json"));
const video = path.resolve("out/elevenlabs-pipeline-ba4e9323-d81f-43d1-b7cb-8d73f34835d8/fixture.mp4");
const request = { narration: "Olá! Eu sou a voz do ClipRush. Vamos descobrir algo surpreendente?",
  instructions: "Teste técnico: use somente a mídia fornecida. Selecione três trechos descontínuos, com zoom no segundo e legendas sincronizadas. Não afirme fatos sobre a imagem. Use os blocos de narração e timestamps fornecidos. Não busque catálogo, não execute ferramentas nem leia outros arquivos. Retorne apenas o JSON do plano solicitado pelo app.",
  name: "CLI integration smoke", media: [video] };
const inputFile = path.join(directory, "input.json");
await writeFile(inputFile, JSON.stringify(request));
console.log(JSON.stringify({ type: "test-workspace", directory }));
const child = spawn(process.execPath, ["scripts/produce.mjs", "--input", inputFile], { env: { ...process.env, CLIPRUSH_DATA_HOME: directory }, stdio: "inherit", windowsHide: true });
child.on("exit", code => { process.exitCode = code ?? 1; });
