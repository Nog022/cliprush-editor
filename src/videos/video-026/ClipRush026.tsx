import React from 'react';
import {AbsoluteFill, Audio, OffthreadVideo, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import pages from './caption-pages.json';

const GOLD = '#ffd397';
const MINT = '#9be6d1';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const media = 'videos/videos-026/';

function Shot({clip, title, label, seconds, position = 50, zoom = 1.09, rate = 1, offset = 0, target = false}: {clip: string; title: string; label: string; seconds: number; position?: number; zoom?: number; rate?: number; offset?: number; target?: boolean}) {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return <AbsoluteFill>
    <div style={{position: 'absolute', top: 175, left: 76, right: 76}}>
      <div style={{fontSize: 25, letterSpacing: 4, color: MINT, fontWeight: 800}}>{label}</div>
      <div style={{fontSize: 83, lineHeight: 1.02, letterSpacing: -3, fontWeight: 900, marginTop: 24, whiteSpace: 'pre-line', translate: `0 ${interpolate(frame, [0, 12], [15, 0], clamp)}px`, opacity: interpolate(frame, [0, 8], [.5, 1], clamp)}}>{title}</div>
    </div>
    <div style={{position: 'absolute', top: 440, width: 1080, height: 850, overflow: 'hidden', borderTop: '2px solid #bde5dc55', borderBottom: '2px solid #bde5dc44', boxShadow: '0 30px 100px #0009'}}>
      <OffthreadVideo muted src={staticFile(`${media}footage/${clip}.mp4`)} trimBefore={Math.round(offset * fps)} playbackRate={rate} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: `${position}% 50%`, scale: interpolate(frame, [0, seconds * fps], [1, zoom], clamp), filter: 'contrast(1.045) saturate(1.04)'}}/>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, #03100c18, transparent 22%, transparent 80%, #03100c55)'}}/>
      {target && <div style={{position: 'absolute', left: 390, top: 230, width: 300, height: 320, border: `3px solid ${GOLD}`, borderRadius: 38, opacity: interpolate(frame, [8, 18, 52, 65], [0, .85, .85, 0], clamp), boxShadow: '0 0 0 1200px #0002'}}/>}
      <div style={{position: 'absolute', left: 58, bottom: 30, display: 'flex', alignItems: 'center', gap: 16, fontSize: 22, fontWeight: 800, letterSpacing: 3, textShadow: '0 2px 8px black'}}><div style={{width: 8, height: 8, borderRadius: '50%', background: GOLD}}/>OLHE OS DETALHES</div>
    </div>
    <div style={{position: 'absolute', top: 1330, left: 78, right: 78, height: 2, background: '#ffffff15'}}><div style={{height: 2, width: `${interpolate(frame, [0, seconds * fps], [0, 100], clamp)}%`, background: MINT}}/></div>
  </AbsoluteFill>;
}

function Captions() {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ms = frame / fps * 1000;
  const page = pages.find((p, i) => ms >= p.startMs && ms < Math.min(p.endMs + 120, pages[i + 1]?.startMs ?? Infinity));
  if (!page) return null;
  return <div style={{position: 'absolute', top: 1505, left: 85, right: 105, textAlign: 'center', fontSize: 65, lineHeight: 1.18, fontWeight: 900, textWrap: 'balance', textShadow: '0 4px 12px #000'}}>
    {page.words.map((w, i) => <span key={i} style={{color: ms >= w.startMs && ms < w.endMs + 40 ? GOLD : '#fff'}}>{w.text.trim()}{' '}</span>)}
  </div>;
}

function CTA() {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const confirmed = frame >= 38;
  return <div style={{position: 'absolute', top: 1360, left: 135, width: 810, height: 104, borderRadius: 25, background: confirmed ? MINT : GOLD, color: '#081a18', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 22, fontWeight: 900, fontSize: 36, scale: spring({frame, fps, config: {damping: 17, stiffness: 160}})}}>
    <svg width="43" height="43" viewBox="0 0 24 24" fill="currentColor"><path d="M2 10h4v12H2zM8 10l5-8c3 0 2 5 1 7h6c2 0 2 2 1 5l-2 7H8z"/></svg>{confirmed ? 'CURTIU!  ✓  SEGUINDO' : 'CURTIR + SEGUIR'}
    <svg width="55" height="65" viewBox="0 0 50 60" style={{position: 'absolute', right: interpolate(frame, [0, 30, 38, 55], [-20, 45, 45, 10], clamp), top: interpolate(frame, [0, 30, 38, 55], [100, 52, 52, 90], clamp), opacity: interpolate(frame, [0, 12, 55, 65], [0, 1, 1, 0], clamp), scale: interpolate(frame, [30, 35, 39], [1, .8, 1], clamp)}}><path d="M5 3L5 46L17 35L27 56L37 51L27 31L44 30Z" fill="white" stroke="#081a18" strokeWidth="3"/></svg>
    {Array.from({length: 8}, (_, i) => <div key={i} style={{position: 'absolute', left: 405 + Math.cos(i * Math.PI / 4) * Math.max(0, frame - 38) * 10, top: 52 + Math.sin(i * Math.PI / 4) * Math.max(0, frame - 38) * 7, width: 8, height: 8, borderRadius: '50%', background: GOLD, opacity: interpolate(frame, [37, 38, 55], [0, 1, 0], clamp)}}/>)}
    <Sequence from={38} durationInFrames={4}><Audio src={staticFile(`${media}audio/click.wav`)} volume={.25}/></Sequence>
  </div>;
}

