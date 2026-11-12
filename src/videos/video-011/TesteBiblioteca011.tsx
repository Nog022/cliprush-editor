import { Video } from "@remotion/media";
import {
  AbsoluteFill,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// Temporary integration check: scene 55, excerpt 3 (437.156–446.200 s).
// Read the original library asset directly; no intermediate media file.
export const TesteBiblioteca011: React.FC = () => {
  const { fps, durationInFrames, width, height } = useVideoConfig();
  const frame = useCurrentFrame();
  const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
  // Follow the dog photograph on the upper door in original 1920x1080 pixels.
  // Scale from cover so even the opening frame fills the portrait canvas.
  const focusX = interpolate(frame, [0, 2 * fps, durationInFrames - 1], [1327, 1410, 1475], clamp);
  const focusY = interpolate(frame, [0, 2 * fps, durationInFrames - 1], [605, 670, 495], clamp);
  const scale = Math.max(width / 1920, height / 1080) *
    interpolate(frame, [0, durationInFrames - 1], [1, 2.1], clamp);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Video
        name="Biblioteca GTA 6 / cena 55 / trecho 3"
        src={staticFile("videos/biblioteca/gta6/videos/gta6-extended.mp4")}
        trimBefore={Math.round(437.156 * fps)}
        durationInFrames={durationInFrames}
        objectFit="cover"
        style={{
          position: "absolute",
          width: 1920 * scale,
          height: 1080 * scale,
          left: Math.max(width - 1920 * scale, Math.min(0, width / 2 - focusX * scale)),
          top: Math.max(height - 1080 * scale, Math.min(0, height / 2 - focusY * scale)),
        }}
      />
    </AbsoluteFill>
  );
};
