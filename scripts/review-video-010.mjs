import {bundle} from '@remotion/bundler';
import {openBrowser, getCompositions, renderStill, renderMedia} from '@remotion/renderer';
import {readFile, writeFile, mkdir, access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';

const dir = path.resolve(process.argv[2] ?? 'out/video-010/review-v001');
await mkdir(dir, {recursive: true});
const preserved = JSON.parse(await readFile('out/video-010/preserved.json', 'utf8'));
for (const [file, hash] of Object.entries(preserved)) {
  if (file.replaceAll('\\', '/') === 'src/Root.tsx') continue;
  if (createHash('sha256').update(await readFile(file)).digest('hex') !== hash) throw Error(`Previous source changed: ${file}`);
}
const root = (await readFile('src/Root.tsx','utf8')).replaceAll('\r\n','\n');
const cleaned = root.replace('import { ClipRushVideo010 } from "./videos/video-010/ClipRushVideo010";\n', '').replace('      <Composition id="ClipRushVideo010" component={ClipRushVideo010} durationInFrames={1189} fps={30} width={1080} height={1920} />\n','');
if (cleaned !== (await readFile('out/video-010/Root.before.tsx','utf8')).replaceAll('\r\n','\n')) throw Error('Existing registrations changed');
const inventory = JSON.parse(await readFile('src/videos/video-010/inventory.json','utf8'));
for (const item of inventory) {
  if (createHash('sha256').update(await readFile(path.join('public', item.file))).digest('hex') !== item.sha256) throw Error(`Original media changed: ${item.file}`);
}
console.log(`Preserved ${Object.keys(preserved).length} previous source files and all supplied media.`);
const browser = await openBrowser('chrome', {browserExecutable: 'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const errors = [];
const onBrowserLog = l => {if (l.type === 'error') errors.push(l.text);};
try {
  const serveUrl = await bundle({entryPoint:path.resolve('src/index.ts'),outDir:path.join(dir,'bundle')});
  const all = await getCompositions(serveUrl,{puppeteerInstance:browser,onBrowserLog});
  const composition = all.find(c=>c.id==='ClipRushVideo010');
  if(!composition || composition.durationInFrames!==1189) throw Error('Wrong composition');
  const frames = process.argv.includes('--captions') ? [125, 224, 349, 439, 674, 769, 825, 859, 1008, 1140] : [32, 170, 244, 315, 390, 470, 560, 620, 650, 690, 735, 775, 825, 910, 1050, 1188];
  for (const frame of frames) {
    await renderStill({serveUrl,composition,frame,output:path.join(dir,`frame-${frame}.jpg`),imageFormat:'jpeg',scale:0.5,puppeteerInstance:browser,onBrowserLog});
    console.log(`Reviewed frame ${frame}`);
  }
  await writeFile(path.join(dir,'review.json'),JSON.stringify({composition,frames,errors,preservedSources:Object.keys(preserved).length,originalMedia:inventory.length},null,2));
  if(errors.length) throw Error(errors.join('\n'));
  if(process.argv.includes('--render')) {
    let version=1, output;
    while(true) {
      output=path.resolve(`out/video-010/video-010-v${String(version).padStart(3,'0')}.mp4`);
      try {await access(output);version++;} catch {break;}
    }
    let last=-1;
    await renderMedia({serveUrl,composition,outputLocation:output,codec:'h264',audioCodec:'aac',audioBitrate:'192k',crf:18,pixelFormat:'yuv420p',concurrency:3,puppeteerInstance:browser,onBrowserLog,onProgress:p=>{const pct=Math.floor(p.progress*10);if(pct!==last){last=pct;console.log(`Render ${pct*10}%`);}}});
    await writeFile(path.join(dir,'output.json'),JSON.stringify({output,errors},null,2));
    console.log(output);
  }
} finally {await browser.close({silent:true});}
