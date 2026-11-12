#!/usr/bin/env python3
"""Adiciona regras ClipRush idempotentes sem substituir os AGENTS existentes."""
from __future__ import annotations
import argparse
import datetime
import pathlib
import shutil
import sys

ROOT = pathlib.Path(__file__).resolve().parent
MARKS = [
    ("AGENTS.md", "docs/REGRAS_AGENTS_PARA_INSERIR.md", "<!-- CLIPRUSH_RETENCAO_VISUAL_START -->", "<!-- CLIPRUSH_RETENCAO_VISUAL_END -->"),
    ("PROMPT_EDICAO_CLIPRUSH.md", "docs/PROMPT_EDICAO_ADENDO.md", "<!-- CLIPRUSH_EDICAO_RETENCAO_START -->", "<!-- CLIPRUSH_EDICAO_RETENCAO_END -->"),
]

def updated(original: str, block: str, start: str, end: str) -> str:
    if start in original and end in original:
        left = original.index(start)
        right = original.index(end, left) + len(end)
        return original[:left] + block.strip() + original[right:]
    if (start in original) != (end in original):
        raise ValueError("Marcadores parciais encontrados; edição manual necessária")
    return original.rstrip() + "\n\n" + block.strip() + "\n"

def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true", help="Aplicar mudanças, fazendo backup dos arquivos")
    args = parser.parse_args()
    missing = [name for name, _, _, _ in MARKS if not (ROOT / name).is_file()]
    if missing:
        print(f"ERRO: execute na raiz cliprush-editor. Arquivo(s) ausente(s): {', '.join(missing)}")
        print("Copie/extraia os arquivos do pacote na raiz, sem substituir os AGENTS existentes.")
        return 2
    plans = []
    for name, doc, start, end in MARKS:
        path = ROOT / name
        original = path.read_text(encoding="utf-8-sig")
        block = (ROOT / doc).read_text(encoding="utf-8")
        result = updated(original, block, start, end)
        plans.append((path, original, result))
    changed = [p for p, old, new in plans if old != new]
    print("Arquivos a atualizar:", ", ".join(p.name for p in changed) or "nenhum (atualização já aplicada)")
    if not args.apply:
        print("Prévia somente. Para aplicar: python instalar_retencao_cliprush.py --apply")
        return 0
    stamp = datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
    for path, old, new in plans:
        if old != new:
            backup = path.with_name(path.name + ".backup-retencao-" + stamp)
            shutil.copy2(path, backup)
            path.write_text(new, encoding="utf-8")
            print(f"OK {path.name} (backup: {backup.name})")
    return 0

if __name__ == "__main__":
    sys.exit(main())
