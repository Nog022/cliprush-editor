import {bundle} from '@remotion/bundler';
import {getCompositions,openBrowser,renderStill,renderMedia} from '@remotion/renderer';
import {access,mkdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
const render=process.argv.includes('--render');
const dir=path.resolve('out/video-006',render?'render-v001':'review-v001');
await mkdir(dir,{recursive:true});
const serveUrl=await bundle({entryPoint:path.resolve('src/index.ts'),outDir:path.join(dir,'bundle')});
const browser=await openBrowser('chrome',{browserExecutable:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const errors=[];
const onBrowserLog=log=>{if(log.type==='error')errors.push(log.text);};
try{
  const all=await getCompositions(serveUrl,{puppeteerInstance:browser,onBrowserLog});
  const composition=all.find(c=>c.id==='ClipRushVideo006');
  if(!composition||composition.durationInFrames!==1305||composition.fps!==30||composition.width!==1080||composition.height!==1920)throw new Error('Wrong metadata');
  const baseline=JSON.parse(await readFile('out/video-006/preserved.json','utf8'));
  for(const file of baseline)if(createHash('sha256').update(await readFile(file.file)).digest('hex')!==file.sha256)throw new Error(`Original modified: ${file.file}`);
  const inventory=JSON.parse(await readFile('src/videos/video-006/inventory.json','utf8'));
  for(const item of inventory)if(createHash('sha256').update(await readFile(path.join('public',item.file))).digest('hex')!==item.sha256)throw new Error(`Source modified: ${item.file}`);
  if(render){
    const destination=path.resolve('out/ClipRushVideo006.mp4');
    if(await access(destination).then(()=>true,()=>false))throw new Error('Output exists; preserve it and choose a versioned name.');
    let previous=-1;
    const result=await renderMedia({serveUrl,composition,outputLocation:destination,codec:'h264',pixelFormat:'yuv420p',audioCodec:'aac',audioBitrate:'192k',crf:18,x264Preset:'medium',imageFormat:'jpeg',jpegQuality:95,concurrency:2,puppeteerInstance:browser,overwrite:false,onBrowserLog,onProgress:p=>{const percent=Math.floor(p.progress*20)*5;if(percent!==previous){previous=percent;console.log(`Render ${percent}% | ${p.renderedFrames}/1305`);}}});
    await writeFile(path.join(dir,'report.json'),JSON.stringify({composition,destination,browserErrors:errors,preservedFiles:baseline.length,slowestFrames:result.slowestFrames},null,2));
  }else{
    const frames=[0,30,80,145,215,260,310,365,415,465,510,580,650,710,770,815,900,980,1040,1110,1155,1180,1215,1275,1304];
    for(const frame of process.argv.includes('--studio-only')?[]:frames){
      await renderStill({serveUrl,composition,frame,output:path.join(dir,`frame-${String(frame).padStart(4,'0')}.jpg`),imageFormat:'jpeg',jpegQuality:90,scale:.5,puppeteerInstance:browser,overwrite:true,onBrowserLog});
      console.log(`Frame ${frame}`);
    }
    const page=await browser.newPage({context:()=>null,logLevel:'error',indent:false,pageIndex:0,onBrowserLog,onLog:()=>{}});
    await page.setViewport({width:1600,height:1000,deviceScaleFactor:1});
    await page.evaluateOnNewDocument(()=>{
      window.__reviewTools={};
      Object.defineProperty(document,'modelContext',{configurable:true,value:{registerTool(tool){window.__reviewTools[tool.name]=tool;return Promise.resolve();}}});
    });
    await page.goto({url:'http://localhost:3000/ClipRushVideo006',timeout:30000});
    for(let i=0;i<100;i++){
      if(await page.evaluate(()=>Boolean(window.__reviewTools?.seek_to_frame)))break;
      await new Promise(r=>setTimeout(r,200));
    }
    const call=(name,args={})=>page.evaluate((n,a)=>window.__reviewTools[n].execute(a),name,args);
    const sampled=[];
    for(const frame of [...new Set([...Array.from({length:87},(_,i)=>i*15),...frames,1144,1145])].sort((a,b)=>a-b)){
      await call('seek_to_frame',{frame});
      await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
      const state=await page.evaluate(()=>({
        shots:[...document.querySelectorAll('[data-shot]')].filter(e=>e.checkVisibility({checkOpacity:true,checkVisibilityCSS:true})).map(e=>e.getAttribute('data-shot')),
        texts:[...document.querySelectorAll('[data-safe]')].filter(e=>e.checkVisibility({checkOpacity:true,checkVisibilityCSS:true})).map(e=>({type:e.getAttribute('data-safe'),text:e.textContent,width:e.scrollWidth,clientWidth:e.clientWidth,height:e.scrollHeight})),
      }));
      if(!state.shots.length)throw new Error(`No scene at ${frame}`);
      if(state.texts.some(t=>t.width>t.clientWidth+2))throw new Error(`Overflow at ${frame}`);
      if(state.texts.some(t=>t.type==='caption'&&t.height>160))throw new Error(`Caption exceeds two lines at ${frame}`);
      if(frame<1145&&state.texts.some(t=>t.text.includes('600')))throw new Error(`Early reveal at ${frame}`);
      sampled.push({frame,...state});
    }
    await call('seek_to_frame',{frame:1155});
    await new Promise(r=>setTimeout(r,1200));
    const shot=await page._client().send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
    await writeFile(path.join(dir,'studio.png'),Buffer.from(shot.value.data,'base64'));
    const currentError=await call('get_current_error');
    await writeFile(path.join(dir,'report.json'),JSON.stringify({composition,frames,sampled,currentError,browserErrors:errors,preservedFiles:baseline.length},null,2));
    console.log(`Studio verified at ${sampled.length} frames; ${baseline.length} originals preserved.`);
  }
  if(errors.length)throw new Error(errors.join('\n'));
}finally{await browser.close({silent:true});}
