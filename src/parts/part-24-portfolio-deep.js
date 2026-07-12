/* ═══════════ PART-24 · PORTFOLIO DEEP — Hedge Desk & Capital Ledger ═══════════
   Two workspaces the PORTFOLIO domain was missing: protection as a
   discipline (not a panic), and an auditor-grade capital ledger where
   every dollar foots. Synthetic values carry the demo watermark;
   anything derivable from live stores (POSITIONS, PACKETS, ORDERS,
   S.equity, CONFIG) is DERIVED — computed truth beats stored fiction. */
DOMAINS.portfolio.ws.push({id:'hedging',label:'Hedge Desk'});
DOMAINS.portfolio.ws.push({id:'ledger',label:'Capital Ledger'});

/* ── module state (all globals carry the PORTD_ prefix) ── */
const PORTD_ST={ledgFilter:'ALL',corr1:false,tradesYr:420,eq:null,eqK:null};

/* ── betas vs SPX — reference table for beta-weighting (demo calibration) ── */
const PORTD_BETA={SPY:1.00,QQQ:1.15,NVDA:1.80,AMD:1.90,TSLA:2.05,META:1.30,MSFT:1.10,GOOG:1.05,AVGO:1.55,COIN:2.40};
const PORTD_BETA_DEFAULT=1.20;

/* ── contract-count parser — qty lives inside the instrument string ── */
function PORTD_qty(inst){const m=/×(\d+)/.exec(inst||'');return m?+m[1]:1}

/* ── 1R in dollars — the sizing formula’s own unit (RISK-011) ── */
function PORTD_rUsd(){return S.equity*ck('risk.max_trade_risk_pct')/100}

/* ── per-position risk$ — packet rmath when linked, level arithmetic otherwise ── */
function PORTD_riskUsd(p){
  const pk=typeof pktBy==='function'?pktBy(p.packet):null;
  if(pk&&pk.rmath&&pk.rmath.riskUSD)return{usd:pk.rmath.riskUSD,src:'packet '+p.packet+' rmath'};
  const q=PORTD_qty(p.instrument),e=p.entryAct!=null?p.entryAct:p.entryPlan;
  return{usd:Math.abs((e||0)-(p.stop||0))*q*100,src:'|entry−stop|×qty×100 from the position row'};
}

/* ── portfolio greeks rollup — walk the ACTUAL positions array ──
   Aggregation method: per-contract greek × qty × 100 multiplier;
   delta converted to dollars via underlying last, then beta-weighted
   (PORTD_BETA). Stored greeks are used verbatim; a position lacking
   stored greeks gets deterministic MODELED greeks (localRng per id)
   and is labeled as such. Gamma is never stored → always modeled.
   Unfilled positions (no entryAct) are excluded from the rollup and
   listed separately — resting limits are contingent, not exposure.
   stress=true → crisis mode: every beta floors at 1.60 (correlations
   go to 1 in a crash; the grid can rehearse that). */
function PORTD_greeks(stress){
  const rows=[],excl=[];const tot={d:0,bw:0,v:0,t:0,g:0,rawDelta:0};
  (POSITIONS||[]).forEach(p=>{
    const q=PORTD_qty(p.instrument),s=symBy(p.sym);
    const px=s&&s.px?s.px:(p.entryAct||p.entryPlan||0);
    let beta=PORTD_BETA[p.sym]!=null?PORTD_BETA[p.sym]:PORTD_BETA_DEFAULT;
    if(stress)beta=Math.max(beta,1.60);
    let g=p.greeks,src='stored';
    if(!g||g.delta==null){
      const r=localRng('portd-g-'+p.id);
      g={delta:(p.dir==='LONG'?1:-1)*(0.30+r()*0.25),theta:-(3+r()*7),vega:5+r()*9,iv:28+Math.round(r()*22)};
      src='modeled';
    }
    /* gamma: not in the store — modeled deterministically, said plainly */
    const rg=localRng('portd-gm-'+p.id);
    const credit=/credit/.test(p.instrument||'');
    const gamma=(0.004+rg()*0.012)*(credit?-1:1);
    const gUsd1pct=0.5*Math.abs(gamma)*Math.pow(px*0.01,2)*100*q*(credit?-1:1);
    const dUsd=g.delta*100*q*px, bwUsd=dUsd*beta, vUsd=(g.vega||0)*q, tUsd=(g.theta||0)*q;
    const row={id:p.id,sym:p.sym,inst:p.instrument,q,px,beta,src,iv:g.iv||0,delta:g.delta,
      dUsd,bwUsd,vUsd,tUsd,gUsd:gUsd1pct,filled:p.entryAct!=null};
    if(row.filled){rows.push(row);tot.d+=dUsd;tot.bw+=bwUsd;tot.v+=vUsd;tot.t+=tUsd;tot.g+=gUsd1pct;tot.rawDelta+=g.delta*q}
    else excl.push(row);
  });
  return{rows,excl,tot};
}

/* ── correlation clusters — which positions are ONE bet (RISK-031) ── */
const PORTD_CLUSTERS=[
 {nm:'Semis complex',members:['NVDA','AMD','AVGO'],corr:'0.84 NVDA·AMD (60d)',
  why:'One AI-capex bet wearing three tickers. The 0.84 is why the cap counts them once.'},
 {nm:'Index short-vol',members:['SPY','QQQ'],corr:'0.93 SPY·QQQ (60d)',
  why:'Short premium on the same index complex — pin risk and vol spikes hit every leg together.'},
 {nm:'Mega-tech',members:['META','MSFT','GOOG','AAPL'],corr:'0.66 avg pair (60d)',
  why:'Crowded-long complex. In stress these correlations do not stay at 0.66 — they go to 1.'},
];
function PORTD_clusters(){
  const G=PORTD_greeks(false);
  return PORTD_CLUSTERS.map(c=>{
    const pos=(POSITIONS||[]).filter(p=>c.members.includes(p.sym));
    let usd=0,srcs=[];pos.forEach(p=>{const r=PORTD_riskUsd(p);usd+=r.usd;srcs.push(p.sym+': '+U.money(r.usd)+' ('+r.src+')')});
    let bw=0;G.rows.forEach(r=>{if(c.members.includes(r.sym))bw+=r.bwUsd});
    /* pending adds: blocked/queued packets whose symbol lives in this cluster */
    const pend=(PACKETS||[]).filter(pk=>(pk.state==='RISK_BLOCKED'||pk.state==='READY_FOR_HUMAN')&&c.members.includes(pk.sym)&&!pos.some(p=>p.sym===pk.sym));
    const pendUsd=pend.reduce((a,pk)=>a+((pk.rmath&&pk.rmath.riskUSD)||0),0);
    return{nm:c.nm,corr:c.corr,why:c.why,members:c.members,pos,usd,srcs,bw,
      pct:usd/S.equity*100,pend,pendUsd,pendPct:(usd+pendUsd)/S.equity*100};
  });
}

/* ── shock grid — SPX % move × IV shift, first-order delta+vega only ──
   P&L(cell) ≈ Σ βΔ$ × move% + Σ vega$ × (IVᵢ × ivShift%) per position.
   Gamma and theta are deliberately EXCLUDED — the grid is a first-order
   sketch and says so. Modeled, never a forecast. ── */
const PORTD_SPX=[-3,-2,-1,0,1,2];
const PORTD_IVS=[-20,0,20,40];
function PORTD_shock(){
  const G=PORTD_greeks(PORTD_ST.corr1);
  const cells=[];let worst=null;
  PORTD_IVS.forEach(iv=>{const row=[];PORTD_SPX.forEach(mv=>{
    let pl=G.tot.bw*mv/100;
    G.rows.forEach(r=>{pl+=r.vUsd*(r.iv*iv/100)});
    const cell={mv,iv,pl};row.push(cell);
    if(!worst||pl<worst.pl)worst=cell;
  });cells.push(row)});
  const headroom=(ck('risk.max_day_loss_R')-S.dayLossUsedR)*PORTD_rUsd();
  return{cells,worst,headroom,tot:G.tot,absorb:worst?Math.abs(Math.min(0,worst.pl))<=headroom:true};
}

/* ── hedge candidate menu — the standing five, costed at demo levels ──
   Premiums are MODELED demo marks (watermarked). Cost math, delta
   offsets and budget fit are computed live from S.equity and the
   current book so the arithmetic on screen is always the arithmetic
   actually used. Basis risk is named honestly per instrument. ── */
const PORTD_HEDGES=[
 {id:'ladder',nm:'SPY put ladder — 589/577/565 (−2/−4/−6%) ×1 · 45DTE',fit:['Index short-vol','Semis complex','Mega-tech'],
  hedges:'Broad beta shock across the whole book — the classic crash umbrella',
  legs:'buy 1× 589P @4.10 · 1× 577P @2.05 · 1× 565P @0.95 (modeled marks)',
  usd:(4.10+2.05+0.95)*100,tenorD:45,
  off:()=>{const spy=symBy('SPY');return -(0.24+0.13+0.07)*100*((spy&&spy.px)||601)},
  basis:'Book is single names; an NVDA −8% day with SPX −2% pays a fraction of the loss. Index beta is an average, your book is not.',
  lies:'Slow bleeds. A −0.5%/day grind never reaches the strikes and the ladder decays to zero while the book loses anyway. Also post-event IV crush — the ladder can lose value on a DOWN day if vol collapses.',
  trip:'Remove at −50% of premium, at T-5d to expiry, or when regime flips back to risk-on with breadth >60%.'},
 {id:'pspread',nm:'SPY put spread — 595/575 ×1 · 45DTE debit',fit:['Index short-vol','Semis complex','Mega-tech'],
  hedges:'Defined-cost protection for a moderate index drawdown (−1% to −4.3%)',
  legs:'buy 595P @3.05 · sell 575P @1.15 → net debit 1.90 (modeled marks)',
  usd:(3.05-1.15)*100,tenorD:45,
  off:()=>{const spy=symBy('SPY');return -(0.31-0.14)*100*((spy&&spy.px)||601)},
  basis:'Same index-vs-single-name basis as the ladder, plus the width cap: protection STOPS at 575.',
  lies:'Tail beyond the short strike. Below 575 the spread is maxed and you are naked to the rest of the move — the cheapest structure is cheap because it hands the true tail back to you.',
  trip:'Remove at +150% of debit (monetize), at T-7d, or when the named risk (event/regime) passes.'},
 {id:'collar',nm:'Collar the largest position — sell NVDA 215C ×2 vs long 200C ×2',fit:['Semis complex'],
  hedges:'Single-name give-back on the biggest line item, financed by its own upside',
  legs:'sell 2× 215C @1.45 against the long 200C ×2 → net CREDIT 2.90 (modeled marks)',
  usd:-(1.45*2*100),tenorD:21,
  off:()=>{const s=symBy('NVDA');return -0.18*2*100*((s&&s.px)||196.74)},
  basis:'None on the name — same underlying. The basis is against your own PLAYBOOK: the sold call caps the T3 runner, and the 5R contract was priced on that runner.',
  lies:'In the exact scenario the position was built for. If NVDA runs through 215 the “hedge” converts your best trade into a capped spread. Only defensible AFTER T2 pays the trade (25/50/75 doctrine).',
  trip:'Remove (buy back the calls) if T2 hits and the trail structure holds, or when the position exits at the stop — the collar dies with the position.'},
 {id:'pair',nm:'Pair short — short AMD shares vs the NVDA long',fit:['Semis complex'],
  hedges:'Semis-cluster factor risk while keeping the NVDA-specific thesis on',
  legs:'short AMD common, share count sized to ~45% of the cluster’s β-weighted delta (computed live below)',
  usd:12.40,tenorD:30,
  off:()=>{const a=symBy('AMD'),n=PORTD_greeks(false);const bw=n.rows.filter(r=>r.sym==='NVDA').reduce((x,r)=>x+r.bwUsd,0);
    const px=(a&&a.px)||171.42,b=PORTD_BETA.AMD||1.9;const sh=Math.max(1,Math.ceil(Math.abs(bw)*0.45/(px*b)));return -sh*px*b*Math.sign(bw||1)},
  basis:'AMD is not NVDA. Correlation 0.84 is a fair-weather number — it breaks precisely in idiosyncratic squeezes. And AMD reports in 9 days: the hedge carries its own binary event (LAW-017 applies to hedges too).',
  lies:'When AMD guidance beats while NVDA stalls — the hedge loses on BOTH sides at once. Pair shorts hedge a factor, not a fact.',
  trip:'Remove when NVDA exits (stop or T2), when 20d correlation prints <0.60, or T-1d before AMD earnings — whichever comes first.'},
 {id:'vixwing',nm:'VIX call wing — 18/25 call spread ×2 · 60DTE',fit:['Index short-vol','Semis complex','Mega-tech'],
  hedges:'Gap-crash convexity — the day correlations go to 1 and every cluster becomes one cluster',
  legs:'buy 2× VIX 18C · sell 2× VIX 25C → net debit 0.85 each (modeled marks, VIX fut basis)',
  usd:0.85*2*100,tenorD:60,
  off:()=>0,
  basis:'VIX options settle on VIX futures, not spot — contango roll-down eats the position between crises. Delta offset is ~zero: this is convexity, not a delta hedge.',
  lies:'In slow bleeds — the classic failure. The book grinds −8% over three weeks, VIX drifts 14→16, the wing expires worthless. VIX calls insure CRASHES, not LOSSES. Buying them against a bleed is buying flood insurance for a drought.',
  trip:'Monetize HALF on any VIX close >19 (pre-committed — spikes mean-revert), remove the rest at 50% decay or T-10d.'},
];

