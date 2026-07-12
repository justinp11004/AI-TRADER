/* ═══════════ REVIEW · decisions → evidence-backed improvement ═══════════ */
VIEWS['review.journal']=function(){
  let h=vhead('REVIEW · journal','Every decision — taken AND rejected — is a record (LAW-018)',
    'Process quality is separate from financial outcome. A profitable rule violation is a bad process; a correctly executed loss is not automatically a bad decision.');
  h+='<div class="grid g4">'+
    stat('Entries this week',JOURNAL.length,'decisions + closures')+
    stat('Correct rejections','2 of 3','graded at decision time, not hindsight')+
    stat('Missed winners','1','AUT-118 · fix in Learning Court')+
    stat('Process grade avg','B+','S29 Journal Coach')+'</div>';
  h+=panel('','',tbl(['When','Ref','Sym','Kind','What happened','>Outcome','Lesson (process, not outcome)'],
    JOURNAL.map(j=>'<tr><td class="mono">'+j.t+'</td><td class="mono">'+j.id+'</td><td class="mono"><b>'+j.sym+'</b></td><td>'+chip(j.kind,j.kind==='REJECTED'?'ch-neg':j.kind==='CLOSED'?'ch-mut':'ch-ok','·')+'</td><td class="i1" style="font-size:11px">'+U.esc(j.what)+'</td><td class="r num">'+U.esc(j.outcome)+'</td><td class="i2" style="font-size:10.5px">'+U.esc(j.lesson)+'</td></tr>').join('')),{flush:true});
  h+=panel('P&L CALENDAR — 28 sessions','magnitude as opacity; the shape of the month at a glance · <span class="demo-wm">demo</span>',
    (function(){const r=localRng('cal-v12');let cells='';const days=['M','T','W','T','F'];
      cells+='<div class="row" style="gap:6px;margin-bottom:4px">'+days.map(d2=>'<span class="mono i2" style="width:64px;text-align:center;font-size:9px">'+d2+'</span>').join('')+'</div>';
      for(let w=0;w<4;w++){cells+='<div class="row" style="gap:6px;margin-bottom:6px">';
        for(let d2=0;d2<5;d2++){const v3=(r()-0.42)*900;const a=Math.min(Math.abs(v3)/500,1)*0.28+0.04;
          cells+='<div style="width:64px;height:40px;border-radius:5px;border:1px solid var(--line);background:'+(v3>=0?'rgba(47,214,160,'+a+')':'rgba(242,99,124,'+a+')')+';display:flex;align-items:center;justify-content:center"><span class="mono" style="font-size:9.5px;color:'+(v3>=0?'var(--pos)':'var(--neg)')+'">'+(v3>=0?'+':'−')+'$'+Math.abs(Math.round(v3))+'</span></div>'}
        cells+='</div>'}
      return cells+'<div class="row" style="margin-top:6px"><span class="pill">Rule-follow 91%</span><span class="pill">Mistake taxonomy: early entry 4 · moved stop 0 · oversized 0 · chased 2 · no confirmation 1</span></div>'})());
  h+=panel('PATTERN DETECTION — S29 mining the record','emotional leaks become rules; rules become gates',
    kv('BEST HOURS',PATTERNS.best)+kv('WORST PATTERN',PATTERNS.worst)+kv('ACTIVE LEAK',PATTERNS.leak)+kv('SUGGESTION',PATTERNS.suggestion));
  return h;
};
VIEWS['review.autopsy']=function(){
  let h=vhead('REVIEW · opportunity autopsy','Why did we miss a winner? Why did a “bad” trade run? What was knowable at decision time?',
    'Every rejection is shadow-tracked to its counterfactual. The autopsy separates DATA gaps from RULE gaps from WORKFLOW gaps from JUDGMENT gaps — because each has a different fix.');
  h+='<div class="grid g4">'+
    stat('Pass-discipline',SHADOW_STATS.passRate,'of passes were correct — protecting capital, not missing edge')+
    stat('Avoided',CONFUSION.avoided,'losses the gates refused')+
    stat('Missed (counterfactual)',CONFUSION.missed,'the honest cost of selectivity')+
    stat('Open autopsies',AUTOPSIES.filter(a=>!a.status.startsWith('ARCHIVED')&&!a.status.startsWith('APPLIED')).length,'each one ends in a fix or an archive')+'</div>';
  h+=panel('DECISION CONFUSION MATRIX','without hindsight bias — “what was knowable at decision time?”',
    '<div class="grid g4">'+
    stat('TRUE POSITIVE',CONFUSION.tp.n,'approved & worked · '+CONFUSION.tp.ex)+
    stat('FALSE POSITIVE',CONFUSION.fp.n,'approved & failed · '+CONFUSION.fp.ex)+
    stat('TRUE NEGATIVE',CONFUSION.tn.n,'rejected & would have failed · '+CONFUSION.tn.ex)+
    stat('FALSE NEGATIVE',CONFUSION.fn.n,'rejected & would have won · '+CONFUSION.fn.ex)+'</div>'+
    '<div class="row" style="margin-top:10px">'+ROOTCAUSE.map(([k,v2])=>'<span class="pill">'+k+' <b>'+v2+'%</b></span>').join('')+'<span class="i2" style="font-size:10.5px">root causes across FP+FN cases</span></div>');
  h+=AUTOPSIES.map(a=>'<div class="panel'+(a.gap==='NONE'?'':a.status.startsWith('FIX')?' crit':'')+'"><div class="ph"><span class="t">'+a.id+' · '+a.sym+'</span><span class="why">'+a.date+'</span><span class="spacer"></span>'+
    chip(a.cls.replace(/_/g,' '),a.cls==='GOOD_MISS'?'ch-ok':a.cls==='MISSED_WINNER'||a.cls==='REJECTED_THEN_RAN'?'ch-warn':'ch-info','◆')+chip(a.gap,a.gap==='NONE'?'ch-ok':'ch-neg',a.gap==='NONE'?'✓':'!')+'</div><div class="pb">'+
    '<div style="font-family:var(--mono);font-size:11.5px;margin-bottom:6px;color:var(--ink0)">'+U.esc(a.verdictLine)+' <span class="i2">· counterfactual: '+U.esc(a.outcome)+'</span></div>'+
    '<div class="i1" style="font-size:11.5px;line-height:1.6;margin-bottom:8px">'+U.esc(a.finding)+'</div>'+
    kv('THE FIX',U.esc(a.fix))+kv('STATUS','<b>'+U.esc(a.status)+'</b>')+
    (a.id==='AUT-118'?'<div class="btnrow" style="margin-top:8px"><button class="btn sm gold" data-cmd="ask.fromAutopsy" data-arg="'+a.id+'">Convert to ask card →</button></div>':'')+
    '</div></div>').join('');
  h+=panel('SETUP ARCHIVE — every analyzed setup, shadow-tracked','“was passing correct?” is answered with data, not memory',
    tbl(['ID','Sym','Decision','>Result / counterfactual','Playbook','Note'],ARCHIVE.map(a=>'<tr'+(String(a[5]).startsWith('MISS')?' style="background:var(--warn-bg)"':'')+'><td class="mono">'+a[0]+'</td><td class="mono"><b>'+a[1]+'</b></td><td>'+chip(a[2],a[2].startsWith('TAKEN')?'ch-ok':a[2]==='REJECTED'?'ch-neg':a[2]==='PASSED'?'ch-mut':'ch-info','·')+'</td><td class="r num">'+a[3]+'</td><td class="i1" style="font-size:10.5px">'+a[4]+'</td><td class="i2" style="font-size:10.5px">'+a[5]+'</td></tr>').join('')),{flush:true});
  h+='<div class="banner info"><span class="bico">i</span><div>'+U.esc(SHADOW_STATS.note)+'</div></div>';
  return h;
};
VIEWS['review.performance']=function(){
  let h=vhead('REVIEW · performance & calibration','Is the process working — measured, not felt',
    'Expectancy by playbook, confidence calibration, and the failure Pareto. Fix the top two failure modes and half the errors disappear.');
  h+='<div class="grid g2">';
  h+=panel('EXPECTANCY BY PLAYBOOK — paper, this quarter','process metrics; no return claims',
    tbl(['Playbook','>n','>Win %','>Expectancy','Backtest gate'],EXPECT.map(e=>{const pb=PLAYBOOKS.find(p2=>p2.nm===e[0]);return'<tr><td>'+e[0]+'</td><td class="r num">'+e[1]+'</td><td class="r num">'+e[2]+'</td><td class="r num up">'+e[3]+'</td><td class="i2" style="font-size:10.5px">'+(pb?pb.bt.id+' · '+pb.bt.gate:'—')+'</td></tr>'}).join('')),{flush:true});
  h+=panel('CONFIDENCE CALIBRATION','stated confidence vs realized hit-rate (n=118 co-graded)',
    '<canvas id="rv-calib" class="cv" style="height:200px"></canvas>'+
    '<div class="i2" style="font-size:10.5px;margin-top:6px">Director grade correlates +0.41 with realized R. Slight overconfidence at the top band — grade-inflation watch is live (S34).</div>');
  h+='</div>';
  drawCalibration('rv-calib');
  h+=panel('FAILURE PARETO — where errors actually come from','S29 failure-taxonomy tags, quarter to date',
    '<canvas id="rv-pareto" class="cv" data-h="185"></canvas>'+
    '<div class="i1" style="font-size:11px;margin-top:6px">Late-entry/chasing (31) + news misclassification (22) = 49% of all errors. Both have live fixes: the first-return entry gate and S18 source-credibility weighting (applied v13.2).</div>');
  drawBars('rv-pareto',PARETO,'rgba(242,99,124,.55)');
  h+='<div class="grid g2">';
  h+=panel('EXPECTANCY BY SESSION PHASE','when the edge lives — and when it dies',
    tbl(['Phase','>Expectancy','Read'],[['NY-AM killzone','+1.38R','the killzone IS the business'],['Lunch doldrums','−0.21R','→ S31 evidence for a lunch-throttle key (MM-LUNCH-001)'],['NY-PM killzone','+0.94R','second shift, smaller edge'],['MOC window','+0.31R','0DTE credit only, blackout 15:45 (LS-117)']].map(r=>'<tr><td>'+r[0]+'</td><td class="r num '+(r[1].startsWith('−')?'dn':'up')+'">'+r[1]+'</td><td class="i2" style="font-size:10.5px">'+r[2]+'</td></tr>').join('')),{flush:true});
  h+=panel('EXPECTANCY BY DIRECTOR GRADE','grades should predict — this is the test, and it passes',
    tbl(['Grade','>Expectancy','Verdict'],[['A','+1.61R','monotonic ✓'],['B','+0.88R','monotonic ✓'],['C','+0.12R','barely pays — C-grades stay paper']].map(r=>'<tr><td class="mono"><b>'+r[0]+'</b></td><td class="r num up">'+r[1]+'</td><td class="i2" style="font-size:10.5px">'+r[2]+'</td></tr>').join(''))+
    '<div class="i2" style="font-size:10.5px;padding:8px 12px">A-packets hit T2 at 61% vs 54% implied — the Director is slightly UNDER-confident. Grade↔R correlation +0.41 (n=118).</div>',{flush:true});
  h+='</div>';
  h+='<div class="grid g2">';
  h+=panel('PER-SEAT DRIFT — S34 monitor','vote-flip rate + embedding delta; degradation earns a demotion proposal, not a quiet pass',
    tbl(['Seat','>Vote-flip','>Embed δ','State'],[['S18 News Catalyst','12.4%','0.081','<span style="color:var(--warn)">WATCH — retrain queued</span>'],['S21 Social Sentiment','8.9%','0.064','<span style="color:var(--warn)">WATCH</span>'],['S14 ICT Execution','3.1%','0.022','<span class="up">STABLE</span>'],['S12 SMC Structure','2.7%','0.019','<span class="up">STABLE</span>'],['S01 Risk Officer','0.4%','0.006','<span class="up">STABLE — as it must be</span>']].map(r=>'<tr><td>'+r[0]+'</td><td class="r num">'+r[1]+'</td><td class="r num">'+r[2]+'</td><td class="mono" style="font-size:10.5px">'+r[3]+'</td></tr>').join('')),{flush:true});
  h+=panel('GOLDEN-PACKET REGRESSION','48 canonical packets re-scored on every rules change',
    kv('v13.2 · ACTIVE','<span class="up">48/48 reproduce ✓</span>')+
    kv('v13.3-candidate','<span style="color:var(--blk)">46/48 — BLOCKED.</span> Two regressions must be explained or the candidate dies.')+
    kv('HUMAN vs DIRECTOR','κ 0.71 agreement on 60 co-graded packets — measured, not assumed'));
  h+='</div>';
  h+=panel('CALIBRATION LEDGER — stated confidence vs reality, per seat','the honest answer to “which agent’s read was wrong” · Brier = squared-error of confidence',
    tbl(['Seat','90s decile','80s','70s','60s','>Brier','Read'],CALIB_LEDGER.map(c=>{
      const cell=r2=>{const diff=r2[0]-r2[1];const cls=diff<=7?'d-good':diff<=14?'d-mid':'d-bad';return'<span class="decile '+cls+'" title="stated '+r2[0]+'% → hit '+r2[1]+'% (n='+r2[2]+')">'+r2[1]+'%<br><span style="opacity:.6">n'+r2[2]+'</span></span>'};
      return'<tr'+(c.note.includes('WORST')?' style="background:var(--warn-bg)"':'')+'><td class="mono"><b>'+c.seat+'</b> '+SEATBY[c.seat].nm+'</td>'+c.rows.map(r2=>'<td>'+cell(r2)+'</td>').join('')+'<td class="r num">'+c.brier.toFixed(3)+'</td><td class="i2" style="font-size:10px">'+U.esc(c.note)+'</td></tr>'}).join('')),{flush:true});
  h+=panel('SAMPLE-BLOCK TRACKER — Douglas 20-trade blocks','flawless execution is the headline; P&L is BLURRED until the block boundary — the interface enforces the psychology',
    tbl(['Block','Progress','>Flawless','Pre-accepted worst','Block P&L'],BLOCKS.map(b=>'<tr><td><b>'+b.pb+'</b></td><td class="mono">'+b.n+'/'+b.of+'<div class="gauge" style="width:110px;margin-top:3px"><i style="width:'+(b.n/b.of*100)+'%"></i></div></td><td class="r num up">'+Math.round(b.flawless/b.n*100)+'%</td><td class="mono" style="font-size:10.5px">'+b.worst+'</td><td class="r num'+(b.done?' up':'')+'">'+(b.done?b.pnl:'<span class="blurval" title="Blurred until trade 20 of 20 — mid-block P&L judgment is forbidden framing (Douglas). Flawless-execution rate is the metric that matters here.">'+b.pnl+'</span>')+'</td></tr>').join(''))+
    '<div class="i2" style="font-size:10.5px;padding:8px 12px">A block is judged as a block. Hover a blurred value to see why you can’t see it.</div>',{flush:true});
  h+=panel('REVIEW REFUSALS','discipline about the discipline',
    REVIEW_REFUSALS.map(r=>kv('◆','<span style="font-size:11.5px">'+r+'</span>')).join(''));
  return h;
};
VIEWS['review.court']=function(){
  let h=vhead('REVIEW · learning court','Agents propose; evidence accumulates; ONLY human governance deploys (LAW-013)',
    'Nothing self-applies. Every proposal carries its evidence, its exact config diff, its risk, and what it still needs. Rejected proposals stay visible by design.');
  h+=COURT.map(c=>'<div class="panel'+(c.stage.startsWith('REJECT')?'':c.stage.startsWith('APPROVED')?'':' gold')+'"><div class="ph"><span class="t">'+c.id+' · '+U.esc(c.title)+'</span><span class="spacer"></span>'+
    chip(c.stage,c.stage.startsWith('REJECT')?'ch-neg':c.stage.startsWith('APPROVED')?'ch-ok':c.stage==='A/B PAPER'?'ch-paper':'ch-info','◆')+'</div><div class="pb">'+
    kv('FROM',c.from)+kv('EVIDENCE',U.esc(c.evidence))+kv('EXACT DIFF','<span class="mono" style="font-size:10.5px;color:var(--paper)">'+U.esc(c.diff)+'</span>')+kv('RISK',U.esc(c.risk))+kv('NEEDS',U.esc(c.needs))+
    (c.stage==='PROPOSED'||c.stage==='IN REVIEW'?'<div class="btnrow" style="margin-top:9px"><button class="btn sm pos" data-cmd="court.decide" data-arg="'+c.id+'|ADVANCE">Advance stage</button><button class="btn sm neg" data-cmd="court.decide" data-arg="'+c.id+'|REJECT">Reject</button><button class="btn sm" data-cmd="court.decide" data-arg="'+c.id+'|EVIDENCE">Request more evidence</button></div>':'')+
    '</div></div>').join('');
  h+=panel('APPLIED HUMAN LESSONS','the teach-loop output: marked chart → structured rule → quiz-back → A/B → doctrine',
    tbl(['ID','Rule','Measured effect'],HUMAN_LESSONS.map(l=>'<tr><td class="mono">'+l.id+'</td><td class="i1" style="font-size:11.5px">'+U.esc(l.rule)+'</td><td class="i2" style="font-size:11px">'+U.esc(l.effect)+'</td></tr>').join('')),{flush:true});
  h+=panel('TRAINING STUDIO — teach the desk a rule','your lesson → machine quiz-back → HUM chunk → court → paper A/B. It never edits itself without your sign-off.',
    '<div class="grid g2"><div>'+
    '<div class="kv" style="border:none;padding-bottom:2px"><span class="k">RULE / TITLE</span><span class="v"><input id="th-title" class="inp" placeholder="e.g. Equal highs need 2+ touches within 0.15×ATR to count as a pool"></span></div>'+
    '<div class="kv" style="border:none;padding-bottom:2px"><span class="k">WHAT AI MISSED</span><span class="v"><input id="th-miss" class="inp" placeholder="What did the machine get wrong?"></span></div>'+
    '<div class="kv" style="border:none;padding-bottom:2px"><span class="k">CORRECT READ</span><span class="v"><input id="th-correct" class="inp" placeholder="The read it should have made"></span></div>'+
    '<div class="kv" style="border:none"><span class="k">INVALIDATION</span><span class="v"><input id="th-inval" class="inp" placeholder="When is this rule wrong?"></span></div>'+
    '<div class="btnrow" style="margin-top:8px"><button class="btn gold" data-cmd="teach.submit">Submit lesson → quiz-back</button></div></div>'+
    '<div><div class="kv" style="border:none"><span class="k">FLOW</span><span class="v mono" style="font-size:10px">WRITE → QUIZ-BACK → HUM-CHUNK → COURT → A/B COHORT → DOCTRINE</span></div>'+
    kv('BAR','GOV-030: n≥30 samples, effect ≥ +0.3R before any promotion')+
    kv('LANES','Lessons file to the relevant court lanes only — stay-in-lane holds for humans too')+'</div></div>');
  h+=panel('SELF-LEARNING STREAM — machine proposals awaiting judgment','the mind proposes with confidence scores; only you deploy (LAW-013)',
    AUTOLEARN.map(a2=>'<div class="kv"><span class="k mono" style="color:var(--paper)">'+a2.id+'</span><span class="v" style="font-size:11.5px"><span class="tag">conf '+a2.conf.toFixed(2)+'</span> '+U.esc(a2.txt)+'</span></div>').join(''));
  h+='<div class="banner gold"><span class="bico">◆</span><div><b>LS-112 is the teaching example:</b> a proposal to lower the 5R floor was rejected as unconstitutional — LAW-004 is locked. The court can tune detectors; it cannot touch the constitution.</div></div>';
  return h;
};
CMD.define({id:'court.decide',label:'Court decision',purpose:'Human governance on a rule-change proposal (LAW-013)',
  run:a=>{const[id,d]=a.split('|');const c=COURT.find(x=>x.id===id);if(!c)return;
    if(d==='ADVANCE'){c.stage=c.stage==='PROPOSED'?'IN REVIEW':'A/B PAPER';SVR.audit('HUMAN (owner)','court',id+' advanced → '+c.stage+' — evidence bar held (GOV-030 n≥30)')}
    else if(d==='REJECT'){c.stage='REJECTED BY GOVERNANCE';SVR.audit('HUMAN (owner)','court',id+' REJECTED — tombstoned as negative training, stays visible (anti-nag)')}
    else{c.needs='More evidence requested by owner at '+CLOCK.hm()+' · '+c.needs;SVR.audit('HUMAN (owner)','court',id+' — more evidence requested')}
    UI.toast(id+' → '+c.stage,'ok','LEARNING COURT');render()}});
