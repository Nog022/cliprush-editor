# Instruções para produções Remotion (`src/videos/`)

- Remotion 4, React 19 e TypeScript estrito. Criar nova produção em `src/videos/video-NNN/`; registrar composição com ID único em `src/Root.tsx`. Não tocar outras produções nem `MyComp`.
- Mídias da produção: `public/videos/video-NNN/`; usar `staticFile('videos/...')` para mídia em `public/`, inclusive da biblioteca global. Nunca inserir caminho absoluto do Windows em composição.
- Vertical por padrão: 1080×1920, 30fps; duração derivada do áudio real, não limite inventado. Usar `useCurrentFrame`, `useVideoConfig`, `interpolate`, `spring`; evitar animações dependentes de relógio e aleatoriedade não determinística.
- **Qualidade editorial:** gancho claro; cenas visualmente relacionadas à fala; zoom na evidência; transições coerentes; boa leitura no celular; variação de B-roll sem repetir trechos para preencher. Evitar efeitos gratuitos ou textos cobrindo detalhes.
- Narração pronta (humana ou IA) não deve ser refeita para corrigir montagem. Sincronizar pela duração/pausas reais e roteiro disponível. Não retranscrever tudo quando roteiro/timestamps já existirem.
- Priorizar mídia de `video-NNN` e depois biblioteca. Consultar catálogo de GTA VI só se assunto justificar. Descrições automáticas de frames são pistas, não provas: validar apenas cenas selecionadas.
- Nunca reindexar biblioteca durante edição comum. Não executar rotinas de Ollama, Gemma, PySceneDetect ou conversão em lote sem solicitação expressa.
- Para produção completa, invocar skill `cliprush-edicao`; para busca de cenas, `cliprush-catalogo`; para mídia, `cliprush-midia`; para revisão final, `cliprush-validacao`. Abrir `PROMPT_EDICAO_CLIPRUSH.md` apenas para decisões criativas não cobertas aqui e só nos trechos necessários.
- Reutilizar componentes visuais comprovados. Manter ritmo cinematográfico e imagens corretas mesmo que isso aumente justificadamente a execução.
- Adequar a linguagem visual ao assunto; não impor GTA, avatar ou personagem recorrente sem pedido. Se roteiro e narração divergirem, o áudio final prevalece; sem roteiro, reutilizar transcrição disponível ou transcrever só o necessário, sem inventar conteúdo.
- Antes de render completo autorizado, validar visualmente um frame representativo de cada bloco da timeline. Lint, TypeScript e decodificação não provam que a mídia aparece. Não substituir cenas importantes por cartelas sem informar a limitação; buscar alternativas pertinentes antes de desistir da biblioteca.
