# GTA 6 ou vida real?

Narração fornecida de 48,039 s. Composição de 1442 quadros, 1080 × 1920, 30 FPS. A voz original permanece integral. Marcas abaixo derivadas da fala, com transcrição local por palavra. As notas 10 e 2 são a piada editorial da narração.

## Fontes identificadas

- A corresponde visualmente ao Reel de Only in Dade fornecido em `public/videos/biblioteca/gta6/videos/video_instagram.mp4`, 20,153 s. Fonte primária do post e identificação pela reportagem e pelos quadros observados. https://www.instagram.com/onlyindade/reel/DfnFSzaOLO_/
- B é outro clipe público de Only in Dade, com carros atravessando o cruzamento junto à arena. Autor conferido pelo extrator e quadros vistos. `footage/only-in-dade-vice-city-02.mp4`, 26,678 s. https://www.instagram.com/reel/Dfppo43hwnB/
- C é a comparação real de NikTek, Miami à esquerda e Vice City à direita, 1440 × 1280, 10,124 s. Os prédios, carros e lados foram conferidos nos quadros. `footage/comparacao-miami-gta6.mp4`. https://x.com/NikTek/status/2120605464543334422
- A reportagem local relata o compartilhamento nos Stories da Rockstar. A cartela editorial atribui essa informação à NBC 6. https://www.nbcmiami.com/news/local/this-viral-miami-beach-video-looks-straight-out-of-gta-6-and-it-might-be/3887284/
- A origem da comparação C está identificada nesta página, obtida com HTTP 200 e links dos embeds conferidos. https://www.viceroute.com/en/articles/gta-6-rockstar-video-vertical-vice-city/

Os clipes mostram imagens publicadas. Sua aparência de gravação por celular serve à investigação cômica da edição. O roteiro visual trata apenas do que aparece nos materiais e da comparação documentada.

## Mapa de edição

| Início–fim | Fala/cue | Asset e origem | Alvo x/y | Prova visual | Efeito | Legenda | Percepção | Checagem |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0–5,4 | Vida real ou GTA 6? | A 0–5,4 | carro 0,63/0,48 | plano em movimento desde o primeiro quadro | enquete editorial com duas opções | palavras reais da voz | opções permanecem durante a pergunta | resultado fica oculto até a revelação |
| 5,4–8,5 | Carrões, pessoas e câmera | A 5,4–8,5 | rua inteira | carros e pedestres presentes | continuidade do plano original | blocos curtos | 1 s por alvo | recorte preserva carros |
| 8,5–14,2 | Câmera e turista sem dinheiro | B 0–5,7 | carros 0,48/0,51 | novo plano do cruzamento | nota humorística sobre o gimbal | fala original | 1,5 s da piada | nota do editor |
| 14,2–17,1 | Reflexos | A 10,2–13,1 | teto 0,53/0,37 | sombras e reflexos visíveis no teto | zoom guiado de 1,2× e marcador discreto | voz sincronizada | 0,6 s após destaque | alvo conferido no render do quadro 480 |
| 17,1–18,5 | Movimento das pessoas | A 8,5–9,9 | homem de boné 0,25/0,46 | homem em movimento junto aos carros | marcador discreto | voz sincronizada | 0,6 s de percepção | alvo conferido no render do quadro 533 |
| 18,5–20,65 | Realismo nota 10 | A 14,1–16,25 | carro 0,53/0,55 | contexto visual contínuo | nota 10 entra na palavra dez | voz original | 0,7 s | nota cômica identificada |
| 20,667–23,867 | Estabilização nota 2 | A 16,267–19,467 | plano inteiro | movimento original da câmera | nota 2 entra em 23,033 s | voz original | 0,7 s | preservar movimento da fonte |
| 23,867–26,367 | Agora vem a pegadinha | B 5,7–8,2 | cruzamento | trecho inédito do segundo clipe | pausa de expectativa | voz original | 0,5 s | nenhum loop |
| 26,367–30,9 | Página de Miami e repost | B 8,2–12,733 + quadro documental A | publicação | autoria e relato da NBC 6 | cartela editorial sobre a trilha da publicação | voz original | 2 s de leitura | fontes reais, sem fabricar captura de rede social |
| 30,9–34,7 | Isso é Vice City | B 12,733–16,533 | carro 0,5/0,5 | clipe publicado por Only in Dade | Vice City entra em 32 s e GTA 6 em 33,7 s | voz original | 1,4 s | informação atribuída às fontes |
| 34,7–44,25 | Recriou Miami; legenda para distinguir | C 0–9,55 | ambos os lados | Miami real à esquerda e GTA 6 à direita | split-screen preservando os dois enquadramentos | voz original | comparação contínua de 9,55 s | créditos NikTek, sem inverter os lados |
| 44,267–48,067 | Acertou ou caiu? | B 16,533–20,333 | carros | continuação inédita | enquete final e rótulo GTA 6 | até a última palavra | final respirando 0,45 s | narração completa e sem corte |

Todos os trechos em movimento usam velocidade original. O quadro A reapresentado na cartela tem função documental. Os trechos de vídeo seguem adiante sem loops de preenchimento.

## Implementação

Aplicar o mapa na composição `ClipRush017`, usando áudio e fontes locais, animações determinísticas e legendas em JSON do tipo Caption. Conferir enquete, reflexos, pedestres, notas, atribuição, revelação, comparação e final. Validar um quadro de cada bloco antes do MP4, além de prévias em movimento e áudio.

## Validação realizada

- ESLint direcionado e TypeScript passaram.
- Quinze quadros representativos foram renderizados e inspecionados visualmente, abrangendo todos os blocos, o primeiro e o último quadro. Os alvos dos reflexos e do homem de boné foram conferidos nos quadros 480 e 533.
- A prévia real no Studio foi conferida em dezoito pontos, incluindo as entradas de Vice City e GTA 6. A fonte local carregou, os textos couberam nas áreas definidas e as legendas ficaram em até duas linhas nos pontos inspecionados. Evidência em `out/video-017/preview-report.json` e `studio-preview.png`.
- O MP4 final está em `out/video-017/video-017-v001.mp4`, com 1442 quadros a 30 FPS, vídeo H.264, áudio AAC e resolução 1080 × 1920. O contêiner tem 48,085 s, incluindo o padding do AAC. A imagem tem 48,067 s.
- A comparação do áudio decodificado com a narração original encontrou deslocamento de 0 ms e correlação de 0,99978, com os efeitos discretos da edição incluídos. Pico medido de −0,91 dBFS. A narração original tem 48,039 s e foi mantida integralmente.
- As 128 palavras da transcrição foram preservadas nas 33 páginas de legenda. A decodificação completa do vídeo passou e a varredura de quadros pretos não encontrou ocorrências.
- Os hashes dos cinco assets originais selecionados foram conferidos. A comparação do registro anterior confirmou que a única alteração em `src/Root.tsx` foi a inclusão da composição nova.

Evidências técnicas em `out/video-017/final-audit.json`, `out/video-017/review-v001/frames-report.json` e `out/video-017/review-v001/final-report.json`. Prévia aberta em `http://localhost:3000/ClipRush017`.
