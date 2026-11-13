import type { Project } from "../../shared/model";
export function ProjectProperties({
  project,
  busy,
  onEdit,
}: {
  project: Project;
  busy: boolean;
  onEdit: (project: Project) => void;
}) {
  return (
    <section className="panel properties">
      <h3>Projeto</h3>
      <label>
        Nome
        <input
          disabled={busy}
          value={project.name}
          maxLength={160}
          onChange={(e) => onEdit({ ...project, name: e.target.value })}
        />
      </label>
      <label>
        Idioma
        <input
          disabled={busy}
          value={project.language}
          maxLength={35}
          onChange={(e) => onEdit({ ...project, language: e.target.value })}
        />
      </label>
      <label>
        Categoria
        <input
          disabled={busy}
          value={project.category}
          maxLength={80}
          onChange={(e) => onEdit({ ...project, category: e.target.value })}
        />
      </label>
      <dl>
        <dt>Resolução</dt>
        <dd>
          {project.width} × {project.height}
        </dd>
        <dt>Taxa de quadros</dt>
        <dd>{project.fps} fps</dd>
        <dt>Duração</dt>
        <dd>{(project.durationInFrames / project.fps).toFixed(2)}s</dd>
        <dt>Criado</dt>
        <dd>{new Date(project.createdAt).toLocaleDateString("pt-BR")}</dd>
      </dl>
      <p className="hint">
        A montagem controla o Player e a exportação MP4. Use o prompt para
        ajustar cenas e animações.
      </p>
    </section>
  );
}
