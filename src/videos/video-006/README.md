# ClipRushVideo006 — GTA 5 × GTA 6

Produção vertical de comparação visual, com voz original integral. 1080 × 1920,
30 fps, 1.305 frames (43,500 s). Áudio original: 43,467750 s; a diferença de
32 ms é somente o arredondamento ao frame seguinte. Público: Shorts/Reels/TikTok.

## Mídias e diagnóstico

Inventário completo, metadados FFprobe e SHA-256: `inventory.json`.

| Original | Dimensões / duração | Uso |
|---|---|---|
| audio/narracao.mp3 | 43,467750 s | Integral; sem regravação, corte ou mudança de velocidade |
| imagens/praia_gta5.jfif | 1280 × 720 | Vespucci, pedestres, abertura |
| imagens/praia_gta6.jfif | 3840 × 2160 | Praia e multidão, abertura e comparação |
| imagens/transito_gta5.jfif | 1920 × 1080 | Los Santos e comparação noturna |
| imagens/transito_gta6.jfif | 2558 × 1322 | Vice City e comparação noturna |
| imagens/npcs_gta5.jfif | 768 × 683 | Personagens e base da revelação |
| imagens/npcs_gta6.jfif | 780 × 438 | Vida social dentro de telefone ilustrativo |
| imagens/logo do rockstar.jpg | 1242 × 1143 | Inventariado, não usado como vinheta |
| videos-complementares/Trailer 2 GTA VI.mp4 | 166,788934 s; 1920 × 1080; 30 fps; H.264/AAC | Nove seleções silenciosas |

O trailer apresentou avisos H.264 em buscas isoladas. As cópias de trabalho
foram geradas decodificando desde o início, H.264 CRF 18, GOP 30, sem áudio.
`cropdetect` mediu barras embutidas: crop 1920:864:0:108. Só essas barras
foram retiradas na preparação; reenquadramentos editoriais são feitos no Remotion.
Nenhum original foi sobrescrito. Imagens menores limitam a nitidez dos NPCs.

## Storyboard implementado

`edit.ts` é a fonte tipada dos 22 planos: início/fim em frames, mídias,
jogo, offset da cópia, enquadramento, movimento, transição e objetivo narrativo.
`captions.json` associa os textos e tempos da fala à timeline original.

| Tempo final | Montagem |
|---|---|
| 0–4,03 s | Praia GTA 5 × GTA 6; aproximação da multidão; pergunta visual |
| 4,03–6,60 s | Cidade em movimento; promessa sem mostrar os números |
| 6,60–11,33 s | Ruas em split, Los Santos, corte para trânsito de Vice City |
| 11,33–18,13 s | Academia na praia, Vespucci, multidão de GTA 6 e split |
| 18,13–23,00 s | Carros/luzes nos dois jogos; rua em movimento no trailer |
| 23,00–28,57 s | Telefone editorial com imagens sociais; aviso ilustrativo permanente |
| 28,57–31,90 s | Gesto/expressão em plano mais longo; redução da trilha |
| 31,90–36,43 s | NPCs de GTA 5; ≈55 mil somente após a fala do número |
| 36,43–38,17 s | Pessoas no bar de GTA 6; preparação da resposta |
| 38,17–39,70 s | Split GTA 5 × GTA 6, ≈55 mil × ≈600 mil, fonte na tela |
| 39,70–43,50 s | Continuidade do bar, plano aberto na água e pergunta/CTA reais |

## Seleções do trailer

Todos os tempos abaixo referem-se ao arquivo original, não ao export final.
`selects.json` conserva os intervalos e a correspondência com as cópias.

| Cópia | Intervalo original | Por quê |
|---|---|---|
| traffic.mp4 | 34,00–37,80 s | Câmera no carro, fluxo urbano e prédios |
| beach-gym.mp4 | 38,00–42,00 s | Pessoas em atividade, movimento natural na praia |
| street.mp4 | 45,30–48,80 s | Rua, carros e luzes durante a comparação noturna |
| bar.mp4 | 90,00–95,60 s | Pessoas com movimentos distintos, reservadas ao clímax |
| promenade.mp4 | 125,40–128,00 s | Vida urbana para a montagem social ilustrativa |
| club.mp4 | 128,10–130,50 s | Vida noturna no telefone editorial |
| water.mp4 | 139,30–142,10 s | Encerramento aberto, com movimento e skyline |
| city.mp4 | 153,00–155,80 s | Cidade vista de cima durante a promessa inicial |
| gesture.mp4 | 12,40–15,90 s | Gesto e expressão como preparação visual das animações |

