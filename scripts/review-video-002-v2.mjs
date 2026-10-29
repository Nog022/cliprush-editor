// Full composition stills + a canvas-only regression test, never MP4 export.
import { bundle } from "@remotion/bundler";
import { getCompositions, openBrowser, renderStill } from "@remotion/renderer";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const dir = path.resolve("out/video-002/v2-review");
await mkdir(dir, { recursive: true });
const serveUrl = await bundle({
  entryPoint: path.resolve("src/index.ts"),
  outDir: path.join(dir, "bundle"),
});
const auditUrl = await bundle({
  entryPoint: path.resolve("scripts/fixtures/video-002-v2-audit.jsx"),
  outDir: path.join(dir, "audit-bundle"),
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
  for (const [id, frames] of [
    ["MyComp", 60],
    ["ClipRushVideo001", 1317],
    ["ClipRushAI002", 900],
    ["ClipRushAI002Narrado", 731],
    ["ClipRushAI002NarradoV2", 731],
  ]) {
    if (
      !compositions.some(
        (composition) =>
          composition.id === id && composition.durationInFrames === frames,
      )
    )
      throw new Error(`Registro ou duração inesperados: ${id}`);
  }
  const composition = compositions.find(
    ({ id }) => id === "ClipRushAI002NarradoV2",
  );
  if (
    composition.width !== 1080 ||
    composition.height !== 1920 ||
    composition.fps !== 30
  )
    throw new Error("Formato V2 incorreto");
  const reviewFrames = [
    0, 8, 36, 120, 158, 195, 245, 280, 287, 310, 340, 360, 374, 400, 450, 486,
    530, 550, 560, 600, 630, 651, 670, 690, 710, 720, 729, 730,
  ];
  for (const frame of reviewFrames) {
    await renderStill({
      serveUrl,
      composition,
      frame,
      puppeteerInstance: browser,
      scale: 0.5,
      output: path.join(dir, `frame-${String(frame).padStart(4, "0")}.png`),
      overwrite: true,
      onBrowserLog,
    });
    console.log(`V2 frame ${frame}/730 OK`);
  }
  const audits = await getCompositions(auditUrl, {
    puppeteerInstance: browser,
    onBrowserLog,
  });
  const legacy = audits.find(({ id }) => id === "LegacyWorldAudit");
  const v2 = audits.find(({ id }) => id === "V2WorldAudit");
  const oldHashes = [];
  for (const frame of [600, 650, 710]) {
    const result = await renderStill({
      serveUrl: auditUrl,
      composition: legacy,
      frame,
      puppeteerInstance: browser,
      scale: 0.125,
      onBrowserLog,
    });
    oldHashes.push(digest(result.buffer));
  }
  const legacyFreezeReproduced = new Set(oldHashes).size === 1;
  if (!legacyFreezeReproduced)
    throw new Error(
      "O travamento antigo não foi reproduzido; reavaliar o diagnóstico",
    );
  // Compare the world, excluding titles: changing words cannot mask a frozen scene.
  const tailHashes = [];
  for (let frame = 540; frame <= 730; frame++) {
    const result = await renderStill({
      serveUrl: auditUrl,
      composition: v2,
      frame,
      puppeteerInstance: browser,
      scale: 0.125,
      onBrowserLog,
    });
    const hash = digest(result.buffer);
    if (tailHashes.length && hash === tailHashes[tailHashes.length - 1].hash)
      throw new Error(
        `Mundo V2 repetiu pixels nos frames ${frame - 1} e ${frame}`,
      );
    tailHashes.push({ frame, hash });
    if (frame % 30 === 0)
      console.log(`Antitravamento: mundo avança no frame ${frame}`);
  }
  const repeatA = await renderStill({
    serveUrl: auditUrl,
    composition: v2,
    frame: 670,
    puppeteerInstance: browser,
    scale: 0.125,
    onBrowserLog,
  });
  const repeatB = await renderStill({
    serveUrl: auditUrl,
    composition: v2,
    frame: 670,
    puppeteerInstance: browser,
    scale: 0.125,
    onBrowserLog,
  });
  if (digest(repeatA.buffer) !== digest(repeatB.buffer))
    throw new Error("V2 não determinística após seek fora de ordem");
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
        reviewFrames,
        legacyFreezeReproduced,
        legacyFrames: [600, 650, 710],
        consecutiveTailFrames: tailHashes.length,
        tailRange: [540, 730],
        consecutiveDuplicates: 0,
        deterministicAfterSeeking: true,
        preservedFiles: baseline.length,
        audioPath: "videos/video-002/narracao.mp3",
        audioSpeed: 1,
        browserErrors: errors,
        mp4Rendered: false,
      },
      null,
      2,
    ),
  );
  await writeFile(
    path.join(dir, "tail-hashes.json"),
    JSON.stringify(tailHashes, null, 2),
  );
  console.log(
    `V2 OK: ${tailHashes.length} frames finais consecutivos sem repetição; ${baseline.length} arquivos anteriores intactos.`,
  );
} finally {
  await browser.close({ silent: true });
}
