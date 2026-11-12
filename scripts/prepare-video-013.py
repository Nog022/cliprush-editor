"""Prepare word captions, deterministic SFX, and source-window checks."""
import json
import math
import re
import wave
from pathlib import Path
import numpy as np

out=Path('out/video-013')
src=Path('src/videos/video-013')
src.mkdir(parents=True,exist_ok=True)
data=json.loads((out/'alinhamento-v001.json').read_text(encoding='utf-8'))
words=[]
for w in data['words']:
    text=w['text']
    if words and (re.fullmatch(r'[^\w\s]+',text.strip()) or text.startswith('-')):
        words[-1]['text']+=text.strip()
        words[-1]['endMs']=w['endMs']
    else:
        words.append(dict(w,text=text.strip()))
pages=[]
page=[]
for w in words:
    if page and (len(page)>=4 or sum(len(x['text'])+1 for x in page)+len(w['text'])>30):
        pages.append(page)
        page=[]
    page.append(w)
    if re.search(r'[.!?:]$',w['text']):
        pages.append(page)
        page=[]
if page: pages.append(page)
(src/'captions.json').write_text(json.dumps(pages,ensure_ascii=False,indent=2),encoding='utf-8')
(Path('public/videos/video-013')/'captions.json').write_text(json.dumps(words,ensure_ascii=False,indent=2),encoding='utf-8')
rate=44100
sound=np.zeros(math.ceil(data['duration']*rate))
rng=np.random.default_rng(13)
for frame,kind in [(92,'swish'),(154,'tick'),(196,'tick'),(250,'hit'),(297,'swish'),(501,'hit'),(550,'tick'),(802,'swish'),(972,'swish'),(1005,'swish'),(1135,'hit'),(1228,'swish'),(1288,'click')]:
    duration=.19 if kind!='click' else .1
    t=np.arange(round(duration*rate))/rate
    if kind in ['hit','tick','click']:
        sample=(np.sin(2*np.pi*(170 if kind=='hit' else 900)*t)*np.exp(-t*42)+rng.normal(0,.15,len(t))*np.exp(-t*90))*.065
    else:
        noise=rng.normal(0,1,len(t))
        sample=np.convolve(noise,np.ones(9)/9,mode='same')*np.sin(np.pi*t/duration)**2*.045
    start=round(frame/30*rate)
    sound[start:start+len(sample)]+=sample[:len(sound)-start]
with wave.open('public/videos/video-013/audio/efeitos-v001.wav','wb') as f:
    f.setparams((1,2,rate,0,'NONE','not compressed'))
    f.writeframes((np.clip(sound,-1,1)*32767).astype('<i2').tobytes())
print('Captions:',len(words),'words;',len(pages),'pages; duration frames:',math.ceil(data['duration']*30))
