import type { Project, Scene } from "./model";
export interface Requirement { id: string; label: string; state: "done" | "required" | "optional" | "error"; target: "settings" | "media" | "timeline" | "export" }
export function preparation(p: Project): { ready: boolean; items: Requirement[] } {
  const used = p.assets.filter((a) => p.clips.some((c) => c.assetId === a.id));
  const items: Requirement[] = [
    { id: "name", label: "Nome do projeto definido", state: p.name.trim() ? "done" : "required", target: "settings" },
    { id: "format", label: "Formato do vídeo configurado", state: p.width > 0 && p.height > 0 && p.fps > 0 ? "done" : "error", target: "settings" },
    { id: "timeline", label: "Cenas ou elementos na timeline", state: p.clips.length + p.scenes.length > 0 ? "done" : "required", target: "timeline" },
    { id: "media", label: "Mídias da timeline acessíveis", state: used.some((a) => a.missing) ? "error" : "done", target: "media" },
    { id: "duration", label: "Duração válida", state: Number.isFinite(p.durationInFrames) && p.durationInFrames > 0 ? "done" : "error", target: "timeline" },
    { id: "export", label: "Configuração de exportação definida", state: p.exportSettings ? "done" : "required", target: "export" },
    { id: "narration", label: "Narração principal (opcional)", state: used.some((a) => a.kind === "audio" && a.role !== "music" && a.role !== "sfx") ? "done" : "optional", target: "media" },
    { id: "thumbnail", label: "Thumbnail (opcional)", state: p.assets.some((a) => a.role === "thumbnail") ? "done" : "optional", target: "media" },
    { id: "music", label: "Música de fundo (opcional)", state: used.some((a) => a.role === "music") ? "done" : "optional", target: "media" },
    { id: "captions", label: "Legendas (opcional)", state: p.captions.length ? "done" : "optional", target: "media" },
  ];
  if (p.type === "narrated" || p.type === "clips") items.splice(3, 0, { id: "visual", label: "Imagem ou vídeo na timeline", state: used.some((a) => ["image", "video"].includes(a.kind)) ? "done" : "required", target: "media" });
  return { ready: !items.some((i) => i.state === "required" || i.state === "error"), items };
}
export function newScene(p: Project, from = 0): Scene {
  return { id: crypto.randomUUID(), name: `Cena ${p.scenes.length + 1}`, from, durationInFrames: 5 * p.fps, title: p.language.startsWith("en") ? "Your story begins here" : "Sua história começa aqui", subtitle: "", background: "#101827", accent: "#b5f36b", shape: "circle", animation: "fade" };
}
export const typeNames = { narrated: "Vídeo com imagens e narração", clips: "Vídeo com clipes e cortes", animated: "Vídeo totalmente animado", mixed: "Vídeo misto", template: "Vídeo baseado em template", blank: "Projeto em branco" };
