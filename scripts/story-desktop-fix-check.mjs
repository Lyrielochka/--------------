import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
await mkdir('artifacts/story',{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
  const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
  await page.evaluate(()=>document.fonts.ready);
  const bounds=await page.locator('#partisans').evaluate(el=>{
    const map=el.querySelector('.partisan-map-window').getBoundingClientRect();
    const legend=el.querySelector('.partisan-legend').getBoundingClientRect();
    return {mapBottom:map.bottom,legendBottom:legend.bottom,end:el.getBoundingClientRect().bottom,next:el.nextElementSibling.getBoundingClientRect().top,mapHeight:map.height};
  });
  assert(bounds.mapHeight>=780);
  assert(bounds.mapBottom<=bounds.end&&bounds.legendBottom<=bounds.end&&bounds.end<=bounds.next);
  await page.locator('#partisans').evaluate(el=>window.scrollTo({top:el.offsetTop+el.offsetHeight-700,behavior:'instant'}));
  await page.screenshot({path:'artifacts/story/desktop-map-transition.png'});
  for(let i=1;i<4;i++){
    await page.locator('.comparison-switch button').nth(i).click();
    await page.waitForTimeout(200);
    assert.equal(await page.locator('.force-equipment img').count(),2);
    assert(await page.locator('.force-equipment img').evaluateAll(els=>els.every(el=>el.complete&&el.naturalWidth>0)));
  }
  await page.locator('.comparison-switch button').nth(1).click();
  await page.locator('.force-comparison').evaluate(el=>el.scrollIntoView({behavior:'instant',block:'center'}));
  await page.waitForTimeout(200);
  await page.screenshot({path:'artifacts/story/desktop-equipment-comparison.png'});
  assert.deepEqual(errors,[]);
  console.log('PASS: desktop map and legend fully contained, next chapter below map, all six equipment images loaded, no runtime errors.');
}finally{await browser.close();}
