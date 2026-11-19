# Spec: Jacaré à margem do rio

**Classe:** M | **Alvo:** `video-031` | **Estado:** concluída

## Resultado esperado
Short vertical cinematográfico de 34,7 s, com narração original intacta, aproximação, bote, ataque e desfecho visualmente sincronizados. Legendas curtas com destaque por palavra e enquadramentos que mantenham personagem e animal visíveis.

## Entradas disponíveis
- `public/videos/video-031/audio/narracao.mp3`: 34,691 s.
- Biblioteca: `gta6/videos/novidadesGta6/jason_sendo_devorador_por_jacare.mp4`: 26,069 s, 1920×1080.
- Transcrição local única em `src/videos/video-031/{words,segments}.json`.
- Remotion e pipeline de produção existentes, sem novos pacotes.

## Escopo
**Fazer:** composição ClipRush031, registro mínimo no Root, cama sonora discreta original, previews por bloco, exportação numerada pelo pipeline integrado.

**Não fazer:** alterar outras produções, reindexar, baixar mídia, recriar voz ou ativar limpeza ainda não confirmada.

## Regras inegociáveis
- 1080×1920, 30 fps, 1041 frames; H.264 CRF 18 e AAC 320k.
- Narração integral sem aceleração; legendas pelos timestamps reais.
- Sem prova de origem oficial do clipe: identificação discreta na tela.
- O arquivo contém um ataque contínuo. A fala menciona outras tentativas, mas não há evidência delas nesta mídia; os trechos revisitados serão identificados como reprise, sem inventar outra tentativa.
- Todos os blocos devem mostrar vídeo real, sem cartelas substituindo a evidência.
- Fontes, biblioteca, MyComp e alterações preexistentes preservados.

## Aceitação objetiva
- [x] TypeScript e lint do escopo passam.
- [x] Um frame de cada bloco inspecionado, incluindo bote e morte.
- [x] Legendas legíveis, sem encobrir a ação; enquadramento do ataque corrigido após inspeção.
- [x] MP4 com áudio, resolução, duração e FPS conferidos, e decodificação integral sem erros.
- [x] Verificação do pipeline concluída. Retenção não executada: confirmação inicial pendente; isso não impede a entrega.

## Riscos e incertezas
O vídeo não confirma a origem GTA 6 e não contém várias tentativas; a voz fornecida permanece intacta com contexto visual preciso. A prévia integrada está indisponível; Studio aberto no navegador padrão e QA por frames renderizados.

## Evidências de entrega
- `deliveries/video-031-cinematic-v1.mp4`: 52.493.215 bytes, 1041 frames / 30 fps = 34,7 s, 1080×1920.
- Render único: `npm.cmd run render -- ClipRush031 cinematic-v1`, saída 0.
- `completeProduction` validou metadados, decodificação integral e compilação do projeto. Retornou `pendingInitialApproval: true`; nenhuma limpeza foi autorizada ou executada.
- SHA-256: `535e18b418ed2db705e63c1f85efbad6acc1f5fa65f445443890cad428f4e552`.
- `npx.cmd tsc --noEmit` e lint de `src/Root.tsx` e `ClipRush031.tsx`: passaram.
- Frames de todos os nove blocos inspecionados. Somente os dois frames afetados por correções foram regenerados antes do render.
- Frames extraídos diretamente do MP4: `out/video-031/final-attack.jpg` e `final-question.jpg`; ataque, legendas e pergunta animada presentes.
- Narração mantida integralmente; cama sonora original discreta, sem pacotes ou downloads.
