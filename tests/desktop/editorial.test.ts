import { test } from "node:test";
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { execFileSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Project } from "../../shared/model";
import { compileEditorialPlan, narrationBlocks, requestedEdits, timedText } from "../../shared/editorial";
import { prepareNarration, selectWhisperPython } from "../../desktop/narration";
import { applyComposition } from "../../shared/production";
import { ProductionService } from "../../desktop/production";
import type { CodexClient } from "../../desktop/codex";
import { RenderService } from "../../desktop/render";
import type { CatalogService } from "../../desktop/catalog";
import { Store } from "../../desktop/store";
import { hashFile } from "../../desktop/files";

test("Whisper Python selection respects explicit configuration and rejects unusable interpreters", async () => {
  const signal = new AbortController().signal;
  const executable = path.resolve("out/python-fixture/python.exe");
  const tried: string[] = [];
  const selected = await selectWhisperPython(signal, { configured: executable, probe: async candidate => {
    tried.push(candidate); return executable;
  } });
  assert.equal(selected, executable); assert.deepEqual(tried, [executable]);
  await assert.rejects(selectWhisperPython(signal, { configured: executable, probe: async () => {
    throw new Error("No module named faster_whisper");
  } }), /CLIPRUSH_WHISPER_PYTHON.*faster_whisper/);
  const cancelled = new AbortController(); cancelled.abort();
  await assert.rejects(selectWhisperPython(cancelled.signal, { configured: executable }), /abort/i);
});

test("Whisper discovers Python 3.12 when PATH points to an unusable indexing environment", { skip: process.platform !== "win32" }, async () => {
  const directory = await mkdtemp(path.resolve("out/whisper-discovery-"));
  try {
    const installation = path.join(directory, "Programs", "Python", "Python312");
    await mkdir(installation, { recursive: true });
    await mkdir(path.join(directory, "Programs", "Python", "Python313"));
    const candidates: string[] = [];
    const executable = path.join(installation, "python.exe");
    const result = await selectWhisperPython(new AbortController().signal, {
      configured: "", localAppData: directory, probe: async candidate => {
        candidates.push(candidate);
        if (candidate === "python") throw new Error("metadata_errors decoder incompatibility");
        return candidate;
      },
    });
    assert.equal(result, executable);
    assert.deepEqual(candidates, ["python", executable]);
  } finally { await rm(directory, { recursive: true, force: true }); }
});

function fixture(): Project {
  return {
    schemaVersion: 2, id: "fixture", revision: 0, channelId: "cliprush", name: "Fixture",
    language: "pt-BR", category: "Test", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), archived: false,
    type: "narrated", width: 128, height: 128, fps: 30, durationInFrames: 12,
    assets: [
      { id: "voice", name: "narracao.wav", kind: "audio", role: "narration", mode: "reference", path: "voice.wav", hash: "a".repeat(64), bytes: 1, duration: 1 },
      { id: "video", name: "video.mp4", kind: "video", mode: "reference", path: "video.mp4", hash: "b".repeat(64), bytes: 1, duration: 3 },
    ],
    clips: [{ id: "original-voice", assetId: "voice", from: 0, durationInFrames: 12, trimBefore: 6, volume: 0.8 }],
    scenes: [], captions: [], exportSettings: { preset: "square", width: 128, height: 128, fps: 30, quality: "draft", audio: true, captions: true },
    generation: { prompt: "Use três trechos descontínuos, zoom e legendas temporizadas.", references: [{ name: "timings.json", content: JSON.stringify([0, 1, 2].map(i => ({ text: `Bloco ${i}`, startMs: i * 4 / 30 * 1000, endMs: (i + 1) * 4 / 30 * 1000 }))) }], autoRender: true },
  };
}

