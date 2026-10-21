import React, {useEffect, useId, useRef, useState} from 'react';
import {motion, useReducedMotion} from 'framer-motion';
import {ArrowRight, ChevronDown, MapPin, Shield, TrainFront, ZoomIn, ZoomOut, Crosshair} from 'lucide-react';
import {xy, frontPaths, territoryPaths, MAP_WIDTH, MAP_HEIGHT, axes} from './bagrationMapData.js';

const museum='https://www.smolensk-museum.ru/afisha/virtualnie-vistavki/belorusskaya-nastupatelnaya-operaciya-bagration-obschij-zamysel-operacii/';
const projection=([lon,lat])=>{const point=xy(lon,lat);return [point.x,point.y];};
const path=points=>points.map((p,i)=>`${i?'L':'M'}${projection(p).join(' ')}`).join(' ');
// Same supplied geographic base and registration as the main campaign map.
// Only thematic annotations differ; no alternate country outline is drawn.
const nodes=[['Полоцк',28.81,55.49],['Витебск',30.2,55.19],['Орша',30.42,54.51],['Могилёв',30.34,53.91],['Бобруйск',29.23,53.14],['Минск',27.56,53.9],['Барановичи',26.01,53.13],['Брест',23.69,52.1]];
const cityNotes={
 'Полоцк':'Северный ориентир схемы. Связь с Минском соединяет северный участок с тыловым транспортным узлом.',
 'Витебск':'Опорный узел северного участка 3-й танковой армии. Здесь сходятся направления на Оршу и далее к Минску.',
 'Орша':'Важный транспортный узел на магистрали Москва — Минск; связывает витебское и могилёвское направления.',
 'Могилёв':'Опорный город центрального участка 4-й армии. На схеме связан с Оршей вдоль восточной полосы обороны.',
 'Бобруйск':'Опорный узел южного участка 9-й армии. Коммуникации ведут к Минску и через юг к Лунинецу.',
 'Минск':'Главный тыловой узел этой схемы: связи расходятся к Орше, Полоцку, Бобруйску и Барановичам.',
 'Барановичи':'Западный транспортный узел на связи Минск — Брест, важный для сообщения с тылом.',
 'Брест':'Западный выход показанной сети. Через Барановичи связан с Минском и восточными участками обороны.'
};
const routes=[
 {cities:['Орша','Минск','Барановичи','Брест'],points:[[31.9,54.55],[30.42,54.51],[28.51,54.23],[27.56,53.9],[26.01,53.13],[23.69,52.1]]},
 {cities:['Витебск','Орша','Могилёв'],points:[[30.2,55.19],[30.42,54.51],[30.34,53.91]]},
 {cities:['Минск','Бобруйск'],points:[[27.56,53.9],[29.23,53.14],[26.8,52.25]]},
 {cities:['Минск','Полоцк'],points:[[27.56,53.9],[28.81,55.49]]}
];
const sectors=[
 {name:'3-я танковая армия',points:[[30.5,55.83],[30.9,55.3],[30.85,54.9]],label:[26.7,55.35],color:'#e2bb77'},
 {name:'4-я армия',points:[[30.85,54.9],[31.05,54.45],[31.14,53.9],[31.03,53.35]],label:[27.2,54.55],color:'#b7d1ce'},
 {name:'9-я армия',points:[[31.03,53.35],[30.78,52.9],[31.1,52.45]],label:[28.3,52.65],color:'#d4a6cd'}
];
const layers=[
 {id:'salient',label:'Белорусский выступ',Icon:MapPin,title:'Выступ, обращённый на восток',text:'Глубокий изгиб фронта прикрывал подступы к Польше и Восточной Пруссии. Его протяжённые фланги создавали возможности для охвата.'},
 {id:'defence',label:'Участки обороны',Icon:Shield,title:'Три армии на основных участках',text:'На схеме выделены районы обороны 3-й танковой, 4-й и 9-й армий. Границы их участков условны; значки не обозначают позиции штабов.'},
 {id:'plan',label:'Советский замысел',Icon:Crosshair,title:'Удары по флангам → охват к Минску',text:'Стрелки показывают замысел: прорвать оборону у Витебска и Бобруйска, поддержать наступление в центре и развить охват в направлении Минска. Это направления плана, а не ход боёв по дням.'},
 {id:'links',label:'Коммуникации',Icon:TrainFront,title:'Дороги связывали узлы обороны',text:'Показаны обобщённые связи между городами. По железным дорогам доставляли снабжение и перебрасывали войска; удары партизан затрудняли эту работу.'},
];

