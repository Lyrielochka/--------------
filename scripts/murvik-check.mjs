import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {questions,makeRound,HISTORY_KEY} from '../src/murvikQuestions.js';
assert.equal(new Set(makeRound().map(q=>q.id)).size,5);
const browser=await chromium.launch({headless:true,channel:'chrome'});
const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
try {
  await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
  await page.locator('#operation-loader').waitFor({state:'detached',timeout:60000});
  const launcher=page.getByRole('button',{name:'Мурвiк — открыть помощника'});
  await launcher.click();const panel=page.locator('#murvik-panel');
  await panel.locator('img').evaluate(img=>img.decode());
  await panel.screenshot({path:'artifacts/murvik-desktop.png'});
  await page.getByRole('button',{name:'Начать викторину'}).click();
  const seen=[];
  for(let i=0;i<5;i++){
    const text=await panel.locator('h3').innerText();const q=questions.find(q=>q.question===text);assert.ok(q);seen.push(q.id);
    if(i===0){await page.getByRole('button',{name:'Мурвiк, дай подсказку'}).click();assert.ok((await panel.innerText()).includes(q.hint));}
    await panel.locator('.murvik-options button').nth(q.answer).click();
    assert.equal(await panel.locator('.murvik-options button:disabled').count(),3);
    if(i===0)await panel.screenshot({path:'artifacts/murvik-answer.png'});
    await page.getByRole('button',{name:i===4?'Мой результат':'Следующий вопрос'}).click();
  }
  assert.equal((await panel.locator('.murvik-score').innerText()).replace(/\s/g,''),'5/5');
  assert.equal(await page.evaluate(()=>localStorage.getItem('murvik-best')),'5');
  await page.getByRole('button',{name:'Сыграть ещё раз'}).click();
  // Wrong answers must not advance or add score.
  const question=await panel.locator('h3').innerText();const item=questions.find(q=>q.question===question);
  assert.ok(!seen.includes(item.id));
  const reserved=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).recent,HISTORY_KEY);
  assert.equal(new Set(reserved).size,10);
  await panel.locator('.murvik-options button').nth((item.answer+1)%3).click();
  assert.ok((await panel.locator('.murvik-progress').innerText()).includes('ВЕРНО: 0'));
  assert.equal(await panel.locator('.wrong').count(),1);assert.equal(await panel.locator('.correct').count(),1);
  await page.keyboard.press('Escape');assert.equal(await panel.count(),0);assert.equal(await launcher.evaluate(e=>e===document.activeElement),true);
  await launcher.click();assert.equal(await panel.locator('.wrong').count(),1);
  await page.getByRole('button',{name:'В меню помощника'}).click();
  await page.getByRole('button',{name:'Дай мне задание'}).click();
  await page.getByRole('button',{name:'Другое задание'}).click();
  await page.getByRole('button',{name:'К месту задания'}).click();assert.equal(await panel.count(),0);
  assert.ok(await page.locator('#commanders').evaluate(e=>Math.abs(e.getBoundingClientRect().top)<200));
  for(const width of [390,320]){
    await page.setViewportSize({width,height:844});await launcher.click();
    if(await page.getByRole('button',{name:'В меню помощника'}).count())await page.getByRole('button',{name:'В меню помощника'}).click();
    assert.equal(await panel.evaluate(e=>e.scrollWidth<=e.clientWidth),true);
    const box=await panel.boundingBox();assert.ok(box.x>=0&&box.x+box.width<=width);
    await panel.screenshot({path:`artifacts/murvik-mobile-${width}.png`});
    await page.getByRole('button',{name:'Закрыть помощника'}).click();
  }
  await page.reload({waitUntil:'networkidle'});await launcher.waitFor({timeout:60000});await launcher.click();
  assert.ok((await panel.innerText()).includes('рекорд 5/5'));
  await page.getByRole('button',{name:'Начать викторину'}).click();
  const reloadedText=await panel.locator('h3').innerText();
  assert.ok(!reserved.includes(questions.find(q=>q.question===reloadedText).id));
  assert.equal(await panel.locator('.murvik-starfield i').first().evaluate(e=>getComputedStyle(e).animationName),'none');
  await page.emulateMedia({reducedMotion:'no-preference'});
  assert.equal(await panel.locator('.murvik-starfield i').first().evaluate(e=>getComputedStyle(e).animationName),'murvik-spark');
  assert.deepEqual(errors,[]);console.log('MURVIK_CHECK_OK: correct/wrong answers, hints, scoring, restart, persistence, missions, Escape/focus, 1440/390/320px, no runtime errors');
} finally {await browser.close();}
