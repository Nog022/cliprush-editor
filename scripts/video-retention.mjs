/** Conservative production retention. No deletion is enabled until initial approval. */
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { createReadStream, constants } from 'node:fs';
import * as fs from 'node:fs/promises';
import { spawn } from 'node:child_process';

const excluded = new Set(['.git', 'node_modules', '.venv-indexacao', '.venv', 'vendor', 'coverage', '.agents', '.codex', '.aws', '.codegraph']);
const textExtensions = /\.(?:tsx?|jsx?|mjs|cjs|py|json|ya?ml|md|txt|srt|vtt|csv|toml|ini|css|html|ps1|sh)$/i;
const runtimeExtensions = /\.(?:tsx?|jsx?|mjs|cjs|py|json|ya?ml|toml|ini|ps1|sh)$/i;
const ids = (s) => [...new Set([...s.matchAll(/(?:video[-_ ]?|cliprush[-_]?(?:(?:video|ai)[-_]?)?|narracao-)(\d{3})(?!\d)/gi)].map(m => Number(m[1])))];
const slash = s => s.replaceAll('\\', '/');
export const RETENTION_POLICY = 'permanent-delete-v1';
const disposableRetention = p => /^out\/retention\/(?:backups\/|tests\/fixture-[^/]+\/|check-bundle\/|manual-bundle\/)/.test(p);
const protectedPath = p => /(?:^|\/)AGENTS\.md$/i.test(p) || /^(?:docs\/|\.agents\/|\.codegraph\/|tools\/|skills\/|templates\/|public\/videos\/biblioteca\/)/i.test(p) || /(?:^|\/)RTK\.md$/i.test(p) || /^(?:scripts\/video-retention|scripts\/production-|tests\/retention)/.test(p);

export async function safePath(root, relative, missing = false) {
  if (!relative || path.isAbsolute(relative) || relative.includes(':') || relative.split(/[\\/]/).some(s => s === '..')) throw new Error(`Unsafe path: ${relative}`);
  root = await fs.realpath(root);
  const target = path.resolve(root, relative);
  if (!target.startsWith(root + path.sep)) throw new Error(`Outside project: ${relative}`);
  let cursor = root;
  for (const part of path.relative(root, target).split(path.sep)) {
    cursor = path.join(cursor, part);
    try {
      const info = await fs.lstat(cursor);
      if (info.isSymbolicLink() || (await fs.realpath(cursor)).toLowerCase() !== cursor.toLowerCase()) throw new Error(`Link/junction rejected: ${relative}`);
      if (info.isFile() && info.nlink > 1) throw new Error(`Hard link rejected: ${relative}`);
    } catch (e) { if (e.code !== 'ENOENT' || !missing) throw e; }
  }
  return target;
}
export async function digest(file) {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(file)) hash.update(chunk);
  return hash.digest('hex');
}
async function walk(root, dir = '') {
  const found = [];
  for (const entry of await fs.readdir(path.join(root, dir), { withFileTypes: true })) {
    const rel = slash(path.join(dir, entry.name));
    if (entry.isSymbolicLink()) continue;
    if (entry.isDirectory()) {
      if (!excluded.has(entry.name) && !/^deliveries(?:\/|$)/.test(rel) && !/^out\/retention\/(?:reports|tmp)(?:\/|$)/.test(rel)) found.push(...await walk(root, rel));
    } else if (entry.isFile()) found.push(rel);
  }
  return found;
}

