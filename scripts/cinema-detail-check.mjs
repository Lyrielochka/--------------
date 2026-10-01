import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,channel:'chrome'});
try {
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
 await page.locator('#then-now').evaluate(el=>el.scrollIntoView({behavior:'instant'}));
 const r=await page.locator('.rift-window').boundingBox();
 await page.mouse.move(r.x+r.width*.6,r.y+200);await page.mouse.down();await page.mouse.move(r.x+r.width*.2,r.y+200,{steps:12});await page.mouse.up();
 assert.ok(Number(await page.getByLabel('Граница эпох',{exact:true}).inputValue())>75);
 await page.locator('#archive').evaluate(el=>el.scrollIntoView({behavior:'instant'}));await page.getByRole('button',{name:'Открыть: Перед наступлением',exact:true}).click();await page.waitForTimeout(700);
 const photo=await page.locator('.reader-object').boundingBox();await page.mouse.move(photo.x+photo.width/2,photo.y+photo.height/2);await page.mouse.down();await page.mouse.move(photo.x+photo.width/2+30,photo.y+photo.height/2+25,{steps:8});await page.mouse.up();await page.waitForTimeout(300);
 assert.notEqual(await page.locator('.reader-object').evaluate(el=>getComputedStyle(el).transform),'none');
 await page.getByRole('button',{name:'СБРОСИТЬ',exact:true}).click();await page.waitForTimeout(500);
 const reset=await page.locator('.reader-object').evaluate(el=>{const m=new DOMMatrixReadOnly(getComputedStyle(el).transform);return [m.m41,m.m42]});assert.deepEqual(reset,[0,0]);await page.keyboard.press('Escape');await page.getByRole('dialog').waitFor({state:'detached'});
 await page.getByRole('button',{name:'Открыть маршруты исследования'}).click();await page.waitForTimeout(300);await page.keyboard.press('Shift+Tab');assert.equal(await page.evaluate(()=>document.activeElement.closest('[role=dialog]')!==null),true);
 await page.getByRole('button',{name:/ПО СВЯЗЯМ/}).click();await page.waitForTimeout(2200);assert.ok(Math.abs(await page.locator('#connections').evaluate(el=>el.getBoundingClientRect().top))<200);
 for(const width of [768,1920]){await page.setViewportSize({width,height:1000});for(const id of ['hero','operation-scroll','map','summer','cities','connections','then-now']){await page.locator('#'+id).evaluate(el=>el.scrollIntoView({behavior:'instant'}));await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,`${width} overflow ${id}`)}}
 await page.setViewportSize({width:1440,height:1000});await page.locator('#operation-scroll').evaluate(el=>window.scrollTo({top:el.offsetTop+600,behavior:'instant'}));await page.waitForTimeout(500);
 const frames=await page.evaluate(()=>new Promise(resolve=>{const timings=[];let prev=performance.now(),start=prev;const tick=now=>{timings.push(now-prev);prev=now;window.scrollBy({top:5,behavior:'instant'});if(now-start<1600)requestAnimationFrame(tick);else{timings.shift();timings.sort((a,b)=>a-b);resolve({frames:timings.length,medianMs:timings[Math.floor(timings.length/2)],p95Ms:timings[Math.floor(timings.length*.95)]})}};requestAnimationFrame(tick)}));
 console.log('DETAIL_CHECK_OK: direct rift drag, archive pan/reset, focus trap, route navigation, tablet/wide layouts');console.log('Local headless scroll frame sample (not a device benchmark):',frames);
} finally {await browser.close()}
