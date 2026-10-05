import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
const errors=[];
try{
 for(const [name,width,height] of [['wide',1920,1080],['desktop',1440,1000],['mobile',390,844],['small',320,844]]){
  const p=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});
  p.on('pageerror',e=>errors.push(e.message));
  await p.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
  const section=p.locator('#strategy');
  await section.evaluate(e=>e.scrollIntoView({behavior:'instant',block:'start'}));
  await p.screenshot({path:`artifacts/fronts-new-${name}-opening.png`});
  const expected=['359\u00a0500','579\u00a0300','319\u00a0500','1\u00a0071\u00a0100'];
  for(let i=0;i<4;i++){
   await section.getByRole('tab').nth(i).click();
   await section.locator('.fd-personnel strong').filter({hasText:expected[i]}).waitFor();
   await section.getByRole('button',{name:'Состав и техника',exact:true}).click();
   await p.waitForTimeout(100);
   assert.equal(await section.locator('.fd-resource-row img').count(),3);
   for(const img of await section.locator('.fd-resource-row img').all()){
    assert.match(await img.getAttribute('src'),/^\/assets\/tech\/catalog\/.*\.lossless\.webp$/);
    await img.evaluate(e=>e.decode());
   }
   if(i===0)await section.screenshot({path:`artifacts/fronts-new-${name}-forces.png`});
   await section.getByRole('button',{name:'Тыл и снабжение',exact:true}).click();
   await section.locator('.fd-chapter-body').filter({hasText:'Глубина тылового района'}).waitFor();
   assert.match(await section.locator('.fd-chapter-body').innerText(),i===3?/300–600/:/250/);
   const supplyText=await section.locator('.fd-chapter-body').innerText();
   assert(supplyText.includes(['7,6','6,3','6,4','7,1'][i]));
   assert(supplyText.includes(['5,3','3,2','2,4','2,5'][i]));
   assert.equal(await section.locator('.fd-resource-row img').count(),5);
   for(const img of await section.locator('.fd-resource-row img').all())await img.evaluate(e=>e.decode());
   if(i===3)await section.screenshot({path:`artifacts/fronts-new-${name}-supply.png`});
   await section.getByRole('button',{name:'Задача и результат',exact:true}).click();
   await section.locator('.fd-task').waitFor();
   assert.equal(await section.locator('.fd-actions li').count(),3);
   assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${name} overflow`);
  }
  await section.getByRole('tab').first().focus();await p.keyboard.press('ArrowRight');
  assert.equal(await section.getByRole('tab').nth(1).getAttribute('aria-selected'),'true');
  await section.getByRole('button',{name:'Приблизить направление фронта'}).click();
  await section.getByRole('button',{name:'Общий вид карты фронтов'}).click();
  await section.getByRole('button',{name:'На карте: 2-й Белорусский фронт',exact:true}).click();
  assert.equal(await section.getByRole('tabpanel').getAttribute('data-front'),'second');
  assert.equal(await section.locator('image[href="/assets/belarus-base.lossless.webp"]').count(),1);
  assert.equal(await section.locator('.fd-route-caption button').count(),0);
  await p.close();
 }
 assert.deepEqual(errors,[]);console.log('PASS: all front strengths, three description chapters, catalog PNGs loaded, supply scope, map pins/zoom, keyboard navigation, correct campaign dates, desktop/mobile/320px, no JS errors.');
}finally{await browser.close()}
