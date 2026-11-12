"""Forced alignment of approved text; cached local model, no transcription."""
import hashlib
import json
from pathlib import Path
from faster_whisper import WhisperModel
from faster_whisper.audio import decode_audio, pad_or_trim
from faster_whisper.tokenizer import Tokenizer

prod = Path('public/videos/video-016')
out = Path('out/video-016')
out.mkdir(parents=True, exist_ok=True)
target = out/'alinhamento-v001.json'
if target.exists():
    raise SystemExit('Cached alignment exists; no processing repeated.')
passages = [' '.join(p.split()) for p in (prod/'roteiro/narracao.txt').read_text(encoding='utf-8').strip().split('\n\n') if p.strip()]
audio = decode_audio(str(prod/'audio/narracao.mp3'))
# Phrase boundaries taken from silence measurements in this recording.
boundaries = [0,3.65,6.6,12.1,16.95,21.3,23.2,26.5,32.65,36.1,len(audio)/16000]
assert len(passages) == 10
model = WhisperModel('large-v3', device='cpu', compute_type='int8', local_files_only=True, cpu_threads=6)
tokenizer = Tokenizer(model.hf_tokenizer, model.model.is_multilingual, task='transcribe', language='pt')
scenes = []
for i, passage in enumerate(passages):
    start, end = boundaries[i:i+2]
    features = model.feature_extractor(audio[round(start*16000):round(end*16000)])
    encoded = model.encode(pad_or_trim(features))
    aligned = model.find_alignment(tokenizer, [tokenizer.encode(' '+passage)], encoded, features.shape[-1])[0]
    words = [{'text':w['word'], 'startMs':round((start+float(w['start']))*1000), 'endMs':round((start+float(w['end']))*1000), 'timestampMs':None, 'confidence':round(float(w['probability']),3)} for w in aligned]
    scenes.append({'order':i+1, 'text':passage, 'window':[start,end], 'words':words})
    print(i+1,[(w['text'],w['startMs'],w['endMs']) for w in words],flush=True)
target.write_text(json.dumps({'duration':len(audio)/16000,'method':'Local forced alignment of approved text; no transcription','audioSha256':hashlib.sha256((prod/'audio/narracao.mp3').read_bytes()).hexdigest(),'scenes':scenes},ensure_ascii=False,indent=2),encoding='utf-8')
