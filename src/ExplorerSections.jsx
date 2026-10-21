import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeftRight, ArrowRight, Box, CircleDot, Crosshair, Layers3, Plane, RadioTower, Shield, Truck, X, ZoomIn, Maximize2, Minimize2 } from 'lucide-react';
import './explorer.css';
import BagrationMap, {mapPointPercent} from './BagrationMap.jsx';
const TechnologyModals = lazy(() => import('./TechnologyModals.jsx'));
import PrehistorySection from './PrehistorySection.jsx';
import FrontDossier from './FrontDossier.jsx';
import MinskEvent from './MinskEvent.jsx';
const MinskRegion=lazy(()=>import('./MinskRegion.jsx'));
import './minsk-region.css';
import useRegionCamera, {REGION_MAX_ZOOM} from './useRegionCamera.js';
const MinskBattleAtlas=lazy(()=>import('./MinskBattleAtlas.jsx'));
import {pct, xy, places} from './bagrationMapData.js';
import {campaignEvents} from './campaignTimeline.js';

const mapMoments=campaignEvents.map(event=>({...event,...(event.place?mapPointPercent(event.place):pct(xy(event.id==='start-line'?31.1:23.3,event.id==='siauliai'?56:event.id==='osowiec'?53.5:54.5)))}));


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

const tech = [
  {name:'Танковые части',kind:'Бронетехника',category:'tanks',Icon:Shield,fact:'Прорывали оборону и развивали успех наступления.'},
  {name:'Полевая артиллерия',kind:'Артиллерия',category:'artillery',Icon:Crosshair,fact:'Подавляла огневые точки и поддерживала пехоту.'},
  {name:'Штурмовая авиация',kind:'Авиация',category:'aviation',Icon:Plane,fact:'Наносила удары по наземным целям.'},
  {name:'Военный транспорт',kind:'Логистика',category:'transport',Icon:Truck,fact:'Доставлял людей, горючее и боеприпасы.'},
  {name:'Средства связи',kind:'Связь',category:'signals',Icon:RadioTower,fact:'Соединяла штабы и передовые части.'},
  {name:'Инженерные части',kind:'Обеспечение',category:'engineering',Icon:Box,fact:'Строили переправы и открывали путь войскам.'},
];


export function ScrollProgress(){
  const fill=useRef(null),label=useRef(null);
  useEffect(()=>{
    let frame=0,last=-1;
    const update=()=>{frame=0;const travel=document.documentElement.scrollHeight-innerHeight;
      const progress=travel>0?Math.max(0,Math.min(100,window.scrollY/travel*100)):0;
      if(fill.current)fill.current.style.transform=`scaleX(${progress/100})`;
      const percent=Math.round(progress);if(label.current&&last!==percent){label.current.textContent=percent+'%';last=percent}
    };
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(update)};
    addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);update();
    return()=>{cancelAnimationFrame(frame);removeEventListener('scroll',schedule);removeEventListener('resize',schedule)};
  },[]);
  return <div className="research-progress"><i ref={fill} style={{width:'100%',transform:'scaleX(0)',transformOrigin:'left'}}/><span ref={label}>0%</span></div>;
}

