import React, {useEffect, useState} from 'react';
import type {Caption} from '@remotion/captions';
import {AbsoluteFill, Audio, Freeze, Img, OffthreadVideo, Sequence, cancelRender, continueRender, delayRender, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import captionData from './captions.json';

const T2 = 'videos/biblioteca/gta6/videos/Trailer 2 GTA VI.mp4';
const LAUNCH = 'videos/biblioteca/gta6/videos/Launch Trailer.mp4';
const RDR = 'videos/biblioteca/rdr2/videos/Red Dead Redemption 2 Trailer [gmA6MrX81z4].mp4';
const GOLD = '#eadbb8';
const BLUE = '#a4d7d0';
const AMBER = '#e3aa8b';
const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

type FootageProps = {src: string; sourceIn: number; count: number; position?: string};
const Footage: React.FC<FootageProps> = ({src, sourceIn, count, position = '50% 50%'}) => {
  const frame = useCurrentFrame();
  return <Freeze frame={Math.min(frame, count-1)}><OffthreadVideo src={staticFile(src)} trimBefore={sourceIn} trimAfter={sourceIn+count} muted style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: position}} /></Freeze>;
};

const CinematicShot: React.FC<FootageProps & {wide?: boolean; first?: boolean; length: number}> = ({wide = false, first = false, length, ...props}) => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{overflow: 'hidden', opacity: first ? 1 : interpolate(frame, [0, 6], [0, 1], CLAMP)}}>
    <AbsoluteFill style={{filter: wide ? 'blur(18px) brightness(0.47)' : first ? 'brightness(1.10)' : 'brightness(0.84)', scale: interpolate(frame, [0, length], [1.025, 1.055], CLAMP)}}><Footage {...props} /></AbsoluteFill>
    <AbsoluteFill style={{background: 'linear-gradient(180deg, #071016e8, #07101648 30%, #07101620 53%, #071016dd 80%, #071016f7)'}} />
    {wide && <div style={{position: 'absolute', left: 32, top: 400, width: 1016, height: 690, overflow: 'hidden', borderRadius: 15, background: '#061017', boxShadow: '0 24px 65px #0007', border: '1px solid #ffffff24'}}>
      <div style={{position: 'absolute', left: 0, top: 59, width: 1016, height: 572}}><Footage {...props} /></div>
    </div>}
  </AbsoluteFill>;
};

const Title: React.FC<{eyebrow: string; first: string; second: string; source: string; tone?: string}> = ({eyebrow, first, second, source, tone = GOLD}) => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{pointerEvents: 'none'}}>
    <div style={{position: 'absolute', left: 66, top: 122, width: 875, translate: `0 ${interpolate(frame, [0, 10], [8, 0], CLAMP)}px`}}>
      <div style={{fontSize: 24, letterSpacing: 2.5, color: tone, marginBottom: 25}}>{eyebrow}</div>
      <div style={{fontSize: 86, lineHeight: 1.03, letterSpacing: -3, textShadow: '0 3px 30px #000a'}}>{first}<br /><span style={{color: tone}}>{second}</span></div>
    </div>
    <div style={{position: 'absolute', bottom: 106, left: 68, width: 860, fontSize: 21, lineHeight: 1.35, letterSpacing: 0.8, color: '#d3d8d9', textShadow: '0 2px 9px #000'}}>{source}</div>
  </AbsoluteFill>;
};

const Glass: React.FC<{children: React.ReactNode; top?: number; height?: number; tone?: string}> = ({children, top = 1140, height = 335, tone = GOLD}) => <div style={{position: 'absolute', left: 65, top, width: 880, height, border: `1px solid ${tone}60`, background: '#09151eea', borderRadius: 23, padding: 30, boxSizing: 'border-box', boxShadow: '0 20px 70px #0005'}}>{children}</div>;

const Profile: React.FC = () => {
  const frame = useCurrentFrame();
  return <Glass top={1080} height={390} tone={BLUE}>
    <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 23, letterSpacing: 2, color: BLUE}}><span>FICHA EDITORIAL</span><span>ILUSTRAÇÃO</span></div>
    <div style={{fontSize: 57, lineHeight: 1.05, marginTop: 29}}>PERFIL CRIMINAL</div>
    <div style={{height: 2, background: '#a4d7d06a', marginTop: 25, marginBottom: 25, width: interpolate(frame, [8, 26], [0, 810], CLAMP)}} />
    <div style={{fontSize: 35, color: '#dbe7e4', lineHeight: 1.35}}>Observa padrões de comportamento</div>
    <div style={{fontSize: 25, marginTop: 22, color: '#a8b9bb'}}>SEM PUNIÇÃO AUTOMÁTICA A CADA TIRO</div>
  </Glass>;
};

