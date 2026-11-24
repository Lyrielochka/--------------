import fs from 'node:fs';
import assert from 'node:assert/strict';
import {prepareOsmRegion} from './prepare-osm-region.mjs';
const {points,feature:boundaryFeature}=prepareOsmRegion('brest',59189,'Брестская область');
const names=new Map(fs.readFileSync('artifacts/sources/geonames-BY/BY.txt','utf8').trim().split('\n').map(l=>{const r=l.split('\t');return [+r[0],r]}));
// Dates below are dates of Sovinformburo reports, not a reconstruction of the hour of liberation.
const rows=[
 [
  "lyakhovichi",
  625772,
  "Ляховичи",
  "07-06",
  "Ляховичский",
  "1Б"
 ],
 [
  "stolin",
  621277,
  "Столин",
  "07-07",
  "Столинский",
  "1Б"
 ],
 [
  "gorodishche",
  628175,
  "Городище",
  "07-08",
  "Барановичский",
  "2Б"
 ],
 [
  "baranovichi",
  630429,
  "Барановичи",
  "07-08",
  "Барановичи",
  "1Б"
 ],
 [
  "gantsevichi",
  627909,
  "Ганцевичи",
  "07-08",
  "Ганцевичский",
  "1Б"
 ],
 [
  "mikashevichi",
  625228,
  "Микашевичи",
  "07-09",
  "Лунинецкий",
  "1Б"
 ],
 [
  "luninets",
  625818,
  "Лунинец",
  "07-10",
  "Лунинецкий",
  "1Б"
 ],
 [
  "david-gorodok",
  629159,
  "Давид-Городок",
  "07-10",
  "Столинский",
  "1Б"
 ],
 [
  "ivatsevichi",
  627800,
  "Ивацевичи",
  "07-12",
  "Ивацевичский",
  "1Б"
 ],
 [
  "kossovo",
  626829,
  "Коссово",
  "07-12",
  "Ивацевичский",
  "1Б"
 ],
 [
  "parakhonsk",
  623782,
  "Парахонск",
  "07-12",
  "Пинский",
  "1Б"
 ],
 [
  "ruzhany",
  622500,
  "Ружаны",
  "07-13",
  "Пружанский",
  "1Б"
 ],
 [
  "pinsk",
  623549,
  "Пинск",
  "07-14",
  "Пинск",
  "1Б"
 ],
 [
  "logishin",
  626266,
  "Логишин",
  "07-15",
  "Пинский",
  "1Б"
 ],
 [
  "bereza",
  629454,
  "Берёза",
  "07-16",
  "Берёзовский",
  "1Б"
 ],
 [
  "ivanovo",
  627811,
  "Иваново",
  "07-16",
  "Ивановский",
  "1Б"
 ],
 [
  "telekhany",
  620945,
  "Телеханы",
  "07-16",
  "Ивацевичский",
  "1Б"
 ],
 [
  "motol",
  624908,
  "Мотоль",
  "07-16",
  "Ивановский",
  "1Б"
 ],
 [
  "pruzhany",
  622997,
  "Пружаны",
  "07-17",
  "Пружанский",
  "1Б"
 ],
 [
  "shereshevo",
  622090,
  "Шерешево",
  "07-17",
  "Пружанский",
  "1Б"
 ],
 [
  "drogichin",
  628884,
  "Дрогичин",
  "07-17",
  "Дрогичинский",
  "1Б"
 ],
 [
  "vidomlya",
  620196,
  "Видомля",
  "07-17",
  "Каменецкий",
  "1Б"
 ],
 [
  "zhabinka",
  618913,
  "Жабинка",
  "07-18",
  "Жабинковский",
  "1Б"
 ],
 [
  "antopol",
  630543,
  "Антополь",
  "07-18",
  "Дрогичинский",
  "1Б"
 ],
 [
  "kobrin",
  627145,
  "Кобрин",
  "07-20",
  "Кобринский",
  "1Б"
 ],
 [
  "divin",
  629054,
  "Дивин",
  "07-21",
  "Кобринский",
  "1Б"
 ],
 [
  "kamenets",
  627711,
  "Каменец",
  "07-22",
  "Каменецкий",
  "1Б"
 ],
 [
  "chernavchitsy",
  629338,
  "Чернавчицы",
  "07-24",
  "Брестский",
  "1Б"
 ],
 [
  "brest",
  629634,
  "Брест",
  "07-28",
  "Брест",
  "1Б"
 ],
 [
  "vysokoe",
  619818,
  "Высокое",
  "07-28",
  "Каменецкий",
  "1Б"
 ]
];

