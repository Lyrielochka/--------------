import React from 'react';
import MurvikImage from './MurvikImage.jsx';
const art='/assets/murvik-tour/natural-v2/';
const poses={idle:'sit',listening:'attentive',thinking:'attentive',speaking:'sit',happy:'stand',unsure:'attentive',correct:'stand',learning:'rest',mission:'stand'};
const descriptions={sit:'сидит',stand:'стоит на четырёх лапах',rest:'лежит',attentive:'сидит и внимательно смотрит вверх'};
const labels={idle:'На связи!',listening:'Слушаю тебя',thinking:'Ищу по следам…',speaking:'Вот что нашёл!',happy:'Лапу за любопытство!',unsure:'Поищем другой след',correct:'Вот это чутьё!',learning:'Запомним вместе!',mission:'Идём по следам!'};
export default function MurvikPortrait({mood='idle',large=false}){
  const pose=poses[mood]||'sit';
  return <div className={`murvik-portrait mood-${mood} ${large?'is-home':''}`} data-mood={mood} data-pose={pose}>
    <div className="murvik-starfield" aria-hidden="true">{Array.from({length:9},(_,i)=><i key={i} style={{'--i':i}}/>)}</div><div className="murvik-orbit"/><div className="murvik-reticle" aria-hidden="true"/>
    <div className="murvik-character"><MurvikImage src={`${art}${pose}.webp`} blinkSrc={`${art}${pose}-blink.webp`} alt={`Маленький рысёнок Мурвiк в фуражке ${descriptions[pose]}`}/></div>
    <div className="murvik-speech">{labels[mood]||labels.idle}</div><span>{mood==='thinking'?'ПРОВЕРЯЮ МАТЕРИАЛЫ САЙТА':'ЛЮБОПЫТСТВО — ТВОЯ СУПЕРСИЛА'}</span>
  </div>;
}
