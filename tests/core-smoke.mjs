import assert from 'node:assert/strict';
import {cards} from '../core/data/cards.mjs';
import {readings} from '../core/data/readings.mjs';
import {shuffleDeck,interpret,synthesis} from '../core/engine.mjs';

assert.equal(cards.length,78,'The deck must contain 78 cards');
assert.equal(Object.keys(readings).length,12,'The Reading Room must expose 12 readings');

for(let run=0;run<50;run++){
  const deck=shuffleDeck();
  assert.equal(deck.length,78);
  assert.equal(new Set(deck.map(card=>card.id)).size,78,'A shuffled deck cannot contain duplicate cards');
  assert.ok(deck.every(card=>typeof card.reversed==='boolean'),'Every draw needs an orientation');
}

for(const [slug,reading] of Object.entries(readings)){
  const count=slug==='yes-no'?3:reading.positions.length;
  const picks=shuffleDeck().slice(0,count);
  picks.forEach((pick,index)=>{
    const result=interpret(slug,pick,index);
    assert.ok(result.card?.id);
    assert.ok(result.position?.label);
    assert.ok(result.meaning);
    assert.ok(result.context);
  });
  const summary=synthesis(slug,picks);
  assert.ok(Array.isArray(summary) && summary.length,'Every reading needs a synthesis');
}

console.log('The Reading Room core QA passed: 78 cards, 12 readings, shuffle and interpretation engine.');
