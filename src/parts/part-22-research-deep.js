/* ═══════════ PART-22 · RESEARCH DEEP — fundamentals dossier + factor & correlation lens ═══════════
   Two symbol-synchronized RESEARCH workspaces.
   research.fundamentals — the dossier the tape cannot show: earnings tape, forward setup,
     valuation band, ownership, red flags, and a context verdict that can attach to the packet.
   research.factors — realized metrics COMPUTED live from the seeded candle series
     (vol, beta, corr, drawdown, skew, momentum), rolling correlation, loadings, pair lab.
   Contract: everything derivable from candles() is derived and labeled COMPUTED FROM SERIES;
   everything else is a watermarked demo twin. Computed truth beats stored fiction. */

DOMAINS.research.ws.push({id:'fundamentals',label:'Fundamentals'});
DOMAINS.research.ws.push({id:'factors',label:'Factors & Pairs'});

/* ── module state ── */
const RSCH_FSTATE={pair:0,win:60,notional:12000};
const RSCH_DCACHE={};
const RSCH_NOTES=[];
let RSCH_NOTESEQ=0;

/* ── per-symbol anchors — kept consistent with the calendar + overview demo twins ── */
const RSCH_REALIZED={NVDA:5.1,AMD:6.2,TSLA:7.7,META:5.6};
const RSCH_IMPLIED={NVDA:6.8,AMD:7.4,TSLA:8.2,META:6.1};
const RSCH_NEXTQ={NVDA:21,AMD:9,TSLA:27,META:14};
const RSCH_PERSONA={NVDA:'run',META:'run',AMD:'mixed',TSLA:'fade'};
const RSCH_PEBASE={NVDA:46,AMD:39,TSLA:68,META:24,QQQ:29,SPY:23};
const RSCH_EVS={NVDA:26,AMD:9,TSLA:11,COIN:14};
const RSCH_SHORTF={AMD:4.1,COIN:8.4};
const RSCH_CROWD={NVDA:92,AMD:87,TSLA:71,META:64,QQQ:58,SPY:50};
const RSCH_GROWTH=['NVDA','AMD','TSLA','COIN'];
const RSCH_QLBL=['Q1 FY26','Q4 FY25','Q3 FY25','Q2 FY25','Q1 FY25','Q4 FY24','Q3 FY24','Q2 FY24'];
const RSCH_PEERSETS={
 'Semis':['AMD','AVGO','MU','TSM'],
 'Autos/Tech':['RIVN','F','GM','LCID'],
 'Mega-tech':['GOOGL','MSFT','AAPL','AMZN'],
 'Index':['SPY','QQQ','IWM','DIA'],
};
const RSCH_PAIRS=[
 {a:'NVDA',b:'AMD',lbl:'NVDA / AMD',why:'Semis rivalry — same fab cycle, same demand shock, different execution.'},
 {a:'QQQ',b:'SPY',lbl:'QQQ / SPY',why:'The growth-vs-tape basis. When this ratio trends, megacap concentration is doing the indexing.'},
 {a:'SMH',b:'SPY',lbl:'Semis / SPX',why:'Sector vs tape — SPX proxied by SPY; SMH is heartbeat-tier in the demo universe.'},
 {a:'TSLA',b:'QQQ',lbl:'TSLA / QQQ',why:'Idiosyncratic beta vs its own index — the residual is the story, not the beta.'},
];
const RSCH_SEGMAP={
 NVDA:[['Data Center',78],['Gaming',13],['Pro Visualization',4],['Auto & other',5]],
 TSLA:[['Automotive',79],['Energy storage',10],['Services & other',11]],
 AMD:[['Data Center',48],['Client',26],['Gaming',15],['Embedded',11]],
 META:[['Family of Apps',96],['Reality Labs',4]],
};
const RSCH_SECTW={
 QQQ:[['Info Tech',51.2],['Comm Svcs',15.8],['Cons Disc',12.6],['Health Care',6.1],['Cons Staples',5.9],['Industrials',4.8],['Other',3.6]],
 SPY:[['Info Tech',32.4],['Financials',13.1],['Health Care',11.6],['Comm Svcs',9.4],['Cons Disc',10.3],['Industrials',8.2],['Other',15.0]],
};
const RSCH_TOPW={
 QQQ:[['NVDA',9.1],['MSFT',8.7],['AAPL',8.4],['AMZN',5.6],['META',4.9],['AVGO',4.7],['GOOGL',4.6],['TSLA',3.4],['NFLX',2.2],['COST',2.1]],
 SPY:[['NVDA',7.0],['MSFT',6.6],['AAPL',6.2],['AMZN',4.1],['META',2.9],['AVGO',2.4],['GOOGL',2.3],['BRK.B',1.7],['TSLA',1.6],['JPM',1.5]],
};

/* ── guarded symbol access — views must never throw, even on empty stores ── */
function RSCH_sym(){
  const s=symBy(S.sym)||SYMS[0];
  if(s)return s;
  return{sym:'NVDA',name:'—',px:100,chg:0,rvol:1,rs:50,ivr:30,setup:'—',fsm:'SCANNING',bias:'—',sector:'—',note:'',levels:{},unmet:[]};
}
function RSCH_bench(sym){return sym==='SPY'?'QQQ':'SPY'}
function RSCH_pkt(sym){
  return PACKETS.find(p=>p.sym===sym&&(p.state==='READY_FOR_HUMAN'||p.state==='RISK_BLOCKED'||p.state==='FORMING'))||null;
}
function RSCH_head(tab,sub){
  const s=RSCH_sym();
  return vhead('RESEARCH · '+tab,
    U.esc(s.sym)+' <span class="i1" style="font-size:12px;font-weight:400">'+U.esc(s.name)+'</span> '+
    '<span class="mono" style="font-size:13px">'+U.fmt(s.px)+' <span class="'+(s.chg>=0?'up':'dn')+'">'+U.pct(s.chg)+'</span></span> '+lc(s.fsm),
    sub+' · Snapshot '+CLOCK.hm()+' ET')+
    '<div class="row" style="margin:-6px 0 12px">'+
    (typeof symSwitcher==='function'?symSwitcher():'')+
    '<span class="pill">'+U.esc(s.setup)+' · bias '+U.esc(s.bias)+'</span>'+
    '</div>';
}

/* ═══════════ series math kernel — every formula here runs on the real seeded candles ═══════════
   candles() is the same generator the chart draws from (live when NET.on).
   Bars carry no wall-clock in DEMO; annualization treats one bar as one session (√252)
   and says so wherever an annualized number is shown. */
function RSCH_closes(sym,n){
  const cs=candles(sym,n||360);
  return(cs&&cs.length?cs:[{c:100},{c:100}]).map(c=>c.c);
}
function RSCH_rets(cl){
  const r=[];
  for(let i=1;i<cl.length;i++)r.push(Math.log(cl[i]/cl[i-1]));
  return r;
}
function RSCH_mean(a){return a.length?a.reduce((s,x)=>s+x,0)/a.length:0}
function RSCH_sd(a){
  if(a.length<2)return 0;
  const m=RSCH_mean(a);
  return Math.sqrt(a.reduce((s,x)=>s+(x-m)*(x-m),0)/(a.length-1));
}
function RSCH_skew(a){
  const n=a.length;if(n<3)return 0;
  const m=RSCH_mean(a),sd=RSCH_sd(a)||1e-9;
  let s3=0;for(let i=0;i<n;i++){const z=(a[i]-m)/sd;s3+=z*z*z}
  return n/((n-1)*(n-2))*s3;
}
function RSCH_maxdd(cl){
  let peak=cl[0]||1,dd=0;
  for(let i=1;i<cl.length;i++){
    if(cl[i]>peak)peak=cl[i];
    const d=cl[i]/peak-1;
    if(d<dd)dd=d;
  }
  return dd*100;
}
function RSCH_corrOf(a,b){
  const n=Math.min(a.length,b.length);if(n<3)return 0;
  const ma=RSCH_mean(a.slice(0,n)),mb=RSCH_mean(b.slice(0,n));
  let sxy=0,sxx=0,syy=0;
  for(let i=0;i<n;i++){sxy+=(a[i]-ma)*(b[i]-mb);sxx+=(a[i]-ma)*(a[i]-ma);syy+=(b[i]-mb)*(b[i]-mb)}
  return sxy/(Math.sqrt(sxx*syy)||1e-9);
}
function RSCH_rollcorr(ra,rb,win){
  const n=Math.min(ra.length,rb.length),out=[];
  for(let i=win;i<=n;i++)out.push(RSCH_corrOf(ra.slice(i-win,i),rb.slice(i-win,i)));
  return out;
}
/* composite: everything the factors tab needs, with the raw regression sums kept for the math drawer */
function RSCH_metrics(sym){
  const bench=RSCH_bench(sym);
  const cl=RSCH_closes(sym,360),bl=RSCH_closes(bench,360);
  const ra=RSCH_rets(cl),rb=RSCH_rets(bl);
  const n=Math.min(ra.length,rb.length);
  const rr=ra.slice(0,n),bb=rb.slice(0,n);
  const mr=RSCH_mean(rr),mb=RSCH_mean(bb);
  let sxy=0,sxx=0;
  for(let i=0;i<n;i++){sxy+=(bb[i]-mb)*(rr[i]-mr);sxx+=(bb[i]-mb)*(bb[i]-mb)}
  const cov=n>1?sxy/(n-1):0;
  const varB=n>1?sxx/(n-1):1e-9;
  const beta=cov/(varB||1e-9);
  const sdR=RSCH_sd(rr),sdB=RSCH_sd(bb);
  const corr=cov/((sdR*sdB)||1e-9);
  const alpha=(mr-beta*mb)*252*100;
  const vol20=RSCH_sd(rr.slice(-20))*Math.sqrt(252)*100;
  const volB20=RSCH_sd(bb.slice(-20))*Math.sqrt(252)*100;
  const dd=RSCH_maxdd(cl);
  const skew=RSCH_skew(rr);
  /* 12-1 momentum proxy: total return over [t-273 .. t-21], skipping the most recent 21 bars */
  const iEnd=Math.max(1,cl.length-22),iStart=Math.max(0,cl.length-274);
  const mom=(cl[iEnd]/(cl[iStart]||1)-1)*100;
  return{bench,n,cl,bl,rr,bb,mr,mb,sxy,sxx,cov,varB,beta,corr,r2:corr*corr,alpha,sdR,sdB,vol20,volB20,dd,skew,mom,iStart,iEnd};
}
/* sub-window OLS — beta stability across thirds of the sample */
function RSCH_betaWin(rr,bb,from,to){
  const a=rr.slice(from,to),b=bb.slice(from,to),n=Math.min(a.length,b.length);
  if(n<3)return{beta:0,corr:0,n};
  const ma=RSCH_mean(a),mb2=RSCH_mean(b);
  let sxy=0,sxx=0;
  for(let i=0;i<n;i++){sxy+=(b[i]-mb2)*(a[i]-ma);sxx+=(b[i]-mb2)*(b[i]-mb2)}
  const beta=sxy/(sxx||1e-9);
  return{beta,corr:RSCH_corrOf(a,b),n};
}
/* realized vol over a trailing window, annualized by the bars-as-sessions convention */
function RSCH_volWin(rr,w){return RSCH_sd(rr.slice(-w))*Math.sqrt(252)*100}
/* tail forensics: extreme bars + return concentration */
function RSCH_tails(sym){
  const cl=RSCH_closes(sym,360);
  const rr=RSCH_rets(cl);
  const idx=rr.map((v,i)=>({i:i+1,v})).sort((a,b)=>a.v-b.v);
  const worst=idx.slice(0,5);
  const best=idx.slice(-5).reverse();
  const sumAll=rr.reduce((s2,x)=>s2+x,0);
  const top10=idx.slice(-10).reduce((s2,x)=>s2+x.v,0);
  return{worst,best,
    tot:(Math.exp(sumAll)-1)*100,
    exBest10:(Math.exp(sumAll-top10)-1)*100};
}
/* pair lab: z-score of the log-ratio of the two close series */
function RSCH_pairz(pi){
  const p=RSCH_PAIRS[U.clamp(pi,0,RSCH_PAIRS.length-1)];
  const a=RSCH_closes(p.a,360),b=RSCH_closes(p.b,360);
  const n=Math.min(a.length,b.length),L=[];
  for(let i=0;i<n;i++)L.push(Math.log((a[i]||1)/(b[i]||1)));
  const mean=RSCH_mean(L),sd=RSCH_sd(L)||1e-9;
  const zs=L.map(x=>(x-mean)/sd);
  return{p,n,mean,sd,zs,z:zs[n-1]||0};
}
/* factor loadings: momentum + low-vol derived from the series; size/value/quality are twins */
function RSCH_loadings(sym){
  const m=RSCH_metrics(sym);
  const rng=localRng('rsch-load-'+sym);
  const etf=(RSCH_sym().sector==='Index'&&RSCH_sym().sym===sym);
  return[
   {k:'MOMENTUM',v:U.clamp(m.mom/45,-1.6,1.6),src:'C',note:'12-1 proxy '+U.pct(m.mom,1)+' from the series, /45 to loading scale'},
   {k:'SIZE (SMB)',v:etf?-(0.05+rng()*0.1):-(0.25+rng()*0.55),src:'T',note:'mega-cap tilt — negative small-minus-big exposure'},
   {k:'VALUE (HML)',v:etf?-(0.1+rng()*0.15):(RSCH_GROWTH.includes(sym)?-(0.35+rng()*0.5):-(0.05+rng()*0.3)),src:'T',note:'growth names carry negative value loading by construction'},
   {k:'QUALITY',v:0.1+rng()*0.5,src:'T',note:'profitability / accrual-quality composite'},
   {k:'LOW-VOL',v:U.clamp((m.volB20-m.vol20)/(m.volB20||1e-9),-1.6,1.6),src:'C',note:'(σ_'+m.bench+' − σ_sym)/σ_'+m.bench+' on the 20-bar realized numbers'},
  ];
}

