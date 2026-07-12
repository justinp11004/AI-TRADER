/* ═══════════ PORTFOLIO · manage capital, protect it ═══════════ */
VIEWS['portfolio.positions']=function(){
  let h=vhead('PORTFOLIO · positions','Plan-driven management',
    'Once a trade is open, research noise disappears. What remains: thesis status, invalidation, FSM stage, required action, and the envelope.');
  h+=POSITIONS.map(p=>{
    const s=symBy(p.sym);
    return'<div class="panel'+(p.fsm==='MANAGING'?' gold':'')+'"><div class="ph"><span class="t">'+p.id+' · '+p.sym+' '+p.dir+'</span><span class="why">'+U.esc(p.instrument)+' · '+p.mode+'</span><span class="spacer"></span>'+lc(p.fsm)+chip('THESIS '+p.thesis,p.thesis==='INTACT'?'ch-ok':'ch-warn',p.thesis==='INTACT'?'✓':'…')+'</div><div class="pb">'+
    '<div class="grid g4" style="margin-bottom:10px">'+
      stat('Unrealized',(p.uR>=0?'<span class="up">':'<span class="dn">')+U.R(p.uR)+'</span>','plan deviation '+p.dev+'bps')+
      stat('Next required action','<span style="font-size:11px">'+U.esc(p.nextAction)+'</span>','stage '+p.stage+' · 25/50/75 doctrine')+
      stat('Invalidation','<span style="font-size:11px">'+U.esc(p.inval)+'</span>','structural — never moves away')+
      stat('Time stop','<span style="font-size:11px">'+U.esc(p.timeStop)+'</span>','time invalidation is real invalidation')+'</div>'+
    '<div class="rproof" style="margin-bottom:8px"><div class="rrow"><span class="lab">Entry plan '+U.fmt(p.entryPlan)+' → actual '+(p.entryAct?U.fmt(p.entryAct):'unfilled')+'</span><span>stop '+U.fmt(p.stop)+'</span></div>'+
    '<div class="rrow"><span class="lab">T1 '+U.fmt(p.t1)+' · T2 '+U.fmt(p.t2)+' · T3 '+U.fmt(p.t3)+'</span><span class="i2">Δ'+p.greeks.delta+' · Θ'+p.greeks.theta+' · IV'+p.greeks.iv+'</span></div></div>'+
    '<div class="i2" style="font-size:10.5px">'+U.esc(p.cnote)+'</div>'+
    '<div class="btnrow" style="margin-top:9px">'+CMD.btn('nav.decisions.packet',p.packet,'sm','Source packet '+p.packet)+
      '<button class="btn sm" disabled data-blocked="Envelope: tighten-only is automatic via S27.\nManual tighten arrives with the order-ticket build (Phase 5).">Tighten stop</button>'+
      '<button class="btn sm neg" data-cmd="pos.flatten" data-arg="'+p.id+'">Flatten (allowed anytime)</button>'+
      '<button class="btn sm" disabled data-blocked="FORBIDDEN by envelope law:\n· widen stop · add to loser · extend horizon (LAW-016).\nOutside-envelope changes require an amendment mini-packet through the token gate.">Widen stop</button>'+
    '</div></div></div>'});
  h+=panel('THE MANAGEMENT ENVELOPE','S27 tightens risk only; it can never widen, add, or extend',
    ENVELOPE.map(e=>kv(e.includes('FORBIDDEN')?'⛔':'✓','<span style="font-size:11.5px">'+U.esc(e)+'</span>')).join(''));
  const amd=AMENDMENTS.filter(a=>a.st==='PENDING');
  if(amd.length)h+=panel('AMENDMENT REQUESTS — outside-envelope, human token required','the FSM cannot self-authorize',
    amd.map(a=>'<div class="banner gold"><span class="bico">◆</span><div><b>'+a.id+' · '+a.trd+'</b> — '+U.esc(a.ask)+'<div class="i2" style="font-size:10.5px;margin:4px 0 8px">'+U.esc(a.why)+' · from '+a.from+'</div>'+
    '<span class="btnrow"><button class="btn sm pos" data-cmd="amd.decide" data-arg="'+a.id+'|APPROVE">Approve amendment</button><button class="btn sm neg" data-cmd="amd.decide" data-arg="'+a.id+'|REJECT">Reject</button></span></div></div>').join(''));
  h+=panel('CLOSED & AUDITED','the loop closes in Review',
    CLOSED_POSITIONS.map(c=>kv(c.id,c.sym+' '+c.instrument+' → <b class="up">'+c.res+'</b> · '+lc(c.fsm)+' · <span class="i2" style="font-size:10.5px">'+U.esc(c.note)+'</span>')).join(''));
  return h;
};
CMD.define({id:'pos.flatten',label:'Flatten position',purpose:'Close at market — always allowed, even during a halt (reduce-only)',
  run:a=>{UI.modal('FLATTEN '+a,'<p class="i1" style="line-height:1.6">Flattening is always inside the envelope — reduce-only survives even a kill-switch halt. Paper fill model v2.1 applies (spread + slippage, no fantasy fills).</p>',
    '<button class="btn" data-cmd="ui.closeModal">Cancel</button><button class="btn neg" data-cmd="pos.flatten.confirm" data-arg="'+a+'">FLATTEN NOW</button>')}});
