import { useEffect, useRef, useState } from "react";
import type {
  CodexApproval,
  CodexStatus,
  GenerationSettings,
  ProductionJob,
  Project,
  RenderJob,
} from "../../shared/model";

const labels = {
  preparing: "Preparando",
  generating: "Gerando",
  validating: "Validando",
  rendering: "Renderizando",
  completed: "Concluído",
  failed: "Falhou",
  cancelled: "Cancelado",
};
export function ProductionPanel({
  project,
  onEdit,
  save,
  onSaved,
  onBusy,
}: {
  project: Project;
  onEdit: (p: Project) => void;
  save: () => Promise<Project | undefined>;
  onSaved: (p: Project) => void;
  onBusy: (busy: boolean) => void;
}) {
  const [connection, setConnection] = useState<CodexStatus>();
  const [job, setJob] = useState<ProductionJob>();
  const [approvals, setApprovals] = useState<CodexApproval[]>([]);
  const [renders, setRenders] = useState<RenderJob[]>([]);
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);
  const [voicePreview, setVoicePreview] = useState("");
  const [voiceMessage, setVoiceMessage] = useState("");
  useEffect(() => () => { if (voicePreview) URL.revokeObjectURL(voicePreview); }, [voicePreview]);
  const lastStatus = useRef<string | undefined>(undefined);
  const settings = project.generation ?? {
    prompt: "",
    references: [],
    autoRender: false,
  };
  const running = Boolean(
    job && !["completed", "failed", "cancelled"].includes(job.status),
  );
  const update = (patch: Partial<GenerationSettings>) =>
    onEdit({ ...project, generation: { ...settings, ...patch } });
  const act = async (action: () => Promise<unknown>) => {
    setWorking(true);
    setError("");
    try {
      await action();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message.replace(/^Error invoking remote method '[^']+': Error: /, "") : String(reason));
    } finally {
      setWorking(false);
    }
  };
  const connect = async () =>
    setConnection(await window.cliprush.codexStatus());
  useEffect(() => {
    void act(connect);
  }, []);
  useEffect(() => {
    let disposed = false;
    let timer: ReturnType<typeof setTimeout>;
    let shouldPoll = running || renders.some((r) => ["queued", "rendering"].includes(r.status));
    const poll = async () => {
      try {
        const [status, jobs] = await Promise.all([
          window.cliprush.productionStatus(project.id),
          window.cliprush.listRenders(),
        ]);
        if (disposed) return;
        setJob(status.job);
        setApprovals(status.approvals);
        setRenders(jobs.filter((r) => r.projectId === project.id));
        const state = status.job?.status;
        const active = Boolean(
          state && !["completed", "failed", "cancelled"].includes(state),
        );
        shouldPoll = active || jobs.some((r) =>
          r.projectId === project.id && ["queued", "rendering"].includes(r.status),
        );
        onBusy(shouldPoll);
        if (lastStatus.current && lastStatus.current !== state && !active) {
          const workspace = await window.cliprush.workspace();
          if (!disposed) {
            const saved = workspace.projects.find((p) => p.id === project.id);
            if (saved) onSaved(saved);
          }
        }
        lastStatus.current = state;
      } catch (reason) {
        if (!disposed) setError(String(reason));
      } finally {
        if (!disposed && shouldPoll) timer = setTimeout(() => void poll(), 1000);
      }
    };
    void poll();
    return () => {
      disposed = true;
      clearTimeout(timer);
      onBusy(false);
    };
    // Refresh after local actions. Continue polling only while production/export is active.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.id, working]);
  const preferred = settings.model ?? connection?.configuredModel;
  const model = preferred
    ? connection?.models.find(
        (m) => m.model === preferred || m.id === preferred,
      )
    : (connection?.models.find((m) => m.isDefault) ?? connection?.models[0]);
  const efforts = model?.supportedReasoningEfforts ?? [];
  const effort =
    settings.effort ??
    (efforts.some((e) => e.reasoningEffort === "medium")
      ? "medium"
      : model?.defaultReasoningEffort);
  return (
    <section className="panel production-panel">
      <div className="section-heading">
        <h3>Instruções de geração</h3>
        <span className="muted">
          {connection?.connected
            ? connection.authenticated
              ? "Codex conectado"
              : "Autenticação necessária"
            : "Codex desconectado"}
        </span>
      </div>
      <textarea
        aria-label="Prompt de geração"
        placeholder="Descreva o vídeo ou as alterações. Indique cenas, mídias e timestamps."
        value={settings.prompt}
        maxLength={30000}
        disabled={running}
        onChange={(e) => update({ prompt: e.target.value })}
      />
      <div className="row production-controls">
        <button disabled={working || running} onClick={() => void act(async () => {
          const result = await window.cliprush.testElevenVoice();
          setVoicePreview(URL.createObjectURL(new Blob([new Uint8Array(result.audio)], { type: "audio/mpeg" })));
          setVoiceMessage(result.cached ? "Teste recuperado do cache." : "Teste gerado com ElevenLabs.");
        })}>Testar voz Augusto Norte</button>
        <button disabled={working || running} onClick={() => void act(async () => {
          if (await window.cliprush.importElevenCredentials()) setVoiceMessage("Credenciais salvas no armazenamento seguro do sistema.");
        })}>Importar credenciais ElevenLabs</button>
      </div>
      {/* Independent voice preview, outside the Remotion timeline. */}
      {/* eslint-disable-next-line @remotion/warn-native-media-tag */}
      {voicePreview && <audio aria-label="Teste da voz ClipRush" controls src={voicePreview} />}
      {voiceMessage && <p role="status">{voiceMessage}</p>}
      <label>
        Roteiro para narração — Augusto Norte · eleven_v4
        <textarea aria-label="Roteiro para narração" value={settings.narrationScript ?? ""} maxLength={10000} disabled={running}
          placeholder="Cole e revise o texto exato que será narrado. Ao aprovar e gerar, este texto será enviado ao ElevenLabs. Deixe vazio para usar o áudio existente."
          onChange={e => update({ narrationScript: e.target.value })} />
      </label>
      <div className="row production-controls">
        <label>
          Modelo
          <select
            aria-label="Modelo Codex"
            value={model?.model ?? ""}
            disabled={running || !connection?.models.length}
            onChange={(e) => {
              const next = connection?.models.find(
                (m) => m.model === e.target.value,
              );
              const supported =
                next?.supportedReasoningEfforts.map((r) => r.reasoningEffort) ??
                [];
              update({
                model: e.target.value,
                effort: supported.includes("medium")
                  ? "medium"
                  : next?.defaultReasoningEffort,
              });
            }}
          >
            <option value="" disabled>
              Selecione um modelo disponível
            </option>
            {connection?.models.map((m) => (
              <option key={m.id} value={m.model}>
                {m.displayName}
              </option>
            ))}
          </select>
        </label>
        <label>
          Raciocínio
          <select
            aria-label="Esforço de raciocínio"
            value={effort ?? ""}
            disabled={running || !model}
            onChange={(e) => update({ effort: e.target.value })}
          >
            {efforts.map((e) => (
              <option key={e.reasoningEffort} value={e.reasoningEffort}>
                {e.reasoningEffort === "medium" ? "Médio" : e.reasoningEffort}
              </option>
            ))}
          </select>
        </label>
        <label className="row">
          <input
            type="checkbox"
            checked={settings.autoRender}
            disabled={running}
            onChange={(e) => update({ autoRender: e.target.checked })}
          />
          MP4 automático
        </label>
        <button
          disabled={
            working ||
            running ||
            !connection?.authenticated ||
            !model ||
            !settings.prompt.trim()
          }
          className="primary"
          onClick={() =>
            void act(async () => {
              const saved = await save();
              if (saved) {
                await window.cliprush.generate(saved.id);
                setJob({
                  projectId: saved.id,
                  status: "preparing",
                  progress: 0,
                  logs: [],
                });
                onBusy(true);
              }
            })
          }
        >
          {settings.narrationScript?.trim() ? "Aprovar roteiro e gerar vídeo" : "Gerar vídeo"}
        </button>
        <button
          disabled={!running}
          onClick={() =>
            void act(() => window.cliprush.cancelProduction(project.id))
          }
        >
          Cancelar
        </button>
      </div>
      <details>
        <summary>Referências e conexão</summary>
        <div className="row production-controls">
          <button
            disabled={working || running}
            onClick={() =>
              void act(async () => {
                const saved = await save();
                if (saved) {
                  const result = await window.cliprush.attachReferences(
                    saved.id,
                  );
                  if (result) onSaved(result);
                }
              })
            }
          >
            Anexar roteiro / storyboard
          </button>
          <button
            disabled={working || running}
            onClick={() =>
              void act(async () => {
                await window.cliprush.codexLogin();
              })
            }
          >
            Entrar no Codex
          </button>
          <button
            disabled={working || running}
            onClick={() => void act(connect)}
          >
            Atualizar conexão
          </button>
          <button
            disabled={working || running}
            onClick={() =>
              void act(async () => {
                await window.cliprush.chooseCodex();
                await connect();
              })
            }
          >
            Localizar Codex
          </button>
          <button
            disabled={working || running}
            onClick={() =>
              void act(async () => {
                await save();
                onSaved(await window.cliprush.restoreProduction(project.id));
              })
            }
          >
            Restaurar produção anterior
          </button>
        </div>
        {settings.references.map((r, index) => (
          <div className="reference-row" key={index}>
            <details>
              <summary>{r.name}</summary>
              <pre>{r.content}</pre>
            </details>
            <button
              disabled={running}
              aria-label={`Remover referência ${r.name}`}
              onClick={() =>
                update({
                  references: settings.references.filter((_, i) => i !== index),
                })
              }
            >
              Remover
            </button>
          </div>
        ))}
        {connection?.error && <p className="error">{connection.error}</p>}
        {!connection?.connected && (
          <p className="hint">
            Instale o Codex CLI oficial e use Entrar no Codex. Localizar Codex
            permite selecionar seu executável.
          </p>
        )}
      </details>
      {job && (
        <div role="status">
          <strong>{labels[job.status]}</strong>
          <progress max={1} value={job.progress} />
          <details>
            <summary>Logs da produção</summary>
            {job.logs.map((log, i) => (
              <div key={i}>{log}</div>
            ))}
          </details>
          {job.error && <p className="error">{job.error}</p>}
        </div>
      )}
      {approvals.map((approval) => (
        <div className="notice" key={approval.id}>
          <pre>{approval.description}</pre>
          <button
            onClick={() =>
              void act(() => window.cliprush.answerApproval(approval.id, true))
            }
          >
            Aprovar
          </button>
          <button
            onClick={() =>
              void act(() => window.cliprush.answerApproval(approval.id, false))
            }
          >
            Recusar
          </button>
        </div>
      ))}
      <details>
        <summary>Configuração MP4</summary>
        <div className="row production-controls">
          <label>
            Resolução
            <select
              aria-label="Resolução MP4"
              disabled={running}
              value={`${project.exportSettings.width}x${project.exportSettings.height}`}
              onChange={(e) => {
                const [width, height] = e.target.value.split("x").map(Number);
                onEdit({
                  ...project,
                  exportSettings: {
                    ...project.exportSettings,
                    width,
                    height,
                    preset: "custom",
                  },
                });
              }}
            >
              {[
                ...new Set([
                  `${project.exportSettings.width}x${project.exportSettings.height}`,
                  "1080x1920",
                  "1920x1080",
                  "1080x1080",
                ]),
              ].map((size) => (
                <option key={size}>{size}</option>
              ))}
            </select>
          </label>
          <label>
            FPS
            <input
              aria-label="FPS MP4"
              disabled={running}
              type="number"
              min={1}
              max={60}
              value={project.exportSettings.fps}
              onChange={(e) =>
                onEdit({
                  ...project,
                  exportSettings: {
                    ...project.exportSettings,
                    fps: Number(e.target.value),
                  },
                })
              }
            />
          </label>
          <label>
            Qualidade
            <select
              aria-label="Qualidade MP4"
              disabled={running}
              value={project.exportSettings.quality}
              onChange={(e) =>
                onEdit({
                  ...project,
                  exportSettings: {
                    ...project.exportSettings,
                    quality: e.target
                      .value as Project["exportSettings"]["quality"],
                  },
                })
              }
            >
              <option value="draft">Rascunho</option>
              <option value="balanced">Equilibrada</option>
              <option value="high">Alta</option>
            </select>
          </label>
          <label className="row">
            <input
              type="checkbox"
              disabled={running}
              checked={project.exportSettings.audio}
              onChange={(e) =>
                onEdit({
                  ...project,
                  exportSettings: {
                    ...project.exportSettings,
                    audio: e.target.checked,
                  },
                })
              }
            />
            Áudio
          </label>
          <label className="row">
            <input
              type="checkbox"
              disabled={running}
              checked={project.exportSettings.captions}
              onChange={(e) =>
                onEdit({
                  ...project,
                  exportSettings: {
                    ...project.exportSettings,
                    captions: e.target.checked,
                  },
                })
              }
            />
            Legendas
          </label>
        </div>
      </details>
      <div className="row production-controls">
        <button
          disabled={working || running}
          onClick={() =>
            void act(async () => {
              const saved = await save();
              if (saved)
                await window.cliprush.startRender(
                  saved.id,
                  saved.exportSettings,
                  "",
                );
            })
          }
        >
          Exportar MP4
        </button>
        <span className="muted">
          {project.exportSettings.width} × {project.exportSettings.height} ·{" "}
          {project.exportSettings.fps} FPS
        </span>
      </div>
      {renders.slice(0, 5).map((render) => (
        <div className="export-row" key={render.id}>
          <span>
            {render.phase} · {Math.round(render.progress * 100)}%
          </span>
          {render.status === "rendering" ? (
            <button
              onClick={() =>
                void act(() => window.cliprush.cancelRender(render.id))
              }
            >
              Cancelar exportação
            </button>
          ) : render.status === "completed" ? (
            <>
              <button
                onClick={() =>
                  void act(() => window.cliprush.openRender(render.id))
                }
              >
                Reproduzir MP4
              </button>
              <button
                onClick={() =>
                  void act(() => window.cliprush.revealRender(render.id))
                }
              >
                Mostrar arquivo
              </button>
            </>
          ) : (
            <span className="danger">{render.error}</span>
          )}
        </div>
      ))}
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
    </section>
  );
}
