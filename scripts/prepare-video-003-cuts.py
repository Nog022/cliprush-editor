"""Local VAD + transcript protection; frame-aligned lossless PCM edit, originals untouched."""
import json
import math
import subprocess
import wave
from pathlib import Path
from faster_whisper.audio import decode_audio
from faster_whisper.vad import get_speech_timestamps, VadOptions

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'public/videos/video-003/gravacao.mp4'
OUTPUT = ROOT / 'public/videos/video-003/audio/voice-cut-v001.wav'
REPORT = ROOT / 'src/videos/video-003/cuts.json'
AUDIT = ROOT / 'out/video-003/audio-audit-v001.json'
if OUTPUT.exists() or REPORT.exists():
    raise SystemExit('Output exists; preserve it and select a new version.')
OUTPUT.parent.mkdir(parents=True, exist_ok=True)
AUDIT.parent.mkdir(parents=True, exist_ok=True)
probe = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-show_format', '-show_streams', '-of', 'json', str(SOURCE)]))
packets = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-select_streams', 'a', '-show_packets', '-show_entries', 'packet=pts_time,duration_time', '-of', 'json', str(SOURCE)]))['packets']
gaps = [i for i, (a, b) in enumerate(zip(packets, packets[1:])) if abs(float(b['pts_time']) - float(a['pts_time']) - float(a['duration_time'])) > .00001]
silence = subprocess.run(['ffmpeg', '-hide_banner', '-i', str(SOURCE), '-vn', '-af', 'silencedetect=noise=-36.82dB:d=0.5', '-f', 'null', '-'], capture_output=True, text=True, check=True).stderr
audio = decode_audio(str(SOURCE), sampling_rate=16000)
vad = [{'start': x['start'] / 16000, 'end': x['end'] / 16000} for x in get_speech_timestamps(audio, VadOptions(min_silence_duration_ms=650, speech_pad_ms=0))]
words = json.loads((ROOT / 'src/videos/video-003/captions.json').read_text(encoding='utf-8'))
protected = [w for w in words if not (w['startMs'] == 27160 and w['confidence'] < .1)]
spans = [(s['start'], s['end']) for s in vad] + [(w['startMs'] / 1000, w['endMs'] / 1000) for w in protected]
merged = []
for start, end in sorted(spans):
    # Preserve natural pauses up to 900 ms, including the final question / CTA.
    if merged and start - merged[-1][1] <= .9:
        merged[-1][1] = max(merged[-1][1], end)
    else:
        merged.append([start, end])
fps = 30
clips = []
cursor = 0
for start, end in merged:
    start_frame = max(0, math.floor((start - .16) * fps))
    end_frame = math.ceil((end + .16) * fps)
    length = end_frame - start_frame
    clips.append({'sourceStart': start_frame, 'sourceEnd': end_frame, 'from': cursor, 'duration': length})
    cursor += length
for w in protected:
    assert any(c['sourceStart'] / fps <= w['startMs'] / 1000 and c['sourceEnd'] / fps >= w['endMs'] / 1000 for c in clips), w
# Decode once; concatenate exact samples (1600 samples per frame at 48 kHz).
pcm = subprocess.check_output(['ffmpeg', '-v', 'error', '-i', str(SOURCE), '-map', '0:a:0', '-ar', '48000', '-ac', '2', '-c:a', 'pcm_s16le', '-f', 's16le', '-'])
chunks = [pcm[c['sourceStart'] * 1600 * 4:c['sourceEnd'] * 1600 * 4] for c in clips]
assert sum(map(len, chunks)) == cursor * 1600 * 4
with wave.open(str(OUTPUT), 'wb') as wav:
    wav.setnchannels(2)
    wav.setsampwidth(2)
    wav.setframerate(48000)
    wav.writeframes(b''.join(chunks))
report = {'fps': fps, 'durationInFrames': cursor, 'clips': clips}
REPORT.write_text(json.dumps(report, indent=2), encoding='utf-8')
original = float(probe['format']['duration'])
audit = {'originalSeconds': original, 'editedSeconds': cursor / fps, 'removedSeconds': original - cursor / fps, 'internalSplices': len(clips) - 1, 'audioPacketGaps': gaps, 'audioPacketCount': len(packets), 'vad': vad, 'protectedWords': len(protected), 'silencedetect': silence, **report}
AUDIT.write_text(json.dumps(audit, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps({k: v for k, v in audit.items() if k not in ['silencedetect', 'vad']}, indent=2))
