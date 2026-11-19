export type Region = {x: number; y: number; w: number; h: number};
export type SourceSize = {width: number; height: number};

export function assertRegion(region: Region, source: SourceSize) {
  if (![source.width, source.height, region.x, region.y, region.w, region.h].every(Number.isFinite) ||
    source.width <= 0 || source.height <= 0 || region.x < 0 || region.y < 0 ||
    region.w <= 0 || region.h <= 0 || region.x + region.w > source.width || region.y + region.h > source.height) {
    throw new Error('Crop must be a positive rectangle inside the source dimensions.');
  }
}

/** Uniform cover, centered inside the selected source rectangle. No stretching. */
export function coverRegion(region: Region, width: number, height: number, focus?: {x: number; y: number}, zoom = 1) {
  if (![width, height, ...(focus ? [focus.x, focus.y] : [])].every(Number.isFinite) || width <= 0 || height <= 0) {
    throw new Error('Invalid panel size or focus.');
  }
  if (!Number.isFinite(zoom) || zoom < 1 || zoom > 3) throw new Error('Zoom must be between 1 and 3.');
  const scale = Math.max(width / region.w, height / region.h) * zoom;
  const w = width / scale, h = height / scale;
  const visible = {x: Math.max(region.x, Math.min(region.x + region.w - w, (focus?.x ?? region.x + region.w / 2) - w / 2)),
    y: Math.max(region.y, Math.min(region.y + region.h - h, (focus?.y ?? region.y + region.h / 2) - h / 2)), w, h};
  return {scale, left: -visible.x * scale, top: -visible.y * scale, visible};
}

export function intersects(a: Region, b: Region) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
