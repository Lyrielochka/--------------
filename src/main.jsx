import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AnimatePresence, MotionConfig, motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';
import {
  ArrowDown, ArrowRight, BookOpen, CalendarDays, ChevronRight, CircleDot,
  Crosshair, FileText, Headphones, Layers3, Map, Maximize2, Menu, Pause,
  Play, Quote, Search, Shield, Sparkles, Volume2, VolumeX, X, ZoomIn
} from 'lucide-react';
import './styles.css';
import './route.css';
import {
  Cities, Commanders, Forces, Partisans, Prehistory, Results,
  RichTacticalMap, ScrollProgress, Strategy, Technology, ThenNow, mapMoments, operationScaleData
} from './ExplorerSections.jsx';
import { ArchiveDesk, ExperienceMotion } from './Experience.jsx';
import Aviators from './Aviators.jsx';
import PartisanMap from './PartisanMap.jsx';
import WarRoomGame from './WarRoomGame.jsx';
import { CinemaProvider, CinemaIntro, OperationScroll, DepthScene, StageJourney, TimeRift, ReplayInvitation } from './Cinema.jsx';
import './map-accuracy.css';
import './palette.css';
import './site-theme.css';
import { ChapterBreak, CampaignFigures } from './StoryDesign.jsx';
import './story-design.css';

const stages = [
  { date:'23 июня', short:'23.06', title:'Прорыв фронта', city:'Витебск', stat:'4 фронта', text:'Начало согласованного наступления. Оборона группы армий «Центр» взломана на нескольких направлениях.', x:73, y:25, scale:1.04 },
  { date:'27 июня', short:'27.06', title:'Витебский узел', city:'Орша', stat:'5 дивизий', text:'Освобождён Витебск. Войска развивают удар вдоль магистрали Москва — Минск.', x:64, y:39, scale:1.08 },
  { date:'28 июня', short:'28.06', title:'Падение Могилёва', city:'Могилёв', stat:'6 дней', text:'Соединения 2-го Белорусского фронта форсируют Днепр и освобождают Могилёв.', x:55, y:55, scale:1.12 },
  { date:'29 июня', short:'29.06', title:'Бобруйский котёл', city:'Бобруйск', stat:'40 000', text:'Кольцо вокруг бобруйской группировки замкнуто. Дорога на Минск открыта.', x:45, y:71, scale:1.16 },
  { date:'3 июля', short:'03.07', title:'Освобождение Минска', city:'Минск', stat:'105 000', text:'Столица Беларуси освобождена. Восточнее города завершено окружение крупных сил противника.', x:27, y:60, scale:1.2 },
];

const events = [
  {n:'01', date:'23–28 июня', title:'Витебско-Оршанская операция', tag:'Северный фланг', desc:'Прорыв глубоко эшелонированной обороны и стремительный выход к Березине.'},
  {n:'02', date:'24–29 июня', title:'Бобруйская операция', tag:'Южный фланг', desc:'Двойной охват, окружение и разгром крупной группировки противника.'},
  {n:'03', date:'29 июня — 4 июля', title:'Минская операция', tag:'Центр', desc:'Механизированные корпуса сходятся у столицы Беларуси, замыкая кольцо.'}
];

const archives = [
  {type:'Фотодокумент', id:'Ф–1844', title:'Перед наступлением', meta:'Июнь 1944', visual:'soldiers'},
  {type:'Оперативная карта', id:'К–0231', title:'Замысел операции', meta:'Масштаб 1:200 000', visual:'map'},
  {type:'Приказ', id:'Д–0782', title:'Боевой приказ № 007', meta:'22 июня 1944', visual:'doc'},
  {type:'Фотодокумент', id:'Ф–1903', title:'Минск свободен', meta:'3 июля 1944', visual:'city'}
];

function useCursor() {
  const x = useMotionValue(-100), y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 700, damping: 38 });
  const sy = useSpring(y, { stiffness: 700, damping: 38 });
  const [active, setActive] = useState(false);
  useEffect(() => {
    const move = e => { x.set(e.clientX); y.set(e.clientY); };
    const over = e => setActive(!!e.target.closest('button,a,[data-cursor]'));
    window.addEventListener('pointermove', move); window.addEventListener('mouseover', over);
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('mouseover', over); };
  }, [x,y]);
  return {sx, sy, active};
}

