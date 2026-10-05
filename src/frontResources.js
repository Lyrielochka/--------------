// Personnel and formation counts: Krivosheev, Belarusian operation, table at the start.
// Logistics: V. Vorsin / V. Zhumatiy, Military History Journal, March 2020.
export const supplySource={label:'В. Ф. Ворсин, В. И. Жуматий. Тыловое обеспечение Белорусской операции',url:'https://history.milportal.ru/organizaciya-tylovogo-obespecheniya-vojsk-v-belorusskoj-strategicheskoj-nastupatelnoj-operacii-s-23-iyunya-po-29-avgusta-1944-g/'};
const catalog='/assets/tech/catalog/';
export const stockSource={label:'Тыл Советских Вооружённых Сил в Великой Отечественной войне. Таблицы 15–16',url:'https://www.oboznik.ru/?p=11505'};
// Stocks at the beginning of Bagration: fuel in refills, ammunition in combat loads.
export const frontStocks=[
 {petrol:'4,1',diesel:'7,6',aviation:'9,2',divisionShells:'3,0',howitzerShells:'5,3'},
 {petrol:'3,4',diesel:'6,3',aviation:'6,2',divisionShells:'2,8',howitzerShells:'3,2'},
 {petrol:'2,5',diesel:'6,4',aviation:'10,4',divisionShells:'2,2',howitzerShells:'2,4'},
 {petrol:'4,1',diesel:'7,1',aviation:'4,0',divisionShells:'2,5',howitzerShells:'2,5'},
];
const supply='/assets/supply/';
export const resourceImages={tanks:catalog+'t34.lossless.webp',artillery:catalog+'zis3.lossless.webp',aircraft:catalog+'il2.lossless.webp',fuel:supply+'fuel.lossless.webp',ammunition:supply+'ammunition.lossless.webp',transport:supply+'transport.lossless.webp',signals:supply+'signals.lossless.webp',engineering:supply+'engineering.lossless.webp'};
export const frontResources=[
 {divisions:24,railways:1,rearDepth:'до 250 км',composition:'24 стрелковые дивизии, один танковый корпус, четыре отдельные танковые бригады и одна механизированная бригада.',transport:'Снабжение опиралось на одно железнодорожное направление. В исходном положении глубина тылового района фронта устанавливалась до 250 км.',engineering:'На пути наступления лежала Западная Двина. Инженерные части обеспечивали переправу войск, артиллерии и транспорта.',logisticsCommander:'Д. И. Андреев'},
 {divisions:33,railways:1,rearDepth:'до 250 км',composition:'33 стрелковые и три кавалерийские дивизии, один механизированный и три танковых корпуса, пять отдельных танковых бригад.',transport:'Одно железнодорожное направление связывало фронт с тылом. Подвоз для подвижных соединений требовал своевременного перемещения складов и восстановления дорог.',engineering:'Выход к Березине требовал подготовки переправ. Восстановление мостов и дорог поддерживало продвижение подвижных соединений.',logisticsCommander:'В. П. Виноградов'},
 {divisions:22,railways:1,rearDepth:'до 250 км',composition:'22 стрелковые дивизии и четыре отдельные танковые бригады. Наступление поддерживала 4-я воздушная армия.',transport:'Фронт снабжался по одному железнодорожному направлению. В исходном положении глубина его тылового района устанавливалась до 250 км.',engineering:'Последовательное преодоление Прони, Баси и Днепра делало переправочные средства важной частью обеспечения наступления.',logisticsCommander:'Н. А. Найдёнов'},
 {divisions:77,railways:3,rearDepth:'300–600 км',composition:'Во всём фронте — 77 стрелковых и девять кавалерийских дивизий, один механизированный и шесть танковых корпусов. Бобруйский удар наносило правое крыло.',transport:'Три железнодорожных направления обеспечивали подвоз. Из-за конфигурации фронта глубина его тылового района составляла 300–600 км.',engineering:'Болотистая местность и Березина требовали подготовки проездов и переправ для ударных группировок.',logisticsCommander:'Н. А. Антипенко',additional:'При подготовке операции около 4 тысяч машин 18-й автомобильной бригады перебросили с левого крыла на правое, в район Гомеля.'},
];
export const transportMemoir={label:'Н. А. Антипенко. На главном направлении, глава 7',url:'https://militera.lib.ru/memo/russian/antipenko_na/07.html'};
