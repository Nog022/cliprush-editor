---
name: cliprush-auditoria
description: Diagnosticar consumo de tokens, cache, duração e chamadas de ferramentas do Codex no ClipRush a partir de CSVs locais, e conduzir teste antes/depois. Usar apenas em solicitação de auditoria ou otimização de desempenho.
---

# Auditoria sem carregar logs grandes no modelo
1. Processar CSV localmente com `python tools/resumo_codex.py --tarefas "<tarefas.csv>" --chamadas "<chamadas_individuais.csv>"`; usar apenas a saída resumida.
2. Priorizar **tokens de entrada não cacheados**, saída/raciocínio, tempo de parede, número de turnos e ferramentas; input total inclui cache e não equivale a cobrança ou limite do plano.
3. Separar lentidão de modelo/esperas e tempos declarados das ferramentas. Chamadas podem sobrepor tempo; não subtrair mecanicamente nem atribuir tokens a cada comando sem medição.
4. Agrupamento de comando por palavra-chave é aproximação; não confundir tempo associado a RTK com overhead do RTK nem FFmpeg com render exclusivo.
5. Experimento A/B: repetir tarefa equivalente com modelo, esforço, arquivos e cache tão parecidos quanto possível; medir 3 execuções de cada condição e anotar qualidade/retrabalho.
6. Só adotar otimização após verificar benefício sem perda de qualidade; não anunciar economia como garantida.
