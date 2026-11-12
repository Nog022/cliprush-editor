import {bundle} from '@remotion/bundler';
import {openBrowser,getCompositions,renderStill,renderMedia} from '@remotion/renderer';
import {readFile,writeFile,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
const dir=path.resolve('out/video-008/oculos-v001');
const final=process.argv.includes('--render');
const baseline=JSON.parse(await readFile(path.join(dir,'baseline.json'),'utf8'));
for(const [file,hash] of Object.entries(baseline)) {
 if(file.replaceAll('\\','/')==='src/videos/video-008/scenes.tsx') continue;
 if(createHash('sha256').update(await readFile(file)).digest('hex')!==hash) throw Error('Unexpected change: '+file);
}
const before=await readFile(path.join(dir,'scenes.before.tsx'),'utf8');
const after=await readFile('src/videos/video-008/scenes.tsx','utf8');
const strip=s=>s.replace(/export const TrailerFreezeFrame = \(\) => \{[\s\S]*?(?=export const RoccoScreenshot)/,'').replace('import { Audio, Video }','import { Video }').replaceAll('\r\n','\n');
if(strip(before)!==strip(after)) throw Error('Another scene changed');
if(final) await access(path.join(dir,'validated.json'));
const serveUrl=await bundle({entryPoint:path.resolve('src/index.ts'),outDir:path.join(dir,'bundle')});
const browser=await openBrowser('chrome',{browserExecutable:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try {
 const composition=(await getCompositions(serveUrl,{puppeteerInstance:browser})).find(c=>c.id==='ClipRushAI008Rocco');
 if(!composition||composition.durationInFrames!==890) throw Error('Duration changed');
 if(!final) for(const frame of [267,268,275,300,325,346,347,390]) {
  await renderStill({serveUrl,composition,frame,output:path.join(dir,`frame-${frame}.png`),imageFormat:'png',scale:.5,puppeteerInstance:browser});
  console.log(`Frame ${frame}`);
 }
 let dest=path.resolve(final?'out/ClipRushAI008Rocco.mp4':'out/video-008/oculos-v001/trecho-oculos.mp4');
 const original=dest;let version=2;
 while(await access(dest).then(()=>true,()=>false)) dest=original.replace(/\.mp4$/,`-v${String(version++).padStart(3,'0')}.mp4`);
 let last=-1;
 await renderMedia({serveUrl,composition,outputLocation:dest,codec:'h264',audioCodec:'aac',audioBitrate:'192k',pixelFormat:'yuv420p',crf:18,x264Preset:'fast',imageFormat:'jpeg',jpegQuality:95,concurrency:2,puppeteerInstance:browser,overwrite:false,...(final?{}:{frameRange:[240,380]}),onProgress:p=>{const n=Math.floor(p.progress*10)*10;if(n!==last){last=n;console.log(`Render ${n}%`);}}});
 await writeFile(path.join(dir,final?'render.json':'preview.json'),JSON.stringify({dest,composition,changedFrames:[268,346],otherFilesPreserved:true,otherScenesUnchanged:true},null,2));
} finally {await browser.close({silent:true});}
