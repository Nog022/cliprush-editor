import type { Project } from "./model";
import * as validate from "./validation";

const object = (properties: Record<string, unknown>) => ({
  type: "object",
  properties,
  required: Object.keys(properties),
  additionalProperties: false,
});
const integer = { type: "integer" };
const string = { type: "string" };
const array = (items: unknown) => ({ type: "array", items });
export const compositionSchema = object({
  durationInFrames: integer,
  clips: array(
    object({
      id: string,
      assetId: string,
      from: integer,
      durationInFrames: integer,
      volume: { type: "number" },
      trimBefore: integer,
      animation: { enum: ["none", "fade", "zoom"], type: "string" },
    }),
  ),
  scenes: array(
    object({
      id: string,
      name: string,
      from: integer,
      durationInFrames: integer,
      title: string,
      subtitle: string,
      background: string,
      accent: string,
      shape: { enum: ["none", "circle", "square"], type: "string" },
      animation: { enum: ["none", "fade", "zoom", "slide"], type: "string" },
    }),
  ),
  captions: array(
    object({
      text: string,
      startMs: { type: "number" },
      endMs: { type: "number" },
    }),
  ),
});

export function applyComposition(previous: Project, input: unknown): Project {
  const data = validate.record(input);
  const project = validate.project({
    ...previous,
    durationInFrames: data.durationInFrames,
    clips: data.clips,
    scenes: data.scenes,
    captions: data.captions,
  });
  if (!project.scenes.length && !project.clips.length)
    throw new Error("A composição gerada está vazia.");
  for (const clip of project.clips) {
    const asset = project.assets.find((a) => a.id === clip.assetId)!;
    if (previous.assets.find((a) => a.id === asset.id)?.missing)
      throw new Error(`Mídia ausente ${asset.name}`);
    if (
      asset.duration &&
      (clip.trimBefore ?? 0) + clip.durationInFrames >
        Math.ceil(asset.duration * project.fps) + 1
    )
      throw new Error(`Trecho excede a duração de ${asset.name}.`);
  }
  if (
    project.captions.some(
      (c) => c.endMs > (project.durationInFrames / project.fps) * 1000,
    )
  )
    throw new Error("Legenda excede a composição.");
  return project;
}