/* ═══════════ fundamentals dossier — deterministic per symbol, honest demo twin ═══════════ */
function RSCH_dossier(sym){
  if(RSCH_DCACHE[sym])return RSCH_DCACHE[sym];
  const s=symBy(sym)||RSCH_sym();
  const rng=localRng('seed-'+sym);
  const etf=s.sector==='Index';
  const d={sym,name:s.name,px:s.px,sector:s.sector,etf};

  if(!etf){
    /* ── (a) earnings scorecard — 8 quarters ── */
    const persona=RSCH_PERSONA[sym]||(rng()<0.4?'run':rng()<0.75?'mixed':'fade');
    const beatP=persona==='run'?0.8:persona==='mixed'?0.68:0.55;
    const gq=persona==='run'?0.07:persona==='mixed'?0.04:0.015;
    const epsQ=s.px/110,revB=6+s.px/8;
    const target=RSCH_REALIZED[sym]||(3.5+rng()*4);
    d.persona=persona;
    d.qtrs=[];
    for(let qi=0;qi<8;qi++){
      const epsE=epsQ*(1-gq*qi)*(1+(rng()-0.5)*0.04);
      const beat=rng()<beatP;
      const surp=beat?(0.8+rng()*8.5):-(0.4+rng()*4.5);
      const epsA=epsE*(1+surp/100);
      const revE=revB*(1-gq*0.8*qi)*(1+(rng()-0.5)*0.03);
      const rBeat=rng()<0.7;
      const rsurp=rBeat?(0.2+rng()*3.5):-(0.1+rng()*2);
      const revA=revE*(1+rsurp/100);
      let sign;
      if(beat)sign=persona==='fade'?(rng()<0.62?-1:1):persona==='run'?(rng()<0.78?1:-1):(rng()<0.55?1:-1);
      else sign=rng()<0.72?-1:1;
      const react=sign*(0.8+rng()*8);
      const g=rng();
      const guide=persona==='run'?(g<0.55?'RAISED':g<0.9?'HELD':'CUT')
        :persona==='mixed'?(g<0.35?'RAISED':g<0.8?'HELD':'CUT')
        :(g<0.2?'RAISED':g<0.62?'HELD':'CUT');
      d.qtrs.push({lbl:RSCH_QLBL[qi],epsE,epsA,surp,revE,revA,rsurp,react,guide});
    }
    /* scale reactions so the 8-quarter |move| average matches the calendar twin exactly */
    const rawAbs=RSCH_mean(d.qtrs.map(q=>Math.abs(q.react)))||1;
    d.qtrs.forEach(q=>q.react=q.react*target/rawAbs);

    /* pattern verdict — the arithmetic, shown */
    const beats=d.qtrs.filter(q=>q.surp>0).length;
    const fades=d.qtrs.filter(q=>q.surp>0&&q.react<0).length;
    const beatReacts=d.qtrs.filter(q=>q.surp>0).map(q=>q.react);
    const avgBeat=RSCH_mean(beatReacts);
    const avgAbs=RSCH_mean(d.qtrs.map(q=>Math.abs(q.react)));
    let pv,pvRead;
    if(beats>=5&&fades<=Math.floor(beats/3)&&avgBeat>0.5){
      pv='BEAT-AND-RUN';
      pvRead='Beats get paid — positioning is not yet full. Post-reaction continuation entries carry the edge; chasing the gap itself does not.';
    }else if(beats>=4&&fades*2>=beats){
      pv='BEAT-AND-FADE';
      pvRead='Beats get sold — the print is priced before it happens. The gap IS the exit liquidity (S19 trap archetype). Fade structures only, never through the window.';
    }else{
      pv='MIXED TAPE';
      pvRead='No stable reaction pattern. Earnings are a coin-flip here — the desk trades the post-print structure, never the print.';
    }
    d.pat={beats,fades,avgBeat,avgAbs,verdict:pv,read:pvRead,
      math:beats+'/8 EPS beats · '+fades+' of those '+beats+' beats closed next day red · avg next-day on beats '+U.pct(avgBeat,1)+' · avg |move| across all 8: '+U.fmt(avgAbs,1)+'%'};

    /* ── (b) forward setup ── */
    const days=RSCH_NEXTQ[sym]||(7+Math.floor(rng()*35));
    const consensus=epsQ*(1+gq)*(1+(rng()-0.5)*0.03);
    const whisperPct=(rng()-0.42)*4;
    const whisper=consensus*(1+whisperPct/100);
    const implied=RSCH_IMPLIED[sym]||(target*(0.9+rng()*0.5));
    const realized=target;
    let fv;
    if(implied>realized*1.15)fv='IMPLIED RICH — options pay '+U.fmt((implied/realized-1)*100,0)+'% over the 8-quarter tape. Selling the move is the statistical side, but only defined-risk, and never through the blackout.';
    else if(implied<realized*0.9)fv='IMPLIED CHEAP — history says the straddle underprices this tape. Long-vol structures ahead of the window are the asymmetric side.';
    else fv='FAIR — no vol edge either way. Trade the post-print structure, not the print.';
    d.fwd={days,when:'T+'+days+'d AMC',consensus,whisper,whisperPct,implied,realized,verdict:fv,
      blackout:'Blackout arms T-'+U.fmt(ck('risk.event_window_hrs')/24,0)+'d — no new entries inside '+ck('risk.event_window_hrs')+'h of the print. Enforced, not advisory.'};

    /* ── (c) valuation band ── */
    const base=RSCH_PEBASE[sym]||(18+rng()*22);
    const peMin=base*(0.52+rng()*0.08);
    const peMax=base*(1.45+rng()*0.35);
    const peMed=base*(0.92+rng()*0.1);
    const peCur=peMin+(peMax-peMin)*(0.45+rng()*0.45);
    d.val={peMin,peMed,peMax,peCur,pct:(peCur-peMin)/(peMax-peMin)*100,
      evs:RSCH_GROWTH.includes(sym)?{cur:RSCH_EVS[sym]||(6+rng()*8),med:(RSCH_EVS[sym]||10)*(0.7+rng()*0.25)}:null};

    /* ── (d) ownership & positioning ── */
    const shortF=RSCH_SHORTF[sym]||2.4;
    const roles=['CEO','CFO','EVP Engineering','Director','SVP Sales','10% Owner (fund)'];
    const insiders=[];let net=0,buys=0;
    for(let i=0;i<6;i++){
      const t=rng();
      const kind=t<0.55?'SELL · 10b5-1':t<0.75?'SELL · discretionary':t<0.9?'EXERCISE + HOLD':'BUY · open-market';
      const sh=(3+Math.floor(rng()*70))*1000;
      const px=s.px*(0.82+rng()*0.3);
      const val=sh*px/1e6;
      const dd2=8+i*24+Math.floor(rng()*12);
      if(kind.startsWith('SELL'))net-=val;
      else if(kind.startsWith('BUY')){net+=val;buys++}
      insiders.push({d:'T-'+dd2+'d',who:roles[i],kind,sh,px,val});
    }
    d.own={inst:55+rng()*33,top10:19+rng()*26,shortF,
      dtc:U.clamp(0.5+shortF*0.5+rng()*1.2,0.4,9),
      insiders,net,cluster:buys>=2,
      netTxt:(net>=0?'net +$':'net −$')+U.fmt(Math.abs(net),1)+'M over 6m — '+(buys>=2?'open-market buy cluster: the only insider signal the desk weights (S17)':'programmatic 10b5-1 cadence dominates — schedule, not information')};

    /* ── est-walk: how consensus moved into the print ── */
    const estDrift=persona==='run'?0.9+rng()*2.4:persona==='fade'?-(0.4+rng()*2.2):(rng()-0.5)*2;
    d.est={
      walk:[
       {t:'T-90d',v:consensus*(1-estDrift/100*3)},
       {t:'T-60d',v:consensus*(1-estDrift/100*2)},
       {t:'T-30d',v:consensus*(1-estDrift/100)},
       {t:'now',v:consensus},
      ],
      drift:estDrift*3,
      nUp:Math.round(persona==='run'?8+rng()*9:2+rng()*6),
      nDn:Math.round(persona==='fade'?7+rng()*8:1+rng()*4),
    };
    d.est.read=d.est.nUp>d.est.nDn*2
      ?'Revision momentum UP — the sell-side is chasing the number higher. Beats against a rising bar are the strong form of §a.'
      :d.est.nDn>d.est.nUp
      ?'Revision momentum DOWN — the bar is being walked to meet the company. A “beat” against a lowered bar is a costume (see flag §e·GWD).'
      :'Revisions mixed — the estimate tape has no lean into this print.';

    /* ── analyst coverage — consensus is a positioning datum, not a forecast ── */
    const anlB=sym==='NVDA'?24:Math.round(6+rng()*22);
    const anlH=sym==='NVDA'?6:Math.round(2+rng()*9);
    const anlS=sym==='NVDA'?1:Math.round(rng()*3);
    const ptUp=sym==='NVDA'?9:Math.round((persona==='run'?6:persona==='fade'?-2:2)+rng()*10);
    d.anl={b:anlB,h:anlH,s2:anlS,ptUp,
      ptMed:s.px*(1+ptUp/100),
      ptHigh:s.px*(1+ptUp/100+0.12+rng()*0.14),
      ptLow:s.px*(1+ptUp/100-0.16-rng()*0.12),
      crowd:anlB/(anlB+anlH+anlS)};
    d.anl.read=d.anl.crowd>0.75
      ?'Consensus is crowded long ('+Math.round(d.anl.crowd*100)+'% buy) — upgrades are spent fuel; the marginal rating change is a downgrade. Contrarian information lives in the sell column.'
      :d.anl.crowd<0.45
      ?'Street is skeptical — upgrades are live catalysts here; the pain trade is up.'
      :'Coverage is split — rating changes carry real information in both directions.';

    /* ── quality ladder — margins over 4 quarters ── */
    const gmBase=s.sector==='Semis'?72-rng()*8:s.sector==='Mega-tech'?78-rng()*6:s.sector==='Autos/Tech'?19+rng()*6:38+rng()*20;
    const slope=persona==='run'?0.5+rng()*0.7:persona==='fade'?-(0.3+rng()*0.8):(rng()-0.5)*0.8;
    d.qual={rows:[],slope};
    for(let qi2=3;qi2>=0;qi2--){
      const gm=gmBase-slope*qi2+(rng()-0.5)*0.8;
      d.qual.rows.push({lbl:RSCH_QLBL[qi2],gm,om:gm-(18+rng()*4),fcf:gm-(26+rng()*6)});
    }
    d.qual.read=slope>0.3
      ?'Margins expanding — pricing power is real; the P&L is compounding ahead of revenue.'
      :slope<-0.3
      ?'Margins compressing — growth is being bought. Watch the gap between the revenue narrative and the FCF line.'
      :'Margins flat — the operating story is stability, not leverage.';

    /* ── balance sheet snapshot ── */
    const netCash=(persona==='fade'?-1:1)*(rng()*38)+(s.sector==='Mega-tech'?30:0);
    d.bs={netCash,
      fcf:revB*4*(0.08+rng()*0.22),
      sbc:(s.sector==='Semis'||s.sector==='Mega-tech'?2+rng()*6:4+rng()*9),
      buyback:Math.max(0,netCash*0.4+rng()*20),
      cover:netCash>=0?'n/a — net cash':U.fmt(4+rng()*14,1)+'× interest coverage'};

    /* ── segment mix — where the revenue actually comes from ── */
    const segs=RSCH_SEGMAP[sym]||[['Core',62+Math.round(rng()*18)],['Adjacent',18+Math.round(rng()*12)],['Other',8+Math.round(rng()*8)]];
    const segTot=segs.reduce((s2,x)=>s2+x[1],0);
    d.seg=segs.map(([nm,share])=>{
      const g=(persona==='run'?14:persona==='fade'?2:7)+(rng()-0.4)*26;
      return{nm,share:share/segTot*100,g};
    });
    d.seg.sort((a,b)=>b.share-a.share);
    const topSeg=d.seg[0];
    const drift=(topSeg.g-RSCH_mean(d.seg.map(x=>x.g)))*0.12;
    d.segRead=topSeg.share>70
      ?topSeg.nm+' is '+U.fmt(topSeg.share,0)+'% of revenue — this is a one-segment company wearing a diversified income statement. The '+topSeg.nm.toLowerCase()+' cycle IS the stock (reconciles with flag §e·CUST).'
      :'No segment above 70% — the mix spreads the cycle risk; watch the fastest-growing line, because in eight quarters it will own the multiple.';
    d.segDrift=drift;

    /* ── transcript signals — language forensics on the last call ── */
    const tone=persona==='run'?64+rng()*22:persona==='fade'?34+rng()*22:46+rng()*22;
    const hedge=persona==='fade'?'+38% q/q':persona==='run'?'−12% q/q':'+6% q/q';
    d.call={tone:Math.round(tone),hedge,
      phrases:persona==='run'?[
       ['“demand continues to outpace supply”','capacity constraint framing — the strong form of a raise; watch capex follow-through'],
       ['“we are raising our full-year outlook”','the direct raise — reconciles with the guidance column in §a'],
       ['“visibility has improved”','order-book language; the walkdown flag stays clear while this survives'],
      ]:persona==='fade'?[
       ['“prudent to remain conservative”','pre-walkdown vocabulary — this phrase precedes guide-downs more often than it precedes beats'],
       ['“macro headwinds affecting near-term visibility”','externalizing language — soft numbers get blamed outward before they get reported'],
       ['“transitional quarter”','the classic euphemism; two “transitional” quarters in a row is a trend wearing a costume'],
      ]:[
       ['“in line with our expectations”','stability framing — neither fuel nor warning'],
       ['“we continue to monitor the environment”','filler hedging — carries no information either way'],
       ['“balanced approach to investment”','capital-allocation neutrality; the buyback line matters more than this sentence'],
      ]};

    /* ── (e) red flags registry ── */
    const ov={NVDA:{cust:'WATCH'},TSLA:{gwd:'WATCH',dil:'WATCH'}}[sym]||{};
    const st=id=>ov[id]||(rng()<0.03?'RAISED':rng()<0.12?'WATCH':'CLEAR');
    const F=(id,nm,owner,states,raise,clear)=>{
      const state=st(id);
      return{id,nm,owner,st:state,read:states[state]||states.CLEAR,raise,clear};
    };
    d.flags=[
     F('acc','ACCRUALS DIVERGENCE','S20',{
       CLEAR:'Cash conversion ≈ 96% of GAAP net income TTM — earnings are cash-backed.',
       WATCH:'Accruals ratio 9.8% of assets and rising two quarters — paper earnings creeping ahead of cash.',
       RAISED:'Cash conversion below 70% for 3 quarters — GAAP profits are not turning into cash.'},
      'Accruals ratio > 12% of assets for 2 consecutive quarters, or receivables growing 2× revenue.',
      'One full quarter with cash conversion back above 90%.'),
     F('dil','DILUTION CADENCE','S20',{
       CLEAR:'Share count −0.8% y/y — buyback net of SBC issuance. No overhang.',
       WATCH:'Share count +3.1% y/y, SBC-driven — each year the same earnings are split more ways.',
       RAISED:'Active ATM program + secondary filed — supply of shares is a standing seller above.'},
      'Secondary offering, convertible issue, or ATM program filing.',
      'Two quarters of flat-to-shrinking fully-diluted count.'),
     F('gwd','GUIDANCE WALKDOWN','S19',{
       CLEAR:'Guides conservatively, then beats — sandbagging cadence, benign.',
       WATCH:'Two consecutive guide-downs while sell-side FY estimates held — an estimate cliff is being built.',
       RAISED:'Third guide-down; consensus finally cutting — the cliff is live and the tape knows.'},
      'A second consecutive guide-down with FY consensus unchanged.',
      'One quarter guided flat-or-up and delivered.'),
     F('cust','CUSTOMER CONCENTRATION','S17',{
       CLEAR:'No customer above 10% of revenue — demand base is diversified.',
       WATCH:'Top-4 hyperscalers ≈ 46% of data-center revenue — a capex pause there is a revenue cliff here. Watch THEIR capex guidance at THEIR prints, not ours.',
       RAISED:'Single customer > 25% of revenue and renegotiating — binary exposure, size accordingly.'},
      'Any single customer crossing 20% of revenue in a 10-K/10-Q breakout.',
      'Concentration falling below 10% for the top account.'),
    ];

    /* ── (f) fundamental context verdict ── */
    let score=0;
    if(pv==='BEAT-AND-RUN')score+=2;
    if(pv==='BEAT-AND-FADE')score-=2;
    const lastG=d.qtrs[0].guide;
    if(lastG==='RAISED')score+=1;
    if(lastG==='CUT')score-=1;
    d.flags.forEach(f=>{if(f.st==='WATCH')score-=1;if(f.st==='RAISED')score-=3});
    if(d.val.pct>85)score-=1;
    if(d.val.pct<40)score+=1;
    if(whisperPct>1.5)score+=1;
    if(whisperPct<-1.5)score-=1;
    const nWatch=d.flags.filter(f=>f.st==='WATCH').length,nRaised=d.flags.filter(f=>f.st==='RAISED').length;
    const v=score>=2?'TAILWIND':score<=-2?'HEADWIND':'NEUTRAL';
    d.verdict={v,score,
      cls:v==='TAILWIND'?'ch-ok':v==='HEADWIND'?'ch-warn':'ch-info',
      ico:v==='TAILWIND'?'✓':v==='HEADWIND'?'!':'·',
      reasons:[
       '8-quarter tape: '+d.pat.math+' → '+pv+' (§a)',
       'Fwd P/E '+U.fmt(peCur,0)+'× sits at the '+U.fmt(d.val.pct,0)+'th pctile of its own 5y band ('+U.fmt(peMin,0)+'–'+U.fmt(peMax,0)+'×) — context, not a trigger (§c)',
       'Red-flag registry: '+(4-nWatch-nRaised)+' CLEAR · '+nWatch+' WATCH · '+nRaised+' RAISED'+(nWatch+nRaised?' — '+d.flags.filter(f=>f.st!=='CLEAR').map(f=>f.nm.toLowerCase()).join(', '):'')+' (§e)',
      ]};
  }else{
    /* ── ETF branch — issuer fundamentals do not exist; constituent-weighted twin ── */
    const topw=(RSCH_TOPW[sym]||RSCH_TOPW.QQQ).map(([nm,wt])=>{
      const rr2=localRng('seed-'+sym+'-'+nm);
      return[nm,wt,3+Math.floor(rr2()*38),(2+rr2()*7)];
    });
    const top10w=topw.reduce((s2,r)=>s2+r[1],0);
    const beatRate=68+Math.floor(rng()*18);
    const flow5d=(rng()-0.42)*6;
    const base=RSCH_PEBASE[sym]||24;
    const peMin=base*0.6,peMax=base*1.35,peMed=base*0.95;
    const peCur=peMin+(peMax-peMin)*(0.5+rng()*0.4);
    d.val={peMin,peMed,peMax,peCur,pct:(peCur-peMin)/(peMax-peMin)*100,evs:null};
    d.etfx={topw,top10w,beatRate,flow5d,
      aum:sym==='SPY'?'$640B':'$310B',
      wpe:peCur};
    d.flags=[
     {id:'conc',nm:'CONCENTRATION',owner:'S33',st:top10w>45?'WATCH':'CLEAR',
      read:'Top-10 = '+U.fmt(top10w,1)+'% of the fund — '+(top10w>45?'the “index” is ten stocks wearing a costume. Correlation math, not diversification.':'concentration inside historical norms.'),
      raise:'Top-10 weight crossing 50%.',clear:'Top-10 weight back under 40%.'},
     {id:'acc',nm:'ACCRUALS DIVERGENCE',owner:'S20',st:'CLEAR',read:'Not applicable at fund level — see constituent dossiers.',raise:'—',clear:'—'},
     {id:'dil',nm:'DILUTION CADENCE',owner:'S20',st:'CLEAR',read:'Not applicable — ETF share creation is arbitrage plumbing, not dilution.',raise:'—',clear:'—'},
     {id:'gwd',nm:'GUIDANCE WALKDOWN',owner:'S19',st:'CLEAR',read:'Season-level: '+beatRate+'% weighted beat rate so far — no aggregate walkdown.',raise:'Weighted beat rate below 55% mid-season.',clear:'—'},
    ];
    let score=0;
    if(beatRate>72)score+=1;
    if(top10w>45)score-=1;
    if(flow5d>0.5)score+=1;
    if(flow5d<-0.5)score-=1;
    const v=score>=2?'TAILWIND':score<=-2?'HEADWIND':'NEUTRAL';
    d.verdict={v,score,
      cls:v==='TAILWIND'?'ch-ok':v==='HEADWIND'?'ch-warn':'ch-info',
      ico:v==='TAILWIND'?'✓':v==='HEADWIND'?'!':'·',
      reasons:[
       'Weighted constituent beat rate '+beatRate+'% this season — the earnings tape under the index (§a)',
       'Index fwd P/E '+U.fmt(peCur,1)+'× at the '+U.fmt(d.val.pct,0)+'th pctile of its 5y band (§c)',
       'Top-10 concentration '+U.fmt(top10w,1)+'% · 5d flows '+(flow5d>=0?'+$':'−$')+U.fmt(Math.abs(flow5d),1)+'B (§d/§e)',
      ]};
  }
  RSCH_DCACHE[sym]=d;
  return d;
}

/* ── peer comparison rows (funda.compare) — labeled twin ── */
function RSCH_peerRow(sym,subject){
  const rng=localRng('rsch-peer-'+sym);
  const s=symBy(sym);
  const dsub=subject?RSCH_dossier(sym):null;
  return{
    sym,
    pe:dsub?dsub.val.peCur:(14+rng()*46),
    evs:dsub&&dsub.val.evs?dsub.val.evs.cur:(2+rng()*16),
    grow:(dsub&&!dsub.etf?(dsub.persona==='run'?22:dsub.persona==='mixed'?12:5):8)+rng()*14,
    gm:(s&&s.sector==='Semis')||['AVGO','MU','TSM'].includes(sym)?48+rng()*28:32+rng()*38,
    shortF:RSCH_SHORTF[sym]||(0.8+rng()*4.5),
  };
}

/* ═══════════ canvases — POSTRENDER, unique ids, house palette ═══════════ */
function RSCH_drawReact(d){
  POSTRENDER.push(()=>{
    const cv=document.getElementById('rsch-cv-react');if(!cv)return;
    const W=cv.width=cv.clientWidth*2,H=cv.height=180*2,x=cv.getContext('2d');
    x.fillStyle='#070B12';x.fillRect(0,0,W,H);
    const qs=d.qtrs.slice().reverse();
    const maxA=Math.max(...qs.map(q=>Math.abs(q.react)),1)*1.25;
    const zero=H*0.5,bw=W/qs.length;
    x.strokeStyle='rgba(151,166,192,.07)';x.lineWidth=1;
    for(let g=-2;g<=2;g++){const y=zero-g*(H*0.4)/2;x.beginPath();x.moveTo(0,y);x.lineTo(W,y);x.stroke()}
    x.strokeStyle='rgba(151,166,192,.3)';x.beginPath();x.moveTo(0,zero);x.lineTo(W,zero);x.stroke();
    const avg=d.pat.avgAbs;
    x.strokeStyle='rgba(231,182,83,.45)';x.setLineDash([6,5]);
    [avg,-avg].forEach(v=>{const y=zero-(v/maxA)*(H*0.4);x.beginPath();x.moveTo(0,y);x.lineTo(W,y);x.stroke()});
    x.setLineDash([]);
    x.font='15px monospace';
    qs.forEach((q,i)=>{
      const h2=(q.react/maxA)*(H*0.4),X=i*bw;
      x.fillStyle=q.react>=0?'rgba(47,214,160,.8)':'rgba(242,99,124,.8)';
      x.fillRect(X+bw*0.2,Math.min(zero,zero-h2),bw*0.6,Math.abs(h2));
      x.fillStyle='#9FABBF';
      x.fillText((q.react>=0?'+':'')+q.react.toFixed(1)+'%',X+bw*0.2,zero-h2+(q.react>=0?-8:24));
      x.fillStyle=q.surp>0?'rgba(47,214,160,.6)':'rgba(242,99,124,.6)';
      x.fillText(q.surp>0?'BEAT':'MISS',X+bw*0.2,H-30);
      x.fillStyle='#67748C';
      x.fillText(q.lbl.replace(' FY','·'),X+bw*0.2,H-10);
    });
    x.fillStyle='rgba(231,182,83,.8)';
    x.fillText('±'+avg.toFixed(1)+'% = 8q realized avg — the number the implied move is judged against',10,20);
  });
}
function RSCH_drawBand(d,sym){
  POSTRENDER.push(()=>{
    const cv=document.getElementById('rsch-cv-band');if(!cv)return;
    const W=cv.width=cv.clientWidth*2,H=cv.height=210*2,x=cv.getContext('2d');
    x.fillStyle='#070B12';x.fillRect(0,0,W,H);
    const v=d.val,rng=localRng('rsch-band-'+sym);
    const pts=[];let pe=v.peMed;
    for(let i=0;i<60;i++){
      pe=pe+(v.peMed-pe)*0.08+(rng()-0.5)*(v.peMax-v.peMin)*0.09;
      pe=U.clamp(pe,v.peMin*0.98,v.peMax*1.02);
      pts.push(pe);
    }
    pts[59]=v.peCur;
    const lo=v.peMin*0.88,hi=v.peMax*1.08,AX=110;
    const py=p=>H-((p-lo)/(hi-lo))*(H*0.84)-H*0.06;
    x.strokeStyle='rgba(151,166,192,.07)';x.lineWidth=1;x.font='15px monospace';
    for(let g=0;g<=4;g++){const y=H*0.06+g*(H*0.84)/4;x.beginPath();x.moveTo(0,y);x.lineTo(W-AX,y);x.stroke()}
    [['5y MAX',v.peMax,'rgba(242,99,124,.55)'],['MEDIAN',v.peMed,'rgba(151,166,192,.5)'],['5y MIN',v.peMin,'rgba(47,214,160,.55)']].forEach(([nm,p,col])=>{
      const y=py(p);
      x.strokeStyle=col;x.setLineDash([7,5]);x.beginPath();x.moveTo(0,y);x.lineTo(W-AX,y);x.stroke();x.setLineDash([]);
      x.fillStyle=col;x.fillText(nm+' '+p.toFixed(0)+'×',W-AX+8,y+5);
    });
    x.strokeStyle='#5AA7FF';x.lineWidth=2.5;x.beginPath();
    pts.forEach((p,i)=>{const X=i/(pts.length-1)*(W-AX-24),Y=py(p);i?x.lineTo(X,Y):x.moveTo(X,Y)});
    x.stroke();
    const cy=py(v.peCur),cx=(W-AX-24);
    x.fillStyle='#E7B653';x.beginPath();x.arc(cx,cy,8,0,7);x.fill();
    x.fillText('NOW '+v.peCur.toFixed(0)+'× · '+v.pct.toFixed(0)+'th pctile',Math.max(10,cx-260),cy-16);
    x.fillStyle='#67748C';
    x.fillText('60 monthly points · seeded twin — band edges are the truth being illustrated',10,H-10);
  });
}
function RSCH_drawRoll(sym){
  POSTRENDER.push(()=>{
    const cv=document.getElementById('rsch-cv-roll');if(!cv)return;
    const W=cv.width=cv.clientWidth*2,H=cv.height=190*2,x=cv.getContext('2d');
    x.fillStyle='#070B12';x.fillRect(0,0,W,H);
    const m=RSCH_metrics(sym);
    const rc=RSCH_rollcorr(m.rr,m.bb,RSCH_FSTATE.win);
    const py=v=>H*0.5-v*(H*0.42);
    x.strokeStyle='rgba(151,166,192,.07)';x.lineWidth=1;x.font='15px monospace';x.fillStyle='#67748C';
    [-1,-0.5,0,0.5,1].forEach(g=>{
      const y=py(g);
      x.beginPath();x.moveTo(0,y);x.lineTo(W-70,y);x.stroke();
      x.fillText(g.toFixed(1),W-58,y+5);
    });
    x.strokeStyle='rgba(231,182,83,.4)';x.setLineDash([6,5]);
    x.beginPath();x.moveTo(0,py(0.7));x.lineTo(W-70,py(0.7));x.stroke();x.setLineDash([]);
    x.fillStyle='rgba(231,182,83,.7)';
    x.fillText('0.70 — above this, S33 counts the names as ONE cluster bet',10,py(0.7)-8);
    if(rc.length>1){
      x.strokeStyle='#5AA7FF';x.lineWidth=2.5;x.beginPath();
      rc.forEach((v,i)=>{const X=i/(rc.length-1)*(W-90),Y=py(v);i?x.lineTo(X,Y):x.moveTo(X,Y)});
      x.stroke();
      const last=rc[rc.length-1];
      x.fillStyle='#5AA7FF';x.beginPath();x.arc(W-90,py(last),7,0,7);x.fill();
      x.fillText('now '+last.toFixed(2),W-260,py(last)-12);
    }
    x.fillStyle='#67748C';
    x.fillText(RSCH_FSTATE.win+'-bar rolling corr · '+sym+' vs '+m.bench+' · computed from candles('+sym+',360)',10,H-10);
  });
}
function RSCH_drawLoad(sym){
  POSTRENDER.push(()=>{
    const cv=document.getElementById('rsch-cv-load');if(!cv)return;
    const W=cv.width=cv.clientWidth*2,H=cv.height=190*2,x=cv.getContext('2d');
    x.fillStyle='#070B12';x.fillRect(0,0,W,H);
    const ld=RSCH_loadings(sym);
    const maxA=Math.max(...ld.map(l=>Math.abs(l.v)),1)*1.3;
    const zero=H*0.48,bw=W/ld.length;
    x.strokeStyle='rgba(151,166,192,.07)';x.font='15px monospace';
    for(let g=-2;g<=2;g++){const y=zero-g*(H*0.36)/2;x.beginPath();x.moveTo(0,y);x.lineTo(W,y);x.stroke()}
    x.strokeStyle='rgba(151,166,192,.3)';x.beginPath();x.moveTo(0,zero);x.lineTo(W,zero);x.stroke();
    ld.forEach((l,i)=>{
      const h2=(l.v/maxA)*(H*0.36),X=i*bw;
      x.fillStyle=l.v>=0?'rgba(47,214,160,.75)':'rgba(242,99,124,.75)';
      x.fillRect(X+bw*0.18,Math.min(zero,zero-h2),bw*0.64,Math.abs(h2));
      x.fillStyle='#9FABBF';
      x.fillText((l.v>=0?'+':'')+l.v.toFixed(2),X+bw*0.18,zero-h2+(l.v>=0?-8:24));
      x.fillStyle='#67748C';
      x.fillText(l.k,X+bw*0.18,H-32);
      x.fillStyle=l.src==='C'?'rgba(47,214,160,.7)':'rgba(151,166,192,.55)';
      x.fillText(l.src==='C'?'COMPUTED':'demo twin',X+bw*0.18,H-12);
    });
  });
}
function RSCH_drawPair(){
  POSTRENDER.push(()=>{
    const cv=document.getElementById('rsch-cv-pair');if(!cv)return;
    const W=cv.width=cv.clientWidth*2,H=cv.height=200*2,x=cv.getContext('2d');
    x.fillStyle='#070B12';x.fillRect(0,0,W,H);
    const pz=RSCH_pairz(RSCH_FSTATE.pair);
    const maxZ=Math.max(2.6,...pz.zs.map(Math.abs))*1.1;
    const py=v=>H*0.5-v/maxZ*(H*0.44);
    x.font='15px monospace';
    x.fillStyle='rgba(242,99,124,.08)';
    x.fillRect(0,py(maxZ),W-70,py(2)-py(maxZ));
    x.fillRect(0,py(-2),W-70,py(-maxZ)-py(-2));
    x.strokeStyle='rgba(151,166,192,.07)';
    [-2,-1,0,1,2].forEach(g=>{const y=py(g);x.beginPath();x.moveTo(0,y);x.lineTo(W-70,y);x.stroke();x.fillStyle='#67748C';x.fillText((g>0?'+':'')+g+'σ',W-58,y+5)});
    x.strokeStyle='rgba(242,99,124,.5)';x.setLineDash([7,5]);
    [2,-2].forEach(g=>{const y=py(g);x.beginPath();x.moveTo(0,y);x.lineTo(W-70,y);x.stroke()});
    x.setLineDash([]);
    x.strokeStyle='#5AA7FF';x.lineWidth=2.2;x.beginPath();
    pz.zs.forEach((v,i)=>{const X=i/(pz.zs.length-1)*(W-90),Y=py(v);i?x.lineTo(X,Y):x.moveTo(X,Y)});
    x.stroke();
    x.fillStyle=Math.abs(pz.z)>=2?'#F2637C':'#E7B653';
    x.beginPath();x.arc(W-90,py(pz.z),8,0,7);x.fill();
    x.fillText('z '+(pz.z>=0?'+':'')+pz.z.toFixed(2),W-250,py(pz.z)-12);
    x.fillStyle='#67748C';
    x.fillText(pz.p.lbl+' · log-ratio μ '+pz.mean.toFixed(4)+' · σ '+pz.sd.toFixed(4)+' · n '+pz.n+' — computed from both candle series',10,H-10);
  });
}

