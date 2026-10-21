import assert from 'node:assert/strict';
import {questions,makeRound,HISTORY_KEY} from '../src/murvikQuestions.js';
assert.equal(questions.length,40);
assert.equal(new Set(questions.map(q=>q.id)).size,40);
assert.equal(new Set(questions.map(q=>q.question)).size,40);
for(const q of questions){assert.equal(q.options.length,3);assert.ok(q.options[q.answer]);assert.ok(q.hint&&q.explanation&&q.section);}
for(let run=0;run<20;run++){
  let saved='{}';const storage={getItem:()=>saved,setItem:(_,value)=>{saved=value;}};
  const all=[];
  for(let round=0;round<24;round++){
    // Create a fresh storage adapter each time, as after reloading a page.
    const batch=makeRound(Math.random,{...storage});assert.equal(new Set(batch.map(q=>q.id)).size,5);
    for(const q of batch){const prior=all.lastIndexOf(q.id);if(prior!==-1)assert.ok(all.length-prior>20,`Repeated too soon: ${q.id}`);all.push(q.id);}
    if(round===7)assert.equal(new Set(all).size,40);
    const persisted=JSON.parse(saved);assert.equal(persisted.recent.length,Math.min(20,(round+1)*5));
  }
}
for(const raw of ['broken','{"catalog":1}',`{"catalog":null,"remaining":["missing"]}`])assert.equal(makeRound(Math.random,{getItem:()=>raw,setItem:()=>{}}).length,5);
assert.equal(makeRound(Math.random,{getItem:()=>{throw Error('disabled');},setItem:()=>{throw Error('disabled');}}).length,5);
assert.equal(makeRound(Math.random,null).length,5);
console.log('MURVIK_DECK_OK: 40 unique questions; 20 runs × 24 rounds; first 40 unique; at least 20 intervening questions; persisted history; invalid/blocked storage fallback',HISTORY_KEY);
