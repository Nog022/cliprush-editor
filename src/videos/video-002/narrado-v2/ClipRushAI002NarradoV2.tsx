import { Audio } from "@remotion/media";
import { AbsoluteFill, staticFile } from "remotion";
import { NARRATION_PATH } from "../narrado/timing";
import { theme } from "../styles/theme";
import { WorldCanvasV2 } from "./WorldCanvasV2";
import { V2Titles } from "./V2Titles";

export const ClipRushAI002NarradoV2 = () => (
  <AbsoluteFill
    style={{
      backgroundColor: theme.ink,
      fontFamily: theme.font,
      color: "#fff",
      overflow: "hidden",
    }}
  >
    <WorldCanvasV2 />
    <V2Titles />
    <Audio
      name="Narração preservada · 1×"
      src={staticFile(NARRATION_PATH)}
      volume={1}
    />
  </AbsoluteFill>
);