function plan() {
  return {
    durationInFrames: 12,
    requirements: { visualClips: 3, discontinuous: true, zoom: true, fade: false, captions: true },
    catalogQueries: [] as string[], errors: [] as string[], audioClips: [],
    blocks: [0, 1, 2].map(i => ({
      from: i * 4, durationInFrames: 4, narrationText: `Bloco ${i}`, evidence: "timings.json: intervalos em quadros fornecidos pela fixture",
      clips: [{ id: `shot-${i}`, assetId: "video", from: i * 4, durationInFrames: 4, trimBefore: i * 30, volume: 0, animation: i === 1 ? "zoom" : "none" }],
      scenes: [], captions: [{ text: `Bloco ${i}`, startMs: i * 4 / 30 * 1000, endMs: (i + 1) * 4 / 30 * 1000 }],
    })),
  };
}

test("narration without SRT uses measured source words, offsets/trims and private cache without enabling captions", async () => {
  const directory = await mkdtemp(path.resolve("out/narration-test-"));
  const store = new Store(directory);
  try {
    const p = fixture(); p.generation!.references = []; p.generation!.prompt = "Cortes sem legendas";
    p.assets[0].path = path.join(directory, "audio.bin");
    await writeFile(p.assets[0].path, "fixture content hashed without decoding in this adapter test");
    let calls = 0;
    const transcribe = async (requestFile: string) => {
      calls++;
      assert.equal(JSON.parse(await readFile(requestFile, "utf8")).audio, p.assets[0].path);
      return { method: "fixture measured source intervals", scriptReused: false, words: [
        { text: "Antes", startMs: 0, endMs: 100 },
        { text: "Fala.", startMs: 200, endMs: 350 },
        { text: "Final.", startMs: 400, endMs: 650 },
      ] };
    };
    const signal = new AbortController().signal;
    const aligned = await prepareNarration(p, store, directory, signal, () => undefined, transcribe);
    assert.deepEqual(timedText(aligned), [
      { text: "Fala.", startMs: 0, endMs: 150, timestampMs: null, confidence: null },
      { text: "Final.", startMs: 200, endMs: 400, timestampMs: null, confidence: null },
    ]);
    assert.deepEqual(narrationBlocks(aligned).map(b => [b.from, b.durationInFrames]), [[0, 6], [6, 6]]);
    assert.deepEqual(aligned.clips, p.clips); assert.deepEqual(aligned.captions, []);
    assert.deepEqual(p.generation!.references, []);
    const moved = { ...p, clips: [{ ...p.clips[0], from: 30 }] };
    const cached = await prepareNarration(moved, store, directory, signal, () => undefined, transcribe);
    assert.equal(timedText(cached)[0].startMs, 1000); assert.equal(calls, 1);
    await prepareNarration(aligned, store, directory, signal, () => undefined, transcribe);
    assert.equal(calls, 1);
    await writeFile(p.assets[0].path, "changed source");
    await assert.rejects(prepareNarration(p, store, directory, signal, () => undefined, async () => ({ words: [] })), /temporizadas/);
    const controller = new AbortController(); controller.abort();
    await assert.rejects(prepareNarration(p, store, directory, controller.signal, () => undefined, transcribe), /abort/i);
  } finally { store.close(); await rm(directory, { recursive: true, force: true }); }
});

