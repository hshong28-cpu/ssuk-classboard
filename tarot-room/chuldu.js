// "암행어사 출두요!" — when the last card is turned, the mapae is raised before the reading.
document.addEventListener('DOMContentLoaded',()=>{
 const reduce=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 const ov=document.createElement('div');ov.id='chuldu';ov.className='chuldu';ov.hidden=true;ov.setAttribute('role','status');ov.setAttribute('aria-live','assertive');
 ov.innerHTML='<div class="cd-flash"></div><div class="cd-ring"></div><img class="cd-mapae" src="assets/mapae.webp" alt=""><p class="cd-text"><span>암행어사</span><strong>출두요!</strong></p>';
 document.body.append(ov);
 function gong(){if(!soundEnabled||!soundContext||soundContext.state!=='running')return;const a=soundContext,t=a.currentTime,g=a.createGain();g.connect(a.destination);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.22,t+.02);g.gain.exponentialRampToValueAtTime(.0008,t+2.6);
  [[98,1],[196,.5],[293,.25],[148,.35]].forEach(([f,v])=>{const o=a.createOscillator(),og=a.createGain();o.type='sine';o.frequency.setValueAtTime(f*1.02,t);o.frequency.exponentialRampToValueAtTime(f,t+.4);og.gain.value=v;o.connect(og);og.connect(g);o.start(t);o.stop(t+2.7);});}
 let shownFor='',timer=0;
 function play(){clearTimeout(timer);ov.hidden=false;ov.classList.remove('go');void ov.offsetWidth;ov.classList.add('go');document.body.classList.add('chuldu-open');gong();
  timer=setTimeout(()=>{ov.classList.add('out');setTimeout(()=>{ov.hidden=true;ov.classList.remove('go','out');document.body.classList.remove('chuldu-open');},reduce()?0:450);},reduce()?1200:2300);}
 ov.addEventListener('click',()=>{clearTimeout(timer);ov.hidden=true;ov.classList.remove('go','out');document.body.classList.remove('chuldu-open');});
 const base=window.updateTableControls;window.updateTableControls=function(...a){const r=base.apply(this,a);
  const key=appState.drawnSlots.map(s=>s.card.id).join(',');
  if(allCardsFlipped()&&key&&key!==shownFor&&compactStage==='cards'){shownFor=key;if(selectedDeck==='joseon')play();}
  if(!appState.drawnSlots.length)shownFor='';
  return r;};
});
