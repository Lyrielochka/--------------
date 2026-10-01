import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
await mkdir('artifacts',{recursive:true});
const browser=await chromium.launch({headless:true,channel:'chrome'});const errors=[];
try {
 for(const [name,width,height] of [['desktop',1440,1000],['mobile',390,844]]) {
  const page=await browser.newPage({viewport:{width,height}});page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});await page.waitForTimeout(3800);
  const shot=async label=>{assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,`${name} overflow ${label}`);await page.screenshot({path:`artifacts/${name}-${label}-v4.png`})};
  const visit=async id=>{await page.locator(id).evaluate(el=>el.scrollIntoView({behavior:'instant'}));await page.waitForTimeout(1000)};
  await shot('intro');
  await page.getByRole('button',{name:'НАЧАТЬ ИССЛЕДОВАНИЕ',exact:true}).click();await page.waitForTimeout(2000);assert.ok(await page.locator('#map').evaluate(el=>Math.abs(el.getBoundingClientRect().top)<180));
  await page.locator('#map').getByRole('button',{name:'Минск',exact:true}).click();await page.waitForTimeout(1500);assert.equal(await page.locator('.cinematic-focus').count(),1);await shot('map-focus');
  await page.getByRole('button',{name:'Развернуть карту',exact:true}).click();await page.waitForTimeout(600);await shot('map-fullscreen');await page.keyboard.press('Escape');
  await visit('#operation-scroll');await page.locator('.operation-rail').getByRole('button',{name:'Минск',exact:true}).click();await page.waitForTimeout(1300);assert.match(await page.locator('.operation-copy').innerText(),/03.07/);await shot('scroll');
  await visit('#summer');await shot('depth');
  await visit('#cities');
  for(let i=0;i<5;i++){await page.locator('.stage-tabs button').nth(i).click();await page.waitForTimeout(700);assert.equal((await page.locator('.journey-copy h2').innerText()).toLowerCase(),['витебск','орша','могилёв','бобруйск','минск'][i]);await shot('city-'+i)}
  await page.getByRole('button',{name:'Отметить этап Минск',exact:true}).click();assert.equal(await page.getByRole('button',{name:'Отметить этап Минск',exact:true}).getAttribute('aria-pressed'),'true');
  await page.getByRole('button',{name:'Открыть маршруты исследования',exact:true}).click();await page.waitForTimeout(350);await shot('routes');
  await page.getByRole('button',{name:'Мои отметки',exact:true}).click();assert.match(await page.locator('.notebook-room').innerText(),/Минск/);
  await page.getByRole('button',{name:'Сопоставление',exact:true}).click();await page.getByLabel('Правое направление',{exact:true}).selectOption('4');await shot('compare');
  await page.keyboard.press('Escape');await page.getByRole('dialog').waitFor({state:'detached'});assert.equal(await page.getByRole('dialog').count(),0);
  await visit('#aviators');await shot('aviators');assert.equal(await page.locator('.aviator-card').count(),4);await page.locator('.aviator-card').nth(1).click();assert.equal(await page.locator('.aviator-card').nth(1).getAttribute('aria-pressed'),'true');
  await visit('#connections');await page.locator('.network-node').filter({hasText:'К. К. Рокоссовский'}).click();assert.match(await page.locator('.network-detail').innerText(),/Рокоссовский/);await shot('network');
  await visit('#then-now');await page.getByLabel('Граница эпох',{exact:true}).fill('78');assert.equal(await page.locator('.era-modern').count(),1);await shot('rift');
  await visit('#hero');await page.getByRole('button',{name:'90 СЕКУНД / ХОД ОПЕРАЦИИ',exact:true}).click();await page.waitForTimeout(1400);await page.getByRole('button',{name:'Пауза фильма',exact:true}).click();const paused=await page.getByLabel('Время фильма',{exact:true}).inputValue();await page.waitForTimeout(600);assert.equal(await page.getByLabel('Время фильма',{exact:true}).inputValue(),paused);
  await page.getByLabel('Время фильма',{exact:true}).fill('70');await page.waitForTimeout(600);assert.match(await page.locator('.film-copy').innerText(),/Минск/);await shot('film');
  await page.getByRole('button',{name:'ЛЕНТА СОБЫТИЙ',exact:true}).click();assert.equal(await page.locator('.film-transcript button').count(),8);
  await page.getByLabel('Время фильма',{exact:true}).fill('90');assert.equal(await page.locator('.film-end').count(),1);await page.getByRole('button',{name:'СМОТРЕТЬ СНОВА',exact:true}).click();assert.ok(Number(await page.getByLabel('Время фильма',{exact:true}).inputValue())<2);
  await page.keyboard.press('Escape');await page.waitForTimeout(350);assert.equal(await page.getByRole('dialog').count(),0);
  await page.reload({waitUntil:'networkidle'});assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('bagration-route-v1'))),[4]);
  await page.close();console.log(`${name}: cinematic intro, atlas, scroll, 2.5D, five cities, notebook, comparison, aviators, network, rift, documentary OK`);
 }
 const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
 assert.equal(await page.locator('.operation-pin').evaluate(el=>getComputedStyle(el).position),'relative');await page.locator('#operation-scroll').scrollIntoViewIfNeeded();await page.locator('.operation-rail button').nth(6).click();await page.waitForFunction(()=>document.querySelector('.operation-copy')?.textContent.includes('03.07'));assert.match(await page.locator('.operation-copy').innerText(),/03.07/);
 assert.deepEqual(errors,[]);console.log('CINEMA_CHECK_OK / reduced motion and runtime errors checked');
} finally {await browser.close()}
