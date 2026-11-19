"""Verify the exported master without rendering again."""
from pathlib import Path
import subprocess,json,numpy as np
from scipy.signal import correlate,correlation_lags
from PIL import Image,ImageDraw
root=Path(__file__).resolve().parents[1]
out=root/'out/video-028'; final=root/'deliveries/video-028-final-20261118-v1.mp4'
def probe(p):
 return json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(p)]))
p=probe(final);v=next(s for s in p['streams'] if s['codec_type']=='video');a=next(s for s in p['streams'] if s['codec_type']=='audio')
assert (v['width'],v['height'],v['avg_frame_rate'],int(v['nb_frames']))==(1080,1920,'30/1',1509)
assert abs(float(p['format']['duration'])-1509/30)<.15
for f in (root/'public/videos/video-028/footage').glob('*clean.mp4'):
 assert all(s['codec_type']!='audio' for s in probe(f)['streams']),f

def audio(p):
 return np.frombuffer(subprocess.check_output(['ffmpeg','-v','error','-i',str(p),'-map','0:a:0','-ar','16000','-ac','1','-f','f32le','pipe:1']),dtype=np.float32)
x=audio(root/'public/videos/video-028/audio/narracao.mp3');y=audio(final)
n=min(len(x),len(y));x=x[:n];y=y[:n]
c=correlate(y,x,mode='full',method='fft');lag=int(correlation_lags(len(y),len(x))[np.argmax(c)])
if lag>0: yy=y[lag:];xx=x[:len(yy)]
elif lag<0: xx=x[-lag:];yy=y[:len(xx)]
else:xx=x;yy=y
corr=float(np.corrcoef(xx,yy)[0,1]);assert corr>.99,(corr,lag)
times=[0.67,2.67,5.33,9.33,12.17,14.33,16.67,20.67,25.5,29.5,33.0,37.7,39.9,43,48]
sheet=Image.new('RGB',(1080,4*500),'#111')
for i,t in enumerate(times):
 f=out/f'final-{i:02}.jpg'
 subprocess.run(['ffmpeg','-v','error','-ss',str(t),'-i',str(final),'-frames:v','1','-vf','scale=270:480','-y',str(f)],check=True)
 sheet.paste(Image.open(f),((i%4)*270,(i//4)*500));ImageDraw.Draw(sheet).text(((i%4)*270+8,(i//4)*500+480),f'{t:.2f}s',fill='white')
sheet.save(out/'final-contact-sheet.jpg')
report={'ctaVisualTime':25.5,'file':str(final.relative_to(root)),'width':v['width'],'height':v['height'],'fps':v['avg_frame_rate'],'frames':int(v['nb_frames']),'duration':float(p['format']['duration']),'videoCodec':v['codec_name'],'audioCodec':a['codec_name'],'bytes':final.stat().st_size,'narrationCorrelation':corr,'audioLagSamples16000Hz':lag,'sourceClipsHaveAudio':False,'fullDecode':'passed by completeProduction validationOnly','priorProductions':'preserved; no retention transaction'}
(out/'validation.json').write_text(json.dumps(report,indent=2),encoding='utf-8');print(json.dumps(report,indent=2))


