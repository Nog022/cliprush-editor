import { MyComposition } from "./Composition";
import { ClipRushVideo003 } from "./videos/video-003/ClipRushVideo003";
import video003Cuts from "./videos/video-003/cuts.json";
import { Composition } from "remotion";
import { ClipRushVideo001 } from "./videos/video-001/ClipRushVideo001";
import { ClipRushAI002 } from "./videos/video-002/ClipRushAI002";
import { ClipRushAI002Narrado } from "./videos/video-002/narrado/ClipRushAI002Narrado";
import { narratedMetadata } from "./videos/video-002/narrado/metadata";
import { ClipRushAI002NarradoV2 } from "./videos/video-002/narrado-v2/ClipRushAI002NarradoV2";
import { narratedV2Metadata } from "./videos/video-002/narrado-v2/metadata";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
      <Composition
        id="ClipRushVideo003"
        component={ClipRushVideo003}
        durationInFrames={video003Cuts.durationInFrames}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="ClipRushVideo001"
        component={ClipRushVideo001}
        durationInFrames={1317}
        fps={30}
        width={1080}
        height={1920}
        calculateMetadata={() => ({
          defaultCodec: "h264",
          defaultPixelFormat: "yuv420p",
          defaultOutName: "video-001-v001",
        })}
      />
      <Composition
        id="ClipRushAI002"
        component={ClipRushAI002}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ audioCues: [] }}
        calculateMetadata={() => ({
          defaultCodec: "h264",
          defaultPixelFormat: "yuv420p",
          defaultOutName: "cliprush-ai-002",
        })}
      />
      <Composition
        id="ClipRushAI002Narrado"
        component={ClipRushAI002Narrado}
        durationInFrames={731}
        fps={30}
        width={1080}
        height={1920}
        calculateMetadata={narratedMetadata}
      />
      <Composition
        id="ClipRushAI002NarradoV2"
        component={ClipRushAI002NarradoV2}
        durationInFrames={731}
        fps={30}
        width={1080}
        height={1920}
        calculateMetadata={narratedV2Metadata}
      />
    </>
  );
};
