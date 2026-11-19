# Spec: narração ElevenLabs

**Classe:** G | **Alvo:** desktop/studio/shared | **Estado:** implementação autorizada

## Resultado esperado
O usuário revisa o roteiro no painel e aprova sua geração. O processo principal gera MP3 com a voz configurada (Augusto Norte - Brasil), modelo eleven_v4, e continua pelo alinhamento Whisper, compilação editorial e render existentes.

## Entradas e escopo
Reutilizar ProductionService, prepareNarration, prepareAsset e RenderService. Adicionar adaptador HTTP nativo e credenciais main-only; sem dependências novas. Não modificar seleção de cenas, compilador editorial, biblioteca, produções anteriores ou dados reais nos testes.

## Invariantes
Chave nunca retorna por IPC, não entra no bundle, Git, referências ou logs. Desenvolvimento lê .env.local apenas no main; distribuição lê envelope safeStorage no userData, importado por diálogo nativo. Falhas não imprimem corpo remoto. Sem repetição automática de POST pago. Cache atômico por texto exato, voz, modelo, formato e configurações efetivas, com hash do MP3 e deduplicação concorrente. Cancelamento não aciona fallback. Áudio existente continua utilizável; não há provedor TTS no desktop auditado.

## Aceitação
- POST oficial com eleven_v4 e MP3; configurações remotas da voz preservadas.
- Aprovação explícita do texto e teste curto com reprodução antes da geração completa.
- Cache evita POST duplicado e detecta corrupção; erros claros sem segredos.
- Testes isolados de contrato, cache, falhas e integração; typecheck e teste remoto curto comprovados quando disponíveis.
- Risco: permissões/saldo/modelo da conta e Whisper local podem bloquear a integração remota; nunca substituir modelo silenciosamente.
