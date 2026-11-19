# Plano: ElevenLabs

1. Adaptador main-only, parser de ambiente e cache: testar contrato HTTP, concorrência, integridade, cancelamento e erros com fetch injetado.
2. Credenciais safeStorage, IPC mínimo e teste de voz: typecheck e teste de interface em workspace temporário.
3. Roteiro aprovado → áudio → alinhamento e pipeline existentes: testar preservação/fallback e continuar render conforme autoRender.
4. Geração remota curta autorizada: validar MP3 por decodificação integral e duração; repetir via cache sem nova cobrança.

Rollback: retirar apenas os campos opcionais, handlers e adaptador desta integração. Não restaurar arquivos inteiros com mudanças anteriores do usuário; não tocar em banco real. Sem migração, instalação, indexação ou render de produção por rotina.
