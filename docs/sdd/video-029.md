# Spec: Jason e o passageiro inesperado

**Classe:** M | **Alvo:** video-029 | **Estado:** implementação autorizada

## Resultado esperado
Short vertical cinematográfico de 46,7 s, determinado pela narração original. Montagem evidencia entrada no carro, gato laranja, reação e saída, com reenquadramento suave, legendas sincronizadas e CTA integrado à fala.

## Entradas disponíveis
- `public/videos/video-029/audio/narracao.mp3`: 46,681 s.
- Biblioteca: `gta6/videos/novidadesGta6/jason_vs_gato_no_carro.mp4`: 38,635 s, 1920×1080.
- Transcrição única com modelo local existente em `src/videos/video-029/words.json` e `segments.json`.

## Escopo
Nova composição, registro mínimo no Root, script de previews e documentação. Render pela entrada integrada `npm run render -- ClipRush029 final-20261118`.
Preservar alterações existentes, MyComp, áudio e fonte. Sem download, reindexação ou regeneração de voz. Retenção somente pelo fluxo integrado e seus controles existentes.

## Regras inegociáveis
1080×1920, 30 fps, 1401 frames; H.264 CRF18, AAC 320k. Enquadrar gato e Jason juntos durante interação; levantar sombras sem estourar exteriores. Legendas na área segura, separadas da prova. Reprises apenas para análise/reação, identificadas. Nenhum alongamento após a narração.

## Storyboard e aceitação
- 0–8,5 s: teaser da interação e apresentação do passageiro inesperado.
- 8,5–16 s: entrada, condução e descoberta.
- 16–25,5 s: gato e reação em destaque.
- 25,5–28,6 s: CTA animado, sem ocultar gato.
- 28,6–34,4 s: porta e saída na ordem original.
- 34,4–39,6 s: reprise de detalhe identificada.
- 39,6–46,7 s: condução e pergunta de encerramento.
- [x] TypeScript e lint da composição.
- [x] Frame representativo de cada bloco inspecionado antes do render.
- [x] MP4 com áudio, dimensões/duração verificadas e decodificação integral.
- [x] CTA visível comprovado em frame do MP4.

## Riscos e incertezas
Fonte horizontal e interior escuro: crop moderado com revisão visual. Narração fornecida prevalece; não adicionar alegações ou usar imagens de outro jogo. Limpeza inicial pendente não impede entregar MP4 validado.

## Resultado verificado
- Entrega: `deliveries/video-029-final-20261118.mp4`.
- ffprobe: H.264, 1080?1920, 30 fps; AAC, 48 kHz; 46,720 s; 32.590.222 bytes.
- SHA-256: `6236de42312d892ecff0e97fe44621542ff2e5c108c951bb0643cb6c093095f3`.
- TypeScript e ESLint da composi??o aprovados. Fluxo integrado concluiu decodifica??o integral e verifica??o src/desktop.
- Dez frames representativos inspecionados; tr?s previews corrigidos ap?s ajustes de t?tulo, CTA e sombras.
- Frames extra?dos do MP4 em 18 s, 27,5 s e 45,8 s confirmam cena, CTA e encerramento. Evid?ncias em `out/video-029/final-review.jpg` e `final-metadata.json`.
- Uma exporta??o completa. Narra??o preservada. Limpeza n?o executada: `pendingInitialApproval: true`; nenhuma confirma??o ou controle de reten??o contornado.
