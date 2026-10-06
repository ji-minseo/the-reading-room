import {cards} from './core/data/cards.mjs';
import {readings, primary, secondary, tertiary} from './core/data/readings.mjs';
import {readingContexts} from './core/data/reading-contexts.mjs';
import {
  shuffleDeck,
  interpret,
  synthesis,
  verdict,
  contextualInsight,
  loadDaily,
  saveDaily
} from './core/engine.mjs';

const $ = (selector, root=document) => root.querySelector(selector);
const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];

const state = {
  scene: 'intro',
  slug: null,
  question: '',
  contextKey: null,
  deck: [],
  selected: [],
  required: 0,
  yesNoCount: 3,
  dailySaved: null
};

const artworkAnchors = {
  'major-0':'fool',
  'major-6':'lovers',
  'major-16':'tower',
  'major-18':'moon',
  'major-19':'sun'
};
const artworkBase = 'https://pickacard.everytinytool.com/artwork';

function artworkFile(card){
  return artworkAnchors[card.id] || card.id;
}
function artworkUrl(card){
  return `${artworkBase}/${artworkFile(card)}.webp`;
}
function cardById(id){
  return cards.find(card => card.id === id);
}
function readingOrder(){
  return [...primary, ...secondary, ...tertiary].filter(slug => readings[slug]);
}
function requiredCount(){
  if(state.slug === 'yes-no') return state.yesNoCount;
  return readings[state.slug]?.positions?.length || 1;
}
function scene(name){
  state.scene = name;
  $$('.scene').forEach(section => section.classList.toggle('is-active', section.dataset.scene === name));
  window.scrollTo({top:0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
}
function resetReadingState({keepSlug=false}={}){
  if(!keepSlug) state.slug = null;
  state.question = '';
  state.contextKey = null;
  state.deck = [];
  state.selected = [];
  state.required = 0;
  state.yesNoCount = 3;
  state.dailySaved = null;
}

function renderReadingGrid(){
  const grid = $('#reading-grid');
  grid.innerHTML = readingOrder().map((slug, index) => {
    const r = readings[slug];
    const count = slug === 'yes-no' ? '1–3 cards' : `${r.positions.length} card${r.positions.length > 1 ? 's' : ''}`;
    return `
      <button class="reading-option" type="button" data-reading="${slug}">
        <span class="index">${String(index+1).padStart(2,'0')}</span>
        <span class="mark" aria-hidden="true">${r.mark || '◇'}</span>
        <h3>${r.name}</h3>
        <p>${r.tagline}</p>
        <small>${count}</small>
      </button>
    `;
  }).join('');
}

function selectReading(slug){
  if(!readings[slug]) return;
  state.slug = slug;
  state.selected = [];
  state.deck = [];
  state.question = '';
  state.required = slug === 'yes-no' ? state.yesNoCount : readings[slug].positions.length;
  state.dailySaved = slug === 'today' ? loadDaily(localStorage) : null;

  if(slug === 'today' && state.dailySaved){
    $('#daily-return').hidden = false;
    return;
  }
  renderQuestion();
  scene('question');
}

function renderQuestion(){
  const r = readings[state.slug];
  $('#ticket-mark').textContent = r.mark || '◇';
  $('#ticket-eyebrow').textContent = r.eyebrow || '';
  $('#ticket-name').textContent = r.name;
  $('#ticket-description').textContent = r.description;
  $('#ticket-count').textContent = state.slug === 'yes-no'
    ? '1–3 cards · choose your depth'
    : `${r.positions.length} card${r.positions.length > 1 ? 's' : ''} · ${r.positions.map(p=>p.label).join(' · ')}`;
  $('#question-intro').textContent = r.intro || '';
  $('#question-input').placeholder = r.question || '질문을 한 문장으로 적어보세요.';
  $('#question-input').value = state.question;
  $('#question-count').textContent = state.question.length;

  const context = readingContexts[state.slug];
  const contextBlock = $('#context-block');
  if(context?.options?.length){
    contextBlock.hidden = false;
    $('#context-label').textContent = context.label;
    state.contextKey = state.contextKey || context.options[0][0];
    $('#context-options').innerHTML = context.options.map(([key,label]) =>
      `<button type="button" data-context="${key}" class="${state.contextKey===key?'is-selected':''}">${label}</button>`
    ).join('');
  } else {
    contextBlock.hidden = true;
    $('#context-options').innerHTML = '';
    state.contextKey = null;
  }

  const yesNo = $('#yesno-count');
  yesNo.hidden = state.slug !== 'yes-no';
  $$('[data-count]', yesNo).forEach(button => {
    button.classList.toggle('is-selected', Number(button.dataset.count) === state.yesNoCount);
  });
}

function buildPositionRail(){
  const r = readings[state.slug];
  const positions = r.positions.slice(0, state.required);
  $('#position-rail').innerHTML = positions.map((position,index) => {
    const filled = Boolean(state.selected[index]);
    return `
      <button class="position-slot ${filled?'is-filled':''}" type="button" data-slot-index="${index}" ${filled?'':'disabled'} aria-label="${filled?'선택 취소: ':''}${position.label}">
        <span class="slot-card" data-number="${index+1}">
          ${filled?'<span class="slot-mini-back"></span>':''}
        </span>
        <p>${position.label}</p>
      </button>
    `;
  }).join('');
}

function buildFan(){
  const center = (state.deck.length - 1) / 2;
  $('#fan-track').innerHTML = state.deck.map((pick,index) => {
    const t = (index - center) / Math.max(center,1);
    const rotate = (t * 8).toFixed(2);
    const y = (Math.abs(t) * 18).toFixed(1);
    const selected = state.selected.some(item => item.deckIndex === index);
    return `
      <button class="fan-card ${selected?'is-selected':''}" type="button" role="listitem"
        data-deck-index="${index}"
        style="--fan-rotate:${rotate}deg;--fan-y:${y}px"
        aria-label="뒤집힌 카드 ${index+1}${selected?', 선택됨':''}">
        <span class="physical-card"></span>
      </button>
    `;
  }).join('');
}

function updateSelectionUI(){
  $('#selected-count').textContent = state.selected.length;
  $('#required-count').textContent = state.required;
  const remaining = state.required - state.selected.length;
  $('#deck-instruction').textContent = remaining > 0
    ? `천천히 훑어보고 마음이 가는 카드를 ${remaining}장 더 골라주세요.`
    : '카드가 모두 놓였습니다. 준비되면 한 장씩 펼쳐보세요.';
  $('#reveal-button').disabled = state.selected.length !== state.required;
  buildPositionRail();

  $$('.fan-card').forEach(button => {
    const selected = state.selected.some(item => item.deckIndex === Number(button.dataset.deckIndex));
    button.classList.toggle('is-selected', selected);
    button.setAttribute('aria-label', `뒤집힌 카드 ${Number(button.dataset.deckIndex)+1}${selected?', 선택됨':''}`);
  });
}

function prepareDeck(){
  if(!state.slug) return;
  state.question = $('#question-input')?.value.trim() || '';
  state.required = requiredCount();

  if(state.slug === 'today'){
    const saved = loadDaily(localStorage);
    if(saved){
      state.selected = [{...saved, deckIndex:-1}];
      state.required = 1;
      showResult();
      return;
    }
  }

  state.deck = shuffleDeck();
  state.selected = [];
  $('#selected-count').textContent = '0';
  $('#required-count').textContent = state.required;
  buildFan();
  buildPositionRail();
  updateSelectionUI();
  scene('deck');

  requestAnimationFrame(() => {
    const viewport = $('#fan-viewport');
    viewport.scrollLeft = Math.max(0, (viewport.scrollWidth - viewport.clientWidth) / 2);
  });
}

function selectCard(index){
  if(state.selected.length >= state.required) return;
  if(state.selected.some(item => item.deckIndex === index)) return;
  const pick = state.deck[index];
  if(!pick) return;
  state.selected.push({...pick, deckIndex:index});
  updateSelectionUI();

  if(navigator.vibrate) navigator.vibrate(9);
}

function unselectSlot(index){
  if(index < 0 || index >= state.selected.length) return;
  state.selected.splice(index,1);
  updateSelectionUI();
}

function reshuffle(){
  state.deck = shuffleDeck();
  state.selected = [];
  buildFan();
  updateSelectionUI();
  const viewport = $('#fan-viewport');
  viewport.scrollLeft = Math.max(0,(viewport.scrollWidth-viewport.clientWidth)/2);
}

function resultCardMarkup(pick,index){
  const card = cardById(pick.id);
  const position = readings[state.slug].positions[index];
  const delay = `${index * 150}ms`;
  return `
    <div class="reveal-item" style="animation-delay:${index*90}ms">
      <div class="result-card" style="--delay:${delay}">
        <div class="result-back">
          <div class="card-back-design">
            <span class="back-frame"></span>
            <span class="back-orbit orbit-a"></span>
            <span class="back-orbit orbit-b"></span>
            <span class="back-center"><i></i><b>R</b><i></i></span>
          </div>
        </div>
        <div class="result-front">
          <figure>
            <span class="art-fallback" aria-hidden="true">✦</span>
            <img src="${artworkUrl(card)}" alt="${card.koreanName} 카드 일러스트" class="${pick.reversed?'is-reversed':''}" loading="eager">
          </figure>
        </div>
      </div>
      <h3>${card.koreanName}</h3>
      <p>${position?.label || '카드'} · ${pick.reversed?'역방향':'정방향'}</p>
    </div>
  `;
}

function renderInterpretations(){
  const container = $('#interpretations');
  container.innerHTML = state.selected.map((pick,index) => {
    const result = interpret(state.slug,pick,index);
    return `
      <section class="interpretation">
        <div class="interpretation-index">0${index+1} · ${result.position.label}</div>
        <div class="interpretation-body">
          <h3>${result.card.koreanName}<span>${pick.reversed?'reversed':'upright'}</span></h3>
          <p class="meaning">${result.meaning}</p>
          <p class="context">${result.context}</p>
          ${result.example ? `<p class="example">${result.example}</p>` : ''}
        </div>
      </section>
    `;
  }).join('');
}

function showResult(){
  if(state.selected.length !== state.required) return;

  const cleanPicks = state.selected.map(({id,reversed}) => ({id,reversed}));
  if(state.slug === 'today' && !loadDaily(localStorage) && cleanPicks[0]){
    saveDaily(localStorage,cleanPicks[0]);
  }

  const question = state.question || readings[state.slug].question || '';
  $('#result-question').textContent = question ? `“${question}”` : '';
  $('#revealed-spread').innerHTML = cleanPicks.map(resultCardMarkup).join('');

  const summary = synthesis(state.slug,cleanPicks);
  const context = contextualInsight(state.slug,state.contextKey,cleanPicks);
  $('#summary-copy').innerHTML = [
    ...summary,
    ...(context ? [`${context.label} 맥락에서는 ${context.text}`] : [])
  ].map(line => `<p>${line}</p>`).join('');

  const verdictBox = $('#yesno-verdict');
  if(state.slug === 'yes-no'){
    verdictBox.hidden = false;
    verdictBox.textContent = verdict(cleanPicks);
  } else {
    verdictBox.hidden = true;
    verdictBox.textContent = '';
  }

  state.selected = cleanPicks.map((pick,index)=>({...pick,deckIndex:state.selected[index]?.deckIndex ?? -1}));
  renderInterpretations();
  scene('result');

  $$('#revealed-spread img').forEach(img => {
    img.addEventListener('error', () => img.style.display='none', {once:true});
  });
}

function resumeDaily(){
  const saved = loadDaily(localStorage);
  $('#daily-return').hidden = true;
  if(!saved){
    selectReading('today');
    return;
  }
  state.slug = 'today';
  state.question = '';
  state.contextKey = null;
  state.required = 1;
  state.selected = [{...saved,deckIndex:-1}];
  showResult();
}

function goHome(){
  resetReadingState();
  $('#daily-return').hidden = true;
  scene('intro');
}

function restart(){
  resetReadingState();
  scene('readings');
}

function installFanDrag(){
  const viewport = $('#fan-viewport');
  let down = false, startX = 0, startScroll = 0, moved = false;
  viewport.addEventListener('pointerdown', event => {
    down = true;
    moved = false;
    startX = event.clientX;
    startScroll = viewport.scrollLeft;
    viewport.setPointerCapture?.(event.pointerId);
  });
  viewport.addEventListener('pointermove', event => {
    if(!down) return;
    const dx = event.clientX - startX;
    if(Math.abs(dx) > 5) moved = true;
    viewport.scrollLeft = startScroll - dx;
  });
  const end = () => { down = false; };
  viewport.addEventListener('pointerup',end);
  viewport.addEventListener('pointercancel',end);
  viewport.addEventListener('click', event => {
    if(moved){
      event.preventDefault();
      event.stopPropagation();
      moved = false;
    }
  },true);
}

function installHeroTilt(){
  const object = $('#floating-deck');
  const host = $('.hero-object');
  if(!object || !host || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  host.addEventListener('pointermove',event => {
    const r = host.getBoundingClientRect();
    const x = (event.clientX-r.left)/r.width-.5;
    const y = (event.clientY-r.top)/r.height-.5;
    object.style.animation = 'none';
    object.style.transform = `translate3d(0,-5px,0) rotateX(${(-y*9+3).toFixed(2)}deg) rotateY(${(x*13).toFixed(2)}deg) rotateZ(${(x*2).toFixed(2)}deg)`;
  });
  host.addEventListener('pointerleave',()=>{
    object.style.transform = '';
    object.style.animation = '';
  });
}

document.addEventListener('click',event => {
  const reading = event.target.closest('[data-reading]');
  if(reading){
    selectReading(reading.dataset.reading);
    return;
  }

  const context = event.target.closest('[data-context]');
  if(context){
    state.contextKey = context.dataset.context;
    $$('[data-context]').forEach(button => button.classList.toggle('is-selected',button===context));
    return;
  }

  const count = event.target.closest('[data-count]');
  if(count){
    state.yesNoCount = Number(count.dataset.count);
    state.required = state.yesNoCount;
    $$('[data-count]').forEach(button => button.classList.toggle('is-selected',button===count));
    $('#ticket-count').textContent = `${state.yesNoCount} card${state.yesNoCount>1?'s':''} · choose your depth`;
    return;
  }

  const fan = event.target.closest('[data-deck-index]');
  if(fan){
    selectCard(Number(fan.dataset.deckIndex));
    return;
  }

  const slot = event.target.closest('[data-slot-index]');
  if(slot && !slot.disabled){
    unselectSlot(Number(slot.dataset.slotIndex));
    return;
  }

  const action = event.target.closest('[data-action]')?.dataset.action;
  if(!action) return;
  ({
    home: goHome,
    'open-readings': () => { resetReadingState(); scene('readings'); },
    daily: () => selectReading('today'),
    'prepare-deck': prepareDeck,
    reshuffle,
    reveal: showResult,
    restart,
    'close-daily': () => { $('#daily-return').hidden = true; },
    'resume-daily': resumeDaily
  })[action]?.();
});

$('#question-input').addEventListener('input',event => {
  state.question = event.target.value;
  $('#question-count').textContent = event.target.value.length;
});

renderReadingGrid();
installFanDrag();
installHeroTilt();
