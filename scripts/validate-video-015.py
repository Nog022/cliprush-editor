"""Validate actual export, approved audio, captions and preservation baselines."""
import hashlib
import json
import re
import subprocess
from pathlib import Path
import numpy as np
from PIL import ImageFont

root = Path(__file__).resolve().parents[1]
out = root / 'out/video-015'
prod = root / 'public/videos/video-015'
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
baseline = json.loads((out/'preservacao-v001.json').read_text(encoding='utf-8'))
modified_previous = [p for p, digest in baseline.items() if not (root/p).exists() or sha(root/p) != digest]
assert not modified_previous, modified_previous
before = (out/'Root-antes-v001.tsx').read_text(encoding='utf-8')
after = (root/'src/Root.tsx').read_text(encoding='utf-8')
after = after.replace('import { ClipRush015 } from "./videos/video-015/ClipRush015";\n', '', 1)
after = after.replace('      <Composition id="ClipRush015" component={ClipRush015} durationInFrames={1192} fps={30} width={1080} height={1920} />\n', '', 1)
assert after == before, 'Root changed beyond the new import and composition'
normalize = lambda s: re.findall(r'\w+', s.casefold())
approved = (prod/'roteiro/narracao.txt').read_text(encoding='utf-8')
captions = json.loads((root/'src/videos/video-015/captions.json').read_text(encoding='utf-8'))
assert normalize(' '.join(c['text'] for c in captions)) == normalize(approved)
assert all(2 <= len(c['text'].split()) <= 6 for c in captions)
assert all(a['endMs'] <= b['startMs'] for a,b in zip(captions,captions[1:]))
font = ImageFont.truetype(str(prod/'fonts/Arial-Bold.ttf'), 57)
max_lines = 0
for c in captions:
    lines, current = 1, ''
    for word in c['text'].split():
        trial = (current+' '+word).strip()
        if current and font.getlength(trial) > 832:
            lines += 1
            current = word
        else:
            current = trial
    max_lines = max(max_lines, lines)
assert max_lines <= 2
audit = json.loads((out/'fontes-e-tempos-v001.json').read_text(encoding='utf-8'))
assert sha(prod/'audio/narracao.mp3') == audit['audioSha256']
clips = json.loads((out/'recortes-v001.json').read_text(encoding='utf-8'))
for a in clips:
    for b in clips:
        if a['name'] != b['name']:
            assert a['sourceOutFrameExclusive'] <= b['sourceInFrame'] or b['sourceOutFrameExclusive'] <= a['sourceInFrame'], (a['name'],b['name'])
report = {'preservedPreviousFiles': len(baseline), 'previousFilesChanged': modified_previous, 'rootChange': 'New ClipRush015 import and registration only', 'audioOriginalSha256': audit['audioSha256'], 'captionPages': len(captions), 'captionTextEqualsApproved': True, 'captionWordsPerPage': [min(len(c['text'].split()) for c in captions), max(len(c['text'].split()) for c in captions)], 'maxCaptionLines': max_lines, 'brollIntervalsDistinct': True}
export = out/'video-015-v003.mp4'
if export.exists():
    probe = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration,size:stream=codec_name,codec_type,width,height,r_frame_rate,nb_frames,duration,sample_rate,channels', '-of', 'json', str(export)], text=True))
    v = next(s for s in probe['streams'] if s['codec_type'] == 'video')
    a = next(s for s in probe['streams'] if s['codec_type'] == 'audio')
    assert (v['width'],v['height'],v['r_frame_rate'],int(v['nb_frames'])) == (1080,1920,'30/1',1192)
    assert a['codec_name'] == 'aac' and float(a['duration']) >= 39.706-0.03
    def pcm(file):
        return np.frombuffer(subprocess.check_output(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-i', str(file), '-vn', '-ac', '1', '-ar', '44100', '-f', 'f32le', '-']), dtype=np.float32)
    original, encoded = pcm(prod/'audio/narracao.mp3'), pcm(export)
    n = min(len(original), len(encoded))
    corr = float(np.corrcoef(original[:n], encoded[:n])[0,1])
    error = float(np.sqrt(np.mean((original[:n]-encoded[:n])**2)))
    assert corr > .995, corr
    assert abs(len(encoded)-len(original))/44100 < .05
    # Complete decode; signal stats surface accidental black runs and silent tails.
    decode = subprocess.run(['ffmpeg', '-hide_banner', '-v', 'error', '-i', str(export), '-f', 'null', '-'], capture_output=True, text=True, check=True)
    assert not decode.stderr.strip(), decode.stderr
    black = subprocess.run(['ffmpeg', '-hide_banner', '-i', str(export), '-an', '-vf', 'blackdetect=d=0.1:pix_th=0.05:pic_th=0.98', '-f', 'null', '-'], capture_output=True, text=True, check=True)
    black_runs = [line for line in black.stderr.splitlines() if 'black_start:' in line]
    assert not black_runs, black_runs
    report.update({'export': str(export.relative_to(root)).replace('\\','/'), 'probe': probe, 'audioDecodedOriginalSamples': len(original), 'audioDecodedExportSamples': len(encoded), 'audioCorrelation': corr, 'audioRmsError': error, 'fullDecode': 'passed', 'blackRuns': black_runs})
(out/'validacao-v003.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps({k:v for k,v in report.items() if k != 'probe'}, ensure_ascii=False, indent=2))
