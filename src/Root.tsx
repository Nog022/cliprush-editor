import { ClipRush017 } from "./videos/video-017/ClipRush017";
import { ClipRush016 } from "./videos/video-016/ClipRush016";
import { ClipRush015 } from "./videos/video-015/ClipRush015";
import { ClipRush014 } from "./videos/video-014/ClipRush014";
import { ClipRush013 } from "./videos/video-013/ClipRush013";
import { ClipRush012 } from "./videos/video-012/ClipRush012";
import { ClipRush011 } from "./videos/video-011/ClipRush011";
import { TesteBiblioteca011 } from "./videos/video-011/TesteBiblioteca011";
import { TestePortaMalas011 } from "./videos/video-011/TestePortaMalas011";
import { ClipRushVideo010V004 } from "./videos/video-010/ClipRushVideo010V004";
import { ClipRushVideo010V003 } from "./videos/video-010/ClipRushVideo010V003";
import { ClipRushVideo010 } from "./videos/video-010/ClipRushVideo010";
import { ClipRushVideo009 } from "./videos/video-009/ClipRushVideo009";
import { ClipRushAI008Rocco } from "./videos/video-008/ClipRushAI008Rocco";
import { DURATION as video008Duration } from "./videos/video-008/timing";
import { ClipRushVideo007 } from "./videos/video-007/ClipRushVideo007";
import { DURATION as video007Duration } from "./videos/video-007/timing";
import { MyComposition } from "./Composition";
import { ClipRushVideo006 } from "./videos/video-006/ClipRushVideo006";
import { ClipRushVideo005 } from "./videos/video-005/ClipRushVideo005";
import { ClipRushVideo004 } from "./videos/video-004/ClipRushVideo004";
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
      <Composition id="ClipRush017" component={ClipRush017} durationInFrames={1442} fps={30} width={1080} height={1920} />
      <Composition id="ClipRush016" component={ClipRush016} durationInFrames={1207} fps={30} width={1080} height={1920} />
      <Composition id="ClipRush015" component={ClipRush015} durationInFrames={1192} fps={30} width={1080} height={1920} />
      <Composition id="ClipRush014" component={ClipRush014} durationInFrames={1840} fps={30} width={1080} height={1920} />
      <Composition id="ClipRush013" component={ClipRush013} durationInFrames={1360} fps={30} width={1080} height={1920} />
      <Composition id="ClipRush012" component={ClipRush012} durationInFrames={1566} fps={30} width={1080} height={1920} />
      <Composition id="ClipRush011" component={ClipRush011} durationInFrames={1401} fps={30} width={1080} height={1920} />
      <Composition
        id="TestePortaMalas011"
        component={TestePortaMalas011}
        durationInFrames={90}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="TesteBiblioteca011"
        component={TesteBiblioteca011}
        durationInFrames={120}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition id="ClipRushVideo010V004" component={ClipRushVideo010V004} durationInFrames={1127} fps={30} width={1080} height={1920} />
      <Composition id="ClipRushVideo010V003" component={ClipRushVideo010V003} durationInFrames={1127} fps={30} width={1080} height={1920} />
      <Composition id="ClipRushVideo010" component={ClipRushVideo010} durationInFrames={1189} fps={30} width={1080} height={1920} />
      <Composition id="ClipRushVideo009" component={ClipRushVideo009} durationInFrames={1286} fps={30} width={1080} height={1920} />
      <Composition id="ClipRushAI008Rocco" component={ClipRushAI008Rocco} durationInFrames={video008Duration} fps={30} width={1080} height={1920} />
      <Composition id="ClipRushVideo007" component={ClipRushVideo007} durationInFrames={video007Duration} fps={30} width={1080} height={1920} />
      <Composition
        id="ClipRushVideo006"
        component={ClipRushVideo006}
        durationInFrames={1305}
        fps={30}
        width={1080}
        height={1920}
        calculateMetadata={() => ({
          defaultCodec: "h264",
          defaultPixelFormat: "yuv420p",
          defaultOutName: "ClipRushVideo006",
        })}
      />
      <Composition
        id="ClipRushVideo005"
        component={ClipRushVideo005}
        durationInFrames={1171}
        fps={30}
        width={1080}
        height={1920}
        calculateMetadata={() => ({
          defaultCodec: "h264",
          defaultPixelFormat: "yuv420p",
          defaultOutName: "video-005-v001",
        })}
      />
      <Composition
        id="ClipRushVideo004"
        component={ClipRushVideo004}
        durationInFrames={1200}
        fps={30}
        width={1080}
        height={1920}
        calculateMetadata={() => ({
          defaultCodec: "h264",
          defaultPixelFormat: "yuv420p",
          defaultOutName: "video-004-v001",
        })}
      />
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