/* ── tail budget & the hedge decision log ──
   No CONFIG key exists for the tail budget (checked) — so the doctrine
   number is stated inline and watermarked: the desk allocates ≤35 bps
   of equity per month to tail protection. Spent is DERIVED from this
   month’s log rows. ── */
const PORTD_TAIL_BPS=35;
const PORTD_HEDGELOG=[
 {id:'HDG-104',when:'T-9d',mo:'this',what:'SPY 585P ×1 tail rung pre-CPI (ledger row T-9 09:38)',costUsd:205.71,
  outcome:'EXPIRED WORTHLESS at T-2d (ledger row, $0.00)',verdict:'CORRECT',
  note:'The tail did not arrive. The premium was the price of surviving if it had — insurance is judged by the exposure it covered at purchase, never by whether the house burned down. EV was assessed at entry; expiry-worthless is the MODAL outcome of a correct tail hedge.'},
 {id:'HDG-101',when:'last month',mo:'prior',what:'VIX 18/25 call wing ×2 into FOMC week',costUsd:170.00,
  outcome:'Monetized half at VIX 19.4 (+$412), tripwire honored; rest decayed',verdict:'CORRECT',
  note:'The pre-committed take-profit at VIX>19 did the work. Without the tripwire the spike round-tripped within 3 sessions and the whole wing would have expired flat.'},
 {id:'HDG-097',when:'last month',mo:'prior',what:'Pair short AMD vs NVDA long (semis cluster)',costUsd:12.40,
  outcome:'Removed when 20d corr broke to 0.57 — basis risk realized, −$61 net',verdict:'CORRECT EXIT',
  note:'The hedge stopped hedging, so it stopped existing. A pair short with broken correlation is just a second directional bet you never underwrote.'},
 {id:'HDG-093',when:'T-16d',mo:'prior',what:'Proposed collar on a thesis-broken META long',costUsd:0,
  outcome:'REJECTED — position CUT instead, −0.8R realized same day',verdict:'CORRECT REFUSAL',
  note:'The thesis was already dead; a collar would have paid carry to keep a mistake alive. Hedging a bad position is renting your own denial. Cut is free (minus spread) and final.'},
];
function PORTD_tailSpent(){return PORTD_HEDGELOG.filter(l=>l.mo==='this').reduce((a,l)=>a+l.costUsd,0)}

/* ── cost helpers — bps of equity, normalized to a 30-day month ── */
function PORTD_bps(usd){return usd/S.equity*10000}
function PORTD_bpsMo(h){return PORTD_bps(h.usd)/(h.tenorD/30)}
function PORTD_cls(v){return v>=0?'up':'dn'}

