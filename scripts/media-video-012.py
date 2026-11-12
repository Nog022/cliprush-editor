import json, subprocess, wave, math, struct
from pathlib import Path
from PIL import Image,ImageDraw
out=Path('out/video-012'); media=Path('public/videos/video-012/footage'); media.mkdir(exist_ok=True)
source='public/videos/biblioteca/gta6/videos/gta6-extended.mp4'
ranges=[(842.260,852.050),(952.020,959.170),(984.180,989.040),(1072.120,1080.180),(1081.110,1088.130)]
for i,(a,b) in enumerate(ranges,1):
    target=media/f'corte-{i:02d}-h264.mp4'
    if not target.exists():
        subprocess.run(['ffmpeg','-v','error','-ss',str(a),'-i',source,'-t',str(b-a),'-an','-c:v','libx264','-crf','17','-preset','fast','-pix_fmt','yuv420p','-movflags','+faststart','-n',str(target)],check=True)
(media/'origens.json').write_text(json.dumps({'original':source,'reason':'HEVC incompatible with Studio; only user-specified intervals transcoded','cuts':[{'file':f'corte-{i:02d}-h264.mp4','sourceStart':a,'sourceEnd':b} for i,(a,b) in enumerate(ranges,1)]},indent=2),encoding='utf-8')
# Inspect consecutive vehicle exit moments and genuine top-right HUD.
sheet=Image.new('RGB',(960,9*160),'#11111a'); draw=ImageDraw.Draw(sheet)
for j,t in enumerate([955,955.5,956,956.5,957,957.5,958,958.5,959]):
    target=out/f'exit-{t}.jpg'
    subprocess.run(['ffmpeg','-v','error','-ss',str(t),'-i',source,'-frames:v','1','-q:v','2','-y',str(target)],check=True)
    im=Image.open(target); small=im.resize((480,270)); sheet.paste(small.crop((0,50,480,210)),(0,j*160))
    hud=im.crop((1720,0,1920,140)).resize((400,280)); sheet.paste(hud.crop((0,0,400,140)),(500,j*160)); draw.text((500,j*160+142),str(t),fill='white')
sheet.save(out/'saida-hud.jpg')
# Quiet original tension bed and sparse editorial taps, deterministic synthesis.
sr=48000; duration=52.2
with wave.open('public/videos/video-012/audio/trilha-original.wav','wb') as wav:
    wav.setnchannels(1); wav.setsampwidth(2); wav.setframerate(sr)
    buf=bytearray()
    hits=[0,4.34,12.42,13.38,14.2,20.2,22.3,25.2,30,37.06,41.06,49,50]
    for n in range(round(duration*sr)):
        t=n/sr; fade=min(1,t/1.5,(duration-t)/1.2)
        pulse=(.5+.5*math.sin(2*math.pi*1.6*t))**8
        val=(.014*math.sin(2*math.pi*55*t)+.009*math.sin(2*math.pi*82.41*t)+.022*pulse*math.sin(2*math.pi*110*t))*fade
        for h in hits:
            d=t-h
            if 0<=d<.25: val+=.055*math.exp(-d*22)*math.sin(2*math.pi*(150*d-130*d*d))
        buf.extend(struct.pack('<h',round(max(-1,min(1,val))*32767)))
    wav.writeframes(buf)
