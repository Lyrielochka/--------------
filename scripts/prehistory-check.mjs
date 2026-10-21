import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,channel:'chrome'});
const errors=[];
try{
 for(const [name,width,height] of [['desktop',1440,1000],['tablet',820,1000],['mobile',390,844],['small',320,844]]){
  const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(process.env.BASE_URL||'http://127.0.0.1:5173/',{waitUntil:'networkidle'});
  await page.addStyleTag({content:'header.museum-header,.museum-header,.murvik,.custom-cursor,.cursor-dot,.cursor-ring{visibility:hidden!important}'});
  await page.locator('#prehistory').evaluate(e=>e.scrollIntoView({behavior:'instant',block:'start'}));
  await page.screenshot({path:`artifacts/prehistory-${name}-opening.png`});
  await page.locator('.before-atlas').screenshot({path:`artifacts/prehistory-${name}-map.png`});
  assert.equal(await page.locator('.before-map-key').count(),1);
  assert.equal(await page.locator('.before-map-tabs button').count(),4);
  const fills=await page.locator('.before-territory').evaluateAll(es=>es.map(e=>getComputedStyle(e).fill));
  assert.notEqual(fills[0],fills[1]);
  if(width>=1200)assert((await page.locator('.before-map-svg').boundingBox()).width>750);
  assert.equal(await page.locator('.before-communication').count(),4);
  await page.getByRole('button',{name:'Участки обороны',exact:true}).click();
  await page.waitForTimeout(200);
  assert.equal(await page.locator('[data-situation-layer=defence]').evaluate(e=>getComputedStyle(e).opacity),'1');
  await page.locator('.before-atlas').screenshot({path:`artifacts/prehistory-${name}-defence.png`});
  await page.getByRole('button',{name:'Коммуникации',exact:true}).click();
  assert.equal(await page.locator('[data-situation-layer=links]').evaluate(e=>getComputedStyle(e).opacity),'1');
  await page.locator('.before-atlas').screenshot({path:`artifacts/prehistory-${name}-communications.png`});
  await page.getByRole('button',{name:'Советский замысел',exact:true}).click();
  assert.equal(await page.locator('[data-situation-layer=plan]').evaluate(e=>getComputedStyle(e).opacity),'1');
  assert.equal(await page.locator('.before-plan-arrow').count(),4);
  await page.locator('.before-atlas').screenshot({path:`artifacts/prehistory-${name}-plan.png`});
  const node=page.getByRole('button',{name:'Опорный город: Минск',exact:true});
  await node.scrollIntoViewIfNeeded();await node.focus();await page.keyboard.press('Enter');
  assert.equal(await page.locator('.before-map-readout h4').innerText(),'Минск');
  assert.equal(await page.locator('.before-atlas').getAttribute('data-active-layer'),'links');
  assert.match(await page.locator('.before-map-readout p').innerText(),/Главный тыловой узел/);
  assert.equal(await page.locator('.before-communication[opacity=\"0.12\"]').count(),1);
  await page.getByRole('button',{name:'Увеличить ситуационную схему'}).click();
  assert.equal(await page.locator('.before-map-scroll.is-zoomed').count(),1);
  await page.getByRole('button',{name:'Уменьшить ситуационную схему'}).click();
  for(let i=0;i<5;i++){
   await page.locator('.before-accordion-item h3 button').nth(i).click();
   assert.equal(await page.locator('.before-accordion-body:not([hidden])').count(),1);
   assert(await page.locator('.before-accordion-body:not([hidden]) p').evaluateAll(es=>es.every(e=>parseFloat(getComputedStyle(e).fontSize)>=16)));
  }
  assert.equal(await page.locator('.before-atlas').getAttribute('data-active-layer'),'plan');
  await page.locator('.before-accordion-item h3 button').first().click();
  assert.equal(await page.locator('.before-map-svg image[href="/assets/belarus-base.lossless.webp"]').count(),1);
  if(width>=1200){const box=await page.locator('.before-map-svg').boundingBox();assert(Math.abs(box.width/box.height-1402/1122)<.01);}
  await page.locator('#prehistory').screenshot({path:`artifacts/prehistory-${name}-compact.png`});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${name}: page overflow`);
  assert.equal(await page.locator('#prehistory .bagration-map').count(),0);
  await page.close();
 }
 assert.deepEqual(errors,[]);console.log('PASS: desktop/tablet/mobile; four unique layers, distinct political territories, plan arrows, city-specific connections, keyboard city selection, zoom, body text >=16px, no page overflow or runtime errors.');
}finally{await browser.close()}
