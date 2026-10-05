import React,{useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {motion,useReducedMotion} from 'framer-motion';
import {X,RotateCcw,Pause,Play} from 'lucide-react';
import './minsk-event.css';
const episodes=[
 {date:'29 июня — 2 июля',title:'Обход с двух сторон',text:'3-й Белорусский фронт наступает с севера, 1-й Белорусский — с юга. 2-й Белорусский преследует противника с востока.'},
 {date:'3 июля',title:'Кольцо замкнулось',text:'Советские войска освобождают Минск. Восточнее города отрезаны основные силы немецкой 4-й армии и часть 9-й армии.'},
 {date:'4–11 июля',title:'Бои внутри кольца',text:'Окружённые части пытаются прорваться на запад. Советские войска блокируют выходы; к 11 июля разгром группировки завершён.'},
];
const directions={north:'Северный охват: 3-й Белорусский фронт продвигался к Минску с севера и северо-востока.',south:'Южный охват: 1-й Белорусский фронт обходил Минск с юга и соединялся с северной группировкой.',east:'С востока: 2-й Белорусский фронт преследовал отходившие немецкие войска, не давая им оторваться.'};

export default function MinskEvent({onClose}){
 const reduced=useReducedMotion(),panel=useRef(null),[run,setRun]=useState(0),[paused,setPaused]=useState(false);
 const [phase,setPhase]=useState(reduced?1:0),[manual,setManual]=useState(false),clock=useRef(0);
 const [direction,setDirection]=useState(null);
 const inspect=id=>{setDirection(v=>v===id?null:id);setPaused(true);setManual(true)};
 useEffect(()=>{clock.current=0;setDirection(null);setPhase(reduced?1:0);setManual(false)},[run,reduced]);
 useEffect(()=>{if(reduced||paused||manual)return;const timer=setInterval(()=>{clock.current+=150;setPhase(clock.current<4000?0:clock.current<8000?1:2)},150);return()=>clearInterval(timer)},[paused,manual,reduced,run]);
 useEffect(()=>{const previous=document.activeElement,old=document.body.style.overflow;document.body.style.overflow='hidden';panel.current?.focus();const key=e=>{if(e.key==='Escape'){e.stopImmediatePropagation();onClose()}if(e.key==='Tab'){const buttons=[...panel.current.querySelectorAll('button,a,[role=button]')];const first=buttons[0],last=buttons.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}};document.addEventListener('keydown',key,true);return()=>{document.body.style.overflow=old;document.removeEventListener('keydown',key,true);previous?.focus()}},[onClose]);
 return createPortal(<motion.div className="minsk-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose}>
  <section ref={panel} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="minsk-title" className={'minsk-event '+(paused?'is-paused':'')} onClick={e=>e.stopPropagation()}>
   <img loading="lazy" decoding="async" className="minsk-landscape" src="/assets/events/minsk-encirclement.webp" alt="Художественный образ белорусской местности, созданный с помощью ИИ"/>
   <div className="minsk-shade"/>
   <header><div><span>29 ИЮНЯ — 11 ИЮЛЯ 1944</span><h2 id="minsk-title">Минское окружение</h2></div><button onClick={onClose} aria-label="Закрыть событие"><X/></button></header>
   <div className="minsk-sides"><div><img loading="lazy" decoding="async" src="/assets/personnel/soviet-helmet.lossless.webp" alt=""/><p><b>Красная армия</b><span>3-й и 1-й Белорусские — охват<br/>2-й Белорусский — с востока</span></p></div><div><img loading="lazy" decoding="async" src="/assets/personnel/german-helmet.lossless.webp" alt=""/><p><b>Вермахт</b><span>Основные силы 4-й армии<br/>и части 9-й армии</span></p></div></div>
   <div key={run} data-phase={phase} data-direction={direction||''} className={'minsk-action '+(reduced||manual?'is-static':'')} role="group" aria-label="Интерактивная схема окружения">
    <svg viewBox="0 0 1000 360" aria-label="Направления ударов"><defs><marker id="minsk-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10L3 5Z" fill="#f0d393"/></marker></defs>
     {[['north','M890 35C640 0 210 20 180 150','Северный охват'],['south','M900 325C660 360 210 345 180 210','Южный охват'],['east','M970 180H850','Удар с востока']].map(([id,d,label])=><g key={id} className={'minsk-vector '+id} role="button" tabIndex={0} aria-label={label} aria-pressed={direction===id} onClick={()=>inspect(id)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();inspect(id)}}}><path className={'minsk-route '+id} d={d} pathLength="1" markerEnd="url(#minsk-arrow)"/><path className="minsk-route-hit" d={d}/></g>)}
     <ellipse className="minsk-ring" cx="505" cy="180" rx="325" ry="125" pathLength="1"/>
     <g className="minsk-enemy"><image href="/assets/scale/enemy-assault-gun-steel.lossless.webp" x="445" y="95" width="135" height="85"/>{[[320,180],[620,180],[405,235],[540,235]].map(([x,y],i)=><image key={i} className="minsk-unit" href="/assets/personnel/german-helmet.lossless.webp" x={x} y={y} width="80" height="60"/>)}</g>
     <image href="/assets/personnel/soviet-helmet.lossless.webp" x="745" y="0" width="75" height="55"/><image href="/assets/personnel/soviet-helmet.lossless.webp" x="750" y="302" width="75" height="55"/>
     <circle className="minsk-junction" cx="180" cy="180" r="9" fill="#fff1cc"/>
     <image className="minsk-moving-tank north" href="/assets/tech/catalog/t34.lossless.webp" x="105" y="98" width="120" height="76"/>
     <image className="minsk-moving-tank south" href="/assets/tech/catalog/t3476.lossless.webp" x="105" y="188" width="120" height="76"/>
    </svg>
   </div>
   <div className="minsk-outcome"><strong>Более 100 000</strong><span>немецких военнослужащих в окружении восточнее Минска</span></div>
   <nav className="minsk-episodes" aria-label="Ход Минского окружения">{episodes.map((item,i)=><button key={item.date} aria-pressed={phase===i} onClick={()=>{setPhase(i);setDirection(null);setManual(true);setPaused(true)}}><span>{item.date}</span><b>{item.title}</b></button>)}</nav>
   <footer><p aria-live="polite">{direction?directions[direction]:episodes[phase].text}</p><div><button onClick={()=>{if(paused&&manual)setRun(v=>v+1);setPaused(v=>!v)}} aria-label={paused?'Продолжить анимацию':'Остановить анимацию'}>{paused?<Play size={18}/>:<Pause size={18}/>}</button><button onClick={()=>{setRun(v=>v+1);setPaused(false)}} aria-label="Повторить событие"><RotateCcw size={18}/></button><a href="https://pamyat-naroda.ru/ops/minskaya-nastupatelnaya-operatsiya-operatsiya-5-go-udara/" target="_blank" rel="noreferrer">Источник ↗</a></div></footer>
   <small className="minsk-note">Художественная схема</small>
  </section>
 </motion.div>,document.body);
}
