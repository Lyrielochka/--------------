import { readFile, writeFile, readdir } from 'node:fs/promises';
let main=await readFile('src/main.jsx','utf8');
function cut(start,end) { const a=main.indexOf(start),b=main.indexOf(end,a);if(a<0||b<0)throw Error(start);main=main.slice(0,a)+main.slice(b); }
cut('const stages = [','function useCursor()');
cut('const Reveal =','function Introduction()');
cut('function RouteBridge(','function Opening()');
cut('function Significance(','function App()');
main=main.replace("React, { useEffect, useRef, useState }","React, { useEffect, useState }");
main=main.replace("{ AnimatePresence, MotionConfig, motion, useMotionValue, useSpring, useReducedMotion }","{ MotionConfig, motion, useMotionValue, useSpring }");
main=main.replace(/import \{[\s\S]*?\} from 'lucide-react';\n/,'');
main=main.replace(/  Cities, Commanders, Forces, Partisans, Prehistory, Results,\n  RichTacticalMap, ScrollProgress, Strategy, Technology, ThenNow, mapMoments, operationScaleData/,'  Commanders, Prehistory, RichTacticalMap, ScrollProgress, Strategy, Technology, operationScaleData');
main=main.replace('{ CinemaProvider, CinemaIntro, OperationScroll, DepthScene, StageJourney, TimeRift, ReplayInvitation }','{ CinemaProvider, CinemaIntro }');
main=main.replace("[active,setActive]=useState(0), [muted,setMuted]=useState(true), [section,setSection]","[active,setActive]=useState(0), [section,setSection]");
cut('  const reduced=useReducedMotion();','  const {sx,sy');
cut('  const mx=useSpring','  useEffect(()=>{const ids=');
main=main.replace("  useEffect(() => {\n    const move", "  useEffect(() => {\n    if (!matchMedia('(pointer:fine)').matches) return;\n    const move");
await writeFile('src/main.jsx',main);
let modals=await readFile('src/TechnologyModals.jsx','utf8');
const a=modals.indexOf('const equipment='),b=modals.indexOf('function ModelStage',a);
if(a<0||b<0)throw Error('equipment block');
modals=modals.slice(0,a)+modals.slice(b);await writeFile('src/TechnologyModals.jsx',modals);
for(const entry of await readdir('src')) {
 if(!/\.(jsx|js|css)$/.test(entry))continue;
 const file='src/'+entry;let text=await readFile(file,'utf8');
 text=text.replaceAll('.png','.lossless.webp');
 if(entry.endsWith('.jsx')) {
 text=text.replace(/<img\b[^>]*>/g,tag=> {
  // Visible detail images and the opening scene stay eager; other sections load on demand.
  if(!tag.includes('decoding='))tag=tag.replace('<img','<img decoding="async"');
  if(!tag.includes('loading=') && !['Cinema.jsx','TechnologyModals.jsx','MapImmersion.jsx'].includes(entry))tag=tag.replace('<img','<img loading="lazy"');
  return tag;
 });
 }
 await writeFile(file,text);
}
let html=await readFile('index.html','utf8');html=html.replace('/assets/scale/soviet-t34-right.png','/assets/scale/soviet-t34-right.lossless.webp');
html=html.replace('    <link rel="stylesheet" href="/preloader.css" />\n','');html=html.replace('  </head>','    <link rel="stylesheet" href="/preloader.css" />\n  </head>');
await writeFile('index.html',html);
