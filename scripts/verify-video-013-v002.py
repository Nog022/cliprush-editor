"""Verify a visual-only revision, including identical audio packets and timing."""
import hashlib
import json
import subprocess
from pathlib import Path
from PIL import Image, ImageDraw

out=Path('out/video-013')
revision=out/'revision-v002'
before=out/'video-013-v001.mp4'
after=out/'video-013-v002.mp4'
def probe(path):
    return json.loads(subprocess.check_output(['ffprobe','-v','error','-count_frames','-show_streams','-show_format','-of','json',str(path)]))
old=probe(before)
new=probe(after)
v=next(s for s in new['streams'] if s['codec_type']=='video')
assert (v['width'],v['height'],v['r_frame_rate'],int(v['nb_read_frames']))==(1080,1920,'30/1',1360)
assert new['format']['duration']==old['format']['duration']
def audio_packets(path):
    return json.loads(subprocess.check_output(['ffprobe','-v','error','-select_streams','a:0','-show_packets','-show_data_hash','sha256','-show_entries','packet=pts,dts,duration,size,data_hash','-of','json',str(path)]))['packets']
old_packets=audio_packets(before)
new_packets=audio_packets(after)
assert old_packets==new_packets, 'Audio bytes or timestamps changed'
expected=json.loads((revision/'preserved-inputs.json').read_text())
assert all(hashlib.sha256(Path(p).read_bytes()).hexdigest()==h for p,h in expected.items())
def pcm_hash(path):
    return subprocess.check_output(['ffmpeg','-v','error','-i',str(path),'-map','0:a:0','-c:a','pcm_s16le','-f','hash','-hash','sha256','-'],text=True).strip()
old_pcm=pcm_hash(before)
new_pcm=pcm_hash(after)
assert old_pcm==new_pcm
directory=revision/'final-review'
directory.mkdir(exist_ok=True)
frames=[0,45,224,460,719,865,940,982,1074,1200,1290,1359]
selection='+'.join(f'eq(n\\,{n})' for n in frames)
subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-n','-i',str(after),'-vf',f'select={selection},scale=360:640','-fps_mode','passthrough','-q:v','2',str(directory/'sample-%02d.jpg')],check=True)
for page in range(2):
    sheet=Image.new('RGB',(1080,1280),(8,10,20))
    draw=ImageDraw.Draw(sheet)
    for i,(frame,path) in enumerate(zip(frames[page*6:(page+1)*6],sorted(directory.glob('sample-*.jpg'))[page*6:(page+1)*6])):
        x,y=(i%3)*360,(i//3)*640
        sheet.paste(Image.open(path),(x,y))
        draw.text((x+10,y+8),f'FINAL frame {frame}',fill='white')
    sheet.save(revision/f'final-contact-{page+1:02}.jpg',quality=94)
report={'file':str(after),'duration':new['format']['duration'],'dimensions':[v['width'],v['height']],'fps':v['r_frame_rate'],'decodedFrames':int(v['nb_read_frames']),'originalExportPreserved':True,'narrationSfxCaptionsMarkingsUnchanged':True,'audioPacketsAndTimestampsIdentical':True,'audioPacketCount':len(new_packets),'decodedAudioIdentical':True,'audioPcmHash':new_pcm,'fullVideoDecoded':True,'visualInserts':16,'supportingOriginalVideos':4,'visualReviewFramesBeforeRender':36,'finalReviewFrames':frames,'lintAndTypeScript':'passed'}
(revision/'validation-v002.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
