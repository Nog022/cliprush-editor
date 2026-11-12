"""Technical validation of the rendered preview and original narration."""
import hashlib
import json
import subprocess
import sys
from pathlib import Path
import numpy as np

out=Path('out/video-014')
timeline=json.loads(Path('src/videos/video-014/timeline.json').read_text(encoding='utf-8'))
cuts=json.loads((out/'extracao-v001.json').read_text(encoding='utf-8'))
boundaries=json.loads((out/'validacao-cortes-v001.json').read_text(encoding='utf-8'))
audio=Path('public/videos/video-014/audio/narracao.mp3')
assert hashlib.sha256(audio.read_bytes()).hexdigest()==cuts['audioSha256']
assert len(boundaries)==8 and all(x['exactBoundaryBestMatch'] for x in boundaries)
covered=set()
for scene in timeline['scenes']:
    for p in scene['passes']:
        for f in range(p['duration']):
            absolute=scene['from']+p['from']+f
            assert absolute not in covered
            covered.add(absolute)
            source=p['source']+f*p['rate']
            assert 0<=source<scene['count']
            assert Path(f"public/videos/video-014/media/detail-{scene['order']:02d}-v001/{source:04d}.jpg").is_file()
assert covered==set(range(timeline['durationInFrames']))
print('Timeline/media/source boundaries/original audio hash: PASS',len(covered),'frames',flush=True)
if len(sys.argv)<2:
    raise SystemExit(0)
preview=Path(sys.argv[1])
probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(preview)]))
video=next(s for s in probe['streams'] if s['codec_type']=='video')
rendered_audio=next(s for s in probe['streams'] if s['codec_type']=='audio')
assert (video['width'],video['height'],video['r_frame_rate'],int(video['nb_frames']))==(1080,1920,'30/1',1840)
assert video['codec_name']=='h264' and rendered_audio['codec_name']=='aac'
assert abs(float(video['duration'])-timeline['durationInFrames']/30)<.001
assert float(rendered_audio['duration'])>=timeline['audioDuration']-.025
def decoded_audio(path):
    b=subprocess.check_output(['ffmpeg','-v','error','-i',str(path),'-vn','-ac','1','-ar','16000','-f','f32le','pipe:1'])
    return np.frombuffer(b,np.float32)
original,rendered=decoded_audio(audio),decoded_audio(preview)
count=min(len(original),len(rendered))
segments=[]
for name,start,end in [('inicio',0,5),('meio',28,33),('fim',56,timeline['audioDuration'])]:
    a,b=round(start*16000),min(round(end*16000),count)
    correlation=float(np.corrcoef(original[a:b],rendered[a:b])[0,1])
    assert correlation>.97,(name,correlation)
    segments.append({'segment':name,'correlationWithoutTimeShift':correlation})
full_decode=subprocess.run(['ffmpeg','-v','error','-i',str(preview),'-f','null','NUL'],capture_output=True,text=True)
assert full_decode.returncode==0 and not full_decode.stderr,full_decode.stderr
# Check actual evidence pixels, rather than allowing titles to mask absent media.
black=subprocess.run(['ffmpeg','-hide_banner','-i',str(preview),'-vf','crop=1080:480:0:720,blackdetect=d=0:pix_th=0.07:pic_th=0.99','-an','-f','null','NUL'],capture_output=True,text=True)
events=[l for l in black.stderr.splitlines() if 'black_start:' in l]
assert black.returncode==0 and not events,events
report={'preview':str(preview).replace('\\','/'),'composition':'ClipRush014','video':{k:video[k] for k in ['codec_name','width','height','r_frame_rate','nb_frames','duration','pix_fmt']},'audio':{k:rendered_audio[k] for k in ['codec_name','sample_rate','channels','duration']},'originalNarrationSha256Preserved':True,'allEightExactSourceBoundariesVerified':True,'timelineCoverageFrames':len(covered),'audioCorrelation':segments,'fullDecode':'pass','blackEvidenceIntervals':events,'visualReview':'revisao-visual-v002.json','limits':['Cena do pó escura e pequena na fonte; ampliação não recupera detalhe inexistente.','O motivo de evitar apontar para Lucia é interpretação, preservada no áudio fornecido.']}
target=out/'validacao-previa-v002.json'
assert not target.exists()
target.write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
