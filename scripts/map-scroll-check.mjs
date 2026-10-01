import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const browser = await chromium.launch({ headless: true, channel: 'chrome' });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(process.env.BASE_URL || 'http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
  const map = page.locator('#map');
  await map.evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'start' }));
  const stage = () => page.getByLabel('Дата операции', { exact: true }).inputValue().then(Number);
  const first = await stage();
  await page.evaluate(() => scrollBy(0, innerHeight * 2));
  await page.waitForTimeout(100);
  const middle = await stage();
  await page.evaluate(() => scrollBy(0, innerHeight * 2));
  await page.waitForTimeout(100);
  const last = await stage();
  assert.ok(first < middle && middle < last, `Scroll stages: ${first}, ${middle}, ${last}`);
  assert.equal(await map.locator('button.play, button.operation-play').count(), 0);
  console.log(`Map scroll stages: ${first} → ${middle} → ${last}`);
} finally {
  await browser.close();
}
