import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { ClipRush020 } from "./videos/video-020/ClipRush020";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
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
