# Video-025 — correção da abertura v2

Entrega: `deliveries/video-025-clima-final-20261117-v2.mp4`

- Alteração visual restrita aos primeiros 7,8 segundos: 15 planos em tela cheia, cortes de 0,5–0,6 s, zoom e deslocamento leves. Uma imagem por vez; mosaico removido.
- Raio no início e nos 0,6 s finais, conectando com o corte original para GTA V em 7,8 s.
- Textos, legendas, duração e sincronização preservados. Não havia música de fundo na versão anterior; nenhum áudio novo foi acrescentado.
- Renderizados somente 234 frames da abertura; os outros 1246 frames foram copiados sem recodificação.
- Comparação de SHA-256 dos pacotes comprimidos e seus PTS/DTS: todos os 1246 pacotes de vídeo posteriores à abertura e os 2315 pacotes de áudio são idênticos aos da v1.
- Revisão visual: um frame de cada plano antes da exportação; dez frames extraídos do MP4, incluindo ambos os lados da junção em 7,8 s.
- TypeScript e lint passaram. `completeProduction` concluiu metadados, decodificação integral, TypeScript de src/desktop e compilação esbuild. Reutilizou-se o bundle Remotion revisado, sem refazer o bundle Webpack redundante.
- 1080×1920, 30 fps, 1480 frames, H.264 CRF18; AAC original copiado integralmente.
- Duração do contêiner: 49,344 s. Tamanho: 31.495.110 bytes.
- SHA-256: `abc05c986d5895efc5fdeb9da4a3cd3e4b3ff8044712ef6405e5d1ed1ecaacc1`.
- Provas: `out/video-025/intro-v2/preservation-proof.json`, `completion.json` e `final-review.jpg`.
- V1 preservada. Nenhuma limpeza de produções executada; aprovação inicial de retenção segue pendente.
