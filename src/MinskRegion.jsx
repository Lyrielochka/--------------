import React, {useId} from 'react';
import {minskRegionPath} from './minskRegionShape.js';
import './minsk-region.css';

export default function MinskRegion({active,onOpen,zoom=1,path=minskRegionPath,name="Минская область",label="Минскую область",hidden=false,precise=false}){
  const id=useId().replaceAll(':','');
  if(hidden)return null;
  return <svg className={'minsk-region '+(active?'is-open ':'')+(precise?'region-precise':'')} style={{'--region-zoom':active?zoom:1}} viewBox="0 0 1402 1122" aria-label={name} shapeRendering="geometricPrecision">
    <defs><clipPath id={id}><path d={path} clipRule="evenodd"/></clipPath>
      <linearGradient id={`${id}-land`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#31493d"/><stop offset="1" stopColor="#223b34"/></linearGradient>
      <pattern id={`${id}-grid`} width="25" height="25" patternUnits="userSpaceOnUse"><path d="M25 0H0V25" fill="none" stroke="#b6c3a7" strokeOpacity=".12" strokeWidth=".2"/></pattern>
    </defs>
    <g className="minsk-region-detail" clipPath={`url(#${id})`}>
      <path d={path} fill="#263e34" fillRule="evenodd"/>
      <image href="/assets/belarus-base.lossless.webp" width="1402" height="1122"/>
      <path d={path} fill="#98ad8712" fillRule="evenodd"/>
    </g>
    {precise&&<path className="region-boundary-halo" d={path} fillRule="evenodd" aria-hidden="true"/>}
    <path className="minsk-region-hit" fillRule="evenodd" d={path} role="button" tabIndex={active?-1:0} aria-label={`Приблизить ${label}`} aria-expanded={active} onClick={onOpen} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onOpen()}}}><title>{name} · приблизить</title></path>
  </svg>;
}
