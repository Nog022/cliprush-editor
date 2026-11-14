import { app, BrowserWindow, dialog, ipcMain, session, shell } from "electron";
import {
  appendFile,
  mkdir,
  readFile,
  readdir,
  stat,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { protocol } from "electron";
import type { ExportInfo, LegacyInfo } from "../shared/model";
import * as validate from "../shared/validation";
import { Store } from "./store";
import { extensions, inside } from "./files";
import { importFiles, inspectAssets, prepareAsset } from "./media";
import { exportPackage, importPackage } from "./packages";
import { installProtocol } from "./protocol";
import { CodexClient } from "./codex";
import { ProductionService } from "./production";
import { RenderService } from "./render";
import { CatalogService } from "./catalog";

app.setName("ClipRush Editor Studio");
protocol.registerSchemesAsPrivileged([
  {
    scheme: "cliprush",
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      stream: true,
      corsEnabled: true,
    },
  },
]);
// Test runner uses its own data directory, never the user's production database.
const dataHome = process.env.CLIPRUSH_DATA_HOME;
if (dataHome) app.setPath("userData", path.resolve(dataHome));
const locked = app.requestSingleInstanceLock();
if (!locked) app.quit();
let mainWindow: BrowserWindow;
let store: Store;
let codex: CodexClient;
let production: ProductionService;
let renders: RenderService;
let catalog: CatalogService;
let queue: Promise<unknown> = Promise.resolve();
const root = app.isPackaged
  ? process.resourcesPath
  : path.resolve(__dirname, "../..");
const publicRoot = app.isPackaged
  ? path.join(root, "legacy-public")
  : path.join(root, "public");
const uiRoot = path.resolve(__dirname, "../ui");
const preferenceFile = () =>
  path.join(app.getPath("userData"), "preferences.json");

