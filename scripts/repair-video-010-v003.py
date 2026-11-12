from pathlib import Path
import json, hashlib, subprocess
from PIL import Image,ImageOps,ImageDraw
R=Path.cwd(); O=R/'out/video-010/reparo-v003'; O.mkdir(exist_ok=False)
paths=list((R/'public/videos/video-010').rglob('*'))+list((R/'src').rglob('*'))+list((R/'out/video-010').glob('*.mp4'))
manifest={str(p.relative_to(R)):hashlib.sha256(p.read_bytes()).hexdigest() for p in paths if p.is_file()}
(O/'preserved.json').write_text(json.dumps(manifest,indent=2))
imgs=list((R/'public/videos/video-010/imagens').glob('*.jpg'))
sheet=Image.new('RGB',(1600,1000),'#142020'); draw=ImageDraw.Draw(sheet)
for i,p in enumerate(imgs):
 x=i%2*800;y=i//2*250
 im=ImageOps.contain(Image.open(p).convert('RGB'),(790,218));sheet.paste(im,(x,y+30));draw.text((x+5,y+5),p.name,fill='white')
sheet.save(O/'oito-imagens.jpg')
from faster_whisper import WhisperModel
from faster_whisper.audio import decode_audio,pad_or_trim
from faster_whisper.tokenizer import Tokenizer
audio=decode_audio(str(R/'public/videos/video-010/audio/narracao.mp3'))
model=WhisperModel('large-v3',device='cpu',compute_type='int8',local_files_only=True)
tokenizer=Tokenizer(model.hf_tokenizer,model.model.is_multilingual,task='transcribe',language='pt')
script=(R/'public/videos/video-010/roteiro/roteiro.txt').read_text(encoding='utf-8')
text=script.split('GTA 6 vai superar Red Dead 2 na vida selvagem?',1)[1].split('NOTA:')[0]
text='GTA 6 vai superar Red Dead 2 na vida selvagem?'+text
chunks=text.strip().split('Agora olha Leonida!')
chunks=[chunks[0], 'Agora olha Leonida!'+chunks[1]]
offset=0; words=[]
for chunk in chunks:
 portion=audio[round(offset*16000):round((offset+29.8)*16000)]
 features=model.feature_extractor(portion)
 alignment=model.find_alignment(tokenizer,[tokenizer.encode(' '+chunk.strip())],model.encode(pad_or_trim(features)),min(features.shape[-1],3000))[0]
 for w in alignment:
  words.append(dict(text=w['word'],startMs=round((offset+w['start'])*1000),endMs=round((offset+w['end'])*1000),timestampMs=round((offset+(w['start']+w['end'])/2)*1000),confidence=w['probability']))
 offset=words[-1]['endMs']/1000
 print('Aligned through',offset,flush=True)
(R/'src/videos/video-010/captions-v003.json').write_text(json.dumps(words,ensure_ascii=False,indent=2),encoding='utf-8')
(O/'alignment.txt').write_text('\n'.join(f"{w['startMs']/1000:.2f}-{w['endMs']/1000:.2f} {w['text']}" for w in words),encoding='utf-8')
print((O/'alignment.txt').read_text(encoding='utf-8'),flush=True)
