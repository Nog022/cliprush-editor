import { readFile, stat } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import * as validate from "../shared/validation";
import type { Store } from "./store";
import type { ProductionService } from "./production";
import type { RenderService } from "./render";
import { importFiles } from "./media";

export interface ProduceInput { narration: string; instructions: string; name?: string; projectId?: string; media?: string[] }
export type ProduceEvent = { type: "progress" | "completed" | "error"; projectId?: string; status?: string; progress?: number; phase?: string; logs?: string[]; outputPath?: string; error?: string };
export function produceInput(value: unknown): ProduceInput {
  const r = validate.record(value);
  const g = validate.generation({ narrationScript: r.narration, prompt: r.instructions, references: [], autoRender: true });
  if (!g.narrationScript?.trim() || !g.prompt.trim()) throw new Error("Informe narration e instructions não vazios.");
  if (r.media !== undefined && (!Array.isArray(r.media) || r.media.length > 40)) throw new Error("media deve conter até 40 caminhos locais.");
  return { narration: g.narrationScript, instructions: g.prompt,
    ...(r.name === undefined ? {} : { name: validate.text(r.name, "Nome", 160) }),
    ...(r.projectId === undefined ? {} : { projectId: validate.id(r.projectId) }),
    ...(r.media === undefined ? {} : { media: (r.media as unknown[]).map(file => path.resolve(validate.text(file, "Mídia", 4096))) }),
  };
}

/** Submission adapter only: all editorial, speech, timing and render work stays in ProductionService. */
export async function produceFromCLI(
  input: ProduceInput, store: Store, production: ProductionService, renders: RenderService,
  emit: (event: ProduceEvent) => Promise<void>, cancelled: () => Promise<boolean> = async () => false,
) {
  if (production.busy() || renders.busy()) throw new Error("Já existe produção ou exportação ativa. Tente após sua conclusão.");
  let project = input.projectId ? store.get(input.projectId) : store.create({
    name: input.name ?? `ClipRush ${new Date().toISOString().slice(0, 10)} ${randomUUID().slice(0, 8)}`,
    channelId: "cliprush", language: "pt-BR", category: "Games", type: "narrated",
    width: 1080, height: 1920, fps: 30, durationInFrames: 900,
  });
  let preferences = {};
  if (!project.generation) {
    try { preferences = validate.record(JSON.parse(await readFile(path.join(store.directory, "generation-preferences.json"), "utf8"))); }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw new Error("Preferências de geração inválidas; configuração preservada."); }
  }
  // Reuse already imported library media; no disk scan or catalog indexing.
  if (!input.projectId && !input.media?.length) {
    const available = new Map<string, typeof project.assets[number]>();
    for (const source of store.list().filter(p => p.channelId === project.channelId && !p.archived)) {
      for (const asset of source.assets) if (["video", "image"].includes(asset.kind) && !asset.missing && available.size < 40 && !available.has(asset.hash)) available.set(asset.hash, asset);
    }
    project.assets = [...available.values()];
  }
  project = store.save({ ...project,
    generation: validate.generation({ ...{ prompt: "", references: [], autoRender: true }, ...preferences, ...project.generation,
      narrationScript: input.narration, prompt: `${input.instructions}\nGere legendas sincronizadas com a narração.`, autoRender: true }),
    exportSettings: { ...project.exportSettings, audio: true, captions: true },
  }, true);
  if (input.media?.length) {
    const imported = await importFiles(store, project.id, input.media, "reference");
    if (imported.errors.length) throw new Error(`Falha ao importar mídia: ${imported.errors.join("; ")}`);
    project = imported.project;
  }
  await emit({ type: "progress", projectId: project.id, status: "preparing", progress: 0 });
  await production.start(project.id);
  let last = "";
  let lastLogs = "";
  try {
    for (;;) {
      if (await cancelled()) { await production.cancel(project.id); throw new Error("Produção cancelada pela CLI."); }
      const state = await production.status(project.id);
      if (state.approvals.length) {
        for (const approval of state.approvals) production.codex.answer(approval.id, false);
        await production.cancel(project.id);
        throw new Error("Codex solicitou aprovação interativa. A CLI recusou a operação; ajuste as instruções para planejamento somente leitura.");
      }
      const job = state.job!;
      const render = job.renderId ? renders.get(job.renderId) : undefined;
      const event: ProduceEvent = { type: "progress", projectId: project.id, status: job.status,
        progress: Math.round(job.progress * 1000) / 1000, phase: render?.phase, logs: job.logs.slice(-20) };
      const snapshot = JSON.stringify(event);
      if (snapshot !== last) {
        const logs = JSON.stringify(event.logs);
        await emit({ ...event, ...(logs === lastLogs ? { logs: undefined } : {}) });
        lastLogs = logs; last = snapshot;
      }
      if (job.status === "failed" || job.status === "cancelled") throw new Error(job.error ?? "Produção interrompida.");
      if (job.status === "completed") {
        if (!render || render.status !== "completed" || !(await stat(render.outputPath)).isFile()) throw new Error("Produção concluída sem MP4 verificável.");
        await emit({ type: "completed", projectId: project.id, progress: 1, outputPath: path.resolve(render.outputPath) });
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  } catch (error) {
    if (production.busy(project.id)) await production.cancel(project.id).catch(() => undefined);
    throw error;
  }
}
