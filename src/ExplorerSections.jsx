import React, { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowLeftRight, ArrowRight, BookOpen, Box, ChevronDown, ChevronRight,
  CircleDot, Crosshair, Eye, FileText, Layers3, MapPin, Plane,
  RadioTower, Route, Search, Shield, Sparkles, Target,
  TrainFront, Truck, Users, X, ZoomIn, Maximize2, Minimize2
} from 'lucide-react';
import './explorer.css';
import BagrationMap, {mapPointPercent} from './BagrationMap.jsx';
const TechnologyModals = lazy(() => import('./TechnologyModals.jsx'));
import PrehistorySection from './PrehistorySection.jsx';
import FrontDossier from './FrontDossier.jsx';
import MinskEvent from './MinskEvent.jsx';
import {pct, placeXY, xy} from './bagrationMapData.js';

const mapMoments = [
  {date:'22.06',label:'Накануне',city:'Исходный рубеж',...pct(xy(31.1,54.45)),note:'Немецкая группа армий «Центр» удерживает белорусский выступ. Показан обобщённый исходный рубеж.'},
  {date:'23.06',label:'Начало наступления',city:'Витебское направление',...mapPointPercent('vitebsk'),note:'Согласованные удары четырёх фронтов начинаются на нескольких участках.'},
  {date:'26.06',label:'Витебский узел',city:'Витебск',...mapPointPercent('vitebsk'),note:'Витебск освобождён. Северный узел немецкой обороны ликвидирован.'},
  {date:'27.06',label:'Оршанский узел',city:'Орша',...mapPointPercent('orsha'),note:'Освобождена Орша — укреплённый узел на магистрали к Минску.'},
  {date:'28.06',label:'Могилёв',city:'Могилёв',...mapPointPercent('mogilev'),note:'Войска 2-го Белорусского фронта преодолевают Днепр и освобождают город.'},
  {date:'29.06',label:'Бобруйское окружение',city:'Бобруйск',...mapPointPercent('bobruisk'),note:'На юге завершено окружение бобруйской группировки. Путь на Минск открыт.'},
  {date:'03.07',label:'Минск',city:'Минск',...mapPointPercent('minsk'),note:'Столица Беларуси освобождена. К востоку от неё замкнулось крупное окружение.'},
  {date:'16.07',label:'На запад',city:'Западнее Минска',...pct(xy(25.7,53.6)),note:'Наступление развивается через западные районы Беларуси.'},
  {date:'29.08',label:'Завершение',city:'Западная граница карты',...pct(xy(24,53.6)),note:'Операция завершилась за пределами показанной карты Беларуси.'},
];


const fronts = [
  {id:'1ПФ',name:'1-й Прибалтийский фронт',dir:'Витебское направление',tone:'#bd8f70'},
  {id:'3БФ',name:'3-й Белорусский фронт',dir:'Оршанское направление',tone:'#c7695a'},
  {id:'2БФ',name:'2-й Белорусский фронт',dir:'Могилёвское направление',tone:'#aebfba'},
  {id:'1БФ',name:'1-й Белорусский фронт',dir:'Бобруйское направление',tone:'#d19a68'},
];

const commanders = [
  {initials:'И.Б.',photo:'/images/commanders/baghramyan.jpg',name:'И. Х. Баграмян',front:'1-й Прибалтийский фронт',role:'Командующий фронтом',map:0,quote:'Северное направление операции'},
  {initials:'И.Ч.',photo:'/images/commanders/chernyakhovsky.jpg',name:'И. Д. Черняховский',front:'3-й Белорусский фронт',role:'Командующий фронтом',map:1,quote:'Витебско-Оршанское направление'},
  {initials:'Г.З.',photo:'/images/commanders/zakharov.jpg',name:'Г. Ф. Захаров',front:'2-й Белорусский фронт',role:'Командующий фронтом',map:2,quote:'Могилёвское направление'},
  {initials:'К.Р.',photo:'/images/commanders/rokossovsky.jpg',name:'К. К. Рокоссовский',front:'1-й Белорусский фронт',role:'Командующий фронтом',map:3,quote:'Бобруйское направление'},
];

const cities = [
  ['Витебск','23–26 июня','Северный узел обороны и один из первых ключевых этапов операции.'],
  ['Орша','июнь 1944','Важный транспортный узел на магистрали к Минску.'],
  ['Могилёв','июнь 1944','Рубеж на Днепре и центр самостоятельного этапа операции.'],
  ['Бобруйск','июнь 1944','Южное направление и крупный узел коммуникаций.'],
  ['Минск','3 июля','Центральная точка первого стратегического этапа.'],
  ['Барановичи','июль 1944','Дальнейшее развитие наступления на запад.'],
];

