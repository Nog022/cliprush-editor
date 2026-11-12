"""Verify every cut's first/last frame against the original and +/-1 neighbors."""
import json
import subprocess
from pathlib import Path
import numpy as np

out=Path('out/video-014')
data=json.loads((out/'extracao-v001.json').read_text(encoding='utf-8'))
results=[]
for scene in data['scenes']:
    start,end=scene['startFrame'],scene['endFrameExclusive']
    base=max(0,start//30-1)
    positions=[start-1,start,start+1,end-2,end-1,end]
    filt='select='+ '+'.join(f'eq(n\\,{f-base*30})' for f in positions)+',scale=320:180'
    raw=subprocess.check_output(['ffmpeg','-hide_banner','-loglevel','error','-ss',str(base),'-t',str((end-base*30+2)/30),'-i',data['source'],'-vf',filt,'-fps_mode','passthrough','-f','rawvideo','-pix_fmt','rgb24','pipe:1'])
    refs=np.frombuffer(raw,np.uint8).reshape((-1,180,320,3)).astype(np.float32)
    actual_raw=subprocess.check_output(['ffmpeg','-hide_banner','-loglevel','error','-i',scene['extractedFile'],'-vf',f'select=eq(n\\,0)+eq(n\\,{scene["frameCount"]-1}),scale=320:180','-fps_mode','passthrough','-f','rawvideo','-pix_fmt','rgb24','pipe:1'])
    actual=np.frombuffer(actual_raw,np.uint8).reshape((2,180,320,3)).astype(np.float32)
    first=[float(np.mean((actual[0]-r)**2)) for r in refs[:3]]
    last=[float(np.mean((actual[1]-r)**2)) for r in refs[3:]]
    assert np.argmin(first)==1,(scene['order'],'first',first)
    assert np.argmin(last)==1,(scene['order'],'last',last)
    results.append({'scene':scene['order'],'firstFrame':start,'lastFrame':end-1,'firstFrameMseNeighbors':first,'lastFrameMseNeighbors':last,'exactBoundaryBestMatch':True})
    print('Exact source boundary verified:',scene['order'],flush=True)
(out/'validacao-cortes-v001.json').write_text(json.dumps(results,indent=2),encoding='utf-8')
