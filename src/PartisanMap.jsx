import React, {useMemo, useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {ArrowRight, Minus, Plus, X} from 'lucide-react';
import BagrationMap from './BagrationMap.jsx';
import {MAP_HEIGHT, MAP_WIDTH, xy} from './bagrationMapData.js';
import {partisanEvents} from './partisanEvents.js';
import './partisan-map.css';

const categories=[['all','Все события'],['rail','Ж/д'],['bridge','Мосты'],['combat','Бои'],['recon','Разведка'],['comms','Связь'],['area','Районы активности']];
const categoryName=Object.fromEntries(categories);
const accuracy={exact:'Место подтверждено источником',approximate:'Место показано приблизительно',segment:'Показан участок, а не точка действия',area:'Район указан приблизительно по архивным данным'};

function marks(events,zoom){
  if(zoom>1.25)return events.map(event=>({events:[event],point:xy(...event.coordinates)}));
  const bins=new Map();
  for(const event of events){
    const point=xy(...event.coordinates),key=`${Math.floor(point.x/125)}:${Math.floor(point.y/115)}`;
    if(!bins.has(key))bins.set(key,[]);
    bins.get(key).push({event,point});
  }
  return [...bins.values()].map(items=>({events:items.map(item=>item.event),point:{x:items.reduce((sum,item)=>sum+item.point.x,0)/items.length,y:items.reduce((sum,item)=>sum+item.point.y,0)/items.length}}));
}

export default function PartisanMap(){
  const [category,setCategory]=useState('all'),[month,setMonth]=useState('all'),[zoom,setZoom]=useState(1);
  const [hover,setHover]=useState(null),[selected,setSelected]=useState(null);
  const visible=useMemo(()=>partisanEvents.filter(event=>(category==='all'||event.category===category)&&(month==='all'||event.date.slice(5,7)===month)),[category,month]);
  const plotted=useMemo(()=>marks(visible,zoom),[visible,zoom]);
  const monthCounts=['05','06','07'].map(id=>partisanEvents.filter(event=>(category==='all'||event.category===category)&&event.date.slice(5,7)===id).length);
  const categoryCounts=categories.slice(1).filter(([id])=>partisanEvents.some(event=>event.category===id));
  return <section className="partisan-atlas" id="partisans">
    <div className="partisan-atlas-head"><span className="section-kicker">ПОДГОТОВКА / ПАРТИЗАНЫ</span><h2>НЕВИДИМЫЙ <em>ФРОНТ</em></h2><p>Пока армии готовились к наступлению, партизаны били по дорогам и мостам в немецком тылу. Перебрасывать войска и снабжение становилось всё труднее.</p></div>
    <div className="partisan-dashboard"><div className="partisan-dashboard-lead"><span>АРХИВНАЯ КАРТА / 1944</span><strong>{String(partisanEvents.length).padStart(2,'0')}</strong><small>документированных эпизодов</small></div><div className="partisan-dashboard-types">{categoryCounts.map(([id,label])=><button key={id} className={`type-${id} ${category===id?'active':''}`} onClick={()=>setCategory(category===id?'all':id)}><i/>{label}<b>{partisanEvents.filter(event=>event.category===id).length}</b></button>)}</div><div className="partisan-dashboard-note"><span className="signal-icon"><i/><i/><i/><i/></span><strong>19—20 ИЮНЯ</strong><small>Массовые удары по коммуникациям накануне наступления</small></div></div>
    <div className="partisan-atlas-panel">
      <div className="partisan-controls"><nav aria-label="Тип действий">{categories.map(([id,label])=><button key={id} className={category===id?'active':''} aria-pressed={category===id} onClick={()=>{setCategory(id);setHover(null)}}>{label}</button>)}</nav><div className="partisan-months" aria-label="Время">{[['all','Май — июль'],['05','Май'],['06','Июнь'],['07','Июль']].map(([id,label])=><button key={id} className={month===id?'active':''} aria-pressed={month===id} onClick={()=>{setMonth(id);setHover(null)}}>{label}</button>)}</div></div>
      <div className="partisan-map-window"><div className="partisan-map-scene" style={{transform:`translate(-50%,-50%) scale(${zoom})`}}><BagrationMap stage={0} layers={{front:false,routes:false,cities:true,fronts:false,rail:false,partisans:false,battles:false,memory:false}}/>
        <svg className="partisan-overlay" viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} aria-hidden="true">
          {visible.filter(event=>event.coordinateAccuracy==='area').map(event=>{const p=xy(...event.coordinates);return <ellipse key={event.id} className="partisan-zone" cx={p.x} cy={p.y} rx="72" ry="48"/>})}
          {visible.filter(event=>event.path).map(event=><path key={event.id} className="partisan-line" d={event.path.map((place,index)=>{const point=xy(...place);return `${index?'L':'M'}${point.x} ${point.y}`}).join(' ')}/>)}
          {visible.filter(event=>event.coordinateAccuracy==='segment').map(event=>{const p=xy(...event.coordinates);return <circle key={event.id} className="partisan-segment" cx={p.x} cy={p.y} r="38"/>})}
        </svg>
        {plotted.map(group=>{const event=group.events[0],cluster=group.events.length>1;return <button key={group.events.map(item=>item.id).join('-')} className={`partisan-marker ${cluster?'cluster':event.category} ${event.date>='1944-06-19'&&event.date<'1944-06-23'?'prelude':''} ${selected?.id===event.id?'selected':''}`} style={{left:`${group.point.x/MAP_WIDTH*100}%`,top:`${group.point.y/MAP_HEIGHT*100}%`}} onMouseEnter={()=>setHover(group)} onMouseLeave={()=>setHover(null)} onFocus={()=>setHover(group)} onBlur={()=>setHover(null)} onClick={()=>{if(cluster){setZoom(1.65);setHover(null)}else setSelected(event)}} aria-label={cluster?`${group.events.length} события, приблизить`:`${event.dateLabel}: ${event.title}`}><span>{cluster?group.events.length:''}</span></button>})}
      </div>
      <div className="partisan-zoom"><button aria-label="Приблизить карту" onClick={()=>setZoom(z=>Math.min(2.1,z+.35))}><Plus size={16}/></button><button aria-label="Отдалить карту" onClick={()=>setZoom(z=>Math.max(1,z-.35))}><Minus size={16}/></button></div>
      <AnimatePresence>{hover&&<motion.div className="partisan-tooltip" key={hover.events.map(e=>e.id).join('-')} initial={{opacity:0,y:5}} animate={{opacity:1,y:0}} exit={{opacity:0}} style={{left:`${Math.min(75,hover.point.x/MAP_WIDTH*100)}%`,top:`${Math.min(77,hover.point.y/MAP_HEIGHT*100)}%`}}><small>{hover.events.length>1?`${hover.events.length} СОБЫТИЯ В РАЙОНЕ`:hover.events[0].dateLabel}</small><strong>{hover.events.length>1?'Приблизьте для просмотра':hover.events[0].location}</strong>{hover.events.length===1&&<><span>{categoryName[hover.events[0].category]} · {hover.events[0].formation}</span><p>{hover.events[0].description}</p></>}</motion.div>}</AnimatePresence>
      <span className="partisan-map-scale">{zoom===1?'ОБЗОР':'ПРИБЛИЖЕНИЕ'} · {visible.length} МАТЕРИАЛОВ</span><div className="partisan-map-corner" aria-hidden="true">БЕЛАРУСЬ <span>54° N / 28° E</span></div>{visible.length===0&&<div className="partisan-empty">По выбранному сочетанию фильтров подтверждённых событий пока нет.</div>}
      </div>
      <div className="partisan-legend"><span><i className="rail"/> Ж/д</span><span><i className="bridge"/> Мосты</span><span><i className="combat"/> Бои</span><span><i className="area"/> Районы</span><span><i className="prelude"/> 19–22 июня</span><p>Карта составлена по архивным документам и историческим публикациям. Для событий, точное место которых не установлено, показан район действия.</p></div>
    </div>
    <div className="partisan-after"><div className="partisan-timeline"><span>ПЛОТНОСТЬ ОТМЕЧЕННЫХ СОБЫТИЙ</span><div>{[['МАЙ','05'],['ИЮНЬ','06'],['ИЮЛЬ','07']].map(([label,id],index)=><button key={id} onClick={()=>setMonth(month===id?'all':id)} className={month===id?'active':''}><b>{label}</b><span className="partisan-timeline-track"><i style={{width:`${Math.max(5,monthCounts[index]/partisanEvents.length*230)}%`}}/></span><em>{monthCounts[index]}</em></button>)}</div><small>Число карточек в этом атласе, не статистика всех партизанских действий.</small></div><div className="partisan-index"><span>ОТКРЫТЬ ДОКУМЕНТЫ</span><div>{visible.slice(0,5).map(event=><button key={event.id} onClick={()=>setSelected(event)}><i className={event.category}/><small>{event.dateLabel}</small><strong>{event.title}</strong><ArrowRight size={15}/></button>)}</div></div></div>
    <AnimatePresence>{selected&&<motion.div className="partisan-detail-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setSelected(null)}><motion.article className="partisan-detail" role="dialog" aria-modal="true" aria-label={selected.title} initial={{x:35,opacity:0}} animate={{x:0,opacity:1}} exit={{x:35,opacity:0}} onClick={e=>e.stopPropagation()}><button className="partisan-detail-close" onClick={()=>setSelected(null)} aria-label="Закрыть"><X/></button><span className="section-kicker">{selected.dateLabel} / {categoryName[selected.category]}</span><h3>{selected.title}</h3><dl><dt>МЕСТО</dt><dd>{selected.location}</dd><dt>ФОРМИРОВАНИЕ</dt><dd>{selected.formation}</dd><dt>ТОЧНОСТЬ</dt><dd>{accuracy[selected.coordinateAccuracy]}</dd></dl><p>{selected.description}</p><p>{selected.result}</p><a href={selected.sourceUrl} target="_blank" rel="noreferrer">ИСТОЧНИК: {selected.source} <ArrowRight size={15}/></a></motion.article></motion.div>}</AnimatePresence>
  </section>;
}
