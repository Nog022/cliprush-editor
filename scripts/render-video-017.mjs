import { bundle } from "@remotion/bundler";
import {
  openBrowser,
  selectComposition,
  renderStill,
  renderMedia,
} from "@remotion/renderer";
import { createServer } from "node:http";
import { createReadStream, existsSync } from "node:fs";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { completeProduction } from "./video-retention.mjs";

const root = process.cwd();
const out = path.join(root, "out/video-017");
const mode = process.argv[2] ?? "frames";
const version = process.argv[3] ?? "v001";
if (!/^[a-z0-9-]+$/i.test(version)) throw new Error("Invalid output version");
const review = path.join(out, `review-${version}`);
await mkdir(review, { recursive: true });
const servePath = await bundle({
  entryPoint: path.join(root, "src/index.ts"),
  outDir: path.join(out, "bundle"),
  publicDir: null,
});
const server = createServer((request, response) => {
  void (async () => {
    const pathname = decodeURIComponent(
      new URL(request.url, "http://127.0.0.1").pathname,
    );
    const base = pathname.startsWith("/public/")
      ? path.join(root, "public")
      : servePath;
    const relative = pathname.startsWith("/public/")
      ? pathname.slice(8)
      : pathname === "/"
        ? "index.html"
        : pathname.slice(1);
    const file = path.resolve(base, relative);
    if (!file.startsWith(base + path.sep)) {
      response.writeHead(403).end();
      return;
    }
    const info = await stat(file);
    const types = {
      ".mp4": "video/mp4",
      ".mp3": "audio/mpeg",
      ".wav": "audio/wav",
      ".jpg": "image/jpeg",
      ".ttf": "font/ttf",
      ".js": "application/javascript",
      ".html": "text/html",
      ".css": "text/css",
    };
    const headers = {
      "Content-Type": types[path.extname(file)] ?? "application/octet-stream",
      "Accept-Ranges": "bytes",
    };
    const range = request.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
    let start = 0,
      end = info.size - 1;
    if (range) {
      start = Number(range[1]);
      if (range[2]) end = Math.min(end, Number(range[2]));
    }
    if (start > end || end >= info.size) {
      response.writeHead(416).end();
      return;
    }
    response.writeHead(range ? 206 : 200, {
      ...headers,
      "Content-Length": end - start + 1,
      ...(range
        ? { "Content-Range": `bytes ${start}-${end}/${info.size}` }
        : {}),
    });
    if (request.method === "HEAD") response.end();
    else
      createReadStream(file, { start, end })
        .on("error", () => response.destroy())
        .pipe(response);
  })().catch(() => {
    if (!response.headersSent) response.writeHead(404);
    response.end();
  });
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const chrome =
  process.env.CLIPRUSH_BROWSER ??
  path.join(
    process.env.ProgramFiles ?? "",
    "Google/Chrome/Application/chrome.exe",
  );
const browser = await openBrowser("chrome", {
  ...(existsSync(chrome) ? { browserExecutable: chrome } : {}),
});
const sourceFiles = [
  "src/videos/video-017/ClipRush017.tsx",
  "src/videos/video-017/caption-pages.json",
  "src/videos/video-017/captions.json",
  "public/videos/video-017/audio/narracao.mp3",
  "public/videos/video-017/fonts/Arial-Bold.ttf",
  "public/videos/biblioteca/gta6/videos/video_instagram.mp4",
  "public/videos/video-017/footage/only-in-dade-vice-city-02.mp4",
  "public/videos/video-017/footage/comparacao-miami-gta6.mp4",
];
const hashes = async () =>
  Object.fromEntries(
    await Promise.all(
      sourceFiles.map(async (file) => [
        file,
        createHash("sha256")
          .update(await readFile(path.join(root, file)))
          .digest("hex"),
      ]),
    ),
  );
const errors = [];
let finalOutput;
const onBrowserLog = (log) => {
  if (log.type === "error") errors.push(log.text);
};
try {
  const serveUrl = `http://127.0.0.1:${server.address().port}`;
  const composition = await selectComposition({
    serveUrl,
    id: "ClipRush017",
    puppeteerInstance: browser,
    onBrowserLog,
  });
  if (
    composition.width !== 1080 ||
    composition.height !== 1920 ||
    composition.fps !== 30 ||
    composition.durationInFrames !== 1442
  )
    throw new Error("Invalid composition");
  if (mode === "frames") {
    const frames = process.argv[4]
      ? process.argv[4].split(",").map(Number)
      : [
          0, 80, 210, 355, 480, 533, 610, 695, 750, 883, 1022, 1085, 1235, 1390,
          1441,
        ];
    for (const frame of frames) {
      await renderStill({
        serveUrl,
        composition,
        puppeteerInstance: browser,
        onBrowserLog,
        frame,
        output: path.join(review, `${String(frame).padStart(4, "0")}.jpg`),
        imageFormat: "jpeg",
        jpegQuality: 95,
        scale: 0.5,
        overwrite: false,
        timeoutInMilliseconds: 120000,
        logLevel: "error",
      });
      console.log(`Frame ${frame}`);
    }
  } else {
    const ranges =
      mode === "previews"
        ? [
            ["opening", 0, 167],
            ["details", 426, 555],
            ["reveal", 927, 1170],
          ]
        : [["final", 0, 1441]];
    for (const [name, first, last] of ranges) {
      const output = path.join(
        out,
        name === "final"
          ? `video-017-${version}.mp4`
          : `preview-${name}-${version}.mp4`,
      );
      if (existsSync(output))
        throw new Error(`Output already exists ${output}`);
      let previous = -1;
      await renderMedia({
        serveUrl,
        composition,
        puppeteerInstance: browser,
        onBrowserLog,
        frameRange: [first, last],
        outputLocation: output,
        codec: "h264",
        crf: 18,
        pixelFormat: "yuv420p",
        audioCodec: "aac",
        audioBitrate: "320k",
        concurrency: 2,
        imageFormat: "jpeg",
        jpegQuality: 95,
        overwrite: false,
        timeoutInMilliseconds: 120000,
        logLevel: "error",
        onProgress: ({ progress }) => {
          const percent = Math.floor(progress * 10) * 10;
          if (percent !== previous) {
            previous = percent;
            console.log(`${name} ${percent}%`);
          }
        },
      });
      console.log(output);
      if (name === "final") finalOutput = output;
    }
  }
  if (errors.length) throw new Error(errors.slice(0, 5).join("\n"));
  // Historical registrations may be retired by the approved retention transaction.
  // Current production integrity is checked against its original inventory below.
  const inventory = JSON.parse(
    await readFile(
      path.join(root, "src/videos/video-017/inventory.json"),
      "utf8",
    ),
  );
  const digest = await hashes();
  for (const item of inventory)
    if (digest[item.file] !== item.sha256)
      throw new Error(`Source changed ${item.file}`);
  await writeFile(
    path.join(review, `${mode}-report.json`),
    JSON.stringify(
      {
        id: composition.id,
        width: composition.width,
        height: composition.height,
        fps: composition.fps,
        durationInFrames: composition.durationInFrames,
        errors,
        hashes: digest,
        currentProductionInventoryVerified: true,
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close({ silent: true });
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
}
if (finalOutput)
  console.log(JSON.stringify(await completeProduction({
    root, current: 17, output: finalOutput,
    expected: { width: 1080, height: 1920, fps: 30, durationInFrames: 1442 },
  })));
