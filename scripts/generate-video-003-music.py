"""Original 110 BPM instrumental: local oscillators/noise only; no samples/APIs."""
import json
import wave
from pathlib import Path
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / 'public/videos/video-003/audio/cliprush-trilha-original.wav'
if DEST.exists():
    raise SystemExit('Music exists; choose a new filename instead of overwriting.')
cuts = json.loads((ROOT / 'src/videos/video-003/cuts.json').read_text())
sr = 48000
fps = cuts['fps']
duration = cuts['durationInFrames'] / fps
count = round(duration * sr)
beat = 60 / 110
rng = np.random.default_rng(3003)
mix = np.zeros((count, 2), dtype=np.float64)

def hz(note):
    return 440 * 2 ** ((note - 69) / 12)

def add(start, signal, gain=1, pan=0):
    start = round(start * sr)
    if start >= count:
        return
    n = min(len(signal), count - start)
    left = np.sqrt((1 - pan) / 2)
    right = np.sqrt((1 + pan) / 2)
    mix[start:start+n, 0] += signal[:n] * gain * left
    mix[start:start+n, 1] += signal[:n] * gain * right

def clock(seconds):
    return np.arange(round(seconds * sr)) / sr

def envelope(t, attack, release):
    return np.minimum(t / attack, 1) * np.minimum((t[-1] - t) / release, 1).clip(0)

