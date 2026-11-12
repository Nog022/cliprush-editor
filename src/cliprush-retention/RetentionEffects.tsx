/**
 * Componentes demonstrativos Remotion 4 / React 19 (sem alterações no projeto real).
 * Integrar por Codex à arquitetura existente, preferindo componentes já presentes.
 * `visualTargetAfterCrop` é relativo ao CANVAS renderizado após fit/crop, não ao arquivo bruto.
 * Animações determinísticas por frame; nenhuma coordenada é inferida automaticamente.
 */
import React from 'react';
import {AbsoluteFill, Img, interpolate, Easing, useCurrentFrame} from 'remotion';

export type Point = {x: number; y: number};
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
const motion = (frame: number, from: number, duration: number) =>
  interpolate(frame, [from, from + Math.max(1, duration)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });

/** Aplica zoom direcionado. Use sobre conteúdo que ocupa exatamente o canvas da composição. */
export const FocusZoom: React.FC<{
  children: React.ReactNode;
  target: Point;
  startFrame?: number;
  durationFrames?: number;
  scale?: number;
  releaseFrame?: number;
}> = ({children, target, startFrame = 0, durationFrames = 9, scale = 1.24, releaseFrame}) => {
  const f = useCurrentFrame();
  const t = motion(f, startFrame, durationFrames);
  const out = releaseFrame === undefined ? 1 : (1 - motion(f, releaseFrame, durationFrames));
  const zoom = 1 + (Math.max(1, scale) - 1) * t * out;
  const x = clamp(target.x, 0, 1);
  const y = clamp(target.y, 0, 1);
  const dx = (zoom - 1) * (0.5 - x) * 100;
  const dy = (zoom - 1) * (0.5 - y) * 100;
  return <AbsoluteFill style={{overflow: 'hidden'}}>
    <AbsoluteFill style={{transform: `translate(${dx}%, ${dy}%) scale(${zoom})`, transformOrigin: 'center center'}}>
      {children}
    </AbsoluteFill>
  </AbsoluteFill>;
};

/** Círculo sobre o detalhe, com posição normalizada ao canvas. */
export const FocusMarker: React.FC<{
  target: Point;
  startFrame: number;
  endFrame: number;
  radius?: number;
  color?: string;
}> = ({target, startFrame, endFrame, radius = 0.07, color = '#FFD230'}) => {
  const f = useCurrentFrame();
  if (f < startFrame || f > endFrame) return null;
  const opacity = Math.min(motion(f, startFrame, 5), 1 - motion(f, endFrame - 5, 5));
  const pulse = 1 + 0.06 * Math.sin((f - startFrame) * 0.38);
  return <AbsoluteFill style={{pointerEvents: 'none', opacity}}>
    <svg width="100%" height="100%" viewBox="0 0 1000 1000" preserveAspectRatio="none">
      <ellipse cx={clamp(target.x, 0, 1) * 1000} cy={clamp(target.y, 0, 1) * 1000}
        rx={clamp(radius, 0.01, 0.3) * 1000 * pulse} ry={clamp(radius, 0.01, 0.3) * 1000 * pulse * (1080 / 1920)}
        fill="none" stroke={color} strokeWidth={7} />
    </svg>
  </AbsoluteFill>;
};

export type CaptionCue = {startFrame: number; endFrame: number; text: string; highlight?: string};
/** Cada bloco deve idealmente ter 2–6 palavras e até duas linhas. */
export const SyncedCaptions: React.FC<{
  cues: CaptionCue[];
  color?: string;
  bottom?: number;
}> = ({cues, color = '#FFD230', bottom = 270}) => {
  const f = useCurrentFrame();
  const cue = cues.find((c) => f >= c.startFrame && f < c.endFrame);
  if (!cue) return null;
  const opacity = motion(f, cue.startFrame, 5);
  const pos = cue.highlight ? cue.text.toLocaleLowerCase().indexOf(cue.highlight.toLocaleLowerCase()) : -1;
  const before = pos >= 0 ? cue.text.slice(0, pos) : cue.text;
  const marked = pos >= 0 && cue.highlight ? cue.text.slice(pos, pos + cue.highlight.length) : '';
  const after = pos >= 0 && cue.highlight ? cue.text.slice(pos + cue.highlight.length) : '';
  return <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', pointerEvents: 'none', paddingBottom: bottom}}>
    <div style={{maxWidth: '84%', textAlign: 'center', color: 'white', opacity, transform: `translateY(${(1 - opacity) * 12}px)`,
      fontSize: 60, fontWeight: 900, lineHeight: 1.12, textTransform: 'uppercase',
      textShadow: '0 4px 12px #000, 0 0 5px #000', overflowWrap: 'anywhere'}}>
      {before}{marked ? <span style={{color}}>{marked}</span> : null}{after}
    </div>
  </AbsoluteFill>;
};

