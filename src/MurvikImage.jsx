import React,{useEffect,useState} from 'react';

// Only the eyelids change; the body and its position stay still.
export default function MurvikImage({src,blinkSrc,...props}){
 const [ready,setReady]=useState(''),[blinking,setBlinking]=useState(false);
 const [reduced,setReduced]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);
 useEffect(()=>{const media=matchMedia('(prefers-reduced-motion: reduce)');const change=()=>setReduced(media.matches);media.addEventListener('change',change);return()=>media.removeEventListener('change',change);},[]);
 useEffect(()=>{
  let active=true;setBlinking(false);
  const image=new Image();image.onload=()=>{if(active)setReady(blinkSrc);};image.onerror=()=>{if(active)setReady('');};image.src=blinkSrc;
  return()=>{active=false;image.onload=null;image.onerror=null;};
 },[blinkSrc]);
 useEffect(()=>{
  setBlinking(false);if(reduced||ready!==blinkSrc)return;
  let end;
  const interval=setInterval(()=>{if(document.hidden)return;setBlinking(true);end=setTimeout(()=>setBlinking(false),170);},4800);
  const hide=()=>{if(document.hidden){clearTimeout(end);setBlinking(false);}};
  document.addEventListener('visibilitychange',hide);
  return()=>{clearInterval(interval);clearTimeout(end);document.removeEventListener('visibilitychange',hide);};
 },[ready,blinkSrc,reduced]);
 const closed=blinking&&!reduced&&ready===blinkSrc;
 return <img {...props} src={closed?blinkSrc:src} data-blink={closed?'closed':'open'} data-blink-ready={ready===blinkSrc} onError={()=>{if(closed){setReady('');setBlinking(false);}}}/>;
}
