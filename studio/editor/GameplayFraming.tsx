import {useState} from 'react';
import type {Clip, Project} from '../../shared/model';
import {DEFAULT_GAMEPLAY_FOCUS, type GameplayFocus} from '../../shared/gameplay-focus';

export function GameplayFraming({project, clip, busy, save, onChange}: {
  project: Project; clip: Clip; busy: boolean; save: () => Promise<Project | undefined>;
  onChange: (focus: GameplayFocus, saved?: Project) => void;
}) {
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState('');
  const f = clip.liveFraming;
  if (!f) return null;
  const focus = f.gameplayFocus ?? DEFAULT_GAMEPLAY_FOCUS;
  return <fieldset disabled={busy || running}>
    <legend>Enquadramento do gameplay · preview</legend>
    <label>Modo de foco
      <select aria-label="Modo de foco do gameplay" value={focus.mode}
        onChange={e => onChange({...focus, mode: e.target.value as GameplayFocus['mode']})}>
        <option value="auto">Automático quando houver detecção confiável</option>
        <option value="manual">Manual</option>
      </select>
    </label>
    {(['x', 'y', 'zoom'] as const).map(key => <label key={key}>
      {key === 'zoom' ? 'Zoom' : `Posição ${key.toUpperCase()} (%)`}
      <input aria-label={`Gameplay ${key}`} type="range" min={key === 'zoom' ? 1 : 0}
        max={key === 'zoom' ? 3 : 100} step={key === 'zoom' ? .01 : .1}
        value={key === 'zoom' ? focus.zoom : focus[key] * 100}
        onChange={e => onChange({...focus, mode: 'manual',
          [key]: Number(e.target.value) / (key === 'zoom' ? 1 : 100)})} />
      <output>{(key === 'zoom' ? focus[key] : focus[key] * 100).toFixed(key === 'zoom' ? 2 : 1)}</output>
    </label>)}
    <button onClick={() => {onChange({...DEFAULT_GAMEPLAY_FOCUS}); setMessage('Foco central da fonte restaurado.');}}>
      Centralizar na fonte
    </button>
    <button onClick={async () => {
      setRunning(true); setMessage('');
      try {
        const saved = await save();
        const current = saved?.clips.find(c => c.id === clip.id)?.liveFraming;
        if (!saved || !current) throw new Error('Salve e aplique o enquadramento primeiro.');
        const r = current.gameplayRegion, s = current.sourceSize;
        const analysis = await window.cliprush.analyzeClip(project.id, clip.id, {
          sampleEveryMs: 1000, maxSamples: 120,
          gameplayFocusRegion: {x: r.x / s.width, y: r.y / s.height, width: r.w / s.width, height: r.h / s.height},
        });
        const detected = analysis.gameplay.focus;
        const samples = detected?.status === 'detected' && detected.confidence >= .8
          ? detected.samples.map(p => ({...p, atMs: p.atMs - analysis.startMs})) : [];
        onChange({...focus, mode: 'auto', samples}, saved);
        setMessage(samples.length >= 3 ? `Rosto central detectado em ${samples.length} amostras; foco suavizado.`
          : 'Sem detecção confiável. Foco na posição base; ajuste X, Y e zoom no preview.');
      } catch (error) {setMessage(String(error));}
      finally {setRunning(false);}
    }}>{running ? 'Detectando foco…' : 'Detectar foco do gameplay'}</button>
    <p className="hint">Os controles atualizam o preview. O recorte limita o movimento para não revelar a webcam original.
      Use o menor zoom compatível com o foco para preservar mais HUD. Sem detecção confiável, a posição base é mantida.</p>
    {message && <p role="status">{message}</p>}
  </fieldset>;
}
