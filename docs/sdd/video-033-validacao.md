# Validação — vídeo 033

- Entrega: `deliveries/video-033-final-20261119-v1.mp4`, 9.794.582 bytes.
- 1080×1920, 30 fps, 366 frames, vídeo de 12,200 s; contêiner 12,203 s; H.264 CRF18, AAC.
- Narração original integral; uma transcrição local com modelo em cache. Correção ortográfica de “salva-vidas”, sem alteração do áudio.
- Quatro blocos com progressão contínua da fonte: passeio, aproximação, acessórios e desfecho. Sem repetição de trecho para preencher tempo.
- Previews 65, 180, 237, 275 e 337 inspecionados; acessórios e legendas legíveis. CTA seguir verificado também no próprio MP4 em 11,25 s (`out/video-033/final-cta.jpg`).
- `npx.cmd eslint src/videos/video-033/ClipRush033.tsx src/Root.tsx` e `npx.cmd tsc --noEmit`: passaram.
- Render completo executado uma única vez por `npm.cmd run render -- ClipRush033 final-20261119-v1`.
- `completeProduction` validou metadados, decodificação integral de vídeo/áudio e checks src/desktop. Retenção não executada: aprovação inicial ainda ausente; nenhuma exclusão solicitada ou presumida.
- Áudio da entrega comparado à narração: correlação 0,999975 integral e 0,999970 no encerramento, pico -0,961 dBFS, sem clipping. Evidência em `out/video-033/audio-check.json`.
- SHA-256: `91a8aa56bc8652ebe6e633f4d0e3e35eefebaaa842efa11b0759f965c356cc8a`.
- Studio existente aberto pelo comando de desenvolvimento. Automação da interface indisponível por falha de conexão nativa; revisão visual realizada nos frames renderizados e no MP4.
- Alterações anteriores do usuário preservadas. Mudanças limitadas à nova produção, seus scripts/documentos e registro mínimo no Root; sem downloads ou reindexação.
