import { config } from "@remotion/eslint-config-flat";

export default [
  ...config,
  {
    // These are desktop UI thumbnails, not frames rendered by Remotion.
    files: ["studio/App.tsx", "studio/editor/MediaPanel.tsx", "studio/editor/Library.tsx", "studio/editor/CatalogSearch.tsx"],
    rules: { "@remotion/warn-native-media-tag": "off" },
  },
];
