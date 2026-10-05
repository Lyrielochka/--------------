import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import './jury-welcome.css';

export default function JuryWelcome() {
  const dialog = useRef(null);
  const previousOverflow = useRef('');
  const previousFocus = useRef(null);

  useEffect(() => {
    const open = () => {
      if (!dialog.current || dialog.current.open) return;
      previousFocus.current = document.activeElement;
      previousOverflow.current = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      dialog.current.showModal();
    };
    window.addEventListener('operation:loaded', open);
    if (!document.getElementById('operation-loader')) open();
    return () => {
      window.removeEventListener('operation:loaded', open);
      if (dialog.current?.open) document.body.style.overflow = previousOverflow.current;
    };
  }, []);

  const close = () => {
    document.body.style.overflow = previousOverflow.current;
    previousFocus.current?.focus({ preventScroll: true });
  };

  return createPortal(
    <dialog ref={dialog} className="jury-welcome" aria-labelledby="jury-welcome-title" aria-describedby="jury-welcome-copy" onClose={close}>
      <div className="jury-welcome-content">
        <span className="jury-welcome-kicker">ОБРАЩЕНИЕ К ЖЮРИ</span>
        <h2 id="jury-welcome-title">Здравствуйте,<br/>уважаемые члены жюри!</h2>
        <div id="jury-welcome-copy" className="jury-welcome-copy">
          <p>В прошлом году наша работа заняла <strong>третье место на республиканском этапе</strong>. В этом году мы значительно расширили проект и сделали сайт современнее.</p>
          <p className="jury-welcome-highlight">Мы вернулись с новой работой и желанием превзойти свой прошлый результат. <strong>Позвольте нам взять реванш!</strong></p>
          <p>Приглашаем вас внимательно изучить сайт: <strong>многие элементы интерактивны</strong>. Нажимайте на карты, карточки техники и другие объекты — за ними скрываются подробности, дополнительные материалы и новые возможности для знакомства с историей.</p>
        </div>
        <p className="jury-welcome-note">Это обращение будет удалено после районного этапа конкурса.</p>
        <form method="dialog"><button type="submit" autoFocus>Понятно <span aria-hidden="true">→</span></button></form>
      </div>
    </dialog>, document.body,
  );
}
