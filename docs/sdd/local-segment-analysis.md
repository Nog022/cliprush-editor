# Análise local de trechos

Classe G. Alvo desktop/shared/studio. Implementação autorizada pelo pedido Fase 2.

## Resultado e contrato

Analisar exclusivamente o intervalo do clipe existente, usando assetId, trimBefore e duração no FPS do projeto. Um asset que já seja recorte usa seus próprios timestamps. Resultados tipados ficam em production/visual-analysis, junto dos caches de preparação existentes. A API retorna resultados para a próxima fase sem salvar ou modificar a montagem.

## Auditoria e decisão

CatalogService.use cria clips referenciando a mídia original. Não há extrator dedicado da Fase 1 neste checkout. assetPath resolve referências e cópias gerenciadas. OpenCV está em .venv-indexacao e Silero VAD acompanha faster-whisper no Python312 da narração. Reutilizar esses ambientes em subprocessos limitados, sem instalar pacotes. O OpenCV 5 disponível oferece FaceDetectorYN e exige o modelo YuNet, incluído com licença MIT em desktop/models. O worker verifica SHA256 8f2383e4dd3cfbb4553ea8718107fc0423210dc964f9f4280604804ed2552fa4. O modelo fornece candidatos de rosto, mas não autentica humanos nem distingue NPCs. Regiões retangulares contendo rosto serão candidatas incertas de webcam. Gameplay e associação do locutor exigem evidência semântica adicional. [Origem oficial do modelo](https://github.com/opencv/opencv_zoo/tree/main/models/face_detection_yunet)

## Invariantes e aceitação

- Preservar projetos antigos, originais, áudio, composição e dados reais.
- Coordenadas normalizadas válidas, múltiplos candidatos e tempos relativos à fonte.
- Busca esparsa a cada 2,5 segundos, limite de quadros, duração e timeout configuráveis.
- Cache versionado por identidade física da fonte, intervalo, ambiente e parâmetros. Escrita atômica e deduplicação de requisições simultâneas.
- Ausência de detector, falhas de decodificação e cobertura parcial produzem incerteza.
- Fala é medida por VAD, speakerMatched permanece falso.

## Plano e validação

1. Contrato e worker local. Testar limites, candidatos, movimento e NPC por evidências sintéticas.
2. Integrar resolução de assets, IPC, cache e ação na lista de clips. Testar fonte, intervalo, cache inválido e concorrência.
3. Typecheck, lint direcionado, testes desktop e amostra sintética de 40 segundos com medição.

Rollback consiste em remover apenas os arquivos desta fase e seus pontos de integração. Caches são independentes do banco. Após duas correções sem avanço, investigar a causa. Precisão em vídeos reais com webcam e NPC permanece dependente de amostras representativas.

## Limites observáveis

O detector confirma a presença de candidatos faciais e mede seu deslocamento. Pessoa humana, câmera embutida/tela cheia e gameplay permanecem incertos enquanto a evidência geométrica permitir interpretação como personagem/interface. Fala usa VAD local e não associa o locutor. Modelos e mídia não são enviados a serviços durante a execução. O pacote inclui o modelo, mas usa instalações locais de Python/OpenCV e faster-whisper, selecionáveis por CLIPRUSH_VISUAL_PYTHON e CLIPRUSH_WHISPER_PYTHON.

## Validação executada

Passaram typecheck desktop, lint dos arquivos TypeScript alterados, build desktop, 17 testes desktop existentes, 8 testes de evidência controlada, 4 testes com o detector real em layouts sintéticos, 1 integração do serviço e 1 integração Electron/IPC/interface. A integração verifica intervalo 5–45 s em fonte de 50 s, fala somente fora da seleção, cache, corrupção de coordenadas, alteração da fonte, concorrência e preservação da montagem. O teste de interface precisou de runtime Electron temporário com ACL apropriada e execução fora do isolamento da ferramenta, mantendo sandbox/contextIsolation do aplicativo.

A seleção sintética de 40 s usou 16 quadros. Últimas medições foram 2.213 s no serviço e 2.736 s pelo Electron, com cache em 3 ms e 6 ms, respectivamente. As amostras de rosto usam um recorte local do exemplo oficial YuNet em quatro vídeos de 6 s. O caso NPC é uma simulação de retrato em interface. Precisão em gameplay real e distinção humano/NPC seguem sem validação.