/** Comparação rotulada: asset real ou imagem de referência, nunca inventar fonte. */
export const ComparisonOverlay: React.FC<{
  leftSrc: string;
  rightSrc: string;
  leftLabel: string;
  rightLabel: string;
}> = ({leftSrc, rightSrc, leftLabel, rightLabel}) => <AbsoluteFill style={{
  flexDirection: 'row', gap: 12, alignItems: 'center', padding: '0 42px', justifyContent: 'center',
  background: 'rgba(0,0,0,0.82)',
}}>
  {([[leftSrc, leftLabel], [rightSrc, rightLabel]] as const).map(([src, label], idx) =>
    <div key={idx} style={{width: '49%', display: 'flex', flexDirection: 'column', gap: 18}}>
      <Img src={src} style={{width: '100%', height: 480, objectFit: 'contain', background: '#161616', borderRadius: 20}} />
      <div style={{textAlign: 'center', fontWeight: 850, fontSize: 36, color: 'white'}}>{label}</div>
    </div>
  )}
</AbsoluteFill>;

/** Informações visualmente estruturadas, não um HUD decorativo. */
export const ExplainerHUD: React.FC<{
  title: string;
  value: string;
  subtitle?: string;
  progress?: number;
  status?: 'locked' | 'available' | 'neutral';
}> = ({title, value, subtitle, progress, status = 'neutral'}) => <AbsoluteFill style={{
  alignItems: 'center', justifyContent: 'center', padding: 65, pointerEvents: 'none',
}}>
  <div style={{width: '100%', background: 'rgba(14,15,25,0.94)', color: 'white', borderRadius: 28,
    padding: 45, boxShadow: '0 20px 90px #0008', border: '2px solid #7B4BB2'}}>
    <div style={{fontSize: 36, color: '#D1B0FF', marginBottom: 18}}>{title}</div>
    <div style={{fontSize: 76, fontWeight: 900}}>{status === 'locked' ? '🔒 ' : status === 'available' ? '✓ ' : ''}{value}</div>
    {typeof progress === 'number' ? <div style={{width: '100%', height: 28, background: '#38354B', borderRadius: 22, overflow: 'hidden', marginTop: 26}}>
      <div style={{height: '100%', width: `${clamp(progress, 0, 1) * 100}%`, background: '#B36BFF'}} />
    </div> : null}
    {subtitle ? <div style={{fontSize: 30, color: '#E0DAEA', marginTop: 22}}>{subtitle}</div> : null}
  </div>
</AbsoluteFill>;

/** Captura de fonte verdadeira já salva no projeto, com data/crédito verificáveis. */
export const SourceProof: React.FC<{
  screenshotSrc: string;
  sourceName: string;
  publishedAt: string;
}> = ({screenshotSrc, sourceName, publishedAt}) => <AbsoluteFill style={{
  justifyContent: 'center', alignItems: 'center', padding: 65, background: 'rgba(0,0,0,0.88)',
}}>
  <Img src={screenshotSrc} style={{width: '100%', maxHeight: 1120, objectFit: 'contain', borderRadius: 16}} />
  <div style={{fontSize: 30, color: 'white', marginTop: 26, textAlign: 'center'}}>{sourceName} • {publishedAt}</div>
</AbsoluteFill>;

export const ContextualCTA: React.FC<{text: string}> = ({text}) => {
  const f = useCurrentFrame();
  const alpha = motion(f, 0, 6);
  return <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 320, pointerEvents: 'none'}}>
    <div style={{fontSize: 52, color: 'white', fontWeight: 800, maxWidth: '85%', textAlign: 'center',
      padding: '22px 30px', background: 'rgba(29,14,48,0.9)', borderRadius: 20, opacity: alpha}}>
      {text}
    </div>
  </AbsoluteFill>;
};
