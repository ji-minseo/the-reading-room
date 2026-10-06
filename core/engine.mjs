import {positionVoices,themes} from './data/narratives.mjs';
import {cards} from './data/cards.mjs';
import {readings} from './data/readings.mjs';
import {readingContexts,contextProfiles} from './data/reading-contexts.mjs';
export function koreanParticle(text,pair){
 const value=String(text??'').trim();
 let jong=0,found=false;
 for(let i=value.length-1;i>=0;i--){
  const code=value.charCodeAt(i);
  if(code>=0xAC00&&code<=0xD7A3){jong=(code-0xAC00)%28;found=true;break;}
 }
 if(!found)jong=0;
 if(pair==='이/가')return jong?'이':'가';
 if(pair==='은/는')return jong?'은':'는';
 if(pair==='을/를')return jong?'을':'를';
 if(pair==='과/와')return jong?'과':'와';
 if(pair==='으로/로')return !jong||jong===8?'로':'으로';
 return '';
}
export function withParticle(text,pair){return String(text)+koreanParticle(text,pair);}
export function randomInt(max,cryptoSource=globalThis.crypto){
 if(!Number.isSafeInteger(max)||max<1)throw new Error('Invalid random range');
 const limit=Math.floor(4294967296/max)*max;const a=new Uint32Array(1);do{cryptoSource.getRandomValues(a);}while(a[0]>=limit);return a[0]%max;
}
export function shuffleDeck(){const deck=cards.map(c=>({id:c.id,reversed:randomInt(2)===1}));for(let i=deck.length-1;i>0;i--){const j=randomInt(i+1);[deck[i],deck[j]]=[deck[j],deck[i]];}return deck;}
export function dateKey(date=new Date()){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;}
export const storageKey='pickacard:daily:v1';
export function loadDaily(storage,date=dateKey()){try{const d=JSON.parse(storage.getItem(storageKey));if(d?.date===date&&cards.some(c=>c.id===d.card?.id)&&typeof d.card.reversed==='boolean')return d.card;}catch{}return null;}
export function saveDaily(storage,card,date=dateKey()){try{storage.setItem(storageKey,JSON.stringify({date,card}));return true;}catch{return false;}}
const concreteScenes={
 love:{
  movement:'소개나 만남 제안이 늘거나, 먼저 대화를 이어가고 싶어지는 식으로 관계가 실제 행동으로 움직일 수 있어요.',
  communication:'연락 텀이 줄고 대화가 자연스럽게 이어지는 등 말이 오가는 흐름으로 나타날 수 있어요.',
  attraction:'눈길이 가는 사람이 생기거나, 이미 아는 사람에게 설렘이 커지는 식으로 나타날 수 있어요.',
  healing:'연애보다 내 컨디션과 감정 회복이 먼저 좋아지면서 사람을 보는 기준도 차분해질 수 있어요.',
  decision:'썸을 이어갈지, 관계를 분명히 할지처럼 애매함을 정리해야 하는 장면이 생길 수 있어요.',
  waiting:'연락은 오가지만 관계가 쉽게 정의되지 않거나, 서로의 타이밍이 엇갈리는 식으로 나타날 수 있어요.',
  reflection:'새 사람을 만나기 전 과거 연애 패턴이나 내가 원하는 관계를 다시 생각하게 될 수 있어요.',
  distance:'호감은 있어도 연락·만남이 뜸하거나, 한쪽이 감정적으로 거리를 두는 모습으로 나타날 수 있어요.',
  renewal:'기존 취향과 다른 사람에게 끌리거나, 예전과 다른 방식으로 연애를 시작해볼 수 있어요.',
  closure:'미련 남은 관계나 애매한 썸을 정리해야 새 흐름이 들어오는 장면으로 나타날 수 있어요.',
  blocked:'호감은 있어도 일정·자신감·상대 상황 같은 현실 조건 때문에 진전이 막힐 수 있어요.',
  conflict:'좋아하는 마음은 있어도 연락 방식이나 관계 기대치가 달라 부딪히는 식으로 나타날 수 있어요.'
 },
 reunion:{
  movement:'누군가 먼저 안부를 묻거나 만남을 제안하는 식으로 멈췄던 관계가 다시 움직일 수 있어요.',
  communication:'짧은 안부, 답장 재개, 미뤄둔 대화처럼 끊겼던 소통이 다시 이어지는 장면으로 나타날 수 있어요.',
  attraction:'그리움이나 미련은 남아 있어 다시 보고 싶다는 마음이 커질 수 있지만, 그것만으로 재회가 결정되지는 않아요.',
  healing:'감정이 가라앉고 서로를 덜 방어적으로 볼 수 있게 되면서 대화 가능성이 생길 수 있어요.',
  decision:'다시 만날지 완전히 정리할지, 한쪽 또는 양쪽이 관계의 결론을 정하려는 흐름으로 나타날 수 있어요.',
  waiting:'서로 생각은 있지만 먼저 연락하지 않거나, 답장과 행동이 늦어지는 식으로 정체될 수 있어요.',
  reflection:'과거 대화나 헤어진 이유를 반복해서 되짚지만 실제 행동은 아직 없는 상태일 수 있어요.',
  distance:'연락 단절, 차단, SNS만 확인하는 식으로 마음보다 거리가 더 크게 느껴질 수 있어요.',
  renewal:'사과, 연락 방식 변경, 이전 갈등에 대한 새로운 약속처럼 예전과 다른 방식이 생겨야 움직일 수 있어요.',
  closure:'상대나 내가 관계를 정리하려는 행동을 하고 있을 수 있어요. 이 경우 재회보다 마무리 쪽이 더 강합니다.',
  blocked:'자존심, 새로운 상대, 일정, 반복된 상처 같은 현실적인 걸림돌이 재접근을 막고 있을 수 있어요.',
  conflict:'연락해도 같은 싸움이나 신뢰 문제로 다시 부딪힐 가능성이 커, 감정보다 문제 해결이 먼저인 흐름이에요.'
 },
 feelings:{
  movement:'상대가 먼저 말을 걸거나 약속을 잡는 등 관심이 행동으로 드러나는 모습으로 나타날 수 있어요.',
  communication:'답장이 이어지거나 질문을 되묻는 등 대화를 끊지 않으려는 태도로 나타날 수 있어요.',
  attraction:'신경이 쓰이고 더 알고 싶은 호감은 있는 쪽에 가깝지만, 아직 관계를 확정하려는 단계까지는 아닐 수 있어요.',
  healing:'편안함과 좋은 감정은 있지만 강하게 밀어붙이기보다 부담 없는 관계를 유지하고 싶어 할 수 있어요.',
  decision:'마음이 없어서라기보다 이 관계를 어디까지 가져갈지 스스로 판단하는 중일 수 있어요.',
  waiting:'생각은 있어도 먼저 행동하지 않고 상대의 반응이나 상황을 지켜보는 모습에 가까워요.',
  reflection:'관계와 자신의 감정을 혼자 정리하는 중이라 겉으로는 반응이 적게 보일 수 있어요.',
  distance:'현재는 가까워지려는 마음보다 자기 공간을 지키거나 거리를 두려는 태도가 더 강하게 보일 수 있어요.',
  renewal:'예전과는 다른 방식으로 다시 보거나 관계를 새롭게 정의해보려는 생각이 생길 수 있어요.',
  closure:'현재는 관계를 이어가기보다 마음이나 상황을 정리하려는 쪽에 더 무게가 실릴 수 있어요.',
  blocked:'호감 여부와 별개로 부담, 자신감 부족, 현실 상황 때문에 표현이나 행동을 멈추고 있을 수 있어요.',
  conflict:'끌림이나 관심이 있어도 불편함과 경계심이 함께 있어 태도가 왔다 갔다 할 수 있어요.'
 },
 'yes-no':{
  movement:'지금 시작하면 바로 작은 행동으로 옮길 수 있는 선택인지 확인해보세요. 예를 들면 신청, 예약, 연락처럼 되돌리기 쉬운 첫 단계부터 해볼 수 있어요.',
  communication:'결정 전에 한 사람에게 묻거나 조건을 확인하면 답이 훨씬 선명해질 수 있어요.',
  attraction:'끌리는 마음이 판단을 앞서고 있을 수 있어요. 오늘 바로 결제하거나 확정하기보다 하루 두고 다시 보는 게 좋아요.',
  healing:'지금 선택이 나를 편하게 만드는지, 피곤함을 더 키우는지 기준으로 보면 답이 쉬워질 수 있어요.',
  decision:'선택 기준을 두세 개 적고 그중 몇 개를 충족하는지 확인하면 YES/NO를 정하기 쉬워져요.',
  waiting:'아직 필요한 정보가 덜 모였거나 타이밍이 아닌 쪽에 가까워요. 며칠 뒤 다시 판단해도 늦지 않을 수 있어요.',
  reflection:'지금 당장 답을 내리기보다 내가 왜 이 선택을 하고 싶은지 한 번 정리해보는 게 먼저예요.',
  distance:'지금은 한 발 물러나 보는 쪽이 유리해요. 선택에서 잠깐 거리를 두면 감정과 조건을 분리해서 볼 수 있어요.',
  renewal:'기존 방식 대신 다른 선택지를 하나 더 비교해보면 답이 달라질 수 있어요.',
  closure:'계속 고민만 늘어나는 선택이라면 이번에는 끝내거나 정리하는 쪽도 충분히 고려해볼 만해요.',
  blocked:'하고 싶어도 시간, 돈, 준비 부족 같은 현실 조건이 막고 있을 수 있어요. 이 조건이 해결되지 않으면 지금은 NO에 가까워요.',
  conflict:'장점과 단점이 비슷하게 커서 바로 결정하면 후회할 수 있어요. 무엇을 포기할 수 있는지부터 정해보세요.'
 },
 job:{
  movement:'이력서 수정, 지원 시작, 면접 준비처럼 멈춰 있던 취준이 실제 행동으로 넘어가는 흐름이에요.',
  communication:'면접·과제·리크루터 연락처럼 내 경험을 말로 설명하고 보여주는 과정이 중요해질 수 있어요.',
  reflection:'지원 수를 늘리기보다 포트폴리오와 경험을 다시 정리하면서 방향을 잡는 시간이 필요해 보여요.',
  healing:'취준 피로가 누적됐다면 잠깐 회복해야 오히려 준비 효율이 올라가는 흐름이에요.',
  decision:'직무, 회사 규모, 연봉·근무조건 중 무엇을 우선할지 기준을 정해야 지원이 선명해질 수 있어요.',
  attraction:'회사 이름이나 직무 이미지에 끌리기보다 실제 업무와 내가 원하는 경험이 맞는지 확인할 필요가 있어요.',
  distance:'원하는 직무와 현재 경험 사이 간격이 느껴질 수 있어, 한 단계 현실적인 지원 전략이 필요해 보여요.',
  renewal:'지원 방식, 포트폴리오 구성, 자소서 문장처럼 기존 방식을 바꾸면 흐름이 살아날 수 있어요.',
  waiting:'지원 결과만 기다리기보다 다음 지원을 준비하는 편이 유리한 흐름이에요.',
  closure:'맞지 않는 직무나 준비 방식을 접고, 더 가능성 있는 방향에 시간을 몰아줄 때일 수 있어요.',
  blocked:'포트폴리오 미완성, 경험 정리 부족, 지원 미루기처럼 한 가지 막힘이 전체 진행을 늦추고 있을 수 있어요.',
  conflict:'하고 싶은 일과 현실 조건이 충돌해 지원 자체가 흔들릴 수 있어요. 우선순위를 정해야 해요.'
 },
 money:{
  movement:'새 수입원을 찾거나 고정비를 줄이는 등 돈의 흐름을 실제로 바꾸는 행동이 필요한 때예요.',
  communication:'정산, 계약, 급여, 비용 분담처럼 돈 이야기를 명확히 확인해야 손해를 줄일 수 있어요.',
  reflection:'이번 달 지출 내역을 다시 보면서 왜 썼는지까지 확인하면 새는 돈이 보일 수 있어요.',
  healing:'스트레스 소비나 보상 소비가 있다면 먼저 생활 리듬을 안정시키는 게 돈 관리에도 도움이 돼요.',
  decision:'살지 말지, 유지할지 줄일지처럼 지출 기준을 명확히 정해야 흐름이 잡혀요.',
  attraction:'예뻐서, 갖고 싶어서, 놓치기 싫어서 쓰는 돈이 커질 수 있어 충동 지출을 특히 조심해야 해요.',
  distance:'당장 쓰지 않아도 되는 돈을 분리해 두거나, 카드·쇼핑앱과 거리를 두는 방식이 효과적일 수 있어요.',
  renewal:'예산 방식이나 저축 구조를 바꾸면 관리가 훨씬 쉬워질 수 있어요.',
  waiting:'큰 구매나 투자 판단은 서두르기보다 며칠 두고 다시 보는 편이 나은 흐름이에요.',
  closure:'안 쓰는 구독, 반복되는 소액 결제, 필요 없는 고정비를 정리할 타이밍이에요.',
  blocked:'예상치 못한 지출이나 고정비 부담 때문에 여유 자금이 묶일 수 있어요.',
  conflict:'쓰고 싶은 마음과 모아야 한다는 압박이 충돌해, 기준 없이 왔다 갔다 할 수 있어요.'
 },
 work:{
  movement:'새 업무를 맡거나 이직 준비를 시작하는 등 커리어가 정체에서 행동으로 넘어갈 수 있어요.',
  communication:'상사·동료와 역할, 일정, 기대치를 명확히 말하는 것이 문제 해결의 핵심이 될 수 있어요.',
  reflection:'지금 힘든 게 회사 전체 때문인지 특정 업무·사람 때문인지 구분해보는 시간이 필요해요.',
  healing:'번아웃이나 피로가 누적됐다면 성과보다 회복과 업무량 조정이 먼저일 수 있어요.',
  decision:'남을지 옮길지보다 어떤 조건이면 남고 어떤 조건이면 떠날지 기준을 정해야 해요.',
  attraction:'새 회사나 새로운 역할이 매력적으로 보여도 실제 업무 강도와 보상 조건을 함께 봐야 해요.',
  distance:'업무와 감정을 분리하거나, 불필요한 인간관계 갈등에서 한 발 물러나는 게 도움이 될 수 있어요.',
  renewal:'업무 방식, 역할 분담, 이직 준비처럼 지금과 다른 방식을 시도해야 흐름이 바뀔 수 있어요.',
  waiting:'승진·이직 결과만 기다리기보다 지금 경력에 남길 성과를 하나 더 만드는 편이 좋아요.',
  closure:'끝낼 프로젝트, 내려놓을 역할, 정리할 관계를 분명히 해야 다음 단계로 갈 수 있어요.',
  blocked:'권한 부족, 애매한 역할, 과도한 업무량 같은 구조적 문제가 발목을 잡고 있을 수 있어요.',
  conflict:'업무 방식이나 책임 범위를 두고 반복적으로 부딪히는 상황이 이어질 수 있어요.'
 },
 study:{
  movement:'계획만 세우던 상태에서 실제 문제 풀이, 복습, 모의고사처럼 손을 움직이는 공부가 필요한 때예요.',
  communication:'선생님·스터디·질문 게시판처럼 모르는 부분을 바로 묻고 피드백 받는 방식이 효율을 높일 수 있어요.',
  reflection:'공부 시간을 늘리기보다 틀린 문제와 집중이 깨지는 패턴을 먼저 분석하는 편이 좋아요.',
  healing:'수면 부족과 피로가 심하면 공부량을 늘리는 것보다 컨디션을 회복하는 게 점수에도 도움이 돼요.',
  decision:'과목별 우선순위, 시험 범위, 목표 점수처럼 무엇을 먼저 잡을지 기준을 정해야 해요.',
  attraction:'새 교재나 공부법을 계속 찾기보다 지금 가진 자료를 끝까지 쓰는 편이 더 효과적일 수 있어요.',
  distance:'휴대폰, 게임, SNS처럼 집중을 끊는 환경과 물리적으로 거리를 두는 게 필요할 수 있어요.',
  renewal:'시간표나 복습 방식이 안 맞았다면 공부 루틴 자체를 바꿔야 흐름이 살아날 수 있어요.',
  waiting:'결과를 걱정하며 멈춰 있기보다 오늘 할 분량을 끝내는 편이 불안을 줄여줘요.',
  closure:'효율이 떨어지는 공부법이나 끝없이 미뤄온 범위를 정리하고 새 계획으로 넘어갈 때예요.',
  blocked:'완벽하게 해야 한다는 압박, 피로, 계획 과다 때문에 시작 자체가 늦어질 수 있어요.',
  conflict:'해야 할 공부와 하고 싶은 일이 계속 충돌해 집중이 흔들릴 수 있어요. 시간 경계를 분명히 잡아야 해요.'
 }
};
export function contextualInsight(slug,contextKey,picks){
 if(!contextKey||!readingContexts[slug]||!contextProfiles[slug]?.[contextKey]||!Array.isArray(picks)||!picks.length)return null;
 const signals=spreadSignals(slug,picks),tags=signals.positions.map(p=>p.tags[0]);
 const difficult=tags.filter(t=>['blocked','conflict','distance','closure'].includes(t)).length>=Math.ceil(tags.length/2);
 const strongest=signals.ranked[0]?.[0],option=readingContexts[slug].options.find(([key])=>key===contextKey),profile=contextProfiles[slug][contextKey];
 return {label:option?.[1]||contextKey,text:(difficult?profile.difficult:profile.active)+' 이번 배열에서는 특히 ‘'+themes[strongest]+'’을 같이 봐야 해요.'};
}
const jobPositionScenes=[
 {
  movement:'준비 상태 자리에서 움직임 카드가 나왔어요. 이력서나 포트폴리오를 손보는 데서 멈추지 말고 실제 지원 한 곳까지 이어가는 게 좋아 보여요.',
  communication:'준비 상태를 보면 면접에서 말할 경험이 정리돼 있는지가 중요해요. 대표 경험 하나를 1분 답변으로 만들어보는 게 도움이 됩니다.',
  reflection:'현재 준비는 양보다 정리가 먼저예요. 지원 직무와 상관없는 경험은 덜고, 보여줄 핵심 경험을 다시 묶어보세요.',
  healing:'지금은 준비 부족보다 피로가 효율을 깎고 있을 수 있어요. 하루 쉬거나 준비 시간을 줄여도 전체 흐름에는 오히려 도움이 될 수 있습니다.',
  decision:'준비 단계부터 지원 기준이 흔들리는 모습이에요. 직무·연봉·근무방식 중 두 가지는 미리 우선순위를 정해두는 게 좋아요.',
  attraction:'회사 이름이나 멋있어 보이는 직무에 끌려 준비가 분산될 수 있어요. 실제로 하고 싶은 업무가 무엇인지 먼저 좁혀보세요.',
  distance:'원하는 직무와 현재 경험 사이 간격이 보여요. 바로 최종 목표만 보지 말고 한 단계 가까운 포지션도 같이 넣는 편이 현실적입니다.',
  renewal:'기존 준비 방식이 잘 안 먹혔다면 첫 화면, 자기소개, 포트폴리오 순서를 새로 바꿔볼 때예요.',
  waiting:'아직 지원보다 준비를 더 해야 한다는 생각이 길어질 수 있어요. 완성도 100%를 기다리기보다 제출 가능한 기준을 정해보세요.',
  closure:'지금 준비에서 오래 끌고 있지만 효과가 낮은 부분 하나는 접는 게 좋아요. 남길 것과 버릴 것을 정리해야 속도가 붙습니다.',
  blocked:'준비 상태에서 병목이 분명해 보여요. 포트폴리오 미완성, 자소서 미정리, 지원 미루기 중 가장 큰 하나를 먼저 끝내세요.',
  conflict:'하고 싶은 일과 현실 조건이 충돌해 준비 방향이 자꾸 바뀔 수 있어요. 이번 지원에서 무엇을 포기하지 않을지 먼저 정해보세요.'
 },
 {
  movement:'강점 자리에서 행동력이 잡혔어요. 말만 잘하는 것보다 실제로 만든 것, 개선한 것, 끝낸 경험을 앞에 내세우는 게 좋습니다.',
  communication:'강점은 설명력과 전달력 쪽에 있어요. 경험을 길게 늘이기보다 문제–행동–결과 순서로 말하면 훨씬 강하게 보여요.',
  reflection:'생각을 깊게 정리하고 구조화하는 능력이 강점으로 읽혀요. 분석하거나 문제를 정리한 경험을 사례로 보여주세요.',
  healing:'조율하고 안정시키는 힘이 강점이에요. 팀에서 갈등을 줄였거나 꾸준히 운영한 경험이 있다면 좋은 사례가 될 수 있어요.',
  decision:'판단 기준을 세우고 우선순위를 정하는 능력이 강점으로 보여요. 선택이 필요했던 프로젝트 경험을 앞세워보세요.',
  attraction:'사람의 시선을 끄는 결과물이나 감각이 강점일 수 있어요. 포트폴리오라면 첫 화면에서 바로 보이게 배치해보세요.',
  distance:'객관적으로 선을 긋고 문제를 분리해서 보는 능력이 강점이에요. 복잡한 상황을 정리한 경험이 있다면 살려보세요.',
  renewal:'새로운 방식으로 바꾸고 개선한 경험이 강점이에요. 기존 프로세스를 바꿔 성과를 낸 사례가 있다면 꼭 넣으세요.',
  waiting:'성급하게 결론 내리지 않고 꾸준히 버티는 힘이 장점이에요. 장기 프로젝트나 반복 운영 경험을 보여주기 좋아요.',
  closure:'마무리 능력이 강점으로 읽혀요. 시작보다 끝까지 완수한 프로젝트를 중심으로 이야기하는 게 유리합니다.',
  blocked:'오히려 어려운 상황에서 버텨낸 경험이 강점이 될 수 있어요. 막힌 상황을 어떻게 풀었는지 구체적으로 설명해보세요.',
  conflict:'의견 차이가 있을 때 기준을 세우고 해결한 경험이 강점이 될 수 있어요. 갈등 자체보다 해결 과정을 보여주세요.'
 },
 {
  movement:'보완점은 준비 속도예요. 생각보다 실행이 늦어질 수 있으니 이번 주 안에 제출할 지원 한 곳을 정해두는 게 좋아요.',
  communication:'보완점은 면접에서 경험을 구체적으로 말하는 부분일 수 있어요. “열심히 했다”보다 숫자와 결과를 붙여보세요.',
  reflection:'보완점은 준비를 계속 되돌아보느라 제출이 늦어지는 부분이에요. 수정 횟수에 한계를 두고 실제 지원으로 넘어가세요.',
  healing:'보완점은 체력과 집중력 관리예요. 준비 시간을 늘리는 것보다 수면과 일정부터 안정시키는 편이 효율적입니다.',
  decision:'보완점은 지원 기준이 자꾸 바뀌는 점이에요. 공고를 볼 때 같은 기준표로 판단하도록 세 가지 조건을 정해두세요.',
  attraction:'보완점은 회사 이미지나 직무명에 끌려 실제 업무를 놓치는 부분이에요. 공고의 업무 내용을 세 줄로 요약해보고 결정하세요.',
  distance:'보완점은 목표 직무와 현재 경험 사이 간격이에요. 부족한 경험을 한 번에 메우려 하기보다 가장 가까운 한 단계부터 채우세요.',
  renewal:'보완점은 기존 자료를 계속 재사용하는 부분이에요. 지원 직무에 맞춰 첫 문단이나 대표 프로젝트를 새로 맞춰보세요.',
  waiting:'보완점은 결과를 기다리는 동안 흐름이 끊기는 점이에요. 한 곳 기다릴 때 다음 두 곳을 동시에 준비해두세요.',
  closure:'보완점은 맞지 않는 준비를 오래 붙잡는 점이에요. 효과 없는 자격증이나 자료 수정은 과감히 줄여도 됩니다.',
  blocked:'보완점이 가장 직접적으로 드러나는 자리예요. 지금 전체 취준을 막는 한 가지 미완성 준비물을 먼저 끝내는 게 핵심입니다.',
  conflict:'보완점은 하고 싶은 일과 조건 사이에서 계속 흔들리는 부분이에요. 우선순위를 한 번 정하고 최소 한 달은 유지해보세요.'
 },
 {
  movement:'다음 흐름은 실제 지원과 면접으로 넘어가는 쪽이에요. 준비만 더 하기보다 지원 수를 만들면서 보완해가는 편이 좋습니다.',
  communication:'다음 단계에서는 면접·과제·리크루터 연락처럼 소통이 중요해질 수 있어요. 답변 템플릿과 포트폴리오 설명을 미리 준비해두세요.',
  reflection:'다음 행동은 무작정 지원 수를 늘리는 게 아니라 방향을 한 번 정리하는 거예요. 최근 탈락이나 피드백에서 반복되는 점을 찾아보세요.',
  healing:'다음 단계에서는 잠깐 속도를 낮추고 회복하는 게 오히려 유리할 수 있어요. 지친 상태로 지원을 반복하지 않는 게 중요합니다.',
  decision:'다음 행동은 지원 기준을 확정하는 거예요. 갈 회사와 안 갈 회사의 조건을 미리 정해두면 선택이 빨라집니다.',
  attraction:'다음 흐름에서는 끌리는 회사가 생길 수 있어요. 지원은 해보되 브랜드보다 실제 업무와 조건을 마지막에 다시 확인하세요.',
  distance:'다음 단계는 목표와 현실 사이 간격을 줄이는 거예요. 필요한 경험 하나를 채울 프로젝트나 포지션을 먼저 선택해보세요.',
  renewal:'다음 행동은 지원 방식 자체를 바꾸는 거예요. 이력서 문장, 포트폴리오 순서, 지원 채널 중 하나는 새로 시도해보세요.',
  waiting:'다음 흐름은 바로 결과가 나오기보다 기다림이 섞일 수 있어요. 기다리는 동안 지원을 멈추지 않는 게 중요합니다.',
  closure:'다음 행동은 정리예요. 맞지 않는 지원 방향 하나를 접고 가능성이 높은 쪽에 시간을 몰아주는 게 좋습니다.',
  blocked:'다음 단계로 가기 전에 병목 하나를 반드시 풀어야 해요. 그게 해결되면 지원 속도가 눈에 띄게 빨라질 수 있습니다.',
  conflict:'다음 행동은 기준 충돌을 정리하는 거예요. 하고 싶은 것과 현실 조건을 표로 나눠 우선순위를 먼저 확정해보세요.'
 }
];
export function situationExample(slug,pick,index){
 const card=cards.find(c=>c.id===pick.id);if(!card||!readings[slug]?.positions[index])return null;
 const tag=(pick.reversed?card.reversedTags:card.tags)[0];
 if(slug==='job')return jobPositionScenes[index]?.[tag]||concreteScenes.job?.[tag]||null;
 return concreteScenes[slug]?.[tag]||null;
}
const headlineContextNotes={
 reunion:{recent:'헤어진 직후라면 감정의 크기보다 같은 문제가 다시 반복되지 않을 준비가 됐는지를 더 크게 봐야 해요.',mid:'1~3개월 정도 지났다면 그리움보다 실제로 달라진 행동이 있는지가 중요해요.',long:'오래 지난 관계라면 예전으로 돌아가기보다 지금의 두 사람이 새로 연결될 수 있는지를 봐야 해요.'},
 breakup:{conflict:'지금처럼 갈등 중이라면 사랑의 크기보다 싸운 뒤 문제를 다시 다룰 수 있는지가 핵심이에요.',distance:'권태나 거리감이 주제라면 설렘을 억지로 되살리기보다 무엇이 멀어지게 했는지 먼저 보는 편이 맞아요.',considering:'이미 이별을 고민 중이라면 계속 버틸 수 있는 관계인지가 카드의 긍정성보다 더 중요해요.'},
 feelings:{crush:'썸이나 짝사랑이라면 호감처럼 보이는 신호보다 실제로 대화를 이어가려는 행동을 더 크게 보세요.',relationship:'연애 중이라면 마음의 유무보다 피로와 갈등 속에서도 관계를 돌보는 행동이 남아 있는지가 중요해요.',ex:'전 연인이라면 미련이 남아 있다는 해석과 다시 만나고 싶다는 의지는 따로 봐야 해요.'},
 contact:{recent:'연락이 끊긴 지 며칠 정도라면 침묵 자체를 큰 결론으로 만들기보다 조금 더 여백을 두는 편이 좋아요.',mid:'1주 이상 끊겼다면 단순한 타이밍보다 연락을 미루게 만든 부담이 반복되고 있는지 확인해야 해요.',long:'오래 끊긴 연락이라면 예전 대화를 그대로 이어가기보다 지금 다시 대화할 현실적인 이유가 있는지가 중요해요.'}
};
function withHeadlineContext(slug,situation,text){
 const note=headlineContextNotes[slug]?.[situation];
 return note?text+' '+note:text;
}
const headlineNuance={
 love:{
  movement:'특히 이번 배열은 기다리기보다 실제 만남이나 행동이 생기는지가 핵심이에요.',
  communication:'말을 주고받는 힘이 강해서, 호감보다 대화가 실제로 이어지는지를 보는 편이 맞아요.',
  attraction:'끌림은 분명하지만 설렘과 안정적인 관계 가능성은 따로 확인할 필요가 있어요.',
  renewal:'새 사람이나 새로운 관계 방식처럼 이전과 다른 흐름이 열리는 쪽에 힘이 실립니다.',
  decision:'연애운 자체보다 어떤 관계를 선택할지 기준을 정하는 일이 먼저로 보여요.',
  healing:'강한 진전보다 편안함과 회복이 먼저여서, 서두르지 않는 흐름이 오히려 자연스럽습니다.',
  reflection:'새로운 사람보다 내 연애 패턴과 기준을 돌아보는 일이 이번 흐름을 더 크게 좌우해요.',
  waiting:'기회가 없기보다 타이밍이 느린 쪽이라, 기다림을 어떻게 보내는지가 중요해요.',
  distance:'호감보다 거리와 경계가 더 선명해서, 쫓아가기보다 반응을 지켜보는 편이 맞습니다.',
  closure:'새 관계를 열기 전에 끝내지 못한 감정이나 애매한 관계를 정리하는 흐름이 먼저예요.',
  blocked:'마음보다 현실적인 제약이 더 크게 작용하고 있어, 조건 하나를 푸는 게 우선입니다.',
  conflict:'끌림이 있어도 원하는 관계 방식이 다를 수 있어, 호감보다 기준 충돌을 먼저 봐야 해요.'
 },
 reunion:{
  movement:'특히 이번 배열은 생각보다 실제 연락이나 행동이 생기는지가 재회 흐름을 가릅니다.',
  communication:'재회의 핵심은 감정 확인보다 다시 대화를 열 수 있는지에 더 가깝습니다.',
  attraction:'그리움과 끌림은 남아 있지만, 그것만으로 다시 만나도 괜찮은 관계인지는 별개예요.',
  renewal:'예전으로 돌아가는 재회보다 관계 방식을 새로 만들 수 있는지가 더 중요하게 보여요.',
  decision:'상대나 나 중 한쪽이 관계를 다시 둘지 말지 결론을 내리는 과정이 크게 잡혀 있어요.',
  healing:'재접촉보다 먼저 감정이 가라앉고 관계를 편하게 볼 수 있는 상태가 필요한 배열입니다.',
  reflection:'행동보다 서로가 헤어진 이유를 다시 생각하는 시간이 길어질 수 있어요.',
  waiting:'마음이 남아 있어도 먼저 움직이지 않는 흐름이 강해서, 속도는 느리게 보는 편이 맞습니다.',
  distance:'현재는 가까워지는 힘보다 각자의 공간과 거리를 지키는 힘이 더 크게 보여요.',
  closure:'재회보다 기존 관계 방식을 끝내는 주제가 강해서, 다시 만나더라도 예전과 같기는 어려워요.',
  blocked:'재회를 막는 현실적인 문제나 두려움이 분명해서, 감정보다 그 조건이 풀리는지가 먼저예요.',
  conflict:'다시 끌리는 힘과 같은 갈등이 반복될 위험이 같이 보여, 해결 방식이 바뀌는지가 핵심입니다.'
 },
 job:{
  movement:'이번 배열은 준비를 더 쌓는 것보다 실제 지원과 실행으로 넘어가는 힘이 강합니다.',
  communication:'서류 자체보다 면접·피드백·연락처럼 사람과 주고받는 과정이 결과를 좌우하기 쉬워요.',
  attraction:'끌리는 회사가 보여도 브랜드보다 실제 업무와 조건을 비교하는 게 중요합니다.',
  renewal:'기존 지원 방식보다 이력서나 포트폴리오, 지원 채널을 바꾸는 쪽에서 돌파구가 보여요.',
  decision:'지원 수보다 어떤 직무와 조건을 선택할지 기준을 좁히는 일이 먼저예요.',
  healing:'지원 속도를 올리기보다 컨디션을 회복해야 준비의 질이 다시 살아나는 흐름입니다.',
  reflection:'지금은 더 많이 하기보다 최근 지원에서 반복된 약점을 찾아 수정하는 게 효과적이에요.',
  waiting:'움직임은 이어지지만 결과가 바로 확정되기보다 기다림이 섞일 수 있는 배열입니다.',
  distance:'목표 포지션과 현재 준비 사이 간격을 줄이는 현실적인 한 단계가 필요해요.',
  closure:'효율이 낮은 지원 방향 하나를 정리해야 더 가능성 있는 쪽에 힘을 몰아줄 수 있어요.',
  blocked:'현재 결과를 막는 병목이 비교적 선명해서, 지원 수보다 그 한 가지 보완이 우선입니다.',
  conflict:'하고 싶은 일과 현실 조건이 충돌하고 있어, 우선순위를 정해야 지원 방향이 선명해집니다.'
 }
};
const synthesisLeadNuance={
 movement:'특히 실제 행동으로 이어지는 힘이 이번 배열에서 두드러져요.',
 communication:'특히 말과 반응을 주고받는 과정이 흐름을 크게 좌우해요.',
 attraction:'특히 끌림이 강해서, 감정의 크기와 현실적인 지속 가능성을 나눠 볼 필요가 있어요.',
 renewal:'특히 이전과 다른 방식으로 다시 시작하는 주제가 강합니다.',
 decision:'특히 선택을 미루기보다 기준을 정하는 일이 중요한 배열이에요.',
 healing:'특히 빠른 진전보다 회복과 편안함을 만드는 과정이 먼저예요.',
 reflection:'특히 행동보다 생각과 기준을 정리하는 일이 중심에 있어요.',
 waiting:'특히 기다림과 속도 조절이 크게 잡혀 있어 서두르지 않는 편이 맞아요.',
 distance:'특히 가까워지는 것보다 거리와 경계를 어떻게 다루는지가 중요해요.',
 closure:'특히 기존 방식을 끝내고 정리하는 힘이 강하게 나타납니다.',
 blocked:'특히 현실적인 부담이나 두려움이 흐름을 막는 핵심 조건으로 보여요.',
 conflict:'특히 서로 다른 욕구나 반복되는 충돌을 어떻게 다룰지가 핵심이에요.'
};
export function readingHeadline(slug,picks,situation=''){
 if(!Array.isArray(picks)||!picks.length)return null;
 const supported=['love','reunion','feelings','contact','job','money','work','study'];if(!supported.includes(slug))return null;
 const tags=picks.map(p=>{const card=cards.find(c=>c.id===p.id);return (p.reversed?card.reversedTags:card.tags)[0];});
 const signals=spreadSignals(slug,picks),dominant=signals.ranked[0]?.[0]||tags[0];
 const difficult=tags.filter(t=>['blocked','conflict','distance','closure'].includes(t)).length;
 const active=tags.filter(t=>['movement','communication','attraction','renewal'].includes(t)).length;
 const mostlyDifficult=difficult>=Math.ceil(tags.length/2),moving=active>=Math.ceil(tags.length/3);
 if(slug==='love'){
  const base=mostlyDifficult?'지금 연애 흐름은 새로운 시작보다 관계 기준과 경계를 정리하는 쪽이 더 강합니다.':moving&&difficult===0?'연애 흐름은 꽤 열려 있습니다. 만남이나 대화가 실제로 움직일 가능성이 있는 배열이에요.':moving?'호감과 기회는 있는데, 애매한 관계나 현실 조건이 발목을 잡을 수 있어요.':'빠른 진전보다 사람을 천천히 보고 내 기준을 세우는 흐름입니다.';
  return (base+' '+(headlineNuance.love[dominant]||'')).trim();
 }
 if(slug==='reunion'){
  const base=mostlyDifficult?'현재 흐름만 보면 재회를 밀어붙이기보다 정리와 거리두기 쪽이 더 강합니다.':moving&&difficult===0?'재회 가능성은 닫혀 있지 않습니다. 실제 대화나 재접촉으로 이어질 여지가 있는 배열이에요.':moving?'마음이나 연결의 여지는 남아 있지만, 지금 그대로 다시 만나면 같은 문제가 반복될 가능성이 큽니다.':'그리움은 남아 있어도 실제 재접촉으로 이어질 힘은 아직 약한 편입니다.';
  return withHeadlineContext(slug,situation,(base+' '+(headlineNuance.reunion[dominant]||'')).trim());
 }
 if(slug==='feelings'){
  const warm=tags.filter(t=>['attraction','communication','movement','healing','renewal'].includes(t)).length;
  const guarded=tags.filter(t=>['distance','blocked','conflict','closure','waiting'].includes(t)).length;
  const base=guarded>=2&&warm===0?'카드 흐름으로 보면 지금 상대는 호감 표현보다 거리두기와 자기 상황 정리에 더 기울어 있습니다.':warm>=2&&guarded===0?'카드 흐름으로 보면 호감이나 관심은 있는 편이고, 대화나 행동으로 드러날 여지도 있습니다.':warm>=1&&guarded>=1?'마음이나 관심은 남아 있지만, 부담이나 망설임 때문에 적극적으로 움직이기는 어려운 상태로 읽혀요.':'상대가 아예 무관심한 쪽보다는 아직 판단하고 지켜보는 쪽에 가깝습니다. 행동은 천천히 나올 수 있어요.';
  const nuance={movement:'특히 이번 배열은 생각보다 행동으로 드러나는지가 핵심이에요.',communication:'말을 걸고 반응을 이어가는 힘이 다른 신호보다 더 두드러집니다.',attraction:'끌림은 보이지만 호감과 관계 의지는 구분해서 볼 필요가 있어요.',renewal:'상대를 바라보는 방식이나 관계의 접근법이 바뀌는 흐름이 강합니다.',healing:'강한 표현보다 편안함과 회복을 원하는 마음이 더 앞설 수 있어요.',decision:'상대도 이 관계를 어떻게 둘지 판단하려는 흐름이 강합니다.',reflection:'행동보다 혼자 생각하고 정리하는 시간이 길어질 수 있어요.',waiting:'먼저 움직이기보다 상황과 반응을 지켜보는 쪽에 힘이 실립니다.',distance:'가까워지는 것보다 자기 공간을 지키려는 흐름이 더 선명해요.',closure:'현재는 관계를 이어가는 마음보다 정리와 선 긋기 쪽을 더 크게 봐야 해요.',blocked:'마음이 있더라도 현실적인 부담이 행동을 막는 배열에 가깝습니다.',conflict:'호감과 부담이 함께 있어 태도가 들쭉날쭉하게 보일 수 있어요.'}[dominant]||'';
  return withHeadlineContext(slug,situation,(base+' '+nuance).trim());
 }
 if(slug==='contact'){
  const contactHeadline={
   movement:'연락 흐름에는 실제 움직임이 있습니다. 기다리기만 하는 배열보다는 작은 접촉이나 반응이 생길 여지가 더 커요.',
   communication:'이번 배열의 중심은 대화입니다. 연락이 다시 열린다면 짧더라도 주고받는 흐름으로 나타날 가능성이 있어요.',
   attraction:'관심이나 신경 쓰이는 마음은 남아 있지만, 그것이 바로 연락 행동으로 이어진다고 보기는 아직 일러요.',
   renewal:'예전 방식 그대로가 아니라 새로운 계기나 다른 말투로 대화가 다시 열릴 가능성이 보입니다.',
   decision:'연락을 할지 말지 상대가 판단을 굳히는 과정이 핵심으로 보여요. 한 번의 신호보다 결정 뒤 행동을 보는 편이 맞습니다.',
   healing:'지금은 연락 재개보다 감정과 상황을 가라앉히는 흐름이 먼저예요. 대화는 그 뒤에 열릴 가능성이 큽니다.',
   reflection:'생각은 이어지고 있지만 행동 속도는 느립니다. 연락 여부보다 혼자 정리하는 시간이 더 길 수 있어요.',
   waiting:'이번 배열은 먼저 움직이기보다 기다리고 지켜보는 힘이 강합니다. 빠른 연락을 기대하기에는 정체 신호가 있어요.',
   distance:'현재는 연락보다 거리 유지 쪽이 더 강합니다. 상대의 공간과 실제 반응을 존중해서 보는 편이 맞아요.',
   closure:'연락을 다시 잇는 것보다 대화를 정리하거나 관계의 선을 분명히 하는 흐름이 더 크게 보입니다.',
   blocked:'연락하고 싶은 마음과 별개로 현실적인 부담이나 두려움이 행동을 막고 있어요. 막힘이 풀리는지가 먼저입니다.',
   conflict:'연락 욕구와 부담이 충돌하고 있어 가까워졌다 멀어지는 패턴이 나올 수 있습니다. 한 번의 메시지보다 일관성을 보세요.'
  };
  return withHeadlineContext(slug,situation,contactHeadline[dominant]||'연락 흐름은 한 방향으로 단정하기보다 상대의 실제 반응과 현재의 거리를 함께 봐야 하는 배열입니다.');
 }
 if(slug==='job'){
  const base=mostlyDifficult?'지금은 지원 수를 늘리기보다 준비의 구멍을 먼저 메우는 쪽이 유리합니다.':moving&&difficult===0?'지금은 준비만 더 하기보다 실제 지원으로 넘어가도 좋은 흐름입니다.':moving?'기회는 열려 있지만, 한 가지 보완점이 결과를 크게 좌우할 수 있어요.':'서두르기보다 방향을 정리한 뒤 지원하는 편이 유리합니다.';
  return (base+' '+(headlineNuance.job[dominant]||'')).trim();
 }
 if(slug==='money')return mostlyDifficult?'지금 금전 흐름은 늘리기보다 새는 돈을 막는 쪽이 우선입니다.':moving&&difficult===0?'돈의 흐름을 바꿀 여지는 있습니다. 다만 들어오는 돈만큼 관리 기준도 같이 세워야 해요.':moving?'들어오는 것과 나가는 것이 함께 커질 수 있어 관리가 핵심입니다.':'큰 변화보다 예산을 정리하고 지키는 쪽이 맞는 흐름입니다.';
 if(slug==='work')return mostlyDifficult?'지금 직장에서는 버티는 힘보다 구조적인 부담을 줄이는 게 먼저입니다.':moving&&difficult===0?'업무나 커리어를 실제로 움직여볼 만한 흐름입니다. 역할 변화나 이직 준비도 현실적으로 검토해볼 수 있어요.':moving?'변화의 기회는 있지만, 현재의 부담을 그대로 안고 움직이면 피로가 반복될 수 있어요.':'큰 결정보다 내가 원하는 업무 조건부터 선명하게 만드는 게 먼저입니다.';
 return mostlyDifficult?'지금은 공부량을 더 늘리기보다 집중을 깨는 원인부터 줄이는 게 우선입니다.':moving&&difficult===0?'공부 흐름은 살아 있습니다. 계획보다 실제 문제 풀이와 복습으로 밀어붙여도 좋은 때예요.':moving?'의욕은 있는데 집중을 끊는 요소가 함께 보여요. 루틴 하나만 바로잡아도 체감이 달라질 수 있어요.':'새 계획을 늘리기보다 지금 방식이 왜 안 굴러가는지 먼저 점검하는 편이 좋아요.';
}
const timingScores={movement:3,communication:3,attraction:2,renewal:2,decision:1,healing:1,reflection:0,conflict:-1,waiting:-2,distance:-2,closure:-2,blocked:-3};
const majorTimingWeight={'major-0':.7,'major-1':1.1,'major-2':-.8,'major-6':.3,'major-7':1.3,'major-9':-1.2,'major-10':.7,'major-12':-1.6,'major-13':-.5,'major-14':-.7,'major-16':.6,'major-17':-.1,'major-18':-.8,'major-19':.9,'major-20':.5,'major-21':-.2};
const suitTimingWeight={wands:.8,swords:.3,cups:0,pentacles:-.7};
const rankTimingWeight={Ace:.5,Two:.2,Three:.1,Four:-.2,Five:0,Six:.1,Seven:-.3,Eight:.6,Nine:-.2,Ten:-.3,Page:.2,Knight:.5,Queen:-.1,King:0};
function cardTimingWeight(card,reversed=false){
 let value=card.arcana==='major'?(majorTimingWeight[card.id]??0):(suitTimingWeight[card.suit]??0)+(rankTimingWeight[card.rank]??0);
 if(reversed)value-=.65;return value;
}
function primaryTags(picks){return picks.map(p=>{const card=cards.find(c=>c.id===p.id);return (p.reversed?card.reversedTags:card.tags)[0];});}
export function timingInsight(slug,picks){
 const supported=['love','reunion','contact','reunion-timing','job','money','work','study'];
 if(!supported.includes(slug)||!Array.isArray(picks)||!picks.length)return null;
 const items=picks.map(p=>{const card=cards.find(c=>c.id===p.id),tag=(p.reversed?card.reversedTags:card.tags)[0],weight=cardTimingWeight(card,p.reversed);return {card,tag,weight,score:(timingScores[tag]??0)+weight};});
 const tags=items.map(x=>x.tag),score=items.reduce((sum,x)=>sum+x.score,0)/items.length;
 const pace=score>=1.8?'fast':score>=.2?'medium':score>=-1.2?'slow':'stalled';
 const ranges={
  love:{fast:'2~6주',medium:'1~3개월',slow:'3~6개월',stalled:'당분간 정체'},
  reunion:{fast:'2~6주',medium:'1~3개월',slow:'3~6개월',stalled:'당분간 정체'},
  contact:{fast:'1~4주',medium:'1~2개월',slow:'2~4개월',stalled:'당분간 정체'},
  'reunion-timing':{fast:'2~6주',medium:'1~3개월',slow:'3~6개월',stalled:'당분간 정체'},
  job:{fast:'2~8주',medium:'1~3개월',slow:'3~6개월',stalled:'준비 정리가 먼저'},
  money:{fast:'2~6주',medium:'1~3개월',slow:'3~6개월',stalled:'지출 정리가 먼저'},
  work:{fast:'2~8주',medium:'1~3개월',slow:'3~6개월',stalled:'조건 정리가 먼저'},
  study:{fast:'1~3주',medium:'3~8주',slow:'2~4개월',stalled:'루틴 정리가 먼저'}
 };
 const labels={fast:'빠른 편',medium:'보통',slow:'천천히',stalled:'정체'};
 const copy={
  love:{
   fast:'소개, 연락, 만남 제안처럼 작은 계기가 먼저 들어오기 쉬운 흐름이에요. 관계가 실제로 자리 잡는 건 첫 계기보다 조금 더 시간을 두고 보는 편이 맞습니다.',
   medium:'갑자기 확 들어오기보다 대화나 지인 연결처럼 가벼운 접점이 쌓이면서 연애 흐름이 열리는 쪽에 가깝습니다.',
   slow:'사람이 들어오는 것보다 내 기준과 생활이 먼저 정리되는 흐름이에요. 서두르기보다 몇 달 단위로 보는 편이 자연스럽습니다.',
   stalled:'지금은 새로운 관계를 밀어붙이는 시기라기보다 애매한 관계와 내 기준을 정리하는 쪽이 더 강합니다.'
  },
  reunion:{
   fast:'연락, 답장 재개, 우연한 접점 같은 첫 움직임은 비교적 빨리 나타날 수 있어요. 실제 재회로 자리 잡는지는 그 뒤의 행동과 대화를 더 봐야 합니다.',
   medium:'생각은 남아 있어도 바로 행동으로 옮겨지기보다 한두 번의 접점을 거쳐 관계가 움직이는 흐름에 가깝습니다.',
   slow:'재접촉보다 감정 정리와 현실 조건 변화가 먼저 필요한 배열이에요. 몇 달 안에 조건이 달라지는지를 보는 편이 맞습니다.',
   stalled:'현재는 연락 시기보다 막고 있는 문제를 푸는 게 먼저예요. 같은 상태라면 기다림만 길어질 가능성이 큽니다.'
  },
  contact:{
   fast:'짧은 안부나 답장처럼 작은 연락 신호가 먼저 나타나기 쉬운 속도예요.',
   medium:'바로 연락이 오기보다 생각과 상황이 정리된 뒤 대화가 다시 열리는 흐름에 가깝습니다.',
   slow:'연락 자체보다 서로의 거리와 상황 변화가 먼저 필요한 흐름입니다.',
   stalled:'연락 시기를 기다리기보다 지금 대화가 막힌 이유를 먼저 보는 편이 맞습니다.'
  },
  'reunion-timing':{
   fast:'관계가 다시 움직인다면 연락이나 우연한 접점 같은 작은 계기가 먼저 보이기 쉬운 속도예요.',
   medium:'한 번의 계기보다 상황이 정리된 뒤 서서히 대화가 열리는 흐름에 가깝습니다.',
   slow:'감정이나 현실 조건이 충분히 달라진 뒤에야 움직일 수 있는 흐름이에요.',
   stalled:'날짜를 세기보다 지금 재회를 막는 조건이 실제로 바뀌는지를 먼저 확인해야 하는 배열입니다.'
  },
  job:{
   fast:'지원, 면접, 연락처럼 눈에 보이는 움직임을 만들기 좋은 속도예요. 준비만 더 하기보다 실제 지원을 병행하는 편이 맞습니다.',
   medium:'한두 번의 지원보다 포트폴리오와 면접 준비를 다듬으면서 기회가 연결되는 흐름입니다.',
   slow:'방향이나 준비물을 다시 정리한 뒤 움직이는 편이 유리해요. 몇 달 단위로 전략을 보는 흐름입니다.',
   stalled:'지원 숫자를 늘리기 전에 지금 막히는 준비 한 가지를 먼저 해결해야 속도가 붙습니다.'
  },
  money:{
   fast:'정산, 급여, 추가 수입처럼 돈의 움직임이 비교적 빨리 보일 수 있어요. 다만 들어오는 흐름과 지출 증가가 함께 오는지도 봐야 합니다.',
   medium:'한 번의 큰돈보다 수입 구조나 지출 습관이 몇 달에 걸쳐 서서히 달라지는 흐름에 가깝습니다.',
   slow:'금전 상황이 갑자기 뒤집히기보다 고정비와 소비 구조를 정리하면서 천천히 체감이 나아지는 흐름입니다.',
   stalled:'돈이 들어오기를 기다리기보다 새는 돈과 묶인 비용을 먼저 정리해야 흐름이 바뀌는 배열입니다.'
  },
  work:{
   fast:'역할 변화, 면담, 이직 준비처럼 커리어를 움직이는 계기가 비교적 빨리 생길 수 있어요.',
   medium:'당장 퇴사나 이동보다 성과와 준비를 쌓으면서 선택지가 넓어지는 흐름입니다.',
   slow:'업무 구조와 내 조건을 몇 달에 걸쳐 정리한 뒤 변화가 현실화되는 쪽에 가깝습니다.',
   stalled:'움직이기 전에 현재 직장에서 무엇이 문제인지부터 분명히 해야 합니다.'
  },
  study:{
   fast:'공부법을 바꾸면 몇 주 안에도 집중도나 문제 풀이 체감이 달라질 수 있는 흐름이에요.',
   medium:'한두 번의 몰입보다 몇 주간 루틴을 유지했을 때 결과가 따라오는 흐름입니다.',
   slow:'기초나 생활 리듬을 다시 만드는 시간이 필요해 보여요. 단기간 성과보다 누적을 보는 편이 맞습니다.',
   stalled:'공부량을 늘리기 전에 집중을 깨는 환경이나 피로부터 정리해야 흐름이 살아납니다.'
  }
 };
 const ordered=[...items].sort((a,b)=>b.weight-a.weight),fastest=ordered[0],slowest=ordered.at(-1);
 const basis=fastest.weight>=.7&&slowest.weight<=-.7?`${withParticle(fastest.card.koreanName,'이/가')} 속도를 올리는 반면 ${withParticle(slowest.card.koreanName,'이/가')} 흐름을 늦춰, 두 카드 사이의 균형까지 반영했어요.`:fastest.weight>=.7?`${fastest.card.koreanName}처럼 빠르게 움직이는 카드가 전체 시기를 조금 앞당기는 쪽으로 반영됐어요.`:slowest.weight<=-.7?`${slowest.card.koreanName}처럼 천천히 진행되는 카드가 있어, 결과보다 준비와 정리 시간을 더 길게 잡았어요.`:'카드들의 기본 속도가 크게 엇갈리지 않아 전체 배열의 흐름을 중심으로 시기를 잡았어요.';
 return {label:labels[pace],range:ranges[slug][pace],text:copy[slug][pace],pace,basis,score:Number(score.toFixed(2))};
}
const actionScenes={
 love:{movement:'마음에 드는 사람이 있다면 기다리기만 하지 말고 가벼운 대화나 한 번의 만남 제안을 만들어보세요.',communication:'애매한 연락을 해석하기보다 내가 궁금한 것을 하나만 명확하게 물어보세요.',attraction:'설렘이 큰 만큼 실제로 편안한 사람인지 한 번 더 확인해보세요.',renewal:'평소와 다른 모임이나 동선 하나를 추가해 새로운 접점을 만들어보세요.',decision:'내가 원하는 관계의 기준 세 가지를 적고, 지금 관계가 거기에 맞는지 보세요.',healing:'새 사람을 찾기 전에 내 컨디션과 일상을 회복하는 약속 하나를 먼저 잡아보세요.',reflection:'과거 연애에서 반복된 패턴 하나를 적고 이번에는 어떻게 다르게 할지 정해보세요.',waiting:'연락을 기다리는 시간을 정해두고 그 밖의 시간은 내 일정으로 채워보세요.',distance:'상대의 반응이 계속 희미하다면 내가 먼저 쫓아가는 횟수를 줄여보세요.',closure:'끝난 관계나 애매한 썸을 붙잡게 하는 행동 하나를 멈춰보세요.',blocked:'지금 막는 현실 조건이 무엇인지 하나만 특정해서 해결 가능 여부를 확인해보세요.',conflict:'호감보다 서로 원하는 관계 방식이 같은지 먼저 확인해보세요.'},
 reunion:{movement:'연락을 한다면 감정 확인보다 가볍고 답하기 쉬운 안부 한 번으로 시작하세요.',communication:'하고 싶은 말을 길게 보내기보다 꼭 확인할 한 가지를 짧게 말해보세요.',attraction:'그리움과 다시 만나도 괜찮은 관계인지를 분리해서 생각해보세요.',renewal:'예전과 달라진 행동을 하나 만들지 못한다면 연락보다 준비가 먼저예요.',decision:'다시 만날 조건과 다시 만나지 않을 조건을 각각 두 가지씩 적어보세요.',healing:'감정이 올라올 때 바로 연락하지 말고 하루 정도 두고 다시 읽어보세요.',reflection:'헤어진 이유를 한 문장으로 정리하고 지금 그 문제가 실제로 달라졌는지 확인해보세요.',waiting:'언제까지 기다릴지 내 쪽의 기한을 정해 무기한 대기를 막아보세요.',distance:'차단이나 명확한 거절이 있다면 추가 접촉을 멈추고 거리를 존중하세요.',closure:'재회를 원해서가 아니라 외로워서 붙잡는 부분이 있는지 확인해보세요.',blocked:'재회를 막는 가장 현실적인 문제 하나를 해결할 수 있는지부터 보세요.',conflict:'같은 싸움이 반복됐다면 연락 전에 해결 방식부터 바꿀 수 있는지 생각해보세요.'},
 feelings:{movement:'상대의 마음을 더 추측하기보다 실제로 먼저 다가오거나 약속을 잡는 행동이 있는지 한 번 지켜보세요.',communication:'애매한 말의 뜻을 혼자 해석하지 말고 확인할 수 있는 질문 하나만 가볍게 꺼내보세요.',attraction:'호감처럼 느껴지는 신호가 있어도 나를 편하게 존중하는 행동이 함께 있는지 확인해보세요.',renewal:'예전과 다른 태도가 보인다면 한 번의 변화보다 그 방식이 며칠 이상 이어지는지 보세요.',decision:'상대의 결론을 대신 예상하기보다 내가 받아들일 수 있는 관계의 기준 두 가지를 먼저 정해보세요.',healing:'지금은 답을 재촉하기보다 서로 편하게 대화할 수 있는 거리와 속도를 만들어보세요.',reflection:'연락 빈도나 말투를 반복해서 분석하기보다 확인된 행동과 내가 추측한 부분을 따로 적어보세요.',waiting:'상대 반응을 기다리는 시간을 정해두고 그 밖의 시간에는 내 일정으로 돌아오세요.',distance:'상대가 거리를 두는 행동을 보인다면 이유를 추궁하기보다 그 공간을 존중하고 내 기준도 지켜보세요.',closure:'정리 신호가 반복된다면 숨은 마음을 찾기보다 지금 관계가 나에게 어떤 상태인지 먼저 받아들여보세요.',blocked:'마음이 있어 보이더라도 행동을 막는 현실 조건이 무엇인지 실제로 확인 가능한 것만 보세요.',conflict:'가까워졌다 멀어지는 태도가 반복된다면 한 번의 다정함보다 행동의 일관성을 기준으로 보세요.'},
 contact:{movement:'연락 흐름이 움직이는 카드라면 기다리는 것만 반복하지 말고 내가 먼저 연락할 이유가 분명한지도 한 번 정리해보세요.',communication:'연락한다면 길게 설명하기보다 상대가 답하기 쉬운 한 가지 이야기로 대화를 열어보세요.',attraction:'그리움이나 관심 때문에 연락을 기대하는 건지, 실제로 다시 대화할 이유가 있는지 분리해서 생각해보세요.',renewal:'다시 연락한다면 예전 대화를 그대로 이어가기보다 지금 상황에 맞는 새로운 안부로 시작해보세요.',decision:'연락을 기다릴 기한과 내가 먼저 움직일 조건을 각각 하나씩 정해 무기한 대기를 막아보세요.',healing:'답장을 확인하는 횟수를 줄이고 오늘 내 일상에서 회복할 시간을 먼저 확보해보세요.',reflection:'왜 연락이 끊겼는지 추측 목록을 늘리기보다 마지막으로 확인된 대화와 행동만 다시 보세요.',waiting:'기다리는 동안 추가 메시지를 연달아 보내지 말고 상대가 반응할 여백을 남겨보세요.',distance:'상대가 명확히 거리를 두거나 답을 원하지 않는다면 추가 접촉을 멈추고 그 경계를 존중하세요.',closure:'오래 끊긴 대화라면 답장을 받는 것보다 내가 이 관계를 계속 기다릴 이유가 있는지 먼저 정리해보세요.',blocked:'연락을 막는 현실적인 문제를 하나 특정하고 그 조건이 바뀔 수 있는지부터 보세요.',conflict:'연락했다가 다시 멀어지는 패턴이 있다면 메시지 한 번보다 반복되는 갈등의 방식을 먼저 바꿀 수 있는지 생각해보세요.'},
 job:{movement:'오늘 안에 지원할 공고 하나를 정하고 이력서를 실제로 제출해보세요.',communication:'면접에서 말할 대표 경험 하나를 1분 답변으로 만들어 소리 내어 연습해보세요.',reflection:'지원 직무에 맞지 않는 경험은 덜고 핵심 경험 세 개만 남겨보세요.',healing:'하루 정도 취준 시간을 줄이고 수면과 컨디션을 회복해 다음 지원 효율을 높여보세요.',decision:'직무, 연봉, 근무방식 중 포기 못할 기준 두 개를 정해보세요.',attraction:'회사 이름보다 채용공고의 실제 업무 세 줄을 기준으로 지원 여부를 보세요.',distance:'지금 역량과 너무 먼 공고만 보고 있다면 한 단계 현실적인 포지션도 함께 넣어보세요.',renewal:'포트폴리오 첫 화면이나 이력서 첫 세 줄을 새로 써보세요.',waiting:'결과를 기다리는 동안 다음 지원 두 곳을 준비해 흐름을 끊지 마세요.',closure:'효율이 낮은 준비 하나를 과감히 접고 그 시간을 핵심 준비에 몰아주세요.',blocked:'가장 미완성인 준비물 하나를 오늘 끝낼 단위로 쪼개보세요.',conflict:'하고 싶은 직무와 현실 조건을 표로 나눠 우선순위를 정해보세요.'},
 money:{movement:'이번 주 안에 고정비 하나를 줄이거나 추가 수입 가능성 하나를 실제로 알아보세요.',communication:'돈이 얽힌 약속이나 정산은 금액과 날짜를 문자로 명확히 확인해두세요.',reflection:'최근 한 달 결제 내역에서 없어도 됐던 지출 세 개를 표시해보세요.',healing:'스트레스 받을 때 쓰는 소비가 있다면 그 상황을 대신할 행동 하나를 정해보세요.',decision:'구매 전 24시간 보류 규칙이나 월 자유지출 상한선을 하나 정해보세요.',attraction:'지금 사고 싶은 물건은 장바구니에만 두고 이틀 뒤 다시 판단해보세요.',distance:'저축·생활비 계좌를 분리해 쓸 수 있는 돈의 경계를 눈에 보이게 만들어보세요.',renewal:'예산 방식을 새로 짜되 항목을 너무 많이 만들지 말고 세 덩어리로 단순화해보세요.',waiting:'큰 구매나 투자 판단은 며칠 미루고 실제 숫자를 다시 확인해보세요.',closure:'안 쓰는 구독이나 자동결제 하나를 오늘 해지해보세요.',blocked:'당장 줄일 수 없는 고정비와 줄일 수 있는 지출을 따로 적어보세요.',conflict:'사고 싶은 것과 모아야 할 목표를 같은 화면에 적고 우선순위를 정해보세요.'},
 work:{movement:'이번 주 안에 역할 조정, 면담, 이직 준비 중 하나를 실제 일정에 넣어보세요.',communication:'상사나 동료에게 애매한 업무 하나의 책임 범위와 마감일을 명확히 확인해보세요.',reflection:'회사 전체가 싫은지 특정 업무나 사람 때문에 힘든지 항목을 나눠 적어보세요.',healing:'퇴근 후 업무 알림을 끄는 시간대를 정해 회복 시간을 먼저 확보해보세요.',decision:'남을 조건과 떠날 조건을 각각 세 가지로 써보세요.',attraction:'새 회사의 이미지보다 실제 업무량, 연봉, 출퇴근 조건을 비교해보세요.',distance:'불필요한 갈등에는 바로 반응하지 말고 업무 사실만 남기는 방식으로 거리를 두세요.',renewal:'지금 업무에서 자동화하거나 넘길 수 있는 일 하나를 찾아보세요.',waiting:'이직 결과를 기다리는 동안 현재 경력에 남길 성과 하나를 완성해보세요.',closure:'내가 계속 떠안고 있는 불필요한 역할 하나를 정리할 방법을 찾아보세요.',blocked:'가장 크게 막는 구조적 문제를 한 문장으로 쓰고 내가 바꿀 수 있는 범위를 나눠보세요.',conflict:'반복되는 충돌은 사람 평가 대신 업무 기준과 책임 범위로 다시 이야기해보세요.'},
 study:{movement:'오늘 공부를 시작할 시간을 정하고 문제 10개나 복습 30분처럼 바로 끝낼 단위를 잡아보세요.',communication:'모르는 문제 하나를 오늘 바로 질문하거나 해설을 찾아 해결해보세요.',reflection:'틀린 문제를 다시 보며 지식 부족인지 실수인지 이유를 표시해보세요.',healing:'수면이 부족하다면 오늘 공부 한 시간을 줄이고 잠을 먼저 확보해보세요.',decision:'이번 주 가장 중요한 과목 하나를 정하고 공부 시간의 절반을 먼저 배정해보세요.',attraction:'새 교재를 사기 전에 지금 쓰는 교재에서 끝낼 범위를 먼저 정해보세요.',distance:'공부 시간에는 휴대폰을 다른 방에 두거나 앱 차단을 켜보세요.',renewal:'기존 시간표가 안 굴러갔다면 분량 기준으로 루틴을 다시 짜보세요.',waiting:'결과 걱정 대신 오늘 끝낼 분량 하나만 체크해보세요.',closure:'효율이 낮은 공부법 하나를 그만두고 문제풀이·복습 중 하나로 바꿔보세요.',blocked:'완벽하게 시작하려는 마음을 내려놓고 20분짜리 첫 세션부터 열어보세요.',conflict:'놀고 싶은 시간과 공부 시간을 미리 나눠 둘 다 지킬 수 있게 해보세요.'}
};
const actionContextNotes={
 reunion:{recent:'헤어진 직후라면 감정이 올라온 날 바로 보내기보다 하루 정도 두고 다시 판단하세요.',mid:'1~3개월이 지났다면 달라진 행동이 하나라도 있는지 확인한 뒤 움직이세요.',long:'오래 지난 관계라면 예전 대화를 복원하려 하기보다 지금 다시 연락할 현실적인 이유부터 정리하세요.'},
 feelings:{crush:'썸이나 짝사랑이라면 호감 신호보다 상대가 실제로 대화를 이어가는지를 기준으로 보세요.',relationship:'연애 중이라면 마음을 추측하기보다 피로와 갈등을 줄일 대화 하나를 실제로 해보세요.',ex:'전 연인이라면 미련이 있다는 해석만으로 재회 의지까지 있다고 보지는 마세요.'},
 contact:{recent:'며칠의 침묵이라면 추가 메시지를 연달아 보내기보다 반응할 여백을 먼저 주세요.',mid:'1주 이상 끊겼다면 연락을 다시 여는 목적을 한 문장으로 정리한 뒤 움직이세요.',long:'오래 끊긴 연락이라면 예전 친밀함을 전제로 하지 말고 새로운 안부처럼 접근할 수 있는지부터 보세요.'},
 breakup:{conflict:'갈등 중이라면 누가 맞는지보다 같은 싸움을 반복하지 않을 규칙 하나를 정해보세요.',distance:'거리감이 주제라면 억지로 분위기를 띄우기보다 멀어진 원인을 하나씩 확인해보세요.',considering:'이별을 고민 중이라면 계속 만날 조건과 멈출 조건을 각각 적어보세요.'}
};
export function nextAction(slug,picks,situation=''){
 const supported=Object.keys(actionScenes);if(!supported.includes(slug)||!Array.isArray(picks)||!picks.length)return null;
 const signals=spreadSignals(slug,picks),tag=signals.ranked[0]?.[0];
 const base=actionScenes[slug][tag]||generalAdvice(cards.find(c=>c.id===picks[0].id),picks[0].reversed);
 const context=actionContextNotes[slug]?.[situation];
 return context?base+' '+context:base;
}
const exactCombinationRules=[
 {ids:['major-6','major-15'],priority:100,text:{relationship:'끌림은 강하지만 집착이나 불균형이 함께 커질 수 있어요. 좋아하는 마음의 크기보다 서로를 편안하게 존중할 수 있는 관계인지가 핵심입니다.',practical:'매력적인 선택이 보여도 욕심이나 압박 때문에 기준이 흐려질 수 있어요. 지금 원하는 것과 실제로 감당할 수 있는 조건을 분리해서 보세요.'}},
 {ids:['major-16','major-17'],priority:98,text:{relationship:'한 번 크게 흔들린 뒤에도 회복의 여지는 남아 있어요. 다만 예전으로 돌아가는 것보다 무너진 신뢰나 기대를 새 방식으로 다시 세워야 합니다.',practical:'기존 계획이 흔들린 뒤 오히려 방향을 다시 잡을 여지가 보여요. 실패를 복구하는 데만 매달리기보다 새 기준으로 재정비하는 편이 낫습니다.'}},
 {ids:['major-20','cups-6'],priority:96,text:{relationship:'과거를 다시 돌아보는 힘이 강한 조합이에요. 추억이나 미련이 재접촉의 계기가 될 수 있지만, 실제 재회는 예전 문제에 대한 새로운 판단이 있어야 이어집니다.',practical:'예전 경험이나 익숙한 선택을 다시 꺼내볼 수 있어요. 과거 방식을 그대로 복원하기보다 지금 기준으로 다시 평가하는 게 중요합니다.'}},
 {ids:['major-18','swords-7'],priority:95,text:{relationship:'모호함과 회피가 겹쳐 있어 상대의 작은 신호를 크게 해석하기 쉬운 조합이에요. 숨은 마음을 추측하기보다 실제 말과 행동이 확인될 때까지 결론을 늦추는 편이 맞습니다.',practical:'정보가 불완전한 상태에서 우회하거나 눈치로 판단하기 쉬워요. 중요한 선택은 추측이 아니라 확인 가능한 자료를 기준으로 하세요.'}},
 {ids:['major-19','cups-2'],priority:94,text:{relationship:'호감과 상호 반응이 비교적 분명하게 이어지는 조합이에요. 관계가 움직인다면 한쪽의 독주보다 서로 응답하고 만나는 장면으로 나타날 가능성이 큽니다.',practical:'분명한 성과와 협력이 같이 보이는 조합이에요. 혼자 밀기보다 상대와 조건을 맞출 때 흐름이 더 잘 살아납니다.'}},
 {ids:['major-9','major-12'],priority:92,text:{relationship:'생각은 깊지만 실제 움직임은 느린 조합이에요. 마음을 정리하는 시간이 길어질 수 있어 연락이나 관계 진전을 재촉할수록 더 멈춰 보일 수 있습니다.',practical:'당장 결과를 내기보다 관점과 방향을 다시 잡는 시간이 필요한 조합이에요. 억지로 속도를 내기보다 막힌 이유를 먼저 정리하세요.'}},
 {ids:['major-10','pentacles-1'],priority:90,text:{relationship:'환경 변화가 새로운 만남이나 관계의 현실적인 계기로 이어질 수 있어요. 우연한 기회가 생기더라도 실제 약속과 행동으로 이어지는지를 보세요.',practical:'변화의 타이밍과 현실적인 기회가 함께 잡히는 조합이에요. 제안, 공고, 계약, 수입원처럼 손에 잡히는 선택이 보이면 실제 조건을 확인해볼 만합니다.'}},
 {ids:['major-1','wands-1'],priority:88,text:{relationship:'호감이나 생각을 실제 행동으로 옮기는 힘이 강한 조합이에요. 기다리기보다 대화나 제안처럼 작은 시작을 만드는 쪽이 흐름에 맞습니다.',practical:'아이디어를 실행으로 옮기기 좋은 조합이에요. 준비만 늘리기보다 지금 가능한 첫 행동 하나를 시작하는 게 중요합니다.'}},
 {ids:['major-13','major-21'],priority:86,text:{relationship:'한 관계 방식의 종료와 완성이 겹쳐 있어요. 다시 이어가더라도 예전 모습 그대로는 어렵고, 완전히 새 관계로 갈 수 있는지가 핵심입니다.',practical:'끝낼 것과 다음 단계로 가져갈 것이 분명해지는 조합이에요. 오래 끌던 일을 정리해야 새 선택에 자리가 생깁니다.'}}
];
const semanticCombinationRules={
 'attraction|communication':{relationship:'호감이 말과 반응으로 이어질 가능성이 있어요. 설렘만 있는 배열보다 실제 대화가 열릴 여지가 더 강하지만, 한두 번의 연락보다 서로 이어가려는 반응을 확인하세요.',practical:'관심과 소통이 같이 움직여요. 제안이나 협업 기회가 있다면 말로만 두지 말고 구체적인 조건을 확인해보세요.'},
 'attraction|blocked':{relationship:'끌림은 있는데 부담이나 현실 조건 때문에 행동이 막히는 조합이에요. 마음이 있다는 해석과 실제로 관계를 시작할 수 있다는 해석은 나눠서 봐야 합니다.',practical:'하고 싶은 선택은 분명하지만 현실 제약이 발목을 잡고 있어요. 욕심을 줄이기보다 무엇이 실제 병목인지 하나를 특정하는 게 먼저입니다.'},
 'communication|distance':{relationship:'연락 가능성과 거리감이 동시에 보여요. 대화가 다시 열려도 바로 가까워진다고 보기보다, 서로의 경계와 반응을 확인하는 단계로 읽는 편이 맞습니다.',practical:'대화는 필요하지만 서로의 입장이나 조건 차이가 커 보여요. 합의 가능한 범위를 먼저 좁혀야 합니다.'},
 'communication|renewal':{relationship:'예전과 다른 방식의 대화가 흐름을 바꿀 수 있는 조합이에요. 같은 말을 반복하기보다 지금 상황에 맞는 새로운 접근이 중요합니다.',practical:'새 방식이나 새 제안을 말로 구체화할 때 변화가 시작될 수 있어요. 아이디어를 일정·역할·숫자로 바꿔보세요.'},
 'movement|conflict':{relationship:'관계는 움직일 수 있지만 동시에 부딪힐 요소도 커요. 연락이나 만남 자체보다 움직인 뒤 같은 갈등을 다시 반복하는지가 더 중요한 배열입니다.',practical:'행동력은 있는데 마찰도 큰 조합이에요. 속도를 올리기 전에 책임 범위와 기준을 맞추지 않으면 일이 더 꼬일 수 있습니다.'},
 'movement|waiting':{relationship:'가까워지려는 힘과 멈춰 있는 힘이 같이 있어 속도가 들쭉날쭉할 수 있어요. 한 번의 적극적인 행동 뒤 다시 조용해지는 패턴도 가능합니다.',practical:'시작하려는 힘은 있지만 결과가 바로 따라오지는 않을 수 있어요. 행동은 하되 기다리는 기간에 다음 준비를 이어가는 편이 좋습니다.'},
 'movement|reflection':{relationship:'생각만 하던 상태에서 실제 행동으로 넘어갈 수 있는 조합이에요. 다만 충동적으로 움직이기보다 무엇을 확인하고 싶은지 정한 뒤 행동하는 게 좋아요.',practical:'검토와 실행이 연결되는 흐름이에요. 충분히 생각했다면 작은 실험이나 지원처럼 현실 행동으로 옮겨볼 때입니다.'},
 'renewal|closure':{relationship:'다시 시작하려면 먼저 끝내야 할 방식이 있다는 조합이에요. 재회든 새 연애든 예전 패턴을 그대로 들고 가서는 같은 장면이 반복될 가능성이 큽니다.',practical:'새 기회를 잡기 전에 오래 끌던 방식이나 비용을 정리해야 해요. 정리 자체가 다음 흐름을 여는 행동이 됩니다.'},
 'healing|attraction':{relationship:'끌림은 있지만 급하게 관계를 정의하기보다 편안함과 신뢰가 먼저 자라는 조합이에요. 강한 자극보다 오래 편한 사람이 더 중요할 수 있습니다.',practical:'흥미로운 기회가 보여도 컨디션과 지속 가능성을 같이 봐야 해요. 무리해서 잡기보다 오래 이어갈 수 있는 선택이 유리합니다.'},
 'blocked|distance':{relationship:'지금은 마음보다 거리와 막힘이 더 강한 조합이에요. 상대를 더 밀어붙이는 것보다 왜 관계가 멈췄는지 현실적인 이유를 보는 게 먼저입니다.',practical:'조건 자체가 막혀 있고 선택지도 좁게 느껴질 수 있어요. 같은 방식으로 더 힘을 쓰기보다 환경이나 전략을 바꿀 필요가 있습니다.'},
 'closure|healing':{relationship:'정리와 회복이 같이 나와 있어요. 관계를 붙잡는 것보다 상처를 덜어내는 과정이 먼저일 수 있고, 그 뒤에야 다음 선택이 선명해질 가능성이 큽니다.',practical:'끝낼 일을 끝내면서 여유가 돌아오는 흐름이에요. 손실을 만회하려 애쓰기보다 부담을 줄이는 선택이 장기적으로 도움이 됩니다.'},
 'conflict|healing':{relationship:'상처와 회복 가능성이 함께 있어요. 갈등을 없던 일로 덮기보다 실제로 다룰 수 있을 때 관계의 온도가 달라질 수 있습니다.',practical:'문제가 분명하지만 회복 여지도 있어요. 원인을 사람 탓으로만 두지 않고 구조나 방식 하나를 바꾸면 체감이 달라질 수 있습니다.'},
 'decision|conflict':{relationship:'좋아하는 마음만으로 넘기기 어려운 차이가 드러나는 조합이에요. 계속 갈지보다 어떤 조건까지는 받아들일 수 있는지 결정해야 합니다.',practical:'서로 충돌하는 조건 중 무엇을 우선할지 정해야 해요. 모든 걸 동시에 만족시키려 하면 결정만 늦어질 수 있습니다.'}
};
function pairKey(a,b){return [a,b].sort().join('|');}
export function combinationInsights(slug,picks){
 if(!Array.isArray(picks)||picks.length<2||['today','yes-no'].includes(slug))return [];
 const mode=['job','money','work','study'].includes(slug)?'practical':'relationship';
 const items=picks.map((pick,index)=>{const card=cards.find(c=>c.id===pick.id);if(!card)throw new Error('Unknown card');return {pick,index,card,tag:(pick.reversed?card.reversedTags:card.tags)[0],position:readings[slug]?.positions[index]?.label||`${index+1}번째 카드`};});
 const found=[];
 for(let i=0;i<items.length;i++)for(let j=i+1;j<items.length;j++){
  const a=items[i],b=items[j],ids=[a.card.id,b.card.id];
  const exact=exactCombinationRules.find(rule=>rule.ids.every(id=>ids.includes(id)));
  const semantic=semanticCombinationRules[pairKey(a.tag,b.tag)];
  const rule=exact||semantic;
  if(!rule)continue;
  const text=rule.text?.[mode]||rule[mode];if(!text)continue;
  found.push({priority:exact?.priority||60-i-j,title:`${a.card.koreanName} × ${b.card.koreanName}`,positions:`${a.position} + ${b.position}`,text:`‘${a.position}’의 ${a.card.koreanName}, 그리고 ‘${b.position}’의 ${b.card.koreanName}. 두 카드를 같이 보면, ${text}`});
 }
 found.sort((a,b)=>b.priority-a.priority);
 const unique=[];for(const insight of found){if(unique.some(x=>x.title===insight.title||x.text===insight.text))continue;unique.push(insight);if(unique.length===2)break;}
 return unique;
}
export function interpret(slug,pick,index){
 const card=cards.find(c=>c.id===pick.id),position=readings[slug]?.positions[index];
 if(!card||!position)throw new Error('Unknown card or position');
 const [opening,closing]=positionVoices[slug][index];
 const meaning=`${opening.replace(/에는$/, '에서 살펴볼 주제는')} ‘${card.keywords.join(' · ')}’입니다. ${pick.reversed?card.reversed:card.upright}로 읽을 수 있어요.`;
 const context=slug==='yes-no'?`${generalAdvice(card,pick.reversed)} ${closing}`:pick.reversed?`${card.advice} ${closing}`:`${card[position.field]} ${closing}`;
 const example=situationExample(slug,pick,index);
 return {card,position,meaning,context,example,lens:position.lens,caution:null};
}
const everydayAdvice={
 movement:'시작하기 전에 목적과 감당할 수 있는 속도를 정해보세요.',
 communication:'필요한 정보를 묻고, 이해한 내용을 다시 확인해보세요.',
 reflection:'확인한 사실과 내가 추측한 것을 따로 적어보세요.',
 healing:'무리한 목표보다 편안한 일상을 회복하는 작은 일을 골라보세요.',
 decision:'선택의 기준을 두세 가지로 정한 뒤 현실의 조건과 비교해보세요.',
 attraction:'끌리는 이유를 살피고, 잠깐의 설렘 뒤에도 필요한 일인지 생각해보세요.',
 distance:'지금 내 시간과 에너지를 지키기 위해 필요한 경계를 정해보세요.',
 renewal:'이전 방식을 그대로 반복하기보다 바꿔볼 부분 하나를 찾아보세요.',
 waiting:'기다리는 동안 확인할 조건과 다시 판단할 시점을 정해보세요.',
 closure:'마무리할 일과 다음에 가져갈 것을 구분해보세요.',
 blocked:'부담을 키우는 조건을 찾아 지금 줄일 수 있는 것부터 덜어보세요.',
 conflict:'서로 충돌하는 조건을 적고, 양보할 부분과 지킬 기준을 나누어보세요.'
};
export function generalAdvice(card,reversed=false){return everydayAdvice[(reversed?card.reversedTags:card.tags)[0]];}
export function verdict(picks){const scores=picks.map(p=>p.reversed?Math.min(0,cards.find(c=>c.id===p.id).yesNo):cards.find(c=>c.id===p.id).yesNo);const total=scores.reduce((a,b)=>a+b,0);if(scores.includes(1)&&scores.includes(-1))return '조금 더 지켜볼 필요가 있음';return total>0?'YES에 가까움':total<0?'NO에 가까움':'조금 더 지켜볼 필요가 있음';}
export function spreadSignals(slug,picks){
 const positions=picks.map((pick,index)=>{const card=cards.find(c=>c.id===pick.id);if(!card)throw new Error('Unknown card');return {index,id:card.id,reversed:pick.reversed,tags:pick.reversed?card.reversedTags:card.tags};});
 const totals={};for(const position of positions){position.tags.forEach((tag,i)=>{totals[tag]=(totals[tag]||0)+(i===0?2:1);});}
 const ranked=Object.entries(totals).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]));
 return {positions,totals,ranked};
}
const signalNotes={
 communication:'말을 주고받을 여지가 있어도 서로 같은 뜻으로 이해하는지 확인하는 과정이 필요해요.',
 movement:'움직이고 싶은 힘은 있지만, 속도를 맞추지 않으면 한 사람의 시도로만 남을 수 있어요.',
 attraction:'끌림은 관계를 여는 계기가 될 수 있지만, 지속적인 존중과 약속까지 대신하지는 않아요.',
 healing:'편안함을 회복하는 과정이 중요하게 읽혀요. 좋은 기억보다 지금 실제로 마음이 놓이는지 살펴보세요.',
 decision:'무엇을 선택할지보다 선택의 기준을 먼저 정할 필요가 있어요. 내가 바라는 조건과 현실이 맞는지 비교해보세요.',
 waiting:'속도를 늦추는 주제가 두드러져요. 기다림을 의무로 삼기보다 내 생활을 지키며 확인할 조건을 남겨두세요.',
 reflection:'내 마음과 해석을 정리하는 시간이 중요하게 읽혀요. 혼자 생각한 답과 실제 확인한 내용을 구분해보세요.',
 distance:'거리를 두는 이유와 각자의 경계를 살펴볼 필요가 있어요. 가까워지는 것만이 좋은 변화는 아닐 수 있어요.',
 renewal:'같은 장면을 반복하기보다 다른 방식으로 시작할 조건을 찾는 관점이 어울려요.',
 closure:'기존 방식을 마무리하는 주제가 있어요. 관계의 끝을 확정하기보다 더는 반복하지 않을 행동을 정해보세요.',
 blocked:'부담 때문에 하고 싶은 말이나 행동이 막힐 수 있는 관점이에요. 혼자 힘을 더 쏟는 것이 해결인지 점검해보세요.',
 conflict:'드러난 차이를 덮기보다 어떻게 다룰지 살펴봐야 해요. 누가 옳은지보다 반복되는 상호작용에 집중해보세요.'
};
export function synthesis(slug,picks){
 if(slug==='yes-no'){
  const direction=verdict(picks),items=picks.map(p=>{const card=cards.find(c=>c.id===p.id),value=p.reversed?Math.min(0,card.yesNo):card.yesNo,tag=(p.reversed?card.reversedTags:card.tags)[0];return {card,pick:p,value,tag};});
  const strongest=spreadSignals(slug,picks).ranked[0]?.[0],condition=themes[strongest];
  const first=direction==='YES에 가까움'?'지금 질문에는 해보는 쪽이 더 강합니다. 핵심 조건은 ‘'+condition+'’이에요.':direction==='NO에 가까움'?'지금은 진행하기보다 멈추거나 재검토하는 쪽이 더 강합니다. 가장 크게 걸리는 건 ‘'+condition+'’이에요.':'지금은 YES나 NO를 바로 정하기보다 보류하는 쪽이 맞습니다. 카드들이 한 방향으로 모이지 않아 조건을 하나 더 확인할 필요가 있어요.';
  const cardLine=items.map(({card,value})=>card.koreanName+' 카드는 '+(value>0?'진행 쪽':value<0?'보류·재검토 쪽':'중립·조건 확인 쪽')).join(', ');
  const focus=items.find(x=>x.tag===strongest)||items[0];
  const concrete=concreteScenes['yes-no']?.[focus.tag]||generalAdvice(focus.card,focus.pick.reversed);const support=items.find(x=>x!==focus&&x.value!==focus.value)||items[1];
  return [first,'카드별로 보면 '+cardLine+'이에요. 그래서 왜 이런 답이 나왔는지가 카드마다 분명히 갈립니다.',concrete,support?'추가로 '+support.card.koreanName+' 카드가 '+(support.value>0?'진행 쪽 힘을 보태고 있어요.':support.value<0?'속도를 늦추는 쪽으로 작용해요.':'결정을 한 번 더 확인하게 만드는 카드예요.'):'지금은 첫 카드의 방향을 중심으로 읽으면 됩니다.'];
 }
 if(slug==='feelings'){
  const signals=spreadSignals(slug,picks),tags=signals.positions.map(p=>p.tags[0]);
  const warm=tags.filter(t=>['attraction','communication','movement','healing','renewal'].includes(t)).length;
  const guarded=tags.filter(t=>['distance','blocked','conflict','closure','waiting'].includes(t)).length;
  const current=warm>=2&&guarded===0?'호감이나 관심이 있는 쪽':warm>=1&&guarded>=1?'마음은 있지만 쉽게 행동하지 못하는 쪽':guarded>=2?'지금은 거리와 부담이 더 큰 쪽':'아직 판단하고 지켜보는 쪽';
  const futureTag=tags[Math.min(3,tags.length-1)];
  const futureMap={movement:'앞으로는 먼저 말을 걸거나 실제 행동으로 옮길 가능성이 있습니다.',communication:'앞으로는 대화를 이어가거나 표현이 조금 더 분명해질 수 있어요.',attraction:'호감은 이어질 수 있지만 관계를 확정하는 행동까지는 더 지켜봐야 해요.',healing:'강한 진전보다 편안하게 관계를 유지하려는 태도가 나타날 가능성이 큽니다.',renewal:'관계를 예전과 다르게 보거나 새로운 방식으로 접근할 수 있어요.',decision:'관계를 이어갈지 선을 그을지 스스로 결론을 내리려는 태도가 나올 수 있어요.',reflection:'당분간은 행동보다 혼자 생각하고 정리하는 시간이 더 길 수 있어요.',waiting:'먼저 움직이기보다 상대 반응과 상황을 지켜보는 태도가 이어질 수 있어요.',distance:'가까워지기보다 자기 공간을 지키며 거리를 유지하려는 태도가 더 강할 수 있어요.',closure:'현재 흐름이 이어지면 관계를 정리하거나 선을 분명히 하려는 쪽으로 갈 수 있어요.',blocked:'마음이 있어도 현실적인 부담 때문에 표현이나 행동이 계속 늦어질 수 있어요.',conflict:'태도가 가까워졌다 멀어졌다 하며 일관되지 않게 보일 수 있어요.'};
  const futureIndex=Math.min(3,picks.length-1);
  let strongest=signals.ranked[0]?.[0],strongestIndex=tags.findIndex((t,i)=>t===strongest&&i!==futureIndex);
  if(strongestIndex<0)strongestIndex=tags.findIndex((_,i)=>i!==futureIndex);
  if(strongestIndex<0)strongestIndex=futureIndex;
  strongest=tags[strongestIndex]||strongest;
  const strongCard=cards.find(c=>c.id===picks[strongestIndex].id),futureCard=cards.find(c=>c.id===picks[futureIndex].id);
  return [('결론부터 말하면, 카드 흐름상 상대는 '+current+'으로 읽힙니다. '+(synthesisLeadNuance[strongest]||'')).trim(),futureMap[futureTag]||signalNotes[futureTag],'이렇게 읽는 가장 큰 근거는 '+strongCard.koreanName+'에서 ‘'+themes[strongest]+'’ 주제가 반복되기 때문이에요. 마지막 흐름의 '+futureCard.koreanName+'도 앞으로의 태도를 '+themes[futureTag]+' 쪽으로 보여줍니다.','즉 마음의 유무만 보기보다 지금 실제로 연락·만남·거리두기 중 어떤 행동을 하고 있는지 함께 보면 이 리딩이 더 선명해져요.'];
 }
 const practical=['job','money','work','study'];
 if(practical.includes(slug)){
  const signals=spreadSignals(slug,picks),tags=signals.positions.map(p=>p.tags[0]),strongest=signals.ranked[0][0];
  const focusIndex={job:2,money:2,work:1,study:2}[slug],focusText={job:'보완하면 좋은 부분',money:'주의할 소비와 부담',work:'부담과 갈등의 지점',study:'방해가 되는 요소'}[slug];
  const focusPick=picks[Math.min(focusIndex,picks.length-1)],focusCard=cards.find(c=>c.id===focusPick.id);
  const difficult=tags.filter(t=>['blocked','conflict','distance','closure'].includes(t)).length;
  const active=tags.some(t=>['movement','communication','renewal','decision'].includes(t));
  const tone=difficult>=Math.ceil(tags.length/2)?'이번 배열에서는 빠르게 밀어붙이기보다 부담을 줄이고 기본 조건을 정리하는 흐름이 더 두드러집니다.':difficult&&active?'움직일 힘과 현실적인 제약이 함께 보여요. 할 수 있는 일과 지금은 보류할 일을 나누어 보는 편이 좋습니다.':active?'생각을 실제 행동으로 옮길 수 있는 주제가 이어집니다. 큰 결론보다 다음 한 단계에 집중해보세요.':'빠른 결과보다 정리와 준비가 중심이 되는 배열입니다. 지금의 리듬을 점검하고 반복 가능한 방식을 만드는 데 의미가 있어요.';
  const focusAt=Math.min(focusIndex,tags.length-1),focusTag=tags[focusAt],plainTone=tone.replace('이번 배열에서는 ','');
  let support=signals.ranked.find(([tag])=>tags.findIndex((t,i)=>t===tag&&i!==focusAt)>=0)?.[0];
  let supportIndex=support?tags.findIndex((t,i)=>t===support&&i!==focusAt):-1;
  if(supportIndex<0)supportIndex=tags.findIndex((_,i)=>i!==focusAt);
  if(supportIndex>=0)support=tags[supportIndex];
  const supportCard=supportIndex>=0?cards.find(c=>c.id===picks[supportIndex].id):null;
  return [('결론부터 말하면, '+plainTone+' '+(synthesisLeadNuance[strongest]||'')).trim(),'특히 ‘'+focusText+'’ 자리의 '+focusCard.koreanName+' 때문에 ‘'+themes[focusTag]+'’을 먼저 봐야 해요. '+focusCard.advice,support&&supportCard?'여기에 '+supportCard.koreanName+'의 ‘'+themes[support]+'’도 같이 잡혀 있어서, 한 가지 문제만 고치기보다 두 조건을 같이 조정하는 편이 흐름이 더 빨리 바뀔 수 있어요.':'카드 흐름이 한 방향으로 모여 있어 지금 보이는 핵심을 먼저 움직이는 게 좋아요.','지금 할 일은 이거예요 : '+generalAdvice(focusCard,focusPick.reversed)];
 }
 const signals=spreadSignals(slug,picks);
 const tags=signals.positions.map(p=>p.tags[0]);
 const obstacleIndex={reunion:2,breakup:1,love:3,feelings:2,contact:1,'reunion-timing':1,'yes-no':1,today:0}[slug];
 const obstacle=tags[Math.min(obstacleIndex,tags.length-1)],end=tags.at(-1),start=tags[0];
 const difficult=tags.filter(t=>['blocked','conflict','distance','closure'].includes(t)).length;
 const active=tags.some(t=>['movement','communication','attraction','renewal'].includes(t));
 const tone=difficult>=Math.ceil(tags.length/2)?'이번 배열에서는 관계를 밀어붙일 가능성보다 부담과 거리의 신호가 더 두드러집니다. 지금 당장 답을 얻으려 애쓰기보다, 나를 소모시키는 방식부터 멈춰볼 필요가 있어요.':difficult&&active?'가까워지고 싶은 방향과 속도를 늦추게 하는 조건이 함께 나타났어요. 마음이 움직이는 것과 실제로 편안하게 관계를 이어갈 수 있는 것은 구분해서 읽는 편이 좋습니다.':active?'이번 배열에는 생각을 행동이나 대화로 옮기는 주제가 이어집니다. 다만 움직임이 있다는 해석을 원하는 결과의 약속으로 받아들이기보다, 작게 시도한 뒤 실제 반응을 살피는 관점으로 읽어주세요.':'이번 배열에서는 빠른 진전보다 마음과 생활을 정리하는 과정이 중심이 됩니다. 겉으로 변화가 적어도 내 기준과 필요한 거리를 분명히 하는 시간이 의미 있을 수 있어요.';
 const bridge=start===end?`처음과 끝에 ‘${themes[start]}’ 주제가 반복됩니다. 한 번의 계기보다 이 주제를 일상에서 어떻게 다루는지가 더 중요하게 읽혀요.`:`현재를 비추는 첫 위치의 ‘${themes[start]}’, 마지막 위치의 ‘${themes[end]}’ 주제를 함께 보면 현재와 이후에 필요한 태도가 다를 수 있어요. 앞의 상황을 곧바로 결론으로 삼기보다 중간에 놓인 조건을 함께 살펴보세요.`;
 const focus={reunion:'다시 만나는 데 걸리는 조건',breakup:'갈등을 다룰 때의 핵심',love:'기대 속에서 놓치기 쉬운 부분',feelings:'확인되지 않은 채 남아 있는 주제',contact:'소통을 어렵게 하는 조건','reunion-timing':'달력보다 먼저 달라져야 할 조건','yes-no':'선택 전에 점검할 조건',today:'오늘 기억할 태도'}[slug];
 const obstacleAt=Math.min(obstacleIndex,picks.length-1);
 let strongest=signals.ranked[0]?.[0]||tags[0],dominantIndex=tags.findIndex((t,i)=>t===strongest&&i!==obstacleAt);
 if(dominantIndex<0){
  for(const [candidate] of signals.ranked.slice(1)){const index=tags.findIndex((t,i)=>t===candidate&&i!==obstacleAt);if(index>=0){strongest=candidate;dominantIndex=index;break;}}
 }
 if(dominantIndex<0)dominantIndex=tags.findIndex((_,i)=>i!==obstacleAt);
 if(dominantIndex<0)dominantIndex=obstacleAt;
 strongest=tags[dominantIndex]||strongest;
 const support=signals.ranked.find(([tag])=>tag!==strongest)?.[0];
 const dominantCard=cards.find(c=>c.id===picks[dominantIndex].id),obstaclePick=picks[obstacleAt],obstacleCard=cards.find(c=>c.id===obstaclePick.id),plainTone=tone.replace('이번 배열에서는 ','');
 return [('결론부터 말하면, '+plainTone+' '+(synthesisLeadNuance[strongest]||'')).trim(),'왜 이렇게 읽었냐면 '+dominantCard.koreanName+'에서 ‘'+themes[strongest]+'’ 주제가 강하고, ‘'+focus+'’ 자리의 '+obstacleCard.koreanName+'에서는 ‘'+themes[obstacle]+'’ 흐름이 보여서예요.',support?'여기에 ‘'+themes[support]+'’도 같이 잡혀 있어서, 마음이 움직이는 것과 실제 관계가 움직이는 속도가 다를 수 있어요.':bridge,'지금은 이 부분을 먼저 보세요 : '+obstacleCard.advice];
}
// Future premium adapters may accept this DTO. No remote provider or API client in v0.1.
export function readingSnapshot(slug,picks,question=''){return {version:2,locale:'ko',readingType:slug,question,selectedCards:picks.map(p=>({...p})),positions:readings[slug].positions.slice(0,picks.length).map(p=>p.label),interpretations:picks.map((p,i)=>interpret(slug,p,i)),summary:synthesis(slug,picks)};}
