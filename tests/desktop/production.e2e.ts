import { test, expect, _electron as electron } from "@playwright/test";
import {
  mkdir,
  readFile,
  readdir,
  rename,
  stat,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import type { DesktopAPI, Project } from "../../shared/model";

test("production UI preserves references, reuses library, reports absent Codex and exports a real MP4", async () => {
  const directory = path.resolve("out", `production-e2e-${randomUUID()}`);
  await mkdir(directory, { recursive: true });
  const image = path.join(directory, "fixture.png");
  await writeFile(
    image,
    Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+afo0AAAAASUVORK5CYII=",
      "base64",
    ),
  );
  const audio = path.join(directory, "fixture.wav");
  const wav = Buffer.alloc(44 + 16000 * 2);
  wav.write("RIFF", 0);
  wav.writeUInt32LE(wav.length - 8, 4);
  wav.write("WAVEfmt ", 8);
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(16000, 24);
  wav.writeUInt32LE(32000, 28);
  wav.writeUInt16LE(2, 32);
  wav.writeUInt16LE(16, 34);
  wav.write("data", 36);
  wav.writeUInt32LE(32000, 40);
  for (let i = 0; i < 16000; i++)
    wav.writeInt16LE(
      Math.round(Math.sin((i * 2 * Math.PI * 440) / 16000) * 2000),
      44 + i * 2,
    );
  await writeFile(audio, wav);
  const env: Record<string, string> = {
    ...(process.env as Record<string, string>),
    CLIPRUSH_DATA_HOME: directory,
    CLIPRUSH_CODEX_BINARY: path.join(directory, "absent-codex.exe"),
  };
  delete env.ELECTRON_RUN_AS_NODE;
  const launch = () => electron.launch({ args: ["."], env });
  let app = await launch();
  try {
    let page = await app.firstWindow();
    await expect(
      page.getByRole("button", { name: "Criar meu próximo vídeo" }),
    ).toBeVisible();
    if (
      existsSync("public/videos/biblioteca/catalogo/gta6/cenas-descritas.json")
    ) {
      const candidates = await page.evaluate(() =>
        window.cliprush.searchCatalog("praia"),
      );
      expect(candidates.length).toBeGreaterThan(0);
      expect(candidates.length).toBeLessThanOrEqual(5);
      expect(candidates.every((c) => c.endSeconds > c.startSeconds)).toBe(true);
    }
    const project = await page.evaluate(async () => {
      const api: DesktopAPI = window.cliprush;
      const p = await api.createProject({
        name: "Produção integrada",
        channelId: "cliprush",
        language: "pt-BR",
        category: "GTA 6",
        width: 320,
        height: 240,
        fps: 10,
        durationInFrames: 10,
      });
      return api.saveProject({
        ...p,
        scenes: [
          {
            id: "scene-1",
            name: "Teste",
            from: 0,
            durationInFrames: 10,
            title: "ClipRush",
            subtitle: "Produção local",
            background: "#101827",
            accent: "#b5f36b",
            shape: "circle",
            animation: "fade",
          },
        ],
        generation: {
          prompt: "Preserve esta composição.",
          references: [],
          autoRender: false,
        },
      });
    });
    await app.evaluate(
      ({ dialog }, files) => {
        dialog.showOpenDialog = async () => ({
          canceled: false,
          filePaths: files,
        });
      },
      [image, audio],
    );
    const reused = await page.evaluate(async (id) => {
      const source = await window.cliprush.createProject({
        name: "Biblioteca compartilhada",
        channelId: "cliprush",
        language: "pt-BR",
        category: "GTA 6",
        width: 320,
        height: 240,
        fps: 10,
        durationInFrames: 10,
      });
      const imported = await window.cliprush.importMedia(
        source.id,
        "copy",
        "GTA 5",
      );
      if (!imported?.imported)
        throw new Error(imported?.errors.join("\n") ?? "Importação cancelada.");
      if (imported.project.revision !== source.revision + 1)
        throw new Error("A importação deve persistir uma revisão por lote.");
      const asset = imported!.project.assets[0];
      let target = await window.cliprush.reuseAsset(id, source.id, asset.id);
      target = await window.cliprush.reuseAsset(
        id,
        source.id,
        imported!.project.assets[1].id,
      );
      const audioAsset = target.assets.find((a) => a.kind === "audio")!;
      target = await window.cliprush.saveProject({
        ...target,
        clips: [
          {
            id: "test-image",
            assetId: target.assets.find((a) => a.kind === "image")!.id,
            from: 0,
            durationInFrames: 5,
            volume: 0,
            animation: "fade",
          },
          {
            id: "test-audio",
            assetId: audioAsset.id,
            from: 0,
            durationInFrames: 10,
            volume: 1,
            trimBefore: 0,
          },
        ],
      });
      return {
        sourcePath: asset.path,
        targetPath: target.assets[0].path,
        category: target.assets[0].category,
      };
    }, project.id);
    expect(reused.targetPath).toBe(reused.sourcePath);
    expect(reused.category).toBe("GTA 5");
    await app.evaluate(({ dialog }, file) => {
      dialog.showOpenDialog = async () => ({
        canceled: false,
        filePaths: [file],
      });
    }, image);
    const linked = await page.evaluate(async () => {
      const p = await window.cliprush.createProject({
        name: "Recuperação de referência",
        channelId: "cliprush",
        language: "pt-BR",
        category: "Teste",
        width: 320,
        height: 240,
        fps: 10,
        durationInFrames: 10,
      });
      return (await window.cliprush.importMedia(
        p.id,
        "reference",
        "Personalizada",
      ))!.project;
    });
    const relocated = path.join(directory, "relocated.png");
    await rename(image, relocated);
    const missing = await page.evaluate(
      (id) => window.cliprush.inspectAssets(id),
      linked.id,
    );
    expect(missing.assets[0].missing).toBe(true);
    await app.evaluate(({ dialog }, file) => {
      dialog.showOpenDialog = async () => ({
        canceled: false,
        filePaths: [file],
      });
    }, relocated);
    const relinked = await page.evaluate(
      (p) => window.cliprush.relinkAsset(p.id, p.assets[0].id),
      linked,
    );
    expect(relinked!.assets[0].hash).toBe(linked.assets[0].hash);
    const reference = path.join(directory, "roteiro.md");
    await writeFile(reference, "# Roteiro\nPreservar áudio existente.", "utf8");
    await app.evaluate(({ dialog }, file) => {
      dialog.showOpenDialog = async () => ({
        canceled: false,
        filePaths: [file],
      });
    }, reference);
    await page.evaluate(
      (id) => window.cliprush.attachReferences(id),
      project.id,
    );
    const packageRoot = path.join(directory, "packages");
    await mkdir(packageRoot);
    await app.evaluate(({ dialog }, folder) => {
      dialog.showOpenDialog = async () => ({
        canceled: false,
        filePaths: [folder],
      });
    }, packageRoot);
    expect(
      await page.evaluate(
        (id) => window.cliprush.exportProject(id),
        project.id,
      ),
    ).toBe(true);
    const manifest = path.join(
      packageRoot,
      (await readdir(packageRoot))[0],
      "project.cliprush.json",
    );
    await app.evaluate(({ dialog }, file) => {
      dialog.showOpenDialog = async () => ({
        canceled: false,
        filePaths: [file],
      });
    }, manifest);
    const importedPackage = await page.evaluate(() =>
      window.cliprush.importProject(),
    );
    expect(importedPackage?.generation?.references[0].name).toBe("roteiro.md");
    expect(importedPackage?.assets[0].category).toBe("GTA 5");
    expect(
      importedPackage?.clips.find((c) => c.id === "test-audio")?.trimBefore,
    ).toBe(0);
    await page.evaluate(
      (id) => window.cliprush.archiveProject(id, true),
      importedPackage!.id,
    );
    await page.reload();
    await page.getByRole("button", { name: /Meus projetos/ }).click();
    await page
      .getByRole("button", { name: /Produção integrada/ })
      .first()
      .click();
    await expect(page.getByLabel("Prompt de geração")).toHaveValue(
      "Preserve esta composição.",
    );
    await page.getByText("Referências e conexão", { exact: true }).click();
    await expect(page.getByText("roteiro.md", { exact: true })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Gerar vídeo", exact: true }),
    ).toBeDisabled();
    const status = await page.evaluate(() => window.cliprush.codexStatus());
    expect(status.connected).toBe(false);
    expect(status.error).toBeTruthy();
    await page.evaluate((id) => window.cliprush.generate(id), project.id);
    await expect
      .poll(() =>
        page
          .evaluate((id) => window.cliprush.productionStatus(id), project.id)
          .then((s) => s.job?.status),
      )
      .toBe("failed");
    const stillSaved = await page.evaluate(
      (id) =>
        window.cliprush
          .workspace()
          .then((w) => w.projects.find((p) => p.id === id)),
      project.id,
    );
    expect(stillSaved?.scenes[0].title).toBe("ClipRush");
    // Observe real IPC invocations after the panel reaches its terminal state.
    await app.evaluate(({ ipcMain }) => {
      const handlers = (ipcMain as unknown as {
        _invokeHandlers: Map<string, (...args: unknown[]) => unknown>;
      })._invokeHandlers;
      const metrics = globalThis as typeof globalThis & { idleStatusCalls: number };
      metrics.idleStatusCalls = 0;
      for (const method of ["productionStatus", "listRenders"]) {
        const channel = `cliprush:${method}`;
        const original = handlers.get(channel)!;
        ipcMain.removeHandler(channel);
        ipcMain.handle(channel, (...args) => {
          metrics.idleStatusCalls++;
          return original(...args);
        });
      }
    });
    // Allow one in-flight terminal update to settle, then measure two idle seconds.
    await page.waitForTimeout(1200);
    const idleBefore = await app.evaluate(() =>
      (globalThis as typeof globalThis & { idleStatusCalls: number }).idleStatusCalls,
    );
    await page.waitForTimeout(2200);
    expect(await app.evaluate(() =>
      (globalThis as typeof globalThis & { idleStatusCalls: number }).idleStatusCalls,
    )).toBe(idleBefore);
    await page
      .getByRole("button", { name: "Exportar MP4", exact: true })
      .click();
    await expect
      .poll(
        () =>
          page
            .evaluate(() => window.cliprush.listRenders())
            .then((jobs) => jobs[0]?.status),
        { timeout: 120000 },
      )
      .toBe("completed");
    const jobs = await page.evaluate(() => window.cliprush.listRenders());
    expect((await stat(jobs[0].outputPath)).size).toBeGreaterThan(1000);
    expect((await readFile(jobs[0].outputPath)).subarray(4, 8).toString()).toBe(
      "ftyp",
    );
    await expect(
      page.getByRole("button", { name: "Reproduzir MP4" }).first(),
    ).toBeVisible();
    await page.getByLabel("Ir para quadro").fill("5");
    await page.screenshot({
      path: path.join(directory, "editor.png"),
      fullPage: true,
    });
    await app.evaluate(({ dialog }, file) => {
      dialog.showOpenDialog = async () => ({
        canceled: false,
        filePaths: [file],
      });
    }, jobs[0].outputPath);
    const videoRender = await page.evaluate(async () => {
      const p = await window.cliprush.createProject({
        name: "Trecho de vídeo",
        channelId: "cliprush",
        language: "pt-BR",
        category: "Teste",
        width: 320,
        height: 240,
        fps: 10,
        durationInFrames: 5,
      });
      const imported = await window.cliprush.importMedia(
        p.id,
        "reference",
        "Personalizada",
      );
      if (!imported?.imported) throw new Error(imported?.errors.join("\n"));
      const asset = imported.project.assets[0];
      const saved = await window.cliprush.saveProject({
        ...imported.project,
        clips: [
          {
            id: "video-trim",
            assetId: asset.id,
            from: 0,
            trimBefore: 2,
            durationInFrames: 5,
            volume: 1,
            animation: "zoom",
          },
        ],
      });
      return window.cliprush.startRender(saved.id, saved.exportSettings, "");
    });
    await expect
      .poll(
        () =>
          page
            .evaluate(() => window.cliprush.listRenders())
            .then((jobs) => jobs.find((r) => r.id === videoRender!.id)?.status),
        { timeout: 120000 },
      )
      .toBe("completed");
    const cancelled = await page.evaluate(async (id) => {
      const p = (await window.cliprush.workspace()).projects.find(
        (p) => p.id === id,
      )!;
      const job = await window.cliprush.startRender(id, p.exportSettings, "");
      await window.cliprush.cancelRender(job!.id);
      return job!.id;
    }, project.id);
    await expect
      .poll(
        () =>
          page
            .evaluate(() => window.cliprush.listRenders())
            .then((jobs) => jobs.find((j) => j.id === cancelled)?.status),
        { timeout: 60000 },
      )
      .toBe("cancelled");
    await app.close();
    app = await launch();
    page = await app.firstWindow();
    const restored = await page.evaluate(() => window.cliprush.workspace());
    const saved = restored.projects.find((p: Project) => p.id === project.id)!;
    expect(saved.generation?.references[0].name).toBe("roteiro.md");
    expect(restored.renders.some((r) => r.status === "completed")).toBe(true);
  } finally {
    await app.close();
  }
});
