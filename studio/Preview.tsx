import { useCallback, useEffect, useRef, useState } from "react";
import { Player, type PlayerRef } from "@remotion/player";
import type { Project } from "../shared/model";
import type { LegacyComposition } from "./legacy";
import { ProjectComposition } from "./ProjectComposition";
export { mediaURL } from "./ProjectComposition";

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
  const onFrame = useCallback((event: {detail: {frame: number}}) => setFrame(event.detail.frame), []);
  // Player can assign its ref after its asynchronous initialization. Subscribe
  // when the instance is assigned, rather than once before it is available.
  const bindPlayer = useCallback((player: PlayerRef | null) => {
    ref.current?.removeEventListener('frameupdate', onFrame);
    ref.current = player;
    player?.addEventListener('frameupdate', onFrame);
  }, [onFrame]);
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
  if (error)
    return (
      <div className="error" role="alert">
        Falha no preview: {error}
      </div>
    );
  if (!spec)
    return <div className="empty">Carregando composição e metadados…</div>;
  const common = {
    ref: bindPlayer,
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
