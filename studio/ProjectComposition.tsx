import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  Sequence,
  useCurrentFrame,
  Video,
} from "remotion";
import type { Clip, Project, Scene } from "../shared/model";
import {WebcamTopGameplayBottom} from '../src/templates/webcam_top_gameplay_bottom';
import {LIVE_PRESET, LIVE_LAYOUT, liveSourceKeys} from '../shared/live-preset';
import {DEFAULT_GAMEPLAY_FOCUS} from '../shared/gameplay-focus';
import {LiveOverlay} from './LiveOverlay';
import {NARRATED_PRESET} from '../shared/narrated-preset';
import {NarratedFootage, NarratedOverlay, NarratedScene} from './ClipRushNarrated';

export const mediaURL = (
  projectId: string,
  asset: Project["assets"][number],
  thumbnail = false,
) =>
  `cliprush://app/media/${projectId}/${asset.id}${thumbnail ? "/thumbnail" : ""}`;

function ClipContent({
  clip,
  project,
  sources,
}: {
  clip: Clip;
  project: Project;
  sources?: Record<string, string>;
}) {
  const frame = useCurrentFrame();
  const asset = project.assets.find((a) => a.id === clip.assetId);
  if (!asset) return null;
  if (asset.missing) throw new Error(`Mídia ausente ${asset.name}`);
  const src = sources?.[asset.id] ?? mediaURL(project.id, asset);
  const style = {
    width: "100%",
    height: "100%",
    objectFit: "contain" as const,
  };
  if (asset.kind === "audio")
    return (
      <Audio src={src} volume={clip.volume} trimBefore={clip.trimBefore ?? 0} />
    );
  if (project.visualPreset === NARRATED_PRESET && asset.kind === 'video')
    return <NarratedFootage clip={clip} asset={asset} src={src}/>;
  if (project.visualPreset === LIVE_PRESET && asset.kind === 'video') {
    const framing = clip.liveFraming;
    if (!framing || framing.startFrame !== (clip.trimBefore ?? 0) ||
        framing.durationInFrames !== clip.durationInFrames || framing.fps !== project.fps) {
      return <AbsoluteFill style={{color: 'white', padding: 180, fontSize: 42}}>
        Analise o trecho e aplique o enquadramento ao preset.
      </AbsoluteFill>;
    }
    const keys = liveSourceKeys(clip.id);
    const prepared = sources?.[keys.video];
    return <WebcamTopGameplayBottom {...framing} src={prepared ?? src} audioSrc={sources?.[keys.audio]}
      gameplayFocus={framing.gameplayFocus ?? DEFAULT_GAMEPLAY_FOCUS}
      startSeconds={prepared ? 0 : (clip.trimBefore ?? 0) / project.fps}
      durationSeconds={clip.durationInFrames / project.fps} webcamHeightRatio={0.4}
      layout={LIVE_LAYOUT} volume={clip.volume} />;
  }
  return (
    <AbsoluteFill
      style={{
        opacity:
          clip.animation === "fade"
            ? interpolate(
                frame,
                [
                  0,
                  Math.max(
                    1,
                    Math.min(project.fps / 3, clip.durationInFrames / 2),
                  ),
                ],
                [0, 1],
                { extrapolateRight: "clamp" },
              )
            : 1,
        scale:
          clip.animation === "zoom"
            ? interpolate(
                frame,
                [0, Math.max(1, clip.durationInFrames - 1)],
                [1, 1.12],
                { extrapolateRight: "clamp" },
              )
            : 1,
      }}
    >
      {asset.kind === "image" ? (
        <Img src={src} style={style} />
      ) : (
        <Video
          src={src}
          style={style}
          volume={clip.volume}
          trimBefore={clip.trimBefore ?? 0}
        />
      )}
    </AbsoluteFill>
  );
}