/* ═══════════ VIEW · research.fundamentals — FUNDAMENTAL DOSSIER ═══════════ */
VIEWS['research.fundamentals']=function(){
  const s=RSCH_sym();
  const d=RSCH_dossier(s.sym);
  const pk=RSCH_pkt(s.sym);
  let h=RSCH_head('fundamental dossier',
    'What the tape does not show: the earnings pattern, the forward vol setup, the valuation context, who owns it, and what would break the story · <span class="demo-wm">demo twin</span>');
  h+='<div class="row" style="margin:-4px 0 12px">'+
    CMD.btn('funda.compare',null,'sm pri','⇄ Compare vs sector peers')+
    CMD.btn('funda.export',null,'sm','⤓ Export dossier JSON')+
    '<span class="pill">owner seats: S17 intel · S19 earnings · S20 forensic</span>'+
    '</div>';

  /* strip */
  h+='<div class="grid g4">'+
    stat('Next report',d.etf?'constituent season':U.esc(d.fwd.when),d.etf?'no issuer print — season map below':('blackout arms T-'+U.fmt(ck('risk.event_window_hrs')/24,0)+'d '+prov('LAW-017')+' '+prov('risk.event_window_hrs')))+
    stat('Fwd P/E',U.fmt(d.val.peCur,0)+'×',U.fmt(d.val.pct,0)+'th pctile of own 5y band — context gate, never timing')+
    stat(d.etf?'5d fund flows':'Short interest',
      d.etf?((d.etfx.flow5d>=0?'+$':'−$')+U.fmt(Math.abs(d.etfx.flow5d),1)+'B'):(U.fmt(d.own.shortF,1)+'% float'),
      d.etf?('AUM '+d.etfx.aum+' — flows are positioning, not conviction'):(U.fmt(d.own.dtc,1)+'d to cover — squeeze-fuel check'))+
    stat('Fundamental context',chip(d.verdict.v,d.verdict.cls,d.verdict.ico),'score '+U.sign(d.verdict.score,0)+' — full reasoning in §f below')+
    '</div>';

  if(d.etf){
    h+='<div class="banner info" style="margin-top:12px"><span class="bico">i</span><div>'+
      '<b>'+U.esc(s.sym)+' is an index ETF — issuer fundamentals do not exist.</b> '+
      'Below is the constituent-weighted demo twin: top-10 weights, weighted multiples, and the season map. '+
      'The context verdict still computes — the committee consumes index-level fundamentals as regime context (S08 lane), not as a stock thesis.'+
      '</div></div>';
  }

  /* ── §a earnings scorecard ── */
  if(!d.etf){
    h+=panel('§a · EARNINGS SCORECARD — last 8 quarters','the reaction, not the print, is the information · click a row for the anatomy · <span class="demo-wm">demo twin</span>',
      tbl(['Qtr','>EPS est','>EPS act','>Surp','>Rev est ($B)','>Rev act ($B)','>Rev Δ','>Next-day','Guidance'],
        d.qtrs.map((q,i)=>'<tr class="click" data-cmd="funda.qtr" data-arg="'+i+'">'+
          '<td class="mono">'+q.lbl+'</td>'+
          '<td class="r num">'+U.fmt(q.epsE,2)+'</td>'+
          '<td class="r num"><b>'+U.fmt(q.epsA,2)+'</b></td>'+
          '<td class="r num '+(q.surp>=0?'up':'dn')+'">'+U.pct(q.surp,1)+'</td>'+
          '<td class="r num">'+U.fmt(q.revE,1)+'</td>'+
          '<td class="r num">'+U.fmt(q.revA,1)+'</td>'+
          '<td class="r num '+(q.rsurp>=0?'up':'dn')+'">'+U.pct(q.rsurp,1)+'</td>'+
          '<td class="r num '+(q.react>=0?'up':'dn')+'"><b>'+U.pct(q.react,1)+'</b></td>'+
          '<td>'+chip(q.guide,q.guide==='RAISED'?'ch-ok':q.guide==='CUT'?'ch-warn':'ch-mut',q.guide==='RAISED'?'▲':q.guide==='CUT'?'▼':'·')+'</td>'+
          '</tr>').join(''))+
      '<div class="banner '+(d.pat.verdict==='BEAT-AND-RUN'?'ok':d.pat.verdict==='BEAT-AND-FADE'?'warn':'info')+'" style="margin:10px 12px">'+
      '<span class="bico">'+(d.pat.verdict==='BEAT-AND-RUN'?'✓':'!')+'</span><div>'+
      '<b>PATTERN VERDICT: '+d.pat.verdict+'</b> — '+U.esc(d.pat.math)+
      '<div class="i1" style="font-size:11px;margin-top:3px">'+U.esc(d.pat.read)+'</div>'+
      '</div></div>',{flush:true});
    h+=panel('NEXT-DAY REACTION TAPE — 8 quarters','the bars ARE the realized-move history the implied move gets judged against',
      '<canvas id="rsch-cv-react" class="cv" style="height:180px"></canvas>');
    RSCH_drawReact(d);

    /* est-vs-actual canvas — the beat pattern as geometry */
    h+=panel('EPS: ESTIMATE vs DELIVERED — 8 quarters','grey is the promise, colored is the delivery — the gap between them is the pattern',
      '<canvas id="rsch-cv-eps" class="cv" style="height:170px"></canvas>');
    POSTRENDER.push(()=>{
      const cv=document.getElementById('rsch-cv-eps');if(!cv)return;
      const W=cv.width=cv.clientWidth*2,H=cv.height=170*2,x=cv.getContext('2d');
      x.fillStyle='#070B12';x.fillRect(0,0,W,H);
      const qs=d.qtrs.slice().reverse();
      const maxE=Math.max(...qs.map(q=>Math.max(q.epsE,q.epsA)))*1.22;
      const bw2=W/qs.length;
      x.strokeStyle='rgba(151,166,192,.07)';x.font='15px monospace';
      for(let g=1;g<=4;g++){const y=H*0.86-g*(H*0.68)/4;x.beginPath();x.moveTo(0,y);x.lineTo(W,y);x.stroke()}
      qs.forEach((q,i)=>{
        const X=i*bw2;
        const hE=q.epsE/maxE*(H*0.68),hA=q.epsA/maxE*(H*0.68);
        x.fillStyle='rgba(151,166,192,.35)';
        x.fillRect(X+bw2*0.16,H*0.86-hE,bw2*0.28,hE);
        x.fillStyle=q.surp>=0?'rgba(47,214,160,.8)':'rgba(242,99,124,.8)';
        x.fillRect(X+bw2*0.5,H*0.86-hA,bw2*0.28,hA);
        x.fillStyle='#9FABBF';
        x.fillText(q.epsA.toFixed(2),X+bw2*0.5,H*0.86-hA-8);
        x.fillStyle='#67748C';
        x.fillText(q.lbl.replace(' FY','·'),X+bw2*0.16,H-10);
      });
      x.fillStyle='rgba(151,166,192,.6)';x.fillText('■ estimate',10,22);
      x.fillStyle='rgba(47,214,160,.8)';x.fillText('■ delivered (green beat / red miss)',130,22);
    });

    /* guidance timeline — the streak arithmetic, oldest → newest */
    const gSeq=d.qtrs.slice().reverse();
    let gStreak=0;
    for(let gi=gSeq.length-1;gi>=0;gi--){if(gSeq[gi].guide!=='CUT')gStreak++;else break}
    const gCuts=gSeq.filter(q=>q.guide==='CUT').length;
    const gRaises=gSeq.filter(q=>q.guide==='RAISED').length;
    h+=panel('GUIDANCE TIMELINE — 8 quarters of forward promises','guidance is the only forward-looking sentence in the filing — its streak is the management credibility ledger',
      '<div class="row" style="gap:4px;flex-wrap:wrap">'+
      gSeq.map((q,gi)=>chip(q.lbl.replace(' FY','·')+' '+q.guide,q.guide==='RAISED'?'ch-ok':q.guide==='CUT'?'ch-warn':'ch-mut',q.guide==='RAISED'?'▲':q.guide==='CUT'?'▼':'·')+(gi<gSeq.length-1?'<span class="i2" style="font-size:9px">→</span>':'')).join('')+
      '</div>'+
      '<div class="grid g3" style="margin-top:10px">'+
      stat('Current streak',gStreak+' qtrs','without a cut — resets to zero the day it breaks, and so does the multiple’s patience')+
      stat('Raises / cuts',gRaises+' / '+gCuts,'across the 8-quarter window')+
      stat('Credibility read',gCuts===0?'<span class="up">INTACT</span>':gCuts>=3?'<span class="dn">IMPAIRED</span>':'TESTED',gCuts===0?'promises kept — guidance moves price here':gCuts>=3?'serial cutter — the market pre-discounts every forecast':'one wobble — watched, not condemned')+
      '</div>');
  }else{
    h+=panel('§a · CONSTITUENT SEASON MAP — top-10 weights','the earnings tape underneath the index · <span class="demo-wm">demo twin</span>',
      tbl(['Constituent','>Weight','Next report','>Implied ±','Weight × move'],
        d.etfx.topw.map(r=>'<tr>'+
          '<td class="mono"><b>'+U.esc(r[0])+'</b></td>'+
          '<td class="r num">'+U.fmt(r[1],1)+'%</td>'+
          '<td class="mono" style="font-size:10.5px">T+'+r[2]+'d</td>'+
          '<td class="r num">±'+U.fmt(r[3],1)+'%</td>'+
          '<td class="r num i2">±'+U.fmt(r[1]*r[3]/100,2)+'% index pts</td>'+
          '</tr>').join(''))+
      '<div class="i2" style="font-size:10.5px;padding:8px 12px">Weighted beat rate this season: <b>'+d.etfx.beatRate+'%</b> · top-10 = '+U.fmt(d.etfx.top10w,1)+'% of the fund. '+
      'Single-name blackouts do not gate index entries, but a top-weight print inside '+ck('risk.event_window_hrs')+'h is an index event in costume '+prov('LAW-017')+'.</div>',{flush:true});
  }

  /* ── §b forward setup + §c valuation band ── */
  h+='<div class="grid g2">';
  if(!d.etf){
    h+=panel('§b · FORWARD SETUP — the next print','implied vs realized is the only comparison that matters · <span class="demo-wm">demo twin</span>',
      kv('NEXT EARNINGS','<b class="mono">'+U.esc(d.fwd.when)+'</b> · '+U.esc(d.fwd.blackout)+' '+prov('LAW-017')+' '+prov('risk.event_window_hrs'))+
      kv('CONSENSUS EPS','<span class="mono">'+U.fmt(d.fwd.consensus,2)+'</span> — sell-side mean, demo twin')+
      kv('WHISPER','<span class="mono">'+U.fmt(d.fwd.whisper,2)+'</span> · divergence <span class="'+(d.fwd.whisperPct>=0?'up':'dn')+'">'+U.pct(d.fwd.whisperPct,1)+'</span> vs consensus — buy-side positioning tell, tertiary weight')+
      kv('IMPLIED MOVE','<b class="mono">±'+U.fmt(d.fwd.implied,1)+'%</b> from the front-month straddle (IVR '+s.ivr+' '+prov('options.iv_rank_debit_max')+')')+
      kv('8Q REALIZED AVG','<b class="mono">±'+U.fmt(d.fwd.realized,1)+'%</b> — computed from the scorecard rows above: mean |next-day move|')+
      kv('GAP','implied − realized = <b class="'+(d.fwd.implied>d.fwd.realized?'dn':'up')+'">'+U.sign(d.fwd.implied-d.fwd.realized,1)+'pts</b> ('+U.sign((d.fwd.implied/d.fwd.realized-1)*100,0)+'%)')+
      '<div class="banner '+(d.fwd.implied>d.fwd.realized*1.15?'warn':'info')+'" style="margin-top:8px"><span class="bico">◆</span><div><b>S19 read:</b> '+U.esc(d.fwd.verdict)+'</div></div>');
  }else{
    h+=panel('§b · SEASON RISK GEOMETRY','when the index has a hidden binary · <span class="demo-wm">demo twin</span>',
      kv('NEAREST TOP-WEIGHT PRINT','T+'+Math.min(...d.etfx.topw.map(r=>r[2]))+'d — the closest thing an ETF has to an earnings date')+
      kv('STACKED WEEKS','when 3+ top-10 names report within 5 sessions, index implied vol is a sum of costumes — treat the cluster as one macro event')+
      kv('BLACKOUT LOGIC','single-name windows do not gate '+U.esc(s.sym)+' entries; a top-weight print inside '+ck('risk.event_window_hrs')+'h caps index size to reduced tier '+prov('risk.event_window_hrs'))+
      kv('FLOW READ','5d '+(d.etfx.flow5d>=0?'creations +$':'redemptions −$')+U.fmt(Math.abs(d.etfx.flow5d),1)+'B — passive flow is a slow tide, never a trigger'));
  }
  h+=panel('§c · VALUATION BAND — 5y P/E','valuation is a context gate, NOT a timing tool — expensive can double, cheap can halve · <span class="demo-wm">demo twin</span>',
    '<canvas id="rsch-cv-band" class="cv" style="height:210px"></canvas>'+
    '<div class="grid g3" style="margin-top:8px">'+
    stat('Band','<span class="mono" style="font-size:12px">'+U.fmt(d.val.peMin,0)+' / '+U.fmt(d.val.peMed,0)+' / '+U.fmt(d.val.peMax,0)+'×</span>','min / median / max, 5y')+
    stat('Current',U.fmt(d.val.peCur,0)+'×',U.fmt(d.val.pct,0)+'th pctile of own history')+
    (d.val.evs?stat('EV/S',U.fmt(d.val.evs.cur,1)+'×','vs 5y median '+U.fmt(d.val.evs.med,1)+'× — the growth-name lens'):stat('EV/S','—','not a growth-name — P/E band is the lens'))+
    '</div>'+
    '<div class="i2" style="font-size:10.5px;margin-top:6px">Doctrine: the band never triggers an entry and never blocks one alone. '+
    'Top-decile-of-own-band names lose the benefit of the doubt at size — a WATCH flag on the packet, nothing more. '+
    'What the band is FOR: when structure and valuation agree, size normally; when they disagree, the tier drops.</div>');
  h+='</div>';
  RSCH_drawBand(d,s.sym);

  /* ── §d ownership & positioning ── */
  h+='<div class="grid g2">';
  if(!d.etf){
    h+=panel('§d · OWNERSHIP & POSITIONING','who holds it, who is selling it, who is short it · <span class="demo-wm">demo twin</span>',
      '<div class="grid g4">'+
      stat('Institutional',U.fmt(d.own.inst,0)+'%','of float — the slow money base')+
      stat('Top-10 holders',U.fmt(d.own.top10,0)+'%','concentration — exit doors narrow above ~40%')+
      stat('Short % float',U.fmt(d.own.shortF,1)+'%',U.fmt(d.own.dtc,1)+' days to cover at avg volume')+
      stat('Insider 6m',(d.own.net>=0?'+$':'−$')+U.fmt(Math.abs(d.own.net),1)+'M',d.own.cluster?'<span class="up">buy cluster — rare, weighted</span>':'programmatic cadence')+
      '</div>'+
      '<div class="banner '+(d.own.shortF>=6?'warn':'info')+'" style="margin-top:8px"><span class="bico">◆</span><div>'+
      '<b>Squeeze-fuel doctrine:</b> short interest is fuel; liquidity pools are the match. '+
      (d.own.shortF>=6
        ?U.fmt(d.own.shortF,1)+'% float short + an untaken pool above ('+U.esc(s.levels.poolAbove||'see liquidity map')+') = forced-buyer potential — but a squeeze thesis still needs structure, sweep, and displacement like any other long (LAW-010).'
        :U.fmt(d.own.shortF,1)+'% float short is not squeeze fuel. Any “short squeeze” narrative on this name is a story, not a mechanism — there is no trapped crowd to force '+prov('LAW-003')+'.')+
      ' Cross-check the pool map in Structure & Liquidity.</div></div>');
    h+=panel('INSIDER LEDGER — last 6 transactions','10b5-1 is a schedule; discretionary is a decision; a buy cluster is a signal (S17) · <span class="demo-wm">demo twin</span>',
      tbl(['When','Who','Type','>Shares','>Px','>Value'],
        d.own.insiders.map(t=>'<tr'+(t.kind.startsWith('BUY')?' style="background:var(--live-bg)"':'')+'>'+
          '<td class="mono">'+t.d+'</td>'+
          '<td class="i1" style="font-size:11px">'+U.esc(t.who)+'</td>'+
          '<td>'+chip(t.kind,t.kind.startsWith('BUY')?'ch-ok':t.kind.startsWith('EXER')?'ch-mut':'ch-info',t.kind.startsWith('BUY')?'▲':'·')+'</td>'+
          '<td class="r num">'+U.int(t.sh)+'</td>'+
          '<td class="r num">'+U.fmt(t.px,2)+'</td>'+
          '<td class="r num">$'+U.fmt(t.val,1)+'M</td>'+
          '</tr>').join(''))+
      '<div class="i2" style="font-size:10.5px;padding:8px 12px">NET 6M: <b>'+U.esc(d.own.netTxt)+'</b>. '+
      'The desk reads roles, not names: CFO discretionary sells outrank Director scheduled sells; open-market buys by operators outrank everything.</div>',{flush:true});
  }else{
    h+=panel('§d · FLOWS & POSITIONING — fund level','ETF ownership is plumbing; flows are the positioning signal · <span class="demo-wm">demo twin</span>',
      kv('AUM',d.etfx.aum+' — creations/redemptions arbitraged intraday by APs')+
      kv('5D NET FLOW',(d.etfx.flow5d>=0?'+$':'−$')+U.fmt(Math.abs(d.etfx.flow5d),1)+'B — '+(d.etfx.flow5d>=0?'passive bid under the tape':'passive supply over the tape')+'; a tide, never a trigger')+
      kv('SHORT INTEREST','ETF shorting is overwhelmingly hedging inventory, not directional conviction — the desk does not read it as a crowd')+
      kv('DOCTRINE','fund flows lag price and confirm regime; they never originate an entry (S08 lane)'));
    h+=panel('CONCENTRATION LEDGER','ten stocks wearing an index costume — the real diversification math',
      kv('TOP-10 WEIGHT','<b class="mono">'+U.fmt(d.etfx.top10w,1)+'%</b> of the fund')+
      kv('EFFECTIVE BETS','with top-10 pairwise corr ~0.6+, the fund behaves like ~'+(d.etfx.top10w>45?'6–8':'12–15')+' independent bets, not 100/500')+
      kv('CONSEQUENCE','an “index hedge” against a megacap long hedges less than its notional suggests — S33 sizes the residual, not the label '+prov('RISK-031','risk.max_sector_exposure = '+ck('risk.max_sector_exposure')+' %equity — correlated cluster cap; correlated names count as one bet'))+
      kv('WHERE THIS BITES','see Factors & Pairs → QQQ/SPY pair — the basis IS the concentration trade'));
  }
  h+='</div>';

  if(d.etf){
    const sw=RSCH_SECTW[s.sym]||RSCH_SECTW.QQQ;
    h+=panel('SECTOR WEIGHTS — what you actually own','the fund’s factor identity in one table · <span class="demo-wm">demo twin</span>',
      tbl(['Sector','>Weight','Read'],
        sw.map(([nm,wt])=>'<tr'+(wt>=30?' style="background:var(--warn-bg)"':'')+'>'+
          '<td><b style="font-size:11px">'+U.esc(nm)+'</b></td>'+
          '<td class="r num">'+U.fmt(wt,1)+'%</td>'+
          '<td class="i2" style="font-size:10.5px">'+(wt>=30?'dominant — this sector’s factor IS the fund’s factor':wt>=10?'meaningful contributor':'residual weight')+'</td>'+
          '</tr>').join(''))+
      '<div class="i2" style="font-size:10.5px;padding:8px 12px">Cross-reference Factors & Pairs → variance decomposition: an “index position” with '+U.fmt(sw[0][1],0)+'% in one sector is a sector bet with index marketing. S33 clusters accordingly.</div>',{flush:true});
    h+=panel('INDEX MECHANICS — the flows that have no opinion','rebalances and reconstitutions move billions on a calendar, not a thesis · <span class="demo-wm">demo twin</span>',
      kv('QUARTERLY REBALANCE','third Friday of Mar/Jun/Sep/Dec — closing auctions carry mechanical size; spreads widen into the print, normalize after')+
      kv('RECONSTITUTION','annual add/delete review — inclusion candidates rally on anticipation and fade on the event: the flow is pre-traded by arbs, twice')+
      kv('OPEX OVERLAP','rebalance Fridays are also OPEX — pin risk and rebalance flow stack on the same close (the Markets → Calendar “pin risk rises into Friday close” note is this)')+
      kv('DESK RULE','mechanical-flow days are execution-quality events, not signal events: no fresh entries into the auction window; working orders switch to limits only (S25 policy)'));
  }

  /* ── est-walk + analyst coverage ── */
  if(!d.etf){
    h+='<div class="grid g2">';
    h+=panel('EST-WALK — consensus revision momentum','which direction the bar moved before the print · <span class="demo-wm">demo twin</span>',
      tbl(['When','>Consensus EPS','>vs now'],
        d.est.walk.map(w=>'<tr'+(w.t==='now'?' style="background:var(--live-bg)"':'')+'>'+
          '<td class="mono">'+w.t+'</td>'+
          '<td class="r num">'+U.fmt(w.v,2)+'</td>'+
          '<td class="r num '+(w.v<=d.est.walk[3].v?'up':'dn')+'">'+U.pct((d.est.walk[3].v/w.v-1)*100,1)+'</td>'+
          '</tr>').join(''))+
      '<div style="padding:8px 12px">'+
      kv('90-DAY DRIFT','<span class="'+(d.est.drift>=0?'up':'dn')+'">'+U.pct(d.est.drift,1)+'</span> — the bar '+(d.est.drift>=0?'rose':'fell')+' into the print')+
      kv('REVISIONS',''+d.est.nUp+' up · '+d.est.nDn+' down across the covering desks, 90d')+
      kv('READ','<span style="font-size:11px">'+U.esc(d.est.read)+'</span>')+
      '</div>',{flush:true});
    h+=panel('ANALYST COVERAGE — the consensus as positioning','ratings are inventory, not information — the marginal CHANGE is the datum · <span class="demo-wm">demo twin</span>',
      '<div class="grid g3">'+
      stat('Ratings',d.anl.b+' / '+d.anl.h+' / '+d.anl.s2,'buy / hold / sell — '+Math.round(d.anl.crowd*100)+'% bulls')+
      stat('Median PT',U.fmt(d.anl.ptMed,0),U.sign(d.anl.ptUp,0)+'% vs last — the street’s center of gravity')+
      stat('PT dispersion',U.fmt(d.anl.ptLow,0)+'–'+U.fmt(d.anl.ptHigh,0),'the disagreement meter — wide = thesis unresolved')+
      '</div>'+
      '<div class="banner '+(d.anl.crowd>0.75?'warn':'info')+'" style="margin-top:8px"><span class="bico">'+(d.anl.crowd>0.75?'!':'i')+'</span><div>'+U.esc(d.anl.read)+
      ' Cross-reference S21 crowding in Factors & Pairs — sell-side consensus and positioning crowding usually peak together.</div></div>');
    h+='</div>';

    /* ── quality ladder + balance sheet ── */
    h+='<div class="grid g2">';
    h+=panel('QUALITY LADDER — margins, 4 quarters','the P&L’s slope outranks its level · <span class="demo-wm">demo twin</span>',
      tbl(['Qtr','>Gross %','>Operating %','>FCF %'],
        d.qual.rows.map(r=>'<tr>'+
          '<td class="mono">'+r.lbl+'</td>'+
          '<td class="r num">'+U.fmt(r.gm,1)+'</td>'+
          '<td class="r num">'+U.fmt(r.om,1)+'</td>'+
          '<td class="r num">'+U.fmt(r.fcf,1)+'</td>'+
          '</tr>').join(''))+
      '<div style="padding:8px 12px">'+
      kv('SLOPE','<span class="'+(d.qual.slope>=0?'up':'dn')+'">'+U.sign(d.qual.slope,1)+'pts/qtr</span> gross-margin trend')+
      kv('READ','<span style="font-size:11px">'+U.esc(d.qual.read)+'</span>')+
      '</div>',{flush:true});
    h+=panel('BALANCE SHEET SNAPSHOT','the survivability facts — boring until they are everything · <span class="demo-wm">demo twin</span>',
      kv('NET CASH / (DEBT)','<b class="mono '+(d.bs.netCash>=0?'up':'dn')+'">'+(d.bs.netCash>=0?'+$':'−$')+U.fmt(Math.abs(d.bs.netCash),1)+'B</b> — '+(d.bs.netCash>=0?'fortress: drawdowns are survivable by construction':'levered: the equity is an option on refinancing terms'))+
      kv('FCF (TTM)','<span class="mono">$'+U.fmt(d.bs.fcf,1)+'B</span> — cash the business throws off after keeping itself alive')+
      kv('SBC','<span class="mono">'+U.fmt(d.bs.sbc,1)+'% of revenue</span> — the quiet dilution engine; reconciles with flag §e·DIL')+
      kv('BUYBACK AUTH','<span class="mono">$'+U.fmt(d.bs.buyback,1)+'B</span> outstanding — a standing bid, not a promise')+
      kv('INTEREST COVER',U.esc(d.bs.cover))+
      '<div class="hr"></div>'+
      kv('DOCTRINE','balance-sheet strength buys TIME for a thesis — it never substitutes for one. A fortress with no setup is still NO_TRADE.'));
    h+='</div>';

    /* ── segment mix + transcript signals ── */
    h+='<div class="grid g2">';
    h+=panel('SEGMENT MIX — where the revenue actually lives','the income statement’s center of gravity, and where it is drifting · <span class="demo-wm">demo twin</span>',
      '<canvas id="rsch-cv-mix" class="cv" style="height:150px"></canvas>'+
      tbl(['Segment','>Share','>Growth y/y'],
        d.seg.map(g2=>'<tr>'+
          '<td class="i1" style="font-size:11px"><b>'+U.esc(g2.nm)+'</b></td>'+
          '<td class="r num">'+U.fmt(g2.share,1)+'%</td>'+
          '<td class="r num '+(g2.g>=0?'up':'dn')+'">'+U.pct(g2.g,1)+'</td>'+
          '</tr>').join(''))+
      '<div class="i2" style="font-size:10.5px;padding:8px 12px">'+U.esc(d.segRead)+'</div>',{flush:true});
    h+=panel('TRANSCRIPT SIGNALS — the last call, read forensically','management language is a leading indicator of guidance language · <span class="demo-wm">demo twin</span>',
      '<div class="grid g2" style="margin-bottom:6px">'+
      stat('Tone score',d.call.tone+' / 100',(d.call.tone>=60?'confident register':d.call.tone<45?'defensive register':'neutral register')+' vs own 8-call baseline')+
      stat('Hedging words',U.esc(d.call.hedge),'“approximately / cautious / prudent / monitor” frequency, q/q')+
      '</div>'+
      d.call.phrases.map(p2=>kv('“…”','<b style="font-size:11px">'+U.esc(p2[0])+'</b><div class="i2" style="font-size:10.5px;margin-top:2px">'+U.esc(p2[1])+'</div>')).join('')+
      '<div class="hr"></div>'+
      kv('DOCTRINE','language walks down before numbers do. The GWD flag (§e) listens to this panel one quarter before it listens to the guidance table.'));
    h+='</div>';
    POSTRENDER.push(()=>{
      const cv=document.getElementById('rsch-cv-mix');if(!cv)return;
      const W=cv.width=cv.clientWidth*2,H=cv.height=150*2,x=cv.getContext('2d');
      x.fillStyle='#070B12';x.fillRect(0,0,W,H);
      const cols=['rgba(90,167,255,.75)','rgba(47,214,160,.65)','rgba(231,182,83,.6)','rgba(151,166,192,.5)','rgba(242,99,124,.5)'];
      x.font='15px monospace';
      /* 4 quarters of mix, top segment share drifting by segDrift/qtr */
      for(let q2=0;q2<4;q2++){
        const X0=30+q2*((W-60)/4),bw2=(W-60)/4*0.62;
        let y=H*0.12;
        d.seg.forEach((g2,gi)=>{
          const share=U.clamp(g2.share+(gi===0?d.segDrift*(q2-3):-d.segDrift*(q2-3)/Math.max(1,d.seg.length-1)),2,96);
          const hh=share/100*(H*0.66);
          x.fillStyle=cols[gi%cols.length];
          x.fillRect(X0,y,bw2,hh-3);
          if(q2===3&&hh>26){x.fillStyle='#0A0F18';x.fillText(g2.nm.slice(0,12),X0+6,y+hh/2+4)}
          y+=hh;
        });
        x.fillStyle='#67748C';
        x.fillText(RSCH_QLBL[3-q2],X0,H-8);
      }
    });

    /* ── publication-lag ledger — fundamental data is stale BY NATURE ── */
    h+=panel('PUBLICATION-LAG LEDGER — how old this dossier really is','price is milliseconds old; fundamentals are weeks old. The lag is a property, not a defect — but it must be NAMED',
      tbl(['Source','As-of','Lag','Consequence'],
        [['10-Q / income statement','last quarter end','up to ~13 weeks','margins & accruals describe a company that existed a quarter ago'],
         ['13F institutional holdings','quarter end + 45d filing window','45–135 days','the “ownership” panel is a photograph of last season’s positioning'],
         ['Short interest','exchange bi-monthly settlement','~9 days','squeeze-fuel math runs on a stale tank reading — flow (Research → Flow) is the fresher proxy'],
         ['Insider transactions','Form 4, 2 business days','~2 days','the freshest fundamental datum on this page — weighted accordingly (S17)'],
         ['Sell-side estimates','continuous','hours–days','fresh but reflexive: revisions follow price as often as they lead it'],
        ].map(r=>'<tr>'+
          '<td><b style="font-size:11px">'+r[0]+'</b></td>'+
          '<td class="i2" style="font-size:10.5px">'+r[1]+'</td>'+
          '<td class="mono" style="font-size:10.5px">'+r[2]+'</td>'+
          '<td class="i1" style="font-size:10.5px">'+r[3]+'</td>'+
          '</tr>').join(''))+
      '<div class="i2" style="font-size:10.5px;padding:8px 12px">This is why fundamentals GATE and never TRIGGER here: a signal that is 45 days old cannot time an entry that is 45 seconds wide. '+
      'Structure triggers; this dossier decides how much benefit of the doubt the trigger receives. '+prov('LAW-006')+' applies to these feeds too — a dossier past its own lag budget blocks the §f attach, not the trade.</div>',{flush:true});

    /* ── earnings quality bridge — GAAP → adjusted → cash ── */
    const br=localRng('rsch-bridge-'+s.sym);
    const gaapNI=d.bs.fcf*(0.85+br()*0.5);
    const sbcAdd=gaapNI*(d.bs.sbc/100)*(1.6+br()*1.2);
    const oneTime=gaapNI*(0.03+br()*0.14);
    const adjNI=gaapNI+sbcAdd+oneTime;
    const adjRatio=adjNI/(gaapNI||1e-9);
    const oneTimeStreak=1+Math.floor(br()*7);
    h+=panel('EARNINGS QUALITY BRIDGE — GAAP → “adjusted” → cash','every addback is a claim that a real cost was not real · <span class="demo-wm">demo twin</span>',
      tbl(['Line','>$B (TTM)','Read'],
        [['GAAP net income',U.fmt(gaapNI,1),'the audited number — the one that survives depositions'],
         ['+ SBC addback',U.fmt(sbcAdd,1),'stock comp is a cost paid in dilution instead of cash — adding it back does not un-pay it (reconciles §BS SBC '+U.fmt(d.bs.sbc,1)+'% of revenue)'],
         ['+ “one-time” items',U.fmt(oneTime,1),oneTimeStreak>=4?oneTimeStreak+' consecutive quarters of one-time charges — at that frequency the word has lost its meaning':'genuinely episodic so far ('+oneTimeStreak+' of last 8 quarters)'],
         ['= Adjusted net income',U.fmt(adjNI,1),'the investor-deck number — '+U.fmt((adjRatio-1)*100,0)+'% above GAAP'],
         ['FCF (cash reality)',U.fmt(d.bs.fcf,1),'what actually landed in the account — the line the ACC flag audits'],
        ].map((r,ri)=>'<tr'+(ri===3?' style="background:var(--live-bg)"':'')+'>'+
          '<td><b style="font-size:11px">'+r[0]+'</b></td>'+
          '<td class="r num">'+r[1]+'</td>'+
          '<td class="i2" style="font-size:10.5px">'+r[2]+'</td>'+
          '</tr>').join(''))+
      '<div class="'+(adjRatio>1.25?'banner warn':'i2')+'" style="'+(adjRatio>1.25?'margin:10px 12px':'font-size:10.5px;padding:8px 12px')+'">'+
      (adjRatio>1.25
        ?'<span class="bico">!</span><div><b>Adjustment inflation:</b> adjusted earnings run '+U.fmt((adjRatio-1)*100,0)+'% above GAAP. The desk prices the GAAP-to-cash lane and lets the sell-side keep the adjusted one.</div>'
        :'Bridge is tight — adjusted and GAAP tell the same story, and FCF corroborates both. This is what a CLEAR accruals flag looks like in numbers.')+
      '</div>',{flush:true});

    /* ── fundamental calendar — the slow clock, on one card ── */
    h+=panel('FUNDAMENTAL CALENDAR — the slow clock','every date that will change a number on this page · <span class="demo-wm">demo twin</span>',
      tbl(['When','Event','What it changes here'],
        [['T+'+d.fwd.days+'d AMC','Earnings print + guidance','§a gains a 9th row · §b resets · GWD flag re-scores · blackout T-'+U.fmt(ck('risk.event_window_hrs')/24,0)+'d '+prov('LAW-017')],
         ['T+'+(d.fwd.days+2)+'d','Buyback window reopens (T+2 post-print)','the standing bid in §BS returns to the tape'],
         ['T+6d','Short-interest settlement publishes','§d squeeze math refreshes — until then it runs on a 9-day-old tank reading'],
         ['T+'+(12+(d.fwd.days%18))+'d','Sector conference (mgmt presenting)','transcript-signals panel gets fresh language between prints'],
         ['T+~33d','13F window closes for the quarter','§d institutional/top-10 refreshes — last season’s photograph develops'],
        ].map(r=>'<tr>'+
          '<td class="mono" style="font-size:10.5px">'+r[0]+'</td>'+
          '<td><b style="font-size:11px">'+r[1]+'</b></td>'+
          '<td class="i2" style="font-size:10.5px">'+r[2]+'</td>'+
          '</tr>').join(''))+
      '<div class="i2" style="font-size:10.5px;padding:8px 12px">The fast clock (Markets → Calendar) owns enforcement; this card owns anticipation — the dossier should never be surprised by its own refresh schedule.</div>',{flush:true});

    /* ── pre-earnings checklist ── */
    h+=panel('PRE-EARNINGS CHECKLIST — computed from this dossier','eight gates, each citing its number — run it before every print you hold through… which is to say, run it and then don’t hold through '+prov('LAW-017'),
      '<div class="btnrow">'+CMD.btn('funda.checklist',null,'pri','☑ Run the checklist')+
      '<span class="pill">'+U.esc(d.fwd.when)+' · blackout T-'+U.fmt(ck('risk.event_window_hrs')/24,0)+'d</span></div>');

    /* ── scenario lab ── */
    h+=panel('SCENARIO LAB — the next print, played four ways','historical analogs from the 8-quarter tape above; frequencies are computed from §a',
      '<div class="i1" style="font-size:11.5px;line-height:1.6;margin-bottom:8px">Every print resolves into one of the four S19 archetypes. The lab counts how often THIS name produced each, what the tape paid, and what the desk does about it — before the event, when it is still cheap to think.</div>'+
      '<div class="btnrow">'+CMD.btn('funda.scenario',null,'pri','▦ Run the four scenarios')+
      '<span class="pill">no position through the print '+prov('LAW-017')+' — the lab plans the AFTER</span></div>');
  }

  /* ── §e red flags registry ── */
  h+=panel('§e · RED FLAGS REGISTRY','each flag names its state AND the evidence that would change it — a flag without a falsifier is a mood · click a row for the evidence ladder',
    tbl(['Flag','Owner','State','Current reading','What changes it'],
      d.flags.map(f=>'<tr class="click" data-cmd="funda.flag" data-arg="'+f.id+'">'+
        '<td><b style="font-size:11px">'+U.esc(f.nm)+'</b></td>'+
        '<td class="mono" style="font-size:10.5px">'+U.esc(f.owner)+'</td>'+
        '<td>'+chip(f.st,f.st==='CLEAR'?'ch-ok':f.st==='WATCH'?'ch-warn':'ch-blk',f.st==='CLEAR'?'✓':f.st==='WATCH'?'!':'⛔')+'</td>'+
        '<td class="i1" style="font-size:10.5px">'+U.esc(f.read)+'</td>'+
        '<td class="i2" style="font-size:10.5px">RAISE: '+U.esc(f.raise)+(f.clear!=='—'?' · CLEAR: '+U.esc(f.clear):'')+'</td>'+
        '</tr>').join(''))+
    '<div class="i2" style="font-size:10.5px;padding:8px 12px">State machine: CLEAR → WATCH (context note on every packet) → RAISED (fundamental verdict forced to HEADWIND + S20 escalation). '+
    'Flags never veto alone — they gate size tier and burden of proof. Slow truth under fast price.</div>',{flush:true});

  /* ── §f fundamental context verdict ── */
  h+=panel('§f · FUNDAMENTAL CONTEXT VERDICT','one enum, three cited reasons — attachable to the live packet as a context note',
    '<div style="margin-bottom:8px">'+chip(d.verdict.v,d.verdict.cls,d.verdict.ico)+' <span class="pill">score '+U.sign(d.verdict.score,0)+'</span> <span class="pill">enum: TAILWIND · NEUTRAL · HEADWIND</span></div>'+
    d.verdict.reasons.map((r,i)=>kv('REASON '+(i+1),'<span style="font-size:11px">'+U.esc(r)+'</span>')).join('')+
    '<div class="hr"></div>'+
    kv('WHAT THIS IS','context for the committee — it colors size tier and burden of proof')+
    kv('WHAT THIS IS NOT','a trigger. Fundamentals never enter a trade here; structure does. A TAILWIND with no setup is a watchlist row, not a position.')+
    '<div class="btnrow" style="margin-top:10px">'+
    CMD.btn('funda.attach',null,'gold','◆ Attach verdict to '+(pk?pk.id:'packet'))+
    (pk&&pk.fundaNote?'<span class="tag">attached '+U.esc(pk.fundaNote.at)+' · '+U.esc(pk.fundaNote.verdict)+'</span>':'')+
    (pk?CMD.btn('nav.decisions.packet',pk.id,'sm','Open '+pk.id):'<span class="pill">no active packet on '+U.esc(s.sym)+'</span>')+
    '</div>');

  /* ── verdict sensitivity — the levers that would flip §f, computed from the score arithmetic ── */
  (function(){
    const sc=d.verdict.score;
    const vOf=x=>x>=2?'TAILWIND':x<=-2?'HEADWIND':'NEUTRAL';
    const levers=[];
    if(!d.etf){
      if(d.qtrs[0].guide!=='RAISED')levers.push(['Next print guides UP','+1','the cheapest single point on the board — one sentence from the CFO']);
      if(d.qtrs[0].guide!=='CUT')levers.push(['Next print guides DOWN','−1'+(d.pat.verdict!=='BEAT-AND-FADE'?' (and pressures the pattern verdict)':''),'watch the transcript-signals panel for the vocabulary that precedes it']);
      d.flags.filter(f=>f.st==='WATCH').forEach(f=>levers.push([f.nm+' clears','+1',f.clear!=='—'?f.clear:'per the evidence ladder']));
      d.flags.filter(f=>f.st==='CLEAR').slice(0,1).forEach(f=>levers.push(['Any CLEAR flag → WATCH','−1','e.g. '+f.nm.toLowerCase()+': '+f.raise]));
      if(d.flags.some(f=>f.st!=='RAISED'))levers.push(['Any flag → RAISED','−3','forces HEADWIND arithmetic almost regardless of the rest']);
      if(d.val.pct>=40&&d.val.pct<=85)levers.push(['Band exits the 40–85th corridor','±1','multiple expansion past the 85th costs a point; compression below the 40th earns one']);
    }else{
      levers.push(['Weighted beat rate crosses 72%','±1','season-level earnings tape']);
      levers.push(['Top-10 weight crosses 45%','−1','concentration flag arms']);
      levers.push(['5d flows flip sign past ±$0.5B','±1','the passive tide turns']);
    }
    h+=panel('VERDICT SENSITIVITY — what would flip §f','computed from the same score arithmetic that produced the chip — no hidden judgment between the levers and the verdict',
      tbl(['Lever','>Δ score','Evidence path'],
        levers.slice(0,6).map(l=>'<tr>'+
          '<td><b style="font-size:11px">'+U.esc(l[0])+'</b></td>'+
          '<td class="r num">'+U.esc(l[1])+'</td>'+
          '<td class="i2" style="font-size:10.5px">'+U.esc(l[2])+'</td>'+
          '</tr>').join(''))+
      '<div style="padding:8px 12px">'+
      kv('CURRENT','score '+U.sign(sc,0)+' → '+d.verdict.v)+
      kv('DISTANCE','to TAILWIND: '+(sc>=2?'already there':'+'+(2-sc)+' points')+' · to HEADWIND: '+(sc<=-2?'already there':(sc+2)+' points of deterioration'))+
      kv('WHY THIS PANEL EXISTS','a verdict you cannot pre-compute the flip conditions for is an opinion. This one is a function — and functions can be argued with, point by point.')+
      '</div>',{flush:true});
  })();

  /* ── closing: role weighting + court consumption map ── */
  h+='<div class="grid g2">';
  h+=panel('INSIDER ROLE WEIGHTING — who moves the needle','the same $1M sale means five different things from five different chairs',
    tbl(['Role','Sale weight','Buy weight','Why'],
      [['CEO / CFO','HIGH (discretionary) · LOW (10b5-1)','VERY HIGH','they see the whole P&L; an open-market buy is them refusing their own diversification advice'],
       ['Division EVP/SVP','MEDIUM','HIGH','sees one segment clearly — cross-read against the segment mix panel'],
       ['Director','LOW','MEDIUM','board calendars drive sales; buys still require conviction'],
       ['10% owner (fund)','LOW','LOW','portfolio mechanics, rebalancing, LP flows — mostly noise'],
      ].map(r=>'<tr>'+
        '<td><b style="font-size:11px">'+r[0]+'</b></td>'+
        '<td class="i2" style="font-size:10.5px">'+r[1]+'</td>'+
        '<td class="i1" style="font-size:10.5px">'+r[2]+'</td>'+
        '<td class="i2" style="font-size:10.5px">'+r[3]+'</td>'+
        '</tr>').join(''))+
    '<div class="i2" style="font-size:10.5px;padding:8px 12px">S17 applies this weighting before anything reaches the ticker record — the ledger above is raw; the vote the committee sees is weighted.</div>',{flush:true});
  h+=panel('HOW THE COURTS CONSUME THIS DOSSIER','three seats, three lanes, one ticker record — nothing here reaches a vote unfiltered',
    kv('S17 · '+U.esc(SEATBY['S17']?SEATBY['S17'].nm:'Company Intelligence'),'owns §d ownership + insider cadence + the CUST flag — files into the ticker record daily')+
    kv('S19 · '+U.esc(SEATBY['S19']?SEATBY['S19'].nm:'Earnings Event'),'owns §a/§b — the archetype classifier, implied-vs-realized, and the LAW-017 window arithmetic')+
    kv('S20 · '+U.esc(SEATBY['S20']?SEATBY['S20'].nm:'Forensic Fundamentals'),'owns §e accruals/dilution + the quality ladder — weekly cadence, because fraud moves slowly until it doesn’t')+
    kv('S00 · Director','receives the §f verdict as CONTEXT evidence in packet §14 — it colors the grade; it cannot cast a vote')+
    '<div class="hr"></div>'+
    kv('THE BOUNDARY','no fundamental datum can trigger an entry (publication lag makes that structurally unsound — see the lag ledger). The dossier’s whole authority is: benefit of the doubt, size tier, and burden of proof.')+
    kv('THE EXCEPTION','there is none. Even a RAISED accruals flag blocks nothing by itself — it forces HEADWIND, which forces the human to read before approving. The human remains the gate (LAW-007).'));
  h+='</div>';

  /* ── operator notes — the human’s fundamental memory on this symbol ── */
  const notes=RSCH_NOTES.filter(n2=>n2.sym===s.sym);
  h+=panel('OPERATOR NOTES — '+U.esc(s.sym),'your fundamental read, journaled — notes are evidence at the next decision, not vibes at this one',
    '<div class="row" style="margin-bottom:8px">'+
    '<input id="rsch-note-in" class="inp" placeholder="e.g. Hyperscaler capex commentary at MSFT print T+9d is the real NVDA catalyst — reassess concentration flag after" style="flex:1" maxlength="180">'+
    '<button class="btn gold" data-cmd="funda.note">Save note</button>'+
    '</div>'+
    (notes.length
      ?notes.map(n2=>'<div class="kv">'+
        '<span class="k">'+U.esc(n2.t)+'</span>'+
        '<span class="v"><span style="font-size:11.5px">'+U.esc(n2.txt)+'</span>'+
        ' <span class="btnrow" style="margin-top:4px"><button class="btn sm" data-cmd="funda.notedel" data-arg="'+n2.id+'">Delete</button></span></span>'+
        '</div>').join('')
      :'<div class="empty"><div class="e1">NO NOTES YET</div>A fundamental read you don’t write down is a fundamental read you will re-derive under pressure — badly.</div>'));

  /* ── dossier lifecycle FSM — where this evidence is in its life ── */
  const lifeState=d.etf?'CORROBORATED'
    :(pk&&pk.fundaNote)?'ATTACHED'
    :(d.fwd&&d.fwd.days<=ck('risk.event_window_hrs')/24)?'PRE-PRINT FREEZE'
    :'CORROBORATED';
  h+=panel('DOSSIER LIFECYCLE — evidence has a state machine too','COLLECTING → CORROBORATED → ATTACHED → STALE — a dossier is never just “done”',
    '<div class="row" style="gap:4px;margin-bottom:8px">'+
    ['COLLECTING','CORROBORATED','ATTACHED','STALE'].map(st2=>'<span class="lc'+(st2===lifeState||(lifeState==='PRE-PRINT FREEZE'&&st2==='CORROBORATED')?' lc-TRIGGERED':'')+'">'+st2+'</span>').join('<span class="i2" style="font-size:9px">→</span>')+
    (lifeState==='PRE-PRINT FREEZE'?' '+chip('PRE-PRINT FREEZE','ch-warn','!'):'')+
    '</div>'+
    kv('COLLECTING','sections landing from S17/S19/S20 on their own cadences — daily, daily, weekly. An incomplete dossier renders with holes, never with guesses')+
    kv('CORROBORATED','all sections present and internally consistent (scorecard ↔ guidance ↔ flags reconcile) — eligible for the §f attach')+
    kv('ATTACHED','the verdict rides a live packet as context — from here, changing the verdict requires re-attach, which requires a fresh audit line')+
    kv('STALE','the print happened: §a/§b are history, and every panel above re-derives. A dossier is stale the second its next earnings date passes — automatically, not by anyone’s memory')+
    '<div class="hr"></div>'+
    kv('NOW',lifeState==='ATTACHED'?'ATTACHED to '+U.esc(pk.id)+' since '+U.esc(pk.fundaNote.at):lifeState==='PRE-PRINT FREEZE'?'inside the event window — attach stays available, but every §b number is about to be repriced; the desk knows which numbers are dying':'CORROBORATED — attachable, reproducible, hashed below'));

  /* ── freshness stamp — the dossier signs its own work ── */
  const stamp=U.hash8(JSON.stringify({sym:s.sym,verdict:d.verdict.v,score:d.verdict.score,flags:d.flags.map(f=>f.st)}));
  h+=panel('DOSSIER STAMP — content-addressed, reproducible','the same seed always produces this exact dossier — dispute the numbers, not the memory of them',
    '<div class="grid g4">'+
    stat('Content hash','<span class="mono" style="font-size:11px">#'+stamp+'</span>','hash of verdict + flag states — changes iff the conclusion changes')+
    stat('Seed lineage','<span class="mono" style="font-size:11px">seed-'+U.esc(s.sym)+'</span>','deterministic — reload and every number returns identically '+prov('demo.seed'))+
    stat('Generated',CLOCK.hm()+' ET','sim-clock; regenerated per symbol, cached per session')+
    stat('Attach state',pk&&pk.fundaNote?'<span class="up">on '+U.esc(pk.id)+'</span>':'not attached','§f verdict travels only by the audited attach command')+
    '</div>'+
    '<div class="i2" style="font-size:10.5px;margin-top:6px">Vault doctrine: every artifact the desk argues from must be re-derivable and hashable — a dossier that cannot be reproduced is testimony, not evidence.</div>');
  return h;
};

