import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Video } from "@remotion/media";
import { asset, portrait } from "./timing";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const Picture: React.FC<{
  person: "Jason" | "Brian";
  n: number;
  position?: string;
  reveal?: boolean;
}> = ({ person, n, position = "50% 50%", reveal = false }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Img
      src={staticFile(portrait(person, n))}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        objectPosition: position,
        scale: interpolate(f, [0, 3 * fps], [1.04, 1.13], clamp),
        filter: reveal
          ? `brightness(${interpolate(f, [0, 0.7 * fps], [0.22, 1], clamp)})`
          : undefined,
      }}
    />
  );
};
export const Footage: React.FC<{ name: string; position?: string }> = ({
  name,
  position = "50% 50%",
}) => (
  <Video
    muted
    objectFit="cover"
    src={staticFile(asset(`footage/${name}.mp4`))}
    style={{ width: "100%", height: "100%", objectPosition: position }}
  />
);
export const Shade = () => (
  <AbsoluteFill
    style={{
      background:
        "linear-gradient(180deg,rgba(3,8,13,.55),transparent 32%,transparent 48%,rgba(3,8,13,.94) 92%),radial-gradient(ellipse,transparent 40%,rgba(0,0,0,.5))",
    }}
  />
);
export const Title: React.FC<{
  eyebrow?: string;
  children: React.ReactNode;
  color?: string;
  top?: number;
}> = ({ eyebrow, children, color = "#f4df56", top = 1030 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div
      data-safe="title"
      style={{
        position: "absolute",
        left: 82,
        right: 145,
        top,
        translate: `0 ${interpolate(f, [0, 0.3 * fps], [32, 0], clamp)}px`,
        textShadow: "0 4px 25px #000",
      }}
    >
      {eyebrow && (
        <div
          style={{
            fontSize: 27,
            letterSpacing: 5,
            color: "#f1f0e9",
            marginBottom: 22,
            fontFamily: "Arial",
          }}
        >
          {eyebrow}
        </div>
      )}
      <div
        style={{
          fontSize: 100,
          lineHeight: 1.02,
          fontWeight: 900,
          color,
          letterSpacing: -3,
        }}
      >
        {children}
      </div>
    </div>
  );
};
export const Connector = ({ vertical = false }: { vertical?: boolean }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <svg
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      viewBox="0 0 1080 1920"
    >
      <path
        d={vertical ? "M 540 660 L 540 1080" : "M 270 900 L 810 900"}
        stroke="#ff494e"
        strokeWidth="7"
        fill="none"
        pathLength="1"
        strokeDasharray="1"
        strokeDashoffset={1 - interpolate(f, [0, 0.6 * fps], [0, 1], clamp)}
      />
      <circle
        cx={vertical ? 540 : 270}
        cy={vertical ? 660 : 900}
        r="15"
        fill="#ff494e"
      />
      <circle
        cx={vertical ? 540 : 810}
        cy={vertical ? 1080 : 900}
        r="15"
        fill="#ff494e"
      />
    </svg>
  );
};
export const Contract = ({ stamp = false }: { stamp?: boolean }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f, fps, config: { damping: 16 } });
  return (
    <div
      style={{
        position: "absolute",
        top: 660,
        left: 105,
        width: 760,
        padding: 52,
        background: "#e7e0ca",
        color: "#152025",
        rotate: stamp ? "-4deg" : "3deg",
        translate: `0 ${(1 - s) * 170}px`,
        boxShadow: "0 30px 90px #0009",
      }}
    >
      <div style={{ fontSize: 25, letterSpacing: 5 }}>DOSSIÊ / MORADIA</div>
      <div
        style={{
          fontSize: 37,
          marginTop: 32,
          borderBottom: "3px solid #333",
          paddingBottom: 24,
        }}
      >
        JASON ↔ BRIAN HEDER
      </div>
      <div style={{ fontSize: 108, fontWeight: 900, margin: "30px 0" }}>
        ALUGUEL: $0
      </div>
      <div
        style={{
          height: 7,
          background: "#9a978c",
          width: "82%",
          marginBottom: 18,
        }}
      />
      <div style={{ height: 7, background: "#9a978c", width: "65%" }} />
      <div style={{ fontSize: 23, marginTop: 38 }}>
        REPRESENTAÇÃO VISUAL • NÃO É DOCUMENTO DO JOGO
      </div>
      {stamp && (
        <div
          style={{
            position: "absolute",
            top: 200,
            left: 20,
            right: 20,
            border: "12px solid #b52330",
            fontSize: 83,
            fontWeight: 900,
            color: "#b52330",
            rotate: "-13deg",
            scale: interpolate(f, [0, 8], [1.6, 1], clamp),
            textAlign: "center",
            background: "#e7e0cae8",
          }}
        >
          TEM UM PREÇO
        </div>
      )}
    </div>
  );
};
export const Radio = ({ silhouette = false }: { silhouette?: boolean }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const points = Array.from(
    { length: 100 },
    (_, i) =>
      `${80 + i * 9},${880 + Math.sin(i * 0.45 - f * 0.22) * Math.sin(i * 0.17 + f * 0.04) * 85}`,
  ).join(" ");
  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(ellipse at 65% 40%,#154d3d,#020a09 70%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(#64ffc311 1px,transparent 1px),linear-gradient(90deg,#64ffc311 1px,transparent 1px)",
          backgroundSize: "70px 70px",
        }}
      />
      <svg
        viewBox="0 0 1080 1920"
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          opacity: silhouette ? 0.35 : 1,
        }}
      >
        <polyline
          points={points}
          stroke="#7effc6"
          strokeWidth="5"
          fill="none"
        />
        {Array.from({ length: 32 }, (_, i) => (
          <rect
            key={i}
            x={90 + i * 28}
            y={1120}
            width={12}
            height={30 + Math.abs(Math.sin(i + f * 0.07)) * 160}
            fill="#7effc6"
            opacity=".35"
          />
        ))}
      </svg>
      <div
        style={{
          position: "absolute",
          top: 420,
          left: 90,
          fontFamily: "monospace",
          fontSize: 34,
          color: "#7effc6",
        }}
      >
        RX / SINAL EM OBSERVAÇÃO
        <br />
        <span style={{ fontSize: 22 }}>
          INTERFACE FICTÍCIA • REPRESENTAÇÃO VISUAL
        </span>
      </div>
      {silhouette && (
        <svg
          viewBox="0 0 1080 1920"
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            scale: interpolate(f, [0, 3 * fps], [1, 1.07], clamp),
          }}
        >
          <ellipse cx="410" cy="690" rx="105" ry="135" fill="#010404" />
          <path
            d="M 310 790 Q 180 850 200 1230 L 590 1230 Q 620 870 495 795 Z"
            fill="#010404"
          />
          <path
            d="M 490 930 L 660 1060 L 790 1050"
            fill="none"
            stroke="#010404"
            strokeWidth="85"
          />
          <rect x="120" y="1230" width="820" height="40" fill="#010404" />
          <rect
            x="650"
            y="1080"
            width="250"
            height="150"
            rx="12"
            fill="#101c19"
            stroke="#579c7f"
            strokeWidth="3"
          />
          <path d="M 825 1080 L 880 815" stroke="#579c7f" strokeWidth="5" />
          <rect x="680" y="1110" width="130" height="35" fill="#619c7e" />
          <circle
            cx="850"
            cy="1170"
            r="24"
            stroke="#579c7f"
            fill="#020705"
            strokeWidth="5"
          />
        </svg>
      )}
      <div
        style={{
          position: "absolute",
          top: interpolate(f, [0, 3 * fps], [300, 1500], clamp),
          height: 3,
          width: "100%",
          background: "#7effc3",
          opacity: 0.22,
        }}
      />
    </AbsoluteFill>
  );
};
