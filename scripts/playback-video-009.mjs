import {openBrowser} from '@remotion/renderer';
import {writeFile, mkdir} from 'node:fs/promises';
const dir='out/video-009/playback-'+(process.argv[2] ?? 'baseline');
await mkdir(dir,{recursive:true});
const browser=await openBrowser('chrome',{browserExecutable:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const errors=[];
try {
  const page=await browser.newPage({context:()=>null,logLevel:'error',indent:false,pageIndex:0,onBrowserLog:l=>{if(l.type==='error') errors.push(l.text);},onLog:()=>{}});
  await page.setViewport({width:1600,height:1000,deviceScaleFactor:1});
  await page.evaluateOnNewDocument(()=>{window.__reviewTools={};Object.defineProperty(document,'modelContext',{value:{registerTool(tool){window.__reviewTools[tool.name]=tool;return Promise.resolve();}},configurable:true});});
  await page.goto({url:'http://localhost:3000/ClipRushVideo009',timeout:30000});
  for(let i=0;i<100;i++){if(await page.evaluate(()=>Boolean(window.__reviewTools?.seek_to_frame)))break;await new Promise(r=>setTimeout(r,200));}
  const call=(name,args={})=>page.evaluate((n,a)=>window.__reviewTools[n].execute(a),name,args);
  const composition=await call('get_composition');
  const samples=[];
  await call('seek_to_frame',{frame:0});
  await call('play');
  const playback=[];
  const start=Date.now();
  while(Date.now()-start<46000){
    await new Promise(r=>setTimeout(r,100));
    const state=await call('get_playback_state');
    playback.push({elapsedMs:Date.now()-start,...state});
  }
  console.log(JSON.stringify({samples:playback.length,first:playback[0],last:playback.at(-1)}));
  await call('pause');await call('seek_to_frame',{frame:1026});
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  const capture=await page._client().send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
  await writeFile(`${dir}/studio-reveal.png`,Buffer.from(capture.value.data,'base64'));
  await writeFile(`${dir}/studio-audit.json`,JSON.stringify({composition,samples,playback,errors},null,2));
  if(errors.length)throw Error(errors.join('\n'));
} finally {await browser.close({silent:true});}
