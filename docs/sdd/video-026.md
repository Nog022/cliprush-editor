# Spec: video-026 — do canal ao acampamento

**Classe:** M | **Alvo:** video-026 | **Estado:** entregue

## Resultado esperado
MP4 ClipRush vertical 1080×1920, 30 fps, 1410 frames (47 s), guiado pela narração original de 46,994 s. Foco cinematográfico na imagem do jogo, sem webcam, com zoom progressivo, legendas por palavra e CTA sincronizado.

## Entradas disponíveis
- Narração: `public/videos/videos-026/audio/narracao.mp3` (nome original da pasta preservado).
- Biblioteca: `gta6/videos/davy/PRIMEIRA MISSAO DO NOVO GTA 6!!!!! [hGSTHYxIt0U].mp4`, 1920×1080, 60 fps.
- Intervalos obrigatórios 358–368 s e 378–384 s. Complementos do mesmo arquivo para navegação, mapa, binóculos e ação, conferidos visualmente.
- Transcrição única com faster-whisper local existente, sem downloads; JSON reutilizado para legendas.

## Escopo
**Fazer:** nova composição, registro mínimo no Root, excertos locais sem webcam, scripts específicos, spec e validação.
**Não fazer:** alterar narração, biblioteca original, desktop, dependências ou outras edições.

## Regras inegociáveis
- Excluir webcam pela remoção geométrica das primeiras 270 linhas; recorte termina em y=810, antes das legendas do original.
- Original preservado. Recortes H.264 CRF16 a 60 fps para decodificação previsível; saída CRF18/AAC320k.
- Não afirmar que o título do arquivo comprova autenticidade do jogo; áudio fornecido preservado, sem acrescentar alegações editoriais.
- Não apresentar animal específico como prova se não estiver visível. Títulos do bloco dos animais permanecem gerais.
- Intervalo 358–368 ocupa 23,5–29,8 s em velocidade 1,5873; 378–384 ocupa 29,8–35,8 s na velocidade original.
- Reutilização breve de imagens no gancho prepara a revelação; não repetir para preencher duração.
- Retenção passa por completeProduction, sem contornar aprovação inicial pendente.

## Timeline
0–6,7 s gancho em três detalhes; 6,7–12,3 s canais/água; 12,3–15,7 s mapa; 15,7–18,4 s aproximação; 18,4–23,5 s binóculos; 23,5–35,8 s intervalos pedidos, CTA em 30,3–33,6 s; 35,8–41,6 s infiltração; 41,6–43,9 s confronto; 43,9–47 s pergunta final.

## Aceitação objetiva
- [x] TypeScript e lint do escopo.
- [x] Frame representativo de cada bloco inspecionado antes do MP4.
- [x] Sem webcam; detalhes legíveis e legendas dentro das margens.
- [x] MP4 único, áudio, duração, resolução e FPS conferidos; decodificação integral.
- [x] CTA inspecionado no MP4 final.

## Riscos e incertezas
Narração menciona jacaré albino; os intervalos pedidos mostram felinos enjaulados. Preservar áudio, sem rotular o felino branco como jacaré. O catálogo foi consultado; cenas do próprio arquivo têm melhor continuidade que B-roll genérico.

## Estratégia de validação
13 frames do bundle Rspack inspecionados antes da exportação. O render reutiliza esse bundle e recusa fontes mais recentes. completeProduction valida metadados, decodificação integral, SHA-256, TypeScript src/desktop e bundles src/studio com esbuild; o check recebe current=0 para evitar um segundo bundle e preview já comprovados. Nenhum bypass da validação do MP4 ou autorização de limpeza.

## Entrega validada
Arquivo: deliveries/video-026-final-20261118-v1.mp4. 47 s, 1080×1920, 30 fps, H.264 CRF18/AAC320k; 27.974.893 bytes. completeProduction concluiu com sucesso: decodificação integral, metadados e compilação src/desktop/studio. CTA conferido no frame extraído aos 31,7 s. Correlação de áudio original/final: 0,999962; a pequena diferença inclui AAC e o clique do CTA. SHA-256: d59b68730061312fda64e539e0082b03a72ec149eb08b43c4ee563403e499be6.
A retenção retornou pendingInitialApproval=true; nenhuma limpeza foi realizada. Relatório técnico em out/video-026/validation.json. Uma única renderização completa, com bundle de preview reutilizado.

## Correção v2 — fluidez
Relato do usuário: travamentos em algumas partes. O teste anterior verificava decodificação e frames isolados, insuficientes para avaliar cadência. Substituído Html5Video por OffthreadVideo para extração determinística dos excertos H.264 já existentes. Layout, áudio e cortes preservados. Trechos de 2 s em 13,0, 25,5 e 33,0 s foram renderizados antes da exportação; comparações registradas em out/video-026/motion-comparison.json. Os 13 blocos foram revistos. A saída v2 adiciona faststart para carregamento progressivo.
A detecção inicial de baixa movimentação apontou 12,57–13,03, 14,13–14,87 e 33,47–34,03 s. O arquivo fonte também contém momentos de pouca movimentação; esses sinais não comprovam sozinhos congelamento nem corrupção. Validação v2 deve incluir timestamps constantes e comparação temporal dos trechos renderizados.

Comparação temporal da v1 com referência determinística em três trechos: correspondências aproximadas retornam a quadros anteriores (12/12/14 ocorrências por amostra de 60 frames, mapa/animais acelerados/animais normais). Isso evidencia cadência inconsistente na captura Html5Video; métricas aproximadas não são contagens universais de congelamento. Usuário solicitou revisão de todo o vídeo, estendida a todos os 1410 quadros da saída v2.

### Entrega v2 validada
Arquivo: deliveries/video-026-final-20261118-v2.mp4; 30.430.074 bytes; SHA-256 98c5a24466fb4d8cb96748b77f3c82439fe856424d006403463a938bafe557f0. Validação integral de decodificação, TypeScript src/desktop e bundles src/studio concluída por completeProduction.
Todos os 1410 frames analisados: timestamps crescentes a 30 fps, erro máximo de passo 0,000000667 s; nenhum par de quadros praticamente idênticos na região de vídeo (limiar MAE 0,05/255), nos 13 blocos. Os três trechos do MP4 final coincidem temporalmente com as referências Offthread testadas (MAE médio 0,216/0,431/0,320 de 255; diferenças de compressão). Isso verifica cadência, sem substituir a revisão visual dos 13 blocos realizada antes da exportação. Áudio AAC com hash de pacotes idêntico ao da v1. Faststart confirmado por moov antes de mdat. CTA do MP4 revisto aos 31,7 s, sem webcam.
Relatório: out/video-026/validation-v2.json. V1 preservada. Retenção continua aguardando confirmação inicial; nenhuma limpeza executada.
