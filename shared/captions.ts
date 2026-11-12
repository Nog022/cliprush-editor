import type { Caption } from "@remotion/captions";
export function parseCaptions(text: string): Caption[] {
  const time = (input: string) => { const parts = input.replace(",", ".").split(":").map(Number); return parts.reduce((total, value) => total * 60 + value, 0) * 1000; };
  const result: Caption[] = [];
  for (const block of text.replace(/\r/g, "").split(/\n\s*\n/)) {
    const lines = block.split("\n");
    const index = lines.findIndex((line) => line.includes("-->"));
    if (index === -1) continue;
    const match = /([\d:. ,]+)\s+-->\s+([\d:.,]+)/.exec(lines[index]);
    if (!match) throw new Error("Tempo inválido no arquivo de legendas.");
    const startMs = time(match[1].trim()), endMs = time(match[2].trim());
    if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs) throw new Error("Duração de legenda inválida.");
    result.push({ text: lines.slice(index + 1).join("\n").replace(/<[^>]+>/g, ""), startMs, endMs, timestampMs: null, confidence: null });
  }
  if (!result.length) throw new Error("Nenhuma legenda SRT/VTT válida encontrada.");
  return result;
}
