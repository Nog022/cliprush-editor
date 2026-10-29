import {
  Sequence,
  Track,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { AnimatedTitle, ChapterLabel } from "../components/AnimatedTitle";
import { narrationFrame } from "./timing";

export const NarratedTitles = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const at = (seconds: number) => narrationFrame(seconds, durationInFrames);
  return (
    <>
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
          opacity: interpolate(
            frame,
            [at(0.6), at(1.2), at(23.6), durationInFrames - 1],
            [0, 0.9, 0.9, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          ),
        }}
      >
        <span>
          CLIP<span style={{ color: "#00c8ff" }}>RUSH</span> / ORIGINALS
        </span>
        <span>002</span>
      </div>
      <Track name="Capítulos · alinhados à narração">
        <Sequence
          name="Pixels · no começo"
          from={at(3.6)}
          durationInFrames={at(8.2) - at(3.6)}
          layout="none"
        >
          <ChapterLabel number="01">O NASCIMENTO</ChapterLabel>
        </Sequence>
        <Sequence
          name="Dimensão · tudo mudou"
          from={at(8.2)}
          durationInFrames={at(12.6) - at(8.2)}
          layout="none"
        >
          <ChapterLabel number="02">A TRANSFORMAÇÃO</ChapterLabel>
        </Sequence>
        <Sequence
          name="Mundos · comparação"
          from={at(12.6)}
          durationInFrames={at(17.6) - at(12.6)}
          layout="none"
        >
          <ChapterLabel number="03">O MESMO MUNDO</ChapterLabel>
        </Sequence>
        <Sequence
          name="Futuro · próxima geração"
          from={at(17.6)}
          durationInFrames={at(23.78) - at(17.6)}
          layout="none"
        >
          <ChapterLabel number="04">O PRÓXIMO SALTO</ChapterLabel>
        </Sequence>
      </Track>
      <Track name="Títulos · relógio real da fala">
        <Sequence
          name="Como chegamos até aqui"
          from={at(1.2)}
          durationInFrames={at(3.6) - at(1.2)}
          layout="none"
        >
          <AnimatedTitle
            lines={["COMO", "CHEGAMOS", "ATÉ AQUI?"]}
            top={350}
            size={106}
            accentLine={2}
            hold={at(3.6) - at(1.2)}
          />
        </Sequence>
        <Sequence
          name="Tudo começou com pixels"
          from={at(3.68)}
          durationInFrames={at(7.1) - at(3.68)}
          layout="none"
        >
          <AnimatedTitle
            lines={["TUDO COMEÇOU", "COM PIXELS."]}
            top={350}
            size={88}
            hold={at(7.1) - at(3.68)}
          />
        </Sequence>
        <Sequence
          name="Então tudo mudou"
          from={at(8.66)}
          durationInFrames={at(10.3) - at(8.66)}
          layout="none"
        >
          <AnimatedTitle
            lines={["ENTÃO…", "TUDO MUDOU."]}
            top={350}
            size={96}
            hold={at(10.3) - at(8.66)}
          />
        </Sequence>
        <Sequence
          name="Uma nova dimensão"
          from={at(11.32)}
          durationInFrames={at(12.6) - at(11.32)}
          layout="none"
        >
          <AnimatedTitle
            lines={["UMA NOVA", "DIMENSÃO."]}
            top={350}
            size={102}
            hold={at(12.6) - at(11.32)}
            stagger={2}
          />
        </Sequence>
        <Sequence
          name="De pixels a mundos"
          from={at(14.72)}
          durationInFrames={at(17.6) - at(14.72)}
          layout="none"
        >
          <AnimatedTitle
            lines={["DE PIXELS A", "MUNDOS INTEIROS."]}
            top={1430}
            size={81}
            hold={at(17.6) - at(14.72)}
          />
        </Sequence>
        <Sequence
          name="A evolução dos games"
          from={at(17.64)}
          durationInFrames={at(21.5) - at(17.64)}
          layout="none"
        >
          <AnimatedTitle
            lines={["A EVOLUÇÃO", "DOS GAMES"]}
            top={350}
            size={102}
            hold={at(21.5) - at(17.64)}
            stagger={5}
          />
        </Sequence>
        <Sequence
          name="O próximo salto"
          from={at(21.7)}
          durationInFrames={at(23.78) - at(21.7)}
          layout="none"
        >
          <AnimatedTitle
            lines={["E O PRÓXIMO", "SALTO?"]}
            top={350}
            size={104}
            hold={at(23.78) - at(21.7)}
            stagger={3}
          />
        </Sequence>
      </Track>
      <Sequence
        name="Antes e agora · legendas das eras"
        from={at(12.6)}
        durationInFrames={at(17.6) - at(12.6)}
        layout="none"
      >
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
          }}
        >
          <span style={{ color: "#c6e5b6" }}>ANTES</span>
          <span style={{ color: "#9defff" }}>AGORA</span>
        </div>
      </Sequence>
    </>
  );
};
