import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Minus, Plus } from 'lucide-react';
import './aviators.css';

const nightUnit = '46-й гвардейский ночной бомбардировочный авиационный полк';
export const aviators = [
  { id: 'gelman', name: 'Полина Гельман', role: 'Штурман', aircraft: 'По-2', unit: nightUnit,
    place: 'Гомель', accent: 'Первые занятия авиацией — в Гомельском аэроклубе.',
    connection: 'Штурман ночной бомбардировочной авиации. Детство и юность Полины Гельман прошли в Гомеле, где она училась и занималась в аэроклубе.',
    operation: 'В 1944 году участвовала в боевых действиях 2-го Белорусского фронта. Среди эпизодов её боевого пути — Могилёвская операция.',
    fact: '857 боевых вылетов за годы войны.' },
  { id: 'dudina', name: 'Анна Дудина', alias: '(Мишина)', role: 'Лётчица', aircraft: 'По-2', unit: nightUnit,
    place: 'Могилёв', accent: 'После войны — лётчик-инструктор Могилёвского аэроклуба.',
    connection: 'Лётчица ночного бомбардировочного полка. Участвовала в освобождении Беларуси; после войны жила и работала в Могилёве.',
    operation: 'Летом 1944 года выполняла боевые задания над территорией Беларуси в составе 46-го гвардейского ночного бомбардировочного авиационного полка.' },
  { id: 'dolina', name: 'Мария Долина', role: 'Лётчица, заместитель командира эскадрильи', aircraft: 'Пе-2', unit: '125-й гвардейский бомбардировочный авиационный полк',
    place: 'Орша · Березина · Борисов', accent: '26 июня 1944 — Орша. 28 июня — район Зембина и Борисова.',
    connection: 'Лётчица бомбардировочной авиации, заместитель командира эскадрильи. В дни освобождения Беларуси участвовала в боях на Витебском и Оршанском направлениях.',
    operation: 'Летом 1944 года участвовала в бомбардировочных вылетах в районах Витебска, Орши, Березины и Борисова.' },
  { id: 'golubeva-teres', name: 'Ольга Голубева-Терес', role: 'Штурман звена', aircraft: 'По-2', unit: nightUnit,
    place: 'Проня · Могилёв · Минск', accent: 'Боевые задания — в составе ночной бомбардировочной авиации.',
    connection: 'Штурман звена ночного бомбардировочного полка. Её боевой путь в Беларуси проходил через районы Прони, Могилёва, Быхова, Червеня и Минска.',
    operation: 'В ходе летнего наступления 1944 года выполняла обязанности штурмана в боевых вылетах над Беларусью.' },
];

function Portrait({ pilot, index }) {
  const [loaded, setLoaded] = useState(false);
  return <figure className={`sky-portrait${loaded ? ' has-photo' : ''}`}>
    {!loaded && <div className="sky-placeholder"><span className="sky-photo-number">{String(index + 1).padStart(2, '0')}</span><span className="sky-photo-label">ФОТОПОРТРЕТ</span><strong>{pilot.name}</strong><span className="sky-photo-note">Портрет участницы войны</span></div>}
    <img className="sky-portrait-image" src={`/images/aviators/${pilot.id}.jpg`} alt={`Архивный портрет: ${pilot.name}`} loading="lazy" decoding="async" onLoad={() => setLoaded(true)} onError={() => setLoaded(false)} />
    <figcaption><span>Фотопортрет</span><span>{String(index + 1).padStart(2, '0')} / 04</span></figcaption>
  </figure>;
}

