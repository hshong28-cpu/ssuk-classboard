'use strict';
let studyTab='basics', aiReady=false, aiBusy=false, readingSignature='', aiHistory=[], activeRequest=null;
let soundEnabled=false, soundContext=null;
const majorLessons=[
 ['새로운 시작과 열린 가능성','익숙한 방식에서 벗어나 처음 해보는 일을 시작하는 장면이에요. 준비 없이 뛰어드는 것과 열린 마음으로 시도하는 것은 구분해요.','새 취미를 배워보고 싶지만 잘할지 몰라 망설이는 상황','시작에 대한 두려움인지, 준비가 부족한 것인지 살펴보세요.'],
 ['가지고 있는 자원을 실제 행동으로','능력이나 도구를 갖추는 데서 멈추지 않고 활용하는 카드예요. 무엇을 할 수 있는지부터 구체적으로 봅니다.','새 프로젝트를 맡아 내가 가진 경험과 도구를 정리하는 상황','능력을 과장하거나 실행을 미루는 모습인지 확인해요.'],
 ['드러나지 않은 정보와 내면의 판단','바로 결론을 내리기보다 아직 모르는 정보와 미묘한 느낌을 살피는 카드예요. 느낌만으로 사실을 단정하지는 않아요.','상대의 말이 모호해서 조금 더 관찰이 필요한 상황','감정을 억누르는지, 근거 없이 짐작하는지 구분해요.'],
 ['돌봄과 성장, 풍요','시간과 관심을 들여 관계나 작업을 키워가는 카드예요. 결과를 재촉하기보다 성장에 필요한 조건을 읽어요.','새로 시작한 일을 꾸준히 돌보며 결과를 기다리는 상황','돌봄이 지나쳐 간섭이 되거나 내 필요를 뒤로 미루는지 봐요.'],
 ['구조와 책임, 경계','규칙을 세우고 책임을 나누어 안정감을 만드는 카드예요. 권위적인 사람 한 명으로만 해석하지 않아요.','업무 범위와 마감일을 정해야 일이 진행되는 상황','규칙이 너무 엄격한지, 필요한 기준이 없는지 확인해요.'],
 ['전통과 배움, 공동의 기준','검증된 방식이나 조언을 통해 배우는 카드예요. 내가 속한 집단의 규칙과 내 가치가 맞는지도 살펴요.','자격 공부를 하거나 선배에게 일하는 방식을 배우는 상황','남의 기준을 무조건 따르거나 조언을 모두 거부하는지 봐요.'],
 ['가치에 맞는 선택과 관계','연애뿐 아니라 내가 중요하게 여기는 가치와 선택의 일치를 뜻해요. 연결하려면 서로의 기준을 알아야 해요.','조건 좋은 제안과 내가 원하는 방향 사이에서 선택하는 상황','마음과 행동이 어긋나거나 합의가 필요한지 확인해요.'],
 ['방향을 정하고 추진하기','서로 다른 욕구를 조율하며 목표를 향해 움직이는 카드예요. 속도보다 방향과 통제가 중요해요.','이직 준비와 현재 업무를 병행하며 우선순위를 정하는 상황','무리하게 밀어붙이는지, 방향을 잃었는지 구분해요.'],
 ['부드러운 용기와 감정 조절','힘으로 누르기보다 감정을 이해하고 다루는 카드예요. 참는 것만을 성숙함으로 보지 않아요.','화가 나지만 관계를 해치지 않도록 차분하게 요구를 전하는 상황','자신감을 잃었는지, 감정을 억압하고 있는지 확인해요.'],
 ['혼자 살피고 방향 찾기','잠시 거리를 두고 내 기준을 정리하는 카드예요. 고립과 필요한 혼자만의 시간은 다르게 읽어요.','여러 사람의 조언을 들은 뒤 혼자 우선순위를 정리하는 상황','혼자 있을 필요가 있는지, 도움을 피하고 있는지 살펴요.'],
 ['변화하는 흐름과 타이밍','내가 통제하기 어려운 변화와 반복되는 주기를 읽는 카드예요. 무조건 행운이 온다는 뜻은 아니에요.','조직 개편으로 예상하지 못한 선택지가 생기는 상황','변화에 저항하는지, 반복되는 패턴을 놓치는지 봐요.'],
 ['균형 있는 판단과 책임','느낌만이 아니라 사실과 기준을 놓고 선택의 결과를 살펴요. 공정함이 무엇인지 구체화하는 카드예요.','계약 조건과 역할 분담을 다시 확인하는 상황','한쪽 이야기만 듣거나 내 책임을 피하고 있는지 확인해요.'],
 ['멈춤과 관점의 전환','움직이지 않는 시간이 반드시 실패는 아니라는 카드예요. 다른 각도에서 볼 때 보이는 선택지를 찾습니다.','진행이 막힌 프로젝트를 잠시 멈추고 방법을 다시 검토하는 상황','필요한 기다림인지, 결정을 계속 미루는지 구분해요.'],
 ['끝맺음과 전환','계속 유지하기 어려운 방식이나 단계가 끝나는 카드예요. 실제 죽음이나 이별을 단정하는 카드가 아닙니다.','이전 업무 방식을 정리하고 새로운 역할로 옮겨가는 상황','끝난 것을 붙잡는지, 변화에 적응할 시간이 필요한지 봐요.'],
 ['조율과 적당한 속도','서로 다른 것들을 조금씩 맞추어 지속 가능한 균형을 만드는 카드예요. 극단보다 조정 과정에 주목해요.','일과 휴식 비율을 바꾸며 나에게 맞는 리듬을 찾는 상황','한쪽으로 치우쳤는지, 조정에 시간이 더 필요한지 봐요.'],
 ['집착과 반복되는 제약','나를 붙잡는 습관이나 의존을 살펴보는 카드예요. 나쁜 사람이나 저주가 있다는 식으로 읽지 않아요.','손해인 줄 알면서도 익숙해서 같은 선택을 반복하는 상황','제약을 알아차리고 풀어내는 중인지, 외면하는지 확인해요.'],
 ['흔들리는 전제와 재정비','당연하다고 믿었던 구조가 흔들리는 카드예요. 불행을 예고하기보다 무엇을 다시 세워야 하는지 봅니다.','당연하게 생각한 계획이 바뀌어 우선순위를 다시 잡는 상황','변화를 피하는 중인지, 충격을 정리하는 중인지 살펴요.'],
 ['회복과 현실적인 희망','당장 완성된 결과보다 다시 믿고 회복해 나갈 여지를 뜻해요. 작은 회복의 증거를 찾습니다.','지쳤던 일을 쉬었다가 작은 목표부터 다시 시작하는 상황','희망이 잘 느껴지지 않는지, 기대만 하고 있는지 구분해요.'],
 ['불확실함과 상상, 불안','정보가 모자라 마음이 빈틈을 상상으로 채울 수 있는 카드예요. 사실과 추측을 나누어 봅니다.','답장이 늦어 여러 이유를 혼자 짐작하고 있는 상황','혼란이 걷히는 과정인지, 불안이 커진 것인지 확인해요.'],
 ['명료함과 기쁨, 드러나는 성과','무엇이 잘되고 있는지 선명해지는 카드예요. 장점을 확인하되 모든 문제가 사라진다고 단정하지 않아요.','오랫동안 준비한 작업이 좋은 반응을 얻는 상황','기쁨을 느끼기 어렵거나 성과가 늦게 드러나는지 봐요.'],
 ['돌아보고 새롭게 응답하기','지난 경험을 돌아보고 지금 어떤 선택을 할지 결정하는 카드예요. 남의 평가보다 내가 배운 점을 읽습니다.','예전 경험을 바탕으로 다시 도전할지 결정하는 상황','스스로를 지나치게 평가하거나 결정을 미루는지 봐요.'],
 ['완성과 통합, 다음 단계','한 과정을 마무리하고 경험을 정리하는 카드예요. 끝난 뒤 무엇을 이어갈지까지 살펴요.','긴 프로젝트를 마치고 배운 것을 다음 일에 활용하는 상황','마지막 정리가 남았는지, 마무리를 인정하기 어려운지 봐요.']
];
const suitLessons={wands:['의욕과 행동','일을 시작하고 추진하는 방식'],cups:['감정과 관계','내 마음과 타인에게 반응하는 방식'],swords:['생각과 말, 판단','사실을 해석하고 결정을 내리는 방식'],pentacles:['돈과 일, 생활 기반','시간과 자원을 관리하고 결과를 쌓는 방식']};
const rankLessons=['','새로운 가능성이 시작됨','두 선택이나 힘을 조율함','함께 넓히고 발전시킴','기반을 지키거나 잠시 멈춤','갈등이나 부족함을 경험함','관계를 회복하고 균형을 찾음','시험 앞에서 내 입장을 살핌','움직임과 반복을 통해 배움','그동안의 경험이 쌓임','한 과정의 결과와 다음 과제를 봄','호기심을 가지고 배우는 태도','적극적으로 움직이는 태도','이해하고 돌보며 조율하는 태도','책임지고 관리하는 태도'];
function motionPreference(){return matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth';}
function lessonFor(card){if(card.arcana==='major')return majorLessons[card.number];const s=suitLessons[card.suitKey];return [s[0],`${s[1]}${josa(s[1],'을/를')} 살펴보는 카드예요. 숫자·궁정 단계의 관점은 ‘${rankLessons[card.number]}’입니다. 카드 고유 키워드와 함께 읽어야 해요.`,`${CATEGORIES[appState.category].label}에서 ‘${card.keywordsUp.join(', ')}’${josa(card.keywordsUp[card.keywordsUp.length-1],'이/가')} 드러나는 구체적인 장면을 떠올려 보세요.`,`‘${card.keywordsRev.join(', ')}’${josa(card.keywordsRev[card.keywordsRev.length-1],'이/가')} 과잉·막힘·내면화 중 어느 쪽에 가까운지 살펴요.`];}
function setStudyTab(tab){studyTab=tab;['basics','analysis','practice'].forEach(t=>{const b=document.getElementById('tab-'+t);b.setAttribute('aria-selected',String(t===tab));b.tabIndex=t===tab?0:-1;document.getElementById('pane-'+t).hidden=t!==tab;});playStudioSound('tap');}
function studioSnapshot(){return JSON.stringify([selectedDeck,appState.question,appState.category,appState.spread,appState.drawnSlots.map(s=>[s.card.id,s.isReversed,s.isFlipped])]);}
function updateStudy(){
 const sig=studioSnapshot();if(sig!==readingSignature){readingSignature=sig;aiHistory=[];if(activeRequest)activeRequest.abort();document.getElementById('analysis-output').textContent='';document.getElementById('practice-output').textContent='';document.getElementById('studio-error').textContent='';}
 const visible=appState.drawnSlots.map((s,i)=>({...s,index:i})).filter(s=>s.isFlipped);
 document.getElementById('study-empty').hidden=visible.length>0;
 document.getElementById('study-cards').innerHTML=visible.map(s=>{const c=s.card,l=lessonFor(c),p=SPREADS[appState.spread].positions[s.index];return `<article class="study-card"><span class="study-position">${escapeHtml(p.title)} · ${s.isReversed?'역방향':'정방향'}</span><h3>${escapeHtml(c.nameKo)} <span style="font-size:13px;color:var(--on-surface-variant)">${escapeHtml(c.nameEn)}</span></h3><p><strong>핵심 뜻</strong> · ${escapeHtml(l[0])}<br>${escapeHtml(l[1])}</p><p><strong>이 방향에서는</strong><br>${escapeHtml(s.isReversed?l[3]:c.keywordsUp.join(' · '))}</p><p><strong>일상에 연결하면</strong><br>${escapeHtml(l[2])}</p><details><summary>이 자리에서 읽는 방법</summary><p>‘${escapeHtml(p.title)}’ 자리는 ${escapeHtml(p.subtitle)}${josa(p.subtitle,'을/를')} 살피는 자리예요. 카드의 뜻을 그 관점에 연결하세요. ${appState.spread==='time'&&s.index===2?'미래는 확정된 예언이 아니라 현재의 흐름이 이어질 때 가능한 방향으로 읽습니다.':''}</p><p>전통 상징 참고: ${escapeHtml(c.symbolNote)} 실제 제작 덱 그림과 다를 수 있으니 그림에서 직접 확인하세요.</p></details><p><strong>생각해 볼 질문</strong><br>이 자리의 의미와 ‘${escapeHtml((s.isReversed?c.keywordsRev:c.keywordsUp)[0])}’${josa((s.isReversed?c.keywordsRev:c.keywordsUp)[0],'을/를')} 연결하면, 질문한 상황을 어떤 문장으로 설명할 수 있을까요?</p></article>`;}).join('');
 document.getElementById('study-preview').src=DECK_IMAGES[selectedDeck].back;
 document.querySelectorAll('.hero-preview img').forEach((im,i)=>im.src=DECK_IMAGES[i?'family':'joseon']['major-2']);
}
async function requestTarotAI(mode){
 if(aiBusy)return;const err=document.getElementById('studio-error');err.textContent='';
 if(!allCardsFlipped()){err.textContent='배열에 필요한 카드를 모두 뽑고 뒤집어 주세요.';return;}
 if(!aiReady){err.textContent='AI 분석을 사용하려면 압축 파일의 실행 파일로 로컬 서버를 시작하고 OpenAI API 키를 입력해 주세요. 카드 읽기 탭은 연결 없이 사용할 수 있어요.';return;}
 const field=mode==='practice'?'practice-answer':'followup-answer',answer=mode==='analysis'?'':document.getElementById(field).value.trim();
 if(mode!=='analysis'&&!answer){err.textContent='먼저 내용을 입력해 주세요.';document.getElementById(field).focus();return;}
 if(mode==='followup'&&!aiHistory.length){err.textContent='먼저 이 배열 분석하기를 눌러 주세요.';return;}
 const target=document.getElementById(mode==='practice'?'practice-output':'analysis-output');const sig=studioSnapshot();
 aiBusy=true;activeRequest=new AbortController();const timeout=setTimeout(()=>activeRequest?.abort(),90000);
 document.getElementById('ai-loading').hidden=false;document.getElementById('studio-status').textContent='카드의 의미와 배열을 연결하고 있어요…';document.querySelectorAll('#tarot-study button[type=submit],#analyze-start').forEach(b=>b.disabled=true);
 try{
 const payload={mode,answer,deck:selectedDeck,question:appState.question,category:CATEGORIES[appState.category].label,spread:SPREADS[appState.spread].name,cards:appState.drawnSlots.map((s,i)=>({id:s.card.id,name:s.card.nameKo,reversed:s.isReversed,position:SPREADS[appState.spread].positions[i].title,keywords:s.isReversed?s.card.keywordsRev:s.card.keywordsUp,symbol:s.card.symbolNote,lesson:lessonFor(s.card)})),history:mode==='followup'?aiHistory.slice(-8):[]};
 const r=await fetch('/api/analyze',{method:'POST',headers:{'Content-Type':'application/json','X-Tarot-Client':'studio'},body:JSON.stringify(payload),signal:activeRequest.signal});const result=await r.json();if(!r.ok)throw Error(result.error||'분석 요청을 완료하지 못했습니다.');if(sig!==studioSnapshot())return;
 if(mode==='followup'){target.textContent+='\n\n나의 답변\n'+answer+'\n\n추가 분석\n'+result.text;}else target.textContent=result.text;
 target.style.whiteSpace='pre-wrap';if(mode!=='practice'){if(mode==='analysis')aiHistory=[];aiHistory.push({role:'user',content:mode==='analysis'?'이 배열을 분석해 주세요.':answer},{role:'assistant',content:result.text});document.getElementById('followup-answer').value='';}
 document.getElementById('studio-status').textContent='분석이 준비됐어요.';
 }catch(e){if(sig===studioSnapshot())err.textContent=e.name==='AbortError'?'분석이 중단됐거나 시간이 초과됐어요. 다시 요청할 수 있습니다.':e.message;}finally{clearTimeout(timeout);aiBusy=false;activeRequest=null;document.getElementById('ai-loading').hidden=true;document.querySelectorAll('#tarot-study button[type=submit],#analyze-start').forEach(b=>b.disabled=false);if(err.textContent)document.getElementById('studio-status').textContent='';}
}
let cardFoleyBuffer=null,cardFoleyLoading=null,cardFoleyVoice=null,lastCardSoundAt=-100;
const CARD_FOLEY_URL='media/card-slide.mp3';
async function loadCardFoley(){
 if(cardFoleyBuffer)return cardFoleyBuffer;
 if(!cardFoleyLoading)cardFoleyLoading=fetch(CARD_FOLEY_URL).then(r=>{if(!r.ok)throw Error('audio unavailable');return r.arrayBuffer();}).then(b=>soundContext.decodeAudioData(b)).then(b=>cardFoleyBuffer=b).catch(()=>{cardFoleyLoading=null;return null;});
 return cardFoleyLoading;
}
function stopCardFoley(){if(!cardFoleyVoice)return;const voice=cardFoleyVoice;cardFoleyVoice=null;try{voice.gain.gain.cancelScheduledValues(soundContext.currentTime);voice.gain.gain.setTargetAtTime(0,soundContext.currentTime,.008);voice.source.stop(soundContext.currentTime+.04);}catch(e){}}
async function toggleStudioSound(){try{if(!soundContext){const A=window.AudioContext||window.webkitAudioContext;if(!A)throw Error('unavailable');soundContext=new A();}await soundContext.resume();soundEnabled=!soundEnabled;const b=document.getElementById('sound-toggle');b.setAttribute('aria-pressed',String(soundEnabled));b.textContent='카드 소리 '+(soundEnabled?'켜짐':'꺼짐');if(soundEnabled)loadCardFoley();else stopCardFoley();}catch(e){document.getElementById('sound-toggle').textContent='카드 소리 사용 불가';}}
async function playStudioSound(kind){
 if(!['place','reveal','shuffle'].includes(kind)||!soundEnabled||!soundContext||soundContext.state!=='running'||document.hidden)return;
 const requestedAt=soundContext.currentTime;if(requestedAt-lastCardSoundAt<.12)return;lastCardSoundAt=requestedAt;
 const buffer=await loadCardFoley();if(!buffer||!soundEnabled||document.hidden||soundContext.currentTime-requestedAt>.3)return;
 stopCardFoley();const a=soundContext,t=a.currentTime,source=a.createBufferSource(),gain=a.createGain(),filter=a.createBiquadFilter();gain.gain.value=0;source.buffer=buffer;filter.type='lowpass';filter.frequency.value=3600;
 gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(kind==='shuffle'?.13:.16,t+.025);gain.gain.setValueAtTime(kind==='shuffle'?.13:.16,t+Math.max(.03,buffer.duration-.09));gain.gain.linearRampToValueAtTime(0,t+buffer.duration);
 source.connect(filter);filter.connect(gain);gain.connect(a.destination);cardFoleyVoice={source,gain};source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();if(cardFoleyVoice?.source===source)cardFoleyVoice=null;};source.start(t);
}
document.addEventListener('DOMContentLoaded',async()=>{
 updateStudy();
 for(const name of ['renderSpreadStage','selectImageDeck','shuffleAndPrepareDeck','resetSession']){const fn=window[name];window[name]=function(...args){const r=fn.apply(this,args);updateStudy();if(name==='shuffleAndPrepareDeck')playStudioSound('shuffle');return r;};}
 for(const [name,sound]of [['pickCandidateCard','place'],['handleSlotCardClick','reveal'],['flipAllDrawn','reveal']]){const fn=window[name];window[name]=function(...args){const before=JSON.stringify(appState.drawnSlots);const r=fn.apply(this,args);if(before!==JSON.stringify(appState.drawnSlots))playStudioSound(sound);return r;};}
 document.querySelector('.studio-tabs').addEventListener('keydown',e=>{const names=['basics','analysis','practice'];let i=names.indexOf(studyTab);if(e.key==='ArrowRight')i=(i+1)%3;else if(e.key==='ArrowLeft')i=(i+2)%3;else if(e.key==='Home')i=0;else if(e.key==='End')i=2;else return;e.preventDefault();setStudyTab(names[i]);document.getElementById('tab-'+names[i]).focus();});
 try{const r=await fetch('/api/status',{signal:AbortSignal.timeout(3000)});if(r.ok){const d=await r.json();aiReady=d.ready;}}catch(e){}
 document.getElementById('ai-connection').textContent=aiReady?'AI 연결됨':'카드 학습 사용 가능 · AI 연결 필요';
});
