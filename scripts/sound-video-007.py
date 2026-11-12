import wave,json
from pathlib import Path
import numpy as np
M=Path('public/videos/video-007/audio'); sr=48000; duration=1192/30; t=np.arange(round(sr*duration))/sr; rng=np.random.default_rng(7007)
fade=np.minimum(t/.5,1)*np.minimum((duration-t)/.7,1)
score=(np.sin(2*np.pi*55*t)*.022+np.sin(2*np.pi*82.41*t)*.014+np.sin(2*np.pi*110.3*t)*.009)*(0.55+.45*np.sin(t*1.9)**2)*fade
mix=np.zeros(len(t)); events=[(0,'hit'),(9.86,'metal'),(18.76,'stamp'),(22.98,'hit'),(26.68,'radio'),(30.55,'radio'),(34.46,'radio'),(37.48,'hit')]
for start,kind in events:
 length=1.2 if kind=='radio' else .55; a=np.arange(round(sr*length))/sr; noise=rng.standard_normal(len(a)); smooth=np.convolve(noise,np.ones(8)/8,mode='same')
 if kind=='radio': sound=smooth*.035*np.sin(a*90)**2*np.sin(np.pi*a/length)**2
 elif kind=='metal': sound=(np.sin(2*np.pi*430*a)+np.sin(2*np.pi*713*a))*.045*np.exp(-a*13)
 elif kind=='stamp': sound=(smooth*.18+np.sin(2*np.pi*130*a)*.09)*np.exp(-a*25)
 else: sound=np.sin(2*np.pi*(75*a-35*a*a))*.15*np.exp(-a*10)
 i=round(start*sr); mix[i:i+len(a)]+=sound
for start in [5.2,7.36,14.03,16,20.43,24.67]:
 a=np.arange(int(sr*.25))/sr; sound=np.convolve(rng.standard_normal(len(a)),np.ones(15)/15,mode='same')*.06*np.sin(np.pi*a/.25)**2; i=round(start*sr);mix[i:i+len(a)]+=sound
for name,data in [('score-original-v001.wav',score),('sfx-original-v001.wav',mix)]:
 p=M/name
 if p.exists(): raise RuntimeError('Preserve existing '+name)
 with wave.open(str(p),'wb') as w:w.setnchannels(1);w.setsampwidth(2);w.setframerate(sr);w.writeframes((data*32767).astype('<i2').tobytes())
Path('src/videos/video-007/audio-plan.json').write_text(json.dumps({'events':events,'score':'original deterministic synthesis, no samples','voice':'original intact; gain 0.92; no retiming','captionMethod':'cached faster-whisper large-v3 word estimates; progressive reveal; no invented transcript'},indent=2))
