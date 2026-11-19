import React from 'react';
import {AbsoluteFill, Img, Html5Video, Audio, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import pages from './weather-captions.json';

const CYAN = '#98e3e1';
const GOLD = '#ffcf8a';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const folder = 'videos/biblioteca/gta6/imagens novas/';
const photos = ['Fog_clima.jfif', 'Mist_clima.jfif', 'Swamp_clima.jfif', 'Rain_clima.jfif', 'Tropical Storm_clima.jfif', 'Wind_clima.jfif'];
const gta5 = 'videos/biblioteca/gta5/videos/Grand Theft Auto V - Coming to New Generation Consoles [foUaOCzfIRU].mp4';
const rdr2 = 'videos/biblioteca/rdr2/videos/Red Dead Redemption 2 Trailer [gmA6MrX81z4].mp4';

function Backdrop({photo}: {photo: string}) {
  return <AbsoluteFill>
    <Img src={staticFile(folder + photo)} style={{width: '100%', height: '100%', objectFit: 'cover', opacity: 0.32, filter: 'blur(24px)', scale: 1.1}}/>
    <AbsoluteFill style={{background: 'linear-gradient(180deg,#080f1ae8 0%,#080f1a15 40%,#080f1a95 65%,#080f1a 91%)'}}/>
  </AbsoluteFill>;
}

function Heading({eyebrow, title, accent = CYAN}: {eyebrow: string; title: string; accent?: string}) {
  const frame = useCurrentFrame();
  return <div style={{position: 'absolute', top: 190, left: 80, right: 80,
    translate: `0 ${interpolate(frame, [0, 15], [18, 0], clamp)}px`}}>
    <div style={{fontSize: 27, letterSpacing: 5, color: accent, fontWeight: 700, marginBottom: 23}}>{eyebrow}</div>
    <div style={{fontSize: 88, lineHeight: 0.98, fontWeight: 900, letterSpacing: -3, whiteSpace: 'pre-line'}}>{title}</div>
  </div>;
}

type EvidenceProps = {photo: string; n: string; title: string; detail: string; description: string; focus: [number, number]; seconds: number; accent?: string};

function Evidence({photo, n, title, detail, description, focus, seconds, accent = CYAN}: EvidenceProps) {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return <AbsoluteFill>
    <Backdrop photo={photo}/>
    <Heading eyebrow={`GTA VI   /   CLIMA ${n} DE 06`} title={title} accent={accent}/>
    <div style={{position: 'absolute', top: 475, width: 1080, height: 608, overflow: 'hidden', boxShadow: '0 22px 70px #0008'}}>
      <Img src={staticFile(folder + photo)} style={{width: 1080, height: 608, objectFit: 'cover',
        transformOrigin: `${focus[0]}% ${focus[1]}%`, scale: interpolate(frame, [0, seconds * fps], [1.015, 1.11], clamp)}}/>
      <div style={{position: 'absolute', bottom: 0, width: 1080, height: 3, background: accent}}/>
    </div>
    <div style={{position: 'absolute', top: 1130, left: 80, width: 425}}>
      <div style={{fontSize: 25, color: accent, letterSpacing: 4, marginBottom: 18}}>OLHE O DETALHE</div>
      <div style={{fontSize: 52, fontWeight: 800, lineHeight: 1.03, whiteSpace: 'pre-line'}}>{detail}</div>
      <div style={{fontSize: 30, lineHeight: 1.25, color: '#cad5df', marginTop: 19}}>{description}</div>
    </div>
    <div style={{position: 'absolute', top: 1125, left: 555, width: 445, height: 300, overflow: 'hidden', border: `1px solid ${accent}70`}}>
      <Img src={staticFile(folder + photo)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: `${focus[0]}% ${focus[1]}%`, scale: interpolate(frame, [0, seconds * fps], [1.75, 1.95], clamp), transformOrigin: `${focus[0]}% ${focus[1]}%`}}/>
      <div style={{position: 'absolute', width: 22, height: 22, top: 16, left: 16, borderTop: `2px solid ${accent}`, borderLeft: `2px solid ${accent}`}}/>
      <div style={{position: 'absolute', width: 22, height: 22, bottom: 16, right: 16, borderBottom: `2px solid ${accent}`, borderRight: `2px solid ${accent}`}}/>
    </div>
  </AbsoluteFill>;
}

