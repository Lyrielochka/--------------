import React, {useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {AnimatePresence, motion} from 'framer-motion';
import {ArrowLeft, ArrowRight, RotateCcw, X} from 'lucide-react';
import './technology-modals.css';
import {equipment as verifiedEquipment} from './technologyData.js';

const equipment={
  tanks:[
    {id:'t34',name:'Т-34-85',type:'Средний танк',short:'Манёвренный средний танк с 85-мм пушкой и экипажем из пяти человек.',description:'Модернизированный Т-34 получил увеличенную башню для трёх членов экипажа и 85-мм орудие. В 1944 году он стал одной из основных машин подвижных соединений Красной армии.',specs:[['Орудие','85 мм'],['Экипаж','5 человек'],['Масса','около 32 т'],['Тип','средний танк']],model:'/assets/tech/t-34-85.glb',image:'/assets/tech/tech-t34-85.png',source:'https://tankmuseum.org/tank-nuts/tank-collection/t-34-85/'},
    {id:'is2',name:'ИС-2',type:'Тяжёлый танк',short:'Тяжёлая машина прорыва с 122-мм пушкой Д-25Т.',description:'ИС-2 сочетал мощное 122-мм орудие с тяжёлой бронёй. Такие танки использовались для усиления ударных частей и преодоления укреплённой обороны.',specs:[['Орудие','122 мм Д-25Т'],['Экипаж','4 человека'],['Масса','около 46 т'],['Тип','тяжёлый танк']],model:'/assets/tech/is-2.glb',image:'/assets/tech/tech-is2.png',source:'https://www.kskdivniy.ru/museum/eksponaty/is-2/'},
    {id:'m4a2',name:'M4A2 «Шерман»',type:'Средний танк · ленд-лиз',short:'Американский средний танк, применявшийся советскими соединениями в операции.',description:'Поставленные по ленд-лизу M4A2 находились в составе советских механизированных корпусов во время Белорусской операции. В каталоге показана машина с 75-мм орудием.',specs:[['Орудие','75 мм'],['Экипаж','5 человек'],['Происхождение','США · ленд-лиз'],['Тип','средний танк']],image:'/assets/tech/tech-t34-85.png',source:'https://journals.narfu.ru/index.php/gum/article/view/1329'},
  ],
  artillery:[
    {id:'zis3',name:'ЗИС-3',type:'Дивизионная пушка',short:'76-мм орудие для огневой поддержки и борьбы с бронетехникой.',description:'ЗИС-3 стала одной из самых массовых советских артиллерийских систем военного времени. Её использовали в дивизионной и противотанковой артиллерии.',specs:[['Калибр','76,2 мм'],['Образец','1942 год'],['Класс','дивизионная пушка'],['Лафет','раздвижные станины']],image:'/assets/tech/tech-zis3.png',source:'https://www.old.artillery-museum.ru/ru/basic/artilleriya-v-gody-velikoj-otechestvennoj-vojny-1941-1943-gg.html'},
    {id:'m30',name:'М-30',type:'Полевая гаубица',short:'122-мм гаубица для огня по укреплениям и позициям противника.',description:'Гаубица образца 1938 года получила раздвижные станины, расширившие сектор обстрела. Она обеспечивала дивизиям мощную огневую поддержку.',specs:[['Калибр','122 мм'],['Образец','1938 год'],['Класс','полевая гаубица'],['Лафет','раздвижные станины']],image:'/assets/tech/tech-zis3.png',source:'https://www.old.artillery-museum.ru/ru/basic/istoriya-artillerii-s-1918-g.-po-iyul-1941-g.html'},
    {id:'ml20',name:'МЛ-20',type:'Тяжёлая гаубица-пушка',short:'152-мм система для дальнего огня и разрушения укреплений.',description:'МЛ-20 — 152-мм гаубица-пушка образца 1937 года. Тяжёлая артиллерия такого класса поддерживала прорыв обороны и поражала цели в глубине.',specs:[['Калибр','152 мм'],['Образец','1937 год'],['Класс','гаубица-пушка'],['Роль','тяжёлая артиллерия']],image:'/assets/tech/tech-zis3.png',source:'https://www.artillery-museum.ru/assets/files/konferenciya_vio_2016_v_tom_cv.pdf'},
  ]
};

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
  if(state==='error')return <img className="equipment-fallback" src={item.image} alt={item.name}/>;
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
          <div className="equipment-main-visual">{selected.model?<ModelStage item={selected}/>:<img src={selected.image} alt={selected.name}/>}<span className="equipment-object-label detail-label"><b>{selected.name}</b><small>{selected.type}</small></span><span className="equipment-visual-index">{selected.model?'ИНТЕРАКТИВНАЯ 3D-МОДЕЛЬ':'ХУДОЖЕСТВЕННАЯ ИЛЛЮСТРАЦИЯ'}</span></div>
          <div className="equipment-info"><span className="equipment-kicker">{selected.type}</span><h2>{selected.name}</h2><p>{selected.description}</p><div className="equipment-specs">{selected.specs.map(([label,value])=><div key={label}><small>{label}</small><strong>{value}</strong></div>)}</div><button className="equipment-back" onClick={()=>setSelected(null)}><ArrowLeft size={15}/> К СПИСКУ ТЕХНИКИ</button></div>
        </div>:<div className="equipment-list-content"><div className="equipment-intro"><span className="equipment-kicker">ОБЕСПЕЧЕНИЕ / ТЕХНИКА</span><h2>{panelTitle}</h2></div><div className="equipment-grid">{items.map((item,index)=><motion.button key={item.id} type="button" className="equipment-card" onClick={()=>setSelected(item)} whileHover={{y:-7}} transition={{duration:.2}}><span className="equipment-card-index">0{index+1} / {item.type}</span><span className="equipment-card-visual"><img src={item.image} alt="" loading="lazy"/><span className="equipment-object-label"><b>{item.name}</b><small>{item.type}</small></span></span><span className="equipment-card-copy"><small>{item.short}</small><em>ОТКРЫТЬ <ArrowRight size={14}/></em></span></motion.button>)}</div></div>}
      </motion.section>
    </AnimatePresence>
  </motion.div>,document.body);
}
