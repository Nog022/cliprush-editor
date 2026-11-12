"""Validate the exported streams, full decode, and original narration alignment."""
import json
import subprocess
import sys
from pathlib import Path
import numpy as np

O = Path('out/video-010')
review = Path(sys.argv[1]) if len(sys.argv)>1 else O/'review-v003'
export = Path(json.loads((review/'output.json').read_text())['output'])
original = Path('public/videos/video-010/audio/narracao.mp3')
probe = json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(export)]))
video = next(s for s in probe['streams'] if s['codec_type']=='video')
audio = next(s for s in probe['streams'] if s['codec_type']=='audio')
assert (video['width'],video['height'],video['r_frame_rate'],video['codec_name']) == (1080,1920,'30/1','h264')
assert int(video['nb_frames']) == 1189
assert abs(float(probe['format']['duration'])-39.627755) < 1/30+0.01
decoded = subprocess.run(['ffmpeg','-v','error','-i',str(export),'-f','null','NUL'],capture_output=True,text=True)
assert decoded.returncode == 0 and not decoded.stderr.strip(), decoded.stderr

def pcm(p):
    return np.frombuffer(subprocess.check_output(['ffmpeg','-v','error','-i',str(p),'-vn','-ac','1','-ar','16000','-f','f32le','-']),dtype=np.float32)
a,b=pcm(original),pcm(export)
length=min(len(a),len(b))
correlation=float(np.corrcoef(a[:length],b[:length])[0,1])
assert correlation>0.99, f'Narration mismatch: {correlation}'
silence = subprocess.run(['ffmpeg','-hide_banner','-i',str(export),'-an','-vf','blackdetect=d=0.10:pix_th=0.02:pic_th=0.98','-f','null','NUL'],capture_output=True,text=True)
black = [line for line in silence.stderr.splitlines() if 'black_start:' in line]
assert not black, black
report = {'file':str(export), 'bytes':export.stat().st_size,'durationSeconds':float(probe['format']['duration']),'width':video['width'],'height':video['height'],'fps':video['r_frame_rate'],'frames':int(video['nb_frames']),'videoCodec':video['codec_name'],'audioCodec':audio['codec_name'],'audioDurationSeconds':float(audio['duration']),'originalNarrationSeconds':len(a)/16000,'narrationCorrelation':correlation,'completeDecode':'passed','blackIntervals':black}
(O/f'validation-{export.stem.split("-")[-1]}.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps(report,indent=2))
