import {
  AbsoluteFill,
  Sequence,
  Track,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { WorldCanvas } from "./components/WorldCanvas";
import { AudioSlots, type AudioCue } from "./components/AudioSlots";
import { IntroScene } from "./scenes/IntroScene";
import { PixelWorldScene } from "./scenes/PixelWorldScene";
import { TransformationScene } from "./scenes/TransformationScene";
import { ComparisonScene } from "./scenes/ComparisonScene";
import { FinalScene } from "./scenes/FinalScene";
import { theme } from "./styles/theme";

const FilmSignature = () => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: 94,
        top: 160,
        width: 824,
        display: "flex",
        justifyContent: "space-between",
        color: "#d0e3fa",
        fontSize: 25,
        fontWeight: 700,
        letterSpacing: 4,
        opacity: interpolate(frame, [25, 48, 850, 875], [0, 0.9, 0.9, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      }}
    >
      <span>
        CLIP<span style={{ color: "#00c8ff" }}>RUSH</span> / ORIGINALS
      </span>
      <span>002</span>
    </div>
  );
};

export const ClipRushAI002 = ({
  audioCues = [],
}: {
  audioCues?: AudioCue[];
}) => (
  <AbsoluteFill
    style={{
      backgroundColor: theme.ink,
      fontFamily: theme.font,
      color: theme.white,
      overflow: "hidden",
    }}
  >
    <WorldCanvas />
    <FilmSignature />
    <Track name="De pixels a mundos · direção editorial">
      <Sequence
        name="01 · O gancho impossível"
        durationInFrames={90}
        layout="none"
      >
        <IntroScene />
      </Sequence>
      <Sequence
        name="02 · O nascimento dos pixels"
        from={90}
        durationInFrames={180}
        layout="none"
      >
        <PixelWorldScene />
      </Sequence>
      <Sequence
        name="03 · A grande transformação"
        from={270}
        durationInFrames={210}
        layout="none"
      >
        <TransformationScene />
      </Sequence>
      <Sequence
        name="04 · Do simples ao extraordinário"
        from={480}
        durationInFrames={240}
        layout="none"
      >
        <ComparisonScene />
      </Sequence>
      <Sequence
        name="05 · O futuro está começando"
        from={720}
        durationInFrames={180}
        layout="none"
      >
        <FinalScene />
      </Sequence>
    </Track>
    <AudioSlots cues={audioCues} />
  </AbsoluteFill>
);
