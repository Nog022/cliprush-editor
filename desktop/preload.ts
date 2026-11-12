import { contextBridge, ipcRenderer } from "electron";
import type { DesktopAPI } from "../shared/model";

const call = <T>(method: string, ...args: unknown[]): Promise<T> =>
  ipcRenderer.invoke(`cliprush:${method}`, ...args);
const api: DesktopAPI = {
  workspace: () => call("workspace"),
  createProject: (input) => call("createProject", input),
  saveProject: (project) => call("saveProject", project),
  duplicateProject: (id) => call("duplicateProject", id),
  archiveProject: (id, archived) => call("archiveProject", id, archived),
  createChannel: (name, language) => call("createChannel", name, language),
  importMedia: (id, mode) => call("importMedia", id, mode),
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
