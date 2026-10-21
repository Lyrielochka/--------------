import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,channel:'chrome'});
const errors=[];
try{
 for(const [width,height,reducedMotion] of [[1920,1080,'no-preference'],[390,844,'no-preference'],[320,740,'reduce']]){
  const page=await browser.newPage({viewport:{width,height},reducedMotion});
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(process.env.BASE_URL||'http://127.0.0.1:5174/',{waitUntil:'networkidle'});
  await page.waitForFunction(()=>!document.getElementById('operation-loader')||getComputedStyle(document.getElementById('operation-loader')).visibility==='hidden'||getComputedStyle(document.getElementById('operation-loader')).display==='none'||document.getElementById('operation-loader').classList.contains('is-hidden'));
  await page.evaluate(()=>document.fonts.ready);
  await page.waitForTimeout(2200);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'horizontal overflow');
  assert.equal(await page.locator('.intro-sparks i').count(),46);
  const styles=()=>page.evaluate(()=>Object.fromEntries(['.intro-smoke i','.intro-warm-glow','.intro-sparks i'].map(selector=>{const s=getComputedStyle(document.querySelector(selector));return [selector,{name:s.animationName,transform:s.transform,play:s.animationPlayState}]})));
  const before=await styles();
  if(reducedMotion==='reduce'){
   assert.ok(Object.values(before).every(s=>s.name==='none'));
   assert.equal(await page.locator('.intro-sparks').evaluate(e=>getComputedStyle(e).display),'none');
  }else{
   await page.waitForTimeout(700);
   const after=await styles();
   assert.notEqual(before['.intro-smoke i'].transform,after['.intro-smoke i'].transform,'smoke moves');
   assert.notEqual(before['.intro-warm-glow'].transform,after['.intro-warm-glow'].transform,'light changes');
   await page.evaluate(()=>window.scrollTo({top:document.querySelector('#hero').offsetHeight+200,behavior:'instant'}));
   await page.waitForTimeout(250);
   assert.equal(await page.locator('#hero').getAttribute('data-atmosphere-active'),'false');
   assert.ok(Object.values(await styles()).every(s=>s.play==='paused'));
   await page.locator('#hero').evaluate(e=>e.scrollIntoView({behavior:'instant'}));
   await page.waitForTimeout(250);
   assert.equal(await page.locator('#hero').getAttribute('data-atmosphere-active'),'true');
  }
  await page.screenshot({path:`artifacts/hero-atmosphere-${width}.png`});
  console.log(`HERO_ATMOSPHERE: PASS ${width}x${height} ${reducedMotion}`);
  await page.close();
 }
 assert.deepEqual(errors,[]);
}finally{await browser.close()}
