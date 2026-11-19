# Validação — vídeo 032

## Montagem e fontes
- Composição `ClipRush032`, 1322 frames, 30 fps, 1080×1920.
- Narração de 44,042 s preservada integralmente; 110 palavras com timestamps, transcritas uma única vez com modelo local em cache.
- Clipe da biblioteca de 180,024 s; nenhum download, reindexação ou conversão integral da fonte.
- 12 blocos autorais: gancho, perseguição, embarque, manobra, aceleração, decolagem, curvas, nuvens, CTA, preparação, salto e desfecho.
- Trilha original discreta com dois acentos sonoros nos CTAs; não usa áudio/música de origem incerta do clipe.

## Verificações executadas
- `npx.cmd tsc --noEmit`: passou.
- `npx.cmd eslint src/videos/video-032/ClipRush032.tsx src/Root.tsx`: passou.
- Prévias dos 12 blocos e de ambos os CTAs renderizadas e inspecionadas. Textos que quebravam em três linhas foram encurtados e os quatro blocos afetados revisados novamente.
- Frame 1155 confirma abertura do paraquedas em sincronia com a legenda “e abre o paraquedas”.
- MP4 final exportado uma única vez pelo fluxo `npm run render -- ClipRush032 final-20261119-v1`.
- `completeProduction`: metadados, decodificação integral de vídeo/áudio e compilação src/desktop concluídos com sucesso; retenção não executada por falta de confirmação inicial.
- Arquivo `deliveries/video-032-final-20261119-v1.mp4`: 31.413.191 bytes; vídeo 44,0667 s, contêiner 44,075 s, H.264/AAC, 1080×1920, 30 fps.
- CTAs conferidos no próprio MP4 em 28,7 e 30,4 s; paraquedas em 38,5 s e encerramento em 43,7 s visíveis e legíveis.
- Narração comparada ao áudio decodificado da entrega: correlação 0,99448 integral e 0,99692 na frase final; pico de áudio -1,07 dBFS, sem clipping.
- SHA-256: `ee4023a3ee011d65724de0de8847ff8cbd6a8b5c0cfaf0a90631dee3a2668292`. Evidências locais em `out/video-032/validation.json` e `out/video-032/final-check.jpg`.

## Preservação
- Registro mínimo de import e composição no Root; as composições presentes no início da tarefa foram preservadas.
- Não houve edição de desktop, biblioteca ou produções anteriores.
- Retenção automática condicionada pelo fluxo existente à confirmação inicial; nenhuma confirmação presumida.
