// Stills + Studio browser inspection only. Never exports video.
import {bundle} from '@remotion/bundler';
import {getCompositions, openBrowser, renderStill} from '@remotion/renderer';
import {access, mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';

const label=process.argv[2]??'review-v001';
const output=path.resolve('out/video-004',label);
await mkdir(output,{recursive:true});
const serveUrl=await bundle({entryPoint:path.resolve('src/index.ts'),outDir:path.join(output,'bundle')});
const browser=await openBrowser('chrome',{browserExecutable:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const errors=[];
const onBrowserLog=log=>{if(log.type==='error') errors.push(log.text);};
try {
  const all=await getCompositions(serveUrl,{puppeteerInstance:browser,onBrowserLog});
  const composition=all.find(c=>c.id==='ClipRushVideo004');
  if(!composition||composition.durationInFrames!==1200||composition.fps!==30||composition.width!==1080||composition.height!==1920) throw new Error('Composition metadata incorrect');
  if(!all.some(c=>c.id==='MyComp'&&c.durationInFrames===60)) throw new Error('Template missing');
  const representative=process.argv[3]?process.argv[3].split(',').map(Number):[0,10,45,79,100,150,200,256,300,355,390,396,432,500,550,590,650,710,742,765,810,855,900,955,1030,1070,1120,1170,1199];
  const transitions=process.argv[3]?[]:[165,285,468,615,879,1056].flatMap(f=>[f-3,f,f+3]);
  const frames=[...new Set([...representative,...transitions])].sort((a,b)=>a-b);
  for(const frame of frames){
    const destination=path.join(output,`frame-${String(frame).padStart(4,'0')}.jpg`);
    const exists=await access(destination).then(()=>true,()=>false);
    if(exists)continue;
    await renderStill({serveUrl,composition,frame,output:destination,imageFormat:'jpeg',jpegQuality:85,scale:.4,puppeteerInstance:browser,overwrite:false,onBrowserLog});
    console.log(`Frame ${frame}/1199`);
  }
  const page=await browser.newPage({context:()=>null,logLevel:'error',indent:false,pageIndex:0,onBrowserLog,onLog:()=>{}});
  await page.setViewport({width:1600,height:1000,deviceScaleFactor:1});
  await page.goto({url:'http://localhost:3000/ClipRushVideo004',timeout:30000});
  let studio;
  for(let i=0;i<30;i++){
    studio=await page.evaluate(()=>({title:document.title,text:document.body.innerText.slice(0,20000),images:[...document.images].map(x=>({src:x.src,complete:x.complete,width:x.naturalWidth})),canvas:document.querySelectorAll('canvas').length}));
    if(studio.text.includes('ClipRushVideo004')&&studio.text.includes('212'))break;
    await new Promise(r=>setTimeout(r,300));
  }
  const screenshot=await page._client().send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
  await writeFile(path.join(output,'studio.png'),Buffer.from(screenshot.value.data,'base64'));
  await writeFile(path.join(output,'studio.json'),JSON.stringify(studio,null,2));
  console.log(JSON.stringify({studioTitle:studio.title,studioText:studio.text.slice(0,1600),images:studio.images}));
  if(errors.length)throw new Error(errors.join('\n'));
  await writeFile(path.join(output,'report.json'),JSON.stringify({compositions:all.map(({id,durationInFrames})=>({id,durationInFrames})),frames,browserErrors:errors,mp4Rendered:false},null,2));
  console.log(`Reviewed ${frames.length} frames. Studio screenshot saved. No MP4.`);
}finally{await browser.close({silent:true});}