const Reveal = ({children, className='', delay=0}) => (
  <motion.div className={className} initial={{opacity:0,y:35}} whileInView={{opacity:1,y:0}}
    viewport={{once:true, margin:'-80px'}} transition={{duration:.85,delay,ease:[.22,1,.36,1]}}>{children}</motion.div>
);

const routeGroup={hero:'intro',prehistory:'intro',summer:'intro',partisans:'commanders',opening:'map',timeline:'map',events:'map',replay:'results','then-now':'memory'};

const storyOrder=['intro','strategy','commanders','technology','aviators','map','results','archive','decision-lab'];
function Header({activeSection}) {
  const [open,setOpen]=useState(false);
  const nav=[['intro','Об операции'],['strategy','Замысел'],['commanders','Участники'],['map','Ход операции'],['technology','Техника'],['aviators','Лётчицы'],['archive','Архив'],['results','Итоги'],['decision-lab','Штаб']];
  if(activeSection!=='hero')nav.sort((a,b)=>storyOrder.indexOf(a[0])-storyOrder.indexOf(b[0]));
  const current=routeGroup[activeSection]||activeSection;
  return <>
    <header className={'topbar '+(activeSection==='hero'?'cover-header':'')}>
      <a href="#hero" className="brand"><span className="brand-mark"><b>Б</b><i>44</i></span><span className="brand-copy">БАГРАТИОН<small>ЦИФРОВОЙ АРХИВ</small></span></a>
      <div className="status"><span className="status-live"><i/>АРХИВ / ONLINE</span><time>{activeSection==='hero'?'23.VI — 29.VIII · 1944':'ИССЛЕДОВАНИЕ'}</time>{activeSection!=='hero'&&<span>{({intro:'Введение',prehistory:'Исходная обстановка',summer:'Обстановка',strategy:'Замысел',commanders:'Командование',forces:'Соединения',partisans:'Подготовка',technology:'Обеспечение',opening:'Начало операции',map:'Атлас',timeline:'Хронология','operation-scroll':'Ход операции',events:'Этапы',cities:'Города',aviators:'Женщины в небе',results:'Итоги',significance:'Значение',replay:'Повторение','then-now':'Время и память',memory:'Память','decision-lab':'Штаб'})[activeSection]}</span>}</div>
      <button className="menu-btn" onClick={()=>setOpen(v=>!v)} aria-label="Меню">{open?<X/>:<Menu/>}</button>
    </header>
    <nav className={'side-nav '+(activeSection==='hero'?'cover-side-nav':'')}>
      {nav.map(([id,label],i)=><a key={id} href={'#'+id} className={current===id?'active':''}><span>0{i+1}</span><b>{label}</b></a>)}
    </nav>
    <AnimatePresence>{open&&<motion.div className="mobile-menu" initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}}>
      {nav.map(([id,label],i)=><a key={id} href={'#'+id} onClick={()=>setOpen(false)}><span>0{i+1}</span>{label}</a>)}
    </motion.div>}</AnimatePresence>
  </>;
}

const routeSteps=[
  ['intro','Введение'],['strategy','Замысел'],['commanders','Участники'],
  ['map','Ход операции'],['technology','Техника'],['aviators','Лётчицы'],['archive','Архив'],['results','Итоги'],['decision-lab','Штаб']
];

function RouteIndicator({activeSection}) {
  const steps=activeSection==='hero'?routeSteps:[...routeSteps].sort((a,b)=>storyOrder.indexOf(a[0])-storyOrder.indexOf(b[0]));
  const current=routeGroup[activeSection]||activeSection;
  const ref=useRef(null);
  useEffect(()=>{const nav=ref.current;if(!nav||innerWidth>900)return;const item=nav.querySelector('.active');if(item)nav.scrollTo({left:item.offsetLeft-(nav.clientWidth-item.clientWidth)/2,behavior:'smooth'})},[current]);
  return <nav ref={ref} className={'route-indicator '+(activeSection==='hero'?'cover-navigation':'')} aria-label="Учебный маршрут">{steps.map(([id,label],i)=><a key={id} href={'#'+id} className={current===id?'active':''} aria-current={current===id?'step':undefined}><span>{String(i+1).padStart(2,'0')}</span>{label}</a>)}</nav>;
}

