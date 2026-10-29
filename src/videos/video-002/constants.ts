export const VIDEO = {
  width: 1080,
  height: 1920,
  fps: 30,
  frames: 900,
} as const;

// Global frame coordinates. Used by the continuous world and future sound cues.
export const CUES = {
  firstPixel: 0,
  assembly: 24,
  hook: 32,
  running: 90,
  jump: 154,
  pickup: 195,
  portal: 270,
  crossing: 312,
  fragments: 324,
  depth: 354,
  lighting: 402,
  reveal: 450,
  comparison: 480,
  comparisonHold: 650,
  future: 720,
  question: 787,
  collapse: 870,
  loop: 899,
} as const;