function Exhibit({ pilot, index, active, onToggle, reduced }) {
  const open = active === pilot.id;
  return <motion.article className={`sky-exhibit sky-exhibit-${index}${open ? ' is-open' : ''}${active && !open ? ' is-quiet' : ''}`} initial={reduced ? false : { opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .1 }} transition={{ duration: .55, delay: index * .06 }} aria-labelledby={`sky-name-${pilot.id}`}>
    <div className="sky-visual"><button className="sky-portrait-button" onClick={onToggle} aria-label={`${open ? 'Закрыть' : 'Открыть'} историю: ${pilot.name}`} aria-expanded={open} aria-controls={`sky-story-${pilot.id}`}><Portrait pilot={pilot} index={index}/></button>
      <div className="sky-aircraft"><img loading="lazy" decoding="async" src={`/assets/aviators/${pilot.aircraft === 'Пе-2' ? 'pe-2' : 'po-2'}.lossless.webp`} alt={`Самолёт ${pilot.aircraft}`}/><div className="sky-aircraft-caption"><small>Боевая машина</small><span>{pilot.aircraft}</span></div></div>
    </div>
    <div className="sky-copy">
      <div className="sky-location">{pilot.place}</div>
      <h3 id={`sky-name-${pilot.id}`} className={pilot.alias ? 'sky-name-with-alias' : undefined}>{pilot.name}{pilot.alias && <> <span className="sky-alias">{pilot.alias}</span></>}</h3>
      <p className="sky-role">{pilot.role} <span>· {pilot.aircraft}</span></p>
      <p className="sky-summary">{pilot.connection}</p>
      {index === 0 ? <div className="sky-flight-count"><strong>857</strong><span>боевых вылетов<br/>за годы войны</span></div> : <p className="sky-accent">{pilot.accent}</p>}
      {index === 0 && <p className="sky-accent">{pilot.accent}</p>}
      <button className="sky-toggle" id={`sky-toggle-${pilot.id}`} aria-expanded={open} aria-controls={`sky-story-${pilot.id}`} onClick={onToggle}><span>{open ? 'Закрыть справку' : 'Биографическая справка'}</span>{open ? <Minus size={19}/> : <Plus size={19}/>}</button>
      <div className="sky-story" id={`sky-story-${pilot.id}`} role="region" aria-labelledby={`sky-name-${pilot.id}`} inert={!open} aria-hidden={!open}>
        <div className="sky-story-inner">
          <div className="sky-story-content">
            <div><h4>Биография и Беларусь</h4><p>{pilot.connection}</p></div>
            <div><h4>Участие в освобождении</h4><p>{pilot.operation}</p></div>
            <div className="sky-equipment"><h4>Военная служба</h4><p>{pilot.role}. {pilot.unit}.</p><div><img loading="lazy" decoding="async" src={`/assets/aviators/${pilot.aircraft === 'Пе-2' ? 'pe-2' : 'po-2'}.lossless.webp`} alt=""/><span>{pilot.aircraft}</span></div></div>
          </div>
        </div>
      </div>
      <div className="sky-unit-label"><span>{pilot.aircraft}</span><span>{index === 2 ? '125-й гвардейский БАП' : '46-й гвардейский НБАП'}</span><ArrowUpRight size={16} aria-hidden="true"/></div>
    </div>
  </motion.article>;
}

export default function Aviators() {
  const [active, setActive] = useState(null);
  const reduced = useReducedMotion();
  return <section className="aviators-section sky-museum" id="aviators" aria-labelledby="aviators-title" onKeyDown={event => { if (event.key === 'Escape' && active) { document.getElementById(`sky-toggle-${active}`)?.focus(); setActive(null); } }}>
    <div className="sky-inner">
      <motion.header className="sky-heading" initial={reduced ? false : { opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
        <div className="sky-kicker">ЛИЦА ВОЙНЫ <span>Беларусь · 1944</span></div>
        <h2 id="aviators-title">ЖЕНЩИНЫ <span>В НЕБЕ ВОЙНЫ</span></h2>
        <p className="sky-subtitle">Лётчицы и штурманы в освобождении Беларуси</p>
        <p className="sky-intro">Четыре биографии участниц воздушных боёв. Фотопортреты и краткие справки рассказывают об их службе, боевых вылетах и связи с Беларусью.</p>
      </motion.header>
      <div className="sky-collection">{aviators.map((pilot, index) => <Exhibit key={pilot.id} pilot={pilot} index={index} active={active} reduced={reduced} onToggle={() => setActive(active === pilot.id ? null : pilot.id)}/>)}</div>
    </div>
  </section>;
}
