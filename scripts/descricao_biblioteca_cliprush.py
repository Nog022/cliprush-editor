"""ClipRush V3: indexador de cenas com descrição visual conservadora via Ollama local.

Executar na raiz cliprush-editor (PowerShell):
  python scripts/descricao_biblioteca_cliprush.py --planejar
  python scripts/descricao_biblioteca_cliprush.py --video gta6-extended --limite 10
  python scripts/descricao_biblioteca_cliprush.py --reprocessar-antigas --limite 10
  python scripts/descricao_biblioteca_cliprush.py --limite 0

Preserva cache V1/V2, miniaturas, CSVs de cortes e MP4s.
Nenhum frame é enviado ao Codex ou a servidores externos; Ollama localhost.
Não há garantia de descrições sem erros: reveja imagens duvidosas antes de publicar.
"""

import argparse
import base64
import csv
import json
import math
import re
import subprocess
import sys
import urllib.error
import urllib.request
from pathlib import Path

import cv2
import numpy as np

MODELO = "gemma3:4b"
API = "http://127.0.0.1:11434/api/chat"
RAIZ_BIBLIOTECA = Path("public/videos/biblioteca")
LIMIAR_CENA_LONGA = 20.0
DURACAO_TRECHO = 12.0
COLUNAS = [
    "jogo", "video", "cena", "trecho", "inicio", "fim", "duracao_segundos",
    "descricao", "categoria", "tags", "confianca", "revisar", "miniatura",
    "arquivo_original", "observacoes_ia", "versao_prompt",
]
CATEGORIAS = {"personagem", "veiculo", "animal", "paisagem", "interior", "objeto", "texto", "acao", "outros", "sem_conteudo"}
VERSAO_PROMPT = 3
# Estes termos só geram SINALIZAÇÃO para revisão. Não removem nenhum detalhe automaticamente.
TERMOS_SENSIVEIS = ("coroa", "arma", "sangue", "sutiã", "droga", "policial", "hospital", "ferimento")
ACOES_INFERIVEIS = ("conversando", "falando", "se aproxima", "se aproximando", "caminhando", "dirigindo", "preparando", "discutindo")
SCHEMA = {
    "type": "object", "additionalProperties": False,
    "properties": {
        "descricao": {"type": "string"},
        "tags": {"type": "array", "items": {"type": "string"}},
        "categoria": {"type": "string", "enum": sorted(CATEGORIAS)},
        "confianca": {"type": "string", "enum": ["alta", "media", "baixa"]},
        "incertezas": {"type": "array", "items": {"type": "string"}},
    },
    "required": ["descricao", "tags", "categoria", "confianca", "incertezas"],
}


def chave(registro):
    trecho = registro.get("trecho", 0)
    return (str(registro["video"]), int(registro["cena"]), int(trecho or 0))


def timestamp(segundos):
    milissegundos = int(round(max(0.0, segundos) * 1000))
    horas, resto = divmod(milissegundos, 3_600_000)
    minutos, resto = divmod(resto, 60_000)
    s, ms = divmod(resto, 1000)
    return f"{horas:02d}:{minutos:02d}:{s:02d}.{ms:03d}"


