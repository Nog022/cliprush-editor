import type { CameraState } from "./CameraRig";
import {
  blendColor,
  mix,
  pathX,
  polygon,
  terrainHeight,
  type Point,
  type Vec3,
} from "./geometry";

type Face = { points: Point[]; color: string; depth: number; edge?: string };
const face = (
  state: CameraState,
  vertices: Vec3[],
  color: string,
  seed = 0,
): Face => {
  const shift = state.fragmentation * 46;
  const points = vertices.map((vertex) => {
    const p = state.project(vertex);
    return {
      x: p.x + Math.sin(seed * 13.7) * shift,
      y: p.y + Math.cos(seed * 9.1) * shift,
      depth: p.depth,
    };
  });
  return {
    points,
    color,
    depth:
      points.reduce((total, p) => total + (p.depth ?? 0), 0) / points.length,
    edge:
      state.fragmentation > 0.2
        ? `rgba(83, 225, 255, ${state.fragmentation * 0.6})`
        : undefined,
  };
};
const paintFaces = (ctx: CanvasRenderingContext2D, faces: Face[]) => {
  faces.sort((a, b) => b.depth - a.depth);
  for (const item of faces) polygon(ctx, item.points, item.color, item.edge);
};

export const drawDistantValley = (
  ctx: CanvasRenderingContext2D,
  state: CameraState,
) => {
  // Continuous land behind the island grounds the mountain feet in the valley.
  for (let z = 160; z >= 42; z -= 14) {
    const vertices = [
      { x: -150, y: -2.5, z },
      { x: 150, y: -2.5, z },
      { x: 150, y: -2.5, z: z + 14 },
      { x: -150, y: -2.5, z: z + 14 },
    ];
    polygon(
      ctx,
      vertices.map(state.project),
      blendColor("#9598b0", z > 95 ? "#949eaf" : "#749f9e", state.depth),
    );
    const a = state.project({ x: pathX(z) - 0.9, y: -2.45, z });
    const b = state.project({ x: pathX(z) + 0.9, y: -2.45, z });
    const c = state.project({ x: pathX(z + 14) + 0.9, y: -2.45, z: z + 14 });
    const d = state.project({ x: pathX(z + 14) - 0.9, y: -2.45, z: z + 14 });
    polygon(ctx, [a, b, c, d], "#d5c0ab");
  }
};

export const drawMountains = (
  ctx: CanvasRenderingContext2D,
  state: CameraState,
) => {
  const mountains = [
    {
      x: -34,
      z: 95,
      height: 33,
      radius: 27,
      color: "#787bab",
      highlight: "#c2a3b9",
    },
    {
      x: 27,
      z: 90,
      height: 29,
      radius: 29,
      color: "#687d9c",
      highlight: "#aaa3b4",
    },
    {
      x: -24,
      z: 57,
      height: 23,
      radius: 19,
      color: "#4b658c",
      highlight: "#b4a0b2",
    },
    {
      x: 4,
      z: 76,
      height: 35,
      radius: 22,
      color: "#5c679b",
      highlight: "#e2b7b8",
    },
    {
      x: 31,
      z: 52,
      height: 24,
      radius: 20,
      color: "#45627d",
      highlight: "#ba9ba3",
    },
  ];
  for (const [index, mountain] of mountains.entries()) {
    const { x, z, height: h, radius: r } = mountain;
    const vertices = [
      { x: x - r, y: -1, z: z - 2 },
      { x: x - r * 0.22, y: h * 0.77, z },
      { x: x + r * 0.04, y: h, z: z + r * 0.3 },
      { x: x + r * 0.42, y: h * 0.64, z },
      { x: x + r, y: -1, z: z - 2 },
      { x: x + r * 0.2, y: -1, z: z - r * 0.45 },
    ];
    const projected = vertices.map((point) => {
      const modern = state.project(point);
      const flat = {
        x: 540 + point.x * 19 - Math.sin(state.frame / 260) * (10 + index * 7),
        y: 1150 - point.y * 17 - (point.z - 48) * 1.7,
      };
      return {
        x: mix(flat.x, modern.x, state.depth),
        y: mix(flat.y, modern.y, state.depth),
      };
    });
    const tris = [
      [0, 1, 5],
      [1, 2, 5],
      [2, 3, 5],
      [3, 4, 5],
    ];
    for (const [i, triangle] of tris.entries()) {
      const colors = [mountain.color, mountain.highlight, "#657298", "#385475"];
      polygon(
        ctx,
        triangle.map((v) => projected[v]),
        blendColor(
          mountain.color,
          colors[i],
          state.depth * (i === 1 ? 0.9 : 0.8),
        ),
      );
    }
    // Snow cap grows from the same summit; no image swap.
    const apex = projected[2];
    polygon(
      ctx,
      [
        apex,
        {
          x: mix(apex.x, projected[1].x, 0.4),
          y: mix(apex.y, projected[1].y, 0.4),
        },
        {
          x: mix(apex.x, projected[5].x, 0.17),
          y: mix(apex.y, projected[5].y, 0.17),
        },
        {
          x: mix(apex.x, projected[3].x, 0.35),
          y: mix(apex.y, projected[3].y, 0.35),
        },
      ],
      blendColor("#abbdd0", "#f5d8cc", state.depth),
    );
  }
  // Distant mist separates ridges from the floating foreground.
  const fog = ctx.createLinearGradient(0, 1000, 0, 1460);
  fog.addColorStop(0, "#c6b1c900");
  fog.addColorStop(0.45, "#c2b1ca45");
  fog.addColorStop(1, "#547b9f00");
  ctx.fillStyle = fog;
  ctx.fillRect(0, 1000, 1080, 460);
};

