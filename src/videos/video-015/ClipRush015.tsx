import React, {useEffect, useState} from 'react';
import type {Caption} from '@remotion/captions';
import {AbsoluteFill, Audio, Freeze, Img, OffthreadVideo, Sequence, cancelRender, continueRender, delayRender, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import captionData from './captions.json';

// Frame-accurate short derivatives from the indexed original; see recortes-v001.json.
const A = 'videos/video-015/media/jason-v001.mp4';
const B = 'videos/biblioteca/gta6/videos/Grand Theft Auto VI： Pré-carregue agora [sXCiA142w8Y].webm';
const T2 = 'videos/biblioteca/gta6/videos/Trailer 2 GTA VI.mp4';
const GOLD = '#f4e595';
const CYAN = '#90dedb';
const PINK = '#e8accf';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

type FootageProps = {
  src: string;
  sourceIn: number;
  count: number;
  rate?: number;
  delay?: number;
  position?: string;
  zoom?: number;
};

// Source time is always measured at 30 fps. A held endpoint never loops a take.
const Footage: React.FC<FootageProps> = ({src, sourceIn, count, rate = 1, delay = 0, position = '50% 50%', zoom = 1}) => {
  const frame = useCurrentFrame();
  const active = Math.max(0, Math.min(Math.ceil(count / rate) - 1, frame - delay));
  return <Freeze frame={active}>
    <OffthreadVideo src={staticFile(src)} trimBefore={sourceIn} trimAfter={sourceIn + count} playbackRate={rate} muted style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: position, scale: zoom, transformOrigin: position}} />
  </Freeze>;
};

const Shot: React.FC<FootageProps & {fade?: boolean; proof?: boolean; replay?: boolean; fragment?: boolean}> = ({fade = true, proof = false, replay = false, fragment = false, ...props}) => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{opacity: fade ? interpolate(frame, [0, 6], [0, 1], clamp) : 1}}>
    {proof ? <>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 80% 60%, #263b42 0%, #101b25 40%, #090e16 80%)'}} />
      <div style={{position: 'absolute', left: 40, top: 440, width: 1000, height: 1060, overflow: 'hidden', borderRadius: 22, boxShadow: '0 24px 90px #0009', border: '1px solid #ffffff30'}}>
        <Footage {...props} zoom={replay ? interpolate(frame, [0, 10], [1, 1.17], clamp) : 1} />
        {replay && <div style={{position: 'absolute', inset: 0, opacity: interpolate(frame, [2, 6, 23, 27], [0, 1, 1, 0], clamp)}}>
          <div style={{position: 'absolute', left: 385, top: interpolate(frame, [6, 21], [960, 990], clamp), width: 130, height: 60, borderRadius: '50%', border: `5px solid ${GOLD}`, boxShadow: '0 0 0 2px #0008'}} />
          <div style={{position: 'absolute', left: 60, bottom: 165, padding: '12px 20px', background: '#111b22ef', borderRadius: 10, fontSize: 30, color: GOLD}}>SAÍDA DO PÍER</div>
        </div>}
        {replay && frame >= 71 && <div style={{position: 'absolute', right: 25, bottom: 25, background: '#0a1323dc', borderRadius: 8, padding: '10px 18px', fontSize: 25}}>PAUSA DO REPLAY</div>}
      </div>
      <div style={{position: 'absolute', left: 65, top: 390, fontSize: 25, color: props.src === A ? CYAN : PINK, letterSpacing: 1.8}}>{replay ? 'REPLAY EXPLICATIVO · 0,75×' : fragment ? `${props.src === A ? 'JASON' : 'NPC'} · PRÉVIA DO MOVIMENTO` : props.src === A ? 'JASON · TRECHO COMPLETO · 1×' : 'NPC · TRECHO COMPLETO · 1×'}</div>
    </> : <>
      <Footage {...props} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, #050d17d9 0%, #050d1760 25%, transparent 48%, #050d1770 68%, #050d17f7 100%)'}} />
    </>}
  </AbsoluteFill>;
};

