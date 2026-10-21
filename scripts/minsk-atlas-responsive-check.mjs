import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,channel:'chrome'});
try{
for(const [width,height] of [[1920,1080],[320,568],[844,390]]){
const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:5180/',{waitUntil:'networkidle'});await page.evaluate(()=>scrollTo(0,document.querySelector('#map').offsetTop+innerHeight));await page.getByRole('button',{name:'Приблизить Минскую область'}).focus();await page.keyboard.press('Enter');await page.locator('.battle-event-list>button').first().waitFor({state:'attached'});
if(width<=700)await page.locator('.battle-mobile-open').click();
await page.locator('.battle-tour-start').click();await page.locator('.battle-tour-control').waitFor();assert.equal(await page.getByRole('button',{name:'Продолжить маршрут'}).count(),1,'Reduced motion must not auto-play');
for(let i=1;i<12;i++)await page.getByRole('button',{name:'Следующая остановка',exact:true}).click();assert.equal(await page.getByRole('button',{name:'Следующая остановка',exact:true}).isDisabled(),true);assert.ok((await page.locator('.battle-tour-control').innerText()).includes('12 / 12'));
await page.screenshot({path:`artifacts/minsk-atlas-final-${width}.png`});
await page.getByRole('button',{name:'Завершить маршрут',exact:true}).click();await page.keyboard.press('Escape');
assert.equal(await page.locator('.region-focused').count(),1);
await page.keyboard.press('Escape');assert.equal(await page.locator('.region-focused').count(),0);assert.equal(await page.locator('.battle-map-layer').count(),0,'Markers unmount on return');
assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.deepEqual(errors,[]);console.log(`ATLAS_VIEW ${width}x${height}: PASS (12 tour stops, reduced motion, Escape layers, cleanup, viewport)`);await page.close();
}
const page=await browser.newPage({viewport:{width:1440,height:900}});await page.goto('http://127.0.0.1:5180/',{waitUntil:'networkidle'});await page.evaluate(()=>scrollTo(0,document.querySelector('#map').offsetTop+innerHeight));await page.getByRole('button',{name:'Приблизить Минскую область'}).focus();await page.keyboard.press('Enter');await page.locator('.battle-tour-start').waitFor();await page.locator('.battle-tour-start').click();await page.getByRole('button',{name:'Приостановить маршрут'}).waitFor();await page.waitForTimeout(8700);assert.ok((await page.locator('.battle-tour-control').innerText()).includes('02 / 12'),'Tour advances');await page.getByRole('button',{name:'Приостановить маршрут'}).click();const paused=await page.locator('.battle-tour-control').innerText();await page.waitForTimeout(8700);assert.equal(await page.locator('.battle-tour-control').innerText(),paused,'Paused tour stays put');await page.getByRole('button',{name:'Завершить маршрут'}).click();console.log('ATLAS_PLAYBACK: PASS (smooth camera, automatic advance, real pause)');
}finally{await browser.close()}
