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

const final = process.argv.includes("--render");
const preview = process.argv.includes("--preview");
const selection = JSON.parse(
  await readFile("src/videos/video-008/trailer-selection.json", "utf8"),
);
if (final && !selection.verified)
  throw Error(
    "Final export blocked: the required real dog footage and freeze have not been verified.",
  );
const dir = path.resolve("out/video-008");
await mkdir(dir, { recursive: true });
const originalFiles = JSON.parse(
  await readFile(path.join(dir, "preserved.json"), "utf8"),
);
for (const entry of originalFiles) {
  if (entry.file === "src/Root.tsx") continue;
  if (
    createHash("sha256")
      .update(await readFile(entry.file))
      .digest("hex") !== entry.sha256
  )
    throw Error("Previous file changed: " + entry.file);
}
const root = (await readFile("src/Root.tsx", "utf8")).replaceAll("\r\n", "\n");
const cleaned = root
  .replace(
    'import { ClipRushAI008Rocco } from "./videos/video-008/ClipRushAI008Rocco";\n',
    "",
  )
  .replace(
    'import { DURATION as video008Duration } from "./videos/video-008/timing";\n',
    "",
  )
  .replace(
    '      <Composition id="ClipRushAI008Rocco" component={ClipRushAI008Rocco} durationInFrames={video008Duration} fps={30} width={1080} height={1920} />\n',
    "",
  );
if (
  cleaned.replaceAll("\r\n", "\n") !==
  (await readFile(path.join(dir, "Root.before.tsx"), "utf8")).replaceAll(
    "\r\n",
    "\n",
  )
)
  throw Error("Unexpected change to existing registrations");
const inventory = JSON.parse(
  await readFile("src/videos/video-008/inventory.json", "utf8"),
);
for (const entry of inventory)
  if (
    createHash("sha256")
      .update(await readFile(path.join("public", entry.file)))
      .digest("hex") !== entry.sha256
  )
    throw Error("Original asset changed: " + entry.file);
console.log(
  `Preserved ${originalFiles.length} existing files/registrations and ${inventory.length} source assets.`,
);
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
  const composition = all.find((c) => c.id === "ClipRushAI008Rocco");
  if (!composition || composition.durationInFrames !== 890)
    throw Error("Invalid composition duration");
  if (final || preview) {
    let dest = path.resolve(
      final
        ? "out/ClipRushAI008Rocco.mp4"
        : "out/video-008/preview-pending-v001.mp4",
    );
    let v = 2;
    const original = dest;
    while (
      await access(dest).then(
        () => true,
        () => false,
      )
    )
      dest = original.replace(
        /\.mp4$/,
        `-v${String(v++).padStart(3, "0")}.mp4`,
      );
    let last = -1;
    await renderMedia({
      serveUrl,
      composition,
      outputLocation: dest,
      codec: "h264",
      audioCodec: "aac",
      audioBitrate: "192k",
      pixelFormat: "yuv420p",
      crf: 18,
      x264Preset: "fast",
      imageFormat: "jpeg",
      jpegQuality: 95,
      concurrency: 2,
      puppeteerInstance: browser,
      overwrite: false,
      onBrowserLog,
      onProgress: (p) => {
        const n = Math.floor(p.progress * 20) * 5;
        if (n !== last) {
          last = n;
          console.log(`Render ${n}% (${p.renderedFrames}/890)`);
        }
      },
    });
    await writeFile(
      path.join(
        dir,
        final ? "render-report.json" : "preview-render-report.json",
      ),
      JSON.stringify({ dest, composition, final, selection, errors }, null, 2),
    );
  } else {
    for (const frame of [
      0, 42, 68, 85, 135, 180, 267, 268, 320, 347, 390, 445, 500, 509, 550, 602,
      603, 620, 650, 720, 775, 850, 889,
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
      url: "http://localhost:3000/ClipRushAI008Rocco",
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
    for (const frame of [
      ...new Set([
        ...Array.from({ length: 60 }, (_, i) => i * 15),
        602,
        603,
        889,
      ]),
    ].sort((a, b) => a - b)) {
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
            text: [...e.childNodes].map((n) => n.textContent).join(""),
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
        throw Error("Overflow at " + frame + ": " + JSON.stringify(data));
      const visibleRocco = await page.evaluate(() =>
        [
          ...document.querySelectorAll("[data-safe] span, [data-safe] div"),
        ].some(
          (e) =>
            /ROCCO/i.test(e.textContent || "") &&
            e.checkVisibility({ checkVisibilityCSS: true, checkOpacity: true }),
        ),
      );
      if (frame < 603 && visibleRocco)
        throw Error("Premature name reveal at " + frame);
      samples.push({ frame, data });
    }
    await page.evaluate(() =>
      window.__reviewTools.seek_to_frame.execute({ frame: 0 }),
    );
    await writeFile(
      path.join(dir, "studio-audit.json"),
      JSON.stringify({ samples, errors }, null, 2),
    );
    await writeFile(
      path.join(dir, "review-report.json"),
      JSON.stringify(
        {
          composition,
          allCompositions: all.map((c) => ({
            id: c.id,
            frames: c.durationInFrames,
          })),
          selection,
          preserved: originalFiles.length,
          errors,
        },
        null,
        2,
      ),
    );
    console.log("Studio audit passed: no text overflow or early ROCCO title.");
  }
  if (errors.length) throw Error(errors.join("\n"));
} finally {
  await browser.close({ silent: true });
}
