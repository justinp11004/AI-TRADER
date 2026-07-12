/* ═══════════ V12 · early-prototype absorption (Enterprise OS lineage) ═══════════ */

/* ── sector rotation quilt (index5 heatmap) ── */
const SECTORS=[['XLK',+1.8,'Tech — leadership'],['SMH',+2.4,'Semis — leading the leaders'],['XLF',+0.4,'Financials — neutral'],['XLE',-0.7,'Energy — lagging'],['IWM',+0.1,'Small caps — speculative breadth imperfect'],['DIA',+0.2,'Industrials — neutral'],['HYG',+0.3,'Credit — risk appetite confirmed'],['TLT',-0.9,'Duration — rates drag'],['VIX',-3.2,'Vol — compressing'],['BTC',+1.1,'Crypto beta — supportive']];
function sectorQuilt(){
  return'<div class="grid g4" style="gap:8px">'+SECTORS.map(([s2,p,note])=>'<div style="border:1px solid var(--line);border-radius:var(--r);padding:9px 11px;background:'+(p>=0?'rgba(47,214,160,'+(0.04+Math.min(Math.abs(p),3)*0.03)+')':'rgba(242,99,124,'+(0.04+Math.min(Math.abs(p),3)*0.03)+')')+'"><div class="row" style="justify-content:space-between"><b class="mono" style="font-size:12px">'+s2+'</b><span class="mono '+(p>=0?'up':'dn')+'" style="font-size:12px">'+U.pct(p,1)+'</span></div><div class="i2" style="font-size:9.5px;margin-top:2px">'+note+'</div></div>').join('')+'</div>';
}

/* ── manager inbox — what every seat is pushing upward, and what it wants ── */
const INBOX=[
 {from:'S01 Risk Officer',to:'S00 Director',msg:'TSLA short chart-valid but only 4.2R realistic — veto stands until a structural entry improves R.',wants:'Nothing from you. Veto is absolute.',cls:'blk'},
 {from:'S22 Options Desk',to:'S00 Director',msg:'AMD 175C spread 8.9% — liquidity veto active. Spread normalizes within 30m in 64% of history.',wants:'Desk re-runs 11:00 automatically. LS-121 would formalize the wait state.',cls:'warn'},
 {from:'S02 Data Integrity',to:'S00 Director',msg:'Options-flow feed briefly degraded on PLTR (12m stale) — flow marked unusable for that name.',wants:'INF-021 (dual provider) awaits owner budget approval.',cls:'warn'},
 {from:'S05 Universe Scanner',to:'S00 Director',msg:'Cycle 21.4s · 3 promotions · 47 early rejections (93% compute saved by gates).',wants:'Nothing — inside budget.',cls:'ok'},
 {from:'S31 Learning Suggestion',to:'S03 Governance',msg:'Two proposals carry enough evidence for stage advance (LS-121 at 14/30 samples).',wants:'Court session when samples reach 30.',cls:'info'},
 {from:'S27 Trade Manager',to:'HUMAN',msg:'AMD-114: unfilled META limit wants time-extension 11:30 → 12:30. Outside envelope.',wants:'Your token — the FSM cannot self-authorize.',cls:'gold'},
];
/* ── conflict resolution board — named conflicts, named resolutions ── */
const CONFLICTS=[
 ['NVDA: chase vs wait','S05 Scanner promote-now vs S14 first-return-only','Entry model wins: no chase — first FVG return taken at 10:26, not the displacement candle.'],
 ['NVDA: crowding vs leadership','S21 heat 92nd pctile vs S09 RS 94th pctile','Hierarchy: sentiment is context, never trigger (CC-13). Dissent recorded, visible forever.'],
 ['TSLA: valid chart vs low R','S10 Wyckoff approve vs S26 5R fail','LAW-004 wins by construction. Blocked; shadow-tracked. Stop cannot be tightened to lie.'],
 ['AMD: A-chart vs bad contract','S12/S14 approve vs S22 liquidity veto','A bad contract invalidates a good chart (LAW-009). WAIT recommended, not terminal reject.'],
];

