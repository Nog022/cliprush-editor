// Common manual entrypoint: npm run render -- ClipRushNNN [version]
import path from 'node:path';
import * as fs from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { bundle } from '@remotion/bundler';
import { selectComposition, renderMedia } from '@remotion/renderer';
import { completeProduction, safePath } from './video-retention.mjs';
import { serveProduction } from './production-server.mjs';

const root = await fs.realpath(process.cwd());
const [id, version = String(Date.now())] = process.argv.slice(2);
const match = id?.match(/^ClipRush(?:Video|AI)?(\d{3})(?:[A-Za-z0-9-]*)$/);
if (!match || !/^[a-z0-9-]+$/i.test(version)) throw new Error('Use: npm run render -- ClipRushNNN [unique-version]');
const output = await safePath(root, `deliveries/video-${match[1]}-${version}.mp4`, true);
try { await fs.stat(output); throw new Error('Output exists'); } catch(e) { if (e.code !== 'ENOENT') throw e; }
await fs.mkdir(path.dirname(output), { recursive: true });
const bundled = await bundle({ entryPoint: path.join(root, 'src/index.ts'), outDir: path.join(root, 'out/retention/manual-bundle'), publicDir: path.join(root, `out/retention/tmp/no-public-${randomUUID()}`) });
const server = await serveProduction(root,bundled);
const browserExecutable = process.env.CLIPRUSH_BROWSER || (process.platform === 'win32' ? path.join(process.env.ProgramFiles || '', 'Google/Chrome/Application/chrome.exe') : undefined);
let composition;
try {
composition = await selectComposition({ serveUrl:server.url, id, browserExecutable });
await renderMedia({ serveUrl:server.url, composition, outputLocation: output, codec: 'h264', crf: 18, pixelFormat: 'yuv420p', audioCodec: 'aac', audioBitrate: '320k', overwrite: false, concurrency: 2, browserExecutable });
} finally { await server.close(); }
console.log(JSON.stringify(await completeProduction({ root, current: Number(match[1]), output, expected: composition })));
