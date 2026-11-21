// Lay all 78 cards out on screen at once: several overlapping fan-shaped rows that fit the cloth width.
function layoutDeckRows(){
 const fan=document.getElementById('deck-fan'),cloth=fan?.parentElement;if(!fan||!cloth)return;
 if(!deckOpen){fan.classList.remove('rows-spread');fan.style.removeProperty('--rows-h');return;}
 const cards=[...fan.querySelectorAll('.fan-card')],n=cards.length;if(!n)return;
 fan.classList.add('rows-spread');
 const pad=16,full=Math.max(200,cloth.clientWidth-pad*2),mobile=full<560;
 const cw=mobile?Math.min(54,Math.round(full/5.8)):Math.min(82,Math.round(full/10.5)),ch=Math.round(cw*1.64);
 // Gather each row toward the centre: a true radial fan around a pivot below the row.
 const fanW=Math.round(full*(mobile?0.9:0.8)),maxAngle=(mobile?22:26)*Math.PI/180;
 const minStep=mobile?18:26;let rows=2,cols;
 for(rows=2;rows<=12;rows++){cols=Math.ceil(n/rows);if((fanW-cw)/(cols-1)>=minStep)break;}
 const R=(fanW-cw)/2/Math.sin(maxAngle),sag=R*(1-Math.cos(maxAngle));
 const rowGap=Math.round(ch*(mobile?0.5:0.46)+sag*0.55),cx=pad+full/2;
 cards.forEach((c,i)=>{const r=Math.floor(i/cols),k=i%cols,inRow=Math.min(cols,n-r*cols);
  const span=maxAngle*(inRow-1)/(cols-1||1),a=inRow>1?-span+2*span*k/(inRow-1):0;
  const x=cx+R*Math.sin(a)-cw/2,y=pad+r*rowGap+R*(1-Math.cos(a));
  c.style.setProperty('--rx',x.toFixed(1)+'px');c.style.setProperty('--ry',y.toFixed(1)+'px');c.style.setProperty('--rr',(a*180/Math.PI).toFixed(2)+'deg');c.style.setProperty('--rw',cw+'px');c.style.setProperty('--rh',ch+'px');c.style.setProperty('--rz',String(r*100+k));});
 const curve=Math.round(sag);
 fan.style.setProperty('--rows-h',(pad*2+(rows-1)*rowGap+ch+curve+Math.round(cw*0.25))+'px');
}
document.addEventListener('DOMContentLoaded',()=>{
 const base=window.renderPhysicalDeck;window.renderPhysicalDeck=function(...a){const r=base.apply(this,a);layoutDeckRows();return r;};
 let t=0;window.addEventListener('resize',()=>{clearTimeout(t);t=setTimeout(layoutDeckRows,120);});
 layoutDeckRows();
});
