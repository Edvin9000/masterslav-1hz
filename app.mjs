import {initial,transition,signals} from './model.mjs';
import {makeClock} from './clock.mjs';
import {circuitMarkup} from './diagram.mjs';
const $=id=>document.getElementById(id),ns='http://www.w3.org/2000/svg';
let state=initial(),history=[],step=0,automatic=false;
const clockDriver=makeClock(()=>act({clk:1-state.clk}));
function el(tag,attrs={},label){const n=document.createElementNS(ns,tag);for(const[k,v]of Object.entries(attrs))n.setAttribute(k,v);if(label!==undefined)n.textContent=label;return n;}
const svg=$('circuit');
svg.innerHTML=circuitMarkup();
const HL=v=>v==='X'?'X':v?'H':'L';
function record(){history.push({step:step++,...signals(state)});if(history.length>24)history.shift();}
function act(changes){state=transition(state,changes);record();render();}
function render(){const s=signals(state);$('data').setAttribute('aria-pressed',!!s.d);$('data').querySelector('strong').textContent=`D = ${HL(s.d)}`;$('data').querySelector('small').textContent=`Klicka för ${HL(1-s.d)}`;$('clock').setAttribute('aria-pressed',!!s.clk);$('clock').querySelector('strong').textContent=`CLK = ${HL(s.clk)}`;
svg.querySelectorAll('[data-signal]').forEach(n=>{const v=s[n.dataset.signal];n.setAttribute('data-v',v);if(n.classList.contains('signal-value'))n.textContent=HL(v);});
svg.querySelectorAll('[data-group="memoryM"]').forEach(n=>n.classList.toggle('forbidden',s.sm===0&&s.rm===0));svg.querySelectorAll('[data-group="memoryS"]').forEach(n=>n.classList.toggle('forbidden',s.ss===0&&s.rs===0));
$('masterState').textContent=s.clk?'Öppen · Qm följer D':'Stängd · håller';
$('slaveState').textContent=s.clk?'Stängd · håller':'Öppen · läser master';
document.querySelector('.explanation').className='explanation';
$('status').textContent=s.clk?'Master läser in data':'Slave visar det lagrade värdet';
$('detail').textContent=s.clk?`CLK är H: Qm följer D (${HL(s.d)}). Slave är stängd och håller Qs = ${HL(s.qs)}. Prova att växla D nu och sänk sedan CLK för att överföra värdet.`:`CLK är L: master håller Qm = ${HL(s.qm)} och slave visar Qs = ${HL(s.qs)}. Ändringar av D påverkar inte de lagrade utgångarna i den här fasen. Qs kan uppdateras vid nästa fallande klockflank.`;
drawHistory();}
function drawHistory(){let t=$('timing'),w=Math.max(300,t.clientWidth),h=180;t.replaceChildren();t.setAttribute('viewBox',`0 0 ${w} ${h}`);const left=65,right=w-20,slot=(right-left)/24;const names=[['D','d'],['CLK','clk'],['Qm','qm'],['Qs','qs']];const colors={1:'#56dded',0:'#8497ad',X:'#ffc471'};
for(let j=0;j<names.length;j++){let y=12+j*36;t.append(el('text',{x:0,y:y+12,fill:'#b7cad8','font-size':14},names[j][0]));t.append(el('line',{x1:left,y1:y+18,x2:right,y2:y+18,stroke:'#24394b'}));history.forEach((entry,i)=>{let v=entry[names[j][1]],x=left+i*slot,yy=y+(v==='X'?9:v?0:18);t.append(el('line',{x1:x,y1:yy,x2:x+slot,y2:yy,stroke:colors[v],'stroke-width':2.5,...(v==='X'?{'stroke-dasharray':'4 3'}:{})}));if(i>0){let pv=history[i-1][names[j][1]],py=y+(pv==='X'?9:pv?0:18);if(pv!=='X'&&v!=='X'&&pv!==v)t.append(el('line',{x1:x,y1:py,x2:x,y2:yy,stroke:colors[v],'stroke-width':2}));}if(v==='X'&&slot>25)t.append(el('text',{x:x+slot/2,y:y+5,fill:colors.X,'font-size':11,'text-anchor':'middle'},'X'));});}
const labelEvery=w<550?6:3;history.forEach((e,i)=>{if(i%labelEvery===0)t.append(el('text',{x:left+(i+.5)*slot,y:174,fill:'#a3b6c7','font-size':12,'text-anchor':'middle'},e.step));});t.append(el('text',{x:0,y:174,fill:'#a3b6c7','font-size':12},'Steg'));}
function stop(){clockDriver.stop();automatic=false;$('auto').textContent='▶ Automatisk klocka · 1 Hz';$('auto').setAttribute('aria-pressed','false');$('clock').disabled=false;$('cycle').disabled=false;}
function init(){stop();state=initial();history=[];step=0;record();render();}
$('data').onclick=()=>act({d:1-state.d});$('clock').onclick=()=>act({clk:1-state.clk});$('init').onclick=init;
$('auto').onclick=()=>{if(automatic){stop();return;}stop();automatic=true;$('auto').textContent='Ⅱ Pausa klockan · 1 Hz';$('auto').setAttribute('aria-pressed','true');$('clock').disabled=true;$('cycle').disabled=true;clockDriver.start();};
$('cycle').onclick=()=>{if(clockDriver.running)return;$('clock').disabled=true;$('cycle').disabled=true;clockDriver.start(2,stop);};
$('full').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{$('fullscreenError').textContent='Helskärm stöds inte här. Öppna presentationen i ett eget webbläsarfönster.';}};
document.addEventListener('fullscreenchange',()=>{$('full').textContent=document.fullscreenElement?'Lämna helskärm ↙':'Helskärm ↗';});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});new ResizeObserver(drawHistory).observe($('timing'));
init();
// Optional agent interface: the presentation works without this browser API.
if(document.modelContext?.registerTool){
const lifecycle=new AbortController();
const register=tool=>{try{Promise.resolve(document.modelContext.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}};
register({name:'inspect_circuit',description:'Read D, CLK, latch outputs and possible output pairs.',annotations:{readOnlyHint:true,untrustedContentHint:false},inputSchema:{type:'object',properties:{},additionalProperties:false},execute:async()=>({signals:signals(state),masterPossiblePairs:state.master,slavePossiblePairs:state.slave})});
register({name:'set_circuit_inputs',description:'Pause automatic clocking and set explicit binary D and CLK inputs in this teaching demonstration.',annotations:{readOnlyHint:false,untrustedContentHint:false},inputSchema:{type:'object',properties:{d:{type:'integer',enum:[0,1]},clk:{type:'integer',enum:[0,1]}},required:['d','clk'],additionalProperties:false},execute:async args=>{if(!args||![0,1].includes(args.d)||![0,1].includes(args.clk)||Object.keys(args).some(k=>!['d','clk'].includes(k)))throw Error('D and CLK must be 0 or 1');stop();act({d:args.d,clk:args.clk});return signals(state);}});
window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
}
