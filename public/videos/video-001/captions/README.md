# Transcrição local do original

`original.words.json` e `original.segments.json`: saída bruta do faster-whisper small.

`original-large.words.json` e `original-large.segments.json`: saída bruta do faster-whisper large-v3, base da edição. Ambos os modelos já estavam disponíveis no computador; não houve download ou envio do áudio para serviços externos.

Os JSON de palavras seguem o formato oficial `Caption` do Remotion, com tempos em milissegundos relativos ao início de `footage/original.mp4`. As saídas automáticas são preservadas como referência; conferir o texto e os tempos na revisão auditiva.

As legendas efetivamente usadas ficam inline em `src/videos/video-001/ClipRushVideo001.tsx`, selecionadas por corte, com quebras de página e correção do timestamp do artigo “A” antes de “reportagem”. Não editar os JSON esperando atualização automática da prévia: editar os arrays da composição ou usar o editor de legendas do Studio.
