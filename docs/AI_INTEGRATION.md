# IA — contrato previsto, ainda não implementado

A Fase 1 não chama Codex, OpenAI, ElevenLabs ou qualquer provedor externo. Não existem modelos fictícios, contadores de tokens simulados, credenciais salvas ou cobranças de IA. Nenhuma assinatura foi instalada.

Na Fase 3, implementar dois serviços separados:

1. Assistente de edição: recebe apenas dados necessários do projeto e devolve comandos estruturados validados. Mostrar uma proposta de alterações antes da aplicação, salvar checkpoint, aplicar em transação e permitir desfazer/cancelar.
2. Assistente avançado: trabalha em alterações de código isoladas, apresenta diff para revisão e só aplica após aprovação. Nunca permitir que um comando de edição comum execute código livre.

A integração oficial deverá ser verificada contra a versão de SDK/CLI instalada no momento de implementação. Descobrir modelos e capacidades reais, com autenticação configurada pelo usuário. Registrar IDs das operações e uso retornado pelo provedor, com deduplicação por evento/operação. Tokens de raciocínio/cache devem aparecer como indisponíveis se não forem informados. Não calcular cobranças de assinatura como se fossem preços de API.

Tradução, transcrição e síntese de voz são adaptadores distintos. Importação de narração externa já funciona pela biblioteca de mídias. Transcrição local, legendagem e tradução ainda não existem na interface.

Credenciais deverão ficar no armazenamento protegido do sistema, nunca no renderer, `public/`, JSON de projeto ou pacote exportado. A política offline atual bloqueia rede no renderer; a futura integração usará serviços específicos com escopo e cancelamento.
