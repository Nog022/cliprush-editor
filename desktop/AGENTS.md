# ClipRush desktop — escopo Electron/Studio

- Trabalhar somente em módulos relacionados (`desktop/`, `studio/`, `shared/`); para tarefa que envolva `studio/`, aplicar também estas regras mesmo quando o arquivo alterado está fora de `desktop/`.
- Consultar `docs/IMPLEMENTATION_STATUS.md` apenas para distinguir recurso existente de planejado quando isso afetar a implementação.
- Preservar sandbox, `contextIsolation`, IPC com permissões mínimas, validação de caminhos, integridade da mídia e migrações SQLite.
- Não alterar dados reais de usuário ou apagar workspace; para testes, usar `CLIPRUSH_DATA_HOME` apontando para diretório descartável sob `out/`.
- Validar na ordem: typecheck do módulo alterado → testes associados → e2e somente quando afetar interface/integração. Conferir disponibilidade de scripts antes de executá-los.
- Não afirmar integrações remotas, upload ou publicação como prontos sem teste concreto. Não executar comandos de instalação ou limpeza em massa por rotina.
