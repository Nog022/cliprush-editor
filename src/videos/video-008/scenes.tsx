import {
  AbsoluteFill,
  CanvasImage,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Audio, Video } from "@remotion/media";
import {
  Annotation,
  Atmosphere,
  CHOP,
  DOG,
  DogCamera,
  Flash,
  FRANKLIN,
  Headline,
  Photo,
  clamp,
  colors,
} from "./components";
import { asset, trailerSelection } from "./timing";

export const RoccoIntro = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <Atmosphere source={CHOP} />
      {f < 1.4 * fps ? (
        <Photo
          source={CHOP}
          style={{ left: 0, top: 260, width: 1080, height: 1030 }}
          zoom={[1, 1.15]}
          seconds={1.4}
        />
      ) : (
        <DogCamera
          zoom={[2.6, 2.85]}
          focus={[0.7, 0.65]}
          endFocus={[0.71, 0.64]}
          top={260}
          height={1030}
          seconds={0.9}
        />
      )}
      <AbsoluteFill
        style={{
          background: "linear-gradient(180deg,transparent 45%,#090a14 74%)",
        }}
      />
      <Headline
        top={1110}
        size={145}
        color={colors.yellow}
        eyebrow="GTA 6 PODE TER UM..."
      >
        NOVO
        <br />
        CHOP?!
      </Headline>
      <div
        style={{
          position: "absolute",
          top: 300,
          left: 84,
          padding: "12px 24px",
          background: colors.ink,
          color: colors.cyan,
          fontSize: 36,
          fontWeight: 900,
        }}
      >
        {f < 1.4 * fps ? "GTA 5" : "GTA 6 ?"}
      </div>
      <Flash />
    </AbsoluteFill>
  );
};

export const ChopMemory = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <Atmosphere source={FRANKLIN} />
      {f < 1.4 * fps ? (
        <Photo
          source={FRANKLIN}
          style={{ left: 0, top: 270, width: 1080, height: 960 }}
          position="60% 45%"
          zoom={[1, 1.05]}
        />
      ) : (
        <Photo
          source={FRANKLIN}
          style={{ left: 0, top: 270, width: 1080, height: 960 }}
          position="51% 55%"
          zoom={[1.16, 1.24]}
        />
      )}
      <AbsoluteFill
        style={{
          background: "linear-gradient(180deg,transparent 50%,#090a14 76%)",
        }}
      />
      <Headline top={1160} size={95} eyebrow="LOS SANTOS • GTA 5">
        FRANKLIN <span style={{ color: colors.cyan }}>+</span>
        <br />
        <span style={{ color: colors.yellow }}>CHOP</span>
      </Headline>
      <Flash />
    </AbsoluteFill>
  );
};

const MissingTrailer = ({ freeze = false }: { freeze?: boolean }) => (
  <AbsoluteFill
    style={{
      background: "radial-gradient(ellipse at 50% 42%,#25203d,#090a14 70%)",
    }}
  >
    <div
      style={{
        position: "absolute",
        left: 84,
        top: 390,
        width: 830,
        height: 580,
        border: "3px dashed #b388ff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 160,
        color: colors.purple,
      }}
    >
      {freeze ? "Ⅱ" : "▷"}
    </div>
    <Headline top={1050} size={82} eyebrow="PRÉVIA • MATERIAL PENDENTE">
      {freeze ? "FREEZE DO CACHORRO" : "TRECHO DO CACHORRO"}
    </Headline>
    <div
      data-safe="note"
      style={{
        position: "absolute",
        left: 84,
        right: 150,
        top: 1290,
        fontSize: 32,
        lineHeight: 1.35,
        color: "#d3cedd",
      }}
    >
      Cena ainda não localizada no trailer fornecido. Aguardando o timecode ou
      arquivo correspondente.
    </div>
  </AbsoluteFill>
);

export const TrailerReveal = () => {
  const { fps } = useVideoConfig();
  if (trailerSelection.startSeconds === null) return <MissingTrailer />;
  return (
    <AbsoluteFill>
      <Atmosphere />
      <Video
        src={staticFile(asset("video-complementar/Launch Trailer.mp4"))}
        muted
        trimBefore={Math.round(trailerSelection.startSeconds * fps)}
        style={{
          position: "absolute",
          left: 0,
          top: 350,
          width: 1080,
          height: 900,
        }}
        objectFit="contain"
      />
      <Headline top={1210} size={95} eyebrow="ARQUIVO FORNECIDO • 00:27–00:30">
        OLHA ESSA CENA...
      </Headline>
      {!trailerSelection.verified && (
        <div
          style={{
            position: "absolute",
            top: 1400,
            left: 84,
            fontSize: 28,
            color: colors.purple,
          }}
        >
          PRÉVIA • TRECHO EM CONFERÊNCIA
        </div>
      )}
    </AbsoluteFill>
  );
};

export const TrailerFreezeFrame = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const source = "imagens/cachorro de oculos.jpg";
  const zoom = interpolate(frame, [0, 0.24 * fps, 78], [1.6, 1.72, 2.15], clamp);
  const imageWidth = 1080 * zoom;
  const imageHeight = imageWidth * 970 / 927;
  return (
    <AbsoluteFill>
      <Atmosphere source={source} />
      <div style={{ position: "absolute", top: 300, left: 0, width: 1080, height: 820, overflow: "hidden" }}>
        <CanvasImage
          src={staticFile(asset(source))}
          style={{ position: "absolute", width: imageWidth, height: imageHeight,
            left: 540 - imageWidth * 0.67,
            top: interpolate(frame, [0, 78], [570, 510], clamp) - imageHeight * 0.86,
          }}
        />
      </div>
      <Headline top={1210} size={125} color={colors.yellow} eyebrow="OLHA ESSE DETALHE">
        {frame >= Math.ceil(10.82 * fps) - 268 ? "DE ?CULOS?!" : "VOC? VIU?!"}
      </Headline>
      <Flash />
      <Audio src={staticFile(asset("audio/oculos-whoosh-v001.wav"))} />
    </AbsoluteFill>
  );
};

