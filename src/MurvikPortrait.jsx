import React,{useEffect,useState} from 'react';
const image='/assets/murvik.webp',closed='/assets/murvik-blink.webp';
const labels={idle:'На связи!',listening:'Слушаю тебя',thinking:'Ищу по следам…',speaking:'Вот что нашёл!',happy:'Лапу за любопытство!',unsure:'Поищем другой след',correct:'Вот это чутьё!',learning:'Запомним вместе!',mission:'Идём по следам!'};
export default function MurvikPortrait({mood='idle',large=false}){
  const [reduced,setReduced]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches),[blink,setBlink]=useState(false),[blinkReady,setBlinkReady]=useState(false);
  useEffect(()=>{const media=matchMedia('(prefers-reduced-motion: reduce)');const change=()=>setReduced(media.matches);media.addEventListener('change',change);return()=>media.removeEventListener('change',change);},[]);
  useEffect(()=>{const asset=new Image();asset.onload=()=>setBlinkReady(true);asset.src=closed;return()=>{asset.onload=null;};},[]);
  useEffect(()=>{if(reduced||!blinkReady){setBlink(false);return;}let blinkEnd;const interval=setInterval(()=>{setBlink(true);blinkEnd=setTimeout(()=>setBlink(false),160);},4600);return()=>{clearInterval(interval);clearTimeout(blinkEnd);setBlink(false);};},[reduced,blinkReady]);
  return <div className={`murvik-portrait mood-${mood} ${large?'is-home':''}`} data-mood={mood}>
    <div className="murvik-starfield" aria-hidden="true">{Array.from({length:9},(_,i)=><i key={i} style={{'--i':i}}/>)}</div><div className="murvik-orbit"/><div className="murvik-reticle" aria-hidden="true"/>
    <div className="murvik-character"><img src={blink&&blinkReady?closed:image} alt="Рысёнок Мурвiк в офицерской фуражке приветственно поднимает лапу"/></div>
    <div className="murvik-speech">{labels[mood]||labels.idle}</div><span>{mood==='thinking'?'ПРОВЕРЯЮ МАТЕРИАЛЫ САЙТА':'ЛЮБОПЫТСТВО — ТВОЯ СУПЕРСИЛА'}</span>
  </div>;
}
