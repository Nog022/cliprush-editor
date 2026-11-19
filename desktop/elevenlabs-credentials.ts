import { safeStorage } from "electron";
import { readFile, rename, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { credentialsFromEnv, type ElevenCredentials } from "./elevenlabs";

export class ElevenCredentialStore {
  constructor(private userData: string, private root: string, private packaged: boolean) {}
  private filename() { return path.join(this.userData, "elevenlabs.secure"); }
  private secure() {
    if (!safeStorage.isEncryptionAvailable() || process.platform === "linux" && safeStorage.getSelectedStorageBackend() === "basic_text")
      throw new Error("Armazenamento seguro do sistema indisponível. Credenciais não foram gravadas.");
  }
  async load(): Promise<ElevenCredentials> {
    try {
      const encrypted = await readFile(this.filename());
      this.secure();
      return credentialsFromEnv(safeStorage.decryptString(encrypted));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw new Error("Não foi possível abrir as credenciais seguras ElevenLabs. Importe-as novamente.");
    }
    if (this.packaged) throw new Error("Importe as credenciais ElevenLabs nas opções de narração.");
    try { return credentialsFromEnv(await readFile(path.join(this.root, ".env.local"), "utf8")); }
    catch { throw new Error("Configure ElevenLabs em .env.local ou importe as credenciais."); }
  }
  async import(source: string) {
    const credentials = credentialsFromEnv(source);
    this.secure();
    const temporary = `${this.filename()}.${randomUUID()}.tmp`;
    const selected = `ELEVENLABS_API_KEY=${JSON.stringify(credentials.apiKey)}\nELEVENLABS_VOICE_ID=${credentials.voiceId}\nELEVENLABS_MODEL_ID=eleven_v4\n`;
    await writeFile(temporary, safeStorage.encryptString(selected), { flag: "wx", mode: 0o600 });
    await rename(temporary, this.filename());
  }
}
