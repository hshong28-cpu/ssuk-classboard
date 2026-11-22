// "Shuffle with your question in mind" before the deck is spread, and a step-back button.
document.addEventListener('DOMContentLoaded',()=>{
 const reduce=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 let needsShuffle=true,shuffling=false;
 // ---- Shuffle ritual panel ----
 const wrap=document.querySelector('.deck-picker-wrap');
 const panel=document.createElement('div');panel.id='shuffle-ritual';panel.className='shuffle-ritual';panel.hidden=true;
 panel.innerHTML='<div class="ritual-deck" aria-hidden="true"><span class="rd l"></span><span class="rd l2"></span><span class="rd r"></span><span class="rd r2"></span><span class="rd top"></span></div>'+
  '<p class="ritual-question" id="ritual-question"></p>'+
  '<p class="ritual-guide" id="ritual-guide" role="status">질문을 마음에 담고, 카드를 섞어 주세요.</p>'+
  '<button type="button" class="btn btn-primary ritual-btn" id="ritual-btn">마음을 담아 카드 섞기</button>';
 wrap.prepend(panel);
 const setBack=()=>{const src=DECK_IMAGES[selectedDeck].back;panel.querySelectorAll('.rd').forEach(s=>s.style.backgroundImage=`url("${src}")`);};
 const sync=()=>{const show=needsShuffle&&!deckOpen;panel.hidden=!show;wrap.classList.toggle('ritual-on',show);
  if(show){setBack();const q=(appState.question||'').trim();const qe=document.getElementById('ritual-question');qe.textContent=q?'“'+q+'”':'';qe.hidden=!q;}};
 const baseOpen=window.openPhysicalDeck;
 window.openPhysicalDeck=function(...a){if(!deckOpen&&needsShuffle){sync();document.getElementById('ritual-btn').focus({preventScroll:true});return;}return baseOpen.apply(this,a);};
 const baseShuffle=window.shuffleAndPrepareDeck;
 window.shuffleAndPrepareDeck=function(...a){needsShuffle=true;shuffling=false;panel.classList.remove('is-shuffling');document.getElementById('ritual-btn').disabled=false;document.getElementById('ritual-guide').textContent='질문을 마음에 담고, 카드를 섞어 주세요.';const r=baseShuffle.apply(this,a);sync();return r;};
 const baseRender=window.renderPhysicalDeck;window.renderPhysicalDeck=function(...a){const r=baseRender.apply(this,a);sync();return r;};
 const baseDeck=window.selectImageDeck;window.selectImageDeck=function(...a){const r=baseDeck.apply(this,a);setBack();return r;};
 document.getElementById('ritual-btn').addEventListener('click',()=>{
  if(shuffling)return;shuffling=true;const btn=document.getElementById('ritual-btn'),guide=document.getElementById('ritual-guide');btn.disabled=true;
  const steps=reduce()?[[0,'다 섞였어요. 카드를 펼칠게요.']]:[[0,'숨을 천천히 고르며 질문을 떠올려 보세요…'],[1300,'카드가 당신의 이야기를 듣고 있어요…'],[2600,'다 섞였어요. 카드를 펼칠게요.']];
  panel.classList.add('is-shuffling');
  steps.forEach(([t,msg])=>setTimeout(()=>{guide.textContent=msg;},t));
  let n=0;const tick=setInterval(()=>{if(++n>4)return clearInterval(tick);playStudioSound('shuffle');},620);
  setTimeout(()=>{clearInterval(tick);panel.classList.remove('is-shuffling');needsShuffle=false;shuffling=false;btn.disabled=false;sync();if(!deckOpen)window.openPhysicalDeck();},reduce()?400:3400);
 });
 sync();
 // ---- Step back ----
 const order=['question','cards','reading','learning'];
 const stepWrap=document.getElementById('step-select')?.closest('.app-select-wrap');
 if(stepWrap){
  const back=document.createElement('button');back.type='button';back.id='step-back';back.className='step-back';back.innerHTML='<span aria-hidden="true">←</span> 이전';back.setAttribute('aria-label','이전 단계로');
  stepWrap.prepend(back);stepWrap.classList.add('has-back');
  const goBack=()=>{const i=order.indexOf(compactStage);
   if(compactStage==='learning'){setCompactStage('reading');return;}
   if(i>0){setCompactStage(order[i-1]);return;}
   if(compactStage==='question'&&typeof intakeTopic!=='undefined'&&intakeTopic)reopenIntakeTopics();};
  back.addEventListener('click',goBack);
  const syncBack=()=>{const topicOpen=compactStage==='question'&&!(typeof intakeTopic!=='undefined'&&intakeTopic);back.disabled=topicOpen;back.hidden=topicOpen;};
  const baseStage=window.setCompactStage;window.setCompactStage=function(...a){const r=baseStage.apply(this,a);syncBack();return r;};
  const baseTopic=window.chooseIntakeTopic;if(baseTopic)window.chooseIntakeTopic=function(...a){const r=baseTopic.apply(this,a);syncBack();return r;};
  const baseReopen=window.reopenIntakeTopics;window.reopenIntakeTopics=function(...a){const r=baseReopen.apply(this,a);setTimeout(syncBack,0);return r;};
  syncBack();
 }
});
