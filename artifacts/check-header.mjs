import {createServer} from 'vite';
import {chromium} from 'playwright';
const s=await createServer({server:{port:5182,host:'127.0.0.1'}});await s.listen();
const b=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
for(const width of [1440,1024,390]){
const p=await b.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
await p.goto('http://127.0.0.1:5182/');
console.log(width,await p.locator('.museum-header').evaluate(e=>({overflow:e.scrollWidth>e.clientWidth,height:e.offsetHeight,background:getComputedStyle(e).backgroundColor})));
await p.screenshot({path:'artifacts/header-new-'+width+'.png'});
await p.locator('.museum-menu-button').click();
console.log('targets exist',await p.locator('.museum-menu-links a').evaluateAll(a=>a.every(x=>document.querySelector(x.getAttribute('href')))));
await p.keyboard.press('Escape');console.log('Escape closes',await p.locator('.museum-menu-panel').count()===0);
await p.locator('.museum-menu-button').click();await p.locator('.museum-menu-links a').nth(6).click();
console.log('link closes',await p.locator('.museum-menu-panel').count()===0);
await p.close();}
await b.close();await s.close();
