// Production-specific export: reuse the reviewed bundle and retain completion validation.
import path from 'node:path';
import * as fs from 'node:fs/promises';
import {selectComposition, renderMedia} from '@remotion/renderer';
import {serveProduction} from './production-server.mjs';
import {completeProduction, safePath} from './video-retention.mjs';

const root = await fs.realpath(process.cwd());
const bundled = await safePath(root, 'out/video-028/preview-bundle');
const indexTime = (await fs.stat(path.join(bundled, 'index.html'))).mtimeMs;
async function assertUnchanged(directory) {
  for (const entry of await fs.readdir(directory, {withFileTypes: true})) {
    const file = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) throw Error('Unexpected link in source');
    if (entry.isDirectory()) await assertUnchanged(file);
    else if ((await fs.stat(file)).mtimeMs > indexTime) throw Error(`Source changed after preview: ${file}`);
  }
}
await assertUnchanged(path.join(root, 'src'));
await assertUnchanged(path.join(root, 'public/videos/video-028'));
const output = await safePath(root, 'deliveries/video-028-final-20261118-v1.mp4', true);
try {await fs.stat(output); throw Error('Output already exists');} catch (error) {if (error.code !== 'ENOENT') throw error;}
await fs.mkdir(path.dirname(output), {recursive: true});
const server = await serveProduction(root, bundled);
const browserExecutable = path.join(process.env.ProgramFiles, 'Google/Chrome/Application/chrome.exe');
let composition;
let nextProgress = 0;
try {
  composition = await selectComposition({serveUrl: server.url, id: 'ClipRush028', browserExecutable});
  await renderMedia({serveUrl: server.url, composition, outputLocation: output, codec: 'h264', crf: 18, pixelFormat: 'yuv420p', audioCodec: 'aac', audioBitrate: '320k', overwrite: false, concurrency: 2, browserExecutable, onProgress: ({progress}) => {const percent = Math.floor(progress * 100); if (percent >= nextProgress) {console.log(`Render ${percent}%`); nextProgress = percent + 10;}}});
} finally {await server.close();}
console.log(JSON.stringify(await completeProduction({root, current: 28, output, expected: composition, validationOnly: true})));



