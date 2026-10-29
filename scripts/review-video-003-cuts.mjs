// Static cut checks and one four-second test only. Never exports the final video.
import {bundle} from '@remotion/bundler';
import {getCompositions, openBrowser, renderStill, renderMedia} from '@remotion/renderer';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
const cuts = JSON.parse(await readFile('src/videos/video-003/cuts.json', 'utf8'));
const output = path.resolve('out/video-003/review-cuts-v002');
await mkdir(output, {recursive: true});
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), outDir: path.join(output, 'bundle')});
const browser = await openBrowser('chrome', {browserExecutable: 'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try {
  const compositions = await getCompositions(serveUrl, {puppeteerInstance: browser});
  const composition = compositions.find((c) => c.id === 'ClipRushVideo003');
  if (!composition || composition.durationInFrames !== cuts.durationInFrames || !compositions.some((c) => c.id === 'MyComp')) throw new Error('Invalid metadata');
  const frames = [...new Set([0, 60, 300, 590, 850, 1110, 1310, 1430, 1444, ...cuts.clips.slice(1).flatMap(c => [c.from - 1, c.from, c.from + 6])])].sort((a,b) => a-b);
  for (const frame of frames) {
    await renderStill({serveUrl, composition, frame, output: path.join(output, `frame-${frame}.jpg`), imageFormat: 'jpeg', scale: .35, puppeteerInstance: browser, overwrite: false});
    console.log(`Frame ${frame}`);
  }
  await renderMedia({serveUrl, composition, codec: 'h264', frameRange: [135, 254], outputLocation: path.join(output, 'test-first-cut-4s.mp4'), scale: .35, concurrency: 2, puppeteerInstance: browser, overwrite: false});
  await renderMedia({serveUrl, composition, codec: 'wav', frameRange: [135, 254], outputLocation: path.join(output, 'test-first-cut-4s.wav'), puppeteerInstance: browser, overwrite: false});
  await writeFile(path.join(output, 'validation.json'), JSON.stringify({compositions: compositions.map(({id, durationInFrames}) => ({id, durationInFrames})), frames, testRange: [135,254]}, null, 2));
  console.log('Review and four-second test complete');
} finally {await browser.close({silent: true});}
