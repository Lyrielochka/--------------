import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
const errors=[];
try{for(const width of [1440,390]){
 const p=await browser.newPage({viewport:{width,height:900},reducedMotion:width===390?'reduce':'no-preference'});
 p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
 const trigger=p.getByRole('button',{name:'Открыть событие: Минское окружение'});
 assert.equal(await trigger.innerText(),'');
 await trigger.click();
 const dialog=p.getByRole('dialog',{name:'Минское окружение'});await dialog.waitFor();
 for(const img of await dialog.locator('img').all())await img.evaluate(e=>e.decode());
 assert.equal(await p.getByLabel('Дата операции',{exact:true}).inputValue(),'6');
 await p.waitForTimeout(width===390?100:5900);
 assert.equal(await dialog.locator('.minsk-outcome').evaluate(e=>getComputedStyle(e).opacity),'1');
 await p.screenshot({path:`artifacts/minsk-event-${width}.png`});
 for(const name of ['Северный охват','Южный охват','Удар с востока']){
  await dialog.getByRole('button',{name,exact:true}).focus();await p.keyboard.press('Enter');
  assert.equal(await dialog.getByRole('button',{name,exact:true}).getAttribute('aria-pressed'),'true');
 }
 assert(await dialog.evaluate(e=>e.scrollHeight<=e.clientHeight+1));
 assert.equal(await dialog.locator('.minsk-enemy rect').count(),0);
 for(let i=0;i<3;i++){
  await dialog.locator('.minsk-episodes button').nth(i).click();
  assert.equal(await dialog.locator('.minsk-action').getAttribute('data-phase'),String(i));
  assert((await dialog.locator('footer p').innerText()).includes(['3-й Белорусский','4-й армии','11 июля'][i]));
 }
 await dialog.getByRole('button',{name:'Повторить событие'}).click();
 assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 await dialog.getByRole('button',{name:'Остановить анимацию'}).click();
 await dialog.getByRole('button',{name:'Повторить событие'}).click();
 await p.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});
 assert.equal(await trigger.evaluate(e=>document.activeElement===e),true);
 await trigger.click();await dialog.getByRole('button',{name:'Закрыть событие'}).click();await dialog.waitFor({state:'hidden'});
 assert.equal(await p.locator('#decision-lab,.map-immersion').count(),0);
 await p.close();
}assert.deepEqual(errors,[]);console.log('PASS: event marker, images, animation/static version, replay/pause, date, Escape/focus return, mobile, no JS errors.');}finally{await browser.close()}
