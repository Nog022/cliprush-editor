# Spec: Lúcia — mistérios no pântano

**Classe:** M | **Alvo:** produção CLI existente | **Estado:** aprovada pelo pedido de produção

## Resultado esperado
MP4 vertical cinematográfico com narração exata fornecida pelo usuário, voz Augusto Norte, cenas reais alinhadas aos eventos e legendas sincronizadas. Pipeline existente automático, sem operação manual no Electron.

## Entradas disponíveis
- Narração e instruções exatas: out/pedido-lucia-pantano-2026-11-19.json.
- Fonte principal: public/videos/biblioteca/gta6/videos/novidadesGta6/lucia_acha_misterios_no_pantano.mp4.
- Pipeline: scripts/produce.mjs e serviços de produção existentes; bundle desktop presente.
- video-000 ausente em public/videos; biblioteca existente disponível para complementos necessários.

## Escopo
**Fazer:** gerar áudio pelo cache/ElevenLabs configurado, selecionar trechos reais, editar, legendar e exportar MP4 novo; registrar logs e verificar entrega.
**Não fazer:** alterar o pipeline, baixar/reindexar mídias, sobrescrever exportações, modificar vídeos anteriores ou credenciais.

## Regras inegociáveis
- Narração real determina duração; preservar texto e ordem.
- Mostrar árvore, figura/marca, criatura, perseguição, queda e despertar quando comprovados na fonte.
- 1080x1920, áudio presente, detalhes legíveis, legendas sincronizadas, zooms/cortes motivados.
- CTA após 3s, alinhado à fala, sem duração adicional.
- Reutilizar caches/configurações e evitar renderizações redundantes.

## Aceitação objetiva
- [x] CLI emite completed com MP4 existente em caminho novo.
- [x] Metadados comprovam 1080x1920 e faixas de vídeo/áudio.
- [x] Conferência visual de quadros representativos, legendas e CTA.
- [x] Decodificação do MP4 sem erros.

## Riscos e incertezas
Dependências externas de voz e planejador precisam estar disponíveis; falhas serão reportadas com os logs do pipeline. A procedência factual dos eventos não será inferida além do material enviado.
## Implementação e verificação
- CLI inicial bloqueada pelo acesso do sandbox ao perfil/runtime Electron; produção iniciou fora do sandbox.
- Voz gerada uma única vez com eleven_v4; áudio real 47,36 s e alinhamento Whisper local reutilizados nas etapas posteriores.
- Plano editorial salvo recuperado após falha do requisito de cortes descontínuos: trim do clipe v08 ajustado de 1110 para 1115 quadros para eliminar sobreposição de dois quadros de origem. Compilador existente voltou a aprovar o plano.
- Layout padrão com imagem horizontal pequena recusado na conferência visual. Bundle Remotion exclusivo desta entrega em out/lucia-pantano-cinematic-bundle, fonte em out/lucia-pantano-cinematic.tsx; nenhum módulo compartilhado alterado.
- Layout final: imagem ampliada com foco, fundo desfocado, zooms, títulos contextuais, legendas de palavras medidas e CTA animado sem interromper a ação. Grafia das legendas ajustada ao texto aprovado (ClipRush, Deixa, o susto).
- 23 quadros representativos inspecionados, incluindo curtir/seguir; três quadros adicionais após ajuste de títulos. TypeScript da composição aprovado.
- Retomada via adaptador privado out/lucia-pantano-recovery.ts, reutilizando compilador editorial, prepareNarration e RenderService existentes. Sem nova voz, transcrição ou chamada de planejamento na recuperação.
- Exportação final concluída e validada pelo RenderService, qualidade high (H.264 CRF 18, AAC), resolução 1080x1920, 30 fps, 1421 quadros.
- Limitações: sem SFX adicional de CTA; sem seta/círculo específico sobre a marca vermelha não confirmada. Preservada a narração enviada.

## Entrega
- MP4: deliveries/lucia-misterios-pantano-2026-11-19-c31f73a0.mp4.
- ffprobe: 47,367 s, 1080x1920, 30 fps, H.264 + AAC; áudio presente.
- RenderService terminou com completed após validação MP4. Cópia final conferida por SHA-256.
- Estados CURTIR e SEGUINDO confirmados em frames extraídos do próprio MP4 em 26,8 e 27,7 s.
- Erros anteriores recuperados; nenhum bloqueio pendente. CTA sem SFX adicional.
- Resultado e hash: out/lucia-pantano-recovery/result.json e delivery.json.
