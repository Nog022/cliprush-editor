// Static review frames only: this script never renders video or audio exports.
import { bundle } from "@remotion/bundler";
import { getCompositions, openBrowser, renderStill } from "@remotion/renderer";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const reviewDir = path.resolve("out/video-001/review");
await mkdir(reviewDir, { recursive: true });
const serveUrl = await bundle({
  entryPoint: path.resolve("src/index.ts"),
  outDir: path.join(reviewDir, "bundle"),
});
const browser = await openBrowser("chrome", {
  browserExecutable: "C:/Program Files/Google/Chrome/Application/chrome.exe",
});
try {
  const compositions = await getCompositions(serveUrl, { puppeteerInstance: browser });
  const composition = compositions.find(({ id }) => id === "ClipRushVideo001");
  if (!composition || composition.width !== 1080 || composition.height !== 1920 || composition.fps !== 30 || composition.durationInFrames !== 1317) {
    throw new Error("Unexpected ClipRush composition metadata");
  }
  if (!compositions.some(({ id }) => id === "MyComp")) throw new Error("Original MyComp is missing");
  const frames = [0, 80, 200, 236, 237, 350, 455, 456, 600, 692, 693, 750, 880, 950, 951, 1060, 1170, 1290, 1316];
  for (const frame of frames) {
    await renderStill({ serveUrl, composition, frame, output: path.join(reviewDir, `frame-${String(frame).padStart(4, "0")}.png`), puppeteerInstance: browser, scale: 0.5, overwrite: true });
    console.log(`Reviewed frame ${frame} / 1317`);
  }
  await writeFile(path.join(reviewDir, "metadata.json"), JSON.stringify({ compositions: compositions.map(({ id, width, height, fps, durationInFrames }) => ({ id, width, height, fps, durationInFrames })), frames }, null, 2));
} finally {
  await browser.close({ silent: true });
}
