import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {campaignEvents,campaignDay,campaignStage} from '../src/campaignTimeline.js';
import {axes,places,frontPaths,progressLine,line} from '../src/bagrationMapData.js';
assert.equal(new Set(campaignEvents.map(e=>e.id)).size,campaignEvents.length);
for(let i=1;i<campaignEvents.length;i++)assert(campaignDay(campaignEvents[i].date)>=campaignDay(campaignEvents[i-1].date));
assert.equal(frontPaths.length,campaignEvents.length);
for(const a of axes){assert.equal(a.progress.length,campaignEvents.length);for(let i=0;i<a.progress.length;i++){assert(a.progress[i]>=0&&a.progress[i]<=1);if(i)assert(a.progress[i]>=a.progress[i-1]);}}
for(const [city,date] of Object.entries({polotsk:'04.07',molodechno:'05.07',baranovichi:'08.07',lida:'09.07',slonim:'10.07',pinsk:'14.07',volkovysk:'14.07',grodno:'16.07',brest:'28.07',vilnius:'13.07',bialystok:'27.07',siauliai:'27.07',lublin:'24.07',kaunas:'01.08',osowiec:'14.08'}))assert.equal(places[city].date,date);
for(const id of ['third-west','second-west','first-west','baltic-west'])assert.equal(axes.find(a=>a.id===id).progress[campaignStage('minsk')],0);
assert.equal(axes.find(a=>a.id==='first-west').progress[campaignStage('brest')],1);
const b=await chromium.launch({headless:true,channel:'chrome'});const errors=[];
try{
 for(const [width,height] of [[1920,1080],[1440,1000],[390,844],[320,844]]){
  const p=await b.newPage({viewport:{width,height},reducedMotion:'reduce'});p.on('pageerror',e=>errors.push(e.message));
  await p.goto(process.env.BASE_URL||'http://127.0.0.1:5173/',{waitUntil:'networkidle'});
  await p.locator('#map').evaluate(e=>e.scrollIntoView({block:'start'}));
  const range=p.getByRole('slider',{name:'Дата операции',exact:true});
  assert.equal(await range.getAttribute('max'),String(campaignEvents.length-1));
  for(let i=0;i<campaignEvents.length;i++){
   await range.fill(String(i));
   await p.locator('#map .map-card h3').filter({hasText:campaignEvents[i].label}).waitFor();
   assert.equal(await p.locator('#map .live-date').innerText(),campaignEvents[i].date);
   assert.equal(await p.locator('#map .map-event-source').getAttribute('href'),campaignEvents[i].source.url);
  }
  await range.fill(String(campaignStage('brest')));
  await p.locator('#map .map-card h3').filter({hasText:'Брест'}).waitFor();
  assert.equal(await p.locator('#map [data-route="first-west"]').getAttribute('data-progress'),'1');
  assert.equal(await p.locator('#map .map-point').count(),campaignEvents.filter(e=>e.place&&e.id===e.place).length);
  await p.locator('#map .map-point[data-city="grodno"]').evaluate(e=>e.click());
  assert.equal(await range.inputValue(),String(campaignStage('grodno')));
  await p.getByRole('button',{name:'Фокус на выбранной точке',exact:true}).click();
  await range.fill(String(campaignEvents.length-1));
  await p.locator('#map .map-card h3').filter({hasText:'Завершение операции'}).waitFor();
  await p.locator('#map .map-shell').screenshot({path:`artifacts/campaign-complete-${width}.png`});
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`page overflow ${width}`);
  const active=await p.locator('.scrubber-labels [aria-current=step]').boundingBox(),list=await p.locator('.scrubber-labels').boundingBox();assert(active.x>=list.x-1&&active.x+active.width<=list.x+list.width+1);
  await p.close();
 }
 assert.deepEqual(errors,[]);console.log(`CAMPAIGN_COMPLETE_PASS: ${campaignEvents.length} chronological events; dated arrows; 1920/1440/390/320; city selection; sources; no runtime errors or page overflow.`);
}finally{await b.close()}
