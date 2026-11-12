"""Forced alignment of the supplied script with the already installed model."""
import json
from pathlib import Path
from faster_whisper import WhisperModel
from faster_whisper.audio import decode_audio, pad_or_trim
from faster_whisper.tokenizer import Tokenizer

out=Path('out/video-012/alinhamento.json')
if out.exists():
    raise SystemExit('Using existing alignment')
script=Path('public/videos/video-012/roteiro/roteiro.txt').read_text(encoding='utf-8')
audio=decode_audio('public/videos/video-012/audio/narracao.mp3')
model=WhisperModel('large-v3',device='cpu',compute_type='int8',local_files_only=True,cpu_threads=6)
tokenizer=Tokenizer(model.hf_tokenizer,model.model.is_multilingual,task='transcribe',language='pt')
# Known script; no ASR and no downloads. Two <30s windows, with overlap at sentence boundary.
first,second=script.split('Só que tem uma pegadinha:',1)
words=[]
for begin,end,text in [(0,25,first),(23,len(audio)/16000,'Só que tem uma pegadinha:'+second)]:
    features=model.feature_extractor(audio[round(begin*16000):round(end*16000)])
    encoded=model.encode(pad_or_trim(features))
    aligned=model.find_alignment(tokenizer,[tokenizer.encode(' '+' '.join(text.split()))],encoded,features.shape[-1])[0]
    words.extend({'text':w['word'],'startMs':round((begin+float(w['start']))*1000),'endMs':round((begin+float(w['end']))*1000),'timestampMs':None,'confidence':round(float(w['probability']),3)} for w in aligned)
out.write_text(json.dumps({'duration':len(audio)/16000,'words':words},ensure_ascii=False,indent=2),encoding='utf-8')
print('Duration',len(audio)/16000)
print([(w['text'],w['startMs']) for w in words])
