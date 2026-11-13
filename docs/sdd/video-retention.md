# Spec: retenção de produções

**Classe:** G | **Alvo:** scripts de produção e exportação desktop | **Estado:** implementação; exclusão inicial depende de aprovação do inventário

## Resultado esperado
Conservar a produção atual e entregas MP4 anteriores. Classificar arquivos em toda a raiz, resolver referências internas e preservar propriedade incerta, ferramentas e biblioteca. Nunca remover dados externos ou projetos do desktop.

## Entradas e escopo
017 é a produção atual. Reutilizar Root.tsx, render-video-017.mjs, RenderService (comum às exportações manuais/automáticas), TypeScript, FFmpeg e FFprobe já instalados. Não instalar pacotes nem reindexar.

## Invariantes
- Inventário inicial completo e confirmação explícita antes de apagar ou alterar registros antigos.
- Backup comprimido, hashes, restauração sem sobrescrita e rollback em falhas.
- Rejeitar travessia, links e junções; caminhos sempre relativos à raiz canônica.
- Preservar AGENTS, skills, SDD, RTK, CodeGraph, MyComp, biblioteca, ferramentas genéricas, produções atuais/futuras e dependências retidas.
- Conclusão exige MP4 decodificável, metadados esperados e compilação. Geração sem exportação não limpa.

## Plano e tarefas
| Etapa | Arquivos | Validação |
|---|---|---|
| Inventário e dependências | scripts/video-retention.mjs | fixtures de referências e arquivos espalhados |
| Transação e restauração | mesmo módulo | falhas, hashes, escape, MP4, rollback |
| Integração | render 017, wrapper manual, desktop/render.ts | typecheck e testes; nenhum banco real |
| Política e revisão inicial | AGENTS.md, docs/cleanup | lista completa revisável, sem exclusão antes de confirmação |

## Rollback e riscos
Backup em out/retention/backups, fora de public; retenção indefinida, sem purge automático. Isso reduz o ganho líquido de espaço. Referências construídas dinamicamente podem exigir preservação por proprietário inteiro. Exportações desktop sem identificador video-NNN não provam propriedade e não autorizam excluir produções numeradas.

## Aceitação
Testes simulados sem remover produções reais; compilação src/desktop; 017 selecionável e frame renderizável; relatório de candidatos com motivos e hashes. Limpeza inicial e evidência posterior somente após confirmação.

## Estado de entrega
Implementação e verificações prévias concluídas; inventário em `docs/cleanup/initial-plan.md`. Doze testes de retenção, seis de núcleo desktop, lint, typechecks, build desktop, metadados/decode integral do 017 e frame da composição passaram. Aguardando confirmação explícita do inventário inicial; nenhuma exclusão real executada. Integração Studio por observador de exportações, script manual comum e serviço desktop. Ver `docs/cleanup/README.md` para limites e recuperação.
