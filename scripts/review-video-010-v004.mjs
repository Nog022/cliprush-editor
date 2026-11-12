import {bundle} from '@remotion/bundler';
import {openBrowser,getCompositions,renderStill,renderMedia} from '@remotion/renderer';
import {readFile,writeFile,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
const dir=path.resolve('out/video-010/reparo-v004');
const manifest=JSON.parse(await readFile(path.join(dir,'preserved.json'),'utf8'));
for(const [file,hash] of Object.entries(manifest)) {
 if(file.replaceAll('\\','/')==='src/Root.tsx')continue;
 if(createHash('sha256').update(await readFile(file)).digest('hex')!==hash)throw Error(`Original changed: ${file}`);
}
console.log(`Preserved ${Object.keys(manifest).length-1} original files`);
const browser=await openBrowser('chrome',{browserExecutable:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const errors=[]; const onBrowserLog=l=>{if(l.type==='error')errors.push(l.text)};
try {
 const serveUrl=await bundle({entryPoint:path.resolve('src/index.ts'),outDir:path.join(dir,'bundle')});
 const composition=(await getCompositions(serveUrl,{puppeteerInstance:browser})).find(c=>c.id==='ClipRushVideo010V004');
 if(!composition||composition.durationInFrames!==1127)throw Error('Wrong composition');
 if(process.argv.includes('--render')) {
 const output=path.resolve('out/video-010/video-010-v004.mp4');
 try {await access(output);throw Error('Export already exists')}catch(e){if(e.code!=='ENOENT')throw e}
 let last=-1;
 await renderMedia({serveUrl,composition,outputLocation:output,codec:'h264',audioCodec:'aac',audioBitrate:'192k',crf:18,pixelFormat:'yuv420p',concurrency:3,puppeteerInstance:browser,onBrowserLog,onProgress:p=>{const n=Math.floor(p.progress*10);if(n!==last){last=n;console.log(`Render ${n*10}%`)}}});
 await writeFile(path.join(dir,'output.json'),JSON.stringify({output,errors},null,2));
 }else {
 const frames=[0,41,42,68,69,105,160,690,691,711,712,724,738,1011,1058,1059,1079,1080,1105,1126];
 for(const frame of frames){await renderStill({serveUrl,composition,frame,output:path.join(dir,`frame-${frame}.jpg`),imageFormat:'jpeg',scale:.5,puppeteerInstance:browser,onBrowserLog});console.log(`Frame ${frame}`)}
 await writeFile(path.join(dir,'review.json'),JSON.stringify({composition,frames,errors},null,2));
 }
 if(errors.length)throw Error(errors.join('\n'));
}finally{await browser.close({silent:true})}