const Behaviors: React.FC<{kind: 'A' | 'B'}> = ({kind}) => {
  const frame = useCurrentFrame();
  const tone = kind === 'A' ? BLUE : AMBER;
  const labels = kind === 'A' ? ['ENTRAR', 'PEGAR', 'SAIR'] : ['MESMO CRIME', 'OUTRA ESCOLHA', 'ATACAR'];
  const active = kind === 'A' ? frame >= 124 ? 2 : frame >= 100 ? 1 : 0 : frame >= 52 ? 2 : 1;
  return <Glass tone={tone}>
    <div style={{fontSize: 24, letterSpacing: 1.5, color: tone}}>JOGADOR {kind} · EXEMPLO HIPOTÉTICO</div>
    <div style={{fontSize: 57, marginTop: 17, marginBottom: 35}}>{kind === 'A' ? 'CALCULISTA' : 'VIOLÊNCIA EXTRA'}</div>
    <div style={{display: 'flex', gap: 15}}>{labels.map((label, i) => <div key={label} style={{flex: 1, minWidth: 0, borderTop: `3px solid ${i <= active ? tone : '#435058'}`, paddingTop: 19, color: i <= active ? 'white' : '#829198', fontSize: kind === 'A' ? 31 : 24, lineHeight: 1.22}}><span style={{fontSize: 21, color: tone, marginRight: 10}}>0{i+1}</span>{label}</div>)}</div>
  </Glass>;
};