function IntroImage({photo, position, duration, direction = 1}: {photo: string; position: string; duration: number; direction?: number}) {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{overflow: 'hidden'}}>
    <Img src={staticFile(folder + photo)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: position,
      scale: interpolate(frame, [0, duration - 1], [1.045, 1.105], clamp),
      translate: `${interpolate(frame, [0, 2, duration - 1], [direction * 24, direction * 6, -direction * 10], clamp)}px ${interpolate(frame, [0, duration - 1], [8, -8], clamp)}px`}}/>
  </AbsoluteFill>;
}

function Intro() {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const second = frame / fps;
  return <AbsoluteFill>
    <Sequence name="Raio — impacto inicial" durationInFrames={18}><IntroImage photo={photos[4]} position="18% center" duration={18}/></Sequence>
    <Sequence name="Neblina — skyline" from={18} durationInFrames={15}><IntroImage photo={photos[0]} position="57% center" duration={15} direction={-1}/></Sequence>
    <Sequence name="Chuva — marina" from={33} durationInFrames={15}><IntroImage photo={photos[3]} position="50% center" duration={15}/></Sequence>
    <Sequence name="Tempestade — estrada" from={48} durationInFrames={15}><IntroImage photo={photos[5]} position="65% center" duration={15} direction={-1}/></Sequence>
    <Sequence name="Névoa — árvores" from={63} durationInFrames={15}><IntroImage photo={photos[1]} position="43% center" duration={15}/></Sequence>
    <Sequence name="Raio — céu" from={78} durationInFrames={15}><IntroImage photo={photos[4]} position="24% center" duration={15} direction={-1}/></Sequence>
    <Sequence name="Nuvens — pântano" from={93} durationInFrames={15}><IntroImage photo={photos[2]} position="66% center" duration={15}/></Sequence>
    <Sequence name="Chuva — reflexos" from={108} durationInFrames={15}><IntroImage photo={photos[3]} position="55% center" duration={15} direction={-1}/></Sequence>
    <Sequence name="Neblina — prédios" from={123} durationInFrames={15}><IntroImage photo={photos[0]} position="65% center" duration={15}/></Sequence>
    <Sequence name="Vento — litoral" from={138} durationInFrames={15}><IntroImage photo={photos[5]} position="55% center" duration={15} direction={-1}/></Sequence>
    <Sequence name="Raio — aproximação" from={153} durationInFrames={15}><IntroImage photo={photos[4]} position="20% center" duration={15}/></Sequence>
    <Sequence name="Névoa — paisagem" from={168} durationInFrames={15}><IntroImage photo={photos[1]} position="50% center" duration={15} direction={-1}/></Sequence>
    <Sequence name="Chuva — luzes" from={183} durationInFrames={15}><IntroImage photo={photos[3]} position="45% center" duration={15}/></Sequence>
    <Sequence name="Neblina — horizonte" from={198} durationInFrames={18}><IntroImage photo={photos[0]} position="60% center" duration={18} direction={-1}/></Sequence>
    <Sequence name="Raio — fechamento para GTA V" from={216} durationInFrames={18}><IntroImage photo={photos[4]} position="18% center" duration={18}/></Sequence>
    <AbsoluteFill style={{background: 'linear-gradient(#07101bdd, transparent 53%,#07101bf5 89%)'}}/>
    <Heading eyebrow="GTA VI  /  ARQUIVO CLIMÁTICO" title={second < 3.35 ? 'TEMPESTADES\nEM LEONIDA' : '6 IMAGENS.\nUM NOVO CLIMA.'} accent={GOLD}/>
    <div style={{position: 'absolute', top: 1320, left: 80, fontSize: 32, letterSpacing: 3, color: GOLD}}>O DETALHE ESTÁ NA ATMOSFERA.</div>
  </AbsoluteFill>;
}

