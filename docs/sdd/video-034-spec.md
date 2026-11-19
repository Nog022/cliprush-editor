# Spec: ovo na torre de rádio

**Classe:** M | **Alvo:** `video-034` | **Estado:** concluída e validada

## Resultado esperado
Short vertical cinematográfico com a narração integral de 44,669 s. Montagem guiada pela descoberta do ninho, interação com o ovo, arremesso, queda e impacto; preservar a surpresa até a fala correspondente.

## Entradas disponíveis
- `public/videos/video-034/audio/narracao.mp3`, MP3, 44,669 s.
- Biblioteca: `gta6/videos/novidadesGta6/ovo_de_pascoa_encima_da_torre_de_radio.mp4`, 1920×1080, 30fps, 41,332 s.
- Transcrição única local, modelo já em cache, timestamps por palavra em `src/videos/video-034/words.json`.

## Escopo
Criar composição ClipRush034, registro mínimo no Root, previews e exportação integrada. Sem mudanças de outras produções, reindexação ou downloads. Origem do gameplay não verificada: sinalizar no vídeo, preservando áudio solicitado.

## Regras inegociáveis
- 1080×1920, 30fps, 1341 frames, H.264 CRF18 e AAC 320k.
- Imagem real em todos os blocos, enquadramento acompanha ovo e carro; textos seguros e legendas sincronizadas.
- Narração intacta, áudio original do clipe silenciado; CTAs apenas no encerramento, sem estender duração.
- Um preview por bloco antes do MP4; exportação única, caminho novo, completeProduction e decodificação completa.
- Retenção apenas se já habilitada; confirmação inicial não será contornada.

## Aceitação objetiva
- [x] Transcrição e duração verificadas; timeline cobre toda a narração.
- [x] Dez blocos inspecionados visualmente, incluindo ovo e impacto.
- [x] TypeScript e lint da composição aprovados.
- [x] MP4 final com imagem, áudio, dimensões, duração e decodificação verificados.
- [x] CTAs realmente presentes no MP4.

## Riscos e incertezas
O clipe tem marca d'água e não comprova gameplay oficial de GTA VI. Preservar a fonte e indicar origem não verificada. A montagem reorganiza o clipe, sem repetir ação para preencher: abertura usa plano aéreo e encerramento retorna ao ninho em outro trecho.
