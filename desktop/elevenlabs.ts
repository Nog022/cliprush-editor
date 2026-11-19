import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseEnv } from "node:util";

export interface ElevenCredentials { apiKey: string; voiceId: string; modelId: "eleven_v4" }
export const VOICE_TEST = "Olá! Eu sou a voz do ClipRush. Vamos descobrir algo surpreendente?";
export function credentialsFromEnv(source: string): ElevenCredentials {
  const env = parseEnv(source);
  if (!env.ELEVENLABS_API_KEY?.trim() || !/^[a-zA-Z0-9_-]{1,160}$/.test(env.ELEVENLABS_VOICE_ID ?? ""))
    throw new Error("Configure ELEVENLABS_API_KEY e ELEVENLABS_VOICE_ID válidos.");
  if (env.ELEVENLABS_MODEL_ID && env.ELEVENLABS_MODEL_ID !== "eleven_v4")
    throw new Error("Esta integração exige ELEVENLABS_MODEL_ID=eleven_v4.");
  return { apiKey: env.ELEVENLABS_API_KEY.trim(), voiceId: env.ELEVENLABS_VOICE_ID!, modelId: "eleven_v4" };
}
const digest = (value: string | Buffer) => createHash("sha256").update(value).digest("hex");
export function elevenError(status: number): Error {
  const message = status === 401 ? "Autenticação recusada. Verifique a chave e as permissões da operação." : status === 403 ? "Sem permissão para a voz ou o modelo. Verifique também o saldo da conta."
    : status === 404 ? "Voz ou modelo indisponível nesta conta."
    : status === 429 ? "Limite de requisições ou créditos atingido."
    : status === 400 || status === 422 ? "Texto, modelo ou configurações de voz incompatíveis."
    : status >= 500 ? "Serviço temporariamente indisponível." : "Requisição recusada.";
  return new Error(`ElevenLabs (${status}): ${message}`);
}
async function responseError(response: Response, operation: "settings" | "speech") {
  // Only recognized error codes influence the message; remote text is never logged.
  const body = await response.json().catch(() => null) as { detail?: { status?: string } } | null;
  const code = body?.detail?.status;
  if (code === "missing_permissions") return new Error(`ElevenLabs (${response.status}): a chave não tem permissão de ${operation === "settings" ? "leitura de vozes (Voices: Read)" : "síntese (Text to Speech)"}. Ajuste as permissões da chave.`);
  if (code === "invalid_api_key") return new Error(`ElevenLabs (${response.status}): chave inválida ou expirada.`);
  if (code === "quota_exceeded") return new Error(`ElevenLabs (${response.status}): créditos insuficientes para esta geração.`);
  return elevenError(response.status);
}
export class ElevenLabs {
  private pending = new Map<string, Promise<{ file: string; cached: boolean }>>();
  constructor(private directory: string, private credentials: () => Promise<ElevenCredentials>, private request: typeof fetch = (...args) => fetch(...args)) {}
  async synthesize(text: string, signal: AbortSignal): Promise<{ file: string; cached: boolean }> {
    signal.throwIfAborted();
    if (!text.trim() || text.length > 10000) throw new Error("O roteiro deve ter entre 1 e 10.000 caracteres.");
    const credentials = await this.credentials();
    const key = digest(JSON.stringify({ text, voice: credentials.voiceId, model: credentials.modelId }));
    const pending = this.pending.get(key);
    if (pending) return pending;
    const task = this.generate(text, credentials, signal);
    this.pending.set(key, task);
    try { return await task; } finally { this.pending.delete(key); }
  }
  private async generate(text: string, credentials: ElevenCredentials, signal: AbortSignal) {
    const abort = AbortSignal.any([signal, AbortSignal.timeout(120000)]);
    const headers = { "xi-api-key": credentials.apiKey, "Content-Type": "application/json" };
    const endpoint = `https://api.elevenlabs.io/v1/voices/${encodeURIComponent(credentials.voiceId)}/settings`;
    // Read stored voice settings; never overwrite the user's voice on the service.
    const settingsResponse = await this.request(endpoint, { headers, signal: abort }).catch(() => {
      signal.throwIfAborted(); throw new Error("ElevenLabs: não foi possível consultar as configurações da voz.");
    });
    if (!settingsResponse.ok) throw await responseError(settingsResponse, "settings");
    const source = await settingsResponse.json().catch(() => { throw new Error("ElevenLabs: configurações da voz inválidas."); }) as Record<string, unknown>;
    if (!source || typeof source !== "object") throw new Error("ElevenLabs: configurações da voz inválidas.");
    const settings: Record<string, number | boolean> = {};
    // v4 only supports stability/similarity and clone_strength for fine-tuned PVCs.
    for (const name of ["stability", "similarity_boost", "clone_strength"]) {
      const value = source[name];
      if (typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1)
        settings[name] = value;
    }
    const format = "mp3_44100_128";
    const key = digest(JSON.stringify({ version: 1, text, voice: credentials.voiceId, model: credentials.modelId, settings, format }));
    await mkdir(this.directory, { recursive: true });
    const file = path.join(this.directory, `${key}.mp3`);
    try {
      const meta = JSON.parse(await readFile(`${file}.json`, "utf8"));
      const bytes = await readFile(file);
      if (meta.hash === digest(bytes) && bytes.length > 0) return { file, cached: true };
      throw new Error("Cache de narração corrompido; recupere o MP3 antes de gerar novamente.");
    } catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
    const lock = `${file}.pending`;
    try { await writeFile(lock, "Requisição iniciada. Se interrompida, consulte o histórico ElevenLabs antes de remover este marcador.", { flag: "wx" }); }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code === "EEXIST") throw new Error("ElevenLabs: geração pendente ou interrompida. Consulte o histórico antes de tentar novamente para evitar cobrança duplicada.");
      throw error;
    }
    const temporary = `${file}.${randomUUID()}.tmp`;
    try {
      signal.throwIfAborted();
      const response = await this.request(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(credentials.voiceId)}?output_format=${format}`, {
        method: "POST", headers, signal: abort,
        body: JSON.stringify({ text, model_id: credentials.modelId, voice_settings: settings }),
      });
      if (!response.ok) { await unlink(lock); throw await responseError(response, "speech"); }
      if (!response.headers.get("content-type")?.includes("audio/")) throw new Error("ElevenLabs: resposta sem áudio MP3. Consulte o histórico antes de repetir.");
      const bytes = Buffer.from(await response.arrayBuffer());
      if (!bytes.length || bytes.length > 64 * 1024 * 1024) throw new Error("ElevenLabs: áudio vazio ou acima do limite.");
      await writeFile(temporary, bytes, { flag: "wx" });
      await rename(temporary, file);
      await writeFile(`${file}.json`, JSON.stringify({ hash: digest(bytes), voice: credentials.voiceId, model: credentials.modelId, settings, format }));
      await unlink(lock);
      return { file, cached: false };
    } catch (error) {
      signal.throwIfAborted();
      if (error instanceof Error && error.message.startsWith("ElevenLabs")) throw error;
      throw new Error("ElevenLabs: geração interrompida ou falha de rede/disco. Consulte o histórico antes de repetir; nenhuma tentativa automática será feita.");
    } finally { await unlink(temporary).catch(() => undefined); }
  }
}
