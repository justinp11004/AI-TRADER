/* ═══════════ V14 · MARKETS DEEP — internals observatory + regime playbook library ═══════════
   Two workspaces the desk was missing: the tape's vital signs on one screen
   (Internals) and five years of what-works-per-regime memory (Playbooks).
   Contract: every number cited, every synthetic panel watermarked, every
   control a registered command. Series are seeded twins; the MATH run on
   them (EMA, thrust scan, composite weights) is real and shown. */
DOMAINS.markets.ws.push({id:'internals',label:'Internals'});
DOMAINS.markets.ws.push({id:'playbooks',label:'Playbooks'});

/* ── module state + deterministic caches ── */
const MKTD_STATE={
  trails:true,           /* RRG 4-step trails on/off */
  mcN:120,               /* McClellan lookback window (sessions shown) */
  scrub:100,             /* tape-twin replay scrubber — % of the session shown */
  armed:null,            /* session playbook id armed via playbk.arm */
  armedAt:null,          /* sim-clock stamp of the arm, for the session contract */
};
const MKTD_CACHE={};

/* ── 11 GICS sectors — breadth + RRG coordinates (seeded demo twins) ──
   adv/dec are decided members today; a20/a50/a200 = % of members above
   the 20/50/200dma. rs = RS-ratio, rm = RS-momentum (RRG axes, 100 = market). */
const MKTD_SECTORS=[
 {etf:'XLK', nm:'Information Technology',mem:68,a20:74,a50:71,a200:66,adv:52,dec:13,rs:103.6,rm:101.8,
  note:'Leadership intact — semis pull the sector and intra-sector breadth confirms the index bid. NVDA/AMD live here.'},
 {etf:'XLC', nm:'Communication Services', mem:23,a20:70,a50:65,a200:61,adv:17,dec:5, rs:102.1,rm:100.9,
  note:'Second engine. Mega-cap heavy — the sector read and the cap-weight read agree today, which is not always true.'},
 {etf:'XLY', nm:'Consumer Discretionary', mem:51,a20:63,a50:58,a200:52,adv:36,dec:12,rs:100.8,rm:101.6,
  note:'Freshest entrant to LEADING — momentum arrived before ratio. Early leadership, lower conviction than XLK.'},
 {etf:'XLI', nm:'Industrials',            mem:78,a20:61,a50:57,a200:55,adv:52,dec:22,rs:100.2,rm:99.4,
  note:'Hooking down out of LEADING. A re-hook up would be constructive rotation; continued decay feeds the DTOP case.'},
 {etf:'XLF', nm:'Financials',             mem:72,a20:58,a50:56,a200:60,adv:48,dec:20,rs:101.4,rm:99.1,
  note:'WEAKENING but orderly — trim-into-strength territory, not short territory, while credit stays calm.'},
 {etf:'XLV', nm:'Health Care',            mem:62,a20:44,a50:41,a200:39,adv:34,dec:22,rs:97.6, rm:100.7,
  note:'IMPROVING from a deep base. Earliest quadrant, lowest win-rate — starter size only until it promotes.'},
 {etf:'XLB', nm:'Materials',              mem:28,a20:52,a50:47,a200:44,adv:18,dec:8, rs:98.4, rm:100.2,
  note:'IMPROVING with the cyclicals bid. Watch with XLI — the pair confirms or denies the rotation story.'},
 {etf:'XLE', nm:'Energy',                 mem:22,a20:38,a50:35,a200:41,adv:10,dec:11,rs:96.9, rm:98.3,
  note:'LAGGING. Crude drift (CL −0.5% on the tape) offers no help. Cheap is not a setup (FM-LAGGARD-LONG).'},
 {etf:'XLP', nm:'Consumer Staples',       mem:38,a20:41,a50:44,a200:49,adv:19,dec:17,rs:97.2, rm:98.9,
  note:'Defensives unloved — exactly what a risk-on tape should show. Staples leadership would be a regime tell.'},
 {etf:'XLU', nm:'Utilities',              mem:31,a20:39,a50:42,a200:51,adv:14,dec:15,rs:98.1, rm:97.6,
  note:'Deepest momentum laggard. A bid here plus HY widening is the classic risk-off pre-echo. Not present today.'},
 {etf:'XLRE',nm:'Real Estate',            mem:31,a20:34,a50:33,a200:30,adv:13,dec:15,rs:96.2, rm:99.0,
  note:'Rate-sensitive and structurally weak — below every DMA cohort. Only duration relief changes this picture.'},
];
const MKTD_SECMAP={XLK:['Semis'],XLC:['Mega-tech'],XLY:['Autos/Tech']};
function mktdQuad(s){return s.rs>=100&&s.rm>=100?'LEADING':s.rs>=100?'WEAKENING':s.rm>=100?'IMPROVING':'LAGGING'}
function mktdNextQuad(q){return{LEADING:'WEAKENING',WEAKENING:'LAGGING',LAGGING:'IMPROVING',IMPROVING:'LEADING'}[q]}
const MKTD_QCOL={LEADING:'#2FD6A0',WEAKENING:'#E7B653',LAGGING:'#F2637C',IMPROVING:'#5AA7FF'};
const MKTD_QDOC={
 LEADING:'RS above market and still accelerating. Buy pullbacks to structure — never chase extensions. OTE Continuation lives in this quadrant; so does FM-CHASE when discipline slips.',
 WEAKENING:'Ratio rich, momentum rolling over. Trim into strength, tighten runners. The first sector out of LEADING often re-hooks — the hook, not the label, is the signal.',
 LAGGING:'Below market on both axes. “Cheap” is not a thesis (FM-LAGGARD-LONG). Longs need a regime reason; shorts belong to risk-off playbooks, not to this tape.',
 IMPROVING:'Momentum turns first, ratio follows. Earliest and least reliable quadrant — starter size only, add on promotion to LEADING, never before.',
};
/* RRG trail — 4 prior steps rotated backward along the quadrant cycle (seeded, deterministic) */
function mktdTrail(s){
  const key='tr-'+s.etf;if(MKTD_CACHE[key])return MKTD_CACHE[key];
  const r=localRng('mktd-tr-v14-'+s.etf);
  const cx=s.rs-100,cy=s.rm-100,rad=Math.sqrt(cx*cx+cy*cy)||0.6,a0=Math.atan2(cy,cx);
  const out=[];
  for(let k=1;k<=4;k++){
    const a=a0+k*0.20+(r()-0.5)*0.06;
    const rr=rad*(1-0.045*k)+(r()-0.5)*0.30;
    out.push([100+Math.cos(a)*rr,100+Math.sin(a)*rr]);
  }
  return MKTD_CACHE[key]=out;
}

/* ── intraday tape twins — TICK / ADD / VOLD (seeded; sliced to the sim clock) ──
   Engineered beats: open-drive TICK exhaustion print +1180 at 09:44; the
   10:14 sweep (the same one that took NVDA's Asia low) prints as −640 TICK,
   an ADD dip and a VOLD stall — one tape, one story across every screen. */
function mktdTickFull(){
  if(MKTD_CACHE.tick)return MKTD_CACHE.tick;
  const r=localRng('mktd-tick-v14');const a=[];
  for(let i=0;i<90;i++){
    let v=(i<8?540-i*34:190)+(r()-0.5)*540;
    if(i===7)v=1180;                 /* exhaustion print on the open drive */
    if(i===22)v=-640;                /* 10:14 — the engineered sweep hits the tape */
    a.push(Math.round(v));
  }
  return MKTD_CACHE.tick=a;
}
function mktdAddFull(){
  if(MKTD_CACHE.add)return MKTD_CACHE.add;
  const r=localRng('mktd-add-v14');let v=420;const a=[v];
  for(let i=1;i<90;i++){
    let d=i<8?85+(r()-0.3)*70:30+(r()-0.42)*95;
    if(i===22)d=-260;
    v=Math.round(v+d);a.push(v);
  }
  return MKTD_CACHE.add=a;
}
function mktdVoldFull(){
  if(MKTD_CACHE.vold)return MKTD_CACHE.vold;
  const r=localRng('mktd-vold-v14');let v=260;const a=[v];
  for(let i=1;i<90;i++){
    let d=i<8?120+(r()-0.3)*80:52+(r()-0.40)*110;
    if(i===22)d=-300;
    v=Math.round(v+d);a.push(v);
  }
  return MKTD_CACHE.vold=a;
}
function mktdBarsN(){
  const live=U.clamp(Math.floor((CLOCK.mins()-570)/2)+1,16,90);
  return U.clamp(Math.floor(live*MKTD_STATE.scrub/100),8,live);  /* scrubber replays the seeded session */
}
function mktdTickS(){
  const arr=mktdTickFull().slice(0,mktdBarsN());
  const mean=Math.round(arr.reduce((x,y)=>x+y,0)/arr.length);
  return{arr,mean,last:arr[arr.length-1],max:Math.max(...arr),min:Math.min(...arr),
    hiN:arr.filter(v=>v>=1000).length,loN:arr.filter(v=>v<=-1000).length,
    absMax:Math.max(...arr.map(Math.abs))};
}
function mktdAddS(){const arr=mktdAddFull().slice(0,mktdBarsN());return{arr,last:arr[arr.length-1]}}
function mktdVoldS(){const arr=mktdVoldFull().slice(0,mktdBarsN());return{arr,last:arr[arr.length-1]}}

/* ── daily breadth series → McClellan oscillator + Zweig thrust scan ──
   The SERIES is a seeded twin. The MATH is real: ratio-adjusted net advances,
   true 19/39 EMAs, a real from-below-0.40-to-above-0.615 scan. Engineered
   history: a washout (~d104–112) and a completed thrust leg right after it —
   the scanner FINDS it; the answer is not written down anywhere. */
function mktdDailyShare(){
  if(MKTD_CACHE.dsh)return MKTD_CACHE.dsh;
  const r=localRng('mktd-breadth-daily-v14');
  let w=0;const a=[];
  for(let i=0;i<160;i++){
    w=w*0.84+(r()-0.5)*0.11;
    let s=0.5+w;
    if(i>=103&&i<=112)s=0.33+r()*0.05;      /* the washout */
    if(i>=113&&i<=124)s=0.66+r()*0.07;      /* the thrust leg */
    if(i>=140)s=0.5+w*0.6+0.05+(r()-0.5)*0.04; /* present regime — broad, not euphoric */
    a.push(U.clamp(s,0.16,0.86));
  }
  return MKTD_CACHE.dsh=a;
}
function mktdEma(arr,n){
  const k=2/(n+1);let e=arr[0];const o=[e];
  for(let i=1;i<arr.length;i++){e=arr[i]*k+e*(1-k);o.push(e)}
  return o;
}
function mktdMc(){
  if(MKTD_CACHE.mc)return MKTD_CACHE.mc;
  const rana=mktdDailyShare().map(s=>1000*(2*s-1));  /* 1000×(A−D)/(A+D) */
  const e19=mktdEma(rana,19),e39=mktdEma(rana,39);
  return MKTD_CACHE.mc=rana.map((v,i)=>e19[i]-e39[i]);
}
function mktdThrust(){
  if(MKTD_CACHE.th)return MKTD_CACHE.th;
  const e=mktdEma(mktdDailyShare(),10);
  const ev=[];
  for(let i=1;i<e.length;i++){
    if(e[i]>0.615&&e[i-1]<=0.615){
      let j=i-1;while(j>=0&&e[j]>=0.40)j--;
      if(j>=0&&i-j<=10)ev.push({lo:j,hi:i,len:i-j});
    }
  }
  let lastBelow=-1;for(let i=e.length-1;i>=0;i--){if(e[i]<0.40){lastBelow=i;break}}
  return MKTD_CACHE.th={e,ev,cur:e[e.length-1],lastBelow};
}

/* ── credit & rates stress inputs (demo twins — level / trend / what each gates) ── */
const MKTD_CREDIT=[
 {k:'HY OAS',v:'289bp',tr:'5d −11bp · tightening',
  gate:'Composite input (w 0.08, inverse). > 350bp: counter-regime shorts earn a real conversation. > 450bp: RISK-OFF fingerprint condition met — credit leads equities at the turns.'},
 {k:'2s10s curve',v:'+42bp',tr:'5d +6bp · steepening',
  gate:'Context tier only — never a trigger (it sits with sentiment in the hierarchy). Re-inversion + HY widening together would down-rank every long-duration growth hunt.'},
 {k:'MOVE index',v:'88',tr:'falling from 96',
  gate:'> 120 freezes new 0DTE credit structures — bond-vol bleeds into equity pin risk at the close, and the fill model prices it badly. Below 100: no gate.'},
 {k:'USDJPY carry proxy',v:'157.2',tr:'20d realized vol 6.1% · stable',
  gate:'A ≥ 2% single-session yen rally = carry-unwind alarm: RISK-OFF DELEVERAGING pre-arms and gross comes down first, questions after (2024-08-05 analog).'},
];

/* ── the NOW object — every reading the fingerprints and the composite consume ── */
function mktdNow(){
  const advPct=parseInt(REGIME.breadth)||68;               /* pinned to the REGIME store — one number, one story */
  const vixRow=TAPE.find(t=>t[0]==='VIX')||['VIX',14.2,-2.1];
  const tick=mktdTickS(),add=mktdAddS(),vd=mktdVoldS();
  const mcArr=mktdMc();
  const mc=mcArr[mcArr.length-1];
  const mcPeak=Math.max(...mcArr.slice(-30,-5));
  const a20=Math.round(MKTD_SECTORS.reduce((a,s)=>a+s.a20,0)/MKTD_SECTORS.length);
  const a50=Math.round(MKTD_SECTORS.reduce((a,s)=>a+s.a50,0)/MKTD_SECTORS.length);
  const a200=Math.round(MKTD_SECTORS.reduce((a,s)=>a+s.a200,0)/MKTD_SECTORS.length);
  const leading=MKTD_SECTORS.filter(s=>mktdQuad(s)==='LEADING').length;
  const upVol=71;                                          /* same reading as the Regime tab internals strip */
  return{
    advPct,vix:vixRow[1],vixChg:vixRow[2],
    tickMean:tick.mean,tickLast:tick.last,tickAbsMax:tick.absMax,tickHiN:tick.hiN,tickLoN:tick.loN,
    addLast:add.last,voldLast:vd.last,
    upVol,vold:+(upVol/(100-upVol)).toFixed(2),
    mc,mcAbs:Math.abs(Math.round(mc)),mcDiv:Math.round(mc-mcPeak),
    a20,a50,a200,leading,
    hyoas:289,hy5d:-11,move:88,s2s10:42,jpy:157.2,          /* credit twins (labeled) */
    adrPct:94,belowVwap:22,nh:142,nl:38,a50d5:3.1,          /* tape twins (labeled) */
  };
}

/* ── scoring — the arithmetic is rendered, not implied ── */
function mktdScore(x,lo,hi){
  const s=Math.round(U.clamp((x-lo)/(hi-lo)*100,0,100));
  return{s,calc:'( '+x+' − '+lo+' ) ÷ ( '+hi+' − '+lo+' ) × 100 → '+s+' [clamped 0–100]'};
}
function mktdBandScore(x,c,half){
  const s=Math.round(U.clamp(100-Math.abs(x-c)/half*100,0,100));
  return{s,calc:'100 − |'+x+' − '+c+'| ÷ '+half+' × 100 → '+s+' [clamped 0–100]'};
}

