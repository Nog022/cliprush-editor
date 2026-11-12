# Storyboard de retenção visual — ClipRush

Estrutura de cada ponto: **contexto → zoom para alvo → prova limpa → micro-recompensa**. Reproduzir o tipo de construção visual do vídeo de referência, com identidade gráfica própria.

| Saída aprox. | Fala/cue | Fonte exata (gta extend) | Alvo x/y | Prova visual | Edição, legenda e percepção | Risco |
|---|---|---|---|---|---|---|
| 00.0–08.5s | Celular: tela acesa | `00:01:03:16–00:01:07:02` | A verificar no frame | Tela do celular quando o personagem afasta o aparelho | 1.00→1.26 (seguir o celular no movimento); A TELA CONTINUA ACESA; 0,5–0,8 s na revelação | Confirmar visualmente o brilho da tela e o frame exato da mudança; sem inferir mecânica jogável. |
| 08.5–16.0s | Policial dispara dentro da viatura | `00:14:17:00–00:14:19:23` | A verificar no frame | Arma e braço do policial projetados pela janela | 1.00→1.24 com acompanhamento horizontal do braço/arma; ATIRANDO DA VIATURA; 0,5–0,7 s após o disparo | Não confundir disparo com gesto do policial; confirmar evento no vídeo-fonte. |
| 16.0–24.5s | Jason ergue arma perto de Lucia | `00:11:50:24–00:11:52:18` | A verificar no frame | Mão/arma de Jason em relação à posição de Lucia | 1.00→1.30; manter Jason, arma e Lucia legíveis no mesmo quadro; ELE LEVANTA A ARMA; 0,5–0,8 s com o gesto legível | O motivo "evitando apontar" é interpretação da encenação; se não evidente, narrar apenas o gesto observado. Não cortar Lucia. |
| 24.5–33.0s | Blusa de Jason dobra ao caminhar | `00:00:08:27–00:00:12:06` | A verificar no frame | Dobras e movimento do tecido da blusa do Jason no tronco | 1.00→1.24 com tracking sutil do tronco; OLHA O TECIDO; 0,5–0,8 s durante a dobra visível | Não atribuir essa dobra à física simulada sem confirmação técnica; preservar resolução do crop. |
| 33.0–41.5s | Helicóptero e árvores | `00:14:03:16–00:14:06:03` | A verificar no frame | Folhas e copa das árvores junto à passagem do helicóptero | 1.00→1.20; deslocar o centro do helicóptero para as árvores; REPARA NAS ÁRVORES; 0,6–0,8 s após o balanço perceptível | Não afirmar que o vento do helicóptero causa o balanço sem evidência; mostrar apenas a coincidência visual. |
| 41.5–50.0s | Jason abre geladeira e a luz acende | `00:07:17:23–00:07:22:00` | A verificar no frame | Luz dentro da geladeira e interior quando a porta abre | 1.00→1.27 centralizado na abertura da porta; A LUZ ACENDE; 0,6–0,8 s no primeiro frame da luz visível | Verificar o momento exato da luz e evitar filtros que falsifiquem o fenômeno. |
| 50.0–59.0s | Disparo no pneu da viatura | `00:14:08:22–00:14:12:04` | A verificar no frame | Pneu atingido e momento em que perde a forma/estoura | 1.00→1.30 acompanhando a roda; manter contexto de viatura; O PNEU ESTOURA; 0,6–0,8 s após o impacto | Confirmar que o pneu estoura visualmente; não adicionar efeito inexistente nem inventar o dano. |
| 59.0–73.5s | NPC move pó com cartão | `00:22:23:24–00:22:30:20` | A verificar no frame | Cartão, mão do NPC e material em pó sobre a mesa | 1.00→1.32; seguir a mão e manter o material inteiro no quadro; O PÓ SE MOVIMENTA; 0,7–0,8 s na resposta do material ao cartão | Não concluir implementação de física real ou gameplay apenas pela imagem; evitar zoom que corte mão, cartão ou pó. |

## Observações para o editor
- **Zoom não é cortar a tela e deixar um plano enorme estático:** ele tem começo, mudança de centro, ajuste ao movimento, parada e retorno.
- Os tempos 0–73,5s são apenas proposta **pré-áudio**; use as pausas e as palavras da narração final como pontos de sincronização.
- Para Jason levantando a arma, manter Jason e Lucia simultaneamente visíveis. Para pneu, manter a arma/ação e a roda em relação espacial.
- Para helicoptero, transferir olhar da aeronave para a árvore em vez de aproximar só helicóptero.
- Para o pó, acompanhar cartão e mão com pan; preservar massa de pó visível (não crop extremo).
- Não usar zoom 1,35 por padrão; ajustar ao tamanho e nitidez do objeto. Se o alvo for pequeno num vídeo horizontal, permitir um recorte lateral com painel de contexto, usando componentes existentes.
- Replays devem ter função (primeiro contexto, depois observação). Não criar loop triplo nem câmera lenta em FPS baixo.