CMD.define({id:'pos.flatten.confirm',label:'Flatten confirmed',purpose:'Execute the flatten',
  run:a=>{const i=POSITIONS.findIndex(p=>p.id===a);if(i<0)return;const p=POSITIONS[i];
    SVR.audit('HUMAN (owner)','order',p.id+' FLATTEN — market out · fill model v2.1 · uR '+U.R(p.uR)+' realized');
    CLOSED_POSITIONS.unshift({id:p.id,sym:p.sym,dir:p.dir,instrument:p.instrument,fsm:'CLOSED',res:U.R(p.uR),note:'Operator flatten at '+CLOCK.hm()+' — journaled, audit pending'});
    JOURNAL.unshift({t:CLOCK.hm(),id:p.id,sym:p.sym,kind:'CLOSED',what:'Operator flatten — inside envelope',grade:'—',outcome:U.R(p.uR),lesson:'Manual exits are journaled like any decision (LAW-018).'});
    POSITIONS.splice(i,1);S.openRiskR=Math.max(0,S.openRiskR-(p.uR>0?0:1));
    UI.closeModal();UI.toast(p.id+' flattened · '+U.R(p.uR)+' realized · journaled','ok','FLATTEN');render()}});
CMD.define({id:'amd.decide',label:'Decide amendment',purpose:'Approve/reject an outside-envelope amendment (human token)',
  run:a=>{const[id,d]=a.split('|');const am=AMENDMENTS.find(x=>x.id===id);if(!am)return;
    am.st=d==='APPROVE'?'APPROVED':'REJECTED';
    SVR.audit('HUMAN (owner)','amendment',id+' '+am.st+' — '+am.ask);
    UI.toast(id+' '+am.st.toLowerCase()+(d==='APPROVE'?' · token issued to S27 for this one change':' · FSM keeps original plan'),d==='APPROVE'?'gold':'ok','AMENDMENT');render()}});

