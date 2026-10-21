import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown, ArrowRight, Check, Maximize2, RotateCcw, Search, X, ZoomIn } from 'lucide-react';
import './experience.css';

export function ExperienceMotion() {
  const reduced = useReducedMotion();
  useEffect(() => {
    const sections = [...document.querySelectorAll('main section, .hero, footer')];
    const observer = new IntersectionObserver(entries => entries.forEach(({ target, isIntersecting }) => {
      target.classList.toggle('in-view', isIntersecting);
      if (isIntersecting) target.classList.add('has-entered');
    }), { rootMargin: '60px', threshold: 0 });
    sections.forEach(el => observer.observe(el));
    if (reduced || !matchMedia('(pointer:fine)').matches) return () => observer.disconnect();
    let frame = 0, target = null, rect = null;
    const selector = '.tech-ribbon>button,.commander-info,.prehistory-map,.archive-sheet,.strategy-brief,.primary-btn';
    const reset = () => {
      if (target) { target.style.setProperty('--rx','0deg'); target.style.setProperty('--ry','0deg'); target.classList.remove('pointer-depth'); }
    };
    const move = event => {
      const next = event.target.closest(selector);
      if (next !== target) { reset(); target = next; rect = next?.getBoundingClientRect(); }
      if (!target || frame) return;
      const { clientX, clientY } = event;
      frame = requestAnimationFrame(() => {
        if (target && rect) {
          const x = Math.max(0, Math.min(1,(clientX-rect.left)/rect.width));
          const y = Math.max(0, Math.min(1,(clientY-rect.top)/rect.height));
          target.classList.add('pointer-depth');
          target.style.setProperty('--rx', `${(y-.5)*-4}deg`);
          target.style.setProperty('--ry', `${(x-.5)*5}deg`);
          target.style.setProperty('--light-x', `${x*100}%`);
          target.style.setProperty('--light-y', `${y*100}%`);
        }
        frame=0;
      });
    };
    const leave = () => {reset();target=null;rect=null;};
    document.addEventListener('pointermove',move,{passive:true});
    document.addEventListener('pointerleave',leave);
    window.addEventListener('scroll',leave,{passive:true});
    return () => {observer.disconnect();cancelAnimationFrame(frame);document.removeEventListener('pointermove',move);document.removeEventListener('pointerleave',leave);window.removeEventListener('scroll',leave);reset();};
  },[reduced]);
  return null;
}

export function Passage() {
  const ref = useRef(null), reduced = useReducedMotion();
  const {scrollYProgress} = useScroll({target:ref,offset:['start start','end end']});
  const scale = useTransform(scrollYProgress,[0,.8],[1,1.16]);
  const dateScale = useTransform(scrollYProgress,[0,.68],[1,2.7]);
  const dateOpacity = useTransform(scrollYProgress,[0,.25,.65],[.95,.95,0]);
  const opacity = useTransform(scrollYProgress,[.38,.72],[0,1]);
  const pathLength = useTransform(scrollYProgress,[.3,.9],[0,1]);
  return <section className="passage" ref={ref} aria-label="От ландшафта к карте">
    <div className="passage-pin">
      <motion.img className="passage-image" src="/assets/bagration-hero.webp" alt="Художественная реконструкция белорусского ландшафта" loading="lazy" style={reduced?{}:{scale}}/>
      <div className="passage-shade"/>
      <motion.div className="passage-date" style={reduced?{}:{scale:dateScale,opacity:dateOpacity}}>19<span>44</span></motion.div>
      <motion.div className="passage-caption" style={reduced?{}:{opacity}}><span>ЛАНДШАФТ СТАНОВИТСЯ КАРТОЙ</span><h2>ЗА КАЖДОЙ ЛИНИЕЙ —<br/><em>ЧЕЛОВЕЧЕСКАЯ ИСТОРИЯ</em></h2></motion.div>
      <svg className="passage-route" viewBox="0 0 1400 650" preserveAspectRatio="none" aria-hidden="true"><motion.path d="M1420 70 C980 50 1150 260 860 300 S600 270 500 460 S220 490 -20 630" style={reduced?{}:{pathLength}}/></svg>
      <div className="passage-foot"><span>БЕЛАРУСЬ / ЛЕТО 1944</span><span>ХУДОЖЕСТВЕННАЯ РЕКОНСТРУКЦИЯ</span><span>↓ ПРОДОЛЖАЙТЕ ПРОКРУТКУ</span></div>
    </div>
  </section>;
}

