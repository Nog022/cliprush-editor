import { interpolate } from "remotion";
import { CUES } from "../constants";

export const NARRATION_PATH = "videos/video-002/narracao.mp3";
export const REFERENCE_AUDIO_SECONDS = 24.346063;

// audio-cues.json was inspected: its frames belong to the silent 30 s edit.
// Keep those source events; align their new positions to the actual local speech.
export const NARRATED_CUES = [
  { event: "first-pixel", seconds: 0, sourceFrame: CUES.firstPixel },
  { event: "assembly", seconds: 0.65, sourceFrame: CUES.assembly },
  { event: "hook", seconds: 1.2, sourceFrame: CUES.hook },
  { event: "jump", seconds: 5.1, sourceFrame: CUES.jump },
  { event: "pickup", seconds: 6.5, sourceFrame: CUES.pickup },
  { event: "portal", seconds: 8.2, sourceFrame: CUES.portal },
  { event: "crossing", seconds: 9.56, sourceFrame: CUES.crossing },
  { event: "fragmentation", seconds: 9.9, sourceFrame: CUES.fragments },
  { event: "depth", seconds: 10.76, sourceFrame: CUES.depth },
  { event: "lighting", seconds: 11.76, sourceFrame: CUES.lighting },
  { event: "reveal", seconds: 12.48, sourceFrame: CUES.reveal },
  { event: "comparison", seconds: 12.6, sourceFrame: CUES.comparison },
  { event: "future", seconds: 17.6, sourceFrame: CUES.future },
  { event: "question", seconds: 21.7, sourceFrame: CUES.question },
  { event: "collapse", seconds: 23.78, sourceFrame: CUES.collapse },
  { event: "loop", seconds: REFERENCE_AUDIO_SECONDS, sourceFrame: CUES.loop },
] as const;

export const narrationFrame = (seconds: number, durationInFrames: number) =>
  Math.min(
    durationInFrames - 1,
    Math.round((seconds / REFERENCE_AUDIO_SECONDS) * (durationInFrames - 1)),
  );

export const originalFrameForNarration = (
  frame: number,
  durationInFrames: number,
) =>
  Math.round(
    interpolate(
      frame,
      NARRATED_CUES.map((cue) => narrationFrame(cue.seconds, durationInFrames)),
      NARRATED_CUES.map((cue) => cue.sourceFrame),
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    ),
  );