def indice_de_cenas(raiz):
    pasta_catalogo = raiz / RAIZ_BIBLIOTECA / "catalogo" / "gta6"
    pasta_originais = raiz / RAIZ_BIBLIOTECA / "gta6" / "videos"
    registros = []
    arquivos_csv = sorted(pasta_catalogo.glob("*/*-Scenes.csv"))
    if not arquivos_csv:
        sys.exit(f"Nenhum *-Scenes.csv encontrado em {pasta_catalogo}")
    for arquivo_csv in arquivos_csv:
        video_base = arquivo_csv.parent.name
        video_nome = video_base + ".mp4"
        original = pasta_originais / video_nome
        pasta_miniaturas = arquivo_csv.parent / "miniaturas"
        with arquivo_csv.open("r", encoding="utf-8-sig", newline="") as f:
            linhas = list(csv.DictReader(f))
        for item in linhas:
            numero = int(item["Scene Number"])
            inicio_s = float(item["Start Time (seconds)"])
            fim_s = float(item["End Time (seconds)"])
            duracao = max(0.0, fim_s - inicio_s)
            miniaturas = sorted(pasta_miniaturas.glob(f"*-Scene-{numero:03d}-*.webp"))
            base = {
                "jogo": "gta6", "video": video_nome, "cena": numero,
                "trecho": 0, "inicio": item["Start Timecode"],
                "fim": item["End Timecode"], "duracao_segundos": round(duracao, 3),
                "descricao": "", "categoria": "", "tags": "", "confianca": "",
                "revisar": "CENA LONGA: consulte os subtrechos" if duracao >= LIMIAR_CENA_LONGA else "",
                "miniatura": miniaturas[0].relative_to(raiz).as_posix() if miniaturas else "",
                "observacoes_ia": "", "versao_prompt": "",
                "arquivo_original": original.relative_to(raiz).as_posix(),
            }
            registros.append(base)
            if duracao >= LIMIAR_CENA_LONGA:
                # Divide somente cenas longas. Entradas adicionais são independentes
                # e preservam as entradas/caches das cenas principais já existentes.
                quantidade = math.ceil(duracao / DURACAO_TRECHO)
                largura = duracao / quantidade
                for n in range(1, quantidade + 1):
                    a = inicio_s + (n - 1) * largura
                    b = fim_s if n == quantidade else inicio_s + n * largura
                    frame_path = arquivo_csv.parent / "miniaturas-extras" / f"{video_base}-Scene-{numero:03d}-Trecho-{n:02d}.webp"
                    extra = dict(base)
                    extra.update({
                        "trecho": n,
                        "inicio": timestamp(a), "fim": timestamp(b),
                        "duracao_segundos": round(b - a, 3),
                        "revisar": "SUBTRECHO DE CENA LONGA",
                        "miniatura": frame_path.relative_to(raiz).as_posix(),
                        "_captura_em": (a + b) / 2,
                    })
                    registros.append(extra)
    return registros, pasta_catalogo


def carregar_cache(caminho):
    resultado = {}
    if not caminho.exists():
        return resultado
    with caminho.open("r", encoding="utf-8") as f:
        for texto in f:
            try:
                entrada = json.loads(texto)
                resultado[chave(entrada)] = entrada
            except (ValueError, KeyError, TypeError):
                continue
    return resultado


def correcoes_manuais(csv_atual, json_atual):
    """Preserva só alterações humanas: compara CSV existente com JSON exportado anteriormente.

    Usar o cache como base aqui causava um BUG: ao refazer uma descrição, o CSV
    antigo parecia uma edição manual e sobrescrevia a versão recém-gerada.
    """
    revisoes = {}
    if not csv_atual.exists() or not json_atual.exists():
        return revisoes
    try:
        anteriores = json.loads(json_atual.read_text(encoding="utf-8"))
        gerados = {chave(r): r for r in anteriores}
        with csv_atual.open("r", encoding="utf-8-sig", newline="") as f:
            linhas = list(csv.DictReader(f, delimiter=";"))
    except (ValueError, OSError, csv.Error, KeyError):
        return revisoes
    for linha in linhas:
        try:
            id_cena = chave(linha)
        except (ValueError, KeyError):
            continue
        original = gerados.get(id_cena)
        if not original:
            continue
        dif = {}
        for campo in ("descricao", "tags", "categoria", "confianca"):
            valor = (linha.get(campo) or "").strip()
            anterior = (str(original.get(campo, "")) or "").strip()
            if valor and valor != anterior:
                dif[campo] = valor
        # A V2 marcava linhas corrigidas manualmente no próprio catálogo.
        # Migre essa informação como uma revisão persistente.
        marca_anterior = (linha.get("revisar") or "")
        if "REVISADO MANUALMENTE" in marca_anterior or "EDIÇÃO MANUAL NO CSV" in marca_anterior:
            for campo in ("descricao", "tags", "categoria", "confianca"):
                valor = (linha.get(campo) or "").strip()
                if valor:
                    dif[campo] = valor
        if dif:
            revisoes[id_cena] = dif
    return revisoes


def carregar_revisoes_persistidas(caminho):
    if not caminho.is_file():
        return {}
    try:
        dados = json.loads(caminho.read_text(encoding="utf-8"))
        return {chave(v): v["campos"] for v in dados if "campos" in v}
    except (ValueError, OSError, TypeError, KeyError):
        return {}


def salvar_revisoes_persistidas(caminho, revisoes):
    linhas = [{"video": k[0], "cena": k[1], "trecho": k[2], "campos": v}
              for k, v in sorted(revisoes.items())]
    temporario = caminho.with_suffix(".json.tmp")
    temporario.write_text(json.dumps(linhas, ensure_ascii=False, indent=2), encoding="utf-8")
    temporario.replace(caminho)


