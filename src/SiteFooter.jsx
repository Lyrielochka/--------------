import React from 'react';
import { ArrowUp } from 'lucide-react';
import './site-footer.css';

export default function SiteFooter() {
  return <footer className="site-footer" aria-label="Информация о проекте">
    <div className="site-footer-top">
      <a className="site-footer-brand" href="#hero"><span className="site-footer-mark" aria-hidden="true">Б<span>44</span></span><span>ОПЕРАЦИЯ «БАГРАТИОН»<small>ИСТОРИЯ, КОТОРУЮ МЫ ХРАНИМ</small></span></a>
      <div className="site-footer-contest"><span>ПРОЕКТ ДЛЯ КОНКУРСА</span><strong>PATRIOT<span>.by</span></strong></div>
      <a className="site-footer-up" href="#hero">НАВЕРХ <ArrowUp size={18}/></a>
    </div>
    <div className="site-footer-bottom"><span>© {new Date().getFullYear()} · Цифровой исторический проект</span><span>Помнить прошлое. Понимать настоящее.</span></div>
  </footer>;
}
