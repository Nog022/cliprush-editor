import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import path from "node:path";
import { produceInput, produceFromCLI, type ProduceEvent } from "../../desktop/cli";
import { Store } from "../../desktop/store";
import type { ProductionService } from "../../desktop/production";
import type { RenderService } from "../../desktop/render";

test("CLI accepts exact narration/instructions and rejects malformed requests without credentials", () => {
  const input = produceInput({ narration: "Texto\nexato.", instructions: "Editar com cortes.", apiKey: "never-copy" });
  assert.equal(input.narration, "Texto\nexato.");
  assert.equal(JSON.stringify(input).includes("never-copy"), false);
  for (const bad of [{}, { narration: "", instructions: "Editar" }, { narration: "Texto", instructions: "" }, { narration: "Texto", instructions: "Editar", media: "x" }]) assert.throws(() => produceInput(bad));
});
test("CLI delegates to existing production, preserves preferences and emits verified final path", async () => {
  await mkdir("out", { recursive: true });
  const directory = await mkdtemp(path.resolve("out/cli-unit-"));
  const store = new Store(directory);
  try {
    await writeFile(path.join(directory, "generation-preferences.json"), JSON.stringify({ model: "existing", effort: "medium" }));
    const outputPath = path.join(directory, "fixture.mp4"); await writeFile(outputPath, "fixture");
    const source = store.create({ name: "Existing library", channelId: "cliprush", language: "pt-BR", category: "Test", width: 128, height: 128, fps: 30, durationInFrames: 30 });
    store.save({ ...source, assets: [{ id: "library-video", name: "Existing footage", kind: "video", mode: "reference", path: outputPath, hash: "a".repeat(64), bytes: 1, duration: 20 }] }, true);
    let projectId = "";
    const service = {
      busy: () => false,
      start: async (id: string) => { projectId = id; const project = store.get(id); assert.equal(project.generation!.narrationScript, "Texto aprovado"); assert.equal(project.generation!.model, "existing"); assert.equal(project.generation!.autoRender, true); assert.equal(project.assets[0].id, "library-video"); },
      status: async () => ({ approvals: [], job: { status: "completed", progress: 1, logs: [], renderId: "render" } }),
    } as unknown as ProductionService;
    const renders = { busy: () => false, get: () => ({ status: "completed", outputPath }) } as unknown as RenderService;
    const events: ProduceEvent[] = [];
    await produceFromCLI(produceInput({ narration: "Texto aprovado", instructions: "Editar" }), store, service, renders, async event => { events.push(event); });
    assert.equal(events.at(-1)!.outputPath, outputPath); assert.equal(events.at(-1)!.projectId, projectId);
    assert.equal(events.at(-1)!.type, "completed");
    assert.equal(store.get(projectId).exportSettings.audio, true); assert.equal(store.get(projectId).exportSettings.captions, true);
    await assert.rejects(produceFromCLI(produceInput({ narration: "Texto", instructions: "Editar" }), store, { busy: () => true } as unknown as ProductionService, renders, async () => undefined), /ativa/);
  } finally { store.close(); }
});
test("CLI propagates production errors and refuses interactive approvals", async () => {
  const directory = await mkdtemp(path.resolve("out/cli-unit-"));
  const store = new Store(directory);
  try {
    let cancelled = 0, declined = 0;
    const renders = { busy: () => false } as RenderService;
    for (const approval of [false, true]) {
      const service = { busy: () => false, start: async () => undefined,
        status: async () => ({ approvals: approval ? [{ id: "approval" }] : [], job: { status: "failed", error: "Fixture failure", progress: 0, logs: [] } }),
        cancel: async () => { cancelled++; }, codex: { answer: (_id: string, accepted: boolean) => { assert.equal(accepted, false); declined++; } },
      } as unknown as ProductionService;
      await assert.rejects(produceFromCLI(produceInput({ narration: "Texto", instructions: "Editar" }), store, service, renders, async () => undefined), approval ? /aprovação interativa/ : /Fixture failure/);
    }
    assert.equal(cancelled, 1); assert.equal(declined, 1);
  } finally { store.close(); }
});
