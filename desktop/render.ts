import { randomUUID } from "node:crypto";
import { createReadStream, existsSync } from "node:fs";
import { copyFile, mkdir, readFile, rename, stat, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
import type { Project, RenderJob, RenderSettings } from "../shared/model";
import type { Store } from "./store";
import { assetPath } from "./media";
import { mime } from "./files";
import { applyComposition } from "../shared/production";
import { checkProject, completeProduction, validateMp4 } from "../scripts/video-retention.mjs";

export class RenderService {
  private jobs: RenderJob[] = [];
  private cancellations = new Map<string, () => void>();
  private running = false;
  private persistence: Promise<void> = Promise.resolve();
  constructor(
    private store: Store,
    private root: string,
  ) {}
  async load() {
    try {
      this.jobs = JSON.parse(
        await readFile(path.join(this.store.directory, "renders.json"), "utf8"),
      ) as RenderJob[];
      for (const job of this.jobs)
        if (["queued", "rendering"].includes(job.status)) {
          job.status = "failed";
          job.error =
            "Aplicativo encerrado durante a exportação. Inicie uma nova exportação.";
        }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  }
  list() {
    return this.jobs;
  }
  get(id: string) {
    const job = this.jobs.find((j) => j.id === id);
    if (!job) throw new Error("Exportação não encontrada.");
    return job;
  }
  private persist() {
    const data = JSON.stringify(this.jobs);
    this.persistence = this.persistence
      .catch(() => undefined)
      .then(async () => {
        const file = path.join(this.store.directory, "renders.json");
        await writeFile(`${file}.tmp`, data, "utf8");
        await rename(`${file}.tmp`, file);
      });
    return this.persistence;
  }
  cancel(id: string) {
    this.cancellations.get(id)?.();
  }
  busy() {
    return this.running;
  }
  async start(project: Project, settings: RenderSettings): Promise<RenderJob> {
    if (this.running) throw new Error("Aguarde a exportação atual.");
    if (!project.clips.length && !project.scenes.length)
      throw new Error("Adicione cenas ou clipes antes de exportar.");
    applyComposition(project, project);
    const id = randomUUID();
    const directory = path.join(this.store.directory, "exports");
    await mkdir(directory, { recursive: true });
    const job: RenderJob = {
      id,
      projectId: project.id,
      projectName: project.name,
      projectRevision: project.revision,
      status: "rendering",
      progress: 0,
      phase: "Preparando",
      outputPath: path.join(directory, `${project.id}-${id}.mp4`),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      settings,
    };
    this.jobs.unshift(job);
    this.running = true;
    try {
      await this.persist();
    } catch (error) {
      this.running = false;
      this.jobs.shift();
      throw error;
    }
    void this.execute(project, job)
      .catch((error: unknown) => {
        job.status = "failed";
        job.error = String(error);
      })
      .finally(() => {
        this.running = false;
      });
    return job;
  }
  private async execute(project: Project, job: RenderJob) {
    const controller = new AbortController();
    this.cancellations.set(job.id, () => controller.abort());
    try {
      const rendered = {
        ...project,
        width: job.settings.width,
        height: job.settings.height,
        fps: job.settings.fps,
        captions: job.settings.captions ? project.captions : [],
      };
      // Preserve seconds when the export FPS differs from the edit FPS.
      const ratio = rendered.fps / project.fps;
      rendered.durationInFrames = Math.max(
        1,
        Math.round(project.durationInFrames * ratio),
      );
      rendered.clips = project.clips.map((c) => ({
        ...c,
        from: Math.round(c.from * ratio),
        durationInFrames: Math.max(
          1,
          Math.round((c.from + c.durationInFrames) * ratio) -
            Math.round(c.from * ratio),
        ),
        trimBefore: Math.round((c.trimBefore ?? 0) * ratio),
        volume: job.settings.audio ? c.volume : 0,
      }));
      rendered.scenes = project.scenes.map((s) => ({
        ...s,
        from: Math.round(s.from * ratio),
        durationInFrames: Math.max(
          1,
          Math.round((s.from + s.durationInFrames) * ratio) -
            Math.round(s.from * ratio),
        ),
      }));
      await this.render(
        rendered,
        controller.signal,
        job.outputPath,
        (progress) => {
          job.progress = progress;
          job.phase = "Renderizando";
        },
        job.settings.quality,
      );
      controller.signal.throwIfAborted();
      const info = await stat(job.outputPath);
      if (info.size < 100) throw new Error("MP4 vazio.");
      job.phase = "Validando MP4";
      const expectsAudio = job.settings.audio && rendered.clips.some(c =>
        c.volume !== 0 && project.assets.some(a => a.id === c.assetId && a.kind === "audio"),
      );
      await validateMp4(job.outputPath, { ...rendered, audio: expectsAudio });
      controller.signal.throwIfAborted();
      // Both manual export and autoRender pass here. Never delete desktop databases/assets.
      // A UUID or arbitrary project title is not proof of numbered production ownership.
      const numbered = /^video-(\d{3})$/i.exec(project.name.trim());
      if (numbered && existsSync(path.join(this.root, "src/Root.tsx"))) {
        job.phase = "Arquivando entrega e verificando retenção";
        const delivery = path.join(this.root, "deliveries", `${project.name}-${job.id}.mp4`);
        await mkdir(path.dirname(delivery), { recursive: true });
        await copyFile(job.outputPath, delivery, constants.COPYFILE_EXCL);
        await completeProduction({
          root: this.root, current: Number(numbered[1]), output: delivery,
          expected: { ...rendered, audio: expectsAudio },
          references: this.store.list().flatMap(p => p.assets.map(a => a.path)),
          check: async (root, _current, edits = []) => {
            controller.signal.throwIfAborted();
            await checkProject(root, undefined, edits);
            await this.validate(rendered, controller.signal);
          },
        });
      }
      job.bytes = info.size;
      job.status = "completed";
      job.progress = 1;
      job.phase = "Concluído";
    } catch (error) {
      job.status = controller.signal.aborted ? "cancelled" : "failed";
      job.phase = controller.signal.aborted ? "Cancelado" : "Falhou";
      job.error = error instanceof Error ? error.message : String(error);
    } finally {
      job.updatedAt = new Date().toISOString();
      this.cancellations.delete(job.id);
      await this.persist();
    }
  }
  async validate(project: Project, signal: AbortSignal) {
    await this.render(project, signal);
  }
  private async render(
    project: Project,
    signal: AbortSignal,
    output?: string,
    progress?: (p: number) => void,
    quality = "balanced",
  ) {
    const renderer = await import("@remotion/renderer");
    signal.throwIfAborted();
    const files = new Map<string, string>();
    for (const asset of project.assets.filter((a) =>
      project.clips.some((c) => c.assetId === a.id),
    )) {
      const file = await assetPath(this.store, asset);
      await stat(file);
      files.set(asset.id, file);
    }
    const token = randomUUID();
    const server = createServer((request, response) => {
      void (async () => {
        const file = files.get((request.url ?? "").replace(`/${token}/`, ""));
        if (
          !request.url?.startsWith(`/${token}/`) ||
          !file ||
          !["GET", "HEAD"].includes(request.method ?? "")
        ) {
          response.writeHead(404).end();
          return;
        }
        const info = await stat(file);
        let start = 0,
          end = info.size - 1;
        const range = request.headers.range;
        if (range) {
          const match = /^bytes=(\d+)-(\d*)$/.exec(range);
          if (!match) {
            response.writeHead(416).end();
            return;
          }
          start = Number(match[1]);
          if (match[2]) end = Math.min(end, Number(match[2]));
          if (start > end || end >= info.size) {
            response.writeHead(416).end();
            return;
          }
        }
        response.writeHead(range ? 206 : 200, {
          "Content-Type": mime(file),
          "Content-Length": info.size ? end - start + 1 : 0,
          "Accept-Ranges": "bytes",
          "Access-Control-Allow-Origin": "*",
          ...(range
            ? { "Content-Range": `bytes ${start}-${end}/${info.size}` }
            : {}),
        });
        if (request.method === "HEAD" || !info.size) response.end();
        else
          createReadStream(file, { start, end })
            .on("error", () => response.destroy())
            .pipe(response);
      })().catch(() => response.writeHead(404).end());
    });
    await new Promise<void>((resolve, reject) => {
      server.once("error", reject);
      server.listen(0, "127.0.0.1", resolve);
    });
    const address = server.address() as { port: number };
    const sources = Object.fromEntries(
      [...files.keys()].map((id) => [
        id,
        `http://127.0.0.1:${address.port}/${token}/${id}`,
      ]),
    );
    const { cancel, cancelSignal } = renderer.makeCancelSignal();
    signal.addEventListener("abort", cancel, { once: true });
    const chrome =
      process.env.CLIPRUSH_BROWSER ??
      (process.platform === "win32"
        ? path.join(
            process.env.ProgramFiles ?? "",
            "Google/Chrome/Application/chrome.exe",
          )
        : undefined);
    const browserExecutable = chrome && existsSync(chrome) ? chrome : undefined;
    try {
      signal.throwIfAborted();
      const serveUrl = path.join(this.root, "dist/render");
      const inputProps = { project, sources };
      const composition = await renderer.selectComposition({
        serveUrl,
        id: "ClipRushProject",
        inputProps,
        browserExecutable,
      });
      if (output)
        await renderer.renderMedia({
          serveUrl,
          composition,
          inputProps,
          outputLocation: output,
          codec: "h264",
          pixelFormat: "yuv420p",
          audioCodec: "aac",
          crf: quality === "high" ? 18 : quality === "draft" ? 28 : 21,
          overwrite: false,
          concurrency: 2,
          browserExecutable,
          cancelSignal,
          onProgress: (p) => progress?.(p.progress),
        });
      else {
        const blocks = [...project.scenes, ...project.clips];
        const frames = new Set([
          0,
          ...blocks.map((s) =>
            Math.min(
              project.durationInFrames - 1,
              s.from + Math.floor(s.durationInFrames / 2),
            ),
          ),
        ]);
        for (const frame of frames) {
          signal.throwIfAborted();
          await renderer.renderStill({
            serveUrl,
            composition,
            inputProps,
            frame,
            imageFormat: "png",
            scale: 0.25,
            browserExecutable,
            cancelSignal,
          });
        }
      }
    } finally {
      signal.removeEventListener("abort", cancel);
      server.closeAllConnections();
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  }
}
