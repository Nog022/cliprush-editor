import path from 'node:path';
import fs from 'node:fs/promises';
import {bundle} from '@remotion/bundler';
import {selectComposition,renderStill} from '@remotion/renderer';
import {serveProduction} from './production-server.mjs';
const root=process.cwd();
const output=path.join(root,'out/video-021');
await fs.mkdir(output,{recursive:true});
const bundled=await bundle({entryPoint:path.join(root,'src/index.ts'),outDir:path.join(output,'preview-bundle'),publicDir:path.join(output,'no-public')});
const server=await serveProduction(root,bundled);
const browserExecutable=path.join(process.env.ProgramFiles,'Google/Chrome/Application/chrome.exe');
try{
 const composition=await selectComposition({serveUrl:server.url,id:'ClipRush021',browserExecutable});
 const frames=process.argv.slice(2).map(Number);
 for(const frame of frames.length?frames:[0,90,240,390,465,540,615,735,810,915,1015,1140,1300]){
  await renderStill({serveUrl:server.url,composition,browserExecutable,frame,output:path.join(output,`frame-${frame}.jpg`),imageFormat:'jpeg',jpegQuality:88,logLevel:'error'});
  console.log(`Verified render frame ${frame}`);
 }
}finally{await server.close();}
