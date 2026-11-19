# Plano: produção por CLI

1. Contrato JSON e orquestração fina sobre ProductionService; testes de progresso, saída, erro e cancelamento.
2. Modo sem janela e encaminhamento second-instance no main; launcher Node com Electron existente e JSONL privado. Validar typecheck e lint.
3. Teste real curto em CLIPRUSH_DATA_HOME temporário; validar duração, áudio, legendas e MP4. Testar encaminhamento quando app aberto se viável.
4. Documentar comando no AGENTS e evidências em relatório.

Rollback: remover somente entrypoint CLI e ligação no main, preservando mudanças anteriores do usuário, banco e artefatos. Não reindexar, instalar, limpar biblioteca nem gerar novo conteúdo para testar caminhos de erro.
