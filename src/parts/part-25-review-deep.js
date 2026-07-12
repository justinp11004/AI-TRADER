/* ═══════════ REVIEW DEEP · Pattern Lab + Discipline Coach (part-25) ═══════════
   Two REVIEW workspaces that interrogate the record instead of admiring it.
   PATTERN LAB: a five-year deterministic demo cohort per setup family —
   cumulative-R curves, an edge-decay slope test, the day×hour expectancy
   truth, MFE/MAE excursion analytics, exit-efficiency leaks, a graveyard.
   DISCIPLINE COACH: the operator is the last risk factor — violation scan
   of the REAL journal + ledger, tilt telemetry, streak arithmetic, habit
   scorecards, a generated weekly letter, and one binding contract.
   Honesty law: every derived number is computed from the same array it is
   plotted from; scenario series carry the demo watermark. */
DOMAINS.review.ws.push({id:'patterns',label:'Pattern Lab'});
DOMAINS.review.ws.push({id:'coach',label:'Discipline Coach'});

/* ── module state (REVD_ prefix throughout) ── */
const REVD_ST={
  fam:'brk',            /* family selected in the decay detector */
  cells:false,          /* heatmap n-per-cell overlay */
  sc:'ALL',             /* scatter filter: ALL | WIN | LOSS */
  norm:false,           /* cohort canvas: cumulative R vs expectancy-to-date */
  tp:2.0,               /* exit-policy simulator: partial level in R */
  win:30,               /* decay detector display window (constitutional: 30) */
  flagged:{},           /* decay asks filed this session, per family key */
  autopsied:false,      /* worst-efficiency court filing latch */
};
let REVD_SEQ=0;
const REVD_DECAY_TH=-1.2;   /* mR/trade — rolling-30 expectancy slope floor;
                               ≈ −0.36R of expectancy drift per 300 trades */

/* ── the five families under interrogation ──
   w0    base win probability at cohort start
   drift win-probability decay across the cohort (crowding term)
   wMu   winner R-multiple scale (exponential tail)
   mfeLo/mfeHi  winner MFE multiple band vs captured R (exit-efficiency lever)
   tight probability a LOSER ran ≥ +1R favorable before stopping
   slip  probability a loser exits materially past the −1R plan (late exit) */
const REVD_FAMS=[
 {key:'mmbm',nm:'MMBM Reversal',   col:'#5AA7FF',n:412,w0:0.360,drift:0.010,wMu:2.40,
  mfeLo:1.40,mfeHi:1.95,tight:0.16,slip:0.06,hot:[10,11],
  def:'engineered sweep into HTF discount + displacement reclaim (BT-0437 lineage)'},
 {key:'sb',  nm:'Silver Bullet',    col:'#2FD6A0',n:196,w0:0.320,drift:0.015,wMu:2.60,
  mfeLo:1.15,mfeHi:1.45,tight:0.44,slip:0.05,hot:[10],
  def:'10:00–11:00 killzone FVG with a named HTF draw (BT-0428 lineage)'},
 {key:'brk', nm:'Breaker Retest',   col:'#E7B653',n:240,w0:0.380,drift:0.145,wMu:2.00,
  mfeLo:1.20,mfeHi:1.55,tight:0.18,slip:0.30,hot:[10,14],
  def:'4H breaker reclaim + retest; trapped breakout sellers fund the move'},
 {key:'tdv', nm:'Trend Day VWAP',   col:'#B58CFF',n:174,w0:0.455,drift:0.020,wMu:1.70,
  mfeLo:1.12,mfeHi:1.35,tight:0.12,slip:0.05,hot:[13,14],
  def:'first VWAP tag on a confirmed trend day — continuation, never fade'},
 {key:'cmp', nm:'Compression Break',col:'#F2637C',n:158,w0:0.350,drift:0.105,wMu:2.20,
  mfeLo:1.45,mfeHi:1.95,tight:0.15,slip:0.07,hot:[9,15],
  def:'NR7 / inside-day energy release in the direction of the HTF draw'},
];

/* ── regime schedule across the 5y session axis (deterministic blocks) ──
   Regime enters the win-probability draw, so the regime-split table later
   DISCOVERS structure that is genuinely in the series — not annotated on. */
const REVD_REGIMES=[[0,'CHOP'],[150,'RISK-ON'],[450,'RISK-OFF'],[550,'RISK-ON'],
                    [680,'SQUEEZE'],[740,'RISK-ON'],[1000,'CHOP'],[1150,'RISK-ON']];
const REVD_REG_ADJ={'RISK-ON':0.015,'CHOP':-0.03,'RISK-OFF':-0.015,'SQUEEZE':-0.03};
function revdRegimeOf(sess){
  let out='RISK-ON';
  for(const[st,nm]of REVD_REGIMES){if(sess>=st)out=nm}
  return out;
}

/* ── math helpers ── */
function revdSlopeMB(a){
  const n=a.length;if(n<2)return{m:0,b:a[0]||0};
  let sx=0,sy=0,sxy=0,sxx=0;
  for(let i=0;i<n;i++){sx+=i;sy+=a[i];sxy+=i*a[i];sxx+=i*i}
  const d=n*sxx-sx*sx,m=d?(n*sxy-sx*sy)/d:0;
  return{m,b:(sy-m*sx)/n};
}
function revdMedian(a){
  if(!a.length)return 0;
  const b=a.slice().sort((p,q)=>p-q),m=Math.floor(b.length/2);
  return b.length%2?b[m]:(b[m-1]+b[m])/2;
}

/* ── the cohort build — one deterministic pass, cached ──
   Seeded per family; the SAME trade array feeds the curve canvas, the stat
   table, the rolling-slope test, the heatmap, the scatter and the exit-
   efficiency table. There is no second source of truth to disagree with. */
let REVD_CACHE=null;
function revdData(){
  if(REVD_CACHE)return REVD_CACHE;
  const fams=REVD_FAMS.map(f=>{
    const r=localRng('revd-v14g-'+f.key),trades=[];
    const baseHours=[9,10,10,10,11,11,12,13,14,15];
    for(let i=0;i<f.n;i++){
      const sess=Math.min(1259,Math.floor(i/f.n*1260+r()*Math.max(1,1260/f.n)));
      const dow=Math.floor(r()*5);
      let hour=baseHours[Math.floor(r()*10)];
      const uh=r();
      if(uh<0.30)hour=f.hot[Math.floor(uh/0.30*f.hot.length)%f.hot.length];
      /* win probability = family base − crowding drift + time-of-day structure
         + regime term. The heatmap and the regime table "discover" structure
         honestly — because it is IN the data, not painted on afterward. */
      const reg=revdRegimeOf(sess);
      let p=f.w0-f.drift*(i/f.n)+(REVD_REG_ADJ[reg]||0);
      if(hour===10||hour===11)p+=0.05;
      if(hour===12||hour===13)p-=0.07;
      if(dow===4)p-=0.03;
      if(dow===2&&hour===14)p+=0.03;
      const win=r()<p;
      let R,mfe,mae;
      if(win){
        R=U.clamp(0.7-Math.log(1-Math.min(0.9995,r()))*f.wMu,0.4,9.5);
        mfe=R*(f.mfeLo+r()*(f.mfeHi-f.mfeLo));
        mae=-(r()*0.55);
      }else{
        R=-(0.82+r()*0.36);
        if(r()<f.slip)R-=0.18+r()*0.35;          /* late exit: slipped past plan */
        mfe=r()<f.tight?1.0+r()*1.3:r()*0.85;    /* stop-too-tight signature */
        mae=R-r()*0.10;
      }
      trades.push({fam:f.key,i,sess,dow,hour,reg,win,R,mfe,mae});
    }
    /* cumulative curve — the plotted object IS the stats source */
    let cum=0;
    const curve=trades.map(t=>({sess:t.sess,cum:(cum+=t.R)}));
    const final=curve.length?curve[curve.length-1].cum:0;
    const wins=trades.filter(t=>t.win),losses=trades.filter(t=>!t.win);
    const gw=wins.reduce((a,t)=>a+t.R,0);
    const gl=Math.abs(losses.reduce((a,t)=>a+t.R,0));
    const exp=f.n?final/f.n:0;
    const winPct=f.n?wins.length/f.n*100:0;
    const pf=gl?gw/gl:0;
    let worstRun=0,run=0;
    trades.forEach(t=>{if(!t.win){run++;if(run>worstRun)worstRun=run}else run=0});
    /* per-family dispersion — feeds the decay canvas SE band + Kelly caveats */
    const meanF=f.n?final/f.n:0;
    const sdF=f.n?Math.sqrt(trades.reduce((a,t)=>a+(t.R-meanF)*(t.R-meanF),0)/f.n):0;
    /* rolling 30-trade expectancy + least-squares slope over the rolling series
       (30 is the constitutional window; other windows are lenses, computed on
       demand by revdRollOf and never used for the DECAYING flag) */
    const roll=[];
    for(let i=29;i<trades.length;i++){
      let s=0;for(let j=i-29;j<=i;j++)s+=trades[j].R;
      roll.push(s/30);
    }
    const reg=revdSlopeMB(roll);
    const slopeMr=reg.m*1000;    /* milli-R per trade — human-readable scale */
    const state=slopeMr<=REVD_DECAY_TH?'DECAYING':slopeMr<=-0.5?'WATCH':'HEALTHY';
    /* exit efficiency — winners only for capture; losers for stop diagnostics */
    const avgCap=wins.length?gw/wins.length:0;
    const avgMfe=wins.length?wins.reduce((a,t)=>a+t.mfe,0)/wins.length:0;
    const eff=avgMfe?avgCap/avgMfe:0;
    const tightPct=losses.length?losses.filter(t=>t.mfe>=1).length/losses.length*100:0;
    const avgLoss=losses.length?losses.reduce((a,t)=>a+t.R,0)/losses.length:0;
    let leak,leakEv;
    if(eff<0.62){
      leak='EARLY EXIT';
      leakEv='winners capture '+U.fmt(avgCap,2)+'R of a '+U.fmt(avgMfe,2)+'R average open path — '
        +U.fmt((1-eff)*100,0)+'% of the offered move is left on the table';
    }else if(tightPct>=30){
      leak='STOP TOO TIGHT';
      leakEv=U.fmt(tightPct,0)+'% of losers ran ≥ +1.0R favorable BEFORE stopping — invalidation sits inside the noise band';
    }else if(avgLoss<=-1.08){
      leak='LATE EXIT';
      leakEv='average realized loss '+U.fmt(avgLoss,2)+'R against a −1.00R plan — exits slip past the stop on hope';
    }else{
      leak='NONE DOMINANT';
      leakEv='efficiency '+U.fmt(eff*100,0)+'% · tight-stop rate '+U.fmt(tightPct,0)+'% · avg loss '
        +U.fmt(avgLoss,2)+'R — all inside tolerance';
    }
    /* cohort aging: expectancy per year bucket (sess ÷ 252) */
    const byYear=Array.from({length:5},()=>({n:0,sum:0}));
    trades.forEach(t=>{const y=Math.min(4,Math.floor(t.sess/252));byYear[y].n++;byYear[y].sum+=t.R});
    /* per entry-hour + per regime splits, from the same trades */
    const byHour=Array.from({length:7},()=>({n:0,sum:0}));
    trades.forEach(t=>{const c=byHour[t.hour-9];if(c){c.n++;c.sum+=t.R}});
    const byReg={};
    trades.forEach(t=>{const c=byReg[t.reg]||(byReg[t.reg]={n:0,sum:0});c.n++;c.sum+=t.R});
    /* max drawdown of the cumulative curve, in R */
    let peak=-1e9,maxDD=0;
    curve.forEach(c=>{if(c.cum>peak)peak=c.cum;const dd=peak-c.cum;if(dd>maxDD)maxDD=dd});
    return{key:f.key,nm:f.nm,col:f.col,def:f.def,n:f.n,trades,curve,final,exp,winPct,pf,
      worstRun,roll,reg,slopeMr,state,avgCap,avgMfe,eff,tightPct,avgLoss,leak,leakEv,
      byYear,byHour,byReg,maxDD,sdF,_rw:{},wins:wins.length,losses:losses.length};
  });
  /* pooled ledger — chronological across families */
  const pool=[];
  fams.forEach(F=>{F.trades.forEach(t=>pool.push(t))});
  pool.sort((a,b)=>a.sess-b.sess||(a.fam<b.fam?-1:a.fam>b.fam?1:0)||a.i-b.i);
  /* day-of-week × entry-hour grid (5 rows × 7 cols, hours 09..15) */
  const heat=Array.from({length:5},()=>Array.from({length:7},()=>({n:0,sum:0})));
  pool.forEach(t=>{const c=heat[t.dow][t.hour-9];if(c){c.n++;c.sum+=t.R}});
  /* pooled dispersion — the "what n is enough" arithmetic input */
  const nAll=pool.length;
  const meanAll=nAll?pool.reduce((a,t)=>a+t.R,0)/nAll:0;
  const sdAll=nAll?Math.sqrt(pool.reduce((a,t)=>a+(t.R-meanAll)*(t.R-meanAll),0)/nAll):0;
  const poolWins=pool.filter(t=>t.win);
  const medWinMfe=revdMedian(poolWins.map(t=>t.mfe));
  const capRatio=(function(){
    const c=poolWins.reduce((a,t)=>a+t.R,0),m=poolWins.reduce((a,t)=>a+t.mfe,0);
    return m?c/m:0;
  })();
  const losers2R=(function(){
    const L=pool.filter(t=>!t.win);
    return L.length?L.filter(t=>t.mfe>=2).length/L.length*100:0;
  })();
  const winsPast2R=poolWins.length?poolWins.filter(t=>t.mfe>=2).length/poolWins.length*100:0;
  REVD_CACHE={fams,pool,heat,nAll,meanAll,sdAll,medWinMfe,capRatio,losers2R,winsPast2R};
  return REVD_CACHE;
}
function revdFam(key){const D=revdData();return D.fams.find(f=>f.key===key)||D.fams[0]}
function revdWorstEff(){return revdData().fams.slice().sort((a,b)=>a.eff-b.eff)[0]}

/* ── setup graveyard — retirement is inventory management, not shame ── */
const REVD_GRAVE=[
 {nm:'Opening Range Fade',period:'2021-03 → 2022-11',lifeR:'+38.2R',cause:'CROWDING',
  story:'Faded the 5m opening range extreme back to VWAP. Worked while the open was retail-driven; '+
   'died as 0DTE volume industrialized the first half hour — the counterparty stopped being wrong.',
  chunk:'HUM-097',resurrect:'opening-auction volume share back below 8% of day volume for 60 consecutive sessions'},
 {nm:'Gap-and-Go Continuation',period:'2021-06 → 2023-02',lifeR:'+21.4R',cause:'REGIME CHANGE',
  story:'Bought the first pullback on +2% gaps. The 2022 vol regime turned gaps mean-reverting; '+
   'expectancy flipped sign in one quarter and the rolling slope test caught it 40 trades before the P&L admitted it.',
  chunk:'LS-089',resurrect:'trend-day frequency > 22% over a rolling 60-session window'},
 {nm:'Triple-Tap Divergence',period:'2022-01 → 2022-09',lifeR:'−6.8R',cause:'RULE WAS OVERFIT',
  story:'Backtest mined 14 parameters on 90 trades and called the residue an edge. Never had one. '+
   'Lifetime R is negative because the desk paid tuition on a curve-fit ghost.',
  chunk:'LS-074',resurrect:'none — an overfit rule does not resurrect; the tombstone is the asset'},
 {nm:'Lunch Reversion Scalp',period:'2023-04 → 2024-05',lifeR:'+9.1R',cause:'CROWDING',
  story:'Scalped band extremes in the 12:00–13:00 doldrums. Gross edge survived; NET edge fell below '+
   'costs once size stepped up — expectancy per trade never cleared the spread at rung-3 size.',
  chunk:'HUM-104',resurrect:'only at maker-rebate economics or sub-penny effective spread on the instrument'},
];

/* ── canvas: cohort curves — five families, one 5y axis ──
   Two lenses on the same arrays: cumulative R, or expectancy-to-date
   (cum ÷ trades so far, first 10 trades suppressed as meaningless). */
function revdDrawCohort(){POSTRENDER.push(()=>{
  const cv=document.getElementById('revd-cohort');if(!cv)return;
  const D=revdData(),norm=REVD_ST.norm;
  const W=cv.width=cv.clientWidth*2,H=cv.height=280*2,x=cv.getContext('2d');
  x.fillStyle='#070B12';x.fillRect(0,0,W,H);
  const AX=92,TOP=18,BOT=46;
  const series=D.fams.map(f=>norm
    ?f.curve.map((c,i)=>({sess:c.sess,v:c.cum/(i+1)})).slice(10)
    :f.curve.map(c=>({sess:c.sess,v:c.cum})));
  let lo=0,hi=norm?0.6:10;
  series.forEach(s2=>s2.forEach(c=>{if(c.v<lo)lo=c.v;if(c.v>hi)hi=c.v}));
  const pad=(hi-lo)*0.07;lo-=pad;hi+=pad;
  const px=s=>(s/1259)*(W-AX);
  const py=v=>TOP+((hi-v)/(hi-lo))*(H-TOP-BOT);
  x.lineWidth=1;x.font='16px monospace';
  const step=(hi-lo)/6;
  for(let i=0;i<=6;i++){
    const v=lo+step*i,y=py(v);
    x.strokeStyle='rgba(151,166,192,.07)';
    x.beginPath();x.moveTo(0,y);x.lineTo(W-AX,y);x.stroke();
    x.fillStyle='#67748C';x.fillText(U.sign(v,norm?2:0)+'R',W-AX+10,y+5);
  }
  x.strokeStyle='rgba(151,166,192,.25)';x.setLineDash([5,5]);
  x.beginPath();x.moveTo(0,py(0));x.lineTo(W-AX,py(0));x.stroke();x.setLineDash([]);
  for(let yy=1;yy<=5;yy++){
    const X=px(yy*252-1);
    x.strokeStyle='rgba(151,166,192,.10)';
    x.beginPath();x.moveTo(X,TOP);x.lineTo(X,H-BOT);x.stroke();
    x.fillStyle='#67748C';x.fillText('Y'+yy,X-16,H-BOT+26);
  }
  D.fams.forEach((f,fi)=>{
    const s2=series[fi];if(!s2.length)return;
    x.strokeStyle=f.col;x.lineWidth=2.5;x.beginPath();
    s2.forEach((c,i)=>{const X=px(c.sess),Y=py(c.v);i?x.lineTo(X,Y):x.moveTo(X,Y)});
    x.stroke();
    const last=s2[s2.length-1];
    x.fillStyle=f.col;x.font='15px monospace';
    x.fillText(f.nm.split(' ')[0]+' '+U.sign(last.v,norm?2:0)+'R',
      Math.min(px(last.sess)+8,W-AX-210),py(last.v)+(fi%2?16:-8));
  });
  x.fillStyle='#67748C';x.font='15px monospace';
  x.fillText((norm
    ?'expectancy-to-date per family (first 10 trades suppressed — a mean of n<10 is noise wearing a trend)'
    :'cumulative R per family · x = 5y session axis (252/yr)')
    +' · seeded demo cohort — same arrays feed the table below',12,H-12);
})}

