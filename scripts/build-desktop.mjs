import { build } from "esbuild";
import {
  mkdir,
  readFile,
  readdir,
  stat,
  writeFile,
  copyFile,
  cp,
} from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { randomUUID } from "node:crypto";

await mkdir("dist/desktop", { recursive: true });
await mkdir("dist/ui", { recursive: true });
await build({
  entryPoints: ["desktop/main.ts", "desktop/preload.ts"],
  outdir: "dist/desktop",
  outExtension: { ".js": ".cjs" },
  bundle: true,
  platform: "node",
  format: "cjs",
  external: ["electron", "@remotion/renderer", "@remotion/bundler", "typescript", "esbuild"],
  target: "node22",
  sourcemap: true,
});
await build({
  entryPoints: { app: "studio/index.tsx" },
  outdir: "dist/ui",
  bundle: true,
  splitting: true,
  format: "esm",
  platform: "browser",
  target: "chrome134",
  jsx: "automatic",
  define: { "process.env.NODE_ENV": '"production"' },
  minify: true,
  sourcemap: true,
});
await copyFile("studio/index.html", "dist/ui/index.html");
await build({
  entryPoints: ["studio/legacy.tsx"],
  outfile: "dist/legacy-catalog.cjs",
  bundle: true,
  platform: "node",
  format: "cjs",
  target: "node22",
  jsx: "automatic",
});
const require = createRequire(import.meta.url);
const { legacyCompositions } = require(path.resolve("dist/legacy-catalog.cjs"));
const manifest = [];
for (const {
  id,
  name,
  width,
  height,
  fps,
  durationInFrames,
} of legacyCompositions) {
  const match = id.match(/(\d{3})/);
  let thumbnail, createdAt, updatedAt;
  if (match) {
    const folder = `videos/video-${match[1]}`;
    const files = await readdir(`public/${folder}`, { recursive: true }).catch(
      (error) => {
        if (error.code === "ENOENT") return [];
        throw error;
      },
    );
    const first = files.find((file) =>
      /\.(png|jpg|jpeg|webp|jfif)$/i.test(file),
    );
    if (first)
      thumbnail =
        "/" +
        `${folder}/${first.split(path.sep).join("/")}`
          .split("/")
          .map(encodeURIComponent)
          .join("/");
    const info = await stat(`src/${folder}`);
    createdAt = info.birthtime.toISOString();
    updatedAt = info.mtime.toISOString();
  }
  manifest.push({
    id,
    name,
    width,
    height,
    fps,
    durationInFrames,
    thumbnail,
    createdAt,
    updatedAt,
  });
}
await writeFile("dist/ui/legacy.json", JSON.stringify(manifest, null, 2));
const pkg = JSON.parse(await readFile("package.json", "utf8"));
const { bundle } = await import("@remotion/bundler");
await bundle({
  entryPoint: path.resolve("studio/render-entry.tsx"),
  outDir: path.resolve("dist/render"),
  // In this Remotion version null selects the full public directory.
  // Assets are served by the desktop media server. Use an absent, unique path.
  publicDir: path.resolve(`out/retention/tmp/no-public-${randomUUID()}`),
});
// The Player and MP4 composition resolve the exact same preset artwork.
for (const target of ['dist/ui/templates/corte-live', 'dist/render/templates/corte-live']) {
  await cp('public/templates/corte-live', target, {recursive: true});
}
// Main/UI code is bundled. The renderer resolves runtime modules and native binaries.
await writeFile(
  "dist/package.json",
  JSON.stringify(
    {
      name: "cliprush-editor-studio",
      productName: "ClipRush Editor Studio",
      version: pkg.version,
      description: "Estúdio audiovisual local ClipRush",
      author: "ClipRush",
      main: "desktop/main.cjs",
      dependencies: {
        "@remotion/renderer": pkg.dependencies["@remotion/renderer"],
        react: pkg.dependencies.react,
        "react-dom": pkg.dependencies["react-dom"],
      },
    },
    null,
    2,
  ),
);
console.log(
  `Desktop build ready. ${manifest.length} original compositions preserved.`,
);