const tech = [
  {name:'Танковые части',kind:'Бронетехника',category:'tanks',Icon:Shield,fact:'Прорывали оборону и развивали наступление.'},
  {name:'Полевая артиллерия',kind:'Артиллерия',category:'artillery',Icon:Crosshair,fact:'Подавляла огневые точки и поддерживала пехоту.'},
  {name:'Штурмовая авиация',kind:'Авиация',category:'aviation',Icon:Plane,fact:'Прикрывала войска и наносила удары с воздуха.'},
  {name:'Военный транспорт',kind:'Логистика',category:'transport',Icon:Truck,fact:'Доставлял людей, горючее и боеприпасы.'},
  {name:'Связь фронтов',kind:'Дороги',category:'signals',Icon:RadioTower,fact:'Соединяла штабы и передовые части.'},
  {name:'Инженерные части',kind:'Обеспечение',category:'engineering',Icon:Box,fact:'Строили переправы и открывали путь войскам.'},
];

const Reveal = ({children,className='',delay=0}) => <motion.div className={className} initial={{opacity:0,y:35}} whileInView={{opacity:1,y:0}} viewport={{once:true,margin:'-80px'}} transition={{duration:.75,delay,ease:[.22,1,.36,1]}}>{children}</motion.div>;

export function ScrollProgress(){
  const [progress,setProgress]=useState(0);
  useEffect(()=>{const onScroll=()=>setProgress(window.scrollY/(document.documentElement.scrollHeight-innerHeight)*100);onScroll();addEventListener('scroll',onScroll,{passive:true});return()=>removeEventListener('scroll',onScroll)},[]);
  return <div className="research-progress"><motion.i animate={{width:`${progress}%`}}/><span>{Math.round(progress)}%</span></div>;
}

