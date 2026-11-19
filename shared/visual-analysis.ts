import {assertGameplayFocus} from './gameplay-focus';
export type DetectionStatus = "detected" | "uncertain" | "not_detected";
export interface Region { x: number; y: number; width: number; height: number }
export interface Detection {
  status: DetectionStatus;
  confidence: number;
  reasons: string[];
}
export interface VisualAnalysis {
  version: string;
  source: string;
  startMs: number;
  endMs: number;
  elapsedMs: number;
  sampledAtMs: number[];
  samplingComplete: boolean;
  faces: { atMs: number; regions: Region[]; confidences: number[] }[];
  person: Detection & { movement: "low" | "high" | "unknown" };
  webcam: Detection & { regions: Region[]; kind: "embedded" | "full_screen" | "unknown"; origin?: "manual" | "automatic" };
  gameplay: Detection & { regions: Region[]; overlays: Region[];
    focus?: Detection & {method: 'central-face'; samples: import('./gameplay-focus').FocusSample[]} };
  speech: Detection & { speakerMatched: false; intervals: { startMs: number; endMs: number }[] };
}
export interface AnalysisOptions {
  sampleEveryMs?: number;
  maxSamples?: number;
  timeoutMs?: number;
  maxDurationMs?: number;
  manualWebcamRegion?: Region | null;
  gameplayFocusRegion?: Region;
}
export function withManualWebcam(a: VisualAnalysis, r: Region): VisualAnalysis {
  if (!validRegion(r)) throw new Error("Região manual inválida.");
  const { x, y, width: w, height: h } = r;
  const regions = [
    { x: 0, y: 0, width: x, height: 1 },
    { x: x + w, y: 0, width: Math.max(0, 1 - x - w), height: 1 },
    { x, y: 0, width: w, height: y },
    { x, y: y + h, width: w, height: Math.max(0, 1 - y - h) },
  ].filter(r => r.width > 0 && r.height > 0);
  return { ...a, webcam: { status: "uncertain", confidence: 1, origin: "manual", kind: "embedded", regions: [r],
    reasons: ["Região definida manualmente. Confiança refere-se às coordenadas confirmadas pelo usuário.", "Identidade humana e locutor sem confirmação automática."] },
    gameplay: { ...a.gameplay, regions, overlays: [r] } };
}
export function validRegion(r: Region): boolean {
  return !!r && [r.x, r.y, r.width, r.height].every(Number.isFinite) &&
    r.x >= 0 && r.y >= 0 && r.width > 0 && r.height > 0 &&
    r.x + r.width <= 1 && r.y + r.height <= 1;
}
/** Validate both cached data and subprocess output before exposing coordinates. */
export function visualAnalysis(value: unknown): VisualAnalysis {
  const a = value as VisualAnalysis;
  if (!a || typeof a.source !== "string" || typeof a.version !== "string" ||
    !Number.isFinite(a.startMs) || !Number.isFinite(a.endMs) || a.startMs < 0 || a.endMs <= a.startMs ||
    !Number.isFinite(a.elapsedMs) || a.elapsedMs < 0 ||
    typeof a.samplingComplete !== "boolean" || !Array.isArray(a.sampledAtMs) || a.sampledAtMs.length > 120 ||
    !a.sampledAtMs.every(t => Number.isFinite(t) && t >= a.startMs && t < a.endMs))
    throw new Error("Análise visual inválida.");
  for (const d of [a.person, a.webcam, a.gameplay, a.speech]) {
    if (!d || !["detected", "uncertain", "not_detected"].includes(d.status) ||
      !Number.isFinite(d.confidence) || d.confidence < 0 || d.confidence > 1 ||
      !Array.isArray(d.reasons) || !d.reasons.every(r => typeof r === "string"))
      throw new Error("Detecção inválida.");
  }
  if (a.gameplay.focus) {
    const f = a.gameplay.focus;
    if (f.method !== 'central-face' || !Array.isArray(f.samples) || !['detected', 'uncertain', 'not_detected'].includes(f.status) ||
        !Number.isFinite(f.confidence) || f.confidence < 0 || f.confidence > 1 || !Array.isArray(f.reasons) ||
        !f.reasons.every(r => typeof r === 'string')) throw new Error('Detecção de foco inválida.');
    assertGameplayFocus({mode: 'auto', x: .5, y: .6, zoom: 1.25, samples: f.samples});
    if (f.samples.some(s => !a.sampledAtMs.includes(s.atMs))) throw new Error('Tempo de foco fora da análise.');
  }
  if (!Array.isArray(a.faces) || a.faces.length > 120 || !a.faces.every(f =>
    a.sampledAtMs.includes(f.atMs) && Array.isArray(f.regions) && f.regions.length <= 20 && f.regions.every(validRegion) &&
    Array.isArray(f.confidences) && f.confidences.length === f.regions.length &&
    f.confidences.every(c => Number.isFinite(c) && c >= 0 && c <= 1)) ||
    !["low", "high", "unknown"].includes(a.person.movement) ||
    !["embedded", "full_screen", "unknown"].includes(a.webcam.kind) ||
    ![a.webcam.regions, a.gameplay.regions, a.gameplay.overlays].every(rs =>
      Array.isArray(rs) && rs.length <= 20 && rs.every(validRegion)) ||
    a.speech.speakerMatched !== false || !Array.isArray(a.speech.intervals) ||
    !a.speech.intervals.every(i => Number.isFinite(i.startMs) && Number.isFinite(i.endMs) &&
      i.startMs >= a.startMs && i.endMs <= a.endMs && i.endMs > i.startMs))
    throw new Error("Regiões ou tempos inválidos.");
  return a;
}
