import {cards} from './core/data/cards.mjs';
import {readings, primary, secondary, tertiary} from './core/data/readings.mjs';
import {readingContexts} from './core/data/reading-contexts.mjs';
import {cardSlug} from './core/data/card-directory.mjs';
import {
  shuffleDeck, interpret, synthesis, verdict, contextualInsight, loadDaily, saveDaily,
  readingHeadline, timingInsight, nextAction, combinationInsights, generalAdvice
} from './core/engine.mjs';

const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];

const state={
  slug:null,
  question:'',
  contextKey:null,
  deck:[],
  selected:[],
  required:0,
  yesNoCount:null
};

const artworkAnchors={'major-0':'fool','major-6':'lovers','major-16':'tower','major-18':'moon','major-19':'sun'};
const artworkBase='https://pickacard.everytinytool.com/artwork';
const order=[...primary,...secondary,...tertiary].filter(slug=>readings[slug]);

function cardById(id){return cards.find(c=>c.id===id)}
function artworkFile(card){return artworkAnchors[card.id]||card.id}
function artworkUrl(card){return `${artworkBase}/${artworkFile(card)}.webp`}
function requiredCount(){
  if(state.slug==='yes-no') return state.yesNoCount||1;
  return readings[state.slug]?.positions.length||1;
}

function promptSelectionReady(){
  if(!state.slug) return false;
  if(state.slug==='yes-no') return Number.isInteger(state.yesNoCount);
  const context=readingContexts[state.slug];
  return context?.options?.length?Boolean(state.contextKey):true;
}

function updatePromptGlow(){
  $('#prompt-form .ask-button')?.classList.toggle('is-ready',promptSelectionReady());
}

function renderReadingPills(){
  $('#reading-pills').innerHTML=order.map(slug=>{
    const r=readings[slug];
    return `<button class="reading-pill ${state.slug===slug?'is-selected':''}" type="button" data-reading="${slug}">${r.name}</button>`;
  }).join('');
}

function renderSelectedReading(){
  const selected=$('#selected-reading');
  if(!state.slug){
    selected.hidden=true;
    selected.innerHTML='';
    return;
  }
  selected.hidden=false;
  selected.innerHTML=`<span>${readings[state.slug].name}</span><button type="button" data-action="clear-reading" aria-label="리딩 선택 해제">×</button>`;
}

function wireContextPills(){
  $$('#context-options [data-context]').forEach(button=>{
    button.onclick=()=>{
      state.contextKey=button.dataset.context;
      $$('#context-options [data-context]').forEach(node=>node.classList.toggle('is-selected',node===button));
      $('#context-row').classList.remove('needs-choice');
      updatePromptGlow();
    };
  });
  $$('#context-options [data-count]').forEach(button=>{
    button.onclick=()=>{
      state.yesNoCount=Number(button.dataset.count);
      state.required=state.yesNoCount;
      $$('#context-options [data-count]').forEach(node=>node.classList.toggle('is-selected',node===button));
      $('#context-row').classList.remove('needs-choice');
      updatePromptGlow();
    };
  });
}

function renderContext(){
  const row=$('#context-row');

  if(state.slug==='yes-no'){
    row.hidden=false;
    $('#context-label').textContent='카드 수';
    $('#context-options').innerHTML=[
      [1,'1장 · 핵심'],
      [2,'2장 · 조건까지'],
      [3,'3장 · 조언까지']
    ].map(([count,label])=>
      `<button class="context-pill ${state.yesNoCount===count?'is-selected':''}" type="button" data-count="${count}">${label}</button>`
    ).join('');
    wireContextPills();
    updatePromptGlow();
    return;
  }

  const context=state.slug?readingContexts[state.slug]:null;
  if(!context?.options?.length){
    row.hidden=true;
    state.contextKey=null;
    $('#context-options').innerHTML='';
    updatePromptGlow();
    return;
  }

  row.hidden=false;
  $('#context-label').textContent=context.label;
  $('#context-options').innerHTML=context.options.map(([key,label])=>
    `<button class="context-pill ${state.contextKey===key?'is-selected':''}" type="button" data-context="${key}">${label}</button>`
  ).join('');
  wireContextPills();
  updatePromptGlow();
}
function chooseReading(slug){
  if(!readings[slug]) return;
  state.slug=slug;
  state.contextKey=null;
  if(slug==='yes-no') state.yesNoCount=null;
  state.selected=[];
  state.deck=[];
  state.required=requiredCount();
  renderReadingPills();
  renderSelectedReading();
  renderContext();
  updatePromptGlow();
  $('#draw-area').hidden=true;
  $('#draw-area').classList.remove('is-ready','is-entering','is-leaving');
  $('#result-area').hidden=true;
  $('#result-area').classList.remove('is-entering');
  requestAnimationFrame(()=>$('#question-input').focus());
}

