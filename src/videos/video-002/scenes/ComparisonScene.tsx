import { Sequence, interpolate, useCurrentFrame } from "remotion";
import { AnimatedTitle, ChapterLabel } from "../components/AnimatedTitle";

export const ComparisonScene = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <ChapterLabel number="03">O MESMO MUNDO</ChapterLabel>
      <div
        style={{
          position: "absolute",
          top: 380,
          left: 94,
          width: 824,
          display: "flex",
          justifyContent: "space-between",
          fontSize: 44,
          fontWeight: 900,
          letterSpacing: 4,
          opacity: interpolate(frame, [10, 28, 210, 239], [0, 1, 1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <span style={{ color: "#c6e5b6" }}>ANTES</span>
        <span style={{ color: "#9defff" }}>AGORA</span>
      </div>
      <Sequence
        name="De pixels a mundos inteiros"
        from={114}
        durationInFrames={126}
        layout="none"
      >
        <AnimatedTitle
          lines={["DE PIXELS A", "MUNDOS INTEIROS."]}
          top={1430}
          size={81}
          hold={126}
          stagger={3}
        />
      </Sequence>
    </>
  );
};