def flags_qualidade(dado):
    """Sinaliza riscos para revisão; não pretende verificar o conteúdo visual."""
    desc = str(dado.get("descricao", "")).lower()
    flags = []
    if dado.get("confianca") == "baixa":
        flags.append("BAIXA CLAREZA VISUAL")
    if (dado.get("incertezas") or []):
        flags.append("INCERTEZA DECLARADA PELA IA")
    if any(re.search(r"\b" + re.escape(t) + r"\b", desc) for t in TERMOS_SENSIVEIS):
        flags.append("CONFERIR OBJETO/CONTEXTO ESPECÍFICO")
    if any(t in desc for t in ACOES_INFERIVEIS):
        flags.append("AÇÃO PODE NÃO SER DEDUZÍVEL DE UM FRAME")
    if len(desc.split()) < 9 or "cena de jogo" in desc or "uma imagem" in desc:
        flags.append("DESCRIÇÃO POUCO ESPECÍFICA")
    return flags


def salvar_catalogo(registros, cache, revisoes, catalogo):
    saida = []
    for registro in registros:
        atual = {k: v for k, v in registro.items() if not k.startswith("_")}
        id_cena = chave(registro)
        ja_feito = cache.get(id_cena)
        if ja_feito:
            for campo in ("descricao", "tags", "categoria", "confianca", "observacoes_ia", "versao_prompt"):
                valor = ja_feito.get(campo, "")
                if valor != "" and valor is not None:
                    atual[campo] = valor
            alertas = flags_qualidade(ja_feito)
            atual["revisar"] = "; ".join(x for x in [atual["revisar"], *alertas] if x)
        if id_cena in revisoes:
            atual.update(revisoes[id_cena])
            atual["revisar"] = "; ".join(x for x in [atual["revisar"], "EDIÇÃO MANUAL NO CSV"] if x)
        saida.append(atual)
    csv_final = catalogo / "cenas-descritas.csv"
    json_final = catalogo / "cenas-descritas.json"
    # Gravação atômica: não destrói o catálogo anterior se houver interrupção.
    csv_tmp = csv_final.with_suffix(".csv.tmp")
    json_tmp = json_final.with_suffix(".json.tmp")
    with csv_tmp.open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=COLUNAS, delimiter=";", extrasaction="ignore")
        writer.writeheader()
        writer.writerows(saida)
    json_tmp.write_text(json.dumps(saida, ensure_ascii=False, indent=2), encoding="utf-8")
    csv_tmp.replace(csv_final)
    json_tmp.replace(json_final)
    return csv_final, json_final


def imagem_escura(arquivo):
    imagem = cv2.imread(str(arquivo))
    if imagem is None:
        return False
    pequena = cv2.resize(imagem, (96, 96), interpolation=cv2.INTER_AREA)
    cinza = cv2.cvtColor(pequena, cv2.COLOR_BGR2GRAY)
    # Conservador: apenas imagem praticamente preta SEM texto/elementos claros.
    return float(np.mean(cinza)) < 5 and int(np.max(cinza)) < 35


def capturar_imagem(extra, raiz):
    destino = raiz / extra["miniatura"]
    if destino.is_file():
        return destino
    original = raiz / extra["arquivo_original"]
    if not original.is_file():
        raise FileNotFoundError(f"Vídeo não encontrado: {original}")
    destino.parent.mkdir(parents=True, exist_ok=True)
    segundos = float(extra["_captura_em"])
    cmd = [
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
        "-ss", str(segundos), "-i", str(original),
        "-frames:v", "1", "-vf", "scale=480:-2", "-c:v", "libwebp", "-q:v", "75",
        str(destino),
    ]
    resultado = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    if resultado.returncode != 0 or not destino.is_file():
        raise RuntimeError(f"FFmpeg falhou no tempo {segundos:.2f}s: {resultado.stderr[-300:]}")
    return destino