export const RoccoScreenshot = () => (
  <AbsoluteFill>
    <Atmosphere />
    <DogCamera
      zoom={[1.07, 2.75]}
      focus={[0.5, 0.5]}
      endFocus={[0.7, 0.63]}
      top={280}
      height={900}
      seconds={4.7}
    />
    <Headline top={1220} size={105} eyebrow="JASON + O CACHORRO">
      UMA NOVA
      <br />
      <span style={{ color: colors.yellow }}>PISTA...</span>
    </Headline>
    <Flash />
  </AbsoluteFill>
);

export const RedStrapInvestigation = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <Atmosphere />
      <DogCamera
        zoom={[2.75, 3.5]}
        focus={[0.7, 0.63]}
        endFocus={[0.724, 0.69]}
        top={280}
        height={900}
        seconds={3.13}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(90deg,#090a1477,transparent 30%,transparent 70%,#090a1477)",
        }}
      />
      <Annotation x={560} y={840} rx={200} ry={112} color="#ff7277" />
      <Headline top={1200} size={108} eyebrow="NO EQUIPAMENTO">
        {f < 1.52 * fps ? (
          <>
            <span style={{ color: "#ff7277" }}>FAIXA</span>
            <br />
            VERMELHA
          </>
        ) : (
          <>
            PARECE
            <br />
            ESTAR ESCRITO...
          </>
        )}
      </Headline>
      <div
        style={{
          position: "absolute",
          top: 1138,
          left: 84,
          width: 830,
          height: 3,
          background: "#ffffff22",
        }}
      >
        <div
          style={{
            height: 3,
            width: `${interpolate(f, [0, 3.13 * fps], [0, 100], clamp)}%`,
            background: colors.cyan,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

export const RoccoNameReveal = () => (
  <AbsoluteFill>
    <Atmosphere />
    <DogCamera
      zoom={[4.5, 4.7]}
      focus={[0.728, 0.71]}
      top={300}
      height={790}
      seconds={1}
      conceal={false}
    />
    <Annotation x={540} y={727} rx={296} ry={138} />
    <Headline top={1130} size={180} color={colors.yellow}>
      ROCCO?
    </Headline>
    <div
      data-safe="note"
      style={{
        position: "absolute",
        left: 84,
        top: 1370,
        fontSize: 35,
        color: "#ddd4f1",
      }}
    >
      Leitura aparente da inscrição.
    </div>
    <Flash />
  </AbsoluteFill>
);

export const ChopComparison = () => (
  <AbsoluteFill>
    <Atmosphere />
    <Photo
      source={CHOP}
      style={{
        left: 64,
        top: 330,
        width: 425,
        height: 725,
        filter: "blur(20px) brightness(.4)",
      }}
    />
    <Photo
      source={CHOP}
      style={{ left: 64, top: 430, width: 425, height: 510 }}
      fit="contain"
      zoom={[0.97, 1]}
    />
    <div
      style={{
        position: "absolute",
        left: 505,
        top: 330,
        width: 425,
        height: 725,
        overflow: "hidden",
      }}
    >
      <CanvasImage
        src={staticFile(asset(DOG))}
        style={{
          position: "absolute",
          width: 1836,
          height: 1032.75,
          left: -1087,
          top: -350,
        }}
      />
    </div>
    <div
      style={{
        position: "absolute",
        left: 499,
        top: 330,
        width: 3,
        height: 725,
        background: colors.cyan,
      }}
    />
    <div
      style={{
        position: "absolute",
        top: 1080,
        left: 80,
        fontSize: 45,
        fontWeight: 900,
      }}
    >
      GTA 5
    </div>
    <div
      style={{
        position: "absolute",
        top: 1080,
        left: 530,
        fontSize: 45,
        fontWeight: 900,
        color: colors.cyan,
      }}
    >
      GTA 6 <span style={{ color: colors.yellow }}>?</span>
    </div>
    <Headline top={1210} size={84}>
      COMPANHEIRO
      <br />
      <span style={{ color: colors.yellow }}>NÃO CONFIRMADO</span>
    </Headline>
    <Flash />
  </AbsoluteFill>
);

export const RoccoOutro = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <Atmosphere />
      <DogCamera
        zoom={[2.8, 2.9]}
        focus={[0.7, 0.64]}
        endFocus={[0.705, 0.63]}
        top={260}
        height={910}
        seconds={4}
        conceal={false}
      />
      <Photo
        source={CHOP}
        style={{
          left: 86,
          top: 850,
          width: 225,
          height: 230,
          border: `4px solid ${colors.cyan}`,
          rotate: "-7deg",
          boxShadow: "0 12px 30px #0008",
        }}
      />
      <Headline top={1200} size={112}>
        JOGARIA
        <br />
        <span style={{ color: colors.yellow }}>COM ELE?</span>
      </Headline>
      <Sequence from={Math.round(2.56 * fps)}>
        <div
          style={{
            position: "absolute",
            top: 1740,
            left: 84,
            fontWeight: 900,
            fontSize: 45,
            letterSpacing: 1,
            color: colors.cyan,
          }}
        >
          + SEGUE O CLIPRUSH
        </div>
      </Sequence>
      <Flash />
    </AbsoluteFill>
  );
};
