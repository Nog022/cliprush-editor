---
name: cliprush-sdd
description: Planejar mudanças grandes no ClipRush Editor com especificação orientada a testes e escopo fechado. Usar para arquitetura, novas funcionalidades do editor, automações ou alterações multi-módulo; não usar em correções pequenas ou edições rotineiras de vídeo.
---

# SDD enxuto por complexidade
1. Classificar: **P** (ajuste pontual) → execução direta; **M** (edição de vídeo) → spec curta quando complexa ou exigir continuidade; **G** (arquitetura, automação ou vários módulos) → spec + plano + tarefas pequenas.
2. Quando houver spec M/G, usar `docs/sdd/TEMPLATE-SPEC.md`; definir entradas, interfaces, arquivos permitidos, invariantes, critérios de aceitação e testes de qualidade. Não transcrever arquivos extensos na spec.
3. Para G, seguir `docs/sdd/TEMPLATE-PLANO.md`, listando dependências, riscos, rollback e um teste por etapa. Propor etapas verificáveis, sem criar abstrações antes de serem necessárias.
4. Implementar uma etapa por vez; evitar repesquisas e recapitulações longas. Guardar decisão durável em spec quando houver mudança de rumo; não manter histórico de tentativas triviais.
5. Se o usuário pediu somente planejamento, não editar código. Se pediu implementação, cumprir o escopo autorizado e validar proporcionalmente.
6. Qualidade e segurança são invariantes; melhorar economia nunca justifica retirar animações necessárias, pular verificações críticas ou inventar material.
