# ClipRush Video 004 — GTA 6: 212 GB?!

Composição `ClipRushVideo004`. Notícia gamer em português brasileiro para Shorts,
Reels e TikTok. Edição independente das produções anteriores, baseada na narração
e nas cinco imagens fornecidas pelo usuário.

## Prévia

Na raiz do projeto, no PowerShell:

```powershell
npm.cmd run dev
```

Abrir **http://localhost:3000/ClipRushVideo004**. Se a CLI escolher outra porta,
usar a porta impressa no terminal. `npm.cmd` evita a restrição de execução de
scripts `.ps1` desse computador.

## Formato e duração

- 1080 × 1920, vertical 9:16, 30 fps.
- Original: `public/videos/video-004/audio/narracao.mp3`.
- FFprobe: MP3, mono, 44.100 Hz, 128 kb/s, **39,967313 segundos**.
- Timeline: `ceil(39.967313 × 30) = 1200` frames, exibidos no Studio como 40,00 s.
  São apenas 32,687 ms de arredondamento para o próximo frame.
- Uma única instância da narração, volume 0,92, sem corte, aceleração ou repetição.
- O cenário final congela nos últimos seis frames; a voz e as legendas continuam.

## Roteiro e storyboard

Foi preservado o roteiro integral fornecido no briefing: gancho com 212 GB;
confirmação da Rockstar; antecipação do pré-download; compra digital;
horários PS5 e Xbox; ressalva sobre o limite; pergunta sobre liberar espaço.

| Cena | Frames / tempo | Construção e evolução visual |
| --- | --- | --- |
| Impacto | 0–164 / 0–5,50 s | Arte vertical de Lucia e Jason, aproximação rápida, deslocamento de câmera, “MANO!”, 212 GB com spring e profundidade tipográfica, tremor amortecido, partículas e ondas de choque. Número entra em 2,54 s. |
| Fonte | 165–284 / 5,50–9,50 s | Painel editorial ClipRush entrando em perspectiva; “não é rumor”; revelação por máscara da informação; carimbo em 8,52 s. Não simula captura oficial. |
| Calendário | 285–467 / 9,50–15,60 s | Rua ao pôr do sol em plano de fundo, câmera lateral, calendário com folhas e argolas; página vira de 12 para 10 na palavra “antecipado”, em 13,06 s. |
| Download | 468–614 / 15,60–20,50 s | Capa em plano inclinado, progresso linear e circular, confirmação e lançamento 19/11. Interface e velocidade identificadas como ilustrativas. |
| PS5 / Xbox | 615–878 / 20,50–29,30 s | Dois ambientes conectados por um cenário de 2200 px; molduras em profundidade, chão em perspectiva e modelos SVG dos consoles. Travessia começa em “Xbox”, 25,14 s; iluminação azul muda para verde. Relógios chegam a 00h e 21h. |
| Limite | 879–1055 / 29,30–35,20 s | SSD em perspectiva, preenchimento segmentado que muda de ciano para amarelo, “ATÉ 212 GB” e redução do indicador para explicar variação por dispositivo. |
| Pergunta | 1056–1199 / 35,20–40,00 s | Segunda arte dos personagens, fotografia dos consoles, barra quase cheia e cartões de gêneros fictícios que reagem. Pergunta para comentários e pausa visual curta. |

Transições: varredura lateral, máscara circular, passagem diagonal, mudança
de perspectiva entre salas e breve interferência de linhas no alerta. Sem
animação CSS, temporizadores ou aleatoriedade não determinística na composição.

## Inventário e enquadramento

Originais em `public/videos/video-004/imagens/`, preservados. Inventário técnico
em `assets-inventory.json`; nenhuma conversão foi necessária: os cinco JFIF são
JPEGs decodificados diretamente pelo Chrome.

| Arquivo | Resolução / proporção | Uso |
| --- | --- | --- |
| `lucia e jason.jfif` | 1200 × 1680 / 5:7 | Abertura; arte como plano íntegro, com enquadramento vertical e movimento. |
| `ruas do gta.jfif` | 900 × 900 / 1:1 | Ambiente do calendário; preenchimento preservando proporção e contraste sobreposto. |
| `capa do jogo.jfif` | 1178 × 1178 / 1:1 | Download; quadrado completo com `contain`, sem cortar a capa. |
| `lucia e jason em outra posição.jfif` | 1200 × 1200 / 1:1 | Encerramento; plano amplo com iluminação escurecida para a pergunta. |
| `consoles.jfif` | 1080 × 1080 / 1:1 | Encerramento; foto completa em painel claro inclinado. |

Não há recorte automático de personagens. Arte, tipografia, luz e efeitos
ocupam planos independentes. As imagens vieram do usuário; sua origem e licença
não foram fornecidas. Não são apresentadas como capturas verificadas da notícia.
Nenhum asset do Rush ou captura do comunicado foi encontrado.

## Sincronização e legendas

- `scripts/analyze-video-004.py`: transcrição em CPU usando Faster Whisper
  large-v3 já presente no cache local; nenhum modelo ou pacote foi instalado.
- `alignment.json`: saída bruta com timestamps e probabilidades.
- `alignment-v002.json`: comparação adicional usando VAD de pausas mais curtas.
- `captions.json`: 106 unidades de palavras, no tipo `Caption` do
  `@remotion/captions`, com correções tipográficas e junção das palavras hifenizadas.
