import { Audio } from "@remotion/media";
import { AbsoluteFill, Sequence, Track, getRemotionEnvironment } from "remotion";
import { Brand, Captions, asset } from "./visuals";
import { Caveat, EnterVI, GTAV, Hook, Longer, Mystery, Outro, RDR, RDRDay, RDRNight, Reveal, TestRhythm } from "./scenes";

// 42.840813s original MP3 -> ceil(42.840813 * 30) = 1286 frames.
export const ClipRushVideo009 = () => <AbsoluteFill style={{ background: "#090a14", color: "white", fontFamily: "Arial, sans-serif", overflow: "hidden" }}>
  <Track name="Storytelling / três jogos">
    <Sequence premountFor={30} name="Gancho / três mundos" durationInFrames={165}><Hook /></Sequence>
    <Sequence premountFor={30} name="GTA V / 48 minutos" from={165} durationInFrames={139}><GTAV /></Sequence>
    <Sequence premountFor={30} name="RDR2 / mesma média, outro ritmo" from={304} durationInFrames={106}><RDR /></Sequence>
    <Sequence premountFor={30} name="RDR2 / noite acelerada" from={410} durationInFrames={72}><RDRNight /></Sequence>
    <Sequence premountFor={30} name="RDR2 / dia mais lento" from={482} durationInFrames={70}><RDRDay /></Sequence>
    <Sequence premountFor={30} name="GTA VI / novo mundo" from={552} durationInFrames={65}><EnterVI /></Sequence>
    <Sequence premountFor={30} name="Rockstar / teste de velocidade" from={617} durationInFrames={149}><TestRhythm /></Sequence>
    <Sequence premountFor={30} name="Vice City / dias e noites mais longos" from={766} durationInFrames={154}><Longer /></Sequence>
    <Sequence premountFor={30} name="Mistério / quanto tempo?" from={920} durationInFrames={31}><Mystery /></Sequence>
    <Sequence premountFor={30} name="Revelação / estimativa de fãs" from={951} durationInFrames={121}><Reveal /></Sequence>
    <Sequence premountFor={30} name="Ressalva / não confirmado" from={1072} durationInFrames={69}><Caveat /></Sequence>
    <Sequence premountFor={30} name="Escolha / segue o ClipRush" from={1141} durationInFrames={145}><Outro /></Sequence>
  </Track>
  <Brand />
  <Sequence premountFor={30} name="Narração original integral / legendas sincronizadas" durationInFrames={1286}>
    {getRemotionEnvironment().isRendering ? <Audio name="Voz original sem cortes" src={asset("audio/narracao.mp3")} volume={0.92} /> : <Audio name="Mixagem de preview sem perdas" src={asset("preview-v001/mix.wav")} />}
    <Captions />
  </Sequence>
  {getRemotionEnvironment().isRendering && <>
  <Audio name="Relógios / transições / revelação" src={asset("audio/sfx-original-v001.wav")} />
  <Audio name="Trilha original / tensão e revelação" src={asset("audio/score-original-v001.wav")} />
  </>}
</AbsoluteFill>;
