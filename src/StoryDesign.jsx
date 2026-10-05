import React, {useRef, useState} from 'react';
import {motion, useReducedMotion, useScroll, useTransform} from 'framer-motion';
import {Users, Shield, Crosshair, Plane} from 'lucide-react';
import './personnel.css';

const number = new Intl.NumberFormat('ru-RU');

export function ChapterBreak({number:chapter, label, title, detail}) {
  const ref=useRef(null), reduced=useReducedMotion();
  const {scrollYProgress}=useScroll({target:ref,offset:['start end','end center']});
  const width=useTransform(scrollYProgress,[0,.85],['0%','100%']);
  return <section ref={ref} className="story-chapter" aria-label={label}>
    <div className="chapter-register" aria-hidden="true"><span>{chapter}</span><i/><b>1944</b></div>
    <div className="chapter-copy"><span>{label}</span><h2>{title}</h2><p>{detail}</p></div>
    <div className="chapter-rule" aria-hidden="true"><motion.i style={{width:reduced?'100%':width}}/></div>
  </section>;
}

export function CampaignFigures({data:d}) {
  const [selected,setSelected]=useState(0), reduced=useReducedMotion();
  const comparisons=[
    {label:'Люди',icon:Users,unit:'военнослужащих',a:d.forces.soviet,b:d.forces.enemy,extra:''},
    {label:'Бронетехника',icon:Shield,unit:'танков и самоходных орудий',a:d.forces.tanks,b:d.forces.enemyTanks,extra:''},
    {label:'Артиллерия',icon:Crosshair,unit:'орудий и миномётов',a:d.forces.guns,b:d.forces.enemyGuns,extra:'+'},
    {label:'Авиация',icon:Plane,unit:'самолётов',a:d.forces.planes,b:d.forces.enemyPlanes,extra:'+'},
  ];
  const item=comparisons[selected];
  const illustrations=[{soviet:'soviet-helmet.lossless.webp',german:'german-helmet.lossless.webp'},{soviet:'soviet-t34-right.lossless.webp',german:'german-tiger-left.lossless.webp'},{soviet:'soviet-zis3-right.lossless.webp',german:'german-88mm-left.lossless.webp'},{soviet:'soviet-il2-right.lossless.webp',german:'german-fw190-left.lossless.webp'}][selected];
  const ratio=(item.a/item.b).toLocaleString('ru-RU',{maximumFractionDigits:1});
  return <section className="campaign-figures section" id="results" aria-labelledby="figures-heading">
    <div className="figures-heading"><span className="section-kicker">ИТОГИ / 23 ИЮНЯ — 29 АВГУСТА</span><h2 id="figures-heading">Масштаб<br/><em>освобождения.</em></h2></div>
    <div className="campaign-reach">
      <article className="reach-days"><span>ПРОДОЛЖИТЕЛЬНОСТЬ</span><strong>{d.operation.days}<small>дней</small></strong><p>Лето, изменившее линию фронта.</p><div className="day-stitches" aria-hidden="true">{Array.from({length:d.operation.days},(_,i)=><motion.i key={i} initial={reduced?false:{scaleY:0}} whileInView={{scaleY:1}} viewport={{once:true}} transition={{delay:reduced?0:i*.008,duration:.4}}/>)}</div></article>
      <article><span>ШИРИНА ФРОНТА</span><strong><small>до</small>{number.format(d.operation.frontKm)}<small>км</small></strong><div className="reach-measure" aria-hidden="true"><i/><b/><i/></div></article>
      <article><span>ПРОДВИЖЕНИЕ НА ЗАПАД</span><strong><small>до</small>{number.format(d.operation.advanceKm)}<small>км</small></strong><div className="reach-measure westward" aria-hidden="true"><i/><b/><i/></div></article>
    </div>
    <div className="force-comparison">
      <div className="comparison-heading"><div><span className="section-kicker">СООТНОШЕНИЕ СИЛ</span><h3>С чем вступили в бой.</h3></div><div className="comparison-switch" aria-label="Вид сил">{comparisons.map((option,i)=><button key={option.label} aria-pressed={selected===i} onClick={()=>setSelected(i)}><option.icon size={16}/>{option.label}</button>)}</div></div>
      <div className="comparison-chart" aria-live="polite" aria-atomic="true">
        {[{name:'СССР',value:item.a,extra:item.extra,side:'soviet'},{name:'Германия',value:item.b,extra:'≈ ',side:'german'}].map(row=><div className={'force-row '+row.side} key={row.side}>
          {illustrations&&<div className="force-equipment" aria-hidden="true"><motion.img key={illustrations[row.side]} src={(selected===0?'/assets/personnel/':'/assets/scale/')+illustrations[row.side]} alt="" initial={reduced?false:{opacity:0,x:row.side==='soviet'?-18:18}} animate={{opacity:1,x:0}} transition={{duration:.45}}/></div>}
          <div className="force-label"><span>{row.name}</span><strong>{row.side==='german'&&row.extra}{number.format(row.value)}{row.side==='soviet'&&row.extra}</strong></div>
          <div className="force-track" aria-hidden="true"><motion.i initial={false} animate={{width:`${row.value/item.a*100}%`}} transition={{duration:reduced?0:.7,ease:[.22,1,.36,1]}}/></div>
        </div>)}
        <div className="force-chart-foot"><span>{item.unit}</span><span>≈ <b>{ratio} : 1</b> в пользу СССР</span></div>
      </div>
    </div>
    <div className="campaign-outcome"><div><span>РЕЗУЛЬТАТ ОПЕРАЦИИ</span><h3>Беларусь<br/>освобождена.</h3></div><p><strong>{d.result.divisions}</strong>дивизий и <b>{d.result.brigades} бригады</b><br/>противника уничтожены</p><p><strong>{d.result.damagedDivisions}</strong>дивизий потеряли свыше<br/>половины личного состава</p></div>
    <p className="figures-note">Сводные оценки численности. Знак «+» означает нижнюю границу; «≈» — приблизительное значение.</p>
  </section>;
}
