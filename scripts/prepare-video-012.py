"""Read existing catalogue and validate only the five supplied source ranges."""
import json
import subprocess
from pathlib import Path
from PIL import Image, ImageDraw

OUT = Path('out/video-012')
SOURCE = 'public/videos/biblioteca/gta6/videos/gta6-extended.mp4'
RANGES = [(842.260,852.050),(952.020,959.170),(984.180,989.040),(1072.120,1080.180),(1081.110,1088.130)]
def seconds(s):
    h,m,v = s.split(':')
    return int(h)*3600+int(m)*60+float(v)

records=json.loads((OUT/'catalogo-extended.json').read_text(encoding='utf-8'))
selected=[]
for a,b in RANGES:
    matches=[r for r in records if seconds(r['inicio'])<b and seconds(r['fim'])>a]
    selected.extend(matches)
    print(a,b,[(r['cena'],r.get('trecho'),r['inicio'],r['fim'],r['descricao']) for r in matches][:5])
(OUT/'catalogo-intervalos.json').write_text(json.dumps(selected,ensure_ascii=False,indent=2),encoding='utf-8')
subprocess.run(['python','scripts/buscar_cenas_gta6.py','homem|personagem','carro|veiculo','mulher|porta','--catalogo',str(OUT/'catalogo-intervalos.json'),'--limite','3'],stdout=(OUT/'busca-confirmacao.json').open('w',encoding='utf-8'),check=True)
for i,(a,b) in enumerate(RANGES):
    sheet=Image.new('RGB',(960,3*295),'#12121a')
    for j,t in enumerate([a+.2,(a+b)/2,b-.2]):
        f=OUT/f'original-{i+1}-{j}.jpg'
        subprocess.run(['ffmpeg','-v','error','-ss',str(t),'-i',SOURCE,'-frames:v','1','-q:v','2','-y',str(f)],check=True)
        im=Image.open(f); im.thumbnail((960,270)); sheet.paste(im,(0,j*295)); ImageDraw.Draw(sheet).text((8,j*295+272),f'SOURCE {t:.3f}s',fill='white')
    sheet.save(OUT/f'original-bloco-{i+1}.jpg')
