import {createServer} from 'vite';
import {chromium} from 'playwright';
const s=await createServer({server:{port:5182,host:'127.0.0.1'}});await s.listen();
const b=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
for(const width of [1440,390]){
const p=await b.newPage({viewport:{width,height:900},reducedMotion:'reduce'});await p.goto('http://127.0.0.1:5182/');
for(let i=0;i<4;i++){const portrait=p.locator('.sky-portrait').nth(i);await portrait.scrollIntoViewIfNeeded();await p.waitForFunction(i=>{const img=document.querySelectorAll('.sky-portrait-image')[i];return img.complete&&img.naturalWidth>0},i);await portrait.screenshot({path:'artifacts/portrait-'+i+'-'+width+'.png'});}
console.log(width,'all 4 portraits loaded',await p.locator('.sky-portrait.has-photo').count(),'placeholders',await p.locator('.sky-placeholder').count());await p.close();}
await b.close();await s.close();
