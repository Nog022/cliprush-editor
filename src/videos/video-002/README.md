# ClipRush AI 002 — De pixels a mundos

Animação original, independente, sem áudio nesta versão. Um mensageiro com capacete ciano e cachecol violeta atravessa uma plataforma, salta, coleta energia e encontra um portal. O mesmo terreno se fragmenta e se reorganiza em um vale com profundidade, luz de pôr do sol, estrada, vegetação, edifícios e cachoeiras.

## Formato e prévia

- Composição: `ClipRushAI002`.
- Vertical 9:16, 1080×1920, 30 fps, exatamente 900 frames / 30 segundos.
- MP4/H.264 e yuv420p preparados como preferências desta composição.
- Destino futuro: `out/video-002/cliprush-ai-002.mp4`.
- Nenhum MP4 é criado pelo código ou pelo script de revisão. Exportar somente após aprovação.

No PowerShell, na raiz:

```powershell
npm.cmd run dev
```

Selecionar `ClipRushAI002` ou abrir `http://localhost:3000/ClipRushAI002`. Se o Studio imprimir outra porta, usar essa porta na URL.

## Estrutura e edição

```text
video-002/
├── ClipRushAI002.tsx
├── constants.ts
├── components/
│   ├── AnimatedTitle.tsx
│   ├── AudioSlots.tsx
│   ├── CameraRig.ts
│   ├── geometry.ts
│   ├── ModernEnvironment.ts
│   ├── ParticleSystem.ts
│   ├── PixelCharacter.ts
│   ├── PixelEnvironment.ts
│   ├── TransitionEffects.ts
│   └── WorldCanvas.tsx
├── scenes/
│   ├── IntroScene.tsx
│   ├── PixelWorldScene.tsx
│   ├── TransformationScene.tsx
│   ├── ComparisonScene.tsx
│   └── FinalScene.tsx
├── styles/theme.ts
└── README.md
```

- **Linha do tempo:** as cinco `Sequence` em `ClipRushAI002.tsx` delimitam a direção editorial. O cenário é um único `WorldCanvas` persistente, fora desses recortes; o personagem e o mundo nunca reiniciam na troca de cena.
- **Textos:** editar `lines`, `size`, `top`, `hold` e `stagger` nos componentes de `scenes/`. A tipografia usa `spring()` e interpolação por palavra. `ChapterLabel` identifica os capítulos discretamente.
- **Paleta:** identidade e fonte em `styles/theme.ts`; materiais e gradientes locais em `PixelEnvironment.ts` e `ModernEnvironment.ts`. As cores específicas das faces permanecem próximas de sua geometria para facilitar a direção de luz.
- **Câmera:** ajustar órbita, distância, alvo e distância focal em `CameraRig.ts`. `geometry.ts` calcula a base da câmera e a projeção em perspectiva.
- **Transformação:** `getEvolution()` interpola as coordenadas planas e projetadas entre os frames 312 e 450. Faces do piso se afastam individualmente e voltam a se encaixar; paredes ganham espessura, montanhas revelam faces e árvores ganham volume. Não há troca dos ambientes por fade.
- **Personagem:** sprite original, cores, articulação, passada, trajetória e salto em `PixelCharacter.ts`. Ele mantém capacete, visor e cachecol durante a evolução.
- **Cenário:** céu, estrelas, nuvens, obstáculo e grama em `PixelEnvironment.ts`; montanhas, terreno triangulado, estrada sinuosa, alvenaria, torres, árvores, sombras, cachoeiras e atmosfera em `ModernEnvironment.ts`.
- **Efeitos:** coleta e partículas determinísticas em `ParticleSystem.ts`; portal, divisor e fragmentos de encerramento em `TransitionEffects.ts`. Há somente dois pulsos breves de luz e um glitch de dois frames.
- **Duração:** o contrato atual é 900 frames. Caso seja solicitado outro tempo, atualizar em conjunto a composição em `src/Root.tsx`, as cinco sequências, `constants.ts`, as faixas globais da câmera/transformação e os eventos de áudio. Alterar somente o número de frames pode cortar a narrativa.

## Storyboard e pontos de sincronização