export const drawTerrain = (
  ctx: CanvasRenderingContext2D,
  state: CameraState,
) => {
  const faces: Face[] = [];
  const nx = 10;
  const nz = 9;
  const vertex = (i: number, j: number): Vec3 => {
    const x = -22 + i * 4.4;
    const z = -10 + j * 6;
    return { x, z, y: terrainHeight(x, z) };
  };
  for (let j = 0; j < nz; j++) {
    for (let i = 0; i < nx; i++) {
      const a = vertex(i, j);
      const b = vertex(i + 1, j);
      const c = vertex(i + 1, j + 1);
      const d = vertex(i, j + 1);
      const seed = i + j * nx;
      const retro = (i + j) % 3 === 0 ? "#8fd09b" : "#6bb688";
      const modern = (i + j) % 3 === 0 ? "#7da88e" : "#528e82";
      faces.push(
        face(state, [a, b, c], blendColor(retro, modern, state.depth), seed),
      );
      faces.push(
        face(
          state,
          [a, c, d],
          blendColor(
            "#6dbf92",
            (i + j) % 2 ? "#5e9e8f" : "#74ad92",
            state.depth,
          ),
          seed + 0.5,
        ),
      );
    }
  }
  // Original flat platform acquires measurable thickness as its vertices move.
  for (let i = 0; i < nx; i++) {
    const a = vertex(i, 0);
    const b = vertex(i + 1, 0);
    const bottom = -mix(7, 12, state.depth) - Math.sin(i * 1.8) * 2;
    faces.push(
      face(
        state,
        [a, b, { ...b, y: bottom }, { ...a, y: bottom - 1 }],
        blendColor(
          i % 2 ? "#41546b" : "#344259",
          i % 2 ? "#344c69" : "#243754",
          state.depth,
        ),
        300 + i,
      ),
    );
    faces.push(
      face(
        state,
        [
          { ...a, y: -2 },
          { ...b, y: -2 },
          { ...b, y: -2.4 },
          { ...a, y: -2.4 },
        ],
        "#6b7191",
        330 + i,
      ),
    );
  }
  for (let j = 0; j < nz; j++) {
    for (const i of [0, nx]) {
      const a = vertex(i, j);
      const b = vertex(i, j + 1);
      faces.push(
        face(
          state,
          [a, b, { ...b, y: -8 }, { ...a, y: -10 }],
          i === 0 ? "#4b5777" : "#293f5c",
          400 + j + i,
        ),
      );
    }
  }
  paintFaces(ctx, faces);
  // Small masonry blocks preserve a clear pixel-art material in the flat era.
  ctx.save();
  ctx.globalAlpha = 0.4 * (1 - state.depth) * (1 - state.fragmentation);
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 22; col++) {
      const x = -22 + col * 2 + (row % 2) * 0.8;
      const y = -1 - row * 1.15;
      polygon(
        ctx,
        [
          state.project({ x: x + 0.1, y, z: -10.01 }),
          state.project({ x: x + 1.75, y, z: -10.01 }),
          state.project({ x: x + 1.75, y: y - 0.9, z: -10.01 }),
          state.project({ x: x + 0.1, y: y - 0.9, z: -10.01 }),
        ],
        (row + col) % 3 ? "#7282a2" : "#a3a1af",
      );
    }
  }
  ctx.restore();
  // A continuous winding path makes the new dimension legible immediately.
  for (let z = 43; z >= -10; z -= 1.5) {
    const width = 1.6;
    const points = [
      { x: pathX(z) - width, y: terrainHeight(pathX(z), z) + 0.12, z },
      { x: pathX(z) + width, y: terrainHeight(pathX(z), z) + 0.12, z },
      {
        x: pathX(z + 1.6) + width,
        y: terrainHeight(pathX(z + 1.6), z + 1.6) + 0.12,
        z: z + 1.6,
      },
      {
        x: pathX(z + 1.6) - width,
        y: terrainHeight(pathX(z + 1.6), z + 1.6) + 0.12,
        z: z + 1.6,
      },
    ];
    polygon(
      ctx,
      points.map(state.project),
      blendColor(
        "#e5cf93",
        Math.round(z) % 3 === 0 ? "#e6c2a0" : "#d4b397",
        state.depth,
      ),
    );
  }
};

