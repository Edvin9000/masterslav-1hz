export const CLOCK_HZ=1;
export const HALF_PERIOD_MS=1000/(2*CLOCK_HZ);
// Absolute deadlines avoid cumulative timer drift. Browsers are not real-time hardware.
export function makeClock(onEdge,{now=()=>performance.now(),schedule=(fn,ms)=>setTimeout(fn,ms),cancel=id=>clearTimeout(id)}={}) {
  let id=null,running=false,deadline=0,remaining=0,done=()=>{};
  function stop(){if(id!==null)cancel(id);id=null;running=false;}
  function tick(){if(!running)return;onEdge();remaining--;if(remaining===0){stop();done();return;}deadline+=HALF_PERIOD_MS;
    if(deadline<now())deadline=now()+HALF_PERIOD_MS;
    id=schedule(tick,Math.max(0,deadline-now()));}
  function start(edges=Infinity,onDone=()=>{}){stop();remaining=edges;done=onDone;running=true;deadline=now()+HALF_PERIOD_MS;id=schedule(tick,HALF_PERIOD_MS);}
  return {start,stop,get running(){return running;}};
}
