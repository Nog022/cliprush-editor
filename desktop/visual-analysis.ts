import { spawn } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, realpath, rename, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Clip, Project } from "../shared/model";
import { validRegion, visualAnalysis, withManualWebcam, type AnalysisOptions, type VisualAnalysis } from "../shared/visual-analysis";
import { assetPath } from "./media";
import { selectWhisperPython } from "./narration";
import type { Store } from "./store";

export const DETECTOR_VERSION = "local-segment-v1";
const active = new Map<string, Promise<VisualAnalysis>>();

function run(python: string, args: string[], input: unknown, timeout: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(python, args, { windowsHide: true, stdio: ["pipe", "pipe", "pipe"] });
    const output: Buffer[] = [];
    let bytes = 0;
    let errorText = "";
    const stop = () => {
      if (process.platform === "win32" && child.pid) {
        // Include FFmpeg descendants when terminating the Python worker.
        const killer = spawn(path.join(process.env.SystemRoot ?? "C:/Windows", "System32/taskkill.exe"),
          ["/pid", String(child.pid), "/t", "/f"], { windowsHide: true, stdio: "ignore" });
        killer.on("error", () => child.kill());
      } else child.kill();
    };
    const timer = setTimeout(() => { stop(); reject(new Error("Tempo limite da análise local.")); }, timeout);
    child.stdout.on("data", (data: Buffer) => {
      bytes += data.length;
      if (bytes > 2 * 1024 * 1024) {
        stop();
        reject(new Error("Resposta do detector excedeu o limite."));
      } else output.push(data);
    });
    child.stderr.on("data", (data: Buffer) => { errorText = (errorText + data.toString()).slice(-2000); });
    child.on("error", error => { clearTimeout(timer); reject(error); });
    child.on("close", code => {
      clearTimeout(timer);
      if (code === 0) resolve(Buffer.concat(output).toString("utf8"));
      else reject(new Error(`Detector local falhou. ${errorText}`));
    });
    child.stdin.on("error", () => undefined);
    child.stdin.end(JSON.stringify(input));
  });
}

export function analysisBounds(project: Project, clip: Clip, options: AnalysisOptions = {}) {
  const startMs = (clip.trimBefore ?? 0) * 1000 / project.fps;
  const endMs = startMs + clip.durationInFrames * 1000 / project.fps;
  const settings = {
    sampleEveryMs: options.sampleEveryMs ?? 2500,
    maxSamples: options.maxSamples ?? 24,
    timeoutMs: options.timeoutMs ?? 60000,
    maxDurationMs: options.maxDurationMs ?? 120000,
  };
  if (![startMs, endMs, ...Object.values(settings)].every(Number.isFinite) ||
    startMs < 0 || endMs <= startMs || endMs - startMs > settings.maxDurationMs ||
    settings.maxDurationMs <= 0 || settings.maxDurationMs > 600000 ||
    settings.sampleEveryMs < 1000 || settings.sampleEveryMs > 10000 ||
    !Number.isInteger(settings.maxSamples) || settings.maxSamples < 1 || settings.maxSamples > 120 ||
    settings.timeoutMs < 1000 || settings.timeoutMs > 300000)
    throw new Error("Intervalo ou limites inválidos para análise local.");
  return { startMs, endMs, ...settings };
}