function log(event: string, details: Record<string, unknown>) {
  if (!store) return;
  void appendFile(
    path.join(store.directory, "studio.log"),
    JSON.stringify({ time: new Date().toISOString(), event, ...details }) +
      "\n",
  ).catch(() => undefined);
}
function handle(
  name: string,
  action: (...args: unknown[]) => unknown,
  serialized = true,
) {
  ipcMain.handle(`cliprush:${name}`, (event, ...args: unknown[]) => {
    if (
      event.sender !== mainWindow.webContents ||
      event.senderFrame !== mainWindow.webContents.mainFrame ||
      event.senderFrame.url !== "cliprush://app/"
    )
      throw new Error("Origem IPC não autorizada.");
    // One serialized mutation boundary prevents import/save races and modal overlap.
    const task = (serialized ? queue : Promise.resolve()).then(() =>
      action(...args),
    );
    if (serialized) queue = task.catch(() => undefined);
    return task.catch((error: unknown) => {
      log("operation.error", {
        operation: name,
        message: error instanceof Error ? error.message : String(error),
      });
      throw error;
    });
  });
}
async function exportsList(): Promise<ExportInfo[]> {
  if (app.isPackaged) return [];
  const result: ExportInfo[] = [];
  const out = path.join(root, "out");
  try {
    for (const dir of await readdir(out, { withFileTypes: true })) {
      if (!dir.isDirectory() || !/^video-\d+$/.test(dir.name)) continue;
      for (const name of await readdir(path.join(out, dir.name))) {
        if (!/\.(mp4|webm|mov)$/i.test(name)) continue;
        const info = await stat(path.join(out, dir.name, name));
        result.push({
          name: `${dir.name}/${name}`,
          bytes: info.size,
          modifiedAt: info.mtime.toISOString(),
        });
      }
    }
  } catch {
    /* A fresh checkout may have no exports. */
  }
  return result.sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt));
}
function registerHandlers() {
  handle(
    "searchCatalog",
    (query) => catalog.search(validate.text(query, "Busca", 160)),
    false,
  );
  handle("useCatalogScene", (id, candidate) =>
    catalog.use(validate.id(id), validate.id(candidate)),
  );
  handle("codexStatus", () => codex.status(), false);
  handle(
    "codexLogin",
    async () => {
      await codex.connect();
      const result = await codex.request<{ authUrl: string }>(
        "account/login/start",
        { type: "chatgpt" },
      );
      const url = new URL(result.authUrl);
      if (url.protocol !== "https:" || url.hostname !== "auth.openai.com")
        throw new Error("Endereço de autenticação Codex inválido.");
      await shell.openExternal(url.href);
    },
    false,
  );
  handle("chooseCodex", async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: "Selecionar executável oficial Codex",
      properties: ["openFile"],
      filters: [
        {
          name: "Codex",
          extensions: process.platform === "win32" ? ["exe"] : ["*"],
        },
      ],
    });
    if (!result.canceled) await codex.configure(result.filePaths[0]);
  });
  handle("productionStatus", (id) => production.status(validate.id(id)), false);
  handle("generate", (id) => production.start(validate.id(id)));
  handle("cancelProduction", (id) => production.cancel(validate.id(id)), false);
  handle(
    "answerApproval",
    (id, approved) => {
      if (typeof id !== "string" || typeof approved !== "boolean")
        throw new Error("Aprovação inválida.");
      codex.answer(id, approved);
    },
    false,
  );
  handle("restoreProduction", (id) => production.restore(validate.id(id)));
  handle("attachReferences", async (id) => {
    const project = store.get(id);
    const result = await dialog.showOpenDialog(mainWindow, {
      title: "Anexar roteiro ou storyboard",
      properties: ["openFile", "multiSelections"],
      filters: [{ name: "Referências", extensions: ["txt", "md", "json"] }],
    });
    if (result.canceled) return null;
    if (result.filePaths.length > 20)
      throw new Error("Anexe até 20 referências.");
    const references = [];
    for (const file of result.filePaths) {
      if (!/\.(txt|md|json)$/i.test(file) || (await stat(file)).size > 400_000)
        throw new Error("Referência inválida ou muito extensa.");
      const content = await readFile(file, "utf8");
      if (/\.json$/i.test(file)) JSON.parse(content);
      references.push({ name: path.basename(file), content });
    }
    return store.save({
      ...project,
      generation: {
        prompt: "",
        autoRender: false,
        ...project.generation,
        references: [...(project.generation?.references ?? []), ...references],
      },
    });
  });
  handle("reuseAsset", (projectId, sourceId, assetId) => {
    const project = store.get(projectId);
    const source = store.get(sourceId);
    if (project.channelId !== source.channelId)
      throw new Error("Selecione uma mídia do mesmo canal.");
    const asset = source.assets.find((a) => a.id === validate.id(assetId));
    if (!asset) throw new Error("Mídia não encontrada.");
    if (project.assets.some((a) => a.hash === asset.hash)) return project;
    return store.save(
      {
        ...project,
        assets: [...project.assets, { ...asset, id: randomUUID() }],
      },
      true,
    );
  });
  handle("categorizeAsset", (projectId, assetId, category) => {
    const project = store.get(projectId);
    const value = validate.text(category, "Categoria", 80);
    if (!project.assets.some((a) => a.id === validate.id(assetId)))
      throw new Error("Mídia não encontrada.");
    return store.save(
      {
        ...project,
        assets: project.assets.map((a) =>
          a.id === assetId ? { ...a, category: value } : a,
        ),
      },
      true,
    );
  });
  handle("startRender", (id, settings) =>
    renders.start(store.get(id), validate.renderSettings(settings)),
  );
  handle("listRenders", () => renders.list(), false);
  handle("cancelRender", (id) => renders.cancel(validate.id(id)), false);
  handle("revealRender", (id) =>
    shell.showItemInFolder(renders.get(validate.id(id)).outputPath),
  );
  handle("openRender", async (id) => {
    const render = renders.get(validate.id(id));
    if (render.status !== "completed")
      throw new Error("A exportação ainda não foi concluída.");
    const error = await shell.openPath(render.outputPath);
    if (error) throw new Error(error);
  });
  handle("workspace", async () => ({
    channels: store.channels(),
    projects: store.list(),
    legacy: JSON.parse(
      await readFile(path.join(uiRoot, "legacy.json"), "utf8"),
    ) as LegacyInfo[],
    exports: await exportsList(),
    dataDirectory: store.directory,
    version: app.getVersion(),
    renders: renders.list(),
  }));
  handle("createProject", async (input) => {
    const project = store.create(validate.newProject(input));
    try {
      const preferences = validate.record(
        JSON.parse(
          await readFile(
            path.join(store.directory, "generation-preferences.json"),
            "utf8",
          ),
        ),
      );
      return store.save({
        ...project,
        generation: validate.generation({
          prompt: "",
          references: [],
          autoRender: false,
          model: preferences.model,
          effort: preferences.effort,
        }),
      });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT")
        log("generation.preferences.error", { message: String(error) });
      return project;
    }
  });
  handle("saveProject", async (input) => {
    const project = validate.project(input);
    if (production.busy(project.id))
      throw new Error(
        "Aguarde ou cancele a produção antes de salvar alterações.",
      );
    const saved = store.save(project);
    if (saved.generation?.model || saved.generation?.effort) {
      try {
        await writeFile(
          path.join(store.directory, "generation-preferences.json"),
          JSON.stringify({
            model: saved.generation.model,
            effort: saved.generation.effort,
          }),
          "utf8",
        );
      } catch (error) {
        log("generation.preferences.error", { message: String(error) });
      }
    }
    return saved;
  });
  handle("createChannel", (name, language) =>
    store.createChannel(name, language),
  );
  handle("duplicateProject", (id) => {
    const project = store.get(id);
    const now = new Date().toISOString();
    return store.insert({
      ...project,
      id: randomUUID(),
      revision: 0,
      name: `${project.name.slice(0, 145)} — cópia`,
      archived: false,
      createdAt: now,
      updatedAt: now,
    });
  });
  handle("archiveProject", (id, archived) => {
    if (typeof archived !== "boolean") throw new Error("Estado inválido.");
    store.save({ ...store.get(id), archived });
  });
  handle("importMedia", async (id, mode, category) => {
    const project = store.get(id);
    if (mode !== "copy" && mode !== "reference")
      throw new Error("Modo de importação inválido.");
    const result = await dialog.showOpenDialog(mainWindow, {
      title: "Importar mídia",
      properties: ["openFile", "multiSelections"],
      filters: [{ name: "Mídias", extensions }],
    });
    if (result.canceled) return null;
    if (result.filePaths.length > 200)
      throw new Error("Importe até 200 arquivos por operação.");
    const imported = await importFiles(
      store,
      project.id,
      result.filePaths,
      mode,
    );
    if (category !== undefined) {
      const value = validate.text(category, "Categoria", 80);
      imported.project = store.save(
        {
          ...imported.project,
          assets: imported.project.assets.map((a) =>
            project.assets.some((old) => old.id === a.id)
              ? a
              : { ...a, category: value },
          ),
        },
        true,
      );
    }
    log("media.imported", {
      projectId: project.id,
      imported: imported.imported,
      duplicates: imported.duplicates,
    });
    return imported;
  });
  handle("inspectAssets", (id) => inspectAssets(store, store.get(id)));
  handle("updateAssetMetadata", (projectId, assetId, input) => {
    const project = store.get(projectId);
    const asset = project.assets.find((a) => a.id === validate.id(assetId));
    if (!asset) throw new Error("Mídia não encontrada.");
    const raw = validate.record(input);
    const metadata = {
      ...(raw.duration === undefined || asset.kind === "image"
        ? {}
        : { duration: validate.number(raw.duration, 0.001, 86400, false) }),
      ...(raw.width === undefined
        ? {}
        : { width: validate.number(raw.width, 1, 100000) }),
      ...(raw.height === undefined
        ? {}
        : { height: validate.number(raw.height, 1, 100000) }),
    };
    return store.save(
      {
        ...project,
        assets: project.assets.map((a) =>
          a.id === asset.id ? { ...a, ...metadata } : a,
        ),
      },
      true,
    );
  });
  handle("relinkAsset", async (projectId, assetId) => {
    const project = store.get(projectId);
    const asset = project.assets.find((a) => a.id === validate.id(assetId));
    if (!asset) throw new Error("Mídia não encontrada.");
    const result = await dialog.showOpenDialog(mainWindow, {
      title: `Localizar ${asset.name}`,
      properties: ["openFile"],
      filters: [{ name: "Mídias", extensions }],
    });
    if (result.canceled) return null;
    const replacement = await prepareAsset(
      store,
      project,
      result.filePaths[0],
      asset.mode,
    );
    if (replacement.kind !== asset.kind)
      throw new Error("Escolha um arquivo do mesmo tipo.");
    return store.save(
      {
        ...project,
        assets: project.assets.map((a) =>
          a.id === asset.id ? { ...replacement, id: asset.id } : a,
        ),
      },
      true,
    );
  });
  handle("exportProject", async (id) => {
    const project = store.get(id);
    const result = await dialog.showOpenDialog(mainWindow, {
      title: "Salvar pacote com cópias de todas as mídias",
      properties: ["openDirectory", "createDirectory"],
    });
    if (result.canceled) return false;
    await exportPackage(store, project.id, result.filePaths[0]);
    return true;
  });
  handle("importProject", async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: "Importar project.cliprush.json",
      properties: ["openFile"],
      filters: [{ name: "Projeto ClipRush", extensions: ["json"] }],
    });
    return result.canceled ? null : importPackage(store, result.filePaths[0]);
  });
  handle("openDataDirectory", async () => {
    const error = await shell.openPath(store.directory);
    if (error) throw new Error(error);
  });
  handle("openExport", async (name) => {
    if (
      app.isPackaged ||
      typeof name !== "string" ||
      !(await exportsList()).some((e) => e.name === name)
    )
      throw new Error("Exportação não encontrada.");
    shell.showItemInFolder(await inside(path.join(root, "out"), name));
  });
  handle("chooseDataDirectory", async () => {
    if (production.busy() || renders.busy())
      throw new Error("Aguarde a produção antes de trocar o workspace.");
    const result = await dialog.showOpenDialog(mainWindow, {
      title: "Abrir ou criar workspace em outra pasta",
      properties: ["openDirectory", "createDirectory"],
    });
    if (result.canceled) return false;
    const directory = path.join(result.filePaths[0], "ClipRush Studio Data");
    const next = new Store(directory);
    try {
      await writeFile(
        preferenceFile(),
        JSON.stringify({ dataDirectory: directory }),
        "utf8",
      );
    } catch (error) {
      next.close();
      throw error;
    }
    store.close();
    codex.close();
    store = next;
    await initializeServices();
    return true;
  });
}
async function initializeServices() {
  codex = new CodexClient(store.directory, root);
  renders = new RenderService(store, root, app.isPackaged ? path.join(root, "render") : undefined);
  await renders.load();
  production = new ProductionService(store, codex, renders, root);
  catalog = new CatalogService(store, root, publicRoot);
}
async function start() {
  await app.whenReady();
  let directory = path.join(app.getPath("userData"), "workspace");
  try {
    const prefs = JSON.parse(await readFile(preferenceFile(), "utf8")) as {
      dataDirectory?: string;
    };
    if (prefs.dataDirectory && path.isAbsolute(prefs.dataDirectory))
      directory = prefs.dataDirectory;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT")
      throw new Error(
        "Preferências inválidas. O workspace foi preservado; revise preferences.json.",
      );
  }
  await mkdir(app.getPath("userData"), { recursive: true });
  store = new Store(directory);
  await initializeServices();
  installProtocol(() => store, uiRoot, publicRoot);
  session.defaultSession.setPermissionRequestHandler(
    (_contents, _permission, callback) => callback(false),
  );
  session.defaultSession.setPermissionCheckHandler(() => false);
  // Local editing has no network dependency. External providers need scoped adapters in later phases.
  session.defaultSession.webRequest.onBeforeRequest(
    { urls: ["http://*/*", "https://*/*", "ws://*/*", "wss://*/*"] },
    (_details, callback) => callback({ cancel: true }),
  );
  mainWindow = new BrowserWindow({
    width: 1500,
    height: 980,
    minWidth: 1050,
    minHeight: 720,
    backgroundColor: "#0d1015",
    title: "ClipRush Editor Studio",
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      devTools: !app.isPackaged,
    },
  });
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  mainWindow.webContents.on("will-navigate", (event) => event.preventDefault());
  mainWindow.webContents.on("will-attach-webview", (event) =>
    event.preventDefault(),
  );
  mainWindow.webContents.on("will-prevent-unload", async () => {
    // Electron ignores browser beforeunload prompts; provide a native decision.
    const choice = await dialog.showMessageBox(mainWindow, {
      type: "question",
      title: "Alterações não salvas",
      message: "Há alterações não salvas neste projeto.",
      detail:
        "Volte ao editor e salve o projeto, ou feche descartando apenas as alterações desde o último salvamento.",
      buttons: ["Continuar editando", "Descartar e fechar"],
      defaultId: 0,
      cancelId: 0,
    });
    if (choice.response === 1) {
      mainWindow.destroy();
    }
  });
  mainWindow.once("ready-to-show", () => mainWindow.show());
  registerHandlers();
  await mainWindow.loadURL("cliprush://app/");
  log("app.started", { version: app.getVersion() });
}
app.on("second-instance", () => {
  if (mainWindow) {
    mainWindow.restore();
    mainWindow.focus();
  }
});
app.on("window-all-closed", () => app.quit());
app.on("will-quit", () => {
  codex?.close();
  store?.close();
});
if (locked)
  void start().catch((error: unknown) => {
    dialog.showErrorBox(
      "ClipRush não pôde iniciar",
      error instanceof Error ? error.message : String(error),
    );
    app.exit(1);
  });
