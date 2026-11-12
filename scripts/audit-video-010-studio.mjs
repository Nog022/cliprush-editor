import {openBrowser} from '@remotion/renderer';
import {writeFile, mkdir} from 'node:fs/promises';
const dir='out/video-010/studio-v001';
await mkdir(dir,{recursive:true});
const browser=await openBrowser('chrome',{browserExecutable:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const errors=[];
try {
  const page=await browser.newPage({context:()=>null,logLevel:'error',indent:false,pageIndex:0,onBrowserLog:l=>{if(l.type==='error')errors.push(l.text);},onLog:()=>{}});
  await page.setViewport({width:1600,height:1000,deviceScaleFactor:1});
  await page.evaluateOnNewDocument(()=>{window.__reviewTools={};Object.defineProperty(document,'modelContext',{value:{registerTool(tool){window.__reviewTools[tool.name]=tool;return Promise.resolve();}},configurable:true});});
  await page.goto({url:'http://localhost:3000/ClipRushVideo010',timeout:30000});
  for(let i=0;i<100;i++){if(await page.evaluate(()=>Boolean(window.__reviewTools?.seek_to_frame)))break;await new Promise(r=>setTimeout(r,200));}
  const call=(name,args={})=>page.evaluate((n,a)=>window.__reviewTools[n].execute(a),name,args);
  const composition=await call('get_composition');
  const samples=[];
  const cuts=[116,218,270,347,427,506,602,635,674,715,758,789,851,998];
  const frames=[...new Set([0,1188,...Array.from({length:40},(_,i)=>i*30),...cuts.flatMap(f=>[f-1,f,f+1])])].sort((a,b)=>a-b);
  for(const frame of frames){
    await call('seek_to_frame',{frame});
    await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
    const sample=await page.evaluate(()=>({
      text:[...document.querySelectorAll('[data-safe]')].map(el=>({kind:el.dataset.safe,text:el.textContent,width:el.clientWidth,scroll:el.scrollWidth})),
      videos:[...document.querySelectorAll('video')].map(el=>({src:el.currentSrc,time:el.currentTime,error:el.error?.message})),
    }));
    if(sample.text.some(x=>x.scroll>x.width+2))throw Error(`Text overflow at frame ${frame}`);
    if(sample.videos.some(x=>x.error))throw Error(`Video error at frame ${frame}`);
    samples.push({frame,...sample});
  }
  console.log(`Scrubbed ${samples.length} timeline positions.`);
  await call('seek_to_frame',{frame:0}); await call('play');
  const playback=[];
  for(let i=0;i<9;i++){
    await new Promise(r=>setTimeout(r,5000));
    const state=await call('get_playback_state');playback.push(state);
    console.log(`Playback frame ${state.currentFrame}; playing=${state.playing}`);
  }
  await call('pause');await call('seek_to_frame',{frame:825});
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  const capture=await page._client().send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
  await writeFile(`${dir}/studio.png`,Buffer.from(capture.value.data,'base64'));
  await writeFile(`${dir}/audit.json`,JSON.stringify({composition,samples,playback,errors},null,2));
  if(errors.length)throw Error(errors.join('\n'));
}finally{await browser.close({silent:true});}