/* ═══════════ fundamentals commands ═══════════ */
CMD.define({id:'funda.attach',label:'Attach fundamental verdict',purpose:'Pin the TAILWIND/NEUTRAL/HEADWIND context note onto the active packet — audited, one per packet',audit:false,
  pre:()=>{
    const s=RSCH_sym();
    const p=RSCH_pkt(s.sym);
    if(!p)return'No packet in an attachable state for '+s.sym+' — verdicts attach to evidence, not to air';
    if(p.fundaNote)return'Already attached to '+p.id+' ('+p.fundaNote.verdict+' @ '+p.fundaNote.at+') — one context note per packet';
    return null;
  },
  run:()=>{
    const s=RSCH_sym();
    const d=RSCH_dossier(s.sym);
    const p=RSCH_pkt(s.sym);
    if(!p)return;
    p.fundaNote={verdict:d.verdict.v,score:d.verdict.score,reasons:d.verdict.reasons.slice(),at:CLOCK.hm()};
    SVR.audit('HUMAN (owner)','funda','Fundamental context '+d.verdict.v+' (score '+U.sign(d.verdict.score,0)+') attached to '+p.id+' — '+d.verdict.reasons[0].slice(0,90));
    UI.toast('Context note pinned to '+p.id+': '+d.verdict.v+'. It colors size tier and burden of proof — it does not vote.','gold','FUNDAMENTALS');
    render();
  }});
