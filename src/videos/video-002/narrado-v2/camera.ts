import { interpolate } from "remotion";
import { makeProjection, mix, smooth } from "../components/geometry";
import type { CameraState } from "../components/CameraRig";

export const pulse = (time: number, center: number, width: number) => {
  const t = Math.max(0, 1 - Math.abs(time - center) / width);
  return t * t * (3 - 2 * t);
};

export const cinematicCamera = (
  time: number,
  sourceFrame: number,
  forceFlat = false,
): CameraState & { pan: number; roll: number } => {
  const depth = forceFlat ? 0 : smooth(9.56, 12.48, time);
  const orbit = smooth(9.56, 12.48, time);
  const advance = smooth(17.6, 23.78, time);
  const angle =
    mix(-0.48, 0.34, orbit) + Math.sin(time * 0.6) * 0.045 - advance * 0.14;
  const radius = 54 - pulse(time, 10.6, 1.6) * 8 - advance * 11;
  const perspective = makeProjection(
    {
      x: Math.sin(angle) * radius,
      y: 24 - depth * 3.5 - advance * 1.2,
      z: 15 - Math.cos(angle) * radius,
    },
    { x: -1, y: 3.3, z: 19 + advance * 7 },
    1330 + pulse(time, 9.7, 0.85) * 160,
  );
  const zoom = interpolate(
    time,
    [
      0, 0.38, 1.15, 3.6, 5.1, 6.5, 8.2, 9.56, 10.35, 12.6, 14.3, 16.4, 17.6,
      20.5, 21.7, 22.1, 23.78, 24.35,
    ],
    [
      1.16, 1.21, 1.05, 1.02, 1.12, 1.16, 1.06, 1.17, 1.1, 0.97, 1.02, 0.96, 1,
      1.045, 1.04, 1.11, 1.06, 1.08,
    ],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const pan =
    time < 8.2
      ? interpolate(time, [0, 3.6, 5.1, 6.5, 8.2], [-35, -45, -10, 60, 105], {
          extrapolateRight: "clamp",
        })
      : mix(105, 0, depth);
  return {
    frame: sourceFrame,
    depth,
    fragmentation: Math.sin(Math.PI * smooth(9.56, 11.3, time)) * 1.3,
    zoom,
    pan: forceFlat && time >= 12.6 ? 0 : pan,
    roll:
      time >= 8.2 && time < 12.6
        ? Math.sin(orbit * Math.PI * 2) * 0.022
        : Math.sin(time * 0.37) * 0.004,
    project: (point) => {
      const modern = perspective(point);
      return {
        x: mix(540 + point.x * 32, modern.x, depth),
        y: mix(1340 - (point.z + 10) * 1.5 - point.y * 32, modern.y, depth),
        depth: modern.depth,
      };
    },
  };
};
