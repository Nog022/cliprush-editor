"""Extract the eight approved half-open frame intervals, preserving originals."""
import hashlib
import json
import subprocess
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
PROD = ROOT / 'public/videos/video-014'
OUT = ROOT / 'out/video-014'
MEDIA = PROD / 'media'
SOURCE = ROOT / 'public/videos/biblioteca/gta6/videos/gta6-extended.mp4'

def run(args):
    return subprocess.check_output(args, text=True, encoding='utf-8')

def tc_frame(tc):
    h, m, s, f = map(int, tc.split(':'))
    assert 0 <= f < 30
    return ((h * 60 + m) * 60 + s) * 30 + f

def main():
    OUT.mkdir(parents=True, exist_ok=True)
    MEDIA.mkdir(parents=True, exist_ok=True)
    marks = json.loads((PROD / 'roteiro/marcacoes.json').read_text(encoding='utf-8'))
    probe = json.loads(run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_streams', '-of', 'json', str(SOURCE)]))['streams'][0]
    assert probe['r_frame_rate'] == probe['avg_frame_rate'] == '30/1'
    records = []
    for s in marks['scenes']:
        start, end = tc_frame(s['sourceInTimecode']), tc_frame(s['sourceOutTimecode'])
        count = end - start
        assert count == s['sourceDurationFramesAtNominalFps']
        name = f"detail-{s['order']:02d}-v001"
        dest = MEDIA / f'{name}.mp4'
        # Accurate input seek decodes/discards frames before the exact timestamp;
        # re-encode, never keyframe-only stream-copy.
        if not dest.exists():
            subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-n', '-ss', f'{start/30:.9f}', '-i', str(SOURCE), '-map', '0:v:0', '-frames:v', str(count), '-an', '-c:v', 'libx264', '-preset', 'fast', '-crf', '16', '-pix_fmt', 'yuv420p', '-fps_mode', 'passthrough', '-movflags', '+faststart', str(dest)], check=True)
        info = json.loads(run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=nb_frames,duration,r_frame_rate,width,height', '-of', 'json', str(dest)]))['streams'][0]
        assert int(info['nb_frames']) == count
        # All selected source frames are saved once for deterministic tracking,
        # freezes and exact frame-addressing without repeated decoder seeks.
        frames = MEDIA / name
        frames.mkdir(exist_ok=True)
        if len(list(frames.glob('*.jpg'))) != count:
            subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-n', '-i', str(dest), '-q:v', '2', '-start_number', '0', str(frames / '%04d.jpg')], check=True)
        sheet = Image.new('RGB', (1440, 320), '#10121c')
        draw = ImageDraw.Draw(sheet)
        for i, f in enumerate([0, count//2, count-1]):
            im = Image.open(frames / f'{f:04d}.jpg').resize((480,270))
            sheet.paste(im, (480*i, 35))
            draw.text((480*i+10, 10), f"{s['order']:02d} | source frame {start+f} | local {f}", fill='white')
        sheet.save(OUT / f'source-{s["order"]:02d}-v001.jpg')
        records.append({'order':s['order'], 'detail':s['detail'], 'in':s['sourceInTimecode'], 'outExclusive':s['sourceOutTimecode'], 'startFrame':start, 'endFrameExclusive':end, 'frameCount':count, 'duration':count/30, 'extractedFile':str(dest.relative_to(ROOT)).replace('\\','/'), 'probe':info})
    narration = PROD / 'audio/narracao.mp3'
    report = {'source':str(SOURCE.relative_to(ROOT)).replace('\\','/'), 'sourceFps':30, 'timecodeBasis':'30 fps, non-drop, in inclusive / out exclusive', 'audioSha256':hashlib.sha256(narration.read_bytes()).hexdigest(), 'scenes':records}
    (OUT / 'extracao-v001.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps(report, ensure_ascii=False, indent=2))

if __name__ == '__main__':
    main()
