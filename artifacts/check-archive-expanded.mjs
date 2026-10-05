import {createServer} from 'vite';
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const s=await createServer({server:{port:5182,host:'127.0.0.1'}});await s.listen();
const b=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
for(const width of [1440,390]){
const p=await b.newPage({viewport:{width,height:900},reducedMotion:'reduce'});await p.goto('http://127.0.0.1:5182/');await p.locator('#archive').evaluate(e=>e.scrollIntoView({behavior:'instant',block:'start'}));
for(let i=0;i<8;i++){
await p.locator('.sheet-open').nth(i).scrollIntoViewIfNeeded();await p.locator('.sheet-open').nth(i).click();
await p.waitForFunction(()=>{const i=document.querySelector('.reader-front img');return i?.complete&&i.naturalWidth>0});
assert(!/ДЕМОНСТРАЦИОННЫЙ|реконструкция|ОБРАЗЕЦ/.test(await p.locator('.archive-reader').innerText()));
assert.equal(await p.locator('.reader-front img').count(),1);
if(i===5)await p.waitForTimeout(400);await p.locator('.archive-reader').screenshot({path:'artifacts/archive-reader-'+width+'.png'});
await p.keyboard.press('Escape');await p.locator('.archive-reader').waitFor({state:'detached'});
}
await p.locator('.desk-filters button').nth(1).click();await p.waitForFunction(()=>document.querySelectorAll('.sheet-open').length===7);
await p.locator('.desk-filters button').nth(2).click();await p.waitForFunction(()=>document.querySelectorAll('.sheet-open').length===1);
await p.locator('.desk-filters button').first().click();await p.waitForFunction(()=>document.querySelectorAll('.sheet-open').length===8);
await p.locator('#archive').evaluate(e=>e.scrollIntoView({behavior:'instant',block:'start'}));
await p.screenshot({path:'artifacts/historical-archive-'+width+'.png'});
console.log(width,'8 photos and captions loaded; filters and dialogs pass');await p.close();}
await b.close();await s.close();
