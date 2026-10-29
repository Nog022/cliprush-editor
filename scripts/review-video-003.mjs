// Review images only; does not export an MP4.
import {bundle} from '@remotion/bundler';
import {getCompositions, openBrowser, renderStill} from '@remotion/renderer';
import {mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
const output = path.resolve('out/video-003/review-v001');
await mkdir(output, {recursive: true});
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), outDir: path.join(output, 'bundle')});
const browser = await openBrowser('chrome', {browserExecutable: 'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try {
  const compositions = await getCompositions(serveUrl, {puppeteerInstance: browser});
  const composition = compositions.find((c) => c.id === 'ClipRushVideo003');
  if (!composition || composition.durationInFrames !== 1804 || !compositions.some((c) => c.id === 'MyComp')) throw new Error('Invalid composition registration');
  for (const frame of [0, 90, 330, 450, 690, 800, 1085, 1130, 1200, 1450, 1630, 1770, 1803]) {
    await renderStill({serveUrl, composition, frame, output: path.join(output, `frame-${frame}.jpg`), imageFormat: 'jpeg', scale: .4, puppeteerInstance: browser, overwrite: false});
    console.log(`Reviewed ${frame}`);
  }
  await writeFile(path.join(output, 'metadata.json'), JSON.stringify(compositions.map(({id, durationInFrames}) => ({id, durationInFrames})), null, 2));
} finally {await browser.close({silent: true});}
