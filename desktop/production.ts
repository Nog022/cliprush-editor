import { mkdir, readFile, rename, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ProductionJob, Project } from "../shared/model";
import { catalogQueries, compileEditorialPlan, editorialLimitations, editorialSchema, narrationBlocks, narrationClips } from "../shared/editorial";
import { prepareNarration } from "./narration";
import type { Store } from "./store";
import { assetPath, inspectAssets } from "./media";
import { CodexClient, type CodexEvent } from "./codex";
import type { RenderService } from "./render";
import type { CatalogService } from "./catalog";

interface Session {
  threadId?: string;
  job?: ProductionJob;
  previous?: Project;
  plan?: unknown;
}
const active = (job?: ProductionJob) =>
  job && !["completed", "cancelled", "failed"].includes(job.status);

export class ProductionService {
  private sessions = new Map<string, Session>();
  private loading = new Map<string, Promise<Session>>();
  private controller?: AbortController;
  private persistence: Promise<void> = Promise.resolve();
  constructor(
    private store: Store,
    readonly codex: CodexClient,
    private renders: RenderService,
    private root: string,
    private catalog?: CatalogService,
    private alignNarration = prepareNarration,
    private generateNarration?: (project: Project, signal: AbortSignal, log: (message: string) => void) => Promise<Project>,
  ) {}
  busy(id?: string) {
    return [...this.sessions].some(
      ([key, value]) => (!id || id === key) && active(value.job),
    );
  }
  private filename(id: string) {
    return path.join(this.store.directory, "production", `${id}.json`);
  }
  private async session(id: string) {
    if (this.sessions.has(id)) return this.sessions.get(id)!;
    const pending = this.loading.get(id);
    if (pending) return pending;
    const loading = this.loadSession(id);
    this.loading.set(id, loading);
    try {
      return await loading;
    } finally {
      this.loading.delete(id);
    }
  }
  private async loadSession(id: string) {
    let session: Session = {};
    try {
      session = JSON.parse(
        await readFile(this.filename(id), "utf8"),
      ) as Session;
      if (active(session.job))
        session.job = {
          ...session.job!,
          status: "failed",
          error:
            "Produção interrompida pelo encerramento do aplicativo. Tente novamente.",
        };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
    this.sessions.set(id, session);
    return session;
  }
  private persist(id: string, session: Session) {
    const data = JSON.stringify(session);
    this.persistence = this.persistence
      .catch(() => undefined)
      .then(async () => {
        await mkdir(path.dirname(this.filename(id)), { recursive: true });
        const temporary = `${this.filename(id)}.tmp`;
        await writeFile(temporary, data, "utf8");
        await rename(temporary, this.filename(id));
      });
    return this.persistence;
  }
  async status(id: string) {
    return {
      job: (await this.session(id)).job,
      approvals: this.codex.approvals(),
    };
  }
  async start(id: string) {
    if (this.busy() || this.renders.busy())
      throw new Error("Aguarde ou cancele a produção atual.");
    const project = await inspectAssets(this.store, this.store.get(id));
    if (!project.generation?.prompt.trim())
      throw new Error("Escreva as instruções de geração.");
    const session = await this.session(id);
    if (this.busy()) throw new Error("Aguarde ou cancele a produção atual.");
    const job: ProductionJob = {
      projectId: id,
      status: "preparing",
      logs: ["Projeto salvo. Preparando contexto."],
      progress: 0,
    };
    session.job = job;
    const controller = new AbortController();
    this.controller = controller;
    try {
      await this.persist(id, session);
    } catch (error) {
      job.status = "failed";
      job.error = String(error);
      throw error;
    }
    void this.execute(project, session, controller).catch(
      async (error: unknown) => {
        job.status = controller.signal.aborted ? "cancelled" : "failed";
        job.error = error instanceof Error ? error.message : String(error);
        try {
          await this.persist(id, session);
        } catch {
          job.logs.push("Falha ao gravar o histórico da produção no disco.");
        }
      },
    );
  }
  async cancel(id: string) {
    const session = await this.session(id);
    if (!active(session.job)) return;
    this.controller?.abort();
    if (session.job?.renderId) this.renders.cancel(session.job.renderId);
    if (session.threadId && session.job?.turnId)
      await this.codex.request("turn/interrupt", {
        threadId: session.threadId,
        turnId: session.job.turnId,
      });
  }
  async restore(id: string) {
    if (this.busy(id))
      throw new Error("Cancele a produção antes de restaurar.");
    const previous = (await this.session(id)).previous;
    if (!previous)
      throw new Error("Nenhuma versão anterior de produção disponível.");
    const current = this.store.get(id);
    return this.store.save({
      ...current,
      assets: [...current.assets.filter(a => a.id !== current.generation?.narrationAssetId || previous.assets.some(p => p.id === a.id)),
        ...previous.assets.filter(a => !current.assets.some(c => c.id === a.id))],
      ...(current.generation ? { generation: { ...current.generation, narrationAssetId: previous.generation?.narrationAssetId } } : {}),
      clips: previous.clips,
      scenes: previous.scenes,
      captions: previous.captions,
      durationInFrames: previous.durationInFrames,
    }, true);
  }
  private async turn(
    threadId: string,
    prompt: string,
    model: string,
    effort: string,
    job: ProductionJob,
    signal: AbortSignal,
    images: string[] = [],
  ) {
    signal.throwIfAborted();
    return new Promise<string>((resolve, reject) => {
      let text = "";
      const cleanup = () => {
        clearTimeout(timer);
        this.codex.off("notification", notification);
        this.codex.off("disconnected", disconnected);
        signal.removeEventListener("abort", aborted);
      };
      const finish = (error?: Error) => {
        cleanup();
        if (error) reject(error);
        else resolve(text);
      };
      const disconnected = (error: Error) => finish(error);
      const aborted = () => finish(new Error("Produção cancelada."));
      const timer = setTimeout(() => {
        if (job.turnId)
          void this.codex
            .request("turn/interrupt", { threadId, turnId: job.turnId })
            .catch(() => undefined);
        finish(new Error("Geração excedeu 20 minutos. Tente novamente."));
      }, 20 * 60_000);
      const notification = (method: string, event: CodexEvent) => {
        if (event.threadId !== threadId) return;
        if (method === "turn/started" && event.turn) job.turnId = event.turn.id;
        if (method === "item/started" && event.item)
          job.logs = [...job.logs.slice(-19), `Codex · ${event.item.type}`];
        if (method === "item/agentMessage/delta") text += event.delta ?? "";
        if (
          method === "item/completed" &&
          event.item?.type === "agentMessage" &&
          event.item.text &&
          event.item.phase !== "commentary"
        )
          text = event.item.text;
        if (method === "turn/completed")
          finish(
            event.turn?.status === "completed"
              ? undefined
              : new Error(
                  event.turn?.error?.message ??
                    `Codex ${event.turn?.status ?? "falhou"}`,
                ),
          );
      };
      this.codex.on("notification", notification);
      this.codex.on("disconnected", disconnected);
      signal.addEventListener("abort", aborted, { once: true });
      void this.codex
        .request<{ turn: { id: string } }>("turn/start", {
          threadId,
          input: [{ type: "text", text: prompt }, ...images.map(image => ({ type: "localImage", path: image }))],
          model,
          effort,
          cwd: this.root,
          approvalPolicy: "on-request",
          sandboxPolicy: { type: "readOnly" },
          outputSchema: editorialSchema,
        })
        .then((result) => {
          job.turnId = result.turn.id;
          if (signal.aborted)
            void this.codex
              .request("turn/interrupt", { threadId, turnId: result.turn.id })
              .catch(() => undefined);
        })
        .catch(finish);
    });
  }
  private async execute(
    project: Project,
    session: Session,
    controller: AbortController,
  ) {
    const job = session.job!;
    const signal = controller.signal;
    const original = project;
    const status = await this.codex.status();
    if (!status.connected || !status.authenticated)
      throw new Error(status.error ?? "Autentique o Codex para gerar.");
    let settings = project.generation!;
    const preferred = settings.model ?? status.configuredModel;
    const model = preferred
      ? status.models.find((m) => m.model === preferred || m.id === preferred)
      : (status.models.find((m) => m.isDefault) ?? status.models[0]);
    if (!model)
      throw new Error(
        "Modelo configurado indisponível. Escolha um modelo retornado pelo Codex.",
      );
    const efforts = model.supportedReasoningEfforts.map(
      (e) => e.reasoningEffort,
    );
    const effort =
      settings.effort ??
      (efforts.includes("medium") ? "medium" : model.defaultReasoningEffort);
    if (!efforts.includes(effort))
      throw new Error("Esforço incompatível com o modelo selecionado.");
    signal.throwIfAborted();
    if (session.threadId) {
      await this.codex.request("thread/resume", {
        threadId: session.threadId,
        model: model.model,
        cwd: this.root,
        approvalPolicy: "on-request",
        sandbox: "read-only",
      });
    } else {
      const result = await this.codex.request<{ thread: { id: string } }>(
        "thread/start",
        {
          model: model.model,
          cwd: this.root,
          approvalPolicy: "on-request",
          sandbox: "read-only",
        },
      );
      session.threadId = result.thread.id;
    }
    job.threadId = session.threadId;
    job.status = "generating";
    job.progress = 0.15;
    await this.persist(project.id, session);
    if (this.generateNarration) {
      project = await this.generateNarration(project, signal, message => job.logs.push(message));
      settings = project.generation!;
    }
    const preservedNarration = narrationClips(project);
    const contextAssets = await Promise.all(
      project.assets.map(async (asset) => ({
        id: asset.id,
        name: asset.name,
        kind: asset.kind,
        width: asset.width,
        height: asset.height,
        duration: asset.duration,
        role: asset.role,
        category: asset.category,
        missing: asset.missing,
        path: asset.missing ? undefined : await assetPath(this.store, asset),
      })),
    );
    const references = [...settings.references];
    for (const asset of contextAssets.filter(a => a.kind === "caption" && a.path)) {
      if ((await stat(asset.path!)).size > 100_000) throw new Error(`Legenda muito extensa: ${asset.name}. Forneça somente os trechos relevantes.`);
      references.push({ name: asset.name, content: await readFile(asset.path!, "utf8") });
    }
    const aligned = await this.alignNarration({ ...project, generation: { ...settings, references } }, this.store, this.root, signal, message => job.logs.push(message));
    references.splice(0, references.length, ...aligned.generation!.references);
    const timedBlocks = narrationBlocks(aligned);
    const images = contextAssets.filter(a => a.kind === "image" && a.path).slice(0, 5);
    if (images.length) job.logs.push(`${images.length} imagens fornecidas ao modelo para inspeção; outros detalhes visuais serão omitidos se não confirmados.`);
    const context = {
      name: project.name, language: project.language, category: project.category,
      type: project.type, width: project.width, height: project.height,
      fps: project.fps, durationInFrames: project.durationInFrames,
      clips: project.clips, scenes: project.scenes, captions: project.captions,
      exportSettings: project.exportSettings, assets: contextAssets, preservedNarration,
      narrationBlocks: timedBlocks, imageInputs: images.map(a => a.id),
    };
    const instructions = `Planeje a edicao ClipRush por blocos de narracao ANTES da montagem. Retorne somente o plano JSON. O app compilara os blocos no schema Remotion existente e validara antes de salvar/exportar. Respeite AGENTS.md.
Cada bloco associa narrationText, evidence (fonte concreta do texto e timestamps: referencia/legenda/midia inspecionada), from/durationInFrames e trechos visuais. Tempos de clips/scenes sao absolutos na timeline, em quadros do FPS do projeto; trimBefore e o quadro de origem. Captions usam milissegundos absolutos e correspondem a fala do bloco. Nao invente transcricao, timestamps de fala nem cenas nao inspecionadas. Se faltarem dados para cumprir o pedido, retorne errors especificos. Nao basta sobrepor o video inteiro: selecione trechos e cortes conforme a fala e o pedido.
O app preserva automaticamente preservedNarration com posicao, trim, duracao e volume originais: NAO repita esses assets em audioClips ou blocks. Outros audios existentes ficam em audioClips. A duracao deve terminar junto a narracao preservada quando existir. Cubra toda a duracao com clips visuais ou scenes. Preserve partes existentes que o pedido nao altera.
Use somente assetId fornecidos. Crie IDs novos e globalmente unicos para cada clipe/cena planejado; nunca reutilize IDs de preservedNarration, nem repita um ID entre blocos ou audioClips. Clips suportam none/fade/zoom, scenes suportam textos/formas none/fade/zoom/slide. Scenes ficam SOB clips visuais: nao esconda textos importantes atras de video opaco. Inclua cortes, trims, zooms e captions solicitados e declare requirements com o minimo de trechos e efeitos exigidos (inclusive referencias). Nao use false para evitar requisitos. Sem alinhamento temporal suficiente para legendas, retorne erro especifico.
Use catalogQueries SOMENTE quando faltarem cenas nas midias importadas. Nao obrigue catalogo. Retorne ate duas buscas especificas; candidatos serao fornecidos antes da montagem final. Nao reindexe nem varra bibliotecas. Normalmente catalogQueries e [].`;
    const originalPrompt = `${instructions}
O alinhamento foi preparado pelo app, mesmo sem legendas: use narrationBlocks como base e somente fronteiras de palavras/cues medidas. Pode combinar blocos mantendo texto e tempos. Quando houver narracao alinhada, o app constroi e divide captions automaticamente pelas palavras medidas: retorne captions: [] e declare requirements.captions conforme o pedido. Nao estime timestamps de legendas.
errors contem SOMENTE falhas criticas que impedem a edicao essencial. Registre efeitos opcionais incompativeis em limitations com code, detail, essential e resolution (adapted/omitted/blocked). Adapte enquadramento para cortes/zoom global existentes quando adequado; simulacao sem suporte deve ser omitida, nunca declarada implementada. Requisito essencial omitido ou bloqueado impede gerar; efeito opcional bloqueado e omitido sem impedir o restante. Nao declare zoom/fade/captions como obrigatorios quando forem apenas alternativas opcionais descartadas.
Inspecione as imagens anexadas ANTES de afirmar detalhes visuais. Todo texto grafico que destaque um detalhe especifico deve constar em highlights com assetId, sceneIds e confirmed (true SOMENTE se o detalhe foi confirmado na imagem anexada). Sem imagem inspecionada/confirmacao, omita esse destaque e registre VALIDACAO_VISUAL_PENDENTE como limitacao opcional; continue os cortes e a narracao. Nao confirme detalhes por nome de arquivo ou descricao de catalogo. Nao ha inspecao automatica de frames de video neste fluxo: omita destaques especificos nao confirmados. Nao acrescente afirmacoes a narracao.
Pedido\n${settings.prompt}\nProjeto e midia\n${JSON.stringify(context)}\nReferencias\n${JSON.stringify(references)}`;
    let prompt = originalPrompt;
    let working = project;
    let searchedCatalog = false;
    let catalogContext = "";
    let candidate: Project | undefined;
    for (let attempt = 0; attempt < 2; attempt++) {
      let result = await this.turn(
        session.threadId!,
        prompt,
        model.model,
        effort,
        job,
        signal,
        images.map(a => a.path!),
      );
      signal.throwIfAborted();
      job.status = "validating";
      job.progress = 0.65;
      try {
        let plan: unknown = JSON.parse(result);
        const queries = catalogQueries(plan);
        if (queries.length) {
          if (searchedCatalog || !this.catalog) throw new Error("Cenas adicionais indisponiveis; use as midias importadas ou indique o material necessario.");
          searchedCatalog = true;
          const candidates = [];
          for (const query of queries) {
            const scenes = await this.catalog.search(query);
            for (const scene of scenes) {
              signal.throwIfAborted();
              working = await this.catalog.use(project.id, scene.id, working);
              candidates.push({ ...scene, clip: working.clips.at(-1) });
            }
          }
          catalogContext = `\nCandidatos opcionais do catalogo (use apenas trechos adequados; catalogQueries deve ser []):\n${JSON.stringify(candidates)}\nAssets disponiveis: ${JSON.stringify(working.assets)}`;
          result = await this.turn(session.threadId!, originalPrompt + catalogContext, model.model, effort, job, signal, images.map(a => a.path!));
          plan = JSON.parse(result);
        }
        session.plan = plan;
        await this.persist(project.id, session);
        // Keep the original timeline as the preservation baseline; catalog clips are only suggestions.
        candidate = compileEditorialPlan({ ...project, assets: working.assets, generation: { ...settings, references } }, plan, images.map(a => a.id));
        if (preservedNarration.length && candidate.captions.length)
          job.logs.push("Legendas sincronizadas automaticamente com o alinhamento real; limites de blocos ajustados sem nova chamada ao Codex.");
        job.logs.push(...editorialLimitations(plan));
        candidate.generation = project.generation;
        candidate.assets = candidate.assets.filter(a => project.assets.some(original => original.id === a.id) || candidate!.clips.some(c => c.assetId === a.id));
        await this.renders.validate(candidate, signal);
        break;
      } catch (error) {
        signal.throwIfAborted();
        if (attempt === 1) throw error;
        job.logs.push("Validação falhou. Solicitando uma correção ao Codex.");
        job.status = "generating";
        candidate = undefined;
        prompt = `${originalPrompt}${catalogContext}\nPlano anterior\n${result}\nCorrija o plano completo sem remover requisitos. Erro: ${error instanceof Error ? error.message : String(error)}`;
      }
    }
    signal.throwIfAborted();
    if (!candidate) throw new Error("Composição ausente.");
    session.previous = original;
    await this.persist(project.id, session);
    const saved = this.store.save(candidate, true);
    job.logs.push(`Composição validada e salva na revisão ${saved.revision}.`);
    if (settings.autoRender) {
      const render = await this.renders.start(saved, saved.exportSettings);
      job.renderId = render.id;
      job.status = "rendering";
      while (render.status === "rendering") {
        if (signal.aborted) this.renders.cancel(render.id);
        job.progress = 0.7 + render.progress * 0.3;
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
      signal.throwIfAborted();
      if (render.status !== "completed")
        throw new Error(render.error ?? "Exportação falhou.");
    }
    job.status = "completed";
    job.progress = 1;
    job.logs.push("Produção concluída.");
    await this.persist(project.id, session);
  }
}
