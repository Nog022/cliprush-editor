import { Video } from "@remotion/media";
import {
  AbsoluteFill,
  CanvasImage,
  Easing,
  Interactive,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const source = staticFile("videos/video-001/footage/original.mp4");

export const Stage = () => (
  <AbsoluteFill
    style={{
      background:
        "radial-gradient(ellipse at 10% 25%, #222066 0%, #090b20 45%, #050610 100%)",
      overflow: "hidden",
    }}
  >
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage:
          "linear-gradient(#707cff12 1px, transparent 1px), linear-gradient(90deg, #707cff12 1px, transparent 1px)",
        backgroundSize: "72px 72px",
      }}
    />
    <div
      style={{
        position: "absolute",
        width: 7,
        top: 280,
        bottom: 360,
        left: 38,
        background:
          "linear-gradient(transparent, #47eaff, #a879ff, transparent)",
        opacity: 0.6,
      }}
    />
  </AbsoluteFill>
);

// Both copies inherit the same source clock. Exactly one carries audio.
// The wide source is cropped proportionally around Rush, never stretched.
export const RushCamera = ({
  pipAt,
  sourceStart,
  punchAt,
}: {
  pipAt?: number;
  sourceStart: number;
  punchAt?: number;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pip =
    pipAt === undefined
      ? 0
      : interpolate(frame, [pipAt * fps, pipAt * fps + 12], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.22, 1, 0.36, 1),
        });
  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: -40,
          opacity: 0.2,
          filter: "blur(32px)",
          overflow: "hidden",
        }}
      >
        <Video
          name="Ambiente desfocado · sem áudio"
          src={source}
          muted
          objectFit="cover"
          style={{ width: "100%", height: "100%" }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: interpolate(pip, [0, 1], [0, 650]),
          top: interpolate(pip, [0, 1], [0, 1070]),
          width: interpolate(pip, [0, 1], [1080, 270]),
          height: interpolate(pip, [0, 1], [1920, 350]),
          borderRadius: interpolate(pip, [0, 1], [0, 24]),
          overflow: "hidden",
          border: pip > 0 ? "3px solid #47eaff" : "none",
          boxShadow: pip > 0 ? "0 0 35px #47eaff40, 0 20px 70px #0009" : "none",
          zIndex: pip > 0 ? 5 : 1,
        }}
      >
        <Video
          name="Rush · voz original e câmera sincronizadas"
          src={source}
          objectFit="cover"
          volume={1}
          style={{
            width: "100%",
            height: "100%",
            scale:
              punchAt === undefined
                ? interpolate(
                    frame,
                    [sourceStart * fps, (sourceStart + 7) * fps],
                    [1, 1.035],
                    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
                  )
                : interpolate(
                    frame,
                    [punchAt * fps, punchAt * fps + 5, punchAt * fps + 30],
                    [1, 1.09, 1.06],
                    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
                  ),
          }}
        />
        {pip > 0.7 ? (
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: "12px 18px",
              color: "#fff",
              background: "linear-gradient(transparent, #050612)",
              fontSize: 23,
              fontWeight: 900,
              letterSpacing: 4,
            }}
          >
            RUSH
          </div>
        ) : null}
      </div>
      <AbsoluteFill
        style={{
          zIndex: 2,
          pointerEvents: "none",
          opacity: 1 - pip,
          background:
            "linear-gradient(#050611c9 0%, #05061120 37%, transparent 58%, #050611bf 88%, #050611 100%)",
        }}
      />
    </>
  );
};

export const Brand = () => (
  <>
    <div
      style={{
        position: "absolute",
        left: 86,
        top: 140,
        display: "flex",
        alignItems: "center",
        gap: 16,
        color: "#fff",
        fontWeight: 900,
        fontSize: 38,
        letterSpacing: -1,
      }}
    >
      <svg width="38" height="48" viewBox="0 0 38 48">
        <path d="M22 1 1 27h15l-2 20 23-29H21Z" fill="#47eaff" />
      </svg>
      CLIP<span style={{ color: "#47eaff", marginLeft: -16 }}>RUSH</span>
    </div>
    <div
      style={{
        position: "absolute",
        top: 151,
        right: 160,
        color: "#d7ccff",
        fontSize: 23,
        letterSpacing: 5,
        fontWeight: 700,
      }}
    >
      GAMING NEWS
    </div>
  </>
);

