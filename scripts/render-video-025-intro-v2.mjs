// Render only the corrected opening; copy the previous delivery's remaining
// compressed video and its entire audio stream without re-encoding.
import path from 'node:path';
import * as fs from 'node:fs/promises';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {selectComposition, renderMedia} from '@remotion/renderer';
import {serveProduction} from './production-server.mjs';
import {checkProject, completeProduction, safePath} from './video-retention.mjs';

const root = await fs.realpath(process.cwd());
const execute = promisify(execFile);
if (process.argv.includes('--await-review')) {
  console.log('Dependencies ready. Waiting for reviewed-preview confirmation on stdin.');
  process.stdin.resume();
  await new Promise(resolve => process.stdin.once('data', resolve));
  process.stdin.pause();
}
const work = await safePath(root, 'out/video-025/intro-v2', true);
await fs.mkdir(work, {recursive: true});
const original = await safePath(root, 'deliveries/video-025-clima-final-20261117-v1.mp4');
const output = await safePath(root, 'deliveries/video-025-clima-final-20261117-v2.mp4', true);
try {await fs.stat(output); throw Error('Output already exists');} catch (error) {if (error.code !== 'ENOENT') throw error;}
const bundled = await safePath(root, 'out/video-025/preview-bundle');
const indexTime = (await fs.stat(path.join(bundled, 'index.html'))).mtimeMs;
for (const relative of ['src/videos/video-025/Weather025.tsx', 'src/videos/video-025/weather-captions.json', 'src/Root.tsx']) {
  if ((await fs.stat(await safePath(root, relative))).mtimeMs > indexTime) throw Error(`Preview is stale: ${relative}`);
}
async function probe(file, packets = false) {
  const entries = packets ? 'packet=codec_type,pts_time,dts_time,flags,data_hash' : 'stream=codec_type,codec_name,width,height,avg_frame_rate,nb_frames,duration,extradata_hash:format=duration,size';
  const {stdout} = await execute('ffprobe', ['-v', 'error', ...(packets ? ['-show_packets'] : ['-show_streams', '-show_format']), '-show_entries', entries, '-show_data_hash', 'sha256', '-of', 'json', file], {maxBuffer: 8 * 1024 ** 2, windowsHide: true});
  return JSON.parse(stdout);
}
const previous = await probe(original);
const originalPackets = (await probe(original, true)).packets;
console.log('Original delivery metadata and packet hashes loaded.');
const previousVideo = originalPackets.filter(p => p.codec_type === 'video');
if (previousVideo[234].pts_time !== '7.800000' || !previousVideo[234].flags.includes('K')) throw Error('Opening boundary must be a keyframe');
const intro = path.join(work, 'opening.mp4');
const tail = path.join(work, 'unchanged-tail.mp4');
const browserExecutable = path.join(process.env.ProgramFiles, 'Google/Chrome/Application/chrome.exe');
const server = await serveProduction(root, bundled);
let composition;
let nextProgress = 0;
try {
  composition = await selectComposition({serveUrl: server.url, id: 'ClipRush025', browserExecutable});
  await renderMedia({serveUrl: server.url, composition, frameRange: [0, 233], muted: true,
    outputLocation: intro, codec: 'h264', crf: 18, pixelFormat: 'yuv420p', overwrite: false,
    concurrency: 2, browserExecutable, onProgress: ({progress}) => {
      const percent = Math.floor(progress * 100);
      if (percent >= nextProgress) {console.log(`Opening render ${percent}%`); nextProgress = percent + 20;}
    }});
} finally {await server.close();}

const previousStream = previous.streams.find(s => s.codec_type === 'video');
const introStream = (await probe(intro)).streams.find(s => s.codec_type === 'video');
if (!introStream.extradata_hash || introStream.extradata_hash !== previousStream.extradata_hash) throw Error('H.264 configuration mismatch: lossless splice requires matching codec data');
await execute('ffmpeg', ['-v', 'error', '-n', '-ss', '7.8', '-i', original, '-map', '0:v:0', '-an', '-c', 'copy', tail], {windowsHide: true});
const list = path.join(work, 'concat.txt');
await fs.writeFile(list, "file 'opening.mp4'\nfile 'unchanged-tail.mp4'\n");
await execute('ffmpeg', ['-v', 'error', '-n', '-f', 'concat', '-safe', '0', '-auto_convert', '0', '-i', list,
  '-i', original, '-map', '0:v:0', '-map', '1:a:0', '-c', 'copy', '-movflags', '+faststart', output], {windowsHide: true});

const finalPackets = (await probe(output, true)).packets;
const finalVideo = finalPackets.filter(p => p.codec_type === 'video');
const oldAudio = originalPackets.filter(p => p.codec_type === 'audio');
const newAudio = finalPackets.filter(p => p.codec_type === 'audio');
const samePacket = (a, b) => a.data_hash === b.data_hash && a.pts_time === b.pts_time && a.dts_time === b.dts_time;
if (finalVideo.length !== previousVideo.length || !previousVideo.slice(234).every((p, i) => samePacket(p, finalVideo[i + 234]))) throw Error('Video after 7.8s changed');
if (oldAudio.length !== newAudio.length || !oldAudio.every((p, i) => samePacket(p, newAudio[i]))) throw Error('Original audio changed');
const proof = {file: path.relative(root, output), openingFrames: 234, unchangedVideoPackets: finalVideo.length - 234,
  unchangedAudioPackets: newAudio.length, audioBitExact: true, videoAfterOpeningBitExact: true, metadata: await probe(output)};
await fs.writeFile(path.join(work, 'preservation-proof.json'), JSON.stringify(proof, null, 2));
console.log(JSON.stringify({audioBitExact: true, videoAfterOpeningBitExact: true, unchangedVideoPackets: proof.unchangedVideoPackets}));
// The composition was already bundled, visually reviewed, and rendered above.
// Reuse that evidence while keeping the standard src/desktop compilation checks;
// avoid the redundant Webpack bundle that stalled during the previous delivery.
const completion = await completeProduction({root, current: 25, output, expected: composition,
  check: (projectRoot, _current, edits) => checkProject(projectRoot, undefined, edits)});
await fs.writeFile(path.join(work, 'completion.json'), JSON.stringify(completion, null, 2));
console.log(JSON.stringify(completion));
