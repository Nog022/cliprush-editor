import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, Video, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import pages from './caption-pages.json';

const CAMP = 'videos/biblioteca/gta6/personagens/cenas_aleatorias/homem com faca cercado por animais.jpg';
const BAR = 'videos/biblioteca/gta6/personagens/cenas_aleatorias/bar com varias pessoas.jpg';
const GOLD = '#f6cc83';
const MINT = '#a9e7d3';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Coordinates refer to the original 3840×2160 images, never a guessed crop.
function Evidence({src, x, y, zoom, endX = x, endY = y, duration, height = 1100, accent = GOLD}: {src: string; x: number; y: number; zoom: number; endX?: number; endY?: number; duration: number; height?: number; accent?: string}) {
  const frame = useCurrentFrame();
  const z = interpolate(frame, [0, duration], [zoom, zoom * 1.035], clamp);
  const cx = Math.max(540 / z, Math.min(3840 - 540 / z, interpolate(frame, [0, duration], [x, endX], clamp)));
  const cy = Math.max(height / 2 / z, Math.min(2160 - height / 2 / z, interpolate(frame, [0, duration], [y, endY], clamp)));
  return <div style={{position: 'relative', width: 1080, height, overflow: 'hidden', background: '#10191b'}}>
    <Img src={staticFile(src)} style={{position: 'absolute', width: 3840 * z, height: 2160 * z, maxWidth: 'none', left: 540 - cx * z, top: height / 2 - cy * z}}/>
    <AbsoluteFill style={{boxShadow: 'inset 0 0 100px #0005', borderTop: `1px solid ${accent}70`, borderBottom: `1px solid ${accent}70`}}/>
  </div>;
}

function Heading({title, label = 'GTA VI · DETALHES', accent = GOLD}: {title: string; label?: string; accent?: string}) {
  const frame = useCurrentFrame();
  return <div style={{position: 'absolute', top: 155, left: 80, right: 80, opacity: interpolate(frame, [0, 7], [.5, 1], clamp), translate: `0 ${interpolate(frame, [0, 12], [18, 0], clamp)}px`}}>
    <div style={{fontSize: 25, letterSpacing: 4, color: accent, fontWeight: 700, marginBottom: 21}}>{label}</div>
    <div style={{fontSize: 89, lineHeight: 1.03, fontWeight: 900, letterSpacing: -3, textWrap: 'balance'}}>{title}</div>
  </div>;
}

function Shot({title, label, src, x, y, zoom, endX, endY, duration, note, target, children}: {title: string; label?: string; src: string; x: number; y: number; zoom: number; endX?: number; endY?: number; duration: number; note?: string; target?: string; children?: React.ReactNode}) {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{background: '#091216'}}>
    <div style={{position: 'absolute', top: 420}}><Evidence src={src} x={x} y={y} zoom={zoom} endX={endX} endY={endY} duration={duration}/></div>
    <Heading title={title} label={label}/>
    {target && <div style={{position: 'absolute', top: 720, left: 270, width: 540, height: 540, border: `4px solid ${GOLD}`, borderRadius: 35, opacity: interpolate(frame, [0, 10, duration - 8, duration], [0, .9, .9, 0], clamp), boxShadow: '0 0 0 1500px #0002'}}><div style={{position: 'absolute', bottom: -52, left: 0, fontSize: 28, fontWeight: 700, color: GOLD, textShadow: '0 2px 5px #000'}}>{target}</div></div>}
    {note && <div style={{position: 'absolute', top: 1460, left: 80, right: 80, fontSize: 27, fontWeight: 700, color: '#f4e9d6', textShadow: '0 2px 7px #000', letterSpacing: 1}}>{note}</div>}
    {children}
  </AbsoluteFill>;
}

