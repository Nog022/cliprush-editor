// Isolated test entry: these compositions are not registered in the Studio app.
import React from "react";
import { Composition, Freeze, registerRoot, useCurrentFrame } from "remotion";
import { WorldCanvas } from "../../src/videos/video-002/components/WorldCanvas";
import { originalFrameForNarration } from "../../src/videos/video-002/narrado/timing";
import { WorldCanvasV2 } from "../../src/videos/video-002/narrado-v2/WorldCanvasV2";

const LegacyWorld = () => {
  const frame = useCurrentFrame();
  return (
    <Freeze frame={originalFrameForNarration(frame, 731)}>
      <WorldCanvas />
    </Freeze>
  );
};
registerRoot(() => (
  <>
    <Composition
      id="LegacyWorldAudit"
      component={LegacyWorld}
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={731}
    />
    <Composition
      id="V2WorldAudit"
      component={WorldCanvasV2}
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={731}
    />
  </>
));
