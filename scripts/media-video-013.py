"""Extract only user-approved frame windows, with a source-frame audit trail."""
import json
import subprocess
from pathlib import Path
from PIL import Image, ImageDraw

source = Path('public/videos/biblioteca/gta6/videos/Grand Theft Auto VI： Pré-carregue agora [sXCiA142w8Y].webm')
assets = Path('public/videos/video-013/media')
out = Path('out/video-013')
assets.mkdir(parents=True, exist_ok=True)
out.mkdir(parents=True, exist_ok=True)
windows = {'acrobacia': (136,182), 'equipe': (404,440), 'balada': (61,135), 'iate': (316,358), 'avenida': (537,567), 'precarregue': (450,479)}
manifest = {'source': str(source), 'fps':30, 'endFramesInclusive':True, 'windows':{}}
for name, (start,end) in windows.items():
    directory = assets/name
    directory.mkdir(exist_ok=True)
    if len(list(directory.glob('*.jpg'))) != end-start+1:
        subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-i',str(source),'-vf',f'select=between(n\\,{start}\\,{end}),scale=1920:1080','-fps_mode','passthrough','-start_number',str(start),'-q:v','2',str(directory/'%04d.jpg')], check=True)
    manifest['windows'][name] = {'start':start,'end':end,'frameCount':end-start+1,'pattern':f'videos/video-013/media/{name}/%04d.jpg'}
    print(name, start, end, 'OK', flush=True)
(assets/'source-frames.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
samples = [('acrobacia',136),('acrobacia',160),('acrobacia',182),('equipe',404),('equipe',423),('equipe',440),('balada',95),('iate',316),('iate',330),('iate',358),('avenida',537),('avenida',548),('avenida',567),('precarregue',450),('precarregue',470)]
sheet=Image.new('RGB',(1200,225*5),(12,14,20))
draw=ImageDraw.Draw(sheet)
for i,(name,frame) in enumerate(samples):
    thumb=Image.open(assets/name/f'{frame:04d}.jpg').resize((400,225))
    x,y=(i%3)*400,(i//3)*225
    sheet.paste(thumb,(x,y))
    draw.rectangle((x,y,x+235,y+24),fill='black')
    draw.text((x+8,y+5),f'{name} / frame {frame}',fill='white')
sheet.save(out/'source-review-v001.jpg',quality=92)
