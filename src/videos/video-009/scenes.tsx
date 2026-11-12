import { AbsoluteFill, Sequence, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Clock, Cycle, Footage, NumberPanel, Photo, Title, Wipe, clamp, palette } from "./visuals";

export const Hook = () => <AbsoluteFill>
  <Footage game="vi" start={153} top={420} height={300} label="GTA VI" />
  <Footage game="v" start={58} top={730} height={300} label="GTA V" />
  <Footage game="r" start={8} top={1040} height={300} label="RED DEAD REDEMPTION 2" />
  <Title kicker="3 MUNDOS. 3 RITMOS?" size={88}>O TEMPO VAI MUDAR?</Title>
  <div style={{ position: "absolute", top: 1300, left: 385 }}><Clock size={280} period={1.8} label="MAIS DEVAGAR?" color={palette.pink} /></div>
  <Wipe />
</AbsoluteFill>;

export const GTAV = () => <AbsoluteFill>
  <Sequence durationInFrames={42} name="Los Santos / movimento"><Footage game="v" start={37.5} top={400} height={640} /></Sequence>
  <Sequence premountFor={15} from={42} durationInFrames={31} name="Paisagem / cidade"><Photo file="paisagem gta 5.jpg" top={400} height={640} /></Sequence>
  <Sequence premountFor={15} from={73} durationInFrames={31} name="Paisagem / montanha"><Photo file="paisagem gta 5_2.jpg" top={400} height={640} /></Sequence>
  <Sequence premountFor={15} from={104} name="Paisagem / avião"><Photo file="paisagem gta 5_3jpg.jpg" top={400} height={640} /></Sequence>
  <Title kicker="GTA V">UM DIA INTEIRO.</Title>
  <Cycle faster />
  <NumberPanel value="48" unit="MINUTOS REAIS" note="24 horas dentro do jogo" clockPeriod={2.4} />
  <Wipe />
</AbsoluteFill>;

export const RDR = () => <AbsoluteFill>
  <Sequence durationInFrames={54} name="RDR2 / pradaria"><Footage game="r" start={13} top={430} height={610} /></Sequence>
  <Sequence premountFor={15} from={54} durationInFrames={26} name="RDR2 / horizonte"><Photo file="paisagem_rdr2_1.jpg" top={430} height={610} /></Sequence>
  <Sequence premountFor={15} from={80} name="RDR2 / cavaleiro"><Photo file="paisagem_rdr2_2.jpg" top={430} height={610} /></Sequence>
  <Title kicker="RED DEAD REDEMPTION 2" size={86}>O MESMO TOTAL...</Title>
  <NumberPanel value="≈48" unit="MINUTOS REAIS" note="Média do ciclo • ritmo variável" color={palette.red} />
  <Sequence from={57} name="Pista / regra escondida"><div style={{ position: "absolute", top: 935, left: 84, background: palette.yellow, color: palette.ink, padding: "14px 25px", fontSize: 40, fontWeight: 900 }}>MAS EXISTE UM TRUQUE.</div></Sequence>
  <Wipe color={palette.red} />
</AbsoluteFill>;

export const RDRNight = () => <AbsoluteFill>
  <Sequence durationInFrames={34} name="Fogueira / noite"><Photo file="pessoas_reunidas_na_fogueira_rdr2.jpg" top={420} height={630} /></Sequence>
  <Sequence premountFor={20} from={34} name="Fogueira / reflexos"><Footage game="r" start={28.3} top={420} height={630} speed={1.5} /></Sequence>
  <Title kicker="RDR2 • À NOITE" color={palette.pink}>O RELÓGIO ACELERA.</Title>
  <Cycle faster />
  <NumberPanel value="+" unit="VELOCIDADE" note="Relógio ilustrativo" clockPeriod={.85} color={palette.pink} />
  <Wipe color={palette.pink} />
</AbsoluteFill>;

