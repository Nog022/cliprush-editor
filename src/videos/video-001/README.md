# Video 001 — briefing

Status: primeira edição implementada para revisão no Studio. MP4 final não renderizado.

- Objetivo: notícia gamer sobre a edição de GTA VI na EDGE, com foco em retenção e clareza.
- Canais: Shorts, Reels e TikTok; proporção 9:16.
- Formato: 1080×1920, 30 fps, 1317 frames (43,9 segundos).
- ID: `ClipRushVideo001`, registrado independentemente de `MyComp` em `src/Root.tsx`.
- Narração: áudio original do próprio vídeo, volume 1, velocidade 1×. A cópia de fundo é muda. Nenhuma trilha ou efeito sonoro externo foi adicionado.
- Legendas: 103 palavras alinhadas localmente com faster-whisper large-v3 já instalado, timestamps relativos ao original, formato `Caption` oficial. Arrays editáveis em cada `NeonCaptions`, agrupados com vídeo sob a mesma `Sequence` com `trimBefore` compartilhado.
- Revisão humana: conferir reconhecimento e limites das palavras no Studio, especialmente nomes próprios e a retomada “A reportagem”. ASR não substitui revisão auditiva.
- Exportação preparada: MP4/H.264, yuv420p. Preferências definidas somente nesta composição; `remotion.config.ts` e `MyComp` preservados.

## Prévia e estrutura

Abrir `http://localhost:3000/ClipRushVideo001`. Se o Studio estiver fechado, executar `npm.cmd run dev` no PowerShell e usar a URL impressa, selecionando `ClipRushVideo001`.

- `ClipRushVideo001.tsx`: cinco cortes, narração e arrays de legendas editáveis.
- `Scenes.tsx`: gancho, EDGE, Rockstar, reportagem e pergunta final; elementos com nomes na timeline.
- `Visuals.tsx`: câmera, identidade, imagens em movimento e motion graphics.
- `../../components/NeonCaptions.tsx`: legendas com destaque animado por palavra e em palavras-chave, baseadas em `@remotion/captions`.
- Safe area editorial: conteúdo principal entre x=90 e x=920; marca em y=140, legendas em y=1460, progresso em y=1670. PiP em x=650, y=1070, 270×350, afastado da coluna de ações à direita. Conferir a interface do destino na revisão final.
- Imagens com proporção preservada. Câmera horizontal recortada ao redor de Rush, com zoom moderado e migração suave para PiP; fundo desfocado preenche a tela.

## Decupagem

Tempos de origem são medidos no `original.mp4`. Cortes removem pausas sem acelerar a fala nem mudar sua ordem.

| Cena | Início na edição | Intervalo no original | Frames na edição |
| --- | --- | --- | --- |
| Gancho e “não é vazamento” | 0,00 s | 1,40–9,30 s | 0–236 |
| Capa EDGE e 16 páginas | 7,90 s | 11,00–18,30 s | 237–455 |
| Jornalistas na Rockstar | 15,20 s | 20,20–28,10 s | 456–692 |
| Entrevistas, imagens e GamesRadar | 23,10 s | 31,30–39,90 s | 693–950 |
| Mecânicas e pergunta ao público | 31,70 s | 43,20–55,40 s | 951–1316 |

## Assets e alinhamento

Foram usadas somente as três imagens fornecidas em `public/videos/video-001/images/`, o vídeo original e gráficos SVG/CSS criados para esta edição. A fonte é Arial do sistema; nenhum recurso visual ou sonoro foi buscado externamente. As imagens fornecidas mantêm sua autoria e seus direitos originais.

Não havia `roteiro.txt`. Os JSON brutos em `public/videos/video-001/captions/` preservam as transcrições small e large-v3. A versão large-v3 reconheceu EDGE, os jornalistas e o encerramento omitidos ou mal reconhecidos pelo small. O artigo “A” antes de “reportagem” recebeu ajuste de 27,52 s para 31,56–31,72 s, comparando o small e silêncio detectado entre 27,719 e 31,625 s. A alteração está no gerador; transcrições brutas preservadas.

Ferramentas auxiliares, sem instalação automática:

- `python scripts/transcribe-video-001.py --model large-v3 --prefix outra-revisao`: transcreve usando apenas modelo em cache; recusa sobrescrever JSON de palavras.
- `python scripts/prepare-video-001.py`: gerador inicial; recusa sobrescrever a composição já editada. Alterar as legendas atuais diretamente no Studio ou em `ClipRushVideo001.tsx`.
- `node scripts/review-video-001.mjs`: valida metadados e presença de `MyComp`, produz apenas PNGs de revisão em `out/video-001/review/` (pode substituir esses PNGs gerados). Usa Chrome local e as bibliotecas do Remotion já instaladas. Não exporta vídeo.
- `npm.cmd run lint`: ESLint e TypeScript.

## Exportação futura

Somente após aprovação da prévia, conferir que o destino não existe e executar:

```powershell
.\node_modules\.bin\remotion.cmd render src/index.ts ClipRushVideo001 out/video-001/video-001-v001.mp4 --codec=h264 --pixel-format=yuv420p
```

Revisar fala, legendas, enquadramentos e sincronização antes de aprovar. O comando acima foi documentado, não executado.

Mídias: `public/videos/video-001/`. O template original `MyComp` permanece independente desta produção.
