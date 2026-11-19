"""One-time transcription using the existing cached model, without downloads."""
import json
from pathlib import Path
from faster_whisper import WhisperModel

root = Path(__file__).resolve().parents[1]
target = root / 'src/videos/video-022'
target.mkdir(parents=True, exist_ok=True)
output = target / 'words.json'
if output.exists():
    raise SystemExit('Existing transcription preserved')
model = WhisperModel('small', device='cpu', compute_type='int8', local_files_only=True)
segments, _ = model.transcribe(str(root / 'public/videos/video-022/audio/narracao.mp3'), language='pt', word_timestamps=True, vad_filter=True, initial_prompt='GTA seis, Grassrivers, Rockstar, ClipRush, Everglades.')
words, transcript = [], []
for segment in segments:
    print(f'{segment.start:.2f}-{segment.end:.2f}: {segment.text}', flush=True)
    transcript.append({'start':segment.start,'end':segment.end,'text':segment.text})
    for w in segment.words or []:
        words.append({'text':w.word,'startMs':round(w.start*1000),'endMs':round(w.end*1000),'timestampMs':round((w.start+w.end)*500),'confidence':round(w.probability,4)})
output.write_text(json.dumps(words,ensure_ascii=False,indent=2),encoding='utf-8')
(target/'segments.json').write_text(json.dumps(transcript,ensure_ascii=False,indent=2),encoding='utf-8')

