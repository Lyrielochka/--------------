import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,channel:'chrome'});
const errors=[];
try{
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
 await page.locator('#operation-loader').waitFor({state:'detached',timeout:60000});
 const check=async()=>{
  await page.waitForFunction(()=>[...document.querySelectorAll('.murvik-character img')].every(img=>img.complete&&img.naturalWidth>0));
  assert.match(await page.locator('.murvik-character img').getAttribute('src'),/natural-v2\/(sit|stand|rest|attentive)(-blink)?\.webp$/);
  assert.match(await page.locator('.murvik-character img').getAttribute('alt'),/Маленький рысёнок/);
  assert.equal(await page.locator('.murvik-character').evaluate(el=>getComputedStyle(el).animationName),'none');
  assert.ok(await page.locator('.murvik-character img').evaluate(img=>{const r=img.getBoundingClientRect(),p=img.closest('.murvik-portrait').getBoundingClientRect();return r.left>=p.left-1&&r.right<=p.right+1&&r.top>=p.top-1&&r.bottom<=p.bottom+1}),'complete kitten fits portrait');
 };
 for(const [width,height] of [[1440,900],[1280,720],[390,844],[320,568],[844,390]]){
  await page.setViewportSize({width,height});
  const launch=page.getByRole('button',{name:'Мурвiк — открыть помощника'});
  await page.waitForFunction(()=>{const i=document.querySelector('.murvik-launcher img');return i?.complete&&i.naturalWidth>0});
  assert.match(await launch.locator('img').getAttribute('src'),/murvik-kitten-avatar-v3/);
  await launch.click();await check();
  await page.locator('#murvik-panel').screenshot({path:`artifacts/murvik-kitten-home-${width}.png`});
  await page.getByRole('button',{name:'Начать викторину'}).click();await check();
  await page.locator('.murvik-options button').first().click();await check();
  await page.locator('#murvik-panel').screenshot({path:`artifacts/murvik-kitten-quiz-${width}.png`});
  await page.getByRole('button',{name:'В меню помощника'}).click();
  await page.getByRole('button',{name:'Дай мне задание'}).click();await check();
  await page.getByRole('button',{name:'В меню помощника'}).click();
  await page.getByRole('button',{name:'Спросить Мурвiка'}).click();await check();
  await page.locator('#murvik-panel').screenshot({path:`artifacts/murvik-kitten-chat-${width}.png`});
  await page.getByRole('button',{name:'Викторина',exact:false}).click();
  await page.getByRole('button',{name:'Закрыть помощника'}).click();
 }
 assert.deepEqual(errors,[]);
 console.log('MURVIK ART PASS: new kitten avatar, home, quiz and feedback, mission, chat; complete portraits without animation or old assets at five viewport sizes.');
}finally{await browser.close();}
