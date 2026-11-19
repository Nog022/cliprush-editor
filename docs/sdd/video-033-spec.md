# Spec: cachorro no jetski

**Classe:** M | **Alvo:** `video-033` | **Estado:** concluída

## Resultado esperado
Short vertical de 12,2 segundos, guiado pela narração original. Progressão do passeio para os detalhes do cachorro, com câmera lenta suave, reenquadramento cinematográfico, legendas e CTA de seguir no encerramento.

## Entradas disponíveis
- `public/videos/video-033/audio/narracao.mp3`: 12,199 s.
- Biblioteca: `gta6/videos/novidadesGta6/jason_andando_de_jetski_com_cachorro.mp4`: 11,776 s, 1920×1080, 60 fps. Cachorro, óculos e colete conferidos visualmente.
- Transcrição única com modelo small já em cache; corrigir apenas a grafia de salva-vidas.

## Escopo
Criar composição, transcrição, preparação de previews, documentação e registro mínimo em Root. Exportar pelo comando integrado de produção em nome único. Preservar alterações existentes, MyComp, biblioteca e narração.

## Regras inegociáveis
- 1080×1920, 30 fps, 366 frames. Narração integral, sem tempo extra para CTA.
- Não repetir trechos. Fonte avança de 0 a aproximadamente 9,6 s; câmera lenta de 0,7× nos detalhes.
- Texto fora do rosto e dos acessórios. Legendas com destaque na palavra falada.
- Identificação discreta de clipe fornecido, sem confirmação de gameplay oficial: a origem do material não comprova a afirmação da voz.
- Sem downloads, reindexação ou mudanças em outros vídeos; retenção apenas conforme mecanismo existente e aprovação inicial.

## Aceitação objetiva
- [x] Frames representativos dos quatro blocos e CTA inspecionados.
- [x] TypeScript e ESLint do escopo passam.
- [x] MP4 H.264 CRF18 com AAC; duração e dimensões confirmadas.
- [x] Decodificação integral e trilha de narração verificadas.

## Timeline
- 0–4,4 s: passeio e apresentação do cachorro.
- 4,4–7,2 s: aproximação do passageiro à frente.
- 7,2–10,1 s: foco em óculos e colete.
- 10,1–12,2 s: plano de saída e CTA seguir, sem prolongar a voz.
