import React,{useEffect,useRef,useState} from 'react';
import {tourStops,comicFrames,tourFocus} from './murvikTour.js';
import './murvik-tour.css';
import MurvikImage from './MurvikImage.jsx';

export default function MurvikTour({onClose}){
 const [index,setIndex]=useState(0),[playing,setPlaying]=useState(true),[speed,setSpeed]=useState(1),[finished,setFinished]=useState(false);
 const [notice,setNotice]=useState(''),[relocate,setRelocate]=useState(0);
 const [frameIndex,setFrameIndex]=useState(0),[dim,setDim]=useState(true);
 const [position,setPosition]=useState({left:24,top:100});
 const [box,setBox]=useState(null),[collapsed,setCollapsed]=useState(false);
 const panel=useRef(null),copy=useRef(null),epoch=useRef(0);
 const pose=['sit','stand','rest','attentive'][(index+frameIndex)%4];
 useEffect(()=>{for(const name of ['sit','stand','rest','attentive']){const img=new Image();img.src=`/assets/murvik-tour/natural-v2/${name}.webp`;}},[]);
 const step=tourStops[index],frames=comicFrames(step.text);
 const line=frames[Math.min(frameIndex,frames.length-1)];
 const duration=Math.max(6500,line.split(/\s+/).length/2.6*1000+1500)/speed;
 const go=(next,last=false)=>{setFinished(false);setFrameIndex(last?comicFrames(tourStops[next].text).length-1:0);setIndex(next);setRelocate(v=>v+1);};
 useEffect(()=>{panel.current?.querySelector('button')?.focus();const key=e=>{if(e.key==='Escape'){e.preventDefault();onClose();}};document.addEventListener('keydown',key);return()=>document.removeEventListener('keydown',key);},[onClose]);
 useEffect(()=>{
  document.body.classList.add('murvik-tour-active');
  return()=>{document.body.classList.remove('murvik-tour-active');window.dispatchEvent(new CustomEvent('murvik:tour-end'));};
 },[]);
 useEffect(()=>{
  window.dispatchEvent(new CustomEvent('murvik:tour-step',{detail:{event:step.event||null}}));
  copy.current?.scrollTo({top:0});
  let highlight=null,frame=0;
  const detail=frameIndex>=Math.ceil(frames.length/2);
  const focusSelector=step.event?(detail?'#map .map-event-summary':step.target):tourFocus[step.section]?.[detail?1:0];
  const target=document.querySelector(focusSelector||`#${step.section}`)||document.getElementById(step.section);
  const view=step.event&&!detail?document.querySelector(step.view):target;
  if(!target||!view){setNotice('Этот материал сейчас недоступен. Можно перейти к следующей остановке.');setBox(null);return;}
  setNotice('');
  highlight=target;highlight.classList.add('murvik-tour-target');
  // The map updates its marker classes after receiving the selected date.
  const markerObserver=new MutationObserver(()=>{if(!target.classList.contains('murvik-tour-target'))target.classList.add('murvik-tour-target');schedule();});
  const mobile=innerWidth<=650;
  const rect=view.getBoundingClientRect();
  const destination=Math.max(0,scrollY+rect.top-(mobile?76:100));
  // Long jumps (including restarting from the archive) should reveal the new stop promptly.
  const instant=matchMedia('(prefers-reduced-motion: reduce)').matches||Math.abs(destination-scrollY)>innerHeight*2;
  window.scrollTo({top:destination,behavior:instant?'instant':'smooth'});
  const measure=()=>{frame=0;const mobile=innerWidth<=650;const r=target.getBoundingClientRect();const pad=step.event&&!detail?25:12;const top=Math.max(70,r.top-pad),left=Math.max(6,r.left-pad),right=Math.min(innerWidth-6,r.right+pad),end=Math.min(innerHeight-12,r.bottom+pad);setBox(end>top&&right>left?{top,left,width:right-left,height:end-top}:null);
   const pw=panel.current?.offsetWidth||400,ph=panel.current?.offsetHeight||400;
   // A stationary guide: only the illustrated pose changes during the story.
   const x=mobile?8:innerWidth-pw-20;
   const desired=innerHeight-ph-(mobile?12:20);
   setPosition({left:Math.max(8,x),top:Math.max(8,Math.min(desired,innerHeight-ph-8))});
  };
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(measure);};
  markerObserver.observe(target,{attributes:true,attributeFilter:['class','style']});
  const observer=new ResizeObserver(schedule);observer.observe(view);if(panel.current)observer.observe(panel.current);
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);measure();
  return()=>{markerObserver.disconnect();highlight?.classList.remove('murvik-tour-target');observer.disconnect();cancelAnimationFrame(frame);removeEventListener('scroll',schedule);removeEventListener('resize',schedule);};
 },[index,frameIndex,relocate,step,collapsed]);
 useEffect(()=>{
  const token=++epoch.current;let timer;
  const advance=()=>{if(epoch.current!==token)return;if(frameIndex<frames.length-1)setFrameIndex(f=>f+1);else if(index===tourStops.length-1){setFinished(true);setPlaying(false);}else{setFrameIndex(0);setIndex(i=>i+1);}};
  if(!playing||document.hidden)return;
  timer=setTimeout(advance,duration);
  return()=>{epoch.current++;clearTimeout(timer);};
 },[index,frameIndex,playing,speed,step]);
 useEffect(()=>{const hidden=()=>{if(document.hidden)setPlaying(false);};document.addEventListener('visibilitychange',hidden);return()=>document.removeEventListener('visibilitychange',hidden);},[]);
 return <>
  {box?<div className={`murvik-tour-spotlight ${dim?'is-dimmed':''}`} style={box} aria-hidden="true"/>:dim&&<div className="murvik-tour-veil" aria-hidden="true"/>}
  <aside ref={panel} style={{left:position.left,top:position.top}} data-pose={pose} className={`murvik-tour comic-tour roaming-tour ${collapsed?'is-collapsed':''}`} aria-label="Экскурсия с Мурвиком">
   <div className="murvik-tour-character" aria-hidden="true"><MurvikImage src={`/assets/murvik-tour/natural-v2/${pose}.webp`} blinkSrc={`/assets/murvik-tour/natural-v2/${pose}-blink.webp`} alt=""/></div>
   <header><div><small>МУРВIК · ТВОЙ ПРОВОДНИК</small><strong>{finished?'Спасибо за путешествие!':playing?'Следуй за мной!':'Экскурсия на паузе'}</strong></div><button onClick={()=>setCollapsed(v=>!v)} aria-label={collapsed?'Развернуть рассказ':'Свернуть рассказ'} aria-expanded={!collapsed}>{collapsed?'+':'−'}</button><button onClick={onClose} aria-label="Завершить экскурсию">×</button></header>
   <div className="murvik-tour-progress" role="progressbar" aria-label="Прогресс экскурсии" aria-valuemin={1} aria-valuemax={tourStops.length} aria-valuenow={index+1}><i style={{width:`${(index+1)/tourStops.length*100}%`}}/></div>
   {!collapsed&&<><div className="murvik-tour-route"><label htmlFor="murvik-tour-stop">Остановка {index+1} из {tourStops.length}</label><select id="murvik-tour-stop" value={index} onChange={e=>go(Number(e.target.value))}>{tourStops.map((s,i)=><option key={i} value={i}>{i+1}. {s.title}</option>)}</select></div>
    <div className="murvik-comic-caption"><span>ГЛАВА {String(index+1).padStart(2,'0')}</span><span>КАДР {frameIndex+1} / {frames.length}</span></div>
    <div className="murvik-tour-copy" ref={copy} tabIndex={0} aria-label="Рассказ экскурсовода"><h2>{step.title}</h2><div className="murvik-comic-bubble" key={`${index}-${frameIndex}`}><small>МУРВIК ГОВОРИТ</small><p aria-live="polite" aria-atomic="true">{line}</p></div><p className="murvik-tour-look">↗ {step.look}</p>{step.source&&<a href={step.source.url} target="_blank" rel="noreferrer">Источник ↗</a>}</div>
    <div className="murvik-comic-frames" aria-label="Кадры рассказа">{frames.map((_,i)=><button key={i} aria-label={`Кадр ${i+1}`} aria-current={i===frameIndex?'step':undefined} onClick={()=>{setFinished(false);setFrameIndex(i);}}><i key={`${index}-${frameIndex}-${playing}-${speed}`} style={i===frameIndex?{animationDuration:`${duration}ms`,animationPlayState:playing?'running':'paused'}:undefined}/></button>)}</div>
    <div className="murvik-tour-options"><button onClick={()=>setDim(v=>!v)} aria-pressed={dim}>Фокус: {dim?'вкл.':'выкл.'}</button><button onClick={()=>setSpeed(v=>v===3?1:v+1)} aria-label={`Скорость экскурсии ×${speed}. Переключить скорость`}>Скорость: ×{speed}</button><button onClick={()=>setRelocate(v=>v+1)}>Показать на сайте ↗</button></div>
    {notice&&<p className="murvik-tour-notice" role="status">{notice}</p>}
   </>}
   <nav aria-label="Управление экскурсией"><button disabled={index===0&&frameIndex===0} onClick={()=>frameIndex>0?setFrameIndex(f=>f-1):go(index-1,true)} aria-label="Предыдущий кадр">←</button><button className="murvik-tour-play" onClick={()=>{if(finished){go(0);setPlaying(true);}else setPlaying(v=>!v);}}>{finished?'Повторить маршрут':playing?'Ⅱ Пауза':'▶ Продолжить'}</button><button disabled={index===tourStops.length-1&&frameIndex===frames.length-1} onClick={()=>frameIndex<frames.length-1?setFrameIndex(f=>f+1):go(index+1)} aria-label="Следующий кадр">→</button></nav>
   {!collapsed&&<small className="murvik-tour-help">Следуй за мной — я покажу самое интересное. На паузе можно изучать сайт. </small>}
  </aside>
 </>;
}
