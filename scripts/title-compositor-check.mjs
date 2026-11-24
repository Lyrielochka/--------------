import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const b=await chromium.launch({channel:'chrome',headless:true});
try{
 const p=await b.newPage({viewport:{width:1440,height:900}});
 await p.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(2500);
 assert.equal(await p.locator('.title-shot img').count(),6);
 assert.ok(await p.locator('.title-shot img').evaluateAll(imgs=>imgs.every(i=>i.complete&&i.naturalWidth)));
 assert.notEqual(await p.locator('.title-window').evaluate(el=>getComputedStyle(el).maskImage),'none');
 await p.locator('#hero').screenshot({path:'artifacts/title-compositor-1440.png'});
 // Isolate the title to check whether its motion causes frame-by-frame painting.
 await p.evaluate(()=>{document.getAnimations().forEach(a=>{if(!a.effect?.target?.closest?.('.living-title'))a.pause()})});
 const cdp=await p.context().newCDPSession(p);const events=[];
 cdp.on('Tracing.dataCollected',({value})=>events.push(...value));
 await cdp.send('Tracing.start',{categories:'devtools.timeline',transferMode:'ReportEvents'});
 await p.waitForTimeout(2500);
 const done=new Promise(resolve=>cdp.once('Tracing.tracingComplete',resolve));await cdp.send('Tracing.end');await done;
 const paints=events.filter(e=>e.name==='Paint');console.log('Title-only paint events in 2.5 seconds:',paints.length);
 const metrics=await p.locator('.living-title').evaluate(title=>{
 const image=title.querySelector('img'),mask=title.querySelector('.title-window');const box=mask.getBoundingClientRect();
 const animations=title.getAnimations({subtree:true});animations.forEach(a=>{a.pause();a.currentTime=0});const start=getComputedStyle(image).transform;
 animations.forEach(a=>a.currentTime=30000);const end=getComputedStyle(image).transform;
 return{start,end,maskStable:JSON.stringify(box)===JSON.stringify(mask.getBoundingClientRect()),filter:getComputedStyle(title).filter};
 });assert.notEqual(metrics.start,metrics.end);assert.equal(metrics.maskStable,true);assert.equal(metrics.filter,'none');
 for(const width of [390,320]){await p.setViewportSize({width,height:900});const box=await p.locator('.living-title').boundingBox();assert.ok(box.x+box.width<=width);await p.locator('#hero').screenshot({path:`artifacts/title-compositor-${width}.png`})}
 await p.emulateMedia({reducedMotion:'reduce'});assert.equal(await p.locator('.title-shot img').first().evaluate(el=>getComputedStyle(el).animationName),'none');
 console.log('PASS: fixed mask, transform animation, six loaded images, desktop/mobile fit, reduced motion.',metrics);
}finally{await b.close()}