/* ── RISK-ON/OFF COMPOSITE — weighted sum, weights table displayed (LAW-015) ── */
function mktdComposite(){
  const N=mktdNow();
  const rows=[
   {sk:'breadth',k:'Breadth — % advancers (tape)',      v:N.advPct,          u:'%', lo:30, hi:70, w:0.20,src:'REGIME store — same number as Regime & Macro'},
   {sk:'a50dma', k:'% above 50dma — 11-sector avg',     v:N.a50,             u:'%', lo:20, hi:80, w:0.15,src:'breadth engine table below (demo twin)'},
   {sk:'tick',   k:'TICK — session mean',               v:N.tickMean,        u:'',  lo:-400,hi:400,w:0.10,src:'TICK strip (computed from the seeded series)'},
   {sk:'upvol',  k:'Up-volume share',                   v:N.upVol,           u:'%', lo:30, hi:70, w:0.10,src:'VOLD twin — same reading as the Regime tab'},
   {sk:'mcosc',  k:'McClellan oscillator',              v:Math.round(N.mc),  u:'',  lo:-100,hi:100,w:0.15,src:'computed — real 19/39 EMA math on the seeded series'},
   {sk:'rrg',    k:'RRG leading-quadrant share',        v:Math.round(N.leading/11*100),u:'%',lo:0,hi:45,w:0.10,src:'rotation quadrant (computed from the sector table)'},
   {sk:'hyoas',  k:'HY OAS',                            v:N.hyoas,           u:'bp',lo:500,hi:250,w:0.08,src:'credit panel (demo twin) — inverse map'},
   {sk:'move',   k:'MOVE index',                        v:N.move,            u:'',  lo:140,hi:60, w:0.06,src:'credit panel (demo twin) — inverse map'},
   {sk:'curve',  k:'2s10s curve',                       v:N.s2s10,           u:'bp',lo:-50,hi:100,w:0.06,src:'credit panel (demo twin)'},
  ].map(r=>{const sc=mktdScore(r.v,r.lo,r.hi);return Object.assign({},r,{s:sc.s,calc:sc.calc,ws:sc.s*r.w})});
  const total=Math.round(rows.reduce((a,r)=>a+r.ws,0));
  const band=total>70?{nm:'FULL RISK BUDGET',cls:'ch-ok',col:'var(--pos)'}
            :total>=40?{nm:'SELECTIVE',cls:'ch-warn',col:'var(--warn)'}
            :{nm:'DEFENSIVE',cls:'ch-blk',col:'var(--blk)'};
  return{rows,total,band,N};
}

/* ── canvas: generic internals strip (zero line, extreme thresholds, last-value axis) ── */
function mktdStrip(id,hpx,data,o){
  o=o||{};
  POSTRENDER.push(()=>{
    const cv=document.getElementById(id);if(!cv||!data.length)return;
    const W=cv.width=cv.clientWidth*2,H=cv.height=hpx*2,x=cv.getContext('2d');
    x.fillStyle='#070B12';x.fillRect(0,0,W,H);
    let lo=Math.min(...data),hi=Math.max(...data);
    if(o.thrHi!=null){hi=Math.max(hi,o.thrHi*1.06);lo=Math.min(lo,o.thrLo*1.06)}
    if(o.zero){hi=Math.max(hi,0);lo=Math.min(lo,0)}
    const pad=(hi-lo)*0.10||1;hi+=pad;lo-=pad;
    const AX=86,PW=W-AX;
    const py=v=>H-((v-lo)/(hi-lo))*(H*0.84)-H*0.08;
    const px=i=>i/(Math.max(1,data.length-1))*PW;
    x.strokeStyle='rgba(151,166,192,.07)';x.lineWidth=1;
    [0.25,0.5,0.75].forEach(f=>{x.beginPath();x.moveTo(0,H*f);x.lineTo(PW,H*f);x.stroke()});
    if(o.zero){
      const y=py(0);x.strokeStyle='rgba(151,166,192,.30)';
      x.beginPath();x.moveTo(0,y);x.lineTo(PW,y);x.stroke();
      x.fillStyle='#67748C';x.font='13px monospace';x.fillText('0',PW+8,y+4);
    }
    if(o.thrHi!=null){
      x.setLineDash([6,5]);x.strokeStyle='rgba(242,99,124,.45)';x.font='14px monospace';
      [o.thrHi,o.thrLo].forEach(t=>{
        const y=py(t);x.beginPath();x.moveTo(0,y);x.lineTo(PW,y);x.stroke();
        x.fillStyle='rgba(242,99,124,.80)';x.fillText((t>0?'+':'')+t,PW-70,y-5);
      });
      x.setLineDash([]);
    }
    const bw=PW/data.length;
    if(o.bars){
      data.forEach((v,i)=>{
        const y0=py(0),y1=py(v);
        x.fillStyle=v>=0?'rgba(47,214,160,.62)':'rgba(242,99,124,.62)';
        x.fillRect(i*bw+bw*0.16,Math.min(y0,y1),Math.max(2,bw*0.68),Math.max(2,Math.abs(y1-y0)));
      });
    }else{
      const col=o.col||'#5AA7FF';
      x.beginPath();data.forEach((v,i)=>{i?x.lineTo(px(i),py(v)):x.moveTo(px(i),py(v))});
      x.strokeStyle=col;x.lineWidth=2.5;x.stroke();
      if(o.zero){
        x.lineTo(px(data.length-1),py(0));x.lineTo(0,py(0));x.closePath();
        const grd=x.createLinearGradient(0,0,0,H);
        grd.addColorStop(0,'rgba(90,167,255,.18)');grd.addColorStop(1,'rgba(90,167,255,0)');
        x.fillStyle=grd;x.fill();
      }
    }
    if(o.thrHi!=null&&!o.noDots){
      data.forEach((v,i)=>{
        if(v>=o.thrHi||v<=o.thrLo){
          x.fillStyle='#E7B653';x.beginPath();
          x.arc(px(i)+(o.bars?bw/2:0),py(v),5,0,7);x.fill();
        }
      });
    }
    const lv=data[data.length-1];
    x.fillStyle=o.col||'#5AA7FF';x.beginPath();x.arc(px(data.length-1)+(o.bars?bw/2:0),py(lv),6,0,7);x.fill();
    x.font='15px monospace';x.fillStyle='#9FABBF';
    x.fillText(o.fmt?o.fmt(lv):String(lv),PW+8,py(lv)+5);
    if(o.stamp){x.fillStyle='#67748C';x.font='13px monospace';x.fillText(o.stamp,8,H-8)}
  });
}

/* ── canvas: RRG sector rotation quadrant ── */
function mktdDrawRRG(id){
  POSTRENDER.push(()=>{
    const cv=document.getElementById(id);if(!cv)return;
    const W=cv.width=cv.clientWidth*2,H=cv.height=340*2,x=cv.getContext('2d');
    x.fillStyle='#070B12';x.fillRect(0,0,W,H);
    const M=26,PX0=M,PX1=W-M,PY0=M,PY1=H-M-14;
    const nx=v=>PX0+(v-93.5)/13*(PX1-PX0);
    const ny=v=>PY1-(v-93.5)/13*(PY1-PY0);
    const ox=nx(100),oy=ny(100);
    x.fillStyle='rgba(47,214,160,.05)'; x.fillRect(ox,PY0,PX1-ox,oy-PY0);       /* leading   */
    x.fillStyle='rgba(231,182,83,.05)'; x.fillRect(ox,oy,PX1-ox,PY1-oy);        /* weakening */
    x.fillStyle='rgba(242,99,124,.05)'; x.fillRect(PX0,oy,ox-PX0,PY1-oy);       /* lagging   */
    x.fillStyle='rgba(90,167,255,.05)'; x.fillRect(PX0,PY0,ox-PX0,oy-PY0);      /* improving */
    x.strokeStyle='rgba(151,166,192,.07)';x.lineWidth=1;
    for(let v=95;v<=106;v++){
      x.beginPath();x.moveTo(nx(v),PY0);x.lineTo(nx(v),PY1);x.stroke();
      x.beginPath();x.moveTo(PX0,ny(v));x.lineTo(PX1,ny(v));x.stroke();
    }
    x.strokeStyle='rgba(151,166,192,.30)';
    x.beginPath();x.moveTo(ox,PY0);x.lineTo(ox,PY1);x.stroke();
    x.beginPath();x.moveTo(PX0,oy);x.lineTo(PX1,oy);x.stroke();
    x.font='16px monospace';
    x.fillStyle='rgba(47,214,160,.65)'; x.fillText('LEADING',PX1-118,PY0+26);
    x.fillStyle='rgba(231,182,83,.65)'; x.fillText('WEAKENING',PX1-146,PY1-12);
    x.fillStyle='rgba(242,99,124,.65)'; x.fillText('LAGGING',PX0+10,PY1-12);
    x.fillStyle='rgba(90,167,255,.65)'; x.fillText('IMPROVING',PX0+10,PY0+26);
    x.fillStyle='#485469';x.font='13px monospace';
    x.fillText('RS-RATIO →',W/2-44,H-6);
    x.save();x.translate(12,H/2+52);x.rotate(-Math.PI/2);x.fillText('RS-MOMENTUM →',0,0);x.restore();
    MKTD_SECTORS.forEach(s=>{
      const q=mktdQuad(s),col=MKTD_QCOL[q];
      if(MKTD_STATE.trails){
        const tr=mktdTrail(s);
        x.strokeStyle=col;x.globalAlpha=0.30;x.lineWidth=2;
        x.beginPath();x.moveTo(nx(tr[3][0]),ny(tr[3][1]));
        for(let k=2;k>=0;k--)x.lineTo(nx(tr[k][0]),ny(tr[k][1]));
        x.lineTo(nx(s.rs),ny(s.rm));x.stroke();
        tr.forEach((p,k)=>{
          x.globalAlpha=0.42-k*0.08;x.fillStyle=col;
          x.beginPath();x.arc(nx(p[0]),ny(p[1]),3.5,0,7);x.fill();
        });
        x.globalAlpha=1;
      }
      x.fillStyle=col;x.beginPath();x.arc(nx(s.rs),ny(s.rm),7,0,7);x.fill();
      x.font='15px monospace';x.fillText(s.etf,nx(s.rs)+11,ny(s.rm)+5);
    });
  });
}

/* ── canvas: 0–100 risk dial ── */
function mktdDrawDial(id,val,band){
  POSTRENDER.push(()=>{
    const cv=document.getElementById(id);if(!cv)return;
    const W=cv.width=cv.clientWidth*2,H=cv.height=200*2,x=cv.getContext('2d');
    x.fillStyle='#070B12';x.fillRect(0,0,W,H);
    const cx=W/2,cy=H*0.90,R=Math.min(W*0.40,H*0.74);
    const ang=v=>Math.PI+(v/100)*Math.PI;
    [[0,40,'rgba(242,99,124,.50)'],[40,70,'rgba(231,182,83,.50)'],[70,100,'rgba(47,214,160,.50)']].forEach(([a,b,c])=>{
      x.beginPath();x.arc(cx,cy,R,ang(a),ang(b));x.strokeStyle=c;x.lineWidth=26;x.stroke();
    });
    x.font='14px monospace';x.fillStyle='#67748C';
    for(let v=0;v<=100;v+=10){
      const a=ang(v);
      x.strokeStyle='rgba(151,166,192,.30)';x.lineWidth=2;
      x.beginPath();x.moveTo(cx+Math.cos(a)*(R-20),cy+Math.sin(a)*(R-20));
      x.lineTo(cx+Math.cos(a)*(R-30),cy+Math.sin(a)*(R-30));x.stroke();
      if(v%50===0)x.fillText(String(v),cx+Math.cos(a)*(R+30)-10,cy+Math.sin(a)*(R+30)+5);
    }
    const a=ang(U.clamp(val,0,100));
    x.strokeStyle='#E9EEF6';x.lineWidth=4;
    x.beginPath();x.moveTo(cx,cy);x.lineTo(cx+Math.cos(a)*(R-40),cy+Math.sin(a)*(R-40));x.stroke();
    x.fillStyle='#E9EEF6';x.beginPath();x.arc(cx,cy,7,0,7);x.fill();
    x.font='46px monospace';x.fillStyle=band==='FULL RISK BUDGET'?'#2FD6A0':band==='SELECTIVE'?'#E7B653':'#FF4D5F';
    x.fillText(String(val),cx-28,cy-R*0.36);
    x.font='15px monospace';x.fillText(band,cx-band.length*4.4,cy-R*0.36+26);
  });
}

/* ── canvas: Zweig thrust ratio (EMA10 of ADV/(ADV+DEC)) with 0.40 / 0.615 rails ── */
function mktdDrawThrust(id){
  POSTRENDER.push(()=>{
    const cv=document.getElementById(id);if(!cv)return;
    const W=cv.width=cv.clientWidth*2,H=cv.height=160*2,x=cv.getContext('2d');
    x.fillStyle='#070B12';x.fillRect(0,0,W,H);
    const th=mktdThrust(),off=th.e.length-120,e=th.e.slice(-120);
    const lo=0.28,hi=0.78,AX=70,PW=W-AX;
    const py=v=>H-((v-lo)/(hi-lo))*(H*0.86)-H*0.07;
    const px=i=>i/(e.length-1)*PW;
    x.fillStyle='rgba(90,167,255,.05)';x.fillRect(0,py(0.615),PW,py(0.40)-py(0.615));
    x.setLineDash([6,5]);x.font='14px monospace';
    [[0.615,'0.615 · thrust line','rgba(47,214,160,.55)'],[0.40,'0.400 · washout line','rgba(242,99,124,.55)']].forEach(([v,lb,c])=>{
      x.strokeStyle=c;x.beginPath();x.moveTo(0,py(v));x.lineTo(PW,py(v));x.stroke();
      x.fillStyle=c;x.fillText(lb,8,py(v)-6);
    });
    x.setLineDash([]);
    th.ev.forEach(evt=>{
      const a=evt.lo-off,b=evt.hi-off;
      if(b<0)return;
      x.fillStyle='rgba(47,214,160,.10)';
      x.fillRect(px(Math.max(0,a)),H*0.05,px(b)-px(Math.max(0,a)),H*0.90);
    });
    x.beginPath();e.forEach((v,i)=>{i?x.lineTo(px(i),py(v)):x.moveTo(px(i),py(v))});
    x.strokeStyle='#5AA7FF';x.lineWidth=2.5;x.stroke();
    const lv=e[e.length-1];
    x.fillStyle='#5AA7FF';x.beginPath();x.arc(px(e.length-1),py(lv),6,0,7);x.fill();
    x.fillStyle='#9FABBF';x.font='15px monospace';x.fillText(lv.toFixed(3),PW+6,py(lv)+5);
    x.fillStyle='#67748C';x.font='13px monospace';x.fillText('last 120 sessions · seeded series · the scan below found the shaded event',8,H-8);
  });
}

/* ── new highs / new lows — 60-session twin, pinned to the Regime tab's 142/38 ── */
function mktdNhNl(){
  if(MKTD_CACHE.nhnl)return MKTD_CACHE.nhnl;
  const r=localRng('mktd-nhnl-v14');
  const n=60,rawH=[],rawL=[];
  let h0=95,l0=62;
  for(let i=0;i<n;i++){
    h0=U.clamp(h0+(r()-0.47)*14,45,190);
    l0=U.clamp(l0+(r()-0.53)*10,15,110);
    rawH.push(h0);rawL.push(l0);
  }
  /* pin the endpoints to the published readings — one number, one story */
  const adjH=142-rawH[n-1],adjL=38-rawL[n-1];
  const nh=rawH.map((v,i)=>Math.round(U.clamp(v+adjH*(i/(n-1)),5,220)));
  const nl=rawL.map((v,i)=>Math.round(U.clamp(v+adjL*(i/(n-1)),2,140)));
  return MKTD_CACHE.nhnl={nh,nl};
}
function mktdDrawNhNl(id){
  POSTRENDER.push(()=>{
    const cv=document.getElementById(id);if(!cv)return;
    const W=cv.width=cv.clientWidth*2,H=cv.height=150*2,x=cv.getContext('2d');
    x.fillStyle='#070B12';x.fillRect(0,0,W,H);
    const{nh,nl}=mktdNhNl();
    const AX=70,PW=W-AX,hi=Math.max(...nh,...nl)*1.12,lo=0;
    const py=v=>H-((v-lo)/(hi-lo))*(H*0.84)-H*0.08;
    const px=i=>i/(nh.length-1)*PW;
    x.strokeStyle='rgba(151,166,192,.07)';x.lineWidth=1;
    [0.25,0.5,0.75].forEach(f=>{x.beginPath();x.moveTo(0,H*f);x.lineTo(PW,H*f);x.stroke()});
    [['#2FD6A0',nh],['#F2637C',nl]].forEach(([col,arr])=>{
      x.beginPath();arr.forEach((v,i)=>{i?x.lineTo(px(i),py(v)):x.moveTo(px(i),py(v))});
      x.strokeStyle=col;x.lineWidth=2.5;x.stroke();
      x.fillStyle=col;x.beginPath();x.arc(px(arr.length-1),py(arr[arr.length-1]),6,0,7);x.fill();
      x.font='15px monospace';x.fillText(String(arr[arr.length-1]),PW+8,py(arr[arr.length-1])+5);
    });
    x.fillStyle='#67748C';x.font='13px monospace';
    x.fillText('new 52w highs (green) vs new lows (red) · 60 sessions · seeded twin',8,H-8);
  });
}

