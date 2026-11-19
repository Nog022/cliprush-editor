import { test, expect, _electron as electron } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { compileEditorialPlan } from "../../shared/editorial";

test("planned three-cut montage previews and exports with audio in the existing Electron renderer", async () => {
  const directory = path.resolve("out", `editorial-e2e-${randomUUID()}`);
  await mkdir(directory, { recursive: true });
  const video = path.join(directory, "three-colors.mp4"), audio = path.join(directory, "narracao.wav");
  execFileSync("ffmpeg", ["-v", "error", "-f", "lavfi", "-i", "color=red:s=128x128:r=30:d=1", "-f", "lavfi", "-i", "color=green:s=128x128:r=30:d=1", "-f", "lavfi", "-i", "color=blue:s=128x128:r=30:d=1", "-filter_complex", "[0:v][1:v][2:v]concat=n=3:v=1:a=0[v]", "-map", "[v]", video], { windowsHide: true });
  execFileSync("ffmpeg", ["-v", "error", "-f", "lavfi", "-i", "sine=frequency=440:sample_rate=48000", "-t", "0.3", audio], { windowsHide: true });
  const env: Record<string, string> = { ...process.env as Record<string, string>, CLIPRUSH_DATA_HOME: directory, CLIPRUSH_CODEX_BINARY: path.join(directory, "absent.exe") };
  delete env.ELECTRON_RUN_AS_NODE;
  const app = await electron.launch({ args: ["."], env });
  try {
    const page = await app.firstWindow();
    await page.waitForFunction(() => Boolean(window.cliprush));
    await app.evaluate(({ dialog }, files) => {
      dialog.showOpenDialog = async () => ({ canceled: false, filePaths: files });
    }, [audio, video]);
    const project = await page.evaluate(async () => {
      const p = await window.cliprush.createProject({ name: "Editorial fixture", channelId: "cliprush", language: "pt-BR", category: "Test", type: "narrated", width: 128, height: 128, fps: 30, durationInFrames: 9 });
      return (await window.cliprush.importMedia(p.id, "reference"))!.project;
    });
    const voice = project.assets.find(a => a.kind === "audio")!, footage = project.assets.find(a => a.kind === "video")!;
    expect(voice.duration).toBeCloseTo(0.3, 2);
    expect(footage.duration).toBeCloseTo(3, 2);
    const captions = [0, 1, 2].map(i => ({ text: `Bloco ${i}`, startMs: i * 100, endMs: (i + 1) * 100 }));
    project.generation = { prompt: "Três trechos descontínuos, zoom e legendas", autoRender: false, references: [{ name: "timing.json", content: JSON.stringify(captions) }] };
    const candidate = compileEditorialPlan(project, {
      durationInFrames: 9, requirements: { visualClips: 3, discontinuous: true, zoom: true, fade: false, captions: true },
      catalogQueries: [], errors: [], audioClips: [],
      blocks: [0, 1, 2].map(i => ({ from: i * 3, durationInFrames: 3, narrationText: `Bloco ${i}`, evidence: "timing.json: fixture sintética",
        clips: [{ id: `shot-${i}`, assetId: footage.id, from: i * 3, durationInFrames: 3, trimBefore: i * 30, volume: 0, animation: i === 1 ? "zoom" : "none" }], scenes: [], captions: [captions[i]] })),
    });
    const saved = await page.evaluate(p => window.cliprush.saveProject(p), candidate);
    expect(saved.clips.find(c => c.assetId === voice.id)?.durationInFrames).toBe(9);
    expect(saved.clips.filter(c => c.assetId === footage.id).map(c => c.trimBefore)).toEqual([0, 30, 60]);
    expect(saved.clips.some(c => c.animation === "zoom")).toBe(true);
    expect(saved.captions).toHaveLength(3);
    // Exercise the same preview component and real export IPC used by the UI.
    await page.reload();
    await page.getByRole("button", { name: "Abrir Editorial fixture", exact: true }).click();
    await expect(page.getByLabel("Ir para quadro")).toBeVisible();
    await page.getByLabel("Ir para quadro").fill("4");
    await expect(page.getByText(/Falha no preview|Mídia indisponível ou codec incompatível/)).toHaveCount(0);
    const job = await page.evaluate(p => window.cliprush.startRender(p.id, p.exportSettings, "fixture.mp4"), saved);
    expect(job).toBeTruthy();
    await expect.poll(async () => (await page.evaluate(() => window.cliprush.listRenders())).find(r => r.id === job!.id)?.status, { timeout: 60000 }).toBe("completed");
    const output = (await page.evaluate(() => window.cliprush.listRenders())).find(r => r.id === job!.id)!.outputPath;
    const info = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_streams", "-show_format", "-of", "json", output], { windowsHide: true, encoding: "utf8" }));
    expect(info.streams.some((s: { codec_type: string }) => s.codec_type === "audio")).toBe(true);
    expect(Number(info.format.duration)).toBeCloseTo(0.3, 1);
    for (const [frame, channel] of [[0, 0], [3, 1], [6, 2]]) {
      const rgb = execFileSync("ffmpeg", ["-v", "error", "-i", output, "-vf", `select=eq(n\\,${frame}),crop=2:2:62:62,format=rgb24`, "-frames:v", "1", "-f", "rawvideo", "pipe:1"], { windowsHide: true });
      expect(rgb.length).toBe(12);
      expect(rgb[channel]).toBeGreaterThan(90);
      expect(rgb[channel]).toBeGreaterThan(rgb[(channel + 1) % 3] + 60);
    }
  } finally { await app.close(); }
});
