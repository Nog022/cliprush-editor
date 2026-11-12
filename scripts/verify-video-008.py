"""Validate exported media and report real trailer/still continuity."""
import argparse
import hashlib
import json
import subprocess
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageOps

p = argparse.ArgumentParser()
p.add_argument('video', type=Path)
args = p.parse_args()
O = Path('out/video-008')
assert args.video.is_file() and args.video.stat().st_size > 100000
probe = json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(args.video)]))
v = next(s for s in probe['streams'] if s['codec_type']=='video')
a = next(s for s in probe['streams'] if s['codec_type']=='audio')
assert (v['width'],v['height'],v['r_frame_rate'],v['nb_frames'])==(1080,1920,'30/1','890')
assert v['codec_name']=='h264' and a['codec_name']=='aac'
assert float(a['duration']) >= 29.648938-.03
decoded = subprocess.run(['ffmpeg','-v','error','-i',str(args.video),'-f','null','-'],capture_output=True,text=True)
assert decoded.returncode==0 and not decoded.stderr, decoded.stderr
analysis = subprocess.run(['ffmpeg','-hide_banner','-i',str(args.video),'-vf','blackdetect=d=0.1:pix_th=0.02','-af','volumedetect','-f','null','-'],capture_output=True,text=True)
(O/'integrity-analysis.txt').write_text(analysis.stderr,encoding='utf-8')
frames = sorted(O.glob('frame-*.jpg'))
sheet = Image.new('RGB',(1440,((len(frames)+5)//6)*450),'#181820')
d = ImageDraw.Draw(sheet)
for i,frame in enumerate(frames):
    x,y=i%6*240,i//6*450
    sheet.paste(ImageOps.contain(Image.open(frame),(235,418)),(x,y+25))
    d.text((x+8,y+4),frame.stem,fill='white')
sheet.save(O/'review-sheet.jpg')
# Identical source frame; compare the media region, excluding editorial titles.
before = np.array(Image.open(O/'frame-0267.jpg').crop((0,249,540,550))).astype(float)
after = np.array(Image.open(O/'frame-0268.jpg').crop((0,249,540,550))).astype(float)
continuity = float(np.abs(before-after).mean())
report = {'file':str(args.video),'bytes':args.video.stat().st_size,
          'sha256':hashlib.sha256(args.video.read_bytes()).hexdigest(),
          'probe':probe,'fullDecode':'passed','transitionMeanAbsolutePixelDifference':continuity,
          'blackIntervals':[s for s in analysis.stderr.splitlines() if 'black_start' in s],
          'volume':[s for s in analysis.stderr.splitlines() if 'mean_volume' in s or 'max_volume' in s],
          'status':'Review export only; dog frame identification remains unresolved.'}
(O/'integrity-report.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps({k:v for k,v in report.items() if k!='probe'},indent=2))
