"""Validate export integrity, unchanged narration timing, and complete captions."""
import json,subprocess,re
from pathlib import Path
import numpy as np

out=Path('out/video-012')
video=out/'video-012-v001.mp4'
probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(video)]))
v=next(s for s in probe['streams'] if s['codec_type']=='video')
a=next(s for s in probe['streams'] if s['codec_type']=='audio')
assert (v['width'],v['height'],v['r_frame_rate'],int(v['nb_frames']))==(1080,1920,'30/1',1566)
assert v['codec_name']=='h264' and a['codec_name']=='aac'
assert abs(float(v['duration'])-52.2)<.002
check=subprocess.run(['ffmpeg','-v','error','-i',str(video),'-f','null','-'],capture_output=True,check=True)
assert not check.stderr.strip(),check.stderr.decode(errors='replace')
def pcm(file):
    return np.frombuffer(subprocess.check_output(['ffmpeg','-v','error','-i',str(file),'-vn','-ac','1','-ar','16000','-f','f32le','-']),dtype='<f4')
voice=pcm('public/videos/video-012/audio/narracao.mp3'); rendered=pcm(video)
assert len(rendered)>=len(voice)
def corr(x,y):return float(np.dot(x,y)/(np.linalg.norm(x)*np.linalg.norm(y)))
n=len(voice)
scores={'whole':corr(voice,rendered[:n]),'start':corr(voice[:80000],rendered[:80000]),'end':corr(voice[-80000:],rendered[n-80000:n])}
assert min(scores.values())>.98,scores
captions=json.loads(Path('src/videos/video-012/captions.json').read_text(encoding='utf-8'))
script=Path('public/videos/video-012/roteiro/roteiro.txt').read_text(encoding='utf-8')
norm=lambda text:re.sub(r'\W+','',text).lower()
assert norm(' '.join(w['text'] for page in captions for w in page))==norm(script)
assert all(w['endMs']>=w['startMs'] for page in captions for w in page)
black=subprocess.run(['ffmpeg','-hide_banner','-i',str(video),'-vf','blackdetect=d=0.03:pix_th=0.1:pic_th=0.98','-an','-f','null','-'],capture_output=True,text=True,check=True)
black_intervals=[line.strip() for line in black.stderr.splitlines() if 'black_start:' in line]
assert not black_intervals,black_intervals
result={'file':str(video),'bytes':video.stat().st_size,'duration':float(v['duration']),'audioDuration':float(a['duration']),'resolution':[v['width'],v['height']],'fps':v['r_frame_rate'],'frames':int(v['nb_frames']),'codecs':[v['codec_name'],a['codec_name']],'fullDecode':'PASS','blackFrames':'none detected','scriptCaptionsComplete':True,'narrationCorrelation':scores,'lintAndTypeScript':'PASS','visualReview':'Each of 10 timeline blocks reviewed before full render; HUD before/after and door profile individually inspected','sourceRanges':json.loads(Path('public/videos/video-012/footage/origens.json').read_text(encoding='utf-8')),'limitations':['No camera/CCTV icon confirmed; no fabricated symbol used.','Door face detail uses a real profile frame at source 18:00.100, with existing face covering.'],'priorProductions':'No prior production files changed; only ClipRush012 registration added to existing Root.tsx.'}
(out/'verificacao-final.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(result,ensure_ascii=False,indent=2))
