import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useInView, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { ArrowDown, ArrowLeft, ArrowRight, Bookmark, Check, Compass, Maximize2, Pause, Play, RotateCcw, X } from 'lucide-react';
import './cinema.css';
import BagrationMap from './BagrationMap.jsx';
import heroBackground from '../фоновое изображение.png';

const source='https://museum-artillery.ru/ru/operacziya-bagration.html';
export const chapters=[
 {name:'Витебск',key:'vitebsk',date:'26 ИЮНЯ 1944',tag:'СЕВЕРНЫЙ УЗЕЛ',map:2,kind:'north',text:'Северное направление. Рассмотрите, как несколько направлений складываются в общий замысел.'},
 {name:'Орша',key:'orsha',date:'27 ИЮНЯ 1944',tag:'ОСЬ ДВИЖЕНИЯ',map:3,kind:'axis',text:'Дороги, реки, направления. Один маршрут становится частью большой оперативной картины.'},
 {name:'Могилёв',key:'mogilev',date:'28 ИЮНЯ 1944',tag:'РЕЧНОЙ РУБЕЖ',map:4,kind:'river',text:'Водные преграды задают ритм движения. Изучите связи между местностью и направлением удара.'},
 {name:'Бобруйск',key:'bobruisk',date:'29 ИЮНЯ 1944',tag:'КОЛЬЦО ОКРУЖЕНИЯ',map:5,kind:'ring',text:'Южное направление. Схема показывает идею охвата, а не точное положение отдельных соединений.'},
 {name:'Минск',key:'minsk',date:'3 ИЮЛЯ 1944',tag:'СХОЖДЕНИЕ НАПРАВЛЕНИЙ',map:6,kind:'converge',text:'3 июля был освобождён Минск. Несколько направлений соединяются в одной из ключевых точек операции.'},
];
const beats=[
 {date:'22.06',title:'Накануне',text:'Беларусь. Лето 1944. Пространство будущего наступления.',stage:-1},
 {date:'23.06',title:'Начало',text:'Четыре фронта начинают согласованное наступление.',stage:0},
 {date:'26.06',title:'Витебск',text:'Витебск освобождён; окружённый узел немецкой обороны ликвидирован.',stage:1},
 {date:'27.06',title:'Орша',text:'Войска освобождают важный узел на магистрали к Минску.',stage:2},
 {date:'28.06',title:'Могилёв',text:'После форсирования Днепра освобождён Могилёв.',stage:3},
 {date:'29.06',title:'Бобруйск',text:'На юге завершено окружение немецкой группировки.',stage:4},
 {date:'03.07',title:'Минск',text:'Освобождён Минск. Наступление продолжается на запад.',stage:5},
 {date:'29.08',title:'Дальше на запад',text:'Операция завершилась за пределами показанной карты Беларуси.',stage:6},
];
const Context=createContext(null);
const useCinema=()=>useContext(Context);
const go=id=>document.getElementById(id)?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});

export function AtlasArt({stage=4,modern=false,selected=-1,className=''}) {
 const phase=stage<0?0:([1,2,3,4,5,6,8][Math.min(stage,6)]??6);
 return <BagrationMap className={'cinema-atlas '+className} stage={phase} modern={modern} selectedCity={selected>=0?chapters[selected]?.key:null} layers={{front:!modern,routes:!modern,cities:true,fronts:false,rail:false,partisans:false,battles:!modern,memory:false}}/>;
}

function Modal({title,onClose,children,className=''}) {
 const ref=useRef(null);const previous=useRef(document.activeElement);
 useEffect(()=>{const old=document.body.style.overflow;document.body.style.overflow='hidden';ref.current?.focus();const key=e=>{if(e.key==='Escape')onClose();if(e.key==='Tab'){const items=[...ref.current.querySelectorAll('button,a,input,select')].filter(el=>!el.disabled&&el.getClientRects().length);const first=items[0],last=items.at(-1);if(e.shiftKey&&(document.activeElement===first||document.activeElement===ref.current)){e.preventDefault();last?.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}}};document.addEventListener('keydown',key);return()=>{document.body.style.overflow=old;document.removeEventListener('keydown',key);previous.current?.focus()}},[onClose]);
 return createPortal(<motion.div className={'cinema-modal '+className} ref={ref} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><header><span>Б / ИССЛЕДОВАТЕЛЬСКИЙ РЕЖИМ</span><button onClick={onClose} aria-label="Закрыть режим"><X size={22}/></button></header>{children}</motion.div>,document.body);
}

