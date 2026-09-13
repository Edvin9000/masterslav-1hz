import assert from 'node:assert/strict';
import {initial,transition,signals} from './model.mjs';
import {makeClock,CLOCK_HZ,HALF_PERIOD_MS} from './clock.mjs';
let s=initial();s=transition(s,{d:1});assert.equal(signals(s).qm,0);
s=transition(s,{clk:1});assert.equal(signals(s).qm,1);assert.equal(signals(s).qs,0);
s=transition(s,{d:0});assert.equal(signals(s).qm,0);assert.equal(signals(s).qs,0);
s=transition(s,{d:1});s=transition(s,{clk:0});assert.equal(signals(s).qs,1);
s=transition(s,{d:0});assert.equal(signals(s).qm,1);assert.equal(signals(s).qs,1);
s=transition(s,{clk:1});s=transition(s,{clk:0});assert.equal(signals(s).qs,0);
// Independent reference latch rules and stable gate equations over all input sequences.
let count=0;function walk(prev,n){if(!n)return;for(const d of [0,1])for(const clk of [0,1]){const next=transition(prev,{d,clk}),z=signals(next),old=signals(prev);assert.equal(z.qm,clk?d:old.qm);assert.equal(z.qs,clk?old.qs:z.qm);assert.equal(z.qmb,1-z.qm);assert.equal(z.qsb,1-z.qs);for(const [a,b,q,qb]of [[z.sm,z.rm,z.qm,z.qmb],[z.ss,z.rs,z.qs,z.qsb]]){assert.ok(a||b);assert.equal(q,1-(a&qb));assert.equal(qb,1-(b&q));}count++;walk(next,n-1);}}walk(initial(),5);
// Fake time verifies full 1 Hz periods, finite-cycle completion, and cancellation.
let time=0,seq=0,tasks=new Map(),edges=[],done=0;
const driver=makeClock(()=>edges.push(time),{now:()=>time,schedule:(fn,ms)=>{const id=++seq;tasks.set(id,{fn,t:time+ms});return id;},cancel:id=>tasks.delete(id)});
function advance(target){while(tasks.size){let [id,task]=[...tasks].sort((a,b)=>a[1].t-b[1].t)[0];if(task.t>target)break;tasks.delete(id);time=task.t;task.fn();}time=target;}
assert.equal(CLOCK_HZ,1);assert.equal(HALF_PERIOD_MS,500);driver.start();advance(2500);assert.deepEqual(edges,[500,1000,1500,2000,2500]);driver.stop();advance(3000);assert.equal(edges.length,5);
edges=[];driver.start(2,()=>done++);advance(4000);assert.deepEqual(edges,[3500,4000]);assert.equal(done,1);assert.equal(driver.running,false);advance(5000);assert.equal(edges.length,2);
console.log(`PASS: ${count} logic transitions, gate equations, complements, falling-edge storage, 500 ms half-periods and 1000 ms complete cycle.`);
