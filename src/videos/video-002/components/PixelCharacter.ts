import { interpolate } from "remotion";
import { clamp, mix, pathX, smooth } from "./geometry";
import type { CameraState } from "./CameraRig";

// An original courier: cyan helmet, luminous visor and a violet scarf.
const helmet = [
  "    cccccc    ",
  "   cwwwwwwc   ",
  "  cwwwwwwwwc  ",
  "  cwddddddwc  ",
  "  cdbbbbbb dc ",
  "  cdbbwwbb dc ",
  "   cddddddc   ",
  "    cccccc    ",
];
const palette: Record<string, string> = {
  c: "#19c8e6",
  w: "#d7fcff",
  d: "#133457",
  b: "#64ecff",
};

export const characterProgress = (frame: number) =>
  interpolate(frame, [90, 150, 210, 265, 310], [190, 380, 610, 790, 845], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

export const drawCharacter = (
  ctx: CanvasRenderingContext2D,
  state: CameraState,
) => {
  const { frame, depth, project } = state;
  const walkingFrame =
    frame >= 480 && depth === 0 ? 90 + ((frame - 480) % 175) : frame;
  const retroX =
    frame >= 480 && depth === 0
      ? 230 + Math.sin((frame - 480) * 0.025) * 75
      : characterProgress(walkingFrame);
  const journey = smooth(340, 870, frame);
  const z = mix(8, 26, journey);
  const foot = project({ x: pathX(z), y: 0.5, z });
  const x = mix(retroX, foot.x, depth);
  const jumpPhase = clamp((walkingFrame - 154) / 58);
  const jump = Math.sin(jumpPhase * Math.PI) * 185 * (1 - depth);
  const stride = Math.sin((walkingFrame - 90) * 0.43);
  const size = mix(9, 7.4, depth);
  const y = mix(1313, foot.y, depth) - jump;

  ctx.save();
  ctx.fillStyle = `rgba(5, 12, 37, ${0.3 + depth * 0.2})`;
  ctx.beginPath();
  ctx.ellipse(
    x,
    mix(1320, foot.y + 6, depth),
    65 - jump * 0.1,
    9 + depth * 5,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.translate(
    x - 7 * size,
    y - 20 * size + (jump > 5 ? 0 : Math.abs(stride) * 3),
  );
  // Scarf trails opposite the running direction, with two moving segments.
  ctx.fillStyle = "#a866ff";
  ctx.fillRect(-size * 3, size * (8.4 + stride * 0.25), size * 8, size * 2);
  ctx.fillStyle = "#de9bff";
  ctx.fillRect(-size * 4, size * (8 + stride * 0.4), size * 3, size);
  for (let row = 0; row < helmet.length; row++) {
    for (let column = 0; column < helmet[row].length; column++) {
      const color = palette[helmet[row][column]];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(column * size, row * size, size + 0.2, size + 0.2);
    }
  }
  ctx.fillStyle = "#14788e";
  ctx.fillRect(3 * size, 9 * size, 8 * size, 6 * size);
  ctx.fillStyle = "#5be4d7";
  ctx.fillRect(5 * size, 10 * size, 5 * size, 4 * size);
  ctx.fillStyle = "#e6fcff";
  ctx.fillRect(6 * size, 10 * size, 2 * size, 2 * size);
  // Articulated arms and alternate feet give an actual running cycle.
  ctx.fillStyle = "#19acc2";
  ctx.fillRect((2 - stride) * size, 10 * size, 2 * size, 5 * size);
  ctx.fillRect((11 + stride) * size, (10 - stride) * size, 2 * size, 5 * size);
  ctx.fillStyle = "#143c5e";
  ctx.fillRect(
    (4 + stride * 1.3) * size,
    15 * size,
    3 * size,
    (4 - Math.max(0, stride)) * size,
  );
  ctx.fillRect(
    (8 - stride * 1.3) * size,
    15 * size,
    3 * size,
    (4 + Math.min(0, stride)) * size,
  );
  ctx.fillStyle = "#b9f4f3";
  ctx.fillRect(
    (4 + stride * 1.3) * size,
    (18 - Math.max(0, stride)) * size,
    4 * size,
    2 * size,
  );
  ctx.fillRect(
    (8 - stride * 1.3) * size,
    (18 + Math.min(0, stride)) * size,
    4 * size,
    2 * size,
  );
  if (depth > 0.25) {
    const light = ctx.createLinearGradient(0, 0, 14 * size, 0);
    light.addColorStop(0, "#f5bd9955");
    light.addColorStop(0.5, "#ffffff00");
    light.addColorStop(1, "#040a4370");
    ctx.globalAlpha = depth;
    ctx.fillStyle = light;
    ctx.fillRect(3 * size, 9 * size, 8 * size, 6 * size);
  }
  ctx.restore();
};
