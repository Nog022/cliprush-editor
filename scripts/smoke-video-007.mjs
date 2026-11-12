import {getCompositions,openBrowser,renderStill} from '@remotion/renderer';
import path from 'node:path';
const browser=await openBrowser('chrome',{browserExecutable:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{const serveUrl=path.resolve('out/video-007/bundle');const all=await getCompositions(serveUrl,{puppeteerInstance:browser});for(const c of all.filter(c=>c.id!=='ClipRushVideo007')){await renderStill({serveUrl,composition:c,frame:0,output:path.resolve(`out/video-007/smoke-${c.id}.jpg`),imageFormat:'jpeg',scale:.2,puppeteerInstance:browser});console.log(c.id+' OK');}}finally{await browser.close({silent:true});}
