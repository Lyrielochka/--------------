import React, {useState} from 'react';
import {motion, useReducedMotion} from 'framer-motion';
import {ArrowUpRight, MoveUpRight} from 'lucide-react';
import './aviators.css';

const pilots=[
  {id:'fedutenko',first:'Надежда',last:'Федутенко',full:'Надежда Никифоровна Федутенко',role:'Командир эскадрильи',unit:'125-й гв. бап',plane:'Пе-2',image:'/assets/aviators/pe-2.png',operation:'Витебско-Оршанское направление',short:'Вела бомбардировщики к целям на северном направлении наступления.',detail:'125-й гвардейский бомбардировочный полк действовал на Пе-2 в ходе Белорусской операции.'},
  {id:'fomicheva',first:'Клавдия',last:'Фомичёва',full:'Клавдия Яковлевна Фомичёва',role:'Лётчица бомбардировочного полка',unit:'125-й гв. бап',plane:'Пе-2',image:'/assets/aviators/pe-2.png',operation:'Летнее наступление 1944 года',short:'В составе 125-го гвардейского полка участвовала в боевых вылетах над Беларусью.',detail:'В июне 1944 года служила в полку, участвовавшем в Белорусской наступательной операции.'},
  {id:'meklin',first:'Наталья',last:'Меклин',full:'Наталья Фёдоровна Меклин',role:'Лётчица ночного полка',unit:'46-й гв. нбап',plane:'По-2',image:'/assets/aviators/po-2.png',operation:'2-й Белорусский фронт',short:'Совершала ночные вылеты на направлении наступления 2-го Белорусского фронта.',detail:'Её полк поддерживал войска ночью на могилёвском и минском направлениях.'},
  {id:'nikulina',first:'Евдокия',last:'Никулина',full:'Евдокия Андреевна Никулина',role:'Командир эскадрильи',unit:'46-й гв. нбап',plane:'По-2',image:'/assets/aviators/po-2.png',operation:'Белорусская операция',short:'Командовала эскадрильей в полку ночных бомбардировщиков.',detail:'По-2 действовали ночью, поддерживая продвижение войск на белорусском направлении.'},
];

export default function Aviators(){
  const [active,setActive]=useState(0);
  const reduced=useReducedMotion();
  return <section className="aviators-section section" id="aviators" aria-labelledby="aviators-title">
    <div className="aviators-sky" aria-hidden="true"><i/><i/><i/><svg viewBox="0 0 1400 700" preserveAspectRatio="none"><path d="M-80 420 C250 130 390 610 740 290 S1210 200 1500 -40"/><path d="M-80 520 C260 220 460 700 810 370 S1220 290 1500 70"/></svg></div>
    <div className="aviators-heading"><div><span className="section-kicker">ЖЕНЩИНЫ НА ФРОНТЕ / ЛЕТО 1944</span><h2 id="aviators-title">ЖЕНЩИНЫ В НЕБЕ<br/><em>«БАГРАТИОНА»</em></h2></div><p>Они вели бомбардировщики к целям и поднимались в ночное небо, поддерживая наступление над Беларусью.</p></div>
    <div className="aviators-gallery">{pilots.map((pilot,index)=><motion.button key={pilot.id} type="button" className={'aviator-card aviator-'+pilot.id+(active===index?' is-active':'')} aria-label={`${pilot.full}. ${pilot.role}. ${pilot.plane}. ${pilot.short}`} aria-pressed={active===index} onClick={()=>setActive(index)} initial={reduced?false:{opacity:0,y:45}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.18}} transition={{duration:.6,delay:index*.08,ease:[.22,1,.36,1]}}>
      <span className="aviator-card-grid" aria-hidden="true"/><span className="aviator-card-top"><span>0{index+1} / АВИАЦИЯ</span><span>1944 <MoveUpRight size={13}/></span></span>
      <span className="aviator-plane"><img src={pilot.image} alt="" loading="lazy"/><small>{pilot.plane} / МУЗЕЙНАЯ ИЛЛЮСТРАЦИЯ</small></span>
      <span className="aviator-copy"><span className="aviator-role">{pilot.role}</span><strong>{pilot.first}<br/>{pilot.last}</strong><span className="aviator-summary">{pilot.short}</span><span className="aviator-badges"><i>{pilot.plane}</i><i>{pilot.unit}</i></span></span>
      <span className="aviator-more"><span>{active===index?pilot.detail:pilot.operation}</span><ArrowUpRight size={15}/></span>
    </motion.button>)}</div>
    <div className="aviators-foot"><span>ДНЕВНЫЕ И НОЧНЫЕ ВЫЛЕТЫ · ЛЕТО 1944</span><a href="https://pamyat-naroda.ru/ops/vitebsko-orshanskaya-nastupatelnaya-operatsiya-operatsiya-5-go-udara/" target="_blank" rel="noreferrer">ИСТОРИЧЕСКИЕ МАТЕРИАЛЫ <ArrowUpRight size={14}/></a></div>
  </section>;
}

