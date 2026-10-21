import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,channel:'chrome'});
try{
 for(const width of [1440,390]){
 const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.BASE_URL || 'http://127.0.0.1:5180/',{waitUntil:'networkidle'});
 await page.evaluate(()=>scrollTo(0,document.querySelector('#map').offsetTop+innerHeight));
 await page.getByRole('button',{name:'Приблизить Минскую область'}).focus();await page.keyboard.press('Enter');
 await page.locator('.battle-event-list>button').first().waitFor({state:'attached'});await page.waitForTimeout(500);
 await page.screenshot({path:`artifacts/minsk-atlas-overview-${width}.png`});
 if(width<700)await page.locator('.battle-mobile-open').click();
 await page.getByRole('textbox',{name:'Поиск боевого события'}).fill('Борисов');
 assert.ok(await page.locator('.battle-event-list>button').count()>=2);
 await page.locator('.battle-event-list>button').filter({hasText:'Борисов'}).first().click();
 await page.locator('.battle-event-card').waitFor();await page.waitForTimeout(150);
 await page.screenshot({path:`artifacts/minsk-atlas-detail-${width}.png`});
 assert.equal(await page.locator('.battle-event-card .battle-emblem').count(),1);
 assert.ok(await page.locator('.battle-event-card time').innerText());
 assert.ok(await page.locator('.battle-event-card h3').innerText());
 assert.equal(await page.locator('.battle-event-lead,.battle-significance,.battle-location-note').count(),0);
 await page.keyboard.press('Escape');assert.equal(await page.locator('.region-focused').count(),1,'First Escape closes card only');
 assert.equal(await page.locator('.battle-event-card').count(),0);
 if(width<700)await page.locator('.battle-mobile-open').click();
 await page.getByRole('textbox',{name:'Поиск боевого события'}).fill('');
 await page.getByRole('button',{name:'События 30 июня',exact:true}).click();assert.ok(await page.locator('.battle-event-list>button').count()<76);
 await page.getByRole('button',{name:'Весь период',exact:true}).click();
 await page.getByRole('button',{name:'Об источниках и полноте атласа'}).click();await page.locator('.battle-method').waitFor();
 await page.screenshot({path:`artifacts/minsk-atlas-sources-${width}.png`});
 assert.ok((await page.locator('.battle-method').innerText()).includes('не исчерпывает'));
 await page.keyboard.press('Escape');
 if(width<700)await page.locator('.battle-mobile-open').click();
 await page.getByRole('button',{name:'ПОКАЗАТЬ ХОД ОПЕРАЦИИ 12 остановок · от прорыва до разгрома котла'}).click();
 await page.locator('.battle-tour-control').waitFor();
 await page.getByRole('button',{name:'Следующая остановка',exact:true}).click();
 await page.screenshot({path:`artifacts/minsk-atlas-tour-${width}.png`});
 await page.getByRole('button',{name:'Завершить маршрут',exact:true}).click();
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
 assert.deepEqual(errors,[]);console.log(`ATLAS ${width}: PASS`);await page.close();
 }
}finally{await browser.close()}

