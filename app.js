const $=id=>document.getElementById(id);
let state={d:0,clk:0,qm:0,qs:0};
let history=[];let autoTimer=null;
function bit(v){return v?'H':'L'}
function nand(a,b){return !(a&&b)}
function sample(){history.push({...state});if(history.length>24)history.shift();drawTimeline()}
function evaluate(previousClk){
  if(state.clk===1){state.qm=state.d}
  if(previousClk===1&&state.clk===0){state.qs=state.qm}
  render();sample()
}
function render(){
  $('dText').textContent=bit(state.d);$('clkText').textContent=bit(state.clk);
  $('mD').textContent=bit(state.d);$('mClk').textContent=bit(state.clk);$('qM').textContent=bit(state.qm);
  $('invClk').textContent=bit(state.clk);$('notClk').textContent=bit(!state.clk);
  $('sIn').textContent=bit(state.qm);$('sEnable').textContent=bit(!state.clk);$('qS').textContent=bit(state.qs);
  const sm=nand(state.d,state.clk),rm=nand(!state.d,state.clk),ss=nand(state.qm,!state.clk),rs=nand(!state.qm,!state.clk);
  $('sM').textContent=bit(sm);$('rM').textContent=bit(rm);$('sS').textContent=bit(ss);$('rS').textContent=bit(rs);
  if(state.clk){$('masterState').textContent='Öppen · följer D';$('masterState').classList.add('active');$('slaveState').textContent='Stängd · håller';$('slaveState').classList.remove('active');$('summaryTitle').textContent='Master läser D';$('summaryText').textContent=`CLK är H: master följer D och har Qm = ${bit(state.qm)}. Slave håller sitt tidigare värde Qs = ${bit(state.qs)}.`}
  else{$('masterState').textContent='Stängd · håller';$('masterState').classList.remove('active');$('slaveState').textContent='Öppen · läser master';$('slaveState').classList.add('active');$('summaryTitle').textContent='Slave visar det lagrade värdet';$('summaryText').textContent=`CLK är L: master håller Qm = ${bit(state.qm)} och slave visar Qs = ${bit(state.qs)}. Nästa uppdatering av Qs sker vid en fallande klockflank.`}
}
function toggleClock(){const p=state.clk;state.clk=state.clk?0:1;evaluate(p)}
$('dataBtn').onclick=()=>{state.d=state.d?0:1;if(state.clk)state.qm=state.d;render();sample()};
$('clockBtn').onclick=toggleClock;
$('cycleBtn').onclick=async()=>{if(autoTimer)return; if(state.clk)toggleClock(); await new Promise(r=>setTimeout(r,250));toggleClock();await new Promise(r=>setTimeout(r,500));toggleClock()};
$('autoBtn').onclick=()=>{if(autoTimer){clearInterval(autoTimer);autoTimer=null;$('autoBtn').textContent='▶ Automatisk klocka · 1 Hz'}else{autoTimer=setInterval(toggleClock,500);$('autoBtn').textContent='■ Stoppa automatisk klocka'}};
$('resetBtn').onclick=()=>{state={d:0,clk:0,qm:0,qs:0};history=[];render();sample()};
$('fullscreenBtn').onclick=()=>{document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen?.()};
function drawTimeline(){
  const svg=$('timeline'),NS='http://www.w3.org/2000/svg';svg.innerHTML='';
  const W=Math.max(760,svg.clientWidth||760),H=270,left=62,right=18,top=24,rowH=54,plotW=W-left-right;
  svg.setAttribute('viewBox',`0 0 ${W} ${H}`);
  const rows=[['D','d'],['CLK','clk'],['Qm','qm'],['Qs','qs']];
  const text=(x,y,s,cls='')=>{const e=document.createElementNS(NS,'text');e.setAttribute('x',x);e.setAttribute('y',y);e.setAttribute('fill',cls===''?'#9eabc5':'#dbe6ff');e.setAttribute('font-size','12');e.setAttribute('font-family','system-ui,sans-serif');e.textContent=s;svg.appendChild(e)};
  rows.forEach((r,i)=>{const y=top+i*rowH;text(12,y+23,r[0],'label');const line=document.createElementNS(NS,'line');line.setAttribute('x1',left);line.setAttribute('x2',W-right);line.setAttribute('y1',y+25);line.setAttribute('y2',y+25);line.setAttribute('stroke','#243250');line.setAttribute('stroke-width','1');svg.appendChild(line)});
  if(history.length<1)return;
  const dx=history.length>1?plotW/(history.length-1):plotW;
  rows.forEach((r,i)=>{let d='';const base=top+i*rowH;history.forEach((s,j)=>{const x=left+j*dx,y=s[r[1]]?base+8:base+40;if(j===0)d+=`M ${x} ${y}`;else{const px=left+(j-1)*dx,py=history[j-1][r[1]]?base+8:base+40;d+=` L ${x} ${py} L ${x} ${y}`}});const p=document.createElementNS(NS,'path');p.setAttribute('d',d);p.setAttribute('fill','none');p.setAttribute('stroke',i===1?'#8bb1ff':'#7ee2a8');p.setAttribute('stroke-width','3');p.setAttribute('stroke-linejoin','round');svg.appendChild(p)});
  text(left,H-10,'Steg 0');text(W-right-50,H-10,String(history.length-1));
}
window.addEventListener('resize',drawTimeline);render();sample();
