import React from "react";
import {Audio} from "@remotion/media";
import {staticFile, useCurrentFrame} from "remotion";
import music from "./music.json";

// Change these two controls to replace the bed or adjust its overall level.
export const musicSettings = {
  file: music.file,
  gain: 0.72,
};

export const MusicBed: React.FC = () => {
  const frame = useCurrentFrame();
  return <Audio
    name="Trilha original / 110 BPM / ducking de voz"
    src={staticFile(`videos/video-003/${musicSettings.file}`)}
    volume={(music.gainByFrame[Math.floor(frame)] ?? 0) * musicSettings.gain}
  />;
};
