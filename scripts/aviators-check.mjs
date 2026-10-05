import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser = await chromium.launch({headless:true,channel:'chrome'});
const page = await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
const errors=[];
page.on('pageerror',e=>errors.push(e.message));
try {
  await page.goto(process.env.BASE_URL || 'http://127.0.0.1:5173/',{waitUntil:'networkidle'});
  const section=page.locator('#aviators');
  await section.scrollIntoViewIfNeeded();
  const exhibits=section.locator('.sky-exhibit');
  assert.equal(await exhibits.count(),4);
  assert.equal(await section.locator('.sky-portrait').count(),4);
  assert.equal(await section.locator('.sky-placeholder').count(),4);
  for(let i=0;i<4;i++) await exhibits.nth(i).scrollIntoViewIfNeeded();
  await section.screenshot({path:'artifacts/desktop-aviators-showcase.png'});
  for(let i=0;i<4;i++) {
    const toggle=exhibits.nth(i).locator('.sky-toggle');
    await toggle.click();
    assert.equal(await toggle.getAttribute('aria-expanded'),'true');
    assert.equal(await section.locator('.is-open').count(),1);
    assert.equal(await exhibits.nth(i).locator('.sky-story').getAttribute('aria-hidden'),'false');
  }
  await page.keyboard.press('Escape');
  assert.equal(await section.locator('.is-open').count(),0);
  await exhibits.nth(2).locator('.sky-toggle').focus();
  await page.keyboard.press('Enter');
  assert.ok((await exhibits.nth(2).locator('.sky-story').innerText()).includes('125-й'));
  await section.screenshot({path:'artifacts/desktop-aviators-active.png'});
  for(const width of [768,390,320]) {
    await page.setViewportSize({width,height:844});
    assert.ok(await section.evaluate(el=>el.scrollWidth<=el.clientWidth),`Section overflow at ${width}`);
    assert.ok(await section.locator('.sky-summary').first().evaluate(el=>parseFloat(getComputedStyle(el).fontSize)>=16));
    if(width===390) await section.screenshot({path:'artifacts/mobile-aviators-active.png'});
  }
  await exhibits.nth(2).locator('.sky-toggle').click();
  assert.equal(await section.locator('.is-open').count(),0);
  // A served image must replace its placeholder automatically on the next load.
  await page.route('**/images/aviators/gelman.jpg', route=>route.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400"><rect width="300" height="400" fill="#223344"/></svg>'}));
  await page.reload({waitUntil:'networkidle'});
  await section.scrollIntoViewIfNeeded();
  await page.locator('.sky-exhibit-0 .has-photo').waitFor();
  assert.equal(await page.locator('.sky-exhibit-0 .sky-placeholder').count(),0);
  assert.deepEqual(errors,[]);
  console.log('AVIATORS_CHECK_OK: four portraits, inline stories, keyboard, responsive layout, image fallback');
} finally { await browser.close(); }