/* ── automation & schedules (index5 automation view) ── */
const SCHEDULES=[
 ['Pre-market brief','Daily 07:30 ET','S07 Daily Setup Report','READY'],
 ['Full-universe scan','Every '+ck('scan.universe_cycle_s')+'s RTH','S05 Universe Scanner','RUNNING'],
 ['Feed freshness sweep','Every 15s','S02 Data Integrity','RUNNING'],
 ['Earnings / catalyst intel','Hourly + event-driven','S18 / S19','RUNNING'],
 ['Position heartbeat','30s per open position','S27 Trade Manager','RUNNING'],
 ['Post-trade journal','After every close','S29 Journal Coach','ARMED'],
 ['Nightly scenario batch','02:00 ET','S30 Backtest Validation','SCHEDULED'],
 ['Learning review','EOD 16:20 ET','S31 Learning Suggestion','SCHEDULED'],
 ['EOD digest','16:30 ET','S32 Reporting','SCHEDULED'],
];

/* ── evidence vault (index5 files view) ── */
const VAULT=[
 ['Master KB bundle','/atlas/kb/latest','137 files · 20 layers · deduped · content-hashed'],
 ['Original source volumes','/atlas/original_sources','Wyckoff · SMC · ICT doctrine + chart screenshots'],
 ['Trade evidence vault','/atlas/trade_packets','every verification packet, decision + latency + surface'],
 ['Agent role manuals','/atlas/agents/v13','34 seat operating charters (deep manuals)'],
 ['Golden packet set','/atlas/golden/48','regression corpus — re-scored on every rules change'],
 ['Manifests & hashes','/atlas/manifests','SHA-256 audit records for every artifact'],
];

/* ── journal pattern detection (index5) ── */
const PATTERNS={best:'09:55–11:10 ET — killzone discipline pays (expectancy +1.31R vs +0.42R outside)',
 worst:'Chasing the first displacement — the #1 failure tag (31 cases). Fix live: first-return entry gate.',
 leak:'Early exits before T3 on winners — runner discipline drill in paper A/B.',
 suggestion:'Require 2-candle pullback after first impulse before any promotion (Suggestion #142 lineage → LS-118 family).'};

VIEWS['system.inbox']=function(){
  let h=vhead('SYSTEM · manager inbox','What every seat is pushing upward — and what it wants from whom',
    'Agents push; they do not wait to be asked. Only material items reach this inbox; risk events bypass batching entirely.');
  h+='<div class="grid g2">';
  h+=panel('UPWARD REPORTS','seat → integrator, with the ask made explicit',
    INBOX.map(m=>'<div class="banner '+(m.cls==='ok'?'ok':m.cls==='gold'?'gold':m.cls==='blk'?'blk':m.cls==='warn'?'warn':'info')+'" style="margin-bottom:8px"><span class="bico">'+(m.cls==='blk'?'⛔':m.cls==='gold'?'◆':'▸')+'</span><div><b style="font-size:11px">'+U.esc(m.from)+' → '+U.esc(m.to)+'</b><div class="i1" style="font-size:11.5px;margin:3px 0">'+U.esc(m.msg)+'</div><div class="i2" style="font-size:10.5px">WANTS: '+U.esc(m.wants)+'</div></div></div>').join(''));
  h+=panel('CONFLICT RESOLUTION BOARD','conflicts are named and resolved by hierarchy — never averaged, never hidden',
    tbl(['Conflict','Agents','Resolution'],CONFLICTS.map(c=>'<tr><td><b style="font-size:11px">'+c[0]+'</b></td><td class="i1" style="font-size:10.5px">'+c[1]+'</td><td class="i2" style="font-size:10.5px">'+c[2]+'</td></tr>').join(''))+
    '<div class="i2" style="font-size:10.5px;padding:8px 12px">Full vote-by-vote traces live in Decisions → Committee Rail.</div>',{flush:true});
  h+='</div>';
  h+=panel('AUTOMATION & SCHEDULES','the firm works without being prompted — cadence per seat, dispatch rules explicit',
    tbl(['Job','Cadence','Owner','State'],SCHEDULES.map(s2=>'<tr><td><b style="font-size:11.5px">'+s2[0]+'</b></td><td class="mono" style="font-size:10.5px">'+s2[1]+'</td><td class="i1" style="font-size:11px">'+s2[2]+'</td><td>'+chip(s2[3],s2[3]==='RUNNING'?'ch-ok':s2[3]==='READY'||s2[3]==='ARMED'?'ch-info':'ch-mut',s2[3]==='RUNNING'?'●':'·')+'</td></tr>').join(''))+
    '<div class="i2" style="font-size:10.5px;padding:8px 12px">Dispatch rules: agents push, not wait · only material items escalate · risk events bypass batching and page immediately.</div>',{flush:true});
  return h;
};

