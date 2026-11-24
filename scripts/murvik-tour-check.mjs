import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {tourStops,comicFrames,tourFocus} from '../src/murvikTour.js';
import {campaignEvents} from '../src/campaignTimeline.js';
const browser=await chromium.launch({headless:true,channel:'chrome'});
const errors=[];
try {
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
 await page.locator('#operation-loader').waitFor({state:'detached',timeout:60000});
 await page.getByRole('button',{name:'Мурвiк — открыть помощника'}).click();
 await page.getByRole('button',{name:'Экскурсия',exact:true}).click();
 await page.locator('.murvik-tour').waitFor();
 await page.waitForTimeout(950);
 assert.ok(await page.locator('.murvik-tour-character img').evaluate(el=>el.complete&&el.naturalWidth>0),'pose image loaded');
 const poses=new Set();
 assert.equal(tourStops.length,17);
 for(const stop of tourStops){
  assert.equal(comicFrames(stop.text).length,4,'four authored thoughts per stop');
  assert.ok(comicFrames(stop.text).every(line=>line.length<=230),'readable speech bubbles');
  if(!stop.event)for(const selector of tourFocus[stop.section])assert.equal(await page.locator(selector).count(),1,`exact focus exists: ${selector}`);
 }

 assert.equal(await page.evaluate(()=>document.body.style.overflow),'');
 await page.getByRole('button',{name:'Ⅱ Пауза',exact:true}).click();
 for(let i=0;i<tourStops.length;i++){
  await page.locator('#murvik-tour-stop').selectOption(String(i));
  await page.waitForTimeout(160);
  await page.waitForTimeout(900);

  assert.equal(await page.locator('.murvik-tour-copy h2').textContent(),tourStops[i].title);
 const bubbles=comicFrames(tourStops[i].text);
 for(let f=0;f<bubbles.length;f++){
  await page.getByRole('button',{name:`Кадр ${f+1}`,exact:true}).click();
  await page.waitForTimeout(70);
  assert.equal(await page.locator('.murvik-comic-bubble p').textContent(),bubbles[f]);
  poses.add(await page.locator('.murvik-tour').getAttribute('data-pose'));
  await page.waitForFunction(()=>{const img=document.querySelector('.murvik-tour-character img');return img?.complete&&img.naturalWidth>0});
  assert.ok(await page.locator('.murvik-tour').evaluate(el=>{const sprite=el.querySelector('.murvik-tour-character');return getComputedStyle(el).transitionDuration==='0s'&&getComputedStyle(sprite).animationName==='none'&&getComputedStyle(sprite.querySelector('img')).animationName==='none'}),'stationary character without motion');
  assert.equal(await page.locator('.murvik-tour-spotlight').count(),1,`bubble focus ${i}/${f}`);
 }
  assert.equal(await page.locator('.murvik-tour-target').count(),1,`highlight ${i}`);
  assert.equal(await page.locator('.murvik-tour-spotlight').count(),1,`visible spotlight ${i}`);
  if(tourStops[i].event)assert.equal(await page.locator('input[aria-label="Дата операции"]').inputValue(),String(campaignEvents.findIndex(e=>e.id===tourStops[i].event)));
 }
 assert.deepEqual([...poses].sort(),['attentive','rest','sit','stand'],'four natural static poses');
 // Cross-stop navigation must keep the preceding thought, rather than jump to its beginning.
 await page.locator('#murvik-tour-stop').selectOption('1');
 await page.getByRole('button',{name:'Предыдущий кадр',exact:true}).click();
 assert.equal(await page.locator('#murvik-tour-stop').inputValue(),'0');
 assert.equal(await page.locator('.murvik-comic-bubble p').textContent(),comicFrames(tourStops[0].text).at(-1));
 await page.getByRole('button',{name:'Следующий кадр',exact:true}).click();
 assert.equal(await page.locator('#murvik-tour-stop').inputValue(),'1');
 await page.locator('#murvik-tour-stop').selectOption('12');
 await page.waitForTimeout(600);
 assert.ok(await page.locator('.murvik-tour-spotlight').evaluate(el=>el.classList.contains('is-dimmed')&&getComputedStyle(el).boxShadow!=='none'));
 await page.screenshot({path:'artifacts/murvik-tour-desktop.png'});
 await page.getByRole('button',{name:'Фокус: вкл.'}).click();
 assert.equal(await page.locator('.murvik-tour-spotlight.is-dimmed').count(),0);
 await page.getByRole('button',{name:'Фокус: выкл.'}).click();
 for(const [width,height] of [[390,844],[320,568],[844,390]]){
  await page.setViewportSize({width,height});
  await page.getByRole('button',{name:'Показать на сайте'}).click();
  await page.waitForTimeout(200);
  const layout=await page.locator('.murvik-tour').evaluate(el=>{const r=el.getBoundingClientRect();return {inside:r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight,overflow:el.scrollHeight>el.clientHeight+1,body:document.documentElement.scrollWidth>innerWidth};});
  assert.deepEqual(layout,{inside:true,overflow:false,body:false},`layout ${width}`);
  for(let i=0;i<tourStops.length;i++){
   await page.locator('#murvik-tour-stop').selectOption(String(i));
   for(let f=0;f<comicFrames(tourStops[i].text).length;f++){
    await page.getByRole('button',{name:`Кадр ${f+1}`,exact:true}).click();
    await page.waitForTimeout(40);
    await page.locator('.murvik-tour-spotlight').waitFor({state:'attached',timeout:5000});
    assert.equal(await page.locator('.murvik-tour-spotlight').count(),1,`responsive focus ${width}/${i}/${f}`);
    assert.equal(await page.locator('.murvik-tour-notice').count(),0,'no unavailable materials');
    assert.ok(await page.locator('.murvik-tour').evaluate(el=>{const r=el.getBoundingClientRect();return r.left>=0&&r.top>=0&&r.right<=innerWidth&&r.bottom<=innerHeight}),`responsive route ${width}/${i}/${f}`);
   }
  }
  await page.screenshot({path:`artifacts/murvik-tour-${width}.png`});
 }
 await page.setViewportSize({width:1440,height:1000});
 await page.emulateMedia({reducedMotion:'no-preference'});
 for(let i=0;i<tourStops.length;i++){
  await page.locator('#murvik-tour-stop').selectOption(String(i));
  await page.waitForTimeout(1100);
  await page.locator('.murvik-tour-spotlight').waitFor({state:'attached',timeout:5000});
  assert.equal(await page.locator('.murvik-tour-spotlight').count(),1,`smooth route ${i}`);
  if(tourStops[i].event)assert.equal(await page.locator('input[aria-label="Дата операции"]').inputValue(),String(campaignEvents.findIndex(e=>e.id===tourStops[i].event)),`smooth date ${i}`);
 }
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.clock.install();
 await page.locator('#murvik-tour-stop').selectOption('0');
 await page.clock.fastForward(120000);
 assert.equal(await page.locator('#murvik-tour-stop').inputValue(),'0','pause prevents advance');
 await page.getByRole('button',{name:'▶ Продолжить',exact:true}).click();
 await page.clock.fastForward(120000);
 assert.equal(await page.locator('#murvik-tour-stop').inputValue(),'0','first bubble stays in chapter');
 assert.ok((await page.locator('.murvik-comic-caption').textContent()).includes('КАДР 2'));
 for(let f=1;f<comicFrames(tourStops[0].text).length;f++)await page.clock.fastForward(120000);
 assert.equal(await page.locator('#murvik-tour-stop').inputValue(),'1','automatic chapter advance');
 await page.getByRole('button',{name:'Ⅱ Пауза',exact:true}).click();
 await page.getByRole('button',{name:'Свернуть рассказ'}).click();
 assert.equal(await page.locator('.murvik-tour-copy').count(),0);
 await page.getByRole('button',{name:'Развернуть рассказ'}).click();
 await page.keyboard.press('Escape');
 assert.equal(await page.locator('.murvik-tour').count(),0);
 assert.equal(await page.locator('.murvik-tour-target').count(),0);
 assert.equal(await page.locator('.murvik-tour-spotlight').count(),0);
 await page.getByRole('button',{name:'Мурвiк — открыть помощника'}).click();
 await page.getByRole('button',{name:'Начать викторину'}).click();
 assert.ok(await page.locator('.murvik-options button').count()>=3);

 await page.getByRole('button',{name:'Закрыть помощника'}).click();
 assert.equal(await page.getByRole('button',{name:/Озвучивание/}).count(),0);
 await page.getByRole('button',{name:'Мурвiк — открыть помощника'}).click();
 await page.getByRole('button',{name:'Экскурсия',exact:true}).click();
 let normalDuration;
 for(const speed of [1,2,3,1]){
  await page.getByRole('button',{name:`Скорость экскурсии ×${speed}. Переключить скорость`,exact:true}).waitFor();
  const duration=await page.locator('.murvik-comic-frames button[aria-current] i').evaluate(el=>parseFloat(el.style.animationDuration));
  if(!normalDuration)normalDuration=duration;
  assert.ok(Math.abs(duration-normalDuration/speed)<1,'speed changes actual reading interval');
  await page.getByRole('button',{name:`Скорость экскурсии ×${speed}. Переключить скорость`,exact:true}).click();
 }
 // Traverse every automatic transition through the final thank-you and restart.
 await page.locator('#murvik-tour-stop').selectOption('0');
 for(let i=0;i<tourStops.length;i++)for(let f=0;f<comicFrames(tourStops[i].text).length;f++){
  assert.equal(await page.locator('#murvik-tour-stop').inputValue(),String(i),`automatic stop ${i}/${f}`);
  assert.equal(await page.locator('.murvik-comic-bubble p').textContent(),comicFrames(tourStops[i].text)[f]);
  await page.clock.fastForward(120000);
 }
 await page.getByRole('button',{name:'Повторить маршрут',exact:true}).click();
 assert.equal(await page.locator('#murvik-tour-stop').inputValue(),'0');
 await page.getByRole('button',{name:'Завершить экскурсию',exact:true}).click();
 assert.deepEqual(errors,[]);
 console.log('MURVIK COMIC TOUR PASS: 68 authored bubbles in 17 stops, full route at 4 viewport sizes, smooth route, full automatic route and restart, backward boundaries, dimming toggle, map dates, automatic frames/chapters, pause, speed cycling, four natural stationary poses, cleanup, responsive layouts, quiz preserved.');
} catch(error){const p=browser.contexts()[0]?.pages()[0];if(p)await p.screenshot({path:'artifacts/murvik-tour-failure.png'});throw error;} finally {await browser.close();}
