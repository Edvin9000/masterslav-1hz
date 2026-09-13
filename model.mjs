// Correlated possible output pairs, not arbitrary independent X values.
// Pair digits are Q and Qbar. Zero propagation delays; settled states only.
export const union = pairs => [...new Set(pairs)].sort();
export function latch(previous, sbar, rbar) {
  if (!sbar && !rbar) return ['11'];
  if (!sbar) return ['10'];
  if (!rbar) return ['01'];
  return union(previous.flatMap(p => p === '11' ? ['01','10'] : [p]));
}
export function initial() { return {d:0,clk:0,master:['01'],slave:['01']}; }
export function transition(state, changes) {
  const next={...state,...changes};
  const a=1-(next.d & next.clk),b=1-(a & next.clk);
  next.master=latch(state.master,a,b);
  const enable=1-next.clk;
  next.slave=union(next.master.flatMap(p=>{const ss=1-(+p[0]&enable),rs=1-(ss&enable);return latch(state.slave,ss,rs);}));
  return next;
}
export function bit(pairs, index) { const b=new Set(pairs.map(p=>+p[index])); return b.size===1?[...b][0]:'X'; }
export function nand(a,b) {if(a===0||b===0)return 1;if(a==='X'||b==='X')return 'X';return 1-(a&b);}
export function signals(s) {
  const qm=bit(s.master,0),qmb=bit(s.master,1),qs=bit(s.slave,0),qsb=bit(s.slave,1),clkb=1-s.clk;
  const sm=nand(s.d,s.clk),ss=nand(qm,clkb);
  return {d:s.d,clk:s.clk,clkb,sm,rm:nand(sm,s.clk),qm,qmb,ss,rs:nand(ss,clkb),qs,qsb};
}
