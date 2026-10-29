import { CUES } from "../constants";
import { clamp, makeProjection, mix, smooth, type Project } from "./geometry";

export type CameraState = {
  project: Project;
  depth: number;
  fragmentation: number;
  frame: number;
  zoom: number;
};

export const getEvolution = (frame: number) =>
  smooth(CUES.crossing, CUES.reveal, frame);

// A software perspective camera; no WebGL, Three.js, assets or network calls.
export const createCamera = (
  frame: number,
  depth = getEvolution(frame),
): CameraState => {
  const orbit = smooth(324, 450, frame);
  const dolly = smooth(720, 870, frame);
  const angle = mix(-0.32, 0.32, orbit) + Math.sin(frame / 130) * 0.035;
  const radius = mix(54, 46, dolly);
  const perspective = makeProjection(
    {
      x: Math.sin(angle) * radius,
      y: mix(24, 21, dolly),
      z: 15 - Math.cos(angle) * radius,
    },
    { x: 0, y: 3.5, z: mix(19, 25, dolly) },
    1330,
  );
  const fragmentation =
    Math.sin(Math.PI * smooth(312, 402, frame)) * (1 - smooth(394, 422, frame));
  return {
    project: (point) => {
      const modern = perspective(point);
      return {
        x: mix(540 + point.x * 32, modern.x, depth),
        y: mix(1340 - (point.z + 10) * 1.5 - point.y * 32, modern.y, depth),
        depth: modern.depth,
      };
    },
    depth,
    fragmentation,
    frame,
    zoom:
      frame < 90
        ? mix(0.56, 1, smooth(0, 36, frame)) +
          Math.sin(Math.PI * clamp((frame - 20) / 65)) * 0.09
        : mix(1, 0.96, smooth(600, 680, frame)) + dolly * 0.04,
  };
};
