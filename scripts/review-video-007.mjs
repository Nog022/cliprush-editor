import { bundle } from "@remotion/bundler";
import {
  getCompositions,
  openBrowser,
  renderStill,
  renderMedia,
} from "@remotion/renderer";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
const render = process.argv.includes("--render");
const dir = path.resolve("out/video-007");
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
try {
  const all = await getCompositions(serveUrl, {
    puppeteerInstance: browser,
    onBrowserLog,
  });
  const composition = all.find((c) => c.id === "ClipRushVideo007");
  if (!composition || composition.durationInFrames !== 1192)
    throw Error("Invalid composition");
  for (const item of JSON.parse(
    await readFile("out/video-007/preserved.json", "utf8"),
  ))
    if (
      createHash("sha256")
        .update(await readFile(item.file))
        .digest("hex") !== item.sha256
    )
      throw Error("Original modified " + item.file);
  for (const item of JSON.parse(
    await readFile("src/videos/video-007/inventory.json", "utf8"),
  ))
    if (
      createHash("sha256")
        .update(await readFile(path.join("public", item.file)))
        .digest("hex") !== item.sha256
    )
      throw Error("Asset modified " + item.file);
  if (render) {
    const dest = path.resolve("out/ClipRushVideo007.mp4");
    if (
      await access(dest).then(
        () => true,
        () => false,
      )
    )
      throw Error("Destination exists");
    let prev = -1;
    await renderMedia({
      serveUrl,
      composition,
      outputLocation: dest,
      codec: "h264",
      pixelFormat: "yuv420p",
      audioCodec: "aac",
      audioBitrate: "192k",
      crf: 18,
      x264Preset: "fast",
      imageFormat: "jpeg",
      jpegQuality: 95,
      concurrency: 2,
      puppeteerInstance: browser,
      overwrite: false,
      onBrowserLog,
      onProgress: (p) => {
        let n = Math.floor(p.progress * 20) * 5;
        if (n !== prev) {
          prev = n;
          console.log(`Render ${n}% ${p.renderedFrames}/1192`);
        }
      },
    });
  } else {
    for (const frame of [
      0, 30, 75, 160, 235, 300, 370, 435, 500, 575, 620, 655, 700, 755, 815,
      880, 930, 960, 995, 1060, 1150, 1191,
    ]) {
      await renderStill({
        serveUrl,
        composition,
        frame,
        output: path.join(dir, `frame-${String(frame).padStart(4, "0")}.jpg`),
        imageFormat: "jpeg",
        scale: 0.5,
        puppeteerInstance: browser,
        onBrowserLog,
      });
      console.log(`Frame ${frame}`);
    }
    const page = await browser.newPage({
      context: () => null,
      logLevel: "error",
      indent: false,
      pageIndex: 0,
      onBrowserLog,
      onLog: () => {},
    });
    await page.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 1 });
    await page.evaluateOnNewDocument(() => {
      window.__reviewTools = {};
      Object.defineProperty(document, "modelContext", {
        configurable: true,
        value: {
          registerTool(t) {
            window.__reviewTools[t.name] = t;
            return Promise.resolve();
          },
        },
      });
    });
    await page.goto({
      url: "http://localhost:3000/ClipRushVideo007",
      timeout: 30000,
    });
    for (let i = 0; i < 100; i++) {
      if (
        await page.evaluate(() => Boolean(window.__reviewTools?.seek_to_frame))
      )
        break;
      await new Promise((r) => setTimeout(r, 200));
    }
    const samples = [];
    for (let frame = 0; frame < 1192; frame += 15) {
      await page.evaluate(
        (f) => window.__reviewTools.seek_to_frame.execute({ frame: f }),
        frame,
      );
      await page.evaluate(
        () =>
          new Promise((r) =>
            requestAnimationFrame(() => requestAnimationFrame(r)),
          ),
      );
      const data = await page.evaluate(() =>
        [...document.querySelectorAll("[data-safe]")]
          .filter((e) =>
            e.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }),
          )
          .map((e) => ({
            type: e.dataset.safe,
            text: e.textContent,
            width: e.scrollWidth,
            client: e.clientWidth,
            height: e.scrollHeight,
          })),
      );
      if (
        data.some(
          (d) =>
            d.width > d.client + 2 || (d.type === "caption" && d.height > 150),
        )
      )
        throw Error("Text overflow " + frame + " " + JSON.stringify(data));
      samples.push({ frame, data });
    }
    await writeFile(
      path.join(dir, "studio-audit.json"),
      JSON.stringify(samples, null, 2),
    );
    const shot = await page
      ._client()
      .send("Page.captureScreenshot", {
        format: "png",
        captureBeyondViewport: false,
      });
    await writeFile(
      path.join(dir, "studio.png"),
      Buffer.from(shot.value.data, "base64"),
    );
  }
  await writeFile(
    path.join(dir, render ? "render-report.json" : "review-report.json"),
    JSON.stringify(
      {
        composition,
        allCompositions: all.map((c) => ({
          id: c.id,
          frames: c.durationInFrames,
        })),
        errors,
      },
      null,
      2,
    ),
  );
  if (errors.length) throw Error(errors.join("\n"));
} finally {
  await browser.close({ silent: true });
}
