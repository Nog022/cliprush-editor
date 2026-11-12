import type { CSSProperties } from 'react';
import type { Caption } from '@remotion/captions';
import { Audio, Video } from '@remotion/media';
import { AbsoluteFill, CanvasImage, Sequence, Track, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import rawCaptions from './captions.json';

const asset = (file: string): string => staticFile(`videos/video-010/${file}`);
const ink = '#081719';
const cream = '#f7f1df';
const mint = '#a5ebcb';
const coral = '#ff957c';
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const type: CSSProperties = { fontFamily: 'Arial, Helvetica, sans-serif', color: cream };

const Frame = () => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return <>
    <div style={{ position: 'absolute', top: 85, left: 80, right: 100, display: 'flex', justifyContent: 'space-between', fontSize: 31, fontWeight: 700, letterSpacing: 3, opacity: 0.85 }}><span>VIDA SELVAGEM</span><span>RDR2 × GTA 6</span></div>
    <div style={{ position: 'absolute', bottom: 145, left: 80, width: 880, height: 4, background: '#ffffff20' }}><div style={{ height: 4, width: `${f / (durationInFrames - 1) * 100}%`, background: mint }} /></div>
  </>;
};

const Photo = ({ file, position = '50% 50%', style }: { file: string; position?: string; style?: CSSProperties }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return <CanvasImage src={asset(file)} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: position, scale: interpolate(f, [0, durationInFrames], [1.02, 1.1], clamp), ...style }} />;
};

const Film = ({ name, position = '50% 50%', rate = 1 }: { name: string; position?: string; rate?: number }) => <Video src={asset(`edit/${name}.mp4`)} muted playbackRate={rate} objectFit="cover" style={{ width: '100%', height: '100%', objectPosition: position }} />;

const Backdrop = ({ file }: { file: string }) => <AbsoluteFill style={{ overflow: 'hidden', background: ink }}>
  <CanvasImage src={asset(file)} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.28, filter: 'blur(35px)', scale: 1.14 }} />
  <AbsoluteFill style={{ background: 'linear-gradient(180deg, #08171977, transparent 50%, #081719 90%)' }} />
</AbsoluteFill>;

const CaptionLine = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ms = f / fps * 1000;
  const words: Caption[] = rawCaptions.filter(w => !(w.startMs === 7000 && w.text.trim() === '6.'));
  const groups: Caption[][] = [];
  let group: Caption[] = [];
  words.forEach((word, i) => {
    group.push(word);
    const next = words[i + 1];
    if (group.length >= 4 || /[.!?]$/.test(word.text) || (next && next.startMs - word.endMs > 250)) { groups.push(group); group = []; }
  });
  if (group.length) groups.push(group);
  const active = groups.find(g => ms >= g[0].startMs && ms < g[g.length - 1].endMs + 90);
  if (!active) return null;
  return <div data-safe="caption" style={{ position: 'absolute', left: 85, right: 125, top: 1510, textAlign: 'center', fontSize: 59, lineHeight: 1.25, fontWeight: 800, textShadow: '0 3px 18px #000' }}>
    <span style={{ background: '#081719eb', padding: '14px 22px', boxDecorationBreak: 'clone', borderRadius: 12 }}>
      {active.map(w => <span key={`${w.startMs}-${w.text}`} style={{ color: ms >= w.startMs && ms < w.endMs ? mint : cream }}>{w.text}</span>)}
    </span>
  </div>;
};

const Heading = ({ kicker, title, color = mint }: { kicker: string; title: string; color?: string }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: f, fps, config: { damping: 22, stiffness: 160 } });
  return <div data-safe="heading" style={{ position: 'absolute', top: 195, left: 80, right: 110, translate: `0 ${24 * (1 - enter)}px`, opacity: enter }}>
    <div style={{ fontSize: 34, letterSpacing: 5, fontWeight: 700, color, marginBottom: 20 }}>{kicker}</div>
    <div style={{ fontSize: title.length > 19 ? 84 : 104, fontWeight: 900, lineHeight: 0.98, letterSpacing: -4, whiteSpace: 'pre-line' }}>{title}</div>
  </div>;
};

const Source = ({ children }: { children: string }) => <div style={{ position: 'absolute', bottom: 18, left: 26, right: 26, color: '#fff', textShadow: '0 2px 8px #000', fontSize: 27, fontWeight: 600, letterSpacing: 1 }}>{children}</div>;

