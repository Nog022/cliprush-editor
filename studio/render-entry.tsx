import { Composition, registerRoot } from "remotion";
import { ProjectComposition } from "./ProjectComposition";
import type { Project } from "../shared/model";

const placeholder = {
  id: "render",
  name: "Render",
  clips: [],
  scenes: [],
  captions: [],
  assets: [],
  fps: 30,
  width: 1080,
  height: 1920,
  durationInFrames: 30,
} as unknown as Project;
registerRoot(() => (
  <Composition
    id="ClipRushProject"
    component={ProjectComposition}
    width={1080}
    height={1920}
    fps={30}
    durationInFrames={30}
    defaultProps={{
      project: placeholder,
      sources: {} as Record<string, string>,
    }}
    calculateMetadata={({ props }) => ({
      width: props.project.width,
      height: props.project.height,
      fps: props.project.fps,
      durationInFrames: props.project.durationInFrames,
    })}
  />
));
