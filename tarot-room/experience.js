// Physical spread, room entrance, and contextual teaching.
let roomEntered=false,deckOpen=false;
function enterReadingRoom(){
 if(roomEntered)return;roomEntered=true;
 const room=document.getElementById('room-entrance'),main=document.querySelector('main');
 if(document.getElementById('entrance-sound').checked&&!soundEnabled)toggleStudioSound();
 room.classList.add('is-entering');
 setTimeout(()=>{room.hidden=true;main.inert=false;document.body.classList.remove('at-entrance');document.getElementById('room-welcome').focus();},motionPreference()==='auto'?0:850);
}
function openPhysicalDeck(){deckOpen=!deckOpen;renderDeckFan(false);if(deckOpen)playStudioSound('shuffle');}
function hoverFanCard(i){
 const cards=document.querySelectorAll('#deck-fan .fan-card');cards.forEach((c,k)=>{const hovered=k===i&&!c.disabled;c.classList.toggle('is-hovered',hovered);if(hovered)c.style.setProperty('z-index','3000','important');else c.style.removeProperty('z-index');});
}
function chooseFanCard(i){
 const card=document.querySelector(`#deck-fan [data-fan-index="${i}"]`);
 if(!deckOpen||!card||card.disabled)return;
 pickCandidateCard(i);
}
function focusNextFanCard(current,direction){
 const cards=[...document.querySelectorAll('#deck-fan .fan-card')];let i=current;
 for(let n=0;n<cards.length;n++){i=(i+direction+cards.length)%cards.length;if(!cards[i].disabled){cards.forEach((c,k)=>c.tabIndex=k===i?0:-1);cards[i].focus();break;}}
}
function renderPhysicalDeck(){
 const el=document.getElementById('deck-fan');if(!el)return;const wasOpen=el.classList.contains('is-open');
 const picked=new Set(appState.drawnSlots.map(s=>s.card.id));const full=appState.drawnSlots.length>=SPREADS[appState.spread].count;
 const firstAvailable=appState.candidatePool.findIndex(c=>!picked.has(c.id));
 el.className='deck-fan physical-deck curved-fan direct-choice-fan '+(deckOpen?'is-open':'is-closed');
 if(deckOpen&&!wasOpen)el.classList.add('laying-cards');
 el.onpointerleave=()=>el.querySelectorAll('.is-hovered').forEach(c=>{c.classList.remove('is-hovered');c.style.removeProperty('z-index');});
 el.setAttribute('aria-label','원하는 카드를 직접 눌러 고르는 부채꼴 타로 카드');
 el.innerHTML=appState.candidatePool.map((card,i)=>{const halfArc=24*Math.PI/180;
 const angle=(2*i/(appState.candidatePool.length-1)-1)*halfArc;
 const x=3500*Math.sin(angle);
 const y=3500*(Math.cos(angle)-Math.cos(halfArc));
 return `<button type="button" class="fan-card" data-fan-index="${i}" style="--card-x:${x.toFixed(2)}px;--card-y:${y.toFixed(2)}px;--card-angle:${(-angle*180/Math.PI).toFixed(2)}deg;--lay-time:${Math.round(80+1250*i/(appState.candidatePool.length-1))}ms;--deal-delay:${i*5}ms;--fan-order:${i}" aria-label="뒷면 카드 ${i+1}번째 / ${appState.candidatePool.length}장 중 뽑기${picked.has(card.id)?', 이미 선택함':''}" tabindex="${i===firstAvailable?0:-1}" ${!deckOpen||full||picked.has(card.id)?'disabled':''} onclick="if(event.detail===0)chooseFanCard(${i})" onkeydown="if(event.key==='ArrowRight'){event.preventDefault();focusNextFanCard(${i},1)}else if(event.key==='ArrowLeft'){event.preventDefault();focusNextFanCard(${i},-1)}">${getCardBackSvg(true)}</button>`;}).join('');
 const b=document.getElementById('open-deck');if(b){b.textContent=deckOpen?'카드 모으기':'천 위에 78장 펼치기';b.setAttribute('aria-expanded',String(deckOpen));}
 document.getElementById('fan-browse-controls')?.remove();
 const hint=document.getElementById('physical-deck-hint');if(hint)hint.textContent=full?'직접 고른 카드를 위에서 눌러 뒤집어 보세요.':deckOpen?'옆으로 밀어 둘러보고, 마음 가는 카드를 눌러 고르세요.':'스프레드 천 위에서 한 손으로 카드를 펼쳐드릴게요.';
 if(deckOpen&&!wasOpen)requestAnimationFrame(()=>{el.parentElement.scrollLeft=(el.parentElement.scrollWidth-el.parentElement.clientWidth)/2;});
}
const everydayScenes={
 wands:['새 프로젝트를 맡아 첫 제안서를 쓰려는 상황','지금 직장을 유지할지 새로운 제안을 받을지 계획을 비교하는 상황','보낸 제안에 답이 오기를 기다리면서 다음 기회를 준비하는 상황','팀 과제를 마치고 함께 축하하며 다음 일정 전 쉬는 상황','회의에서 의견이 엇갈려 누가 무엇을 맡을지 조정하는 상황','꾸준히 준비한 일이 인정받아 다음 역할을 맡는 상황','내 방식에 대한 반대 의견 앞에서 근거를 정리해 설명하는 상황','미뤄졌던 연락과 일정이 한꺼번에 잡혀 우선순위를 정하는 상황','지친 상태에서 마무리를 앞두고 무리하지 않도록 선을 긋는 상황','부탁을 모두 받아 혼자 일이 쌓여 역할을 나눠야 하는 상황','관심 있는 분야의 수업을 찾아 첫 경험을 해보는 상황','아이디어가 떠올라 바로 실행하고 싶지만 지속 계획도 필요한 상황','내 경험을 믿고 모임이나 일을 자신 있게 이끄는 상황','큰 목표를 세우고 사람과 자원을 배치해 실행하는 상황'],
 cups:['누군가에게 호감이 생기거나 마음을 나누기 시작하는 상황','서로 원하는 연락 방식과 약속을 이야기해 맞추는 상황','친구들과 만나 도움을 주고받으며 함께 기뻐하는 상황','좋은 제안이 있어도 마음이 지쳐 관심이 가지 않는 상황','어긋난 약속이 계속 생각나 남아 있는 관계의 장점을 놓치는 상황','익숙한 사람을 만나 편안함을 느끼고 예전 경험을 떠올리는 상황','여러 선택지가 매력적이지만 실제 조건은 확인하지 못한 상황','정이 남아도 더는 맞지 않는 모임에서 거리를 두려는 상황','다른 사람의 평가보다 내가 만족하는 하루를 보내는 상황','가족이나 가까운 사람과 함께 보낼 일상을 구체적으로 그리는 상황','마음을 표현할 작은 메시지를 조심스럽게 보내는 상황','호감을 전하거나 화해를 제안하며 관계에 다가가는 상황','상대의 감정을 듣되 내 감정도 함께 돌보는 상황','갈등이 있어도 감정에 휩쓸리지 않고 대화를 이끄는 상황'],
 swords:['복잡한 문제에서 사실을 정리하고 핵심 질문을 세우는 상황','어느 쪽도 놓치기 싫어 결정을 보류하고 있는 상황','기대했던 말을 듣지 못해 상처와 사실을 나눠 정리하는 상황','계속 고민하느라 지쳐 판단을 잠시 멈추고 쉬는 상황','말다툼에서 이겼지만 관계에 무엇이 남았는지 돌아보는 상황','불편한 환경에서 벗어나 조금 더 안정된 방식으로 옮겨가는 상황','말하기 어려운 계획을 혼자 처리하려다 소통 방법을 고민하는 상황','실패가 두려워 가능한 선택지까지 없다고 느끼는 상황','밤마다 최악의 결과를 상상하며 같은 걱정을 반복하는 상황','더는 유지하기 어려운 일의 끝을 인정하고 회복을 준비하는 상황','새 정보를 찾아보고 사실인지 질문하며 배우는 상황','결론이 확실하다고 느껴 빠르게 말하거나 행동하려는 상황','친한 사이라도 지킬 기준을 정하고 분명하게 전하는 상황','사적인 감정보다 원칙과 자료를 기준으로 결정을 내리는 상황'],
 pentacles:['실제로 시작할 수 있는 작은 일거리나 공부 기회가 생기는 상황','업무와 생활비를 함께 관리하며 일정과 지출을 조정하는 상황','각자의 전문성을 모아 결과물을 만들고 피드백을 받는 상황','돈이나 시간을 잃을까 봐 필요한 변화까지 미루는 상황','경제적 부담이나 소외감을 느껴 도움받을 곳을 찾는 상황','도움을 주거나 받을 때 서로 감당할 수 있는 범위를 정하는 상황','꾸준히 투자한 시간에 비해 결과가 느려 방법을 점검하는 상황','같은 연습을 반복하며 기술을 조금씩 익히는 상황','스스로 쌓은 능력과 생활 기반으로 여유를 누리는 상황','가족의 생활 기반과 장기적인 자원 분배를 의논하는 상황','예산을 세우거나 새 기술을 기초부터 배우기 시작하는 상황','눈에 띄지 않아도 정한 일정을 지키며 꾸준히 해내는 상황','돌봄과 실무를 챙기면서 내 생활의 안정도 지키는 상황','장기적인 책임을 맡아 돈과 사람을 안정적으로 관리하는 상황']};