export function RichTacticalMap({active,setActive}){
  const ref=useRef(null), reduced=useReducedMotion();
  const [expanded,setExpanded]=useState(false),[focus,setFocus]=useState(false);
  const [focusShot,setFocusShot]=useState(0);
  const [eventOpen,setEventOpen]=useState(false);
  const [regionOpen,setRegionOpen]=useState(false);
  const regionCanvas=useRef(null),regionWorld=useRef(null);
  const regionCamera=useRegionCamera(regionOpen,regionCanvas,regionWorld);
  const [regionReady,setRegionReady]=useState(false);
  useEffect(()=>{
    const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){setRegionReady(true);observer.disconnect()}},{rootMargin:'900px'});
    if(ref.current)observer.observe(ref.current);return()=>observer.disconnect();
  },[]);
  const regionReturn=useRef(null),regionButton=useRef(null);
  const closeRegion=React.useCallback(()=>{setRegionOpen(false);requestAnimationFrame(()=>regionReturn.current?.focus())},[]);
  const openRegion=()=>{if(regionOpen)return;regionReturn.current=document.activeElement;holdDate.current=true;setCompare(false);setFocus(false);setLayersOpen(false);setRegionOpen(true)};
  useEffect(()=>{if(!regionOpen)return;regionButton.current?.focus();const key=e=>{if(e.key==='Escape'){if(regionCanvas.current?.querySelector('[data-atlas-detail="true"]'))return;e.stopImmediatePropagation();closeRegion()}};document.addEventListener('keydown',key,true);return()=>document.removeEventListener('keydown',key,true)},[regionOpen,closeRegion]);
  const closeEvent=React.useCallback(()=>setEventOpen(false),[]);
  const holdDate=useRef(false);
  const [layersOpen,setLayersOpen]=useState(false);
  const [compare,setCompare]=useState(false);
  const [split,setSplit]=useState(52);
  const [layers,setLayers]=useState({front:true,routes:true,cities:true,fronts:true,rail:false,partisans:false,battles:true,memory:false});
  useEffect(()=>{
    if(expanded||eventOpen||regionOpen||reduced)return;
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
  },[expanded,setActive,eventOpen,regionOpen,reduced]);
  useEffect(()=>{if(!expanded)return;const old=document.body.style.overflow;document.body.style.overflow='hidden';const key=e=>{if(e.key==='Escape')setExpanded(false)};document.addEventListener('keydown',key);return()=>{document.body.style.overflow=old;document.removeEventListener('keydown',key)}},[expanded]);
  const dateLabels=useRef(null);
  useEffect(()=>{const list=dateLabels.current,button=list?.querySelector('[aria-current="step"]');if(list&&button)list.scrollLeft=button.offsetLeft-list.offsetLeft-list.clientWidth/2+button.offsetWidth/2},[active]);
  const moment=mapMoments[active]||mapMoments[0];
  const toggle=k=>setLayers(v=>({...v,[k]:!v[k]}));
  const mapCities=campaignEvents.flatMap((e,i)=>e.place&&e.id===e.place?[[e.place,i]]:[]);
  return <section className="map-section section rich-map" id="map" ref={ref}>
    <div className="section-head"><div><span className="section-kicker">23 ИЮНЯ — 29 АВГУСТА 1944</span><h2>ЛИНИЯ <em>НАСТУПЛЕНИЯ</em></h2></div><p>Проследите наступление от Витебска и Минска до Гродно, Бреста и завершающих операций в Литве и Польше.</p></div>
    <div className={'map-shell '+(expanded?'map-expanded':'')}>
      <div className="map-toolbar"><span><Crosshair size={15}/> ОПЕРАТИВНАЯ КАРТА <i className="live-date">{moment.date}</i></span><div>
        <button aria-label="Фокус на выбранной точке" aria-pressed={focus} className={focus?'tool-active':''} onClick={()=>{setRegionOpen(false);setFocus(v=>!v)}}><ZoomIn size={16}/></button>
        <button aria-label="Развернуть карту" aria-pressed={expanded} onClick={()=>setExpanded(v=>!v)}>{expanded?<Minimize2 size={16}/>:<Maximize2 size={16}/>}</button>
        <button aria-label="Сравнение до и после" aria-pressed={compare} className={compare?'tool-active':''} onClick={()=>{setCompare(v=>!v);setRegionOpen(false);setFocus(false)}}><ArrowLeftRight size={16}/> <b>ДО / ПОСЛЕ</b></button>
        <button aria-label="Слои карты" aria-expanded={layersOpen} className={layersOpen?'tool-active':''} onClick={()=>setLayersOpen(v=>!v)}><Layers3 size={16}/> <b>СЛОИ</b></button>
      </div></div>
      <div ref={regionCanvas} tabIndex={regionOpen?0:-1} aria-label={regionOpen?'Карта Минской области. Перетаскивайте карту, используйте плюс и минус для масштаба.':undefined} {...regionCamera.handlers} className={'map-canvas '+(focus?'cinematic-focus':'')+(regionOpen?' region-focused':'')+(regionCamera.dragging?' region-dragging':'')}>
        {regionOpen&&<div className="region-drag-surface" aria-hidden="true"/>}
        {focusShot>0&&<motion.div key={focusShot} className="map-focus-flash" initial={{opacity:.7}} animate={{opacity:0}} transition={{duration:reduced?0:1.2}}/>}
        <div ref={regionWorld} className="map-world" style={{transitionDuration:reduced||regionCamera.dragging?'0s':regionOpen?'.55s':'2s',transform:regionOpen?regionCamera.transform:focus?`translate(calc(-50% + ${(50-moment.x)*.3}%),calc(-50% + ${(50-moment.y)*.22}%)) scale(1.16)`:'translate(-50%,-50%)'}}>
          <BagrationMap stage={active} layers={layers} labels={false} territories/>
          {!compare&&regionReady&&<Suspense fallback={null}><MinskRegion active={regionOpen} onOpen={openRegion} zoom={regionCamera.zoom}/></Suspense>}
          {layers.cities&&mapCities.map(([id,i])=>{const m=mapMoments[i],pos=mapPointPercent(id);return <button key={id} aria-label={id==='mogilev'?'Могилёв':m.city} data-tooltip={`${id==='mogilev'?'Могилёв':m.city} · ${m.date} · открыть сводку`} data-city={id} className={'map-point '+(active===i?'active':'')+(active<i?' is-pending':'')} style={{left:pos.x+'%',top:pos.y+'%'}} onClick={()=>{holdDate.current=true;setActive(i);setFocus(true);setFocusShot(v=>v+1)}}><i/><span>{places[id].name}<small>{m.date}</small></span></button>})}
          {layers.battles&&!compare&&<button className="minsk-trigger" style={{left:(mapPointPercent('minsk').x+7)+'%',top:(mapPointPercent('minsk').y+4)+'%'}} aria-label="Открыть событие: Минское окружение" onClick={()=>{holdDate.current=true;setActive(6);setLayersOpen(false);setEventOpen(true)}}><CircleDot/></button>}
        </div>
        {regionOpen&&<><div className="region-navigation"><button ref={regionButton} onClick={closeRegion}><ArrowRight size={15} style={{transform:'rotate(180deg)'}}/> К общей карте</button><span>МИНСКАЯ ОБЛАСТЬ<small>Современная граница · OpenStreetMap</small></span></div>
          <div className="region-camera-tools" aria-label="Масштаб Минской области"><button aria-label="Увеличить масштаб области" disabled={regionCamera.zoom>=REGION_MAX_ZOOM} onClick={()=>regionCamera.zoomBy(1.25)}>+</button><output aria-label="Масштаб области">{regionCamera.zoom.toFixed(1)}×</output><button aria-label="Уменьшить масштаб области" disabled={regionCamera.zoom<=1.6} onClick={()=>regionCamera.zoomBy(.8)}>−</button><button className="region-camera-reset" aria-label="Сбросить вид области" onClick={regionCamera.reset}><Maximize2 size={16}/></button></div>
          <div className="region-map-credit"><span>Перетаскивайте карту · + / − масштаб</span><a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap contributors · ODbL</a></div>
          <Suspense fallback={<span className="battle-atlas-loading">Загрузка исторического атласа…</span>}><MinskBattleAtlas camera={regionCamera} worldRef={regionWorld} canvasRef={regionCanvas}/></Suspense></>}
        <div className="map-side-label map-side-german" aria-hidden="true"><small>ЗАПАД / 1944</small><strong>ГЕРМАНИЯ</strong><i/></div><div className="map-side-label map-side-soviet" aria-hidden="true"><small>ВОСТОК / 1944</small><strong>СССР</strong><i/></div>
        {layers.fronts&&layers.routes&&<div className="map-front-key" aria-label={"\u041d\u0430\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u0438\u044f"}>{fronts.map((front,i)=><button key={front.id} onClick={()=>{setActive([2,3,4,5][i]);setFocus(true)}} aria-label={front.name}><i className={['front-baltic','front-third','front-second','front-first'][i]}/>{front.name.replace(' \u0444\u0440\u043e\u043d\u0442','')}<ArrowRight size={11}/></button>)}</div>}
        {compare&&<><div className="compare-before" style={{width:'100%',clipPath:`inset(0 ${100-split}% 0 0)`}}><div className="compare-map-world"><BagrationMap stage={0} layers={{front:true,routes:false,cities:false,fronts:false,rail:false,partisans:false,battles:false,memory:false}} labels={false} territories/></div><span>ИСХОДНЫЙ РУБЕЖ / 22.06</span></div><i className="compare-line" style={{left:`${split}%`}}/><input aria-label="Сравнение карты" className="compare-range" type="range" min="12" max="88" value={split} onChange={e=>setSplit(+e.target.value)}/></>}
        <div className="map-north" aria-hidden="true">С</div><div className="map-caption"><span><b>—</b> НАПРАВЛЕНИЕ &nbsp; ··· РУБЕЖ</span><span>СОВРЕМЕННАЯ ОСНОВА · ОБОБЩЁННЫЕ РУБЕЖИ 1944</span></div>

        <AnimatePresence>{layersOpen&&<motion.div className="layers-panel" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:20}}><header><span>СЛОИ КАРТЫ</span><button onClick={()=>setLayersOpen(false)}><X size={15}/></button></header>{[['front','Линия фронта'],['routes','Направления'],['cities','Города'],['fronts','Фронты'],['rail','Железные дороги'],['partisans','Партизаны'],['battles','Сражения'],['memory','Память сегодня']].map(([k,l])=><label key={k}><input type="checkbox" checked={layers[k]} onChange={()=>toggle(k)}/><i/>{l}</label>)}</motion.div>}</AnimatePresence>
      </div>
      <div className="map-event-summary"><AnimatePresence mode="wait"><motion.aside key={active} className="map-card" initial={{opacity:0,x:-18}} animate={{opacity:1,x:0}} exit={{opacity:0,x:18}}><div className="map-card-top"><span>{String(active+1).padStart(2,'0')} / {mapMoments.length}</span><CircleDot size={18}/></div><small>{moment.date} / 1944</small><h3>{moment.label}</h3><p>{moment.note}</p><div className="metric"><strong>{moment.city}</strong><span>{moment.place?'место событий':'этап операции'}</span></div><a className="map-event-source" href={moment.source.url} target="_blank" rel="noreferrer">{moment.source.label} ↗</a></motion.aside></AnimatePresence></div>
      <div className="map-timeline rich-scrubber"><span className="map-scroll-hint">ХРОНОЛОГИЯ</span><div className="scrubber-wrap"><input aria-label="Дата операции" type="range" min="0" max={mapMoments.length-1} value={active} onChange={e=>{holdDate.current=true;setActive(+e.target.value)}}/><div className="scrubber-labels" ref={dateLabels}>{mapMoments.map((m,i)=><button key={m.id} aria-label={`${m.date}: ${m.label}`} aria-current={i===active?'step':undefined} className={i===active?'active':''} onClick={()=>{holdDate.current=true;setActive(i)}}>{m.date}<small>{m.label}</small></button>)}</div></div></div>
      <AnimatePresence>{eventOpen&&<MinskEvent onClose={closeEvent}/>}</AnimatePresence>
    </div>
  </section>;
}

