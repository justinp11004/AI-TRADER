/* ═══════════ CHART STUDIO PRO — interactive engine (Studio V4 lineage) ═══════════
   Pan · zoom · crosshair · drawing tools · AI structure overlay · and the
   ATLAS twist: the measure tool speaks R, and the position tool runs the
   SAME 5R gate as the packet pipeline. Charts remain deterministic; all
   drawings are session-state UI preferences, never authority. */

const CHARTPRO={
  tool:'cursor', drawings:{}, sel:null, pend:[], hover:null,
  view:{n:120,off:0}, ai:true, dragging:false, dragX:0, dragOff:0,
  list(){const k=S.sym;if(!this.drawings[k])this.drawings[k]=[];return this.drawings[k]},
};
const CPRO_TOOLS=[
 ['cursor','◇','Select / pan — click a drawing to select, drag chart to pan','ESC'],
 ['trend','╱','Trend line — two clicks','T'],
 ['hline','─','Horizontal level — one click','L'],
 ['zone','▭','Zone rectangle — two clicks (opposite corners)','Z'],
 ['fib','☰','Fibonacci retracement — two clicks (swing to swing); 70.5% A+ level gold','B'],
 ['measure','⇕','R-ruler — two clicks (entry → stop distance); reads in $, %, and R','R'],
 ['pos','◫','Position tool — THREE clicks: entry, stop, target. Runs the live 5R gate','P'],
 ['note','✎','Text note — one click, then type','X'],
];

function cproSeries(){
  const all=candles(S.sym,360);
  const eff=CHARTX.replay?Math.max(40,Math.floor(all.length*CHARTX.replayAt/100)):all.length;
  const out=all.slice(0,eff);out.live=all.live;return out;
}
function cproClampView(len){
  const v=CHARTPRO.view;
  v.n=U.clamp(v.n,30,360);
  v.off=U.clamp(v.off,0,Math.max(0,len-v.n));
}
/* deterministic AI structure: pivots + sweep + displacement + auto-fib */
function cproPivots(data){
  const out=[],w=6;
  for(let i=w;i<data.length-w;i++){
    const win=data.slice(i-w,i+w+1);
    if(data[i].h===Math.max(...win.map(c=>c.h)))out.push({i,p:data[i].h,hi:true});
    if(data[i].l===Math.min(...win.map(c=>c.l)))out.push({i,p:data[i].l,hi:false});
  }
  /* label swing grammar */
  let lastHi=null,lastLo=null;
  out.forEach(pv=>{
    if(pv.hi){pv.lbl=lastHi==null?'H':(pv.p>lastHi?'HH':'LH');lastHi=pv.p}
    else{pv.lbl=lastLo==null?'L':(pv.p>lastLo?'HL':'LL');lastLo=pv.p}
  });
  return out;
}

