from pathlib import Path
from PIL import Image,ImageDraw
import subprocess
s=next(Path('public/videos/biblioteca/gta6/videos/davy').glob('*FIM DO MUNDO*'))
out=Path('out/video-028')
times=[178,190,555,566,792,803,848,870,888,890,896,900,906,916,930,946,950]
sheet=Image.new('RGB',(4*480,5*295),'#131722')
for i,t in enumerate(times):
 p=out/f'source-{t}.jpg'
 subprocess.run(['ffmpeg','-v','error','-ss',str(t),'-i',str(s),'-frames:v','1','-q:v','2','-y',str(p)],check=True)
 sheet.paste(Image.open(p).resize((480,270)),((i%4)*480,(i//4)*295))
 ImageDraw.Draw(sheet).text(((i%4)*480+10,(i//4)*295+274),f'{t//60:02}:{t%60:02}',fill='white')
sheet.save(out/'source-sheet.jpg')