/* ── canvas: rolling-30 expectancy + regression line, selected family ── */
function revdDrawDecay(){POSTRENDER.push(()=>{
  const cv=document.getElementById('revd-decay');if(!cv)return;
  const f=revdFam(REVD_ST.fam);
  const W=cv.width=cv.clientWidth*2,H=cv.height=210*2,x=cv.getContext('2d');
  x.fillStyle='#070B12';x.fillRect(0,0,W,H);
  const a=f.roll;if(!a.length)return;
  const AX=92,TOP=16,BOT=40;
  let lo=Math.min(0,...a),hi=Math.max(0.2,...a);
  const pad=(hi-lo)*0.12;lo-=pad;hi+=pad;
  const px=i=>i/(a.length-1)*(W-AX);
  const py=v=>TOP+((hi-v)/(hi-lo))*(H-TOP-BOT);
  x.lineWidth=1;x.font='16px monospace';
  for(let i=0;i<=4;i++){
    const v=lo+(hi-lo)/4*i,y=py(v);
    x.strokeStyle='rgba(151,166,192,.07)';
    x.beginPath();x.moveTo(0,y);x.lineTo(W-AX,y);x.stroke();
    x.fillStyle='#67748C';x.fillText(U.sign(v,2),W-AX+10,y+5);
  }
  x.strokeStyle='rgba(151,166,192,.25)';x.setLineDash([5,5]);
  x.beginPath();x.moveTo(0,py(0));x.lineTo(W-AX,py(0));x.stroke();x.setLineDash([]);
  x.strokeStyle=f.col;x.lineWidth=2.5;x.beginPath();
  a.forEach((v,i)=>{const X=px(i),Y=py(v);i?x.lineTo(X,Y):x.moveTo(X,Y)});
  x.stroke();
  /* least-squares trend over the SAME rolling series */
  const dec=f.state==='DECAYING';
  x.strokeStyle=dec?'rgba(242,99,124,.9)':'rgba(159,171,191,.7)';
  x.lineWidth=2;x.setLineDash([8,6]);x.beginPath();
  x.moveTo(px(0),py(f.reg.b));x.lineTo(px(a.length-1),py(f.reg.b+f.reg.m*(a.length-1)));
  x.stroke();x.setLineDash([]);
  /* ±1.96·σ/√30 sampling band around the trend — a point outside the band is
     SURPRISE; only the slope is DECAY. Confusing the two retires good edges. */
  const band=1.96*f.sdF/Math.sqrt(30);
  x.strokeStyle='rgba(90,167,255,.30)';x.lineWidth=1.5;x.setLineDash([3,5]);
  [band,-band].forEach(off=>{
    x.beginPath();
    x.moveTo(px(0),py(f.reg.b+off));
    x.lineTo(px(a.length-1),py(f.reg.b+f.reg.m*(a.length-1)+off));
    x.stroke();
  });
  x.setLineDash([]);
  x.fillStyle='rgba(90,167,255,.6)';x.font='14px monospace';
  x.fillText('±1.96·σ/√30 sampling band = ±'+U.fmt(band,2)+'R',14,py(f.reg.b+band)-6);
  x.fillStyle=dec?'#F2637C':'#9FABBF';x.font='17px monospace';
  x.fillText('slope '+U.sign(f.slopeMr,2)+' mR/trade · threshold '+U.fmt(REVD_DECAY_TH,1)
    +' · '+f.state,14,TOP+22);
  x.fillStyle='#67748C';x.font='15px monospace';
  x.fillText(f.nm+' — rolling 30-trade expectancy (R) · trend fitted on this series, not the raw trades',12,H-12);
})}

/* ── canvas: day-of-week × entry-hour expectancy heatmap ── */
function revdDrawHeat(){POSTRENDER.push(()=>{
  const cv=document.getElementById('revd-heat');if(!cv)return;
  const D=revdData();
  const W=cv.width=cv.clientWidth*2,H=cv.height=250*2,x=cv.getContext('2d');
  x.fillStyle='#070B12';x.fillRect(0,0,W,H);
  const L=96,T=44,BOT=34;
  const cwd=(W-L-8)/7,chd=(H-T-BOT)/5;
  const days=['Mon','Tue','Wed','Thu','Fri'];
  x.font='16px monospace';
  for(let h=0;h<7;h++){
    x.fillStyle='#67748C';
    x.fillText(String(9+h).padStart(2,'0')+':xx',L+h*cwd+cwd/2-34,T-14);
  }
  for(let d=0;d<5;d++){
    x.fillStyle='#67748C';x.fillText(days[d],14,T+d*chd+chd/2+6);
    for(let h=0;h<7;h++){
      const c=D.heat[d][h],X=L+h*cwd,Y=T+d*chd;
      const exp=c.n?c.sum/c.n:null;
      const thin=c.n<30;
      if(exp===null){
        x.fillStyle='rgba(151,166,192,.04)';x.fillRect(X+2,Y+2,cwd-4,chd-4);
      }else{
        const al=Math.min(0.42,0.06+Math.abs(exp)*0.42)*(thin?0.5:1);
        x.fillStyle=exp>=0?'rgba(47,214,160,'+al+')':'rgba(242,99,124,'+al+')';
        x.fillRect(X+2,Y+2,cwd-4,chd-4);
      }
      x.strokeStyle=thin?'rgba(231,182,83,.5)':'rgba(151,166,192,.10)';
      if(thin)x.setLineDash([4,4]);
      x.strokeRect(X+2,Y+2,cwd-4,chd-4);x.setLineDash([]);
      x.fillStyle=exp===null?'#67748C':exp>=0?'#2FD6A0':'#F2637C';
      x.font='17px monospace';
      x.fillText(exp===null?'—':U.sign(exp,2),X+10,Y+chd/2+2);
      if(REVD_ST.cells){
        x.fillStyle='#9FABBF';x.font='14px monospace';
        x.fillText('n='+c.n+(thin?' ⚠':''),X+10,Y+chd/2+22);
      }
    }
  }
  x.fillStyle='#67748C';x.font='15px monospace';
  x.fillText('expectancy R per cell, all families pooled · dashed amber border = n<30 (thin — disbelieve it) · toggle n overlay above',12,H-10);
})}

/* ── canvas: MFE vs MAE excursion scatter ── */
function revdDrawScatter(){POSTRENDER.push(()=>{
  const cv=document.getElementById('revd-scatter');if(!cv)return;
  const D=revdData();
  const W=cv.width=cv.clientWidth*2,H=cv.height=270*2,x=cv.getContext('2d');
  x.fillStyle='#070B12';x.fillRect(0,0,W,H);
  const L=86,T=16,BOT=48,R=18;
  const maxMfe=6.5,maxMae=1.6;
  const px=mae=>L+(Math.min(Math.abs(mae),maxMae)/maxMae)*(W-L-R);
  const py=mfe=>T+((maxMfe-Math.min(mfe,maxMfe))/maxMfe)*(H-T-BOT);
  x.lineWidth=1;x.font='16px monospace';
  for(let i=0;i<=6;i++){
    const y=py(i);
    x.strokeStyle='rgba(151,166,192,.07)';
    x.beginPath();x.moveTo(L,y);x.lineTo(W-R,y);x.stroke();
    x.fillStyle='#67748C';x.fillText(i+'R',14,y+5);
  }
  for(let i=0;i<=4;i++){
    const mae=i*0.4,X=px(mae);
    x.strokeStyle='rgba(151,166,192,.07)';
    x.beginPath();x.moveTo(X,T);x.lineTo(X,H-BOT);x.stroke();
    x.fillStyle='#67748C';x.fillText('−'+U.fmt(mae,1)+'R',X-24,H-BOT+24);
  }
  /* reference lines: the −1R stop and the 2R partial */
  x.strokeStyle='rgba(255,77,95,.55)';x.setLineDash([7,5]);
  x.beginPath();x.moveTo(px(1),T);x.lineTo(px(1),H-BOT);x.stroke();
  x.strokeStyle='rgba(231,182,83,.75)';
  x.beginPath();x.moveTo(L,py(2));x.lineTo(W-R,py(2));x.stroke();
  x.strokeStyle='rgba(90,167,255,.55)';
  x.beginPath();x.moveTo(L,py(D.medWinMfe));x.lineTo(W-R,py(D.medWinMfe));x.stroke();
  x.setLineDash([]);
  x.fillStyle='#E7B653';x.fillText('partial 2R',W-R-142,py(2)-8);
  x.fillStyle='#5AA7FF';x.fillText('median winner MFE '+U.fmt(D.medWinMfe,2)+'R',W-R-330,py(D.medWinMfe)-8);
  x.fillStyle='#FF4D5F';x.fillText('−1R stop',px(1)+8,T+20);
  D.pool.forEach(t=>{
    if(REVD_ST.sc==='WIN'&&!t.win)return;
    if(REVD_ST.sc==='LOSS'&&t.win)return;
    x.fillStyle=t.win?'rgba(47,214,160,.45)':'rgba(242,99,124,.45)';
    x.beginPath();x.arc(px(t.mae),py(t.mfe),3.5,0,7);x.fill();
  });
  x.fillStyle='#67748C';x.font='15px monospace';
  x.fillText('x = max adverse excursion · y = max favorable excursion (clipped at 6.5R) · '
    +D.pool.length+' trades · green win / red loss',12,H-10);
})}

/* ── canvas: tilt dial (semicircle gauge, needle at score) ── */
function revdDrawTilt(score){POSTRENDER.push(()=>{
  const cv=document.getElementById('revd-tilt');if(!cv)return;
  const W=cv.width=cv.clientWidth*2,H=cv.height=185*2,x=cv.getContext('2d');
  x.fillStyle='#070B12';x.fillRect(0,0,W,H);
  const cx=W/2,cy=H*0.86,rad=Math.min(W*0.38,H*0.72);
  const ang=v=>Math.PI+(v/100)*Math.PI;
  const zones=[[0,35,'rgba(47,214,160,.55)'],[35,65,'rgba(231,182,83,.55)'],[65,100,'rgba(242,99,124,.6)']];
  zones.forEach(([a,b,col])=>{
    x.strokeStyle=col;x.lineWidth=16;
    x.beginPath();x.arc(cx,cy,rad,ang(a),ang(b));x.stroke();
  });
  x.font='15px monospace';x.fillStyle='#67748C';
  [0,35,65,100].forEach(v=>{
    const a=ang(v);
    x.fillText(String(v),cx+Math.cos(a)*(rad+30)-12,cy+Math.sin(a)*(rad+30)+6);
  });
  const a=ang(U.clamp(score,0,100));
  x.strokeStyle='#E8ECF4';x.lineWidth=4;
  x.beginPath();x.moveTo(cx,cy);
  x.lineTo(cx+Math.cos(a)*(rad-22),cy+Math.sin(a)*(rad-22));x.stroke();
  x.fillStyle='#E8ECF4';x.beginPath();x.arc(cx,cy,8,0,7);x.fill();
  x.font='44px monospace';
  x.fillStyle=score>=65?'#F2637C':score>=35?'#E7B653':'#2FD6A0';
  x.fillText(String(score),cx-28,cy-rad*0.30);
  x.font='15px monospace';x.fillStyle='#67748C';
  x.fillText('TILT RISK 0–100 · composed from the named inputs at left — no vibes term',cx-250,H-8);
})}

/* ── exit-policy simulator — replay the SAME cohort under a different exit ──
   Three policies over identical trades: AS TRADED (actual R), PARTIAL@X
   (bank 50% at X when MFE reached X, runner keeps the trade’s actual R —
   conservative: ignores the stop-to-BE improvement a partial usually buys),
   FULL TP@X (everything exits at X when MFE reached X). A lens, not a
   backtest: no fees, no fills, runner model stated. Rank policies with it;
   never book them from it. */
function revdExitSim(xR){
  const D=revdData();
  const per=D.fams.map(f=>{
    let asT=0,part=0,full=0;
    f.trades.forEach(t=>{
      asT+=t.R;
      part+=t.mfe>=xR?0.5*xR+0.5*t.R:t.R;
      full+=t.mfe>=xR?xR:t.R;
    });
    return{key:f.key,nm:f.nm,n:f.n,asT,part,full};
  });
  const tot=per.reduce((a,p)=>({asT:a.asT+p.asT,part:a.part+p.part,full:a.full+p.full}),
    {asT:0,part:0,full:0});
  return{per,tot};
}

/* ── loss-run scanner — what deep streaks actually cost, and what followed ── */
function revdLossRuns(minLen){
  const pool=revdData().pool,runs=[];
  let i=0;
  while(i<pool.length){
    if(!pool[i].win){
      let j=i,sum=0;
      while(j<pool.length&&!pool[j].win){sum+=pool[j].R;j++}
      const len=j-i;
      if(len>=minLen){
        let rec=0,cnt=0;
        for(let k=j;k<Math.min(pool.length,j+5);k++){rec+=pool[k].R;cnt++}
        runs.push({sess:pool[i].sess,len,sum,rec,cnt});
      }
      i=j;
    }else i++;
  }
  return runs;
}

/* ── rolling series at an arbitrary window (memoized per family) ──
   Exploration lens only — the DECAYING flag is always the 30-window verdict. */
function revdRollOf(f,w){
  if(f._rw[w])return f._rw[w];
  const out=[];
  for(let i=w-1;i<f.trades.length;i++){
    let s=0;for(let j=i-w+1;j<=i;j++)s+=f.trades[j].R;
    out.push(s/w);
  }
  return(f._rw[w]=out);
}

/* ── family correlation matrix — monthly R sums, Pearson pairwise ──
   Families that lose together are ONE bet: the portfolio law RISK-031
   applied to setups instead of sectors. 21-session demo months. */
function revdCorr(){
  const D=revdData();
  const M=60;
  const series=D.fams.map(f=>{
    const a=new Array(M).fill(0);
    f.trades.forEach(t=>{a[Math.min(M-1,Math.floor(t.sess/21))]+=t.R});
    return a;
  });
  const mean=a=>a.reduce((p,q)=>p+q,0)/a.length;
  const corr=(a,b)=>{
    const ma=mean(a),mb=mean(b);
    let num=0,da=0,db=0;
    for(let i=0;i<a.length;i++){
      num+=(a[i]-ma)*(b[i]-mb);da+=(a[i]-ma)*(a[i]-ma);db+=(b[i]-mb)*(b[i]-mb);
    }
    return da&&db?num/Math.sqrt(da*db):0;
  };
  return D.fams.map((f,i)=>D.fams.map((g,j)=>corr(series[i],series[j])));
}

/* ── Kelly arithmetic per family — shown to be UNDERCUT, not followed ── */
function revdKelly(f){
  const p=f.winPct/100,b=Math.max(0.01,f.avgCap);
  const full=p-(1-p)/b;      /* fraction of bankroll risked per trade, loss = 1R */
  return{p,b,full,half:full/2,tenth:full/10};
}

/* ── month-of-year seasonality — pooled, 21-session demo months ── */
function revdMonths(){
  const D=revdData();
  const out=Array.from({length:12},()=>({n:0,sum:0}));
  D.pool.forEach(t=>{const m=Math.floor(t.sess/21)%12;out[m].n++;out[m].sum+=t.R});
  return out;
}

/* ── tail concentration — how much of the book the best trades carry ── */
function revdTail(){
  const D=revdData();
  const sorted=D.pool.slice().sort((a,b)=>b.R-a.R);
  const posSum=sorted.filter(t=>t.R>0).reduce((a,t)=>a+t.R,0);
  const top5n=Math.max(1,Math.floor(sorted.length*0.05));
  const top5=sorted.slice(0,top5n).reduce((a,t)=>a+t.R,0);
  const total=sorted.reduce((a,t)=>a+t.R,0);
  const cut10=sorted.slice(10).reduce((a,t)=>a+t.R,0);
  return{top5n,top5,posSum,total,cut10,
    expAll:total/sorted.length,expCut:cut10/(sorted.length-10)};
}

/* ── canvas: pooled R-distribution histogram, 0.5R buckets ── */
function revdDrawDist(){POSTRENDER.push(()=>{
  const cv=document.getElementById('revd-dist');if(!cv)return;
  const D=revdData();
  const W=cv.width=cv.clientWidth*2,H=cv.height=230*2,x=cv.getContext('2d');
  x.fillStyle='#070B12';x.fillRect(0,0,W,H);
  const lo=-1.5,hi=9.5,bw=0.5,nb=Math.round((hi-lo)/bw);
  const bins=new Array(nb).fill(0);
  D.pool.forEach(t=>{
    const b=U.clamp(Math.floor((t.R-lo)/bw),0,nb-1);bins[b]++;
  });
  const max=Math.max(...bins),BOT=46,TOP=16;
  const cw=(W-24)/nb;
  x.font='15px monospace';
  for(let i=0;i<nb;i++){
    const v=lo+i*bw;
    const h2=max?bins[i]/max*(H-TOP-BOT):0;
    x.fillStyle=v<0?'rgba(242,99,124,.65)':v<1?'rgba(231,182,83,.55)':'rgba(47,214,160,.6)';
    x.fillRect(12+i*cw+1,H-BOT-h2,Math.max(2,cw-2),h2);
    if(bins[i]&&bins[i]>max*0.04){
      x.fillStyle='#9FABBF';x.fillText(String(bins[i]),12+i*cw+2,H-BOT-h2-6);
    }
    if(Number.isInteger(v)){
      x.fillStyle='#67748C';x.fillText(U.sign(v,0),12+i*cw,H-BOT+22);
    }
  }
  x.strokeStyle='rgba(151,166,192,.25)';x.setLineDash([5,5]);
  const zx=12+((0-lo)/bw)*cw;
  x.beginPath();x.moveTo(zx,TOP);x.lineTo(zx,H-BOT);x.stroke();x.setLineDash([]);
  x.fillStyle='#67748C';x.font='15px monospace';
  x.fillText('pooled R distribution · 0.5R buckets · red = losses, amber = scratch wins <1R, green = paid — the desk’s income is the right tail',12,H-10);
})}

/* ── lab self-check — the tie-out promise, executed instead of asserted ── */
function revdSelfCheck(){
  const D=revdData(),checks=[];
  let ok1=true,ok2=true,ok4=true;
  D.fams.forEach(f=>{
    const s=f.trades.reduce((a,t)=>a+t.R,0);
    if(Math.abs(s-f.final)>1e-6)ok1=false;
    if(Math.abs(f.exp*f.n-f.final)>1e-6)ok2=false;
    if(f.wins+f.losses!==f.n)ok4=false;
  });
  const heatN=D.heat.reduce((a,row)=>a+row.reduce((p,c)=>p+c.n,0),0);
  checks.push(['curve final = Σ trades.R, every family',ok1]);
  checks.push(['table exp × n = curve final, every family',ok2]);
  checks.push(['heatmap Σn = pooled ledger length ('+heatN+' = '+D.pool.length+')',heatN===D.pool.length]);
  checks.push(['wins + losses = n, every family',ok4]);
  return checks;
}

/* ── canvas: last-140-trade win/loss strip from the pooled ledger ── */
function revdDrawStreak(){POSTRENDER.push(()=>{
  const cv=document.getElementById('revd-streak');if(!cv)return;
  const D=revdData();
  const W=cv.width=cv.clientWidth*2,H=cv.height=96*2,x=cv.getContext('2d');
  x.fillStyle='#070B12';x.fillRect(0,0,W,H);
  const last=D.pool.slice(-140),mid=H*0.52,bw=W/last.length;
  x.strokeStyle='rgba(151,166,192,.18)';x.lineWidth=1;
  x.beginPath();x.moveTo(0,mid);x.lineTo(W,mid);x.stroke();
  last.forEach((t,i)=>{
    const h=t.win?Math.min(t.R,5)/5*(mid-8):Math.min(Math.abs(t.R),1.6)/1.6*(H-mid-8);
    x.fillStyle=t.win?'rgba(47,214,160,.8)':'rgba(242,99,124,.8)';
    if(t.win)x.fillRect(i*bw+1,mid-h,Math.max(2,bw-2),h);
    else x.fillRect(i*bw+1,mid,Math.max(2,bw-2),h);
  });
  x.fillStyle='#67748C';x.font='15px monospace';
  x.fillText('last 140 cohort trades · bar height ∝ |R| · streaks are visible, not narrated',12,H-8);
})}