const box = (
  ctx: CanvasRenderingContext2D,
  state: CameraState,
  x: number,
  z: number,
  w: number,
  h: number,
) => {
  const p = (dx: number, y: number, dz: number) =>
    state.project({ x: x + dx, y, z: z + dz });
  const thickness = state.depth * w;
  polygon(
    ctx,
    [p(-w, 0, 0), p(w, 0, 0), p(w, h, 0), p(-w, h, 0)],
    blendColor("#416c86", "#728c9f", state.depth),
  );
  polygon(
    ctx,
    [p(w, 0, 0), p(w, 0, thickness), p(w, h, thickness), p(w, h, 0)],
    "#345675",
  );
  polygon(
    ctx,
    [p(-w, h, 0), p(w, h, 0), p(w, h, thickness), p(-w, h, thickness)],
    "#bdc8c1",
  );
  for (let level = 1; level < h - 0.5; level += 1.6) {
    polygon(
      ctx,
      [
        p(-w * 0.65, level, -0.01),
        p(w * 0.65, level, -0.01),
        p(w * 0.65, level + 0.45, -0.01),
        p(-w * 0.65, level + 0.45, -0.01),
      ],
      "#84e8ee",
    );
  }
};

export const drawBuildings = (
  ctx: CanvasRenderingContext2D,
  state: CameraState,
) => {
  box(ctx, state, -12, 35, 2.3, 8);
  box(ctx, state, -17, 34, 1.7, 6);
  box(ctx, state, -7, 38, 1.9, 11);
  box(ctx, state, -13, 40, 2, 13);
  // Luminous bridge between towers, revealed as the world gains depth.
  const a = state.project({ x: -14, y: 5, z: 35 });
  const b = state.project({ x: -6, y: 5, z: 38 });
  ctx.strokeStyle = "#80e1f4";
  ctx.lineWidth = mix(3, 5, state.depth);
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
};

