import {bundle} from '@remotion/bundler';
import {selectComposition,renderStill,renderMedia} from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';
import dns from 'node:dns';
import http from 'node:http';
dns.setDefaultResultOrder('ipv4first');
const root=process.cwd();
const out=path.join(root,'out/video-012');
const mode=process.argv[2]??'preview';
const bundlePath=await bundle({entryPoint:path.join(root,'src/index.ts'),outDir:path.join(out,'bundle'),symlinkPublicDir:true});
// Explicit IPv4 URL also applies to the native compositor's media requests.
const server=http.createServer((req,res)=>{
  const name=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);
  const file=path.resolve(bundlePath,'.'+(name==='/'?'/index.html':name));
  if(!file.startsWith(bundlePath+path.sep)||!fs.existsSync(file)){res.writeHead(404);res.end();return;}
  const size=fs.statSync(file).size;
  const types={'.mp4':'video/mp4','.mp3':'audio/mpeg','.wav':'audio/wav','.png':'image/png','.jpg':'image/jpeg','.html':'text/html','.js':'application/javascript'};
  const headers={'Content-Type':types[path.extname(file)]??'application/octet-stream','Accept-Ranges':'bytes'};
  const range=req.headers.range?.match(/bytes=(\d+)-(\d*)/);
  if(range){const start=Number(range[1]),end=range[2]?Math.min(Number(range[2]),size-1):size-1;res.writeHead(206,{...headers,'Content-Range':`bytes ${start}-${end}/${size}`,'Content-Length':end-start+1});fs.createReadStream(file,{start,end}).pipe(res);}
  else{res.writeHead(200,{...headers,'Content-Length':size});fs.createReadStream(file).pipe(res);}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const serveUrl=`http://127.0.0.1:${server.address().port}`;
const composition=await selectComposition({serveUrl,id:'ClipRush012'});
if(mode==='preview'){
  const frames=process.argv[3]?process.argv[3].split(',').map(Number):[0,130,190,385,440,480,530,675,695,719,760,910,965,1120,1188,1235,1320,1438,1520,1565];
  for(let i=0;i<frames.length;i+=2){
    await Promise.all(frames.slice(i,i+2).map(async frame=>{
      await renderStill({serveUrl,composition,frame,output:path.join(out,`revisao-${String(frame).padStart(4,'0')}.jpg`),imageFormat:'jpeg',scale:0.5,logLevel:'error'});
      console.log('Reviewed frame generated:',frame);
    }));
  }
}else{
  const outputLocation=path.join(out,'video-012-v001.mp4');
  if(fs.existsSync(outputLocation))throw new Error('Refusing to overwrite existing export');
  let last=-1;
  await renderMedia({serveUrl,composition,codec:'h264',crf:18,pixelFormat:'yuv420p',audioCodec:'aac',audioBitrate:'320k',outputLocation,concurrency:2,logLevel:'error',onProgress:({progress})=>{
    const pct=Math.floor(progress*10)*10;
    if(pct!==last){last=pct;console.log(`Render ${pct}%`);}
  }});
  console.log(outputLocation);
}
server.close();