Os planos usam apenas parte dessas reservas. O trecho de academia continua
de 1,84 s na segunda aparição; o bar avança em três seleções sucessivas.
Não se apresenta protagonista como prova de comportamento autônomo de NPCs.

## Legendas, som e decisões editoriais

- ASR local: faster-whisper large-v3 em cache, CPU int8; nenhuma instalação.
  `alignment.json` mantém a saída original. Blocos por frase em formato Caption,
  sem karaoke. Ajuste de 240 ms no deslocamento observado e âncoras nas pausas
  medidas por FFmpeg; revisão humana fina da dicção continua recomendada.
- Voz integral, ganho 0,88 para margem no mix. Trilha sintetizada originalmente
  no projeto video-003, copiada para esta produção, com fades, ducking por fala
  e queda antes da revelação. Seis SFX discretos sintetizados localmente, sem samples.
- Não há asset identificado do Rush; nenhum personagem substituto foi criado.
- O material fornecido não inclui a sequência de redes sociais do Trailer 1.
  O telefone é explicitamente rotulado como montagem ilustrativa, sem simular
  uma interface oficial ou inventar captura de gameplay.
- Os números são atribuídos na tela à cobertura PC Gamer/NYT de agosto de 2026.
  Consulta em 05/11/2026: [PC Gamer](https://www.pcgamer.com/games/grand-theft-auto/thanks-to-a-dedicated-team-art-directing-every-single-npc-gta-6-has-over-10-times-as-many-unique-animations-as-gta-5/).
  A página original do NYT vinculada pela reportagem não abriu nesta sessão.
  Não foi feita contagem independente nem se infere que animações equivalem
  a NPCs únicos, comportamentos garantidos ou interações disponíveis ao jogador.

## Preview, integração e export

`npm.cmd run dev` → http://localhost:3000/ClipRushVideo006

O registro explícito em `src/Root.tsx` é coletado automaticamente pela biblioteca
desktop existente. O build local inclui nove composições. O novo vídeo aparece
em Meus projetos → ClipRushVideo006, com Player e busca por frame. Nenhum
projeto antigo foi convertido para clipes ou alterado. A edição avançada é no
Remotion/código tipado; o desktop Fase 1 não recebe uma timeline multifaixas fictícia.
O EXE empacotado anteriormente não foi reempacotado por esta produção.

Render seguro: `node scripts/review-video-006.mjs --render`.
Destino solicitado: `out/ClipRushVideo006.mp4`; o script recusa sobrescrita.
Para nova versão, alterar o destino para um nome livre antes de executar.

## Arquivos e evidências

- Composição/componentes isolados: `ClipRushVideo006.tsx`.
- Plano tipado: `edit.ts`; inventário: `inventory.json`; recortes: `selects.json`.
- Voz/legendas: `alignment.json`, `captions.json`, `audio-plan.json`.
- Scripts próprios em `scripts/*video-006*`; teste `tests/desktop/video-006.e2e.ts`.
- Contatos de todas as imagens e 60 posições do trailer: `out/video-006/`.
- Revisão renderizada: 25 frames em `out/video-006/review-v001/`.
- Studio: 105 posições, verificação de texto/cenas e revelação; relatório e captura
  em `out/video-006/review-v001/`. Cenas de premount ocultas são excluídas da auditoria.
- Preservação: hashes de 119 arquivos anteriores e nove originais desta produção.
- Lint/TypeScript Remotion sem avisos; cinco testes desktop de domínio passaram.
- Teste Electron do catálogo/preview com perfil exclusivo em `out/video-006/`.
- O typecheck desktop revelou inconsistências em `desktop/preload.ts` e
  `desktop/store.ts` frente aos contratos de `shared/model.ts`. Arquivos fora desta
  produção foram preservados; consultar o resultado mais recente dos testes.
- Validação do MP4 final: `out/video-006/final-validation.json` após renderização.

Resultado final executado: MP4 de 29.878.214 bytes, H.264/AAC, 1.305 frames,
43,500 s. Decodificação integral sem falhas, nenhum intervalo preto ou congelado
detectado (limiares no script de verificação). Pico do mix −1,5 dB; correlação
da voz com o original, sem deslocamento: 0,9875. Treze frames extraídos do MP4
foram revisados visualmente, incluindo o último frame. Validação sonora técnica;
não se declara uma sessão de escuta humana. A última checagem desktop confirmou
somente os dois erros externos citados, sem erros do teste novo ou da composição.
