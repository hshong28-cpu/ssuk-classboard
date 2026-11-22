// Themed dropdowns: the phone's white native list is replaced by an in-app list in the room's colours.
// The real <select> stays (hidden) as the source of truth, so every existing handler keeps working.
(function(){
 const open=new Set();
 function enhance(sel){
  if(sel.dataset.themed)return;sel.dataset.themed='1';
  const box=document.createElement('div');box.className='tsel';
  const btn=document.createElement('button');btn.type='button';btn.className='tsel-btn '+sel.className.replace(/\b(app-select|intake-topic-select)\b/g,'').trim();
  btn.classList.add(sel.classList.contains('intake-topic-select')?'tsel-topic':'tsel-app');if(sel.id==='step-select')btn.classList.add('tsel-step');
  btn.setAttribute('aria-haspopup','listbox');btn.setAttribute('aria-expanded','false');btn.id=sel.id+'-btn';
  const lab=document.querySelector(`label[for="${sel.id}"]`);if(lab){lab.htmlFor=btn.id;btn.setAttribute('aria-labelledby',(lab.id||(lab.id=sel.id+'-label'))+' '+btn.id);}
  const val=document.createElement('span');val.className='tsel-val';btn.append(val);
  const list=document.createElement('ul');list.className='tsel-list';list.setAttribute('role','listbox');list.hidden=true;list.id=sel.id+'-list';btn.setAttribute('aria-controls',list.id);
  sel.after(box);box.append(btn,list);sel.classList.add('tsel-native');sel.tabIndex=-1;sel.setAttribute('aria-hidden','true');
  let active=-1;
  const opts=()=>[...sel.options].filter(o=>!o.hidden);
  const paint=()=>{const o=sel.options[sel.selectedIndex];val.textContent=o&&!o.hidden?o.textContent:(sel.options[0]?.textContent||'');btn.disabled=sel.disabled;btn.classList.toggle('is-placeholder',!o||o.value==='');};
  const build=()=>{list.replaceChildren();opts().forEach((o,k)=>{const li=document.createElement('li');li.setAttribute('role','option');li.id=list.id+'-'+k;li.textContent=o.textContent;li.dataset.v=o.value;
   if(o.disabled)li.setAttribute('aria-disabled','true');if(o.selected&&o.value!=='')li.setAttribute('aria-selected','true');list.append(li);});};
  const items=()=>[...list.children];
  const setActive=i=>{const it=items();active=i;it.forEach((li,k)=>li.classList.toggle('is-active',k===i));if(it[i]){btn.setAttribute('aria-activedescendant',it[i].id);it[i].scrollIntoView({block:'nearest'});}};
  const move=d=>{const it=items();let i=active;for(let n=0;n<it.length;n++){i=(i+d+it.length)%it.length;if(it[i].getAttribute('aria-disabled')!=='true'){setActive(i);return;}}};
  const place=()=>{const r=btn.getBoundingClientRect(),gap=6,below=innerHeight-r.bottom-gap-8,above=r.top-gap-8,want=Math.min(360,items().length*52+12),up=below<Math.min(want,220)&&above>below;
   list.style.left=Math.max(8,r.left)+'px';list.style.width=Math.min(r.width,innerWidth-16)+'px';list.style.maxHeight=Math.max(140,Math.min(want,up?above:below))+'px';
   if(up){list.style.top='auto';list.style.bottom=(innerHeight-r.top+gap)+'px';}else{list.style.bottom='auto';list.style.top=(r.bottom+gap)+'px';}};
  const inline=()=>!!box.closest('.menu-panel');
  const show=()=>{if(btn.disabled)return;closeAll();build();if(!inline()){document.body.append(list);list.classList.add('tsel-floating');}else{list.classList.remove('tsel-floating');list.removeAttribute('style');}list.hidden=false;box.classList.add('is-open');btn.setAttribute('aria-expanded','true');open.add(close);if(!inline()){place();
   addEventListener('resize',place);addEventListener('scroll',onScroll,true);}
   const cur=items().findIndex(li=>li.getAttribute('aria-selected')==='true');setActive(cur>=0?cur:items().findIndex(li=>li.getAttribute('aria-disabled')!=='true'));};
  const onScroll=e=>{if(e.target===list||list.contains(e.target))return;const r=btn.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)close();else place();};
  const close=()=>{removeEventListener('resize',place);removeEventListener('scroll',onScroll,true);list.hidden=true;box.append(list);box.classList.remove('is-open');btn.setAttribute('aria-expanded','false');btn.removeAttribute('aria-activedescendant');open.delete(close);};
  const choose=li=>{if(!li||li.getAttribute('aria-disabled')==='true')return;close();btn.focus({preventScroll:true});if(sel.value!==li.dataset.v||li.dataset.v===''){sel.value=li.dataset.v;}else{sel.value=li.dataset.v;}
   sel.dispatchEvent(new Event('change',{bubbles:true}));paint();};
  btn.addEventListener('click',()=>list.hidden?show():close());
  list.addEventListener('click',e=>choose(e.target.closest('li')));
  btn.addEventListener('keydown',e=>{if(['ArrowDown','ArrowUp'].includes(e.key)){e.preventDefault();if(list.hidden)show();else move(e.key==='ArrowDown'?1:-1);}
   else if(e.key==='Enter'||e.key===' '){if(!list.hidden){e.preventDefault();choose(items()[active]);}}else if(e.key==='Escape'&&!list.hidden){e.preventDefault();close();}else if(e.key==='Home'&&!list.hidden){e.preventDefault();setActive(-1);move(1);}else if(e.key==='End'&&!list.hidden){e.preventDefault();setActive(items().length);move(-1);}else if(e.key==='Tab')close();});
  new MutationObserver(()=>{paint();if(!list.hidden)build();}).observe(sel,{subtree:true,childList:true,attributes:true,characterData:true});
  sel.addEventListener('change',paint);
  // the app also sets .value from code; keep the label in step
  let last='';setInterval(()=>{const k=sel.selectedIndex+'|'+sel.disabled;if(k!==last){last=k;paint();}},300);
  paint();
 }
 function closeAll(){[...open].forEach(f=>f());}
 document.addEventListener('click',e=>{if(!e.target.closest('.tsel')&&!e.target.closest('.tsel-list'))closeAll();});
 document.addEventListener('DOMContentLoaded',()=>{document.querySelectorAll('select.app-select, select.intake-topic-select').forEach(enhance);
  new MutationObserver(()=>document.querySelectorAll('select.app-select:not([data-themed]), select.intake-topic-select:not([data-themed])').forEach(enhance)).observe(document.body,{childList:true,subtree:true});});
})();
