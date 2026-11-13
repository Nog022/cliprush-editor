import { MediaPanel } from "./editor/MediaPanel";
import { ProjectProperties } from "./editor/ProjectProperties";
import { ClipList } from "./editor/ClipList";
import { Library } from "./editor/Library";
import { CatalogSearch } from "./editor/CatalogSearch";
import { ProductionPanel } from "./editor/ProductionPanel";
import { probeMedia } from "./probeMedia";
import {
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import type { Asset, LegacyInfo, Project, Workspace } from "../shared/model";

const Preview = lazy(() => import("./Preview"));
type Page =
  | "Dashboard"
  | "Meus projetos"
  | "Editor"
  | "Biblioteca"
  | "Configurações";
const navigation: { label: Page; icon: string }[] = [
  { label: "Dashboard", icon: "◫" },
  { label: "Meus projetos", icon: "▦" },
  { label: "Editor", icon: "▤" },
  { label: "Biblioteca", icon: "◈" },
  { label: "Configurações", icon: "⚙" },
];
const url = (id: string, asset: Asset) =>
  `cliprush://app/media/${id}/${asset.id}${asset.thumbnail ? "/thumbnail" : ""}`;
const date = (value?: string) =>
  value ? new Date(value).toLocaleDateString("pt-BR") : "—";
const duration = (frames: number, fps: number) =>
  `${Math.floor(frames / fps / 60)}:${String(Math.round(frames / fps) % 60).padStart(2, "0")}`;

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="modal-backdrop">
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="section-heading">
          <h2>{title}</h2>
          <button onClick={onClose} aria-label="Fechar">
            ×
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
export function App() {
  const [workspace, setWorkspace] = useState<Workspace>();
  const [page, setPage] = useState<Page>("Dashboard");
  const [channel, setChannel] = useState("cliprush");
  const [search, setSearch] = useState("");
  const [archived, setArchived] = useState(false);
  const [selected, setSelected] = useState<Project>();
  const [legacy, setLegacy] = useState<LegacyInfo>();
  const [working, setBusy] = useState(false);
  const [productionBusy, setProductionBusy] = useState(false);
  const busy = working || productionBusy;
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [modal, setModal] = useState<"project" | "channel" | null>(null);
  const [importMode, setImportMode] = useState<"copy" | "reference">("copy");
  const [mediaCategory, setMediaCategory] = useState("GTA 6");
  const [dirty, setDirty] = useState(false);
  const [limit, setLimit] = useState(24);
  const pending = useRef(false);

  const refresh = async () => {
    const next = await window.cliprush.workspace();
    setWorkspace(next);
    return next;
  };
  const run = async (action: () => Promise<void>) => {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await action();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message.replace(
              /^Error invoking remote method '[^']+': Error: /,
              "",
            )
          : String(reason),
      );
    } finally {
      pending.current = false;
      setBusy(false);
    }
  };
  useEffect(() => {
    let active = true;
    void window.cliprush
      .workspace()
      .then((next) => {
        if (active) setWorkspace(next);
      })
      .catch((reason: unknown) => {
        if (active)
          setError(reason instanceof Error ? reason.message : String(reason));
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    const beforeClose = (event: BeforeUnloadEvent) => {
      if (dirty) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", beforeClose);
    return () => window.removeEventListener("beforeunload", beforeClose);
  }, [dirty]);
  const remember = (p: Project) => {
    setSelected(p);
    setDirty(false);
    setWorkspace((w) =>
      w
        ? { ...w, projects: [p, ...w.projects.filter((x) => x.id !== p.id)] }
        : w,
    );
  };
  const savePending = async () => {
    if (selected && dirty) {
      const p = await window.cliprush.saveProject(selected);
      remember(p);
      return p;
    }
    return selected;
  };
  const openProject = (p: Project) =>
    void run(async () => {
      await savePending();
      remember(await window.cliprush.inspectAssets(p.id));
      setLegacy(undefined);
      setPage("Editor");
    });
  const openLegacy = (p: LegacyInfo) =>
    void run(async () => {
      await savePending();
      setSelected(undefined);
      setLegacy(p);
      setPage("Editor");
    });
  const edit = (p: Project) => {
    setSelected(p);
    setDirty(true);
  };
  const currentChannel = workspace?.channels.find((c) => c.id === channel);
  const projects =
    workspace?.projects.filter(
      (p) =>
        p.channelId === channel &&
        p.archived === archived &&
        p.name.toLowerCase().includes(search.toLowerCase()),
    ) ?? [];
  const old =
    channel === "cliprush" && !archived
      ? (workspace?.legacy.filter((p) =>
          p.name.toLowerCase().includes(search.toLowerCase()),
        ) ?? [])
      : [];

  const createProject = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    void run(async () => {
      await savePending();
      const [width, height] = String(data.get("format")).split("x").map(Number);
      const fps = Number(data.get("fps"));
      const p = await window.cliprush.createProject({
        name: String(data.get("name")),
        channelId: channel,
        language: String(data.get("language")),
        category: String(data.get("category")),
        width,
        height,
        fps,
        durationInFrames: Math.round(Number(data.get("duration")) * fps),
      });
      remember(p);
      setLegacy(undefined);
      setModal(null);
      setPage("Editor");
    });
  };
  const importMedia = () =>
    void run(async () => {
      const p = await savePending();
      if (!p) return;
      const result = await window.cliprush.importMedia(
        p.id,
        importMode,
        mediaCategory,
      );
      if (!result) return;
      let importedProject = result.project;
      for (const asset of importedProject.assets) {
        if (
          (asset.kind === "image" && !asset.width) ||
          ((asset.kind === "video" || asset.kind === "audio") &&
            !asset.duration)
        ) {
          const metadata = await probeMedia(importedProject.id, asset);
          if (metadata)
            importedProject = await window.cliprush.updateAssetMetadata(
              importedProject.id,
              asset.id,
              metadata,
            );
          else
            result.errors.push(
              `${asset.name}: não foi possível ler os metadados. O codec pode não ser compatível.`,
            );
        }
      }
      remember(importedProject);
      setNotice(
        `${result.imported} arquivo(s) importado(s) · ${result.duplicates} duplicado(s).`,
      );
      if (result.errors.length) setError(result.errors.join("\n"));
    });
  const addClip = (asset: Asset) => {
    if (!selected || asset.kind === "caption") return;
    const sameTrack = selected.clips.filter((c) => {
      const a = selected.assets.find((x) => x.id === c.assetId);
      return (a?.kind === "audio") === (asset.kind === "audio");
    });
    const from = Math.max(
      0,
      ...sameTrack.map((c) => c.from + c.durationInFrames),
    );
    const length = Math.max(
      1,
      Math.round((asset.duration ?? 5) * selected.fps),
    );
    edit({
      ...selected,
      durationInFrames: Math.max(selected.durationInFrames, from + length),
      clips: [
        ...selected.clips,
        {
          id: crypto.randomUUID(),
          assetId: asset.id,
          from,
          durationInFrames: length,
          volume: 1,
        },
      ],
    });
  };
  const library = (
    <>
      <div className="section-heading">
        <div>
          <h2>
            {page === "Dashboard"
              ? "Continue de onde parou"
              : "Sua biblioteca de projetos"}
          </h2>
          <p className="muted">
            {projects.length + old.length} projetos neste canal
          </p>
        </div>
        <div className="row">
          <input
            aria-label="Pesquisar projetos"
            placeholder="⌕  Pesquisar projetos"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setLimit(24);
            }}
          />
          <label className="check">
            <input
              type="checkbox"
              checked={archived}
              onChange={(e) => setArchived(e.target.checked)}
            />
            Arquivados
          </label>
        </div>
      </div>
      <div className="project-grid">
        {projects.slice(0, limit).map((p) => {
          const cover = p.assets.find((a) => a.thumbnail || a.kind === "image");
          return (
            <article className="project-card" key={p.id}>
              <button
                className="cover"
                onClick={() => openProject(p)}
                aria-label={`Abrir ${p.name}`}
              >
                {cover ? (
                  <img src={url(p.id, cover)} alt="" loading="lazy" />
                ) : (
                  <div className="cover-art">
                    CR<span>SEU PRÓXIMO VÍDEO</span>
                  </div>
                )}
                <span className="badge">{p.language}</span>
                <span className="duration">
                  {duration(p.durationInFrames, p.fps)}
                </span>
              </button>
              <div className="card-info">
                <h3>{p.name}</h3>
                <p>
                  {p.width} × {p.height} · {p.fps} fps · {p.category}
                </p>
                <div className="card-footer">
                  <span>
                    {date(p.updatedAt)} ·{" "}
                    {p.clips.length ? "Em edição" : "Novo"}
                  </span>
                  <button
                    aria-label={`Duplicar ${p.name}`}
                    title="Duplicar projeto"
                    onClick={() =>
                      void run(async () => {
                        await savePending();
                        await window.cliprush.duplicateProject(p.id);
                        await refresh();
                        setNotice(
                          "Projeto duplicado. As mídias gerenciadas são compartilhadas sem alterar o original.",
                        );
                      })
                    }
                  >
                    ⧉
                  </button>
                  <button
                    aria-label={`${p.archived ? "Restaurar" : "Arquivar"} ${p.name}`}
                    title={p.archived ? "Restaurar" : "Arquivar"}
                    onClick={() =>
                      void run(async () => {
                        await savePending();
                        await window.cliprush.archiveProject(p.id, !p.archived);
                        if (selected?.id === p.id) setSelected(undefined);
                        await refresh();
                      })
                    }
                  >
                    {p.archived ? "↩" : "↓"}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
        {old.slice(0, Math.max(0, limit - projects.length)).map((p, index) => (
          <article className="project-card" key={p.id}>
            <button
              className={`cover legacy-cover hue-${index % 4}`}
              onClick={() => openLegacy(p)}
              aria-label={`Abrir ${p.id}`}
            >
              {p.thumbnail ? (
                <img src={p.thumbnail} alt="" loading="lazy" />
              ) : (
                <div className="cover-art">
                  {p.id.includes("AI") ? "AI / 002" : "CR"}
                  <span>
                    {p.id.includes("AI")
                      ? "MUNDOS EM MOVIMENTO"
                      : "REMOTION ORIGINAL"}
                  </span>
                </div>
              )}
              <span className="badge legacy-badge">Composição original</span>
              <span className="duration">
                {duration(p.durationInFrames, p.fps)}
              </span>
            </button>
            <div className="card-info">
              <h3>{p.name}</h3>
              <p>
                {p.width} × {p.height} · {p.fps} fps
              </p>
              <div className="card-footer">
                <span>Fonte: {date(p.updatedAt)}</span>
                <span className="text-accent">Abrir preview ↗</span>
              </div>
            </div>
          </article>
        ))}
      </div>
      {projects.length + old.length === 0 && (
        <div className="empty">
          <span className="empty-icon">▦</span>
          <h3>
            {search
              ? "Nenhum projeto encontrado"
              : "Um espaço para suas próximas histórias"}
          </h3>
          <p>
            Crie um projeto e importe seus arquivos pelo explorador do Windows.
          </p>
        </div>
      )}
      {projects.length + old.length > limit && (
        <button onClick={() => setLimit(limit + 24)}>
          Carregar mais projetos
        </button>
      )}
    </>
  );

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">ϟ</span>
          <div>
            ClipRush<span>EDITOR STUDIO</span>
          </div>
        </div>
        <div className="workspace-label">
          WORKSPACE LOCAL <span className="online-dot" />
        </div>
        <label className="sr-only" htmlFor="channel">
          Canal
        </label>
        <select
          id="channel"
          value={channel}
          disabled={busy}
          onChange={(e) => {
            const next = e.target.value;
            void run(async () => {
              await savePending();
              setChannel(next);
              setSelected(undefined);
              setLegacy(undefined);
              setPage("Dashboard");
              setSearch("");
            });
          }}
        >
          {workspace?.channels.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <nav>
          {navigation.map((item) => (
            <button
              key={item.label}
              aria-label={item.label}
              className={page === item.label ? "nav-item active" : "nav-item"}
              onClick={() => setPage(item.label)}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <span className="local-icon">▣</span>
          <strong>Seu estúdio, no seu PC</strong>
          <p>Edição local · arquivos sob seu controle</p>
          <small>DESKTOP · PRODUÇÃO LOCAL</small>
        </div>
      </aside>
      <main>
        <header className="topbar">
          <div className="breadcrumb">
            Workspace <span>/</span> {page}
          </div>
          <div className="row">
            <span className="offline">
              <i /> Offline disponível
            </span>
            <div className="avatar">RN</div>
          </div>
        </header>
        <div className="content">
          <div className="page-heading">
            <div>
              <p className="eyebrow">
                {currentChannel?.name ?? "CLIPRUSH STUDIO"}
              </p>
              <h1>
                {page === "Dashboard" ? "Suas histórias começam aqui." : page}
              </h1>
              <p className="subtitle">
                {page === "Dashboard"
                  ? "Organize suas ideias. Dê vida ao próximo vídeo."
                  : page === "Editor"
                    ? "Preview em tempo real e montagem básica de mídias."
                    : "Seu espaço de produção local."}
              </p>
            </div>
            <div className="row">
              <button
                disabled={busy}
                onClick={() =>
                  void run(async () => {
                    await savePending();
                    const p = await window.cliprush.importProject();
                    if (p) {
                      remember(p);
                      setChannel(p.channelId);
                      setLegacy(undefined);
                      setPage("Editor");
                    }
                  })
                }
              >
                ↥ Importar projeto
              </button>
              <button
                className="primary"
                disabled={busy}
                onClick={() => setModal("project")}
              >
                ＋ Novo projeto
              </button>
            </div>
          </div>
          {busy && (
            <div className="status" role="status">
              Processando… Você pode continuar navegando. Aguarde para iniciar
              outra operação.
            </div>
          )}
          {notice && (
            <div className="notice" role="status">
              {notice}
            </div>
          )}
          {error && (
            <div className="error" role="alert">
              {error}
              <button aria-label="Fechar erro" onClick={() => setError("")}>
                ×
              </button>
            </div>
          )}
          {page === "Dashboard" && (
            <>
              <section className="welcome">
                <div>
                  <span className="eyebrow">DA IDEIA AO PRIMEIRO PREVIEW</span>
                  <h2>
                    O próximo capítulo
                    <br />é seu.
                  </h2>
                  <p>
                    Crie um projeto, importe suas mídias
                    <br />e comece a montar sua história.
                  </p>
                  <button
                    className="primary"
                    onClick={() => setModal("project")}
                    disabled={busy}
                  >
                    Criar meu próximo vídeo ↗
                  </button>
                </div>
                <div className="welcome-graphic" aria-hidden="true">
                  <div className="graphic-frame">
                    <span>CLIPRUSH</span>
                    <b>
                      PLAY
                      <br />
                      YOUR
                      <br />
                      <em>IDEAS.</em>
                    </b>
                    <div className="graphic-timeline">▰ ▰ ▰ ▰ ▰</div>
                  </div>
                  <div className="graphic-orbit" />
                </div>
              </section>
              <div className="stats">
                <div>
                  <span>Projetos no canal</span>
                  <strong>
                    {workspace
                      ? workspace.projects.filter(
                          (p) => p.channelId === channel && !p.archived,
                        ).length +
                        (channel === "cliprush" ? workspace.legacy.length : 0)
                      : "—"}
                  </strong>
                  <small>Biblioteca local</small>
                </div>
                <div>
                  <span>Mídias organizadas</span>
                  <strong>
                    {workspace?.projects
                      .filter((p) => p.channelId === channel)
                      .reduce((total, p) => total + p.assets.length, 0) ?? "—"}
                  </strong>
                  <small>Nos novos projetos</small>
                </div>
                <div>
                  <span>Exports encontrados</span>
                  <strong>
                    {channel === "cliprush"
                      ? (workspace?.exports.length ?? "—")
                      : 0}
                  </strong>
                  <small>Pasta de produções anteriores</small>
                </div>
              </div>
            </>
          )}
          {(page === "Dashboard" || page === "Meus projetos") && library}
          {page === "Dashboard" &&
            Boolean(workspace?.exports.length) &&
            channel === "cliprush" && (
              <section className="panel recent-exports">
                <h2>Últimos renders encontrados</h2>
                {workspace?.exports.slice(0, 5).map((e) => (
                  <div className="export-row" key={e.name}>
                    <span>▸ {e.name}</span>
                    <span className="muted">
                      {(e.bytes / 1024 ** 2).toFixed(1)} MB ·{" "}
                      {date(e.modifiedAt)}
                    </span>
                    <button
                      onClick={() =>
                        void run(() => window.cliprush.openExport(e.name))
                      }
                    >
                      Mostrar na pasta
                    </button>
                  </div>
                ))}
              </section>
            )}
          {page === "Editor" &&
            (!selected && !legacy ? (
              <div className="empty">
                <h2>Escolha um projeto para começar</h2>
                <button onClick={() => setPage("Meus projetos")}>
                  Abrir biblioteca de projetos
                </button>
              </div>
            ) : (
              <>
                <div className="editor-toolbar">
                  <div>
                    <h2>{selected?.name ?? legacy?.name}</h2>
                    <span className="muted">
                      {legacy
                        ? "Composição original · preview preservado"
                        : dirty
                          ? "Alterações não salvas"
                          : `Salvo localmente · revisão ${selected?.revision}`}
                    </span>
                  </div>
                  {selected && (
                    <div className="row">
                      <button
                        disabled={busy}
                        onClick={() =>
                          void run(async () => {
                            await savePending();
                            if (
                              await window.cliprush.exportProject(selected.id)
                            )
                              setNotice(
                                "Pacote salvo com todas as mídias. Copie a pasta inteira para transportar o projeto.",
                              );
                          })
                        }
                      >
                        Empacotar projeto
                      </button>
                      <button
                        className="primary"
                        disabled={busy || !dirty}
                        onClick={() =>
                          void run(async () => {
                            await savePending();
                            setNotice("Projeto salvo.");
                          })
                        }
                      >
                        Salvar projeto
                      </button>
                    </div>
                  )}
                </div>
                <div
                  className={legacy ? "legacy-preview panel" : "editor-layout"}
                >
                  {selected && (
                    <MediaPanel
                      project={selected}
                      busy={busy}
                      mode={importMode}
                      onMode={setImportMode}
                      onImport={importMedia}
                      onAdd={addClip}
                      onRelink={(asset) =>
                        void run(async () => {
                          await savePending();
                          const p = await window.cliprush.relinkAsset(
                            selected.id,
                            asset.id,
                          );
                          if (p) remember(p);
                        })
                      }
                      category={mediaCategory}
                      onCategory={setMediaCategory}
                      library={workspace?.projects ?? []}
                      onReuse={(source, asset) =>
                        void run(async () => {
                          const p = await savePending();
                          if (p)
                            remember(
                              await window.cliprush.reuseAsset(
                                p.id,
                                source,
                                asset,
                              ),
                            );
                        })
                      }
                      onCategorize={(asset, category) =>
                        void run(async () => {
                          const p = await savePending();
                          if (p)
                            remember(
                              await window.cliprush.categorizeAsset(
                                p.id,
                                asset,
                                category,
                              ),
                            );
                        })
                      }
                    />
                  )}
                  <Suspense
                    fallback={<div className="empty">Preparando Player…</div>}
                  >
                    <Preview
                      key={selected?.id ?? legacy?.id}
                      project={selected}
                      legacyId={legacy?.id}
                    />
                  </Suspense>
                  {selected && (
                    <ProjectProperties
                      project={selected}
                      busy={busy}
                      onEdit={edit}
                    />
                  )}
                </div>
                {selected && (
                  <ClipList project={selected} busy={busy} onEdit={edit} />
                )}
                {selected && (
                  <ProductionPanel
                    key={selected.id}
                    project={selected}
                    onEdit={edit}
                    save={savePending}
                    onSaved={remember}
                    onBusy={setProductionBusy}
                  />
                )}
                {selected && (
                  <section className="panel production-panel">
                    <CatalogSearch
                      key={selected.id}
                      projectId={selected.id}
                      busy={busy}
                      save={savePending}
                      onSaved={remember}
                    />
                  </section>
                )}
              </>
            ))}
          {page === "Biblioteca" && (
            <Library
              projects={
                workspace?.projects.filter((p) => p.channelId === channel) ?? []
              }
              selected={selected?.channelId === channel ? selected : undefined}
              busy={busy}
              onSelect={(p) =>
                void run(async () => {
                  await savePending();
                  remember(await window.cliprush.inspectAssets(p.id));
                })
              }
              onOpen={openProject}
              onImport={importMedia}
              category={mediaCategory}
              onCategory={setMediaCategory}
              onReuse={(source, asset) =>
                void run(async () => {
                  const p = await savePending();
                  if (p)
                    remember(
                      await window.cliprush.reuseAsset(p.id, source, asset),
                    );
                })
              }
              onCategorize={(source, asset, category) =>
                void run(async () => {
                  await savePending();
                  const p = await window.cliprush.categorizeAsset(
                    source,
                    asset,
                    category,
                  );
                  await refresh();
                  if (selected?.id === p.id) remember(p);
                })
              }
            />
          )}
          {page === "Configurações" && (
            <>
              <section className="panel settings">
                <h2>Armazenamento local</h2>
                <p>Projetos e mídias gerenciadas ficam fora do código-fonte.</p>
                <code>{workspace?.dataDirectory}</code>
                <div className="row">
                  <button
                    onClick={() =>
                      void run(() => window.cliprush.openDataDirectory())
                    }
                  >
                    Abrir pasta de dados
                  </button>
                  <button
                    onClick={() =>
                      void run(async () => {
                        await savePending();
                        if (await window.cliprush.chooseDataDirectory()) {
                          await refresh();
                          setSelected(undefined);
                          setLegacy(undefined);
                          setChannel("cliprush");
                          setNotice(
                            "Workspace alterado. O workspace anterior continua intacto na pasta original.",
                          );
                        }
                      })
                    }
                  >
                    Abrir outro workspace
                  </button>
                </div>
                <p className="hint">
                  Abre ou cria um workspace independente na pasta escolhida.
                  Para transferir um projeto, use Empacotar projeto e Importar
                  projeto.
                </p>
              </section>
              <section className="panel settings">
                <div className="section-heading">
                  <h2>Canais</h2>
                  <button onClick={() => setModal("channel")}>
                    ＋ Novo canal
                  </button>
                </div>
                {workspace?.channels.map((c) => (
                  <div className="channel-row" key={c.id}>
                    <span style={{ color: c.color }}>●</span>
                    <strong>{c.name}</strong>
                    <span className="muted">{c.language}</span>
                  </div>
                ))}
              </section>
              <section className="panel settings">
                <h2>Versão</h2>
                <p>ClipRush Editor Studio {workspace?.version}</p>
              </section>
            </>
          )}
        </div>
        <footer>
          ClipRush Editor Studio{" "}
          <span>Produção local. Liberdade criativa.</span>
        </footer>
      </main>
      {modal === "project" && (
        <Modal title="Novo projeto" onClose={() => setModal(null)}>
          <form onSubmit={createProject}>
            <label>
              Nome do projeto
              <input
                name="name"
                required
                maxLength={160}
                autoFocus
                placeholder="Minha próxima história"
              />
            </label>
            <div className="form-grid">
              <label>
                Formato
                <select name="format">
                  <option value="1080x1920">Vertical · 1080 × 1920</option>
                  <option value="1920x1080">Horizontal · 1920 × 1080</option>
                  <option value="1080x1080">Quadrado · 1080 × 1080</option>
                </select>
              </label>
              <label>
                FPS
                <select name="fps">
                  <option>30</option>
                  <option>24</option>
                  <option>60</option>
                </select>
              </label>
              <label>
                Duração inicial (segundos)
                <input
                  name="duration"
                  type="number"
                  min="1"
                  max="21600"
                  defaultValue="30"
                  required
                />
              </label>
              <label>
                Idioma
                <input
                  name="language"
                  defaultValue={currentChannel?.language ?? "pt-BR"}
                  maxLength={35}
                  required
                />
              </label>
            </div>
            <label>
              Categoria
              <input
                name="category"
                defaultValue={channel === "animation" ? "Animação" : "Games"}
                maxLength={80}
                required
              />
            </label>
            <p className="hint">
              Canal: {currentChannel?.name}. A duração pode crescer conforme
              você adiciona mídias.
            </p>
            <button
              className="primary full-width"
              disabled={busy}
              type="submit"
            >
              Criar projeto
            </button>
          </form>
        </Modal>
      )}
      {modal === "channel" && (
        <Modal title="Novo canal" onClose={() => setModal(null)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              void run(async () => {
                await savePending();
                const c = await window.cliprush.createChannel(
                  String(form.get("name")),
                  String(form.get("language")),
                );
                await refresh();
                setChannel(c.id);
                setSelected(undefined);
                setLegacy(undefined);
                setModal(null);
              });
            }}
          >
            <label>
              Nome
              <input name="name" required maxLength={160} autoFocus />
            </label>
            <label>
              Idioma padrão
              <input
                name="language"
                required
                defaultValue="en"
                maxLength={35}
              />
            </label>
            <button className="primary" type="submit" disabled={busy}>
              Criar canal
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
