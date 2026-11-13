import type { Asset, ImportMode, Project } from "../../shared/model";
import { useState } from "react";

export function MediaPanel({
  project,
  busy,
  mode,
  onMode,
  onImport,
  onAdd,
  onRelink,
  category,
  onCategory,
  library,
  onReuse,
  onCategorize,
}: {
  project: Project;
  busy: boolean;
  mode: ImportMode;
  onMode: (mode: ImportMode) => void;
  onImport: () => void;
  onAdd: (asset: Asset) => void;
  onRelink: (asset: Asset) => void;
  category: string;
  onCategory: (category: string) => void;
  library: Project[];
  onReuse: (projectId: string, assetId: string) => void;
  onCategorize: (assetId: string, category: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const categories = [
    ...new Set([
      "GTA 6",
      "GTA 5",
      "Red Dead Redemption 2",
      ...library.flatMap((p) => p.assets.map((a) => a.category ?? p.category)),
    ]),
  ];
  return (
    <section className="panel media-panel">
      <h3>Arquivos do projeto</h3>
      <label>
        Categoria da importação
        <input
          aria-label="Categoria da importação"
          list="media-categories"
          value={category}
          maxLength={80}
          disabled={busy}
          onChange={(e) => onCategory(e.target.value)}
        />
      </label>
      <datalist id="media-categories">
        {categories.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
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
      <input
        placeholder="Pesquisar mídia"
        aria-label="Pesquisar mídia"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <select
        aria-label="Filtrar categoria"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      >
        <option value="">Todas as categorias</option>
        {categories.map((c) => (
          <option key={c}>{c}</option>
        ))}
      </select>
      <details>
        <summary>Reutilizar da biblioteca</summary>
        {library
          .filter(
            (p) => p.channelId === project.channelId && p.id !== project.id,
          )
          .flatMap((p) =>
            p.assets
              .filter(
                (a) =>
                  !project.assets.some(
                    (existing) => existing.hash === a.hash,
                  ) &&
                  a.name.toLowerCase().includes(search.toLowerCase()) &&
                  (!filter || (a.category ?? p.category) === filter),
              )
              .map((a) => (
                <button
                  disabled={busy}
                  key={`${p.id}-${a.id}`}
                  onClick={() => onReuse(p.id, a.id)}
                >
                  {a.name} · {a.category ?? p.category}
                </button>
              )),
          )}
      </details>
      <div className="media-list">
        {project.assets
          .filter(
            (a) =>
              a.name.toLowerCase().includes(search.toLowerCase()) &&
              (!filter || (a.category ?? project.category) === filter),
          )
          .map((asset) => (
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
                <input
                  aria-label={`Categoria ${asset.name}`}
                  list="media-categories"
                  disabled={busy}
                  defaultValue={asset.category ?? project.category}
                  key={asset.category ?? project.category}
                  maxLength={80}
                  onBlur={(e) => {
                    if (
                      e.target.value.trim() &&
                      e.target.value !== (asset.category ?? project.category)
                    )
                      onCategorize(asset.id, e.target.value);
                  }}
                />
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