VIEWS['review.replay']=function(){
  let h=vhead('REVIEW · replay & backtest','Point-in-time truth: no future leakage, deterministic seeds, parity gates',
    'A strategy promotes only when backtest↔live parity holds. Replay reconstructs any decision with exactly what was knowable at that moment.');
  h+=panel('BACKTEST REGISTER — promotion gates','S30 · replays forced into computable form',
    tbl(['ID','Playbook','>n','>Expectancy','>Win','>PF','>Parity','Gate'],PLAYBOOKS.map(p=>'<tr><td class="mono">'+p.bt.id+'</td><td>'+p.nm+'</td><td class="r num">'+p.bt.n+'</td><td class="r num up">'+p.bt.exp+'</td><td class="r num">'+p.bt.win+'</td><td class="r num">'+p.bt.pf+'</td><td class="r num">'+p.bt.parity+'</td><td class="i1" style="font-size:10.5px">'+(p.bt.gate.startsWith('PASS')?'<span class="up">'+U.esc(p.bt.gate)+'</span>':'<span style="color:var(--warn)">'+U.esc(p.bt.gate)+'</span>')+'</td></tr>').join('')),{flush:true});
  h+=panel('STRATEGY PROMOTION PIPELINE','a strategy EARNS live capital — it is never granted',
    '<div class="funnel">'+[['SIM','backtest, no-lookahead'],['PAPER','n≥30 live-market samples'],['PARITY','BT↔live divergence < 5%'],['LIVE MIN-SIZE','graduated capital, human-gated'],['SCALE','caps grow only with evidence']].map((f,i)=>'<div class="fstage'+(i<2?' hot':'')+'"><div class="fk">'+f[0]+'</div><div class="fd" style="margin-top:4px">'+f[1]+'</div></div>').join('')+'</div>'+
    '<div class="i2" style="font-size:10.5px;margin-top:8px">Only backtested exceptions may override the 5R rule — and none currently qualify. Sub-5R strategies are exception-only, forever provisional.</div>');
  h+='<div class="grid g2">';
  h+=panel('SCENARIO ENGINE','long-term memory: '+SCENARIO.rows+' replayed permutations',
    '<div class="i1" style="font-size:11.5px;line-height:1.6;margin-bottom:8px">'+U.esc(SCENARIO.note)+'</div>'+
    kv('DIMENSIONS','playbook × regime × session × IV-rank')+kv('OUTPUT','the expectancy grid in Markets → Regime')+kv('STANDING BAN',U.esc(SCENARIO.ban)));
  h+=panel('REPLAY DOCTRINE','what makes a replay honest',
    kv('NO LOOKAHEAD','Historical decisions rebuilt only from data available at decision time')+
    kv('DETERMINISM','Seeded runs — same seed, same result, every time')+
    kv('GOLDEN SET','48 canonical packets re-scored on every rules change; any regression blocks deploy')+
    kv('PARITY GATE','Backtest↔live divergence > 3% = HOLD — the market is the referee'));
  h+='</div>';
  return h;
};
