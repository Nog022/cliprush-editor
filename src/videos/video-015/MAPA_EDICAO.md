# Video-015 — mapa de edição ajustado ao áudio aprovado

Observado: A no catálogo, cena 155; B encontrado pelo nome real na biblioteca, ainda ausente do JSON. Ambas as fontes a 30 fps. OUT exclusivo: A 53 frames; B 44 frames. Narração completa de 39,706 s. Os pontos de fala vêm de alinhamento forçado do texto aprovado, com modelo local, sem retranscrição.

| Início–fim | Fala / objetivo | Asset / origem | Alvo x/y | Prova / efeito principal | Legenda | Percepção / risco e checagem |
|---|---|---|---|---|---|---|
| 0–1,10 | Mudou a animação? / gancho | A, 17:24:15 + fragmento | 0,45 / 0,64 | Movimento real já no frame zero | Narração em blocos curtos | Nenhuma afirmação de correção |
| 0,90–1,50 | Mortal do Jason / contraste inicial | B, 05:14 + fragmento | 0,40 / 0,53 | Match cut de postura, dissolvência de 6f | Texto aprovado | Não substituir a apresentação integral |
| 1,50–3,90 | GTA 6 / estabelecer lugar | Trailer 2, 06:04 + 58f, 0,80×, ilha | 0,50 / 0,50 | Costa, plano inédito | Texto aprovado | Fonte contextual identificada |
| 3,90–5,40 | Vídeo estendido / contexto aquático | Estendido, 17:10:27 + 1,5s | 0,50 / 0,50 | Navegação real | Texto aprovado | Não mostrar outro salto |
| 5,40–7,1667 | Jason pula na água / apresentação A | A exato, 53f | 0,45 / 0,66 | Execução completa, 1×, sem corte | Texto aprovado | Corpo, píer e entrada na água visíveis |
| 7,1667–9,00 | Chamou atenção / contexto | Estendido, 17:26:01 + 1,833s | 0,50 / 0,50 | Jet ski, take distinto | Texto aprovado | Não repetir o salto |
| 9,00–11,45 | Motivos certos / ambientação | Estendido, 18:29:15 + 2,45s | 0,50 / 0,50 | Praia, take distinto | Texto aprovado | Sem falsos comentários ou prova inventada |
| 11,45–14,333 | Jogadores / preparar detalhe | Estendido, 17:17:02 + 80f, 0,90× | 0,50 / 0,50 | Mergulho subaquático, take distinto | Texto aprovado | Contexto aquático, sem simular crítica documentada |
| 14,333–17,20 | Começa a girar / explicar | A exato, replay único 0,75× | saída do apoio 0,47 / 0,91 | Zoom 1,17×, um marcador por 0,8s, pausa final identificada | Texto aprovado | ≥0,6s sem marcador; não inverter quadros |
| 17,20–20,80 | Outro trailer / contexto de água | Estendido, 26:13:25 + 3,42s, 0,95× | 0,50 / 0,50 | Barco na costa, take distinto | Texto aprovado | B-roll, não alegar que vem de B |
| 20,80–22,2667 | Fazendo um mortal / apresentação B | B exato, 44f | 0,40 / 0,53 | Execução completa, 1× | Texto aprovado | Preservar altura original, sem corte adicional de mãos/pés |
| 22,2667–23,70 | Natural e fluido / costa | Trailer 2, 08:04 + 1,433s | 0,50 / 0,50 | Casa costeira, take distinto | Texto aprovado | Não reiniciar B |
| 23,70–26,20 | Diferença / comparação principal | A + B exatos | A 0,45/0,66; B 0,40/0,53 | A→B por máscara de 10f, split horizontal, mesma velocidade 1×; saída do apoio alinhada com espera inicial de 6f em A | Texto aprovado + Jason/NPC | Painéis visíveis por >2s; só esperas de ponta, sem alterar rotação |
| 26,20–30,05 | Melhorou? / abrir dúvida | Estendido, 17:19:22 + 3,47s, 0,90× | 0,50 / 0,50 | Movimento de academia, take distinto | Texto aprovado | “HIPÓTESE · SEM CONFIRMAÇÃO” |
| 30,05–35,15 | Gameplay ou cena? / contraponto | A +26f e B +32f, congelados reais | enquadramentos conferidos | Painéis estáveis, sem nova reprodução | Texto aprovado | “GAMEPLAY?” / “CENA CINEMATOGRÁFICA?”; hipóteses |
| 35,15–37,25 | E você? / pergunta | Trailer 2, 01:21:12, 0,80× | 0,50 / 0,50 | Píer ao pôr do sol, inédito | Texto aprovado | Não cobrir pessoas |
| 37,25–39,733 | Corrigiu ou coincidência? / fechar | Trailer 2, 01:23:03, 0,80× | 0,50 / 0,50 | Água ao pôr do sol, inédito; afastamento leve | Texto aprovado | Preservar última palavra e cauda original do áudio |

Todos os B-rolls têm intervalos distintos; as únicas reutilizações em movimento de A/B são gancho, apresentação, replay de A e comparação. Nenhum loop. Não se afirma que a Rockstar confirmou correção nem a natureza cinematográfica/gameplay. Sem regravação, trilha ou efeitos que modifiquem a narração.

Limitação observada: o enquadramento da própria fonte B já deixa extremidades fora da imagem em parte do gesto. A edição conserva sua altura original e o intervalo integral solicitado; não há como recuperar pixels ausentes da fonte. As legendas e barras incorporadas à fonte são preservadas.

Renderização: o arquivo HEVC longo causou timeout na primeira tentativa de prévia. Foram preparados sete recortes curtos H.264 a 1080p, CRF 12, 30fps, sem áudio, sem interpolação temporal. Originais preservados; relação exata dos frames em `out/video-015/recortes-v001.json`. A fonte B e o Trailer 2 continuam referenciados diretamente na biblioteca.
