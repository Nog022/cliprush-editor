---
name: cliprush-midia
description: Inspecionar duração, FPS, resolução e faixas de áudio/vídeo de mídias do ClipRush via ffprobe com cache local. Usar quando uma tarefa precisa metadados reais; não usar para inspecionar automaticamente toda a biblioteca.
---

# Metadados locais com cache
1. Selecionar somente arquivos realmente necessários à tarefa. Primeiro verificar metadados existentes que sejam confiáveis.
2. Quando necessário, usar script sem modelo de IA: `python tools/cache_ffprobe.py --root . --file "public/videos/video-NNN/audio/narracao.wav"`. Para mais arquivos, repetir `--file`; não varrer pastas por padrão.
3. O script guarda metadados em `out/.cliprush-cache/ffprobe.json`, invalidados por tamanho + `mtime_ns`. Nunca alterar ou converter o arquivo original.
4. Evitar chamar `ffprobe` por cena para o mesmo vídeo. Reutilizar duração, FPS e dimensão para toda a composição; converter timecodes conforme FPS real do original.
5. `ffmpeg` para extração de frame ou recorte só se a validação visual realmente precisar, e apenas nos timestamps escolhidos. Não gerar centenas de quadros sem necessidade.
6. Se cache/ferramenta falhar, executar `ffprobe` pontual com saída breve; não degradar a qualidade de sincronização.
