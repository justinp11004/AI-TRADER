/* ═══════════ SVR · simulated server boundary ═══════════
   In production these are FastAPI services. The UI NEVER computes
   authority: it calls SVR.* and renders structured verdicts. This
   keeps the swap to a real backend 1:1 — same contracts, same codes. */
const SVR={
  /* append-only audit ledger — every state change lands here */
  ledger:[],
  audit(actor,kind,msg){this.ledger.unshift({t:CLOCK.hms(),actor,kind,msg,h:U.hash8(actor+kind+msg+this.ledger.length)});if(this.ledger.length>600)this.ledger.pop()},

  /* ── deterministic risk engine — structured reason codes, no scores ── */
  riskCheck(plan){
    const r={verdict:'PASS',codes:[],required:[]};
    const deny=(code,msg,req)=>{r.verdict='BLOCK';r.codes.push({code,msg});if(req)r.required.push(req)};
    const warn=(code,msg)=>{r.codes.push({code,msg,advisory:true})};
    if(S.kill)deny('RISK-KILL','Kill switch active — all order paths locked','Resume desk (owner) before any approval');
    if(S.riskMode==='COOLDOWN'||S.riskMode==='BLOCKED')deny('RISK-MODE','risk_mode='+S.riskMode+' — circuit breaker engaged (LAW-011)','Wait for session reset');
    const riskPct=plan.riskUSD/S.equity*100;
    if(riskPct>ck('risk.max_trade_risk_pct'))deny('RISK-SIZE',U.fmt(riskPct,2)+'% > risk.max_trade_risk_pct '+ck('risk.max_trade_risk_pct')+'%','Reduce size to ≤'+U.fmt(S.equity*ck('risk.max_trade_risk_pct')/100,0)+' USD risk');
    if(S.openRiskR+plan.riskR>ck('risk.max_open_risk_R'))deny('RISK-OPEN','Open risk would reach '+U.fmt(S.openRiskR+plan.riskR,2)+'R > '+ck('risk.max_open_risk_R')+'R cap','Close or reduce an open position first');
    if(plan.rr<ck('risk.min_rr'))deny('RISK-5R','Best realistic path '+U.fmt(plan.rr,2)+'R < '+ck('risk.min_rr')+'R (LAW-004)','A wider target must be STRUCTURAL, not wished — otherwise reject');
    if(plan.spreadPct!=null&&plan.spreadPct>ck('options.max_spread_pct'))deny('OPT-007','Contract spread '+U.fmt(plan.spreadPct,1)+'% > '+ck('options.max_spread_pct')+'% (LAW-009)','Pick a liquid strike/expiry or WAIT for spread normalization');
    if(plan.eventHrs!=null&&plan.eventHrs<ck('risk.event_window_hrs'))deny('RISK-EVENT','Binary event in '+plan.eventHrs+'h < '+ck('risk.event_window_hrs')+'h blackout (LAW-017)','Wait for the event to pass');
    if(plan.sectorPct!=null&&plan.sectorPct>ck('risk.max_sector_exposure'))deny('RISK-SECTOR','Cluster exposure '+U.fmt(plan.sectorPct,1)+'% > '+ck('risk.max_sector_exposure')+'% cap','Correlated risk counts as one position');
    if(S.dataHealth!=='NOMINAL')deny('DATA-STALE','Data health '+S.dataHealth+' — stale inputs cannot approve (LAW-006)','Restore feed SLO first');
    if(plan.fresh===false)deny('DATA-SNAP','Evidence snapshot expired — packet must revalidate (LAW-006)','Re-run the desk on this symbol');
    if(plan.counterRegime)warn('CTX-REGIME','Counter-regime trade — size discipline advised, paper preferred');
    return r;
  },

  /* ── approval tokens — short-lived, single-use, plan-hash bound ── */
  tokens:{},_tkn:8840,
  issueToken(packetId,planHash,decision){
    const id='TKN-'+(++this._tkn);
    this.tokens[id]={id,packetId,planHash,decision,issued:CLOCK.hms(),ttl:ck('token.ttl_sec'),used:false};
    this.audit('SVR TokenIssuer','token',id+' issued for '+packetId+' · decision '+decision+' · hash '+planHash+' · ttl '+ck('token.ttl_sec')+'s · single-use');
    return this.tokens[id];
  },
  redeemToken(id,planHash){
    const t=this.tokens[id];
    if(!t)return{ok:false,code:'TKN-404',msg:'Token unknown'};
    if(t.used)return{ok:false,code:'TKN-USED',msg:'Token already redeemed — single-use'};
    if(t.ttl<=0)return{ok:false,code:'TKN-EXP',msg:'Token expired — plan returns to review'};
    if(t.planHash!==planHash)return{ok:false,code:'TKN-HASH',msg:'Plan changed since approval — token invalidated, revalidation required'};
    t.used=true;this.audit('SVR TokenIssuer','token',id+' redeemed for '+t.packetId);
    return{ok:true,token:t};
  },

  /* ── packet FSM transitions (server-owned) ── */
  packetDecide(pkt,decision,reason){
    if(pkt.state!=='READY_FOR_HUMAN')return{ok:false,msg:'Packet not awaiting human — state '+pkt.state};
    if(!ENUMS.DECISIONS.includes(decision))return{ok:false,msg:'Non-canonical decision enum (LAW-014)'};
    pkt.decision=decision;pkt.decisionReason=reason||null;pkt.decidedAt=CLOCK.hms();
    if(decision==='APPROVE_PAPER_ONLY'||decision==='APPROVE_REDUCED_SIZE'){pkt.state='APPROVED_PAPER'}
    else if(decision==='APPROVE_LIVE'){pkt.state='APPROVED_LIVE_PENDING_TOKEN'}
    else if(decision==='WAIT_FOR_TRIGGER'||decision==='MODIFY_LEVELS'||decision==='LOG_AND_REVIEW'){pkt.state='READY_FOR_HUMAN';pkt.note=decision}
    else{pkt.state='REJECTED'}
    this.audit('HUMAN (owner)','decision',pkt.id+' → '+decision+(reason?' · '+reason:'')+' · journaled (LAW-018)');
    JOURNAL.unshift({t:CLOCK.hm(),id:pkt.id,sym:pkt.sym,kind:pkt.state==='REJECTED'?'REJECTED':'DECISION',what:decision+(reason?' · '+reason:''),grade:pkt.grade,outcome:'—',lesson:pkt.state==='REJECTED'?'Awaiting outcome tracking — rejection quality is measured (E2)':'—'});
    return{ok:true};
  },
};
