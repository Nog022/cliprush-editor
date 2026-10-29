import { bundle } from "@remotion/bundler";
import { getCompositions, openBrowser, renderStill } from "@remotion/renderer";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";

// Static checks only. Never export a video to review this narrated variant.
const dir = path.resolve("out/video-002/narrado-review");
await mkdir(dir, { recursive: true });
const serveUrl = await bundle({
  entryPoint: path.resolve("src/index.ts"),
  outDir: path.join(dir, "bundle"),
});
const browser = await openBrowser("chrome", {
  browserExecutable: "C:/Program Files/Google/Chrome/Application/chrome.exe",
});
const errors = [];
const onBrowserLog = (log) => {
  if (log.type === "error") errors.push(log.text);
};
const digest = (buffer) => createHash("sha256").update(buffer).digest("hex");
try {
  const compositions = await getCompositions(serveUrl, {
    puppeteerInstance: browser,
    onBrowserLog,
  });
  const narration = compositions.find(
    ({ id }) => id === "ClipRushAI002Narrado",
  );
  if (
    !narration ||
    narration.width !== 1080 ||
    narration.height !== 1920 ||
    narration.fps !== 30
  )
    throw new Error("Formato narrado inválido");
  if (narration.durationInFrames !== 731)
    throw new Error(
      `O áudio atual mede ${narration.durationInFrames} frames; revisar os cues.`,
    );
  for (const [id, duration] of [
    ["MyComp", 60],
    ["ClipRushVideo001", 1317],
    ["ClipRushAI002", 900],
  ]) {
    if (
      !compositions.some(
        (composition) =>
          composition.id === id && composition.durationInFrames === duration,
      )
    )
      throw new Error(`Composição anterior alterada: ${id}`);
  }
  const frames = [
    0, 36, 108, 195, 246, 287, 342, 355, 374, 378, 442, 486, 528, 651, 670, 714, 730,
  ];
  for (const frame of frames) {
    await renderStill({
      serveUrl,
      composition: narration,
      frame,
      puppeteerInstance: browser,
      output: path.join(dir, `frame-${String(frame).padStart(4, "0")}.png`),
      scale: 0.5,
      overwrite: true,
      onBrowserLog,
    });
    console.log(`Narrado ${frame}/${narration.durationInFrames - 1} OK`);
  }
  await renderStill({
    serveUrl,
    composition: compositions.find(({ id }) => id === "ClipRushAI002"),
    frame: 650,
    puppeteerInstance: browser,
    output: path.join(dir, "original-650.png"),
    scale: 0.5,
    overwrite: true,
    onBrowserLog,
  });
  const baseline = JSON.parse(
    (await readFile(path.join(dir, "preserved-before.json"), "utf8")).replace(
      /^\uFEFF/,
      "",
    ),
  );
  for (const entry of baseline) {
    if (digest(await readFile(entry.Path)).toUpperCase() !== entry.Hash)
      throw new Error(`Original alterado: ${entry.Path}`);
  }
  const cues = JSON.parse(
    await readFile("public/videos/video-002/audio-cues-narrado.json", "utf8"),
  );
  const oldCues = JSON.parse(
    await readFile("public/videos/video-002/audio-cues.json", "utf8"),
  );
  for (const [index, cue] of cues.events.entries()) {
    if (
      !oldCues.events.some(
        (old) => old.event === cue.event && old.frame === cue.sourceFrame,
      )
    )
      throw new Error(`Cue sem referência original: ${cue.event}`);
    if (index && cue.seconds <= cues.events[index - 1].seconds)
      throw new Error("Cues fora de ordem");
  }
  if (errors.length) throw new Error(errors.join("\n"));
  await writeFile(
    path.join(dir, "report.json"),
    JSON.stringify(
      {
        compositions: compositions.map(
          ({ id, width, height, fps, durationInFrames }) => ({
            id,
            width,
            height,
            fps,
            durationInFrames,
          }),
        ),
        frames,
        audioPath: "videos/video-002/narracao.mp3",
        audioSpeed: 1,
        originalFilesPreserved: baseline.length,
        matchedSourceCues: cues.events.length,
        browserErrors: errors,
        mp4Rendered: false,
      },
      null,
      2,
    ),
  );
  console.log(
    `OK: ${baseline.length} originais preservados; áudio local sem alteração de velocidade.`,
  );
} finally {
  await browser.close({ silent: true });
}
