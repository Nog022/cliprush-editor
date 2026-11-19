# Gameplay centralizado — validação

Entrega: `out/corte-live-alanzoka-gameplay-centralizado-9008c52a.mp4`.
SHA-256: `84EF03918991051A5CED12F09A6AE72B807D3AA4B38777029C7C69EF50DB3D0C`.

Fonte local eZE6PtAf8vE, 20:14–20:30, 16 s, 1080×1920, 30 FPS, 480 quadros, H.264/AAC. A exportação anterior foi preservada. Não houve download, instalação de pacote/modelo, novo renderizador ou alteração no pipeline de exportação.

## Ajuste

O centro da região segura à esquerda da webcam não coincide com o centro da gameplay original. O preset agora usa foco independente no centro horizontal da fonte, com posição Y em 60% e zoom proporcional 1,25. O ponto focal fica em x=520 dentro da janela de 1040 pixels, sem invadir a webcam embutida. O barco permanece visualmente centralizado nos frames 0/240/479.

O painel **Enquadramento do gameplay · preview**, disponível por clipe no editor, oferece sliders **Gameplay x**, **Gameplay y**, **Gameplay zoom**, seleção automático/manual, reset e **Detectar foco do gameplay**. A edição atualiza o Player e é persistida no enquadramento do clipe; os mesmos valores são usados no MP4. Outros presets mantêm o comportamento anterior.

O foco automático reutiliza as observações do detector YuNet existente: rosto central único, confiança ≥0,9, contido na região segura, pelo menos 3 amostras e cobertura ≥60%, com consistência temporal. A trajetória ignora baixa confiança e saltos ambíguos, tem zona morta, velocidade limitada e interpolação smoothstep determinística por quadro. Não usa animação CSS nem estado dependente da ordem de renderização.

**Limitação explícita:** esse detector identifica rostos; não é um classificador de veículos ou garantia de identidade do protagonista. Não existe modelo local de barcos. No trecho solicitado, a análise completa não encontrou alvo confiável e corretamente se absteve. A entrega usa posição manual X=50%, Y=60%, zoom=1,25. Não foi alegada detecção automática do barco. O centro padrão também corrige esse trecho, sem depender de detecção falsa. O OpenCV local não expõe HOG; a solução final reutiliza somente YuNet e não acrescenta outro detector.

Para preservar mais HUD, reduzir o zoom e reposicionar manualmente é possível, respeitando os limites da região segura. Centralizar o barco sem revelar a webcam original exige restringir a área lateral visível; o HUD nas extremidades não pode ser preservado integralmente nesse enquadramento. A imagem não é esticada.

## Validação executada

- `desktop:typecheck`, build e ESLint direcionado: passaram.
- Testes desktop: 21/21 passaram, incluindo centralização, limites, suavização, baixa confiança e regressões.
- Worker de análise: 11/11 passaram, incluindo candidato confiável único, ambiguidade, baixa confiança e exclusão da webcam.
- Geometria anterior: 3/3 passaram.
- E2E Electron: passou com criação, detecção de webcam existente, aplicação, foco opcional, análise completa sem falso positivo no barco, controles X/Y/zoom, persistência, preview e exportação real. Dados isolados via CLIPRUSH_DATA_HOME; banco real preservado.
- Frames 0/240/479 inspecionados antes da exportação e novamente comparados após extração do MP4. Erro RGB médio contra a composição de referência: 2,28–2,29/255, percentil 95 = 8/255, compatível com compressão H.264.
- Comparação com a entrega anterior, fora do gameplay: webcam com erro médio 0–0,95/255; arte do template com 0,22–0,23/255. Dimensões, recorte, posição da webcam e imagem do template permanecem iguais. A comparação inclui diferenças de compressão.
- Áudio: 256.000 amostras a 16 kHz, deslocamento **0 ms**, correlação **0,99991677** com a fonte original.
- ffprobe confirmou duração, dimensões, FPS, quadros e áudio. FFmpeg decodificou integralmente o MP4 sem erros. Cópia final tem o mesmo SHA-256 do arquivo exportado pelo desktop.

Evidências: `out/corte-live-test-8a5596ab-e0c4-4e47-a805-87521665698a/`, especialmente `project.json`, `gameplay-focus-analysis.json`, `gameplay-invariants.json`, `quality-validation.json`, `result.json`, `desktop-preview.png` e `mp4-frame-{0,240,479}.png`.

## Arquivos desta revisão

- `shared/gameplay-focus.ts`, `shared/live-preset.ts`, `shared/visual-analysis.ts`
- `src/templates/webcam_top_gameplay_bottom/geometry.ts`, `src/templates/webcam_top_gameplay_bottom/index.tsx`
- `studio/ProjectComposition.tsx`, `studio/editor/GameplayFraming.tsx`, `studio/editor/ClipList.tsx`
- `desktop/visual-analysis.ts`, `scripts/analyze-segment.py`
- `tests/desktop/live-preset.test.ts`, `tests/desktop/live-preset.e2e.ts`, `tests/desktop/visual-worker.test.py`
- `docs/sdd/corte-live-gameplay-focus.md`, este relatório; scripts/evidências de QA em `out/`.

`studio/LiveOverlay.tsx`, a imagem do template, áudio e preparação/exportação de mídia não foram alterados nesta revisão. Nenhuma exportação foi sobrescrita ou produção removida.
