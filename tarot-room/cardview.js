// Bigger chosen cards: tap a turned card to see it large; the reading shows the chosen cards too.
document.addEventListener('DOMContentLoaded',()=>{
 const dlg=document.createElement('div');dlg.id='card-viewer';dlg.className='card-viewer';dlg.hidden=true;dlg.setAttribute('role','dialog');dlg.setAttribute('aria-modal','true');dlg.setAttribute('aria-labelledby','cv-title');
 dlg.innerHTML='<div class="cv-backdrop" data-close></div><div class="cv-body"><button type="button" class="cv-close" data-close aria-label="닫기">×</button>'+
  '<div class="cv-media"><img id="cv-img" alt=""></div>'+
  '<div class="cv-info"><p class="cv-pos" id="cv-pos"></p><h3 id="cv-title"></h3><p class="cv-en" id="cv-en"></p><p class="cv-dir" id="cv-dir"></p><p class="cv-kw" id="cv-kw"></p><p class="cv-note" id="cv-note"></p>'+
  '<div class="cv-nav"><button type="button" class="btn btn-secondary" id="cv-prev">‹ 이전 카드</button><button type="button" class="btn btn-secondary" id="cv-rot">바로 놓고 보기</button><button type="button" class="btn btn-secondary" id="cv-next">다음 카드 ›</button></div></div></div>';
 document.body.append(dlg);
 let idx=0,upright=false,lastFocus=null;
 const render=()=>{const s=appState.drawnSlots[idx];if(!s)return;const c=s.card,p=SPREADS[appState.spread].positions[idx];
  const img=document.getElementById('cv-img');img.src=DECK_IMAGES[selectedDeck][c.id];img.alt=c.nameKo+(s.isReversed?' (역방향)':'');img.classList.toggle('is-reversed',s.isReversed&&!upright);
  document.getElementById('cv-pos').textContent=`${idx+1}. ${p.title}`;document.getElementById('cv-title').textContent=c.nameKo;document.getElementById('cv-en').textContent=c.nameEn;
  document.getElementById('cv-dir').textContent=s.isReversed?'역방향으로 나온 카드예요':'정방향으로 나온 카드예요';document.getElementById('cv-dir').className='cv-dir '+(s.isReversed?'rev':'up');
  document.getElementById('cv-kw').textContent=(s.isReversed?c.keywordsRev:c.keywordsUp).map(k=>'#'+k).join('  ');
  document.getElementById('cv-note').textContent=c.symbolNote||'';
  const rot=document.getElementById('cv-rot');rot.hidden=!s.isReversed;rot.textContent=upright?'역방향으로 보기':'바로 놓고 보기';
  const n=appState.drawnSlots.length;document.getElementById('cv-prev').disabled=n<2;document.getElementById('cv-next').disabled=n<2;};
 window.openCardViewer=function(i){if(!appState.drawnSlots[i]?.isFlipped)return;idx=i;upright=false;lastFocus=document.activeElement;render();dlg.hidden=false;document.body.classList.add('viewer-open');dlg.querySelector('.cv-close').focus();};
 const close=()=>{dlg.hidden=true;document.body.classList.remove('viewer-open');lastFocus?.focus?.({preventScroll:true});};
 dlg.addEventListener('click',e=>{if(e.target.closest('[data-close]'))close();});
 document.getElementById('cv-prev').onclick=()=>{const n=appState.drawnSlots.length;idx=(idx-1+n)%n;upright=false;render();};
 document.getElementById('cv-next').onclick=()=>{const n=appState.drawnSlots.length;idx=(idx+1)%n;upright=false;render();};
 document.getElementById('cv-rot').onclick=()=>{upright=!upright;render();};
 document.addEventListener('keydown',e=>{if(dlg.hidden)return;if(e.key==='Escape')close();else if(e.key==='ArrowRight')document.getElementById('cv-next').click();else if(e.key==='ArrowLeft')document.getElementById('cv-prev').click();
  else if(e.key==='Tab'){const f=[...dlg.querySelectorAll('button:not([hidden]):not(:disabled)')];if(!f.length)return;const a=f[0],z=f[f.length-1];if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus();}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus();}}});
 // A tap on an already-turned card on the table opens the large view.
 document.getElementById('spread-stage').addEventListener('click',e=>{const btn=e.target.closest('.tarot-card-btn');if(!btn)return;const i=[...document.querySelectorAll('#spread-stage .tarot-card-btn')].indexOf(btn);const s=appState.drawnSlots[i];if(s&&s.isFlipped&&btn.classList.contains('is-flipped')){e.stopPropagation();e.preventDefault();openCardViewer(i);}},true);
 // Hint under the table once cards are turned.
 const hint=document.createElement('p');hint.id='card-zoom-hint';hint.className='card-zoom-hint';hint.textContent='카드를 누르면 크게 볼 수 있어요.';document.getElementById('spread-stage').after(hint);
 // The chosen cards also sit at the top of the reading, tap to enlarge.
 const strip=document.createElement('div');strip.id='reading-cards';strip.className='reading-cards';strip.setAttribute('aria-label','고른 카드 (누르면 크게 보기)');
 document.querySelector('#reading-conversation .conversation-head')?.after(strip);
 const renderStrip=()=>{const all=allCardsFlipped();hint.hidden=!all;strip.hidden=!all;if(!all){strip.replaceChildren();return;}
  strip.innerHTML=appState.drawnSlots.map((s,i)=>{const p=SPREADS[appState.spread].positions[i];return `<button type="button" class="rc" data-i="${i}" aria-label="${escapeHtml(p.title)} ${escapeHtml(s.card.nameKo)}${s.isReversed?' 역방향':''} 크게 보기"><span class="rc-pos">${escapeHtml(p.title)}</span><img src="${DECK_IMAGES[selectedDeck][s.card.id]}" alt="" class="${s.isReversed?'is-reversed':''}"><span class="rc-name">${escapeHtml(s.card.nameKo)}${s.isReversed?' · 역':''}</span></button>`;}).join('');};
 strip.addEventListener('click',e=>{const b=e.target.closest('.rc');if(b)openCardViewer(Number(b.dataset.i));});
 const baseUpd=window.updateTableControls;window.updateTableControls=function(...a){const r=baseUpd.apply(this,a);renderStrip();return r;};
 const baseDeck=window.selectImageDeck;window.selectImageDeck=function(...a){const r=baseDeck.apply(this,a);renderStrip();if(!dlg.hidden)render();return r;};
 renderStrip();
});