/* ── composite backcast — 60 sessions of the breadth family, credit/tape held neutral ──
   Honest scope: only the inputs the daily series can actually drive (breadth,
   %>50dma proxy, McClellan — 0.50 of total weight) vary; the remaining 0.50
   is held at a neutral 55. The point is the SHAPE and the band crossings. */
function mktdCompHist(){
  if(MKTD_CACHE.chist)return MKTD_CACHE.chist;
  const sh=mktdDailyShare(),mc=mktdMc();
  const a50p=mktdEma(sh.map(s=>s*100),20);
  const arr=[];
  for(let i=sh.length-60;i<sh.length;i++){
    const sAdv=U.clamp((sh[i]*100-30)/40*100,0,100);
    const s50=U.clamp((a50p[i]-20)/60*100,0,100);
    const sMc=U.clamp((mc[i]+100)/200*100,0,100);
    arr.push(Math.round(0.20*sAdv+0.15*s50+0.15*sMc+0.50*55));
  }
  let crossDn=0,crossUp=0;
  for(let i=1;i<arr.length;i++){
    if(arr[i-1]>=70&&arr[i]<70)crossDn++;
    if(arr[i-1]<70&&arr[i]>=70)crossUp++;
  }
  return MKTD_CACHE.chist={arr,crossDn,crossUp};
}

/* ── band sensitivity — what single input flips the composite band, alone ── */
function mktdSensitivity(comp){
  const T=comp.total;
  const edge=T>70?70:T>=40?40:null;
  if(edge===null)return{edge:null,rows:[]};
  const D=T-edge;
  const rows=comp.rows.map(r=>{
    const d=D/r.w;                                   /* score points this input must lose alone */
    if(d>r.s)return{k:r.k,v:r.v,u:r.u,can:false};
    const vAt=+(r.v-d*(r.hi-r.lo)/100).toFixed(0);
    return{k:r.k,v:r.v,u:r.u,can:true,vAt,dir:r.hi>r.lo?'falls to ≤':'rises to ≥'};
  });
  return{edge,D,rows};
}

/* ── breadth-thrust vintages (public-record dates; annotations are desk notes — demo twin) ── */
const MKTD_THRUST_VINTAGE=[
 ['2019-01-07','0.398 → 0.617','8 sessions','≈ +9% / +24%','Post-Q4-2018 washout. The thrust fired INTO disbelief — the canonical shape.'],
 ['2020-06-05','0.372 → 0.640','7 sessions','≈ +4% / +28%','Recovery leg two. Late by feel, early by math — feel lost.'],
 ['2023-11-03','0.384 → 0.622','8 sessions','≈ +8% / +26%','CPI-relief thrust off the October low; breadth led price for two quarters.'],
 ['2025-04-24','0.361 → 0.631','9 sessions','≈ +7% / +19%','Post-tariff-shock thrust. The +9.5% squeeze day (04-09) preceded it; the THRUST, not the squeeze, was the signal.'],
];

/* ── divergence ledger — computed where the stores allow, twin-labeled where not ── */
function mktdDivergences(N){
  const rows=[];
  rows.push({pair:'INDEX vs BREADTH',read:'ES +0.31% at session highs · '+N.advPct+'% advancers · %>50dma avg '+N.a50+'%',
    st:N.advPct>=60?'CONFIRMING':'WATCH',
    flip:'Index holding highs while advancers drop below 55% and %>50dma rolls — that pair opens the DTOP fingerprint.'});
  rows.push({pair:'INDEX vs McCLELLAN',read:'oscillator '+U.sign(Math.round(N.mc),0)+' vs recent peak '+U.sign(Math.round(N.mc-N.mcDiv),0)+' (gap '+U.sign(N.mcDiv,0)+')',
    st:N.mcDiv<-15?'WATCH':'CONFIRMING',
    flip:N.mcDiv<-15?'Already a lower high vs price. Actionable only on a zero-line loss — a decaying oscillator in a broad tape is digestion, not distribution.':'A lower oscillator high while price makes a higher high flips this to WATCH.'});
  rows.push({pair:'INDEX vs CREDIT',read:'HY OAS 289bp, 5d −11bp tightening',
    st:'CONFIRMING',
    flip:'5d widening > +15bp while the index holds highs. Credit tends to blink first; equities argue longer.'});
  rows.push({pair:'CAP-WEIGHT vs EQUAL-WEIGHT',read:'RSP/SPY 5d −0.4% (twin)',
    st:'MILD CONCENTRATION',
    flip:'A rotation regime tolerates mild concentration; a distribution regime does not. Read it WITH the leading-quadrant count ('+N.leading+'/11), never alone.'});
  return rows;
}

