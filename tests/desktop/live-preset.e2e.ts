import {test, expect, _electron as electron} from '@playwright/test';
import {mkdir, stat, writeFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {renderStill, selectComposition} from '@remotion/renderer';
// @ts-expect-error Existing local test/render HTTP server has no declaration file.
import {serveProduction} from '../../scripts/production-server.mjs';
import {LIVE_PRESET} from '../../shared/live-preset';

test('Corte de Live preset: create, detect, apply, persist, preview and export the local 20:14–20:30 excerpt', async () => {
  test.setTimeout(600000);
  const source = path.resolve('public/videos/biblioteca/gta6/videos/alanzoka/ALANZOKA ABRINDO GTA 6 PELA 1 VEZ! [eZE6PtAf8vE].mp4');
  test.skip(!existsSync(source), 'Mandatory local fixture is not installed; never download it.');
  const directory = process.env.CLIPRUSH_LIVE_DATA_HOME ?? path.resolve('out', `corte-live-test-${randomUUID()}`);
  await mkdir(directory, {recursive: true});
  console.log(`Artifacts: ${directory}`);
  const env: NodeJS.ProcessEnv = {...process.env, CLIPRUSH_DATA_HOME: directory};
  delete env.ELECTRON_RUN_AS_NODE;
  const app = await electron.launch({args: ['.'], executablePath: process.env.CLIPRUSH_TEST_ELECTRON,
    env: Object.fromEntries(Object.entries(env).filter((entry): entry is [string, string] => entry[1] !== undefined))});
  try {
    const page = await app.firstWindow();
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.waitForFunction(() => Boolean(window.cliprush));
    const name = `Corte de Live - teste ${randomUUID().slice(0, 8)}`;
    await page.getByRole('button', {name: /Novo projeto/}).click();
    await page.locator('input[name="name"]').fill(name);
    await page.locator('select[name="visualPreset"]').selectOption(LIVE_PRESET);
    await page.locator('input[name="duration"]').fill('16');
    await page.getByRole('button', {name: 'Criar projeto', exact: true}).click();
    await expect(page.getByLabel('Legenda personalizada')).toBeVisible();
    let project = (await page.evaluate(() => window.cliprush.workspace())).projects.find(p => p.name === name)!;
    expect([project.width, project.height, project.fps, project.durationInFrames]).toEqual([1080, 1920, 30, 480]);
    expect(project.visualPreset).toBe(LIVE_PRESET);
    await app.evaluate(({dialog}, file) => {
      dialog.showOpenDialog = async () => ({canceled: false, filePaths: [file]});
    }, source);
    project = (await page.evaluate(id => window.cliprush.importMedia(id, 'reference'), project.id))!.project;
    const asset = project.assets[0];
    expect([asset.width, asset.height]).toEqual([1920, 1080]);
    project = await page.evaluate(p => window.cliprush.saveProject(p), {...project, clips: [{
      id: 'live-test-clip', assetId: asset.id, from: 0, durationInFrames: 480, trimBefore: 1214 * 30, volume: 1,
    }]});
    await page.reload();
    await page.getByRole('button', {name: `Abrir ${project.name}`, exact: true}).click();
    await page.getByRole('button', {name: 'Analisar trecho', exact: true}).click();
    await expect(page.getByRole('button', {name: 'Analisar trecho', exact: true})).toBeEnabled({timeout: 120000});
    const analysis = await page.evaluate(({id, clipId}) => window.cliprush.analyzeClip(id, clipId), {id: project.id, clipId: project.clips[0].id});
    await writeFile(path.join(directory, 'analysis.json'), JSON.stringify(analysis, null, 2));
    console.log(JSON.stringify({webcam: analysis.webcam, gameplay: analysis.gameplay, complete: analysis.samplingComplete}));
    expect(analysis.samplingComplete).toBe(true);
    await page.locator('details').filter({hasText: 'Rostos'}).locator('summary').click();
    if (!analysis.webcam.regions.length) {
      // Visually confirmed fixture bounds at 20:14: unframed panel, excluding the subscription strip.
      // Use the already implemented manual-region UI; do not add another detector.
      for (const [key, value] of Object.entries({x: 1488 / 1920, y: 754 / 1080, width: 424 / 1920, height: 268 / 1080})) {
        await page.getByRole('spinbutton', {name: `Webcam ${key}`, exact: true}).fill(String(value));
      }
      await page.getByRole('button', {name: 'Salvar região manual', exact: true}).click();
      await expect(page.getByText(/Webcam ajustada manualmente/)).toBeVisible({timeout: 120000});
    }
    await page.getByRole('button', {name: 'Aplicar enquadramento ao preset', exact: true}).click();
    await expect(page.getByRole('slider', {name: 'Gameplay x', exact: true})).toHaveValue('50');
    await page.getByRole('button', {name: 'Detectar foco do gameplay', exact: true}).click();
    await expect(page.getByRole('button', {name: 'Detectar foco do gameplay', exact: true})).toBeEnabled({timeout: 120000});
    const focusAnalysis = await page.evaluate(({id, clipId}) => window.cliprush.analyzeClip(id, clipId, {
      sampleEveryMs: 1000, maxSamples: 120, gameplayFocusRegion: {x: 0, y: 0, width: .775, height: 1},
    }), {id: project.id, clipId: project.clips[0].id});
    await writeFile(path.join(directory, 'gameplay-focus-analysis.json'), JSON.stringify(focusAnalysis.gameplay.focus, null, 2));
    // No reliable central face on the boat: exercise abstention and manual correction.
    expect(focusAnalysis.samplingComplete).toBe(true);
    expect(focusAnalysis.gameplay.focus?.status).toBe('uncertain');
    for (const key of ['x', 'y', 'zoom']) {
      const slider = page.getByRole('slider', {name: `Gameplay ${key}`, exact: true});
      await slider.focus(); await slider.press('ArrowRight'); await slider.press('ArrowLeft');
    }
    await expect(page.getByLabel('Modo de foco do gameplay')).toHaveValue('manual');
    await page.getByLabel('Legenda personalizada').fill('ALANZOKA AO VIVO '.repeat(18));
    expect(await page.getByTestId('live-caption').evaluate(e => parseFloat(getComputedStyle(e).fontSize))).toBeLessThan(56);
    await page.getByLabel('Legenda personalizada').fill('ALANZOKA • CORTE DA LIVE');
    await page.getByRole('button', {name: 'Salvar projeto', exact: true}).click();
    project = (await page.evaluate(() => window.cliprush.workspace())).projects.find(p => p.id === project.id)!;
    expect(project.clips[0].liveFraming).toBeTruthy();
    expect(project.clips[0].liveFraming!.gameplayFocus).toMatchObject({x: .5, y: .6, zoom: 1.25, mode: 'manual'});
    expect(project.customCaption).toBe('ALANZOKA • CORTE DA LIVE');
    await writeFile(path.join(directory, 'project.json'), JSON.stringify(project, null, 2));
    await expect(page.getByTestId('live-caption')).toContainText('ALANZOKA');
    // Canvas decoding is asynchronous after seeking. Never accept a black placeholder as a preview.
    await expect.poll(async () => page.getByTestId('player-stage').evaluate(element => {
      const canvases = [...element.querySelectorAll('canvas')];
      return canvases.length >= 2 && canvases.every(canvas => {
        const context = canvas.getContext('2d');
        if (!context || !canvas.width || !canvas.height) return false;
        const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
        for (let i = 0; i < pixels.length; i += 400) if (pixels[i] + pixels[i + 1] + pixels[i + 2] > 60) return true;
        return false;
      });
    }), {timeout: 30000}).toBe(true);
    const canvasSignature = () => page.getByTestId('player-stage').evaluate(element =>
      [...element.querySelectorAll('canvas')].map(canvas => {
        const pixels = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height).data;
        let sum = 0;
        for (let i = 0; i < pixels.length; i += 400) sum = (sum * 31 + pixels[i] + pixels[i + 1] * 3 + pixels[i + 2] * 7) | 0;
        return sum;
      }).join(','));
    const firstFrame = await canvasSignature();
    await page.getByLabel('Ir para quadro').fill('240');
    await expect.poll(canvasSignature, {timeout: 30000}).not.toBe(firstFrame);
    await expect(page.getByText(/Mídia indisponível ou codec incompatível|Falha no preview/)).toHaveCount(0);
    await page.getByTestId('player-stage').screenshot({path: path.join(directory, 'desktop-preview.png')});
    // Inspect the exact desktop composition before committing to the full export.
    const server = await serveProduction(process.cwd(), path.resolve('dist/render'));
    try {
      const inputProps = {project, sources: {[asset.id]: `${server.url}/public/${path.relative(path.resolve('public'), source).replaceAll('\\', '/')}`}};
      const browserExecutable = process.env.CLIPRUSH_BROWSER ?? path.join(process.env.ProgramFiles ?? '', 'Google/Chrome/Application/chrome.exe');
      const composition = await selectComposition({serveUrl: server.url, id: 'ClipRushProject', inputProps, browserExecutable});
      for (const frame of [0, 240, 479]) {
        await renderStill({serveUrl: server.url, composition, inputProps, frame, browserExecutable,
          output: path.join(directory, `frame-${frame}.png`), imageFormat: 'png'});
      }
    } finally {await server.close();}
    await writeFile(path.join(directory, 'stills-ready.json'), JSON.stringify({directory}));
    // Set CLIPRUSH_LIVE_STILLS_ONLY=1 for visual review before the MP4 pass.
    if (process.env.CLIPRUSH_LIVE_STILLS_ONLY === '1') return;
    const job = await page.evaluate(p => window.cliprush.startRender(p.id, {...p.exportSettings, quality: 'high'}, 'corte-live-alanzoka.mp4'), project);
    expect(job).toBeTruthy();
    await expect.poll(async () => {
      const current = (await page.evaluate(() => window.cliprush.listRenders())).find(j => j.id === job!.id)!;
      if (current.status === 'failed') throw new Error(current.error);
      return current.status;
    }, {timeout: 420000, intervals: [2000, 5000]}).toBe('completed');
    const finished = (await page.evaluate(() => window.cliprush.listRenders())).find(j => j.id === job!.id)!;
    const info = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', finished.outputPath], {encoding: 'utf8', windowsHide: true}));
    const video = info.streams.find((s: {codec_type: string}) => s.codec_type === 'video');
    expect([video.width, video.height, video.r_frame_rate, Number(video.nb_frames)]).toEqual([1080, 1920, '30/1', 480]);
    expect(Number(info.format.duration)).toBeCloseTo(16, 1);
    expect(info.streams.some((s: {codec_type: string}) => s.codec_type === 'audio')).toBe(true);
    execFileSync('ffmpeg', ['-v', 'error', '-i', finished.outputPath, '-f', 'null', '-'], {windowsHide: true});
    await writeFile(path.join(directory, 'result.json'), JSON.stringify({job: finished, media: info, errors}, null, 2));
    expect(errors).toEqual([]);
    expect((await stat(finished.outputPath)).size).toBeGreaterThan(1000);
    console.log(`MP4: ${finished.outputPath}`);
  } finally {await app.close();}
});
