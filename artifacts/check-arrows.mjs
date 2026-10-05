import {createServer} from 'vite';
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const s=await createServer({server:{port:5182,host:'127.0.0.1'}});await s.listen();
const b=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const p=await b.newPage({viewport:{width:1440,height:900}});
await p.goto('http://127.0.0.1:5182/');await p.locator('#map').scrollIntoViewIfNeeded();
for(const stage of [1,3,6,8,2]){
await p.getByLabel('Дата операции',{exact:true}).fill(String(stage));
for(const delay of [0,150,450]){
if(delay)await p.waitForTimeout(delay);
const checks=await p.locator('#map .bmap-route-active').evaluateAll(paths=>paths.map(path=>{const id=path.getAttribute('marker-end').match(/#(.+)\)/)[1];const marker=document.getElementById(id);return marker&&marker.tagName==='marker'&&marker.getAttribute('refX')==='0'&&marker.getAttribute('refY')==='0'&&marker.getAttribute('orient')==='auto'&&marker.getAttribute('markerUnits')==='userSpaceOnUse'}));
assert(checks.length>0&&checks.every(Boolean));
}
}
await p.waitForTimeout(1200);await p.locator('#map .map-canvas').screenshot({path:'artifacts/map-arrow-fixed.png'});
console.log('Arrow markers attached throughout forward and backward date transitions.');
await b.close();await s.close();
