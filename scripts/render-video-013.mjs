import {bundle} from '@remotion/bundler';
import {selectComposition,renderStill,renderMedia} from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';
import dns from 'node:dns';
import http from 'node:http';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
dns.setDefaultResultOrder('ipv4first');
const root=process.cwd();
const out=path.join(root,'out/video-013');
const mode=process.argv[2]??'preview';
const emptyPublic=path.join(out,'empty-public');
fs.mkdirSync(emptyPublic,{recursive:true});
const bundlePath=await bundle({entryPoint:path.join(root,'src/index.ts'),outDir:path.join(out,'bundle-v002'),publicDir:emptyPublic});
const server=http.createServer((req,res)=>{
  const name=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);
  const base=name.startsWith('/public/')?path.join(root,'public'):bundlePath;
  const requestPath=name.startsWith('/public/')?name.slice(7):(name==='/'?'/index.html':name);
  const file=path.resolve(base,'.'+requestPath);
  if(!file.startsWith(base+path.sep)||!fs.existsSync(file)){res.writeHead(404);res.end();return;}
  const size=fs.statSync(file).size;
  const types={'.mp4':'video/mp4','.webm':'video/webm','.jpg':'image/jpeg','.json':'application/json','.mp3':'audio/mpeg','.wav':'audio/wav','.png':'image/png','.html':'text/html','.js':'application/javascript'};
  const headers={'Content-Type':types[path.extname(file)]??'application/octet-stream','Accept-Ranges':'bytes'};
  const range=req.headers.range?.match(/bytes=(\d+)-(\d*)/);
  if(range){const start=Number(range[1]),end=range[2]?Math.min(Number(range[2]),size-1):size-1;res.writeHead(206,{...headers,'Content-Range':`bytes ${start}-${end}/${size}`,'Content-Length':end-start+1});fs.createReadStream(file,{start,end}).pipe(res);}
  else{res.writeHead(200,{...headers,'Content-Length':size});fs.createReadStream(file).pipe(res);}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
try {
  const serveUrl=`http://127.0.0.1:${server.address().port}`;
  const composition=await selectComposition({serveUrl,id:'ClipRush013'});
  if(mode==='preview'){
    const frames=process.argv[3]?process.argv[3].split(',').map(Number):[0,45,77,113,175,224,265,315,380,416,426,460,510,560,680,705,719,745,770,807,828,865,893,905,940,982,1020,1049,1074,1098,1128,1160,1200,1240,1290,1359];
    const directory=path.join(out,'review-v002');
    fs.mkdirSync(directory,{recursive:true});
    for(let i=0;i<frames.length;i+=2){
      await Promise.all(frames.slice(i,i+2).map(async frame=>{
        await renderStill({serveUrl,composition,frame,output:path.join(directory,`frame-${String(frame).padStart(4,'0')}.jpg`),imageFormat:'jpeg',scale:.5,logLevel:'error'});
      }));
      console.log(`Preview ${Math.min(i+2,frames.length)}/${frames.length}`);
    }
  }else{
    const approvalFile=path.join(out,'review-v002','approved.json');
    if(!fs.existsSync(approvalFile)) throw new Error('Visual review required for this revision before full render');
    const approval=JSON.parse(fs.readFileSync(approvalFile,'utf8'));
    for(const [file,digest] of Object.entries(approval.sourceHashes)){
      if(createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex')!==digest)throw new Error(`Source changed since visual review: ${file}`);
    }
    let version=1;
    while(fs.existsSync(path.join(out,`video-013-v${String(version).padStart(3,'0')}.mp4`))) version++;
    const outputLocation=path.join(out,`video-013-v${String(version).padStart(3,'0')}.mp4`);
    const visualOnly=path.join(out,'revision-v002','visual-only.mp4');
    if(fs.existsSync(visualOnly))throw new Error('Visual-only intermediate already exists');
    let last=-1;
    await renderMedia({serveUrl,composition,codec:'h264',crf:18,pixelFormat:'yuv420p',muted:true,outputLocation:visualOnly,concurrency:2,logLevel:'error',onProgress:({progress})=>{
      const pct=Math.floor(progress*10)*10;
      if(pct!==last){last=pct;console.log(`Render ${pct}%`);}
    }});
    // Copy the existing encoded audio verbatim: no decode, remix or resampling.
    execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-n','-i',visualOnly,'-i',path.join(out,'video-013-v001.mp4'),'-map','0:v:0','-map','1:a:0','-c','copy','-map_metadata','-1','-movflags','+faststart',outputLocation],{stdio:'inherit'});
    console.log(outputLocation);
  }
} finally {server.close();}
