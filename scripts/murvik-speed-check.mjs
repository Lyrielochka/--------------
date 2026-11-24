import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {createMurvikServer} from '../server/murvik-server.mjs';
import {readJsonLines} from '../server/murvik-stream.js';

let release,fail=false;
const server=createMurvikServer({fetcher:async(url,options)=>{
  if(url.endsWith('/api/tags'))return Response.json({models:[{name:'qwen3:8b'}]});
  const payload=JSON.parse(options.body);assert.equal(payload.stream,true);assert.equal(payload.think,false);
  return new Response(new ReadableStream({async start(controller){
    const put=value=>controller.enqueue(new TextEncoder().encode(JSON.stringify(value)+'\n'));
    put({message:{content:'<think>Скрыто</think>Минск освободили '}});
    await new Promise(resolve=>{release=resolve;});
    if(fail)put({error:'offline'});
    else {put({message:{content:'3 июля 1944 года.'}});put({done:true,done_reason:'stop'});}
    controller.close();
  }}));
}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}`;
let browser;
try{
  // First fragment must arrive while model completion is still blocked.
  const response=await fetch(base+'/api/murvik/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:'Когда освободили Минск?',stream:true})});
  const records=readJsonLines(response.body);assert.equal((await records.next()).value.text,'Минск освободили ');
  release();let final;for await(const record of records)if(record.done)final=record.answer;
  assert.equal(final.text,'Минск освободили 3 июля 1944 года.');
  browser=await chromium.launch({headless:true,channel:'chrome'});
  const page=await browser.newPage({viewport:{width:390,height:844}});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(base);await page.locator('#operation-loader').waitFor({state:'detached',timeout:60000});
  await page.getByRole('button',{name:'Мурвiк — открыть помощника'}).click();
  await page.getByRole('button',{name:'Спросить Мурвiка'}).click();
  const ask=async()=>{await page.getByRole('textbox',{name:'Вопрос Мурвiку'}).fill('Когда освободили Минск?');await page.getByRole('button',{name:'Отправить вопрос',exact:true}).click();await page.locator('.murvik-pending p').waitFor();};
  await ask();assert.equal((await page.locator('.murvik-pending p').innerText()).trim(),'Минск освободили');
  assert.equal(await page.getByRole('button',{name:'Отправить вопрос',exact:true}).isDisabled(),true);
  await page.locator('#murvik-panel').screenshot({path:'artifacts/murvik-stream-mobile.png'});
  release();await page.locator('.murvik-pending').waitFor({state:'detached'});
  assert.match(await page.getByRole('log').innerText(),/3 июля 1944/);
  await ask();await page.getByRole('button',{name:'Очистить диалог'}).click();release();
  assert.equal(await page.locator('.murvik-pending').count(),0);
  assert.equal(await page.locator('.murvik-message').count(),1);
  // A failed stream must replace the partial answer with the site fallback.
  await page.waitForTimeout(150);fail=true;await ask();release();await page.locator('.murvik-pending').waitFor({state:'detached'});
  assert.equal(await page.locator('.murvik-message').getAttribute('data-engine'),'local');
  assert.deepEqual(errors,[]);
  console.log('MURVIK_SPEED_OK: early text before completion, hidden thinking, final answer, browser stream, cancel and fallback');
}finally{release?.();await browser?.close();server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
