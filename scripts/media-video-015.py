"""Short seekable derivatives only; never duplicate a full library video."""
import json
import subprocess
from pathlib import Path

root = Path(__file__).resolve().parents[1]
source = root / 'public/videos/biblioteca/gta6/videos/gta6-extended.mp4'
media = root / 'public/videos/video-015/media'
media.mkdir(exist_ok=True)
cuts = [('jason', 31327, 53), ('barco-rio', 30927, 45), ('jet-ski', 31381, 55), ('praia', 33285, 74), ('mergulho', 31112, 80), ('barco-costa', 47215, 103), ('academia', 31192, 104)]
records = []
for name, first, count in cuts:
    target = media / f'{name}-v001.mp4'
    if not target.exists():
        subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-n', '-ss', f'{first/30:.9f}', '-i', str(source), '-map', '0:v:0', '-frames:v', str(count), '-an', '-c:v', 'libx264', '-preset', 'fast', '-crf', '12', '-pix_fmt', 'yuv420p', '-fps_mode', 'passthrough', '-movflags', '+faststart', str(target)], check=True)
    info = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=nb_frames,r_frame_rate,width,height', '-of', 'json', str(target)], text=True))['streams'][0]
    assert int(info['nb_frames']) == count and info['r_frame_rate'] == '30/1'
    records.append({'name': name, 'original': str(source.relative_to(root)).replace('\\', '/'), 'sourceInFrame': first, 'sourceOutFrameExclusive': first+count, 'count': count, 'derivative': str(target.relative_to(root)).replace('\\', '/'), 'encoding': 'H264 CRF12, 1920x1080 unchanged dimensions, no audio, no temporal interpolation', 'probe': info})
(root / 'out/video-015/recortes-v001.json').write_text(json.dumps(records, ensure_ascii=False, indent=2), encoding='utf-8')
print('Verified', len(records), 'short derivatives;', sum(r['count'] for r in records), 'source frames; original media untouched.')
