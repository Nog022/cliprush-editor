#!/usr/bin/env python3
"""Resumo lexical das cenas do video-011 sem reindexar, sem IA e sem dependencias novas.

Execute na raiz do cliprush-editor:
    python prebuscar_cenas_video-011.py
"""

from __future__ import annotations

import json
import os
from pathlib import Path
import subprocess
import sys

BUSCAS = [
    ("01 - Reação dos NPCs", "barbudo|boné|assalto|restaurante"),
    ("02 - Quadro da mulher", "quadro|pintura|pôster|poster"),
    ("03 - Porta-malas vermelho", "porta-malas|conversível|traseira"),
    ("04 - Geladeira do Jason", "geladeira"),
    ("05a - Brincos", "brinco|orelha"),
    ("05b - Cordões de roupa", "cordão|moletom|bandana"),
    ("05c - Mochila", "mochila|bolsa"),
    ("06 - Molotov", "molotov|garrafa|líquido"),
    ("07 - Rato e máquina", "rato|roedor|máquina"),
]


def main() -> int:
    script = Path("scripts/buscar_cenas_gta6.py")
    if not script.is_file():
        print("Erro: execute este script na raiz do cliprush-editor.", file=sys.stderr)
        return 1

    cmd = [sys.executable, str(script), *(q for _, q in BUSCAS), "--limite", "3"]
    env = os.environ.copy()
    env["PYTHONIOENCODING"] = "utf-8"
    try:
        resultado = subprocess.run(
            cmd, capture_output=True, text=True, encoding="utf-8", env=env, check=True
        )
        catalogo = json.loads(resultado.stdout)
        respostas = catalogo["buscas"]
        if len(respostas) != len(BUSCAS):
            raise ValueError("Número de respostas diferente das consultas solicitadas")
    except (subprocess.CalledProcessError, json.JSONDecodeError, KeyError, ValueError) as exc:
        print(f"Falha ao consultar catálogo: {exc}", file=sys.stderr)
        if isinstance(exc, subprocess.CalledProcessError) and exc.stderr:
            print(exc.stderr[:1500], file=sys.stderr)
        return 1

    linhas = [
        "# ClipRush video-011: candidatos encontrados no catálogo",
        "",
        "Resultados **lexicais**, NÃO confirmados visualmente. Validar apenas 1–3 melhores candidatos.",
        "",
        "- **Geladeira validada manualmente:** `gta6-extended.mp4` / `00:07:17.156–00:07:26.200` (cena 55, trecho 3).",
        "- **Porta-malas validado visualmente:** teste v001. Recuperar origem/timestamps do código do teste; não presumir valores.",
        "",
    ]

    for (nome, termo), resposta in zip(BUSCAS, respostas):
        total = resposta.get("total_correspondencias", 0)
        linhas += [f"## {nome}", f"Busca: `{termo}` · {total} correspondência(s)"]
        candidatos = resposta.get("candidatos") or []
        if not candidatos:
            linhas.append("Nenhum candidato: usar sinônimos ou revisar trechos próximos, sem reindexar.")
        for c in candidatos:
            desc = " ".join(str(c.get("descricao", "")).split())[:170]
            linhas.append(
                f'- `{c.get("arquivo_original", "")}` '
                f'[{c.get("inicio", "?")}–{c.get("fim", "?")}] '
                f'(cena {c.get("cena", "?")}, trecho {c.get("trecho", "?")}); '
                f'miniatura `{c.get("miniatura", "")}`; {desc}'
            )
        linhas.append("")

    destino = Path("public/videos/video-011/roteiro/prebusca_catalogo_011.md")
    destino.parent.mkdir(parents=True, exist_ok=True)
    destino.write_text("\n".join(linhas) + "\n", encoding="utf-8")
    print(f"Resumo criado: {destino} (máximo de 3 candidatos por tópico)")
    print("Sem reindexação ou análise de vídeos. Resultados exigem revisão visual.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
