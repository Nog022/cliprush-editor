"""Inspect supplied media and align the supplied script locally; no retranscription."""
import hashlib
import json
import subprocess
from pathlib import Path
from PIL import Image, ImageDraw, ImageOps

R = Path.cwd()
M = R / 'public/videos/video-010'
O = R / 'out/video-010'
S = R / 'src/videos/video-010'
O.mkdir(parents=True, exist_ok=True)
S.mkdir(parents=True, exist_ok=True)
if not (O / 'preserved.json').exists():
    paths = [p for p in (R / 'src').rglob('*') if p.is_file() and 'video-010' not in p.parts]
    (O / 'preserved.json').write_text(json.dumps({str(p.relative_to(R)): hashlib.sha256(p.read_bytes()).hexdigest() for p in paths}))
    (O / 'Root.before.tsx').write_bytes((R / 'src/Root.tsx').read_bytes())
inventory = []
for p in M.rglob('*'):
    if p.suffix.lower() not in ['.mp4', '.mp3', '.jpg']:
        continue
    probe = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-show_format', '-show_streams', '-of', 'json', str(p)]))
    inventory.append({'file': p.relative_to(R / 'public').as_posix(), 'sha256': hashlib.sha256(p.read_bytes()).hexdigest(), 'probe': probe})
    print(p.name, probe['format'].get('duration'), flush=True)
    if p.suffix == '.mp4':
        times = list(range(2, int(float(probe['format']['duration'])) - 2, 3))
        sheet = Image.new('RGB', (1280, 204 * ((len(times) + 3) // 4)), '#11151e')
        draw = ImageDraw.Draw(sheet)
        for i, t in enumerate(times):
            jpg = O / f'{p.stem[:12]}-{t}.jpg'
            if not jpg.exists():
                subprocess.run(['ffmpeg', '-v', 'error', '-ss', str(t), '-i', str(p), '-frames:v', '1', '-vf', 'scale=320:180', '-n', str(jpg)], check=True)
            x, y = i % 4 * 320, i // 4 * 204
            sheet.paste(Image.open(jpg), (x, y + 24))
            draw.text((x + 8, y + 4), f'{t}s', fill='white')
        sheet.save(O / f'{p.stem[:12]}-sheet.jpg')
imgs = list((M / 'imagens').glob('*.jpg'))
sheet = Image.new('RGB', (1500, 330), '#11151e')
draw = ImageDraw.Draw(sheet)
for i, p in enumerate(imgs):
    sheet.paste(ImageOps.contain(Image.open(p).convert('RGB'), (500, 280)), (i * 500, 40))
    draw.text((i * 500 + 5, 8), p.name, fill='white')
sheet.save(O / 'images-sheet.jpg')
(S / 'inventory.json').write_text(json.dumps(inventory, indent=2), encoding='utf-8')
print('Contact sheets ready', flush=True)

if not (S / 'captions.json').exists():
    from faster_whisper import WhisperModel
    from faster_whisper.audio import decode_audio
    from faster_whisper.tokenizer import Tokenizer
    from faster_whisper.audio import pad_or_trim
    script = (M / 'roteiro/roteiro.txt').read_text(encoding='utf-8')
    clean = script.split('GTA 6 vai SUPERAR', 1)[1].split('============================================================', 1)[0]
    paragraphs = ('GTA 6 vai SUPERAR' + clean).strip().split('\n\n')
    chunks = [' '.join(paragraphs[:4]), ' '.join(paragraphs[4:])]
    model = WhisperModel('large-v3', device='cpu', compute_type='int8', local_files_only=True)
    tokenizer = Tokenizer(model.hf_tokenizer, model.model.is_multilingual, task='transcribe', language='pt')
    audio = decode_audio(str(M / 'audio/narracao.mp3'))
    offset = 0
    words = []
    for index, text in enumerate(chunks):
        portion = audio[round(offset * 16000):round((offset + 29) * 16000)]
        features = model.feature_extractor(portion)
        encoding = model.encode(pad_or_trim(features))
        alignment = model.find_alignment(tokenizer, [tokenizer.encode(' ' + text)], encoding, min(features.shape[-1], 3000))[0]
        for w in alignment:
            words.append({'text': w['word'], 'startMs': round((offset + w['start']) * 1000), 'endMs': round((offset + w['end']) * 1000), 'timestampMs': round((offset + (w['start'] + w['end']) / 2) * 1000), 'confidence': w['probability']})
        offset = words[-1]['endMs'] / 1000
        print('Aligned chunk', index, 'through', offset, flush=True)
    (S / 'captions.json').write_text(json.dumps(words, ensure_ascii=False, indent=2), encoding='utf-8')
    for w in words:
        print(f"{w['startMs']/1000:.2f}-{w['endMs']/1000:.2f} {w['text']}")
