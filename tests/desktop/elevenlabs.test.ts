import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { ElevenLabs, credentialsFromEnv } from "../../desktop/elevenlabs";
import { generation } from "../../shared/validation";
import { generateNarration } from "../../desktop/generated-narration";
import { prepareAsset } from "../../desktop/media";
import { Store } from "../../desktop/store";
import { narrationClips } from "../../shared/editorial";
import { execFileSync } from "node:child_process";
import { ProductionService } from "../../desktop/production";

const credentials = { apiKey: "secret-test-never-log", voiceId: "test-voice", modelId: "eleven_v4" as const };
const signal = () => new AbortController().signal;
async function directory() { await mkdir("out", { recursive: true }); return mkdtemp(path.resolve("out/eleven-unit-")); }
test("ElevenLabs uses official MP3 contract, v4-compatible stored settings, concurrent and persistent cache", async () => {
  const dir = await directory();
  let posts = 0;
  let stability = 0.6;
  const request: typeof fetch = async (url, options) => {
    assert.equal((options!.headers as Record<string, string>)["xi-api-key"], credentials.apiKey);
    if (String(url).endsWith("/settings")) return Response.json({ stability, similarity_boost: 0.8, style: 0.3, speed: 1.1, use_speaker_boost: true });
    posts++;
    assert.equal(String(url), "https://api.elevenlabs.io/v1/text-to-speech/test-voice?output_format=mp3_44100_128");
    assert.equal(options?.method, "POST");
    const body = JSON.parse(options!.body as string);
    assert.equal(body.model_id, "eleven_v4");
    assert.deepEqual(body.voice_settings, { stability, similarity_boost: 0.8 });
    return new Response("fixture-audio", { headers: { "Content-Type": "audio/mpeg" } });
  };
  const speech = new ElevenLabs(dir, async () => credentials, request);
  const results = await Promise.all([speech.synthesize("Olá", signal()), speech.synthesize("Olá", signal())]);
  assert.equal(posts, 1); assert.equal(results[0].file, results[1].file);
  const restarted = new ElevenLabs(dir, async () => credentials, request);
  assert.equal((await restarted.synthesize("Olá", signal())).cached, true); assert.equal(posts, 1);
  await restarted.synthesize("Outro texto", signal()); assert.equal(posts, 2);
  stability = 0.4;
  const updated = await restarted.synthesize("Olá", signal()); assert.equal(posts, 3);
  assert.notEqual(updated.file, results[0].file);
  assert.ok(!(await readFile(`${updated.file}.json`, "utf8")).includes(credentials.apiKey));
  await writeFile(updated.file, "corrupt");
  await assert.rejects(restarted.synthesize("Olá", signal()), /corrompido/); assert.equal(posts, 3);
});
test("API errors are clear, redact response bodies, and never auto retry POST", async () => {
  for (const status of [401, 403, 404, 422, 429, 500]) {
    let posts = 0;
    const speech = new ElevenLabs(await directory(), async () => credentials, async (url) => {
      if (String(url).endsWith("/settings")) return Response.json({ stability: 0.5 });
      posts++; return new Response(credentials.apiKey, { status });
    });
    await assert.rejects(speech.synthesize("Teste", signal()), (error: Error) => {
      assert.match(error.message, new RegExp(String(status))); assert.ok(!error.message.includes(credentials.apiKey)); return true;
    });
    assert.equal(posts, 1);
  }
});
test("uncertain paid requests retain a marker across restarts and prevent duplicate credit consumption", async () => {
  const dir = await directory(); let posts = 0;
  const request: typeof fetch = async url => {
    if (String(url).endsWith("/settings")) return Response.json({ stability: 0.5 });
    posts++; throw new Error(credentials.apiKey);
  };
  await assert.rejects(new ElevenLabs(dir, async () => credentials, request).synthesize("Teste", signal()), /interrompida/);
  await assert.rejects(new ElevenLabs(dir, async () => credentials, request).synthesize("Teste", signal()), /pendente/);
  assert.equal(posts, 1);
});
test("cancelled, empty and oversized scripts never reach API; script survives domain validation", async () => {
  const speech = new ElevenLabs(await directory(), async () => credentials, async () => { throw new Error("must not call"); });
  const controller = new AbortController(); controller.abort();
  await assert.rejects(speech.synthesize("Teste", controller.signal), /abort/i);
  await assert.rejects(speech.synthesize("", signal()), /roteiro/);
  await assert.rejects(speech.synthesize("a".repeat(10001), signal()), /roteiro/);
  assert.equal(generation({ prompt: "Editar", references: [], autoRender: true, narrationScript: "Texto\nexato" }).narrationScript, "Texto\nexato");
  assert.equal(credentialsFromEnv('ELEVENLABS_API_KEY="secret"\nELEVENLABS_VOICE_ID=test\nELEVENLABS_MODEL_ID=eleven_v4').modelId, "eleven_v4");
  assert.throws(() => credentialsFromEnv("ELEVENLABS_API_KEY=x\nELEVENLABS_VOICE_ID=test\nELEVENLABS_MODEL_ID=eleven_v3"), /eleven_v4/);
});
test("generated audio selects one narration without removing original media; reruns reuse assets and failures preserve fallback", async () => {
  const dir = await directory();
  const store = new Store(dir);
  try {
    const file = path.join(dir, "voice.mp3");
    execFileSync("ffmpeg", ["-v", "error", "-f", "lavfi", "-i", "sine=frequency=440:duration=0.5", file], { windowsHide: true });
    let p = store.create({ name: "Narration fixture", channelId: "cliprush", language: "pt-BR", category: "Test", type: "narrated", width: 128, height: 128, fps: 30, durationInFrames: 30 });
    p.generation = { prompt: "Fixture", narrationScript: "Texto aprovado", autoRender: false, references: [] };
    const speech = { synthesize: async () => ({ file, cached: true }) };
    const generated = await generateNarration(p, store, speech, signal(), () => undefined);
    assert.equal(narrationClips(generated).length, 1);
    assert.equal(generated.durationInFrames, Math.ceil(generated.assets[0].duration! * 30));
    assert.equal(p.assets.length, 0);
    const old = { ...await prepareAsset(store, p, file, "reference"), id: "old-narration", hash: "1".repeat(64), role: "narration" as const };
    const withOld = { ...generated, assets: [old, ...generated.assets] };
    assert.equal(narrationClips(withOld).length, 1, "old audio must not be implicitly reinserted");
    const repeated = await generateNarration(withOld, store, speech, signal(), () => undefined);
    assert.equal(repeated.assets.length, withOld.assets.length);
    assert.equal(repeated.generation!.narrationAssetId, generated.generation!.narrationAssetId);
    assert.equal(narrationClips(repeated).length, 1);
    const logs: string[] = [];
    const failing = { synthesize: async () => { throw new Error("ElevenLabs (429): créditos insuficientes."); } };
    assert.equal(await generateNarration(withOld, store, failing, signal(), m => logs.push(m)), withOld);
    assert.match(logs[0], /Fallback/);
    await assert.rejects(generateNarration(p, store, failing, signal(), () => undefined), /429/);
    const controller = new AbortController();
    const cancelled = { synthesize: async () => { controller.abort(); controller.signal.throwIfAborted(); throw new Error("unreachable"); } };
    await assert.rejects(generateNarration(withOld, store, cancelled, controller.signal, () => undefined), /abort/i);
    const original = store.save({ ...p, assets: [old] }, true);
    store.save({ ...repeated, revision: original.revision }, true);
    await mkdir(path.join(dir, "production"), { recursive: true });
    await writeFile(path.join(dir, "production", `${p.id}.json`), JSON.stringify({ previous: original }));
    const service = new ProductionService(store, {} as ConstructorParameters<typeof ProductionService>[1], {} as ConstructorParameters<typeof ProductionService>[2], dir);
    const restored = await service.restore(p.id);
    assert.deepEqual(narrationClips(restored).map(c => c.assetId), [old.id]);
    assert.equal(restored.generation?.narrationAssetId, undefined);
    assert.ok((await readFile(file)).length > 0, "original audio remains intact");
  } finally { store.close(); }
});
