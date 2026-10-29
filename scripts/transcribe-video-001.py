"""Transcrição local com faster-whisper já instalado; sem downloads automáticos."""
import json
import argparse
from pathlib import Path
from faster_whisper import WhisperModel

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / 'public/videos/video-001/captions'
parser = argparse.ArgumentParser()
parser.add_argument('--model', default='small')
parser.add_argument('--prefix', default='original')
args = parser.parse_args()
OUTPUT = TARGET / f'{args.prefix}.words.json'
if OUTPUT.exists():
    raise SystemExit('A transcrição já existe; preserve ou renomeie antes de gerar outra.')

model = WhisperModel(args.model, device='cpu', compute_type='int8', local_files_only=True)
segments, info = model.transcribe(
    str(ROOT / 'public/videos/video-001/footage/original.mp4'),
    language='pt', word_timestamps=True, beam_size=5, vad_filter=True,
    initial_prompt='ClipRush, Rush, GTA seis, Rockstar Games, GamesRadar.',
)
captions = []
transcript = []
for segment in segments:
    print(f'{segment.start:.2f}–{segment.end:.2f}: {segment.text}', flush=True)
    transcript.append({'start': segment.start, 'end': segment.end, 'text': segment.text})
    for word in segment.words or []:
        captions.append({
            'text': word.word, 'startMs': round(word.start * 1000),
            'endMs': round(word.end * 1000),
            'timestampMs': round((word.start + word.end) * 500),
            'confidence': round(word.probability, 4),
        })
TARGET.mkdir(parents=True, exist_ok=True)
OUTPUT.write_text(json.dumps(captions, ensure_ascii=False, indent=2), encoding='utf-8')
(TARGET / f'{args.prefix}.segments.json').write_text(
    json.dumps(transcript, ensure_ascii=False, indent=2), encoding='utf-8')
print(f'{len(captions)} palavras; timestamps relativos ao vídeo original.', flush=True)
