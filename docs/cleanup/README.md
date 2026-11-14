# Revisão da limpeza inicial

Implementação pronta para revisão; **nenhuma exclusão real autorizada ou executada**. A limpeza automática permanece desabilitada até a conclusão da primeira transação confirmada.

Lista completa por arquivo, ação, bytes e motivo: [initial-plan.md](initial-plan.md). Manifesto com hashes e alteração proposta do Root: [initial-plan.json](initial-plan.json). O inventário é revalidado antes da transação; mudanças nas dependências ou nos candidatos impedem a aplicação de uma lista obsoleta.

## Operação
- `npm run dev`: Studio com observador de MP4 em `out/` e `deliveries/`, sem cópia da biblioteca. Prévia, exportação incompleta e duração divergente não autorizam limpeza.
- `npm run render -- ClipRushNNN versao-unica`: exportação manual com resolução completa dos metadados e finalização automática.
- `scripts/render-video-017.mjs`: finalização integrada; frames e previews não limpam.
- Exportação desktop e `autoRender` usam o mesmo serviço. Projetos com nome exato `video-NNN` entram na retenção numerada; mídias e bancos de todos os projetos desktop são preservados e suas referências protegem dependências. Aplicativo empacotado sem árvore de produção não remove arquivos do projeto-fonte.
- Chamadas diretas a outro script ou a `npx remotion render` fora do Studio observado precisam usar `completeProduction`. Não há alteração em pacotes do Remotion nem daemon instalado no sistema.

Após confirmação explícita da lista, aplicar com `node scripts/production-retention.mjs apply-initial out/video-017/video-017-v001.mp4 --confirmed`. O comando valida o 017, copia a entrega sem sobrescrever, verifica o projeto, cria backup comprimido/deduplicado com hashes, transfere os MP4 anteriores, remove somente candidatos comprovados e atualiza registros. Repete compilação e frame do vídeo atual e recompila o catálogo desktop. A primeira transação concluída grava `out/retention/enabled.json`, habilitando as seguintes automaticamente.

Backups: `out/retention/backups/ID`, incluindo manifesto, blobs comprimidos por hash e relatório. Restaurar: `node scripts/production-retention.mjs restore out/retention/backups/ID`. A restauração verifica todos os hashes antes de escrever e recusa conflitos com alterações posteriores. Depois de restaurar uma produção histórica, recompilar o desktop para repor seus registros na interface. Backup não é apagado automaticamente. Lock residual após interrupção abrupta exige recuperação e revisão antes de liberar nova transação.

O relatório distingue bytes de produção removidos, bytes de backup, bytes de entregas adicionadas e saldo líquido de conteúdo. O saldo não representa blocos físicos do disco e pode ser pequeno ou negativo porque os backups são conservados. Diretórios vazios são mantidos.

## Evidência histórica da implementação inicial
- Lint e TypeScript de `src`; TypeScript e build desktop: passaram.
- Seis testes de núcleo desktop: passaram.
- Doze testes de retenção: passaram, incluindo exportação simulada seguinte, observador do Studio, backup, rollback, restauração, conflitos, dependências e caminhos externos.
- MP4 017: metadados 1080×1920, 30 fps e duração esperada; decodificação integral passou.
- Bundle e renderização de um frame da composição 017: passaram.
- Os testes completos da interface Electron não foram executados nesta etapa.
- Compilação e renderização **depois da exclusão real** dependem da confirmação e serão executadas pela transação.

Auditorias JSON e `Root.before.tsx` em `out/` são registros históricos preservados, não raízes de execução. Bundles gerados não determinam dependências da fonte. Arquivos de propriedade incerta e MP4 sem finalidade comprovada permanecem preservados e constam no inventário.

## Revisão de compatibilidade de 2026-11-13

A política ativa é `recoverable-v1`. Manifestos e habilitações de outra política exigem inventário atualizado e confirmação inicial. Execute `npm run retention:plan` antes de revisar uma nova limpeza, pois o inventário histórico antecede a recuperação das mídias LFS e as alterações de código. Backups existentes ficam fora da seleção de candidatos.

A transação compila o registro proposto antes da mutação e verifica o projeto resultante após a limpeza. O inventário atualizado fornece os hashes usados na comparação do plano. Cada backup comprimido é verificado integralmente, com deduplicação por hash dentro da transação. Os relatórios são persistidos por fase e ao concluir ou falhar. O manifesto do backup permite recuperar todos os arquivos da transação após interrupção abrupta, mesmo quando o relatório de fase antecede algumas exclusões. Revise o lock residual antes da recuperação manual.

Os testes de retenção cobrem rollback, restauração, conflitos, corrupção de backup, falha parcial de exclusão e ponteiros LFS pendentes. A validação da interface usa workspace descartável em `out/`. O teste `packaged.e2e.ts` aceita `CLIPRUSH_PACKAGED_EXE` para exercer o executável empacotado. Na revisão de 2026-11-13, os 15 testes de retenção e os seis testes de núcleo passaram. O pacote foi gerado e seus recursos conferidos. As tentativas de integração do executável ficaram bloqueadas na inicialização/conexão do Electron. A exportação MP4 empacotada permanece pendente de comprovação.

Na versão instalada do bundler, `publicDir: null` seleciona a pasta `public`. Os pontos ativos usam um caminho único ausente para produzir bundles com as mídias fornecidas pelos servidores existentes. O pacote filtra resíduos antigos em `dist/render/public`. Essa pasta residual pode ser revisada para exclusão após autorização, junto dos bundles antigos. O desktop inclui o renderer, seus binários nativos, o bundle de render e o script de busca com caminho explícito para o catálogo empacotado.