function cproDraw(){
  const cv=document.getElementById('cp-main');if(!cv)return;
  const W=cv.width=cv.clientWidth*2,H=cv.height=380*2,x=cv.getContext('2d');
  const s=symBy(S.sym),data=cproSeries();
  cproClampView(data.length);
  const v=CHARTPRO.view,i0=Math.max(0,data.length-v.n-v.off),i1=Math.min(data.length,i0+v.n);
  const win=data.slice(i0,i1);
  let lo=Math.min(...win.map(c=>c.l)),hi=Math.max(...win.map(c=>c.h));
  if(s&&s.levels&&s.levels.stop&&!CHARTX.replay){lo=Math.min(lo,s.levels.stop*0.998);hi=Math.max(hi,(s.levels.t2||hi)*1.002)}
  const pad=(hi-lo)*0.05;lo-=pad;hi+=pad;
  const AX=92,plotH=CHARTX.rsi?H*0.80:H*0.94,cw=(W-AX)/v.n;
  const p2y=p=>plotH-((p-lo)/(hi-lo))*(plotH*0.94)-plotH*0.02;
  const y2p=y=>lo+((plotH-plotH*0.02-y)/(plotH*0.94))*(hi-lo);
  const b2x=i=>(i-i0)*cw+cw/2, x2b=px=>U.clamp(Math.round(px/cw)+i0,0,data.length-1);
  cv._sc={p2y,y2p,b2x,x2b,i0,i1,AX,W,H,cw,plotH};
  x.fillStyle='#070B12';x.fillRect(0,0,W,H);
  /* killzone band — last fifth of visible window when inside a killzone */
  if(CLOCK.killzone()){const kx=(W-AX)*0.8;x.fillStyle='rgba(214,178,94,.045)';x.fillRect(kx,0,(W-AX)-kx,plotH);
    x.fillStyle='rgba(214,178,94,.5)';x.font='15px monospace';x.fillText(CLOCK.killzone(),kx+8,18)}
  /* grid + price axis */
  x.font='17px monospace';const step=(hi-lo)/6;
  for(let i=0;i<=6;i++){const p=lo+step*i,y=p2y(p);
    x.strokeStyle='rgba(151,166,192,.07)';x.beginPath();x.moveTo(0,y);x.lineTo(W-AX,y);x.stroke();
    x.fillStyle='#67748C';x.fillText(p.toFixed(p>1000?0:2),W-AX+8,y+6)}
  /* machine zones (FVG/OB) with hit-rects */
  cv._zones=[];
  if(CHARTX.zones&&s&&s.levels&&s.levels.entry){
    const zx=(W-AX)*0.55;
    const fy1=p2y(s.levels.entry*1.0005),fy2=p2y(s.levels.entry*0.997);
    x.fillStyle='rgba(90,167,255,.10)';x.fillRect(zx,fy1,(W-AX)-zx,fy2-fy1);
    x.fillStyle='rgba(90,167,255,.75)';x.font='15px monospace';x.fillText('FVG · DET-041 · click',zx+8,fy1-6);
    cv._zones.push({x:zx,y:fy1,w:(W-AX)-zx,h:fy2-fy1,id:'FVG'});
    const oy1=p2y(s.levels.stop*1.007),oy2=p2y(s.levels.stop*1.001);
    x.fillStyle='rgba(47,214,160,.10)';x.fillRect(zx*0.92,oy1,(W-AX)-zx*0.92,oy2-oy1);
    x.fillStyle='rgba(47,214,160,.75)';x.fillText('OB · DET-052 · click',zx*0.92+8,oy2+18);
    cv._zones.push({x:zx*0.92,y:oy1,w:(W-AX)-zx*0.92,h:oy2-oy1,id:'OB'});
  }
  /* candles + volume */
  win.forEach((c,j)=>{const X=j*cw,up=c.c>=c.o,col=up?'rgba(47,214,160,.9)':'rgba(242,99,124,.9)';
    x.strokeStyle=col;x.beginPath();x.moveTo(X+cw/2,p2y(c.h));x.lineTo(X+cw/2,p2y(c.l));x.stroke();
    x.fillStyle=col;const y1=p2y(Math.max(c.o,c.c)),y2=p2y(Math.min(c.o,c.c));
    x.fillRect(X+cw*0.16,y1,Math.max(2,cw*0.68),Math.max(2,y2-y1));
    x.fillStyle='rgba(90,167,255,.20)';x.fillRect(X+cw*0.16,plotH-c.v*plotH*0.055,Math.max(2,cw*0.68),c.v*plotH*0.055)});
  /* indicators on the visible window (computed on full series, sliced) */
  const ema=n2=>{const k2=2/(n2+1);let e=data[0].c;return data.map(c=>(e=c.c*k2+e*(1-k2)))};
  const lineOf=(arr,col,dash)=>{x.beginPath();for(let i=i0;i<i1;i++){const X=b2x(i),Y=p2y(arr[i]);i===i0?x.moveTo(X,Y):x.lineTo(X,Y)}x.strokeStyle=col;x.lineWidth=1.7;if(dash)x.setLineDash(dash);x.stroke();x.setLineDash([])};
  if(CHARTX.ema20)lineOf(ema(20),'rgba(231,182,83,.85)');
  if(CHARTX.ema50)lineOf(ema(50),'rgba(157,141,248,.85)');
  if(CHARTX.ema200)lineOf(ema(200),'rgba(242,99,124,.6)');
  if(CHARTX.vwap){let cum=0,cv3=0;const w2=data.map(c=>{const tp=(c.h+c.l+c.c)/3;cum+=tp*c.v;cv3+=c.v;return cum/cv3});lineOf(w2,'rgba(87,199,227,.75)',[3,4])}
  if(CHARTX.bb){const n2=20,k2=2;const sma=data.map((c,i)=>{const w3=data.slice(Math.max(0,i-n2+1),i+1);return w3.reduce((a2,c2)=>a2+c2.c,0)/w3.length});
    const sd=data.map((c,i)=>{const w3=data.slice(Math.max(0,i-n2+1),i+1);const m2=sma[i];return Math.sqrt(w3.reduce((a2,c2)=>a2+(c2.c-m2)**2,0)/w3.length)});
    lineOf(sma.map((m2,i)=>m2+k2*sd[i]),'rgba(157,141,248,.35)');lineOf(sma.map((m2,i)=>m2-k2*sd[i]),'rgba(157,141,248,.35)')}
  /* plan levels */
  if(s&&s.levels&&s.levels.entry){x.font='15px monospace';
    [['ENTRY',s.levels.entry,'#5AA7FF'],['STOP',s.levels.stop,'#FF4D5F'],['T1',s.levels.t1,'#2FD6A0'],['T2 · 5R',s.levels.t2,'#2FD6A0'],['T3',s.levels.t3,'#2FD6A0']].forEach(([nm,p,col])=>{
      if(!p)return;const y=p2y(p);if(y<0||y>plotH)return;
      x.strokeStyle=col;x.setLineDash([7,5]);x.beginPath();x.moveTo(0,y);x.lineTo(W-AX,y);x.stroke();x.setLineDash([]);
      x.fillStyle=col;x.fillText(nm+' '+p.toFixed(2),8,y-5)})}
  /* AI structure overlay */
  if(CHARTPRO.ai){
    const pvs=cproPivots(data).filter(pv=>pv.i>=i0&&pv.i<i1);
    x.font='14px monospace';
    pvs.forEach(pv=>{x.fillStyle=pv.hi?'rgba(242,99,124,.8)':'rgba(47,214,160,.8)';
      x.fillText(pv.lbl,b2x(pv.i)-10,p2y(pv.p)+(pv.hi?-8:16))});
    const swI=Math.floor(data.length*0.55);
    if(swI>=i0&&swI<i1){const sx=b2x(swI),sy=p2y(data[swI].l);
      x.strokeStyle='rgba(214,178,94,.9)';x.lineWidth=2;x.beginPath();x.arc(sx,sy+8,13,0,7);x.stroke();
      x.fillStyle='rgba(214,178,94,.9)';x.fillText('SWEEP',sx-22,sy+38);
      const dx=b2x(Math.min(swI+2,data.length-1));
      x.strokeStyle='rgba(47,214,160,.9)';x.beginPath();x.moveTo(dx,sy);x.lineTo(dx,sy-46);x.lineTo(dx-6,sy-36);x.moveTo(dx,sy-46);x.lineTo(dx+6,sy-36);x.stroke();
      x.fillStyle='rgba(47,214,160,.9)';x.fillText('DISPLACEMENT',dx+8,sy-30)}
    /* auto-fib of the last leg: post-sweep low → window high */
    const legLo=Math.min(...data.slice(swI).map(c=>c.l)),legHi=Math.max(...data.slice(swI).map(c=>c.h));
    [[0,'0'],[0.382,'38.2'],[0.5,'50'],[0.618,'61.8'],[0.705,'70.5 ◆A+'],[0.79,'79'],[1,'100']].forEach(([f,lb])=>{
      const p=legHi-(legHi-legLo)*f,y=p2y(p);if(y<0||y>plotH)return;
      const gold=lb.includes('◆');
      x.strokeStyle=gold?'rgba(214,178,94,.55)':'rgba(151,166,192,.16)';x.setLineDash([2,5]);
      x.beginPath();x.moveTo((W-AX)*0.66,y);x.lineTo(W-AX,y);x.stroke();x.setLineDash([]);
      x.fillStyle=gold?'rgba(214,178,94,.85)':'rgba(151,166,192,.45)';x.fillText(lb,(W-AX)*0.66-46,y+4)});
  }
  /* user drawings */
  const dr=CHARTPRO.list();
  const drawOne=(d,seld)=>{
    x.lineWidth=seld?2.6:1.8;
    const col=seld?'#E7B653':(d.col||'#5AA7FF');
    x.strokeStyle=col;x.fillStyle=col;x.font='14px monospace';
    if(d.t==='hline'){const y=p2y(d.p1.p);x.setLineDash([]);x.beginPath();x.moveTo(0,y);x.lineTo(W-AX,y);x.stroke();x.fillText(d.p1.p.toFixed(2),W-AX-70,y-5)}
    if(d.t==='trend'){x.beginPath();x.moveTo(b2x(d.p1.i),p2y(d.p1.p));x.lineTo(b2x(d.p2.i),p2y(d.p2.p));x.stroke()}
    if(d.t==='zone'){const x1=b2x(d.p1.i),x22=b2x(d.p2.i),y1=p2y(d.p1.p),y22=p2y(d.p2.p);
      x.fillStyle=(d.col||'#5AA7FF')+'22';x.fillRect(Math.min(x1,x22),Math.min(y1,y22),Math.abs(x22-x1),Math.abs(y22-y1));
      x.strokeRect(Math.min(x1,x22),Math.min(y1,y22),Math.abs(x22-x1),Math.abs(y22-y1))}
    if(d.t==='fib'){const pHi=Math.max(d.p1.p,d.p2.p),pLo=Math.min(d.p1.p,d.p2.p);
      [[0,'0'],[0.236,'23.6'],[0.382,'38.2'],[0.5,'50'],[0.618,'61.8'],[0.705,'70.5 ◆'],[0.79,'79'],[1,'100']].forEach(([f,lb])=>{
        const p=pHi-(pHi-pLo)*f,y=p2y(p);
        x.strokeStyle=lb.includes('◆')?'rgba(214,178,94,.8)':col+'88';x.beginPath();x.moveTo(b2x(Math.min(d.p1.i,d.p2.i)),y);x.lineTo(b2x(Math.max(d.p1.i,d.p2.i)),y);x.stroke();
        x.fillStyle=lb.includes('◆')?'rgba(214,178,94,.9)':col;x.fillText(lb+' · '+p.toFixed(2),b2x(Math.max(d.p1.i,d.p2.i))+6,y+4)})}
    if(d.t==='measure'){const x1=b2x(d.p1.i),x22=b2x(d.p2.i),y1=p2y(d.p1.p),y22=p2y(d.p2.p);
      const dp=d.p2.p-d.p1.p,pct=dp/d.p1.p*100,bars=Math.abs(d.p2.i-d.p1.i);
      x.setLineDash([5,4]);x.strokeRect(Math.min(x1,x22),Math.min(y1,y22),Math.abs(x22-x1),Math.abs(y22-y1));x.setLineDash([]);
      const rTxt=(s&&s.levels&&s.levels.entry&&s.levels.stop)?' · '+U.fmt(Math.abs(dp)/Math.abs(s.levels.entry-s.levels.stop),2)+'R (vs plan stop)':'';
      const lbl=(dp>=0?'+':'')+dp.toFixed(2)+' ('+pct.toFixed(2)+'%) · '+bars+' bars'+rTxt;
      x.fillStyle='#0C1220';const tw=x.measureText(lbl).width;x.fillRect(Math.min(x1,x22),Math.min(y1,y22)-24,tw+14,20);
      x.fillStyle=dp>=0?'#2FD6A0':'#F2637C';x.fillText(lbl,Math.min(x1,x22)+7,Math.min(y1,y22)-9)}
    if(d.t==='pos'){const e=d.p1.p,st=d.p2.p,tg=d.p3.p;const x1=b2x(d.p1.i),x22=Math.min(b2x(d.p1.i)+cw*26,W-AX);
      const rr=Math.abs(tg-e)/Math.abs(e-st)*(((tg>e)===(e>st))?1:1);
      x.fillStyle='rgba(242,99,124,.14)';x.fillRect(x1,Math.min(p2y(e),p2y(st)),x22-x1,Math.abs(p2y(st)-p2y(e)));
      x.fillStyle='rgba(47,214,160,.14)';x.fillRect(x1,Math.min(p2y(e),p2y(tg)),x22-x1,Math.abs(p2y(tg)-p2y(e)));
      x.strokeStyle='#5AA7FF';x.beginPath();x.moveTo(x1,p2y(e));x.lineTo(x22,p2y(e));x.stroke();
      const pass=rr>=ck('risk.min_rr');
      x.fillStyle='#0C1220';x.fillRect(x1+4,p2y(e)-26,236,20);
      x.fillStyle=pass?'#2FD6A0':'#FF4D5F';
      x.fillText(U.fmt(rr,2)+'R '+(pass?'✓ ≥ '+ck('risk.min_rr')+'R — gate would PASS':'✗ SUB-'+ck('risk.min_rr')+'R — gate would BLOCK'),x1+10,p2y(e)-11)}
    if(d.t==='note'){x.fillText('✎ '+d.txt,b2x(d.p1.i),p2y(d.p1.p))}
  };
  dr.forEach((d,idx)=>drawOne(d,idx===CHARTPRO.sel));
  /* pending placement preview */
  if(CHARTPRO.pend.length&&CHARTPRO.hover){
    const ph={t:CHARTPRO.tool,p1:CHARTPRO.pend[0],p2:CHARTPRO.pend[1]||CHARTPRO.hover,p3:CHARTPRO.hover,col:'#9D8DF8'};
    if(CHARTPRO.tool==='pos'&&CHARTPRO.pend.length===1)ph.t='measure';
    if(CHARTPRO.tool==='pos'&&CHARTPRO.pend.length===2){ph.p1=CHARTPRO.pend[0];ph.p2=CHARTPRO.pend[1];ph.p3=CHARTPRO.hover}
    drawOne(ph,false);
  }
  /* RSI pane */
  if(CHARTX.rsi){const per=14;let g=0,l2=0;const rsi=data.map((c,i)=>{if(!i)return 50;const ch2=c.c-data[i-1].c;g=(g*(per-1)+Math.max(ch2,0))/per;l2=(l2*(per-1)+Math.max(-ch2,0))/per;return l2===0?100:100-100/(1+g/l2)});
    const y0=plotH+8,hh=H-y0-6;x.fillStyle='rgba(12,18,32,.9)';x.fillRect(0,y0,W-AX,hh);
    [30,70].forEach(lv=>{const Y=y0+hh-(lv/100)*hh;x.strokeStyle='rgba(151,166,192,.2)';x.setLineDash([3,4]);x.beginPath();x.moveTo(0,Y);x.lineTo(W-AX,Y);x.stroke();x.setLineDash([])});
    x.beginPath();for(let i=i0;i<i1;i++){const X=b2x(i),Y=y0+hh-(rsi[i]/100)*hh;i===i0?x.moveTo(X,Y):x.lineTo(X,Y)}
    x.strokeStyle='rgba(231,182,83,.85)';x.lineWidth=1.6;x.stroke();
    x.fillStyle='#67748C';x.font='14px monospace';x.fillText('RSI(14) '+rsi[i1-1].toFixed(0),8,y0+16)}
  /* crosshair */
  if(CHARTPRO.hover&&CHARTPRO.hover.px!=null){
    const hx=CHARTPRO.hover.px,hy=CHARTPRO.hover.py;
    x.strokeStyle='rgba(151,166,192,.3)';x.setLineDash([3,4]);
    x.beginPath();x.moveTo(hx,0);x.lineTo(hx,plotH);x.stroke();
    x.beginPath();x.moveTo(0,hy);x.lineTo(W-AX,hy);x.stroke();x.setLineDash([]);
    const p=y2p(hy);x.fillStyle='#1A2438';x.fillRect(W-AX+2,hy-11,AX-4,22);
    x.fillStyle='#E9EEF6';x.font='16px monospace';x.fillText(p.toFixed(2),W-AX+8,hy+5);
  }
  if(CHARTX.replay){x.fillStyle='rgba(214,178,94,.9)';x.font='17px monospace';x.fillText('REPLAY · '+data.length+'/360 bars · no future leakage',10,plotH-10)}
  /* OHLC header */
  const hb=CHARTPRO.hover&&CHARTPRO.hover.bar!=null?data[CHARTPRO.hover.bar]:win[win.length-1];
  const el=document.getElementById('cp-ohlc');
  if(el&&hb){const chg=(hb.c-hb.o)/hb.o*100;
    el.innerHTML='<b>'+S.sym+'</b> <span class="i2">'+CHARTX.tf+'</span><span class="ohlc"><span>O <b class="mono">'+hb.o.toFixed(2)+'</b></span><span>H <b class="mono">'+hb.h.toFixed(2)+'</b></span><span>L <b class="mono">'+hb.l.toFixed(2)+'</b></span><span>C <b class="mono '+(chg>=0?'up':'dn')+'">'+hb.c.toFixed(2)+' ('+U.pct(chg)+')</b></span></span>'+
    '<span class="i2">bid×ask <span class="mono">'+(s.px*0.9998).toFixed(2)+' × '+(s.px*1.0002).toFixed(2)+'</span></span>'+
    '<span class="i2">bars '+(i0+1)+'–'+i1+' of '+data.length+' · wheel zoom · drag pan</span>'+
    (data.live
      ?(data.live.synthetic?'<span class="tag" style="color:var(--warn)">◈ SIM FEED (server) · no live claim</span>':'<span class="tag" style="color:var(--pos)">● LIVE OHLC · '+U.esc(data.live.provider)+' · '+U.esc(data.live.tf)+'</span>')
      :'<span class="tag">demo seed '+ck('demo.seed')+'</span>')+
    (CHARTPRO.sel!=null?'<span class="tag" style="color:var(--warn)">drawing selected — DEL removes</span>':'')+
    (CHARTPRO.pend.length?'<span class="tag" style="color:var(--paper)">'+CHARTPRO.tool.toUpperCase()+': point '+(CHARTPRO.pend.length+1)+'…</span>':'');}
}

