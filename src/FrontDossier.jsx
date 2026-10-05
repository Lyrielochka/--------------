import React, {useRef, useState} from 'react';
import {AnimatePresence, motion, useReducedMotion} from 'framer-motion';
import {ArrowRight, ArrowUpRight, RotateCcw, ZoomIn, ZoomOut} from 'lucide-react';
import BagrationMap, {mapPointPercent} from './BagrationMap.jsx';
import {frontDossiers} from './frontDossierData.js';
import {frontResources, frontStocks, resourceImages, supplySource, stockSource, transportMemoir} from './frontResources.js';
import './front-dossier.css';

const number=value=>new Intl.NumberFormat('ru-RU').format(value);
const cities=['polotsk','vitebsk','orsha','borisov','mogilev','bobruisk','minsk'];
const names=['Полоцк','Витебск','Орша','Борисов','Могилёв','Бобруйск','Минск'];
const tones=['#70bbc6','#d6b878','#aac6a4','#d7907e'];
const pins=[{x:82,y:19},{x:88,y:35},{x:89,y:54},{x:85,y:73}];

function ResourceRow({image,label,children}){
 return <div className="fd-resource-row"><div className="fd-resource-picture"><img decoding="async" src={image} alt="" loading="lazy"/></div><div><h5>{label}</h5><p>{children}</p></div></div>;
}

