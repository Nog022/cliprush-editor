import { Sequence } from "remotion";
import { AnimatedTitle } from "../components/AnimatedTitle";

export const IntroScene = () => (
  <Sequence
    name="Gancho · como chegamos até aqui"
    from={32}
    durationInFrames={58}
    layout="none"
  >
    <AnimatedTitle
      lines={["COMO", "CHEGAMOS", "ATÉ AQUI?"]}
      accentLine={2}
      top={350}
      size={106}
      hold={58}
    />
  </Sequence>
);