function clearReading(){
  state.slug=null;
  state.contextKey=null;
  state.deck=[];
  state.selected=[];
  renderReadingPills();
  renderSelectedReading();
  renderContext();
  updatePromptGlow();
  $('#draw-area').hidden=true;
  $('#draw-area').classList.remove('is-ready','is-entering','is-leaving');
  $('#result-area').hidden=true;
  $('#result-area').classList.remove('is-entering');
}

function buildPositionRail(){
  if(!state.slug) return;
  const positions=readings[state.slug].positions.slice(0,state.required);
  $('#position-rail').innerHTML=positions.map((position,index)=>{
    const pick=state.selected[index];
    const filled=Boolean(pick?.placed);
    const card=filled?cardById(pick.id):null;
    const front=filled&&card
      ? `<span class="position-placeholder has-front"><img src="${artworkUrl(card)}" class="${pick.reversed?'is-reversed':''}" alt=""></span>`
      : `<span class="position-placeholder">${index+1}</span>`;
    return `
      <div class="position-slot ${filled?'is-filled':''}" data-slot-index="${index}">
        ${front}
        <p>${position.label}</p>
      </div>
    `;
  }).join('');
}
function wireDeckCards(){
  $$('#deck-track .deck-card').forEach(button=>{
    button.addEventListener('click',event=>{
      event.preventDefault();
      event.stopPropagation();
      pickCard(Number(button.dataset.deckIndex));
    });
  });
}

function buildDeck(){
  const middle=(state.deck.length-1)/2;
  $('#deck-track').innerHTML=state.deck.map((pick,index)=>{
    const t=(index-middle)/Math.max(middle,1);
    const rotate=(t*7).toFixed(2);
    const y=(Math.abs(t)*13).toFixed(1);
    const picked=state.selected.some(item=>item.deckIndex===index);
    const distance=Math.abs(index-middle);
    const dealDelay=Math.round(distance*7);
    const stackShift=(-(index-middle)*41).toFixed(1);
    const stackRotate=(t*14).toFixed(2);
    const shuffleDelay=Math.round((index%6)*12);
    return `
      <button
        class="deck-card ${picked?'is-selected':''}"
        type="button"
        data-deck-index="${index}"
        style="--r:${rotate}deg;--y:${y}px;--deal-delay:${dealDelay}ms;--stack-shift:${stackShift}px;--stack-rotate:${stackRotate}deg;--shuffle-delay:${shuffleDelay}ms"
        aria-label="뒤집힌 카드 ${index+1}">
        <span class="deck-card-inner"></span>
      </button>
    `;
  }).join('');
  wireDeckCards();
}
function updateDraw(){
  $('#selected-count').textContent=state.selected.length;
  $('#required-count').textContent=state.required;
  const allPlaced=state.selected.length===state.required&&state.selected.every(item=>item.placed);
  $('#reveal-button').disabled=!allPlaced;
  $('#reveal-button').classList.toggle('is-ready',allPlaced);
  const left=state.required-state.selected.length;
  $('#draw-note').textContent=left>0
    ?`마음이 가는 카드를 ${left}장 더 골라주세요.`
    :allPlaced?'카드가 모두 놓였어요. 이제 펼쳐볼 수 있어요.':'카드를 자리에 놓고 있어요…';
  buildPositionRail();
  $$('.deck-card').forEach(btn=>{
    btn.classList.toggle('is-selected',state.selected.some(item=>item.deckIndex===Number(btn.dataset.deckIndex)));
  });
}

