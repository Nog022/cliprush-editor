# Produção local automatizada

Classe G. Alvo desktop, studio e shared. Fluxo local implementado e validado.

## Resultado esperado

Criar, salvar, gerar e editar uma composição Remotion pela interface existente. Importar referências e reutilizar mídia gerenciada. Validar o resultado antes de promover a revisão e exportar MP4 com progresso e cancelamento.

## Entradas e interfaces

Reutilizar Store, revisão otimista, importFiles, pacotes, Player, Scene, Clip e RenderSettings. Codex app-server via JSON-RPC stdio com autenticação oficial, modelos e esforços descobertos. A saída estruturada altera os dados da composição compartilhada entre preview e render.

## Escopo e invariantes

Módulos desktop, studio, shared, scripts desktop e testes associados. Preservar fontes e produções anteriores, isolamento Electron, revisão anterior e arquivos exportados. Credenciais permanecem no Codex. Cada tarefa usa snapshot e promoção condicionada à revisão original. Codex usa sandbox somente leitura e aprovações explícitas. Referências textuais têm tamanho limitado.

## Etapas e validação

| Etapa | Arquivos | Validação |
| --- | --- | --- |
| Persistência e biblioteca reutilizável | shared, desktop/store, main, studio | TypeScript, domínio, pacote |
| Composição e exportação real | studio/ProjectComposition, desktop/render | frames reais, MP4 curto, cancelamento |
| Sessões e geração | desktop/codex, production, studio/editor | protocolo, falhas, saída inválida e revisão concorrente |
| Fluxo integrado | App, build, README | build, testes existentes e Electron e2e |

## Riscos e recuperação

Disponibilidade de autenticação, modelos e browser depende do ambiente. Tentativas de reparo limitadas a uma. Falhas preservam o projeto atual. Snapshot anterior pode ser restaurado pela interface sem remover revisões. Jobs interrompidos são identificados após reinício. Exportações usam nomes exclusivos.

## Aceitação

Verificar os doze critérios do pedido, ausência de Codex, mídia ausente, cancelamento, falha real e projetos antigos. A execução local tem prioridade. Acesso remoto exige uma arquitetura autenticada adicional e será avaliado após o fluxo local.

## Resultado da validação

TypeScript, lint, builds e seis testes de domínio passaram. Os dois novos testes Electron passaram, incluindo geração real com MP4 automático, retomada de sessão após reinício, edição incremental e cancelamento. O teste de produção independente do Codex cobre biblioteca, referências, pacote, relink, exportação com áudio e recorte de vídeo.

Os três testes Electron antigos dependem de mídias ausentes. Login interativo, aprovações solicitadas pelo Codex e distribuição empacotada dos novos serviços permanecem sem teste específico. O acesso remoto requer um serviço autenticado adicional. A geração está limitada aos recursos expostos pelo motor compartilhado de composição.