export function CinemaProvider({children}) {
 const [mode,setMode]=useState(null),[saved,setSaved]=useState(()=>{try{return JSON.parse(localStorage.getItem('bagration-route-v1')||'[]').filter(i=>Number.isInteger(i)&&i>=0&&i<5)}catch{return []}});
 const toggle=i=>setSaved(a=>a.includes(i)?a.filter(n=>n!==i):[...a,i]);
 useEffect(()=>{try{localStorage.setItem('bagration-route-v1',JSON.stringify(saved))}catch{}},[saved]);
 const close=React.useCallback(()=>setMode(null),[]);
 return <Context.Provider value={{setMode,saved,toggle}}>{children}<AnimatePresence>{mode==='film'?<Documentary key="film" onClose={close}/>:mode&&<ResearchRoom key="room" mode={mode} onClose={close}/>}</AnimatePresence></Context.Provider>;
}

function CountUp({value,delay=0}){
 const reduced=useReducedMotion(),[shown,setShown]=useState(reduced?value:0);
 useEffect(()=>{if(reduced){setShown(value);return}let frame=0,timer=0;timer=window.setTimeout(()=>{const started=performance.now(),duration=2200;const tick=now=>{const progress=Math.min(1,(now-started)/duration);const eased=1-Math.pow(1-progress,3);setShown(value*eased);if(progress<1)frame=requestAnimationFrame(tick)};frame=requestAnimationFrame(tick)},delay);return()=>{clearTimeout(timer);cancelAnimationFrame(frame)}},[value,delay,reduced]);
 return <strong>{shown.toFixed(1).replace('.',',')}</strong>;
}

export function CinemaIntro(){
 const reduced=useReducedMotion();
 const cover=useRef(null);
 const move=e=>{if(reduced||e.pointerType==='touch')return;const r=e.currentTarget.getBoundingClientRect();cover.current?.style.setProperty('--pointer-x',`${((e.clientX-r.left)/r.width*100).toFixed(2)}%`);cover.current?.style.setProperty('--pointer-y',`${((e.clientY-r.top)/r.height*100).toFixed(2)}%`);cover.current?.style.setProperty('--drift-x',`${(((e.clientX-r.left)/r.width-.5)*-12).toFixed(2)}px`);cover.current?.style.setProperty('--drift-y',`${(((e.clientY-r.top)/r.height-.5)*-8).toFixed(2)}px`)};
 return <section ref={cover} onPointerMove={move} className="cinema-intro" id="hero" style={{'--hero-image':`url("${heroBackground}")`}}>
  <motion.div className="intro-landscape" initial={reduced?false:{opacity:0,scale:1.035}} animate={{opacity:1,scale:1}} transition={{duration:reduced?0:1.8,ease:[.22,1,.36,1]}}/>
  <div className="intro-grade"/><div className="intro-warm-glow"/><div className="intro-vignette"/><div className="intro-grain"/><div className="intro-pointer-light"/>
  <div className="intro-smoke" aria-hidden="true"><i/><i/><i/><i/></div>
  <div className="intro-sparks" aria-hidden="true">{Array.from({length:18},(_,i)=><i key={i} style={{left:`${4+(i*37)%72}%`,animationDelay:`-${(i*1.73%10).toFixed(2)}s`,animationDuration:`${7.5+(i%5)*1.25}s`}}/>)}</div>
  <div className="intro-map-response" aria-hidden="true"><i className="map-signal signal-vitebsk"/><i className="map-signal signal-minsk"/></div>
  <div className="intro-frame intro-frame-left" aria-hidden="true"/><div className="intro-frame intro-frame-right" aria-hidden="true"/>
  <div className="intro-embers" aria-hidden="true">{Array.from({length:8},(_,i)=><i key={i}/>)}</div>
  <div className="intro-content">
   <motion.div className="intro-date" initial={reduced?false:{opacity:0,y:14,filter:'blur(5px)'}} animate={{opacity:1,y:0,filter:'blur(0px)'}} transition={{duration:reduced?0:.8,delay:reduced?0:.2}}><b>23 ИЮНЯ</b><strong>1944</strong><span>НАЧАЛО НАСТУПЛЕНИЯ</span></motion.div>
   <motion.div className="intro-title" initial={reduced?false:{opacity:0,y:30,filter:'blur(9px)'}} animate={{opacity:1,y:0,filter:'blur(0px)'}} transition={{duration:reduced?0:1,delay:reduced?0:.42,ease:[.22,1,.36,1]}}>
    <span className="intro-kicker"><i/> ОПЕРАЦИЯ</span><h1 aria-label="Операция «Багратион»"><span><b>«БАГРА</b><em>ТИОН»</em></span></h1><p>ОСВОБОЖДЕНИЕ БЕЛАРУСИ · ЛЕТО 1944</p>
   </motion.div>
  </div>
  <motion.aside className="intro-facts" initial={reduced?false:{opacity:0,x:24}} animate={{opacity:1,x:0}} transition={{duration:reduced?0:.9,delay:reduced?0:.8}} aria-label="Силы, задействованные в операции">
   <header><span>МАСШТАБ ОПЕРАЦИИ</span><small>СОВЕТСКИЕ СИЛЫ</small></header>
   <div className="intro-fact"><CountUp value={2.4} delay={550}/><small>МЛН ЧЕЛОВЕК</small></div>
   <div className="intro-fact"><CountUp value={36.4} delay={700}/><small>ТЫС. ОРУДИЙ</small></div>
   <div className="intro-fact"><CountUp value={5.2} delay={850}/><small>ТЫС. ТАНКОВ И САУ</small></div>
   <div className="intro-fact"><CountUp value={5.3} delay={1000}/><small>ТЫС. САМОЛЁТОВ</small></div>
  </motion.aside>
  <motion.div className="intro-bottom" initial={reduced?false:{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:reduced?0:.8,delay:reduced?0:1.05}}><span>01 — ПРОСТРАНСТВО ИСТОРИИ</span><a className="intro-scroll" href="#intro"><i/> ПРОЛИСТАЙТЕ ВНИЗ <ArrowDown size={17}/></a><span>23.06 — 29.08.1944</span></motion.div>
 </section>;
}

