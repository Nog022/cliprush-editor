# Spec: fuga de avião — vídeo 032

**Classe:** M | **Alvo:** `video-032` | **Estado:** concluída e validada

## Resultado esperado
MP4 vertical cinematográfico de 44,0667 s, 1080×1920 a 30 fps, preservando a narração integral de 44,042 s. Progressão visual: aeroporto, manobra, pista, decolagem, curvas, salto e paraquedas. Legendas por palavra e CTAs curtos sincronizados à fala.

## Entradas disponíveis
- `public/videos/video-032/audio/narracao.mp3`.
- `public/videos/biblioteca/gta6/videos/novidadesGta6/jason_roubando_um_aviao_comercial.mp4`: 180,024 s, 1920×1080; cenas inspecionadas em contact sheets locais.
- Transcrição única com modelo small já disponível localmente; `words.json` e `segments.json`.
- Render e validação pelo fluxo existente `npm run render`.

## Escopo
**Fazer:** composição `ClipRush032`, registro mínimo no Root, SDD, prévias de cada bloco, trilha discreta original e MP4 único em deliveries.

**Não fazer:** modificar produções anteriores, reindexar, baixar mídia/modelos ou alterar desktop. Retenção permanece condicionada à confirmação inicial existente no fluxo.

## Regras inegociáveis
- Narração original integral; duração 1322 frames; sem time stretch do áudio.
- Plano preserva asas e ação; alternar contexto e aproximação sem inventar ações.
- Clipe fornecido não comprova ser gameplay oficial de GTA 6: identificação discreta de origem não verificada, sem reforçar a alegação nos títulos.
- Salto só revelado no bloco final. Reprise inicial curta de decolagem serve de gancho; narrativa cronológica do restante.
- CTAs em 28–31 s sem acréscimo de duração e fora da área da ação.
- Não reprocessar transcrição nem renderizar novamente sem falha concreta.

## Aceitação objetiva
- [x] TypeScript e lint do escopo passam.
- [x] Um frame de cada bloco inspecionado e CTAs visíveis, inclusive no MP4 final.
- [x] MP4 H.264 CRF18, AAC 320k, 1080×1920, 30fps, narração até o final.
- [x] Decodificação integral e metadados verificados pelo fluxo de entrega.
- [x] Sem alteração manual de produções anteriores ou dados desktop.

## Riscos e incertezas
Origem e identidade do clipe não verificadas. Texto da narração é preservado; títulos editoriais descrevem apenas ações visíveis. Corte vertical pode ocultar HUD original: contexto amplo nos planos de manobra e decolagem.
