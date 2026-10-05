import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
await mkdir('artifacts', {recursive:true});
const browser=await chromium.launch({headless:true,channel:'chrome'});
const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
const errors=[];
page.on('pageerror',error=>errors.push(error.message));
try {
  await page.goto(process.env.BASE_URL || 'http://127.0.0.1:5173/',{waitUntil:'networkidle'});
  await page.evaluate(()=>document.fonts.ready);
  const section=page.locator('#strategy');
  await section.scrollIntoViewIfNeeded();
  assert.equal(await section.locator('.bagration-map').count(),1);
  const tabs=section.getByRole('tab');
  const fronts=['baltic','third','second','first'];
  const expectedRoutes=[1,2,1,2];
  for(let i=0;i<4;i++) {
    await tabs.nth(i).click();
    assert.equal(await section.getByRole('tabpanel').getAttribute('data-front'),fronts[i]);
    assert.equal(await tabs.nth(i).getAttribute('aria-selected'),'true');
    assert.equal(await section.locator('.bmap-route-active').count(),expectedRoutes[i]);
    assert.ok((await section.locator('.fd-task p').innerText()).length>40);
    assert.ok(await section.locator('.fd-armies li').count()>=4);
    assert.equal(await section.locator('.fd-actions li').count(),3);
    for(const image of await section.locator('.fd-metric img').all()) {
      await image.scrollIntoViewIfNeeded();
      await image.evaluate(el=>el.decode());
      assert.ok(await image.evaluate(el=>el.naturalWidth>0));
    }
  }
  await tabs.nth(3).focus();
  await page.keyboard.press('Home');
  assert.equal(await tabs.nth(0).getAttribute('aria-selected'),'true');
  await page.keyboard.press('ArrowRight');
  assert.equal(await tabs.nth(1).getAttribute('aria-selected'),'true');
  await tabs.nth(0).click();
  await section.screenshot({path:'artifacts/fronts-desktop.png',animations:'disabled'});
  await section.locator('.fd-map-foot button').click();
  await page.waitForFunction(()=>location.hash==='#map' || document.getElementById('map').getBoundingClientRect().top<innerHeight);
  for(const width of [1024,768,390,320]) {
    await page.setViewportSize({width,height:844});
    await section.scrollIntoViewIfNeeded();
    assert.ok(await section.evaluate(el=>el.scrollWidth<=el.clientWidth),`Section overflow at ${width}`);
    for(let i=0;i<4;i++) {
      await tabs.nth(i).click();
      const bounds=await section.locator('.fd-metric>strong').evaluateAll(els=>els.every(el=>el.scrollWidth<=el.clientWidth));
      assert.ok(bounds,`Metric overflow: ${width}, front ${i}`);
    }
    if(width===390) {
      await tabs.nth(2).click();
      await section.screenshot({path:'artifacts/fronts-mobile.png',animations:'disabled'});
    }
  }
  assert.deepEqual(errors,[]);
  console.log('FRONTS_CHECK_OK: all four dossiers, preserved map routes, navigation, keyboard, images and responsive widths');
} finally { await browser.close(); }
