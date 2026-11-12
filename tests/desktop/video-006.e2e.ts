import {test,expect,_electron as electron} from '@playwright/test';
import path from 'node:path';
import {writeFile} from 'node:fs/promises';

test('video-006 catalog, full-length preview and silent moving trailer',async()=>{
  const env:Record<string,string|undefined>={...process.env,CLIPRUSH_DATA_HOME:path.resolve('out/video-006/desktop-test-profile')};
  delete env.ELECTRON_RUN_AS_NODE;
  const app=await electron.launch({args:['.'],env:Object.fromEntries(Object.entries(env).filter((entry):entry is [string,string]=>entry[1]!==undefined))});
  try{
    const page=await app.firstWindow();
    const errors:string[]=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.getByRole('button',{name:'Abrir ClipRushVideo006',exact:true}).click();
    await expect(page.getByTestId('player-stage')).toBeVisible();
    await expect(page.locator('.transport')).toContainText('43.50s');
    for(const frame of [30,310,510,770,900,1155,1304]){
      await page.getByLabel('Ir para quadro').fill(String(frame));
      await expect(page.locator('.transport')).toContainText(`quadro ${frame}`);
      await expect(page.locator(`[data-shot]`).filter({visible:true})).toHaveCount(1);
      await expect(page.locator('.error')).toHaveCount(0);
    }
    await page.getByLabel('Ir para quadro').fill('1155');
    await expect(page.getByTestId('player-stage')).toContainText('600 MIL');
    await page.waitForTimeout(2500);
    await writeFile('out/video-006/desktop-media-state.json',JSON.stringify(await page.evaluate(()=>({videos:[...document.querySelectorAll('video')].map(v=>({src:v.currentSrc,time:v.currentTime,ready:v.readyState,error:v.error?.message,muted:v.muted})),canvases:[...document.querySelectorAll('canvas')].map(c=>({width:c.width,height:c.height}))})),null,2));
    await expect(page.locator('.error')).toHaveCount(0);
    await page.screenshot({path:'out/video-006/desktop-preview.png'});
    expect(errors).toEqual([]);
  }finally{await app.close();}
});
