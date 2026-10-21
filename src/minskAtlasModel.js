import registry from './minskBattleEvents.json' with {type:'json'};
import {xy} from './bagrationMapData.js';
export {registry};
export const eventTypes={liberation:{name:'Освобождение',color:'#e4cb94'},battle:{name:'Бои',color:'#ee9582'},crossing:{name:'Переправы',color:'#82ced0'},air:{name:'Авиация',color:'#9db9e4'},encirclement:{name:'Окружение',color:'#c6aad7'}};
const dateFormatter=new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'long',timeZone:'UTC'});
const dateLabels=new Map();
export const dateLabel=date=>{if(!dateLabels.has(date))dateLabels.set(date,dateFormatter.format(new Date(date+'T12:00:00Z')));return dateLabels.get(date)};
export const shortDate=date=>date.slice(8)+'.'+date.slice(5,7);
export const periodLabel=event=>event.start===event.end?dateLabel(event.start):`${shortDate(event.start)} — ${shortDate(event.end)}`;
export function filterEvents(events,{query='',type='all',day='all',major=false}){
 const text=query.toLocaleLowerCase('ru').replaceAll('ё','е').trim();
 return events.filter(e=>(type==='all'||e.type===type)&&(day==='all'||e.start<=day&&e.end>=day)&&(!major||e.major)&&(!text||[e.place,e.title,e.district,e.people||'',e.summary].join(' ').toLocaleLowerCase('ru').replaceAll('ё','е').includes(text)));
}
// Screen-space grouping: a marker is a group of records, never an invented battle.
export function clusterEvents(events,pixelsPerUnit,radius=34){
 const groups=[];
 for(const event of events){const point=xy(...event.coordinates);let group=groups.find(g=>Math.hypot(point.x-g.x,point.y-g.y)*pixelsPerUnit<radius);
  if(!group){group={x:point.x,y:point.y,events:[]};groups.push(group)}
  const count=group.events.length;group.x=(group.x*count+point.x)/(count+1);group.y=(group.y*count+point.y)/(count+1);group.events.push(event);
 }
 return groups.map(g=>({...g,id:g.events.map(e=>e.id).sort().join('-')}));
}
