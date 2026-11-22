// Choose a preferred deck at the start; Joseon-only touches follow the chosen deck.
document.addEventListener('DOMContentLoaded',()=>{
 const DECKS=[
  {id:'joseon',name:'조선 덱',desc:'한복과 궁궐, 산수를 금빛으로 그린 덱. 마패를 든 암행어사가 함께해요.'},
  {id:'family',name:'가족 이미지 덱',desc:'노을빛 풍경 속 오늘의 사람들. 따뜻한 일상 그림의 덱이에요.'}
 ];
 const syncBody=()=>{document.body.classList.toggle('deck-joseon',selectedDeck==='joseon');document.body.classList.toggle('deck-family',selectedDeck==='family');};
 const topic=document.querySelector('.topic-first');
 if(topic){
  const box=document.createElement('div');box.className='deck-pick';box.setAttribute('role','radiogroup');box.setAttribute('aria-labelledby','deck-pick-title');
  box.innerHTML='<p class="deck-pick-title" id="deck-pick-title">먼저, 마음이 끌리는 덱을 골라 주세요</p><div class="deck-pick-row">'+DECKS.map(d=>
   `<button type="button" class="deck-opt" role="radio" data-deck="${d.id}"><span class="deck-opt-cards" aria-hidden="true"><img alt="" data-face></span><span class="deck-opt-text"><strong>${d.name}</strong><span>${d.desc}</span></span></button>`).join('')+'</div>';
  topic.prepend(box);
  const paint=()=>{box.querySelectorAll('.deck-opt').forEach(b=>{const on=b.dataset.deck===selectedDeck;b.setAttribute('aria-checked',String(on));b.tabIndex=on?0:-1;b.classList.toggle('is-on',on);
   const im=b.querySelector('[data-face]');im.src=DECK_IMAGES[b.dataset.deck]['major-0'];const back=DECK_IMAGES[b.dataset.deck].back;b.querySelector('.deck-opt-cards').style.setProperty('--back',`url("${back}")`);});};
  box.addEventListener('click',e=>{const b=e.target.closest('.deck-opt');if(!b)return;selectImageDeck(b.dataset.deck);paint();syncBody();});
  box.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();const i=DECKS.findIndex(d=>d.id===selectedDeck),n=DECKS[(i+1)%DECKS.length];selectImageDeck(n.id);paint();syncBody();box.querySelector(`[data-deck="${n.id}"]`).focus();});
  const base=window.selectImageDeck;window.selectImageDeck=function(...a){const r=base.apply(this,a);paint();syncBody();return r;};
  paint();
 }
 syncBody();
});
