import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
try{for(const width of [1440,390]){
 const p=await browser.newPage({viewport:{width,height:844}});const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 assert.equal(await p.locator('.jury-welcome').evaluate(el=>el.open),false);
 await p.locator('#operation-loader').waitFor({state:'detached',timeout:18000});await p.getByRole('dialog').waitFor({state:'visible'});
 assert.equal(await p.locator('body').evaluate(el=>el.style.overflow),'hidden');
 assert.equal(await p.getByRole('button',{name:'Понятно'}).evaluate(el=>el===document.activeElement),true);
 await p.screenshot({path:`artifacts/jury-welcome-${width}.png`});
 await p.getByRole('button',{name:'Понятно'}).click();await p.getByRole('dialog').waitFor({state:'hidden'});
 assert.notEqual(await p.locator('body').evaluate(el=>el.style.overflow),'hidden');assert.deepEqual(errors,[]);
 console.log(`PASS ${width}: opens after loader, focus, scroll lock, button closes, no JS errors`);await p.close();
}}finally{await browser.close()}