function concreteExplanation(s,index){
 const c=s.card,p=SPREADS[appState.spread].positions[index],kw=(s.isReversed?c.keywordsRev:c.keywordsUp)[0];
 const scene=c.arcana==='major'?majorLessons[c.number][2]:everydayScenes[c.suitKey][c.number-1];
 let position='오늘 눈여겨볼 태도와 작은 실천으로 읽습니다.';
 if(p.key==='past')position='이미 지나간 배경이나 익숙해진 대응 방식을 살피는 자리입니다. 앞으로 반드시 일어날 사건으로 읽지 않습니다.';
 if(p.key==='present'||p.key==='situation')position='지금 질문에서 가장 먼저 확인할 상황과 대응 방식을 살피는 자리입니다.';
 if(p.key==='future')position='지금의 대응이 이어질 때 가능한 흐름을 살피는 자리입니다. 선택이 달라지면 흐름도 달라질 수 있습니다.';
 if(p.key==='advice')position='상황을 단정하기보다 내가 선택할 수 있는 태도와 행동으로 바꾸어 읽는 자리입니다.';
 if(p.key==='outcome')position='앞선 조언을 실천했을 때 가능한 변화를 살핍니다. 조건 없이 보장되는 결과는 아닙니다.';
 const topic={love:'관계에서는 연락 횟수만 보지 말고, 기대와 경계를 서로 말할 수 있는지 확인해 보세요.',career:'직장에서는 현재 역할, 마감, 권한과 실제로 선택할 수 있는 대안을 나누어 확인해 보세요.',finance:'돈 문제에서는 실제 수입·지출·계약 조건을 확인한 뒤 카드의 주제를 연결해 보세요.',inner:'내면 질문에서는 최근 일주일 동안 비슷하게 반응했던 구체적인 장면을 하나 떠올려 보세요.',health:'건강 질문에서는 최근 일주일의 잠·식사·움직임을 돌아보고, 카드의 주제를 생활 습관 하나에 연결해 보세요. 증상은 카드가 아니라 의료 전문가에게 확인하세요.'}[appState.category]||'질문한 상황에서 실제로 있었던 일과 추측을 나누어 살펴보세요.';
 return `<div class="concrete-reading"><h4>왜 이 자리에서 이렇게 읽을까요?</h4><p>${escapeHtml(position)} 그래서 <strong>${escapeHtml(c.nameKo)}의 ‘${escapeHtml(kw)}’</strong>${josa(kw,'을/를')} ${escapeHtml(p.title)}의 관점에 연결합니다.</p><h4>일상에서 보이는 장면</h4><p>${escapeHtml(scene)}에 비유할 수 있어요. ${s.isReversed?'역방향이라면 그 주제가 잘 드러나지 않거나, 과해졌거나, 혼자 안으로 처리하는 상황 중 무엇에 가까운지 확인합니다.':'이 장면은 카드의 뜻을 이해하기 위한 예시예요. 내 상황과 실제로 닮은 점이 있는지 확인해 보세요.'}</p><h4>내 질문에 적용하는 방법</h4><p>${escapeHtml(topic)}</p><p class="reading-formula">${escapeHtml(c.nameKo)}의 뜻 + ${escapeHtml(p.title)} 자리 + 실제 질문의 맥락 = 근거 있는 해석</p></div>`;
}
function enrichConcreteReading(){document.querySelectorAll('#study-cards .study-card').forEach((el,i)=>{const visible=appState.drawnSlots.map((s,index)=>({...s,index})).filter(s=>s.isFlipped);const s=visible[i];if(s&&!el.querySelector('.concrete-reading'))el.insertAdjacentHTML('beforeend',concreteExplanation(s,s.index));});}
function installExperience(){
 const originalRender=renderDeckFan;window.renderDeckFan=function(animate){renderPhysicalDeck();};
 const oldShuffle=shuffleAndPrepareDeck;window.shuffleAndPrepareDeck=function(animate){deckOpen=false;oldShuffle(animate);appState.candidatePool=shuffleArray(FULL_DECK);renderPhysicalDeck();};
 const oldUpdate=updateStudy;window.updateStudy=function(){oldUpdate();enrichConcreteReading();};
 const oldPick=pickCandidateCard;window.pickCandidateCard=function(i){const source=document.querySelectorAll('#deck-fan .fan-card')[i],box=source?.getBoundingClientRect();const n=appState.drawnSlots.length;oldPick(i);if(box&&appState.drawnSlots.length>n&&motionPreference()!=='auto'){const slot=document.querySelectorAll('.tarot-card-btn')[n];if(slot){const dest=slot.getBoundingClientRect();slot.animate([{translate:`${box.x-dest.x}px ${box.y-dest.y}px`,scale:.5,opacity:.3},{translate:'0 0',scale:1,opacity:1}],{duration:650,easing:'cubic-bezier(.2,.7,.1,1)'});}}};
 const current=appState.candidatePool.map(c=>c.id);appState.candidatePool=[...appState.candidatePool,...shuffleArray(FULL_DECK.filter(c=>!current.includes(c.id)))];
 renderPhysicalDeck();updateStudy();
 const main=document.querySelector('main');main.inert=true;document.body.classList.add('at-entrance');document.getElementById('enter-room').focus();
 document.getElementById('entrance-card').src=DECK_IMAGES[selectedDeck].back;
}
// studio.js registers its setup first, so its wrappers are ready here.
document.addEventListener('DOMContentLoaded',installExperience);
function fanIndexAt(clientX,clientY){
 const fan=document.getElementById('deck-fan');if(!deckOpen||!fan)return -1;
 // Let the browser resolve the actual visible, rotated and raised card at this pixel.
 // The input plane stays still; no pointer event is dispatched during this lookup.
 fan.classList.add('resolve-pointer');let card;
 try{card=document.elementFromPoint(clientX,clientY)?.closest('.fan-card');}
 finally{fan.classList.remove('resolve-pointer');}
 return card&&fan.contains(card)&&!card.disabled?Number(card.dataset.fanIndex):-1;
}
document.addEventListener('DOMContentLoaded',()=>{
 const cloth=document.querySelector('.physical-deck-scroll');let down=null,dragging=false;
 cloth.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;const i=fanIndexAt(e.clientX,e.clientY);down={id:e.pointerId,x:e.clientX,y:e.clientY,scroll:cloth.scrollLeft,index:i,type:e.pointerType};dragging=false;if(i>=0)hoverFanCard(i);});
 cloth.addEventListener('pointermove',e=>{if(!down){if(e.pointerType==='mouse')hoverFanCard(fanIndexAt(e.clientX,e.clientY));return;}if(e.pointerId!==down.id)return;if(Math.hypot(e.clientX-down.x,e.clientY-down.y)>8)dragging=true;if(dragging&&e.pointerType==='mouse'){cloth.classList.add('is-dragging');cloth.scrollLeft=down.scroll-(e.clientX-down.x);}});
 window.addEventListener('pointerup',e=>{if(!down||e.pointerId!==down.id)return;const press=down;down=null;cloth.classList.remove('is-dragging');if(!dragging&&Math.hypot(e.clientX-press.x,e.clientY-press.y)<=8&&press.index>=0)chooseFanCard(press.index);dragging=false;});
 window.addEventListener('pointercancel',()=>{down=null;dragging=false;cloth.classList.remove('is-dragging');});
});
