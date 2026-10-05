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
export const axes=[
  {id:'baltic',front:'1-й Прибалтийский',color:'#64d9ec',progress:[0,.24,.62,.9,1,1,1,1,1],points:[[31.00,55.52],[30.34,55.36],[30.20,55.19],[29.61,55.30],[28.81,55.49]]},
  {id:'third-north',front:'3-й Белорусский',color:'#ffd46b',progress:[0,.2,.68,1,1,1,1,1,1],points:[[31.02,55.10],[30.20,55.19],[29.57,54.93],[28.51,54.23]]},
  {id:'third',front:'3-й Белорусский',color:'#ffd46b',progress:[0,.13,.32,.58,.7,.86,1,1,1],points:[[31.25,54.50],[30.42,54.51],[29.70,54.41],[28.51,54.23],[27.56,53.90]]},
  {id:'second',front:'2-й Белорусский',color:'#a9eaaa',progress:[0,.13,.22,.46,.75,.88,1,1,1],points:[[31.30,53.90],[30.34,53.91],[28.98,53.83],[27.56,53.90]]},
  {id:'first-north',front:'1-й Белорусский',color:'#ff8f80',progress:[0,.16,.31,.43,.55,.78,1,1,1],points:[[31.00,53.12],[30.05,53.09],[29.23,53.14],[28.48,53.55],[27.56,53.90]]},
  {id:'first-south',front:'1-й Белорусский',color:'#ff8f80',progress:[0,.12,.22,.4,.55,1,1,1,1],points:[[30.86,52.82],[30.02,52.89],[29.23,53.14]]},
  {id:'west-north',front:'Дальнейшее продвижение',color:'#bd8f70',progress:[0,0,0,0,0,0,.08,.65,1],points:[[27.56,53.90],[26.85,54.31],[25.30,53.89],[23.83,53.68]]},
  {id:'west-south',front:'Дальнейшее продвижение',color:'#d19a68',progress:[0,0,0,0,0,0,.08,.65,1],points:[[29.23,53.14],[26.01,53.13],[23.69,52.10]]},
];

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
export const frontPaths=frontLines.map(line);
export const territoryPaths=frontLines.map(points=>{
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
