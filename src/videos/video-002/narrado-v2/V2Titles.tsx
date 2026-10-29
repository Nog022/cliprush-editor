import {
  Sequence,
  Track,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { narrationFrame } from "../narrado/timing";

const DirectedTitle = ({
  lines,
  duration,
  size = 84,
  impact,
}: {
  lines: string[];
  duration: number;
  size?: number;
  impact?: number;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hit =
    impact === undefined
      ? 1
      : interpolate(
          frame,
          [impact - 1, impact + 3, impact + 11],
          [1, 1.055, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );
  return (
    <div
      style={{
        position: "absolute",
        top: 350,
        left: 92,
        width: 828,
        fontSize: size,
        fontWeight: 900,
        lineHeight: 0.99,
        letterSpacing: -3.5,
        textShadow: "0 5px 25px #080a1280",
        transformOrigin: "0 50%",
        scale: hit,
        opacity: interpolate(
          frame,
          [0, 4, duration - 7, duration],
          [0, 1, 1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        ),
      }}
    >
      {lines.map((line, index) => (
        <div
          key={line}
          style={{
            color: index ? "#7be7ff" : "#ffffff",
            whiteSpace: "nowrap",
            translate: `0px ${(1 - spring({ frame: frame - index * 3, fps, config: { damping: 18, stiffness: 190 } })) * 34}px`,
          }}
        >
          {line}
        </div>
      ))}
    </div>
  );
};

export const V2Titles = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const at = (seconds: number) => narrationFrame(seconds, durationInFrames);
  return (
    <>
      <div
        style={{
          position: "absolute",
          top: 160,
          left: 94,
          color: "#d5edff",
          fontSize: 25,
          fontWeight: 800,
          letterSpacing: 4,
          opacity: interpolate(
            frame,
            [0, at(0.45), at(23.65), durationInFrames - 1],
            [0.5, 0.9, 0.9, 0],
            { extrapolateRight: "clamp" },
          ),
        }}
      >
        CLIP<span style={{ color: "#00c8ff" }}>RUSH</span>
        <span style={{ marginLeft: 20, color: "#8b91bd", fontWeight: 400 }}>
          / DE PIXELS A MUNDOS
        </span>
      </div>
      <Track name="Fala · impactos editoriais V2">
        <Sequence
          name="Gancho · como chegamos aqui"
          from={at(1.2)}
          durationInFrames={at(3.55) - at(1.2)}
          layout="none"
        >
          <DirectedTitle
            lines={["COMO CHEGAMOS", "ATÉ AQUI?"]}
            duration={at(3.55) - at(1.2)}
          />
        </Sequence>
        <Sequence
          name="No começo · pixel art"
          from={at(3.7)}
          durationInFrames={at(5.8) - at(3.7)}
          layout="none"
        >
          <DirectedTitle
            lines={["NO COMEÇO,", "PIXELS."]}
            duration={at(5.8) - at(3.7)}
          />
        </Sequence>
        <Sequence
          name="Tudo mudou · impacto da voz"
          from={at(8.66)}
          durationInFrames={at(10.3) - at(8.66)}
          layout="none"
        >
          <DirectedTitle
            lines={["TUDO", "MUDOU."]}
            size={96}
            impact={at(9.56) - at(8.66)}
            duration={at(10.3) - at(8.66)}
          />
        </Sequence>
        <Sequence
          name="A nova dimensão"
          from={at(11.32)}
          durationInFrames={at(12.6) - at(11.32)}
          layout="none"
        >
          <DirectedTitle
            lines={["UMA NOVA", "DIMENSÃO."]}
            duration={at(12.6) - at(11.32)}
          />
        </Sequence>
        <Sequence
          name="A evolução continua"
          from={at(17.64)}
          durationInFrames={at(19.85) - at(17.64)}
          layout="none"
        >
          <DirectedTitle
            lines={["A EVOLUÇÃO", "DOS GAMES"]}
            duration={at(19.85) - at(17.64)}
          />
        </Sequence>
        <Sequence
          name="Imagina o que vem"
          from={at(20.04)}
          durationInFrames={at(21.5) - at(20.04)}
          layout="none"
        >
          <DirectedTitle
            lines={["IMAGINA", "O QUE VEM AÍ."]}
            duration={at(21.5) - at(20.04)}
          />
        </Sequence>
        <Sequence
          name="Pergunta final · próximo salto"
          from={at(21.7)}
          durationInFrames={at(23.85) - at(21.7)}
          layout="none"
        >
          <DirectedTitle
            lines={["PRÓXIMO", "SALTO?"]}
            size={104}
            impact={at(22.9) - at(21.7)}
            duration={at(23.85) - at(21.7)}
          />
        </Sequence>
      </Track>
      <Sequence
        name="Comparação · duas eras"
        from={at(12.6)}
        durationInFrames={at(17.6) - at(12.6)}
        layout="none"
      >
        <div
          style={{
            position: "absolute",
            top: 355,
            left: 94,
            width: 824,
            display: "flex",
            justifyContent: "space-between",
            fontSize: 44,
            fontWeight: 900,
            letterSpacing: 4,
          }}
        >
          <span style={{ color: "#d5edb4" }}>ANTES</span>
          <span style={{ color: "#81eaff" }}>AGORA</span>
        </div>
      </Sequence>
      <Sequence
        name="Mundos gigantes · destaque breve"
        from={at(15.1)}
        durationInFrames={at(17.5) - at(15.1)}
        layout="none"
      >
        <div
          style={{
            position: "absolute",
            left: 94,
            top: 1500,
            fontWeight: 900,
            fontSize: 60,
            letterSpacing: -2,
            color: "#fff",
            textShadow: "0 4px 22px #080a12",
          }}
        >
          PIXELS <span style={{ color: "#00c8ff", margin: "0 18px" }}>→</span>{" "}
          MUNDOS
        </div>
      </Sequence>
      <Sequence
        name="Convite ao comentário"
        from={at(22.1)}
        durationInFrames={at(23.85) - at(22.1)}
        layout="none"
      >
        <div
          style={{
            position: "absolute",
            top: 1540,
            left: 94,
            color: "#d5edff",
            fontSize: 34,
            fontWeight: 600,
          }}
        >
          Qual geração marcou você?
        </div>
      </Sequence>
    </>
  );
};
