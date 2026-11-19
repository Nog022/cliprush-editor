# Spec: geração sincronizada sem preparação manual

**Classe:** G | **Alvo:** ProductionService e contrato editorial | **Estado:** implementada; ASR real validado, interface/Codex real pendentes

## Resultado esperado
Preparar alinhamento local antes do planejamento mesmo sem legendas. Gerar blocos com tempos medidos, preservar a narração e compilar cortes reais no schema existente. Limitações opcionais têm resolução explícita e não substituem falhas críticas.

## Entradas e escopo
Reutilizar ProductionService, timedText, narrationClips, applyComposition e o faster-whisper já instalado com modelos locais. Alterar somente a orquestração, contrato editorial, adaptador de transcrição, empacotamento do worker e testes associados. Sem downloads, novas dependências, alterações em produções ou render longo.

## Invariantes e aceitação
- Cache privado por hash do áudio, idioma e roteiro; timestamps da origem convertidos por posição/trim da narração.
- Texto do roteiro só substitui a transcrição quando as palavras correspondem; nunca distribuir duração por texto.
- Blocos validados contra alinhamento mesmo sem captions; cobertura, trims e requisitos continuam obrigatórios.
- Efeitos incompatíveis opcionais são adaptados ou omitidos explicitamente; erros essenciais continuam bloqueantes.
- Inspecionar imagem antes de afirmar detalhes; omitir destaque não confirmado e registrar limitação.
- Testar falta de SRT, cache, trims/offsets, cortes sincronizados, limitações opcionais e falhas essenciais.

## Plano
1. Adaptador local com cache e worker reutilizando faster-whisper; testes com executor controlado.
2. Integrar preparação e blocos ao ProductionService; validar plano e limitações no compilador.
3. Typecheck, lint e testes desktop direcionados, sem transcrição real nem render.

## Riscos e rollback
Python/faster-whisper/modelo local são requisitos de execução quando não há alinhamento fornecido. ASR produz medições automáticas sujeitas a erro; não afirmar revisão humana. Cancelamento e falha não promovem o candidato. Reverter apenas este delta preserva banco, mídias e trabalho preexistente. Após dois reparos sem avanço, investigar a causa.

## Verificação da entrega inicial
- `npm.cmd run desktop:typecheck`: passou.
- ESLint nos quatro arquivos TypeScript alterados: passou.
- `npm.cmd run desktop:test`: 13 testes passaram, incluindo ProductionService sem SRT/sem captions, cache, preservação de trim/posição/volume, limitações opcionais, falhas essenciais e cortes falsos.
- `python -B tests/desktop/narration-worker.test.py`: 3 testes passaram com backend controlado, sem carregar modelo. Roteiro correspondente preserva texto e tempos medidos; roteiro divergente não altera fala; modelo ausente falha sem download.
- Python e faster-whisper detectados; diretórios de cache small/base/large-v3 existentes. Não houve inferência real, chamada real ao Codex, teste da interface, instalação ou render nesta tarefa.
- Até cinco imagens importadas são anexadas por turno para inspeção. Destaques exigem imagem anexada e confirmação explícita do planejador; não há verificação semântica independente nem extração automática de frames de vídeo. Destaques não confirmados são removidos; cobertura essencial continua validada.

## Seleção do Python do Whisper
`CLIPRUSH_WHISPER_PYTHON` permite indicar explicitamente o executável (sem argumentos). Sem configuração, verificar o Python do PATH e as instalações em `%LOCALAPPDATA%/Programs/Python/Python*`, priorizando 3.12 entre as instalações descobertas. Cada candidato precisa importar o faster-whisper e decodificar um WAV mínimo em memória. Uma configuração explícita inválida falha com diagnóstico, sem substituição silenciosa. Nenhuma ativação ou alteração da `.venv-indexacao` é necessária.

Validação real: Python 3.12.10, faster-whisper 1.2.1 e modelo `small` do cache transcreveram 8 segundos da narração do vídeo 021 pelo `prepareNarration` e worker reais, com o PATH apontando primeiro para `.venv-indexacao`. Resultado: 26 palavras temporizadas entre 0 e 7,98 s; nenhum erro de carregamento do modelo. Evidência em `out/whisper-python-validation-20261115-01/result.json`. O Python 3.13 global importa Whisper mas apresenta incompatibilidade PyAV (`metadata_errors`), agora detectada pela prova de decodificação. A venv de indexação permaneceu em 3.13.3 sem faster-whisper e com `pyvenv.cfg` inalterado. Sem instalação, download, render ou alteração das mídias originais. Resta verificar a geração pela interface após reconstruir/reiniciar o desktop.

Após a correção do seletor: typecheck e lint passaram; 15 testes desktop e 4 testes Python passaram. Os testes incluem descoberta com PATH incompatível, configuração explícita, cancelamento e diagnóstico por modelo em falhas de carregamento.