const collection = [
  {id:'01',title:'Бой у моста через Полоту',type:'Фотография',region:'Беларусь',image:'/images/archive/polotsk-soldiers.jpg',place:'Район Полоцка',date:'Дата не указана',note:'Советские солдаты в бою у разрушенного моста через реку Полоту в районе Полоцка.'},
  {id:'02',title:'Артиллеристы в освобождённом Минске',type:'Фотография',region:'Беларусь',image:'/images/archive/minsk-ml20.jpg',place:'Минск',date:'После освобождения Минска, 1944',note:'Расчёт советской 152-мм пушки-гаубицы МЛ-20 движется на своём орудии мимо оперного театра в освобождённом Минске. Во время немецкой оккупации здание использовалось как конюшня и складские помещения.'},
  {id:'03',title:'Брошенные орудия в Орше',type:'Фотография',region:'Беларусь',image:'/images/archive/orsha-guns.jpg',place:'Станция Орша',date:'Точная дата не указана',note:'Немецкие 75-мм пехотные орудия leIG 18 образца 1927 года и пианино, брошенные отступающими частями вермахта на станции Орша.'},
  {id:'04',title:'Подбитая «Пантера»',type:'Фотография',region:'Другие фронты',image:'/images/archive/kovel-panther.jpg',place:'Район Ковеля',date:'29 марта 1944 · дата подбития',note:'Танк Pz.Kpfw. V Ausf. A «Пантера» 8-й роты 5-го танкового полка СС дивизии «Викинг», подбитый советскими войсками 29 марта 1944 года в районе Ковеля. Снимок относится к событиям до летнего наступления в Беларуси.'},
  {id:'05',title:'Переправа через Днепр',type:'Фотография',region:'Беларусь',image:'/images/archive/dnieper-crossing.jpg',place:'Днепр · 2-й Белорусский фронт',date:'Июнь 1944',sourceUrl:'https://waralbum.ru/443905/',credit:'«Военный альбом» · источник снимка: mos.ru',note:'Военный регулировщик направляет движение у днепровской переправы. Снимок показывает работу на путях продвижения войск 2-го Белорусского фронта.'},
  {id:'06',title:'На командном пункте',type:'Фотография',region:'Беларусь',image:'/images/archive/command-post.jpg',place:'1-й Белорусский фронт',date:'Точная дата не указана',sourceUrl:'https://waralbum.ru/442206/',credit:'«Военный альбом» · источник снимка: edupressa.vm.ru',note:'Работа штаба 1-го Белорусского фронта. Константин Рокоссовский находится на дальнем плане слева; у карты — Иван Бойков. На переднем плане Михаил Малинин передаёт распоряжения по телефону, на втором плане справа — Константин Телегин.'},
  {id:'07',title:'Возвращение в Черею',type:'Фотография',region:'Беларусь',image:'/images/archive/chereya-family.jpg',place:'Черея · Витебская область',date:'В день освобождения района',sourceUrl:'https://waralbum.ru/440264/',credit:'«Военный альбом» · источник снимка: rodina-history.ru',note:'Партизан Никифор Рыдлевский с дочерьми Ольгой и Зинаидой на месте сгоревшего семейного дома. Фотография сделана после возвращения в освобождённое село Черея Чашникского района.'},
  {id:'08',title:'В освобождённом Витебске',type:'Фотография',region:'Беларусь',image:'/images/archive/vitebsk-rotmistrov.jpg',place:'Витебск',date:'После освобождения города, 1944',sourceUrl:'https://waralbum.ru/432915/',credit:'«Военный альбом» · источник снимка: sputnik.by',note:'Павел Ротмистров, командующий 5-й гвардейской танковой армией, в автомобиле «Виллис» на улице освобождённого Витебска. Такие автомобили поступали в СССР по ленд-лизу.'},
  {"id":"09","title":"Награждение бойцов 399-й дивизии","type":"Фотография","region":"Беларусь","image":"/images/archive/kazakevich-awards.jpg","place":"Беларусь","date":"Лето 1944","sourceUrl":"https://waralbum.ru/318830/","credit":"«Военный альбом» · издание Museum Berlin-Karlshorst, 1997","note":"Генерал-майор Даниил Казакевич, командир 399-й стрелковой дивизии, вручает награды бойцам, отличившимся в летних боях 1944 года."},
  {"id":"10","title":"Танкисты под Борисовом","type":"Фотография","region":"Беларусь","image":"/images/archive/borisov-tankers.jpg","place":"Район Борисова","date":"1944 · точная дата не указана","sourceUrl":"https://waralbum.ru/135208/","credit":"«Военный альбом» · oper.ru; сведения: vsr.mil.by","note":"Командир 31-й танковой бригады Василий Молчанов и механик-водитель Григорий Зубов под Борисовом. Снимок знакомит с участниками наступления и экипажами Т-34-85."},
  {"id":"11","title":"Командир самоходки Владимир Мордик","type":"Фотография","region":"Беларусь","image":"/images/archive/mordik-su76.jpg","place":"Беларусь","date":"Июль 1944","sourceUrl":"https://waralbum.ru/402304/","credit":"«Военный альбом» · berlin.museum-digital.de · Борис Вдовенко","note":"Младший лейтенант Владимир Мордик, командир СУ-76 957-го отдельного самоходного артиллерийского полка, после награждения орденом Красной Звезды. Автор снимка — Борис Вдовенко."},
  {"id":"12","title":"Допрос пленного генерала под Витебском","type":"Фотография","region":"Беларусь","image":"/images/archive/vitebsk-commanders.jpg","place":"Район Витебска","date":"1944 · точная дата не указана","sourceUrl":"https://waralbum.ru/391384/","credit":"«Военный альбом» · polk.press; сведения: evitebsk.com","note":"Александр Василевский и Иван Черняховский допрашивают пленного командира 206-й пехотной дивизии Альфонса Хиттера. Слева за столом — член Военного совета 3-го Белорусского фронта Василий Макаров."},
  {"id":"13","title":"Колонна пленных на дороге","type":"Фотография","region":"Беларусь","image":"/images/archive/minsk-prisoners-tiger.jpg","place":"Беларусь · район Минска","date":"1944 · точная дата съёмки не указана","sourceUrl":"https://waralbum.ru/373150/","credit":"«Военный альбом» · rg.ru","note":"Немецкие военнослужащие, попавшие в плен под Минском, проходят мимо танка «Тигр». В каталоге кадр отнесён к операции «Багратион»; сведения о нём опубликованы в газете «Московский большевик» 8 июля 1944 года."},
  {"id":"14","title":"Помощь раненому","type":"Фотография","region":"Беларусь","image":"/images/archive/bagration-medic.jpg","place":"Беларусь","date":"Во время операции «Багратион», 1944","sourceUrl":"https://waralbum.ru/198594/","credit":"«Военный альбом» · сведения: riamediabank.ru","note":"Советский санинструктор оказывает помощь раненому старшине во время операции «Багратион». У раненого — автомат ППШ и компас на левой руке."},
  {"id":"15","title":"Партизаны идут на парад","type":"Фотография","region":"Беларусь","image":"/images/archive/minsk-partisan-parade.jpg","place":"Минск","date":"16 июля 1944","sourceUrl":"https://waralbum.ru/124020/","credit":"«Военный альбом» · tellerreport.com","note":"Колонна партизан направляется на парад в освобождённом Минске. Парад состоялся 16 июля 1944 года на городском ипподроме."},
  {"id":"16","title":"Встреча освободителей Минска","type":"Фотография","region":"Беларусь","image":"/images/archive/minsk-welcome.jpg","place":"Минск","date":"После освобождения города · точная дата спорна","sourceUrl":"https://waralbum.ru/88001/","credit":"«Военный альбом» · сведения: belarus.by · Владимир Лупейко","note":"Жители Минска встречают солдат Красной Армии. В карточке каталога описание освобождённого города расходится с указанным месяцем съёмки, поэтому точная дата здесь не приводится."},
];

