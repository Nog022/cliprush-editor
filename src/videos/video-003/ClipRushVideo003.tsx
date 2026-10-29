import React from "react";
import {Audio, Video} from "@remotion/media";
import {AbsoluteFill, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from "remotion";
import type {Caption} from "@remotion/captions";
import words from "./captions.json";
import cuts from "./cuts.json";
import {MusicBed} from "./MusicBed";

const cyan = "#60f5ed";
const yellow = "#ffe45e";
const asset = (file: string) => staticFile(`videos/video-003/${file}`);
const clamp = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;

const Presenter: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return <AbsoluteFill style={{scale: interpolate(frame % (8 * fps), [0, 8 * fps], [1, 1.035], clamp)}}>
    <Video muted src={asset("footage/presenter-seekable-v001.mp4")} objectFit="cover" style={{width: "100%", height: "100%"}} />
  </AbsoluteFill>;
};

const ImageScene: React.FC<{file: string; seconds: number; label: string; direction?: number; wide?: boolean}> = ({file, seconds, label, direction = 1, wide = false}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return <AbsoluteFill style={{backgroundColor: "#0b091a", opacity: interpolate(frame, [0, 5, seconds * fps - 5, seconds * fps], [0, 1, 1, 0], clamp)}}>
    <Img src={asset(`images/${file}.webp`)} style={{width: "100%", height: "100%", objectFit: "cover", filter: "blur(30px) brightness(.35)", scale: 1.15}} />
    <AbsoluteFill style={{background: "linear-gradient(180deg, #100c2500, #100c2555 60%, #100c25)"}} />
    <div style={{position: "absolute", top: wide ? 400 : 330, left: wide ? 40 : -270, width: wide ? 1000 : 1620, height: wide ? 640 : 980, backgroundColor: "#0b091a", overflow: "hidden", borderTop: `3px solid ${cyan}`, borderBottom: "3px solid #bf76ff", rotate: `${interpolate(frame, [0, seconds * fps], [-direction * 1.2, direction * .5], clamp)}deg`, boxShadow: "0 30px 100px #0009"}}>
      <Img src={asset(`images/${file}.webp`)} style={{width: "100%", height: "100%", objectFit: wide ? "contain" : "cover", scale: interpolate(frame, [0, seconds * fps], [1, wide ? 1.06 : 1.13], clamp), translate: `${interpolate(frame, [0, seconds * fps], [-25 * direction, 25 * direction], clamp)}px 0px`}} />
    </div>
    <div style={{position: "absolute", left: 90, top: 230, color: cyan, letterSpacing: 7, fontSize: 28, fontWeight: 800}}>GTA VI / {label}</div>
  </AbsoluteFill>;
};

const Title: React.FC<{eyebrow: string; text: string; color?: string; top?: number}> = ({eyebrow, text, color = yellow, top = 1040}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return <div style={{position: "absolute", top, left: 85, width: 820, scale: .92 + .08 * spring({frame, fps, config: {damping: 18}}), translate: `0px ${interpolate(frame, [0, 10], [40, 0], clamp)}px`, opacity: interpolate(frame, [0, 5], [0, 1], clamp)}}>
    <div style={{fontSize: 30, fontWeight: 800, color: cyan, letterSpacing: 5, marginBottom: 18}}>{eyebrow}</div>
    <div style={{fontSize: 94, fontWeight: 900, lineHeight: 1.02, color, textShadow: "0 6px 0 #100c25, 0 12px 35px #000", whiteSpace: "pre-line"}}>{text}</div>
  </div>;
};

const Levels: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return <AbsoluteFill style={{background: "linear-gradient(180deg,#0b091af0,#211039f5)", padding: "460px 90px 0"}}>
    <div style={{fontSize: 170, fontWeight: 900, color: yellow}}>4</div>
    <div style={{fontSize: 76, fontWeight: 900, lineHeight: 1.05}}>NÍVEIS DE<br/>PROXIMIDADE</div>
    <div style={{display: "flex", gap: 20, marginTop: 80}}>{[0, 1, 2, 3].map((i) => <div key={i} style={{width: 195, height: 24, borderRadius: 12, background: i < frame / (.32 * fps) ? cyan : "#ffffff22", boxShadow: i < frame / (.32 * fps) ? `0 0 28px ${cyan}66` : "none"}} />)}</div>
    <div style={{fontSize: 25, color: "#cabedc", marginTop: 28}}>REPRESENTAÇÃO ILUSTRATIVA</div>
  </AbsoluteFill>;
};