export function RichTacticalMap({active,setActive}){
  const ref=useRef(null), reduced=useReducedMotion();
  const [expanded,setExpanded]=useState(false),[focus,setFocus]=useState(false);
  const [focusShot,setFocusShot]=useState(0);
  const [eventOpen,setEventOpen]=useState(false);
  const closeEvent=React.useCallback(()=>setEventOpen(false),[]);
  const holdDate=useRef(false);
  const [layersOpen,setLayersOpen]=useState(false);
  const [compare,setCompare]=useState(false);
  const [split,setSplit]=useState(52);
  const [layers,setLayers]=useState({front:true,routes:true,cities:true,fronts:true,rail:false,partisans:false,battles:true,memory:false});
  useEffect(()=>{
    if(expanded||eventOpen||reduced)return;
    let frame;
    const resume=()=>{holdDate.current=false};
    const sync=()=>{
      if(holdDate.current)return;
      cancelAnimationFrame(frame);
      frame=requestAnimationFrame(()=>{
        const bounds=ref.current?.getBoundingClientRect();
        if(!bounds||bounds.top>0||bounds.bottom<innerHeight)return;
        const travel=bounds.height-innerHeight;
        if(travel>0)setActive(Math.min(mapMoments.length-1,Math.max(0,Math.round(-bounds.top/travel*(mapMoments.length-1)))));
      });
    };
    addEventListener('wheel',resume,{passive:true});addEventListener('touchmove',resume,{passive:true});
    addEventListener('scroll',sync,{passive:true});addEventListener('resize',sync);sync();
    return()=>{cancelAnimationFrame(frame);removeEventListener('scroll',sync);removeEventListener('resize',sync);removeEventListener('wheel',resume);removeEventListener('touchmove',resume)};
  },[expanded,setActive,eventOpen,reduced]);
  useEffect(()=>{if(!expanded)return;const old=document.body.style.overflow;document.body.style.overflow='hidden';const key=e=>{if(e.key==='Escape')setExpanded(false)};document.addEventListener('keydown',key);return()=>{document.body.style.overflow=old;document.removeEventListener('keydown',key)}},[expanded]);
  const moment=mapMoments[active]||mapMoments[0];
  const toggle=k=>setLayers(v=>({...v,[k]:!v[k]}));
  const mapCities=[['vitebsk',2],['orsha',3],['mogilev',4],['bobruisk',5],['minsk',6]];
  return <section className="map-section section rich-map" id="map" ref={ref}>
    <div className="section-head"><div><span className="section-kicker">23 ИЮНЯ — 29 АВГУСТА 1944</span><h2>ЛИНИЯ <em>НАСТУПЛЕНИЯ</em></h2></div><p>Витебск, Орша, Могилёв, Бобруйск, Минск. Один за другим города возвращались к мирной жизни.</p></div>
    <div className={'map-shell '+(expanded?'map-expanded':'')}>
      <div className="map-toolbar"><span><Crosshair size={15}/> ОПЕРАТИВНАЯ КАРТА <i className="live-date">{moment.date}</i></span><div>
        <button aria-label="Фокус на выбранной точке" aria-pressed={focus} className={focus?'tool-active':''} onClick={()=>setFocus(v=>!v)}><ZoomIn size={16}/></button>
        <button aria-label="Развернуть карту" aria-pressed={expanded} onClick={()=>setExpanded(v=>!v)}>{expanded?<Minimize2 size={16}/>:<Maximize2 size={16}/>}</button>
        <button aria-label="Сравнение до и после" aria-pressed={compare} className={compare?'tool-active':''} onClick={()=>{setCompare(v=>!v);setFocus(false)}}><ArrowLeftRight size={16}/> <b>ДО / ПОСЛЕ</b></button>
        <button aria-label="Слои карты" aria-expanded={layersOpen} className={layersOpen?'tool-active':''} onClick={()=>setLayersOpen(v=>!v)}><Layers3 size={16}/> <b>СЛОИ</b></button>
      </div></div>
      <div className={'map-canvas '+(focus?'cinematic-focus':'')}>
        {focusShot>0&&<motion.div key={focusShot} className="map-focus-flash" initial={{opacity:.7}} animate={{opacity:0}} transition={{duration:reduced?0:1.2}}/>}
        <div className="map-world" style={{transform:focus?`translate(calc(-50% + ${(50-moment.x)*.3}%),calc(-50% + ${(50-moment.y)*.22}%)) scale(1.16)`:'translate(-50%,-50%)'}}>
          <BagrationMap stage={active} layers={layers} labels={false} territories/>
          {layers.cities&&mapCities.map(([id,i])=>{const m=mapMoments[i],pos=mapPointPercent(id);return <button key={id} aria-label={id==='mogilev'?'Могилёв':m.city} data-tooltip={`${id==='mogilev'?'Могилёв':m.city} · ${m.date} · открыть сводку`} className={'map-point '+(active===i?'active':'')+(active<i?' is-pending':'')} style={{left:pos.x+'%',top:pos.y+'%'}} onClick={()=>{setActive(i);setFocus(true);setFocusShot(v=>v+1)}}><i/><span>{id==='mogilev'?'Могилёв':m.city}<small>{m.date}</small></span></button>})}
          {layers.battles&&!compare&&<button className="minsk-trigger" style={{left:(mapPointPercent('minsk').x+7)+'%',top:(mapPointPercent('minsk').y+4)+'%'}} aria-label="Открыть событие: Минское окружение" onClick={()=>{holdDate.current=true;setActive(6);setLayersOpen(false);setEventOpen(true)}}><CircleDot/></button>}
        </div>
        <div className="map-side-label map-side-german" aria-hidden="true"><small>ЗАПАД / 1944</small><strong>ГЕРМАНИЯ</strong><i/></div><div className="map-side-label map-side-soviet" aria-hidden="true"><small>ВОСТОК / 1944</small><strong>СССР</strong><i/></div>
        {layers.fronts&&layers.routes&&<div className="map-front-key" aria-label={"\u041d\u0430\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u0438\u044f"}>{fronts.map((front,i)=><button key={front.id} onClick={()=>{setActive([2,3,4,5][i]);setFocus(true)}} aria-label={front.name}><i className={['front-baltic','front-third','front-second','front-first'][i]}/>{front.name.replace(' \u0444\u0440\u043e\u043d\u0442','')}<ArrowRight size={11}/></button>)}</div>}
        {compare&&<><div className="compare-before" style={{width:'100%',clipPath:`inset(0 ${100-split}% 0 0)`}}><div className="compare-map-world"><BagrationMap stage={0} layers={{front:true,routes:false,cities:false,fronts:false,rail:false,partisans:false,battles:false,memory:false}} labels={false} territories/></div><span>ИСХОДНЫЙ РУБЕЖ / 22.06</span></div><i className="compare-line" style={{left:`${split}%`}}/><input aria-label="Сравнение карты" className="compare-range" type="range" min="12" max="88" value={split} onChange={e=>setSplit(+e.target.value)}/></>}
        <div className="map-north" aria-hidden="true">С</div><div className="map-caption"><span><b>—</b> НАПРАВЛЕНИЕ &nbsp; ··· РУБЕЖ</span><span>СОВРЕМЕННАЯ ОСНОВА · ОБОБЩЁННЫЕ РУБЕЖИ 1944</span></div>
        <AnimatePresence mode="wait"><motion.aside key={active} className="map-card" initial={{opacity:0,x:-18}} animate={{opacity:1,x:0}} exit={{opacity:0,x:18}}><div className="map-card-top"><span>{String(active+1).padStart(2,'0')} / {mapMoments.length}</span><CircleDot size={18}/></div><small>{moment.date} / 1944</small><h3>{moment.label}</h3><p>{moment.note}</p><div className="metric"><strong>{moment.city}</strong><span>место событий</span></div></motion.aside></AnimatePresence>
        <AnimatePresence>{layersOpen&&<motion.div className="layers-panel" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:20}}><header><span>СЛОИ КАРТЫ</span><button onClick={()=>setLayersOpen(false)}><X size={15}/></button></header>{[['front','Линия фронта'],['routes','Направления'],['cities','Города'],['fronts','Фронты'],['rail','Железные дороги'],['partisans','Партизаны'],['battles','Сражения'],['memory','Память сегодня']].map(([k,l])=><label key={k}><input type="checkbox" checked={layers[k]} onChange={()=>toggle(k)}/><i/>{l}</label>)}</motion.div>}</AnimatePresence>
      </div>
      <div className="map-timeline rich-scrubber"><span className="map-scroll-hint">ХРОНОЛОГИЯ</span><div className="scrubber-wrap"><input aria-label="Дата операции" type="range" min="0" max={mapMoments.length-1} value={active} onChange={e=>setActive(+e.target.value)}/><div className="scrubber-labels">{mapMoments.map((m,i)=><button key={m.date} className={i===active?'active':''} onClick={()=>setActive(i)}>{m.date}<small>{m.label}</small></button>)}</div></div></div>
      <AnimatePresence>{eventOpen&&<MinskEvent onClose={closeEvent}/>}</AnimatePresence>
    </div>
  </section>;
}

