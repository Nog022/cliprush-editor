# Pacote de produção — ClipRush | 8 detalhes do GTA VI

## Arquivos
- `narracao_elevenlabs.txt`: texto limpo para ElevenLabs ou gravação própria.
- `roteiro.txt`: mapa detalhado da narrativa e direção de cenas.
- `storyboard.md`: visão tabular de retenção e enquadramento.
- `marcacoes.txt`: oito timecodes exatos do usuário, sem alterações.
- `marcacoes.json`: dados para Codex/Remotion; campos `null` indicam informação NÃO verificada.
- `prompt_codex.txt`: prompt curto para colar no Codex.
- `validar_timecodes.py`: valida a sintaxe das marcações e calcula os comprimentos presumindo timecode não drop-frame. **Não substitui a inspeção visual ou o ffprobe.**

## Uso
1. Coloque estes arquivos em `roteiro/` dentro da pasta da nova produção (`video-013` somente se ainda livre).
2. Gere narração com `narracao_elevenlabs.txt`; coloque o áudio na pasta dessa produção.
3. Envie `prompt_codex.txt` ao Codex no VS Code.
4. Codex localiza `gta extend` na biblioteca, confirma o caminho real, base dos timecodes e FPS. Nenhum arquivo original é movido.
5. Faça prévia de cada zoom: contexto → foco → prova visível. A montagem final se ajusta à duração do áudio real, sem cortes de locução.

**Atenção**: o arquivo de 22+ minutos da sua biblioteca local não está neste ZIP. As cenas são indicações fornecidas por você, não recortes já extraídos nem quadros inspecionados. As coordenadas x/y devem ser medidas no arquivo original; não foram inventadas.
