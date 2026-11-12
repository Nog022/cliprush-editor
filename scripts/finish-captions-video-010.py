"""Correct a cut-boundary recognition artifact and keep hyphenated words together."""
from pathlib import Path
import json
import re
import subprocess
p = Path('src/videos/video-010/captions.json')
raw = json.loads(p.read_text(encoding='utf-8'))
clean = []
for word in raw:
    if word['startMs'] == 7000 and word['text'].strip() == '6.':
        continue
    word['text'] = word['text'].replace('Lucia', 'Lúcia')
    if word['text'].startswith('-') and clean:
        clean[-1]['text'] += word['text']
        clean[-1]['endMs'] = word['endMs']
        clean[-1]['timestampMs'] = (clean[-1]['startMs'] + word['endMs']) // 2
    else:
        clean.append(word)
# Word recognition tends to place the first word of a sentence inside the
# preceding pause. Use measured audio silence to prevent premature entrances.
detected = subprocess.run(['ffmpeg','-hide_banner','-i','public/videos/video-010/audio/narracao.mp3','-af','silencedetect=noise=-32dB:d=0.25','-f','null','NUL'],capture_output=True,text=True).stderr
starts = [float(x) for x in re.findall(r'silence_start: ([0-9.]+)', detected)]
ends = [float(x) for x in re.findall(r'silence_end: ([0-9.]+)', detected)]
for word in clean:
    for start, end in zip(starts, ends):
        # Only the word whose beginning falls in (or immediately before) a pause.
        if start*1000-60 <= word['startMs'] < end*1000 and word['endMs'] >= start*1000:
            word['startMs'] = round(end*1000)
            word['endMs'] = max(word['endMs'], word['startMs']+35)
    if clean.index(word) > 0:
        previous = clean[clean.index(word)-1]
        word['startMs'] = max(word['startMs'],previous['endMs'])
        word['endMs'] = max(word['endMs'],word['startMs']+35)
    word['timestampMs'] = (word['startMs']+word['endMs'])//2
p.write_text(json.dumps(clean, ensure_ascii=False, indent=2), encoding='utf-8')
Path('out/video-010/narracao-real.txt').write_text(''.join(w['text'] for w in clean).strip(),encoding='utf-8')
print(f'{len(clean)} caption tokens saved')
