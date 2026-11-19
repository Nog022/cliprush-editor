"""Validate the requested bounded template export against its source audio."""
import json
import pathlib
import subprocess
import sys
import numpy as np

out = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else 'out/template-webcam-9x16')
render = json.loads((out / 'render-validation.json').read_text())
props = render['sourceProps']
source = pathlib.Path('public') / props['src']
dest = out / 'preview.mp4'
probe = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries',
    'format=duration,size:stream=codec_type,codec_name,profile,width,height,pix_fmt,avg_frame_rate,nb_frames,start_time,duration,sample_rate,channels',
    '-of', 'json', str(dest)]))
video = next(s for s in probe['streams'] if s['codec_type'] == 'video')
audio = [s for s in probe['streams'] if s['codec_type'] == 'audio']
assert len(audio) == 1 and audio[0]['codec_name'] == 'aac'
assert video['codec_name'] == 'h264' and video['pix_fmt'] in ('yuv420p', 'yuvj420p')
assert (video['width'], video['height']) == (1080, 1920)
assert int(video['nb_frames']) == render['composition']['durationInFrames']

def pcm(file, start=0):
    return np.frombuffer(subprocess.check_output(['ffmpeg', '-v', 'error', '-nostdin', '-ss', str(start),
        '-i', str(file), '-t', str(props['durationSeconds']), '-vn', '-ac', '1', '-ar', '16000', '-f', 'f32le', 'pipe:1']), dtype=np.float32)

x = pcm(source, props['startSeconds'])
y = pcm(dest)
alignment = []
for second in [1, 16, 30]:
    # Interior two-second windows, +/- 100ms; FFT correlation avoids expensive loops.
    start = second * 16000
    a = x[start:start+32000].astype(np.float64)
    b = y[start-1600:start+32000+1600].astype(np.float64)
    n = 1 << (len(a) + len(b) - 1).bit_length()
    corr = np.fft.irfft(np.fft.rfft(b, n) * np.fft.rfft(a[::-1], n), n)
    values = corr[len(a)-1:len(b)]
    k = int(np.argmax(values))
    matched = b[k:k+len(a)]
    score = float(np.dot(a, matched) / (np.linalg.norm(a)*np.linalg.norm(matched)))
    alignment.append({'atSeconds':second, 'offsetMs':(k-1600)/16, 'correlation':score})
assert all(abs(a['offsetMs']) <= 33.34 and a['correlation'] > .98 for a in alignment), alignment
cache = json.loads(pathlib.Path('out/fase2-corrigida/analysis.json').read_text())
stamp = source.stat()
unchanged = stamp.st_size == cache['sourceStamp']['size'] and stamp.st_mtime_ns == cache['sourceStamp']['mtime_ns']
assert unchanged
subprocess.run(['ffmpeg', '-v', 'error', '-nostdin', '-n', '-i', str(dest), '-vf',
    "select='eq(n,0)+eq(n,1050)+eq(n,2040)',scale=432:768,tile=3x1", '-frames:v', '1', str(out/'contact-final.png')], check=True)
result = {'probe':probe, 'audioAlignment':alignment, 'sourceUnchanged':unchanged,
    'fullDecode':render['validationOnly'], 'sha256':render['verified']['sha256']}
(out/'validation.json').write_text(json.dumps(result, indent=2), encoding='utf-8')
print(json.dumps(result, indent=2))
