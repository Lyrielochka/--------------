import React, {useEffect, useId, useRef, useState} from 'react';
import {motion, useReducedMotion} from 'framer-motion';
import {ArrowRight, ChevronDown, MapPin, Shield, TrainFront, ZoomIn, ZoomOut} from 'lucide-react';
import {xy, frontPaths, territoryPaths, MAP_WIDTH, MAP_HEIGHT} from './bagrationMapData.js';

const museum='https://www.smolensk-museum.ru/afisha/virtualnie-vistavki/belorusskaya-nastupatelnaya-operaciya-bagration-obschij-zamysel-operacii/';
const projection=([lon,lat])=>{const point=xy(lon,lat);return [point.x,point.y];};
const path=points=>points.map((p,i)=>`${i?'L':'M'}${projection(p).join(' ')}`).join(' ');
// Same supplied geographic base and registration as the main campaign map.
// Only thematic annotations differ; no alternate country outline is drawn.
const nodes=[['Полоцк',28.81,55.49],['Витебск',30.2,55.19],['Орша',30.42,54.51],['Могилёв',30.34,53.91],['Бобруйск',29.23,53.14],['Минск',27.56,53.9],['Барановичи',26.01,53.13],['Брест',23.69,52.1]];
const layers=[
 {id:'salient',label:'Белорусский выступ',Icon:MapPin,title:'Выступ, обращённый на восток',text:'Глубокий изгиб фронта прикрывал подступы к Польше и Восточной Пруссии. Его протяжённые фланги создавали возможности для охвата.'},
 {id:'defence',label:'Участки обороны',Icon:Shield,title:'Три армии на основных участках',text:'На схеме выделены районы обороны 3-й танковой, 4-й и 9-й армий. Границы их участков условны; значки не обозначают позиции штабов.'},
 {id:'links',label:'Коммуникации',Icon:TrainFront,title:'Дороги связывали узлы обороны',text:'Показаны обобщённые связи между городами. По железным дорогам доставляли снабжение и перебрасывали войска; удары партизан затрудняли эту работу.'},
];

