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

### Produção automática por CLI (Codex)
- Para enviar apenas narração e instruções, criar JSON privado sob `out/` com `{"narration":"texto exato aprovado","instructions":"instruções de edição"}` e executar `npm run produce -- --input out/pedido.json` (PowerShell com política restrita: `npm.cmd run produce -- --input out/pedido.json`). Enviar o pedido autoriza a narração e o MP4. Não incluir credenciais no JSON.
- Também aceita `node scripts/produce.mjs --input -` com JSON pelo stdin. Opcionais: `name`, `projectId` para usar um projeto existente e suas configurações, `media` com até 40 caminhos locais de mídia. Sem projeto/mídias explícitos, reutiliza até 40 mídias visuais já importadas do canal ClipRush e permite a busca normal no catálogo existente.
- O comando aciona os mesmos serviços do processo principal, sem janela quando o app está fechado, ou encaminha à instância aberta. Reutiliza credenciais seguras/`.env.local` de desenvolvimento, voz Augusto Norte, eleven_v4, cache, preferências Codex, Whisper, edição, legendas e render. Não executar outra CLI de produção dentro de um turno do planejador editorial: esse planejador retorna somente o JSON exigido pelo app.
- Saída JSONL: `progress` com estágio, progresso e logs; `completed` com `outputPath` absoluto; `error` e código de saída não zero nas falhas. Artefatos privados de controle e `result.json` ficam em `out/cli/<id>/`. Ctrl+C solicita cancelamento cooperativo. Não assumir sucesso antes de `completed`.
- Pré-requisitos: Codex já autenticado/configurado, ElevenLabs com Text to Speech e Voices: Read, Whisper/modelo local, FFmpeg/FFprobe e bundle Remotion desktop válido (`dist/render/index.html`). Cenas precisam existir na biblioteca importada, no catálogo local ou em `media`; não baixar ou reindexar automaticamente. Pedidos de aprovação interativa são recusados e reportados, sem abrir diálogos. Uma instância aberta de versão anterior à CLI precisa ser reiniciada após a atualização.

### Outros fluxos
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

## CTA — Curtir e Seguir

Durante a edição dos vídeos, avaliar oportunidades de inserir chamadas para ação (CTA) de maneira criativa e natural.

### Curtir
- Preferencialmente após uma revelação surpreendente.
- Inserir uma animação visual de curtida.
- Utilizar ícone animado, movimento de clique, partículas discretas e efeito sonoro curto.
- Duração visual de aproximadamente 1 a 2 segundos.
- Não interromper a narração nem ocultar detalhes importantes.

### Seguir
- Preferencialmente próximo do encerramento.
- Inserir uma animação de seguir/inscrever-se.
- Utilizar movimento fluido, destaque visual e feedback de confirmação.
- Adaptar o CTA à plataforma de publicação.

### Regras de retenção
- Nunca inserir CTA nos primeiros 3 segundos.
- Não usar obrigatoriamente os dois CTAs.
- Priorizar a retenção e o ritmo da narrativa.
- Variar as animações para evitar repetição.
- Integrar os efeitos à composição do vídeo.
- Não adicionar segundos desnecessários ao vídeo.
- Se o CTA prejudicar a narrativa, não inserir.

### Validação
- Verificar se as animações realmente aparecem no MP4.
- Não considerar um CTA implementado apenas por constar no roteiro ou na narração.

## Regra de eficiência — Correções ClipRush

**Objetivo:** corrigir defeitos com o menor custo possível de tempo, tokens, alterações e renderizações, sem comprometer a qualidade, segurança ou funcionamento do projeto.

### Diagnóstico
- Identificar o componente responsável antes de alterar código.
- Priorizar logs, diffs, componentes existentes e reproduções mínimas.
- Não investigar codecs, streaming, protocolos ou serviços externos sem evidências de falha.
- Após duas tentativas sem avanço, revisar a hipótese antes de continuar.
- Evitar investigações paralelas de causas não relacionadas.

### Implementação
- Aplicar a menor correção suficiente para resolver a causa raiz.
- Reutilizar presets, composições, serviços, cache e funções existentes.
- Não recriar componentes nem introduzir abstrações desnecessárias.
- Preservar o padrão visual e cinematográfico do ClipRush.
- Não alterar outros projetos ou vídeos sem necessidade comprovada.

### Validação progressiva
1. Executar primeiro testes rápidos dos componentes alterados.
2. Para problemas visuais, conferir frames representativos antes de renderizar.
3. Executar testes E2E quando o defeito envolver reprodução, timeline, sincronização ou integração.
4. Executar testes gerais quando houver risco real de regressão em componentes compartilhados.
5. Renderizar o MP4 completo somente após as verificações preliminares.
6. Repetir renderizações apenas quando uma correção posterior justificar nova validação.

### Economia de execução
- Evitar leituras, análises, transcrições e comandos redundantes.
- Não criar infraestrutura temporária complexa para correções simples.
- Reutilizar artefatos já validados.
- Registrar brevemente causas descartadas para evitar repetir investigações.
- Dimensionar SDD, documentação e testes conforme a complexidade e o risco da alteração.

### Entrega
Informar resumidamente:
- Causa raiz identificada.
- Correção aplicada.
- Testes executados e seus resultados.
- Arquivos modificados.
- Retrabalho relevante, caso exista.
- Caminho do MP4 final, quando solicitado.

**Prioridade:** qualidade final > correção comprovada > eficiência de execução. Nunca economizar recursos sacrificando a confiabilidade do resultado.
