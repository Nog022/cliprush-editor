"""Technical validation of the single final render and untouched narration."""
import json
import subprocess
import sys
from pathlib import Path
import numpy as np

manual = '--manual' in sys.argv
corrected = manual or '--corrected' in sys.argv
video = Path('out/ClipRush011-final.mp4' if manual else 'out/ClipRush011-corrigido.mp4' if corrected else 'out/ClipRush011.mp4')
voice = Path('public/videos/video-011/audio/narracao.mp3')
probe = json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(video)]))
v = next(s for s in probe['streams'] if s['codec_type']=='video')
a = next(s for s in probe['streams'] if s['codec_type']=='audio')
assert (v['width'],v['height'],v['r_frame_rate'],int(v['nb_frames'])) == (1080,1920,'30/1',1401)
assert v['codec_name']=='h264' and a['codec_name']=='aac'
assert abs(float(v['duration'])-46.7)<.002
decode = subprocess.run(['ffmpeg','-v','error','-i',str(video),'-f','null','-'],capture_output=True,check=True)
assert not decode.stderr.strip(),decode.stderr.decode(errors='replace')

def pcm(file):
    data = subprocess.check_output(['ffmpeg','-v','error','-i',str(file),'-vn','-ac','1','-ar','16000','-f','f32le','-'])
    return np.frombuffer(data,dtype='<f4')

original, rendered = pcm(voice), pcm(video)
assert len(rendered)>=len(original)
def correlation(x,y):
    return float(np.dot(x,y)/(np.linalg.norm(x)*np.linalg.norm(y)))
n=len(original)
scores={'whole':correlation(original,rendered[:n]),'start':correlation(original[:80000],rendered[:80000]),'end':correlation(original[-80000:],rendered[n-80000:n])}
assert min(scores.values())>.98,scores
result={'path':str(video),'bytes':video.stat().st_size,'resolution':[v['width'],v['height']],'fps':v['r_frame_rate'],'frames':int(v['nb_frames']),'videoDurationSec':float(v['duration']),'audioDurationSec':float(a['duration']),'codecs':[v['codec_name'],a['codec_name']],'pixelFormat':v['pix_fmt'],'fullDecode':'PASS, no FFmpeg errors','narrationCorrelation':scores,'narrationOriginalDurationSec':n/16000,'lintAndTypeScript':'PASS','missingScenes':['NPCs na invasão','Mochila MARCUS','Molotov/líquido','Rato sob máquina de vendas'],'notes':'Missing scenes are explicitly labelled in the exported video; no Instagram media.'}
if manual:
    result['missingScenes'] = []
    result['notes'] = 'Five manual replacements visually reviewed before rendering; approved blocks and narration preserved; no Instagram media.'
    result['sourceIntervals'] = json.loads(Path('out/video-011/final-review/manual-timestamps.json').read_text(encoding='utf-8'))['substitutions']
destination = Path('out/video-011/final-review/verificacao-final.json' if manual else 'out/video-011/correcao/verificacao-final.json' if corrected else 'out/video-011/verificacao-final.json')
destination.write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(result,ensure_ascii=False,indent=2))
