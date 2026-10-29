# ClipRushAI002NarradoV2

Revisão independente da versão narrada. Os arquivos de `ClipRushAI002`, `ClipRushAI002Narrado` e `video-001` foram preservados. A V2 reutiliza os desenhos originais, substitui o controle de tempo do cenário e acrescenta direção de câmera, efeitos e títulos próprios.

## Causa do travamento

`narrado/ClipRushAI002Narrado.tsx` usava `Freeze` para remapear o relógio da composição narrada (731 frames) para o mundo original (0–899). Na versão instalada do Remotion, `useTimelinePositionFromContext` limita a posição absoluta ao intervalo `0..durationInFrames-1`, inclusive sob `Freeze`. Portanto, um pedido de frame 787 ou 870 era lido pelo `useCurrentFrame()` do mundo como **730**. Esse limite era atingido aproximadamente no frame 548 da narração, perto de 18,27 segundos. Os títulos, fora do `Freeze`, continuavam, mas o mundo parava.

O teste isolado `scripts/fixtures/video-002-v2-audit.jsx` reproduz o comportamento antigo sem textos ou áudio, permitindo comparar apenas os pixels do cenário. As composições de teste não aparecem no Studio normal.

## Correção e direção visual

`WorldCanvasV2` lê o frame real da composição e calcula dois valores comuns, sem alterar o relógio do Remotion:

- `sourceFrame`: número remapeado para os eventos do mundo original, passado diretamente às funções de desenho; pode avançar normalmente até 899.
- `time`: tempo da narração normalizado à gravação analisada, usado por câmera, impactos e atmosfera.

Não há `Freeze`, manipulação de contexto interno do Remotion ou dependência de frames absolutos fora da composição. Cada frame é redesenhado de forma determinística, incluindo após seek fora de ordem.

Melhorias criativas:

- A abertura já mostra o mundo no primeiro frame, com pixels luminosos, aproximação rápida e revelação imediata.
- A câmera acompanha a corrida e a coleta com pan e variação moderada de escala.
- O personagem ganha mais presença, inclinação na passagem pelo portal e continuidade da animação de passada.
- “Tudo mudou” aciona impulso de câmera, anel de energia e trilhas de partículas; a órbita acompanha a geometria se fragmentando e ganhando perspectiva.
- A revelação do vale recua para mostrar profundidade; vegetação no primeiro plano se move em outra velocidade.
- A comparação usa varredura luminosa, mudança de enquadramento e um trecho lado a lado.
- A parte final mantém avanço de câmera, órbita suave, nuvens, partículas, personagem e cachoeiras em movimento; a pergunta recebe um impacto breve.
- Os títulos usam menos palavras, escala menor e entradas com `spring()`, deixando mais espaço para a cena.

Continua sendo profundidade 2.5D em Canvas com perspectiva calculada. Não foi instalado um motor 3D nem aplicado motion blur físico.

## Arquivos

- `ClipRushAI002NarradoV2.tsx`: composição; contém uma única reprodução da voz.
- `WorldCanvasV2.tsx`: buffers de desenho, personagem, parallax, transições, energia e comparação.
- `camera.ts`: planos de zoom/pan, órbita, dolly e pulsos associados à narração.
- `V2Titles.tsx`: títulos e identificações das eras no relógio real da fala.
- `metadata.ts`: reutiliza a medição real do áudio e define nome de saída independente.

As funções originais de geometria e os assets permanecem intactos. Para editar enquadramentos, alterar `camera.ts`; para textos, `V2Titles.tsx`; para energia e primeiro plano, `WorldCanvasV2.tsx`.

## Narração e cues

Áudio preservado: `public/videos/video-002/narracao.mp3`, via `staticFile("videos/video-002/narracao.mp3")`, inteiro, volume 1 e velocidade 1×. Nenhuma música ou efeito sonoro foi adicionado.

`audio-cues.json` foi conferido novamente: suas marcações são da versão silenciosa de 30 segundos, não timestamps da voz. Continuamos reutilizando seus eventos por meio do alinhamento já documentado em `audio-cues-narrado.json` e `narrado/timing.ts`: começo em 3,68 s, mudança em 9,56 s, dimensão em 11,76 s, comparação em 12,6 s e pergunta em 21,7 s.

A duração é medida ao carregar por `calculateMetadata`, decodificando o MP3 local. Com o arquivo atual: 24,346 s de áudio, **731 frames / 24,367 s a 30 fps**, em 1080×1920, 9:16. Se o conteúdo da narração mudar, revisar os cues; recalcular duração sozinho não realinha frases diferentes.

## Verificação e prévia

```powershell
npm.cmd run lint
node scripts/review-video-002-v2.mjs
npm.cmd run dev
```

Abrir `http://localhost:3000/ClipRushAI002NarradoV2`, usando a porta impressa pelo Studio se ela for diferente.

O script de revisão gera PNGs representativos e testa **todos os 191 frames consecutivos de 540 a 730** do cenário sem títulos, em resolução reduzida. A comparação entre frames adjacentes impede que palavras animadas escondam um mundo congelado. Também reproduz o defeito antigo nos frames 600/650/710, confere determinismo após seek, metadados das cinco composições e hashes dos arquivos anteriores monitorados.

Resultados: `out/video-002/v2-review/report.json` e `tail-hashes.json`. A baseline local `preserved-before.json` foi criada antes desta revisão e precisa existir para repetir a verificação dos originais; fica ignorada pelo Git com `out/`.

Nenhum MP4 é gerado por esse teste. Preferências preparadas: H.264/yuv420p; destino futuro `out/video-002/cliprush-ai-002-narrado-v2.mp4`, somente após aprovação.
