import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,channel:'chrome'});
const report=[];
try {
 for(const width of [1440,390]) {
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400 && r.url().startsWith(process.env.BASE_URL || 'http://127.0.0.1:4173'))errors.push(`${r.status()} ${r.url()}`)});
  await page.goto(process.env.BASE_URL || 'http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
  await page.locator('#operation-loader').waitFor({state:'detached',timeout:18000});
  await page.getByRole('button', { name: 'Понятно', exact: true }).click();
  await page.screenshot({path:`artifacts/optimized-hero-${width}.png`});
  assert.equal(await page.locator('img[src*="soviet-t34-right.png"]').count(),0);
  const initial=await page.evaluate(()=>performance.getEntriesByType('resource').filter(r=>r.name.includes('/assets/')).reduce((n,r)=>n+r.encodedBodySize,0));
  for(const id of ['intro','prehistory','strategy','commanders','technology','aviators','partisans','opening','map','archive','videos','projects']) {
   const section=page.locator('#'+id);if(!await section.count())continue;
   await section.evaluate(el=>el.scrollIntoView({behavior:'instant',block:'start'}));
   await page.waitForTimeout(180);
   for(const img of await section.locator('img').all())if(await img.isVisible()){await img.scrollIntoViewIfNeeded();await img.evaluate(el=>el.decode());}
   if(id==='strategy') {
    await section.getByRole('button',{name:'Состав и техника',exact:true}).click();
    for(const img of await section.locator('img').all())if(await img.isVisible()){await img.scrollIntoViewIfNeeded();await img.evaluate(el=>el.decode());}
   }
   if(id==='technology') {
    for(let i=0;i<6;i++) {
     await section.locator('.tech-ribbon > button').nth(i).click();
     await page.locator('.equipment-dialog').waitFor();
     for(const img of await page.locator('.equipment-card img').all()){await img.scrollIntoViewIfNeeded();await img.evaluate(el=>el.decode());}
     await page.locator('.equipment-card').first().click();
     await page.locator('.equipment-detail').waitFor();
     for(const img of await page.locator('.equipment-detail img').all())await img.evaluate(el=>el.decode());
     if(i===0)await page.locator('.equipment-dialog').screenshot({path:`artifacts/optimized-tank-${width}.png`});
     await page.keyboard.press('Escape');await page.locator('.equipment-category').waitFor();
     await page.keyboard.press('Escape');await page.locator('.equipment-backdrop').waitFor({state:'detached'});
    }
   }
  }
  assert.deepEqual(errors,[]);
  report.push({width,initialAssetBytes:initial,errors});
  console.log(`PASS production ${width}: preloader, sections, six catalogs, images, no HTTP/JS errors`);
  await page.close();
 }
 console.log(JSON.stringify(report));
}finally{await browser.close()}
