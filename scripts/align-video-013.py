"""Align the supplied narration text locally; no transcription or downloads."""
import json
from pathlib import Path
from faster_whisper import WhisperModel
from faster_whisper.audio import decode_audio, pad_or_trim
from faster_whisper.tokenizer import Tokenizer

root = Path('public/videos/video-013')
out = Path('out/video-013')
out.mkdir(parents=True, exist_ok=True)
target = out / 'alinhamento-v001.json'
if target.exists():
    raise SystemExit('Using cached alignment; no repeated model processing')
script = (root / 'roteiro/roteiro.txt').read_text(encoding='utf-8')
text = script.split('VERSÃO LIMPA PARA NARRAÇÃO', 1)[1].split('NOTAS PARA EDIÇÃO', 1)[0].strip('-\n\r ')
(root / 'roteiro/narracao.txt').write_text(text + '\n', encoding='utf-8')
audio = decode_audio(str(root / 'audio/narracao.mp3'))
model = WhisperModel('large-v3', device='cpu', compute_type='int8', local_files_only=True, cpu_threads=6)
tokenizer = Tokenizer(model.hf_tokenizer, model.model.is_multilingual, task='transcribe', language='pt')
first, second = text.split('E terceiro:', 1)
words = []
windows = [(0, 29.8, first), (26.68, len(audio)/16000, 'E terceiro:' + second)]
for begin, end, passage in windows:
    features = model.feature_extractor(audio[round(begin*16000):round(end*16000)])
    encoded = model.encode(pad_or_trim(features))
    aligned = model.find_alignment(tokenizer, [tokenizer.encode(' '+' '.join(passage.split()))], encoded, features.shape[-1])[0]
    words.extend({'text': w['word'], 'startMs': round((begin+float(w['start']))*1000), 'endMs': round((begin+float(w['end']))*1000), 'timestampMs': None, 'confidence': round(float(w['probability']), 3)} for w in aligned)
target.write_text(json.dumps({'duration': len(audio)/16000, 'textSource': 'roteiro.txt / VERSÃO LIMPA PARA NARRAÇÃO', 'words': words}, ensure_ascii=False, indent=2), encoding='utf-8')
print('Duration:', len(audio)/16000)
print([(w['text'], w['startMs'], w['endMs']) for w in words])
