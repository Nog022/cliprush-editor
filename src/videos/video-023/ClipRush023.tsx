import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import pages from './caption-pages.json';

const BULLY = 'videos/biblioteca/bully/Bully： Scholarship Edition Official Trailer [yqkynwFs9Hs].mp4';
const GTA = 'videos/biblioteca/gta6/videos/Trailer 2 GTA VI.mp4';
const GOLD = '#f1ca79';
const MINT = '#a5e6cc';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

type ShotProps = {
  game: 'bully' | 'gta';
  start: number;
  duration: number;
  title: string;
  kicker?: string;
  focus?: number;
  children?: React.ReactNode;
};

function Shot({game, start, duration, title, kicker, focus = 50, children}: ShotProps) {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const color = game === 'bully' ? GOLD : MINT;
  return <AbsoluteFill style={{background: '#0a1013'}}>
    <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 75% 30%, ${color}20, transparent 65%)`}}/>
    <div style={{position: 'absolute', top: 420, left: 0, width: 1080, height: 1000, overflow: 'hidden'}}>
      <OffthreadVideo src={staticFile(game === 'bully' ? BULLY : GTA)} trimBefore={Math.round(start * fps)} muted style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: `${focus}% 50%`, scale: interpolate(frame, [0, duration], [1.01, 1.075], clamp), filter: 'contrast(1.05) saturate(0.92)'}}/>
      <AbsoluteFill style={{background: 'linear-gradient(180deg,#0a1013 0%,transparent 12%,transparent 80%,#0a1013 100%)'}}/>
    </div>
    <div style={{position: 'absolute', left: 84, top: 165, right: 84, translate: `0 ${interpolate(frame, [0, 12], [22, 0], {...clamp, easing: Easing.out(Easing.cubic)})}px`, opacity: interpolate(frame, [0, 7], [.35, 1], clamp)}}>
      <div style={{color, fontSize: 25, fontWeight: 700, letterSpacing: 4, marginBottom: 23}}>{kicker ?? (game === 'bully' ? 'BULLY' : 'GTA VI · HIPÓTESE')}</div>
      <div style={{fontSize: 83, fontWeight: 900, lineHeight: 1.02, letterSpacing: -3, maxWidth: 900, textWrap: 'balance'}}>{title}</div>
    </div>
    <div style={{position: 'absolute', left: 84, top: 1435, fontSize: 21, color: '#b8c0c3', letterSpacing: 1.2}}>{game === 'bully' ? 'BULLY • TRAILER ILUSTRATIVO' : 'GTA VI • TRAILER 2'}</div>
    {children}
  </AbsoluteFill>;
}

function EnglishLesson() {
  const frame = useCurrentFrame();
  return <div style={{position: 'absolute', left: 84, right: 84, top: 1210, background: '#0a1013ed', padding: '26px 30px', borderLeft: `5px solid ${GOLD}`}}>
    <div style={{fontSize: 34, fontWeight: 800, marginBottom: 20}}>INGLÊS · 5ª AULA</div>
    <div style={{display: 'flex', gap: 13}}>{[0, 1, 2, 3, 4].map(i => <div key={i} style={{height: 13, flex: 1, background: frame > i * 6 ? GOLD : '#354044'}}/>)}</div>
  </div>;
}

function Conversation({question = false}: {question?: boolean}) {
  const frame = useCurrentFrame();
  return <div style={{position: 'absolute', left: 120, right: 120, top: 1170, padding: '27px 36px', borderRadius: '28px 28px 28px 4px', background: '#101b22ed', border: `2px solid ${question ? MINT : GOLD}`, scale: spring({frame, fps: 30, config: {damping: 18, stiffness: 160}})}}>
    <div style={{fontSize: 49, fontWeight: 800, color: question ? MINT : GOLD}}>{question ? 'Resolver na conversa?' : 'Pedir desculpas'}</div>
    <div style={{fontSize: 23, color: '#d7dcde', marginTop: 12}}>{question ? 'Mecânica em GTA VI ainda não confirmada' : 'Representação gráfica da mecânica de Bully'}</div>
  </div>;
}

function CTA() {
  const frame = useCurrentFrame();
  const liked = frame >= 37;
  const followed = frame >= 64;
  return <div style={{position: 'absolute', left: 100, right: 100, top: 1155, display: 'flex', gap: 20, scale: spring({frame, fps: 30, config: {damping: 18}})}}>
    <div style={{flex: 1, background: liked ? GOLD : '#172027', color: liked ? '#141718' : '#fff', borderRadius: 20, padding: '28px 20px', fontSize: 38, fontWeight: 800, textAlign: 'center', scale: interpolate(frame, [36, 40, 48], [1, 1.12, 1], clamp)}}>{liked ? '♥ Curtiu' : '♡ Curtir'}</div>
    <div style={{flex: 1, background: followed ? MINT : '#f2f1e9', color: '#10191e', borderRadius: 20, padding: '28px 20px', fontSize: 38, fontWeight: 800, textAlign: 'center'}}>{followed ? '✓ Seguindo' : '+ Seguir'}</div>
    {[0, 1, 2, 3, 4, 5].map(i => <div key={i} style={{position: 'absolute', left: 215, top: 45, width: 10, height: 10, borderRadius: 10, background: GOLD, opacity: interpolate(frame, [37, 41, 54], [0, 1, 0], clamp), translate: `${Math.cos(i * Math.PI / 3) * interpolate(frame, [37, 54], [25, 150], clamp)}px ${Math.sin(i * Math.PI / 3) * interpolate(frame, [37, 54], [25, 150], clamp)}px`}}/>)}
  </div>;
}

function Captions() {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ms = frame / fps * 1000;
  const page = pages.find((p, i) => ms >= p.startMs && ms < Math.min(p.endMs + 95, pages[i + 1]?.startMs ?? Infinity));
  if (!page) return null;
  return <div style={{position: 'absolute', left: 84, right: 84, top: 1540, display: 'flex', justifyContent: 'center'}}>
    <div style={{textAlign: 'center', fontSize: 57, lineHeight: 1.2, fontWeight: 800, textShadow: '0 3px 8px #000', textWrap: 'balance'}}>{page.words.map((word, i) => <span key={i} style={{color: ms >= word.startMs && ms < word.endMs + 35 ? GOLD : '#fff'}}>{word.text}{' '}</span>)}</div>
  </div>;
}

export const ClipRush023: React.FC = () => <AbsoluteFill style={{background: '#0a1013', color: '#f4f3ed', fontFamily: 'Arial, sans-serif'}}>
  <Audio src={staticFile('videos/video-023/audio/narracao.mp3')}/>
  <Sequence name="Gancho — a ideia de Bully em GTA VI" durationInFrames={124}>
    <Shot game="gta" start={66.1} duration={124} title="Uma ideia de Bully em GTA VI?"/>
  </Sequence>
  <Sequence name="Gancho — escapar na conversa" from={124} durationInFrames={85}>
    <Shot game="bully" start={48} duration={85} title="Escapar só na conversa?" kicker="A MECÂNICA DE BULLY" focus={48}/>
  </Sequence>
  <Sequence name="A quinta aula de inglês" from={209} durationInFrames={134}>
    <Shot game="bully" start={13} duration={134} title="Inglês valia mais que uma nota." kicker="BULLY · A HABILIDADE" focus={53}><EnglishLesson/></Shot>
  </Sequence>
  <Sequence name="Jimmy aprende a pedir desculpas" from={343} durationInFrames={94}>
    <Shot game="bully" start={28} duration={94} title="O poder de pedir desculpas." kicker="BULLY · JIMMY HOPKINS" focus={46}><Conversation/></Shot>
  </Sequence>
  <Sequence name="Pequenas infrações" from={437} durationInFrames={101}>
    <Shot game="bully" start={46.8} duration={101} title="Até pequenas infrações." kicker="BULLY · PERSUASÃO" focus={56}/>
  </Sequence>
  <Sequence name="A referência original de 2006" from={538} durationInFrames={84}>
    <Shot game="bully" start={18} duration={84} title="Isso já existia em 2006." kicker="BULLY · A IDEIA ORIGINAL" focus={65}/>
  </Sequence>
  <Sequence name="CTA — curtir e seguir" from={622} durationInFrames={80}>
    <Shot game="bully" start={38.2} duration={80} title="Curtiu esse detalhe?" kicker="BULLY"><CTA/></Shot>
  </Sequence>
  <Sequence name="A ponte para GTA VI" from={702} durationInFrames={47}>
    <Shot game="gta" start={6.6} duration={47} title="Agora, GTA VI." kicker="A PRÓXIMA PERGUNTA" focus={48}/>
  </Sequence>
  <Sequence name="Interações e personagens" from={749} durationInFrames={143}>
    <Shot game="gta" start={55.1} duration={143} title="Conversas com personagens." kicker="GTA VI · INTERAÇÕES" focus={57}/>
  </Sequence>
  <Sequence name="Hipótese — resolver problemas conversando" from={892} durationInFrames={124}>
    <Shot game="gta" start={44.8} duration={124} title="E escapar dos problemas?" focus={62}><Conversation question/></Shot>
  </Sequence>
  <Sequence name="A ressalva da narração" from={1016} durationInFrames={62}>
    <Shot game="gta" start={64} duration={62} title="Ainda não foi confirmado." kicker="GTA VI · HIPÓTESE" focus={45}/>
  </Sequence>
  <Sequence name="A herança de Bully" from={1078} durationInFrames={69}>
    <Shot game="bully" start={42} duration={69} title="A ideia de Bully…" kicker="UMA POSSIBILIDADE" focus={36}/>
  </Sequence>
  <Sequence name="Fechamento — outro nível em Vice City" from={1147} durationInFrames={74}>
    <Shot game="gta" start={8.3} duration={74} title="…em outro nível em Vice City?" kicker="GTA VI · HIPÓTESE"/>
  </Sequence>
  <Captions/>
  <div style={{position: 'absolute', left: 84, top: 80, fontSize: 22, fontWeight: 700, letterSpacing: 5, color: '#b3c2c7'}}>CLIPRUSH</div>
  <Sequence from={659} durationInFrames={5}><Audio src={staticFile('videos/video-023/audio/click.wav')} volume={.17}/></Sequence>
  <Sequence from={686} durationInFrames={5}><Audio src={staticFile('videos/video-023/audio/click.wav')} volume={.13}/></Sequence>
</AbsoluteFill>;