function Comparison({reveal = false, theory = false}: {reveal?: boolean; theory?: boolean}) {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{background: '#091216'}}>
    <Heading title={theory ? 'Um mundo conectado?' : reveal ? 'A mesma marca.' : 'O que liga esses lugares?'} label={theory ? 'HIPÓTESE · NÃO CONFIRMADA' : reveal ? 'A CONEXÃO VISUAL' : 'GTA VI · OLHE MAIS DE PERTO'}/>
    <div style={{position: 'absolute', top: 450}}>
      <Evidence src={CAMP} x={reveal ? 2200 : 1800} y={reveal ? 1690 : 1080} zoom={reveal ? .98 : .3} duration={180} height={480}/>
      <div style={{position: 'absolute', top: 22, left: 78, background: '#091216dc', padding: '10px 18px', fontSize: 28, fontWeight: 800, color: GOLD}}>01 · PÂNTANO</div>
    </div>
    <div style={{position: 'absolute', top: 1000}}>
      <Evidence src={BAR} x={reveal ? 1900 : 1900} y={reveal ? 680 : 1080} zoom={reveal ? 1.1 : .3} duration={180} height={480} accent={MINT}/>
      <div style={{position: 'absolute', top: 22, left: 78, background: '#091216dc', padding: '10px 18px', fontSize: 28, fontWeight: 800, color: MINT}}>02 · BAR</div>
    </div>
    <div style={{position: 'absolute', top: 930, height: 70, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, color: GOLD, fontSize: 28, letterSpacing: 3, fontWeight: 800}}>
      <div style={{width: interpolate(frame, [0, 28], [0, 140], clamp), height: 2, background: GOLD}}/>{reveal ? 'PATRICK BEER' : '• • •'}<div style={{width: interpolate(frame, [0, 28], [0, 140], clamp), height: 2, background: GOLD}}/>
    </div>
    {theory && <div style={{position: 'absolute', top: 1405, left: 145, right: 145, textAlign: 'center', fontSize: 31, fontWeight: 800, background: '#091216ec', padding: 18, borderRadius: 10}}>PRODUTOS · ATIVIDADES · ROTINA</div>}
  </AbsoluteFill>;
}

function CTA() {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const liked = frame >= 42;
  const followed = frame >= 65;
  return <div style={{position: 'absolute', left: 90, right: 90, top: 1210, display: 'flex', gap: 20, scale: spring({frame, fps, config: {damping: 20}})}}>
    <div style={{flex: 1, borderRadius: 20, padding: '30px 20px', background: liked ? GOLD : '#102126f0', color: liked ? '#112025' : '#fff', fontSize: 40, fontWeight: 800, textAlign: 'center', scale: interpolate(frame, [41, 46, 54], [1, 1.12, 1], clamp)}}>{liked ? '♥ Curtiu' : '♡ Curtir'}</div>
    <div style={{flex: 1, borderRadius: 20, padding: '30px 20px', background: followed ? MINT : '#f7f0e5', color: '#112025', fontSize: 40, fontWeight: 800, textAlign: 'center'}}>{followed ? '✓ Seguindo' : '+ Seguir'}</div>
    {[0, 1, 2, 3, 4, 5].map(i => <div key={i} style={{position: 'absolute', left: 215, top: 50, width: 11, height: 11, borderRadius: 10, background: GOLD, opacity: interpolate(frame, [42, 46, 59], [0, 1, 0], clamp), translate: `${Math.cos(i * Math.PI / 3) * interpolate(frame, [42, 59], [20, 145], clamp)}px ${Math.sin(i * Math.PI / 3) * interpolate(frame, [42, 59], [20, 145], clamp)}px`}}/>)}
  </div>;
}

function Captions() {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ms = frame / fps * 1000;
  const page = pages.find((p, i) => ms >= p.startMs && ms < Math.min(p.endMs + 110, pages[i + 1]?.startMs ?? Infinity));
  if (!page) return null;
  return <div style={{position: 'absolute', top: 1590, left: 85, right: 85, textAlign: 'center', fontSize: 61, fontWeight: 800, lineHeight: 1.16, textWrap: 'balance', textShadow: '0 3px 9px #000'}}>{page.words.map((w, i) => <span key={i} style={{color: ms >= w.startMs && ms < w.endMs + 40 ? GOLD : '#fff'}}>{w.text.trim()}{' '}</span>)}</div>;
}

function Finale() {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return <AbsoluteFill style={{background: '#091216'}}>
    <Video src={staticFile('videos/biblioteca/gta6/videos/Trailer 2 GTA VI.mp4')} trimBefore={Math.round(8.3 * fps)} muted style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 50%', scale: interpolate(frame, [0, 139], [1, 1.05], clamp)}}/>
    <AbsoluteFill style={{background: 'linear-gradient(180deg,#091216dc 0%,#09121630 42%,#09121620 62%,#091216 91%)'}}/>
    <Heading title="Imagine explorar tudo isso." label="GTA VI · AINDA É TEORIA"/>
    <div style={{position: 'absolute', left: 80, top: 1440, fontSize: 27, color: GOLD, fontWeight: 700}}>A hipótese vai além do detalhe visual.</div>
  </AbsoluteFill>;
}