/* ═══════════ GEN1/GEN2 absorption — copilot, builder, memory, guards ═══════════ */

/* ── AI COPILOT — a disciplined quant analyst that will tell you NO TRADE ── */
const COPILOT={msgs:[{who:'atlas',txt:'Desk copilot online. I validate setups against the 5R contract, read regime and flow in context, and flag emotional leaks. I will tell you when the answer is NO TRADE. The market can do anything; I control process and risk. (DEMO — canned analyst, honest about it.)'}]};
function copilotReply(q){
  q=q.toLowerCase();
  const sym=SYMS.find(s2=>q.includes(s2.sym.toLowerCase()));
  if(q.includes('regime')||q.includes('market'))return'Regime: RISK-ON ROTATION — breadth 68%, VIX 14.2 drifting, semis leading. Doctrine: long leaders on pullbacks; counter-regime shorts capped at paper. Preferred playbooks today: MMBM Reversal, OTE Continuation. Avoid chasing the first 15 minutes.';
  if(q.includes('performance')||q.includes('how am i')||q.includes('review'))return'Process review: 2 of 3 rejections were correct; one miss traced to a data gap (AUT-118), not judgment. Your leak pattern: chasing the first displacement (31 cases). Plan: 1 · hard-stop new entries after 11:00 unless A-grade · 2 · 10-minute cooldown after any red · 3 · pre-commit size before entry, never average down.';
  if(q.includes('flow'))return'Flow read: NVDA 200C swept at ask twice ($3.0M) — confirmation-tier only. SPY 0DTE put block on BID is likely a hedge, discounted. Flow alone is NOT a setup: it can confirm or warn, never approve (S23 doctrine).';
  if(q.includes('5r')||q.includes('validate'))return'The 5R contract: realistic target vs the TRUE structural stop. The stop cannot be tightened to force the math (LAW-004, locked). Use Decisions → Trade Builder — it runs the same risk engine as the packet pipeline and will reject a reckless plan to your face.';
  if(sym){const pk=PACKETS.find(p=>p.sym===sym.sym&&p.state==='READY_FOR_HUMAN');
    return sym.sym+': '+sym.setup+' · '+sym.fsm+'. '+sym.note+(sym.unmet.length?' UNMET: '+sym.unmet.join(' · ')+'. Verdict: WATCH — not entry. No confirmation, no trade.':pk?' A complete packet is in your queue ('+pk.id+', grade '+pk.grade+'). Judge it there — I do not approve trades; the enum buttons do.':' All conditions met.')}
  return'I answer on: regime · flow · performance · 5R validation · any promoted symbol ('+SYMS.map(s2=>s2.sym).join(' ')+'). I refuse: predictions, guarantees, and trades without invalidation. NO_TRADE is a position.';
}
CMD.define({id:'ui.copilot',label:'Copilot',purpose:'Disciplined quant analyst drawer — ⌘J',audit:false,run:()=>{
  UI.drawer('<div class="dhead"><span class="dt">⌘J · ATLAS COPILOT</span><span class="pill">canned analyst · DEMO · says no</span><button class="dx" data-cmd="ui.closeDrawer">ESC</button></div>'+
   '<div class="dbody" id="cp-body">'+COPILOT.msgs.map(m=>'<div class="banner '+(m.who==='atlas'?'info':'gold')+'" style="margin-bottom:8px"><span class="bico">'+(m.who==='atlas'?'◈':'▸')+'</span><div style="font-size:11.5px;line-height:1.6">'+U.esc(m.txt)+'</div></div>').join('')+
   '<div class="row" style="margin-top:6px">'+['Read the regime','Validate NVDA','Review my performance','What does flow say?'].map(s2=>'<button class="btn sm" data-cmd="copilot.ask" data-arg="'+s2+'">'+s2+'</button>').join('')+'</div>'+
   '<div class="row" style="margin-top:10px"><input id="cp-in" class="inp" placeholder="Ask the desk… (it will say NO when no is the answer)" style="flex:1"><button class="btn pri" data-cmd="copilot.send">Send</button></div></div>');
  const inp=$('#cp-in');if(inp)inp.onkeydown=e=>{if(e.key==='Enter')CMD.run('copilot.send')};
}});
CMD.define({id:'copilot.ask',label:'Copilot chip',purpose:'Canned question',audit:false,run:a=>{COPILOT.msgs.push({who:'me',txt:a},{who:'atlas',txt:copilotReply(a)});CMD.run('ui.copilot')}});
CMD.define({id:'copilot.send',label:'Copilot send',purpose:'Ask the copilot',audit:false,run:()=>{const inp=$('#cp-in');if(!inp||!inp.value.trim())return;const q=inp.value.trim();COPILOT.msgs.push({who:'me',txt:q},{who:'atlas',txt:copilotReply(q)});CMD.run('ui.copilot')}});

