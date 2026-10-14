import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,channel:'chrome'});
try {
 for(const [name,width,delay,fail] of [['fast',1440,0,false],['slow-cover',390,3500,false],['failed-cover',1440,0,true],['long-load',1440,16000,false]]) {
  const page=await browser.newPage({viewport:{width,height:844},reducedMotion:'reduce'});
  const errors=[]; page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{window.loaderEvents=0;window.addEventListener('operation:loaded',()=>{window.loaderEvents++;window.loaderFinished=performance.now()})});
  let held=false;
  if(delay||fail) await page.route('**/*',async route=>{
   if(decodeURIComponent(route.request().url()).includes('фоновое изображение')&&!route.request().url().includes('?import')) {
    if(fail) return route.abort();
    held=true; await new Promise(resolve=>setTimeout(resolve,delay));
    return route.continue();
   }
   return route.continue();
  });
  const nav=page.goto('http://127.0.0.1:5173/',{waitUntil:'domcontentloaded'});
  await nav;
  if(delay) {
   await page.waitForFunction(()=>!!document.querySelector('#root #hero'));
   await page.waitForTimeout(delay===16000?15000:1000);
   assert(await page.locator('#operation-loader').count(),name+' closed while cover was loading');
   assert(await page.evaluate(()=>document.documentElement.classList.contains('operation-loading')));
  }
  await page.locator('#operation-loader').waitFor({state:'detached',timeout:30000});
  const state=await page.evaluate(()=>({events:window.loaderEvents,ms:Math.round(window.loaderFinished),visible:getComputedStyle(document.querySelector('#root')).visibility,locked:document.documentElement.classList.contains('operation-loading')}));
  assert.equal(state.events,1);assert.equal(state.visible,'visible');assert.equal(state.locked,false);assert.deepEqual(errors,[]);
  if(name==='fast')assert(state.ms<7000);
  if(delay)assert(held);
  console.log('PASS',name,JSON.stringify(state));await page.close();
 }
}finally{await browser.close()}
