# AGENTS.md — ClipRush Editor

## Missão

Este repositório é um ambiente de produção e edição de vídeos narrados com Remotion 4, React 19 e TypeScript. O Codex deve transformar os arquivos fornecidos em vídeos visuais, claros e dinâmicos, com o mínimo de intervenção e sem desperdiçar contexto.

- **O áudio é a fonte de tempo; o roteiro é a fonte preferencial de conteúdo.** A narração pode ser sintetizada ou gravada pelo usuário: tratar ambas igualmente.
- **Não usar mascote, avatar, apresentador ou personagem recorrente por padrão.** Não impor identidade GTA VI, Rush, estilo gamer ou desfecho de mistério. Só usar elementos desse tipo quando solicitados para a produção atual.
- Escolher linguagem visual conforme o assunto: construção, tecnologia, curiosidade, comparação, tutorial, games etc. Priorizar explicações compreensíveis e ritmo envolvente, sem efeitos gratuitos.

## Estrutura essencial

- `src/index.ts` e `src/Root.tsx`: entrada do Remotion e registro de composições.
- `src/videos/video-NNN/`: código isolado de cada produção; IDs de composição únicos.
- `src/components/`: componentes reutilizáveis quando houver benefício real.
- `public/videos/video-NNN/`: mídias específicas da produção (áudio, roteiro, imagens, vídeos, legendas, fontes). Reconhecer subpastas equivalentes como `narracao`, `imagens`, `videos-complementares`, `audio`, `footage` e `images`.
- `public/videos/biblioteca/`: acervo **global e reutilizável**, separado dos arquivos de cada produção. Não mover nem duplicar os originais sem necessidade.
- `public/videos/biblioteca/gta6/videos/`: trailers e vídeos originais do GTA VI; `public/videos/biblioteca/gta6/personagens/`: imagens relacionadas. Há também pastas `gta5/` e `rdr2/`, sem presumir que já possuam catálogo.
- `public/videos/biblioteca/catalogo/gta6/cenas-descritas.json`: índice principal para busca automatizada; `cenas-descritas.csv`: versão editável para revisão humana no Excel; subpastas de cada vídeo guardam CSVs de cortes e miniaturas WebP.
- `scripts/descricao_biblioteca_cliprush.py`: manutenção/descrição local do catálogo, caso exista nesse caminho; **não executá-lo durante uma edição comum**.
- `out/video-NNN/`: exports e imagens de revisão, com nomes versionados. Não sobrescrever arquivos existentes.
- Preservar `src/Composition.tsx` (`MyComp`) e as produções anteriores.
- Se uma pasta indicada estiver em outro caminho, localizá-la por nome antes de assumir que está vazia; não mover arquivos originais sem necessidade.

## Entradas e interpretação

1. Receber o identificador (`video-010`, por exemplo) e inspecionar **somente** seus arquivos e o código necessário.
2. Preferir `roteiro.txt` (ou equivalente) para tema, fatos, sequência e destaques. Não exigir texto se a narração estiver disponível.
3. Encontrar a narração real (`.mp3`, `.wav`, `.m4a` ou formato suportado), seja de IA ou humana. Preservar integralmente o áudio, salvo autorização expressa para alterar.
4. Usar o áudio para duração, ritmo, pausas e alinhamento. Se houver roteiro correspondente, **não retranscrever o áudio inteiro**; obter timestamps localmente só com a precisão necessária.
5. Se houver apenas áudio, usar transcrição local já disponível quando necessária, guardando o resultado para evitar repetição; se inviável, informar o bloqueio, sem inventar o conteúdo.
6. Se roteiro e áudio divergirem, o áudio final prevalece sobre o que é efetivamente dito; verificar somente diferenças relevantes.
7. Usar primeiro as mídias fornecidas para a produção. Quando fizer sentido, complementar com a biblioteca global (regras abaixo). Se faltar mídia, preferir gráficos, textos, formas, ícones e animações disponíveis. Não inventar fatos, evidências, cenas reais nem citações.

## Biblioteca global e busca de cenas — regra permanente

**Objetivo:** aproveitar vídeos originais e timestamps já catalogados, principalmente em conteúdos de GTA VI, sem enviar frames em massa ao Codex, sem reindexar vídeos e sem repetir a análise visual feita localmente com Ollama/Gemma 3.