const Activities: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const items = [{at: 0, name: "PRAIA", glyph: "≈"}, {at: 2.22, name: "BICICLETA", glyph: "◎—◎"}, {at: 3.46, name: "ACADEMIA", glyph: "▮━▮"}, {at: 5.2, name: "CARRO", glyph: "▰"}];
  const visible = items.filter((item) => frame >= item.at * fps);
  const current = visible[visible.length - 1] ?? items[0];
  const overBeach = frame < Math.round(2.22 * fps);
  return <div style={{position: "absolute", top: overBeach ? 1060 : 470, left: 90, width: 810, padding: overBeach ? "20px 0" : "50px 0", background: "#130d25ed", border: `2px solid ${cyan}`, borderRadius: 24, textAlign: "center"}}>
    <div style={{fontSize: 32, color: cyan, letterSpacing: 4}}>ATIVIDADES EM DUPLA</div>
    <div style={{fontSize: overBeach ? 70 : 155, color: yellow, height: overBeach ? 80 : 220, paddingTop: overBeach ? 0 : 20}}>{current.glyph}</div>
    <div style={{fontSize: overBeach ? 52 : 72, fontWeight: 900}}>{current.name}</div>
    <div style={{display: "flex", justifyContent: "center", gap: 16, marginTop: 35}}>{items.map((item) => <div key={item.name} style={{height: 8, width: 125, background: frame >= item.at * fps ? cyan : "#ffffff22"}} />)}</div>
  </div>;
};

const captions: Caption[] = words;
const pages: Caption[][] = [];
for (const word of captions) {
  // Whisper marked this isolated conjunction with 3% confidence in a pause.
  if (word.startMs === 27160 && word.confidence !== null && word.confidence < .1) continue;
  const page = pages[pages.length - 1];
  if (!page || page.length >= 4 || word.startMs - page[page.length - 1].endMs > 450 || word.endMs - page[0].startMs > 1600) pages.push([word]);
  else page.push(word);
}

const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ms = frame / fps * 1000;
  const page = pages.find((p) => ms >= p[0].startMs && ms < p[p.length - 1].endMs + 90);
  if (!page) return null;
  return <div style={{position: "absolute", top: 1450, left: 85, width: 820, textAlign: "center", fontSize: 65, fontWeight: 900, lineHeight: 1.16, paintOrder: "stroke fill", WebkitTextStroke: "8px #100c25", textShadow: "0 7px 18px #000", scale: interpolate(ms - page[0].startMs, [0, 100], [.97, 1], clamp)}}>{page.map((w, i) => <span key={i} style={{color: ms >= w.startMs && ms <= w.endMs ? yellow : "white"}}>{w.text}</span>)}</div>;
};