const sources={};
for(const date of new Set(rows.map(r=>r[3]))){const day=+date.slice(3),label=day+' июля';sources['s'+date.replace('-','')]={title:'Совинформбюро · '+label+' 1944',url:'https://www.soldat.ru/doc/sovinfburo/1944/1944.html#:~:text='+encodeURIComponent('Оперативная сводка за '+label),kind:'Оперативная сводка',citation:'Сообщения Советского Информбюро. Т. 7. М., 1945. Электронная публикация Soldat.ru.'}}
const itinerary=['lyakhovichi','stolin','baranovichi','luninets','pinsk','bereza','ivanovo','pruzhany','drogichin','zhabinka','kobrin','brest'];
const report=fs.readFileSync('artifacts/sources/sovinform-1944.txt','utf8');
const aliases={mikashevichi:'МИКАШЕВИЧЕ',ivatsevichi:'ИВАНЦЕВИЧИ',parakhonsk:'ПАРОХОНЬСК',bereza:'БЕРЕЗА-КАРТУЗСКАЯ',ivanovo:'ЯНОВ',shereshevo:'ШЕРЕШОВ'};
const normalize=s=>s.toUpperCase().replaceAll('Ё','Е');
const events=rows.map(([id,geoNameId,place,date,district,front])=>{const r=names.get(geoNameId);assert.ok(r,id);const day=+date.slice(3);const text=report.slice(report.indexOf('Оперативная сводка за '+day+' июля'),report.indexOf('Оперативная сводка за '+(day+1)+' июля'));assert.ok(normalize(text).includes(normalize(aliases[id]||place)),'Missing source evidence: '+id);return {id,geoNameId,place,title:place+' · освобождение',coordinates:[+r[5],+r[4]],start:'1944-'+date,end:'1944-'+date,reportDate:'1944-'+date,district,front:front.split(','),type:'liberation',summary:place+': сводка Совинформбюро от '+day+' июля сообщает о занятии населённого пункта советскими войсками.',meaning:'Эпизод продвижения советских войск по территории современной Брестской области в операции «Багратион».',evidence:'settlement-report',precision:'town',sources:['s'+date.replace('-','')],note:'Указан день сообщения Совинформбюро. Он может отличаться от даты входа передовых частей и завершения боёв; координаты обозначают населённый пункт.',major:itinerary.includes(id)}});
function episode(id,placeId,title,date,type,summary){const base=events.find(e=>e.id===placeId);events.push({...base,id,title,start:'1944-'+date,end:'1944-'+date,reportDate:'1944-'+date,type,summary,evidence:'area-report',precision:'area',sources:['s'+date.replace('-','')],note:'Знак обозначает район события и привязан к городу как ориентиру. Точные участки переправ и позиции частей не реконструированы.',major:true})}
episode('pinsk-crossing','pinsk','Переправы через Ясельду и Припять','07-14','crossing','Сводка от 14 июля сообщает о форсировании Ясельды и Припяти при наступлении на Пинск.');
episode('pinsk-flotilla','pinsk','Штурм Пинска при поддержке флотилии','07-14','battle','Сводка от 14 июля сообщает о занятии Пинска войсками 1-го Белорусского фронта при поддержке Днепровской речной военной флотилии.');
episode('brest-assault','brest','Обходной манёвр и штурм Бреста','07-28','battle','Сводка от 28 июля сообщает о занятии Бреста в результате обходного манёвра и атаки с фронта войск 1-го Белорусского фронта.');
episode('brest-ring','brest','Окружение противника западнее Бреста','07-28','encirclement','Сводка от 28 июля сообщает об окружении группировки западнее Бреста у Западного Буга. Знак у Бреста служит ориентиром; часть района боёв находится за пределами современной Беларуси.');
events.find(e=>e.id==='ivatsevichi').title='Ивацевичи · железнодорожная станция';
events.find(e=>e.id==='ivatsevichi').summary='Сводка от 12 июля называет станцию Ивацевичи (в электронной транскрипции — «ИВАНЦЕВИЧИ»). Знак привязан к городу как ориентиру.';
events.find(e=>e.id==='ivatsevichi').note+=' Название станции в электронной публикации содержит опечатку.';
for(const [id,name] of Object.entries({ivanovo:'Янов',bereza:'Берёза-Картузская',shereshevo:'Шерешов'}))events.find(e=>e.id===id).note+=' В сводке использовано название «'+name+'».';
events.sort((a,b)=>a.start.localeCompare(b.start)||a.id.localeCompare(b.id));
const timeline=[];for(let d=new Date('1944-07-06T12:00:00Z');d<=new Date('1944-07-28T12:00:00Z');d.setUTCDate(d.getUTCDate()+1))timeline.push(d.toISOString().slice(0,10));
const registry={version:1,boundary:boundaryFeature.properties,checked:'2026-11-04',scope:'Территория современной Брестской области. Эпизоды операции «Багратион» по сообщениям 6–28 июля 1944 года.',completeness:'Реестр не исчерпывает всех боестолкновений. Он содержит подтверждённые сводками населённые пункты, бои, переправы и окружение западнее Бреста. Даты сообщений могут отличаться от местных памятных дат. Оборона Брестской крепости 1941 года не входит в эту экспозицию.',coordinates:'Координаты GeoNames обозначают населённые пункты; для переправ, боёв и окружения показан район. Граница OpenStreetMap contributors (ODbL-1.0) служит ориентиром и не изображает административное деление июля 1944 года.',sources,events,itinerary,timeline};
for(const p of ['src/brestBattleEvents.json','public/data/brest-battle-events.json'])fs.writeFileSync(p,JSON.stringify(registry,null,2)+'\n');
console.log('Brest: '+events.length+' source-linked events, '+points.length+' boundary vertices');
