"""Align the supplied script locally; no ASR retranscription or model download."""
import json
from pathlib import Path
from faster_whisper import WhisperModel
from faster_whisper.audio import decode_audio, pad_or_trim
from faster_whisper.tokenizer import Tokenizer

out = Path('out/video-011/alinhamento.json')
if out.exists():
    raise SystemExit('Cached alignment already exists')
script = Path('public/videos/video-011/roteiro/roteiro.txt').read_text(encoding='utf-8')
text = script.split('O nível de detalhe', 1)[1].split('MAPA VISUAL', 1)[0]
text = 'O nível de detalhe' + text
first, second = text.split('E a física impressiona:', 1)
audio = decode_audio('public/videos/video-011/audio/narracao.mp3')
model = WhisperModel('large-v3', device='cpu', compute_type='int8', local_files_only=True, cpu_threads=6)
tokenizer = Tokenizer(model.hf_tokenizer, model.model.is_multilingual, task='transcribe', language='pt')
words = []
for begin, end, passage in [(0, 26.6, first), (26.6, len(audio)/16000, 'E a física impressiona:' + second)]:
    features = model.feature_extractor(audio[round(begin*16000):round(end*16000)])
    n = features.shape[-1]
    encoded = model.encode(pad_or_trim(features))
    result = model.find_alignment(tokenizer, [tokenizer.encode(' ' + ' '.join(passage.split()))], encoded, n)[0]
    for w in result:
        words.append({'word':w['word'], 'start':round(begin+float(w['start']),3), 'end':round(begin+float(w['end']),3), 'probability':round(float(w['probability']),3)})
out.write_text(json.dumps({'method':'forced alignment of supplied script; local cached large-v3', 'duration':len(audio)/16000, 'words':words}, ensure_ascii=False, indent=2),encoding='utf-8')
for w in words:
    if any(k in w['word'].lower() for k in ['nível','repara','quadro','agora','geladeira','física','brinco','cord','mochila','líquido','garrafa','mas','ratinho','qual','segue']):
        print(w, flush=True)
