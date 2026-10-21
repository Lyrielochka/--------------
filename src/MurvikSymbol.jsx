import React from 'react';
// Original line art: shared geometry keeps the interface symbols consistent.
export default function MurvikSymbol({type='compass',className=''}){
 const paths={
  compass:<><circle cx="24" cy="24" r="17"/><circle cx="24" cy="24" r="21" strokeDasharray="1 5"/><path d="m31 17-4 10-10 4 4-10Z"/><path d="m21 21 6 6M24 3v4M45 24h-4M24 45v-4M3 24h4"/></>,
  spark:<><path d="m24 5 5 14 14 5-14 5-5 14-5-14-14-5 14-5Z"/><path d="m37 4 2 5 5 2-5 2-2 5-2-5-5-2 5-2Z"/></>,
  route:<><path d="M9 36c0-10 28 0 28-12S11 24 11 13" strokeDasharray="3 4"/><circle cx="9" cy="38" r="4"/><path d="M11 5a6 6 0 0 1 6 6c0 5-6 10-6 10S5 16 5 11a6 6 0 0 1 6-6Z"/><circle cx="11" cy="11" r="1"/><path d="m34 5 9 4-9 4V5Zm0 0v15"/></>,
  chat:<><path d="M40 29a7 7 0 0 1-7 7H19L8 43V15a7 7 0 0 1 7-7h18a7 7 0 0 1 7 7Z"/><path d="M17 18h14M17 25h9"/><path d="m37 3 2 5 5 2-5 2-2 5"/></>
 };
 return <svg className={`murvik-symbol ${className}`} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[type]||paths.compass}</svg>;
}