const Heading: React.FC<{eyebrow: string; line1: string; line2: string; credit: string; tone?: string}> = ({eyebrow, line1, line2, credit, tone = GOLD}) => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{pointerEvents: 'none'}}>
    <div style={{position: 'absolute', left: 68, top: 120, width: 870}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 14, fontSize: 24, letterSpacing: 3, color: tone, marginBottom: 22}}><span style={{width: 9, height: 9, borderRadius: '50%', background: tone}} />{eyebrow}</div>
      <div style={{fontSize: 83, lineHeight: 1.02, letterSpacing: -3, textShadow: '0 4px 30px #0009', translate: `0 ${interpolate(frame, [0, 8], [8, 0], clamp)}px`}}>{line1}<br /><span style={{color: tone}}>{line2}</span></div>
    </div>
    <div style={{position: 'absolute', left: 70, bottom: 112, fontSize: 21, letterSpacing: 1.2, color: '#d5dee6', textShadow: '0 2px 8px #000'}}>{credit}</div>
  </AbsoluteFill>;
};

const Comparison: React.FC = () => {
  const frame = useCurrentFrame();
  const reveal = interpolate(frame, [0, 10], [0, 1], clamp);
  return <AbsoluteFill style={{background: 'linear-gradient(155deg, #14272c, #0a101a 60%, #201524)'}}>
    <div style={{position: 'absolute', left: 48, top: 410, width: 984, height: interpolate(frame, [0, 10], [1060, 550], clamp), borderRadius: 18, overflow: 'hidden', border: '1px solid #90dedb70'}}>
      <Footage src={A} sourceIn={0} count={53} delay={16} position="45% 100%" zoom={interpolate(frame, [0, 10], [1, 1.22], clamp)} />
    </div>
    <div style={{position: 'absolute', left: 48, top: 1020, width: 984, height: 550, borderRadius: 18, overflow: 'hidden', border: '1px solid #e8accf70', clipPath: `inset(0 ${(1-reveal)*50}% round 18px)`}}>
      <Footage src={B} sourceIn={138} count={44} delay={10} position="35% 50%" />
    </div>
    <div style={{position: 'absolute', left: 68, right: 145, top: 365, display: 'flex', justifyContent: 'space-between', fontSize: 29, color: CYAN, opacity: reveal}}><span>A / JASON</span><span>1×</span></div>
    <div style={{position: 'absolute', left: 68, right: 145, top: 980, display: 'flex', justifyContent: 'space-between', fontSize: 29, color: PINK, opacity: reveal}}><span>B / NPC</span><span>1×</span></div>
    <div style={{position: 'absolute', left: 68, top: 1760, fontSize: 22, color: '#adbac6'}}>MESMA VELOCIDADE · SAÍDA DO APOIO ALINHADA</div>
  </AbsoluteFill>;
};

