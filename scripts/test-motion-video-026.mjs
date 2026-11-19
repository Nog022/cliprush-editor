import path from 'node:path';
import {selectComposition,renderMedia} from '@remotion/renderer';
import {serveProduction} from './production-server.mjs';
const root=process.cwd();
const server=await serveProduction(root,path.join(root,'out/video-026/preview-bundle'));
const browserExecutable=path.join(process.env.ProgramFiles,'Google/Chrome/Application/chrome.exe');
try {
 const composition=await selectComposition({serveUrl:server.url,id:'ClipRush026',browserExecutable});
 for (const [name,start,end] of [['map',390,449],['animals-fast',765,824],['animals-normal',990,1049]]) {
  await renderMedia({serveUrl:server.url,composition,browserExecutable,frameRange:[start,end],outputLocation:path.join(root,`out/video-026/motion-${name}-v2.mp4`),codec:'h264',crf:18,pixelFormat:'yuv420p',muted:true,concurrency:2,overwrite:false});
  console.log(`Motion test ${name}: ${start}-${end}`);
 }
}finally{await server.close();}
