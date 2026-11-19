# Spec: restaurar edição ClipRush do vídeo atual

**Classe:** M | **Alvo:** projeto `97a2e1c9-81f2-415c-8933-e3664795b310` e compositor compartilhado | **Estado:** execução autorizada

## Resultado esperado
MP4 novo de 1080×1920, 30 FPS, duração determinada pela narração existente (47,92 s). Gameplay ocupa o quadro vertical com recorte uniforme orientado ao sujeito, movimentos suaves, cortes narrativos e CTA sobreposto à ação.

## Entradas disponíveis
- Projeto original privado salvo em `out/correction-misterios/project-original.json`; revisão 5 e mídias preservadas.
- Biblioteca: os dois clipes originais de Jason/caranguejo e Lúcia/nave.
- Áudio e alinhamento de palavras já gerados, sem nova chamada a ElevenLabs/Whisper.
- Referências originais: Shots das produções 030/032/034 (`cover`, foco, OffthreadVideo, zoom suave), `src/components/NeonCaptions.tsx` (legendas reutilizáveis) e `coverRegion` (recorte uniforme com foco e limites).

## Diagnóstico comprovado
- MP4 anterior decodifica integralmente: 1438 frames; nenhum congelamento >=350 ms nas fontes.
- Timeline anterior interrompe gameplay entre 25,433 e 27,233 s por cartela escura de CTA; detector encontra 1,3 s congelado nessa janela. Não há evidência de falha de codec nas fontes/MP4 nem de falha exclusiva do player.
- Compositor genérico força `objectFit: contain` e legendas genéricas; falta o tratamento original ClipRush.
- Cortes alternavam sala/teto repetidamente e voltavam no tempo durante a ação, por decisões do plano.

## Escopo
**Fazer:** preset narrado explícito para este projeto, enquadramento por clipe validado, render e player pelo mesmo componente, reutilizar geometria/legendas e RenderService. Corrigir timeline de forma determinística; CTA sobre gameplay contínua. Exportar nome único, validar antes de salvar a revisão real.

**Preservar:** presets live/genérico, demais projetos, Root/MyComp, biblioteca, áudio, configurações, exportações anteriores. Testes usam workspace isolado; sem downloads/reindexação/geração de áudio.

## Aceitação objetiva
- [x] Enquadramento cobre vertical sem distorção, barras excessivas, mídia fora de limites ou lacunas.
- [x] Áudio original idêntico; timestamps de palavras em cache; CTA sobre a ação.
- [x] Typecheck e testes de preservação dos formatos/câmera/limites temporais.
- [x] Quadros representativos dos 13 blocos, abertura e CTA conferidos antes do MP4; limites temporais verificados pelo preset.
- [x] MP4 completo com duração/FPS/áudio esperados; decodificação integral; ausência de preto/congelamento involuntário.
- [x] Reprodução automatizada da timeline real e do CTA; continuidade de quadros no MP4.

## Riscos e incertezas
Recorte extremo pode esconder personagem e criatura simultaneamente: ajustar centros de câmera por trecho após previews. Material de teto é curto; usar câmera lenta moderada com fonte de aproximadamente 60 FPS, sem congelar/repetir o teto para preencher a fala. O player do usuário não está conectado nesta conversa; validar o mesmo componente em sessão local isolada.

## Resultado e causa raiz

Entrega: `deliveries/cliprush-caranguejo-nave-corrigido-12fde000.mp4`.

- H.264/AAC, 1080×1920, 30 FPS, 1438 quadros, 47,936 s, 52.444.794 bytes; qualidade high (CRF 18) do RenderService existente.
- SHA256: `42963824f6e1ed2fbc22c21b2aceea80c41e7f007afcbecc1cef0598b95a389f`.
- Projeto real salvo na revisão 6 e render concluído `12fde000-c9f3-4336-bc56-ffa7ce4564c9` registrado no histórico. Readback confirmou assets e clipe de narração idênticos aos originais.
- Um render completo corrigido, sem nova geração de áudio ou transcrição. MP4 anterior preservado.

A pausa perceptível no MP4 anterior vinha da cartela de CTA que interrompia a gameplay. O enquadramento pequeno e as legendas genéricas vinham do compositor sem o preset ClipRush. As alternâncias de origem sala/teto eram decisões de montagem, substituídas por uma sequência de eventos com câmera lenta moderada e pontos de câmera observados.