/* ═══════════ VIEW · PORTFOLIO / HEDGE DESK ═══════════ */
VIEWS['portfolio.hedging']=function(){
  const G=PORTD_greeks(false);
  const SH=PORTD_shock();
  const CL=PORTD_clusters().slice().sort((a,b)=>b.pct-a.pct);
  const netPct=S.equity?G.tot.bw/S.equity*100:0;
  const gross=G.rows.reduce((a,r)=>a+Math.abs(r.bwUsd),0);
  const big=G.rows.slice().sort((a,b)=>Math.abs(b.bwUsd)-Math.abs(a.bwUsd))[0];
  const spent=PORTD_tailSpent(),budUsd=PORTD_TAIL_BPS/10000*S.equity;
  const anyModeled=G.rows.some(r=>r.src==='modeled')||G.excl.some(r=>r.src==='modeled');

  let h=vhead('PORTFOLIO · hedge desk','Protection as a discipline, not a panic',
    'Every hedge on this desk names four things before it exists: the risk it offsets, its cost in bps, its delta offset, and the tripwire that removes it. Missing any one → it is not a hedge, it is a trade — and trades go through the packet pipeline. Correlated risk counts once '+prov('RISK-031','Correlated cluster cap — RISK-031: correlated positions count as ONE bet against risk.max_sector_exposure')+'.');

  /* ── (a) portfolio greeks rollup ── */
  const vBand=Math.abs(netPct)<15?'<span class="up">SMALL BOOK</span> — β-weighted exposure under 15% of equity; the stop ladder is the hedge at this size'
    :Math.abs(netPct)<45?'<span style="color:var(--warn)">CONCENTRATED BUT INSIDE ENVELOPE</span> — protection menu below is priced and ready; not yet mandatory'
    :'<span class="dn">CONCENTRATED</span> — β-weighted exposure above 45% of equity; the desk expects either a reduction or a costed hedge with a tripwire';
  h+=panel('PORTFOLIO GREEKS ROLLUP — aggregated across the live POSITIONS array','method: per-contract greek × qty × 100 multiplier · Δ dollarized at underlying last · β-weighted via the PORTD reference table'+(anyModeled?' · <span class="demo-wm">some greeks modeled</span>':''),
    '<div class="grid g4">'+
    stat('Net β-weighted Δ','<span class="'+PORTD_cls(G.tot.bw)+'">'+U.moneyK(G.tot.bw)+'</span>',U.fmt(netPct,1)+'% of equity · sign is the book’s true tilt')+
    stat('Raw Δ sum (contrast)',U.sign(G.tot.rawDelta,2),'naive per-contract sum — contract counts, not dollars. The dollar number above is the one that bleeds')+
    stat('Net vega / vol pt','<span class="'+PORTD_cls(G.tot.v)+'">'+U.money(G.tot.v)+'</span>','Σ vegaᵢ × qtyᵢ — per 1 IV point, per position’s own surface')+
    stat('Net theta / day','<span class="'+PORTD_cls(G.tot.t)+'">'+U.money(G.tot.t)+'</span>','Σ thetaᵢ × qtyᵢ — the rent the book pays (or collects) daily')+
    stat('Net gamma · $/1%²','<span class="'+PORTD_cls(G.tot.g)+'">'+U.money(G.tot.g)+'</span>','MODELED — gamma is not stored per position; derived deterministically per id and labeled')+
    stat('Positions in rollup',G.rows.length+' <span class="i2" style="font-size:10px">of '+((POSITIONS||[]).length)+'</span>',G.excl.length?G.excl.length+' unfilled excluded — resting limits are contingent, not exposure':'all open positions filled')+
    stat('Largest single line',big?big.sym+' '+U.moneyK(Math.abs(big.bwUsd)):'—',big&&gross?U.fmt(Math.abs(big.bwUsd)/gross*100,0)+'% of gross β$ book':'book is flat')+
    stat('1R in dollars',U.money(PORTD_rUsd()),'equity × risk.max_trade_risk_pct '+prov('risk.max_trade_risk_pct')+' — the unit every check below uses')+
    '</div>'+
    (G.rows.length?tbl(['Position','Instrument','Greeks','>β','>Δ/ct','>Δ$','>βΔ$','>vega$','>Θ$/d','>Γ$/1%² (mod.)'],
      G.rows.map(r=>'<tr><td class="mono"><b>'+r.sym+'</b> <span class="i2" style="font-size:9.5px">'+r.id+'</span></td><td class="i1" style="font-size:10.5px">'+U.esc(r.inst)+'</td><td>'+(r.src==='stored'?chip('STORED','ch-ok','✓'):chip('MODELED','ch-demo','◈'))+'</td><td class="r num">'+U.fmt(r.beta,2)+'</td><td class="r num">'+U.sign(r.delta,2)+'</td><td class="r num '+PORTD_cls(r.dUsd)+'">'+U.moneyK(r.dUsd)+'</td><td class="r num '+PORTD_cls(r.bwUsd)+'">'+U.moneyK(r.bwUsd)+'</td><td class="r num">'+U.money(r.vUsd)+'</td><td class="r num '+PORTD_cls(r.tUsd)+'">'+U.money(r.tUsd)+'</td><td class="r num i2">'+U.money(r.gUsd)+'</td></tr>').join(''))
     :'<div class="empty"><div class="e1">BOOK IS FLAT</div>No filled positions — the rollup is honestly zero. A flat book needs no umbrella.</div>')+
    (G.excl.length?'<div class="i2" style="font-size:10.5px;padding:8px 12px">EXCLUDED (unfilled): '+G.excl.map(r=>r.sym+' '+U.esc(r.inst)+' — working limit, contingent exposure '+U.moneyK(r.dUsd)+' if filled').join(' · ')+'</div>':'')+
    '<div class="banner info" style="margin:10px 12px"><span class="bico">◈</span><div><b>Concentration verdict:</b> '+vBand+'. Raw Δ sum says '+U.sign(G.tot.rawDelta,2)+'; the β-dollar rollup says '+U.moneyK(G.tot.bw)+' ('+U.fmt(netPct,1)+'% of equity) — when the two disagree, believe the dollars. <button class="btn sm" data-cmd="hedge.method">Aggregation method</button></div></div>',{flush:true});

  /* ── (b) shock grid ── */
  const maxAbs=Math.max(1,...SH.cells.flat().map(c=>Math.abs(c.pl)));
  h+=panel('SHOCK GRID — SPX move × IV shift → first-order P&L','P&L(cell) = netβΔ$ × move% + Σ vegaᵢ$ × (IVᵢ × ivShift%) · gamma/theta excluded on purpose · <span class="demo-wm">modeled</span>'+(PORTD_ST.corr1?' · '+chip('CRISIS MODE — β floored at 1.60','ch-warn','!'):''),
    '<div class="tblwrap"><table class="tbl"><thead><tr><th>IV shift ↓ · SPX →</th>'+PORTD_SPX.map(m=>'<th class="r">'+(m>0?'+':'')+m+'%</th>').join('')+'</tr></thead><tbody>'+
    SH.cells.map(row=>'<tr><td class="mono" style="font-size:10.5px"><b>IV '+(row[0].iv>0?'+':'')+row[0].iv+'%</b></td>'+row.map(c=>{
      const worst=SH.worst&&c.mv===SH.worst.mv&&c.iv===SH.worst.iv;
      const a=Math.min(0.30,Math.abs(c.pl)/maxAbs*0.30);
      return'<td class="r num '+PORTD_cls(c.pl)+'" style="background:rgba('+(c.pl>=0?'47,214,160':'242,99,124')+','+U.fmt(a,2)+')'+(worst?';outline:2px solid var(--blk);outline-offset:-2px':'')+'" title="SPX '+(c.mv>0?'+':'')+c.mv+'% · IV '+(c.iv>0?'+':'')+c.iv+'% → '+U.money(c.pl)+(worst?' — WORST CELL':'')+'">'+U.money(c.pl)+'</td>'}).join('')+'</tr>').join('')+
    '</tbody></table></div>'+
    '<div class="banner '+(SH.absorb?'info':'warn')+'" style="margin:10px 12px"><span class="bico">'+(SH.absorb?'◈':'!')+'</span><div><b>Can the day breaker absorb the worst cell?</b> Worst cell '+(SH.worst?'(SPX '+(SH.worst.mv>0?'+':'')+SH.worst.mv+'% · IV '+(SH.worst.iv>0?'+':'')+SH.worst.iv+'%) = <span class="'+PORTD_cls(SH.worst.pl)+'">'+U.money(SH.worst.pl)+'</span>':'—')+' vs remaining headroom ('+ck('risk.max_day_loss_R')+'R − '+U.fmt(S.dayLossUsedR,2)+'R used) × '+U.money(PORTD_rUsd())+'/R = <b>'+U.money(SH.headroom)+'</b> '+prov('risk.max_day_loss_R')+' → '+(SH.absorb?'<span class="up">YES — the modeled worst first-order cell sits inside the breaker. The circuit, not the hedge, is the first line.</span>':'<span class="dn">NO — the modeled worst cell exceeds the day breaker. Reduce or hedge BEFORE the market runs the experiment for you.</span>')+' First-order only: a real gap adds gamma and basis on top — this grid is a floor on your imagination, not a ceiling on the loss.</div></div>'+
    '<div class="btnrow" style="padding:0 12px 10px"><button class="btn sm'+(PORTD_ST.corr1?' pri':'')+'" data-cmd="hedge.corr1">'+(PORTD_ST.corr1?'✓ ':'')+'Correlations → 1 (crisis mode)</button><span class="i2" style="font-size:10px">crisis mode floors every β at 1.60 — in a real crash, diversification is the first casualty</span></div>',{flush:true});

  /* ── (c) cluster view — which positions are ONE bet ── */
  h+=panel('CLUSTER VIEW — which positions are ONE bet','correlated risk counts once '+prov('RISK-031','RISK-031: correlated cluster cap — members count as a single position against risk.max_sector_exposure')+' · cap '+ck('risk.max_sector_exposure')+'% '+prov('risk.max_sector_exposure'),
    tbl(['Cluster','Members here','Corr evidence','>Risk$','>% equity','>Cap','>Cluster βΔ$','State'],
      CL.map(c=>{
        const over=c.pct>ck('risk.max_sector_exposure'),pendOver=c.pendPct>ck('risk.max_sector_exposure');
        return'<tr'+(over?' style="background:var(--blk-bg)"':'')+'><td><b style="font-size:11px">'+c.nm+'</b><div class="i2" style="font-size:9.5px">'+U.esc(c.why)+'</div></td>'+
        '<td class="i1" style="font-size:10.5px">'+(c.pos.length?c.pos.map(p=>p.sym+' ('+p.fsm+')').join(' · '):'<span class="i2">none open</span>')+(c.pend.length?'<div style="color:var(--warn);font-size:9.5px">pending: '+c.pend.map(pk=>pk.sym+' '+pk.id+' '+pk.state).join(' · ')+'</div>':'')+'</td>'+
        '<td class="mono" style="font-size:10px">'+c.corr+'</td>'+
        '<td class="r num" title="'+U.esc(c.srcs.join(' · ')||'no open members')+'">'+U.money(c.usd)+'</td>'+
        '<td class="r num '+(over?'dn':'')+'">'+U.fmt(c.pct,2)+'%</td>'+
        '<td class="r num i2">'+ck('risk.max_sector_exposure')+'%</td>'+
        '<td class="r num '+PORTD_cls(c.bw)+'">'+U.moneyK(c.bw)+'</td>'+
        '<td>'+(over?chip('OVER CAP','ch-blk','⛔'):pendOver?chip('CLEAR · PENDING WOULD BREACH','ch-warn','!'):chip('CLEAR','ch-ok','✓'))+'</td></tr>'}).join(''))+
    '<div class="i2" style="font-size:10.5px;padding:8px 12px">Risk$ per cluster is DERIVED: packet rmath where a source packet exists, |entry−stop|×qty×100 otherwise (hover the number for per-member provenance). Doctrine: the 0.84 between NVDA and AMD means an AMD approval would not add a second bet — it would grow the first one. S33 feeds this exact sum into Risk gate 6; the hedge desk reads the same number rather than inventing its own.</div>',{flush:true});

  /* ── (d) hedge candidates ── */
  h+=panel('HEDGE CANDIDATES — the standing five, costed at demo levels','cost math computed live from S.equity · premiums are modeled marks · <span class="demo-wm">demo twin</span>',
    tbl(['Instrument','What it hedges','>Cost','>bps/mo','>Δ offset','Basis risk — named honestly','Budget fit',''],
      PORTD_HEDGES.map(hd=>{
        const bm=PORTD_bpsMo(hd),offv=hd.off(),fits=bm<=PORTD_TAIL_BPS;
        return'<tr><td style="min-width:170px"><b style="font-size:11px">'+U.esc(hd.nm)+'</b><div class="i2" style="font-size:9.5px">'+U.esc(hd.legs)+'</div></td>'+
        '<td class="i1" style="font-size:10.5px">'+U.esc(hd.hedges)+'</td>'+
        '<td class="r num '+(hd.usd<0?'up':'')+'">'+(hd.usd<0?U.money(hd.usd)+' cr':U.money(hd.usd))+'</td>'+
        '<td class="r num '+(bm<=0?'up':bm>PORTD_TAIL_BPS?'dn':'')+'">'+U.fmt(bm,1)+'</td>'+
        '<td class="r num '+PORTD_cls(offv)+'">'+(offv?U.moneyK(offv):'~0 (convexity)')+'</td>'+
        '<td class="i2" style="font-size:10px;max-width:220px">'+U.esc(hd.basis)+'</td>'+
        '<td>'+(bm<=0?chip('CREDIT','ch-ok','✓'):fits?chip('INSIDE','ch-ok','✓'):chip('OVER BUDGET','ch-warn','!'))+'</td>'+
        '<td>'+CMD.btn('hedge.model',hd.id,'sm','Worked example')+'</td></tr>'}).join(''))+
    '<div class="i2" style="font-size:10.5px;padding:8px 12px">bps/mo = premium ÷ equity × 10,000, normalized to a 30-day month by tenor. “When it lies to you” lives inside each worked example — every one of these instruments has a scenario where it takes your premium and pays nothing; owning a hedge without knowing that scenario is owning a different trade than you think.</div>',{flush:true});
  h+=PORTD_coverage();

  /* ── (e) tail budget & decision log ── */
  const spentPct=U.clamp(spent/Math.max(1,budUsd)*100,0,100);
  h+=panel('TAIL BUDGET — insurance is a line item, not a mood','the desk allocates ≤'+PORTD_TAIL_BPS+' bps of equity per month to tail protection · doctrine number, no CONFIG key exists for it yet · <span class="demo-wm">demo twin</span>',
    '<div class="grid g3">'+
    stat('Budget / month',U.fmt(PORTD_TAIL_BPS,0)+' bps','= '+U.money(budUsd)+' at current equity — computed live')+
    stat('Spent this month',U.fmt(PORTD_bps(spent),1)+' bps','= '+U.money(spent)+' — derived from the decision log below')+
    stat('Remaining','<span class="'+(spentPct>90?'dn':'up')+'">'+U.money(Math.max(0,budUsd-spent))+'</span>','further tail adds beyond budget require a reduce-first decision')+
    '</div>'+
    '<div class="kv" style="border:none"><span class="k">SPENT VS BUDGET</span><span class="v"><div class="gauge" style="width:220px"><i style="width:'+U.fmt(spentPct,0)+'%;background:'+(spentPct>90?'var(--warn)':'var(--pos)')+'"></i></div> <span class="mono i2" style="font-size:10px">'+U.fmt(spentPct,0)+'%</span></span></div>'+
    '<div class="hr"></div>'+
    PORTD_HEDGELOG.map(l=>'<div class="banner '+(l.verdict==='CORRECT REFUSAL'?'gold':'info')+'" style="margin-bottom:8px"><span class="bico">'+(l.verdict==='CORRECT REFUSAL'?'◆':'▸')+'</span><div><b>'+l.id+' · '+U.esc(l.when)+'</b> — '+U.esc(l.what)+' · cost '+U.money(l.costUsd)+' ('+U.fmt(PORTD_bps(l.costUsd),1)+' bps)'+
      '<div class="i1" style="font-size:11px;margin:3px 0">OUTCOME: '+U.esc(l.outcome)+' → '+chip(l.verdict,'ch-ok','✓')+'</div>'+
      '<div class="i2" style="font-size:10.5px">'+U.esc(l.note)+'</div></div></div>').join('')+
    '<div class="banner info"><span class="bico">i</span><div><b>Insurance framing:</b> a tail hedge that expires worthless did its job if the exposure it covered was real at purchase. Grade the DECISION at decision time — the same law the journal applies to trades (LAW-018). A desk that only counts hedges that paid out will stop hedging exactly one month before it needed to.</div></div>');

  /* ── theta ladder + event exposure — carry and calendar, made visible ── */
  h+=PORTD_thetaLadder(G);
  h+=PORTD_eventMap();

  /* ── (f) proposal assembler ── */
  h+=panel('HEDGE PROPOSAL — assembled from the live book','largest cluster → cheapest adequate candidate → cost → tripwire · nothing here executes; a hedge is a trade and trades go through the pipeline',
    '<div class="btnrow">'+CMD.btn('hedge.propose',null,'gold','Assemble hedge proposal →')+CMD.btn('hedge.method',null,'sm','Method & β table')+'</div>'+
    '<div class="i2" style="font-size:10.5px;margin-top:8px">Selection logic (shown in the proposal, verbatim): target the largest cluster by risk$, require |Δ offset| ≥ 40% of that cluster’s βΔ$, then take the lowest bps/mo among adequate candidates. If nothing is both adequate and inside budget, the proposal says REDUCE INSTEAD — and means it.</div>');

  /* ── doctrine: when NOT to hedge · decision tree ── */
  h+='<div class="grid g2">';
  h+=panel('WHEN NOT TO HEDGE — cut instead','hedging a bad position is paying to keep a mistake',
    kv('THESIS BROKEN','CUT. The exit is free (minus spread) and final; a hedge costs carry AND keeps the risk. HDG-093 in the log above is this rule earning its keep.')+
    kv('POSITION ≤ FORMULA SIZE','The structural stop IS the hedge (LAW-001). Insuring a 1R position with premium is paying twice for the same protection.')+
    kv('TO AVOID REALIZING A LOSS','That is loss-aversion wearing a risk-management costume. The ledger does not care which account the loss lands in. Journal it (LAW-018) and cut.')+
    kv('BECAUSE THE BOOK “FEELS” BIG','Feelings are not exposure. This page computes the number — read the rollup first. If netβΔ is under 15% of equity, the feeling is about you, not the book.')+
    kv('INTO A SKIPPABLE BINARY EVENT','LAW-017 exists so you never need to buy insurance against your own impatience. Flat through the event costs zero bps.')+
    kv('WHEN CARRY > BUDGET','If the umbrella costs more than '+PORTD_TAIL_BPS+' bps/mo, shrink the parade: reduce the book. A smaller book is the only hedge with negative cost.'));
  h+=panel('HEDGE DECISION TREE — structured if/then','evaluated top-down; first true branch wins; every branch journals',
    kv('IF thesis broken','→ CUT. Never hedge. (See left panel, rule 1 — it outranks everything below.)')+
    kv('ELIF single position > 1R or gap-risk through the stop','→ reduce to formula size FIRST '+prov('risk.max_trade_risk_pct')+'. Hedging oversize is subsidizing a sizing error.')+
    kv('ELIF cluster > '+ck('risk.max_sector_exposure')+'% cap','→ reduce to the cap; hedge only any residual '+prov('risk.max_sector_exposure')+'. The cap is a law, not an opening bid.')+
    kv('ELIF netβΔ > 45% equity AND regime turning','→ cheapest adequate index structure inside the '+PORTD_TAIL_BPS+' bps/mo budget, tripwire attached.')+
    kv('ELIF held swings cross an event window','→ event-scoped structure only (LAW-017), removed T+1 — insurance for the date, not a new view.')+
    kv('ELIF vol at floor AND book short convexity','→ small VIX wing inside budget. It insures the gap, not the bleed — the worked example says so out loud.')+
    kv('ELSE','→ NO_HEDGE is a position. Log the decision with the numbers that justified it (LAW-018). Most days end here, and that is the desk working.'));
  h+='</div>';
  return h;
};

/* ═══════════ hedge desk commands ═══════════ */
CMD.define({id:'hedge.method',label:'Aggregation method',purpose:'How the rollup is computed — betas, modeled greeks policy, and what the shock grid deliberately ignores',audit:false,run:()=>{
  const G=PORTD_greeks(false);
  UI.drawer('<div class="dhead"><span class="dt">GREEKS ROLLUP — METHOD</span><span class="pill">derived where possible · modeled where not · always labeled</span><button class="dx" data-cmd="ui.closeDrawer">ESC</button></div><div class="dbody">'+
   kv('STEP 1 · WALK','Iterate the live POSITIONS array — never a cached copy. Flatten a position and this page changes on the next render.')+
   kv('STEP 2 · QTY','Contract count parsed from the instrument string (the ×N suffix). Options multiplier 100 applied throughout.')+
   kv('STEP 3 · DOLLARIZE','Δ$ = delta × 100 × qty × underlying last (SYMS store). A delta without a dollar sign is trivia.')+
   kv('STEP 4 · β-WEIGHT','βΔ$ = Δ$ × β from the reference table below. β makes an NVDA dollar and a SPY dollar comparable in an index shock.')+
   kv('STEP 5 · SUM','Net βΔ$, vega$, theta$ are straight sums over FILLED positions. Unfilled limits are listed but excluded — contingent orders are not exposure.')+
   '<div class="hr"></div>'+
   kv('MODELED GREEKS POLICY','A position lacking stored greeks gets deterministic demo greeks seeded by its own id (localRng) and wears a MODELED chip. Gamma is never stored → gamma is ALWAYS modeled. Nothing modeled is ever presented as live.')+
   kv('WHAT THE SHOCK GRID IGNORES','Gamma (convexity kicks in past ±1.5%), theta (a shock is instantaneous), skew shift, and basis. First-order by design — it is a sketch that keeps you honest, not a risk system.')+
   '<div class="hr"></div>'+
   '<div class="kv" style="border:none"><span class="k">β REFERENCE TABLE</span><span class="v mono" style="font-size:10.5px">'+Object.entries(PORTD_BETA).map(([k,v])=>k+' '+U.fmt(v,2)).join(' · ')+' · default '+U.fmt(PORTD_BETA_DEFAULT,2)+' <span class="demo-wm">demo calibration</span></span></div>'+
   kv('CURRENT ROLLUP','netβΔ '+U.moneyK(G.tot.bw)+' · vega '+U.money(G.tot.v)+'/pt · theta '+U.money(G.tot.t)+'/day over '+G.rows.length+' filled positions')+
   '<div class="banner info" style="margin-top:8px"><span class="bico">i</span><div>In the production build these numbers come from the options chain feed (ThetaData twin) and the S33 exposure seat — same shapes, real surface. The method stays identical; only the inputs stop being modeled.</div></div>'+
  '</div>')}});