| Cena                         | Frames  | Ação                                                                                                   |
| ---------------------------- | ------- | ------------------------------------------------------------------------------------------------------ |
| Gancho impossível            | 0–89    | Pixels luminosos desde o primeiro frame, montagem do ambiente, aproximação e “Como chegamos até aqui?” |
| Nascimento dos pixels        | 90–269  | Corrida, salto sobre obstáculo, coleta no frame 195 e partículas alimentando o portal                  |
| Grande transformação         | 270–479 | Portal, passagem, separação de faces, órbita, perspectiva, iluminação e revelação do vale              |
| Do simples ao extraordinário | 480–719 | Divisor atravessa o mesmo cenário em versões retrô e moderna, com pausa de comparação lado a lado      |
| O futuro está começando      | 720–899 | Avanço da câmera, “A evolução dos games”, pergunta final, assinatura e fragmentação em pixels          |

`CUES` em `constants.ts` nomeia os principais impactos. `public/videos/video-002/audio-cues.json` registra esses eventos em frames. Os dois arquivos precisam acompanhar alterações de timing.

## Técnica, desempenho e limites

Profundidade **2.5D por Canvas 2D**, com projeção matemática de vértices e câmera em perspectiva. Não há WebGL, Three.js, iluminação física ou motor 3D. Sombras, atmosfera, brilho e materiais são estilizados. O personagem continua sendo um sprite com sombreamento, não um modelo tridimensional com esqueleto.

Um canvas visível e dois buffers reutilizados concentram a geometria e as partículas, evitando centenas de nós DOM. O mundo retrô é desenhado em resolução reduzida e ampliado sem suavização; essa resolução sobe em etapas durante a evolução. A comparação desenha as duas versões e recorta uma delas no mesmo canvas.

Cada frame é recalculado do zero em `useLayoutEffect`, a partir do frame do Remotion. Não há relógio real, `requestAnimationFrame`, timers, downloads ou histórico de simulação. Sementes de `random()` são fixas. Assim, scrubbing e renderização fora de ordem usam a mesma animação. O primeiro e o último frame retornam à mesma constelação de pixels; o texto final desaparece antes desse retorno.

O céu ocupa todo o quadro. Textos principais ficam dentro de x=90–920, marca no topo em y=160 e títulos/assinaturas abaixo de y=1630. A arte de fundo pode atravessar as bordas; o personagem e a ação principal permanecem na região central. A coluna de ações e a faixa inferior dos aplicativos continuam livres dos textos principais.

## Áudio e direitos

Esta versão é visual e silenciosa. Nenhuma música, efeito ou narração foi inventada ou adicionada. Todos os desenhos foram feitos por código para esta produção. Arial/Helvetica são fontes de sistema, sem busca de fontes remotas. Nenhum pacote ou serviço externo foi instalado ou chamado.

`AudioSlots` recebe `audioCues`, vazio em `defaultProps` da composição. Para adicionar áudio futuramente, fornecer arquivos locais licenciados, registrar autoria/licença em `public/videos/video-002/` e adicionar uma entrada com `src` relativo a `public/`, `name`, `from`, `durationInFrames` e `volume`. Usar o mesmo relógio de 30 fps. Entradas simultâneas podem sobrepor áudio; regular volumes na revisão.

## Verificação

```powershell
.\node_modules\.bin\tsc.cmd --noEmit
npm.cmd run lint
node scripts/review-video-002.mjs
```

O script de revisão usa o Chrome já instalado, gera somente PNGs, verifica os metadados das três composições, repete o frame 350 para conferir determinismo e gera um frame de `MyComp` e `ClipRushVideo001`. Quando 0 e 899 estão no lote, compara seus hashes para validar o loop.

A baseline SHA-256 criada antes da implementação está em `out/video-002/review/preserved-before.json` e serve para confirmar que os 24 arquivos anteriores monitorados continuam intactos. Essa baseline local fica ignorada pelo Git com `out/`; uma nova máquina precisa gerar sua própria baseline antes de alterações para repetir essa comparação. Resultados da execução ficam em `out/video-002/review/report.json`; os PNGs de revisão podem ser substituídos pelo script.

Para revisar apenas alguns frames: `node scripts/review-video-002.mjs 185 350 450 650 820`.

Refinamentos possíveis após a revisão: desenhar mais poses do mensageiro para a era moderna, ampliar a variedade de vegetação, dirigir uma passagem de câmera mais próxima do portal e acrescentar trilha/efeitos sonoros originais ou licenciados nos eventos já marcados.
