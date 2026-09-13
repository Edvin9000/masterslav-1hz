// Identical geometry for each four-NAND latch, translated by exactly 640 units.
export function circuitMarkup(){
  const out=[];
  const wire=(d,s)=>out.push(`<path d="${d}" class="wire" data-signal="${s}"/>`);
  const dot=(x,y,s)=>out.push(`<circle cx="${x}" cy="${y}" r="4" class="junction" data-signal="${s}"/>`);
  const text=(x,y,t,c='svg-label',anchor='start')=>out.push(`<text x="${x}" y="${y}" class="${c}" text-anchor="${anchor}">${t}</text>`);
  const value=(x,y,t,s)=>{text(x,y,t);out.push(`<text x="${x+(t==='¬CLK'?72:54)}" y="${y}" class="signal-value" data-signal="${s}"></text>`);};
  const gate=(x,y,id,group)=>out.push(`<g class="gate" data-group="${group}"><path d="M${x} ${y-32} H${x+38} C${x+82} ${y-32} ${x+82} ${y+32} ${x+38} ${y+32} H${x} Z" class="gate-shape"/><circle cx="${x+74}" cy="${y}" r="6" class="gate-shape"/><text x="${x+31}" y="${y+7}" class="gate-label"></text><text x="${x+34}" y="${y-48}" class="gate-id" text-anchor="middle">${id}</text></g>`);
  out.push('<path d="M640 62 V350" class="stage-divider"/>');
  for(const [dx,prefix,input,clock,s,r,q,qb]of [[0,'M','d','clk','sm','rm','qm','qmb'],[640,'S','qm','clkb','ss','rs','qs','qsb']]){
    out.push(`<g transform="translate(${dx} 0)" class="latch-stage">`);
    text(320,40,prefix==='M'?'MASTER':'SLAVE','section-label','middle');
    wire('M40 124 H140',input);
    wire('M100 420 V156 H140',clock);wire('M100 316 H140',clock);dot(100,316,clock);
    wire('M220 140 H280 V124 H360',s);wire('M220 300 H280 V316 H360',r);
    wire('M240 140 V220 H120 V284 H140',s);dot(240,140,s);
    wire('M440 140 H600',q);wire('M440 300 H480',qb);
    wire('M480 140 V190 L340 250 V284 H360',q);
    wire('M480 300 V250 L340 190 V156 H360',qb);
    dot(480,140,q);dot(480,300,qb);
    gate(140,140,prefix+'1','input'+prefix);gate(140,300,prefix+'2','input'+prefix);
    gate(360,140,prefix+'3','memory'+prefix);gate(360,300,prefix+'4','memory'+prefix);
    value(42,99,prefix==='M'?'D':'Qm',input);
    value(262,91,prefix==='M'?'S̅m':'S̅s',s);
    value(262,355,prefix==='M'?'R̅m':'R̅s',r);
    value(515,111,prefix==='M'?'Qm':'Qs',q);
    out.push('</g>');
  }
  wire('M600 140 H680 V124','qm');
  wire('M40 420 H610','clk');dot(100,420,'clk');
  out.push('<path d="M610 400 V440 L650 420 Z" class="gate-shape"/><circle cx="656" cy="420" r="6" class="gate-shape"/>');
  wire('M662 420 H1240','clkb');dot(740,420,'clkb');
  text(635,384,'NOT','gate-id','middle');
  value(275,455,'CLK','clk');value(909,455,'¬CLK','clkb');
  return out.join('');
}