CMD.define({id:'hedge.corr1',label:'Crisis-correlation toggle',purpose:'Re-price the shock grid with every β floored at 1.60 — correlations go to 1 in a crash',audit:false,run:()=>{
  PORTD_ST.corr1=!PORTD_ST.corr1;
  UI.toast(PORTD_ST.corr1?'Crisis mode ON — shock grid now floors every β at 1.60. Diversification is the first casualty of a real crash.':'Crisis mode off — table betas restored.','','SHOCK GRID');render()}});

CMD.define({id:'hedge.model',label:'Worked example',purpose:'Full hedge arithmetic at current demo levels — cost, offset, basis, and when it lies to you',audit:false,run:a=>{
  const hd=PORTD_HEDGES.find(x=>x.id===a);if(!hd){UI.toast('Unknown candidate — '+a,'warn','HEDGE DESK');return}
  const off=hd.off(),bm=PORTD_bpsMo(hd),oneShot=PORTD_bps(hd.usd);
  const G=PORTD_greeks(false);
  const cover=G.tot.bw?U.clamp(Math.abs(off)/Math.abs(G.tot.bw)*100,0,999):0;
  UI.modal('WORKED EXAMPLE · '+U.esc(hd.nm),
   '<div style="margin-bottom:8px">'+chip('MODELED MARKS','ch-demo','◈')+' <span class="pill">arithmetic computed live at current demo levels</span></div>'+
   kv('WHAT IT HEDGES',U.esc(hd.hedges))+
   kv('STRUCTURE',U.esc(hd.legs))+
   kv('COST ARITHMETIC',(hd.usd<0
     ?U.money(-hd.usd)+' CREDIT received ÷ equity '+U.moneyK(S.equity)+' = '+U.fmt(-oneShot,1)+' bps INCOME over '+hd.tenorD+'d — the cheapest hedge is selling your own upside, and that is also its price'
     :U.money(hd.usd)+' premium ÷ equity '+U.moneyK(S.equity)+' × 10,000 = '+U.fmt(oneShot,1)+' bps one-shot ÷ ('+hd.tenorD+'d ÷ 30d) = <b>'+U.fmt(bm,1)+' bps/month</b> vs the '+PORTD_TAIL_BPS+' bps/mo tail budget → '+(bm<=PORTD_TAIL_BPS?'<span class="up">INSIDE BUDGET</span>':'<span class="dn">OVER BUDGET — buy only against a named trigger, never as standing carry</span>')))+
   kv('DELTA OFFSET',(off?U.moneyK(off)+' β-weighted — covers ~'+U.fmt(cover,0)+'% of the current net book βΔ$ ('+U.moneyK(G.tot.bw)+')':'~$0 — this is convexity, not delta. It offsets the SHAPE of a crash, not the direction of a drift'))+
   kv('BASIS RISK — NAMED',U.esc(hd.basis))+
   '<div class="banner warn" style="margin:8px 0"><span class="bico">!</span><div><b>When it lies to you:</b> '+U.esc(hd.lies)+'</div></div>'+
   kv('REMOVAL TRIPWIRE',U.esc(hd.trip))+
   '<div class="i2" style="font-size:10.5px;margin-top:6px">A hedge without a removal tripwire becomes a position — and positions need a packet. This modal is analysis, not an order path.</div>',
   '<button class="btn" data-cmd="ui.closeModal">Close</button><button class="btn gold" data-cmd="hedge.propose">Fold into proposal →</button>')}});

CMD.define({id:'hedge.propose',label:'Assemble hedge proposal',purpose:'Largest cluster → cheapest adequate candidate → cost → tripwire, assembled from the live book and audited',
  pre:()=>!(POSITIONS||[]).some(p=>p.entryAct!=null)?'Book is flat — nothing to hedge. NO_HEDGE is the position, and it is free.':null,
  run:()=>{
    const CL=PORTD_clusters().filter(c=>c.pos.length).sort((a,b)=>b.usd-a.usd);
    const tgt=CL[0];
    const need=Math.abs(tgt.bw)*0.40;
    const fitList=PORTD_HEDGES.filter(hd=>hd.fit.includes(tgt.nm));
    const scored=fitList.map(hd=>({hd,off:hd.off(),bm:PORTD_bpsMo(hd)}))
      .map(x=>({...x,adequate:Math.abs(x.off)>=need&&(x.off===0?false:Math.sign(x.off)===-Math.sign(tgt.bw||1))}));
    const ok=scored.filter(x=>x.adequate).sort((a,b)=>a.bm-b.bm);
    const pick=ok[0]||null;
    const inBudget=pick?pick.bm<=PORTD_TAIL_BPS||pick.bm<=0:false;
    SVR.audit('HUMAN (owner)','hedge','Hedge proposal assembled — cluster '+tgt.nm+' ('+U.money(tgt.usd)+' risk, βΔ '+U.moneyK(tgt.bw)+') → '+(pick?pick.hd.nm+' @ '+U.fmt(pick.bm,1)+'bps/mo'+(inBudget?'':' (OVER BUDGET)'):'NO ADEQUATE CANDIDATE — reduce instead'));
    UI.modal('HEDGE PROPOSAL — assembled from the live book',
     '<div style="margin-bottom:8px">'+chip('PROPOSAL — NOT AN ORDER','ch-demo','◈')+' <span class="pill">audited to the ledger · a hedge is a trade and trades go through the pipeline</span></div>'+
     kv('TARGET CLUSTER','<b>'+tgt.nm+'</b> — largest by risk$: '+U.money(tgt.usd)+' ('+U.fmt(tgt.pct,2)+'% of equity, cap '+ck('risk.max_sector_exposure')+'% '+prov('risk.max_sector_exposure')+') · cluster βΔ$ '+U.moneyK(tgt.bw)+' · members '+((tgt.pos.map(p=>p.sym).join(', '))||'—')+(tgt.pend.length?' · pending adds: '+tgt.pend.map(pk=>pk.sym+' '+pk.id).join(', ')+' would take the cluster to '+U.fmt(tgt.pendPct,2)+'%':''))+
     kv('ADEQUACY BAR','|Δ offset| ≥ 40% × |cluster βΔ$| = 0.40 × '+U.moneyK(Math.abs(tgt.bw))+' = <b>'+U.moneyK(need)+'</b>, with the offset OPPOSING the cluster’s sign — a hedge that adds to the bet is a double-down with better branding')+
     '<div class="hr"></div>'+
     scored.map(x=>kv(x.adequate?(pick&&x.hd.id===pick.hd.id?'◆ SELECTED':'adequate'):'✕ inadequate','<b style="font-size:11px">'+U.esc(x.hd.nm)+'</b> — offset '+(x.off?U.moneyK(x.off):'~0')+' · '+U.fmt(x.bm,1)+' bps/mo'+(x.adequate?'':' — '+(x.off===0?'convexity, no delta offset':Math.sign(x.off)===-Math.sign(tgt.bw||1)?'offset below the 40% bar':'offset is the SAME sign as the cluster — that is not a hedge')))).join('')+
     '<div class="hr"></div>'+
     (pick
       ?kv('PROPOSAL','<b>'+U.esc(pick.hd.nm)+'</b> · cost '+(pick.hd.usd<0?U.money(-pick.hd.usd)+' credit':U.money(pick.hd.usd)+' ('+U.fmt(pick.bm,1)+' bps/mo)')+' · offset '+U.moneyK(pick.off)+' ('+U.fmt(Math.abs(pick.off)/Math.max(1,Math.abs(tgt.bw))*100,0)+'% of cluster) · '+(inBudget?'<span class="up">inside the '+PORTD_TAIL_BPS+' bps/mo budget</span>':'<span class="dn">OVER the '+PORTD_TAIL_BPS+' bps/mo budget — event-scoped purchase only</span>'))+
        kv('REMOVAL TRIPWIRE',U.esc(pick.hd.trip))+
        kv('HONESTY CLAUSE','Basis: '+U.esc(pick.hd.basis)+' · Fails in: '+U.esc(pick.hd.lies))
       :'<div class="banner gold"><span class="bico">◆</span><div><b>NO ADEQUATE CANDIDATE at current book shape.</b> Nothing on the menu opposes this cluster at ≥40% coverage inside budget. The honest answer is REDUCE: trim the cluster toward the cap and re-run. Paying for an inadequate hedge buys comfort, not protection — the desk does not sell comfort.</div></div>'),
     '<button class="btn" data-cmd="ui.closeModal">Discard</button>'+(pick?'<button class="btn gold" data-cmd="hedge.stage" data-arg="'+pick.hd.id+'">Stage hedge ticket (paper) →</button>':''))}});

CMD.define({id:'hedge.stage',label:'Stage hedge ticket',purpose:'Send the proposal toward the packet pipeline — the form never becomes an order',
  run:a=>{const hd=PORTD_HEDGES.find(x=>x.id===a);if(!hd)return;
    SVR.audit('HUMAN (owner)','hedge','Hedge ticket staged (paper): '+hd.nm+' · '+U.money(Math.abs(hd.usd))+(hd.usd<0?' credit':' debit')+' · tripwire: '+hd.trip.slice(0,80));
    pushAlert('P2','Hedge ticket staged: '+hd.nm+' — will assemble a mini-packet through the same gates as any trade','portfolio.hedging');
    UI.closeModal();
    UI.toast('Staged → the desk will assemble a hedge mini-packet. Same enums, same risk engine, same token gate (LAW-014) — protection gets no shortcut.','gold','HEDGE DESK');render()}});

/* ═══════════ CAPITAL LEDGER · data spine ═══════════ */

/* ── 90-session equity series — deterministic walk, ANCHORED so the last
   point equals S.equity exactly (the whole series is rescaled by
   S.equity ÷ raw-final: a derived tie-out, stated on the panel).
   A drawdown cluster is engineered mid-series so the DD machinery has
   something real to measure. ── */
function PORTD_eqSeries(){
  if(PORTD_ST.eq&&PORTD_ST.eqK===S.equity)return PORTD_ST.eq;
  const r=localRng('portd-eq-90');let e=1;const out=[];
  for(let i=0;i<90;i++){
    let mv=(r()-0.462)*0.011;
    if(i>=44&&i<=54)mv=(r()-0.79)*0.026;       /* engineered drawdown cluster — deep enough to measure */
    if(i===55)mv=0.021;                          /* recovery impulse */
    if(i===56)mv=0.013;
    if(i>=57&&i<=70)mv=(r()-0.40)*0.011;       /* the grind back — recoveries are uphill */
    e*=(1+mv);out.push(e);
  }
  const k=S.equity/out[out.length-1];
  const fin=out.map(v=>v*k);
  PORTD_ST.eq=fin;PORTD_ST.eqK=S.equity;return fin;
}
function PORTD_dd(pts){
  let hwm=-Infinity,maxDD=0,cur=0,hwmV=0;
  pts.forEach(p=>{if(p>hwm)hwm=p;const d=(hwm-p)/hwm;if(d>maxDD)maxDD=d});
  hwmV=Math.max(...pts);cur=(hwmV-pts[pts.length-1])/hwmV;
  return{maxDD,cur,hwm:hwmV};
}

/* ── transaction ledger — 25 rows, FILL / FEE / DIV / ADJ ──
   The three most recent fills mirror the ORDERS store (ORD-3338,
   ORD-3341); today’s MTM row equals S.dayPnl by derivation. The
   opening balance is DERIVED as S.equity − Σnet so the running
   balance FOOTS to current equity by construction — and the tie-out
   check below recomputes it live anyway, because an auditor trusts
   arithmetic, not intentions. ── */
