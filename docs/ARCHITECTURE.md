# Arquitetura — ClipRush Editor Studio

## Auditoria inicial (5 de novembro de 2026)

A base era um projeto Remotion, sem aplicativo desktop, persistência de projetos ou editor baseado em dados. O lint inicial passou fora do sandbox; dentro dele, o Node encontrou EPERM ao resolver o diretório do usuário.

Versões preservadas: Remotion e pacotes existentes 4.0.539, React/React DOM 19.2.3, TypeScript 5.9.3 e ESLint 9.39.5. Adicionados: Player 4.0.539, Electron 45.2.3, electron-builder 26.18.0, esbuild 0.28.2, Playwright 1.64.1 e tipos React DOM 19.2.3. O Player foi instalado por `remotion add`; nenhuma atualização do Remotion foi executada.

| Registro original      | Dimensões   | FPS | Frames declarados |
| ---------------------- | ----------- | --- | ----------------- |
| MyComp                 | 1280 × 720  | 30  | 60                |
| ClipRushVideo001       | 1080 × 1920 | 30  | 1317              |
| ClipRushAI002          | 1080 × 1920 | 30  | 900               |
| ClipRushAI002Narrado   | 1080 × 1920 | 30  | 731               |
| ClipRushAI002NarradoV2 | 1080 × 1920 | 30  | 731               |
| ClipRushVideo003       | 1080 × 1920 | 30  | 1445              |
| ClipRushVideo004       | 1080 × 1920 | 30  | 1200              |
| ClipRushVideo005       | 1080 × 1920 | 30  | 1171              |

As duas versões narradas calculam a duração pela decodificação do MP3; o Player reutiliza `calculateMetadata`. A biblioteca apresenta os valores declarados. Datas das composições são datas da pasta de origem, não datas editoriais inferidas.

Foram encontrados 47 arquivos em `public/videos`, aproximadamente 144 MB: filmagens, imagens, narrações, trilhas, efeitos e dados de legendas. Havia modificações locais em `src/Root.tsx` e produções/scripts não rastreados dos vídeos 004/005. Esses arquivos não foram reescritos. A pasta `out` já continha material de revisão e um MP4 da produção 005.

Reuso: registros de `Root.tsx`, todos os componentes de produção e suas funções de metadados. `NeonCaptions`, câmera, títulos, personagens/cenários, partículas, `VisualKit` e `Cinema` continuam disponíveis para a futura biblioteca de efeitos. Não foram artificialmente convertidos em presets editáveis nesta fase.

Pontos de desempenho identificados por inspeção: desfoques amplos em `Visuals`/vídeo 003, cenas em canvas por quadro nas animações 002 e assinaturas de frame em componentes de produção. Não há benchmark que justifique alterar esses vídeos. A nova biblioteca não monta Players nos cards; carrega o módulo de composições sob demanda e monta um único Player por vez. Os cards são paginados em lotes de 24. Proxies e virtualização de mídias ainda não foram implementados.

## Camadas

```text
studio/                  React: biblioteca, formulários, painéis, Player
studio/editor/           Painéis de mídia, propriedades e montagem básica
shared/model.ts          Contratos IPC e formato versionado de projeto
shared/validation.ts     Validação de entradas, limites e relações
desktop/preload.ts       API limitada via contextBridge
desktop/main.ts          Ciclo de vida, diálogos nativos e coordenação IPC
desktop/store.ts         SQLite: projetos, canais e revisões
desktop/media.ts         Hash, cópia gerenciada, miniaturas e FFprobe opcional
desktop/packages.ts      Importação/exportação de pacotes portáteis
desktop/protocol.ts      Entrega restrita de arquivos e HTTP Range
desktop/files.ts         Tipos de mídia e contenção de caminhos
src/                     Composições Remotion anteriores, preservadas
```

`studio/legacy.tsx` lê a árvore de registros original sem invocar componentes de vídeo. Reconhece os wrappers atuais (`Fragment` e `MyComposition`) e falha explicitamente se surgir um wrapper desconhecido. Para novos wrappers/folders, ampliar o adaptador e o teste. O build gera `legacy.json`; uma nova composição de código requer reconstruir o desktop.

Novos projetos são dados em SQLite e mídias locais, não arquivos TSX no repositório. O preview usa `Sequence` e componentes de mídia Remotion. Não registra cada novo projeto em `Root.tsx`. O render parametrizado será uma camada própria na Fase 2.

## Persistência e concorrência

SQLite embutido no Node do Electron, sem módulo nativo externo: WAL, `synchronous=FULL`, transações pequenas e `user_version=1`. Cada salvamento guarda a versão anterior e incrementa `revision`; versões concorrentes são rejeitadas. Até 50 revisões anteriores são mantidas por projeto. A interface de recuperação dessas revisões é futura.

O processo principal serializa operações IPC para impedir conflitos entre importação e salvamento. Hash usa streams, cópias usam I/O assíncrono e FFprobe roda em processo separado com timeout. Não há render pesado nessa thread. Metadados pequenos usam SQLite síncrono; catálogos muito grandes deverão migrar essas consultas para um serviço dedicado após medição.

Importações copiam primeiro para arquivo temporário, verificam hash e só então publicam o arquivo gerenciado. Interrupções podem deixar temporários `.importing`, nunca projetos referenciando arquivos parcialmente copiados. Não existe limpeza destrutiva automática.

## Segurança

- Renderer sem Node, com sandbox e `contextIsolation`.
- IPC limitado por método, remetente, frame principal e URL exata.
- CSP, bloqueio de navegação, janelas externas, webviews e permissões.
- Rede externa bloqueada nesta fase offline.
- Protocolo `cliprush://app`: arquivos da UI, mídias públicas antigas e assets previamente registrados; sem API para ler caminhos arbitrários.
- Contenção por `realpath` impede traversal e saída por links simbólicos.
- O renderer não pode modificar caminhos de assets pelo salvamento do projeto. Metadados de decodificação possuem método limitado e validado.
- Pacotes não executam código; validam esquema, limites, caminhos relativos e SHA-256 antes da importação.

Referências usadas: [segurança Electron](https://www.electronjs.org/docs/latest/tutorial/security/), [context isolation](https://www.electronjs.org/docs/latest/tutorial/context-isolation) e [instalação do Remotion Player](https://www.remotion.dev/docs/player/installation).

## Dependências e riscos conhecidos

`npm audit` registrou 23 ocorrências agregadas (13 moderadas, 10 altas), incluindo cadeias de desenvolvimento do empacotador e dependências Remotion existentes. O relatório está em `out/desktop-dependency-audit.json`. Não houve `audit fix --force`, downgrade ou atualização indiscriminada. O pacote exclui `node_modules`; isso reduz o pacote, mas não elimina automaticamente problemas em código incorporado ao bundle. Resolver as dependências afetadas antes de distribuição pública.

No Node de desenvolvimento 22.12.0, a dependência transitiva `eslint-visitor-keys@5.0.1` emite aviso de engine; os testes e lint executaram, mas para desenvolvimento é recomendado Node compatível com as engines instaladas (por exemplo, 22.13+). O executável inclui seu próprio runtime Electron.