/* ── event wiring (once per mount) ── */
function cproWire(){
  const cv=document.getElementById('cp-main');if(!cv||cv.dataset.wired)return;cv.dataset.wired='1';
  const pt=e=>{const r=cv.getBoundingClientRect();const px=(e.clientX-r.left)*(cv.width/r.width),py=(e.clientY-r.top)*(cv.height/r.height);
    const sc=cv._sc;return{px,py,bar:sc?sc.x2b(px):0,i:sc?sc.x2b(px):0,p:sc?sc.y2p(py):0}};
  cv.addEventListener('mousemove',e=>{const q=pt(e);CHARTPRO.hover=q;
    if(CHARTPRO.dragging){const dBars=Math.round((q.px-CHARTPRO.dragX)/(cv._sc?cv._sc.cw:6));CHARTPRO.view.off=CHARTPRO.dragOff+dBars}
    cproDraw()});
  cv.addEventListener('mouseleave',()=>{CHARTPRO.hover=null;CHARTPRO.dragging=false;cproDraw()});
  cv.addEventListener('mousedown',e=>{if(CHARTPRO.tool==='cursor'){const q=pt(e);
    /* selection first */
    const sc=cv._sc,dr=CHARTPRO.list();let hit=null;
    dr.forEach((d,idx)=>{const near=(pp,ii)=>Math.abs(sc.p2y(pp)-q.py)<16&&(ii==null||Math.abs(sc.b2x(ii)-q.px)<60);
      if(d.t==='hline'&&Math.abs(sc.p2y(d.p1.p)-q.py)<10)hit=idx;
      else if(d.p1&&near(d.p1.p,d.p1.i))hit=idx;
      else if(d.p2&&near(d.p2.p,d.p2.i))hit=idx});
    if(hit!=null){CHARTPRO.sel=hit;cproDraw();return}
    CHARTPRO.sel=null;CHARTPRO.dragging=true;CHARTPRO.dragX=q.px;CHARTPRO.dragOff=CHARTPRO.view.off;cv.style.cursor='grabbing'}});
  window.addEventListener('mouseup',()=>{if(CHARTPRO.dragging){CHARTPRO.dragging=false;const cv2=document.getElementById('cp-main');if(cv2)cv2.style.cursor='crosshair';cproDraw()}});
  cv.addEventListener('wheel',e=>{e.preventDefault();const v=CHARTPRO.view;
    v.n=Math.round(v.n*(e.deltaY>0?1.12:0.88));cproClampView(cproSeries().length);cproDraw()},{passive:false});
  cv.addEventListener('click',e=>{const q=pt(e);
    /* machine-zone click → four questions */
    if(CHARTPRO.tool==='cursor'&&cv._zones){const z=cv._zones.find(z2=>q.px>=z2.x&&q.px<=z2.x+z2.w&&q.py>=z2.y&&q.py<=z2.y+z2.h);
      if(z){CMD.run('zone.inspect',z.id);return}}
    if(CHARTPRO.tool==='cursor')return;
    const need={trend:2,hline:1,zone:2,fib:2,measure:2,pos:3,note:1}[CHARTPRO.tool];
    CHARTPRO.pend.push({i:q.i,p:q.p});
    if(CHARTPRO.pend.length>=need){
      const[p1,p2,p3]=CHARTPRO.pend;
      if(CHARTPRO.tool==='note'){
        UI.modal('✎ NOTE at '+p1.p.toFixed(2),'<input id="cp-note" class="inp" placeholder="e.g. LPS forming — watch for SOS volume" maxlength="60">',
          '<button class="btn" data-cmd="ui.closeModal">Cancel</button><button class="btn pri" data-cmd="cpro.note.save">Place note</button>');
        CHARTPRO._notePend={p1};CHARTPRO.pend=[];return}
      const d={t:CHARTPRO.tool,p1,p2,p3};
      CHARTPRO.list().push(d);CHARTPRO.pend=[];
      if(d.t==='pos'){const rr=Math.abs(p3.p-p1.p)/Math.abs(p1.p-p2.p);
        SVR.audit('HUMAN (owner)','chart','Position tool: entry '+p1.p.toFixed(2)+' stop '+p2.p.toFixed(2)+' target '+p3.p.toFixed(2)+' = '+U.fmt(rr,2)+'R — '+(rr>=ck('risk.min_rr')?'gate would PASS':'SUB-'+ck('risk.min_rr')+'R, gate would BLOCK'));
        UI.toast(U.fmt(rr,2)+'R plan sketched — '+(rr>=ck('risk.min_rr')?'clears the 5R floor. Build it properly in Decisions → Trade Builder.':'below the 5R floor. The chart says no before the desk has to.'),rr>=ck('risk.min_rr')?'ok':'warn','POSITION TOOL')}
      cproDraw()
    }else cproDraw();
  });
}
CMD.define({id:'cpro.note.save',label:'Place note',purpose:'Drop the text note on the chart',run:()=>{
  const inp=$('#cp-note');const d=CHARTPRO._notePend;if(!d)return;
  CHARTPRO.list().push({t:'note',p1:d.p1,txt:(inp&&inp.value.trim())||'note'});CHARTPRO._notePend=null;UI.closeModal();cproDraw()}});
