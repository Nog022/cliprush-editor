---
name: cliprush-edicao
description: Criar ou ajustar vídeo narrado no ClipRush Editor com Remotion, preservando qualidade cinematográfica e reduzindo leituras e reprocessamento. Usar em pedidos de edição/produção de video-NNN; não usar para manutenção geral do app ou auditoria de tokens.
---

# Produção orientada por mídia real
1. Determinar `video-NNN` e listar somente `public/videos/video-NNN/` e `src/videos/video-NNN/` (se existir); reconhecer aliases `narracao`, `audio`, `footage`, `images`, `imagens`, `roteiro`.
2. Ler roteiro disponível e duração real do áudio (skill `cliprush-midia` se necessário); criar internamente storyboard curto por blocos de fala. Não transcrever áudio se o roteiro já corresponder à narração.
3. Associar trechos aos recursos locais. Para GTA, consultar `cliprush-catalogo` apenas nas frases que precisem de B-roll; não consultar todos os vídeos da biblioteca.
4. Construir cenas com progressão, foco no detalhe, movimentos de câmera e transições que expliquem a narração. Preservar narração, não repetir cenas para ocupar tempo; priorizar clareza, estética e ritmo sobre economia artificial.
5. Modificar só nova composição e pontos mínimos de registro/reuso. Validar primeiro TypeScript e preview(s) dos trechos afetados. Render MP4 somente quando o pedido for produzir/exportar vídeo.
6. Se houver problema de timing, corrigir nos blocos afetados; não refazer render completo nem gerar novos créditos de voz sem motivo.
7. Entregar de forma curta: arquivo/ID, duração, qualidade validada, bloqueios. Consultar guia criativo mestre apenas para regra estilística específica ainda não contemplada.
