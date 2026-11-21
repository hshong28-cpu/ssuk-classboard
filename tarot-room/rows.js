// Lay all 78 cards out on screen at once: several overlapping rows that fit the cloth width.
function layoutDeckRows(){
 const fan=document.getElementById('deck-fan'),cloth=fan?.parentElement;if(!fan||!cloth)return;
 if(!deckOpen){fan.classList.remove('rows-spread');fan.style.removeProperty('--rows-h');return;}
 const cards=[...fan.querySelectorAll('.fan-card')],n=cards.length;if(!n)return;
 fan.classList.add('rows-spread');
 const pad=16,W=Math.max(200,cloth.clientWidth-pad*2),mobile=W<560;
 const cw=mobile?Math.min(56,Math.round(W/5.5)):Math.min(84,Math.round(W/10)),ch=Math.round(cw*1.64);
 const minStep=mobile?20:30;let rows=2,cols,step;
 for(rows=2;rows<=12;rows++){cols=Math.ceil(n/rows);step=(W-cw)/(cols-1);if(step>=minStep)break;}
 const rowGap=Math.round(ch*(mobile?0.62:0.58));
 cards.forEach((c,i)=>{const r=Math.floor(i/cols),k=i%cols,inRow=Math.min(cols,n-r*cols),rowStep=inRow>1?Math.min(step,(W-cw)/(inRow-1)):0,rowW=cw+rowStep*(inRow-1),x=pad+(W-rowW)/2+k*rowStep,y=pad+r*rowGap;
  c.style.setProperty('--rx',x.toFixed(1)+'px');c.style.setProperty('--ry',y+'px');c.style.setProperty('--rw',cw+'px');c.style.setProperty('--rh',ch+'px');c.style.setProperty('--rz',String(r*100+k));});
 fan.style.setProperty('--rows-h',(pad*2+(rows-1)*rowGap+ch+6)+'px');
}
document.addEventListener('DOMContentLoaded',()=>{
 const base=window.renderPhysicalDeck;window.renderPhysicalDeck=function(...a){const r=base.apply(this,a);layoutDeckRows();return r;};
 let t=0;window.addEventListener('resize',()=>{clearTimeout(t);t=setTimeout(layoutDeckRows,120);});
 layoutDeckRows();
});
