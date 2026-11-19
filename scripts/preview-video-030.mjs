import path from 'node:path';
import fs from 'node:fs/promises';
import {bundle} from '@remotion/bundler';
import {selectComposition,renderStill} from '@remotion/renderer';
import {serveProduction} from './production-server.mjs';
const root=process.cwd();
const output=path.join(root,'out/video-030');
await fs.mkdir(output,{recursive:true});
console.log('Preparando prÃƒÂ©via com Rspack local');
const bundled=await bundle({rspack:true,onProgress:p=>console.log('Bundle '+p+'%'),entryPoint:path.join(root,'src/index.ts'),outDir:path.join(output,'preview-bundle'),publicDir:path.join(output,'no-public')});
const server=await serveProduction(root,bundled);
const browserExecutable=path.join(process.env.ProgramFiles,'Google/Chrome/Application/chrome.exe');
try{
 const composition=await selectComposition({serveUrl:server.url,id:'ClipRush030',browserExecutable});
 const frames=process.argv.slice(2).map(Number);
 for(const frame of process.argv.includes('--bundle-only')?[]:frames.length?frames:[45,160,360,550,650,800,925,1080,1220,1390,1550]){
  await renderStill({serveUrl:server.url,composition,browserExecutable,frame,output:path.join(output,`frame-${frame}.jpg`),imageFormat:'jpeg',jpegQuality:88,logLevel:'error'});
  console.log(`Verified render frame ${frame}`);
 }
}finally{await server.close();}








