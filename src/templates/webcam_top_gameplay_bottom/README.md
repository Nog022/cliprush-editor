# webcam_top_gameplay_bottom

Template Remotion registrado como `WebcamTopGameplayBottom` no Studio. Fonte e coordenadas são props; o componente não executa detecção. Reutilize as regiões do detector atual, convertendo coordenadas normalizadas para pixels da fonte.

`webcamHeightRatio` define a proporção superior (preset: 0.4). `webcamFocus` é um centro de rosto opcional em pixels: use a mediana dos resultados em cache para enquadramento estável. O crop é proporcional, limitado à região selecionada. O gameplay recusa interseção com a webcam original. O áudio é reproduzido uma única vez, sem alteração de velocidade ou volume.

Preset deste teste: fonte original `videos/biblioteca/alanzoka/rdr2-alan.mp4`, 875–910 segundos, 1920×1080; webcam `{x:1473,y:9,w:435,h:252}`, foco `{x:1649.25,y:151.5}`, gameplay `{x:0,y:160,w:1465,h:920}`.

Para outro vídeo, forneça um JSON com essas props e `src`, `sourceSize`, `startSeconds`, `durationSeconds`, `webcamRegion`, `gameplayRegion`, `webcamHeightRatio`. `src` é relativo a public/ ou URL HTTP. O preset exporta 1080×1920/60 FPS.

```powershell
node scripts/render-template.mjs stills out/meu-template props.json
# Inspecione os PNGs antes de exportar.
node scripts/render-template.mjs render out/meu-template props.json
```

O runner usa o servidor, renderer e validação de conclusão existentes; não instala dependências nem copia a biblioteca. A saída `preview.mp4` recusa sobrescrita e passa por decodificação integral. Usa `validationOnly` para não disparar retenção de produções numeradas. Use uma pasta nova para cada exportação.

Para limitar também o trabalho interno do proxy OffthreadVideo, o runner prepara em `media/` somente o intervalo pedido: H.264 CRF 0 (sem perda) e WAV PCM 24-bit da mesma fonte, mantendo 60 FPS neste teste. O cache considera props, tamanho e mtime; a geração final reutiliza esse trecho e comprime uma única vez para entrega. O caminho original permanece no preset e em `sourceProps` da validação. O componente também pode receber `audioSrc` opcional; sem essa prop, usa o áudio da fonte normalmente.

Limitações: ampliar não recupera detalhes da webcam; crop vertical pode excluir HUD e ação periférica. Ajuste as regiões por fonte e revise o resultado. Regiões incertas exigem inspeção visual. Não há rastreamento dinâmico de rosto nem reconstrução do gameplay oculto.
