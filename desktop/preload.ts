import { contextBridge, ipcRenderer } from "electron";
import type { DesktopAPI } from "../shared/model";

const call = <T>(method: string, ...args: unknown[]): Promise<T> =>
  ipcRenderer.invoke(`cliprush:${method}`, ...args);
const api: DesktopAPI = {
  searchCatalog: (query) => call("searchCatalog", query),
  useCatalogScene: (id, candidate) => call("useCatalogScene", id, candidate),
  codexStatus: () => call("codexStatus"),
  codexLogin: () => call("codexLogin"),
  chooseCodex: () => call("chooseCodex"),
  productionStatus: (id) => call("productionStatus", id),
  generate: (id) => call("generate", id),
  cancelProduction: (id) => call("cancelProduction", id),
  answerApproval: (id, approved) => call("answerApproval", id, approved),
  attachReferences: (id) => call("attachReferences", id),
  reuseAsset: (id, source, asset) => call("reuseAsset", id, source, asset),
  categorizeAsset: (id, asset, category) =>
    call("categorizeAsset", id, asset, category),
  restoreProduction: (id) => call("restoreProduction", id),
  startRender: (id, settings, filename) =>
    call("startRender", id, settings, filename),
  listRenders: () => call("listRenders"),
  cancelRender: (id) => call("cancelRender", id),
  revealRender: (id) => call("revealRender", id),
  openRender: (id) => call("openRender", id),
  workspace: () => call("workspace"),
  createProject: (input) => call("createProject", input),
  saveProject: (project) => call("saveProject", project),
  duplicateProject: (id) => call("duplicateProject", id),
  archiveProject: (id, archived) => call("archiveProject", id, archived),
  createChannel: (name, language) => call("createChannel", name, language),
  importMedia: (id, mode, category) => call("importMedia", id, mode, category),
  relinkAsset: (projectId, assetId) => call("relinkAsset", projectId, assetId),
  inspectAssets: (id) => call("inspectAssets", id),
  updateAssetMetadata: (projectId, assetId, metadata) =>
    call("updateAssetMetadata", projectId, assetId, metadata),
  exportProject: (id) => call("exportProject", id),
  importProject: () => call("importProject"),
  openDataDirectory: () => call("openDataDirectory"),
  chooseDataDirectory: () => call("chooseDataDirectory"),
  openExport: (name) => call("openExport", name),
};
contextBridge.exposeInMainWorld("cliprush", Object.freeze(api));
