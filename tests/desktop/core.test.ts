import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { DatabaseSync } from "node:sqlite";
import { Store } from "../../desktop/store";
import { hashFile, inside, kindOf } from "../../desktop/files";
import * as validate from "../../shared/validation";

const input = {
  name: "Projeto de teste",
  channelId: "cliprush",
  language: "pt-BR",
  category: "Games",
  width: 1080,
  height: 1920,
  fps: 30,
  durationInFrames: 900,
};
test("SQLite persists projects, channels, revisions and rejects stale saves", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "cliprush-store-"));
  let store = new Store(directory);
  try {
    assert.equal(store.channels().length, 2);
    const p = store.create(input);
    const saved = store.save({ ...p, name: "Salvo" });
    assert.equal(saved.revision, 1);
    assert.throws(() => store.save(p), /mudou/);
    const channel = store.createChannel("Animation 2", "en");
    store.create({ ...input, channelId: channel.id });
    store.close();
    store = new Store(directory);
    assert.equal(store.get(p.id).name, "Salvo");
    assert.equal(store.list().length, 2);
    assert.equal(store.channels().length, 3);
    const db = new DatabaseSync(path.join(directory, "workspace.sqlite"));
    assert.equal(
      db.prepare("SELECT COUNT(*) AS total FROM revisions").get()?.total,
      1,
    );
    assert.equal(db.prepare("PRAGMA user_version").get()?.user_version, 1);
    db.close();
  } finally {
    store.close();
    await rm(directory, { recursive: true, force: true });
  }
});
test("renderer cannot inject asset paths or move a project to another channel", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "cliprush-security-"));
  const store = new Store(directory);
  try {
    const p = store.create(input);
    assert.throws(
      () => store.save({ ...p, channelId: "animation" }),
      /misturar/,
    );
    assert.throws(
      () =>
        store.save({
          ...p,
          assets: [
            {
              id: "bad",
              name: "secret.png",
              path: "C:/private/secret.png",
              mode: "reference",
              hash: "a".repeat(64),
              bytes: 100,
              kind: "image",
            },
          ],
        }),
      /serviço de importação/,
    );
    assert.throws(() => store.get("../workspace"), /Identificador/);
    assert.throws(
      () => store.create({ ...input, channelId: "absent" }),
      /Canal/,
    );
    assert.equal(store.get(p.id).assets.length, 0);
  } finally {
    store.close();
    await rm(directory, { recursive: true, force: true });
  }
});
test("project validation rejects unsupported versions, dangling clips and malformed timing", async () => {
  const directory = await mkdtemp(
    path.join(os.tmpdir(), "cliprush-validation-"),
  );
  const store = new Store(directory);
  try {
    const p = store.create(input);
    assert.throws(
      () => validate.project({ ...p, schemaVersion: 99 }),
      /Versão/,
    );
    assert.throws(() => validate.project({ ...p, fps: NaN }), /Número/);
    assert.throws(() => validate.project({ ...p, width: -1 }), /Número/);
    assert.throws(
      () =>
        validate.project({
          ...p,
          clips: [
            {
              id: "a",
              assetId: "none",
              from: 0,
              durationInFrames: 30,
              volume: 1,
            },
          ],
        }),
      /Clipe/,
    );
    assert.throws(
      () => validate.project({ ...p, createdAt: "yesterday" }),
      /Metadados/,
    );
    const asset = {
      id: "a",
      name: "image.png",
      path: "media/a.png",
      mode: "copy",
      hash: "a".repeat(64),
      bytes: 10,
      kind: "image",
    };
    assert.throws(
      () => validate.project({ ...p, assets: [asset, asset] }),
      /repetidos/,
    );
    assert.throws(
      () =>
        validate.project({
          ...p,
          assets: [asset],
          clips: [
            {
              id: "c",
              assetId: "a",
              from: 899,
              durationInFrames: 2,
              volume: 1,
            },
          ],
        }),
      /Número/,
    );
  } finally {
    store.close();
    await rm(directory, { recursive: true, force: true });
  }
});
test("file resolution rejects traversal and absolute paths; hashes bytes", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "cliprush-paths-"));
  try {
    await mkdir(path.join(directory, "media"));
    await writeFile(path.join(directory, "secret.txt"), "private");
    await writeFile(path.join(directory, "media", "café space.png"), "hello");
    const safe = await inside(path.join(directory, "media"), "café space.png");
    assert.equal(await readFile(safe, "utf8"), "hello");
    assert.equal(
      await hashFile(safe),
      "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
    );
    await assert.rejects(
      inside(path.join(directory, "media"), "../secret.txt"),
      /fora/,
    );
    await assert.rejects(
      inside(directory, path.resolve(directory, "secret.txt")),
      /inválido/,
    );
    assert.equal(kindOf("IMG.JPEG"), "image");
    assert.equal(kindOf("subtitle.vtt"), "caption");
    assert.throws(() => kindOf("payload.exe"), /Formato/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
test("future database schema is preserved and rejected", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "cliprush-future-"));
  try {
    const file = path.join(directory, "workspace.sqlite");
    const db = new DatabaseSync(file);
    db.exec("PRAGMA user_version=88");
    db.close();
    assert.throws(() => new Store(directory), /mais recente/);
    const check = new DatabaseSync(file);
    assert.equal(check.prepare("PRAGMA user_version").get()?.user_version, 88);
    check.close();
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
