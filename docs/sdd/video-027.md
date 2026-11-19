# Spec: video-027 — tinta, assalto e tentativa de fuga

**Classe:** M | **Alvo:** `src/videos/video-027` | **Estado:** em execução

## Resultado esperado
MP4 vertical de 1080×1920, 30 FPS, com a narração original inteira (36,833 s), legendas por palavra e foco investigativo. Abrir na tinta rosa, contextualizar o assalto e encerrar na tentativa de fuga.

## Entradas disponíveis
- `public/videos/video-027/audio/narracao.mp3`.
- Biblioteca: `gta6/videos/alanzoka/ALANZOKA ABRINDO GTA 6 PELA 1 VEZ! [eZE6PtAf8vE].mp4`, 1920×1080, 60 FPS, 1332,934 s.
- Transcrição local única com modelo já em cache, timestamps por palavra em words.json.

## Escopo
**Fazer:** nova composição ClipRush027, registro mínimo em Root, recortes locais sem áudio, previews por bloco, exportação nova e validação integral.
**Não fazer:** modificar vídeos anteriores, limpar produções, reindexar, baixar arquivos, gerar nova voz.

## Regras inegociáveis
- Webcam muda de canto: assalto superior direito; 14:30 superior esquerdo; 14:40 em diante inferior direito. Recortes físicos excluem cada região antes de qualquer fundo/zoom.
- Áudio dos recortes removido com `-an`; somente narração entra no MP4.
- Preservação explícita do usuário prevalece sobre retenção automática. Exportador chama completeProduction com validationOnly:true, validando sem limpeza.
- Sem acrescentar mecânicas ou confirmar hipóteses. Pergunta final permanece pergunta.

## Validação dos intervalos
- 12:00–12:25: assalto, coleta de dinheiro e saída; validado visualmente em 12:00, 12:05, 12:10, 12:18, 12:24.
- 14:30–14:37: deslocamento e aviso de descrição conhecida; validado em 14:30, 14:32, 14:34, 14:36.
- 14:40–14:50: aviso, explosão rosa e corrida; validado em 14:40, 14:43, 14:45, 14:46, 14:49.
- 14:55–15:08: tentativa junto ao carro seguida por detenção; validado em 14:55, 14:59, 15:03, 15:07. Usar somente início, sem apresentar fuga bem-sucedida.

## Aceitação objetiva
- [x] 1105 frames, áudio preservado, 1080×1920 a 30 FPS.
- [x] Todos os blocos visualmente conferidos e legendas legíveis.
- [x] Nenhuma webcam ou comentário de streamer no MP4.
- [x] TypeScript/lint e decodificação integral sem erros.
- [x] Produções e ajustes anteriores preservados.

## Riscos e incertezas
A narração fornecida faz afirmações sobre GTA 6; a montagem não as amplia nem autentica a origem do gameplay. Último trecho termina em detenção, portanto encerramento mostra tentativa de fuga.

## Decis?es editoriais
Sem CTA: a pergunta final e a prova visual t?m prioridade, sem prolongar a narra??o. Recortes finais excluem textos inferiores e HUDs cortados; o aviso completo ? reinserido como prova. A explos?o recebe recorte de detalhe separado, livre de webcam e textos.

## Entrega verificada
- `deliveries/video-027-final-20261118-v1.mp4`: 44.622.435 bytes, H.264 CRF 18, AAC 320 kbps, 1105 frames, 36,843 s.
- TypeScript e ESLint dos arquivos alterados aprovados.
- completeProduction(validationOnly:true): metadados e decodifica??o integral aprovados. SHA-256: `836367fc972c14443691f3a6969e560f0a850f0019cadc961c6d58380cd1fe89`.
- ?udio final correlacionado ? narra??o original: 0,999970; deslocamento 0 amostras a 16 kHz. Recortes de origem sem faixa de ?udio.
- Confer?ncia visual final de 12 frames em `out/video-027/final-contact-sheet.jpg`; abertura mostra a nuvem rosa, assalto e aviso leg?veis, encerramento em corrida.
- Nenhuma transa??o de reten??o/limpeza executada. V?deos anteriores preservados.
