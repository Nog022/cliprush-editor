#!/usr/bin/env python3
"""Resumo nao sensivel dos CSVs V3. Nao envia dados para serviços externos."""
import argparse
import csv
from collections import defaultdict
from pathlib import Path


def read(path):
    with path.open(encoding='utf-8-sig', newline='') as fh:
        rows=list(csv.DictReader(fh,delimiter=';'))
    if not rows: raise ValueError(f'CSV vazio: {path}')
    return rows


def num(v):
    try:return float(v or 0)
    except ValueError:return 0.0


def main():
    p=argparse.ArgumentParser()
    p.add_argument('--tarefas',type=Path,required=True)
    p.add_argument('--chamadas',type=Path,required=True)
    args=p.parse_args()
    tasks=read(args.tarefas);calls=read(args.chamadas)
    for key in ('input','cache','input_novo','output','duracao_s','chamadas_ferramenta'):
        if key not in tasks[0]: p.error(f'Coluna faltando em tarefas: {key}')
    total=lambda key:sum(num(x.get(key)) for x in tasks)
    total_in=total('input'); cache=total('cache')
    print('# Auditoria resumida — sem prompts nem caminhos privados')
    print(f'Tarefas: {len(tasks)} | Chamadas: {len(calls)}')
    print(f'Entrada: {total_in:,.0f} | Cache: {cache:,.0f} ({100*cache/max(1,total_in):.1f}%) | Entrada nova: {total("input_novo"):,.0f}')
    print(f'Saida: {total("output"):,.0f} | Raciocinio: {total("raciocinio"):,.0f}')
    print(f'Tempo de tarefas: {total("duracao_s")/60:.1f} min | Ferramentas declaradas: {total("tempo_ferramentas_s")/60:.1f} min')
    print('\n## Categorias das ferramentas')
    groups=defaultdict(lambda:[0,0.0])
    for row in calls:
        cat=row.get('categoria') or 'nao classificada'
        groups[cat][0]+=1;groups[cat][1]+=num(row.get('duracao_s'))
    for category,(n,secs) in sorted(groups.items(), key=lambda x:-x[1][1]):
        print(f'- {category}: {n} chamadas, {secs:.1f}s')
    print('\n## 5 maiores tarefas (data, tokens de entrada, chamadas, tempo)')
    for row in sorted(tasks,key=lambda x:num(x.get('input')),reverse=True)[:5]:
        print(f'- {row.get("data","?")}: {num(row.get("input")):,.0f} tokens; '
              f'{num(row.get("chamadas_ferramenta")):,.0f} chamadas; {num(row.get("duracao_s"))/60:.1f} min')
    print('\nObservacao: cache e tempo nao equivalem diretamente a custo. Classificacao de ferramentas e aproximada.')


if __name__=='__main__':main()