function SituationMap({layer,setLayer}){
 const [zoom,setZoom]=useState(false),[city,setCity]=useState(null);
 const viewport=useRef(null);
 useEffect(()=>{const node=viewport.current;if(node&&window.innerWidth<=650)node.scrollLeft=(node.scrollWidth-node.clientWidth)*.92},[]);
 const uid=useId().replaceAll(':',''),reduced=useReducedMotion(),current=layers.find(l=>l.id===layer);
 const frontPath=frontPaths[0],west=territoryPaths[0].german,east=territoryPaths[0].soviet;
 const selectCity=name=>{setCity(city===name?null:name);setLayer('links')};
 return <figure className="before-atlas" data-active-layer={layer}>
  <div className="before-atlas-head"><div><span>СИТУАЦИОННАЯ СХЕМА</span><h3>Белорусский выступ</h3></div><time>22 июня <b>1944</b></time></div>
  <div className="before-map-tabs" aria-label="Содержание ситуационной схемы">{layers.map(({id,label,Icon})=><button key={id} aria-pressed={layer===id} onClick={()=>{setLayer(id);setCity(null)}}><Icon size={16}/>{label}</button>)}</div>
  <div className="before-map-key"><span><i className="before-key-west"/>Под немецким контролем</span><span><i className="before-key-east"/>Под контролем СССР</span><span><i className="before-key-front"/>Линия фронта</span></div>
  <div ref={viewport} className={'before-map-scroll '+(zoom?'is-zoomed':'')}>
   <svg className="before-map-svg" viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} role="group" aria-label="Карта исходной обстановки 22 июня 1944 года">
    <defs>
     <pattern id={`${uid}-grid`} width="70" height="70" patternUnits="userSpaceOnUse"><path d="M70 0H0V70" fill="none" stroke="#fff5d9" strokeOpacity=".09"/></pattern>
     <pattern id={`${uid}-hatch`} width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><path d="M0 0V16" stroke="#f5d99a" strokeWidth="4" strokeOpacity=".42"/></pattern>
     <clipPath id={`${uid}-west`}><path d={west}/></clipPath><clipPath id={`${uid}-east`}><path d={east}/></clipPath>
     <marker id={`${uid}-arrow`} viewBox="0 0 12 12" refX="10" refY="6" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M1 1L11 6L1 11L4 6Z" fill="#ffe0a0"/></marker>
    </defs>
    <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="#e5ddc9"/>
    <image className="before-geography" href="/assets/belarus-base.lossless.webp" width={MAP_WIDTH} height={MAP_HEIGHT}/>
    <rect className="before-territory before-territory-west" width={MAP_WIDTH} height={MAP_HEIGHT} clipPath={`url(#${uid}-west)`}/><rect className="before-territory before-territory-east" width={MAP_WIDTH} height={MAP_HEIGHT} clipPath={`url(#${uid}-east)`}/>
    <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill={`url(#${uid}-grid)`}/>
    <text x="315" y="350" className="before-side">ГРУППА АРМИЙ</text><text x="315" y="400" className="before-centre">«ЦЕНТР»</text>
    <text x="1215" y="550" className="before-side" textAnchor="middle" transform="rotate(-90 1215 550)">СОВЕТСКИЕ ВОЙСКА</text>
    <motion.g animate={{opacity:layer==='salient'?1:0}} transition={{duration:reduced?0:.3}} data-situation-layer="salient" pointerEvents="none">
     <path d={frontPath} stroke={`url(#${uid}-hatch)`} strokeWidth="240" fill="none" clipPath={`url(#${uid}-west)`}/>
     <path d="M830 120H980L1060 210M820 950H1000L1100 870" className="before-callout-line"/>
     <text x="615" y="110" className="before-callout">СЕВЕРНЫЙ ФЛАНГ</text><text x="615" y="995" className="before-callout">ЮЖНЫЙ ФЛАНГ</text>
     <text x="405" y="750" className="before-salient-title">БЕЛОРУССКИЙ</text><text x="405" y="795" className="before-salient-title">ВЫСТУП</text>
    </motion.g>
    <motion.g animate={{opacity:layer==='defence'?1:0}} transition={{duration:reduced?0:.3}} data-situation-layer="defence" pointerEvents="none">
     {sectors.map(({name,points,label,color})=>{const [x,y]=projection(label),[fx,fy]=projection(points[1]);return <g key={name}>
      <path className="before-defence-sector" d={path(points)} stroke={color} strokeWidth="145" strokeOpacity=".42" fill="none" clipPath={`url(#${uid}-west)`}/>
      <path d={path(points)} stroke={color} strokeWidth="17" fill="none"/>
      <path d={`M${x+120} ${y+22}L${fx-35} ${fy}`} stroke={color} strokeWidth="3" fill="none"/>
      <rect x={x-18} y={y-30} width={name.startsWith('3')?335:210} height="65" rx="5" fill="#253641" stroke={color} strokeWidth="3"/>
      <text x={x} y={y+13} className="before-army">{name}</text>
     </g>})}
    </motion.g>
    <motion.g animate={{opacity:layer==='links'?1:.08}} transition={{duration:reduced?0:.3}} data-situation-layer="links" pointerEvents="none">
     {routes.map((route,i)=><g key={i} className="before-communication" opacity={city&&!route.cities.includes(city)?.12:1}>
      <path d={path(route.points)} stroke="#172b36" strokeWidth="18" strokeLinejoin="round" fill="none"/>
      <path d={path(route.points)} stroke="#f3cf83" strokeWidth="5" fill="none"/>
      <path d={path(route.points)} stroke="#f3cf83" strokeWidth="14" strokeDasharray="3 15" fill="none"/>
     </g>)}
    </motion.g>
    <path d={frontPath} className="before-front-halo"/><path d={frontPath} className="before-front-line"/>
    <motion.g animate={{opacity:layer==='plan'?1:0}} transition={{duration:reduced?0:.3}} data-situation-layer="plan" pointerEvents="none">
     {axes.filter(a=>['third-north','third','second','first-north'].includes(a.id)).map(a=><g key={a.id}><path d={path(a.points)} className="before-plan-shadow"/><path d={path(a.points)} className="before-plan-arrow" markerEnd={`url(#${uid}-arrow)`}/></g>)}
     <text x="140" y="940" className="before-callout">ЗАМЫСЕЛ: ПРОРЫВ → ОХВАТ → МИНСК</text>
    </motion.g>
    {nodes.map(([name,lon,lat],i)=>{const [x,y]=projection([lon,lat]);return <g key={name} className={'before-city '+(city===name?'selected':'')} role="button" tabIndex={0} aria-pressed={city===name} aria-label={`Опорный город: ${name}`} onClick={()=>selectCity(name)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();selectCity(name)}}}>
     <circle cx={x} cy={y} r="27" fill="transparent"/>
     {i>0&&i<5&&<rect x={x-12} y={y-12} width="24" height="24" rx="2" fill="#e9d8ae" stroke="#233441" strokeWidth="4"/>}
     <circle cx={x} cy={y} r={name==='Минск'?10:6} fill="#f4dc9f" stroke="#243843" strokeWidth="3"/>
     <text x={x+(i===1?-23:20)} y={y-21} textAnchor={i===1?'end':'start'}>{name}</text>
     {(city===name||name==='Минск'&&layer==='plan')&&<circle cx={x} cy={y} r="22" fill="none" stroke="#ffe0a0" strokeWidth="4"/>}
    </g>})}
    <text x="1340" y="70" className="before-compass">С ↑</text>
    <text x="55" y="1080" className="before-map-index">22.06.1944 · ОБОБЩЁННАЯ СХЕМА · ГРАНИЦЫ УЧАСТКОВ УСЛОВНЫ</text>
   </svg>
  </div>
  <div className="before-map-tools"><span>{layer==='links'?'Выберите город, чтобы выделить его связи':'Выберите город — откроются его коммуникации'}</span><button onClick={()=>setZoom(v=>!v)} aria-label={zoom?'Уменьшить ситуационную схему':'Увеличить ситуационную схему'}>{zoom?<ZoomOut size={18}/>:<ZoomIn size={18}/>}</button></div>
  <figcaption className="before-map-readout" aria-live="polite"><span>{city?'ТРАНСПОРТНЫЙ УЗЕЛ':'ЧИТАЕМ КАРТУ'}</span><h4>{city||current.title}</h4><p>{city?cityNotes[city]:current.text}</p></figcaption>
 </figure>;
}