function Archive({game, src, start, seconds}: {game: string; src: string; start: number; seconds: number}) {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return <AbsoluteFill>
    <Backdrop photo={photos[0]}/>
    <Heading eyebrow="ANTES DE LEONIDA" title={game} accent={GOLD}/>
    <div style={{position: 'absolute', top: 490, width: 1080, height: 850, overflow: 'hidden'}}>
      <Html5Video src={staticFile(src)} trimBefore={Math.round(start * fps)} muted style={{width: '100%', height: '100%', objectFit: 'cover', scale: interpolate(frame, [0, seconds * fps], [1.02, 1.09], clamp)}}/>
      <div style={{position: 'absolute', bottom: 0, left: 80, right: 80, height: 3, background: GOLD}}/>
    </div>
    <div style={{position: 'absolute', top: 1380, left: 80, color: '#c5d0da', fontSize: 28, letterSpacing: 2}}>ARQUIVO DO JOGO  /  REFERÊNCIA DE ATMOSFERA</div>
  </AbsoluteFill>;
}

function Cta() {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = spring({frame, fps, config: {damping: 17, stiffness: 130}});
  const confirmed = frame > 30;
  return <AbsoluteFill>
    <Backdrop photo={photos[5]}/>
    <Heading eyebrow="GTA VI  /  AINDA TEM MAIS" title={'CURTIU\nESSE CLIMA?'} accent={GOLD}/>
    <div style={{position: 'absolute', top: 515, width: 1080, height: 608, overflow: 'hidden'}}><Img src={staticFile(folder + photos[5])} style={{width: '100%', height: '100%'}}/></div>
    <div style={{position: 'absolute', top: 1200, left: 100, width: 880, height: 180, borderRadius: 28, background: confirmed ? CYAN : GOLD, color: '#07121c', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 25, scale: pop, fontWeight: 900, fontSize: 47}}>
      <svg width="65" height="65" viewBox="0 0 24 24" fill="currentColor"><path d="M2 10h4v12H2zM8 10l5-8c3 0 2 5 1 7h6c2 0 2 2 1 5l-2 7H8z"/></svg>
      {confirmed ? 'CURTIU!  ✓  SEGUINDO' : 'CURTIR  +  SEGUIR'}
    </div>
    <svg width="78" height="90" viewBox="0 0 50 60" style={{position: 'absolute', left: interpolate(frame, [0, 23, 30, 45], [920, 815, 815, 850], clamp), top: interpolate(frame, [0, 23, 30, 45], [1470, 1300, 1300, 1370], clamp), scale: interpolate(frame, [23, 27, 31], [1, 0.8, 1], clamp), opacity: interpolate(frame, [0, 8, 45, 55], [0, 1, 1, 0], clamp)}}><path d="M5 3L5 46L17 35L27 56L37 51L27 31L44 30Z" fill="white" stroke="#08121a" strokeWidth="3"/></svg>
    {Array.from({length: 8}, (_, i) => <div key={i} style={{position: 'absolute', left: 540 + Math.cos(i * Math.PI / 4) * frame * 5, top: 1290 + Math.sin(i * Math.PI / 4) * frame * 4, width: 9, height: 9, background: GOLD, borderRadius: '50%', opacity: interpolate(frame, [0, 6, 23], [0, 1, 0], clamp)}}/>)}
    <Sequence from={27} durationInFrames={10}><Audio src={staticFile('videos/video-025/audio/cta-tick.wav')} volume={0.25}/></Sequence>
  </AbsoluteFill>;
}