def modelo_descreve(imagem):
    instrucoes = (
        "Você é um INDEXADOR de imagens para buscar quadros de vídeos. "
        "Receberá APENAS UM FRAME ESTÁTICO, e não um vídeo: não é possível saber antes/depois, diálogos ou movimentos. "
        "Descreva SOMENTE elementos observáveis com segurança, em português brasileiro. "
        "Estruture sua descrição nesta ordem, se visível: sujeito(s), posição/roupa/objetos claros, ambiente. "
        "NÃO suponha nomes próprios (Jason, Lucia etc.), profissão, parentesco, cidades, prédios, causas, intenções, história ou emoção. "
        "NÃO interprete objetos difíceis de ver como específicos: diga 'acessório na cabeça' em vez de 'coroa', "
        "'objeto pequeno' em vez de 'arma', se não for inequívoco. "
        "NÃO use verbos que exigem movimento/áudio (caminhando, conversando, entrando, se aproximando, preparando), "
        "a menos que a imagem por si permita a ação; prefira 'em pé', 'olhando para', 'segurando'. "
        "Se não puder identificar com certeza, omita o detalhe; não precisa adivinhar. "
        "Em cenas escuras, diga explicitamente que a visibilidade é limitada. "
        "Se a imagem for tela preta, logotipo, texto isolado ou transição, descreva como tal. "
        "A descrição deve ser UMA frase objetiva e específica, idealmente com 15 a 35 palavras, sem clima dramático ou linguagem promocional. "
        "As tags devem conter APENAS 2 a 6 itens que também se sustentem nos elementos da descrição. "
        "'confianca' aqui significa CLAREZA da imagem, NÃO a probabilidade de sua descrição estar correta. "
        "Liste em 'incertezas' apenas detalhes que você optou por NÃO identificar por falta de evidência; senão use lista vazia. "
        "Retorne APENAS o JSON no formato solicitado."
    )
    payload = {
        "model": MODELO, "stream": False, "format": SCHEMA, "keep_alive": "10m",
        "options": {"temperature": 0, "num_predict": 350, "num_ctx": 4096},
        "messages": [{"role": "user", "content": instrucoes,
                      "images": [base64.b64encode(imagem.read_bytes()).decode("ascii")]}],
    }
    req = urllib.request.Request(
        API, json.dumps(payload, ensure_ascii=False).encode("utf-8"),
        headers={"Content-Type": "application/json"}, method="POST",
    )
    with urllib.request.urlopen(req, timeout=240) as resposta:
        conteudo = json.loads(resposta.read().decode("utf-8"))["message"]["content"]
    obj = json.loads(conteudo)
    descricao = str(obj.get("descricao", "")).replace("\n", " ").strip()
    if len(descricao) < 12:
        raise ValueError("Descrição muito curta ou vazia; não adicionada ao cache.")
    if len(descricao) > 500:
        raise ValueError("Descrição muito longa; não adicionada ao cache.")
    tags = obj.get("tags", [])
    if not isinstance(tags, list):
        raise ValueError("IA retornou tags em formato inválido")
    tags = list(dict.fromkeys(str(t).strip().lower() for t in tags
                              if isinstance(t, str) and 1 < len(t.strip()) <= 48))[:6]
    categoria = str(obj.get("categoria", "outros")).lower().strip()
    confianca = str(obj.get("confianca", "baixa")).lower().strip()
    incertezas = obj.get("incertezas", [])
    if not isinstance(incertezas, list):
        incertezas = [str(incertezas)] if incertezas else []
    incertezas = [str(i).strip()[:140] for i in incertezas if str(i).strip()][:4]
    return {
        "descricao": descricao,
        "tags": ", ".join(tags),
        "categoria": categoria if categoria in CATEGORIAS else "outros",
        "confianca": confianca if confianca in {"alta", "media", "baixa"} else "baixa",
        "incertezas": incertezas,
        "observacoes_ia": "; ".join(incertezas),
    }