const briefPoints=[
 {title:'Белорусский выступ',layer:'salient',body:<><p>К середине июня фронт проходил восточнее Полоцка, Витебска, Орши, Могилёва и Бобруйска. Немецкие позиции образовывали глубокий выступ на восток — «Белорусский балкон».</p><p>Он прикрывал кратчайшие пути к Варшаве и Восточной Пруссии, но одновременно вытягивал немецкую оборону и открывал советским войскам возможность ударить по её флангам.</p></>},
 {title:'Основные участки немецкой обороны',layer:'defence',body:<><ul className="before-army-list"><li><b>3-я танковая армия</b><span>Северный участок у Витебска.</span></li><li><b>4-я армия</b><span>Центр — от Орши к Могилёву.</span></li><li><b>9-я армия</b><span>Южный участок у Бобруйска и Березины.</span></li></ul><p>Крупные города и дорожные узлы превратили в опорные пункты и «крепости».</p></>},
 {title:'Численность немецкой группировки',layer:'defence',body:<><div className="before-strength-figure"><img loading="lazy" decoding="async" className="personnel-inline" src="/assets/personnel/german-helmet.lossless.webp" alt=""/><strong>≈ 486 000</strong><span>боевая численность<br/>группы армий «Центр»</span></div><p>Это оценка по немецким подсчётам. Общая численность этой группы с тылом оценивалась примерно в <b>850 тысяч</b>.</p><p>Советская оценка всех сил на белорусском участке, включая фланги соседних групп армий, — около <b>1,2 млн</b>.</p><small>Числа относятся к разным категориям учёта и не складываются напрямую.</small></>},
 {title:'Почему оборона была уязвима',layer:'links',body:<><p>Немецкое командование рассчитывало удерживать выступ на подготовленных позициях и придавало особое значение удержанию городов и транспортных узлов.</p><ul className="before-compact-list"><li><b>Мало резервов.</b> Подвижных сил для быстрого закрытия прорывов было мало.</li><li><b>Протяжённый фронт.</b> Переброска войск между участками требовала времени.</li><li><b>Удары партизан.</b> Действия на коммуникациях осложняли перевозки по железным дорогам.</li></ul></>},
 {title:'Советский замысел',layer:'plan',body:<><p>Напротив выступа советское командование сосредоточило четыре фронта и выбрало несколько сходящихся направлений главного удара — у Витебска и Бобруйска, с наступлением в центре на Могилёв и Оршу.</p><p>Замысел: прорвать фланги, разобщить немецкие армии и окружить их до отхода к Минску.</p></>},
];

