# Spec: produção por CLI

**Classe:** G | **Alvo:** desktop/main.ts, desktop/cli.ts, scripts/produce.mjs | **Estado:** implementada e validada; ver production-cli-validacao.md

## Resultado esperado
Receber JSON com narration e instructions e executar o pipeline existente até MP4, sem janela ou cliques. Usar instância aberta quando existir e iniciar main em modo sem interface quando não existir. Retornar JSONL de progresso/erro/conclusão com caminho absoluto do MP4.

## Entradas e interfaces
Obrigatórios: narration e instructions. Opcionais: name, projectId e media (caminhos locais). Sem credenciais no pedido. Reutilizar inicialização de serviços no main, preferências do workspace, ProductionService, catálogo, ElevenLabs, Whisper e RenderService.

## Escopo e invariantes
Não duplicar serviços, seleção de cenas, edição, alinhamento ou render. Não adicionar dependências, alterar biblioteca ou contornar aprovações do Codex. Pedidos que exigirem aprovação interativa falham com erro claro. Instância única e fila existente protegem mutações; cancelamento é cooperativo. Credenciais e cache usam os mesmos diretórios do app. Testes usam CLIPRUSH_DATA_HOME temporário; nunca banco real. Artefatos de controle privados sob out/cli, sem sobrescrita de MP4.

## Aceitação
- Um comando recebe texto/instruções, transmite progresso e retorna MP4 ou exit code não zero com erro.
- Teste curto com áudio/cenas/legendas/render reais, sem mocks apresentado como validação completa.
- Contrato/erros testados sem consumo pago; AGENTS documenta comando e requisitos.
- Editor existente e produções anteriores preservados.

## Riscos
Autenticação Codex, disponibilidade de catálogo/fontes locais e modelos Whisper em cache são pré-requisitos existentes. Build completo pode depender de arte do preset ausente; CLI compila apenas o main quando necessário e reutiliza bundle Remotion válido.
