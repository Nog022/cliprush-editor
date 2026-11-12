import React from 'react';
import {AbsoluteFill, Audio, Easing, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import type {Caption} from '@remotion/captions';
import captionPages from './captions.json';

const accent = '#ff4e63';
const background = '#090d15';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const smooth = {...clamp, easing: Easing.bezier(0.42, 0, 0.58, 1)};
const settle = {...clamp, easing: Easing.bezier(0.22, 1, 0.36, 1)};
const media = (clip: number) => staticFile(`videos/video-012/footage/corte-0${clip}-h264.mp4`);

// Source-relative tracking gives replays the same framing at the same instant.
const tracking: Record<number, {times: number[]; positions: number[]}> = {
  1: {times: [0, 2, 4.5, 6.4, 8.3, 9.8], positions: [20, 20, 18, 22, 29, 30]},
  2: {times: [0, 3.8, 5.3, 6.4, 7.167], positions: [50, 50, 43, 34, 34]},
  3: {times: [0, 4.86], positions: [50, 50]},
  4: {times: [0, 2.6, 4, 5.5, 6.8, 8.06], positions: [43, 38, 34, 34, 34, 33]},
  5: {times: [0, 2.2, 3.2, 4.8, 7.02], positions: [44, 43, 45, 47, 46]},
};

type ShotProps = {clip: number; from: number; start?: number; rate?: number; hud?: boolean; fade?: number; replay?: boolean};

// Main footage and inset always share source, trim and playback rate.
const Shot: React.FC<ShotProps> = ({clip, from, start = 0, rate = 1, hud = false, fade = 10, replay = false}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const sourceTime = start + frame / fps * rate;
  const path = tracking[clip];
  const videoProps = {src: media(clip), trimBefore: Math.round(start * fps), playbackRate: rate, muted: true};
  return <AbsoluteFill style={{opacity: fade ? interpolate(frame, [0, fade], [0, 1], smooth) : 1}}>
    <AbsoluteFill style={{background}} />
    <div style={{position: 'absolute', left: 0, right: 0, top: hud ? 620 : 390, height: clip === 1 ? 940 : hud ? 1080 : 1310, overflow: 'hidden'}}>
      <OffthreadVideo {...videoProps} style={{
        width: '100%', height: '100%', objectFit: 'cover',
        objectPosition: `${interpolate(sourceTime, path.times, path.positions, smooth)}% center`,
        transformOrigin: clip === 1 ? 'center bottom' : 'center center',
        scale: String(clip === 4
          ? interpolate(sourceTime, [0, 5.8, 6.6, 8.06], [1, 1.025, 1.045, 1.3], smooth)
          : interpolate(sourceTime, [0, 1.8, clip === 1 ? 9.8 : 7.2], [1, 1.035, 1.065], smooth)),
      }} />
      <AbsoluteFill style={{background: clip === 1 ? `linear-gradient(0deg, transparent 89%, ${background} 100%)` : `linear-gradient(0deg, ${background} 0%, transparent 20%, transparent 89%, ${background} 100%)`}} />
    </div>
    {hud ? <HUD {...videoProps} clip={clip} sourceTime={sourceTime} timelineFrame={from + frame} replay={replay} /> : null}
  </AbsoluteFill>;
};

type HUDProps = {src: string; trimBefore: number; playbackRate: number; clip: number; sourceTime: number; timelineFrame: number; replay: boolean};

// Open corner brackets stay outside the original glyphs. No fill over icons.
const Brackets: React.FC<{x: number; y: number; width: number; height: number; opacity: number}> = ({x, y, width, height, opacity}) => <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{position: 'absolute', left: x, top: y, overflow: 'visible', opacity}}>
  <path d={`M 18 2 H 8 Q 2 2 2 8 V 18 M ${width - 18} 2 H ${width - 8} Q ${width - 2} 2 ${width - 2} 8 V 18 M 2 ${height - 18} V ${height - 8} Q 2 ${height - 2} 8 ${height - 2} H 18 M ${width - 18} ${height - 2} H ${width - 8} Q ${width - 2} ${height - 2} ${width - 2} ${height - 8} V ${height - 18}`} fill="none" stroke={accent} strokeWidth={3} strokeLinecap="round" />