export const Headline = ({
  kicker,
  children,
  color = "#ffffff",
  size = 94,
}: {
  kicker: string;
  children: React.ReactNode;
  color?: string;
  size?: number;
}) => {
  const frame = useCurrentFrame();
  return (
    <Interactive.Div
      name="Título editorial"
      style={{
        position: "absolute",
        top: 292,
        left: 90,
        width: 830,
        opacity: interpolate(frame, [0, 6], [0, 1], {
          extrapolateRight: "clamp",
        }),
        translate: interpolate(frame, [0, 12], ["0px 24px", "0px 0px"], {
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.22, 1, 0.36, 1),
        }),
      }}
    >
      <div
        style={{
          fontSize: 29,
          fontWeight: 800,
          letterSpacing: 5,
          color: "#47eaff",
          marginBottom: 22,
        }}
      >
        {kicker}
      </div>
      <div
        style={{
          color,
          fontSize: size,
          fontWeight: 900,
          lineHeight: 0.96,
          letterSpacing: -4,
          textShadow: "0 5px 35px #0009",
        }}
      >
        {children}
      </div>
    </Interactive.Div>
  );
};

export const SupportImage = ({
  asset,
  top,
  height,
  contain = false,
}: {
  asset: string;
  top: number;
  height: number;
  contain?: boolean;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Interactive.Div
      name="Imagem de apoio · movimento de profundidade"
      style={{
        position: "absolute",
        left: 90,
        top,
        width: 830,
        height,
        borderRadius: 24,
        overflow: "hidden",
        border: "1px solid #b2adff50",
        boxShadow: "0 28px 100px #0008",
        backgroundColor: "#111027",
        opacity: interpolate(frame, [0, 9], [0, 1], {
          extrapolateRight: "clamp",
        }),
        translate: interpolate(frame, [0, 16], ["0px 30px", "0px 0px"], {
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.22, 1, 0.36, 1),
        }),
      }}
    >
      <CanvasImage
        name="Mídia fornecida"
        src={staticFile(`videos/video-001/images/${asset}`)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: contain ? "contain" : "cover",
          scale: interpolate(frame, [0, 6 * fps], [1, 1.055], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      />
    </Interactive.Div>
  );
};

export const PageCounter = () => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        top: 1220,
        left: 90,
        display: "flex",
        alignItems: "center",
        gap: 24,
      }}
    >
      <div
        style={{
          fontSize: 136,
          fontWeight: 900,
          letterSpacing: -8,
          lineHeight: 1,
          color: "#47eaff",
        }}
      >
        {Math.round(
          interpolate(frame, [0, 12], [1, 16], { extrapolateRight: "clamp" }),
        )}
      </div>
      <div
        style={{
          fontSize: 40,
          fontWeight: 800,
          lineHeight: 1.15,
          color: "#fff",
        }}
      >
        PÁGINAS
        <br />
        <span style={{ color: "#bd9cff" }}>EXCLUSIVAS</span>
      </div>
    </div>
  );
};

