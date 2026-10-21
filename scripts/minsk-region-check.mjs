import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {minskRegionPath,minskRegionBounds} from '../src/minskRegionShape.js';
import {xy} from '../src/bagrationMapData.js';
const geo=JSON.parse(readFileSync('public/data/minsk-region.geojson'));
assert.equal(geo.geometry.coordinates.length,7);
assert.equal(geo.geometry.coordinates.reduce((n,p)=>n+p.length-1,0),3);
for(const polygon of geo.geometry.coordinates)for(const ring of polygon){assert.deepEqual(ring[0],ring.at(-1));for(const [lon,lat] of ring){const p=xy(lon,lat);assert.ok(minskRegionPath.includes(`${p.x.toFixed(3)} ${p.y.toFixed(3)}`),'Every OSM vertex retained in shared atlas projection')}}
console.log('MINSK_GEOMETRY: PASS (all OSM vertices, closed rings, 3 holes, shared geographic projection)');
const browser=await chromium.launch({headless:true,channel:'chrome'});
try{for(const [width,height,reduced] of [[1440,900,false],[390,844,false],[1920,1080,true],[320,568,true]]){
const page=await browser.newPage({viewport:{width,height},reducedMotion:reduced?'reduce':'no-preference'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(process.env.BASE_URL||'http://127.0.0.1:5174/',{waitUntil:'networkidle'});
await page.evaluate(()=>scrollTo(0,document.querySelector('#map').offsetTop+innerHeight));
const hit=page.getByRole('button',{name:'Приблизить Минскую область'});await hit.focus();
await page.screenshot({path:`artifacts/minsk-geo-overview-${width}.png`});
const date=await page.getByRole('slider',{name:'Дата операции'}).inputValue();
await page.keyboard.press('Enter');await page.waitForTimeout(reduced?100:2600);
assert.equal(await page.locator('.region-focused').count(),1);assert.equal(await page.locator('.minsk-region-detail').evaluate(n=>getComputedStyle(n).opacity),'1');
assert.equal(await page.getByLabel('Масштаб области',{exact:true}).innerText(),'3.2×');
assert.equal(await page.getByRole('slider',{name:'Дата операции'}).inputValue(),date);
const clip=await page.locator('.minsk-region-hit').evaluate(n=>{
const svg=n.ownerSVGElement;const minsk=svg.createSVGPoint();minsk.x=644;minsk.y=534;return {fillRule:getComputedStyle(n).fillRule,minskIsLand:n.isPointInFill(minsk)}
});assert.equal(clip.fillRule,'evenodd');assert.equal(clip.minskIsLand,false,'Minsk city is a real hole');
await page.screenshot({path:`artifacts/minsk-region-zoom-${width}.png`});
const world=page.locator('#map .map-world'),canvas=page.locator('#map .map-canvas');
const start=await world.evaluate(n=>getComputedStyle(n).transform);
await page.getByRole('button',{name:'Увеличить масштаб области',exact:true}).click();await page.waitForTimeout(reduced?50:2600);
assert.equal(await page.getByLabel('Масштаб области',{exact:true}).innerText(),'4.0×');
const zoomed=await world.evaluate(n=>getComputedStyle(n).transform);assert.notEqual(zoomed,start);
const box=await canvas.boundingBox();await page.mouse.move(box.x+box.width*.5,box.y+box.height*.62);await page.mouse.down();await page.mouse.move(box.x+box.width*.5+65,box.y+box.height*.62+65,{steps:8});await page.mouse.up();await page.waitForTimeout(100);
assert.notEqual(await world.evaluate(n=>getComputedStyle(n).transform),zoomed,'Drag moves the camera');
await page.getByRole('button',{name:'Сбросить вид области'}).click();await page.waitForTimeout(reduced?50:2600);assert.equal(await page.getByLabel('Масштаб области',{exact:true}).innerText(),'3.2×');
await canvas.focus();await page.keyboard.press('+');assert.equal(await page.getByLabel('Масштаб области',{exact:true}).innerText(),'4.0×');await page.keyboard.press('Home');
await page.keyboard.press('Escape');await page.waitForTimeout(reduced?50:2100);
assert.equal(await page.locator('.region-focused').count(),0);assert.equal(await hit.getAttribute('aria-expanded'),'false');
assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);assert.deepEqual(errors,[]);
console.log(`MINSK_REGION ${width}x${height}${reduced?' reduced-motion':''}: PASS (zoom, drag, reset, keyboard, city hole, date, Escape, viewport, no runtime errors)`);await page.close();
}}finally{await browser.close()}