test("optional incompatible effects and unconfirmed highlights do not block synchronized real cuts", () => {
  const project = fixture(); project.generation!.prompt = "Três trechos sem legendas";
  const data = { ...plan(), requirements: { ...plan().requirements, captions: false },
    limitations: [
      { code: "ENQUADRAMENTO_NAO_REPRESENTAVEL", detail: "Usado zoom global disponível em vez de crop localizado.", essential: false, resolution: "adapted" },
      { code: "SIMULACAO_NAO_REPRESENTAVEL", detail: "Simulação opcional omitida; vídeo original preservado.", essential: false, resolution: "omitted" },
      { code: "VALIDACAO_VISUAL_PENDENTE", detail: "Destaque não confirmado omitido.", essential: false, resolution: "omitted" },
    ], highlights: [{ assetId: "video", sceneIds: ["unconfirmed"], confirmed: false }],
  };
  data.blocks.forEach(b => b.captions = []);
  const graphic = { id: "unconfirmed", name: "Destaque", from: 0, durationInFrames: 4, title: "Detalhe não confirmado", subtitle: "", background: "#101827", accent: "#b5f36b", shape: "none", animation: "none" };
  const input = { ...data, blocks: data.blocks.map((b, i) => ({ ...b, scenes: i === 0 ? [graphic] : [] })) };
  const result = compileEditorialPlan(project, input);
  assert.equal(result.captions.length, 0); assert.equal(result.scenes.length, 0);
  assert.equal(compileEditorialPlan(project, input, ["video"]).scenes.length, 0, "providing an image does not confirm its detail");
  const confirmed = { ...input, highlights: [{ ...data.highlights[0], confirmed: true }] };
  assert.equal(compileEditorialPlan(project, confirmed).scenes.length, 0, "model confirmation alone is not image inspection");
  assert.equal(compileEditorialPlan(project, confirmed, ["video"]).scenes.length, 1);
  assert.deepEqual(result.clips.slice(1).map(c => c.trimBefore), [0, 30, 60]);
  assert.throws(() => compileEditorialPlan(project, { ...input, limitations: [{ ...data.limitations[1], essential: true }] }), /essencial/);
  assert.doesNotThrow(() => compileEditorialPlan(project, { ...input, limitations: [{ ...data.limitations[1], resolution: "blocked" }] }));
  assert.throws(() => compileEditorialPlan(project, { ...input, errors: ["ALINHAMENTO_AUSENTE"] }), /ALINHAMENTO_AUSENTE/);
  const invented = structuredClone(input); invented.blocks[1].narrationText = "Fala inventada";
  assert.throws(() => compileEditorialPlan(project, invented), /alinhamento comprovado/);
  const shifted = structuredClone(input); shifted.blocks[0].durationInFrames = 6; shifted.blocks[1].from = 6; shifted.blocks[1].durationInFrames = 2;
  shifted.blocks[0].clips[0].durationInFrames = 6; shifted.blocks[1].clips[0].from = 6; shifted.blocks[1].clips[0].durationInFrames = 2;
  assert.throws(() => compileEditorialPlan(project, shifted), /alinhamento comprovado/);
  const overlay = { ...input, requirements: { ...input.requirements, visualClips: 0, discontinuous: false, zoom: false }, blocks: [{
    from: 0, durationInFrames: 12, narrationText: "Bloco 0 Bloco 1 Bloco 2", evidence: "fixture", scenes: [], captions: [],
    clips: [{ id: "overlay", assetId: "video", from: 0, durationInFrames: 12, trimBefore: 0, volume: 0, animation: "none" }],
  }] };
  project.generation!.prompt = "Edite sem legendas";
  assert.throws(() => compileEditorialPlan(project, overlay), /cortes visuais reais/);
  const fakeCuts = structuredClone(input);
  fakeCuts.requirements = { ...fakeCuts.requirements, visualClips: 0, discontinuous: false, zoom: false };
  fakeCuts.blocks.forEach((b, i) => { b.clips[0].trimBefore = i * 4; b.clips[0].animation = "none"; });
  assert.throws(() => compileEditorialPlan(project, fakeCuts), /cortes visuais reais/);
});

test("editorial plan compiles three real trims, zoom and timed captions, preserving narration exactly", () => {
  const p = fixture();
  const result = compileEditorialPlan(p, plan());
  assert.deepEqual(result.clips[0], p.clips[0]);
  assert.deepEqual(result.clips.slice(1).map(c => [c.from, c.trimBefore, c.durationInFrames]), [[0, 0, 4], [4, 30, 4], [8, 60, 4]]);
  assert.equal(result.clips[2].animation, "zoom");
  assert.equal(result.captions.length, 3);
  assert.equal(result.captions[2].endMs, 400);
  assert.deepEqual(applyComposition(p, result), result);
  assert.equal(p.clips.length, 1);
});

