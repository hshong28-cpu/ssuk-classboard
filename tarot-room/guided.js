// Topic-first intake, softly typed guide questions, and smoke-like transitions.
const softTypingJobs=new WeakMap();
function finishSoftTyping(node){const job=softTypingJobs.get(node);if(job)job.finish();}
function softlyType(node,text){
 finishSoftTyping(node);node.dataset.fullText=text;
 const accessible=document.createElement('span');accessible.className='reader-only';accessible.textContent=text;
 const visual=document.createElement('span');visual.className='typed-visual';visual.setAttribute('aria-hidden','true');node.replaceChildren(accessible,visual);
 const parts=typeof Intl.Segmenter==='function'?[...new Intl.Segmenter('ko',{granularity:'grapheme'}).segment(text)].map(p=>p.segment):Array.from(text);
 let frame=0,timer=0,done=false;const finish=()=>{if(done)return;done=true;cancelAnimationFrame(frame);clearTimeout(timer);visual.textContent=text;node.classList.remove('is-typing');softTypingJobs.delete(node);};softTypingJobs.set(node,{finish});
 if(motionPreference()==='auto'||document.hidden){finish();return;}
 if(node.id==='intake-guide'||node.closest('#setup-heading')){
  node.classList.add('is-typing');
  let index=0;
  const tick=()=>{
   if(!node.isConnected||index===parts.length){finish();return;}
   const letter=parts[index++];
   visual.textContent+=letter;
   timer=setTimeout(tick,/[?.!,]/.test(letter)?160:58);
  };
  tick();return;
 }
 const start=performance.now(),duration=Math.min(4000,Math.max(500,parts.length*32));node.classList.add('is-typing');
 const tick=now=>{if(!node.isConnected){finish();return;}const count=Math.min(parts.length,Math.floor((now-start)/duration*parts.length));visual.textContent=parts.slice(0,count).join('');if(count>=parts.length)finish();else frame=requestAnimationFrame(tick);};frame=requestAnimationFrame(tick);
}
let intakeTopic=null,intakeStory='',intakeStep=0,intakeTransition=0,intakeBusy=false;
const INTAKE_QUESTIONS={love:['어떤 관계에서 마음이 쓰이고 있나요? 최근 있었던 일을 편하게 들려주세요.','그 관계에서 오늘 가장 알고 싶은 부분은 무엇인가요?'],career:['일이나 진로에서 어떤 일을 겪고 있나요? 지금 고민하는 상황을 들려주세요.','선택을 앞두고 있나요, 아니면 지금 상황을 풀어갈 방법이 필요한가요?'],finance:['돈이나 생활 기반에서 어떤 점이 가장 고민되나요? 구체적인 상황을 알려주세요.','지금 확인하고 싶은 것은 지출·안정·선택 중 어느 쪽에 가까운가요?'],inner:['최근 어떤 일이 마음에 오래 남아 있나요? 정리되지 않아도 괜찮아요.','그중 오늘 카드로 함께 살펴보고 싶은 부분은 무엇인가요?'],parenting:['자녀와 관련해 어떤 일이 있었나요? 공부·생활·대화 중 어떤 상황인지 편하게 들려주세요.','그 상황에서 부모인 내가 가장 바꾸고 싶거나 도움이 필요한 부분은 무엇인가요?'],housing:['이사를 고민하게 된 계기가 무엇인가요? 지금 집과 생활에서 마음에 걸리는 점을 들려주세요.','비용, 가족 환경, 통학·출퇴근 중 지금 가장 중요하게 생각하는 기준은 무엇인가요?'],daily:['일상에서 어떤 고민을 하고 있나요? 최근의 한 장면부터 들려주셔도 좋아요.','그중 오늘 먼저 정리하고 싶은 선택이나 부담은 무엇인가요?']};
function changeIntakeSurface(from,to,after){
 const seq=++intakeTransition;from.classList.add('smoke-away');const delay=motionPreference()==='auto'?0:850;
 setTimeout(()=>{if(seq!==intakeTransition)return;from.hidden=true;from.classList.remove('smoke-away');to.hidden=false;to.classList.add('question-arriving');after?.();setTimeout(()=>to.classList.remove('question-arriving'),550);},delay);
}
function showIntakeQuestion(text){
 const q=document.getElementById('intake-guide');if(!q)return;finishSoftTyping(q);
 const seq=++intakeTransition;q.classList.add('smoke-away');
 setTimeout(()=>{if(seq!==intakeTransition)return;q.classList.remove('smoke-away');q.classList.add('question-arriving');softlyType(q,text);setTimeout(()=>q.classList.remove('question-arriving'),500);},motionPreference()==='auto'?0:850);
}
function reopenIntakeTopics(){
 finishSoftTyping(document.getElementById('intake-guide'));resetQuestionContext();intakeBusy=false;intakeTopic=null;document.getElementById('intake-reply').disabled=false;document.getElementById('compact-cards-nav').disabled=true;
 document.getElementById('intake-tools').hidden=true;changeIntakeSurface(document.getElementById('intake-question-surface'),document.querySelector('.topic-first'));
}
function chooseIntakeTopic(id,unsure=false){
 if(intakeBusy)return;intakeTopic=id;intakeStory='';intakeStep=0;
 selectCategory(id);handleQuestionInput('');document.getElementById('question-input').value='';
 const group=document.querySelector('[aria-label="상담 주제 카테고리"]');group.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(unsure?b.id==='intake-unsure':b.dataset.category===id)));
 document.getElementById('chosen-topic-label').textContent=unsure?'아직 잘 모르겠어요':CATEGORIES[id].label;
 document.getElementById('question-context-answer').value='';document.getElementById('intake-story-log')?.replaceChildren();
 const question=document.getElementById('intake-question-surface'),topic=document.querySelector('.topic-first');
 changeIntakeSurface(topic,question,()=>{
  document.getElementById('intake-tools').hidden=false;document.getElementById('question-input').hidden=false;document.getElementById('intake-reply').hidden=false;
  document.getElementById('question-input').placeholder='편하게 답해 주세요. 단어 몇 개로 시작해도 괜찮아요.';
  document.getElementById('intake-guide').scrollIntoView({block:'nearest',behavior:'instant'});softlyType(document.getElementById('intake-guide'),INTAKE_QUESTIONS[id][0]);
 });
 document.getElementById('compact-cards-nav')?.removeAttribute('disabled');
}
function reopenIntakeTopics(){
 const topic=document.querySelector('.topic-first'),question=document.getElementById('intake-question-surface');finishSoftTyping(document.getElementById('intake-guide'));document.getElementById('intake-tools').hidden=true;changeIntakeSurface(question,topic);}
