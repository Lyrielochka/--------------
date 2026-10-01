import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {axes,routeArrow} from '../src/bagrationMapData.js';

const earlyArrow=routeArrow(axes[0].points,.12).match(/-?\d+(?:\.\d+)?/g).map(Number);
assert.ok(earlyArrow[0]<earlyArrow[2],'Early westward arrow must point west');

const browser=await chromium.launch({headless:true,channel:'chrome'});
try{
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
  const atlas=page.locator('#partisans');
  assert.ok(await atlas.evaluate(node=>node.getBoundingClientRect().height)<=901);
  await page.evaluate(()=>scrollTo(0,document.querySelector('#partisans').offsetTop));
  await page.screenshot({path:'artifacts/partisans-compact.png'});
  assert.ok(await page.locator('#map').evaluate(node=>node.getBoundingClientRect().height)>3000);
  await page.evaluate(()=>scrollTo(0,document.querySelector('#map').offsetTop+innerHeight));
  await page.screenshot({path:'artifacts/map-compact.png'});
  assert.equal(await page.locator('#map .bmap-german-territory').count(),1);
  assert.equal(await page.locator('#map .bmap-soviet-territory').count(),1);
  const before=await page.locator('#map .bmap-soviet-territory').getAttribute('d');
  await page.locator('#map input[aria-label="Дата операции"]').fill('4');
  await page.waitForTimeout(1200);
  assert.ok(await page.locator('#map .bmap-route-head').count()>=5);
  assert.equal(await page.locator('#map .bmap-relief').count(),1);
  assert.equal(await page.locator('#map .map-side-label').count(),2);
  assert.ok(await page.locator('#map .map-side-german').isVisible());
  await page.screenshot({path:'artifacts/map-rts-mid.png'});
  await page.locator('#map input[aria-label="Дата операции"]').fill('8');
  await page.waitForTimeout(1200);
  const after=await page.locator('#map .bmap-soviet-territory').getAttribute('d');
  assert.notEqual(after,before);
  await page.screenshot({path:'artifacts/map-advance-compact.png'});
  const mobile=await browser.newPage({viewport:{width:390,height:844}});
  await mobile.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
  assert.ok(await mobile.evaluate(()=>document.documentElement.scrollWidth-innerWidth)<=1);
  assert.ok(await mobile.locator('#partisans').evaluate(node=>node.getBoundingClientRect().height)<=845);
  await mobile.locator('#partisans').scrollIntoViewIfNeeded();
  await mobile.screenshot({path:'artifacts/partisans-mobile-compact.png'});
  await mobile.evaluate(()=>scrollTo(0,document.querySelector('#map').offsetTop+innerHeight));
  await mobile.locator('#map input[aria-label="Дата операции"]').fill('4');
  await mobile.waitForTimeout(1200);
  assert.ok(await mobile.locator('#map .map-front-key').isVisible());
  const keyRect=await mobile.locator('#map .map-front-key').boundingBox();
  assert.ok(keyRect.y>=100&&keyRect.y<500,`Mobile front legend is outside the map viewport: ${keyRect.y}`);
  await mobile.screenshot({path:'artifacts/map-rts-mobile.png'});
  console.log('Partisan atlas fits viewport; campaign map keeps scroll progression and advancing territory fill.');
}finally{await browser.close()}
