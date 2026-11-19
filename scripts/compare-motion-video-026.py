"""Compare precisely matching output frames before/after decoder correction."""
import json, subprocess
from pathlib import Path
import numpy as np

def frames(file, start=0, duration=2):
    data=subprocess.check_output(['ffmpeg','-v','error','-ss',str(start),'-i',str(file),'-t',str(duration),'-an','-vf','crop=1080:850:0:440,scale=240:160,format=gray','-f','rawvideo','-'])
    return np.frombuffer(data,dtype=np.uint8).reshape(-1,160,240).astype(np.float32)

results={}
for name,start in [('map',13),('animals-fast',25.5),('animals-normal',33)]:
    old=frames('deliveries/video-026-final-20261118-v1.mp4',start)
    new=frames(f'out/video-026/motion-{name}-v2.mp4')
    n=min(len(old),len(new))
    delta=np.mean(np.abs(old[:n]-new[:n]),axis=(1,2))
    results[name]={'frames':n,'meanFrameDifference':float(delta.mean()),'maxFrameDifference':float(delta.max()),'changedFramesAbove1':int((delta>1).sum())}
Path('out/video-026/motion-comparison.json').write_text(json.dumps(results,indent=2))
print(json.dumps(results))
