import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs/promises';
import path from 'node:path';
import { inventory, applyInventory as applyTransaction, restore, safePath, completeProduction, validateMp4, run } from '../../scripts/video-retention.mjs';
import { observeExports } from '../../scripts/production-observe.mjs';

async function fixture(t) {
  const base = path.resolve('out/retention/tests');
  await fs.mkdir(base, { recursive: true });
  const root = await fs.mkdtemp(path.join(base, 'fixture-'));
  // Fixtures are retained for inspection; no recursive deletion touches real productions.
  const put = async (file, content = 'fixture') => { await fs.mkdir(path.dirname(path.join(root, file)), { recursive: true }); await fs.writeFile(path.join(root, file), content); };
  await put('src/Root.tsx', 'import { Old } from "./videos/video-001/Old";\nimport { Current } from "./videos/video-017/Current";\nexport const Root = () => <><Composition id="Old" component={Old} durationInFrames={1}/><Composition id="Current" component={Current} durationInFrames={1}/><MyComp/></>;');
  await put('src/videos/video-001/Old.tsx', 'export const Old=()=>null;');
  await put('src/videos/video-017/Current.tsx', 'export const Current=()=>null;');
  await put('public/videos/video-001/audio/voice.wav');
  await put('public/videos/video-017/audio/voice.wav');
  await put('public/videos/biblioteca/video-001/shared.mp4');
  await put('scripts/prepare-video-001.py', 'print("video-001")');
  await put('auxiliary/job-video-001.tmp');
  await put('AGENTS.md', 'preserve');
  await put('tools/index-video-001.py');
  await put('unknown.bin');
  return { root: await fs.realpath(root), put };
}
const check = async () => {};
const validate = async () => ({});
const applyInventory=(root,plan,options={})=>applyTransaction(root,plan,{initial:true,...options});

