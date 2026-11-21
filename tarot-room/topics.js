// Broader everyday questions and optional AI context gathering before a reading.
const EXTRA_TOPICS={
 parenting:{id:'parenting',label:'자녀 · 양육',presets:['아이와 대화가 자꾸 부딪힐 때 부모인 내가 먼저 바꿔볼 태도는?','아이의 공부나 진로를 도울 때 관심과 간섭의 경계를 어떻게 잡을까요?','생활 규칙을 두고 갈등이 생길 때 무엇부터 이야기해 볼까요?','아이에게 필요한 도움을 알아보기 위해 어떤 상황을 관찰하면 좋을까요?','형제자매 사이의 갈등에서 부모가 조율할 수 있는 부분은?','아이의 독립을 지지하면서 내 불안을 어떻게 다룰까요?'],focus:'부모가 직접 관찰한 상황, 대화 방식, 기대와 경계를 살펴보세요. 아이의 속마음이나 성격을 카드만으로 단정하지 않습니다.',clarifier:'주로 공부·진로, 생활 규칙, 감정 대화 중 어느 상황에서 부딪히나요?'},
 housing:{id:'housing',label:'이사 · 주거',presets:['이사를 고민하는 지금, 내 우선순위에서 놓친 것은 무엇일까요?','현재 집에 머무르는 선택과 이사하는 선택에서 각각 무엇을 고려할까요?','자녀 환경과 출퇴근, 비용 사이에서 어떤 기준을 먼저 세울까요?','새 동네에 적응하기 위해 준비하면 좋을 것은?','가족과 이사 의견이 다를 때 어떻게 합의점을 찾을까요?','이사 준비 과정에서 내가 직접 확인해야 할 현실 조건은?'],focus:'예산·주거 안정·가족의 생활·통학과 출퇴근 등 실제 조건을 비교해 보세요. 계약의 안전성이나 집값 전망은 카드로 확인할 수 없습니다.',clarifier:'이사를 고민하는 가장 큰 이유가 비용, 가족·자녀 환경, 출퇴근 중 무엇인가요?'},
 daily:{id:'daily',label:'일상 · 선택',presets:['요즘 여러 일이 버거울 때 무엇부터 덜어내면 좋을까요?','반복해서 미루는 일이 있다면 어떤 부담을 먼저 살펴야 할까요?','가족이나 친구의 부탁을 거절할 때 지키고 싶은 기준은?','A와 B 중 선택할 때 각각의 장점과 부담을 어떻게 비교할까요?','새로운 취미나 공부를 시작하려면 어떤 준비가 필요할까요?','바쁜 일상에서 나에게 맞는 휴식 방식을 어떻게 찾을까요?','같은 갈등이 반복될 때 내가 바꿀 수 있는 대응은 무엇일까요?','오늘 하루 작게 시도해 볼 수 있는 변화는?'],focus:'최근의 구체적인 장면과 내가 선택할 수 있는 행동을 연결해 보세요. 넓은 고민은 오늘 다룰 수 있는 한 가지 질문으로 줄여봅니다.',clarifier:'해야 할 일이 많아서 버거운가요, 아니면 결정할 일이 겹쳐서인가요?'}
};
Object.assign(CATEGORIES,EXTRA_TOPICS);
for(const c of FULL_DECK)for(const [key,topic]of Object.entries(EXTRA_TOPICS)){
 const plain=c.arcana==='major'?'이 카드가 다루는 변화와 태도를':'이 카드가 다루는 일상의 대응을';
 c.catUp[key]=`${c.nameKo}의 ‘${c.keywordsUp[0]}’${josa(c.keywordsUp[0],'을/를')} 중심으로 ${plain} 살펴볼 수 있어요. ${topic.focus}`;
 c.catRev[key]=`${c.nameKo}의 ‘${c.keywordsRev[0]}’${josa(c.keywordsRev[0],'이/가')} 막힘·과잉·내면화 중 어느 방식으로 나타나는지 확인해 보세요. ${topic.focus}`;
}
let questionContextTurns=[],questionContextSignature='',questionContextRequest=null,questionContextSequence=0;
function questionContextKey(){return JSON.stringify([appState.category,appState.question.trim()]);}
function resetQuestionContext(){questionContextSequence++;questionContextRequest?.abort();questionContextRequest=null;questionContextTurns=[];questionContextSignature=questionContextKey();const log=document.getElementById('question-context-log');if(log)log.replaceChildren();const form=document.getElementById('question-context-reply');if(form)form.hidden=true;const status=document.getElementById('question-context-status');if(status)status.textContent='';const b=document.getElementById('question-context-start');if(b)b.disabled=false;}
function appendContextTurn(role,text){questionContextTurns.push({role,content:text});const log=document.getElementById('question-context-log'),p=document.createElement('p');p.className=role==='user'?'context-visitor':'context-guide';p.textContent=(role==='user'?'나: ':'안내자: ')+text;log.append(p);}
async function clarifyReadingQuestion(answer=''){
 if(questionContextRequest)return;const status=document.getElementById('question-context-status');
 if(questionContextSignature!==questionContextKey())resetQuestionContext();
 if(!appState.question.trim()){status.textContent='먼저 위에 알아보고 싶은 질문을 적어 주세요.';return;}
 if(!aiReady){status.textContent='질문에 맞춰 추가 질문을 만들고 답변을 이해하는 기능은 AI 연결 후 사용할 수 있어요. 지금은 예시를 골라 바꾸어 쓰거나 직접 질문을 적고 기본 리딩을 시작할 수 있습니다.';return;}
 if(answer)appendContextTurn('user',answer);
 const seq=++questionContextSequence,controller=new AbortController();questionContextRequest=controller;const timeout=setTimeout(()=>controller.abort(),90000);status.textContent='질문에서 먼저 확인할 맥락을 살펴보고 있어요…';document.querySelectorAll('#question-context button').forEach(b=>b.disabled=true);
 try{const r=await fetch('/api/analyze',{method:'POST',headers:{'Content-Type':'application/json','X-Tarot-Client':'studio'},body:JSON.stringify({mode:'clarify',deck:selectedDeck,cards:[],categoryId:appState.category,category:CATEGORIES[appState.category].label,question:appState.question,answer,history:questionContextTurns.slice(-6)}),signal:controller.signal});const d=await r.json();if(!r.ok)throw Error(d.error||'질문을 정리하지 못했어요.');if(seq!==questionContextSequence)return;appendContextTurn('assistant',d.text);document.getElementById('question-context-reply').hidden=false;document.getElementById('question-context-answer').value='';status.textContent='답변을 더해도 좋고, 지금 카드 뽑기로 넘어가도 좋아요.';}
 catch(e){if(seq===questionContextSequence)status.textContent=e.name==='AbortError'?'질문 정리가 중단됐어요. 다시 시도할 수 있습니다.':e.message;}
 finally{clearTimeout(timeout);if(seq===questionContextSequence){questionContextRequest=null;document.querySelectorAll('#question-context button').forEach(b=>b.disabled=false);}}
}
function sendQuestionContext(){const a=document.getElementById('question-context-answer').value.trim();if(a)clarifyReadingQuestion(a);}
function goToCardChoice(){document.getElementById('card-table-section').scrollIntoView({behavior:motionPreference()});document.getElementById('open-deck').focus({preventScroll:true});}
function getQuestionContext(){return questionContextSignature===questionContextKey()?questionContextTurns.slice(-6):[];}
document.addEventListener('DOMContentLoaded',()=>{
 const categories=document.querySelector('[aria-label="상담 주제 카테고리"]');for(const [id,topic]of Object.entries(EXTRA_TOPICS)){const b=document.createElement('button');b.type='button';b.className='pill-btn';b.dataset.category=id;b.setAttribute('aria-pressed',String(appState.category===id));b.textContent=topic.label;b.onclick=()=>selectCategory(id);categories.append(b);}
 for(const [id,label]of Object.entries(EXTRA_TOPICS)){const b=document.createElement('button');b.className='btn btn-secondary';b.dataset.learningLens=id;b.setAttribute('aria-pressed','false');b.textContent=label.label;b.onclick=()=>setLearningLens(id);document.querySelector('.learning-lenses').append(b);}
 const baseSelect=selectCategory;window.selectCategory=function(id){baseSelect(id);resetQuestionContext();if(typeof updateStudy==='function')updateStudy();};
 const baseQuestion=handleQuestionInput;window.handleQuestionInput=function(v){baseQuestion(v);resetQuestionContext();if(typeof updateStudy==='function')updateStudy();};

});
