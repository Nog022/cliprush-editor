import type { Clip, Project } from "./model";
import { applyComposition, compositionSchema } from "./production";
import * as validate from "./validation";

const object = (properties: Record<string, unknown>) => ({
  type: "object", properties, required: Object.keys(properties), additionalProperties: false,
});
const strings = { type: "array", items: { type: "string" } };
const integer = { type: "integer" };
const boolean = { type: "boolean" };
// Reuse the renderer's contract; the plan is transient, never a new project format.
export const editorialSchema = object({
  durationInFrames: integer,
  requirements: object({ visualClips: integer, discontinuous: boolean, zoom: boolean, fade: boolean, captions: boolean }),
  catalogQueries: strings,
  errors: strings,
  limitations: { type: "array", items: object({
    code: { type: "string" }, detail: { type: "string" }, essential: boolean,
    resolution: { type: "string", enum: ["adapted", "omitted", "blocked"] },
  }) },
  highlights: { type: "array", items: object({ assetId: { type: "string" }, sceneIds: strings, confirmed: boolean }) },
  audioClips: compositionSchema.properties.clips,
  blocks: { type: "array", items: object({
    from: integer, durationInFrames: integer,
    narrationText: { type: "string" }, evidence: { type: "string" },
    clips: compositionSchema.properties.clips,
    scenes: compositionSchema.properties.scenes,
    captions: compositionSchema.properties.captions,
  }) },
});

function list(value: unknown, label: string): unknown[] {
  if (!Array.isArray(value) || value.length > 10000) throw new Error(`Plano: ${label} inválidos.`);
  return value;
}

export function catalogQueries(input: unknown): string[] {
  const p = validate.record(input);
  const queries = list(p.catalogQueries, "pedidos de catálogo");
  if (queries.length > 2) throw new Error("Plano: use no máximo duas buscas de cenas adicionais.");
  return queries.map(q => validate.text(q, "Busca de cena", 160));
}

export function narrationClips(project: Project): Clip[] {
  const selected = project.generation?.narrationAssetId;
  const audio = project.assets.filter(a => a.kind === "audio" && a.role !== "music" && a.role !== "sfx");
  const explicit = audio.filter(a => a.role === "narration" || /narra[cç][aã]o|narration|voice.?over/i.test(a.name));
  const assets = selected ? audio.filter(a => a.id === selected) : explicit.length ? explicit : audio.length === 1 ? audio : [];
  if (selected && !assets.length) throw new Error("Narração selecionada ausente. Restaure a produção ou gere novamente.");
  if (!assets.length && project.type === "narrated") throw new Error("Narração não identificada. Categorize a mídia como narração.");
  return assets.flatMap(asset => {
    if (asset.missing || !asset.duration) throw new Error(`Narração sem duração real ou ausente: ${asset.name}.`);
    const existing = project.clips.filter(c => c.assetId === asset.id);
    if (existing.length) return existing;
    return [{ id: `narration-${asset.id}`, assetId: asset.id, from: 0,
      durationInFrames: Math.ceil(asset.duration * project.fps), trimBefore: 0, volume: 1, animation: "none" as const }];
  });
}

// A small deterministic floor supplements the model's interpretation of the request.
// More complex editorial instructions remain explicit in requirements and blocks.
export function requestedEdits(prompt: string) {
  const text = prompt.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const wants = (term: string) => new RegExp(`\\b(?:${term})\\b`).test(text) &&
    !new RegExp(`(?:sem|nao (?:use|usar|inclua|incluir)|no|without)\\s+(?:\\w+\\s+){0,2}(?:${term})\\b`).test(text);
  const count = text.match(/\b(\d+|tres|three|dois|two)\s+(?:trechos|cenas|clipes|clips|shots|segments)\b/);
  const n = count ? ({ tres: 3, three: 3, dois: 2, two: 2 }[count[1]] ?? Number(count[1])) : 0;
  return { visualClips: n || (wants("cortes|cuts") ? 2 : 0),
    discontinuous: wants("descontinuos|discontinuous"), zoom: wants("zoom|zooms"),
    fade: wants("fade"), captions: wants("legendas|legenda|captions|subtitles") };
}

