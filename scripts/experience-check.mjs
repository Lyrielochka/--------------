import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,channel:'chrome'});
await mkdir('artifacts',{recursive:true});
const errors=[];
try {
 for(const [name,width,height] of [['desktop',1440,1000],['mobile',390,844]]) {
  const page=await browser.newPage({viewport:{width,height}});
  page.on('pageerror',e=>errors.push(`${name}: ${e.message}`));
  await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
  await page.screenshot({path:`artifacts/${name}-hero-v3.png`});
  async function visit(id){await page.locator(id).evaluate(el=>el.scrollIntoView({behavior:'instant',block:'start'}));await page.waitForTimeout(750)}
  await visit('#map');
  await page.locator('#map').getByRole('button',{name:'Минск',exact:true}).click();await page.waitForTimeout(550);
  assert.match(await page.locator('.map-card').innerText(),/Минск/);
  assert.equal(await page.getByLabel('Дата операции',{exact:true}).inputValue(),'6');
  await page.getByRole('button',{name:'Слои карты',exact:true}).click();
  for(const [label,selector] of [['Фронты','[data-layer=fronts]'],['Сражения','[data-layer=battles]']]) {
   await page.getByLabel(label,{exact:true}).uncheck();assert.equal(await page.locator(selector).count(),0);
   await page.getByLabel(label,{exact:true}).check();assert.equal(await page.locator(selector).count(),1);
  }
  await page.getByLabel('Память сегодня',{exact:true}).check();assert.equal(await page.locator('[data-layer=memory]').count(),1);
  await page.locator('.layers-panel header button').click();
  await page.waitForTimeout(1700);
  assert.notEqual(await page.locator('.map-world').evaluate(el=>getComputedStyle(el).transform),'none');
  await page.getByRole('button',{name:'Фокус на выбранной точке'}).click();
  await page.getByRole('button',{name:'Развернуть карту'}).click();await page.waitForTimeout(300);
  assert.equal(await page.locator('.map-expanded').count(),1);
  await page.keyboard.press('Escape');assert.equal(await page.locator('.map-expanded').count(),0);
  await visit('#map');await page.screenshot({path:`artifacts/${name}-map-v3.png`});
  await visit('#timeline');assert.match(await page.locator('.date-mask').innerText(),/03.07/);
  await page.locator('.big-timeline button').last().click();await page.waitForTimeout(500);
  assert.equal(await page.getByLabel('Дата операции',{exact:true}).inputValue(),'8');
  await visit('#aviators');await page.screenshot({path:`artifacts/${name}-aviators-v3.png`});
  assert.equal(await page.locator('.aviator-card').count(),4);
  await page.locator('.aviator-card').nth(2).click();
  assert.equal(await page.locator('.aviator-card').nth(2).getAttribute('aria-pressed'),'true');
  assert.equal(await page.locator('.aviator-plane img').count(),4);
  for(const id of ['prehistory','strategy','events','commanders','forces','cities','partisans','technology','connections','then-now','memory','results']) {
   await visit('#'+id);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,`${name} overflow at ${id}`);
   await page.screenshot({path:`artifacts/${name}-${id}-v3.png`});
  }
  await page.close();console.log(`${name}: map, layers, focus, fullscreen, timeline, aviators, layout OK`);
 }
 const page=await browser.newPage({viewport:{width:1280,height:900},reducedMotion:'reduce'});
 await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
 assert.equal(await page.locator('.operation-pin').evaluate(el=>getComputedStyle(el).position),'relative');
 console.log('reduced-motion: static passage OK');assert.deepEqual(errors,[]);console.log('VISUAL_CHECK_OK');
} finally {await browser.close()}
