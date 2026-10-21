import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {isMurvikLocalHost} from '../src/murvikEnvironment.js';
for(const host of ['localhost','127.0.0.1','[::1]','192.168.1.23','10.1.2.3','172.16.0.5'])assert.ok(isMurvikLocalHost(host),host);
for(const host of ['example.com','murvik-hosted.test','172.32.0.1','192.168.1.999','localhost.example.com'])assert.ok(!isMurvikLocalHost(host),host);
const browser=await chromium.launch({headless:true,channel:'chrome'});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
 const api=[];
 await page.route('http://murvik-hosted.test/**',async route=>{
  const url=new URL(route.request().url());
  if(url.pathname.startsWith('/api/murvik'))api.push(url.pathname);
  const response=await route.fetch({url:'http://127.0.0.1:5173'+url.pathname+url.search});
  await route.fulfill({response});
 });
 await page.goto('http://murvik-hosted.test/',{waitUntil:'networkidle'});
 await page.locator('#operation-loader').waitFor({state:'detached',timeout:60000});
 await page.getByRole('button',{name:'Мурвiк — открыть помощника'}).click();
 await page.getByRole('button',{name:'Спросить Мурвiка'}).click();
 const panel=page.locator('#murvik-panel');
 await panel.getByText('только локально.').waitFor();
 assert.equal(await panel.locator('textarea').count(),0);
 for(const [width,height] of [[1440,900],[390,844],[320,568],[844,390]]){
  await page.setViewportSize({width,height});
  const fits=await panel.locator('.murvik-hosted-card').evaluate(el=>{const r=el.getBoundingClientRect(),p=el.closest('#murvik-panel').getBoundingClientRect();return r.top>=p.top&&r.bottom<=p.bottom&&r.left>=p.left&&r.right<=p.right;});
  assert.ok(fits,`notice fits ${width}`);
  await panel.screenshot({path:`artifacts/murvik-hosted-${width}.png`});
 }
 assert.deepEqual(api,[]);
 await page.getByRole('button',{name:'Викторина',exact:false}).click();
 await panel.getByRole('button',{name:'Начать викторину'}).click();
 assert.equal(await panel.locator('.murvik-options button').count(),3);
 await page.close();
 const local=await browser.newPage({reducedMotion:'reduce'});
 const calls=[];
 await local.route('**/api/murvik/health',route=>{calls.push('health');return route.fulfill({json:{available:true}});});
 await local.route('**/api/murvik/chat',route=>{calls.push('chat');return route.fulfill({json:{text:'Проверка локальной нейросети.',engine:'ollama',links:[],suggestions:[]}});});
 await local.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
 await local.locator('#operation-loader').waitFor({state:'detached',timeout:60000});
 await local.getByRole('button',{name:'Мурвiк — открыть помощника'}).click();
 await local.getByRole('button',{name:'Спросить Мурвiка'}).click();

 await local.getByRole('textbox',{name:'Вопрос Мурвiку'}).fill('Привет');
 await local.getByRole('button',{name:'Отправить вопрос'}).click();
 await local.getByText('Проверка локальной нейросети.',{exact:true}).waitFor();
 assert.ok(calls.includes('health')&&calls.includes('chat'));
 assert.equal(await local.locator('.murvik-hosted').count(),0);
 console.log('MURVIK_HOSTING_OK: hosted notice at 4 viewport sizes; no API requests or input on hosting; quiz available; local health/chat requests and response unchanged (mock API).');
}finally{await browser.close();}

