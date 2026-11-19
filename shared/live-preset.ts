import type {Asset, Clip, Project} from './model';
import type {VisualAnalysis} from './visual-analysis';
import {assertGameplayFocus, type GameplayFocus} from './gameplay-focus';
import {assertRegion, coverRegion, intersects, type Region, type SourceSize} from '../src/templates/webcam_top_gameplay_bottom/geometry';

export const LIVE_PRESET = 'corte-live-cliprush' as const;
export const liveSourceKeys = (clipId: string) => ({video: `live-video:${clipId}`, audio: `live-audio:${clipId}`});
export const LIVE_LAYOUT = {
  webcam: {x: 145, y: 145, width: 790, height: 390},
  gameplay: {x: 20, y: 595, width: 1040, height: 865},
  caption: {x: 50, y: 1510, width: 980, height: 115},
};
export interface LiveFraming {
  sourceSize: SourceSize;
  webcamRegion: Region;
  gameplayRegion: Region;
  webcamFocus?: {x: number; y: number};
  gameplayFocus?: GameplayFocus;
  startFrame: number;
  durationInFrames: number;
  fps: number;
}

/** Adapt the existing detector's normalized rectangles to the existing crop component. */
export function framingFromAnalysis(analysis: VisualAnalysis, asset: Asset, clip: Clip, project: Project): LiveFraming {
  const sourceSize = {width: asset.width ?? 0, height: asset.height ?? 0};
  if (!analysis.samplingComplete || analysis.startMs !== (clip.trimBefore ?? 0) * 1000 / project.fps ||
      analysis.endMs !== ((clip.trimBefore ?? 0) + clip.durationInFrames) * 1000 / project.fps) {
    throw new Error('Analise novamente o trecho atual antes de aplicar.');
  }
  const pixels = (r: VisualAnalysis['webcam']['regions'][number]): Region => ({
    x: r.x * sourceSize.width, y: r.y * sourceSize.height,
    w: r.width * sourceSize.width, h: r.height * sourceSize.height,
  });
  const webcam = analysis.webcam.regions[0];
  if (!webcam) throw new Error('Webcam não identificada. Confirme uma região manual na análise.');
  const webcamRegion = pixels(webcam);
  assertRegion(webcamRegion, sourceSize);
  const gameplayRegion = analysis.gameplay.regions.map(pixels)
    .filter(r => r.w > 0 && r.h > 0 && !intersects(r, webcamRegion))
    .sort((a, b) => b.w * b.h - a.w * a.h)[0];
  if (!gameplayRegion) throw new Error('Gameplay sem região independente da webcam.');
  assertRegion(gameplayRegion, sourceSize);
  const centers = analysis.faces.flatMap(f => f.regions.map(pixels))
    .map(r => ({x: r.x + r.w / 2, y: r.y + r.h / 2}))
    .filter(p => p.x >= webcamRegion.x && p.x <= webcamRegion.x + webcamRegion.w &&
      p.y >= webcamRegion.y && p.y <= webcamRegion.y + webcamRegion.h);
  const median = (values: number[]) => values.sort((a, b) => a - b)[Math.floor(values.length / 2)];
  const webcamFocus = centers.length ? {x: median(centers.map(p => p.x)), y: median(centers.map(p => p.y))} : undefined;
  return {sourceSize, webcamRegion, gameplayRegion, webcamFocus, startFrame: clip.trimBefore ?? 0,
    durationInFrames: clip.durationInFrames, fps: project.fps};
}

export function assertLiveFraming(f: LiveFraming) {
  if (!f || !f.sourceSize || !f.webcamRegion || !f.gameplayRegion) throw new Error('Enquadramento de live inválido.');
  assertRegion(f.webcamRegion, f.sourceSize);
  assertRegion(f.gameplayRegion, f.sourceSize);
  if (f.gameplayFocus !== undefined) assertGameplayFocus(f.gameplayFocus);
  coverRegion(f.webcamRegion, LIVE_LAYOUT.webcam.width, LIVE_LAYOUT.webcam.height, f.webcamFocus);
  if (intersects(f.webcamRegion, f.gameplayRegion)) throw new Error('Gameplay sobrepõe webcam.');
  if (![f.startFrame, f.durationInFrames, f.fps].every(Number.isInteger) || f.startFrame < 0 ||
      f.durationInFrames < 1 || f.fps < 1 || f.fps > 120) throw new Error('Tempos de enquadramento inválidos.');
}

export function assertLiveProjectReady(project: Project, output: {width: number; height: number; fps: number} = project) {
  if (project.visualPreset !== LIVE_PRESET) return;
  if (output.width !== 1080 || output.height !== 1920 || output.fps !== 30)
    throw new Error('Exporte Corte de Live - ClipRush em 1080×1920 a 30 FPS.');
  for (const clip of project.clips.filter(c => project.assets.find(a => a.id === c.assetId)?.kind === 'video')) {
    const f = clip.liveFraming;
    if (!f || f.startFrame !== (clip.trimBefore ?? 0) || f.durationInFrames !== clip.durationInFrames || f.fps !== project.fps)
      throw new Error('Analise o trecho atual e aplique o enquadramento ao preset antes de exportar.');
    assertLiveFraming(f);
  }
}