# Harmonic bed: A minor add9 / F major7 / C add9 / E sus, sparse and original.
chords = [[45,52,59,60], [41,48,52,57], [48,55,59,62], [40,47,52,57]]
roots = [33,29,36,28]
bars = int(np.ceil(duration / (4 * beat)))
for bar in range(bars):
    start = bar * 4 * beat
    chord = chords[(bar // 2) % 4]
    t = clock(4 * beat + .5)
    pad = sum((np.sin(2*np.pi*hz(n)*t + .08*np.sin(2*np.pi*.19*t)) + .18*np.sin(2*np.pi*hz(n)*2.003*t)) for n in chord) / 5
    add(start, pad * envelope(t,.6,.75), .09, (-1 if bar % 2 else 1)*.3)
    for step in range(8):
        at = start + step * beat / 2
        t = clock(beat * .8)
        note = chord[[0,2,1,3,2,1,3,1][step]] + 12
        pluck = (np.sin(2*np.pi*hz(note)*t) + .2*np.sin(2*np.pi*hz(note)*2*t)) * np.exp(-t*12) * np.minimum(t/.008,1)
        energy = .026 if at < 24 else .038
        add(at, pluck, energy, (-.5 if step % 2 else .5))
    for pulse in range(4):
        at = start + pulse * beat
        t = clock(beat * .88)
        f = hz(roots[(bar // 2) % 4])
        bass = (np.sin(2*np.pi*f*t) + .14*np.sin(4*np.pi*f*t)) * envelope(t,.018,.12)
        add(at, bass, .11 if at > 3 else .055)
        if at < 2 or 24 < at < 26:
            continue
        t = clock(.26)
        phase = 2*np.pi*(48*t + (112-48)*.026*(1-np.exp(-t/.026)))
        kick = np.sin(phase)*np.exp(-t*18)*np.minimum(t/.003,1)
        add(at, kick, .19)
        if pulse in [1,3]:
            t=clock(.18)
            noise=rng.standard_normal(len(t))
            high=noise-np.convolve(noise,np.ones(13)/13,mode='same')
            snare=(high*.3+np.sin(2*np.pi*180*t)*.25)*np.exp(-t*28)*np.minimum(t/.003,1)
            add(at,snare,.055,.1)
        for off in [.5, .75] if bar > 5 else [.5]:
            t=clock(.065)
            noise=rng.standard_normal(len(t))
            high=noise-np.convolve(noise,np.ones(7)/7,mode='same')
            add(at+off*beat, high*np.exp(-t*80)*np.minimum(t/.002,1), .015, -.35 if pulse%2 else .35)

def source_to_edit(seconds):
    frame=seconds*fps
    for c in cuts['clips']:
        if c['sourceStart'] <= frame < c['sourceEnd']:
            return (c['from'] + frame-c['sourceStart'])/fps
    return None

# Accents land on the four-level reveal, marriage question, and final question.
accents=[source_to_edit(s) for s in [14.08,35.89,51.58]]
for at in [0] + [x for x in accents if x is not None]:
    t=clock(.85)
    hit=(np.sin(2*np.pi*(55*t+1.5*(1-np.exp(-t*6))))+.1*rng.standard_normal(len(t)))*np.exp(-t*7)*np.minimum(t/.006,1)
    add(at,hit,.13)
    if at > 1:
        t=clock(.65)
        riser=np.sin(2*np.pi*(220*t+180*t*t))*envelope(t,.5,.08)
        add(at-.65,riser,.018,-.3)
# Short ending cadence, with its tail contained inside the composition.
for offset,note in [(1.25,64),(.95,59),(.65,57)]:
    t=clock(offset)
    add(duration-offset,np.sin(2*np.pi*hz(note)*t)*np.exp(-t*5)*np.minimum(t/.012,1),.035,.2)
# Quiet stereo delay, no external reverb or recordings.
delay=round(.375*beat*sr)
mix[delay:] += mix[:-delay,::-1].copy()*.14
mix=np.tanh(mix*1.3)
mix *= .72 / max(np.max(np.abs(mix)),1e-9)
time=np.arange(count)/sr
mix *= (np.minimum(time/.25,1)*np.minimum((duration-time)/.9,1).clip(0))[:,None]
pcm=np.round(mix*32767).astype('<i2')
with wave.open(str(DEST),'wb') as out:
    out.setnchannels(2);out.setsampwidth(2);out.setframerate(sr);out.writeframes(pcm.tobytes())

# Per-frame look-ahead ducking on the edited timeline. Raw music stays replaceable.
words=json.loads((ROOT/'src/videos/video-003/captions.json').read_text())
speech=[]
for w in words:
    if w['startMs']==27160 and w['confidence']<.1:
        continue
    start=source_to_edit(w['startMs']/1000)
    end=source_to_edit(w['endMs']/1000)
    if start is not None and end is not None:
        speech.append((start,end))
gains=[]
for frame in range(cuts['durationInFrames']):
    at=frame/fps
    activity=max([max(0,min(1,(at-(s-.12))/.08,(e+.28-at)/.25)) for s,e in speech] or [0])
    gains.append(round(.19-(.19-.105)*activity,5))
config={'file':'audio/cliprush-trilha-original.wav','bpm':110,'durationInFrames':cuts['durationInFrames'],'gainByFrame':gains,'accentsSeconds':accents}
(ROOT/'src/videos/video-003/music.json').write_text(json.dumps(config,indent=2))
voicepath=ROOT/'public/videos/video-003/audio/voice-cut-v001.wav'
with wave.open(str(voicepath),'rb') as v:
    voice=np.frombuffer(v.readframes(v.getnframes()),dtype='<i2').reshape(-1,2)/32768
automation=np.repeat(gains,sr//fps)[:count]
music=pcm.astype(float)/32768*automation[:,None]
combined=voice+music
def db(x): return float(20*np.log10(max(float(x),1e-12)))
active=np.repeat([any(s<=f/fps<=e for s,e in speech) for f in range(cuts['durationInFrames'])],sr//fps)
metrics={'durationSeconds':duration,'sampleRate':sr,'samplesPerChannel':count,'bpm':110,'musicPeakDbFS':db(np.max(np.abs(music))),'musicRmsDbFS':db(np.sqrt(np.mean(music**2))),'voiceRmsDuringSpeechDbFS':db(np.sqrt(np.mean(voice[active]**2))),'musicRmsDuringSpeechDbFS':db(np.sqrt(np.mean(music[active]**2))),'mixedPeakDbFS':db(np.max(np.abs(combined))),'clippedSamples':int(np.sum(np.abs(combined)>=1))}
assert metrics['clippedSamples']==0
review=ROOT/'out/video-003/music-review';review.mkdir(parents=True,exist_ok=True)
(review/'mix-metrics.json').write_text(json.dumps(metrics,indent=2))
print(json.dumps(metrics,indent=2))
