import { build } from "esbuild";
import { spawn } from "node:child_process";
await build({
  entryPoints: ["tests/desktop/core.test.ts"],
  outfile: "dist/tests/core.test.cjs",
  bundle: true,
  platform: "node",
  format: "cjs",
  target: "node22",
});
const child = spawn(
  process.execPath,
  ["--experimental-sqlite", "--test", "dist/tests/core.test.cjs"],
  { stdio: "inherit", windowsHide: true },
);
child.on("exit", (code) => process.exit(code ?? 1));
