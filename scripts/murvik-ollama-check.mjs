import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({headless:true,channel:'chrome'});
const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'networkidle'});await page.locator('#operation-loader').waitFor({state:'detached',timeout:60000});
 await page.getByRole('button',{name:'Мурвiк — открыть помощника'}).click();await page.getByRole('button',{name:'Спросить Мурвiка'}).click();
 await page.waitForFunction(()=>document.querySelector('.murvik-chat-top')?.textContent.includes('Мурвiк на связи'));
 const input=page.getByRole('textbox',{name:'Вопрос Мурвiку'});
 await input.fill('Какая пушка у Т-34-85? Ответь одним предложением.');const start=Date.now();await input.press('Enter');
 await page.locator('[data-engine="ollama"]').waitFor({timeout:130000});
 const answer=await page.locator('[data-engine="ollama"] p').innerText();assert.match(answer,/85/);
 await page.locator('#murvik-panel').screenshot({path:'artifacts/murvik-ollama-desktop.png'});
 await writeFile('artifacts/murvik-ollama-real.json',JSON.stringify({model:'qwen3:8b',question:'Какая пушка у Т-34-85?',answer,elapsedSeconds:(Date.now()-start)/1000},null,2));
 console.log('OLLAMA_REAL_BROWSER_OK',JSON.stringify({answer,seconds:(Date.now()-start)/1000}));
 await page.setViewportSize({width:320,height:568});await page.locator('#murvik-panel').screenshot({path:'artifacts/murvik-ollama-mobile.png'});
 const overflow=await page.locator('#murvik-panel').evaluate(e=>e.scrollHeight>e.clientHeight+2||e.scrollWidth>e.clientWidth+2);assert.equal(overflow,false);
 await page.route('**/api/murvik/chat',route=>route.fulfill({status:503,contentType:'application/json',body:'{"error":"offline"}'}));
 await input.fill('Какие фронты участвовали?');await input.press('Enter');await page.locator('[data-engine="local"]').waitFor();assert.match(await page.locator('[data-engine="local"] p').innerText(),/Прибалтийский/);
 assert.match(await page.locator('.murvik-chat-top').innerText(),/Мурвiк на связи/);
 assert.deepEqual(errors,[]);console.log('OLLAMA_BROWSER_FALLBACK_OK: real model, 320px fit, automatic fallback');
}finally{await browser.close();}
