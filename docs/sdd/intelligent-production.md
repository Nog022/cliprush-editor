# Spec: planejamento editorial no desktop

**Classe:** G | **Alvo:** geração desktop | **Estado:** implementada; e2e Electron bloqueado pelo ambiente

## Resultado esperado
Gerar produz um plano estruturado por blocos de fala e o compila no schema de composição existente. Uma montagem insuficiente falha antes da promoção e da exportação.

## Entradas disponíveis
Projeto, mídias importadas com duração, clips, legendas e referências fornecidas. ProductionService, CatalogService, applyComposition e RenderService existentes.

## Escopo
Planejamento/validação em shared; orquestração em desktop; testes de domínio e serviço. Preservar preview, schema persistido, exportador e produções em src/videos. Sem dependências novas.

## Regras inegociáveis
Preservar posição, trim, volume e duração da narração existente. Sem narração na timeline, usar sua duração real. Não inventar transcrição ou timestamps: solicitar evidência ao modelo e falhar se faltarem dados. Catálogo opcional, sem promover alterações intermediárias. Uma chamada de planejamento no caso normal e no máximo um reparo; consulta adicional somente se o plano solicitar catálogo.

## Aceitação objetiva
- Plano compilado pelo applyComposition existente; limites, cobertura, narração e requisitos conferidos antes de salvar.
- Três trechos descontínuos, zoom e legendas temporizadas verificados com fixture de áudio/vídeo e timestamps conhecidos.
- Falhas de planejamento/render não salvam nem exportam candidato.
- Projetos antigos permanecem compatíveis.

## Plano de implementação
1. Contrato e compilação/validação editorial em shared/production.ts; testes de casos positivos e negativos.
2. Integrar no ProductionService e reutilizar CatalogService com snapshot sem gravação; teste do serviço com Codex e render simulados.
3. Typecheck desktop, lint dos arquivos e testes desktop. Teste opcional `CLIPRUSH_EDITORIAL_RENDER=1 npm run desktop:test` valida e exporta uma fixture real de 12 quadros pelo RenderService, sem chamar modelos.

## Riscos e rollback
Validação estrutural não prova relação semântica entre imagem e fala. Manter evidências no plano/histórico para diagnóstico. Reverter somente os arquivos desta mudança restaura o contrato anterior, sem migração de dados. Após dois reparos sem avanço, investigar a causa.

## Verificação
Typecheck, build desktop e 11 testes passaram, incluindo exportação real de 0,4 s/12 quadros com áudio e decodificação integral pelo validador existente. Legendas narradas exigem alinhamento existente em captions ou referência SRT/VTT/JSON; não há ASR novo. O e2e de preview/exportação foi criado, mas Electron não abriu: ACL do executável impede acesso pelo AppContainer. Não alterar permissões nem desativar sandbox para contornar esse bloqueio. Nenhuma chamada real ao Codex foi feita nos testes.
