"""Final delivery checks; completeProduction performs the full MP4 decode separately."""
import json
import subprocess
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parents[1]
output = root / 'deliveries/video-025-clima-final-20261117-v1.mp4'
review = root / 'out/video-025'
source = root / 'public/videos/video-025/audio/narracao.mp3'
metadata = json.loads(subprocess.check_output([
    'ffprobe', '-v', 'error', '-show_entries',
    'format=duration,size:stream=codec_type,codec_name,width,height,avg_frame_rate,nb_frames,duration',
    '-of', 'json', str(output),
]))
video = next(s for s in metadata['streams'] if s['codec_type'] == 'video')
audio = next(s for s in metadata['streams'] if s['codec_type'] == 'audio')
assert (video['width'], video['height']) == (1080, 1920)
assert video['avg_frame_rate'] == '30/1'
assert int(video['nb_frames']) == 1480
assert abs(float(metadata['format']['duration']) - 1480 / 30) < .15
assert video['codec_name'] == 'h264' and audio['codec_name'] == 'aac'


def samples(file):
    return np.frombuffer(subprocess.check_output([
        'ffmpeg', '-v', 'error', '-i', str(file), '-vn', '-ac', '1',
        '-ar', '8000', '-f', 'f32le', 'pipe:1',
    ]), dtype='<f4')


original, delivered = samples(source), samples(output)
assert len(delivered) >= len(original) - 320, 'Narration was truncated'
length = min(len(original), len(delivered))
correlation = float(np.corrcoef(original[:length], delivered[:length])[0, 1])
assert correlation > .985, f'Narration mismatch: {correlation}'

frames = [42, 500, 790, 1065, 1440]
sheet = Image.new('RGB', (1800, 680), '#101923')
draw = ImageDraw.Draw(sheet)
for index, frame in enumerate(frames):
    path = review / f'mp4-frame-{frame}.jpg'
    subprocess.run([
        'ffmpeg', '-v', 'error', '-ss', str(frame / 30), '-i', str(output),
        '-frames:v', '1', '-vf', 'scale=360:640', '-q:v', '2', '-y', str(path),
    ], check=True)
    sheet.paste(Image.open(path), (index * 360, 0))
    draw.text((index * 360 + 12, 650), f'{frame / 30:.2f}s', fill='white')
sheet.save(review / 'final-mp4-review.jpg')
report = {'file': str(output.relative_to(root)), 'metadata': metadata,
          'narrationCorrelation': correlation, 'originalAudioSeconds': len(original) / 8000,
          'deliveredAudioSeconds': len(delivered) / 8000, 'mp4ReviewFrames': frames}
(review / 'delivery-validation.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
print(json.dumps(report, indent=2))
