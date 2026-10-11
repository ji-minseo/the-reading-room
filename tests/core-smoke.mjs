import assert from 'node:assert/strict';
import {cards} from '../core/data/cards.mjs';
import {readings} from '../core/data/readings.mjs';
import {readingContexts} from '../core/data/reading-contexts.mjs';
import {shuffleDeck,interpret,synthesis,koreanParticle,withParticle,readingHeadline,timingInsight,nextAction,combinationInsights,contextualInsight} from '../core/engine.mjs';
import {resolveQuestionFocus,reconcileQuestionReading} from '../core/question-focus.mjs';
import {readFile} from 'node:fs/promises';

assert.equal(cards.length,78,'The deck must contain 78 cards');
assert.equal(Object.keys(readings).length,12,'The Reading Room must expose 12 readings');

assert.deepEqual(readingContexts.breakup.options.at(-1),['post','이별 후'],'Breakup reading must support a post-breakup state');

assert.equal(withParticle('교황','이/가'),'교황이');
assert.equal(withParticle('여사제','이/가'),'여사제가');
assert.equal(withParticle('호기심','을/를'),'호기심을');
assert.equal(withParticle('상실 · 애도','을/를'),'상실 · 애도를');
assert.equal(withParticle('흐름','으로/로'),'흐름으로');
assert.equal(withParticle('별','으로/로'),'별로');

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

const breakupPicks=['major-13','cups-5','major-17','swords-6','major-21'].map(id=>({id,reversed:false}));
const postContext=contextualInsight('breakup','post',breakupPicks);
assert.equal(postContext?.label,'이별 후');
assert.match(postContext.text,/이별|감정|회복|정리/);
assert.match(readingHeadline('breakup',breakupPicks,'post'),/이별|정리|회복|기준/);
assert.match(nextAction('breakup',breakupPicks,'post'),/이별|일상|회복|기준|거리/);

const feelingsPicks=['major-19','cups-2','major-6','wands-8'].map(id=>({id,reversed:false}));
assert.ok(!readingHeadline('feelings',feelingsPicks,'crush').includes('지금 상대는 호감'));
assert.ok(synthesis('feelings',feelingsPicks)[0].includes('상징'));

const reunionPicks=['major-19','cups-2','major-6','wands-8','major-17'].map(id=>({id,reversed:false}));
const boundaryFocus=resolveQuestionFocus('reunion','다시 만나고 싶지 않아요','recent',reunionPicks);
assert.equal(boundaryFocus?.key,'boundaries');
const boundaryResult=reconcileQuestionReading('reunion',boundaryFocus,reunionPicks,{
  headline:readingHeadline('reunion',reunionPicks,'recent'),
  timing:timingInsight('reunion',reunionPicks),
  action:nextAction('reunion',reunionPicks,'recent'),
  combinations:combinationInsights('reunion',reunionPicks),
  summaryLines:synthesis('reunion',reunionPicks)
});
assert.equal(boundaryResult.timing,null);
assert.deepEqual(boundaryResult.combinations,[]);
assert.ok(boundaryResult.headline.includes('원하는 거리와 선택'));

const [appSource,styleSource]=await Promise.all([readFile('app.mjs','utf8'),readFile('style.css','utf8')]);
assert.ok(appSource.includes("resolveQuestionFocus(state.slug,state.question,state.contextKey,picks)"));
assert.ok(appSource.includes('reconcileQuestionReading(state.slug,questionFocus,picks,baseReading)'));
assert.ok(appSource.includes('class="question-focus"'));
assert.ok(appSource.includes('class="timing-disclaimer"'));
assert.ok(styleSource.includes('.question-focus{'));
assert.ok(styleSource.includes('.timing-disclaimer{'));

console.log('The Reading Room core QA passed: 78 cards, 12 readings, shuffle and interpretation engine.');
