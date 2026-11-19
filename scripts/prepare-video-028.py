from pathlib import Path
import subprocess,json,wave,math,struct
root=Path(__file__).resolve().parents[1]
source=next((root/'public/videos/biblioteca/gta6/videos/davy').glob('*FIM DO MUNDO*'))
out=root/'public/videos/video-028/footage';out.mkdir(exist_ok=True)
shots=[('boarding',182,10),('ocean',555,15),('map',796,8),('edge',870,18),('motor',890,10),('jump',901,15),('death',916,9),('closing',848,10)]
for name,start,duration in shots:
 p=out/f'{name}-clean.mp4'
 if p.exists():raise RuntimeError(f'Preserve existing {p}')
 subprocess.run(['ffmpeg','-v','error','-ss',str(start),'-i',str(source),'-t',str(duration),'-an','-vf','crop=1380:960:450:70,fps=30','-c:v','libx264','-preset','fast','-crf','17','-movflags','+faststart','-n',str(p)],check=True)
 print(name,flush=True)
(out/'source-manifest.json').write_text(json.dumps({'source':str(source.relative_to(root)),'crop':[450,70,1380,960],'webcamExcluded':'Original webcam ends before x=450; crop starts x=450','clips':[{'name':n,'start':s,'duration':d,'audio':False} for n,s,d in shots]},indent=2),encoding='utf-8')
with wave.open(str(out/'click.wav'),'wb') as w:
 w.setparams((1,2,48000,0,'NONE','not compressed'))
 w.writeframes(b''.join(struct.pack('<h',int(1900*math.exp(-i/480)*math.sin(2*math.pi*1400*i/48000))) for i in range(4800)))
