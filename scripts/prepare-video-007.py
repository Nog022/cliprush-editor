import json, subprocess, wave
from pathlib import Path
import numpy as np
R=Path.cwd(); M=R/'public/videos/video-007'; S=R/'src/videos/video-007'; (M/'footage').mkdir(exist_ok=True)
selects=[('keys','Trailer 2 GTA VI.mp4',6,2.6),('brian-v2','Trailer 2 GTA VI.mp4',14,2.5),('jason','Trailer 2 GTA VI.mp4',26.8,2.5),('city','Trailer 1 GTA VI.mp4',32.3,2.1),('boat','Trailer 1 GTA VI.mp4',10.5,2),('risk-v2','Launch Trailer.mp4',52.7,1.8)]
for name,source,start,duration in selects:
 target=M/'footage'/f'{name}.mp4'
 if target.exists(): continue
 crop='crop=iw:ih*0.8:0:ih*0.1,' if source!='Trailer 1 GTA VI.mp4' else ''
 p=subprocess.run(['ffmpeg','-v','error','-i',str(M/'video-complementar'/source),'-ss',str(start),'-t',str(duration),'-an','-vf',crop+'scale=1600:-2,setsar=1','-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-n',str(target)],capture_output=True,text=True); p.check_returncode(); print(name,flush=True)
(S/'selects.json').write_text(json.dumps([{'id':n,'source':s,'in':t,'out':round(t+d,3),'file':f'footage/{n}.mp4','audio':'removed','use':'illustrative montage'} for n,s,t,d in selects],indent=2))
