# Foco do gameplay no preset Corte de Live

Classe G, escopo restrito ao gameplay do preset existente. Webcam, template, legenda, áudio, demais presets e pipeline de exportação preservados.

Problema: a região segura à esquerda da webcam tem centro diferente do centro original da gameplay. O barco aparece deslocado. Reutilizar coverRegion, acrescentando foco e zoom proporcionais. Foco padrão no centro horizontal da fonte, limitado à região segura; zoom inicial 1,25 permite centralizar sem reintroduzir a webcam original.

Plano e aceitação:
1. Acrescentar configuração opcional persistente de gameplay (automático/manual, X/Y e zoom), validação e interpolação por quadro. Cobrir centralização, limites, suavidade e compatibilidade com configurações antigas.
2. Reutilizar as observações YuNet e a amostragem do worker OpenCV para foco opcional em rosto central na gameplay. Exigir confiança ≥0,9, região segura, candidato único e persistência; não apresentar heurística de centro como detecção de barco. Sem modelo de veículos instalado, abster-se e disponibilizar controle manual. A análise da webcam não muda. O OpenCV local não expõe HOG; não adicionar dependência para essa funcionalidade.
3. Controles de X/Y/zoom no editor com atualização imediata no Player. Aplicação automática de foco independente da webcam. Reutilizar IPC analyzeClip, sem novo endpoint ou renderer.
4. Reutilizar fonte, cache de trecho e workspace de testes; exportar arquivo único dos 16 s. Conferir frames 0/240/479, centralização do barco, webcam/template invariantes, preview e áudio do MP4.

Invariantes: escala uniforme; janela fixa; não revelar a webcam embutida; manter último foco confiável em observações incertas, limitar velocidade e interpolar suavemente. Preservar o máximo da área segura compatível com foco e zoom. HUD pode sofrer corte quando conflitar com centralização; zoom manual permite priorizar área visível.

Rollback: remover apenas os hunks e artefatos desta revisão, sem restaurar arquivos inteiros com alterações anteriores. Após duas falhas sem progresso, investigar antes de repetir. Não baixar modelos ou mídias, instalar pacotes, reindexar ou acionar retenção.
