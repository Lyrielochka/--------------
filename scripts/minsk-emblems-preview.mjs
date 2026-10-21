import {chromium} from 'playwright';
import fs from 'node:fs';
const browser=await chromium.launch({headless:true,channel:'chrome'});
try{
const page=await browser.newPage({viewport:{width:1200,height:430},reducedMotion:'reduce'});await page.goto('http://127.0.0.1:5180/',{waitUntil:'networkidle'});await page.evaluate(()=>scrollTo(0,document.querySelector('#map').offsetTop+innerHeight));await page.getByRole('button',{name:'Приблизить Минскую область'}).focus();await page.keyboard.press('Enter');await page.locator('.battle-type-filters svg').first().waitFor();
const icons=await page.locator('.battle-type-filters svg').evaluateAll(nodes=>nodes.map(n=>n.outerHTML.replace(/width="19"/,'width="100"').replace(/height="19"/,'height="100"')));
const names=['ОСВОБОЖДЕНИЕ','БОЕВОЙ ЭПИЗОД','ПЕРЕПРАВА','АВИАЦИЯ','ОКРУЖЕНИЕ'];const colors=['#e4cb94','#e3a08a','#95ced0','#b4c5df','#d2b9dc'];
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="430" viewBox="0 0 1200 430"><defs><radialGradient id="bg"><stop stop-color="#30483d"/><stop offset="1" stop-color="#10252a"/></radialGradient></defs><style>.emblem-solid{fill:currentColor;fill-opacity:.9;stroke-width:1}.emblem-enamel{fill:#925c42;fill-opacity:.85}.emblem-cut{stroke:#132b29}text{font-family:Georgia,serif}</style><rect width="1200" height="430" fill="url(#bg)"/><rect x="18" y="18" width="1164" height="394" fill="none" stroke="#b7a273" stroke-opacity=".5"/><text x="600" y="64" text-anchor="middle" fill="#ddc58f" font-size="13" letter-spacing="5">МИНСКАЯ ЗЕМЛЯ · ЛЕТО ОСВОБОЖДЕНИЯ</text><text x="600" y="108" text-anchor="middle" fill="#f1e1bb" font-size="29">Знаки военно-исторического атласа</text>${icons.map((icon,i)=>`<g transform="translate(${120+i*240},240)" color="${colors[i]}"><circle r="76" fill="#102824" stroke="#bca575" stroke-opacity=".5"/><circle r="68" fill="none" stroke="#bca575" stroke-opacity=".2"/><g transform="translate(-50,-50)">${icon}</g><path d="M-55 103H55" stroke="#a58c5c"/><text y="131" text-anchor="middle" fill="#e3d3ad" font-size="12" letter-spacing="1">${names[i]}</text></g>`).join('')}</svg>`;
fs.writeFileSync('artifacts/atlas-emblems.svg',svg);
await page.setContent(`<style>body{margin:0}</style>${svg}`);await page.screenshot({path:'artifacts/atlas-emblems.png'});
console.log('EMBLEMS: rendered five original SVG engravings');
}finally{await browser.close()}