test("editorial validation rejects insufficient cuts, effects, captions, gaps, bounds and duplicated audio", () => {
  const cases: [string, (p: ReturnType<typeof plan>, project: Project) => void, RegExp][] = [
    ["model omits a requested requirement", (p) => { p.requirements.zoom = false; p.blocks[1].clips[0].animation = "none"; }, /zoom/],
    ["visual gap", p => { p.blocks[1].clips[0].durationInFrames = 3; }, /Cobertura visual/],
    ["source overrun", p => { p.blocks[2].clips[0].trimBefore = 89; }, /excede/],
    ["continuous source", p => { p.blocks.forEach((b, i) => b.clips[0].trimBefore = i * 4); }, /descontínuos/],
    ["invented caption text", p => { p.blocks[1].captions[0].text = "outra fala"; }, /corresponde/],
    ["duplicate narration", p => { p.blocks[0].clips[0].assetId = "voice"; }, /duplicou/],
    ["unknown source duration", (_p, project) => { project.assets[1].duration = undefined; }, /duração conhecida/],
    ["muted export", (_p, project) => { project.exportSettings.audio = false; }, /Ative áudio/],
    ["captions disabled in export", (_p, project) => { project.exportSettings.captions = false; }, /Legendas/],
    ["missing timing evidence", p => { p.blocks[1].evidence = ""; }, /Evidência/],
    ["missing alignment", (_p, project) => { project.generation!.references = []; }, /alinhamento comprovado/],
    ["caption before narration", (_p, project) => { project.clips[0].from = 3; project.clips[0].durationInFrames = 9; }, /intervalo audível/],
    ["reported missing input", p => { p.errors = ["Falta alinhamento temporal da narração"]; }, /Falta alinhamento/],
    ["too few shots", p => {
      p.blocks[0].durationInFrames = p.blocks[0].clips[0].durationInFrames = 8;
      p.blocks[0].narrationText = "Bloco 0 Bloco 1";
      p.blocks.splice(1, 1);
    }, /exigidos 3/],
  ];
  for (const [label, change, expected] of cases) {
    const p = plan(), project = fixture();
    change(p, project);
    assert.throws(() => compileEditorialPlan(project, p), expected, label);
  }
  const p = plan(); p.durationInFrames = 13; p.blocks[2].durationInFrames = 5; p.blocks[2].clips[0].durationInFrames = 5;
  assert.throws(() => compileEditorialPlan(fixture(), p), /acompanhar a narração|alinhamento comprovado/);
});

test("measured captions are automatic and model timing is deterministically replaced", () => {
  for (const mode of ["omitted", "invented times", "crossing phrase"] as const) {
    const p = plan();
    if (mode === "omitted") p.blocks.forEach(b => b.captions = []);
    if (mode === "invented times") p.blocks[1].captions[0] = { text: "Bloco 1", startMs: 0, endMs: 99999 };
    if (mode === "crossing phrase") p.blocks[0].captions = [{ text: "Bloco 0 Bloco 1", startMs: 0, endMs: 99999 }];
    const result = compileEditorialPlan(fixture(), p);
    assert.deepEqual(result.captions.map(c => [c.text, c.startMs, c.endMs]),
      [0, 1, 2].map(i => [`Bloco ${i}`, i * 4 / 30 * 1000, (i + 1) * 4 / 30 * 1000]));
  }
  const misplaced = plan(); misplaced.blocks[0].captions[0].text = "Bloco 2";
  assert.throws(() => compileEditorialPlan(fixture(), misplaced), /alinhamento comprovado/);
});

