# Spec: Jason — tartaruga-verde no oceano

**Classe:** M | **Alvo:** produção CLI existente | **Estado:** aprovada pelo pedido de produção

## Resultado esperado
MP4 cinematográfico vertical, 1080x1920 a 30fps, com a narração exata enviada, voz configurada, legendas sincronizadas e provas visuais do mergulho. Duração determinada pelo áudio real.

## Entradas disponíveis
- Fonte: public/videos/biblioteca/gta6/videos/novidadesGta6/jason_mergulhando.mp4.
- Texto aprovado e instruções: out/pedido-jason-mergulho-2026-11-19.json.
- Serviços existentes: CLI produce, cache de voz, alinhamento e RenderService.

## Escopo
**Fazer:** produção nova usando fonte fornecida e biblioteca somente se necessário; voz, edição, legendas, CTA e entrega em caminho único.

**Não fazer:** alterar app, outros vídeos, credenciais, baixar ou reindexar biblioteca.

## Regras inegociáveis
- Preservar texto, ordem e duração real da narração; reutilizar caches.
- Imagens relacionadas às falas, foco na tartaruga e nome Green Sea Turtle quando visível; preservar interface e detalhes relevantes.
- Layout cinematográfico legível no celular, enquadramentos motivados, cortes variados sem repetição para preencher.
- CTA visual durante a fala correspondente após 3 segundos, sem acrescentar duração.
- Sem sobrescrever exportações, sem limpeza com inventário inicial não confirmado.

## Aceitação objetiva
- [x] Conferência de quadros representativos e CTAs de curtir/seguir no MP4.
- [x] MP4 novo com áudio e legendas sincronizadas.
- [x] Resolução/duração/FPS comprovados e decodificação sem erros.
- [x] Narração e fonte preservadas; resultado final registrado.

## Riscos e incertezas
Disponibilidade do serviço de voz e planejador. A identificação factual é a narração fornecida; não criar provas visuais ausentes na fonte.

## Implementação e verificações
- Planejador automático interrompeu antes do render por falta de timestamps visuais no contexto. Fonte conferida diretamente em contatos limitados e quadro da interface.
- Narração gerada uma vez; voz e alinhamento existentes reaproveitados sem nova síntese ou transcrição.
- Montagem privada desta entrega em out/jason-mergulho-cinematic.tsx; adaptador out/jason-mergulho-finish.ts reutiliza RenderService. Sem mudanças no app, biblioteca ou outras produções.
- 14 planos com gancho da tartaruga, retrospecto do iate, mergulho, detalhes marinhos, aproximação, ampliação real da interface e encerramento.
- TypeScript da composição: zero erros. 16 quadros pré-renderizados e conferidos, cobrindo cada plano e CTA.
- Duração real: 1383 quadros a 30fps (46,1s). Exportação high: H.264 CRF18 e AAC, 1080x1920.

## Entrega
- RenderService retornou completed após validação integral do MP4. Um único render completo foi executado.
- Entrega: deliveries/jason-mergulho-tartaruga-2026-11-19-4802b321.mp4 (35.214.827 bytes).
- ffprobe: 46,1s, 1080x1920, 30fps, H.264 e AAC. Cópia da entrega conferida por SHA-256.
- Frames extraídos do MP4 em 24,2s, 25,2s e 34s confirmam CURTIR, SEGUINDO, legendas e ampliação legível da interface original.
- Texto aprovado conferido por igualdade exata no pedido e projeto; todos os planos dentro da duração da fonte.
- Resultado, hash e quadros finais: out/jason-mergulho-final/.
- Retrabalho: planejador sem evidência visual foi substituído pela montagem conferida manualmente; falhas de configuração de caminho absoluto do bundle e flag experimental SQLite foram corrigidas antes de renderizar. Sem nova voz/transcrição, sem mudanças em módulos compartilhados.
- Sem limpeza de produções ou indexação. CTA visual sem SFX adicional.

## Correção de fluidez solicitada
- Usuário identificou travadas faltando cerca de 7s. Diagnóstico no MP4 e na fonte confirmou congelamento a partir de 38,92s da fonte; esse final aparecia em dois planos (por volta de 39s e 45,3s da entrega).
- Adaptador isolado out/jason-mergulho-repair.ts altera somente os trims de jm-shot-11 e jm-shot-13, evitando o final parado. Narração, legendas, duração e composição preservadas.
- Três quadros dos planos afetados conferidos. Render parcial de 468 quadros (30,5–46,1s) em CRF18; prefixo unido por cópia de streams no keyframe, áudio original copiado integralmente.
- Montagem final decodificada sem erros: 1383 quadros, 46,1s, 1080x1920, 30fps, H.264 + AAC.
- Hash dos primeiros 915 quadros decodificados idêntico ao original; áudio comprimido idêntico ao original.
- Detecção na área de gameplay dos últimos 7,3s: nenhum congelamento de 0,2s ou mais. Conferência visual em contato temporal confirmou movimento nos planos corrigidos.
- Retrabalho técnico: adaptador passou a usar a mesma instância do renderer para limitar o render; segmentação alinhada ao keyframe com tolerância de 0,05s. Nenhum novo render completo.
- Entrega corrigida: deliveries/jason-mergulho-tartaruga-2026-11-19-corrigido-v2.mp4. Original mantido. Evidências em out/jason-mergulho-repair/validation.json e final-motion.jpg.