export const RDRDay = () => <AbsoluteFill>
  <Footage game="r" start={18} top={420} height={630} />
  <Title kicker="RDR2 • DURANTE O DIA" color={palette.yellow}>O TEMPO DESACELERA.</Title>
  <Cycle />
  <NumberPanel value="−" unit="VELOCIDADE" note="Relógio ilustrativo" clockPeriod={6} color={palette.yellow} />
  <Wipe color={palette.yellow} />
</AbsoluteFill>;

export const EnterVI = () => <AbsoluteFill>
  <Photo file="praia_gta6.jfif" top={390} height={1040} focus="45% 50%" />
  <Title kicker="AGORA, VICE CITY" size={155} color={palette.pink}>GTA VI</Title>
  <Title top={1210} size={106}>OUTRO RITMO.</Title>
  <Wipe color={palette.pink} />
</AbsoluteFill>;

const SpeedMeter = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const rapid = f >= 3.04 * fps;
  return <div style={{ position: "absolute", top: 1220, left: 84, right: 140 }}>
    <div style={{ fontFamily: "Impact, sans-serif", fontSize: 80, color: rapid ? palette.yellow : palette.cyan }}>{rapid ? "RÁPIDO DEMAIS." : "O MESMO RITMO?"}</div>
    <div style={{ display: "flex", gap: 8, marginTop: 30 }}>{Array.from({ length: 20 }, (_, i) => <div key={i} style={{ flex: 1, height: 70, background: i < (rapid ? 20 : 12 + Math.sin(f / 5) * 3) ? (rapid ? palette.yellow : palette.cyan) : "#242833" }} />)}</div>
    <div style={{ marginTop: 20, fontSize: 27, color: "#d3cedd" }}>Comparação ilustrativa do teste relatado</div>
  </div>;
};
export const TestRhythm = () => <AbsoluteFill>
  <Footage game="v" start={47.3} top={440} height={355} label="GTA V" />
  <Footage game="vi" start={47} top={805} height={355} label="GTA VI" speed={1.2} />
  <Title kicker="O TESTE DA ROCKSTAR" size={88}>E SE FOSSE IGUAL?</Title>
  <SpeedMeter />
  <Wipe />
</AbsoluteFill>;

export const Longer = () => <AbsoluteFill>
  <Sequence durationInFrames={76} name="Vice City / pôr do sol"><Footage game="vi" start={82.4} top={420} height={770} /></Sequence>
  <Sequence premountFor={30} from={76} name="Vice City / vida noturna"><Footage game="vi" start={92.3} top={420} height={770} /></Sequence>
  <Title kicker="GTA VI • CICLO MAIS LONGO" size={92}>MAIS TEMPO<br />PARA VIVER.</Title>
  <div style={{ position: "absolute", top: 1170, left: 84, right: 140, display: "flex", alignItems: "center", gap: 32 }}><Clock period={9} size={300} color={palette.pink} /><div style={{ fontSize: 48, fontWeight: 900, lineHeight: 1.25 }}>PÔR DO SOL<br /><span style={{ color: palette.pink }}>+ NOITE</span></div></div>
  <Wipe color={palette.pink} />
</AbsoluteFill>;

export const Mystery = () => {
  const f = useCurrentFrame();
  return <AbsoluteFill>
    <Footage game="vi" start={103} top={410} height={1020} />
    <AbsoluteFill style={{ background: "#090a1488" }} />
    <Title kicker="A PERGUNTA É..." size={112}>MAS QUANTO?</Title>
    <div style={{ position: "absolute", top: 590, left: 84, right: 140, textAlign: "center", fontSize: 260, fontFamily: "Impact, sans-serif", color: palette.pink, scale: interpolate(f, [0, 30], [.9, 1.05], clamp), textShadow: "0 0 75px #f081c477" }}>??:??</div>
    <div style={{ position: "absolute", left: 340, top: 990 }}><Clock period={1} size={370} color={palette.pink} label="ESTIMATIVA?" /></div>
  </AbsoluteFill>;
};

