import {cards} from './core/data/cards.mjs';
import {readings, primary, secondary, tertiary} from './core/data/readings.mjs';
import {readingContexts} from './core/data/reading-contexts.mjs';
import {shuffleDeck, interpret, synthesis, verdict, contextualInsight, loadDaily, saveDaily} from './core/engine.mjs';

const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];

const state={
  slug:null,
  question:'',
  contextKey:null,
  deck:[],
  selected:[],
  required:0,
  yesNoCount:3
};

const artworkAnchors={'major-0':'fool','major-6':'lovers','major-16':'tower','major-18':'moon','major-19':'sun'};
const artworkBase='https://pickacard.everytinytool.com/artwork';
const order=[...primary,...secondary,...tertiary].filter(slug=>readings[slug]);

function cardById(id){return cards.find(c=>c.id===id)}
function artworkFile(card){return artworkAnchors[card.id]||card.id}
function artworkUrl(card){return `${artworkBase}/${artworkFile(card)}.webp`}
function requiredCount(){
  if(state.slug==='yes-no') return state.yesNoCount;
  return readings[state.slug]?.positions.length||1;
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
    };
  });
  $$('#context-options [data-count]').forEach(button=>{
    button.onclick=()=>{
      state.yesNoCount=Number(button.dataset.count);
      state.required=state.yesNoCount;
      $$('#context-options [data-count]').forEach(node=>node.classList.toggle('is-selected',node===button));
      $('#context-row').classList.remove('needs-choice');
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
    return;
  }

  const context=state.slug?readingContexts[state.slug]:null;
  if(!context?.options?.length){
    row.hidden=true;
    state.contextKey=null;
    $('#context-options').innerHTML='';
    return;
  }

  row.hidden=false;
  $('#context-label').textContent=context.label;
  $('#context-options').innerHTML=context.options.map(([key,label])=>
    `<button class="context-pill ${state.contextKey===key?'is-selected':''}" type="button" data-context="${key}">${label}</button>`
  ).join('');
  wireContextPills();
}
function chooseReading(slug){
  if(!readings[slug]) return;
  state.slug=slug;
  state.contextKey=null;
  if(slug==='yes-no') state.yesNoCount=3;
  state.selected=[];
  state.deck=[];
  state.required=requiredCount();
  renderReadingPills();
  renderSelectedReading();
  renderContext();
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
  $('#draw-area').hidden=true;
  $('#result-area').hidden=true;
}

function buildPositionRail(){
  if(!state.slug) return;
  const positions=readings[state.slug].positions.slice(0,state.required);
  $('#position-rail').innerHTML=positions.map((position,index)=>{
    const pick=state.selected[index];
    const filled=Boolean(pick);
    const card=filled?cardById(pick.id):null;
    const front=filled&&card
      ? `<span class="position-placeholder has-front"><img src="${artworkUrl(card)}" class="${pick.reversed?'is-reversed':''}" alt=""></span>`
      : `<span class="position-placeholder">${index+1}</span>`;
    return `
      <button class="position-slot ${filled?'is-filled':''}" type="button" data-slot-index="${index}" ${filled?'':'disabled'}>
        ${front}
        <p>${position.label}</p>
      </button>
    `;
  }).join('');
}
function buildDeck(){
  const middle=(state.deck.length-1)/2;
  $('#deck-track').innerHTML=state.deck.map((pick,index)=>{
    const t=(index-middle)/Math.max(middle,1);
    const rotate=(t*7).toFixed(2);
    const y=(Math.abs(t)*13).toFixed(1);
    const picked=state.selected.some(item=>item.deckIndex===index);
    const dealDelay=Math.min(index,28)*9;
    return `
      <button class="deck-card ${picked?'is-selected':''}" type="button" data-deck-index="${index}" style="--r:${rotate}deg;--y:${y}px;--deal-delay:${dealDelay}ms" aria-label="뒤집힌 카드 ${index+1}">
        <span class="deck-card-inner"></span>
      </button>
    `;
  }).join('');
}

function updateDraw(){
  $('#selected-count').textContent=state.selected.length;
  $('#required-count').textContent=state.required;
  $('#reveal-button').disabled=state.selected.length!==state.required;
  const left=state.required-state.selected.length;
  $('#draw-note').textContent=left>0?`마음이 가는 카드를 ${left}장 더 골라주세요.`:'카드가 모두 놓였어요. 이제 펼쳐볼 수 있어요.';
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
      state.selected=[{...saved,deckIndex:-1}];
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
    buildPositionRail();
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
  state.selected.push({...pick,deckIndex:index});

  $('#selected-count').textContent=state.selected.length;
  $('#required-count').textContent=state.required;
  $('#reveal-button').disabled=state.selected.length!==state.required;
  const left=state.required-state.selected.length;
  $('#draw-note').textContent=left>0?`마음이 가는 카드를 ${left}장 더 골라주세요.`:'카드가 모두 놓였어요. 이제 펼쳐볼 수 있어요.';

  animatePickToSlot(button,slot,state.selected.at(-1));
  navigator.vibrate?.(8);
}
function unpick(index){
  if(index<0||index>=state.selected.length) return;
  state.selected.splice(index,1);
  buildDeck();
  updateDraw();
  $('#draw-area').classList.add('is-ready');
}

function reshuffle(){
  if(!state.slug) return;
  state.deck=shuffleDeck();
  state.selected=[];
  buildDeck();
  updateDraw();
  const browser=$('#deck-browser');
  browser.scrollLeft=Math.max(0,(browser.scrollWidth-browser.clientWidth)/2);
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
  $('#interpretations').innerHTML=picks.map((pick,index)=>{
    const r=interpret(state.slug,pick,index);
    return `
      <section class="interpretation">
        <div class="interpretation-index">0${index+1} · ${r.position.label}</div>
        <div class="interpretation-body">
          <h3>${r.card.koreanName}<span>${pick.reversed?'reversed':'upright'}</span></h3>
          <p class="meaning">${r.meaning}</p>
          <p class="context">${r.context}</p>
          ${r.example?`<p class="example">${r.example}</p>`:''}
        </div>
      </section>
    `;
  }).join('');
}

function showResult(){
  if(state.selected.length!==state.required) return;
  const picks=state.selected.map(({id,reversed})=>({id,reversed}));

  if(state.slug==='today'&&!loadDaily(localStorage)&&picks[0]) saveDaily(localStorage,picks[0]);

  $('#result-question').textContent=state.question?`“${state.question}”`:'';
  $('#revealed-cards').innerHTML=picks.map(resultCard).join('');

  const summary=synthesis(state.slug,picks);
  const context=contextualInsight(state.slug,state.contextKey,picks);
  $('#summary-copy').innerHTML=[
    ...summary,
    ...(context?[`${context.label} 맥락에서는 ${context.text}`]:[])
  ].map(line=>`<p>${line}</p>`).join('');

  const yesno=$('#yesno-result');
  if(state.slug==='yes-no'){
    yesno.hidden=false;
    yesno.textContent=verdict(picks);
  }else{
    yesno.hidden=true;
    yesno.textContent='';
  }

  renderInterpretations(picks);

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
  state.yesNoCount=3;
  $('#question-input').value='';
  $('#draw-area').hidden=true;
  $('#result-area').hidden=true;
  renderReadingPills();
  renderSelectedReading();
  renderContext();
  window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
}

function installDeckDrag(){
  const browser=$('#deck-browser');
  let down=false,startX=0,startScroll=0,moved=false;
  browser.addEventListener('pointerdown',e=>{
    down=true;moved=false;startX=e.clientX;startScroll=browser.scrollLeft;
    browser.setPointerCapture?.(e.pointerId);
  });
  browser.addEventListener('pointermove',e=>{
    if(!down)return;
    const dx=e.clientX-startX;
    if(Math.abs(dx)>5)moved=true;
    browser.scrollLeft=startScroll-dx;
  });
  const end=()=>{down=false};
  browser.addEventListener('pointerup',end);
  browser.addEventListener('pointercancel',end);
  browser.addEventListener('click',e=>{
    if(moved){e.preventDefault();e.stopPropagation();moved=false}
  },true);
}

function installHeroTilt(){
  const deck=$('#floating-deck');
  const host=$('.floating-deck-wrap');
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  host.addEventListener('pointermove',e=>{
    const r=host.getBoundingClientRect();
    const x=(e.clientX-r.left)/r.width-.5;
    const y=(e.clientY-r.top)/r.height-.5;
    deck.style.animation='none';
    deck.style.transform=`translateY(-4px) rotateX(${(-y*8+2).toFixed(1)}deg) rotateY(${(x*12).toFixed(1)}deg)`;
  });
  host.addEventListener('pointerleave',()=>{deck.style.transform='';deck.style.animation=''});
}

document.addEventListener('click',e=>{
  const reading=e.target.closest('[data-reading]');
  if(reading){chooseReading(reading.dataset.reading);return}

  const context=e.target.closest('[data-context]');
  if(context){
    state.contextKey=context.dataset.context;
    $('.context-pill').forEach(btn=>btn.classList.toggle('is-selected',btn===context));
    return;
  }

  const count=e.target.closest('[data-count]');
  if(count){
    state.yesNoCount=Number(count.dataset.count);
    state.required=state.yesNoCount;
    renderContext();
    return;
  }

  const deckCard=e.target.closest('[data-deck-index]');
  if(deckCard){pickCard(Number(deckCard.dataset.deckIndex));return}

  const slot=e.target.closest('[data-slot-index]');
  if(slot&&!slot.disabled){unpick(Number(slot.dataset.slotIndex));return}

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
installDeckDrag();
installHeroTilt();