export function OperationScroll(){
 const ref=useRef(null),reduced=useReducedMotion();const [index,setIndex]=useState(0);const {scrollYProgress}=useScroll({target:ref,offset:['start start','end end']});
 useMotionValueEvent(scrollYProgress,'change',v=>{if(!reduced)setIndex(Math.min(7,Math.floor(v*8)))});
 const jump=i=>{setIndex(i);if(!reduced){const el=ref.current;window.scrollTo({top:el.offsetTop+(el.offsetHeight-innerHeight)*(i+.2)/8,behavior:'instant'})}};
 const b=beats[index];
 return <section id="operation-scroll" className="operation-scroll" ref={ref}><div className="operation-pin"><div className="scene-eyebrow"><span>ОСНОВНЫЕ ЭТАПЫ / ИСТОРИЯ В ДВИЖЕНИИ</span><span>{reduced?'ВЫБИРАЙТЕ ЭТАПЫ':'ПРОКРУТКА УПРАВЛЯЕТ ВРЕМЕНЕМ'} ↓</span></div><div className="operation-map"><AtlasArt stage={b.stage} selected={Math.min(4,b.stage)}/></div><div className="operation-watermark">1944</div><AnimatePresence mode="wait"><motion.div className="operation-copy" key={index} initial={{opacity:0,y:25}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-15}}><span>{String(index+1).padStart(2,'0')} / 08</span><strong>{b.date}</strong><h2>{b.title}</h2><p>{b.text}</p><small>СХЕМАТИЧЕСКАЯ РЕКОНСТРУКЦИЯ</small></motion.div></AnimatePresence><div className="operation-photo"><img src="/assets/bagration-hero.webp" alt="Художественная реконструкция ландшафта" loading="lazy"/><span>ОБРАЗ ЭПОХИ / ИИ-РЕКОНСТРУКЦИЯ</span></div><nav className="operation-rail" aria-label="Этапы скролл-истории">{beats.map((b,i)=><button key={i} onClick={()=>jump(i)} className={index===i?'active':''} aria-current={index===i?'step':undefined}><i/><span>{b.title}</span></button>)}</nav><a className="scene-source" href={source} target="_blank" rel="noreferrer">ИСТОРИЧЕСКАЯ СПРАВКА ↗</a><a className="skip-scene" href="#map">К КЛЮЧЕВЫМ СОБЫТИЯМ ↘</a></div></section>;
}

export function ReplayInvitation(){const {setMode}=useCinema();return <section id="replay" className="replay-invitation section"><span className="section-kicker">ПОВТОРЕНИЕ / ПОСЛЕ ИССЛЕДОВАНИЯ</span><div><h2>«БАГРАТИОН»<br/><em>ЗА 90 СЕКУНД</em></h2><p>Вы изучили замысел, людей и ход операции. Теперь просмотрите всю хронологию целиком.</p></div><button className="primary-btn" onClick={()=>setMode('film')}><span>СМОТРЕТЬ ПОВТОРЕНИЕ</span><Play size={18}/></button></section>}