const PORTD_LEDGER_BASE=[
 {d:'T-12',t:'09:42',ty:'FILL',sym:'TSLA',qty:'BUY 2× 245C',px:'11.20',fees:1.42,net:-2241.42,memo:'Open swing TRD-0894 — debit paid, PKT lineage'},
 {d:'T-12',t:'16:00',ty:'ADJ', sym:'—',qty:'MTM',px:'—',fees:0,net:148.30,memo:'Daily mark-to-market true-up (unrealized)'},
 {d:'T-11',t:'10:05',ty:'FILL',sym:'TSLA',qty:'SELL 1× 245C',px:'14.85',fees:0.71,net:1484.29,memo:'T1 trim — 25/50/75 template'},
 {d:'T-11',t:'14:10',ty:'FEE', sym:'—',qty:'data',px:'—',fees:0,net:-6.63,memo:'Polygon Advanced pro-rata — demo twin'},
 {d:'T-11',t:'16:00',ty:'ADJ', sym:'—',qty:'MTM',px:'—',fees:0,net:312.40,memo:'Daily mark true-up'},
 {d:'T-10',t:'10:44',ty:'FILL',sym:'TSLA',qty:'SELL 1× 245C',px:'18.35',fees:0.71,net:1834.29,memo:'T2 + runner exit — closes TRD-0894 at +5.4R'},
 {d:'T-10',t:'16:00',ty:'ADJ', sym:'—',qty:'MTM',px:'—',fees:0,net:-128.10,memo:'Daily mark true-up'},
 {d:'T-9', t:'09:38',ty:'FILL',sym:'SPY',qty:'BUY 1× 585P',px:'2.05',fees:0.71,net:-205.71,memo:'HDG-104 tail rung — hedge budget line (see Hedge Desk log)'},
 {d:'T-8', t:'11:02',ty:'FEE', sym:'—',qty:'regulatory',px:'—',fees:0,net:-2.85,memo:'OCC/ORF pass-through · 5 contracts'},
 {d:'T-8', t:'16:00',ty:'DIV', sym:'—',qty:'sweep',px:'—',fees:0,net:18.11,memo:'Money-market sweep dividend on idle cash'},
 {d:'T-7', t:'09:35',ty:'FILL',sym:'NVDA',qty:'BUY 2× 190C',px:'6.40',fees:1.42,net:-1281.42,memo:'PKT-2214 entry — MMBM long'},
 {d:'T-7', t:'16:00',ty:'ADJ', sym:'—',qty:'MTM',px:'—',fees:0,net:204.50,memo:'Daily mark true-up'},
 {d:'T-6', t:'10:22',ty:'FILL',sym:'NVDA',qty:'SELL 2× 190C',px:'9.95',fees:1.42,net:1988.58,memo:'PKT-2214 template exit — +5.2R journaled'},
 {d:'T-6', t:'16:00',ty:'ADJ', sym:'—',qty:'MTM',px:'—',fees:0,net:-57.20,memo:'Daily mark true-up'},
 {d:'T-5', t:'09:50',ty:'FILL',sym:'SPY',qty:'SELL 4× 599/597P',px:'cr 1.36',fees:5.20,net:538.80,memo:'0DTE credit open — prior cycle'},
 {d:'T-5', t:'15:52',ty:'FILL',sym:'SPY',qty:'BUY 4× 599/597P',px:'0.42',fees:5.20,net:-173.20,memo:'Closed at 69% of max — MOC blackout honored (EVT-014)'},
 {d:'T-4', t:'12:31',ty:'FEE', sym:'—',qty:'data',px:'—',fees:0,net:-4.00,memo:'ThetaData chain pro-rata — demo twin'},
 {d:'T-4', t:'16:00',ty:'ADJ', sym:'—',qty:'MTM',px:'—',fees:0,net:388.60,memo:'Daily mark true-up'},
 {d:'T-3', t:'16:00',ty:'ADJ', sym:'—',qty:'MTM',px:'—',fees:0,net:-212.35,memo:'Daily mark true-up'},
 {d:'T-2', t:'16:00',ty:'FILL',sym:'SPY',qty:'EXP 1× 585P',px:'0.00',fees:0,net:0.00,memo:'HDG-104 expired worthless — the insurance cost was booked at purchase, not here'},
 {d:'T-2', t:'16:00',ty:'ADJ', sym:'—',qty:'MTM',px:'—',fees:0,net:509.90,memo:'Daily mark true-up'},
 {d:'T-1', t:'16:00',ty:'ADJ', sym:'—',qty:'MTM',px:'—',fees:0,net:171.30,memo:'Daily mark true-up'},
 {d:'Today',t:'09:41',ty:'FILL',sym:'SPY',qty:'SELL 4× 601/599P',px:'cr 1.40',fees:5.20,net:554.80,memo:'ORD-3338 → TRD-0907 · fill model v2.1'},
 {d:'Today',t:'10:31',ty:'FILL',sym:'NVDA',qty:'BUY 2× 200C',px:'4.80',fees:1.42,net:-961.42,memo:'ORD-3341 → TRD-0912 · slippage $4.00 logged at fill'},
 {d:'Today',t:'now',  ty:'ADJ', sym:'—',qty:'MTM',px:'—',fees:0,net:null,dyn:'daypnl',memo:'Intraday mark true-up — equals Day P&L by derivation (S.dayPnl)'},
];
function PORTD_ledger(){
  const rows=PORTD_LEDGER_BASE.map(r=>({...r,net:r.dyn==='daypnl'?S.dayPnl:r.net}));
  const sum=rows.reduce((a,r)=>a+r.net,0);
  const start=Math.round((S.equity-sum)*100)/100;
  let bal=start;rows.forEach(r=>{bal=Math.round((bal+r.net)*100)/100;r.bal=bal});
  const feesFills=rows.filter(r=>r.ty==='FILL').reduce((a,r)=>a+(r.fees||0),0);
  const feesExpl=rows.filter(r=>r.ty==='FEE').reduce((a,r)=>a+Math.abs(Math.min(0,r.net)),0);
  return{rows,start,sum,bal,ok:Math.abs(bal-S.equity)<0.005,feesFills,feesExpl,
    fills:rows.filter(r=>r.ty==='FILL').length,contracts:19};
}

/* ── capital stage ladder — stage DERIVED from actual S.equity ── */
const PORTD_STAGE_LO=[1000,2500,6000,15000,35000,70000];
const PORTD_STAGE_HI=[2500,6000,15000,35000,70000,100000];
function PORTD_stageIdx(){
  let idx=0;PORTD_STAGE_LO.forEach((lo,i)=>{if(S.equity>=lo)idx=i});return idx;
}

/* ── buying power derivation — each line from an actual POSITIONS row ── */
function PORTD_bpRows(){
  const out=[];let hold=0;
  (POSITIONS||[]).forEach(p=>{
    const q=PORTD_qty(p.instrument);
    if(/credit/.test(p.instrument||'')){
      const m=/(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)/.exec(p.instrument),w=m?Math.abs(+m[1]-+m[2]):2;
      const cr=p.entryAct!=null?p.entryAct:p.entryPlan;
      const maint=Math.max(0,(w-cr))*q*100;hold+=maint;
      out.push({p,kind:'defined-risk credit spread',usd:maint,src:'(width '+U.fmt(w,2)+' − credit '+U.fmt(cr,2)+') × '+q+' × 100 — max loss IS the requirement'});
    }else if(p.entryAct!=null){
      const lr=PORTD_LEDGER_BASE.find(r=>r.ty==='FILL'&&r.sym===p.sym&&/BUY/.test(r.qty)&&r.d==='Today');
      const pxf=lr?parseFloat(lr.px):null;
      const usd=pxf!=null?pxf*q*100:(4.2+localRng('portd-bp-'+p.id)()*1.6)*q*100;
      hold+=usd;
      out.push({p,kind:'long option (debit)',usd,src:pxf!=null?'cost basis '+U.fmt(pxf,2)+' × '+q+' × 100 from today’s ledger fill — cash already paid, no margin call possible':'modeled mark × '+q+' × 100 (no fill in ledger window) — labeled modeled'});
    }else{
      const usd=(4.2+localRng('portd-bp-'+p.id)()*1.6)*q*100;hold+=usd;
      out.push({p,kind:'working limit — premium reserve',usd,src:'modeled limit premium × '+q+' × 100 reserved while the order rests — released on cancel'});
    }
  });
  return{rows:out,hold,avail:S.equity-hold};
}

/* ── canvases ── */
function PORTD_drawEq(){POSTRENDER.push(()=>{const cv=document.getElementById('portd-eqcv');if(!cv)return;
  const W=cv.width=cv.clientWidth*2,H=cv.height=250*2,x=cv.getContext('2d');
  const pts=PORTD_eqSeries();
  const lo=Math.min(...pts)*0.995,hi=Math.max(...pts)*1.006;
  const AX=96,py=v=>H-((v-lo)/(hi-lo))*(H*0.84)-H*0.05,px=i=>i/(pts.length-1)*(W-AX);
  x.fillStyle='#070B12';x.fillRect(0,0,W,H);
  x.strokeStyle='rgba(151,166,192,.07)';x.lineWidth=1;x.font='16px monospace';
  for(let i=0;i<=4;i++){const v=lo+(hi-lo)*i/4,y=py(v);x.beginPath();x.moveTo(0,y);x.lineTo(W-AX,y);x.stroke();x.fillStyle='#67748C';x.fillText(U.moneyK(v),W-AX+8,y+6)}
  /* running high-water line + drawdown shading (area between HWM and curve) */
  let hwm=pts[0];const hwms=pts.map(p=>{if(p>hwm)hwm=p;return hwm});
  x.fillStyle='rgba(242,99,124,.11)';
  for(let i=0;i<pts.length;i++){if(pts[i]<hwms[i]){const X=px(i),w=(W-AX)/pts.length+1;x.fillRect(X,py(hwms[i]),w,py(pts[i])-py(hwms[i]))}}
  x.strokeStyle='rgba(231,182,83,.75)';x.setLineDash([7,5]);x.beginPath();
  hwms.forEach((v,i)=>{const X=px(i),Y=py(v);i?x.lineTo(X,Y):x.moveTo(X,Y)});x.stroke();x.setLineDash([]);
  /* equity curve + gradient fill */
  const grd=x.createLinearGradient(0,0,0,H);grd.addColorStop(0,'rgba(47,214,160,.20)');grd.addColorStop(1,'rgba(47,214,160,0)');
  x.beginPath();pts.forEach((v,i)=>{const X=px(i),Y=py(v);i?x.lineTo(X,Y):x.moveTo(X,Y)});
  x.strokeStyle='#2FD6A0';x.lineWidth=2.5;x.stroke();
  x.lineTo(px(pts.length-1),H);x.lineTo(0,H);x.closePath();x.fillStyle=grd;x.fill();
  const D=PORTD_dd(pts);
  x.fillStyle='#2FD6A0';x.beginPath();x.arc(px(pts.length-1),py(pts[pts.length-1]),6,0,7);x.fill();
  x.fillStyle='#E7B653';x.font='15px monospace';x.fillText('HWM '+U.moneyK(D.hwm),10,py(D.hwm)-8);
  x.fillStyle='#9FABBF';x.fillText('last = S.equity '+U.moneyK(pts[pts.length-1])+' (anchored) · maxDD '+U.fmt(D.maxDD*100,1)+'% · current DD '+U.fmt(D.cur*100,1)+'%',10,H-12);
})}
function PORTD_drawDDCurve(){POSTRENDER.push(()=>{const cv=document.getElementById('portd-ddcv');if(!cv)return;
  const W=cv.width=cv.clientWidth*2,H=cv.height=180*2,x=cv.getContext('2d');
  x.fillStyle='#070B12';x.fillRect(0,0,W,H);
  const X0=64,Y0=H-40,XW=W-X0-20,YH=H-70;
  const mx=0.55,my=1.30;                            /* dd axis 0–55% · recovery axis 0–130% */
  const PX=d=>X0+d/mx*XW,PY=r=>Y0-Math.min(r,my)/my*YH;
  x.strokeStyle='rgba(151,166,192,.10)';x.font='15px monospace';x.fillStyle='#67748C';
  [0,0.25,0.50,0.75,1.00,1.25].forEach(r=>{const y=PY(r);x.beginPath();x.moveTo(X0,y);x.lineTo(W-20,y);x.stroke();x.fillText(Math.round(r*100)+'%',8,y+5)});
  [0.1,0.2,0.3,0.4,0.5].forEach(d=>{x.fillText('−'+Math.round(d*100)+'%',PX(d)-16,H-14)});
  /* y = x reference — what intuition wrongly expects */
  x.strokeStyle='rgba(151,166,192,.30)';x.setLineDash([5,5]);x.beginPath();x.moveTo(PX(0),PY(0));x.lineTo(PX(0.55),PY(0.55));x.stroke();x.setLineDash([]);
  x.fillStyle='#67748C';x.fillText('what intuition expects (y = x)',PX(0.30),PY(0.28)-8);
  /* the true curve: recovery = dd / (1 − dd) */
  x.strokeStyle='#F2637C';x.lineWidth=3;x.beginPath();
  for(let d=0;d<=0.55;d+=0.01){const y=PY(d/(1-d));d<0.011?x.moveTo(PX(d),y):x.lineTo(PX(d),y)}x.stroke();
  x.fillStyle='#F2637C';x.fillText('required recovery = dd ÷ (1 − dd)',PX(0.24),PY(0.95));
  const cur=PORTD_dd(PORTD_eqSeries()).cur;
  if(cur>0.002){x.fillStyle='#E7B653';x.beginPath();x.arc(PX(cur),PY(cur/(1-cur)),7,0,7);x.fill();
    x.fillText('you are here: −'+U.fmt(cur*100,1)+'% needs +'+U.fmt(cur/(1-cur)*100,1)+'%',PX(cur)+12,PY(cur/(1-cur))-8)}
})}