export const ReportGraphic = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: 90, top: 620, width: 830 }}>
      <div
        style={{
          height: 6,
          background: "#272547",
          margin: "0 40px 28px",
          scale: `${interpolate(frame, [0, 25], [0, 1], { extrapolateRight: "clamp" })} 1`,
          transformOrigin: "left",
          borderRadius: 8,
        }}
      />
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        <div
          style={{
            width: 830,
            height: 180,
            display: "flex",
            alignItems: "center",
            gap: 30,
            padding: 30,
            boxSizing: "border-box",
            border: "2px solid #47eaff66",
            borderRadius: 22,
            background: "linear-gradient(135deg, #103a50, #10122a)",
            opacity: interpolate(frame, [0, 10], [0, 1], {
              extrapolateRight: "clamp",
            }),
          }}
        >
          <svg
            width="90"
            height="100"
            viewBox="0 0 90 100"
            fill="none"
            stroke="#47eaff"
            strokeWidth="5"
          >
            <rect x="30" y="8" width="30" height="50" rx="15" />
            <path d="M17 43v9a28 28 0 0 0 56 0v-9M45 80v14M28 94h34" />
          </svg>
          <div>
            <div
              style={{
                fontSize: 44,
                fontWeight: 900,
                color: "white",
                marginTop: 0,
              }}
            >
              ENTREVISTAS
            </div>
            <div style={{ fontSize: 42, color: "#c2d7e5", marginTop: 12 }}>
              Com os devs do jogo
            </div>
          </div>
        </div>
        <div
          style={{
            width: 830,
            height: 180,
            display: "flex",
            alignItems: "center",
            gap: 30,
            padding: 30,
            boxSizing: "border-box",
            border: "2px solid #ac7bff66",
            borderRadius: 22,
            background: "linear-gradient(135deg, #34234d, #10122a)",
            opacity: interpolate(frame, [18, 28], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <svg
            width="100"
            height="100"
            viewBox="0 0 100 100"
            fill="none"
            stroke="#bd9cff"
            strokeWidth="5"
          >
            <rect x="7" y="15" width="86" height="70" rx="10" />
            <circle cx="68" cy="36" r="8" />
            <path d="m10 72 25-27 28 33 14-16 16 16" />
          </svg>
          <div>
            <div
              style={{
                fontSize: 44,
                fontWeight: 900,
                color: "white",
                marginTop: 0,
              }}
            >
              IMAGENS
            </div>
            <div style={{ fontSize: 42, color: "#d7c8e5", marginTop: 12 }}>
              Conteúdo exclusivo
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ChoiceGraphic = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rows = [
    {
      label: "MAPA",
      tag: "01",
      at: 0.1,
      until: 0.9,
      detail: "O mundo de GTA VI",
    },
    {
      label: "GAMEPLAY",
      tag: "02",
      at: 1,
      until: 2.15,
      detail: "Como vai ser jogar?",
    },
    {
      label: "HISTÓRIA",
      tag: "03",
      at: 2.2,
      until: 6.4,
      detail: "Jason & Lucia",
    },
  ];
  return (
    <div
      style={{
        position: "absolute",
        left: 90,
        top: 570,
        width: 830,
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      {rows.map((row) => {
        const active = frame >= row.at * fps && frame < row.until * fps;
        return (
          <div
            key={row.tag}
            style={{
              display: "flex",
              gap: 25,
              alignItems: "center",
              padding: "20px 30px",
              borderRadius: 18,
              border: `2px solid ${active ? "#47eaff" : "#72659466"}`,
              background: active
                ? "linear-gradient(90deg, #18475c, #142036)"
                : "#0e1126ee",
              opacity: interpolate(
                frame,
                [row.at * fps - 6, row.at * fps + 2],
                [0.4, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
              ),
              translate: active ? "8px 0px" : "0px 0px",
            }}
          >
            <div
              style={{
                fontSize: 32,
                color: active ? "#47eaff" : "#b9a5df",
                fontWeight: 700,
              }}
            >
              {row.tag}
            </div>
            <div>
              <div
                style={{
                  fontSize: 48,
                  fontWeight: 900,
                  color: "#fff",
                  letterSpacing: -1,
                }}
              >
                {row.label}
              </div>
              <div style={{ fontSize: 26, color: "#c5c4dc", marginTop: 5 }}>
                {row.detail}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const Progress = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <div
      style={{
        position: "absolute",
        left: 90,
        top: 1670,
        width: 830,
        height: 5,
        background: "#ffffff20",
        borderRadius: 10,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(90deg, #47eaff, #a77aff)",
          transformOrigin: "left",
          scale: `${interpolate(frame, [0, durationInFrames - 1], [0, 1])} 1`,
          borderRadius: 10,
        }}
      />
    </div>
  );
};
