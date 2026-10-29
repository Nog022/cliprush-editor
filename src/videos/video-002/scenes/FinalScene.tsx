import { Sequence, Track, interpolate, useCurrentFrame } from "remotion";
import { AnimatedTitle, ChapterLabel } from "../components/AnimatedTitle";

export const FinalScene = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <div
        style={{
          opacity: interpolate(frame, [0, 10, 142, 158], [0, 1, 1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <ChapterLabel number="04">O PRÓXIMO SALTO</ChapterLabel>
      </div>
      <Track name="Encerramento editorial">
        <Sequence
          name="A evolução dos games"
          durationInFrames={67}
          layout="none"
        >
          <AnimatedTitle
            lines={["A EVOLUÇÃO", "DOS GAMES"]}
            top={350}
            size={102}
            hold={67}
            stagger={5}
          />
        </Sequence>
        <Sequence
          name="Pergunta ao público"
          from={67}
          durationInFrames={88}
          layout="none"
        >
          <AnimatedTitle
            lines={["E O PRÓXIMO", "SALTO?"]}
            top={350}
            size={104}
            hold={88}
            stagger={5}
          />
        </Sequence>
      </Track>
      <div
        style={{
          position: "absolute",
          top: 1530,
          left: 92,
          fontSize: 45,
          fontWeight: 900,
          letterSpacing: 4,
          color: "#ffffff",
          opacity: interpolate(frame, [72, 90, 142, 155], [0, 1, 1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        CLIP<span style={{ color: "#00c8ff" }}>RUSH</span>
        <div
          style={{
            fontSize: 29,
            fontWeight: 500,
            letterSpacing: 2,
            marginTop: 13,
            color: "#b8c9df",
          }}
        >
          Qual geração marcou você?
        </div>
      </div>
    </>
  );
};
