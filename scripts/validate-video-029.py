from pathlib import Path
from PIL import Image, ImageDraw
import subprocess,json
root=Path(__file__).resolve().parents[1]
out=root/'out/video-029'
video=root/'deliveries/video-029-final-20261118.mp4'
probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration,size:stream=codec_type,codec_name,width,height,r_frame_rate,sample_rate','-of','json',str(video)]))
(out/'final-metadata.json').write_text(json.dumps(probe,indent=2),encoding='utf-8')
sheet=Image.new('RGB',(1080,640),'#101717')
for i,t in enumerate([18,27.5,45.8]):
 p=out/f'final-{t}.jpg'
 subprocess.run(['ffmpeg','-v','error','-ss',str(t),'-i',str(video),'-frames:v','1','-q:v','2','-y',str(p)],check=True)
 sheet.paste(Image.open(p).resize((360,640)),(i*360,0))
sheet.save(out/'final-review.jpg')
print(json.dumps(probe,indent=2))
