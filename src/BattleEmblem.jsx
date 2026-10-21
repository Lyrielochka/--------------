import React from 'react';

// Original atlas engravings. Shared silhouettes remain legible at marker size.
export default function BattleEmblem({type='liberation',size=28,className=''}){
 return <svg className={'battle-emblem '+className} width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true" focusable="false">
  <g stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
   {type==='liberation'&&<><path className="emblem-solid" d="M21 10h3v43h-3z"/><path className="emblem-enamel" d="M25 12c9-5 16 5 28 0v25c-12 5-19-5-28 0z"/><path d="M28 16c7-2 13 4 21 1M28 32c7-2 13 4 21 1" opacity=".4"/><path className="emblem-solid" d="m38 18 2 5 6 .3-4.5 3.6 1.5 5.5-5-3-4.6 3 1.3-5.5-4.4-3.6 5.5-.3z"/><path d="M15 51C8 45 8 34 12 27M11 39l-5-3m7 9-6-1m9-11-3-5M29 53h17M32 49h10"/><path d="m50 42 4-4m-5 9 7-2m-10 7 7-1"/></>}
   {type==='battle'&&<><path className="emblem-enamel" d="m17 29 5-10h19l6 10z"/><path className="emblem-solid" d="M36 19h19v4H36zM11 31h40l5 12H7z"/><rect x="7" y="42" width="49" height="13" rx="6.5"/><path d="M13 46h37M14 51h35" opacity=".45"/>{[16,27,38,49].map(x=><circle key={x} cx={x} cy="48.5" r="3"/>)}<path d="m13 13 4-5m-8 13-6-1m41-8 3-5M26 25h9"/></>}
   {type==='crossing'&&<><path d="M7 25h50M8 31h48M15 23V12m34 11V12M14 13h36M19 15l8 8m10 0 8-8"/><path className="emblem-enamel" d="M11 31h8v17h-8zM45 31h8v17h-8z"/><path d="M9 54c5-5 9 5 14 0s9 5 14 0 9 5 14 0M5 45c2-2 3-2 5-1m11 0c4 4 7-4 11-1s7 2 11 0m12 0 4 1"/><path className="emblem-solid" d="m28 5 4-4 4 4h-3v12h-2V5z"/></>}
   {type==='air'&&<><path className="emblem-solid" d="M29 14c0-6 6-6 6 0l-1 12 22 1 3 8-25-2 1 15 8 3v5l-11-2-11 2v-5l8-3 1-15-25 2 3-8 22-1z"/><path d="M20 8h24M32 5v7" strokeWidth="2.2"/><path d="M32 16v29M10 30h18m8 0h18M25 52h4m6 0h4" className="emblem-cut"/><path d="M14 17v6m36-6v6M13 41v7m38-7v7" opacity=".45"/></>}
   {type==='encirclement'&&<><path d="M19 10A25 25 0 0 1 56 30M45 54A25 25 0 0 1 8 34" strokeWidth="3"/><path className="emblem-solid" d="m56 26 5 7-8 3zM8 38l-5-7 8-3z"/><circle cx="32" cy="32" r="15" strokeDasharray="2 4"/><path className="emblem-enamel" d="m32 21 3 7 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1z"/><path d="m13 18 6 4m32 24-6-4M20 51l4-6m20-32-4 6"/></>}
  </g>
 </svg>;
}
