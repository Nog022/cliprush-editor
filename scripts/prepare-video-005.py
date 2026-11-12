"""Prepare timing, captions and an original suspense score without changing the voice."""
import json
import math
import subprocess
import wave
from pathlib import Path

import numpy as np
from scipy.signal import butter, sosfilt

ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/'src/videos/video-005'
AUDIO=ROOT/'public/videos/video-005/audio'
OUT=ROOT/'out/video-005'
features=json.loads((SRC/'audio-features.json').read_text(encoding='utf-8'))
duration=features['durationSeconds']
rate=44100
n=math.ceil(duration*rate)
t=np.arange(n)/rate
voice=np.frombuffer(subprocess.check_output(['ffmpeg','-v','error','-i',str(AUDIO/'narracao.mp3'),'-ac','1','-ar',str(rate),'-f','f32le','pipe:1']),dtype='<f4')

scenes=[
    {'id':'hook','from':0,'to':72,'state':'curiosity','label':'Por que a prisão?'},
    {'id':'trailer','from':72,'to':284,'state':'curiosity-to-whisper','label':'O trailer não explica'},
    {'id':'investigation','from':284,'to':504,'state':'investigation','label':'As pistas do passado'},
    {'id':'destiny','from':504,'to':648,'state':'serious','label':'Mudar o destino'},
    {'id':'choice','from':648,'to':771,'state':'whisper','label':'Uma escolha'},
    {'id':'source','from':771,'to':858,'state':'building','label':'A fonte oficial'},
    {'id':'reveal','from':858,'to':1050,'state':'revelation','label':'Lutou pela família'},
    {'id':'closing','from':1050,'to':features['durationInFrames'],'state':'energetic','label':'Mais segredos'},
]
timing={'fps':30,'audioDuration':duration,'durationInFrames':features['durationInFrames'],'scenes':scenes,
    'whispers':[[6.5,9.45],[21.6,25.7]],'suspensePauses':[[7.239456,7.614444],[23.868844,24.305351],[30.587642,30.924444]],
    'emphasis':{'prison':1.48,'past':10.9,'liberty':15.96,'destiny':20.78,'choice':22.56,'fight':30.35,'family':32.2,'cta':35.166},
    'alignmentNotes':'Whisper word boundaries refined against waveform and silence edges; 180ms interior alignment correction; leading words moved off silence; raw ASR retained.'}
(SRC/'timing.json').write_text(json.dumps(timing,ensure_ascii=False,indent=2),encoding='utf-8')

raw=json.loads((SRC/'alignment.json').read_text(encoding='utf-8'))
words=[]
# ASR repeats "O motivo?" at a segment seam; the supplied script has no repetition.
# The second repeated token has a zero-length interval. Preserve it in raw data only.
for segment in raw['segments']:
    for w in segment['words']:
        if w['startMs'] in [28080,28320]:
            continue
        item={**w,'startMs':w['startMs']+180,'endMs':w['endMs']+180,'timestampMs':None,'confidence':None}
        item['text']=item['text'].replace('Lúcia','Lucia').replace('seis','6')
        words.append(item)
refinements={
    180:(35,220), 280:(220,500),
    2160:(2513,2700),
    6660:(6695,6940),
    7200:(7615,7670), 7580:(7670,8280),
    9440:(9620,9780),
    11540:(11759,11920),
    14340:(14528,14720),
    16860:(16972,17420),
    19220:(19341,19780),
    21540:(21792,22000),
    23800:(24305,24460),
    25720:(25883,26060),
    28600:(28760,29200),
    30060:(30350,30588),
    30700:(30924,31120), 31120:(31120,31600),
    31600:(31600,31706), 31840:(31870,32200),
    32200:(32200,32763),
    32920:(33111,33260), 33260:(33260,33588),
    33660:(33749,33940),
    35100:(35166,35600),
    38260:(38260,38808),
}
for w in words:
    if w['startMs'] in refinements:
        w['startMs'],w['endMs']=refinements[w['startMs']]
    w['timestampMs']=round((w['startMs']+w['endMs'])/2)
for i,w in enumerate(words):
    if i and words[i-1]['endMs']>w['startMs']:
        words[i-1]['endMs']=w['startMs']
    assert w['startMs']<w['endMs'],w
(SRC/'captions.json').write_text(json.dumps(words,ensure_ascii=False,indent=2),encoding='utf-8')

def midi(note): return 440*2**((note-69)/12)
def add(dst,at,sound,pan=0):
    start=round(at*rate); length=min(len(sound),n-start)
    if length<=0:return
    dst[start:start+length]+=sound[:length,None]*np.array([math.sqrt((1-pan)/2),math.sqrt((1+pan)/2)])
def save(filename,data):
    dest=AUDIO/filename
    if dest.exists():raise RuntimeError(f'Original generated file already exists: {dest}')
    with wave.open(str(dest),'wb') as f:
        f.setnchannels(2);f.setsampwidth(2);f.setframerate(rate)
        f.writeframes((np.clip(data,-.96,.96)*32767).astype('<i2').tobytes())

rng=np.random.default_rng(5005)
music=np.zeros((n,2))
fx=np.zeros((n,2))
# Dark sustained harmonic beds opening into a warmer final chord.
chords=[(0,9.45,[38,45,50,53]),(9.45,16.8,[34,41,46,50]),(16.8,21.6,[31,38,43,46]),
        (21.6,25.7,[33,40,45,46]),(25.7,28.6,[33,40,45,49]),(28.6,32.2,[38,45,50,53]),
        (32.2,39.001,[38,45,50,54,57])]
