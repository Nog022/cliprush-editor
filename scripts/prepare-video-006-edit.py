"""Phrase captions from local ASR and measured pauses; restrained original SFX."""
import json, re, wave, shutil
from pathlib import Path
import numpy as np
ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/'src/videos/video-006'
MEDIA=ROOT/'public/videos/video-006'
raw=json.loads((SRC/'alignment.json').read_text(encoding='utf-8'))
# Group phrases instead of claiming frame-perfect word highlighting.
groups=[['GTA 6 evoluiu mesmo.','Ou só ficou mais bonito?'],['A última comparação','muda tudo!'],['As ruas.','Compara Los Santos','com a movimentação','de Vice City.'],['As praias.','GTA 5 já tinha vida,','mas olha as multidões','nos trailers de GTA 6.'],['A noite.','Repara nos carros,','nas luzes','e nos reflexos.'],['Os celulares.','Vídeos e redes sociais','estão por toda parte','em GTA 6.'],['Mas a maior evolução','não está nos gráficos.'],['GTA 5 tinha cerca de','55 mil animações','de NPCs.','GTA 6?'],['Cerca de 600 mil!'],['Será que Vice City','vai parecer uma','cidade de verdade?','Comenta aí!']]
counts=[[4,5],[3,2],[2,3,3,3],[2,5,4,5],[2,3,2,3],[2,4,4,3],[4,4],[5,3,2,2],[4],[4,3,3,2]]
captions=[]
for segment,texts,sizes in zip(raw['segments'],groups,counts):
    words=segment['words']; cursor=0
    assert sum(sizes)==len(words),(segment['text'],len(words),sizes)
    for text,size in zip(texts,sizes):
        selection=words[cursor:cursor+size]; cursor+=size
        start=selection[0]['startMs']+240 if selection[0]['startMs'] else 0
        end=min(43217,selection[-1]['endMs']+240)
        captions.append({'text':text,'startMs':start,'endMs':end,'timestampMs':None,'confidence':None})
# Anchor phrase onsets and ends to measured silence boundaries where available.
anchors={'Ou só ficou mais bonito?':2245,'A última comparação':4039,'muda tudo!':5380,'As ruas.':6598,'Compara Los Santos':8196,'As praias.':11340,'GTA 5 já tinha vida,':13153,'A noite.':18120,'Repara nos carros,':19770,'Os celulares.':22994,'Vídeos e redes sociais':24792,'Mas a maior evolução':28562,'não está nos gráficos.':30235,'GTA 5 tinha cerca de':31891,'GTA 6?':36430,'Cerca de 600 mil!':37488,'Será que Vice City':39716,'Comenta aí!':42676}
for c in captions:
    c['startMs']=anchors.get(c['text'],c['startMs'])
for i,c in enumerate(captions[:-1]): c['endMs']=min(c['endMs'],captions[i+1]['startMs'])
i=next(i for i,c in enumerate(captions) if c['text']=='Cerca de 600 mil!')
captions[i:i+1]=[{**captions[i],'text':'Cerca de','endMs':38180},{**captions[i],'text':'600 mil!','startMs':38180}]
assert all(c['endMs']>c['startMs'] for c in captions)
(SRC/'captions.json').write_text(json.dumps(captions,ensure_ascii=False,indent=2),encoding='utf-8')
score=MEDIA/'audio/score-original-v001.wav'
if not score.exists(): shutil.copyfile(ROOT/'public/videos/video-003/audio/cliprush-trilha-original.wav',score)
sr=48000; duration=43.5; mix=np.zeros(round(sr*duration)); rng=np.random.default_rng(6006)
events=[(0,'hit'),(9.57,'whoosh'),(14.82,'whoosh'),(22.99,'click'),(30.24,'riser'),(38.18,'hit')]
for start,kind in events:
    length={'hit':.5,'whoosh':.33,'click':.08,'riser':1.4}[kind]
    t=np.arange(round(sr*length))/sr
    if kind=='hit': signal=np.sin(2*np.pi*(75*t-35*t*t))*np.exp(-t*10)*.13
    elif kind=='click': signal=np.sin(2*np.pi*1100*t)*np.exp(-t*65)*.025
    else:
        noise=rng.standard_normal(len(t)); noise=np.convolve(noise,np.ones(11)/11,mode='same')
        signal=noise*np.sin(np.pi*t/length)**2*(.035 if kind=='riser' else .055)
    pos=round(start*sr); mix[pos:pos+len(signal)]+=signal
target=MEDIA/'audio/sfx-original-v001.wav'
if not target.exists():
    with wave.open(str(target),'wb') as f:
        f.setnchannels(1); f.setsampwidth(2); f.setframerate(sr); f.writeframes((mix*32767).astype('<i2').tobytes())
(SRC/'audio-plan.json').write_text(json.dumps({'voice':'unaltered file, full duration; playback gain 0.88 for mix headroom','music':'local original synthesis copied from video-003; no external samples','effects':events,'captions':'Phrase-level ASR; global +240ms observed drift corrected, phrase onsets anchored to measured silence. No karaoke; raw ASR retained.'},indent=2),encoding='utf-8')
