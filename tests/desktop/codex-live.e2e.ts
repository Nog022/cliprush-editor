import { test, expect, _electron as electron } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

test("live Codex generates and edits a real validated composition in the same session", async () => {
  test.skip(
    process.env.CLIPRUSH_TEST_LIVE_CODEX !== "1",
    "Requer autenticação real do Codex e usa o modelo configurado.",
  );
  test.setTimeout(600000);
  const directory = path.resolve("out", `codex-live-${randomUUID()}`);
  await mkdir(directory, { recursive: true });
  const env: Record<string, string> = {
    ...(process.env as Record<string, string>),
    CLIPRUSH_DATA_HOME: directory,
  };
  delete env.ELECTRON_RUN_AS_NODE;
  const launch = () => electron.launch({ args: ["."], env });
  let app = await launch();
  try {
    let page = await app.firstWindow();
    const connection = await page.evaluate(() => window.cliprush.codexStatus());
    expect(connection.connected, connection.error).toBe(true);
    expect(connection.authenticated).toBe(true);
    const model =
      connection.models.find((m) => m.model === connection.configuredModel) ??
      connection.models.find((m) => m.isDefault) ??
      connection.models[0];
    expect(model).toBeTruthy();
    console.log(`Live Codex model ${model.model}`);
    const project = await page.evaluate(async (modelId) => {
      const p = await window.cliprush.createProject({
        name: "Teste Codex real",
        channelId: "cliprush",
        language: "pt-BR",
        category: "Teste",
        width: 320,
        height: 240,
        fps: 10,
        durationInFrames: 10,
      });
      return window.cliprush.saveProject({
        ...p,
        generation: {
          prompt:
            "Crie uma cena abstrata de exatamente 10 quadros, fundo #101827, título ClipRush e animação fade. Sem mídias nem legendas. Retorne JSON. Esta é uma fixture técnica do editor, sem produção em src/videos. Evite ferramentas se os dados já forem suficientes.",
          references: [],
          autoRender: true,
          model: modelId,
        },
      });
    }, model.model);
    await page.evaluate((id) => window.cliprush.generate(id), project.id);
    await expect
      .poll(
        async () => {
          const status = await page.evaluate(
            (id) => window.cliprush.productionStatus(id),
            project.id,
          );
          if (status.job?.status === "failed")
            throw new Error(status.job.error);
          return status.job?.status;
        },
        { timeout: 240000, intervals: [1000, 3000] },
      )
      .toBe("completed");
    const first = await page.evaluate(
      (id) => window.cliprush.productionStatus(id),
      project.id,
    );
    const generated = await page.evaluate(
      (id) =>
        window.cliprush
          .workspace()
          .then((w) => w.projects.find((p) => p.id === id)!),
      project.id,
    );
    expect(generated.scenes[0].title).toBe("ClipRush");
    const renders = await page.evaluate(() => window.cliprush.listRenders());
    expect(renders.find((r) => r.id === first.job?.renderId)?.status).toBe(
      "completed",
    );
    await app.close();
    app = await launch();
    page = await app.firstWindow();
    await page.evaluate(async (id) => {
      const p = (await window.cliprush.workspace()).projects.find(
        (p) => p.id === id,
      )!;
      await window.cliprush.saveProject({
        ...p,
        generation: {
          ...p.generation!,
          autoRender: false,
          prompt:
            "Mude apenas o título da cena para Revisado. Preserve duração, IDs e demais propriedades. Retorne JSON completo.",
        },
      });
      await window.cliprush.generate(id);
    }, project.id);
    await expect
      .poll(
        async () => {
          const status = await page.evaluate(
            (id) => window.cliprush.productionStatus(id),
            project.id,
          );
          if (status.job?.status === "failed")
            throw new Error(status.job.error);
          return status.job?.status;
        },
        { timeout: 240000, intervals: [1000, 3000] },
      )
      .toBe("completed");
    const second = await page.evaluate(
      (id) => window.cliprush.productionStatus(id),
      project.id,
    );
    expect(second.job?.threadId).toBe(first.job?.threadId);
    const edited = await page.evaluate(
      (id) =>
        window.cliprush
          .workspace()
          .then((w) => w.projects.find((p) => p.id === id)!),
      project.id,
    );
    expect(edited.scenes[0].title).toBe("Revisado");
    expect(edited.scenes[0].id).toBe(generated.scenes[0].id);
    const restored = await page.evaluate(
      (id) => window.cliprush.restoreProduction(id),
      project.id,
    );
    expect(restored.scenes[0].title).toBe("ClipRush");
    await page.evaluate(async (id) => {
      await window.cliprush.generate(id);
      await window.cliprush.cancelProduction(id);
    }, project.id);
    await expect
      .poll(
        () =>
          page
            .evaluate((id) => window.cliprush.productionStatus(id), project.id)
            .then((s) => s.job?.status),
        { timeout: 30000 },
      )
      .toBe("cancelled");
  } finally {
    await app.close();
  }
});
