import { test, expect, _electron as electron } from "@playwright/test";
import { mkdtemp, writeFile } from "node:fs/promises";
import path from "node:path";

test("diagnostic MP4 picture and audio signal in Electron", async () => {
  test.skip(!process.env.CLIPRUSH_DIAGNOSTIC_MP4, "Explicit diagnostic artifact required");
  const directory = await mkdtemp(path.resolve("out/diagnostic-player-"));
  const env: NodeJS.ProcessEnv = { ...process.env, CLIPRUSH_DATA_HOME: directory };
  delete env.ELECTRON_RUN_AS_NODE;
  const app = await electron.launch({ args: ["."], executablePath: process.env.CLIPRUSH_TEST_ELECTRON,
    env: Object.fromEntries(Object.entries(env).filter((e): e is [string, string] => e[1] !== undefined)) });
  try {
    const page = await app.firstWindow();
    await page.waitForFunction(() => !!window.cliprush);
    let project = await page.evaluate(() => window.cliprush.createProject({ name: "Diagnóstico corrigido",
      channelId: "cliprush", category: "Games", language: "pt-BR", width: 1920, height: 1080, fps: 60, durationInFrames: 2100 }));
    const files = [path.resolve(process.env.CLIPRUSH_DIAGNOSTIC_MP4!)];
    if (process.env.CLIPRUSH_PREVIOUS_DIAGNOSTIC) files.push(path.resolve(process.env.CLIPRUSH_PREVIOUS_DIAGNOSTIC));
    await app.evaluate(({ dialog }, files) => {
      dialog.showOpenDialog = async () => ({ canceled: false, filePaths: files });
    }, files);
    project = (await page.evaluate(id => window.cliprush.importMedia(id, "reference"), project.id))!.project;
    const results = [];
    for (const asset of project.assets) {
      const measurements = await page.evaluate(async ({ id, assetId }) => {
        const video = document.createElement("video");
        video.controls = true;
        video.style.width = "960px";
        video.src = `cliprush://app/media/${id}/${assetId}`;
        document.body.append(video);
        const context = new AudioContext();
        const source = context.createMediaElementSource(video);
        const analyser = context.createAnalyser();
        analyser.fftSize = 2048;
        source.connect(analyser);
        analyser.connect(context.destination);
        await context.resume();
        await new Promise<void>((resolve, reject) => {
          video.onloadedmetadata = () => resolve();
          video.onerror = () => reject(new Error(`Media error ${video.error?.code} ${video.error?.message}`));
          setTimeout(() => reject(new Error("Media metadata timeout")), 15000);
        });
        const windows = [];
        for (const at of [0, 17, 32]) {
          if (at) {
            await new Promise<void>(resolve => { video.onseeked = () => resolve(); video.currentTime = at; });
          }
          await video.play();
          let peakRms = 0;
          const buffer = new Float32Array(analyser.fftSize);
          for (let n = 0; n < 15; n++) {
            await new Promise(resolve => setTimeout(resolve, 100));
            analyser.getFloatTimeDomainData(buffer);
            peakRms = Math.max(peakRms, Math.sqrt(buffer.reduce((sum, x) => sum + x*x, 0) / buffer.length));
          }
          video.pause();
          windows.push({ at, playedTo: video.currentTime, peakRms,
            decodedFrames: video.getVideoPlaybackQuality().totalVideoFrames });
        }
        const result = { windows, muted: video.muted, volume: video.volume, audioContext: context.state,
          opusSupport: video.canPlayType('video/mp4; codecs="avc1.640028,opus"'),
          aacSupport: video.canPlayType('video/mp4; codecs="avc1.640028,mp4a.40.2"') };
        await context.close();
        video.remove();
        return result;
      }, { id: project.id, assetId: asset.id });
      results.push({ name: asset.name, ...measurements });
      if (asset.name === path.basename(files[0])) {
        expect(measurements.muted).toBe(false);
        expect(measurements.volume).toBe(1);
        for (const w of measurements.windows) {
          expect(w.playedTo).toBeGreaterThan(w.at + .5);
          expect(w.peakRms).toBeGreaterThan(.001);
          expect(w.decodedFrames).toBeGreaterThan(0);
        }
      }
    }
    await writeFile(path.resolve("out/fase2-corrigida/player-validation.json"), JSON.stringify(results, null, 2));
    console.log(JSON.stringify({ directory, results }));
  } finally { await app.close(); }
});
