---
name: cliprush-retencao-visual
description: Planejar e auditar edições de alta clareza e retenção do ClipRush a partir de cenas e áudio reais; foco guiado, prova visual, comparação, infográficos e roteiro para Codex/Remotion.
---

# ClipRush — Direção de Retenção Visual (v1)

## Quando usar

Para todos os pedidos sobre editar, planejar, melhorar, revisar ou produzir vídeos ClipRush, especialmente **curiosidades escondidas, comparações e notícias de GTA VI, GTA V e Red Dead**. Complementa as skills `cliprush-visual-director`, `cliprush-codex-remotion`, `cliprush-script-studio` e `produzir-video-cliprush`.

## Origem e limites

As técnicas vêm da auditoria de **três MP4 enviados pelo usuário**, identificados por `DecuVzzj9x7` (90,9 s), `Dfcj36tDB7h` (51,6 s) e `DfhtdvSCCfL` (40,2 s). Não afirmar que a edição *causou* viralização sem dados de retenção. Os timecodes são aproximações do material analisado; quando o arquivo não estiver acessível na conversa atual, pedir ou usar as marcações reais da produção, **nunca inventar timestamps, coordenadas ou assets**. Reutilizar a lógica audiovisual com identidade própria do ClipRush, não copiar intro, marca ou layouts exclusivos de outra página.

## Regras permanentes de edição

1. **Gancho visual real nos primeiros 0–3 s**: mostrar a cena/prova em movimento desde o frame inicial; evitar vinheta, apresentação, frases vagas e título que prometa algo não demonstrado.
2. **Uma função para cada plano**: registrar `objetivo`, `narração`, `prova`, `asset`, `sourceStart`, `start/end`, `visualTarget` quando existe, `efeitoPrincipal`, `legenda`, `pausaPercepcao` e `transição`. Se um efeito não ajuda a compreender, omitir.
3. **Foco investigativo** (`Dfcj36tDB7h` ~3–14, 20–28 e 40–49s): `contexto → aproximação → marcador (quando útil) → detalhe legível → retorno ao contexto`. Zoom com easing em 6–12 frames a 30 fps (escala sugerida 1,10–1,35); marcador 0,7–1,6 s; deixar o detalhe legível 0,4–0,8 s após a revelação. Não usar círculo, seta, tremor e zoom todos ao mesmo tempo. Coordenadas normalizadas x/y de 0 a 1 e verificadas no quadro-fonte. Não recortar o objeto na proporção 9:16.
4. **Microdescobertas em cadeia** (`DecuVzzj9x7`): cada bloco contém pergunta/expectativa, demonstração e recompensa. Trocar de assunto depois de entregar a informação, sem ficar repetindo o mesmo take em frases de passagem. Não impor cortes a cada 3 s se o espectador precisa enxergar o objeto.
5. **Legenda que guia**: blocos de 2–6 palavras, até 2 linhas, entrada suave 4–8 frames, alto contraste; no máximo uma palavra relevante destacada por bloco. Sincronizar com a fala e evitar área do objeto e zonas de interface das plataformas. Proibir legenda que contradiga o áudio.
6. **Comparação comprovada**: PiP ou split-screen quando ajuda a comparar; rótulos claros e volta breve à cena original. Não apresentar arte sintética como frame oficial.
7. **Infográficos funcionais** (`DfhtdvSCCfL` ~12–21 e 28–35s): usar barra, cadeado, checklist, cronologia, contador ou plataforma apenas quando houver dado, estado, processo ou comparação a explicar. Inserir o gráfico junto da fala. Marcar estimativas e premissas; não simular uma interface oficial como se fosse captura real.
8. **Prova documental** (`DfhtdvSCCfL` ~21–27s): mostrar captura/trecho real com fonte e data quando disponíveis; realçar uma informação por vez. Distinguir notícia oficial, reportagem, rumor e hipótese. Verificar datas relativas como "hoje".
9. **Fechamento curto**: pergunta relacionada ao detalhe/notícia e CTA contextual com 1–2 s quando fizer sentido; não interromper a recompensa com pedido para seguir.
10. **Áudio e ritmo**: sincronizar à narração já fornecida, sem regravar/reescrever sem autorização. Voz inteligível acima de música e SFX; efeitos sonoros discretos apenas em pontos relevantes. Priorizar continuidade sem sobrecarga.
11. **Identidade ClipRush atual**: **sem mascote Rush na tela por padrão**. Narração pode ser IA ou voz própria; usar o arquivo fornecido. Evitar mudanças desnecessárias de identidade gráfica.
12. **Respeitar projeto**: 1080×1920, 30 fps, React/TypeScript/Remotion; ler `AGENTS.md` e `PROMPT_EDICAO_CLIPRUSH.md`; preservar `MyComp`, vídeos antigos e caminhos reais. Não assumir instalação de ferramentas extras. Trabalhar em vídeo novo ou corrigir apenas o segmento solicitado.

## Escolha de abordagem

- **Detalhe escondido:** primeira cena demonstra o achado → foco por alvo → breve marcador → revelação → próxima descoberta.
- **Notícia/número:** gancho verdadeiro → consequência/contraponto → gráfico legível → prova com fonte → instrução ou pergunta.
- **Comparação:** mostrar objeto A/B com rótulo, mesmo critério, recorte/zoom moderado, conclusão baseada em evidências.
- **Correção pontual:** manter áudio, ordem e explicação já aprovada; mexer só no timecode/efeito explicitamente pedido.

## Formato de saída obrigatório

Antes do prompt de Codex, entregar um **mapa de edição**: `início–fim | fala/cue | asset e source timecode | alvo x/y | prova visual | efeito | legenda | tempo de percepção | risco/checagem`. Se a narração ainda não tem marcação, os timecodes são estimativas. Destacar o que é *observado*, *proposto* e *a confirmar*.

Depois gerar prompt curto para Codex, **sem repetir todo o AGENTS.md**:

```text
No cliprush-editor, edite [video-XXX] aplicando AGENTS.md, PROMPT_EDICAO_CLIPRUSH.md e a skill cliprush-retencao-visual.
Use a narração original e os assets reais do vídeo. Siga o mapa de edição; sincronize cada foco com a fala, mostre a prova legível e não repita takes em trechos de transição. Preserve as composições antigas.
Valide início/meio/fim, 9:16, legendas, alvos, fontes, áudio completo, frames pretos e render de prévia. Informe só os arquivos alterados e verificações.
```

## Aceite e experimentos

O vídeo passa se: (a) cada promessa é paga com evidência; (b) cada detalhe é visto após o destaque; (c) não há objeto crucial cortado; (d) legendas e HUD são legíveis no celular; (e) fonte e data corretas; (f) narração preservada; (g) não há cenas de preenchimento repetidas sem razão; (h) composições anteriores intactas. Depois de publicar, testar uma variável de cada vez: palavra-chave destacada, zoom guiado versus zoom normal, ou infográfico versus B-roll; avaliar retenção 0–3s, no momento da descoberta e percentual assistido, sem inferir causalidade automaticamente.
