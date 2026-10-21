import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const base=process.env.BASE_URL||'http://127.0.0.1:5173';
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
 const requests=[];page.on('request',r=>requests.push(r.url()));
 await page.goto(base,{waitUntil:'networkidle'});await page.locator('#operation-loader').waitFor({state:'detached'});
 assert.equal(requests.some(url=>/MinskRegion-.*\.js/.test(url)),false,'Regional boundary deferred until map approaches viewport');
 assert.equal(requests.some(url=>url.endsWith('.glb')),false,'Models deferred until detail opens');
 assert.ok(requests.some(url=>url.endsWith('/hero-cover.webp')),'Optimized hero loaded');
 const initial=await page.evaluate(()=>performance.getEntriesByType('resource').filter(r=>r.name.includes('/assets/')).reduce((n,r)=>n+r.encodedBodySize,0));
 await page.locator('#map').scrollIntoViewIfNeeded();
 await page.getByRole('button',{name:'Приблизить Минскую область'}).waitFor({state:'attached'});
 assert.ok(requests.some(url=>/MinskRegion-.*\.js/.test(url)));
 const response=await page.request.get(base+'/data/minsk-battle-events.json');assert.equal(response.status(),200);const registry=await response.json();assert.equal(registry.events.length,76);
 const report={result:'SITE_LOADING: PASS',initialAssetBytes:initial,deferredBoundary:true,deferredModels:true,exportRecords:registry.events.length};
 await writeFile('artifacts/site-optimization-loading.json',JSON.stringify(report,null,2));console.log(report);
}finally{await browser.close()}
