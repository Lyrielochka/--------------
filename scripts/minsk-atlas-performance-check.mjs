import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,channel:'chrome'});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 await page.goto('http://127.0.0.1:5180/',{waitUntil:'networkidle'});
 await page.evaluate(()=>scrollTo(0,document.querySelector('#map').offsetTop+innerHeight));
 await page.getByRole('button',{name:'Приблизить Минскую область'}).focus();await page.keyboard.press('Enter');
 await page.locator('.battle-event-list>button').first().waitFor({state:'attached'});await page.waitForTimeout(900);
 const canvas=page.locator('.region-focused');const box=await canvas.boundingBox();
 await canvas.scrollIntoViewIfNeeded();
 const origin=await page.evaluate(({x,y,width,height})=>{
  for(let fy=.25;fy<.65;fy+=.08)for(let fx=.15;fx<.5;fx+=.08){const px=x+width*fx,py=y+height*fy;const el=document.elementFromPoint(px,py);if(el&&!el.closest('button,a,input,[data-map-ui]'))return {x:px,y:py}}
  throw new Error('No open map surface');
 },box);
 const before=await page.locator('.map-world').evaluate(el=>getComputedStyle(el).transform);
 await page.evaluate(()=>{
  window.atlasProfile={mutations:0,frames:[],longTasks:[]};
  window.atlasObserver=new MutationObserver(records=>window.atlasProfile.mutations+=records.length);
  window.atlasObserver.observe(document.querySelector('.battle-panel'),{subtree:true,childList:true,attributes:true,characterData:true});
  window.longObserver=new PerformanceObserver(list=>window.atlasProfile.longTasks.push(...list.getEntries().map(e=>e.duration)));window.longObserver.observe({type:'longtask'});
  let last=performance.now();window.profileRunning=true;
  function sample(now){window.atlasProfile.frames.push(now-last);last=now;if(window.profileRunning)requestAnimationFrame(sample)}requestAnimationFrame(sample);
 });
 await page.mouse.move(origin.x,origin.y);await page.mouse.down();
 await page.mouse.move(origin.x+180,origin.y+60,{steps:50});await page.mouse.up();
 const after=await page.locator('.map-world').evaluate(el=>getComputedStyle(el).transform);assert.notEqual(before,after,'Pan moves camera');
 const profile=await page.evaluate(()=>{window.profileRunning=false;window.atlasObserver.disconnect();window.longObserver.disconnect();return window.atlasProfile});
 assert.equal(profile.mutations,0,'Panning does not rebuild event panel');
 const sorted=profile.frames.slice(2).sort((a,b)=>a-b);const p95=sorted[Math.floor(sorted.length*.95)];
 await page.getByRole('button',{name:'Увеличить масштаб области',exact:true}).click();await page.waitForTimeout(650);
 assert.equal(await page.locator('.region-camera-tools output').innerText(),'4.0×');
 await page.getByRole('button',{name:'Сбросить вид области',exact:true}).click();await page.waitForTimeout(650);
 assert.equal(await page.locator('.region-camera-tools output').innerText(),'3.2×');
 console.log(JSON.stringify({result:'ATLAS_PAN: PASS',panelMutations:profile.mutations,frames:sorted.length,p95FrameMs:Math.round(p95*10)/10,longTasks:profile.longTasks}));
}finally{await browser.close()}
