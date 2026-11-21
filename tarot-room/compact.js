let compactStage='question';
function setCompactStage(stage){
 if(stage==='reading'&&!allCardsFlipped())return;
 compactStage=stage;
 const setup=document.querySelector('[aria-labelledby="setup-heading"]');setup.hidden=stage!=='question';
 document.getElementById('card-table-section').hidden=stage!=='cards';document.getElementById('reading-conversation').hidden=stage!=='reading';document.getElementById('tarot-study').hidden=stage!=='learning';
 document.querySelectorAll('[data-compact-stage]').forEach(b=>b.setAttribute('aria-current',b.dataset.compactStage===stage?'step':'false'));
 if(stage==='question')document.getElementById('question-input').focus({preventScroll:true});
 window.scrollTo({top:0,behavior:motionPreference()});
}
function compactPrepare(){shuffleAndPrepareDeck(false);setCompactStage('cards');if(!deckOpen)openPhysicalDeck();}
function compactRead(){setCompactStage('reading');if(!conversationStarted)beginConversation();}
function toggleCompactRecords(){const d=document.getElementById('compact-records');d.hidden=!d.hidden;if(!d.hidden){d.open=true;d.scrollIntoView({behavior:motionPreference()});}}
function setCompactDisclosureTitle(details,title){
 const summary=details.querySelector(':scope > summary');if(!summary)return;let text=summary.querySelector('.disclosure-title'),hint=summary.querySelector('.disclosure-hint');
 if(!text){summary.replaceChildren();text=document.createElement('span');text.className='disclosure-title';hint=document.createElement('span');hint.className='disclosure-hint';summary.append(text,hint);details.addEventListener('toggle',()=>{hint.textContent=details.open?'선택 후 다시 누르면 접힙니다.':'눌러서 펼쳐 선택하세요';});}
 text.textContent=title;hint.textContent=details.open?'선택 후 다시 누르면 접힙니다.':'눌러서 펼쳐 선택하세요';
}
function wrapCompactDetails(node,title){if(!node)return null;const d=document.createElement('details');d.className='compact-disclosure';const s=document.createElement('summary');node.before(d);d.append(s,node);setCompactDisclosureTitle(d,title);return d;}
document.addEventListener('DOMContentLoaded',()=>{
 document.body.classList.add('compact-app');
 const main=document.querySelector('main'),header=document.querySelector('.hero-header'),setup=document.querySelector('[aria-labelledby="setup-heading"]');
 const nav=document.createElement('nav');nav.className='compact-nav';nav.setAttribute('aria-label','리딩 진행 단계');nav.innerHTML=`<button type="button" data-compact-stage="question" onclick="setCompactStage('question')">1 질문</button><button type="button" data-compact-stage="cards" onclick="setCompactStage('cards')">2 카드 선택</button><button type="button" id="compact-reading-nav" data-compact-stage="reading" onclick="compactRead()" disabled>3 리딩</button>`;header.after(nav);
 const categories=setup.querySelector('[aria-label="상담 주제 카테고리"]').parentElement;categories.classList.add('topic-first');const presets=document.getElementById('preset-container');const extras=wrapCompactDetails(presets,'질문 예시 보기');categories.after(extras);
 const options=setup.querySelector('.spread-options').parentElement;const advanced=wrapCompactDetails(options,'카드 수 · 배열 · 역방향');const toggle=setup.querySelector('.toggle-row');const prepare=toggle.querySelector('button');prepare.setAttribute('onclick','compactPrepare()');prepare.textContent='카드 고르러 가기';prepare.classList.add('compact-primary');advanced.append(toggle.querySelector('label'));toggle.remove();setup.querySelector('.form-stack').append(prepare);
 wrapCompactDetails(document.getElementById('question-context'),'AI와 질문 더 이야기하기');const questionBlock=document.getElementById('question-input').parentElement;const stack=setup.querySelector('.form-stack');stack.prepend(categories,questionBlock);
 const settings=document.createElement('details');settings.className='compact-settings';const summary=document.createElement('summary');summary.textContent='설정';settings.append(summary);
 for(const id of ['ambient-toggle','sound-toggle'])settings.append(document.getElementById(id));const volume=document.querySelector('.volume-label');if(volume)settings.append(volume);header.append(settings);
 header.querySelectorAll('.hero-actions button').forEach(b=>{if((b.getAttribute('onclick')||'').includes('scrollToJournal'))b.setAttribute('onclick','toggleCompactRecords()');});
 const journal=document.getElementById('journal-section'),records=document.createElement('details');records.id='compact-records';records.hidden=true;const rs=document.createElement('summary');rs.textContent='저장한 리딩';journal.before(records);records.append(rs,journal);
 const next=document.createElement('button');next.type='button';next.id='compact-read';next.className='btn btn-primary compact-primary';next.textContent='고른 카드로 리딩 듣기';next.onclick=compactRead;document.getElementById('card-table-section').append(next);
 setCompactDisclosureTitle(extras,'질문 예시 보기');
 const oldUpdate=updateStudy;window.updateStudy=function(){oldUpdate();setCompactDisclosureTitle(extras,'질문 예시 보기');const ready=allCardsFlipped();document.getElementById('compact-read').disabled=!ready;document.getElementById('compact-reading-nav').disabled=!ready;if((compactStage==='reading'||compactStage==='learning')&&!ready)setCompactStage('cards');else setCompactVisibility();};
 function setCompactVisibility(){setup.hidden=compactStage!=='question';document.getElementById('card-table-section').hidden=compactStage!=='cards';document.getElementById('reading-conversation').hidden=compactStage!=='reading';document.getElementById('tarot-study').hidden=compactStage!=='learning';}
 const legacy=document.querySelector('.legacy-reading');if(legacy){document.getElementById('reading-conversation').append(legacy);legacy.querySelector('summary').textContent='상세 풀이 · 기록 저장';}document.querySelectorAll('.learning-end-controls button').forEach(b=>{if(b.textContent.includes('리딩 대화'))b.setAttribute('onclick',"setCompactStage('reading')");});
 const oldLearn=enterLearningRoom;window.enterLearningRoom=function(){oldLearn();setCompactStage('learning');};
 const oldLeave=leaveReadingRoom;window.leaveReadingRoom=function(){oldLeave();setCompactStage('question');};
 const oldGo=goToCardChoice;window.goToCardChoice=function(){setCompactStage('cards');oldGo();};
 document.querySelectorAll('.compact-disclosure,.compact-settings,.legacy-reading').forEach(d=>{if(!d.querySelector('.disclosure-hint'))setCompactDisclosureTitle(d,d.querySelector('summary').textContent);});document.getElementById('compact-read').disabled=!allCardsFlipped();document.getElementById('compact-reading-nav').disabled=!allCardsFlipped();setCompactStage('question');
});
