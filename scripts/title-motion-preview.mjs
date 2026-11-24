import {chromium} from 'playwright';
const b=await chromium.launch({channel:'chrome',headless:true});
try {
 const p=await b.newPage();
 for(const width of [1440,390,320]){
 await p.setViewportSize({width,height:900});await p.goto('http://127.0.0.1:5173/');await p.waitForTimeout(2200);await p.evaluate(()=>document.fonts.ready);
 const r=await p.locator('.living-title').evaluate(el=>({width:el.getBoundingClientRect().width,right:el.getBoundingClientRect().right,screen:innerWidth,layers:[...el.children].map(s=>({animation:getComputedStyle(s).animationName,image:getComputedStyle(s).backgroundImage}))}));console.log(width,JSON.stringify(r));
 await p.locator('#hero').screenshot({path:`artifacts/title-motion-${width}.png`});
 }
 await p.emulateMedia({reducedMotion:'reduce'});console.log('Reduced motion:',await p.locator('.title-scene-base').evaluate(el=>getComputedStyle(el).animationName));
}finally{await b.close()}
