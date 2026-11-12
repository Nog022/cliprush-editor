// Exercise the actual Studio timeline through its locally installed WebMCP API.
import {openBrowser} from '@remotion/renderer';
import {writeFile} from 'node:fs/promises';

const browser=await openBrowser('chrome',{browserExecutable:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const errors=[];
const scrubOnly=process.argv.includes('--scrub-only');
try{
  const page=await browser.newPage({context:()=>null,logLevel:'error',indent:false,pageIndex:0,onBrowserLog:l=>{if(l.type==='error')errors.push(l.text);},onLog:()=>{}});
  await page.setViewport({width:1600,height:1000,deviceScaleFactor:1});
  await page.evaluateOnNewDocument(()=>{
    window.__reviewTools={};
    Object.defineProperty(document,'modelContext',{value:{registerTool(tool){window.__reviewTools[tool.name]=tool;return Promise.resolve();}},configurable:true});
  });
  await page.goto({url:'http://localhost:3000/ClipRushVideo004',timeout:30000});
  for(let i=0;i<60;i++){
    if(await page.evaluate(()=>Boolean(window.__reviewTools?.seek_to_frame)))break;
    await new Promise(r=>setTimeout(r,200));
  }
  const call=(name,args={})=>page.evaluate((n,a)=>window.__reviewTools[n].execute(a),name,args);
  const composition=await call('get_composition');
  const samples=[];
  const frames=[...new Set([...Array.from({length:80},(_,i)=>i*15),1199,...[165,285,468,615,879,1056].flatMap(f=>[f-1,f,f+1])])].sort((a,b)=>a-b);
  for(const frame of frames){
    await call('seek_to_frame',{frame});
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    const result=await page.evaluate(()=>({
      images:[...document.images].map(x=>({src:x.src,loaded:x.complete&&x.naturalWidth>0})),
      captions:[...document.querySelectorAll('[data-safe="captions"]')].map(x=>({text:x.textContent,width:x.scrollWidth,height:x.scrollHeight})),
      headings:[...document.querySelectorAll('[data-safe="headline"]')].map(x=>({text:x.textContent,width:x.scrollWidth,height:x.scrollHeight})),
    }));
    if(result.images.some(x=>!x.loaded))throw new Error(`Unloaded image at frame ${frame}`);
    if(result.captions.some(x=>x.width>830))throw new Error(`Caption overflow at ${frame}`);
    if(result.headings.some(x=>x.width>840))throw new Error(`Heading overflow at ${frame}`);
    samples.push({frame,...result});
  }
  console.log(`Scrubbed ${samples.length} timeline positions; all images loaded, no caption/headline overflow.`);
  await call('seek_to_frame',{frame:0});
  await call('play');
  const playback=[];
  for(let i=0;i<(scrubOnly?0:9);i++){
    await new Promise(r=>setTimeout(r,5000));
    const state=await call('get_playback_state');
    playback.push(state);
    console.log(`Playback frame ${state.currentFrame} / 1199; playing=${state.playing}`);
  }
  await call('pause');
  await call('seek_to_frame',{frame:100});
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  const screenshot=await page._client().send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
  await writeFile('out/video-004/review-v002/studio-hook.png',Buffer.from(screenshot.value.data,'base64'));
  await writeFile(`out/video-004/review-v002/${scrubOnly?'caption-audit':'studio-audit'}.json`,JSON.stringify({composition,samples,playback,browserErrors:errors},null,2));
  if(errors.length)throw new Error(errors.join('\n'));
}finally{await browser.close({silent:true});}