function openDraw(){
  if(!state.slug){
    $('#reading-pills').animate?.([{transform:'translateX(0)'},{transform:'translateX(-5px)'},{transform:'translateX(5px)'},{transform:'translateX(0)'}],{duration:260});
    return;
  }

  if(state.slug==='yes-no'&&!Number.isInteger(state.yesNoCount)){
    const row=$('#context-row');
    row.classList.remove('needs-choice');
    void row.offsetWidth;
    row.classList.add('needs-choice');
    row.scrollIntoView({behavior:'smooth',block:'center'});
    return;
  }

  const context=readingContexts[state.slug];
  if(context?.options?.length&&!state.contextKey){
    const row=$('#context-row');
    row.classList.remove('needs-choice');
    void row.offsetWidth;
    row.classList.add('needs-choice');
    row.scrollIntoView({behavior:'smooth',block:'center'});
    return;
  }

  state.question=$('#question-input').value.trim();
  state.required=requiredCount();

  if(state.slug==='today'){
    const saved=loadDaily(localStorage);
    if(saved){
      state.selected=[{...saved,deckIndex:-1,placed:true}];
      state.required=1;
      showResult();
      return;
    }
  }

  state.deck=shuffleDeck();
  state.selected=[];
  buildDeck();
  updateDraw();
  $('#result-area').hidden=true;
  const draw=$('#draw-area');
  draw.hidden=false;
  draw.classList.remove('is-ready','is-leaving');
  draw.classList.add('is-entering');

  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    draw.classList.remove('is-entering');
    draw.classList.add('is-ready');
    const browser=$('#deck-browser');
    browser.scrollLeft=Math.max(0,(browser.scrollWidth-browser.clientWidth)/2);
    draw.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
  }));
}
function animatePickToSlot(button,slot,pick){
  const target=slot?.querySelector('.position-placeholder');
  const card=cardById(pick.id);
  const settle=()=>{
    pick.placed=true;
    buildPositionRail();
    const allPlaced=state.selected.length===state.required&&state.selected.every(item=>item.placed);
    $('#reveal-button').disabled=!allPlaced;
    $('#reveal-button').classList.toggle('is-ready',allPlaced);
    if(allPlaced) $('#draw-note').textContent='카드가 모두 놓였어요. 이제 펼쳐볼 수 있어요.';
    const next=$('#position-rail').querySelector(`[data-slot-index="${state.selected.length}"]`);
    next?.classList.add('is-next');
    button?.classList.remove('is-launching');
    button?.classList.add('is-selected');
  };

  if(slot) slot.classList.add('is-receiving');
  if(!button||!target||!card||matchMedia('(prefers-reduced-motion: reduce)').matches||typeof button.animate!=='function'){
    settle();
    return;
  }

  const from=button.getBoundingClientRect();
  const to=target.getBoundingClientRect();
  const flyer=document.createElement('div');
  flyer.className='table-flying-card';
  flyer.setAttribute('aria-hidden','true');
  flyer.innerHTML=`<span class="flight-card-inner"><span class="flight-card-back"></span><span class="flight-card-front"><img src="${artworkUrl(card)}" class="${pick.reversed?'is-reversed':''}" alt=""></span></span>`;
  document.body.appendChild(flyer);

  const startLeft=from.left+(from.width-to.width)/2;
  const startTop=from.top+(from.height-to.height)/2;
  Object.assign(flyer.style,{left:`${startLeft}px`,top:`${startTop}px`,width:`${to.width}px`,height:`${to.height}px`});
  const dx=to.left-startLeft,dy=to.top-startTop,startScale=from.width/to.width;
  const liftScale=Math.min(Math.max(startScale*1.12,.9),1.14);
  const turn=dx>=0?1.8:-1.8;

  button.classList.add('is-launching');
  slot?.classList.add('is-receiving');

  const outer=flyer.animate([
    {transform:'translate3d(0,0,0)',offset:0},
    {transform:`translate3d(${dx*.34}px,${dy*.30-30}px,0) rotateZ(${turn}deg)`,offset:.34},
    {transform:`translate3d(${dx*.76}px,${dy*.73-14}px,0) rotateZ(${turn*.35}deg)`,offset:.76},
    {transform:`translate3d(${dx}px,${dy}px,0) rotateZ(0deg)`,offset:1}
  ],{duration:820,easing:'cubic-bezier(.18,.76,.22,1)',fill:'forwards'});

  const sizing=flyer.animate([
    {scale:String(startScale),offset:0},
    {scale:String(liftScale),offset:.34},
    {scale:String((liftScale+1)/2),offset:.76},
    {scale:'1',offset:1}
  ],{duration:820,easing:'cubic-bezier(.18,.76,.22,1)',fill:'forwards'});

  flyer.querySelector('.flight-card-inner')?.animate([
    {transform:'rotateY(0deg)',offset:0},
    {transform:'rotateY(0deg)',offset:.26},
    {transform:'rotateY(180deg)',offset:.72},
    {transform:'rotateY(180deg)',offset:1}
  ],{duration:740,delay:80,easing:'cubic-bezier(.2,.68,.24,1)',fill:'forwards'});

  outer.finished.then(()=>{
    sizing.cancel();
    flyer.remove();
    slot?.classList.remove('is-receiving');
    settle();
  }).catch(()=>{
    sizing.cancel();
    flyer.remove();
    slot?.classList.remove('is-receiving');
    settle();
  });
}

