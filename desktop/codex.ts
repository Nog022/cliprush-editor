import {
  spawn,
  execFile,
  type ChildProcessWithoutNullStreams,
} from "node:child_process";
import { EventEmitter } from "node:events";
import { access, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createInterface } from "node:readline";
import { promisify } from "node:util";
import type { CodexApproval, CodexModel, CodexStatus } from "../shared/model";

export interface CodexEvent {
  threadId?: string;
  turnId?: string;
  delta?: string;
  item?: { type: string; text?: string; phase?: string };
  turn?: { id: string; status: string; error?: { message: string } };
}
interface Pending {
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
  timer: ReturnType<typeof setTimeout>;
}

export class CodexClient extends EventEmitter {
  private child?: ChildProcessWithoutNullStreams;
  private starting?: Promise<void>;
  private sequence = 0;
  private pending = new Map<number, Pending>();
  private requests = new Map<
    string,
    { rpcId: string | number; method: string; description: string }
  >();
  private executable?: string;
  constructor(
    private directory: string,
    private cwd: string,
  ) {
    super();
  }
  private async binary() {
    if (this.executable) return this.executable;
    try {
      this.executable = (
        JSON.parse(
          await readFile(path.join(this.directory, "codex.json"), "utf8"),
        ) as { executable?: string }
      ).executable;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
    if (this.executable) {
      await access(this.executable);
      return this.executable;
    }
    if (process.env.CLIPRUSH_CODEX_BINARY)
      return process.env.CLIPRUSH_CODEX_BINARY;
    if (process.platform !== "win32") return "codex";
    try {
      const result = await promisify(execFile)("where.exe", ["codex.exe"], {
        windowsHide: true,
      });
      const file = result.stdout.split(/\r?\n/).find((line) => line.trim());
      if (file) return file.trim();
    } catch {
      /* The UI offers executable selection on machines without a PATH entry. */
    }
    // The official npm distribution keeps its native binary beside the JS launcher.
    const npmRoot = path.join(
      process.env.APPDATA ?? "",
      "npm/node_modules/@openai",
    );
    const target = process.arch === "arm64" ? "aarch64" : "x86_64";
    for (const packageName of ["codex", `codex-win32-${process.arch}`]) {
      const file = path.join(
        npmRoot,
        packageName,
        "vendor",
        `${target}-pc-windows-msvc/codex/codex.exe`,
      );
      try {
        await access(file);
        return file;
      } catch {
        /* Try the next official package layout. */
      }
    }
    throw new Error(
      "Codex não encontrado. Instale o CLI oficial ou selecione codex.exe pela interface.",
    );
  }
  async configure(file: string) {
    if (this.child)
      throw new Error(
        "Reinicie o aplicativo antes de trocar o executável Codex conectado.",
      );
    await access(file);
    this.executable = file;
    await writeFile(
      path.join(this.directory, "codex.json"),
      JSON.stringify({ executable: file }),
      "utf8",
    );
  }
  async connect() {
    if (this.starting) return this.starting;
    if (this.child) return;
    this.starting = this.start();
    try {
      await this.starting;
    } finally {
      this.starting = undefined;
    }
  }
  private async start() {
    const binary = await this.binary();
    const child = spawn(binary, ["app-server", "--listen", "stdio://"], {
      cwd: this.cwd,
      windowsHide: true,
      shell: false,
      stdio: "pipe",
    });
    this.child = child;
    const fail = (error: Error) => {
      if (this.child !== child) return;
      this.child = undefined;
      for (const pending of this.pending.values()) {
        clearTimeout(pending.timer);
        pending.reject(error);
      }
      this.pending.clear();
      this.requests.clear();
      this.emit("disconnected", error);
    };
    child.on("error", fail);
    child.on("exit", () => fail(new Error("A conexão Codex foi encerrada.")));
    child.stderr.on("data", () => {
      /* Never forward raw diagnostics containing account or token information. */
    });
    const lines = createInterface({ input: child.stdout });
    lines.on("line", (line) => {
      try {
        const message = JSON.parse(line) as {
          id?: number | string;
          method?: string;
          params?: CodexEvent & Record<string, unknown>;
          result?: unknown;
          error?: { message: string };
        };
        if (message.method && message.id !== undefined) {
          if (
            [
              "item/commandExecution/requestApproval",
              "item/fileChange/requestApproval",
            ].includes(message.method)
          ) {
            const id = String(message.id);
            this.requests.set(id, {
              rpcId: message.id,
              method: message.method,
              description: String(
                message.params?.command ??
                  message.params?.reason ??
                  message.method,
              ).slice(0, 2000),
            });
          } else
            this.send({
              id: message.id,
              error: {
                code: -32601,
                message: "Solicitação interativa não suportada pelo Studio.",
              },
            });
        } else if (message.method) {
          if (message.method === "turn/completed") this.requests.clear();
          this.emit("notification", message.method, message.params ?? {});
        } else if (typeof message.id === "number") {
          const pending = this.pending.get(message.id);
          if (!pending) return;
          clearTimeout(pending.timer);
          this.pending.delete(message.id);
          if (message.error) pending.reject(new Error(message.error.message));
          else pending.resolve(message.result);
        }
      } catch {
        fail(new Error("Resposta Codex inválida."));
        child.kill();
      }
    });
    try {
      await this.request("initialize", {
        clientInfo: {
          name: "cliprush_studio",
          title: "ClipRush Editor Studio",
          version: "1.0.0",
        },
        capabilities: {},
      });
      this.send({ method: "initialized", params: {} });
    } catch (error) {
      child.kill();
      throw error;
    }
  }
  private send(message: unknown) {
    if (!this.child) throw new Error("Codex desconectado.");
    this.child.stdin.write(JSON.stringify(message) + "\n");
  }
  request<T = unknown>(method: string, params: unknown): Promise<T> {
    const id = ++this.sequence;
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`Codex excedeu o tempo de resposta em ${method}.`));
      }, 60_000);
      this.pending.set(id, {
        resolve: (value) => resolve(value as T),
        reject,
        timer,
      });
      try {
        this.send({ id, method, params });
      } catch (error) {
        clearTimeout(timer);
        this.pending.delete(id);
        reject(error);
      }
    });
  }
  approvals(): CodexApproval[] {
    return [...this.requests].map(([id, r]) => ({
      id,
      method: r.method,
      description: r.description,
    }));
  }
  answer(id: string, approved: boolean) {
    const request = this.requests.get(id);
    if (!request) throw new Error("Aprovação expirada.");
    this.send({
      id: request.rpcId,
      result: { decision: approved ? "accept" : "decline" },
    });
    this.requests.delete(id);
  }
  async status(): Promise<CodexStatus> {
    try {
      await this.connect();
      const account = await this.request<{
        account: unknown;
        requiresOpenaiAuth: boolean;
      }>("account/read", { refreshToken: false });
      const models: CodexModel[] = [];
      let cursor: string | null = null;
      do {
        const page: { data: CodexModel[]; nextCursor: string | null } =
          await this.request("model/list", {
            limit: 100,
            cursor,
            includeHidden: false,
          });
        models.push(...page.data);
        cursor = page.nextCursor;
      } while (cursor);
      const config = await this.request<{ config: { model?: string } }>(
        "config/read",
        { includeLayers: false },
      );
      return {
        connected: true,
        authenticated: Boolean(account.account) || !account.requiresOpenaiAuth,
        models,
        configuredModel: config.config.model,
      };
    } catch (error) {
      return {
        connected: false,
        authenticated: false,
        models: [],
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
  close() {
    this.child?.kill();
  }
}
