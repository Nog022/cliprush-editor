"""Inspect only documented source candidates, three frames per selected interval."""
import json
import subprocess
from pathlib import Path
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parents[1]
out = root/'out/video-016'
out.mkdir(parents=True,exist_ok=True)
lib = root/'public/videos/biblioteca/gta6/videos'
intervals = [
 ('216','gta6-extended.mp4',1396.2,1399.4),
 ('223','gta6-extended.mp4',1439.567,1441.867),
 ('historico-loja','gta6-extended.mp4',1081.11,1088.13),
 ('historico-acao','gta6-extended.mp4',842.26,852.05),
 ('140','gta6-extended.mp4',943.067,952.256),
 ('172','gta6-extended.mp4',1123.433,1128.567),
 ('t2-16','Trailer 2 GTA VI.mp4',45.267,49.833),
 ('launch-41','Launch Trailer.mp4',70.2,71.4),
]
for label,file,start,end in intervals:
    sheet = Image.new('RGB',(1920,390),'#101724')
    draw = ImageDraw.Draw(sheet)
    for i,t in enumerate([start+1/30,(start+end)/2,end-2/30]):
        target = out/f'fonte-{label}-{i}-v001.jpg'
        if not target.exists():
            subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-n','-ss',f'{t:.9f}','-i',str(lib/file),'-frames:v','1','-vf','scale=960:-1','-q:v','2',str(target)],check=True)
        sheet.paste(Image.open(target).resize((640,360)),(i*640,30))
        draw.text((i*640+10,8),f'{label} | {t:.3f}s | {file}',fill='white')
    sheet.save(out/f'fonte-{label}-contato-v001.jpg')
    print('Inspected candidate',label,flush=True)