const Compare: React.FC = () => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{background: 'linear-gradient(145deg, #162b30, #08141d 53%, #312521)'}}>
    <div style={{position: 'absolute', left: 67, top: 372, fontSize: 25, letterSpacing: 1.7, color: '#d0d8d8'}}>EXEMPLO HIPOTÉTICO · IMAGENS DE APOIO</div>
    <div style={{position: 'absolute', left: 45, top: 424, width: 990, height: 495, overflow: 'hidden', borderRadius: 16, border: `1px solid ${BLUE}70`}}><Img src={staticFile('videos/video-016/stills/A-v001.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></div>
    <div style={{position: 'absolute', left: 68, top: 925, fontSize: 33, color: BLUE}}>A / PEGAR E SAIR</div>
    <div style={{position: 'absolute', left: 45, top: 1002, width: 990, height: 495, overflow: 'hidden', borderRadius: 16, border: `1px solid ${AMBER}70`, clipPath: `inset(0 ${interpolate(frame, [0, 8], [50, 0], CLAMP)}% round 16px)`}}><Img src={staticFile('videos/video-016/stills/B-v001.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></div>
    <div style={{position: 'absolute', left: 68, top: 1514, fontSize: 30, color: AMBER}}>B / ATACAR SEM NECESSIDADE</div>
  </AbsoluteFill>;
};

const Bridge: React.FC = () => {
  const frame = useCurrentFrame();
  const flow = interpolate(frame, [99, 107], [0, 1], CLAMP);
  const nodes = ['AÇÕES', 'PERFIL', 'REAÇÕES'];
  return <>
    <Glass top={1120} height={360} tone={GOLD}>
      <div style={{fontSize: 23, letterSpacing: 1.7, color: GOLD}}>ESQUEMA EXPLICATIVO · ILUSTRAÇÃO</div>
      <div style={{position: 'absolute', left: 30, top: 74, opacity: frame < 99 ? 1 : 0}}>
        <div style={{fontSize: 50}}>HONRA · RDR2</div>
        <div style={{fontSize: 27, color: '#becacb', marginTop: 22}}>Escolhas e suas consequências</div>
      </div>
      <div style={{position: 'absolute', left: 30, top: 73, opacity: flow, fontSize: 44}}>PERFIL CRIMINAL · GTA 6</div>
      <svg width="820" height="100" viewBox="0 0 820 100" style={{position: 'absolute', left: 30, top: 188}}>
        <line x1="26" y1="45" x2="790" y2="45" stroke="#eadbb85c" strokeWidth="4" />
        <line x1="26" y1="45" x2={interpolate(frame, [6, 55, 99, 170], [26, 790, 790, 790], CLAMP)} y2="45" stroke={GOLD} strokeWidth="4" />
        {[60,410,760].map((x,i) => <circle key={x} cx={x} cy="45" r={interpolate(frame, [99+i*7,107+i*7], [7,16], CLAMP)} fill={i===2 ? BLUE : GOLD} />)}
      </svg>
      <div style={{position: 'absolute', left: 27, right: 28, top: 145, display: 'flex', justifyContent: 'space-between', opacity: flow}}>{nodes.map(n => <span key={n} style={{fontSize: 28, color: n==='REAÇÕES' ? BLUE : GOLD}}>{n}</span>)}</div>
      <div style={{position: 'absolute', left: 30, top: 286, fontSize: 27, color: '#dce4e3'}}>{frame < 99 ? 'BARRA EDITORIAL · NÃO É HUD DO JOGO' : frame < 250 ? 'REAÇÕES POSSÍVEIS · SISTEMAS DIFERENTES' : 'REAÇÕES E POSSÍVEIS EFEITOS NA HISTÓRIA'}</div>
    </Glass>
  </>;
};

const Choice: React.FC = () => {
  const frame = useCurrentFrame();
  return <Glass top={1135} height={330}>
    <div style={{fontSize: 24, color: GOLD, letterSpacing: 2}}>SEU JEITO DE JOGAR</div>
    <div style={{display: 'flex', gap: 25, marginTop: 35}}>
      <div style={{flex: 1, borderTop: `3px solid ${BLUE}`, paddingTop: 24, fontSize: 40, color: BLUE}}>PROFISSIONAL</div>
      <div style={{flex: 1, borderTop: `3px solid ${AMBER}`, paddingTop: 24, fontSize: 40, color: AMBER, opacity: interpolate(frame, [30, 45], [.55, 1], CLAMP)}}>CAOS</div>
    </div>
    <div style={{fontSize: 26, color: '#c8d1d2', marginTop: 28}}>QUAL CAMINHO VOCÊ ESCOLHERIA?</div>
  </Glass>;
};

const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ms = frame/fps*1000;
  const caption: Caption | undefined = captionData.find(c => ms>=c.startMs && ms<c.endMs);
  if (!caption) return null;
  const words = caption.text.split(' ');
  const key = words.findIndex(w => /punir|calma|punição|Perfil|Criminal|observa|assalta|dinheiro|foge|atacando|necessidade|diferença|honra|comportamento|reagem|história|crimes|profissional|caos/i.test(w));
  return <div style={{position: 'absolute', left: 65, top: 1580, width: 880, minHeight: 132, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
    <div style={{fontSize: 56, lineHeight: 1.13, letterSpacing: -1.1, textAlign: 'center', maxWidth: 880, padding: '17px 22px', borderRadius: 14, background: '#07121eed', textShadow: '0 3px 10px #0008', translate: `0 ${interpolate(frame-caption.startMs/1000*fps, [0,5], [6,0], CLAMP)}px`}}>{words.map((w,i) => <React.Fragment key={i}>{i ? ' ' : ''}<span style={{color: i===key ? GOLD : 'white'}}>{w}</span></React.Fragment>)}</div>
  </div>;
};

export const ClipRush016: React.FC = () => {
  const {fps} = useVideoConfig();
  const [handle] = useState(() => delayRender('Load bundled video-016 font'));
  useEffect(() => {
    const font = new FontFace('ClipRush016', `url("${staticFile('videos/video-016/fonts/Arial-Bold.ttf')}")`, {weight: '700'});
    font.load().then(f => {document.fonts.add(f);continueRender(handle);}).catch(cancelRender);
  }, [handle]);
  return <AbsoluteFill style={{background: '#08141d', color: 'white', fontFamily: 'ClipRush016, Arial, sans-serif', fontWeight: 700}}>
    <Audio src={staticFile('videos/video-016/audio/narracao.mp3')} volume={1} />

    <Sequence name="Gancho · grupo armado, contexto real" durationInFrames={102}><CinematicShot src="videos/video-016/media/gancho-v001.mp4" sourceIn={0} count={96} position="47% 50%" first length={96} /></Sequence>
    <Sequence name="Calma · trânsito diante da polícia" from={96} durationInFrames={143}><CinematicShot src={T2} sourceIn={1358} count={137} position="56% 50%" length={137} /></Sequence>
    <Sequence name="Perfil · personagem em contexto, take novo" from={233} durationInFrames={136}><CinematicShot src={T2} sourceIn={820} count={130} position="64% 50%" length={130} /></Sequence>
    <Sequence name="Jogador A · loja e saída" from={363} durationInFrames={152}><CinematicShot src="videos/video-016/media/loja-v001.mp4" sourceIn={0} count={146} wide length={146} /></Sequence>
    <Sequence name="Jogador B · homem armado" from={509} durationInFrames={75}><CinematicShot src="videos/video-016/media/armado-v001.mp4" sourceIn={0} count={69} wide length={69} /></Sequence>
    <Sequence name="Jogador B · ação, take novo" from={578} durationInFrames={67}><CinematicShot src="videos/video-016/media/acao-v001.mp4" sourceIn={0} count={62} wide length={61} /></Sequence>
    <Sequence name="Comparação A/B · frames reais" from={639} durationInFrames={63}><Compare /></Sequence>
    <Sequence name="RDR2 · contexto real, honra ilustrada" from={696} durationInFrames={105}><CinematicShot src={RDR} sourceIn={Math.round(24.3*fps)} count={99} wide length={99} /></Sequence>
    <Sequence name="GTA6 · contexto policial, não prova do sistema" from={795} durationInFrames={191}><CinematicShot src="videos/video-016/media/reacoes-v001.mp4" sourceIn={0} count={185} wide length={185} /></Sequence>
    <Sequence name="Detalhe · viaturas, plano curto a 1x" from={980} durationInFrames={42}><CinematicShot src={LAUNCH} sourceIn={2106} count={36} wide position="53% 50%" length={36} /></Sequence>
    <Sequence name="Detalhe · contexto noturno distinto" from={1016} durationInFrames={73}><CinematicShot src="videos/video-016/media/noite-v001.mp4" sourceIn={0} count={68} wide length={67} /></Sequence>
    <Sequence name="Escolha final · veículo, take novo" from={1083} durationInFrames={124}><CinematicShot src="videos/video-016/media/escolha-v001.mp4" sourceIn={0} count={124} wide position="50% 58%" length={124} /></Sequence>

    <Sequence name="Gancho · título" durationInFrames={110}><Title eyebrow="CLIPRUSH / PERFIL CRIMINAL" first="VAI TE" second="PUNIR?" source="GTA VI · EXTENDED LOOK · CENA 216" /></Sequence>
    <Sequence name="Correção imediata do gancho" from={110} durationInFrames={88}><Title eyebrow="CALMA. É SOBRE O PADRÃO." first="NÃO A" second="CADA TIRO" source="GTA VI · TRAILER 2 · CENA 16" tone={BLUE} /></Sequence>
    <Sequence name="Explicação do perfil" from={198} durationInFrames={165}><Title eyebrow="COMO VOCÊ COSTUMA AGIR" first="PERFIL" second="CRIMINAL" source="ROB NELSON / IGN · ENTREVISTA DE 07.10.2026" tone={BLUE} /><Profile /></Sequence>
    <Sequence name="Exemplo A · gráfico" from={363} durationInFrames={146}><Title eyebrow="IMAGINE DOIS JOGADORES" first="PEGAR" second="E SAIR" source="GTA VI · IMAGENS DE APOIO · EXEMPLO HIPOTÉTICO" tone={BLUE} /><Behaviors kind="A" /></Sequence>
    <Sequence name="Exemplo B · gráfico" from={509} durationInFrames={130}><Title eyebrow="MESMO CRIME, OUTRA ESCOLHA" first="CAUSAR" second="O CAOS" source="GTA VI · IMAGENS DE APOIO · EXEMPLO HIPOTÉTICO" tone={AMBER} /><Behaviors kind="B" /></Sequence>
    <Sequence name="Comparação · título" from={639} durationInFrames={57}><Title eyebrow="A DIFERENÇA ENTRE OS EXEMPLOS" first="O JEITO" second="IMPORTA" source="COMPARAÇÃO ILUSTRATIVA · NÃO É TESTE DO SISTEMA" /></Sequence>
    <Sequence name="Ponte RDR2 · título" from={696} durationInFrames={99}><Title eyebrow="RED DEAD REDEMPTION 2" first="ESCOLHAS" second="E HONRA" source="RDR2 · TRAILER REAL / GRÁFICO DE HONRA ILUSTRATIVO" /></Sequence>
    <Sequence name="Volta ao GTA6 · título" from={795} durationInFrames={185}><Title eyebrow="GTA VI / SISTEMAS DIFERENTES" first="O MUNDO" second="PODE REAGIR" source="IMAGENS DE APOIO · NÃO DEMONSTRAM O PERFIL CRIMINAL" tone={BLUE} /></Sequence>
    <Sequence name="Ponte gráfica honra para perfil" from={696} durationInFrames={284}><Bridge /></Sequence>
    <Sequence name="Admiração · título" from={980} durationInFrames={103}><Title eyebrow="ATÉ NESSE DETALHE" first="O JEITO" second="DE AGIR" source="GTA VI · LAUNCH TRAILER + EXTENDED LOOK" /></Sequence>
    <Sequence name="Encerramento · escolha" from={1083} durationInFrames={124}><Title eyebrow="E AÍ, VOCÊ ESCOLHE" first="QUAL É O" second="SEU PERFIL?" source="GTA VI · HUD ORIGINAL DE PROCURADO ≠ PERFIL CRIMINAL" /><Choice /></Sequence>
    <Captions />
  </AbsoluteFill>;
};
