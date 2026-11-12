"""Prepare only video-016: short original extracts, captions and preservation audit."""
import hashlib
import json
import math
import re
import shutil
import subprocess
from pathlib import Path

root = Path(__file__).resolve().parents[1]
prod = root/'public/videos/video-016'
out = root/'out/video-016'
code = root/'src/videos/video-016'
media = prod/'media'
for p in [out,code,media,prod/'fonts',prod/'stills']:
    p.mkdir(parents=True,exist_ok=True)
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
baseline = out/'preservacao-v001.json'
if not baseline.exists():
    files = [root/'src/Composition.tsx',root/'public/videos/biblioteca/catalogo/gta6/cenas-descritas.json']
    files += [p for p in (root/'src/videos').rglob('*') if p.is_file() and 'video-016' not in p.parts]
    files += list((prod/'roteiro').glob('*'))+[prod/'audio/narracao.mp3']
    baseline.write_text(json.dumps({str(p.relative_to(root)).replace('\\','/'):sha(p) for p in files},indent=2),encoding='utf-8')
    shutil.copyfile(root/'src/Root.tsx',out/'Root-antes-v001.tsx')
shutil.copyfile('C:/Windows/Fonts/arialbd.ttf',prod/'fonts/Arial-Bold.ttf')
source = root/'public/videos/biblioteca/gta6/videos/gta6-extended.mp4'
# Half-open intervals, selected inside the documented ranges. No optical interpolation.
cuts = [
 ('gancho',41886,96,'216','0–3.2s; armed group, no invented shooting'),
 ('loja',32434,146,'historical 18:01.110–18:08.130','Player A: shop / departure, hypothetical outcome'),
 ('armado',43187,69,'223','Player B: armed character, no assertion of shooting'),
 ('acao',25440,62,'historical 14:02.260–14:12.050','Player B: aiming/firing context; no claimed casualties'),
 ('reacoes',28292,185,'140/1','Contextual police/car footage, not evidence of profile response'),
 ('noite',33703,68,'172','Night action verified; catalog description inaccurate'),
 ('escolha',29526,124,'historical 16:24.180–16:29.040','Closing: vehicle motion, wanted HUD not criminal profile'),
]
records = []
for name,first,count,reference,purpose in cuts:
    dest = media/f'{name}-v001.mp4'
    if not dest.exists():
        subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-n','-ss',f'{first/30:.9f}','-i',str(source),'-map','0:v:0','-frames:v',str(count),'-an','-c:v','libx264','-preset','fast','-crf','12','-pix_fmt','yuv420p','-fps_mode','passthrough','-movflags','+faststart',str(dest)],check=True)
    probe = json.loads(subprocess.check_output(['ffprobe','-v','error','-select_streams','v:0','-show_entries','stream=width,height,nb_frames,r_frame_rate','-of','json',str(dest)],text=True))['streams'][0]
    assert int(probe['nb_frames'])==count and probe['r_frame_rate']=='30/1'
    records.append({'id':name,'original':str(source.relative_to(root)).replace('\\','/'),'sourceInFrame':first,'sourceOutFrameExclusive':first+count,'sourceStartSeconds':first/30,'sourceEndExclusiveSeconds':(first+count)/30,'frames':count,'reference':reference,'purpose':purpose,'derivative':str(dest.relative_to(root)).replace('\\','/'),'probe':probe})
    print('Verified short original cut',name,count,'frames',flush=True)
# Actual frames, for the intentional still comparison only.
for name,file,sec in [('A','loja',1.3),('B','acao',.9)]:
    dest=prod/f'stills/{name}-v001.jpg'
    if not dest.exists():
        subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-n','-ss',str(sec),'-i',str(media/f'{file}-v001.mp4'),'-frames:v','1','-q:v','2',str(dest)],check=True)
(out/'recortes-v001.json').write_text(json.dumps(records,ensure_ascii=False,indent=2),encoding='utf-8')
alignment = json.loads((out/'alinhamento-v001.json').read_text(encoding='utf-8'))
pages = []
words = []
groups = [
 [4,3,3], [2,4,3], [3,3,4,4], [3,4,3,2], [5,4,3], [4], [4,3,2], [4,3,5,5], [4,4,2], [4,4,4],
]
for s,counts in zip(alignment['scenes'],groups):
    clean=[]
    for w in s['words']:
        if not re.search(r'\w',w['text']):
            if clean:
                clean[-1]['text']+=w['text'].strip()
                clean[-1]['endMs']=w['endMs']
        else:
            clean.append(dict(w))
    words.extend(clean)
    assert sum(counts)==len(clean),(s['order'],len(clean),counts)
    cursor=0
    for count in counts:
        chunk=clean[cursor:cursor+count]
        pages.append({'text':' '.join(w['text'].strip() for w in chunk),'startMs':chunk[0]['startMs'],'endMs':chunk[-1]['endMs'],'timestampMs':None,'confidence':min(w['confidence'] for w in chunk),'scene':s['order']})
        cursor+=count
for i,page in enumerate(pages):
    # End the previous phrase in its pause rather than displaying the next word early.
    if page['text'].startswith('Não é'):
        page['startMs']=4720
    if page['text'].startswith('um sistema'):
        page['startMs']=9240
    if i and pages[i-1]['endMs']>page['startMs']:
        pages[i-1]['endMs']=page['startMs']
(code/'captions.json').write_text(json.dumps(pages,ensure_ascii=False,indent=2),encoding='utf-8')
(prod/'captions.words.json').write_text(json.dumps(words,ensure_ascii=False,indent=2),encoding='utf-8')
metadata={'duration':alignment['duration'],'frames':math.ceil(alignment['duration']*30),'fps':30,'width':1080,'height':1920,'audioSha256':sha(prod/'audio/narracao.mp3'),'captions':len(pages),'originalVoice':'untrimmed, unretimed, volume=1; no added music or effects'}
(code/'metadata.json').write_text(json.dumps(metadata,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(metadata,ensure_ascii=False))