export function Prehistory(){return <PrehistorySection/>;}

export function Strategy({onMap}){return <FrontDossier onMap={onMap}/>;}

export function Commanders({onMap}){
  const [active,setActive]=useState(1);const c=commanders[active];
  return <section className="commanders section" id="commanders">
    <div className="section-head"><div><span className="section-kicker">КОМАНДУЮЩИЕ ФРОНТАМИ</span><h2>За каждым ударом —<br/><em>решение.</em></h2></div><p>Четыре командующих отвечали за разные участки наступления. Их решения складывались в общий путь к Минску.</p></div>
    <div className="commander-stage">
      <div className="commander-tabs">{commanders.map((p,i)=><button aria-pressed={i===active} className={i===active?'active':''} onClick={()=>setActive(i)} key={p.name}><span>0{i+1}</span>{p.name}</button>)}</div>
      <motion.div className="portrait-placeholder" key={c.initials} initial={{clipPath:'inset(0 100% 0 0)'}} animate={{clipPath:'inset(0 0% 0 0)'}} transition={{duration:.45}} aria-hidden="true"><img loading="lazy" decoding="async" src={c.photo} alt=""/><small>{c.front}</small></motion.div>
      <motion.div className="commander-info" key={c.name} initial={{opacity:0}} animate={{opacity:1}}><span>{c.role}</span><h3>{c.name}</h3><b>{c.front}</b><p>{c.quote}.</p></motion.div>
    </div>
  </section>;
}

export function Forces(){const [active,setActive]=useState(0);const nodes=['Фронт','Армии','Направления','Города','Документы'];return <section className="forces section" id="forces"><div className="forces-head"><span className="section-kicker">ВОИНСКИЕ СОЕДИНЕНИЯ</span><h2>СТРУКТУРА<br/><em>В ДВИЖЕНИИ</em></h2><p>Не список, а навигационная схема. Каждый уровень готов к подключению проверенного каталога соединений.</p></div><div className="network-board"><svg viewBox="0 0 1000 420">{[0,1,2,3].map(i=><path key={i} d={`M120 210 C ${280+i*30} ${40+i*95}, ${590-i*20} ${55+i*100}, 870 ${72+i*92}`}/>)}</svg><button className="root-node"><Shield/><span>1-й Белорусский<br/>фронт</span></button>{nodes.slice(1).map((n,i)=><button onClick={()=>setActive(i)} className={'network-node node-'+i+(active===i?' active':'')} key={n}><i/>{n}<small>{active===i?'ВЫБРАНО':'ОТКРЫТЬ'}</small></button>)}<motion.aside key={active} initial={{opacity:0}} animate={{opacity:1}}><span>УРОВЕНЬ 0{active+2}</span><h3>{nodes[active+1]}</h3><p>Данные этого узла будут загружаться из структурированного исторического каталога.</p></motion.aside></div></section>}

export function Cities({onMap}){const [active,setActive]=useState(0);return <section className="cities section" id="cities"><div className="section-head"><div><span className="section-kicker">07 / ГЕОГРАФИЯ</span><h2>ГОРОДА <em>ОПЕРАЦИИ</em></h2></div><p>Горизонтальный маршрут соединяет карту, хронологию и архивные материалы.</p></div><div className="city-journey"><div className="city-rail">{cities.map((c,i)=><button key={c[0]} className={active===i?'active':''} onClick={()=>setActive(i)}><b>0{i+1}</b><span>{c[0]}</span></button>)}</div><AnimatePresence mode="wait"><motion.div className="city-view" key={active} initial={{opacity:0,x:40}} animate={{opacity:1,x:0}}><div className="city-image" style={{backgroundPosition:`${20+active*13}% center`}}><span>ГОРОД / 0{active+1}</span></div><div className="city-copy"><span>{cities[active][1]} / 1944</span><h3>{cities[active][0]}</h3><p>{cities[active][2]}</p><div><button className="text-btn">АРХИВ ГОРОДА <FileText size={15}/></button></div></div></motion.div></AnimatePresence></div></section>}

