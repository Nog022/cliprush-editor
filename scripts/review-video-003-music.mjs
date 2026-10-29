// New images and a five-second audiovisual mix test only; no final export.
import {bundle} from '@remotion/bundler';
import {getCompositions, openBrowser, renderStill, renderMedia} from '@remotion/renderer';
import {mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
const output=path.resolve('out/video-003/music-review/render-v001');
await mkdir(output,{recursive:true});
const serveUrl=await bundle({entryPoint:path.resolve('src/index.ts'),outDir:path.join(output,'bundle')});
const browser=await openBrowser('chrome',{browserExecutable:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const compositions=await getCompositions(serveUrl,{puppeteerInstance:browser});
 const composition=compositions.find(c=>c.id==='ClipRushVideo003');
 if(!composition||composition.durationInFrames!==1445)throw new Error('Duration changed');
 for(const frame of [60,540,560,595,610,650,685,700,850,1310]){
  await renderStill({serveUrl,composition,frame,output:path.join(output,`frame-${frame}.jpg`),imageFormat:'jpeg',scale:.4,puppeteerInstance:browser,overwrite:false});
  console.log(`Frame ${frame}`);
 }
 for(const codec of ['wav','h264']){
  await renderMedia({serveUrl,composition,codec,frameRange:[555,704],outputLocation:path.join(output,`mix-test-5s.${codec==='wav'?'wav':'mp4'}`),scale:.35,concurrency:2,puppeteerInstance:browser,overwrite:false});
  console.log(`Mix test ${codec} complete`);
 }
 const page=await browser.newPage({context:()=>null,logLevel:'error',indent:false,pageIndex:0,onBrowserLog:null,onLog:()=>{}});
 await page.goto({url:'http://localhost:3000/ClipRushVideo003',timeout:30000});
 await new Promise(r=>setTimeout(r,1500));
 await page.evaluate(()=>document.querySelector('button[aria-label="Play"]').click());
 const playback=await page.evaluate(()=>new Promise(resolve=>{const samples=[];const timer=setInterval(()=>{samples.push([...document.querySelectorAll('button')].filter(b=>/^\d+$/.test(b.getAttribute('aria-label')||'')).map(b=>({frame:b.getAttribute('aria-label'),time:b.textContent})));if(samples.length===12){clearInterval(timer);resolve(samples);}},1000);}));
 await writeFile(path.join(output,'validation.json'),JSON.stringify({duration:composition.durationInFrames,playback},null,2));
 console.log('Studio playback:',JSON.stringify(playback));
}finally{await browser.close({silent:true});}