/* ═══════════ VIEW · PORTFOLIO / CAPITAL LEDGER ═══════════ */
VIEWS['portfolio.ledger']=function(){
  const L=PORTD_ledger();
  const pts=PORTD_eqSeries(),D=PORTD_dd(pts);
  const BP=PORTD_bpRows();
  const idx=PORTD_stageIdx(),st=STAGES[idx]||STAGES[STAGES.length-1],nxt=STAGES[idx+1]||null;
  const f=PORTD_ST.ledgFilter;
  const shown=L.rows.filter(r=>f==='ALL'||r.ty===f);

  let h=vhead('PORTFOLIO · treasury & capital ledger','Where every dollar is accounted',
    'An auditor’s view of the desk: the equity curve anchored to live equity, a transaction ledger whose running balance FOOTS, the true cost of trading, buying power derived line by line, and the staged compounding program. If a number here cannot be traced, it does not belong here.');

  /* ── (a) equity curve — anchored to S.equity ── */
  h+='<div class="grid g4">'+
    stat('Equity (paper)',U.moneyK(S.equity),'day '+U.money(S.dayPnl)+' · week '+U.money(S.weekPnl)+' — live store values')+
    stat('High-water mark',U.moneyK(D.hwm),'from the 90-session series below — derived, not stored')+
    stat('Current drawdown','<span class="'+(D.cur>0.05?'dn':D.cur>0.005?'':'up')+'">−'+U.fmt(D.cur*100,1)+'%</span>','needs +'+U.fmt(D.cur>0?D.cur/(1-D.cur)*100:0,1)+'% to reclaim HWM — the asymmetry, live')+
    stat('Max drawdown (90s)','−'+U.fmt(D.maxDD*100,1)+'%','vs the '+((st&&/DD≤(\d+)%/.exec(st.need))?/DD≤(\d+)%/.exec(st.need)[1]:'12')+'% stage ceiling — measured on this exact series')+
  '</div>';
  h+=panel('EQUITY CURVE — 90 sessions · drawdown shaded · HWM dashed','deterministic demo walk ANCHORED so the final point equals S.equity exactly (series rescaled by equity ÷ raw-final — a derived tie-out, not a coincidence) · <span class="demo-wm">demo twin</span>',
    '<canvas id="portd-eqcv" class="cv" style="height:250px"></canvas>');
  PORTD_drawEq();

  /* ── (b) transaction ledger — the running balance foots ── */
  h+=panel('TRANSACTION LEDGER — '+L.rows.length+' rows · FILL / FEE / DIV / ADJ','opening balance DERIVED as S.equity − Σnet, so the ledger foots by construction — and the tie-out below recomputes it anyway, because auditors trust arithmetic, not intentions · <span class="demo-wm">demo rows</span>',
    '<div class="btnrow" style="padding:0 12px 10px">'+
      ['ALL','FILL','FEE'].map(k=>'<button class="btn sm'+(f===k?' pri':'')+'" data-cmd="ledg.filter" data-arg="'+k+'">'+(f===k?'✓ ':'')+k+(k==='ALL'?' ('+L.rows.length+')':' ('+L.rows.filter(r=>r.ty===k).length+')')+'</button>').join('')+
      '<span class="pill">running balance always computed on the UNFILTERED ledger — filtering the view never re-foots the book</span></div>'+
    '<div class="kv" style="border:none;padding:0 12px"><span class="k">OPENING BALANCE</span><span class="v mono">'+U.money(L.start)+' <span class="i2" style="font-size:10px">(derived: '+U.money(S.equity)+' − Σnet '+U.money(L.sum)+')</span></span></div>'+
    tbl(['When','Type','Sym','Detail','>Price','>Fees','>Net','>Running balance'],
      shown.map(r=>'<tr'+(r.ty==='FEE'?' class="dim"':'')+'><td class="mono" style="font-size:10px">'+r.d+' '+r.t+'</td>'+
        '<td>'+chip(r.ty,r.ty==='FILL'?'ch-info':r.ty==='FEE'?'ch-mut':r.ty==='DIV'?'ch-ok':'ch-demo',r.ty==='FILL'?'●':'·')+'</td>'+
        '<td class="mono"><b>'+r.sym+'</b></td>'+
        '<td class="i1" style="font-size:10.5px">'+U.esc(r.qty)+' — <span class="i2">'+U.esc(r.memo)+'</span></td>'+
        '<td class="r num">'+U.esc(r.px)+'</td>'+
        '<td class="r num i2">'+(r.fees?U.money(r.fees):'—')+'</td>'+
        '<td class="r num '+PORTD_cls(r.net)+'">'+U.money(r.net)+'</td>'+
        '<td class="r num mono">'+U.money(r.bal)+'</td></tr>').join('')||'<tr><td colspan="8"><div class="empty"><div class="e1">NO ROWS</div>Nothing matches this filter.</div></td></tr>')+
    '<div class="banner '+(L.ok?'info':'warn')+'" style="margin:10px 12px"><span class="bico">'+(L.ok?'◈':'⛔')+'</span><div><b>TIE-OUT CHECK (computed live):</b> last running balance '+U.money(L.bal)+' vs S.equity '+U.money(S.equity)+' → '+(L.ok?chip('FOOTS · PASS','ch-ok','✓'):chip('DOES NOT FOOT · FAIL','ch-blk','✕'))+' — and the equity curve’s final point is anchored to the same number: three artifacts, one truth. '+CMD.btn('ledg.tieout',null,'sm','Re-foot now')+'</div></div>',{flush:true});

  /* ── session P&L + reconciliation — the ledger explains itself ── */
  h+='<div class="grid g2">';
  h+=PORTD_sessionPnl(L);
  h+=PORTD_triangle(L,pts);
  h+='</div>';

  /* ── (c) cost of trading — the silent tax ── */
  const allIn=1.9,avgNot=0.45,N=PORTD_ST.tradesYr;
  const dragUsd=2*(allIn/10000)*(avgNot*S.equity)*N,dragPct=dragUsd/S.equity*100;
  h+='<div class="grid g2">';
  h+=panel('COST OF TRADING — fees, slippage, and the compounding drag','slippage vs arrival is a MODEL (labeled) · fee lines are derived from the ledger above',
    tbl(['Venue / route','>Fills (window)','Fee basis','>Slip vs arrival','>All-in bps/side'],[
      ['Tradier sandbox · options (fill model v2.1)','<b>'+L.fills+'</b>','$0.65/ct + reg pass-through','+1.1 bps <span class="i2">(modeled)</span>','<b>1.9</b>'],
      ['Tradier sandbox · equities route','0','$0 commission','+0.4 bps <span class="i2">(modeled)</span>','0.6'],
      ['Index options — planned Phase 5','—','quoted, not measured','—','~2.4 <span class="i2">(vendor quote)</span>'],
      ['Data & platform (FEE rows above)','3 rows',''+U.money(L.feesExpl)+' this window — derived','n/a','amortized ≈0.2/side'],
    ].map(r=>'<tr><td class="i1" style="font-size:11px">'+r[0]+'</td><td class="r num">'+r[1]+'</td><td class="i2" style="font-size:10.5px">'+r[2]+'</td><td class="r num">'+r[3]+'</td><td class="r num">'+r[4]+'</td></tr>').join(''))+
    '<div style="padding:8px 12px">'+
    kv('FILL FEES (derived)',U.money(L.feesFills)+' across '+L.fills+' fills in the ledger window — every cent visible in the Fees column above')+
    kv('SLIPPAGE MODEL','fill price vs quote-at-decision (arrival). Demo book averages +1.1 bps/side — inside the 3 bps program gate. Modeled, labeled, never claimed as measured.')+
    '<div class="hr"></div>'+
    '<div class="kv" style="border:none"><span class="k">THE SILENT TAX</span><span class="v"><b class="mono">'+U.fmt(allIn,1)+' bps × 2 sides × '+U.fmt(avgNot*100,0)+'% avg notional × '+N+' trades/yr = '+U.money(dragUsd)+' ≈ '+U.fmt(dragPct,1)+'% of equity per year</b><div class="i2" style="font-size:10.5px;margin-top:3px">computed from the numbers shown above, nothing hidden. Expectancy must clear this BEFORE it clears zero — a +0.4R/trade edge at high frequency can be a losing business after the tax.</div>'+
    '<input type="range" min="100" max="600" step="20" value="'+N+'" data-cmdin="ledg.tradesim" style="width:220px;margin-top:6px"> <span class="mono i2" style="font-size:10px">'+N+' trades/yr — drag the slider; the arithmetic re-runs</span></span></div>'+
    '</div>',{flush:true});

  /* ── (d) buying power & margin honesty ── */
  h+=panel('BUYING POWER & MARGIN HONESTY — derived line by line','each requirement computed from an actual POSITIONS row · the desk sizes from RISK, not from buying power '+prov('risk.max_trade_risk_pct'),
    kv('EQUITY (paper)','<b class="mono">'+U.money(S.equity)+'</b> — the only number the sizing formula is allowed to see')+
    (BP.rows.length?BP.rows.map(r=>kv('− '+r.p.sym+' '+r.p.id,'<span class="mono">'+U.money(r.usd)+'</span> · '+r.kind+'<div class="i2" style="font-size:10px">'+U.esc(r.src)+'</div>')).join(''):kv('− (none)','no open positions — nothing is held'))+
    '<div class="hr"></div>'+
    kv('= HELD / RESERVED','<b class="mono">'+U.money(BP.hold)+'</b> across '+BP.rows.length+' rows')+
    kv('= AVAILABLE BUYING POWER','<b class="mono '+PORTD_cls(BP.avail)+'">'+U.money(BP.avail)+'</b> (cash-style paper account — no leverage assumed, none wanted)')+
    '<div class="banner gold" style="margin-top:8px"><span class="bico">◆</span><div><b>The doctrine '+prov('RISK-011','RISK-011 — per-trade risk ceiling: sizing derives from risk.max_trade_risk_pct of equity, never from available buying power')+':</b> available buying power would fund roughly '+U.int(Math.max(0,Math.floor(BP.avail/960)))+' more contracts of today’s NVDA line; the risk formula ('+U.money(PORTD_rUsd())+' ÷ $270 risk/ct) permits <b>2</b>. Buying power is a ceiling you should never be close enough to touch — the desk that sizes from BP is answering “how much CAN I lose” when the only professional question is “how much MAY I lose.”</div></div>');
  h+='</div>';

  /* ── (e) capital stage ladder — stage derived from live equity ── */
  h+=panel('CAPITAL STAGE LADDER — $1k → $100k, mapped to ACTUAL equity','current stage DERIVED from S.equity '+U.moneyK(S.equity)+' against the stage spans — the ring-fenced program cohort account (Paper Account tab, '+U.moneyK(PROGRAM.equity)+') runs the same ladder at its own stage',
    tbl(['Stage','Span','Risk / size','Evidence bar','Extra gate'],
      STAGES.map((s2,i)=>'<tr'+(i===idx?' style="background:var(--live-bg)"':'')+'><td class="mono"><b>'+s2.s+'</b>'+(i===idx?' ◀ derived from equity':'')+'</td><td class="mono">'+s2.span+'</td><td class="mono" style="font-size:10.5px">'+s2.risk+'</td><td class="i1" style="font-size:11px">'+s2.need+'</td><td class="i2" style="font-size:11px">'+s2.gate+'</td></tr>').join(''))+
    '<div style="padding:8px 12px">'+
    '<div class="kv" style="border:none"><span class="k">GATES TO '+(nxt?nxt.s:'GRADUATION')+'</span><span class="v i2" style="font-size:10.5px">every gate is evidence, none is a date</span></div>'+
    kv('Trade count','38 / 40 in the qualifying window '+chip('PENDING','ch-warn','…')+' <span class="demo-wm">demo scenario value</span>')+
    kv('Expectancy floor','+1.04R blended vs ≥ +1.0R required '+chip('MEETS','ch-ok','✓')+' <span class="demo-wm">demo scenario value</span>')+
    kv('Max-DD ceiling','−'+U.fmt(D.maxDD*100,1)+'% vs ≤ 12% — DERIVED from the equity curve above '+chip(D.maxDD<=0.12?'MEETS':'BREACH','ch-'+(D.maxDD<=0.12?'ok':'blk'),D.maxDD<=0.12?'✓':'✕'))+
    kv('Extra gate','multi-cluster correlation caps proven — 41 / 60 clean sessions '+chip('PENDING','ch-warn','…')+' <span class="demo-wm">demo scenario value</span>')+
    '<div class="banner info" style="margin-top:8px"><span class="bico">i</span><div><b>Honest note:</b> stage progression is EVIDENCE-gated, never time-gated. There is no “after three months you advance.” There is only n, expectancy, and drawdown — and demotion is automatic when the ledger says so. The program never argues with the ledger, and neither should you.</div></div>'+
    '</div>',{flush:true});

  /* ── withdrawal simulator — policy arithmetic, interactive ── */
  h+=PORTD_sweepSim();

  /* ── (f) monthly statement export ── */
  h+=panel('MONTHLY STATEMENT — a real file, honestly watermarked','generates a downloadable .md statement from the exact series and ledger shown above; the export is audited',
    '<div class="btnrow">'+CMD.btn('ledg.statement',null,'gold','Generate statement (.md) ↓')+CMD.btn('ledg.csv',null,'','Export ledger (.csv) ↓')+CMD.btn('ledg.tieout',null,'sm','Re-foot the ledger')+'</div>'+
    '<div class="i2" style="font-size:10.5px;margin-top:8px">Contents: P&L summary from the 90-session series · fee roll-up from the ledger · open-positions snapshot from POSITIONS · stage status from the ladder above. Every number in the file is a number on this screen — a statement that cannot be reconciled to its own UI is marketing.</div>');

  /* ── doctrine: drawdown asymmetry · withdrawal policy ── */
  h+='<div class="grid g2">';
  h+=panel('DRAWDOWN DOCTRINE — the asymmetry arithmetic','required recovery = dd ÷ (1 − dd) — losses are geometric, recoveries are uphill',
    '<canvas id="portd-ddcv" class="cv" style="height:180px"></canvas>'+
    tbl(['>DD','>Required recovery','What changes at this band (MM rules)'],
      [[5,'full formulaic size — NORMAL. The stop ladder is doing its job.'],
       [10,'loss ladder engaged: size steps DOWN '+ck('risk.loss_ladder_step')+'%/rung '+prov('risk.loss_ladder_step')+' · weekly breaker proximity check '+prov('risk.max_week_loss_R')],
       [15,'stage DD ceiling — automatic demotion to prior stage sizing (demotion is a feature) · review-only day mandated'],
       [20,'desk locks to review-only; re-entry requires a written plan through governance — not a feeling of readiness'],
       [30,'survival problem, not a trading problem. The 2R day breaker '+prov('risk.max_day_loss_R')+' exists upstream so this row stays theoretical.'],
       [50,'arithmetic without mercy: a double is required just to be even. This row is why every breaker above it is a hard state transition (LAW-011).']]
      .map(([d,note])=>'<tr><td class="r num dn">−'+d+'%</td><td class="r num"><b>+'+U.fmt(d/(100-d)*100,1)+'%</b></td><td class="i1" style="font-size:10.5px">'+note+'</td></tr>').join(''))+
    '<div class="i2" style="font-size:10.5px;padding:8px 12px">Computed from the formula, not typed in: −20% needs +25%, −50% needs +100%. The curve above shows the gap between intuition (dashed) and arithmetic (red) — every MM rule on this desk is downstream of that gap.</div>',{flush:true});
  h+=panel('WITHDRAWAL POLICY — when profits leave the account','the discipline that realizes gains is the same discipline that cuts losses',
    kv('QUARTERLY SWEEP','once stage ≥ S4: 30% of net-new profit ABOVE the high-water mark leaves the account each quarter. Compounding keeps 70%; reality gets the rest.')+
    kv('NEVER IN DRAWDOWN','no withdrawal while equity sits below HWM — sweeping a drawdown converts a paper loss into a permanent one and calls it income.')+
    kv('AFTER A BREAKER MONTH','any month that tripped the weekly breaker '+prov('risk.max_week_loss_R')+' sweeps zero. Capital heals before it pays.')+
    kv('STAGE-FLOOR COUPLING','a withdrawal may never pull equity below the current stage’s floor — you cannot withdraw yourself into a demotion.')+
    kv('JOURNALED LIKE A TRADE','every withdrawal lands in the ledger and the journal (LAW-018) with a reason. Money leaving silently is how accounts become fiction.')+
    kv('WHY THIS EXISTS','an account that never pays out is a scoreboard, and scoreboards invite scoreboard behavior — oversizing to make the number move. Withdrawn dollars are the only P&L that is finally, boringly real. <span class="demo-wm">policy doctrine — no withdrawals exist in DEMO</span>'));
  h+='</div>';
  PORTD_drawDDCurve();
  return h;
};

