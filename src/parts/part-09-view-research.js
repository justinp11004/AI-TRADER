/* ═══════════ RESEARCH · one symbol, every angle, synchronized ═══════════ */
function symSwitcher(){
  return'<span class="seg">'+SYMS.map(s=>'<button class="'+(S.sym===s.sym?'on':'')+'" data-cmd="research.sym" data-arg="'+s.sym+'">'+s.sym+'</button>').join('')+'</span>';
}
CMD.define({id:'research.sym',label:'Switch symbol',purpose:'Synchronized symbol context across all Research tabs',audit:false,run:a=>{S.sym=a;render()}});
function rHead(tabTitle,sub){
  const s=symBy(S.sym);
  return vhead('RESEARCH · '+tabTitle,
    s.sym+' <span class="i1" style="font-size:12px;font-weight:400">'+s.name+'</span> <span class="mono" style="font-size:13px">'+U.fmt(s.px)+' <span class="'+(s.chg>=0?'up':'dn')+'">'+U.pct(s.chg)+'</span></span> '+lc(s.fsm),
    sub+' · Snapshot '+CLOCK.hm()+' ET · <span class="demo-wm">demo data</span>')+
    '<div class="row" style="margin:-6px 0 12px">'+symSwitcher()+'<span class="pill">'+s.setup+' · bias '+s.bias+'</span></div>';
}
VIEWS['research.overview']=function(){
  const s=symBy(S.sym);
  let h=rHead('overview','Symbol, thesis, and freshness stay synchronized across every tab');
  h+='<div class="grid g4">'+stat('RVOL',U.fmt(s.rvol,1)+'×','vs 20d baseline')+stat('RS percentile',s.rs,'vs QQQ 20d · leader doctrine')+stat('IV rank',s.ivr,prov('options.iv_rank_debit_max'))+stat('Playbook','<span style="font-size:12px">'+s.setup+'</span>','class: '+(PLAYBOOKS.find(p=>p.nm===s.setup)||{cls:'—'}).cls)+'</div>';
  h+='<div class="grid g21" style="margin-top:12px">';
  h+=panel('WORKING HYPOTHESIS','falsifiable, or it isn’t a thesis','<div style="font-size:12px;line-height:1.65">'+U.esc(s.note)+'</div>'+
    (s.unmet.length?'<div class="hr"></div>'+s.unmet.map(u=>kv('UNMET','<span style="color:var(--warn)">'+U.esc(u)+'</span>')).join(''):'<div class="hr"></div>'+kv('STATE','<span class="up">All playbook conditions met — see Decisions queue</span>')));
  h+=panel('LEVELS THAT MATTER','structural, not decorative',
    kv('Draw above',U.esc(s.levels.poolAbove||'—'))+kv('Pool below',U.esc(s.levels.poolBelow||'—'))+
    (s.levels.entry?kv('Plan','<span class="mono">E '+U.fmt(s.levels.entry)+' · S '+U.fmt(s.levels.stop)+' · T2 '+U.fmt(s.levels.t2)+'</span>'):''));
  h+='</div>';
  const intel=s.rs>=80&&s.rvol>=1.5?'A':s.rs>=65?'B':'C';
  h+='<div class="grid g2">';
  h+=panel('KEY STATISTICS · INTEL GRADE '+intel,'the numbers the committee actually consumes · <span class="demo-wm">demo</span>',
    '<div class="grid g4">'+stat('Short interest',s.sym==='AMD'?'4.1%':s.sym==='COIN'?'8.4%':'2.4%','of float — squeeze fuel check')+stat('Beta','1.'+(s.rs%9),'portfolio risk weight')+stat('ATR(14)','$'+U.fmt(s.px*0.024,2),'sizes the stop honestly')+stat('Dark-pool ratio','38%','reference, not signal (S17)')+
    stat('Institutional','71%','ownership')+stat('Insider 90d','net-neutral','no distribution signature')+stat('Analyst consensus','+9% PT','24 buy · 6 hold · 1 sell — crowded')+stat('Hist. vol','31%','vs IV '+ (30+s.ivr%20)+' — premium fair')+'</div>');
  h+=panel('S/R · LIQUIDITY LADDER','levels as liquidity, not lines',
    kv('R3 · MAJOR','<span class="mono">'+U.fmt(s.px*1.068)+'</span> — weekly supply / measured-move pool')+
    kv('R2 · MINOR','<span class="mono">'+U.fmt(s.px*1.032)+'</span> — equal highs (buy-side liquidity)')+
    kv('R1 · NEAREST','<span class="mono">'+U.fmt(s.px*1.015)+'</span> — PDH')+
    kv('● CURRENT','<b class="mono">'+U.fmt(s.px)+'</b>')+
    kv('S1 · NEAREST','<span class="mono">'+U.fmt(s.px*0.986)+'</span> — FVG unmitigated')+
    kv('S2 · MINOR','<span class="mono">'+U.fmt(s.px*0.972)+'</span> — swept session low')+
    kv('S3 · MAJOR','<span class="mono">'+U.fmt(s.px*0.94)+'</span> — protected structural low'));
  h+='</div>';
  const pk=PACKETS.find(p=>p.sym===s.sym&&(p.state==='READY_FOR_HUMAN'||p.state==='RISK_BLOCKED'));
  if(pk)h+='<div class="banner gold"><span class="bico">◆</span><div><b>'+pk.id+'</b> exists for this symbol — '+lc(pk.state)+' · grade '+pk.grade+'. '+CMD.btn('nav.decisions.packet',pk.id,'sm gold','Open packet')+'</div></div>';
  return h;
};
/* research.chart is defined in the merge module (part-15) — one view, one definition */
VIEWS['research.structure']=function(){
  const s=symBy(S.sym);
  let h=rHead('structure & liquidity','Who is trapped, where the draw is, and what invalidates — LAW-001/002/003 made visible');
  h+='<div class="grid g2">';
  h+=panel('LIQUIDITY MAP','pools taken and untaken',
    kv('TAKEN',U.esc(s.levels.poolBelow||'—'))+kv('UNTAKEN · DRAW',U.esc(s.levels.poolAbove||'—'))+
    kv('TRAPPED SIDE',s.sym==='NVDA'?'Late shorts from the 194.30 sweep now underwater above 196.30 — their covering fuels leg one. '+prov('LAW-003'):s.sym==='AMD'?'Breakout sellers from the 170.60 failure now offside — the breaker holds on their pain.':'No trapped counterparty identified yet — without one, this setup cannot exceed WATCH (LAW-003).'));
  h+=panel('INVALIDATION — where this is wrong','no structural invalidation, no trade (LAW-001)',
    (s.levels.stop?kv('STRUCTURAL STOP','<span class="mono" style="color:var(--blk)">'+U.fmt(s.levels.stop)+'</span> — placed by structure, never by 5R arithmetic. Tightening a stop to manufacture 5R is forbidden by LAW-004.'):kv('STATUS','No trade plan — context symbol'))+
    kv('DISPROOF','5m close back inside the swept range kills the reversal thesis — see packet §2.'));
  h+='</div>';
  h+='<div class="grid g2">';
  h+=panel('POOL STATE MACHINES','pools never re-arm — sweeps are spent forever (DET-044)',
    tbl(['Pool','State','Consequence'],[
     ['Asia low 194.30','<span class="dn">SWEPT 10:14</span>','SPENT — this magnet no longer exists; the trapped shorts it created still do'],
     ['PDH 199.20','<span class="up">ARMED</span>','First draw — T1 lives just above it'],
     ['Equal highs 203.30','<span class="up">ARMED</span>','2+ touches within 0.15×ATR (HUM-118 rule) — qualified pool'],
     ['210 measured-move','<span class="up">ARMED</span>','Terminal draw — the 5R level is priced against it'],
    ].map(r=>'<tr><td class="mono" style="font-size:11px">'+r[0]+'</td><td class="mono" style="font-size:10.5px">'+r[1]+'</td><td class="i1" style="font-size:10.5px">'+r[2]+'</td></tr>').join('')),{flush:true});
  h+=panel('DEALING RANGE — the arithmetic','premium sells, discount buys, equilibrium waits',
    (function(){const lo=s.levels.stop?s.levels.stop*0.995:s.px*0.95,hi2=s.levels.t2||s.px*1.05,eq=(lo+hi2)/2;
     const ote1=hi2-(hi2-lo)*0.62,ote2=hi2-(hi2-lo)*0.79,ote705=hi2-(hi2-lo)*0.705;
     return kv('RANGE','<span class="mono">'+U.fmt(lo)+' → '+U.fmt(hi2)+'</span> (protected low zone → terminal draw)')+
      kv('EQUILIBRIUM','<span class="mono">'+U.fmt(eq)+'</span> — above = premium (sell side), below = discount (buy side)')+
      kv('OTE BAND','<span class="mono">'+U.fmt(ote2)+' – '+U.fmt(ote1)+'</span> (62–79% retracement) · A+ tag at 70.5% = <span class="mono">'+U.fmt(ote705)+'</span>')+
      kv('PRICE NOW','<span class="mono">'+U.fmt(s.px)+'</span> — '+(s.px<eq?'<span class="up">DISCOUNT — longs are buying value</span>':'<span style="color:var(--warn)">PREMIUM — longs are paying up</span>'))})());
  h+='</div>';
  h+=panel('SMC / ICT EVIDENCE CHECKLIST','a named pattern must have behavior behind it (LAW-010)',
    tbl(['Element','State','Detail'],[['Liquidity sweep','✓','Asia low 194.30 taken 10:14 with high effort'],['Displacement','✓ 74/100','body ≥ '+ck('detect.displacement_body')+'× · vol ≥ '+ck('detect.displacement_vol')+'× '+prov('detect.displacement_body')],['FVG','✓','195.90–196.30 · first return only'],['Order block','✓','195.40 · fresh, unmitigated'],['OTE','✓','62–79% overlap'],['Killzone','✓','NY-AM (TIM-003)'],['SMT divergence','n/a','not required for model 2']].map(r=>'<tr><td>'+r[0]+'</td><td class="mono up">'+r[1]+'</td><td class="i1" style="font-size:11px">'+r[2]+'</td></tr>').join('')),{flush:true});
  return h;
};
VIEWS['research.wyckoff']=function(){
  let h=rHead('Wyckoff & volume','Campaign read + effort-vs-result. Never force a schematic onto equilibrium.');
  h+='<div class="grid g2">';
  h+=panel('CAMPAIGN READ — S10','phase and events',
    kv('SCHEMATIC','Re-accumulation (4H)')+kv('SPRING','10:14 — the engineered sweep IS the spring')+kv('TEST','10:24 · lower volume ✓')+kv('LPS','forming above 196.30')+kv('PHASE','D — advance within the range')+kv('DOCTRINE','Schematic elements present; nothing forced.'));
  h+='<div class="grid g2">';
  h+=panel('VOLUME BY PHASE — the tape grades the schematic','effort must agree with the phase, or the schematic is being forced',
    tbl(['Phase event','Volume law','This campaign'],[
     ['Spring (10:14)','HIGH effort, closes strong','✓ RVOL 2.3, closed top-quarter — result confirmed'],
     ['Test (10:24)','LOW volume — supply exhausted','✓ 0.6× the spring bar — textbook'],
     ['LPS (forming)','Diminishing pullback volume','✓ so far — each dip lighter'],
     ['SOS (next)','Expansion + spread widening','PENDING — this is what T1 acceptance looks like'],
    ].map(r=>'<tr><td class="mono" style="font-size:11px">'+r[0]+'</td><td class="i2" style="font-size:10.5px">'+r[1]+'</td><td class="i1" style="font-size:10.5px">'+r[2]+'</td></tr>').join('')),{flush:true});
  h+=panel('CAUSE & EFFECT — the P&F count','Wyckoff’s law: the size of the cause bounds the effect',
    kv('CAUSE BUILT','9 columns across the re-accumulation range')+
    kv('MEASURED TARGET','≈ 210 — and it lands ON the untaken measured-move pool: two independent methods, one level, which is why T2 is credible')+
    kv('DISTRIBUTION MIRROR','If this were distribution the grammar would read PSY→BC→AR→ST→UT→UTAD→SOW→LPSY — the UTAD (failed high on light volume) is the tell that is ABSENT here')+
    kv('DOCTRINE','Never force a schematic onto equilibrium — if neither grammar fits, the answer is no campaign, and no campaign means WATCH_ONLY'));
  h+='</div>';
  h+=panel('CAMPAIGN PROGRESSION','the schematic as a living sequence — glowing chip = where price is now',
    '<div class="row" style="gap:4px">'+['PS','SC','AR','ST','SPRING','TEST','SOS','LPS','BOS'].map((ev,i)=>'<span class="lc'+(ev==='TEST'?' lc-TRIGGERED':'')+'" style="'+(i<6?'':'opacity:.45')+'">'+ev+'</span>'+(i<8?'<span class="i2" style="font-size:9px">→</span>':'')).join('')+'</div>'+
    '<div class="i2" style="font-size:10.5px;margin-top:8px">Accumulation grammar: PS→SC→AR→ST→Spring→Test→SOS→LPS. Distribution mirrors it (PSY→BC→AR→ST→UT→UTAD→SOW→LPSY). Cause built (P&F): 9 columns → measured target 210. Kill phrase: no invalidation = no trade.</div>');
  h+=panel('EFFORT vs RESULT — S11','volume forensics',
    kv('RVOL','2.3× — participation is real')+kv('SWEEP CANDLE','High effort, closed strong = result confirms')+kv('TEST BAR','Low volume ✓ — supply exhausted')+kv('ABSORPTION','No absorption signature above — path is clear to the draw'));
  h+='</div>';
  return h;
};
VIEWS['research.options']=function(){
  const s=symBy(S.sym);
  let h=rHead('options & contract','A bad option contract invalidates a good chart (LAW-009). Gates: spread ≤ '+ck('options.max_spread_pct')+'% · OI ≥ '+ck('options.min_oi')+' · vol ≥ '+ck('options.min_volume'));
  h+=panel('CONTRACT DECISION — chosen and rejected, with reasons','S22 Options Desk holds a veto',
    s.sym==='NVDA'?
      '<div class="banner ok"><span class="bico">✓</span><div><b>CHOSEN — 21DTE 200C ×2</b> · delta .42 · spread 3.1% · OI 14.2k · vol 6.1k · IV 38 (IVR 41 < '+ck('options.iv_rank_debit_max')+' debit cap)</div></div>'+
      tbl(['Candidate','Verdict','Why'],[['7DTE 197.5C','REJECTED','Theta cliff before the T2 path can pay'],['45DTE 205C','REJECTED','Vega drag — pays for time the thesis doesn’t need'],['200/210 call spread','REJECTED','Caps the T3 runner; 5R still holds but skew unfavorable'],['21DTE 200C','CHOSEN','Delta .42 rides T1→T2; survives the time-stop window']].map(r=>'<tr><td class="mono">'+r[0]+'</td><td>'+chip(r[1],r[1]==='CHOSEN'?'ch-ok':'ch-neg',r[1]==='CHOSEN'?'✓':'✕')+'</td><td class="i1" style="font-size:11px">'+r[2]+'</td></tr>').join(''))
    :s.sym==='AMD'?
      '<div class="banner blk"><span class="bico">⛔</span><div><b>VETO — OPT-007.</b> 175C spread 8.9% > '+ck('options.max_spread_pct')+'% cap. An impossible contract kills an A+ chart. S14 dissent: WAIT for spread normalization (desk re-runs 11:00) rather than terminal reject — that dissent became LS-121.</div></div>'
    :'<div class="empty"><div class="e1">NO CONTRACT UNDER EVALUATION</div>Contract selection begins when the setup reaches ARMED.</div>');
  h+=panel('CHAIN — 21DTE · gates evaluated per row','spread ≤ '+ck('options.max_spread_pct')+'% · OI ≥ '+ck('options.min_oi')+' · vol ≥ '+ck('options.min_volume')+' · <span class="demo-wm">demo chain</span>',
    (function(){const s=symBy(S.sym),r=localRng('chain-'+S.sym);if(!s.levels.entry)return '<div class="empty">No chain under evaluation.</div>';
      let rows='';for(let i=-3;i<=4;i++){const k=Math.round(s.px/2.5)*2.5+i*2.5;const spr=1.8+Math.abs(i)*1.4+r()*2.2;const oi=Math.round(16000/(1+Math.abs(i)))-Math.round(r()*900);const vol=Math.round(oi*0.42*(0.5+r()));const delta=U.clamp(0.5-((k-s.px)/s.px)*6,0.04,0.96);
        const veto=spr>ck('options.max_spread_pct')?'OPT-007':oi<ck('options.min_oi')?'OPT-008':vol<ck('options.min_volume')?'OPT-009':null;
        const chosen=S.sym==='NVDA'&&Math.abs(k-200)<0.01;
        rows+='<tr'+(chosen?' style="background:var(--live-bg)"':veto?' class="dim"':'')+'><td class="r num">'+k.toFixed(1)+'C</td><td class="r num">'+delta.toFixed(2)+'</td><td class="r num">'+U.fmt(spr,1)+'%</td><td class="r num">'+U.int(oi)+'</td><td class="r num">'+U.int(vol)+'</td><td>'+(chosen?chip('CHOSEN','ch-live','◆'):veto?chip(veto+' VETO','ch-blk','✕'):chip('PASS','ch-ok','✓'))+'</td></tr>'}
      return tbl(['Strike','>Δ','>Spread','>OI','>Volume','Gate'],rows)})(),{flush:true});
  h+='<div class="grid g2">';
  h+=panel('DTE / PERSONALITY ALIGNMENT','LAW-016 — horizon, ladder, and DTE stay aligned',
    tbl(['Personality','DTE band','This setup'],[['Scalp','0–3','—'],['Intraday','0–2','—'],['Swing','14–45','✓ 21DTE matches swing class']].map(r=>'<tr><td>'+r[0]+'</td><td class="mono">'+r[1]+'</td><td class="i1">'+r[2]+'</td></tr>').join('')),{flush:true});
  h+=panel('GREEKS AT PLAN POINTS','expected behavior, pre-committed',
    kv('AT ENTRY','Δ .42 · Θ −$8.4/day/ct · IV 38')+kv('AT T2','Δ ≈ .58 · theta drag −$16.8/day total')+kv('RISK','IV stable regime assumed; spread blowout kills the 5R path — named in packet.'));
  h+='</div>';
  return h;
};
VIEWS['research.flow']=function(){
  let h=rHead('options flow','Confirmation tier ONLY. Flow can warn or confirm — it can never approve a trade (S23 doctrine).');
  h+=panel('TODAY’S PRINTS — '+S.sym,'demo twin of the flow feed',
    tbl(['Time','Type','Contract','>Premium','Side','Read'],[
     ['10:24','SWEEP','200C 21DTE','$1.9M','ASK','Aggressive buyer through 3 exchanges'],
     ['10:19','SWEEP','200C 21DTE','$1.1M','ASK','Second wave — same strike'],
     ['09:52','BLOCK','195P 14DTE','$0.8M','BID','Put seller — consistent with support holding'],
    ].map(r=>'<tr><td class="mono">'+r[0]+'</td><td>'+chip(r[1],r[1]==='SWEEP'?'ch-live':'ch-info','◆')+'</td><td class="mono">'+r[2]+'</td><td class="r num">'+r[3]+'</td><td class="mono">'+r[4]+'</td><td class="i1" style="font-size:11px">'+r[5]+'</td></tr>').join('')),{flush:true});
  h+=panel('SESSION TAPE — all symbols','sweeps and blocks across the promoted set · <span class="demo-wm">demo twin</span>',
    (function(){const r=localRng('tape-'+CLOCK.hm().slice(0,2));let rows='';
      const names=['NVDA','TSLA','AMD','META','QQQ','SPY','NVDA','AAPL','AMZN','NVDA','MSFT','TSLA'];
      for(let i=0;i<12;i++){const sym=names[i];const sweep=r()>0.4;const call=r()>0.35;const prem=(0.3+r()*2.4);
        rows+='<tr><td class="mono">'+(10*60+31-i*3<600?'09':'10')+':'+String((31-i*3+60)%60).padStart(2,'0')+'</td><td class="mono"><b>'+sym+'</b></td><td>'+chip(sweep?'SWEEP':'BLOCK',sweep?'ch-live':'ch-info','◆')+'</td><td class="mono">'+(call?'C':'P')+' '+(r()>0.5?'21':'14')+'DTE</td><td class="r num">$'+U.fmt(prem,1)+'M</td><td class="mono">'+(r()>0.4?'ASK':'BID')+'</td><td class="i2" style="font-size:10px">'+(sweep?'multi-exchange aggression':'single print — negotiated')+'</td></tr>'}
      return tbl(['Time','Sym','Type','Contract','>Premium','Side','Read'],rows)})(),{flush:true});
  h+=panel('MICROSTRUCTURE — L2 book & tape','depth and prints are context for fills, never a signal · <span class="demo-wm">demo twin</span>',microPanel());
  h+='<div class="grid g2">';
  h+=panel('NET PREMIUM','who is actually paying up',
    '<div class="grid g2">'+stat('Session premium','$14.2M','across promoted set')+stat('Call vs put','61% / 39%','call-skewed')+stat('Net directional','+$3.1M bull','after hedge discounting')+stat('Top whale','NVDA 200C $1.9M','whale score 84/100')+'</div>');
  h+=panel('SUSPICIOUS FLOW — what the desk DISCOUNTS','reading flow means knowing what to ignore',
    kv('SPY 598P · BID block · 0DTE','Likely portfolio hedge, not directional — DISCOUNTED')+
    kv('COIN 310C · IVR 77','Premium rich, crush risk — favor equity exposure over the option')+
    kv('DOCTRINE','Flow is evidence, not a signal. It confirms, contradicts, or warns — it never approves.'));
  h+='</div>';
  h+='<div class="banner info"><span class="bico">i</span><div>S23 vote on the live packet: <b>advisory</b> — “2 sweeps at ask in 200C today — confirmation-tier only.” Flow agreeing does not upgrade a grade; flow disagreeing forces a named conflict. Flow can never approve a trade.</div></div>';
  return h;
};
VIEWS['research.catalysts']=function(){
  let h=rHead('catalysts','Catalysts explain moves; they never override structure (S18 doctrine).');
  h+='<div class="grid g2">';
  h+=panel('EVENT DISTANCE — S19','event windows are enforced (LAW-017)',
    kv('EARNINGS','T-21d — outside '+ck('risk.event_window_hrs')+'h window · swing eligible '+prov('risk.event_window_hrs'))+
    kv('MACRO','FOMC minutes today 14:00 — index vol event; scalp time-stop 13:45')+
    kv('LITIGATION','None pending'));
  h+=panel('CATALYST TIMELINE — scored, not just listed','each headline carries a 0–100 catalyst score and a trade-impact read · <span class="demo-wm">demo</span>',
    [['T-0 09:12','Semis complex upgraded at two desks','72','Reinforces leadership — but wait for structure, not the headline'],
     ['T-0 08:30','CPI printed cooler than consensus','94','Regime agent flips breadth weight up — risk-on rotation confirmed'],
     ['T-1d','GTC keynote scheduled T+12d','61','Narrative fuel; NOT tradeable until it becomes structure'],
     ['T-3d','Insider cluster: net-neutral 90d filing sweep','38','No distribution signature — clears the S17 lane']]
    .map(r=>'<div class="kv"><span class="k">'+r[0]+'</span><span class="v"><b style="font-size:11.5px">'+r[1]+'</b> <span class="tag">score '+r[2]+'</span><div class="i2" style="font-size:10.5px;margin-top:2px">'+r[3]+'</div></span></div>').join(''));
  h+=panel('THE FOUR EARNINGS ARCHETYPES — S19 classifier','which movie is this ticker in?',
    tbl(['Archetype','Signature','Playbook response'],[
     ['Beat-and-raise leader','Gaps up, holds VWAP, closes strong','Continuation entries on first structural pullback — never chase the gap'],
     ['Beat-and-fade','Gaps up into overhead supply, closes red','The trap archetype — the gap IS the liquidity event'],
     ['Kitchen-sink reset','Gaps down, reverses on volume','Watch for the spring — capitulation builds the cause'],
     ['Drift-into-print','IV inflates, price pins','No position through the print, ever (LAW-017) — trade the crush after'],
    ].map(r=>'<tr><td><b style="font-size:11px">'+r[0]+'</b></td><td class="i1" style="font-size:10.5px">'+r[1]+'</td><td class="i2" style="font-size:10.5px">'+r[2]+'</td></tr>').join('')),{flush:true});
  h+=panel('FORENSIC & OWNERSHIP — S17 / S20','slow truth under fast price',
    kv('ACCRUALS','Clean — no red flags')+kv('DILUTION','No overhang')+kv('INSIDERS','Net-neutral 90d')+kv('SOCIAL HEAT','92nd percentile — S21 advisory: crowded-trade context, tertiary by CC-13'));
  h+='</div>';
  return h;
};
VIEWS['research.history']=function(){
  const s=symBy(S.sym);
  const rows=JOURNAL.filter(j=>j.sym===s.sym);
  let h=rHead('ATLAS decision history','Every prior decision on this symbol — taken AND rejected (LAW-018)');
  h+='<div class="grid g4">'+
    stat('Decisions on '+s.sym,rows.length,'taken + rejected, all journaled (LAW-018)')+
    stat('Correct rejections',rows.filter(j=>j.kind==='REJECTED'&&j.outcome.includes('✓')).length+' of '+rows.filter(j=>j.kind==='REJECTED').length,'process-graded at decision time')+
    stat('Shadow entries',ARCHIVE.filter(a=>a[1]===s.sym).length,'counterfactual-tracked passes')+
    stat('Open packet',PACKETS.some(p=>p.sym===s.sym&&p.state==='READY_FOR_HUMAN')?'YES':'none','see Decisions queue')+'</div>';
  h+=panel('DECISION RECORD','',rows.length?tbl(['When','Ref','Kind','Decision','>Outcome','Lesson'],rows.map(j=>'<tr><td class="mono">'+j.t+'</td><td class="mono">'+j.id+'</td><td>'+chip(j.kind,j.kind==='REJECTED'?'ch-neg':'ch-ok','·')+'</td><td class="i1" style="font-size:11px">'+U.esc(j.what)+'</td><td class="r num">'+U.esc(j.outcome)+'</td><td class="i2" style="font-size:10.5px">'+U.esc(j.lesson)+'</td></tr>').join('')):'<div class="empty"><div class="e1">NO PRIOR DECISIONS</div>This symbol has not reached the decision stage before.</div>',{flush:true});
  const shadows=ARCHIVE.filter(a=>a[1]===s.sym);
  if(shadows.length)h+=panel('SHADOW ARCHIVE — '+s.sym,'what the desk analyzed and did NOT take, tracked to its counterfactual',
    tbl(['ID','Decision','>Counterfactual','Playbook','Note'],shadows.map(a=>'<tr><td class="mono">'+a[0]+'</td><td>'+chip(a[2],a[2].startsWith('TAKEN')?'ch-ok':a[2]==='REJECTED'?'ch-neg':'ch-mut','·')+'</td><td class="r num">'+a[3]+'</td><td class="i1" style="font-size:10.5px">'+a[4]+'</td><td class="i2" style="font-size:10.5px">'+a[5]+'</td></tr>').join('')),{flush:true});
  return h;
};
