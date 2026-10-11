import {cards} from './data/cards.mjs';
import {readings} from './data/readings.mjs';
import {josa} from './korean.mjs';

// Small, deterministic, local-only intent parser. It never sends the user's
// question anywhere and deliberately does not infer outcomes or probabilities.
const definitions={
 job:[
  ['outcome','합격·결과 발표',/합격|불합격|발표|결과\s*(?:언제|나올|나오|여부)|붙을까|붙을지|붙나요/,2,'합격을 카드로 확정할 수는 없어요. 기다리는 동안 바꿀 수 있는 준비와 확인할 조건에 초점을 맞춰 읽어볼게요.','발표 일정을 공식 채널에서 확인하고, 다음 지원에 보완할 한 항목을 적어보세요.'],
  ['interview','면접 준비',/면접|인터뷰|실무진\s*질문|기술\s*질문/,1,'면접 질문이라면 운세의 좋고 나쁨보다 내 경험을 어떻게 보여줄지에 집중하는 편이 도움이 돼요.','대표 경험 하나를 문제–내 행동–결과 순서로 60초 안에 말하는 연습을 해보세요.'],
  ['application','서류·지원 준비',/이력서|자소서|자기소개서|포트폴리오|서류|지원서|공고|지원\s*(?:할까|준비|전략)|과제\s*전형/,2,'서류나 지원 준비가 고민이라면 강점을 실제 채용 공고의 요구와 연결할 수 있는지 살펴봐요.','공고의 필수 요건 하나에 대응하는 경험을 이력서 첫 부분에 구체적으로 써보세요.'],
  ['transition','이직·진로 선택',/이직|퇴사|전직|직무\s*(?:변경|전환)|커리어|회사를?\s*(?:옮|바꾸)|직장\s*(?:옮|바꾸)/,3,'이직은 현재 자리를 떠날지뿐 아니라 다음 직장에 가져갈 경력과 필요한 조건을 나눠 볼 때 더 선명해져요.','다음 직장의 필수 조건 두 가지와 양보 가능한 조건 한 가지를 적어보세요.'],
  ['timing','지원 시기·준비 속도',/언제\s*(?:취업|지원)|취업\s*(?:시기|언제)|지원\s*(?:시기|언제)|채용\s*시기/,3,'카드로 채용 날짜를 알 수는 없지만, 준비에서 실행으로 넘어갈 기준을 돌아볼 수 있어요.','이번 주 지원 가능 여부를 확인할 수 있는 체크리스트를 세 가지로 줄여보세요.']
 ],
 love:[
  ['conflict','반복되는 연애 갈등',/갈등|다툼|싸움|싸웠|싸우|권태|소원해|소원한|서운|관계\s*(?:문제|고민)/,3,'호감이 남아 있는지보다 갈등을 다루는 방식과 서로의 경계가 존중되는지 살펴보세요.','반복되는 문제 한 가지를 고르고 서로 바꿀 수 있는 행동을 나눠보세요.'],
  ['new','새로운 만남',/새\s*(?:사람|인연|연애)|새로운\s*(?:사람|인연|만남)|소개팅|솔로|인연|연애(?:가)?\s*시작|연애할\s*수/,2,'새로운 만남을 묻는다면 내 바람과 실제로 편안한 관계를 만들 조건을 나누어 보는 편이 좋아요.','상대에게 꼭 바라는 태도 한 가지를 적어보세요.'],
  ['crush','썸·짝사랑',/썸|짝사랑|고백|호감|썸남|썸녀/,1,'서로의 호감이 같은 속도로 표현되는지, 내가 기대하는 관계는 무엇인지 살펴봐요.','상대의 추측된 마음 대신 확인한 행동을 한 가지 떠올려 보세요.'],
  ['relationship','현재 관계',/연애\s*중|남자친구|여자친구|애인|현재\s*관계|사귀|커플/,3,'관계의 현재 모습을 보면서 기대와 부담을 함께 구분해보는 질문으로 읽어주세요.','편안하게 요청하고 싶은 것을 한 문장으로 정리해보세요.']
 ],
 reunion:[
  ['boundaries','재회보다 나의 경계',/(?:다시\s*만(?:나|날)|재회|연락).{0,30}(?:싶지\s*않|원하지\s*않|싫|원치\s*않|거절|하지\s*말)|(?:재회|재접촉)\s*(?:안\s*할|하지\s*않)/,2,'재회를 원하지 않거나 다시 시작할지 망설인다면 그 마음도 중요한 정보예요. 카드보다 내 의사와 상대의 경계를 우선해요.','재접촉을 의무로 여기지 말고 내가 지키고 싶은 거리와 선택을 정리해보세요.'],
  ['reconnect','재접촉·연락',/연락|카톡|메시지|차단|재접촉|답장|선톡|읽씹/,3,'연락이 다시 닿는 것과 관계를 회복하는 것은 별개예요. 대화가 양쪽 모두에게 가능한지 살펴봐요.','상대가 명확히 연락을 거절했거나 차단했다면 경계를 존중하세요.'],
  ['timing','재회 시기·속도',/재회.{0,24}(?:언제|시기|몇\s*(?:주|달|개월))|(?:언제|몇\s*(?:주|달|개월))\s*(?:쯤|뒤|후)?\s*(?:재회|다시\s*만(?:나|날))|다시\s*만(?:나|날).{0,20}(?:언제|시기)|얼마나\s*기다.{0,20}재회/,4,'특정 날짜를 예측하기보다 서로의 상황과 재접촉의 조건이 어떻게 달라질 수 있는지 살펴봐요.','기다림의 기간을 무한정 늘리기보다 현재 확인할 수 있는 변화와 내 생활의 기준을 정해두세요.'],
  ['repair','헤어진 이유·갈등',/헤어진\s*(?:이유|원인)|싸움|싸웠|다툼|갈등|문제\s*반복|상처|같은\s*문제/,2,'감정이나 그리움과 실제로 달라져야 할 관계의 조건을 구분해서 읽어보세요.','예전에 반복되던 문제 한 가지와 달라져야 할 행동을 적어보세요.'],
  ['return','재회 가능성·선택',/재회|다시\s*만(?:나|날)|재결합|돌아올|돌아와|다시\s*사귈|다시\s*이어/,4,'다시 만나기를 바란다면 서로의 동의와 이전 문제의 변화가 함께 필요하다는 점에 주목해요.','재회한다면 이전과 달라야 할 조건 한 가지를 생각해보세요.']
 ],
 breakup:[
  ['decision','관계를 이어갈지',/헤어|이별|정리|끝내|계속\s*만나/,4,'카드보다 실제로 편안하고 존중받는 관계인지가 판단 기준이에요.','관계를 이어갈 조건과 멈출 조건을 각각 하나씩 적어보세요.'],
  ['conflict','반복되는 갈등',/갈등|싸움|다툼|상처|반복/,1,'갈등의 크기보다 반복되는 방식과 해결하려는 행동을 돌아봐요.','같은 갈등을 반복하지 않기 위한 경계 하나를 정해보세요.'],
  ['distance','권태·거리감',/권태|거리감|소원|식은|멀어진/,3,'관계의 온도보다 편안하게 대화할 공간이 있는지 확인해봐요.','거리감이 커진 계기를 사실과 추측으로 나눠 적어보세요.']
 ],
 feelings:[
  ['distance','달라진 태도·거리감',/차갑|차가워|차가워졌|피하|거리감|거리를\s*두|거리\s*두|달라진|무관심|변했|냉정|소원해|멀어진|멀어졌/,2,'태도가 달라진 이유는 카드만으로 확인할 수 없어요. 보이는 행동과 내가 짐작하는 마음을 나눠 보세요.','상대의 감정을 단정하기보다 내가 직접 확인할 수 있는 대화 주제를 정해보세요.'],
  ['messages','연락 속 태도',/연락|답장|읽씹|안읽씹|카톡|문자|메시지|회신/,0,'메시지의 빈도와 실제 마음은 같지 않아요. 대화의 양방향성을 관찰하는 관점으로 읽어보세요.','연락의 간격보다 대화가 상호적으로 이어지는지 살펴보세요.'],
  ['past','전 연인·미련',/전\s*애인|전\s*연인|전남친|전여친|미련|잊었|헤어진\s*사람/,1,'추억이나 미련처럼 보이는 상징이 있어도 현재의 재회 의사까지 알 수 있는 것은 아니에요.','과거의 기억과 현재 확인된 행동을 분리해서 생각해보세요.'],
  ['interest','호감·관심',/호감|좋아|사랑|관심|썸|짝사랑|(?:나를|날)\s*어떻게\s*생각/,1,'카드는 상대의 마음을 증명하지 않아요. 감정에 대한 여러 관점을 실제 반응과 비교해보세요.','호감을 단정하기보다 서로 편하게 대화할 기회가 있는지 확인해보세요.'],
  ['uncertainty','말하지 않은 마음',/속마음|진심|무슨\s*생각|어떤\s*마음|감정|마음이\s*(?:있|없)|어떻게\s*생각/,2,'말하지 않은 사실을 알아낼 수는 없지만 표현되지 않은 주제를 생각해볼 수 있어요.','확인된 사실 한 가지와 내가 추측한 내용 한 가지를 나눠 적어보세요.']
 ],
 contact:[
  ['timing','연락 시기',/언제|시기|오늘|내일|이번\s*주|며칠|몇\s*일/,2,'카드가 실제 연락 날짜를 알려주지는 않아요. 기다림을 다루는 기준을 살펴볼게요.','연락을 기다리며 일상을 멈추지 않도록 확인할 시간을 정해보세요.'],
  ['initiate','먼저 연락하기',/먼저|보내볼|연락할까|연락해도|선톡/,1,'연락할지 결정할 때에는 상대의 경계와 연락 목적이 중요해요.','상대가 연락을 거절했다면 보내지 말고, 그렇지 않다면 목적을 한 문장으로 정리해보세요.'],
  ['response','답장·회신',/답장|읽씹|안읽씹|회신|연락\s*올/,2,'답장의 유무만으로 상대의 마음을 단정하지 않는 편이 좋아요.','추가 메시지 전에 이미 받은 반응과 내 기대를 구분해보세요.']
 ],
 'reunion-timing':[
  ['recontact','연락의 계기',/연락|카톡|답장|차단|재접촉/,1,'시점을 맞히기보다 연락이 서로에게 가능한 조건을 살펴봐요.','현재 실제로 확인된 변화가 있는지 한 가지 적어보세요.'],
  ['timing','관계가 움직이는 시기',/언제|시기|기간|몇\s*달|몇\s*주|재회/,2,'기간은 확정된 예언이 아니라 어떤 변화가 먼저 필요한지를 돌아보는 상징으로 읽어주세요.','무기한 기다림 대신 내가 다시 판단할 기준을 정해보세요.']
 ],
 'yes-no':[
  ['career','일·취업 선택',/취업|면접|이직|지원|퇴사|직장/,1,'YES/NO는 선택의 방향을 돌아보는 도구이며 실제 채용 결과를 예측하지 않아요.','진행할 때 필요한 현실적인 조건 한 가지를 확인해보세요.'],
  ['relationship','관계·연락 선택',/연락|고백|재회|연애|헤어/,1,'관계에 대한 결정이라면 나와 상대의 의사와 경계를 함께 보아야 해요.','상대가 원하지 않는 행동은 카드 방향과 무관하게 멈춰주세요.'],
  ['money','금전 선택',/투자|돈|구매|지출|대출|결제/,1,'카드는 재무적 이익을 보장하지 않아요. 실제 예산과 위험을 먼저 확인해요.','감당 가능한 금액과 최악의 경우를 숫자로 적어보세요.'],
  ['study','시험·공부 선택',/시험|공부|학업|합격/,1,'카드의 방향과 실제 학습 성과는 다를 수 있어요. 실천 가능한 준비를 함께 살펴봐요.','이번 주에 확인할 공부 과제 하나를 정해보세요.']
 ],
 money:[
  ['spending','지출·소비',/지출|소비|저축|절약|고정비|카드값|생활비/,2,'수입 예언보다 반복적으로 빠져나가는 돈의 흐름을 점검해봐요.','최근 지출에서 줄일 수 있는 항목 하나를 표시해보세요.'],
  ['income','수입·부업',/수입|급여|월급|연봉|부업|매출|정산/,1,'수입 변화는 카드가 보장하지 않아요. 지금 만들 수 있는 지속적인 수입 조건을 돌아봐요.','현재 수입원을 실제 금액과 반복 가능성으로 나눠 적어보세요.'],
  ['purchase','큰 구매',/구매|구입|할부|계약|목돈|큰돈/,3,'끌리는 물건보다 구매 후 남을 여유를 기준으로 보세요.','결제 후 생활비와 비상금이 남는지 확인해보세요.']
 ],
 work:[
  ['change','퇴사·이직',/퇴사|이직|옮기|전직|직장\s*바꾸/,3,'직장을 떠날지보다 다음 직장에서 달라져야 할 조건을 함께 살펴봐요.','근무 조건과 생활비를 확인한 뒤 판단해보세요.'],
  ['conflict','동료·업무 갈등',/상사|동료|갈등|업무량|괴롭힘|스트레스/,1,'사람과 업무 구조 중 무엇이 부담인지 구분해보면 좋겠어요.','문제가 반복되는 구체적 상황을 한 가지 기록해보세요.'],
  ['growth','평가·승진·보상',/승진|연봉|평가|보상|성과|성장/,2,'성과를 어떻게 증명하고 협의할지 생각해볼 수 있어요.','기여한 성과 한 가지를 확인 가능한 자료로 정리해보세요.']
 ],
 study:[
  ['exam','시험 준비',/시험|합격|점수|모의고사|수능|자격증/,2,'합격을 확정하기보다 학습을 방해하는 병목을 살펴봐요.','가장 자주 틀리는 유형 한 가지를 골라보세요.'],
  ['routine','집중·루틴',/집중|슬럼프|루틴|습관|계획|미루|공부\s*안/,2,'공부를 방해하는 실제 환경과 회복할 리듬을 구분해봐요.','오늘 시작할 수 있는 20분 공부 시간을 정해보세요.'],
  ['direction','학습 방향',/진로|전공|과목|학습법|공부법|복습/,3,'더 많이 하려는 마음보다 지금 필요한 공부 방식을 찾아봐요.','최근 공부에서 효과가 있었던 방법 하나를 남겨보세요.']
 ]
};
const jobFallback={
 first:['첫 취업 준비',0,'첫 취업이라면 경험의 양보다 한 가지 역량을 제출 가능한 사례로 보여주는 게 중요해요.','지원 직무와 연결되는 프로젝트나 경험 하나를 정리해보세요.'],
 change:['이직 준비',3,'이직이라면 지금 경력과 다음 역할을 어떻게 연결할지 돌아봐요.','옮기려는 이유와 새 직장에 바라는 조건을 따로 적어보세요.'],
 return:['재취업 준비',0,'재취업이라면 공백을 추측으로 메우기보다 지금 할 수 있는 일과 준비 상태를 살펴봐요.','지원 직무에 직접 연결되는 최근 경험을 하나 골라보세요.']
};
// When the free-text question is blank or too broad, use the selected context
// without pretending that the visitor specified a detailed concern.
const relationshipFallback={
 love:{
  solo:['new','새로운 만남',2,'새로운 만남을 바랄 때에는 내 연애 기준과 실제 관계의 변화를 함께 살펴봐요.','다가오는 만남에서 꼭 확인하고 싶은 태도를 하나 정리해보세요.'],
  crush:['crush','썸·짝사랑',1,'썸이나 짝사랑이라면 끌림과 실제로 주고받는 반응을 구분해봐요.','상대에게서 실제 확인한 행동 한 가지를 떠올려보세요.'],
  relationship:['relationship','현재 관계',3,'연애 중이라면 바라는 관계와 부담을 구분해 보는 게 도움이 될 수 있어요.','서로에게 필요한 대화의 주제를 하나 골라보세요.']
 },
 reunion:{
  recent:['repair','헤어진 직후의 관계',2,'헤어진 직후라면 그리움의 크기와 이전 갈등의 해결 가능성을 나누어 보는 편이 좋아요.','재접촉 전에 달라져야 할 문제 하나를 적어보세요.'],
  mid:['reconnect','재접촉의 조건',3,'시간이 조금 지난 관계라면 실제 연락이 가능한 상황과 과거의 문제를 나누어 살펴봐요.','지금 확인된 변화가 있는지 돌아보고 상대의 경계를 존중하세요.'],
  long:['return','오래 지난 관계',4,'오래된 관계를 다시 떠올린다면 지금 서로의 삶과 선택이 달라졌을 수 있다는 점을 살펴봐요.','예전과 같을 수 없는 조건 한 가지를 정리해보세요.']
 },
 feelings:{
  crush:['interest','썸·짝사랑의 태도',1,'썸이나 짝사랑이라면 감정에 대한 추측과 실제 상호 반응을 구분해봐요.','상대가 먼저 보여준 반응 중 확인할 수 있는 것만 떠올려보세요.'],
  relationship:['uncertainty','연애 중의 표현',2,'연애 중이라면 표현되지 않은 감정에 대한 추측보다 서로 말할 수 있는 주제를 살펴봐요.','가볍게 확인해보고 싶은 대화 주제를 한 가지 정해보세요.'],
  ex:['past','전 연인과의 거리',1,'전 연인이라면 기억과 실제 재회 의사를 같은 것으로 보지 않는 편이 좋아요.','과거의 기대와 지금의 행동을 따로 생각해보세요.']
 }
};
const relationshipCrosschecks={
 love:{
  new:[3,'기대와 주의점을 함께 살펴보세요.'],
  crush:[2,'내 바람과 실제 변화의 방향을 따로 살펴보세요.'],
  relationship:[4,'주의점이 앞으로의 관계 흐름과 어떻게 연결되는지 돌아보세요.'],
  conflict:[4,'반복되는 어려움이 앞으로의 선택에 어떤 영향을 주는지 살펴보세요.']
 },
 reunion:{
  boundaries:[4,'관계를 다시 시작하지 않을 선택도 존중하면서 앞으로의 방향을 생각해보세요.'],
  timing:[2,'시기보다 이전 문제의 변화가 먼저 필요한지 살펴보세요.'],
  reconnect:[2,'대화를 재개할 수 있어도 이전 장애물이 남아 있는지 함께 돌아보세요.'],
  repair:[4,'이전 문제를 다루는 방법이 앞으로의 관계 흐름과 이어지는지 살펴보세요.'],
  return:[2,'재회에 대한 기대와 반복될 수 있는 어려움을 구분해보세요.']
 },
 feelings:{
  distance:[3,'앞으로의 태도를 현재의 거리감과 같은 것으로 단정하지 마세요.'],
  messages:[2,'겉으로 보이는 메시지와 아직 말하지 않은 부분을 구분해보세요.'],
  past:[3,'과거의 기억과 앞으로 실제로 보일 행동은 다를 수 있어요.'],
  interest:[0,'현재 감정에 대한 상징을 겉으로 보이는 태도와 비교해보세요.'],
  uncertainty:[0,'말하지 않은 부분과 이미 관찰한 행동을 나누어보세요.']
 }
};
const signalGuidance={
 movement:'실제로 시작할 수 있는 작은 행동이 무엇인지 확인해보세요.',
 communication:'말과 설명이 오해 없이 전달되는지 점검해보세요.',
 attraction:'끌리는 마음과 현실에서 지속 가능한 선택을 구분해보세요.',
 renewal:'예전 방식에서 바꿔볼 한 지점을 찾는 데 초점을 두세요.',
 decision:'선택의 기준을 두 가지로 좁히면 도움이 될 수 있어요.',
 healing:'무리하게 속도를 높이기보다 여유를 회복할 방법을 살펴보세요.',
 reflection:'확인한 사실과 스스로 예상한 내용을 나눠 적어보세요.',
 waiting:'기다리는 동안 할 수 있는 다음 준비를 한 가지 정해보세요.',
 distance:'내가 지켜야 할 거리와 조건을 먼저 확인해보세요.',
 closure:'더는 유지하지 않을 방법이나 습관 하나를 정리해보세요.',
 blocked:'막힌 이유를 한 가지로 구체화하고 줄일 수 있는지 살펴보세요.',
 conflict:'서로 충돌하는 조건의 우선순위를 정해보세요.'
};
function compareRelationshipSignals(primary,secondary){
 const open=new Set(['movement','communication','attraction','renewal','decision']);
 const guarded=new Set(['blocked','conflict','distance','closure','waiting']);
 if(primary===secondary)return '두 자리에서 같은 의미가 반복되지만, 실제 행동이나 상황까지 같다는 뜻은 아니에요.';
 if((open.has(primary)&&guarded.has(secondary))||(guarded.has(primary)&&open.has(secondary)))
  return '한쪽에는 움직이려는 힘이, 다른 쪽에는 속도를 늦추는 조건이 함께 나타나요. 실제 선택과 장애물을 구분해서 읽어보세요.';
 if(open.has(primary)&&open.has(secondary))
  return '두 자리 모두 변화나 표현을 향하지만, 생각만으로 결론을 내리기보다 실제 행동으로 확인할 필요가 있어요.';
 if(guarded.has(primary)&&guarded.has(secondary))
  return '두 자리 모두 부담이나 거리와 관련된 주제를 보여줘요. 진전을 서두르기보다 반복되는 조건을 먼저 살펴보세요.';
 return '두 자리가 서로 다른 관점을 보여줘요. 어느 한 장만으로 관계의 결론을 확정하기보다 함께 읽어보세요.';
}
export function resolveQuestionFocus(slug,question='',situation='',picks=[]){
 if(!readings[slug]||!Array.isArray(picks)||!picks.length)return null;
 const value=String(question??'').normalize('NFKC').slice(0,300).trim();
 let match=definitions[slug]?.find(entry=>entry[2].test(value));
 let source='question';
 if(!match&&slug==='job'&&jobFallback[situation]){
  const [label,index,description,action]=jobFallback[situation];
  match=['situation-'+situation,label,null,index,description,action];
  source='situation';
 }
 if(!match&&relationshipFallback[slug]?.[situation]){
  const [key,label,index,description,action]=relationshipFallback[slug][situation];
  match=[key,label,null,index,description,action];
  source='situation';
 }
 if(!match)return null;
 const [key,label,,requestedIndex,description,action]=match;
 const index=Math.max(0,Math.min(requestedIndex,picks.length-1));
 const pick=picks[index],card=cards.find(c=>c.id===pick?.id);
 if(!card)return null;
 const tag=(pick.reversed?card.reversedTags:card.tags)[0];
 const positionLabel=readings[slug].positions[index]?.label||'선택한 카드';
 const crosscheck=relationshipCrosschecks[slug]?.[key];
 let counterpoint=null;
 if(crosscheck){
  const otherIndex=crosscheck[0],otherPick=picks[otherIndex],otherCard=cards.find(c=>c.id===otherPick?.id);
  if(otherCard&&otherIndex!==index){
   const otherLabel=readings[slug].positions[otherIndex]?.label||'함께 읽는 카드';
   const otherTag=(otherPick.reversed?otherCard.reversedTags:otherCard.tags)[0];
   counterpoint=`‘${otherLabel}’ 자리에서는 ${otherCard.koreanName} 카드가 ${otherPick.reversed?'역방향':'정방향'}으로 나왔어요. ‘${otherCard.keywords[0]}’ 주제를 함께 읽어볼 수 있어요. ${compareRelationshipSignals(tag,otherTag)} ${crosscheck[1]}`.trim();
  }
 }
 return {
  key,label,source,index,positionLabel,cardName:card.koreanName,
  description,
  evidence:`‘${positionLabel}’ 자리에서 ${card.koreanName} 카드가 ${pick.reversed?'역방향':'정방향'}으로 나왔어요. ‘${card.keywords[0]}’ 주제를 떠올리게 해요. ${signalGuidance[tag]||''}`.trim(),
  counterpoint,
  action:crosscheck?action:`${action} ${signalGuidance[tag]||''}`.trim()
 };
}


