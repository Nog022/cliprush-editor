# Busca local de cenas GTA 6

Na raiz do projeto, com Python 3 (sem dependências adicionais):

```powershell
python scripts/buscar_cenas_gta6.py "praia" "jacaré|crocodilo" "carro|carros"
```

Cada argumento entre aspas é uma pesquisa independente. Espaços exigem todos
os termos; `|` permite alternativas explícitas: `"carro|carros vermelho"`.
A busca usa palavras inteiras nas descrições e tags, ignorando acentos e caixa.
Não expande sinônimos nem flexões automaticamente. Correspondências nas tags
têm prioridade; empates seguem a ordem do catálogo.

A saída JSON contém o total de correspondências e até cinco candidatos por
pesquisa, com vídeo original, início/fim, descrição, tags, miniatura e avisos
existentes. `--limite 1` até `--limite 5` reduz a saída. Sem correspondências,
retorna uma lista vazia. Consultas inválidas ou falhas de leitura retornam código 2.
`--catalogo CAMINHO` permite consultar outro arquivo com o mesmo esquema.
O catálogo padrão é resolvido em relação ao script, independente do diretório atual.

O script apenas lê o JSON existente. Não executa o indexador, Ollama ou análise
de vídeo, não abre imagens e não grava no catálogo, CSVs, mídias ou produções.
As descrições são aproximações de IA: revisar apenas 1–3 miniaturas/trechos
selecionados quando necessário. Para movimento, usar o MP4 original e seus
timestamps; a miniatura serve apenas para revisão. Em Remotion, referenciar
o caminho relativo a `public/` via `staticFile('videos/biblioteca/...')`.
