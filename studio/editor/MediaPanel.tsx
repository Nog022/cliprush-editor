import type { Asset, ImportMode, Project } from "../../shared/model";

export function MediaPanel({
  project,
  busy,
  mode,
  onMode,
  onImport,
  onAdd,
  onRelink,
}: {
  project: Project;
  busy: boolean;
  mode: ImportMode;
  onMode: (mode: ImportMode) => void;
  onImport: () => void;
  onAdd: (asset: Asset) => void;
  onRelink: (asset: Asset) => void;
}) {
  return (
    <section className="panel media-panel">
      <h3>Arquivos do projeto</h3>
      <select
        aria-label="Modo de importação"
        value={mode}
        disabled={busy}
        onChange={(e) => onMode(e.target.value as ImportMode)}
      >
        <option value="copy">Copiar para biblioteca</option>
        <option value="reference">Referenciar original</option>
      </select>
      <button className="primary full-width" disabled={busy} onClick={onImport}>
        ＋ Importar mídia
      </button>
      <p className="hint">
        Imagens, vídeos, áudios e SRT/VTT.
        <br />
        Seleção múltipla pelo Windows.
      </p>
      <div className="media-list">
        {project.assets.map((asset) => (
          <article className="asset" key={asset.id}>
            {(asset.thumbnail || asset.kind === "image") && !asset.missing ? (
              <img
                src={`cliprush://app/media/${project.id}/${asset.id}${asset.thumbnail ? "/thumbnail" : ""}`}
                alt=""
                loading="lazy"
              />
            ) : (
              <span className="asset-icon">
                {asset.kind === "audio"
                  ? "♫"
                  : asset.kind === "caption"
                    ? "CC"
                    : "▸"}
              </span>
            )}
            <div>
              <strong title={asset.name}>{asset.name}</strong>
              <small>
                {asset.kind} · {(asset.bytes / 1024 ** 2).toFixed(1)} MB
                {asset.duration
                  ? ` · ${asset.duration.toFixed(1)}s`
                  : asset.kind === "audio" || asset.kind === "video"
                    ? " · duração indisponível"
                    : ""}
              </small>
              {asset.missing && (
                <small className="danger">Arquivo ausente</small>
              )}
              <div className="row">
                <button
                  disabled={
                    busy ||
                    asset.missing ||
                    asset.kind === "caption" ||
                    ((asset.kind === "video" || asset.kind === "audio") &&
                      !asset.duration)
                  }
                  title={
                    asset.kind === "caption"
                      ? "Legendas editáveis serão implementadas na Fase 3"
                      : "Adicionar ao preview"
                  }
                  onClick={() => onAdd(asset)}
                >
                  Adicionar
                </button>
                <button
                  disabled={busy}
                  title="Localizar novamente"
                  aria-label={`Localizar ${asset.name}`}
                  onClick={() => onRelink(asset)}
                >
                  ⌕
                </button>
              </div>
            </div>
          </article>
        ))}
        {!project.assets.length && (
          <p className="empty">Suas mídias aparecerão aqui.</p>
        )}
      </div>
    </section>
  );
}