export default function FrontDossier(){
 const [active,setActive]=useState(0),[chapter,setChapter]=useState('forces'),[zoom,setZoom]=useState(false);
 const tabRefs=useRef([]),reduced=useReducedMotion();
 const front=frontDossiers[active],resources=frontResources[active],stocks=frontStocks[active];
 const choose=i=>{setActive(i);setZoom(false)};
 const keySelect=(event,index)=>{let next;if(event.key==='ArrowRight')next=(index+1)%4;if(event.key==='ArrowLeft')next=(index+3)%4;if(event.key==='Home')next=0;if(event.key==='End')next=3;if(next!==undefined){event.preventDefault();choose(next);tabRefs.current[next]?.focus()}};
 const imageStyle={left:zoom?`${50-(mapPointPercent(front.mapData.city).x-50)*.5}%`:'50%',top:zoom?`${50-(mapPointPercent(front.mapData.city).y-50)*.5}%`:'50%',scale:zoom?1.45:1};
 const scope=front.id==='first'?'Численность и соединения — весь фронт; направление на карте — его правое крыло.':'Численность и состав к началу операции, июнь 1944 года.';
 return <section id="strategy" className="strategy section front-dossier" aria-labelledby="fd-title" style={{'--front-tone':tones[active]}}><div className="fd-inner">
  <header className="fd-heading"><span className="fd-overline">ЗАМЫСЕЛ ОПЕРАЦИИ · ИЮНЬ 1944</span><h2 id="fd-title">Четыре фронта.<br/><em>Одна цель.</em></h2><p>Согласованные удары, разные задачи.<br/>Силы и обеспечение каждого направления.</p></header>
  <nav className="fd-tabs" role="tablist" aria-label="Выбрать фронт">{frontDossiers.map((item,i)=><button ref={el=>tabRefs.current[i]=el} key={item.id} role="tab" id={`fd-tab-${item.id}`} aria-controls="fd-panel" aria-selected={i===active} tabIndex={i===active?0:-1} onClick={()=>choose(i)} onKeyDown={event=>keySelect(event,i)}><span className="fd-tab-index">0{i+1}</span><span className="fd-tab-name">{item.name}</span>{i===active&&<motion.i layoutId="front-tab-line" transition={{duration:reduced?0:.35}}/>}</button>)}</nav>
  <div className="fd-overview" id="fd-panel" role="tabpanel" aria-labelledby={`fd-tab-${front.id}`} data-front={front.id}>
   <figure className="fd-map"><figcaption><span>НАПРАВЛЕНИЯ НАСТУПЛЕНИЯ</span><div><button onClick={()=>setZoom(v=>!v)} aria-label={zoom?'Общий вид карты фронтов':'Приблизить направление фронта'}>{zoom?<ZoomOut size={17}/>:<ZoomIn size={17}/>}</button><button onClick={()=>{setZoom(false);choose(0)}} aria-label="Вернуть исходный вид карты фронтов"><RotateCcw size={16}/></button></div></figcaption>
    <div className="fd-map-canvas"><motion.div className="fd-map-world" animate={imageStyle} transition={{duration:reduced?0:1.05,ease:[.22,1,.36,1]}}>
     <BagrationMap stage={0} selectedRoute={front.mapData.route} selectedCity={front.mapData.city} labels={false} layers={{front:true,routes:true,cities:false,fronts:false,rail:false,partisans:false,battles:false,memory:false}}/>
     <div className="fd-city-labels" aria-hidden="true">{cities.map((id,i)=>{const point=mapPointPercent(id);return <span key={id} style={{left:point.x+'%',top:point.y+'%'}} className={id===front.mapData.city?'selected':''}><i/>{names[i]}</span>})}</div>
     {frontDossiers.map((item,i)=><button key={item.id} className={'fd-front-pin '+(i===active?'selected':'')} style={{left:pins[i].x+'%',top:pins[i].y+'%','--pin-tone':tones[i]}} onClick={()=>choose(i)} aria-label={`На карте: ${item.name}`} aria-pressed={i===active}><i/>{item.shortName}</button>)}
    </motion.div><span className="fd-map-north" aria-hidden="true">С ↑</span><div className="fd-map-legend"><i/> Выбранное направление <span>··· Исходный рубеж</span></div></div>
    <div className="fd-route-caption"><span>0{active+1} / 04</span><div><strong>{front.direction}</strong><small>{front.roleTitle}</small></div></div>
   </figure>
   <div className="fd-description">
    <AnimatePresence mode="wait" initial={false}><motion.div key={front.id} className="fd-summary" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:reduced?0:.22}}><span className="fd-file-index">0{active+1} / 04 · {front.direction}</span><h3>{front.name}</h3><div className="fd-commander"><span>Командующий</span><b>{front.commander}</b></div><p>{front.summary}</p><p className="fd-personnel"><img loading="lazy" decoding="async" className="personnel-inline" src="/assets/personnel/soviet-helmet.lossless.webp" alt=""/><strong>{number(front.strength.personnel)}</strong> военнослужащих к началу операции.</p><small className="fd-scope">{scope}</small></motion.div></AnimatePresence>
    <div className="fd-chapters" aria-label="Сведения о фронте">{[['forces','Состав и техника'],['supply','Тыл и снабжение'],['task','Задача и результат']].map(([id,label])=><button key={id} aria-pressed={chapter===id} onClick={()=>setChapter(id)}>{label}</button>)}</div>
    <AnimatePresence mode="wait" initial={false}><motion.div key={front.id+'-'+chapter} className="fd-chapter-body" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-5}} transition={{duration:reduced?0:.2}}>
     {chapter==='forces'?<><p className="fd-composition">{resources.composition}</p>
      <ResourceRow image={resourceImages.tanks} label="Танки и самоходная артиллерия">{front.strength.tanks!==null?<><b>{number(front.strength.tanks)}</b> танков и САУ. Подвижные соединения развивали успех после прорыва обороны.</>:<>Танковые части усиливали наступающие армии. {front.id==='second'?'В составе фронта — четыре отдельные танковые бригады.':'В составе всего фронта — шесть танковых и один механизированный корпус.'} Суммарное число машин в досье не установлено.</>}</ResourceRow>
      <ResourceRow image={resourceImages.artillery} label="Орудия и миномёты">{front.strength.artillery!==null?<><b>{number(front.strength.artillery)}</b> орудий и миномётов. Артиллерия подавляла узлы обороны и поддерживала пехоту.</>:<>Артиллерийские части готовили прорыв и сопровождали наступление. Подтверждённая сопоставимая сумма орудий и миномётов здесь не приведена.</>}</ResourceRow>
      <ResourceRow image={resourceImages.aircraft} label="Авиационная поддержка">{front.strength.aircraft!==null?<><b>{number(front.strength.aircraft)}</b> {front.id==='second'?'исправных самолётов':'самолёт' + (front.strength.aircraft%10===1?'':'а')}. {front.armies.find(([,name])=>name.includes('воздушная'))?.[1]} обеспечивала поддержку наступления.</>:<>На Бобруйском направлении действовала <b>16-я воздушная армия</b>. Её силы не подменяют общую численность авиации всего фронта.</>}</ResourceRow><details className="fd-armies"><summary>Армии в составе фронта</summary><ul>{front.armies.map(([code,label])=><li key={label}><span>{code}</span>{label}</li>)}</ul><p>{front.armiesNote}</p></details></>:
     chapter==='supply'?<><p className="fd-composition">Запасы к началу операции, июнь 1944 года.</p><ResourceRow image={resourceImages.fuel} label="Запасы горючего">Запасы в заправках: автобензин — <b>{stocks.petrol}</b>, дизтопливо — <b>{stocks.diesel}</b>, авиабензин — <b>{stocks.aviation}</b>.</ResourceRow><ResourceRow image={resourceImages.transport} label="Подвоз и транспорт">{resources.transport}</ResourceRow><ResourceRow image={resourceImages.ammunition} label="Запасы боеприпасов">Для 76-мм дивизионных пушек — <b>{stocks.divisionShells}</b> боекомплекта; для 122-мм гаубиц — <b>{stocks.howitzerShells}</b>.</ResourceRow><ResourceRow image={resourceImages.signals} label="Организация тыла">Глубина тылового района — <b>{resources.rearDepth}</b>. Начальник тыла фронта — <b>{resources.logisticsCommander}</b>. Связь обеспечивала управление перевозками и передачу распоряжений.</ResourceRow><ResourceRow image={resourceImages.engineering} label="Инженерное обеспечение">{resources.engineering}</ResourceRow>{resources.additional&&<p className="fd-supply-detail">{resources.additional}</p>}<p className="fd-supply-definition">Боекомплект — установленное количество боеприпасов на единицу вооружения. Заправка — расчётное количество горючего для заполнения топливных систем техники.</p></>:
     <><div className="fd-task"><h4>Задача фронта</h4><p>{front.task}</p></div><ol className="fd-actions">{front.keyActions.map((action,i)=><li key={action.title}><span>0{i+1}</span><div><h5>{action.title}</h5><p>{action.text}</p></div></li>)}</ol><div className="fd-result"><h4>Результат</h4><h5>{front.resultTitle}</h5><p>{front.result}</p></div></>}
    </motion.div></AnimatePresence>
   </div>
  </div>
  <details className="fd-sources"><summary>Источники и пояснения к данным</summary><p>{front.sourceNote} {front.strengthNote} Иллюстрации обозначают категории техники и служб. Запасы горючего и боеприпасов приведены к началу операции по таблицам 15–16 из истории тыла Советских Вооружённых Сил.</p><ul>{[...front.sources,supplySource,stockSource,transportMemoir].map(source=><li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.label}<ArrowUpRight size={13}/></a></li>)}</ul></details>
  <div className="fd-footer"><span>ОБЩИЙ ЗАМЫСЕЛ</span><p>Прорвать оборону на нескольких участках, разобщить немецкие армии и развить наступление к Минску.</p></div>
 </div></section>;
}