CMD.define({id:'cpro.tool',label:'Chart tool',purpose:'Select a drawing tool',audit:false,run:a=>{CHARTPRO.tool=a;CHARTPRO.pend=[];CHARTPRO.sel=null;render()}});
CMD.define({id:'cpro.undo',label:'Undo drawing',purpose:'Remove the most recent drawing',audit:false,run:()=>{CHARTPRO.list().pop();CHARTPRO.sel=null;cproDraw()}});
CMD.define({id:'cpro.clear',label:'Clear drawings',purpose:'Remove all drawings on this symbol',run:()=>{CHARTPRO.drawings[S.sym]=[];CHARTPRO.sel=null;cproDraw();UI.toast('Drawings cleared for '+S.sym,'','STUDIO')}});
CMD.define({id:'cpro.del',label:'Delete selected',purpose:'Remove the selected drawing',pre:()=>CHARTPRO.sel==null?'Nothing selected — click a drawing with the cursor tool first':null,
  run:()=>{CHARTPRO.list().splice(CHARTPRO.sel,1);CHARTPRO.sel=null;cproDraw()}});
CMD.define({id:'cpro.snap',label:'Snapshot PNG',purpose:'Export the chart exactly as drawn — a real PNG download',
  run:()=>{const cv=document.getElementById('cp-main');if(!cv)return;
    const a=document.createElement('a');a.href=cv.toDataURL('image/png');a.download='ATLAS_'+S.sym+'_'+CHARTX.tf+'_demo.png';a.click();
    SVR.audit('HUMAN (owner)','export','Chart snapshot exported: '+S.sym+' '+CHARTX.tf+' with '+CHARTPRO.list().length+' annotations');
    UI.toast('Chart PNG downloaded — annotations included','ok','SNAPSHOT')}});
