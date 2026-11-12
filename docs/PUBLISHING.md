# Publicação — estado e plano

Não há publicação nem agendamento implementados na Fase 1. Nenhuma conta foi conectada e nenhum vídeo foi enviado. A interface não apresenta botões que simulem essas operações.

A Fase 5 exige adaptadores independentes para YouTube, Instagram e TikTok, cada um com OAuth oficial, permissões mínimas, armazenamento protegido de tokens, expiração, revogação, erros e retomada. O app desktop não deve conter segredos de aplicação que precisem permanecer confidenciais; definir o fluxo adequado por plataforma e eventual serviço intermediário.

Antes de implementar, verificar documentação e permissões vigentes. A afirmação no briefing sobre thumbnails de Shorts em novembro de 2026 **não foi assumida como capacidade comprovada**. Disponibilidade de capas, processamento, envio e aplicação final devem ser verificados separadamente para cada API e conta.

Publicações precisam de identidade por projeto/versão/plataforma, idempotência, histórico e estado remoto confirmado. Uma falha no TikTok não deverá repetir um upload bem-sucedido no YouTube. URLs de resultado só aparecem depois de confirmação da plataforma.

Agendamentos deverão ser persistidos, recuperados ao iniciar e ter estado por destino, retentativas e cancelamento. Distinguir agendamento nativo da plataforma de execução local, que depende de o computador estar ligado e conectado. Credenciais, registro de aplicativos, auditorias e aprovação das plataformas permanecem dependências externas futuras.
