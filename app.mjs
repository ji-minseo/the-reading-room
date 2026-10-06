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

function renderContext(){
  const row=$('#context-row');
  const context=state.slug?readingContexts[state.slug]:null;
  if(!context?.options?.length){
    row.hidden=true;
    state.contextKey=null;
    $('#context-options').innerHTML='';
    return;
  }
  if(!state.contextKey||!context.options.some(([key])=>key===state.contextKey)) state.contextKey=context.options[0][0];
  row.hidden=false;
  $('#context-label').textContent=context.label;
  $('#context-options').innerHTML=context.options.map(([key,label])=>
    `<button class="context-pill ${state.contextKey===key?'is-selected':''}" type="button" data-context="${key}">${label}</button>`
  ).join('');
}

function chooseReading(slug){
  if(!readings[slug]) return;
  state.slug=slug;
  state.contextKey=null;
  state.selected=[];
  state.deck=[];
  state.required=requiredCount();
  renderReadingPills();
  renderSelectedReading();
  renderContext();
  $('#draw-area').hidden=true;
  $('#result-area').hidden=true;
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
    const filled=Boolean(state.selected[index]);
    return `
      <button class="position-slot ${filled?'is-filled':''}" type="button" data-slot-index="${index}" ${filled?'':'disabled'}>
        <span class="position-placeholder">${filled?'':index+1}</span>
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
    return `
      <button class="deck-card ${picked?'is-selected':''}" type="button" data-deck-index="${index}" style="--r:${rotate}deg;--y:${y}px" aria-label="뒤집힌 카드 ${index+1}">
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
  $('#draw-area').hidden=false;

  requestAnimationFrame(()=>{
    const browser=$('#deck-browser');
    browser.scrollLeft=Math.max(0,(browser.scrollWidth-browser.clientWidth)/2);
    $('#draw-area').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
  });
}

function pickCard(index){
  if(state.selected.length>=state.required) return;
  if(state.selected.some(item=>item.deckIndex===index)) return;
  const pick=state.deck[index];
  if(!pick) return;
  state.selected.push({...pick,deckIndex:index});
  updateDraw();
  navigator.vibrate?.(8);
}

function unpick(index){
  if(index<0||index>=state.selected.length) return;
  state.selected.splice(index,1);
  updateDraw();
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
  $('#draw-area').hidden=true;
  $('#result-area').hidden=false;

  $$('#revealed-cards img').forEach(img=>img.addEventListener('error',()=>{img.style.opacity=.08},{once:true}));

  requestAnimationFrame(()=>{
    $('#result-area').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
  });
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
    $$('.context-pill').forEach(btn=>btn.classList.toggle('is-selected',btn===context));
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
