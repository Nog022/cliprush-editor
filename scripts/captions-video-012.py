import json,re
from pathlib import Path
a=json.loads(Path('out/video-012/alinhamento.json').read_text(encoding='utf-8'))
words=[]
for w in a['words']:
    if re.fullmatch(r'\W+',w['text'].strip()):
        if words: words[-1]['text']+=w['text'].strip()
    else: words.append(w.copy())
for w in words:
    if w['text'].strip()=='Só': w['startMs']=23980; w['endMs']=24180
    if w['text'].strip()=='que' and 23900<w['startMs']<24000: w['startMs']=24180
pages=[]; page=[]
for w in words:
    page.append(w)
    if len(page)>=4 or re.search(r'[.!?:]$',w['text']) or w is words[-1]:
        pages.append(page); page=[]
Path('src/videos/video-012/captions.json').write_text(json.dumps(pages,ensure_ascii=False,indent=2),encoding='utf-8')
print('Caption words',len(words),'pages',len(pages))