const originalSources = {'01':'https://waralbum.ru/441776/','02':'https://waralbum.ru/441772/','03':'https://waralbum.ru/332449/','04':'https://waralbum.ru/444053/'};
collection.forEach(item => { item.sourceUrl ||= originalSources[item.id]; item.credit ||= '«Военный альбом»'; });

function ArchiveArt({item}) {
  return <img decoding="async" draggable={false} loading="lazy" src={item.image} alt={`${item.title}. ${item.place}`}/>;
}

function ArchiveReader({item,onClose,onMap}) {
  const [zoom,setZoom]=useState(1),[angle,setAngle]=useState(0),[back,setBack]=useState(false),[glass,setGlass]=useState(false),[positionKey,setPositionKey]=useState(0);
  const ref=useRef(null), prior=useRef(document.activeElement), dialog=useRef(null);
  useEffect(()=>{
    const previous=document.body.style.overflow;document.body.style.overflow='hidden';dialog.current?.focus();
    const key=e=>{if(e.key==='Escape')onClose();if(e.key==='Tab'){const list=[...dialog.current.querySelectorAll('button,input,a')];const first=list[0],last=list.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}};
    document.addEventListener('keydown',key);
    return()=>{document.body.style.overflow=previous;document.removeEventListener('keydown',key);prior.current?.focus()};
  },[onClose]);
  const point=e=>{const r=e.currentTarget.getBoundingClientRect();ref.current.style.setProperty('--glass-x',`${(e.clientX-r.left)/r.width*100}%`);ref.current.style.setProperty('--glass-y',`${(e.clientY-r.top)/r.height*100}%`)};
  return createPortal(<motion.div className="reader-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose}>
    <motion.div className="archive-reader" ref={dialog} role="dialog" aria-modal="true" aria-labelledby="reader-title" tabIndex={-1} initial={{y:40,scale:.95}} animate={{y:0,scale:1}} exit={{y:20,scale:.97}} onClick={e=>e.stopPropagation()}>
      <header><span>КОЛЛЕКЦИЯ / {item.id}</span><button className="reader-close" onClick={onClose} aria-label="Закрыть просмотр"><X/></button></header>
      <div className="reader-body"><div ref={ref} className={'reader-stage '+(glass?'magnifying':'')} onPointerMove={point}>
        <motion.div key={positionKey} className="reader-object" drag dragConstraints={ref} dragElastic={.12} dragMomentum={false} animate={{scale:zoom,rotate:angle,rotateY:back?180:0}} transition={{type:'spring',stiffness:120,damping:22}}>
          <div className="reader-front"><ArchiveArt item={item}/></div><div className="reader-back"><span>ПОДПИСЬ / {item.id}</span><h3>{item.title}</h3><p>{item.note}</p><small>{item.credit}</small></div>
        </motion.div>
        {glass&&!back&&Boolean(item.image)&&<div className="reader-lens" style={{backgroundImage:`url(${item.image})`}}/>}
        <span className="reader-scale">{Math.round(zoom*100)}% / {angle}°</span>
      </div><aside><span className="section-kicker">ИСТОРИЧЕСКАЯ ФОТОГРАФИЯ</span><h3 id="reader-title">{item.title}</h3><p>{item.note}</p><dl><dt>ДАТА</dt><dd>{item.date}</dd><dt>МЕСТО</dt><dd>{item.place}</dd><dt>ИСТОЧНИК</dt><dd><a href={item.sourceUrl} target="_blank" rel="noopener noreferrer">{item.credit} ↗</a></dd></dl></aside></div>
      <div className="reader-tools"><label><ZoomIn size={16}/><input aria-label="Масштаб материала" type="range" min="1" max="2.5" step=".1" value={zoom} onChange={e=>setZoom(+e.target.value)}/></label><button onClick={()=>setAngle(v=>v===6?-6:v+3)} aria-label="Повернуть материал"><RotateCcw size={16}/> ПОВОРОТ</button><button onClick={()=>setBack(v=>!v)} aria-pressed={back}>↔ ПОДПИСЬ</button>{Boolean(item.image)&&<button onClick={()=>{setGlass(v=>!v);setBack(false);setZoom(1);setAngle(0);setPositionKey(v=>v+1)}} aria-pressed={glass}><Search size={16}/> ЛУПА</button>}<button onClick={()=>{setZoom(1);setAngle(0);setBack(false);setGlass(false);setPositionKey(v=>v+1)}}>СБРОСИТЬ</button><span className="reader-drag-hint">ПЕРЕТАСКИВАЙТЕ СНИМОК, ЧТОБЫ РАССМОТРЕТЬ ДЕТАЛИ</span></div>
    </motion.div>
  </motion.div>, document.body);
}

