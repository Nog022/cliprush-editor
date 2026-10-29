import {
  Easing,
  Interactive,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { theme } from "../styles/theme";

export const AnimatedTitle = ({
  lines,
  accentLine = 1,
  top = 350,
  size = 104,
  hold = 90,
  stagger = 3,
}: {
  lines: string[];
  accentLine?: number;
  top?: number;
  size?: number;
  hold?: number;
  stagger?: number;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  let wordNumber = 0;
  return (
    <Interactive.Div
      name="Tipografia cinematográfica"
      style={{
        position: "absolute",
        top,
        left: 90,
        width: 830,
        fontFamily: theme.font,
        fontSize: size,
        lineHeight: 0.98,
        fontWeight: 900,
        letterSpacing: -4,
        textShadow: "0 5px 45px #080a1290",
        opacity: interpolate(frame, [hold - 10, hold], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      }}
    >
      {lines.map((line, lineIndex) => (
        <div
          key={line}
          style={{
            color: lineIndex === accentLine ? "#9defff" : "#ffffff",
            whiteSpace: "nowrap",
          }}
        >
          {line.split(" ").map((word, index) => {
            const delay = wordNumber++ * stagger;
            return (
              <span
                key={`${line}-${word}-${index}`}
                style={{
                  display: "inline-block",
                  marginRight:
                    index === line.split(" ").length - 1 ? 0 : size * 0.23,
                  opacity: interpolate(frame, [delay, delay + 6], [0, 1], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  }),
                  translate: `${0}px ${interpolate(frame, [delay, delay + 15], [48, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.18, 1, 0.32, 1) })}px`,
                  scale:
                    0.94 +
                    spring({
                      frame: frame - delay,
                      fps,
                      config: { damping: 17, stiffness: 150 },
                    }) *
                      0.06,
                }}
              >
                {word}
              </span>
            );
          })}
        </div>
      ))}
    </Interactive.Div>
  );
};

export const ChapterLabel = ({
  number,
  children,
}: {
  number: string;
  children: React.ReactNode;
}) => (
  <div
    style={{
      position: "absolute",
      left: 94,
      top: 268,
      display: "flex",
      alignItems: "center",
      gap: 19,
      color: "#c5eaff",
      fontFamily: theme.font,
      fontSize: 29,
      fontWeight: 700,
      letterSpacing: 4,
    }}
  >
    <span style={{ color: "#00c8ff" }}>{number}</span>
    <span style={{ height: 1, width: 34, background: "#8d8dcc" }} />
    {children}
  </div>
);
