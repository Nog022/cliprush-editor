# Estado da implementação

Atualizado em 5 de novembro de 2026. Escopo desta entrega: **Fase 1 — fundação desktop**, com montagem básica adicional para testar novos projetos. As fases seguintes não estão concluídas.

| Fase              | Estado                                          | Resultado                                                                        |
| ----------------- | ----------------------------------------------- | -------------------------------------------------------------------------------- |
| 1 — Desktop       | Implementada e validada no EXE Windows | Electron, SQLite, biblioteca, importação, projetos e previews                    |
| 2 — Editor visual | Base de preview e lista de clipes               | Falta timeline multifaixas, undo/redo, autosave, efeitos, render e fila          |
| 3 — IA e idiomas  | Não implementada                                | Sem chamadas, modelos ou tokens simulados                                        |
| 4 — Animações     | Não implementada como editor                    | Composições animadas antigas continuam no Player                                 |
| 5 — Publicação    | Não implementada                                | Sem OAuth, uploads ou agendamentos                                               |
| 6 — Estabilização | Testes iniciais e EXE sem instalador validado   | Falta teste em máquina limpa, instalador, assinatura e hardening de distribuição |

## Disponível

- Dashboard com projetos reais, pesquisa, biblioteca por canal e renders anteriores no modo de desenvolvimento.
- Dois canais iniciais e criação de canais adicionais com idioma próprio; separação de mídias por canal.
- Criar projeto vertical/horizontal/quadrado, escolher fps/duração/idioma/categoria, salvar, duplicar, arquivar e restaurar.
- SQLite versionado, histórico de 50 revisões e prevenção de salvamento sobre uma revisão desatualizada.
- Seleção múltipla pelo explorador Windows, cópia gerenciada ou referência ao original, SHA-256, deduplicação, metadados, miniaturas e recuperação de referências ausentes.
- Preview das oito composições antigas, incluindo metadados dinâmicos das duas narradas.
- Preview de novos projetos com imagens, vídeos e áudios, montagem básica e edição de início/duração/volume.
- Exportação/importação de pacote de projeto com mídias e canal, sem executar código do pacote.
- Configuração de workspace, protocolo restrito com Range, logs estruturados, isolamento do renderer e funcionamento offline.
- Aplicativo Windows empacotado; nenhum vídeo final foi renderizado por esta implementação.

## Pendências concretas

Não existem timeline avançada, exportação MP4 de novos projetos, thumbnails extraídas de frames, presets de canal, editor de identidade visual, efeitos editáveis, keyframes, transcrição, importação semântica de legendas, tradução, IA, publicação ou agendamento. SRT/VTT podem ser guardados como assets, mas não aplicados ao vídeo. O fechamento com alterações pede decisão; não há autosave periódico. Revisões existem no banco, mas ainda não há tela de restauração.

Miniaturas dependem do suporte do Windows; codecs incompatíveis são reportados. Arquivos ainda não referenciados por clipes não são carregados no Player. A lista de projetos tem paginação; não há virtualização de grandes bibliotecas de mídias nem proxies. Composições antigas são de preview e não são convertidas automaticamente para o formato de clipes.

## Validação

Testes automatizados estão em `tests/desktop`: cinco testes de domínio/persistência e dois fluxos Electron. Cobrem transações, reabertura, revisões concorrentes, validação, traversal, versões futuras, oito previews, imagem/áudio, duplicados, empacotamento, reinício, isolamento do Node, Range, falta de FFprobe, mídia movida, arquivamento/restauração, canais personalizados e pacote inválido. Todos passaram na validação final.

Os dois fluxos passaram também no EXE empacotado, iniciado com diretório de trabalho separado do repositório, em 7,4 segundos na execução final. O segundo fluxo remove FFprobe do PATH e valida o fallback nativo. Os testes de duração estática e metadados portáteis encontraram falhas que foram corrigidas. A rejeição automática de mover um perfil inteiro foi respeitada; apenas dois projetos temporários foram arquivados pela API normal, preservando o perfil e seus arquivos.

O lint original e o lint/TypeScript desktop passaram na versão final. A comparação SHA-256 conferiu **2.070 arquivos preexistentes em `src`, `public/videos` e `out`, com zero alterações ou ausências**. Evidências locais: `out/desktop-preservation-result.json`, `out/desktop-dashboard.png`, `out/desktop-editor.png` e `out/desktop-legacy-preview.png`.

Não declarar os testes de aceite 2–9 completos: eles incluem recursos de fases futuras. O teste 1 tem cobertura de preview/preservação; o teste 10 tem cobertura do EXE da Fase 1, não da plataforma final.

## Arquivos e plano das próximas fases

Novos módulos: `desktop/`, `studio/`, `shared/`, `tests/desktop/`, scripts desktop, configurações TypeScript/Playwright/empacotador e documentação. Alterados: manifestos de dependências, exclusões do TypeScript original, README e regras adicionais em AGENTS. Não houve edição das produções anteriores.

Próximo incremento: formalizar faixas/cenas/comandos tipados, incluir undo/redo e autosave com revisões, extrair o motor de composição por dados, criar worker de render com progresso/cancelamento e validar exportação MP4 de um projeto importado. Só então expandir efeitos, legendas e IA sobre comandos validados. OAuth/publicação entram com contratos e credenciais reais, sem placeholders funcionais.
