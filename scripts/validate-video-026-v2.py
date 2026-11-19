"""Review the complete output cadence, media structure, audio and regression excerpts."""
import json, subprocess, struct
from pathlib import Path
import numpy as np

out=Path('deliveries/video-026-final-20261118-v2.mp4')
def run(args):
    return subprocess.check_output(args)
info=json.loads(run(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(out)]))
video=next(s for s in info['streams'] if s['codec_type']=='video')
audio=next(s for s in info['streams'] if s['codec_type']=='audio')
timing=json.loads(run(['ffprobe','-v','error','-select_streams','v:0','-show_entries','frame=best_effort_timestamp_time','-of','json',str(out)]))
pts=np.array([float(f['best_effort_timestamp_time']) for f in timing['frames']])
assert len(pts)==1410 and np.max(np.abs(np.diff(pts)-1/30))<.000002
raw=run(['ffmpeg','-v','error','-i',str(out),'-an','-vf','crop=1080:850:0:440,scale=240:160,format=gray','-f','rawvideo','-'])
images=np.frombuffer(raw,dtype=np.uint8).reshape(-1,160,240).astype(np.float32)
diff=np.mean(np.abs(np.diff(images,axis=0)),axis=(1,2))
assert len(images)==1410
boundaries=[0,63,123,201,309,369,471,552,705,894,1074,1248,1317,1410]
motion=[]
for a,b in zip(boundaries,boundaries[1:]):
    values=diff[a:b-1]
    motion.append({'startFrame':a,'endFrame':b-1,'meanMotion':float(values.mean()),'identicalFramePairs':int((values<.05).sum())})
references={}
for name,start in [('map',390),('animals-fast',765),('animals-normal',990)]:
    raw=run(['ffmpeg','-v','error','-i',f'out/video-026/motion-{name}-v2.mp4','-an','-vf','crop=1080:850:0:440,scale=240:160,format=gray','-f','rawvideo','-'])
    reference=np.frombuffer(raw,dtype=np.uint8).reshape(-1,160,240).astype(np.float32)
    delta=np.mean(np.abs(reference-images[start:start+len(reference)]),axis=(1,2))
    references[name]={'meanDifference':float(delta.mean()),'maxDifference':float(delta.max())}
    assert delta.max()<1, f'Cadence changed from tested reference: {name}'
def audio_hash(file):
    return run(['ffmpeg','-v','error','-i',str(file),'-map','0:a:0','-c','copy','-f','hash','-hash','sha256','-']).decode().strip()
preserved=audio_hash(out)==audio_hash('deliveries/video-026-final-20261118-v1.mp4')
assert preserved, 'Audio differs from approved edit'
boxes=[]
with out.open('rb') as f:
    while True:
        header=f.read(8)
        if len(header)<8: break
        size,kind=struct.unpack('>I4s',header)
        if size==1: size=struct.unpack('>Q',f.read(8))[0]; header+=b'12345678'
        boxes.append(kind.decode('ascii'))
        if not size: break
        f.seek(size-len(header),1)
assert boxes.index('moov')<boxes.index('mdat'), 'Faststart missing'
result={'frames':len(pts),'duration':info['format']['duration'],'resolution':[video['width'],video['height']],'fps':video['avg_frame_rate'],'videoCodec':video['codec_name'],'audioCodec':audio['codec_name'],'maxTimestampStepError':float(np.max(np.abs(np.diff(pts)-1/30))),'all13Blocks':motion,'testedReferences':references,'audioPacketsIdenticalToV1':preserved,'faststart':True,'bytes':out.stat().st_size}
Path('out/video-026/validation-v2.json').write_text(json.dumps(result,indent=2))
print(json.dumps(result))
