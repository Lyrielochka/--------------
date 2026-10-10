import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { MotionConfig, motion, useMotionValue, useSpring } from 'framer-motion';
import './styles.css';
import './route.css';
import {
  Commanders, Prehistory, RichTacticalMap, ScrollProgress, Strategy, Technology, operationScaleData
} from './ExplorerSections.jsx';
import { ArchiveDesk, ExperienceMotion } from './Experience.jsx';
import Aviators from './Aviators.jsx';
import PartisanMap from './PartisanMap.jsx';
import { CinemaProvider, CinemaIntro } from './Cinema.jsx';
import './map-accuracy.css';
import './palette.css';
import './site-theme.css';
import { ChapterBreak, CampaignFigures } from './StoryDesign.jsx';
import './story-design.css';
import './prehistory.css';
import VideoGallery from './VideoGallery.jsx';
import OtherProjects from './OtherProjects.jsx';
import SiteFooter from './SiteFooter.jsx';
import MuseumHeader from './MuseumHeader.jsx';
import './museum-polish.css';

function useCursor() {
  const x = useMotionValue(-100), y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 700, damping: 38 });
  const sy = useSpring(y, { stiffness: 700, damping: 38 });
  const [active, setActive] = useState(false);
  useEffect(() => {
    if (!matchMedia('(pointer:fine)').matches) return;
    const move = e => { x.set(e.clientX); y.set(e.clientY); };
    const over = e => setActive(!!e.target.closest('button,a,[data-cursor]'));
    window.addEventListener('pointermove', move); window.addEventListener('mouseover', over);
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('mouseover', over); };
  }, [x,y]);
  return {sx, sy, active};
}

function Introduction(){return <section id="intro" className="route-intro section"><div><span className="section-kicker">ПЕРЕД НАЧАЛОМ</span><h2>БЕЛАРУСЬ.<br/><em>ЛЕТО 1944.</em></h2></div><p>К лету 1944 года немецкая группа армий «Центр» удерживала Беларусь и её укреплённые узлы. Чтобы освободить территорию и открыть путь на запад, советским войскам предстояло прорвать оборону сразу на нескольких направлениях. Операция «Багратион» объединила эти удары в единый замысел.</p></section>}

function Opening(){return <section id="opening" className="route-opening"><div className="opening-grid"/><span className="section-kicker">ОТ ПОДГОТОВКИ — К НАСТУПЛЕНИЮ</span><strong>22 <em>ИЮНЯ</em> 1944</strong><p>Накануне основного наступления. Впереди — прорыв обороны, бои за города и путь к Минску.</p></section>}

function App(){
  const [active,setActive]=useState(0), [section,setSection]=useState('hero');
  const {sx,sy,active:cursorActive}=useCursor();
  useEffect(()=>{const ids=['hero','intro','prehistory','summer','strategy','commanders','partisans','opening','map','technology','aviators','archive','results','videos','projects'];const io=new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting&&setSection(e.target.id)),{threshold:0,rootMargin:'-20% 0px -65% 0px'});ids.forEach(id=>{const el=document.getElementById(id);if(el)io.observe(el)});return()=>io.disconnect()},[]);
  return <><ExperienceMotion/><motion.div className={'cursor '+(cursorActive?'active':'')} style={{x:sx,y:sy}}/><div className="noise"/><ScrollProgress/><MuseumHeader activeSection={section}/><CinemaIntro/>
    <main className="story-site">
      <Introduction/><Prehistory/>
      <ChapterBreak number="01" label="ЗАМЫСЕЛ" title="Удары должны встретиться." detail="Четыре фронта. Общее направление — Минск."/>
      <Strategy/><Commanders/>
      <Technology/><Aviators/><PartisanMap/>
      <ChapterBreak number="02" label="НАСТУПЛЕНИЕ" title="Подготовка становится действием." detail="От первых ударов — к освобождению городов."/>
      <Opening/><RichTacticalMap active={active} setActive={setActive}/>
      <CampaignFigures data={operationScaleData}/>
      <ChapterBreak number="03" label="ПАМЯТЬ" title="За каждой датой — люди." detail="Образы, места и следы лета 1944 года."/>
      <ArchiveDesk/>
      <VideoGallery/>
      <div className="site-ending"><OtherProjects/><SiteFooter/></div>
    </main>
  </>;
}

createRoot(document.getElementById('root')).render(<MotionConfig reducedMotion="user"><CinemaProvider><App/></CinemaProvider></MotionConfig>);