const Scenic = ({ clip, title, kicker, source, color = mint, position }: { clip: string; title: string; kicker: string; source: string; color?: string; position?: string }) => <AbsoluteFill>
  <Backdrop file={`edit/${clip}.jpg`} />
  <Heading kicker={kicker} title={title} color={color} />
  <div style={{ position: 'absolute', top: 495, width: 1080, height: 875, overflow: 'hidden' }}>
    <Film name={clip} position={position} />
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 70%, #081719bd)' }} />
    <Source>{source}</Source>
  </div>
</AbsoluteFill>;

const Opening = ({ ending = false }: { ending?: boolean }) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ background: ink }}>
    <div style={{ position: 'absolute', top: 190, left: 80, right: 100, fontWeight: 900, fontSize: ending ? 86 : 105, letterSpacing: -4, lineHeight: 0.98 }}>{ending ? 'QUAL MUNDO\nÉ MAIS VIVO?' : 'A NATUREZA\nVAI EVOLUIR?'}</div>
    <div style={{ position: 'absolute', top: 445, height: 450, width: 1080, overflow: 'hidden' }}>
      {ending ? <Photo file="edit/rdr-bison.jpg" /> : <Film name="rdr-bison" rate={0.75} />}
      <div style={{ position: 'absolute', top: 20, left: 80, fontSize: 49, fontWeight: 900, background: ink, padding: '8px 20px', color: coral }}>RED DEAD 2</div>
    </div>
    <div style={{ position: 'absolute', top: 914, height: 450, width: 1080, overflow: 'hidden' }}>
      {ending ? <Photo file="edit/gta-flamingos.jpg" /> : <Film name="gta-dolphins" rate={0.55} />}
      <div style={{ position: 'absolute', bottom: 20, left: 80, fontSize: 49, fontWeight: 900, background: ink, padding: '8px 20px', color: mint }}>GTA 6</div>
    </div>
    <div style={{ position: 'absolute', top: 856, left: 423, width: 234, height: 95, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 54, fontWeight: 900, color: ink, background: mint, scale: interpolate(f, [0, 12], [0.85, 1], clamp) }}>{ending ? 'VOCÊ?' : 'VERSUS'}</div>
    <div style={{ position: 'absolute', top: 1400, left: 80, fontSize: 32, color: ending ? mint : '#b7c5c3', letterSpacing: 2 }}>{ending ? 'COMENTE SUA APOSTA ↓' : 'IMAGENS DOS TRAILERS • ROCKSTAR GAMES'}</div>
  </AbsoluteFill>;
};

const Diversity = () => <AbsoluteFill>
  <Backdrop file="edit/rdr-nature.jpg" />
  <div style={{ position: 'absolute', top: 340, width: '100%', height: 1010, overflow: 'hidden' }}><Film name="rdr-nature" /><AbsoluteFill style={{ background: 'linear-gradient(#08171988, transparent, #081719)' }} /></div>
  <Heading kicker="RED DEAD REDEMPTION 2" title="QUASE" color={coral} />
  <div style={{ position: 'absolute', top: 540, left: 70, fontSize: 320, fontWeight: 900, letterSpacing: -20, color: cream, textShadow: '0 8px 30px #0006' }}>200</div>
  <div style={{ position: 'absolute', top: 890, left: 86, fontSize: 85, fontWeight: 900, letterSpacing: -3 }}>ESPÉCIES</div>
  <div style={{ position: 'absolute', top: 1305, left: 80, fontSize: 28, color: '#d0d9d6' }}>AMBIENTAÇÃO • TRAILER DE RDR2</div>
</AbsoluteFill>;

const Paw = ({ x, y, color }: { x: number; y: number; color: string }) => <g transform={`translate(${x} ${y})`} fill={color}>
  <ellipse cx="0" cy="25" rx="40" ry="32" /><ellipse cx="-40" cy="-18" rx="16" ry="23" transform="rotate(-25 -40 -18)" /><ellipse cx="-14" cy="-40" rx="16" ry="24" /><ellipse cx="18" cy="-40" rx="16" ry="24" /><ellipse cx="45" cy="-15" rx="16" ry="23" transform="rotate(25 45 -15)" />
</g>;

