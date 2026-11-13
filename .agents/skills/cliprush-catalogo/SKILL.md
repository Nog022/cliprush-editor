---
name: cliprush-catalogo
description: Buscar cenas, timestamps e miniaturas do catálogo local de GTA VI para uma edição do ClipRush, sem reindexar ou carregar JSON inteiro. Usar somente quando for preciso localizar B-roll/cenas em biblioteca existente.
---

# Busca de cenas econômica
1. Priorizar mídias da pasta `video-NNN`. Para material complementar, verificar a existência de `public/videos/biblioteca/catalogo/gta6/cenas-descritas.json`; para GTA V/RDR2 verificar existência de catálogo real.
2. Reutilizar busca textual já existente. Se inexistente, testar `python tools/buscar_catalogo.py --catalogo <caminho> --consulta "ideia da cena" --limite 5` (ferramenta auxiliar; validar campos do catálogo no primeiro uso).
3. Formular poucas consultas por conceito/ação/personagem e sinônimos; agrupar quando apropriado. Retornar **até cinco** candidatos por consulta: vídeo original, intervalo, resumo e observação de confiança.
4. Antes de inserir cena, inspecionar apenas 1–3 miniaturas ou trechos finalistas se houver dúvida. Metadados criados por visão local não provam fatos, ações ou identidade.
5. Usar vídeo original e timestamps; não copiar mídia integral nem reprocessar Gemma/Ollama, PySceneDetect, indexadores ou CSV sem pedido de manutenção.
6. Evitar repetir trecho ou forçar mídia errada: quando a busca falhar, recorrer a gráfico, mapa, texto ou animação explicativa.
