import React, {useEffect, useRef, useState} from 'react';
import {AnimatePresence, motion, useReducedMotion} from 'framer-motion';
import {ArrowLeft, ArrowUpRight, RotateCcw, X} from 'lucide-react';
import {frontDossiers} from './frontDossierData.js';
import './map-immersion.css';

const directions = [
  {place:'Витебск',date:'23–26 июня 1944',river:'Западная Двина',title:'Витебское направление',route:'Прорыв обороны · выход к Западной Двине',terrain:'river'},
  {place:'Орша',date:'23–27 июня 1944',river:'Днепр',title:'Оршанское направление',route:'Прорыв обороны · развитие наступления к Березине',terrain:'road'},
  {place:'Могилёв',date:'23–28 июня 1944',river:'Днепр',title:'Могилёвское направление',route:'Преодоление речных рубежей · освобождение Могилёва',terrain:'river'},
  {place:'Бобруйск',date:'24–29 июня 1944',river:'Березина',title:'Бобруйское направление',route:'Сходящиеся удары · окружение бобруйской группировки',terrain:'marsh'},
];

// A deliberately schematic landscape: no invented elevations or unit positions.
function Terrain({direction}) {
  const trees=Array.from({length:42},(_,i)=>({x:75+(i*137)%1050,y:180+(i*83)%390}));
  return <svg className="immersion-terrain" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs><linearGradient id="terrain-light" x2="0" y2="1"><stop stopColor="#70817a"/><stop offset="1" stopColor="#182e2b"/></linearGradient><linearGradient id="river-light"><stop stopColor="#94b9b3"/><stop offset="1" stopColor="#3c7475"/></linearGradient><pattern id="terrain-grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M60 0H0V60" fill="none" stroke="#c8d0b6" strokeOpacity=".09"/></pattern></defs>
    <path d="M-100 290Q200 160 420 245T860 215T1300 240V800H-100Z" fill="url(#terrain-light)"/>
    <path d="M-100 350Q170 195 450 310T920 270T1300 330V800H-100Z" fill="#52685b" opacity=".65"/>
    <path d="M-100 460Q270 275 610 430T1300 350V800H-100Z" fill="#344f42"/>
    <path d="M-100 290Q200 160 420 245T860 215T1300 240V800H-100Z" fill="url(#terrain-grid)"/>
    {[0,1,2,3,4,5].map(i=><path key={i} d={`M-30 ${330+i*50}Q260 ${180+i*65} 560 ${335+i*42}T1230 ${300+i*58}`} fill="none" stroke="#c6cdb5" strokeOpacity=".12"/>)}
    <path d="M860 170C640 300 960 360 690 440S350 545 485 750" fill="none" stroke="#183e40" strokeWidth="68"/>
    <path d="M860 170C640 300 960 360 690 440S350 545 485 750" fill="none" stroke="url(#river-light)" strokeWidth="48"/>
    <path d="M860 170C640 300 960 360 690 440S350 545 485 750" fill="none" stroke="#b2d2cb" strokeOpacity=".28" strokeWidth="2"/>
    <path d="M120 700Q380 420 680 410T1050 170" fill="none" stroke="#26342a" strokeWidth="30"/>
    <path d="M120 700Q380 420 680 410T1050 170" fill="none" stroke="#c1b394" strokeWidth="19"/>
    <path d="M120 700Q380 420 680 410T1050 170" fill="none" stroke="#eee0b8" strokeOpacity=".35" strokeWidth="2" strokeDasharray="9 14"/>
    <path d="M722 384L771 365" stroke="#b7a88a" strokeWidth="32"/><path d="M722 384L771 365" stroke="#3a4238" strokeWidth="2" strokeDasharray="3 4"/>
    {trees.map((t,i)=><g key={i} transform={`translate(${t.x} ${t.y}) scale(${.45+t.y/800})`}><ellipse cy="9" rx="17" ry="5" fill="#071c18" opacity=".3"/><path d="M0 9V-22" stroke="#77765a" strokeWidth="3"/><path d="M0-49-16-17H-10L-21 0H21L10-17H16Z" fill={i%2?'#24463b':'#1b3c32'}/></g>)}
    {direction.terrain==='marsh'&&[0,1,2,3,4].map(i=><ellipse key={i} cx={140+i*95} cy={400+i*36} rx="50" ry="9" fill="#7d9c85" opacity=".3"/>)}
    <path d="M280 600Q430 460 660 425" fill="none" stroke="#e8c18b" strokeWidth="3" strokeDasharray="8 8"/>
    <path d="m648 417 18 7-12 14" fill="none" stroke="#e8c18b" strokeWidth="3"/>
  </svg>;
}

