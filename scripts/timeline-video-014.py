"""Build captions and an auditable edit map from the cached forced alignment."""
import json
import math
import re
from pathlib import Path

root = Path('public/videos/video-014')
src = Path('src/videos/video-014')
src.mkdir(parents=True,exist_ok=True)
out = Path('out/video-014')
alignment = json.loads((out/'alinhamento-v001.json').read_text(encoding='utf-8'))
marks = json.loads((root/'roteiro/marcacoes.json').read_text(encoding='utf-8'))
bounds=[0,221,434,668,899,1101,1319,1514,math.ceil(alignment['duration']*30)]
# Piecewise manual tracks measured in original 1920x1080 frames, normalized.
# Each tuple: local source frame, target x, target y. No inferred coordinates.
tracks=[
 [[0,.51,.32],[21,.51,.32],[42,.49,.34],[53,.47,.41],[63,.455,.55],[84,.445,.57],[105,.445,.585]],
 [[0,.72,.40],[12,.56,.36],[16,.51,.34],[33,.50,.36],[41,.48,.37],[49,.44,.39],[66,.52,.40],[82,.69,.49]],
 [[0,.45,.56],[12,.46,.53],[27,.42,.54],[40,.44,.53],[53,.47,.57]],
 [[0,.47,.64],[25,.49,.64],[49,.50,.65],[74,.51,.65],[98,.50,.65]],
 [[0,.83,.44],[15,.83,.46],[30,.81,.55],[46,.80,.65],[61,.84,.72],[76,.84,.76]],
 [[0,.64,.57],[25,.66,.58],[42,.67,.64],[63,.72,.68],[82,.69,.70],[101,.69,.73],[126,.69,.62]],
 [[0,.64,.57],[20,.60,.58],[40,.62,.57],[51,.52,.55],[61,.49,.48],[74,.48,.38],[81,.36,.40],[101,.17,.45]],
 [[0,.625,.53],[41,.635,.535],[82,.635,.54],[123,.63,.54],[164,.63,.55],[205,.625,.56]],
]
# [output-local start, duration, source-local start, advance per output frame,
# framing mode, label]. Only 1x playback; pauses are labelled and intentional.
plans=[
 [[0,106,0,1,'context','CONTEXTO · 1×'],[106,106,0,1,'focus','REPLAY · TELA DO CELULAR'],[212,9,105,0,'focus','PAUSA · TELA ACESA']],
 [[0,83,0,1,'context','CONTEXTO · 1×'],[83,27,41,0,'focus','PAUSA · JANELA DA VIATURA'],[110,83,0,1,'focus','REPLAY · OLHE A JANELA'],[193,20,49,0,'focus','PAUSA · DETALHE']],
 [[0,76,0,0,'context','PAUSA · LOCALIZE OS DOIS'],[76,54,0,1,'context','CONTEXTO · 1×'],[130,21,27,0,'focus','PAUSA · ARMA ERGUIDA'],[151,54,0,1,'focus','REPLAY · JASON E LUCIA'],[205,29,27,0,'focus','PAUSA · OBSERVE O GESTO']],
 [[0,99,0,1,'context','CONTEXTO · 1×'],[99,12,49,0,'focus','PAUSA · OLHE O TRONCO'],[111,99,0,1,'focus','REPLAY · DOBRAS DO TECIDO'],[210,21,80,0,'focus','PAUSA · TECIDO']],
 [[0,77,0,1,'context','CONTEXTO · 1×'],[77,22,30,0,'focus','PAUSA · OLHE AS FOLHAS'],[99,77,0,1,'focus','REPLAY · COPA DAS ÁRVORES'],[176,26,61,0,'focus','PAUSA · FOLHAS']],
 [[0,127,0,1,'context','CONTEXTO · 1×'],[127,65,25,1,'focus','REPLAY · ABERTURA E LUZ'],[192,26,70,0,'focus','PAUSA · INTERIOR ILUMINADO']],
 [[0,102,0,1,'context','CONTEXTO · 1×'],[102,74,0,1,'focus','REPLAY · ACOMPANHE A RODA'],[176,19,51,0,'focus','PAUSA · RODA ATINGIDA']],
 [[0,206,0,1,'adaptive','CONTEXTO → MÃOS E MESA'],[206,101,80,1,'focus','REPLAY · CARTÃO E MATERIAL'],[307,19,160,0,'focus','PAUSA · QUAL PASSOU BATIDO?']],
]
headlines=[['OLHA ESSE','CELULAR'],['OLHA A','JANELA'],['JASON E','LUCIA'],['REPARA NO','TECIDO'],['OLHA AS','ÁRVORES'],['OLHA A','GELADEIRA'],['REPARA NO','PNEU'],['CARTÃO','E PÓ']]
proofs=[['A TELA','CONTINUA ACESA'],['DISPARO DA','VIATURA'],['ELE LEVANTA','A ARMA'],['A BLUSA','SE AJUSTA'],['AS FOLHAS','BALANÇAM'],['A LUZ','ACENDE'],['O PNEU','É ATINGIDO'],['O MATERIAL','ACOMPANHA']]
reveal=[151,120,78,84,121,121,137,186]
zooms=[1.26,1.24,1.30,1.24,1.20,1.27,1.30,1.32]
# Base crop widths before the storyboard's modest animated zoom; an independent
# full-source context panel always accompanies this detail view.
crop_width=[800,960,1500,1080,1280,1200,1300,680]
scenes=[]
for i,(m,a) in enumerate(zip(marks['scenes'],alignment['scenes'])):
    duration=bounds[i+1]-bounds[i]
    assert sum(p[1] for p in plans[i])==duration,(i,duration,plans[i])
    assert all(0<=p[2] and p[2]+max(0,p[1]-1)*p[3]<m['sourceDurationFramesAtNominalFps'] for p in plans[i])
    words=[]
    for w in a['words']:
        if re.fullmatch(r'\s*[^\w\s]+',w['text']):
            if words: words[-1]['text']+=w['text'].strip()
            continue
        words.append(dict(w))
    pages=[];page=[]
    for w in words:
        if page and (len(page)==4 or len(' '.join(x['text'].strip() for x in page))+len(w['text'])>30 or w['startMs']-page[-1]['endMs']>300):
            pages.append(page);page=[]
        page.append(w)
        if re.search(r'[.!?:]$',w['text'].strip()) and len(page)>=2:
            pages.append(page);page=[]
    if page: pages.append(page)
    scenes.append({'order':i+1,'from':bounds[i],'duration':duration,'count':m['sourceDurationFramesAtNominalFps'],'sourceStart':m['sourceInTimecode'],'sourceEnd':m['sourceOutTimecode'],'title':headlines[i],'proofTitle':proofs[i],'reveal':reveal[i],'zoom':zooms[i],'cropWidth':crop_width[i],'track':tracks[i],'passes':[{'from':p[0],'duration':p[1],'source':p[2],'rate':p[3],'mode':p[4],'label':p[5]} for p in plans[i]],'captions':pages,'risk':m['verificationRisk']})
