// Lay all 78 cards out on screen at once: several overlapping fan-shaped rows that fit the cloth width.
function layoutDeckRows(){
 const fan=document.getElementById('deck-fan'),cloth=fan?.parentElement;if(!fan||!cloth)return;
 if(!deckOpen){fan.classList.remove('rows-spread');fan.style.removeProperty('--rows-h');return;}
 const cards=[...fan.querySelectorAll('.fan-card')],n=cards.length;if(!n)return;
 fan.classList.add('rows-spread');
 const pad=16,full=Math.max(200,cloth.clientWidth-pad*2),mobile=full<560;
 const cw=mobile?Math.min(54,Math.round(full/5.8)):Math.min(82,Math.round(full/10.5)),ch=Math.round(cw*1.64);
 const side=Math.round(cw*0.35),W=full-side*2; // room for the tilted edge cards
 const maxAngle=mobile?16:20,curve=Math.round(ch*(mobile?0.16:0.2));
 const minStep=mobile?20:30;let rows=2,cols,step;
 for(rows=2;rows<=12;rows++){cols=Math.ceil(n/rows);step=(W-cw)/(cols-1);if(step>=minStep)break;}
 const rowGap=Math.round(ch*(mobile?0.6:0.56));
 cards.forEach((c,i)=>{const r=Math.floor(i/cols),k=i%cols,inRow=Math.min(cols,n-r*cols),rowStep=inRow>1?Math.min(step,(W-cw)/(inRow-1)):0,rowW=cw+rowStep*(inRow-1),x=pad+side+(W-rowW)/2+k*rowStep;
  const t=inRow>1?k/(inRow-1)*2-1:0,spread=rowW/W; // -1..1 across the row; shorter rows fan less
  const angle=t*maxAngle*spread,y=pad+r*rowGap+curve*spread*t*t;
  c.style.setProperty('--rx',x.toFixed(1)+'px');c.style.setProperty('--ry',y.toFixed(1)+'px');c.style.setProperty('--rr',angle.toFixed(2)+'deg');c.style.setProperty('--rw',cw+'px');c.style.setProperty('--rh',ch+'px');c.style.setProperty('--rz',String(r*100+k));});
 fan.style.setProperty('--rows-h',(pad*2+(rows-1)*rowGap+ch+curve+Math.round(cw*0.25))+'px');
}
document.addEventListener('DOMContentLoaded',()=>{
 const base=window.renderPhysicalDeck;window.renderPhysicalDeck=function(...a){const r=base.apply(this,a);layoutDeckRows();return r;};
 let t=0;window.addEventListener('resize',()=>{clearTimeout(t);t=setTimeout(layoutDeckRows,120);});
 layoutDeckRows();
});
