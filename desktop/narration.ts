import { execFile } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, readdir, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import type { Project } from "../shared/model";
import { narrationClips, timedText } from "../shared/editorial";
import { assetPath } from "./media";
import { hashFile } from "./files";
import type { Store } from "./store";

type Word = { text: string; startMs: number; endMs: number };
interface Transcript { words: Word[]; scriptReused: boolean; method: string; model?: string; modelLoadErrors?: string[] }
type Transcribe = (requestFile: string, signal: AbortSignal) => Promise<unknown>;
const execute = promisify(execFile);

/** Independent from the indexing venv: verify Whisper's decoder, not just its import. */
export async function selectWhisperPython(
  signal: AbortSignal,
  options: {
    configured?: string; localAppData?: string;
    probe?: (candidate: string) => Promise<string>;
  } = {},
): Promise<string> {
  const configured = options.configured ?? process.env.CLIPRUSH_WHISPER_PYTHON;
  const candidates = configured ? [configured] : ["python"];
  const localAppData = options.localAppData ?? process.env.LOCALAPPDATA;
  if (!configured && process.platform === "win32" && localAppData) {
    const directory = path.join(localAppData, "Programs", "Python");
    const entries = await readdir(directory, { withFileTypes: true }).catch((error: NodeJS.ErrnoException) => {
      if (error.code === "ENOENT") return [];
      throw error;
    });
    for (const entry of entries.filter(e => e.isDirectory() && /^Python\d+$/.test(e.name))
      .sort((a, b) => Number(b.name === "Python312") - Number(a.name === "Python312") || b.name.localeCompare(a.name)))
      candidates.push(path.join(directory, entry.name, "python.exe"));
  }
  const failures: string[] = [];
  for (const candidate of candidates) {
    signal.throwIfAborted();
    try {
      const executable = options.probe ? await options.probe(candidate) : (await execute(candidate,
        ["-B", "-c", [
          "import sys, io, wave",
          "from faster_whisper.audio import decode_audio",
          "audio = io.BytesIO()",
          "writer = wave.open(audio, 'wb')",
          "writer.setparams((1, 2, 16000, 0, 'NONE', 'not compressed'))",
          "writer.writeframes(b'\\x00\\x00' * 160)",
          "writer.close()",
          "audio.seek(0)",
          "assert len(decode_audio(audio)) > 0",
          "print(sys.executable)",
        ].join("\n")],
        { signal, timeout: 15000, windowsHide: true, maxBuffer: 32 * 1024 })).stdout.trim();
      if (!path.isAbsolute(executable)) throw new Error("Python não retornou um executável absoluto.");
      return executable;
    } catch (error) {
      signal.throwIfAborted();
      failures.push(`${candidate}: ${String(error).slice(-400)}`);
    }
  }
  throw new Error(`Python com faster_whisper indisponível. Configure CLIPRUSH_WHISPER_PYTHON com o executável correto. ${failures.join("; ")}`);
}

function transcript(value: unknown): Transcript {
  const t = value as Transcript;
  if (!t || !Array.isArray(t.words) || !t.words.length || t.words.length > 100000 ||
    typeof t.scriptReused !== "boolean" || typeof t.method !== "string")
    throw new Error("Transcrição local sem palavras temporizadas válidas.");
  let end = 0;
  for (const w of t.words) {
    if (!w || typeof w.text !== "string" || !w.text.trim() || !Number.isFinite(w.startMs) ||
      !Number.isFinite(w.endMs) || w.startMs < end || w.endMs <= w.startMs)
      throw new Error("Transcrição local com timestamps inválidos.");
    end = w.endMs;
  }
  return t;
}