data={'fps':30,'durationInFrames':bounds[-1],'audioDuration':alignment['duration'],'scenes':scenes}
(src/'timeline.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
rows=['# Mapa de edição — video-014','', 'Fonte observada: `gta6-extended.mp4`, 1920×1080, CFR 30 fps. Timecodes não drop; entrada inclusiva e saída exclusiva. Narração preservada, alinhada localmente ao roteiro. Coordenadas medidas nos quadros extraídos.','', '| Saída | Cue / objetivo | Fonte exata | Alvo (x,y) | Prova / efeito | Legenda | Percepção / checagem |','|---|---|---|---|---|---|---|']
for s,m in zip(scenes,marks['scenes']):
    rows.append(f"| {s['from']/30:.3f}–{(s['from']+s['duration'])/30:.3f}s | {m['detail']} | {s['sourceStart']}–{s['sourceEnd']} | {s['track']} | Contexto + replay 1×; crop + zoom {s['zoom']}×; marcador breve removido antes da prova | {' '.join(s['proofTitle'])}; fala em blocos de 2–4 palavras | Pausas identificadas; {m['verificationRisk']} |")
rows+=['','## Limites observados','- O motivo do gesto de Jason é interpretação da narração, não confirmação de comportamento sistêmico.','- O movimento de árvores, pneu e pó é mostrado no arquivo fornecido, sem concluir implementação técnica ou procedência oficial.','- Plano do pó é escuro; a ampliação tem resolução limitada. Nenhuma luz, disparo, explosão ou material foi acrescentado.','- Sem trilha externa ou efeitos que simulem os fenômenos. Áudio: somente a narração original.','- Frames JPEG são uma sequência integral derivada dos oito MP4 exatos, não miniaturas do catálogo. Cada passe fica restrito ao intervalo aprovado.']
(src/'mapa-edicao.md').write_text('\n'.join(rows)+'\n',encoding='utf-8')
print('duration',data['durationInFrames'],data['audioDuration']);print('scene starts',bounds)
