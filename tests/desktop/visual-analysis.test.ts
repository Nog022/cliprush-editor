import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, readdir, stat, utimes, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { analyzeClip, analysisBounds } from "../../desktop/visual-analysis";
import { validRegion, visualAnalysis } from "../../shared/visual-analysis";
import { Store } from "../../desktop/store";

test("bounded local worker, speech-only media, cache recovery and source invalidation", async () => {
  const directory = await mkdtemp(path.resolve("out/visual-service-"));
  const ffmpeg = execFileSync(path.resolve(".venv-indexacao/Scripts/python.exe"),
    ["-c", "import shutil; print(shutil.which('ffmpeg'))"], { encoding: "utf8", windowsHide: true }).trim();
  const source = path.join(directory, "synthetic.mp4");
  // Speech exists only before the requested interval. The selected 40 seconds are silent.
  execFileSync(ffmpeg, ["-v", "error", "-f", "lavfi", "-i", "testsrc2=size=320x180:rate=2:duration=50",
    "-i", path.resolve("public/videos/video-023/audio/narracao.mp3"), "-af", "atrim=duration=4,apad",
    "-t", "50", "-c:v", "libx264", "-preset", "ultrafast", "-c:a", "aac", source], { windowsHide: true });
  const store = new Store(directory);
  try {
    const base = store.create({ name: "Análise", channelId: "cliprush", category: "Games", language: "pt-BR",
      width: 320, height: 180, fps: 30, durationInFrames: 1200 });
    const asset = { id: randomUUID(), name: "synthetic.mp4", kind: "video" as const, mode: "reference" as const,
      path: source, hash: "synthetic", bytes: (await stat(source)).size, duration: 50 };
    const clip = { id: randomUUID(), assetId: asset.id, from: 0, trimBefore: 150, durationInFrames: 1200, volume: 1 };
    const project = { ...base, assets: [asset], clips: [clip] };
    const before = JSON.stringify(project);
    const started = Date.now();
    const [result, concurrent] = await Promise.all([
      analyzeClip(store, process.cwd(), project, clip.id), analyzeClip(store, process.cwd(), project, clip.id),
    ]);
    const wallMs = Date.now() - started;
    assert.deepEqual(result, concurrent);
    assert.equal(result.startMs, 5000);
    assert.equal(result.endMs, 45000);
    assert.equal(result.sampledAtMs.length, 16);
    assert.equal(result.webcam.status, "not_detected");
    assert.equal(result.speech.status, "not_detected");
    assert.equal(result.speech.speakerMatched, false);
    const hitStarted = Date.now();
    assert.deepEqual(await analyzeClip(store, process.cwd(), project, clip.id), result);
    const cacheMs = Date.now() - hitStarted;
    const manualRegion = { x: .7, y: .02, width: .28, height: .3 };
    const manual = await analyzeClip(store, process.cwd(), project, clip.id, { manualWebcamRegion: manualRegion });
    assert.equal(manual.webcam.origin, "manual");
    assert.deepEqual(manual.webcam.regions, [manualRegion]);
    assert.deepEqual((await analyzeClip(store, process.cwd(), project, clip.id)).webcam, manual.webcam);
    assert.deepEqual(await analyzeClip(store, process.cwd(), project, clip.id, { manualWebcamRegion: null }), result);
    await assert.rejects(() => analyzeClip(store, process.cwd(), project, clip.id,
      { manualWebcamRegion: { x: .9, y: 0, width: .5, height: .5 } }), /manual/);
    const cacheDirectory = path.join(directory, "production/visual-analysis");
    const filenames = (await readdir(cacheDirectory)).filter(name => name.endsWith(".json") && !name.endsWith(".manual.json"));
    assert.equal(filenames.length, 1);
    const filename = path.join(cacheDirectory, filenames[0]);
    const corrupt = JSON.parse(await readFile(filename, "utf8"));
    corrupt.webcam.regions = [{ x: 0.9, y: 0, width: 0.5, height: 0.5 }];
    assert.throws(() => visualAnalysis(corrupt));
    await writeFile(filename, JSON.stringify(corrupt));
    const repaired = await analyzeClip(store, process.cwd(), project, clip.id);
    assert.deepEqual(repaired.webcam.regions, []);
    await utimes(source, new Date(), new Date());
    await analyzeClip(store, process.cwd(), project, clip.id);
    assert.equal(((await readdir(cacheDirectory)).filter(name => name.endsWith(".json") && !name.endsWith(".manual.json"))).length, 2);
    assert.equal(JSON.stringify(project), before);
    assert.throws(() => analysisBounds(project, clip, { maxSamples: 0 }));
    assert.throws(() => analysisBounds(project, clip, { timeoutMs: NaN }));
    assert.throws(() => analysisBounds(project, { ...clip, durationInFrames: 120000 }));
    assert.equal(validRegion({ x: 0, y: 0, width: 1, height: 1 }), true);
    assert.equal(validRegion({ x: 0.9, y: 0, width: 0.5, height: 0.5 }), false);
    const voice = await analyzeClip(store, process.cwd(), { ...project,
      clips: [{ ...clip, trimBefore: 0, durationInFrames: 120 }] }, clip.id);
    assert.equal(voice.speech.status, "detected");
    assert.equal(voice.speech.speakerMatched, false);
    assert.ok(voice.speech.intervals.every(i => i.startMs >= 0 && i.endMs <= 4000));
    await assert.rejects(() => analyzeClip(store, process.cwd(), { ...project,
      assets: [{ ...asset, duration: undefined }], clips: [{ ...clip, trimBefore: 1485 }] }, clip.id), /duration|Detector local/);
    console.log(JSON.stringify({ analysisMs: result.elapsedMs, wallMs, cacheMs, frames: result.sampledAtMs.length,
      speechIntervals: voice.speech.intervals.length, testData: directory }));
  } finally { store.close(); }
});