function pickCard(index){
  if(state.selected.length>=state.required) return;
  if(state.selected.some(item=>item.deckIndex===index)) return;
  const pick=state.deck[index];
  if(!pick) return;

  const slotIndex=state.selected.length;
  const button=$(`[data-deck-index="${index}"]`);
  const slot=$(`[data-slot-index="${slotIndex}"]`);
  state.selected.push({...pick,deckIndex:index,placed:false});

  $('#selected-count').textContent=state.selected.length;
  $('#required-count').textContent=state.required;
  $('#reveal-button').disabled=true;
  $('#reveal-button').classList.remove('is-ready');
  const left=state.required-state.selected.length;
  $('#draw-note').textContent=left>0?`마음이 가는 카드를 ${left}장 더 골라주세요.`:'카드를 자리에 놓고 있어요…';

  animatePickToSlot(button,slot,state.selected.at(-1));
  navigator.vibrate?.(8);
}
function reshuffle(){
  if(!state.slug) return;
  $('#reveal-button').classList.remove('is-ready');
  const draw=$('#draw-area');
  const track=$('#deck-track');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;

  if(reduced){
    state.deck=shuffleDeck();
    state.selected=[];
    buildDeck();
    updateDraw();
    return;
  }

  draw.classList.add('is-ready');
  track.classList.remove('is-shuffling');
  void track.offsetWidth;
  track.classList.add('is-shuffling');

  window.setTimeout(()=>{
    track.classList.remove('is-shuffling');
    draw.classList.remove('is-ready');
    draw.classList.add('is-entering');

    state.deck=shuffleDeck();
    state.selected=[];
    buildDeck();
    updateDraw();

    const browser=$('#deck-browser');
    browser.scrollLeft=Math.max(0,(browser.scrollWidth-browser.clientWidth)/2);

    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      draw.classList.remove('is-entering');
      draw.classList.add('is-ready');
    }));
  },820);
}

