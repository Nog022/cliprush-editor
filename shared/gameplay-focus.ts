export interface FocusSample {atMs: number; x: number; y: number; confidence: number}
export interface GameplayFocus {
  mode: 'auto' | 'manual';
  x: number;
  y: number;
  zoom: number;
  samples?: FocusSample[];
}
export const DEFAULT_GAMEPLAY_FOCUS: GameplayFocus = {mode: 'auto', x: .5, y: .6, zoom: 1.25};

export function assertGameplayFocus(f: GameplayFocus) {
  if (!f || !['auto', 'manual'].includes(f.mode) || ![f.x, f.y, f.zoom].every(Number.isFinite) ||
      f.x < 0 || f.x > 1 || f.y < 0 || f.y > 1 || f.zoom < 1 || f.zoom > 3)
    throw new Error('Posição ou zoom do gameplay inválido.');
  if (f.samples !== undefined && (!Array.isArray(f.samples) || f.samples.length > 120 ||
      f.samples.some((s, i) => ![s.atMs, s.x, s.y, s.confidence].every(Number.isFinite) || s.atMs < 0 ||
        s.x < 0 || s.x > 1 || s.y < 0 || s.y > 1 || s.confidence < 0 || s.confidence > 1 ||
        (i > 0 && s.atMs <= f.samples![i - 1].atMs)))) throw new Error('Trajetória de foco inválida.');
}

/** Deterministic at any seek/render order: confidence gate, dead band, speed cap, smoothstep. */
export function gameplayFocusAt(f: GameplayFocus, milliseconds: number) {
  if (f.mode === 'manual') return {x: f.x, y: f.y};
  const observations = (f.samples ?? []).filter(s => s.confidence >= .8);
  if (observations.length < 3) return {x: f.x, y: f.y};
  const points = [{atMs: 0, x: f.x, y: f.y}];
  for (const s of observations) {
    const last = points[points.length - 1];
    // Ignore ambiguous jumps/cuts; never pan toward a newly appearing bystander.
    if (Math.hypot(s.x - last.x, s.y - last.y) > .25) continue;
    const atMs = Math.max(s.atMs, last.atMs + 1000);
    const dt = (atMs - last.atMs) / 1000;
    const limit = .025 * dt;
    const move = (delta: number) => Math.abs(delta) < .012 ? 0 : Math.max(-limit, Math.min(limit, delta));
    points.push({atMs, x: last.x + move(s.x - last.x), y: last.y + move(s.y - last.y)});
  }
  const end = points.findIndex(p => p.atMs >= milliseconds);
  if (end < 0) return points[points.length - 1];
  if (end === 0) return points[0];
  const a = points[end - 1], b = points[end];
  const t = Math.max(0, Math.min(1, (milliseconds - a.atMs) / (b.atMs - a.atMs)));
  const eased = t * t * (3 - 2 * t);
  return {x: a.x + (b.x - a.x) * eased, y: a.y + (b.y - a.y) * eased};
}
