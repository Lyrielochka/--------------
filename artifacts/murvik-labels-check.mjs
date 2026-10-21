import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,channel:'chrome'});
try{const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
await page.route('**/api/murvik/health',r=>r.fulfill({json:{available:true}}));
await page.route('**/api/murvik/chat',async r=>{await new Promise(resolve=>setTimeout(resolve,800));await r.fulfill({json:{text:'Минск освободили 3 июля 1944 года.',engine:'ollama',links:[],suggestions:[],mood:'speaking'}});});
await page.goto('http://127.0.0.1:4173/',{waitUntil:'networkidle'});await page.locator('#operation-loader').waitFor({state:'detached',timeout:60000});await page.getByRole('button',{name:'Мурвiк — открыть помощника'}).click();
assert.doesNotMatch(await page.locator('#murvik-panel').innerText(),/40|вопросов в запасе/);
await page.getByRole('button',{name:'Спросить Мурвiка'}).click();await page.getByRole('textbox',{name:'Вопрос Мурвiку'}).fill('Когда освободили Минск?');await page.getByRole('button',{name:'Отправить вопрос'}).click();
await page.locator('.murvik-pending').waitFor();assert.match(await page.locator('.murvik-pending').innerText(),/Мурвiк готовит ответ/);
assert.doesNotMatch(await page.locator('#murvik-panel').innerText(),/qwen|Ollama|этом ПК|локальн|НЕЙРОСЕТЬ/i);
await page.locator('[data-engine="ollama"]').waitFor();assert.match(await page.locator('[data-engine="ollama"] small').innerText(),/МУРВIК ОТВЕЧАЕТ/);
await page.locator('#murvik-panel').screenshot({path:'artifacts/murvik-clean-labels.png'});
console.log('MURVIK_LABELS_OK');}finally{await browser.close();}