function collectIntakeAnswer(){
 const field=document.getElementById('question-input'),answer=field.value.trim();if(!answer)return '';
 if(!intakeStory){intakeStory=answer;handleQuestionInput(answer);}return answer;
}
function addIntakeStory(text){const log=document.getElementById('intake-story-log');if(!log)return;const li=document.createElement('li');li.textContent=text;log.append(li);}
async function replyToIntake(){
 if(intakeBusy)return;const answer=collectIntakeAnswer(),status=document.getElementById('intake-status');if(!answer){status.textContent='아래에 짧게 답해 주세요.';document.getElementById('question-input').focus();return;}
 finishSoftTyping(document.getElementById('intake-guide'));status.textContent='';addIntakeStory(answer);intakeBusy=true;const button=document.getElementById('intake-reply');button.disabled=true;
 try{
  if(aiReady){status.textContent='말씀해 주신 이야기를 살펴보고 있어요…';await clarifyReadingQuestion(answer);status.textContent=document.getElementById('question-context-status').textContent;}
  else{appendContextTurn('user',answer);intakeStep++;const text=intakeStep===1?INTAKE_QUESTIONS[intakeTopic][1]:'이야기해 주셔서 고마워요. 지금까지의 고민을 마음에 담고 카드를 골라볼까요?';appendContextTurn('assistant',text);status.textContent='기본 안내 질문입니다. AI를 연결하면 답변에 맞춰 질문이 달라집니다.';if(intakeStep>=2){document.getElementById('question-input').hidden=true;button.hidden=true;}}
  document.getElementById('question-input').value='';document.getElementById('question-input').placeholder='안내자의 질문에 답하거나, 바로 카드 고르기로 넘어가세요.';
 }finally{intakeBusy=false;button.disabled=false;}
}
document.addEventListener('DOMContentLoaded',()=>{
 const setup=document.querySelector('[aria-labelledby="setup-heading"]'),stack=setup.querySelector('.form-stack'),topic=setup.querySelector('.topic-first'),questionBlock=document.getElementById('question-input').parentElement;
 const heading=setup.querySelector('.section-title').lastElementChild;
 const greeting='오늘 어떤 이야기를 나누고 싶으세요?';
 heading.textContent=greeting;
 const originalArrival=completeArrival;
 window.completeArrival=function(){originalArrival();softlyType(heading,greeting);};
 topic.querySelector('.field-label').textContent='마음이 가는 고민 분야를 먼저 골라 주세요';
 const group=topic.querySelector('[role="group"]');group.classList.add('intake-topic-grid');group.querySelectorAll('button').forEach(b=>{b.setAttribute('aria-pressed','false');b.onclick=()=>chooseIntakeTopic(b.dataset.category);});
 const unsure=document.createElement('button');unsure.type='button';unsure.id='intake-unsure';unsure.className='pill-btn';unsure.textContent='아직 잘 모르겠어요';unsure.setAttribute('aria-pressed','false');unsure.onclick=()=>chooseIntakeTopic('inner',true);group.append(unsure);
 const surface=document.createElement('div');surface.id='intake-question-surface';surface.className='intake-question-surface';surface.hidden=true;
 const bar=document.createElement('div');bar.className='chosen-topic-bar';bar.innerHTML='<span id="chosen-topic-label"></span><button type="button" onclick="reopenIntakeTopics()">고민 분야 바꾸기</button>';
 const guide=document.createElement('p');guide.id='intake-guide';guide.className='intake-guide';guide.setAttribute('role','status');guide.onclick=()=>finishSoftTyping(guide);
 const finish=document.createElement('button');finish.type='button';finish.className='show-full-question';finish.textContent='질문 전체 바로 보기';finish.onclick=()=>finishSoftTyping(guide);
 const storyLog=document.createElement('ol');storyLog.id='intake-story-log';storyLog.className='intake-story-log';storyLog.setAttribute('aria-label','내가 들려준 이야기');
 surface.append(bar,guide,finish,storyLog,questionBlock);topic.after(surface);
 const label=questionBlock.querySelector('label');label.textContent='어떤 일이 있었나요?';const input=document.getElementById('question-input');input.removeAttribute('oninput');
 input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.isComposing){e.preventDefault();replyToIntake();}});
 const reply=document.createElement('button');reply.id='intake-reply';reply.type='button';reply.className='btn btn-secondary';reply.textContent='답하고 다음 질문 듣기';reply.onclick=replyToIntake;questionBlock.append(reply);
 const status=document.createElement('p');status.id='intake-status';status.setAttribute('role','status');questionBlock.append(status);
 const tools=document.createElement('div');tools.id='intake-tools';tools.hidden=true;stack.append(tools);[...stack.children].filter(n=>n!==topic&&n!==surface&&n!==tools).forEach(n=>tools.append(n));
 const context=document.getElementById('question-context');context.closest('details').hidden=true;
 document.querySelector('[data-compact-stage="cards"]').id='compact-cards-nav';document.getElementById('compact-cards-nav').disabled=true;
 const oldPrepare=compactPrepare;window.compactPrepare=function(){if(!intakeTopic){topic.focus?.();return;}const answer=collectIntakeAnswer();if(answer&&questionContextTurns.at(-1)?.content!==answer)appendContextTurn('user',answer);oldPrepare();};
 const oldAppend=appendContextTurn;window.appendContextTurn=function(role,text){oldAppend(role,text);if(role==='assistant')showIntakeQuestion(text);};
 const oldReading=addReadingTurn;window.addReadingTurn=function(role,text){oldReading(role,text);if(role!=='user'){const p=document.querySelector('#conversation-log .chat-turn:last-child p');if(p)softlyType(p,text);}};
 const oldLeave=leaveReadingRoom;window.leaveReadingRoom=function(){document.querySelectorAll('.is-typing').forEach(finishSoftTyping);intakeTransition++;resetQuestionContext();intakeBusy=false;intakeTopic=null;document.querySelector('.topic-first').hidden=false;document.getElementById('intake-question-surface').hidden=true;document.getElementById('intake-tools').hidden=true;document.getElementById('compact-cards-nav').disabled=true;oldLeave();};
 const oldSetStage=setCompactStage;window.setCompactStage=function(stage){if(stage==='cards'&&!intakeTopic)return;oldSetStage(stage);};
});
