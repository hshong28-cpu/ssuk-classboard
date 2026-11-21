// Simpler screen: one menu for secondary controls, fewer notices when AI is not connected.
document.addEventListener('DOMContentLoaded',()=>{
 const header=document.querySelector('.hero-header'),menu=header.querySelector('.compact-settings');
 if(menu){
  const summary=menu.querySelector('summary');summary.replaceChildren('☰ 메뉴');summary.setAttribute('aria-label','메뉴');
  const panel=document.createElement('div');panel.className='menu-panel';
  [...menu.children].filter(c=>c!==summary).forEach(c=>panel.append(c));
  const deck=document.getElementById('deck-select')?.closest('.app-select-wrap');if(deck)panel.prepend(deck);
  header.querySelectorAll('.hero-actions > button').forEach(b=>panel.append(b));
  menu.append(panel);
  document.addEventListener('click',e=>{if(menu.open&&!menu.contains(e.target))menu.open=false;});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.open){menu.open=false;summary.focus();}});
 }
 // Without AI, the AI-only study tabs and status labels only add noise.
 const applyAi=()=>{const tabs=document.getElementById('study-tab-select')?.closest('.app-select-wrap');if(tabs)tabs.hidden=!aiReady;if(!aiReady&&studyTab!=='basics')setStudyTab('basics');document.getElementById('ai-connection').hidden=!aiReady;};
 new MutationObserver(applyAi).observe(document.getElementById('ai-connection'),{childList:true,characterData:true,subtree:true});applyAi();
});
