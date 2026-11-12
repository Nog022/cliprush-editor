# Prompt — Codex: instalar a nova direção visual uma vez

No projeto `cliprush-editor`, leia `AGENTS.md`, `PROMPT_EDICAO_CLIPRUSH.md`, `skills/cliprush-retencao-visual/SKILL.md` e `docs/ANALISE_LEONIDA_REFERENCIA.md`.

Confirme a estrutura do projeto e adapte `src/cliprush-retention/RetentionEffects.tsx` como componentes compartilhados sem duplicar implementações existentes. Integre, quando realmente úteis, `FocusZoom`, `FocusMarker`, `SyncedCaptions`, `ComparisonOverlay`, `ExplainerHUD`, `SourceProof` e `ContextualCTA` à arquitetura atual. Não altere nem renderize vídeos anteriores. Preserve `MyComp`, RTK/CodeGraph/skills existentes e o áudio de cada vídeo. Registre uma demo independente apenas se for necessário validar. Verifique TypeScript, preview de início/meio/fim, crop 9:16, legibilidade e posições; liste os arquivos alterados e os testes executados.

**Critério de aceite:** um futuro vídeo pode declarar `start/end`, asset, origem temporal, alvo focal, legenda e efeito num mapa JSON sem implementar manualmente o efeito toda vez. Não inventar coordenadas nem timestamps.
