import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,channel:'chrome'});
try{
const page=await browser.newPage({viewport:{width:1440,height:900},hasTouch:true});await page.goto('http://127.0.0.1:5174/',{waitUntil:'networkidle'});await page.evaluate(()=>scrollTo(0,document.querySelector('#map').offsetTop+innerHeight));
const hit=page.getByRole('button',{name:'Приблизить Минскую область'});
// Actual mouse click on a geographic land point (not the city hole).
const rect=await page.locator('.minsk-region').boundingBox();await page.mouse.click(rect.x+700/1402*rect.width,rect.y+650/1122*rect.height);await page.waitForTimeout(2600);assert.equal(await hit.getAttribute('aria-expanded'),'true');
await page.screenshot({path:'artifacts/minsk-region-zoom-1440.png'});
const canvas=await page.locator('#map .map-canvas').boundingBox();await page.mouse.move(canvas.x+canvas.width*.6,canvas.y+canvas.height*.6);const sy=await page.evaluate(()=>scrollY);await page.mouse.wheel(0,-80);await page.waitForTimeout(100);assert.ok(parseFloat(await page.getByLabel('Масштаб области',{exact:true}).innerText())>3.2);assert.equal(await page.evaluate(()=>scrollY),sy);
await page.getByRole('button',{name:'Сбросить вид области'}).click();await page.waitForTimeout(2600);
const session=await page.context().newCDPSession(page);const x=canvas.x+canvas.width/2,y=canvas.y+canvas.height*.6;
await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:x-40,y,id:1},{x:x+40,y,id:2}]});
await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x-75,y,id:1},{x:x+75,y,id:2}]});
await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(150);assert.ok(parseFloat(await page.getByLabel('Масштаб области',{exact:true}).innerText())>3.2,'Pinch zoom works');
await page.getByRole('button',{name:'К общей карте',exact:true}).click();assert.equal(await page.locator('.region-focused').count(),0);
await page.setViewportSize({width:390,height:844});await hit.focus();await page.keyboard.press('Enter');await page.waitForTimeout(2600);await page.screenshot({path:'artifacts/minsk-region-zoom-390.png'});
console.log('MINSK_POINTER: PASS (actual geographic click, wheel without page scroll, two-finger pinch, return button, thin outline)');
}finally{await browser.close()}
