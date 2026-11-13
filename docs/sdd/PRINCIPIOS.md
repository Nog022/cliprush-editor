# SDD enxuto do ClipRush Editor

## Por que existe
Reduzir tentativas, chamadas de ferramenta e contexto desnecessário **sem reduzir a qualidade do vídeo ou a confiabilidade do aplicativo**. Especificação não é burocracia: só adicionar a documentação que evita repetição.

## Três tamanhos de tarefa
| Classe | Exemplos | Arquivos obrigatórios |
| --- | --- | --- |
| P — pontual | corrigir texto, componente ou bug localizado | nenhum; prompt curto + teste proporcional |
| M — produção | video-NNN, ajuste relevante em edição | uma spec curta, se a tarefa for complexa ou exigir continuidade |
| G — produto | editor desktop, automação, migração, integração | spec + plano; dividir implementação em tarefas pequenas |

## Fluxo G (sem excesso de documentos)
1. Spec: problema, escopo, entradas, saídas, invariantes, riscos, testes de aceitação.
2. Planejar: arquivos afetados, reuso do código, dependências, checkpoints e rollback.
3. Executar por marco: ler apenas contexto do marco; reusar resultados anteriores, não explorar tudo novamente.
4. Validar proporcionalmente e registrar resultados verificáveis.
5. Medir antes/depois, principalmente tempo total, ciclos, cache, tokens novos, retrabalho e nota de qualidade.

## Qualidade inegociável
- Áudio e timestamps reais; cenas fiéis à fala, transições suaves e variedade visual sem fillers.
- Media e produções antigas preservadas; caminhos seguros e dados locais protegidos.
- Fazer preview antes do render final quando necessário; não pular testes de segurança.
- Marcar limitações dos metadados e da qualidade da evidência, nunca inventar fatos.

## Trabalho de modelos/agentes
Um agente principal é o padrão. Só delegar em paralelo se houver etapas realmente independentes, ganho de tempo justificável e baixo custo de contexto. Não usar subagentes para "revisar" mudanças mínimas por rotina.
