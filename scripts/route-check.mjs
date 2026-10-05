import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const errors = [];
const expected = ['hero','intro','prehistory','summer','strategy','commanders','partisans','opening','map','connections','technology','aviators','archive','results','significance','replay','then-now','memory'];
try {
  for (const [name,width,height] of [['desktop',1440,900]]) {
    const page = await browser.newPage({ viewport: { width,height }, reducedMotion:'reduce' });
    page.on('pageerror', error => errors.push(`${name}: ${error.message}`));
    await page.goto(process.env.BASE_URL || 'http://127.0.0.1:5173/', { waitUntil:'networkidle' });
    const order = await page.locator('section[id]').evaluateAll(nodes => nodes.map(node => node.id));
    assert.deepEqual(order,expected);
    const badLinks = await page.locator('a[href^="#"]').evaluateAll(links => links.map(a => a.getAttribute('href')).filter(href => href.length > 1 && !document.getElementById(href.slice(1))));
    assert.deepEqual(badLinks,[]);
    await page.screenshot({path:`artifacts/${name}-route-hero.png`});
    await page.getByRole('button',{name:/НАЧАТЬ ИССЛЕДОВАНИЕ/}).click();
    await page.waitForTimeout(900);
    assert.equal(await page.evaluate(() => location.hash === '#intro' || Math.abs(document.getElementById('intro').getBoundingClientRect().top) < 150),true);
    await page.screenshot({path:`artifacts/${name}-route-intro.png`});
    await page.locator('#opening').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => document.querySelector('.route-indicator .active')?.getAttribute('href') === '#map');
    await page.screenshot({path:`artifacts/${name}-route-opening.png`});
    await page.locator('#strategy').scrollIntoViewIfNeeded();
    await page.locator('#strategy').evaluate(el=>el.scrollIntoView({behavior:'instant',block:'start'}));
    await page.screenshot({path:`artifacts/${name}-route-strategy.png`});
    await page.locator('#strategy .fd-tabs button').nth(1).click();
    await page.locator('#strategy').getByRole('button',{name:/К ходу операции/}).click();
    assert.equal(await page.getByLabel('Дата операции',{exact:true}).inputValue(),'3');
    await page.locator('#map').scrollIntoViewIfNeeded();
    await page.locator('#map').getByRole('button',{name:'Минск',exact:true}).click();
    await page.locator('#map').evaluate(el=>el.scrollIntoView({behavior:'instant',block:'start'}));
    await page.screenshot({path:`artifacts/${name}-route-map.png`});
    assert.equal(await page.getByLabel('Дата операции',{exact:true}).inputValue(),'6');
    assert.equal(await page.getByLabel('Дата операции',{exact:true}).inputValue(),'6');
    await page.locator('#aviators').scrollIntoViewIfNeeded();
    await page.locator('#aviators').evaluate(el=>el.scrollIntoView({behavior:'instant',block:'start'}));
    await page.screenshot({path:`artifacts/${name}-route-aviators.png`});
    await page.locator('#aviators .aviator-card').nth(2).click();
    assert.equal(await page.locator('#aviators .aviator-card[aria-pressed="true"]').count(),1);
    await page.locator('#results').evaluate(el=>el.scrollIntoView({behavior:'instant',block:'start'}));
    await page.screenshot({path:`artifacts/${name}-route-results.png`});
    await page.locator('#replay').scrollIntoViewIfNeeded();
    await page.getByRole('button',{name:'СМОТРЕТЬ ПОВТОРЕНИЕ'}).click();
    assert.equal(await page.getByRole('dialog',{name:'90 секунд: операция Багратион'}).count(),1);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    assert.equal(await page.getByRole('dialog').count(),0);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    assert.ok(overflow <= 1,`${name}: horizontal overflow ${overflow}px`);
    await page.screenshot({path:`artifacts/${name}-route-replay.png`});
    console.log(`${name}: order, links, introduction, map, replay and width OK`);
    await page.close();
  }
  assert.deepEqual(errors,[]);
} finally {
  await browser.close();
}
