"""Non-destructive local analysis: audio metadata, pauses, energy and word timing."""
import json
import math
import re
import subprocess
from pathlib import Path

import numpy as np
from faster_whisper import WhisperModel
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'src/videos/video-005'
OUT = ROOT / 'out/video-005'
AUDIO = ROOT / 'public/videos/video-005/audio/narracao.mp3'
SRC.mkdir(parents=True, exist_ok=True)
destination = SRC / 'alignment.json'
if destination.exists():
    raise SystemExit('Preserve the existing alignment before running again.')
probe = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-show_format', '-show_streams', '-of', 'json', str(AUDIO)]))
duration = float(probe['format']['duration'])
(SRC/'audio-probe.json').write_text(json.dumps(probe, indent=2), encoding='utf-8')
samples = np.frombuffer(subprocess.check_output(['ffmpeg', '-v', 'error', '-i', str(AUDIO), '-f', 'f32le', '-ac', '1', '-ar', '44100', 'pipe:1']), dtype='<f4')
silence = subprocess.run(['ffmpeg', '-hide_banner', '-i', str(AUDIO), '-af', 'silencedetect=noise=-34dB:d=0.12,volumedetect', '-f', 'null', 'NUL'], capture_output=True, text=True).stderr
(OUT/'narration-analysis.txt').write_text(silence, encoding='utf-8')
starts = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', silence)]
ends = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', silence)]
pauses = [{'start': a, 'end': b, 'duration': round(b-a,4)} for a,b in zip(starts,ends)]
hop = 4410
levels = []
for k in range(0,len(samples),hop):
    a = samples[k:k+hop]
    levels.append({'time':round(k/44100,3), 'rmsDb':round(float(20*np.log10(np.sqrt(np.mean(a*a))+1e-9)),2), 'peakDb':round(float(20*np.log10(np.max(np.abs(a))+1e-9)),2)})
(SRC/'audio-features.json').write_text(json.dumps({'durationSeconds':duration,'durationInFrames':math.ceil(duration*30),'fps':30,'pauses':pauses,'levels':levels},indent=2),encoding='utf-8')
wave = Image.new('RGB',(1600,480),'#080a12')
draw = ImageDraw.Draw(wave)
for second in range(math.ceil(duration)):
    x=round(second/duration*1560)+20
    draw.line((x,30,x,420),fill='#202c3c')
    draw.text((x,440),str(second),fill='white')
for item in levels:
    x=round(item['time']/duration*1560)+20
    height=max(0,(item['rmsDb']+60)/60)*360
    draw.line((x,420,x,420-height),fill='#00c8ff',width=3)
for pause in pauses:
    draw.rectangle((20+pause['start']/duration*1560,20,20+pause['end']/duration*1560,32),fill='#ffb765')
wave.save(OUT/'narration-energy.png')
print(json.dumps({'duration':duration,'frames':math.ceil(duration*30),'pauses':pauses},indent=2),flush=True)
model = WhisperModel('large-v3',device='cpu',compute_type='int8',local_files_only=True)
segments,_ = model.transcribe(str(AUDIO), language='pt',word_timestamps=True,beam_size=5,vad_filter=True,
    initial_prompt='Lucia. GTA seis. Liberty City. Leonida. Rockstar. ClipRush.')
result=[]
for segment in segments:
    print(f'{segment.start:.2f}-{segment.end:.2f}: {segment.text}',flush=True)
    result.append({'startMs':round(segment.start*1000),'endMs':round(segment.end*1000),'text':segment.text,
        'words':[{'text':w.word,'startMs':round(w.start*1000),'endMs':round(w.end*1000),'timestampMs':round((w.start+w.end)*500),'confidence':round(w.probability,4)} for w in segment.words or []]})
destination.write_text(json.dumps({'source':'videos/video-005/audio/narracao.mp3','method':'faster-whisper large-v3; CPU int8; local cache; word timestamps','segments':result},ensure_ascii=False,indent=2),encoding='utf-8')