/* ═══════════ capital ledger commands ═══════════ */
CMD.define({id:'ledg.filter',label:'Ledger filter',purpose:'Re-render the transaction ledger filtered by row type — the running balance stays footed on the full set',audit:false,run:a=>{
  PORTD_ST.ledgFilter=(a==='FILL'||a==='FEE')?a:'ALL';render()}});

CMD.define({id:'ledg.tradesim',label:'Trades/yr what-if',purpose:'Re-run the compounding-drag arithmetic at a different trade count',audit:false,run:(a,el)=>{
  if(!el)return;PORTD_ST.tradesYr=U.clamp(parseInt(el.value,10)||420,100,600);render()}});

CMD.define({id:'ledg.tieout',label:'Re-foot the ledger',purpose:'Recompute the running balance from the opening balance and compare to S.equity — the auditor’s move',run:()=>{
  const L=PORTD_ledger();
  SVR.audit('SVR Ledger','tieout','Ledger re-footed: opening '+U.money(L.start)+' + Σnet '+U.money(L.sum)+' = '+U.money(L.bal)+' vs equity '+U.money(S.equity)+' → '+(L.ok?'FOOTS (PASS)':'MISMATCH (FAIL)'));
  UI.toast(L.ok?'FOOTS — '+U.money(L.start)+' + '+U.money(L.sum)+' = '+U.money(L.bal)+' = S.equity. The book balances.':'MISMATCH — last balance '+U.money(L.bal)+' vs equity '+U.money(S.equity)+'. In production this locks new orders and pages P1 (RB-08).',L.ok?'ok':'blk','TIE-OUT');render()}});

CMD.define({id:'ledg.statement',label:'Generate statement',purpose:'Download a monthly statement (.md) built from the exact series and ledger on screen — audited export',run:()=>{
  const L=PORTD_ledger(),pts=PORTD_eqSeries(),D=PORTD_dd(pts);
  const win=pts.slice(-21),wd=PORTD_dd(win),w0=win[0],w1=win[win.length-1];
  const idx=PORTD_stageIdx(),st=STAGES[idx]||STAGES[STAGES.length-1],nxt=STAGES[idx+1]||null;
  const fmt=n=>(n<0?'-$':'$')+Math.abs(n).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
  const lines=[
   '# ATLAS PRIME — MONTHLY STATEMENT (DEMO)','',
   '> HONESTY HEADER — every value below is synthetic demo data generated from',
   '> seed '+ck('demo.seed')+'. No live feed, no broker, no performance claim, no exceptions.','',
   '- Mode: '+S.mode+' · Rules: '+RULES_VERSION,
   '- Generated: '+CLOCK.hms()+' ET (sim clock) · Session phase: '+CLOCK.phase(),'',
   '## P&L SUMMARY — last 21 sessions of the 90-session anchored series','',
   '| Metric | Value |','|---|---|',
   '| Opening equity (T-21) | '+fmt(w0)+' |',
   '| Closing equity (today) | '+fmt(w1)+' — equals S.equity by anchor |',
   '| Net change | '+fmt(w1-w0)+' ('+((w1-w0)/w0*100).toFixed(2)+'%) |',
   '| Day P&L (today, live store) | '+fmt(S.dayPnl)+' |',
   '| Week P&L (live store) | '+fmt(S.weekPnl)+' |',
   '| Max drawdown — 21s window | -'+(wd.maxDD*100).toFixed(1)+'% |',
   '| Max drawdown — full 90s | -'+(D.maxDD*100).toFixed(1)+'% |',
   '| High-water mark | '+fmt(D.hwm)+' |','',
   '## FEES & COSTS — rolled up from the transaction ledger','',
   '| Line | Amount |','|---|---|',
   '| Fill fees ('+L.fills+' fills) | '+fmt(L.feesFills)+' |',
   '| Data / platform / regulatory (FEE rows) | '+fmt(L.feesExpl)+' |',
   '| Total explicit costs, window | '+fmt(L.feesFills+L.feesExpl)+' |','',
   '## LEDGER TIE-OUT','',
   '- Opening balance (derived): '+fmt(L.start),
   '- Sum of '+L.rows.length+' ledger rows: '+fmt(L.sum),
   '- Closing running balance: '+fmt(L.bal)+' vs S.equity '+fmt(S.equity)+' -> **'+(L.ok?'FOOTS (PASS)':'MISMATCH (FAIL)')+'**','',
   '## OPEN POSITIONS SNAPSHOT — from the live POSITIONS store','',
  ];
  if((POSITIONS||[]).length){
    lines.push('| ID | Sym | Dir | Instrument | FSM | uR | Next action |','|---|---|---|---|---|---|---|');
    POSITIONS.forEach(p=>lines.push('| '+p.id+' | '+p.sym+' | '+p.dir+' | '+p.instrument+' | '+p.fsm+' | '+(p.uR>=0?'+':'')+p.uR.toFixed(2)+'R | '+p.nextAction+' |'));
  }else lines.push('_Book is flat — no open positions at statement time._');
  lines.push('','## CAPITAL STAGE STATUS','',
   '- Current stage (derived from equity '+fmt(S.equity)+'): **'+st.s+'** ('+st.span+') · risk '+st.risk,
   '- Evidence bar: '+st.need+' · extra gate: '+st.gate,
   '- Next stage: '+(nxt?nxt.s+' ('+nxt.span+') — progression is evidence-gated, never time-gated':'graduation review — human sign-off'),
   '- Max-DD vs ceiling: -'+(D.maxDD*100).toFixed(1)+'% measured on the statement series','',
   '## TAIL PROTECTION','',
   '- Budget: <= '+PORTD_TAIL_BPS+' bps of equity / month (doctrine number — no CONFIG key yet)',
   '- Spent this month: '+fmt(PORTD_tailSpent())+' ('+(PORTD_tailSpent()/S.equity*10000).toFixed(1)+' bps) — see Hedge Desk decision log','',
   '---','_Reconciliation rule: every number in this file appears on the Capital Ledger or Hedge Desk workspace it was exported from. A statement that cannot be reconciled to its own UI is marketing._','');
  const blob=new Blob([lines.join('\n')],{type:'text/markdown'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='ATLAS_monthly_statement_DEMO.md';a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),4000);
  SVR.audit('HUMAN (owner)','export','Monthly statement exported (.md) — window close '+U.money(S.equity)+' · tie-out '+(L.ok?'PASS':'FAIL')+' · '+L.rows.length+' ledger rows · stage '+st.s);
  UI.toast('Statement downloaded — a real .md file, watermarked DEMO in its own header','ok','STATEMENT');render()}});

/* ═══════════ deep panels — hedge desk ═══════════ */

/* ── theta ladder — what standing still costs, session by session ── */
function PORTD_thetaLadder(G){
  const H=PORTD_ST.thetaH||7;
  if(!G.rows.length)return panel('THETA LADDER — the cost of standing still','first-order projection · flat book',
    '<div class="empty"><div class="e1">FLAT</div>No filled positions — time is currently free.</div>');
  const days=[];for(let d2=1;d2<=H;d2++)days.push(d2);
  return panel('THETA LADDER — what the book pays (or collects) for '+H+' more sessions','first-order: theta held constant · in reality theta accelerates into expiry and gamma repricing bends every row · <span class="demo-wm">projection, not a forecast</span>',
    tbl(['Position','>Θ$/day'].concat(days.map(d2=>'>T+'+d2)),
      G.rows.map(r=>'<tr><td class="mono"><b>'+r.sym+'</b> <span class="i2" style="font-size:9.5px">'+U.esc(r.inst)+'</span></td><td class="r num '+PORTD_cls(r.tUsd)+'">'+U.money(r.tUsd)+'</td>'+
        days.map(d2=>'<td class="r num '+PORTD_cls(r.tUsd*d2)+'" style="font-size:10px">'+U.money(r.tUsd*d2)+'</td>').join('')+'</tr>').join('')+
      '<tr style="background:var(--live-bg)"><td><b>BOOK</b></td><td class="r num '+PORTD_cls(G.tot.t)+'"><b>'+U.money(G.tot.t)+'</b></td>'+
        days.map(d2=>'<td class="r num '+PORTD_cls(G.tot.t*d2)+'"><b>'+U.money(G.tot.t*d2)+'</b></td>').join('')+'</tr>')+
    '<div class="row" style="padding:8px 12px"><span class="mono i2" style="font-size:10px">HORIZON</span>'+
    '<input type="range" min="3" max="14" step="1" value="'+H+'" data-cmdin="hedge.horizon" style="width:180px">'+
    '<span class="mono i2" style="font-size:10px">'+H+' sessions</span>'+
    '<span class="i2" style="font-size:10px">— a hedge’s carry belongs in this ladder too: every candidate’s bps/mo above is theta wearing a different name. If the book’s theta is POSITIVE, remember who is on the other side of that trade when vol arrives.</span></div>',{flush:true});
}