/* ═══════════ VIEW · MARKETS / INTERNALS — the tape's vital signs, one screen ═══════════ */
VIEWS['markets.internals']=function(){
  const N=mktdNow();
  const comp=mktdComposite();
  const tick=mktdTickS(),add=mktdAddS(),vd=mktdVoldS();
  const uniAdv=Math.round(ck('scan.universe_size')*N.advPct/100);
  const uniUnch=Math.round(ck('scan.universe_size')*0.03);
  const uniDec=ck('scan.universe_size')-uniAdv-uniUnch;
  const spAdv=MKTD_SECTORS.reduce((a,s)=>a+s.adv,0);
  const spDec=MKTD_SECTORS.reduce((a,s)=>a+s.dec,0);
  const spPct=Math.round(spAdv/(spAdv+spDec)*100);
  let h=vhead('MARKETS · internals observatory','The tape under the tape',
    'Breadth, participation, conviction, rotation, credit — the regime’s inputs, not its label. S08 publishes the label; this screen shows the arithmetic underneath it. Extreme readings outrank HTF context in the hierarchy.',
    chip('COMPOSITE '+comp.total+'/100 · '+comp.band.nm,comp.band.cls,'◆')+' '+chip('demo twins · seeded','ch-demo','◈'));
  /* vital-sign strip */
  h+='<div class="grid g4">'+
    stat('Advancers / Decliners',U.int(uniAdv)+' : '+U.int(uniDec),
      N.advPct+'% of '+U.int(ck('scan.universe_size'))+' — pinned to the REGIME store '+prov('scan.universe_size'))+
    stat('Up / Down volume',N.upVol+'% / '+(100-N.upVol)+'%','VOLD skew '+U.fmt(N.vold,2)+':1 — same reading as Regime & Macro')+
    stat('TICK now',(tick.last>=0?'+':'')+tick.last,'session mean '+U.sign(tick.mean,0)+' · extremes ≥|1000|: '+(tick.hiN+tick.loN))+
    stat('McClellan',U.sign(Math.round(N.mc),0),'real 19/39 EMA math · seeded series · zone ±60')+
  '</div>';
  h+='<div class="grid g2" style="margin-top:12px">';
  /* (a) breadth engine */
  h+=panel('BREADTH ENGINE — % above 20 / 50 / 200dma','overall and per sector · <span class="demo-wm">demo twins</span> · click a row for the sector read',
    '<div class="grid g3" style="margin-bottom:8px">'+
      stat('% > 20dma',N.a20+'%','<div class="gauge"><i style="width:'+N.a20+'%"></i></div>11-sector avg — swing tier')+
      stat('% > 50dma',N.a50+'%','<div class="gauge"><i style="width:'+N.a50+'%"></i></div>the regime’s spine — composite input w 0.15')+
      stat('% > 200dma',N.a200+'%','<div class="gauge"><i style="width:'+N.a200+'%"></i></div>secular health — slowest to lie, slowest to warn')+
    '</div>'+
    tbl(['Sector','>%>20d','>%>50d','>%>200d','>A / D','Quadrant'],
      MKTD_SECTORS.map(s=>{
        const q=mktdQuad(s);
        const g=v=>'<div class="row" style="justify-content:flex-end;gap:6px"><div class="gauge" style="width:52px"><i style="width:'+v+'%"></i></div><span class="mono" style="font-size:10.5px">'+v+'</span></div>';
        return'<tr class="click" data-cmd="intern.sector" data-arg="'+s.etf+'">'+
          '<td><b class="mono">'+s.etf+'</b> <span class="i2" style="font-size:10px">'+U.esc(s.nm)+'</span></td>'+
          '<td class="r">'+g(s.a20)+'</td><td class="r">'+g(s.a50)+'</td><td class="r">'+g(s.a200)+'</td>'+
          '<td class="r num">'+s.adv+' : '+s.dec+'</td>'+
          '<td>'+chip(q,q==='LEADING'?'ch-ok':q==='WEAKENING'?'ch-warn':q==='LAGGING'?'ch-blk':'ch-info','●')+'</td></tr>';
      }).join(''))+
    '<div class="i2" style="font-size:10.5px;padding:8px 12px">S&P members: '+spAdv+' adv / '+spDec+' dec = '+spPct+'% — the mega-cap tape runs slightly narrower than the '+N.advPct+'% broad tape. NarrowING is the warning; narrow-and-stable is just 2026 market structure.</div>',{flush:true});
  /* (b) TICK / ADD / VOLD twins */
  h+=panel('TAPE TWINS — TICK · ADD · VOLD','three lenses, one question: who is in charge · <span class="demo-wm">demo twins · seeded</span>',
    '<div class="row" style="justify-content:space-between;margin-bottom:2px"><span class="mono" style="font-size:11px"><b>TICK</b> — instantaneous up-minus-downticks</span>'+chip('now '+(tick.last>=0?'+':'')+tick.last,tick.last>=0?'ch-ok':'ch-blk','●')+'</div>'+
    '<canvas id="mktd-tick" class="cv" style="height:96px"></canvas>'+
    '<div class="i2" style="font-size:10.5px;margin:4px 0 10px">±1000 prints are exhaustion, not strength — fade-side signal in chop, add-side confirmation on trend days ONLY when ADD agrees. Session so far: '+tick.hiN+' print(s) ≥ +1000, '+tick.loN+' ≤ −1000 · the +1180 at 09:44 capped the open drive; the −640 at 10:14 is the engineered sweep hitting the tape.</div>'+
    '<div class="row" style="justify-content:space-between;margin-bottom:2px"><span class="mono" style="font-size:11px"><b>ADD</b> — cumulative advancers − decliners</span>'+chip('now '+U.sign(add.last,0),add.last>=0?'ch-ok':'ch-blk','●')+'</div>'+
    '<canvas id="mktd-add" class="cv" style="height:96px"></canvas>'+
    '<div class="i2" style="font-size:10.5px;margin:4px 0 10px">Participation. The TREND outranks the level: rising ADD under a flat index is accumulation; falling ADD at index highs is distribution. Today: rising with one sweep-dip — participation intact.</div>'+
    '<div class="row" style="justify-content:space-between;margin-bottom:2px"><span class="mono" style="font-size:11px"><b>VOLD</b> — up-volume − down-volume (M shares)</span>'+chip('now +'+U.fmt(vd.last/1000,2)+'B','ch-ok','●')+'</div>'+
    '<canvas id="mktd-vold" class="cv" style="height:96px"></canvas>'+
    '<div class="i2" style="font-size:10.5px;margin-top:4px">Conviction. Skew ≥ 3:1 = institutional one-way flow (trend-day fingerprint). Today’s '+U.fmt(N.vold,2)+':1 with '+N.advPct+'% breadth reads broad-but-two-sided: rotation, not a trend day — exactly what TODAY’S MATCH concludes on the Playbooks tab.</div>'+
    '<div class="hr"></div>'+
    '<div class="row"><span class="mono i2" style="font-size:10px">SESSION SCRUB</span>'+
      '<input type="range" min="25" max="100" step="5" value="'+MKTD_STATE.scrub+'" data-cmdin="intern.scrub" style="flex:1">'+
      '<span class="mono" style="font-size:10.5px">'+MKTD_STATE.scrub+'% · '+tick.arr.length+' prints</span></div>'+
    '<div class="i2" style="font-size:10px;margin-top:4px">Replays the seeded session from 09:30 — all three strips and their stats recompute from the truncated tape. Watch the 09:44 exhaustion print appear before the 10:14 sweep: sequence is the lesson, not the levels.</div>');
  h+='</div>';
  mktdStrip('mktd-tick',96,tick.arr,{zero:true,bars:true,thrHi:1000,thrLo:-1000,stamp:'09:30 → '+CLOCK.hm()+' ET · 2-min prints'});
  mktdStrip('mktd-add',96,add.arr,{zero:true,col:'#5AA7FF',fmt:v=>U.sign(v,0),stamp:'09:30 → '+CLOCK.hm()+' ET'});
  mktdStrip('mktd-vold',96,vd.arr,{zero:true,col:'#2FD6A0',fmt:v=>'+'+U.fmt(v/1000,2)+'B',stamp:'09:30 → '+CLOCK.hm()+' ET'});
  h+='<div class="grid g2">';
  /* (c) McClellan oscillator */
  h+=panel('McCLELLAN OSCILLATOR — computed, formula shown','real EMA math on the seeded breadth series — move the lookback and the curve recomputes',
    '<canvas id="mktd-mcosc" class="cv" style="height:170px"></canvas>'+
    '<div class="row" style="margin:8px 0"><span class="mono i2" style="font-size:10px">LOOKBACK</span>'+
      '<input type="range" min="60" max="160" step="10" value="'+MKTD_STATE.mcN+'" data-cmdin="intern.mclen" style="flex:1">'+
      '<span class="mono" style="font-size:10.5px">'+MKTD_STATE.mcN+' sessions</span></div>'+
    kv('FORMULA','<span class="mono" style="font-size:10.5px">RANA = 1000 × (ADV − DEC) ÷ (ADV + DEC) · McOsc = EMA₁₉(RANA) − EMA₃₉(RANA) · k₁₉ = 2/(19+1) = 0.10 · k₃₉ = 2/(39+1) = 0.05</span>')+
    kv('READING NOW','<b>'+U.sign(Math.round(N.mc),0)+'</b> — positive zone, off the thrust peak (gap to recent peak '+U.sign(N.mcDiv,0)+')')+
    kv('SIGNAL DOCTRINE','<span style="font-size:11px">Zero-line cross = participation regime flip · &gt; +60 overbought thrust (strength, not a short) · &lt; −60 oversold washout (arms the thrust registry) · divergence vs price = distribution warning — condition #3 of the DTOP fingerprint</span>'),{});
  /* (d) sector rotation quadrant */
  h+=panel('SECTOR ROTATION QUADRANT — RRG twin','RS-ratio × RS-momentum · 4-step trails · rotation runs clockwise · <span class="demo-wm">demo twin</span>',
    '<canvas id="mktd-rrg" class="cv" style="height:340px"></canvas>'+
    '<div class="btnrow" style="margin-top:8px"><button class="btn sm'+(MKTD_STATE.trails?' pri':'')+'" data-cmd="intern.trails">'+(MKTD_STATE.trails?'✓ ':'')+'4-step trails</button>'+
      '<span class="pill">LEADING '+N.leading+'/11 — composite input w 0.10</span></div>'+
    kv('LEADING','<span style="font-size:11px">'+U.esc(MKTD_QDOC.LEADING)+'</span>')+
    kv('WEAKENING','<span style="font-size:11px">'+U.esc(MKTD_QDOC.WEAKENING)+'</span>')+
    kv('LAGGING','<span style="font-size:11px">'+U.esc(MKTD_QDOC.LAGGING)+'</span>')+
    kv('IMPROVING','<span style="font-size:11px">'+U.esc(MKTD_QDOC.IMPROVING)+'</span>'));
  h+='</div>';
  const mcArr=mktdMc();
  mktdStrip('mktd-mcosc',170,mcArr.slice(-MKTD_STATE.mcN).map(v=>Math.round(v)),{zero:true,bars:true,thrHi:60,thrLo:-60,stamp:'last '+MKTD_STATE.mcN+' sessions · zones ±60 (ratio-adjusted convention)'});
  mktdDrawRRG('mktd-rrg');
  /* RRG binding table — the clickable legend */
  h+=panel('ROTATION LEDGER — every sector bound to its quadrant','the legend is the table; click a row for the full sector read (intern.sector)',
    tbl(['Sector','>RS-ratio','>RS-mom','Quadrant','Desk note'],
      MKTD_SECTORS.map(s=>{
        const q=mktdQuad(s);
        return'<tr class="click" data-cmd="intern.sector" data-arg="'+s.etf+'">'+
          '<td><b class="mono">'+s.etf+'</b> <span class="i2" style="font-size:10px">'+U.esc(s.nm)+'</span></td>'+
          '<td class="r num">'+U.fmt(s.rs,1)+'</td><td class="r num">'+U.fmt(s.rm,1)+'</td>'+
          '<td>'+chip(q,q==='LEADING'?'ch-ok':q==='WEAKENING'?'ch-warn':q==='LAGGING'?'ch-blk':'ch-info','●')+'</td>'+
          '<td class="i1" style="font-size:10.5px">'+U.esc(s.note)+'</td></tr>';
      }).join('')),{flush:true});
  /* highs/lows + extremes doctrine */
  h+='<div class="grid g2">';
  h+=panel('NEW HIGHS / NEW LOWS — expansion or churn','60-session twin, endpoint pinned to the Regime tab’s 142 / 38 · <span class="demo-wm">demo twin</span>',
    '<canvas id="mktd-nhnl" class="cv" style="height:150px"></canvas>'+
    '<div class="grid g3" style="margin-top:8px">'+
      stat('New highs',N.nh,'same figure as Regime & Macro')+
      stat('New lows',N.nl,'DTOP condition #2 arms above 80')+
      stat('H−L spread','+'+(N.nh-N.nl),'computed — expansion, not churn')+
    '</div>'+
    kv('READ','<span style="font-size:11px">Rising highs against sleepy lows confirms the rotation regime. The dangerous shape is the OTHER one: highs shrinking while lows expand under a flat index — distribution’s signature, visible weeks before price confesses (2021-11-19 exhibit).</span>'));
  h+=panel('EXTREME READINGS PLAYBOOK','extreme readings outrank HTF context in the hierarchy — so each one gets a standing order, decided in advance',
    tbl(['Reading','Threshold','What it means','Standing order'],[
     ['TICK print','≥ +1000','Buy-program exhaustion — strength being spent, not built','On trend days WITH ADD agreeing: confirmation, hold. In chop: fade-side signal at range edges only. NEVER a fresh-long trigger.'],
     ['TICK print','≤ −1000','Sell-program flush — the washout candidate','Cover-side signal, not a knife-catch license (FM-KNIFE). Longs still need structure + a trapped side (LAW-003).'],
     ['McClellan','> +60','Overbought THRUST — strength, statistically early not late','Do not short it. Tighten laggard longs; thrust strength burns top-callers first.'],
     ['McClellan','< −60','Oversold washout','Arms the thrust registry. Shorts stop adding; the exit signal is being built underneath them.'],
     ['Composite','crosses 70 ↓','Band demotion FULL → SELECTIVE','A-grades only, default risk 0.6% — automatic posture, not a debate '+prov('risk.loss_ladder_step'),],
     ['VOLD','intraday flip of sign','Conviction reversed mid-session','Re-run TODAY’S MATCH before the next entry — the regime label is stale by definition (LAW-015: arithmetic over prose).'],
    ].map(r=>'<tr><td class="mono" style="font-size:10.5px"><b>'+r[0]+'</b></td><td class="r num">'+r[1]+'</td><td class="i1" style="font-size:10.5px">'+r[2]+'</td><td class="i2" style="font-size:10.5px">'+r[3]+'</td></tr>').join('')),{flush:true});
  h+='</div>';
  mktdDrawNhNl('mktd-nhnl');
  h+='<div class="grid g2">';
  /* (e) credit & rates stress */
  h+=panel('CREDIT & RATES STRESS','the slow tape that overrules the fast one · <span class="demo-wm">demo twins</span>',
    tbl(['Input','>Level','Trend','What it gates'],
      MKTD_CREDIT.map(c=>'<tr><td><b style="font-size:11.5px">'+c.k+'</b></td><td class="r num">'+c.v+'</td><td class="mono" style="font-size:10px">'+U.esc(c.tr)+'</td><td class="i1" style="font-size:10.5px">'+U.esc(c.gate)+'</td></tr>').join(''))+
    '<div class="i2" style="font-size:10.5px;padding:8px 12px">Credit is context-tier in the hierarchy — it never triggers an entry, but at extremes it re-weights everything above it. The 2024-08-05 carry unwind is the standing exhibit: USDJPY moved before the equity open did.</div>',{flush:true});
  /* (f) risk-on/off composite */
  h+=panel('RISK-ON/OFF COMPOSITE — '+comp.total+'/100','weighted sum of the named inputs above · weights displayed, not implied '+prov('LAW-015'),
    '<canvas id="mktd-dial" class="cv" style="height:200px"></canvas>'+
    tbl(['Input','>Reading','Map (lo→0 · hi→100)','>Score','>Weight','>w×s'],
      comp.rows.map(r=>'<tr><td style="font-size:11px">'+U.esc(r.k)+'<div class="i2" style="font-size:9.5px">'+U.esc(r.src)+'</div></td>'+
        '<td class="r num">'+r.v+r.u+'</td>'+
        '<td class="mono" style="font-size:9.5px">'+r.lo+' → 0 · '+r.hi+' → 100</td>'+
        '<td class="r num">'+r.s+'</td><td class="r num">'+U.fmt(r.w,2)+'</td>'+
        '<td class="r num"><b>'+U.fmt(r.ws,1)+'</b></td></tr>').join('')+
      '<tr style="background:var(--live-bg)"><td colspan="4"><b>COMPOSITE = Σ w×s</b> <span class="i2" style="font-size:9.5px">weights sum to 1.00 · worked example: '+U.esc(comp.rows[0].calc)+'</span></td><td class="r num">1.00</td><td class="r num"><b>'+comp.total+'</b></td></tr>')+
    '<div style="padding:0 12px 4px">'+
    kv('&gt; 70 — FULL RISK BUDGET','<span style="font-size:11px">'+ck('risk.max_trade_risk_pct')+'% per idea at face '+prov('risk.max_trade_risk_pct')+' up to '+ck('risk.max_open_risk_R')+'R aggregate '+prov('risk.max_open_risk_R')+' · all promoted playbooks eligible · counter-regime stays paper — that never moves with mood</span>')+
    kv('40 – 70 — SELECTIVE','<span style="font-size:11px">A-grades only · default risk 0.6% · promotion budget spends slower — the funnel keeps rejecting for you</span>')+
    kv('&lt; 40 — DEFENSIVE','<span style="font-size:11px">ladder risk DOWN '+ck('risk.loss_ladder_step')+'%/rung per MM-004 '+prov('risk.loss_ladder_step')+' · longs need extreme readings + thrust evidence · shorts run the RISK-OFF playbook sized for gap risk</span>')+
    '<div class="btnrow" style="margin-top:8px">'+CMD.btn('intern.snapshot',null,'gold','⭳ Snapshot → audit ledger')+CMD.btn('intern.export',null,'sm','Export internals JSON')+'</div>'+
    '<div class="i2" style="font-size:10px;margin-top:6px">S08 publishes 72/100 on the Regime tab from the same input family — small deltas are timing, not disagreement. If they diverge &gt; 15pts, one of them is wrong: file it.</div></div>',{flush:true});
  h+='</div>';
  mktdDrawDial('mktd-dial',comp.total,comp.band.nm);
  /* composite history + band sensitivity */
  h+='<div class="grid g2">';
  const chist=mktdCompHist();
  h+=panel('COMPOSITE BACKCAST — 60 sessions','breadth-family inputs only (0.50 of weight); tape & credit held at neutral 55 — the SHAPE is the product, honestly scoped',
    '<canvas id="mktd-comphist" class="cv" style="height:150px"></canvas>'+
    '<div class="grid g3" style="margin-top:8px">'+
      stat('70-line breaks ↓',chist.crossDn,'computed from the series — each one demoted the band')+
      stat('70-line reclaims ↑',chist.crossUp,'computed — includes the post-washout thrust window')+
      stat('Today (full inputs)',comp.total+'/100','the dial above, all nine inputs live')+
    '</div>'+
    kv('READ','<span style="font-size:11px">The washout → thrust arc the McClellan and thrust panels found is visible here as the deep trough and the violent reclaim. Band crossings are posture changes, not predictions — the composite tells you how much risk the DESK runs, never where the MARKET goes.</span>'));
  const sens=mktdSensitivity(comp);
  h+=panel('BAND SENSITIVITY — what flips '+comp.total+' below '+(sens.edge||'—')+', alone','pure arithmetic on the weights table: needed score drop = (total − edge) ÷ weight, holding all else constant '+prov('LAW-015'),
    (sens.edge===null?'<div class="empty"><div class="e1">ALREADY DEFENSIVE</div>No lower band exists — the ladder doctrine owns sizing from here.</div>':
    tbl(['Input','>Now','Single-input flip point',''],
      sens.rows.map(r=>'<tr'+(r.can?'':' class="dim"')+'>'+
        '<td style="font-size:11px">'+U.esc(r.k)+'</td>'+
        '<td class="r num">'+r.v+r.u+'</td>'+
        '<td class="mono" style="font-size:10.5px">'+(r.can?r.dir+' <b>'+r.vAt+r.u+'</b>':'cannot flip the band alone — weight too small')+'</td>'+
        '<td>'+(r.can?chip('WATCH LEVEL','ch-warn','!'):chip('COMPOSITE-ONLY','ch-mut','·'))+'</td></tr>').join(''))+
    '<div class="i2" style="font-size:10.5px;padding:8px 12px">Margin above the '+sens.edge+'-line: <b>'+sens.D+'pts</b>. These are alarm levels for the OPERATOR, not signals: any single input crossing its flip point forces an intraday snapshot (intern.snapshot) and a match re-score — before the next entry, not after.</div>'),{flush:true});
  h+='</div>';
  mktdStrip('mktd-comphist',150,chist.arr,{col:'#D6B25E',thrHi:70,thrLo:40,noDots:true,fmt:v=>String(v),stamp:'composite backcast · 60 sessions · rails at 70 / 40 (band edges)'});
  /* closing g2 — deepen the theme */
  h+='<div class="grid g2">';
  const th=mktdThrust();
  const lastEv=th.ev.length?th.ev[th.ev.length-1]:null;
  const agoS=lastEv?(mktdDailyShare().length-1-lastEv.hi):null;
  h+=panel('BREADTH-THRUST REGISTRY — Zweig scan','EMA₁₀ of ADV/(ADV+DEC): below 0.40 → above 0.615 inside 10 sessions · scan runs on the series, the answer is not stored',
    '<canvas id="mktd-thrust" class="cv" style="height:160px"></canvas>'+
    '<div class="row" style="margin:8px 0">'+
      chip('EMA₁₀ now '+th.cur.toFixed(3),th.cur>0.615?'ch-ok':th.cur<0.40?'ch-blk':'ch-info','●')+
      (th.lastBelow>=0&&mktdDailyShare().length-1-th.lastBelow<=10&&th.cur<=0.615
        ?chip('ARMED — washout live, clock running','ch-warn','!')
        :chip('NOT ARMED — no washout below 0.400 in the last '+(th.lastBelow>=0?(mktdDailyShare().length-1-th.lastBelow):'160+')+' sessions','ch-mut','·'))+
    '</div>'+
    (lastEv?kv('LAST COMPLETED (this series)','T−'+agoS+' sessions: 0.400 → 0.615 in <b>'+lastEv.len+' sessions</b> — found by the scanner in the seeded series (shaded on the canvas)'):kv('LAST COMPLETED','none inside the 160-session series'))+
    kv('WHY IT MATTERS','A completed thrust is the single strongest un-confirmation of a DISTRIBUTION TOP read the desk knows — it retires that playbook on the spot (see Playbooks → handoff map).')+
    tbl(['Vintage','EMA₁₀ path','Window','SPX +60d / +250d','Desk note'],
      MKTD_THRUST_VINTAGE.map(r=>'<tr><td class="mono">'+r[0]+'</td><td class="mono" style="font-size:10.5px">'+r[1]+'</td><td class="mono" style="font-size:10.5px">'+r[2]+'</td><td class="r num up">'+r[3]+'</td><td class="i1" style="font-size:10.5px">'+U.esc(r[4])+'</td></tr>').join(''))+
    '<div class="i2" style="font-size:10px;padding:6px 12px 2px"><span class="demo-wm">demo twin</span> vintage dates from the public record; forward stats are rounded desk annotations — verify before citing outside this room.</div>',{flush:true});
  h+=panel('DIVERGENCE LEDGER','a divergence is a named pair with a flip condition — or it is a mood',
    mktdDivergences(N).map(d=>'<div class="kv"><span class="k" style="font-size:10px">'+U.esc(d.pair)+'</span><span class="v">'+
      chip(d.st,d.st==='CONFIRMING'?'ch-ok':d.st==='WATCH'?'ch-warn':'ch-info',d.st==='CONFIRMING'?'✓':'!')+' '+
      '<span style="font-size:11px">'+U.esc(d.read)+'</span>'+
      '<div class="i2" style="font-size:10px;margin-top:2px">FLIPS WHEN: '+U.esc(d.flip)+'</div></span></div>').join('')+
    '<div class="banner info" style="margin-top:8px"><span class="bico">i</span><div style="font-size:11px"><b>Divergence discipline:</b> divergences are conditions, not signals. They load the DTOP fingerprint; they never fire an order. The desk has rejected more “bearish divergence” shorts than any other counter-regime idea class — the paper tier exists for them.</div></div>');
  h+='</div>';
  mktdDrawThrust('mktd-thrust');
  return h;
};

