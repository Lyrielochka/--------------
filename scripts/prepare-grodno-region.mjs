import fs from 'node:fs';
import assert from 'node:assert/strict';
import {prepareOsmRegion} from './prepare-osm-region.mjs';
const {points,feature:boundaryFeature}=prepareOsmRegion('grodno',59275,'Гродненская область');
const names=new Map(fs.readFileSync('artifacts/sources/geonames-BY/BY.txt','utf8').trim().split('\n').map(l=>{const r=l.split('\t');return [+r[0],r]}));
// Dates below are dates of Sovinformburo reports, not a reconstruction of the hour of liberation.
const rows=[
 ['smorgon',621713,'Сморгонь','07-05','Сморгонский','3Б'],
 ['oshmyany',630515,'Ошмяны','07-07','Ошмянский','3Б'],['ostrovets',623941,'Островец','07-07','Островецкий','3Б'],['gudogay',627986,'Гудогай','07-07','Островецкий','3Б'],
 ['ivye',627793,'Ивье','07-08','Ивьевский','3Б'],['golshany',628317,'Гольшаны','07-08','Ошмянский','3Б'],['lipnishki',626041,'Липнишки','07-08','Ивьевский','3Б'],['lyubcha',625712,'Любча','07-08','Новогрудский','2Б'],['korelichi',626939,'Кореличи','07-08','Кореличский','2Б'],
 ['lida',626081,'Лида','07-09','Лидский','3Б'],['novogrudok',624785,'Новогрудок','07-09','Новогрудский','2Б'],['dyatlovo',628658,'Дятлово','07-09','Дятловский','2Б'],
 ['benyakoni',629449,'Бенякони','07-10','Вороновский','3Б'],['slonim',621754,'Слоним','07-10','Слонимский','1Б'],
 ['voronovo',619979,'Вороново','07-11','Вороновский','3Б'],['zhirmuny',618820,'Жирмуны','07-11','Вороновский','3Б'],
 ['derechin',629095,'Деречин','07-12','Зельвенский','2Б'],['zelva',618932,'Зельва','07-12','Зельвенский','1Б'],
 ['shchuchin',622113,'Щучин','07-13','Щучинский','2Б'],['ostryna',623904,'Острына','07-13','Щучинский','2Б'],['zheludok',618863,'Желудок','07-13','Щучинский','2Б'],['mosty',625367,'Мосты','07-13','Мостовский','2Б'],
 ['skidel',611866,'Скидель','07-14','Гродненский','2Б'],['lunna',625816,'Лунна','07-14','Мостовский','2Б'],['ross',622700,'Россь','07-14','Волковысский','2Б'],['volkovysk',620391,'Волковыск','07-14','Волковысский','2Б'],
 ['porozovo',623192,'Порозово','07-15','Свислочский','1Б'],['krasnoselsky',626621,'Красносельский (Красное Село)','07-15','Волковысский','2Б'],
 ['grodno',627904,'Гродно','07-16','Гродно','2Б,3Б'],['gnezno',628372,'Гнезно','07-16','Волковысский','2Б'],
 ['svisloch',621048,'Свислочь','07-17','Свислочский','2Б'],['berestovitsa',629986,'Большая Берестовица','07-17','Берестовицкий','2Б'],
 ['indura',556386,'Индура','07-22','Гродненский','2Б'],['odelsk',624259,'Одельск','07-22','Гродненский','2Б']
];
const sources={};
for(const date of new Set(rows.map(r=>r[3]))){const day=+date.slice(3),label=day+' июля';sources['s'+date.replace('-','')]={title:'Совинформбюро · '+label+' 1944',url:'https://www.soldat.ru/doc/sovinfburo/1944/1944.html#:~:text='+encodeURIComponent('Оперативная сводка за '+label),kind:'Оперативная сводка',citation:'Сообщения Советского Информбюро. Т. 7. М., 1945. Электронная публикация Soldat.ru.'}}
sources.grodnoReport={title:'Боевое донесение штаба 3-го Белорусского фронта № 345/ОП · 16 июля 1944',url:'https://historyrussia.org/arkhivnye-dokumenty-ob-osvobozhdenii-evropy-ot-fashistskikh-zakhvatchikov/boevoe-donesenie-shtaba-3-belorusskogo-fronta-345-op-ot-16-07-1944-g-osvobozhdenie-g-grodno.html',kind:'Архивный документ'};
const itinerary=['smorgon','oshmyany','ivye','lida','novogrudok','dyatlovo','slonim','zelva','shchuchin','volkovysk','grodno','svisloch'];
const report=fs.readFileSync('artifacts/sources/sovinform-1944.txt','utf8');
const events=rows.map(([id,geoNameId,place,date,district,front])=>{const r=names.get(geoNameId);assert.ok(r,id);const day=+date.slice(3);const text=report.slice(report.indexOf('Оперативная сводка за '+day+' июля'),report.indexOf('Оперативная сводка за '+(day+1)+' июля'));const historicalName=id==='zheludok'?'ЖОЛУДОК':id==='krasnoselsky'?'КРАСНОЕ СЕЛО':id==='berestovitsa'?'ВЕЛИКАЯ БЕРЕСТОВИЦА':place.toUpperCase();assert.ok(text.toUpperCase().includes(historicalName),`Missing source evidence: ${id}`);return {id,geoNameId,place,title:place+' · освобождение',coordinates:[+r[5],+r[4]],start:'1944-'+date,end:'1944-'+date,reportDate:'1944-'+date,district,front:front.split(','),type:'liberation',summary:`${place}: сводка Совинформбюро от ${day} июля сообщает о занятии населённого пункта советскими войсками.`,meaning:'Эпизод продвижения советских войск по территории современной Гродненской области в операции «Багратион».',evidence:'settlement-report',precision:'town',sources:['s'+date.replace('-','')],note:'Указан день сообщения Совинформбюро. Он может отличаться от даты входа передовых частей и завершения боёв; координаты обозначают населённый пункт.',major:itinerary.includes(id)}});
function episode(id,placeId,title,start,end,type,summary){const base=events.find(e=>e.id===placeId);events.push({...base,id,title,start:'1944-'+start,end:'1944-'+end,reportDate:'1944-'+end,type,summary,evidence:'area-report',precision:'area',sources:['s'+end.replace('-','')],note:'Условный знак привязан к населённому пункту как ориентиру; точные участки переправ и позиции частей не реконструированы.',major:true})}
episode('shchara-crossing','slonim','Форсирование Щары','07-10','07-10','crossing','Сводка от 10 июля сообщает о форсировании Щары войсками 1-го Белорусского фронта на участке протяжением 60 километров и занятии Слонима.');
episode('ross-crossing','ross','Переправы через Россь','07-15','07-15','crossing','Сводка от 15 июля сообщает о форсировании Росси к северу от Волковыска и занятии населённых пунктов на её западном берегу.');
episode('grodno-assault','grodno','Бои за Гродно','07-14','07-16','battle','Сводка от 16 июля сообщает о занятии Гродно войсками 3-го и 2-го Белорусских фронтов после трёхдневных боёв.');
events.find(e=>e.id==='grodno').sources.push('grodnoReport');
events.find(e=>e.id==='zheludok').summary='В сводке от 13 июля среди занятых железнодорожных станций названа станция Жолудок. Знак привязан к посёлку Желудок как географическому ориентиру.';
events.find(e=>e.id==='zheludok').title='Желудок · железнодорожная станция';
events.find(e=>e.id==='novogrudok').note+=' В местной памятной хронологии освобождение Новогрудка датируется 8 июля; здесь приведён день сводки — 9 июля.';
events.sort((a,b)=>a.start.localeCompare(b.start)||a.id.localeCompare(b.id));
const timeline=[];for(let d=new Date('1944-07-05T12:00:00Z');d<=new Date('1944-07-22T12:00:00Z');d.setUTCDate(d.getUTCDate()+1))timeline.push(d.toISOString().slice(0,10));
const registry={version:1,boundary:boundaryFeature.properties,checked:'2026-11-04',scope:'Территория современной Гродненской области. Эпизоды операции «Багратион» по сообщениям 5–22 июля 1944 года.',completeness:'Реестр не исчерпывает всех боестолкновений. Он объединяет подтверждённые сводками эпизоды и населённые пункты. Даты сводок могут отличаться от местных памятных дат; отсутствие знака не означает отсутствия боёв.',coordinates:'Координаты GeoNames обозначают населённые пункты; для боёв и переправ показан район. Граница OpenStreetMap contributors (ODbL-1.0) служит географическим ориентиром. Гродненская область создана после описанных событий; граница не изображает административное деление июля 1944 года.',sources,events,itinerary,timeline};
for(const p of ['src/grodnoBattleEvents.json','public/data/grodno-battle-events.json'])fs.writeFileSync(p,JSON.stringify(registry,null,2)+'\n');
console.log(`Grodno: ${events.length} source-linked events, ${points.length} boundary vertices`);
