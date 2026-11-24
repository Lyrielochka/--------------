import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,channel:'chrome'});
const regions=[['vitebsk','Витебскую','Витебской',33],['mogilev','Могилёвскую','Могилёвской',43],['grodno','Гродненскую','Гродненской',37],['brest','Брестскую','Брестской',34]];
try{for(const width of [1440,390]){
 const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5192/',{waitUntil:'networkidle'});
 await page.evaluate(()=>scrollTo(0,document.querySelector('#map').offsetTop+innerHeight));
 for(const [slug,label,name,count] of regions){
  await page.getByRole('button',{name:`Приблизить ${label} область`,exact:true}).focus();await page.keyboard.press('Enter');
  await page.getByRole('region',{name:`Боевые события ${name} области`}).waitFor();await page.locator('.battle-event-list>button').first().waitFor({state:'attached'});
  assert.equal(await page.locator('.battle-event-list>button').count(),count);
  assert.equal(await page.locator('.minsk-region.is-open image').count(),1);
  assert.equal(await page.locator('.region-boundary-halo:visible').count(),1);
  assert.equal(await page.locator('.region-navigation').innerText().then(s=>s.includes('Учебная схема')),true);
  assert.equal(await page.locator('.map-world>.bagration-map').evaluate(el=>getComputedStyle(el).visibility),'hidden');
  await page.locator('.map-canvas').screenshot({path:`artifacts/${slug}-boundary-${width}.png`});
  for(let i=0;i<5;i++)await page.getByRole('button',{name:'Увеличить масштаб области',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('.region-camera-tools output').textContent==='9.0×');
  assert.equal(await page.locator('.minsk-region.is-open .minsk-region-hit').evaluate(el=>getComputedStyle(el).filter),'none');
  if(width===1440)await page.locator('.map-canvas').screenshot({path:`artifacts/${slug}-boundary-zoom9.png`});
  const canvas=page.locator('.map-canvas');await canvas.focus();const before=await page.locator('.map-world').getAttribute('style');await page.keyboard.press('ArrowLeft');assert.notEqual(await page.locator('.map-world').getAttribute('style'),before);
  await page.getByRole('button',{name:'Сбросить вид области',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('.region-camera-tools output').textContent==='3.2×');
  if(width<700)await page.locator('.battle-mobile-open').click();
  await page.getByRole('button',{name:'Об источниках и полноте атласа'}).click();await page.locator('.battle-method').waitFor();
  assert.ok((await page.locator('.battle-method').innerText()).includes('OpenStreetMap'));assert.ok(!(await page.locator('.battle-method').innerText()).includes('2005'));
  await page.keyboard.press('Escape');await page.getByRole('button',{name:'К общей карте',exact:true}).click();
  console.log(`${slug} ${width}: PASS (vector border, max zoom, keyboard pan, reset, source, exit)`);
 }
 await page.getByRole('button',{name:'Приблизить Минскую область',exact:true}).focus();await page.keyboard.press('Enter');
 await page.getByRole('region',{name:'Боевые события Минской области'}).waitFor();assert.equal(await page.locator('.battle-event-list>button').count(),76);
 assert.deepEqual(errors,[]);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);await page.close();
}}finally{await browser.close()}
