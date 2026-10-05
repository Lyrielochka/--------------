import React, {useId} from 'react';
import {motion, useReducedMotion} from 'framer-motion';
import {axes, battleZones, frontPaths, territoryPaths, line, progressLine, MAP_HEIGHT, MAP_WIDTH, pct, placeXY, places, rails} from './bagrationMapData.js';

const defaults={front:true,routes:true,cities:true,fronts:true,rail:false,partisans:false,battles:true,memory:false};
const frontIndex=id=>id==='baltic'?0:id.startsWith('third')?1:id==='second'?2:id.startsWith('first')?3:4;

export default function BagrationMap({stage=0,layers=defaults,selectedRoute=null,selectedCity=null,labels=true,modern=false,showBase=true,territories=false,className=''}){
  const phase=Math.max(0,Math.min(8,stage));
  const reduced=useReducedMotion();
  const uid=useId().replaceAll(':','');
  const show=k=>layers[k]!==false;
  const cities=['polotsk','vitebsk','orsha','mogilev','bobruisk','minsk','borisov','baranovichi','brest'];
  const highlights=modern?['vitebsk','mogilev','bobruisk','minsk','brest']:cities;
  return <svg className={'bagration-map '+className} viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} preserveAspectRatio="xMidYMid meet" role="img" aria-label={modern?'Карта Беларуси: города и места памяти':'Карта Беларуси с обобщёнными рубежами и направлениями операции «Багратион»'}>
    <defs>
      <linearGradient id={`${uid}-shade`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#071013" stopOpacity=".14"/><stop offset=".55" stopColor="#071013" stopOpacity="0"/><stop offset="1" stopColor="#071013" stopOpacity=".26"/></linearGradient>
      <filter id={`${uid}-glow`}><feGaussianBlur stdDeviation="5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <pattern id={`${uid}-partisan`} width="13" height="13" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><path d="M0 0V13" stroke="#cfab75" strokeOpacity=".28" strokeWidth="3"/></pattern>
      {axes.map(axis=><marker key={axis.id} id={`${uid}-arrow-${axis.id}`} markerUnits="userSpaceOnUse" markerWidth="50" markerHeight="50" viewBox="-50 -25 50 50" refX="0" refY="0" orient="auto" overflow="visible"><path className="bmap-route-head" fill={axis.color} d="M0 0 L-47 23 L-27 0 L-47 -23 Z"/></marker>)}
    </defs>
    {showBase&&<><image href="/assets/belarus-base.lossless.webp" width={MAP_WIDTH} height={MAP_HEIGHT}/><rect width={MAP_WIDTH} height={MAP_HEIGHT} fill={`url(#${uid}-shade)`}/></>}
    {territories&&show('front')&&<g className="bmap-territories" data-layer="territories"><motion.path className="bmap-german-territory" initial={false} animate={{d:territoryPaths[phase].german}} transition={{duration:reduced?0:1.1}}/><motion.path className="bmap-soviet-territory" initial={false} animate={{d:territoryPaths[phase].soviet}} transition={{duration:reduced?0:1.1}}/></g>}
    {territories&&showBase&&<image className="bmap-relief" href="/assets/belarus-base.lossless.webp" width={MAP_WIDTH} height={MAP_HEIGHT}/>}
    {!modern&&<>
      {show('rail')&&<g data-layer="rail" className="bmap-rail">{rails.map(r=><path key={r.id} d={line(r.points)}><title>{r.label}</title></path>)}</g>}
      {show('partisans')&&<g data-layer="partisans" className="bmap-partisans">
        <ellipse cx={placeXY('baranovichi').x} cy={placeXY('baranovichi').y} rx="115" ry="90" fill={`url(#${uid}-partisan)`}/>
        <ellipse cx={placeXY('luninets').x} cy={placeXY('luninets').y} rx="105" ry="65" fill={`url(#${uid}-partisan)`}/>
        <path d={line(rails[1].points)}/><text x={placeXY('baranovichi').x-112} y={placeXY('baranovichi').y-105}>ПАРТИЗАНСКАЯ АКТИВНОСТЬ</text>
        <text x={placeXY('luninets').x+15} y={placeXY('luninets').y+80}>УДАРЫ ПО КОММУНИКАЦИЯМ</text>
      </g>}
      {show('front')&&<g data-layer="front"><path className="bmap-initial-front" d={frontPaths[0]}/>{phase>0&&<motion.path className="bmap-current-front" initial={false} animate={{d:frontPaths[phase]}} transition={{duration:reduced?0:1.1}}/>}<text x="1100" y="875" className="bmap-front-caption">РУБЕЖ · 22 ИЮНЯ</text></g>}
      {show('routes')&&<g data-layer="routes" className="bmap-routes">{axes.map(a=>{const selected=selectedRoute===null||frontIndex(a.id)===selectedRoute;const progress=selectedRoute!==null&&phase===0&&selected?1:a.progress[phase];const route=progressLine(a.points,progress);return progress>0?<g key={a.id} className={selected?'':'dimmed'}><path d={line(a.points)} className="bmap-route-guide"/><motion.path className="bmap-route-shadow" initial={false} animate={{d:route}} transition={{duration:reduced?0:1.1}}/><motion.path className="bmap-route-active" stroke={a.color} markerEnd={`url(#${uid}-arrow-${a.id})`} initial={false} animate={{d:route}} transition={{duration:reduced?0:1.1}}/><motion.path className="bmap-route-core" initial={false} animate={{d:route}} transition={{duration:reduced?0:1.1}}/><title>{a.front}</title></g>:null})}</g>}
      {show('battles')&&<g data-layer="battles" className="bmap-battles">{battleZones.filter(b=>phase>=b.stage).map(b=>{const p=placeXY(b.place);return <g key={b.id} className={phase===b.stage?'active':''}><ellipse cx={p.x} cy={p.y} rx={b.rx} ry={b.ry}/><text x={p.x+b.rx+13} y={p.y-b.ry/2}>{b.label}</text></g>})}</g>}
      {show('fronts')&&<g data-layer="fronts" className="bmap-front-labels"><text className="front-baltic" x="1035" y="185">1 ПРИБАЛТИЙСКИЙ</text><text className="front-third" x="1105" y="375">3 БЕЛОРУССКИЙ</text><text className="front-second" x="1110" y="595">2 БЕЛОРУССКИЙ</text><text className="front-first" x="1050" y="795">1 БЕЛОРУССКИЙ</text></g>}
    </>}
    {show('cities')&&labels&&<g data-layer="cities" className="bmap-cities">{highlights.map(id=>{const p=placeXY(id),city=places[id],selected=selectedCity===id,dim=!modern&&city.stage&&phase<city.stage;return <g key={id} className={(selected?'selected ':'')+(dim?'dimmed':'')}><circle cx={p.x} cy={p.y} r={selected?9:5}/><circle className="halo" cx={p.x} cy={p.y} r={selected?20:13}/><text x={p.x+17} y={p.y-10}>{city.name.toUpperCase()}</text></g>})}</g>}
    {modern&&<g className="bmap-modern"><path d={line([[23.69,52.10],[26.01,53.13],[27.56,53.90],[30.34,53.91],[30.20,55.19]])}/><text x={placeXY('minsk').x+22} y={placeXY('minsk').y+54}>МЕСТА ПАМЯТИ / СХЕМА</text></g>}
    {show('memory')&&!modern&&<g data-layer="memory" className="bmap-memory">{['vitebsk','bobruisk','minsk'].map(id=>{const p=placeXY(id);return <text key={id} x={p.x+30} y={p.y+36}>◇</text>})}</g>}
    <text x="85" y="1068" className="bmap-disclaimer">ГЕОГРАФИЧЕСКАЯ ОСНОВА · СОВРЕМЕННЫЕ ГРАНИЦЫ</text>
  </svg>;
}

export const mapPointPercent=id=>pct(placeXY(id));