function Introduction(){return <section id="intro" className="route-intro section"><div><span className="section-kicker">ПЕРЕД НАЧАЛОМ</span><h2>БЕЛАРУСЬ.<br/><em>ЛЕТО 1944.</em></h2></div><p>К лету 1944 года немецкая группа армий «Центр» удерживала Беларусь и её укреплённые узлы. Чтобы освободить территорию и открыть путь на запад, советским войскам предстояло прорвать оборону сразу на нескольких направлениях. Операция «Багратион» объединила эти удары в единый замысел.</p><a className="text-btn" href="#prehistory">НАКАНУНЕ НАСТУПЛЕНИЯ <ArrowRight size={16}/></a></section>}

function RouteBridge({to,question,label}){return <div className="route-bridge"><span>{label}</span><a href={'#'+to}>{question}<ArrowRight size={19}/></a></div>}

function Opening(){return <section id="opening" className="route-opening"><div className="opening-grid"/><span className="section-kicker">ОТ ПОДГОТОВКИ — К НАСТУПЛЕНИЮ</span><strong>22 <em>ИЮНЯ</em> 1944</strong><p>Накануне основного наступления. Впереди — прорыв обороны, бои за города и путь к Минску.</p><a href="#map">ПЕРЕЙТИ К ХОДУ ОПЕРАЦИИ <ArrowDown size={17}/></a></section>}

function Significance(){return <section id="significance" className="route-significance section"><span className="section-kicker">ПОСЛЕ ИТОГОВ / ГЛАВНЫЙ ВЫВОД</span><h2>ПОЧЕМУ ЭТО <em>БЫЛО ВАЖНО?</em></h2><div className="significance-grid"><p><b>01 / ОСВОБОЖДЕНИЕ</b>Наступление завершило освобождение Беларуси и продолжилось за её пределами.</p><p><b>02 / ПЕРЕЛОМ НА ФРОНТЕ</b>Разгром группы армий «Центр» изменил положение на центральном направлении.</p><p><b>03 / ОБЩИЙ ЗАМЫСЕЛ</b>Согласованные действия фронтов, армий и партизан превратили отдельные удары в одну операцию.</p></div><a href="https://www.prlib.ru/news/1271398" target="_blank" rel="noreferrer">ИСТОРИЧЕСКАЯ СПРАВКА ↗</a></section>}

function Hero({mouse}) {
  return <section className="hero" id="hero">
    <motion.div className="hero-bg" style={{x:mouse.x,y:mouse.y}}/>
    <div className="hero-grid"/><div className="scanline"/>
    <div className="hero-coord left">54° 31′ N<br/>30° 25′ E</div>
    <div className="hero-coord right">ФРОНТ // БЕЛАРУСЬ<br/>АРХИВ 23—06—44</div>
    <div className="hero-content">
      <motion.div className="eyebrow" initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.5}}>ИНТЕРАКТИВНАЯ ЭНЦИКЛОПЕДИЯ <span>●</span> 1944</motion.div>
      <motion.h1 initial={{opacity:0,y:80}} animate={{opacity:1,y:0}} transition={{duration:1,ease:[.16,1,.3,1]}}>ОПЕРАЦИЯ<br/><em>«БАГРАТИОН»</em></motion.h1>
      <motion.div className="hero-bottom" initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{delay:.65,duration:.8}}>
        <p>Одно из крупнейших наступлений в истории. Исследуйте ход операции через карту, архивы и свидетельства времени.</p>
        <a className="primary-btn magnetic" href="#map"><span>НАЧАТЬ ИССЛЕДОВАНИЕ</span><ArrowDown size={17}/></a>
      </motion.div>
    </div>
    <div className="hero-index"><span>ОПЕРАЦИЯ</span><strong>68</strong><span>ДНЕЙ</span></div>
    <div className="scroll-cue"><i/><span>ПРОКРУТИТЕ</span></div>
  </section>
}

