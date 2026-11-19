# Spec: os detalhes de Mount Kalaga

**Classe:** M | **Alvo:** `video-021` | **Estado:** entregue e validada

## Resultado esperado
Short vertical cinematográfico de 45,9 s guiado integralmente pela narração existente. A placa aparece no primeiro frame; ampliações revelam fauna e o encerramento retorna à placa com simulação gráfica de enchente explicitamente identificada como teoria.

## Entradas disponíveis
- `public/videos/video-021/audio/narracao.mp3`: 45,871 s, preservado integralmente.
- Biblioteca GTA VI: imagens Mount Kalaga 01, 03 e 06, verificadas visualmente, resolução real 3840×2160.
- Transcrição única pelo faster-whisper small já instalado e em cache; palavras e segmentos em `src/videos/video-021/`.

## Escopo
**Fazer:** nova composição, registro mínimo no Root, legendas sincronizadas, zoom com alvo correto, CTA de curtida/seguir na fala existente, simulação gráfica e MP4 CRF18.

**Não fazer:** alterar código desktop ou modificações preexistentes; reindexar ou baixar mídias; gerar voz ou afirmar mecânica de enchentes confirmada.

## Regras inegociáveis
- Preservar áudio e sua duração; 1080×1920, 30fps, 1377 frames.
- Gancho na placa amarela à esquerda; contexto do caiaque na sequência.
- Animal avermelhado visível nas pedras; sem atribuir espécie.
- Animal escuro no tronco visível; possível cervídeo com ressalva explícita. Não usar análise automática do catálogo como prova.
- Teoria/simulação identificada durante todo o efeito de água; água gráfica não se apresenta como gameplay.
- Biblioteca consultada: busca de natureza e caiaque retornou cenas de contexto incompatível ou evidência diferente. Priorizar fotografias originais exatas em vez de B-roll enganoso.
- Retenção apenas pelo fluxo integrado de entrega, respeitando estado da confirmação inicial e backups.

## Storyboard e aceitação objetiva
- 0–5,8 s: placa imediatamente, destaque e tradução de FLOOD GAUGE.
- 5,8–12,1 s: abertura do enquadramento para caiaque/parque.
- 12,1–17 s: motos e zoom no animal nas pedras.
- 17–21,9 s: contexto dos caçadores, zoom no tronco à direita.
- 21,9–28,3 s: possível cervídeo, retorno ao contexto da floresta.
- 28,3–32,4 s: CTA animado sincronizado, sem aumentar duração.
- 32,4–35 s: retorno à placa original.
- 35–45,9 s: água gráfica crescente, chuva, hipótese sobre caminhos e ressalva de teoria.
- [x] TypeScript e lint direcionado passam.
- [x] Treze frames representativos inspecionados antes do MP4; alvos da floresta refinados em dois previews pontuais.
- [x] MP4 final com áudio AAC, H.264, 45,909 s, 1080×1920, 30fps e decodificação integral validados pelo fluxo `completeProduction`.
- [x] CTA e aviso TEORIA confirmados em frames extraídos do MP4 final.

## Entrega
`deliveries/video-021-final-20261114-v1.mp4`, 45.203.453 bytes. SHA256: `57beb8ae5205795a0a9f3eea41e158d8137ee80acfe9d53ae12775d7332b16f7`.
Render único completo via `npm run render -- ClipRush021 final-20261114-v1`, CRF18, AAC320k. O fluxo reportou `pendingInitialApproval`: nenhuma retenção/exclusão de produções foi executada, pois a confirmação inicial não está habilitada.

## Riscos e incertezas
A vegetação encobre o cervídeo; a narração já diz “parece”, e a tela reforça identificação incerta. A placa prova sua própria presença, não uma mecânica de jogo. Coordenadas fornecidas eram aproximadas: o texto FLOOD GAUGE está em y≈30%, acima da régua em y≈47%.
