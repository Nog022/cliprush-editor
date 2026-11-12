import fs from 'node:fs';
import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {openBrowser, selectComposition, renderStill, renderMedia} from '@remotion/renderer';

const root = process.cwd();
const out = path.join(root, 'out/video-014');
const mode = process.argv[2] ?? 'frames';
const version = process.argv[3] ?? 'v001';
const timeline = JSON.parse(fs.readFileSync('src/videos/video-014/timeline.json', 'utf8'));
const staging = path.join(out, `public-${version}`);
const productionLink = path.join(staging, 'videos/video-014');
fs.mkdirSync(path.dirname(productionLink), {recursive:true});
if (fs.existsSync(productionLink) && fs.lstatSync(productionLink).isSymbolicLink()) fs.unlinkSync(productionLink);
fs.cpSync(path.join(root, 'public/videos/video-014'), productionLink, {recursive:true});
const serveUrl = await bundle({entryPoint:path.join(root, 'src/index.ts'), publicDir:staging, outDir:path.join(out, `bundle-${version}`), rspack:true, onSymlinkDetected:() => {}});
const browser = await openBrowser('chrome');
try {
  const composition = await selectComposition({serveUrl, id:'ClipRush014', puppeteerInstance:browser});
  if (mode === 'frames') {
    const dir = path.join(out, `revisao-${version}`);
    fs.mkdirSync(dir, {recursive:true});
    const frames = [...new Set([0, ...timeline.scenes.flatMap((s) => [s.from+Math.min(35,s.duration-1), s.from+Math.floor(s.duration/2), s.from+s.duration-20]), 1839])];
    for (let i=0;i<frames.length;i+=3) {
      await Promise.all(frames.slice(i,i+3).map(async (frame) => {
        await renderStill({serveUrl, composition, puppeteerInstance:browser, frame, scale:0.5, imageFormat:'png', output:path.join(dir, `${String(frame).padStart(4,'0')}.png`), overwrite:false});
        console.log('Reviewed frame rendered',frame);
      }));
    }
  } else if (mode === 'preview') {
    const approval = path.join(out, `revisao-visual-${version}.json`);
    if (!fs.existsSync(approval)) throw new Error('Inspect a representative frame from all eight blocks before rendering.');
    const outputLocation = path.join(out, `video-014-previa-${version}.mp4`);
    if (fs.existsSync(outputLocation)) throw new Error('Versioned output already exists; choose a new version.');
    let last = -1;
    await renderMedia({serveUrl, composition, puppeteerInstance:browser, codec:'h264', audioCodec:'aac', audioBitrate:'192k', crf:20, pixelFormat:'yuv420p', scale:1, concurrency:4, imageFormat:'jpeg', jpegQuality:95, outputLocation, overwrite:false, onProgress:({progress}) => {
      const decile = Math.floor(progress*10);
      if (decile > last) {last=decile; console.log('Preview progress',decile*10+'%');}
    }});
    console.log(outputLocation);
  } else throw new Error('Expected frames or preview.');
} finally {
  await browser.close({silent:true});
}
