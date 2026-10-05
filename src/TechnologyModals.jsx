import React, {useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {AnimatePresence, motion} from 'framer-motion';
import {ArrowLeft, ArrowRight, RotateCcw, X} from 'lucide-react';
import './technology-modals.css';
import {equipment as verifiedEquipment} from './technologyData.js';

function ModelStage({item}){
  const viewer=useRef(null);
  const [state,setState]=useState('loading');
  useEffect(()=>{
    let live=true;
    setState('loading');
    import('@google/model-viewer').catch(()=>{if(live)setState('error')});
    const node=viewer.current;
    const loaded=()=>{if(live)setState('ready')};
    const failed=()=>{if(live)setState('error')};
    node?.addEventListener('load',loaded);
    node?.addEventListener('error',failed);
    return()=>{live=false;node?.removeEventListener('load',loaded);node?.removeEventListener('error',failed)};
  },[item.id]);
  if(state==='error')return <img decoding="async" className="equipment-fallback" src={item.image} alt={item.name}/>;
  return <div className="equipment-viewer-wrap">
    <model-viewer ref={viewer} src={item.model} alt={`Интерактивная модель ${item.name}`} camera-controls disable-pan interaction-prompt="none" loading="eager" reveal="auto" camera-orbit={item.id==='t34'?'225deg 70deg 85%':'35deg 70deg 85%'} environment-image="neutral" exposure="1.15" shadow-intensity="0.35" touch-action="pan-y"/>
    {state==='loading'&&<span className="equipment-loading">ЗАГРУЗКА 3D-МОДЕЛИ…</span>}
    <span className="equipment-drag"><RotateCcw size={13}/> ПЕРЕТАЩИТЕ, ЧТОБЫ ПОВЕРНУТЬ</span>
  </div>;
}

export default function TechnologyModals({category,onClose}){
  const [selected,setSelected]=useState(null);
  const panel=useRef(null);
  const restore=useRef(document.activeElement);
  const items=verifiedEquipment[category]||[];
  const panelTitle={tanks:'ТАНКИ',artillery:'ПОЛЕВАЯ АРТИЛЛЕРИЯ',aviation:'АВИАЦИЯ',transport:'ТРАНСПОРТ',signals:'СВЯЗЬ',engineering:'ИНЖЕНЕРНЫЕ ЧАСТИ'}[category]||'ТЕХНИКА';
  const back=()=>selected?setSelected(null):onClose();
  useEffect(()=>{
    const previous=document.body.style.overflow;
    document.body.style.overflow='hidden';
    return()=>{document.body.style.overflow=previous;restore.current?.focus()};
  },[]);
  useEffect(()=>{
    panel.current?.focus();
    const key=e=>{
      if(e.key==='Escape'){e.preventDefault();back()}
      if(e.key!=='Tab'||!panel.current)return;
      const focusable=[...panel.current.querySelectorAll('button,a,model-viewer')].filter(el=>el.getClientRects().length);
      if(!focusable.length)return;
      const first=focusable[0],last=focusable.at(-1);
      if(e.shiftKey&&(document.activeElement===first||document.activeElement===panel.current)){e.preventDefault();last.focus()}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
    };
    document.addEventListener('keydown',key);
    return()=>document.removeEventListener('keydown',key);
  },[selected,category]);
  return createPortal(<motion.div className="equipment-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onMouseDown={e=>{if(e.target===e.currentTarget)back()}}>
    <AnimatePresence mode="wait" initial={false}>
      <motion.section key={selected?.id||category} ref={panel} className={'equipment-dialog '+(selected?'equipment-detail':'equipment-category')} role="dialog" aria-modal="true" aria-label={selected?selected.name:panelTitle} tabIndex={-1} initial={{opacity:0,y:28,scale:.97}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:18,scale:.98}} transition={{duration:.28,ease:[.22,1,.36,1]}}>
        <header className="equipment-head"><span>Б / КАТАЛОГ ТЕХНИКИ <i/> {selected?panelTitle:'1944'}</span><button type="button" onClick={back} aria-label={selected?'Вернуться к списку техники':'Закрыть категорию'}>{selected?<ArrowLeft size={19}/>:<X size={20}/>}</button></header>
        {selected?<div className="equipment-detail-layout">
          <div className="equipment-main-visual">{selected.model?<ModelStage item={selected}/>:<img decoding="async" src={selected.image} alt={selected.name}/>}<span className="equipment-object-label detail-label"><b>{selected.name}</b><small>{selected.type}</small></span><span className="equipment-visual-index">{selected.model?'ИНТЕРАКТИВНАЯ 3D-МОДЕЛЬ':'ХУДОЖЕСТВЕННАЯ ИЛЛЮСТРАЦИЯ'}</span></div>
          <div className="equipment-info"><span className="equipment-kicker">{selected.type}</span><h2>{selected.name}</h2><p>{selected.description}</p><div className="equipment-specs">{selected.specs.map(([label,value])=><div key={label}><small>{label}</small><strong>{value}</strong></div>)}</div><button className="equipment-back" onClick={()=>setSelected(null)}><ArrowLeft size={15}/> К СПИСКУ ТЕХНИКИ</button></div>
        </div>:<div className="equipment-list-content"><div className="equipment-intro"><span className="equipment-kicker">ОБЕСПЕЧЕНИЕ / ТЕХНИКА</span><h2>{panelTitle}</h2></div><div className="equipment-grid">{items.map((item,index)=><motion.button key={item.id} type="button" className="equipment-card" onClick={()=>setSelected(item)} whileHover={{y:-7}} transition={{duration:.2}}><span className="equipment-card-index">0{index+1} / {item.type}</span><span className="equipment-card-visual"><img decoding="async" src={item.image} alt="" loading="lazy"/><span className="equipment-object-label"><b>{item.name}</b><small>{item.type}</small></span></span><span className="equipment-card-copy"><small>{item.short}</small><em>ОТКРЫТЬ <ArrowRight size={14}/></em></span></motion.button>)}</div></div>}
      </motion.section>
    </AnimatePresence>
  </motion.div>,document.body);
}
