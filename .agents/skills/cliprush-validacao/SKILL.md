---
name: cliprush-validacao
description: Validar alterações no ClipRush Editor de forma progressiva e proporcional, preservando a qualidade final. Usar após implementar código, cena, render ou fluxo desktop; não executar render completo em pedidos só de documentação.
---

# Escada de validação
1. Verificar somente diffs e arquivos alterados; rodar lint/typecheck direcionado quando possível. Escalar ao `npm run lint` completo se alteração transversal ou risco de regressão.
2. Mudança em composição: conferir IDs, referências `staticFile`, duração, resolução, legendas, visibilidade de detalhes e sincronização; começar com 1–3 frames de pontos críticos. Antes de MP4 completo autorizado, validar visualmente um frame representativo de cada bloco, conforme `src/videos/AGENTS.md`.
3. Produção/exportação solicitada: render único em caminho novo; confirmar com `ffprobe` duração, áudio, dimensões e reprodução básica. Não reduzir qualidade da exportação para economizar tempo sem autorização.
4. Correção pontual: testar cena/trecho afetado e impactos reais. Não renderizar vídeo inteiro por reflexo a cada iteração.
5. Falha repetida: após duas tentativas sem progresso, investigar erro raiz. Não executar ciclos de reparo sem evidência.
6. Desktop: testes e2e só para caminhos de integração impactados, com `CLIPRUSH_DATA_HOME` temporário; nunca alterar banco de uso real.
7. Informar o que passou, não foi executado e por quê. Não marcar como validado sem executar.
