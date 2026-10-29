"""Gera o snapshot editável das legendas sem substituir arquivos existentes."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'src/videos/video-001/ClipRushVideo001.tsx'
if OUTPUT.exists():
    raise SystemExit('A composição já existe; edite-a diretamente para preservar a revisão.')
captions = json.loads((ROOT / 'public/videos/video-001/captions/original-large.words.json').read_text(encoding='utf-8'))
# O large-v3 estendeu o artigo "A" sobre uma pausa de 3,9 s. O small e a
# detecção de silêncio posicionam a retomada em 31,56–31,72 s.
for word in captions:
    if word['text'] == ' A' and word['startMs'] == 27520:
        word.update(startMs=31560, endMs=31720, timestampMs=31640)
    elif word['text'] == ' reportagem':
        word.update(startMs=31720, timestampMs=31980)

shots = [
    ('Gancho · GTA VI', 'Opening', 0, 42, 237),
    ('EDGE · edição especial', 'EdgeStory', 237, 330, 219),
    ('Rockstar · visita dos jornalistas', 'RockstarStory', 456, 606, 237),
    ('Reportagem · entrevistas e GamesRadar', 'ReportStory', 693, 939, 258),
    ('Pergunta · mapa, gameplay ou história', 'Closing', 951, 1296, 366),
]
parts = ['''import { AbsoluteFill, Sequence, Track } from "remotion";
import { NeonCaptions } from "../../components/NeonCaptions";
import { Opening, EdgeStory, RockstarStory, ReportStory, Closing } from "./Scenes";
import { Brand, Progress, Stage } from "./Visuals";

// 30 fps; every shot shares its original source clock with its captions.
// Only pauses are removed. No time stretching or changes to spoken content.
export const ClipRushVideo001 = () => (
  <AbsoluteFill style={{ backgroundColor: "#050610", color: "white", fontFamily: "Arial, sans-serif", overflow: "hidden" }}>
    <Stage />
    <Track name="Rush · narração, vídeo e legendas">
''']
for name, component, start, trim, duration in shots:
    selected = [dict(word) for word in captions if trim / 30 * 1000 <= word['startMs'] < (trim + duration) / 30 * 1000]
    count = 0
    for index, word in enumerate(selected):
        count += 1
        next_word = selected[index + 1] if index + 1 < len(selected) else None
        if count >= 4 or word['text'].rstrip().endswith(('.', '!', '?', ',')) or next_word is None or next_word['startMs'] - word['endMs'] >= 300:
            word['pageBreakAfter'] = True
            count = 0
    array = json.dumps(selected, ensure_ascii=False, indent=2)
    from_prop = f' from={{{start}}}' if start else ''
    parts.append(f'''      <Sequence name="{name}"{from_prop} trimBefore={{{trim}}} durationInFrames={{{duration}}}>
        <{component} />
        <NeonCaptions name="Legendas · {component}" style={{{{ zIndex: 6 }}}} captions={{{array}}} />
      </Sequence>
''')
parts.append('''    </Track>
    <AbsoluteFill style={{ zIndex: 10, pointerEvents: "none" }}>
      <Brand />
      <Progress />
    </AbsoluteFill>
  </AbsoluteFill>
);
''')
OUTPUT.write_text(''.join(parts), encoding='utf-8')
print('Composição criada: 1317 frames / 43,9 s; 103 palavras com timestamps de origem.')
