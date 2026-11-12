# ClipRush — Perfil Criminal | Pacote com resultados reais da busca

Este pacote atualiza **roteiro, storytelling, storyboard e marcações** com a saída fornecida pelo usuário de `scripts/buscar_cenas_gta6.py`. A **narração não foi alterada**.

## Conteúdo
- `narracao.txt` — texto aprovado, intocado. Usar arquivo de áudio já gravado sem regravar.
- `storytelling.md` — estrutura narrativa, direção e contraste dos dois estilos de jogador.
- `roteiro.md` — falas literais com a mídia indicada para cada trecho.
- `storyboard.md` — timeline estimada, timecodes de ORIGEM, planos, transições e validações.
- `marcacoes.txt` — catálogo dos **7 candidatos reais** retornados pela busca, inclusive avisos.
- `cenas_selecionadas.json` — dados estruturados para o Codex, com identificação e finalidade sugerida das cenas.
- `prompt_codex.txt` — instrução curta para executar no repositório.

## Onde copiar
Copiar o conteúdo de `roteiro/` para `public/videos/video-NNN/roteiro/` na produção correta do `cliprush-editor` (NNN = número da produção atual). Não sobrescrever outros vídeos nem o arquivo de áudio existente.

## Como usar
1. Leia `AGENTS.md`, as skills locais de edição e o mapa em `storyboard.md`.
2. Confira os **trechos reais** descritos no JSON: a busca encontrou 2 cenas de homens armados, 5 de polícia e **0** para `fuga|perseguicao` e `Jason|Lucia`.
3. O catálogo descreve *frames estáticos*. É proibido deduzir que uma cena é um roubo, uma fuga ou um tiro só porque mostra armas, máscaras ou viaturas. Conferir 1–3 miniaturas/trechos selecionados e fazer substituições quando necessário.
4. Para `RDR2`, procurar um clipe genuíno da barra de honra na biblioteca; se não houver, usar ilustração explicitamente marcada. Não inventar asset, file path ou timestamp.
5. Ajustar os tempos ao áudio real; uma timeline aproximada **não autoriza cortar/acelerar narração**.
6. Validar início, transições A/B, RDR2 → GTA 6, fim, legendas e quadros pretos.

## Aviso factual
`Criminal Profile` é assunto da narração. Nenhuma das cenas catalogadas comprova na tela uma punição específica do Perfil Criminal. Exemplo dos dois assaltos é **hipotético**; as imagens são de apoio, não uma demonstração experimental de reações do sistema.
