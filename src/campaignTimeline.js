export const campaignSources={
 orders:{label:'Приказы Верховного Главнокомандующего',url:'https://www.soldat.ru/doc/vgk/'},
 west:{label:'Календарь Победы: западное направление',url:'https://pobeda.elar.ru/issues/operatsiya-bagration-chast-iv-osvobozhdenie-bresta/vykhod-k-granitse/'},
 brest:{label:'Календарь Победы: освобождение Бреста',url:'https://pobeda.elar.ru/issues/operatsiya-bagration-chast-iv-osvobozhdenie-bresta/vozvrashchenie-v-brest/'},
 vilnius:{label:'Календарь Победы: Вильнюсская операция',url:'https://pobeda.elar.ru/issues/osvobozhdenie-vilnyusa/otkryvaya-dorogu-v-vostochnuyu-prussiyu/'},
 south:{label:'Календарь Победы: Барановичи и Пинск',url:'https://pobeda.elar.ru/issues/operatsiya-bagration-chast-iv-osvobozhdenie-bresta/1-y-belorusskiy-idet-na-zapad/'},
 overview:{label:'Росгвардия: операция «Багратион»',url:'https://82.rosguard.gov.ru/page/index/operaciya-bagration-ili-belorusskaya-nastupatelnaya-operaciya'}
};
// Separate events sharing a date remain individually selectable.
export const campaignEvents=[
 ['start-line','22.06',null,'Накануне','Исходный рубеж','Обобщённый исходный рубеж перед наступлением на белорусском направлении.','overview'],
 ['start','23.06','vitebsk','Начало наступления','Витебское направление','Начало стратегической наступательной операции «Багратион».','overview'],
 ['vitebsk','26.06','vitebsk','Витебский узел','Витебск','Освобождён Витебск; ликвидирован северный узел немецкой обороны.','orders'],
 ['orsha','27.06','orsha','Оршанский узел','Орша','Освобождён укреплённый транспортный узел на пути к Минску.','orders'],
 ['mogilev','28.06','mogilev','Могилёв','Могилёв','Войска 2-го Белорусского фронта освободили Могилёв.','orders'],
 ['bobruisk','29.06','bobruisk','Бобруйское окружение','Бобруйск','Освобождён Бобруйск; открыт путь к Минску с юга.','orders'],
 ['minsk','03.07','minsk','Минск','Минск','Столица Беларуси освобождена; восточнее города замкнулось окружение.','orders'],
 ['polotsk','04.07','polotsk','Полоцк','Полоцк','1-й Прибалтийский фронт освободил Полоцк.','orders'],
 ['molodechno','05.07','molodechno','Молодечно','Молодечно','Освобождён транспортный узел на направлении к Вильнюсу.','vilnius'],
 ['baranovichi','08.07','baranovichi','Барановичи','Барановичи','1-й Белорусский фронт освободил крупный железнодорожный узел.','south'],
 ['lida','09.07','lida','Лида','Лида','Освобождён железнодорожный узел на левом крыле Вильнюсской операции.','vilnius'],
 ['slonim','10.07','slonim','Слоним','Слоним','Освобождён Слоним на пути наступления к западным районам Беларуси.','orders'],
 ['luninets','10.07','luninets','Лунинец','Лунинец','Освобождён железнодорожный узел на южном направлении наступления.','orders'],
 ['vilnius','13.07','vilnius','Вильнюс','Вильнюс','Завершились бои за город в ходе Вильнюсской операции.','vilnius'],
 ['pinsk','14.07','pinsk','Пинск','Пинск','Город освобождён при участии Днепровской военной флотилии.','south'],
 ['volkovysk','14.07','volkovysk','Волковыск','Волковыск','2-й Белорусский фронт овладел городом и железнодорожным узлом.','orders'],
 ['grodno','16.07','grodno','Гродно','Гродно','Город освобождён войсками 2-го и 3-го Белорусских фронтов.','west'],
 ['lublin','24.07','lublin','Люблин','Люблин','Освобождение Люблина отмечено приказом ВГК от 24 июля 1944 года.','orders'],
 ['bialystok','27.07','bialystok','Белосток','Белосток','Освобождение города завершило Белостокскую наступательную операцию.','west'],
 ['siauliai','27.07','siauliai','Шяуляй','Шяуляй','Освобождён Шяуляй в ходе наступления 1-го Прибалтийского фронта.','overview'],
 ['brest','28.07','brest','Брест','Брест','Войска 1-го Белорусского фронта освободили Брест.','brest'],
 ['kaunas','01.08','kaunas','Каунас','Каунас','Освобождён Каунас в ходе Каунасской наступательной операции.','overview'],
 ['osowiec','14.08','osowiec','Осовец','Осовец','Войска 2-го Белорусского фронта овладели крепостью Осовец.','west'],
 ['finish','29.08',null,'Завершение операции','Литва и Польша','Завершение «Багратиона»: наступление вышло за пределы Беларуси, к Восточной Пруссии, Нареву и Висле.','overview']
].map(([id,date,place,label,city,note,source])=>({id,date,place,label,city,note,source:campaignSources[source]}));
export const campaignDay=date=>{const [d,m]=date.split('.').map(Number);return Date.UTC(1944,m-1,d)/86400000};
export const campaignStage=id=>campaignEvents.findIndex(e=>e.id===id);
