import { Audio } from "@remotion/media";
import { staticFile, Track } from "remotion";

export type AudioCue = {
  src: string;
  name: string;
  from: number;
  durationInFrames: number;
  volume: number;
};

// Empty in v001. Future local, licensed cues use the same 30 fps global clock.
export const AudioSlots = ({ cues }: { cues: AudioCue[] }) => (
  <Track name="Áudio licenciado · vazio nesta versão">
    {cues.map((cue) => (
      <Audio
        key={`${cue.name}-${cue.from}`}
        name={cue.name}
        src={staticFile(cue.src)}
        from={cue.from}
        durationInFrames={cue.durationInFrames}
        volume={cue.volume}
      />
    ))}
  </Track>
);
