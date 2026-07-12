/* ═══════════ DECISIONS · evidence → governed decision ═══════════ */
VIEWS['decisions.queue']=function(){
  const q=PACKETS.filter(p=>p.state==='READY_FOR_HUMAN');
  const blocked=PACKETS.filter(p=>p.state==='RISK_BLOCKED');
  const done=PACKETS.filter(p=>!['READY_FOR_HUMAN','RISK_BLOCKED'].includes(p.state));
  let h=vhead('DECISIONS · verification queue','Awaiting your judgment',
    'A packet is an immutable point-in-time snapshot. Any material change to plan, quote, freshness, or exposure invalidates prior approval and forces revalidation.');
  h+=panel('READY FOR HUMAN — '+q.length,'LAW-007: complete packet + explicit human approval, or nothing',
    q.length?q.map(p=>'<div class="kv" style="cursor:pointer;padding:9px 0" data-cmd="nav.decisions.packet" data-arg="'+p.id+'"><span class="k">'+p.id+'</span><span class="v"><b style="font-size:13px">'+p.sym+' '+p.dir+'</b> · '+U.esc(p.instrument)+' · '+p.playbook+' · grade <b>'+p.grade+'</b> ('+p.gradeN+') · '+p.sections+'/'+ck('packet.sections_required')+' sections · '+voteSummary(p.votes)+' '+voteChips(p.votes)+'<br><span class="mono" style="color:var(--live);font-size:10.5px">TTL '+fmtTTL(p)+'</span> <span class="i2" style="font-size:10.5px">· assembled '+p.assembled+' · '+U.esc(p.freshTxt)+'</span></span></div>').join(''):'<div class="empty"><div class="e1">QUEUE CLEAR</div>Rejection is the default state of this desk. A clear queue means the gates are doing their job.</div>',{cls:q.length?'gold':''});
  h+=panel('RISK-BLOCKED — '+blocked.length,'fail-closed with named blockers; these never reach your queue half-broken',
    blocked.map(p=>'<div class="kv" style="cursor:pointer;padding:9px 0" data-cmd="nav.decisions.packet" data-arg="'+p.id+'"><span class="k">'+p.id+'</span><span class="v"><b>'+p.sym+' '+p.dir+'</b> · '+p.playbook+' · '+p.sections+'/'+ck('packet.sections_required')+' sections'+
      p.votes.filter(v=>v.verdict==='block').map(v=>'<div class="blocker" style="margin-top:6px"><span class="bi">⛔</span><div><b>'+v.seat+' '+SEATBY[v.seat].nm+'</b> — '+U.esc(v.txt)+'<div class="mono" style="color:var(--blk);font-size:10px;margin-top:2px">'+v.hard.map(U.esc).join(' · ')+'</div></div></div>').join('')+
      (p.missing.length?'<div class="i2" style="font-size:10.5px;margin-top:4px">MISSING: '+p.missing.map(U.esc).join(' · ')+'</div>':'')+'</span></div>').join('')||'<div class="empty">No blocked packets.</div>');
  h+=panel('DECIDED THIS SESSION','append-only; every decision journals (LAW-018)',
    done.map(p=>'<div class="kv" style="cursor:pointer" data-cmd="nav.decisions.packet" data-arg="'+p.id+'"><span class="k">'+p.id+'</span><span class="v">'+p.sym+' '+p.dir+' → <b>'+U.esc(p.decision||p.state)+'</b> at '+(p.decidedAt||'—')+' '+lc(p.state)+(p.tokenId?' <span class="tag">'+p.tokenId+'</span>':'')+'</span></div>').join('')||'<div class="empty">Nothing decided yet this session.</div>');
  return h;
};

