let conversationTurns=[],conversationSignature='',conversationStarted=false,conversationPending=null,conversationRequestId=0,conversationFinished=false;
let learningLens='love',filmTimer=null,filmSequence=0,roomAmbient=null,ambientWanted=false;
function flowSignature(){return studioSnapshot();}
function addReadingTurn(role,text){const log=document.getElementById('conversation-log');const a=document.createElement('article');a.className='chat-turn '+(role==='user'?'visitor':'guide');const label=document.createElement('span');label.textContent=role==='user'?'나':'안내자';const p=document.createElement('p');p.textContent=text;a.append(label,p);log.append(a);conversationTurns.push({role:role==='user'?'user':'assistant',content:text});}
function syncReadingFlow(){
 const sig=flowSignature();if(conversationSignature!==sig){conversationSignature=sig;conversationRequestId++;conversationPending?.abort();conversationPending=null;conversationStarted=false;conversationFinished=false;conversationTurns=[];document.getElementById('conversation-log').replaceChildren();addReadingTurn('assistant','카드가 준비되면 전체 흐름부터 읽고, 궁금한 부분을 함께 살펴볼게요.');document.getElementById('conversation-actions').hidden=true;document.getElementById('reading-next-step').hidden=true;document.getElementById('conversation-busy').hidden=true;document.getElementById('conversation-error').textContent='';document.getElementById('tarot-study').hidden=true;document.body.classList.remove('learning-mode');}
 const complete=allCardsFlipped();document.getElementById('begin-conversation').disabled=!complete||!!conversationPending||conversationFinished;document.getElementById('begin-conversation').textContent=conversationStarted?'처음부터 다시 읽기':'리딩 시작하기';
 document.getElementById('reading-service-label').textContent=aiReady?'AI 안내자 · 질문의 맥락에 맞춰 대화를 이어갑니다.':'';
 if(document.body.classList.contains('learning-mode'))renderLearningAngles();
}
function localReading(){
 const steps={
  parenting:'오늘 아이와 이야기할 때 “어떤 부분이 제일 어려웠어?”라고 묻고, 답을 끝까지 들어보세요.',
  housing:'집을 볼 때 꼭 지키고 싶은 조건 하나를 골라 보세요. 예를 들면 “퇴근 후 아이를 데리러 가는 데 걸리는 시간”이에요.',
  health:'오늘 잠·식사·움직임 중 하나를 골라, 10분 안에 할 수 있는 작은 돌봄을 하나 해보세요. 몸이 불편하다면 카드보다 의료 전문가의 상담을 먼저 받아 주세요.',
  daily:'오늘 할 일 중 하나를 고르고, 첫 5분 동안 할 수 있는 일만 정해 보세요.',
  love:'마음에 걸린 말 한마디가 있다면 “그때 나는 이렇게 느꼈어”로 대화를 시작해 보세요.',
  career:'고민하는 일에서 혼자 정할 수 있는 것과 동료에게 물어볼 것을 하나씩 적어 보세요.',
  finance:'이번 주 지출 하나를 골라, 꼭 필요한 돈인지 조금 미룰 수 있는 돈인지 살펴보세요.',
  inner:'오늘 마음이 달라진 순간을 하나 떠올리고, 그때 필요했던 것을 한 단어로 적어 보세요.'
 };
 const positions=SPREADS[appState.spread].positions;
 const category=appState.category;
 const story=(appState.question||'').trim();
 const extra=(typeof getQuestionContext==='function'?getQuestionContext():[]).filter(t=>t.role==='user').map(t=>t.content.trim()).filter(t=>t&&t!==story);
 const intro=story
  ? '“'+story+'”라는 이야기에 카드를 비춰볼게요.'+(extra.length?' 덧붙여 주신 “'+extra[extra.length-1]+'”도 함께 생각하며 읽을게요.':'')
  : CATEGORIES[category].label+' 고민을 마음에 두고 카드를 읽어볼게요.';
 const focusNote=CATEGORIES[category].focus;
 const paragraphs=[focusNote?intro+'\n'+focusNote:intro].concat(appState.drawnSlots.map((slot,index)=>{
  const card=slot.card;
  const keyword=(slot.isReversed?card.keywordsRev:card.keywordsUp)[0];
  const heading=positions[index].title+' · '+card.nameKo+' ('+(slot.isReversed?'역방향':'정방향')+')';
  const focus=CATEGORIES[category].focus;
  let reading=(slot.isReversed?card.catRev:card.catUp)[category];
  if(focus&&reading)reading=reading.replace(' '+focus,'').replace(focus,'');
  const line=slot.isReversed
   ? '이 자리에서 눈여겨볼 말은 ‘'+keyword+'’'+josa(keyword,'이에요/예요')+'. 무엇이 걸림돌이 되고 있는지 살펴보세요.'
   : '이 자리에서 카드가 들려주는 말은 ‘'+keyword+'’'+josa(keyword,'이에요/예요')+'.';
  return heading+'\n'+(reading?reading+' ':'')+line;
 }));
 paragraphs.push('오늘 해볼 일\n'+steps[appState.category]);
 return paragraphs.join('\n\n');
}
function buildConversationPayload(mode,answer){return {mode,answer,deck:selectedDeck,question:appState.question,categoryId:appState.category,category:CATEGORIES[appState.category].label,questionContext:getQuestionContext(),spread:SPREADS[appState.spread].name,cards:appState.drawnSlots.map((s,i)=>({id:s.card.id,name:s.card.nameKo,reversed:s.isReversed,position:SPREADS[appState.spread].positions[i].title,keywords:s.isReversed?s.card.keywordsRev:s.card.keywordsUp,symbol:s.card.symbolNote,lesson:lessonFor(s.card)})),history:mode==='conversation'?conversationTurns.slice(-8):[]};}
async function requestConversation(mode,answer){
 if(conversationPending)return;const sig=flowSignature(),seq=++conversationRequestId,controller=new AbortController();conversationPending=controller;const timeout=setTimeout(()=>controller.abort(),90000);document.getElementById('conversation-busy').hidden=false;document.getElementById('conversation-error').textContent='';document.querySelectorAll('#reading-conversation button').forEach(b=>b.disabled=true);
 try{const r=await fetch('/api/analyze',{method:'POST',headers:{'Content-Type':'application/json','X-Tarot-Client':'studio'},body:JSON.stringify(buildConversationPayload(mode,answer)),signal:controller.signal});const d=await r.json();if(!r.ok)throw Error(d.error||'안내자의 답변을 받지 못했어요.');if(seq!==conversationRequestId||sig!==flowSignature())return;addReadingTurn('assistant',d.text);conversationStarted=true;document.getElementById('conversation-actions').hidden=false;document.getElementById('reading-answer').value='';}
 catch(e){if(seq===conversationRequestId)document.getElementById('conversation-error').textContent=e.name==='AbortError'?'리딩이 중단됐거나 응답 시간이 길어졌어요. 다시 시도해 주세요.':e.message;}
 finally{clearTimeout(timeout);if(seq===conversationRequestId){conversationPending=null;document.getElementById('conversation-busy').hidden=true;document.querySelectorAll('#reading-conversation button').forEach(b=>b.disabled=false);syncReadingFlow();}}
}
async function beginConversation(){if(!allCardsFlipped()||conversationPending)return;conversationFinished=false;document.getElementById('reading-next-step').hidden=true;conversationTurns=[];document.getElementById('conversation-log').replaceChildren();if(aiReady)return requestConversation('reading','');addReadingTurn('assistant',localReading());conversationStarted=true;document.getElementById('conversation-actions').hidden=false;syncReadingFlow();}
function localFollowup(kind){
 const s=appState.drawnSlots[appState.focusedSlotIndex]||appState.drawnSlots[0],c=s.card,i=appState.drawnSlots.indexOf(s),p=SPREADS[appState.spread].positions[i],kw=(s.isReversed?c.keywordsRev:c.keywordsUp)[0];
 if(kind==='reason')return `${p.title}의 ${c.nameKo}부터 볼게요.\n\n① 카드 자체에서는 ‘${kw}’${josa(kw,'을/를')} 주요 키워드로 잡았어요.\n② ${p.title} 자리는 ${p.subtitle}${josa(p.subtitle,'을/를')} 살피는 관점이에요.\n③ 둘을 연결해 ‘${(s.isReversed?c.catRev:c.catUp)[appState.category]}’라고 읽었습니다.\n\n이 설명은 카드 데이터에서 만든 해석 근거예요. 당신의 실제 경험과 맞지 않는 부분은 다른 가능성으로 열어두어야 해요.`;
 if(kind==='alternative')return `${c.nameKo}${josa(c.nameKo,'을/를')} 반대 방향으로 읽는다면 ‘${(s.isReversed?c.keywordsUp:c.keywordsRev).join(', ')}’${josa((s.isReversed?c.keywordsUp:c.keywordsRev).slice(-1)[0],'이/가')} 다른 관점이 돼요.\n\n현재 나온 방향을 바꾸는 것이 아니라, 같은 주제가 자연스럽게 표현될 때와 막히거나 과해질 때를 비교하는 연습이에요. ${lessonFor(c)[3]}\n\n현실에서 어느 쪽의 근거가 더 보이는지 확인해 보세요.`;
 return `${c.nameKo}의 ‘${kw}’${josa(kw,'을/를')} 작은 행동으로 바꾸어볼게요.\n\n${c.advice}\n\n오늘 한 번 시도할 수 있는 크기로 줄이고, 실제로 해본 뒤 무엇이 달라졌는지 한 줄 적어보세요. 상황에 맞지 않는 제안이라면 건너뛰어도 괜찮아요.`;
}
async function askReadingChoice(kind){if(!conversationStarted||conversationPending)return;const q={reason:'왜 그렇게 읽나요?',alternative:'다른 해석도 있나요?',action:'일상에서 어떻게 해볼까요?'}[kind];if(aiReady){addReadingTurn('user',q);await requestConversation('conversation',q);return;}addReadingTurn('user',q);addReadingTurn('assistant',localFollowup(kind));}
async function sendReadingAnswer(){const input=document.getElementById('reading-answer'),answer=input.value.trim();if(!answer||conversationPending)return;if(!aiReady){document.getElementById('conversation-error').textContent='자유롭게 적은 상황을 이해해 이어가는 대화는 AI 연결이 필요해요. 지금은 위의 추가 질문 세 가지로 카드 풀이를 더 살펴볼 수 있습니다.';return;}addReadingTurn('user',answer);await requestConversation('conversation',answer);}
function finishConversation(){if(!conversationStarted||conversationPending)return;conversationFinished=true;document.getElementById('conversation-actions').hidden=true;document.getElementById('reading-next-step').hidden=false;addReadingTurn('assistant','오늘의 리딩은 여기서 마무리할게요. 같은 카드로 여러 관점의 해석을 공부해 볼까요, 아니면 오늘은 퇴실할까요?');document.getElementById('reading-next-step').focus();syncReadingFlow();}
function enterLearningRoom(){document.body.classList.add('learning-mode');document.getElementById('tarot-study').hidden=false;learningLens=appState.category;renderLearningAngles();setStudyTab('basics');document.getElementById('study-title').tabIndex=-1;document.getElementById('study-title').focus();document.getElementById('tarot-study').scrollIntoView({behavior:motionPreference()});}
function renderLearningAngles(){const target=document.getElementById('learning-angles');if(!target)return;document.querySelectorAll('[data-learning-lens]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.learningLens===learningLens)));target.innerHTML=appState.drawnSlots.map((s,i)=>{const c=s.card,u=c.catUp[learningLens],r=c.catRev[learningLens];return `<article class="angle-card"><h4>${escapeHtml(SPREADS[appState.spread].positions[i].title)} · ${escapeHtml(c.nameKo)}</h4><p><strong>${escapeHtml(CATEGORIES[learningLens].label)} 질문이라면</strong><br>${escapeHtml(u)}</p><details><summary>역방향과 비교하기</summary><p>${escapeHtml(r)}</p><p>정방향과 역방향을 좋고 나쁨으로 나누지 말고, 같은 주제가 드러나는 방식의 차이로 비교해 보세요.</p></details><p class="reading-formula">연습: 같은 카드를 다른 관점으로 읽을 때 무엇이 달라졌나요?</p></article>`;}).join('');}
function setLearningLens(lens){if(!CATEGORIES[lens])return;learningLens=lens;renderLearningAngles();}
function cancelRoomFilm(){filmSequence++;clearTimeout(filmTimer);const video=document.getElementById('room-film');video.pause();video.ontimeupdate=null;video.onended=null;video.onerror=null;document.getElementById('room-cinema').hidden=true;}
function completeArrival(){cancelRoomFilm();document.getElementById('room-entrance').hidden=true;document.querySelector('main').inert=false;document.body.classList.remove('at-entrance');document.getElementById('room-welcome').focus();}
let roomArrivalSource='';
function playRoomFilm(start,end,done,kind='arrival'){
 cancelRoomFilm();const seq=filmSequence,video=document.getElementById('room-film');document.getElementById('room-cinema').hidden=false;document.getElementById('skip-room-film').focus();if(!roomArrivalSource)roomArrivalSource=video.getAttribute('src');const wantedSource=kind==='spread'?'media/onehand.mp4':roomArrivalSource;if(video.getAttribute('src')!==wantedSource){video.setAttribute('src',wantedSource);video.load();}document.getElementById('skip-room-film').textContent=kind==='spread'?'장면 건너뛰고 카드 고르기':'바로 테이블에 앉기';document.getElementById('room-cinema').setAttribute('aria-label',kind==='spread'?'안내자의 한손 카드 펼치기':'안내자를 따라 리딩룸에 입장');video.muted=true;video.volume=.08;let finished=false;const finish=()=>{if(finished||seq!==filmSequence)return;finished=true;done();};
 video.onended=finish;video.onerror=()=>{document.getElementById('room-media-status').textContent='영상 대신 바로 테이블로 안내할게요.';finish();};video.ontimeupdate=()=>{const caption=document.querySelector('.cinema-caption p');caption.textContent=kind==='spread'?(video.currentTime<4.8?'카드를 왼쪽에 가지런히 놓아드릴게요.':video.currentTime<7?'왼쪽에서 오른쪽으로, 천천히 펼쳐드릴게요.':'이제 마음이 가는 카드를 직접 골라보세요.'):video.currentTime<3?'이쪽으로 오세요. 커튼을 열어드릴게요.':video.currentTime<6?'유리구슬 앞, 편안한 자리에 앉아 주세요.':video.currentTime<10?'질문을 마음에 담아 주세요. 카드를 준비할게요.':'이제 마음이 가는 카드를 직접 골라보세요.';if(video.currentTime>=end)finish();};video.currentTime=start;video.play().catch(finish);filmTimer=setTimeout(finish,16000);document.getElementById('skip-room-film').onclick=finish;
}
function syncRoomAudio(){if(!roomAmbient){roomAmbient=document.getElementById('room-ambient');roomAmbient.volume=.07;}const b=document.getElementById('ambient-toggle');b.setAttribute('aria-pressed',String(ambientWanted));b.textContent=ambientWanted?'배경음 켜짐':'배경음 꺼짐';if(ambientWanted&&roomEntered&&!document.hidden)roomAmbient.play().catch(()=>{ambientWanted=false;b.textContent='배경음 재생하기';b.setAttribute('aria-pressed','false');});else roomAmbient.pause();document.getElementById('room-film').muted=true;}
function toggleRoomAmbient(){ambientWanted=!ambientWanted;syncRoomAudio();}
function leaveReadingRoom(){conversationRequestId++;conversationPending?.abort();conversationPending=null;cancelRoomFilm();if(roomAmbient){roomAmbient.pause();roomAmbient.currentTime=0;}soundEnabled=false;stopCardFoley();document.getElementById('sound-toggle').textContent='카드 소리 꺼짐';document.getElementById('sound-toggle').setAttribute('aria-pressed','false');roomEntered=false;ambientWanted=false;syncRoomAudio();document.getElementById('room-entrance').hidden=false;document.getElementById('room-entrance').classList.remove('is-entering');document.getElementById('entrance-title').innerHTML='오늘의 이야기를<br>마음에 담아 가세요.';document.getElementById('enter-room').textContent='리딩룸에 다시 입장';document.querySelector('main').inert=true;document.body.classList.add('at-entrance');document.getElementById('enter-room').focus();}
document.addEventListener('DOMContentLoaded',()=>{
 const oldUpdate=updateStudy;window.updateStudy=function(){oldUpdate();syncReadingFlow();};
 window.enterReadingRoom=function(){if(roomEntered)return;roomEntered=true;if(conversationFinished){conversationFinished=false;document.getElementById('reading-next-step').hidden=true;syncReadingFlow();}ambientWanted=document.getElementById('entrance-sound').checked;if(ambientWanted&&!soundEnabled)toggleStudioSound();syncRoomAudio();if(motionPreference()==='auto')completeArrival();else playRoomFilm(0,7.9,completeArrival);};
 const oldOpen=openPhysicalDeck;let spreadFilmSeen=false;window.openPhysicalDeck=function(){if(deckOpen||spreadFilmSeen||motionPreference()==='auto'){oldOpen();return;}spreadFilmSeen=true;playRoomFilm(0,7.9,()=>{cancelRoomFilm();if(!deckOpen)oldOpen();document.getElementById('open-deck').focus();},'spread');};
 document.getElementById('room-volume').addEventListener('input',e=>{if(!roomAmbient)roomAmbient=document.getElementById('room-ambient');roomAmbient.volume=Number(e.target.value)/100;});
 document.addEventListener('visibilitychange',syncRoomAudio);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!document.getElementById('room-cinema').hidden)document.getElementById('skip-room-film').click();});
 document.getElementById('tarot-study').hidden=true;syncReadingFlow();
 // Status is set asynchronously by studio.js, update the connection label too.
 new MutationObserver(()=>syncReadingFlow()).observe(document.getElementById('ai-connection'),{childList:true});
});
