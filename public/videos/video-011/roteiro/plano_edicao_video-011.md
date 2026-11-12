# CLIPRUSH EDITOR — PLANO DE EDIÇÃO | VIDEO-011

**Objetivo:** releitura com narração, montagem, destaques e identidade próprios, usando como referência o Instagram `Video by leonidaoculta [Dfcj36tDB7h].mp4` (51,57 s). O MP4 do Instagram é APENAS consulta; nenhum frame, áudio, legenda ou marca d'água dele deve integrar o render final.

**Arquivos locais esperados no projeto:**
- `public/videos/video-011/audio/narracao.mp3` — duração REAL da produção.
- `public/videos/video-011/roteiro/roteiro.txt` — conteúdo e ordem narrativa.
- `public/videos/video-011/roteiro/plano_edicao_video-011.md` — este documento (decisões editoriais já tomadas).
- `public/videos/video-011/video-consulta/` — vídeo do amigo, somente para visualização pontual.
- `public/videos/biblioteca/catalogo/gta6/cenas-descritas.json` e `scripts/buscar_cenas_gta6.py` — biblioteca existente.

## REGRAS PRIORITÁRIAS

1. **Narração manda na duração.** Os intervalos abaixo são da **REFERÊNCIA DO INSTAGRAM**, NÃO são os timestamps dos arquivos GTA 6, e NÃO devem ser copiados literalmente para a timeline final. Alinhar o corte à frase correspondente do MP3. Não transcrever o MP3 integralmente se o `roteiro.txt` já fornecer o texto.
2. Procurar primeiro as mídias e composições existentes do `video-011`; depois o catálogo local. Reutilizar os testes já validados, mas puxar os frames finais do MP4 original, nunca do vídeo de consulta nem de um MP4 de teste reencodado, quando o original estiver disponível.
3. Resolver as cenas em um **mapa pequeno** (assunto -> MP4 original -> início/fim no MP4 -> status). Consultar com o script existente; `--limite 3` inicialmente. Expandir sinônimos só quando a busca falhar. Conferir as 1–3 melhores miniaturas/trechos, sem reindexar, sem Gemma/Ollama/PySceneDetect e sem leitura indiscriminada de todos os 491 registros.
4. **Fonte já identificada e confirmada visualmente:** geladeira/foto do cachorro em `public/videos/biblioteca/gta6/videos/gta6-extended.mp4`, janela catalogada `00:07:17.156–00:07:26.200`, cena 55 trecho 3. A composição-teste `teste-biblioteca-011-v002` pode fornecer o método de crop/zoom. A janela de 9,044 s é o *intervalo catalogado*, não necessariamente o recorte final exato.
5. **Porta-malas do carro vermelho:** a versão `teste-porta-malas-011-v001` bateu visualmente com o Instagram. Reaproveitar o código/configuração de origem do teste se estiver no repositório. **MP4 de origem e timestamps desse teste ainda NÃO foram fornecidos aqui** — não os inventar; extrair do código do teste ou buscar novamente.
6. Todos os outros trechos são **candidatos a localizar**, não cenas confirmadas. No caso de ausência, escrever `CENA_NAO_ENCONTRADA` no relatório. Não trocar de assunto silenciosamente só para preencher a montagem.
7. Compôr em 1080 × 1920, 30 FPS, sem barras pretas; preservar rostos, carro e objetos importantes no enquadramento. `OffthreadVideo` com trim/recorte da fonte conforme a API instalada no projeto; usar `Sequence` e animações por frame. Preferir método local já funcional nos testes.
8. Proteger as áreas de interface dos apps: evitar textos essenciais nos ~180 px superiores e ~300 px inferiores. Manter títulos concisos e legíveis; nunca encobrir o detalhe revelado.
9. Estilo ClipRush: recorte vertical cinematográfico, cortes por significado, zooms com intenção e efeitos comedidos. Não incluir mascote, avatar ou elementos de GTA 6 que não estejam pertinentes a esse vídeo. Não copiar legendas/identidade/CTA da referência.

## STORYBOARD VISUAL PRONTO

