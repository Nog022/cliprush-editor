"""Busca textual somente leitura no catálogo existente; não importa o indexador."""

import argparse
import json
import re
import sys
import unicodedata
from pathlib import Path


CATALOGO = (Path(__file__).resolve().parents[1]
            / "public/videos/biblioteca/catalogo/gta6/cenas-descritas.json")
AVISO = ("Descrições de IA baseadas em frames estáticos: candidatos não confirmam "
         "identidade, fatos ou movimento. Revise apenas 1–3 miniaturas/trechos "
         "selecionados; use os timestamps no vídeo original para movimento.")
CAMPOS = ("video", "arquivo_original", "cena", "trecho", "inicio", "fim",
          "duracao_segundos", "descricao", "tags", "miniatura", "revisar",
          "observacoes_ia", "confianca")


def normalizar(texto):
    return "".join(c for c in unicodedata.normalize("NFKD", texto.casefold())
                   if not unicodedata.combining(c))


def termos(consulta):
    """Espaços significam E; | separa alternativas explícitas (OU)."""
    grupos = []
    for grupo in normalizar(consulta).split():
        alternativas = [re.findall(r"\w+", parte) for parte in grupo.split("|")]
        if any(not parte for parte in alternativas):
            raise ValueError("Use palavras separadas por espaço e alternativas como jacaré|crocodilo.")
        grupos.append(alternativas)
    if not grupos:
        raise ValueError("A consulta não pode ser vazia.")
    return grupos


def buscar(registros, consulta, limite=5):
    if not 1 <= limite <= 5:
        raise ValueError("O limite deve estar entre 1 e 5.")
    grupos = termos(consulta)
    candidatos = []
    for indice, registro in enumerate(registros):
        tags = registro.get("tags", "")
        if isinstance(tags, list):
            tags = " ".join(tags)
        descricao = set(re.findall(r"\w+", normalizar(registro.get("descricao", ""))))
        palavras_tags = set(re.findall(r"\w+", normalizar(tags)))
        palavras = descricao | palavras_tags
        if not all(any(set(alt) <= palavras for alt in grupo) for grupo in grupos):
            continue
        # Prioriza termos presentes nas tags; empates preservam a ordem do catálogo.
        pontos = sum(max(sum(2 if termo in palavras_tags else 1 for termo in alt)
                         for alt in grupo if set(alt) <= palavras) for grupo in grupos)
        candidatos.append((-pontos, indice, registro))
    candidatos.sort(key=lambda item: item[:2])
    return {
        "consulta": consulta,
        "total_correspondencias": len(candidatos),
        "candidatos": [{campo: registro[campo] for campo in CAMPOS if campo in registro}
                       for _, _, registro in candidatos[:limite]],
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("consultas", nargs="+", help='Ex.: "praia" "jacaré|crocodilo"')
    parser.add_argument("--limite", type=int, choices=range(1, 6), default=5)
    parser.add_argument("--catalogo", type=Path, default=CATALOGO)
    args = parser.parse_args()
    try:
        registros = json.loads(args.catalogo.read_text(encoding="utf-8-sig"))
        if not isinstance(registros, list) or not all(isinstance(r, dict) for r in registros):
            raise ValueError("O catálogo deve ser uma lista JSON de registros.")
        obrigatorios = ("video", "arquivo_original", "inicio", "fim", "descricao", "miniatura")
        for indice, registro in enumerate(registros):
            if any(not isinstance(registro.get(campo), str) for campo in obrigatorios):
                raise ValueError(f"Registro {indice}: campos obrigatórios ausentes ou inválidos.")
            tags = registro.get("tags", "")
            if not (isinstance(tags, str) or
                    isinstance(tags, list) and all(isinstance(tag, str) for tag in tags)):
                raise ValueError(f"Registro {indice}: tags devem ser texto ou lista de textos.")
        resultado = {"aviso": AVISO, "buscas": [buscar(registros, q, args.limite)
                                                for q in args.consultas]}
    except (OSError, ValueError) as erro:
        parser.exit(2, f"Erro ao buscar cenas: {erro}\n")
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    print(json.dumps(resultado, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
