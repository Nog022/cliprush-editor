# ClipRushVideo003

Edição vertical sobre o relacionamento de Jason e Lucia. Planejamento aprovado no chat.

- 1080 × 1920, 30 fps, 1445 frames (48,167 s). Original: 60,117 s.
- Fonte preservada: `public/videos/video-003/gravacao.mp4`. Cinco blocos de fala, quatro junções internas, aparos inicial/final; 11,950 s removidos, sem acelerar a voz.
- `cuts.json` guarda intervalos em frames da fonte e posições na edição. VAD local cruzado com 114 registros de palavras; margem mínima de 160 ms e pausas curtas preservadas. Uma única fronteira de tempo por bloco mantém vídeo, legendas e overlays no relógio original.
- Voz: `public/videos/video-003/audio/voice-cut-v001.wav`, PCM estéreo 48 kHz, concatenação exata de amostras, sem normalização, mudança de velocidade ou filtros de voz. Vídeo mudo impede duplicação da faixa.
- Imagem: cópia de trabalho `public/videos/video-003/footage/presenter-seekable-v001.mp4`, H.264 CRF 18, 1080×1920, 30 fps, GOP de 30 frames, sem áudio. Criada após timeout real de extração do arquivo original de 60 fps. Não é o export final da composição.
- Cinco imagens referenciadas diretamente em WebP: `839863.webp`, `839866.webp`, `839870.webp`, `jasonluchabeach.webp` e `jason-and-lucia-03-260920-5ddffaa4.webp`.
- Guia criativo: `PROMPT_EDICAO_CLIPRUSH.md`.
- Imagens em camadas com fundo desfocado, movimentos contrários, aproximações e entradas breves; textos de impacto, quatro níveis ilustrativos e atividades sincronizadas.
- Legendas em JSON do tipo Caption, geradas automaticamente pelo faster-whisper local. Revisão humana da fala e sincronização ainda recomendada, especialmente a retomada em 30–31 s. Conjunção isolada com confiança de 3% omitida da exibição; JSON original preservado.
- Praia: imagem nova na fala correspondente (21,42–23,64 s da fonte; aproximadamente 17,89–20,11 s da edição), com enquadramento aberto e indicador compacto. Bicicleta e academia continuam com símbolos gráficos. Passeio de carro: nova imagem do conversível em 25,96–27,16 s da fonte (22,43–23,63 s da edição); a imagem antiga do carro continua no contexto Rockstar/Edge. Nenhuma captura da Edge foi fabricada.
- Não foram fornecidos efeitos sonoros, referência WebM ou comprovantes de licença das imagens. Origem e autorização para publicação devem ser registradas pelo responsável pelos assets.
- As afirmações da narração não passaram por checagem factual nesta edição.

Abrir: `npm.cmd run dev`, composição `ClipRushVideo003`.
Revisão dos cortes: `node scripts/review-video-003-cuts.mjs` (imagens e teste de quatro segundos; usa destinos protegidos contra sobrescrita).
Preparação reproduzível: `python scripts/prepare-video-003-cuts.py` (recusa sobrescrever WAV e mapa existentes).
Auditoria: `out/video-003/audio-audit-v001.json` e `out/video-003/review-cuts-v002/`.
O teste WAV renderizado de quatro segundos contém exatamente as mesmas 192.000 amostras por canal da faixa editada (erro máximo zero). Teste MP4 curto H.264/AAC também gerado; MP4 final não exportado.
FFprobe: AAC original estéreo 48 kHz, 2.818 pacotes sem lacunas; diferença de duração áudio/vídeo de aproximadamente 21 ms. FFmpeg decodificou todo o áudio sem erros. Travamento provável no processamento/preview, reforçado por timeout real do extrator de vídeo. Não se atribui falha de codec ao áudio original.
Exportar somente mediante solicitação, verificando antes que o destino não existe:
`node_modules\.bin\remotion.cmd render src/index.ts ClipRushVideo003 out/video-003/video-003-v001.mp4`

Revisar cortes, legibilidade, enquadramentos, pausas mantidas e sincronização das legendas antes da exportação final.

Studio verificado em Chromium local: reprodução automática por 51 segundos, composição completa seguida de reinício em loop. Amostras de avanço: 27–30 frames por segundo; sem congelamento persistente observado. Registro em `studio-playback.json`. Esta medição não é uma escuta humana nem garante desempenho idêntico em outra sessão do navegador.

## Trilha original e atualização de imagens

`public/videos/video-003/audio/cliprush-trilha-original.wav`: instrumental sintetizado localmente com Python/NumPy, sem gravações, samples, serviços ou APIs externas. PCM estéreo 48 kHz, 2.312.000 amostras por canal, 48,166667 s, 110 BPM. Pads, subgrave moderado, kick, snare, hats, arpejo discreto, delay estéreo e acentos nas revelações de níveis, casamento e pergunta final. Resolução curta com fade de saída. É síntese programática; não foi feita escuta crítica de qualidade musical.

Gerador: `scripts/generate-video-003-music.py` (recusa sobrescrever a música). Automação em `music.json`, alinhada às palavras na timeline editada, com antecipação e release para ducking. `MusicBed.tsx` mantém a música contínua e independente da voz. Para trocar arquivo ou volume global, editar `musicSettings.file` / `musicSettings.gain` (atual: 0,72). A narração e `cuts.json` não foram alterados.

Medição da mixagem completa: pico −3,15 dBFS, zero amostras clipadas, voz RMS durante fala −28,23 dBFS e trilha −37,98 dBFS. Fades incorporados ao WAV. `out/video-003/music-review/final-mix-metrics.json` guarda a medição final com ganho global.

Validação desta atualização: TypeScript/ESLint; imagens de revisão; teste audiovisual de cinco segundos em `out/video-003/music-review/render-v001/`; WAV renderizado com correlação >0,9999999 com a mistura esperada, erro máximo inferior a 1 LSB e zero clipping. Studio monitorado por 12 segundos com avanço de 30 frames por segundo, incluindo a primeira junção. A reprodução monitorada e as medições não substituem avaliação auditiva humana. MP4 final não exportado.

Revisão reproduzível: `node scripts/review-video-003-music.mjs` (protege destinos existentes; escolha nova versão para repetir).
