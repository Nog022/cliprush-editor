import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";
import { protocol } from "electron";
import { inside, mime } from "./files";
import { assetPath } from "./media";
import type { Store } from "./store";

export const CSP =
  "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' blob: data:; connect-src 'self' blob:; worker-src 'self' blob:; font-src 'self'; object-src 'none'; frame-src 'none'; base-uri 'none'; form-action 'none'";
export function installProtocol(
  getStore: () => Store,
  uiRoot: string,
  publicRoot: string,
) {
  protocol.handle("cliprush", async (request) => {
    try {
      const url = new URL(request.url);
      if (url.host !== "app" || !["GET", "HEAD"].includes(request.method))
        return new Response(null, { status: 403 });
      const pathname = decodeURIComponent(url.pathname);
      let file: string;
      if (pathname.startsWith("/media/")) {
        const parts = pathname.split("/");
        if (parts.length !== 4 && parts.length !== 5)
          return new Response(null, { status: 404 });
        const store = getStore();
        const asset = store.get(parts[2]).assets.find((a) => a.id === parts[3]);
        if (!asset) return new Response(null, { status: 404 });
        file =
          parts[4] === "thumbnail" && asset.thumbnail
            ? await inside(store.directory, asset.thumbnail)
            : await assetPath(store, asset);
      } else if (pathname.startsWith("/videos/")) {
        file = await inside(publicRoot, pathname.slice(1));
      } else {
        file = await inside(
          uiRoot,
          pathname === "/" ? "index.html" : pathname.slice(1),
        );
      }
      const info = await stat(file);
      const headers = new Headers({
        "Content-Type": mime(file),
        "Content-Security-Policy": CSP,
        "X-Content-Type-Options": "nosniff",
        "Accept-Ranges": "bytes",
        "Cache-Control": "no-cache",
      });
      let start = 0;
      let end = info.size - 1;
      let status = 200;
      const range = request.headers.get("range");
      if (range) {
        const match = /^bytes=(\d*)-(\d*)$/.exec(range);
        if (!match || (!match[1] && !match[2]))
          return new Response(null, { status: 416 });
        if (!match[1]) start = Math.max(0, info.size - Number(match[2]));
        else {
          start = Number(match[1]);
          if (match[2]) end = Math.min(end, Number(match[2]));
        }
        if (start > end || start >= info.size)
          return new Response(null, {
            status: 416,
            headers: { "Content-Range": `bytes */${info.size}` },
          });
        headers.set("Content-Range", `bytes ${start}-${end}/${info.size}`);
        status = 206;
      }
      headers.set("Content-Length", String(Math.max(0, end - start + 1)));
      if (request.method === "HEAD" || info.size === 0)
        return new Response(null, { status, headers });
      const stream = Readable.toWeb(createReadStream(file, { start, end }));
      return new Response(stream as ReadableStream<Uint8Array>, {
        status,
        headers,
      });
    } catch {
      return new Response("Arquivo indisponível", { status: 404 });
    }
  });
}