export function ArchiveDesk({onMap}) {
  const [filter,setFilter]=useState('Все'),[item,setItem]=useState(null),[saved,setSaved]=useState([]),[page,setPage]=useState(1);
  const filtered=collection.filter(c=>(filter==='Все'||c.region===filter));
  const pageCount=Math.max(1,Math.ceil(filtered.length/8));
  const visible=filtered.slice((page-1)*8,page*8);
  const changePage=next=>{setPage(next);document.getElementById('archive')?.scrollIntoView({behavior:'instant',block:'start'});};
  return <section className="archive-desk section" id="archive">
    <div className="section-head light"><div><span className="section-kicker">ФОТОХРОНИКА 1944 ГОДА</span><h2>ФОТОГРАФИИ <em>1944 ГОДА</em></h2></div><p>Солдаты, освобождённые города и следы боёв. Откройте снимок, чтобы рассмотреть детали и прочитать его историю.</p></div>
    <div className="desk-toolbar"><div className="desk-filters">{['Все','Беларусь','Другие фронты'].map(f=><button key={f} aria-pressed={filter===f} onClick={()=>{setFilter(f);setPage(1)}}>{f}</button>)}</div></div>
    <div className="desk-surface"><div className="desk-sheets"><AnimatePresence mode="popLayout">{visible.map((c,i)=><motion.article layout key={c.id} className="archive-sheet" initial={{opacity:0,y:20}} animate={{opacity:1,y:0,rotate:0}} exit={{opacity:0,y:20}} transition={{duration:.35,delay:i*.04}}><button className="sheet-open" onClick={()=>setItem(c)} aria-label={`Открыть: ${c.title}`}><div className="sheet-media"><ArchiveArt item={c}/><span className="sheet-enlarge"><Maximize2 size={18}/></span></div><div className="sheet-caption"><small>{c.type} / {c.id}</small><h3>{c.title}</h3><span>{c.place} · {c.date}</span></div></button><button className="sheet-bookmark" aria-label={`Отметить: ${c.title}`} aria-pressed={saved.includes(c.id)} onClick={()=>setSaved(v=>v.includes(c.id)?v.filter(id=>id!==c.id):[...v,c.id])}>{saved.includes(c.id)?<Check size={13}/>:'+'}</button></motion.article>)}</AnimatePresence></div></div>
    <nav className="desk-pagination" aria-label="Страницы фотографий"><button disabled={page===1} onClick={()=>changePage(page-1)}>← Назад</button>{Array.from({length:pageCount},(_,i)=>i+1).map(n=><button key={n} aria-label={`Страница ${n}`} aria-current={page===n?'page':undefined} onClick={()=>changePage(n)}>{n}</button>)}<button disabled={page===pageCount} onClick={()=>changePage(page+1)}>Далее →</button></nav>
    <div className="desk-footer"><span aria-live="polite">{(page-1)*8+1}–{Math.min(page*8,filtered.length)} ИЗ {String(filtered.length).padStart(2,'0')} ФОТОГРАФИЙ</span><span aria-live="polite">{saved.length} ОТМЕЧЕНО</span><span>1944 ГОД</span></div>
    <AnimatePresence>{item&&<ArchiveReader item={item} onClose={()=>setItem(null)} onMap={onMap}/>}</AnimatePresence>
  </section>;
}