export default function MapImmersion({initialDirection,onClose}) {
  const [selected,setSelected]=useState(initialDirection),[detail,setDetail]=useState(false),[modelState,setModelState]=useState('loading');
  const reduced=useReducedMotion(),viewer=useRef(null),panel=useRef(null);
  const direction=directions[selected],front=frontDossiers[selected];
  useEffect(()=>{
    const restore=document.activeElement;panel.current?.focus({preventScroll:true});
    return()=>restore?.focus({preventScroll:true});
  },[]);
  useEffect(()=>{
    const key=e=>{if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();detail?setDetail(false):onClose()}};
    document.addEventListener('keydown',key,true);return()=>document.removeEventListener('keydown',key,true);
  },[detail,onClose]);
  useEffect(()=>{
    let live=true;const node=viewer.current;
    const ready=()=>setModelState('ready'),failed=()=>setModelState('error');
    node?.addEventListener('load',ready);node?.addEventListener('error',failed);
    import('@google/model-viewer').catch(()=>{if(live)setModelState('error')});
    return()=>{live=false;node?.removeEventListener('load',ready);node?.removeEventListener('error',failed)};
  },[]);
  const duration=reduced?0:1.1;
  return <motion.div ref={panel} tabIndex={-1} className={'map-immersion '+(detail?'is-object':'')} role="region" aria-label="Направления наступления: пространственная экспозиция" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:reduced?0:.45}}>
    <div className="immersion-sky"/><div className="immersion-horizon"/>
    <motion.div className="immersion-ground" initial={{y:180,scale:1.35,opacity:0}} animate={{y:0,scale:detail?1.13:1,opacity:detail ? .35 : 1}} transition={{duration}}><Terrain direction={direction}/></motion.div>
    <header className="immersion-header"><button onClick={()=>detail?setDetail(false):onClose()}><ArrowLeft size={16}/>{detail?'К направлению':'К карте наступления'}</button><span>ПРОСТРАНСТВЕННАЯ ЭКСПОЗИЦИЯ <i/> 1944</span><button className="immersion-close" onClick={onClose} aria-label="Закрыть пространственную экспозицию"><X size={18}/></button></header>
    <nav className="immersion-directions" aria-label="Направления наступления">{directions.map((d,i)=><button key={d.place} aria-pressed={selected===i} onClick={()=>{setSelected(i);setDetail(false)}}><small>0{i+1}</small>{d.place}</button>)}</nav>
    <AnimatePresence mode="wait"><motion.div key={detail?'object':selected} className="immersion-copy" initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} transition={{duration:reduced?0:.3}}>
      <span className="immersion-eyebrow">{detail?'СРЕДНИЙ ТАНК · 1944':direction.date}</span><h3>{detail?'Т-34-85':direction.title}</h3>
      <p>{detail?'Увеличенная башня вмещала трёх членов экипажа. 85-мм пушка усилила вооружение танка; экипаж машины состоял из пяти человек.':front.summary}</p>
      {detail?<><dl className="immersion-specs"><div><dt>Орудие</dt><dd>85 мм</dd></div><div><dt>Экипаж</dt><dd>5 чел.</dd></div><div><dt>Масса</dt><dd>32 т</dd></div></dl><a className="immersion-source" href="https://tankmuseum.org/tank-nuts/tank-collection/t-34-85/" target="_blank" rel="noreferrer">Музейная справка <ArrowUpRight size={14}/></a></>:<><span className="immersion-front">{front.name}</span><p className="immersion-task">{front.task}</p><button className="immersion-examine" onClick={()=>setDetail(true)}>Рассмотреть Т-34-85 <ArrowUpRight size={17}/></button></>}
    </motion.div></AnimatePresence>
    <motion.div className="immersion-object" animate={{opacity:1,y:detail?-22:22,scale:detail?1.18:.8}} initial={{opacity:0,y:100}} transition={{duration}} style={{opacity:1}}>
      {modelState!=='error'?<model-viewer ref={viewer} src="/assets/tech/t-34-85.glb" alt="Т-34-85 — объёмная модель среднего танка" camera-controls={detail?true:undefined} disable-pan interaction-prompt="none" camera-orbit={detail?'225deg 70deg 85%':'225deg 80deg 100%'} min-camera-orbit="auto 35deg 65%" max-camera-orbit="auto 88deg 150%" environment-image="neutral" exposure="1.15" shadow-intensity="1" shadow-softness=".8" loading="eager" touch-action="pan-y"><div slot="progress-bar"/></model-viewer>:<img decoding="async" src="/assets/tech/catalog/t34.lossless.webp" alt="Т-34-85"/>}
      {modelState==='loading'&&<span className="immersion-loading" role="status">Загрузка модели…</span>}
      {!detail&&<button className="immersion-object-hit" onClick={()=>setDetail(true)} aria-label="Рассмотреть модель Т-34-85"/>}
    </motion.div>
    {!detail&&<><span className="immersion-river">{direction.river}<small>РЕЧНОЙ РУБЕЖ</small></span><div className="immersion-route"><span>НАПРАВЛЕНИЕ НАСТУПЛЕНИЯ</span><p>{direction.route}</p></div><button className="immersion-object-label" onClick={()=>setDetail(true)}><i/>Т-34-85<small>РАССМОТРЕТЬ МОДЕЛЬ <ArrowUpRight size={13}/></small></button></>}
    <div className="immersion-foot"><span>{detail?<><RotateCcw size={14}/> Поворачивайте модель мышью или касанием</>:'Условный ландшафт · не реконструкция конкретного участка'}<small>Модель представляет тип техники, а не отдельную машину на этом направлении.</small></span><b>{detail?'03 / ТЕХНИКА':'02 / НАПРАВЛЕНИЕ'}</b></div>
  </motion.div>;
}
