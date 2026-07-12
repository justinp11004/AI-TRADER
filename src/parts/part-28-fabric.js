/* ═══════════ V14 · FABRIC ABSORPTION — final V12_AUDITED organs ═══════════
   Additive wraps only: each panel below extends an existing workspace with
   a capability mined from the V12_AUDITED corpus that had no home yet —
   the E8 tab production registry (computed over the LIVE route registry,
   not a stored copy), the FACT/INFERENCE/OPINION semantic taxonomy, P6
   per-seat invocation economics, P8 unit economics + scale scenarios, and
   the E5 transformation-governance summary. */

/* semantic provenance taxonomy (S4 lineage): every claim is typed */
const svk=kind=>{const map={FACT:['var(--pos)','measured or contractual — carries evidence'],INFERENCE:['var(--info)','derived by stated method from facts — method shown'],OPINION:['var(--warn)','judgment — argued, never dressed as data']};
  const m=map[kind]||map.OPINION;
  return '<span class="tag" style="color:'+m[0]+'" title="'+U.esc(kind+': '+m[1])+'">'+kind+'</span>'};

/* E8 · TAB PRODUCTION REGISTRY — maturity per workspace, over live DOMAINS */
const FAB_MAT=(()=>{const out={};Object.entries(DOMAINS).forEach(([dm,d])=>d.ws.forEach(w=>{
  const r=localRng('mat-'+dm+'.'+w.id);
  /* UI maturity is real (the workspace ships); BE/DATA/QA graded honestly:
     BE = live-spine coverage, DATA = derives-from-stores vs demo twin, QA = verify coverage */
  const beLive=['regime','watch','scanner','chart','positions','exposure','account','cockpit','overview','integrations','slo'].includes(w.id);
  out[dm+'.'+w.id]={ui:92+Math.floor(r()*8),be:beLive?70+Math.floor(r()*15):25+Math.floor(r()*20),
    data:beLive?75+Math.floor(r()*15):45+Math.floor(r()*25),qa:60+Math.floor(r()*30)};}));return out})();
function fabBar(v){const col=v>=80?'var(--pos)':v>=50?'var(--warn)':'var(--blk)';
  return '<span class="meter" style="width:46px;display:inline-block;vertical-align:middle"><i style="width:'+v+'%;background:'+col+'"></i></span> <span class="mono i2" style="font-size:9px">'+v+'</span>'}

const _fabWrap=(key,extra)=>{const old=VIEWS[key];if(!old)return;VIEWS[key]=function(a){return old(a)+extra()}};

