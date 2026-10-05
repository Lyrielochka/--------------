import React, { useEffect, useRef, useState } from 'react';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import './museum-header.css';

const sections = [
  ['intro', 'Об операции'],
  ['strategy', 'План наступления'],
  ['commanders', 'Командующие'],
  ['technology', 'Военная техника'],
  ['aviators', 'Женщины в небе войны'],
  ['partisans', 'Партизанское движение'],
  ['map', 'Карта наступления'],
  ['results', 'Итоги освобождения'],
  ['archive', 'Исторические фотографии'],
  ['videos', 'Фильмы об операции'],
  ['projects', 'Другие проекты'],
];
const groups = { hero: 'intro', prehistory: 'intro', summer: 'intro', opening: 'map' };

export default function MuseumHeader({ activeSection }) {
  const [open, setOpen] = useState(false);
  const button = useRef(null), panel = useRef(null);
  const current = groups[activeSection] || activeSection;
  useEffect(() => {
    if (!open) return;
    const old = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panel.current?.querySelector('a')?.focus();
    const onKey = event => {
      if (event.key === 'Escape') { setOpen(false); button.current?.focus(); }
      if (event.key === 'Tab') {
        const links = [...panel.current.querySelectorAll('a')];
        const first = button.current, last = links.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = old; document.removeEventListener('keydown', onKey); };
  }, [open]);
  const close = () => { setOpen(false); button.current?.focus(); };
  return <>
    <header className={`museum-header${activeSection === 'hero' ? ' museum-header-cover' : ''}${open ? ' museum-header-open' : ''}`}>
      <a className="museum-brand" href="#hero" onClick={() => setOpen(false)} aria-label="Операция Багратион — на главную">
        <span className="museum-brand-mark" aria-hidden="true">Б<small>44</small></span>
        <span className="museum-brand-name">БАГРАТИОН<small>ИСТОРИЯ ОСВОБОЖДЕНИЯ</small></span>
      </a>
      <button ref={button} className="museum-menu-button" onClick={() => setOpen(value => !value)} aria-expanded={open} aria-controls="museum-menu" aria-label={open ? 'Закрыть меню разделов' : 'Открыть все разделы'}><span>{open ? 'Закрыть' : 'Разделы'}</span>{open ? <X size={19}/> : <Menu size={19}/>}</button>
    </header>
    {open && <div className="museum-menu-backdrop" onClick={close}>
      <nav ref={panel} id="museum-menu" className="museum-menu-panel" aria-label="Все разделы экспозиции" onClick={event => event.stopPropagation()}>
        <div className="museum-menu-heading"><span>ПУТЕВОДИТЕЛЬ ПО ПРОЕКТУ</span><p>История освобождения Беларуси</p></div>
        <div className="museum-menu-links">{sections.map(([id, label], index) => <a key={id} href={`#${id}`} onClick={close} aria-current={current === id ? 'location' : undefined}><small>{String(index + 1).padStart(2, '0')}</small><span>{label}</span><ArrowUpRight size={17}/></a>)}</div>
        <div className="museum-menu-caption">23 июня — 29 августа 1944 года</div>
      </nav>
    </div>}
  </>;
}