/* ── TRADE BUILDER — manual plan through the SAME risk engine ── */
const BUILDER={sym:'NVDA',dir:'LONG',entry:196.80,stop:194.10,t1:199.80,t2:210.30,t3:217.05,riskPct:0.6,conf:{}};
const CONFLUENCE=['Market regime supports','Relative strength aligned','Structure (BOS/MSS/CHoCH)','Liquidity taken','Displacement confirmed','Entry zone valid (not late)','Structural stop protected','Target reaches 5R','Options contract fits','News/earnings risk known','Volume confirms','Trade is not late'];
CONFLUENCE.slice(0,8).forEach(c=>BUILDER.conf[c]=true);
function builderVerdict(){
  const b=BUILDER,den=Math.abs(b.entry-b.stop)||1e-9;
  const dir=b.dir==='LONG'?1:-1;
  const r2=dir*(b.t2-b.entry)/den,r3=dir*(b.t3-b.entry)/den;
  const rr=Math.max(r2,r3);
  const confN=CONFLUENCE.filter(c=>BUILDER.conf[c]).length;
  const riskUSD=S.equity*b.riskPct/100;
  const risk=SVR.riskCheck({riskUSD,riskR:b.riskPct/1.0,rr,spreadPct:3.1,eventHrs:400,sectorPct:1.1});
  let verdict,cls,why;
  if(risk.verdict==='BLOCK'){verdict='REJECTED';cls='ch-blk';why=risk.codes.filter(c=>!c.advisory).map(c=>c.code).join(' · ')+' — the stop is structural and cannot be tightened to force the math.'}
  else if(confN<7){verdict='WATCH_ONLY';cls='ch-warn';why=(12-confN)+' confluence factors missing — the desk would rather show you nothing than a bad trade.'}
  else if(rr<5.5||b.riskPct>1.0){verdict='APPROVED_REDUCED_SIZE';cls='ch-paper';why='Marginal edge ('+U.fmt(rr,1)+'R / '+confN+'/12) — size discipline applies.'}
  else{verdict='APPROVED';cls='ch-ok';why='Plan clears every gate at '+U.fmt(rr,1)+'R with '+confN+'/12 confluence. Still needs the packet pipeline + your enum for anything beyond paper.'}
  const quality=Math.round((Math.min(rr,8)/8)*45+(confN/12)*40+(b.riskPct<=0.6?15:b.riskPct<=1?8:0));
  return{r2,r3,rr,confN,verdict,cls,why,quality,risk};
}
CMD.define({id:'builder.set',label:'Builder input',purpose:'Update the trade plan (recomputes verdict live)',audit:false,run:(a,el)=>{
  const k=a||el.dataset.k;if(k==='dir'){BUILDER.dir=el.dataset.v}else if(k==='sym'){BUILDER.sym=el.value;const s2=symBy(el.value);if(s2&&s2.levels.entry){Object.assign(BUILDER,{entry:s2.levels.entry,stop:s2.levels.stop,t1:s2.levels.t1,t2:s2.levels.t2,t3:s2.levels.t3})}}
  else BUILDER[k]=parseFloat(el.value)||BUILDER[k];render()}});
CMD.define({id:'builder.conf',label:'Toggle confluence',purpose:'Confluence chips feed the verdict',audit:false,run:a=>{BUILDER.conf[a]=!BUILDER.conf[a];render()}});
CMD.define({id:'builder.stage',label:'Request packet build',purpose:'Send the plan to the desk — the pipeline decides, not the form',
  pre:()=>builderVerdict().verdict==='REJECTED'?'Plan is REJECTED by the risk engine — fix the plan, not the gate':null,
  run:()=>{const v2=builderVerdict();SVR.audit('HUMAN (owner)','builder','Manual plan staged: '+BUILDER.sym+' '+BUILDER.dir+' '+U.fmt(v2.rr,1)+'R · '+v2.confN+'/12 confluence · verdict '+v2.verdict+' — desk will assemble a full packet');
   UI.toast('Plan staged → the 14-step pipeline will assemble a full packet. Your form never becomes an order directly.','gold','TRADE BUILDER')}});