CMD.define({id:'funda.compare',label:'Peer comparison',purpose:'Symbol vs sector peers on 5 metrics — valuation is relative before it is absolute',audit:false,
  run:()=>{
    const s=RSCH_sym();
    const peers=(RSCH_PEERSETS[s.sector]||RSCH_PEERSETS['Mega-tech']).filter(p=>p!==s.sym).slice(0,4);
    const rows=[RSCH_peerRow(s.sym,true)].concat(peers.map(p=>RSCH_peerRow(p,false)));
    const best=(k,lowGood)=>{
      const vals=rows.map(r=>r[k]);
      return lowGood?Math.min(...vals):Math.max(...vals);
    };
    UI.modal('⇄ '+U.esc(s.sym)+' vs '+U.esc(s.sector)+' peers — 5 metrics',
      '<div class="i2" style="font-size:10.5px;margin-bottom:8px"><span class="demo-wm">demo twin</span> — peer numbers are seeded twins; the subject column comes from the live dossier. Bold = best-in-set.</div>'+
      tbl(['Metric'].concat(rows.map(r=>(r.sym===s.sym?'>◆ ':'>')+r.sym)),
        [['Fwd P/E ×','pe',true,1],['EV/S ×','evs',true,1],['Rev growth y/y %','grow',false,1],['Gross margin %','gm',false,0],['Short % float','shortF',true,1]]
        .map(([lbl,k,lowGood,dec])=>'<tr><td class="i1" style="font-size:11px">'+lbl+'</td>'+
          rows.map(r=>{
            const isBest=Math.abs(r[k]-best(k,lowGood))<1e-9;
            return'<td class="r num'+(r.sym===s.sym?'':' i2')+'"'+(r.sym===s.sym?' style="background:var(--live-bg)"':'')+'>'+(isBest?'<b>':'')+U.fmt(r[k],dec)+(isBest?'</b>':'')+'</td>';
          }).join('')+'</tr>').join(''))+
      '<div class="i2" style="font-size:10.5px;margin-top:8px">Doctrine: cheapest-in-set is a fact, not a reason. Relative valuation ranks the burden of proof inside the sector — the trade still needs structure, sweep, displacement (LAW-010). S20 owns this lane.</div>',
      '<button class="btn" data-cmd="ui.closeModal">Close</button>');
  }});
CMD.define({id:'funda.qtr',label:'Quarter anatomy',purpose:'Print vs reaction forensics for one quarter — which archetype was it?',audit:false,
  run:a=>{
    const s=RSCH_sym();
    const d=RSCH_dossier(s.sym);
    if(d.etf||!d.qtrs){UI.toast('No issuer quarters on an index ETF — open a constituent dossier instead','','DOSSIER');return}
    const q=d.qtrs[U.clamp(+a||0,0,7)];
    const gap=q.react*0.6,drift=q.react-gap;
    const anatomy=q.react>=0&&gap>=0?'GAP-AND-GO — opened up, held the gap, closed higher. Demand was real.'
      :q.react<0&&gap>=0?'GAP-AND-FADE — opened up into overhead supply and closed red. The gap was exit liquidity: the trap archetype.'
      :q.react>=0?'DIP-AND-RIP — opened down, absorbed, reversed on volume. Capitulation built the cause intraday.'
      :'GAP-DOWN FOLLOW — opened down and kept going. No absorption, no fight.';
    const arch=q.surp>0&&q.guide==='RAISED'&&q.react>0?'Beat-and-raise leader'
      :q.surp>0&&q.react<0?'Beat-and-fade'
      :q.surp<0&&q.react>0?'Kitchen-sink reset'
      :'Drift-into-print';
    UI.drawer('<div class="dhead"><span class="dt">'+U.esc(s.sym)+' · '+U.esc(q.lbl)+' — print anatomy</span><span class="pill">demo twin · S19 lane</span><button class="dx" data-cmd="ui.closeDrawer">ESC</button></div>'+
      '<div class="dbody">'+
      panel('THE PRINT','estimate vs delivered',
        kv('EPS','est '+U.fmt(q.epsE,2)+' → act <b>'+U.fmt(q.epsA,2)+'</b> · surprise <span class="'+(q.surp>=0?'up':'dn')+'">'+U.pct(q.surp,1)+'</span>')+
        kv('REVENUE','est $'+U.fmt(q.revE,1)+'B → act <b>$'+U.fmt(q.revA,1)+'B</b> · <span class="'+(q.rsurp>=0?'up':'dn')+'">'+U.pct(q.rsurp,1)+'</span>')+
        kv('GUIDANCE',chip(q.guide,q.guide==='RAISED'?'ch-ok':q.guide==='CUT'?'ch-warn':'ch-mut','·')+' — guidance direction moves the NEXT quarter’s consensus; that walk is tracked in flag §e'))+
      panel('THE REACTION — where the information lives','the print is public in 100ms; the reaction reveals positioning',
        kv('NEXT-DAY MOVE','<b class="'+(q.react>=0?'up':'dn')+'">'+U.pct(q.react,1)+'</b>')+
        kv('DECOMPOSITION','gap ≈ '+U.pct(gap,1)+' · session drift ≈ '+U.pct(drift,1)+' — the drift is the honest part')+
        kv('ANATOMY',U.esc(anatomy))+
        kv('S19 ARCHETYPE','<b>'+arch+'</b> — see the four-archetype classifier in Research → Catalysts'))+
      panel('WHAT THE DESK DOES WITH THIS','pattern memory, not prediction',
        kv('IF THIS REPEATS',arch==='Beat-and-fade'?'never chase the gap on this name — the gap is the liquidity event':'first structural pullback after the reaction day is the entry lane, never the print itself')+
        kv('BLACKOUT','either way, no position through the print '+prov('LAW-017')+' — the desk trades the reaction’s structure, not the coin-flip'))+
      '</div>');
  }});
CMD.define({id:'funda.flag',label:'Flag evidence ladder',purpose:'Definition, current evidence, and the thresholds that move a red flag',audit:false,
  run:a=>{
    const s=RSCH_sym();
    const d=RSCH_dossier(s.sym);
    const f=(d.flags||[]).find(x=>x.id===a);
    if(!f){UI.toast('Unknown flag id: '+a,'warn','DOSSIER');return}
    UI.drawer('<div class="dhead"><span class="dt">'+U.esc(f.nm)+' · '+U.esc(s.sym)+'</span><span class="pill">owner '+U.esc(f.owner)+' · '+U.esc(SEATBY[f.owner]?SEATBY[f.owner].nm:'')+'</span><button class="dx" data-cmd="ui.closeDrawer">ESC</button></div>'+
      '<div class="dbody">'+
      '<div style="margin-bottom:10px">'+chip(f.st,f.st==='CLEAR'?'ch-ok':f.st==='WATCH'?'ch-warn':'ch-blk',f.st==='CLEAR'?'✓':f.st==='WATCH'?'!':'⛔')+'</div>'+
      panel('CURRENT EVIDENCE','the reading behind the state · <span class="demo-wm">demo twin</span>',
        '<div class="i1" style="font-size:11.5px;line-height:1.65">'+U.esc(f.read)+'</div>')+
      panel('THE EVIDENCE LADDER','states move on thresholds, never on vibes',
        kv('CLEAR','no action — the flag exists so its absence is checkable, not assumable')+
        kv('WATCH','a context note rides every packet on this symbol; size tier loses the benefit of the doubt')+
        kv('RAISED','fundamental verdict forced to HEADWIND · '+U.esc(f.owner)+' escalates to the Catalyst Court · swing entries need explicit override reasoning in §f of the packet')+
        '<div class="hr"></div>'+
        kv('WHAT RAISES IT',U.esc(f.raise))+
        kv('WHAT CLEARS IT',U.esc(f.clear)))+
      panel('WHY THIS FLAG EXISTS','slow truth under fast price (S20 charter)',
        '<div class="i2" style="font-size:11px;line-height:1.6">Price discounts fundamentals late and violently. The registry’s job is to know the crack is there BEFORE the tape trades it — so when the gap-down comes, it is a scenario the desk already sized, not a surprise it explains afterward.</div>')+
      '</div>');
  }});
CMD.define({id:'funda.export',label:'Export dossier',purpose:'Download the full dossier as JSON — every value stamped demo_twin',
  run:()=>{
    const s=RSCH_sym();
    const d=RSCH_dossier(s.sym);
    const bundle={schema:'rsch.funda_dossier.v1',mode:S.mode,demo_twin:true,sym:s.sym,generated:CLOCK.hms()+' ET sim-clock',
      scorecard:d.qtrs||null,pattern:d.pat||null,forward:d.fwd||null,valuation:d.val,ownership:d.own||null,etf:d.etfx||null,
      flags:d.flags.map(f=>({id:f.id,nm:f.nm,state:f.st,owner:f.owner})),verdict:d.verdict};
    const blob=new Blob([JSON.stringify(bundle,null,2)],{type:'application/json'});
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    a.download='ATLAS_fundamentals_'+s.sym+'_demo.json';
    a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href),4000);
    UI.toast('Dossier exported — every field carries demo_twin:true. Honesty survives the download.','','DOSSIER');
  }});

CMD.define({id:'funda.scenario',label:'Scenario lab',purpose:'Play the next print four ways — analogs counted from the 8-quarter tape, plans pre-committed',audit:false,
  run:()=>{
    const s=RSCH_sym();
    const d=RSCH_dossier(s.sym);
    if(d.etf||!d.qtrs){UI.toast('Scenario lab needs issuer quarters — index ETFs get the season map instead','','SCENARIO LAB');return}
    const seg2=(f)=>d.qtrs.filter(f);
    const cell=(qs)=>{
      if(!qs.length)return{n:0,avg:0};
      return{n:qs.length,avg:RSCH_mean(qs.map(q=>q.react))};
    };
    const sc=[
      {nm:'BEAT + RAISE',c:cell(seg2(q=>q.surp>0&&q.guide==='RAISED')),
       stance:'The leader archetype. Plan: first structural pullback AFTER the reaction day; never the gap itself.'},
      {nm:'BEAT + HELD/CUT',c:cell(seg2(q=>q.surp>0&&q.guide!=='RAISED')),
       stance:'The costume beat. The guidance line, not the EPS line, sets the drift — expect the gap to be tested.'},
      {nm:'MISS + RESET',c:cell(seg2(q=>q.surp<=0&&q.guide!=='CUT')),
       stance:'Kitchen-sink candidate — watch for capitulation volume building a spring (Wyckoff lane, S10).'},
      {nm:'MISS + CUT',c:cell(seg2(q=>q.surp<=0&&q.guide==='CUT')),
       stance:'The walkdown confirmed. No knife-catching: the estimate cliff (§e·GWD) has to finish repricing first.'},
    ];
    UI.modal('▦ SCENARIO LAB — '+U.esc(s.sym)+' next print, four ways',
      '<div class="i2" style="font-size:10.5px;margin-bottom:8px">Analog counts and average reactions computed from the 8 quarters in §a. Eight samples is a tape, not a distribution — the lab sets expectations, it does not price them.</div>'+
      tbl(['Scenario','>Analogs (8q)','>Avg next-day','Pre-committed stance'],
        sc.map(x=>'<tr>'+
          '<td><b style="font-size:11px">'+x.nm+'</b></td>'+
          '<td class="r num">'+x.c.n+'</td>'+
          '<td class="r num '+(x.c.avg>=0?'up':'dn')+'">'+(x.c.n?U.pct(x.c.avg,1):'—')+'</td>'+
          '<td class="i1" style="font-size:10.5px">'+x.stance+'</td>'+
          '</tr>').join(''))+
      '<div class="banner gold" style="margin-top:8px"><span class="bico">◆</span><div><b>The invariant across all four:</b> no position through the print '+prov('LAW-017')+' — implied ±'+U.fmt(d.fwd.implied,1)+'% is the cost of admission to a coin-flip. The desk trades the structure the reaction leaves behind.</div></div>',
      '<button class="btn" data-cmd="ui.closeModal">Close</button>');
  }});
CMD.define({id:'funda.checklist',label:'Pre-earnings checklist',purpose:'Eight fundamental gates, each row citing the dossier number it was computed from',audit:false,
  run:()=>{
    const s=RSCH_sym();
    const d=RSCH_dossier(s.sym);
    if(d.etf||!d.qtrs){UI.toast('Checklist needs issuer quarters — for an ETF the season map is the checklist','','CHECKLIST');return}
    const rows=[
      ['Reaction pattern known',d.pat.verdict!=='MIXED TAPE','§a: '+d.pat.verdict+' — '+d.pat.beats+'/8 beats, '+d.pat.fades+' faded',
       d.pat.verdict==='MIXED TAPE'?'mixed tape = no positioning read; treat the print as pure noise':'a stable pattern is a plan input'],
      ['Implied vs realized priced',true,'§b: implied ±'+U.fmt(d.fwd.implied,1)+'% vs realized ±'+U.fmt(d.fwd.realized,1)+'% ('+U.sign((d.fwd.implied/d.fwd.realized-1)*100,0)+'%)',
       'know which side of the vol trade the market is offering before deciding to take neither'],
      ['Estimate bar direction',d.est.drift>-1,'est-walk 90d drift '+U.pct(d.est.drift,1)+' · '+d.est.nUp+' up / '+d.est.nDn+' down',
       d.est.drift<=-1?'the bar was walked DOWN — a “beat” here is a costume':'the bar held or rose — a beat means something'],
      ['Guidance streak clean',d.qtrs[0].guide!=='CUT','last guide: '+d.qtrs[0].guide+' · GWD flag: '+(d.flags.find(f=>f.id==='gwd')||{st:'—'}).st,
       'a cut into a print stacks two negative catalysts on one date'],
      ['Red flags ≤ WATCH',!d.flags.some(f=>f.st==='RAISED'),'§e: '+d.flags.filter(f=>f.st==='CLEAR').length+' CLEAR · '+d.flags.filter(f=>f.st==='WATCH').length+' WATCH · '+d.flags.filter(f=>f.st==='RAISED').length+' RAISED',
       'any RAISED flag forces HEADWIND and swing entries need written override reasoning'],
      ['Valuation band located',true,'§c: '+U.fmt(d.val.pct,0)+'th pctile of own 5y band',
       d.val.pct>85?'top-decile — post-print rallies into this multiple get sold; expect fade pressure':'the multiple has room to absorb good news'],
      ['Squeeze fuel assessed',true,'§d: '+U.fmt(d.own.shortF,1)+'% float short · '+U.fmt(d.own.dtc,1)+'d cover',
       d.own.shortF>=6?'real fuel — an upside surprise can dislocate; sizing the SHORT side here is fighting mechanics':'no fuel — squeeze narratives on this name are stories'],
      ['Blackout respected',true,'LAW-017: no new entries inside '+ck('risk.event_window_hrs')+'h of '+d.fwd.when,
       'the only row that is not advice. It is enforced.'],
    ];
    const pass=rows.filter(r=>r[1]).length;
    UI.modal('☑ PRE-EARNINGS CHECKLIST — '+U.esc(s.sym)+' · '+U.esc(d.fwd.when),
      '<div style="margin-bottom:8px">'+chip(pass+'/8 GATES CLEAN',pass>=7?'ch-ok':pass>=5?'ch-warn':'ch-blk',pass>=7?'✓':'!')+
      ' <span class="pill">computed from the live dossier — re-runs on every open</span></div>'+
      tbl(['Gate','State','Evidence','Why it matters'],
        rows.map(r=>'<tr>'+
          '<td><b style="font-size:11px">'+r[0]+'</b></td>'+
          '<td>'+chip(r[1]?'OK':'FAIL',r[1]?'ch-ok':'ch-warn',r[1]?'✓':'!')+'</td>'+
          '<td class="mono" style="font-size:10px">'+U.esc(r[2])+'</td>'+
          '<td class="i2" style="font-size:10.5px">'+U.esc(r[3])+'</td>'+
          '</tr>').join(''))+
      '<div class="i2" style="font-size:10.5px;margin-top:8px">A clean checklist does not license holding through the print — it licenses having a PLAN for the day after. The desk’s answer to every earnings coin-flip is the same: '+
      'flat through the window, structured after it.</div>',
      '<button class="btn" data-cmd="ui.closeModal">Close</button>');
  }});
