import { test, expect, _electron as electron } from "@playwright/test";
import { mkdtemp, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";

test("CLI forwards to open Electron instance without clicks and reports import errors without credits", async () => {
  const directory = await mkdtemp(path.resolve("out/cli-forward-"));
  const env: NodeJS.ProcessEnv = { ...process.env, CLIPRUSH_DATA_HOME: directory };
  delete env.ELECTRON_RUN_AS_NODE;
  const app = await electron.launch({ args: ["."], executablePath: process.env.CLIPRUSH_TEST_ELECTRON,
    env: Object.fromEntries(Object.entries(env).filter((entry): entry is [string, string] => entry[1] !== undefined)) });
  try {
    const page = await app.firstWindow(); await page.waitForFunction(() => Boolean(window.cliprush));
    const input = path.join(directory, "input.json");
    await writeFile(input, JSON.stringify({ name: "Forwarded CLI fixture", narration: "Teste", instructions: "Editar", media: [path.join(directory, "does-not-exist.mp4")] }));
    const result = await new Promise<{ code: number | null; output: string }>((resolve, reject) => {
      const child = spawn(process.execPath, ["scripts/produce.mjs", "--input", input], { env, windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
      const watchdog = setTimeout(() => child.kill(), 15000);
      let output = ""; child.stdout.on("data", data => { output += String(data); });
      child.on("error", reject); child.on("exit", code => { clearTimeout(watchdog); resolve({ code, output }); });
    });
    expect(result.code).toBe(1);
    const events = result.output.trim().split("\n").map(line => JSON.parse(line));
    expect(events.at(-1).type).toBe("error"); expect(events.at(-1).error).toContain("importar mídia");
    expect((await page.evaluate(() => window.cliprush.workspace())).projects.some(p => p.name === "Forwarded CLI fixture")).toBe(true);
    expect(app.windows()).toHaveLength(1);
  } finally { await app.close(); }
});
