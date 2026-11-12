import type { Caption } from "@remotion/captions";
import {
  AbsoluteFill,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Audio } from "@remotion/media";
import words from "./captions.json";
import { asset } from "./timing";
import {
  Hook,
  City,
  Brian,
  Split,
  Housing,
  Work,
  Control,
  Signal,
} from "./scenes";
import { Footage, Shade, Title } from "./components";
const groups: Caption[][] = [];
for (const word of words) {
  const last = groups[groups.length - 1];
  if (
    !last ||
    last.length >= 4 ||
    (last.map((w) => w.text.trim()).join(" ") + word.text).length > 25 ||
    word.startMs - last[last.length - 1].endMs > 300 ||
    /[.!?]$/.test(last[last.length - 1].text)
  )
    groups.push([word]);
  else last.push(word);
}
const Captions = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ms = (f / fps) * 1000;
  const group = groups.find(
    (g) => ms >= g[0].startMs && ms < g[g.length - 1].endMs + 80,
  );
  if (!group) return null;
  return (
    <div
      data-safe="caption"
      style={{
        position: "absolute",
        left: 90,
        right: 150,
        top: 1600,
        textAlign: "center",
        fontSize: 62,
        lineHeight: 1.14,
        fontWeight: 900,
        textTransform: "uppercase",
        textShadow: "0 5px 5px #000, 3px 0 #000, -3px 0 #000",
        WebkitTextStroke: "1px #000",
      }}
    >
      {group.map((w, i) => (
        <span
          key={i}
          style={{
            visibility: ms >= w.startMs ? "visible" : "hidden",
            color: ms < w.endMs ? "#f4df56" : "#fff",
          }}
        >
          {w.text.trim()}{" "}
        </span>
      ))}
    </div>
  );
};
export const ClipRushVideo007 = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill
      style={{
        background: "#03090c",
        fontFamily: "Arial, sans-serif",
        color: "#fff",
        overflow: "hidden",
      }}
    >
      <Sequence name="Jason / gancho" durationInFrames={72}>
        <Hook />
      </Sequence>
      <Sequence name="Suspeita / punch" from={72} durationInFrames={84}>
        <Hook alternate />
      </Sequence>
      <Sequence name="Pista / Vice City" from={156} durationInFrames={65}>
        <City />
      </Sequence>
      <Sequence name="Dossiê / conexões" from={221} durationInFrames={75}>
        <City board />
      </Sequence>
      <Sequence name="Revelação Brian" from={296} durationInFrames={61}>
        <Brian />
      </Sequence>
      <Sequence name="Passado criminoso" from={357} durationInFrames={64}>
        <Brian file />
      </Sequence>
      <Sequence name="Relação com Jason" from={421} durationInFrames={59}>
        <Split />
      </Sequence>
      <Sequence name="Moradia" from={480} durationInFrames={83}>
        <Housing />
      </Sequence>
      <Sequence name="Carimbo / condição" from={563} durationInFrames={50}>
        <Housing stamp />
      </Sequence>
      <Sequence name="Serviços" from={613} durationInFrames={33}>
        <Work />
      </Sequence>
      <Sequence name="Cobranças" from={646} durationInFrames={37}>
        <Work risk />
      </Sequence>
      <Sequence name="Controle / teoria" from={683} durationInFrames={57}>
        <Control />
      </Sequence>
      <Sequence name="Jason / suspeita" from={740} durationInFrames={60}>
        <Control close />
      </Sequence>
      <Sequence name="Outra pista" from={800} durationInFrames={67}>
        <Signal mode="hint" />
      </Sequence>
      <Sequence name="Amigo desconhecido" from={867} durationInFrames={49}>
        <Signal mode="friend" />
      </Sequence>
      <Sequence name="Comunicações marítimas" from={916} durationInFrames={34}>
        <AbsoluteFill>
          <Footage name="boat" />
          <Shade />
          <Title eyebrow="MONTAGEM ILUSTRATIVA"><span style={{fontSize: 86}}>COMUNICAÇÕES</span></Title>
        </AbsoluteFill>
      </Sequence>
      <Sequence name="Guarda Costeira" from={950} durationInFrames={28}>
        <Signal mode="coast" />
      </Sequence>
      <Sequence name="Cliffhanger" from={978} durationInFrames={56}>
        <Signal mode="question" />
      </Sequence>
      <Sequence name="Parte 2" from={1034} durationInFrames={90}>
        <Signal mode="part2" />
      </Sequence>
      <Sequence name="Siga o ClipRush" from={1124} durationInFrames={68}>
        <Signal mode="cta" />
      </Sequence>
      <div
        style={{
          position: "absolute",
          left: 82,
          top: 140,
          fontSize: 25,
          letterSpacing: 5,
          fontWeight: 700,
        }}
      >
        CLIP<span style={{ color: "#f4df56" }}>RUSH</span>
        <span style={{ marginLeft: 55, opacity: 0.7, fontSize: 20 }}>
          VICE CITY / DOSSIÊ 01
        </span>
      </div>
      <Captions />
      <Audio src={staticFile(asset("audio/narracao.mp3"))} volume={0.92} />
      <Audio
        src={staticFile(asset("audio/score-original-v001.wav"))}
        volume={(f) => (f < 26.68 * fps ? 0.7 : 0.38)}
      />
      <Audio
        src={staticFile(asset("audio/sfx-original-v001.wav"))}
        volume={0.7}
      />
    </AbsoluteFill>
  );
};
