"""Refine sentence onsets against measured FFmpeg silence edges.

Whisper can attach silence to a short leading word. Preserve all spoken words,
move those leading words to the measured voice onset, and keep the full ASR raw.
"""
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
path = root / 'src/videos/video-004/captions.json'
captions = json.loads(path.read_text(encoding='utf-8'))
edits = {
    600: (922, 1180),
    5280: (5695, 5820), 5680: (5820, 6000), 5860: (6000, 6160),
    7260: (7485, 7674), 7580: (7868, 8100),
    9260: (9731, 9880), 9740: (9880, 10220),
    11860: (12219, 12300), 12200: (12300, 12820),
    15400: (15712, 15850), 15760: (15850, 16140),
    16140: (16525, 16600), 16540: (16600, 16960),
    20140: (20650, 20720), 20620: (20720, 20850), 20780: (20850, 21142),
    21160: (21521, 21590), 21500: (21590, 21800),
    24600: (24963, 25060), 25020: (25060, 25140),
    29120: (29494, 29650), 29520: (29650, 30147),
    30120: (30498, 30600), 30500: (30600, 31080),
    35000: (35430, 35590), 35520: (35590, 35680), 35680: (35680, 36159),
    36160: (36457, 36550), 36520: (36550, 36820),
    39240: (39240, 39750),
}
for word in captions:
    if word['startMs'] in edits:
        start, end = edits[word['startMs']]
        word.update(startMs=start, endMs=end, timestampMs=round((start+end)/2))
for i, word in enumerate(captions):
    assert word['startMs'] < word['endMs'], word
    if i:
        assert word['startMs'] >= captions[i-1]['endMs'], (captions[i-1],word)
path.write_text(json.dumps(captions,ensure_ascii=False,indent=2),encoding='utf-8')
print(f'{len(captions)} words; {len(edits)} onset/end refinements; no overlap.')
