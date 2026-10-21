import {chromium} from 'playwright';
import fs from 'node:fs/promises';
const browser=await chromium.launch({headless:true,channel:'chrome'});
const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
try{
 await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
 await page.locator('#operation-loader').waitFor({state:'detached',timeout:60000});
 const sections=await page.locator('main section[id]').evaluateAll(nodes=>nodes.map(n=>({id:n.id,headings:[...n.querySelectorAll('h2,h3')].slice(0,6).map(h=>h.innerText)})));
 await page.locator('#map').scrollIntoViewIfNeeded();
 await page.getByRole('button',{name:'Приблизить Минскую область'}).evaluate(e=>e.dispatchEvent(new MouseEvent('click',{bubbles:true})));
 await page.locator('.battle-atlas').waitFor({timeout:30000});
 await page.locator('#map').screenshot({path:'artifacts/speech-v2/site-map.png'});
 const atlas=await page.locator('.battle-atlas').innerText();
 await page.getByRole('button',{name:'Мурвiк — открыть помощника'}).click();
 const murvik=await page.locator('#murvik-panel').innerText();
 await page.setViewportSize({width:390,height:844});await page.locator('#murvik-panel').screenshot({path:'artifacts/speech-v2/site-mobile.png'});
 await fs.writeFile('artifacts/speech-v2/site-review.json',JSON.stringify({sections,atlas,murvik},null,2));
 console.log(JSON.stringify({sections,atlas:atlas.slice(0,1400),murvik},null,2));
}finally{await browser.close();}

