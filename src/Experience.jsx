import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown, ArrowRight, Check, Maximize2, RotateCcw, Search, X, ZoomIn } from 'lucide-react';
import './experience.css';

export function ExperienceMotion() {
  const reduced = useReducedMotion();
  useEffect(() => {
    const sections = [...document.querySelectorAll('main section, .hero, footer')];
    const observer = new IntersectionObserver(entries => entries.forEach(({ target, isIntersecting }) => {
      target.classList.toggle('in-view', isIntersecting);
      if (isIntersecting) target.classList.add('has-entered');
    }), { rootMargin: '60px', threshold: 0 });
    sections.forEach(el => observer.observe(el));
    if (reduced || !matchMedia('(pointer:fine)').matches) return () => observer.disconnect();
    let frame = 0, target = null, rect = null;
    const selector = '.tech-ribbon>button,.commander-info,.prehistory-map,.archive-sheet,.strategy-brief,.primary-btn';
    const reset = () => {
      if (target) { target.style.setProperty('--rx','0deg'); target.style.setProperty('--ry','0deg'); target.classList.remove('pointer-depth'); }
    };
    const move = event => {
      const next = event.target.closest(selector);
      if (next !== target) { reset(); target = next; rect = next?.getBoundingClientRect(); }
      if (!target || frame) return;
      const { clientX, clientY } = event;
      frame = requestAnimationFrame(() => {
        if (target && rect) {
          const x = Math.max(0, Math.min(1,(clientX-rect.left)/rect.width));
          const y = Math.max(0, Math.min(1,(clientY-rect.top)/rect.height));
          target.classList.add('pointer-depth');
          target.style.setProperty('--rx', `${(y-.5)*-4}deg`);
          target.style.setProperty('--ry', `${(x-.5)*5}deg`);
          target.style.setProperty('--light-x', `${x*100}%`);
          target.style.setProperty('--light-y', `${y*100}%`);
        }
        frame=0;
      });
    };
    const leave = () => {reset();target=null;rect=null;};
    document.addEventListener('pointermove',move,{passive:true});
    document.addEventListener('pointerleave',leave);
    window.addEventListener('scroll',leave,{passive:true});
    return () => {observer.disconnect();cancelAnimationFrame(frame);document.removeEventListener('pointermove',move);document.removeEventListener('pointerleave',leave);window.removeEventListener('scroll',leave);reset();};
  },[reduced]);
  return null;
}

export function Passage() {
  const ref = useRef(null), reduced = useReducedMotion();
  const {scrollYProgress} = useScroll({target:ref,offset:['start start','end end']});
  const scale = useTransform(scrollYProgress,[0,.8],[1,1.16]);
  const dateScale = useTransform(scrollYProgress,[0,.68],[1,2.7]);
  const dateOpacity = useTransform(scrollYProgress,[0,.25,.65],[.95,.95,0]);
  const opacity = useTransform(scrollYProgress,[.38,.72],[0,1]);
  const pathLength = useTransform(scrollYProgress,[.3,.9],[0,1]);
  return <section className="passage" ref={ref} aria-label="От ландшафта к карте">
    <div className="passage-pin">
      <motion.img className="passage-image" src="/assets/bagration-hero.webp" alt="Художественная реконструкция белорусского ландшафта" loading="lazy" style={reduced?{}:{scale}}/>
      <div className="passage-shade"/>
      <motion.div className="passage-date" style={reduced?{}:{scale:dateScale,opacity:dateOpacity}}>19<span>44</span></motion.div>
      <motion.div className="passage-caption" style={reduced?{}:{opacity}}><span>ЛАНДШАФТ СТАНОВИТСЯ КАРТОЙ</span><h2>ЗА КАЖДОЙ ЛИНИЕЙ —<br/><em>ЧЕЛОВЕЧЕСКАЯ ИСТОРИЯ</em></h2><a href="#map">ПЕРЕЙТИ К АТЛАСУ <ArrowDown size={16}/></a></motion.div>
      <svg className="passage-route" viewBox="0 0 1400 650" preserveAspectRatio="none" aria-hidden="true"><motion.path d="M1420 70 C980 50 1150 260 860 300 S600 270 500 460 S220 490 -20 630" style={reduced?{}:{pathLength}}/></svg>
      <div className="passage-foot"><span>БЕЛАРУСЬ / ЛЕТО 1944</span><span>ХУДОЖЕСТВЕННАЯ РЕКОНСТРУКЦИЯ</span><span>↓ ПРОДОЛЖАЙТЕ ПРОКРУТКУ</span></div>
    </div>
  </section>;
}