export const drawVegetation = (
  ctx: CanvasRenderingContext2D,
  state: CameraState,
) => {
  const trees = [
    [-17, 10, 6],
    [-13, 17, 5],
    [-18, 25, 7],
    [18, 22, 6],
    [14, 32, 7],
    [19, 37, 8],
    [-20, 3, 5],
    [20, 8, 6],
    [-3, 30, 4],
    [5, 36, 5],
    [-18, -4, 7],
    [18, -3, 8],
  ];
  for (const [index, [x, z, h]] of trees.entries()) {
    const sway =
      Math.sin(state.frame * 0.025 + index * 1.6) * 0.15 * state.depth;
    const ground = terrainHeight(x, z);
    ctx.save();
    ctx.globalAlpha = state.depth * 0.2;
    polygon(
      ctx,
      [
        state.project({ x: x - 0.6, y: ground + 0.1, z }),
        state.project({ x: x + 0.6, y: ground + 0.1, z }),
        state.project({
          x: x - h * 0.6 + 0.5,
          y: ground + 0.1,
          z: z + h * 0.4,
        }),
        state.project({
          x: x - h * 0.6 - 0.5,
          y: ground + 0.1,
          z: z + h * 0.4,
        }),
      ],
      "#102b52",
    );
    ctx.restore();
    const p = (dx: number, y: number, dz = 0) =>
      state.project({ x: x + dx + ((y - ground) / h) * sway, y, z: z + dz });
    polygon(
      ctx,
      [
        p(-0.25, ground),
        p(0.25, ground),
        p(0.25, ground + h * 0.7),
        p(-0.25, ground + h * 0.7),
      ],
      "#536661",
    );
    for (let layer = 0; layer < 3; layer++) {
      const y = ground + h * (0.25 + layer * 0.22);
      const r = h * (0.34 - layer * 0.07);
      const apex = p(0, y + h * 0.43);
      polygon(
        ctx,
        [p(-r, y), apex, p(0, y, -r * state.depth)],
        blendColor("#5bc498", "#44877f", state.depth),
      );
      polygon(
        ctx,
        [p(0, y, -r * state.depth), apex, p(r, y)],
        blendColor("#8de5a6", "#96b997", state.depth),
      );
    }
  }
};

export const drawWaterfalls = (
  ctx: CanvasRenderingContext2D,
  state: CameraState,
) => {
  for (const [index, x] of [-18, 16].entries()) {
    const z = index === 0 ? -10 : 17;
    const p = (dx: number, y: number) => state.project({ x: x + dx, y, z });
    polygon(
      ctx,
      [p(-0.8, 0.3), p(0.8, 0.3), p(0.65, -14), p(-0.65, -14)],
      "#69d7eb77",
    );
    for (let streak = 0; streak < 7; streak++) {
      const y = -((state.frame * 0.09 + streak * 2.3) % 13);
      const a = p(-0.5 + (streak % 3) * 0.4, y);
      const b = p(-0.5 + (streak % 3) * 0.4, y - 2.2);
      ctx.strokeStyle = "#b4f4ff99";
      ctx.lineWidth = mix(2, 3, state.depth);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
  }
};

export const drawAtmosphere = (
  ctx: CanvasRenderingContext2D,
  state: CameraState,
) => {
  const { depth, frame } = state;
  if (depth < 0.3) return;
  ctx.save();
  ctx.globalAlpha = depth * 0.16;
  polygon(
    ctx,
    [
      { x: 760, y: 870 },
      { x: -100, y: 1850 },
      { x: 500, y: 1920 },
    ],
    "#ffd0a7",
  );
  ctx.restore();
  // Three small birds add scale to the valley without introducing an asset.
  for (let i = 0; i < 3; i++) {
    const x = 300 + ((frame * (0.2 + i * 0.035) + i * 100) % 500);
    const y = 870 + i * 28 + Math.sin(frame / 20 + i) * 8;
    ctx.strokeStyle = "#333e62aa";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 9, y);
    ctx.quadraticCurveTo(x - 4, y - Math.sin(frame * 0.12) * 8, x, y + 2);
    ctx.quadraticCurveTo(x + 4, y - Math.sin(frame * 0.12) * 8, x + 9, y);
    ctx.stroke();
  }
  const veil = ctx.createLinearGradient(0, 0, 0, 1920);
  veil.addColorStop(0, "#080a1255");
  veil.addColorStop(0.5, "#080a1200");
  veil.addColorStop(0.82, "#080a1200");
  veil.addColorStop(1, "#080a12ee");
  ctx.fillStyle = veil;
  ctx.fillRect(0, 0, 1080, 1920);
};
