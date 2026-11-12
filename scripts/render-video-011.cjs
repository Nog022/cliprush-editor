// Reuses the validated v002/v001 local HTTP Range renderer without copying public/.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {bundle} = require('@remotion/bundler');
const {selectComposition, renderStill, renderMedia} = require('@remotion/renderer');

async function main() {
  const final = process.argv.includes('--final');
  const v2 = process.argv.includes('--v2');
  const v4 = process.argv.includes('--v4');
  const manual = v4 || v2 || process.argv.includes('--manual');
  const corrected = manual || process.argv.includes('--corrected');
  const output = path.resolve(v4 ? 'out/ClipRush011-final-v4.mp4' : v2 ? 'out/ClipRush011-final-v2.mp4' : manual ? 'out/ClipRush011-final.mp4' : corrected ? 'out/ClipRush011-corrigido.mp4' : 'out/ClipRush011.mp4');
  const work = path.resolve(v4 ? 'out/video-011/final-v4-review' : v2 ? 'out/video-011/final-v2-review' : manual ? 'out/video-011/final-review' : corrected ? 'out/video-011/correcao' : 'out/video-011');
  fs.mkdirSync(work,{recursive:true});
  // Each still otherwise leaves a complete remote-source download in OS TEMP.
  // Own this invocation's temp tree so only its disposable caches are removed.
  const rendererTemp = corrected ? fs.mkdtempSync(path.join(work,'renderer-temp-')) : null;
  if(rendererTemp){process.env.TEMP=rendererTemp;process.env.TMP=rendererTemp;}
  const clearAssetCaches=async()=>{
    if(!rendererTemp)return;
    for(const entry of fs.readdirSync(rendererTemp,{withFileTypes:true})){
      if(!entry.isDirectory()||!entry.name.startsWith('remotion-v4.0.539-assets'))continue;
      const target=path.resolve(rendererTemp,entry.name);
      if(!target.startsWith(path.resolve(work)+path.sep)||!target.startsWith(rendererTemp+path.sep))throw new Error('Cache target escaped owned temp directory');
      await fs.promises.rm(target,{recursive:true,force:true,maxRetries:10,retryDelay:200});
    }
  };
  const cache = path.join(work, 'bundle-path.txt');
  const compositionHash = crypto.createHash('sha256').update(fs.readFileSync('src/videos/video-011/ClipRush011.tsx')).digest('hex');
  if (final && fs.existsSync(output)) throw new Error('Output already exists; refusing overwrite');
  let root;
  if (final) {
    if (corrected && fs.readFileSync(path.join(work,'reviewed-source.sha256'),'utf8').trim() !== compositionHash) throw new Error('Source changed after review; render new review frames first');
    root = fs.readFileSync(cache, 'utf8').trim();
  }
  else {
    const temp = fs.mkdtempSync(path.join(work, 'review-'));
    const empty = path.join(temp, 'empty-public');
    fs.mkdirSync(empty);
    root = await bundle({entryPoint:'src/index.ts', outDir:path.join(temp,'bundle'), publicDir:empty, rspack:true});
    fs.writeFileSync(cache,root);
  }
  const publicRoot = path.resolve('public');
  const server = http.createServer((req,res)=> {
    let url;
    try {url=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);} catch {res.writeHead(400).end();return;}
    const isPublic=url.startsWith('/public/');
    const base=isPublic?publicRoot:root;
    const file=path.resolve(base,'.'+(isPublic?url.slice(7):url==='/'?'/index.html':url));
    if(!file.startsWith(base+path.sep)){res.writeHead(403).end();return;}
    fs.stat(file,(error,stat)=>{
      if(error||!stat.isFile()){res.writeHead(404).end();return;}
      const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.mp4':'video/mp4','.mp3':'audio/mpeg','.json':'application/json'};
      const headers={'Content-Type':types[path.extname(file)]||'application/octet-stream','Accept-Ranges':'bytes'};
      const range=/^bytes=(\d+)-(\d*)$/.exec(req.headers.range||'');
      const start=range?Number(range[1]):0;
      const end=range&&range[2]?Math.min(Number(range[2]),stat.size-1):stat.size-1;
      if(start>end||start>=stat.size){res.writeHead(416).end();return;}
      if(range)headers['Content-Range']=`bytes ${start}-${end}/${stat.size}`;
      headers['Content-Length']=end-start+1;
      res.writeHead(range?206:200,headers);
      if(req.method==='HEAD')res.end();else fs.createReadStream(file,{start,end}).pipe(res);
    });
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  try {
    const serveUrl=`http://127.0.0.1:${server.address().port}`;
    const composition=await selectComposition({serveUrl,id:'ClipRush011'});
    if(final){
      let last=-1;
      await renderMedia({serveUrl,composition,codec:'h264',pixelFormat:'yuv420p',crf:18,audioBitrate:'192k',outputLocation:output,concurrency:2,onProgress:p=>{const n=Math.floor(p.progress*10);if(n>last){last=n;console.log(`Render ${n*10}% (${p.renderedFrames}/1401 frames)`);}}});
      console.log(`COMPLETE ${output}`);
    } else {
      const frameArg=process.argv.find(a=>a.startsWith('--frames='));
      const frames=frameArg ? frameArg.slice(9).split(',').map(Number) : [40,220,380,570,786,860,925,1180,1365];
      for(const frame of frames){
        let target=path.join(work,`review-${frame}.png`);
        for(let v=2;fs.existsSync(target);v++)target=path.join(work,`review-${frame}-v${v}.png`);
        await renderStill({serveUrl,composition,frame,output:target,imageFormat:'png',scale:.5});
        console.log(`Reviewed frame ${frame}`);
        if(corrected)await clearAssetCaches();
      }
      if(corrected)fs.writeFileSync(path.join(work,'reviewed-source.sha256'),compositionHash);
    }
  }finally{
    await new Promise(resolve=>server.close(resolve));
    if(rendererTemp){
      const target=path.resolve(rendererTemp);
      if(!target.startsWith(path.resolve(work)+path.sep))throw new Error('Temp target escaped correction output directory');
      await fs.promises.rm(target,{recursive:true,force:true,maxRetries:10,retryDelay:200});
    }
  }
}
main().catch(e=>{console.error(e);process.exitCode=1;});
