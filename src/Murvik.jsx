import React, {useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {makeRound, missions} from './murvikQuestions.js';
import './murvik.css';
import MurvikChat,{useMurvikChat} from './MurvikChat.jsx';
import MurvikPortrait from './MurvikPortrait.jsx';
import MurvikSymbol from './MurvikSymbol.jsx';
import './murvik-studio.css';

const image='/assets/murvik.webp';
export default function Murvik(){
  const [ready,setReady]=useState(!document.getElementById('operation-loader'));
  const [open,setOpen]=useState(false),[mode,setMode]=useState('home');
  const [round,setRound]=useState([]),[index,setIndex]=useState(0),[choice,setChoice]=useState(null);
  const [score,setScore]=useState(0),[hint,setHint]=useState(false),[mission,setMission]=useState(0);
  const [best,setBest]=useState(()=>{try{return Math.max(0,Math.min(5,Number(localStorage.getItem('murvik-best'))||0));}catch{return 0;}});
  const launcher=useRef(null),panel=useRef(null),heading=useRef(null);
  const chat=useMurvikChat(open&&mode==='chat');
  const lastQuizMode=useRef('home');
  if(mode!=='chat')lastQuizMode.current=mode;
  useEffect(()=>{const show=()=>setReady(true);window.addEventListener('operation:loaded',show);return()=>window.removeEventListener('operation:loaded',show);},[]);
  useEffect(()=>{if(!open)return;const previous=document.activeElement;panel.current?.querySelector('button')?.focus();const key=e=>{
    if(e.key==='Escape'){e.preventDefault();e.stopPropagation();setOpen(false);}
    if(e.key==='Tab'){const els=[...panel.current.querySelectorAll('button:not(:disabled),a[href],textarea,[tabindex="0"]')].filter(e=>e.getClientRects().length&&!e.closest('[hidden]'));const first=els[0],last=els.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}
  };document.addEventListener('keydown',key,true);return()=>{document.removeEventListener('keydown',key,true);(launcher.current||previous)?.focus();};},[open]);
  useEffect(()=>{if(open)heading.current?.focus();},[mode,index]);
  useEffect(()=>{if(!open)return;const previous=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=previous;};},[open]);
  const start=()=>{setRound(makeRound());setIndex(0);setScore(0);setChoice(null);setHint(false);setMode('quiz');};
  const answer=value=>{if(choice!==null)return;setChoice(value);if(value===round[index].answer)setScore(s=>s+1);};
  const next=()=>{if(index===round.length-1){const record=Math.max(best,score);setBest(record);try{localStorage.setItem('murvik-best',String(record));}catch{/* Storage may be disabled. */}setMode('result');}else{setIndex(i=>i+1);setChoice(null);setHint(false);}};
  const visit=id=>{setOpen(false);document.getElementById(id)?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});};
  if(!ready)return null;
  const q=round[index],task=missions[mission];
  const mood=mode==='chat'?chat.status:mode==='quiz'?(choice===null?'listening':choice===q?.answer?'correct':'learning'):mode==='result'?'happy':mode==='mission'?'mission':'idle';
  return createPortal(<div className="murvik-root">
    <button ref={launcher} className="murvik-launcher" aria-label="Мурвiк — открыть помощника" aria-haspopup="dialog" aria-expanded={open} aria-controls="murvik-panel" onClick={()=>setOpen(v=>!v)}><img src={image} alt=""/><span><strong>Мурвiк</strong><small>Проверим себя?</small></span><b aria-hidden="true">?</b></button>
    {open&&<><div className="murvik-backdrop" onClick={()=>setOpen(false)} aria-hidden="true"/><section ref={panel} id="murvik-panel" className={`murvik-panel mode-${mode} ${choice!==null&&mode==='quiz'?(choice===q?.answer?'is-correct':'is-learning'):''}`} role="dialog" aria-modal="true" aria-labelledby="murvik-title">
      <header><div><span>ЛИЧНЫЙ КАБИНЕТ ИССЛЕДОВАТЕЛЯ</span><h2 id="murvik-title">Мурвiк <i>Проводник по истории</i></h2></div><button className="murvik-close" aria-label="Закрыть помощника" onClick={()=>setOpen(false)}>×</button></header>
      <nav className="murvik-tabs" aria-label="Режим помощника"><button aria-pressed={mode!=='chat'} onClick={()=>setMode(lastQuizMode.current)}><MurvikSymbol type="compass"/> Викторина</button><button aria-pressed={mode==='chat'} onClick={()=>setMode('chat')}><MurvikSymbol type="chat"/> Спросить Мурвiка</button></nav>
      <MurvikPortrait mood={mood} large={mode==='home'}/>
      <MurvikChat chat={chat} onVisit={visit} active={mode==='chat'}/>
      <div className="murvik-body" key={`${mode}-${index}`}>
        {mode==='home'&&<><p className="murvik-eyebrow">МАЛЕНЬКИЙ РЫСЁНОК. БОЛЬШИЕ ОТКРЫТИЯ.</p><h3 ref={heading} tabIndex={-1}>История любит<br/><em>любопытных.</em></h3><p>Я Мурвiк! Проверим твоё чутьё на исторические факты? Пять вопросов, немного смекалки — и новые открытия.</p><div className="murvik-stats"><div><MurvikSymbol type="compass"/><span>Исследуй</span></div><div><MurvikSymbol type="spark"/><span>Узнавай</span></div><div><MurvikSymbol type="route"/><span>Находи</span></div></div><button className="murvik-primary" onClick={start}><MurvikSymbol type="spark"/><span className="murvik-action-copy">Начать викторину<small>5 вопросов · новые открытия</small></span><span>→</span></button><button className="murvik-secondary" onClick={()=>setMode('mission')}><MurvikSymbol type="route"/><span className="murvik-action-copy">Дай мне задание<small>Найди свой следующий маршрут</small></span><span aria-hidden="true">↗</span></button><small className="murvik-note">Без таймера · с подсказками · без недавних повторов{best>0&&<> · рекорд {best}/5</>}</small></>}
        {mode==='quiz'&&q&&<><div className="murvik-progress"><span>ВОПРОС {index+1} / {round.length}</span><span>ВЕРНО: {score}</span></div><div className="murvik-track"><i style={{width:`${(index+(choice!==null?1:0))/round.length*100}%`}}/></div><div className="murvik-topic">{q.chapter}<span aria-hidden="true">✦</span></div><h3 ref={heading} tabIndex={-1}>{q.question}</h3><div className="murvik-options">{q.options.map((option,i)=><button key={option} disabled={choice!==null} className={choice===null?'':i===q.answer?'correct':choice===i?'wrong':''} onClick={()=>answer(i)}><span>{choice!==null&&i===q.answer?'✓':choice===i?'×':String(i+1).padStart(2,'0')}</span>{option}</button>)}</div>
          {choice===null?<><button className="murvik-hint" aria-expanded={hint} onClick={()=>setHint(v=>!v)}>{hint?'Скрыть подсказку':'Мурвiк, дай подсказку'}</button>{hint&&<p className="murvik-feedback">{q.hint}</p>}</>:<div className="murvik-feedback" role="status"><strong>{choice===q.answer?'Верно! Отличная работа.':'Теперь будем знать!'}</strong><div className="murvik-answer-line">Правильный ответ: {q.options[q.answer]}</div><p>{q.explanation}</p><button className="murvik-chapter" onClick={()=>visit(q.section)}>В раздел «{q.chapter}» ↗</button></div>}
          {choice!==null&&<button className="murvik-primary" onClick={next}>{index===round.length-1?'Мой результат':'Следующий вопрос'} <span>→</span></button>}<button className="murvik-back" onClick={()=>setMode('home')}>В меню помощника</button></>}
        {mode==='result'&&<><p className="murvik-eyebrow">РАЗВЕДКА ЗНАНИЙ ЗАВЕРШЕНА</p><h3 ref={heading} tabIndex={-1}>{score===5?'Рысь видит знатока!':score>=3?'Хорошая работа, исследователь!':'Начало положено!'}</h3><div className="murvik-score">{score}<span> / 5</span></div><div className="murvik-medals" aria-label={`${score} из 5 верных ответов`}>{Array.from({length:5},(_,i)=><span key={i} className={i<score?'earned':''} style={{'--i':i}} aria-hidden="true">✦</span>)}</div><p>{score===5?'Все ответы верные. Твоё чутьё не подвело! В следующей пятёрке тебя ждут новые вопросы.':'Каждый ответ — повод узнать больше. Загляни в разделы сайта и попробуй ещё раз.'}</p><small className="murvik-note">Лучшая попытка в этом браузере: {best}/5</small><button className="murvik-primary" onClick={start}>Сыграть ещё раз <span>↻</span></button><button className="murvik-secondary" onClick={()=>setMode('mission')}>Отправиться на поиски</button><button className="murvik-back" onClick={()=>setMode('home')}>В меню помощника</button></>}
        {mode==='mission'&&<><p className="murvik-eyebrow">ЗАДАНИЕ ОТ МУРВIКА · {mission+1}/{missions.length}</p><h3 ref={heading} tabIndex={-1}>{task.title}</h3><p>{task.text}</p><button className="murvik-primary" onClick={()=>visit(task.section)}>К месту задания <span>↗</span></button><button className="murvik-secondary" onClick={()=>setMission(i=>(i+1)%missions.length)}>Другое задание</button><button className="murvik-back" onClick={()=>setMode('home')}>В меню помощника</button></>}
      </div><footer><span>ОПЕРАЦИЯ «БАГРАТИОН»</span><span>Учим историю. Замечаем детали. Помним.</span></footer>
    </section></>}
  </div>,document.body);
}