/** Metadata cache only. The project and timeline are never mutated here. */
export async function analyzeClip(
  store: Store, root: string, project: Project, clipId: string, options: AnalysisOptions = {},
): Promise<VisualAnalysis> {
  const clip = project.clips.find(c => c.id === clipId);
  const asset = project.assets.find(a => a.id === clip?.assetId);
  if (!clip || !asset || asset.kind !== "video") throw new Error("Selecione um clipe de vídeo.");
  const bounds = analysisBounds(project, clip, options);
  if (asset.duration && bounds.endMs > asset.duration * 1000 + 1)
    throw new Error("Trecho excede a duração da fonte.");
  const source = await realpath(await assetPath(store, asset));
  const before = await stat(source);
  if (options.gameplayFocusRegion !== undefined && !validRegion(options.gameplayFocusRegion))
    throw new Error('Região de foco do gameplay inválida.');
  if (!before.isFile()) throw new Error("Fonte inválida.");
  const worker = path.join(root, "scripts/analyze-segment.py");
  const version = `${DETECTOR_VERSION}-${createHash("sha256").update(await readFile(worker))
    .update(await readFile(path.join(root, "desktop/models/face_detection_yunet_2023mar.onnx"))).digest("hex").slice(0, 16)}`;
  const configured = process.env.CLIPRUSH_VISUAL_PYTHON;
  const candidates = configured ? [configured] : [path.join(root, ".venv-indexacao/Scripts/python.exe"), "python"];
  const key = createHash("sha256").update(JSON.stringify({ version, source,
    bytes: before.size, mtime: before.mtimeMs, ctime: before.ctimeMs, hash: asset.hash, bounds,
    candidates, speechPython: process.env.CLIPRUSH_WHISPER_PYTHON ?? "auto",
    ...(options.gameplayFocusRegion ? {gameplayFocusRegion: options.gameplayFocusRegion} : {}) })).digest("hex");
  const directory = path.join(store.directory, "production/visual-analysis");
  const filename = path.join(directory, `${key}.json`);
  if (options.manualWebcamRegion !== undefined && options.manualWebcamRegion !== null && !validRegion(options.manualWebcamRegion))
    throw new Error("Região manual inválida.");
  const manualFile = `${filename}.manual.json`;
  const applyManual = async (result: VisualAnalysis) => {
    await mkdir(directory, { recursive: true });
    if (options.manualWebcamRegion === null) await unlink(manualFile).catch(error => {
      if (error.code !== "ENOENT") throw error;
    });
    if (options.manualWebcamRegion) {
      const temporary = `${manualFile}.${randomUUID()}.tmp`;
      try {
        await writeFile(temporary, JSON.stringify(options.manualWebcamRegion), { flag: "wx" });
        await rename(temporary, manualFile);
      } finally { await unlink(temporary).catch(() => undefined); }
    }
    try { return withManualWebcam(result, JSON.parse(await readFile(manualFile, "utf8"))); }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      return result;
    }
  };
  const cached = async () => {
    try {
      const result = visualAnalysis(JSON.parse(await readFile(filename, "utf8")));
      if (result.version === version && result.source === source &&
        result.startMs === bounds.startMs && result.endMs === bounds.endMs &&
        result.sampledAtMs.length && result.samplingComplete &&
        result.speech.status !== "uncertain") return result;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code && (error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
    return undefined;
  };
  const hit = await cached();
  if (hit) return applyManual(hit);
  const activeKey = filename;
  if (active.has(activeKey)) return applyManual(await active.get(activeKey)!);
  const task = (async () => {
    const started = Date.now();
    const deadline = started + bounds.timeoutMs;
    const remaining = () => Math.max(1, deadline - Date.now());
    let python: string | undefined;
    const failures: string[] = [];
    for (const candidate of candidates) {
      if (Date.now() >= deadline) break;
      try {
        await run(candidate, ["-B", "-c", "import cv2, numpy; assert hasattr(cv2, 'FaceDetectorYN'); print(cv2.__version__)"], {}, Math.min(5000, remaining()));
        python = candidate;
        break;
      } catch (error) { failures.push(String(error).slice(-300)); }
    }
    if (!python) throw new Error(`OpenCV local indisponível. Configure CLIPRUSH_VISUAL_PYTHON. ${failures.join(" ")}`);
    const request = { source, ...bounds, timeoutMs: remaining(), cacheDirectory: path.join(directory, "frames"),
      ...(options.gameplayFocusRegion ? {gameplayFocusRegion: options.gameplayFocusRegion} : {}) };
    let visual: Pick<VisualAnalysis, "sampledAtMs" | "samplingComplete" | "faces" | "person" | "webcam" | "gameplay">;
    try {
      visual = JSON.parse(await run(python, ["-B", worker, "visual"], request, remaining()));
    } catch (error) {
      if (!(error instanceof Error) || error.message !== "Tempo limite da análise local.") throw error;
      const unknown = { status: "uncertain" as const, confidence: 0, reasons: [error.message] };
      visual = { sampledAtMs: [], samplingComplete: false, faces: [],
        person: { ...unknown, movement: "unknown" },
        webcam: { ...unknown, regions: [], kind: "unknown" },
        gameplay: { ...unknown, regions: [], overlays: [] } };
    }
    let speech: VisualAnalysis["speech"];
    const speechKey = createHash("sha256").update(JSON.stringify({ source, bytes: before.size,
      mtime: before.mtimeMs, ctime: before.ctimeMs, startMs: bounds.startMs, endMs: bounds.endMs,
      vad: "silero-v1", python: process.env.CLIPRUSH_WHISPER_PYTHON ?? "auto" })).digest("hex");
    const speechFile = path.join(directory, "speech", `${speechKey}.json`);
    let cachedSpeech: VisualAnalysis["speech"] | undefined;
    try {
      const candidate = JSON.parse(await readFile(speechFile, "utf8"));
      cachedSpeech = visualAnalysis({ ...visual, speech: candidate, version, source,
        startMs: bounds.startMs, endMs: bounds.endMs, elapsedMs: Date.now() - started }).speech;
      if (cachedSpeech.status === "uncertain") cachedSpeech = undefined;
    } catch { /* Missing or invalid speech cache is recomputed. */ }
    try {
      if (cachedSpeech) speech = cachedSpeech;
      else {
        if (Date.now() >= deadline) throw new Error("Tempo limite da análise local.");
        const signal = AbortSignal.timeout(remaining());
        const speechPython = await selectWhisperPython(signal);
        speech = JSON.parse(await run(speechPython, ["-B", worker, "speech"],
          { ...request, timeoutMs: remaining() }, remaining()));
        if (speech.status !== "uncertain") {
          await mkdir(path.dirname(speechFile), { recursive: true });
          const temporary = `${speechFile}.${randomUUID()}.tmp`;
          try {
            await writeFile(temporary, JSON.stringify(speech), { flag: "wx" });
            await rename(temporary, speechFile);
          } finally { await unlink(temporary).catch(() => undefined); }
        }
      }
    } catch (error) {
      speech = { status: "uncertain", confidence: 0, speakerMatched: false, intervals: [], reasons: [String(error).slice(-500)] };
    }
    const result = visualAnalysis({ ...visual, speech, version, source,
      startMs: bounds.startMs, endMs: bounds.endMs, elapsedMs: Date.now() - started });
    const after = await stat(source);
    if (after.size !== before.size || after.mtimeMs !== before.mtimeMs || after.ctimeMs !== before.ctimeMs)
      throw new Error("Fonte mudou durante a análise. Repita com a fonte estável.");
    // Persist uncertainty too. Incomplete results are retried by the cache reader.
    await mkdir(directory, { recursive: true });
    const temporary = `${filename}.${randomUUID()}.tmp`;
    try {
      await writeFile(temporary, JSON.stringify(result), { flag: "wx" });
      await rename(temporary, filename);
    } finally { await unlink(temporary).catch(() => undefined); }
    return result;
  })();
  active.set(activeKey, task);
  try { return await applyManual(await task); } finally { active.delete(activeKey); }
}
