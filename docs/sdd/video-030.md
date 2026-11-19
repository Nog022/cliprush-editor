# Spec: Seguindo Lucia

**Classe:** M | **Alvo:** `video-030` | **Estado:** em execução

## Resultado esperado
Vídeo vertical cinematográfico, 1080×1920, 30 fps, 1648 frames (54,933 s), preservando a narração integral. Chegada, inscrição da van e embarque recebem enquadramentos próprios. Material fornecido não tem origem oficial comprovada: sinalizar isso sem alterar a fala.

## Entradas disponíveis
- `public/videos/video-030/audio/narracao.mp3`: 54,909 s.
- Biblioteca: `novidadesGta6/jason_seguindo_lucia.mp4`: 38,656 s, 1920×1080.
- Transcrição local única, modelo small já instalado; JSON de palavras e segmentos.

## Escopo
**Fazer:** composição ClipRush030, registro mínimo no Root, legendas sincronizadas, foco na lateral da van, CTA durante a fala correspondente e MP4 com nome único via fluxo de produção.
**Preservar:** mídia original, MyComp, ajustes existentes e biblioteca. Retenção somente conforme confirmação vigente no mecanismo existente.

## Regras inegociáveis
- Cortes guiados pela voz; reprises identificadas durante análise; hipótese de rotina não apresentada como confirmação.
- Sinalizar origem não verificada; nenhuma afirmação de gameplay oficial.
- Sem downloads, pacotes novos, reindexação ou transcrição repetida.
- Legendas legíveis, não cobrir o detalhe analisado; CTA após 3 segundos com confirmação visual e clique discreto.

## Aceitação objetiva
- [x] TypeScript e lint dos arquivos alterados.
- [x] Um frame representativo por bloco, inclusive detalhe e CTA.
- [x] MP4 H.264 CRF18, AAC, 1080×1920, 30 fps, voz integral.
- [x] Metadados e decodificação integral aprovados no fluxo de conclusão.

## Riscos e incertezas
Fonte do gameplay não comprovada. A inscrição é pequena e parcialmente ocluída; ampliar trecho real sem reconstruir letras. Narração fornece a hipótese e prevalece como áudio, com ressalva visível.

## Valida??o de pr?via
Onze quadros revisados: 45, 160, 360, 550, 650, 800, 925, 1080, 1220, 1390, 1550. Sobreposi??o no CTA corrigida no t?tulo e quadro 925 regenerado e revisado. TypeScript e ESLint aprovados. Narra??o transcrita uma ?nica vez, 157 palavras, ?ltima fala at? 54,52 s. Studio iniciado; canal nativo de navegador indispon?vel, abertura no navegador padr?o solicitada e inspe??o feita pelos frames reais do renderer.

## Entrega
`deliveries/video-030-cinematic-v1-20261118.mp4`, 79.884.786 bytes; SHA256 f23f3ecb7bf6aa52f3de6bba58edc2b45b3b3e09f7e7b17a520813cfd105f55a. Fluxo de produ??o conclu?do com decodifica??o integral e verifica??o src/desktop. Reten??o n?o executada: pendingInitialApproval. Correla??o do ?udio final com a narra??o original: 0.999969. Quadro do CTA extra?do diretamente do MP4 final para revis?o.