VIEWS['decisions.packet']=function(arg){
  const p=pktBy(arg||S.packet)||PACKETS[0];S.packet=p.id;
  const canDecide=p.state==='READY_FOR_HUMAN';
  let h=vhead('DECISIONS · packet detail — immutable rev '+p.rev,
    p.id+' <span style="font-size:13px">'+p.sym+' '+p.dir+'</span> '+lc(p.state)+' '+chip('GRADE '+p.grade+' · '+p.gradeN,'ch-live','◆'),
    U.esc(p.instrument)+' · '+p.playbook+' · assembled '+p.assembled+' · '+U.esc(p.freshTxt)+' · plan-hash <span class="mono">'+p.planHash+'</span>'+(canDecide?' · TTL <b class="mono" id="pk-ttl">'+fmtTTL(p)+'</b>':''));
  /* R-math proof — always above the fold */
  const r=p.rmath;
  h+='<div class="grid g21">';
  h+=panel('RISK MATH — computed live from levels, never trusted from a stored field','R = (target − entry) ÷ (entry − stop)',
    '<div class="grid g4" style="margin-bottom:10px">'+
      stat('Entry',U.fmt(r.entry),'limit')+stat('TRUE structural stop',U.fmt(r.stop),'below spring low + buffer — never tightened for math (LAW-004)')+
      stat('Risk / unit','$'+U.fmt(r.riskPer,2),r.contracts+' contracts = $'+U.fmt(r.riskUSD,0)+' = '+U.fmt(r.riskUSD/S.equity*100,1)+'% equity')+
      stat('5R proof','<span class="up">'+U.fmt(r.r2,2)+'R @ '+r.fiveTarget+'</span>','≥ '+ck('risk.min_rr')+'R '+prov('risk.min_rr'),'hot')+'</div>'+
    '<div class="rproof">'+
      '<div class="rrow"><span class="lab">T1 '+U.fmt(r.t1)+' — take 25%, stop→BE</span><span>'+U.fmt(r.r1,2)+'R</span></div>'+
      '<div class="rrow"><span class="lab">T2 '+U.fmt(r.t2)+' — take 50%, stop→T1 · THE 5R LEVEL</span><span class="up">'+U.fmt(r.r2,2)+'R</span></div>'+
      '<div class="rrow"><span class="lab">T3 '+U.fmt(r.t3)+' — runner, trail 5m swings</span><span>'+U.fmt(r.r3,2)+'R</span></div></div>'+
    (p.fiveR?'<div class="hr"></div>'+kv('WHY REALISTIC',U.esc(p.fiveR.why))+kv('WHAT KILLS IT',U.esc(p.fiveR.kills))+kv('OPTION PATH',U.esc(p.fiveR.optionPath)):''));
  h+=panel('COMMITTEE — '+p.votes.length+' voting seats','Director integrates by hierarchy; votes are never averaged',
    '<div style="margin-bottom:8px">'+voteChips(p.votes)+'</div>'+
    '<div class="i1" style="font-size:11px;margin-bottom:8px">'+voteSummary(p.votes)+' · hover any seat for its reasoning</div>'+
    (p.dissent.length?p.dissent.map(d=>'<div class="banner warn" style="margin-bottom:6px"><span class="bico">◮</span><div><b>DISSENT · '+d.seat+' '+SEATBY[d.seat].nm+'</b> — '+U.esc(d.note)+'</div></div>').join(''):'')+
    kv('HIERARCHY','<span style="font-size:10.5px">'+HIERARCHY+'</span>'));
  h+='</div>';
  /* the 19 sections */
  if(p.secs){
    h+='<div class="ivory"><h3>VERIFICATION PACKET '+p.id+' — THE DOCUMENT A HUMAN SIGNS</h3>'+
      '<div style="font-size:10.5px;color:#6B5F3E;margin-bottom:8px">The only light surface in this terminal, deliberately: LAW-007 says a human signs a <i>document</i>, not a widget. 19 sections, complete or nothing.</div>'+
      '<div class="btnrow" style="margin-bottom:8px"><button class="btn sm" data-cmd="pkt.expand" data-arg="open" style="background:#E5DEC9;border-color:#C9BFA5;color:#403820">Expand all 19</button><button class="btn sm" data-cmd="pkt.expand" data-arg="close" style="background:#E5DEC9;border-color:#C9BFA5;color:#403820">Collapse all</button></div>'+
      p.secs.map((s2,i)=>'<details class="isec" open><summary>§'+(i+1)+' · '+U.esc(s2[0]).toUpperCase()+'</summary><div>'+U.esc(s2[1])+'</div></details>').join('')+
      '<div class="sigline"><span>OPERATOR SIGNATURE — a canonical decision enum below constitutes signature <span class="goldseal">◆ LAW-007</span></span><span class="mono">'+p.planHash+' · assembled '+p.assembled+'</span></div></div>';
  }else{
    h+='<div class="banner blk"><span class="bico">⛔</span><div><b>'+p.sections+'/'+ck('packet.sections_required')+' sections.</b> Incomplete packet — full section render withheld. MISSING: '+p.missing.map(U.esc).join(' · ')+'. No clean packet, no trade.</div></div>';
  }
  /* votes full table */
  h+=panel('EVERY VOTE, WITH REASONING','each claim cites evidence or is discarded as opinion',
    tbl(['Seat','Verdict','Reasoning','Hard blockers'],p.votes.map(v2=>'<tr'+(v2.verdict==='block'?' style="background:var(--blk-bg)"':'')+'><td class="mono" style="cursor:pointer" data-cmd="nav.system.agents" data-arg="'+v2.seat+'"><b>'+v2.seat+'</b> '+SEATBY[v2.seat].nm+'</td><td>'+chip(v2.verdict,v2.verdict==='pass'?'ch-ok':v2.verdict==='advisory'?'ch-warn':v2.verdict==='block'?'ch-blk':'ch-mut',v2.verdict==='pass'?'✓':v2.verdict==='block'?'✕':'!')+'</td><td class="i1" style="font-size:11px">'+U.esc(v2.txt)+'</td><td class="mono" style="font-size:10px;color:var(--blk)">'+v2.hard.map(U.esc).join('<br>')+'</td></tr>').join('')),{flush:true});
  if(p.id==='PKT-2231')h+=panel('DIRECTOR SELF-AUDIT — six answers, every decision','the Director interrogates itself before it interrogates you',
    [['Am I predicting or classifying?','Classifying: re-accumulation context confirmed by spring+test; no price prediction anywhere in the thesis.'],
     ['Did manipulation come first?','Yes — the Asia-low sweep IS the manipulation; entry only exists because someone was trapped.'],
     ['Is confirmation objective?','5m MSS with displacement 74/100 on close — a computable event, not a feeling.'],
     ['Is risk defined by structure?','Stop 194.10 below spring low + buffer; it would be wrong there, and nowhere tighter.'],
     ['Is the management plan pre-committed?','25/50/75 template + 14:00 time-stop, locked before entry — the FSM owns it, not the mood.'],
     ['What will I learn either way?','Displacement 60-vs-65 band tag feeds LS-118 regardless of outcome (§19).']]
    .map((r,i)=>kv('Q'+(i+1)+' · '+r[0],'<span style="font-size:11px">'+r[1]+'</span>')).join(''));
  /* the desk argues against itself before it asks you */
  if(p.id==='PKT-2231')h+=panel('REJECTION REASONS CONSIDERED','every canonical reject reason was argued — here is why each failed to kill the trade',
    tbl(['Reason','Verdict','Argument'],[
     ['WRONG_STRUCTURE','REJECTED','Daily BOS + discount + qualified 5m break — structure is the strongest part of this packet'],
     ['NO_5R','REJECTED','T2 5.00R computed live vs the TRUE stop; target sits at untaken liquidity'],
     ['BAD_OPTIONS_CHAIN','REJECTED','Spread 3.1% · OI 14.2k · IVR 41 — three alternatives priced and beaten'],
     ['NEWS_RISK','REJECTED','Earnings T-21d; no macro event inside the window'],
     ['CHASING','REJECTED','First FVG return, not the displacement candle — entry model satisfied'],
     ['LOW_CONFIDENCE','PARTIALLY UPHELD','S21 crowding advisory stands as recorded dissent — priced as context, not veto'],
     ['ARCHIVE_AS_LEARNING','OPEN','Displacement 60-vs-65 tag feeds LS-118 regardless of outcome'],
    ].map(r=>'<tr'+(r[1]==='PARTIALLY UPHELD'?' style="background:var(--warn-bg)"':'')+'><td class="mono" style="font-size:10.5px">'+r[0]+'</td><td>'+chip(r[1],r[1]==='REJECTED'?'ch-ok':r[1]==='OPEN'?'ch-info':'ch-warn',r[1]==='REJECTED'?'✕':'!')+'</td><td class="i1" style="font-size:11px">'+r[2]+'</td></tr>').join('')),{flush:true});
  /* decision bar */
  const dis=why=>' disabled data-blocked="'+U.esc(why)+'"';
  const mkBtn=(d,cls)=>{
    if(!canDecide)return'<button class="btn '+cls+'"'+dis('Packet is '+p.state+' — decisions apply only to READY_FOR_HUMAN')+'>'+d.replace(/_/g,' ')+'</button>';
    if(d==='APPROVE_LIVE')return'<button class="btn '+cls+'"'+dis('Unavailable in DEMO.\nRequires LIVE_HUMAN_APPROVED mode · 19/19 sections · fresh server token ('+ck('token.ttl_sec')+'s, single-use, plan-hash bound) · kill switch clear.\nLAW-007 · GOV-024')+'>APPROVE LIVE</button>';
    if(S.kill)return'<button class="btn '+cls+'"'+dis('Kill switch active — all order-capable controls locked')+'>'+d.replace(/_/g,' ')+'</button>';
    return'<button class="btn '+cls+'" data-cmd="pkt.decide" data-arg="'+p.id+'|'+d+'">'+d.replace(/_/g,' ')+'</button>';
  };
  h+=panel('HUMAN DECISION — canonical enums only (LAW-014)','free-text approval does not exist; every choice journals (LAW-018)',
    '<div class="btnrow" style="margin-bottom:8px">'+mkBtn('APPROVE_PAPER_ONLY','pos')+mkBtn('APPROVE_REDUCED_SIZE','pos')+mkBtn('APPROVE_LIVE','gold')+'</div>'+
    '<div class="btnrow" style="margin-bottom:8px">'+mkBtn('WAIT_FOR_TRIGGER','')+mkBtn('MODIFY_LEVELS','')+mkBtn('LOG_AND_REVIEW','')+'</div>'+
    '<div class="btnrow">'+mkBtn('REJECT_BAD_TRADE','neg')+mkBtn('REJECT_BAD_CONTRACT','neg')+mkBtn('REJECT_NEEDS_MORE_DATA','neg')+'</div>'+
    '<div class="i2" style="font-size:10.5px;margin-top:10px">Keys <kbd>1</kbd>–<kbd>9</kbd> fire the enums in order — the desk is keyboard-first. On approval a single-use server token is issued — '+ck('token.ttl_sec')+'s TTL, bound to plan-hash '+p.planHash+'. Execution revalidates everything at order time: NO TOKEN · NO ORDER · NO ADMIN BYPASS.</div>'+
    '<div class="btnrow" style="margin-top:8px"><button class="btn sm" data-cmd="pkt.pocket" data-arg="'+p.id+'">📱 Pocket-gate preview</button></div>');
  return h;
};
CMD.define({id:'pkt.decide',label:'Decide packet',purpose:'Apply a canonical decision enum to a packet',
  run:a=>{const[id,d]=a.split('|');const p=pktBy(id);if(!p)return;
    if(d.startsWith('REJECT')){
      UI.modal('REJECT '+id+' — reason required (LAW-018)',
        '<div class="i1" style="margin-bottom:10px">Rejections are data. Pick the canonical reason — it feeds the autopsy pipeline and the shadow tracker.</div>'+
        '<div class="btnrow">'+ENUMS.REJECT_REASONS.map(rr=>'<button class="btn sm neg" data-cmd="pkt.reject.final" data-arg="'+id+'|'+d+'|'+rr+'">'+rr.replace(/_/g,' ')+'</button>').join('')+'</div>',
        '<button class="btn" data-cmd="ui.closeModal">Cancel</button>');
      return}
    if(d==='MODIFY_LEVELS'){UI.toast('Level modification creates packet rev '+(p.rev+1)+' and re-runs S26 5R proof + S01 risk — the desk rebuilds, you re-judge. (Demo: revision pipeline simulated.)','warn','MODIFY_LEVELS');SVR.audit('HUMAN (owner)','decision',p.id+' MODIFY_LEVELS requested — revision pipeline armed');return}
    const res=SVR.packetDecide(p,d);
    if(!res.ok){UI.toast(res.msg,'blk','SVR');return}
    if(p.state==='APPROVED_PAPER'){
      const t=SVR.issueToken(p.id,p.planHash,d);p.tokenId=t.id;
      UI.toast(p.id+' → '+d+' · token '+t.id+' ('+ck('token.ttl_sec')+'s, single-use) · paper order routed through the same gate as live','paper','DECISION');
    }else{UI.toast(p.id+' → '+d+' · journaled','ok','DECISION')}
    render()}});
