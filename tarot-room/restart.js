// "다른 내용으로 처음부터": clear the question, cards and reading and return to the topic choice.
function startOver(){
 document.querySelectorAll('.is-typing').forEach(n=>typeof finishSoftTyping==='function'&&finishSoftTyping(n));
 const input=document.getElementById('question-input');if(input){input.value='';input.hidden=false;}
 handleQuestionInput('');
 if(typeof resetQuestionContext==='function')resetQuestionContext();
 const reply=document.getElementById('intake-reply');if(reply){reply.hidden=false;reply.disabled=false;}
 const status=document.getElementById('intake-status');if(status)status.textContent='';
 shuffleAndPrepareDeck(false);
 document.body.classList.remove('learning-mode');document.getElementById('tarot-study').hidden=true;
 document.getElementById('reading-next-step').hidden=true;
 if(typeof intakeTopic!=='undefined'&&intakeTopic)reopenIntakeTopics();
 else{const sel=document.getElementById('intake-topic-select');if(sel)sel.value='';}
 if(typeof intakeTopic!=='undefined'){intakeTopic=null;intakeStory='';intakeStep=0;}
 document.getElementById('step-back')&&setTimeout(()=>{const b=document.getElementById('step-back');b.hidden=true;b.disabled=true;},0);
 setCompactStage('question');
 window.scrollTo({top:0,behavior:'auto'});
 setTimeout(()=>document.getElementById('intake-topic-select')?.focus({preventScroll:true}),900);
}
function restartButton(label,cls,confirmTwice){
 const b=document.createElement('button');b.type='button';b.className=cls+' restart-btn';b.textContent=label;
 b.addEventListener('click',()=>{
  if(confirmTwice&&b.dataset.armed!=='1'){b.dataset.armed='1';b.textContent='한 번 더 누르면 처음부터 시작해요';setTimeout(()=>{if(b.dataset.armed==='1'){b.dataset.armed='';b.textContent=label;}},3500);return;}
  b.dataset.armed='';b.textContent=label;startOver();
 });
 return b;
}
document.addEventListener('DOMContentLoaded',()=>{
 // End of a reading: offer it next to "learning mode" and "leave".
 document.querySelector('#reading-next-step > div')?.prepend(restartButton('다른 고민으로 처음부터','btn btn-primary',false));
 // During a reading and in learning mode (asks once more so a reading is not lost by accident).
 document.querySelector('#conversation-actions .conversation-submit')?.append(restartButton('다른 내용으로 처음부터','btn btn-ghost',true));
 document.querySelector('.learning-end-controls')?.prepend(restartButton('다른 고민으로 처음부터','btn btn-secondary',false));
 // Menu: the old "새 리딩 초기화" becomes the same full restart.
 document.querySelectorAll('.menu-panel button, .hero-actions button').forEach(b=>{if((b.getAttribute('onclick')||'').includes('resetSession')){b.removeAttribute('onclick');const span=b.querySelector('span');if(span)span.textContent='다른 내용으로 처음부터';b.addEventListener('click',()=>{document.querySelector('.compact-settings').open=false;startOver();});}});
});
