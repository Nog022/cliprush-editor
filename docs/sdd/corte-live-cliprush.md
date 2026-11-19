# Corte de Live - ClipRush

Classe G. Escopo: preset permanente no editor desktop, com o recorte existente.

Entradas: public/videos/template/corte-live.png (localização real da referência), vídeo local eZE6PtAf8vE, trecho 1214–1230 s. Nenhum download.

Resultado: projeto selecionável em 1080×1920/30 FPS, webcam 145/145/790/390, gameplay 20/595/1040/865 e texto 50/1510/980/115. Preservar imagem, cores e molduras; máscara transparente somente nas janelas. Reutilizar analyzeClip, coverRegion e WebcamTopGameplayBottom; composição compartilhada pelo Player e renderer.

Plano:
1. Persistir preset, texto e enquadramento validado. Testar roundtrip e rejeição de coordenadas inválidas.
2. Adaptar o componente existente com posições opcionais e volume; conectar detecção e edição de legenda somente no preset. Verificar tipos e regressões.
3. Empacotar referência para preview e renderer. Testar criação, detecção, aplicação, persistência e exportação com dados isolados em out/.
4. Inspecionar três frames e MP4 de 480 quadros; conferir áudio sincronizado, tamanho, FPS, decodificação e legenda.

Invariantes: nenhum pipeline paralelo, mudança nos demais presets, dados reais, outros vídeos ou retenção de produções numeradas. O teste tem nome próprio e não autoriza limpeza. Sem dependências novas.

Riscos: detector pode devolver incerteza geométrica; exigir revisão visível das regiões. Alteração posterior do trecho invalida enquadramento aplicado. Referência tem proporção quase 9:16; adaptar ao canvas sem redesenhar identidade.

Rollback: desfazer apenas os hunks desta integração e seus arquivos novos, preservando mudanças anteriores do usuário e MP4. Após duas falhas sem avanço, investigar antes de repetir.

Decisão verificada: AV1 longo travou no decoder sequencial do render, embora os stills funcionassem. A preparação sem perdas/PCM de scripts/render-template.mjs foi extraída para prepare-template-media.mjs e reutilizada no mesmo RenderService, com cache por fonte e intervalo. O Player mantém a fonte original; os pixels e o áudio exportados são comparados contra ela. Nenhum segundo renderizador ou detector foi criado.