const FrozenHypothesis: React.FC = () => <AbsoluteFill style={{background: 'linear-gradient(160deg, #182b34, #111827 60%, #291e30)'}}>
  <div style={{position: 'absolute', left: 55, top: 470, width: 970, height: 475, overflow: 'hidden', borderRadius: 16}}>
    <Img src={staticFile('videos/video-015/stills/A-v001.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '45% 100%'}} />
  </div>
  <div style={{position: 'absolute', left: 55, top: 1060, width: 970, height: 475, overflow: 'hidden', borderRadius: 16}}>
    <Img src={staticFile('videos/video-015/stills/B-v001.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
  </div>
  <div style={{position: 'absolute', left: 70, top: 412, fontSize: 37, color: CYAN}}>GAMEPLAY?</div>
  <div style={{position: 'absolute', left: 70, top: 993, fontSize: 37, color: PINK}}>CENA CINEMATOGRÁFICA?</div>
  <div style={{position: 'absolute', left: 70, top: 1755, fontSize: 23, color: '#c1c8d1'}}>FRAMES CONGELADOS · CLASSIFICAÇÃO NÃO CONFIRMADA</div>
</AbsoluteFill>;

const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ms = frame / fps * 1000;
  const current: Caption | undefined = captionData.find(c => ms >= c.startMs && ms < c.endMs);
  if (!current) return null;
  const words = current.text.split(' ');
  const highlight = words.findIndex(w => /mudou|mortal|estranho|girar|depois|natural|fluido|diferença|melhorou|gameplay|cinematográfica|corrigiu|coincidência/i.test(w));
  return <div style={{position: 'absolute', top: 1572, left: 65, width: 880, minHeight: 132, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none'}}>
    <div style={{fontSize: 57, lineHeight: 1.15, textAlign: 'center', letterSpacing: -1.5, maxWidth: 880, padding: '17px 24px', borderRadius: 17, background: '#06101bea', boxShadow: '0 5px 30px #0007', translate: `0 ${interpolate(frame-current.startMs/1000*fps, [0, 4], [7, 0], clamp)}px`}}>
      {words.map((word, i) => <React.Fragment key={i}>{i > 0 ? ' ' : ''}<span style={{color: i === highlight ? GOLD : 'white'}}>{word}</span></React.Fragment>)}
    </div>
  </div>;
};

export const ClipRush015: React.FC = () => {
  const [fontHandle] = useState(() => delayRender('Load bundled video-015 Arial Bold'));
  useEffect(() => {
    const font = new FontFace('ClipRush015', `url("${staticFile('videos/video-015/fonts/Arial-Bold.ttf')}")`, {weight: '700'});
    font.load().then(loaded => {document.fonts.add(loaded); continueRender(fontHandle);}).catch(cancelRender);
  }, [fontHandle]);
  return <AbsoluteFill style={{background: '#0a101a', color: 'white', fontFamily: 'ClipRush015, Arial, sans-serif', fontWeight: 700}}>
    <Audio src={staticFile('videos/video-015/audio/narracao.mp3')} volume={1} />

    <Sequence name="Gancho A · fragmento, não replay" durationInFrames={39}><Shot src={A} sourceIn={8} count={33} proof fragment fade={false} position="45% 50%" /></Sequence>
    <Sequence name="Match cut B · fragmento" from={27} durationInFrames={24}><Shot src={B} sourceIn={164} count={18} proof fragment position="35% 50%" /></Sequence>
    <Sequence name="Costa · contexto inédito" from={45} durationInFrames={78}><Shot src={T2} sourceIn={184} count={58} rate={0.8} /></Sequence>
    <Sequence name="Ambiente aquático · barco" from={117} durationInFrames={51}><Shot src="videos/video-015/media/barco-rio-v001.mp4" sourceIn={0} count={45} /></Sequence>
    <Sequence name="Jason · integral 53 frames a 1x" from={162} durationInFrames={59}><Shot src={A} sourceIn={0} count={53} proof position="45% 50%" /></Sequence>
    <Sequence name="Água · jet ski, take novo" from={215} durationInFrames={61}><Shot src="videos/video-015/media/jet-ski-v001.mp4" sourceIn={0} count={55} /></Sequence>
    <Sequence name="Praia · take novo" from={270} durationInFrames={80}><Shot src="videos/video-015/media/praia-v001.mp4" sourceIn={0} count={74} /></Sequence>
    <Sequence name="Contexto · mergulho, take novo" from={344} durationInFrames={92}><Shot src="videos/video-015/media/mergulho-v001.mp4" sourceIn={0} count={80} rate={0.9} /></Sequence>
    <Sequence name="Único replay explicativo · 0,75x" from={430} durationInFrames={92}><Shot src={A} sourceIn={0} count={53} rate={0.75} proof replay position="45% 100%" /></Sequence>
    <Sequence name="Barco na costa · take novo" from={516} durationInFrames={114}><Shot src="videos/video-015/media/barco-costa-v001.mp4" sourceIn={0} count={103} rate={0.95} /></Sequence>
    <Sequence name="NPC · integral 44 frames a 1x" from={624} durationInFrames={50}><Shot src={B} sourceIn={138} count={44} proof position="35% 50%" /></Sequence>
    <Sequence name="Casa costeira · take novo" from={668} durationInFrames={49}><Shot src={T2} sourceIn={244} count={43} /></Sequence>
    <Sequence name="Comparação principal · saídas alinhadas" from={711} durationInFrames={81}><Comparison /></Sequence>
    <Sequence name="Dúvida · movimento de academia, take novo" from={786} durationInFrames={122}><Shot src="videos/video-015/media/academia-v001.mp4" sourceIn={0} count={104} rate={0.9} /></Sequence>
    <Sequence name="Contraponto · só frames congelados" from={902} durationInFrames={159}><FrozenHypothesis /></Sequence>
    <Sequence name="Pergunta · píer, take novo" from={1055} durationInFrames={69}><Shot src={T2} sourceIn={2442} count={51} rate={0.8} /></Sequence>
    <Sequence name="Fim · água ao pôr do sol, take novo" from={1118} durationInFrames={74}><Shot src={T2} sourceIn={2493} count={60} rate={0.8} /></Sequence>

    <Sequence name="Título · pergunta" durationInFrames={117}><Heading eyebrow="CLIPRUSH / ANÁLISE" line1="MUDOU" line2="O MORTAL?" credit="A: VERSÃO ESTENDIDA · B: PRÉ-DOWNLOAD" /></Sequence>
    <Sequence name="Título · fonte A" from={117} durationInFrames={227}><Heading eyebrow="01 / VERSÃO ESTENDIDA" line1="O SALTO" line2="DO JASON" credit="ACERVO GTA VI · VERSÃO ESTENDIDA" tone={CYAN} /></Sequence>
    <Sequence name="Título · detalhe" from={344} durationInFrames={172}><Heading eyebrow="02 / O DETALHE DO GIRO" line1="COMEÇA A" line2="GIRAR DEPOIS?" credit="REPLAY ÚNICO · FONTE A: 17:24:07–17:26:00" tone={CYAN} /></Sequence>
    <Sequence name="Título · fonte B" from={516} durationInFrames={195}><Heading eyebrow="03 / OUTRO MOVIMENTO" line1="OLHA O" line2="NOVO SALTO" credit="FONTE B: PRÉ-DOWNLOAD · 04:18–06:02" tone={PINK} /></Sequence>
    <Sequence name="Título · comparação" from={711} durationInFrames={75}><Heading eyebrow="04 / JASON × NPC" line1="OLHA A" line2="DIFERENÇA" credit="A: VERSÃO ESTENDIDA · B: PRÉ-DOWNLOAD" /></Sequence>
    <Sequence name="Título · hipótese" from={786} durationInFrames={116}><Heading eyebrow="HIPÓTESE · SEM CONFIRMAÇÃO" line1="FOI UMA" line2="CORREÇÃO?" credit="B-ROLL: OUTRO MOVIMENTO DO ACERVO GTA VI" /></Sequence>
    <Sequence name="Título · contraponto" from={902} durationInFrames={153}><Heading eyebrow="HIPÓTESE · SEM CONFIRMAÇÃO" line1="CONTEXTOS" line2="DIFERENTES?" credit="A + B · FRAMES REAIS DAS FONTES" /></Sequence>
    <Sequence name="Título · fechamento" from={1055} durationInFrames={137}><Heading eyebrow="E VOCÊ, O QUE ACHA?" line1="CORRIGIU OU" line2="COINCIDÊNCIA?" credit="ACERVO GTA VI · TRAILER 2" /></Sequence>
    <Captions />
  </AbsoluteFill>;
};
