from pathlib import Path
import json,subprocess,hashlib
import numpy as np
from PIL import Image,ImageDraw,ImageOps
O=Path('out/video-010/reparo-v003');export=Path('out/video-010/video-010-v003.mp4');original=Path('public/videos/video-010/audio/narracao.mp3')
probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_format','-show_streams','-of','json',str(export)]))
v=next(s for s in probe['streams'] if s['codec_type']=='video');a=next(s for s in probe['streams'] if s['codec_type']=='audio')
assert (v['width'],v['height'],v['r_frame_rate'],v['codec_name'],int(v['nb_frames']))==(1080,1920,'30/1','h264',1127)
assert abs(float(probe['format']['duration'])-37.564063)<.04
result=subprocess.run(['ffmpeg','-v','error','-i',str(export),'-f','null','NUL'],capture_output=True,text=True);assert result.returncode==0 and not result.stderr.strip(),result.stderr
black=subprocess.run(['ffmpeg','-hide_banner','-i',str(export),'-an','-vf','blackdetect=d=0.1:pix_th=0.02:pic_th=0.98','-f','null','NUL'],capture_output=True,text=True)
blacklines=[line for line in black.stderr.splitlines() if 'black_start:' in line];assert not blacklines,blacklines

def pcm(p):return np.frombuffer(subprocess.check_output(['ffmpeg','-v','error','-i',str(p),'-vn','-ac','1','-ar','16000','-f','f32le','-']),dtype=np.float32)
x,y=pcm(original),pcm(export);n=min(len(x),len(y));corr=float(np.corrcoef(x[:n],y[:n])[0,1]);assert corr>.98,corr
parts={}
for name,start,end in [('inicio',0,5),('meio',17,23),('fim',32,37.5)]:
 l=round(start*16000);r=min(round(end*16000),n);parts[name]=float(np.corrcoef(x[l:r],y[l:r])[0,1]);assert parts[name]>.98
manifest=json.loads((O/'preserved.json').read_text());count=0
for file,h in manifest.items():
 if file.replace('\\','/')=='src/Root.tsx':continue
 assert hashlib.sha256(Path(file).read_bytes()).hexdigest()==h,file
 count+=1
sheet=Image.new('RGB',(1440,900),'#182a2b');draw=ImageDraw.Draw(sheet)
for i,t in enumerate([1.3,9.5,15.5,19.8,23.7,28.5,36.9,37.53]):
 p=O/f'export-{t}.jpg';subprocess.run(['ffmpeg','-v','error','-ss',str(t),'-i',str(export),'-frames:v','1','-vf','scale=540:960','-y',str(p)],check=True)
 im=ImageOps.contain(Image.open(p),(180,850));sheet.paste(im,(i*180,35));draw.text((i*180+5,10),f'{t}s',fill='white')
sheet.save(O/'export-review.jpg')
report=dict(file=str(export),bytes=export.stat().st_size,durationSeconds=float(probe['format']['duration']),width=v['width'],height=v['height'],fps=v['r_frame_rate'],frames=v['nb_frames'],videoCodec=v['codec_name'],audioCodec=a['codec_name'],originalDuration=37.564063,narrationCorrelation=corr,sectionCorrelation=parts,completeDecode='passed',blackIntervals=blacklines,preservedFiles=count)
(O/'validation.json').write_text(json.dumps(report,indent=2));print(json.dumps(report,indent=2))
