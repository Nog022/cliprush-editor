"""Verify the exported file, including voice timing, metadata and decoded frames."""
import json
import re
import subprocess
from pathlib import Path

import numpy as np
from scipy.signal import correlate, correlation_lags
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
VIDEO = ROOT / 'out/video-005/video-005-v001.mp4'
OUT = ROOT / 'out/video-005/verify-v001'
OUT.mkdir(exist_ok=False)
probe = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', str(VIDEO)]))
(OUT / 'ffprobe.json').write_text(json.dumps(probe, indent=2), encoding='utf-8')
v = next(x for x in probe['streams'] if x['codec_type'] == 'video')
a = next(x for x in probe['streams'] if x['codec_type'] == 'audio')
assert (v['width'], v['height'], v['r_frame_rate'], int(v['nb_frames'])) == (1080, 1920, '30/1', 1171)
assert v['codec_name'] == 'h264' and a['codec_name'] == 'aac'
assert abs(float(v['duration']) - 1171 / 30) < .001
scan = subprocess.run(['ffmpeg', '-hide_banner', '-i', str(VIDEO), '-vf', 'scale=270:480,blackdetect=d=0.1:pix_th=0.03:pic_th=0.98,freezedetect=n=-65dB:d=1', '-af', 'ebur128=peak=true', '-f', 'null', 'NUL'], capture_output=True, text=True, check=True).stderr
(OUT / 'decode-analysis.txt').write_text(scan, encoding='utf-8')
assert 'black_start:' not in scan, 'Review black-frame interval'
assert 'freeze_start:' not in scan, 'Review frozen interval'
frames = [0, 360, 700, 975, 1170]
subprocess.run(['ffmpeg', '-v', 'error', '-i', str(VIDEO), '-vf', "select='" + '+'.join(f'eq(n,{n})' for n in frames) + "',scale=432:768", '-fps_mode', 'vfr', '-q:v', '2', str(OUT / 'decoded-%02d.jpg')], check=True)
sheet = Image.new('RGB', (5*432, 800), '#080a12')
draw = ImageDraw.Draw(sheet)
for i, f in enumerate(sorted(OUT.glob('decoded-*.jpg'))):
    sheet.paste(Image.open(f), (i*432, 0))
    draw.text((i*432+12, 780), f'Frame {frames[i]} / 1170', fill='white')
sheet.save(OUT / 'decoded-contact.jpg')

def pcm(file):
    return np.frombuffer(subprocess.check_output(['ffmpeg', '-v', 'error', '-i', str(file), '-vn', '-ac', '1', '-ar', '22050', '-f', 'f32le', 'pipe:1']), dtype='<f4')

voice = pcm(ROOT / 'public/videos/video-005/audio/narracao.mp3')
mixed = pcm(VIDEO)
cor = correlate(mixed, voice, mode='full', method='fft')
lags = correlation_lags(len(mixed), len(voice), mode='full')
near = np.abs(lags) <= 2205
lag = int(lags[near][np.argmax(cor[near])])
assert abs(lag) / 22050 < .034, f'Voice shifted by {lag/22050}s'
assert len(mixed) >= len(voice), 'Export ends before narration'
start_v, start_m = max(0, -lag), max(0, lag)
n = min(len(voice)-start_v, len(mixed)-start_m)
matched_voice, matched_mix = voice[start_v:start_v+n], mixed[start_m:start_m+n]
similarity = float(np.corrcoef(matched_voice, matched_mix)[0, 1])
tail = float(np.corrcoef(matched_voice[-22050*4:], matched_mix[-22050*4:])[0, 1])
assert similarity > .95 and tail > .95, 'Review voice integrity'
report = {
    'file': str(VIDEO), 'bytes': VIDEO.stat().st_size,
    'frames': int(v['nb_frames']), 'duration': float(v['duration']),
    'resolution': [v['width'], v['height']], 'fps': v['r_frame_rate'],
    'videoCodec': v['codec_name'], 'audioCodec': a['codec_name'],
    'accidentalBlackIntervals': [], 'freezeIntervalsOverOneSecond': [],
    'voiceLagSeconds': lag/22050, 'voiceCorrelation': similarity, 'lastFourSecondsCorrelation': tail,
    'loudnessSummary': scan[scan.rfind('Summary:'):],
    'framesInspected': frames,
}
(OUT / 'verification.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
print(json.dumps(report, indent=2))
