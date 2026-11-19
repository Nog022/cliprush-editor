# Spec: video-028 — fim do mapa

**Classe:** M | **Alvo:** `src/videos/video-028` | **Estado:** em execução

## Resultado esperado
MP4 1080×1920 a 30 FPS, 1509 frames (50,3 s), determinado pela narração original de 50,286 s. Legendas por palavra, cortes dinâmicos, zoom investigativo e preservação das evidências do material fornecido.

## Entradas disponíveis
- Narração: `public/videos/video-028/audio/narracao.mp3`; transcrição local única, sem download de modelos, em words.json e segments.json.
- Biblioteca: `gta6/videos/davy/GTA 6 - O que tem no FIM DO MUNDO (decepcionante).mp4`, 1920×1080, 60 FPS, 977,734 s.
- Oito intervalos fornecidos pelo usuário, conferidos em contact sheets de origem.

## Escopo
**Fazer:** ClipRush028, registro mínimo no Root, recortes sem webcam e sem áudio original, CTA durante fala existente, previews por bloco e MP4 novo validado.
**Não fazer:** alterar produções anteriores, limpar arquivos, reindexar biblioteca, gerar voz, autenticar gameplay ou acrescentar mecânicas.

## Regras inegociáveis
- Preservar narração inteira. Os 38 segundos sugeridos não substituem os 50,286 segundos de áudio real.
- Webcam no alto à esquerda: recorte físico x=450,y=70,w=1380,h=960 antes de qualquer fundo ou zoom. Remover faixa original com -an.
- Nenhum tubarão visível nos trechos examinados; isso não prova ausência global no jogo. Não inventar HUD de vida, ataque ou efeito de pane.
- Morte visível em 15:20–15:24. Após isso há preto e reaparecimento em terra; não usar como continuação subaquática.
- Preservação explícita do usuário: completeProduction(validationOnly:true), sem transação de retenção.
- Reutilizar componentes comprovados e bundle revisado. Sem renderizações completas redundantes.

## Aceitação objetiva
- [x] Narração inteira, legenda sincronizada e 1080×1920/30 FPS.
- [x] Cada bloco verificado visualmente antes do MP4.
- [x] Webcam e comentários ausentes; CTA visível durante a fala correspondente.
- [x] TypeScript/lint e decodificação integral do MP4 aprovados.
- [x] Produções anteriores preservadas.

## Riscos e incertezas
A narração menciona GTA 6 e Jason; preservar o áudio fornecido não autentica a origem do gameplay. A imagem mostra reação de dano e morte, mas não permite medir perda numérica de vida. Mapa mostra posição no oceano, sem acrescentar distâncias não comprovadas.

## Revisão antes da exportação
- 13 enquadramentos, um por bloco, conferidos em `out/video-028/preview-sheet.jpg`; seis frames dos blocos ajustados revisados separadamente.
- Aviso real “Motor danificado” confirmado em 14:52,7 e extraído para `motor-notice.png`, ampliado durante a fala da pane.
- Enquadramentos do salto, mapa e tela de morte corrigidos. Morte alinhada à fala “até ele morrer”, conferida no frame 1200.
- TypeScript (`tsc --noEmit`) e ESLint dos arquivos alterados aprovados após os ajustes.
- Fonte sem faixa de áudio nos recortes. A webcam termina em x=442; todos os recortes começam em x=450.
- Exportação H.264 CRF 18 e AAC 320 kbps em arquivo novo; usa bundle revisado e completeProduction em modo somente validação.
- Retenção automática não habilitada (`out/retention/enabled.json` ausente); nenhuma limpeza autorizada nesta tarefa.

## Entrega validada
- `deliveries/video-028-final-20261118-v1.mp4`: 45.532.909 bytes; 1509 frames; 50,304 s; H.264/AAC; 1080?1920; 30 FPS.
- Decodifica??o integral aprovada por completeProduction(validationOnly:true). SHA-256: `9d02ddbeb86244c3731e3dd9e6f7e0ed1b7704017d68c81820261412444b8e40`.
- Correla??o com a narra??o original: 0.999973; deslocamento de ?udio: zero amostras a 16 kHz. Clique discreto de CTA ? a ?nica camada adicional.
- Quinze amostras do MP4 final conferidas visualmente em `out/video-028/final-contact-sheet.jpg`, incluindo aviso original, CTA e morte.
- Recortes sem faixa de ?udio; webcam exclu?da geometricamente antes de toda composi??o. Produ??es anteriores preservadas, sem transa??o de limpeza.