export function Partisans(){
  const [network,setNetwork]=useState(true);
  return <section className="partisans" id="partisans"><div className="partisans-bg"/><div className="partisans-grid"/><div className="partisans-copy"><span className="section-kicker">ПОДГОТОВКА / ПАРТИЗАНЫ</span><h2>НЕВИДИМЫЙ<br/><em>ФРОНТ</em></h2><p>Удары по железным дорогам нарушали снабжение группы армий «Центр». Выделены Барановичская область и направление Бобруйск — Лунинец, упомянутые в документах 1944 года.</p><button className={'network-toggle '+(network?'active':'')} onClick={()=>setNetwork(v=>!v)}><RadioTower size={16}/> {network?'СЕТЬ АКТИВНА':'ПОКАЗАТЬ СЕТЬ'}</button><small>ШТРИХОВКА ОБОЗНАЧАЕТ РАЙОНЫ И КОММУНИКАЦИИ, А НЕ ТОЧНЫЕ МЕСТА ПОДРЫВОВ</small></div>{network&&<motion.div className="rail-network" initial={{opacity:0}} animate={{opacity:1}}><BagrationMap stage={0} layers={{front:false,routes:false,cities:true,fronts:false,rail:true,partisans:true,battles:false,memory:false}}/></motion.div>}</section>
}

export function Technology(){
  const [active,setActive]=useState(0);
  const [category,setCategory]=useState(null);
  return <section className="technology section" id="technology"><div className="section-head"><div><span className="section-kicker">ПОДГОТОВКА / ЛЕТО 1944</span><h2>АРСЕНАЛ <em>НАСТУПЛЕНИЯ</em></h2></div><p>Наступление держалось на работе многих частей: танки шли вперёд, артиллерия поддерживала пехоту, сапёры готовили переправы.</p></div><div className="tech-ribbon">{tech.map((t,i)=><motion.button className={active===i?'active':''} onMouseEnter={()=>setActive(i)} onClick={()=>{setActive(i);setCategory(t.category)}} key={t.name} whileHover={{y:-8}}><span>0{i+1} / {t.kind}</span><t.Icon/><h3>{t.name}</h3><p>{t.fact}</p><i>ОТКРЫТЬ КАТАЛОГ <ArrowRight size={13}/></i></motion.button>)}</div><Suspense fallback={null}><AnimatePresence>{category&&<TechnologyModals key={category} category={category} onClose={()=>setCategory(null)}/>}</AnimatePresence></Suspense></section>
}

export function ThenNow(){const [split,setSplit]=useState(54);return <section className="then-now section" id="then-now"><div className="then-now-copy"><span className="section-kicker">11 / ТОГДА И СЕЙЧАС</span><h2>МЕСТО.<br/><em>ПАМЯТЬ.</em></h2><p>Передвиньте границу, чтобы рассмотреть два визуальных слоя. Пока здесь одна художественная реконструкция; подлинная пара фотографий ожидает добавления.</p><div className="comparison-readout"><span>АРХИВНЫЙ СЛОЙ</span><b>{split}%</b></div></div><div className="then-now-view" style={{'--split':`${split}%`}}><div className="now-layer"/><div className="then-layer"/><i style={{left:`${split}%`}}><ArrowLeftRight/></i><input aria-label="Граница сравнения изображений" type="range" min="5" max="95" value={split} onChange={e=>setSplit(+e.target.value)}/><span className="then-label">АРХИВНЫЙ ОБРАЗ</span><span className="now-label">ЦВЕТНОЙ СЛОЙ</span></div></section>}

// Единственный источник чисел для сцены «Масштаб». Редактирование значений — только здесь.
export const operationScaleData={
  operation:{start:'23.06.1944',end:'29.08.1944',days:68,frontKm:1100,advanceKm:600,fronts:4,directions:6},
  forces:{soviet:2400000,enemy:1200000,tanks:5200,enemyTanks:900,guns:36000,enemyGuns:9500,planes:6000,enemyPlanes:1350},
  partisans:{people:143000,brigades:150,detachments:49,rails:40000},
  result:{divisions:17,brigades:3,damagedDivisions:50}
};

