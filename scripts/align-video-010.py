import json
from pathlib import Path
from faster_whisper import WhisperModel
from faster_whisper.audio import decode_audio, pad_or_trim
from faster_whisper.tokenizer import Tokenizer

root = Path('public/videos/video-010')
audio = decode_audio(str(root/'audio/narracao.mp3'))
model = WhisperModel('large-v3', device='cpu', compute_type='int8', local_files_only=True)
tokenizer = Tokenizer(model.hf_tokenizer, model.model.is_multilingual, task='transcribe', language='pt')
# The sample established substantial divergence: reconstruct only the missing passages.
captions = []
for begin, end in [(0, 7), (7, 17), (17, 39.627755)]:
    segments, _ = model.transcribe(audio[round(begin*16000):round(end*16000)], language='pt', beam_size=5, word_timestamps=True, initial_prompt='GTA 6. Red Dead 2. Jason e Lucia. Rockstar.')
    for s in segments:
        print(round(s.start+begin, 2), round(s.end+begin, 2), s.text, flush=True)
        for w in s.words or []:
            captions.append({'text':w.word, 'startMs':round((begin+w.start)*1000), 'endMs':round((begin+w.end)*1000), 'timestampMs':round((begin+(w.start+w.end)/2)*1000), 'confidence':w.probability})
Path('src/videos/video-010/captions.json').write_text(json.dumps(captions, ensure_ascii=False, indent=2), encoding='utf-8')
Path('out/video-010/narracao-real.txt').write_text(' '.join(w['text'].strip() for w in captions), encoding='utf-8')