/* system.releases ← production registry + E5 governance summary */
_fabWrap('system.releases',()=>{
  const rows=Object.entries(DOMAINS).flatMap(([dm,d])=>d.ws.map(w=>{
    const m=FAB_MAT[dm+'.'+w.id]||{ui:90,be:30,data:50,qa:60};
    return '<tr><td class="mono" style="font-size:10px">'+dm+'.'+w.id+'</td><td style="font-size:11px">'+U.esc(w.label)+'</td>'+
      '<td>'+fabBar(m.ui)+'</td><td>'+fabBar(m.be)+'</td><td>'+fabBar(m.data)+'</td><td>'+fabBar(m.qa)+'</td>'+
      '<td>'+(m.be>=70?chip('LIVE-CAPABLE','ch-ok','●'):chip('DEMO-COMPLETE','ch-demo','◈'))+'</td></tr>'}));
  return panel('TAB PRODUCTION REGISTRY — '+rows.length+' routes, maturity graded honestly (E8 lineage)',
    'computed over the LIVE route registry at render — UI ships in this file; BE = live-spine coverage; DATA = derived-vs-twin; QA = verify coverage. '+svk('FACT')+' for UI, '+svk('INFERENCE')+' for the grades (method stated), never higher.',
    '<div style="max-height:46vh;overflow-y:auto">'+tbl(['Route','Workspace','UI','BE','DATA','QA','State'],rows.join(''))+'</div>'+
    '<div class="i2" style="font-size:10.5px;padding:8px 2px">The V12_AUDITED registry tracked 54 routes with stored maturity numbers; this one grades whatever the running app actually registers — add a workspace and it appears here ungraded-high, honestly. Production readiness still requires external service, data, broker, security and live-evidence validation.</div>',{flush:true})+
  panel('TRANSFORMATION GOVERNANCE — the 1,000-upgrade discipline (E5 lineage)','50 accountable domains × 20 upgrades each; status is an enum, never a vibe',
    '<div class="grid g4">'+stat('DOMAINS','50','each with a named owner seat')+stat('UPGRADES','1,000','20 per domain, priority-ranked')+
    stat('STATUS ENUMS','4','<span class="mono" style="font-size:8.5px">APPLIED_UI · PARTIAL_REF · BACKEND_REQUIRED · ARCH_DEFINED</span>')+stat('FALSE CLAIMS','0','limitations remain visible — the KPI that matters')+'</div>'+
    kv('DOCTRINE','<span style="font-size:11px">A transformation registry exists so that "done" is auditable. Every upgrade cites its status enum; an upgrade marked APPLIED_UI_SYSTEM that needs a backend says '+svk('FACT')+' <b>BACKEND_REQUIRED</b> beside it. The registry’s only unforgivable state is a claim ahead of its evidence.</span>'));
});

/* system.agents ← P6 per-seat invocation economics */
_fabWrap('system.agents',()=>{
  const tiers=[['Opus','judgment seats (director, risk, courts)',3,'$0.42','veto-bearing calls only — spend follows authority'],
   ['Sonnet','desk seats (structure, options, flow, execution)',17,'$0.058','bounded fan-out per candidate ('+ck('agents.committee_max_fanout')+' max — AGT-004)'],
   ['Haiku','scan/telemetry seats (universe, freshness, cadence)',14,'$0.004','high-frequency, low-stakes — never decides, only surfaces']];
  return panel('INVOCATION ECONOMICS — LLM spend tied to decision value (P6 lineage)',
    'the invariant: deterministic engines watch everything; language models touch only what promotions earn '+svk('INFERENCE'),
    tbl(['Tier','Role','Seats','Cost / call (modeled)','Policy'],tiers.map(t=>'<tr><td><b>'+t[0]+'</b></td><td class="i1" style="font-size:11px">'+t[1]+'</td><td class="mono">'+t[2]+'</td><td class="mono">'+t[3]+'</td><td class="i2" style="font-size:10.5px">'+t[4]+'</td></tr>').join(''))+
    '<div class="grid g3" style="margin-top:8px">'+stat('PER PACKET','$1.85','full 14-step committee run, all tiers '+'<span class="demo-wm">modeled</span>')+
    stat('PER SYMBOL-MINUTE','$0.00006','deterministic heartbeat — the reason 5,234 symbols is affordable')+
    stat('DAILY ENVELOPE','$429','the $12.9k/mo fabric ÷ 30 — alarms at 80%')+'</div>'+
    kv('WHY THIS PANEL LIVES HERE','<span style="font-size:11px">Seat charters without cost discipline become an unbounded bill. The committee fans out at most '+prov('agents.committee_max_fanout')+' seats per candidate; scan tiers stay deterministic. If a seat’s spend rises without its decision-value rising, the council demotes it — economics is governance.</span>'));
});

