import { useState } from "react";
import type { CatalogScene, Project } from "../../shared/model";

export function CatalogSearch({
  projectId,
  busy,
  save,
  onSaved,
}: {
  projectId: string;
  busy: boolean;
  save: () => Promise<Project | undefined>;
  onSaved: (p: Project) => void;
}) {
  const [query, setQuery] = useState("");
  const [scenes, setScenes] = useState<CatalogScene[]>([]);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const run = async (action: () => Promise<void>) => {
    setWorking(true);
    setError("");
    try {
      await action();
    } catch (error) {
      setError(String(error));
    } finally {
      setWorking(false);
    }
  };
  return (
    <details className="catalog-search">
      <summary>Buscar cenas no catálogo GTA 6</summary>
      <div className="row production-controls">
        <input
          aria-label="Buscar cenas"
          value={query}
          placeholder="Ex. praia ou jacaré|crocodilo"
          maxLength={160}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          disabled={busy || working || !query.trim()}
          onClick={() =>
            void run(async () =>
              setScenes(await window.cliprush.searchCatalog(query)),
            )
          }
        >
          Buscar cenas
        </button>
      </div>
      <p className="hint">
        Descrições geradas por IA. Confira o trecho no preview antes de usá-lo
        como prova visual.
      </p>
      {scenes.map((scene) => (
        <article key={scene.id} className="catalog-candidate">
          {scene.thumbnail && (
            <img src={scene.thumbnail} alt="" loading="lazy" />
          )}
          <strong>{scene.name}</strong>
          <span>
            {scene.startSeconds.toFixed(3)}s — {scene.endSeconds.toFixed(3)}s
          </span>
          <p>{scene.description}</p>
          <button
            disabled={busy || working}
            onClick={() =>
              void run(async () => {
                const saved = await save();
                if (saved)
                  onSaved(
                    await window.cliprush.useCatalogScene(projectId, scene.id),
                  );
              })
            }
          >
            Usar trecho
          </button>
        </article>
      ))}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </details>
  );
}
