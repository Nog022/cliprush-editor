"""Probe/decode final MP4 and compare narration timing to the untouched source."""
import json, subprocess, re, hashlib
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'out/video-006'
video=ROOT/'out/ClipRushVideo006.mp4'
probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_format','-show_streams','-of','json',str(video)]))
v=next(s for s in probe['streams'] if s['codec_type']=='video')
a=next(s for s in probe['streams'] if s['codec_type']=='audio')
assert (v['width'],v['height'],v['r_frame_rate'],int(v['nb_frames']))==(1080,1920,'30/1',1305)
assert v['codec_name']=='h264' and a['codec_name']=='aac'
result=subprocess.run(['ffmpeg','-hide_banner','-i',str(video),'-vf','scale=270:480,blackdetect=d=0.08:pix_th=0.03:pic_th=0.98,freezedetect=n=-55dB:d=0.4','-af','volumedetect','-f','null','NUL'],capture_output=True,text=True)
(OUT/'final-decode.txt').write_text(result.stderr,encoding='utf-8');result.check_returncode()
black=re.findall(r'black_start:([\d.]+) black_end:([\d.]+) black_duration:([\d.]+)',result.stderr)
freeze=re.findall(r'freeze_start: ([\d.]+)',result.stderr)
def pcm(p):
    return np.frombuffer(subprocess.check_output(['ffmpeg','-v','error','-i',str(p),'-vn','-ar','16000','-ac','1','-f','f32le','pipe:1']),dtype='<f4')
source=pcm(ROOT/'public/videos/video-006/audio/narracao.mp3');final=pcm(video)
n=min(len(source),len(final));correlation=float(np.corrcoef(source[:n],final[:n])[0,1])
assert correlation>.95,correlation
times=[.5,8.8,10.3,16.9,21.8,25.6,30,34.8,36.8,38.5,40.4,42.85,43.45]
sheet=Image.new('RGB',(5*270,3*510),'#101020');draw=ImageDraw.Draw(sheet)
for i,t in enumerate(times):
    p=OUT/f'final-{t:.2f}.jpg'
    subprocess.run(['ffmpeg','-v','error','-ss',str(t),'-i',str(video),'-frames:v','1','-vf','scale=270:480','-y',str(p)],check=True)
    x,y=(i%5)*270,(i//5)*510
    sheet.paste(Image.open(p),(x,y+25));draw.text((x+12,y+6),f'{t:.2f}s',fill='white')
sheet.save(OUT/'final-contact.jpg')
originals=json.loads((OUT/'preserved.json').read_text())
assert all(hashlib.sha256((ROOT/f['file']).read_bytes()).hexdigest()==f['sha256'] for f in originals)
report={'file':str(video),'bytes':video.stat().st_size,'probe':probe,'fullDecodeExitCode':result.returncode,'blackIntervals':black,'freezeStarts':freeze,'meanVolume':re.findall(r'mean_volume: ([^\r\n]+)',result.stderr),'peakVolume':re.findall(r'max_volume: ([^\r\n]+)',result.stderr),'narrationCorrelationAtZeroOffset':correlation,'sampledSeconds':times,'preservedPriorFiles':len(originals),'listeningLimit':'Technical audio checks; no human listening session claimed.'}
(OUT/'final-validation.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps({k:v for k,v in report.items() if k!='probe'},indent=2))
assert not black,black
assert not freeze,freeze
