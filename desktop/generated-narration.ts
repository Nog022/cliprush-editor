import { randomUUID } from "node:crypto";
import type { Project } from "../shared/model";
import { narrationClips } from "../shared/editorial";
import { prepareAsset } from "./media";
import type { Store } from "./store";
import type { ElevenLabs } from "./elevenlabs";

export async function generateNarration(project: Project, store: Store, speech: Pick<ElevenLabs, "synthesize">, signal: AbortSignal, log: (message: string) => void): Promise<Project> {
  const script = project.generation?.narrationScript;
  if (!script?.trim()) return project;
  // A new narrated project is allowed to have no audio yet.
  const previousNarration = narrationClips({ ...project, type: "mixed" });
  let file: string;
  try {
    const result = await speech.synthesize(script, signal);
    file = result.file;
    log(result.cached ? "Narração ElevenLabs recuperada do cache, sem nova geração." : "Narração ElevenLabs gerada com eleven_v4.");
  } catch (error) {
    signal.throwIfAborted();
    if (!previousNarration.length) throw error;
    log(`${error instanceof Error ? error.message : "ElevenLabs indisponível."} Fallback: áudio de narração existente preservado.`);
    return project;
  }
  signal.throwIfAborted();
  let asset = await prepareAsset(store, project, file, "copy");
  if (!asset.duration || !Number.isFinite(asset.duration)) throw new Error("Narração gerada sem duração verificável. Verifique FFprobe antes de continuar.");
  const durationInFrames = Math.ceil(asset.duration * project.fps);
  asset.role = "narration";
  const existing = project.assets.find(a => a.hash === asset.hash && a.kind === "audio");
  if (existing) asset = { ...asset, id: existing.id };
  const old = new Set(previousNarration.map(c => c.id));
  // Reuse the existing alignment/compiler; leave every visual clip and scene intact.
  return { ...project, assets: [...project.assets.filter(a => a.id !== asset.id), asset],
    clips: [...project.clips.filter(c => !old.has(c.id)), { id: randomUUID(), assetId: asset.id, from: 0, durationInFrames, volume: 1 }],
    captions: [], durationInFrames,
    generation: { ...project.generation!, narrationAssetId: asset.id, references: [
      ...project.generation!.references.filter(r => !/^(?:narra[cç][aã]o|narration|script|roteiro)(?:[. _-]|$)|^automatic-narration-alignment\.json$/i.test(r.name)),
      { name: "narration-approved.txt", content: script },
    ] },
  };
}
