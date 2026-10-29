import { Sequence, Track, interpolate, useCurrentFrame } from "remotion";
import { AnimatedTitle, ChapterLabel } from "../components/AnimatedTitle";

export const TransformationScene = () => {
  const frame = useCurrentFrame();
  const steps = ["DESCONSTRUIR", "GANHAR PROFUNDIDADE", "ILUMINAR", "EXPANDIR"];
  const active = frame < 70 ? 0 : frame < 120 ? 1 : frame < 165 ? 2 : 3;
  return (
    <>
      <ChapterLabel number="02">A TRANSFORMAÇÃO</ChapterLabel>
      <Track name="A virada visual">
        <Sequence name="Então tudo mudou" durationInFrames={74} layout="none">
          <AnimatedTitle
            lines={["ENTÃO…", "TUDO MUDOU."]}
            top={350}
            size={96}
            hold={74}
          />
        </Sequence>
        <Sequence
          name="Uma nova dimensão"
          from={98}
          durationInFrames={96}
          layout="none"
        >
          <AnimatedTitle
            lines={["UMA NOVA", "DIMENSÃO."]}
            top={350}
            size={102}
            hold={96}
          />
        </Sequence>
      </Track>
      <div
        style={{
          position: "absolute",
          left: 92,
          top: 1540,
          color: "#b9e8f6",
          fontSize: 36,
          fontWeight: 700,
          letterSpacing: 2,
          opacity: interpolate(frame, [10, 24, 196, 210], [0, 1, 1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <span style={{ color: "#00c8ff", paddingRight: 18 }}>
          0{active + 1}
        </span>
        {steps[active]}
        <div style={{ marginTop: 22, display: "flex", gap: 10 }}>
          {steps.map((step, i) => (
            <div
              key={step}
              style={{
                width: 64,
                height: 4,
                background: i <= active ? "#72e7ff" : "#ffffff30",
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
};
