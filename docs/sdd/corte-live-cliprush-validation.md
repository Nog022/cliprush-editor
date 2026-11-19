# Corte de Live - ClipRush — entrega e validação

Validado em 18/11/2026. Preset permanente na criação de projetos: **Corte de Live - ClipRush**. Formato fixo 1080×1920, 30 FPS. Após importar e adicionar o vídeo, definir o trecho, usar **Analisar trecho**, revisar as regiões e clicar em **Aplicar enquadramento ao preset**. O campo **Legenda personalizada** é editável e salvo no projeto. Alterar o trecho exige reaplicar o enquadramento; exportação com enquadramento antigo é recusada.

## Entrega

- MP4: `out/corte-live-alanzoka-2014-2030-6cec32d5.mp4`.
- SHA-256: `BF08476648A74992A61A4C102F472950118D26D551F3F716B6B31B0D3D150DC8`.
- Fonte local: `public/videos/biblioteca/gta6/videos/alanzoka/ALANZOKA ABRINDO GTA 6 PELA 1 VEZ! [eZE6PtAf8vE].mp4`.
- Intervalo real: 1214–1230 s (20:14–20:30), 480 quadros, H.264/AAC, 1080×1920, 30 FPS, 16 s. Não houve download.
- Texto demonstrativo: **ALANZOKA • CORTE DA LIVE**. A legenda é um título personalizado, não uma transcrição da fala.
- Dados, projeto e evidências de teste: `out/corte-live-test-8a5596ab-e0c4-4e47-a805-87521665698a/`. O banco real do usuário não foi alterado.

## Reutilização e comportamento

- Detector e ajuste manual: `analyzeClip`/`analyze-segment.py`, sem mudanças no algoritmo.
- Recorte: `coverRegion` e `WebcamTopGameplayBottom`, com posições opcionais; padrão anterior preservado.
- Webcam: x145/y145/790×390. Gameplay: x20/y595/1040×865. Texto: x50/y1510/980×115, Arial branca, negrito, centralizada, tamanho medido automaticamente.
- A imagem original foi preservada. Uma máscara SVG de alfa na camada visual abre as duas janelas, sem remover cores ou molduras da referência. Player e renderer carregam a mesma imagem empacotada.
- Render: mesmo `RenderService` e `ProjectComposition` do desktop. A preparação H.264 sem perdas + áudio PCM já usada pelo runner de templates foi extraída para uma função compartilhada e cacheada. O projeto e sua fonte original permanecem intactos. Sem renderizador, detector ou pipeline paralelo.

## Verificações concluídas

- `desktop:typecheck`: passou.
- ESLint nos arquivos alterados: passou.
- `desktop:build`: passou; 12 composições anteriores preservadas no manifesto.
- `desktop:test`: 19/19 passaram, incluindo persistência, enquadramento inválido e regressões tradicionais.
- Geometria anterior: 3/3 testes passaram com `node --experimental-strip-types --test tests/template-webcam.test.mjs`.
- E2E do preset: passou com Electron, workspace isolado, criação pela UI, detecção existente, ajuste manual existente, aplicação, edição, persistência, ajuste de legenda longa, seek no Player e exportação MP4 real.
- Frames 0/240/479 inspecionados antes da exportação. Frames extraídos do MP4 comparados à composição de referência: erro RGB médio 2,26–2,32/255, percentil 95 = 8/255, compatível com compressão H.264. Janelas, tempo e legenda correspondem à composição do preview.
- Áudio: comparação de 256.000 amostras a 16 kHz com a fonte em 20:14–20:30; deslocamento medido **0 ms**, correlação **0,99991677**.
- `ffprobe` confirmou dimensões, FPS, duração, 480 quadros e faixa de áudio; FFmpeg decodificou integralmente o MP4 sem erros.
- A cópia de entrega tem o mesmo SHA-256 do MP4 exportado pelo desktop. Nenhuma produção numerada foi criada ou removida; retenção não foi acionada.

## Problemas encontrados e tratamento

1. A pasta indicada inicialmente não existia. A referência real estava em `public/videos/template/corte-live.png`; foi copiada para `public/templates/corte-live/template.png`, preservando o original.
2. Nesse trecho, o detector identificou o rosto mas não uma borda fechada para a webcam. Foi usado o ajuste manual **existente**, confirmado visualmente: x1488/y754/424×268 na fonte 1920×1080, excluindo a faixa de inscrições. A análise automática original e o ajuste estão documentados nos artefatos. Não foi alegada detecção automática bem-sucedida da webcam.
3. A renderização sequencial do AV1 longo travou no decoder de mídia, apesar dos stills funcionarem. Aumentar timeout/serializar não resolveu; essas mudanças foram removidas. A rotina sem perdas existente resolveu a exportação e passou na comparação de áudio/imagem.
4. O endereço de assets difere entre `staticFile()` no render e no Player desktop. A imagem agora é empacotada na mesma rota raiz dos dois bundles; o teste real de exportação comprova a correção.
5. O crop proporcional conserva a região central; textos do HUD nas extremidades da gameplay podem ficar parcialmente fora da janela. O trecho solicitado mostra gameplay de GTA V, embora o título do arquivo mencione GTA 6; por isso a legenda demonstrativa é neutra.

O Electron exigiu execução do teste fora do sandbox de terminal por uma restrição de ACL do Windows, mantendo o sandbox de segurança do aplicativo ativo. Um teste existente apresentou EBUSY na limpeza dentro do sandbox; a suíte completa passou fora dele. A tentativa de verificar um cache antigo de outro template encontrou a fonte em seu caminho antigo ausente; essa mídia não foi alterada nem renderizada.

## Arquivos desta integração

- `public/templates/corte-live/template.png`
- `shared/model.ts`, `shared/validation.ts`, `shared/live-preset.ts`
- `desktop/store.ts`, `desktop/render.ts`
- `studio/App.tsx`, `studio/ProjectComposition.tsx`, `studio/LiveOverlay.tsx`
- `studio/editor/ClipList.tsx`, `studio/editor/ClipAnalysis.tsx`
- `src/templates/webcam_top_gameplay_bottom/index.tsx`
- `scripts/build-desktop.mjs`, `scripts/render-template.mjs`
- `scripts/prepare-template-media.mjs`, `scripts/prepare-template-media.d.mts`
- `tests/desktop/core.test.ts`, `tests/desktop/live-preset.test.ts`, `tests/desktop/live-preset.e2e.ts`
- `docs/sdd/corte-live-cliprush.md`, `docs/sdd/corte-live-cliprush-validation.md`

Arquivos já modificados antes da tarefa foram preservados; a lista descreve somente os pontos tocados nesta integração. Artefatos de QA e o script de comparação ficam em `out/`.
