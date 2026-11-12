"""Production-specific validation: preservation, captions, media and complete export."""
import hashlib
import json
import re
import subprocess
import sys
from pathlib import Path
import numpy as np
from PIL import ImageFont

root=Path(__file__).resolve().parents[1]
out=root/'out/video-016'
prod=root/'public/videos/video-016'
code=root/'src/videos/video-016'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
baseline=json.loads((out/'preservacao-v001.json').read_text(encoding='utf-8'))
changed=[p for p,h in baseline.items() if not (root/p).exists() or sha(root/p)!=h]
assert not changed,changed
before=(out/'Root-antes-v001.tsx').read_text(encoding='utf-8')
after=(root/'src/Root.tsx').read_text(encoding='utf-8')
after=after.replace('import { ClipRush016 } from "./videos/video-016/ClipRush016";\n','',1)
after=after.replace('      <Composition id="ClipRush016" component={ClipRush016} durationInFrames={1207} fps={30} width={1080} height={1920} />\n','',1)
assert before==after,'Root changed beyond the video-016 registration/import'
captions=json.loads((code/'captions.json').read_text(encoding='utf-8'))
normalize=lambda s:re.findall(r'\w+',s.casefold())
assert normalize(' '.join(c['text'] for c in captions))==normalize((prod/'roteiro/narracao.txt').read_text(encoding='utf-8'))
assert all(2<=len(c['text'].split())<=6 for c in captions)
assert all(a['endMs']<=b['startMs'] for a,b in zip(captions,captions[1:]))
font=ImageFont.truetype(str(prod/'fonts/Arial-Bold.ttf'),56)
max_lines=0
for caption in captions:
    lines,current=1,''
    for word in caption['text'].split():
        trial=(current+' '+word).strip()
        if current and font.getlength(trial)>836:
            current=word
            lines+=1
        else:
            current=trial
    max_lines=max(max_lines,lines)
assert max_lines<=2,max_lines
meta=json.loads((code/'metadata.json').read_text(encoding='utf-8'))
assert sha(prod/'audio/narracao.mp3')==meta['audioSha256']
clips=json.loads((out/'recortes-v001.json').read_text(encoding='utf-8'))
for a in clips:
    assert (root/a['derivative']).is_file()
    for b in clips:
        if a['id']!=b['id']:
            assert a['sourceOutFrameExclusive']<=b['sourceInFrame'] or b['sourceOutFrameExclusive']<=a['sourceInFrame']
report={'preservedFiles':len(baseline),'changedProtectedFiles':changed,'rootOnlyNewComposition':True,'approvedCaptionTextPreserved':True,'captionPages':len(captions),'maxCaptionLines':max_lines,'wordsPerPage':[min(len(c['text'].split()) for c in captions),max(len(c['text'].split()) for c in captions)],'brollIntervalsDistinct':True,'audioOriginalSha256':meta['audioSha256']}
def pcm(file):
    return np.frombuffer(subprocess.check_output(['ffmpeg','-hide_banner','-loglevel','error','-i',str(file),'-vn','-ac','1','-ar','44100','-f','f32le','-']),dtype=np.float32)
version=sys.argv[1] if len(sys.argv)>1 else 'v005'
export=out/f'video-016-{version}.mp4'
if export.exists():
    probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration,size:stream=codec_name,codec_type,width,height,r_frame_rate,nb_frames,duration,sample_rate,channels','-of','json',str(export)],text=True))
    v=next(s for s in probe['streams'] if s['codec_type']=='video')
    a=next(s for s in probe['streams'] if s['codec_type']=='audio')
    assert (v['width'],v['height'],v['r_frame_rate'],int(v['nb_frames']))==(1080,1920,'30/1',1207)
    assert a['codec_name']=='aac' and float(a['duration'])>=meta['duration']-.01
    original,encoded=pcm(prod/'audio/narracao.mp3'),pcm(export)
    n=min(len(original),len(encoded))
    corr=float(np.corrcoef(original[:n],encoded[:n])[0,1])
    assert corr>.995,corr
    assert len(encoded)>=len(original)-2,'Narration tail was cut'
    assert abs(len(encoded)-len(original))/44100<.07
    decode=subprocess.run(['ffmpeg','-hide_banner','-v','error','-i',str(export),'-f','null','-'],capture_output=True,text=True,check=True)
    assert not decode.stderr.strip(),decode.stderr
    black=subprocess.run(['ffmpeg','-hide_banner','-i',str(export),'-an','-vf','blackdetect=d=0.1:pix_th=0.05:pic_th=0.98','-f','null','-'],capture_output=True,text=True,check=True)
    black_runs=[line for line in black.stderr.splitlines() if 'black_start:' in line]
    assert not black_runs,black_runs
    report.update({'export':str(export.relative_to(root)).replace('\\','/'),'probe':probe,'audioCorrelation':corr,'originalSamples':len(original),'exportSamples':len(encoded),'fullOriginalVoiceCompared':n==len(original),'fullDecode':'passed','blackRuns':black_runs})
    # Timeline-aware audio comparison of every encoded preview.
    previews=[]
    for name,first in [('inicio',0),('comparacao',509),('ponte-rdr2',696),('fim',1083)]:
        file=out/f'previa-{name}-{version}.mp4'
        if file.exists():
            voice=pcm(file)
            start=round(first/30*44100)
            count=min(len(voice),len(original)-start)
            correlation=float(np.corrcoef(original[start:start+count],voice[:count])[0,1])
            assert correlation>.995,(name,correlation)
            previews.append({'name':name,'audioCorrelation':correlation,'timelineStartFrame':first})
    report['previews']=previews
(out/f'validacao-{version}.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({k:v for k,v in report.items() if k!='probe'},ensure_ascii=False,indent=2))
