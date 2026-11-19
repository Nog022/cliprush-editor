# Spec: Grassrivers — perigo no pântano

**Classe:** M | **Alvo:** `video-022` | **Estado:** concluída e validada

## Resultado esperado
MP4 vertical cinematográfico de 48,533 s, 1080×1920 a 30 fps, preservando integralmente a narração de 48,509 s. Contexto, ampliações e marcadores conduzem o olhar às provas das duas imagens Grassrivers; a hipótese final fica explicitamente identificada.

## Entradas disponíveis
- `public/videos/video-022/audio/narracao.mp3`; sem roteiro ou timestamps prévios. Transcrição local única com modelo já instalado, sem downloads, em `src/videos/video-022/`.
- Biblioteca: `gta6/imagens novas/grassrivers-01.jpg` e `grassrivers-03.jpg`, ambas inspecionadas.
- B-roll: `Trailer 1 GTA VI.mp4`, 19,2–20,7 s; aerobarco no pântano, inspecionado. Usar como contexto, sem afirmar mecânica de jogo.

## Escopo
Criar composição, legendas JSON, prévias e registro mínimo em Root. Reutilizar ferramentas de preview/exportação existentes. Preservar MyComp, alterações preexistentes, narração e biblioteca. Não gerar imagens nem reindexar.

## Montagem
- 0–5,18 s: jacaré em primeiro plano; abrir contexto sem antecipar o felino.
- 5,18–9,54 s: homem sentado → detalhe do felino no banco.
- 9,54–15,86 s: pessoas armadas → aerobarco → placa à direita.
- 15,86–18,8 s: CTA conforme fala original, com animação discreta.
- 18,8–25,34 s: segunda imagem e três jacarés, com marcadores na posição real.
- 25,34–35,38 s: hipótese sobre encontros; pessoas armadas, B-roll curto e animal.
- 35,38–39,94 s: contraste visual caçador / jacaré, sem simular gameplay.
- 39,94–48,533 s: ressalva e pergunta final, imagens originais com recuo de câmera.

## Aceitação objetiva
- [x] Áudio original completo; legendas por palavras sem cortes de fala.
- [x] Frame representativo de cada plano inspecionado antes do MP4; prancha em `out/video-022/contact-sheet.jpg`. Ajuste pontual de timing no B-roll conferido nos frames 960, 1025 e 1050.
- [x] TypeScript e lint do escopo sem erros.
- [x] Exportação única CRF 18 / AAC 320k; duração, dimensões, áudio e decodificação integral validados por `completeProduction`.
- [x] CTA confirmado no arquivo final em 17,5 s (`out/video-022/final-cta.jpg`); hipótese identificada durante todo trecho especulativo.
- [x] Pipeline `npm run render` executou `completeProduction`. Retenção retornou `pendingInitialApproval: true`; nenhuma limpeza executada.

## Entrega e evidências
- `deliveries/video-022-grassrivers-final-20261115.mp4` — 34.535.769 bytes; contêiner 48,555 s (timeline 1456 frames / 48,533 s, pequena diferença de encapsulamento AAC), H.264 1080×1920 / 30 fps e áudio AAC.
- SHA-256: `adae17bee61d4c3b8432e9874cec22ddf93eee761183069a5bfb3feda8e62d98`.
- Validação automática incluiu decodificação integral, typecheck src/desktop, bundles src/studio e frame de comprovação da composição atual.
- As alterações preexistentes foram preservadas. O bloqueio 1909 do usuário de sandbox do Windows foi contornado com execução aprovada fora do sandbox, sem alterar configurações do sistema.

## Riscos e incertezas
A narração identifica um felino: mostrar o animal sem especificar espécie. Mecânicas de caça/perseguição são teoria. O navegador integrado está indisponível; Studio iniciado e validação visual será feita com frames do renderer.