const collection = [
  {id:'01',title:'Перед наступлением',type:'Изображения',visual:'landscape',date:'Лето 1944 · образ эпохи',note:'Панорамная художественная реконструкция. Создана с помощью ИИ; не является архивной фотографией.',stage:1},
  {id:'02',title:'Линии на карте',type:'Схемы',visual:'plan',date:'Схематическая композиция',note:'Авторская схема направлений. Геометрия условна и не предназначена для измерений.',stage:2},
  {id:'03',title:'Полевые заметки',type:'Документы',visual:'paper',date:'Макет архивного листа',note:'Демонстрационный документ для исследования интерфейса. Не воспроизводит исторический приказ.',stage:4},
  {id:'04',title:'Невидимый фронт',type:'Изображения',visual:'forest',date:'Лето 1944 · образ эпохи',note:'Художественная реконструкция ночной сцены. Создана с помощью ИИ; не документальное свидетельство.',stage:5},
];

function ArchiveArt({item}) {
  if (item.visual==='landscape'||item.visual==='forest') return <img draggable={false} loading="lazy" src={item.visual==='forest'?'/assets/partisans-night.webp':'/assets/bagration-hero.webp'} alt={item.title+' — художественная реконструкция'}/>;
  if (item.visual==='plan') return <svg viewBox="0 0 500 380" className="sheet-plan" aria-label="Условная схема"><defs><pattern id="sheetGrid" width="25" height="25" patternUnits="userSpaceOnUse"><path d="M25 0H0V25" fill="none" stroke="currentColor" opacity=".18"/></pattern></defs><rect width="500" height="380" fill="url(#sheetGrid)"/>{[0,1,2,3,4,5].map(i=><path key={i} d={`M${50+i*45} -20 Q${380-i*20} 110 ${230-i*25} 230 T${390-i*40} 410`} fill="none" stroke="currentColor" opacity=".26"/>)}<path d="M420 62Q305 140 322 193T110 329M466 150Q354 271 190 310" fill="none" stroke="#9f4e40" strokeWidth="3" strokeDasharray="8 4"/>{[[420,62],[322,193],[110,329]].map(([x,y])=><circle key={x} cx={x} cy={y} r="7" fill="none" stroke="#9f4e40"/>)}</svg>;
  return <div className="sheet-paper"><span>ИССЛЕДОВАТЕЛЬСКАЯ КОЛЛЕКЦИЯ</span><h4>ПОЛЕВЫЕ<br/>ЗАМЕТКИ</h4><hr/>{[72,88,60,93,80,67,87].map((w,i)=><i key={i} style={{width:w+'%'}}/>)}<b>ОБРАЗЕЦ</b><small>НЕ ИСТОРИЧЕСКИЙ ДОКУМЕНТ</small></div>;
}