function SituationMap({layer,setLayer}){
 const [zoom,setZoom]=useState(false),[city,setCity]=useState(null);
 const viewport=useRef(null);
 useEffect(()=>{const node=viewport.current;if(node&&window.innerWidth<=650)node.scrollLeft=(node.scrollWidth-node.clientWidth)*.75},[]);
 const uid=useId().replaceAll(':',''),reduced=useReducedMotion(),current=layers.find(l=>l.id===layer);
 const frontPath=frontPaths[0],west=territoryPaths[0].german,east=territoryPaths[0].soviet;
 return <figure className="before-atlas">
  <div className="before-atlas-head"><div><span>СИТУАЦИОННАЯ СХЕМА</span><h3>Белорусский выступ</h3></div><time>22 июня <b>1944</b></time></div>
  <div className="before-map-tabs" aria-label="Содержание ситуационной схемы">{layers.map(({id,label,Icon})=><button key={id} aria-pressed={layer===id} onClick={()=>{setLayer(id);setCity(null)}}><Icon size={16}/>{label}</button>)}</div>
  <div ref={viewport} className={'before-map-scroll '+(zoom?'is-zoomed':'')}>
   <svg className="before-map-svg" viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} role="img" aria-label="Исходная обстановка на карте Беларуси: участки немецких армий и связи между опорными городами">
    <defs><pattern id={`${uid}-grid`} width="50" height="50" patternUnits="userSpaceOnUse"><path d="M50 0H0V50" fill="none" stroke="#506963" strokeOpacity=".1"/></pattern><pattern id={`${uid}-hatch`} width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><path d="M0 0V9" stroke="#9a584e" strokeWidth="2" strokeOpacity=".2"/></pattern><clipPath id={`${uid}-west`}><path d={west}/></clipPath></defs>
    <image href="/assets/belarus-base.lossless.webp" width={MAP_WIDTH} height={MAP_HEIGHT}/>
    <path d={west} fill="#bfc3ae" opacity=".14"/><path d={east} fill="#bf6155" opacity=".2"/>
    <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill={`url(#${uid}-grid)`}/>
    <g transform="scale(1.402 1.603)"><text x="120" y="115" className="before-region">К ВОСТОЧНОЙ ПРУССИИ</text><path d="M320 125H120" className="before-west-link"/><text x="85" y="563" className="before-region">К ВАРШАВЕ</text><path d="M230 573H85" className="before-west-link"/>
    <text x="305" y="260" className="before-side">ГРУППА АРМИЙ</text><text x="305" y="297" className="before-centre">«ЦЕНТР»</text><text x="866" y="365" className="before-side" textAnchor="middle">СОВЕТСКИЕ</text><text x="866" y="392" className="before-side" textAnchor="middle">ВОЙСКА</text></g>
    <motion.g animate={{opacity:layer==='salient'?1:.18}} transition={{duration:reduced?0:.4}} data-situation-layer="salient"><ellipse cx="905" cy="520" rx="230" ry="385" fill={`url(#${uid}-hatch)`} clipPath={`url(#${uid}-west)`}/><path d="M840 135Q940 170 1000 220M800 820Q910 920 1025 875" fill="none" stroke="#a34446" strokeWidth="3" strokeDasharray="5 7"/><text x="560" y="1035" className="before-callout">ПРОТЯЖЁННЫЙ РУБЕЖ ОБОРОНЫ</text></motion.g>
    <motion.g animate={{opacity:layer==='defence'?1:0}} transition={{duration:reduced?0:.4}} data-situation-layer="defence">
     {[[30.1,55.2,85,85,'3-я танковая армия',-310,-80],[30.35,54.2,90,145,'4-я армия',-270,0],[29.23,53.14,100,95,'9-я армия',-285,80]].map(([lon,lat,rx,ry,name,dx,dy])=>{const [x,y]=projection([lon,lat]),tx=x+dx,ty=y+dy;return <g key={name}><ellipse cx={x} cy={y} rx={rx} ry={ry} fill="#a6444622" stroke="#9e4546" strokeWidth="2" strokeDasharray="5 6"/><path d={`M${x-rx} ${y}L${tx+12} ${ty+12}`} stroke="#9e4546" fill="none"/><rect x={tx-12} y={ty-26} width={name.startsWith('3')?260:150} height="48" fill="#f3e9d6" stroke="#a57666"/><text x={tx} y={ty+5} className="before-army">{name}</text></g>})}
    </motion.g>
    <motion.g animate={{opacity:layer==='links'?1:.65}} transition={{duration:reduced?0:.4}} data-situation-layer="links">{[
     [[31.9,54.55],[30.42,54.51],[28.51,54.23],[27.56,53.9],[26.01,53.13],[23.69,52.1]],[[30.2,55.19],[30.42,54.51],[30.34,53.91]],[[27.56,53.9],[29.23,53.14],[26.8,52.25]],[[27.56,53.9],[28.81,55.49]]
    ].map((route,i)=><g key={i} className="before-communication"><path d={path(route)} stroke="#152d30" strokeWidth="15" strokeLinejoin="round" fill="none"/><path d={path(route)} stroke="#f3cf83" strokeWidth="4" fill="none"/><path d={path(route)} stroke="#f3cf83" strokeWidth="12" strokeDasharray="3 13" fill="none"/></g>)}</motion.g>
    <path d={frontPath} fill="none" stroke="#f7eed8" strokeWidth="13"/><path d={frontPath} fill="none" stroke="#a73d45" strokeWidth="4"/>
    <text x="1120" y="140" className="before-front-label">ЛИНИЯ ФРОНТА</text><text x="1120" y="175" className="before-front-date">22.06.1944</text>
    {nodes.map(([name,lon,lat],i)=>{const [x,y]=projection([lon,lat]);return <g key={name} className={'before-city '+(city===name?'selected':'')} role="button" tabIndex={0} aria-label={`Опорный город: ${name}`} onClick={()=>setCity(name)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setCity(name)}}}><circle cx={x} cy={y} r="20" fill="transparent"/><circle cx={x} cy={y} r={city===name?8:5} fill={i<5?'#a44446':'#345551'} stroke="#f4e8d0" strokeWidth="2"/><text x={x+(i===1?-16:13)} y={y-12} textAnchor={i===1?'end':'start'}>{name}</text>{city===name&&<circle cx={x} cy={y} r="15" fill="none" stroke="#a44446"/>}</g>})}
    <text x="1320" y="65" className="before-compass">С</text><path d="M1326 91V117m-5-20 5-6 5 6" stroke="#36534e" strokeWidth="2" fill="none"/>
    <text x="55" y="1090" className="before-map-index">ИСХОДНАЯ КАРТА БЕЛАРУСИ · ОБОБЩЁННАЯ ОБСТАНОВКА 1944 ГОДА</text>
   </svg>
  </div>
  <div className="before-map-tools"><span>На телефоне карту можно сдвигать в стороны</span><button onClick={()=>setZoom(v=>!v)} aria-label={zoom?'Уменьшить ситуационную схему':'Увеличить ситуационную схему'}>{zoom?<ZoomOut size={18}/>:<ZoomIn size={18}/>}</button></div>
  <figcaption className="before-map-readout" aria-live="polite"><span>{city?'ОПОРНЫЙ ГОРОД':'ЧИТАЕМ КАРТУ'}</span><h4>{city||current.title}</h4><p>{city?`${city} — один из городских и транспортных ориентиров схемы. Опорные узлы помогали удерживать оборону и связывали её участки.`:current.text}</p></figcaption>
 </figure>;
}