</svg>;

const HUD: React.FC<HUDProps> = ({src, trimBefore, playbackRate, clip, sourceTime, timelineFrame, replay}) => {
  const {fps} = useVideoConfig();
  const seconds = timelineFrame / fps;
  const clue = clip === 1
    ? seconds >= 14.65 ? 'ACOMPANHANTES' : seconds >= 13.88 ? 'CARRO' : seconds >= 12.94 ? 'ROUPA' : seconds >= 11.88 ? 'ROSTO' : ''
    : clip === 2 ? sourceTime < 182 / 30 ? 'ANTES · CARRO' : 'DEPOIS · A PÉ' : 'ESTRELAS VERMELHAS';
  return <div style={{position: 'absolute', left: 76, top: 390, width: 928, height: 300, border: '1px solid #ffffff35', borderRadius: 22, background: '#11151df5', boxShadow: '0 18px 60px #0007', overflow: 'hidden'}}>
    <div style={{position: 'absolute', left: 26, top: 20, color: '#c4cbd8', fontSize: 21, fontWeight: 700, letterSpacing: 2}}>{replay ? 'REPLAY · HUD ORIGINAL' : 'HUD ORIGINAL · AMPLIADO'}</div>
    <div style={{position: 'absolute', right: 26, top: 20, color: accent, fontSize: 22, fontWeight: 800}}>{clue}</div>
    <div style={{position: 'absolute', left: 118, top: 64, width: 690, height: 220, overflow: 'hidden'}}>
      <OffthreadVideo src={src} trimBefore={trimBefore} playbackRate={playbackRate} muted style={{position: 'absolute', width: 5376, height: 3024, maxWidth: 'none', left: -4676, top: -40}} />
      {clip === 1 ? <Brackets x={interpolate(seconds, [11.88, 12.16, 12.94, 13.2, 13.88, 14.13, 14.65, 14.98], [431, 431, 431, 336, 336, 526, 526, 241], smooth)} y={140} width={96} height={78} opacity={interpolate(seconds, [11.78, 11.96, 16.9, 17.1], [0, 1, 1, 0], smooth)} /> : null}
      {clip === 2 ? <>
        <Brackets x={526} y={140} width={96} height={78} opacity={interpolate(sourceTime, [0, 0.3, 5.94, 6.04], [0, 1, 1, 0], smooth)} />
        <Brackets x={333} y={140} width={289} height={78} opacity={interpolate(sourceTime, [6.12, 6.42], [0, 1], smooth)} />
      </> : null}
      {clip === 3 ? <Brackets x={180} y={35} width={460} height={101} opacity={interpolate(seconds, [25.45, 25.85], [0, 1], smooth)} /> : null}
    </div>
  </div>;
};

const chapters = [
  {from: 0, to: 157, chapter: '01 / A FUGA', title: 'Escapou… mas e as pistas?'},
  {from: 157, to: 515, chapter: '02 / O QUE O HUD MOSTRA', title: 'O que a polícia já sabe'},
  {from: 515, to: 730, chapter: '03 / OLHE O CANTO', title: 'O ícone do carro some'},
  {from: 730, to: 934, chapter: '04 / A BUSCA CONTINUA', title: 'Ainda procurados'},
  {from: 934, to: 1203, chapter: '05 / IDENTIFICAÇÃO', title: 'E o seu rosto?'},
  {from: 1203, to: 1414, chapter: '06 / OUTRAS PISTAS', title: 'Câmeras + testemunhas'},
  {from: 1414, to: 1492, chapter: '07 / APAGAR AS PISTAS', title: 'Não basta fugir'},
  {from: 1492, to: 1566, chapter: 'E VOCÊ?', title: 'Como você escaparia?'},
];