def executar():
    parser = argparse.ArgumentParser(description="ClipRush V3: descrições visuais conservadoras com Gemma 3 local.")
    parser.add_argument("--video", help="Nome do vídeo sem .mp4; por exemplo gta6-extended")
    parser.add_argument("--limite", type=int, default=10, help="Novas descrições nesta execução; 0 = todas")
    parser.add_argument("--planejar", action="store_true", help="Mostra quantidades sem chamar IA, FFmpeg ou alterar arquivos")
    parser.add_argument("--reprocessar-antigas", action="store_true", help="Refaz somente descrições V1/V2, preservando as demais")
    args = parser.parse_args()
    if args.limite < 0:
        parser.error("--limite não pode ser negativo")
    raiz = Path.cwd()
    registros, catalogo = indice_de_cenas(raiz)
    cache_path = catalogo / "descricoes-cache.jsonl"
    cache = carregar_cache(cache_path)
    csv_saida = catalogo / "cenas-descritas.csv"
    json_saida = catalogo / "cenas-descritas.json"
    # Captura edições manuais ANTES de alterar o cache.
    revisoes_path = catalogo / "revisoes-manuais.json"
    revisoes = carregar_revisoes_persistidas(revisoes_path)
    revisoes.update(correcoes_manuais(csv_saida, json_saida))
    candidatos = [r for r in registros if not args.video or Path(r["video"]).stem.lower() == args.video.lower()]
    if not candidatos:
        sys.exit(f"Vídeo não encontrado: {args.video}")
    def precisa_processar(r):
        id_cena = chave(r)
        if id_cena in revisoes:
            return False  # não sobrescreve correção humana
        feito = cache.get(id_cena)
        if args.reprocessar_antigas:
            return bool(feito) and int(feito.get("versao_prompt") or 0) < VERSAO_PROMPT
        return not feito
    pendentes = [r for r in candidatos if precisa_processar(r)]
    if args.planejar:
        print(f"Cenas/trechos no catálogo completo: {len(registros)}")
        print(f"Registros do filtro selecionado: {len(candidatos)}")
        print(f"Descritos no cache total: {len(cache)}")
        print(f"Revisões manuais protegidas: {len(revisoes)}")
        print(f"A processar neste modo: {len(pendentes)}")
        print(f"Subtrechos de cenas longas: {sum(int(r['trecho']) > 0 for r in candidatos)}")
        print("Nenhuma imagem foi processada e nenhum arquivo foi alterado.")
        return
    sucessos, erros = 0, 0
    for registro in pendentes:
        if args.limite and sucessos >= args.limite:
            break
        id_cena = chave(registro)
        try:
            miniatura = (capturar_imagem(registro, raiz)
                         if registro.get("_captura_em") is not None
                         else raiz / registro["miniatura"])
            if not miniatura.is_file():
                raise FileNotFoundError(f"Miniatura não encontrada: {miniatura}")
            if imagem_escura(miniatura):
                resultado = {"descricao": "Tela preta ou quadro sem conteúdo visível.",
                             "tags": "tela preta, sem conteúdo", "categoria": "sem_conteudo",
                             "confianca": "alta", "incertezas": [], "observacoes_ia": ""}
                origem = "detecção local"
            else:
                print(f"Analisando {registro['video']} / cena {registro['cena']} / trecho {registro['trecho']}...", flush=True)
                resultado = modelo_descreve(miniatura)
                origem = "Gemma 3"
            dado = {"video": registro["video"], "cena": registro["cena"], "trecho": registro["trecho"],
                    **resultado, "modelo": MODELO if origem == "Gemma 3" else "classificador-local",
                    "versao_prompt": VERSAO_PROMPT}
            # Append-only, compatível com caches antigos. A última versão da chave prevalece.
            with cache_path.open("a", encoding="utf-8") as f:
                f.write(json.dumps(dado, ensure_ascii=False) + "\n")
            cache[id_cena] = dado
            sucessos += 1
            alertas = flags_qualidade(dado)
            print(f"  [{origem}] {resultado['descricao']}", flush=True)
            if alertas:
                print("  [Revisar] " + "; ".join(alertas), flush=True)
        except (OSError, RuntimeError, subprocess.TimeoutExpired, urllib.error.URLError,
                ValueError, KeyError, TimeoutError, json.JSONDecodeError) as e:
            erros += 1
            print(f"  ERRO (poderá tentar novamente): {e}", flush=True)
            if isinstance(e, urllib.error.URLError):
                print("Ollama não respondeu. Verifique se o serviço Ollama está ativo.")
                break
    csv_final, json_final = salvar_catalogo(registros, cache, revisoes, catalogo)
    if revisoes:
        salvar_revisoes_persistidas(revisoes_path, revisoes)
    print(f"Concluído: {sucessos} novos/atualizados, {len(cache)} registros em cache, {erros} erros.")
    print(f"CSV para Excel: {csv_final}")
    print(f"JSON para Codex: {json_final}")
    print("IMPORTANTE: sem validação visual humana, nenhuma descrição pode ser considerada 100% correta.")


if __name__ == "__main__":
    executar()
