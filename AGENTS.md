# ClipRush Editor

## Arquitetura

Projeto local de produção de vídeos com Remotion 4.0.539, React 19 e TypeScript estrito.

- `src/index.ts`: entrada do Remotion; registra `RemotionRoot`.
- `src/Root.tsx`: reúne os registros das composições.
- `src/Composition.tsx`: template original preservado. `MyComp` ainda não tem conteúdo visual; usa 1280×720, 30 fps e 60 frames.
- `src/videos/video-NNN/`: código de cada produção; registrar novas composições em `Root.tsx` com IDs únicos. `video-001` contém a edição vertical `ClipRushVideo001`; detalhes no README da produção.
- `src/components/`: componentes visuais reutilizáveis entre produções.
- `public/videos/video-NNN/`: mídias de cada vídeo, separadas em `footage`, `audio`, `images`, `fonts` e `captions`.
- `skills/`: índice e procedimentos locais do ClipRush; skills oficiais continuam em `.agents/skills/`.
- `out/video-NNN/`: exports e imagens de revisão. `out` já é ignorado pelo Git; recriar a pasta após clonar quando necessário.
- `remotion.config.ts`: configuração da CLI, preservada. APIs Node exigem opções próprias.

## Comandos

Executar na raiz, usando as dependências locais já instaladas:

| Comando | Finalidade |
| --- | --- |
| `npm run dev` | Abrir o Remotion Studio |
| `npm run build` | Gerar bundle; não exporta MP4 |
| `npm run lint` | Executar ESLint em `src` e depois TypeScript |
| `.\node_modules\.bin\tsc.cmd --noEmit` | Verificar somente TypeScript no PowerShell |
| `.\node_modules\.bin\remotion.cmd render src/index.ts MyComp out/video-001/template-v001.mp4` | Exportar o template atual, somente quando solicitado; ele está vazio |

Para produções futuras, substituir `MyComp` pelo ID registrado e escolher um nome de saída novo, por exemplo `video-001-v001.mp4`. A configuração existente permite sobrescrever exports: verificar se o destino já existe antes de renderizar. Não executar upgrade como parte de tarefas rotineiras.

## Skills e referências

Começar por [.agents/skills/remotion-best-practices/SKILL.md](.agents/skills/remotion-best-practices/SKILL.md) e carregar as skills relacionadas à tarefa. Consultar o índice em [skills/README.md](skills/README.md) e o fluxo em [skills/producao.md](skills/producao.md). Preservar `skills-lock.json` e os arquivos oficiais instalados.

Documentação oficial: [assets com staticFile](https://www.remotion.dev/docs/staticfile), [render pela CLI](https://www.remotion.dev/docs/cli/render).

## Regras de produção

1. Preservar originais, alterações do usuário e o template. Adicionar arquivos por produção; não mover, excluir ou substituir conteúdo sem necessidade.
2. Definir roteiro, formato, fps e duração antes de implementar. Não assumir que todas as produções usam o formato do template.
3. Referenciar mídia local com `staticFile("videos/video-001/images/arquivo.png")`; o caminho não inclui `public/`. Nunca usar caminhos absolutos do computador na composição.
4. Derivar animações de `useCurrentFrame()` e `interpolate()` ou `spring()`. Não usar animações CSS, timers ou `Math.random()` para controlar a timeline; usar `random()` do Remotion quando necessário.
5. Obter `fps` com `useVideoConfig()` nas cenas e converter segundos em frames. Manter `useCurrentFrame()` no menor componente que precisa dele e respeitar o frame local de cada `Sequence`.
6. Separar cenas e componentes reutilizáveis conforme a necessidade real. Manter IDs de composição únicos, tipos explícitos e metadados coerentes.
7. Seguir `remotion-markup` para mídia e animação e `remotion-captions` para legendas. Confirmar que um pacote está instalado antes de importá-lo.
8. Explicar o motivo antes de instalar qualquer dependência externa. Para pacotes Remotion, usar a orientação de `remotion add` da skill e manter versões compatíveis. Não instalar nada apenas para preparar diretórios.
9. Ao criar ou editar vídeo, abrir o Studio cedo e revisar cortes, camadas, texto e sincronização. Exportar somente quando solicitado explicitamente.
10. Executar a verificação TypeScript após alterações e `npm run lint` quando pertinente. Relatar erros existentes sem esconder falhas ou alterar originais fora do escopo.
11. Guardar exports versionados em `out/`; nunca tratar essa pasta ignorada como armazenamento de originais. Não colocar segredos em `public/`, pois seu conteúdo é servido pelo Remotion.