export function DepthScene(){
 const ref=useRef(null),reduced=useReducedMotion(),inView=useInView(ref);const rawX=useMotionValue(0),rawY=useMotionValue(0),x=useSpring(rawX,{stiffness:45,damping:20}),y=useSpring(rawY,{stiffness:45,damping:20});const {scrollYProgress}=useScroll({target:ref,offset:['start end','end start']});const drift=useTransform(scrollYProgress,[0,1],[70,-70]);
 const move=e=>{if(reduced||!inView||e.pointerType==='touch')return;const r=e.currentTarget.getBoundingClientRect();rawX.set((e.clientX-r.left)/r.width*10-5);rawY.set(5-(e.clientY-r.top)/r.height*10)};
 return <section id="summer" className="depth-scene" ref={ref} onPointerMove={move} onPointerLeave={()=>{rawX.set(0);rawY.set(0)}}><div className="depth-heading"><span>ПРОСТРАНСТВО / ВРЕМЯ / СЛЕД</span><h2>ЛЕТО<br/><em>1944</em></h2><p>Одна история.<br/>Несколько слоёв памяти.</p></div><motion.div className="depth-stage" style={reduced?{}:{rotateY:x,rotateX:y,y:drift}}><div className="depth-map"><AtlasArt stage={4}/></div><div className="depth-thread"/><a className="depth-photo" href="#partisans"><img src="/assets/partisans-night.webp" loading="lazy" alt="Художественная ИИ-реконструкция ночной сцены"/><span>01 / ОБРАЗ ЭПОХИ ↗</span></a><a className="depth-paper" href="#map"><span>ПОЛЕВОЙ АТЛАС / МАКЕТ</span><strong>23<br/>ИЮНЯ</strong><p>Направления.<br/>Переправы.<br/>Связи.</p><small>ОТКРЫТЬ ХРОНОЛОГИЮ ↗</small></a></motion.div><div className="depth-foot">МЕНЯЙТЕ УГОЛ ВЗГЛЯДА · ВЫБИРАЙТЕ СЛОИ</div></section>;
}

export function StageJourney({onMap}){
 const [index,setIndex]=useState(0);const {saved,toggle,setMode}=useCinema();const c=chapters[index];const touch=useRef(null);
 return <section id="cities" className="stage-journey"><div className="scene-eyebrow"><span>ПЯТЬ УЗЛОВ / ОДИН ЗАМЫСЕЛ</span><button onClick={()=>setMode('compare')}>СОПОСТАВИТЬ НАПРАВЛЕНИЯ <Maximize2 size={13}/></button></div><nav className="stage-tabs" aria-label="Города операции">{chapters.map((c,i)=><button key={c.name} aria-pressed={index===i} onClick={()=>setIndex(i)}><small>0{i+1}</small>{c.name}</button>)}</nav><div className={'journey-viewport layout-'+c.kind} tabIndex={0} aria-label="Путешествие по этапам, используйте стрелки" onKeyDown={e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();setIndex(i=>Math.max(0,Math.min(4,i+(e.key==='ArrowRight'?1:-1))))}}} onTouchStart={e=>{touch.current=e.touches[0].clientX}} onTouchEnd={e=>{const dx=e.changedTouches[0].clientX-touch.current;if(Math.abs(dx)>60)setIndex(i=>Math.max(0,Math.min(4,i+(dx<0?1:-1))))}}><AnimatePresence mode="wait"><motion.div className={'journey-scene '+c.kind} key={index} initial={{opacity:0,x:80}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-80}} transition={{duration:.45}}><div className="journey-number">0{index+1}</div><div className="journey-map"><AtlasArt stage={4} selected={index}/></div>{index===3&&<div className="encirclement"><i/><i/><span>ОХВАТ<br/>С ДВУХ СТОРОН</span></div>}{index===1&&<img className="journey-image" src="/assets/bagration-hero.webp" alt="Художественный образ, не фотография Орши" loading="lazy"/>}<div className="journey-copy"><span>{c.date} / {c.tag}</span><h2>{c.name}</h2><p>{c.text}</p><div><button className="text-btn" onClick={()=>onMap(c.map)}>ИСCЛЕДОВАТЬ НА КАРТЕ <ArrowRight size={15}/></button><button className="save-stage" aria-label={'Отметить этап '+c.name} aria-pressed={saved.includes(index)} onClick={()=>toggle(index)}>{saved.includes(index)?<Check size={16}/>:<Bookmark size={16}/>}</button></div></div><span className="journey-note">АВТОРСКАЯ ВИЗУАЛИЗАЦИЯ / НЕ В МАСШТАБЕ</span></motion.div></AnimatePresence></div><div className="journey-controls"><button disabled={index===0} onClick={()=>setIndex(i=>i-1)} aria-label="Предыдущий город"><ArrowLeft/></button><span>0{index+1}<i/>05 <small>ЛИСТАЙТЕ ИЛИ ИСПОЛЬЗУЙТЕ ← →</small></span><button disabled={index===4} onClick={()=>setIndex(i=>i+1)} aria-label="Следующий город"><ArrowRight/></button></div></section>;
}