function ArchiveReader({item,onClose,onMap}) {
  const [zoom,setZoom]=useState(1),[angle,setAngle]=useState(0),[back,setBack]=useState(false),[glass,setGlass]=useState(false),[positionKey,setPositionKey]=useState(0);
  const ref=useRef(null), prior=useRef(document.activeElement), dialog=useRef(null);
  useEffect(()=>{
    const previous=document.body.style.overflow;document.body.style.overflow='hidden';dialog.current?.focus();
    const key=e=>{if(e.key==='Escape')onClose();if(e.key==='Tab'){const list=[...dialog.current.querySelectorAll('button,input,a')];const first=list[0],last=list.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}};
    document.addEventListener('keydown',key);
    return()=>{document.body.style.overflow=previous;document.removeEventListener('keydown',key);prior.current?.focus()};
  },[onClose]);
  const point=e=>{const r=e.currentTarget.getBoundingClientRect();ref.current.style.setProperty('--glass-x',`${(e.clientX-r.left)/r.width*100}%`);ref.current.style.setProperty('--glass-y',`${(e.clientY-r.top)/r.height*100}%`)};
  return createPortal(<motion.div className="reader-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose}>
    <motion.div className="archive-reader" ref={dialog} role="dialog" aria-modal="true" aria-labelledby="reader-title" tabIndex={-1} initial={{y:40,scale:.95}} animate={{y:0,scale:1}} exit={{y:20,scale:.97}} onClick={e=>e.stopPropagation()}>
      <header><span>КОЛЛЕКЦИЯ / {item.id}</span><button className="reader-close" onClick={onClose} aria-label="Закрыть просмотр"><X/></button></header>
      <div className="reader-body"><div ref={ref} className={'reader-stage '+(glass?'magnifying':'')} onPointerMove={point}>
        <motion.div key={positionKey} className="reader-object" drag dragConstraints={ref} dragElastic={.12} dragMomentum={false} animate={{scale:zoom,rotate:angle,rotateY:back?180:0}} transition={{type:'spring',stiffness:120,damping:22}}>
          <div className="reader-front"><ArchiveArt item={item}/></div><div className="reader-back"><span>ОБОРОТ / {item.id}</span><h3>{item.title}</h3><p>{item.note}</p><small>ИСТОЧНИК: ВИЗУАЛЬНАЯ КОЛЛЕКЦИЯ ПРОЕКТА</small></div>
        </motion.div>
        {glass&&!back&&['forest','landscape'].includes(item.visual)&&<div className="reader-lens" style={{backgroundImage:`url(${item.visual==='forest'?'/assets/partisans-night.webp':'/assets/bagration-hero.webp'})`}}/>}
        <span className="reader-scale">{Math.round(zoom*100)}% / {angle}°</span>
      </div><aside><span className="section-kicker">{item.type} / ДЕМОНСТРАЦИОННЫЙ МАТЕРИАЛ</span><h3 id="reader-title">{item.title}</h3><p>{item.note}</p><dl><dt>ДАТА</dt><dd>{item.date}</dd><dt>ИСТОЧНИК</dt><dd>Визуальная коллекция проекта</dd></dl><button className="text-btn" onClick={()=>{onClose();onMap(item.stage)}}>СВЯЗАННЫЙ ЭТАП НА КАРТЕ <ArrowRight size={16}/></button></aside></div>
      <div className="reader-tools"><label><ZoomIn size={16}/><input aria-label="Масштаб материала" type="range" min="1" max="2.5" step=".1" value={zoom} onChange={e=>setZoom(+e.target.value)}/></label><button onClick={()=>setAngle(v=>v===6?-6:v+3)} aria-label="Повернуть материал"><RotateCcw size={16}/> ПОВОРОТ</button><button onClick={()=>setBack(v=>!v)} aria-pressed={back}>↔ ОБОРОТ</button>{['forest','landscape'].includes(item.visual)&&<button onClick={()=>{setGlass(v=>!v);setBack(false);setZoom(1);setAngle(0);setPositionKey(v=>v+1)}} aria-pressed={glass}><Search size={16}/> ЛУПА</button>}<button onClick={()=>{setZoom(1);setAngle(0);setBack(false);setGlass(false);setPositionKey(v=>v+1)}}>СБРОСИТЬ</button><span className="reader-drag-hint">ПЕРЕТАЩИТЕ МАТЕРИАЛ ДЛЯ ПЕРЕМЕЩЕНИЯ</span></div>
    </motion.div>
  </motion.div>, document.body);
}

