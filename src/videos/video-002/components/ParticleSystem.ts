import { random } from "remotion";
import { CUES } from "../constants";
import type { CameraState } from "./CameraRig";
import { clamp, mix, smooth } from "./geometry";

const seeds = Array.from({ length: 72 }, (_, i) => ({
  x: random(`002-px-${i}`),
  y: random(`002-py-${i}`),
  z: random(`002-pz-${i}`),
  angle: random(`002-pa-${i}`) * Math.PI * 2,
}));

export const drawParticles = (
  ctx: CanvasRenderingContext2D,
  state: CameraState,
) => {
  const { frame, depth } = state;
  ctx.save();
  // Collector diamond and a deterministic radial pickup burst.
  if (frame >= 90 && frame < CUES.pickup) {
    const bob = Math.sin(frame * 0.11) * 9;
    ctx.translate(555, 1115 + bob);
    ctx.rotate(Math.PI / 4);
    ctx.shadowColor = "#ffe79d";
    ctx.shadowBlur = 28;
    ctx.fillStyle = "#fff4b0";
    ctx.fillRect(-13, -13, 26, 26);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-5, -5, 10, 10);
  }
  ctx.restore();
  if (frame >= CUES.pickup && frame < 280) {
    const t = clamp((frame - CUES.pickup) / 85);
    for (const [i, seed] of seeds.slice(0, 32).entries()) {
      const distance = 30 + t * (120 + seed.z * 500);
      const x = 555 + Math.cos(seed.angle) * distance;
      const y = 1115 + Math.sin(seed.angle) * distance * 0.6 + t * t * 200;
      ctx.globalAlpha = (1 - t) * 0.9;
      ctx.fillStyle = i % 2 ? "#9c7bff" : "#91fbdf";
      ctx.fillRect(x, y, 5 + seed.z * 6, 5 + seed.z * 6);
    }
  }
  ctx.globalAlpha = 1;
  if (frame > 260) {
    const active = smooth(260, 310, frame);
    for (const [i, seed] of seeds.slice(0, 36).entries()) {
      const speed = 0.11 + seed.z * 0.3;
      const x = ((seed.x * 1260 - frame * speed + 1500) % 1260) - 90;
      const y = ((seed.y * 1450 - frame * speed * 0.27 + 2200) % 1450) + 280;
      const size = mix(3, 1.5 + seed.z * 3, depth);
      ctx.globalAlpha = active * (0.15 + seed.z * 0.5);
      ctx.fillStyle = i % 4 === 0 ? "#ffcda1" : "#a3f3ff";
      ctx.fillRect(x, y, size, size);
    }
  }
  ctx.globalAlpha = 1;
};

export const drawSeedConstellation = (
  ctx: CanvasRenderingContext2D,
  phase: number,
) => {
  const gather = smooth(0, 28, phase);
  const opacity = ctx.globalAlpha;
  for (const [i, seed] of seeds.entries()) {
    const x = mix(
      540 + (seed.x - 0.5) * 780,
      540 + ((i % 12) - 5.5) * 23,
      gather,
    );
    const y = mix(
      970 + (seed.y - 0.5) * 720,
      970 + (Math.floor(i / 12) - 2.5) * 23,
      gather,
    );
    const size = 4 + seed.z * 12;
    ctx.globalAlpha = opacity * (0.5 + seed.z * 0.5);
    ctx.shadowBlur = 16;
    ctx.shadowColor = i % 3 ? "#00c8ff" : "#8247ff";
    ctx.fillStyle = i % 3 ? "#62dfff" : "#ad87ff";
    ctx.fillRect(Math.round(x / 4) * 4, Math.round(y / 4) * 4, size, size);
  }
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
};
