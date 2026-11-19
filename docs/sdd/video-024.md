# Spec — A conexão entre o pântano e o bar

**Classe:** M | **Alvo:** `video-024` | **Estado:** concluída e validada

## Resultado esperado
MP4 cinematográfico vertical, 1080×1920 a 30 fps, com 1627 frames derivados da narração original de 54,204 s. A edição conduz o olhar pelas evidências reais e termina com a hipótese de um mundo conectado, claramente identificada como teoria.

## Entradas disponíveis
- `public/videos/video-024/audio/narracao.mp3`, preservada integralmente.
- Duas imagens 3840×2160 da biblioteca em `gta6/personagens/cenas_aleatorias`: acampamento e bar, inspecionadas visualmente.
- Trailer 2 de GTA VI para contexto do encerramento.
- Transcrição local única em `src/videos/video-024/words.json` e `segments.json`.

## Escopo
Criar somente composição 024, legendas sincronizadas, som discreto do CTA, scripts específicos de prévia e registro mínimo em Root. Preservar mudanças existentes e originais. Exportar pelo fluxo integrado de produção, respeitando o bloqueio de retenção antes da confirmação inicial.

## Regras inegociáveis
- Evidências: cobra, tiras penduradas, cauda, banda, dança, cachorro de laço rosa, garrafa e letreiro. Aproximar cada detalhe na fala correspondente, sem recriar ou inventar elementos.
- Comparação visual da marca em ambas as imagens; grafia Patrick Beer conferida nas próprias imagens.
- Possível caça/comércio e conexão econômica identificados como hipótese.
- Áudio sem retiming; legendas com destaque de palavra e margens seguras.
- CTA às 30–33 s, sem adicionar duração, com clique e confirmação animada.
- Sem download, reindexação ou nova geração de voz; uma exportação completa após os frames de revisão.

## Aceitação objetiva
- [x] TypeScript e lint dos arquivos alterados passam.
- [x] Um frame representativo de cada um dos 18 blocos foi inspecionado antes do render final.
- [x] MP4 H.264 CRF 18/AAC com duração e dimensões corretas, decodificado integralmente.
- [x] Detalhes, comparação e CTA conferidos na entrega final.
- [x] Alterações anteriores preservadas.

## Riscos e incertezas
As imagens sustentam os detalhes visuais; não confirmam mecânicas de caça/comércio ou simulação econômica. A narração preserva essa distinção. As aproximações usam os originais 4K e precisam manter os detalhes dentro do enquadramento vertical.

## Exportação
O script específico `scripts/render-video-024.mjs` reutiliza o bundle revisado, recusando fontes alteradas depois da prévia e saída já existente. Usa os mesmos parâmetros do renderer comum e chama `completeProduction` ao terminar, incluindo a validação e a retenção integrada. O encerramento usa reprodução HTML de vídeo para evitar a falha observada no proxy de extração de OffthreadVideo; seu frame foi renderizado e inspecionado após a correção.

## Entrega verificada
`deliveries/video-024-final-20261116-v1.mp4`: 54,251 s; 1080×1920; 30 fps; H.264 CRF 18; AAC estéreo 48 kHz; 36.614.142 bytes. SHA-256: `e0c3760ea35ed654e69866ec571a608c19b6bbfd186acbbbee17984cb2ea46a0`.

Uma exportação completa. Decodificação integral realizada por `validateMp4` antes das verificações do projeto. Frames do MP4 conferidos aos 32,67 s (CTA confirmado), 37,33 s (garrafa), 39,67 s (letreiro) e 51,67 s (vídeo do encerramento). Metadados e imagem de revisão em `out/video-024/`.

Verificações finais globais de `completeProduction`: concluídas com código 0. TypeScript de src e desktop, builds de src e Studio e frame de integração da composição passaram. O retorno foi `pendingInitialApproval: true`: nenhuma produção anterior foi removida, pois a confirmação inicial da retenção ainda não existe.
