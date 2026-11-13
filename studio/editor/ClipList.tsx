import type { Clip, Project } from "../../shared/model";
export function ClipList({
  project,
  busy,
  onEdit,
}: {
  project: Project;
  busy: boolean;
  onEdit: (project: Project) => void;
}) {
  const update = (clip: Clip, patch: Partial<Clip>) => {
    const next = { ...clip, ...patch };
    onEdit({
      ...project,
      durationInFrames: Math.max(
        project.durationInFrames,
        next.from + next.durationInFrames,
      ),
      clips: project.clips.map((c) => (c.id === clip.id ? next : c)),
    });
  };
  return (
    <section className="panel clip-panel">
      <div className="section-heading">
        <h3>Montagem do preview</h3>
        <span className="muted">
          Tempos em segundos · imagens e vídeos em sequência · áudio sobreposto
        </span>
      </div>
      {project.clips.map((clip) => (
        <div className="clip-row" key={clip.id}>
          <strong>
            {project.assets.find((a) => a.id === clip.assetId)?.name}
          </strong>
          <label>
            Início
            <input
              disabled={busy}
              aria-label={`Início ${clip.id}`}
              type="number"
              min="0"
              step={1 / project.fps}
              value={Number((clip.from / project.fps).toFixed(3))}
              onChange={(e) =>
                update(clip, {
                  from: Math.max(
                    0,
                    Math.round(Number(e.target.value) * project.fps),
                  ),
                })
              }
            />
          </label>
          <label>
            Duração
            <input
              disabled={busy}
              aria-label={`Duração ${clip.id}`}
              type="number"
              min={1 / project.fps}
              step={1 / project.fps}
              value={Number((clip.durationInFrames / project.fps).toFixed(3))}
              onChange={(e) =>
                update(clip, {
                  durationInFrames: Math.max(
                    1,
                    Math.round(Number(e.target.value) * project.fps),
                  ),
                })
              }
            />
          </label>
          <label>
            Trecho de origem
            <input
              disabled={busy}
              aria-label={`Timestamp ${clip.id}`}
              type="number"
              min="0"
              step={1 / project.fps}
              value={(clip.trimBefore ?? 0) / project.fps}
              onChange={(e) =>
                update(clip, {
                  trimBefore: Math.max(
                    0,
                    Math.round(Number(e.target.value) * project.fps),
                  ),
                })
              }
            />
          </label>
          <label>
            Volume
            <input
              disabled={busy}
              aria-label={`Volume ${clip.id}`}
              type="number"
              min="0"
              max="2"
              step="0.1"
              value={clip.volume}
              onChange={(e) =>
                update(clip, {
                  volume: Math.min(2, Math.max(0, Number(e.target.value))),
                })
              }
            />
          </label>
          <button
            aria-label={`Remover clipe ${clip.id}`}
            disabled={busy}
            onClick={() =>
              onEdit({
                ...project,
                clips: project.clips.filter((c) => c.id !== clip.id),
              })
            }
          >
            Remover
          </button>
        </div>
      ))}
      {!project.clips.length && (
        <p className="muted">
          Importe arquivos e clique em Adicionar para montar o preview.
        </p>
      )}
    </section>
  );
}
