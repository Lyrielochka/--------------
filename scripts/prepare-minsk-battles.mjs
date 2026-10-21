import {applyMuseumCopy} from './minsk-museum-copy.mjs';
import fs from 'node:fs';
const rows=new Map(fs.readFileSync('artifacts/sources/geonames-BY/BY.txt','utf8').trim().split('\n').map(l=>{const r=l.split('\t');return [Number(r[0]),r]}));
const raw=[
// id | name | GeoNames ID | date | district | front
'bobr|Бобр|630070|06-27|Крупский|3',
'obchuga|Обчуга|624287|06-27|Крупский|3',
'krupki|Крупки|626471|06-28|Крупский|3',
'kholopenichi|Холопеничи|627424|06-28|Крупский|3',
'starye-dorogi|Старые Дороги|621396|06-28|Стародорожский|1',
'slutsk|Слуцк|621741|06-30|Слуцкий|1',
'lyuban|Любань|625721|06-30|Любанский|1',
'urechye|Уречье|620558|06-30|Любанский|1',
'borisov|Борисов|630376|07-01|Борисовский|3',
'zembin|Зембин|618927|07-01|Борисовский|3',
'pleshchenitsy|Плещеницы|623512|07-01|Логойский|3',
'kopyl|Копыль|626956|07-01|Копыльский|1',
'krasnaya-sloboda|Красная Слобода|626660|07-01|Солигорский|1',
'gresk|Греск|628079|07-01|Слуцкий|1',
'vileika|Вилейка|620181|07-02|Вилейский|3',
'krasnoe|Красное|626610|07-02|Молодечненский|3',
'stolbtsy|Столбцы|621266|07-02|Столбцовский|1',
'gorodeya|Городея|628182|07-02|Несвижский|1',
'nesvizh|Несвиж|624700|07-02|Несвижский|1',
'zhodino|Жодино|618800|07-02|Жодино|3',
'smolevichi|Смолевичи|621729|07-02|Смолевичский|3',
'cherven|Червень|629273|07-02|Червенский|1',
'starobin|Старобин|621462|07-02|Солигорский|1',
'minsk|Минск|625144|07-03|Минск|1,3',
'logoysk|Логойск|625972|07-03|Логойский|3',
'budslav|Будслав|621404|07-03|Мядельский|3',
'dolginovo|Долгиново|628990|07-03|Вилейский|3',
'ilya|Илья|627878|07-03|Вилейский|3',
'kurenets|Куренец|626344|07-03|Вилейский|3',
'kraysk|Крайск|626559|07-03|Логойский|3',
'ostroshitsky|Острошицкий Городок|623956|07-03|Минский|3',
'maryina-gorka|Марьина Горка|625409|07-03|Пуховичский|1',
'pukhovichi|Пуховичи|622971|07-03|Пуховичский|1',
'smilovichi|Смиловичи|621732|07-03|Червенский|1',
'shatsk|Шацк|622158|07-03|Пуховичский|1',
'timkovichi|Тимковичи|620869|07-03|Копыльский|1',
'bluzha|Блужа|630085|07-03|Пуховичский|1',
'semezhevo|Семежево|622285|07-03|Копыльский|1',
'berezino|Березино|630197|07-03|Березинский|2',
'myadel|Мядель|624861|07-04|Мядельский|1П,3',
'radoshkovichi|Радошковичи|622877|07-04|Молодечненский|3',
'zaslavl|Заславль|619066|07-04|Минский|3',
'krivichi|Кривичи|626523|07-04|Мядельский|3',
'rudensk|Руденск|622614|07-04|Пуховичский|1',
'uzda|Узда|620483|07-04|Узденский|1',
'kletsk|Клецк|627214|07-04|Клецкий|1',
'vyazyn|Вязынь|619878|07-04|Вилейский|3',
'ratomka|Ратомка|622823|07-04|Минский|3',
'kolodishchi|Колодищи|627083|07-04|Минский|3',
'mikhanovichi|Михановичи|8285492|07-04|Минский|1',
'molodechno|Молодечно|625625|07-05|Молодечненский|3',
'rakov|Раков|622849|07-05|Воложинский|3',
'samokhvalovichi|Самохваловичи|622420|07-05|Минский|',
'fanipol|Фаниполь|6846555|07-05|Дзержинский|',
'demidovichi|Демидовичи|629119|07-05|Дзержинский|',
'volozhin|Воложин|620445|07-06|Воложинский|',
'ivenets|Ивенец|627798|07-06|Воложинский|',
'svir|Свирь|621058|07-06|Мядельский|',
'negoreloe|Негорелое|624758|07-06|Дзержинский|',
'dzerzhinsk|Дзержинск|628634|07-06|Дзержинский|',
'dory|Доры|628934|07-06|Воложинский|',
'losk|Лоск|625927|07-06|Воложинский|',
'lebedevo|Лебедево|626199|07-06|Молодечненский|',
'naliboki|Налибоки|624816|07-07|Столбцовский|',
'derevnaya|Деревная|629091|07-07|Столбцовский|',
'kolosovo|Колосово|8072259|07-07|Столбцовский|',
'vishnevo|Вишнево|620147|07-07|Воложинский|',
];
const month=d=>d.slice(0,2)==='06'?'июня':'июля';
const sources={};
for(const line of raw){const date=line.split('|')[3];const key='s'+date.replace('-','');if(!sources[key])sources[key]={title:`Совинформбюро · ${Number(date.slice(3))} ${month(date)} 1944`,url:'https://www.soldat.ru/doc/sovinfburo/1944/1944.html#:~:text='+encodeURIComponent(`Оперативная сводка за ${Number(date.slice(3))} ${month(date)}`),kind:'Оперативная сводка',citation:'Сообщения Советского Информбюро. Т. 7. М., 1945. Электронная публикация Soldat.ru.'}}
Object.assign(sources,{
 order127:{title:'Приказ ВГК № 127 · 2 июля 1944',url:'https://grachev62.narod.ru/stalin/orders/chapt127.htm',kind:'Первичный документ',citation:'Приказы Верховного Главнокомандующего. Воениздат, 1975. С. 168–169.'},
 order130:{title:'Приказ ВГК № 130 · 5 июля 1944',url:'https://grachev62.narod.ru/stalin/orders/chapt130.htm',kind:'Первичный документ'},
 minsk:{title:'Память народа · Минская наступательная операция',url:'https://pamyat-naroda.ru/ops/minskaya-nastupatelnaya-operatsiya-operatsiya-5-go-udara/',kind:'Архивный портал'},
 elar:{title:'ЭЛАР · Минская операция',url:'https://pobeda.elar.ru/issues/operatsiya-bagration-chast-ii-osvobozhdenie-minska/minskaya-operatsiya/',kind:'Исторический обзор'},
 rak:{title:'ЭЛАР · Экипаж Павла Рака',url:'https://pobeda.elar.ru/issues/operatsiya-bagration-chast-ii-osvobozhdenie-minska/16-chasov-do-bessmertiya/',kind:'Исторический очерк'},
 baramzina:{title:'Глазовский краеведческий музей · Бои у Пекалина',url:'https://glazovmuseum.ru/our-articles/99-zagadki-poslednego-boya-tatyany-bar.html',kind:'Музейное исследование',citation:'Г. А. Кочин, научный сотрудник отдела истории. 14.07.2015.'},
 berezino:{title:'Березинская районная библиотека · История города',url:'https://berezinolib.ucoz.net/index/istoricheskie_svedenija_o_berezino/0-106',kind:'Краеведческий источник'},
 nesvizh:{title:'Из истории освобождения Несвижа',url:'https://nesvizh1223.ucoz.ru/publ/2-1-0-231',kind:'Краеведческая публикация'},
 dzerzhinsk:{title:'История Дзержинска · Освобождение',url:'https://ru.wikipedia.org/wiki/История_Дзержинска_(Минская_область)',kind:'Дополнительная сверка даты'},
 geo:{title:'GeoNames · географические названия',url:'https://www.geonames.org/',kind:'Координаты',citation:'GeoNames, CC BY 4.0. Выгрузка BY.txt, 18.10.2026.'}
});
const events=raw.map(line=>{
 const [id,place,gid,date,district,front]=line.split('|');const r=rows.get(Number(gid));if(!r)throw Error('Missing GeoNames '+gid);
 return {id,place,title:`Освобождение: ${place}`,coordinates:[Number(r[5]),Number(r[4])],geoNameId:Number(gid),start:`1944-${date}`,end:`1944-${date}`,reportDate:`1944-${date}`,district,front:front?front.split(','):[],type:'liberation',summary:`${place}: занятие населённого пункта зафиксировано в оперативной сводке наступления.`,meaning:'Запись позволяет проследить продвижение войск между крупными узлами операции.',evidence:'settlement-report',precision:'town',sources:['s'+date.replace('-','')],note:'Дата записи — дата сводки. Она не устанавливает время каждого местного боя.'};
});
const by=id=>events.find(e=>e.id===id);
const enrich=(id,fields)=>Object.assign(by(id),fields);
enrich('bobr',{title:'Бобр. Первый рубеж на пути к Березине',major:true,meaning:'Наступление выходит на территорию нынешней Минской области с востока. Посёлок и станция названы в сводке 27 июня.'});
enrich('krupki',{title:'Крупки. Дорога на Борисов',major:true,summary:'В сводке 28 июня названы освобождённые Крупки и железнодорожная станция.',meaning:'Один из пунктов стремительного продвижения на минском направлении.'});
enrich('starye-dorogi',{title:'Старые Дороги. Южное направление',major:true,summary:'1-й Белорусский фронт занял Старые Дороги — город и железнодорожную станцию.',meaning:'Южная ветвь наступления развивалась одновременно с ударом на Борисов.'});
enrich('slutsk',{title:'Слуцк. Удар с юга',major:true,summary:'После боёв на подступах советские войска овладели Слуцком. Дата освобождения — 30 июня.',meaning:'Взятие города позволило продолжить наступление к коммуникациям юго-западнее Минска.',sources:['s0630','elar']});
enrich('borisov',{title:'Борисов. Путь через Березину',major:true,start:'1944-06-30',summary:'Уличные бои начались 30 июня. В сводке 1 июля сообщено о взятии Борисова.',meaning:'Преодоление этого узла открыло прямое направление к Минску.',sources:['s0630','s0701','elar'],note:'Период объединяет начало уличных боёв и сообщение об освобождении.'});
enrich('vileika',{title:'Вилейка. Северный охват',major:true,summary:'Взятие Вилейки зафиксировано в приказе ВГК № 127 от 2 июля.',meaning:'Перерезаны коммуникации, связывавшие Минск с Вильно и Лидой.',sources:['order127','s0702']});
for(const id of ['krasnoe','stolbtsy','gorodeya'])enrich(id,{sources:['order127','s0702'],meaning:id==='krasnoe'?'Узел на направлении Минск — Молодечно: часть северного охвата.':'Перехват коммуникаций юго-западнее Минска ограничивал пути отхода противника.'});
enrich('stolbtsy',{title:'Столбцы. Перерезанная магистраль',major:true});
enrich('nesvizh',{title:'Несвиж. Бои за узел коммуникаций',major:true,end:'1944-07-04',summary:'Приказ от 2 июля сообщил о занятии Несвижа. Краеведческая публикация описывает последующие бои 3–4 июля.',meaning:'Контроль коммуникаций юго-западнее Минска укреплял внешний фронт окружения.',sources:['order127','nesvizh'],note:'Занятие города и завершение боёв — разные этапы. Поэтому указан период 2–4 июля.'});
enrich('minsk',{title:'Минск. Освобождение столицы',major:true,evidence:'documented-event',summary:'3 июля советские войска вошли в Минск с нескольких направлений и освободили столицу.',meaning:'Западнее отходивших немецких войск замкнулось окружение; бои восточнее города продолжились.',sources:['s0703','minsk'],precision:'city',note:'Минск показан как центральный эпизод операции; административно город не входит в современную область.'});
enrich('maryina-gorka',{major:true,title:'Марьина Горка. Южные подступы',meaning:'Пункт южного наступления на пути к минскому узлу. В сводке он назван отдельно как районный центр.'});
enrich('berezino',{summary:'Освобождение Березино 3 июля указано в исторической справке районной библиотеки.',sources:['berezino'],evidence:'local-history',reportDate:null,note:'Дата освобождения из краеведческого источника. Точка обозначает центр города.'});
enrich('myadel',{front:[],note:'Дата по сводке 4 июля. Состав непосредственных участников здесь не уточняется.'});
enrich('molodechno',{title:'Молодечно. Следующий рубеж',major:true,start:'1944-07-03',summary:'3 июля сводка сообщала о боях на окраинах. 5 июля приказ ВГК зафиксировал овладение железнодорожным узлом.',meaning:'Наступление продолжалось на запад уже после освобождения Минска.',sources:['s0703','order130'],note:'Показан период боёв 3–5 июля, а не только дата сообщения о взятии города.'});
enrich('volozhin',{start:'1944-07-05',note:'В местной истории встречается 5 июля; оперативная сводка сообщила о взятии города 6 июля. На карте показан интервал.',sources:['s0706','s0705']});
enrich('dzerzhinsk',{end:'1944-07-07',note:'В сводке город назван 6 июля; в краеведческой традиции встречается 7 июля. Разночтение сохранено.',sources:['s0706','dzerzhinsk']});
// Separate tactical episodes: location of a settlement/area, never an invented exact firing position.
function episode(id,placeId,fields){const p=by(placeId);events.push({...p,id,major:true,evidence:'documented-event',precision:'area',reportDate:null,note:'Указан район эпизода, а не точная позиция подразделения.',...fields})}
episode('berezina-crossing','borisov',{place:'Бытча · Березина',coordinates:[28.4085,54.3083],geoNameId:629431,title:'Березина. Захват плацдармов',start:'1944-06-29',end:'1944-06-30',type:'crossing',summary:'Войска вышли к Березине севернее Борисова и форсировали реку. В сводке назван район Бытчи.',meaning:'Плацдармы позволили продолжить наступление западнее водной преграды.',sources:['s0629','s0630','elar']});
episode('rak-crew','borisov',{title:'Экипаж Павла Рака',start:'1944-06-30',end:'1944-06-30',type:'battle',summary:'Танк Павла Рака прорвался через переправы в Борисов и вёл бой в отрыве от основных сил. Экипаж погиб.',meaning:'Операция состояла не только из стрелок на карте: прорыв обеспечивали конкретные экипажи.',sources:['rak'],people:'Павел Рак · Александр Петряев · Алексей Данилов'});
episode('minsk-air','minsk',{title:'Минский железнодорожный узел. Ночной налёт',start:'1944-07-01',end:'1944-07-01',type:'air',summary:'Отдельное сообщение 1 июля описывает ночной удар авиации по железнодорожным узлам, включая Минск.',meaning:'Авиация воздействовала на тыловые коммуникации перед подходом наземных войск.',sources:['s0701'],note:'Налёт в ночь на 1 июля. Маркер — район узла, не точка падения боеприпасов.'});
episode('molodechno-air','molodechno',{title:'Молодечно. Удар по железнодорожному узлу',start:'1944-07-01',end:'1944-07-01',type:'air',summary:'Молодечно упомянуто среди железнодорожных узлов, атакованных авиацией в ночь на 1 июля.',meaning:'Воздействие на коммуникации предшествовало наземным боям за город.',sources:['s0701']});
episode('shemetovo','smolevichi',{place:'Шеметово · район Пекалина',coordinates:[28.064,53.9096],geoNameId:622099,district:'Смолевичский',title:'Шеметово. Последний бой Татьяны Барамзиной',start:'1944-07-04',end:'1944-07-05',type:'battle',summary:'Батальон 252-го стрелкового полка перекрывал путь отхода противника. Связистка Татьяна Барамзина осталась с ранеными и погибла.',meaning:'Музейное исследование уточняет место: Шеметово в районе Пекалина, а не центр Пекалина.',sources:['baramzina'],people:'Татьяна Барамзина · 252-й стрелковый полк',front:['3'],note:'Период 4–5 июля. Локализация опирается на музейную реконструкцию; показан центр деревни, не медпункт.'});
episode('volma','smolevichi',{place:'Волма',coordinates:[27.906,53.8902],geoNameId:620064,district:'Смолевичский',title:'Волма. Отражение танковой атаки',start:'1944-07-05',end:'1944-07-05',type:'battle',summary:'У Волмы при отражении танковой атаки погиб артиллерист Газанфар Акперов.',meaning:'Локальный бой был частью борьбы с окружёнными немецкими войсками восточнее Минска.',sources:['baramzina'],people:'Газанфар Акперов',front:['3']});
episode('smilovichi-breakout','smilovichi',{title:'Смиловичи. Попытка выхода из окружения',start:'1944-07-06',end:'1944-07-06',type:'battle',summary:'Группа под командованием Ганса Траута пыталась прорваться у Смиловичей и встретила части 49-й армии.',meaning:'Освобождение населённого пункта не означало немедленного окончания боёв вокруг него.',sources:['elar'],front:['2'],people:'49-я армия · группа Ганса Траута'});
episode('sinilo','smilovichi',{place:'Синило · Свислочь',coordinates:[27.7256,53.7796],geoNameId:621942,district:'Минский',title:'Свислочь. Срыв следующего прорыва',start:'1944-07-06',end:'1944-07-06',type:'crossing',summary:'После неудачи у Смиловичей группа Траута вновь пыталась выйти к переправам через Свислочь у Синило.',meaning:'Реки и переправы определяли направления попыток выхода из котла.',sources:['elar'],front:['2']});
episode('cauldron','smolevichi',{place:'Восточнее Минска · район Пекалина',coordinates:[28.1226,53.9088],geoNameId:623715,title:'Минский котёл. Бои внутри кольца',start:'1944-07-03',end:'1944-07-11',type:'encirclement',summary:'После замыкания кольца продолжались бои с окружёнными частями. Сводка 11 июля сообщила о завершении их ликвидации.',meaning:'День освобождения Минска и завершение боёв восточнее города разделяет больше недели.',sources:['s0703','s0711','minsk'],front:['2','3'],note:'Маркер — условный центр большой зоны боёв. Он не обозначает границу котла или отдельный бой.'});
sources.s0629??={title:'Совинформбюро · 29 июня 1944',url:'https://www.soldat.ru/doc/sovinfburo/1944/1944.html#:~:text='+encodeURIComponent('Оперативная сводка за 29 июня'),kind:'Оперативная сводка'};
sources.s0711={title:'Совинформбюро · 11 июля 1944',url:'https://www.soldat.ru/doc/sovinfburo/1944/1944.html#:~:text='+encodeURIComponent('Оперативная сводка за 11 июля'),kind:'Оперативная сводка'};
sources.air0701={title:'Совинформбюро · Налёты в ночь на 1 июля',url:'https://rus.team/events/svodka-sovinformbyuro-za-1-iyulya-1944-goda',kind:'Первичное сообщение, электронная публикация'};
by('minsk-air').sources=['air0701'];by('molodechno-air').sources=['air0701'];
sources.volozhin={title:'Воложин · Историческая справка',url:'https://ru.wikipedia.org/wiki/Воложин',kind:'Дополнительная сверка даты'};
by('volozhin').sources=['s0706','volozhin'];
sources.encyclopedia={title:'Энциклопедия России · Белорусская операция 1944',url:'https://encyclopaedia-russia.ru/article/belorusskaya-operaciya-1944/',kind:'Исторический обзор'};
by('smilovichi-breakout').sources=['encyclopedia'];by('sinilo').sources=['encyclopedia'];
for(const id of ['bluzha','kolodishchi','mikhanovichi','fanipol','negoreloe','kolosovo']){const e=by(id);e.title=`Железнодорожная станция: ${e.place}`;e.summary=`Оперативная сводка назвала железнодорожную станцию ${e.place} среди занятых пунктов.`;e.note='Дата — день сообщения. Географический ориентир — одноимённый населённый пункт, а не точный участок железнодорожных путей.';e.precision='area';}
applyMuseumCopy(events);
const timeline=Array.from({length:15},(_,i)=>new Date(Date.UTC(1944,5,27+i)).toISOString().slice(0,10));
const itinerary=['bobr','krupki','starye-dorogi','berezina-crossing','slutsk','borisov','vileika','stolbtsy','minsk','shemetovo','molodechno','cauldron'];
const payload={version:1,checked:'2026-10-18',scope:'Современная Минская область и отдельно город Минск. Подтверждённые эпизоды 27 июня — 11 июля 1944 года в рамках операции «Багратион».',completeness:'Экспозиция объединяет сведения оперативных сводок и исследования отдельных эпизодов. Реестр не исчерпывает всех боестолкновений: отсутствие условного знака не свидетельствует об отсутствии боевых действий.',coordinates:'Координаты GeoNames обозначают населённые пункты; позиции частей и фронта не реконструированы. Для локальных боёв указан район.',sources,timeline,itinerary,events:events.sort((a,b)=>a.start.localeCompare(b.start)||a.id.localeCompare(b.id))};
for(const e of events)for(const source of e.sources)if(!sources[source])throw Error('Missing source '+source);
fs.writeFileSync('src/minskBattleEvents.json',JSON.stringify(payload,null,2));
fs.writeFileSync('public/data/minsk-battle-events.json',JSON.stringify(payload,null,2));
console.log(`${events.length} records, ${new Set(events.filter(e=>!['Минск','Жодино'].includes(e.district)).map(e=>e.district)).size} districts`);
