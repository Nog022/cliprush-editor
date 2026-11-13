export type ProposedEdit = { file: string; after: string; sha256: string };
export const RETENTION_POLICY: string;
export function completeProduction(options: { root: string; current: number; output: string; expected: { width: number; height: number; fps: number; durationInFrames: number; audio?: boolean }; references?: string[]; check?: (root: string, current?: number, edits?: ProposedEdit[]) => Promise<void> }): Promise<unknown>;
export function checkProject(root: string, current?: number, edits?: ProposedEdit[]): Promise<void>;
export function validateMp4(file: string, expected?: { width: number; height: number; fps: number; durationInFrames: number; audio?: boolean }): Promise<{ sha256: string; bytes: number }>;