VIEWS['portfolio.orders']=function(){
  let h=vhead('PORTFOLIO · orders & fills','Idempotent intents · durable states · honest fills',
    'Paper fill model v2.1: bid/ask spread, quote age, queue assumptions, partials, slippage — no fantasy fills. Every fill logs slippage vs plan.');
  h+=panel('','',tbl(['Time','ID','Sym','Side','Order','State','Fill detail','Link'],
    ORDERS.map(o=>'<tr><td class="mono">'+o.t+'</td><td class="mono">'+o.id+'</td><td class="mono"><b>'+o.sym+'</b></td><td class="mono">'+o.side+'</td><td class="i1" style="font-size:11px">'+U.esc(o.what)+'</td><td>'+lc(o.state)+'</td><td class="i2" style="font-size:10.5px">'+U.esc(o.fill)+'</td><td class="mono" style="font-size:10px">'+o.link+'</td></tr>').join('')),{flush:true});
  h+='<div class="grid g2">';
  h+=panel('FILL QUALITY — the fill model graded against itself','slippage is a measured cost, never a surprise',
    kv('AVG SLIPPAGE','$4.20/fill (1.1 bps) — inside the 3 bps program gate')+
    kv('TIME-TO-FILL','median 2.4s · p95 6.2s — resting limits, never chased')+
    kv('CHASE DECLINES','1 this week (ORD-3327) — the limit-discipline rule refusing to pay up')+
    kv('PARTIALS','0 — position sizes sit inside top-of-book depth by design')+
    kv('MODEL VERSION','fill model v2.1 — spread + quote-age + queue-position aware; version shown on every result'));
  h+=panel('ORDER STATE MACHINE','every order is somewhere in this FSM — UNKNOWN is a first-class state, not a bug',
    '<div class="row" style="margin-bottom:8px">'+['ORDER_SUBMITTED','WORKING','PARTIAL_FILL','FILLED','CANCELED','REJECTED_BY_BROKER','UNKNOWN'].map(st=>lc(st)).join('<span class="i2" style="font-size:9px">→</span>')+'</div>'+
    kv('UNKNOWN','API timeout after acceptance → reconcile against broker truth; NEVER auto-resend — duplicate orders are the classic account-killer')+
    kv('RECONCILE LOOP','Paper broker reconciled every 0.9s; any mismatch locks new orders and pages P1 (RB-03)')+
    kv('HALT BEHAVIOR','Kill switch blocks NEW risk; reduce-only close orders stay available when spreads are sane'));
  h+='</div>';
  h+='<div class="banner info"><span class="bico">i</span><div><b>Order safety doctrine:</b> idempotency key on every intent · unknown-state recovery without duplicate resend · broker reconciliation loop · options are limit-only. Live adapter: NOT CONFIGURED (disabled until Phase 8 gates pass — this is a feature, not a gap).</div></div>';
  return h;
};
VIEWS['portfolio.risk']=function(){
  const openPct=S.openRiskR/ck('risk.max_open_risk_R')*100;
  let h=vhead('PORTFOLIO · risk cockpit','Every cap, its config key, and the distance to it',
    'Circuit breakers are hard state transitions (LAW-011), not warnings. The ladder steps size DOWN after losses '+prov('risk.loss_ladder_step')+' — the prior trade cannot alter the next trade’s formula (LAW-012).');
  h+='<div class="grid g3">'+
    stat('Open risk',U.fmt(S.openRiskR,2)+'R / '+ck('risk.max_open_risk_R')+'R','<div class="gauge" style="margin-top:6px"><i style="width:'+openPct+'%;background:'+(openPct>85?'var(--blk)':openPct>60?'var(--warn)':'var(--pos)')+'"></i></div>')+
    stat('Day breaker',U.fmt(S.dayLossUsedR,2)+'R / '+ck('risk.max_day_loss_R')+'R','breach → risk_mode BLOCKED · hard transition '+prov('risk.max_day_loss_R'))+
    stat('Week breaker','0.00R / '+ck('risk.max_week_loss_R')+'R',prov('risk.max_week_loss_R'))+'</div>';
  h+='<div class="grid g2" style="margin-top:12px">';
  h+=panel('CLUSTER EXPOSURE','correlated risk counts as ONE position (S33)',
    tbl(['Cluster','Members','>Exposure','>Cap','State'],[
      ['Semis complex','NVDA (open) · AMD (blocked pkt)','1.1%',ck('risk.max_sector_exposure')+'%','<span class="up">CLEAR</span>'],
      ['Index short-vol','SPY 0DTE spread','0.4%',ck('risk.max_sector_exposure')+'%','<span class="up">CLEAR</span>'],
      ['Mega-tech','META (working)','0.5%',ck('risk.max_sector_exposure')+'%','<span class="up">CLEAR</span>']].map(r=>'<tr><td>'+r[0]+'</td><td class="i1" style="font-size:11px">'+r[1]+'</td><td class="r num">'+r[2]+'</td><td class="r num i2">'+r[3]+'</td><td class="mono">'+r[4]+'</td></tr>').join('')),{flush:true});
  h+=panel('BEHAVIORAL GUARDS','operator psychology is a risk family — gated like any other',
    kv('REVENGE-TRADE GUARD','<span class="up">CLEAR</span> — flags re-entry within 5 min of a stop-out (3-session pattern detection)')+
    kv('OVERTRADING GATE','<span style="color:var(--warn)">WATCHING</span> — win-rate drops ~14% after 11:00 ET; post-11:00 entries need grade ≥ A (MEM-03)')+
    kv('COOLDOWN RULE','2 consecutive reds → 10-minute lockout arms automatically (rung 2 of the loss ladder)')+
    kv('PDT COUNTER','2 of 3 day trades used — the desk counts so you don’t have to')+
    kv('WIN-STREAK RULE','5-win streak: still NO size-up — expectancy earns size, streaks do not (LAW-012)'));
  h+=panel('KILL-SWITCH AUTO-ENGAGE CONDITIONS','if any fails, the desk halts itself — you are the second line, not the first',
    tbl(['Condition','State'],[['Data feed connected + fresh','<span class="up">✓ 0.4s</span>'],['Broker (paper) reconciled','<span class="up">✓ 0.9s</span>'],['Daily loss limit not breached','<span class="up">✓ 0.0R of '+ck('risk.max_day_loss_R')+'R</span>'],['Slippage inside tolerance','<span class="up">✓ fill model nominal</span>'],['Spreads within gates','<span class="up">✓ promoted set clean</span>'],['No unplanned news shock','<span class="up">✓ tape calm</span>'],['Risk Officer / Director aligned','<span class="up">✓ no standing conflict</span>']].map(r=>'<tr><td>'+r[0]+'</td><td class="mono" style="font-size:11px">'+r[1]+'</td></tr>').join('')),{flush:true});
  h+=panel('PORTFOLIO GREEKS & EVENT RISK','the book’s shape, not just its size',
    '<div class="grid g4">'+stat('Net Δ','+0.24','long tilt, inside posture')+stat('Θ / day','+$13.6','credit carries the debits')+stat('Vega','+7.9','IV-crush watch: none inside 9 DTE')+stat('Event risk','FOMC 14:00','scalp time-stop 13:45 · CPI T+2d arms blackout')+'</div>');
  h+=panel('RISK MODE FSM & LOSS LADDER','psychology encoded as state machine',
    kv('CURRENT','<b>'+S.riskMode+'</b> — full formulaic size permitted')+
    kv('LADDER','NORMAL → REDUCED (weekly warning) → COOLDOWN (2-loss rule, rung 2) → BLOCKED (day breaker)')+
    kv('SIZE STEP','−'+ck('risk.loss_ladder_step')+'%/rung after losses '+prov('risk.loss_ladder_step'))+
    kv('WIN STREAK','5-win rule: still NO size-up — expectancy earns size, streaks do not (LAW-012)'));
  h+='</div>';
  return h;
};
VIEWS['portfolio.exposure']=function(){
  let h=vhead('PORTFOLIO · exposure','Direction, greeks, and concentration',
    'Net book greeks aggregate across positions; the desk treats correlated names as one bet.');
  h+='<div class="grid g4">'+
    stat('Net delta','+0.24 <span class="i2" style="font-size:10px">book</span>','long tilt · inside regime posture')+
    stat('Net theta','+$13.6/day','credit spread carries the debit legs')+
    stat('Net vega','+7.9','long vol tilt from NVDA calls')+
    stat('Positions','3 <span class="i2" style="font-size:10px">open</span>','2 managing · 1 working')+'</div>';
  h+=panel('CORRELATION MATRIX — the cluster cap’s evidence (RISK-041)','0.84 is why NVDA+AMD count as ONE bet',
    tbl(['','NVDA','AMD','SPY','META'],[['NVDA','1.00','<b style="color:var(--warn)">0.84</b>','0.61','0.52'],['AMD','<b style="color:var(--warn)">0.84</b>','1.00','0.58','0.47'],['SPY','0.61','0.58','1.00','0.66'],['META','0.52','0.47','0.66','1.00']].map(r=>'<tr><td class="mono"><b>'+r[0]+'</b></td>'+r.slice(1).map(c=>'<td class="r num">'+c+'</td>').join('')+'</tr>').join('')),{flush:true});
  h+=panel('BY DIRECTION & HORIZON','LAW-016 alignment check',
    tbl(['Position','Dir','Horizon','DTE','Aligned'],[
      ['NVDA 200C ×2','LONG','swing','21','✓'],
      ['SPY 601/599P ×4','SHORT (premium)','0DTE intraday','0','✓ · MOC blackout armed (EVT-014)'],
      ['META 605P ×1','SHORT','intraday-swing','10','✓ · paper ceiling (counter-regime)']].map(r=>'<tr><td class="mono">'+r[0]+'</td><td>'+r[1]+'</td><td>'+r[2]+'</td><td class="r num">'+r[3]+'</td><td class="i1" style="font-size:11px">'+r[4]+'</td></tr>').join('')),{flush:true});
  return h;
};
VIEWS['portfolio.account']=function(){
  let h=vhead('PORTFOLIO · paper account','Ring-fenced paper capital + the compounding program',
    'Paper results NEVER mix with live results. The program account is separate from the desk account, and both are separate from any future live book.');
  h+='<div class="grid g4">'+
    stat('Desk paper equity',U.moneyK(S.equity),'day '+U.money(S.dayPnl)+' · week '+U.money(S.weekPnl))+
    stat('Program account',U.moneyK(PROGRAM.equity),'stage '+PROGRAM.stage+' · started '+PROGRAM.started)+
    stat('Program expectancy',PROGRAM.exp,'process metric, not a promise')+
    stat('Drawdown',PROGRAM.dd,'auto-demotion is a feature')+'</div>';
  h+=panel('DESK EQUITY CURVE — paper','<span class="demo-wm">demo data</span>','<canvas id="pf-eq" class="cv" data-h="190"></canvas>');
  drawEquityCurve('pf-eq','desk',S.equity*0.93);
  h+=panel('COMPOUNDING CONE — 140 seeded paths × 170 trades','honest label: seeded simulation from program stats, not a promise · <span class="demo-wm">demo</span>','<canvas id="pf-cone" class="cv" style="height:230px"></canvas>');
  drawCone('pf-cone');
  h+=panel('COMPOUNDING PROGRAM — $1,000 → $100,000, staged and gated','promotion needs evidence; demotion is automatic. No stage skips, ever.',
    tbl(['Stage','Span','Risk / size','Evidence bar','Extra gate'],STAGES.map(st=>'<tr'+(st.s===PROGRAM.stage?' style="background:var(--live-bg)"':'')+'><td class="mono"><b>'+st.s+'</b>'+(st.s===PROGRAM.stage?' ◀ current':'')+'</td><td class="mono">'+st.span+'</td><td class="mono">'+st.risk+'</td><td class="i1" style="font-size:11px">'+st.need+'</td><td class="i2" style="font-size:11px">'+st.gate+'</td></tr>').join(''))+
    '<div class="i1" style="font-size:11px;padding:10px 12px">'+U.esc(PROGRAM.promo)+'</div>',{flush:true});
  h+='<div class="banner warn"><span class="bico">!</span><div><b>No return is guaranteed, ever.</b> This program is a discipline ladder with evidence gates — not a promise. Any tool claiming “10× monthly, guaranteed” is describing a fantasy; this desk refuses to.</div></div>';
  return h;
};
