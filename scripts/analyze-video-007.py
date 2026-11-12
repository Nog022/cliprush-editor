import json, subprocess, math, hashlib
from pathlib import Path
from PIL import Image,ImageDraw,ImageOps
R=Path.cwd(); M=R/'public/videos/video-007'; O=R/'out/video-007'; S=R/'src/videos/video-007'
if (O/'preserved.json').exists() or (S/'captions.json').exists():
 raise SystemExit('Analysis already exists; preserve the baseline and transcript. Choose a new version before running again.')
paths=[p for root in ['src/videos','public/videos'] for p in (R/root).rglob('*') if p.is_file() and 'video-007' not in p.parts]+[R/'src/Composition.tsx']
(O/'preserved.json').write_text(json.dumps([{'file':p.relative_to(R).as_posix(),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in paths]))
inv=[]
for p in M.rglob('*'):
 if p.is_file(): inv.append({'file':p.relative_to(R/'public').as_posix(),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'probe':json.loads(subprocess.check_output(['ffprobe','-v','error','-show_format','-show_streams','-of','json',str(p)]))})
(S/'inventory.json').write_text(json.dumps(inv,indent=2))
pics=list((M/'imagens').glob('*')); sheet=Image.new('RGB',(1200,1800),'#171722'); d=ImageDraw.Draw(sheet)
for i,p in enumerate(pics):
 x,y=i%2*600,i//2*360; im=Image.open(p); sheet.paste(ImageOps.contain(im,(590,320)),(x,y+30)); d.text((x+10,y+8),p.name+' '+str(im.size),fill='white')
sheet.save(O/'images.jpg')
for p in (M/'video-complementar').glob('*.mp4'):
 duration=float(next(a for a in inv if a['file'].endswith(p.name))['probe']['format']['duration']); sheet=Image.new('RGB',(1600,1500),'#171722'); d=ImageDraw.Draw(sheet)
 for i in range(24):
  t=round(i*duration/24,2); f=O/'temp.jpg'; subprocess.run(['ffmpeg','-v','error','-ss',str(t),'-i',str(p),'-frames:v','1','-vf','scale=400:225','-y',str(f)],check=True); x,y=i%4*400,i//4*250; sheet.paste(Image.open(f),(x,y+25)); d.text((x+8,y+5),str(t)+'s',fill='white')
 sheet.save(O/(p.stem+'-sheet.jpg'))
print('Sheets ready',flush=True)
from faster_whisper import WhisperModel
model=WhisperModel('large-v3',device='cpu',compute_type='int8',local_files_only=True)
segments,_=model.transcribe(str(M/'audio/narracao.mp3'),language='pt',word_timestamps=True,beam_size=5,vad_filter=True,initial_prompt='Jason. Brian Heder. Vice City. ClipRush. Guarda Costeira.')
result=[]
for s in segments:
 print(f'{s.start:.2f}-{s.end:.2f}: {s.text}',flush=True)
 result.extend([{'text':w.word,'startMs':round(w.start*1000),'endMs':round(w.end*1000),'timestampMs':round((w.start+w.end)*500),'confidence':w.probability} for w in s.words or []])
(S/'captions.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
