import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Freeze,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { WorldCanvas } from "../components/WorldCanvas";
import { theme } from "../styles/theme";
import { NarratedTitles } from "./NarratedTitles";
import { NARRATION_PATH, originalFrameForNarration } from "./timing";

const NarratedWorld = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <Freeze frame={originalFrameForNarration(frame, durationInFrames)}>
      <WorldCanvas />
    </Freeze>
  );
};

// Only visual time is remapped. Voice remains outside Freeze at native speed.
export const ClipRushAI002Narrado = () => (
  <AbsoluteFill
    style={{
      backgroundColor: theme.ink,
      fontFamily: theme.font,
      color: theme.white,
      overflow: "hidden",
    }}
  >
    <NarratedWorld />
    <NarratedTitles />
    <Audio
      name="Narração original · velocidade normal"
      src={staticFile(NARRATION_PATH)}
      volume={1}
    />
  </AbsoluteFill>
);