const Titles: React.FC = () => {
  const frame = useCurrentFrame();
  const item = chapters.find(chapter => frame >= chapter.from && frame < chapter.to)!;
  const local = frame - item.from;
  const duration = item.to - item.from;
  return <>
    <div style={{opacity: interpolate(local, [0, 7, duration - 6, duration], [item.from === 0 ? 1 : 0, 1, 1, 0], smooth), translate: `0 ${interpolate(local, [0, 10], [6, 0], settle)}px`}}>
      <div style={{position: 'absolute', top: 172, left: 76, right: 76, display: 'flex', alignItems: 'center', gap: 18, fontSize: 25, fontWeight: 800, letterSpacing: 4, color: accent}}><span style={{width: 36, height: 4, background: accent}} />{item.chapter}</div>
      <div style={{position: 'absolute', top: 225, left: 76, right: 76, color: '#fff', fontSize: 62, lineHeight: 1.08, fontWeight: 900, letterSpacing: -1.8}}>{item.title}</div>
    </div>
    {frame >= 1203 && frame < 1403 ? <div style={{position: 'absolute', left: 76, top: 356, fontSize: 22, color: '#bdc7d7'}}>Câmeras e testemunhas: interpretação do sistema</div> : null}
    {(frame >= 284 && frame < 515) || (frame >= 855 && frame < 924) || (frame >= 1403 && frame < 1492) ? <div style={{position: 'absolute', right: 76, top: 711, fontSize: 20, fontWeight: 700, letterSpacing: 2, color: '#d4dae5', background: '#090d15d9', padding: '7px 12px', borderRadius: 7}}>↻ REPLAY</div> : null}
    <div style={{position: 'absolute', left: 76, top: 1740, color: '#a7b2c5', fontSize: 21, letterSpacing: 2}}>GTA VI <span style={{color: accent, padding: '0 12px'}}> / </span> PISTAS DE IDENTIFICAÇÃO</div>
  </>;
};

