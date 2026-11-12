"""Versioned local sound design; never edits narration or existing assets."""
import json
import math
import random
import struct
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
AUDIO = ROOT / 'public/videos/video-012/audio'
SR = 48000


def write(name, seconds, sample):
    path = AUDIO / name
    if path.exists():
        return
    with wave.open(str(path), 'wb') as output:
        output.setnchannels(1)
        output.setsampwidth(2)
        output.setframerate(SR)
        output.writeframes(b''.join(struct.pack('<h', round(max(-1, min(1, sample(n / SR))) * 32767)) for n in range(round(seconds * SR))))


def bed(t):
    envelope = min(1, t / 1.5, (52.2 - t) / 1.8)
    pulse = (.5 + .5 * math.sin(2 * math.pi * 1.6 * t)) ** 8
    return envelope * (.014 * math.sin(2 * math.pi * 55 * t) + .008 * math.sin(2 * math.pi * 82.41 * t) + .018 * pulse * math.sin(2 * math.pi * 110 * t))


write('trilha-refinada-v002.wav', 52.2, bed)
write('clique-v002.wav', .3, lambda t: .10 * min(1, t / .006) * math.exp(-t * 38) * (math.sin(2 * math.pi * 860 * t) + .25 * math.sin(2 * math.pi * 1290 * t)))
write('impacto-v002.wav', .8, lambda t: .13 * min(1, t / .012) * math.exp(-t * 9) * math.sin(2 * math.pi * (115 * t - 36 * t * t)))
rng = random.Random(12)
write('transicao-v002.wav', .5, lambda t: .065 * math.sin(math.pi * t / .5) ** 2 * (rng.random() * 2 - 1))

# Regroup weak one-word pages, keeping every original word and timestamp intact.
path = ROOT / 'src/videos/video-012/captions.json'
pages = json.loads(path.read_text(encoding='utf-8-sig'))
original = [word for page in pages for word in page]
result = []
for page in pages:
    if len(page) == 1 and result and len(result[-1]) + 1 <= 5 and page[0]['startMs'] - result[-1][-1]['endMs'] < 250:
        result[-1].extend(page)
    else:
        result.append(page)
assert [word for page in result for word in page] == original
path.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(f'Audio assets ready; {len(pages)} -> {len(result)} caption pages; word timing preserved.')