function resultCard(pick,index){
  const card=cardById(pick.id);
  const position=readings[state.slug].positions[index];
  return `
    <div class="revealed" style="--delay:${index*130}ms">
      <div class="reveal-card">
        <div class="back"></div>
        <div class="face">
          <img src="${artworkUrl(card)}" class="${pick.reversed?'is-reversed':''}" alt="${card.koreanName} 카드 일러스트">
        </div>
      </div>
      <h3>${card.koreanName}</h3>
      <p>${position?.label||'카드'} · ${pick.reversed?'역방향':'정방향'}</p>
    </div>
  `;
}

function renderInterpretations(picks){
  if(state.slug==='today'){
    const pick=picks[0];
    const card=cardById(pick.id);
    const keywordPhrase=card.keywords.join(' · ');
    const keywordParticle=keywordPhrase==='상실 · 애도'?'를':'을';
    $('#interpretations').innerHTML=`
      <section class="daily-reading-grid">
        ${[
          ['오늘의 전체 흐름',`‘${keywordPhrase}’${keywordParticle} 오늘의 관점으로 삼아보세요. ${pick.reversed?card.reversed:card.upright}로 읽을 수 있습니다.`],
          ['연애',pick.reversed?`오늘은 ${card.reversed}로 읽습니다. ${card.advice}`:card.love],
          ['일 / 학업',`${generalAdvice(card,pick.reversed)} 업무나 공부에서는 이 조언을 오늘 끝낼 작은 과제 하나에 적용해 보세요.`],
          ['금전',`‘${card.keywords[0]}’ 키워드가 나의 소비 태도와 어떻게 닿는지 돌아보세요. 수익이나 손실의 예고가 아니며, 지출은 실제 예산을 확인한 뒤 결정하세요.`],
          ['오늘의 조언',generalAdvice(card,pick.reversed)]
        ].map(([title,text])=>`
          <article class="daily-reading-item">
            <span>${title}</span>
            <p>${text}</p>
          </article>
        `).join('')}
      </section>
    `;
    return;
  }

  $('#interpretations').innerHTML=picks.map((pick,index)=>{
    const r=interpret(state.slug,pick,index);
    const direction=state.slug==='yes-no'
      ?(pick.reversed
        ?'역방향이므로 실행보다 조건 재점검을 우선하는 신호로 반영했습니다.'
        :r.card.yesNo>0
          ?'시도와 개방을 나타내는 상징으로 YES 쪽에 반영했습니다.'
          :r.card.yesNo<0
            ?'멈춤과 재정비를 나타내는 상징으로 NO 쪽에 반영했습니다.'
            :'조건과 관찰이 필요한 중립의 상징으로 반영했습니다.')
      :null;
    return `
      <section class="interpretation">
        <div class="interpretation-index">${String(index+1).padStart(2,'0')} · ${r.position.label}</div>
        <div class="interpretation-body">
          <h3>${r.card.koreanName}<span>${pick.reversed?'reversed':'upright'}</span></h3>
          <div class="keywords">${r.card.keywords.map(keyword=>`<span>${keyword}</span>`).join('')}</div>
          <p class="meaning">${r.meaning}</p>
          <p class="context">${r.context}</p>
          ${r.example?`<p class="example"><strong>상황으로 풀면</strong><span>${r.example}</span></p>`:''}
          ${direction?`<p class="lens">이 카드의 방향성 : ${direction}</p>`:''}
          ${r.lens?`<p class="lens">${r.lens}</p>`:''}
          ${r.caution?`<p class="caution">${r.caution}</p>`:''}
        </div>
      </section>
    `;
  }).join('');
}