1. **Acionar somente quando relevante:** para uma produção relacionada a GTA VI, consultar o catálogo `public/videos/biblioteca/catalogo/gta6/cenas-descritas.json` após verificar as mídias da própria produção. Para GTA V/RDR2, usar um catálogo apenas se realmente existir; nunca inferir que está pronto.
2. **Pesquisar por ideia, não por vídeo inteiro:** transformar as frases/assuntos da narração em poucas buscas por personagens, ações, objetos, lugares e sinônimos. Usar busca textual local sobre descrições/tags; normalizar acentos e maiúsculas. Se houver ferramenta de busca local já implementada, reutilizá-la; caso contrário, criar uma ferramenta pequena e reutilizável somente quando necessária. Conferir o esquema real do JSON antes de assumir nomes de campos.
3. **Limitar a saída:** devolver no máximo **5 candidatos por busca**, com nome/caminho do vídeo original, início, fim, descrição, tags (se presentes), referência da miniatura e avisos de revisão (se presentes). Não despejar o JSON completo nem centenas de linhas no contexto. Agrupar pesquisas quando possível.
4. **Validar só o selecionado:** as descrições geradas pelo Gemma 3 são aproximações feitas a partir de frames estáticos, não provas de fatos nem de movimento. Para candidatos ambíguos, conferir **somente** 1–3 miniaturas/trechos escolhidos. Não presumir nomes de personagens, objetos, ações ou acontecimentos que a imagem não sustente. Se a correspondência continuar duvidosa, escolher outra mídia ou sinalizar a limitação.
5. **Usar a mídia original:** utilizar os timestamps encontrados para recortar/posicionar o trecho do `.mp4` original na timeline do Remotion, convertendo tempos e frames conforme o FPS apropriado. Usar `staticFile('videos/biblioteca/gta6/videos/...')` em composições; não usar a miniatura WebP como substituta do vídeo quando a cena pede movimento. Não copiar o vídeo integral para `video-NNN/`.
6. **Prioridade e variedade:** mídias fornecidas pelo usuário para `video-NNN/` prevalecem; a biblioteca é complementar. Evitar repetir o mesmo trecho sem motivo. Se não houver correspondência confiável, criar explicação visual em vez de forçar uma cena errada.
7. **Preservar a indexação:** não executar PySceneDetect, Ollama/Gemma 3 ou `descricao_biblioteca_cliprush.py` por padrão; não regenerar imagens, CSVs ou JSONs para produzir Shorts. Só indexar/reprocessar quando o usuário pedir manutenção ou adicionar novos vídeos ao acervo, com cache incremental. Não sobrescrever ajustes manuais no CSV nem apagar registros anteriores.
8. **Economia de contexto:** a busca deve acontecer localmente e trazer apenas metadados dos candidatos. Evitar abrir todos os frames, reler o catálogo inteiro em mensagens, baixar assets já existentes ou instalar novos modelos sem necessidade.

## Fluxo autônomo de produção

Ao receber um pedido como **“produza o vídeo da pasta video-NNN”**, executar o ciclo abaixo sem confirmações triviais:

1. **Entender:** identificar assunto, ideia central, estrutura, público presumido pelo conteúdo e momentos importantes; não presumir que todo vídeo é sobre jogos.
2. **Planejar:** elaborar internamente storyboard curto por ideias/frases, com intervalos de áudio, função dos visuais e transições. Não impor trocas artificiais a cada X segundos.
3. **Selecionar mídias:** usar primeiro o conteúdo de `video-NNN/`; consultar o catálogo global apenas se pertinente, conforme as regras anteriores. Escolher trechos originais pelos timestamps e revisar somente candidatos relevantes.
4. **Editar:** usar B-roll pertinente, recortes, zoom/pan moderado, parallax quando útil, textos breves, palavras-chave, setas, diagramas, comparações, destaques e elementos animados que **facilitem a explicação**. Priorizar legibilidade no celular e variedade com função narrativa.
5. **Sincronizar:** acompanhar palavras, pausas e mudanças de assunto. Não cortar, acelerar ou esticar a narração para caber em duração fixa sem autorização.
6. **Implementar:** criar composição isolada, registrar em `Root.tsx`, reutilizar componentes pertinentes e preservar outras produções.
7. **Revisar:** validar TypeScript, início/meio/final, transições, enquadramentos, texto cortado, telas vazias, mídia ausente e sincronia; usar Remotion Studio ou previews/frames conforme viabilidade.
8. **Entregar:** renderizar MP4 com nome novo em `out/video-NNN/`, verificar tecnicamente e reportar caminho, duração, dimensões, testes e bloqueios reais.

