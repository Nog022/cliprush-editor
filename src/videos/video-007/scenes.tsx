import { AbsoluteFill } from "remotion";
import {
  Picture,
  Footage,
  Shade,
  Title,
  Connector,
  Contract,
  Radio,
} from "./components";
export const Hook = ({ alternate = false }: { alternate?: boolean }) => (
  <AbsoluteFill>
    <Picture
      person="Jason"
      n={alternate ? 5 : 2}
      position={alternate ? "28% 50%" : "47% 50%"}
    />
    <Shade />
    <Title eyebrow="DOSSIÊ 01 / UMA TEORIA" color="#fff">
      JASON ESTÁ
      <br />
      <span style={{ color: "#f4df56" }}>SENDO USADO?</span>
    </Title>
  </AbsoluteFill>
);
export const City = ({ board = false }: { board?: boolean }) => (
  <AbsoluteFill>
    <Footage name={board ? "keys" : "city"} />
    <Shade />
    {board && (
      <>
        <div
          style={{
            position: "absolute",
            top: 350,
            left: 90,
            width: 380,
            height: 540,
            border: "8px solid #e7e0ca",
            rotate: "-7deg",
          }}
        >
          <Picture person="Jason" n={2} />
        </div>
        <div
          style={{
            position: "absolute",
            top: 410,
            right: 100,
            width: 380,
            height: 540,
            border: "8px solid #e7e0ca",
            rotate: "7deg",
          }}
        >
          <Picture person="Brian" n={1} />
        </div>
        <Connector />
      </>
    )}
    <Title eyebrow="EPISÓDIO 1/5" top={1080}>
      OS DONOS
      <br />
      SECRETOS DE
      <br />
      <span style={{ color: "#fff" }}>VICE CITY</span>
    </Title>
  </AbsoluteFill>
);
export const Brian = ({ file = false }: { file?: boolean }) => (
  <AbsoluteFill>
    {file ? (
      <Footage name="brian-v2" position="60% 50%" />
    ) : (
      <Picture person="Brian" n={3} reveal position="58% 50%" />
    )}
    <Shade />
    <Title
      eyebrow={file ? "ARQUIVO 01 / HISTÓRICO" : "PRIMEIRA PISTA"}
      color={file ? "#f4df56" : "#fff"}
    >
      {file ? (
        <>
          DÉCADAS
          <br />
          NO CRIME
        </>
      ) : (
        <>
          BRIAN
          <br />
          HEDER
        </>
      )}
    </Title>
    {file && (
      <div
        style={{
          position: "absolute",
          top: 780,
          left: 90,
          border: "5px solid #ff494e",
          padding: "18px 26px",
          fontSize: 45,
          color: "#ff494e",
          rotate: "-8deg",
        }}
      >
        PASSADO CRIMINOSO
      </div>
    )}
  </AbsoluteFill>
);
export const Split = () => (
  <AbsoluteFill>
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "50%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <Picture person="Jason" n={2} />
    </div>
    <div
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        width: "50%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <Picture person="Brian" n={1} />
    </div>
    <Shade />
    <Connector />
    <Title eyebrow="JASON ↔ BRIAN">
      QUAL É<br />A LIGAÇÃO?
    </Title>
  </AbsoluteFill>
);
export const Housing = ({ stamp = false }: { stamp?: boolean }) => (
  <AbsoluteFill>
    <Picture person="Jason" n={1} position="68% 50%" />
    <Shade />
    <Contract stamp={stamp} />
    <Title top={330} eyebrow="O ACORDO" color="#fff">
      {stamp ? "NADA É DE GRAÇA." : "MORADIA SEM ALUGUEL?"}
    </Title>
  </AbsoluteFill>
);
export const Work = ({ risk = false }: { risk?: boolean }) => (
  <AbsoluteFill>
    {risk ? (
      <Footage name="risk-v2" position="65% 50%" />
    ) : (
      <Picture person="Brian" n={4} position="53% 50%" />
    )}
    <Shade />
    <Title eyebrow="A CONDIÇÃO" color={risk ? "#ff5c60" : "#f4df56"}>
      {risk ? "COBRANÇAS" : "SERVIÇOS"}
    </Title>
    <div
      style={{
        position: "absolute",
        top: 1430,
        left: 85,
        fontSize: 24,
        letterSpacing: 2,
      }}
    >
      MONTAGEM ILUSTRATIVA
    </div>
  </AbsoluteFill>
);
export const Control = ({ close = false }: { close?: boolean }) => (
  <AbsoluteFill>
    <Picture
      person={close ? "Jason" : "Brian"}
      n={close ? 6 : 2}
      position="57% 50%"
    />
    <Shade />
    {!close && (
      <>
        <div
          style={{
            position: "absolute",
            left: 620,
            top: 960,
            width: 270,
            height: 340,
            border: "5px solid #ff494e",
            boxShadow: "0 15px 55px #000",
          }}
        >
          <Picture person="Jason" n={2} />
        </div>
        <Connector vertical />
      </>
    )}
    <Title
      top={close ? 1030 : 350}
      eyebrow="RELAÇÃO DE INTERESSES / TEORIA"
      color="#fff"
    >
      {close ? (
        <>
          SEM
          <br />
          <span style={{ color: "#ff5c60" }}>PERCEBER?</span>
        </>
      ) : (
        <>
          QUEM
          <br />
          MANDA?
        </>
      )}
    </Title>
  </AbsoluteFill>
);
export const Signal = ({
  mode,
}: {
  mode: "hint" | "friend" | "coast" | "question" | "part2" | "cta";
}) => (
  <AbsoluteFill>
    <Radio silhouette={["friend", "question", "part2", "cta"].includes(mode)} />
    <Title
      top={mode === "cta" ? 820 : 1220}
      eyebrow={
        mode === "cta"
          ? "CONTINUA NO PRÓXIMO EPISÓDIO"
          : "ARQUIVO 02 / SINAL DESCONHECIDO"
      }
      color="#9cffd2"
    >
      {mode === "hint" ? (
        <>
          OUTRA
          <br />
          PISTA...
        </>
      ) : mode === "friend" ? (
        <>
          QUEM ESTÁ
          <br />
          ESCUTANDO?
        </>
      ) : mode === "coast" ? (
        <>
          GUARDA
          <br />
          COSTEIRA
        </>
      ) : mode === "question" ? (
        <>
          O QUE ELE
          <br />
          QUER SABER?
        </>
      ) : mode === "part2" ? (
        <>
          PARTE 2<br />
          <span style={{ fontSize: 50, color: "#fff" }}>
            QUEM É ESSE HOMEM?
          </span>
        </>
      ) : (
        <>
          PARTE 2<br />
          <span style={{ fontSize: 62, color: "#fff" }}>SIGA O CLIPRUSH</span>
        </>
      )}
    </Title>
  </AbsoluteFill>
);
