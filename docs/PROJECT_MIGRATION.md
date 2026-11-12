# Projetos, backups e migração

## Preservação das produções antigas

`src/Root.tsx`, `src/Composition.tsx`, `src/videos`, `src/components`, `public/videos`, skills oficiais e outputs anteriores não são migrados nem reescritos. As alterações locais já existentes continuam presentes. A nova biblioteca inclui seus registros via adaptador de leitura.

O build Windows inclui cópias dos assets antigos em `resources/legacy-public/videos` e incorpora o código compilado das composições. O executável não precisa localizar o repositório para reproduzi-las. Os renders anteriores em `out/video-NNN` são listados somente no modo de desenvolvimento; não são copiados automaticamente para a distribuição.

## Novo formato

`schemaVersion: 1` inclui identificação, revisão, canal, idioma/categoria, datas, formato, fps, duração, assets e clipes. Cada clipe referencia um asset existente. Posições e durações são frames inteiros, volume é limitado e IDs são únicos. Versões futuras desconhecidas são rejeitadas sem modificar o arquivo original.

O SQLite contém `channels`, `projects` e `revisions`. A migração inicial cria o esquema em transação; antes dela há backup `.before-v1-*.bak`. Futuras migrações deverão fazer checkpoint WAL e backup consistente antes de alterar o esquema. Um banco com `user_version` superior é recusado, nunca rebaixado.

Até 50 revisões anteriores por projeto são mantidas em `revisions`; a restauração visual ainda é pendência. Não confundir essas revisões com backup externo do workspace.

## Backup manual

- **Empacotar projeto** gera uma nova pasta com nome único, `project.cliprush.json`, identificação do canal e cópias de todas as mídias, inclusive as referenciadas externamente. O manifesto é gravado por último. Nenhum pacote anterior é substituído.
- **Importar projeto** verifica tamanho do manifesto, esquema, caminhos e hashes. Cria um novo ID, preserva a montagem e copia as mídias para o canal correspondente. Canais personalizados ausentes são recriados a partir dos dados do pacote.
- Para backup completo de todos os canais e revisões, feche o aplicativo e copie **a pasta inteira do workspace**, incluindo os arquivos SQLite/WAL se presentes. Não copie apenas o arquivo `.sqlite` com o aplicativo aberto.

O workspace padrão fica sob `%APPDATA%/ClipRush Editor Studio/workspace`. `CLIPRUSH_DATA_HOME` pode definir o diretório de perfil antes de iniciar, inclusive no executável. Em Configurações, Abrir outro workspace salva a preferência e cria/abre `ClipRush Studio Data` dentro da pasta escolhida. O anterior permanece intacto.

Arquivos ausentes impedem um pacote completo. Cópias parciais de uma exportação interrompida não contêm manifesto válido e podem ser identificadas pelo usuário; nenhuma limpeza destrutiva é automática.