// Preserve every word timestamp. End each page at the next page's first word,
// fixing the previous 100 ms overlap that delayed caption changes.
const pages = captionPages as Caption[][];
const keywords = /^(caçado|rosto|roupa|carro|veículo|desaparece|vermelhas|pistas)/i;
const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const ms = frame / fps * 1000;
  const page = pages.find((p, i) => ms >= p[0].startMs && ms < Math.min(pages[i + 1]?.[0].startMs ?? durationInFrames / fps * 1000, p[p.length - 1].endMs + 160));
  if (!page) return null;
  const age = ms - page[0].startMs;
  return <div style={{position: 'absolute', left: 66, right: 66, top: 1564, minHeight: 132, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', opacity: interpolate(age, [0, 100], [0.7, 1], settle), translate: `0 ${interpolate(age, [0, 170], [8, 0], settle)}px`}}>
    <div style={{maxWidth: '100%', boxSizing: 'border-box', padding: '18px 24px', borderRadius: 16, background: '#060a12ed', fontSize: 52, fontWeight: 800, lineHeight: 1.18, textShadow: '0 3px 8px #000', boxShadow: '0 8px 32px #0005', color: '#fff'}}>
      {page.map((word, i) => <React.Fragment key={word.startMs}><span style={{color: ms >= word.startMs && ms < word.endMs ? accent : '#fff', fontWeight: keywords.test(word.text.trim()) ? 900 : 800}}>{word.text.trim()}</span>{i < page.length - 1 ? ' ' : ''}</React.Fragment>)}
    </div>
  </div>;
};

const Soundtrack: React.FC = () => <>
  <Audio src={staticFile('videos/video-012/audio/narracao.mp3')} />
  <Audio src={staticFile('videos/video-012/audio/trilha-refinada-v002.wav')} volume={frame => interpolate(frame, [0, 45, 600, 660, 730, 780, 1414, 1492, 1565], [0, 0.65, 0.65, 0.8, 0.8, 0.65, 0.65, 0.45, 0], smooth)} />
  <Sequence name="Impacto / caçado" from={134} durationInFrames={24}><Audio src={staticFile('videos/video-012/audio/impacto-v002.wav')} volume={0.45} /></Sequence>
  {[356, 388, 416, 443].map(from => <Sequence key={from} name="Clique / pista" from={from} durationInFrames={9}><Audio src={staticFile('videos/video-012/audio/clique-v002.wav')} volume={0.32} /></Sequence>)}
  <Sequence name="Transição / saída do carro" from={515} durationInFrames={15}><Audio src={staticFile('videos/video-012/audio/transicao-v002.wav')} volume={0.3} /></Sequence>
  <Sequence name="Ícone removido na imagem original" from={697} durationInFrames={9}><Audio src={staticFile('videos/video-012/audio/clique-v002.wav')} volume={0.4} /></Sequence>
  <Sequence name="Tensão / estrelas vermelhas" from={771} durationInFrames={24}><Audio src={staticFile('videos/video-012/audio/impacto-v002.wav')} volume={0.28} /></Sequence>
  <Sequence name="Fecho / pistas" from={1470} durationInFrames={24}><Audio src={staticFile('videos/video-012/audio/impacto-v002.wav')} volume={0.34} /></Sequence>
</>;

export const ClipRush012: React.FC = () => <AbsoluteFill style={{background, fontFamily: 'Arial, sans-serif'}}>
  {/* Dissolves overlap moving footage inside the five exact source intervals.
      No additional source handles, frozen tails, shake or sudden scale resets. */}
  <Sequence name="01 • Jason / intervalo completo contínuo" durationInFrames={294}><Shot clip={1} from={0} hud fade={0} /></Sequence>
  <Sequence name="02 • Replay / pistas reais" from={284} durationInFrames={241}><Shot clip={1} from={284} hud replay /></Sequence>
  <Sequence name="03 • Lucia / saída contínua e HUD" from={515} durationInFrames={215}><Shot clip={2} from={515} hud /></Sequence>
  <Sequence name="04 • Estrelas / intervalo completo" from={720} durationInFrames={145}><Shot clip={3} from={720} hud /></Sequence>
  <Sequence name="05 • Replay / busca continua" from={855} durationInFrames={79}><Shot clip={3} from={855} start={66 / 30} hud replay /></Sequence>
  <Sequence name="06 • Lucia / tracking até a porta" from={924} durationInFrames={279}><Shot clip={4} from={924} rate={242 / 279} /></Sequence>
  {/* Cut on arrival at the door: a dissolve here hid the only profile frames.
      Keep those frames completely visible, then cut to the shop interior. */}
  <Sequence name="07 • Porta → interior / assalto e fuga" from={1203} durationInFrames={210}><Shot clip={5} from={1203} fade={0} /></Sequence>
  <Sequence name="08 • Replay / indicador desaparece" from={1403} durationInFrames={65}><Shot clip={2} from={1403} start={5} hud replay /></Sequence>
  <Sequence name="09 • Replay / estrelas" from={1458} durationInFrames={44}><Shot clip={3} from={1458} start={2.8} hud replay /></Sequence>
  <Sequence name="10 • Pergunta final / fuga em movimento" from={1492} durationInFrames={74}><Shot clip={5} from={1492} start={4.4} /></Sequence>
  <Titles />
  <Captions />
  <Soundtrack />
  <Progress />
</AbsoluteFill>;

const Progress: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  return <div style={{position: 'absolute', left: 0, bottom: 0, height: 4, width: 1080, background: '#ff4e6330'}}><div style={{width: `${frame / (durationInFrames - 1) * 100}%`, height: 4, background: accent}} /></div>;
};
