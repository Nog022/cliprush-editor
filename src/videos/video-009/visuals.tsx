import type { CSSProperties, ReactNode } from "react";
import type { Caption } from "@remotion/captions";
import { Video } from "@remotion/media";
import { AbsoluteFill, CanvasImage, getRemotionEnvironment, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import words from "./captions.json";

export const asset = (path: string) => staticFile(`videos/video-009/${path}`);
export const palette = { cyan: "#6af9e1", pink: "#fa8ac5", yellow: "#ffed67", ink: "#090a14", red: "#ff9b72" };
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const films = {
  v: "videos-complementares/Grand Theft Auto V - Coming to New Generation Consoles [foUaOCzfIRU].mp4",
  r: "videos-complementares/Red Dead Redemption 2 Trailer [gmA6MrX81z4].mp4",
  vi: "videos-complementares/Trailer 2 GTA VI.mp4",
};

// Insets preserve wide landscapes; the frame clock only animates the camera wrapper.
export const Camera = ({ children, seconds = 4, style }: { children: ReactNode; seconds?: number; style?: CSSProperties }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return <AbsoluteFill style={{ overflow: "hidden", ...style }}><AbsoluteFill style={{ scale: interpolate(frame, [0, seconds * fps], [1.02, 1.11], clamp), translate: `${interpolate(frame, [0, seconds * fps], [-9, 9], clamp)}px 0` }}>{children}</AbsoluteFill></AbsoluteFill>;
};

export const Footage = ({ game, start, speed = 1, top = 320, height = 850, focus = "50% 50%", label }: {
  game: keyof typeof films; start: number; speed?: number; top?: number; height?: number; focus?: string; label?: string;
}) => {
  const { fps } = useVideoConfig();
  const preview = !getRemotionEnvironment().isRendering;
  const source = preview ? `preview-v001/${game}-${Math.round(start * 1000)}.mp4` : films[game];
  return <div style={{ position: "absolute", top, width: 1080, height, overflow: "hidden" }}>
    <Camera><Video name={label ?? game} src={asset(source)} trimBefore={preview ? 0 : Math.round(start * fps)} playbackRate={speed} muted objectFit="cover" style={{ width: "100%", height: "100%", objectPosition: focus }} /></Camera>
    <AbsoluteFill style={{ background: "linear-gradient(180deg,#090a1433,transparent 55%,#090a14aa)" }} />
    {label && <div style={{ position: "absolute", left: 84, top: 36, fontSize: 36, fontWeight: 900, letterSpacing: 2, textShadow: "0 3px 10px black" }}>{label}</div>}
  </div>;
};

export const Photo = ({ file, top = 320, height = 850, focus = "50% 50%" }: { file: string; top?: number; height?: number; focus?: string }) => <div style={{ position: "absolute", top, width: 1080, height, overflow: "hidden" }}>
  <Camera seconds={2.5}><CanvasImage src={asset(`imagens/${file}`)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: focus }} /></Camera>
  <AbsoluteFill style={{ background: "linear-gradient(180deg,#090a1422,transparent 60%,#090a14aa)" }} />
</div>;

export const Title = ({ children, kicker, top = 230, color = "white", size = 92 }: { children: ReactNode; kicker?: string; top?: number; color?: string; size?: number }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  return <div data-safe="title" style={{ position: "absolute", left: 84, right: 140, top, color, translate: `0 ${interpolate(f, [0, fps * .25], [30, 0], clamp)}px`, textShadow: "0 4px 18px #0008" }}>
    {kicker && <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: 4, color: palette.cyan, marginBottom: 18 }}>{kicker}</div>}
    <div style={{ fontFamily: "Impact, Arial Black, sans-serif", fontSize: size, lineHeight: 1.02 }}>{children}</div>
  </div>;
};

