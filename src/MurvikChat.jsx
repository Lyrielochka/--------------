import React,{useEffect,useRef,useState} from 'react';
import {isMurvikLocalHost} from './murvikEnvironment.js';
import MurvikSymbol from './MurvikSymbol.jsx';

const localChat=isMurvikLocalHost(window.location.hostname);

const welcome={role:'assistant',text:'Ушки на макушке! Спроси меня об операции, технике или людях. Я отвечаю по материалам сайта и подсказываю, где узнать больше.',links:[],suggestions:['Когда освободили Минск?','Расскажи о Т-34-85','Какие фронты участвовали?']};
export function useMurvikChat(active=false){
  const [messages,setMessages]=useState([welcome]),[draft,setDraft]=useState(''),[status,setStatus]=useState('idle');
  const [partial,setPartial]=useState('');const topic=useRef(null),generation=useRef(0),timers=useRef(new Set());
  const [connection,setConnection]=useState('checking');const request=useRef(null),locked=useRef(false);
  useEffect(()=>{if(!active||!localChat)return;let alive=true;const controller=new AbortController();const check=async()=>{try{const response=await fetch('/api/murvik/health',{signal:AbortSignal.any([controller.signal,AbortSignal.timeout(3500)])});const data=response.ok?await response.json():null;if(alive)setConnection(data?.available?'online':'offline');}catch{if(alive)setConnection('offline');}};check();const timer=setInterval(check,30000);return()=>{alive=false;controller.abort();clearInterval(timer);};},[active]);
  const later=(fn,delay)=>{const timer=setTimeout(()=>{timers.current.delete(timer);fn();},delay);timers.current.add(timer);};
  useEffect(()=>()=>{generation.current++;timers.current.forEach(clearTimeout);request.current?.abort();},[]);
  const busy=status==='thinking'||status==='speaking';
  const clear=()=>{generation.current++;request.current?.abort();locked.current=false;timers.current.forEach(clearTimeout);timers.current.clear();setMessages([welcome]);setDraft('');setPartial('');setStatus('idle');topic.current=null;};
  const send=async(raw=draft)=>{
    if(!localChat)return;
    const text=raw.trim().slice(0,400);if(!text||busy||locked.current)return;locked.current=true;
    const id=++generation.current;setDraft('');setMessages(m=>[...m.slice(-22),{role:'user',text}]);setStatus('thinking');
    try{
      const {answerGuide}=await import('./murvikGuide.js');
      if(generation.current!==id)return;let reply={...answerGuide(text,{topic:topic.current}),engine:'local'};
      if(connection!=='offline'){
        const controller=new AbortController();request.current=controller;
        try{const response=await fetch('/api/murvik/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:text,topic:topic.current,history:messages.filter(m=>m!==welcome).slice(-6).map(({role,text})=>({role,text}))}),signal:AbortSignal.any([controller.signal,AbortSignal.timeout(125000)])});
          if(!response.ok)throw Error('Недоступно');const neural=await response.json();if(typeof neural.text!=='string'||neural.engine!=='ollama')throw Error('Некорректный ответ');reply=neural;if(generation.current===id)setConnection('online');
        }catch{if(generation.current!==id)return;reply={...reply,fallback:true};setConnection('offline');}
        finally{if(request.current===controller)request.current=null;}
      }
      if(generation.current!==id)return;
      later(()=>{
        if(generation.current!==id)return;topic.current=reply.topic;
        const finish=()=>{locked.current=false;setMessages(m=>[...m,{...reply,role:'assistant'}]);setPartial('');setStatus(reply.mood==='happy'?'happy':reply.mood==='unsure'?'unsure':'idle');};
        if(matchMedia('(prefers-reduced-motion: reduce)').matches){finish();return;}
        setStatus('speaking');let length=0;
        const tick=()=>{if(generation.current!==id)return;length+=18;if(length>=reply.text.length){finish();return;}setPartial(reply.text.slice(0,length));later(tick,24);};tick();
      },420);
    }catch{if(generation.current===id){locked.current=false;setMessages(m=>[...m,{role:'assistant',text:'Не получилось открыть материалы. Попробуй ещё раз. Карты, карточки и викторина по-прежнему доступны.',links:[],suggestions:['Что такое операция «Багратион»?']}]);setStatus('unsure');}}
  };
  return {messages,draft,setDraft,status,setStatus,partial,busy,send,clear,connection};
}

export default function MurvikChat({chat,onVisit,active}){
  const log=useRef(null),input=useRef(null);
  const [page,setPage]=useState(0),[limit,setLimit]=useState(430);
  const {messages,draft,setDraft,status,setStatus,partial,busy,send,clear}=chat;
  const latest=messages.filter(m=>m.role==='assistant').at(-1);
  useEffect(()=>{const resize=()=>setLimit(innerHeight<500?140:innerWidth<650?(innerHeight<700?180:260):innerHeight<650?260:430);resize();window.addEventListener('resize',resize);return()=>window.removeEventListener('resize',resize);},[]);
  const pages=messages.flatMap((message,messageIndex)=>{
    const chunks=[];let text=message.text;
    while(text.length>limit){let end=text.lastIndexOf(' ',limit);if(end<limit/2)end=limit;chunks.push(text.slice(0,end));text=text.slice(end).trimStart();}chunks.push(text);
    return chunks.map((text,part)=>({...message,text,links:part===chunks.length-1?message.links:[],messageIndex,part:part+1,parts:chunks.length}));
  });
  useEffect(()=>{setPage(Math.max(0,pages.findIndex(p=>p.messageIndex===messages.length-1)));},[messages,limit]);
  const current=pages[Math.min(page,pages.length-1)];
  if(!localChat)return <div className="murvik-chat murvik-hosted" hidden={!active}>
    <div className="murvik-hosted-card">
      <MurvikSymbol type="chat"/>
      <p className="murvik-eyebrow">НЕЙРОСЕТЬ МУРВIКА</p>
      <h3>Пока общаемся<br/><em>только локально.</em></h3>
      <p>Нейросеть Мурвiка работает в локальной версии сайта. На сайте в интернете диалог с ней пока недоступен.</p>
      <span>А викторина и задания уже ждут тебя — открой вкладку «Викторина».</span>
    </div>
  </div>;
  return <div className="murvik-chat" hidden={!active}>
    <div className="murvik-chat-top"><span><i/> Мурвiк на связи</span><button onClick={()=>{clear();input.current?.focus();}} aria-label="Очистить диалог">Новый диалог ↻</button></div>
    <p className="murvik-chat-note">Объясняю историю и помогаю исследовать сайт</p>
    <div ref={log} className="murvik-chat-log" role="log" aria-label="Диалог с Мурвiком" aria-live="polite" aria-atomic="true" tabIndex={0}>
      {!busy&&current&&<article className={`murvik-message ${current.role}`} data-engine={current.engine||'welcome'}><small>{current.role==='assistant'?'МУРВIК ОТВЕЧАЕТ':'ТВОЙ ВОПРОС'}{current.parts>1&&` · ЧАСТЬ ${current.part} / ${current.parts}`}</small><p>{current.text}</p>{current.links?.length>0&&<div className="murvik-chat-links">{current.links.map(l=><button key={l.section} onClick={()=>onVisit(l.section)}>{l.label} <span aria-hidden="true">↗</span></button>)}</div>}</article>}
      {busy&&<div className="murvik-message assistant murvik-pending" aria-hidden="true"><small>МУРВIК</small><div className="murvik-thinking"><i/><i/><i/><span>{partial?'Мурвiк собирает ответ…':'Мурвiк готовит ответ…'}</span></div></div>}
    </div>
    <nav className="murvik-chat-pages" aria-label="Страницы диалога"><button disabled={busy||page===0} onClick={()=>setPage(p=>Math.max(0,p-1))}>← Назад</button><span>{Math.min(page+1,pages.length)} / {pages.length}</span><button disabled={busy||page>=pages.length-1} onClick={()=>setPage(p=>Math.min(pages.length-1,p+1))}>Далее →</button></nav>
    <div className="murvik-chat-announcement" role="status">{busy?'Мурвiк готовит ответ':''}</div>
    <div className="murvik-suggestions" aria-label="Можно спросить">{(latest.suggestions||[]).map(text=><button key={text} disabled={busy} onClick={()=>send(text)}>{text}</button>)}</div>
    <form className="murvik-compose" onSubmit={e=>{e.preventDefault();send();}}>
      <label className="murvik-sr-only" htmlFor="murvik-question">Вопрос Мурвiку</label>
      <textarea ref={input} id="murvik-question" rows={2} maxLength={400} value={draft} placeholder="О чём хочешь узнать?" onChange={e=>{setDraft(e.target.value);if(!busy)setStatus('listening');}} onFocus={()=>{if(!busy)setStatus('listening');}} onBlur={()=>{if(!busy)setStatus('idle');}} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.nativeEvent.isComposing){e.preventDefault();send();}}}/>
      <button type="submit" disabled={busy||!draft.trim()} aria-label="Отправить вопрос">↑</button>
    </form><div className="murvik-compose-note"><span>Enter — отправить · Shift + Enter — новая строка</span><span>{draft.length}/400</span></div>
  </div>;
}