export function ArchiveDesk({onMap}) {
  const [filter,setFilter]=useState('Все'),[query,setQuery]=useState(''),[item,setItem]=useState(null),[saved,setSaved]=useState([]);
  const visible=collection.filter(c=>(filter==='Все'||c.type===filter)&&c.title.toLowerCase().includes(query.toLowerCase()));
  return <section className="archive-desk section" id="archive">
    <div className="section-head light"><div><span className="section-kicker">ОБРАЗЫ ЛЕТА 1944</span><h2>СЛЕДЫ <em>ВРЕМЕНИ</em></h2></div><p>Дороги, переправы, лесные стоянки. В этих образах — места, через которые прошло наступление.</p></div>
    <div className="desk-toolbar"><div className="desk-filters">{['Все','Изображения','Схемы','Документы'].map(f=><button key={f} aria-pressed={filter===f} onClick={()=>setFilter(f)}>{f}</button>)}</div><label className="desk-search"><Search size={16}/><input aria-label="Поиск в коллекции" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Найти материал"/></label></div>
    <div className="desk-surface"><span className="desk-coordinate">СТОЛ 01 / КОЛЛЕКЦИЯ ОБРАЗОВ</span><div className="desk-sheets"><AnimatePresence mode="popLayout">{visible.map((c,i)=><motion.article layout key={c.id} className="archive-sheet" style={{'--sheet-angle':`${[-5,3,-2,5][i]}deg`}} initial={{opacity:0,y:35,rotate:-5}} animate={{opacity:1,y:0,rotate:0}} exit={{opacity:0,y:20}} transition={{duration:.35,delay:i*.04}}><button className="sheet-open" onClick={()=>setItem(c)} aria-label={`Открыть: ${c.title}`}><div className="sheet-media"><ArchiveArt item={c}/><span className="sheet-enlarge"><Maximize2 size={18}/></span></div><div className="sheet-caption"><small>{c.type} / {c.id}</small><h3>{c.title}</h3><span>{c.date}</span></div></button><button className="sheet-bookmark" aria-label={`Отметить: ${c.title}`} aria-pressed={saved.includes(c.id)} onClick={()=>setSaved(v=>v.includes(c.id)?v.filter(id=>id!==c.id):[...v,c.id])}>{saved.includes(c.id)?<Check size={13}/>:'+'}</button></motion.article>)}</AnimatePresence></div>{visible.length===0&&<p className="desk-empty">Ничего не найдено. Попробуйте другое название.</p>}<div className="desk-note"><span>НА ПОЛЯХ</span><p>Историю можно читать.<br/>А можно — рассматривать.</p><i>Визуальные реконструкции и схемы.<br/>Не подлинные архивные документы.</i></div></div>
    <div className="desk-footer"><span>{String(visible.length).padStart(2,'0')} МАТЕРИАЛА НА СТОЛЕ</span><span aria-live="polite">{saved.length} ОТМЕЧЕНО</span><span>ЛЕТО 1944</span></div>
    <AnimatePresence>{item&&<ArchiveReader item={item} onClose={()=>setItem(null)} onMap={onMap}/>}</AnimatePresence>
  </section>;
}

export function JourneyTimeline({moments,active,setActive,onMap}) {
  const current=moments[active];
  return <section className="timeline-section section journey-timeline" id="timeline"><div className="timeline-number">19<span>44</span></div><div className="section-head light"><div><span className="section-kicker">ХРОНОЛОГИЯ / СВЯЗАНО С КАРТОЙ</span><h2>ВРЕМЯ<br/><em>В ДВИЖЕНИИ</em></h2></div><p>Одна шкала для всего путешествия. Выбранная дата сохраняется на карте и в сводке.</p></div><div className="timeline-layout"><div className="date-display"><small>ЛЕТО / 1944</small><div className="date-mask"><AnimatePresence mode="wait"><motion.strong key={current.date} initial={{y:'110%'}} animate={{y:0}} exit={{y:'-110%'}} transition={{duration:.32}}>{current.date}</motion.strong></AnimatePresence></div><span>ТОЧКА {String(active+1).padStart(2,'0')}</span></div><AnimatePresence mode="wait"><motion.div className="timeline-story" key={active} initial={{opacity:0,x:15}} animate={{opacity:1,x:0}} exit={{opacity:0}}><span className="place">{current.city}</span><h3>{current.label}</h3><p>{current.note}</p><button className="text-btn" onClick={()=>onMap(active)}>ОТКРЫТЬ НА КАРТЕ <ArrowRight size={16}/></button></motion.div></AnimatePresence></div><div className="big-timeline"><i className="progress" style={{width:`${active/(moments.length-1)*100}%`}}/>{moments.map((m,i)=><button key={m.date} className={i===active?'active':''} aria-pressed={i===active} onClick={()=>setActive(i)}><b/><span>{m.date}</span><small>{m.city}</small></button>)}</div></section>;
}

