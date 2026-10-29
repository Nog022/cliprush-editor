# ClipRushAI002Narrado

Variante narrada independente de `ClipRushAI002`. O original de 30 segundos e seus arquivos permanecem intactos. O Prompt Mestre V2 ainda não foi fornecido nesta conversa; esta variante implementa a integração e o alinhamento da narração solicitados, reutilizando a arte existente.

- Áudio correto: `public/videos/video-002/narracao.mp3`, referenciado com `staticFile("videos/video-002/narracao.mp3")`.
- Resolução: 1080×1920, 30 fps, H.264/yuv420p como preferências.
- O áudio atual mede aproximadamente **24,346 s**, incluindo a cauda após a fala; não foi cortado nem acelerado para caber em 23 segundos.
- `metadata.ts` decodifica o arquivo local por Web Audio em `calculateMetadata` e define `Math.ceil(duration * 30)`: **731 frames / 24,367 s** com este MP3. Os poucos milissegundos extras completam o último frame.
- Uma única instância de `Audio` reproduz a voz inteira a 1×, fora de qualquer retiming ou `Freeze`.

## Alinhamento

O `audio-cues.json` existente foi inspecionado e preservado. Seu status e seus eventos são da montagem visual original de 30 segundos; esses timestamps não correspondem à narração de 24,35 segundos.

Reaproveitamos os 16 eventos e seus frames originais como referências do mundo animado, reposicionando-os pela fala. `timing.ts` é o mapeamento executado; `public/videos/video-002/audio-cues-narrado.json` documenta a correspondência, sem substituir o JSON original.

A transcrição em `public/videos/video-002/narracao-alignment.json` foi produzida localmente com faster-whisper large-v3 já instalado e modelo em cache. Não houve download nem envio da voz para APIs. É uma referência automática para montagem; conferir a sincronização na revisão auditiva.

| Áudio             | Visual                                        |
| ----------------- | --------------------------------------------- |
| 0–3,44 s          | Gancho; texto a partir de “como”              |
| 3,68–7,98 s       | Pixels, corrida, salto e coleta               |
| 8,24–12,48 s      | Portal, transformação e nova dimensão         |
| 12,62–17,42 s     | Comparação entre pixels e mundos detalhados   |
| 17,64–21,54 s     | Mundo moderno e evolução                      |
| 21,70–23,78 s     | Pergunta final                                |
| 23,78 s até o fim | Encerramento visual e cauda integral do áudio |

`NarratedWorld` remapeia somente o frame lido pelo `WorldCanvas`, preservando toda a geometria original. `NarratedTitles` usa o relógio real da narração para não acelerar as palavras junto com a câmera. O áudio fica fora do relógio remapeado. A profundidade continua sendo 2.5D por Canvas; nenhum motor 3D foi adicionado.

Se a duração do MP3 mudar, a composição recalcula seu comprimento e adapta proporcionalmente as marcações visuais. Se o conteúdo ou a velocidade interna da fala mudar, retranscrever e revisar os cues; somente medir duração não identifica novas frases.

## Revisão

```powershell
npm.cmd run dev
npm.cmd run lint
node scripts/review-video-002-narrado.mjs
```

Abrir `http://localhost:3000/ClipRushAI002Narrado` (usar outra porta caso o Studio a informe). O script gera somente imagens em `out/video-002/narrado-review/`, valida as quatro composições, os 16 cues e os hashes dos arquivos anteriores monitorados. A baseline SHA-256 local foi criada antes da adaptação e fica em `preserved-before.json` na pasta de revisão; precisa existir para repetir essa auditoria.

Nenhum MP4 foi exportado. Saída futura, somente após aprovação: `out/video-002/cliprush-ai-002-narrado.mp4`.
