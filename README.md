# ClipRush Editor Studio

## Executar localmente

Use Node.js 22 ou superior para executar também os testes SQLite. Após clonar o repositório, execute na pasta do projeto.

```powershell
npm install
npm run desktop:dev
```

O comando compila a interface e o bundle Remotion e abre o aplicativo Electron. Nas próximas aberturas, `npm run desktop:start` reutiliza o build. Recompile após atualizar o código.

## Produção pela interface

1. Crie um projeto e escolha formato, FPS, duração, idioma e categoria.
2. Importe mídia pelo Editor ou pela Biblioteca. Escolha copiar ou referenciar o original e informe a categoria. A Biblioteca e o Editor permitem reutilizar arquivos do mesmo canal.
3. Ajuste início, duração, volume e timestamp de origem na montagem. A busca do catálogo GTA 6 reutiliza `scripts/buscar_cenas_gta6.py` e retorna até cinco candidatos.
4. Em **Instruções de geração**, escreva o prompt e anexe roteiros TXT/MD ou storyboards JSON em **Referências e conexão**. Os arquivos anexados ficam salvos no projeto.
5. Use **Entrar no Codex** para autenticar no navegador oficial. **Localizar Codex** permite selecionar o executável quando a descoberta automática falhar. Os seletores usam os modelos e esforços retornados pelo app-server. O modelo configurado é utilizado como padrão e Médio é escolhido quando oferecido. A seleção fica salva no projeto e serve de preferência para novos projetos do workspace.
6. Clique em **Gerar vídeo**. O aplicativo salva o projeto, continua sua sessão, valida os dados e renderiza quadros de cada bloco antes de salvar a composição. Uma falha de validação permite uma tentativa de reparo. O prompt seguinte pode editar o resultado. **Restaurar produção anterior** recupera a montagem anterior em uma nova revisão.
7. Marque **MP4 automático** ou use **Exportar MP4**. A configuração MP4 oferece resolução, FPS, qualidade, áudio e legendas. A interface acompanha progresso, cancelamento, reprodução e localização do arquivo final. Cada exportação recebe um nome exclusivo.

Projetos, instruções, referências, histórico de produção e exportações ficam no workspace privado do aplicativo. **Empacotar projeto** transporta as mídias e referências para outro computador. Copie a pasta inteira do pacote e use **Importar projeto**. Arquivos referenciados podem ser localizados novamente pelo botão de recuperação da mídia.

## Configuração externa

- Instale o [Codex CLI oficial](https://developers.openai.com/codex/quickstart/) e autentique pela interface. A integração usa o [protocolo oficial app-server](https://learn.chatgpt.com/docs/app-server) por stdio. Credenciais são gerenciadas pelo Codex. O catálogo de modelos retornado pode exigir confirmação de acesso durante a primeira geração.
- Para renderizar, disponibilize Google Chrome ou o navegador gerenciado pelo Remotion. `CLIPRUSH_BROWSER` permite indicar um executável existente. `CLIPRUSH_CODEX_BINARY` permite indicar o executável Codex.
- Python é necessário para a busca do catálogo existente. FFprobe é opcional para metadados de importação. Restaure as mídias grandes e o catálogo nos caminhos relativos originais para recuperar as produções antigas.
- `CLIPRUSH_DATA_HOME` seleciona um perfil independente. Os testes Electron utilizam diretórios descartáveis dentro de `out/`.

## Validação

```powershell
npm run desktop:typecheck
npm run desktop:lint
npm run desktop:test
npm run desktop:build
npm run desktop:e2e
npm run lint
npm run build
```

O teste `production.e2e.ts` cria suas próprias mídias, testa pacote, recuperação de referência, ausência de Codex, render e cancelamento. O teste `codex-live.e2e.ts` usa autenticação e cota reais quando `CLIPRUSH_TEST_LIVE_CODEX=1`. Os testes antigos requerem seus arquivos originais de mídia.

## Alcance desta implementação

A geração produz dados tipados de cenas, clipes, cortes, fade, zoom, formas, textos e legendas, executados pelo mesmo componente Remotion no Player e na exportação. Efeitos adicionais exigem ampliar esse motor. A execução validada utiliza o checkout local e `desktop:dev`. A distribuição empacotada dos novos serviços precisa de validação própria.

O acesso remoto permanece pendente. A interface atual utiliza IPC Electron com origem restrita e depende de um serviço autenticado adicional para uso por outro dispositivo.

---

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