// Remove only entire, statically owned Composition registrations. Preserve all other JSX.
export function pruneRoot(source, owners, ts) {
  const ast = ts.createSourceFile('Root.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const imports = ast.statements.filter(ts.isImportDeclaration).filter(n => n.importClause && !ts.isNamespaceImport(n.importClause.namedBindings ?? n) && owners.some(id => n.moduleSpecifier.text.includes(`video-${String(id).padStart(3, '0')}/`)));
  const bindings = new Map();
  for (const n of imports) {
    const names = [];
    if (n.importClause?.name) names.push(n.importClause.name.text);
    const b = n.importClause?.namedBindings;
    if (b && ts.isNamedImports(b)) names.push(...b.elements.map(e => e.name.text));
    bindings.set(n, names);
  }
  const components = new Set([...bindings.values()].flat());
  const removals = [];
  const visit = n => {
    if (ts.isJsxSelfClosingElement(n) || ts.isJsxElement(n)) {
      const opening = ts.isJsxElement(n) ? n.openingElement : n;
      const component = opening.attributes.properties.find(p => ts.isJsxAttribute(p) && p.name.text === 'component');
      if (opening.tagName.getText(ast) === 'Composition' && component?.initializer && ts.isJsxExpression(component.initializer) && components.has(component.initializer.expression?.getText(ast))) {
        removals.push([n.getStart(ast), n.end]); return;
      }
    }
    ts.forEachChild(n, visit);
  };
  visit(ast);
  let body = source;
  for (const [start, end] of [...removals, ...imports.map(n => [n.getStart(ast), n.end])].sort((a,b) => b[0]-a[0])) body = body.slice(0,start) + body.slice(end);
  // Unknown remaining use means retain that owner's entire production.
  const blocked = imports.filter(n => bindings.get(n).some(name => new RegExp(`\\b${name}\\b`).test(body))).flatMap(n => ids(n.moduleSpecifier.text));
  if (blocked.length) return pruneRoot(source, owners.filter(id => !blocked.includes(id)), ts);
  return body;
}

export async function inventory(root, current, { references = [] } = {}) {
  const ts = await import('typescript');
  root = await fs.realpath(root);
  if (!Number.isInteger(current) || current < 1 || current > 999) throw new Error('Invalid current video');
  const files = await walk(root);
  const records = [];
  const texts = new Map();
  for (const file of files) {
    const absolute = await safePath(root, file);
    const info = await fs.stat(absolute);
    if (textExtensions.test(file) && info.size < 8 * 1024 ** 2 && !/^(?:build|dist|out\/retention)\//.test(file) && !/(?:^|\/)bundle\//.test(file)) texts.set(file, await fs.readFile(absolute, 'utf8'));
    let owners = ids(file);
    let contentOnly = false;
    let reason = 'Propriedade incerta ou recurso permanente';
    if (!owners.length && /(?:^|\/)(?:scripts|out)\//.test('/' + file) && runtimeExtensions.test(file) && !/(?:build|index|cache|test|catalog|buscar|biblioteca|retention|production)/i.test(path.basename(file))) {
      owners = ids(texts.get(file) ?? '');
      if (owners.length) { contentOnly = true; reason = 'Referências internas antigas; propriedade exclusiva não comprovada'; }
    } else if (owners.length) reason = 'Caminho ou nome identifica produção antiga';
    const old = owners.length && owners.every(id => id < current);
    const draft = /(?:preview|previa|revisao|review|teste|test|sample|draft|rascunho)/i.test(file);
    const oldBundle = /^out\/video-\d{3}\/.+/.test(file) && /\/bundle\//.test(file) && old;
    const final = old && file.startsWith('out/') && /\.mp4$/i.test(file) && /^(?:video[-_]?\d{3}|cliprush[-_]?(?:(?:video|ai)[-_]?)?\d{3}|final|export|entrega)/i.test(path.basename(file)) && !draft && !oldBundle && !/(?:footage|source|select|recorte)/i.test(file);
    const uncertainMp4 = file.startsWith('out/') && /\.mp4$/i.test(file) && !final && !draft && !oldBundle;
    records.push({ file, bytes: info.size, owners, action: protectedPath(file) || uncertainMp4 || contentOnly ? 'preserve' : final ? 'deliver' : old ? 'remove' : 'preserve', reason: protectedPath(file) ? 'Política: documentação, ferramenta ou biblioteca protegida' : uncertainMp4 ? 'MP4 de finalidade incerta: preservar' : final ? 'MP4 de entrega: centralizar sem sobrescrita após validação' : oldBundle ? 'Cache de bundle exclusivo de produção antiga' : reason });
    const snapshot = file.startsWith('out/') && /(?:^|\/)Root\.before\.tsx$/.test(file) && ids(texts.get(file) ?? '').length > 0 && ids(texts.get(file)).every(id => id < current);
    if (!protectedPath(file) && (disposableRetention(file) || snapshot)) Object.assign(records.at(-1), { owners: [], action: 'remove', reason: snapshot ? 'Snapshot obsoleto de registros antigos, sem uso no render atual' : 'Cache ou artefato de testes da retenção, reconstruível; inclui backups legados' });
  }
  const rootSource = texts.get('src/Root.tsx');
  // Fixed point: retained scripts, configuration, current sources and desktop projects pin old owners.
  let changed = true;
  let rewritten = rootSource;
  while (changed) {
    changed = false;
    const removableOwners = [...new Set(records.filter(r => r.action === 'remove').flatMap(r => r.owners))];
    rewritten = rootSource === undefined ? undefined : pruneRoot(rootSource, removableOwners, ts);
    const pinned = new Map();
    for (const r of records.filter(r => r.action === 'preserve')) {
      const text = r.file === 'src/Root.tsx' ? rewritten : texts.get(r.file);
      if (!text || !runtimeExtensions.test(r.file) || /^(?:build|dist|docs|out\/retention|tests\/retention)\//.test(r.file) || /(?:^|\/)bundle\//.test(r.file) || /(?:^|\/)Root\.before\.tsx$/i.test(r.file) || (r.file.startsWith('out/') && /\.json$/i.test(r.file))) continue;
      for (const id of ids(text)) pinned.set(id, r.file);
      // Relative imports without video IDs: resolve to the referenced file and pin its owner.
      for (const m of text.matchAll(/(?:from\s*|import\s*(?:\(\s*)?|require\s*\()\s*["'](\.[^"']+)["']/g)) {
        const target = slash(path.normalize(path.join(path.dirname(r.file), m[1])));
        for (const dependency of records.filter(x => x.file === target || x.file.replace(/\.[^.]+$/, '') === target || x.file.startsWith(target + '/'))) {
          for (const id of dependency.owners) pinned.set(id, r.file);
        }
      }
    }
    for (const ref of references) for (const id of ids(ref)) pinned.set(id, 'Projeto desktop ou referência externa à produção');
    for (const r of records) if (r.action !== 'preserve' && r.owners.some(id => pinned.has(id))) {
      r.action = 'preserve'; r.reason = `Dependência retida: ${r.owners.map(id => pinned.get(id)).filter(Boolean).join(', ')}`; changed = true;
    }
  }
  for (const r of records.filter(r => r.action !== 'preserve')) r.sha256 = await digest(await safePath(root, r.file));
  const edits = rewritten !== undefined && rewritten !== rootSource ? [{ file: 'src/Root.tsx', after: rewritten, sha256: await digest(await safePath(root, 'src/Root.tsx')) }] : [];
  return { version: 2, policy: RETENTION_POLICY, root, current, references, createdAt: new Date().toISOString(), records, edits, bytes: records.filter(r => r.action === 'remove').reduce((n,r) => n+r.bytes,0) };
}

export function run(command, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' } });
    let tail = '';
    const capture = data => { tail = (tail + data).slice(-6000); };
    child.stdout.on('data', capture); child.stderr.on('data', capture);
    child.on('error', reject);
    child.on('exit', code => code === 0 ? resolve(tail) : reject(new Error(`${command} failed (${code}): ${tail}`)));
  });
}
export async function validateMp4(file, expected) {
  const data = JSON.parse(await run('ffprobe', ['-v', 'error', '-protocol_whitelist', 'file,pipe', '-show_streams', '-show_format', '-of', 'json', file]));
  const video = data.streams?.find(s => s.codec_type === 'video');
  const audio = data.streams?.find(s => s.codec_type === 'audio');
  if (!video || !Number.isFinite(Number(data.format?.duration)) || Number(data.format.duration) <= 0) throw new Error('Invalid MP4');
  if (expected) {
    const fps = video.avg_frame_rate.split('/').map(Number);
    if (video.width !== expected.width || video.height !== expected.height || Math.abs(fps[0]/fps[1] - expected.fps) > .02 || Math.abs(Number(data.format.duration) - expected.durationInFrames/expected.fps) > .15 || (expected.audio !== false && !audio)) throw new Error('MP4 differs from composition');
  }
  await run('ffmpeg', ['-v', 'error', '-xerror', '-protocol_whitelist', 'file,pipe', '-i', file, '-map', '0:v:0', '-map', '0:a?', '-f', 'null', '-']);
  return { sha256: await digest(file), bytes: (await fs.stat(file)).size };
}
export async function archiveDelivery(root, source) {
  const absolute = await safePath(root,slash(path.relative(root,source)));
  const sha256 = await digest(absolute);
  const bytes=(await fs.stat(absolute)).size;
  if (slash(path.relative(root,absolute)).startsWith('deliveries/')) return {file:slash(path.relative(root,absolute)),sha256,bytes,created:false};
  let file = `deliveries/${path.basename(source,'.mp4')}-${sha256.slice(0,12)}.mp4`;
  let destination = await safePath(root,file,true);
  await fs.mkdir(path.dirname(destination),{recursive:true});
  try {
    if(await digest(destination)===sha256) return {file,sha256,bytes,created:false};
    file=`deliveries/${path.basename(source,'.mp4')}-${randomUUID()}.mp4`;
    destination=await safePath(root,file,true);
  } catch(e) { if(e.code!=='ENOENT')throw e; }
  await fs.copyFile(absolute,destination,constants.COPYFILE_EXCL);
  if(await digest(destination)!==sha256)throw new Error('Delivery hash mismatch');
  return {file,sha256,bytes,created:true};
}
export async function checkProject(root, current, edits = []) {
  const overlay = new Map(edits.map(e => [path.resolve(root,e.file).toLowerCase(),e.after]));
  if (edits.length) {
    const ts = await import('typescript');
    for (const config of ['tsconfig.json','tsconfig.desktop.json']) {
      const parsed = ts.getParsedCommandLineOfConfigFile(path.join(root,config),{noEmit:true}, {...ts.sys,onUnRecoverableConfigFileDiagnostic:d=>{throw Error(ts.flattenDiagnosticMessageText(d.messageText,'\n'));}});
      if (!parsed) throw Error(`Invalid configuration: ${config}`);
      const host = ts.createCompilerHost(parsed.options);
      const originalRead = host.readFile;
      host.readFile = file => overlay.get(path.resolve(file).toLowerCase()) ?? originalRead(file);
      const diagnostics = [...parsed.errors,...ts.getPreEmitDiagnostics(ts.createProgram(parsed.fileNames,parsed.options,host))].filter(d=>d.category===ts.DiagnosticCategory.Error);
      if(diagnostics.length)throw Error(ts.formatDiagnosticsWithColorAndContext(diagnostics,{getCanonicalFileName:f=>f,getCurrentDirectory:()=>root,getNewLine:()=> '\n'}));
    }
  } else {
    for (const args of [[], ['--project', 'tsconfig.desktop.json']]) await run(process.execPath, ['node_modules/typescript/bin/tsc', '--noEmit', ...args], root);
  }
  const { build } = await import('esbuild');
  const plugins = [{name:'retention-proposal',setup(builder){builder.onLoad({filter:/\.[cm]?[jt]sx?$/},args=>{
    const contents=overlay.get(path.resolve(args.path).toLowerCase());
    return contents===undefined?undefined:{contents,loader:path.extname(args.path).slice(1),resolveDir:path.dirname(args.path)};
  });}}];
  for (const entry of ['src/index.ts', 'studio/index.tsx']) await build({ absWorkingDir: root, entryPoints: [entry], bundle: true, write: false, platform: 'browser', jsx: 'automatic', logLevel: 'silent', loader: { '.css': 'empty' },plugins });
  if (current) {
    const { bundle } = await import('@remotion/bundler');
    const { selectComposition, renderStill } = await import('@remotion/renderer');
    const { serveProduction } = await import('./production-server.mjs');
    const temporary = `out/retention/tmp/check-${randomUUID()}`;
    const outDir = await safePath(root,temporary,true);
    await fs.mkdir(outDir,{recursive:true});
    let server;
    try {
      const proposedRoot=overlay.get(path.resolve(root,'src/Root.tsx').toLowerCase());
      const bundled=await bundle({entryPoint:path.join(root,'src/index.ts'),outDir,publicDir:null,enableCaching:false,webpackOverride:config=>proposedRoot===undefined?config:({...config,module:{...config.module,rules:[...(config.module?.rules??[]),{test:/[\\/]src[\\/]Root\.tsx$/,enforce:'pre',use:[{loader:path.join(root,'scripts/production-root-loader.cjs'),options:{source:proposedRoot}}]}]}})});
      server=await serveProduction(root,bundled);
      const browserExecutable = process.env.CLIPRUSH_BROWSER || (process.platform === 'win32' ? path.join(process.env.ProgramFiles || '', 'Google/Chrome/Application/chrome.exe') : undefined);
      const source = proposedRoot ?? await fs.readFile(await safePath(root,'src/Root.tsx'),'utf8');
      const id = [...source.matchAll(/\bid=["']([^"']+)["']/g)].map(m=>m[1]).find(id=>ids(id).includes(current));
      if (!id) throw new Error('Current composition not registered');
      const composition = await selectComposition({ serveUrl:server.url, id, browserExecutable });
      await renderStill({ serveUrl: server.url, composition, frame: 0, scale: .1, browserExecutable, imageFormat:'png' });
    } finally {
      if(server)await server.close();
      await removeGenerated(root,temporary);
    }
  }
}

// Only fresh, UUID-named validation output is deleted here, never existing productions.
async function removeGenerated(root, relative) {
  const directory=await safePath(root,relative);
  for(const entry of await fs.readdir(directory,{withFileTypes:true})){
    const next=`${relative}/${entry.name}`;
    if(entry.isDirectory())await removeGenerated(root,next);
    else await fs.unlink(await safePath(root,next));
  }
  await fs.rmdir(await safePath(root,relative));
}
async function readEnabled(root) {
  try {
    const state=JSON.parse(await fs.readFile(await safePath(root,'out/retention/enabled.json'),'utf8'));
    return state.policy===RETENTION_POLICY?state:undefined;
  } catch(error) {if(error.code==='ENOENT')return;throw error;}
}
async function storeJson(root, relative, value) {
  const file=await safePath(root,relative,true);
  await fs.mkdir(path.dirname(file),{recursive:true});
  await fs.writeFile(file,JSON.stringify(value,null,2));
}
async function projectBytes(root) {
  let bytes=0;
  const visit=async relative=>{
    for(const entry of await fs.readdir(path.join(root,relative),{withFileTypes:true})){
      if(entry.isSymbolicLink() || excluded.has(entry.name))continue;
      const file=slash(path.join(relative,entry.name));
      if(entry.isDirectory())await visit(file);
      else if(entry.isFile())bytes+=(await fs.stat(await safePath(root,file))).size;
    }
  };
  await visit('');return bytes;
}
export class CleanupFailure extends Error {
  constructor(cause,report){
    super(`Limpeza interrompida (${report.phase}); ${report.removed.length} arquivo(s) excluído(s). Sem rollback. Relatório: ${report.reportFile}. Causa: ${cause.message}`,{cause});
    this.report=report;
  }
}

export async function applyInventory(root, plan, { check=checkProject, validate=validateMp4, initial=false, completion, remove=file=>fs.unlink(file), refresh } = {}) {
  root=await fs.realpath(root);
  if(plan.root!==root || plan.version!==2 || plan.policy!==RETENTION_POLICY)throw Error('Plan belongs to another root or obsolete policy');
  const lock=await safePath(root,'out/retention/lock',true);
  await fs.mkdir(path.dirname(lock),{recursive:true});
  let handle;
  try{handle=await fs.open(lock,'wx');}catch(error){if(error.code==='EEXIST')throw Error('Retenção bloqueada por limpeza em andamento ou falha anterior. Revise out/retention/reports e o lock; nenhuma restauração automática.');throw error;}
  const candidates=plan.records.filter(r=>r.action!=='preserve');
  const report={policy:RETENTION_POLICY,current:plan.current,initial,status:'validating',phase:'validation',reportFile:`out/retention/reports/${Date.now()}-${randomUUID()}.json`,removed:[],modified:[],deliveries:[],pending:candidates.map(r=>r.file),attempted:null,sourceBytesRemoved:0,startedAt:new Date().toISOString()};
  let projectBefore;
  let mutationStarted=false;
  let preserveLock=false;
  try{
    const enabled=await readEnabled(root);
    if(!initial && !enabled)throw Error('Initial approval required for definitive deletion');
    if(initial && enabled)throw Error('Initial cleanup already confirmed');
    if(enabled && plan.current<enabled.current)return {skippedOlderProduction:true};
    if(!completion?.output || !completion.expected)throw Error('Validated current MP4 and expected composition required');
    const currentOutput=await safePath(root,slash(path.relative(root,completion.output)));
    const verified=await validate(currentOutput,completion.expected);
    await check(root,plan.current,[]);
    const fresh=await inventory(root,plan.current,{references:plan.references});
    const signature=p=>JSON.stringify({records:p.records.filter(r=>r.action!=='preserve'),edits:p.edits});
    if(signature(fresh)!==signature(plan))throw Error('Plan stale: dependencies or files changed; regenerate review');
    for(const item of [...candidates,...plan.edits]){
      if(protectedPath(item.file))throw Error(`Protected file: ${item.file}`);
      const source=await safePath(root,item.file);
      if(await digest(source)!==item.sha256)throw Error(`Plan stale: ${item.file}`);
      if(item.action==='deliver')await validate(source);
    }
    // Validate the exact proposed registry before the first irreversible operation.
    await check(root,plan.current,plan.edits);
    projectBefore=await projectBytes(root);
    await storeJson(root,report.reportFile,report);
    report.deliveries.push({source:slash(path.relative(root,currentOutput)),...await archiveDelivery(root,currentOutput)});
    for(const item of candidates.filter(r=>r.action==='deliver')){
      const delivery=await archiveDelivery(root,await safePath(root,item.file));
      if(delivery.sha256!==item.sha256)throw Error(`Delivery changed: ${item.file}`);
      report.deliveries.push({source:item.file,...delivery});
    }
    // Complete delivery and source checks before touching any code or deleting files.
    for(const item of [...candidates,...plan.edits])if(await digest(await safePath(root,item.file))!==item.sha256)throw Error(`Changed before cleanup: ${item.file}`);
    if(verified?.sha256 && await digest(currentOutput)!==verified.sha256)throw Error('Current MP4 changed before cleanup');
    report.status='running';report.phase='registry';
    for(const edit of plan.edits){
      report.attempted=edit.file;await storeJson(root,report.reportFile,report);
      mutationStarted=true;
      await fs.writeFile(await safePath(root,edit.file),edit.after);
      report.modified.push(edit.file);
      report.attempted=null;await storeJson(root,report.reportFile,report);
    }
    report.phase='deletion';
    for(const item of candidates){
      report.attempted=item.file;await storeJson(root,report.reportFile,report);
      const file=await safePath(root,item.file);
      if(await digest(file)!==item.sha256)throw Error(`Changed during cleanup: ${item.file}`);
      const bytes=(await fs.stat(file)).size;
      mutationStarted=true;
      await remove(file);
      report.removed.push(item.file);report.sourceBytesRemoved+=bytes;
      report.pending=report.pending.filter(file=>file!==item.file);
      report.attempted=null;await storeJson(root,report.reportFile,report);
    }
    report.phase='post-validation';
    await check(root,plan.current,[]);
    if(refresh)await refresh(root);
    else if(candidates.length && await fs.stat(path.join(root,'scripts/build-desktop.mjs')).catch(()=>null))await run(process.execPath,['scripts/build-desktop.mjs'],root);
    await storeJson(root,'out/retention/enabled.json',{policy:RETENTION_POLICY,current:plan.current,report:report.reportFile});
    report.status='completed';report.phase='completed';report.completedAt=new Date().toISOString();
    await storeJson(root,report.reportFile,report);
    report.netBytesReclaimed=projectBefore-await projectBytes(root);
    await storeJson(root,report.reportFile,report);
    return report;
  }catch(error){
    preserveLock=mutationStarted;
    report.status=mutationStarted?'partial-failure':'validation-failed';report.error=error.message;
    report.interruptedAt=new Date().toISOString();
    if(projectBefore!==undefined)report.netBytesReclaimed=projectBefore-await projectBytes(root);
    await storeJson(root,report.reportFile,report).catch(writeError=>{report.reportWriteError=writeError.message;});
    throw new CleanupFailure(error,report);
  }finally{
    await handle.close();
    if(!preserveLock)await fs.unlink(lock);
  }
}

export async function completeProduction({ root, current, output, expected, references=[], check=checkProject }) {
  root=await fs.realpath(root);
  const file=await safePath(root,slash(path.relative(root,output)));
  const enabled=await readEnabled(root);
  if(!enabled){
    const verified=await validateMp4(file,expected);
    await check(root,current,[]);
    return {pendingInitialApproval:true,verified};
  }
  if(current<enabled.current)return {skippedOlderProduction:true};
  const plan=await inventory(root,current,{references:[...references,slash(path.relative(root,output))]});
  return applyInventory(root,plan,{check,completion:{output:file,expected}});
}
