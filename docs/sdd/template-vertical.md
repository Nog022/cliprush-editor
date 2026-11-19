# Spec: template vertical webcam_top_gameplay_bottom

**Classe:** M | **Alvo:** src/templates e out/template-webcam-9x16 | **Estado:** concluída e validada

## Resultado esperado
Composição Remotion reutilizável 1080×1920/60, webcam 40% e gameplay 60%, crop uniforme configurável e um único áudio. Trecho 875–910s da fonte fornecida, preservando a cadência original de 60 FPS, sem detector ou alteração do original.

## Entradas e interfaces
Fonte e metadados existentes; região detectada 1473,9,435,252. Props: src, sourceSize, webcamRegion, gameplayRegion, webcamHeightRatio, webcamFocus, startSeconds, durationSeconds. Coordenadas pertencem ao preset no Root, não ao template. Foco fixo na mediana dos rostos em cache (1649.25,151.5), limitado às bordas do painel.

## Escopo e invariantes
Adicionar componente e geometria, registro isolado, runner Remotion usando servidor existente, validação e relatório. Preservar composições e alterações em andamento. Não instalar, reanalisar, indexar ou limpar produções. completeProduction em modo validationOnly para este teste.

## Aceitação objetiva
- Crop proporcional e gameplay sem interseção com webcam; parâmetros inválidos recusados.
- Três frames representativos inspecionados antes do render 35s/2100 frames.
- MP4 H.264, 1080×1920, 60 FPS e exatamente um áudio AAC-LC.
- Decodificação integral, comparação temporal de áudio/vídeo e inspeção visual em início/meio/fim.

## Evidências finais
`out/template-webcam-9x16/relatorio.md` e `validation.json`: 1080×1920/60, 2100 frames, H.264 High 4:2:0, áudio AAC-LC estéreo com atraso medido 0 ms em três janelas. Typecheck, lint e três testes de geometria passaram. Componente final usa Video de @remotion/media; runner prepara apenas o intervalo exato sem perda e reutiliza cache, evitando o proxy OffthreadVideo que excedeu timeout nesta máquina.

## Riscos
A webcam original tem só 435×252 pixels: ampliar não recupera detalhe. O crop vertical exclui HUD lateral e pode excluir ação periférica; região de gameplay ajustável manualmente.
