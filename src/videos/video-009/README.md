# Video 009 — O tempo nos três mundos

Composição: `ClipRushVideo009`. Vertical 1080×1920, 30 fps, 1286 frames (42,8667 s). Narração original: **42,840813 s**; arredondamento de menos de um frame para preservar todo o áudio. Nenhum corte, alteração de velocidade ou geração de voz.

Objetivo: explicar com clareza a diferença de ritmo de GTA V, RDR2 e GTA VI para o público de Shorts do ClipRush. Identidade preservada: fundo escuro, ciano, rosa/lilás, amarelo nos destaques, títulos condensados e marca ClipRush. Não há asset do mascote Rush na pasta fornecida.

## Roteiro e montagem

| Tempo | Fala / função | Tratamento |
| --- | --- | --- |
| 0–5,50 | O GTA 6 vai fazer o tempo passar mais devagar? | Três trailers simultâneos, relógio acelerado, pergunta |
| 5,50–10,13 | GTA V: um dia em 48 minutos reais | Trailer, três paisagens com câmera animada, relógio e faixa dia/noite |
| 10,13–13,67 | RDR2 também, mas existe um truque | Trailer, duas paisagens, ≈48 min como média |
| 13,67–16,07 | À noite o relógio acelera | Fogueira, trailer noturno, ponteiros e ticks acelerados |
| 16,07–18,40 | Durante o dia passa mais devagar | Floresta diurna, relógio lento |
| 18,40–20,57 | Agora olha o GTA VI | Praia em movimento, entrada rosa |
| 20,57–25,53 | Rockstar testou o mesmo ritmo e achou rápido | GTA V / VI em split-screen e velocímetro ilustrativo |
| 25,53–30,67 | Pôr do sol e noites mais longos | Trailer de GTA VI: pôr do sol e bar noturno |
| 30,67–31,70 | Mas quanto? | Escurecimento, relógio sem número, corte musical |
| 31,70–35,73 | Fãs calcularam até 2h24 | Revelação em 33,02s, barras proporcionais 48/144, aviso persistente |
| 35,73–38,03 | Isso ainda não foi confirmado | Ressalva grande e legível |
| 38,03–42,87 | Lento ou rápido? Segue o ClipRush | Split-screen e CTA |

Relógios e faixas são **ilustrações**, não medição extraída dos trailers. Trechos rápidos e montagem dia/noite representam passagem do tempo; não alegam mostrar um timelapse contínuo real dos jogos. Os trailers não fornecem um ciclo completo filmado do mesmo local. A animação do gráfico é proporcional a 48 e 144 minutos, sob hipótese, e não a uma duração confirmada de GTA VI.

## Mídias e origem

Todos os 11 arquivos fornecidos foram usados: MP3 integral, três vídeos e sete imagens. `inventory.json` registra metadados e SHA-256 dos originais. Não houve download de mídia, substituição ou modificação de originais. Os arquivos foram fornecidos pelo usuário; os trailers/imagens são de jogos Rockstar, sem documentação de licença anexada. Não foi presumida transferência de direitos. O som de fundo e os efeitos são síntese original determinística, sem samples externos.

`scripts/analyze-video-009.py` cria inventário, pranchas de inspeção dos trailers com timestamps reais e transcrição local usando o modelo já instalado. `scripts/prepare-video-009.py` prepara legendas no formato Caption e áudio original. `transcript.raw.json` preserva o resultado do reconhecimento; `captions.json` contém as legendas usadas. Timings por palavra são estimativas do ASR.

As cenas têm nós JSX próprios, nomes e durações explícitas. Os componentes e dados estão confinados a esta produção. A única alteração compartilhada é a adição de um import e registro em `src/Root.tsx`.

## Rigor editorial — consulta em 07/11/2026

- **GTA V: 48 minutos; RDR2: aproximadamente 48 minutos em média**, com velocidade variável. O [teste documentado pela PowerPyx](https://www.powerpyx.com/how-long-is-1-day-in-red-dead-redemption-2/) distingue dia e noite. O vídeo mantém essa ressalva junto do número.
- **GTA VI: ciclo mais longo**, conforme a [entrevista da Edge publicada no GamesRadar](https://www.gamesradar.com/edge/gtavi-cover/). A entrevista é a fonte para o teste de ritmo mencionado pela voz; não fixa 144 minutos.
- **2h24 / 144 minutos é estimativa de fãs**, associada a extrapolação de footage de desenvolvimento e [discussão pública](https://www.reddit.com/r/GTA6/comments/1vvb9bm/1_ingame_day_now_144_minutes_instead_of_48/). Não é apresentado como confirmação da Rockstar. A imagem exibe aviso simultâneo ao número e depois dedica uma cena à ressalva.

## Revisão

Conferir legibilidade em escala de celular, cortes, carregamento de mídia, sincronização e final integral da narração. Executar TypeScript e lint. Revisar no Studio e salvar frames de inspeção em `out/video-009/`. Exportar MP4 somente mediante pedido explícito, sempre com nome versionado livre.

Skills usadas: remotion-best-practices, remotion-create, remotion-markup, remotion-captions e remotion-render apenas para imagens de revisão. As skills locais `cliprush-producao-vertical` e `cliprush-indice-de-cenas` mencionadas no AGENTS não foram encontradas no projeto nem no diretório Codex; o procedimento foi realizado com as skills oficiais instaladas e o fluxo `skills/producao.md`.

## Validacao concluida

- ESLint e TypeScript aprovados, sem avisos.
- 14 frames revisados em `out/video-009/review-v002/`.
- Studio: 117 posicoes inspecionadas, incluindo todos os cortes; sem overflow de texto ou erros de midia reportados. Reproducao percorreu a duracao inteira e reiniciou.
- Mixagem: pico -1,1 dB, media -18,4 dB.
- Integridade: 103 arquivos anteriores/registro e todos os 11 originais conferidos por hash.
- Nenhum MP4 exportado. Preview: http://localhost:3000/ClipRushVideo009

## Revisao de fluidez

A tag superior direita foi removida. A previa usa 16 copias curtas H.264 de 720p/30 fps, com keyframes a cada 0,5 segundo, em `public/videos/video-009/preview-v001/`. Os cortes conservam os mesmos pontos de entrada e velocidades; a renderizacao continua utilizando os trailers originais. As proximas cenas sao carregadas antecipadamente. O Studio usa uma unica mixagem PCM sem perdas (mesmos ganhos), evitando tres decodificadores de audio simultaneos. Os arquivos de audio originais continuam sendo usados na renderizacao.

Geracao reproduzivel: `python scripts/optimize-video-009.py`. As copias sao assets tecnicos da previa, nao uma exportacao do video final.

Validacao da revisao: ESLint/TypeScript sem avisos; 16 proxies decodificados integralmente sem erros; reproducao completa comparada em 411 amostras por versao. Amostras de frame parado cairam de 4 para 1, sem erros de navegador. Uma pausa breve ainda foi observada: a medicao automatica nao garante ausencia de engasgos em qualquer computador. Dois frames finais revisados em out/video-009/review-v003. Os 11 originais e 103 arquivos anteriores/registro permanecem integros.
