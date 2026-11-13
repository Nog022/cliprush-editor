# Baseline Codex do ClipRush — 12/11/2026

Fonte: agregação local dos relatórios V3 enviados (`tarefas(2).csv` e `chamadas_individuais(1).csv`), janela histórica de sete dias, sem incorporar prompts nos artefatos.

| Métrica | Valor |
|---|---:|
| Tarefas V3 | 176 |
| Tarefas com ferramentas | 41 |
| Tokens entrada (inclui cache) | 86.170.841 |
| Tokens de cache | 82.924.800 (96,23% da entrada) |
| Entrada não cacheada | 3.246.041 |
| Saída | 566.552 |
| Raciocínio contabilizado na saída | 200.798 |
| Chamadas de ferramenta | 753 |
| Tempo acumulado de tarefas | 19.204,1 s (~5h20min) |
| Tempo de ferramentas | 4.039,0 s (~1h07min) |

| Categoria identificada V3 | Chamadas | Tempo (s) |
|---|---:|---:|
| FFmpeg/FFprobe | 173 | 870,1 |
| Python | 139 | 741,2 |
| Outros (exec) | 135 | 631,5 |
| RTK | 90 | 501,8 |
| Leitura de arquivos | 87 | 365,7 |
| Node | 28 | 350,9 |
| Sleep | 8 | 161,1 |
| CodeGraph | 13 | 11,6 |

**Leitura correta:** tokens em cache não são tokens novos; métricas de ferramenta não incluem todas as esperas da IA; classificação por comandos é aproximada; tempos podem se sobrepor. Não atribuir porcentagens de economia futuras a estas médias.

## Experimento obrigatório para validar ganho
1. Escolher tarefa representativa (uma edição, uma correção desktop, uma busca de catálogo).
2. Mesma versão de código, modelo, esforço, arquivos e recursos possíveis.
3. Executar três tentativas A (regras originais) e três B (regras novas) sem alterar o escopo; sessões novas.
4. Comparar mediana de tempo, input novo, output, chamadas de ferramenta, erros/reparos e nota de qualidade. Registar diferença de cache e latência.
5. Não aprovar otimização se reduzir a qualidade ou aumentar taxa de falhas.