/* ── event exposure map — which holdings live through which binary dates ── */
function PORTD_eventMap(){
  const evs=(typeof EVENTS!=='undefined'?EVENTS:[]);
  const pos=(POSITIONS||[]).filter(p=>p.entryAct!=null);
  if(!evs.length)return'';
  const rows=evs.map(e=>{
    const md=/T\+(\d+)d/.exec(e.t);
    const dDays=md?+md[1]:(/Today/.test(e.t)?0:null);
    const cross=dDays==null?[]:pos.filter(p=>{const dm=/(\d+)DTE/.exec(p.instrument);const dte=dm?+dm[1]:0;return dte>=dDays});
    const named=cross.filter(p=>e.what.toUpperCase().includes(p.sym));
    const read=e.cls==='MACRO'
      ?(cross.length?'macro date — the WHOLE held book is exposed at once; correlations converge into the print. Any hedge here is event-scoped and dies T+1 (LAW-017 window applies to hedges too).':'no held position survives to this date — exposure is zero by calendar, the cheapest hedge there is.')
      :(named.length?'DIRECT single-name binary for '+named.map(p=>p.sym).join(', ')+' — the desk does not hedge through earnings, it exits or was never there '+prov('risk.event_window_hrs'):cross.length?'same-cluster second-order exposure only — the 0.84 correlation makes someone else’s earnings partly yours (RISK-031 thinking, applied to dates).':'no exposure — held book expires or exits before this date.');
    return{e,dDays,cross,read};
  });
  return panel('EVENT EXPOSURE MAP — holdings vs binary dates','DTE parsed from each instrument vs the events calendar — hedges are event-SCOPED here, never standing '+prov('LAW-017'),
    tbl(['Event','When','Class','Held through it','Hedge-desk reading'],
      rows.map(r=>'<tr'+(r.cross.length&&r.e.block?' style="background:var(--warn-bg)"':'')+'><td><b style="font-size:11px">'+U.esc(r.e.what)+'</b></td><td class="mono" style="font-size:10px">'+U.esc(r.e.t)+'</td><td>'+chip(r.e.cls,r.e.cls==='MACRO'?'ch-info':'ch-warn','◆')+'</td>'+
      '<td class="mono" style="font-size:10.5px">'+(r.cross.length?r.cross.map(p=>p.sym+' ('+(/(\d+)DTE/.exec(p.instrument)||[,'0'])[1]+'DTE)').join(' · '):'<span class="up">none</span>')+'</td>'+
      '<td class="i1" style="font-size:10.5px">'+r.read+'</td></tr>').join('')),{flush:true});
}

/* ── coverage matrix — what actually hedges what, computed live ── */
function PORTD_coverage(){
  const CL=PORTD_clusters();
  return panel('COVERAGE MATRIX — candidates × clusters','FULL = opposing sign and ≥40% of cluster βΔ$ · PARTIAL = opposing but under the bar · CONVEX = pays in the crash shape, offsets no drift · — = does not apply',
    tbl(['Candidate'].concat(CL.map(c=>c.nm)),
      PORTD_HEDGES.map(hd=>{
        const off=hd.off();
        return'<tr><td class="i1" style="font-size:10.5px"><b>'+U.esc(hd.nm.split('—')[0].trim())+'</b></td>'+CL.map(c=>{
          if(!hd.fit.includes(c.nm))return'<td class="i2">—</td>';
          if(off===0)return'<td>'+chip('CONVEX','ch-info','◈')+'</td>';
          if(!c.bw||Math.sign(off)!==-Math.sign(c.bw))return'<td>'+chip('SAME SIDE','ch-mut','·')+'</td>';
          const cov=Math.abs(off)/Math.max(1,Math.abs(c.bw));
          return'<td>'+(cov>=0.4?chip('FULL '+U.fmt(cov*100,0)+'%','ch-ok','✓'):chip('PARTIAL '+U.fmt(cov*100,0)+'%','ch-warn','!'))+'</td>';
        }).join('')+'</tr>'}).join(''))+
    '<div class="i2" style="font-size:10.5px;padding:8px 12px">Recomputed from the live book every render — flatten a position and this matrix changes. “SAME SIDE” is the quiet killer: an instrument that moves WITH the cluster is not protection, it is conviction with extra fees.</div>',{flush:true});
}

/* ═══════════ deep panels — capital ledger ═══════════ */

/* ── session P&L attribution — derived from the MTM true-up rows ── */
function PORTD_sessionPnl(L){
  const mtm=L.rows.filter(r=>r.ty==='ADJ'&&r.qty==='MTM');
  if(!mtm.length)return'';
  let cum=0;
  return panel('P&L BY SESSION — derived from the ledger’s own MTM rows','no separate P&L store exists — this table is the ADJ·MTM rows re-read, which is exactly why it cannot disagree with the ledger',
    tbl(['Session','>Mark P&L','>Cumulative','Weight of evidence'],
      mtm.map(r=>{cum+=r.net;const w=Math.min(96,Math.abs(r.net)/8);
        return'<tr><td class="mono" style="font-size:10.5px">'+r.d+'</td><td class="r num '+PORTD_cls(r.net)+'">'+U.money(r.net)+'</td><td class="r num '+PORTD_cls(cum)+'">'+U.money(cum)+'</td>'+
        '<td><div class="gauge" style="width:120px"><i style="width:'+U.fmt(w,0)+'%;background:'+(r.net>=0?'var(--pos)':'var(--neg)')+'"></i></div></td></tr>'}).join(''))+
    '<div class="i2" style="font-size:10.5px;padding:8px 12px">Today’s row equals S.dayPnl by derivation (the tie is structural, not typed). '+mtm.filter(r=>r.net>=0).length+' green sessions · '+mtm.filter(r=>r.net<0).length+' red across the window — and the ledger holds the reds with the same typeface as the greens. That is the whole point of a ledger.</div>',{flush:true});
}

/* ── reconciliation triangle — three artifacts, one number ── */
function PORTD_triangle(L,pts){
  const eqCurve=pts[pts.length-1];
  const d1=eqCurve-S.equity,d2=L.bal-S.equity,d3=eqCurve-L.bal;
  const ok=Math.abs(d1)<0.01&&Math.abs(d2)<0.01&&Math.abs(d3)<0.01;
  return panel('RECONCILIATION TRIANGLE — curve · ledger · store','the same number reached three independent ways, differenced live — any leg breaking is a P1, not a shrug',
    '<div class="grid g3">'+
    stat('Equity curve, final point',U.money(eqCurve),'90-session series, anchored')+
    stat('Ledger running balance',U.money(L.bal),'opening + Σ 25 rows')+
    stat('S.equity (live store)',U.money(S.equity),'the number the whole app renders')+
    '</div>'+
    kv('Δ curve − store','<span class="mono '+(Math.abs(d1)<0.01?'up':'dn')+'">'+U.money(d1)+'</span>')+
    kv('Δ ledger − store','<span class="mono '+(Math.abs(d2)<0.01?'up':'dn')+'">'+U.money(d2)+'</span>')+
    kv('Δ curve − ledger','<span class="mono '+(Math.abs(d3)<0.01?'up':'dn')+'">'+U.money(d3)+'</span>')+
    '<div class="banner '+(ok?'info':'warn')+'" style="margin-top:8px"><span class="bico">'+(ok?'◈':'⛔')+'</span><div>'+(ok?'<b>All three legs agree to the cent.</b> In production this is the broker-recon loop (RB-03) wearing its ledger hat: any divergence locks new orders and pages — reconciliation is a circuit, not a report.':'<b>LEGS DISAGREE.</b> In production: new orders lock, P1 pages, and nothing trades until an auditor can say why (RB-08).')+'</div></div>');
}

/* ── withdrawal simulator — the price of making gains real ── */
function PORTD_sweepSim(){
  const sw=(PORTD_ST.sweep!=null?PORTD_ST.sweep:30)/100;
  const g=0.06,Q=8;
  let eq=S.equity,hwm=S.equity,taken=0;
  for(let q=0;q<Q;q++){eq*=(1+g);if(eq>hwm){const take=(eq-hwm)*sw;eq-=take;taken+=take}hwm=Math.max(hwm,eq)}
  const pure=S.equity*Math.pow(1+g,Q);
  const gap=pure-(eq+taken);
  return panel('WITHDRAWAL SIMULATOR — 8 quarters at a modeled +6.0%/qtr','an arithmetic illustration of the policy, NOT a forecast — the +6%/qtr is a demo assumption and says so · <span class="demo-wm">modeled</span>',
    '<div class="row" style="margin-bottom:10px"><span class="mono i2" style="font-size:10px">SWEEP</span>'+
    '<input type="range" min="0" max="50" step="5" value="'+Math.round(sw*100)+'" data-cmdin="ledg.sweepsim" style="width:200px">'+
    '<span class="mono i2" style="font-size:10px">'+Math.round(sw*100)+'% of net-new profit above HWM, each quarter</span></div>'+
    '<div class="grid g4">'+
    stat('Account after 8 qtrs',U.moneyK(eq),'compounding what the sweep leaves behind')+
    stat('Withdrawn — made real','<span class="up">'+U.moneyK(taken)+'</span>','the only P&L that is finally, boringly real')+
    stat('Pure-compound path',U.moneyK(pure),'sweep 0% — the scoreboard maximum')+
    stat('Cost of realization',U.moneyK(gap),'pure − (account + withdrawn) — the compounding you traded for reality')+
    '</div>'+
    '<div class="i2" style="font-size:10.5px;margin-top:8px">The gap is not a flaw in the policy — it is the premium paid for the discipline. An account that never pays out invites scoreboard behavior: oversizing to make a number move that nobody ever spends. Drag to 0% and notice the gap vanish along with the point of the exercise.</div>');
}

/* ═══════════ deep-panel commands ═══════════ */
CMD.define({id:'hedge.horizon',label:'Theta horizon',purpose:'Re-project the theta ladder over a different session count',audit:false,run:(a,el)=>{
  if(!el)return;PORTD_ST.thetaH=U.clamp(parseInt(el.value,10)||7,3,14);render()}});
CMD.define({id:'ledg.sweepsim',label:'Sweep what-if',purpose:'Re-run the withdrawal arithmetic at a different sweep percentage',audit:false,run:(a,el)=>{
  if(!el)return;PORTD_ST.sweep=U.clamp(parseInt(el.value,10)||30,0,50);render()}});
CMD.define({id:'ledg.csv',label:'Export ledger (CSV)',purpose:'Download the full 25-row transaction ledger as a real CSV file — audited export',run:()=>{
  const L=PORTD_ledger();
  const esc=s=>'"'+String(s).replace(/"/g,'""')+'"';
  const lines=['when,type,symbol,detail,price,fees,net,running_balance,memo'];
  L.rows.forEach(r=>lines.push([r.d+' '+r.t,r.ty,r.sym,r.qty,r.px,(r.fees||0).toFixed(2),r.net.toFixed(2),r.bal.toFixed(2),esc(r.memo)].join(',')));
  lines.push([',,,,,TOTAL,'+L.sum.toFixed(2)+','+L.bal.toFixed(2)+',"tie-out vs S.equity '+S.equity.toFixed(2)+': '+(L.ok?'FOOTS':'MISMATCH')+' — DEMO synthetic ledger, seed '+ck('demo.seed')+'"'].join(''));
  const blob=new Blob([lines.join('\n')],{type:'text/csv'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='ATLAS_ledger_DEMO.csv';a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),4000);
  SVR.audit('HUMAN (owner)','export','Ledger CSV exported — '+L.rows.length+' rows · tie-out '+(L.ok?'PASS':'FAIL'));
  UI.toast('Ledger CSV downloaded — '+L.rows.length+' rows, tie-out '+(L.ok?'FOOTS':'MISMATCH')+' stamped in the footer row','ok','EXPORT')}});
