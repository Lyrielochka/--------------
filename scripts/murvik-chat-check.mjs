import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,channel:'chrome'});
const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});await page.locator('#operation-loader').waitFor({state:'detached',timeout:60000});
 const launch=page.getByRole('button',{name:'Мурвiк — открыть помощника'});await launch.click();
 await page.getByRole('button',{name:'Спросить Мурвiка'}).click();
 const input=page.getByRole('textbox',{name:'Вопрос Мурвiку'}),log=page.getByRole('log');
 const ask=async(text)=>{await input.fill(text);await input.press('Enter');await page.waitForFunction(()=>!document.querySelector('.murvik-pending'));};
 await input.fill('Когда освободили Минск?');assert.equal(await page.locator('.murvik-portrait').getAttribute('data-mood'),'listening');
 await input.press('Enter');await page.locator('.murvik-pending').waitFor();assert.equal(await page.locator('.murvik-portrait').getAttribute('data-mood'),'thinking');
 await page.waitForFunction(()=>!document.querySelector('.murvik-pending'));
 assert.match(await log.innerText(),/3 июля/);
 while(!await log.getByRole('button',{name:'Минск на карте'}).count()&&await page.getByRole('button',{name:'Далее →',exact:true}).isEnabled())await page.getByRole('button',{name:'Далее →',exact:true}).click();
 assert.ok(await log.getByRole('button',{name:'Минск на карте'}).count());
 await ask('Расскажи о Т-34-85');await ask('А его экипаж?');assert.match(await log.locator('.murvik-message').last().innerText(),/5 человек/);
 await page.locator('#murvik-panel').screenshot({path:'artifacts/murvik-chat-desktop.png'});
 await page.getByRole('button',{name:'Викторина',exact:false}).click();await page.getByRole('button',{name:'Начать викторину'}).click();
 const question=await page.locator('.murvik-body h3').innerText();await page.getByRole('button',{name:'Спросить Мурвiка'}).click();assert.match(await log.innerText(),/5 человек/);
 await page.getByRole('button',{name:'Викторина',exact:false}).click();assert.equal(await page.locator('.murvik-body h3').innerText(),question);
 await page.getByRole('button',{name:'Спросить Мурвiка'}).click();
 await ask('Какая погода в Минске сегодня?');assert.match(await log.locator('.murvik-message').last().innerText(),/Не буду придумывать/);
 await ask('Спасибо!');assert.equal(await page.locator('.murvik-portrait').getAttribute('data-mood'),'happy');
 await page.keyboard.press('Escape');await launch.click();assert.match(await log.innerText(),/Мур-р/);
 for(const width of [390,320]){
  await page.setViewportSize({width,height:844});const panel=page.locator('#murvik-panel');
  assert.equal(await panel.evaluate(e=>e.scrollWidth<=e.clientWidth),true);
  const box=await panel.boundingBox();assert.ok(box.x>=0&&box.x+box.width<=width);
  await input.focus();await input.press('Tab');assert.equal(await page.getByRole('button',{name:'Закрыть помощника'}).evaluate(e=>e===document.activeElement),true);
  await panel.screenshot({path:`artifacts/murvik-chat-mobile-${width}.png`});
 }
 await page.getByRole('button',{name:'Очистить диалог'}).click();assert.equal(await log.locator('.murvik-message').count(),1);
 await page.emulateMedia({reducedMotion:'no-preference'});await input.fill('Расскажи о Рокоссовском');await input.press('Enter');
 await page.waitForFunction(()=>document.querySelector('.murvik-portrait')?.dataset.mood==='speaking');
 await page.getByRole('button',{name:'Очистить диалог'}).click();await page.waitForTimeout(1000);assert.equal(await log.locator('.murvik-message').count(),1);assert.equal(await page.locator('.murvik-pending').count(),0);
 await page.waitForFunction(()=>document.querySelector('.murvik-character img')?.src.includes('blink.webp'),null,{timeout:8000});
 await page.locator('.murvik-portrait').screenshot({path:'artifacts/murvik-blink-preview.png'});
 await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('.murvik-character').evaluate(e=>getComputedStyle(e).animationName),'none');
 await page.getByRole('button',{name:'Когда освободили Минск?',exact:true}).click();await page.waitForFunction(()=>!document.querySelector('.murvik-pending'));
 while(!await log.getByRole('button',{name:'Минск на карте'}).count()&&await page.getByRole('button',{name:'Далее →',exact:true}).isEnabled())await page.getByRole('button',{name:'Далее →',exact:true}).click();
 await log.getByRole('button',{name:'Минск на карте'}).click();assert.equal(await page.locator('#murvik-panel').count(),0);
 assert.ok(await page.locator('#map').evaluate(e=>Math.abs(e.getBoundingClientRect().top)<200));
 assert.deepEqual(errors,[]);console.log('MURVIK_CHAT_OK: answers, follow-up, mood states, quiz preservation, session history, links, clear/cancel, keyboard, reduced motion, blink, 1440/390/320px');
}finally{await browser.close();}
