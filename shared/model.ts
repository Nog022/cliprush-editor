import type { Caption } from "@remotion/captions";
export const SCHEMA_VERSION = 2;
export type ProjectType = "narrated" | "clips" | "animated" | "mixed" | "template" | "blank";
export type MediaRole = "narration" | "image" | "video" | "music" | "sfx" | "caption" | "thumbnail";
export interface Scene {
  id: string; name: string; from: number; durationInFrames: number;
  title: string; subtitle: string; background: string; accent: string;
  shape: "circle" | "square" | "none";
  animation: "fade" | "zoom" | "slide" | "none";
}
export interface RenderSettings {
  preset: "portrait" | "landscape" | "square" | "custom";
  width: number; height: number; fps: number;
  quality: "draft" | "balanced" | "high";
  audio: boolean; captions: boolean;
}
export interface RenderJob {
  id: string; projectId: string; projectName: string; projectRevision: number;
  status: "queued" | "rendering" | "completed" | "failed" | "cancelled";
  progress: number; phase: string; outputPath: string; createdAt: string; updatedAt: string;
  settings: RenderSettings; error?: string; bytes?: number;
}
export type AssetKind = "image" | "video" | "audio" | "caption";
export type ImportMode = "copy" | "reference";
export interface Channel {
  id: string;
  name: string;
  language: string;
  color: string;
}
export interface Asset {
  id: string;
  name: string;
  kind: AssetKind;
  mode: ImportMode;
  path: string;
  hash: string;
  bytes: number;
  width?: number;
  height?: number;
  duration?: number;
  thumbnail?: string;
  missing?: boolean;
  role?: MediaRole;
}
export interface Clip {
  id: string;
  assetId: string;
  from: number;
  durationInFrames: number;
  volume: number;
  trimBefore?: number;
}
export interface Project {
  schemaVersion: 2;
  id: string;
  revision: number;
  channelId: string;
  name: string;
  language: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
  width: number;
  height: number;
  fps: number;
  durationInFrames: number;
  assets: Asset[];
  clips: Clip[];
  type: ProjectType;
  scenes: Scene[];
  captions: Caption[];
  exportSettings: RenderSettings;
}
export interface NewProject {
  name: string;
  channelId: string;
  language: string;
  category: string;
  width: number;
  height: number;
  fps: number;
  durationInFrames: number;
  type?: ProjectType;
}
export interface LegacyInfo {
  id: string;
  name: string;
  width: number;
  height: number;
  fps: number;
  durationInFrames: number;
  createdAt?: string;
  updatedAt?: string;
  thumbnail?: string;
}
export interface ExportInfo {
  name: string;
  bytes: number;
  modifiedAt: string;
}
export interface Workspace {
  channels: Channel[];
  projects: Project[];
  legacy: LegacyInfo[];
  exports: ExportInfo[];
  dataDirectory: string;
  version: string;
  renders: RenderJob[];
}
export interface ImportResult {
  project: Project;
  imported: number;
  duplicates: number;
  errors: string[];
}
export interface DesktopAPI {
  workspace(): Promise<Workspace>;
  createProject(input: NewProject): Promise<Project>;
  saveProject(project: Project): Promise<Project>;
  duplicateProject(id: string): Promise<Project>;
  archiveProject(id: string, archived: boolean): Promise<void>;
  createChannel(name: string, language: string): Promise<Channel>;
  importMedia(id: string, mode: ImportMode, role?: MediaRole): Promise<ImportResult | null>;
  relinkAsset(projectId: string, assetId: string): Promise<Project | null>;
  inspectAssets(projectId: string): Promise<Project>;
  updateAssetMetadata(
    projectId: string,
    assetId: string,
    metadata: { duration?: number; width?: number; height?: number },
  ): Promise<Project>;
  exportProject(id: string): Promise<boolean>;
  importProject(): Promise<Project | null>;
  openDataDirectory(): Promise<void>;
  chooseDataDirectory(): Promise<boolean>;
  openExport(name: string): Promise<void>;
  startRender(projectId: string, settings: RenderSettings, filename: string): Promise<RenderJob | null>;
  listRenders(): Promise<RenderJob[]>;
  cancelRender(id: string): Promise<void>;
  revealRender(id: string): Promise<void>;
  openRender(id: string): Promise<void>;
}
declare global {
  interface Window {
    cliprush: DesktopAPI;
  }
}
