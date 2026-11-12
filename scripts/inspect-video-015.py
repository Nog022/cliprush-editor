"""Inspect only selected original intervals; never re-index the library."""
import json
import subprocess
from pathlib import Path
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parents[1]
out = root / 'out/video-015'
out.mkdir(parents=True, exist_ok=True)
lib = root / 'public/videos/biblioteca/gta6/videos'
sources = {
    'A': ('gta6-extended.mp4', [1044.233333 + f/30 for f in [0, 8, 16, 26, 36, 52]]),
    'B': ('Grand Theft Auto VI： Pré-carregue agora [sXCiA142w8Y].webm', [4.6 + f/30 for f in [0, 7, 14, 22, 32, 43]]),
}
for name, (file, times) in sources.items():
    sheet = Image.new('RGB', (1920, 780), '#11131c')
    draw = ImageDraw.Draw(sheet)
    for i, sec in enumerate(times):
        dest = out / f'source-{name}-{i}-v001.jpg'
        if not dest.exists():
            subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-n', '-ss', f'{sec:.9f}', '-i', str(lib/file), '-frames:v', '1', '-vf', 'scale=960:-1', '-q:v', '2', str(dest)], check=True)
        im = Image.open(dest).resize((640, 360))
        x, y = (i%3)*640, (i//3)*390
        sheet.paste(im, (x, y+30))
        draw.text((x+8,y+8), f'{name} source {sec:.3f}s | +{round((sec-times[0])*30)}f', fill='white')
    sheet.save(out / f'source-{name}-sheet-v001.jpg')
print('Two selected source sheets saved; originals preserved.')
