// Local, offline static review. Never calls renderMedia or exports MP4.
import { bundle } from "@remotion/bundler";
import { getCompositions, openBrowser, renderStill } from "@remotion/renderer";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const directory = path.resolve("out/video-002/review");
await mkdir(directory, { recursive: true });
const serveUrl = await bundle({
  entryPoint: path.resolve("src/index.ts"),
  outDir: path.join(directory, "bundle"),
});
const browser = await openBrowser("chrome", {
  browserExecutable: "C:/Program Files/Google/Chrome/Application/chrome.exe",
});
const errors = [];
const browserLog = (log) => {
  if (log.type === "error") errors.push(log.text);
};
const digest = (data) => createHash("sha256").update(data).digest("hex");
try {
  const compositions = await getCompositions(serveUrl, {
    puppeteerInstance: browser,
    onBrowserLog: browserLog,
  });
  const expected = {
    MyComp: [1280, 720, 30, 60],
    ClipRushVideo001: [1080, 1920, 30, 1317],
    ClipRushAI002: [1080, 1920, 30, 900],
  };
  for (const [id, metadata] of Object.entries(expected)) {
    const composition = compositions.find((entry) => entry.id === id);
    if (
      !composition ||
      JSON.stringify([
        composition.width,
        composition.height,
        composition.fps,
        composition.durationInFrames,
      ]) !== JSON.stringify(metadata)
    )
      throw new Error(`Metadados inesperados: ${id}`);
  }
  const composition = compositions.find(({ id }) => id === "ClipRushAI002");
  const frames = process.argv.slice(2).length
    ? process.argv.slice(2).map(Number)
    : [
        0, 45, 89, 90, 150, 185, 240, 269, 270, 312, 350, 390, 450, 479, 480,
        540, 650, 719, 720, 750, 820, 870, 899,
      ];
  for (const frame of frames) {
    if (!Number.isInteger(frame) || frame < 0 || frame >= 900)
      throw new Error(`Frame inválido: ${frame}`);
    await renderStill({
      serveUrl,
      composition,
      frame,
      puppeteerInstance: browser,
      scale: 0.5,
      imageFormat: "png",
      output: path.join(
        directory,
        `frame-${String(frame).padStart(4, "0")}.png`,
      ),
      overwrite: true,
      onBrowserLog: browserLog,
    });
    console.log(`Frame ${frame}/899 OK`);
  }
  // Seek out of order and verify exact repeatability of a transformation frame.
  const reference = await renderStill({
    serveUrl,
    composition,
    frame: 350,
    puppeteerInstance: browser,
    scale: 0.5,
    imageFormat: "png",
    onBrowserLog: browserLog,
  });
  const repeated = await renderStill({
    serveUrl,
    composition,
    frame: 350,
    puppeteerInstance: browser,
    scale: 0.5,
    imageFormat: "png",
    onBrowserLog: browserLog,
  });
  if (
    !reference.buffer ||
    !repeated.buffer ||
    digest(reference.buffer) !== digest(repeated.buffer)
  )
    throw new Error("O frame 350 não foi determinístico");
  // Render one frame of each prior production to catch registration regressions.
  for (const id of ["MyComp", "ClipRushVideo001"]) {
    await renderStill({
      serveUrl,
      composition: compositions.find((entry) => entry.id === id),
      frame: id === "MyComp" ? 0 : 80,
      puppeteerInstance: browser,
      scale: 0.25,
      output: path.join(directory, `preserved-${id}.png`),
      overwrite: true,
      onBrowserLog: browserLog,
    });
  }
  const saved = JSON.parse(
    (
      await readFile(path.join(directory, "preserved-before.json"), "utf8")
    ).replace(/^\uFEFF/, ""),
  );
  for (const entry of saved) {
    if (digest(await readFile(entry.Path)).toUpperCase() !== entry.Hash)
      throw new Error(`Original alterado: ${entry.Path}`);
  }
  if (errors.length)
    throw new Error(`Erros no navegador: ${errors.join("\n")}`);
  let loopFramesMatch = null;
  if (frames.includes(0) && frames.includes(899)) {
    loopFramesMatch =
      digest(await readFile(path.join(directory, "frame-0000.png"))) ===
      digest(await readFile(path.join(directory, "frame-0899.png")));
    if (!loopFramesMatch)
      throw new Error("O loop não retornou ao primeiro frame");
  }
  const report = {
    frames,
    compositions: compositions.map(
      ({ id, width, height, fps, durationInFrames, defaultCodec }) => ({
        id,
        width,
        height,
        fps,
        durationInFrames,
        defaultCodec,
      }),
    ),
    browserErrors: errors,
    deterministicFrame350: true,
    loopFramesMatch,
    preservedFiles: saved.length,
    audioCues: composition.props.audioCues,
    finalMp4Rendered: false,
  };
  await writeFile(
    path.join(directory, "report.json"),
    JSON.stringify(report, null, 2),
  );
  console.log(
    `Revisão OK: ${saved.length} originais preservados; nenhum MP4 gerado.`,
  );
} finally {
  await browser.close({ silent: true });
}
