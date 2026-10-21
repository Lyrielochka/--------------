import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { MotionConfig, motion } from 'framer-motion';
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
import Murvik from './Murvik.jsx';
import './museum-polish.css';
import './hero-atmosphere.css';

function Introduction(){return <section id="intro" className="route-intro section"><div><span className="section-kicker">ПЕРЕД НАЧАЛОМ</span><h2>БЕЛАРУСЬ.<br/><em>ЛЕТО 1944.</em></h2></div><p>К лету 1944 года немецкая группа армий «Центр» удерживала Беларусь и её укреплённые узлы. Чтобы освободить территорию и открыть путь на запад, советским войскам предстояло прорвать оборону сразу на нескольких направлениях. Операция «Багратион» объединила эти удары в единый замысел.</p></section>}

function Opening(){return <section id="opening" className="route-opening"><div className="opening-grid"/><span className="section-kicker">ОТ ПОДГОТОВКИ — К НАСТУПЛЕНИЮ</span><strong>22 <em>ИЮНЯ</em> 1944</strong><p>Накануне основного наступления. Впереди — прорыв обороны, бои за города и путь к Минску.</p></section>}

function SectionHeader(){
  const [section,setSection]=useState('hero');
  useEffect(()=>{const ids=['hero','intro','prehistory','summer','strategy','commanders','partisans','opening','map','technology','aviators','archive','results','videos','projects'];const io=new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting&&setSection(e.target.id)),{threshold:0,rootMargin:'-20% 0px -65% 0px'});ids.forEach(id=>{const el=document.getElementById(id);if(el)io.observe(el)});return()=>io.disconnect()},[]);
  return <MuseumHeader activeSection={section}/>;
}
function TacticalMap(){
  const [active,setActive]=useState(0);
  return <RichTacticalMap active={active} setActive={setActive}/>;
}
function App(){
  return <><ExperienceMotion/><div className="noise"/><ScrollProgress/><SectionHeader/><CinemaIntro/>
    <main className="story-site">
      <Introduction/><Prehistory/>
      <ChapterBreak number="01" label="ЗАМЫСЕЛ" title="Четыре фронта — общий план." detail="Прорыв обороны и разгром группы армий «Центр»."/>
      <Strategy/><Commanders/>
      <Technology/><Aviators/><PartisanMap/>
      <ChapterBreak number="02" label="НАСТУПЛЕНИЕ" title="От прорыва — к освобождению." detail="Ход операции на карте: июнь — август 1944 года."/>
      <Opening/><TacticalMap/>
      <CampaignFigures data={operationScaleData}/>
      <ChapterBreak number="03" label="ПАМЯТЬ" title="Свидетельства военного времени." detail="Фотографии и фильмы об освобождении Беларуси."/>
      <ArchiveDesk/>
      <VideoGallery/>
      <div className="site-ending"><OtherProjects/><SiteFooter/></div>
    </main><Murvik/>
  </>;
}

createRoot(document.getElementById('root')).render(<MotionConfig reducedMotion="user"><CinemaProvider><App/></CinemaProvider></MotionConfig>);



