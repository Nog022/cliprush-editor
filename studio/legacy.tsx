import {
  Children,
  Fragment,
  isValidElement,
  type ComponentType,
  type ReactNode,
} from "react";
import { Composition, type CalculateMetadataFunction } from "remotion";
import { RemotionRoot } from "../src/Root";
import { MyComposition } from "../src/Composition";
import type { LegacyInfo } from "../shared/model";

export interface LegacyComposition extends LegacyInfo {
  component: ComponentType<Record<string, unknown>>;
  defaultProps?: Record<string, unknown>;
  calculateMetadata?: CalculateMetadataFunction<Record<string, unknown>>;
}
const entries: LegacyComposition[] = [];
function collect(node: ReactNode) {
  Children.forEach(node, (child) => {
    if (!isValidElement<Record<string, unknown>>(child)) return;
    if (child.type === Composition) {
      const props = child.props as unknown as Omit<LegacyComposition, "name">;
      entries.push({
        ...props,
        name: props.id === "MyComp" ? "Template original · MyComp" : props.id,
      });
    } else if (child.type === Fragment)
      collect(child.props.children as ReactNode);
    else if (child.type === MyComposition) collect(MyComposition());
    else
      throw new Error(
        "Novo agrupador no Root: atualize o adaptador de biblioteca sem executar componentes de vídeo.",
      );
  });
}
// Read authored registrations; never rewrite Root.tsx or invoke video components.
collect(RemotionRoot({}) as ReactNode);
if (new Set(entries.map((entry) => entry.id)).size !== entries.length)
  throw new Error("Composições com IDs duplicados.");
export const legacyCompositions = entries;