export function TimeRift(){
 const [value,setValue]=useState(46);
 const move=e=>{const r=e.currentTarget.getBoundingClientRect();setValue(Math.round(Math.max(0,Math.min(100,100-(e.clientX-r.left)/r.width*100))))};
 return <section id="then-now" className={'time-rift '+(value>50?'era-modern':'era-archive')} style={{'--rift':value+'%'}}>
  <div className="rift-title"><span>ОДНА ЗЕМЛЯ / ДВА ВЗГЛЯДА</span><h2>РАЗРЫВ <em>ВРЕМЕНИ</em></h2><p>Двигайте границу между оперативной схемой и пространством памяти.</p></div>
  <div className="rift-window" onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);move(e)}} onPointerMove={e=>{if(e.currentTarget.hasPointerCapture(e.pointerId))move(e)}} onPointerUp={e=>{if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId)}}>
   <div className="rift-present"><AtlasArt modern/><span className="era-numeral">2026</span></div><div className="rift-past"><AtlasArt stage={4}/><span className="era-numeral">1944</span></div><div className="rift-seam"><i/><b>↔</b><i/></div><div className="rift-readout"><span>{value>50?'ПАМЯТЬ / МЕСТА':'ИСТОРИЯ / НАПРАВЛЕНИЯ'}</span><strong>{value>50?'Следы остаются.':'Линии движутся.'}</strong></div>
  </div><div className="rift-slider"><span>1944</span><input aria-label="Граница эпох" type="range" min="0" max="100" value={value} onChange={e=>setValue(+e.target.value)}/><span>2026</span></div><small className="rift-note">ДВЕ АВТОРСКИЕ СХЕМЫ · НЕ СРАВНЕНИЕ ПОДЛИННЫХ ФОТОГРАФИЙ И НЕ СОВРЕМЕННАЯ ГЕОГРАФИЧЕСКАЯ КАРТА</small>
 </section>;
}

function Documentary({onClose}){
 const [time,setTime]=useState(0),[playing,setPlaying]=useState(true),[transcript,setTranscript]=useState(false);const reduced=useReducedMotion();
 useEffect(()=>{if(!playing||time>=90)return;let last=performance.now();const timer=setInterval(()=>{const now=performance.now();if(!document.hidden)setTime(t=>Math.min(90,t+(now-last)/1000));last=now},200);return()=>clearInterval(timer)},[playing,time>=90]);
 const index=Math.min(7,Math.floor(time/90*8)),b=beats[index];
 return <Modal title="90 секунд: операция Багратион" className="documentary" onClose={onClose}><div className="film-matte"><motion.div className="film-camera" animate={reduced?{}:{scale:1+index*.035,x:-index*12,y:index*-4}} transition={{duration:3}}><AtlasArt stage={b.stage} selected={Math.min(4,b.stage)}/></motion.div><div className="film-shade"/><span className="film-label">90 СЕКУНД / ВИЗУАЛЬНЫЙ РАССКАЗ БЕЗ ОЗВУЧКИ</span><AnimatePresence mode="wait"><motion.div key={index} className="film-copy" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0}}><span>{b.date} / 1944</span><h2>{b.title}</h2><p>{b.text}</p></motion.div></AnimatePresence><div className="film-image"><img src={index===5?'/assets/partisans-night.webp':'/assets/bagration-hero.webp'} alt="Художественная ИИ-реконструкция"/><small>ХУДОЖЕСТВЕННЫЙ ОБРАЗ / НЕ ДОКУМЕНТ</small></div>{time>=90&&<div className="film-end"><h3>История продолжается.</h3><button onClick={()=>{setTime(0);setPlaying(true)}}><RotateCcw size={18}/> СМОТРЕТЬ СНОВА</button><button onClick={()=>{onClose();go('map')}}>ИССЛЕДОВАТЬ САМОСТОЯТЕЛЬНО <ArrowRight size={18}/></button></div>}</div><div className="film-controls"><button onClick={()=>setPlaying(v=>!v)} disabled={time>=90} aria-label={playing?'Пауза фильма':'Продолжить фильм'}>{playing?<Pause/>:<Play/>}</button><span>{String(Math.floor(time)).padStart(2,'0')} / 90 СЕК</span><input aria-label="Время фильма" type="range" min="0" max="90" step=".1" value={time} onChange={e=>setTime(+e.target.value)}/><button aria-expanded={transcript} onClick={()=>setTranscript(v=>!v)}>ЛЕНТА СОБЫТИЙ</button></div>{transcript&&<nav className="film-transcript" aria-label="Лента событий фильма">{beats.map((b,i)=><button key={i} className={i===index?'active':''} onClick={()=>setTime(i*90/8)}><span>{String(Math.floor(i*90/8)).padStart(2,'0')}″</span><strong>{b.title}</strong><small>{b.text}</small></button>)}</nav>}<a className="film-source" href={source} target="_blank" rel="noreferrer">ИСТОРИЧЕСКАЯ СПРАВКА: ВОЕННО-ИСТОРИЧЕСКИЙ МУЗЕЙ АРТИЛЛЕРИИ ↗</a></Modal>;
}

