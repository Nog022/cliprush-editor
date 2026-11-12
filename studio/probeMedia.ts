import type { Asset } from "../shared/model";

/** Native Chromium metadata is the offline fallback when FFprobe is absent. */
export function probeMedia(
  projectId: string,
  asset: Asset,
): Promise<{ duration?: number; width?: number; height?: number } | null> {
  if (asset.kind === "caption") return Promise.resolve(null);
  const source = `cliprush://app/media/${projectId}/${asset.id}`;
  return new Promise((resolve) => {
    const element =
      asset.kind === "image"
        ? new Image()
        : document.createElement(asset.kind === "audio" ? "audio" : "video");
    const timer = window.setTimeout(() => done(null), 15000);
    const done = (
      metadata: { duration?: number; width?: number; height?: number } | null,
    ) => {
      window.clearTimeout(timer);
      element.onload = null;
      element.onerror = null;
      if (element instanceof HTMLMediaElement) {
        element.onloadedmetadata = null;
        element.removeAttribute("src");
        element.load();
      } else element.removeAttribute("src");
      resolve(metadata);
    };
    element.onerror = () => done(null);
    if (element instanceof HTMLImageElement)
      element.onload = () =>
        done({ width: element.naturalWidth, height: element.naturalHeight });
    else {
      element.preload = "metadata";
      element.onloadedmetadata = () => {
        const duration = element.duration;
        if (!Number.isFinite(duration) || duration <= 0) return done(null);
        done({
          duration,
          ...(element instanceof HTMLVideoElement
            ? { width: element.videoWidth, height: element.videoHeight }
            : {}),
        });
      };
    }
    element.src = source;
  });
}
