# Video-007 — Os donos secretos de Vice City, episódio 1

Composição: `ClipRushVideo007`, 1080 × 1920, 30 fps, 1192 frames (39,733333 s).
Áudio medido por FFprobe: 39,706063 s; duração = ceil(áudio × fps). Última palavra estimada em 39,18 s.
Preview: http://localhost:3000/ClipRushVideo007
Export solicitado: `out/ClipRushVideo007.mp4` (script recusa sobrescrever).

## Direção e narrativa

Gancho em Jason → dossiê de Vice City → Brian → moradia e condição → suspeita de controle → rádio e personagem anônimo → parte 2. A teoria é identificada como teoria; contrato e interface de rádio são representações gráficas. Os trechos de ação não identificam missões ou cobranças confirmadas. Não há nome nem rosto no personagem final, desenhado em SVG.

20 planos contíguos, entre 28 e 90 frames. Movimento por frame, zooms suaves nas fotos, revelação de luz, painel de fotografias, conexão animada, split-screen, contrato e carimbo, ondas de rádio, scanline e silhueta. A montagem respeita a narração, antecipando o cliffhanger e o CTA em relação ao storyboard estimado.

## Timeline (frames, fim exclusivo)

| Início | Fim | Conteúdo |
|---:|---:|---|
|0|72|Jason / gancho|
|72|156|Segundo enquadramento / suspeita|
|156|221|Vice City / título|
|221|296|Painel de investigação|
|296|357|Revelação de Brian|
|357|421|Histórico criminoso|
|421|480|Ligação com Jason|
|480|563|Contrato ilustrativo / aluguel zero|
|563|613|Condição / carimbo|
|613|646|Serviços|
|646|683|Cobranças / montagem ilustrativa|
|683|740|Controle como teoria|
|740|800|Suspeita em Jason|
|800|867|Mudança de linguagem / rádio|
|867|916|Amigo desconhecido|
|916|950|Comunicações / barco|
|950|978|Guarda Costeira|
|978|1034|O que ele quer descobrir?|
|1034|1124|Parte 2 / silhueta|
|1124|1192|Siga o ClipRush|

## Assets e origem

Originais fornecidos em `public/videos/video-007/`: narração MP3, dez imagens JPEG 3840×2160, Trailer 1, Trailer 2 e Launch Trailer. Inventário com FFprobe e SHA-256 em `inventory.json`. Não foram pesquisadas nem adicionadas mídias externas; a origem/licença dos trailers e imagens é a informada pelo usuário, sem verificação independente de autenticidade.

Fotos usadas: Jason 01, 02, 05, 06; Brian 01, 02, 03, 04. Trechos silenciosos em `footage/`, com origem e timecodes em `selects.json`. Seleções usadas: city, keys, brian-v2, risk-v2, boat. As primeiras extrações brian/risk e a alternativa jason foram preservadas mas não entram na montagem final.

Trilha de tensão e SFX sintetizados localmente com seed fixa, sem samples ou serviços externos; geração reproduzível em `scripts/sound-video-007.py`. Impactos, metal, carimbo, whooshes e interferência discreta. Voz original completa com ganho 0,92; não há corte, retiming ou mudança de velocidade. A música baixa no trecho do rádio.

## Legendas e limites

`captions.json` contém palavras reais transcritas pelo faster-whisper large-v3 local já instalado, com confiança e timestamps. Blocos de até quatro palavras e 25 caracteres; revelação progressiva impede exibir palavras antes do timestamp estimado. Sincronização baseada em ASR, não certificada fonema a fonema por escuta humana. Legendas não equivalem aos títulos editoriais.

## Validação

`scripts/review-video-007.mjs`: lista composições, verifica hashes de originais e produções anteriores, gera 22 frames de revisão e audita dimensões de textos no Studio a cada 15 frames. `--render` exporta H.264/AAC com proteção contra sobrescrita. Relatórios e prévias em `out/video-007/`.

Não são necessários testes desktop: nenhuma alteração em Electron, studio/ ou shared/. Código novo isolado, com adição de import e registro em Root.tsx. Não foram instaladas dependências.

### Resultado final

- `npm.cmd run lint`: passou (ESLint + TypeScript).
- Studio: 80 amostras sem overflow; 22 frames revisados; nenhum erro de browser.
- Timeline: 20 planos contíguos, máximo de 90 frames por plano; 1192 frames cobertos.
- Preservação: 147 arquivos anteriores e todos os originais desta produção com SHA-256 intacto.
- Smoke: primeiro frame renderizado das nove composições anteriores, incluindo MyComp.
- Export: `out/ClipRushVideo007.mp4`, 21.816.973 bytes, H.264/AAC, 1080×1920, 30 fps, 39,733 s.
- FFmpeg: decodificação integral sem erros e sem intervalos pretos detectados; pico de áudio -0,9 dBFS, média -18,2 dBFS.
- Relatórios: `out/video-007/review-report.json`, `studio-audit.json`, `render-report.json`, `integrity-report.json`.
- RTK foi tentado, mas o executável falhou no Windows; comandos nativos foram usados.
