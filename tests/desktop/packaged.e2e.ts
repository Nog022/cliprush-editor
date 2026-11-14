import { test, expect, chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import { mkdir, stat } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";

test("packaged app searches its catalog and exports a real MP4", async () => {
  test.skip(!process.env.CLIPRUSH_PACKAGED_EXE, "Set CLIPRUSH_PACKAGED_EXE to test the packaged application.");
  const directory = path.resolve("out", `packaged-e2e-${randomUUID()}`);
  await mkdir(directory, { recursive: true });
  const env: NodeJS.ProcessEnv = { ...process.env, CLIPRUSH_DATA_HOME: directory };
  delete env.ELECTRON_RUN_AS_NODE;
  const child = spawn(process.env.CLIPRUSH_PACKAGED_EXE!, ["--remote-debugging-port=0"], {
    env, windowsHide: true, stdio: ["ignore", "ignore", "pipe"],
  });
  let browser: Awaited<ReturnType<typeof chromium.connectOverCDP>> | undefined;
  try {
    const endpoint = await new Promise<string>((resolve, reject) => {
      let stderr = "";
      const timer = setTimeout(() => finish(new Error(`Application did not expose DevTools: ${stderr}`)), 45000);
      const finish = (error?: Error, url?: string) => {
        clearTimeout(timer);
        child.stderr.off("data", data);
        child.off("error", failed);
        child.off("exit", exited);
        if (error) reject(error);
        else resolve(url!);
      };
      const data = (chunk: Buffer) => {
        stderr = (stderr + chunk.toString()).slice(-3000);
        const match = /DevTools listening on (ws:\/\/[^\s]+)/.exec(stderr);
        if (match) finish(undefined, match[1]);
      };
      const failed = (error: Error) => finish(error);
      const exited = (code: number | null) => finish(new Error(`Application exited (${code}): ${stderr}`));
      child.stderr.on("data", data);
      child.once("error", failed);
      child.once("exit", exited);
    });
    browser = await chromium.connectOverCDP(endpoint);
    const context = browser.contexts()[0];
    const page = context.pages()[0] ?? await context.waitForEvent("page");
    await page.waitForFunction(() => Boolean(window.cliprush));
    const scenes = await page.evaluate(() => window.cliprush.searchCatalog("praia"));
    expect(scenes.length).toBeGreaterThan(0);
    const job = await page.evaluate(async () => {
      const project = await window.cliprush.createProject({
        name: "Packaged export test", channelId: "cliprush", language: "pt-BR",
        category: "Teste", width: 320, height: 240, fps: 10, durationInFrames: 5,
      });
      const saved = await window.cliprush.saveProject({
        ...project,
        scenes: [{ id: "scene", name: "Test", from: 0, durationInFrames: 5,
          title: "ClipRush", subtitle: "", background: "#101827", accent: "#b5f36b",
          shape: "circle", animation: "fade" }],
      });
      return window.cliprush.startRender(saved.id, {
        ...saved.exportSettings, width: 320, height: 240, fps: 10, audio: false,
      }, "");
    });
    expect(job).toBeTruthy();
    await expect.poll(async () => {
      const jobs = await page.evaluate(() => window.cliprush.listRenders());
      const current = jobs.find(item => item.id === job!.id)!;
      if (current.status === "failed") throw new Error(current.error);
      return current.status;
    }, { timeout: 60000, intervals: [1000] }).toBe("completed");
    expect((await stat(job!.outputPath)).size).toBeGreaterThan(1000);
    console.log(`Packaged MP4 verified: ${job!.outputPath}`);
  } finally {
    await browser?.close();
    child.kill();
  }
});
