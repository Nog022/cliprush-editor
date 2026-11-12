from PIL import Image, ImageDraw
from pathlib import Path
import subprocess
p = Path('out/video-010')
times = [9+i*.5 for i in range(7)]+[18+i*.5 for i in range(10)]+[42+i*.5 for i in range(18)]
s = Image.new('RGB', (1280, 204*((len(times)+3)//4)))
d = ImageDraw.Draw(s)
v = 'public/videos/video-010/videos-complementar/Trailer 1 GTA VI.mp4'
for i, t in enumerate(times):
    f = p / f'detail-{t}.jpg'
    subprocess.run(['ffmpeg', '-v', 'fatal', '-ss', str(t), '-i', v, '-frames:v', '1', '-vf', 'scale=320:180', '-n', str(f)], check=True)
    x, y = i%4*320, i//4*204
    s.paste(Image.open(f), (x, y+24))
    d.text((x+5, y+5), str(t), fill='white')
s.save(p/'details.jpg')
