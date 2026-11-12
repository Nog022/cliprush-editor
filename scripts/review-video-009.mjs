import { bundle } from '@remotion/bundler';
import { openBrowser, getCompositions, renderStill } from '@remotion/renderer';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

const dir = path.resolve(process.argv[2] ?? 'out/video-009/review-v002');
await mkdir(dir, { recursive: true });
const preserved = JSON.parse(await readFile('out/video-009/preserved.json', 'utf8'));
for (const [file, hash] of Object.entries(preserved)) {
  if (file === 'src/Root.tsx') continue;
  if (createHash('sha256').update(await readFile(file)).digest('hex') !== hash) throw Error(`Previous source changed: ${file}`);
}
const root = (await readFile('src/Root.tsx', 'utf8')).replaceAll('\r\n', '\n');
const cleaned = root.replace('import { ClipRushVideo009 } from "./videos/video-009/ClipRushVideo009";\n', '').replace('      <Composition id="ClipRushVideo009" component={ClipRushVideo009} durationInFrames={1286} fps={30} width={1080} height={1920} />\n', '');
if (cleaned !== (await readFile('out/video-009/Root.before.tsx', 'utf8')).replaceAll('\r\n', '\n')) throw Error('Existing registration modified');
const inventory = JSON.parse(await readFile('src/videos/video-009/inventory.json', 'utf8'));
for (const item of inventory) {
  if (createHash('sha256').update(await readFile(path.join('public', item.file))).digest('hex') !== item.sha256) throw Error(`Original modified: ${item.file}`);
}
console.log(`Preserved ${Object.keys(preserved).length} previous source files/registrations and all ${inventory.length} originals.`);
const browser = await openBrowser('chrome', { browserExecutable: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const errors = [];
const onBrowserLog = l => { if (l.type === 'error') errors.push(l.text); };
try {
  const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts'), outDir: path.join(dir, 'bundle') });
  const all = await getCompositions(serveUrl, { puppeteerInstance: browser, onBrowserLog });
  const composition = all.find(c => c.id === 'ClipRushVideo009');
  if (!composition || composition.durationInFrames !== 1286) throw Error('Wrong duration');
  const frames = process.argv[3] ? process.argv[3].split(",").map(Number) : [36, 249, 345, 447, 516, 582, 735, 807, 888, 934, 1026, 1113, 1200, 1275];
  for (const frame of frames) {
    await renderStill({ serveUrl, composition, frame, output: path.join(dir, `frame-${frame}.jpg`), imageFormat: 'jpeg', scale: .5, puppeteerInstance: browser, onBrowserLog });
    console.log(`Reviewed frame ${frame}`);
  }
  await writeFile(path.join(dir, 'render-review.json'), JSON.stringify({ composition, frames, errors, originalFiles: inventory.length, preservedSourceFiles: Object.keys(preserved).length }, null, 2));
  if (errors.length) throw Error(errors.join('\n'));
} finally { await browser.close({ silent: true }); }
