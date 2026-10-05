import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
const errors=[];
try{
 for(const width of [1440,390]){
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
  assert.equal(await page.locator('#decision-lab,.war-room,.map-enter-button,.map-immersion').count(),0);
  assert.equal(await page.locator('main a[href^="#"]').count(),0);
  assert.equal(await page.locator('a[href="#decision-lab"]').count(),0);
  const map=page.locator('#map');
  await map.getByRole('button',{name:'3-й Белорусский фронт',exact:true}).click();
  assert.equal(await page.getByLabel('Дата операции',{exact:true}).inputValue(),'3');
  assert.equal(await page.locator('.map-immersion').count(),0);
  await map.getByRole('button',{name:'Слои карты',exact:true}).click();
  await map.getByLabel('Железные дороги',{exact:true}).check();
  await map.getByRole('button',{name:'Сравнение до и после',exact:true}).click();
  assert.equal(await map.getByLabel('Сравнение карты',{exact:true}).count(),1);
  await map.getByRole('button',{name:'Развернуть карту',exact:true}).click();
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('.map-expanded').count(),0);
  await page.locator('#archive').scrollIntoViewIfNeeded();
  await page.screenshot({path:`artifacts/navigation-cleanup-${width}.png`});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.close();
 }
 assert.deepEqual(errors,[]);
 console.log('PASS: section shortcuts/game/panorama absent; map dates, layers, comparison, fullscreen and Escape work; desktop/mobile without errors.');
}finally{await browser.close()}
