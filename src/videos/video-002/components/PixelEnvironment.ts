import { random } from "remotion";
import type { CameraState } from "./CameraRig";
import { blendColor, mix, smooth } from "./geometry";

const stars = Array.from({ length: 64 }, (_, i) => ({
  x: random(`sky-x-${i}`) * 1080,
  y: random(`sky-y-${i}`) * 900,
  size: 1 + random(`sky-size-${i}`) * 3,
}));

export const drawSky = (ctx: CanvasRenderingContext2D, state: CameraState) => {
  const { depth, frame } = state;
  const dusk = smooth(720, 870, frame);
  const sky = ctx.createLinearGradient(0, 0, 0, 1800);
  sky.addColorStop(0, blendColor("#0b153c", "#131339", depth));
  sky.addColorStop(0.34, blendColor("#263963", "#484277", depth));
  sky.addColorStop(
    0.58,
    blendColor("#6e739b", dusk > 0.5 ? "#efbea7" : "#e5a398", depth),
  );
  sky.addColorStop(0.8, blendColor("#a29db9", "#7a709a", depth));
  sky.addColorStop(1, "#101a39");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 1080, 1920);
  const sunX = mix(830, 760, depth) + dusk * 25;
  const sunY = mix(735, 885, depth) - dusk * 30;
  const bloom = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 650);
  bloom.addColorStop(0, "#ffd6a780");
  bloom.addColorStop(0.3, "#e3a1ae25");
  bloom.addColorStop(1, "#ffb38300");
  ctx.fillStyle = bloom;
  ctx.fillRect(0, 0, 1080, 1920);
  ctx.fillStyle = blendColor("#ffe4a0", "#ffe0b5", depth);
  ctx.beginPath();
  ctx.arc(sunX, sunY, mix(72, 98, depth), 0, Math.PI * 2);
  ctx.fill();
  if (depth < 0.7) {
    ctx.fillStyle = "#80709b";
    for (let line = 0; line < 6; line++)
      ctx.fillRect(sunX - 95, sunY + 8 + line * 15, 190, 4 * (1 - depth));
  }
  for (const star of stars) {
    ctx.globalAlpha =
      (0.3 + 0.4 * Math.sin(frame * 0.025 + star.x)) * (1 - depth * 0.6);
    ctx.fillStyle = "#ccecff";
    ctx.fillRect(star.x, star.y, star.size, star.size);
  }
  ctx.globalAlpha = 1;
  // Each cloud uses a distinct drift rate, rather than one moving background.
  for (let i = 0; i < 6; i++) {
    const x = ((i * 283 + frame * (0.08 + i * 0.018)) % 1500) - 200;
    const y = 730 + (i % 3) * 95;
    const width = 180 + (i % 3) * 45;
    ctx.globalAlpha = mix(0.23, 0.37, depth);
    ctx.fillStyle = blendColor("#c3cbdf", "#f8c9bb", depth);
    if (depth < 0.35) {
      ctx.fillRect(x, y, width, 24);
      ctx.fillRect(x + 30, y - 20, width * 0.58, 25);
      ctx.fillRect(x + 65, y - 32, width * 0.2, 20);
    } else {
      ctx.beginPath();
      ctx.ellipse(x, y, width * 0.65, 18, 0, 0, Math.PI * 2);
      ctx.ellipse(x + width * 0.3, y - 12, width * 0.33, 27, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
};

export const drawRetroDetails = (
  ctx: CanvasRenderingContext2D,
  state: CameraState,
) => {
  const { depth, frame } = state;
  if (depth > 0.7) return;
  ctx.save();
  ctx.globalAlpha = 1 - depth;
  // Foreground grass and flowers are authored as a single procedural field.
  for (let i = 0; i < 28; i++) {
    const x = ((i * 83 - frame * 0.5 + 2200) % 1180) - 40;
    const y = 1300 + (i % 3) * 6;
    ctx.fillStyle = i % 3 === 0 ? "#a8fca4" : "#54be91";
    ctx.fillRect(x, y - 10, 4, 12);
    ctx.fillRect(x - 5, y - 5, 14, 4);
  }
  // Obstacle stays in the same place as the courier jumps over it.
  const x = 480;
  ctx.fillStyle = "#2e466a";
  ctx.fillRect(x, 1248, 64, 64);
  ctx.fillStyle = "#517697";
  ctx.fillRect(x + 8, 1248, 56, 12);
  ctx.fillStyle = "#0fc5dd";
  ctx.fillRect(x + 18, 1270, 28, 8);
  ctx.restore();
};