/* ── intern.* commands ── */
CMD.define({id:'intern.sector',label:'Sector read',purpose:'Full sector drawer — quadrant, breadth, trail, promoted names',audit:false,run:a=>{
  const s=MKTD_SECTORS.find(z=>z.etf===a);if(!s)return;
  const q=mktdQuad(s),held=SYMS.filter(y=>(MKTD_SECMAP[a]||[]).includes(y.sector));
  const tr=mktdTrail(s);
  const drift=Math.atan2(s.rm-100,s.rs-100)-Math.atan2(tr[0][1]-100,tr[0][0]-100);
  const rot=drift<0?'rotating clockwise — on schedule toward '+mktdNextQuad(q):'hooking counter-clockwise — early re-rotation, watch for a quadrant re-entry';
  const g=v=>'<div class="row" style="gap:6px"><div class="gauge" style="width:120px"><i style="width:'+v+'%"></i></div><span class="mono" style="font-size:10.5px">'+v+'%</span></div>';
  UI.drawer('<div class="dhead"><span class="dt">'+s.etf+' · '+U.esc(s.nm)+'</span><span class="pill">demo twin · seeded</span><button class="dx" data-cmd="ui.closeDrawer">ESC</button></div>'+
   '<div class="dbody">'+
   '<div style="margin-bottom:10px">'+chip(q,q==='LEADING'?'ch-ok':q==='WEAKENING'?'ch-warn':q==='LAGGING'?'ch-blk':'ch-info','●')+' '+chip(s.adv+' adv / '+s.dec+' dec of '+s.mem,'ch-mut','·')+'</div>'+
   kv('RRG COORDS','RS-ratio <b>'+U.fmt(s.rs,1)+'</b> · RS-momentum <b>'+U.fmt(s.rm,1)+'</b> (100 = market)')+
   kv('TRAIL READ','4-step trail: '+rot)+
   kv('% > 20DMA',g(s.a20))+kv('% > 50DMA',g(s.a50))+kv('% > 200DMA',g(s.a200))+
   kv('QUADRANT DOCTRINE','<span style="font-size:11px">'+U.esc(MKTD_QDOC[q])+'</span>')+
   kv('DESK NOTE','<span style="font-size:11px">'+U.esc(s.note)+'</span>')+
   '<div class="hr"></div>'+
   (held.length
     ?kv('PROMOTED NAMES HERE',held.map(y=>'<button class="btn sm pri" data-cmd="research.open" data-arg="'+y.sym+'">'+y.sym+' · '+U.esc(y.setup)+'</button>').join(' '))
     :kv('PROMOTED NAMES HERE','none — promotion is earned by evidence, never by sector affection'))+
   '<div class="i2" style="font-size:10px;margin-top:8px">Sector reads are context for the funnel, not a side-door into it: a LEADING quadrant raises no one past the eligibility gates (LAW-010).</div>'+
   '</div>');
}});
CMD.define({id:'intern.trails',label:'RRG trails',purpose:'Toggle the 4-step rotation trails on the quadrant canvas',audit:false,run:()=>{
  MKTD_STATE.trails=!MKTD_STATE.trails;render();
}});
CMD.define({id:'intern.mclen',label:'McClellan lookback',purpose:'Recompute the oscillator window (60–160 sessions)',audit:false,run:(a,el)=>{
  MKTD_STATE.mcN=U.clamp(parseInt(el.value)||120,60,160);render();
}});
CMD.define({id:'intern.scrub',label:'Session scrub',purpose:'Replay the seeded session tape from 09:30 — strips and stats recompute',audit:false,run:(a,el)=>{
  MKTD_STATE.scrub=U.clamp(parseInt(el.value)||100,25,100);render();
}});
CMD.define({id:'intern.snapshot',label:'Internals snapshot',purpose:'Write the composite + every component to the audit ledger',run:()=>{
  const c=mktdComposite();
  const parts=c.rows.map(r=>r.sk+' '+r.v+r.u+'→'+r.s).join(' · ');
  SVR.audit('HUMAN (owner)','internals','Internals snapshot — composite '+c.total+'/100 ('+c.band.nm+') · '+parts+' · weights per LAW-015 table');
  UI.toast('Composite '+c.total+'/100 ('+c.band.nm+') + '+c.rows.length+' components written to the audit ledger','gold','INTERNALS');
  render();
}});
CMD.define({id:'intern.export',label:'Export internals',purpose:'Download the full internals snapshot as JSON — a real file, honestly labeled',run:()=>{
  const c=mktdComposite(),t=mktdTickS(),th=mktdThrust();
  const bundle={
    exported:CLOCK.hms()+' ET (sim)',seed:ck('demo.seed'),
    honesty:'DEMO twin — seeded, deterministic, watermarked. Math (EMA/thrust/composite) is real; series are synthetic.',
    composite:{total:c.total,band:c.band.nm,components:c.rows.map(r=>({k:r.sk,reading:r.v,unit:r.u,map:[r.lo,r.hi],score:r.s,weight:r.w,contrib:+r.ws.toFixed(1)}))},
    sectors:MKTD_SECTORS.map(s=>({etf:s.etf,quad:mktdQuad(s),a20:s.a20,a50:s.a50,a200:s.a200,adv:s.adv,dec:s.dec,rs:s.rs,rm:s.rm})),
    tape:{tick:{n:t.arr.length,mean:t.mean,last:t.last,max:t.max,min:t.min},add:{last:mktdAddS().last},voldM:{last:mktdVoldS().last}},
    mcclellan:Math.round(mktdMc()[mktdMc().length-1]),
    thrust:{ema10:+th.cur.toFixed(3),events:th.ev.length,lastLen:th.ev.length?th.ev[th.ev.length-1].len:null},
  };
  const blob=new Blob([JSON.stringify(bundle,null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='ATLAS_internals_snapshot_demo.json';a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),4000);
  SVR.audit('HUMAN (owner)','export','Internals JSON exported — composite '+c.total+'/100, '+MKTD_SECTORS.length+' sectors, tape stats, thrust scan');
  UI.toast('Internals snapshot downloaded — honestly labeled DEMO inside the file','ok','EXPORT');
}});

/* ═══════════ REGIME PLAYBOOK LIBRARY — five-year desk memory, per regime ═══════════
   Six playbooks. Each: fingerprint (named conditions with thresholds, scored
   live against mktdNow), ranked hunts with per-playbook backtest blocks
   (demo twins), named failure modes, sizing posture citing config keys, and
   historical analog sessions. Hunts reproduce the expectancy grid exactly —
   one corpus, one truth. */
const MKTD_PLAYBOOKS=[
 {id:'RON',nm:'RISK-ON ROTATION',ico:'▲',bt:'RBT-RON-01 · 2021-03 → 2026-02 replay corpus',
  thesis:'Breadth broad, credit calm, leadership rotating among growth sectors. Buy leaders at structure; shorts are rented, never owned.',
  fp:[
   {c:'Breadth',thr:'> 60% advancers, holding through lunch',key:'advPct',u:'%',map:[40,70]},
   {c:'Vol regime',thr:'VIX < 16 and drifting lower',key:'vix',u:'',map:[22,13]},
   {c:'Leadership width',thr:'≥ 3 sectors in the RRG LEADING quadrant',key:'leading',u:'',map:[0,3]},
   {c:'Credit',thr:'HY OAS flat-to-tighter on 5d',key:'hy5d',u:'bp/5d',map:[15,-15]},
  ],
  hunt:[
   {s:'OTE Continuation',n:148,exp:'+1.61R',win:'38%',pf:'2.3',note:'pullback into 62–79% OTE of a leader’s expansion leg — the bread and butter'},
   {s:'MMBM Reversal',n:131,exp:'+1.21R',win:'34%',pf:'1.9',note:'engineered sweep into HTF discount; first FVG return only'},
   {s:'Silver Bullet',n:88,exp:'+0.87R',win:'29%',pf:'1.7',note:'10:00–11:00 window with a clean draw — long side only in this regime'},
  ],
  avoid:[
   {fm:'FM-FADE-LEADER',txt:'Counter-regime shorts on leaders. The crowd you are fading is not trapped — S08 caps these at paper for a reason (PKT-2228 is today’s live exhibit).'},
   {fm:'FM-CHASE',txt:'Buying the 3rd+ candle of displacement. First-return entries only — 31 tagged cases make this the #1 leak in the taxonomy.'},
   {fm:'FM-LAGGARD-LONG',txt:'Buying LAGGING-quadrant names because they look cheap. Rotation pays leaders first, laggards last — usually never.'},
  ],
  sizing:()=>'Full budget: '+ck('risk.max_trade_risk_pct')+'% per idea '+prov('risk.max_trade_risk_pct')+' up to '+ck('risk.max_open_risk_R')+'R aggregate '+prov('risk.max_open_risk_R')+'. Counter-regime shorts: paper tier, no exceptions on green days.',
  analogs:[
   {d:'2024-07-11',txt:'CPI rotation day — RUT +3.6% vs NDX −2.2%. Rotation so violent it read as risk-off in the leaders; the regime label held because breadth EXPANDED.'},
   {d:'2023-11-02',txt:'Post-FOMC relief rotation: 85% advancers, leaders gapped and held. First-return FVG entries filled; chasers bought leg one’s top tick.'},
   {d:'2026-03-04',txt:'Semis-led rotation, VIX 13s: OTE pullback longs paid 3 of 3 on the desk; the one counter-regime short idea stopped flat at paper.'},
  ],
  doc:{
   read:'Rotation is the market’s way of resting without falling. Money moves BETWEEN leading sectors instead of leaving. The tell is breadth holding while individual leaders take turns pulling back — the index chops, the leaders alternate, and laggards stay lagging.',
   protocol:['Confirm the fingerprint before the first trade, not after (four conditions, scored above).','Hunt ONLY the ranked list — the grid says everything else pays worse here.','Enter on structure (OTE / first FVG return), never on displacement candles.','Re-score at lunch: rotation that narrows into 1–2 sectors is DTOP forming, not RON continuing.'],
   wrong:'Wrong when breadth narrows while the index holds — that is DISTRIBUTION TOP wearing this regime’s clothes. The leading-quadrant count is the earliest honest tell.',
  }},
 {id:'ROFF',nm:'RISK-OFF DELEVERAGING',ico:'▼',bt:'RBT-ROFF-01 · 2021-03 → 2026-02 replay corpus',
  thesis:'Correlation goes to one. Everything is sold to fund something — the only longs that work are the ones nobody is forced to sell.',
  fp:[
   {c:'Breadth',thr:'< 35% advancers',key:'advPct',u:'%',map:[55,30]},
   {c:'Volume conviction',thr:'up-volume share ≤ 40%',key:'upVol',u:'%',map:[55,35]},
   {c:'Credit',thr:'HY OAS widening ≥ +15bp on 5d',key:'hy5d',u:'bp/5d',map:[-5,25]},
   {c:'Vol regime',thr:'VIX > 22 and rising',key:'vix',u:'',map:[16,26]},
  ],
  hunt:[
   {s:'Silver Bullet',n:44,exp:'+0.41R',win:'27%',pf:'1.4',note:'short side — window entries at LTF rallies into premium'},
   {s:'MMBM Reversal',n:52,exp:'+0.38R',win:'26%',pf:'1.3',note:'capitulation sweeps at HTF demand ONLY — the trapped side must be shorts'},
  ],
  avoid:[
   {fm:'FM-KNIFE',txt:'Catching the falling knife because a level “should” hold. Levels do not hold in deleveraging — trapped counterparties do, and there are none under forced selling.'},
   {fm:'FM-VEGA-TRAP',txt:'Selling premium into a vol spike. The 0DTE Credit × RISK-OFF cell reads −0.83R — the standing prohibition class of the grid.'},
   {fm:'FM-BOUNCE-HOPE',txt:'Holding losers through the bounce that must come. It comes; it fails; the stop was cheaper (LAW-011 exists for this tape).'},
  ],
  sizing:()=>'Defensive rung: ladder risk down '+ck('risk.loss_ladder_step')+'%/rung per MM-004 '+prov('risk.loss_ladder_step')+'. Shorts earn full size only after LTF confirmation; longs are paper until a thrust completes. Event blackouts still bind '+prov('risk.event_window_hrs')+'.',
  analogs:[
   {d:'2024-08-05',txt:'Yen carry unwind — VIX 65 print at the open. USDJPY moved before equities did; the carry proxy on the Internals tab is this session’s scar tissue.'},
   {d:'2025-04-03',txt:'Tariff shock day one of the −12% week: breadth 9% advancers, VOLD 1:11. Every knife-catch long journaled that week lost.'},
   {d:'2022-09-13',txt:'CPI shock, SPX −4.3%: gap down, one VWAP kiss, trend to the close — the archetype the TDD playbook inherits.'},
  ],
  doc:{
   read:'Deleveraging is not opinion-driven selling; it is balance-sheet-driven selling. Nobody is choosing to sell — they are being made to. That is why levels fail and why the only reliable longs come AFTER a completed breadth thrust, never during the slide.',
   protocol:['Gross down first, opinions after — the ladder rung is not a debate (MM-004).','Short rallies, not breakdowns: entries at LTF premium with the window model.','Track USDJPY and HY OAS intraday — they lead equity legs in this regime.','Arm the thrust registry; the EXIT from this regime is the best long signal the desk knows.'],
   wrong:'Wrong when VOLD flips positive before price stabilizes — short-covering statistics precede real bids, but a VOLD flip + breadth > 45% means the forced seller is done. Stop shorting the moment the fingerprint breaks; do not argue with the thrust.',
  }},
 {id:'CHOP',nm:'CHOP COMPRESSION',ico:'◫',bt:'RBT-CHP-01 · 2021-03 → 2026-02 replay corpus',
  thesis:'Nobody is in charge. Range edges are the only structure with a trapped side — everything in the middle is noise priced as signal.',
  fp:[
   {c:'Breadth',thr:'pinned 45–55% — no side in control',key:'advPct',u:'%',band:[50,15]},
   {c:'TICK envelope',thr:'no prints beyond ±1000; envelope inside ±600',key:'tickAbsMax',u:'',map:[1200,500]},
   {c:'Range',thr:'session range ≤ 70% of 20d ADR',key:'adrPct',u:'%',map:[110,60]},
   {c:'McClellan',thr:'|oscillator| < 25 — no thrust either way',key:'mcAbs',u:'',map:[60,10]},
  ],
  hunt:[
   {s:'0DTE Credit',n:118,exp:'+0.68R',win:'74%',pf:'1.8',note:'defined-risk structures at range extremes · MOC blackout 15:45–16:00 (LS-117 · EVT-014)'},
   {s:'PD Array Rotation',n:71,exp:'+0.44R',win:'47%',pf:'1.5',note:'premium→discount rotation inside the dealing range — edges only'},
   {s:'MMBM Reversal',n:39,exp:'+0.31R',win:'31%',pf:'1.3',note:'range-edge sweeps only; mid-range “sweeps” have no trapped side (LAW-003)'},
  ],
  avoid:[
   {fm:'FM-FIRST-MOVE-FAKE',txt:'Trading the first breakout of compression. The first move fakes more often than it follows — entries stay structural or stay home.'},
   {fm:'FM-OVERTRADE',txt:'Manufacturing signal from noise because the screen is open. Chop is where the day-loss breaker gets fed 0.2R at a time (LAW-011).'},
   {fm:'FM-MID-RANGE',txt:'Any entry in the middle third of the range. No draw, no trapped side, no trade — three laws short of a setup.'},
  ],
  sizing:()=>'Half-size scalps with hard time-stops; default risk 0.5% against the '+ck('risk.max_trade_risk_pct')+'% cap '+prov('risk.max_trade_risk_pct')+'. 0DTE credit obeys the MOC blackout (LS-117). A NO_TRADE day is a WIN in this regime — journal it as one (LAW-018).',
  analogs:[
   {d:'2023-08-15',txt:'August doldrums: 11 straight sessions inside a 1.4% band. The desk’s only positive week came from 0DTE credit at the edges and nothing else.'},
   {d:'2024-06-10',txt:'Pre-FOMC compression: three overlapping dojis; every breakout attempt round-tripped by the close. FM-FIRST-MOVE-FAKE earned its name here.'},
   {d:'2025-07-08',txt:'Summer grind, VIX 12s: expectancy outside the killzones went negative — the lunch-throttle evidence (MM-LUNCH-001 lineage) came from this stretch.'},
  ],
  doc:{
   read:'Compression is information about WHO IS ABSENT: institutions. Without their flow there is no follow-through, so edges (where late breakout traders get trapped) are the only tradeable structure. Compression’s one gift is that it ends — and the break, when real, carries the VOLD signature.',
   protocol:['Mark the range on the 4H first; the intraday range is inside it or the read is wrong.','Trade edges toward the middle, never the middle toward the edges.','Cap the day at 3 attempts — the breaker is not a scoreboard (LAW-011).','Watch for the handoff: a range break WITH VOLD ≥ 3:1 and breadth leaving the 45–55 band is the TDU/TDD fingerprint arriving.'],
   wrong:'Wrong the moment range extremes stop producing reactions — un-reacted edge touches mean someone big is absorbing. That is accumulation or distribution, and the break will trend.',
  }},
 {id:'TDU',nm:'TREND DAY UP',ico:'⇗',bt:'RBT-TDU-01 · 2021-03 → 2026-02 replay corpus',
  thesis:'One-way participation from the open. The market is repricing, not rotating — pullbacks are gifts and they are shallow.',
  fp:[
   {c:'Cumulative A-D',thr:'ADD > +1500 by 10:00 and rising',key:'addLast',u:'',map:[500,2000]},
   {c:'Volume conviction',thr:'VOLD skew ≥ 3:1 up',key:'vold',u:':1',map:[1,3]},
   {c:'TICK regime',thr:'one-sided — session mean > +400',key:'tickMean',u:'',map:[0,400]},
   {c:'Range expansion',thr:'session range ≥ 130% of 20d ADR by noon',key:'adrPct',u:'%',map:[80,150]},
  ],
  hunt:[
   {s:'OTE Continuation',n:57,exp:'+1.94R',win:'41%',pf:'2.7',note:'FIRST pullback after the initial impulse — the best cell in the entire grid'},
   {s:'Breaker Retest',n:33,exp:'+0.91R',win:'36%',pf:'1.9',note:'breakout-seller traps fund the afternoon leg'},
   {s:'Silver Bullet',n:28,exp:'+0.66R',win:'32%',pf:'1.6',note:'window entries WITH the trend only'},
  ],
  avoid:[
   {fm:'FM-TOP-CALL',txt:'Fading “because it’s extended.” The #1 R-destroyer on trend days — extension is the signal, not the fade. TICK +1000 prints here are confirmation WHEN ADD agrees.'},
   {fm:'FM-DEEP-WAIT',txt:'Waiting for the deep pullback that never comes. Trend-day pullbacks are one killzone wide, not one PD-array deep.'},
   {fm:'FM-LATE-DOUBT',txt:'Cutting runners at lunch out of disbelief. Trend days close near the extreme more often than they revert — the FSM owns the runner, not your nerves.'},
  ],
  sizing:()=>'Full size on the first pullback per '+ck('risk.max_trade_risk_pct')+'% '+prov('risk.max_trade_risk_pct')+'; adds per template only — never counter, never averaged (LAW-012: the prior candle’s P&L does not size the next one). Time-stop scalps at 13:45 if FOMC minutes land (today’s calendar).',
  analogs:[
   {d:'2024-11-06',txt:'Post-election gap-and-go: ADD pinned above +2000 all session, zero −400 TICK prints after 10:00. Every fade journaled that day lost; both OTE pullbacks paid full template.'},
   {d:'2023-11-14',txt:'Soft-CPI thrust: ~90% upside volume. The open drive WAS the pullback — waiting for a retrace cost the whole move.'},
   {d:'2025-04-09',txt:'The +9.5% squeeze. Shorted twice by the crowd, closed at highs. Trend-day doctrine is regime-agnostic: it fired inside a bear tape and still paid.'},
  ],
  doc:{
   read:'A trend day is the market moving FROM one accepted value TO another — not an auction around value. That is why responsive (fade) trades fail structurally: there is no “rich” or “cheap” inside a repricing, only early and late.',
   protocol:['Recognize by 10:00 or stand down — the fingerprint is an OPEN condition, not a hindsight label.','One direction only for the session; counter ideas go to the journal, not the book.','First pullback gets the size; later entries get scraps or nothing.','Hold the runner to the close unless structure breaks — the close IS the target on trend days.'],
   wrong:'Wrong if ADD stalls and VOLD decays under 2:1 by 11:00 — that is an open drive dying into rotation. Downgrade to RON hunts and cut the trend-day sizing immediately.',
  }},
 {id:'TDD',nm:'TREND DAY DOWN',ico:'⇘',bt:'RBT-TDD-01 · 2021-03 → 2026-02 replay corpus',
  thesis:'The mirror with worse manners: faster, gappier, more prone to violent squeezes that change nothing. Sell rallies to VWAP; respect the gap.',
  fp:[
   {c:'Cumulative A-D',thr:'ADD < −1500 and falling',key:'addLast',u:'',map:[-500,-2000]},
   {c:'Volume conviction',thr:'up-volume share ≤ 25% (VOLD ≤ 1:3)',key:'upVol',u:'%',map:[45,25]},
   {c:'TICK regime',thr:'session mean < −400 — sell programs stacked',key:'tickMean',u:'',map:[0,-400]},
   {c:'VWAP behavior',thr:'≥ 80% of session below VWAP; bounces die there',key:'belowVwap',u:'%',map:[30,80]},
  ],
  hunt:[
   {s:'MMBM Reversal',n:41,exp:'+0.55R',win:'30%',pf:'1.5',note:'failed-rally shorts at LTF premium — the trapped side is bottom-fishers'},
   {s:'Silver Bullet',n:26,exp:'+0.49R',win:'29%',pf:'1.5',note:'short-side window entries; the 10:00–11:00 bounce is the entry, not the threat'},
  ],
  avoid:[
   {fm:'FM-KNIFE',txt:'Longs at “support.” Same law as RISK-OFF: no trapped side under forced selling. The knife-catch corpus is 0 for its last 9 attempts.'},
   {fm:'FM-AVERAGING',txt:'Adding to a losing short after a squeeze. Squeezes on down days run 2–3× normal ATR — the add is how a plan becomes a prayer (envelope law: adds forbidden).'},
   {fm:'FM-COVER-PANIC',txt:'Covering the whole book on the first +800 TICK print. One print is a squeeze; a VOLD flip is a regime change. Know which one you are looking at.'},
  ],
  sizing:()=>'Reduced first entries — gap risk owns the overnight, so swings are sized for it or not carried. Risk per idea ≤ 0.6% against the '+ck('risk.max_trade_risk_pct')+'% cap '+prov('risk.max_trade_risk_pct')+'; day breaker '+ck('risk.max_day_loss_R')+'R still binds '+prov('risk.max_day_loss_R')+'.',
  analogs:[
   {d:'2024-12-18',txt:'FOMC dot shock: TICK −1500 cluster into the last hour, closed at the lows. Every VWAP kiss died within 4 minutes — the archetype VWAP-behavior condition comes from this tape.'},
   {d:'2024-08-05',txt:'Carry-unwind open: gap so large the fingerprint completed pre-market. First bounce shorts paid; knife-catchers fed the second leg.'},
   {d:'2025-04-04',txt:'Tariff day two: VOLD 1:9. The lesson filed that week: on TDD, the SECOND rally to VWAP is the higher-quality short — the first one still has real buyers in it.'},
  ],
  doc:{
   read:'Down trends differ from up trends in mechanics, not just sign: margin clerks do not scale out gracefully. Legs are sharper, bounces are more violent, and the close matters more — a defended close at the lows loads the next morning’s gap.',
   protocol:['Confirm ALL four conditions — a big red open alone is not a trend day down.','Short rallies to VWAP/LTF premium; never chase breakdowns into the hole.','Respect squeezes: flat is a position during a +800 TICK print.','Watch the MOC: the imbalance direction is the handoff tell for tomorrow.'],
   wrong:'Wrong when the bounce that “should” die at VWAP closes above it and breadth walks back over 40% — cover, stand down, and let the CHOP or thrust evidence arrive. The squeeze that changes nothing and the reversal that changes everything look identical for 30 minutes.',
  }},
 {id:'DTOP',nm:'DISTRIBUTION TOP',ico:'◔',bt:'RBT-DTP-01 · 2021-03 → 2026-02 replay corpus',
  thesis:'Price makes the highs; participation stops attending them. The index is the last to know — breadth, new lows, and the oscillator resign first.',
  fp:[
   {c:'Breadth trend',thr:'%>50dma falling ≥ 5pts over 5d while index holds highs',key:'a50d5',u:'pt/5d',map:[2,-8]},
   {c:'New lows',thr:'new 52w lows expanding > 80 at index highs',key:'nl',u:'',map:[40,120]},
   {c:'McClellan divergence',thr:'oscillator lower high vs price higher high (gap ≤ −40)',key:'mcDiv',u:'',map:[0,-40]},
   {c:'Leadership width',thr:'LEADING quadrant thinning to ≤ 2 sectors',key:'leading',u:'',map:[5,2]},
  ],
  hunt:[
   {s:'MMBM Reversal',n:48,exp:'+0.64R',win:'31%',pf:'1.6',note:'shorts at swept highs — the trapped side is breakout buyers, finally'},
   {s:'Silver Bullet',n:31,exp:'+0.58R',win:'30%',pf:'1.6',note:'window shorts on failed pushes into premium'},
   {s:'PD Array Rotation',n:27,exp:'+0.37R',win:'41%',pf:'1.4',note:'premium→discount only — the discount→premium leg stops paying first'},
  ],
  avoid:[
   {fm:'FM-LATE-BREAKOUT',txt:'Buying breakouts late in a narrowing tape. The DTOP corpus’ false-breakout rate is 3× the RON rate — thin leadership cannot fund follow-through.'},
   {fm:'FM-EUPHORIA-SIZE',txt:'Sizing up because the index just made a high. The index is the LAST instrument to know. Sizing follows the composite band, not the headline print.'},
   {fm:'FM-TOP-CALL',txt:'Shorting the first divergence. Divergences load the fingerprint; they do not fire it. Tops take weeks — the grid pays patience, not heroism.'},
  ],
  sizing:()=>'Risk-down posture: no new swing longs, runners tighten to structure, no adds. Correlation matters most here — the '+ck('risk.max_sector_exposure')+'% cluster cap '+prov('risk.max_sector_exposure')+' is the difference between a drawdown and an accident when the top completes.',
  analogs:[
   {d:'2021-11-19',txt:'NDX high with ~38% of members above the 50dma. The index took 6 more weeks to top; half the tape was already 20% down. The fingerprint’s reason to exist.'},
   {d:'2025-02-19',txt:'SPX all-time high on 2 leading sectors and expanding new lows. −10% inside six weeks. The desk’s DTOP conditions were 4-for-4 three sessions before the high.'},
   {d:'2024-07-16',txt:'RSP/SPY divergence peak before the August air pocket — the equal-weight tell from the divergence ledger, in the wild.'},
  ],
  doc:{
   read:'Distribution is a process, not a print: institutions sell strength quietly for weeks while the index holds up on a shrinking cast of leaders. The fingerprint is designed to catch the RESIGNATIONS — breadth trend, new lows, oscillator, leadership width — because the index itself will not confess until it is done.',
   protocol:['Score the fingerprint weekly once ANY condition trips; daily once two trip.','Stop initiating swing longs at 2 of 4 conditions — selectivity first, direction later.','Hunt shorts only at swept highs with a trapped side (LAW-003 still rules).','A completed breadth thrust UN-confirms everything — drop the read same-day, without grief.'],
   wrong:'Wrong when breadth re-expands: a thrust or even a quiet %>50dma recovery retires this playbook immediately. A DTOP read held against re-expanding breadth is FM-TOP-CALL with a research budget.',
  }},
];

/* ── TODAY'S MATCH — deterministic scoring of the live NOW readings vs all six fingerprints ── */
function mktdMatch(){
  const N=mktdNow();
  const ms=MKTD_PLAYBOOKS.map(pb=>{
    const cs=pb.fp.map(f=>{
      const x=N[f.key];
      const r=f.band?mktdBandScore(x,f.band[0],f.band[1]):mktdScore(x,f.map[0],f.map[1]);
      return{c:f.c,thr:f.thr,x,u:f.u||'',s:r.s,calc:r.calc};
    });
    const m=Math.round(cs.reduce((a,c)=>a+c.s,0)/cs.length);
    return{pb,cs,m};
  });
  return ms.sort((a,b)=>b.m-a.m);
}
function mktdWhyNot(win,run){
  const weak=[...run.cs].sort((a,b)=>a.s-b.s).slice(0,2);
  const strong=[...win.cs].sort((a,b)=>b.s-a.s).slice(0,2);
  return run.pb.nm+' ('+run.m+'%) fails where it matters: '+
    weak.map(c=>c.c.toLowerCase()+' reads '+c.x+c.u+' against “'+c.thr+'” (subscore '+c.s+')').join('; ')+'. '+
    win.pb.nm+' ('+win.m+'%) is carried by '+
    strong.map(c=>c.c.toLowerCase()+' at '+c.x+c.u+' (subscore '+c.s+')').join(' and ')+
    '. Re-score the moment the failed conditions move — the label follows the arithmetic, never the other way around (LAW-015).';
}

/* ── EXPECTANCY GRID — setup family × regime (scenario-memory twin) ──
   RISK-ON column reproduces the scenario grid on Markets → Regime verbatim.
   Cells ≥ +0.50R are HOME; ≤ −0.40R are BANNED. */
const MKTD_SETUPS=['OTE Continuation','MMBM Reversal','Breaker Retest','Silver Bullet','0DTE Credit','PD Array Rotation'];
const MKTD_REGIMES=[['RON','RISK-ON ROT'],['ROFF','RISK-OFF DELEV'],['CHOP','CHOP COMP'],['TDU','TREND UP'],['TDD','TREND DN'],['DTOP','DISTRIB TOP']];
const MKTD_GRID=[
 [ 1.61,-0.44,-0.12, 1.94,-0.61, 0.22],
 [ 1.21, 0.38, 0.31,-0.28, 0.55, 0.64],
 [ 0.62,-0.21, 0.08, 0.91,-0.18, 0.11],
 [ 0.87, 0.41, 0.14, 0.66, 0.49, 0.58],
 [ 0.51,-0.83, 0.68,-0.22,-0.51, 0.09],
 [ 0.71,-0.09, 0.44,-0.31,-0.26, 0.37],
];
function mktdCellN(si,ri){return 40+parseInt(U.hash8(MKTD_SETUPS[si]+'|'+MKTD_REGIMES[ri][0]),16)%260}

/* ── failure-mode evidence — where a named FM already has tagged desk data ── */
const MKTD_FM_EVID={
 'FM-CHASE':'31 tagged cases — failure Pareto #1 (“Late entry / chasing”, Review → Performance). Fix live: first-return entry gate.',
 'FM-TOP-CALL':'MHH-H1 lineage — the fade-the-trend leak family; the TDU corpus prices it as the #1 R-destroyer on trend days.',
 'FM-FADE-LEADER':'PKT-2228 is today’s live exhibit — counter-regime short contained at the paper tier (S08 advisory honored).',
 'FM-KNIFE':'0 for its last 9 attempts in the journaled corpus — the cleanest negative record on the board.',
 'FM-OVERTRADE':'Lunch-phase expectancy −0.21R is the published evidence (Review → Performance, MM-LUNCH-001 lineage).',
};

/* ── first 90 minutes — the time-boxed decision tree that feeds the match ── */
const MKTD_T90=[
 ['09:30–09:45','Gap and conviction — is anyone in charge?','first TICK prints · gap vs 20d ADR',
  'One-sided TICK plus a gap ≥ 1% of ADR earns a trend-day WATCH — a watch, not a label. Anything else defaults to rotation until proven.'],
 ['09:45–10:00','Is participation building or capped?','ADD slope into 10:00',
  'ADD beyond ±1500 by 10:00 is TDU/TDD condition #1. Score it; do not feel it. Today: '+'ADD tracked live in the strip above.'],
 ['10:00–10:30','Killzone structure — who just got trapped?','sweeps + displacement (today: the 10:14 Asia-low sweep)',
  'Hunt the leading match’s ranked list ONLY. The window model owns entries; the first return owns timing.'],
 ['10:30–11:00','Confirm or re-score','VOLD vs 3:1 · breadth vs the 45–55 band',
  'Rotation vs trend day is decided by VOLD, not by feel. File the match to the ledger (playbk.match) before the next entry.'],
 ['11:00 →','Lunch throttle','phase expectancy −0.21R (Review → Performance)',
  'A-grades only after 11:00 — the post-11:00 gate lives in AI Memory’s learning queue, and the evidence bar already exists.'],
];

/* ── playbook × killzone modifiers — phase bases from Review → Performance ── */
const MKTD_KZ=[
 ['RON','prime window — phase base +1.38R; today’s top two hunts fire here','throttle — rotation chop bleeds the breaker 0.2R at a time','second shift, +0.94R base — smaller size, identical rules'],
 ['ROFF','sell the first failed bounce, not the open print','lunch squeezes trap both directions — flat is a position','MOC pressure window — the imbalance does the desk’s work'],
 ['CHOP','edges only; the opening fake is the tuition','the regime’s natural habitat — the 0DTE credit hour','pin risk into MOC — blackout 15:45–16:00 (LS-117 · EVT-014)'],
 ['TDU','recognition + first pullback — this window IS the trade','trend holds or dies here; the ADD plateau is the tell','close near highs is the target — the runner rides to it'],
 ['TDD','gap policy decides everything before the first entry','VWAP kisses die here or the read is wrong','defended lows load tomorrow’s gap — watch the MOC print'],
 ['DTOP','failed pushes at the highs print in the AM window','distribution is quiet at lunch — no signal IS the signal','late-day breadth bleed is the honest read of the close'],
];

/* ── playbook violation log — bound to the live JOURNAL store (LAW-018) ── */
const MKTD_VIOLMAP=[
 {ref:'PKT-2226',pb:'RISK-ON ROTATION',rule:'§avoid FM-CHASE — first-return entries only, never the 4th candle',
  verdict:'CAUGHT PRE-ORDER',cost:'0R — the gate paid for itself',
  note:'The chasing filter fired before capital moved. Violation attempted by the idea, prevented by the machine.'},
 {ref:'PKT-2228',pb:'RISK-ON ROTATION',rule:'§avoid FM-FADE-LEADER — counter-regime shorts',
  verdict:'CONTAINED AT PAPER',cost:'paper-tier risk only',
  note:'A regime-posture violation honored at the paper ceiling (S08 advisory). The pressure valve working as designed, not an exception granted.'},
 {ref:'PKT-2211',pb:'(all regimes)',rule:'LAW-004 — realistic 5R against the TRUE structural stop',
  verdict:'REJECTED · CORRECT',cost:'passed on a 2.8R runner — correctly',
  note:'A “winner” below the bar is still a bad trade. Rejection quality is measured against the counterfactual, and this one measures clean.'},
 {ref:'TRD-0894',pb:'TREND DAY UP',rule:'clean run — 25/50/75 executed to template',
  verdict:'CLEAN',cost:'+5.4R',
  note:'Control row: the log exists to hold zero-violation rows too, or it is a blame ledger instead of an instrument.'},
];

/* ── regime handoff map — how regimes end, and what the first day costs ── */
const MKTD_HANDOFF=[
 ['RISK-ON ROTATION','CHOP (digestion) · DISTRIBUTION TOP (the expensive one)',
  'LEADING count < 3 · McClellan lower highs vs price · HY 5d flips wider',
  'Stop adding. Runners keep working; new risk waits for a re-score above 60%.'],
 ['RISK-OFF DELEVERAGING','CHOP (exhaustion) · TREND UP (thrust reversal off the washout)',
  'TICK stops printing < −1000 · VOLD flips before price · thrust registry arms (EMA₁₀ < 0.40)',
  'The first green day is a short-covering statistic, not a regime. Longs need the thrust to COMPLETE (0.615 line), not begin.'],
 ['CHOP COMPRESSION','whichever side breaks with VOLD ≥ 3:1',
  'range edge + volume conviction + breadth leaving the 45–55 band together',
  'The first true break after compression is the highest-payoff handoff on the board — and the fake rate is why entries stay structural anyway.'],
 ['TREND DAY UP','RISK-ON ROTATION (digestion up) · CHOP',
  'ADD plateaus · VOLD skew decays under 2:1 into the close',
  'Do not carry trend-day sizing into the next session — the prior tape does not size the next trade (LAW-012).'],
 ['TREND DAY DOWN','RISK-OFF DELEVERAGING · CHOP (stabilization)',
  'MOC imbalance direction · whether the close is defended at the lows',
  'Gap risk owns the overnight: swings are sized for it or not carried at all.'],
 ['DISTRIBUTION TOP','RISK-OFF DELEVERAGING (the payoff) · RISK-ON ROTATION (failed signal)',
  'new-lows expansion confirms · a completed breadth thrust UN-confirms',
  'A distribution read that fails must be dropped same-day, without grief — held against re-expanding breadth it is FM-TOP-CALL with a research budget.'],
];

/* ── playbook card renderer ── */
function mktdCard(m,winnerId){
  const pb=m.pb,armed=MKTD_STATE.armed===pb.id;
  let b='<div class="panel'+(pb.id===winnerId?' gold':'')+'"><div class="ph">'+
    '<span class="t">'+pb.ico+' '+pb.nm+'</span><span class="spacer"></span>'+
    (armed?chip('ARMED','ch-live','◆'):'')+
    chip('match '+m.m+'%',m.m>=60?'ch-ok':m.m>=35?'ch-info':'ch-mut','◆')+
    '</div><div class="pb">';
  b+='<div class="i1" style="font-size:11.5px;line-height:1.55;margin-bottom:8px">'+U.esc(pb.thesis)+'</div>';
  b+='<div class="kick" style="font-family:var(--mono);font-size:9px;letter-spacing:1.2px;color:var(--ink2);margin:2px 0 4px">FINGERPRINT — scored live</div>';
  b+=m.cs.map(c=>'<div class="kv"><span class="k" style="font-size:9.5px">'+U.esc(c.c)+'</span>'+
    '<span class="v" style="font-size:11px">'+U.esc(c.thr)+' · now <b class="mono">'+c.x+c.u+'</b> → '+
    '<span class="mono '+(c.s>=60?'up':c.s>=30?'i1':'dn')+'">'+c.s+'</span></span></div>').join('');
  b+='<div class="kick" style="font-family:var(--mono);font-size:9px;letter-spacing:1.2px;color:var(--ink2);margin:8px 0 4px">HUNT — ranked · '+U.esc(pb.bt)+' · <span class="demo-wm">demo twin</span></div>';
  b+=tbl(['Setup','>n','>Exp','>Win','>PF'],
    pb.hunt.map(hh=>'<tr title="'+U.esc(hh.note)+'"><td style="font-size:11px">'+hh.s+'</td><td class="r num">'+hh.n+'</td><td class="r num up">'+hh.exp+'</td><td class="r num">'+hh.win+'</td><td class="r num">'+hh.pf+'</td></tr>').join(''));
  if(pb.hunt.length<3)b+='<div class="i2" style="font-size:10px;margin-top:2px">Everything else in this regime’s grid column is negative — a short hunt list is the honest one.</div>';
  b+='<div class="kick" style="font-family:var(--mono);font-size:9px;letter-spacing:1.2px;color:var(--ink2);margin:8px 0 4px">AVOID — named failure modes</div>';
  b+=pb.avoid.map(av=>'<div class="kv"><span class="k mono" style="font-size:9px;color:var(--neg)">'+av.fm+'</span><span class="v" style="font-size:10.5px">'+U.esc(av.txt)+'</span></div>').join('');
  b+=kv('SIZING','<span style="font-size:10.5px">'+pb.sizing()+'</span>');
  b+='<div class="kick" style="font-family:var(--mono);font-size:9px;letter-spacing:1.2px;color:var(--ink2);margin:8px 0 4px">ANALOG SESSIONS — public dates · desk annotations are demo twin</div>';
  b+=pb.analogs.map(an=>'<div class="kv"><span class="k mono" style="font-size:9.5px">'+an.d+'</span><span class="v i1" style="font-size:10.5px">'+U.esc(an.txt)+'</span></div>').join('');
  b+='<div class="btnrow" style="margin-top:9px">'+
    '<button class="btn sm pri" data-cmd="playbk.open" data-arg="'+pb.id+'">Full doctrine</button>'+
    '<button class="btn sm'+(armed?'':' gold')+'" data-cmd="playbk.arm" data-arg="'+pb.id+'">'+(armed?'Disarm':'◆ Arm as session playbook')+'</button>'+
    '</div>';
  return b+'</div></div>';
}

/* ═══════════ VIEW · MARKETS / PLAYBOOKS — regime playbook library ═══════════ */
VIEWS['markets.playbooks']=function(){
  const ms=mktdMatch();
  const win=ms[0],run=ms[1];
  const armedPb=MKTD_PLAYBOOKS.find(p=>p.id===MKTD_STATE.armed);
  let h=vhead('MARKETS · regime playbook library','What works, per regime — five-year desk memory',
    'The regime outranks single-name enthusiasm; the playbook is the regime made operational. Fingerprints are scored against the live Internals arithmetic — the winner is computed, never chosen. '+prov('AX-M7','Axiom M7 — higher timeframes justify; lower timeframes trigger. The regime is the desk’s highest timeframe.'),
    (armedPb?chip('ARMED · '+armedPb.nm,'ch-live','◆'):chip('no session playbook armed','ch-mut','·')));
  /* (b) today's match */
  h+=panel('TODAY’S MATCH — current tape vs all six fingerprints','deterministic: same NOW readings as the Internals composite · subscores per condition, arithmetic visible',
    tbl(['#','Playbook','Condition subscores','Match',''],
      ms.map((m,i)=>'<tr'+(i===0?' style="background:var(--live-bg)"':'')+'>'+
        '<td class="mono">'+(i+1)+'</td>'+
        '<td><b style="font-size:11.5px">'+m.pb.ico+' '+m.pb.nm+'</b>'+(MKTD_STATE.armed===m.pb.id?' '+chip('ARMED','ch-live','◆'):'')+'</td>'+
        '<td class="mono" style="font-size:10.5px">'+m.cs.map(c=>'<span class="'+(c.s>=60?'up':c.s>=30?'i1':'dn')+'" title="'+U.esc(c.c+' · '+c.thr+' · now '+c.x+c.u+' · '+c.calc)+'">'+c.s+'</span>').join(' · ')+'</td>'+
        '<td style="min-width:130px"><div class="row" style="gap:8px"><div class="gauge" style="flex:1"><i style="width:'+m.m+'%"></i></div><b class="mono">'+m.m+'%</b></div></td>'+
        '<td>'+(i===0?chip('WINNER','ch-ok','✓'):'')+'</td></tr>').join(''))+
    '<div class="grid g2" style="padding:10px 12px 0">'+
    '<div>'+
      '<div class="kick" style="font-family:var(--mono);font-size:9px;letter-spacing:1.2px;color:var(--ink2);margin-bottom:4px">WINNER ARITHMETIC — '+win.pb.nm+'</div>'+
      win.cs.map(c=>kv(c.c.toUpperCase(),'<span style="font-size:10.5px">'+U.esc(c.thr)+' · now <b>'+c.x+c.u+'</b><div class="mono i2" style="font-size:9.5px">'+U.esc(c.calc)+'</div></span>')).join('')+
    '</div><div>'+
      '<div class="kick" style="font-family:var(--mono);font-size:9px;letter-spacing:1.2px;color:var(--ink2);margin-bottom:4px">RUNNER-UP ARITHMETIC — '+run.pb.nm+'</div>'+
      run.cs.map(c=>kv(c.c.toUpperCase(),'<span style="font-size:10.5px">'+U.esc(c.thr)+' · now <b>'+c.x+c.u+'</b><div class="mono i2" style="font-size:9.5px">'+U.esc(c.calc)+'</div></span>')).join('')+
    '</div></div>'+
    '<div class="banner gold" style="margin:10px 12px"><span class="bico">◆</span><div style="font-size:11.5px;line-height:1.6"><b>Why '+win.pb.nm+' and not '+run.pb.nm+':</b> '+U.esc(mktdWhyNot(win,run))+'</div></div>'+
    (armedPb&&armedPb.id!==win.pb.id
      ?'<div class="banner warn" style="margin:0 12px 10px"><span class="bico">!</span><div style="font-size:11px"><b>Armed ≠ matched:</b> you are armed on '+armedPb.nm+' but today scores '+win.pb.nm+'. Justify the divergence in the journal or re-arm — an unexamined mismatch is how regime drift starts.</div></div>':'')+
    '<div class="btnrow" style="padding:0 12px 10px">'+CMD.btn('playbk.match',null,'sm','File today’s match → audit ledger')+'</div>',{flush:true});
  /* (a) six playbook cards */
  h+='<div class="grid g2">'+ms.map(m=>mktdCard(m,win.pb.id)).join('')+'</div>';
  /* timing layer — killzones and the first 90 minutes */
  h+='<div class="grid g2">';
  const kzNow=CLOCK.killzone(),phNow=CLOCK.phase();
  const kzCol=kzNow==='NY-AM KILLZONE'?1:kzNow==='NY-PM KILLZONE'?3:phNow==='LUNCH DOLDRUMS'?2:0;
  h+=panel('PLAYBOOK × KILLZONE — when each book is open','phase expectancy bases (+1.38R AM · −0.21R lunch · +0.94R PM) published in Review → Performance · current phase highlighted',
    tbl(['Playbook','NY-AM killzone'+(kzCol===1?' ●':''),'Lunch'+(kzCol===2?' ●':''),'NY-PM killzone'+(kzCol===3?' ●':'')],
      MKTD_KZ.map(r=>{
        const pb=MKTD_PLAYBOOKS.find(p=>p.id===r[0]);
        return'<tr><td><b style="font-size:11px">'+(pb?pb.ico+' '+pb.nm:r[0])+'</b></td>'+
          [1,2,3].map(ci=>'<td class="i1" style="font-size:10.5px'+(ci===kzCol?';background:var(--live-bg)':'')+'">'+U.esc(r[ci])+'</td>').join('')+'</tr>';
      }).join(''))+
    '<div class="i2" style="font-size:10.5px;padding:8px 12px">Now: <b>'+U.esc(phNow)+(kzNow?' · '+kzNow:'')+'</b> · '+CLOCK.hm()+' ET. The killzone column is a modifier on the regime match, never a substitute for it — a great window in the wrong regime is still the wrong trade (AX-M7 ordering).</div>',{flush:true});
  h+=panel('THE FIRST 90 MINUTES — how the match gets built','the fingerprint conditions are OPEN-window questions; this is the order the desk asks them in',
    MKTD_T90.map(r=>{
      const live=(r[0]==='11:00 →'&&CLOCK.mins()>=660)||(r[0]!=='11:00 →'&&(function(){const seg=r[0].split('–');const p=t=>{const[hh,mm2]=t.replace(' →','').split(':').map(Number);return hh*60+mm2};return CLOCK.mins()>=p(seg[0])&&seg[1]&&CLOCK.mins()<p(seg[1])})());
      return'<div class="kv"'+(live?' style="background:var(--live-bg)"':'')+'><span class="k mono" style="font-size:9.5px">'+r[0]+(live?' ●':'')+'</span><span class="v">'+
        '<b style="font-size:11px">'+U.esc(r[1])+'</b>'+
        '<div class="i1" style="font-size:10.5px;margin-top:2px">READ: '+U.esc(r[2])+'</div>'+
        '<div class="i2" style="font-size:10px;margin-top:2px">'+U.esc(r[3])+'</div></span></div>';
    }).join('')+
    '<div class="banner info" style="margin-top:8px"><span class="bico">◈</span><div style="font-size:11px"><b>Sequence discipline:</b> the match is an output, not an opinion. Skipping a checkpoint to trade earlier is how a rotation tape gets traded like a trend day — the most expensive misread in the violation log’s family tree.</div></div>');
  h+='</div>';
  /* (c) expectancy grid */
  h+=panel('EXPECTANCY GRID — setup family × regime','R expectancy per cell · scenario-memory twin ('+SCENARIO.rows+' replays) · click a cell for its doctrine · <span class="demo-wm">demo twin</span>',
    tbl(['Setup family'].concat(MKTD_REGIMES.map(r=>'>'+r[1])),
      MKTD_SETUPS.map((s,si)=>'<tr><td style="font-size:11px"><b>'+s+'</b></td>'+
        MKTD_GRID[si].map((v,ri)=>{
          const home=v>=0.5,ban=v<=-0.4;
          return'<td class="r num click '+(v>=0?'up':'dn')+'" data-cmd="playbk.cell" data-arg="'+si+'|'+ri+'"'+
            ' style="'+(home?'background:rgba(47,214,160,.08)':ban?'background:rgba(242,99,124,.10)':'')+'"'+
            ' title="n='+mktdCellN(si,ri)+' replays · '+(home?'HOME regime':ban?'BANNED cell':'visitor — reduced/paper')+'">'+
            (v>=0?'+':'−')+U.fmt(Math.abs(v),2)+'R'+(ban?' ⛔':'')+'</td>';
        }).join('')+'</tr>').join(''))+
    '<div class="banner info" style="margin:10px 12px"><span class="bico">◈</span><div style="font-size:11.5px;line-height:1.6"><b>Home-regime doctrine '+prov('AX-M7','Axiom M7 — higher timeframes justify; lower timeframes trigger. The regime is the desk’s highest timeframe.')+':</b> higher timeframes justify; lower timeframes trigger — and the regime is the highest timeframe on this desk. A setup fired outside its home regimes (green cells) is a trigger without a justification: visitor cells trade reduced-or-paper, banned cells (⛔) do not trade at all. The RISK-ON column reproduces the scenario grid on Markets → Regime verbatim — one corpus, one truth.</div></div>',{flush:true});
  /* failure-mode index + the armed session contract */
  h+='<div class="grid g2">';
  const fmIdx={};
  MKTD_PLAYBOOKS.forEach(pb=>pb.avoid.forEach(av=>{
    (fmIdx[av.fm]=fmIdx[av.fm]||{fm:av.fm,txt:av.txt,pbs:[]}).pbs.push(pb.ico+' '+pb.nm);
  }));
  h+=panel('FAILURE-MODE INDEX — every named FM, cross-referenced','aggregated from the six §avoid clauses at render time — the index cannot drift from the cards',
    tbl(['FM','Cited by','Tagged evidence'],
      Object.values(fmIdx).map(f=>'<tr><td class="mono" style="font-size:10px;color:var(--neg)"><b>'+f.fm+'</b></td>'+
        '<td class="i1" style="font-size:10.5px">'+f.pbs.join('<br>')+'</td>'+
        '<td class="i2" style="font-size:10.5px">'+U.esc(MKTD_FM_EVID[f.fm]||'— no tagged cases yet; the taxonomy slot exists so the first case has a home')+'</td></tr>').join(''))+
    '<div class="i2" style="font-size:10.5px;padding:8px 12px">'+Object.keys(fmIdx).length+' named failure modes across 6 playbooks (computed). A loss without an FM tag is a taxonomy gap, not an orphan — name it or the journal cannot learn from it (LAW-018).</div>',{flush:true});
  if(armedPb){
    const am=ms.find(x=>x.pb.id===armedPb.id);
    h+=panel('ARMED SESSION CONTRACT — '+armedPb.nm,'armed '+U.esc(MKTD_STATE.armedAt||'—')+' ET · the arm is session-scoped and expires at the close',
      kv('HUNT ONLY',armedPb.hunt.map(hh=>'<b>'+hh.s+'</b> ('+hh.exp+')').join(' · ')+' — everything else is a journal entry, not an order')+
      kv('NAMED LEAKS',armedPb.avoid.map(av=>'<span class="mono" style="font-size:10px;color:var(--neg)">'+av.fm+'</span>').join(' · ')+' — these three are the session’s pre-declared failure modes')+
      kv('SIZING','<span style="font-size:10.5px">'+armedPb.sizing()+'</span>')+
      kv('MATCH NOW',(am?am.m:'—')+'% · '+(armedPb.id===win.pb.id?'<span class="up">agrees with today’s computed winner</span>':'<span style="color:var(--warn)">diverges from '+win.pb.nm+' ('+win.m+'%) — the mismatch banner above wants a journal note</span>'))+
      kv('EXPIRY','At the close, without ceremony. Playbooks are session-scoped: carrying one overnight is how yesterday trades today (LAW-012).')+
      '<div class="btnrow" style="margin-top:9px">'+CMD.btn('playbk.brief',null,'gold','⭳ Download the brief')+
      '<button class="btn sm" data-cmd="playbk.arm" data-arg="'+armedPb.id+'">Disarm</button></div>');
  }else{
    h+=panel('ARMED SESSION CONTRACT — empty','arming is a commitment device, not a decoration',
      '<div class="empty" style="margin-bottom:8px"><div class="e1">NO PLAYBOOK ARMED</div>Arming binds the session to one hunt list, three named leaks, and one sizing posture — and writes all of it to the audit ledger. The point is pre-commitment: the list is chosen while calm, enforced while not.</div>'+
      kv('WHAT ARMING DOES','audits the choice + match% · pins the ARMED chip to the card and the header · exposes the downloadable brief (playbk.brief) · flags any armed-vs-matched divergence, loudly')+
      kv('WHAT IT DOES NOT DO','change a single gate. Risk law, packet law, and the paper ceiling bind exactly as before — the contract is with yourself, witnessed by the ledger.')+
      '<div class="btnrow" style="margin-top:9px">'+ms.slice(0,3).map(m=>'<button class="btn sm'+(m.pb.id===win.pb.id?' gold':'')+'" data-cmd="playbk.arm" data-arg="'+m.pb.id+'">◆ Arm '+m.pb.nm+' ('+m.m+'%)</button>').join('')+'</div>');
  }
  h+='</div>';
  /* closing g2 — deepen the theme */
  h+='<div class="grid g2">';
  const vrows=MKTD_VIOLMAP.map(v=>({v,j:JOURNAL.find(j=>j.id===v.ref)})).filter(x=>x.j);
  const nViol=vrows.filter(x=>x.v.verdict!=='CLEAN'&&x.v.verdict!=='REJECTED · CORRECT').length;
  h+=panel('PLAYBOOK VIOLATION LOG — bound to the journal','every row resolves to a live JOURNAL record (LAW-018) · violations are named against §avoid clauses, not vibes',
    '<div class="grid g3" style="margin-bottom:8px">'+
      stat('Journal records scanned',JOURNAL.length,'the live store, not a copy')+
      stat('Violations flagged',nViol,'both caught by gates before capital was at full risk')+
      stat('Containment rate',vrows.length?Math.round((vrows.length-0)/vrows.length*100)+'%':'—','flagged rows resolved by gate, paper cap, or template')+
    '</div>'+
    vrows.map(x=>'<div class="kv"><span class="k mono" style="font-size:9.5px">'+x.j.t+' · '+x.v.ref+'</span><span class="v">'+
      chip(x.v.verdict,x.v.verdict==='CLEAN'?'ch-ok':x.v.verdict==='CAUGHT PRE-ORDER'?'ch-info':x.v.verdict==='CONTAINED AT PAPER'?'ch-paper':'ch-mut',x.v.verdict==='CLEAN'?'✓':'◆')+
      ' <b style="font-size:11px">'+U.esc(x.v.pb)+'</b> — <span style="font-size:10.5px">'+U.esc(x.v.rule)+'</span>'+
      '<div class="i1" style="font-size:10.5px;margin-top:2px">journal: '+U.esc(x.j.what)+' · outcome '+U.esc(x.j.outcome)+' · cost '+U.esc(x.v.cost)+'</div>'+
      '<div class="i2" style="font-size:10px;margin-top:2px">'+U.esc(x.v.note)+'</div></span></div>').join('')+
    '<div class="i2" style="font-size:10px;margin-top:8px">A violation log with only sins in it is a blame ledger. Clean rows and correct rejections live here too — the metric is containment, not shame.</div>');
  h+=panel('REGIME HANDOFF MAP — how regimes end','the first day of a new regime is the most mispriced day on the calendar · desk memory, <span class="demo-wm">demo twin</span>',
    MKTD_HANDOFF.map(r=>'<div class="kv"><span class="k" style="font-size:9.5px">'+U.esc(r[0])+'</span><span class="v">'+
      '<span style="font-size:11px"><b>usually →</b> '+U.esc(r[1])+'</span>'+
      '<div class="i1" style="font-size:10.5px;margin-top:2px">WATCH: '+U.esc(r[2])+'</div>'+
      '<div class="i2" style="font-size:10px;margin-top:2px">FIRST-DAY RULE: '+U.esc(r[3])+'</div></span></div>').join('')+
    '<div class="banner info" style="margin-top:8px"><span class="bico">i</span><div style="font-size:11px"><b>Handoff discipline:</b> regimes end at events or exhaustion, and the label always changes AFTER the arithmetic. Trade the fingerprint conditions, not the announcement — by the time the desk renames the regime, the first-day edge is already spent.</div></div>');
  h+='</div>';
  return h;
};

/* ── playbk.* commands ── */
CMD.define({id:'playbk.arm',label:'Arm playbook',purpose:'Arm/disarm the session playbook — hunts and avoids become the session doctrine',run:a=>{
  const pb=MKTD_PLAYBOOKS.find(p=>p.id===a);if(!pb)return;
  const m=mktdMatch().find(x=>x.pb.id===a);
  if(MKTD_STATE.armed===a){
    MKTD_STATE.armed=null;MKTD_STATE.armedAt=null;
    SVR.audit('HUMAN (owner)','playbook','Session playbook DISARMED: '+pb.nm);
    UI.toast(pb.nm+' disarmed — no session playbook armed','','PLAYBOOK');
  }else{
    MKTD_STATE.armed=a;MKTD_STATE.armedAt=CLOCK.hm();
    SVR.audit('HUMAN (owner)','playbook','Session playbook ARMED: '+pb.nm+' · match '+(m?m.m:'—')+'% · hunts: '+pb.hunt.map(hh=>hh.s).join(', ')+' · avoids: '+pb.avoid.map(av=>av.fm).join(', '));
    UI.toast(pb.nm+' armed as session playbook — match '+(m?m.m:'—')+'%. Its §avoid clauses are now the session’s named leaks.','gold','PLAYBOOK');
  }
  render();
}});
CMD.define({id:'playbk.open',label:'Playbook doctrine',purpose:'Full playbook drawer — thesis, fingerprint, hunts, avoids, protocol, analogs',audit:false,run:a=>{
  const pb=MKTD_PLAYBOOKS.find(p=>p.id===a);if(!pb)return;
  const m=mktdMatch().find(x=>x.pb.id===a);
  const armed=MKTD_STATE.armed===a;
  UI.drawer('<div class="dhead"><span class="dt">'+pb.ico+' '+pb.nm+'</span><span class="pill">match '+(m?m.m:'—')+'% · '+U.esc(pb.bt)+'</span><button class="dx" data-cmd="ui.closeDrawer">ESC</button></div>'+
   '<div class="dbody">'+
   '<div style="margin-bottom:8px">'+(armed?chip('ARMED','ch-live','◆')+' ':'')+chip('demo twin backtests','ch-demo','◈')+'</div>'+
   kv('THESIS','<span style="font-size:11.5px">'+U.esc(pb.thesis)+'</span>')+
   kv('THE READ','<span style="font-size:11.5px;line-height:1.6">'+U.esc(pb.doc.read)+'</span>')+
   '<div class="hr"></div>'+
   '<div class="kick" style="font-family:var(--mono);font-size:9px;letter-spacing:1.2px;color:var(--ink2);margin-bottom:4px">FINGERPRINT — live subscores</div>'+
   (m?m.cs.map(c=>kv(c.c.toUpperCase(),'<span style="font-size:10.5px">'+U.esc(c.thr)+' · now <b>'+c.x+c.u+'</b> → subscore <b class="'+(c.s>=60?'up':c.s>=30?'i1':'dn')+'">'+c.s+'</b><div class="mono i2" style="font-size:9.5px">'+U.esc(c.calc)+'</div></span>')).join(''):'')+
   '<div class="hr"></div>'+
   '<div class="kick" style="font-family:var(--mono);font-size:9px;letter-spacing:1.2px;color:var(--ink2);margin-bottom:4px">DECISION PROTOCOL</div>'+
   pb.doc.protocol.map((p,i)=>kv('STEP '+(i+1),'<span style="font-size:11px">'+U.esc(p)+'</span>')).join('')+
   kv('WRONG WHEN','<span style="font-size:11px;color:var(--warn)">'+U.esc(pb.doc.wrong)+'</span>')+
   '<div class="hr"></div>'+
   kv('SIZING','<span style="font-size:10.5px">'+pb.sizing()+'</span>')+
   pb.avoid.map(av=>kv(av.fm,'<span style="font-size:10.5px">'+U.esc(av.txt)+'</span>')).join('')+
   '<div class="btnrow" style="margin-top:10px">'+
   '<button class="btn'+(armed?'':' gold')+'" data-cmd="playbk.arm" data-arg="'+pb.id+'">'+(armed?'Disarm':'◆ Arm as session playbook')+'</button>'+
   CMD.btn('playbk.brief',null,'sm','⭳ Download armed brief')+
   '</div></div>');
}});
CMD.define({id:'playbk.cell',label:'Grid cell doctrine',purpose:'Setup × regime cell — expectancy, verdict, and why',audit:false,run:a=>{
  const[si,ri]=String(a).split('|').map(Number);
  if(!(MKTD_GRID[si]&&MKTD_GRID[si][ri]!=null))return;
  const v=MKTD_GRID[si][ri],s=MKTD_SETUPS[si],r=MKTD_REGIMES[ri][1];
  const home=v>=0.5,ban=v<=-0.4;
  UI.modal('EXPECTANCY CELL · '+U.esc(s)+' × '+U.esc(r),
   kv('EXPECTANCY','<b class="'+(v>=0?'up':'dn')+'">'+(v>=0?'+':'−')+U.fmt(Math.abs(v),2)+'R</b> per attempt · n='+mktdCellN(si,ri)+' replays · <span class="demo-wm">demo twin</span>')+
   kv('VERDICT',home?chip('HOME REGIME','ch-ok','✓')+' full playbook treatment — this is where the setup earns its keep'
     :ban?chip('BANNED','ch-blk','⛔')+' standing prohibition class — the scenario DB is why; no discretion reopens a banned cell'
     :chip('VISITOR','ch-warn','!')+' tradeable at reduced size or paper only — the edge exists but does not pay for full risk')+
   kv('DOCTRINE','<span style="font-size:11px">A setup is only tradeable in its home regimes '+prov('AX-M7','Axiom M7 — higher timeframes justify; lower timeframes trigger. The regime is the desk’s highest timeframe.')+'. The regime justifies; the setup merely triggers. Firing this setup in '+U.esc(r)+' is '+(home?'justified by the corpus.':ban?'forbidden by the corpus.':'tolerated by the corpus — barely. Paper is the honest tier for it.')+'</span>')+
   '<div class="i2" style="font-size:10px;margin-top:8px">Cells re-score on every nightly scenario batch (S30). A cell that flips sign flags the playbook for court review — doctrine follows evidence, never the reverse (LAW-013).</div>',
   '<button class="btn" data-cmd="ui.closeModal">Close</button>');
}});
CMD.define({id:'playbk.brief',label:'Armed brief',purpose:'Download the armed playbook as a session brief — a real file, honestly labeled',
  pre:()=>MKTD_STATE.armed?null:'No playbook armed — arm one first (playbk.arm)',
  run:()=>{
    const pb=MKTD_PLAYBOOKS.find(p=>p.id===MKTD_STATE.armed);if(!pb)return;
    const m=mktdMatch().find(x=>x.pb.id===pb.id);
    const L=[];
    L.push('ATLAS PRIME — SESSION PLAYBOOK BRIEF (DEMO · seed '+ck('demo.seed')+')');
    L.push('Armed: '+pb.nm+' · '+CLOCK.hms()+' ET (sim) · fingerprint match '+(m?m.m:'—')+'%');
    L.push('');
    L.push('THESIS: '+pb.thesis);
    L.push('');
    L.push('FINGERPRINT (live subscores):');
    (m?m.cs:[]).forEach(c=>L.push('  · '+c.c+': '+c.thr+' — now '+c.x+c.u+' → '+c.s+'  ['+c.calc+']'));
    L.push('');
    L.push('HUNT ('+pb.bt+' — demo twin):');
    pb.hunt.forEach((hh,i)=>L.push('  '+(i+1)+'. '+hh.s+' — n='+hh.n+' · '+hh.exp+' · win '+hh.win+' · PF '+hh.pf+' — '+hh.note));
    L.push('');
    L.push('AVOID:');
    pb.avoid.forEach(av=>L.push('  · '+av.fm+' — '+av.txt));
    L.push('');
    L.push('SIZING: '+pb.sizing().replace(/<[^>]*>/g,''));
    L.push('');
    L.push('PROTOCOL:');
    pb.doc.protocol.forEach((p,i)=>L.push('  '+(i+1)+'. '+p));
    L.push('WRONG WHEN: '+pb.doc.wrong);
    L.push('');
    L.push('ANALOGS: '+pb.analogs.map(an=>an.d).join(' · ')+' (public dates; annotations demo twin)');
    L.push('');
    L.push('HONESTY: synthetic corpus, deterministic seed. No live claim, no performance claim.');
    const blob=new Blob([L.join('\n')],{type:'text/plain'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='ATLAS_playbook_'+pb.id+'_brief_demo.txt';a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href),4000);
    SVR.audit('HUMAN (owner)','export','Session playbook brief downloaded: '+pb.nm);
    UI.toast('Brief downloaded — '+pb.nm+', honestly labeled DEMO','ok','PLAYBOOK');
  }});
CMD.define({id:'playbk.match',label:'File today’s match',purpose:'Write the full match scoring to the audit ledger — the label follows the arithmetic',run:()=>{
  const ms=mktdMatch();
  SVR.audit('HUMAN (owner)','playbook','Regime match filed: '+ms.map(m=>m.pb.nm+' '+m.m+'%').join(' · ')+' — winner '+ms[0].pb.nm+' (subscores '+ms[0].cs.map(c=>c.s).join('/')+')');
  UI.toast('Match filed: '+ms[0].pb.nm+' '+ms[0].m+'% over '+ms[1].pb.nm+' '+ms[1].m+'%','gold','TODAY’S MATCH');
  render();
}});

/* ── module mount — one audit line so the ledger can reconstruct the session ── */
SVR.audit('S08 Market Regime','telemetry','Markets deep module mounted — internals observatory + regime playbook library (2 workspaces, seeded twins, real math)');
