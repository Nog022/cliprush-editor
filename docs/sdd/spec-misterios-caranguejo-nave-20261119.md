# Spec: Caranguejo gigante e nave na floresta

**Classe:** M | **Alvo:** produção CLI independente | **Estado:** autorizada pelo pedido

## Resultado esperado
MP4 ClipRush vertical com as duas cenas indicadas, narração integral em Augusto Norte, cortes e zooms cinematográficos e legendas sincronizadas. A duração deriva do áudio real.

## Entradas disponíveis
- Pedido privado: out/pedidos/misterios-caranguejo-nave-20261119.json (texto integral aprovado).
- Biblioteca gta6/videos/novidadesGta6: jason_e_caranguejo_gigante.mp4 e Lucia_ve_uma_nave_espacial.mp4.
- CLI produce, serviços ElevenLabs/Whisper/Remotion, cache e configurações existentes.

## Escopo
**Fazer:** produzir automaticamente pela CLI existente, selecionar cenas reais, alinhar os dois mistérios ao áudio, animar CTA na fala aprovada e validar exportação.
**Não fazer:** alterar aplicativo, sobrescrever MP4, baixar ou reindexar mídia ou operar Electron manualmente.

## Regras inegociáveis
- Detalhes visíveis em 9:16, voz clara, legendas legíveis e sincronizadas.
- Texto exato, dados e mídias originais preservados; sem mascote ou ações inventadas.
- Reutilizar cache, uma produção; repetir somente diante de falha demonstrada.

## Aceitação objetiva
- [ ] Evento CLI completed e caminho absoluto existente.
- [ ] MP4 vertical com áudio, duração coerente e decodificação sem erros.
- [ ] Conferência visual dos blocos e CTA, registrando limites da verificação.
- [ ] Nenhuma alteração manual no código do aplicativo.

## Riscos e incertezas
Disponibilidade dos serviços e credenciais será comprovada na execução. Cenas devem conter os acontecimentos narrados; registrar divergências reais. A CLI pode depender da versão da instância Electron aberta.
## Decisão de implementação
O schema existente oferece zoom global, sem coordenadas por sujeito. Usar zoom nativo e seleção de trechos centrais, com revisão visual do resultado. Reutilizar o projeto 97a2e1c9-81f2-415c-8933-e3664795b310 e a narração gerada. Trilha/SFX opcionais conforme disponibilidade real.

## Resultado verificado
- CLI completed, render c6c06d38-aac7-4488-b683-02458cdd68a7, projeto 97a2e1c9-81f2-415c-8933-e3664795b310.
- Entrega: deliveries/cliprush-caranguejo-nave-20261119-c6c06d38.mp4. Cópia verificada por SHA256.
- FFprobe: H264 1080x1920, 30 fps, AAC, 47.936 s, 15797289 bytes. Pipeline executou validateMp4 antes de completed (inclui decodificação integral).
- Quadros dos 13 blocos conferidos em out/pedidos/inspecao-misterios/final-blocos.jpg; mídia e legendas visíveis, cartela CTA visível. O movimento do CTA é definido por slide; não houve reprodução humana integral em tempo real.
- Limites visuais: renderer preserva cenas horizontais com faixas escuras dentro do canvas vertical. CTA textual, sem ícone/partículas; sem trilha/SFX por ausência de assets fornecidos. Reprises curtas na sala/teto para acompanhar a duração da fala.
- Falhas resolvidas: isolamento do runtime Electron, requisito de reenquadramento por sujeito sem suporte e inspeção de vídeo indisponível no planejador. Inspeção direta pelo agente principal supriu os timestamps. Correções internas do plano antes do único render MP4 concluído. Uma geração ElevenLabs; retomadas usaram cache e alinhamento existente. Sem mudanças no código do aplicativo.