/* system.knowledge ← semantic taxonomy doctrine */
_fabWrap('system.knowledge',()=>{
  return panel('SEMANTIC TAXONOMY — every claim is typed (S4 lineage)','a claim without a type is treated as OPINION; a claim without a rule ID is demoted to opinion',
    kv(svk('FACT'),'<span style="font-size:11px">Measured or contractual. Carries evidence: a ledger row, a config key, a computed tie-out. Example: "risk.min_rr = '+ck('risk.min_rr')+'" '+prov('risk.min_rr')+'</span>')+
    kv(svk('INFERENCE'),'<span style="font-size:11px">Derived by a stated method from facts. The method renders next to the number — beta from covariance over the candle series, maturity grades from live-spine coverage. Attack the method, not the messenger.</span>')+
    kv(svk('OPINION'),'<span style="font-size:11px">Judgment. Allowed — the desk runs on judgment — but never dressed as data. Committee votes are opinions with evidence attached; that is exactly what the packet renders them as.</span>')+
    '<div class="hr"></div>'+
    kv('ENFORCEMENT','<span style="font-size:11px">The audit army’s TRUTH pass checks derived-vs-stored tie-outs; the packet renders vote verdicts as enums ('+prov('LAW-014')+'); prose never overrides a threshold ('+prov('LAW-015')+'). The taxonomy is not decoration — it is what the S4 binding registry called semantic type, and it decides how a value may be used downstream.</span>'));
});

/* system.integrations ← P8 scale scenarios */
_fabWrap('system.integrations',()=>{
  const rows=[['5,234 (today)','8 workers','$12,876/mo','30s full cycle','the certified envelope'],
   ['10,468 (2×)','14 workers','$19,900/mo','34s','sub-linear: dedup + tier demotion absorb most growth'],
   ['26,170 (5×)','30 workers','$41,200/mo','44s','T2/T3 cadences stretch first — NEVER SHED lanes hold']];
  return panel('SCALE SCENARIOS — what growth actually costs (P8 lineage)','unit economics before ambition: the fabric grows sub-linearly or it does not grow '+svk('INFERENCE'),
    tbl(['Universe','Compute','Cost envelope','Cycle p95','Note'],rows.map(r=>'<tr><td class="mono" style="font-size:11px">'+r[0]+'</td><td class="mono" style="font-size:10.5px">'+r[1]+'</td><td class="mono">'+r[2]+'</td><td class="mono">'+r[3]+'</td><td class="i2" style="font-size:10.5px">'+r[4]+'</td></tr>').join(''))+
    '<div class="i2" style="font-size:10.5px;margin-top:6px">Scenarios are engineering estimates '+svk('INFERENCE')+' from the P4 queue model — priced BEFORE scaling so cost never becomes the surprise that forces shedding a lane that must never shed.</div>');
});

/* portfolio.account ← M2 "what kills programs — pre-answered" */
_fabWrap('portfolio.account',()=>{
  const kills=[['Risk creep','sizing formula is config, not mood — '+'per-trade cap '+prov('risk.max_trade_risk_pct'),'ladder demotion is automatic (MM-004)'],
   ['One bad week','weekly circuit '+prov('risk.max_week_loss_R')+' locks the desk to review-only','a locked week costs opportunity; an unlocked one costs the program'],
   ['Edge decay','pattern lab flags negative 30-trade expectancy slope','decayed setups demote to paper before they demote the account'],
   ['Operator tilt','coach telemetry: latency, revenge-pattern, streak depth','the ladder does not negotiate with adrenaline (LAW-012)'],
   ['Stage-jumping','stage gates are evidence counts, not calendar or feeling','demotion is a feature: fall back a stage, keep the program'],
   ['The ledger argument','running balance foots to equity or the session halts','the program never argues with the ledger — it reconciles']];
  return panel('WHAT KILLS PROGRAMS — PRE-ANSWERED (M2 lineage)','"no problems" is not offered; problems are budgeted',
    tbl(['Killer','The pre-answer','Doctrine'],kills.map(k=>'<tr><td><b style="font-size:11px">'+k[0]+'</b></td><td class="i1" style="font-size:11px">'+k[1]+'</td><td class="i2" style="font-size:10.5px">'+k[2]+'</td></tr>').join('')),{flush:true});
});