function LocalWeather() {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const reveal = frame / fps > 2.3;
  return <AbsoluteFill>
    <Backdrop photo={photos[2]}/>
    <Heading eyebrow="A POSSÍVEL EVOLUÇÃO" title={reveal ? 'SOL AQUI.\nCHUVA LÁ LONGE.' : 'O CLIMA PODE\nSER LOCAL.'} accent={GOLD}/>
    <div style={{position: 'absolute', top: 490, width: 1080, height: 610, overflow: 'hidden'}}>
      <Img src={staticFile(folder + photos[2])} style={{width: 1080, height: 610, scale: interpolate(frame, [0, 6.9 * fps], [1.01, 1.09], clamp)}}/>
      <div style={{position: 'absolute', top: 65, left: 95, padding: '13px 22px', background: '#07121ccd', borderLeft: `3px solid ${GOLD}`, color: GOLD, fontWeight: 800, fontSize: 30}}>PERTO</div>
      <div style={{position: 'absolute', top: 65, right: 95, padding: '13px 22px', background: '#07121ccd', borderLeft: `3px solid ${CYAN}`, color: CYAN, fontWeight: 800, fontSize: 30}}>AO LONGE</div>
    </div>
    <div style={{position: 'absolute', top: 1160, left: 80, right: 80, fontSize: 51, fontWeight: 800, lineHeight: 1.1}}>Diferentes condições.<br/><span style={{color: GOLD}}>Na mesma paisagem.</span></div>
    <div style={{position: 'absolute', top: 1360, left: 80, right: 80, fontSize: 29, lineHeight: 1.3, color: '#c5d0da'}}>HIPÓTESE DA NARRAÇÃO · IMAGEM ILUSTRATIVA<br/>Uma imagem estática não comprova a mecânica.</div>
  </AbsoluteFill>;
}

function Persistence() {
  return <AbsoluteFill>
    <Evidence photo={photos[3]} n="04" title={'E DEPOIS\nDA TEMPESTADE?'} detail={'A água\npermanece?'} description="Reflexos visíveis no asfalto." focus={[52, 91]} seconds={3} accent={GOLD}/>
    <div style={{position: 'absolute', top: 1462, left: 80, fontSize: 27, color: GOLD}}>PERSISTÊNCIA DAS POÇAS: HIPÓTESE DA NARRAÇÃO</div>
  </AbsoluteFill>;
}

function Ending() {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return <AbsoluteFill>
    <Backdrop photo={photos[4]}/>
    <Heading eyebrow="A PRÓXIMA GERAÇÃO DA ATMOSFERA?" title={'RED DEAD 2\nFOI SUPERADO?'} accent={GOLD}/>
    <div style={{position: 'absolute', top: 500, width: 1080, height: 415, overflow: 'hidden'}}>
      <Html5Video src={staticFile(rdr2)} trimBefore={Math.round(24 * fps)} muted style={{width: 1080, height: 608, objectFit: 'cover', translate: '0 -95px'}}/>
      <div style={{position: 'absolute', bottom: 22, left: 80, fontSize: 33, fontWeight: 800, textShadow: '0 2px 8px #000'}}>RED DEAD REDEMPTION 2 · ARQUIVO</div>
    </div>
    <div style={{position: 'absolute', top: 930, width: 1080, height: 500, overflow: 'hidden', borderTop: `3px solid ${GOLD}`}}>
      <Img src={staticFile(folder + photos[4])} style={{width: 1080, height: 608, objectFit: 'cover', scale: interpolate(frame, [0, 3.133 * fps], [1, 1.06], clamp)}}/>
      <div style={{position: 'absolute', bottom: 22, left: 80, fontSize: 33, fontWeight: 800, textShadow: '0 2px 8px #000'}}>GTA VI · IMAGEM DA BIBLIOTECA</div>
    </div>
  </AbsoluteFill>;
}

function Captions() {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ms = frame / fps * 1000;
  const page = pages.find((p, i) => ms >= p.startMs && ms < Math.min(p.endMs + 100, pages[i + 1]?.startMs ?? Infinity));
  if (!page) return null;
  return <div style={{position: 'absolute', top: 1560, left: 80, right: 95, display: 'flex', justifyContent: 'center'}}>
    <div style={{fontSize: 59, lineHeight: 1.15, fontWeight: 900, textAlign: 'center', textWrap: 'balance', borderRadius: 16, padding: '15px 23px', background: '#07101be8', textShadow: '0 3px 5px #000', scale: interpolate(ms - page.startMs, [0, 100], [0.98, 1], clamp)}}>
      {page.words.map((word, i) => <span key={i} style={{color: ms >= word.startMs && ms < word.endMs + 35 ? GOLD : 'white'}}>{word.text.trim()}{' '}</span>)}
    </div>
  </div>;
}