export const ClipRush026: React.FC = () => <AbsoluteFill style={{background: 'radial-gradient(ellipse at 80% 8%, #1d3934, #081614 58%, #050b0c)', color: '#f4f5ee', fontFamily: 'Arial, sans-serif'}}>
  <Audio src={staticFile(`${media}audio/narracao.mp3`)}/>
  <Sequence name="Gancho — tigre" durationInFrames={63}><Shot clip="hook-tiger" title={'ISSO ESTÁ\nNO ACAMPAMENTO.'} label="A MISSÃO TEM OUTRA CAMADA" seconds={2.1} position={46} target/></Sequence>
  <Sequence name="Gancho — outro detalhe" from={63} durationInFrames={60}><Shot clip="hook-white" title={'OLHA DENTRO\nDAS JAULAS.'} label="REPAROU NISSO?" seconds={2} position={37} zoom={1.13}/></Sequence>
  <Sequence name="Gancho — combate" from={123} durationInFrames={78}><Shot clip="hook-hammer" title={'E A TENSÃO\nSÓ AUMENTA.'} label="DO DETALHE À AÇÃO" seconds={2.6} position={45}/></Sequence>
  <Sequence name="Canais — navegação" from={201} durationInFrames={108}><Shot clip="river" title={'TUDO COMEÇA\nPELA ÁGUA.'} label="01 / O CAMINHO" seconds={3.6} position={52}/></Sequence>
  <Sequence name="Água — aproximação" from={309} durationInFrames={60}><Shot clip="river" offset={3.6} title={'OLHA ESSE\nMOVIMENTO.'} label="O CANAL EM DETALHE" seconds={2} position={66} zoom={1.15}/></Sequence>
  <Sequence name="Mapa — região" from={369} durationInFrames={102}><Shot clip="map" title={'O MAPA\nABRE A REGIÃO.'} label="02 / MAIS ALÉM" seconds={3.4} position={65} zoom={1.07}/></Sequence>
  <Sequence name="Exploração vira investigação" from={471} durationInFrames={81}><Shot clip="approach" title={'EXPLORAR.\nINVESTIGAR.'} label="A MISSÃO MUDA DE TOM" seconds={2.7} position={52}/></Sequence>
  <Sequence name="Binóculos — negociação" from={552} durationInFrames={153}><Shot clip="binoculars" title={'ANTES DE ENTRAR,\nOBSERVAR.'} label="03 / A NEGOCIAÇÃO" seconds={5.1} position={51} zoom={1.12} target/></Sequence>
  <Sequence name="Intervalo pedido — 05:58 a 06:08" from={705} durationInFrames={189}><Shot clip="animals-a" rate={10 / 6.3} title={'DENTRO DO\nACAMPAMENTO.'} label="04 / OLHE AS JAULAS" seconds={6.3} position={48} zoom={1.1} target/></Sequence>
  <Sequence name="Intervalo pedido — 06:18 a 06:24" from={894} durationInFrames={180}><Shot clip="animals-b" title={'QUANTOS DETALHES\nVOCÊ VIU?'} label="NÃO É SÓ PASSAR POR AQUI" seconds={6} position={37} zoom={1.12}/></Sequence>
  <Sequence name="Infiltração — martelo" from={1074} durationInFrames={174}><Shot clip="stealth" title={'SILÊNCIO.\nE UM MARTELO.'} label="05 / A PARTE TENSA" seconds={5.8} position={45} zoom={1.12}/></Sequence>
  <Sequence name="Confronto direto" from={1248} durationInFrames={69}><Shot clip="fight" title={'O SILÊNCIO\nACABOU.'} label="DO PLANO AO CONFRONTO" seconds={2.3} position={47}/></Sequence>
  <Sequence name="Pergunta final" from={1317} durationInFrames={93}><Shot clip="end" title={'QUAL DETALHE\nTE SURPREENDEU?'} label="CONTA NOS COMENTÁRIOS" seconds={3.1} position={53}/></Sequence>
  <Sequence name="CTA sincronizado à voz" from={909} durationInFrames={99}><CTA/></Sequence>
  <Captions/>
  <div style={{position: 'absolute', top: 83, left: 78, right: 80, display: 'flex', justifyContent: 'space-between', color: '#d9e6df99', fontWeight: 800, fontSize: 23, letterSpacing: 5}}><span>CLIPRUSH</span><span>026</span></div>
</AbsoluteFill>;
