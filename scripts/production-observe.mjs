import path from 'node:path';
import { watch } from 'node:fs';
import * as fs from 'node:fs/promises';
import { completeProduction, safePath } from './video-retention.mjs';

export async function registeredExport(root, current) {
  const ts=await import('typescript');
  const source=await fs.readFile(await safePath(root,'src/Root.tsx'),'utf8');
  const ast=ts.createSourceFile('Root.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
  let expected;
  const visit=node=>{
    if(ts.isJsxSelfClosingElement(node)||ts.isJsxOpeningElement(node)){
      const props=Object.fromEntries(node.attributes.properties.filter(ts.isJsxAttribute).map(p=>[p.name.getText(ast),p.initializer]));
      const id=props.id && ts.isStringLiteral(props.id) ? props.id.text : '';
      if(node.tagName.getText(ast)==='Composition' && new RegExp(`^ClipRush(?:Video|AI)?${String(current).padStart(3,'0')}(?:[^0-9]|$)`,'i').test(id)){
        const numeric=name=>{const p=props[name];return p&&ts.isJsxExpression(p)&&p.expression&&ts.isNumericLiteral(p.expression)?Number(p.expression.text):undefined;};
        const candidate=Object.fromEntries(['width','height','fps','durationInFrames'].map(k=>[k,numeric(k)]));
        if(Object.values(candidate).every(Number.isFinite))expected=candidate;
      }
    }
    ts.forEachChild(node,visit);
  };
  visit(ast);
  if(!expected)throw new Error('Exportação sem metadados estáticos comprovados: use npm run render para esta composição.');
  return expected;
}

// Observes only export events, never scans media/bundle trees. A partial render cannot
// pass the expected-duration and full-decode gates in completeProduction.
export async function observeExports(root, { complete=completeProduction, delay=5000, log=console.log }={}) {
  const watchers=[],pending=new Map();
  let serial=Promise.resolve();
  const enqueue=relative=>{
    relative=relative.replaceAll('\\','/');
    if(!/\.mp4$/i.test(relative)||/(?:bundle|retention|preview|previa|revisao|teste|test|draft)/i.test(relative))return;
    if(/^deliveries\/.+-[a-f0-9]{12}\.mp4$/i.test(relative))return; // Canonical copy already finalized by lifecycle.
    const m=relative.match(/(?:video[-_]?|cliprush[-_]?(?:(?:video|ai)[-_]?)?)(\d{3})(?!\d)/i);
    if(!m)return;
    clearTimeout(pending.get(relative));
    pending.set(relative,setTimeout(()=>{
      pending.delete(relative);
      serial=serial.then(async()=>{
        let enabled;
        try{enabled=JSON.parse(await fs.readFile(await safePath(root,'out/retention/enabled.json'),'utf8'));}
        catch(e){if(e.code==='ENOENT')return;throw e;}
        const current=Number(m[1]);if(current<enabled.current)return;
        const output=await safePath(root,relative);
        const expected=await registeredExport(root,current);
        await complete({root,current,output,expected});
        log(`Retenção verificada após exportação ${relative}`);
      }).catch(error=>log(`Retenção adiada; arquivos preservados: ${error.message}`));
    },delay));
  };
  for(const folder of ['out','deliveries']){
    const directory=await safePath(root,folder,true);await fs.mkdir(directory,{recursive:true});
    const watcher=watch(directory,{recursive:true},(event,file)=>{if(file)enqueue(`${folder}/${file}`);});
    watcher.on('error',error=>log(`Observador de exportação: ${error.message}`));
    watchers.push(watcher);
  }
  return {close:async()=>{watchers.forEach(w=>w.close());pending.forEach(clearTimeout);await serial;}};
}
