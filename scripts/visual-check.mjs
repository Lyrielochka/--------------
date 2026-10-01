import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const browser = await chromium.launch({
  headless: true,
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
});
const errors = [];
await mkdir('artifacts', { recursive: true });

for (const viewport of [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'mobile', width: 390, height: 844 },
]) {
  const page = await browser.newPage({ viewport });
  page.on('console', message => message.type() === 'error' && errors.push(`${viewport.name}: ${message.text()}`));
  page.on('pageerror', error => errors.push(`${viewport.name}: ${error.message}`));
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
  await page.screenshot({ path: `artifacts/${viewport.name}-hero.png` });
  await page.locator('#prehistory').scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `artifacts/${viewport.name}-prehistory.png` });
  await page.locator('#map').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `artifacts/${viewport.name}-map.png` });
  await page.locator('.map-point').nth(4).click({ force: true });
  await page.locator('.map-toolbar button').last().click();
  if (!(await page.locator('.layers-panel').isVisible())) errors.push(`${viewport.name}: layers panel did not open`);
  await page.locator('.layers-panel header button').click();
  await page.locator('#strategy').scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `artifacts/${viewport.name}-strategy.png` });
  await page.locator('#events').scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);
  await page.locator('.event-card').nth(1).click({ force: true });
  await page.locator('#archive').scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);
  await page.locator('.archive-flip').first().click();
  if (!(await page.locator('.archive-card').first().evaluate(el => el.classList.contains('is-flipped')))) errors.push(`${viewport.name}: archive card did not flip`);
  await page.locator('.archive-flip').first().click({ force: true });
  await page.locator('.archive-card').first().click();
  if (!(await page.locator('.modal').isVisible())) errors.push(`${viewport.name}: archive modal did not open`);
  await page.waitForTimeout(700);
  await page.screenshot({ path: `artifacts/${viewport.name}-modal.png` });
  await page.locator('.modal .close').click();
  await page.locator('#partisans').scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `artifacts/${viewport.name}-partisans.png` });
  await page.locator('#memory').scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await page.locator('.era-switch button').nth(1).click();
  await page.screenshot({ path: `artifacts/${viewport.name}-memory.png` });
  await page.close();
}

await browser.close();
console.log(errors.length ? errors.join('\n') : 'VISUAL_CHECK_OK');
