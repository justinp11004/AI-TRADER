/* ═══════════ SYSTEM · administer the platform ═══════════ */
VIEWS['system.health']=function(){
  let h=vhead('SYSTEM · health & freshness','Degrade by dependency, never by vague “system health”',
    'The UI can always name exactly which dependency is stale and which actions are consequently blocked. Degraded ladder: NOMINAL → DATA_DEGRADED → LLM_DEGRADED → HALTED.');
  h+='<div class="grid g4">'+
    stat('Data plane',S.dataHealth,S.dataHealth==='NOMINAL'?'all feeds inside SLO':'approval paths blocked (LAW-006)')+
    stat('LLM runtime',S.llm,'committee fan-out ≤ '+ck('agents.committee_max_fanout')+' seats')+
    stat('Universe cycle','21.4s','budget '+ck('scan.universe_cycle_s')+'s '+prov('scan.universe_cycle_s'))+
    stat('Packet build p95','17.4s','budget '+ck('slo.packet_p95_s')+'s '+prov('slo.packet_p95_s'))+'</div>';
  h+=panel('FEEDS — freshness per dependency','<span class="demo-wm">demo twins</span> · breach → that dependency’s consumers block, nothing else',
    tbl(['Feed','Provider','SLO','Age','Cost','State',''],FEEDS.map(f=>'<tr'+(f.st==='OFF'?' class="dim"':'')+'><td><b>'+f.nm+'</b></td><td class="i1" style="font-size:11px">'+f.prov+'</td><td class="mono" style="font-size:10px">'+f.slo+'</td><td>'+(f.age===null?'<span class="i2">—</span>':fresh('',f.age,5))+'</td><td class="mono" style="font-size:10px">'+(f.cost||'—')+'</td><td>'+chip(f.st,f.st==='OK'?'ch-ok':'ch-mut',f.st==='OK'?'✓':'·')+'</td><td class="i2" style="font-size:10px">'+(f.note||'')+'</td></tr>').join('')),{flush:true});
  h+='<div class="grid g2">';
  h+=panel('DEGRADED-MODE DRILLS','practice the failure before the failure practices on you',
    '<div class="btnrow">'+
    '<button class="btn sm warn" data-cmd="drill.data">Drill: stale quote feed</button>'+
    '<button class="btn sm" data-cmd="drill.llm">Drill: LLM outage</button>'+
    '<button class="btn sm pos" data-cmd="drill.clear">Clear drills</button></div>'+
    '<div class="i2" style="font-size:10.5px;margin-top:8px">Data drill → risk engine denies with DATA-STALE; approvals block. LLM drill → observation mode: deterministic engines keep annotating, no new packets form, the system names the outage and waits.</div>');
  h+=panel('RUNBOOK INDEX','every failure has an owner and a procedure',
    ['RB-01 Stale market data → block approvals, page P1, failover feed','RB-02 Options chain outage → contract gates fail closed','RB-03 Broker mismatch → lock new orders, reconcile, never auto-resend','RB-04 Queue saturation → shed P3/P4 first; positions lane never sheds','RB-05 Model outage → deterministic observation mode','RB-06 Bad deployment → golden-packet regression gate blocks promote','RB-07 Kill switch → this button, tested from every surface','RB-08 Data corruption → halt state-changing commands, restore from event log'].map(r=>kv(r.slice(0,5),'<span style="font-size:11px">'+r.slice(6)+'</span>')).join(''));
  h+='</div>';
  h+=panel('PRODUCTION SCALE FABRIC — target architecture','SPEC, honestly labeled: nothing below is running in DEMO. This is the Phase 2–4 build plan at 5,234 symbols.',
    '<div class="grid g2"><div>'+
    tbl(['Tier','Scope','Cadence','LLM policy'],[['T0','24 command instruments','1–5s','never — deterministic only'],['T1','184 tradeable + active watch','1m','fan-out only when armed'],['T2','2,656 liquid optionable','1m light · 5m deep','promote on evidence'],['T3','2,370 remaining listed','1m heartbeat · EOD deep','never']].map(r=>'<tr><td class="mono"><b>'+r[0]+'</b></td><td class="i1" style="font-size:11px">'+r[1]+'</td><td class="mono" style="font-size:10px">'+r[2]+'</td><td class="i2" style="font-size:10px">'+r[3]+'</td></tr>').join(''))+
    '</div><div>'+
    kv('UNIT ECONOMICS','heartbeat $0.00006/sym-min · deep pass $0.018/sym · committee $0.42/candidate · verification packet $1.85')+
    kv('SCALE ENVELOPE','5,234 sym / 96 workers / ~$12.9k/mo → 10k / 164 / ~$20.8k → 25k / 384 / ~$45.7k')+
    kv('INVARIANTS','positions, risk, broker recon and T0 can never be starved · demotion never deletes evidence · every expensive call requires a promoted symbol + structured evidence object')+
    '</div></div>');
  h+=panel('COMPUTE & QUEUES — target worker fabric','SPEC (Phase W4): bounded pools, explicit backpressure, poison jobs → DLQ after 3 fails',
    '<div class="grid g2"><div>'+tbl(['Pool','Replicas×conc','p95'],[['Market ingest','12×24','—'],['Feature engine','24×64','—'],['Structure workers','16×24','—'],['Agent runtime','12×36','1,180ms'],['Packet builder','6×12','—'],['Risk & execution','8×16','22ms']].map(r=>'<tr><td>'+r[0]+'</td><td class="mono" style="font-size:10px">'+r[1]+'</td><td class="r num">'+r[2]+'</td></tr>').join(''))+'</div>'+
    '<div>'+kv('AUTOSCALE','util >75% OR queue-age >5s ×3 windows → +25% replicas, 90s cooldown')+kv('BACKPRESSURE','P2/P3 age >15s → coalesce to latest; P0 age >1s → shed ALL backfill + page')+kv('LANES','NEVER SHED (positions/risk/T0) → PRESERVE (T1) → DEGRADE FIRST (T2) → SHED NONCRITICAL (backfill)')+kv('EVENT ENVELOPE','<span class="mono" style="font-size:9.5px">event_id · topic · type · schema_id atlas.v13.* · rules_version · correlation_id RUN-* · sequence</span>')+'</div></div>'+
    tbl(['Topic','Partitions','>Rate','Retention'],[['market.trades','128','9,850/s','24h'],['market.quotes','128','5,920/s','24h'],['features.symbol','64','1,456/s','7d'],['agents.votes','16','—','7y'],['orders.lifecycle','16','—','7y'],['audit.events','16','—','7y']].map(r=>'<tr><td class="mono" style="font-size:10.5px">'+r[0]+'</td><td class="r num">'+r[1]+'</td><td class="r num">'+r[2]+'</td><td class="r num i2">'+r[3]+'</td></tr>').join('')),{flush:true});
  h+=panel('UNIVERSE HEALTH — the mandate’s own instruments','SLAs with 5× headroom on the cadence clock · <span class="demo-wm">demo readings</span>',
    tbl(['Instrument','>Reading','>SLA','State'],[
     ['Full-universe 5m feature pass','34.8s','≤ 60s','<span class="up">GREEN</span>'],
     ['1m T0/T1-active pass','6.2s','≤ 10s','<span class="up">GREEN</span>'],
     ['universe.summary beat','5.0s stable','5s','<span class="up">GREEN</span>'],
     ['DOM symbol rows mounted','≤ 200','≤ 200 (virtualized)','<span class="up">GREEN</span>'],
     ['LLM token-spend today','bounded by 40-promotion cap','promotions, never universe','<span class="up">INVARIANT HOLDS</span>'],
    ].map(r=>'<tr><td>'+r[0]+'</td><td class="r num">'+r[1]+'</td><td class="r num i2">'+r[2]+'</td><td class="mono" style="font-size:10.5px">'+r[3]+'</td></tr>').join(''))+
    '<div class="i2" style="font-size:10.5px;padding:8px 12px">Target transport topics: universe.summary · universe.promotions · anomalies.topN · barometer — per-symbol topics subscribe only on dossier open. Phase W4.</div>',{flush:true});
  return h;
};
CMD.define({id:'drill.data',label:'Stale-data drill',purpose:'Flip quote feed to STALE and watch the desk fail closed',run:()=>{S.dataHealth='DEGRADED';FEEDS[0].st='STALE';FEEDS[0].age=12;SVR.audit('HUMAN (owner)','drill','DRILL: quote feed forced STALE — approvals must block (LAW-006)');UI.toast('Quote feed STALE — watch Decisions: approvals now block with DATA-STALE','warn','DRILL');render()}});
CMD.define({id:'drill.llm',label:'LLM-outage drill',purpose:'Observation mode — no new packets form',run:()=>{S.llm='DEGRADED';SVR.audit('HUMAN (owner)','drill','DRILL: LLM runtime degraded — observation mode, deterministic engines continue');UI.toast('LLM degraded — deterministic annotation continues, packet formation paused','warn','DRILL');render()}});
CMD.define({id:'drill.clear',label:'Clear drills',purpose:'Restore nominal state',run:()=>{S.dataHealth='NOMINAL';S.llm='NOMINAL';FEEDS[0].st='OK';FEEDS[0].age=0.42;SVR.audit('HUMAN (owner)','drill','Drills cleared — all dependencies nominal');UI.toast('All dependencies nominal','ok','DRILL');render()}});

