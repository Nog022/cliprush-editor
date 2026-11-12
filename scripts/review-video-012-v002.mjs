import {bundle} from '@remotion/bundler';
import {selectComposition, renderStill, renderMedia} from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';
import dns from 'node:dns';
import http from 'node:http';

dns.setDefaultResultOrder('ipv4first');
const root = process.cwd();
const base = path.join(root, 'out/video-012/refinamento-v002');
const mode = process.argv[2] ?? 'stills';
const pass = process.argv[4] ?? 'pass-01';
if (!/^[a-z0-9-]+$/i.test(pass)) throw new Error('Invalid review folder');
const out = path.join(base, pass);
fs.mkdirSync(out, {recursive: true});
const bundlePath = await bundle({entryPoint: path.join(root, 'src/index.ts'), outDir: path.join(base, 'bundle'), symlinkPublicDir: true});
// Native compositor media requests need an explicit IPv4 origin on this host.
const server = http.createServer((req, res) => {
  const name = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
  const file = path.resolve(bundlePath, '.' + (name === '/' ? '/index.html' : name));
  if (!file.startsWith(bundlePath + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {res.writeHead(404); res.end(); return;}
  const size = fs.statSync(file).size;
  const types = {'.mp4': 'video/mp4', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.png': 'image/png', '.jpg': 'image/jpeg', '.html': 'text/html', '.js': 'application/javascript'};
  const headers = {'Content-Type': types[path.extname(file)] ?? 'application/octet-stream', 'Accept-Ranges': 'bytes'};
  const range = req.headers.range?.match(/bytes=(\d+)-(\d*)/);
  if (range) {
    const start = Number(range[1]), end = range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
    res.writeHead(206, {...headers, 'Content-Range': `bytes ${start}-${end}/${size}`, 'Content-Length': end - start + 1});
    fs.createReadStream(file, {start, end}).pipe(res);
  } else {res.writeHead(200, {...headers, 'Content-Length': size}); fs.createReadStream(file).pipe(res);}
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
try {
  const serveUrl = `http://127.0.0.1:${server.address().port}`;
  const composition = await selectComposition({serveUrl, id: 'ClipRush012'});
  if (mode === 'stills') {
    const frames = (process.argv[3] ?? '0,134,190,290,365,400,430,475,530,680,694,698,710,725,780,860,915,950,1050,1135,1175,1198,1240,1340,1399,1420,1430,1454,1475,1497,1540,1565').split(',').map(Number);
    for (const frame of frames) {
      const output = path.join(out, `frame-${String(frame).padStart(4, '0')}.jpg`);
      if (fs.existsSync(output)) throw new Error(`Review already exists: ${output}`);
      await renderStill({serveUrl, composition, frame, output, imageFormat: 'jpeg', scale: 0.5, logLevel: 'error'});
      console.log(`Frame ${frame}`);
    }
  } else if (mode === 'motion') {
    // Includes every transition and the complete door tracking/face approach.
    const windows = JSON.parse(process.argv[3] ?? '[[275,305],[505,535],[670,740],[845,875],[914,960],[924,1208],[1183,1220],[1384,1510]]');
    for (const [start, end] of windows) {
      const outputLocation = path.join(out, `motion-${start}-${end}.mp4`);
      if (fs.existsSync(outputLocation)) throw new Error(`Review already exists: ${outputLocation}`);
      await renderMedia({serveUrl, composition, codec: 'h264', scale: 0.5, crf: 20, pixelFormat: 'yuv420p', audioCodec: 'aac', audioBitrate: '192k', frameRange: [start, end], outputLocation, concurrency: 2, logLevel: 'error'});
      console.log(`Motion ${start}-${end}`);
    }
  } else if (mode === 'audio') {
    const outputLocation = path.join(out, 'mix-revisao.wav');
    if (fs.existsSync(outputLocation)) throw new Error(`Review already exists: ${outputLocation}`);
    await renderMedia({serveUrl, composition, codec: 'wav', outputLocation, concurrency: 2, logLevel: 'error'});
    console.log('Audio review ready');
  } else {throw new Error('Use stills, motion or audio; this script does not export the full video.');}
} finally {server.close();}
