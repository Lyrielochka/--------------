import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
try {for(const width of [1440,390]) {
 const p=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
 await p.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});await p.locator('#operation-loader').waitFor({state:'detached'});
 const map=p.locator('#map');await map.getByRole('button',{name:'3-й Белорусский фронт',exact:true}).click();assert.equal(await p.getByLabel('Дата операции',{exact:true}).inputValue(),'3');
 await map.getByRole('button',{name:'Слои карты',exact:true}).click();await map.getByLabel('Железные дороги',{exact:true}).check();assert(await map.locator('[data-layer="rail"] path').count()>0);
 await map.getByRole('button',{name:'Сравнение до и после',exact:true}).click();assert.equal(await map.getByLabel('Сравнение карты',{exact:true}).count(),1);
 await map.getByRole('button',{name:'Развернуть карту',exact:true}).click();await p.keyboard.press('Escape');assert.equal(await p.locator('.map-expanded').count(),0);
 const aviators=p.locator('#aviators');for(const toggle of await aviators.locator('button[id^="sky-toggle"]').all()){await toggle.click();for(const img of await aviators.locator('.sky-equipment img').all()){if(await img.isVisible()){await img.scrollIntoViewIfNeeded();await img.evaluate(el=>el.decode())}}await p.keyboard.press('Escape')}
 assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));console.log(`PASS interactions ${width}: map layers, comparison, fullscreen, aircraft images, no overflow`);await p.close();
}}finally{await browser.close()}
