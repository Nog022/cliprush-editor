import { useLayoutEffect, useRef } from "react";
import { interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { drawSky, drawRetroDetails } from "../components/PixelEnvironment";
import {
  drawAtmosphere,
  drawBuildings,
  drawDistantValley,
  drawMountains,
  drawTerrain,
  drawVegetation,
  drawWaterfalls,
} from "../components/ModernEnvironment";
import { characterProgress, drawCharacter } from "../components/PixelCharacter";
import {
  drawParticles,
  drawSeedConstellation,
} from "../components/ParticleSystem";
import { drawPortal, drawWorldShards } from "../components/TransitionEffects";
import { mix, pathX, polygon, smooth } from "../components/geometry";
import {
  originalFrameForNarration,
  REFERENCE_AUDIO_SECONDS,
} from "../narrado/timing";
import { cinematicCamera, pulse } from "./camera";

const sparks = Array.from({ length: 46 }, (_, i) => ({
  x: random(`v2-x-${i}`),
  y: random(`v2-y-${i}`),
  depth: random(`v2-z-${i}`),
  phase: random(`v2-a-${i}`) * Math.PI * 2,
}));

const foreground = (
  ctx: CanvasRenderingContext2D,
  time: number,
  depth: number,
) => {
  // Near-plane foliage moves faster than the valley and leaves the hero clear.
  ctx.save();
  ctx.globalAlpha = 0.68;
  for (const side of [-1, 1]) {
    const x =
      side < 0
        ? -20 + Math.sin(time * 0.45) * 24
        : 1100 + Math.sin(time * 0.4) * 20;
    const y = 1630 + Math.cos(time * 0.3) * 25;
    for (let i = 0; i < 5; i++) {
      const reach = 90 + i * 14;
      polygon(
        ctx,
        [
          { x, y: y - i * 60 },
          { x: x - side * reach, y: y - i * 70 - 85 },
          { x: x - side * 28, y: y - i * 65 + 40 },
        ],
        depth > 0.5 ? "#153b4c" : "#1a3a57",
      );
    }
  }
  ctx.restore();
};

const energy = (ctx: CanvasRenderingContext2D, time: number) => {
  const impact = pulse(time, 9.75, 1.4);
  ctx.save();
  for (const [i, spark] of sparks.entries()) {
    const flight = (time * (0.13 + spark.depth * 0.2) + spark.x) % 1;
    const radius = flight * (240 + impact * 530);
    const x = 600 + Math.cos(spark.phase) * radius * 1.3;
    const y = 1130 + Math.sin(spark.phase) * radius;
    const size = 2 + spark.depth * 4 + impact * 6;
    ctx.globalAlpha = (1 - flight) * (0.14 + impact * 0.7);
    ctx.fillStyle = i % 3 ? "#81edff" : "#cc9eff";
    ctx.fillRect(x, y, size, size);
    if (impact > 0.1) {
      ctx.strokeStyle = i % 3 ? "#79e8ff" : "#b87bff";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(
        x + Math.cos(spark.phase) * impact * 42,
        y + Math.sin(spark.phase) * impact * 42,
      );
      ctx.stroke();
    }
  }
  const shock = smooth(9.56, 10.2, time);
  if (time >= 9.56 && time < 10.2) {
    ctx.globalAlpha = (1 - shock) * 0.65;
    ctx.strokeStyle = "#a2f7ff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(
      740,
      1120,
      40 + shock * 600,
      70 + shock * 700,
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
  }
  ctx.restore();
};

const paint = (
  canvas: HTMLCanvasElement,
  sourceFrame: number,
  time: number,
  flat: boolean,
) => {
  const state = cinematicCamera(time, sourceFrame, flat);
  const pixelSize = state.depth < 0.1 ? 4 : state.depth < 0.4 ? 2 : 1;
  const width = 1080 / pixelSize;
  const height = 1920 / pixelSize;
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D indisponível");
  ctx.setTransform(1 / pixelSize, 0, 0, 1 / pixelSize, 0, 0);
  ctx.clearRect(0, 0, 1080, 1920);
  drawSky(ctx, state);
  ctx.save();
  ctx.translate(540 - state.pan, 1150);
  ctx.rotate(state.roll);
  ctx.scale(state.zoom, state.zoom);
  ctx.translate(-540, -1150);
  drawDistantValley(ctx, state);
  drawMountains(ctx, state);
  drawTerrain(ctx, state);
  drawBuildings(ctx, state);
  drawVegetation(ctx, state);
  drawWaterfalls(ctx, state);
  drawRetroDetails(ctx, state);
  drawPortal(ctx, state);
  // Small follow-through and lean emphasize the crossing without changing the jump.
  const journey = smooth(340, 870, sourceFrame);
  const z = mix(8, 26, journey);
  const foot = state.project({ x: pathX(z), y: 0.5, z });
  const heroX = mix(
    sourceFrame >= 480 && state.depth === 0
      ? 230 + Math.sin((sourceFrame - 480) * 0.025) * 75
      : characterProgress(sourceFrame),
    foot.x,
    state.depth,
  );
  const heroY = mix(1313, foot.y, state.depth);
  ctx.save();
  ctx.translate(heroX, heroY);
  ctx.rotate(-pulse(time, 9.56, 0.6) * 0.07);
  ctx.scale(1.08, 1.08);
  ctx.translate(-heroX, -heroY);
  drawCharacter(ctx, state);
  ctx.restore();
  drawParticles(ctx, state);
  ctx.restore();
  drawAtmosphere(ctx, state);
  foreground(ctx, time, state.depth);
};

export const WorldCanvasV2 = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const sourceFrame = originalFrameForNarration(frame, durationInFrames);
  const time = (frame / (durationInFrames - 1)) * REFERENCE_AUDIO_SECONDS;
  const ref = useRef<HTMLCanvasElement>(null);
  const modern = useRef<HTMLCanvasElement | null>(null);
  const retro = useRef<HTMLCanvasElement | null>(null);
  useLayoutEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    modern.current ??= document.createElement("canvas");
    retro.current ??= document.createElement("canvas");
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.imageSmoothingEnabled = false;
    // Numeric source time is passed directly: no Freeze and no timeline clamp.
    paint(modern.current, sourceFrame, time, false);
    ctx.drawImage(modern.current, 0, 0, 1080, 1920);
    if (time >= 12.6 && time < 17.6) {
      paint(retro.current, sourceFrame, time, true);
      const split = interpolate(
        time,
        [12.6, 13.1, 14.3, 15.6, 16.3, 17.1, 17.6],
        [0, 540, 760, 260, 540, 540, 0],
        { extrapolateRight: "clamp" },
      );
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, split, 1920);
      ctx.clip();
      ctx.drawImage(retro.current, 0, 0, 1080, 1920);
      ctx.restore();
      const sweep = ctx.createLinearGradient(split - 25, 0, split + 25, 0);
      sweep.addColorStop(0, "#00c8ff00");
      sweep.addColorStop(0.5, "#9defff80");
      sweep.addColorStop(1, "#00c8ff00");
      ctx.fillStyle = sweep;
      ctx.fillRect(split - 25, 330, 50, 1320);
      ctx.fillStyle = "#a9f4ff";
      ctx.fillRect(split - 2, 330, 4, 1320);
    }
    energy(ctx, time);
    if (time < 0.8) {
      const reveal = smooth(0, 0.8, time);
      ctx.fillStyle = `rgba(8,10,18,${(1 - reveal) * 0.48})`;
      ctx.fillRect(0, 0, 1080, 1920);
      ctx.save();
      ctx.globalAlpha = (1 - reveal) * 0.85;
      drawSeedConstellation(ctx, time * 40);
      ctx.restore();
    }
    if (time > 23.78) {
      const collapse = smooth(23.78, REFERENCE_AUDIO_SECONDS, time);
      ctx.fillStyle = `rgba(8,10,18,${collapse})`;
      ctx.fillRect(0, 0, 1080, 1920);
      drawWorldShards(ctx, modern.current, collapse);
      ctx.save();
      ctx.globalAlpha = collapse;
      drawSeedConstellation(ctx, (1 - collapse) * 24);
      ctx.restore();
    }
    // Restrained, speech-driven impact pulses, not continuous screen shake.
    const flash = pulse(time, 0.25, 0.07) * 0.1 + pulse(time, 9.56, 0.1) * 0.2;
    if (flash > 0) {
      ctx.fillStyle = `rgba(184,235,255,${flash})`;
      ctx.fillRect(0, 0, 1080, 1920);
    }
  }, [frame, sourceFrame, time]);
  return (
    <canvas
      ref={ref}
      width={1080}
      height={1920}
      data-source-frame={sourceFrame}
      data-audio-frame={frame}
      aria-label="Mundo ClipRush V2 em evolução contínua"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    />
  );
};
