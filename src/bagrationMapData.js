import {campaignEvents, campaignDay, campaignStage} from './campaignTimeline.js';
// The supplied 1402 × 1122 map has no georeferencing metadata. These bounds
// register geographic coordinates to its Belarus outline (approximately).
export const MAP_WIDTH = 1402;
export const MAP_HEIGHT = 1122;
const bounds = { west:23.17, east:32.78, north:56.17, south:51.26, left:100, right:1290, top:65, bottom:1080 };

export function xy(lon,lat){return {
  x:bounds.left+(lon-bounds.west)/(bounds.east-bounds.west)*(bounds.right-bounds.left),
  y:bounds.top+(bounds.north-lat)/(bounds.north-bounds.south)*(bounds.bottom-bounds.top)
}}
export const pct=(point)=>({x:point.x/MAP_WIDTH*100,y:point.y/MAP_HEIGHT*100});
export const line=points=>points.map(([lon,lat],i)=>{const {x,y}=xy(lon,lat);return `${i?'L':'M'}${x.toFixed(1)} ${y.toFixed(1)}`}).join(' ');
export function progressLine(points,progress){
  const vertices=points.map(([lon,lat])=>xy(lon,lat));
  const segments=vertices.slice(1).map((point,i)=>Math.hypot(point.x-vertices[i].x,point.y-vertices[i].y));
  const limit=segments.reduce((sum,length)=>sum+length,0)*Math.max(0,Math.min(1,progress));
  let remaining=limit,endpoint=vertices[0];
  for(let i=0;i<segments.length;i++){
    const length=segments[i];
    if(remaining<=length){const share=length?remaining/length:0;endpoint={x:vertices[i].x+(vertices[i+1].x-vertices[i].x)*share,y:vertices[i].y+(vertices[i+1].y-vertices[i].y)*share};break}
    remaining-=length;endpoint=vertices[i+1];
  }
  const visible=[vertices[0]];
  let travelled=0;
  for(let i=1;i<vertices.length;i++){
    travelled+=segments[i-1];
    const target=travelled<=limit?vertices[i]:endpoint;
    const previous=visible.at(-1);
    if(Math.hypot(target.x-previous.x,target.y-previous.y)>0.001)visible.push(target);
    if(travelled>=limit)break;
  }
  return visible.map((point,i)=>`${i?'L':'M'}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(' ');
}
export function routeArrow(points,progress){
  const vertices=points.map(([lon,lat])=>xy(lon,lat));
  const lengths=vertices.slice(1).map((point,i)=>Math.hypot(point.x-vertices[i].x,point.y-vertices[i].y));
  let remaining=lengths.reduce((sum,length)=>sum+length,0)*Math.max(0,Math.min(1,progress));
  let start=vertices[0],end=vertices[1],length=lengths[0];
  for(let i=0;i<lengths.length;i++){
    start=vertices[i];end=vertices[i+1];length=lengths[i];
    if(remaining<=length)break;
    remaining-=length;
  }
  const share=length?Math.max(0,Math.min(1,remaining/length)):0;
  const tip={x:start.x+(end.x-start.x)*share,y:start.y+(end.y-start.y)*share};
  const ux=length?(end.x-start.x)/length:1,uy=length?(end.y-start.y)/length:0;
  const back={x:tip.x-ux*47,y:tip.y-uy*47},notch={x:tip.x-ux*27,y:tip.y-uy*27};
  const left={x:back.x-uy*23,y:back.y+ux*23},right={x:back.x+uy*23,y:back.y-ux*23};
  const point=p=>`${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
  return `M${point(tip)} L${point(left)} L${point(notch)} L${point(right)} Z`;
}

export const places={
  polotsk:{name:'Полоцк',lon:28.81,lat:55.49},
  molodechno:{name:'Молодечно',lon:26.85,lat:54.31},
  lida:{name:'Лида',lon:25.30,lat:53.89},
  slonim:{name:'Слоним',lon:25.32,lat:53.09},
  pinsk:{name:'Пинск',lon:26.10,lat:52.12},
  volkovysk:{name:'Волковыск',lon:24.45,lat:53.15},
  grodno:{name:'Гродно',lon:23.83,lat:53.68},
  vilnius:{name:'Вильнюс',lon:25.28,lat:54.69,country:'Литва'},
  bialystok:{name:'Белосток',lon:23.16,lat:53.13,country:'Польша'},
  siauliai:{name:'Шяуляй',lon:23.31,lat:55.93,country:'Литва'},
  kaunas:{name:'Каунас',lon:23.90,lat:54.90,country:'Литва'},
  lublin:{name:'Люблин',lon:22.57,lat:51.25,country:'Польша'},
  osowiec:{name:'Осовец',lon:22.65,lat:53.47,country:'Польша'},
  vitebsk:{name:'Витебск',lon:30.20,lat:55.19,date:'26.06',stage:2},
  orsha:{name:'Орша',lon:30.42,lat:54.51,date:'27.06',stage:3},
  mogilev:{name:'Могилёв',lon:30.34,lat:53.91,date:'28.06',stage:4},
  bobruisk:{name:'Бобруйск',lon:29.23,lat:53.14,date:'29.06',stage:5},
  minsk:{name:'Минск',lon:27.56,lat:53.90,date:'03.07',stage:6},
  borisov:{name:'Борисов',lon:28.51,lat:54.23},
  baranovichi:{name:'Барановичи',lon:26.01,lat:53.13},
  brest:{name:'Брест',lon:23.69,lat:52.10},
  rogachev:{name:'Рогачёв',lon:30.05,lat:53.09},
  zhlobin:{name:'Жлобин',lon:30.02,lat:52.89},
  luninets:{name:'Лунинец',lon:26.80,lat:52.25},
};
export const placeXY=id=>xy(places[id].lon,places[id].lat);

// Axes follow the fronts and operational nodes on the 1984 historical map
// catalogued by the Presidential Library and the Smolensk Museum scheme.
// Waypoints express corridors, not the tracks of individual units.
const initialAxes=[
  {id:'baltic',front:'1-й Прибалтийский',color:'#64d9ec',progress:[0,.24,.62,.9,1,1,1,1,1],points:[[31.00,55.52],[30.34,55.36],[30.20,55.19],[29.61,55.30],[28.81,55.49]]},
  {id:'third-north',front:'3-й Белорусский',color:'#ffd46b',progress:[0,.2,.68,1,1,1,1,1,1],points:[[31.02,55.10],[30.20,55.19],[29.57,54.93],[28.51,54.23]]},
  {id:'third',front:'3-й Белорусский',color:'#ffd46b',progress:[0,.13,.32,.58,.7,.86,1,1,1],points:[[31.25,54.50],[30.42,54.51],[29.70,54.41],[28.51,54.23],[27.56,53.90]]},
  {id:'second',front:'2-й Белорусский',color:'#a9eaaa',progress:[0,.13,.22,.46,.75,.88,1,1,1],points:[[31.30,53.90],[30.34,53.91],[28.98,53.83],[27.56,53.90]]},
  {id:'first-north',front:'1-й Белорусский',color:'#ff8f80',progress:[0,.16,.31,.43,.55,.78,1,1,1],points:[[31.00,53.12],[30.05,53.09],[29.23,53.14],[28.48,53.55],[27.56,53.90]]},
  {id:'first-south',front:'1-й Белорусский',color:'#ff8f80',progress:[0,.12,.22,.4,.55,1,1,1,1],points:[[30.86,52.82],[30.02,52.89],[29.23,53.14]]},

];

// Progress follows dated waypoints; intermediate positions are schematic.
const legacyDates=['22.06','23.06','26.06','27.06','28.06','29.06','03.07','16.07','29.08'];
function legacyAt(date){const day=campaignDay(date);let i=0;while(i<legacyDates.length-2&&day>campaignDay(legacyDates[i+1]))i++;return [i,Math.max(0,Math.min(1,(day-campaignDay(legacyDates[i]))/(campaignDay(legacyDates[i+1])-campaignDay(legacyDates[i]))))]}
const legacyProgress=values=>campaignEvents.map(e=>{const [i,t]=legacyAt(e.date);return values[i]+(values[i+1]-values[i])*t});
function datedAxis(id,front,color,waypoints){
 const points=waypoints.map(([lon,lat])=>[lon,lat]);
 const vertices=points.map(([lon,lat])=>xy(lon,lat));
 const lengths=vertices.slice(1).map((p,i)=>Math.hypot(p.x-vertices[i].x,p.y-vertices[i].y));
 const total=lengths.reduce((sum,n)=>sum+n,0);
 const progress=campaignEvents.map(e=>{const day=campaignDay(e.date);if(day<=campaignDay(waypoints[0][2]))return 0;if(day>=campaignDay(waypoints.at(-1)[2]))return 1;let distance=0;for(let i=0;i<lengths.length;i++){const start=campaignDay(waypoints[i][2]),end=campaignDay(waypoints[i+1][2]);if(day<end)return (distance+lengths[i]*(day-start)/(end-start))/total;distance+=lengths[i]}return 1});
 return {id,front,color,points,progress,late:true};
}
export const axes=[
 ...initialAxes.map(a=>({...a,progress:legacyProgress(a.progress)})),
 datedAxis('third-west','3-й Белорусский · Вильнюс — Каунас','#ffd46b',[[27.56,53.90,'03.07'],[26.85,54.31,'05.07'],[25.28,54.69,'13.07'],[23.90,54.90,'01.08']]),
 datedAxis('third-lida','3-й Белорусский · Лида','#ffd46b',[[26.85,54.31,'05.07'],[25.30,53.89,'09.07']]),
 datedAxis('second-west','2-й Белорусский · Гродно — Белосток — Осовец','#a9eaaa',[[27.56,53.90,'03.07'],[25.9,53.6,'08.07'],[23.83,53.68,'16.07'],[23.16,53.13,'27.07'],[22.65,53.47,'14.08']]),
 datedAxis('second-volkovysk','2-й Белорусский · Волковыск','#a9eaaa',[[25.9,53.6,'08.07'],[24.45,53.15,'14.07'],[23.16,53.13,'27.07']]),
 datedAxis('first-west','1-й Белорусский · Барановичи — Брест','#ff8f80',[[27.56,53.90,'03.07'],[26.01,53.13,'08.07'],[25.32,53.09,'10.07'],[24.35,52.21,'20.07'],[23.69,52.10,'28.07']]),
 datedAxis('first-lublin','1-й Белорусский · Люблин','#ff8f80',[[24.71,51.22,'18.07'],[23.47,51.14,'22.07'],[22.57,51.25,'24.07']]),
 datedAxis('first-pinsk','1-й Белорусский · Пинск — Брест','#ff8f80',[[29.23,53.14,'29.06'],[26.80,52.25,'10.07'],[26.10,52.12,'14.07'],[23.69,52.10,'28.07']]),
 datedAxis('baltic-west','1-й Прибалтийский · Шяуляй','#64d9ec',[[28.81,55.49,'04.07'],[26.3,55.5,'12.07'],[23.31,55.93,'27.07']])
];
// Pоlotsk was liberated on 4 July, after Minsk.
axes[0]=datedAxis('baltic',initialAxes[0].front,initialAxes[0].color,[[31,55.52,'22.06'],[30.2,55.19,'26.06'],[29.61,55.30,'29.06'],[28.81,55.49,'04.07']]);
axes[0].late=false;
for(const event of campaignEvents){if(event.place&&event.id===event.place){places[event.place].stage=campaignStage(event.id);places[event.place].date=event.date}}

// Generalized phase boundaries. They show the east-to-west shift of the line,
// not a precise daily tactical position.
const frontLines=[
 [[30.5,55.83],[30.9,55.3],[30.85,54.9],[31.05,54.45],[31.14,53.9],[31.03,53.35],[30.78,52.9],[31.1,52.45]],
 [[30.25,55.83],[30.55,55.3],[30.66,54.9],[30.8,54.45],[30.91,53.9],[30.86,53.35],[30.51,52.9],[30.9,52.45]],
 [[29.65,55.83],[30.03,55.3],[30.34,54.9],[30.58,54.45],[30.76,53.9],[30.68,53.35],[30.33,52.9],[30.7,52.45]],
 [[29.35,55.83],[29.65,55.3],[29.92,54.9],[30.2,54.45],[30.42,53.9],[30.41,53.35],[30.06,52.9],[30.3,52.45]],
 [[29.1,55.83],[29.4,55.3],[29.66,54.9],[29.9,54.45],[30.0,53.9],[30.1,53.35],[29.82,52.9],[30.0,52.45]],
 [[28.8,55.83],[29.0,55.3],[29.1,54.9],[29.5,54.45],[29.2,53.9],[29.25,53.35],[29.07,52.9],[29.3,52.45]],
 [[28.2,55.83],[28.4,55.3],[28.1,54.9],[27.7,54.45],[27.2,53.9],[27.0,53.35],[27.1,52.9],[27.5,52.45]],
 [[27.0,55.83],[26.9,55.3],[26.8,54.9],[26.4,54.45],[25.9,53.9],[25.6,53.35],[25.7,52.9],[26.0,52.45]],
 [[24.7,55.83],[24.6,55.3],[24.5,54.9],[24.2,54.45],[23.9,53.9],[23.6,53.35],[23.6,52.9],[23.8,52.45]],
];
const frontAnchors=[
 ...frontLines.slice(0,7).map((points,i)=>({date:legacyDates[i],points})),
 {date:'08.07',points:[[27.3,55.83],[26.7,55.3],[26.4,54.9],[26.4,54.45],[25.9,53.9],[25.9,53.35],[25.7,52.9],[27.5,52.45]]},
 {date:'13.07',points:[[26,55.83],[25.4,55.3],[25.1,54.9],[25,54.45],[24.8,53.9],[24.6,53.35],[25,52.9],[26.3,52.45]]},
 {date:'16.07',points:[[25.5,55.83],[24.9,55.3],[24.5,54.9],[24,54.45],[23.6,53.9],[23.7,53.35],[24.2,52.9],[25.4,52.45]]},
 {date:'27.07',points:[[23.2,55.83],[23.8,55.3],[24,54.9],[23.3,54.45],[22.8,53.9],[22.9,53.35],[23,52.9],[23.8,52.45]]},
 {date:'28.07',points:[[23.2,55.83],[23.7,55.3],[23.9,54.9],[23.2,54.45],[22.7,53.9],[22.8,53.35],[22.9,52.9],[23.35,52.45]]},
 {date:'01.08',points:[[23,55.83],[23.3,55.3],[23.6,54.9],[23,54.45],[22.5,53.9],[22.6,53.35],[22.5,52.9],[22.1,52.45]]},
 {date:'14.08',points:[[23,55.83],[23,55.3],[23.1,54.9],[22.6,54.45],[22.2,53.9],[22.4,53.35],[22.2,52.9],[21.7,52.45]]},
 {date:'29.08',points:[[23,55.83],[22.9,55.3],[23,54.9],[22.5,54.45],[22,53.9],[22.2,53.35],[21.7,52.9],[21.4,52.45]]}
];
const datedFrontLines=campaignEvents.map(event=>{const day=campaignDay(event.date);let i=0;while(i<frontAnchors.length-2&&day>campaignDay(frontAnchors[i+1].date))i++;const start=frontAnchors[i],end=frontAnchors[i+1],t=Math.max(0,Math.min(1,(day-campaignDay(start.date))/(campaignDay(end.date)-campaignDay(start.date))));return start.points.map((p,j)=>[p[0]+(end.points[j][0]-p[0])*t,p[1]])});
export const frontPaths=datedFrontLines.map(line);
export const territoryPaths=datedFrontLines.map(points=>{
  const mapped=points.map(([lon,lat])=>xy(lon,lat));
  const edge=mapped.map(p=>`L${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const top=mapped[0].x.toFixed(1),bottom=mapped.at(-1).x.toFixed(1);
  return {german:`M0 0 L${top} 0 ${edge} L${bottom} ${MAP_HEIGHT} L0 ${MAP_HEIGHT} Z`,soviet:`M${top} 0 L${MAP_WIDTH} 0 L${MAP_WIDTH} ${MAP_HEIGHT} L${bottom} ${MAP_HEIGHT} ${[...mapped].reverse().map(p=>`L${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')} Z`,boundary:mapped[Math.floor(mapped.length/2)].x};
});

export const rails=[
  {id:'moscow-minsk',label:'магистраль Москва — Минск',points:[[31.5,54.53],[30.42,54.51],[29.70,54.41],[28.51,54.23],[27.56,53.90],[26.01,53.13],[23.69,52.10]]},
  {id:'bobruisk-luninets',label:'Бобруйск — Лунинец',points:[[29.23,53.14],[28.2,52.81],[26.80,52.25]]},
];

export const battleZones=[
  {id:'vitebsk',place:'vitebsk',stage:2,rx:49,ry:37,label:'Витебское окружение'},
  {id:'bobruisk',place:'bobruisk',stage:5,rx:52,ry:38,label:'Бобруйское окружение'},
  {id:'minsk',place:'borisov',stage:6,rx:72,ry:50,label:'Восточнее Минска'},
];
