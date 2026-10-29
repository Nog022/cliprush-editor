import type { CameraState } from "./CameraRig";
import { mix, pathX, smooth } from "./geometry";

export const drawPortal = (
  ctx: CanvasRenderingContext2D,
  state: CameraState,
) => {
  const { frame, depth, project } = state;
  const appear = smooth(236, 270, frame);
  if (appear === 0) return;
  const ring = Array.from({ length: 65 }, (_, i) => {
    const angle = (i / 64) * Math.PI * 2;
    return project({
      x: pathX(8) + Math.cos(angle) * 2.8,
      y: 4 + Math.sin(angle) * 4,
      z: 8,
    });
  });
  const middle = project({ x: pathX(8), y: 4, z: 8 });
  ctx.save();
  ctx.globalAlpha = appear * mix(1, 0.5, smooth(400, 460, frame));
  const glow = ctx.createRadialGradient(
    middle.x,
    middle.y,
    4,
    middle.x,
    middle.y,
    mix(200, 165, depth),
  );
  glow.addColorStop(0, "#79a9ff38");
  glow.addColorStop(0.6, "#00c8ff10");
  glow.addColorStop(1, "#00c8ff00");
  ctx.fillStyle = glow;
  ctx.fillRect(middle.x - 250, middle.y - 260, 500, 520);
  ctx.beginPath();
  ring.forEach((point, i) =>
    i === 0 ? ctx.moveTo(point.x, point.y) : ctx.lineTo(point.x, point.y),
  );
  ctx.strokeStyle = "#79f5ff";
  ctx.lineWidth = 6;
  ctx.shadowBlur = 25;
  ctx.shadowColor = "#00c8ff";
  ctx.stroke();
  ctx.shadowBlur = 0;
  for (let i = 0; i < 14; i++) {
    const point = ring[(Math.floor(frame * 0.23) + i * 4) % 64];
    ctx.fillStyle = i % 2 ? "#cdb5ff" : "#ffffff";
    ctx.fillRect(point.x - 3, point.y - 3, 6, 6);
  }
  ctx.restore();
};

export const comparisonSplit = (frame: number) => {
  if (frame < 480 || frame >= 720) return 0;
  const keys = [480, 508, 548, 598, 650, 685, 720];
  const values = [0, 540, 805, 230, 540, 540, 0];
  for (let i = 0; i < keys.length - 1; i++) {
    if (frame < keys[i + 1])
      return mix(values[i], values[i + 1], smooth(keys[i], keys[i + 1], frame));
  }
  return 0;
};

export const drawWorldShards = (
  ctx: CanvasRenderingContext2D,
  source: HTMLCanvasElement,
  collapse: number,
) => {
  if (collapse <= 0 || collapse >= 1) return;
  ctx.save();
  ctx.globalAlpha = (1 - collapse) * Math.min(1, collapse * 8);
  const cols = 8;
  const rows = 10;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * 135;
      const y = 500 + row * 124;
      const targetX = 460 + col * 20 + Math.sin(row * 2.7) * 35;
      const targetY = 840 + row * 22 + Math.cos(col * 3.1) * 35;
      const scale = 1 - collapse * 0.94;
      ctx.drawImage(
        source,
        (x / 1080) * source.width,
        (y / 1920) * source.height,
        (135 / 1080) * source.width,
        (124 / 1920) * source.height,
        mix(x, targetX, collapse),
        mix(y, targetY, collapse),
        135 * scale,
        124 * scale,
      );
    }
  }
  ctx.restore();
};
