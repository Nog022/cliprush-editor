// Existing Remotion renderer + media server + completion validation, without production retention.
import path from 'node:path';
import * as fs from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {prepareTemplateMedia} from './prepare-template-media.mjs';
import {bundle} from '@remotion/bundler';
import {selectComposition, renderStill, renderMedia} from '@remotion/renderer';
import {serveProduction} from './production-server.mjs';
import {completeProduction, safePath} from './video-retention.mjs';

const root = await fs.realpath(process.cwd());
const [mode = 'stills', directory = 'out/template-webcam-9x16', propsFile] = process.argv.slice(2);
if (!['stills', 'render'].includes(mode) || !directory.replaceAll('\\', '/').startsWith('out/')) {
  throw Error('Usage: node scripts/render-template.mjs stills|render out/directory [props.json]');
}
const outputDir = await safePath(root, directory, true);
await fs.mkdir(outputDir, {recursive: true});
const inputProps = propsFile ? JSON.parse(await fs.readFile(await safePath(root, propsFile), 'utf8')) : undefined;
const output = path.join(outputDir, 'preview.mp4');
if (mode === 'render' && await fs.stat(output).catch(() => null)) throw Error('Output exists; choose a new directory.');
console.log('Preparing Remotion bundle');
const bundled = await bundle({entryPoint: path.join(root, 'src/index.ts'),
  rspack: true,
  outDir: path.join(outputDir, 'bundle'), publicDir: path.join(root, `out/retention/tmp/no-public-${randomUUID()}`)});
const server = await serveProduction(root, bundled);
const browserExecutable = process.env.CLIPRUSH_BROWSER || (process.platform === 'win32' ? path.join(process.env.ProgramFiles || '', 'Google/Chrome/Application/chrome.exe') : undefined);
try {
  console.log('Selecting template composition');
  const selected = await selectComposition({serveUrl: server.url, id: 'WebcamTopGameplayBottom', inputProps, browserExecutable});
  const sourceProps = selected.props;
  if (/^https?:/.test(sourceProps.src)) throw Error('This local runner requires a source relative to public/.');
  const source = await safePath(root, `public/${sourceProps.src}`);
  const mediaDir = path.join(outputDir, 'media');
  const stamp = await fs.stat(source);
  const {video, audio} = await prepareTemplateMedia({source, startSeconds: sourceProps.startSeconds,
    durationSeconds: sourceProps.durationSeconds, directory: mediaDir,
    cacheKey: JSON.stringify({sourceProps, size: stamp.size, mtimeMs: stamp.mtimeMs})});
  // Existing server serves bundle-relative files. Keep derived media outside the bundle,
  // whose rebuild clears its directory; copy only this 35-second cache, never the library.
  await fs.copyFile(video,path.join(bundled,'segment.mp4'));
  await fs.copyFile(audio,path.join(bundled,'segment.wav'));
  const resolvedProps = {...sourceProps,src:`${server.url}/segment.mp4`,audioSrc:`${server.url}/segment.wav`,startSeconds:0};
  const composition = {...selected,props:resolvedProps};
  const options = {serveUrl: server.url, composition, inputProps:resolvedProps, browserExecutable, timeoutInMilliseconds: 120000};
  if (mode === 'stills') {
    for (const frame of [0, Math.floor(composition.durationInFrames / 2), composition.durationInFrames - composition.fps]) {
      await renderStill({...options, frame, output: path.join(outputDir, `frame-${frame}.png`), imageFormat: 'png', overwrite: false});
      console.log(`Frame ${frame} ready`);
      console.log(`Still ${frame}`);
    }
  } else {
    let progress = -1;
    await renderMedia({...options, outputLocation: output, codec: 'h264', crf: 18,
      pixelFormat: 'yuv420p', audioCodec: 'aac', audioBitrate: '320k', audioSampleRate: 48000,
      overwrite: false, concurrency: 2, onProgress: ({progress: value}) => {
        const next = Math.floor(value * 20) * 5;
        if (next > progress) {progress = next; console.log(`Render ${next}%`);}
      }});
    const validation = await completeProduction({root, output, expected: composition, validationOnly: true});
    await fs.writeFile(path.join(outputDir, 'render-validation.json'), JSON.stringify({composition, sourceProps, ...validation}, null, 2));
    console.log(JSON.stringify(validation));
  }
} finally {await server.close();}