function Timeline({active,setActive}) {
  const s=stages[active];
  return <section className="timeline-section section" id="timeline">
    <div className="timeline-number">19<span>44</span></div>
    <div className="section-head light"><div><span className="section-kicker">02 / ХРОНОЛОГИЯ</span><h2>68 ДНЕЙ,<br/><em>ИЗМЕНИВШИХ ФРОНТ</em></h2></div><p>От первого артиллерийского залпа до выхода к Висле — время, разложенное на ключевые точки.</p></div>
    <div className="timeline-layout">
      <Reveal className="date-display"><AnimatePresence mode="wait"><motion.div key={active} initial={{opacity:0,y:25}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-25}}><small>ИЮНЬ / ИЮЛЬ</small><strong>{s.short}</strong><span>1944</span></motion.div></AnimatePresence></Reveal>
      <Reveal className="timeline-story" delay={.15}><AnimatePresence mode="wait"><motion.div key={active} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><span className="place">{s.city.toUpperCase()} // {s.date}</span><h3>{s.title}</h3><p>{s.text}</p><button className="text-btn">ОТКРЫТЬ СОБЫТИЕ <ArrowRight size={16}/></button></motion.div></AnimatePresence></Reveal>
    </div>
    <div className="big-timeline"><i className="progress" style={{width:(active/(stages.length-1))*100+'%'}}/>{stages.map((e,i)=><button key={e.date} className={i===active?'active':''} onClick={()=>setActive(i)}><b/><span>{e.short}</span><small>{e.city}</small></button>)}</div>
  </section>
}

function Events({setMapStage}) {
  const [expanded,setExpanded]=useState(0);
  return <section className="events-section section" id="events">
    <div className="section-head"><div><span className="section-kicker">03 / КЛЮЧЕВЫЕ СОБЫТИЯ</span><h2>АНАТОМИЯ <em>ПРОРЫВА</em></h2></div><p>Три операции, объединённые единым замыслом, превратились в точный механизм наступления.</p></div>
    <div className="event-list">{events.map((e,i)=><Reveal key={e.n}><motion.article className={'event-card '+(expanded===i?'expanded':'')} onClick={()=>{setExpanded(expanded===i?-1:i);setMapStage?.(i+1)}} whileHover={{x:8}}>
      <span className="event-num">{e.n}</span><div className="event-title"><small>{e.date}</small><h3>{e.title}</h3></div><span className="event-tag">{e.tag}</span><p>{e.desc}</p><button aria-label="Подробнее"><ArrowRight/></button>
    </motion.article></Reveal>)}</div>
  </section>
}

function ArchiveModal({item,onClose}) {
  return <motion.div className="modal-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose}>
    <motion.div className="modal" initial={{scale:.92,y:35}} animate={{scale:1,y:0}} exit={{scale:.95,opacity:0}} onClick={e=>e.stopPropagation()}>
      <button className="close" onClick={onClose}><X/></button><div className={'archive-visual large '+item.visual}><span>{item.id}</span></div>
      <div className="modal-copy"><span>{item.type} / {item.id}</span><h3>{item.title}</h3><p>Оцифрованный материал из коллекции проекта. Изображение восстановлено и подготовлено для исследовательского просмотра.</p><button className="primary-btn"><span>СМОТРЕТЬ МАТЕРИАЛ</span><Maximize2 size={16}/></button></div>
    </motion.div>
  </motion.div>
}

function Archive() {
  const [item,setItem]=useState(null), [flipped,setFlipped]=useState(-1);
  return <section className="archive-section section" id="archive">
    <div className="section-head light"><div><span className="section-kicker">04 / ЦИФРОВОЙ ФОНД</span><h2>АРХИВ <em>ПАМЯТИ</em></h2></div><button className="archive-search"><Search size={17}/> ПОИСК ПО АРХИВУ</button></div>
    <div className="archive-grid">{archives.map((a,i)=><Reveal key={a.id} delay={i*.08}><article className={'archive-card '+(flipped===i?'is-flipped':'')} onClick={()=>setItem(a)} data-cursor>
      <div className={'archive-visual '+a.visual}><span>{a.id}</span><button><ZoomIn/></button><button className="archive-flip" onClick={e=>{e.stopPropagation();setFlipped(flipped===i?-1:i)}}>↻</button><div className="archive-back"><small>ОБОРОТНАЯ СТОРОНА</small><b>{a.id}</b><p>{a.meta}<br/>Служебная подпись и источник будут добавлены после сверки архива.</p></div></div><div className="archive-copy"><span>{a.type}</span><h3>{a.title}</h3><small>{a.meta}</small></div>
    </article></Reveal>)}</div>
    <div className="archive-footer"><span>В КОЛЛЕКЦИИ</span><strong>2 418</strong><span>МАТЕРИАЛОВ</span><button className="text-btn">ПЕРЕЙТИ В АРХИВ <ArrowRight size={16}/></button></div>
    <AnimatePresence>{item&&<ArchiveModal item={item} onClose={()=>setItem(null)}/>}</AnimatePresence>
  </section>
}