VIEWS['decisions.builder']=function(){
  const b=BUILDER,v2=builderVerdict();
  let h=vhead('DECISIONS · trade builder','Plan it yourself — through the SAME risk engine the machine uses',
    'The form computes nothing authoritative: every number goes through SVR.riskCheck, and a staged plan still runs the full packet pipeline. The stop is structural and cannot be tightened to force the math.');
  h+='<div class="grid g21">';
  h+=panel('THE PLAN','levels prefill from the selected symbol’s structure',
    '<div class="row" style="margin-bottom:10px"><select class="inp" style="width:110px" data-cmdin="builder.set" data-k="sym">'+SYMS.map(s2=>'<option'+(b.sym===s2.sym?' selected':'')+'>'+s2.sym+'</option>').join('')+'</select>'+
    '<span class="seg"><button class="'+(b.dir==='LONG'?'on':'')+'" data-cmd="builder.set" data-arg="dir" data-v="LONG">LONG</button><button class="'+(b.dir==='SHORT'?'on':'')+'" data-cmd="builder.set" data-arg="dir" data-v="SHORT">SHORT</button></span></div>'+
    '<div class="grid g3">'+[['entry','Entry'],['stop','TRUE structural stop'],['riskPct','Risk % equity'],['t1','T1'],['t2','T2'],['t3','T3']].map(([k,lb])=>'<div class="kv" style="border:none;flex-direction:column;align-items:stretch;gap:3px"><span class="k">'+lb+'</span><input class="inp" type="number" step="0.01" value="'+b[k]+'" data-cmdin="builder.set" data-k="'+k+'"></div>').join('')+'</div>'+
    '<div class="hr"></div><div class="kv" style="border:none"><span class="k">CONFLUENCE '+v2.confN+'/12</span><span class="v"><span class="row">'+CONFLUENCE.map(c=>'<button class="btn sm'+(BUILDER.conf[c]?' pri':'')+'" data-cmd="builder.conf" data-arg="'+U.esc(c)+'">'+(BUILDER.conf[c]?'✓ ':'')+c+'</button>').join('')+'</span></span></div>');
  h+=panel('VERDICT — computed, never chosen','REJECTED → WATCH_ONLY → APPROVED_REDUCED_SIZE → APPROVED',
    '<div style="margin-bottom:8px">'+chip(v2.verdict.replace(/_/g,' '),v2.cls,v2.verdict==='APPROVED'?'✓':v2.verdict==='REJECTED'?'✕':'!')+' <span class="pill">quality '+v2.quality+'/100</span></div>'+
    '<div class="i1" style="font-size:11.5px;line-height:1.6;margin-bottom:8px">'+U.esc(v2.why)+'</div>'+
    '<div class="rproof"><div class="rrow"><span class="lab">T2 path</span><span class="'+(v2.r2>=5?'up':'dn')+'">'+U.fmt(v2.r2,2)+'R</span></div><div class="rrow"><span class="lab">T3 path</span><span class="'+(v2.r3>=5?'up':'dn')+'">'+U.fmt(v2.r3,2)+'R</span></div><div class="rrow"><span class="lab">Risk</span><span>'+U.money(S.equity*b.riskPct/100)+' · '+U.fmt(b.riskPct,2)+'%</span></div></div>'+
    '<div class="hr"></div>'+kv('T1 ROLE','Risk reduction / first liquidity — trim ⅓, stop→BE')+kv('T2 ROLE','Trade payment / major structure — trim ⅓, trail structure')+kv('T3 ROLE','5R+ campaign target — runner to the draw on liquidity')+
    '<div class="btnrow" style="margin-top:10px">'+CMD.btn('builder.stage',null,'gold','Request packet build →')+'</div>');
  h+='</div>';
  if(v2.risk.codes.length)h+=panel('RISK ENGINE CODES','same codes, same engine as the packet pipeline',v2.risk.codes.map(c=>'<div class="'+(c.advisory?'banner warn':'blocker')+'" style="margin-bottom:6px">'+(c.advisory?'<span class="bico">!</span>':'<span class="bi">⛔</span>')+'<div><b class="mono">'+c.code+'</b> — '+U.esc(c.msg)+'</div></div>').join(''));
  return h;
};