function covers(ranges: { from: number; durationInFrames: number }[], end: number) {
  let cursor = 0;
  for (const range of [...ranges].sort((a, b) => a.from - b.from)) {
    if (range.from > cursor) return false;
    cursor = Math.max(cursor, range.from + range.durationInFrames);
  }
  return cursor >= end;
}

/** Only explicit timed text is an alignment source; a model's prose is not one. */
export function timedText(project: Project): { text: string; startMs: number; endMs: number }[] {
  const result = [...project.captions];
  const visit = (value: unknown, depth = 0) => {
    if (depth > 5 || !value || typeof value !== "object") return;
    if (Array.isArray(value)) { value.forEach(v => visit(v, depth + 1)); return; }
    const r = value as Record<string, unknown>;
    if (typeof r.text === "string" && typeof r.startMs === "number" && typeof r.endMs === "number" &&
      Number.isFinite(r.startMs) && Number.isFinite(r.endMs) && r.startMs >= 0 && r.endMs > r.startMs)
      result.push({ text: r.text, startMs: r.startMs, endMs: r.endMs, timestampMs: null, confidence: null });
    else Object.values(r).forEach(v => visit(v, depth + 1));
  };
  for (const reference of project.generation?.references ?? []) {
    try { visit(JSON.parse(reference.content)); } catch { /* Text references can be SRT/VTT. */ }
    const cue = /(?:(\d{2}):)?(\d{2}):(\d{2})[,.](\d{3})\s*-->\s*(?:(\d{2}):)?(\d{2}):(\d{2})[,.](\d{3})[^\r\n]*\r?\n([^]*?)(?=\r?\n\s*\r?\n|$)/g;
    for (const m of reference.content.matchAll(cue)) {
      const ms = (i: number) => (Number(m[i] ?? 0) * 3600 + Number(m[i + 1]) * 60 + Number(m[i + 2])) * 1000 + Number(m[i + 3]);
      result.push({ text: m[9].replace(/\r?\n/g, " ").trim(), startMs: ms(1), endMs: ms(5), timestampMs: null, confidence: null });
    }
  }
  return result.filter(c => c.text.trim() && Number.isFinite(c.startMs) && Number.isFinite(c.endMs) && c.startMs >= 0 && c.endMs > c.startMs)
    .sort((a, b) => a.startMs - b.startMs)
    .filter((c, i, all) => !i || c.startMs !== all[i - 1].startMs || c.endMs !== all[i - 1].endMs || c.text !== all[i - 1].text);
}

/** Suggested blocks use measured word/cue boundaries, including silent margins. */
export function narrationBlocks(project: Project) {
  const clips = narrationClips(project);
  if (!clips.length) return [];
  const end = Math.max(...clips.map(c => c.from + c.durationInFrames));
  const cues = timedText(project);
  if (!cues.length) throw new Error("Narração sem alinhamento comprovado para planejar cortes sincronizados.");
  const groups: typeof cues[] = [];
  for (const cue of cues) {
    const group = groups.at(-1);
    if (!group || cue.endMs - group[0].startMs > 4000 || /[.!?]$/.test(group.at(-1)!.text.trim())) groups.push([cue]);
    else group.push(cue);
  }
  return groups.map((group, i) => {
    const from = i ? Math.round(group[0].startMs * project.fps / 1000) : 0;
    const to = i + 1 < groups.length ? Math.round(groups[i + 1][0].startMs * project.fps / 1000) : end;
    return { from, durationInFrames: to - from, narrationText: group.map(c => c.text).join(" "), evidence: "alinhamento temporal fornecido ou medido do áudio" };
  });
}

