"""Alinha a narração local sem downloads e sem alterar os cues originais."""
import json
from pathlib import Path
from faster_whisper import WhisperModel

root = Path(__file__).resolve().parents[1]
output = root / 'public/videos/video-002/narracao-alignment.json'
if output.exists():
    raise SystemExit('Alinhamento já existe; preserve a revisão antes de gerar outro.')
model = WhisperModel('large-v3', device='cpu', compute_type='int8', local_files_only=True)
segments, _ = model.transcribe(
    str(root / 'public/videos/video-002/narracao.mp3'), language='pt',
    word_timestamps=True, beam_size=5, vad_filter=True,
    initial_prompt='ClipRush. A evolução dos games. Pixels. Uma nova dimensão.',
)
result = []
for segment in segments:
    print(f'{segment.start:.2f}–{segment.end:.2f}: {segment.text}', flush=True)
    result.append({
        'startMs': round(segment.start * 1000), 'endMs': round(segment.end * 1000),
        'text': segment.text.strip(),
        'words': [{'text': word.word, 'startMs': round(word.start * 1000),
                   'endMs': round(word.end * 1000),
                   'timestampMs': round((word.start + word.end) * 500),
                   'confidence': round(word.probability, 4)} for word in segment.words or []],
    })
output.write_text(json.dumps({'source': 'videos/video-002/narracao.mp3',
                             'method': 'faster-whisper large-v3, local cache',
                             'segments': result}, ensure_ascii=False, indent=2), encoding='utf-8')
