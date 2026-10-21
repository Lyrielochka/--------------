import React, {useId} from 'react';
import {minskRegionPath} from './minskRegionShape.js';
import './minsk-region.css';

export default function MinskRegion({active,onOpen,zoom=1}){
  const id=useId().replaceAll(':','');
  return <svg className={'minsk-region '+(active?'is-open':'')} style={{'--region-zoom':active?zoom:1}} viewBox="0 0 1402 1122" aria-label="Минская область">
    <defs><clipPath id={id}><path d={minskRegionPath} clipRule="evenodd"/></clipPath></defs>
    <g className="minsk-region-detail" clipPath={`url(#${id})`}>
      <path d={minskRegionPath} fill="#263e34" fillRule="evenodd"/>
      <image href="/assets/belarus-base.lossless.webp" width="1402" height="1122"/>
      <path d={minskRegionPath} fill="#98ad8712" fillRule="evenodd"/>
    </g>
    <path className="minsk-region-hit" fillRule="evenodd" d={minskRegionPath} role="button" tabIndex={active?-1:0} aria-label="Приблизить Минскую область" aria-expanded={active} onClick={onOpen} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onOpen()}}}><title>Минская область · приблизить</title></path>
  </svg>;
}
