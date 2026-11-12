"""Build caption cache, source audit and edit map for video-015 only."""
import hashlib
import json
import math
import re
import shutil
from pathlib import Path

root = Path(__file__).resolve().parents[1]
prod = root / 'public/videos/video-015'
code = root / 'src/videos/video-015'
out = root / 'out/video-015'
code.mkdir(parents=True, exist_ok=True)
(prod / 'fonts').mkdir(exist_ok=True)
(prod / 'stills').mkdir(exist_ok=True)
shutil.copyfile('C:/Windows/Fonts/arialbd.ttf', prod / 'fonts/Arial-Bold.ttf')
for name, index in [('A', 3), ('B', 4)]:
    shutil.copyfile(out / f'source-{name}-{index}-v001.jpg', prod / f'stills/{name}-v001.jpg')
alignment = json.loads((out / 'alinhamento-v001.json').read_text(encoding='utf-8'))
words = []
pages = []
for scene in alignment['scenes']:
    current = []
    for word in scene['words']:
        if not re.search(r'\w', word['text']):
            if current:
                current[-1]['text'] += word['text'].strip()
                current[-1]['endMs'] = word['endMs']
            elif words:
                words[-1]['text'] += word['text'].strip()
            continue
        current.append(dict(word))
    words.extend(current)
    # Short phrase groups, authored against the supplied approved wording.
    counts = [[3,4,5], [3,4,3,4,5], [3,3,4,3,4], [3,4,3,4,4,3], [4,3], [4,3,3,3], [4,3,3,3], [4,3,3,4]][scene['order']-1]
    offset = 0
    for count in counts:
        chunk = current[offset:offset+count]
        if not chunk:
            continue
        pages.append({'text': ' '.join(w['text'].strip() for w in chunk), 'startMs': chunk[0]['startMs'], 'endMs': chunk[-1]['endMs'], 'timestampMs': None, 'confidence': min(w['confidence'] for w in chunk)})
        offset += count
    if offset < len(current):
        chunk = current[offset:]
        pages.append({'text': ' '.join(w['text'].strip() for w in chunk), 'startMs': chunk[0]['startMs'], 'endMs': chunk[-1]['endMs'], 'timestampMs': None, 'confidence': min(w['confidence'] for w in chunk)})
for i, page in enumerate(pages):
    next_start = pages[i+1]['startMs'] if i+1 < len(pages) else alignment['duration']*1000
    page['endMs'] = min(next_start, max(page['endMs'], page['startMs']+280))
    if page['text'].startswith('mas não'):
        # The aligner assigned the preceding pause to "mas"; measured onset 9.321s.
        page['startMs'] = 9320
        pages[i-1]['endMs'] = 9320
(code / 'captions.json').write_text(json.dumps(pages, ensure_ascii=False, indent=2), encoding='utf-8')
(prod / 'captions.words.json').write_text(json.dumps(words, ensure_ascii=False, indent=2), encoding='utf-8')
audio = prod / 'audio/narracao.mp3'
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
audit = {
    'audioDurationDecoded': alignment['duration'], 'compositionFrames': math.ceil(alignment['duration']*30),
    'audioSha256': sha(audio), 'audioProcessing': 'Original asset at 1x, gain 1; no cut, trim, stretch, music or SFX.',
    'sourceA': {'path': 'videos/biblioteca/gta6/videos/gta6-extended.mp4', 'in': '00:17:24:07', 'outExclusive': '00:17:26:00', 'startFrame': 31327, 'frames': 53, 'fps': 30, 'catalogScene': 155},
    'sourceB': {'path': 'videos/biblioteca/gta6/videos/Grand Theft Auto VI： Pré-carregue agora [sXCiA142w8Y].webm', 'in': '00:00:04:18', 'outExclusive': '00:00:06:02', 'startFrame': 138, 'frames': 44, 'fps': 30, 'catalogScene': None, 'note': 'Exact filename found in library; absent from JSON. Verified visually; catalog untouched.'},
    'comparison': {'from': 711, 'toExclusive': 786, 'rateA': 1, 'rateB': 1, 'sourceTakeoffApproxA': 16, 'sourceTakeoffApproxB': 22, 'delayA': 6, 'revealFrames': 10, 'note': 'Only pre/post endpoint holds to align takeoff; active motion remains 1x. No looping.'},
    'limitations': ['Source B has embedded subtitles and cinematic bars. Its original framing already clips extremities during parts of the gesture; do not add vertical cropping.', 'Correction, gameplay and cinematic classification remain hypotheses.'],
}
(out / 'fontes-e-tempos-v001.json').write_text(json.dumps(audit, ensure_ascii=False, indent=2), encoding='utf-8')
baseline = out / 'preservacao-v001.json'
if not baseline.exists():
    files = [root / 'src/Composition.tsx'] + [p for p in (root / 'src/videos').rglob('*') if p.is_file() and 'video-015' not in p.parts]
    baseline.write_text(json.dumps({str(p.relative_to(root)).replace('\\','/'): sha(p) for p in files}, indent=2), encoding='utf-8')
    shutil.copyfile(root / 'src/Root.tsx', out / 'Root-antes-v001.tsx')
print(json.dumps({'duration': alignment['duration'], 'frames': audit['compositionFrames'], 'captionPages': len(pages), 'captionWords': len(words)}, ensure_ascii=False))