const Behavior = ({ defense = false }: { defense?: boolean }) => {
  const f = useCurrentFrame();
  return <AbsoluteFill>
    <Backdrop file="edit/rdr-river.jpg" />
    <Heading kicker={defense ? 'RDR2 / GAMBÁS' : 'RDR2 / LOBOS'} title={defense ? 'FINGIR-SE\nDE MORTO' : 'CAÇA\nEM GRUPO'} color={coral} />
    <div style={{ position: 'absolute', left: 80, top: 600, width: 880, height: 690, background: '#12292be6', border: '2px solid #ff957c66', borderRadius: 24 }}>
      {defense ? <>
        <div style={{ margin: '82px 55px', fontSize: 45, letterSpacing: 4, color: coral }}>AMEAÇA</div>
        <svg width="770" height="160" viewBox="0 0 770 160" style={{ marginLeft: 55 }}><path d="M0 80 H210 L240 25 L275 140 L305 60 L330 80 H770" fill="none" stroke={coral} strokeWidth="9" strokeDasharray="1100" strokeDashoffset={interpolate(f, [0, 24], [1100, 0], clamp)} /></svg>
        <div style={{ margin: '55px', fontSize: 56, fontWeight: 900 }}>IMOBILIDADE</div>
      </> : <>
        <svg width="880" height="370" viewBox="0 0 880 370"><Paw x={220} y={130} color={coral} /><Paw x={440} y={105} color={coral} /><Paw x={660} y={130} color={coral} /><path d="M220 220 L440 310 L660 220 M440 200 V310" fill="none" stroke={cream} strokeWidth="5" opacity={interpolate(f, [8, 22], [0, 0.8], clamp)} /></svg>
        <div style={{ textAlign: 'center', fontSize: 76, fontWeight: 900, marginTop: 40 }}>COOPERAÇÃO</div>
      </>}
      <div style={{ position: 'absolute', bottom: 25, left: 35, fontSize: 26, opacity: 0.65 }}>ESQUEMA ILUSTRATIVO • COMPORTAMENTO CITADO</div>
    </div>
  </AbsoluteFill>;
};

const WildlifeNote = ({ puma = false }: { puma?: boolean }) => {
  const f = useCurrentFrame();
  return <AbsoluteFill>
    <Backdrop file={puma ? 'edit/gta-wetlands.jpg' : 'edit/gta-coast.jpg'} />
    <Heading kicker="GTA 6 / FAUNA CITADA" title={puma ? 'À ESPREITA' : 'CERVOS'} />
    <div style={{ position: 'absolute', top: 520, left: 80, width: 880, height: 800, border: `2px solid ${mint}55`, borderRadius: 24, overflow: 'hidden', background: '#102a2ae8' }}>
      <svg width="880" height="520" viewBox="0 0 880 520" fill="none" stroke={mint} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round">
        {puma ? <><path d="M200 280 Q440 130 680 280 Q440 420 200 280Z" /><ellipse cx="440" cy="277" rx="43" ry="82" fill={mint} /><path d="M220 380 H660 M280 420 H600" opacity="0.25" /></> : <><path d="M380 330 L355 220 L320 155 L295 75 M355 220 L250 195 L215 130 M320 155 L365 100 M500 330 L525 220 L560 155 L585 75 M525 220 L630 195 L665 130 M560 155 L515 100 M380 330 Q440 275 500 330 L478 420 Q440 450 402 420Z" /><path d="M402 420 L440 390 L478 420" /></>}
        <circle cx="440" cy="277" r={interpolate(f, [0, 80], [175, 230], clamp)} strokeWidth="2" opacity="0.25" />
      </svg>
      <div style={{ textAlign: 'center', fontSize: 58, fontWeight: 900 }}>{puma ? 'PUMA / FLORESTA' : 'JASON + LUCIA'}</div>
      <div style={{ position: 'absolute', left: 30, bottom: 35, right: 30, textAlign: 'center', fontSize: 28, color: '#abc3bb' }}>REPRESENTAÇÃO GRÁFICA • SEM CENA CORRESPONDENTE</div>
    </div>
  </AbsoluteFill>;
};

const SupportImage = ({ ocean = false }: { ocean?: boolean }) => <AbsoluteFill>
  <Backdrop file={ocean ? 'imagens/oceano_rdr2.jpg' : 'imagens/pantano_rdr2.jpg'} />
  <Heading kicker={ocean ? 'DA SUPERFÍCIE AO FUNDO' : 'DA TERRA À ÁGUA'} title={ocean ? 'ATÉ UM\nPEIXE-LEÃO' : 'NOS PÂNTANOS'} />
  <div style={{ position: 'absolute', top: 500, height: 875, width: 1080, overflow: 'hidden' }}>
    <Photo file={ocean ? 'imagens/oceano_rdr2.jpg' : 'imagens/pantano_rdr2.jpg'} position={ocean ? '78% 50%' : '73% 50%'} />
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 70%, #081719b0)' }} />
    <Source>IMAGEM DE APOIO FORNECIDA • ORIGEM NÃO CONFIRMADA</Source>
  </div>
