# ClipRush011 — correção concluída

Exportação: `out/ClipRush011-corrigido.mp4`, 33.659.850 bytes, H.264/AAC, 1080×1920, 30 FPS, 1.401 frames, 46,70 s. MP3 original de 46,6808125 s preservado integralmente. MP4 anterior mantido.

## Espaço e temporários

- Espaço livre ao retomar: 20,44 GB. Após exportação e verificações: 20,36 GB.
- ENOSPC durante a revisão: cada chamada de still deixava uma cópia temporária de 674.360.607 bytes do `gta6-extended.mp4`; o acúmulo esgotou o disco.
- Identificadas seis cópias dos primeiros stills desta correção, criadas entre 11:32 e 11:33, totalizando 4.046.163.642 bytes. Foram apenas inventariadas nesta retomada; não precisaram ser removidas. Caminhos exatos em `out/video-011/correcao/espaco-temporarios.json`.
- O renderizador agora usa uma pasta TEMP exclusiva sob `out/video-011/correcao/renderer-temp-*`, com limpeza assíncrona após cada still e ao encerrar. Zero pastas temporárias dessa execução permaneceram após a exportação.
- Nenhum original, catálogo, cache de indexação, teste anterior ou render final existente foi apagado.

## Causa da ausência de imagens e correção

Os frames 30, 350, 500, 700, 850 e 910 da composição anterior e do MP4 anterior exibem imagens originais. Falha de `OffthreadVideo`, `staticFile` ou camadas não foi reproduzida nesses pontos. A ausência de imagens em 17,77 s vinha das quatro cartelas `Missing` (533 frames).

As quatro cartelas foram substituídas por imagens originais de contexto, mantendo os textos que informam a ausência dos detalhes. Não há blocos compostos somente pela cartela. A abertura passou a mostrar a loja; o porta-malas recebeu zoom mais rápido com foco na borda superior; o foco dos brincos foi ajustado. O zoom e a moldura da foto do cachorro foram preservados.

Na validação pendente, o aviso da mochila foi reposicionado para revelar a bolsa. O apoio de fogo passou a usar um fotograma original confirmado. Nenhum movimento de acessório, líquido ou animal foi fabricado.

## Fontes e classificação

Todos os intervalos abaixo pertencem a `public/videos/biblioteca/gta6/videos/gta6-extended.mp4`.

| Classificação | Cena e intervalo original | Limite da confirmação |
|---|---|---|
| Confirmada | Quadro: 06:25,533, frame congelado | Sem arte comparativa externa |
| Confirmada | Porta-malas: 08:29,700–08:32,655 | Desgaste não comprovado |
| Confirmada | Foto do cachorro: 07:17,167–07:21,119 | Pets permanece hipótese |
| Cena confirmada | Brincos: 06:31,400–06:34,533 | Física independente não comprovada |
| Alternativa | Cordões: 16:54,700–16:56,133 | Mesmo moletom, outra tomada; física não comprovada |
| Apoio contextual | Loja: abertura 11:46,800–11:48,840; bloco NPCs 11:48,833–11:55,400 | Rostos e reações específicos não localizados |
| Apoio contextual | Mochila vermelha: frame 09:13,000 congelado | Mochila MARCUS não localizada |
| Apoio contextual | Fogo: frame 09:13,000 congelado, outro enquadramento | Molotov e movimento do líquido não localizados |
| Apoio contextual | Máquina de bebidas: 11:52,167–11:53,492 | Rato e fachada específica não localizados |

Os quatro últimos detalhes continuam classificados como `CENA_NAO_ENCONTRADA` no mapa. Os apoios são identificados na tela e não constituem comprovação. Os quatro vídeos originais foram consultados na busca já concluída; não houve nova busca após a retomada. Instagram permanece exclusivamente referência, sem integrar o render.

## Validações

- Um frame de cada bloco aprovado antes da exportação; mosaico em `out/video-011/correcao/validacao-final-todos-blocos.jpg`.
- Sete frames extraídos do MP4 corrigido correspondem aos stills aprovados: 30, 220, 700, 975, 1060, 1190 e 1365. Erro médio de pixels entre 1,37 e 2,82 numa escala de 0 a 255. Evidência em `out/video-011/correcao/comprovacao-mp4-corrigido.jpg` e `comparacao-frames-mp4.json`.
- Decodificação integral do MP4 por FFmpeg sem erros; resolução, FPS, codecs e duração verificados.
- Correlação do áudio exportado com o MP3: 0,999889, com início e final preservados.
- Lint e TypeScript aprovados. Hashes do MP3, alinhamento e testes anteriores mantidos. Textos de legendas, nó de áudio e limites das sequências preservados.
- Biblioteca e indexação preservadas; Ollama não executado.

Resultados técnicos: `out/video-011/correcao/verificacao-final.json` e `preservacao-final.json`. Seleção detalhada: `mapa_timestamps_011.json`.
