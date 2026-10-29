import { useLayoutEffect, useRef } from "react";
import { useCurrentFrame } from "remotion";
import { VIDEO } from "../constants";
import { createCamera, getEvolution } from "./CameraRig";
import { drawSky, drawRetroDetails } from "./PixelEnvironment";
import {
  drawAtmosphere,
  drawBuildings,
  drawDistantValley,
  drawMountains,
  drawTerrain,
  drawVegetation,
  drawWaterfalls,
} from "./ModernEnvironment";
import { drawCharacter } from "./PixelCharacter";
import { drawParticles, drawSeedConstellation } from "./ParticleSystem";
import {
  comparisonSplit,
  drawPortal,
  drawWorldShards,
} from "./TransitionEffects";
import { smooth } from "./geometry";

const paintWorld = (
  canvas: HTMLCanvasElement,
  frame: number,
  depth: number,
) => {
  const pixelSize = depth < 0.1 ? 4 : depth < 0.35 ? 3 : depth < 0.6 ? 2 : 1;
  const width = VIDEO.width / pixelSize;
  const height = VIDEO.height / pixelSize;
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D indisponível para o cenário ClipRush.");
  ctx.setTransform(1 / pixelSize, 0, 0, 1 / pixelSize, 0, 0);
  ctx.clearRect(0, 0, 1080, 1920);
  const state = createCamera(frame, depth);
  drawSky(ctx, state);
  ctx.save();
  ctx.translate(540, 1100);
  ctx.scale(state.zoom, state.zoom);
  ctx.translate(-540, -1100);
  drawDistantValley(ctx, state);
  drawMountains(ctx, state);
  drawTerrain(ctx, state);
  drawBuildings(ctx, state);
  drawVegetation(ctx, state);
  drawWaterfalls(ctx, state);
  drawRetroDetails(ctx, state);
  drawPortal(ctx, state);
  drawCharacter(ctx, state);
  drawParticles(ctx, state);
  ctx.restore();
  drawAtmosphere(ctx, state);
};

// Exactly one persistent world canvas: scene boundaries never reset the world.
// A complete frame is painted synchronously in a layout effect, with no timers,
// requestAnimationFrame, async assets, render-time RNG or frame-to-frame state.
export const WorldCanvas = () => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const world = useRef<HTMLCanvasElement | null>(null);
  const retro = useRef<HTMLCanvasElement | null>(null);
  useLayoutEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    world.current ??= document.createElement("canvas");
    retro.current ??= document.createElement("canvas");
    ctx.clearRect(0, 0, 1080, 1920);
    ctx.imageSmoothingEnabled = false;
    paintWorld(world.current, frame, getEvolution(frame));
    ctx.drawImage(world.current, 0, 0, 1080, 1920);
    if (frame >= 480 && frame < 720) {
      paintWorld(retro.current, frame, 0);
      const split = comparisonSplit(frame);
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, split, 1920);
      ctx.clip();
      ctx.drawImage(retro.current, 0, 0, 1080, 1920);
      ctx.restore();
      ctx.save();
      ctx.strokeStyle = "#b5f5ff";
      ctx.lineWidth = 4;
      ctx.shadowColor = "#00c8ff";
      ctx.shadowBlur = 24;
      ctx.beginPath();
      ctx.moveTo(split, 180);
      ctx.lineTo(split, 1690);
      ctx.stroke();
      ctx.restore();
    }
    if (frame < 38 || frame >= 870) {
      const phase = frame < 38 ? frame : 899 - frame;
      const reveal = smooth(10, 38, phase);
      ctx.fillStyle = `rgba(8, 10, 18, ${1 - reveal})`;
      ctx.fillRect(0, 0, 1080, 1920);
      if (frame >= 870)
        drawWorldShards(ctx, world.current, smooth(870, 899, frame));
      if (frame < 38)
        drawWorldShards(ctx, world.current, 1 - smooth(0, 38, frame));
      ctx.save();
      ctx.globalAlpha = 1 - smooth(22, 38, phase);
      drawSeedConstellation(ctx, phase);
      ctx.restore();
    }
    // One brief energy flash at assembly and one at portal crossing.
    if (frame === 46 || frame === 47) {
      const offset = frame === 46 ? 22 : -14;
      ctx.drawImage(
        world.current,
        0,
        world.current.height * 0.34,
        world.current.width,
        world.current.height * 0.008,
        offset,
        652,
        1080,
        15,
      );
      ctx.drawImage(
        world.current,
        0,
        world.current.height * 0.51,
        world.current.width,
        world.current.height * 0.006,
        -offset,
        979,
        1080,
        12,
      );
    }
    const flash =
      Math.max(0, 1 - Math.abs(frame - 34) / 3) * 0.18 +
      Math.max(0, 1 - Math.abs(frame - 318) / 7) * 0.3;
    if (flash > 0) {
      ctx.fillStyle = `rgba(187, 239, 255, ${flash})`;
      ctx.fillRect(0, 0, 1080, 1920);
    }
  }, [frame]);
  return (
    <canvas
      ref={ref}
      width={1080}
      height={1920}
      aria-label="Um mundo original evolui de pixel art para profundidade simulada"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    />
  );
};
