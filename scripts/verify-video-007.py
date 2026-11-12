import json,subprocess,hashlib
from pathlib import Path
from PIL import Image,ImageOps,ImageDraw
R=Path.cwd();O=R/'out/video-007';p=R/'out/ClipRushVideo007.mp4'
assert p.is_file() and p.stat().st_size>100000
probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_format','-show_streams','-of','json',str(p)]))
v=next(s for s in probe['streams'] if s['codec_type']=='video');a=next(s for s in probe['streams'] if s['codec_type']=='audio')
assert (v['width'],v['height'],v['r_frame_rate'],v['nb_frames'])==(1080,1920,'30/1','1192')
assert v['codec_name']=='h264' and a['codec_name']=='aac'
assert float(a['duration'])>=39.706063-.03
result=subprocess.run(['ffmpeg','-v','error','-i',str(p),'-f','null','-'],capture_output=True,text=True);assert result.returncode==0 and not result.stderr,result.stderr
analysis=subprocess.run(['ffmpeg','-hide_banner','-i',str(p),'-vf','blackdetect=d=0.1:pix_th=0.02','-af','volumedetect','-f','null','-'],capture_output=True,text=True)
(O/'integrity-analysis.txt').write_text(analysis.stderr,encoding='utf-8')
files=sorted(O.glob('frame-*.jpg'));sheet=Image.new('RGB',(1200,((len(files)+4)//5)*450),'#151515');d=ImageDraw.Draw(sheet)
for i,f in enumerate(files):
 x=i%5*240;y=i//5*450;sheet.paste(ImageOps.contain(Image.open(f),(235,420)),(x,y+25));d.text((x,y),f.stem,fill='white')
sheet.save(O/'review-sheet.jpg')
report={'file':str(p),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'probe':probe,'fullDecode':'passed','blackIntervals':[s for s in analysis.stderr.splitlines() if 'black_start' in s],'volume':[s for s in analysis.stderr.splitlines() if 'mean_volume' in s or 'max_volume' in s]}
(O/'integrity-report.json').write_text(json.dumps(report,indent=2),encoding='utf-8');print(json.dumps({k:v for k,v in report.items() if k!='probe'},indent=2))
