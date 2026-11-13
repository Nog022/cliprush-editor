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

## Validação executada antes da aprovação
- Lint e TypeScript de `src`; TypeScript e build desktop: passaram.
- Seis testes de núcleo desktop: passaram.
- Doze testes de retenção: passaram, incluindo exportação simulada seguinte, observador do Studio, backup, rollback, restauração, conflitos, dependências e caminhos externos.
- MP4 017: metadados 1080×1920, 30 fps e duração esperada; decodificação integral passou.
- Bundle e renderização de um frame da composição 017: passaram.
- Os testes completos da interface Electron não foram executados nesta etapa.
- Compilação e renderização **depois da exclusão real** dependem da confirmação e serão executadas pela transação.

Auditorias JSON e `Root.before.tsx` em `out/` são registros históricos preservados, não raízes de execução. Bundles gerados não determinam dependências da fonte. Arquivos de propriedade incerta e MP4 sem finalidade comprovada permanecem preservados e constam no inventário.
