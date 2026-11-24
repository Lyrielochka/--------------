import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {equipment} from '../src/technologyData.js';
const base=process.env.BASE_URL||'http://127.0.0.1:5186';
const browser=await chromium.launch({channel:'chrome',headless:true});
const report=[];
try{
 const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
 const errors=[],models=[],externalDecoders=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)errors.push(`${r.status()} ${r.url()}`)});
 page.on('request',r=>{if(r.url().endsWith('.glb'))models.push(r.url());if(/draco|gstatic.*draco/.test(r.url())&&!r.url().startsWith(base))externalDecoders.push(r.url())});
 await page.goto(base,{waitUntil:'networkidle'});
 await page.locator('#operation-loader').waitFor({state:'detached',timeout:60000});
 const welcome=page.getByRole('button',{name:'Понятно',exact:true});if(await welcome.count())await welcome.click();
 assert.equal(models.length,0,'No initial model downloads');
 const initialBytes=await page.evaluate(()=>performance.getEntriesByType('resource').reduce((n,r)=>n+r.encodedBodySize,0));
 await page.screenshot({path:'artifacts/optimization-final-desktop.png'});
 for(const [category,items] of Object.entries(equipment)){
  const index=Object.keys(equipment).indexOf(category);
  await page.locator('#technology').scrollIntoViewIfNeeded();
  await page.locator('#technology .tech-ribbon > button').nth(index).click();
  await page.locator('.equipment-card').first().waitFor();
  for(const item of items.filter(x=>x.model)){
   await page.locator('.equipment-card').filter({has:page.locator('.equipment-object-label b',{hasText:item.name})}).click();
   const started=Date.now();
   await page.waitForFunction(()=>document.querySelector('model-viewer')?.loaded,null,{timeout:90000});
   await page.waitForFunction(()=>!document.querySelector('.equipment-loading'),null,{timeout:10000});
   const dimensions=await page.locator('model-viewer').evaluate(v=>{const d=v.getDimensions();return {x:d.x,y:d.y,z:d.z,cache:v.constructor.modelCacheSize}});
   assert.ok(dimensions.x>0&&dimensions.y>0&&dimensions.z>0,item.name);
   assert.equal(dimensions.cache,1);
   report.push({id:item.id,name:item.name,loadMs:Date.now()-started,dimensions});
   if(['t3476','su76','boat','t34'].includes(item.id)){
    await page.waitForTimeout(300);
    await page.locator('.equipment-main-visual').screenshot({path:`artifacts/optimized-model-${item.id}-desktop.png`});
    await page.setViewportSize({width:390,height:844});
    await page.locator('.equipment-main-visual').screenshot({path:`artifacts/optimized-model-${item.id}-mobile.png`});
    await page.setViewportSize({width:1440,height:900});
   }
   await page.getByRole('button',{name:'Вернуться к списку техники'}).click();
   await page.locator('.equipment-card').first().waitFor();
   console.log('MODEL PASS',item.id,report.at(-1).loadMs+' ms');
  }
  await page.getByRole('button',{name:'Закрыть категорию'}).click();
  await page.locator('.equipment-backdrop').waitFor({state:'detached'});
 }
 assert.equal(report.length,22);
 assert.deepEqual(externalDecoders,[]);
 assert.deepEqual(errors,[]);
 await page.setViewportSize({width:390,height:844});
 await page.goto(base,{waitUntil:'networkidle'});
 await page.locator('#operation-loader').waitFor({state:'detached',timeout:60000});
 await page.screenshot({path:'artifacts/optimization-final-mobile.png'});
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal overflow');
 await fs.writeFile('artifacts/optimized-models-browser.json',JSON.stringify({models:report,initialBytes,externalDecoders,errors},null,2));
 console.log('PASS: 22 models, local decoder, desktop/mobile, no page or HTTP errors');
}finally{await browser.close()}

