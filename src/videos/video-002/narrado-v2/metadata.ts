import type { CalculateMetadataFunction } from "remotion";
import { narratedMetadata } from "../narrado/metadata";

export const narratedV2Metadata: CalculateMetadataFunction<
  Record<string, unknown>
> = async (options) => ({
  ...(await narratedMetadata(options)),
  defaultOutName: "cliprush-ai-002-narrado-v2",
});
