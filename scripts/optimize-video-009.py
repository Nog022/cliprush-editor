"""Create Studio-only proxies and one lossless preview mix; preserve source files."""
import json
import re
import subprocess
from pathlib import Path

root = Path.cwd()
media = root / 'public/videos/video-009'
dest = media / 'preview-v001'
dest.mkdir(exist_ok=True)
films = {
    'v': 'Grand Theft Auto V - Coming to New Generation Consoles [foUaOCzfIRU].mp4',
    'r': 'Red Dead Redemption 2 Trailer [gmA6MrX81z4].mp4',
    'vi': 'Trailer 2 GTA VI.mp4',
}
scenes = (root/'src/videos/video-009/scenes.tsx').read_text(encoding='utf-8')
shots = sorted(set(re.findall(r'game="(v|r|vi)" start=\{([\d.]+)\}', scenes)))
manifest = []
for game, start in shots:
    # Eight source seconds cover the longest shot, including speed changes.
    name = f'{game}-{round(float(start)*1000)}.mp4'
    out = dest/name
    if not out.exists():
        subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-ss',start,
            '-i',str(media/'videos-complementares'/films[game]),'-t','8','-an',
            '-vf','scale=1280:720,fps=30','-c:v','libx264','-preset','fast',
            '-crf','20','-pix_fmt','yuv420p','-g','15','-keyint_min','15',
            '-sc_threshold','0','-movflags','+faststart','-threads','2','-n',str(out)],check=True)
    manifest.append({'game':game,'sourceStartSeconds':float(start),'file':name,'bytes':out.stat().st_size})
    print('Preview ready:',name,flush=True)
out = dest/'mix.wav'
if not out.exists():
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error',
        '-i',str(media/'audio/narracao.mp3'),'-i',str(media/'audio/score-original-v001.wav'),
        '-i',str(media/'audio/sfx-original-v001.wav'),'-filter_complex',
        '[0:a]volume=0.92[v];[v][1:a][2:a]amix=inputs=3:normalize=0',
        '-ar','48000','-c:a','pcm_s24le','-n',str(out)],check=True)
(dest/'manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
print('Original media unchanged. Preview mix and',len(shots),'short proxies ready.')