export const Reveal = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const revealed = f >= 1.32 * fps;
  const progress = interpolate(f, [1.32 * fps, 2.4 * fps], [0, 1], clamp);
  return <AbsoluteFill>
    <Footage game="vi" start={137} top={430} height={650} />
    <Title kicker="CÁLCULO DE FÃS" size={84}>E SE O DIA DURASSE...</Title>
    <div style={{ position: "absolute", top: 740, left: 84, right: 140, textAlign: "center", padding: "18px 0 24px", background: "#090a14e8", borderTop: `3px solid ${palette.pink}` }}>
      <div style={{ fontFamily: "Impact, sans-serif", fontSize: 180, lineHeight: 1.1, color: palette.pink }}>{revealed ? "2h24" : "??:??"}</div>
      <div style={{ fontSize: 37, fontWeight: 900, color: palette.yellow }}>ESTIMATIVA • NÃO CONFIRMADA</div>
    </div>
    <div style={{ position: "absolute", left: 84, right: 140, top: 1130 }}>
      <div style={{ fontSize: 35, fontWeight: 900, marginBottom: 16 }}>GTA V / RDR2 <span style={{ color: palette.cyan }}>≈48 min</span></div>
      <div style={{ height: 24, width: "33.333%", background: palette.cyan, marginBottom: 40 }} />
      <div style={{ fontSize: 35, fontWeight: 900, marginBottom: 16 }}>GTA VI <span style={{ color: palette.pink }}>{revealed ? "144 min?" : "?"}</span></div>
      <div style={{ height: 24, width: `${33.333 + 66.667 * progress}%`, background: palette.pink }} />
      <div style={{ fontSize: 39, color: palette.yellow, marginTop: 28 }}>{revealed ? "SERIA 3× O TEMPO" : "QUAL SERIA A DIFERENÇA?"}</div>
    </div>
    <Wipe color={palette.pink} />
  </AbsoluteFill>;
};

export const Caveat = () => <AbsoluteFill>
  <Footage game="vi" start={118.2} top={440} height={620} />
  <Title kicker="ATENÇÃO AO DETALHE" size={92}>AINDA NÃO<br />CONFIRMADO.</Title>
  <div style={{ position: "absolute", left: 84, right: 140, top: 1080, borderLeft: `7px solid ${palette.yellow}`, paddingLeft: 30 }}>
    <div style={{ color: palette.pink, fontFamily: "Impact, sans-serif", fontSize: 104 }}>2h24 É ESTIMATIVA.</div>
    <div style={{ fontSize: 43, lineHeight: 1.3, marginTop: 24 }}>A duração exata ainda<br />não é um dado oficial.</div>
  </div>
  <Wipe color={palette.yellow} />
</AbsoluteFill>;

export const Outro = () => <AbsoluteFill>
  <Footage game="vi" start={37.5} top={435} height={390} label="APROVEITAR CADA MOMENTO" />
  <Footage game="v" start={77.5} top={835} height={390} label="OU ACELERAR O MUNDO?" />
  <Title kicker="E VOCÊ?" size={92}>LENTO OU RÁPIDO?</Title>
  <div style={{ position: "absolute", left: 84, right: 140, top: 1255, display: "flex", justifyContent: "space-between", fontFamily: "Impact, sans-serif", fontSize: 74 }}><span style={{ color: palette.pink }}>MAIS LENTO</span><span style={{ color: palette.cyan }}>MAIS RÁPIDO</span></div>
  <Sequence from={101} name="CTA / ClipRush"><div style={{ position: "absolute", top: 1385, left: 84, right: 140, textAlign: "center", fontSize: 42, fontWeight: 900, color: palette.yellow }}>SEGUE O CLIPRUSH /</div></Sequence>
  <Wipe />
</AbsoluteFill>;
