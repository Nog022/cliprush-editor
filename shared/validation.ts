import type { NewProject, Project, ProjectType, RenderSettings, Scene } from "./model";
import {assertLiveFraming, LIVE_PRESET, type LiveFraming} from './live-preset';
import {assertNarratedFraming, NARRATED_PRESET, type NarratedFraming} from './narrated-preset';

export function renderSettings(value: unknown): RenderSettings {
  const r = record(value);
  if (!["portrait", "landscape", "square", "custom"].includes(String(r.preset)) || !["draft", "balanced", "high"].includes(String(r.quality)) || typeof r.audio !== "boolean" || typeof r.captions !== "boolean") throw new Error("Configuração de exportação inválida.");
  const width = number(r.width, 128, 3840), height = number(r.height, 128, 3840);
  if (width % 2 || height % 2) throw new Error("MP4 H.264 exige resolução com largura e altura pares.");
  return { preset: r.preset as RenderSettings["preset"], quality: r.quality as RenderSettings["quality"], width, height, fps: number(r.fps, 1, 60), audio: r.audio, captions: r.captions };
}
export function defaultRender(p: {width: number; height: number; fps: number}): RenderSettings {
  return { preset: "custom", ...p, quality: "balanced", audio: true, captions: true };
}
export function projectType(value: unknown): ProjectType {
  if (value === undefined) return "blank";
  if (!["narrated", "clips", "animated", "mixed", "template", "blank"].includes(String(value))) throw new Error("Tipo de projeto inválido.");
  return value as ProjectType;
}
function color(value: unknown): string { const c = text(value, "Cor", 7); if (!/^#[\da-f]{6}$/i.test(c)) throw new Error("Cor inválida."); return c; }
export function scene(value: unknown, duration: number): Scene {
  const s = record(value);
  const from = number(s.from, 0, duration - 1);
  if (!["circle", "square", "none"].includes(String(s.shape)) || !["fade", "zoom", "slide", "none"].includes(String(s.animation))) throw new Error("Animação ou objeto inválido.");
  if (s.narratedRole !== undefined && !['heading', 'cta'].includes(String(s.narratedRole))) throw new Error('Overlay narrado inválido.');
  return { id: id(s.id), name: text(s.name, "Cena"), from, durationInFrames: number(s.durationInFrames, 1, duration - from), title: s.title === "" ? "" : text(s.title, "Texto da cena", 500), subtitle: s.subtitle === "" ? "" : text(s.subtitle, "Subtítulo", 500), background: color(s.background), accent: color(s.accent), shape: s.shape as Scene["shape"], animation: s.animation as Scene["animation"], ...(s.narratedRole === undefined ? {} : {narratedRole: s.narratedRole as Scene['narratedRole']}) };
}

export function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Objeto inválido.");
  return value as Record<string, unknown>;
}
export function text(value: unknown, label = "Texto", max = 160): string {
  if (
    typeof value !== "string" ||
    !value.trim() ||
    value.length > max ||
    Array.from(value).some((character) => character.charCodeAt(0) < 32)
  )
    throw new Error(`${label} inválido.`);
  return value.trim();
}
export function id(value: unknown): string {
  const result = text(value, "Identificador", 80);
  if (!/^[a-zA-Z0-9-]+$/.test(result))
    throw new Error("Identificador inválido.");
  return result;
}
export function number(
  value: unknown,
  min: number,
  max: number,
  integer = true,
): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < min ||
    value > max ||
    (integer && !Number.isInteger(value))
  )
    throw new Error(`Número deve estar entre ${min} e ${max}.`);
  return value;
}
export function newProject(value: unknown): NewProject {
  const p = record(value);
  if (p.visualPreset !== undefined && p.visualPreset !== LIVE_PRESET && p.visualPreset !== NARRATED_PRESET) throw new Error('Preset visual inválido.');
  if (p.visualPreset === NARRATED_PRESET && (p.width !== 1080 || p.height !== 1920 || p.fps !== 30))
    throw new Error('Narrado ClipRush exige 1080×1920 a 30 FPS.');
  if (p.visualPreset === LIVE_PRESET && (p.width !== 1080 || p.height !== 1920 || p.fps !== 30))
    throw new Error('Corte de Live - ClipRush exige 1080×1920 a 30 FPS.');
  return {
    name: text(p.name, "Nome"),
    channelId: id(p.channelId),
    language: text(p.language, "Idioma", 35),
    category: text(p.category, "Categoria", 80),
    width: number(p.width, 128, 7680),
    height: number(p.height, 128, 7680),
    fps: number(p.fps, 1, 120),
    durationInFrames: number(p.durationInFrames, 1, 2_592_000),
    type: projectType(p.type),
    ...(p.visualPreset === undefined ? {} : {visualPreset: p.visualPreset as Project['visualPreset']}),
  };
}
export function project(value: unknown): Project {
  const p = record(value);
  if (p.schemaVersion !== 1 && p.schemaVersion !== 2)
    throw new Error(
      "Versão de projeto não suportada; o arquivo original foi preservado.",
    );
  const settings = newProject(p);
  if (
    !Array.isArray(p.assets) ||
    p.assets.length > 10000 ||
    !Array.isArray(p.clips) ||
    p.clips.length > 10000
  )
    throw new Error("Lista de mídias ou clipes inválida.");
  const assets = p.assets.map((item) => {
    const a = record(item);
    if (
      !["image", "video", "audio", "caption"].includes(String(a.kind)) ||
      !["copy", "reference"].includes(String(a.mode))
    )
      throw new Error("Tipo de mídia inválido.");
    if (typeof a.hash !== "string" || !/^[a-f0-9]{64}$/.test(a.hash))
      throw new Error("Hash de mídia inválido.");
    return {
      id: id(a.id),
      name: text(a.name, "Arquivo", 255),
      kind: a.kind,
      mode: a.mode,
      path: text(a.path, "Caminho", 4096),
      hash: a.hash,
      bytes: number(a.bytes, 0, Number.MAX_SAFE_INTEGER),
      ...(a.width === undefined ? {} : { width: number(a.width, 1, 100000) }),
      ...(a.height === undefined
        ? {}
        : { height: number(a.height, 1, 100000) }),
      ...(a.duration === undefined
        ? {}
        : { duration: number(a.duration, 0.001, 86400, false) }),
      ...(a.thumbnail === undefined
        ? {}
        : { thumbnail: text(a.thumbnail, "Miniatura", 4096) }),
      ...(a.role === undefined ? {} : { role: mediaRole(a.role) }),
      ...(a.category === undefined ? {} : { category: text(a.category, "Categoria", 80) }),
    } as Project["assets"][number];
  });
  if (new Set(assets.map((a) => a.id)).size !== assets.length)
    throw new Error("Identificadores de mídia repetidos.");
  const clips = p.clips.map((item) => {
    const c = record(item);
    const assetId = id(c.assetId);
    if (!assets.some((a) => a.id === assetId && a.kind !== "caption"))
      throw new Error("Clipe sem mídia compatível.");
    const from = number(c.from, 0, settings.durationInFrames - 1);
    return {
      id: id(c.id),
      assetId,
      from,
      durationInFrames: number(
        c.durationInFrames,
        1,
        settings.durationInFrames - from,
      ),
      volume: number(c.volume, 0, 2, false),
      ...(c.trimBefore === undefined ? {} : { trimBefore: number(c.trimBefore, 0, 2_592_000) }),
      ...(c.animation === undefined ? {} : { animation: clipAnimation(c.animation) }),
      ...(c.narratedFraming === undefined ? {} : {narratedFraming: (() => {
        const framing = c.narratedFraming as NarratedFraming;
        assertNarratedFraming(framing);
        return framing;
      })()}),
      ...(c.liveFraming === undefined ? {} : {liveFraming: (() => {
        const framing = c.liveFraming as LiveFraming;
        assertLiveFraming(framing);
        return framing;
      })()}),
    };
  });
  if (new Set(clips.map((c) => c.id)).size !== clips.length)
    throw new Error("Identificadores de clipe repetidos.");
  const createdAt = text(p.createdAt, "Data", 40);
  const updatedAt = text(p.updatedAt, "Data", 40);
  if (
    !Number.isFinite(Date.parse(createdAt)) ||
    !Number.isFinite(Date.parse(updatedAt)) ||
    typeof p.archived !== "boolean"
  )
    throw new Error("Metadados de projeto inválidos.");
  return {
    ...settings,
    schemaVersion: 2,
    id: id(p.id),
    revision: number(p.revision, 0, Number.MAX_SAFE_INTEGER),
    createdAt,
    updatedAt,
    archived: p.archived,
    assets,
    clips,
    type: projectType(p.type),
    scenes: (() => { if (p.scenes === undefined) return []; if (!Array.isArray(p.scenes) || p.scenes.length > 10000) throw new Error("Cenas inválidas."); const scenes = p.scenes.map((s) => scene(s, settings.durationInFrames)); if (new Set(scenes.map((s) => s.id)).size !== scenes.length) throw new Error("IDs de cenas repetidos."); return scenes; })(),
    captions: (() => { if (p.captions === undefined) return []; if (!Array.isArray(p.captions) || p.captions.length > 50000) throw new Error("Legendas inválidas."); return p.captions.map((item) => { const c = record(item); const startMs = number(c.startMs, 0, 86_400_000, false); if (typeof c.text !== "string" || c.text.length > 6000) throw new Error("Texto de legenda inválido."); return { text: c.text, startMs, endMs: number(c.endMs, startMs + 0.001, 86_400_000, false), timestampMs: null, confidence: null }; }); })(),
    exportSettings: p.exportSettings === undefined ? defaultRender({width: settings.width, height: settings.height, fps: settings.fps}) : renderSettings(p.exportSettings),
    ...(p.generation === undefined ? {} : { generation: generation(p.generation) }),
    ...(p.customCaption === undefined ? {} : {customCaption: multiline(p.customCaption, 300)}),
  };
}
function clipAnimation(value: unknown): "none" | "fade" | "zoom" {
  if (value !== "none" && value !== "fade" && value !== "zoom") throw new Error("Animação de clipe inválida.");
  return value;
}
function multiline(value: unknown, max: number): string {
  if (typeof value !== "string" || value.length > max || value.includes("\0")) throw new Error("Instruções inválidas ou muito extensas.");
  return value;
}
export function generation(value: unknown): import("./model").GenerationSettings {
  const g = record(value);
  if (!Array.isArray(g.references) || g.references.length > 20 || typeof g.autoRender !== "boolean") throw new Error("Referências inválidas.");
  const references = g.references.map((item) => {
    const ref = record(item);
    return { name: text(ref.name, "Referência", 255), content: multiline(ref.content, 100_000) };
  });
  if (references.reduce((sum, r) => sum + r.content.length, 0) > 300_000) throw new Error("Referências excedem 300 mil caracteres.");
  return {
    prompt: multiline(g.prompt, 30_000), references, autoRender: g.autoRender,
    ...(g.narrationScript === undefined ? {} : { narrationScript: multiline(g.narrationScript, 10_000) }),
    ...(g.narrationAssetId === undefined ? {} : { narrationAssetId: id(g.narrationAssetId) }),
    ...(g.model === undefined ? {} : { model: text(g.model, "Modelo", 160) }),
    ...(g.effort === undefined ? {} : { effort: text(g.effort, "Raciocínio", 40) }),
  };
}
export function mediaRole(value: unknown): import("./model").MediaRole {
  if (!["narration", "image", "video", "music", "sfx", "caption", "thumbnail"].includes(String(value))) throw new Error("Categoria de mídia inválida.");
  return value as import("./model").MediaRole;
}
