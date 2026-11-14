# Spec: video-020 — um mundo para explorar

**Classe:** M | **Alvo:** `src/videos/video-020` | **Estado:** concluída

## Resultado esperado
MP4 cinematográfico vertical 1080×1920, 30fps, preservando a narração integral de 42,998s (1290 frames). Progressão: combinação imaginada de mundos → escala de Leonida → comparação de área → interiores e detalhes → pergunta final.

## Entradas disponíveis
- `public/videos/video-020/audio/narracao.mp3`; transcrição local única em `src/videos/video-020/words.json` e `transcript.json`.
- Biblioteca existente: trailers oficiais GTA VI, GTA V e RDR2; catálogo apenas para localizar candidatos, sem reindexação.
- Remotion e ferramentas instaladas; fonte Arial Bold local.
- Contexto editorial conferido em Game Informer (29/09/2026) e relato VGC da entrevista: https://www.videogameschronicle.com/news/gta-6-map-is-officially-twice-as-large-as-gta-5-features-hurricanes-and-tropical-storms/

## Escopo
**Fazer:** composição ClipRush020, registro mínimo em Root, legendas por palavra, comparação esquemática de área, montagem de biblioteca, trilha original discreta e exportação via pipeline integrado.

**Não fazer:** editar áudio original, alterar outras produções, baixar/reindexar biblioteca ou contornar a confirmação inicial da retenção.

## Regras inegociáveis
- A combinação de GTA IV/V/RDR2 é uma hipótese visual, sem inventar medidas ou mapa oficial. GTA IV será representado por cartografia ilustrativa, pois não há vídeo desse jogo na biblioteca.
- Comparação 2× representa área, não comprimento; razão aproximada e indicação de esquema sem escala geográfica.
- Inspecionar finalistas e cada bloco antes do MP4. Não usar cenas do catálogo que pertençam a outro jogo por engano.
- Legendas legíveis, margens seguras, rostos/detalhes descobertos e áudio sem alteração de velocidade.
- Preservar alterações pré-existentes, MyComp e dados. Render único em nome novo pelo script integrado.

## Aceitação objetiva
- [x] 1290 frames, 1080×1920/30fps, narração completa e AAC.
- [x] Um frame representativo de cada bloco visualmente revisado; fontes e mídia carregadas.
- [x] TypeScript e ESLint pertinentes aprovados.
- [x] MP4 final validado por metadados e decodificação integral.
- [x] Resultado e evidências registrados sem análises/renderizações redundantes.

## Riscos e incertezas
- Trailer tem cortes curtos: ajustar intervalos para não atravessar cenas sem intenção; usar congelamento editorial identificado no detalhe se necessário.
- Acesso gráfico ao navegador indisponível nesta sessão; Studio iniciado e QA por frames do renderer.
- Retenção só pode limpar após confirmação inicial válida; manter trava do pipeline.

## Entrega validada
- `deliveries/video-020-v001.mp4`: contêiner de 43,008s; vídeo de 1290 frames/30fps, 1080×1920, H.264 + AAC; 26.729.927 bytes.
- Exportação única: `npm run render -- ClipRush020 v001`, exit 0. Pipeline validou metadados, decodificação integral com ffmpeg -xerror e compilação do projeto.
- SHA-256: `417811332641cf4b030b1ee427e97906ab4f4ab81e37f9330d1af1f453e61663`.
- QA: `out/video-020/visual-review.json`, frames de cada bloco e `final-mp4-check.jpg`.
- Retenção retornou `pendingInitialApproval: true`; nenhuma limpeza executada nesta entrega.
