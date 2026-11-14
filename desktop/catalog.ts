import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { promisify } from "node:util";
import type { CatalogScene } from "../shared/model";
import { inside } from "./files";
import { prepareAsset } from "./media";
import type { Store } from "./store";
import * as validate from "../shared/validation";

function seconds(value: unknown) {
  if (typeof value !== "string" || !/^\d+:\d{2}:\d{2}(\.\d+)?$/.test(value))
    throw new Error("Timestamp inválido no catálogo.");
  const [hours, minutes, seconds] = value.split(":").map(Number);
  return hours * 3600 + minutes * 60 + seconds;
}

export class CatalogService {
  private candidates = new Map<
    string,
    { scene: CatalogScene; source: string }
  >();
  constructor(
    private store: Store,
    private root: string,
    private publicRoot: string,
  ) {}
  async search(query: string): Promise<CatalogScene[]> {
    const text = validate.text(query, "Busca", 160);
    let stdout: string;
    try {
      ({ stdout } = await promisify(execFile)(
        "python",
        [
          path.join(this.root, "scripts/buscar_cenas_gta6.py"),
          "--limite",
          "5",
          "--catalogo",
          path.join(this.publicRoot, "videos/biblioteca/catalogo/gta6/cenas-descritas.json"),
          "--",
          text,
        ],
        {
          windowsHide: true,
          timeout: 15000,
          maxBuffer: 200000,
          encoding: "utf8",
        },
      ));
    } catch {
      throw new Error(
        "Busca indisponível. Confira Python e o catálogo GTA 6 existente. A biblioteca importada continua disponível.",
      );
    }
    const result = JSON.parse(stdout) as {
      buscas: { candidatos: Record<string, unknown>[] }[];
    };
    const scenes: CatalogScene[] = [];
    for (const candidate of result.buscas[0].candidatos.slice(0, 5)) {
      const original = String(candidate.arquivo_original).replace(/\\/g, "/");
      const source = original.startsWith("public/")
        ? path.join(this.publicRoot, original.slice(7))
        : path.resolve(this.root, original);
      const relative = path.relative(this.publicRoot, source);
      if (relative.startsWith("..") || path.isAbsolute(relative)) continue;
      const scene: CatalogScene = {
        id: randomUUID(),
        name: `${candidate.video ?? path.basename(source)} · cena ${candidate.cena ?? ""}`,
        description: String(candidate.descricao ?? "").slice(0, 2000),
        startSeconds: seconds(candidate.inicio),
        endSeconds: seconds(candidate.fim),
      };
      if (scene.endSeconds <= scene.startSeconds) continue;
      const thumbnail = String(candidate.miniatura ?? "").replace(/\\/g, "/");
      if (thumbnail.startsWith("public/videos/") && !thumbnail.includes(".."))
        scene.thumbnail = `cliprush://app/${thumbnail.slice(7).split("/").map(encodeURIComponent).join("/")}`;
      scenes.push(scene);
      this.candidates.set(scene.id, { scene, source: relative });
    }
    // Keep only a small, bounded set of recent candidate handles.
    while (this.candidates.size > 100)
      this.candidates.delete(this.candidates.keys().next().value!);
    return scenes;
  }
  async use(projectId: string, candidateId: string) {
    const candidate = this.candidates.get(candidateId);
    if (!candidate) throw new Error("Resultado expirado. Repita a busca.");
    const project = this.store.get(projectId);
    const file = await inside(this.publicRoot, candidate.source);
    const prepared = await prepareAsset(this.store, project, file, "reference");
    const asset = project.assets.find((a) => a.hash === prepared.hash) ?? {
      ...prepared,
      category: "GTA 6",
    };
    const from = Math.max(
      0,
      ...project.clips
        .filter(
          (c) =>
            project.assets.find((a) => a.id === c.assetId)?.kind !== "audio",
        )
        .map((c) => c.from + c.durationInFrames),
    );
    const clip = {
      id: randomUUID(),
      assetId: asset.id,
      from,
      durationInFrames: Math.max(
        1,
        Math.round(
          (candidate.scene.endSeconds - candidate.scene.startSeconds) *
            project.fps,
        ),
      ),
      trimBefore: Math.round(candidate.scene.startSeconds * project.fps),
      volume: 1,
    };
    return this.store.save(
      {
        ...project,
        assets: project.assets.some((a) => a.id === asset.id)
          ? project.assets
          : [...project.assets, asset],
        durationInFrames: Math.max(
          project.durationInFrames,
          from + clip.durationInFrames,
        ),
        clips: [...project.clips, clip],
      },
      true,
    );
  }
}