CMD.define({id:'pkt.expand',label:'Expand/collapse packet',purpose:'Open or close all 19 sections of the ivory document at once',audit:false,
  run:a=>{document.querySelectorAll('.ivory details').forEach(d=>d.open=(a==='open'))}});
CMD.define({id:'pkt.pocket',label:'Pocket gate preview',purpose:'How this packet reaches your phone — same enums, same laws, smaller screen',audit:false,
  run:a=>{const p=pktBy(a);if(!p)return;
    UI.modal('📱 ATLAS GATE BOT — pocket preview',
     '<div class="code" style="line-height:1.7">◈ '+p.id+' · '+p.sym+' '+p.dir+' · '+U.esc(p.instrument)+'\n'+p.playbook+' · grade '+p.grade+' ('+p.gradeN+')\n5R: T2 '+U.fmt(p.rmath.t2)+' = '+U.fmt(p.rmath.r2,2)+'R vs TRUE stop '+U.fmt(p.rmath.stop)+'\nDISSENT: '+(p.dissent[0]?U.esc(p.dissent[0].note.slice(0,80))+'…':'none')+'\nhash '+p.planHash+' · expires '+fmtTTL(p)+'</div>'+
     '<div class="btnrow" style="margin-top:10px">'+['APPROVE LIVE ⁽²ˣ⁾','REDUCED SIZE','PAPER ONLY','WAIT','REJECT…','LOG & REVIEW'].map(b=>'<button class="btn sm" disabled data-blocked="Preview only — the real pocket gate is a production Telegram bot. Same enums (LAW-014), same token TTL ('+ck('token.ttl_sec')+'s), APPROVE_LIVE needs a second confirm tap.">'+b+'</button>').join('')+'</div>'+
     '<div class="i2" style="font-size:10.5px;margin-top:8px">NEVER on mobile: config edits · learning approvals — governance is a desk activity. Quiet hours 22:00–07:00; only P0 breaks through.</div>',
     '<button class="btn" data-cmd="ui.closeModal">Close</button>')}});
