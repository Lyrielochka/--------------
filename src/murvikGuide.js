import {equipment} from './technologyData.js';
import {frontDossiers} from './frontDossierData.js';
import registry from './minskBattleEvents.json' with {type:'json'};
import {questions} from './murvikQuestions.js';

// Local retrieval, not a language model. All historical answers come from
// the same data used by the exhibit; no keys or external requests are needed.
export const normalize=text=>String(text).toLowerCase().replace(/ё/g,'е').replace(/[іi]/g,'и').replace(/[–—-]/g,' ').replace(/\bt(?=\s*\d)/g,'т').replace(/[^a-zа-я0-9\s]/g,' ').replace(/\s+/g,' ').trim();
const compact=text=>normalize(text).replace(/\s/g,'');
const link=(section,label)=>({section,label});
const records=[
  {id:'operation',aliases:['багратион','операци','наступлен','освобождение беларус'],text:'Операция «Багратион» проходила с 23 июня по 29 августа 1944 года. Её замысел — согласованными ударами четырёх фронтов разгромить группу армий «Центр» и освободить Беларусь.',simple:'Четыре фронта наступали на нескольких направлениях, чтобы разгромить группу армий «Центр» и освободить Беларусь. Это происходило летом 1944 года.',links:[link('intro','Об операции'),link('strategy','План наступления')],suggestions:['Какие фронты участвовали?','Покажи карту наступления','Расскажи о партизанах']},
  {id:'fronts',aliases:['какие фронты','сколько фронтов','четыре фронта','четырех фронт'],text:'В операции участвовали 1-й Прибалтийский и три Белорусских фронта: 1-й, 2-й и 3-й. Ими командовали И. Х. Баграмян, К. К. Рокоссовский, Г. Ф. Захаров и И. Д. Черняховский соответственно.',links:[link('strategy','Четыре фронта'),link('commanders','Командующие')],suggestions:['Кто такой Рокоссовский?','Расскажи о Баграмяне','Что такое фронт?']},
  {id:'front-definition',aliases:['что такое фронт','что значит фронт'],text:'В рассказе об операции фронт — крупное объединение войск, включавшее несколько армий. На сайте можно изучить состав каждого из четырёх фронтов, его направление и задачу.',links:[link('strategy','Состав фронтов')]},
  {id:'partisans',aliases:['партизан','партизанские действия','невидимый фронт','рельсов','железнодорожн'],text:'Партизаны нарушали коммуникации противника: подрывали пути, атаковали колонны, вели разведку. В разделе «Невидимый фронт» можно отобрать материалы по типу действий и месяцу. Карточки содержат ссылки на документы; если точное место неизвестно, показан участок или приблизительный район.',links:[link('partisans','Карта партизанских действий')],suggestions:['Зачем подрывали рельсы?','Покажи партизанскую карту','Откуда взяты сведения?']},
  {id:'rail',aliases:['зачем подрывали рельсы','почему подрывали рельсы','зачем взрывали железн'],text:'По железным дорогам противник перевозил войска, боеприпасы и снабжение. Повреждение путей затрудняло эти перевозки и переброску подкреплений. На партизанской карте есть документированные эпизоды таких действий.',links:[link('partisans','Партизанские действия')]},
  {id:'map',aliases:['карт','до после','слои','хронологи','ход операци'],text:'На карте наступления можно выбирать этапы, сравнивать обстановку в режиме «До / после» и включать отдельные слои. Нажми на Минскую область, чтобы открыть подробный атлас. Это учебная схема: исторические рубежи и положения войск показаны обобщённо.',links:[link('map','Карта наступления')],suggestions:['Что есть в атласе Минской области?','Когда освободили Минск?','Откуда взяты сведения?']},
  {id:'atlas',aliases:['атлас','минской области','минская область','76 событий'],text:`Подробный атлас Минской области содержит ${registry.events.length} записей и маршрут из ${registry.itinerary.length} остановок. Есть поиск по населённым пунктам, фильтры по датам и типам событий, последовательный показ с паузой. Современные границы области служат ориентиром, а реестр не охватывает все боестолкновения.`,links:[link('map','Открыть карту и выбрать область')],suggestions:['Расскажи о Борисове','Когда освободили Минск?','Какие есть источники?']},
  {id:'archive',aliases:['фотограф','архив','луп','снимк'],text:'В фотоархиве можно увеличивать, перемещать и поворачивать снимки, включать лупу и читать подписи. Рядом с фотографией указаны место, дата и источник. Обрати внимание: снимки с других фронтов выделены отдельно.',links:[link('archive','Исторические фотографии')]},
  {id:'films',aliases:['фильм','видео','лекци','посмотрет'],text:'В разделе «Больше об операции» собраны документальные фильмы и историческая лекция. У карточек указаны авторы, ссылки ведут на внешние видеоматериалы.',links:[link('videos','Фильмы и лекции')]},
  {id:'results',aliases:['итог','результат операци','масштаб','соотношение сил'],text:'Главный результат операции — освобождение Беларуси и разгром группы армий «Центр». В разделе итогов можно сравнить сводные оценки личного состава, бронетехники, артиллерии и авиации. Приблизительные значения помечены отдельно.',links:[link('results','Масштаб освобождения')]},
  {id:'aviators',aliases:['женщин','летчиц','авиатор'],text:'В разделе «Женщины в небе войны» представлены Полина Гельман, Анна Дудина, Мария Долина и Ольга Голубева-Терес. У каждой есть портрет, сведения о службе, самолёт и связь с белорусскими городами.',links:[link('aviators','Женщины в небе войны')],suggestions:['Кто такая Полина Гельман?','На чём летала Мария Долина?']},
  {id:'gelman',aliases:['гельман','полина'],text:'Полина Гельман — штурман ночной бомбардировочной авиации, летала на По-2. Её детство и юность прошли в Гомеле. За годы войны она совершила 857 боевых вылетов.',links:[link('aviators','История Полины Гельман')]},
  {id:'dolina',aliases:['долина','долиной','мария'],text:'Мария Долина — лётчица бомбардировочной авиации, заместитель командира эскадрильи. Она летала на Пе-2; летом 1944 года участвовала в вылетах в районах Витебска, Орши, Березины и Борисова.',links:[link('aviators','История Марии Долиной')]},
  {id:'dudina',aliases:['дудин','мишина'],text:'Анна Дудина (Мишина) — лётчица ночного бомбардировочного полка, летала на По-2 и участвовала в освобождении Беларуси. После войны работала лётчиком-инструктором Могилёвского аэроклуба.',links:[link('aviators','История Анны Дудиной')]},
  {id:'golubeva',aliases:['голубев','терес'],text:'Ольга Голубева-Терес служила штурманом звена ночного бомбардировочного полка и летала на По-2. Её боевой путь в Беларуси проходил через районы Прони, Могилёва, Быхова, Червеня и Минска.',links:[link('aviators','История Ольги Голубевой-Терес')]},
  {id:'sources',aliases:['источник','достовер','откуда','проверить сведен','документ'],text:'Начни с источника у самого материала: в досье фронтов раскрываются ссылки, в партизанских карточках указаны архивные документы, у фотографий — источник снимка. В атласе Минской области есть раздел об источниках и полноте, а реестр можно скачать. Я отвечаю по материалам сайта, а не ищу новые сведения в интернете.',links:[link('strategy','Источники досье'),link('partisans','Документы о партизанах'),link('map','Источники атласа')]},
  {id:'technology',aliases:['техник','арсенал','танки','самолеты','орудия','3d','3д','трехмерн','модели'],text:'В арсенале шесть категорий: бронетехника, артиллерия, авиация, транспорт, связь и инженерное обеспечение. У Т-34-85, ИС-2 и «Катюши» есть 3D-модели: их можно вращать и приближать. Напиши название конкретной машины — посмотрим её карточку.',links:[link('technology','Арсенал наступления')],suggestions:['Расскажи о Т-34-85','Сравни Т-34-85 и ИС-2','Что такое «Катюша»?']},
  {id:'before',aliases:['белорусский выступ','перед наступлением','немецкая оборона'],text:'Перед наступлением группа армий «Центр» удерживала Белорусский выступ. Его протяжённые фланги создавали возможности для охвата, а дороги связывали опорные узлы обороны. В разделе подготовки переключай схему между выступом, участками обороны и коммуникациями.',links:[link('prehistory','Перед наступлением')]},
];
const items=Object.values(equipment).flat();
const itemAliases={t34:['т 34','т34','т 34 85','т34 85'],is2:['ис 2','ис2'],katyusha:['катюш','бм 13','бм13'],t3476:['т 34 76','т34 76']};
const suggestions=['Что такое операция «Багратион»?','Расскажи о Т-34-85','Когда освободили Минск?'];
const wrap=(record,text=record.text)=>({text,topic:record.id,links:record.links||[],suggestions:record.suggestions||['Объясни проще','Откуда взяты сведения?'],mood:'speaking'});
const unknown=()=>({text:'Тут мои следы обрываются: в материалах сайта я не нашёл достаточно сведений именно для такого ответа. Не буду придумывать. Уточни название, город или событие — либо выбери одну из тем ниже.',topic:null,links:[link('map','Исследовать карту'),link('archive','Посмотреть архив')],suggestions,mood:'unsure'});
function equipmentRecord(item){return {id:`equipment:${item.id}`,text:`${item.name} — ${item.type.toLowerCase()}. ${item.description}\n${item.specs.map(([key,value])=>`${key}: ${value}`).join(' · ')}.`,simple:`${item.name} — ${item.type.toLowerCase()}. ${item.description}`,links:[link('technology',`Карточка ${item.name}`)]};}
function eventRecord(event){return {id:`event:${event.id}`,text:`${event.title}. ${event.summary}${event.meaning?' '+event.meaning:''}${event.note?'\nВажно: '+event.note:''}`,simple:event.summary,links:[link('map',`${event.place} на карте`)]};}
function frontRecord(front){return {id:`front:${front.id}`,text:`${front.name}. Командующий — ${front.commander}. ${front.summary}\nЗадача: ${front.task}`,simple:`${front.name}: ${front.summary}`,links:[link('strategy',front.name),link('commanders','Командующий')]};}
function byId(id){if(!id)return null;const [type,key]=id.split(':');if(type==='equipment'){const item=items.find(i=>i.id===key);return item&&equipmentRecord(item);}if(type==='event'){const event=registry.events.find(e=>e.id===key);return event&&eventRecord(event);}if(type==='front'){const front=frontDossiers.find(f=>f.id===key);return front&&frontRecord(front);}return records.find(r=>r.id===id);}
const stop=new Set(['что','такое','расскажи','пожалуйста','про','мне','как','это','кто','когда','какой','какая','сколько','его','ней','него','был','была','где','чем','для','или','все','почему','зачем']);
const tokens=text=>normalize(text).split(' ').filter(w=>w.length>2&&!stop.has(w)).map(w=>w.length>5?w.slice(0,-2):w);
export function answerGuide(raw,{topic=null}={}){
  const query=normalize(raw).slice(0,400);if(!query)return unknown();
  if(/^(привет|здравствуй|добрый день|хай|салют)/.test(query))return {text:'Привет! Ушки на макушке — я слушаю. Могу помочь разобраться в операции «Багратион», найти технику, историю человека или событие на карте. О чём поговорим?',topic:null,links:[],suggestions,mood:'happy'};
  if(/^(спасибо|благодарю|круто|молодец|класс)(\s|$)/.test(query))return {text:'Мур-р, рад помочь! Ещё один след в истории найден. Продолжим исследование?',topic,links:[],suggestions,mood:'happy'};
  if(/как дела|как настроение/.test(query))return {text:'Настроение исследовательское! Фуражка на месте, уши ловят вопросы. Хочешь узнать что-нибудь о технике или прогуляться по карте?',topic,links:[],suggestions,mood:'happy'};
  if(/интересный факт|удиви|расскажи факт/.test(query)){const q=questions[Math.floor(Math.random()*questions.length)];return {text:'Вот один след, который стоит запомнить: '+q.explanation,topic:null,links:[link(q.section,q.chapter)],suggestions,mood:'happy'};}
  if(/кто ты|ты нейросет|как тебя зовут|что ты умеешь/.test(query))return {text:'Я Мурвiк, твой виртуальный рысёнок-проводник! Помогаю разобраться в истории, помню тему разговора и предлагаю, куда заглянуть дальше. А ещё у меня есть викторина и задания. О чём хочешь узнать?',topic:null,links:[],suggestions,mood:'happy'};
  const previous=byId(topic);
  if(/родил|умер|сколько лет|возраст|семья|супруг|жена|дети|погод|температур|курс валют|рецепт|сегодня|202[0-9]|кто назвал/.test(query))return unknown();
  if(/^(объясни проще|попроще|проще|простыми словами|а подробнее|подробнее|расскажи еще|продолжай|а он|а она|а у него|а у нее|а его|а ее)/.test(query)||previous&&/^(а )?(экипаж|калибр|скорость|масса|сколько человек|какое орудие)/.test(query)){
    if(!previous)return {text:'О чём рассказать подробнее? Назови технику, человека или событие — и пойдём по следу вместе.',topic:null,links:[],suggestions,mood:'listening'};
    if(/калибр|экипаж|скорост|масс|оруди/.test(query)&&topic.startsWith('equipment:'))return equipmentAnswer(items.find(i=>i.id===topic.split(':')[1]),query);
    return wrap(previous,/проще|простыми/.test(query)?previous.simple||previous.text.split('\n')[0]:previous.text);
  }
  // Longer aliases win: Т-34-76 must not accidentally resolve to Т-34-85.
  const matchedItems=items.map(item=>({item,weight:Math.max(0,...[item.name,...(itemAliases[item.id]||[])].filter(a=>compact(query).includes(compact(a))).map(a=>compact(a).length))})).filter(x=>x.weight>0).sort((a,b)=>b.weight-a.weight);
  if(matchedItems.length){
    const chosen=matchedItems[0].item;
    if(/сравн|отлич/.test(query)){const other=matchedItems.find(x=>x.item.id!==chosen.id&&x.weight>=3&&!((chosen.id==='t3476')&&x.item.id==='t34'));if(other)return {text:[equipmentRecord(chosen).text,equipmentRecord(other.item).text].join('\n\n'),topic:`equipment:${chosen.id}`,links:[link('technology','Сравнить карточки техники')],suggestions:['Объясни проще','Как посмотреть 3D-модели?'],mood:'speaking'};}
    return equipmentAnswer(chosen,query);
  }
  for(const front of frontDossiers){const surname=normalize(front.commander).split(' ').at(-1).slice(0,6);const frontName=normalize(front.name);if(query.includes(surname)||query.includes(frontName))return wrap(frontRecord(front));}
  const event=registry.events.filter(e=>query.includes(normalize(e.place).slice(0,-1))&&e.place.length>3&&(!/освобод/.test(query)||e.type==='liberation')).sort((a,b)=>(Number(b.type==='liberation')-Number(a.type==='liberation'))||(Number(b.major)-Number(a.major))||(a.start.localeCompare(b.start)))[0];
  if(event&&!/област|атлас/.test(query))return wrap(eventRecord(event));
  // Prefer specific phrases over generic words such as карта / операция.
  const record=records.map(r=>({r,weight:Math.max(0,...r.aliases.filter(a=>query.includes(normalize(a))).map(a=>a.length))})).sort((a,b)=>b.weight-a.weight)[0];
  if(record?.weight>0&&!/температур|погод|курс валют|программир|рецепт|сейчас|сегодня|202[0-9]/.test(query))return wrap(record.r);
  const words=tokens(query);
  const ranked=questions.map(q=>{const text=normalize(q.question+' '+q.explanation);return {q,score:words.filter(w=>text.includes(w)).length/Math.max(1,words.length)};}).sort((a,b)=>b.score-a.score);
  if(words.length>=2&&ranked[0]?.score>=.8){const q=ranked[0].q;return {text:q.explanation,topic:null,links:[link(q.section,q.chapter)],suggestions,mood:'speaking'};}
  return unknown();
}
function equipmentAnswer(item,query){
  const record=equipmentRecord(item);
  const specs=[[/экипаж/,/Экипаж/],[/калибр|оруди|пушк/,/Орудие|Калибр/],[/скорост/,/Скорость/],[/масс|вес/,/Масса/]];
  for(const [intent,key] of specs){if(intent.test(query)){const spec=item.specs.find(([label])=>key.test(label));return spec?wrap(record,`${item.name}. ${spec[0]}: ${spec[1]}.\n${item.description}`):{...unknown(),text:`В карточке ${item.name} на сайте этот параметр не указан. Не буду угадывать. Можно посмотреть доступное описание и характеристики.`,links:record.links,topic:record.id};}}
  if(/толщин|брон|длин|высот|ширин|расход|дальност|сколько|когда|стоимост/.test(query))return {...unknown(),links:record.links,topic:record.id};
  return wrap(record);
}

// Server-only caller uses this same corpus; the browser loads it only on demand.
export function guideContext(question,topic){
  const local=answerGuide(question,{topic});
  const corpus=[...records,...items.map(equipmentRecord),...frontDossiers.map(frontRecord),...registry.events.map(eventRecord)];
  const words=tokens(question);
  const scored=corpus.map(record=>({record,score:words.filter(word=>normalize(record.text).includes(word)).length/Math.max(1,words.length)})).filter(hit=>hit.score>=.5).sort((a,b)=>b.score-a.score);
  const selected=(local.topic||local.mood==='happy'?[{id:'direct',text:local.text,links:local.links}]:[byId(topic),...scored.slice(0,2).map(hit=>hit.record)]).filter(Boolean).filter((record,index,array)=>array.findIndex(r=>r.id===record.id)===index).slice(0,3);
  return {local,context:selected.map(r=>r.text).join('\n\n').slice(0,6500),links:selected.flatMap(r=>r.links||[]).filter((l,i,a)=>a.findIndex(x=>x.section===l.section)===i).slice(0,3)};
}
