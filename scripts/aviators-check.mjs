import {chromium} from 'playwright';
import assert from 'node:assert/strict';

const browser=await chromium.launch({headless:true,channel:'chrome'});
const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
const errors=[];
page.on('pageerror',e=>errors.push(e.message));
try{
  await page.goto(process.env.BASE_URL||'http://127.0.0.1:5173/',{waitUntil:'networkidle'});
  const section=page.locator('#aviators');
  await section.scrollIntoViewIfNeeded();
  const cards=section.locator('.aviator-card');
  assert.equal(await cards.count(),4);
  const names=await section.locator('.aviator-copy strong').allTextContents();
  for(const name of ['Федутенко','Фомичёва','Меклин','Никулина'])assert.ok(names.some(value=>value.includes(name)));
  for(const card of await cards.all())assert.equal(await card.locator('.aviator-plane img').evaluate(el=>el.complete&&el.naturalWidth>0),true);
  await section.screenshot({path:'artifacts/desktop-aviators-showcase.png'});
  await cards.nth(2).click();
  assert.equal(await cards.nth(2).getAttribute('aria-pressed'),'true');
  assert.equal(await cards.nth(0).getAttribute('aria-pressed'),'false');
  await section.screenshot({path:'artifacts/desktop-aviators-active.png'});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)<=1);
  assert.deepEqual(errors,[]);
  console.log('AVIATORS_CHECK_OK');
}finally{await browser.close()}