for start,end,chord in chords:
    tt=np.arange(round((end-start+.4)*rate))/rate
    env=np.minimum(tt/.7,1)*np.clip((end-start+.4-tt)/.65,0,1)
    for j,note in enumerate(chord):
        freq=midi(note)
        pad=(np.sin(2*np.pi*freq*tt+.2*np.sin(tt*.6+j))+.3*np.sin(2*np.pi*freq*2.003*tt)+.12*np.sin(2*np.pi*freq*3*tt))/1.42
        add(music,start,pad*env*.032/len(chord),(-.55 if j%2 else .55))
# Sparse plucked motif and heartbeat rhythm; all generated oscillators.
for i,at in enumerate(np.arange(.3,duration,.833333)):
    tt=np.arange(round(.7*rate))/rate
    note=[62,69,65,64,62,57,60,61][i%8]
    if at>32.2:note=[62,69,66,74][i%4]
    pluck=(np.sin(2*np.pi*midi(note)*tt)+.25*np.sin(2*np.pi*midi(note)*2*tt))*np.exp(-tt*6)*(1-np.exp(-tt*100))
    add(music,at,pluck*.027,math.sin(i*1.7)*.55)
    if i%2==0:
        pulse=np.sin(2*np.pi*(43*tt+9*(1-np.exp(-tt*24))))*np.exp(-tt*15)
        add(music,at,pulse*.07)
# More energy into the source and reveal, but near silence at whispered pauses.
intensity=np.interp(t,[0,.2,6.3,6.65,9.35,9.7,16.6,17,21.4,21.8,25.45,25.9,28.2,28.55,29,30.5,30.59,30.7,30.93,31.15,32.2,32.4,35,38.7,duration],
    [0,.8,.7,.12,.12,.65,.65,.45,.45,.075,.075,.5,1.2,.1,.7,.6,.04,.015,.015,.4,1,1.2,1,1,0])
for begin,end in timing['suspensePauses']:
    dip=np.interp(t,[max(0,begin-.04),begin+.05,end-.03,end+.08],[1,.04,.04,1])
    intensity*=dip
# Speech-aware ducking, in addition to explicit whisper automation.
hop=441
rms=np.array([np.sqrt(np.mean(voice[i:i+hop]**2)) for i in range(0,len(voice),hop)])
env=sosfilt(butter(1,7,fs=rate,output='sos'),np.interp(np.arange(n),np.arange(len(rms))*hop,rms))
duck=.30+.70*(1-np.clip(env/.03,0,1))
music*=intensity[:,None]*duck[:,None]
music*=4

events=[(.03,'impact',.045),(1.48,'hit',.042),(2.4,'air',.012),
        (9.47,'paper',.016),(11.96,'tick',.012),(15.96,'ping',.016),
        (25.78,'riser',.022),(28.6,'air',.02),(30.35,'hit',.045),(32.2,'resolve',.045),(35.1,'air',.018)]
for at,kind,level in events:
    length=1.7 if kind=='riser' else 1 if kind=='resolve' else .6 if kind=='impact' else .35
    tt=np.arange(round(length*rate))/rate
    if kind in ['impact','hit']:
        sound=np.sin(2*np.pi*(45*tt+12*(1-np.exp(-tt*22))))*np.exp(-tt*13)
    elif kind=='resolve':
        sound=sum(np.sin(2*np.pi*midi(note)*tt) for note in [50,57,62,66])/4*np.exp(-tt*3)*(1-np.exp(-tt*100))
    elif kind in ['air','paper','riser']:
        noise=sosfilt(butter(2,[450,5000],'bandpass',fs=rate,output='sos'),rng.normal(size=len(tt)))
        sound=noise*np.sin(np.pi*tt/length)**2
        if kind=='riser':sound+=np.sin(2*np.pi*(100*tt+120*tt*tt))*.18*(tt/length)
    else:
        sound=np.sin(2*np.pi*(880 if kind=='ping' else 1600)*tt)*np.exp(-tt*35)
    add(fx,at,sound*level)
save('lucia-investigation-score-v002.wav',music)
if not (AUDIO/'lucia-investigation-sfx-v001.wav').exists():
    save('lucia-investigation-sfx-v001.wav',fx)
stats=[]
for label,start,end in [('curiosity',.05,1.9),('first-whisper',6.69,9.12),('investigation',9.62,16.56),('serious',16.97,21.32),('decisive-whisper',21.79,25.44),('reveal',28.76,32.76),('closing',35.16,38.8)]:
    a,b=round(start*rate),round(end*rate)
    stats.append({'state':label,'start':start,'end':end,'voiceRmsDb':round(float(20*np.log10(np.sqrt(np.mean(voice[a:b]**2)))),2),
                  'musicRmsDb':round(float(20*np.log10(np.sqrt(np.mean(music[a:b]**2)))),2)})
(SRC/'sound-design.json').write_text(json.dumps({'method':'Original additive synthesis, seeded noise, 72 BPM, phrase automation + measured RMS ducking','seed':5005,'events':events,'measuredStates':stats},ensure_ascii=False,indent=2),encoding='utf-8')
(SRC/'assets-inventory.json').write_text((OUT/'inventory.json').read_text(encoding='utf-8'),encoding='utf-8')
print(json.dumps({'captions':len(words),'states':stats},indent=2))
