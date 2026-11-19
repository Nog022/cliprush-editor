# Spec — Bully e o poder da conversa

**Classe** M · **Alvo** `video-023` · **Estado** em produção

## Resultado esperado
MP4 vertical de 1080×1920, 30 fps, com 1221 frames derivados dos 40,673 segundos da narração original. Montagem cinematográfica com Bully e GTA VI da biblioteca, legendas sincronizadas e progressão da comparação até a hipótese final.

## Entradas disponíveis
- `public/videos/video-023/audio/narracao.mp3`.
- Trailer oficial de Bully na biblioteca e Trailer 2 de GTA VI.
- Transcrição local única com timestamps em `src/videos/video-023/words.json`.

## Escopo
Criar composição, legendas, recursos sonoros discretos do CTA e registro mínimo no Root. Reutilizar servidor e renderer existentes. Materiais de outros projetos, biblioteca e alterações em andamento ficam preservados conforme o fluxo de retenção vigente.

## Regras inegociáveis
- Áudio original integral e sem retiming.
- Hipótese sobre GTA VI identificada na tela. Trailer de Bully usado como ilustração, com indicação visível nas explicações da mecânica.
- Cortes e foco visual relacionados à narração, legendas legíveis e dentro da área segura.
- CTA entre 20,72 e 23,4 segundos, acompanhando a fala existente.
- Consultas e metadados em cache, sem reindexação ou download.

## Aceitação objetiva
- [x] TypeScript e lint da composição passam.
- [x] Frame representativo de cada bloco inspecionado antes da exportação.
- [x] MP4 H.264 CRF 18 com áudio AAC e resolução/duração corretas.
- [x] Decodificação integral e presença do CTA verificadas na entrega.

## Riscos e incertezas
O trailer local de Bully oferece cenas ilustrativas. A biblioteca selecionada não oferece captura específica da quinta aula ou da interface de desculpas. A fala sobre diálogo em GTA VI permanece preservada no áudio, com trailer de contexto e indicação da hipótese da mecânica.

## Entrega verificada
`deliveries/video-023-final-20261116-v1.mp4`, 40,704 s, 1080 × 1920, 30 fps, H.264 e AAC estéreo 48 kHz, 27.257.467 bytes. Exportação única pelo fluxo integrado, com decodificação integral bem-sucedida. CTA conferido no MP4 aos 23,1 s. Frames dos 13 blocos conferidos antes da exportação. `tsc` e lint passaram. SHA-256 `cd867634c60e5fcd8092ae02a0a7b6e921e0cc1503da92385cc3d412ccd96f9c`.

O fluxo retornou `pendingInitialApproval` para a retenção, mantendo as produções anteriores. A prévia integrada do navegador estava indisponível, e a revisão visual foi feita pelos frames renderizados e pelo MP4 exportado.