test("real Whisper word times survive rounded block boundaries and split measured phrases", () => {
  // Timings from the failed persisted plan/cache; no user media or database access.
  const words = [
    { text: "Antes.", startMs: 0, endMs: 100 },
    { text: "Curtiu", startMs: 15860, endMs: 16180 },
    { text: "esse", startMs: 16180, endMs: 16360 },
    { text: "detalhe?", startMs: 16360, endMs: 16820 },
    { text: "algo", startMs: 26940, endMs: 27220 },
    { text: "muito", startMs: 27220, endMs: 27700 },
    { text: "maior?", startMs: 27700, endMs: 28080 },
    { text: "Imagina", startMs: 28080, endMs: 29060 },
  ];
  const project = fixture();
  project.durationInFrames = project.clips[0].durationInFrames = 900;
  project.assets[0].duration = 31; project.assets[1].duration = 100;
  project.generation!.references = [{ name: "automatic-narration-alignment.json", content: JSON.stringify(words) }];
  const input = plan(); input.durationInFrames = 900;
  const bounds = [0, 476, 760, 842, 900];
  const texts = ["Antes.", "Curtiu esse detalhe?", "algo muito maior?", "Imagina"];
  input.blocks = texts.map((text, i) => ({ ...plan().blocks[0], from: bounds[i], durationInFrames: bounds[i + 1] - bounds[i],
    narrationText: text, captions: [], clips: [{ ...plan().blocks[i % 3].clips[0], id: `real-${i}`,
      from: bounds[i], durationInFrames: bounds[i + 1] - bounds[i], trimBefore: i * 700 }],
  }));
  input.blocks[2].captions = [{ text: "algo muito maior? Imagina", startMs: 26940, endMs: 29060 }];
  const snapshot = structuredClone(input);
  const result = compileEditorialPlan(project, input);
  assert.deepEqual(result.captions.map(c => [c.text, c.startMs, c.endMs]), [
    ["Antes.", 0, 100], ["Curtiu esse detalhe?", 476 * 1000 / 30, 16820],
    ["algo muito maior?", 26940, 842 * 1000 / 30], ["Imagina", 28080, 29060],
  ]);
  assert.deepEqual(result.clips[0], project.clips[0]);
  assert.deepEqual(result.clips.slice(1).map(c => [c.from, c.durationInFrames, c.trimBefore]), input.blocks.map(b => [b.clips[0].from, b.clips[0].durationInFrames, b.clips[0].trimBefore]));
  assert.deepEqual(input, snapshot);
  words[6].endMs += 100; // Actual word cut, beyond nearest-frame rounding.
  project.generation!.references[0].content = JSON.stringify(words);
  assert.throws(() => compileEditorialPlan(project, input), /alinhamento comprovado/);
});

test("request floors respect explicit negation and work without accents", () => {
  assert.deepEqual(requestedEdits("tres trechos descontinuos com zoom e legendas"), { visualClips: 3, discontinuous: true, zoom: true, fade: false, captions: true });
  assert.equal(requestedEdits("uma cena sem zoom e sem legendas").zoom, false);
  assert.equal(requestedEdits("uma cena sem zoom e sem legendas").captions, false);
});

test("unplaced narration uses real duration; legacy scene-only projects remain supported", () => {
  const p = fixture(); p.clips = []; p.assets[0].duration = 0.4;
  const result = compileEditorialPlan(p, plan());
  assert.equal(result.clips[0].durationInFrames, 12);
  assert.equal(result.clips[0].trimBefore, 0);
  const scene = { id: "abstract", name: "Cena", from: 0, durationInFrames: 12, title: "ClipRush", subtitle: "", background: "#101827", accent: "#b5f36b", shape: "none", animation: "fade" };
  const abstract = { ...p, type: "blank" as const, assets: [], generation: { ...p.generation!, prompt: "Uma cena abstrata sem mídias nem legendas" } };
  const data = { ...plan(), requirements: { visualClips: 0, discontinuous: false, zoom: false, fade: true, captions: false }, blocks: [{ from: 0, durationInFrames: 12, narrationText: "", evidence: "pedido: cena abstrata", clips: [], scenes: [scene], captions: [] }] };
  assert.equal(compileEditorialPlan(abstract, data).scenes[0].title, "ClipRush");
});

