import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { safePath } from './video-retention.mjs';

// Serve the existing library in place; never copy it into a Remotion bundle.
export async function serveProduction(root, bundled) {
  const server = createServer((request,response) => {
    void (async()=>{
      const pathname=decodeURIComponent(new URL(request.url,'http://localhost').pathname);
      const isPublic=pathname.startsWith('/public/');
      const base=isPublic?root:bundled;
      const relative=isPublic?'public/'+pathname.slice(8):pathname==='/'?'index.html':pathname.slice(1);
      const file=await safePath(base,relative);
      const info=await stat(file);
      if(!info.isFile() || !['GET','HEAD'].includes(request.method)) { response.writeHead(404).end();return; }
      let start=0,end=info.size-1;
      const range=request.headers.range;
      if(range){const m=/^bytes=(\d+)-(\d*)$/.exec(range);if(!m){response.writeHead(416).end();return;}start=Number(m[1]);if(m[2])end=Math.min(end,Number(m[2]));}
      if(start>end || end>=info.size){response.writeHead(416).end();return;}
      const ext=file.slice(file.lastIndexOf('.')).toLowerCase();
      const types={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.mp4':'video/mp4','.mp3':'audio/mpeg','.wav':'audio/wav','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.ttf':'font/ttf'};
      response.writeHead(range?206:200,{'Content-Type':types[ext]||'application/octet-stream','Content-Length':end-start+1,'Accept-Ranges':'bytes',...(range?{'Content-Range':`bytes ${start}-${end}/${info.size}`}:{})});
      if(request.method==='HEAD')response.end();else createReadStream(file,{start,end}).on('error',()=>response.destroy()).pipe(response);
    })().catch(()=>{if(!response.headersSent)response.writeHead(404);response.end();});
  });
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  return {url:`http://127.0.0.1:${server.address().port}`,close:async()=>{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}};
}
