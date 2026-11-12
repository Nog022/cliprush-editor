from pathlib import Path
import subprocess,json,hashlib
import numpy as np
from PIL import Image,ImageDraw,ImageOps
O=Path('out/video-010/reparo-v004');current=Path('out/video-010/video-010-v004.mp4');previous=Path('out/video-010/video-010-v003.mp4')
probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_format','-show_streams','-of','json',str(current)]));v=next(s for s in probe['streams'] if s['codec_type']=='video');a=next(s for s in probe['streams'] if s['codec_type']=='audio')
assert (v['width'],v['height'],v['r_frame_rate'],v['codec_name'],int(v['nb_frames']))==(1080,1920,'30/1','h264',1127)
result=subprocess.run(['ffmpeg','-v','error','-i',str(current),'-f','null','NUL'],capture_output=True,text=True);assert result.returncode==0 and not result.stderr.strip(),result.stderr
pts=json.loads(subprocess.check_output(['ffprobe','-v','error','-select_streams','v:0','-show_frames','-show_entries','frame=best_effort_timestamp_time','-of','json',str(current)]))
steps=np.diff([float(f['best_effort_timestamp_time']) for f in pts['frames']]);assert np.all(np.abs(steps-1/30)<.000002)

def pcm(p):return np.frombuffer(subprocess.check_output(['ffmpeg','-v','error','-i',str(p),'-vn','-ac','1','-ar','16000','-f','f32le','-']),dtype=np.float32)
x,y=pcm(previous),pcm(current);assert len(x)==len(y);audio_corr=float(np.corrcoef(x,y)[0,1]);assert audio_corr>.9999

def cadence(start,frames,crop):
 vf=f'trim=start_frame={start}:end_frame={start+frames},setpts=PTS-STARTPTS,crop={crop},scale=240:120,format=gray'
 raw=subprocess.check_output(['ffmpeg','-v','error','-i',str(current),'-vf',vf,'-an','-fps_mode','passthrough','-f','rawvideo','-'])
 values=np.frombuffer(raw,dtype=np.uint8).reshape(-1,120,240).astype(np.float32);assert len(values)==frames
 delta=np.mean(np.abs(np.diff(values,axis=0)),axis=(1,2));run=best=0
 for d in delta:
  run=run+1 if d<.2 else 0;best=max(run,best)
 return dict(frames=len(values),nearIdenticalTransitions=int((delta<.2).sum()),longestHoldFrames=best+1,meanDifference=round(float(delta.mean()),3))
windows=[('gancho-GTA',20,80,'820:280:100:1000'),('flamingos',691,48,'820:500:100:680'),('costa',1011,69,'820:500:100:680'),('final-RDR2',1080,47,'820:250:100:590'),('gancho-RDR2',20,86,'820:250:100:590'),('natureza-RDR2',106,105,'820:500:100:680'),('final-GTA',1080,47,'820:280:100:1000')]
after={name:cadence(start,n,crop) for name,start,n,crop in windows}
for name,metrics in after.items():assert metrics['longestHoldFrames']<=2,(name,metrics)
before=json.loads((O/'cadence-before.json').read_text())
black=subprocess.run(['ffmpeg','-hide_banner','-i',str(current),'-an','-vf','blackdetect=d=0.1:pix_th=0.02:pic_th=0.98','-f','null','NUL'],capture_output=True,text=True)
blacklines=[line for line in black.stderr.splitlines() if 'black_start:' in line];assert not blacklines,blacklines
manifest=json.loads((O/'preserved.json').read_text());count=0
for file,checksum in manifest.items():
 if file.replace('\\','/')=='src/Root.tsx':continue
 assert hashlib.sha256(Path(file).read_bytes()).hexdigest()==checksum,file
 count+=1
root=Path('src/Root.tsx').read_text(encoding='utf-8').replace('import { ClipRushVideo010V004 } from "./videos/video-010/ClipRushVideo010V004";\n','').replace('      <Composition id="ClipRushVideo010V004" component={ClipRushVideo010V004} durationInFrames={1127} fps={30} width={1080} height={1920} />\n','')
assert root==(O/'Root.before.tsx').read_text(encoding='utf-8')
frames=[0,41,42,68,69,105,210,691,711,712,738,1011,1058,1059,1079,1080,1126];sheet=Image.new('RGB',(1080,406*((len(frames)+4)//5)),'#183333');draw=ImageDraw.Draw(sheet)
for i,f in enumerate(frames):
 p=O/f'export-frame-{f}.jpg'
 if not p.exists():subprocess.run(['ffmpeg','-v','error','-i',str(current),'-vf',f'select=eq(n\\,{f}),scale=540:960','-frames:v','1','-n',str(p)],check=True)
 image=ImageOps.contain(Image.open(p),(216,384));col=i%5*216;row=i//5*406;sheet.paste(image,(col,row+22));draw.text((col+5,row+3),f'{f} / {f/30:.3f}s',fill='white')
sheet.save(O/'export-check.jpg')
report=dict(file=str(current),durationSeconds=float(probe['format']['duration']),dimensions=[1080,1920],fps='30/1',frames=1127,videoCodec=v['codec_name'],audioCodec=a['codec_name'],frameIntervalMin=float(steps.min()),frameIntervalMax=float(steps.max()),audioCorrelationWithV003=audio_corr,cadenceBefore=before,cadenceAfter=after,completeDecode='passed',blackIntervals=blacklines,preservedFiles=count,previousRegistrationsPreserved=True)
(O/'validation.json').write_text(json.dumps(report,indent=2),encoding='utf-8');print(json.dumps(report,indent=2))
