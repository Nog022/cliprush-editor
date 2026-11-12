"""Compare the actual corrected MP4 with already-reviewed composition stills."""
import json
import subprocess
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw

root = Path('out/video-011/correcao')
checks = [(30,'review-30-v3.png'), (220,'review-220-v2.png'),
          (700,'review-700.png'), (975,'review-975-v3.png'),
          (1060,'review-1060-v2.png'), (1190,'review-1190.png'),
          (1365,'review-1365.png')]
results = []
sheet = Image.new('RGB',(4*270,2*510),'#14141a')
draw = ImageDraw.Draw(sheet)
for i,(frame,reference) in enumerate(checks):
    output = root/f'mp4-corrigido-frame-{frame}.png'
    subprocess.run(['ffmpeg','-v','error','-n','-ss',str(frame/30),
                    '-i','out/ClipRush011-corrigido.mp4','-frames:v','1',
                    '-vf','scale=540:960',str(output)],check=True)
    actual = Image.open(output).convert('RGB')
    expected = Image.open(root/reference).convert('RGB')
    delta = np.abs(np.asarray(actual,dtype=np.int16)-np.asarray(expected,dtype=np.int16))
    error = float(delta.mean())
    assert error < 6, (frame,error)
    assert float(np.asarray(actual).mean()) > 7, f'Unexpected black frame: {frame}'
    results.append({'frame':frame,'reviewReference':reference,'mp4Frame':str(output),
                    'meanAbsolutePixelError0to255':round(error,4),'status':'PASS'})
    actual.thumbnail((270,480))
    x,y=i%4*270,i//4*510
    sheet.paste(actual,(x,y))
    draw.text((x+8,y+485),f'MP4 / frame {frame}',fill='white')
sheet.save(root/'comprovacao-mp4-corrigido.jpg')
(root/'comparacao-frames-mp4.json').write_text(json.dumps(results,indent=2),encoding='utf-8')
print(json.dumps(results,indent=2))