function Memory() {
  const [now,setNow]=useState(false);
  return <section className={'memory-section section '+(now?'is-now':'')} id="memory">
    <div className="memory-bg"/><div className="memory-overlay"/>
    <div className="memory-content"><span className="section-kicker">05 / ПАМЯТЬ СЕГОДНЯ</span><Reveal><Quote size={34}/><blockquote>«Память — это не только прошлое.<br/>Это то, что мы выбираем <em>сохранить.</em>»</blockquote></Reveal>
      <p>{now?'Мемориальные комплексы, музейные фонды и семейные архивы продолжают собирать историю по крупицам.':'Лето 1944-го осталось в документах, маршрутах и именах. Цифровой архив возвращает событиям масштаб и человеческое измерение.'}</p>
      <div className="era-switch"><button className={!now?'active':''} onClick={()=>setNow(false)}>1944</button><i><motion.b animate={{x:now?24:0}}/></i><button className={now?'active':''} onClick={()=>setNow(true)}>СЕГОДНЯ</button></div>
    </div>
    <div className="memory-stat"><strong>{now?'∞':'1944'}</strong><span>{now?'ПАМЯТЬ ЖИВА':'ОБРАЗ ЭПОХИ'}</span></div>
  </section>
}

function App(){
  const [active,setActive]=useState(0), [muted,setMuted]=useState(true), [section,setSection]=useState('hero');
  const reduced=useReducedMotion();
  const {sx,sy,active:cursorActive}=useCursor();
  const mx=useSpring(0,{stiffness:35,damping:20}), my=useSpring(0,{stiffness:35,damping:20});
  useEffect(()=>{if(reduced||!matchMedia('(pointer:fine)').matches)return;const move=e=>{if(window.scrollY>innerHeight)return;mx.set((e.clientX/window.innerWidth-.5)*-18);my.set((e.clientY/window.innerHeight-.5)*-12)};window.addEventListener('mousemove',move,{passive:true});return()=>window.removeEventListener('mousemove',move)},[mx,my,reduced]);
  useEffect(()=>{const ids=['hero','intro','prehistory','summer','strategy','commanders','partisans','opening','map','technology','aviators','archive','results','decision-lab'];const io=new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting&&setSection(e.target.id)),{threshold:0,rootMargin:'-20% 0px -65% 0px'});ids.forEach(id=>{const el=document.getElementById(id);if(el)io.observe(el)});return()=>io.disconnect()},[]);
  const showOnMap=index=>{setActive(index);document.getElementById('map')?.scrollIntoView({behavior:reduced?'auto':'smooth',block:'start'})};
  return <><ExperienceMotion/><motion.div className={'cursor '+(cursorActive?'active':'')} style={{x:sx,y:sy}}/><div className="noise"/><ScrollProgress/><Header activeSection={section}/><RouteIndicator activeSection={section}/><CinemaIntro/>
    <main className="story-site">
      <Introduction/><Prehistory/>
      <ChapterBreak number="01" label="ЗАМЫСЕЛ" title="Удары должны встретиться." detail="Четыре фронта. Общее направление — Минск."/>
      <Strategy onMap={i=>showOnMap([2,3,4,5][i-1])}/><Commanders onMap={i=>showOnMap([2,3,4,5][i-1])}/>
      <Technology/><Aviators/><PartisanMap/>
      <ChapterBreak number="02" label="НАСТУПЛЕНИЕ" title="Подготовка становится действием." detail="От первых ударов — к освобождению городов."/>
      <Opening/><RichTacticalMap active={active} setActive={setActive}/>
      <CampaignFigures data={operationScaleData}/>
      <ChapterBreak number="03" label="ПАМЯТЬ" title="За каждой датой — люди." detail="Образы, места и следы лета 1944 года."/>
      <ArchiveDesk onMap={showOnMap}/>
      <ChapterBreak number="04" label="ВАШ ХОД" title="Теперь решения за вами." detail="Три направления. Ограниченные ресурсы. Одна цель."/>
      <WarRoomGame/>
    </main>
  </>;
}

createRoot(document.getElementById('root')).render(<MotionConfig reducedMotion="user"><CinemaProvider><App/></CinemaProvider></MotionConfig>);



