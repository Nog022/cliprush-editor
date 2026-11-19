import path from 'node:path';
import fs from 'node:fs/promises';
import {bundle} from '@remotion/bundler';
import {selectComposition,renderStill} from '@remotion/renderer';
import {serveProduction} from './production-server.mjs';
const root=process.cwd();
const output=path.join(root,'out/video-024');
await fs.mkdir(output,{recursive:true});
console.log('Preparando prévia com Rspack local');
const bundled=await bundle({rspack:true,onProgress:p=>console.log('Bundle '+p+'%'),entryPoint:path.join(root,'src/index.ts'),outDir:path.join(output,'preview-bundle'),publicDir:path.join(output,'no-public')});
const server=await serveProduction(root,bundled);
const browserExecutable=path.join(process.env.ProgramFiles,'Google/Chrome/Application/chrome.exe');
try{
 const composition=await selectComposition({serveUrl:server.url,id:'ClipRush024',browserExecutable});
 const frames=process.argv.slice(2).map(Number);
 for(const frame of frames.length?frames:[42,120,200,290,395,450,530,610,690,740,780,855,980,1040,1120,1190,1370,1550]){
  await renderStill({serveUrl:server.url,composition,browserExecutable,frame,output:path.join(output,`frame-${frame}.jpg`),imageFormat:'jpeg',jpegQuality:88,logLevel:'error'});
  console.log(`Verified render frame ${frame}`);
 }
}finally{await server.close();}