- FFmpeg `silencedetect` mediu as pausas reais; os inícios de frases que o Whisper
  havia anexado à pausa foram refinados em `scripts/refine-video-004-captions.py`.
- Legendas em grupos curtos, palavra atual amarela, entrada por spring. Faixa
  dedicada em y=1470, largura 830, sem encobrir os calendários, números e relógios.
- As legendas pertencem à mesma sequência da única fonte de narração; mover esse
  grupo move voz e legendas juntas.

## Som original

Dois arquivos reais foram sintetizados localmente com NumPy/SciPy, sem samples,
serviços de geração ou downloads:

- `audio/cliprush-004-original-score-v001.wav`: instrumental estéreo, 44,1 kHz,
  16 bits, 108 BPM; arpejos, pads, baixo e percussão sintetizados. A intensidade
  muda no calendário, na comparação e no encerramento. O envelope RMS da voz
  controla o ducking gravado no próprio arquivo.
- `audio/cliprush-004-original-sfx-v001.wav`: 23 eventos de impactos graves,
  varreduras, virada de página, confirmações, cliques, ticks e alertas.

Gerador: `scripts/prepare-video-004.py`; parâmetros e eventos em
`sound-design.json`. O gerador recusa sobrescrever os WAV existentes. Não é
necessário executar os scripts para abrir o Studio.

Mistura avaliada com FFmpeg/EBU R128 usando os volumes reais da composição,
sem salvar um vídeo: **−20,6 LUFS integrados, pico verdadeiro −4,7 dBFS em estéreo**.
Também foi medida a soma em mono: pico −1,7 dBFS. Não houve clipping nessas
medições. Relatório: `out/video-004/audio-review.txt`.

## Fontes da notícia

Consultadas em 04/11/2026:

- [FAQ oficial de pré-download](https://support.rockstargames.com/articles/7nPqOA2uCbpEQHXx7KVrYd/grand-theft-auto-vi-pre-load-faq): até 212 GB conforme o dispositivo; PS5 em 10/11 à meia-noite local; Xbox em 10/11 às 00h GMT.
- [Newswire de 03/11/2026](https://www.rockstargames.com/br/newswire/article/k4ak9okk485712/grand-theft-auto-vi-pre-load-begins-on-november-10): nova data e lançamento em 19/11. A leitura direta da página apresentou erro; o conteúdo foi localizado no índice de busca da própria Rockstar, inclusive na URL oficial `/es/` do mesmo artigo.
- [FAQ de plataformas e edições anterior](https://support.rockstargames.com/articles/4QfG4FmZCf5W1gS8jy4UVT/grand-theft-auto-vi-platform-editions-and-versions-Platforms): resultado indexado anterior ainda informava 12/11 para o pré-download digital. A data atual segue o FAQ específico de 03/11.

09/11 às 21h em Brasília é a conversão de 10/11 às 00h GMT para UTC−3.
O vídeo diferencia baixar previamente de poder jogar e evita afirmar que
212 GB será o tamanho instalado final em todos os dispositivos.

## Verificação e limites

- `npm.cmd run lint`: ESLint + TypeScript aprovados.
- Composição registrada e metadados conferidos pelo renderer local.
- 47 stills de cenas, entradas, saídas e transições, incluindo frames 0 e 1199.
- Prévia real aberta no Chrome; 96 posições da timeline percorridas, com todas
  as imagens carregadas e sem estouro de largura em títulos e legendas.
- Reprodução contínua por 45 segundos, avançando pelas sete cenas e completando
  uma volta da timeline; sem erros de console capturados.
- Os quadros representativos foram inspecionados visualmente. Não apareceram
  telas pretas acidentais nesses quadros. A faixa de cenas cobre os 1200 frames
  sem lacunas. O zoom explosivo do número e as bordas nas transições podem
  atravessar o limite do quadro intencionalmente.
- `git diff` confirma somente a adição do registro em `Root.tsx` nos arquivos
  já rastreados; vídeos anteriores, `MyComp`, pacotes e configuração preservados.

Relatórios e imagens em `out/video-004/review-v002/` e
`out/video-004/review-v003/`; o ajuste final de espaçamento do aviso foi revisto
separadamente em `out/video-004/review-v004/` e `review-v005/`. Apenas documentação e stills,
**nenhum MP4**.

A transcrição automática tem precisão limitada por palavra, mesmo com ajustes
pelas pausas. O mix foi medido tecnicamente; o balanço artístico deve ser avaliado
com fones na prévia. Há cenários 2.5D e modelos vetoriais, sem reconstrução 3D
fotorrealista, personagem recortado ou mascote ausente. As fontes são locais
(`Impact`, `Arial Black`, `Arial`), disponíveis no ambiente de revisão.

Próximos refinamentos possíveis após assistir à prévia: ajustar o balanço musical
ao gosto do canal, revisar fonemas mais finos e integrar poses originais do Rush
caso sejam fornecidas.

## Exportação futura — somente após aprovação

Não foi executada. Verificar se o nome está livre antes de exportar:

```powershell
if (Test-Path -LiteralPath 'out/video-004/video-004-v001.mp4') {
  throw 'O arquivo já existe. Escolha a próxima versão.'
}
.\node_modules\.bin\remotion.cmd render src/index.ts ClipRushVideo004 out/video-004/video-004-v001.mp4 --codec=h264 --pixel-format=yuv420p
```