function showResult(){
  if(state.selected.length!==state.required||!state.selected.every(item=>item.placed!==false)) return;
  const picks=state.selected.map(({id,reversed})=>({id,reversed}));

  if(state.slug==='today'&&!loadDaily(localStorage)&&picks[0]) saveDaily(localStorage,picks[0]);

  $('#result-question').textContent=state.question?`“${state.question}”`:'';
  $('#revealed-cards').innerHTML=picks.map(resultCard).join('');

  const reading=readings[state.slug];
  const context=contextualInsight(state.slug,state.contextKey,picks);
  const headline=state.slug==='today'?null:readingHeadline(state.slug,picks,state.contextKey);
  const timing=state.slug==='today'?null:timingInsight(state.slug,picks);
  const action=state.slug==='today'?null:nextAction(state.slug,picks,state.contextKey);
  const combinations=state.slug==='today'?[]:combinationInsights(state.slug,picks);
  const summary=state.slug==='today'
    ?[generalAdvice(cardById(picks[0].id),picks[0].reversed),reading.summary]
    :synthesis(state.slug,picks);

  $('#summary-copy').innerHTML=`
    ${headline?`
      <section class="reading-answer">
        <span>이번 리딩의 핵심</span>
        <strong>${headline}</strong>
      </section>
    `:''}
    ${context?`
      <section class="reading-context-answer">
        <span>${context.label} 기준으로 보면</span>
        <p>${context.text}</p>
      </section>
    `:''}
    ${timing||action?`
      <div class="reading-insights">
        ${timing?`
          <section class="insight-card timing-card">
            <span>시기 흐름 · ${timing.label}</span>
            <strong>${timing.range}</strong>
            <p>${timing.text}</p>
            ${timing.basis?`<small>${timing.basis}</small>`:''}
          </section>
        `:''}
        ${action?`
          <section class="insight-card action-card">
            <span>지금 해볼 것</span>
            <strong>한 가지를 바로 움직여보세요.</strong>
            <p>${action}</p>
          </section>
        `:''}
      </div>
    `:''}
    ${combinations.length?`
      <section class="combination-reading">
        <span>CARDS TOGETHER</span>
        <h3>카드를 함께 읽으면</h3>
        <div class="combination-grid">
          ${combinations.map(item=>`
            <article>
              <span>${item.positions}</span>
              <strong>${item.title}</strong>
              <p>${item.text}</p>
            </article>
          `).join('')}
        </div>
      </section>
    `:''}
    <section class="big-picture">
      <span>${state.slug==='today'?'TAKE IT WITH YOU':'THE BIG PICTURE'}</span>
      <h3>${state.slug==='today'?'오늘 가져갈 한 문장':'그래서, 이번 리딩의 결론은'}</h3>
      ${summary.map(line=>`<p>${line}</p>`).join('')}
    </section>
  `;

  const yesno=$('#yesno-result');
  if(state.slug==='yes-no'){
    yesno.hidden=false;
    yesno.innerHTML=`<span>SYMBOLIC DIRECTION</span><strong>${verdict(picks)}</strong><p>카드 방향을 합쳐 지금의 선택을 YES / 보류 / NO 중 하나로 정리했어요.</p>`;
  }else{
    yesno.hidden=true;
    yesno.textContent='';
  }

  renderInterpretations(picks);

  const related=(readings[state.slug]?.related||[]).filter(slug=>readings[slug]);
  $('#result-discovery').innerHTML=`
    <div class="result-discovery-head"><span>KEEP READING</span><h3>다른 타로도 이어서 볼까요?</h3></div>
    <div class="result-reading-links">${related.map(slug=>`<a href="/tarot/${slug}/"><strong>${readings[slug].name}</strong><span>${readings[slug].tagline}</span></a>`).join('')}</div>
    <div class="result-card-links"><span>방금 뽑은 카드 뜻 더 보기</span><div>${picks.map(pick=>{const card=cardById(pick.id);return `<a href="/cards/${cardSlug(card)}/">${card.koreanName} <small>${card.name}</small></a>`}).join('')}</div></div>
    <a class="result-library-link" href="/cards/">타로 카드 78장 전체 보기 →</a>
  `;

  const draw=$('#draw-area');
  const result=$('#result-area');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const enter=()=>{
    draw.hidden=true;
    draw.classList.remove('is-ready','is-leaving');
    result.hidden=false;
    result.classList.remove('is-entering');
    void result.offsetWidth;
    result.classList.add('is-entering');
    requestAnimationFrame(()=>result.scrollIntoView({behavior:reduced?'auto':'smooth',block:'start'}));
  };
  if(reduced) enter();
  else{
    draw.classList.add('is-leaving');
    window.setTimeout(enter,320);
  }

  $('#revealed-cards img').forEach(img=>img.addEventListener('error',()=>{img.style.opacity=.08},{once:true}));
}

