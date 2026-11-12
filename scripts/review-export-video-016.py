"""Review actual encoded output and derive short previews without rerendering scenes."""
import json
import subprocess
import sys
from pathlib import Path
from PIL import Image,ImageDraw

root=Path(__file__).resolve().parents[1]
out=root/'out/video-016'
version=sys.argv[1] if len(sys.argv)>1 else 'v005'
source=out/f'video-016-{version}.mp4'
assert source.exists()
review=out/f'export-revisao-{version}'
review.mkdir(exist_ok=True)
# A representative image from every authored block, plus the critical handoffs.
frames=[0,94,140,260,330,385,490,540,600,650,720,794,800,810,875,950,998,1040,1100,1160,1206]
for f in frames:
    dest=review/f'{f:04}.jpg'
    if not dest.exists():
        subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-n','-ss',f'{f/30:.9f}','-i',str(source),'-frames:v','1','-vf','scale=540:960','-q:v','2',str(dest)],check=True)
for n in range(0,len(frames),8):
    sheet=Image.new('RGB',(1080,1020),'#101724')
    draw=ImageDraw.Draw(sheet)
    for i,f in enumerate(frames[n:n+8]):
        x,y=(i%4)*270,(i//4)*510
        sheet.paste(Image.open(review/f'{f:04}.jpg').resize((270,480)),(x,y))
        draw.text((x+10,y+484),f'{f/30:.2f}s | {f}',fill='white')
    sheet.save(out/f'export-contato-{n//8}-{version}.jpg')
previews=[('inicio',0,197),('comparacao',509,701),('ponte-rdr2',696,979),('fim',1083,1206)]
for name,first,last in previews:
    dest=out/f'previa-{name}-{version}.mp4'
    if not dest.exists():
        subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-n','-ss',f'{first/30:.9f}','-i',str(source),'-t',f'{(last-first+1)/30:.9f}','-map','0:v:0','-map','0:a:0','-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-c:a','aac','-b:a','320k','-movflags','+faststart',str(dest)],check=True)
    print('Encoded preview from final export:',name,flush=True)
freeze=subprocess.run(['ffmpeg','-hide_banner','-i',str(source),'-an','-vf','freezedetect=n=-50dB:d=0.5','-f','null','-'],capture_output=True,text=True,check=True)
events=[line for line in freeze.stderr.splitlines() if 'freeze_' in line]
(out/f'export-auditoria-{version}.json').write_text(json.dumps({'representativeEncodedFrames':frames,'previewsDerivedFrom':str(source.relative_to(root)).replace('\\','/'),'freezeEvents':events,'intentionalStillComparison':[21.3,23.2]},ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'frames':len(frames),'previews':len(previews),'freezeEvents':events},ensure_ascii=False))
