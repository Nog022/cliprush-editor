# Spec: video-025 — seis climas de GTA VI

**Classe:** M | **Alvo:** video-025 | **Estado:** entregue

## Resultado esperado
MP4 cinematográfico vertical, 1080×1920, 30 fps, 49,333 s (1480 frames). A narração original de 49,319 s determina a duração. Seis imagens locais de clima ganham movimento e foco nos detalhes; legendas acompanham as palavras reais.

## Entradas disponíveis
- `public/videos/video-025/audio/narracao.mp3`: áudio original preservado.
- `words.json` e `segments.json`: uma transcrição local com modelo existente, sem download.
- GTA6 / imagens novas: Fog, Mist, Swamp, Rain, Tropical Storm e Wind.
- Trailers locais de GTA V e RDR2 como referência de atmosfera.
- `ClipRush025.tsx` e `caption-pages.json` preexistentes: edição RDR2 preservada integralmente, acessível pelo ID `ClipRush025Rdr2`.

## Escopo
**Fazer:** `Weather025.tsx`, `weather-captions.json`, registro mínimo em Root, scripts específicos de preview/exportação, esta spec e relatório de qualidade.
**Não fazer:** alterar narração, edição RDR2, outras produções, biblioteca, desktop ou dependências.

## Regras inegociáveis
- Cada imagem aparece na fala correspondente; destaque de raio, neblina e reflexos sem criar evidências sintéticas.
- Clima localizado e persistência de poças são apresentados como possibilidades. Imagens estáticas não comprovam essas mecânicas; origem oficial das imagens não foi afirmada.
- CTA entre 34,2 e 36,3 s acompanha a fala, com ícone, cursor, confirmação, partículas e som curto original; sem estender a duração.
- Narração íntegra, sem música encobrindo a fala; margens seguras e texto legível.
- Exportação única em caminho novo, H.264 CRF18 e AAC320k. Reuso do bundle revisto; conclusão por `completeProduction`.
- Não contornar a confirmação inicial da política de retenção.

## Timeline
- 0–7,8 s: raio e mosaico das seis imagens.
- 7,8–14,8 s: arquivo GTA V e RDR2, identificado como referência de atmosfera.
- 14,8–19,1 s: Fog / prédios; 19,1–22,2 s: Mist / árvores.
- 22,2–24,8 s: Swamp / céu; 24,8–28 s: Rain / reflexos.
- 28–30,5 s: Tropical Storm / raio; 30,5–34,2 s: Wind / estrada.
- 34,2–36,3 s: CTA; 36,3–43,2 s: possibilidade de clima localizado.
- 43,2–46,2 s: asfalto e hipótese de persistência; 46,2–49,333 s: pergunta final.

## Aceitação objetiva
- [x] TypeScript e lint do escopo sem erros ou avisos após correções.
- [x] Um frame de cada bloco revisto antes do MP4; 15 frames inspecionados.
- [x] MP4 com duração, áudio, dimensões e FPS corretos; decodificação integral sem erros.
- [x] CTA confirmado em frame extraído do MP4.
- [x] Produções anteriores e alterações preexistentes preservadas pela edição.

## Decisões e incertezas
- O topônimo transcrito como “Gambit Bay” é incerto; a legenda omite apenas o nome, preservando o áudio e a transcrição bruta.
- Os trailers disponíveis mostram atmosfera geral; não foram apresentados como prova específica de tempestade.
- A prévia com OffthreadVideo excedeu o tempo de decodificação. Usou-se Html5Video, o mesmo componente nativo já empregado na produção anterior, com enquadramento conferido.
- A revisão corrigiu o recorte inicial para mostrar o raio inteiro.
- O inventário histórico informa ausência de aprovação inicial da retenção; não executar limpeza manual.

## Fechamento
MP4 entregue e validado. TypeScript de src/desktop, lint do escopo, metadados, decodificação integral, correlação de áudio e revisão de frames passaram. A checagem adicional Webpack de completeProduction foi interrompida após ficar sem progresso; não é registrada como aprovada. Não houve limpeza de produções.


## Revisão v2 — somente a abertura
Solicitação: substituir o mosaico por uma imagem de cada vez em tela cheia, com cortes rápidos, câmera leve e fechamento de impacto. Escopo visual estrito: frames 0–233 (0–7,8 s); narração, legendas, duração e cenas posteriores intactas.

- 15 planos de 15 ou 18 frames (0,5–0,6 s), com alternância de raio, neblina, chuva, vento e nuvens.
- Corte seco com acomodação de câmera em dois frames; nenhum crossfade ou imagem simultânea. Zoom de 1,045 a 1,105 e deslocamento discreto.
- Acentos da narração guiam o ritmo; não há música de fundo na entrega original e o áudio será copiado integralmente.
- Fechamento no raio por 0,6 s, mantendo o corte para GTA V em 7,8 s.
- Exportar apenas os 234 frames da abertura. A fronteira de 7,8 s é um keyframe do MP4 original; concatenar por cópia de stream, sem recodificar as cenas posteriores.
- Aceitação: preview de cada plano, TypeScript/lint, narração e vídeo posterior com hashes de pacotes e timestamps idênticos, MP4 final completamente decodificado. Nome novo v2; v1 preservada.

**Aceitação v2 concluída:** enquadramentos revisados, MP4 decodificado integralmente, áudio e vídeo após a abertura idênticos por hashes de pacotes e timestamps. Checagens de compilação concluídas, reutilizando o bundle revisado. Relatório: `docs/sdd/video-025-intro-v2-validation.md`.
