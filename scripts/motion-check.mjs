import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,channel:'chrome'});
try {
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
 await page.locator('.operation-scroll').evaluate(el=>window.scrollTo({top:el.offsetTop+(el.offsetHeight-innerHeight)*.7,behavior:'instant'}));
 await page.waitForTimeout(900);
 await page.screenshot({path:'artifacts/desktop-passage-v3.png'});
 await page.locator('#map').evaluate(el=>el.scrollIntoView({behavior:'instant'}));
 await page.getByRole('button',{name:'Сравнение до и после',exact:true}).click();
 await page.getByLabel('Сравнение карты',{exact:true}).fill('30');
 assert.match(await page.locator('.compare-before').getAttribute('style'),/70%/);
 await page.getByRole('button',{name:'Сравнение до и после',exact:true}).click();
 await page.getByLabel('Дата операции',{exact:true}).fill('0');
 await page.getByRole('button',{name:'Воспроизвести ход операции',exact:true}).click();
 await page.waitForTimeout(2700);
 assert.notEqual(await page.getByLabel('Дата операции',{exact:true}).inputValue(),'0');
 await page.locator('#archive').evaluate(el=>el.scrollIntoView({behavior:'instant'}));
 await page.waitForTimeout(400);
 const paused=await page.getByLabel('Дата операции',{exact:true}).inputValue();
 await page.waitForTimeout(2700);
 assert.equal(await page.getByLabel('Дата операции',{exact:true}).inputValue(),paused);
 console.log('MOTION_CHECK_OK: comparison, playback, offscreen pause');
} finally {await browser.close()}
