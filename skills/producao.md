# Fluxo de produção ClipRush

1. Reservar um ID sequencial (`video-001`, `video-002` etc.) sem reutilizar pastas existentes para outra produção.
2. Preencher o briefing em `src/videos/<id>/README.md`: objetivo, público, roteiro, formato, fps, duração, assets e critérios de revisão.
3. Colocar cópias de trabalho das mídias em `public/videos/<id>/`, preservando os originais. Usar nomes descritivos e registrar a origem e os direitos de uso no briefing.
4. Ler `remotion-create` e as skills necessárias. Abrir o Studio antes de implementar a composição. Criar o código em `src/videos/<id>/` e registrar seu ID em `src/Root.tsx`, preservando `MyComp`.
5. Reutilizar componentes em `src/components/` quando houver uso compartilhado. Usar `staticFile()` para mídia pública e animações determinadas pelo frame.
6. Revisar no Studio início, fim, cortes, legibilidade, áudio e legendas. Executar TypeScript e lint.
7. Quando a exportação for solicitada, ler `remotion-render`, criar `out/<id>/` se necessário e usar nome versionado que ainda não exista. Conferir o arquivo final antes da entrega.
