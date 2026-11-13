import { useState } from "react";
import type { Project } from "../../shared/model";

export function Library({
  projects,
  selected,
  busy,
  onSelect,
  onOpen,
  onImport,
  onCategory,
  category,
  onReuse,
  onCategorize,
}: {
  projects: Project[];
  selected?: Project;
  busy: boolean;
  onSelect: (p: Project) => void;
  onOpen: (p: Project) => void;
  onImport: () => void;
  category: string;
  onCategory: (value: string) => void;
  onReuse: (source: string, asset: string) => void;
  onCategorize: (source: string, asset: string, category: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const categories = [
    ...new Set([
      "GTA 6",
      "GTA 5",
      "Red Dead Redemption 2",
      ...projects.flatMap((p) => p.assets.map((a) => a.category ?? p.category)),
    ]),
  ];
  const seen = new Set<string>();
  const assets = projects
    .flatMap((p) => p.assets.map((asset) => ({ project: p, asset })))
    .filter(({ asset }) => {
      if (seen.has(asset.hash)) return false;
      seen.add(asset.hash);
      return true;
    })
    .filter(
      ({ project, asset }) =>
        asset.name.toLowerCase().includes(search.toLowerCase()) &&
        (!filter || (asset.category ?? project.category) === filter),
    );
  return (
    <>
      <h2>Mídias do canal</h2>
      <div className="row production-controls">
        <label>
          Projeto de destino
          <select
            aria-label="Projeto de destino"
            value={selected?.id ?? ""}
            disabled={busy}
            onChange={(e) => {
              const project = projects.find((p) => p.id === e.target.value);
              if (project) onSelect(project);
            }}
          >
            <option value="">Selecione um projeto</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Categoria da importação
          <input
            value={category}
            maxLength={80}
            list="library-categories"
            disabled={busy}
            onChange={(e) => onCategory(e.target.value)}
          />
        </label>
        <button
          className="primary"
          disabled={busy || !selected}
          onClick={onImport}
        >
          Importar mídia
        </button>
        <input
          aria-label="Pesquisar biblioteca"
          placeholder="Pesquisar mídia"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          aria-label="Filtrar biblioteca"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">Todas as categorias</option>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <datalist id="library-categories">
          {categories.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </div>
      <div className="asset-grid">
        {assets.map(({ project, asset }) => (
          <article className="panel library-asset" key={asset.hash}>
            <button disabled={busy} onClick={() => onOpen(project)}>
              {asset.thumbnail || asset.kind === "image" ? (
                <img
                  src={`cliprush://app/media/${project.id}/${asset.id}${asset.thumbnail ? "/thumbnail" : ""}`}
                  loading="lazy"
                  alt=""
                />
              ) : (
                <span className="asset-icon">
                  {asset.kind === "audio" ? "♫" : "▸"}
                </span>
              )}
              <strong>{asset.name}</strong>
            </button>
            <input
              aria-label={`Categoria biblioteca ${asset.name}`}
              list="library-categories"
              defaultValue={asset.category ?? project.category}
              key={asset.category ?? project.category}
              maxLength={80}
              disabled={busy}
              onBlur={(e) => {
                if (
                  e.target.value.trim() &&
                  e.target.value !== (asset.category ?? project.category)
                )
                  onCategorize(project.id, asset.id, e.target.value);
              }}
            />
            <button
              disabled={
                busy ||
                !selected ||
                selected.assets.some((a) => a.hash === asset.hash)
              }
              onClick={() => onReuse(project.id, asset.id)}
            >
              Usar no projeto
            </button>
          </article>
        ))}
      </div>
      {!assets.length && (
        <p className="empty">Importe mídias para este canal.</p>
      )}
    </>
  );
}
