import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { ClipRush020 } from "./videos/video-020/ClipRush020";
import { ClipRush021 } from "./videos/video-021/ClipRush021";
import { ClipRush022 } from "./videos/video-022/ClipRush022";
import { ClipRush023 } from "./videos/video-023/ClipRush023";
import { ClipRush024 } from "./videos/video-024/ClipRush024";
import { WebcamTopGameplayBottom } from "./templates/webcam_top_gameplay_bottom";
import { ClipRush025, rdr2Preset } from "./videos/video-025/ClipRush025";
import { Weather025 } from "./videos/video-025/Weather025";
import { ClipRush026 } from "./videos/video-026/ClipRush026";

import { ClipRush027 } from "./videos/video-027/ClipRush027";
import { ClipRush028 } from "./videos/video-028/ClipRush028";
import { ClipRush029 } from "./videos/video-029/ClipRush029";

import { ClipRush030 } from './videos/video-030/ClipRush030';
import { ClipRush031 } from './videos/video-031/ClipRush031';
import { ClipRush032 } from './videos/video-032/ClipRush032';
import { ClipRush033 } from './videos/video-033/ClipRush033';
import { ClipRush034 } from './videos/video-034/ClipRush034';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
      <Composition id="ClipRush034" component={ClipRush034} durationInFrames={1341} fps={30} width={1080} height={1920} />
      <Composition id="ClipRush033" component={ClipRush033} durationInFrames={366} fps={30} width={1080} height={1920} />
      <Composition id="ClipRush032" component={ClipRush032} durationInFrames={1322} fps={30} width={1080} height={1920} />
      <Composition id="ClipRush031" component={ClipRush031} durationInFrames={1041} fps={30} width={1080} height={1920} />
      <Composition id="ClipRush030" component={ClipRush030} durationInFrames={1648} fps={30} width={1080} height={1920} />
      <Composition id="ClipRush029" component={ClipRush029} durationInFrames={1401} fps={30} width={1080} height={1920} />
      <Composition id="ClipRush028" component={ClipRush028} durationInFrames={1509} fps={30} width={1080} height={1920} />
      <Composition id="ClipRush027" component={ClipRush027} durationInFrames={1105} fps={30} width={1080} height={1920} />
      <Composition
        id="ClipRush026"
        component={ClipRush026}
        durationInFrames={1410}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="ClipRush025"
        component={Weather025}
        durationInFrames={1480}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="ClipRush025Rdr2"
        component={ClipRush025}
        durationInFrames={2100}
        fps={60}
        width={1080}
        height={1920}
        defaultProps={rdr2Preset}
      />
      <Composition
        id="WebcamTopGameplayBottom"
        component={WebcamTopGameplayBottom}
        durationInFrames={2100}
        fps={60}
        width={1080}
        height={1920}
        calculateMetadata={({props}) => ({durationInFrames: Math.round(props.durationSeconds * 60)})}
        defaultProps={{
          src: 'videos/biblioteca/alanzoka/rdr2-alan.mp4',
          sourceSize: {width: 1920, height: 1080},
          startSeconds: 875,
          durationSeconds: 35,
          webcamRegion: {x: 1473, y: 9, w: 435, h: 252},
          gameplayRegion: {x: 0, y: 160, w: 1465, h: 920},
          webcamHeightRatio: 0.4,
          webcamFocus: {x: 1649.25, y: 151.5},
        }}
      />
      <Composition
        id="ClipRush024"
        component={ClipRush024}
        durationInFrames={1627}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="ClipRush023"
        component={ClipRush023}
        durationInFrames={1221}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="ClipRush022"
        component={ClipRush022}
        durationInFrames={1456}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="ClipRush021"
        component={ClipRush021}
        durationInFrames={1377}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="ClipRush020"
        component={ClipRush020}
        durationInFrames={1290}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