function SceneContent({
  scene,
  width,
  fps,
}: {
  scene: Scene;
  width: number;
  fps: number;
}) {
  const frame = useCurrentFrame();
  const progress = interpolate(
    frame,
    [0, Math.max(1, Math.min(fps / 2, scene.durationInFrames / 2))],
    [0, 1],
    { extrapolateRight: "clamp" },
  );
  return (
    <AbsoluteFill
      style={{
        backgroundColor: scene.background,
        justifyContent: "center",
        alignItems: "center",
        padding: width * 0.08,
        textAlign: "center",
        color: "#ffffff",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          opacity: scene.animation === "fade" ? progress : 1,
          scale: scene.animation === "zoom" ? 0.85 + progress * 0.15 : 1,
          translate:
            scene.animation === "slide" ? `0 ${(1 - progress) * 80}px` : "0 0",
        }}
      >
        {scene.shape !== "none" && (
          <div
            style={{
              margin: "0 auto 32px",
              width: width * 0.15,
              height: width * 0.15,
              borderRadius: scene.shape === "circle" ? "50%" : 12,
              backgroundColor: scene.accent,
            }}
          />
        )}
        <div
          style={{
            fontSize: width * 0.065,
            fontWeight: 800,
            overflowWrap: "anywhere",
          }}
        >
          {scene.title}
        </div>
        <div
          style={{
            fontSize: width * 0.035,
            marginTop: 24,
            color: scene.accent,
            overflowWrap: "anywhere",
          }}
        >
          {scene.subtitle}
        </div>
      </div>
    </AbsoluteFill>
  );
}

function Captions({ project }: { project: Project }) {
  const frame = useCurrentFrame();
  const ms = (frame / project.fps) * 1000;
  const active = project.captions.filter(
    (c) => c.startMs <= ms && c.endMs > ms,
  );
  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        padding: "8%",
        pointerEvents: "none",
      }}
    >
      {active.map((caption, index) => (
        <div
          key={index}
          style={{
            background: "rgba(0,0,0,.8)",
            padding: "12px 24px",
            borderRadius: 10,
            color: "white",
            fontFamily: "Arial, sans-serif",
            fontSize: project.width * 0.045,
            textAlign: "center",
            whiteSpace: "pre-wrap",
            overflowWrap: "anywhere",
          }}
        >
          {caption.text}
        </div>
      ))}
    </AbsoluteFill>
  );
}

export function ProjectComposition({
  project,
  sources,
}: {
  project: Project;
  sources?: Record<string, string>;
}) {
  return (
    <AbsoluteFill style={{ backgroundColor: "#10141d", overflow: "hidden" }}>
      {!project.clips.length && !project.scenes.length && (
        <AbsoluteFill
          style={{
            color: "white",
            alignItems: "center",
            justifyContent: "center",
            fontSize: project.width / 20,
          }}
        >
          {project.name}
        </AbsoluteFill>
      )}
      {project.visualPreset !== NARRATED_PRESET && project.scenes.map((scene) => (
        <Sequence
          key={scene.id}
          from={scene.from}
          durationInFrames={scene.durationInFrames}
        >
          <SceneContent scene={scene} width={project.width} fps={project.fps} />
        </Sequence>
      ))}
      {project.clips.map((clip) => (
        <Sequence
          key={clip.id}
          from={clip.from}
          durationInFrames={clip.durationInFrames}
          premountFor={project.visualPreset === NARRATED_PRESET ? 12 : 0}
        >
          <ClipContent clip={clip} project={project} sources={sources} />
        </Sequence>
      ))}
      {project.visualPreset === NARRATED_PRESET && <>
        <NarratedOverlay project={project}/>
        {project.scenes.map(scene => <Sequence key={scene.id} name={scene.name} from={scene.from} durationInFrames={scene.durationInFrames}>
          <NarratedScene scene={scene}/>
        </Sequence>)}
      </>}
      {project.visualPreset === NARRATED_PRESET ? null : project.visualPreset === LIVE_PRESET
        ? <LiveOverlay caption={project.customCaption ?? ''} />
        : <Captions project={project} />}
    </AbsoluteFill>
  );
}