export const ClipRush024: React.FC = () => <AbsoluteFill style={{background: '#091216', color: '#f8f4ea', fontFamily: 'Arial, sans-serif'}}>
  <Audio src={staticFile('videos/video-024/audio/narracao.mp3')}/>
  <Sequence name="Gancho — a cerveja no acampamento" durationInFrames={87}><Shot title="A mesma cerveja." src={CAMP} x={1850} y={1350} zoom={.53} endX={2000} duration={87}/></Sequence>
  <Sequence name="Gancho — o outro lugar" from={87} durationInFrames={78}><Shot title="Do pântano ao bar." src={BAR} x={2000} y={1000} zoom={.53} endX={2100} duration={78}/></Sequence>
  <Sequence name="Pergunta visual" from={165} durationInFrames={77}><Comparison/></Sequence>
  <Sequence name="A cobra gigante" from={242} durationInFrames={106}><Shot title="Repara na cobra." src={CAMP} x={1050} y={950} zoom={.67} duration={106} endY={1020}/></Sequence>
  <Sequence name="Movimento para o fundo" from={348} durationInFrames={60}><Shot title="Agora, atrás dele." src={CAMP} x={1500} y={900} endX={2750} endY={750} zoom={.65} duration={60}/></Sequence>
  <Sequence name="As tiras penduradas" from={408} durationInFrames={90}><Shot title="Parecem peles?" label="OBSERVAÇÃO · HIPÓTESE" src={CAMP} x={2850} y={760} zoom={.9} duration={90} note="Tiras penduradas ao fundo"/></Sequence>
  <Sequence name="A cauda na mesa" from={498} durationInFrames={69}><Shot title="E essa cauda?" src={CAMP} x={2660} y={1780} zoom={.77} duration={69}/></Sequence>
  <Sequence name="Possível caça e comércio" from={567} durationInFrames={99}><Shot title="Caça e comércio?" label="POSSIBILIDADE · NÃO CONFIRMADA" src={CAMP} x={2420} y={1250} endX={2050} zoom={.53} duration={99}/></Sequence>
  <Sequence name="Apresentação do bar" from={666} durationInFrames={54}><Shot title="Agora, olha esse bar." src={BAR} x={1900} y={1080} zoom={.52} duration={54}/></Sequence>
  <Sequence name="A banda" from={720} durationInFrames={42}><Shot title="Uma banda tocando." src={BAR} x={2750} y={790} zoom={.72} duration={42}/></Sequence>
  <Sequence name="Pessoas dançando" from={762} durationInFrames={39}><Shot title="Gente dançando." src={BAR} x={2900} y={1250} zoom={.65} duration={39}/></Sequence>
  <Sequence name="O cachorro escondido" from={801} durationInFrames={102}><Shot title="Até o laço rosa." src={BAR} x={470} y={1970} zoom={1.15} duration={102} note="Olha embaixo da cadeira"/></Sequence>
  <Sequence name="CTA sincronizado à narração" from={903} durationInFrames={96}><Shot title="Curtiu esses detalhes?" src={BAR} x={1120} y={1100} zoom={.53} duration={96}><CTA/></Shot></Sequence>
  <Sequence name="Preparação da conexão" from={999} durationInFrames={88}><Comparison reveal/></Sequence>
  <Sequence name="Prova — a garrafa Patrick Beer" from={1087} durationInFrames={65}><Shot title="Patrick Beer." label="01 · A GARRAFA NO PÂNTANO" src={CAMP} x={2200} y={1690} zoom={1.13} duration={65}/></Sequence>
  <Sequence name="Prova — o letreiro no bar" from={1152} durationInFrames={94}><Shot title="A marca no letreiro." label="02 · O LETREIRO NO BAR" src={BAR} x={1900} y={680} zoom={1.1} duration={94}/></Sequence>
  <Sequence name="Teoria — produtos e atividades conectados" from={1246} durationInFrames={242}><Comparison reveal theory/></Sequence>
  <Sequence name="Encerramento — imaginar Leonida" from={1488} durationInFrames={139}><Finale/></Sequence>
  <Captions/>
  <div style={{position: 'absolute', top: 76, left: 80, fontSize: 22, letterSpacing: 5, color: '#c4d2d4', fontWeight: 700}}>CLIPRUSH</div>
  <div style={{position: 'absolute', top: 1795, left: 80, right: 80, height: 3, background: '#ffffff15'}}><Progress/></div>
  <Sequence from={945} durationInFrames={5}><Audio src={staticFile('videos/video-024/audio/click.wav')} volume={.14}/></Sequence>
  <Sequence from={968} durationInFrames={5}><Audio src={staticFile('videos/video-024/audio/click.wav')} volume={.12}/></Sequence>
</AbsoluteFill>;

function Progress() {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  return <div style={{width: `${frame / (durationInFrames - 1) * 100}%`, height: 3, background: GOLD}}/>;
}
