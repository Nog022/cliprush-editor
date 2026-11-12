from pathlib import Path
import subprocess,json,hashlib,numpy as np
from PIL import Image,ImageDraw
O=Path('out/video-010/reparo-v004');O.mkdir(exist_ok=False)
paths=list(Path('public/videos/video-010').rglob('*'))+list(Path('src/videos/video-010').glob('*'))+list(Path('out/video-010').glob('*.mp4'))+[Path('src/Root.tsx')]
(O/'preserved.json').write_text(json.dumps({str(p):hashlib.sha256(p.read_bytes()).hexdigest() for p in paths if p.is_file()},indent=2))
Path(O/'Root.before.tsx').write_bytes(Path('src/Root.tsx').read_bytes())
def cadence(start,frames,crop):
 vf=f'trim=start_frame={start}:end_frame={start+frames},setpts=PTS-STARTPTS,crop={crop},scale=240:120,format=gray'
 raw=subprocess.check_output(['ffmpeg','-v','error','-i','out/video-010/video-010-v003.mp4','-vf',vf,'-an','-fps_mode','passthrough','-f','rawvideo','-'])
 a=np.frombuffer(raw,dtype=np.uint8).reshape(-1,120,240).astype(np.float32);d=np.mean(np.abs(np.diff(a,axis=0)),axis=(1,2));run=best=0
 for value in d:
  run=run+1 if value<.2 else 0;best=max(run,best)
 return dict(frames=len(a),nearIdenticalTransitions=int((d<.2).sum()),longestHoldFrames=best+1,meanDifference=round(float(d.mean()),3))
report={}
for name,start,n,crop in [('gancho-GTA',20,80,'820:280:100:1000'),('flamingos',691,48,'820:500:100:680'),('costa',1011,69,'820:500:100:680'),('final-RDR2',1080,47,'820:250:100:590')]:report[name]=cadence(start,n,crop)
(O/'cadence-before.json').write_text(json.dumps(report,indent=2));print(json.dumps(report,indent=2),flush=True)
checks=[(2,t) for t in [6,6.25,6.5,6.75,7,7.5,8,8.25]]+[(1,t) for t in [21.3,21.5,21.7,21.9]]
s=Image.new('RGB',(1280,630),'#142525');d=ImageDraw.Draw(s)
for i,(tr,t) in enumerate(checks):
 p=O/f'trailer-{tr}-{t}.jpg';subprocess.run(['ffmpeg','-v','error','-ss',str(t),'-i',f'public/videos/video-010/videos-complementar/Trailer {tr} GTA VI.mp4','-frames:v','1','-vf','scale=320:180','-n',str(p)],check=True);x=i%4*320;y=i//4*210;s.paste(Image.open(p),(x,y+25));d.text((x+5,y+4),f'T{tr} {t}s',fill='white')
s.save(O/'source-boundaries.jpg')
