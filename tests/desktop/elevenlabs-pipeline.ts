// Opt-in integration: consumes the already generated smoke MP3; no ElevenLabs calls.
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { Store } from "../../desktop/store";
import { ProductionService } from "../../desktop/production";
import type { CodexClient } from "../../desktop/codex";
import { RenderService } from "../../desktop/render";
import { prepareAsset } from "../../desktop/media";
import { prepareNarration } from "../../desktop/narration";
import { generateNarration } from "../../desktop/generated-narration";
import { VOICE_TEST, type ElevenLabs } from "../../desktop/elevenlabs";
import { narrationBlocks, narrationClips, timedText } from "../../shared/editorial";
import type { Project } from "../../shared/model";

async function main() {
  const directory = path.resolve(`out/elevenlabs-pipeline-${randomUUID()}`);
  await mkdir(directory, { recursive: true });
  const report = JSON.parse(await readFile("out/elevenlabs-smoke/validation.json", "utf8"));
  const video = path.join(directory, "fixture.mp4");
  execFileSync("ffmpeg", ["-v", "error", "-f", "lavfi", "-i", "testsrc2=size=320x568:rate=30", "-t", "20", "-c:v", "libx264", "-preset", "ultrafast", video], { windowsHide: true });
  const store = new Store(directory);
  let service: ProductionService | undefined;
  let projectId = "";
  try {
    let project = store.create({ name: "ElevenLabs integration fixture", channelId: "cliprush", category: "Test", language: "pt-BR", type: "narrated", width: 540, height: 960, fps: 30, durationInFrames: 300 });
    projectId = project.id;
    const visual = await prepareAsset(store, project, video, "reference");
    project = store.save({ ...project, assets: [visual], generation: { narrationScript: VOICE_TEST, prompt: "Fixture de integração com legendas.", autoRender: true, references: [] },
      exportSettings: { preset: "portrait", width: 540, height: 960, fps: 30, quality: "balanced", audio: true, captions: true } }, true);
    let aligned: Project;
    class FixtureCodex extends EventEmitter {
      approvals() { return []; }
      async status() { return { connected: true, authenticated: true, models: [{ id: "fixture", model: "fixture", isDefault: true, defaultReasoningEffort: "medium", supportedReasoningEfforts: [{ reasoningEffort: "medium" }] }] }; }
      async request(method: string) {
        if (method === "thread/start") return { thread: { id: "fixture-thread" } };
        if (method === "turn/start") {
          const blocks = narrationBlocks(aligned);
          const plan = { durationInFrames: aligned.durationInFrames, requirements: { visualClips: blocks.length, discontinuous: false, zoom: false, fade: false, captions: true },
            errors: [], catalogQueries: [], audioClips: [], blocks: blocks.map((b, i) => ({ ...b, captions: [], scenes: [],
              clips: [{ id: `fixture-${i}`, assetId: visual.id, from: b.from, durationInFrames: b.durationInFrames, trimBefore: i * 150, volume: 0, animation: i % 2 ? "zoom" : "none" }] })) };
          queueMicrotask(() => {
            this.emit("notification", "item/completed", { threadId: "fixture-thread", item: { type: "agentMessage", text: JSON.stringify(plan) } });
            this.emit("notification", "turn/completed", { threadId: "fixture-thread", turn: { status: "completed" } });
          });
          return { turn: { id: "fixture-turn" } };
        }
        return {};
      }
    }
    const renders = new RenderService(store, path.resolve("."));
    await renders.load();
    const speech: Pick<ElevenLabs, "synthesize"> = { synthesize: async (text: string) => { assert.equal(text, VOICE_TEST); return { file: report.file, cached: true }; } };
    service = new ProductionService(store, new FixtureCodex() as unknown as CodexClient, renders, path.resolve("."), undefined,
      async (...args) => { aligned = await prepareNarration(...args); assert.ok(timedText(aligned).length > 0); return aligned; },
      (p, signal, log) => generateNarration(p, store, speech, signal, log));
    await service.start(project.id);
    let state = await service.status(project.id);
    let last = "";
    const deadline = Date.now() + 180000;
    while (!["completed", "failed", "cancelled"].includes(state.job!.status) && Date.now() < deadline) {
      if (last !== state.job!.status) { last = state.job!.status; console.log(`Pipeline: ${last}`); }
      await new Promise(resolve => setTimeout(resolve, 300)); state = await service.status(project.id);
    }
    assert.equal(state.job!.status, "completed", state.job!.error ?? "Pipeline incomplete");
    const saved = store.get(project.id);
    assert.equal(narrationClips(saved).length, 1);
    assert.ok(saved.captions.length > 0);
    assert.ok(saved.captions.every(c => c.startMs >= 0 && c.endMs <= saved.durationInFrames / saved.fps * 1000));
    assert.equal(saved.assets.find(a => a.id === visual.id)?.path, visual.path);
    const render = renders.list()[0];
    assert.equal(render.status, "completed", render.error ?? "Render incomplete");
    const metadata = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration:stream=codec_type,codec_name,width,height,nb_frames", "-of", "json", render.outputPath], { encoding: "utf8", windowsHide: true }));
    assert.ok(metadata.streams.some((s: { codec_type: string }) => s.codec_type === "audio"));
    assert.ok(Math.abs(Number(metadata.format.duration) - saved.durationInFrames / saved.fps) < 0.1);
    execFileSync("ffmpeg", ["-v", "error", "-xerror", "-i", render.outputPath, "-f", "null", "-"], { windowsHide: true });
    const result = { directory, mp4: render.outputPath, projectId: project.id, captions: saved.captions, durationInFrames: saved.durationInFrames, logs: state.job!.logs, metadata };
    await writeFile(path.join(directory, "validation.json"), JSON.stringify(result, null, 2));
    console.log(JSON.stringify({ directory, mp4: render.outputPath, captions: saved.captions.length, durationInFrames: saved.durationInFrames, metadata }, null, 2));
  } finally { if (service?.busy()) await service.cancel(projectId); store.close(); }
}
void main().catch(error => { console.error(error instanceof Error ? error.message : "Pipeline failed"); process.exitCode = 1; });
