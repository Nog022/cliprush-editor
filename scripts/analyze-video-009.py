"""Inventory, contact sheets and local word timestamps; originals stay untouched."""
import hashlib
import json
import subprocess
from pathlib import Path
from PIL import Image, ImageDraw, ImageOps

R = Path.cwd()
M = R/'public/videos/video-009'
O = R/'out/video-009'
S = R/'src/videos/video-009'
O.mkdir(parents=True, exist_ok=True)
S.mkdir(parents=True, exist_ok=True)
if not (O/'Root.before.tsx').exists():
    (O/'Root.before.tsx').write_bytes((R/'src/Root.tsx').read_bytes())
    paths = [p for p in (R/'src').rglob('*') if p.is_file() and 'video-009' not in p.parts]
    (O/'preserved.json').write_text(json.dumps({p.relative_to(R).as_posix():hashlib.sha256(p.read_bytes()).hexdigest() for p in paths}))
inventory=[]
for p in M.rglob('*'):
    if not p.is_file(): continue
    probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_format','-show_streams','-of','json',str(p)]))
    inventory.append({'file':p.relative_to(R/'public').as_posix(),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'probe':probe})
    print(p.name,probe['format'].get('duration'),flush=True)
    if p.suffix=='.mp4':
        duration=float(probe['format']['duration'])
        times=list(range(4,int(duration)-4,5))
        sheet=Image.new('RGB',(1280,205*((len(times)+3)//4)),'#11151e')
        draw=ImageDraw.Draw(sheet)
        for i,t in enumerate(times):
            jpg=O/f'{p.stem[:10]}-{t}.jpg'
            if not jpg.exists():
                subprocess.run(['ffmpeg','-v','error','-ss',str(t),'-i',str(p),'-frames:v','1','-vf','scale=320:180','-n',str(jpg)],check=True)
            x,y=i%4*320,i//4*205
            sheet.paste(Image.open(jpg),(x,y+25));draw.text((x+8,y+5),f'{t}s',fill='white')
        sheet.save(O/f'{p.stem[:10]}-sheet.jpg')
(S/'inventory.json').write_text(json.dumps(inventory,indent=2),encoding='utf-8')
imgs=list((M/'imagens').glob('*'))
sheet=Image.new('RGB',(960,210*((len(imgs)+2)//3)),'#11151e');draw=ImageDraw.Draw(sheet)
for i,p in enumerate(imgs):
    x,y=i%3*320,i//3*210
    sheet.paste(ImageOps.contain(Image.open(p).convert('RGB'),(320,180)),(x,y+30))
    draw.text((x+4,y+4),p.name,fill='white')
sheet.save(O/'images-sheet.jpg')
print('Contact sheets ready',flush=True)
if not (S/'transcript.raw.json').exists():
    from faster_whisper import WhisperModel
    model=WhisperModel('large-v3',device='cpu',compute_type='int8',local_files_only=True)
    segments,_=model.transcribe(str(M/'audio/narracao.mp3'),language='pt',word_timestamps=True,beam_size=5,vad_filter=True,initial_prompt='GTA 6, GTA 5, Red Dead Redemption 2. Rockstar. ClipRush. 48 minutos. 2 horas e 24 minutos.')
    words=[]
    for s in segments:
        print(f'{s.start:.2f}-{s.end:.2f}: {s.text}',flush=True)
        words.extend([{'text':w.word,'startMs':round(w.start*1000),'endMs':round(w.end*1000),'timestampMs':round((w.start+w.end)*500),'confidence':w.probability} for w in s.words or []])
    (S/'transcript.raw.json').write_text(json.dumps(words,ensure_ascii=False,indent=2),encoding='utf-8')