CMD.define({id:'funda.note',label:'Save operator note',purpose:'Journal a fundamental read on this symbol — versioned, audited, evidence at the next decision',
  run:()=>{
    const inp=$('#rsch-note-in');
    if(!inp||!inp.value.trim()){UI.toast('Write the note first — a blank read is not a read','warn','NOTES');return}
    const s=RSCH_sym();
    RSCH_NOTES.unshift({id:'FN-'+String(++RSCH_NOTESEQ).padStart(3,'0'),sym:s.sym,txt:inp.value.trim(),t:CLOCK.hm()+' ET'});
    SVR.audit('HUMAN (owner)','funda','Note saved on '+s.sym+': "'+inp.value.trim().slice(0,70)+'"');
    UI.toast('Note journaled — it will be sitting here at the next decision on '+s.sym,'gold','NOTES');
    render();
  }});
CMD.define({id:'funda.notedel',label:'Delete note',purpose:'Remove an operator note (the deletion is audited — evidence does not vanish silently)',audit:false,
  run:a=>{
    const i=RSCH_NOTES.findIndex(n2=>n2.id===a);
    if(i>=0){
      SVR.audit('HUMAN (owner)','funda','Note '+RSCH_NOTES[i].id+' deleted: "'+RSCH_NOTES[i].txt.slice(0,50)+'…"');
      RSCH_NOTES.splice(i,1);
      render();
    }
  }});

