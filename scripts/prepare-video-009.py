"""Reproduce local captions and deterministic original audio, preserving outputs."""
import json
import wave
from pathlib import Path
import numpy as np
R=Path.cwd(); S=R/'src/videos/video-009'; M=R/'public/videos/video-009'
words=json.loads((S/'transcript.raw.json').read_text(encoding='utf-8'))
if not (S/'captions.json').exists():
    (S/'captions.json').write_text(json.dumps(words,ensure_ascii=False,indent=2),encoding='utf-8')
sr=48000; duration=1286/30; t=np.arange(round(duration*sr))/sr
rng=np.random.default_rng(9009)
score=(.014*np.sin(2*np.pi*55*t)+.006*np.sin(2*np.pi*82.4069*t)+.004*np.sin(2*np.pi*110.1*t))*(.7+.3*np.sin(2*np.pi*.5*t)**2)
score*=np.minimum(t/.2,1)*np.clip((duration-t)/.3,0,1)
score*=np.interp(t,[0,30.5,30.65,31.65,32,42.6,duration],[1,1,.08,.08,1,1,0])
sfx=np.zeros(len(t));events=[]
def event(onset,kind,length=.6,amp=1):
    events.append({'seconds':onset,'kind':kind})
    i=round(onset*sr); a=np.arange(min(round(length*sr),len(t)-i))/sr
    noise=np.convolve(rng.standard_normal(len(a)),np.ones(22)/22,mode='same')
    if kind=='tick': v=.028*np.sin(2*np.pi*1600*a)*np.exp(-a*100)
    elif kind=='whoosh': v=noise*.09*np.sin(np.pi*a/length)**2
    elif kind=='riser': v=(noise*.07+.009*np.sin(2*np.pi*(180*a+220*a*a)))*np.sin(np.pi*a/length)**2
    elif kind=='stop': v=.06*np.sin(2*np.pi*(300*a-230*a*a))*np.exp(-a*12)
    elif kind=='finish': v=.022*(np.sin(2*np.pi*330*a)+np.sin(2*np.pi*440*a))*np.exp(-a*7)
    else: v=.10*np.sin(2*np.pi*(78*a-32*a*a))*np.exp(-a*9)+noise*.045*np.exp(-a*18)
    v*=np.minimum(a/.003,1)*np.clip((length-a)/.02,0,1)*amp
    sfx[i:i+len(a)]+=v
for s in [0,5.5,10.133,18.4,33.02]: event(s,'impact')
for s in [6.9,7.93,8.96,12.8,13.667,16.067,20.567,25.533,28.067,35.733,38.033]: event(s,'whoosh',.32,.7)
for s in np.arange(5.5,9.8,.45): event(float(s),'tick',.12)
for s in np.arange(13.67,16.0,.18): event(float(s),'tick',.1,.8)
for s in [16.1,17.1,18.1]: event(s,'tick',.12)
event(30.66,'stop');event(31.7,'riser',1.3);event(41.38,'finish')
for name,data in [('score-original-v001.wav',score),('sfx-original-v001.wav',sfx)]:
    p=M/'audio'/name
    if p.exists():
        print('Preserved:',p.name)
        continue
    with wave.open(str(p),'wb') as w:
        w.setnchannels(1);w.setsampwidth(2);w.setframerate(sr);w.writeframes((np.clip(data,-1,1)*32767).astype('<i2').tobytes())
if not (S/'audio-plan.json').exists():
    (S/'audio-plan.json').write_text(json.dumps({'events':events,'narration':'Original full MP3, 42.840813s, gain .92, no retiming or edits','synthesis':'Original deterministic synthesis, seed 9009; no external samples','transcription':'Existing cached faster-whisper large-v3, estimated word timings'},indent=2),encoding='utf-8')
print('Captions and audio ready.')
