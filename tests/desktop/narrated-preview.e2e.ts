import {test, expect, _electron as electron} from '@playwright/test';
import {execFileSync} from 'node:child_process';
import {mkdir} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import path from 'node:path';

test('portrait Player advances with narration, source trim and camera while local shared audio loads', async () => {
  const directory=path.resolve('out',`narrated-player-${randomUUID()}`);
  await mkdir(directory,{recursive:true});
  const video=path.join(directory,'motion.mp4'), audio=path.join(directory,'voice.wav');
  execFileSync('ffmpeg',['-v','error','-f','lavfi','-i','testsrc2=size=640x360:rate=60:duration=12',
    '-c:v','libx264','-preset','ultrafast','-b:v','6M','-g','600','-pix_fmt','yuv420p',video],{windowsHide:true});
  execFileSync('ffmpeg',['-v','error','-f','lavfi','-i','sine=frequency=440:sample_rate=48000',
    '-t','3',audio],{windowsHide:true});
  const env: Record<string,string>={...process.env as Record<string,string>,CLIPRUSH_DATA_HOME:directory};
  delete env.ELECTRON_RUN_AS_NODE;
  const app=await electron.launch({args:['.'],env});
  try {
    const page=await app.firstWindow();
    await page.waitForFunction(()=>Boolean(window.cliprush));
    await app.evaluate(({dialog},files)=>{dialog.showOpenDialog=async()=>({canceled:false,filePaths:files});},[video,audio]);
    const project=await page.evaluate(async()=>{
      let p=await window.cliprush.createProject({name:'Narrated playback regression',channelId:'cliprush',language:'pt-BR',
        category:'Test',type:'narrated',visualPreset:'narrado-cliprush',width:1080,height:1920,fps:30,durationInFrames:90});
      p=(await window.cliprush.importMedia(p.id,'reference'))!.project;
      const video=p.assets.find(a=>a.kind==='video')!, audio=p.assets.find(a=>a.kind==='audio')!;
      p.clips=[{id:'voice',assetId:audio.id,from:0,durationInFrames:90,volume:1},
        {id:'motion',assetId:video.id,from:0,durationInFrames:90,trimBefore:270,volume:0,
          narratedFraming:{start:{x:.4,y:.5,zoom:1},end:{x:.6,y:.5,zoom:1.03},playbackRate:.5}}];
      return window.cliprush.saveProject(p);
    });
    await page.reload();
    await page.getByRole('button',{name:'Abrir Narrated playback regression',exact:true}).click();
    const frame=page.getByLabel('Ir para quadro');
    await expect(frame).toBeVisible();
    await page.getByRole('button',{name:'Play video',exact:true}).click();
    await expect.poll(async()=>Number(await frame.inputValue()),{timeout:20000}).toBeGreaterThan(60);
    const media=await page.locator('video,audio').evaluateAll(nodes=>nodes.map(n=>({error:(n as HTMLMediaElement).error?.message})));
    expect(media.every(m=>!m.error)).toBe(true);
    const saved=await page.evaluate(id=>window.cliprush.inspectAssets(id),project.id);
    expect(saved.visualPreset).toBe('narrado-cliprush');
    expect(saved.clips.find(c=>c.id==='motion')!.narratedFraming!.playbackRate).toBe(.5);
  } finally {await app.close();}
});
