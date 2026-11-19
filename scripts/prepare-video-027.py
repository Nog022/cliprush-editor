from pathlib import Path
import subprocess,json
out=Path('public/videos/video-027/footage');out.mkdir(exist_ok=True)
s=next(Path('public/videos/biblioteca/gta6/videos/alanzoka').glob('*eZE6PtAf8vE*'))
for name,start,dur,x in [('assalto',720,25,460),('despiste',870,7,460),('tinta',880,10,460),('tentativa',895,3,460)]:
 target=out/f'{name}.mp4'
 if target.exists():
  target=out/f'{name}-clean.mp4'
 subprocess.run(['ffmpeg','-v','error','-ss',str(start),'-i',str(s),'-t',str(dur),'-an','-vf',f'crop=1000:800:{x}:80,fps=30','-c:v','libx264','-preset','fast','-crf','17','-movflags','+faststart','-n',str(target)],check=True)
from PIL import Image
Image.open('out/video-027/full-880.jpg').crop((32,288,451,399)).save(out/'aviso.png')
print('Sanitized footage: no audio; webcam excluded geometrically. Genuine HUD notice extracted.')
