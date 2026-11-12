import React from 'react';
import {Audio} from '@remotion/media';
import type {Caption} from '@remotion/captions';
import {AbsoluteFill, Easing, Img, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import timeline from './timeline.json';

const cyan = '#5ae5ee';
const purple = '#a479ff';
const yellow = '#ffe263';
const smooth = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const, easing: Easing.inOut(Easing.cubic)};
type SceneData = (typeof timeline.scenes)[number];
type Pass = SceneData['passes'][number];

export const sourceImage014 = (scene: SceneData, frame: number): string => {
  if (!Number.isInteger(frame) || frame < 0 || frame >= scene.count) {
    throw new Error(`video-014: source frame outside approved interval: ${scene.order}/${frame}`);
  }
  return staticFile(`videos/video-014/media/detail-${String(scene.order).padStart(2, '0')}-v001/${String(frame).padStart(4, '0')}.jpg`);
};

const trackAt = (scene: SceneData, frame: number): {x: number; y: number} => ({
  x: interpolate(frame, scene.track.map((p) => p[0]), scene.track.map((p) => p[1]), {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
  y: interpolate(frame, scene.track.map((p) => p[0]), scene.track.map((p) => p[2]), {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
});

const Captions014: React.FC<{scene: SceneData}> = ({scene}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ms = (f + scene.from) / fps * 1000;
  const pages: Caption[][] = scene.captions;
  const page = pages.find((p, i) => ms >= p[0].startMs && ms < Math.min((pages[i + 1]?.[0].startMs ?? Infinity), p[p.length - 1].endMs + 170));
  if (!page) return null;
  const keyword = page.reduce((a, b) => b.text.trim().length > a.text.trim().length ? b : a);
  return <div style={{position: 'absolute', left: 88, right: 120, top: 1485, minHeight: 132, display: 'flex', flexWrap: 'wrap', alignContent: 'center', justifyContent: 'center', columnGap: 16, rowGap: 4, fontSize: 58, lineHeight: 1.12, fontWeight: 900, textAlign: 'center', textTransform: 'uppercase', textShadow: '0 3px 4px #000, 0 0 16px #000', WebkitTextStroke: '1px #080a14', opacity: interpolate(ms, [page[0].startMs, page[0].startMs + 130], [0.35, 1], smooth), translate: `0 ${interpolate(ms, [page[0].startMs, page[0].startMs + 180], [9, 0], smooth)}px`}}>
    {page.map((w, i) => <span key={i} style={{color: w === keyword ? yellow : 'white'}}>{w.text.trim()}</span>)}
  </div>;
};

const Evidence: React.FC<{scene: SceneData; pass: Pass; local: number}> = ({scene, pass, local}) => {
  const f = useCurrentFrame();
  const sourceFrame = pass.source + Math.floor(local * pass.rate);
  const src = sourceImage014(scene, sourceFrame);
  const target = trackAt(scene, sourceFrame);
  const firstFocus = scene.passes.find((p) => p.mode === 'focus')?.from ?? 88;
  const focus = pass.mode === 'context' ? 0 : pass.mode === 'adaptive'
    ? interpolate(f, [70, 82], [0, 1], smooth)
    : interpolate(f, [firstFocus, firstFocus + 10], [0, 1], smooth);
  const zoom = interpolate(f, [firstFocus, firstFocus + 10, scene.duration - 20], [1, scene.zoom, scene.zoom], smooth);
  const scale = 1080 / 1920 + (1080 / scene.cropWidth * zoom - 1080 / 1920) * focus;
  const panelTop = 555 + 155 * focus;
  const panelHeight = 700;
  // Clamp the camera to source edges. Keep the complete target in the panel;
  // the separate full-source context view preserves spatial relationships.
  const cx = 0.5 + (target.x - 0.5) * focus;
  const cy = 0.5 + (target.y - 0.5) * focus;
  const left = Math.min(0, Math.max(1080 - 1920 * scale, 540 - cx * 1920 * scale));
  const top = 1080 * scale <= panelHeight ? (panelHeight - 1080 * scale) / 2 : Math.min(0, Math.max(panelHeight - 1080 * scale, panelHeight / 2 - cy * 1080 * scale));
  const markerStart = scene.order === 2 ? 16 : 8;
  const marker = focus > 0.95 && local >= markerStart && local < markerStart + 24 && pass.rate === 1 && ![3, 4, 6].includes(scene.order);
  const tx = left + target.x * 1920 * scale;
  const ty = top + target.y * 1080 * scale;
  return <>
    <AbsoluteFill style={{opacity: 0.23}}><Img src={src} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(45px)', scale: 1.15}}/></AbsoluteFill>
    <AbsoluteFill style={{background: 'linear-gradient(180deg,#080b17f5 0%,#080b1799 24%,#080b1744 58%,#080b17 85%)'}}/>
    {focus > 0 && <div style={{position: 'absolute', top: 438, left: 82, width: 430, height: 242, overflow: 'hidden', border: '1px solid #ffffff55', borderRadius: 8, opacity: focus}}>
      <Img src={src} style={{width: 430, height: 242}}/>
      <div style={{position: 'absolute', top: 12, left: 12, background: '#080b17d9', padding: '6px 10px', fontSize: 18, letterSpacing: 2, fontWeight: 800}}>CONTEXTO</div>
    </div>}
    {focus > 0 && <div style={{position: 'absolute', top: 490, left: 555, right: 115, fontSize: 25, lineHeight: 1.35, color: '#d4d5e4', opacity: focus}}><span style={{color: cyan, fontWeight: 900, letterSpacing: 2}}>OLHE O DETALHE</span><br/><span style={{fontSize: 21}}>Mesmo trecho.<br/>Enquadramento ampliado.</span></div>}
    <div data-evidence={scene.order} style={{position: 'absolute', top: panelTop, left: 0, width: 1080, height: panelHeight, overflow: 'hidden'}}>
      <Img src={src} style={{position: 'absolute', width: 1920 * scale, height: 1080 * scale, maxWidth: 'none', left, top}}/>
      {marker && <svg width={1080} height={panelHeight} style={{position: 'absolute', inset: 0, opacity: interpolate(local, [markerStart, markerStart + 4, markerStart + 18, markerStart + 24], [0, 0.9, 0.9, 0], smooth)}}>
        {scene.order === 7 ? <circle cx={tx} cy={ty} r={66} fill="none" stroke={cyan} strokeWidth={4}/> : <path d={`M ${tx - 80} ${ty - 42} v -22 h 35 M ${tx + 80} ${ty - 42} v -22 h -35 M ${tx - 80} ${ty + 42} v 22 h 35 M ${tx + 80} ${ty + 42} v 22 h -35`} fill="none" stroke={cyan} strokeWidth={4}/>}
      </svg>}
    </div>
    <div style={{position: 'absolute', top: panelTop + panelHeight + 18, left: 82, right: 120, display: 'flex', alignItems: 'center', gap: 12, fontSize: 23, fontWeight: 800, letterSpacing: 1.8, color: pass.rate ? cyan : '#c5b5e9'}}>
      <span style={{width: 8, height: 8, borderRadius: '50%', background: pass.rate ? cyan : purple}}/>{pass.label}
    </div>
  </>;
};

const DetailScene: React.FC<{index: number}> = ({index}) => {
  const scene = timeline.scenes[index];
  const f = useCurrentFrame();
  const pass = scene.passes.find((p) => f >= p.from && f < p.from + p.duration);
  if (!pass) throw new Error(`Uncovered timeline frame ${index}/${f}`);
  const title = f >= scene.reveal ? scene.proofTitle : scene.title;
  const finalQuestion = scene.order === 8 && f >= 252;
  return <AbsoluteFill>
    <Evidence scene={scene} pass={pass} local={f - pass.from}/>
    <div style={{position: 'absolute', left: 82, top: 100, fontSize: 30, fontWeight: 900, letterSpacing: 3}}>CLIP<span style={{color: purple}}>RUSH</span></div>
    <div style={{position: 'absolute', right: 120, top: 106, fontSize: 22, fontWeight: 800, letterSpacing: 4, color: cyan}}>DETALHE {String(scene.order).padStart(2, '0')} / 08</div>
    <div style={{position: 'absolute', left: 82, right: 120, top: 220, fontSize: 83, fontWeight: 950, lineHeight: 1.02, letterSpacing: -2.6, textShadow: '0 4px 16px #0008'}}>
      {finalQuestion ? <>QUAL PASSOU<br/><span style={{color: yellow}}>BATIDO?</span></> : <>{title[0]}<br/><span style={{color: f >= scene.reveal ? yellow : cyan}}>{title[1]}</span></>}
    </div>
    <Captions014 scene={scene}/>
    <div style={{position: 'absolute', left: 82, right: 120, bottom: 199, display: 'flex', gap: 11}}>{timeline.scenes.map((s, i) => <div key={s.order} style={{height: 4, flex: 1, background: '#ffffff30'}}><div style={{height: 4, background: i < index ? purple : cyan, width: i < index ? '100%' : i > index ? '0%' : `${f / scene.duration * 100}%`}}/></div>)}</div>
    <div style={{position: 'absolute', left: 82, bottom: 153, fontSize: 19, color: '#a2a7bb', letterSpacing: 1.2}}>FONTE: GTA6-EXTENDED · TRECHO {String(scene.order).padStart(2, '0')}</div>
  </AbsoluteFill>;
};

export const ClipRush014: React.FC = () => <AbsoluteFill style={{background: '#080b17', color: 'white', fontFamily: 'Arial, sans-serif', overflow: 'hidden'}}>
  <Sequence name="01 · celular · contexto e replay" durationInFrames={221}><DetailScene index={0}/></Sequence>
  <Sequence name="02 · arma na viatura · tracking" from={221} durationInFrames={213}><DetailScene index={1}/></Sequence>
  <Sequence name="03 · Jason e Lucia · gesto" from={434} durationInFrames={234}><DetailScene index={2}/></Sequence>
  <Sequence name="04 · blusa · tecido" from={668} durationInFrames={231}><DetailScene index={3}/></Sequence>
  <Sequence name="05 · árvores · folhas" from={899} durationInFrames={202}><DetailScene index={4}/></Sequence>
  <Sequence name="06 · geladeira · abertura e luz" from={1101} durationInFrames={218}><DetailScene index={5}/></Sequence>
  <Sequence name="07 · pneu · disparo e roda" from={1319} durationInFrames={195}><DetailScene index={6}/></Sequence>
  <Sequence name="08 · cartão e pó · pergunta" from={1514} durationInFrames={326}><DetailScene index={7}/></Sequence>
  <Audio src={staticFile('videos/video-014/audio/narracao.mp3')}/>
</AbsoluteFill>;
