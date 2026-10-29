export type Vec3 = { x: number; y: number; z: number };
export type Point = { x: number; y: number; depth?: number };
export type Project = (point: Vec3) => Point;

export const clamp = (value: number, low = 0, high = 1) =>
  Math.max(low, Math.min(high, value));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (a: number, b: number, value: number) => {
  const t = clamp((value - a) / (b - a));
  return t * t * (3 - 2 * t);
};
export const blendColor = (a: string, b: string, t: number) => {
  const rgb = [1, 3, 5].map((index) =>
    Math.round(
      mix(
        parseInt(a.slice(index, index + 2), 16),
        parseInt(b.slice(index, index + 2), 16),
        clamp(t),
      ),
    ),
  );
  return `rgb(${rgb.join(",")})`;
};
export const polygon = (
  ctx: CanvasRenderingContext2D,
  points: Point[],
  fill: string,
  stroke?: string,
) => {
  if (
    !points.length ||
    points.some(
      (point) => !Number.isFinite(point.x) || !Number.isFinite(point.y),
    )
  )
    return;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (const point of points.slice(1)) ctx.lineTo(point.x, point.y);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }
};
export const pathX = (z: number) => 11 * Math.cos(z * 0.065);
export const terrainHeight = (x: number, z: number) =>
  0.35 * Math.sin(x * 0.34 + z * 0.12) + 0.25 * Math.cos(z * 0.3);

const subtract = (a: Vec3, b: Vec3): Vec3 => ({
  x: a.x - b.x,
  y: a.y - b.y,
  z: a.z - b.z,
});
const dot = (a: Vec3, b: Vec3) => a.x * b.x + a.y * b.y + a.z * b.z;
const cross = (a: Vec3, b: Vec3): Vec3 => ({
  x: a.y * b.z - a.z * b.y,
  y: a.z * b.x - a.x * b.z,
  z: a.x * b.y - a.y * b.x,
});
const normal = (a: Vec3): Vec3 => {
  const length = Math.hypot(a.x, a.y, a.z) || 1;
  return { x: a.x / length, y: a.y / length, z: a.z / length };
};

export const makeProjection = (
  position: Vec3,
  target: Vec3,
  focal: number,
): Project => {
  const forward = normal(subtract(target, position));
  const right = normal(cross({ x: 0, y: 1, z: 0 }, forward));
  const up = cross(forward, right);
  return (point) => {
    const offset = subtract(point, position);
    const depth = Math.max(3, dot(offset, forward));
    return {
      x: 540 + (dot(offset, right) * focal) / depth,
      y: 1080 - (dot(offset, up) * focal) / depth,
      depth,
    };
  };
};