export function Prehistory(){return <PrehistorySection/>;}

export function Strategy({onMap}){return <FrontDossier onMap={onMap}/>;}

export function Commanders({onMap}){
  const [active,setActive]=useState(1);const c=commanders[active];
  return <section className="commanders section" id="commanders">
    <div className="section-head"><div><span className="section-kicker">КОМАНДУЮЩИЕ ФРОНТАМИ</span><h2>Командующие<br/><em>фронтами.</em></h2></div><p>Баграмян, Черняховский, Захаров и Рокоссовский руководили войсками четырёх фронтов, участвовавших в операции.</p></div>
    <div className="commander-stage">
      <div className="commander-tabs">{commanders.map((p,i)=><button aria-pressed={i===active} className={i===active?'active':''} onClick={()=>setActive(i)} key={p.name}><span>0{i+1}</span>{p.name}</button>)}</div>
      <motion.div className="portrait-placeholder" key={c.initials} initial={{clipPath:'inset(0 100% 0 0)'}} animate={{clipPath:'inset(0 0% 0 0)'}} transition={{duration:.45}} aria-hidden="true"><img loading="lazy" decoding="async" src={c.photo} alt=""/><small>{c.front}</small></motion.div>
      <motion.div className="commander-info" key={c.name} initial={{opacity:0}} animate={{opacity:1}}><span>{c.role}</span><h3>{c.name}</h3><b>{c.front}</b><p>{c.quote}.</p></motion.div>
    </div>
  </section>;
}