function ResearchRoom({mode,onClose}){
 const {setMode,saved,toggle}=useCinema();const [left,setLeft]=useState(0),[right,setRight]=useState(3);
 return <Modal title="Маршруты исследования" className="research-room" onClose={onClose}><div className="room-heading"><span>ВАША ТОЧКА ВХОДА</span><h2>{mode==='compare'?'ДВА НАПРАВЛЕНИЯ':mode==='notebook'?'ЛИЧНЫЙ МАРШРУТ':'КАК ВЫ ХОТИТЕ ИССЛЕДОВАТЬ?'}</h2><nav>{[['routes','Маршруты'],['notebook','Мои отметки'],['compare','Сопоставление']].map(([id,label])=><button key={id} aria-pressed={mode===id} onClick={()=>setMode(id)}>{label}</button>)}</nav></div>{mode==='routes'?<div className="route-choices">{[['01','ПО ВРЕМЕНИ','От первого рубежа к завершению операции.','map'],['02','ПО ПРОСТРАНСТВУ','Города и направления на интерактивной карте.','map']].map(([n,title,text,id])=><button key={n} onClick={()=>{onClose();go(id)}}><b>{n}</b><Compass/><h3>{title}</h3><p>{text}</p><ArrowRight/></button>)}</div>:mode==='compare'?<div className="comparison-room">{[[left,setLeft],[right,setRight]].map(([index,set],side)=><article key={side}><select aria-label={side?'Правое направление':'Левое направление'} value={index} onChange={e=>set(+e.target.value)}>{chapters.map((c,i)=><option key={c.name} value={i}>{c.name}</option>)}</select><AtlasArt stage={4} selected={index}/><span>{chapters[index].tag}</span><p>{chapters[index].text}</p><button onClick={()=>toggle(index)}>{saved.includes(index)?'✓ В МАРШРУТЕ':'+ В МОЙ МАРШРУТ'}</button></article>)}</div>:<div className="notebook-room"><p>Отмечайте города в горизонтальном путешествии. Ваш выбор сохраняется в этом браузере.</p>{saved.length===0?<button onClick={()=>{onClose();go('map')}}>ВЫБРАТЬ ПЕРВЫЙ ЭТАП <ArrowRight/></button>:saved.map((index,i)=><article key={index}><span>0{i+1}</span><h3>{chapters[index].name}</h3><p>{chapters[index].tag}</p><button onClick={()=>{onClose();go('map')}}>К ЭТАПАМ ↗</button><button aria-label={'Убрать '+chapters[index].name} onClick={()=>toggle(index)}><X size={18}/></button></article>)}</div>}<div className="room-foot">ИНДИВИДУАЛЬНЫЙ МАРШРУТ · БЕЗ РЕГИСТРАЦИИ · ДАННЫЕ ОСТАЮТСЯ В ВАШЕМ БРАУЗЕРЕ</div></Modal>;
}


