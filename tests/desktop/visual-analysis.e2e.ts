import { test, expect, _electron as electron } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, readdir, writeFile, utimes } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

test("local selected segment analysis, IPC, VAD, cache and unchanged montage", async () => {
  const directory = await mkdtemp(path.resolve("out/visual-e2e-"));
  const fixtures = path.join(directory, "fixtures");
  await mkdir(fixtures);
  const ffmpeg = execFileSync(path.resolve(".venv-indexacao/Scripts/python.exe"),
    ["-c", "import shutil; print(shutil.which('ffmpeg'))"], { encoding: "utf8", windowsHide: true }).trim();
  const source = path.join(fixtures, "synthetic.mp4");
  execFileSync(ffmpeg, ["-v", "error", "-f", "lavfi", "-i", "testsrc2=size=320x180:rate=2:duration=50",
    "-f", "lavfi", "-i", "anullsrc=r=16000:cl=mono", "-t", "50", "-c:v", "libx264", "-preset", "ultrafast",
    "-c:a", "aac", source], { windowsHide: true });
  const speech = path.join(fixtures, "speech.mp4");
  execFileSync(ffmpeg, ["-v", "error", "-f", "lavfi", "-i", "color=blue:size=320x180:rate=2",
    "-i", path.resolve("public/videos/video-023/audio/narracao.mp3"), "-t", "6", "-c:v", "libx264", "-preset", "ultrafast",
    "-c:a", "aac", speech], { windowsHide: true });
  const env: Record<string, string | undefined> = { ...process.env, CLIPRUSH_DATA_HOME: directory };
  delete env.ELECTRON_RUN_AS_NODE;
  const app = await electron.launch({ args: ["."], executablePath: process.env.CLIPRUSH_TEST_ELECTRON, env: Object.fromEntries(
    Object.entries(env).filter((entry): entry is [string, string] => entry[1] !== undefined),
  ) });
  try {
    const page = await app.firstWindow();
    const errors: string[] = [];
    page.on("pageerror", e => errors.push(e.message));
    await page.waitForFunction(() => !!window.cliprush);
    let project = await page.evaluate(() => window.cliprush.createProject({
      name: "Análise local fixture", channelId: "cliprush", language: "pt-BR", category: "Games",
      width: 320, height: 180, fps: 30, durationInFrames: 1200,
    }));
    await app.evaluate(({ dialog }, files) => {
      dialog.showOpenDialog = async () => ({ canceled: false, filePaths: files });
    }, [source, speech]);
    project = (await page.evaluate(id => window.cliprush.importMedia(id, "reference"), project.id))!.project;
    const clip = { id: randomUUID(), assetId: project.assets.find(a => a.name === "synthetic.mp4")!.id,
      from: 0, durationInFrames: 1200, trimBefore: 150, volume: 1 };
    project = await page.evaluate(p => window.cliprush.saveProject(p), { ...project, clips: [clip] });
    const firstStart = Date.now();
    const [first, concurrent] = await page.evaluate(async ({ id, clipId }) => Promise.all([
      window.cliprush.analyzeClip(id, clipId), window.cliprush.analyzeClip(id, clipId),
    ]), { id: project.id, clipId: clip.id });
    const wallMs = Date.now() - firstStart;
    expect(concurrent).toEqual(first);
    expect(first.startMs).toBe(5000);
    expect(first.endMs).toBe(45000);
    expect(first.sampledAtMs).toHaveLength(16);
    expect(first.sampledAtMs.every(t => t >= 5000 && t < 45000)).toBe(true);
    expect(first.webcam.status).toBe("not_detected");
    expect(first.speech.status).toBe("not_detected");
    expect(first.speech.speakerMatched).toBe(false);
    const cacheStart = Date.now();
    const hit = await page.evaluate(({ id, clipId }) => window.cliprush.analyzeClip(id, clipId), { id: project.id, clipId: clip.id });
    const cacheMs = Date.now() - cacheStart;
    expect(hit).toEqual(first);
    const workspaceDirectory = (await page.evaluate(() => window.cliprush.workspace())).dataDirectory;
    const cacheDirectory = path.join(workspaceDirectory, "production/visual-analysis");
    const cacheFiles = (await readdir(cacheDirectory)).filter(name => name.endsWith(".json") && !name.endsWith(".manual.json"));
    expect(cacheFiles).toHaveLength(1);
    const cacheFile = path.join(cacheDirectory, cacheFiles[0]);
    const corrupted = JSON.parse(await readFile(cacheFile, "utf8"));
    corrupted.webcam.regions = [{ x: 0.9, y: 0, width: 0.5, height: 0.5 }];
    await writeFile(cacheFile, JSON.stringify(corrupted));
    const repaired = await page.evaluate(({ id, clipId }) => window.cliprush.analyzeClip(id, clipId), { id: project.id, clipId: clip.id });
    expect(repaired.webcam.regions).toEqual([]);
    await utimes(source, new Date(), new Date());
    await page.evaluate(({ id, clipId }) => window.cliprush.analyzeClip(id, clipId), { id: project.id, clipId: clip.id });
    expect((await readdir(cacheDirectory)).filter(name => name.endsWith(".json") && !name.endsWith(".manual.json"))).toHaveLength(2);
    const after = (await page.evaluate(() => window.cliprush.workspace())).projects.find(p => p.id === project.id)!;
    expect(after).toEqual(project);
    await expect(page.evaluate(({ id, clipId }) => window.cliprush.analyzeClip(id, clipId, { maxSamples: 0 }),
      { id: project.id, clipId: clip.id })).rejects.toThrow(/limites/);
    const speechClip = { ...clip, id: randomUUID(), trimBefore: 0, durationInFrames: 180,
      assetId: project.assets.find(a => a.name === "speech.mp4")!.id };
    project = await page.evaluate(p => window.cliprush.saveProject(p), { ...project, clips: [speechClip] });
    const speaking = await page.evaluate(({ id, clipId }) => window.cliprush.analyzeClip(id, clipId), { id: project.id, clipId: speechClip.id });
    expect(speaking.speech.status).toBe("detected");
    expect(speaking.person.status).toBe("not_detected");
    expect(speaking.speech.speakerMatched).toBe(false);
    expect(speaking.speech.intervals.every(i => i.startMs >= 0 && i.endMs <= 6000)).toBe(true);
    await page.reload();
    await page.getByRole("button", { name: "Abrir Análise local fixture", exact: true }).click();
    await page.getByRole("button", { name: "Analisar trecho", exact: true }).click();
    await expect(page.getByText(/Rostos 0 · Webcam não identificado · Fala detectado/)).toBeVisible();
    await page.locator("details").filter({ hasText: "Rostos 0" }).locator("summary").click();
    for (const [key, value] of Object.entries({ x: .7, y: .02, width: .28, height: .3 })) {
      await page.getByRole("spinbutton", { name: `Webcam ${key}`, exact: true }).fill(String(value));
    }
    await expect(page.getByLabel("Região de webcam no preview")).toBeVisible();
    await page.getByRole("button", { name: "Salvar região manual", exact: true }).click();
    await expect(page.getByText(/Webcam ajustada manualmente/)).toBeVisible();
    const adjusted = await page.evaluate(({ id, clipId }) => window.cliprush.analyzeClip(id, clipId),
      { id: project.id, clipId: speechClip.id });
    expect(adjusted.webcam.origin).toBe("manual");
    expect(adjusted.webcam.regions[0]).toEqual({ x: .7, y: .02, width: .28, height: .3 });
    await page.getByRole("button", { name: "Restaurar detecção automática", exact: true }).click();
    await expect(page.getByText(/Webcam automática/)).toBeVisible();
    expect(errors).toEqual([]);
    console.log(JSON.stringify({ analysisMs: first.elapsedMs, wallMs, cacheMs, sampledFrames: first.sampledAtMs.length,
      speechIntervals: speaking.speech.intervals.length, testData: directory }));
  } finally { await app.close(); }
});
