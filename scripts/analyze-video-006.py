"""Local, non-destructive inventory, contact sheets and cached transcription."""
import json, math, subprocess, hashlib
from pathlib import Path
from PIL import Image, ImageDraw, ImageOps
from faster_whisper import WhisperModel

ROOT = Path(__file__).resolve().parents[1]
MEDIA = ROOT/'public/videos/video-006'
OUT = ROOT/'out/video-006'
SRC = ROOT/'src/videos/video-006'
OUT.mkdir(parents=True, exist_ok=True)
SRC.mkdir(parents=True, exist_ok=True)
inventory = []
for p in MEDIA.rglob('*'):
    if not p.is_file(): continue
    probe = json.loads(subprocess.check_output(['ffprobe','-v','error','-show_format','-show_streams','-of','json',str(p)]))
    inventory.append({'file':p.relative_to(ROOT/'public').as_posix(),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'probe':probe})
(SRC/'inventory.json').write_text(json.dumps(inventory,indent=2),encoding='utf-8')
pics=list((MEDIA/'imagens').glob('*'))
sheet=Image.new('RGB',(1200,math.ceil(len(pics)/2)*360),'#121322')
d=ImageDraw.Draw(sheet)
for i,p in enumerate(pics):
    im=Image.open(p)
    x,y=(i%2)*600,(i//2)*360
    sheet.paste(ImageOps.contain(im.convert('RGB'),(590,320)),(x,y+35))
    d.text((x+10,y+10),f'{p.name} | {im.size}',fill='white')
sheet.save(OUT/'images.jpg')
trailer=next((MEDIA/'videos-complementares').glob('*.mp4'))
for page in range(3):
    sheet=Image.new('RGB',(1600,5*250),'#121322'); d=ImageDraw.Draw(sheet)
    for j in range(20):
        t=(page*20+j)*2.75
        if t>165: break
        frame=OUT/f'trailer-{t:06.2f}.jpg'
        subprocess.run(['ffmpeg','-v','error','-ss',str(t),'-i',str(trailer),'-frames:v','1','-vf','scale=400:-1','-y',str(frame)],check=True)
        x,y=(j%4)*400,(j//4)*250
        sheet.paste(Image.open(frame),(x,y+25)); d.text((x+8,y+6),f'{t:.2f}s',fill='white')
    sheet.save(OUT/f'trailer-sheet-{page}.jpg')
print('Inventory and sheets complete',flush=True)
destination=SRC/'alignment.json'
if destination.exists(): raise SystemExit('Existing alignment preserved')
model=WhisperModel('large-v3',device='cpu',compute_type='int8',local_files_only=True)
segments,_=model.transcribe(str(MEDIA/'audio/narracao.mp3'),language='pt',word_timestamps=True,beam_size=5,vad_filter=True,initial_prompt='GTA cinco. GTA seis. Rockstar. NPCs. Los Santos. Vice City.')
result=[]
for s in segments:
    print(f'{s.start:.2f}-{s.end:.2f}: {s.text}',flush=True)
    result.append({'startMs':round(s.start*1000),'endMs':round(s.end*1000),'text':s.text,'words':[{'text':w.word,'startMs':round(w.start*1000),'endMs':round(w.end*1000),'timestampMs':round((w.start+w.end)*500),'confidence':w.probability} for w in s.words or []]})
destination.write_text(json.dumps({'method':'faster-whisper large-v3, cached CPU int8; automatic estimates','segments':result},ensure_ascii=False,indent=2),encoding='utf-8')
