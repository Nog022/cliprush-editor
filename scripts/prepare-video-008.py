"""Lossless working image, caption normalization, and original deterministic sound."""
import json
import wave
from pathlib import Path
import numpy as np
from PIL import Image

R = Path.cwd()
M = R/'public/videos/video-008'
S = R/'src/videos/video-008'
(M/'images').mkdir(exist_ok=True)
dest = M/'images/jason-dog-lossless.webp'
if not dest.exists():
    Image.open(M/'imagens/jason e cachorro.jpg').save(dest, lossless=True, method=6)
words = json.loads((S/'transcript.raw.json').read_text(encoding='utf-8'))
for word in words:
    word['text'] = word['text'].replace(' VI?', ' 6?').replace(' VI', ' 6').replace(' V,', ' 5,')
    if word['text'].strip() == 'Rocco.': word['text'] = ' ROCCO!'
    if word['text'].strip() == 'Chop?': word['text'] = ' CHOP?!'
    if word['text'].strip() == 'Pera,': word['text'] = ' Pera...'
(S/'captions.json').write_text(json.dumps(words,ensure_ascii=False,indent=2),encoding='utf-8')
sr = 48000
duration = 890/30
t = np.arange(round(sr*duration))/sr
rng = np.random.default_rng(8008)
fade = np.minimum(t/.12,1)*np.clip((duration-t)/.28,0,1)
# Quiet suspense bed, no third-party samples. Voice is never time-stretched.
root = np.where(t<21.08,55.0,65.406)
phase = 2*np.pi*np.cumsum(root)/sr
score = (.019*np.sin(phase)+.009*np.sin(phase*1.5)+.006*np.sin(phase*2.003))
score *= .7+.3*np.sin(2*np.pi*.66*t)**2
for onset in np.arange(0,duration,.8):
    i=round(onset*sr); a=np.arange(min(int(.25*sr),len(t)-i))/sr
    score[i:i+len(a)] += .014*np.sin(2*np.pi*220*a)*np.exp(-a*23)
duck = np.ones(len(t))
for start,end in [(8.82,9.48),(19.64,20.10)]:
    duck *= np.interp(t,[0,start-.08,start,end,end+.16,duration],[1,1,.13,.13,1,1])
score *= fade*duck
sfx=np.zeros(len(t))
events=[(0,'impact'),(1.4,'whoosh'),(5.67,'whoosh'),(8.93,'stop'),
        (11.57,'whoosh'),(15.66,'tick'),(16.97,'riser'),(20.10,'reveal'),(28.26,'finish')]
for onset,kind in events:
    length=1.8 if kind=='riser' else .65
    i=round(onset*sr); a=np.arange(min(int(length*sr),len(t)-i))/sr
    noise=np.convolve(rng.standard_normal(len(a)),np.ones(18)/18,mode='same')
    if kind=='whoosh': v=noise*.075*np.sin(np.pi*a/length)**2
    elif kind=='stop': v=(.065*np.sin(2*np.pi*(330*a-210*a*a))+noise*.09)*np.exp(-a*11)
    elif kind=='tick': v=.055*np.sin(2*np.pi*1250*a)*np.exp(-a*70)
    elif kind=='riser': v=(noise*.028+np.sin(2*np.pi*(180*a+80*a*a))*.007)*np.sin(np.pi*a/length)**2
    elif kind=='finish': v=(np.sin(2*np.pi*261.63*a)+np.sin(2*np.pi*392*a))*.022*np.exp(-a*7)
    else: v=.14*np.sin(2*np.pi*(82*a-40*a*a))*np.exp(-a*10)+noise*.05*np.exp(-a*16)
    v *= np.minimum(a/.003,1)*np.minimum((length-a)/.02,1)
    sfx[i:i+len(a)] += v
for name,data in [('score-original-v001.wav',score),('sfx-original-v001.wav',sfx)]:
    p=M/'audio'/name
    if p.exists(): raise SystemExit('Refusing overwrite: '+str(p))
    with wave.open(str(p),'wb') as w:
        w.setnchannels(1);w.setsampwidth(2);w.setframerate(sr)
        w.writeframes((np.clip(data,-1,1)*32767).astype('<i2').tobytes())
(S/'audio-plan.json').write_text(json.dumps({'events':events,'source':'Original synthesis, seed 8008, no samples',
    'narration':'Complete original MP3, gain 0.92; no cuts or retiming',
    'captions':'Cached faster-whisper large-v3, word estimates; spelling normalized to supplied script'},indent=2),encoding='utf-8')
print('Lossless image, captions and original sound ready.')
