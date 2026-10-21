import React,{useEffect,useMemo,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {AnimatePresence,motion,useReducedMotion} from 'framer-motion';
import {ArrowLeft,ArrowUpRight,ChevronLeft,ChevronRight,Info,Layers,Pause,Play,Search,X} from 'lucide-react';
import {xy} from './bagrationMapData.js';
import {clusterEvents,dateLabel,eventTypes,filterEvents,periodLabel,registry,shortDate} from './minskAtlasModel.js';
import './minsk-battle-atlas.css';
import BattleEmblem from './BattleEmblem.jsx';

const icons=Object.fromEntries(['liberation','battle','crossing','air','encirclement'].map(type=>[type,props=><BattleEmblem type={type} {...props}/>]));
const all=registry.events;
const anchors=['minsk','borisov','slutsk','molodechno','berezino'];
const tour=registry.itinerary.map(id=>all.find(e=>e.id===id));
const phaseCopy=day=>day<'1944-06-29'?['ПРОРЫВ','Два направления сходятся к Минску.']:day<'1944-07-02'?['БЕРЕЗИНА','Водный рубеж и дорога к столице.']:day<'1944-07-04'?['ОХВАТ','Перехват коммуникаций и освобождение Минска.']:['ПОСЛЕ МИНСКА','Бои в окружении и наступление на запад.'];

function MinskBattleAtlas({camera,worldRef,canvasRef}){
 const reduced=useReducedMotion();
 const [query,setQuery]=useState(''),[type,setType]=useState('all'),[day,setDay]=useState('all'),[major,setMajor]=useState(false);
 const [selectedId,setSelectedId]=useState(null),[showInfo,setShowInfo]=useState(false),[catalog,setCatalog]=useState(false),[stack,setStack]=useState(null);
 const [tourStep,setTourStep]=useState(-1),[playing,setPlaying]=useState(false),[mobileSheet,setMobileSheet]=useState(false);
 const [worldWidth,setWorldWidth]=useState(1000);
 const focusReturn=useRef(null),detailRef=useRef(null),filterSnapshot=useRef(null);
 const cameraRef=useRef(camera);cameraRef.current=camera;
 useEffect(()=>{const node=worldRef.current;if(!node)return;const observer=new ResizeObserver(()=>setWorldWidth(node.offsetWidth));observer.observe(node);return()=>observer.disconnect()},[]);
 const filtered=useMemo(()=>filterEvents(all,{query,type,day,major}),[query,type,day,major]);
 const visible=stack?filtered.filter(e=>stack.includes(e.id)):filtered;
 const groups=useMemo(()=>{
  const groups=clusterEvents(filtered.filter(e=>e.id!==selectedId),worldWidth/1402*camera.zoom);
  const event=filtered.find(e=>e.id===selectedId);
  if(event){const point=xy(...event.coordinates);groups.push({id:event.id,x:point.x,y:point.y,events:[event]})}
  return groups;
 },[filtered,worldWidth,camera.zoom,selectedId]);
 const selected=filtered.find(e=>e.id===selectedId)||null;
 const choose=(event,{move=true}={})=>{focusReturn.current=document.activeElement;setSelectedId(event.id);setCatalog(false);setShowInfo(false);setMobileSheet(true);if(move)cameraRef.current.focusAt(event.coordinates,Math.max(3.8,cameraRef.current.zoom));};
 const closeDetail=()=>{setSelectedId(null);setCatalog(false);setMobileSheet(false);requestAnimationFrame(()=>focusReturn.current?.focus({preventScroll:true}))};
 useEffect(()=>{if(selectedId&&!filtered.some(e=>e.id===selectedId))setSelectedId(null)},[filtered,selectedId]);
 useEffect(()=>{if(selected)requestAnimationFrame(()=>detailRef.current?.focus({preventScroll:true}))},[selectedId]);
 const restoreTourFilters=()=>{const saved=filterSnapshot.current;if(saved){setQuery(saved.query);setType(saved.type);setDay(saved.day);setMajor(saved.major);filterSnapshot.current=null}};
 const stopTour=()=>{setPlaying(false);setTourStep(-1);restoreTourFilters()};
 const visitTour=index=>{const step=Math.max(0,Math.min(tour.length-1,index));setTourStep(step);setDay('all');setQuery('');setType('all');setMajor(false);setStack(null);choose(tour[step]);};
 const startTour=()=>{filterSnapshot.current={query,type,day,major};visitTour(0);setPlaying(!reduced)};
 useEffect(()=>{if(!playing||tourStep<0)return;const timer=setTimeout(()=>{if(tourStep===tour.length-1){setPlaying(false);return}visitTour(tourStep+1)},8500);return()=>clearTimeout(timer)},[playing,tourStep]);
 useEffect(()=>{if(reduced)setPlaying(false)},[reduced]);
 useEffect(()=>{const key=e=>{if(e.key!=='Escape')return;if(showInfo||catalog||selectedId||tourStep>=0){e.stopImmediatePropagation();setShowInfo(false);setCatalog(false);closeDetail();stopTour();}};document.addEventListener('keydown',key,true);return()=>document.removeEventListener('keydown',key,true)},[showInfo,catalog,selectedId,tourStep]);
 const applyFilter=fn=>{if(tourStep>=0){setPlaying(false);setTourStep(-1);filterSnapshot.current=null}setStack(null);fn()};
 const clear=()=>{setQuery('');setType('all');setDay('all');setMajor(false);setStack(null)};
 const openGroup=group=>{if(group.events.length===1){choose(group.events[0]);return}setStack(group.events.map(e=>e.id));setCatalog(true);setSelectedId(null);setMobileSheet(true);const coords=group.events.reduce((p,e)=>[p[0]+e.coordinates[0]/group.events.length,p[1]+e.coordinates[1]/group.events.length],[0,0]);cameraRef.current.focusAt(coords,Math.min(9,cameraRef.current.zoom*1.4))};
 const [phase,phaseText]=phaseCopy(day==='all'?'1944-07-03':day);
 const countText=`${filtered.length} из ${all.length}`;
 return <>
  {worldRef.current&&createPortal(<div className="battle-map-layer">
   {tourStep>=0&&<svg className="battle-tour-line" viewBox="0 0 1402 1122" aria-label="Маршрут просмотра, не путь движения войск"><path d={tour.slice(0,tourStep+1).map((e,i)=>{const p=xy(...e.coordinates);return `${i?'L':'M'}${p.x} ${p.y}`}).join(' ')}/></svg>}
   {groups.map(group=>{const first=group.events[0],grouped=group.events.length>1,isSelected=group.events.some(e=>e.id===selectedId),Icon=icons[first.type],labels=group.events.map(e=>e.place).filter((v,i,a)=>a.indexOf(v)===i);return <button key={group.id} data-event-ids={group.events.map(e=>e.id).join(',')} className={'battle-marker '+(grouped?'is-cluster ':'')+(isSelected?'is-selected ':'')+(first.major?'is-major ':'')+(group.events.some(e=>anchors.includes(e.id))?'is-anchor':'')} style={{left:group.x/1402*100+'%',top:group.y/1122*100+'%',transform:`translate(-50%,-50%) scale(${1/camera.zoom})`,'--event-color':eventTypes[first.type].color}} aria-label={grouped?`${group.events.length} событий: ${labels.join(', ')}`:first.title} aria-pressed={isSelected} onClick={()=>openGroup(group)}><span className="battle-marker-core">{grouped?<b>{group.events.length}</b>:<Icon size={25}/>}</span><span className="battle-marker-label">{grouped?labels[0]:first.place}<small>{grouped?`${group.events.length} записи`:periodLabel(first)}</small></span></button>})}
  </div>,worldRef.current)}
  <section data-atlas-detail={showInfo||catalog||selectedId!==null||tourStep>=0?'true':'false'} className={'battle-atlas '+(mobileSheet?'sheet-open':'')} aria-label="Боевые события Минской области">
   <div className="battle-intro" aria-hidden="true"><span>АТЛАС ОСВОБОЖДЕНИЯ / 1944</span><strong>ДОРОГА<br/><em>К МИНСКУ</em></strong><p>{phaseText}</p><div><b>{all.length}</b><span>документированных<br/>записей</span></div></div>
   <aside className={'battle-panel '+(selected?'has-detail':'')} data-map-ui>
    <div className="battle-panel-top"><span><i/> {tourStep>=0?'МАРШРУТ ОСВОБОЖДЕНИЯ':'ВОЕННО-ИСТОРИЧЕСКИЙ АТЛАС'}</span><button aria-label="Об источниках и полноте атласа" aria-pressed={showInfo} onClick={()=>{setShowInfo(v=>!v);setMobileSheet(true)}}><Info size={16}/></button><button className="battle-sheet-close" aria-label="Свернуть панель событий" onClick={()=>setMobileSheet(false)}><ChevronRight size={18}/></button></div>
    <AnimatePresence mode="wait">
     {showInfo?<motion.div key="info" className="battle-panel-body battle-method" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><span className="battle-eyebrow">ДОКУМЕНТЫ И ПАМЯТЬ</span><h3>Об экспозиции</h3><p>{registry.scope}</p><h4>Границы исследования</h4><p>{registry.completeness}</p><h4>Датировка событий</h4><p>Для сводок указан день сообщения. Он может отличаться от входа передовых частей или окончания боёв. Разночтения отмечены в карточках.</p><h4>Географические ориентиры</h4><p>{registry.coordinates} Минск включён отдельно от области.</p><h4>Источники</h4>{Object.entries(registry.sources).filter(([id])=>!id.startsWith('s')||id==='s0703').map(([id,s])=><a key={id} href={s.url} target="_blank" rel="noreferrer">{s.title}<ArrowUpRight size={12}/></a>)}<a href="/data/minsk-battle-events.json" download="minsk-battle-events.json">Скачать реестр со ссылками · JSON<ArrowUpRight size={12}/></a><small>Проверка: 18 октября 2026 · GeoNames CC BY 4.0 · границы OpenStreetMap ODbL</small><button className="battle-text-button" onClick={()=>setShowInfo(false)}>Вернуться к событиям <ChevronRight size={14}/></button></motion.div>
     :selected?<motion.article key={selected.id} ref={detailRef} tabIndex={-1} className="battle-panel-body battle-event-card" initial={{opacity:0,y:reduced?0:12}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:reduced?0:.15}} style={{'--event-color':eventTypes[selected.type].color}}>
       <div className="battle-card-nav"><button onClick={()=>{setSelectedId(null);setCatalog(true);setStack(null)}}><ArrowLeft size={13}/> К списку</button><button onClick={closeDetail} aria-label="Закрыть карточку события"><X size={16}/></button></div>
       <div className="battle-compact-emblem"><BattleEmblem type={selected.type} size={64}/></div>
       <time className="battle-compact-date" dateTime={selected.start}>{periodLabel(selected)} 1944</time>
       <h3>{selected.title}</h3>
       <div className="battle-neighbors"><button disabled={filtered.indexOf(selected)===0} onClick={()=>choose(filtered[filtered.indexOf(selected)-1])}><ChevronLeft size={14}/> Предыдущее</button><button disabled={filtered.indexOf(selected)===filtered.length-1} onClick={()=>choose(filtered[filtered.indexOf(selected)+1])}>Следующее <ChevronRight size={14}/></button></div>
      </motion.article>
     :<motion.div key="catalog" className="battle-panel-body battle-catalog" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
       <h3>Хроника событий</h3>
       <label className="battle-search"><Search size={15}/><input aria-label="Поиск боевого события" placeholder="Населённый пункт, имя, район…" value={query} onChange={e=>applyFilter(()=>setQuery(e.target.value))}/>{query&&<button aria-label="Очистить поиск событий" onClick={()=>setQuery('')}><X size={13}/></button>}</label>
       <div className="battle-type-filters" aria-label="Тип события"><button aria-pressed={type==='all'} onClick={()=>applyFilter(()=>setType('all'))}>Все</button>{Object.entries(eventTypes).map(([id,t])=><button key={id} aria-pressed={type===id} style={{'--event-color':t.color}} onClick={()=>applyFilter(()=>setType(id))}><BattleEmblem type={id} size={19}/>{t.name}</button>)}</div>
       <div className="battle-catalog-meta"><span>{stack?`${visible.length} записей в группе`:countText}</span><label><input type="checkbox" checked={major} onChange={e=>applyFilter(()=>setMajor(e.target.checked))}/> Ключевые</label></div>
       {!stack&&!query&&day==='all'&&type==='all'&&!major&&<button className="battle-tour-start" onClick={startTour}><span><Play size={16}/> ПОКАЗАТЬ ХОД ОПЕРАЦИИ</span><small>12 остановок · от прорыва до разгрома котла</small></button>}
       {stack&&<button className="battle-text-button" onClick={()=>setStack(null)}><ArrowLeft size={12}/> Весь реестр</button>}
       <div className="battle-event-list" aria-label="Реестр событий">{visible.map((event,i)=>{const Icon=icons[event.type];return <button key={event.id} onClick={()=>choose(event)} style={{'--event-color':eventTypes[event.type].color}}><Icon size={27}/><span><small>{periodLabel(event)} 1944</small><b>{event.title}</b></span><ChevronRight size={13}/></button>})}</div>
       {visible.length===0&&<div className="battle-empty"><Search size={24}/><p>Нет записей с такими условиями.</p><button onClick={clear}>Сбросить фильтры</button></div>}

      </motion.div>}
    </AnimatePresence>
   </aside>
   <button className="battle-mobile-open" data-map-ui onClick={()=>setMobileSheet(v=>!v)} aria-expanded={mobileSheet}><Layers size={17}/><span>{selected?selected.place:`События · ${countText}`}</span><ChevronRight size={17}/></button>
   <div className="battle-timebar" data-map-ui>
    {tourStep>=0?<div className="battle-tour-control"><button onClick={()=>setPlaying(v=>!v)} aria-label={playing?'Приостановить маршрут':'Продолжить маршрут'}>{playing?<Pause size={17}/>:<Play size={17}/>}</button><div><span>МАРШРУТ ПРОСМОТРА · {String(tourStep+1).padStart(2,'0')} / 12</span><strong>{tour[tourStep].place}</strong></div><button aria-label="Предыдущая остановка" disabled={tourStep===0} onClick={()=>{setPlaying(false);visitTour(tourStep-1)}}><ChevronLeft size={17}/></button><button aria-label="Следующая остановка" disabled={tourStep===tour.length-1} onClick={()=>{setPlaying(false);visitTour(tourStep+1)}}><ChevronRight size={17}/></button><button aria-label="Завершить маршрут" onClick={stopTour}><X size={17}/></button></div>
     :<><div className="battle-time-heading"><span><i/> {day==='all'?'ВСЕ ДНИ':dateLabel(day).toUpperCase()}</span><b>{phase}</b><button onClick={()=>applyFilter(()=>setDay('all'))} aria-pressed={day==='all'}>Весь период</button></div><div className="battle-day-strip" aria-label="Хронология событий">{registry.timeline.map(date=>{const count=all.filter(e=>e.start<=date&&e.end>=date).length;return <button key={date} aria-label={`События ${dateLabel(date)}`} aria-pressed={day===date} onClick={()=>applyFilter(()=>setDay(date))}><span>{shortDate(date)}</span><i style={{height:Math.max(3,Math.min(20,count*1.4))}}/><small>{count||'·'}</small></button>})}</div></>}
   </div>
  </section>
 </>;
}

export default React.memo(MinskBattleAtlas,(previous,next)=>previous.camera.zoom===next.camera.zoom&&previous.worldRef===next.worldRef&&previous.canvasRef===next.canvasRef);
