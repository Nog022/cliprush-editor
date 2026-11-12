"""Forced alignment of the provided script, using local cached model only."""
import json
from pathlib import Path
from faster_whisper import WhisperModel
from faster_whisper.audio import decode_audio, pad_or_trim
from faster_whisper.tokenizer import Tokenizer

root = Path('public/videos/video-014')
out = Path('out/video-014/alinhamento-v001.json')
if out.exists():
    raise SystemExit('Cached alignment exists; no processing repeated.')
scenes = json.loads((root/'roteiro/marcacoes.json').read_text(encoding='utf-8'))['scenes']
audio = decode_audio(str(root/'audio/narracao.mp3'))
boundaries = [0, 7.35, 14.45, 22.25, 29.95, 36.7, 43.95, 50.45, len(audio)/16000]
model = WhisperModel('large-v3', device='cpu', compute_type='int8', local_files_only=True, cpu_threads=6)
tokenizer = Tokenizer(model.hf_tokenizer, model.model.is_multilingual, task='transcribe', language='pt')
aligned_scenes = []
for i, scene in enumerate(scenes):
    begin, end = boundaries[i:i+2]
    features = model.feature_extractor(audio[round(begin*16000):round(end*16000)])
    encoded = model.encode(pad_or_trim(features))
    aligned = model.find_alignment(tokenizer, [tokenizer.encode(' '+scene['narration'])], encoded, features.shape[-1])[0]
    words = [{'text': w['word'], 'startMs': round((begin+float(w['start']))*1000), 'endMs': round((begin+float(w['end']))*1000), 'timestampMs': None, 'confidence': round(float(w['probability']),3)} for w in aligned]
    aligned_scenes.append({'order':i+1, 'window':[begin,end], 'words':words})
    print(i+1, [(w['text'],w['startMs'],w['endMs']) for w in words], flush=True)
out.write_text(json.dumps({'duration':len(audio)/16000,'method':'forced alignment of supplied narration; local large-v3 cache, no transcription', 'scenes':aligned_scenes},ensure_ascii=False,indent=2),encoding='utf-8')
