// Turn every button-group choice into a labelled dropdown. The original buttons stay
// (hidden) so all existing handlers and state keep working; the select clicks them.
function dropdownFromButtons(group,{id,label,placeholder,buttons,text,isSelected,rebuildOnChange}){
 if(!group)return null;
 const wrap=document.createElement('div');wrap.className='app-select-wrap';
 const lab=document.createElement('label');lab.className='app-select-label';lab.htmlFor=id;lab.textContent=label;
 const sel=document.createElement('select');sel.id=id;sel.className='app-select';
 wrap.append(lab,sel);group.classList.add('dd-hidden');group.after(wrap);
 let list=[];
 const build=()=>{list=buttons();sel.replaceChildren();if(placeholder){const o=document.createElement('option');o.value='';o.textContent=placeholder;o.disabled=true;sel.append(o);}
  list.forEach((b,i)=>{const o=document.createElement('option');o.value=String(i);o.textContent=text(b);sel.append(o);});sync();};
 const sync=()=>{list.forEach((b,i)=>{const o=sel.querySelector(`option[value="${i}"]`);if(o)o.disabled=b.disabled;});const i=isSelected?list.findIndex(isSelected):-1;sel.value=i>=0?String(i):'';const ph=sel.querySelector('option[value=""]');if(ph&&isSelected)ph.hidden=i>=0;sel.disabled=list.length>0&&list.every(b=>b.disabled);};
 sel.addEventListener('change',()=>{const b=list[Number(sel.value)];if(b)b.click();if(!isSelected)sel.value='';else sync();});
 new MutationObserver(m=>{if(rebuildOnChange&&m.some(x=>x.type==='childList'))build();else sync();}).observe(group,{subtree:true,childList:true,attributes:true,attributeFilter:['aria-pressed','aria-current','aria-selected','disabled']});
 build();return sel;
}
document.addEventListener('DOMContentLoaded',()=>{
 const pressed=b=>b.getAttribute('aria-pressed')==='true';
 // Learning mode: read the same cards from another topic's point of view.
 const lenses=document.querySelector('.learning-lenses');
 dropdownFromButtons(lenses,{id:'learning-lens-select',label:'어떤 관점으로 읽어볼까요?',buttons:()=>[...lenses.querySelectorAll('button')],text:b=>b.textContent.trim(),isSelected:pressed});
 // Spread choice.
 const spreads=document.querySelector('.spread-options');
 dropdownFromButtons(spreads,{id:'spread-select',label:'카드 배열',buttons:()=>[...spreads.querySelectorAll('button')],text:b=>{const t=b.querySelector('.spread-card-title span')?.textContent.trim()||b.textContent.trim();const d=b.querySelector('.spread-card-desc')?.textContent.trim();return d?`${t} — ${d}`:t;},isSelected:pressed});
 // Image deck choice in the header.
 const decks=document.querySelector('.image-deck-picker');
 dropdownFromButtons(decks,{id:'deck-select',label:'카드 덱',buttons:()=>[...decks.querySelectorAll('button')],text:b=>b.textContent.trim(),isSelected:pressed});
 // Reading steps (question → cards → reading).
 const steps=document.querySelector('.compact-nav');
 dropdownFromButtons(steps,{id:'step-select',label:'진행 단계',placeholder:'학습 모드',buttons:()=>[...steps.querySelectorAll('button')],text:b=>b.textContent.trim(),isSelected:b=>b.getAttribute('aria-current')==='step'});
 // Learning mode tabs.
 const tabs=document.querySelector('.studio-tabs');
 dropdownFromButtons(tabs,{id:'study-tab-select',label:'학습 방법',buttons:()=>[...tabs.querySelectorAll('[role=tab]')],text:b=>b.textContent.trim(),isSelected:b=>b.getAttribute('aria-selected')==='true'});
 // Follow-up questions during a reading.
 const follow=document.querySelector('.followup-choices');
 dropdownFromButtons(follow,{id:'followup-select',label:'어떤 부분을 더 이야기해 볼까요?',placeholder:'더 물어볼 내용을 골라 주세요',buttons:()=>[...follow.querySelectorAll('button')],text:b=>b.textContent.trim()});
 document.querySelector('.followup-caption')?.classList.add('dd-hidden');
 // Example questions: picking one fills the question field.
 const presets=document.getElementById('preset-container');
 dropdownFromButtons(presets,{id:'preset-select',label:'질문 예시',placeholder:'예시 질문을 골라 보세요',buttons:()=>[...presets.querySelectorAll('button')],text:b=>b.textContent.trim(),rebuildOnChange:true});
});
