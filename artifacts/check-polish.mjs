import {createServer} from 'vite';
import {chromium} from 'playwright';
const s=await createServer({server:{port:5182,host:'127.0.0.1'}});await s.listen();
const b=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
for(const width of [1440,390]){
const p=await b.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
await p.goto('http://127.0.0.1:5182/');
for(const id of ['prehistory','strategy','commanders','technology','aviators','partisans','results','archive','videos','projects']){
await p.locator('#'+id).evaluate(e=>e.scrollIntoView({block:'start',behavior:'instant'}));
const result=await p.locator('#'+id).evaluate(e=>({overflow:e.scrollWidth>e.clientWidth,heading:[...e.querySelectorAll('h2')].map(h=>({text:h.textContent,size:getComputedStyle(h).fontSize,overflow:h.scrollWidth>h.clientWidth}))}));
console.log(width,id,JSON.stringify(result));
if(['strategy','aviators','partisans','projects'].includes(id))await p.screenshot({path:'artifacts/polish-'+id+'-'+width+'.png'});
}
await p.close();}
await b.close();await s.close();

