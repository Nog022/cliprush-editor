import selection from "./trailer-selection.json";

export const AUDIO_SECONDS = 29.648938;
export const FPS = 30;
export const DURATION = Math.ceil(AUDIO_SECONDS * FPS);
export const REVEAL_FRAME = 603; // 20.10 s: first spoken "Rocco".
export const asset = (file: string) => `videos/video-008/${file}`;

// Never substitute the separate screenshot for a purported trailer freeze.
// Mark verified only after identifying a real dog frame in the supplied footage.
export const trailerSelection: {
  verified: boolean;
  startSeconds: number | null;
  freezeSourceFrame: number | null;
  still: string | null;
} = selection;
