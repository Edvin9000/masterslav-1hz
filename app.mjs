import {initial,transition,signals} from './model.mjs';
import {makeClock} from './clock.mjs';
import {circuitMarkup} from './diagram.mjs?v=tabs-1';
const $=id=>document.getElementById(id),ns='http://www.w3.org/2000/svg';
let state=initial(),history=[],step=0,automatic=false;
let mode=location.hash==='#master-slave'?'master':'latch';
const sessions={};
const clockDriver=makeClock(()=>act({clk:1-state.clk}));
function el(tag,attrs={},label){const n=document.createElementNS(ns,tag);for(const[k,v]of Object.entries(attrs))n.setAttribute(k,v);if(label!==undefined)n.textContent=label;return n;}
const svg=$('circuit');
svg.innerHTML=circuitMarkup(mode==='latch');
const HL=v=>v==='X'?'X':v?'H':'L';
function record(){history.push({step:step++,...signals(state)});if(history.length>24)history.shift();}
function act(changes){state=transition(state,changes);record();render();}
function render(){const s=signals(state);$('data').setAttribute('aria-pressed',!!s.d);$('data').querySelector('strong').textContent=`D = ${HL(s.d)}`;$('clock').setAttribute('aria-pressed',!!s.clk);$('clock').querySelector('strong').textContent=`${mode==='latch'?'E':'CLK'} = ${HL(s.clk)}`;
svg.querySelectorAll('[data-signal]').forEach(n=>{const v=s[n.dataset.signal];n.setAttribute('data-v',v);if(n.classList.contains('signal-value'))n.textContent=HL(v);});
svg.querySelectorAll('[data-group="memoryM"]').forEach(n=>n.classList.toggle('forbidden',s.sm===0&&s.rm===0));svg.querySelectorAll('[data-group="memoryS"]').forEach(n=>n.classList.toggle('forbidden',s.ss===0&&s.rs===0));
$('masterState').textContent=s.clk?'Öppen · Qm följer D':'Stängd · håller';
$('slaveState').textContent=s.clk?'Stängd · håller':'Öppen · läser master';
document.querySelector('.explanation').className='explanation';
$('status').textContent=s.clk?'Master läser in data':'Slave visar det lagrade värdet';
$('detail').textContent=s.clk?`CLK är H: Qm följer D (${HL(s.d)}). Slave är stängd och håller Qs = ${HL(s.qs)}. Prova att växla D nu och sänk sedan CLK för att överföra värdet.`:`CLK är L: master håller Qm = ${HL(s.qm)} och slave visar Qs = ${HL(s.qs)}. Ändringar av D påverkar inte de lagrade utgångarna i den här fasen. Qs kan uppdateras vid nästa fallande klockflank.`;
document.querySelectorAll('#phaseTable tbody tr').forEach(row=>{
const selected=Number(row.dataset.clk)===s.clk&&Number(row.dataset.d)===s.d;
row.classList.toggle('selected',selected);
if(selected)row.setAttribute('aria-current','true');else row.removeAttribute('aria-current');
});
if(mode==='latch'){
$('status').textContent=s.clk?'Latchen är öppen · Q följer D':'Latchen är stängd · håller';
$('detail').textContent=s.clk?`E är H: Q följer D (${HL(s.d)}). Ändra D medan E är H och se Q ändras direkt.`:`E är L: Q håller ${HL(s.qm)}. Ändringar av D påverkar inte Q förrän E blir H igen.`;
}
document.querySelectorAll('#latchTable tbody tr').forEach(row=>{
const selected=Number(row.dataset.e)===s.clk&&Number(row.dataset.d)===s.d;
row.classList.toggle('selected',selected);
if(selected)row.setAttribute('aria-current','true');else row.removeAttribute('aria-current');
});
drawHistory();}
function drawHistory(){let t=$('timing'),w=Math.max(300,t.clientWidth),h=180;t.replaceChildren();t.setAttribute('viewBox',`0 0 ${w} ${h}`);const left=65,right=w-20,slot=(right-left)/24;const names=mode==='latch'?[['D','d'],['E','clk'],['Q','qm']]:[['D','d'],['CLK','clk'],['Qm','qm'],['Qs','qs']];const colors={1:'#ff3b30',0:'#8497ad',X:'#ffc471'};
for(let j=0;j<names.length;j++){let y=12+j*36;t.append(el('text',{x:0,y:y+12,fill:'#b7cad8','font-size':14},names[j][0]));t.append(el('line',{x1:left,y1:y+18,x2:right,y2:y+18,stroke:'#24394b'}));history.forEach((entry,i)=>{let v=entry[names[j][1]],x=left+i*slot,yy=y+(v==='X'?9:v?0:18);t.append(el('line',{x1:x,y1:yy,x2:x+slot,y2:yy,stroke:colors[v],'stroke-width':2.5,...(v==='X'?{'stroke-dasharray':'4 3'}:{})}));if(i>0){let pv=history[i-1][names[j][1]],py=y+(pv==='X'?9:pv?0:18);if(pv!=='X'&&v!=='X'&&pv!==v)t.append(el('line',{x1:x,y1:py,x2:x,y2:yy,stroke:colors[v],'stroke-width':2}));}if(v==='X'&&slot>25)t.append(el('text',{x:x+slot/2,y:y+5,fill:colors.X,'font-size':11,'text-anchor':'middle'},'X'));});}
const labelEvery=w<550?6:3;history.forEach((e,i)=>{if(i%labelEvery===0)t.append(el('text',{x:left+(i+.5)*slot,y:174,fill:'#a3b6c7','font-size':12,'text-anchor':'middle'},e.step));});t.append(el('text',{x:0,y:174,fill:'#a3b6c7','font-size':12},'Steg'));}
function stop(){clockDriver.stop();automatic=false;buttonLabel('auto','▶ Automatisk klocka · 1 Hz','A');$('auto').setAttribute('aria-pressed','false');$('clock').disabled=false;$('cycle').disabled=false;}
function init(){stop();state=initial();history=[];step=0;record();render();}
$('data').onclick=()=>act({d:1-state.d});$('clock').onclick=()=>act({clk:1-state.clk});$('init').onclick=init;
$('auto').onclick=()=>{if(automatic){stop();return;}stop();automatic=true;buttonLabel('auto','Ⅱ Pausa klockan · 1 Hz','A');$('auto').setAttribute('aria-pressed','true');$('clock').disabled=true;$('cycle').disabled=true;clockDriver.start();};
$('cycle').onclick=()=>{if(clockDriver.running)return;$('clock').disabled=true;$('cycle').disabled=true;clockDriver.start(2,stop);};
$('full').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{$('fullscreenError').textContent='Helskärm stöds inte här. Öppna presentationen i ett eget webbläsarfönster.';}};
document.addEventListener('fullscreenchange',()=>{buttonLabel('full',document.fullscreenElement?'Lämna helskärm ↙':'Helskärm ↗','F');$('full').setAttribute('aria-label',document.fullscreenElement?'Lämna helskärm':'Visa i helskärm');});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});new ResizeObserver(drawHistory).observe($('timing'));
configureMode();
init();
// Optional agent interface: the presentation works without this browser API.
if(document.modelContext?.registerTool){
const lifecycle=new AbortController();
const register=tool=>{try{Promise.resolve(document.modelContext.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}};
register({name:'inspect_circuit',description:'Read D, CLK, latch outputs and possible output pairs.',annotations:{readOnlyHint:true,untrustedContentHint:false},inputSchema:{type:'object',properties:{},additionalProperties:false},execute:async()=>({signals:signals(state),masterPossiblePairs:state.master,slavePossiblePairs:state.slave})});
register({name:'set_circuit_inputs',description:'Pause automatic clocking and set explicit binary D and CLK inputs in this teaching demonstration.',annotations:{readOnlyHint:false,untrustedContentHint:false},inputSchema:{type:'object',properties:{d:{type:'integer',enum:[0,1]},clk:{type:'integer',enum:[0,1]}},required:['d','clk'],additionalProperties:false},execute:async args=>{if(!args||![0,1].includes(args.d)||![0,1].includes(args.clk)||Object.keys(args).some(k=>!['d','clk'].includes(k)))throw Error('D and CLK must be 0 or 1');stop();act({d:args.d,clk:args.clk});return signals(state);}});
window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
}

function buttonLabel(id,label,key) {
  $(id).innerHTML=`${label} <kbd>${key}</kbd>`;
}

// Fractional heights survive mode/viewport changes, but never exceed natural size.
function setupResizablePanels() {
  const panels=[['topPanel','toggleTop','T',1,.45],['bottomPanel','toggleBottom','B',-1,.32]].map(([id,toggleId,key,direction,viewportCap])=>({
    root:$(id),toggle:$(toggleId),key,direction,viewportCap,fraction:1,max:0,
    body:$(id).querySelector('.panel-body'),content:$(id).querySelector('.panel-content'),
    handle:$(id).querySelector('.drag-handle')
  }));
  function apply(panel) {
    const height=Math.round(panel.max*panel.fraction);
    panel.body.style.height=`${height}px`;
    panel.body.inert=height===0;
    panel.body.setAttribute('aria-hidden',height===0?'true':'false');
    panel.handle.setAttribute('aria-valuenow',Math.round(panel.fraction*100));
    panel.toggle.setAttribute('aria-expanded',height>0);
    buttonLabel(panel.toggle.id,height===0?'Visa':'Dölj',panel.key);
    const cssName=panel.direction===1?'--top-panel-height':'--bottom-panel-height';
    document.documentElement.style.setProperty(cssName,`${panel.root.getBoundingClientRect().height}px`);
  }
  function measure() {
    for(const panel of panels) {
      panel.max=Math.min(panel.content.getBoundingClientRect().height,window.innerHeight*panel.viewportCap);
      apply(panel);
    }
  }
  for(const panel of panels) {
    let drag=null;
    panel.toggle.onclick=()=>{panel.fraction=panel.fraction===0?1:0;apply(panel);};
    panel.handle.onpointerdown=event=>{
      if(event.button!==0)return;
      event.preventDefault();
      drag={y:event.clientY,height:panel.max*panel.fraction};
      panel.handle.setPointerCapture(event.pointerId);
    };
    panel.handle.onpointermove=event=>{
      if(!drag)return;
      const height=drag.height+(event.clientY-drag.y)*panel.direction;
      panel.fraction=Math.max(0,Math.min(1,height/Math.max(1,panel.max)));
      apply(panel);
    };
    panel.handle.onpointerup=panel.handle.onpointercancel=panel.handle.onlostpointercapture=()=>{drag=null;};
    // Standard keyboard behavior only when the separator itself is focused.
    panel.handle.onkeydown=event=>{
      if(!['ArrowUp','ArrowDown'].includes(event.key))return;
      event.preventDefault();
      panel.fraction=Math.max(0,Math.min(1,panel.fraction+(event.key==='ArrowDown'?1:-1)*panel.direction*.1));
      apply(panel);
    };
    new ResizeObserver(measure).observe(panel.content);
  }
  window.addEventListener('resize',measure);
  measure();
}

setupResizablePanels();
document.addEventListener('keydown',event=>{
  if(event.repeat||event.ctrlKey||event.metaKey||event.altKey||event.isComposing)return;
  const target=event.target;
  if(target?.isContentEditable||target?.closest?.('textarea,select,input'))return;
  const controls={d:'data',...(mode==='latch'?{e:'clock'}:{c:'clock',s:'cycle',a:'auto'}),r:'init',f:'full',t:'toggleTop',b:'toggleBottom','1':'tabLatch','2':'tabMaster'};
  const control=$(controls[event.key.toLowerCase()]);
  if(!control||control.disabled||control.hidden)return;
  event.preventDefault();
  control.click();
});

function configureMode(){
const single=mode==='latch';
document.body.classList.toggle('latch-mode',single);
$('tabLatch').setAttribute('aria-current',single?'page':'false');
$('tabMaster').setAttribute('aria-current',single?'false':'page');
$('pageTitle').textContent=single?'Gated D-latch':'Masterslav D-vippa';
$('subtitle').textContent=single?'4 NAND · nivåstyrd':'1 Hz · fallande klockflank';
$('circuitTitle').textContent=single?'Gated D-latch · 4 NAND':'Master–slave · 8 NAND + klockinverterare';
$('clock').setAttribute('aria-keyshortcuts',single?'E':'C');
$('clock').querySelector('kbd').textContent=single?'E':'C';
document.querySelector('.playback').hidden=single;
$('auto').hidden=single;$('cycle').hidden=single;
$('phases').hidden=single;
$('masterTables').hidden=single;$('masterNotes').hidden=single;
$('latchTable').hidden=!single;$('latchNotes').hidden=!single;
svg.setAttribute('viewBox',single?'0 0 640 480':'0 0 1280 480');
svg.setAttribute('aria-label',single?'Gated D-latch med fyra NAND-grindar. D är data, E är enable och Q är lagrad utgång.':'Master–slave med åtta NAND-grindar och klockinverterare.');
svg.innerHTML=circuitMarkup(single);
$('timing').setAttribute('aria-label',single?'Stegdiagram för D, E och Q':'Stegdiagram för D, CLK, Qm och Qs');
}
function switchMode(next){
if(next===mode)return;
stop();sessions[mode]={state,history,step};
mode=next;
const saved=sessions[mode];
state=saved?.state??initial();history=saved?.history??[];step=saved?.step??0;
configureMode();if(!history.length)record();render();
window.history.replaceState(null,'',mode==='latch'?'#d-latch':'#master-slave');
}
$('tabLatch').onclick=()=>switchMode('latch');
$('tabMaster').onclick=()=>switchMode('master');