export function JourneyTimeline({moments,active,setActive,onMap}) {
  const current=moments[active];
  return <section className="timeline-section section journey-timeline" id="timeline"><div className="timeline-number">19<span>44</span></div><div className="section-head light"><div><span className="section-kicker">ХРОНОЛОГИЯ / СВЯЗАНО С КАРТОЙ</span><h2>ВРЕМЯ<br/><em>В ДВИЖЕНИИ</em></h2></div><p>Одна шкала для всего путешествия. Выбранная дата сохраняется на карте и в сводке.</p></div><div className="timeline-layout"><div className="date-display"><small>ЛЕТО / 1944</small><div className="date-mask"><AnimatePresence mode="wait"><motion.strong key={current.date} initial={{y:'110%'}} animate={{y:0}} exit={{y:'-110%'}} transition={{duration:.32}}>{current.date}</motion.strong></AnimatePresence></div><span>ТОЧКА {String(active+1).padStart(2,'0')}</span></div><AnimatePresence mode="wait"><motion.div className="timeline-story" key={active} initial={{opacity:0,x:15}} animate={{opacity:1,x:0}} exit={{opacity:0}}><span className="place">{current.city}</span><h3>{current.label}</h3><p>{current.note}</p></motion.div></AnimatePresence></div><div className="big-timeline"><i className="progress" style={{width:`${active/(moments.length-1)*100}%`}}/>{moments.map((m,i)=><button key={m.date} className={i===active?'active':''} aria-pressed={i===active} onClick={()=>setActive(i)}><b/><span>{m.date}</span><small>{m.city}</small></button>)}</div></section>;
}

