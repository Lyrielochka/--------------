import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,channel:'chrome'});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto(process.env.BASE_URL||'http://127.0.0.1:5173/',{waitUntil:'networkidle'});
 await page.locator('#partisans').scrollIntoViewIfNeeded();
 assert.ok(await page.locator('#partisans .partisan-marker').count()>0);
 await page.locator('#partisans').getByRole('button',{name:'Июль',exact:true}).click();
 assert.ok(await page.locator('#partisans .partisan-marker').count()>0);
 await page.locator('#partisans').getByRole('button',{name:'Мосты',exact:true}).click();
 await page.locator('#partisans .partisan-marker').first().click();
 assert.equal(await page.getByRole('dialog').count(),1);
 assert.ok(await page.getByRole('dialog').getByRole('link',{name:/ИСТОЧНИК/}).getAttribute('href'));
 await page.getByRole('button',{name:'Закрыть'}).click();
 await page.getByRole('dialog').waitFor({state:'detached'});
 await page.screenshot({path:'artifacts/partisan-map-desktop.png'});
 assert.deepEqual(errors,[]);
 const mobile=await browser.newPage({viewport:{width:390,height:844}});
 await mobile.goto(process.env.BASE_URL||'http://127.0.0.1:5173/',{waitUntil:'networkidle'});
 await mobile.locator('#partisans').scrollIntoViewIfNeeded();
 assert.ok(await mobile.locator('#partisans .partisan-marker').count()>0);
 assert.ok(await mobile.evaluate(()=>document.documentElement.scrollWidth-innerWidth)<=1);
 await mobile.screenshot({path:'artifacts/partisan-map-mobile.png'});
 console.log('Partisan map: markers, filters, detail and source OK');
}finally{await browser.close()}