/* ═══════════ VIEW · research.factors — FACTOR & CORRELATION LENS ═══════════ */
VIEWS['research.factors']=function(){
  const s=RSCH_sym();
  const m=RSCH_metrics(s.sym);
  const ld=RSCH_loadings(s.sym);
  const pz=RSCH_pairz(RSCH_FSTATE.pair);
  const crowd=RSCH_CROWD[s.sym]||Math.round(40+localRng('rsch-crowd-'+s.sym)()*40);
  const C='<span class="tag" style="color:var(--pos)">COMPUTED FROM SERIES</span>';
  const T='<span class="demo-wm">demo twin</span>';
  let h=RSCH_head('factors & pairs',
    'What actually moves this name — realized metrics computed live from candles('+s.sym+',360) vs candles('+m.bench+',360). Change the symbol and every formula re-runs.');
  h+='<div class="banner gold" style="margin-bottom:12px"><span class="bico">◆</span><div>'+
    '<b>The point of this tab:</b> the green-tagged numbers are DERIVED from the same seeded candle series the chart draws'+(typeof NET!=='undefined'&&NET.on?' (live spine connected — the series is real market data)':'')+'. '+
    'Nothing green is stored fiction. Bars carry no wall-clock in DEMO, so annualization treats one bar as one session (×√252) and says so. Twin cards are watermarked.'+
    '</div></div>';

  /* ── reading order — how a professional walks this tab ── */
  h+=panel('READING ORDER — sixty seconds, top to bottom','the tab is long because the truth is; the walk is short because the decisions are',
    '<div class="grid g2">'+
    kv('1 · METRIC CARDS','is this a high-β, high-vol animal or a market-like one? Ten seconds — it sets the size divisor before any thesis exists')+
    kv('2 · ROLLING CORR','is the diversification credit real THIS month? One glance at the last third of the line')+
    kv('3 · SIGMA RULER','does the plan stop survive ordinary noise? If not, stop reading — the plan is broken before factors matter')+
    kv('4 · MATRIX + BOARD','what does the book already own that this would double? Red cells against open positions end the conversation')+
    kv('5 · PAIR LAB','only if the idea IS a spread — and then the census drawer before the z-score seduces')+
    kv('6 · SELF-TEST','bottom of the page: did the kernel prove its identities this render? Trust is checked, not assumed')+
    '</div>');

  /* ── (a) realized metrics — computed ── */
  h+='<div class="grid g3">'+
    stat('Realized vol (20-bar)',U.fmt(m.vol20,1)+'% <span class="i2" style="font-size:10px">ann.</span>','σ = sd(ln pₜ/pₜ₋₁, last 20) × √252 · '+m.bench+': '+U.fmt(m.volB20,1)+'% → '+U.fmt(m.vol20/(m.volB20||1e-9),1)+'× the tape<br>'+C)+
    stat('Beta vs '+m.bench,U.fmt(m.beta,2),'β = cov(r,b)/var(b) = '+U.fmt(m.cov*1e5,2)+'e-5 / '+U.fmt(m.varB*1e5,2)+'e-5 over n='+m.n+'<br>'+C)+
    stat('Correlation r',U.fmt(m.corr,2),'r = cov/(σᵣ·σᵦ) · r² = '+U.fmt(m.r2*100,0)+'% of variance is index-explained<br>'+C)+
    stat('Max drawdown',U.fmt(m.dd,1)+'%','peak-to-trough on the 360-bar close path — the honest pain number<br>'+C)+
    stat('Return skew',U.fmt(m.skew,2),(m.skew<-0.2?'left tail — crash-prone distribution; stops earn their keep here':m.skew>0.2?'right tail — upside outliers carry the expectancy':'near-symmetric — no tail story')+'<br>'+C)+
    stat('Momentum 12-1 proxy',U.pct(m.mom,1),'close['+m.iEnd+']/close['+m.iStart+'] − 1 · skips the last 21 bars (reversal zone)<br>'+C)+
    '</div>';
  h+=panel('REGRESSION ARITHMETIC — shown, not asserted','the beta above is these sums, nothing more · full working in the drawer',
    '<div class="grid g2"><div>'+
    kv('n (paired returns)','<span class="mono">'+m.n+'</span> log returns from 360 bars each')+
    kv('mean r ('+U.esc(s.sym)+')','<span class="mono">'+U.fmt(m.mr*1e4,2)+'</span> bp/bar')+
    kv('mean b ('+m.bench+')','<span class="mono">'+U.fmt(m.mb*1e4,2)+'</span> bp/bar')+
    kv('Σ(bᵢ−b̄)(rᵢ−r̄)','<span class="mono">'+U.fmt(m.sxy*1e3,4)+'</span> ×10⁻³')+
    '</div><div>'+
    kv('Σ(bᵢ−b̄)²','<span class="mono">'+U.fmt(m.sxx*1e3,4)+'</span> ×10⁻³')+
    kv('β = cov/var','<span class="mono"><b>'+U.fmt(m.beta,3)+'</b></span>')+
    kv('α (intercept, ann.)','<span class="mono">'+U.sign(m.alpha,1)+'%</span> — residual drift after removing β·'+m.bench)+
    kv('r / r²','<span class="mono">'+U.fmt(m.corr,3)+' / '+U.fmt(m.r2,3)+'</span>')+
    '</div></div>'+
    '<div class="btnrow" style="margin-top:8px">'+CMD.btn('factor.math',null,'sm pri','Σ Full working — every sum')+CMD.btn('factor.export',null,'sm','⤓ Export metrics JSON')+'</div>');

  /* ── beta stability + vol cone — both computed ── */
  const third=Math.floor(m.n/3);
  const bw1=RSCH_betaWin(m.rr,m.bb,0,third);
  const bw2=RSCH_betaWin(m.rr,m.bb,third,third*2);
  const bw3=RSCH_betaWin(m.rr,m.bb,third*2,m.n);
  const bDrift=Math.max(bw1.beta,bw2.beta,bw3.beta)-Math.min(bw1.beta,bw2.beta,bw3.beta);
  h+='<div class="grid g2">';
  h+=panel('BETA STABILITY — the same regression, three sub-windows','beta is a season, not a constant — hedges sized on the full-sample number inherit this drift · '+C,
    tbl(['Window','>Bars','>β','>r'],
      [['Oldest third',''+bw1.n,bw1],['Middle third',''+bw2.n,bw2],['Latest third',''+bw3.n,bw3]]
      .map(([nm,n2,w])=>'<tr>'+
        '<td class="i1" style="font-size:11px">'+nm+'</td>'+
        '<td class="r num">'+n2+'</td>'+
        '<td class="r num"><b>'+U.fmt(w.beta,2)+'</b></td>'+
        '<td class="r num">'+U.fmt(w.corr,2)+'</td>'+
        '</tr>').join('')+
      '<tr style="background:var(--live-bg)"><td class="i1" style="font-size:11px"><b>Full sample</b></td><td class="r num">'+m.n+'</td><td class="r num"><b>'+U.fmt(m.beta,2)+'</b></td><td class="r num">'+U.fmt(m.corr,2)+'</td></tr>')+
    '<div style="padding:8px 12px">'+
    kv('β DRIFT','<span class="mono '+(bDrift>0.4?'dn':'')+'">'+U.fmt(bDrift,2)+'</span> max−min across thirds'+(bDrift>0.4?' — unstable: the full-sample β is an average of different animals':' — stable enough to size against'))+
    kv('CONSEQUENCE','S33 uses the LATEST-window β for cluster math when drift exceeds 0.4 — the hedge you need is the one for the regime you are in')+
    '</div>',{flush:true});
  h+=panel('REALIZED VOL CONE — term structure of the actual tape','σ over 10/20/60/120 trailing bars, annualized (bars-as-sessions) · '+C,
    '<canvas id="rsch-cv-cone" class="cv" style="height:180px"></canvas>'+
    tbl(['Window','>'+U.esc(s.sym)+' σ ann.','>'+m.bench+' σ ann.','>Multiple'],
      [10,20,60,120].map(w=>{
        const v1=RSCH_volWin(m.rr,w),v2=RSCH_volWin(m.bb,w);
        return'<tr><td class="mono">'+w+'-bar</td>'+
        '<td class="r num">'+U.fmt(v1,1)+'%</td>'+
        '<td class="r num i2">'+U.fmt(v2,1)+'%</td>'+
        '<td class="r num">'+U.fmt(v1/(v2||1e-9),1)+'×</td></tr>';
      }).join(''))+
    '<div class="i2" style="font-size:10.5px;padding:8px 12px">Read the slope: short-window σ above long-window σ = vol is arriving now (size down first, ask questions after); inverted = the tape is quieting into complacency. '+
    'The stop distance in ATR terms and this cone must agree, or the plan is sized for a different market than the one on screen.</div>',{flush:true});
  h+='</div>';
  POSTRENDER.push(()=>{
    const cv=document.getElementById('rsch-cv-cone');if(!cv)return;
    const W=cv.width=cv.clientWidth*2,H=cv.height=180*2,x=cv.getContext('2d');
    x.fillStyle='#070B12';x.fillRect(0,0,W,H);
    const wins=[10,20,60,120];
    const a1=wins.map(w=>RSCH_volWin(m.rr,w));
    const a2=wins.map(w=>RSCH_volWin(m.bb,w));
    const maxV=Math.max(...a1,...a2,1)*1.28;
    const px2=i=>60+i/(wins.length-1)*(W-140);
    const py=v=>H-((v/maxV)*(H*0.72))-H*0.16;
    x.strokeStyle='rgba(151,166,192,.07)';x.font='15px monospace';x.fillStyle='#67748C';
    for(let g=1;g<=4;g++){const y=H-g*(H*0.72)/4-H*0.16;x.beginPath();x.moveTo(0,y);x.lineTo(W,y);x.stroke()}
    [[a2,'rgba(151,166,192,.6)',m.bench],[a1,'#5AA7FF',s.sym]].forEach(([arr,col,lbl])=>{
      x.strokeStyle=col;x.lineWidth=2.5;x.beginPath();
      arr.forEach((v,i)=>{i?x.lineTo(px2(i),py(v)):x.moveTo(px2(i),py(v))});
      x.stroke();
      x.fillStyle=col;
      arr.forEach((v,i)=>{x.beginPath();x.arc(px2(i),py(v),5,0,7);x.fill();x.fillText(v.toFixed(0)+'%',px2(i)-18,py(v)-12)});
      x.fillText(lbl,px2(wins.length-1)+14,py(arr[arr.length-1])+5);
    });
    x.fillStyle='#67748C';
    wins.forEach((w,i)=>x.fillText(w+'b',px2(i)-12,H-8));
  });

  /* ── (b) rolling correlation ── */
  h+=panel('ROLLING CORRELATION — '+U.esc(s.sym)+' vs '+m.bench,'diversification credit is a moving number, not a property · '+C,
    '<div class="row" style="margin-bottom:8px"><span class="seg">'+
    [40,60,90].map(w=>'<button class="'+(RSCH_FSTATE.win===w?'on':'')+'" data-cmd="factor.win" data-arg="'+w+'">'+w+'-bar</button>').join('')+
    '</span><span class="pill">window slides across the same 360-bar series</span></div>'+
    '<canvas id="rsch-cv-roll" class="cv" style="height:190px"></canvas>'+
    '<div class="i2" style="font-size:10.5px;margin-top:6px">Reading: above 0.70 this name and '+m.bench+' are one bet for cluster math — S33 sums them against the '+ck('risk.max_sector_exposure')+'% cap '+
    prov('RISK-031','risk.max_sector_exposure = '+ck('risk.max_sector_exposure')+' %equity — correlated cluster cap; correlated names count as one bet')+'. '+
    'Below 0.30, an index hedge stops working — hedge the pair, not the tape.</div>');
  RSCH_drawRoll(s.sym);

  /* ── correlation matrix across the promoted set — computed pairwise ── */
  const mSyms=SYMS.slice(0,6).map(x=>x.sym);
  const mRets={};
  mSyms.forEach(sy=>{mRets[sy]=RSCH_rets(RSCH_closes(sy,360))});
  h+=panel('CORRELATION MATRIX — promoted set, 360-bar pairwise','the table S33 turns into cluster math — ≥0.70 shares one bet budget · '+C,
    tbl(['ρ'].concat(mSyms.map(x=>'>'+x)),
      mSyms.map(r1=>'<tr><td class="mono"><b>'+r1+'</b></td>'+
        mSyms.map(c1=>{
          if(r1===c1)return'<td class="r num i2">—</td>';
          const rho=RSCH_corrOf(mRets[r1],mRets[c1]);
          const bg=rho>=0.7?'rgba(242,99,124,.16)':rho>=0.4?'rgba(231,182,83,.10)':'transparent';
          return'<td class="r num" style="background:'+bg+'"'+(rho>=0.7?' title="≥0.70 — one cluster bet (S33 · RISK-031)"':'')+'>'+U.fmt(rho,2)+'</td>';
        }).join('')+'</tr>').join(''))+
    '<div class="row" style="padding:8px 12px;justify-content:space-between">'+
    '<span class="i2" style="font-size:10.5px">Red cells ≥ 0.70 · amber 0.40–0.69. A red cell between two OPEN positions means the book holds one bet twice '+
    prov('RISK-031','risk.max_sector_exposure = '+ck('risk.max_sector_exposure')+' %equity — correlated cluster cap; correlated names count as one bet')+'.</span>'+
    CMD.btn('factor.stress',null,'sm warn','⚠ Stress the open book: ρ→1')+
    '</div>',{flush:true});

  /* ── promoted-set factor board — the whole desk through one lens ── */
  h+=panel('PROMOTED SET FACTOR BOARD','every promoted symbol through the same computed lens — the row you are on is highlighted · '+C,
    tbl(['Sym','>β','>r','>σ₂₀ ann','>Mom 12-1','>Max DD','Posture'],
      SYMS.slice(0,6).map(sy=>{
        const m2=RSCH_metrics(sy.sym);
        const post=m2.beta>=1.25?'HIGH-β':m2.beta<0.8?'LOW-β':'MKT-LIKE';
        return'<tr class="click'+(sy.sym===s.sym?'" style="background:var(--live-bg)':'')+'" data-cmd="research.sym" data-arg="'+sy.sym+'">'+
        '<td class="mono"><b>'+sy.sym+'</b>'+(sy.sym==='SPY'?' <span class="i2" style="font-size:9px">vs QQQ</span>':'')+'</td>'+
        '<td class="r num">'+U.fmt(m2.beta,2)+'</td>'+
        '<td class="r num'+(m2.corr>=0.7?' dn':'')+'">'+U.fmt(m2.corr,2)+'</td>'+
        '<td class="r num">'+U.fmt(m2.vol20,0)+'%</td>'+
        '<td class="r num '+(m2.mom>=0?'up':'dn')+'">'+U.sign(m2.mom,0)+'%</td>'+
        '<td class="r num dn">'+U.fmt(m2.dd,1)+'%</td>'+
        '<td>'+chip(post,post==='HIGH-β'?'ch-warn':post==='LOW-β'?'ch-info':'ch-mut','·')+'</td>'+
        '</tr>';
      }).join(''))+
    '<div class="i2" style="font-size:10.5px;padding:8px 12px">Click a row to re-point every Research tab at that symbol (synchronized context). '+
    'Board doctrine: two HIGH-β rows with red r cells in the matrix above are the same trade — the book may hold at most one of them at full size '+
    prov('RISK-031','risk.max_sector_exposure = '+ck('risk.max_sector_exposure')+' %equity — correlated cluster cap')+'.</div>',{flush:true});

  /* ── (c) factor loadings ── */
  h+='<div class="grid g2">';
  h+=panel('FACTOR LOADINGS — what moves this name','momentum + low-vol derived from the series; size/value/quality are labeled twins',
    '<canvas id="rsch-cv-load" class="cv" style="height:190px"></canvas>'+
    tbl(['Factor','>Loading','Source','Note'],
      ld.map(l=>'<tr>'+
        '<td class="mono" style="font-size:10.5px"><b>'+U.esc(l.k)+'</b></td>'+
        '<td class="r num '+(l.v>=0?'up':'dn')+'">'+U.sign(l.v,2)+'</td>'+
        '<td>'+(l.src==='C'?'<span class="tag" style="color:var(--pos)">COMPUTED</span>':'<span class="demo-wm">demo twin</span>')+'</td>'+
        '<td class="i2" style="font-size:10px">'+U.esc(l.note)+'</td>'+
        '</tr>').join('')));
  h+=panel('VARIANCE DECOMPOSITION — the honest split','how much of a day’s move is even about this company',
    kv('INDEX (β·'+m.bench+')','<b class="mono">'+U.fmt(m.r2*100,0)+'%</b> of return variance — computed: r² from the regression above')+
    kv('SECTOR CLUSTER','≈ <span class="mono">'+U.fmt(Math.max(0,(1-m.r2))*38,0)+'%</span> of the residual — <span class="demo-wm">demo twin</span> split; production estimates this from the sector-ETF second regression')+
    kv('IDIOSYNCRATIC','the remainder — the only slice your single-name thesis actually owns')+
    '<div class="hr"></div>'+
    kv('DOCTRINE 1','if r² is high, your “stock pick” is mostly an index bet with extra fees of attention — say so in the packet thesis')+
    kv('DOCTRINE 2','a thesis must live in the slice it claims: an idiosyncratic story on a '+U.fmt(m.r2*100,0)+'%-index name needs a catalyst strong enough to decouple, and those are rare (S18)')+
    kv('DOCTRINE 3','hedging: β-sized index hedge neutralizes the first row ONLY — the cluster row needs the pair lab below'));
  h+='</div>';
  RSCH_drawLoad(s.sym);

  /* ── sigma ruler — is the stop inside daily noise? computed ── */
  const sigBar=m.vol20/Math.sqrt(252);
  const stopDist=s.levels&&s.levels.stop?Math.abs(s.px-s.levels.stop)/s.px*100:null;
  const stopSig=stopDist!=null?stopDist/(sigBar||1e-9):null;
  h+=panel('SIGMA RULER — the stop vs the noise floor','±kσ per-bar moves from the 20-bar realized number, priced in dollars · '+C,
    tbl(['Move','>% per bar','>$ from '+U.fmt(s.px,2),'What lives here'],
      [1,2,3].map(k=>'<tr>'+
        '<td class="mono">±'+k+'σ</td>'+
        '<td class="r num">'+U.fmt(sigBar*k,2)+'%</td>'+
        '<td class="r num">$'+U.fmt(s.px*sigBar*k/100,2)+'</td>'+
        '<td class="i2" style="font-size:10.5px">'+(k===1?'ordinary breathing — ~68% of bars end inside this':k===2?'a notable bar — the census-worthy threshold':'a tail bar — see the skew card for which side this tape favors')+'</td>'+
        '</tr>').join(''))+
    '<div style="padding:8px 12px">'+
    (stopSig!=null
      ?kv('PLAN STOP','<span class="mono">'+U.fmt(s.levels.stop,2)+'</span> = '+U.fmt(stopDist,2)+'% away = <b class="'+(stopSig<1.5?'dn':'up')+'">'+U.fmt(stopSig,1)+'σ</b> of per-bar noise — '+
        (stopSig<1.5
          ?'inside ordinary breathing: this stop gets hit by NOISE, not by being wrong. Structural placement (LAW-001) exists precisely to prevent this geometry'
          :'beyond the noise floor: when this stop is hit, the thesis — not the randomness — failed. That is what a stop is for'))
      :kv('PLAN STOP','no plan levels on '+U.esc(s.sym)+' — the ruler is waiting for a structure to measure'))+
    (s.levels&&s.levels.t1
      ?kv('TARGET GEOMETRY','T1 '+U.fmt(s.levels.t1,2)+' = '+U.fmt(Math.abs(s.levels.t1-s.px)/s.px*100/(sigBar||1e-9),1)+'σ away · T2 '+U.fmt(s.levels.t2,2)+' = '+
        U.fmt(Math.abs(s.levels.t2-s.px)/s.px*100/(sigBar||1e-9),1)+'σ — a T2 many σ out is not wrong, it is a CAMPAIGN: it needs bars, and the time-stop must grant them (LAW-016 alignment)')
      :'')+
    kv('BENCH NOTE','benchmark is '+m.bench+(s.sym==='SPY'?' (SPY measured against QQQ — an index needs a peer, not itself)':' — the default tape'))+
    '</div>',{flush:true});

  /* ── relative-strength lens — the ratio series, computed ── */
  const rsN=Math.min(m.cl.length,m.bl.length);
  const ratio=[];
  for(let ri=0;ri<rsN;ri++)ratio.push(m.cl[ri]/(m.bl[ri]||1e-9));
  const rBase=ratio[0]||1;
  const ratioIx=ratio.map(v=>v/rBase*100);
  const ma50=ratioIx.map((v,i)=>i<49?null:RSCH_mean(ratioIx.slice(i-49,i+1)));
  const last60=ratioIx.slice(-60);
  let slNum=0,slDen=0;
  const xBar=(last60.length-1)/2,yBar=RSCH_mean(last60);
  last60.forEach((v,i)=>{slNum+=(i-xBar)*(v-yBar);slDen+=(i-xBar)*(i-xBar)});
  const rsSlope=(slNum/(slDen||1e-9))/(yBar||1e-9)*100;
  const tail120=ratioIx.slice(-120);
  const tailOff=ratioIx.length-tail120.length;
  const above=tail120.filter((v,i)=>{const mi=ma50[tailOff+i];return mi!=null&&v>mi}).length;
  const abovePct=Math.round(above/(tail120.length||1)*100);
  const rsAgree=(rsSlope>0&&s.rs>=60)||(rsSlope<0&&s.rs<60);
  h+=panel('RELATIVE STRENGTH LENS — '+U.esc(s.sym)+' / '+m.bench+' ratio','leadership is a ratio, not a feeling — drawn from both close series · '+C,
    '<canvas id="rsch-cv-rs" class="cv" style="height:170px"></canvas>'+
    '<div class="grid g4" style="margin-top:8px">'+
    stat('Ratio slope (60-bar)',U.sign(rsSlope,3)+'%/bar','OLS on the indexed ratio — positive = outperforming now')+
    stat('Above 50-bar MA',abovePct+'%','of the last 120 bars — persistence, not a point reading')+
    stat('Stored RS rank',s.rs+' <span class="i2" style="font-size:10px">pctile</span>','S09 twin from the symbol record — the committee’s input')+
    stat('Agreement',rsAgree?'<span class="up">CONFIRMS</span>':'<span class="dn">DIVERGES</span>','computed ratio trend vs stored rank — divergence is a data question, file it')+
    '</div>'+
    '<div class="i2" style="font-size:10.5px;margin-top:6px">Leader doctrine (S09): longs live in names outperforming their index; a fading ratio under a rising price is distribution wearing a rally. '+
    (rsAgree?'Here the computed lens and the stored rank agree — the RS input to the committee is corroborated.':'Here they disagree — before trusting either, ask S02 which feed is stale (LAW-006 thinking applies to derived data too).')+'</div>');
  POSTRENDER.push(()=>{
    const cv=document.getElementById('rsch-cv-rs');if(!cv)return;
    const W=cv.width=cv.clientWidth*2,H=cv.height=170*2,x=cv.getContext('2d');
    x.fillStyle='#070B12';x.fillRect(0,0,W,H);
    const vals=ratioIx.filter(v=>v!=null);
    const lo=Math.min(...vals)*0.995,hi=Math.max(...vals)*1.005;
    const py=v=>H-((v-lo)/((hi-lo)||1e-9))*(H*0.8)-H*0.08;
    x.strokeStyle='rgba(151,166,192,.07)';x.lineWidth=1;x.font='15px monospace';
    for(let g=0;g<=4;g++){const y=H*0.08+g*(H*0.8)/4;x.beginPath();x.moveTo(0,y);x.lineTo(W-70,y);x.stroke()}
    x.strokeStyle='rgba(151,166,192,.35)';x.setLineDash([6,5]);
    x.beginPath();x.moveTo(0,py(100));x.lineTo(W-70,py(100));x.stroke();x.setLineDash([]);
    x.fillStyle='#67748C';x.fillText('100 = start of window',W-320,py(100)-8);
    x.strokeStyle='rgba(231,182,83,.55)';x.lineWidth=1.5;x.beginPath();
    let started=false;
    ma50.forEach((v,i)=>{if(v==null)return;const X=i/(ratioIx.length-1)*(W-90),Y=py(v);started?x.lineTo(X,Y):x.moveTo(X,Y);started=true});
    x.stroke();
    x.strokeStyle='#5AA7FF';x.lineWidth=2.4;x.beginPath();
    ratioIx.forEach((v,i)=>{const X=i/(ratioIx.length-1)*(W-90),Y=py(v);i?x.lineTo(X,Y):x.moveTo(X,Y)});
    x.stroke();
    const lastV=ratioIx[ratioIx.length-1];
    x.fillStyle='#5AA7FF';x.beginPath();x.arc(W-90,py(lastV),7,0,7);x.fill();
    x.fillText('now '+lastV.toFixed(1),W-230,py(lastV)-12);
    x.fillStyle='rgba(231,182,83,.8)';x.fillText('50-bar MA',10,22);
  });

  /* ── drawdown anatomy — every major hole in the series, measured ── */
  const ddList=[];
  (function(){
    let peak=m.cl[0],peakI=0,trough=m.cl[0],troughI=0,inDD=false;
    for(let i2=1;i2<m.cl.length;i2++){
      const c2=m.cl[i2];
      if(c2>=peak){
        if(inDD&&(peak-trough)/peak>0.015)ddList.push({peakI,troughI,depth:(trough/peak-1)*100,rec:i2-troughI});
        peak=c2;peakI=i2;trough=c2;troughI=i2;inDD=false;
      }else if(c2<trough){trough=c2;troughI=i2;inDD=true}
    }
    if(inDD&&(peak-trough)/peak>0.015)ddList.push({peakI,troughI,depth:(trough/peak-1)*100,rec:null});
  })();
  ddList.sort((a,b)=>a.depth-b.depth);
  h+=panel('DRAWDOWN ANATOMY — the three worst holes in the series','depth is only half a drawdown; the other half is how long the capital was hostage · '+C,
    tbl(['Rank','>Depth','Peak → trough','>Bars down','>Bars to recover'],
      (ddList.slice(0,3).map((dd2,i2)=>'<tr>'+
        '<td class="mono">#'+(i2+1)+'</td>'+
        '<td class="r num dn"><b>'+U.fmt(dd2.depth,1)+'%</b></td>'+
        '<td class="mono" style="font-size:10.5px">bar '+dd2.peakI+' → '+dd2.troughI+'</td>'+
        '<td class="r num">'+(dd2.troughI-dd2.peakI)+'</td>'+
        '<td class="r num">'+(dd2.rec==null?'<span class="dn">not yet recovered</span>':dd2.rec)+'</td>'+
        '</tr>').join(''))||'<tr><td colspan="5" class="i2">series too smooth to register a ≥1.5% drawdown — suspicious in itself; check the feed</td></tr>')+
    '<div class="i2" style="font-size:10.5px;padding:8px 12px">Max drawdown '+U.fmt(m.dd,1)+'% (metric card above) is hole #1 here — same computation, now with its timeline. '+
    'Position doctrine: a stop placed inside the typical hole depth is a donation schedule; structural stops (LAW-001) live beyond the noise floor this table measures.</div>',{flush:true});

  /* ── tail forensics + beta-hedge calculator ── */
  const tl=RSCH_tails(s.sym);
  h+='<div class="grid g2">';
  h+=panel('TAIL FORENSICS — where the 360-bar return actually lives','extreme bars, ranked from the series · '+C,
    '<div class="grid g2"><div>'+
    '<div class="kick" style="font-family:var(--mono);font-size:9.5px;letter-spacing:1.2px;color:var(--ink2);margin-bottom:4px">WORST 5 BARS</div>'+
    tl.worst.map(t=>kv('bar '+t.i,'<span class="dn mono">'+U.pct(t.v*100,2)+'</span>')).join('')+
    '</div><div>'+
    '<div class="kick" style="font-family:var(--mono);font-size:9.5px;letter-spacing:1.2px;color:var(--ink2);margin-bottom:4px">BEST 5 BARS</div>'+
    tl.best.map(t=>kv('bar '+t.i,'<span class="up mono">'+U.pct(t.v*100,2)+'</span>')).join('')+
    '</div></div>'+
    '<div class="hr"></div>'+
    kv('SERIES RETURN','<b class="mono '+(tl.tot>=0?'up':'dn')+'">'+U.pct(tl.tot,1)+'</b> over 360 bars')+
    kv('EX BEST-10 BARS','<b class="mono '+(tl.exBest10>=0?'up':'dn')+'">'+U.pct(tl.exBest10,1)+'</b> — remove 10 bars of '+U.int(359)+' and this is what remains')+
    kv('READ','returns concentrate in a handful of bars. This is why the desk holds runners to T3 by template instead of taking profits by feel — the feel always sells the bar that mattered (runner-discipline drill, Review → Journal)'));
  h+=panel('β-HEDGE CALCULATOR — size the index leg honestly','notional × β hedges the r² slice ONLY — the residual is naked by construction · '+C,
    '<div class="row" style="margin-bottom:8px">'+
    '<span class="mono i2" style="font-size:10px">POSITION NOTIONAL</span>'+
    '<input type="range" min="2000" max="60000" step="1000" value="'+RSCH_FSTATE.notional+'" style="flex:1" data-cmdin="factor.hedge">'+
    '<span class="mono" style="font-size:12px"><b>'+U.moneyK(RSCH_FSTATE.notional)+'</b></span>'+
    '</div>'+
    '<div class="grid g3">'+
    stat('Hedge notional',U.moneyK(RSCH_FSTATE.notional*m.beta),m.bench+' short = notional × β ('+U.fmt(m.beta,2)+')')+
    stat('Variance hedged',U.fmt(m.r2*100,0)+'%','= r² — the index-explained slice, no more')+
    stat('Naked residual',U.moneyK(RSCH_FSTATE.notional*Math.sqrt(Math.max(0,1-m.r2))),'σ-equivalent exposure the hedge cannot touch')+
    '</div>'+
    '<div class="hr"></div>'+
    kv('WHY THIS PANEL EXISTS','“I’m hedged” is the most expensive sentence on a trading desk. This math says HOW hedged, in numbers, before the position exists')+
    kv('CLUSTER NOTE','the hedge notional consumes index-cluster budget at S33 — hedges are positions too '+prov('RISK-031','risk.max_sector_exposure = '+ck('risk.max_sector_exposure')+' %equity — correlated cluster cap'))+
    kv('EQUITY CONTEXT','at '+U.moneyK(S.equity)+' paper equity, this notional is '+U.fmt(RSCH_FSTATE.notional/S.equity*100,1)+'% of the book'));
  h+='</div>';

  /* ── (d) pair lab ── */
  h+=panel('PAIR LAB — spread z-score on the log-ratio','z = (ln(A/B) − μ)/σ over 360 bars · both legs from the real candle series · '+C,
    '<div class="row" style="margin-bottom:8px"><span class="seg">'+
    RSCH_PAIRS.map((p,i)=>'<button class="'+(RSCH_FSTATE.pair===i?'on':'')+'" data-cmd="factor.pair" data-arg="'+i+'">'+p.lbl+'</button>').join('')+
    '</span>'+CMD.btn('factor.pairmath',null,'sm','Σ Spread working + reversion census')+'</div>'+
    '<div class="grid g4" style="margin-bottom:8px">'+
    stat('μ log-ratio','<span class="mono">'+U.fmt(pz.mean,4)+'</span>','mean of ln('+U.esc(pz.p.a)+'/'+U.esc(pz.p.b)+'), n='+pz.n)+
    stat('σ log-ratio','<span class="mono">'+U.fmt(pz.sd,4)+'</span>','sample sd — the denominator of every z below')+
    stat('Current z',U.sign(pz.z,2)+'σ',Math.abs(pz.z)>=2?'<span class="dn">stretched beyond ±2σ — snap territory</span>':Math.abs(pz.z)>=1?'extended — inside the band':'near the mean — no tension')+
    stat('Half-life','<span class="i2">not computed</span>','mean-reversion speed needs an OU fit — production adds it; the demo refuses to fake it')+
    '</div>'+
    '<canvas id="rsch-cv-pair" class="cv" style="height:200px"></canvas>'+
    '<div class="i1" style="font-size:11px;margin-top:8px">'+U.esc(pz.p.why)+'</div>'+
    tbl(['Pair','>z now','State','Desk read'],
      RSCH_PAIRS.map((p,i)=>{
        const z=RSCH_pairz(i).z;
        return'<tr class="click'+(RSCH_FSTATE.pair===i?'" style="background:var(--live-bg)':'')+'" data-cmd="factor.pair" data-arg="'+i+'">'+
        '<td class="mono"><b>'+p.lbl+'</b></td>'+
        '<td class="r num '+(Math.abs(z)>=2?'dn':'')+'">'+U.sign(z,2)+'σ</td>'+
        '<td>'+chip(Math.abs(z)>=2?'STRETCHED':Math.abs(z)>=1?'EXTENDED':'NEUTRAL',Math.abs(z)>=2?'ch-warn':Math.abs(z)>=1?'ch-info':'ch-mut',Math.abs(z)>=2?'!':'·')+'</td>'+
        '<td class="i2" style="font-size:10.5px">'+(Math.abs(z)>=2?'reversion is the statistical side — but stretched pairs are stretched for reasons; demand the reason first':'no positioning edge from the spread alone')+'</td>'+
        '</tr>';
      }).join(''))+
    '<div class="banner warn" style="margin:10px 0 0"><span class="bico">!</span><div>'+
    '<b>Pair-snap doctrine:</b> a pair trade is TWO positions wearing one thesis. When the spread snaps, both legs move against you at once and the correlation you were harvesting becomes the transmission line for the loss. '+
    'S33 counts both legs inside the same cluster against the '+ck('risk.max_sector_exposure')+'% cap '+
    prov('RISK-031','risk.max_sector_exposure = '+ck('risk.max_sector_exposure')+' %equity — correlated cluster cap; both pair legs count as one bet')+
    ' — a pair is ONE bet at the risk engine, whatever the P&L netting says. And a z-score has no invalidation price: LAW-001 still demands a structural stop on each leg.'+
    '</div></div>');
  RSCH_drawPair();

  /* ── z trajectory — where each spread came from, not just where it is ── */
  h+=panel('Z TRAJECTORY — four lookbacks per pair','a z-score arriving at +2 is a different animal from one living there · '+C,
    tbl(['Pair','>z 90 bars ago','>z 60','>z 30','>z now','Path read'],
      RSCH_PAIRS.map((p,i)=>{
        const zz=RSCH_pairz(i);
        const at=off=>zz.zs[Math.max(0,zz.n-1-off)]||0;
        const z90=at(90),z60=at(60),z30=at(30),z0=zz.z;
        const widening=Math.abs(z0)>Math.abs(z90)+0.5;
        const snapping=Math.abs(z0)<Math.abs(z90)-0.5;
        return'<tr'+(RSCH_FSTATE.pair===i?' style="background:var(--live-bg)"':'')+'>'+
        '<td class="mono"><b>'+p.lbl+'</b></td>'+
        '<td class="r num i2">'+U.sign(z90,1)+'</td>'+
        '<td class="r num i2">'+U.sign(z60,1)+'</td>'+
        '<td class="r num">'+U.sign(z30,1)+'</td>'+
        '<td class="r num'+(Math.abs(z0)>=2?' dn':'')+'"><b>'+U.sign(z0,2)+'</b></td>'+
        '<td class="i2" style="font-size:10.5px">'+(widening?'stretching — the divergence is being BUILT; fading it early is standing on the tracks':snapping?'already snapping — the reversion is in progress, the easy σ is spent':'drifting — no directional tension in the spread')+'</td>'+
        '</tr>';
      }).join(''))+
    '<div class="i2" style="font-size:10.5px;padding:8px 12px">Trajectory doctrine: fade a STALLED extreme, never a moving one. The census in the spread-working drawer counts how long stalls took to resolve in this series.</div>',{flush:true});

  /* ── (e) crowding heat ── */
  h+='<div class="grid g2">';
  h+=panel('CROWDING HEAT — who is already in the trade','positioning twins · '+T+' · unwind risk is a function of the exit door, not the thesis',
    tbl(['Factor / trade','>Crowding','Positioning source','Unwind risk'],
      [['AI-megacap momentum','94th','HF net exposure + 13F drift','Everyone owns the same seven names; the exit is narrower than the entrance. Unwinds run −8–12% in days, not weeks'],
       ['Semis pair (long NVDA / short AMD)','87th','prime-broker pair-book','The pair IS the crowd — a snap hits both legs at once'],
       ['Short-duration momentum (0DTE complex)','78th','options OI concentration','Gamma cascades intraday; time-stops beat price-stops in this lane'],
       ['Low-vol / defensives','31st','ETF flow share','Uncrowded — but uncrowded is a fact, not a catalyst'],
       ['Value (HML)','22nd','factor-fund AUM','Cheap and ignored; needs a rate regime, not a screener'],
       ['Index-vol sellers (systematic)','66th','vol-fund AUM + VIX futures positioning','The Feb-2018 lesson wearing new clothes — fine until the regime-shift panel below happens again'],
      ].map(r=>'<tr'+(+r[1].slice(0,2)>=85?' style="background:var(--warn-bg)"':'')+'>'+
        '<td><b style="font-size:11px">'+r[0]+'</b></td>'+
        '<td class="r num">'+r[1]+' pctile</td>'+
        '<td class="i2" style="font-size:10px">'+r[2]+' <span class="demo-wm">twin</span></td>'+
        '<td class="i1" style="font-size:10.5px">'+r[3]+'</td>'+
        '</tr>').join(''))+
    '<div class="i2" style="font-size:10.5px;padding:8px 12px">'+U.esc(s.sym)+' sits in the '+crowd+'th-pctile crowd'+(crowd>=85?' — S21 files a crowded-trade advisory on every packet (context, never trigger, CC-13)':' — below the advisory line')+'. '+
    'Crowding never blocks and never confirms: it prices the exit, not the entry.</div>'+
    '<div class="banner info" style="margin:0 12px 10px"><span class="bico">i</span><div>'+
    '<b>Lane boundary:</b> everything in this table is positioning inference, two steps from a primary source — which is exactly why it lives at the BOTTOM of the authority hierarchy. '+
    'The moment a crowding number starts arguing for an entry, re-read the authority ladder above it.'+
    '</div></div>',{flush:true});
  h+=panel('FACTOR BRIEF — six lines, assembled from this page','the committee gets numbers with provenance, or it gets nothing',
    kv('WHAT IT IS','a 6-line factor summary of '+U.esc(s.sym)+' — beta, correlation, vol multiple, momentum, pair tension, posture')+
    kv('WHO CONSUMES IT','S00 Director (packet §14 context) · S33 cluster math · S01 sizing')+
    kv('WHAT IT REFUSES','predictions. The brief describes exposures; it never argues a direction')+
    '<div class="btnrow" style="margin-top:10px">'+
    CMD.btn('factor.brief',null,'gold','◆ Assemble factor brief')+
    CMD.btn('factor.alert',null,'sm','◎ File P2 snapshot to Alert Center')+
    '</div>'+
    '<div class="hr"></div>'+
    kv('POSTURE NOW',(m.beta>=1.25&&crowd>=85?'<b>LONG-BETA · CROWDED</b> — regime must support; reduced size tier, faster time-stops':
      m.beta<0.8?'<b>LOW-BETA IDIOSYNCRATIC</b> — index hedges mis-fit; hedge with the pair, not SPY':
      '<b>MARKET-LIKE</b> — the factor lens adds little here; trade the structure')));
  h+='</div>';

  /* ── signal-vs-context ladder — what each metric is ALLOWED to do ── */
  h+=panel('AUTHORITY LADDER — what each metric may and may not do','a number’s job description, written down, so no metric quietly promotes itself to a trigger',
    tbl(['Metric','Allowed use','Forbidden use','Enforced by'],
      [['Realized vol σ₂₀','sizes stops and position (gate input)','a direction signal — vol does not know which way','S01 sizing formula'],
       ['Beta β','hedge sizing · regime-fit check','conviction — a high β is exposure, not an opinion','S08 posture rules'],
       ['Correlation r','cluster caps — merges names into one bet at ≥0.70','a pairs-trade entry by itself','S33 ⛔ veto '+prov('RISK-031','risk.max_sector_exposure = '+ck('risk.max_sector_exposure')+' %equity — correlated cluster cap')],
       ['Momentum 12-1','leader filter — longs live in leaders','a chase license — momentum is WHERE, structure is WHEN','S09 + entry model (S14)'],
       ['Pair z-score','tension meter · reversion census input','an entry without a structural stop on EACH leg','LAW-001 per leg'],
       ['Skew','tail expectation — sets stop discipline tone','an options-mispricing claim (that needs a vol surface)','S22 options desk'],
       ['Crowding pctile','prices the exit door — advisory at ≥85th','a trigger or a veto, in either direction','CC-13 · S21 lane'],
       ['Max drawdown','the stop-noise floor — stops live beyond it','a support level — a statistic is not structure','S26 5R math'],
      ].map(r=>'<tr>'+
        '<td class="mono" style="font-size:10.5px"><b>'+r[0]+'</b></td>'+
        '<td class="i1" style="font-size:10.5px">'+r[1]+'</td>'+
        '<td class="i2" style="font-size:10.5px">'+r[2]+'</td>'+
        '<td class="i2" style="font-size:10px">'+r[3]+'</td>'+
        '</tr>').join(''))+
    '<div class="i2" style="font-size:10.5px;padding:8px 12px">The ladder is the whole philosophy of this tab in one table: computation earns a metric a seat at the table, never a vote at it. Votes belong to structure, risk math, and the human (LAW-007).</div>',{flush:true});

  /* ── g2: regime shifts + committee usage ── */
  h+='<div class="grid g2">';
  h+=panel('CORRELATION REGIME SHIFTS — when the math breaks','three historical doctrine cases · numbers are period-approximate teaching twins',
    '<div class="banner blk" style="margin-bottom:8px"><span class="bico">⛔</span><div><b>FEB-2018 · “Volmageddon”</b> — the SPX/short-vol correlation regime snapped in one session; inverse-VIX products lost ~90% overnight and short-vol pair books hit z&gt;6.'+
    '<div class="i2" style="font-size:10.5px;margin-top:2px">Lesson: crowding + leverage turns a stable spread into a cliff. The stability WAS the crowd.</div></div></div>'+
    '<div class="banner blk" style="margin-bottom:8px"><span class="bico">⛔</span><div><b>MAR-2020 · COVID liquidation</b> — pairwise equity correlations went to ~0.9 across every sector inside two weeks; diversification failed exactly when it was needed.'+
    '<div class="i2" style="font-size:10.5px;margin-top:2px">Lesson: cluster caps must be sized on stressed correlation, not calm correlation — which is why RISK-031 treats 0.7 as “one bet”, not 0.95.</div></div></div>'+
    '<div class="banner blk"><span class="bico">⛔</span><div><b>2022 · CPI-shock series</b> — stock-bond correlation flipped positive after two decades negative; the 60/40 “hedge” became the exposure.'+
    '<div class="i2" style="font-size:10.5px;margin-top:2px">Lesson: a hedge is a correlation assumption with a maturity date. Re-test it every regime — the rolling-corr canvas above is that test, running.</div></div></div>'+
    '<div class="i2" style="font-size:10.5px;margin-top:8px">Detection doctrine: a 60-bar corr crossing its own 2σ band, or the pair z jumping &gt;1.5σ in 5 bars, files a P2 “regime shift candidate” — awareness, never auto-action.</div>');
  h+=panel('HOW THE COMMITTEE USES THIS — seat by seat','factor data never approves a trade; it sizes, gates, and contextualizes',
    kv('S21 · '+U.esc(SEATBY['S21']?SEATBY['S21'].nm:'Social Sentiment'),'consumes the crowding table — files crowded-trade advisories at ≥85th pctile. Context, never trigger (CC-13); its lane ends at the packet note')+
    kv('S33 · '+U.esc(SEATBY['S33']?SEATBY['S33'].nm:'Portfolio Exposure')+' ⛔','consumes pairwise correlation + cluster sums — rolling corr ≥0.70 merges names into one cluster against the '+ck('risk.max_sector_exposure')+'% cap. VETO seat: this math blocks, no appeal')+
    kv('S17 · '+U.esc(SEATBY['S17']?SEATBY['S17'].nm:'Company Intelligence'),'consumes the ownership/positioning file — 13F drift, insider cadence, short-interest structure — into the ticker record the whole court reads')+
    kv('S09 · '+U.esc(SEATBY['S09']?SEATBY['S09'].nm:'Relative Strength'),'consumes the momentum panel — 12-1 proxy and RS ranks feed leader doctrine: longs in leaders, or a written reason why not')+
    kv('S08 · '+U.esc(SEATBY['S08']?SEATBY['S08'].nm:'Market Regime'),'consumes beta posture — high-beta longs are a risk-on-only instrument; in chop they auto-downgrade to scalp tier')+
    kv('S01 · '+U.esc(SEATBY['S01']?SEATBY['S01'].nm:'Risk Officer')+' ⛔','everything above reduces to gates at sizing time. Factor data has exactly two verbs at this desk: SIZE and BLOCK. “Approve” is not one of them')+
    '<div class="hr"></div>'+
    '<div class="i2" style="font-size:10.5px">Flow: this tab → evidence objects on the bus → seats cite them by ref in votes → the Director integrates by hierarchy. No seat reads this screen; seats read the schema outputs it mirrors.</div>');
  h+='</div>';

  /* ── lens self-test — the math checks itself on every render ── */
  const stChecks=(()=>{
    const out=[];
    const ok=(nm,cond,detail)=>out.push({nm,pass:!!cond,detail});
    ok('corr(x,x) = 1',Math.abs(RSCH_corrOf(m.rr,m.rr)-1)<1e-9,'self-correlation must be exactly 1 — got '+U.fmt(RSCH_corrOf(m.rr,m.rr),6));
    ok('β of bench on itself = 1',Math.abs(RSCH_betaWin(m.bb,m.bb,0,m.n).beta-1)<1e-9,'the regression must recover the identity');
    ok('σ ≥ 0 everywhere',m.sdR>=0&&m.sdB>=0&&m.vol20>=0,'a negative dispersion is a broken kernel');
    ok('|r| ≤ 1',Math.abs(m.corr)<=1+1e-9,'Cauchy–Schwarz holds or the covariance is wrong — got '+U.fmt(m.corr,4));
    ok('pair z recomputes',(()=>{const pv=RSCH_pairz(RSCH_FSTATE.pair);const A=RSCH_closes(pv.p.a,360),B=RSCH_closes(pv.p.b,360);const L2=Math.log(A[A.length-1]/(B[B.length-1]||1e-9));return Math.abs((L2-pv.mean)/pv.sd-pv.z)<1e-9})(),'z from the panel equals (Lₜ−μ)/σ recomputed cold');
    ok('rolling corr bounded',RSCH_rollcorr(m.rr,m.bb,RSCH_FSTATE.win).every(v=>Math.abs(v)<=1+1e-9),'every window inside [−1, 1]');
    ok('maxDD ≤ 0',m.dd<=0,'a drawdown that gains money is a sign error');
    ok('all moments finite',isFinite(m.skew)&&isFinite(m.mom)&&isFinite(m.beta)&&isFinite(m.alpha),'NaN anywhere means a divide slipped its guard');
    ok('momentum window valid',m.iStart>=0&&m.iEnd>m.iStart&&m.iEnd<m.cl.length,'index arithmetic inside the series bounds — got ['+m.iStart+', '+m.iEnd+'] of '+m.cl.length);
    return out;
  })();
  const stPass=stChecks.filter(c2=>c2.pass).length;
  h+=panel('LENS SELF-TEST — '+stPass+'/'+stChecks.length+' invariants hold','a math tab that can be silently wrong is worse than no math tab — these run on every render',
    '<div class="grid g2">'+
    stChecks.map(c2=>kv(c2.nm,(c2.pass?chip('PASS','ch-ok','✓'):chip('FAIL','ch-blk','✕'))+' <span class="i2" style="font-size:10px">'+U.esc(c2.detail)+'</span>')).join('')+
    '</div>'+
    (stPass<stChecks.length
      ?'<div class="banner blk" style="margin-top:8px"><span class="bico">⛔</span><div><b>A kernel invariant failed.</b> Treat every number on this tab as suspect and file it — the same reflex LAW-006 demands of a stale feed.</div></div>'
      :'<div class="i2" style="font-size:10.5px;margin-top:8px">All invariants hold — the kernel that produced every green-tagged number on this page just proved its own identities. '+prov('LAW-015')+' thinking, applied to arithmetic.</div>'));

  /* ── cost of this tab — the budget linter’s favorite screen ── */
  h+=panel('COST OF THIS TAB — $0.00 in model spend, forever','every number here is deterministic arithmetic on series already in memory',
    '<div class="grid g3">'+
    stat('LLM calls this render','0','~'+U.int(6*720+RSCH_PAIRS.length*360)+' returns processed in pure JS — the budget linter has nothing to lint')+
    stat('Series reused','candles()','same cached generator the chart draws — zero incremental data cost')+
    stat('Where models DO spend','committee, post-promotion','factor evidence rides the bus into votes; the votes are the expensive part, and they are bounded '+prov('agents.committee_max_fanout'))+
    '</div>'+
    '<div class="i2" style="font-size:10.5px;margin-top:6px">This is the funnel economics doctrine applied inward: deterministic computation is free attention. Spend it everywhere; spend model tokens only where judgment is genuinely required.</div>');
  return h;
};