const scaleStages=['ВРЕМЯ','ПРОСТРАНСТВО','ЛЮДИ','БРОНЯ','ОГНЕВАЯ МОЩЬ','НЕБО','ПАРТИЗАНЫ','РЕЗУЛЬТАТ'];
const formatNumber=n=>new Intl.NumberFormat('ru-RU').format(n);
function AnimatedNumber({value,active,format=formatNumber}){const [shown,setShown]=useState(0),ran=useRef(false);useEffect(()=>{if(!active||ran.current)return;ran.current=true;let start;let frame;const draw=t=>{start??=t;const p=Math.min(1,(t-start)/1250);setShown(Math.round(value*(1-Math.pow(1-p,3))));if(p<1)frame=requestAnimationFrame(draw)};frame=requestAnimationFrame(draw);return()=>cancelAnimationFrame(frame)},[active,value]);return <>{format(shown)}</>}
function Tank({side='soviet',className=''}){return <img loading="lazy" decoding="async" className={'scale-tank '+className} src={side==='soviet'?'/assets/scale/soviet-t34-right.lossless.webp':'/assets/scale/german-tiger-left.lossless.webp'} alt="" aria-hidden="true"/>}
function ScaleDots({dense=false}){return <div className={'scale-dots '+(dense?'dense':'')} aria-hidden="true">{Array.from({length:dense?240:72},(_,i)=><i key={i}/>)}</div>}
function ScaleScene({stage,active,onDensity,toggleDensity,dense}){const d=operationScaleData;const common={initial:{opacity:0,y:22},animate:active?{opacity:1,y:0}:{opacity:0,y:-12},transition:{duration:.55,ease:[.22,1,.36,1]}};
  if(stage===0)return <motion.div className="scale-scene scale-time" {...common}><div className="time-orbit" aria-hidden="true"><i/><i/><i/><b/></div><div className="scale-title"><span className="section-kicker">ИТОГИ ОПЕРАЦИИ / 01</span><h2>ЛЕТО<br/><em>1944</em></h2></div><div className="time-main"><strong><AnimatedNumber value={d.operation.days} active={active} format={n=>String(n).padStart(2,'0')}/></strong><span>ДНЕЙ</span></div><div className="time-range"><b>23 ИЮНЯ</b><i/><b>29 АВГУСТА</b></div><div className="time-caption">ОПЕРАЦИЯ «БАГРАТИОН»</div></motion.div>;
  if(stage===1)return <motion.div className="scale-scene scale-space" {...common}><div className="space-rings" aria-hidden="true"><i/><i/><i/><b/></div><div className="space-primary"><small>ШИРИНА ФРОНТА</small><strong>{formatNumber(d.operation.frontKm)} <em>КМ</em></strong><b>СЕВЕР — ЮГ</b></div><div className="space-axis"><span>ВОСТОК</span><i/><b>→</b><i/><span>ЗАПАД</span></div><div className="space-secondary"><small>ГЛУБИНА ПРОДВИЖЕНИЯ</small><strong>{formatNumber(d.operation.advanceKm)} <em>КМ</em></strong><span>К ЛИНИИ ВИСЛЫ</span></div><div className="scale-annotations"><span>{d.operation.fronts} ФРОНТА</span><span>{d.operation.directions} НАПРАВЛЕНИЯ</span></div></motion.div>;
  if(stage===2)return <motion.div className="scale-scene scale-people" {...common}><div className="people-side soviet"><small>СОВЕТСКАЯ ГРУППИРОВКА</small><strong>{formatNumber(d.forces.soviet)}</strong><span>ВОЕННОСЛУЖАЩИХ</span><ScaleDots/></div><div className="people-divider"><i/><b>≈ 2 : 1</b><span>СССР : ГЕРМАНИЯ</span></div><div className="people-side enemy"><small>ГЕРМАНСКИЕ СИЛЫ</small><strong>{formatNumber(d.forces.enemy)}</strong><span>ВОЕННОСЛУЖАЩИХ</span><ScaleDots/></div></motion.div>;
  if(stage===3)return <motion.div className="scale-scene scale-armour" {...common}><div className="armour-copy soviet"><small>БРОНЕТАНКОВЫЕ ЧАСТИ СССР</small><strong>{formatNumber(d.forces.tanks)}</strong><span>ТАНКОВ И САУ</span><div className="tank-fleet">{Array.from({length:6},(_,i)=><Tank key={i}/>)}</div></div><div className="ratio">≈ 5,8 : 1<small>НА КАЖДУЮ ГЕРМАНСКУЮ МАШИНУ</small></div><div className="armour-copy enemy"><small>ГЕРМАНСКАЯ БРОНЕТЕХНИКА</small><strong>≈ {formatNumber(d.forces.enemyTanks)}</strong><span>ТАНКОВ И ШТУРМОВЫХ ОРУДИЙ</span><Tank side="enemy"/></div></motion.div>;
  if(stage===4)return <motion.div className="scale-scene scale-artillery" {...common}><div className="gun-lines" aria-hidden="true">{Array.from({length:35},(_,i)=><i key={i}/>)}</div><img loading="lazy" decoding="async" className="gun-icon soviet" src="/assets/scale/soviet-zis3-right.lossless.webp" alt="" aria-hidden="true"/><img loading="lazy" decoding="async" className="gun-icon enemy" src="/assets/scale/german-88mm-left.lossless.webp" alt="" aria-hidden="true"/><div className="artillery-copy"><small>АРТИЛЛЕРИЙСКАЯ МОЩЬ</small><strong>{formatNumber(d.forces.guns)}+</strong><span>ОРУДИЙ И МИНОМЁТОВ СССР</span><b>ГЕРМАНСКИЕ СИЛЫ ≈ {formatNumber(d.forces.enemyGuns)} <em>· ≈ 3,8 : 1</em></b></div></motion.div>;
  if(stage===5)return <motion.div className="scale-scene scale-sky" {...common}><div className="plane-flight" aria-hidden="true">{Array.from({length:3},(_,i)=><img loading="lazy" decoding="async" className={'plane-icon soviet plane-'+i} key={'s'+i} src="/assets/scale/soviet-il2-right.lossless.webp" alt=""/>)}{Array.from({length:2},(_,i)=><img loading="lazy" decoding="async" className={'plane-icon enemy plane-'+i} key={'e'+i} src="/assets/scale/german-fw190-left.lossless.webp" alt=""/>)}</div><div className="sky-number"><small>СОВЕТСКАЯ АВИАЦИЯ</small><strong>{formatNumber(d.forces.planes)}+</strong><span>САМОЛЁТОВ</span></div><div className="sky-bars"><span>СССР <i/></span><span>ГЕРМАНИЯ <i/></span><b>≈ 4,4 : 1</b></div><div className="sky-enemy">≈ {formatNumber(d.forces.enemyPlanes)}<small>МАШИН ЛЮФТВАФФЕ</small></div></motion.div>;
  if(stage===6)return <motion.div className="scale-scene scale-partisan" {...common}><svg className="partisan-web" viewBox="0 0 800 400" aria-hidden="true">{[[80,220,270,110],[270,110,450,210],[450,210,690,100],[80,220,250,340],[250,340,450,210],[450,210,650,330]].map((p,i)=><line key={i} x1={p[0]} y1={p[1]} x2={p[2]} y2={p[3]}/>)}{[[80,220],[270,110],[450,210],[690,100],[250,340],[650,330]].map((p,i)=><circle key={i} cx={p[0]} cy={p[1]} r="6"/>)}</svg><div className="partisan-number"><small>ПАРТИЗАНСКОЕ ДВИЖЕНИЕ</small><strong>{formatNumber(d.partisans.people)}</strong><span>ЧЕЛОВЕК В ДЕЙСТВУЮЩИХ ОТРЯДАХ</span></div><div className="partisan-facts"><span><b>{d.partisans.brigades}</b> БРИГАД</span><span><b>{d.partisans.detachments}</b> ОТДЕЛЬНЫХ ОТРЯДОВ</span><span><b>{formatNumber(d.partisans.rails)}+</b> РЕЛЬСОВ ВЫВЕДЕНО ИЗ СТРОЯ</span></div></motion.div>;
  return <motion.div className="scale-scene scale-result" {...common}><span className="outline result-watermark">{d.result.divisions}</span><div className="result-main"><strong>{d.result.divisions}</strong><span>ДИВИЗИЙ</span><i>+</i><strong>{d.result.brigades}</strong><span>БРИГАДЫ</span><b>РАЗГРОМЛЕНЫ</b></div><div className="result-secondary"><strong>{d.result.damagedDivisions}</strong><span>ДИВИЗИЙ ПОТЕРЯЛИ СВЫШЕ ПОЛОВИНЫ ЛИЧНОГО СОСТАВА</span></div><h3>БЕЛАРУСЬ ОСВОБОЖДЕНА</h3></motion.div>
}
function ScaleStatic(){const d=operationScaleData;const facts=[
  {group:'КОГДА ПРОХОДИЛА ОПЕРАЦИЯ',value:`${d.operation.days}`,unit:'дней',detail:`С ${d.operation.start} по ${d.operation.end}`,mark:'01'},
  {group:'РАЗМЕР НАСТУПЛЕНИЯ',value:`${formatNumber(d.operation.frontKm)} км`,unit:'ширина фронта',detail:`Наступление продвинулось до ${formatNumber(d.operation.advanceKm)} км в глубину`,mark:'02'},
  {group:'ЧИСЛЕННОСТЬ ВОЙСК',value:formatNumber(d.forces.soviet),unit:'военнослужащих СССР',detail:`Против ${formatNumber(d.forces.enemy)} военнослужащих Германии`,mark:'03'},
  {group:'ТАНКИ И САУ',value:formatNumber(d.forces.tanks),unit:'у СССР',detail:`Против примерно ${formatNumber(d.forces.enemyTanks)} германских танков и штурмовых орудий`,mark:'04'},
  {group:'ОРУДИЯ И МИНОМЁТЫ',value:`${formatNumber(d.forces.guns)}+`,unit:'у СССР',detail:`Против примерно ${formatNumber(d.forces.enemyGuns)} у Германии · перевес около 3,8 : 1`,mark:'05'},
  {group:'САМОЛЁТЫ',value:`${formatNumber(d.forces.planes)}+`,unit:'у СССР',detail:`Против примерно ${formatNumber(d.forces.enemyPlanes)} самолётов Люфтваффе · перевес около 4,4 : 1`,mark:'06'},
  {group:'ПАРТИЗАНЫ В БЕЛАРУСИ',value:formatNumber(d.partisans.people),unit:'человек',detail:`${d.partisans.brigades} бригад и ${d.partisans.detachments} отдельных отрядов; выведено из строя ${formatNumber(d.partisans.rails)}+ рельсов`,mark:'07'},
  {group:'РАЗГРОМЛЕННЫЕ СОЕДИНЕНИЯ',value:`${d.result.divisions} дивизий`,unit:`и ${d.result.brigades} бригады`,detail:`Ещё ${d.result.damagedDivisions} дивизий потеряли свыше половины личного состава`,mark:'08'}
 ];return <section className="results scale-static section" id="results"><div className="scale-static-heading"><span className="section-kicker">ИТОГИ ОПЕРАЦИИ</span><h2>МАСШТАБ,<br/><em>КОТОРЫЙ ИЗМЕНИЛ ФРОНТ</em></h2></div><div className="scale-static-grid">{facts.map(f=><article key={f.mark}><span className="static-mark">{f.mark}</span><div><small>{f.group}</small><strong>{f.value}<i>{f.unit}</i></strong><p>{f.detail}</p></div><span className="static-arrow" aria-hidden="true">↗</span></article>)}</div><small className="scale-static-note">ЧИСЛА ПРИВЕДЕНЫ ПО СВОДНЫМ ОЦЕНКАМ · В РАЗНЫХ ИСТОЧНИКАХ ВОЗМОЖНЫ РАСХОЖДЕНИЯ</small></section>}
