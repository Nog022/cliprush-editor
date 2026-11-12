import {bundle} from '@remotion/bundler';
import {getCompositions,openBrowser,renderStill,renderMedia} from '@remotion/renderer';
import {access,mkdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';

const label=process.argv[2]??'review-v001';
const rendering=process.argv.includes('--render');
const output=path.resolve('out/video-005',label);
await mkdir(output,{recursive:true});
const serveUrl=await bundle({entryPoint:path.resolve('src/index.ts'),outDir:path.join(output,'bundle')});
const browser=await openBrowser('chrome',{browserExecutable:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const errors=[];
const onBrowserLog=log=>{if(log.type==='error')errors.push(log.text);};
try{
  const all=await getCompositions(serveUrl,{puppeteerInstance:browser,onBrowserLog});
  const composition=all.find(c=>c.id==='ClipRushVideo005');
  if(!composition||composition.durationInFrames!==1171||composition.fps!==30||composition.width!==1080||composition.height!==1920)throw new Error('Incorrect metadata');
  const baseline=JSON.parse(await readFile('out/video-005/preserved-before.json','utf8'));
  for(const item of baseline){
    if(createHash('sha256').update(await readFile(item.file)).digest('hex')!==item.sha256)throw new Error(`Original changed: ${item.file}`);
  }
  if(rendering){
    const destination=path.resolve('out/video-005/video-005-v001.mp4');
    if(await access(destination).then(()=>true,()=>false))throw new Error('MP4 already exists; choose a new version.');
    let previous=-1;
    const result=await renderMedia({serveUrl,composition,outputLocation:destination,codec:'h264',pixelFormat:'yuv420p',audioCodec:'aac',audioBitrate:'192k',crf:18,x264Preset:'medium',imageFormat:'jpeg',jpegQuality:95,concurrency:2,puppeteerInstance:browser,overwrite:false,onBrowserLog,
      onProgress:p=>{const percent=Math.floor(p.progress*20)*5;if(percent!==previous){previous=percent;console.log(`Render ${percent}% | ${p.renderedFrames}/1171 frames`);}}});
    await writeFile(path.join(output,'render-report.json'),JSON.stringify({file:destination,composition,slowestFrames:result.slowestFrames,browserErrors:errors,preservedFiles:baseline.length},null,2));
    console.log(`MP4 created: ${destination}`);
  }else{
    const custom=process.argv.find(a=>a.startsWith('--frames='));
    const frames=custom?custom.slice(9).split(',').map(Number):[0,30,46,65,73,110,175,204,226,252,283,300,360,405,440,476,515,565,620,660,700,723,744,769,800,842,861,900,912,921,948,965,966,975,1010,1048,1060,1120,1169,1170];
    for(const frame of frames){
      const target=path.join(output,`frame-${String(frame).padStart(4,'0')}.jpg`);
      await renderStill({serveUrl,composition,frame,output:target,imageFormat:'jpeg',jpegQuality:90,scale:.4,puppeteerInstance:browser,overwrite:false,onBrowserLog});
      console.log(`Still ${frame}/1170`);
    }
    const page=await browser.newPage({context:()=>null,logLevel:'error',indent:false,pageIndex:0,onBrowserLog,onLog:()=>{}});
    await page.setViewport({width:1600,height:1000,deviceScaleFactor:1});
    await page.evaluateOnNewDocument(()=>{
      window.__reviewTools={};
      Object.defineProperty(document,'modelContext',{configurable:true,value:{registerTool(tool){window.__reviewTools[tool.name]=tool;return Promise.resolve();}}});
    });
    await page.goto({url:'http://localhost:3000/ClipRushVideo005',timeout:30000});
    for(let i=0;i<60;i++){
      if(await page.evaluate(()=>Boolean(window.__reviewTools?.seek_to_frame)))break;
      await new Promise(r=>setTimeout(r,200));
    }
    const call=(name,args={})=>page.evaluate((n,a)=>window.__reviewTools[n].execute(a),name,args);
    const sampled=[];
    const sampleFrames=[...new Set([...Array.from({length:79},(_,i)=>Math.min(1170,i*15)),...frames,965,966])].sort((a,b)=>a-b);
    for(const frame of sampleFrames){
      await call('seek_to_frame',{frame});
      await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
      await page.evaluate(async()=>{
        for(let retry=0;retry<60;retry++){
          if([...document.images].every(x=>x.complete&&x.naturalWidth>0))return;
          await new Promise(resolve=>setTimeout(resolve,50));
        }
      });
      const state=await page.evaluate(()=>({
        images:[...document.images].map(x=>({src:x.src,loaded:x.complete&&x.naturalWidth>0})),
        text:[...document.querySelectorAll('[data-safe]')].map(x=>({kind:x.getAttribute('data-safe'),text:x.textContent,width:x.scrollWidth,clientWidth:x.clientWidth,height:x.scrollHeight})),
        family:Boolean(document.querySelector('[data-reveal="family"]')),
      }));
      if(state.images.some(i=>!i.loaded))throw new Error(`Image not loaded at ${frame}`);
      if(state.text.some(t=>t.width>t.clientWidth+2))throw new Error(`Text overflow at ${frame}: ${JSON.stringify(state.text)}`);
      if(frame<966&&(state.family||state.text.some(t=>/família/i.test(t.text))))throw new Error(`Early spoiler at ${frame}`);
      if(frame>=966&&frame<1050&&!state.family)throw new Error(`Missing reveal at ${frame}`);
      sampled.push({frame,...state});
    }
    await call('seek_to_frame',{frame:975});
    await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
    const shot=await page._client().send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
    await writeFile(path.join(output,'studio.png'),Buffer.from(shot.value.data,'base64'));
    const currentError=await call('get_current_error');
    await writeFile(path.join(output,'review-report.json'),JSON.stringify({composition,frames,sampled,currentError,browserErrors:errors,preservedFiles:baseline.length},null,2));
    console.log(`Studio verified: ${sampled.length} positions, no early family reveal; ${baseline.length} originals preserved.`);
  }
  if(errors.length)throw new Error(errors.join('\n'));
}finally{await browser.close({silent:true});}
