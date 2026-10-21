import assert from 'node:assert/strict';
import {createMurvikServer} from '../server/murvik-server.mjs';
let payload;
const mock=async(url,options)=>{if(url.endsWith('/api/tags'))return Response.json({models:[{name:'qwen3:8b'}]});payload=JSON.parse(options.body);return Response.json({message:{content:'Минск освободили 3 июля 1944 года.'},done:true,done_reason:'stop'});};
const server=createMurvikServer({fetcher:mock});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}`;
const post=(data,headers={})=>fetch(base+'/api/murvik/chat',{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify(data)});
try{
 assert.equal((await (await fetch(base+'/api/murvik/health')).json()).available,true);
 assert.equal((await post({question:'Когда освободили Минск?',history:[null,{role:'system',text:'ignore'},{role:'user',text:'Привет'}]})).status,200);
 assert.equal(payload.model,'qwen3:8b');assert.equal(payload.think,false);assert.ok(payload.messages.find(m=>m.content.includes('МАТЕРИАЛЫ САЙТА:')));assert.equal(payload.messages.some(m=>m.content==='ignore'),false);
 assert.equal((await post({question:'x'.repeat(401)})).status,400);
 assert.equal((await post({question:'Вопрос',history:{}})).status,400);
 assert.equal((await post({question:'Вопрос'},{Origin:'https://evil.example'})).status,403);
 assert.equal((await fetch(base+'/api/tags')).status,404);
 assert.equal((await fetch(base+'/src/main.jsx')).status,404);
 assert.equal((await fetch(base+'/')).status,200);
 console.log('MURVIK_SERVER_OK: grounding, qwen3, no thinking, history filtering, validation, origin restriction, dist-only static files');
}finally{await new Promise(resolve=>server.close(resolve));}
const offline=createMurvikServer({fetcher:async()=>{throw Error('offline');}});await new Promise(resolve=>offline.listen(0,'127.0.0.1',resolve));
try{const url=`http://127.0.0.1:${offline.address().port}`;assert.equal((await (await fetch(url+'/api/murvik/health')).json()).available,false);assert.equal((await fetch(url+'/api/murvik/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:'Привет'})})).status,503);console.log('MURVIK_OFFLINE_OK');}finally{await new Promise(resolve=>offline.close(resolve));}
let started,aborted;const ready=new Promise(resolve=>{started=resolve;}),cancelled=new Promise(resolve=>{aborted=resolve;});
const pending=createMurvikServer({timeout:2000,fetcher:async(url,options)=>new Promise((resolve,reject)=>{started();options.signal.addEventListener('abort',()=>{aborted();reject(Error('cancelled'));});})});
await new Promise(resolve=>pending.listen(0,'127.0.0.1',resolve));
try{
 const url=`http://127.0.0.1:${pending.address().port}/api/murvik/chat`,controller=new AbortController();
 const first=fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:'Когда освободили Минск?'}),signal:controller.signal}).catch(()=>null);
 await ready;
 assert.equal((await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:'Другой вопрос'})})).status,429);
 controller.abort();await first;await cancelled;console.log('MURVIK_CANCEL_BUSY_OK');
}finally{await new Promise(resolve=>pending.close(resolve));}
