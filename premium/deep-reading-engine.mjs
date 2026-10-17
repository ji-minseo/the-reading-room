import {cards} from '../core/data/cards.mjs';
import {readings} from '../core/data/readings.mjs';
import {themes} from '../core/data/narratives.mjs';
import {spreadSignals,readingHeadline,combinationInsights,nextAction,contextualInsight,synthesis} from '../core/engine.mjs';
import {resolveQuestionFocus,reconcileQuestionReading} from '../core/question-focus.mjs';
import {deepReadingOffer} from '../core/premium-config.mjs';

const openTags=new Set(['movement','communication','attraction','renewal','healing']);
const guardedTags=new Set(['blocked','conflict','distance','closure','waiting']);
const neutralTags=new Set(['reflection','decision']);

const categoryBySlug={
 love:'relationship',reunion:'relationship',breakup:'relationship',feelings:'relationship',contact:'relationship','reunion-timing':'relationship',
 job:'practical',money:'practical',work:'practical',study:'practical'
};

const categoryCopy={
 relationship:{
  positive:'관계를 움직이게 하는 신호가 경계 신호보다 더 많아요.',
  mixed:'가까워지고 싶은 힘과 속도를 늦추는 조건이 같이 보여요.',
  guarded:'지금은 관계를 밀어붙이기보다 거리·경계·현실 조건을 먼저 봐야 해요.'
 },
 practical:{
  positive:'실제로 움직일 수 있는 신호가 제약보다 더 많아요.',
  mixed:'기회와 현실적인 제약이 함께 보여요.',
  guarded:'지금은 결과를 서두르기보다 막고 있는 조건을 먼저 정리해야 해요.'
 }
};

const realityChecks={
 love:['상대의 말보다 실제 약속과 행동이 이어지는지','설렘과 편안함이 같이 있는지','내가 원하는 관계 기준을 낮추고 있지는 않은지'],
 reunion:['연락이 닿는 것과 재회를 같은 뜻으로 보고 있지 않은지','헤어진 원인이 실제 행동으로 달라졌는지','상대의 명확한 경계와 동의를 존중하고 있는지'],
 breakup:['같은 갈등이 반복될 때 해결 방식이 달라졌는지','관계를 유지하려고 내 기준을 계속 포기하고 있지는 않은지','이별 후라면 상대 반응보다 내 일상이 회복되고 있는지'],
 feelings:['말투나 연락 빈도보다 관계를 이어가려는 행동이 있는지','내가 확인한 사실과 추측을 구분했는지','카드가 상대의 실제 감정을 증명한다고 받아들이고 있지 않은지'],
 contact:['연락 가능성과 관계 회복을 같은 의미로 보지 않는지','실제 연락이 오더라도 내용과 태도가 일관적인지','상대가 연락을 원치 않는 경계를 밝혔다면 존중하고 있는지'],
 'reunion-timing':['달력보다 먼저 달라져야 할 현실 조건이 무엇인지','기다리는 동안 내 생활이 멈추고 있지는 않은지','상대의 의사와 상황 변화를 실제로 확인했는지'],
 job:['지원 수보다 직무 적합성과 준비도가 올라가고 있는지','보완해야 할 한 가지를 실제 행동으로 옮겼는지','합격 여부보다 다음 지원의 질이 좋아지고 있는지'],
 money:['수입보다 반복 지출과 고정비를 먼저 확인했는지','감정적인 소비와 필요한 지출을 구분했는지','지금 결정이 한 달 뒤에도 감당 가능한지'],
 work:['불만의 원인이 업무·관계·환경 중 어디에 가까운지','이직 생각과 실제 준비가 같이 움직이고 있는지','바꿀 수 없는 문제와 협의 가능한 문제를 구분했는지'],
 study:['공부시간보다 반복 가능한 루틴이 생겼는지','틀린 문제의 원인을 기록하고 있는지','불안 때문에 계획만 늘리고 실행은 줄고 있지 않은지']
};

function cardFor(pick){return cards.find(card=>card.id===pick.id);}
function primaryTag(pick){const card=cardFor(pick);return (pick.reversed?card.reversedTags:card.tags)[0];}
function orientation(pick){return pick.reversed?'역방향':'정방향';}

function balanceSummary(slug,tags){
 const open=tags.filter(tag=>openTags.has(tag)).length;
 const guarded=tags.filter(tag=>guardedTags.has(tag)).length;
 const neutral=tags.filter(tag=>neutralTags.has(tag)).length;
 const copy=categoryCopy[categoryBySlug[slug]||'relationship'];
 const tone=guarded>open?copy.guarded:open>guarded?copy.positive:copy.mixed;
 return {open,guarded,neutral,tone};
}

function evidenceRows(slug,picks,signals){
 const positions=readings[slug].positions;
 const rows=[];
 for(const [tag] of signals.ranked.slice(0,4)){
  const index=picks.findIndex(pick=>primaryTag(pick)===tag);
  if(index<0)continue;
  const card=cardFor(picks[index]);
  rows.push({
   position:positions[index]?.label||`카드 ${index+1}`,
   card:card.koreanName,
   orientation:orientation(picks[index]),
   theme:themes[tag]||tag,
   reason:`${card.koreanName} ${orientation(picks[index])}은 ‘${themes[tag]||tag}’ 주제를 강조해요. ${card.advice}`
  });
 }
 return rows;
}

