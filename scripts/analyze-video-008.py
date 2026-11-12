"""Inspect provided media and transcribe locally without downloading models."""
import hashlib
import json
import subprocess
from pathlib import Path
from PIL import Image, ImageDraw, ImageOps

R = Path.cwd()
M = R / 'public/videos/video-008'
O = R / 'out/video-008'
S = R / 'src/videos/video-008'
O.mkdir(parents=True, exist_ok=True)
S.mkdir(parents=True, exist_ok=True)
if (O / 'preserved.json').exists():
    raise SystemExit('Existing analysis must be preserved.')
paths = [p for root in ['src', 'public/videos'] for p in (R/root).rglob('*')
         if p.is_file() and 'video-008' not in p.parts]
(O/'preserved.json').write_text(json.dumps([
    {'file':p.relative_to(R).as_posix(), 'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}
    for p in paths]), encoding='utf-8')
(O/'Root.before.tsx').write_bytes((R/'src/Root.tsx').read_bytes())
inventory = []
for p in M.rglob('*'):
    if p.is_file():
        probe = json.loads(subprocess.check_output(['ffprobe','-v','error','-show_format','-show_streams','-of','json',str(p)]))
        inventory.append({'file':p.relative_to(R/'public').as_posix(),
                          'sha256':hashlib.sha256(p.read_bytes()).hexdigest(), 'probe':probe})
(S/'inventory.json').write_text(json.dumps(inventory, indent=2), encoding='utf-8')
sheet = Image.new('RGB', (1200,1200), '#10131b')
d = ImageDraw.Draw(sheet)
for i,p in enumerate((M/'imagens').glob('*')):
    im = Image.open(p)
    sheet.paste(ImageOps.contain(im,(1180,350)), (10,i*400+35))
    d.text((15,i*400+8),p.name+' '+str(im.size),fill='white')
sheet.save(O/'assets.jpg')
sheet = Image.new('RGB',(1600,1080),'#10131b')
d = ImageDraw.Draw(sheet)
for i in range(16):
    t = 27.5+i*0.25
    p = O/f'trailer-{t:.2f}.jpg'
    subprocess.run(['ffmpeg','-v','error','-ss',str(t),'-i',str(M/'video-complementar/Launch Trailer.mp4'),'-frames:v','1','-vf','scale=400:225','-n',str(p)],check=True)
    x,y = (i%4)*400,(i//4)*270
    sheet.paste(Image.open(p),(x,y+30))
    d.text((x+12,y+8),f'{t:.2f}s',fill='white')
sheet.save(O/'trailer-sheet.jpg')
print('Media inspection sheets ready.',flush=True)
from faster_whisper import WhisperModel
model = WhisperModel('large-v3',device='cpu',compute_type='int8',local_files_only=True)
segments,_ = model.transcribe(str(M/'audio/narracao.mp3'),language='pt',word_timestamps=True,
    beam_size=5,vad_filter=True,initial_prompt='GTA 6. Chop. Franklin. Jason. Rocco. Rockstar. ClipRush.')
words = []
for s in segments:
    print(f'{s.start:.2f}-{s.end:.2f}: {s.text}',flush=True)
    words.extend([{'text':w.word,'startMs':round(w.start*1000),'endMs':round(w.end*1000),
                   'timestampMs':round((w.start+w.end)*500),'confidence':w.probability} for w in s.words or []])
(S/'transcript.raw.json').write_text(json.dumps(words,ensure_ascii=False,indent=2),encoding='utf-8')
