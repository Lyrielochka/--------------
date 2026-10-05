import { chromium } from 'playwright';
const browser = await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
for (const width of [1440,390]) {
 const page = await browser.newPage({viewport:{width,height:844}});
 const errors=[]; page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5173/',{waitUntil:'domcontentloaded'});
 await page.locator('#operation-loader').waitFor({state:'visible'});
 await page.screenshot({path:`artifacts/preloader-${width}.png`});
 await page.waitForFunction(()=>document.querySelector('#loader-message')?.textContent.includes('технику'),{},{timeout:5000});
 await page.waitForFunction(()=>document.querySelector('#loader-message')?.textContent.includes('архивные'),{},{timeout:4000});
 await page.locator('#operation-loader').waitFor({state:'detached',timeout:14000});
 const result=await page.evaluate(()=>({unlocked:!document.documentElement.classList.contains('operation-loading'),visible:getComputedStyle(document.querySelector('#root')).visibility,overflow:document.documentElement.scrollWidth>innerWidth}));
 if(!result.unlocked||result.visible!=='visible'||result.overflow||errors.length) throw Error(JSON.stringify({width,result,errors}));
 console.log(`PASS ${width}: messages, dismissal, scroll unlock, no overflow or JS errors`);
 await page.close();
}
await browser.close();
