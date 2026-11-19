# Produção por CLI — entrega e validação

## Comando

Criar `out/pedido.json`, sem credenciais:

```json
{
  "narration": "Texto exato da narração aprovada.",
  "instructions": "Selecione cenas adequadas, faça cortes e um zoom pontual."
}
```

```powershell
npm.cmd run produce -- --input out/pedido.json
```

Também aceita JSON por stdin: `node scripts/produce.mjs --input -`. Para saída exclusivamente JSONL, usar diretamente `node scripts/produce.mjs`, evitando o cabeçalho do npm.

Opcionais: `name` (nome do novo projeto), `projectId` (usar projeto/configurações existentes), `media` (até 40 caminhos locais; relativos à raiz do repo). Sem projeto ou mídia explícitos, o adaptador reutiliza até 40 mídias visuais já importadas no canal ClipRush e deixa a busca do catálogo com o planejador atual. O catálogo esperado pelo desktop está ausente neste workspace: para conteúdo dependente dele, importar mídia, fornecer `media` ou usar um projeto existente; não é iniciado download nem indexação.

## Fluxo e preservação

`scripts/produce.mjs` valida a entrada, compila atomicamente o main existente e inicia Electron com pedido privado sob `out/cli/<UUID>/`. Não cria janela. Se o editor estiver aberto, o pedido é encaminhado à mesma instância via `requestSingleInstanceLock`/`second-instance`, usando `additionalData` porque o Electron pode reordenar argumentos, conforme a [documentação oficial](https://www.electronjs.org/docs/latest/api/app#event-second-instance).

O main usa sua inicialização normal de serviços. `desktop/cli.ts` apenas prepara projeto/entrada e acompanha `ProductionService`: ElevenLabs configurado → alinhamento Whisper → planejamento Codex/seleção de cenas → compilação editorial → legendas → render Remotion. Não há novo sintetizador, montador, renderizador ou dependência. Foi esclarecida a orientação de IDs do planejador: IDs de mídia devem existir; cada clipe planejado precisa de ID único sem colidir com a narração preservada.

Preferências Codex, credenciais seguras ou `.env.local` de desenvolvimento, voz/modelo e cache continuam nos mesmos locais. Projeto existente preserva configurações de exportação, habilitando áudio/legendas e render automático para cumprir o comando. Novo projeto usa os padrões existentes (1080×1920, 30 FPS). Pedidos de aprovação interativa são recusados com erro claro, sem autoaprovar ferramentas ou abrir diálogo. A fila existente serializa mutações; produções ativas não são sobrescritas.

Saída JSONL com `progress`, `completed` e `error`. `completed.outputPath` é absoluto e só é emitido após RenderService validar o MP4. `result.json` e eventos persistem no diretório privado do pedido. Falha retorna código não zero. Ctrl+C cria marcador de cancelamento cooperativo; não há repetição automática de geração paga. Logs repetidos são omitidos dos eventos intermediários. Atualizações do main precisam de reinício único se uma versão anterior do editor já estiver aberta.

## Teste real executado em 19/11/2026

Workspace isolado: `out/cli-smoke-61999e53-f3a8-4575-8760-0b11f33707b5`.

- Voz real Augusto Norte/eleven_v4, recuperada do cache validado ElevenLabs: nenhuma nova geração paga necessária. A consulta das configurações da voz usou a API real.
- Whisper small local confirmou o texto e mediu as palavras, sem download de modelo.
- Codex real, autenticado pelas configurações existentes, selecionou três trechos descontínuos do vídeo de diagnóstico já disponível: trims 0, 180 e 360 frames; zoom no segundo. Não foi usado mock de planejamento.
- O compilador existente gerou 3 legendas: “Olá!”, “Eu sou a voz do ClipRush.” e “Vamos descobrir algo surpreendente?”, com tempos medidos até 4,620 s.
- Render automático real: **1080×1920, 30 FPS, 147 frames, 4,900 s, H.264 + AAC**. A narração tem 4,880 s; a duração final acompanha o arredondamento ao próximo frame.
- Decodificação integral FFmpeg e metadados FFprobe passaram. Frame em 1,3 s confirmou legenda visível. O vídeo de teste usa sinal gráfico sintético para validar o pipeline; não é uma produção editorial com cenas de GTA.
- MP4: `out/cli-smoke-61999e53-f3a8-4575-8760-0b11f33707b5/workspace/exports/b628ccc8-d81e-40db-9be5-c25844e10843-421c3311-f2b0-47fc-9553-346b9685cb8e.mp4`.

## Regressões e limites

- `desktop:lint` e typecheck passaram; **29 testes** passaram (incluem contrato CLI, reutilização de biblioteca sem `media`, preferências, progresso/conclusão e erros/aprovações).
- **2 E2E passaram**: encaminhamento à instância aberta sem cliques, erro antes de qualquer geração paga; e regressão ElevenLabs (IPC, armazenamento seguro, player, cache e roteiro). Todos com `CLIPRUSH_DATA_HOME` temporário.
- Nenhum banco de uso real, vídeo anterior, catálogo ou original foi alterado. Não houve novas dependências, instalação, limpeza, reindexação, download ou exposição de credenciais.
- O build completo do projeto não foi repetido: a pasta `public/templates/corte-live` continua ausente, impedimento já documentado na integração ElevenLabs. A CLI verifica o bundle Remotion existente e compila só o main. Distribuição/instalador não foram testados nesta tarefa.

`scripts/test-production-cli.mjs` é um smoke opt-in que usa os artefatos locais do teste ElevenLabs anterior e um workspace novo; não integra os testes de rotina e requer esses fixtures presentes.
