import { DatabaseSync } from "node:sqlite";
import { randomUUID } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import type { Channel, NewProject, Project } from "../shared/model";
import * as validate from "../shared/validation";

/** Small metadata transactions only. Media bytes never enter SQLite. */
export class Store {
  private db: DatabaseSync;
  constructor(readonly directory: string) {
    mkdirSync(directory, { recursive: true });
    const file = path.join(directory, "workspace.sqlite");
    this.db = new DatabaseSync(file);
    const version = Number(
      (this.db.prepare("PRAGMA user_version").get() as { user_version: number })
        .user_version,
    );
    if (version > 1) {
      this.db.close();
      throw new Error("Banco criado por uma versão mais recente do Studio.");
    }
    if (version < 1) {
      if (existsSync(file))
        copyFileSync(file, `${file}.before-v1-${Date.now()}.bak`);
      this.db.exec(`BEGIN IMMEDIATE;
        CREATE TABLE channels (id TEXT PRIMARY KEY, data TEXT NOT NULL);
        CREATE TABLE projects (id TEXT PRIMARY KEY, data TEXT NOT NULL);
        CREATE TABLE revisions (project_id TEXT NOT NULL, revision INTEGER NOT NULL, data TEXT NOT NULL, PRIMARY KEY(project_id, revision));
        PRAGMA user_version=1;`);
      this.insertChannel({
        id: "cliprush",
        name: "Canal ClipRush",
        language: "pt-BR",
        color: "#b5f36b",
      });
      this.insertChannel({
        id: "animation",
        name: "Canal de animações",
        language: "en",
        color: "#a999ff",
      });
      this.db.exec("COMMIT");
    }
    this.db.exec(
      "PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL; PRAGMA busy_timeout=5000;",
    );
  }
  close() {
    this.db.close();
  }
  channels(): Channel[] {
    return this.db
      .prepare("SELECT data FROM channels")
      .all()
      .map((r) => JSON.parse(String(r.data)) as Channel);
  }
  private insertChannel(channel: Channel) {
    this.db
      .prepare("INSERT INTO channels VALUES (?, ?)")
      .run(channel.id, JSON.stringify(channel));
  }
  createChannel(name: unknown, language: unknown): Channel {
    const channel = {
      id: randomUUID(),
      name: validate.text(name, "Canal"),
      language: validate.text(language, "Idioma", 35),
      color: "#72d5ef",
    };
    this.insertChannel(channel);
    return channel;
  }
  importChannel(input: unknown): Channel {
    const c = validate.record(input);
    const channel: Channel = {
      id: validate.id(c.id),
      name: validate.text(c.name, "Canal"),
      language: validate.text(c.language, "Idioma", 35),
      color: "#72d5ef",
    };
    const existing = this.channels().find((item) => item.id === channel.id);
    if (existing) return existing;
    this.insertChannel(channel);
    return channel;
  }
  list(): Project[] {
    return this.db
      .prepare("SELECT data FROM projects")
      .all()
      .map((r) => validate.project(JSON.parse(String(r.data))))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }
  get(projectId: unknown): Project {
    const row = this.db
      .prepare("SELECT data FROM projects WHERE id=?")
      .get(validate.id(projectId));
    if (!row) throw new Error("Projeto não encontrado.");
    return validate.project(JSON.parse(String(row.data)));
  }
  create(input: NewProject): Project {
    const settings = validate.newProject(input);
    const now = new Date().toISOString();
    return this.insert({
      ...settings,
      schemaVersion: 2,
      id: randomUUID(),
      revision: 0,
      createdAt: now,
      updatedAt: now,
      archived: false,
      assets: [],
      clips: [],
      type: settings.type ?? "blank",
      scenes: [],
      captions: [],
      exportSettings: validate.defaultRender({
        width: settings.width,
        height: settings.height,
        fps: settings.fps,
      }),
    });
  }
  insert(input: Project): Project {
    const p = validate.project(input);
    this.checkChannel(p.channelId);
    this.db
      .prepare("INSERT INTO projects VALUES (?, ?)")
      .run(p.id, JSON.stringify(p));
    return p;
  }
  private checkChannel(channelId: string) {
    if (!this.channels().some((c) => c.id === channelId))
      throw new Error("Canal não encontrado.");
  }
  save(input: Project, trustedAssets = false): Project {
    const p = validate.project(input);
    const previous = this.get(p.id);
    if (p.revision !== previous.revision)
      throw new Error(
        "O projeto mudou em outra operação. Reabra para carregar a versão atual.",
      );
    this.checkChannel(p.channelId);
    if (p.channelId !== previous.channelId)
      throw new Error("Não é permitido misturar arquivos entre canais.");
    // Renderer can edit the timeline, never paths, asset IDs or source metadata.
    if (
      !trustedAssets &&
      JSON.stringify(p.assets) !== JSON.stringify(previous.assets)
    )
      throw new Error("Mídias devem ser alteradas pelo serviço de importação.");
    const next: Project = {
      ...p,
      createdAt: previous.createdAt,
      updatedAt: new Date().toISOString(),
      revision: previous.revision + 1,
    };
    this.db.exec("BEGIN IMMEDIATE");
    try {
      this.db
        .prepare("INSERT INTO revisions VALUES (?, ?, ?)")
        .run(previous.id, previous.revision, JSON.stringify(previous));
      this.db
        .prepare("UPDATE projects SET data=? WHERE id=?")
        .run(JSON.stringify(next), next.id);
      this.db
        .prepare("DELETE FROM revisions WHERE project_id=? AND revision < ?")
        .run(next.id, next.revision - 50);
      this.db.exec("COMMIT");
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }
    return next;
  }
}
