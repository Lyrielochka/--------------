import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const browser=await chromium.launch({headless:true,channel:'chrome'});
const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
const errors=[];
page.on('pageerror',error=>errors.push(error.message));
try {
  await page.goto(process.env.BASE_URL||'http://127.0.0.1:5173/',{waitUntil:'networkidle'});
  assert.equal(await page.locator('#map .bagration-map image[href="/assets/belarus-base.lossless.webp"]').count(),1);
  await page.locator('#map').evaluate(el=>el.scrollIntoView({behavior:'instant',block:'start'}));
  assert.equal(await page.locator('#map [data-layer=rail]').count(),0);
  await page.locator('#map').getByRole('button',{name:'Слои карты'}).click();
  await page.getByLabel('Железные дороги',{exact:true}).check();
  await page.getByLabel('Партизаны',{exact:true}).check();
  assert.equal(await page.locator('#map [data-layer=rail] path').count(),2);
  assert.equal(await page.locator('#map [data-layer=partisans] ellipse').count(),2);
  await page.locator('#map .map-canvas').screenshot({path:'artifacts/desktop-map-partisans-accurate.png'});
  await page.getByLabel('Партизаны',{exact:true}).uncheck();
  await page.getByLabel('Железные дороги',{exact:true}).uncheck();
  assert.equal(await page.locator('#map [data-layer=rail]').count(),0);
  await page.locator('.layers-panel header button').click();
  await page.locator('.layers-panel').waitFor({state:'detached'});
  for(const [stage,place] of [[0,null],[2,'Витебск'],[3,'Орша'],[5,'Бобруйск'],[6,'Минск'],[8,null]]){
    await page.getByLabel('Дата операции',{exact:true}).fill(String(stage));
    assert.equal(await page.getByLabel('Дата операции',{exact:true}).inputValue(),String(stage));
    assert.equal(await page.locator('#map .bmap-current-front').count(),stage?1:0);
    if(place)await page.locator('#map .map-card .metric strong').getByText(place,{exact:true}).waitFor({state:'visible'});
    if([0,2,5,6].includes(stage)){
      await page.waitForTimeout(450);
      await page.locator('#map .map-canvas').screenshot({path:`artifacts/desktop-map-stage-${stage}.png`});
    }
  }
  await page.locator('#map').getByRole('button',{name:'Сравнение до и после'}).click();
  assert.equal(await page.locator('#map .compare-before .bagration-map image').count(),1);
  await page.getByLabel('Сравнение карты').fill('70');
  assert.equal(await page.getByLabel('Сравнение карты').inputValue(),'70');
  await page.locator('#map .map-canvas').screenshot({path:'artifacts/desktop-map-compare-accurate.png'});
  await page.locator('#map').getByRole('button',{name:'Сравнение до и после'}).click();
  await page.locator('#partisans').evaluate(el=>el.scrollIntoView({behavior:'instant',block:'start'}));
  assert.equal(await page.locator('#partisans .bagration-map [data-layer=partisans]').count(),1);
  await page.locator('#partisans').screenshot({path:'artifacts/desktop-partisans-accurate.png'});
  await page.locator('#strategy .fd-map-canvas').screenshot({path:'artifacts/desktop-strategy-map-accurate.png'});
  assert.deepEqual(errors,[]);
  console.log('MAP_ACCURACY_CHECK_OK');
} finally {
  await browser.close();
}