const SourceTimeline: React.FC = () => {
  const {fps} = useVideoConfig();
  return <AbsoluteFill style={{backgroundColor: "#100c25", color: "white", fontFamily: "Arial, sans-serif", overflow: "hidden"}}>
    <Sequence name="Visuais e legendas no tempo da fonte">
      <Presenter />
      <Sequence name="Gancho / dupla" from={Math.round(1.23 * fps)} durationInFrames={Math.round(4.94 * fps)}><ImageScene file="839870" seconds={4.94} label="JASON + LUCIA"/><Title eyebrow="VOCÊ VAI PODER MUDAR" text={"O RELACIONAMENTO"}/></Sequence>
      <Sequence name="Contexto Rockstar e Edge" from={Math.round(8.36 * fps)} durationInFrames={Math.round(5.72 * fps)}><ImageScene file="839863" seconds={5.72} label="RELACIONAMENTO" direction={-1}/><Title eyebrow="CITADAS NA NARRAÇÃO" text={"ROCKSTAR\n× EDGE"} color="white"/></Sequence>
      <Sequence name="Quatro níveis" from={Math.round(14.08 * fps)} durationInFrames={Math.round(2.08 * fps)}><Levels/></Sequence>
      <Sequence name="Vínculo" from={Math.round(18.2 * fps)} durationInFrames={Math.round(2.72 * fps)}><Title top={430} eyebrow="ATIVIDADES EM DUPLA" text="O VÍNCULO AUMENTA"/></Sequence>
      <Sequence name="Nova imagem / praia" from={Math.round(21.42 * fps)} durationInFrames={Math.round(2.22 * fps)}><ImageScene file="jasonluchabeach" seconds={2.22} label="TEMPO JUNTOS" direction={-1} wide/></Sequence>
      <Sequence name="Atividades" from={Math.round(21.42 * fps)} durationInFrames={Math.round(5.74 * fps)}><Activities/></Sequence>
      <Sequence name="Nova imagem / passeio de carro" from={Math.round(25.96 * fps)} durationInFrames={Math.round(1.2 * fps)}><ImageScene file="jason-and-lucia-03-260920-5ddffaa4" seconds={1.2} label="PASSEIO EM DUPLA"/></Sequence>
      <Sequence name="Possível casamento" from={Math.round(30.91 * fps)} durationInFrames={Math.round(5.56 * fps)}><ImageScene file="839870" seconds={5.56} label="E O FUTURO?" direction={-1}/></Sequence>
      <Sequence name="Revelação" from={Math.round(35.89 * fps)} durationInFrames={Math.round(1.22 * fps)}><Title eyebrow="POSSIBILIDADE" text="CASAMENTO?"/></Sequence>
      <Sequence name="Sem confirmação" from={Math.round(37.11 * fps)} durationInFrames={Math.round(1.5 * fps)}><Title top={430} eyebrow="ROCKSTAR, SEGUNDO A FALA" text="NÃO CONFIRMOU" color="white"/></Sequence>
      <Sequence name="Sem descarte" from={Math.round(38.83 * fps)} durationInFrames={Math.round(2.28 * fps)}><Title eyebrow="MAS TAMBÉM…" text="NÃO DESCARTOU"/></Sequence>
      <Sequence name="Influência das atividades" from={Math.round(45.76 * fps)} durationInFrames={Math.round(5.04 * fps)}><ImageScene file="839866" seconds={5.04} label="A CONEXÃO DA DUPLA"/><Title eyebrow="SUAS ATIVIDADES" text={"ESCOLHAS\n↓ VÍNCULO"} color="white"/></Sequence>
      <Sequence name="Pergunta final" from={Math.round(51.58 * fps)} durationInFrames={Math.round(5.94 * fps)}><ImageScene file="839870" seconds={5.94} label="QUAL SERÁ O FINAL?" direction={-1}/><Title eyebrow="JASON + LUCIA" text={"JUNTOS OU\nSEPARADOS?"}/></Sequence>
      <Sequence name="Comentários" from={Math.round(58.06 * fps)} durationInFrames={Math.round(2.05 * fps)}><Title top={430} eyebrow="CLIPRUSH" text="CONTE PRA GENTE" color="white"/></Sequence>
      <AbsoluteFill style={{pointerEvents: "none", background: "linear-gradient(0deg,#0b091a99,transparent 23%,transparent 90%,#0b091a66)"}}/>
      <Captions/>
    </Sequence>
  </AbsoluteFill>;
};

// One continuous PCM audio track; every visual group inherits the same source trim.
// The source clock keeps all existing image animations and captions synchronized.
export const ClipRushVideo003: React.FC = () => <AbsoluteFill>
  <Audio name="Voz PCM contínua / cortes v001" src={asset("audio/voice-cut-v001.wav")} />
  <MusicBed />
  <Sequence name="01 / gancho" from={cuts.clips[0].from} trimBefore={cuts.clips[0].sourceStart} durationInFrames={cuts.clips[0].duration}><SourceTimeline /></Sequence>
  <Sequence name="02 / quatro níveis" from={cuts.clips[1].from} trimBefore={cuts.clips[1].sourceStart} durationInFrames={cuts.clips[1].duration}><SourceTimeline /></Sequence>
  <Sequence name="03 / atividades" from={cuts.clips[2].from} trimBefore={cuts.clips[2].sourceStart} durationInFrames={cuts.clips[2].duration}><SourceTimeline /></Sequence>
  <Sequence name="04 / casamento" from={cuts.clips[3].from} trimBefore={cuts.clips[3].sourceStart} durationInFrames={cuts.clips[3].duration}><SourceTimeline /></Sequence>
  <Sequence name="05 / escolhas e pergunta" from={cuts.clips[4].from} trimBefore={cuts.clips[4].sourceStart} durationInFrames={cuts.clips[4].duration}><SourceTimeline /></Sequence>
</AbsoluteFill>;
