import type { CSSProperties, ReactNode } from "react";
import type { Caption } from "@remotion/captions";
import {
  AbsoluteFill,
  CanvasImage,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import words from "./captions.json";
import { asset } from "./timing";

export const colors = {
  cyan: "#6af9e1",
  yellow: "#ffed67",
  purple: "#b388ff",
  ink: "#090a14",
};
export const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;
export const DOG = "images/jason-dog-lossless.webp";
export const CHOP = "imagens/chopp de lado.webp";
export const FRANKLIN = "imagens/frankilin e chop.webp";

export const Atmosphere = ({ source = DOG }: { source?: string }) => (
  <AbsoluteFill style={{ background: colors.ink }}>
    <CanvasImage
      src={staticFile(asset(source))}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        filter: "blur(36px) brightness(.29)",
        scale: 1.12,
      }}
    />
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(180deg,#0b0b1499,transparent 38%,#090a14 91%)",
      }}
    />
  </AbsoluteFill>
);

export const Headline = ({
  children,
  top = 1170,
  size = 110,
  color = "white",
  eyebrow,
}: {
  children: ReactNode;
  top?: number;
  size?: number;
  color?: string;
  eyebrow?: string;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div
      data-safe="title"
      style={{
        position: "absolute",
        left: 84,
        right: 150,
        top,
        color,
        translate: `0 ${interpolate(frame, [0, 0.28 * fps], [20, 0], clamp)}px`,
        textShadow: "0 5px 25px #0009",
      }}
    >
      {eyebrow && (
        <div
          style={{
            fontFamily: "Arial, sans-serif",
            fontSize: 30,
            fontWeight: 700,
            letterSpacing: 4,
            marginBottom: 24,
            color: colors.cyan,
          }}
        >
          {eyebrow}
        </div>
      )}
      <div
        style={{
          fontFamily: "Impact, Arial Black, sans-serif",
          fontSize: size,
          lineHeight: 1.02,
          letterSpacing: 1,
        }}
      >
        {children}
      </div>
    </div>
  );
};

// Camera coordinates are in the original 3840x2160 image, normalized to [0,1].
// The mask travels with the source image, never with screen coordinates.
export const DogCamera = ({
  zoom = [1, 1.2],
  focus = [0.5, 0.5],
  endFocus = focus,
  top = 300,
  height = 850,
  seconds = 2.5,
  conceal = true,
  border = false,
}: {
  zoom?: [number, number];
  focus?: [number, number];
  endFocus?: [number, number];
  top?: number;
  height?: number;
  seconds?: number;
  conceal?: boolean;
  border?: boolean;
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const z = interpolate(f, [0, seconds * fps], zoom, clamp);
  const x = interpolate(f, [0, seconds * fps], [focus[0], endFocus[0]], clamp);
  const y = interpolate(f, [0, seconds * fps], [focus[1], endFocus[1]], clamp);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top,
        width: 1080,
        height,
        overflow: "hidden",
        borderBottom: border ? `3px solid ${colors.cyan}` : undefined,
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 1080 * z,
          height: 607.5 * z,
          left: 540 - x * 1080 * z,
          top: height / 2 - y * 607.5 * z,
        }}
      >
        <CanvasImage
          src={staticFile(asset(DOG))}
          style={{ width: "100%", height: "100%" }}
        />
        {conceal && (
          <div
            data-conceal="name"
            style={{
              position: "absolute",
              left: "71%",
              top: "69.6%",
              width: "5.5%",
              height: "3.3%",
              background: "#17121a",
              border: "1px solid #f7c87f55",
              rotate: "-11deg",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffed67",
              fontSize: 14 * z,
              fontWeight: 900,
            }}
          >
            ?
          </div>
        )}
      </div>
    </div>
  );
};

