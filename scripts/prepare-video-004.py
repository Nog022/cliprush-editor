"""Generate original deterministic synth music, effects and caption data. No downloads."""
import json
import math
import subprocess
import wave
from pathlib import Path

import numpy as np
from scipy.signal import butter, sosfilt

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'src/videos/video-004'
AUDIO = ROOT / 'public/videos/video-004/audio'
RATE = 44100
DURATION = 39.967313
N = math.ceil(DURATION * RATE)
rng = np.random.default_rng(4004)

def save(name, signal):
    path = AUDIO / name
    if path.exists():
        raise RuntimeError(f'Preserve existing audio: {path}')
    with wave.open(str(path), 'wb') as out:
        out.setnchannels(2)
        out.setsampwidth(2)
        out.setframerate(RATE)
        out.writeframes((np.clip(signal, -.96, .96) * 32767).astype('<i2').tobytes())

def add(dst, at, sound, pan=0):
    start = round(at * RATE)
    length = min(len(sound), N - start)
    if length <= 0:
        return
    gains = np.array([math.sqrt((1 - pan) / 2), math.sqrt((1 + pan) / 2)])
    dst[start:start+length] += sound[:length, None] * gains

voice = np.frombuffer(subprocess.check_output(['ffmpeg', '-v', 'error', '-i',
    str(AUDIO / 'narracao.mp3'), '-ar', str(RATE), '-ac', '1', '-f', 'f32le', 'pipe:1']), dtype='<f4')
