# ClipRush Editor — instruções para Codex

## Objetivo e qualidade (sempre)
- Produzir e manter vídeos e interface com qualidade visual profissional, legibilidade, sincronização e preservação de dados; otimizar custo **sem simplificar o resultado**.
- A narração real determina a duração; preservar áudio, roteiro e timestamps fornecidos. Não inventar cenas, fatos ou resultados. Não usar mascote por padrão.
- Preservar `MyComp`, composições anteriores, arquivos originais, ajustes do usuário, biblioteca e dados de desktop. Não sobrescrever exportações.
- Não afirmar que render, teste, download, upload ou publicação funcionou sem comprovação.
- Não armazenar credenciais nem dados privados em `public/`.

## Descoberta e economia de contexto
1. Delimitar primeiro a pasta, vídeo, módulo e objetivo. Consultar só arquivos relacionados e trechos relevantes (`rg`, arquivos conhecidos, diffs), **não** fazer varredura ou leitura integral do repositório.
2. Antes de executar comando custoso, conferir se o artefato/metadado já existe e está válido. Agrupar verificações relacionadas. Não repetir comandos, transcrições, `ffprobe` ou leituras sem motivo.
3. Não despejar catálogos JSON, logs extensos, frames em massa ou saídas grandes no contexto. Buscar localmente; trazer somente resumos e até 5 cenas candidatas por consulta.
4. Usar RTK só quando compatível e a saída ficar menor; CodeGraph para rastreamento complexo, não para mudanças pontuais. Nunca presumir hook ativo no Windows.
5. Evitar novos pacotes, upgrades, reindexação, download de vídeos, chamadas a modelos locais e renderizações completas sem necessidade ou pedido.
6. Após duas tentativas de correção sem avanço, investigar a causa antes de repetir. Não criar agentes paralelos para tarefas simples.

## Roteamento sob demanda
- Vídeos em `src/videos/`: seguir `src/videos/AGENTS.md`; usar a skill `cliprush-edicao` somente para criar/editar vídeo.
- Biblioteca de cenas e timestamps: skill `cliprush-catalogo`; mídia/`ffprobe`: `cliprush-midia`.
- Mudança de arquitetura, recursos grandes ou automação: skill `cliprush-sdd`. Correção pequena: agir diretamente, sem SDD completo.
- Testes e revisão: `cliprush-validacao`. Auditoria de custos/tempo: `cliprush-auditoria`.
- `desktop/` e `studio/`: seguir `desktop/AGENTS.md` quando envolver app desktop (mesmo que o arquivo alterado esteja em `studio/`).
- `PROMPT_EDICAO_CLIPRUSH.md` é referência criativa **sob demanda**, não leitura obrigatória integral a cada pedido.

## Limites de escopo
- **Retenção permanente de produções:** após confirmação do inventário inicial em `docs/cleanup/initial-plan.md`, manter arquivos de produção somente do vídeo atual e MP4 finais anteriores em `deliveries/`. Esta política autoriza a transação de retenção após cada nova entrega completa e validada, incluindo remoção de registros antigos de `src/Root.tsx`; preserva `MyComp` e substitui a preservação irrestrita de produções antigas nas regras anteriores.
- Usar `npm run render -- ClipRushNNN [versao-unica]` para novas exportações numeradas manuais. O script do 017 e exportações desktop de projetos chamados exatamente `video-NNN` também integram a retenção. Geração sem MP4, previews, falhas e cancelamentos não autorizam limpeza. Chamadas diretas a `npx remotion render` ou novos scripts devem passar por `completeProduction`; o Remotion não oferece um hook global de conclusão na configuração instalada.
- `npm run dev` inicia o Studio com observador de exportações em `out/` e `deliveries/`: MP4 novo com identificação da produção e metadados estáticos comprovados no Root passa pela mesma transação. Não exportar fora desses diretórios. Composições com metadados dinâmicos usam `npm run render`, que resolve a composição pelo renderer. Exportações diretas fora dos pontos integrados não acionam retenção.
- A limpeza só pode executar após validar metadados e decodificação integral do MP4, compilação src/desktop, inventário atualizado e backup comprimido com hashes. Repetir verificação do projeto após a transação e restaurar automaticamente em falhas. Não contornar a confirmação inicial nem remover arquivos incertos ou dependências preservadas.
- Preservar AGENTS, `.agents/skills`, docs/SDD, RTK, CodeGraph, ferramentas genéricas, indexação, biblioteca e dados desktop. Nunca seguir links/junções nem sair da raiz canônica. MP4 finais têm nomes únicos, sem sobrescrita. Backups em `out/retention/backups/` não expiram automaticamente; contabilizar seu tamanho ao informar ganho líquido. Restauração: `node scripts/production-retention.mjs restore out/retention/backups/ID` (recusa conflitos).
- Produção solicitada de vídeo autoriza render MP4; pedido de diagnóstico, ajuste pontual, AGENTS ou documentação **não** autoriza render, indexar, apagar, publicar ou alterar outros vídeos.
- Verificar apenas o escopo alterado, escalando de testes rápidos para render/previews quando pertinente; relatórios curtos com arquivos, validações e bloqueios.
- Nenhum arquivo `AGENTS.md` substitui as instruções explícitas da tarefa, a segurança nem a verificação no código real.
