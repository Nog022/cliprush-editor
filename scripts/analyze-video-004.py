"""Read the original narration and transcribe using the already cached model."""
import json
import subprocess
from pathlib import Path
from faster_whisper import WhisperModel

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'src/videos/video-004'
OUT.mkdir(parents=True, exist_ok=True)
audio = ROOT / 'public/videos/video-004/audio/narracao.mp3'
destination = OUT / 'alignment.json'
if destination.exists():
    raise SystemExit('Alignment already exists; preserve the reviewed file.')
probe = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-show_format', '-show_streams', '-of', 'json', str(audio)]))
(OUT / 'audio-probe.json').write_text(json.dumps(probe, indent=2), encoding='utf-8')
model = WhisperModel('large-v3', device='cpu', compute_type='int8', local_files_only=True)
segments, info = model.transcribe(str(audio), language='pt', word_timestamps=True,
    beam_size=5, vad_filter=True,
    initial_prompt='Mano! GTA seis. Duzentos e doze gigas. Rockstar. Pré-download antecipado. PlayStation cinco. Xbox. Novembro.')
result = []
for segment in segments:
    print(f'{segment.start:.2f} - {segment.end:.2f}: {segment.text}', flush=True)
    result.append({'startMs': round(segment.start * 1000), 'endMs': round(segment.end * 1000),
        'text': segment.text.strip(), 'words': [
            {'text': w.word, 'startMs': round(w.start * 1000), 'endMs': round(w.end * 1000),
             'timestampMs': round((w.start + w.end) * 500), 'confidence': round(w.probability, 4)}
            for w in segment.words or []]})
destination.write_text(json.dumps({'method': 'faster-whisper large-v3, cached local CPU int8',
    'source': 'videos/video-004/audio/narracao.mp3', 'segments': result}, ensure_ascii=False, indent=2), encoding='utf-8')
