from pathlib import Path
import json,math,wave
import numpy as np
P=Path('src/videos/video-010/captions-v003.json'); words=json.loads(P.read_text(encoding='utf-8'));clean=[]
for w in words:
 t=w['text'].strip()
 if not t: continue
 if all(c in '.,:;!?-' for c in t):
  if clean: clean[-1]['text']+=t
  continue
 w['text']=t;clean.append(w)
P.write_text(json.dumps(clean,ensure_ascii=False,indent=2),encoding='utf-8')
E=Path('public/videos/video-010/edit-v003');E.mkdir(exist_ok=True)
sr=48000;t=np.arange(math.ceil(37.564063*sr))/sr
pad=sum(np.sin(2*np.pi*f*t+0.15*np.sin(2*np.pi*.08*t)) for f in [110,164.81,220,261.63])/4
pad*=.009*np.minimum(t/1.2,1)*np.minimum((37.565-t)/.45,1)*np.where((t>24.1)&(t<31.66),.22,1)
rng=np.random.default_rng(10)
for at in [0,12.78,19.08]:
 dt=t-at; env=np.exp(-np.maximum(dt,0)*15)*(dt>=0)*(dt<.4)
 pad+=.025*np.sin(2*np.pi*(95*dt-50*dt*dt))*env
 if at>0: pad+=.008*rng.standard_normal(len(t))*np.exp(-((dt-.08)/.07)**2)
with wave.open(str(E/'ambiente-sutil.wav'),'wb') as w:
 w.setnchannels(1);w.setsampwidth(2);w.setframerate(sr);w.writeframes((np.clip(pad,-1,1)*32767).astype('<i2').tobytes())
