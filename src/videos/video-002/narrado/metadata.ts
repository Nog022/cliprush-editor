import { staticFile, type CalculateMetadataFunction } from "remotion";
import { NARRATION_PATH } from "./timing";

// Decode the actual local MP3 instead of trusting a bitrate-based estimate.
// Native Web Audio avoids adding a metadata dependency to this project.
export const narratedMetadata: CalculateMetadataFunction<
  Record<string, unknown>
> = async ({ abortSignal }) => {
  const response = await fetch(staticFile(NARRATION_PATH), {
    signal: abortSignal,
  });
  if (!response.ok)
    throw new Error(
      `Não foi possível abrir ${NARRATION_PATH}: ${response.status}`,
    );
  const encoded = await response.arrayBuffer();
  const context = new AudioContext();
  try {
    const decoded = await context.decodeAudioData(encoded);
    if (abortSignal.aborted) throw new Error("Leitura da narração cancelada.");
    if (!Number.isFinite(decoded.duration) || decoded.duration <= 0)
      throw new Error("A narração não possui duração válida.");
    return {
      durationInFrames: Math.ceil(decoded.duration * 30),
      defaultCodec: "h264",
      defaultPixelFormat: "yuv420p",
      defaultOutName: "cliprush-ai-002-narrado",
    };
  } finally {
    await context.close();
  }
};