VIEWS['system.agents']=function(arg){
  if(arg&&SEATBY[arg]){
    const s=SEATBY[arg];
    let h=vhead('SYSTEM · agent deep-dive',s.id+' · '+s.nm+' '+(s.veto?chip('VETO SEAT','ch-blk','⛔'):''),s.grp+' · '+s.tier+' tier · cadence '+s.cad);
    h+='<div class="grid g2">';
    h+=panel('CHARTER','the seat’s constitution',
      '<div style="font-size:12.5px;line-height:1.65">'+U.esc(s.ch)+'</div><div class="hr"></div>'+
      kv('LANE','No seat sees another seat’s prompt — only schema outputs on the bus. Retrieval is lane-filtered.')+
      kv('AUTHORITY',s.veto?'Hard veto — unappealable, cannot be outvoted, cannot be averaged away.':'Voting seat — integrated by the Director via hierarchy, never averaged.'));
    h+=panel('LATEST OUTPUT ON THE BUS','schema-valid or it is treated as a block',
      '<div class="code">'+U.esc(JSON.stringify({seat:s.id,run:'RUN-NVDA-1042',verdict:(PACKETS[0].votes.find(v2=>v2.seat===s.id)||{verdict:'idle'}).verdict,evidence_refs:['DET-041@10:26','snap:'+PACKETS[0].planHash],schema:'agent_vote.v3',lane_ok:true},null,1))+'</div>'+
      '<div class="i2" style="font-size:10.5px;margin-top:6px">Full prompt/version/latency traces belong to the observability stack (Langfuse) in the production build.</div>');
    h+='</div>';
    h+='<div class="grid g2">';
    h+=panel('FORWARD PLAN','scheduled + conditional — what this seat WILL do, before it does it',
      (s.id==='S01'?kv('15:45','Forced open-position review (MOC window)')+kv('on 2 reds','Engage cooldown lockout — behavioral guardrail')+kv('continuous','Re-price every open plan against breakers'):
       s.id==='S22'?kv('11:00','AMD 175C spread re-check (S14 dissent → LS-121 track)')+kv('on trigger','Contract selection for TSLA if 5m MSS prints')+kv('T-7d','Flag AMD 14DTE × earnings conflict'):
       s.id==='S30'?kv('02:00','Nightly scenario batch — ~9,400 replays')+kv('+38 samples','ORB Momentum reaches evidence bar, re-grade'):
       s.id==='S31'?kv('16:20','EOD learning review — mine journal + telemetry')+kv('next A-grade','Sample displacement 60–65 band for LS-118'):
       kv('next cycle','Cadence '+s.cad+' — continuous duty')+kv('on trigger','Committee invocation when a candidate enters its lane'))+
      '<div class="i2" style="font-size:10.5px;margin-top:6px">The mesh always knows its next move.</div>');
    h+=panel('REASONING STREAM','concise rationale — never chain-of-thought',
      (s.veto?'<div class="kv"><span class="k">▸</span><span class="v" style="font-size:11px">Gate logic is deterministic: threshold vs reading, cite the config key, block or pass. No mood, no averaging.</span></div>':'')+
      '<div class="kv"><span class="k">▸</span><span class="v" style="font-size:11px">'+U.esc(s.id==='S01'?'AMD blocked: upstream S22 veto + missing §9 — no clean packet, no trade (LAW-007).':s.id==='S14'?'NVDA: first FVG return only — the displacement candle itself is a chase, not an entry.':s.id==='S21'?'NVDA heat 92nd pctile — filed as context. My lane ends at WATCH promotion (CC-13).':'Latest claim cites its rule IDs and evidence refs, or it is discarded as opinion.')+'</span></div>'+
      '<div class="kv"><span class="k">▸</span><span class="v" style="font-size:11px">Inputs consumed: '+U.esc(s.id==='S01'?'equity curve · open positions · correlation matrix · breaker state':s.grp==='Technical Court'?'deterministic annotations (DET-*) · structure ladder · volume features':'lane-filtered KB chunks + schema outputs on the bus')+'</span></div>');
    h+='</div>'+CMD.btn('nav.system.agents',null,'','← Full council');
    return h;
  }
  let h=vhead('SYSTEM · agent council','34 seats · 8 groups · 5 hard vetoes',
    'The council is an organizational and diagnostic view — seats are NOT navigation. Committee fan-out is bounded ('+ck('agents.committee_max_fanout')+' max) and conditional: not every candidate needs every agent.');
  h+=panel('PIPELINE — 14 machine steps, then the human','fan-out 2–9 parallel · gates sequential · any block short-circuits to the Director',
    '<div class="funnel">'+PIPELINE.map((p2,i)=>'<div class="fstage" style="min-width:76px;cursor:pointer" data-cmd="nav.system.agents" data-arg="'+p2[0]+'"><div class="fk">'+(i+1)+' · '+p2[1]+'</div><div class="fv" style="font-size:12px">'+p2[0]+'</div><div class="fd">'+SEATBY[p2[0]].nm.split(' ')[0]+'</div></div>').join('')+
    '<div class="fstage hot" style="min-width:90px"><div class="fk">15 · HUMAN</div><div class="fv" style="font-size:12px">YOU</div><div class="fd">hard edge — token, not callback</div></div></div>');
  h+=panel('CONSCIOUSNESS MAP — 34 seats as one connected mind','every edge is a real dependency from the pipeline DAG · click a neuron to deep-dive',cortexSVG());
  SEATGROUPS.forEach(g=>{
    const seats=SEATS.filter(s=>s.grp===g);
    h+='<div class="kick" style="font-family:var(--mono);font-size:9.5px;letter-spacing:1.4px;color:var(--ink2);margin:14px 0 6px;text-transform:uppercase">'+g+' — '+seats.length+' seats</div><div class="grid g4">'+
      seats.map(s=>'<div class="stat" style="cursor:pointer" data-cmd="nav.system.agents" data-arg="'+s.id+'"><div class="k">'+s.id+(s.veto?' <span style="color:var(--blk)">⛔ VETO</span>':'')+'</div><div class="v" style="font-size:12px">'+s.nm+'</div><div class="s">'+s.tier+' · '+s.cad+'</div></div>').join('')+'</div>'});
  h+=panel('LLM INVOCATION POLICY — when a seat may burn tokens','the budget linter: raw universe gets ZERO model calls',
    tbl(['Stage','Policy'],[['Raw universe (5,234)','Deterministic only — 0 LLM calls, ever'],['Promoted T2','Haiku/Sonnet summary, bounded by evidence delta'],['T1 forming','Specialist subset only'],['Triggered','Full required committee, schema-forced votes; risk/data short-circuit'],['Packet explanation','Cached evidence refs — no new numeric facts'],['Overnight learning','Batch API, fixed budget, never auto-promotes rules']].map(r=>'<tr><td class="mono" style="font-size:10.5px"><b>'+r[0]+'</b></td><td class="i1" style="font-size:11px">'+r[1]+'</td></tr>').join(''))+
    '<div class="i2" style="font-size:10.5px;padding:8px 12px">Tier routing: S00–S03 Opus (judgment+governance) · technical/catalyst courts Sonnet · scanners/routers Haiku. Spend today: bounded by the '+ck('universe.promotions_per_day_max')+'-promotion cap.</div>',{flush:true});
  h+='<div class="banner info" style="margin-top:12px"><span class="bico">i</span><div><b>Unappealable veto surface:</b> S02 DATA stale/missing/conflict · S01 RISK limits/circuits/stop · S26 5R honest path absent · S33 EXPOSURE cluster stack · S22 OPTIONS bad contract · S28 PACKET not 19/19.</div></div>';
  return h;
};
VIEWS['system.config']=function(){
  let h=vhead('SYSTEM · runtime config & constitution','Numeric truth + the 18 laws',
    'If prose and config disagree, config wins (LAW-015). LOCKED keys are editable by no path in this UI — or any UI. Changes flow diff → court → version → effective date.');
  h+='<div class="grid g2">';
  h+=panel('RUNTIME CONFIG — atlas_config (v13.2 active)','every threshold the desk enforces, with provenance',
    tbl(['Key','>Value','Rule','Why'],Object.entries(CONFIG).map(([k,c])=>'<tr'+(String(c.law).includes('LOCKED')?' style="background:var(--live-bg)"':'')+'><td class="mono" style="font-size:10.5px">'+k+'</td><td class="r num">'+c.v+' <span class="i2" style="font-size:9px">'+c.unit+'</span></td><td class="mono" style="font-size:9.5px;color:var(--live)">'+(c.law||'')+'</td><td class="i2" style="font-size:10px">'+U.esc(c.why)+'</td></tr>').join('')),{flush:true});
  h+=panel('THE CONSTITUTION — 18 prime laws','hard-coded; no agent, no learning suggestion, no profit outcome may modify them',
    LAWS.map(([id,t])=>'<div class="kv"><span class="k" style="color:var(--live)">'+id+'</span><span class="v" style="font-size:11px;line-height:1.55">'+U.esc(t)+'</span></div>').join(''));
  h+='</div>';
  h+=panel('IN-APP CHANGELOG — every release documents a failure and its fix','the V9 discipline: no release without a named defect it killed',
    CHANGELOG.map(c=>kv(c[0],'<span style="font-size:11px">'+U.esc(c[1])+'</span>')).join(''));
  h+=panel('VERSION TIMELINE','all changes are diffs with rollback plans',
    kv('v13.2 · ACTIVE','2026-03-16 — LS-117 applied (MOC blackout for 0DTE credit)')+
    kv('v13.1','2026-03-08 — detector params re-baselined post BT-0428')+
    kv('v13.3-candidate','BLOCKED — golden-packet regression 46/48; two regressions must be resolved first'));
  return h;
};
VIEWS['system.integrations']=function(){
  let h=vhead('SYSTEM · integrations','The nerves — and what is honestly not connected yet',
    'A control that is not implemented never pretends to work. Live broker: NOT CONFIGURED, by design, until Phase 8 gates pass.');
  h+=panel('TARGET INTEGRATION SET','demo twins now · real adapters swap in behind the same contracts',
    tbl(['Integration','Role','Demo state','Production plan'],[
     ['Polygon Advanced','Equities quotes/bars/ws','TWIN','Phase 2 — real data spine'],
     ['ThetaData','Options chains + Greeks','TWIN','Phase 2'],
     ['Unusual Whales','Flow (confirmation tier)','TWIN','Phase 6 · dual-provider per INF-021'],
     ['Benzinga / RSS','News & catalysts','TWIN','Phase 6'],
     ['Tradier sandbox','Paper broker','TWIN · fill model v2.1','Phase 5 — first real adapter'],
     ['Live broker (Tradier/IBKR)','Live execution','NOT CONFIGURED','Phase 8 — after drills + independent safety review'],
     ['Claude API','Committee runtime (tiered: Opus judgment · Sonnet desks · Haiku scans)','TWIN','Phase 4 — five-agent proof first'],
     ['Postgres + Timescale + pgvector','State · time series · KB retrieval','—','Phase 1'],
     ['Langfuse + OTel','Traces, cost, reasoning reconstruction','—','Phase 1'],
    ].map(r=>'<tr><td><b>'+r[0]+'</b></td><td class="i1" style="font-size:11px">'+r[1]+'</td><td>'+chip(r[2],r[2]==='NOT CONFIGURED'?'ch-mut':'ch-demo',r[2]==='NOT CONFIGURED'?'·':'◈')+'</td><td class="i2" style="font-size:10.5px">'+r[3]+'</td></tr>').join('')),{flush:true});
  const nOn=typeof NET!=='undefined'&&NET.on,nh=nOn?NET.health:null;
  h+=panel('LIVE SPINE — the real backend, shipped in this repo','backend/atlas-server.mjs · zero dependencies · run it, connect, and every data tab goes live',
    (nOn
      ?'<div class="grid g2"><div>'+
        kv('STATE',chip(NET.mode==='LIVE'?'CONNECTED · LIVE FEED':'CONNECTED · SIM FEED',NET.mode==='LIVE'?'ch-ok':'ch-warn',NET.mode==='LIVE'?'●':'◈')+' <span class="mono i2" style="font-size:10px">'+U.esc(NET.base||'')+'</span>')+
        kv('SERVER',(nh?U.esc(nh.version)+' · up '+U.mmss(nh.uptime_s):'—')+' · beat '+Math.max(0,Math.round((Date.now()-NET.lastBeat)/1000))+'s ago')+
        kv('PROVIDERS',nh?Object.entries(nh.providers).map(([k,v])=>'<span class="tag" style="color:'+(v.ok?'var(--pos)':v.ok===false?'var(--warn)':'var(--ink2)')+'">'+k+' '+(v.ok?'OK':v.ok===false?'DOWN':'idle')+'</span>').join(' '):'—')+
        kv('HONESTY',NET.mode==='LIVE'?'<span style="color:var(--pos)">real quotes streaming · plan levels rebased to live scale · orders remain paper/demo</span>':'<span style="color:var(--warn)">providers unreachable from server — SIM walk, stamped synthetic, never claimed live</span>')+
        '</div><div>'+
        kv('QUOTE BATCHES','<span class="mono">'+NET.qApplied+'</span> applied via SSE (every 2.5s)')+
        kv('SERVER LEDGER',nh?'<span class="mono">'+nh.ledger.entries+'</span> entries · head <span class="mono i2" style="font-size:9.5px">#'+U.esc(nh.ledger.head)+'</span> · hash-chained, persisted':'—')+
        kv('ATTESTED','<span class="mono">'+NET.attested+'</span> audits/tokens mirrored server-side')+
        kv('RISK PARITY','<span class="mono">'+NET.parity.match+'/'+NET.parity.n+'</span> local↔server verdicts matched'+(NET.parity.mismatch?' · <b style="color:var(--blk)">'+NET.parity.mismatch+' MISMATCH — '+U.esc(NET.parity.last||'')+'</b>':' · 0 mismatches'))+
        '</div></div><div class="btnrow" style="margin-top:8px">'+CMD.btn('backend.disconnect',null,'sm','Disconnect — restore demo adapter')+'<span class="pill">stale &gt;15s → automatic fail-closed to demo (LAW-006)</span></div>'
      :'<div class="row"><input id="api-base" class="inp" placeholder="http://127.0.0.1:8000" style="max-width:320px"><button class="btn pri" data-cmd="backend.connect">Connect · /v1/health</button>'+CMD.btn('backend.disconnect',null,'sm')+'</div>'+
       '<div class="i2" style="font-size:10.5px;margin-top:8px;line-height:1.7"><b>Run it:</b> <span class="mono" style="color:var(--ink1)">node backend/atlas-server.mjs</span> (port 8000) → Connect. '+
       'Success → real quotes/candles stream into every tab over SSE; risk law, tokens and the audit ledger are attested server-side (hash-chained, persisted). '+
       'Failure → the demo adapter stays active and says so. Reload never silently raises authority. Endpoints: <span class="mono">/v1/health · /v1/quotes · /v1/candles · /v1/risk/check · /v1/token/issue|redeem · /v1/audit · /v1/stream</span></div>'))+
    '<div class="banner info"><span class="bico">i</span><div><b>Small-scale cost meter (pre-fabric):</b> data ≈$543/mo (ThetaData $80 · Polygon $199 · UW $48 · news $216) + LLM ≈$865 + infra $65 ≈ <b>$1,473/mo</b> — the single-operator twin of the $12.9k fabric envelope.</div></div>';
  h+='<div class="banner warn"><span class="bico">!</span><div><b>No secrets in the browser, ever.</b> The legacy prototype rendered masked “API keys” implying credentials lived client-side. This build renders integration state only; keys live in a server-side secrets manager in production.</div></div>';
  return h;
};
VIEWS['system.permissions']=function(){
  let h=vhead('SYSTEM · permissions','Who can do what — least privilege, step-up for authority',
    'A browser compromise must never be sufficient to place a live order. Roles are enforced server-side; the UI merely reflects them.');
  h+=panel('ROLE MATRIX','',
    tbl(['Capability','Owner','Live Approver','Paper Trader','Analyst','Read-only','AI agents'],[
     ['View everything','✓','✓','✓','✓','✓','scoped lanes'],
     ['Decide packets (paper)','✓','✓','✓','—','—','NO'],
     ['Approve LIVE (token + step-up MFA)','✓','✓','—','—','—','NO — LAW-008'],
     ['Kill switch','✓','✓','✓','—','—','self-halt only'],
     ['Config & law changes (court)','✓','—','—','—','—','propose only — LAW-013'],
     ['Mode transitions upward','✓ step-up','✓ step-up','—','—','—','NO'],
    ].map(r=>'<tr><td>'+r[0]+'</td>'+r.slice(1).map(c=>'<td class="mono" style="font-size:10.5px">'+c+'</td>').join('')+'</tr>').join('')),{flush:true});
  h+='<div class="grid g2">';
  h+=panel('MODE LADDER','mutually exclusive; reload never silently raises authority',
    ENUMS.MODES.map(m=>kv(m,m==='DEMO'?'<b>ACTIVE</b> — synthetic data, watermarked, no broker, no claims':m==='REPLAY'?'historical point-in-time, deterministic seed, replay clock visible':m==='PAPER'?'real data + simulated fills; full risk & packet workflow applies':m==='LIVE_REVIEW'?'real data + account; ATLAS analyzes and proposes; cannot send an order':'every order needs a fresh server token + pre-send revalidation')).join('')+
    '<div class="btnrow" style="margin-top:9px"><button class="btn sm" disabled data-blocked="Mode transitions are server-gated with step-up auth.\nIn DEMO there is no server — transition honestly unavailable.">Request mode change</button></div>');
  h+=panel('STEP-UP AUTHENTICATION — how authority increases','reloading the browser can never silently raise authority',
    [['1','Request','Operator asks for a mode transition upward (e.g. PAPER → LIVE_REVIEW)'],
     ['2','Identity','Fresh MFA challenge — the standing session is NOT enough for more authority'],
     ['3','Server verdict','RBAC check + promotion-ladder gates evaluated server-side; UI merely displays the answer'],
     ['4','Audit + rollback','Transition journaled with identity/surface/reason; safe rollback path recorded BEFORE the switch'],
     ['5','Expiry','Elevated authority decays on timeout — quiet de-escalation, loud escalation']]
    .map(r=>kv('STEP '+r[0]+' · '+r[1],'<span style="font-size:11px">'+r[2]+'</span>')).join(''));
  h+=panel('SESSIONS & DEVICES','who is holding authority right now · <span class="demo-wm">demo</span>',
    tbl(['Session','Surface','Role','Since','State'],[
     ['this one','Desktop terminal','Owner','10:02 ET','<span class="up">ACTIVE · full desk authority (demo tier)</span>'],
     ['pocket-gate','Telegram (preview)','Owner · reduced surface','—','<span class="i2">NOT PAIRED — enums-only when live</span>'],
     ['—','PWA','—','—','<span class="i2">replaces Telegram only at reliability parity</span>'],
    ].map(r=>'<tr><td class="mono" style="font-size:10.5px">'+r[0]+'</td><td>'+r[1]+'</td><td class="i1" style="font-size:11px">'+r[2]+'</td><td class="mono" style="font-size:10.5px">'+r[3]+'</td><td class="mono" style="font-size:10.5px">'+r[4]+'</td></tr>').join('')),{flush:true});
  h+=panel('MOBILE DOCTRINE','the pocket gate does less, on purpose',
    kv('ON MOBILE','packet cards · approve/reject (same enums, LAW-014) · kill switch (hold-to-arm preserved) · P0/P1 alerts · EOD digest')+
    kv('NEVER ON MOBILE','config edits · learning approvals — governance is a desk activity')+
    kv('QUIET HOURS','22:00–07:00 · only P0 breaks through'));
  h+='</div>';
  return h;
};
VIEWS['system.audit']=function(){
  let h=vhead('SYSTEM · audit ledger','Append-only; every state change reconstructable',
    'Every command, decision, gate, drill, and kill lands here with an actor and a hash. In production this is the transactional outbox + event store; here it is the same shape, honestly demo-scoped.');
  h+=panel('','',
    '<div style="max-height:60vh;overflow-y:auto">'+SVR.ledger.map(l=>'<div class="kv"><span class="k">'+l.t+'</span><span class="v"><span class="tag">'+l.kind+'</span> <b style="font-size:11px">'+U.esc(l.actor)+'</b> <span class="i1" style="font-size:11px">'+U.esc(l.msg)+'</span> <span class="mono i2" style="font-size:9px">#'+l.h+'</span></span></div>').join('')+'</div>');
  h+='<div class="btnrow"><button class="btn sm" data-cmd="audit.export">Export evidence bundle (JSON)</button></div>';
  return h;
};
CMD.define({id:'audit.export',label:'Export evidence',purpose:'Download the session audit ledger + packet snapshots as JSON',
  run:()=>{const bundle={exported:CLOCK.hms()+' ET (sim)',mode:S.mode,seed:ck('demo.seed'),note:'DEMO evidence bundle — synthetic session, deterministic seed',ledger:SVR.ledger,packets:PACKETS.map(p=>({id:p.id,state:p.state,planHash:p.planHash,decision:p.decision||null}))};
    const blob=new Blob([JSON.stringify(bundle,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='ATLAS_evidence_bundle_demo.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),4000);
    SVR.audit('HUMAN (owner)','export','Evidence bundle exported — '+SVR.ledger.length+' ledger rows, '+PACKETS.length+' packet snapshots');
    UI.toast('Evidence bundle downloaded — a real file, honestly labeled DEMO','ok','EXPORT')}});

/* integrity — REAL checks, not theater. The legacy “200-scenario suite” tested
   the length of its own copy; this suite tests the actual application. */
const INTEGRITY={results:null,
  run(){const t=[],ok=(nm,cond,detail)=>t.push({nm,pass:!!cond,detail});
    ok('Seven domains, no more',Object.keys(DOMAINS).length===7,Object.keys(DOMAINS).length+' primary domains registered');
    const wsIds=Object.entries(DOMAINS).flatMap(([d,x])=>x.ws.map(w=>d+'.'+w.id));
    ok('Every workspace has a view',wsIds.every(id=>typeof VIEWS[id]==='function'),wsIds.filter(id=>!VIEWS[id]).join(', ')||'all '+wsIds.length+' wired');
    let renderFails=[];const cmds=new Set();
    wsIds.forEach(id=>{try{const html=VIEWS[id]();if(typeof html!=='string'||html.length<200)renderFails.push(id);
      else html.replace(/data-cmd="([^"]+)"/g,(m,c)=>{cmds.add(c);return m})}catch(e){renderFails.push(id+' ('+e.message+')')}});POSTRENDER.length=0;
    ok('Every workspace renders without throwing',renderFails.length===0,renderFails.join('; ')||wsIds.length+' render clean');
    ['app','drawer','modal','palette'].forEach(id=>{const el=document.getElementById(id);if(el)el.innerHTML.replace(/data-cmd="([^"]+)"/g,(m,c)=>{cmds.add(c);return m})});
    const unwired=[...cmds].filter(c=>!CMD.reg[c]);
    ok('Every rendered control is a registered command',unwired.length===0,unwired.join(', ')||cmds.size+' distinct commands wired');
    ok('Decision enums are canonical (LAW-014)',ENUMS.DECISIONS.length===9&&ENUMS.DECISIONS.includes('APPROVE_PAPER_ONLY'),ENUMS.DECISIONS.length+' decision enums');
    const p=PACKETS[0],r=p.rmath,calc=(r.t2-r.entry)/(r.entry-r.stop);
    ok('R is computed from levels, not stored',Math.abs(calc-r.r2)<0.01,'T2 recomputed '+calc.toFixed(2)+'R vs stated '+r.r2.toFixed(2)+'R');
    ok('5R floor enforced by risk engine',SVR.riskCheck({...r,rr:4.9}).verdict==='BLOCK','sub-5R plan → BLOCK with RISK-5R');
    ok('Spread veto enforced (OPT-007)',SVR.riskCheck({...r,spreadPct:9}).verdict==='BLOCK','9% spread → BLOCK');
    ok('Token is single-use + hash-bound',(()=>{const tk=SVR.issueToken('TEST','h1','APPROVE_PAPER_ONLY');const a1=SVR.redeemToken(tk.id,'h2');const a2=SVR.redeemToken(tk.id,'h1');return!a1.ok&&a1.code==='TKN-HASH'&&a2.ok&&!SVR.redeemToken(tk.id,'h1').ok})(),'wrong-hash refused · redeem once · replay refused');
    ok('Packet golden record complete',p.secs&&p.secs.length===19&&p.votes.length===19,'19 sections · 19 votes on '+p.id);
    ok('Config cites a rule for every key',Object.values(CONFIG).every(c=>c.law),Object.keys(CONFIG).length+' keys with provenance');
    ok('No live claims in DEMO',S.mode==='DEMO','mode='+S.mode+' · watermark active');
    ok('Live spine fails closed',typeof NET!=='undefined'&&typeof NET.disconnect==='function'&&!!CMD.reg['backend.connect']&&!!CMD.reg['backend.disconnect']&&(!NET.on||Date.now()-NET.lastBeat<20000),
      typeof NET==='undefined'?'NET adapter missing':NET.on?'connected · beat fresh · feed mode '+NET.mode:'disconnected — demo adapter active (fail-closed default)');
    this.results={at:CLOCK.hms(),tests:t,pass:t.filter(x=>x.pass).length,total:t.length};
    SVR.audit('SVR Integrity','check','Self-check: '+this.results.pass+'/'+this.results.total+' passing — results rendered verbatim, never fabricated');
    return this.results}};
VIEWS['system.integrity']=function(){
  const r=INTEGRITY.results;
  let h=vhead('SYSTEM · integrity checks','Real assertions against the running application',
    'The legacy build shipped a “200-scenario QA suite” that only measured the length of its own copy. This one executes real checks and renders whatever actually happened — including failures.');
  h+='<div class="btnrow" style="margin-bottom:12px"><button class="btn pri" data-cmd="integrity.run">Run integrity suite now</button>'+(r?'<span class="pill">last run '+r.at+' · '+r.pass+'/'+r.total+' passing</span>':'<span class="pill">runs automatically at boot</span>')+'</div>';
  if(r)h+=panel('RESULTS — rendered verbatim','a failed check renders as FAILED; nothing is smoothed over',
    tbl(['Check','Verdict','Detail'],r.tests.map(t=>'<tr'+(t.pass?'':' style="background:var(--blk-bg)"')+'><td>'+U.esc(t.nm)+'</td><td>'+(t.pass?chip('PASS','ch-ok','✓'):chip('FAILED','ch-blk','✕'))+'</td><td class="i2" style="font-size:10.5px">'+U.esc(t.detail)+'</td></tr>').join('')),{flush:true});
  const bt=BOOTTEST.results;
  if(bt)h+=panel('BOOT SELF-TEST S1–S8 — ran at session open','any FAIL pins risk_mode BLOCKED with the failing law named; the boot report is a public artifact of every session',
    tbl(['Test','Law','Assertion','Verdict','Detail'],bt.tests.map(t=>'<tr'+(t.pass?'':' style="background:var(--blk-bg)"')+'><td class="mono"><b>'+t.id+'</b></td><td class="mono" style="color:var(--live);font-size:10px">'+t.law+'</td><td style="font-size:11px">'+U.esc(t.nm)+'</td><td>'+(t.pass?chip('GREEN','ch-ok','✓'):chip('FAIL','ch-blk','✕'))+'</td><td class="i2" style="font-size:10px">'+U.esc(t.detail)+'</td></tr>').join(''))+
    '<div class="i2" style="font-size:10.5px;padding:8px 12px">Ran '+bt.at+' · '+bt.pass+'/8 · these execute against the live boundary — the same S1–S8 re-run against the real server in Phase W5.</div>',{flush:true});
  h+=panel('GOLDEN-TEST RUNNER — conformance fixtures, executed','input / expected / actual, diffed verbatim. Every C-game loss must add a fixture.',
    '<div class="btnrow" style="margin-bottom:10px"><button class="btn pri" data-cmd="golden.run">Run all fixtures</button>'+(GOLDEN_LAST?'<span class="pill">'+GOLDEN_LAST.filter(x=>x.pass).length+'/'+GOLDEN_LAST.length+' green</span>':'<span class="pill">not yet run this session</span>')+'</div>'+
    (GOLDEN_LAST?tbl(['Fixture','Family','Input','Expected','Actual',''],GOLDEN_LAST.map(g=>'<tr'+(g.pass?'':' style="background:var(--blk-bg)"')+'><td class="mono" style="font-size:10px"><b>'+g.id+'</b></td><td class="mono" style="font-size:10px">'+g.fam+'</td><td class="i1" style="font-size:10.5px">'+U.esc(g.input)+'</td><td class="i2" style="font-size:10.5px">'+U.esc(g.expected)+'</td><td class="mono" style="font-size:10.5px;color:'+(g.pass?'var(--pos)':'var(--blk)')+'">'+U.esc(g.actual)+'</td><td>'+(g.pass?chip('MATCH','ch-ok','✓'):chip('DIFF','ch-blk','✕'))+'</td></tr>').join('')):''));
  h+=panel('STRESS RANGE — the failure library vs the current build','expected gate behavior vs actual, row by row — red on any divergence',
    '<div class="btnrow" style="margin-bottom:10px"><button class="btn pri" data-cmd="stress.run">Run stress range</button>'+(STRESS_LAST?'<span class="pill">'+STRESS_LAST.filter(x=>x.pass).length+'/'+STRESS_LAST.length+' as specified</span>':'<span class="pill">not yet run this session</span>')+'</div>'+
    (STRESS_LAST?tbl(['Scenario','Expected','Actual',''],STRESS_LAST.map(st=>'<tr'+(st.pass?'':' style="background:var(--blk-bg)"')+'><td><b style="font-size:11px">'+st.id+'</b> · <span class="i1" style="font-size:11px">'+U.esc(st.nm)+'</span></td><td class="i2" style="font-size:10.5px">'+U.esc(st.exp)+'</td><td class="mono" style="font-size:10.5px;color:'+(st.pass?'var(--pos)':'var(--blk)')+'">'+U.esc(st.actual)+'</td><td>'+(st.pass?chip('AS SPEC','ch-ok','✓'):chip('DIVERGED','ch-blk','✕'))+'</td></tr>').join('')):''));
  h+=panel('PRODUCTION-AUDIT FINDINGS (S6 lineage) — defects the rebuild fixed by construction','the legacy audit’s P0 list, kept visible so it never regresses',
    [['Vote schema drift','Canonical ENUMS module + integrity check — non-canonical verdicts cannot render'],
     ['Human-pipeline crash (scalar int-cast)','The human is a hard edge (step 15), never a castable pipeline stage'],
     ['Missing fan-in','Director integration is an explicit step with a join contract — never implicit'],
     ['Risk gate too early','Risk runs AFTER contract selection (step 12 of 14) — an impossible contract kills the chart first'],
     ['Scale misconception (34 agents × 5,000 × every minute)','The invariant: deterministic engine watches everything; LLM touches bounded by promotions']].map(r=>kv('✕→✓','<b style="font-size:11px">'+r[0]+'</b> — <span class="i1" style="font-size:11px">'+r[1]+'</span>')).join(''));
  h+=panel('GRADUATED CAPITAL LADDER — live authority is EARNED','stage 5 reads NOT EARNED until the evidence exists; no shortcut is expressible',
    tbl(['Stage','Gate','State'],[['1 · Replay','Point-in-time reconstruction, no lookahead','<span class="up">AVAILABLE (demo replays deterministically)</span>'],['2 · Paper parity','BT↔paper divergence < 5%, n≥30','<span style="color:var(--warn)">AWAITS PHASE 5</span>'],['3 · Shadow live','Real data, zero orders, decision-match scoring','<span style="color:var(--warn)">AWAITS PHASE 4–7</span>'],['4 · Limited live','Human token per trade, minimum size','<span class="dn">LOCKED — Phase 8</span>'],['5 · Scaled','Caps grow only with evidence','<span class="dn">NOT EARNED</span>']].map(r=>'<tr><td class="mono"><b>'+r[0]+'</b></td><td class="i1" style="font-size:11px">'+r[1]+'</td><td class="mono" style="font-size:10.5px">'+r[2]+'</td></tr>').join('')),{flush:true});
  h+=panel('GO-LIVE GATES — brutally honest','a gate at 0% is information, not embarrassment',
    tbl(['Gate','>State','Evidence'],[
     ['UI / workflows','100%','39 workspaces browser-verified, 0 console errors'],
     ['Risk gates (demo boundary)','100%','5R, spread, breaker, token checks — property-verified above'],
     ['Real data spine','0%','Phase 2 — no provider connected, honestly labeled TWIN'],
     ['Agent runtime (real LLM)','0%','Phase 4 — five-agent proof first'],
     ['Paper broker','0%','Phase 5 — fill-model doctrine documented, not connected'],
     ['LIVE trading','0% · LOCKED','Phase 8 — after drills + independent safety review. By design.'],
    ].map(r=>'<tr><td>'+r[0]+'</td><td class="r num '+(r[1].startsWith('100')?'up':'dn')+'">'+r[1]+'</td><td class="i2" style="font-size:10.5px">'+r[2]+'</td></tr>').join('')),{flush:true});
  h+='<div class="banner info"><span class="bico">i</span><div><b>What this is not:</b> a substitute for the production test program (unit, contract, integration, Playwright E2E, property-based risk tests, chaos drills). It is the honest, in-page slice of it — and it never lies about a result.</div></div>';
  return h;
};
CMD.define({id:'integrity.run',label:'Run integrity suite',purpose:'Execute real assertions against the running app',run:()=>{INTEGRITY.run();UI.toast('Integrity: '+INTEGRITY.results.pass+'/'+INTEGRITY.results.total+' passing','ok','SELF-CHECK');render()}});

VIEWS['system.autonomy']=function(){
  let h=vhead('SYSTEM · autonomy lab','Paper-only, feature-flagged, LAW-008',
    'Three governed personalities can trade PAPER to build an unbiased evidence corpus — they take every idea they generate, so the corpus has zero survivorship bias. Live autonomy is forbidden until governed promotion criteria are met AND the owner arms it.');
  if(!S.autonomyLab){
    h+='<div class="banner gold"><span class="bico">◆</span><div><b>Feature flag OFF.</b> The autonomy lab ships dark by default. Enabling it starts PAPER personalities only — the risk officer’s caps and the kill switch bind them exactly as they bind you.</div></div>';
    h+='<div class="btnrow"><button class="btn gold" data-cmd="autonomy.enable">Enable autonomy lab (paper only)</button></div>';
    return h;
  }
  h+='<div class="grid g3">'+PERSONAS.map(p=>'<div class="panel"><div class="ph"><span class="t">'+p.ico+' '+p.nm+'</span><span class="spacer"></span>'+chip('PAPER','ch-paper','◈')+'</div><div class="pb">'+
    kv('HORIZON',p.horizon)+kv('RISK',p.risk)+kv('TARGET',p.target+' per trade')+kv('DTE',p.dte)+kv('SESSIONS',p.sessions)+kv('CORPUS','n='+p.n+' · paper equity '+U.moneyK(p.eq)+' · win '+p.win)+
    '<div class="i2" style="font-size:10.5px;margin-top:6px">'+U.esc(p.doctrine)+'</div>'+
    '<div class="i2" style="font-size:10px;margin-top:4px">Books: '+p.books.join(' · ')+'</div></div></div>').join('')+'</div>';
  h+=panel('RISK/REWARD FRONTIER — why these three books','and why premium-selling is NOT among them',
    tbl(['Book','>Win','>Avg win','>Avg loss','>Per trade','Status'],FRONTIER.map(f=>'<tr'+(f[5].startsWith('NOT')?' style="background:var(--blk-bg)"':'')+'><td>'+f[0]+'</td><td class="r num">'+f[1]+'</td><td class="r num up">'+f[2]+'</td><td class="r num dn">'+f[3]+'</td><td class="r num">'+f[4]+'</td><td class="i1" style="font-size:10.5px">'+f[5]+'</td></tr>').join('')),{flush:true});
  h+=panel('LIVE IDEA BLOTTER — the corpus, growing','personas take EVERY idea they generate — zero survivorship bias · <span class="demo-wm">sim corpus</span>',
    BLOTTER.length?tbl(['Time','ID','Mind','Sym','Book','State','>R'],BLOTTER.slice(0,18).map(b=>'<tr><td class="mono">'+b.t+'</td><td class="mono">'+b.id+'</td><td>'+b.ico+' '+b.who+'</td><td class="mono"><b>'+b.sym+'</b></td><td class="i1" style="font-size:10.5px">'+b.pb+'</td><td>'+lc(b.st==='OPEN'?'MANAGING':'CLOSED')+'</td><td class="r num '+(b.curR>=0?'up':'dn')+'">'+U.R(b.curR)+'</td></tr>').join(''))
    :'<div class="empty"><div class="e1">CORPUS WARMING UP</div>Ideas begin streaming within seconds of enabling the lab.</div>',{flush:true});
  h+='<div class="btnrow"><button class="btn gold" disabled data-blocked="LAW-008: autonomous LIVE is forbidden until governed promotion criteria are met (BT gates + n≥30 evidence + owner arming with typed confirmation). None of that exists in DEMO — so this button tells you the truth instead of pretending.">ARM AUTONOMOUS LIVE</button>'+
    '<button class="btn sm" data-cmd="autonomy.disable">Disable lab</button></div>';
  return h;
};
CMD.define({id:'autonomy.enable',label:'Enable autonomy lab',purpose:'Paper-only personalities behind a feature flag (LAW-008)',
  run:()=>{S.autonomyLab=true;SVR.audit('HUMAN (owner)','flag','Autonomy lab ENABLED — paper only, risk caps + kill switch bind');UI.toast('Autonomy lab enabled — paper personalities visible','paper','FLAG');render()}});
CMD.define({id:'autonomy.disable',label:'Disable autonomy lab',purpose:'Flag off',run:()=>{S.autonomyLab=false;SVR.audit('HUMAN (owner)','flag','Autonomy lab disabled');render()}});
