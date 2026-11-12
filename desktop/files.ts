import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { realpath, stat } from "node:fs/promises";
import path from "node:path";
import type { AssetKind } from "../shared/model";

const types: Record<string, AssetKind> = {
  ".png": "image",
  ".jpg": "image",
  ".jpeg": "image",
  ".jfif": "image",
  ".webp": "image",
  ".mp4": "video",
  ".mov": "video",
  ".webm": "video",
  ".m4v": "video",
  ".mkv": "video",
  ".mp3": "audio",
  ".wav": "audio",
  ".m4a": "audio",
  ".aac": "audio",
  ".ogg": "audio",
  ".flac": "audio",
  ".srt": "caption",
  ".vtt": "caption",
};
export const extensions = Object.keys(types).map((x) => x.slice(1));
export function kindOf(file: string): AssetKind {
  const kind = types[path.extname(file).toLowerCase()];
  if (!kind) throw new Error("Formato não suportado.");
  return kind;
}
export async function hashFile(file: string): Promise<string> {
  const hash = createHash("sha256");
  for await (const data of createReadStream(file)) hash.update(data);
  return hash.digest("hex");
}
export async function inside(root: string, relative: string): Promise<string> {
  if (relative.includes("\0") || path.isAbsolute(relative))
    throw new Error("Caminho inválido.");
  const base = await realpath(root);
  const target = await realpath(path.resolve(base, relative));
  const delta = path.relative(base, target);
  if (
    delta === ".." ||
    delta.startsWith(`..${path.sep}`) ||
    path.isAbsolute(delta)
  )
    throw new Error("Caminho fora da pasta permitida.");
  if (!(await stat(target)).isFile()) throw new Error("Arquivo inválido.");
  return target;
}
export function mime(file: string): string {
  const ext = path.extname(file).toLowerCase();
  return (
    (
      {
        ".html": "text/html",
        ".js": "text/javascript",
        ".css": "text/css",
        ".json": "application/json",
        ".svg": "image/svg+xml",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".jfif": "image/jpeg",
        ".webp": "image/webp",
        ".mp4": "video/mp4",
        ".mov": "video/quicktime",
        ".webm": "video/webm",
        ".mp3": "audio/mpeg",
        ".wav": "audio/wav",
        ".m4a": "audio/mp4",
        ".vtt": "text/vtt",
        ".woff2": "font/woff2",
      } as Record<string, string>
    )[ext] ?? "application/octet-stream"
  );
}