export const Weather025: React.FC = () => <AbsoluteFill style={{background: '#080f1a', color: '#fff', fontFamily: 'Arial, sans-serif'}}>
  <Sequence name="Gancho — seis imagens" durationInFrames={234}><Intro/></Sequence>
  <Sequence name="Arquivo GTA V" from={234} durationInFrames={99}><Archive game="GTA V" src={gta5} start={14.4} seconds={3.3}/></Sequence>
  <Sequence name="Arquivo RDR2" from={333} durationInFrames={111}><Archive game={'RED DEAD\nREDEMPTION 2'} src={rdr2} start={24} seconds={3.7}/></Sequence>
  <Sequence name="01 — neblina em Vice City" from={444} durationInFrames={129}><Evidence photo={photos[0]} n="01" title={'A CIDADE\nDESAPARECE.'} detail={'Prédios\nna neblina.'} description="Observe o horizonte e a ponte." focus={[57, 57]} seconds={4.3}/></Sequence>
  <Sequence name="02 — névoa baixa" from={573} durationInFrames={93}><Evidence photo={photos[1]} n="02" title={'NÉVOA\nRASTEIRA.'} detail={'Entre\nas árvores.'} description="Uma camada rente ao terreno." focus={[46, 65]} seconds={3.1}/></Sequence>
  <Sequence name="03 — pântanos" from={666} durationInFrames={78}><Evidence photo={photos[2]} n="03" title={'O CÉU\nMUDA TUDO.'} detail={'O pântano\nsob tensão.'} description="Nuvens sobre a planície." focus={[65, 30]} seconds={2.6} accent={GOLD}/></Sequence>
  <Sequence name="04 — reflexos na marina" from={744} durationInFrames={96}><Evidence photo={photos[3]} n="04" title={'CHUVA.\nLUZ. REFLEXO.'} detail={'Olhe\no asfalto.'} description="As luzes se espalham no piso." focus={[52, 87]} seconds={3.2}/></Sequence>
  <Sequence name="05 — raio no litoral" from={840} durationInFrames={75}><Evidence photo={photos[4]} n="05" title={'UM RAIO\nNO LITORAL.'} detail={'O céu\nse ilumina.'} description="O raio já está na imagem." focus={[30, 41]} seconds={2.5} accent={GOLD}/></Sequence>
  <Sequence name="06 — vento na estrada" from={915} durationInFrames={111}><Evidence photo={photos[5]} n="06" title={'A ESTRADA\nSOB MAU TEMPO.'} detail={'Viagem\nsob pressão.'} description="Nuvens escuras e pista molhada." focus={[62, 66]} seconds={3.7}/></Sequence>
  <Sequence name="CTA integrado à narração" from={1026} durationInFrames={63}><Cta/></Sequence>
  <Sequence name="Possibilidade — clima localizado" from={1089} durationInFrames={207}><LocalWeather/></Sequence>
  <Sequence name="Possibilidade — persistência da água" from={1296} durationInFrames={90}><Persistence/></Sequence>
  <Sequence name="Pergunta final — RDR2 e GTA VI" from={1386} durationInFrames={94}><Ending/></Sequence>
  <Audio src={staticFile('videos/video-025/audio/narracao.mp3')}/>
  <Captions/>
  <div style={{position: 'absolute', top: 108, left: 80, right: 80, display: 'flex', justifyContent: 'space-between', color: '#e0e8ef99', fontSize: 23, fontWeight: 700, letterSpacing: 4}}><span>CLIPRUSH</span><span>GTA VI</span></div>
</AbsoluteFill>;