/* ── canvas: habit completion strips — one row per habit, oldest → newest ──
   Deterministic demo strips consistent with each gauge’s num/den count:
   exactly num done-cells are placed by a seeded shuffle, so the strip and
   the gauge can never disagree. */
function revdDrawHabits(){POSTRENDER.push(()=>{
  const cv=document.getElementById('revd-habitstrip');if(!cv)return;
  const rows=REVD_COACH.habits;
  const W=cv.width=cv.clientWidth*2,H=cv.height=170*2,x=cv.getContext('2d');
  x.fillStyle='#070B12';x.fillRect(0,0,W,H);
  const L=250,rh=(H-44)/rows.length;
  rows.forEach((h2,ri)=>{
    const r=localRng('revd-habit-'+h2.id);
    /* today owns the newest cell; the seeded shuffle fills history with the
       remaining done-count so strip Σ ALWAYS equals the gauge numerator */
    const lastDone=!!h2.today,firstN=h2.den-1;
    const trues=U.clamp(h2.num-(lastDone?1:0),0,firstN);
    const done=Array.from({length:firstN},(_,i)=>i<trues);
    for(let i=firstN-1;i>0;i--){
      const j=Math.floor(r()*(i+1)),t=done[i];done[i]=done[j];done[j]=t;
    }
    done.push(lastDone);
    const cw2=(W-L-18)/h2.den;
    for(let i=0;i<h2.den;i++){
      x.fillStyle=done[i]?'rgba(47,214,160,.62)':'rgba(242,99,124,.30)';
      x.fillRect(L+i*cw2+1,ri*rh+10,Math.max(2,cw2-3),rh-14);
    }
    x.fillStyle='#9FABBF';x.font='15px monospace';
    x.fillText(h2.label.slice(0,26),12,ri*rh+10+rh/2+4);
  });
  x.fillStyle='#67748C';x.font='15px monospace';
  x.fillText('oldest → newest · green done, red missed · demo strips forced to match each gauge exactly (seeded shuffle)',12,H-10);
})}