// Align the prominent takeaway with explicit user boundaries.
// Do not turn a "I do not want to reunite" question into contact advice or a countdown.
export function reconcileQuestionReading(slug,focus,picks,result){
 if(slug!=='reunion'||focus?.key!=='boundaries'||!Array.isArray(picks)||picks.length<5)return result;
 const obstacle=cards.find(card=>card.id===picks[2]?.id);
 const future=cards.find(card=>card.id===picks[4]?.id);
 if(!obstacle||!future)return result;
 return {
  ...result,
  headline:'이번 질문은 재회 가능성보다 내가 원하는 거리와 선택을 지키는 데 초점을 맞춰 읽는 편이 좋아요.',
  timing:null,
  action:focus.action,
  combinations:[],
  summaryLines:[
   '결론부터 말하면, 카드는 다시 만나야 할 이유나 의무를 정해주지 않아요. 재회를 원하지 않는 마음이나 망설임이 있다면 실제 관계의 경계와 내 선택을 우선해도 괜찮습니다.',
   `‘재회를 막고 있는 요소’ 위치의 ${obstacle.koreanName} 카드에서는 ‘${obstacle.keywords[0]}’을 상징적으로 읽어볼 수 있어요. 이전 관계에서 더는 반복하고 싶지 않은 조건이 무엇인지 생각해보세요.`,
   `‘앞으로의 관계 흐름’ 위치의 ${future.koreanName} 카드에서는 ‘${future.keywords[0]}’을 떠올릴 수 있어요. 이 카드는 원하지 않는 재접촉을 권하는 뜻이 아니라, 앞으로 나에게 필요한 선택의 기준을 정리하는 관점이에요.`,
   '지금은 이 부분을 먼저 보세요 : '+focus.action
  ]
 };
}
