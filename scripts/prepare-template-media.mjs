// Shared excerpt preparation used by the existing template runner and desktop live preset.
import path from "node:path";
import {
  mkdir,
  readFile,
  stat,
  writeFile,
  rename,
  unlink,
} from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";

export async function prepareTemplateMedia({
  source,
  startSeconds,
  durationSeconds,
  directory,
  signal,
  cacheKey,
}) {
  if (
    !Number.isFinite(startSeconds) ||
    startSeconds < 0 ||
    !Number.isFinite(durationSeconds) ||
    durationSeconds <= 0
  )
    throw Error("Invalid template excerpt interval.");
  signal?.throwIfAborted();
  const stamp = await stat(source);
  const key =
    cacheKey ??
    JSON.stringify({
      source,
      startSeconds,
      durationSeconds,
      size: stamp.size,
      mtimeMs: stamp.mtimeMs,
    });
  await mkdir(directory, { recursive: true });
  const cacheFile = path.join(directory, "cache.json");
  const video = path.join(directory, "segment.mp4"),
    audio = path.join(directory, "segment.wav");
  if (
    (await readFile(cacheFile, "utf8").catch(() => null)) === key &&
    (await stat(video).catch(() => null))?.size > 0 &&
    (await stat(audio).catch(() => null))?.size > 0
  )
    return { video, audio };
  if (
    (await stat(video).catch(() => null)) ||
    (await stat(audio).catch(() => null))
  )
    throw Error(
      "Stale or incomplete template media cache; use a new cache directory.",
    );
  const temporaryVideo = path.join(directory, `${randomUUID()}.mp4`);
  const temporaryAudio = path.join(directory, `${randomUUID()}.wav`);
  try {
    await new Promise((resolve, reject) => {
      const child = spawn(
        "ffmpeg",
        [
          "-v",
          "error",
          "-nostdin",
          "-n",
          "-ss",
          String(startSeconds),
          "-i",
          source,
          "-t",
          String(durationSeconds),
          "-map",
          "0:v:0",
          "-an",
          "-c:v",
          "libx264",
          "-crf",
          "0",
          "-preset",
          "fast",
          temporaryVideo,
          "-t",
          String(durationSeconds),
          "-map",
          "0:a:0",
          "-vn",
          "-c:a",
          "pcm_s24le",
          temporaryAudio,
        ],
        { stdio: ["ignore", "ignore", "pipe"], windowsHide: true, signal },
      );
      let error = "";
      child.stderr.on("data", (data) => {
        error = (error + data).slice(-2000);
      });
      let spawnError;
      child.once("error", (error) => {
        spawnError = error;
      });
      child.once("close", (code) =>
        spawnError
          ? reject(spawnError)
          : code === 0
            ? resolve()
            : reject(Error(`Excerpt preparation failed: ${code}. ${error}`)),
      );
    });
    signal?.throwIfAborted();
    await rename(temporaryVideo, video);
    await rename(temporaryAudio, audio);
    await writeFile(cacheFile, key);
    return { video, audio };
  } finally {
    await unlink(temporaryVideo).catch(() => undefined);
    await unlink(temporaryAudio).catch(() => undefined);
  }
}