/** Preparation only: never saves a project or changes its audio/captions. */
export async function prepareNarration(
  project: Project, store: Store, root: string, signal: AbortSignal,
  log: (message: string) => void,
  transcribe: Transcribe = async (requestFile, abort) => {
    try {
      const python = await selectWhisperPython(abort);
      log(`Python do Whisper: ${python}`);
      const { stdout } = await execute(python, ["-B", path.join(root, "scripts", "transcribe-narration.py"), requestFile],
        { signal: abort, timeout: 20 * 60_000, windowsHide: true, maxBuffer: 8 * 1024 * 1024 });
      return JSON.parse(stdout);
    } catch (error) {
      abort.throwIfAborted();
      throw new Error(`ALINHAMENTO_INDISPONIVEL: verifique Python, faster-whisper e um modelo local em cache (small/base/large-v3). Nenhum download foi iniciado. ${String(error).slice(0, 1000)}`);
    }
  },
): Promise<Project> {
  const clips = narrationClips(project);
  if (!clips.length || timedText(project).length) return project;
  signal.throwIfAborted();
  const directory = path.join(store.directory, "production", "alignment");
  await mkdir(directory, { recursive: true });
  const script = project.generation?.references.find(r => /^(?:narra[cç][aã]o|narration|script|roteiro)(?:[. _-]|$)/i.test(r.name))?.content ?? "";
  const words: Word[] = [];
  for (const assetId of new Set(clips.map(c => c.assetId))) {
    const asset = project.assets.find(a => a.id === assetId)!;
    const audio = await assetPath(store, asset);
    const key = createHash("sha256").update(JSON.stringify({ version: 1, hash: await hashFile(audio), language: project.language, script })).digest("hex");
    const filename = path.join(directory, `${key}.json`);
    let data: Transcript;
    try { data = transcript(JSON.parse(await readFile(filename, "utf8"))); }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code && (error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      log("Obtendo timestamps reais da narração com o modelo local; sem download.");
      const requestFile = path.join(directory, `${randomUUID()}.request.json`);
      const temporary = `${filename}.${randomUUID()}.tmp`;
      try {
        await writeFile(requestFile, JSON.stringify({ audio, language: project.language, script }), "utf8");
        data = transcript(await transcribe(requestFile, signal));
        signal.throwIfAborted();
        if (data.words.some(w => w.endMs > asset.duration! * 1000 + 1)) throw new Error("Alinhamento excede a duração real do áudio.");
        await writeFile(temporary, JSON.stringify(data), "utf8");
        await rename(temporary, filename);
      } finally {
        await unlink(requestFile).catch(() => undefined);
        await unlink(temporary).catch(() => undefined);
      }
    }
    log(data.scriptReused ? "Roteiro confirmado na transcrição; texto fornecido reutilizado." : "Alinhamento automático disponível; texto medido do áudio preservado.");
    if (data.model) log(`Modelo Whisper local: ${data.model}.`);
    if (Array.isArray(data.modelLoadErrors)) for (const error of data.modelLoadErrors) log(`Modelo alternativo indisponível: ${String(error).slice(0, 500)}`);
    for (const clip of clips.filter(c => c.assetId === assetId)) {
      const trimMs = (clip.trimBefore ?? 0) / project.fps * 1000;
      const lengthMs = clip.durationInFrames / project.fps * 1000;
      const offsetMs = clip.from / project.fps * 1000;
      for (const word of data.words) {
        const start = Math.max(word.startMs, trimMs), end = Math.min(word.endMs, trimMs + lengthMs);
        if (end > start) words.push({ text: word.text, startMs: start - trimMs + offsetMs, endMs: end - trimMs + offsetMs });
      }
    }
  }
  signal.throwIfAborted();
  if (!words.length) throw new Error("ALINHAMENTO_AUSENTE: nenhuma fala detectada nos trechos audíveis da narração.");
  return { ...project, generation: { ...project.generation!, references: [
    ...project.generation!.references, { name: "automatic-narration-alignment.json", content: JSON.stringify(words.sort((a, b) => a.startMs - b.startMs)) },
  ] } };
}
