import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';

await mkdir('artifacts/story',{recursive:true});
const browser=await chromium.launch({headless:true,channel:'chrome'});
const errors=[];
try{
  for(const [name,width,height] of [['desktop',1440,1000],['mobile',390,844]]){
    const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
    await page.evaluate(()=>document.fonts.ready);
    assert.deepEqual(await page.locator('main section[id]').evaluateAll(els=>els.map(e=>e.id)),['intro','prehistory','strategy','commanders','technology','aviators','partisans','opening','map','results','archive','decision-lab']);
    assert.deepEqual(await page.locator('a[href^="#"]').evaluateAll(els=>els.map(e=>e.hash).filter(h=>h.length>1&&!document.getElementById(h.slice(1)))),[]);
    for(const id of ['intro','strategy','commanders','technology','aviators','results','archive']){
      await page.locator('#'+id).evaluate(el=>el.scrollIntoView({behavior:'instant',block:'start'}));
      await page.waitForTimeout(180);
      await page.screenshot({path:`artifacts/story/${name}-${id}.png`});
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${name} overflow at ${id}`);
    }
    await page.locator('#results .comparison-switch button').nth(1).click();
    await page.waitForTimeout(100);
    assert.match(await page.locator('.comparison-chart').innerText(),/5\s?200/);
    assert.equal(await page.locator('#results .comparison-switch button[aria-pressed="true"]').count(),1);
    await page.locator('#commanders .commander-tabs button').last().click();
    assert.match(await page.locator('.commander-info').innerText(),/Рокоссовский/);
    await page.locator('.sheet-open').first().click();
    assert.equal(await page.locator('.archive-reader').count(),1);
    await page.keyboard.press('Escape');
    await page.locator('.archive-reader').waitFor({state:'detached'});
    assert.equal(await page.locator('.archive-reader').count(),0);
    await page.close();
  }
  assert.deepEqual(errors,[]);
  console.log('PASS: desktop/mobile layout, chapter order, links, comparison controls, commanders, archive, no runtime errors.');
}finally{await browser.close();}
