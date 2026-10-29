import { useMemo } from "react";
import { createTikTokStyleCaptions, type Caption } from "@remotion/captions";
import {
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// Custom karaoke treatment requested for ClipRush, using the official Caption
// format and page builder. The source array stays inline on each editable node.
const NeonCaptionsInner = ({ captions }: { captions: Caption[] }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = (frame / fps) * 1000;
  const { pages } = useMemo(
    () =>
      createTikTokStyleCaptions({
        captions,
        combineTokensWithinMilliseconds: 650,
        breakOnSilenceAfterMilliseconds: 300,
      }),
    [captions],
  );
  const page = pages.find((candidate) => {
    const lastWord = candidate.tokens[candidate.tokens.length - 1];
    return (
      time >= candidate.startMs &&
      time <
        Math.min(candidate.startMs + candidate.durationMs, lastWord.toMs + 120)
    );
  });
  if (!page) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: 1460,
        left: 90,
        width: 830,
        textAlign: "center",
        fontFamily: "Arial, sans-serif",
        fontSize: 60,
        fontWeight: 900,
        lineHeight: 1.2,
        letterSpacing: -1.5,
        textTransform: "uppercase",
        textShadow: "0 3px 10px #000, 0 0 22px #000",
        opacity: interpolate(time - page.startMs, [0, 70], [0.4, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      }}
    >
      <span
        style={{
          background: "rgba(5, 5, 18, 0.9)",
          borderRadius: 14,
          boxDecorationBreak: "clone",
          WebkitBoxDecorationBreak: "clone",
          padding: "10px 18px",
        }}
      >
        {page.tokens.map((token) => {
          const active = time >= token.fromMs && time < token.toMs;
          const keyword =
            /GTA|6|16|Edge|Rockstar|Escócia|exclusiv|gratuit|GamesRadar|mapa|gameplay|história|Jason|Lucia/i.test(
              token.text,
            );
          return (
            <span
              key={`${token.fromMs}-${token.text}`}
              style={{ whiteSpace: "pre-wrap" }}
            >
              {token.text.startsWith(" ") ? " " : ""}
              <span
                style={{
                  display: "inline-block",
                  color: active ? "#071019" : keyword ? "#47eaff" : "#ffffff",
                  background: active ? "#47eaff" : "transparent",
                  borderRadius: 7,
                  padding: "0 3px",
                  scale: active
                    ? interpolate(
                        time - token.fromMs,
                        [0, 80, 160],
                        [1.08, 1.03, 1],
                        {
                          extrapolateLeft: "clamp",
                          extrapolateRight: "clamp",
                        },
                      )
                    : 1,
                  textShadow: active ? "none" : undefined,
                }}
              >
                {token.text.trim()}
              </span>
            </span>
          );
        })}
      </span>
    </div>
  );
};

export const NeonCaptions = Interactive.create({
  Component: NeonCaptionsInner,
  layout: "absolute-fill",
  schema: { ...Interactive.captionsSchema },
});