music = np.zeros((N, 2), dtype=np.float64)
beat = 60 / 108
# A minor / F / C / G. An original short synth cue, not a sample or cloned song.
roots = [45, 41, 48, 43]
for i, start in enumerate(np.arange(0, DURATION, beat / 2)):
    chord = roots[int(start // (beat * 4)) % 4]
    note = chord + [12, 19, 24, 15, 19, 24, 22, 19][i % 8]
    f = 440 * 2 ** ((note - 69) / 12)
    t = np.arange(round(.47 * RATE)) / RATE
    env = (1 - np.exp(-t * 100)) * np.exp(-t * 9)
    synth = (np.sin(2*np.pi*f*t) + .22*np.sin(2*np.pi*f*2*t) + .1*np.sin(2*np.pi*f*3*t)) * env
    intensity = .75 if start < 11.8 else 1.15 if start < 15.6 else .9 if start < 20.45 else 1 if start < 29.3 else .6 if start < 35.2 else 1.2
    add(music, start, synth * .075 * intensity, .45 if i % 2 else -.45)
    if i % 2 == 0:
        bass_t = np.arange(round(.43 * RATE)) / RATE
        bass_f = 440 * 2 ** ((chord - 12 - 69) / 12)
        bass = np.sin(2*np.pi*bass_f*bass_t) * (1-np.exp(-bass_t*90)) * np.exp(-bass_t*7)
        add(music, start, bass * .14 * intensity)
        kick = np.sin(2*np.pi*(44*bass_t + 14*(1-np.exp(-bass_t*30)))) * np.exp(-bass_t*20)
        add(music, start, kick * .12 * intensity)
    if i % 4 == 2:
        t = np.arange(round(.13 * RATE)) / RATE
        noise = sosfilt(butter(2, [1500, 6000], 'bandpass', fs=RATE, output='sos'), rng.normal(size=len(t)))
        add(music, start, noise * np.exp(-t*45) * .025)
for bar, start in enumerate(np.arange(0, DURATION, beat*4)):
    t = np.arange(round(beat*4*RATE)) / RATE
    root = roots[bar % 4]
    pad = sum(np.sin(2*np.pi*(440*2**((root+offset-69)/12))*t + .15*np.sin(t*2)) for offset in [12, 15, 19]) / 3
    env = np.minimum(t/.4,1) * np.minimum((len(t)/RATE-t)/.6,1)
    add(music, start, pad * env * .028, -.2)
# Offline RMS envelope ducks the real music file under speech, including scrubbing.
hop = 441
levels = np.array([np.sqrt(np.mean(voice[k:k+hop] ** 2)) for k in range(0,len(voice),hop)])
levels = np.interp(np.arange(N), np.arange(len(levels))*hop, levels)
envelope = sosfilt(butter(1, 8, fs=RATE, output='sos'), levels)
duck = .24 + .76 * (1 - np.clip(envelope/.035,0,1))
music *= duck[:, None]
timeline = np.arange(N)/RATE
music *= (np.minimum(timeline/.3,1) * np.clip((DURATION-timeline)/.35,0,1))[:,None]
save('cliprush-004-original-score-v001.wav', music)

effects = np.zeros((N,2))
events = [(.05,'sweep'), (.6,'click'), (2.54,'impact'), (5.5,'sweep'),
    (8.52,'confirm'), (9.5,'reverse'), (12.2,'click'), (13.06,'flip'), (14.16,'confirm'),
    (15.6,'sweep'), (17.7,'click'), (19.5,'confirm'), (20.45,'sweep'), (21.5,'tick'),
    (23.08,'confirm'), (25.14,'sweep'), (27.1,'confirm'), (29.3,'alert'),
    (30.5,'impact'), (33.6,'tick'), (35.2,'sweep'), (37.16,'alert'), (38.68,'click')]
for at, kind in events:
    duration = .65 if kind in ['sweep','reverse','impact'] else .3
    t = np.arange(round(duration*RATE))/RATE
    if kind == 'impact':
        sound = np.sin(2*np.pi*(39*t + 12*(1-np.exp(-t*15))))*np.exp(-t*10)*.085
    elif kind in ['sweep','reverse','flip']:
        noise = sosfilt(butter(2,[500,6500],'bandpass',fs=RATE,output='sos'),rng.normal(size=len(t)))
        sound = noise * np.sin(np.pi*t/duration)**2 * .027
        sound += np.sin(2*np.pi*(280*t+900*t*t))*np.sin(np.pi*t/duration)**2*.012
    elif kind == 'confirm':
        sound = (np.sin(2*np.pi*660*t)+.5*np.sin(2*np.pi*990*t))*np.exp(-t*22)*.026
    elif kind == 'alert':
        sound = np.sin(2*np.pi*330*t)*np.exp(-t*17)*.035
    else:
        sound = np.sin(2*np.pi*1700*t)*np.exp(-t*90)*.035
    add(effects,at,sound, -.2 if int(at)%2 else .2)
save('cliprush-004-original-sfx-v001.wav',effects)

alignment = json.loads((SRC/'alignment.json').read_text(encoding='utf-8'))
words = [w.copy() for s in alignment['segments'] for w in s['words']]
# Correct typography only. Preserve the transcription's measured word intervals.
for w in words:
    if w['text'].strip() == 'seis': w['text'] = ' 6'
    if w['text'].strip() == 'cinco': w['text'] = ' 5'
    w['confidence'] = None
# Join hyphenated pieces so a caption never breaks at the hyphen.
merged = []
for w in words:
    if w['text'].startswith('-') and merged:
        merged[-1]['text'] += w['text']
        merged[-1]['endMs'] = w['endMs']
    else: merged.append(w)
(SRC/'captions.json').write_text(json.dumps(merged,ensure_ascii=False,indent=2),encoding='utf-8')
(SRC/'sound-design.json').write_text(json.dumps({'sampleRate':RATE,'durationSeconds':DURATION,
    'seed':4004,'tempoBpm':108,'method':'Original additive / subtractive synthesis, numpy + scipy; speech RMS ducking baked into score',
    'events':[{'seconds':at,'kind':kind} for at,kind in events],
    'musicPeakDb':round(20*np.log10(np.max(np.abs(music))),2),
    'sfxPeakDb':round(20*np.log10(np.max(np.abs(effects))),2)},indent=2),encoding='utf-8')
print('Created original score, original effects and caption JSON. Narration preserved.')
