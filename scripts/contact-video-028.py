from pathlib import Path
from PIL import Image,ImageDraw
out=Path('out/video-028');frames=[20,80,160,280,365,430,500,620,765,885,990,1160,1340]
sheet=Image.new('RGB',(1350,3*510),'#151a22')
for i,f in enumerate(frames):
 p=out/f'frame-{f}.jpg'
 if not p.exists():raise RuntimeError(f'Missing {p}')
 sheet.paste(Image.open(p).resize((270,480)),((i%5)*270,(i//5)*510));ImageDraw.Draw(sheet).text(((i%5)*270+8,(i//5)*510+486),f'{f/30:.2f}s / frame {f}',fill='white')
sheet.save(out/'preview-sheet.jpg')