/* ── AI MEMORY — editable, lockable operator rules ── */
const MEMORY=[
 {id:'MEM-01',cat:'RISK RULE',txt:'Risk tolerance: 0.6% default per trade · 1.8% daily · 4.5% weekly. Cooldown after 2 reds.',locked:true,critical:true},
 {id:'MEM-02',cat:'RISK RULE',txt:'No market orders on options. No illiquid contracts (spread > cap or OI < floor).',locked:true,critical:true},
 {id:'MEM-03',cat:'LEARNED PATTERN',txt:'Operator win-rate drops ~14% after 11:00 ET. Flag overtrading; tighten the approval gate intraday.',locked:false,critical:false},
 {id:'MEM-04',cat:'PERFORMANCE',txt:'Best setup: Wyckoff re-accumulation long in risk-on (avg 6.4R · 58% WR · n=214).',locked:false,critical:false},
 {id:'MEM-05',cat:'LEARNED PATTERN',txt:'Worst context: counter-trend shorts in risk-on. Auto-downgrade these to paper.',locked:true,critical:false},
];
let MEM_SEQ=5;
CMD.define({id:'memory.add',label:'Save rule',purpose:'Add an operator rule to ATLAS memory (versioned, court-visible)',
  run:()=>{const inp=$('#mem-in');if(!inp||!inp.value.trim()){UI.toast('Write the rule first','warn','MEMORY');return}
   MEMORY.unshift({id:'MEM-'+String(++MEM_SEQ).padStart(2,'0'),cat:'USER RULE',txt:inp.value.trim(),locked:false,critical:false});
   SVR.audit('HUMAN (owner)','memory','Rule saved: "'+inp.value.trim()+'" — applied forward, versioned');
   UI.toast('ATLAS will apply this rule going forward','gold','MEMORY');render()}});
