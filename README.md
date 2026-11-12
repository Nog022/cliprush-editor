# Upgrade ClipRush — edição investigativa e retenção visual

Pacote aditivo inspirado em **três vídeos enviados** (não uma cópia visual do canal de referência). Não altera vídeos existentes. O projeto real deve ser revisado pelo Codex antes de integrar os novos componentes.

## Instalação segura na pasta `cliprush-editor`

1. **Faça backup ou commit** de seus arquivos locais.
2. Extraia este pacote **na raiz do projeto `cliprush-editor`**, preservando a estrutura. Os arquivos `AGENTS.md` existentes NÃO vêm neste ZIP e não devem ser substituídos.
3. Rode `python instalar_retencao_cliprush.py` para simular a alteração de `AGENTS.md` e `PROMPT_EDICAO_CLIPRUSH.md`.
4. Rode `python instalar_retencao_cliprush.py --apply` para inserir os novos blocos com backups. Reexecutar substitui o bloco inserido, sem duplicá-lo.
5. No VS Code Codex, cole `prompts/CODEX_INSTALAR_EFEITOS.md`. Depois, para cada novo vídeo, use `prompts/CODEX_PROXIMO_VIDEO.md` trocando `video-XXX`.

## Arquivos

- `skills/cliprush-retencao-visual/SKILL.md`: regras permanentes e critérios de qualidade.
- `docs/ANALISE_LEONIDA_REFERENCIA.md`: auditoria e timestamps dos 3 MP4.
- `docs/REGRAS_AGENTS_PARA_INSERIR.md`: adendo idempotente para seu AGENTS.
- `docs/PROMPT_EDICAO_ADENDO.md`: adendo para o guia criativo.
- `src/cliprush-retention/RetentionEffects.tsx`: componentes de referência sem integração forçada.
- `prompts/`: comandos curtos para instalar, criar vídeo, corrigir trecho e revisar.
- `templates/cena-retencao.exemplo.json`: exemplo ilustrativo, NÃO timestamp verificado do projeto.

## O que não foi possível fazer daqui

Seu diretório local `cliprush-editor` não está montado. O patch foi preparado para ser executado **no seu computador**; ele ainda não alterou seus AGENTS locais. A atualização da skill no plugin ChatGPT é uma operação separada.
