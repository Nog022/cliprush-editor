import { useState } from "react";
import type { Clip, Project } from "../../shared/model";
import { validRegion, type Region, type VisualAnalysis } from "../../shared/visual-analysis";
import { mediaURL } from "../ProjectComposition";

export function ClipAnalysis({ project, clip, busy, save, onApply }: {
  project: Project; clip: Clip; busy: boolean; save: () => Promise<Project | undefined>;
  onApply?: (result: VisualAnalysis) => void;
}) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<VisualAnalysis>();
  const [error, setError] = useState("");
  const [draft, setDraft] = useState<Region>({ x: 0, y: 0, width: 1, height: 1 });
  const asset = project.assets.find(a => a.id === clip.assetId);
  const accept = (analysis: VisualAnalysis) => {
    setResult(analysis);
    setDraft(analysis.webcam.regions[0] ?? { x: 0, y: 0, width: 1, height: 1 });
  };
  const labels = { detected: "detectado", uncertain: "incerto", not_detected: "não identificado" };
  return <div>
    <button disabled={busy || running} onClick={async () => {
      setRunning(true);
      setError("");
      try {
        const saved = await save();
        if (!saved) throw new Error("Projeto indisponível.");
        accept(await window.cliprush.analyzeClip(saved.id, clip.id));
      } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
      finally { setRunning(false); }
    }}>{running ? "Analisando trecho…" : "Analisar trecho"}</button>
    {error && <p role="alert">{error}</p>}
    {result && <details>
      <summary>Rostos {result.faces.reduce((n, f) => n + f.regions.length, 0)} · Webcam {labels[result.webcam.status]} · Fala {labels[result.speech.status]}</summary>
      <p>{(result.startMs / 1000).toFixed(3)}–{(result.endMs / 1000).toFixed(3)} s da fonte · {result.sampledAtMs.length} quadros · {(result.elapsedMs / 1000).toFixed(1)} s de análise · Locutor sem associação visual</p>
      <p>Webcam {result.webcam.origin === "manual" ? "ajustada manualmente" : "automática"} · confiança geométrica {result.webcam.confidence.toFixed(2)} · {labels[result.webcam.status]}</p>
      {asset && <div style={{ position: "relative", maxWidth: 720 }}>
        {/* Standalone source inspector, controlled independently of the Remotion timeline. */}
        {/* eslint-disable-next-line @remotion/warn-native-media-tag */}
        <video controls preload="metadata" src={mediaURL(project.id, asset)}
          style={{ width: "100%", display: "block" }}
          onLoadedMetadata={e => { e.currentTarget.currentTime = result.startMs / 1000; }}
          onTimeUpdate={e => {
            if (e.currentTarget.currentTime >= result.endMs / 1000) {
              e.currentTarget.pause();
              e.currentTarget.currentTime = result.startMs / 1000;
            }
          }} />
        {validRegion(draft) && <div aria-label="Região de webcam no preview" style={{
          position: "absolute", pointerEvents: "none", border: "3px solid #ffd43b", boxSizing: "border-box",
          left: `${draft.x * 100}%`, top: `${draft.y * 100}%`, width: `${draft.width * 100}%`, height: `${draft.height * 100}%`,
        }} />}
      </div>}
      <fieldset disabled={busy || running}>
        <legend>Ajuste da webcam no preview · coordenadas normalizadas</legend>
        {(["x", "y", "width", "height"] as const).map(key => <label key={key}>{key}
          <input aria-label={`Webcam ${key}`} type="number" min="0" max="1" step="0.001" value={draft[key]}
            onChange={e => setDraft({ ...draft, [key]: Number(e.target.value) })} />
        </label>)}
        <button disabled={!validRegion(draft)} onClick={async () => {
          setRunning(true);
          setError("");
          try { accept(await window.cliprush.analyzeClip(project.id, clip.id, { manualWebcamRegion: draft })); }
          catch (e) { setError(String(e)); }
          finally { setRunning(false); }
        }}>Salvar região manual</button>
        <button onClick={async () => {
          setRunning(true);
          setError("");
          try { accept(await window.cliprush.analyzeClip(project.id, clip.id, { manualWebcamRegion: null })); }
          catch (e) { setError(String(e)); }
          finally { setRunning(false); }
        }}>Restaurar detecção automática</button>
      </fieldset>
      {onApply && <button disabled={busy || running} onClick={() => {
        try { onApply(result); setError(''); } catch (e) { setError(String(e)); }
      }}>Aplicar enquadramento ao preset</button>}
      <pre>{JSON.stringify(result, null, 2)}</pre>
    </details>}
  </div>;
}