export function editorialLimitations(input: unknown): string[] {
  const p = validate.record(input);
  return list(p.limitations ?? [], "limitações").map(item => {
    const l = validate.record(item);
    const code = validate.text(l.code, "Código da limitação", 100);
    const detail = validate.text(l.detail, "Detalhe da limitação", 2000);
    if (typeof l.essential !== "boolean" || !["adapted", "omitted", "blocked"].includes(String(l.resolution)))
      throw new Error("Limitação editorial inválida.");
    if (l.essential && l.resolution !== "adapted")
      throw new Error(`Edição essencial indisponível: ${code}: ${detail}`);
    return `${code} (${l.resolution === "blocked" ? "omitted" : l.resolution}): ${detail}`;
  });
}

const normalizeSpeech = (text: string) => text.trim().replace(/\s+/g, " ").toLowerCase();

/** Captions are compiled from measured cues, never from model-supplied times. */
function alignedBlockCaptions(
  alignment: ReturnType<typeof timedText>,
  blocks: { from: number; durationInFrames: number; narrationText: string; captions: unknown[] }[],
  fps: number, enabled: boolean,
) {
  const tolerance = 500 / fps + 0.01; // nearest-frame rounding, not speech drift
  let cursor = 0;
  for (const b of [...blocks].sort((a, b) => a.from - b.from)) {
    if (b.from !== cursor) throw new Error("Blocos de narração devem ser contíguos e não podem sobrepor fala.");
    cursor = b.from + b.durationInFrames;
  }
  const tokens = alignment.flatMap((cue, index) => normalizeSpeech(cue.text).split(" ").map(text => ({ text, index })));
  return blocks.map(b => {
    const start = b.from * 1000 / fps, end = (b.from + b.durationInFrames) * 1000 / fps;
    const indices = new Set(alignment.flatMap((c, i) =>
      (c.startMs + c.endMs) / 2 >= start && (c.startMs + c.endMs) / 2 < end ? [i] : []));
    const cues = alignment.filter((_, i) => indices.has(i));
    if (cues.some(c => c.startMs < start - tolerance || c.endMs > end + tolerance) ||
      normalizeSpeech(cues.map(c => c.text).join(" ")) !== normalizeSpeech(b.narrationText))
      throw new Error(`Bloco de narração não corresponde ao alinhamento comprovado [${start}, ${end}] ms; preserve texto e cortes nos tempos reais da fala.`);
    for (const raw of b.captions) {
      const caption = validate.record(raw);
      const text = validate.text(caption.text, "Texto da legenda", 10000);
      const words = normalizeSpeech(text).split(" ");
      // A phrase may cross blocks only when its contiguous words exist in the alignment
      // and include speech assigned to this block. No text or word timings are inferred.
      const matches = tokens.some((_, i) => words.every((word, j) => tokens[i + j]?.text === word) &&
        tokens.slice(i, i + words.length).some(t => indices.has(t.index)));
      if (!matches) throw new Error(`Legenda não corresponde ao alinhamento comprovado do bloco [${start}, ${end}] ms: ${text}`);
    }
    const captions: { text: string; startMs: number; endMs: number }[] = [];
    if (enabled) for (const cue of cues) {
      const startMs = Math.max(start, cue.startMs), endMs = Math.min(end, cue.endMs);
      const last = captions.at(-1);
      if (last && cue.startMs - last.endMs < 400 && endMs - last.startMs <= 2500 &&
        last.text.length + cue.text.trim().length < 60 && !/[.!?]$/.test(last.text)) {
        last.text += ` ${cue.text.trim()}`;
        last.endMs = endMs;
      } else captions.push({ text: cue.text.trim(), startMs, endMs });
    }
    return captions;
  });
}