| Bloco | Tempo no Instagram (APENAS referência) | Momento da narração | Instrução detalhada da edição | Busca local sugerida / status |
|---|---|---|---|---|
| 01A | 00:00–00:02.5 | “O nível de detalhe do GTA 6 é assustador!” | Abrir já com imagem da invasão: mulher de costas no estabelecimento. Push-in suave 1.00→1.14 relativo ao crop vertical, título próprio **“7 DETALHES QUE VOCÊ NÃO VIU”**. Na palavra “assustador”, micro-punch 1.14→1.24 por 5–7 frames, depois recuperar. Nada de logo longo. | `invasão|assalto|restaurante|lanchonete` — PENDENTE |
| 01B | 00:02.5–00:06.8 | “Repara nos NPCs... medo estampado no rosto” | Corte ao homem barbudo de boné sentado, crop centrado no rosto e nos olhos, zoom 1.00→1.40 em ~0.9 s; círculo fino sobre expressão por 0.5 s. Corte rápido ao segundo homem ao fundo, zoom 1.1→1.45, *freeze* opcional 0.25 s somente se não perder a naturalidade. Letreiro **“OLHA A REAÇÃO”**. | `barbudo|boné|homem|pessoas` — PENDENTE |
| 02 | 00:07–00:13.8 | “E olha esse quadro... capa de Vice City” | Começar 0.7 s com cômodo/porta/quadro em contexto. Dar zoom guiado para o **quadro da mulher na parede** (na referência fica alto à direita); trajetória de crop deve seguir o quadro, não o centro da tela. Aproximação 1.0→1.8 e hold ~0.8 s; seta curta/círculo fino + texto **“LEMBRA VICE CITY?”**. Se houver arte de comparação legalmente disponível na pasta local, usar PIP por até 1.5 s; caso contrário, só texto, sem fabricar ou importar a imagem. | `quadro|pintura|pôster|poster|apartamento|quarto` — PENDENTE |
| 03A | 00:14–00:15.8 | “Agora presta atenção nesse carro” | Entrada com traseira do **conversível vermelho/alaranjado** e tampa do porta-malas aberta. Mostrar 0.5–0.8 s de visão geral para o público reconhecer o carro; crop vertical acompanha a traseira. | `porta-malas|conversível|carro|traseira` — CENA VALIDADA NO TESTE v001; recuperar origem/timestamps do código |
| 03B | 00:15.8–00:19.8 | “...marcas de uso...” | Zoom para a **borda superior da tampa/área próxima à abertura do porta-malas**, não para a placa. Crop 1.0→1.6 em ~0.8 s; realce com linha ou contorno de 2 pontos na região observável. Se a fonte não mostrar efetivamente a marca, não simular desgaste; cortar para o melhor fotograma e usar rótulo cauteloso **“REPAROU NESSE DETALHE?”**. Hold ~0.5 s antes do corte. | Idem bloco 03A |
| 04A | 00:20–00:21.5 | “Na geladeira do Jason...” | Plano médio da cozinha rosa, personagem diante da geladeira; 0.6 s de contexto. Crop vertical sem tarjas pretas; acompanhar a geladeira conforme a porta abre. | **CONFIRMADO:** `gta6-extended.mp4` 00:07:17.156–00:07:26.200; teste v002 disponível |
| 04B | 00:21.5–00:26 | “...foto de um cachorro. Será pista de pets?” | Zoom EM ETAPAS: (1) quadro geral da geladeira; (2) porta superior com ímãs e fotos; (3) **pequena foto do cachorro situada na parte inferior direita da porta superior**. Fazer pan à direita/baixo durante o zoom, mantendo a foto central. Usar moldura luminosa fina + texto **“UM CACHORRO?!”**. Segurar a fotografia por 0.8–1.1 s. Frase “pets” é hipótese, não recurso confirmado. Se a imagem perder resolução com crop extremo, reduzir o zoom e realçar com círculo ou PIP do próprio frame original. | Reutilizar crop/zoom do `teste-biblioteca-011-v002`, se existir no repositório |
| 05A | 00:26–00:28.6 | “E a física impressiona: os brincos...” | Mostrar a mulher na iluminação rosa e cortar para close do lado do rosto/orelha. Zoom 1.1→1.45 com foco no **brinco**, pequena seta acompanhando a posição. Se o brinco não se mover perceptivelmente, não animar um movimento falso no objeto. | `brinco|orelha|lucia|mulher|quarto` — PENDENTE |
| 05B | 00:28.6–00:30.8 | “...cordões da roupa...” | Corte para personagem com bandana vermelha e roupa cinza. Aproximar **cordões do moletom na região do peito/pescoço**, não o rosto: 1.0→1.45, seta dupla curta sugerindo balanço observável. | `cordão|cordões|moletom|roupa|bandana` — PENDENTE |
| 05C | 00:30.8–00:35.8 | “...mochila balançam...” | Personagem de costas com camiseta verde **MARCUS**; plano aberto por 0.5 s, zoom 1.1→1.55 na **bolsa/mochila escura pendurada nas costas**. Aplicar tracking/zoom seguindo o movimento real da mochila; contorno discreto 0.7 s; legenda **“FÍSICA EM MOVIMENTO”**. Não balançar artificialmente a mochila com efeitos de tela que ocultem o movimento original. | `mochila|bolsa|costas|homem|rua` — PENDENTE |
| 06 | 00:36–00:39.8 | “O líquido dentro da garrafa de molotov também se mexe!” | Introduzir 0.3–0.5 s de contexto (item/garrafa em mãos) e depois enquadrar **a garrafa na mão do personagem**. Zoom guiado 1.05→1.6, preferencialmente com acompanhamento da mão ao invés de tremor. Setinha sutil para o interior; texto **“OLHA O LÍQUIDO”** por no máximo 1.0 s. Só declarar movimento no visual se fotogramas sucessivos comprovarem. | `molotov|garrafa|líquido|coquetel` — PENDENTE |
| 07A | 00:40–00:42.0 | “Mas o detalhe mais escondido está aqui...” | Apresentar primeiro a **fachada com duas máquinas de vendas**, com zoom leve 1.0→1.15 e pausa curta de curiosidade. Não revelar imediatamente o animal; texto **“VOCÊ VIU?”**. | `máquina|venda|lanches|fachada` — PENDENTE |
| 07B | 00:42.0–00:47.7 | “...ratinho embaixo da máquina!” | Zoom progressivo na **base da máquina de venda preta**, especialmente a faixa de chão abaixo e ligeiramente à esquerda do centro. Etapas: visão da máquina → base → animal pequeno. Circular com traço fino somente se realmente estiver visível; hold de ~1.0 s sobre o animal. Se a fonte for muito baixa resolução, aumentar o tempo de hold e usar inset do próprio fotograma, sem desenho falso de rato. Texto final **“TAVA ESCONDIDO AQUI!”**. | `rato|roedor|máquina|venda` — PENDENTE |
| 08 | 00:47.7–00:51.57 | “Qual desses você nunca tinha visto? Segue o ClipRush...” | CTA original com fundo desfocado de uma cena anterior válida (não usar vídeo do Instagram). Texto central **“QUAL VOCÊ NÃO VIU?”**, abaixo **“SEGUE O CLIPRUSH”**; logo da pasta local somente se disponível. Sem imitar a animação, botão ou marca do criador de referência. | Reaproveitar uma cena já usada ou fundo estático próprio |