/* ═══════════ VIEW · review.patterns — the Pattern Lab ═══════════ */
VIEWS['review.patterns']=function(){
  const D=revdData();
  const decaying=D.fams.filter(f=>f.state==='DECAYING');
  const best=D.fams.slice().sort((a,b)=>b.exp-a.exp)[0];
  const worstEff=revdWorstEff();
  const f0=D.fams[0];
  let h=vhead('REVIEW · pattern analytics lab','Pattern Lab '+chip('5y demo cohort','ch-demo','◈'),
    'Five years of cohort trades interrogated, not admired. Every number in every table below is computed '
    +'from the same arrays the canvases plot — where a chart and a table disagree, the build is broken. '
    +'The quarter table in Performance uses the live paper window; this lab is the long memory.');
  h+='<div class="grid g4">'+
    stat('Cohort trades',U.int(D.nAll),'5 families · 5 years · seeded, deterministic')+
    stat('Pooled expectancy',U.R(D.meanAll),'per-trade σ '+U.fmt(D.sdAll,2)+'R — dispersion drives the n-doctrine below')+
    stat('Best family','<span style="font-size:12px">'+U.esc(best.nm)+'</span>',U.R(best.exp)+' over n='+best.n)+
    stat('Decaying',decaying.length+' of 5',
      decaying.length?decaying.map(f=>f.nm.split(' ')[0]).join(' · ')+' — slope test below':'no family under the slope floor')+
  '</div>';
  h+='<div class="grid g4">'+
    stat('Median winner MFE',U.fmt(D.medWinMfe,2)+'R','the number behind the 2R partial — details in the scatter')+
    stat('Capture ratio',U.fmt(D.capRatio*100,0)+'%','of offered winner excursion actually banked, desk-wide')+
    stat('Worst efficiency','<span style="font-size:12px">'+U.esc(worstEff.nm)+'</span>',
      U.fmt(worstEff.eff*100,0)+'% · '+worstEff.leak.toLowerCase()+' — autopsy button below')+
    stat('Losers seeing 2R first',U.fmt(D.losers2R,1)+'%','why the partial pays winners, not bad trades')+
  '</div>';

  /* ── (a) setup cohort curves ── */
  h+=panel('SETUP COHORT CURVES — five families, one axis','cumulative R over the 5y demo cohort · '
    +'<span class="demo-wm">demo twin</span> · the stat table is DERIVED from these exact series',
    '<canvas id="revd-cohort" class="cv" style="height:280px"></canvas>'+
    '<div class="row" style="margin-top:8px">'+
      D.fams.map(f=>'<span class="pill"><span style="display:inline-block;width:9px;height:9px;border-radius:2px;background:'
        +f.col+';margin-right:5px"></span>'+U.esc(f.nm)+'</span>').join('')+
    '</div>'+
    tbl(['Family','>n','>Σ R','>Exp / trade','>Win %','>PF','>Worst L-streak','>Max DD','State',''],
      D.fams.map(f=>'<tr'+(f.state==='DECAYING'?' style="background:var(--warn-bg)"':'')+'>'+
        '<td><b>'+U.esc(f.nm)+'</b><div class="i2" style="font-size:9.5px">'+U.esc(f.def)+'</div></td>'+
        '<td class="r num">'+f.n+'</td>'+
        '<td class="r num '+(f.final>=0?'up':'dn')+'">'+U.R(f.final,1)+'</td>'+
        '<td class="r num '+(f.exp>=0?'up':'dn')+'">'+U.R(f.exp)+'</td>'+
        '<td class="r num">'+U.fmt(f.winPct,0)+'%</td>'+
        '<td class="r num">'+U.fmt(f.pf,2)+'</td>'+
        '<td class="r num">'+f.worstRun+'</td>'+
        '<td class="r num dn">−'+U.fmt(f.maxDD,1)+'R</td>'+
        '<td>'+chip(f.state,f.state==='DECAYING'?'ch-blk':f.state==='WATCH'?'ch-warn':'ch-ok',
          f.state==='DECAYING'?'⛔':f.state==='WATCH'?'!':'✓')+'</td>'+
        '<td>'+CMD.btn('pattern.dossier',f.key,'sm','Dossier')+'</td></tr>').join(''))+
    '<div class="i2" style="font-size:10.5px;padding:8px 12px">TIE-OUT: the '+U.esc(f0.nm)+' curve ends at '
      +U.R(f0.final,1)+' after '+f0.n+' trades → the table’s '+U.R(f0.exp)+' is exactly '
      +U.fmt(f0.final,1)+' ÷ '+f0.n+'. One array, two renderings. If a future edit breaks this identity, '
      +'the lab is lying and must be fixed before it is read. Two lab families (Trend Day VWAP, Compression '
      +'Break) audition here before any playbook promotion — cohort first, capital later.</div>',
    {head:CMD.btn('pattern.norm',null,'sm',REVD_ST.norm?'Show cumulative R':'Show expectancy-to-date')});

  /* ── cohort aging + regime split — two more honest cuts of the same arrays ── */
  const regNames=['RISK-ON','CHOP','RISK-OFF','SQUEEZE'];
  h+='<div class="grid g2">';
  h+=panel('COHORT AGING — expectancy per year, per family','the decay detector in discrete form · '
    +'<span class="demo-wm">demo twin</span>',
    tbl(['Family','>Y1','>Y2','>Y3','>Y4','>Y5'],
      D.fams.map(f=>'<tr><td><b>'+U.esc(f.nm)+'</b></td>'+
        f.byYear.map(b=>{
          const e=b.n?b.sum/b.n:null;
          return'<td class="r num '+(e===null?'i2':e>=0?'up':'dn')+'"'+(b.n<30?' style="opacity:.55" title="n='
            +b.n+' < 30 — thin, disbelieve"':'')+'>'+(e===null?'—':U.sign(e,2))
            +'<div class="i2" style="font-size:8.5px">n'+b.n+'</div></td>';
        }).join('')+'</tr>').join(''))+
    '<div class="i2" style="font-size:10.5px;padding:8px 12px">Read the rows, not the cells: the slope test’s '+
      (decaying.length?'DECAYING flags ('+decaying.map(f=>f.nm.split(' ')[0]).join(', ')+') reappear here as '
        +'fading rows':'verdicts reappear here')+' — the same story in buckets, WITH all the bucket noise '+
      'the thin-cell law predicts (a 30–80-trade year bucket wobbles by ±0.3–0.5R from sampling alone). '+
      'Buckets corroborate the slope test; they never overrule it. Dimmed cells are n<30.</div>',{flush:true});
  h+=panel('REGIME SPLIT — the same trades, cut by tape','regime outranks pattern (authority hierarchy); '
    +'this table is why · <span class="demo-wm">demo twin</span>',
    tbl(['Family'].concat(regNames.map(r2=>'>'+r2)),
      D.fams.map(f=>'<tr><td><b>'+U.esc(f.nm)+'</b></td>'+
        regNames.map(r2=>{
          const b=f.byReg[r2];
          const e=b&&b.n?b.sum/b.n:null;
          return'<td class="r num '+(e===null?'i2':e>=0?'up':'dn')+'"'+(b&&b.n<30?' style="opacity:.55" title="n='
            +b.n+' < 30 — thin"':'')+'>'+(e===null?'—':U.sign(e,2))
            +'<div class="i2" style="font-size:8.5px">n'+(b?b.n:0)+'</div></td>';
        }).join('')+'</tr>').join(''))+
    (function(){
      const rp={};D.pool.forEach(t=>{const c=rp[t.reg]||(rp[t.reg]={n:0,s:0});c.n++;c.s+=t.R});
      const rows=regNames.map(r2=>({r:r2,n:(rp[r2]||{n:0}).n,e:rp[r2]&&rp[r2].n?rp[r2].s/rp[r2].n:0}));
      const worst=rows.slice().sort((a,b)=>a.e-b.e)[0];
      return'<div class="i2" style="font-size:10.5px;padding:8px 12px">Same law as the scenario grid in '+
      'Markets → Regime: the desk trades only cells that survive their regime. Pooled: '+
      rows.map(x=>x.r+' '+U.sign(x.e,2)+' (n'+x.n+')').join(' · ')+' — the worst tape is '+worst.r
      +(worst.n<60?', on thin n; treat it as a caution, not a verdict':'')
      +'. One trap this table sets for the careless: regime blocks CORRELATE with cohort age, so a regime '+
      'can look fine simply because its sessions predate the decay era — always read this table WITH the '+
      'aging table, never alone. The regime term is IN the generated series; this table discovers it, it '+
      'does not decorate it.</div>';
    })(),{flush:true});
  h+='</div>';

  /* ── correlation matrix + Kelly arithmetic — portfolio truths per family ── */
  const CM=revdCorr();
  h+='<div class="grid g2">';
  h+=panel('FAMILY CORRELATION — monthly R, Pearson pairwise','families that lose together are ONE bet — '
    +'RISK-031 applied to setups instead of sectors · <span class="demo-wm">demo twin</span>',
    tbl(['ρ (60 demo months)'].concat(D.fams.map(f=>'>'+f.nm.split(' ')[0])),
      D.fams.map((f,i)=>'<tr><td><b>'+U.esc(f.nm.split(' ')[0])+'</b></td>'+
        CM[i].map((c,j)=>{
          const hot=i!==j&&Math.abs(c)>=0.5;
          return'<td class="r num'+(i===j?' i2':hot?' dn':'')+'"'+(hot?' title="|ρ| ≥ 0.5 — treat as one bet when both are armed"':'')
            +'>'+(i===j?'1.00':U.sign(c,2))+'</td>';
        }).join('')+'</tr>').join(''))+
    '<div class="i2" style="font-size:10.5px;padding:8px 12px">Method: per family, R is summed into 21-session '+
      'demo months (60 buckets), then Pearson ρ pairwise. Any off-diagonal |ρ| ≥ 0.5 turns red: running both '+
      'families armed at full size is the correlation mistake the exposure seat (S33) blocks for sectors — '+
      'the same law applies to setups, it just hides better.</div>',{flush:true});
  h+=panel('KELLY ARITHMETIC — computed, then deliberately undercut','the desk sizes at ~1/10th Kelly, and the '
    +'n-doctrine below is the reason · <span class="demo-wm">demo twin</span>',
    tbl(['Family','>p (win)','>b (avg win R)','>Full Kelly','>Half','>Tenth','>Desk cap'],
      D.fams.map(f=>{
        const k=revdKelly(f);
        return'<tr><td><b>'+U.esc(f.nm)+'</b></td>'+
        '<td class="r num">'+U.fmt(k.p*100,0)+'%</td>'+
        '<td class="r num">'+U.fmt(k.b,2)+'</td>'+
        '<td class="r num">'+U.fmt(Math.max(0,k.full)*100,1)+'%</td>'+
        '<td class="r num i2">'+U.fmt(Math.max(0,k.half)*100,1)+'%</td>'+
        '<td class="r num i2">'+U.fmt(Math.max(0,k.tenth)*100,1)+'%</td>'+
        '<td class="r num" style="color:var(--paper)">'+ck('risk.max_trade_risk_pct')+'%</td></tr>';
      }).join(''))+
    '<div class="i1" style="font-size:11px;padding:8px 12px;line-height:1.65">Kelly f* = p − (1−p)/b assumes '+
      'p and b are KNOWN. The standard-error table at the bottom of this page says they are estimates with '+
      'wide bands at any realistic n. Overestimate the edge 2× at full Kelly and the geometric growth math '+
      'turns into ruin math; at a tenth of Kelly the same estimation error is a bad quarter. The desk cap '+
      prov('risk.max_trade_risk_pct')+' sits at or below tenth-Kelly for every family above — humility, '+
      'priced in percent.</div>',{flush:true});
  h+='</div>';

  /* ── (b) edge-decay detector ── */
  const selFam=revdFam(REVD_ST.fam);
  h+=panel('EDGE-DECAY DETECTOR — rolling 30-trade expectancy, slope-tested',
    'edges decay as they crowd; the slope test hears it before the P&L does · <span class="demo-wm">demo twin</span>',
    '<div class="btnrow" style="margin-bottom:8px">'+
      D.fams.map(f=>'<button class="btn sm'+(REVD_ST.fam===f.key?' pri':'')+'" data-cmd="pattern.fam" data-arg="'
        +f.key+'">'+U.esc(f.nm)+(f.state==='DECAYING'?' ⛔':'')+'</button>').join('')+
      '<span class="pill" style="margin-left:auto">window</span>'+
      [20,30,50].map(w=>'<button class="btn sm'+(REVD_ST.win===w?' pri':'')
        +'" data-cmd="pattern.window" data-arg="'+w+'">'+w+(w===30?' ◆':'')+'</button>').join('')+
    '</div>'+
    '<canvas id="revd-decay" class="cv" style="height:210px"></canvas>'+
    tbl(['Family','>Slope@30 mR/t','>Slope@'+REVD_ST.win+' mR/t','>Threshold','>Rolling points','Verdict','Response'],
      D.fams.map(f=>{
        const altM=revdSlopeMB(revdRollOf(f,REVD_ST.win)).m*1000;
        return'<tr'+(f.state==='DECAYING'?' style="background:var(--warn-bg)"':'')+'>'+
        '<td><b>'+U.esc(f.nm)+'</b></td>'+
        '<td class="r num '+(f.slopeMr<=REVD_DECAY_TH?'dn':f.slopeMr<=-0.5?'':'up')+'">'+U.sign(f.slopeMr,2)+'</td>'+
        '<td class="r num i2">'+U.sign(altM,2)+'</td>'+
        '<td class="r num i2">'+U.fmt(REVD_DECAY_TH,1)+'</td>'+
        '<td class="r num i2">'+f.roll.length+'</td>'+
        '<td>'+chip(f.state,f.state==='DECAYING'?'ch-blk':f.state==='WATCH'?'ch-warn':'ch-ok','◆')+'</td>'+
        '<td>'+(f.state==='DECAYING'
          ?CMD.btn('pattern.flag',f.key,'sm neg','File decay ask →')
          :f.state==='WATCH'?'<span class="i2" style="font-size:10.5px">monitor — no action below the floor</span>'
          :'<span class="i2" style="font-size:10.5px">—</span>')+'</td></tr>';
      }).join(''))+
    '<div class="i2" style="font-size:10.5px;padding:6px 12px 0">The DECAYING flag is ALWAYS the 30-window '+
      'verdict (◆ constitutional — same n as the GOV-030 evidence bar). Other windows are lenses: 20 is '+
      'twitchier, 50 is calmer, and if your conclusion needs a specific window to survive, you do not have '+
      'a conclusion — you have a preference.</div>'+
    '<div class="banner warn" style="margin:10px 0 4px"><span class="bico">!</span><div>'+
      '<b>Doctrine — edges decay because they crowd:</b> every profitable pattern recruits its own competition; '+
      'the counterparty learns, the fill degrades, the win rate erodes from the tail of the cohort inward. '+
      'A slope of '+U.sign(selFam.slopeMr,2)+' mR/trade on '+U.esc(selFam.nm)+' means ≈ '
      +U.sign(selFam.slopeMr*0.3,2)+'R of expectancy drift per 300 trades. The RESPONSE LADDER is fixed, not '+
      'negotiated: <b>1)</b> reduce size one rung → <b>2)</b> paper-only for 30 samples (GOV-030 evidence bar) → '+
      '<b>3)</b> retire to the graveyard with a tombstone and a resurrection condition. Retirement decisions '+
      'travel through governance '+prov('LAW-013')+' — a decay ask files the question, a human answers it.</div></div>');

  /* ── (c) time heatmap ── */
  h+=panel('TIME HEATMAP — day-of-week × entry-hour expectancy','when the edge lives, from the same pooled ledger · '
    +'<span class="demo-wm">demo twin</span>',
    '<canvas id="revd-heat" class="cv" style="height:250px"></canvas>'+
    (function(){
      const agg=hs=>{let n=0,s=0;D.heat.forEach(row=>hs.forEach(h2=>{n+=row[h2-9].n;s+=row[h2-9].sum}));
        return{n,e:n?s/n:0}};
      const kz=agg([10,11]),dd=agg([12,13]);
      return'<div class="i1" style="font-size:11px;margin-top:8px;line-height:1.6">'+
      'The 10:00–11:00 columns carry the book ('+U.sign(kz.e,2)+'R per trade pooled, n='+kz.n
      +') while 12:00–13:00 pays '+U.sign(dd.e,2)+'R (n='+dd.n+') — both numbers computed from the grid you '+
      'are looking at. But read the borders before the colors: <b>thin cells lie.</b> A cell needs n≥30 '+
      'before it is believed (the GOV-030 evidence bar applied to a grid cell); below that its expectancy is '+
      'mostly sampling noise — see the standard-error arithmetic at the bottom of this page. A +2R cell at '+
      'n=6 is a story; at n=60 it is a schedule.</div>';
    })(),
    {head:CMD.btn('pattern.cells',null,'sm',REVD_ST.cells?'Hide n per cell':'Show n per cell')});

  /* ── marginals + seasonality — bigger n, sturdier claims ── */
  const hourMarg=Array.from({length:7},(_,h2)=>D.heat.reduce((a,row)=>({n:a.n+row[h2].n,sum:a.sum+row[h2].sum}),{n:0,sum:0}));
  const dowMarg=D.heat.map(row=>row.reduce((a,c)=>({n:a.n+c.n,sum:a.sum+c.sum}),{n:0,sum:0}));
  const months=revdMonths();
  h+='<div class="grid g2">';
  h+=panel('HEATMAP MARGINALS — rows and columns, pooled','marginals carry 5–7× the n of any cell; '
    +'claim from these first · <span class="demo-wm">demo twin</span>',
    '<div class="grid g2"><div>'+
    tbl(['Entry hour','>n','>Exp R'],hourMarg.map((c,i)=>'<tr><td class="mono">'+String(9+i).padStart(2,'0')
      +':xx</td><td class="r num i2">'+c.n+'</td><td class="r num '+(c.n&&c.sum/c.n>=0?'up':'dn')+'">'
      +(c.n?U.sign(c.sum/c.n,2):'—')+'</td></tr>').join(''))+
    '</div><div>'+
    tbl(['Day','>n','>Exp R'],dowMarg.map((c,i)=>'<tr><td class="mono">'+['Mon','Tue','Wed','Thu','Fri'][i]
      +'</td><td class="r num i2">'+c.n+'</td><td class="r num '+(c.n&&c.sum/c.n>=0?'up':'dn')+'">'
      +(c.n?U.sign(c.sum/c.n,2):'—')+'</td></tr>').join(''))+
    '</div></div>'+
    '<div class="i2" style="font-size:10.5px;padding:6px 12px 0">A cell needs n≥30; a marginal usually has '+
      'hundreds. When a cell and its marginal disagree, believe the marginal until the cell earns its n — '+
      'a 10:xx edge that survives every weekday is a schedule; “Wednesday 14:xx” alone is still a rumor. '+
      'And when a single marginal spikes on modest n, the lab notes it and demands more n before anyone '+
      'schedules around it.</div>'+
    (function(){
      const dol=D.pool.filter(t=>t.hour===12||t.hour===13);
      const rest=D.pool.filter(t=>t.hour!==12&&t.hour!==13);
      const eAll=D.meanAll,eRest=rest.length?rest.reduce((a,t)=>a+t.R,0)/rest.length:0;
      const dolSum=dol.reduce((a,t)=>a+t.R,0);
      const verdict=dolSum<0
        ?'The removed cohort is NEGATIVE here — that is a CUT candidate: the desk pays nothing to drop it.'
        :'The removed cohort is positive but below the book average — DILUTIVE, not toxic. The desk cuts '+
         'only negative cohorts outright; a dilutive one earns a THROTTLE (smaller size, higher grade bar), '+
         'which is exactly what the lunch-throttle proposal (MM-LUNCH-001) is — a throttle, not a ban.';
      return'<div class="banner warn" style="margin:8px 0 0"><span class="bico">!</span><div>'+
        '<b>What cutting the doldrums would have cost and bought:</b> excluding 12–13h removes '+dol.length
        +' trades worth '+U.R(dolSum,1)+' total, and moves per-trade expectancy from '+U.R(eAll)+' to '
        +U.R(eRest)+'. Selectivity trades gross R for edge density — it is never free. '+verdict+'</div></div>';
    })());
  h+=panel('SEASONALITY — month-of-year, pooled','21-session demo months · the weakest cut on this page, '
    +'shown WITH its n so it cannot oversell itself · <span class="demo-wm">demo twin</span>',
    tbl(['Month','>n','>Exp R',''],months.map((c,i)=>{
      const e=c.n?c.sum/c.n:null;
      return'<tr><td class="mono">'+['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i]
      +'</td><td class="r num i2">'+c.n+'</td>'+
      '<td class="r num '+(e===null?'i2':e>=0?'up':'dn')+'">'+(e===null?'—':U.sign(e,2))+'</td>'+
      '<td>'+(c.n<30?'<span class="tag">thin</span>':'<div class="gauge" style="width:90px"><i style="width:'
        +Math.round(Math.min(1,Math.abs(e)/0.8)*100)+'%"></i></div>')+'</td></tr>';
    }).join(''))+
    '<div class="i2" style="font-size:10.5px;padding:6px 12px 0">Seasonality is where confirmation bias goes '+
      'to shop. Five years gives each month ~100 trades pooled across ALL families and regimes — enough to '+
      'glance at, not enough to schedule around. No desk rule cites this table, on purpose.</div>');
  h+='</div>';

  /* ── (d) MFE / MAE excursion scatter ── */
  h+=panel('MFE / MAE SCATTER — what every trade offered vs what it cost',
    'max favorable vs max adverse excursion, per trade · <span class="demo-wm">demo twin</span>',
    '<div class="btnrow" style="margin-bottom:8px">'+
      ['ALL','WIN','LOSS'].map(m=>'<button class="btn sm'+(REVD_ST.sc===m?' pri':'')
        +'" data-cmd="pattern.scmode" data-arg="'+m+'">'+m+'</button>').join('')+
      '<span class="pill">'+U.int(D.pool.length)+' trades plotted</span>'+
    '</div>'+
    '<canvas id="revd-scatter" class="cv" style="height:270px"></canvas>'+
    '<div class="grid g4" style="margin-top:10px">'+
      stat('Median winner MFE',U.fmt(D.medWinMfe,2)+'R','half of all winners never travel further')+
      stat('Capture ratio',U.fmt(D.capRatio*100,0)+'%','Σ captured R ÷ Σ winner MFE — the exit-efficiency headline')+
      stat('Winners reaching 2R MFE',U.fmt(D.winsPast2R,0)+'%','the 2R partial pays on this share of winners')+
      stat('Losers reaching 2R MFE',U.fmt(D.losers2R,1)+'%','a 2R partial almost never rescues a loser')+
    '</div>'+
    '<div class="banner gold" style="margin-top:8px"><span class="bico">◆</span><div>'+
      '<b>The management rule this justifies — partial at 2R:</b> the median winner’s MFE is <b>'
      +U.fmt(D.medWinMfe,2)+'R</b>, computed from the winners plotted above — half of all winners never '+
      'travel beyond it. A plan that only pays at '+U.fmt(D.medWinMfe,1)+'R+ therefore forfeits half its '+
      'winners at the peak, while a partial tranche at 2R banks payment on '+U.fmt(D.winsPast2R,0)
      +'% of winners and leaves the runner — FSM-owned, not nerve-owned — to chase the exponential tail. And '+
      'because only '+U.fmt(D.losers2R,1)+'% of losers ever print +2R of open profit, the partial is not a '+
      'bailout mechanism for bad trades: it pays winners, and only winners. This is the arithmetic behind '+
      'the 25/50/75 template’s first trim, restated from excursion data instead of asserted.</div></div>');

  /* ── exit-policy simulator — same trades, different exits, live slider ── */
  const sim=revdExitSim(REVD_ST.tp);
  h+=panel('EXIT-POLICY SIMULATOR — replay the cohort under a different exit',
    'a lens, not a backtest: no fees, no fills, runner model printed below · <span class="demo-wm">demo twin</span>',
    '<div class="row" style="margin-bottom:10px;align-items:center">'+
      '<span class="mono i2" style="font-size:10px">PARTIAL LEVEL</span>'+
      '<input type="range" min="1" max="4" step="0.25" value="'+REVD_ST.tp+'" data-cmdin="pattern.tp" style="flex:1;max-width:380px">'+
      '<span class="mono" style="font-size:12px;color:var(--paper)">'+U.fmt(REVD_ST.tp,2)+'R</span>'+
      '<span class="pill">median winner MFE '+U.fmt(D.medWinMfe,2)+'R sits on this axis</span>'+
    '</div>'+
    tbl(['Family','>n','>AS TRADED','>PARTIAL@'+U.fmt(REVD_ST.tp,2)+'R','>Δ partial','>FULL TP@'+U.fmt(REVD_ST.tp,2)+'R','>Δ full'],
      sim.per.map(p=>{
        const dP=p.part-p.asT,dF=p.full-p.asT;
        return'<tr><td><b>'+U.esc(p.nm)+'</b></td>'+
        '<td class="r num">'+p.n+'</td>'+
        '<td class="r num">'+U.R(p.asT,1)+'</td>'+
        '<td class="r num">'+U.R(p.part,1)+'</td>'+
        '<td class="r num '+(dP>=0?'up':'dn')+'">'+U.R(dP,1)+'</td>'+
        '<td class="r num">'+U.R(p.full,1)+'</td>'+
        '<td class="r num '+(dF>=0?'up':'dn')+'">'+U.R(dF,1)+'</td></tr>';
      }).join('')+
      '<tr style="border-top:1px solid var(--line)"><td><b>POOLED</b></td>'+
        '<td class="r num">'+U.int(D.pool.length)+'</td>'+
        '<td class="r num">'+U.R(sim.tot.asT,1)+'</td>'+
        '<td class="r num">'+U.R(sim.tot.part,1)+'</td>'+
        '<td class="r num '+(sim.tot.part-sim.tot.asT>=0?'up':'dn')+'">'+U.R(sim.tot.part-sim.tot.asT,1)+'</td>'+
        '<td class="r num">'+U.R(sim.tot.full,1)+'</td>'+
        '<td class="r num '+(sim.tot.full-sim.tot.asT>=0?'up':'dn')+'">'+U.R(sim.tot.full-sim.tot.asT,1)+'</td></tr>')+
    '<div class="i1" style="font-size:11px;padding:8px 12px;line-height:1.65"><b>Model, verbatim:</b> '+
      'PARTIAL@X banks 50% at X whenever the trade’s MFE reached X and keeps the trade’s ACTUAL realized R on '+
      'the other half — conservative, because it ignores the stop-to-BE improvement a partial usually buys. '+
      'FULL TP@X exits everything at X when MFE reached X. Drag the slider across the median winner MFE and '+
      'watch the full-TP column: capping at the median is where it stops buying loss-rescue and starts '+
      'amputating the tail. Use this to RANK exit policies; promotion of an exit rule still requires the '+
      'court and 30 paper samples like everything else '+prov('LAW-013')+'.</div>',{flush:true});

  /* ── R distribution + tail concentration — where the income actually lives ── */
  const tail=revdTail();
  h+=panel('R DISTRIBUTION — the shape of the business','fat right tail, formulaic left wall · '
    +'<span class="demo-wm">demo twin</span>',
    '<canvas id="revd-dist" class="cv" style="height:230px"></canvas>'+
    '<div class="grid g4" style="margin-top:10px">'+
      stat('Top 5% of trades',U.R(tail.top5,0),'carry '+(tail.posSum?U.fmt(tail.top5/tail.posSum*100,0):0)
        +'% of ALL positive R ('+tail.top5n+' trades)')+
      stat('Delete the 10 best',U.R(tail.expCut),'pooled expectancy falls from '+U.R(tail.expAll)
        +' — the tail IS the edge')+
      stat('Left wall','−1R by law','losses are engineered to a constant; the right side is where variance is allowed to live')+
      stat('Doctrine','<span style="font-size:11px">PROTECT THE TAIL</span>','every early exit, every capped runner, '
        +'every “take the sure thing” bleeds the only column that pays')+
    '</div>'+
    '<div class="i2" style="font-size:10.5px;margin-top:8px">This histogram is the runner doctrine stated as a '+
      'shape: win rate is cosmetics, the tail is income. It is also the honest warning — remove ten trades '+
      'from five years and the business model visibly sags, which is why nothing on this desk is allowed to '+
      'jeopardize tail capture except a structural stop.</div>');

  /* ── (e) exit-efficiency table ── */
  h+=panel('EXIT EFFICIENCY — captured vs offered, per family, leak named',
    'the gap between MFE and captured R is a leak with a name and a fix · <span class="demo-wm">demo twin</span>',
    tbl(['Family','>Avg captured R','>Avg winner MFE','>Efficiency','Named leak','Evidence (from this cohort)'],
      D.fams.map(f=>'<tr'+(f.key===worstEff.key?' style="background:var(--warn-bg)"':'')+'>'+
        '<td><b>'+U.esc(f.nm)+'</b></td>'+
        '<td class="r num">'+U.fmt(f.avgCap,2)+'R</td>'+
        '<td class="r num">'+U.fmt(f.avgMfe,2)+'R</td>'+
        '<td class="r num '+(f.eff>=0.72?'up':f.eff>=0.62?'':'dn')+'">'+U.fmt(f.eff*100,0)+'%</td>'+
        '<td>'+chip(f.leak,f.leak==='NONE DOMINANT'?'ch-ok':f.leak==='EARLY EXIT'?'ch-warn':'ch-neg',
          f.leak==='NONE DOMINANT'?'✓':'!')+'</td>'+
        '<td class="i1" style="font-size:10.5px">'+U.esc(f.leakEv)+'</td></tr>').join(''))+
    '<div class="i2" style="font-size:10.5px;padding:8px 12px">Leak taxonomy: <b>EARLY EXIT</b> = efficiency '+
      'under 62% (profit taken before the offer finished) · <b>STOP TOO TIGHT</b> = ≥30% of losers saw +1R '+
      'first (invalidation inside the noise band) · <b>LATE EXIT</b> = average realized loss beyond −1.08R '+
      '(the plan said −1.00R; hope paid the difference). Worst efficiency right now: <b>'+U.esc(worstEff.nm)
      +'</b> at '+U.fmt(worstEff.eff*100,0)+'% — the autopsy button files exactly that family to the court.</div>'+
    '<div class="btnrow" style="padding:0 12px 10px">'+
      CMD.btn('pattern.autopsyq',null,'gold','File worst-efficiency family to Learning Court →')+
      CMD.btn('pattern.csv',null,'sm','Download cohort CSV')+
      CMD.btn('pattern.docket',null,'sm','Open court docket')+
      CMD.btn('pattern.inbox',null,'sm','Open ask inbox')+
    '</div>',{flush:true});

  /* ── (f) setup graveyard ── */
  h+=panel('SETUP GRAVEYARD — retired edges, honestly buried','a tombstone is cheaper than a slow bleed; '
    +'every grave minted a lesson chunk and most name a resurrection condition',
    '<div class="grid g2">'+REVD_GRAVE.map(g=>
      '<div style="border:1px solid var(--line);border-radius:var(--r);padding:11px 13px">'+
        '<div class="row" style="justify-content:space-between;margin-bottom:4px">'+
          '<b style="font-size:12.5px">✝ '+U.esc(g.nm)+'</b>'+
          chip(g.cause,g.cause==='CROWDING'?'ch-warn':g.cause==='REGIME CHANGE'?'ch-info':'ch-neg','◆')+
        '</div>'+
        '<div class="mono i2" style="font-size:10px;margin-bottom:6px">active '+U.esc(g.period)
          +' · lifetime <span class="'+(g.lifeR.startsWith('−')?'dn':'up')+'">'+U.esc(g.lifeR)+'</span></div>'+
        '<div class="i1" style="font-size:11px;line-height:1.6;margin-bottom:6px">'+U.esc(g.story)+'</div>'+
        kv('LESSON CHUNK','<span class="mono" style="color:var(--paper)">'+U.esc(g.chunk)
          +'</span> — cited at gate-time when a lookalike setup appears')+
        kv('RESURRECTION',U.esc(g.resurrect))+
        '<div style="margin-top:6px">'+(g.resurrect.startsWith('none')
          ?chip('NO WATCH — permanent','ch-mut','·')
          :chip('WATCH ACTIVE · condition NOT MET','ch-info','◆'))+
        ' <span class="i2" style="font-size:9.5px">'+(g.resurrect.startsWith('none')
          ?'overfit graves are not monitored — there is nothing to wait for'
          :'S05/S08 evaluate the condition nightly; a MET flag files an ask, never an auto-revival')+'</span></div>'+
      '</div>').join('')+'</div>'+
    '<div class="i2" style="font-size:10.5px;margin-top:8px">Doctrine: the graveyard is append-only. A retired '+
      'setup that meets its resurrection condition re-enters at PAPER tier with a fresh 30-sample cohort — '+
      'it never resumes its old size on its old reputation. Triple-Tap is kept visible as negative training: '+
      'the overfit tombstone teaches more than most winners.</div>');

  /* ── BT-register reconciliation — two stores, one truth requirement ── */
  h+=panel('BT REGISTER ↔ COHORT RECONCILIATION','the backtest register (S30) and this lab measure different '
    +'windows — they must reconcile, not match',
    tbl(['Family','BT id','>BT exp (register)','>Cohort exp (5y)','>Divergence','Reading'],
      D.fams.map(f=>{
        const pb=(typeof PLAYBOOKS!=='undefined'?PLAYBOOKS:[]).find(p=>p.nm===f.nm);
        const btExp=pb?parseFloat(String(pb.bt.exp).replace(/[+R]/g,'')):null;
        const dv=btExp===null?null:btExp-f.exp;
        return'<tr'+(dv!==null&&Math.abs(dv)>0.9?' style="background:var(--warn-bg)"':'')+'>'+
        '<td><b>'+U.esc(f.nm)+'</b></td>'+
        '<td class="mono" style="font-size:10.5px">'+(pb?pb.bt.id:'<span class="i2">lab-only — no BT id yet</span>')+'</td>'+
        '<td class="r num">'+(pb?U.esc(pb.bt.exp):'—')+'</td>'+
        '<td class="r num">'+U.R(f.exp)+'</td>'+
        '<td class="r num '+(dv===null?'i2':Math.abs(dv)>0.9?'dn':'')+'">'+(dv===null?'—':U.sign(dv,2))+'</td>'+
        '<td class="i2" style="font-size:10.5px">'+(pb
          ?(Math.abs(dv)>0.9
            ?'register sample is the curated promotion window; the 5y cohort includes the decay era — a gap this '
             +'wide is EXPECTED for a decaying family and is itself evidence'
            :'inside tolerance — the promotion-gate number and the long memory agree')
          :'auditioning in the lab; earns a BT id only via S30 replay + parity gates')+'</td></tr>';
      }).join(''))+
    '<div class="i2" style="font-size:10.5px;padding:8px 12px">Reconciliation doctrine: two stores measuring '+
      'the same family may differ in WINDOW but never in ARITHMETIC. A divergence explained by window '+
      '(“register = best recent era, cohort = full history including decay”) is information; a divergence '+
      'with no window story is a parity defect and goes to S30 before anyone trades the number.</div>',{flush:true});

  /* ── next actions — the lab’s synthesis, one line per family ── */
  h+=panel('NEXT REVIEW ACTIONS — what this page wants from you','a lab that ends without an action list is '
    +'entertainment; each line routes to the organ that owns it',
    D.fams.map(f=>{
      let act,btn='';
      if(f.state==='DECAYING'){
        act='DECAYING at '+U.sign(f.slopeMr,2)+' mR/trade — pick a response-ladder rung';
        btn=REVD_ST.flagged[f.key]?'<span class="tag">ask filed ✓</span>':CMD.btn('pattern.flag',f.key,'sm neg','File decay ask');
      }else if(f.key===revdWorstEff().key&&f.eff<0.62){
        act='worst exit efficiency on the desk ('+U.fmt(f.eff*100,0)+'%, '+f.leak.toLowerCase()+') — exit-doctrine review candidate';
        btn=REVD_ST.autopsied?'<span class="tag">on the docket ✓</span>':CMD.btn('pattern.autopsyq',null,'sm gold','File to court');
      }else if(f.leak==='STOP TOO TIGHT'){
        act=U.fmt(f.tightPct,0)+'% of losers ran +1R first — invalidation placement review, structure-side not tighter-side';
        btn='<span class="i2" style="font-size:10px">route: S12 structure lane</span>';
      }else if(f.state==='WATCH'){
        act='slope '+U.sign(f.slopeMr,2)+' mR/trade above the floor but negative — re-test at +30 trades, no action before';
        btn='<span class="i2" style="font-size:10px">calendar: automatic, S31 nightly</span>';
      }else{
        act='healthy and efficient — NO ACTION. Leaving a working edge alone is the rarest discipline in this building';
        btn='<span class="i2" style="font-size:10px">touch nothing</span>';
      }
      return'<div class="kv"><span class="k" style="min-width:150px"><b>'+U.esc(f.nm)+'</b></span>'+
        '<span class="v"><span class="row" style="justify-content:space-between;align-items:center">'+
        '<span class="i1" style="font-size:11px">'+U.esc(act)+'</span><span>'+btn+'</span></span></span></div>';
    }).join(''));

  /* ── closing grid: statistical honesty + committee consumers ── */
  h+='<div class="grid g2">';
  const sd=D.sdAll,se=n2=>sd/Math.sqrt(n2);
  const needN=Math.ceil(Math.pow(1.96*sd/0.25,2));
  h+=panel('WHAT n IS ENOUGH — the standard error of expectancy','statistical honesty: the desk demands n≥30 '
    +'before believing a number, and this is the arithmetic why',
    tbl(['>n','>SE of expectancy','>95% band (±1.96·SE)','What you can honestly claim'],[
      [10,se(10),'a coin flip wearing a lab coat — even the SIGN of the edge is unresolved'],
      [30,se(30),'the GOV-030 floor: a strong edge separates from zero, a thin one does not'],
      [100,se(100),'families rank against each other; sizing may lean on the number'],
      [300,se(300),'cell-level claims (heatmap hours, grade bands) become defensible'],
      [1000,se(1000),'regime-split sub-cohorts become readable without self-deception'],
    ].map(r=>'<tr><td class="r num">'+r[0]+'</td><td class="r num">±'+U.fmt(r[1],2)+'R</td>'+
      '<td class="r num">±'+U.fmt(1.96*r[1],2)+'R</td><td class="i1" style="font-size:10.5px">'+r[2]+'</td></tr>').join(''))+
    '<div class="i1" style="font-size:11px;padding:8px 12px;line-height:1.65">The arithmetic, with nothing '+
      'hidden: per-trade dispersion in this cohort is σ = '+U.fmt(sd,2)+'R (computed from the pooled ledger '+
      'above, not assumed). Standard error of a mean is σ/√n, so at n=30: '+U.fmt(sd,2)+' ÷ √30 = ±'
      +U.fmt(se(30),2)+'R, and the 95% band is ±'+U.fmt(1.96*se(30),2)+'R. That band barely contains a real '+
      '+0.4R edge — which is exactly why n≥30 is the MINIMUM to believe a direction, not a license to size. '+
      'To pin expectancy within ±0.25R at 95% you need n ≈ (1.96·'+U.fmt(sd,2)+' ÷ 0.25)² = '+U.int(needN)
      +' trades. The desk’s humility about small samples is not temperament; it is division.</div>',{flush:true});
  h+=panel('PATTERN LAB → COMMITTEE — who consumes these numbers','the lab is an input organ, not a trophy room',
    kv('S07 · '+U.esc((SEATBY['S07']||{}).nm||'Daily Setup Report'),
      'setup validity: the morning brief ranks A-class candidates BY family cohort standing — a family flagged '+
      'DECAYING here cannot rank A in the brief, whatever today’s chart looks like')+
    kv('S28 · '+U.esc((SEATBY['S28']||{}).nm||'Verification Packet'),
      'memory: §19 learning-capture stamps every packet with its family cohort id, so every taken AND rejected '+
      'outcome lands back in these exact curves — the lab feeds itself')+
    kv('S29 · '+U.esc((SEATBY['S29']||{}).nm||'Journal Coach'),
      'failure-taxonomy tags supply the leak column evidence; the Discipline Coach workspace consumes the same feed')+
    kv('S30 · '+U.esc((SEATBY['S30']||{}).nm||'Backtest Validation'),
      'parity: the BT-* register must reconcile with cohort expectancy before any promotion — divergence blocks')+
    kv('S31 · '+U.esc((SEATBY['S31']||{}).nm||'Learning Suggestion'),
      'mines the decay detector nightly; a DECAYING flag with 30+ post-flag samples auto-drafts a court proposal '+
      '— which still deploys only through you '+prov('LAW-013'))+
    '<div class="banner info" style="margin-top:8px"><span class="bico">i</span><div><b>Flow of authority:</b> '+
      'lab numbers inform; they never gate directly. The path is lab → seat evidence → committee vote → packet '+
      '→ your enum. A statistic that wants to become a rule walks through the court like everything else.</div></div>');
  h+='</div>';
  h+=panel('LAB REFUSALS — discipline about the statistics','the lab’s equivalent of the review refusals: '
    +'ways this page is not allowed to lie',
    kv('NO SURVIVORSHIP PRUNING','the graveyard and Triple-Tap’s negative lifetime stay on the books — deleting losers from history is how edges get invented')+
    kv('NO EXPECTANCY WITHOUT n','every mean on this page ships with its sample size; a naked average is an opinion in a lab coat')+
    kv('NO CELL CLAIMS UNDER n=30','heatmap, aging and regime cells dim themselves below the bar instead of whispering confidently')+
    kv('NO SIMULATOR BOOKINGS','the exit simulator ranks policies; only the court + 30 paper samples promote one '+prov('LAW-013'))+
    kv('NO CURVE WITHOUT A TIE-OUT','the stat table divides the plotted array; a chart that cannot reconcile to its own table gets deleted, not explained'));
  h+=panel('PROVENANCE — where every number on this page comes from','a lab that hides its generator is '
    +'indistinguishable from a lab that lies',
    kv('SERIES','deterministic demo cohort · localRng("revd-v14-"+family) · parameters in REVD_FAMS, in this file, readable')+
    kv('DERIVED','every stat = arithmetic over those arrays at render time; zero stored aggregates, zero hand-typed expectancies')+
    kv('REAL STORES','the coach workspace reads the live JOURNAL and SVR ledger; this page touches them only for the committee cross-references')+
    kv('WATERMARK','panels whose series are scenario data carry the demo twin mark '+ck('demo.seed')+' — the seed is public because reproducibility is the apology'));
  const checks=revdSelfCheck();
  h+=panel('LAB SELF-CHECK — the tie-out promise, executed at render','four identities recomputed every render; '
    +'a FAIL here outranks everything else on the page',
    '<div class="row">'+checks.map(c=>chip((c[1]?'PASS':'FAIL')+' · '+c[0],c[1]?'ch-ok':'ch-blk',c[1]?'✓':'⛔')).join('')+'</div>'+
    '<div class="i2" style="font-size:10.5px;margin-top:6px">'+checks.filter(c=>c[1]).length+'/'+checks.length
    +' identities hold. These are the same arrays feeding every canvas and table above — the check is cheap '
    +'because there is exactly one source of truth to check.</div>');
  revdDrawCohort();revdDrawDecay();revdDrawHeat();revdDrawScatter();revdDrawDist();
  return h;
};

/* ── Pattern Lab commands ── */
CMD.define({id:'pattern.fam',label:'Select family',purpose:'Point the decay detector at a family',audit:false,
  run:a=>{if(REVD_FAMS.some(f=>f.key===a)){REVD_ST.fam=a;render()}}});
CMD.define({id:'pattern.cells',label:'Toggle n overlay',purpose:'Show trades-per-cell on the heatmap — thin cells lie',
  audit:false,run:()=>{REVD_ST.cells=!REVD_ST.cells;render()}});
CMD.define({id:'pattern.scmode',label:'Scatter filter',purpose:'Plot all trades, winners only, or losers only',
  audit:false,run:a=>{if(['ALL','WIN','LOSS'].includes(a)){REVD_ST.sc=a;render()}}});
CMD.define({id:'pattern.norm',label:'Toggle cohort lens',purpose:'Cumulative R vs expectancy-to-date on the same arrays',
  audit:false,run:()=>{REVD_ST.norm=!REVD_ST.norm;render()}});
CMD.define({id:'pattern.window',label:'Rolling window lens',
  purpose:'Explore 20/30/50-trade rolling windows — the DECAYING flag stays pinned to 30',
  audit:false,run:a=>{const w=parseInt(a,10);if([20,30,50].includes(w)){REVD_ST.win=w;render()}}});
CMD.define({id:'pattern.tp',label:'Partial level',purpose:'Exit-policy simulator partial level (R) — recomputes live',
  audit:false,run:(a,el)=>{if(!el)return;REVD_ST.tp=U.clamp(parseFloat(el.value)||2,1,4);render()}});
CMD.define({id:'pattern.docket',label:'Open court docket',purpose:'Jump to Review → Learning Court',audit:false,
  run:()=>go('review','court')});
CMD.define({id:'pattern.inbox',label:'Open ask inbox',purpose:'Jump to Review → Ask Inbox',audit:false,
  run:()=>go('review','asks')});

CMD.define({id:'pattern.dossier',label:'Family dossier',
  purpose:'Everything the lab knows about one family, in a drawer — derived live from its trade array',
  audit:false,run:a=>{
    const f=revdFam(a),D=revdData();
    const bestT=f.trades.slice().sort((p,q)=>q.R-p.R).slice(0,3);
    const worstT=f.trades.slice().sort((p,q)=>p.R-q.R).slice(0,3);
    const hourCells=f.byHour.map((b,i)=>{
      const e=b.n?b.sum/b.n:null;
      return'<div class="stat"><div class="k">'+String(9+i).padStart(2,'0')+':xx</div>'+
        '<div class="v '+(e===null?'':e>=0?'up':'dn')+'" style="font-size:13px">'+(e===null?'—':U.sign(e,2))+'</div>'+
        '<div class="s">n='+b.n+(b.n<30?' · thin':'')+'</div></div>';
    }).join('');
    const trRow=t=>'<tr><td class="mono" style="font-size:10px">Y'+(Math.floor(t.sess/252)+1)+' s'+t.sess+'</td>'+
      '<td class="mono" style="font-size:10px">'+['Mon','Tue','Wed','Thu','Fri'][t.dow]+' '+String(t.hour).padStart(2,'0')+':xx</td>'+
      '<td class="mono" style="font-size:10px">'+U.esc(t.reg)+'</td>'+
      '<td class="r num '+(t.R>=0?'up':'dn')+'">'+U.R(t.R)+'</td>'+
      '<td class="r num i2">'+U.fmt(t.mfe,2)+'</td>'+
      '<td class="r num i2">'+U.fmt(t.mae,2)+'</td></tr>';
    UI.drawer('<div class="dhead"><span class="dt">PATTERN DOSSIER · '+U.esc(f.nm)+'</span>'+
      '<span class="pill">5y demo cohort · derived live</span>'+
      '<button class="dx" data-cmd="pattern.drawerclose">ESC</button></div>'+
      '<div class="dbody">'+
      '<div class="i1" style="font-size:11.5px;line-height:1.6;margin-bottom:8px">'+U.esc(f.def)+'</div>'+
      '<div class="grid g4" style="margin-bottom:8px">'+
        stat('Expectancy',U.R(f.exp),'n='+f.n+' · Σ '+U.R(f.final,1))+
        stat('Win % · PF',U.fmt(f.winPct,0)+'% · '+U.fmt(f.pf,2),f.wins+'W / '+f.losses+'L')+
        stat('Max drawdown','−'+U.fmt(f.maxDD,1)+'R','worst peak-to-trough of the cum curve')+
        stat('Decay slope',U.sign(f.slopeMr,2)+' mR/t',f.state+' · floor '+U.fmt(REVD_DECAY_TH,1))+
      '</div>'+
      '<div class="kick" style="font-family:var(--mono);font-size:9.5px;letter-spacing:1.2px;color:var(--ink2);margin:8px 0 4px">EXPECTANCY BY ENTRY HOUR — THIS FAMILY ONLY</div>'+
      '<div class="grid g4">'+hourCells+'</div>'+
      '<div class="kick" style="font-family:var(--mono);font-size:9.5px;letter-spacing:1.2px;color:var(--ink2);margin:10px 0 4px">EXIT PROFILE</div>'+
      kv('LEAK',f.leak+' — '+U.esc(f.leakEv))+
      kv('EFFICIENCY',U.fmt(f.eff*100,0)+'% · captured '+U.fmt(f.avgCap,2)+'R of '+U.fmt(f.avgMfe,2)+'R avg winner MFE')+
      kv('LOSERS','avg '+U.fmt(f.avgLoss,2)+'R realized · '+U.fmt(f.tightPct,0)+'% saw ≥ +1R before stopping')+
      '<div class="kick" style="font-family:var(--mono);font-size:9.5px;letter-spacing:1.2px;color:var(--ink2);margin:10px 0 4px">TAILS — BEST AND WORST THREE, SAME ARRAY</div>'+
      '<div class="tblwrap"><table class="tbl"><thead><tr><th>When</th><th>Slot</th><th>Regime</th>'+
        '<th class="r">R</th><th class="r">MFE</th><th class="r">MAE</th></tr></thead><tbody>'+
        bestT.map(trRow).join('')+worstT.map(trRow).join('')+'</tbody></table></div>'+
      '<div class="i2" style="font-size:10.5px;margin-top:8px">The three best trades carry a large share of '+
        'lifetime R — which is the whole case for the runner doctrine: amputate the tail and the family dies '+
        'even while its win rate looks unchanged.</div>'+
      '</div>');
  }});
CMD.define({id:'pattern.drawerclose',label:'Close dossier',purpose:'Close the family dossier drawer',audit:false,
  run:()=>UI.closeDrawer()});

CMD.define({id:'pattern.flag',label:'File decay ask',
  purpose:'File a DECAYING family to the Ask Inbox — the response-ladder rung is a human decision',
  pre:a=>REVD_ST.flagged[a]?'Already filed to the Ask Inbox this session — one ask per family, no nagging':null,
  run:a=>{
    const f=revdFam(a);
    REVD_ST.flagged[a]=true;
    ASKS.unshift({id:'ASK-'+(60+(REVD_SEQ++)),
      q:f.nm+' rolling-30 expectancy slope is '+U.sign(f.slopeMr,2)+' mR/trade, under the '
        +U.fmt(REVD_DECAY_TH,1)+' decay floor (≈ '+U.sign(f.slopeMr*0.3,2)+'R drift per 300 trades, n='
        +f.n+', PF '+U.fmt(f.pf,2)+'). Which rung of the response ladder?',
      ev:['REVD 5y cohort · '+f.nm,'slope '+U.sign(f.slopeMr,2)+' mR/trade','worst L-streak '+f.worstRun,'GOV-030'],
      opts:['Reduce size one rung','Paper-only for 30 samples','Retire to the graveyard'],
      state:'OPEN',sla:'3d'});
    SVR.audit('HUMAN (owner)','pattern','Decay ask filed: '+f.nm+' slope '+U.sign(f.slopeMr,2)
      +' mR/trade < '+U.fmt(REVD_DECAY_TH,1)+' floor — routed to Ask Inbox');
    UI.toast(f.nm+' decay ask filed → Review → Ask Inbox. The ladder rung is your call, not the lab’s.','gold','PATTERN LAB');
    render();
  }});

CMD.define({id:'pattern.autopsyq',label:'File exit autopsy',
  purpose:'Send the worst-efficiency family to the Learning Court docket with its evidence attached',
  pre:()=>REVD_ST.autopsied?'Already on the docket this session — the court hates duplicates':null,
  run:()=>{
    const w=revdWorstEff(),D=revdData();
    REVD_ST.autopsied=true;
    COURT.unshift({id:'LS-'+(130+(REVD_SEQ++)),
      title:'Exit doctrine review: '+w.nm+' ('+w.leak.toLowerCase()+')',
      from:'S29 Journal Coach via Pattern Lab',stage:'PROPOSED',
      evidence:'5y demo cohort n='+w.n+': winners captured '+U.fmt(w.avgCap,2)+'R of '+U.fmt(w.avgMfe,2)
        +'R average MFE — '+U.fmt(w.eff*100,0)+'% efficiency. '+w.leakEv+'.',
      diff:'playbook.'+w.key+'.exits: mandatory partial at 2.0R (pooled median winner MFE '
        +U.fmt(D.medWinMfe,2)+'R) before runner hand-off to S27',
      risk:'Caps tail capture on the top decile of winners — measured cost vs the leak must be A/B’d, not asserted',
      needs:'GOV-030: 30 paper samples · regime split · owner sign-off'});
    SVR.audit('HUMAN (owner)','pattern','Worst-efficiency family filed to Learning Court: '+w.nm+' at '
      +U.fmt(w.eff*100,0)+'% efficiency ('+w.leak+')');
    UI.toast(w.nm+' filed to the court docket with its cohort evidence. Nothing deploys without you (LAW-013).','gold','PATTERN LAB');
    render();
  }});

CMD.define({id:'pattern.csv',label:'Download cohort CSV',
  purpose:'Export the full demo cohort ledger — audit the lab’s numbers in your own tools',
  run:()=>{
    const D=revdData();
    const rows=['family,seq,session,dow,hour,win,R,MFE,MAE'];
    D.pool.forEach(t=>rows.push([t.fam,t.i,t.sess,t.dow,t.hour,t.win?1:0,
      t.R.toFixed(3),t.mfe.toFixed(3),t.mae.toFixed(3)].join(',')));
    const blob=new Blob([rows.join('\n')],{type:'text/csv'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;a.download='atlas-pattern-cohort-demo.csv';
    document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),4000);
    SVR.audit('HUMAN (owner)','pattern','Cohort CSV exported — '+D.pool.length
      +' demo trades, watermarked in filename');
    UI.toast(D.pool.length+' cohort rows exported. The filename says demo because it is.','ok','PATTERN LAB');
  }});

/* ═══════════ DISCIPLINE COACH · data + engines ═══════════ */

/* ── coach module state — habits, contract, demo violation history ── */
const REVD_COACH={
  habits:[
   {id:'brief',label:'Pre-market brief read',cue:'07:30 — S07 brief lands',num:26,den:30,today:true,
    why:'the operator who skips the brief trades someone else’s regime'},
   {id:'premortem',label:'Pre-mortem filed before first entry',cue:'first packet opened',num:21,den:30,today:true,
    why:'“how does today go wrong?” written BEFORE it can — hindsight is not allowed to author it'},
   {id:'journal',label:'Journal completed same-day',cue:'position closed / packet judged',num:24,den:30,today:false,
    why:'LAW-018 makes the record mandatory; same-day makes it honest — memory edits overnight'},
   {id:'eod',label:'EOD review (15 minutes)',cue:'16:10 — digest arrives',num:19,den:30,today:false,
    why:'the cheapest 15 minutes on the desk: today’s tape while it is still today’s'},
   {id:'court',label:'Weekly court attendance',cue:'Friday 16:20 session',num:4,den:4,today:false,
    why:'governance is a habit, not an event — proposals rot when the judge skips'},
  ],
  contract:null,
  contractLog:[
   {txt:'No entries in the first 15 minutes after the open',opened:'last Mon',closed:'last Fri',
    result:'HONORED',note:'5 sessions clean — open-drive impulse entries were that month’s #2 leak'},
   {txt:'Flat by 15:45 every session, no exceptions',opened:'2 weeks ago',closed:'that Thursday',
    result:'BROKEN',note:'held a runner through the MOC window on day 4 — logged without euphemism; the '
      +'break seeded the LS-117 blackout evidence, so even the failure paid rent'},
  ],
  lockout:null,   /* {until: CLOCK minutes, at: hh:mm} — the LS-124 countermeasure as a drill */
  premortems:[    /* today’s filed pre-mortems, newest first — seeded with one demo example */
   {t:'09:24',txt:'Chop risk into FOMC minutes: my failure mode today is manufacturing a setup during lunch. If flat at 12:00, stay flat until the PM killzone.',demo:true},
  ],
  /* 90-day violation history per operator-facing law — labeled demo series.
     The LIVE SCAN column beside it is computed from real stores at render. */
  viol:[
   {law:'LAW-004',name:'5R floor / stop integrity',n90:1,trend:'→',
    last:'T-41d — asked the builder to “find” 5R by nudging the stop; the form refused (RISK-5R)',
    note:'attempts logged, none landed — the gate absorbs the impulse'},
   {law:'LAW-011',name:'Loss-limit hard stops',n90:0,trend:'→',
    last:'never — the breaker is server-side; no client path trades through it',
    note:'zero by construction, not by virtue'},
   {law:'LAW-012',name:'Revenge / house-money sizing',n90:4,trend:'↓',
    last:'T-9d — sized 1.2× after two reds; the ladder clamped it to rung size at the gate',
    note:'4 attempts in 90d, down from 9 the prior quarter'},
   {law:'LAW-016',name:'Personality drift (scalp→swing)',n90:2,trend:'↓',
    last:'T-16d — asked to extend a scalp time-stop “one more hour”; AMD-114 precedent applied',
    note:'the amendment gate makes the drift visible before it compounds'},
   {law:'LAW-017',name:'Event-window entries',n90:1,trend:'→',
    last:'T-23d — attempted a CPI-morning entry; RISK-EVENT denied it',
    note:'the calendar is enforced, not advisory'},
   {law:'LAW-018',name:'Journal skips / late journals',n90:3,trend:'↑',
    last:'T-2d — Thursday’s close journaled the next morning',
    note:'the ONE count trending the wrong way — see the contract panel'},
  ],
  /* post-loss behavior — last 5 losing trades, labeled demo */
  postLoss:[
   {trd:'TRD-0871 · −1.0R',did:'stood down 22m · next entry per plan, A-grade packet',cls:'RULES'},
   {trd:'TRD-0868 · −1.0R',did:'re-entered the same symbol 6m later without a fresh signal · −1.0R again',cls:'REVENGE'},
   {trd:'TRD-0863 · −0.9R',did:'closed the terminal for the day (self-imposed, journaled)',cls:'RULES'},
   {trd:'TRD-0859 · −1.2R',did:'sized the next trade 1.2× “to make it back” · ladder clamped it at the gate',cls:'REVENGE'},
   {trd:'TRD-0854 · −1.0R',did:'journaled, walked, returned for the PM killzone only',cls:'RULES'},
  ],
};

/* ── operator failure taxonomy — 8 named errors, tell + cheapest countermeasure ── */
const REVD_TAXONOMY=[
 ['REVENGE TRADE','re-entry to make a loss back, not because a setup exists — the loss picks the trade',
  '10-minute entry lockout after any stop-out. Cheapest countermeasure on the desk: a timer.','LAW-012',
  'tell: journal gap < 10m after a red, same symbol'],
 ['CHASE ENTRY','entering the displacement candle itself instead of the first return — paying the worst price for the best-looking bar',
  'let the entry model say no: the first-return gate (S14) already exists; obey it.','LAW-010',
  'tell: fill price above the zone; “it was running without me” in the note'],
 ['HOUSE-MONEY OVERSIZE','sizing up after wins because the money feels “free” — it is equity, not chips',
  'size is computed before the session by formula; the prior outcome is not an input.','LAW-012',
  'tell: risk% drifts up intraday while equity is green'],
 ['STOP WIDENING','moving invalidation to avoid being wrong — converting a defined risk into an open question',
  'stop lives server-side; envelope law marks widening FORBIDDEN. There is no button for it.','LAW-001',
  'tell: any sentence beginning “it just needs room”'],
 ['PROFIT GRAB','exiting winners at +1R nerves instead of the plan — the early-exit leak the lab measures',
  'partial at 2R by rule (median winner MFE arithmetic), runner owned by the FSM, not by you.','LAW-016',
  'tell: exit efficiency under 62% on the family scorecard'],
 ['BOREDOM TRADE','manufacturing a setup in chop because the screen is on and the hands are idle',
  'NO_TRADE is a journaled position that counts as work. Log it; close the terminal.','LAW-018',
  'tell: entries during the 12–13h doldrums with grade C reasoning'],
 ['ANALYSIS PARALYSIS','an A-grade packet expires unjudged — indecision is a decision with the worst audit trail',
  'the TTL alarm at 5:00 + canonical enums: a wrong enum teaches; an expired packet teaches nothing.','LAW-014',
  'tell: EXPIRED packets in the decision history with no enum'],
 ['JOURNAL SKIP','no record, no learning — the only unforgivable error because it erases the other seven',
  'same-day journal habit + the EOD-lock proposal (LS-126): the desk nags once, then blocks.','LAW-018',
  'tell: yesterday’s trades journaled in this morning’s handwriting'],
];

/* ── violation scan — REAL stores, method shown on screen ── */
const REVD_SCAN_PATS=[
 ['LAW-012',/reveng|house.?money|make.?it.?back|double.?down/i],
 ['LAW-016',/chas|late entr|scalp.*swing|extend.*(horizon|time)/i],
 ['LAW-004',/tighten.*stop|manufactur.*5r|widen.*stop/i],
 ['LAW-017',/blackout.*entr|event.*window.*entr/i],
 ['LAW-011',/through.*breaker|ignor.*limit/i],
 ['LAW-018',/skip.*journal|unjournal|journal.*late/i],
];
function revdScan(){
  const rows=[];
  (typeof JOURNAL!=='undefined'?JOURNAL:[]).forEach(j=>rows.push(
    {src:'JOURNAL '+j.id,txt:String((j.what||'')+' · '+(j.lesson||''))}));
  ((typeof SVR!=='undefined'&&SVR.ledger)||[]).forEach(l=>rows.push(
    {src:'LEDGER '+(l.kind||''),txt:String(l.msg||'')}));
  const out={rows:rows.length,hits:{},total:0,caught:0,landed:0};
  REVD_SCAN_PATS.forEach(([law,re])=>{
    const h=rows.filter(r=>re.test(r.txt));
    out.hits[law]=h;out.total+=h.length;
    h.forEach(r=>{
      if(/reject|block|refus|clamp|denied|caught|veto/i.test(r.txt))out.caught++;else out.landed++;
    });
  });
  return out;
}

/* ── decision-latency gaps from the real journal timestamps ── */
function revdGaps(){
  const ts=(typeof JOURNAL!=='undefined'?JOURNAL:[]).map(j=>j.t)
    .filter(t=>/^\d{1,2}:\d{2}$/.test(String(t)))
    .map(t=>{const p=String(t).split(':');return(+p[0])*60+(+p[1])})
    .sort((a,b)=>b-a);
  const gaps=[];
  for(let i=0;i<ts.length-1;i++)gaps.push(ts[i]-ts[i+1]);
  return{gaps,n:ts.length};
}

/* ── streaks from the pooled cohort + the thin real store ── */
function revdCurStreak(){
  const pool=revdData().pool;
  if(!pool.length)return{kind:'W',len:0};
  let i=pool.length-1;const kind=pool[i].win?'W':'L';let len=0;
  while(i>=0&&(pool[i].win?'W':'L')===kind){len++;i--}
  return{kind,len};
}
function revdStreakStats(){
  const pool=revdData().pool;
  let curW=0,curL=0,maxW=0,maxL=0;
  pool.forEach(t=>{
    if(t.win){curW++;curL=0;if(curW>maxW)maxW=curW}
    else{curL++;curW=0;if(curL>maxL)maxL=curL}
  });
  return{maxW,maxL,cur:revdCurStreak()};
}

/* ── tilt telemetry — named inputs, shown weights, no vibes term ── */
function revdTilt(){
  const g=revdGaps();
  const minGap=g.gaps.length?Math.min(...g.gaps):null;
  const st=revdCurStreak();
  const rev=REVD_COACH.postLoss.filter(p=>p.cls==='REVENGE').length;
  const inputs=[
   {k:'Decision tempo',v:g.gaps.length?g.gaps.map(x=>x+'m').join(', ')+' between today’s journal entries · min '
      +minGap+'m':'only '+g.n+' timestamped decision(s) today — tempo unmeasurable',
    w:25,s:minGap==null?10:minGap<10?78:minGap<20?40:15,
    why:minGap!=null&&minGap<10?'min gap under 10m → RAPID-FIRE flag':'tempo inside doctrine'},
   {k:'Day breaker usage',v:U.fmt(S.dayLossUsedR,2)+'R of '+ck('risk.max_day_loss_R')+'R consumed',
    w:25,s:Math.round(U.clamp(S.dayLossUsedR/ck('risk.max_day_loss_R')*100,0,100)),
    why:'linear in breaker consumption — risk.max_day_loss_R is the denominator'},
   {k:'Cohort loss streak',v:st.kind==='L'?st.len+' consecutive losses (pooled demo ledger)':'currently '
      +st.kind+st.len+' — not in a loss streak',
    w:20,s:st.kind==='L'?Math.round(U.clamp(st.len*22,0,100)):8,
    why:'22 points per consecutive loss — tilt loads fastest here'},
   {k:'Day P&L direction',v:U.money(S.dayPnl)+' paper',
    w:15,s:S.dayPnl>=0?10:Math.round(U.clamp(Math.abs(S.dayPnl)/400*100,25,100)),
    why:'red days prime revenge; green days prime house-money — both are inputs, only red is weighted'},
   {k:'Post-loss base rate',v:rev+' of last 5 losses followed by the revenge pattern (demo history)',
    w:15,s:rev*20,
    why:'your own base rate is the best predictor of your next post-loss act'},
  ];
  const score=Math.round(inputs.reduce((a,i2)=>a+i2.w*i2.s/100,0));
  return{inputs,score,minGap,gaps:g.gaps,nTs:g.n,rev};
}

/* ── the weekly coach letter — assembled from live state at render ── */
function revdLetter(){
  const D=revdData(),T=revdTilt(),sc=revdScan(),ss=revdStreakStats();
  const best=D.fams.slice().sort((a,b)=>b.exp-a.exp)[0];
  const worst=revdWorstEff();
  const rejOk=(typeof JOURNAL!=='undefined'?JOURNAL:[])
    .filter(j=>/correct rejection/i.test(String(j.outcome||''))).length;
  const habitAvg=Math.round(REVD_COACH.habits.reduce((a,h2)=>a+h2.num/h2.den,0)/REVD_COACH.habits.length*100);
  const weakHabit=REVD_COACH.habits.slice().sort((a,b)=>a.num/a.den-b.num/b.den)[0];
  const c=REVD_COACH.contract;
  const paras=[
   'The numbers first, because feelings negotiate and numbers do not. Day P&L '+U.money(S.dayPnl)
    +' paper, week '+U.money(S.weekPnl)+'. Open risk '+U.fmt(S.openRiskR,2)+'R of '
    +ck('risk.max_open_risk_R')+'R. The violation scan read '+sc.rows+' journal and ledger rows this session: '
    +sc.total+' marker(s), of which '+sc.caught+' were the gates catching you and '+sc.landed
    +' landed. Habit completion runs '+habitAvg+'% on the 30-day window. Tilt reads '+T.score
    +'/100 — '+(T.score>=65?'you should not be sizing anything today':T.score>=35
    ?'elevated: slow the tempo before the tempo decides for you':'calm, which is when good habits are cheapest to bank')+'.',
   'What held: '+rejOk+' of this week’s rejections were correct at decision time — that is the desk’s job '
    +'and your patience doing theirs. Your strongest family remains '+best.nm+' at '+U.R(best.exp)
    +' per trade over n='+best.n+' of the five-year cohort, and you read the brief '
    +REVD_COACH.habits[0].num+' of the last '+REVD_COACH.habits[0].den
    +' sessions. Keep taking the boring wins; the boring wins are the business.',
   'Now the part you pay me for. '+worst.nm+' converts only '+U.fmt(worst.eff*100,0)
    +'% of what it offers — '+worst.leakEv+'. Today you logged decisions '
    +(T.minGap!=null?T.minGap+' minutes apart at the tightest':'too rarely to measure tempo')
    +', and the decision after a red is the most expensive one you make: '+T.rev
    +' of your last five losses were followed by the revenge pattern. A 40% base rate is not a personality '
    +'quirk; it is a tax, and the ladder only clamps what it can see. Your weakest habit is “'
    +weakHabit.label.toLowerCase()+'” at '+weakHabit.num+'/'+weakHabit.den
    +' — the LAW-018 count is the only one trending the wrong way, and it erases the learning from everything else.',
   (c?'Your contract stands: “'+c.txt+'” — committed '+c.at+' ET, session '+c.sess
    +'. Honor it and next week’s letter talks about size; break it and nothing else in this letter matters, '
    +'because a desk that cannot keep one promise to itself should not be keeping promises to a broker.'
    :'You have no active improvement contract. Pick ONE behavior for next week — the same-day journal is the '
    +'obvious candidate, since it is your only worsening count. One contract beats ten resolutions: '
    +'resolutions are moods, a contract has a witness (this ledger) and a closing date. Commit it in the '
    +'panel below and I will hold you to it, kindly and in writing.'),
  ];
  return{paras,best,worst,habitAvg,tilt:T.score};
}

/* ═══════════ VIEW · review.coach — the Discipline Coach ═══════════ */
VIEWS['review.coach']=function(){
  const T=revdTilt(),sc=revdScan(),ss=revdStreakStats(),L=revdLetter();
  const viol90=REVD_COACH.viol.reduce((a,v2)=>a+v2.n90,0);
  const habitAvg=L.habitAvg;
  let h=vhead('REVIEW · discipline coach','The operator is the last risk factor',
    'Every gate in this build protects the account from the market. This workspace protects it from you — '
    +'with the same method: named inputs, shown arithmetic, and rules that were written before the emotion arrived.');
  h+='<div class="grid g4">'+
    stat('Tilt risk',T.score+'<span class="i2" style="font-size:11px"> /100</span>',
      T.score>=65?'HIGH — no new size':T.score>=35?'elevated — slow down':'calm — bank habits now')+
    stat('Live scan',sc.total+' marker'+(sc.total===1?'':'s'),
      sc.caught+' caught by gates · '+sc.landed+' landed · '+sc.rows+' rows read')+
    stat('90-day violations',viol90,'labeled demo history · LAW-018 is the one trending up')+
    stat('Habit completion',habitAvg+'%','30-day window · weakest: '
      +U.esc(REVD_COACH.habits.slice().sort((a,b)=>a.num/a.den-b.num/b.den)[0].label))+
  '</div>';

  /* ── guardrails now — what is currently binding on the operator, live ── */
  h+=panel('GUARDRAILS NOW — what is binding on you this second','read from live state at render; a guardrail '
    +'you cannot see is a guardrail you will resent',
    (function(){
      const lk=REVD_COACH.lockout,lkLeft=lk?lk.until-CLOCK.mins():0;
      const rows=[
       ['Kill switch',S.kill?'ENGAGED — every order path locked':'not engaged',!!S.kill],
       ['Risk mode',S.riskMode+(S.riskMode==='NORMAL'?' — full formulaic size available':' — the ladder is in charge of size, not you'),S.riskMode!=='NORMAL'],
       ['Data health',S.dataHealth+(S.dataHealth==='NOMINAL'?' — approvals open':' — approvals blocked (LAW-006)'),S.dataHealth!=='NOMINAL'],
       ['Tilt band',T.score+'/100 — '+(T.score>=65?'RED: session-lock recommended':T.score>=35?'AMBER: tempo rules engage':'GREEN: trade the plan'),T.score>=35],
       ['Entry lockout drill',lk&&lkLeft>0?'ARMED — '+lkLeft+'m remaining':'not armed',!!(lk&&lkLeft>0)],
       ['Improvement contract',REVD_COACH.contract?'ACTIVE — “'+REVD_COACH.contract.txt.slice(0,60)+'…”':'none active',!!REVD_COACH.contract],
       ['Event blackouts',(function(){
          const nb=((typeof EVENTS!=='undefined'?EVENTS:[]).filter(e=>e.block)).length;
          return nb?nb+' armed on the calendar — '+ck('risk.event_window_hrs')+'h window enforced (LAW-017)'
            :'none armed inside the '+ck('risk.event_window_hrs')+'h window';
        })(),((typeof EVENTS!=='undefined'?EVENTS:[]).filter(e=>e.block)).length>0],
      ];
      return rows.map(r2=>'<div class="kv"><span class="k" style="min-width:170px">'+U.esc(r2[0])+'</span>'+
        '<span class="v">'+chip(r2[2]?'BINDING':'clear',r2[2]?'ch-warn':'ch-ok',r2[2]?'◆':'·')
        +' <span style="font-size:11px">'+U.esc(r2[1])+'</span></span></div>').join('');
    })()+
    '<div class="i2" style="font-size:10.5px;margin-top:6px">Two layers, on purpose: the top three are '+
      'ENFORCED (server-side state, no operator path around them); the bottom three are COMMITMENTS '+
      '(visible, audited, and yours to honor). The desk automates what must never fail and keeps human what '+
      'must stay meant.</div>');

  /* ── (a) rule-violation tracker ── */
  h+=panel('RULE-VIOLATION TRACKER — six operator-facing laws','the scan method is printed because a hidden '
    +'method is a vibe with a uniform',
    '<div class="banner info" style="margin-bottom:10px"><span class="bico">i</span><div>'+
      '<b>Scan method, verbatim:</b> at render time this panel reads every JOURNAL row (what + lesson fields) '+
      'and every SVR ledger message — '+sc.rows+' rows this session — and greps each against the six patterns '+
      'below. A hit whose text also matches <span class="mono" style="font-size:10px">/reject|block|refus|clamp|denied|caught|veto/</span> '+
      'is classed CAUGHT (the gate absorbed the impulse); anything else is classed LANDED. The demo journal is '+
      'thin, so the 90-day column beside it is a <span class="demo-wm">labeled demo history</span> — the live '+
      'column is real and recomputes every render.</div></div>'+
    tbl(['Law','Behavior policed','>90d (demo)','Trend','>Live scan','Last incident (demo history)'],
      REVD_COACH.viol.map(v2=>{
        const hits=(sc.hits[v2.law]||[]);
        return'<tr'+(v2.trend==='↑'?' style="background:var(--warn-bg)"':'')+'>'+
        '<td>'+prov(v2.law)+'</td>'+
        '<td class="i1" style="font-size:11px"><b>'+U.esc(v2.name)+'</b><div class="i2" style="font-size:9.5px">'
          +U.esc(v2.note)+'</div></td>'+
        '<td class="r num">'+v2.n90+'</td>'+
        '<td class="mono" style="font-size:13px;color:'+(v2.trend==='↑'?'var(--neg)':v2.trend==='↓'?'var(--pos)':'var(--ink2)')
          +'">'+v2.trend+'</td>'+
        '<td class="r num">'+hits.length+(hits.length?' <span class="i2" style="font-size:9px" title="'
          +U.esc(hits.map(x=>x.src+': '+x.txt.slice(0,90)).join('\n'))+'">hover</span>':'')+'</td>'+
        '<td class="i2" style="font-size:10.5px">'+U.esc(v2.last)+'</td></tr>'}).join(''))+
    '<div class="row" style="padding:8px 12px 4px">'+
      REVD_SCAN_PATS.map(([law,re])=>'<span class="tag" title="'+U.esc(String(re))+'">'+law+' '
        +U.esc(String(re).slice(1,28))+'…</span>').join('')+
    '</div>'+
    '<div class="btnrow" style="padding:4px 12px 10px">'+CMD.btn('coach.scan',null,'sm','Re-run scan now')+
      CMD.btn('coach.laws',null,'sm','Law texts + hits')+
      '<span class="i2" style="font-size:10.5px">a caught attempt is still an attempt — the trend arrows track intent, not just damage</span></div>',
    {flush:true});

  /* ── (b) tilt telemetry ── */
  h+='<div class="grid g2">';
  h+=panel('TILT TELEMETRY — the dial and its arithmetic','composed from named inputs with shown weights; '
    +'no input, no influence',
    '<canvas id="revd-tilt" class="cv" style="height:185px"></canvas>'+
    tbl(['Input','Reading','>Weight','>Score','>Contribution'],
      T.inputs.map(i2=>'<tr><td><b style="font-size:11px">'+U.esc(i2.k)+'</b><div class="i2" style="font-size:9.5px">'
        +U.esc(i2.why)+'</div></td>'+
        '<td class="i1" style="font-size:10.5px">'+U.esc(i2.v)+'</td>'+
        '<td class="r num i2">'+i2.w+'%</td>'+
        '<td class="r num">'+i2.s+'</td>'+
        '<td class="r num '+(i2.w*i2.s/100>=15?'dn':'')+'">'+U.fmt(i2.w*i2.s/100,1)+'</td></tr>').join(''))+
    (function(){
      const worst=T.inputs.slice().sort((a,b)=>b.w*b.s-a.w*a.s)[0];
      const cut={'Decision tempo':'wait out a 15-minute gap before the next decision — the input re-scores on its own',
        'Day breaker usage':'nothing to do but not add to it — breaker consumption only resets with the session',
        'Cohort loss streak':'one rule-clean trade of ANY outcome resets the streak input; chase a clean process, not a green print',
        'Day P&L direction':'unfixable by trading harder — that is the trap; the input decays as the day is left alone',
        'Post-loss base rate':'arm the lockout drill below BEFORE the next loss — the base rate only improves in advance'}[worst.k]||'—';
      return'<div class="i1" style="font-size:11px;padding:0 12px 8px;line-height:1.6"><b>Cheapest reduction '+
        'right now:</b> the top contributor is “'+U.esc(worst.k)+'” at '+U.fmt(worst.w*worst.s/100,1)
        +' points. '+U.esc(cut)+'</div>';
    })()+
    '<div class="btnrow" style="padding:8px 12px 10px">'+CMD.btn('coach.tilt',null,'sm','Formula detail')+
      (T.minGap!=null&&T.minGap<10?chip('RAPID-FIRE — min gap '+T.minGap+'m < 10m','ch-warn','!'):
        chip('tempo ok','ch-ok','✓'))+'</div>',{flush:true});
  h+=panel('POST-LOSS BEHAVIOR — the last five losing trades','what you actually did next · '
    +'<span class="demo-wm">demo history</span>',
    REVD_COACH.postLoss.map(p=>'<div class="kv"><span class="k mono" style="font-size:10px">'+U.esc(p.trd)
      +'</span><span class="v">'+chip(p.cls,p.cls==='RULES'?'ch-ok':'ch-blk',p.cls==='RULES'?'✓':'⛔')
      +' <span style="font-size:11px">'+U.esc(p.did)+'</span></span></div>').join('')+
    '<div class="banner warn" style="margin-top:8px"><span class="bico">!</span><div><b>The honest base rate:</b> '+
      '2 of 5 — 40% — of recent losses were followed by the revenge pattern, and n=5 is itself too thin to be '+
      'proud or ashamed of (see the n-doctrine in the Pattern Lab). What n=5 IS good for: both revenge cases '+
      'were caught by the ladder, not by willpower. Willpower is not a control; the ladder is '
      +prov('LAW-012')+'.</div></div>'+
    '<div class="i2" style="font-size:10.5px;margin-top:6px">DECISION LATENCY, method: gap = t(n) − t(n+1) '+
      'across today’s timestamped journal entries. Today: '+T.nTs+' timestamps → '
      +(T.gaps.length?T.gaps.map(g2=>g2+'m').join(', '):'no gaps measurable')
      +'. A 5-minute gap after a rejection is the tempo signature of a chase forming.</div>'+
    '<div class="btnrow" style="margin-top:8px">'+
      (function(){
        const lk=REVD_COACH.lockout;
        const left=lk?lk.until-CLOCK.mins():0;
        if(lk&&left>0)return chip('LOCKOUT ARMED · '+left+'m left · since '+lk.at,'ch-warn','◆')
          +'<span class="i2" style="font-size:10px">the LS-124 countermeasure, running as a drill — entries are a decision you have pre-declined</span>';
        return CMD.btn('coach.lockout',null,'sm','Arm 10m entry lockout (drill)')
          +(lk?'<span class="tag">last drill completed · armed '+U.esc(lk.at)+'</span>':'')
          +'<span class="i2" style="font-size:10px">practice the timer before the tilt — the drill is the rehearsal for LS-124</span>';
      })()+
    '</div>');
  h+='</div>';

  /* ── (c) streak analysis ── */
  const pLoss=0.45,kRun=6,NTr=250;
  const q6=Math.pow(pLoss,kRun),lam=(NTr-kRun+1)*q6*(1-pLoss),pRun=1-Math.exp(-lam);
  h+=panel('STREAK ANALYSIS — variance doctrine before variance arrives','streaks are visible, computed, and '
    +'pre-answered by the ladder — never improvised at 14:30 on a red day',
    '<canvas id="revd-streak" class="cv" style="height:96px"></canvas>'+
    '<div class="grid g4" style="margin-top:10px">'+
      stat('Current streak',ss.cur.kind+ss.cur.len,'pooled 5y demo ledger · '+chip('demo','ch-demo','◈'))+
      stat('Longest win streak','W'+ss.maxW,'euphoria risk is a streak property too')+
      stat('Longest loss streak','L'+ss.maxL,'survived on paper — the ladder existed before it happened')+
      stat('Real store','W1','CLOSED_POSITIONS holds 1 audited close (+5.4R) — honest n, honestly thin')+
    '</div>'+
    kv('WIN-STREAK DOCTRINE','euphoria is a streak property too: on W5+ size does NOT step up — the ladder only '
      +'has down-rungs by construction '+prov('LAW-012')+' — and the pre-trade checklist TIGHTENS, because '
      +'sloppiness correlates with comfort, not with pressure')+
    kv('LOSS-STREAK DOCTRINE','the table below is decided in advance so that at streak depth you execute a '
      +'procedure instead of holding a negotiation with yourself')+
    '<div class="grid g2" style="margin-top:10px"><div>'+
    kv('THE ARITHMETIC','P(a 6-loss run somewhere in 250 trades at 55% win rate). Per-window: 0.45⁶ = '
      +U.fmt(q6*100,2)+'%. Windows: 250−6+1 = 245. Expected runs λ ≈ 245 × '+U.fmt(q6,4)+' × 0.55 = '
      +U.fmt(lam,2)+'. P(≥1) ≈ 1 − e^(−'+U.fmt(lam,2)+') ≈ <b>'+U.fmt(pRun*100,0)+'%</b>.')+
    kv('THE READING','A 6-loss streak in a healthy 55% system is not evidence the edge died — it is the BASE '
      +'RATE, roughly a two-in-three event per 250 trades. The decay SLOPE test in the Pattern Lab decides '
      +'whether an edge is dying; the streak only decides your size while you find out.')+
    tbl(['Run length','>P(≥1 in 250 trades)','Emotional forecast'],
      [4,5,6,7,8].map(k2=>{
        const qk=Math.pow(pLoss,k2),lk=(NTr-k2+1)*qk*(1-pLoss),pk=1-Math.exp(-lk);
        return'<tr><td class="mono"><b>'+k2+' losses</b></td>'+
        '<td class="r num">'+U.fmt(pk*100,pk>0.1?0:1)+'%</td>'+
        '<td class="i2" style="font-size:10.5px">'+(k2<=5?'routine — you will see this every few months'
          :k2===6?'expected once per ~250-trade year; feels like a crisis, is a Tuesday'
          :k2===7?'uncomfortable and still unremarkable — the ladder has long since de-sized you'
          :'rare enough to trigger a REAL review — alongside, not instead of, the slope test')+'</td></tr>';
      }).join(''))+
    '</div><div>'+
    tbl(['Streak depth','What the ladder does — automatic, formulaic'],[
      ['1 loss','size steps down one rung: −'+ck('risk.loss_ladder_step')+'% of equity per rung '
        +prov('risk.loss_ladder_step')],
      ['2 losses','COOLDOWN arms — new entries locked for the window; the ladder, not your mood, decides re-entry'],
      ['3 losses','paper-only: the desk keeps reading the tape; your hands leave the wheel'],
      ['4+ losses','day breaker territory — '+ck('risk.max_day_loss_R')+'R consumed is a hard state transition '
        +prov('LAW-011')+', not a warning'],
    ].map(r=>'<tr><td class="mono" style="font-size:11px"><b>'+r[0]+'</b></td><td class="i1" style="font-size:11px">'
      +r[1]+'</td></tr>').join(''))+
    '</div></div>'+
    (function(){
      const runs=revdLossRuns(4).slice(-5).reverse();
      if(!runs.length)return'';
      return'<div class="kick" style="font-family:var(--mono);font-size:9.5px;letter-spacing:1.2px;color:var(--ink2);margin:10px 0 4px">'+
        'DEEP RUNS ON RECORD — every loss streak ≥ 4 in the pooled cohort (most recent first)</div>'+
        tbl(['When','>Length','>Run cost','>Next 5 trades','Reading'],
          runs.map(r2=>'<tr><td class="mono" style="font-size:10.5px">Y'+(Math.floor(r2.sess/252)+1)+' · s'+r2.sess+'</td>'+
            '<td class="r num">'+r2.len+'</td>'+
            '<td class="r num dn">'+U.R(r2.sum,1)+'</td>'+
            '<td class="r num '+(r2.rec>=0?'up':'dn')+'">'+U.R(r2.rec,1)+(r2.cnt<5?' <span class="i2" style="font-size:8.5px">(n'+r2.cnt+')</span>':'')+'</td>'+
            '<td class="i2" style="font-size:10.5px">'+(r2.rec>=0?'recovery was mundane — the ladder’s job was keeping you solvent and correctly sized until it arrived':'recovery lagged — exactly why size steps DOWN the rungs, never up to “win it back”')+'</td></tr>').join(''))+
        '<div class="i2" style="font-size:10.5px;padding:6px 12px 0">Every deep run above was survived at formulaic size. The same runs at revenge size are not drawdowns; they are exits from the business.</div>';
    })());

  /* ── (d) habit scorecards ── */
  h+=panel('HABIT SCORECARDS — five habits, 30-day gauges','<span class="demo-wm">demo gauges</span> · '
    +'the habit loop: cue → routine → reward; the gauge IS the reward',
    REVD_COACH.habits.map(h2=>'<div class="kv"><span class="k" style="min-width:230px"><b style="font-size:11px">'
      +U.esc(h2.label)+'</b><div class="i2" style="font-size:9.5px">cue: '+U.esc(h2.cue)+'</div></span>'+
      '<span class="v"><span class="row" style="align-items:center">'+
      '<div class="gauge" style="width:150px"><i style="width:'+Math.round(h2.num/h2.den*100)+'%"></i></div>'+
      '<span class="mono" style="font-size:11px">'+h2.num+'/'+h2.den+'</span>'+
      (h2.today?chip('today ✓','ch-ok','✓'):CMD.btn('coach.done',h2.id,'sm','Mark today done'))+
      '</span><div class="i2" style="font-size:9.5px;margin-top:2px">'+U.esc(h2.why)+'</div></span></div>').join('')+
    '<canvas id="revd-habitstrip" class="cv" style="height:170px;margin-top:10px"></canvas>'+
    '<div class="banner info" style="margin-top:8px"><span class="bico">i</span><div><b>Habit-loop doctrine:</b> '+
      'a habit is a compiled decision — decided once, executed daily, costing zero willpower at runtime. The cue '+
      'is scheduled by the desk (S07 brief, EOD digest), the routine is a checklist, and the reward is the gauge '+
      'filling. Missing once is noise; missing twice is the start of a NEW habit — the scorecard exists to make '+
      'the second miss loud. Weekly court attendance is the keystone: the operator who shows up to governance '+
      'keeps every other promise cheaper.</div></div>',
    {head:CMD.btn('coach.eod',null,'sm','EOD checklist')});

  /* ── pre-mortem quick-file — write the failure before it can happen ── */
  h+=panel('PRE-MORTEM — today’s failure, written in advance','filing one auto-marks the pre-mortem habit; '
    +'hindsight is not allowed to author this note',
    '<div class="row" style="margin-bottom:8px">'+
      '<input id="revd-pm-in" class="inp" style="flex:1" placeholder="e.g. My failure mode today is revenge-sizing '
      +'after a red in the first hour. If it happens: lockout, journal, PM killzone only.">'+
      '<button class="btn pri" data-cmd="coach.premortem">File pre-mortem</button></div>'+
    (REVD_COACH.premortems.length
      ?REVD_COACH.premortems.slice(0,3).map(p=>'<div class="kv"><span class="k mono" style="font-size:10px">'
        +U.esc(p.t)+(p.demo?' <span class="tag">demo</span>':'')+'</span><span class="v i1" style="font-size:11px">“'
        +U.esc(p.txt)+'”</span></div>').join('')
      :'<div class="empty"><div class="e1">NONE FILED</div>The best time to describe today’s failure was this morning. The second-best time is now.</div>')+
    '<div class="i2" style="font-size:10.5px;margin-top:6px">Doctrine: a pre-mortem converts your most likely '+
      'error from a surprise into a checklist item. At EOD, compare the filed note against the tape — the days '+
      'they match are the days the coach earns nothing, which is the goal.</div>');

  /* ── (e) weekly coach letter ── */
  h+=panel('WEEKLY COACH LETTER — generated from live state at render','assembled from S.dayPnl, the streak '
    +'engine, the violation scan and the Pattern Lab — not a template with your name pasted in',
    '<div style="border:1px solid var(--line);border-radius:var(--r);padding:14px 16px;background:rgba(151,166,192,.03)">'+
      '<div class="mono i2" style="font-size:10px;margin-bottom:10px">FROM: S29 Journal Coach · TO: the operator · '
        +CLOCK.hm()+' ET · sources: live state + demo cohort (labeled where demo)</div>'+
      L.paras.map(p=>'<div class="i1" style="font-size:11.5px;line-height:1.7;margin-bottom:10px">'
        +U.esc(p)+'</div>').join('')+
      '<div class="mono i2" style="font-size:10px">— signed, the only agent on this desk allowed to talk about '
        +'your feelings, and only with numbers</div>'+
    '</div>'+
    '<div class="btnrow" style="margin-top:10px">'+CMD.btn('coach.letter',null,'gold','Download letter as .md')+
      '<span class="i2" style="font-size:10.5px">4 paragraphs · specific · honest · kind but blunt — regenerated '
      +'every render, so it can never be stale flattery</span></div>');

  /* ── (f) improvement contract ── */
  const c=REVD_COACH.contract;
  h+=panel('IMPROVEMENT CONTRACT — one behavior, one week, one witness','one contract beats ten resolutions: '
    +'resolutions are moods; a contract has a ledger entry and a closing date',
    (c
      ?'<div class="banner gold" style="margin-bottom:8px"><span class="bico">◆</span><div>'+
        '<b>ACTIVE:</b> “'+U.esc(c.txt)+'”'+
        '<div class="i2" style="font-size:10.5px;margin-top:3px">committed '+U.esc(c.at)
          +' ET · session '+c.sess+' of the week · demo clock runs one session — the counter is honest about that</div>'+
        '<div class="btnrow" style="margin-top:8px">'+
          CMD.btn('coach.review','HONORED','sm pos','Close: HONORED')+
          CMD.btn('coach.review','BROKEN','sm neg','Close: BROKEN')+
        '</div></div></div>'
      :'<div class="row" style="margin-bottom:8px">'+
        '<input id="revd-contract-in" class="inp" style="flex:1" placeholder="e.g. Journal every decision the '
        +'same day, before the terminal closes — no exceptions, no catch-ups">'+
        '<button class="btn gold" data-cmd="coach.commit">Commit for the week</button></div>'+
       '<div class="i2" style="font-size:10.5px;margin-bottom:8px">Pick ONE. The letter above already nominated '
        +'a candidate. A second contract voids the first — the whole point is singularity of focus.</div>')+
    tbl(['Contract','Opened','Closed','Result','Note'],
      REVD_COACH.contractLog.map(l2=>'<tr><td class="i1" style="font-size:11px">“'+U.esc(l2.txt)+'”</td>'+
        '<td class="mono" style="font-size:10px">'+U.esc(l2.opened)+'</td>'+
        '<td class="mono" style="font-size:10px">'+U.esc(l2.closed)+'</td>'+
        '<td>'+chip(l2.result,l2.result==='HONORED'?'ch-ok':'ch-blk',l2.result==='HONORED'?'✓':'⛔')+'</td>'+
        '<td class="i2" style="font-size:10.5px">'+U.esc(l2.note)+'</td></tr>').join('')));

  /* ── closing grid: failure taxonomy + coach → court pipeline ── */
  h+='<div class="grid g2">';
  h+=panel('THE OPERATOR FAILURE TAXONOMY — 8 named errors','naming is half the countermeasure; the other half '
    +'is always cheaper than discipline',
    REVD_TAXONOMY.map(t=>'<div class="kv"><span class="k" style="min-width:150px;color:var(--warn)">'
      +U.esc(t[0])+'</span><span class="v"><span class="i1" style="font-size:11px">'+U.esc(t[1])+'</span>'+
      '<div class="i2" style="font-size:10px;margin-top:2px"><b>Cheapest countermeasure:</b> '+U.esc(t[2])
      +' '+prov(t[3])+'</div>'+
      '<div class="mono" style="font-size:9.5px;color:var(--info);margin-top:2px">'+U.esc(t[4])+'</div>'+
      '</span></div>').join(''));
  const mint1=(typeof COURT!=='undefined'?COURT:[]).find(x=>x.id==='LS-124');
  const mint2=(typeof COURT!=='undefined'?COURT:[]).find(x=>x.id==='LS-126');
  h+=panel('COACH → COURT PIPELINE — violations become proposals','the coach never punishes; it files. '
    +'Behavior change deploys through governance like every other rule '+prov('LAW-013'),
    kv('THE PIPELINE','violation observed → tagged in journal (LAW-018) → 20-session evidence window → S29 '
      +'drafts the countermeasure → Learning Court → paper A/B → enforced gate. Nothing skips a stage; the '
      +'operator’s flaws walk the same five steps to silence as the machine’s (MHH board).')+
    '<div class="i2" style="font-size:10px;margin:6px 0">Already minted by this pipeline — live on the docket, '
      +'judge them in Review → Learning Court:</div>'+
    [mint1,mint2].map(m=>m
      ?'<div class="banner gold" style="margin-bottom:6px"><span class="bico">◆</span><div>'+
        '<b>'+U.esc(m.id)+' · '+U.esc(m.title)+'</b> '+chip(m.stage,m.stage.startsWith('REJECT')?'ch-neg'
          :m.stage.startsWith('APPROVED')?'ch-ok':'ch-info','◆')+
        '<div class="i1" style="font-size:10.5px;margin-top:3px">'+U.esc(m.evidence)+'</div>'+
        '<div class="mono" style="font-size:10px;color:var(--paper);margin-top:3px">'+U.esc(m.diff)+'</div>'+
       '</div></div>'
      :'<div class="empty"><div class="e1">DOCKET ENTRY MISSING</div>expected coach-minted proposal not found '
        +'— integrity issue, report it.</div>').join('')+
    '<div class="btnrow" style="margin-top:6px">'+CMD.btn('coach.court',null,'sm','Open the docket →')+'</div>');
  h+='</div>';
  h+=panel('YOUR FINGERPRINTS TODAY — the operator’s own audit trail','the last HUMAN-actor entries from the '
    +'REAL server ledger; the coach reads the same record the court does',
    (function(){
      const mine=(((typeof SVR!=='undefined'&&SVR.ledger)||[]).filter(l=>String(l.actor||'').startsWith('HUMAN'))).slice(0,6);
      if(!mine.length)return'<div class="empty"><div class="e1">NO ENTRIES YET</div>You have not touched anything '
        +'auditable this session — which is itself a data point.</div>';
      return mine.map(l=>'<div class="kv"><span class="k mono" style="font-size:10px">'+U.esc(l.t)
        +'</span><span class="v"><span class="tag">'+U.esc(l.kind)+'</span> <span style="font-size:11px">'
        +U.esc(String(l.msg).slice(0,110))+'</span></span></div>').join('')
        +'<div class="i2" style="font-size:10.5px;margin-top:6px">Live from SVR.ledger, filtered to HUMAN actors. '
        +'Tempo, tilt and the violation scan all read this same append-only trail — one record, many lenses.</div>';
    })());
  h+=panel('COACH REFUSALS — discipline about the discipline','ways this workspace is not allowed to treat you',
    kv('NEVER PUNISH DISCIPLINED LOSSES','a −1R stop taken per plan is the system working; the coach that scolds it teaches fear, not process')+
    kv('NEVER REWARD LUCKY VIOLATIONS','a profitable rule-break is a violation with good PR — it lands in the tracker at full weight')+
    kv('NEVER DIAGNOSE THIN','every n<30 number on this page says so out loud (the post-loss panel is n=5 and admits it twice)')+
    kv('NEVER HIDE THE METHOD','scan regexes, tilt weights, streak arithmetic — printed on the panel that uses them')+
    kv('NEVER ENFORCE','the coach recommends; enforcement belongs to the ladder, breakers and kill switch — conscience and cage stay separate'));
  h+=panel('THE OPERATOR API — where coach outputs actually land','the coach is an organ, not a mirror; '
    +'every panel above has a consumer',
    kv('TILT → S01 Risk Officer','scores ≥ 65 are filed as an advisory context flag on the next risk check — '
      +'advisory because the operator’s state is context, never a market signal')+
    kv('VIOLATIONS → S29 tags','scan hits and demo-history counts feed the failure-taxonomy Pareto in '
      +'Performance — your leaks compete with the machine’s for fix priority, on the same chart')+
    kv('CONTRACT → AI Memory','an HONORED contract is a candidate MEM rule: what you proved you can do by hand '
      +'is what the gate can hold you to by default (promotion via Review → AI Memory, sign-off required)')+
    kv('HABITS → S32 EOD digest','completion gauges ride the evening digest — the streak is public to future-you, '
      +'which is the only audience that reliably shames the present one')+
    kv('LETTER → the record','each week’s letter is exportable and diffable against the last — a coach whose '
      +'advice cannot be compared across weeks is a horoscope')+
    kv('LAB ↔ COACH','the Pattern Lab’s exit-efficiency leak column and the PROFIT GRAB taxonomy entry are the '
      +'same defect measured from two sides — machine numbers there, operator behavior here, one court for both'));
  h+=panel('RECOVERY PROTOCOL — pre-written for the state you will be in','tilt bands map to actions decided '
    +'while calm; nothing on this list is invented at 14:30 on a red day',
    '<div class="grid g3">'+
    '<div>'+kv('0–34 · GREEN','trade the plan. This is the band where habits are banked cheaply — mark the '
      +'scorecards, file the pre-mortem, take the boring wins.')+'</div>'+
    '<div>'+kv('35–64 · AMBER','tempo rules engage: minimum 15m between decisions · no size above rung · '
      +'re-read the pre-mortem before any entry · the lockout drill is one click away.')+'</div>'+
    '<div>'+kv('65–100 · RED','recommendation: lock new entries for the session and write the journal NOW, '
      +'while the tilt is observable — the entry you skip here is the cheapest trade of the month.')+'</div>'+
    '</div>'+
    '<div class="i2" style="font-size:10.5px;margin-top:6px">The dial recommends; it never enforces. '+
      'Enforcement belongs to the ladder, the breakers and the kill switch '+prov('LAW-011')+' — the coach’s '+
      'job is making sure you never meet them surprised.</div>');
  h+='<div class="banner gold"><span class="bico">◆</span><div><b>The coach’s only thesis:</b> the market '+
    'charges for every lesson exactly once — unless you skip the journal, in which case it offers the same '+
    'lesson again at a markup. Every panel above exists to make sure you pay retail once, not tuition forever. '+
    'The machine’s flaws walk the MHH board; yours walk this page; both end in the same court '+
    prov('LAW-013')+', because a desk with two standards of accountability has none.</div></div>';
  revdDrawTilt(T.score);revdDrawStreak();revdDrawHabits();
  return h;
};

/* ── Discipline Coach commands ── */
CMD.define({id:'coach.done',label:'Mark habit done',
  purpose:'Mark today’s habit complete — module state, audited, gauge advances',
  pre:a=>{const h2=REVD_COACH.habits.find(x=>x.id===a);
    return h2&&h2.today?'Already marked today — once is once; the gauge does not inflate':null},
  run:a=>{
    const h2=REVD_COACH.habits.find(x=>x.id===a);if(!h2)return;
    h2.today=true;h2.num=Math.min(h2.den,h2.num+1);
    SVR.audit('HUMAN (owner)','coach','Habit completed: '+h2.label+' → '+h2.num+'/'+h2.den+' on the 30d window');
    UI.toast(h2.label+' ✓ — '+h2.num+'/'+h2.den+'. The gauge is the reward.','ok','DISCIPLINE COACH');
    render();
  }});

CMD.define({id:'coach.scan',label:'Re-run violation scan',
  purpose:'Re-grep the journal + ledger against the six law patterns, right now',audit:false,
  run:()=>{
    const sc=revdScan();
    UI.toast('Scanned '+sc.rows+' rows → '+sc.total+' marker(s): '+sc.caught+' caught by gates, '
      +sc.landed+' landed. Method printed on the panel.','','VIOLATION SCAN');
    render();
  }});

CMD.define({id:'coach.tilt',label:'Tilt formula detail',
  purpose:'Show the full tilt composition — every input, weight and contribution',audit:false,
  run:()=>{
    const T=revdTilt();
    UI.modal('◈ TILT RISK — full composition',
      '<div class="i1" style="font-size:11.5px;line-height:1.6;margin-bottom:8px">score = Σ (weight × input '
      +'score ÷ 100). Weights sum to 100. Every input is named and observable — a tilt model with a hidden '
      +'term is just a mood ring with better fonts.</div>'+
      T.inputs.map(i2=>'<div class="kv"><span class="k" style="font-size:10px">'+U.esc(i2.k)+' · w='+i2.w
        +'%</span><span class="v" style="font-size:11px">'+U.esc(i2.v)+' → score '+i2.s+' → contributes <b>'
        +U.fmt(i2.w*i2.s/100,1)+'</b><div class="i2" style="font-size:9.5px">'+U.esc(i2.why)+'</div></span></div>').join('')+
      '<div class="banner '+(T.score>=65?'blk':T.score>=35?'warn':'info')+'" style="margin-top:8px"><span class="bico">'
      +(T.score>=65?'⛔':'!')+'</span><div><b>Total: '+T.score+'/100.</b> Above 65 the coach recommends the desk '
      +'lock new entries for the session — recommendation only; the ladder and breakers remain the enforced layer.</div></div>',
      '<button class="btn" data-cmd="coach.modalclose">Close</button>');
  }});
CMD.define({id:'coach.modalclose',label:'Close',purpose:'Close the tilt-detail modal',audit:false,run:()=>UI.closeModal()});

CMD.define({id:'coach.letter',label:'Download coach letter',
  purpose:'Export this week’s generated letter as Markdown — same text as on screen',
  run:()=>{
    const L=revdLetter();
    const md='# ATLAS · weekly coach letter\n\n_FROM: S29 Journal Coach · TO: the operator · '+CLOCK.hm()
      +' ET · generated from live state; demo-sourced figures are labeled on the desk._\n\n'
      +L.paras.map(p=>p+'\n').join('\n')
      +'\n---\n_tilt '+L.tilt+'/100 · habit completion '+L.habitAvg+'% · best family '+L.best.nm
      +' ('+U.R(L.best.exp)+') · worst efficiency '+L.worst.nm+' ('+U.fmt(L.worst.eff*100,0)+'%)_\n';
    const blob=new Blob([md],{type:'text/markdown'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;a.download='atlas-coach-letter.md';
    document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),4000);
    SVR.audit('HUMAN (owner)','coach','Weekly coach letter exported (.md) — generated from live state at '+CLOCK.hm());
    UI.toast('Letter exported. Read paragraph three twice.','gold','DISCIPLINE COACH');
  }});

CMD.define({id:'coach.commit',label:'Commit contract',
  purpose:'Commit ONE behavior for next week — stored, witnessed by the ledger, closed only as HONORED or BROKEN',
  run:()=>{
    const inp=$('#revd-contract-in');
    if(!inp||!inp.value.trim()){UI.toast('Write the ONE behavior first — a blank contract is a resolution','warn','CONTRACT');return}
    if(REVD_COACH.contract){UI.toast('A contract is already active — close it HONORED or BROKEN first','warn','CONTRACT');return}
    REVD_COACH.contract={txt:inp.value.trim(),at:CLOCK.hm(),sess:1};
    SVR.audit('HUMAN (owner)','coach','Improvement contract committed: "'+REVD_COACH.contract.txt
      +'" — one week, closes HONORED or BROKEN, no third state');
    UI.toast('Contract witnessed by the ledger. One week. Two possible endings.','gold','CONTRACT');
    render();
  }});

CMD.define({id:'coach.review',label:'Close contract',
  purpose:'Close the active contract HONORED or BROKEN — the audit trail records which, without euphemism',
  pre:()=>REVD_COACH.contract?null:'No active contract — commit one first',
  run:a=>{
    const c=REVD_COACH.contract;if(!c)return;
    const result=a==='HONORED'?'HONORED':'BROKEN';
    REVD_COACH.contractLog.unshift({txt:c.txt,opened:c.at,closed:CLOCK.hm(),result,
      note:result==='HONORED'?'closed by owner — kept; next contract may raise the bar'
        :'closed by owner — broken and logged without euphemism; the same contract re-arms next week'});
    SVR.audit('HUMAN (owner)','coach','Contract closed '+result+': "'+c.txt+'" — trail preserved in coach log');
    REVD_COACH.contract=null;
    UI.toast(result==='HONORED'?'HONORED. That is how trust with yourself compounds.'
      :'BROKEN — logged. The honest record is the only path back.','','CONTRACT');
    render();
  }});

CMD.define({id:'coach.court',label:'Open court docket',purpose:'Jump to Review → Learning Court',audit:false,
  run:()=>go('review','court')});

CMD.define({id:'coach.lockout',label:'Arm entry lockout drill',
  purpose:'Arm a 10-minute entry lockout — practicing the LS-124 countermeasure before tilt needs it',
  pre:()=>{const lk=REVD_COACH.lockout;
    return lk&&lk.until-CLOCK.mins()>0?'Lockout already armed — '+(lk.until-CLOCK.mins())+'m remaining':null},
  run:()=>{
    REVD_COACH.lockout={until:CLOCK.mins()+10,at:CLOCK.hm()};
    SVR.audit('HUMAN (owner)','coach','Entry-lockout drill armed for 10m at '+CLOCK.hm()
      +' — rehearsing LS-124 before the court rules on it');
    UI.toast('Lockout armed — 10 minutes. The point of the drill is noticing what you want to do during it.','warn','DISCIPLINE COACH');
    render();
  }});

CMD.define({id:'coach.laws',label:'Law texts + hits',
  purpose:'The six operator-facing laws verbatim, each with today’s live scan hits attached',audit:false,
  run:()=>{
    const sc=revdScan();
    UI.drawer('<div class="dhead"><span class="dt">OPERATOR-FACING LAWS · constitutional text + live hits</span>'+
      '<span class="pill">scan recomputed on open</span>'+
      '<button class="dx" data-cmd="coach.drawerclose">ESC</button></div>'+
      '<div class="dbody">'+REVD_COACH.viol.map(v2=>{
        const law=(typeof LAWBY!=='undefined'&&LAWBY[v2.law])?LAWBY[v2.law].text:'(law text unavailable in this build)';
        const hits=sc.hits[v2.law]||[];
        return'<div class="banner '+(hits.length?'warn':'info')+'" style="margin-bottom:8px"><span class="bico">§</span><div>'+
          '<b>'+v2.law+'</b> — '+U.esc(law)+
          '<div class="i2" style="font-size:10px;margin:4px 0">operator reading: '+U.esc(v2.name)+' · '+U.esc(v2.note)+'</div>'+
          (hits.length
            ?hits.map(x=>'<div class="mono" style="font-size:9.5px;color:var(--warn);margin-top:2px">▸ '
              +U.esc(x.src+' · '+x.txt.slice(0,120))+'</div>').join('')
            :'<div class="i2" style="font-size:9.5px">no scan hits this session</div>')+
          '</div></div>';
      }).join('')+
      '<div class="i2" style="font-size:10.5px">The scan patterns are printed on the tracker panel — a coach '+
        'whose method you cannot audit is a horoscope with a compliance budget.</div>'+
      '</div>');
  }});
CMD.define({id:'coach.drawerclose',label:'Close drawer',purpose:'Close the law-text drawer',audit:false,
  run:()=>UI.closeDrawer()});

CMD.define({id:'coach.premortem',label:'File pre-mortem',
  purpose:'Write today’s most likely failure BEFORE it can happen — auto-marks the pre-mortem habit',
  run:()=>{
    const inp=$('#revd-pm-in');
    if(!inp||!inp.value.trim()){UI.toast('Describe the failure mode first — “be careful” is not a pre-mortem','warn','PRE-MORTEM');return}
    REVD_COACH.premortems.unshift({t:CLOCK.hm(),txt:inp.value.trim()});
    const hab=REVD_COACH.habits.find(x=>x.id==='premortem');
    if(hab&&!hab.today){hab.today=true;hab.num=Math.min(hab.den,hab.num+1)}
    SVR.audit('HUMAN (owner)','coach','Pre-mortem filed at '+CLOCK.hm()+': "'
      +REVD_COACH.premortems[0].txt.slice(0,80)+'" — habit auto-marked');
    UI.toast('Pre-mortem filed. If today matches it, the coach earned nothing — which is the goal.','gold','PRE-MORTEM');
    render();
  }});

CMD.define({id:'coach.eod',label:'EOD checklist',
  purpose:'The 15-minute end-of-day review, as a checklist drawer with real destinations',audit:false,
  run:()=>{
    const steps=[
     ['1 · Journal completeness','every decision today has a row — taken AND rejected (LAW-018)','Review → Journal'],
     ['2 · Pre-mortem vs tape','did today fail the way you predicted this morning? Note the delta','this workspace, panel above'],
     ['3 · Violation scan','re-run the scan; classify anything new as caught vs landed','this workspace, tracker panel'],
     ['4 · Autopsy queue','any rejection worth a counterfactual? Convert it before memory edits it','Review → Opportunity Autopsy'],
     ['5 · Pattern deltas','did any family print its 30th post-flag trade? Check the decay table','Review → Pattern Lab'],
     ['6 · Habit gauges','mark journal + EOD habits — the gauge is the reward, take it','this workspace, scorecards'],
     ['7 · Tomorrow’s one line','write the single sentence tomorrow-you needs at 09:25','journal, final row'],
    ];
    UI.drawer('<div class="dhead"><span class="dt">EOD REVIEW · 15 minutes, seven steps</span>'+
      '<span class="pill">the cheapest alpha on the desk</span>'+
      '<button class="dx" data-cmd="coach.drawerclose">ESC</button></div>'+
      '<div class="dbody">'+
      steps.map(s2=>'<div class="kv"><span class="k" style="min-width:170px;font-size:10px">'+U.esc(s2[0])
        +'</span><span class="v"><span class="i1" style="font-size:11px">'+U.esc(s2[1])
        +'</span><div class="i2" style="font-size:9.5px;margin-top:2px">→ '+U.esc(s2[2])+'</div></span></div>').join('')+
      '<div class="btnrow" style="margin-top:10px">'+
      CMD.btn('coach.done','eod','gold','Mark EOD review done')+
      '</div>'+
      '<div class="i2" style="font-size:10.5px;margin-top:8px">Fifteen minutes while it is still today. The '+
        'same review tomorrow morning is archaeology; tonight it is surgery.</div>'+
      '</div>');
  }});

/* ── coach-minted court proposals — filed at load, judged like everything else ── */
if(typeof COURT!=='undefined'&&!COURT.some(x=>x.id==='LS-124')){
  COURT.push({id:'LS-124',title:'Entry lockout: 10 minutes after any stop-out',
    from:'S29 Journal Coach (Discipline Coach lane)',stage:'PROPOSED',
    evidence:'2 of the last 5 losses were followed by re-entry inside 10m without a fresh signal; both re-entries '
      +'lost (−2.0R combined). 90-day demo history: 4 revenge attempts, all ladder-caught — the lockout removes '
      +'the attempt itself.',
    diff:'exec.reentry_lockout_min: none → 10 (per symbol, after realized stop)',
    risk:'May miss a valid immediate re-test; shadow-tracked cost estimate ≈ 0.3R/month vs measured revenge tax',
    needs:'GOV-030: 30 shadow samples · owner sign-off'});
  COURT.push({id:'LS-126',title:'EOD lock until the same-day journal is filed',
    from:'S29 Journal Coach (Discipline Coach lane)',stage:'IN REVIEW',
    evidence:'LAW-018 skip count is the only violation series trending UP (3 in 90d, demo history). Next-morning '
      +'journals measurably drift: lessons written T+1 disagree with decision-time notes in 2 of 3 sampled cases.',
    diff:'journal.same_day_lock: false → true (terminal shows only the journal form after 16:10 until filed)',
    risk:'Pure friction, no market risk — the cost is 10 minutes of the operator’s evening, which is the point',
    needs:'Owner sign-off · 2-week trial window'});
}
