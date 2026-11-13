#!/usr/bin/env python3
"""Busca local limitada em catalogos JSON com estruturas heterogeneas. Nao reindexa."""
import argparse
import json
from pathlib import Path
import re
import unicodedata

SKIP = {'de','da','do','das','dos','um','uma','o','a','os','as','em','na','no','com','para','por','e','que','ao','the','in','on'}
DESC_KEYS = ('descricao', 'description', 'caption', 'resumo', 'texto', 'summary', 'scene', 'cena', 'tags', 'objetos','personagens','keywords')
PATH_KEYS = ('arquivo_original', 'video_original', 'video_path', 'caminho', 'arquivo', 'file', 'source', 'video')
START_KEYS = ('inicio', 'start', 'start_time', 'startTime', 'timestamp_inicio', 'time_start')
END_KEYS = ('fim', 'end', 'end_time', 'endTime', 'timestamp_fim', 'time_end')


def norm(v):
    return unicodedata.normalize('NFKD', str(v)).encode('ascii', 'ignore').decode().lower()


def words(v):
    return [w for w in re.findall(r'[a-z0-9]+', norm(v)) if w not in SKIP and len(w) > 1]


def compact(v, limit=220):
    text = ', '.join(str(x) for x in v) if isinstance(v, list) else str(v or '')
    text = ' '.join(text.split())
    return text[:limit] + ('…' if len(text) > limit else '')


def pick(d, keys):
    lower = {str(k).lower():v for k,v in d.items()}
    for key in keys:
        value = d.get(key, lower.get(key.lower()))
        if value is not None:
            return value
    return None


def walk(obj, inherited=None, count=None):
    inherited = inherited or {}
    count = count or [0]
    if count[0] > 100000:
        return
    if isinstance(obj, list):
        for item in obj:
            yield from walk(item, inherited, count)
    elif isinstance(obj, dict):
        count[0] += 1
        parent = {**inherited}
        for key in PATH_KEYS:
            if key in obj and isinstance(obj[key], (str,int)):
                parent['video'] = str(obj[key]); break
        has_descrip = any(k.lower() in [str(x).lower() for x in obj.keys()] for k in DESC_KEYS)
        if has_descrip:
            yield obj, parent
        for key,value in obj.items():
            if isinstance(value, (dict,list)):
                yield from walk(value, parent, count)


def main():
    p=argparse.ArgumentParser()
    p.add_argument('--catalogo', required=True, type=Path)
    p.add_argument('--consulta', required=True)
    p.add_argument('--limite', type=int, default=5)
    args=p.parse_args()
    if not 1 <= args.limite <= 5:
        p.error('limite deve ser 1 a 5 para manter o contexto pequeno')
    catalogo=args.catalogo
    if not catalogo.is_file():
        p.error('catalogo nao encontrado')
    obj=json.loads(catalogo.read_text(encoding='utf-8-sig'))
    terms=set(words(args.consulta))
    if not terms: p.error('consulta nao possui termos pesquisaveis')
    hits=[]
    for item, parent in walk(obj):
        fields=[]
        for k,v in item.items():
            if str(k).lower() in DESC_KEYS and isinstance(v,(str,list,dict)):
                fields.append(compact(v,1500))
        searchable=' '.join(fields)
        doc_terms=set(words(searchable))
        count=len(terms & doc_terms)
        if not count: continue
        score=count/max(1,len(terms))
        description=compact(pick(item, DESC_KEYS), 185)
        hits.append((score, count, {'video': compact(pick(item, PATH_KEYS) or parent.get('video'), 130),
                                    'inicio': pick(item, START_KEYS), 'fim': pick(item, END_KEYS),
                                    'descricao': description,
                                    'tags': compact(pick(item, ('tags','keywords')), 90),
                                    'miniatura': pick(item, ('miniatura', 'thumbnail')),
                                    'confianca': pick(item, ('confianca', 'confidence')),
                                    'revisar': pick(item, ('revisar', 'review'))}))
    hits.sort(key=lambda x:(x[0],x[1]), reverse=True)
    print(json.dumps({'consulta':args.consulta,'resultados':[h[2] for h in hits[:args.limite]],
                      'total_candidatos_textuais':len(hits),
                      'aviso':'Busca textual aproximada. Confirme esquema e cena antes de editar.'}, ensure_ascii=False,indent=2))


if __name__=='__main__': main()