export function Results(){const ref=useRef(null),reduced=useReducedMotion();const [stage,setStage]=useState(0),[sources,setSources]=useState(false);useEffect(()=>{if(reduced)return;let frame;const update=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{const el=ref.current;if(!el)return;const b=el.getBoundingClientRect(),travel=el.offsetHeight-innerHeight;if(b.top<=0&&b.bottom>=innerHeight)setStage(Math.min(7,Math.max(0,Math.floor((-b.top/Math.max(1,travel))*8))));})};addEventListener('scroll',update,{passive:true});addEventListener('resize',update);update();return()=>{cancelAnimationFrame(frame);removeEventListener('scroll',update);removeEventListener('resize',update)}},[reduced]);if(reduced)return <ScaleStatic/>;const goToStage=i=>{const el=ref.current;if(!el)return;const top=el.getBoundingClientRect().top+window.scrollY,travel=Math.max(0,el.offsetHeight-innerHeight);window.scrollTo({top:top+travel*((i+.5)/8),behavior:'smooth'})};return <section className="results scale-scroll" id="results" ref={ref}><div className="scale-pin"><div className="scale-masthead" aria-hidden="true"><span><b>Б</b> / ОПЕРАЦИЯ «БАГРАТИОН»</span><small>ПОЛЕВОЕ ДОСЬЕ · 1944</small></div><nav className="scale-progress" aria-label="Этапы итогов операции">{scaleStages.map((name,i)=><button key={name} onClick={()=>goToStage(i)} className={i===stage?'active':''} aria-label={`${String(i+1).padStart(2,'0')}. ${name}`} aria-current={i===stage?'step':undefined}><b>{String(i+1).padStart(2,'0')}</b><span>{name}</span></button>)}</nav><ScaleScene stage={stage} active/><button className="scale-sources" onClick={()=>setSources(v=>!v)} aria-expanded={sources}>ИСТОЧНИКИ</button>{sources&&<motion.aside className="scale-source-panel" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}><button onClick={()=>setSources(false)}>×</button><b>ЕДИНАЯ СИСТЕМА ПОДСЧЁТА</b><p>Цифры сцены собраны в единый набор данных проекта. В литературе возможны расхождения из-за методик учёта состава войск.</p></motion.aside>}</div></section>}

export { mapMoments };




