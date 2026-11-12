# Video-008 — O mistério de Rocco

## Estado da entrega

Composição implementada: `ClipRushAI008Rocco`. A edição está disponível para revisão, mas **o frame do cachorro no trailer ainda não foi identificado visualmente**. Não tratar a prévia como export final.

O usuário indicou 00:30–00:31, corrigiu a localização para o **canto inferior direito** e confirmou o arquivo `public/videos/video-008/video-complementar/Launch Trailer.mp4`. A inspeção dos frames 900, 915 e 930, com enquadramento inteiro, mostra Jason diante de uma porta; não foi possível reconhecer o cachorro. Após a correção, a região inferior direita foi ampliada entre os frames 895 e 933, em passos de dois frames; a identificação segue pendente. Contatos de inspeção em `out/video-008/right-corner-review.jpg`, `trailer-sheet.jpg` e `exact-01.png` a `exact-03.png`. As imagens `right-*` e `exact-*` têm gamma elevado somente para inspeção; a composição usa o material original sem essa alteração.

A prévia agora reproduz o arquivo original dos frames 830 a 927, sem áudio, e pausa no **frame 927, 00:30,900**. O frame foi extraído diretamente com FFmpeg, sem geração de imagem. A pausa está marcada como “em conferência”; não há círculo atribuindo um cachorro a um ponto não identificado. `trailer-selection.json` mantém `verified: false`, e o script recusa exportação final nessa condição.

## Formato e voz

- 1080 × 1920, vertical 9:16, 30 fps.
- Narração original: `audio/narracao.mp3`, FFprobe: **29,648938 s**.
- `ceil(29.648938 * 30) = 890 frames`, duração final da timeline: **29,666667 s**.
- MP3 integral, ganho 0,92, sem cortes, aceleração ou regravação.
- Última palavra alinhada até aproximadamente 29,28 s; não foi acrescentada cauda à timeline.

## Assets

Originais fornecidos em `public/videos/video-008/`:

| Arquivo | Uso |
|---|---|
|`audio/narracao.mp3`|Voz integral|
|`imagens/chopp de lado.webp`|Gancho, comparação e CTA; original 358×328|
|`imagens/frankilin e chop.webp`|Franklin + Chop; original 984×554|
|`imagens/jason e cachorro.jpg`|Contexto, investigação e inscrição; original 3840×2160|
|`video-complementar/Launch Trailer.mp4`|Trecho em movimento e frame de conferência; 1276×718, 30 fps, 90 s de vídeo|

`inventory.json` registra FFprobe e SHA-256 dos cinco originais. A origem oficial é a informada pelo usuário; não foi feita autenticação externa. Nenhuma mídia externa foi baixada.

Derivados nesta produção: `images/jason-dog-lossless.webp` (conversão sem perda dos pixels decodificados do JPEG), `images/trailer-frame-0927-review.webp` e duas faixas WAV sintetizadas localmente. Os originais foram preservados.

Não foram encontrados assets compatíveis do mascote Rush. O trabalho usa tipografia ClipRush, ciano, roxo e amarelo, movimentos de câmera e marcações gráficas. Não foram instaladas dependências nem modificados componentes compartilhados. Fontes: Impact/Arial disponíveis no ambiente Windows de render.

## Timeline

| Frames (fim exclusivo) | Conteúdo |
|---|---|
|0–69|Gancho Chop → cachorro, nome ocultado|
|69–170|Franklin + Chop, dois enquadramentos|
|170–268|Trailer real em movimento, seleção em conferência|
|268–347|Frame 927 real, em conferência|
|347–509|Imagem de Jason, aproximação até o cachorro|
|509–603|Investigação da faixa vermelha|
|603–632|“ROCCO?” e identificação como leitura aparente|
|632–771|Comparação: COMPANHEIRO NÃO CONFIRMADO|
|771–890|Pergunta e CTA ClipRush|

Os tempos vêm do alinhamento local do MP3, não das estimativas de 40 segundos do briefing. Títulos e anotações são editoriais. A inscrição tem uma pequena cobertura gráfica com “?” antes da revelação; a leitura original aparece intacta a partir de 20,10 s. Não há reconstrução de letras, nitidez artificial ou imagem de evidência gerada por IA.

## Legendas e áudio

`transcript.raw.json`: faster-whisper large-v3 já instalado, modelo em cache, sem rede. `captions.json`: timestamps e confianças preservados, com grafia de GTA 5/6 e pontuação ajustada ao texto fornecido. Grupos curtos com revelação progressiva, destaque amarelo e limites entre frases; não antecipam “ROCCO”. Sincronismo estimado por ASR, sem certificação fonema a fonema por escuta humana.

Trilha e SFX originais determinísticos, seed 8008, sem samples externos. Suspense baixo, interrupção em “Pera”, redução antes da revelação, impacto em “Rocco” e toque final. Geração reproduzível em `scripts/prepare-video-008.py`, que recusa sobrescrever faixas existentes.

## Prévia e comandos

Studio: http://localhost:3000/ClipRushAI008Rocco

```powershell
npm.cmd run dev
node scripts/review-video-008.mjs
node scripts/review-video-008.mjs --preview
```

As imagens de revisão ficam em `out/video-008/frame-*.jpg`. Abertura: frame 0000; pausa de conferência: 0268; revelação: 0620; encerramento: 0889.

Prévia atual exportada: `out/video-008/preview-pending-v001-v002.mp4`, 9.134.310 bytes, H.264/AAC, 1080×1920, 30 fps, 890 frames. A versão anterior com cartões de material pendente foi preservada em `preview-pending-v001.mp4`.

Após identificar e revisar o cachorro no trailer, atualizar a seleção e o enquadramento, conferir o freeze, então:

```powershell
node scripts/review-video-008.mjs --render
```

O destino final previsto é `out/ClipRushAI008Rocco.mp4`, com variante versionada caso exista. **Esse arquivo final ainda não foi gerado.** O script usa H.264, AAC 192k, yuv420p, CRF 18 e recusa sobrescrita.

## Validação

- ESLint + TypeScript (`npm.cmd run lint`): passou.
- Build (`npm.cmd run build` com argumentos): passou; a CLI emitiu bundle em `build/`, movido após a execução para `out/video-008/build-v001`. O script de revisão também gerou bundle isolado em `out/video-008/bundle`.
- 23 imagens de revisão e auditoria do Studio em 62 posições: sem overflow de texto nem título “ROCCO” antecipado.
- 184 arquivos/registros anteriores e cinco originais verificados por SHA-256; em `Root.tsx`, somente duas importações e o novo registro foram adicionados.
- Prévia atual: decodificação integral FFmpeg passou, nenhum intervalo preto detectado, pico de áudio -1,2 dBFS e média -18,6 dBFS. Diferença média entre pixels da área do vídeo no último frame em movimento e no still: 0,879/255 (compressão JPEG/decodificação), sem salto de enquadramento. Relatório em `out/video-008/integrity-report.json`.
- A identificação visual do cachorro, o zoom nos óculos e a marcação do animal no freeze permanecem pendentes. A reprodução real e a extração do frame estão preparadas, mas não substituem essa verificação.
- Nenhuma alteração desktop; testes Electron não se aplicam.
- RTK foi tentado e falhou ao iniciar no Windows; comandos nativos foram usados.
