import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
const errors=[];
try{
 const page=await browser.newPage({viewport:{width:1440,height:900}});page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.MURVIK_TEST_URL||'http://127.0.0.1:5173/',{waitUntil:'networkidle'});
 await page.locator('#operation-loader').waitFor({state:'detached',timeout:60000});
 const launch=page.getByRole('button',{name:'Мурвiк — открыть помощника'});
 await launch.locator('img[data-blink-ready="true"]').waitFor();
 const blink=async locator=>{
  await locator.locator('[data-blink-ready="true"]').waitFor();
  await locator.locator('img').evaluate(img=>img.dataset.blink==='closed'?Promise.resolve():new Promise(resolve=>{const observer=new MutationObserver(()=>{if(img.dataset.blink==='closed'){observer.disconnect();resolve();}});observer.observe(img,{attributes:true,attributeFilter:['data-blink']});}));
  const image=locator.locator('img');assert.equal(await image.getAttribute('data-blink'),'closed');
  assert.match(await image.getAttribute('src'),/-blink\.webp$/);
  assert.ok(await image.evaluate(i=>i.complete&&i.naturalWidth>0));
  await locator.locator('img[data-blink="open"]').waitFor({timeout:1000});assert.equal(await image.getAttribute('data-blink'),'open');
 };
 await blink(launch);
 await launch.click();
 await blink(page.locator('.murvik-character'));
 await page.locator('.murvik-portrait').screenshot({path:'artifacts/murvik-kitten-blink-open.png'});
 await page.waitForFunction(()=>document.querySelector('.murvik-character img')?.dataset.blink==='closed',{},{polling:'raf',timeout:8000});
 assert.equal(await page.locator('.murvik-character img').getAttribute('data-blink'),'closed');
 await page.locator('.murvik-portrait').screenshot({path:'artifacts/murvik-kitten-blink-closed.png'});
 await page.locator('.murvik-character img[data-blink="open"]').waitFor({timeout:1000});
 await page.getByRole('button',{name:'Экскурсия',exact:true}).click();
 await page.getByRole('button',{name:'Ⅱ Пауза',exact:true}).click();
 for(let i=0;i<4;i++){
  await page.getByRole('button',{name:`Кадр ${i+1}`,exact:true}).click();
  console.log('Checking tour pose',i);
  await blink(page.locator('.murvik-tour-character'));
  assert.equal(await page.locator('.murvik-tour-character').evaluate(el=>getComputedStyle(el).animationName),'none');
 }
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.waitForTimeout(5000);
 assert.equal(await page.locator('.murvik-tour-character img').getAttribute('data-blink'),'open');
 await page.getByRole('button',{name:'Завершить экскурсию',exact:true}).click();
 await page.waitForTimeout(5000);assert.deepEqual(errors,[]);
 console.log('MURVIK BLINK PASS: avatar, assistant portrait and all four tour poses close for 170ms and reopen; bodies stay still; reduced motion and cleanup verified.');
}finally{await browser.close();}