export const Clock = ({ period = 3, color = palette.cyan, size = 360, label = "24h no jogo", startHour = 6 }: { period?: number; color?: string; size?: number; label?: string; startHour?: number }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const turns = f / (fps * period);
  const hour = (startHour + turns * 24) % 24;
  return <div style={{ width: size, height: size, position: "relative" }}>
    <svg width={size} height={size} viewBox="0 0 400 400">
      <circle cx="200" cy="200" r="185" fill="#090a14dd" stroke={`${color}44`} strokeWidth="2" />
      <circle cx="200" cy="200" r="178" fill="none" stroke={color} strokeWidth="7" strokeDasharray="1119" strokeDashoffset={1119 * (1 - (turns % 1))} transform="rotate(-90 200 200)" />
      {Array.from({ length: 60 }, (_, i) => <line key={i} x1="200" y1={i % 5 === 0 ? 34 : 43} x2="200" y2="52" stroke={i % 5 === 0 ? color : "#ffffff55"} strokeWidth={i % 5 === 0 ? 4 : 2} transform={`rotate(${i * 6} 200 200)`} />)}
      <g transform={`rotate(${hour * 30} 200 200)`}><line x1="200" y1="200" x2="200" y2="115" stroke="white" strokeWidth="11" strokeLinecap="round" /></g>
      <g transform={`rotate(${hour * 360} 200 200)`}><line x1="200" y1="212" x2="200" y2="75" stroke={color} strokeWidth="6" strokeLinecap="round" /></g>
      <circle cx="200" cy="200" r="10" fill={color} />
      <text x="200" y="275" textAnchor="middle" fill="white" fontFamily="monospace" fontSize="36">{String(Math.floor(hour)).padStart(2, "0")}:{String(Math.floor(hour % 1 * 60)).padStart(2, "0")}</text>
      <text x="200" y="313" textAnchor="middle" fill={color} fontFamily="Arial" fontSize="21">{label}</text>
    </svg>
  </div>;
};

export const NumberPanel = ({ value, unit, note, color = palette.cyan, clockPeriod = 3 }: { value: string; unit: string; note: string; color?: string; clockPeriod?: number }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  return <div style={{ position: "absolute", top: 1090, left: 84, right: 140, display: "flex", alignItems: "center", gap: 24 }}>
    <Clock size={320} color={color} period={clockPeriod} />
    <div style={{ flex: 1 }}>
      <div style={{ fontFamily: "Impact, sans-serif", fontSize: 155, color, lineHeight: 1, scale: .94 + .06 * spring({ frame: f, fps, config: { damping: 18 } }), transformOrigin: "left center" }}>{value}</div>
      <div style={{ fontSize: 43, fontWeight: 900 }}>{unit}</div>
      <div style={{ fontSize: 28, marginTop: 15, color: "#d3cedd", lineHeight: 1.2 }}>{note}</div>
    </div>
  </div>;
};

export const Cycle = ({ faster = false }: { faster?: boolean }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const phase = (f / (fps * (faster ? 1.3 : 4))) % 1;
  return <div style={{ position: "absolute", left: 84, right: 140, top: 990 }}>
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 30, letterSpacing: 4, marginBottom: 18 }}><span>DIA</span><span>NOITE</span><span>DIA</span></div>
    <div style={{ height: 12, background: "linear-gradient(90deg,#ffcf6c,#9b87ff,#18234e,#ffcf6c)", borderRadius: 12 }}><div style={{ width: 30, height: 30, borderRadius: "50%", background: "white", translate: `${phase * 826}px -9px`, boxShadow: "0 0 30px white" }} /></div>
  </div>;
};

const groups: Caption[][] = [];
for (const word of words) {
  const prev = groups[groups.length - 1];
  if (!prev || prev.length >= 4 || (prev.map(w => w.text).join("") + word.text).length > 27 || word.startMs - prev[prev.length - 1].endMs > 300 || /[.!?]$/.test(prev[prev.length - 1].text)) groups.push([word]);
  else prev.push(word);
}
export const Captions = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const ms = f / fps * 1000;
  const group = groups.find((g, i) => ms >= g[0].startMs && ms < Math.min(g[g.length - 1].endMs + 90, groups[i + 1]?.[0].startMs ?? Infinity));
  if (!group) return null;
  return <div data-safe="captions" style={{ position: "absolute", top: 1555, left: 84, width: 856, textAlign: "center", fontSize: 62, lineHeight: 1.18, fontWeight: 900, textTransform: "uppercase", textShadow: "0 4px 3px #000, 2px 0 #000, -2px 0 #000" }}>
    {group.map((w, i) => <span key={i} style={{ color: ms >= w.startMs && ms < w.endMs ? palette.yellow : "white" }}>{w.text.trim()} </span>)}
  </div>;
};

export const Brand = () => <div style={{ position: "absolute", left: 84, top: 125, fontSize: 30, fontWeight: 900, letterSpacing: 1 }}><span>CLIP<span style={{ color: palette.cyan }}>RUSH</span><span style={{ color: palette.pink }}> /</span></span></div>;

export const Wipe = ({ color = palette.cyan }: { color?: string }) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ pointerEvents: "none", background: `linear-gradient(110deg,transparent 35%,${color}55 50%,transparent 65%)`, translate: `${interpolate(f, [0, 10], [-120, 120], clamp)}% 0`, opacity: f < 11 ? 1 : 0 }} />;
};
