from pathlib import Path
from PIL import Image,ImageDraw
import subprocess
s=next(Path('public/videos/biblioteca/gta6/videos/davy').glob('*FIM DO MUNDO*'));out=Path('out/video-028')
times=[901,902,903,904,905,917,918,920,922,924,926,928]
sheet=Image.new('RGB',(1920,885),'#131722')
for i,t in enumerate(times):
 p=out/f'source-{t}.jpg';subprocess.run(['ffmpeg','-v','error','-ss',str(t),'-i',str(s),'-frames:v','1','-q:v','2','-y',str(p)],check=True)
 sheet.paste(Image.open(p).resize((480,270)),((i%4)*480,(i//4)*295));ImageDraw.Draw(sheet).text(((i%4)*480+10,(i//4)*295+274),str(t),fill='white')
sheet.save(out/'evidence-sheet.jpg')