class FakeCodex extends EventEmitter {
  prompts: string[] = [];
  constructor(private outputs: unknown[]) { super(); }
  approvals() { return []; }
  async status() { return { connected: true, authenticated: true, models: [{ id: "fixture", model: "fixture", isDefault: true, defaultReasoningEffort: "medium", supportedReasoningEfforts: [{ reasoningEffort: "medium" }] }] }; }
  async request(method: string, params: { input?: { text: string }[]; outputSchema?: unknown }) {
    if (method === "thread/start") return { thread: { id: "thread" } };
    if (method === "turn/start") {
      this.prompts.push(params.input![0].text);
      assert.ok(params.outputSchema);
      const output = this.outputs.shift();
      setImmediate(() => {
        this.emit("notification", "item/completed", { threadId: "thread", item: { type: "agentMessage", text: JSON.stringify(output) } });
        this.emit("notification", "turn/completed", { threadId: "thread", turn: { status: "completed" } });
      });
      return { turn: { id: "turn" } };
    }
    return {};
  }
}

test("ProductionService validates before promotion/export using tiny real audio/video fixtures", async () => {
  const directory = await mkdtemp(path.resolve("out/editorial-test-"));
  const store = new Store(directory);
  try {
    // Synthetic media only: no downloaded footage, speech service or Remotion render.
    for (const [name, source, length] of [["voice.wav", "sine=frequency=440:sample_rate=8000", "1"], ["video.mp4", "testsrc2=size=128x128:rate=30", "3"]])
      execFileSync("ffmpeg", ["-v", "error", "-f", "lavfi", "-i", source, "-t", length, path.join(directory, name)], { windowsHide: true });
    const base = fixture();
    for (const [i, name] of ["voice.wav", "video.mp4"].entries()) {
      base.assets[i].path = path.join(directory, name);
      base.assets[i].hash = await hashFile(base.assets[i].path);
      const metadata = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "json", base.assets[i].path], { encoding: "utf8", windowsHide: true }));
      base.assets[i].duration = Number(metadata.format.duration);
    }
    for (const mode of ["success", "caption timing", "automatic captions", "repair", "failure", "renderer failure", "catalog", "automatic alignment", "optional effects"] as const) {
      const modeBase = structuredClone(base);
      const modePlan = plan();
      if (mode === "caption timing") {
        modePlan.blocks[0].captions = [{ text: "Bloco 0 Bloco 1", startMs: 0, endMs: 99999 }];
        modePlan.blocks[1].captions = [];
      }
      if (mode === "automatic alignment" || mode === "automatic captions") modeBase.generation!.references = [];
      if (mode === "automatic captions") modePlan.blocks.forEach(b => b.captions = []);
      if (mode === "automatic alignment" || mode === "optional effects") {
        modeBase.generation!.prompt = "Três trechos descontínuos e zoom sem legendas";
        modePlan.requirements.captions = false;
        modePlan.blocks.forEach(b => b.captions = []);
      }
      const created = store.create(modeBase);
      const original = store.save({ ...modeBase, id: created.id, revision: created.revision }, true);
      const invalid = plan(); invalid.blocks[1].clips[0].animation = "none";
      const search = plan(); search.catalogQueries = ["cena adicional"];
      const optional = { ...modePlan, limitations: [{ code: "SIMULACAO_NAO_REPRESENTAVEL", detail: "Efeito opcional omitido", essential: false, resolution: "omitted" }], highlights: [] };
      const codex = new FakeCodex(mode === "optional effects" ? [optional] : mode === "success" || mode === "caption timing" || mode === "automatic captions" || mode === "automatic alignment" ? [modePlan] : mode === "repair" ? [invalid, plan()] : mode === "catalog" ? [search, plan()] : mode === "renderer failure" ? [plan(), plan()] : [invalid, invalid]);
      let validated = 0, exported = 0, searches = 0, uses = 0;
      const renders = {
        busy: () => false,
        validate: async (candidate: Project) => {
          validated++;
          assert.equal(store.get(original.id).revision, original.revision);
          assert.deepEqual(candidate.clips[0], original.clips[0]);
          applyComposition(original, candidate);
          if (mode === "renderer failure") throw new Error("fixture renderer failure");
        },
        start: async (candidate: Project) => { exported++; assert.equal(candidate.clips.length, 4); return { id: "export", status: "completed", progress: 1 }; },
      };
      const catalog = {
        search: async () => { searches++; return [{ id: "candidate" }]; },
        use: async (_id: string, _candidate: string, snapshot: Project) => { uses++; assert.equal(store.get(original.id).revision, original.revision); return snapshot; },
      };
      let transcriptions = 0;
      const align: typeof prepareNarration = (p, s, root, signal, log) => prepareNarration(p, s, root, signal, log, async () => {
        transcriptions++;
        return { method: "controlled measured timings", scriptReused: false, words: [0, 1, 2].map(i => ({
          text: `Bloco ${i}`, startMs: (6 + i * 4) / 30 * 1000, endMs: (6 + (i + 1) * 4) / 30 * 1000,
        })) };
      });
      const service = new ProductionService(store, codex as unknown as CodexClient, renders as unknown as RenderService, directory, catalog as unknown as CatalogService, align);
      await service.start(original.id);
      let state = await service.status(original.id);
      for (let i = 0; i < 300 && !["completed", "failed"].includes(state.job!.status); i++) {
        await new Promise(resolve => setTimeout(resolve, 10)); state = await service.status(original.id);
      }
      const success = mode === "success" || mode === "caption timing" || mode === "automatic captions" || mode === "repair" || mode === "catalog" || mode === "automatic alignment" || mode === "optional effects";
      assert.equal(state.job!.status, success ? "completed" : "failed", state.job!.error ?? mode);
      assert.equal(exported, success ? 1 : 0);
      assert.equal(validated, mode === "failure" ? 0 : mode === "renderer failure" ? 2 : 1);
      assert.equal(codex.prompts.length, ["success", "caption timing", "automatic captions", "automatic alignment", "optional effects"].includes(mode) ? 1 : 2);
      // The later no-caption run reuses the same measured audio cache.
      assert.equal(transcriptions, mode === "automatic captions" ? 1 : 0);
      if (mode === "automatic alignment") assert.match(codex.prompts[0], /automatic-narration-alignment/);
      if (mode === "optional effects") assert.ok(state.job!.logs.some(l => l.includes("SIMULACAO_NAO_REPRESENTAVEL")));
      assert.equal(searches, mode === "catalog" ? 1 : 0); assert.equal(uses, searches);
      const saved = store.get(original.id);
      assert.equal(saved.revision, original.revision + (success ? 1 : 0));
      if (success) {
        assert.deepEqual(saved.clips[0], original.clips[0]);
        assert.deepEqual(saved.clips.slice(1).map(c => c.trimBefore), [0, 30, 60]);
        assert.equal(saved.captions.length, ["automatic alignment", "optional effects"].includes(mode) ? 0 : 3);
      } else assert.match(state.job!.error!, mode === "failure" ? /zoom/ : /fixture renderer failure/);
      const history = JSON.parse(await readFile(path.join(directory, "production", `${original.id}.json`), "utf8"));
      assert.ok(history.plan);
      if (mode === "repair") assert.match(codex.prompts[1], /três trechos descontínuos/);
    }
    if (process.env.CLIPRUSH_EDITORIAL_RENDER === "1") {
      const candidate = compileEditorialPlan(base, plan());
      const renders = new RenderService(store, path.resolve("."));
      await renders.validate(candidate, new AbortController().signal);
      const job = await renders.start(candidate, candidate.exportSettings);
      for (let i = 0; i < 600 && renders.busy(); i++) await new Promise(resolve => setTimeout(resolve, 100));
      assert.equal(job.status, "completed", job.error ?? "tiny real MP4 render");
      const info = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_streams", "-show_format", "-of", "json", job.outputPath], { encoding: "utf8", windowsHide: true }));
      assert.ok(info.streams.some((s: { codec_type: string }) => s.codec_type === "audio"));
      assert.ok(Math.abs(Number(info.format.duration) - 0.4) < 0.1);
      assert.equal(info.streams.find((s: { codec_type: string }) => s.codec_type === "video").nb_frames, "12");
    }
  } finally { store.close(); await rm(directory, { recursive: true, force: true }); }
});
