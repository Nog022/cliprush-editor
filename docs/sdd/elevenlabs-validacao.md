# ElevenLabs: implementação e validação

## Fluxo entregue
No painel de produção, revisar **Roteiro para narração**, usar **Testar voz Augusto Norte** para ouvir uma frase curta, ativar **MP4 automático** quando desejado e clicar **Aprovar roteiro e gerar vídeo**. Texto vazio mantém o fluxo anterior de áudio importado. A narração gerada passa pelo `prepareAsset`, `prepareNarration`, compilador editorial e `RenderService` existentes. Seleção explícita do áudio ativo evita reinserção implícita de narrações anteriores, preservadas na biblioteca. Restaurar produção reativa o áudio anterior.

O desktop auditado não possuía outro sintetizador TTS: seu fluxo era de áudio importado. Esse áudio é o fallback quando ElevenLabs falha; sem narração prévia a produção para com erro. Cancelamentos não usam fallback. Seleção de cenas e algoritmo de montagem não foram alterados.

## Credenciais e formato
`.env.local` é lido no main apenas em desenvolvimento; está ignorado e não está rastreado no Git. Distribuição não lê a chave do ambiente do projeto: **Importar credenciais ElevenLabs** abre diálogo nativo e grava apenas as três variáveis ElevenLabs em envelope `safeStorage` no `userData`. A chave nunca retorna pelo IPC. Sem armazenamento seguro, a importação falha sem gravar em texto puro.

POST oficial `/v1/text-to-speech/{voice_id}`, `eleven_v4`, `mp3_44100_128`. A voz configurada foi confirmada como Augusto Norte pela API. Preserva stability e similarity_boost consultados na voz e clone_strength quando informado. Style, speed e speaker boost não são enviados porque v4 não os suporta, conforme a [referência oficial de configurações](https://github.com/elevenlabs/skills/blob/main/text-to-speech/references/voice-settings.md). A chave precisa de Text to Speech: Acesso e Vozes: Ler.

Cache no workspace privado `production/speech`: SHA-256 por texto exato, voz, modelo, configurações efetivas e formato; integridade do MP3 por hash; deduplicação concorrente; marcador persistente antes do POST. Uma interrupção de resultado incerto exige conferir o histórico ElevenLabs antes de remover o `.pending` correspondente. Não há repetição automática de POST pago.

## Resultados reais em 19/11/2026
- Geração remota curta bem-sucedida após atualizar permissões: **4,880 s**, MP3, **44.100 Hz**, mono. Decodificação integral com FFmpeg passou. Chamadas seguintes usaram cache, sem novo POST de síntese.
- Áudio: `out/elevenlabs-smoke/0815876f81bd52fa7cae8d5bb148f04417d8976ae418a8529b1bd9483dd00a8f.mp3`; evidência: `out/elevenlabs-smoke/validation.json`.
- Pipeline real em workspace isolado: áudio gerado → importação → Whisper small local (sem download) → texto confirmado → 3 legendas medidas → compilação editorial → render automático. Apenas a resposta de planejamento Codex foi controlada pela fixture; importação, alinhamento e render usaram as implementações reais.
- MP4 diagnóstico: `out/elevenlabs-pipeline-ba4e9323-d81f-43d1-b7cb-8d73f34835d8/exports/ece6fb93-68e4-4157-9c5a-008a90cbbcbd-01a7316d-ca22-40e9-8a22-6b16f35b4aa6.mp4`: **4,900 s**, **147 frames**, **540×960**, H.264 + AAC. Diferença de 20 ms corresponde ao arredondamento para 30 FPS. Decodificação integral passou; frame em 1,4 s confirmou legenda visível.
- `desktop:lint` (inclui typecheck) e **26 testes** passaram: contrato, cache, corrupção, concorrência, erros, cancelamento, fallback, seleção de áudio, restauração e regressões existentes.
- E2E Electron em `CLIPRUSH_DATA_HOME` temporário passou: importação nativa, envelope criptografado sem chave em claro, botão de teste, decodificação no player, cache, persistência do roteiro e erro de permissão sem segredo. API simulada nesse teste, sem consumo de créditos. Execução fora do sandbox foi necessária pelo ACL do binário Electron local; nenhum ACL ou configuração de segurança do app foi alterado.
- Varredura dos **1.910 arquivos** dos bundles desktop/UI/render: **zero ocorrências da chave real** e nenhum arquivo `.env`. Empacotamento exclui `**/.env*`; não foi gerado instalador.

## Limitação existente no build completo
`npm run desktop:build` parou ao copiar `public/templates/corte-live`, pasta ausente no workspace. Main/preload/UI e bundle Remotion foram produzidos; os bundles main/UI foram atualizados diretamente com esbuild para o E2E. A integração foi validada, mas o build completo e a distribuição permanecem dependentes da restauração desse material do preset. Nenhuma arte ausente foi inventada ou removida.

## Repetição dos testes explícitos
`node scripts/test-elevenlabs.mjs` executa o smoke remoto curto (usa cache quando válido). `node scripts/verify-elevenlabs-security.mjs` verifica Git e bundles sem imprimir a chave. `tests/desktop/elevenlabs-pipeline.ts` é fixture opt-in para o MP3 do smoke, não é executada pelos testes de rotina. Dados reais de usuário e vídeos anteriores não foram alterados.