CMD.define({id:'cpro.vc',label:'File to VC corpus',purpose:'File this annotated read to the setup archive as SHADOW — the visual-corpus habit',
  run:()=>{ARCHIVE.unshift(['STP-'+(940+ARCHIVE.length),S.sym,'FILED','shadow-tracking',symBy(S.sym).setup,'Operator chart read filed with '+CHARTPRO.list().length+' annotations — counterfactual opens now']);
    SVR.audit('HUMAN (owner)','vc','Chart read filed to VC corpus: '+S.sym+' ('+CHARTPRO.list().length+' annotations) — SHADOW tracked');
    UI.toast('Filed to the Setup Archive as SHADOW — Review → Autopsy tracks the counterfactual from here','gold','VC CORPUS')}});
CMD.define({id:'chartx.replayAt',label:'Replay scrub',purpose:'Scrub the deterministic replay',audit:false,run:(a,el)=>{CHARTX.replayAt=+el.value;cproClampView(cproSeries().length);cproDraw()}});

/* ── the view ── */
VIEWS['research.chart']=function(){
  let h=rHead('chart studio','Pan · zoom · draw · measure in R. Machine zones are clickable; the position tool runs the live 5R gate. Press F for focus mode.');
  const seg=(items,key,cur)=>'<span class="seg">'+items.map(v2=>'<button class="'+(cur===v2?'on':'')+'" data-cmd="chartx.set" data-arg="'+key+'='+v2+'">'+v2+'</button>').join('')+'</span>';
  const tog=(label,k)=>'<button class="btn sm'+(CHARTX[k]?' pri':'')+'" data-cmd="chartx.set" data-arg="'+k+'">'+label+'</button>';
  h+='<div class="row" style="margin-bottom:10px">'+seg(TFS,'tf',CHARTX.tf)+
     tog('EMA20','ema20')+tog('EMA50','ema50')+tog('EMA200','ema200')+tog('VWAP','vwap')+tog('BB','bb')+tog('RSI','rsi')+tog('Zones','zones')+
     '<button class="btn sm'+(CHARTPRO.ai?' pri':'')+'" data-cmd="cpro.aitoggle">AI structure</button>'+
     tog('Replay','replay')+tog('Vision wall','wall')+
     '<button class="btn sm" data-cmd="chartx.notes">↓ TA notes</button><button class="btn sm gold" data-cmd="chart.alert">⚑ Alert @ last</button></div>';
  if(CHARTX.wall){
    h+=panel('VISION WALL — eight timeframes, one read each','the machine looks top-down; so should you',
      '<div class="grid g4">'+TFS.map((tf,i)=>{
        const cid='vw-'+i;drawChartX(cid,S.sym,{h:120,n:48+i*6,mini:true,levels:false,zones:false,type:'candles',ema20:true});
        return'<div><div class="row" style="justify-content:space-between;margin-bottom:4px"><span class="mono" style="font-size:11px"><b>'+tf+'</b></span>'+chip(TF_NOTES[tf][0],TF_NOTES[tf][0]==='UP'?'ch-ok':TF_NOTES[tf][0]==='TRIGGER'||TF_NOTES[tf][0]==='ENTRY'?'ch-live':'ch-info','▲')+'</div><canvas id="'+cid+'" class="cv" style="height:120px"></canvas><div class="i2" style="font-size:10px;margin-top:4px;line-height:1.5">🔍 '+U.esc(TF_NOTES[tf][1])+'</div></div>'}).join('')+'</div>');
  }else{
    h+='<div class="panel"><div class="ph"><span class="t">STUDIO · '+S.sym+' · '+CHARTX.tf+'</span><span class="why">every overlay cites its detector · drawings are yours, zones are the machine’s</span><span class="spacer"></span>'+
       '<button class="btn sm" data-cmd="cpro.undo">↶ Undo</button>'+CMD.btn('cpro.del',null,'sm','Delete sel')+'<button class="btn sm" data-cmd="cpro.clear">Clear</button>'+
       '<button class="btn sm pri" data-cmd="cpro.snap">📷 PNG</button><button class="btn sm gold" data-cmd="cpro.vc">▣ File to VC corpus</button></div><div class="pb">'+
       '<div id="cp-ohlc" class="chead"></div>'+
       '<div class="cwrap"><div class="cbar">'+CPRO_TOOLS.map(t=>'<button class="ctool'+(CHARTPRO.tool===t[0]?' on':'')+'" data-cmd="cpro.tool" data-arg="'+t[0]+'" title="'+U.esc(t[1]+' '+t[2]+' — key '+t[3])+'">'+t[1]+'</button>').join('')+'</div>'+
       '<div class="cmain"><canvas id="cp-main" class="cvpro" style="height:380px"></canvas>'+
       (CHARTX.replay?'<div class="row" style="margin-top:8px"><span class="mono i2" style="font-size:10px">REPLAY</span><input type="range" min="12" max="100" value="'+CHARTX.replayAt+'" style="flex:1" data-cmdin="chartx.replayAt"><span class="mono i2" style="font-size:10px">'+CHARTX.replayAt+'%</span></div>':'')+
       '<div class="legend"><button class="lg-btn" data-cmd="zone.inspect" data-arg="FVG" title="Inspect the machine FVG — four questions"><i style="background:rgba(90,167,255,.5)"></i>FVG · DET-041 · inspect ▸</button><button class="lg-btn" data-cmd="zone.inspect" data-arg="OB" title="Inspect the machine order block — four questions"><i style="background:rgba(47,214,160,.5)"></i>OB · DET-052 · inspect ▸</button><span><i style="background:rgba(231,182,83,.8)"></i>EMA20 / RSI / fib 70.5◆</span><span><i style="background:rgba(157,141,248,.8)"></i>EMA50 / BB</span><span><i style="background:rgba(242,99,124,.6)"></i>EMA200</span><span><i style="background:#FF4D5F"></i>structural stop · <span class="mono">or click a zone on the chart</span></span></div>'+
       '</div></div>'+
       '<div class="i2" style="font-size:10.5px;margin-top:8px">Keys on this view: <kbd>T</kbd> trend · <kbd>L</kbd> level · <kbd>Z</kbd> zone · <kbd>B</kbd> fib · <kbd>R</kbd> R-ruler · <kbd>P</kbd> position (3 clicks: entry→stop→target, runs the 5R gate) · <kbd>X</kbd> note · <kbd>ESC</kbd> cursor · <kbd>DEL</kbd> delete. Wheel = zoom, drag = pan, click a machine zone for the four questions.</div>'+
       '</div></div>';
    POSTRENDER.push(()=>{cproWire();cproDraw()});
  }
  h+='<div class="grid g2">';
  h+=panel('TIMEFRAME LADDER','higher timeframes justify; lower timeframes trigger (AX-M7)',
    tbl(['TF','Bias','Machine read'],TFS.map(tf=>'<tr'+(tf===CHARTX.tf?' class="sel"':'')+'><td class="mono">'+tf+'</td><td>'+chip(TF_NOTES[tf][0],TF_NOTES[tf][0]==='UP'?'ch-ok':TF_NOTES[tf][0]==='TRIGGER'||TF_NOTES[tf][0]==='ENTRY'?'ch-live':'ch-info','▲')+'</td><td class="i1" style="font-size:11px">'+U.esc(TF_NOTES[tf][1])+'</td></tr>').join('')),{flush:true});
  h+=panel('ALIGNMENT VERDICT','net of the ladder',
    '<div style="font-size:15px;font-family:var(--mono);color:var(--pos);margin-bottom:6px">LONG · FULL STACK ALIGNED</div>'+
    '<div class="i1" style="font-size:11.5px;line-height:1.6">6+ of 8 timeframes constructive. Doctrine: ≥6 full alignment · ≥4 majority · ≥2 mixed/wait · below that, stand aside.</div>'+
    '<div class="hr"></div>'+kv('FILED','Chart reads filed via ▣ go to the Setup Archive as SHADOW and are counterfactual-tracked (Review → Autopsy).'));
  h+='</div>';
  return h;
};
CMD.define({id:'cpro.aitoggle',label:'AI structure overlay',purpose:'Toggle the machine’s eyes: pivot grammar, sweep, displacement, auto-fib',audit:false,run:()=>{CHARTPRO.ai=!CHARTPRO.ai;render()}});

/* studio keyboard layer — active only on the chart view */
document.addEventListener('keydown',e=>{
  if(S.domain!=='research'||S.ws!=='chart'||e.target.matches('input,select,textarea')||e.metaKey||e.ctrlKey)return;
  const map={t:'trend',l:'hline',z:'zone',b:'fib',r:'measure',p:'pos',x:'note'};
  const k=e.key.toLowerCase();
  if(map[k]){CHARTPRO.tool=map[k];CHARTPRO.pend=[];render();return}
  if(e.key==='Escape'&&CHARTPRO.tool!=='cursor'){CHARTPRO.tool='cursor';CHARTPRO.pend=[];render();return}
  if((e.key==='Delete'||e.key==='Backspace')&&CHARTPRO.sel!=null){CMD.run('cpro.del')}
});
CHARTX.ema200=false;
