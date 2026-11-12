import { useEffect, useRef, useState } from "react";
import { Player, type PlayerRef } from "@remotion/player";
import { AbsoluteFill, Img, Sequence } from "remotion";
import { Audio, Video } from "@remotion/media";
import type { Asset, Project } from "../shared/model";
import type { LegacyComposition } from "./legacy";

export const mediaURL = (projectId: string, asset: Asset, thumbnail = false) =>
  `cliprush://app/media/${projectId}/${asset.id}${thumbnail ? "/thumbnail" : ""}`;

function ProjectComposition({ project }: { project: Project }) {
  return (
    <AbsoluteFill style={{ backgroundColor: "#10141d" }}>
      {project.clips.length === 0 && (
        <AbsoluteFill
          style={{
            alignItems: "center",
            justifyContent: "center",
            color: "#e6eaf1",
            fontFamily: "Segoe UI, sans-serif",
            padding: 70,
            textAlign: "center",
            fontSize: project.width / 20,
          }}
        >
          <div
            style={{
              color: "#b5f36b",
              fontSize: project.width / 50,
              letterSpacing: 8,
              marginBottom: 25,
            }}
          >
            CLIPRUSH STUDIO
          </div>
          {project.name}
        </AbsoluteFill>
      )}
      {project.clips.map((clip) => {
        const asset = project.assets.find((item) => item.id === clip.assetId);
        if (!asset) return null;
        const style = {
          width: "100%",
          height: "100%",
          objectFit: "contain" as const,
        };
        return (
          <Sequence
            key={clip.id}
            from={clip.from}
            durationInFrames={clip.durationInFrames}
          >
            {asset.missing ? (
              <AbsoluteFill
                style={{
                  background: "#302024",
                  color: "white",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 35,
                }}
              >
                Mídia ausente: {asset.name}
              </AbsoluteFill>
            ) : asset.kind === "image" ? (
              <Img src={mediaURL(project.id, asset)} style={style} />
            ) : asset.kind === "video" ? (
              <Video
                src={mediaURL(project.id, asset)}
                style={style}
                volume={clip.volume}
              />
            ) : asset.kind === "audio" ? (
              <Audio src={mediaURL(project.id, asset)} volume={clip.volume} />
            ) : null}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
}

export default function Preview({
  project,
  legacyId,
}: {
  project?: Project;
  legacyId?: string;
}) {
  const ref = useRef<PlayerRef>(null);
  const [legacy, setLegacy] = useState<LegacyComposition>();
  const [error, setError] = useState("");
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLegacy(undefined);
    setError("");
    setFrame(0);
    if (!legacyId) return () => controller.abort();
    void import("./legacy")
      .then(async ({ legacyCompositions }) => {
        const composition = legacyCompositions.find((c) => c.id === legacyId);
        if (!composition)
          throw new Error(
            "Composição não encontrada nesta versão do aplicativo.",
          );
        const props = composition.defaultProps ?? {};
        const metadata = await composition.calculateMetadata?.({
          defaultProps: props,
          props,
          abortSignal: controller.signal,
          compositionId: composition.id,
          isRendering: false,
        });
        if (!controller.signal.aborted)
          setLegacy({
            ...composition,
            ...metadata,
            defaultProps: metadata?.props ?? props,
          });
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted)
          setError(reason instanceof Error ? reason.message : String(reason));
      });
    return () => controller.abort();
  }, [legacyId]);
  const spec = project ?? legacy;
  useEffect(() => {
    const player = ref.current;
    if (!player) return;
    const listener = (event: { detail: { frame: number } }) =>
      setFrame(event.detail.frame);
    player.addEventListener("frameupdate", listener);
    return () => player.removeEventListener("frameupdate", listener);
  }, [spec?.id]);
  if (error)
    return (
      <div className="error" role="alert">
        Falha no preview: {error}
      </div>
    );
  if (!spec)
    return <div className="empty">Carregando composição e metadados…</div>;
  const common = {
    ref,
    durationInFrames: spec.durationInFrames,
    compositionWidth: spec.width,
    compositionHeight: spec.height,
    fps: spec.fps,
    controls: true,
    style: { width: "100%", height: "100%" },
    renderLoading: () => <div className="empty">Carregando mídia…</div>,
    errorFallback: ({ error: reason }: { error: Error }) => (
      <div className="error">
        Mídia indisponível ou codec incompatível: {reason.message}
      </div>
    ),
  };
  return (
    <div className="preview-shell">
      <div className="player-stage" data-testid="player-stage">
        {project ? (
          <Player
            {...common}
            component={ProjectComposition}
            inputProps={{ project }}
          />
        ) : legacy ? (
          <Player
            {...common}
            component={legacy.component}
            inputProps={legacy.defaultProps ?? {}}
          />
        ) : null}
      </div>
      <div className="transport">
        <button
          onClick={() => ref.current?.seekTo(Math.max(0, frame - 1))}
          aria-label="Quadro anterior"
        >
          ←
        </button>
        <span>
          {(frame / spec.fps).toFixed(2)}s{" "}
          <span className="muted">
            / {(spec.durationInFrames / spec.fps).toFixed(2)}s · quadro {frame}
          </span>
        </span>
        <input
          className="seek-frame"
          aria-label="Ir para quadro"
          type="number"
          min={0}
          max={spec.durationInFrames - 1}
          value={frame}
          onChange={(event) =>
            ref.current?.seekTo(
              Math.max(
                0,
                Math.min(
                  spec.durationInFrames - 1,
                  Math.round(Number(event.target.value)),
                ),
              ),
            )
          }
        />
        <button
          onClick={() =>
            ref.current?.seekTo(Math.min(spec.durationInFrames - 1, frame + 1))
          }
          aria-label="Próximo quadro"
        >
          →
        </button>
      </div>
    </div>
  );
}
