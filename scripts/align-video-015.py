"""Align only the approved text against the unmodified audio; use local cache."""
import json
from pathlib import Path
from faster_whisper import WhisperModel
from faster_whisper.audio import decode_audio, pad_or_trim
from faster_whisper.tokenizer import Tokenizer

root = Path('public/videos/video-015')
target = Path('out/video-015/alinhamento-v001.json')
target.parent.mkdir(parents=True, exist_ok=True)
if target.exists():
    raise SystemExit('Cached alignment exists; no processing repeated.')
paragraphs = (root / 'roteiro/narracao.txt').read_text(encoding='utf-8').strip().split('\n\n')
paragraphs = [' '.join(p.split()) for p in paragraphs if p.strip()]
audio = decode_audio(str(root / 'audio/narracao.mp3'))
# Pauses measured in the approved recording, not storyboard estimates.
boundaries = [0, 3.9, 11.45, 17.2, 23.9, 26.0, 30.05, 35.15, len(audio)/16000]
assert len(paragraphs) == 8
model = WhisperModel('large-v3', device='cpu', compute_type='int8', local_files_only=True, cpu_threads=6)
tokenizer = Tokenizer(model.hf_tokenizer, model.model.is_multilingual, task='transcribe', language='pt')
scenes = []
for i, paragraph in enumerate(paragraphs):
    begin, end = boundaries[i:i+2]
    features = model.feature_extractor(audio[round(begin*16000):round(end*16000)])
    encoded = model.encode(pad_or_trim(features))
    aligned = model.find_alignment(tokenizer, [tokenizer.encode(' '+paragraph)], encoded, features.shape[-1])[0]
    words = [{'text': w['word'], 'startMs': round((begin+float(w['start']))*1000), 'endMs': round((begin+float(w['end']))*1000), 'timestampMs': None, 'confidence': round(float(w['probability']), 3)} for w in aligned]
    scenes.append({'order': i+1, 'narration': paragraph, 'window': [begin, end], 'words': words})
    print(i+1, [(w['text'], w['startMs'], w['endMs']) for w in words], flush=True)
target.write_text(json.dumps({'duration': len(audio)/16000, 'method': 'Forced alignment of approved text; local cached large-v3; no transcription', 'scenes': scenes}, ensure_ascii=False, indent=2), encoding='utf-8')
