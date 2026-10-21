import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {questions,HISTORY_KEY} from '../src/murvikQuestions.js';
const browser=await chromium.launch({headless:true,channel:'chrome'});
const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const check=async(label)=>{
 const issues=await page.locator('#murvik-panel').evaluate(panel=>{
  const p=panel.getBoundingClientRect();const errors=[];
  if(p.top<0||p.left<0||p.bottom>innerHeight+1||p.right>innerWidth+1)errors.push('panel out of viewport');
  for(const el of [panel,...panel.querySelectorAll('.murvik-body,.murvik-chat:not([hidden]),.murvik-chat-log,.murvik-message,.murvik-suggestions')]){if(!el.getClientRects().length||el.closest('[hidden]'))continue;if(el.scrollHeight>el.clientHeight+2)errors.push(el.className+' vertical '+el.scrollHeight+'/'+el.clientHeight);if(el.scrollWidth>el.clientWidth+2)errors.push(el.className+' horizontal');}
  for(const el of panel.querySelectorAll('button,textarea,h3')){if(!el.getClientRects().length||el.closest('[hidden]'))continue;const r=el.getBoundingClientRect();if(r.top<p.top-1||r.bottom>p.bottom+1)errors.push(el.textContent.slice(0,20)+' outside panel');}
  return errors;
 });assert.deepEqual(issues,[],label);
};
try{
 await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});await page.locator('#operation-loader').waitFor({state:'detached',timeout:60000});await page.getByRole('button',{name:'Мурвiк — открыть помощника'}).click();
 for(const [width,height] of [[1440,900],[1280,720],[390,844],[320,568],[844,390]]){
  await page.setViewportSize({width,height});await page.waitForTimeout(100);await check(`home ${width}x${height}`);
  await page.locator('#murvik-panel').screenshot({path:`artifacts/murvik-panel-home-${width}.png`});
  await page.getByRole('button',{name:'Начать викторину'}).click();await check(`question ${width}`);
  await page.getByRole('button',{name:'Мурвiк, дай подсказку'}).click();await check(`hint ${width}`);
  await page.locator('.murvik-options button').first().click();await check(`answer ${width}`);
  await page.locator('#murvik-panel').screenshot({path:`artifacts/murvik-panel-quiz-${width}.png`});
  await page.getByRole('button',{name:'В меню помощника'}).click();
  await page.getByRole('button',{name:'Дай мне задание'}).click();await check(`mission ${width}`);await page.getByRole('button',{name:'В меню помощника'}).click();
  await page.getByRole('button',{name:'Спросить Мурвiка'}).click();await check(`chat welcome ${width}`);
  await page.getByRole('textbox',{name:'Вопрос Мурвiку'}).fill('Сравни Т-34-85 и ИС-2');await page.getByRole('button',{name:'Отправить вопрос'}).click();await page.waitForFunction(()=>!document.querySelector('.murvik-pending'));
  await check(`chat long ${width}`);
  await page.locator('#murvik-panel').screenshot({path:`artifacts/murvik-panel-chat-${width}.png`});
  while(await page.locator('#murvik-panel').getByRole('button',{name:'Далее →',exact:true}).isEnabled()){await page.locator('#murvik-panel').getByRole('button',{name:'Далее →',exact:true}).click();await check(`chat part ${width}`);}
  await page.getByRole('button',{name:'Викторина',exact:false}).click();
 }
 await page.setViewportSize({width:320,height:568});
 await page.evaluate(({key,ids})=>localStorage.setItem(key,JSON.stringify({catalog:ids.join('|'),remaining:ids,recent:[]})),{key:HISTORY_KEY,ids:questions.map(q=>q.id)});
 for(let round=0;round<8;round++){
  await page.getByRole('button',{name:round?'Сыграть ещё раз':'Начать викторину'}).click();
  for(let index=0;index<5;index++){
   await check(`all question ${round}/${index}`);
   await page.getByRole('button',{name:'Мурвiк, дай подсказку'}).click();await check(`all hints ${round}/${index}`);
   await page.locator('.murvik-options button').first().click();await check(`all answers ${round}/${index}`);
   await page.getByRole('button',{name:index===4?'Мой результат':'Следующий вопрос'}).click();
  }
  await check(`result ${round}`);
 }
 assert.deepEqual(errors,[]);console.log('MURVIK_PANEL_OK: all 40 questions/hints/answers and results at 320x568; home/mission/paginated chat at 1440/1280/390/320/844; no overflow');
}finally{await browser.close();}