CMD.define({id:'pkt.reject.final',label:'Reject with reason',purpose:'Finalize rejection with canonical reason',
  run:a=>{const[id,d,rr]=a.split('|');const p=pktBy(id);if(!p)return;
    const res=SVR.packetDecide(p,d,rr);
    if(!res.ok){UI.toast(res.msg,'blk','SVR');return}
    UI.closeModal();UI.toast(p.id+' rejected · '+rr+' · shadow-tracking armed — if this runs, the autopsy will say so','ok','REJECTED');render()}});

VIEWS['decisions.riskproof']=function(){
  const p=pktBy(S.packet)||PACKETS[0];
  const verdict=SVR.riskCheck(p.rmath);
  let h=vhead('DECISIONS · risk proof','Deterministic risk engine — structured reason codes, never a vague score',
    'This exact check runs server-side before any approval AND again at order submission. The UI renders the verdict; it never computes authority.');
  h+='<div class="grid g21">';
  h+=panel('RISK ENGINE VERDICT — '+p.id,'callable without any LLM; property-tested',
    '<div style="margin-bottom:10px">'+(verdict.verdict==='PASS'?chip('PASS — all gates clear','ch-ok','✓'):chip('BLOCK — '+verdict.codes.filter(c=>!c.advisory).length+' gate(s)','ch-blk','⛔'))+'</div>'+
    (verdict.codes.length?verdict.codes.map(c=>'<div class="'+(c.advisory?'banner warn':'blocker')+'" style="margin-bottom:6px">'+(c.advisory?'<span class="bico">!</span>':'<span class="bi">⛔</span>')+'<div><b class="mono">'+c.code+'</b> — '+U.esc(c.msg)+'</div></div>').join(''):'<div class="i1">No blocking codes. Gates evaluated: size · open-risk · 5R · spread · event window · sector cluster · data freshness · circuit breakers · kill switch.</div>')+
    (verdict.required.length?'<div class="hr"></div>'+verdict.required.map(q=>kv('REQUIRED',U.esc(q))).join(''):''));
  h+=panel('GATES & CURRENT READINGS','every threshold cites its config key (LAW-015)',
    kv('Per-trade risk','$'+U.fmt(p.rmath.riskUSD,0)+' = '+U.fmt(p.rmath.riskUSD/S.equity*100,2)+'% vs cap '+ck('risk.max_trade_risk_pct')+'% '+prov('risk.max_trade_risk_pct'))+
    kv('Open risk after',U.fmt(S.openRiskR+p.rmath.riskR,2)+'R vs '+ck('risk.max_open_risk_R')+'R '+prov('risk.max_open_risk_R'))+
    kv('5R proof',U.fmt(p.rmath.rr,2)+'R vs floor '+ck('risk.min_rr')+'R '+prov('risk.min_rr'))+
    kv('Contract spread',U.fmt(p.rmath.spreadPct,1)+'% vs '+ck('options.max_spread_pct')+'% '+prov('options.max_spread_pct'))+
    kv('Sector cluster',U.fmt(p.rmath.sectorPct,1)+'% vs '+ck('risk.max_sector_exposure')+'% '+prov('risk.max_sector_exposure'))+
    kv('Event window',Math.round(p.rmath.eventHrs/24)+'d out vs '+ck('risk.event_window_hrs')+'h '+prov('risk.event_window_hrs')));
  h+='</div>';
  h+=panel('APPROVAL TOKEN — what live approval actually is','a server-issued, short-lived capability, not a frontend boolean',
    '<div class="grid g2"><div>'+Object.entries(TOKEN_DOCTRINE.claims).map(([k,v2])=>kv(k.toUpperCase(),'<span class="mono" style="font-size:10.5px">'+U.esc(v2)+'</span>')).join('')+'</div>'+
    '<div><div class="kv" style="border:none"><span class="k">PREFLIGHT ×10</span><span class="v i2" style="font-size:10.5px">re-run at order submission — any drift invalidates the token</span></div>'+TOKEN_DOCTRINE.preflight.map((q,i)=>'<div class="kv"><span class="k mono">'+(i+1)+'</span><span class="v" style="font-size:11px">'+U.esc(q)+'</span></div>').join('')+'</div></div>'+
    '<div class="banner gold" style="margin-top:10px"><span class="bico">◆</span><div><b>'+TOKEN_DOCTRINE.rule+'</b></div></div>');
  return h;
};
VIEWS['decisions.history']=function(){
  let h=vhead('DECISIONS · history','Approvals, rejections, expiries — the full record',
    'Process quality is graded at decision time, not in hindsight. Rejections carry equal weight in the record.');
  h+='<div class="grid g4">'+
    stat('Median decision latency','3m 40s','packet-ready → enum · target < TTL/3')+
    stat('Rejection share','93%','of promoted ideas — selectivity IS the product')+
    stat('Approvals honored at tier','100%','no paper approval has leaked toward live')+
    stat('Expired unjudged','1 this week','AUT-115 — auto-reopen fix in court')+'</div>';
  h+=panel('ENUM USAGE — how you actually decide','canonical enums only (LAW-014); the distribution is itself a discipline metric',
    tbl(['Decision enum','>Uses (30d)','Note'],[
     ['APPROVE_PAPER_ONLY','11','the workhorse — paper tier is the pressure valve'],
     ['WAIT_FOR_TRIGGER','9','patience, journaled'],
     ['REJECT_BAD_TRADE','14','the most-used reject — chasing filter earns its keep'],
     ['REJECT_BAD_CONTRACT','6','LAW-009 in practice'],
     ['REJECT_NEEDS_MORE_DATA','4','freshness discipline (one became AUT-118)'],
     ['MODIFY_LEVELS','3','each spawned a packet revision'],
     ['LOG_AND_REVIEW','2','archived as teaching examples'],
     ['APPROVE_REDUCED_SIZE','2','marginal-edge tier'],
     ['APPROVE_LIVE','0','DEMO — structurally unavailable, honestly'],
    ].map(r=>'<tr><td class="mono" style="font-size:10.5px">'+r[0]+'</td><td class="r num">'+r[1]+'</td><td class="i2" style="font-size:10.5px">'+r[2]+'</td></tr>').join('')),{flush:true});
  h+=panel('FULL RECORD','',tbl(['When','Ref','Sym','Kind','Decision / event','>Outcome','Process lesson'],
    JOURNAL.map(j=>'<tr><td class="mono">'+j.t+'</td><td class="mono">'+j.id+'</td><td class="mono"><b>'+j.sym+'</b></td><td>'+chip(j.kind,j.kind==='REJECTED'?'ch-neg':j.kind==='CLOSED'?'ch-mut':'ch-ok','·')+'</td><td class="i1" style="font-size:11px">'+U.esc(j.what)+'</td><td class="r num">'+U.esc(j.outcome)+'</td><td class="i2" style="font-size:10.5px">'+U.esc(j.lesson)+'</td></tr>').join('')),{flush:true});
  return h;
};