export function compileEditorialPlan(previous: Project, input: unknown, inspectedAssets: string[] = []): Project {
  const plan = validate.record(input);
  editorialLimitations(plan);
  const omittedScenes = new Set<string>();
  for (const item of list(plan.highlights ?? [], "destaques visuais")) {
    const h = validate.record(item);
    const assetId = validate.text(h.assetId, "Mídia do destaque", 200);
    const ids = list(h.sceneIds, "cenas de destaque").map(id => validate.text(id, "Cena de destaque", 200));
    if (!inspectedAssets.includes(assetId) || h.confirmed !== true) ids.forEach(id => omittedScenes.add(id));
  }
  if (catalogQueries(plan).length) throw new Error("Plano ainda solicita cenas adicionais.");
  const errors = list(plan.errors, "erros");
  if (errors.length) throw new Error(`Planejamento incompleto: ${errors.map(e => validate.text(e, "Erro", 2000)).join("; ")}`);
  const duration = validate.number(plan.durationInFrames, 1, 2_592_000);
  const blocks = list(plan.blocks, "blocos").map(item => {
    const b = validate.record(item);
    const from = validate.number(b.from, 0, duration - 1);
    const length = validate.number(b.durationInFrames, 1, duration - from);
    if (typeof b.narrationText !== "string") throw new Error("Plano sem texto do bloco de narração.");
    validate.text(b.evidence, "Evidência dos timestamps", 4000);
    return { ...b, from, durationInFrames: length, narrationText: b.narrationText,
      clips: list(b.clips, "clipes"), scenes: list(b.scenes, "cenas").filter(s => !omittedScenes.has(String(validate.record(s).id))), captions: list(b.captions, "legendas") };
  });
  if (!blocks.length || !covers(blocks, duration)) throw new Error("Plano sem blocos cobrindo toda a duração.");
  const narration = narrationClips(previous);
  const alignment = timedText(previous);
  if (narration.length) {
    if (!alignment.length) throw new Error("Narração sem alinhamento comprovado para os blocos, mesmo sem legendas.");
    const enabled = requestedEdits(previous.generation?.prompt ?? "").captions ||
      validate.record(plan.requirements).captions === true || blocks.some(b => b.captions.length > 0);
    const captions = alignedBlockCaptions(alignment, blocks, previous.fps, enabled);
    blocks.forEach((b, i) => { b.captions = captions[i]; });
  }
  const audio = list(plan.audioClips, "clipes de áudio");
  const project = applyComposition(previous, {
    durationInFrames: duration,
    clips: [...narration, ...audio, ...blocks.flatMap(b => b.clips)],
    scenes: blocks.flatMap(b => b.scenes), captions: blocks.flatMap(b => b.captions),
  });
  if (audio.some(c => previous.assets.find(a => a.id === validate.record(c).assetId)?.kind !== "audio"))
    throw new Error("Plano: audioClips aceita somente áudio.");
  const narrationIds = new Set(narration.map(c => c.assetId));
  if (audio.some(c => narrationIds.has(String(validate.record(c).assetId))) || blocks.some(b => b.clips.some(c => narrationIds.has(String(validate.record(c).assetId)))))
    throw new Error("Plano duplicou a narração; ela é preservada automaticamente.");
  for (const block of blocks) {
    const end = block.from + block.durationInFrames;
    for (const raw of [...block.clips, ...block.scenes]) {
      const c = validate.record(raw);
      if (Number(c.from) < block.from || Number(c.from) + Number(c.durationInFrames) > end)
        throw new Error("Trecho fora do bloco de narração planejado.");
      const asset = previous.assets.find(a => a.id === c.assetId);
      if (asset && (asset.kind === "audio" || (asset.kind === "video" && !asset.duration)))
        throw new Error("Bloco visual exige mídia visual com duração conhecida.");
    }
    for (const raw of block.captions) {
      const c = validate.record(raw);
      if (Number(c.startMs) < block.from / project.fps * 1000 - 0.01 || Number(c.endMs) > end / project.fps * 1000 + 0.01)
        throw new Error("Legenda fora do bloco de fala.");
      if (!String(c.text).trim() || !block.narrationText.toLowerCase().includes(String(c.text).trim().toLowerCase()))
        throw new Error("Legenda não corresponde ao texto informado no bloco de fala.");
    }
  }
  if (narration.length) {
    const end = Math.max(...narration.map(c => c.from + c.durationInFrames));
    if (duration !== end) throw new Error(`Duração deve acompanhar a narração preservada: ${end} quadros.`);
    if (narration.some(c => c.volume <= 0)) throw new Error("Narração está silenciada.");
    if (!project.exportSettings.audio && previous.generation?.autoRender) throw new Error("Ative áudio na exportação para preservar a narração.");
    for (const caption of project.captions) {
      const from = caption.startMs * project.fps / 1000;
      const to = caption.endMs * project.fps / 1000;
      const audible = narration.map(c => ({ from: Math.max(0, c.from - from), durationInFrames: Math.max(0, c.from + c.durationInFrames - Math.max(from, c.from)) }))
        .filter(c => c.durationInFrames > 0);
      if (!covers(audible, to - from)) throw new Error("Legenda fora do intervalo audível da narração preservada.");
    }
  }
  const visuals = project.clips.filter(c => previous.assets.find(a => a.id === c.assetId)?.kind !== "audio");
  if (!covers([...visuals, ...project.scenes], duration)) throw new Error("Cobertura visual incompleta: há lacunas na montagem.");
  const requested = requestedEdits(previous.generation?.prompt ?? "");
  const r = validate.record(plan.requirements);
  const minimum = Math.max(requested.visualClips, validate.number(r.visualClips, 0, 10000));
  for (const field of ["discontinuous", "zoom", "fade", "captions"] as const)
    if (typeof r[field] !== "boolean") throw new Error(`Plano: requisito ${field} inválido.`);
  if (visuals.length < minimum) throw new Error(`Edição insuficiente: exigidos ${minimum} trechos visuais; recebidos ${visuals.length}.`);
  if (requested.discontinuous || r.discontinuous) {
    const sorted = [...visuals].sort((a, b) => a.from - b.from);
    if (sorted.length < 2 || sorted.some((c, i) => i > 0 && (
      c.from < sorted[i - 1].from + sorted[i - 1].durationInFrames ||
      (c.assetId === sorted[i - 1].assetId && (
        Math.abs((c.trimBefore ?? 0) - ((sorted[i - 1].trimBefore ?? 0) + sorted[i - 1].durationInFrames)) <= 1 ||
        ((c.trimBefore ?? 0) < (sorted[i - 1].trimBefore ?? 0) + sorted[i - 1].durationInFrames &&
          (c.trimBefore ?? 0) + c.durationInFrames > (sorted[i - 1].trimBefore ?? 0)))))))
      throw new Error("Cortes descontínuos solicitados não estão presentes.");
  }
  for (const effect of ["zoom", "fade"] as const)
    if ((requested[effect] || r[effect]) && !visuals.some(c => c.animation === effect && c.durationInFrames > 1) && !project.scenes.some(s => s.animation === effect && s.durationInFrames > 1 && !visuals.some(c => c.from < s.from + s.durationInFrames && c.from + c.durationInFrames > s.from)))
      throw new Error(`Efeito solicitado ausente: ${effect}.`);
  if ((requested.captions || r.captions) && (!project.captions.length || (previous.generation?.autoRender && !project.exportSettings.captions)))
    throw new Error("Legendas temporizadas solicitadas ausentes ou desativadas na exportação.");
  if (narration.length) {
    const sorted = [...visuals].sort((a, b) => a.from - b.from);
    const edited = sorted.some((c, i) => i > 0 && (
      c.assetId !== sorted[i - 1].assetId ||
      Math.abs((c.trimBefore ?? 0) - ((sorted[i - 1].trimBefore ?? 0) + sorted[i - 1].durationInFrames)) > 1 ||
      (c.animation !== sorted[i - 1].animation && (c.animation === "zoom" || sorted[i - 1].animation === "zoom"))
    ));
    if ((visuals.length && !edited) || (narrationBlocks(previous).length > 1 && visuals.length < 2))
      throw new Error("Edição insuficiente: a narração exige cortes visuais reais, não uma sobreposição integral.");
  }
  return project;
}