export const Photo = ({
  source,
  style,
  position = "50% 50%",
  zoom = [1, 1.08],
  seconds = 3,
  fit = "cover",
}: {
  source: string;
  style: CSSProperties;
  position?: string;
  zoom?: [number, number];
  seconds?: number;
  fit?: "cover" | "contain";
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ position: "absolute", overflow: "hidden", ...style }}>
      <CanvasImage
        src={staticFile(asset(source))}
        style={{
          width: "100%",
          height: "100%",
          objectFit: fit,
          objectPosition: position,
          scale: interpolate(f, [0, seconds * fps], zoom, clamp),
        }}
      />
    </div>
  );
};

export const Annotation = ({
  x,
  y,
  rx = 150,
  ry = 105,
  color = colors.yellow,
}: {
  x: number;
  y: number;
  rx?: number;
  ry?: number;
  color?: string;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <svg
      viewBox="0 0 1080 1920"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    >
      <ellipse
        cx={x}
        cy={y}
        rx={rx}
        ry={ry}
        fill="none"
        stroke={color}
        strokeWidth={7}
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={
          1 - interpolate(frame, [0, 0.45 * fps], [0, 1], clamp)
        }
        style={{ filter: "drop-shadow(0 3px 5px #000)" }}
      />
      <path
        d={`M ${x - rx - 50} ${y - ry - 70} L ${x - rx + 5} ${y - ry + 10}`}
        stroke={color}
        strokeWidth={5}
        fill="none"
        opacity={interpolate(frame, [0, 0.4 * fps], [0, 1], clamp)}
      />
    </svg>
  );
};

export const Flash = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        background: colors.cyan,
        opacity: interpolate(f, [0, 2, 7], [0.16, 0.05, 0], clamp),
        pointerEvents: "none",
      }}
    />
  );
};

const groups: Caption[][] = [];
for (const word of words) {
  const last = groups[groups.length - 1];
  if (
    !last ||
    last.length >= 4 ||
    (last.map((w) => w.text).join("") + word.text).length > 27 ||
    word.startMs - last[last.length - 1].endMs > 250 ||
    /[.!?]$/.test(last[last.length - 1].text) ||
    word.text.trim() === "ROCCO!"
  )
    groups.push([word]);
  else last.push(word);
}
export const NarrationCaptions = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ms = (f / fps) * 1000;
  const group = groups.find(
    (g, i) =>
      ms >= g[0].startMs &&
      ms <
        Math.min(
          g[g.length - 1].endMs + 65,
          groups[i + 1]?.[0].startMs ?? Infinity,
        ),
  );
  if (!group) return null;
  const age = f - (group[0].startMs / 1000) * fps;
  return (
    <div
      data-safe="caption"
      style={{
        position: "absolute",
        left: 84,
        right: 150,
        top: 1505,
        textAlign: "center",
        fontSize: 60,
        lineHeight: 1.18,
        fontWeight: 900,
        textTransform: "uppercase",
        fontFamily: "Arial, sans-serif",
        textShadow: "0 4px 3px #000, 3px 0 #000, -3px 0 #000",
        translate: `0 ${(1 - spring({ frame: age, fps, config: { damping: 200 } })) * 12}px`,
      }}
    >
      {group.map((word, i) => (
        <span
          key={i}
          style={{
            visibility: ms >= word.startMs ? "visible" : "hidden",
            color: ms < word.endMs ? colors.yellow : "white",
          }}
        >
          {word.text.trim()}{" "}
        </span>
      ))}
    </div>
  );
};

export const Branding = () => (
  <div
    style={{
      position: "absolute",
      left: 84,
      right: 150,
      top: 125,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      fontFamily: "Arial, sans-serif",
    }}
  >
    <div style={{ fontWeight: 900, fontSize: 31, letterSpacing: 1 }}>
      CLIP<span style={{ color: colors.cyan }}>RUSH</span>
      <span style={{ color: colors.purple }}> /</span>
    </div>
    <div style={{ fontSize: 23, letterSpacing: 4, color: "#d3cedd" }}>
      ARQUIVO 008
    </div>
  </div>
);
