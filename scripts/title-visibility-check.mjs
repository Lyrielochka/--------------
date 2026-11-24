import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const b=await chromium.launch({channel:'chrome',headless:true});
try{
 for(const mode of ['normal','missing-mask','missing-scene']){
 const page=await b.newPage({viewport:{width:1440,height:900}});
 if(mode==='missing-mask')await page.route('**/bagration-title-mask.png',r=>r.abort());
 if(mode==='missing-scene')await page.route('**/bagration-title-battle.webp',r=>r.abort());
 await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});await page.waitForTimeout(2000);
 const title=page.locator('.living-title');
 const state=await title.evaluate(h=>({ready:h.dataset.titleReady,text:getComputedStyle(h.querySelector('.title-size')).visibility,fill:getComputedStyle(h.querySelector('.title-size')).webkitTextFillColor,window:getComputedStyle(h.querySelector('.title-window')).visibility,rect:h.getBoundingClientRect().toJSON()}));
 if(mode==='normal'){assert.equal(state.ready,'true');assert.equal(state.window,'visible')}
 else{assert.equal(state.ready,'false');assert.equal(state.text,'visible');assert.notEqual(state.fill,'transparent')}
 assert.ok(state.rect.width>200&&state.rect.height>100);
 await page.locator('#hero').screenshot({path:`artifacts/title-visible-${mode}.png`});console.log(mode,state);
 await page.setViewportSize({width:390,height:900});await title.screenshot({path:`artifacts/title-visible-${mode}-mobile.png`});
 await page.close();
 }
}finally{await b.close()}
