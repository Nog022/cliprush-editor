import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { parseEnv } from "node:util";
import { execFileSync } from "node:child_process";
const key = parseEnv(await readFile(".env.local", "utf8")).ELEVENLABS_API_KEY;
if (!key) throw new Error("Chave ausente; verificação não executada.");
const tracked = execFileSync("git", ["ls-files", "--", ".env.local"], { encoding: "utf8", windowsHide: true }).trim();
if (tracked) throw new Error(".env.local está rastreado pelo Git.");
execFileSync("git", ["check-ignore", "-q", ".env.local"], { windowsHide: true });
let checked = 0;
async function inspect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error("Link inesperado em bundle.");
    if (entry.name.startsWith(".env")) throw new Error("Arquivo de ambiente no bundle.");
    if (entry.isDirectory()) await inspect(file);
    else if (entry.isFile()) {
      checked++;
      if ((await readFile(file)).includes(Buffer.from(key))) throw new Error("Credencial encontrada no bundle; remova antes de distribuir.");
    }
  }
}
for (const directory of ["dist/desktop", "dist/ui", "dist/render"]) await inspect(directory);
const builder = await readFile("electron-builder.yml", "utf8");
if (!builder.includes('"!**/.env*"')) throw new Error("Exclusão de ambiente ausente no empacotamento.");
console.log(JSON.stringify({ envLocalIgnored: true, envLocalTracked: false, bundleFilesChecked: checked, credentialMatches: 0, packagingExclusionPresent: true }));
