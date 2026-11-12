import { copyFile, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { Project } from "../shared/model";
import {
  project as validateProject,
  record,
  id as validateId,
  text,
} from "../shared/validation";
import { hashFile, inside } from "./files";
import { assetPath, prepareAsset } from "./media";
import type { Store } from "./store";

// Portable directory: JSON + relative assets. No absolute paths are accepted on import.
export async function exportPackage(
  store: Store,
  id: string,
  parent: string,
): Promise<string> {
  const project = store.get(id);
  const destination = path.join(
    parent,
    `ClipRush-${project.id}-${randomUUID().slice(0, 8)}`,
  );
  await mkdir(path.join(destination, "media"), { recursive: true });
  const assets = [];
  for (const asset of project.assets) {
    const relative = `media/${asset.hash}${path.extname(asset.path).toLowerCase()}`;
    await copyFile(
      await assetPath(store, asset),
      path.join(destination, relative),
    );
    const portable = { ...asset };
    delete portable.thumbnail;
    delete portable.missing;
    assets.push({ ...portable, mode: "copy" as const, path: relative });
  }
  // Manifest is committed last. An interrupted package cannot masquerade as complete.
  await writeFile(
    path.join(destination, "project.cliprush.json"),
    JSON.stringify(
      {
        ...project,
        assets,
        channel: store.channels().find((c) => c.id === project.channelId),
      },
      null,
      2,
    ),
    { flag: "wx" },
  );
  return destination;
}
export async function importPackage(
  store: Store,
  file: string,
): Promise<Project> {
  if ((await stat(file)).size > 20 * 1024 * 1024)
    throw new Error("Manifesto maior que 20 MB.");
  const raw = record(JSON.parse(await readFile(file, "utf8")));
  const imported = validateProject(raw);
  const channel = raw.channel ? record(raw.channel) : undefined;
  if (channel) {
    if (validateId(channel.id) !== imported.channelId)
      throw new Error("Canal do pacote incompatível com o projeto.");
    text(channel.name, "Canal");
    text(channel.language, "Idioma", 35);
  }
  if (!channel && !store.channels().some((c) => c.id === imported.channelId))
    throw new Error(
      "Pacote sem definição do canal. Reexporte o projeto no workspace original.",
    );
  const now = new Date().toISOString();
  const project: Project = {
    ...imported,
    id: randomUUID(),
    revision: 0,
    createdAt: now,
    updatedAt: now,
    archived: false,
    assets: [],
  };
  const sources: string[] = [];
  // Validate every path and hash before making any managed copies.
  for (const asset of imported.assets) {
    if (asset.mode !== "copy")
      throw new Error("Pacote deve incluir todas as mídias.");
    const source = await inside(path.dirname(file), asset.path);
    if ((await hashFile(source)) !== asset.hash)
      throw new Error(`Mídia corrompida: ${asset.name}`);
    sources.push(source);
  }
  for (let index = 0; index < imported.assets.length; index++) {
    const asset = imported.assets[index];
    const copied = await prepareAsset(store, project, sources[index], "copy");
    project.assets.push({
      ...asset,
      ...copied,
      id: asset.id,
      name: asset.name,
    });
  }
  if (channel) store.importChannel(channel);
  return store.insert(project);
}
