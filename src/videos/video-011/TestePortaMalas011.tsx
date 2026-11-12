import { Video } from "@remotion/media";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

// Found via catalog search: red convertible, scene 69, excerpt 3.
// Catalog starts at 506.693 s; visual review locates the roof movement 3 s later.
// The reference video is used for identification only, never as render media.
export const TestePortaMalas011: React.FC = () => {
  const { fps, durationInFrames, width, height } = useVideoConfig();
  const frame = useCurrentFrame();
  const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
  const scale = Math.max(width / 1920, height / 1080) *
    interpolate(frame, [0, durationInFrames - 1], [1, 1.15], clamp);
  const focusX = interpolate(frame, [0, durationInFrames - 1], [975, 960], clamp);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Video
        name="Biblioteca GTA 6 / cena 69 / trecho 3 / traseira do conversível"
        src={staticFile("videos/biblioteca/gta6/videos/gta6-extended.mp4")}
        trimBefore={Math.round((506.693 + 3) * fps)}
        durationInFrames={durationInFrames}
        objectFit="cover"
        style={{
          position: "absolute",
          width: 1920 * scale,
          height: 1080 * scale,
          left: Math.max(width - 1920 * scale, Math.min(0, width / 2 - focusX * scale)),
          top: Math.max(height - 1080 * scale, Math.min(0, height / 2 - 740 * scale)),
        }}
      />
    </AbsoluteFill>
  );
};
