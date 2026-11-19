// Explicit short paid smoke test, never invoked by build/unit tests.
import { build } from "esbuild";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import path from "node:path";
const directory = path.resolve("out/elevenlabs-smoke");
await mkdir(directory, { recursive: true });
await build({ entryPoints: ["desktop/elevenlabs.ts"], outfile: path.join(directory, "adapter.cjs"), bundle: true, platform: "node", format: "cjs", target: "node22" });
const { ElevenLabs, VOICE_TEST, credentialsFromEnv } = createRequire(import.meta.url)(path.join(directory, "adapter.cjs"));
try {
  const credentials = credentialsFromEnv(await readFile(".env.local", "utf8"));
  const voiceResponse = await fetch(`https://api.elevenlabs.io/v1/voices/${encodeURIComponent(credentials.voiceId)}`, {
    headers: { "xi-api-key": credentials.apiKey }, signal: AbortSignal.timeout(15000),
  });
  if (!voiceResponse.ok) throw new Error(`ElevenLabs (${voiceResponse.status}): não foi possível confirmar a voz configurada.`);
  const voice = await voiceResponse.json();
  if (typeof voice.name !== "string" || !/augusto.*norte/i.test(voice.name)) throw new Error("ElevenLabs: o nome da voz configurada não corresponde a Augusto Norte. Confira o Voice ID.");
  const speech = new ElevenLabs(directory, async () => credentials);
  const result = await speech.synthesize(VOICE_TEST, new AbortController().signal);
  const info = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration:stream=codec_name,codec_type,sample_rate,channels", "-of", "json", result.file], { encoding: "utf8", windowsHide: true }));
  execFileSync("ffmpeg", ["-v", "error", "-xerror", "-i", result.file, "-f", "null", "-"], { windowsHide: true, stdio: "pipe" });
  if (!info.streams.some(s => s.codec_name === "mp3") || !(Number(info.format.duration) > 0)) throw new Error("MP3 inválido.");
  const cached = await speech.synthesize(VOICE_TEST, new AbortController().signal);
  if (!cached.cached) throw new Error("Cache não reutilizado.");
  const report = { voice: "Augusto Norte (nome confirmado pela API)", model: credentials.modelId, file: result.file, firstCached: result.cached, secondCached: cached.cached, ...info };
  await writeFile(path.join(directory, "validation.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  // Adapter only emits sanitized errors; do not print arbitrary error stacks/HTTP bodies.
  console.error(error instanceof Error && /^(ElevenLabs|Configure|Esta integração|MP3|Cache)/.test(error.message) ? error.message : "Teste interrompido: verifique conexão e FFmpeg/FFprobe.");
  process.exitCode = 1;
}