function reset(){
  state.slug=null;
  state.question='';
  state.contextKey=null;
  state.deck=[];
  state.selected=[];
  state.required=0;
  state.yesNoCount=null;
  $('#question-input').value='';
  $('#reveal-button').classList.remove('is-ready');
  $('#draw-area').hidden=true;
  $('#draw-area').classList.remove('is-ready','is-entering','is-leaving');
  $('#result-area').hidden=true;
  $('#result-area').classList.remove('is-entering');
  renderReadingPills();
  renderSelectedReading();
  renderContext();
  updatePromptGlow();
  window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
}

function installDeckDrag(){
  const browser=$('#deck-browser');
  let down=false,startX=0,startScroll=0;

  browser.addEventListener('wheel',event=>{
    const delta=Math.abs(event.deltaX)>Math.abs(event.deltaY)?event.deltaX:event.deltaY;
    if(!delta) return;
    event.preventDefault();
    browser.scrollLeft+=delta;
  },{passive:false});

  browser.addEventListener('pointerdown',event=>{
    if(event.target.closest('.deck-card')) return;
    if(event.pointerType==='touch') return;
    down=true;
    startX=event.clientX;
    startScroll=browser.scrollLeft;
    browser.classList.add('is-dragging');
  });

  window.addEventListener('pointermove',event=>{
    if(!down) return;
    browser.scrollLeft=startScroll-(event.clientX-startX);
  });

  const end=()=>{
    down=false;
    browser.classList.remove('is-dragging');
  };
  window.addEventListener('pointerup',end);
  window.addEventListener('pointercancel',end);
}
function installHeroTilt(){
  const deck=$('#floating-deck');
  const host=$('.floating-deck-wrap');
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;

  host.addEventListener('pointermove',event=>{
    const r=host.getBoundingClientRect();
    const nx=(event.clientX-r.left)/r.width-.5;
    const ny=(event.clientY-r.top)/r.height-.5;
    const cx=r.left+r.width/2;
    const cy=r.top+r.height/2;
    const dx=event.clientX-cx;
    const dy=event.clientY-cy;

    deck.style.animation='none';
    deck.style.transform=`
      translate3d(${(nx*34).toFixed(1)}px,${(ny*24-7).toFixed(1)}px,0)
      rotateX(${(-ny*18+3).toFixed(1)}deg)
      rotateY(${(nx*28).toFixed(1)}deg)
    `;

    const fanZoneX=Math.min(165,r.width*.22);
    const fanZoneY=118;
    deck.classList.toggle('is-fanned',Math.abs(dx)<fanZoneX&&Math.abs(dy)<fanZoneY);
  });

  host.addEventListener('pointerleave',()=>{
    deck.classList.remove('is-fanned');
    deck.style.transform='';
    deck.style.animation='';
  });
}

document.addEventListener('click',e=>{
  const reading=e.target.closest('[data-reading]');
  if(reading){chooseReading(reading.dataset.reading);return}

  const action=e.target.closest('[data-action]')?.dataset.action;
  if(!action)return;
  ({
    reset,
    'clear-reading':clearReading,
    reshuffle,
    reveal:showResult
  })[action]?.();
});

$('#prompt-form').addEventListener('submit',e=>{e.preventDefault();openDraw()});
$('#question-input').addEventListener('keydown',e=>{
  if(e.key==='Enter'&&!e.shiftKey){
    e.preventDefault();
    openDraw();
  }
});

renderReadingPills();
renderSelectedReading();
renderContext();
updatePromptGlow();
installDeckDrag();
installHeroTilt();

const initialReading=new URLSearchParams(window.location.search).get('reading');
if(initialReading&&readings[initialReading]){
  chooseReading(initialReading);
  requestAnimationFrame(()=>$('#prompt-form').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'}));
}
