"""Make clean silent selects; originals stay untouched."""
import json, subprocess, hashlib
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'out/video-006'
baseline=OUT/'preserved.json'
if not baseline.exists():
    paths=[p for folder in ['src/videos','public/videos'] for p in (ROOT/folder).rglob('*') if p.is_file() and 'video-006' not in p.parts]
    paths += [ROOT/'src/Composition.tsx']
    baseline.write_text(json.dumps([{'file':p.relative_to(ROOT).as_posix(),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in paths]),encoding='utf-8')
media=ROOT/'public/videos/video-006'
dest=media/'footage'; dest.mkdir(exist_ok=True)
selects=[('traffic',34,3.8),('beach-gym',38,4),('street',45.3,3.5),('bar',90,5.6),('promenade',125.4,2.6),('club',128.1,2.4),('water',139.3,2.8),('city',153,2.8),('gesture',12.4,3.5)]
for name,start,duration in selects:
    target=dest/f'{name}.mp4'
    if target.exists(): continue
    # Decode from the start to avoid broken inter-frame references after seeking.
    result=subprocess.run(['ffmpeg','-v','warning','-i',str(media/'videos-complementares/Trailer 2 GTA VI.mp4'),'-ss',str(start),'-t',str(duration),'-an','-vf','crop=1920:864:0:108,setsar=1','-c:v','libx264','-preset','fast','-crf','18','-g','30','-pix_fmt','yuv420p','-movflags','+faststart','-n',str(target)],capture_output=True,text=True)
    (OUT/f'{name}-decode.txt').write_text(result.stderr,encoding='utf-8')
    result.check_returncode()
    print(name,start,duration,flush=True)
(ROOT/'src/videos/video-006/selects.json').write_text(json.dumps([{'id':n,'source':'videos-complementares/Trailer 2 GTA VI.mp4','sourceIn':s,'sourceOut':round(s+d,3),'file':f'footage/{n}.mp4','game':'GTA 6','audio':'removed','crop':'1920:864:0:108 (encoded letterbox only)'} for n,s,d in selects],indent=2),encoding='utf-8')