const briefPoints=[
 {title:'Белорусский выступ',layer:'salient',body:<><p>К середине июня фронт проходил восточнее Полоцка, Витебска, Орши, Могилёва и Бобруйска. Немецкие позиции образовывали глубокий выступ на восток — «Белорусский балкон».</p><p>Он прикрывал кратчайшие пути к Варшаве и Восточной Пруссии, но одновременно вытягивал немецкую оборону и открывал советским войскам возможность ударить по её флангам.</p></>},
 {title:'Где оборонялись: три армии',layer:'defence',body:<><ul className="before-army-list"><li><b>3-я танковая армия</b><span>Северный участок у Витебска.</span></li><li><b>4-я армия</b><span>Центр — от Орши к Могилёву.</span></li><li><b>9-я армия</b><span>Южный участок у Бобруйска и Березины.</span></li></ul><p>Крупные города и дорожные узлы превратили в опорные пункты и «крепости».</p></>},
 {title:'Численность немецкой группировки',layer:'defence',body:<><div className="before-strength-figure"><img loading="lazy" decoding="async" className="personnel-inline" src="/assets/personnel/german-helmet.lossless.webp" alt=""/><strong>≈ 486 000</strong><span>боевая численность<br/>группы армий «Центр»</span></div><p>Это оценка по немецким подсчётам. Общая численность этой группы с тылом оценивалась примерно в <b>850 тысяч</b>.</p><p>Советская оценка всех сил на белорусском участке, включая фланги соседних групп армий, — около <b>1,2 млн</b>.</p><small>Числа относятся к разным категориям учёта и не складываются напрямую.</small></>},
 {title:'Почему оборона была уязвима',layer:'links',body:<><p>Немецкое командование рассчитывало удерживать выступ на подготовленных позициях и крепко держало узлы обороны.</p><ul className="before-compact-list"><li><b>Мало резервов.</b> Подвижных сил для быстрого закрытия прорывов было мало.</li><li><b>Протяжённый фронт.</b> Переброска войск между участками требовала времени.</li><li><b>Удары партизан.</b> Действия на коммуникациях осложняли перевозки по железным дорогам.</li></ul></>},
 {title:'Советский замысел',layer:'salient',body:<><p>Напротив выступа советское командование сосредоточило четыре фронта и выбрало несколько сходящихся направлений главного удара — у Витебска и Бобруйска, с наступлением в центре на Могилёв и Оршу.</p><p>Замысел: прорвать фланги, разобщить немецкие армии и окружить их до отхода к Минску.</p></>},
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
  <div className="before-source"><p>Географическая основа — карта Беларуси. Исторические рубежи, участки армий и коммуникации нанесены обобщённо.</p><a href={museum} target="_blank" rel="noreferrer">Исторический ориентир: Смоленский музей-заповедник <ArrowRight size={14}/></a></div>
 </section>;
}