function tensionSummary(picks){
 const tags=picks.map(primaryTag);
 const openIndex=tags.findIndex(tag=>openTags.has(tag));
 const guardedIndex=tags.findIndex(tag=>guardedTags.has(tag));
 if(openIndex<0||guardedIndex<0)return null;
 const openCard=cardFor(picks[openIndex]),guardedCard=cardFor(picks[guardedIndex]);
 return {
  title:`${openCard.koreanName} ↔ ${guardedCard.koreanName}`,
  text:`한쪽에는 ‘${themes[tags[openIndex]]}’처럼 움직이려는 힘이, 다른 쪽에는 ‘${themes[tags[guardedIndex]]}’처럼 속도를 늦추는 조건이 함께 있어요. 어느 카드가 더 좋고 나쁜지가 아니라 실제 상황에서 어느 쪽이 반복되는지 확인해야 해요.`
 };
}

function actionPlan(slug,picks,situation,focus){
 const list=[];
 const base=nextAction(slug,picks,situation);
 if(base)list.push(base);
 if(focus?.action&&!list.includes(focus.action))list.push(focus.action);
 const dominant=spreadSignals(slug,picks).ranked[0]?.[0];
 const tagAction={
  movement:'오늘 바로 확인 가능한 행동 한 가지를 정하세요.',
  communication:'확인하고 싶은 내용을 한 문장으로 줄여 실제 대화 가능성을 보세요.',
  attraction:'끌림보다 꾸준한 존중과 행동이 있는지 확인하세요.',
  renewal:'예전과 같은 방식을 반복하지 않을 변화 한 가지를 정하세요.',
  healing:'결론보다 내 컨디션과 일상을 먼저 안정시키세요.',
  decision:'계속할 조건과 멈출 조건을 각각 두 가지씩 적으세요.',
  reflection:'확인한 사실과 내가 추측한 부분을 따로 적어보세요.',
  waiting:'무기한 기다리지 않도록 다시 판단할 시점을 정하세요.',
  distance:'필요한 거리를 실제 행동으로 지키세요.',
  closure:'더는 반복하고 싶지 않은 행동이나 기대 하나를 정리하세요.',
  blocked:'가장 현실적인 걸림돌 하나를 특정하고 바뀔 수 있는 조건인지 확인하세요.',
  conflict:'반복되는 충돌을 줄일 규칙 하나를 정하세요.'
 }[dominant];
 if(tagAction&&!list.includes(tagAction))list.push(tagAction);
 return list.slice(0,3);
}

function avoidPlan(slug,tags){
 const items=[];
 if(tags.some(tag=>guardedTags.has(tag)))items.push('좋은 카드 한 장만 보고 불편한 현실 신호를 무시하지 않기');
 if(['feelings','reunion','contact','reunion-timing'].includes(slug))items.push('카드 결과를 상대의 실제 의사나 약속처럼 단정하지 않기');
 if(['job','work','study','money'].includes(slug))items.push('결과를 기다리느라 지금 바꿀 수 있는 준비·행동을 멈추지 않기');
 if(slug==='breakup')items.push('관계를 유지하기 위해 내 안전·경계·존중 기준을 낮추지 않기');
 return items.slice(0,3);
}

export function createDeepReading({slug,picks,question='',situation=''}){
 if(!deepReadingOffer.supported.includes(slug))throw new Error('Deep Reading is not available for this reading');
 if(!Array.isArray(picks)||picks.length!==readings[slug].positions.length)throw new Error('Complete spread required');
 const signals=spreadSignals(slug,picks);
 const tags=picks.map(primaryTag);
 const focus=resolveQuestionFocus(slug,question,situation,picks);
 const context=contextualInsight(slug,situation,picks);
 const baseReading={
  headline:readingHeadline(slug,picks,situation),
  timing:null,
  action:nextAction(slug,picks,situation),
  combinations:combinationInsights(slug,picks),
  summaryLines:synthesis(slug,picks)
 };
 const reconciled=reconcileQuestionReading(slug,focus,picks,baseReading);
 const balance=balanceSummary(slug,tags);
 const evidence=evidenceRows(slug,picks,signals);
 const tension=tensionSummary(picks);
 const actions=actionPlan(slug,picks,situation,focus);
 const avoid=avoidPlan(slug,tags);
 const checks=realityChecks[slug]||[];
 return {
  version:1,
  product:'reading-room-deep-reading',
  slug,
  readingName:readings[slug].name,
  question,
  situation,
  headline:reconciled.headline,
  decisiveSummary:`이 질문을 한 문장으로 정리하면: ${balance.tone}`,
  balance,
  evidence,
  tension,
  questionFocus:focus,
  context,
  combinations:reconciled.combinations.slice(0,3),
  actions,
  avoid,
  realityChecks:checks,
  closing:[
   `지금 흐름: ${balance.tone}`,
   `가장 중요한 변수: ${evidence[0]?.theme||'현재 행동과 현실 조건'}`,
   `지금 할 일: ${actions[0]||'내가 확인할 수 있는 현실 신호부터 하나 정리하세요.'}`
  ]
 };
}