**Escopo de renderização:** pedidos para **criar/produzir/gerar um vídeo** autorizam exportação MP4. Pedidos **apenas para ajustar `AGENTS.md`, investigar, planejar ou alterar um detalhe** não autorizam renderizar ou modificar outras produções sem necessidade.

## Padrões técnicos

- Para novos vídeos verticais, usar **1080×1920 e 30 fps**, salvo orientação contrária. Duração = narração real.
- Referenciar mídias em `public/` via `staticFile('videos/...')`, tanto para `video-NNN` quanto para a biblioteca. Nunca colocar caminhos absolutos do computador nas composições.
- Controlar animações pela timeline com `useCurrentFrame()`, `useVideoConfig()`, `interpolate()` ou `spring()`. Não usar timers, animações CSS dependentes de relógio ou `Math.random()` para determinar frames.
- Manter tipos explícitos, IDs únicos, arquivos organizados e componentes simples.
- Confirmar dependências antes de instalar; não contratar serviços pagos, fazer upgrades rotineiros ou publicar em redes sem solicitação.
- Usar `npm run lint` e verificações TypeScript quando pertinentes; testes proporcionais à alteração. Na exportação, verificar áudio, duração, resolução e integridade com ferramentas existentes, como `ffprobe`.
- Não armazenar credenciais nem dados privados em `public/`.

## Skills e economia de contexto

- Começar por este `AGENTS.md`; abrir apenas arquivos e trechos necessários. Não varrer o repositório inteiro por rotina.
- Consultar `.agents/skills/remotion-best-practices/SKILL.md` e skills relacionadas **somente quando a tarefa exigir**. Para vídeo vertical, verificar `.agents/skills/cliprush-producao-vertical/SKILL.md`, priorizando regras genéricas e ignorando regras antigas de mascote/GTA VI conflitantes. Abrir `skills/README.md` ou `skills/producao.md` só se necessário.
- **CodeGraph:** usar para dependências e símbolos complexos; não para alterações pontuais.
- **RTK:** preferir `rtk` em comandos compatíveis quando reduzir a saída; se falhar, usar o comando normal. Não depender de hook automático no Windows nem afirmar economia não medida.
- Priorizar `rg`, caminhos conhecidos, saídas curtas e diffs pequenos. Não repetir leituras, reinstalar ferramentas, despejar logs longos ou executar testes não relacionados.
- Fazer decisões seguras autonomamente. Perguntar apenas por insumo essencial ausente, risco de sobrescrita/perda ou escolha que mude significativamente o objetivo.
- Resposta final curta: MP4, duração/resolução, mudanças relevantes, validação e bloqueios.

## Manutenção do aplicativo desktop (somente quando envolver Electron/Studio)

- `desktop/`, `studio/` e `shared/` contêm aplicativo, interface e contratos. Consultar `docs/IMPLEMENTATION_STATUS.md` para distinguir implementado de planejado.
- Projetos desktop usam workspace próprio; não converter nem modificar produções antigas automaticamente.
- Para tarefas desktop, executar testes adequados (`npm run desktop:typecheck`, `npm run desktop:test` e `desktop:e2e` quando necessário), mantendo testes isolados com `CLIPRUSH_DATA_HOME` em pasta de teste sob `out/`.
- Preservar `sandbox`, `contextIsolation`, IPC restrito, validação de caminhos, integridade de mídia e migrações SQLite seguras. Nunca limpar o perfil real do usuário em testes.
- Não anunciar upload, geração por IA ou publicação como funcionais sem implementação e validação reais.


Antes de renderizar qualquer vídeo completo, validar visualmente um frame representativo de cada bloco da timeline. Não considerar lint, TypeScript ou decodificação FFmpeg como prova de que as mídias aparecem. Não substituir cenas importantes por cartelas sem informar a limitação. Quando a busca textual falhar, pesquisar alternativas relevantes na biblioteca antes de desistir.