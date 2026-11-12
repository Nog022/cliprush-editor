import {bundle} from '@remotion/bundler';
import {openBrowser, selectComposition, renderStill, renderMedia} from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';
import http from 'node:http';
import {createHash} from 'node:crypto';

const root = process.cwd();
const out = path.join(root, 'out/video-015');
const mode = process.argv[2] ?? 'frames';
const version = process.argv[3] ?? 'v001';
const emptyPublic = path.join(out, 'empty-public');
fs.mkdirSync(emptyPublic, {recursive: true});
const bundlePath = await bundle({entryPoint: path.join(root, 'src/index.ts'), outDir: path.join(out, `bundle-${version}`), publicDir: emptyPublic, rspack: true});
const server = http.createServer((req, res) => {
  const name = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
  const base = name.startsWith('/public/') ? path.join(root, 'public') : bundlePath;
  const requested = name.startsWith('/public/') ? name.slice(7) : name === '/' ? '/index.html' : name;
  const file = path.resolve(base, '.' + requested);
  if (!file.startsWith(base + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {res.writeHead(404); res.end(); return;}
  const size = fs.statSync(file).size;
  const types = {'.mp4': 'video/mp4', '.webm': 'video/webm', '.jpg': 'image/jpeg', '.json': 'application/json', '.mp3': 'audio/mpeg', '.ttf': 'font/ttf', '.html': 'text/html', '.js': 'application/javascript'};
  const headers = {'Content-Type': types[path.extname(file)] ?? 'application/octet-stream', 'Accept-Ranges': 'bytes'};
  const range = req.headers.range?.match(/bytes=(\d+)-(\d*)/);
  if (range) {
    const start = Number(range[1]), end = range[2] ? Math.min(Number(range[2]), size-1) : size-1;
    if (start > end) {res.writeHead(416);res.end();return;}
    res.writeHead(206, {...headers, 'Content-Range': `bytes ${start}-${end}/${size}`, 'Content-Length': end-start+1});
    fs.createReadStream(file, {start, end}).pipe(res);
  } else {
    res.writeHead(200, {...headers, 'Content-Length': size});
    fs.createReadStream(file).pipe(res);
  }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const browser = await openBrowser('chrome');
const reviewFiles = ['src/videos/video-015/ClipRush015.tsx', 'src/videos/video-015/captions.json', 'public/videos/video-015/audio/narracao.mp3', 'public/videos/video-015/fonts/Arial-Bold.ttf', 'public/videos/video-015/stills/A-v001.jpg', 'public/videos/video-015/stills/B-v001.jpg'];
for (const name of fs.readdirSync(path.join(root, 'public/videos/video-015/media')).filter(name => name.endsWith('.mp4')).sort()) reviewFiles.push(`public/videos/video-015/media/${name}`);
const hashes = () => Object.fromEntries(reviewFiles.map(f => [f, createHash('sha256').update(fs.readFileSync(path.join(root, f))).digest('hex')]));
const review = path.join(out, `revisao-${version}`);
fs.mkdirSync(review, {recursive: true});
try {
  const serveUrl = `http://127.0.0.1:${server.address().port}`;
  const composition = await selectComposition({serveUrl, id: 'ClipRush015', puppeteerInstance: browser});
  if (mode === 'frames') {
    const frames = process.argv[4] ? process.argv[4].split(',').map(Number) : [0,29,40,70,135,175,196,211,240,300,385,445,463,490,510,560,637,650,665,690,712,725,738,754,774,820,940,1010,1080,1145,1191];
    for (let i=0;i<frames.length;i+=2) {
      await Promise.all(frames.slice(i,i+2).map(async frame => {
        await renderStill({serveUrl, composition, puppeteerInstance: browser, frame, output: path.join(review, `${String(frame).padStart(4, '0')}.jpg`), imageFormat: 'jpeg', jpegQuality: 95, scale: .5, overwrite: false, logLevel: 'error', timeoutInMilliseconds: 120000});
      }));
      console.log(`Frames ${Math.min(i+2,frames.length)}/${frames.length}`);
    }
    fs.writeFileSync(path.join(review, 'source-hashes.json'), JSON.stringify(hashes(), null, 2));
  } else {
    const approvalPath = path.join(review, 'revisado.json');
    if (!fs.existsSync(approvalPath)) throw new Error('Inspect representative frames of all blocks before any video render.');
    const approval = JSON.parse(fs.readFileSync(approvalPath, 'utf8'));
    if (JSON.stringify(approval.sourceHashes) !== JSON.stringify(hashes())) throw new Error('Visual sources changed after review.');
    const ranges = mode === 'previews' ? [['inicio', 0, 116], ['comparacao', 711, 791], ['fim', 1055, 1191]] : [['final', 0, 1191]];
    for (const [name, first, last] of ranges) {
      const outputLocation = path.join(out, name === 'final' ? `video-015-${version}.mp4` : `previa-${name}-${version}.mp4`);
      if (fs.existsSync(outputLocation)) throw new Error('Refusing to overwrite existing output: ' + outputLocation);
      let reported = -1;
      await renderMedia({serveUrl, composition, puppeteerInstance: browser, frameRange: [first, last], codec: 'h264', crf: 18, pixelFormat: 'yuv420p', audioCodec: 'aac', audioBitrate: '320k', outputLocation, concurrency: 2, imageFormat: 'jpeg', jpegQuality: 95, overwrite: false, logLevel: 'error', timeoutInMilliseconds: 120000, onProgress: ({progress}) => {
        const pct = Math.floor(progress*10)*10;
        if (pct !== reported) {reported = pct; console.log(`${name} ${pct}%`);}
      }});
      console.log(outputLocation);
    }
  }
} finally {
  await browser.close({silent: true});
  server.closeAllConnections();
  server.close();
}
