"""Prepare only authored excerpts; preserve source and cached transcription."""
import json, subprocess, math, wave, struct
from pathlib import Path
root=Path(__file__).resolve().parents[1]
source=next((root/'public/videos/biblioteca/gta6/videos/davy').glob('*hGSTHYxIt0U*.mp4'))
target=root/'public/videos/videos-026/footage'
target.mkdir(parents=True,exist_ok=True)
clips={'hook-tiger':(360,2.1),'hook-white':(379,2),'hook-hammer':(438,2.6),'river':(118,5.6),'map':(50,3.4),'approach':(320,2.7),'binoculars':(198,5.1),'animals-a':(358,10),'animals-b':(378,6),'stealth':(438,5.8),'fight':(475,2.3),'end':(240,3.1)}
for name,(start,duration) in clips.items():
    output=target/f'{name}.mp4'
    if output.exists(): continue
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-ss',str(start),'-i',str(source),'-t',str(duration),'-vf','crop=1920:540:0:270','-an','-c:v','libx264','-preset','fast','-crf','16','-pix_fmt','yuv420p','-movflags','+faststart',str(output)],check=True)
    print(name,flush=True)
words=json.loads((root/'src/videos/video-026/words.json').read_text(encoding='utf-8'))
pages=[]
for w in words:
    if not pages or len(pages[-1]['words'])>=4 or w['endMs']-pages[-1]['startMs']>1450:
        pages.append({'startMs':w['startMs'],'endMs':w['endMs'],'words':[]})
    pages[-1]['words'].append(w)
    pages[-1]['endMs']=w['endMs']
(root/'src/videos/video-026/caption-pages.json').write_text(json.dumps(pages,ensure_ascii=False,indent=2),encoding='utf-8')
with wave.open(str(root/'public/videos/videos-026/audio/click.wav'),'wb') as out:
    out.setparams((1,2,48000,0,'NONE','not compressed'))
    out.writeframes(b''.join(struct.pack('<h',int(5000*math.exp(-i/700)*math.sin(2*math.pi*1400*i/48000))) for i in range(4800)))
