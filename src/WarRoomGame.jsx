import React, {useMemo, useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {ArrowDownRight, ArrowRight, Crosshair, Flag, PackageOpen, Radio, RotateCcw, Shield, Target, Zap} from 'lucide-react';
import BagrationMap from './BagrationMap.jsx';
import {line, pct, placeXY} from './bagrationMapData.js';
import './war-room.css';

const ASSET='/assets/scale/soviet-t34-right.lossless.webp';
const AIRCRAFT='/assets/aviators/pe-2.lossless.webp';
const phases=[
  {date:'23 ИЮНЯ 1944',name:'ПРОРЫВ ОБОРОНЫ',note:'Начало наступления. Определите, где потребуется артиллерийская подготовка, а где достаточно подвижного удара.'},
  {date:'25 ИЮНЯ 1944',name:'РАЗВИТИЕ ПРОРЫВА',note:'На нескольких участках оборона теряет устойчивость. Решите, где наращивать темп, а где беречь силы.'},
  {date:'27 ИЮНЯ 1944',name:'ОКРУЖЕНИЕ УЗЛОВ',note:'Открываются фланги крупных группировок. Согласуйте удары и не оставляйте соседние направления без поддержки.'},
  {date:'29 ИЮНЯ 1944',name:'ПУТЬ К МИНСКУ',note:'Бобруйский узел подавлен. Передовые части выходят к коммуникациям, ведущим к столице.'},
  {date:'3 ИЮЛЯ 1944',name:'МИНСКИЙ МАНЁВР',note:'Сходящиеся колонны приближаются к Минску. Главная задача — не дать противнику организованно отойти.'},
  {date:'ИЮЛЬ 1944',name:'ЗАПАДНЕЕ МИНСКА',note:'Окружение замкнуто. Продолжайте операции, пока не будет взят ключевой узел кампании.'},
];

const sectors=[
  {id:'north',name:'СЕВЕРНАЯ ГРУППА',front:'1-й Прибалтийский / 3-й Белорусский',targets:['vitebsk','orsha'],route:[[31.45,55.75],[30.8,55.55],[30.2,55.19],[30.42,54.51],[28.51,54.23],[27.56,53.90]],color:'#d86a5a',origin:[83,25]},
  {id:'center',name:'МОГИЛЁВСКОЕ НАПРАВЛЕНИЕ',front:'2-й Белорусский',targets:['mogilev'],route:[[32.4,54.15],[31.25,54.03],[30.34,53.91],[29.05,53.88],[27.56,53.90]],color:'#c89a67',origin:[87,51]},
  {id:'south',name:'БОБРУЙСКОЕ НАПРАВЛЕНИЕ',front:'1-й Белорусский',targets:['bobruisk'],route:[[32.25,52.83],[31.3,52.82],[30.02,52.89],[29.23,53.14],[28.48,53.55],[27.56,53.90]],color:'#d39c7a',origin:[85,76]},
];

const objectives=[
  {id:'vitebsk',name:'ВИТЕБСК',place:'vitebsk',resistance:2},
  {id:'orsha',name:'ОРША',place:'orsha',resistance:2},
  {id:'mogilev',name:'МОГИЛЁВ',place:'mogilev',resistance:2},
  {id:'bobruisk',name:'БОБРУЙСК',place:'bobruisk',resistance:2},
  {id:'minsk',name:'МИНСК',place:'minsk',resistance:3},
];
const initialGame=()=>({turn:0,command:3,supply:9,readiness:78,damage:{},orders:[],report:[],won:false});
const targetFor=(sectorId,damage)=>{
  const minskOpen=objectives.slice(0,4).filter(o=>(damage[o.id]||0)>=o.resistance).length>=3;
  if(minskOpen&&(damage.minsk||0)<3)return 'minsk';
  const sector=sectors.find(s=>s.id===sectorId);
  return sector.targets.find(id=>(damage[id]||0)<objectives.find(o=>o.id===id).resistance)||null;
};
const percentage=placeId=>{const p=pct(placeXY(placeId));return {left:`${p.x}%`,top:`${p.y}%`}};

function DivisionInsignia({type='infantry'}){
  const tank=type==='armor';
  return <svg className="division-insignia" viewBox="0 0 48 48" aria-hidden="true">
    <path className="insignia-ring" d="M24 3 42 13v22L24 45 6 35V13z"/>
    {tank?<><path d="M11 29h26l-3-9H14z"/><path d="M18 19v-5h12l5 5M21 14h12M9 33h30M15 34v4m18-4v4"/></>:<><path d="M24 10v28M13 18h22M15 18l-4 10h8zm18 0-4 10h8z"/><path d="M18 37h12"/></>}
  </svg>;
}

function armyPosition(sector,game){
  let from={x:sector.origin[0],y:sector.origin[1]};
  for(const id of sector.targets){
    const objective=objectives.find(o=>o.id===id),pos=pct(placeXY(objective.place));
    const to={x:pos.x,y:pos.y},value=game.damage[id]||0;
    if(value<objective.resistance){const t=value/objective.resistance;return {left:`${from.x+(to.x-from.x)*t}%`,top:`${from.y+(to.y-from.y)*t}%`};}
    from=to;
  }
  return {left:`${from.x}%`,top:`${from.y}%`};
}

function WarMap({game,selectedFront,onSelectCity,preview=false}){
  const targetIds=sectors.map(s=>targetFor(s.id,game.damage));
  const minskUnlocked=objectives.slice(0,4).filter(o=>(game.damage[o.id]||0)>=o.resistance).length>=3;
  const cities=objectives.map(o=>{
    const value=game.damage[o.id]||0;
    const captured=value>=o.resistance;
    const locked=o.id==='minsk'&&!minskUnlocked;
    const ownerFront=o.id==='minsk'?selectedFront:sectors.find(s=>s.targets.includes(o.id))?.id;
    const p=percentage(o.place);
    return <button key={o.id} className={`war-city ${captured?'captured':''} ${locked?'locked':''} ${targetIds.includes(o.id)?'active-target':''}`} style={p} onClick={()=>!preview&&!locked&&onSelectCity(o.id)} disabled={preview||locked} aria-label={`${o.name}${captured?' — взят':locked?' — цель пока закрыта':` — оборона ${value} из ${o.resistance}`}`}>
      <i className="city-pulse"/><b>{o.name}</b><small>{captured?'ЗАНЯТ':locked?'ЗАКРЫТ':`${value} / ${o.resistance}`}</small>
      {ownerFront&&game.orders.some(order=>order.front===ownerFront)&&<span className="city-order-mark">ПРИКАЗ</span>}
    </button>;
  });
  return <div className={`war-map ${preview?'is-preview':''}`}>
    <div className="war-map-stage">
      <BagrationMap showBase labels={false} layers={{front:false,routes:false,cities:false,fronts:false,rail:false,partisans:false,battles:false}} className="war-map-base"/>
      <svg className="war-map-routes" viewBox="0 0 1402 1122" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <defs><marker id="war-arrow" markerWidth="12" markerHeight="12" refX="9" refY="4" orient="auto"><path d="M0,0 L9,4 L0,8" fill="none" stroke="#e17360" strokeWidth="1.5"/></marker></defs>
        {sectors.map(s=><g key={s.id} className={`${selectedFront===s.id?'focused':''} ${game.orders.some(order=>order.front===s.id)?'has-order':''}`}>
          <path className="war-route-halo" d={line(s.route)}/><path className="war-route-line" d={line(s.route)} markerEnd="url(#war-arrow)" style={{'--sector-color':s.color}}/>
        </g>)}
      </svg>
      {!preview&&sectors.map(s=><motion.button key={s.id} type="button" aria-label={`Выбрать ${s.name}`} className={`war-army ${selectedFront===s.id?'selected':''}`} animate={armyPosition(s,game)} transition={{type:'spring',stiffness:48,damping:18,mass:1.1}} onClick={()=>onSelectCity(s.targets.find(id=>(game.damage[id]||0)<objectives.find(o=>o.id===id).resistance)||'minsk')}>
        <DivisionInsignia type={s.id==='center'?'armor':'infantry'}/><span>{s.id==='north'?'1 / 3':s.id==='center'?'2':'1'}</span>
      </motion.button>)}
      {cities}
      <div className="war-map-direction"><span>ВОСТОК / СОВЕТСКИЕ ВОЙСКА</span><ArrowDownRight size={14}/><span>ЗАПАД / ГРУППА АРМИЙ «ЦЕНТР»</span></div>
      {!preview&&<div className="war-map-north">N<br/><i/></div>}
    </div>
    <div className="war-map-legend"><span><i className="legend-held"/> ОБОРОНА ПРОТИВНИКА</span><span><i className="legend-captured"/> ВЗЯТЫЙ УЗЕЛ</span><span><i className="legend-arrow"/> ОСЬ НАСТУПЛЕНИЯ</span><small>СХЕМА ОПЕРАТИВНЫХ НАПРАВЛЕНИЙ · НЕ МАСШТАБ</small></div>
  </div>;
}

function OrderCard({id,title,detail,command,supply,icon:Icon,active,onClick,disabled}){
  return <button className={`order-card ${active?'selected':''}`} onClick={onClick} disabled={disabled}>
    <i className="order-icon"><Icon size={17}/></i><span className="order-copy"><b>{title}</b><small>{detail}</small></span><span className="order-cost"><small><Zap size={10}/>{command}</small><small><PackageOpen size={10}/>{supply}</small></span>
  </button>;
}

export default function WarRoomGame(){
  const [started,setStarted]=useState(false);
  const [game,setGame]=useState(initialGame);
  const [selectedFront,setSelectedFront]=useState('north');
  const [tactic,setTactic]=useState('advance');
  const [airSupport,setAirSupport]=useState(false);
  const sector=sectors.find(s=>s.id===selectedFront);
  const targetId=targetFor(selectedFront,game.damage);
  const target=objectives.find(o=>o.id===targetId);
  const queuedFronts=useMemo(()=>new Set(game.orders.map(o=>o.front)),[game.orders]);
  const currentPhase=phases[Math.min(game.turn,phases.length-1)];
  const captures=objectives.slice(0,4).filter(o=>(game.damage[o.id]||0)>=o.resistance).length;
  const commands={advance:1,assault:2,regroup:1};
  const supplies={advance:1,assault:3,regroup:0};
  const tacticNames={advance:'Продвижение',assault:'Прорыв с подготовкой',regroup:'Перегруппировка'};
  const selectTarget=id=>{
    const front=sectors.find(s=>s.targets.includes(id))?.id||selectedFront;
    setSelectedFront(front);
  };
  const addOrder=()=>{
    if(game.command<commands[tactic]||game.supply<supplies[tactic]+(airSupport&&tactic!=='regroup'?2:0)||queuedFronts.has(selectedFront)||(!target&&tactic!=='regroup'))return;
    const order={front:selectedFront,tactic,target:targetId,air:airSupport&&tactic!=='regroup'};
    setGame(g=>({...g,command:g.command-commands[tactic],supply:g.supply-supplies[tactic]-(order.air?2:0),orders:[...g.orders,order]}));
    setAirSupport(false);
    const next=sectors.find(s=>!queuedFronts.has(s.id)&&s.id!==selectedFront);
    if(next)setSelectedFront(next.id);
  };
  const removeOrder=frontId=>setGame(g=>{
    const order=g.orders.find(o=>o.front===frontId);if(!order)return g;
    return {...g,command:g.command+commands[order.tactic],supply:g.supply+supplies[order.tactic]+(order.air?2:0),orders:g.orders.filter(o=>o.front!==frontId)};
  });
  const endPhase=()=>setGame(g=>{
    const damage={...g.damage},report=[];let readiness=g.readiness;
    const coordinated=g.orders.filter(o=>o.tactic!=='regroup').length>=2;
    if(coordinated)readiness=Math.min(92,readiness+3);
    for(const order of g.orders){
      const group=sectors.find(s=>s.id===order.front);
      if(order.tactic==='regroup'){
        readiness=Math.min(92,readiness+14);
        report.push(`${group.name}: перегруппировка. Боеготовность восстановлена.`);
        continue;
      }
      const objective=objectives.find(o=>o.id===order.target);
      if(!objective)continue;
      const power=(order.tactic==='assault'?2:1)+(order.air?1:0)-(readiness<35?1:0);
      damage[objective.id]=Math.min(objective.resistance,(damage[objective.id]||0)+Math.max(1,power));
      if(order.tactic==='assault')readiness=Math.max(20,readiness-8);
      const captured=damage[objective.id]>=objective.resistance;
      report.push(`${group.name}: ${captured?'узел взят — ':`направление продвинулось к `}${objective.name.toUpperCase()}.`);
    }
    if(coordinated)report.unshift('Приказы на нескольких направлениях поддержали общий темп наступления.');
    const won=(damage.minsk||0)>=3;
    if(won)report.push('МИНСК ОСВОБОЖДЁН. Кампания завершена.');
    else if(g.orders.length===0)report.unshift('Пауза в наступлении. Противник укрепляет рубежи, снабжение пополнено.');
    return {...g,damage,readiness:Math.min(92,readiness+2),command:3,supply:Math.min(12,g.supply+2),orders:[],turn:g.turn+1,report,won};
  });
  const restart=()=>{setGame(initialGame());setSelectedFront('north');setTactic('advance');setAirSupport(false);setStarted(false)};

  return <section className="war-room" id="decision-lab">
    {!started?<div className="war-intro">
      <div className="war-intro-map"><WarMap game={game} selectedFront="north" preview/></div>
      <div className="war-intro-copy"><span className="war-kicker"><i/> ШТАБ ОПЕРАЦИИ / БЕЛАРУСЬ · 1944</span><h2>БАГРАТИОН<br/><em>НА КАРТЕ</em></h2>
        <p className="war-intro-sub">Оперативная игра о наступлении на Минск</p><p>Распределяйте приказы между направлениями, берегите снабжение и решайте, где готовить прорыв. Каждый ход меняет положение фронта.</p>
        <button className="war-launch" onClick={()=>setStarted(true)}><span>ОТКРЫТЬ ШТАБ</span><ArrowRight size={17}/></button>
        <div className="war-intro-metadata"><span>3 ГРУППЫ ВОЙСК</span><i/><span>5 УЗЛОВ ОБОРОНЫ</span><i/><span>ОДНА КАМПАНИЯ</span></div>
      </div>
      <div className="war-intro-stamp"><b>1944</b><span>ОПЕРАЦИЯ<br/>«БАГРАТИОН»</span></div>
    </div>:game.won?<div className="war-finale">
      <header className="war-topline"><span><i/> ШТАБ / СВОДКА ОПЕРАЦИИ</span><b>{phases[Math.min(Math.max(0,game.turn-1),phases.length-1)].date}</b></header>
      <div className="war-finale-layout"><div className="war-finale-map"><WarMap game={game} selectedFront="north" preview/></div><div className="war-finale-copy"><span className="war-kicker">КАМПАНИЯ ЗАВЕРШЕНА / МИНСК ВЗЯТ</span><h2>ЛИНИЯ<br/><em>ПРОРВАНА</em></h2><p>Ваши приказы привели войска к Минску. Подход к узлу и темп операции зависели от распределения командных очков, готовности частей и снабжения.</p>
        <div className="war-final-stats"><div><b>{captures} / 4</b><span>ВОСТОЧНЫХ УЗЛА</span></div><div><b>{game.turn}</b><span>ХОДОВ ДО МИНСКА</span></div><div><b>{game.readiness}</b><span>БОЕГОТОВНОСТЬ</span></div></div>
        <div className="war-final-report">{game.report.slice(-4).map((line,i)=><p key={i}>{line}</p>)}</div>
        <button className="war-launch" onClick={restart}><span>НОВАЯ КАМПАНИЯ</span><RotateCcw size={16}/></button>
      </div></div>
    </div>:<div className="war-game">
      <header className="war-game-header"><div className="war-brand"><span className="war-brand-mark">Б</span><span>ОПЕРАЦИЯ «БАГРАТИОН»<small>ОПЕРАТИВНЫЙ ШТАБ</small></span></div>
        <div className="war-current-phase"><span>ФАЗА {String(Math.min(game.turn+1,phases.length)).padStart(2,'0')} / {String(phases.length).padStart(2,'0')}</span><b>{currentPhase.date}</b></div>
        <button className="war-exit" onClick={restart}>В МЕНЮ <RotateCcw size={13}/></button>
      </header>
      <div className="war-resource-bar">
        <div className="war-phase-name"><small>ТЕКУЩАЯ ЗАДАЧА</small><b>{currentPhase.name}</b></div>
        <p>{currentPhase.note}</p>
        <div className="war-resource"><span><Zap size={14}/> КОМАНДОВАНИЕ</span><b>{game.command}<small> / 3</small></b></div>
        <div className="war-resource"><span><PackageOpen size={14}/> СНАБЖЕНИЕ</span><b>{game.supply}<small> / 12</small></b></div>
        <div className="war-readiness"><span>БОЕГОТОВНОСТЬ</span><b>{game.readiness}</b><i><u style={{width:`${game.readiness}%`}}/></i></div>
      </div>
      <div className="war-layout">
        <div className="war-map-column">
          <div className="war-map-toolbar"><span><Crosshair size={14}/> ОПЕРАТИВНАЯ КАРТА</span><span><b>ЦЕЛЬ КАМПАНИИ</b> · МИНСК</span><span>ХОД {String(game.turn+1).padStart(2,'0')}</span></div>
          <WarMap game={game} selectedFront={selectedFront} onSelectCity={selectTarget}/>
          <div className="war-front-strip">{sectors.map(s=>{const destination=targetFor(s.id,game.damage);return <button key={s.id} className={`${selectedFront===s.id?'active':''} ${queuedFronts.has(s.id)?'queued':''}`} onClick={()=>setSelectedFront(s.id)}><i style={{'--sector-color':s.color}}/><span>{s.name}</span><b>{destination?objectives.find(o=>o.id===destination).name:'РУБЕЖ ВЗЯТ'}</b></button>})}</div>
        </div>
        <aside className="war-orders-panel">
          <div className="war-orders-heading"><span className="war-kicker">ПАНЕЛЬ КОМАНДОВАНИЯ</span><h3>ПРИКАЗЫ<br/><em>НА ФРОНТ</em></h3></div>
          <div className="war-sector-summary"><img loading="lazy" decoding="async" src={ASSET} alt=""/><div><small>{sector.front}</small><b>{sector.name}</b><span>ЦЕЛЬ: {target?target.name:'НАПРАВЛЕНИЕ ВЗЯТО'}</span></div><Flag size={15}/></div>
          <div className="war-front-tabs">{sectors.map(s=><button key={s.id} className={selectedFront===s.id?'active':''} onClick={()=>setSelectedFront(s.id)} disabled={queuedFronts.has(s.id)}><span>{s.id==='north'?'СЕВЕР':s.id==='center'?'ЦЕНТР':'ЮГ'}</span>{queuedFronts.has(s.id)&&<i/>}</button>)}</div>
          <div className="war-tactics-label"><span>ВЫБЕРИТЕ ТИП ПРИКАЗА</span><small>ЦЕНА / КОМАНДЫ · СНАБЖЕНИЕ</small></div>
          <div className="war-order-list">
            <OrderCard id="advance" title="Продвижение" detail="Давление на текущий узел" command="1" supply="1" icon={ArrowRight} active={tactic==='advance'} onClick={()=>setTactic('advance')}/>
            <OrderCard id="assault" title="Подготовленный прорыв" detail="Сильный удар · снижает готовность" command="2" supply="3" icon={Target} active={tactic==='assault'} onClick={()=>setTactic('assault')}/>
            <OrderCard id="regroup" title="Перегруппировка" detail="Восстановить боеготовность" command="1" supply="0" icon={Shield} active={tactic==='regroup'} onClick={()=>{setTactic('regroup');setAirSupport(false)}}/>
          </div>
          {tactic!=='regroup'&&<button className={`war-air-support ${airSupport?'active':''}`} onClick={()=>setAirSupport(v=>!v)} disabled={game.supply<supplies[tactic]+2||!target}><span><img loading="lazy" decoding="async" src={AIRCRAFT} alt=""/><b>ПОДДЕРЖКА АВИАЦИИ</b><small>+1 к силе удара · 2 снабжения</small></span><i>{airSupport?'ВКЛ':'ВЫКЛ'}</i></button>}
          <button className="war-issue-order" onClick={addOrder} disabled={game.command<commands[tactic]||game.supply<supplies[tactic]+(airSupport&&tactic!=='regroup'?2:0)||queuedFronts.has(selectedFront)||(!target&&tactic!=='regroup')}>
            <span>{queuedFronts.has(selectedFront)?'ПРИКАЗ УЖЕ НАЗНАЧЕН':!target&&tactic!=='regroup'?'НАПРАВЛЕНИЕ ВЗЯТО':'ВЫДАТЬ ПРИКАЗ'}</span><ArrowRight size={16}/>
          </button>
          <div className="war-queued-orders"><div><span>ПЛАН ОПЕРАЦИИ</span><small>{game.orders.length} ПРИКАЗА</small></div>
            {game.orders.length?game.orders.map(o=>{const fs=sectors.find(s=>s.id===o.front);return <article key={o.front}><i style={{'--sector-color':fs.color}}/><span><b>{fs.name}</b><small>{tacticNames[o.tactic]}{o.target?` / ${objectives.find(x=>x.id===o.target)?.name}`:''}{o.air?' / АВИАЦИЯ':''}</small></span><button aria-label="Отменить приказ" onClick={()=>removeOrder(o.front)}>×</button></article>}):<p>Выберите направление и внесите приказ в штабной план.</p>}
          </div>
          <button className="war-resolve" onClick={endPhase} disabled={!game.orders.length}><span>РАЗЫГРАТЬ ФАЗУ</span><ArrowRight size={17}/></button>
          {game.report.length>0&&<div className="war-report"><span><Radio size={12}/> ПОСЛЕДНЯЯ СВОДКА</span>{game.report.slice(-2).map((line,i)=><p key={i}>{line}</p>)}</div>}
        </aside>
      </div>
      <footer className="war-game-footer"><span>ОБОБЩЁННАЯ ОПЕРАТИВНАЯ СХЕМА · НЕ ОТРАЖАЕТ ТОЧНОЕ ПОЛОЖЕНИЕ ВОЙСК</span><span>СОБРАНО УЗЛОВ: <b>{captures} / 4</b></span><div className="war-turn-track">{phases.slice(0,5).map((p,i)=><i key={p.name} className={i<=game.turn?'passed':''}/>)}</div></footer>
    </div>}
  </section>;
}
