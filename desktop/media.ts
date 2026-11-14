import { execFile } from "node:child_process";
import { promisify } from "node:util";
import {
  copyFile,
  mkdir,
  realpath,
  stat,
  writeFile,
  rename,
  unlink,
} from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { nativeImage } from "electron";
import type { Asset, ImportMode, ImportResult, Project } from "../shared/model";
import { hashFile, inside, kindOf } from "./files";
import type { Store } from "./store";

const execute = promisify(execFile);
export async function assetPath(store: Store, asset: Asset): Promise<string> {
  return asset.mode === "copy"
    ? inside(store.directory, asset.path)
    : realpath(asset.path);
}
async function inspect(
  file: string,
  kind: Asset["kind"],
): Promise<Partial<Asset>> {
  if (kind === "caption") return {};
  try {
    const { stdout } = await execute(
      "ffprobe",
      [
        "-v",
        "error",
        "-protocol_whitelist",
        "file,pipe",
        "-show_entries",
        "format=duration:stream=width,height,codec_type",
        "-of",
        "json",
        file,
      ],
      { timeout: 15000, windowsHide: true, maxBuffer: 1024 * 1024 },
    );
    const data = JSON.parse(stdout) as {
      format?: { duration?: string };
      streams?: { width?: number; height?: number; codec_type?: string }[];
    };
    const visual = data.streams?.find((s) => s.codec_type === "video");
    const duration = Number(data.format?.duration);
    return {
      ...(visual?.width ? { width: visual.width, height: visual.height } : {}),
      ...(kind !== "image" && duration > 0 && duration <= 86400
        ? { duration }
        : {}),
    };
  } catch {
    return {};
  } // Optional FFprobe. Playback still uses Chromium's real decoder.
}
export async function prepareAsset(
  store: Store,
  project: Project,
  source: string,
  mode: ImportMode,
): Promise<Asset> {
  const file = await realpath(source);
  const kind = kindOf(file);
  const info = await stat(file);
  if (!info.isFile() || info.size > 50 * 1024 ** 3)
    throw new Error("Arquivo inválido ou maior que 50 GB.");
  const hash = await hashFile(file);
  const asset: Asset = {
    id: randomUUID(),
    name: path.basename(file),
    kind,
    mode,
    path: file,
    hash,
    bytes: info.size,
    ...(await inspect(file, kind)),
  };
  const folder = path.join("channels", project.channelId, "assets");
  await mkdir(path.join(store.directory, folder), { recursive: true });
  if (mode === "copy") {
    asset.path = path.join(
      folder,
      `${hash}${path.extname(file).toLowerCase()}`,
    );
    const destination = path.join(store.directory, asset.path);
    const temporary = `${destination}.${randomUUID()}.importing`;
    try {
      await stat(destination);
      if ((await hashFile(destination)) !== hash)
        throw new Error(
          "A cópia gerenciada está corrompida; original preservado.",
        );
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      try {
        await copyFile(file, temporary, constants.COPYFILE_EXCL);
        if ((await hashFile(temporary)) !== hash)
          throw new Error(
            "O arquivo mudou durante a importação. Tente novamente.",
          );
        await rename(temporary, destination);
      } finally {
        await unlink(temporary).catch(() => undefined);
      }
    }
  }
  if (kind === "image" || kind === "video") {
    try {
      const thumb = await nativeImage.createThumbnailFromPath(file, {
        width: 480,
        height: 270,
      });
      if (!thumb.isEmpty()) {
        asset.thumbnail = path.join(folder, `${hash}.thumb.png`);
        await writeFile(
          path.join(store.directory, asset.thumbnail),
          thumb.toPNG(),
        );
      }
    } catch {
      /* UI shows a type icon if the OS cannot decode a thumbnail. */
    }
  }
  return asset;
}
export async function importFiles(
  store: Store,
  projectId: string,
  sources: string[],
  mode: ImportMode,
): Promise<ImportResult> {
  let project = store.get(projectId);
  const result: ImportResult = {
    project,
    imported: 0,
    duplicates: 0,
    errors: [],
  };
  for (const source of sources) {
    try {
      const asset = await prepareAsset(store, project, source, mode);
      if (
        project.assets.some(
          (a) => a.hash === asset.hash && a.kind === asset.kind,
        )
      ) {
        result.duplicates++;
        continue;
      }
      project = { ...project, assets: [...project.assets, asset] };
      result.imported++;
    } catch (error) {
      result.errors.push(
        `${path.basename(source)}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
  if (result.imported) project = store.save(project, true);
  return { ...result, project };
}
export async function inspectAssets(
  store: Store,
  project: Project,
): Promise<Project> {
  const assets = await Promise.all(
    project.assets.map(async (asset) => {
      try {
        await stat(await assetPath(store, asset));
        return { ...asset, missing: false };
      } catch {
        return { ...asset, missing: true };
      }
    }),
  );
  return { ...project, assets };
}
