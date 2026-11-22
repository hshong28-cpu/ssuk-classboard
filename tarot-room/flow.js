// One continuous screen: each finished step clears itself away and the next one appears.
document.addEventListener('DOMContentLoaded',()=>{
 const table=document.getElementById('card-table-section');
 const reduce=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 const go=(fn,ms)=>setTimeout(fn,reduce()?0:ms);
 // 1) Intake finished (the guide stops asking) -> move straight on to the cards.
 const reply=document.getElementById('intake-reply');
 if(reply)new MutationObserver(()=>{if(reply.hidden&&typeof intakeTopic!=='undefined'&&intakeTopic&&compactStage==='question')go(()=>{if(compactStage==='question')compactPrepare();},1400);}).observe(reply,{attributes:true,attributeFilter:['hidden']});
 // 2) All cards picked -> clear the deck away; all cards turned -> go to the reading.
 let readingTimer=0,wasFull=false;
 const base=window.updateTableControls;
 window.updateTableControls=function(...a){
  const r=base.apply(this,a);
  const need=SPREADS[appState.spread].count,full=appState.drawnSlots.length>=need;
  table.classList.toggle('deck-done',full);
  if(full&&!wasFull){go(()=>document.getElementById('spread-stage')?.scrollIntoView({behavior:reduce()?'auto':'smooth',block:'center'}),350);}
  wasFull=full;
  clearTimeout(readingTimer);
  if(full&&allCardsFlipped()&&compactStage==='cards'){const toReading=()=>{if(compactStage!=='cards'||!allCardsFlipped())return;if(document.body.classList.contains('viewer-open')){readingTimer=setTimeout(toReading,800);return;}compactRead();};readingTimer=setTimeout(toReading,reduce()?1600:2400);}
  return r;
 };
});
