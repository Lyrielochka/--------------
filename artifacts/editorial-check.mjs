import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
await fs.mkdir('artifacts/editorial',{recursive:true});
const browser=await chromium.launch({headless:true,channel:'chrome'});
const errors=[];
try {
for(const [name,width,height] of [['desktop',1440,1000],['mobile',390,844]]){
 const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
 await page.locator('#operation-loader').waitFor({state:'detached'});
 await page.evaluate(()=>document.fonts.ready);
 for(const id of ['hero','intro','prehistory','strategy','commanders','technology','aviators','partisans','opening','map','results','archive','videos','projects']) {
 await page.locator('#'+id).evaluate(el=>el.scrollIntoView({behavior:'instant',block:'start'}));
 await page.waitForTimeout(200);
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${name}: overflow ${id}`);
 await page.screenshot({path:`artifacts/editorial/${name}-${id}.png`});
 }
 for(let i=0;i<4;i++){
 await page.locator('.fd-tabs button').nth(i).click();
 const text=await page.locator('.fd-chapter-body').innerText();
 assert(!text.includes('1094 самолёта'));assert(!text.includes('1901 самолёта'));
 }
 for(const [i,count] of [[0,6],[1,6],[2,6],[3,5],[4,5],[5,5]]){
 await page.locator('#technology .tech-ribbon > button').nth(i).click();
 await page.locator('.equipment-card').first().waitFor();
 assert.equal(await page.locator('.equipment-card').count(),count);
 assert(!/ЗиС-151|Р-104|ПМП/.test(await page.locator('.equipment-dialog').innerText()));
 await page.locator('.equipment-card').first().click();
 await page.locator('.equipment-info').waitFor();
 await page.getByRole('button',{name:'Вернуться к списку техники'}).click();
 await page.getByRole('button',{name:'Закрыть категорию'}).click();
 await page.locator('.equipment-backdrop').waitFor({state:'detached'});
 }
 await page.locator('.sheet-open').first().click();
 await page.locator('.archive-reader').waitFor();
 await page.keyboard.press('Escape');
 await page.locator('.archive-reader').waitFor({state:'detached'});
 await fs.writeFile(`artifacts/editorial/${name}-text.txt`,await page.locator('body').innerText());
 await page.close();
 console.log(`PASS ${name}: all sections, catalogue and archive; no horizontal overflow`);
}
assert.deepEqual(errors,[]);console.log('PASS no browser runtime errors');
}finally{await browser.close()}
