import { Sequence, interpolate, useCurrentFrame } from "remotion";
import { AnimatedTitle, ChapterLabel } from "../components/AnimatedTitle";

export const PixelWorldScene = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <ChapterLabel number="01">O NASCIMENTO</ChapterLabel>
      <Sequence
        name="Tudo começou com pixels"
        durationInFrames={100}
        layout="none"
      >
        <AnimatedTitle
          lines={["TUDO COMEÇOU", "COM PIXELS."]}
          top={350}
          size={88}
          hold={100}
        />
      </Sequence>
      <div
        style={{
          position: "absolute",
          top: 1545,
          left: 92,
          color: "#c6f6eb",
          fontSize: 44,
          fontWeight: 700,
          letterSpacing: 5,
          opacity: interpolate(frame, [55, 75], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        2D · PIXEL ART
      </div>
    </>
  );
};