export function Technology(){
  const [active,setActive]=useState(0);
  const [category,setCategory]=useState(null);
  return <section className="technology section" id="technology"><div className="section-head"><div><span className="section-kicker">ПОДГОТОВКА / ЛЕТО 1944</span><h2>АРСЕНАЛ <em>НАСТУПЛЕНИЯ</em></h2></div><p>Наступление держалось на работе многих частей: танки шли вперёд, артиллерия поддерживала пехоту, сапёры готовили переправы.</p></div><div className="tech-ribbon">{tech.map((t,i)=><motion.button className={active===i?'active':''} onMouseEnter={()=>setActive(i)} onClick={()=>{setActive(i);setCategory(t.category)}} key={t.name} whileHover={{y:-8}}><span>0{i+1} / {t.kind}</span><t.Icon/><h3>{t.name}</h3><p>{t.fact}</p><i>ОТКРЫТЬ КАТАЛОГ <ArrowRight size={13}/></i></motion.button>)}</div><Suspense fallback={null}><AnimatePresence>{category&&<TechnologyModals key={category} category={category} onClose={()=>setCategory(null)}/>}</AnimatePresence></Suspense></section>
}

// Единственный источник чисел для сцены «Масштаб». Редактирование значений — только здесь.
export const operationScaleData={
  operation:{start:'23.06.1944',end:'29.08.1944',days:68,frontKm:1100,advanceKm:600,fronts:4,directions:6},
  forces:{soviet:2400000,enemy:1200000,tanks:5200,enemyTanks:900,guns:36000,enemyGuns:9500,planes:6000,enemyPlanes:1350},
  partisans:{people:143000,brigades:150,detachments:49,rails:40000},
  result:{divisions:17,brigades:3,damagedDivisions:50}
};

export { mapMoments };