No desktop, havia também um contador de timeline que permanecia em zero mesmo durante a reprodução: o efeito tentava assinar `frameupdate` antes de o Player disponibilizar sua ref, sem repetir a assinatura quando ela chegava. A assinatura agora acompanha a atribuição/desatribuição da ref. A CSP foi ajustada somente em `media-src` para permitir o áudio de sincronização embutido do Remotion; scripts e rede permanecem restritos.

A investigação byte a byte e a reprodução nativa comprovaram que o protocolo de leitura/Range original funciona para os três arquivos. Nenhuma mudança de implementação de streaming foi mantida.

## Validações executadas

- `desktop:typecheck`, ESLint dos arquivos afetados e `desktop:test`: 32 testes passaram.
- E2E persistente `narrated-preview.e2e.ts`: passou, com seek de 9 segundos, áudio, câmera e playbackRate em mídia sintética com GOP longo.
- E2E da timeline real: passou em 49,2 s; 231 amostras, chegou ao quadro 1431 antes da pausa de conferência do CTA, sem pausas detectadas nas amostras de aproximadamente 200 ms. A conferência após seek ao CTA também passou. Os primeiros testes ficaram sujeitos ao contador defeituoso; os logs internos demonstraram a reprodução, permitindo localizar a causa sem alterar codecs ou contornar o sincronismo.
- Fontes e requisições Range iniciais/intermediárias/finais: bytes iguais aos arquivos originais; reprodução e seeks nativos de ambos os MP4 e do MP3 passaram.
- `validateMp4` do pipeline: metadados e decodificação integral de vídeo/áudio aprovados.
- FFmpeg `blackdetect` e `freezedetect`: nenhum evento no MP4 final; outro passe limitado à região central da gameplay também não detectou congelamento >=350 ms.
- Hash do MP3 original preservado; correlação do áudio final com a narração original a deslocamento zero: 0,999981955 (decodificação mono a 8 kHz). Os 16 ms adicionais do contêiner correspondem ao fechamento de quadros/áudio do encoder.
- Previews dos blocos e quadros finais de ataque, CTA e figura no feixe conferidos visualmente. Cópia da entrega verificada por hash contra a saída efetivamente validada do render.
- Bundle desktop de render sincronizado com a composição final; UI e processo principal compilados.

### Limite da validação geral

Dois testes de `workspace.e2e.ts` falharam em verificações de imagens: carregamento em composições legadas (linha 140) e importação de referência sem FFprobe (linha 327). Não foi certificado sucesso da suíte E2E inteira. Esses testes, suas fixtures e as produções legadas não foram modificados para satisfazer a edição atual. A reprodução e exportação deste vídeo passaram nas validações específicas acima.

## Arquivos alterados nesta correção

- `studio/ProjectComposition.tsx`: rota opt-in do preset narrado, overlays sobre gameplay e pré-carregamento de cortes.
- `studio/ClipRushNarrated.tsx`: composição cinematográfica por clipe, com `OffthreadVideo`, geometria existente, CTA sobreposto e `NeonCaptions` reutilizado.
- `studio/Preview.tsx`: assinatura de eventos na atribuição da ref, com limpeza ao substituir/desmontar o Player.
- `src/components/NeonCaptions.tsx`: espaçamento entre tokens e amplitude de destaque para evitar palavras encostadas.
- `shared/narrated-preset.ts`, `shared/model.ts`, `shared/validation.ts`, `shared/production.ts`: preset explícito, câmera, velocidade, preservação de campos e validação da duração consumida na fonte.
- `desktop/render.ts`: validação do preset e opção interna de salvar previews da validação existente.
- `desktop/protocol.ts`: `data:` permitido somente como mídia pela CSP.
- `tests/desktop/narrated-preset.test.ts`, `tests/desktop/narrated-preview.e2e.ts`, `tests/desktop/core.test.ts`: regressões de formato, limites e reprodução.
- Esta spec. Artefatos privados e adaptadores temporários de controle ficam em `out/correction-misterios/`; não constituem novos serviços de produção.

As mídias, áudio, configurações de geração, demais projetos e exportações anteriores permanecem preservados. O workspace real recebeu somente a revisão do projeto atual e o registro do render comprovado, com backups privados do projeto e do histórico anteriores.