/* ═══════════ factor commands ═══════════ */
CMD.define({id:'factor.pair',label:'Switch pair',purpose:'Point the pair lab at another spread — z-score recomputes from both candle series',audit:false,
  run:a=>{
    RSCH_FSTATE.pair=U.clamp(+a||0,0,RSCH_PAIRS.length-1);
    render();
  }});
CMD.define({id:'factor.win',label:'Rolling window',purpose:'Resize the rolling-correlation window — shorter reacts, longer believes',audit:false,
  run:a=>{
    const w=+a;
    if([40,60,90].includes(w))RSCH_FSTATE.win=w;
    render();
  }});
CMD.define({id:'factor.math',label:'Full working',purpose:'Every sum behind the beta — the regression with nothing hidden',audit:false,
  run:()=>{
    const s=RSCH_sym();
    const m=RSCH_metrics(s.sym);
    UI.drawer('<div class="dhead"><span class="dt">Σ REGRESSION WORKING — '+U.esc(s.sym)+' on '+m.bench+'</span><span class="pill">computed from series · n='+m.n+'</span><button class="dx" data-cmd="ui.closeDrawer">ESC</button></div>'+
      '<div class="dbody">'+
      '<div class="code" style="line-height:1.8">'+U.esc(
        'series:   candles('+s.sym+',360) · candles('+m.bench+',360)\n'+
        'returns:  rᵢ = ln(pᵢ/pᵢ₋₁)            n = '+m.n+'\n'+
        'r̄  = '+m.mr.toExponential(4)+'   (mean '+s.sym+' return/bar)\n'+
        'b̄  = '+m.mb.toExponential(4)+'   (mean '+m.bench+' return/bar)\n'+
        'Σ(bᵢ−b̄)(rᵢ−r̄) = '+m.sxy.toExponential(4)+'\n'+
        'Σ(bᵢ−b̄)²      = '+m.sxx.toExponential(4)+'\n'+
        'cov = Σxy/(n−1) = '+m.cov.toExponential(4)+'\n'+
        'var = Σxx/(n−1) = '+m.varB.toExponential(4)+'\n'+
        'β   = cov/var   = '+U.fmt(m.beta,4)+'\n'+
        'α   = r̄ − β·b̄  = '+((m.mr-m.beta*m.mb)).toExponential(4)+'/bar  ('+U.sign(m.alpha,2)+'% ann.)\n'+
        'σᵣ  = '+U.fmt(m.sdR*100,3)+'%/bar · σᵦ = '+U.fmt(m.sdB*100,3)+'%/bar\n'+
        'r   = cov/(σᵣσᵦ) = '+U.fmt(m.corr,4)+' · r² = '+U.fmt(m.r2,4)+'\n'+
        'σ₂₀ = sd(last 20 rᵢ)·√252 = '+U.fmt(m.vol20,2)+'% ann.\n'+
        'maxDD = min(pᵢ/peak − 1)  = '+U.fmt(m.dd,2)+'%\n'+
        'skew = n/((n−1)(n−2))·Σzᵢ³ = '+U.fmt(m.skew,3)+'\n'+
        'mom(12-1) = p['+m.iEnd+']/p['+m.iStart+'] − 1 = '+U.sign(m.mom,2)+'%')+
      '</div>'+
      '<div class="i2" style="font-size:10.5px;margin-top:8px">Honesty notes: sample statistics, not population (n−1). Bars are sessions by convention in DEMO — the √252 is a labeling choice, not a measurement. '+
      'When the live spine is connected the same formulas run on real candles; nothing on this drawer changes shape.</div>'+
      '</div>');
  }});
CMD.define({id:'factor.brief',label:'Assemble factor brief',purpose:'Six lines of factor truth for the current symbol — modal + audit trail',audit:false,
  run:()=>{
    const s=RSCH_sym();
    const m=RSCH_metrics(s.sym);
    const crowd=RSCH_CROWD[s.sym]||Math.round(40+localRng('rsch-crowd-'+s.sym)()*40);
    const pi=s.sym==='NVDA'||s.sym==='AMD'?0:s.sym==='TSLA'?3:s.sym==='QQQ'||s.sym==='SPY'?1:RSCH_FSTATE.pair;
    const pz=RSCH_pairz(pi);
    const posture=m.beta>=1.25&&crowd>=85?'LONG-BETA · CROWDED — regime must support; reduced size tier, faster time-stops'
      :m.beta<0.8?'LOW-BETA IDIOSYNCRATIC — index hedges mis-fit; hedge the pair, not the tape'
      :'MARKET-LIKE — factor lens adds little; the structure is the whole story';
    const lines=[
      '1 · β '+U.fmt(m.beta,2)+' vs '+m.bench+' (n='+m.n+' OLS) — moves '+U.fmt(m.beta,1)+'× the tape; a 1:1 index hedge is mis-sized by construction.',
      '2 · corr r '+U.fmt(m.corr,2)+' · '+RSCH_FSTATE.win+'-bar rolling now '+U.fmt((RSCH_rollcorr(m.rr,m.bb,RSCH_FSTATE.win).slice(-1)[0]||0),2)+' — '+(m.corr>=0.7?'S33 counts this name inside the index cluster: one bet':'diversification credit currently real'),
      '3 · realized σ₂₀ '+U.fmt(m.vol20,1)+'% ann vs '+m.bench+' '+U.fmt(m.volB20,1)+'% — '+U.fmt(m.vol20/(m.volB20||1e-9),1)+'× vol multiple: a size divisor, never a conviction signal.',
      '4 · momentum 12-1 '+U.sign(m.mom,1)+'% · crowding '+crowd+'th pctile (S21'+(crowd>=85?' advisory files on every packet':' below advisory line')+') — late-momentum unwinds are violent.',
      '5 · pair '+pz.p.lbl+' z '+U.sign(pz.z,2)+'σ (μ '+U.fmt(pz.mean,4)+' · σ '+U.fmt(pz.sd,4)+') — '+(Math.abs(pz.z)>=2?'stretched: snap risk is live on both legs':'inside the band: no spread tension'),
      '6 · posture: '+posture,
    ];
    SVR.audit('HUMAN (owner)','factor','Factor brief assembled for '+s.sym+' — β '+U.fmt(m.beta,2)+' · r '+U.fmt(m.corr,2)+' · σ₂₀ '+U.fmt(m.vol20,1)+'% · mom '+U.sign(m.mom,1)+'% · pair z '+U.sign(pz.z,2));
    UI.modal('◆ FACTOR BRIEF — '+U.esc(s.sym),
      '<div class="i2" style="font-size:10.5px;margin-bottom:8px">Lines 1–5 computed from the candle series this session · crowding pctile is a demo twin · logged to the audit ledger.</div>'+
      '<div class="code" style="line-height:1.9">'+lines.map(l=>U.esc(l)).join('\n')+'</div>'+
      '<div class="i1" style="font-size:11px;margin-top:8px">Destination: packet §14 (context evidence). The brief describes exposures — it argues no direction, and it cannot vote.</div>',
      '<button class="btn" data-cmd="ui.closeModal">Close</button><button class="btn gold" data-cmd="factor.export">⤓ Export with metrics</button>');
    UI.toast('Factor brief assembled and audited — 5 of 6 lines computed from the series','gold','FACTOR LENS');
  }});
CMD.define({id:'factor.export',label:'Export factor metrics',purpose:'Download every computed metric with its provenance field',
  run:()=>{
    const s=RSCH_sym();
    const m=RSCH_metrics(s.sym);
    const pz=RSCH_pairz(RSCH_FSTATE.pair);
    const bundle={schema:'rsch.factor_lens.v1',mode:S.mode,sym:s.sym,bench:m.bench,n:m.n,generated:CLOCK.hms()+' ET sim-clock',
      computed_from_series:{beta:m.beta,alpha_ann_pct:m.alpha,corr:m.corr,r2:m.r2,vol20_ann_pct:m.vol20,bench_vol20_ann_pct:m.volB20,
        max_drawdown_pct:m.dd,skew:m.skew,momentum_12_1_pct:m.mom,
        pair:{lbl:pz.p.lbl,mean_log_ratio:pz.mean,sd_log_ratio:pz.sd,z:pz.z},
        rolling_corr_last:RSCH_rollcorr(m.rr,m.bb,RSCH_FSTATE.win).slice(-1)[0]||null,window:RSCH_FSTATE.win},
      demo_twin:{loadings_size_value_quality:true,crowding_pctiles:true},
      note:'computed_from_series values derive from candles() — deterministic seeded in DEMO, real when the live spine is connected. Twins are twins.'};
    const blob=new Blob([JSON.stringify(bundle,null,2)],{type:'application/json'});
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    a.download='ATLAS_factors_'+s.sym+'_demo.json';
    a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href),4000);
    UI.toast('Factor metrics exported — provenance travels with the numbers','','FACTOR LENS');
  }});
CMD.define({id:'factor.hedge',label:'Hedge notional',purpose:'Slide the position notional — the β-hedge math recomputes live',audit:false,
  run:(a,el)=>{
    if(!el)return;
    RSCH_FSTATE.notional=U.clamp(parseInt(el.value,10)||12000,2000,60000);
    render();
  }});
CMD.define({id:'factor.pairmath',label:'Spread working',purpose:'The log-ratio arithmetic plus a reversion census: how often ±2σ actually snapped back, in THIS series',audit:false,
  run:()=>{
    const pz=RSCH_pairz(RSCH_FSTATE.pair);
    const aCl=RSCH_closes(pz.p.a,360),bCl=RSCH_closes(pz.p.b,360);
    /* reversion census: episodes entering |z|≥2, bars until first return to |z|≤0.5 */
    const eps=[];
    let inEp=false,epStart=0;
    for(let i=0;i<pz.zs.length;i++){
      const az=Math.abs(pz.zs[i]);
      if(!inEp&&az>=2){inEp=true;epStart=i}
      else if(inEp&&az<=0.5){eps.push({start:epStart,bars:i-epStart,resolved:true});inEp=false}
    }
    if(inEp)eps.push({start:epStart,bars:pz.zs.length-1-epStart,resolved:false});
    const resolved=eps.filter(e=>e.resolved);
    const avgBars=resolved.length?Math.round(RSCH_mean(resolved.map(e=>e.bars))):null;
    UI.drawer('<div class="dhead"><span class="dt">Σ SPREAD WORKING — '+U.esc(pz.p.lbl)+'</span><span class="pill">computed from both series · n='+pz.n+'</span><button class="dx" data-cmd="ui.closeDrawer">ESC</button></div>'+
      '<div class="dbody">'+
      '<div class="code" style="line-height:1.8">'+U.esc(
        'legs:      candles('+pz.p.a+',360) · candles('+pz.p.b+',360)\n'+
        'last A     = '+U.fmt(aCl[aCl.length-1],2)+'\n'+
        'last B     = '+U.fmt(bCl[bCl.length-1],2)+'\n'+
        'Lₜ = ln(A/B) = '+(Math.log(aCl[aCl.length-1]/(bCl[bCl.length-1]||1e-9))).toFixed(5)+'\n'+
        'μ(L)       = '+pz.mean.toFixed(5)+'\n'+
        'σ(L)       = '+pz.sd.toFixed(5)+'\n'+
        'z = (Lₜ−μ)/σ = '+U.sign(pz.z,3)+'σ')+
      '</div>'+
      panel('REVERSION CENSUS — this series, not folklore','every ±2σ episode and whether it actually came home',
        kv('EPISODES |z| ≥ 2σ','<span class="mono">'+eps.length+'</span> in '+pz.n+' bars')+
        kv('RESOLVED to ≤0.5σ','<span class="mono">'+resolved.length+' of '+eps.length+'</span>'+(eps.length&&!eps[eps.length-1].resolved?' — the current stretch is still open':''))+
        kv('AVG BARS TO REVERT',avgBars==null?'<span class="i2">no resolved episodes — nothing to average, and the desk refuses to invent one</span>':'<span class="mono">'+avgBars+'</span> bars — in-sample, seeded series; a description, not a promise')+
        '<div class="hr"></div>'+
        kv('THE HONEST CAVEAT','census on the series that generated the z is circular by construction. Production runs this on out-of-sample history; DEMO shows the mechanics and says so.'))+
      panel('IF YOU TRADED IT ANYWAY','the desk’s requirements, not suggestions',
        kv('LEGS','two structural stops, one per leg (LAW-001) — the z-score is not an invalidation price')+
        kv('CLUSTER','both legs one bet at S33 '+prov('RISK-031','risk.max_sector_exposure = '+ck('risk.max_sector_exposure')+' %equity — correlated cluster cap'))+
        kv('THE 5R QUESTION','a reversion to the mean pays μ−Lₜ ≈ '+U.fmt(Math.abs(pz.z*pz.sd)*100,1)+'% of ratio — run it through the Trade Builder; if the honest path is sub-'+ck('risk.min_rr')+'R, the answer was NO before the census loaded '+prov('risk.min_rr')))+
      '</div>');
  }});
CMD.define({id:'factor.alert',label:'File factor snapshot',purpose:'Push the current factor state to the Alert Center as a P2 — awareness routing, nothing is asked of anyone',audit:false,
  run:()=>{
    const s=RSCH_sym();
    const m=RSCH_metrics(s.sym);
    const pz=RSCH_pairz(RSCH_FSTATE.pair);
    pushAlert('P2','FACTOR SNAPSHOT '+s.sym+' — β '+U.fmt(m.beta,2)+' · r '+U.fmt(m.corr,2)+' · σ₂₀ '+U.fmt(m.vol20,1)+'% · '+pz.p.lbl+' z '+U.sign(pz.z,2)+'σ','research.factors');
    SVR.audit('HUMAN (owner)','factor','P2 factor snapshot filed for '+s.sym+' — routed to Alert Center with deep-link back to the lens');
    UI.toast('Snapshot filed as P2 — it batches on the '+ck('alerts.p2_batch_min')+'m window and never repeats','','FACTOR LENS');
    render();
  }});
CMD.define({id:'factor.stress',label:'Stress open book ρ→1',purpose:'Re-sum the open positions with every pairwise correlation forced to 1 — the crash-day assumption',audit:false,
  run:()=>{
    const open=POSITIONS.filter(p=>p.fsm==='MANAGING'||p.fsm==='SCALING'||p.fsm==='WORKING');
    if(!open.length){UI.toast('Book is flat — nothing to stress. The cheapest stress test is no positions.','','STRESS');return}
    /* assumption (stated): open risk splits equally across open positions — DEMO has no per-leg risk ledger */
    const per=S.openRiskR/open.length;
    const rets={};
    open.forEach(p=>{rets[p.sym]=rets[p.sym]||RSCH_rets(RSCH_closes(p.sym,360))});
    let sumSq=0,cross=0,crossStress=0;
    const pairs=[];
    for(let i=0;i<open.length;i++){
      sumSq+=per*per;
      for(let j=i+1;j<open.length;j++){
        const rho=open[i].sym===open[j].sym?1:RSCH_corrOf(rets[open[i].sym],rets[open[j].sym]);
        pairs.push({a:open[i].sym,b:open[j].sym,rho});
        cross+=2*rho*per*per;
        crossStress+=2*1*per*per;
      }
    }
    const indep=Math.sqrt(sumSq);
    const realized=Math.sqrt(Math.max(0,sumSq+cross));
    const stressed=Math.sqrt(sumSq+crossStress);
    const cap=ck('risk.max_open_risk_R');
    SVR.audit('HUMAN (owner)','factor','Cluster stress ρ→1 on '+open.length+' open positions: realized-ρ risk '+U.fmt(realized,2)+'R → stressed '+U.fmt(stressed,2)+'R vs cap '+cap+'R');
    UI.modal('⚠ CLUSTER STRESS — every correlation forced to 1',
      '<div class="i2" style="font-size:10.5px;margin-bottom:8px">Assumption, stated: open risk ('+U.fmt(S.openRiskR,2)+'R) splits equally across '+open.length+' open positions — DEMO carries no per-leg risk ledger. Pairwise ρ computed from the candle series.</div>'+
      (pairs.length?tbl(['Pair','>ρ realized','>ρ stressed'],
        pairs.map(p=>'<tr><td class="mono">'+U.esc(p.a)+' / '+U.esc(p.b)+'</td>'+
          '<td class="r num'+(p.rho>=0.7?' dn':'')+'">'+U.fmt(p.rho,2)+'</td>'+
          '<td class="r num dn">1.00</td></tr>').join('')):'')+
      '<div class="grid g3" style="margin-top:8px">'+
      stat('ρ=0 (fantasy)',U.fmt(indep,2)+'R','independence — the number wishful books are sized on')+
      stat('ρ realized',U.fmt(realized,2)+'R','computed from the series — today’s honest number')+
      stat('ρ→1 (crash day)','<span class="'+(stressed>cap?'dn':'')+'">'+U.fmt(stressed,2)+'R</span>','vs '+cap+'R cap '+prov('risk.max_open_risk_R'))+
      '</div>'+
      '<div class="banner '+(stressed>cap?'blk':'info')+'" style="margin-top:8px"><span class="bico">'+(stressed>cap?'⛔':'i')+'</span><div>'+
      (stressed>cap
        ?'<b>On a crash day this book breaches the open-risk cap.</b> MAR-2020 doctrine: correlations go to 1 exactly when you need them not to. Reduce before the tape forces it.'
        :'<b>Even at ρ→1 the book holds inside the cap.</b> That is what the cluster cap is FOR — the stress test passing is the system working, not luck.')+
      '</div></div>',
      '<button class="btn" data-cmd="ui.closeModal">Close</button>');
  }});
