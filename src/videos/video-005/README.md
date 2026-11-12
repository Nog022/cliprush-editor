# ClipRush 005 — Por que Lucia foi presa?

Short de investigação para o público de GTA 6, construído ao redor da narração original do ElevenLabs: pergunta, pistas do passado, sussurro decisivo e resposta antes do CTA.

- Composição: `ClipRushVideo005`.
- Prévia local: http://localhost:3000/ClipRushVideo005 (`npm.cmd run dev` na raiz).
- Formato: 1080 × 1920, 30 fps, 1171 frames, **39,033333 s**.
- Áudio original: `public/videos/video-005/audio/narracao.mp3`, **39,000813 s** medidos com FFprobe. Duração calculada com `Math.ceil(duração * 30)`.
- Exportação: `out/video-005/video-005-v001.mp4`, H.264/YUV420p, CRF 18, AAC 192 kb/s.

## Direção e montagem

| Frames, fim exclusivo | Tempo | Cena e intenção |
| --- | --- | --- |
| 0–72 | 0–2,40 s | Lucia presa; zoom, impacto e tipografia em “PRISÃO”. |
| 72–284 | 2,40–9,47 s | Janela da prisão; câmera desacelera, luz e trilha recuam no sussurro. |
| 284–504 | 9,47–16,80 s | Fotografia, pista sobre o pai e mapa narrativo Liberty City → Leonida. |
| 504–648 | 16,80–21,60 s | Tom sério; sonho da mãe e decisão de mudar o destino. |
| 648–771 | 21,60–25,70 s | Sussurro decisivo, aproximação lenta, texto progressivo e quase silêncio. |
| 771–858 | 25,70–28,60 s | Painel editorial identifica a Rockstar como fonte. |
| 858–1050 | 28,60–35,00 s | “LUTOU” em 30,35 s; “FAMÍLIA” somente em **32,20 s / frame 966**. A imagem ganha luz. |
| 1050–1171 | 35,00–39,03 s | Vice City, identidade ClipRush e CTA completo. |

O movimento usa frames, `interpolate`, `spring` e partículas com sementes fixas. Fotografias em camadas, deslocamentos e perspectiva criam profundidade. A narração usa um único componente de áudio, sem cortes, aceleração, compressão de dinâmica ou remoção de pausas; apenas ganho fixo de 0,9 na mixagem.

## Voz, legendas e som

Transcrição local com Faster Whisper large-v3 já disponível no computador. O alinhamento bruto está preservado em `alignment.json`; `captions.json` contém 108 palavras preparadas, com ajuste baseado na forma de onda e bordas de silêncio. Uma duplicação do reconhecimento em “o motivo” foi descartada das legendas, sem tocar no áudio.

As legendas exibem apenas palavras já iniciadas. Nos sussurros, acumulam a frase com entrada suave; nas demais falas, usam grupos curtos e destaque da palavra atual. A tipografia principal apresenta “LUTOU” e “FAMÍLIA”, evitando duplicação nesses instantes.

Pausas de suspense preservadas: 7,239–7,614 s, 23,869–24,305 s e 30,588–30,924 s. Os dois sussurros têm aproximadamente 10 dB menos energia vocal que os trechos normais; essa interpretação permanece na edição.

Trilha e efeitos foram sintetizados localmente para esta produção, sem música externa. A trilha usa pulsação discreta a 72 BPM, automação por frase e ducking a partir do RMS da voz. Os sussurros recebem trilha aproximadamente 22–32 dB abaixo da voz. A versão usada é `lucia-investigation-score-v002.wav`; a primeira versão permanece preservada. Efeitos: `lucia-investigation-sfx-v001.wav`.

Metadados: `audio-probe.json`, `audio-features.json`, `timing.json` e `sound-design.json`. A forma de onda e os relatórios completos ficam em `out/video-005/`.

## Assets e fonte

Todos os seis arquivos fornecidos em `public/videos/video-005/imagens/` são usados, preservando nomes e conteúdo:

- `lucia_algemada.jpg`: gancho, fotografia de investigação e pré-revelação.
- `outra cena da lucia na cadeia__olhando para a camera com um sol atras.webp`: primeiro trailer e sussurro.
- `cena do mar do jogo.jpg`: fundo da investigação.
- `lucia encima de uma moto.jpg`: destino e resolução mais luminosa.
- `cena_tensa_de_lucia.jpg`: escolha e consulta à fonte.
- `cena da cidade vicity.jpg`: encerramento.

O mascote Rush e filmagens adicionais não foram encontrados. Não foram inventados retratos de familiares ou imagens do confronto. O mapa SVG é ilustrativo, identificado como **“Mapa narrativo • sem escala”**; não pretende reproduzir a geografia oficial. O painel da Rockstar é uma composição editorial identificada, e não uma captura de documento oficial.

Referência factual: [biografia oficial de Lucia Caminos, Rockstar Games](https://www.rockstargames.com/VI/only-in-leonida/lucia), consultada em 4/11/2026. A biografia relaciona a prisão à luta pela família e menciona o pai, a mãe e Liberty City; a edição não acrescenta detalhes do confronto. Imagens e voz foram fornecidas no projeto; não foi inferida uma licença adicional para esses originais.

## Revisão e reprodução

- `npm.cmd run lint` passou, incluindo TypeScript.
- Revisão visual de 40 quadros da primeira montagem; revisão adicional da entrada de “LUTOU”.
- Studio: 110 posições na primeira revisão e 82 posições após o ajuste. Sem estouro de largura nos textos auditados; revelação bloqueada antes do frame 966.
- 67 arquivos originais e fontes anteriores conferidos por SHA-256. `MyComp` e registros anteriores foram preservados.
- A revisão automatizada aguarda o carregamento das imagens após saltos na timeline; o render aguarda os assets pelo Remotion.
- MP4 exportado e decodificado integralmente: **22.437.502 bytes**, 1171 frames, H.264 + AAC, 1080 × 1920 a 30 fps. Nenhum erro de navegador no render.
- Nenhum intervalo preto acidental ou congelamento superior a um segundo detectado. Quadros do próprio MP4 conferidos na abertura, investigação, sussurro, revelação e encerramento.
- Mixagem final medida: **−16,0 LUFS**, pico verdadeiro **−1,3 dBFS**, faixa de loudness **11,5 LU**. Sem clipping; a diferença de intensidade dos sussurros foi preservada.
- Comparação da voz com o MP4: deslocamento medido de **0 ms**, correlação **0,9935** no áudio completo e **0,9928** nos quatro segundos finais, confirmando continuidade temporal e preservação do encerramento.

Scripts locais, usando dependências já instaladas:

```powershell
npm.cmd run dev
npm.cmd run lint
node scripts/review-video-005.mjs review-v004 --frames=0,360,700,975,1170
```

O script de render `node scripts/review-video-005.mjs render-v001 --render` recusa sobrescrever o MP4. Para uma nova exportação, escolher um novo nome versionado antes de executar. Os bundles e quadros de revisão também ficam em `out/`, que não substitui o armazenamento dos originais.

`scripts/verify-video-005.py` valida o MP4 real: metadados, decodificação integral, detecção de telas pretas e congelamentos, loudness, correlação da voz e integridade dos quatro segundos finais. Resultado e quadros decodificados: `out/video-005/verify-v001/`.
