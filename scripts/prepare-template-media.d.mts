export function prepareTemplateMedia(options: {
  source: string; startSeconds: number; durationSeconds: number; directory: string; signal?: AbortSignal; cacheKey?: string;
}): Promise<{video: string; audio: string}>;