export default function PrehistorySection(){
 const [active,setActive]=useState(0),[layer,setLayer]=useState('salient');
 const select=i=>{setActive(i);setLayer(briefPoints[i].layer)};
 return <section className="prehistory prehistory-redesign before-compact section" id="prehistory">
  <header className="before-heading"><div><span className="section-kicker">ИСХОДНАЯ ОБСТАНОВКА · 22 ИЮНЯ 1944</span><h2>Перед <em>наступлением.</em></h2></div><p>Форма фронта, силы противника<br/>и уязвимость обороны.</p></header>
  <div className="before-main"><SituationMap layer={layer} setLayer={setLayer}/><div className="before-accordion" aria-label="Исходная обстановка в пяти пунктах">
   <div className="before-reading-head"><span>ПЯТЬ ОРИЕНТИРОВ</span><small>Выберите пункт — карта покажет связанный слой</small></div>
   {briefPoints.map((point,i)=><article key={point.title} className={'before-accordion-item '+(active===i?'is-active':'')}><h3><button id={`before-button-${i}`} aria-expanded={active===i} aria-controls={`before-panel-${i}`} onClick={()=>select(i)}><span className="before-point-number">0{i+1}</span><span>{point.title}</span><ChevronDown size={18}/></button></h3><div id={`before-panel-${i}`} role="region" aria-labelledby={`before-button-${i}`} hidden={active!==i} className="before-accordion-body">{point.body}</div></article>)}
  </div></div>
  <div className="before-source"><p>Географическая основа — карта Беларуси. Исторические рубежи, участки армий и коммуникации нанесены обобщённо.</p><a href={museum} target="_blank" rel="noreferrer">Источник: Смоленский музей-заповедник <ArrowRight size={14}/></a></div>
 </section>;
}