</AbsoluteFill>;

const Caveat = () => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ background: ink }}>
    <Heading kicker="O DETALHE QUE MUDA A COMPARAÇÃO" title="APARECER" color={coral} />
    <div style={{ position: 'absolute', top: 420, left: 80, right: 100, textAlign: 'center', color: coral, fontSize: 230, fontWeight: 900, opacity: interpolate(f, [0, 10], [0, 1], clamp) }}>≠</div>
    <div style={{ position: 'absolute', top: 730, left: 80, fontSize: 99, letterSpacing: -5, fontWeight: 900 }}>SER INTELIGENTE</div>
    <div style={{ position: 'absolute', top: 940, left: 80, width: 880, height: 230, display: 'flex', gap: 16, overflow: 'hidden' }}><div style={{ width: 432, overflow: 'hidden' }}><Photo file="edit/rdr-bison.jpg" /></div><div style={{ width: 432, overflow: 'hidden' }}><Photo file="edit/gta-flamingos.jpg" /></div></div>
    <div style={{ position: 'absolute', top: 1230, left: 80, right: 110, fontSize: 46, color: mint, lineHeight: 1.25 }}>Fauna visível nos trailers.<br />Comportamento ainda em questão.</div>
  </AbsoluteFill>;
};

export const ClipRushVideo010 = () => <AbsoluteFill style={{ ...type, background: ink }}>
  <Track name="Montagem visual">
    <Sequence name="Gancho / comparação" durationInFrames={116}><Opening /></Sequence>
    <Sequence name="RDR2 / diversidade" from={116} durationInFrames={102}><Diversity /></Sequence>
    <Sequence name="Lobos / comportamento" from={218} durationInFrames={52}><Behavior /></Sequence>
    <Sequence name="Gambás / defesa" from={270} durationInFrames={77}><Behavior defense /></Sequence>
    <Sequence name="Entrada em Leonida" from={347} durationInFrames={80}><Scenic clip="gta-coast" kicker="AGORA / GTA 6" title="OLHA LEONIDA" source="GTA 6 • TRAILER 2 / AMBIENTAÇÃO" /></Sequence>
    <Sequence name="Cervos / representação" from={427} durationInFrames={79}><WildlifeNote /></Sequence>
    <Sequence name="Puma / representação" from={506} durationInFrames={96}><WildlifeNote puma /></Sequence>
    <Sequence name="Fauna / aves reais do trailer" from={602} durationInFrames={33}><Scenic clip="gta-flamingos" kicker="A NATUREZA CONTINUA" title="POR TODA PARTE" source="GTA 6 • TRAILER 1 / AVES" /></Sequence>
    <Sequence name="Pântano / ambiente" from={635} durationInFrames={39}><Scenic clip="gta-wetlands" kicker="A NATUREZA CONTINUA" title="TERRA + ÁGUA" source="GTA 6 • TRAILER 1 / PÂNTANO" /></Sequence>
    <Sequence name="Pântano / imagem de apoio" from={674} durationInFrames={41}><SupportImage /></Sequence>
    <Sequence name="Jacaré real do trailer" from={715} durationInFrames={43}><Scenic clip="gta-gator" kicker="JACARÉ / CENA DO TRAILER" title="ATÉ NA PISCINA" source="GTA 6 • TRAILER 1 / JACARÉ" position="60% 50%" /></Sequence>
    <Sequence name="Oceano / golfinhos" from={758} durationInFrames={31}><Scenic clip="gta-dolphins" kicker="NA ÁGUA" title="VIDA MARINHA" source="GTA 6 • TRAILER 1 / GOLFINHOS" position="75% 50%" /></Sequence>
    <Sequence name="Peixe-leão / imagem de apoio" from={789} durationInFrames={62}><SupportImage ocean /></Sequence>
    <Sequence name="Virada / pergunta sobre IA" from={851} durationInFrames={147}><Caveat /></Sequence>
    <Sequence name="Pergunta final" from={998} durationInFrames={191}><Opening ending /></Sequence>
  </Track>
  <Frame />
  <CaptionLine />
  <Audio name="Narração original integral" src={asset('audio/narracao.mp3')} />
</AbsoluteFill>;