test('whole-root ownership, current resources, tools and library; AST registry edits', async t => {
  const { root } = await fixture(t);
  const p = await inventory(root, 17);
  assert.equal(p.records.find(r=>r.file === 'auxiliary/job-video-001.tmp').action, 'remove');
  for (const file of ['AGENTS.md','tools/index-video-001.py','unknown.bin','public/videos/biblioteca/video-001/shared.mp4','public/videos/video-017/audio/voice.wav']) assert.equal(p.records.find(r=>r.file===file).action,'preserve');
  assert.ok(!p.edits[0].after.includes('component={Old}'));
  assert.ok(p.edits[0].after.includes('<MyComp/>'));
  assert.ok(p.edits[0].after.includes('component={Current}'));
});
test('shared imports and dynamic owner references pin old production', async t => {
  const {root, put} = await fixture(t);
  await put('src/videos/video-017/Current.tsx', 'import { Old } from "../video-001/Old"; const root="videos/video-001/";');
  const p = await inventory(root,17);
  assert.equal(p.records.find(r=>r.file==='public/videos/video-001/audio/voice.wav').action,'preserve');
  assert.equal(p.edits.length,0);
});
test('relative import without video ID preserves owned script', async t => {
  const {root,put} = await fixture(t);
  await put('scripts/helper.py', 'print("video-001")');
  await put('src/permanent.ts', 'import "../scripts/helper.py";');
  const p=await inventory(root,17);
  assert.equal(p.records.find(r=>r.file==='scripts/helper.py').action,'preserve');
});
test('compressed recoverable backup, distinct delivery paths and restoration', async t => {
  const {root,put}=await fixture(t);
  await put('out/video-001/video-001-final.mp4');
  const p=await inventory(root,17);
  const report=await applyInventory(root,p,{check,validate});
  assert.ok(report.removed.includes('scripts/prepare-video-001.py'));
  await assert.rejects(fs.stat(path.join(root,'scripts/prepare-video-001.py')));
  assert.equal(await fs.readFile(path.join(root,report.deliveries[0].file),'utf8'),'fixture');
  await restore(root,report.backup);
  assert.equal(await fs.readFile(path.join(root,'scripts/prepare-video-001.py'),'utf8'),'print("video-001")');
  assert.equal(await fs.readFile(path.join(root,'src/Root.tsx'),'utf8'),p.edits[0].before);
});
test('post-cleanup failure restores source and registry',async t=>{
  const {root}=await fixture(t); const p=await inventory(root,17); let n=0;
  await assert.rejects(applyInventory(root,p,{check:async()=>{if(++n===2)throw Error('compile failed');},validate}),/compile failed/);
  assert.equal(await fs.readFile(path.join(root,'src/Root.tsx'),'utf8'),p.edits[0].before);
  assert.ok(await fs.stat(path.join(root,'scripts/prepare-video-001.py')));
});
test('changed references invalidate reviewed manifest',async t=>{
  const {root,put}=await fixture(t); const p=await inventory(root,17);
  await put('src/permanent.ts','const p="video-001";');
  await assert.rejects(applyInventory(root,p,{check,validate}),/stale/);
  assert.ok(await fs.stat(path.join(root,'scripts/prepare-video-001.py')));
});
test('traversal, external roots and symbolic links fail closed',async t=>{
  const {root}=await fixture(t);
  for (const file of ['../other/file',path.resolve('AGENTS.md'),'C:\\other\\file','out/../../other']) await assert.rejects(safePath(root,file,true));
  const target=path.join(root,'link');
  try { await fs.symlink(path.dirname(root),target,'junction'); }
  catch(e){ if(['EPERM','EACCES'].includes(e.code)){t.diagnostic('Link creation unavailable');return;}throw e; }
  await assert.rejects(safePath(root,'link/outside',true),/Link/);
});
test('failed MP4 and missing approval cannot delete production',async t=>{
  const {root,put}=await fixture(t);
  await put('out/fake.mp4','not a media file');
  await assert.rejects(completeProduction({root,current:17,output:path.join(root,'out/fake.mp4')}));
  assert.ok(await fs.stat(path.join(root,'scripts/prepare-video-001.py')));
});
test('FFmpeg validation rejects wrong expected metadata and decodes valid MP4',async t=>{
  const {root}=await fixture(t); const output=path.join(root,'tiny.mp4');
  await run('ffmpeg',['-v','error','-f','lavfi','-i','color=c=blue:s=32x48:r=10:d=0.5','-f','lavfi','-i','sine=frequency=440:duration=0.5','-c:v','libx264','-c:a','aac','-shortest','-n',output]);
  assert.ok((await validateMp4(output,{width:32,height:48,fps:10,durationInFrames:5})).bytes>0);
  await assert.rejects(validateMp4(output,{width:64,height:48,fps:10,durationInFrames:5}),/differs/);
});
test('valid export waits for initial approval, then new production cleans automatically',async t=>{
  const {root,put}=await fixture(t); const output=path.join(root,'out/video-018-final.mp4');
  await fs.mkdir(path.dirname(output),{recursive:true});
  await run('ffmpeg',['-v','error','-f','lavfi','-i','color=c=blue:s=32x48:r=10:d=0.5','-an','-c:v','libx264','-n',output]);
  const expected={width:32,height:48,fps:10,durationInFrames:5,audio:false};
  const pending=await completeProduction({root,current:18,output,expected,check});
  assert.equal(pending.pendingInitialApproval,true);
  assert.ok(await fs.stat(path.join(root,'scripts/prepare-video-001.py')));
  await applyInventory(root,await inventory(root,17),{check,validate,initial:true});
  await put('src/videos/video-018/Current.tsx','export const Current=()=>null;');
  // A desktop data composition has no numbered source registration; fixture checker stands in for its frame validation.
  const result=await completeProduction({root,current:18,output,expected,check});
  assert.ok(result.removed.includes('public/videos/video-017/audio/voice.wav'));
  assert.equal(JSON.parse(await fs.readFile(path.join(root,'out/retention/enabled.json'),'utf8')).current,18);
  assert.ok(await fs.stat(path.join(root,'src/videos/video-018/Current.tsx')));
});
test('restore conflict cannot overwrite user changes',async t=>{
  const {root,put}=await fixture(t); const result=await applyInventory(root,await inventory(root,17),{check,validate});
  await put('scripts/prepare-video-001.py','user edit');
  await assert.rejects(restore(root,result.backup),/conflict/);
  assert.equal(await fs.readFile(path.join(root,'scripts/prepare-video-001.py'),'utf8'),'user edit');
});
test('Studio observes a simulated manual export and calls the completion flow',async t=>{
  const {root,put}=await fixture(t);
  await put('src/Root.tsx','export const Root=()=> <Composition id="ClipRush018" width={32} height={48} fps={10} durationInFrames={5} component={Current}/>;');
  await put('out/retention/enabled.json',JSON.stringify({current:17}));
  let done;
  const observed=new Promise(resolve=>{done=resolve;});
  const observer=await observeExports(root,{delay:25,complete:async options=>{assert.equal(options.current,18);assert.equal(options.expected.durationInFrames,5);done();},log:()=>{}});
  const timeout=setTimeout(()=>done('timeout'),3000);
  try{await put('out/video-018-final.mp4','simulated');assert.notEqual(await observed,'timeout');}
  finally{clearTimeout(timeout);await observer.close();}
});