**Tratamento de movimento:** os valores 1.00→1.60 são fatores de zoom **adicionais ao enquadramento vertical inicial**, não instruções para distorcer o vídeo até 160% da área total. Ajustar dinamicamente ao material e evitar pixelização. Preferir easing suave; punch de 4–7 frames apenas nos momentos de descoberta; freeze somente se ajudar a leitura.

**Legenda:** não obrigar legendas completas palavra por palavra; preferir legendas curtas orientadas a cada descoberta (máx. 3–5 palavras por cartela), com contraste e sombra discreta. Nenhuma legenda pode cobrir a fotografia do cachorro, o desgaste na tampa, os brincos, a mochila, a garrafa ou o rato.

**Áudio/FX:** voz limpa em primeiro plano; trilha baixa caso já haja recurso local liberado; 3–5 efeitos sonoros pontuais (início, quadro, foto do cachorro, rato, CTA), evitando whoosh em todo corte. Não buscar nem instalar serviços pagos ou baixar trilhas sem autorização.

## SELEÇÃO E ECONOMIA DE TOKENS — INSTRUÇÕES PARA CODEX

1. Ler somente `AGENTS.md`, `roteiro/roteiro.txt`, este plano e **as partes essenciais** do projeto relacionadas à composição/timeline. Não reler vídeos antigos do projeto para entender o estilo quando os componentes reutilizáveis já definem isso.
2. Verificar se `teste-biblioteca-011-v002` e `teste-porta-malas-011-v001` possuem composições-fonte no repo. Copiar/adaptar o código pertinente, sem reencodar MP4 de teste para o render final.
3. Consolidar uma lista de 7 assuntos / até 12 tomadas. Executar o script `buscar_cenas_gta6.py` com no máximo 3 candidatos por consulta inicialmente; registrar **somente** caminho, tempo, miniatura e uma frase de descrição no mapa. Confirmar candidato com 1–3 miniaturas ou 2–4 segundos do original. O MP4 do Instagram só poderá ser consultado no ponto específico quando o plano deixar dúvida.
4. Criar `src/videos/video-011/` usando organização e componentes atuais. Criar um **mapa persistente de seleção** com assunto, `src`, `sourceStartSec`, `sourceEndSec`, status, observação. Assim novos ajustes não reiniciam pesquisas.
5. Para sincronizar, usar as **âncoras semânticas** do roteiro: “NPCs”, “quadro”, “carro”, “geladeira”, “brincos/cordões/mochila”, “garrafa”, “máquina/rato”, “segue”. A duração é a do MP3; não confiar que o áudio novo tenha exatamente 51,57 s. Se precisar ajustar os tempos, ouvir só pequenas janelas em torno das âncoras; não transcrever tudo novamente.
6. Montar composição, gerar **preview rápido de poucos frames-chave** para inspecionar enquadramento e legibilidade e então **um render final único**; evitar ciclos repetidos de renderização completa. Usar cache e reutilizar fontes locais.
7. Validação final: source MP4 e timestamps de cada cena; enquadramento sem bordas pretas; zoom no objeto descrito; sincronização com a frase; sem material do Instagram no render; áudio não cortado; produções anteriores intactas.

## COMO REPORTAR, EM POUCAS LINHAS

- Duração/FPS/resolução do MP4 final + caminho.
- Cenas localizadas: `assunto — fonte — início/fim` (compacto).
- Cenas ausentes ou não confirmadas (não inventar).
- Arquivos alterados e validações executadas.

**Atenção:** os dois testes visuais provam a recuperação e renderização de cenas específicas, mas não demonstram sozinhos que todas as 7 cenas serão encontradas automaticamente. O vídeo completo deve ser validado de verdade.
