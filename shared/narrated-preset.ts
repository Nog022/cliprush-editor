import type {Project} from './model';

export const NARRATED_PRESET = 'narrado-cliprush';
export interface CameraPoint {x: number; y: number; zoom: number}
export interface NarratedFraming {
  start: CameraPoint;
  end: CameraPoint;
  playbackRate: number;
}

export function assertNarratedFraming(value: NarratedFraming) {
  for (const point of [value?.start, value?.end]) {
    if (!point || ![point.x, point.y, point.zoom].every(Number.isFinite) ||
      point.x < 0 || point.x > 1 || point.y < 0 || point.y > 1 || point.zoom < 1 || point.zoom > 3)
      throw new Error('Enquadramento narrado inválido.');
  }
  if (!Number.isFinite(value.playbackRate) || value.playbackRate < 0.5 || value.playbackRate > 2)
    throw new Error('Velocidade narrada inválida.');
}

export function assertNarratedProjectReady(project: Project) {
  if (project.visualPreset !== NARRATED_PRESET) return;
  if (project.width !== 1080 || project.height !== 1920 || project.fps !== 30)
    throw new Error('Narrado ClipRush exige 1080×1920 a 30 FPS.');
  const visuals = project.clips.filter(c => project.assets.find(a => a.id === c.assetId)?.kind === 'video')
    .sort((a, b) => a.from - b.from);
  let cursor = 0;
  for (const clip of visuals) {
    const asset = project.assets.find(a => a.id === clip.assetId)!;
    if (!clip.narratedFraming || !asset.width || !asset.height || !asset.duration)
      throw new Error('Gameplay narrada exige enquadramento e metadados reais.');
    assertNarratedFraming(clip.narratedFraming);
    if (clip.from !== cursor) throw new Error('Gameplay narrada com lacuna ou sobreposição.');
    cursor += clip.durationInFrames;
    if ((clip.trimBefore ?? 0) + clip.durationInFrames * clip.narratedFraming.playbackRate >
      asset.duration * project.fps + 1)
      throw new Error('Gameplay narrada excede a mídia de origem.');
  }
  if (cursor !== project.durationInFrames) throw new Error('Gameplay narrada deve cobrir toda a narração.');
}
