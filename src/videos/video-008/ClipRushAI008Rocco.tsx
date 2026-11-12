import { AbsoluteFill, Sequence, Track, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { Branding, NarrationCaptions } from "./components";
import { asset } from "./timing";
import {
  ChopComparison,
  ChopMemory,
  RedStrapInvestigation,
  RoccoIntro,
  RoccoNameReveal,
  RoccoOutro,
  RoccoScreenshot,
  TrailerFreezeFrame,
  TrailerReveal,
} from "./scenes";

export const ClipRushAI008Rocco = () => (
  <AbsoluteFill
    style={{
      background: "#090a14",
      fontFamily: "Arial, sans-serif",
      color: "white",
      overflow: "hidden",
    }}
  >
    <Track name="Cenas">
      <Sequence name="Gancho / novo Chop" durationInFrames={69}>
        <RoccoIntro />
      </Sequence>
      <Sequence
        name="Memória / Franklin e Chop"
        from={69}
        durationInFrames={101}
      >
        <ChopMemory />
      </Sequence>
      <Sequence
        name="Trailer / aguardando cena correta"
        from={170}
        durationInFrames={98}
      >
        <TrailerReveal />
      </Sequence>
      <Sequence
        name="Freeze / aguardando frame do cachorro"
        from={268}
        durationInFrames={79}
      >
        <TrailerFreezeFrame />
      </Sequence>
      <Sequence
        name="Imagem de Jason / aproximação"
        from={347}
        durationInFrames={162}
      >
        <RoccoScreenshot />
      </Sequence>
      <Sequence
        name="Investigação / faixa vermelha"
        from={509}
        durationInFrames={94}
      >
        <RedStrapInvestigation />
      </Sequence>
      <Sequence
        name="Revelação / leitura aparente"
        from={603}
        durationInFrames={29}
      >
        <RoccoNameReveal />
      </Sequence>
      <Sequence
        name="Comparação / não confirmado"
        from={632}
        durationInFrames={139}
      >
        <ChopComparison />
      </Sequence>
      <Sequence
        name="Pergunta / segue o ClipRush"
        from={771}
        durationInFrames={119}
      >
        <RoccoOutro />
      </Sequence>
    </Track>
    <Branding />
    <Sequence name="Narração integral e legendas" durationInFrames={890}>
      <Audio src={staticFile(asset("audio/narracao.mp3"))} volume={0.92} />
      <NarrationCaptions />
    </Sequence>
    <Audio
      name="Trilha original / suspense"
      src={staticFile(asset("audio/score-original-v001.wav"))}
    />
    <Audio
      name="Efeitos sincronizados"
      src={staticFile(asset("audio/sfx-original-v001.wav"))}
    />
  </AbsoluteFill>
);
