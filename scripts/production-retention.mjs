import path from 'node:path';
import * as fs from 'node:fs/promises';
import { inventory, applyInventory, safePath } from './video-retention.mjs';
import { registeredExport } from './production-observe.mjs';

const root = await fs.realpath(process.cwd());
const [mode = 'plan', value = '17'] = process.argv.slice(2);
if (mode === 'plan') {
  const plan = await inventory(root, Number(value));
  await fs.mkdir(await safePath(root, 'docs/cleanup', true), { recursive: true });
  await fs.writeFile(await safePath(root, 'docs/cleanup/initial-plan.json', true), JSON.stringify(plan, null, 2));
  const rows = plan.records.map(r => `| ${r.action} | \`${r.file.replaceAll('|', '\\|')}\` | ${r.bytes} | ${r.reason} |`);
  await fs.writeFile(await safePath(root, 'docs/cleanup/initial-plan.md', true), `# Inventário de exclusão definitiva — produção ${plan.current}\n\nNenhuma exclusão de produção executada. Este inventário exige nova confirmação. Política: sem backup, snapshot de código antigo, restauração ou rollback. remove = candidato à exclusão definitiva; deliver = MP4 a validar e centralizar em deliveries antes de remover o original; preserve = conservado. Todos os MP4, dependências e compilação do registro proposto devem passar antes da primeira exclusão. Arquivos incertos são conservados. Caches reconstruíveis da retenção e backups legados identificados também são candidatos. Dependências instaladas, ferramentas protegidas e links não são percorridos.\n\nOs bytes abaixo são planejados, não espaço liberado. O relatório de execução conterá somente remoções concluídas e o saldo medido de bytes do projeto. Registros a alterar: ${plan.edits.map(e => e.file).join(', ') || 'nenhum'}.\n\n| Ação | Arquivo | Bytes planejados | Motivo |\n|---|---|---:|---|\n${rows.join('\n')}\n`);
  const counts = Object.fromEntries(['remove','deliver','preserve'].map(a => [a, plan.records.filter(r => r.action === a).length]));
  console.log(JSON.stringify({ ...counts, productionBytes: plan.bytes, report: 'docs/cleanup/initial-plan.md' }));
} else if (mode === 'apply-initial') {
  // The interactive agent must receive confirmation of the reviewed manifest before invoking this mode.
  if (!process.argv.includes('--confirmed')) throw new Error('Initial cleanup requires explicit confirmation');
  const plan = JSON.parse(await fs.readFile(await safePath(root, 'docs/cleanup/initial-plan.json'), 'utf8'));
  const output = process.argv[3];
  if (!output || output.startsWith('--')) throw new Error('Supply current production MP4 relative to root');
  try {
    const report=await applyInventory(root,plan,{initial:true,completion:{output:await safePath(root,output),expected:await registeredExport(root,plan.current)}});
    console.log(JSON.stringify(report));
  } catch(error) {
    console.error(JSON.stringify(error.report ?? {error:error.message}));
    process.exitCode=1;
  }
} else throw new Error('Modes: plan CURRENT | apply-initial CURRENT_MP4 --confirmed. Exclusão definitiva; restauração indisponível.');