CMD.define({id:'memory.lock',label:'Lock rule',purpose:'Locked rules cannot be deleted — not even by you, without an unlock audit',audit:false,run:a=>{const m=MEMORY.find(x=>x.id===a);if(m){m.locked=!m.locked;SVR.audit('HUMAN (owner)','memory',a+(m.locked?' LOCKED':' unlocked'));render()}}});
CMD.define({id:'memory.del',label:'Delete rule',purpose:'Remove an unlocked rule',pre:a=>{const m=MEMORY.find(x=>x.id===a);return m&&m.locked?'Rule is LOCKED — unlock first (audited)':null},run:a=>{const i=MEMORY.findIndex(x=>x.id===a);if(i>=0){SVR.audit('HUMAN (owner)','memory',MEMORY[i].id+' deleted: "'+MEMORY[i].txt.slice(0,50)+'…"');MEMORY.splice(i,1);render()}}});
VIEWS['review.memory']=function(){
  let h=vhead('REVIEW · AI memory','The rules ATLAS holds about YOU — editable, lockable, versioned',
    'Every rule is applied at gate-time and visible to the court. Locked rules survive everything except an audited unlock. The machine remembers your leaks so you don’t repeat them.');
  h+=panel('ADD A RULE','plain language in — enforced gate out',
    '<div class="row"><input id="mem-in" class="inp" placeholder="e.g. Avoid earnings within 3 sessions · No adds after 15:00 · Flag me if I re-enter within 5 minutes of a stop-out" style="flex:1"><button class="btn gold" data-cmd="memory.add">Save rule</button></div>');
  h+='<div class="grid g2">'+MEMORY.map(m=>'<div class="panel'+(m.critical?' crit':'')+'"><div class="ph"><span class="t">'+m.id+' · '+m.cat+'</span><span class="spacer"></span>'+(m.critical?chip('CRITICAL','ch-blk','⛔'):'')+(m.locked?chip('LOCKED','ch-live','◆'):'')+'</div><div class="pb"><div class="i1" style="font-size:11.5px;line-height:1.6;margin-bottom:8px">'+U.esc(m.txt)+'</div><div class="btnrow"><button class="btn sm" data-cmd="memory.lock" data-arg="'+m.id+'">'+(m.locked?'Unlock (audited)':'Lock')+'</button>'+CMD.btn('memory.del',m.id,'sm neg','Delete')+'</div></div></div>').join('')+'</div>';
  h+=panel('MHH BOARD — mistakes · habits · history','every flaw, human OR machine, walks the same five steps to silence',
    MHH.map(m=>'<div class="banner '+(m.who==='HUMAN'?'gold':'info')+'" style="margin-bottom:8px"><span class="bico">'+(m.who==='HUMAN'?'◆':'▸')+'</span><div style="flex:1"><b>'+m.id+' · '+m.who+'</b> — '+U.esc(m.flaw)+
    '<div class="row" style="margin:6px 0">'+m.steps.map((st,i)=>'<span class="tag" style="'+(st==='—'?'opacity:.4':'')+'">'+(i+1)+'·'+U.esc(st.split(':')[0])+'</span>').join('')+'</div>'+
    kv('CORRECTION LINE','<span class="mono" style="font-size:10.5px;color:var(--paper)">'+U.esc(m.line)+'</span> — injected at gate-time, verbatim')+
    '<div class="row"><span class="i2" style="font-size:10px">sessions silent: '+m.silent+'/'+m.goal+'</span><div class="gauge" style="width:120px"><i style="width:'+(m.silent/m.goal*100)+'%"></i></div></div></div></div>').join(''));
  h+=panel('LEARNING QUEUE — promotions awaiting you','soft flags become enforced rules only with your sign-off',
    '<div class="banner gold"><span class="bico">◆</span><div><b>Promote:</b> “No entries after 11:00 unless grade ≥ A” from soft flag → enforced gate. Evidence: −14% WR post-11:00 (n=50). <span class="btnrow" style="margin-top:6px"><button class="btn sm pos" data-cmd="memory.promote" data-arg="yes">Accept — enforce it</button><button class="btn sm" data-cmd="memory.promote" data-arg="no">Dismiss</button></span></div></div>');
  return h;
};
CMD.define({id:'memory.promote',label:'Rule promotion',purpose:'Human sign-off on a soft-flag → enforced-rule promotion',
  run:a=>{if(a==='yes'){MEMORY.unshift({id:'MEM-'+String(++MEM_SEQ).padStart(2,'0'),cat:'RISK RULE',txt:'No entries after 11:00 ET unless grade ≥ A. Enforced at the approval gate.',locked:true,critical:false});SVR.audit('HUMAN (owner)','memory','Soft flag PROMOTED to enforced rule: post-11:00 A-grade gate');UI.toast('Rule enforced — the gate now holds it','gold','MEMORY')}else{SVR.audit('HUMAN (owner)','memory','Rule promotion dismissed — flag stays soft');UI.toast('Kept as a soft flag','','MEMORY')}render()}});

/* ── onboarding — the discipline contract (compact, replayable) ── */
CMD.define({id:'onboard',label:'Discipline contract',purpose:'First-run calibration — replayable from the palette',audit:false,run:()=>{
  UI.modal('◈ THE DISCIPLINE CONTRACT',
   '<div class="i1" style="line-height:1.65;font-size:12px;margin-bottom:10px">Four clauses, pre-locked into Memory. This desk enforces them; it does not negotiate them.</div>'+
   [['5R MINIMUM','No live trade unless the realistic target pays at least 5R against the TRUE structural stop.'],
    ['STRUCTURAL STOPS ONLY','Risk is defined by structure, never by convenience. Widening is forbidden; tightening-to-lie is forbidden.'],
    ['NO-TRADE IS A POSITION','Standing aside in chop or event-risk is a valid, journaled decision.'],
    ['KILL SWITCH ARMED','Trading halts on feed loss, daily-loss breach, or news shock — automatically.']].map(([t,d])=>'<div class="banner gold" style="margin-bottom:6px"><span class="bico">◆</span><div><b>'+t+'</b><div class="i1" style="font-size:11px;margin-top:2px">'+d+'</div></div></div>').join('')+
   '<div class="i2" style="font-size:10.5px;margin-top:8px">Prime directive: Do not predict. Classify context. Wait for manipulation. Require confirmation. Define risk. Manage the trade. Learn from outcome.</div>',
   '<button class="btn gold wide" data-cmd="onboard.done">ENTER ATLAS →</button>')}});
CMD.define({id:'onboard.done',label:'Contract acknowledged',purpose:'Close onboarding',run:()=>{SVR.audit('HUMAN (owner)','onboard','Discipline contract acknowledged — 5R contract locked in Memory');UI.closeModal();UI.toast('Desk calibrated. The 5R contract is locked in Memory.','gold','ATLAS')}});
