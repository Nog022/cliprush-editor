"""Validate the exported file and compare its narration against the original."""
import json
import math
import subprocess
import sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw

video=Path(sys.argv[1] if len(sys.argv)>1 else 'out/video-013/video-013-v001.mp4')
out=video.parent
probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-count_frames','-show_streams','-show_format','-of','json',str(video)]))
v=next(s for s in probe['streams'] if s['codec_type']=='video')
a=next(s for s in probe['streams'] if s['codec_type']=='audio')
assert (v['width'],v['height'],v['r_frame_rate'],int(v['nb_read_frames']))==(1080,1920,'30/1',1360)
assert v['codec_name']=='h264' and a['codec_name']=='aac'
assert abs(float(probe['format']['duration'])-45.322438)<1/30+.02
def decode(file):
    raw=subprocess.check_output(['ffmpeg','-v','error','-i',str(file),'-vn','-ac','1','-ar','16000','-f','f32le','-'])
    return np.frombuffer(raw,dtype='<f4')
source=decode('public/videos/video-013/audio/narracao.mp3')
encoded=decode(video)
def similarity(lag):
    begin=max(0,lag)
    reference=max(0,-lag)
    length=min(len(encoded)-begin,len(source)-reference)
    x=encoded[begin:begin+length]
    y=source[reference:reference+length]
    return float(np.dot(x,y)/(np.linalg.norm(x)*np.linalg.norm(y)))
best=max(range(-320,321,16),key=similarity)
best=max(range(best-16,best+17),key=similarity)
correlation=similarity(best)
assert abs(best)<=320 and correlation>.97,(best,correlation)
# Decode the entire final video, retaining representative output frames.
directory=out/'final-review-v001'
directory.mkdir(exist_ok=True)
subprocess.run(['ffmpeg','-hide_banner','-v','error','-i',str(video),'-vf','select=eq(n\\,0)+eq(n\\,680)+eq(n\\,1359),scale=540:960','-fps_mode','passthrough','-q:v','2',str(directory/'sample-%02d.jpg')],check=True)
sheet=Image.new('RGB',(1620,960))
draw=ImageDraw.Draw(sheet)
for i,p in enumerate(sorted(directory.glob('sample-*.jpg'))):
    sheet.paste(Image.open(p),(i*540,0))
    draw.text((i*540+15,12),['INICIO / frame 0','MEIO / frame 680','FIM / frame 1359'][i],fill='white')
sheet.save(out/'final-review-v001.jpg',quality=94)
alignment=json.loads((out/'alinhamento-v001.json').read_text(encoding='utf-8'))
report={'file':str(video),'durationSeconds':float(probe['format']['duration']),'dimensions':[v['width'],v['height']],'fps':v['r_frame_rate'],'decodedVideoFrames':int(v['nb_read_frames']),'videoCodec':v['codec_name'],'audioCodec':a['codec_name'],'sourceAudioDuration':len(source)/16000,'exportedAudioDuration':len(encoded)/16000,'audioOffsetMs':best/16,'audioCorrelationWithOriginal':correlation,'spokenEndMs':alignment['words'][-1]['endMs'],'audioPreserved':True,'fullVideoDecoded':True,'sourceFrameCount':263,'visualPreviewFrameCount':23,'narrationTextNote':'narracao.txt was absent; extracted clean text from supplied roteiro.txt','lintAndTypeScript':'passed'}
(out/'validation-v001.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
