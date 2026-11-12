# Usar o editor — Fase 1

1. Abra o executável Windows ou use `npm run desktop:dev`.
2. Escolha o canal na lateral. Os projetos antigos estão no Canal ClipRush.
3. Para ver uma composição antiga, clique no card. O Player tem play/pause, barra de tempo, volume, tela cheia, navegação por quadro e campo para ir a um quadro específico.
4. Clique em **Novo projeto**. Defina nome, formato, fps, duração inicial, idioma e categoria.
5. Clique em **Importar mídia**. O seletor do Windows aceita múltiplos arquivos. Escolha copiar para a biblioteca ou referenciar o original antes de importar.
6. Clique em **Adicionar** nas mídias para montar o preview. Imagens entram com cinco segundos; áudio/vídeo usam a duração detectada. Imagens/vídeos são colocados em sequência e a faixa de áudio começa separadamente. Mais de um áudio é colocado em sequência nessa faixa básica.
7. Ajuste início, duração e volume na lista de montagem. A duração do projeto cresce para acomodar os clipes. A remoção de um clipe não reduz automaticamente o projeto.
8. Use **Salvar projeto**. Ao trocar de projeto/canal ou empacotar, alterações pendentes também são salvas. Ao fechar com alterações, há confirmação nativa para continuar editando ou descartar.

A lista de montagem controla o Player de verdade, mas **não é ainda a timeline multifaixas avançada**. Não há exportação MP4 de novos projetos nesta fase. Os comandos de renderização Remotion anteriores continuam disponíveis para suas composições originais.

## Arquivos

PNG/JPEG/JFIF/WebP, MP4/MOV/WebM/M4V/MKV, MP3/WAV/M4A/AAC/OGG/FLAC e SRT/VTT são aceitos pelo seletor. A extensão não garante que o codec seja decodificável. Falhas aparecem no preview ou na leitura de metadados. Legendas são armazenadas e transportadas; edição e aplicação de SRT/VTT ainda não estão implementadas.

Metadados são lidos com FFprobe quando disponível no PATH. Na ausência dele, o Chromium lê dimensões/duração dos formatos que consegue decodificar. Áudio/vídeo sem duração detectável não é adicionado silenciosamente com uma duração inventada. Miniaturas são geradas pelo Windows quando o formato permite; os demais arquivos recebem identificação por tipo.

Cópias gerenciadas ficam no workspace, separadas por canal e hash. Referências não duplicam o arquivo: se ele for movido, o projeto indicará **Arquivo ausente** ao ser reaberto. Use o botão de localizar para selecionar novamente. Duplicação de projeto compartilha mídias de maneira não destrutiva; não existe exclusão de assets nesta fase.

## Biblioteca e canais

Pesquisa, duplicação, arquivamento e restauração funcionam para novos projetos. Composições antigas permanecem em modo de preview, sem uma conversão automática que poderia perder sua lógica programática. A biblioteca de mídias reúne os assets dos novos projetos do canal selecionado.

Em Configurações é possível criar canais e abrir outro workspace. Abrir outro workspace **não move** o anterior. Para transferir projetos, empacote-os e importe o arquivo `project.cliprush.json` na nova localização. Copie a pasta inteira do pacote, incluindo `media`.
