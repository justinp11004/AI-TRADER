/* ═══════════ V12.1 SYNCHRONY · the organ-views from the app×brain report ═══════════
   Source: ATLAS_APP_SYNCHRONICITY_DESIGN_REPORT (v13_4). Every organ below
   is implemented against the live in-page boundary — real assertions where
   the report demands tests, honest DEMO labels where transport is future. */

/* ── universe tier caps (report Addendum A — governed config) ── */
Object.assign(CONFIG,{
 'universe.t1_max':{v:300,unit:'symbols',law:'UNI-001',why:'T1 full-ladder cap — LLM touches bounded by promotions, never universe size'},
 'universe.active_watch_max':{v:50,unit:'symbols',law:'UNI-002',why:'ActiveWatch ceiling'},
 'universe.promotions_per_day_max':{v:40,unit:'/day',law:'UNI-003 · governed-learnable',why:'Daily promotion budget — the anti-runaway invariant'},
});
Object.keys(CONFIG).forEach(k=>{PROV_TIPS[k]=k+' = '+CONFIG[k].v+' '+CONFIG[k].unit+'\n'+CONFIG[k].why});

/* ── BOOT SELF-TEST S1–S8 — the eight LAW smoke tests, executed for real ── */
const BOOTTEST={results:null,
 run(){const t=[],ok=(id,law,nm,fn)=>{let pass=false,detail='';try{const r2=fn();pass=r2[0];detail=r2[1]}catch(e){detail='threw: '+e.message}t.push({id,law,nm,pass,detail})};
  ok('S1','GOV-024','Tokenless order refused',()=>{const r2=SVR.redeemToken('TKN-NONEXISTENT','h');return[!r2.ok&&r2.code==='TKN-404','unknown token → '+r2.code]});
  ok('S2','LAW-006','Stale data blocks approval',()=>{const prev=S.dataHealth;S.dataHealth='DEGRADED';const v2=SVR.riskCheck(PACKETS[0].rmath);S.dataHealth=prev;return[v2.verdict==='BLOCK'&&v2.codes.some(c=>c.code==='DATA-STALE'),'degraded feed → DATA-STALE block']});
  ok('S3','LAW-004','Fake-math 5R rejected',()=>{const v2=SVR.riskCheck({...PACKETS[0].rmath,rr:4.99});return[v2.verdict==='BLOCK'&&v2.codes.some(c=>c.code==='RISK-5R'),'4.99R plan → RISK-5R block']});
  ok('S4','LAW-016','Stop-widen inexpressible',()=>{const btns=VIEWS['portfolio.positions']();POSTRENDER.length=0;return[btns.includes('Widen stop')&&btns.includes('FORBIDDEN by envelope law'),'widen control renders disabled-with-law, never active']});
  ok('S5','RISK-014','Hard-limit blocks size',()=>{const v2=SVR.riskCheck({...PACKETS[0].rmath,riskUSD:S.equity*0.02});return[v2.verdict==='BLOCK'&&v2.codes.some(c=>c.code==='RISK-SIZE'),'2% risk → RISK-SIZE block']});
  ok('S6','LAW-005/011','Kill switch locks order paths',()=>{const prev=S.kill;S.kill=true;const v2=SVR.riskCheck(PACKETS[0].rmath);S.kill=prev;return[v2.verdict==='BLOCK'&&v2.codes.some(c=>c.code==='RISK-KILL'),'kill=true → RISK-KILL block on every plan']});
  ok('S7','LAW-014','Malformed decision enum refused',()=>{const r2=SVR.packetDecide(PACKETS[0],'APPROVE_YOLO');return[!r2.ok&&r2.msg.includes('LAW-014'),'non-canonical enum → refused']});
  ok('S8','AGT-lane','Committee fan-out bounded',()=>[ck('agents.committee_max_fanout')<=9&&PIPELINE.length===14,'fan-out cap '+ck('agents.committee_max_fanout')+' · pipeline 14 machine steps + human']);
  this.results={at:CLOCK.hms(),tests:t,pass:t.filter(x=>x.pass).length};
  if(this.results.pass<8){S.riskMode='BLOCKED';pushAlert('P0','BOOT SELF-TEST FAILED — '+t.filter(x=>!x.pass).map(x=>x.id).join(',')+' — risk_mode pinned BLOCKED','system.integrity')}
  SVR.audit('SVR BootSelfTest','boot','S1–S8: '+this.results.pass+'/8 — '+(this.results.pass===8?'session may open':'risk_mode PINNED BLOCKED until green'));
  return this.results}};

/* ── GOLDEN-TEST RUNNER — fixtures executed, input/expected/actual diffed ── */
const GOLDEN=[
 {id:'GT-5R-FAKE-MATH-001',fam:'5R',input:'Plan @ 4.99R vs TRUE stop (stop NOT tightened)',expected:'RISK-5R BLOCK',
  run:()=>{const v2=SVR.riskCheck({...PACKETS[0].rmath,rr:4.99});return v2.codes.some(c=>c.code==='RISK-5R')?'RISK-5R BLOCK':'PASSED-THROUGH ✗'}},
 {id:'GT-KILL-001',fam:'KILL',input:'Kill engaged mid-session, any plan submitted',expected:'RISK-KILL BLOCK + tokens invalidated',
  run:()=>{const prev=S.kill;S.kill=true;const v2=SVR.riskCheck(PACKETS[0].rmath);S.kill=prev;return v2.codes.some(c=>c.code==='RISK-KILL')?'RISK-KILL BLOCK + tokens invalidated':'ORDER PATH OPEN ✗'}},
 {id:'GT-PSY-REVENGE-001',fam:'PSY',input:'2 consecutive reds, immediate re-entry attempt',expected:'Cooldown rule armed (MEM-01 · rung 2)',
  run:()=>MEMORY.some(m=>m.txt.includes('Cooldown after 2 reds'))?'Cooldown rule armed (MEM-01 · rung 2)':'RULE MISSING ✗'},
 {id:'GT-SWING-001',fam:'SWING',input:'NVDA seeded series — sweep→displacement at 55% mark',expected:'Deterministic: identical candles every render',
  run:()=>{const a=candles('NVDA',96),b=candles('NVDA',96);return a===b&&a[Math.floor(96*0.55)].c<a[Math.floor(96*0.55)].o?'Deterministic: identical candles every render':'NON-DETERMINISTIC ✗'}},
 {id:'GT-TOKEN-REPLAY-001',fam:'ROUTE',input:'Redeem same token twice with valid hash',expected:'Second redeem refused (TKN-USED)',
  run:()=>{const tk=SVR.issueToken('GT','gh','APPROVE_PAPER_ONLY');SVR.redeemToken(tk.id,'gh');const r2=SVR.redeemToken(tk.id,'gh');return r2.code==='TKN-USED'?'Second redeem refused (TKN-USED)':'REPLAYED ✗'}},
];
let GOLDEN_LAST=null;
CMD.define({id:'golden.run',label:'Run golden fixtures',purpose:'Execute the conformance fixtures against the live boundary — diffs rendered verbatim',
 run:()=>{GOLDEN_LAST=GOLDEN.map(g=>{const actual=g.run();return{...g,actual,pass:actual===g.expected}});
  SVR.audit('SVR GoldenRunner','test','Golden fixtures: '+GOLDEN_LAST.filter(x=>x.pass).length+'/'+GOLDEN.length+' green');
  UI.toast('Golden fixtures: '+GOLDEN_LAST.filter(x=>x.pass).length+'/'+GOLDEN.length+' green — diffs rendered below','ok','GT RUNNER');render()}});

/* ── STRESS RANGE — scenario library, expected vs actual gate behavior ── */
const STRESS=[
 {id:'ST-01',nm:'Quote feed stales during approval window',exp:'DATA-STALE denial; approval impossible',
  run:()=>{const p2=S.dataHealth;S.dataHealth='DEGRADED';const v2=SVR.riskCheck(PACKETS[0].rmath);S.dataHealth=p2;return v2.codes.some(c=>c.code==='DATA-STALE')?'DATA-STALE denial; approval impossible':'APPROVED STALE ✗'}},
 {id:'ST-02',nm:'Plan drifts after token issuance',exp:'TKN-HASH invalidation; plan returns to review',
  run:()=>{const tk=SVR.issueToken('ST','hash-A','APPROVE_PAPER_ONLY');const r2=SVR.redeemToken(tk.id,'hash-B');return r2.code==='TKN-HASH'?'TKN-HASH invalidation; plan returns to review':'DRIFTED PLAN EXECUTED ✗'}},
 {id:'ST-03',nm:'Sector cluster stacks past cap',exp:'RISK-SECTOR block; correlated risk = one position',
  run:()=>{const v2=SVR.riskCheck({...PACKETS[0].rmath,sectorPct:3.1});return v2.codes.some(c=>c.code==='RISK-SECTOR')?'RISK-SECTOR block; correlated risk = one position':'STACKED ✗'}},
 {id:'ST-04',nm:'Binary event enters the window',exp:'RISK-EVENT blackout block (LAW-017)',
  run:()=>{const v2=SVR.riskCheck({...PACKETS[0].rmath,eventHrs:6});return v2.codes.some(c=>c.code==='RISK-EVENT')?'RISK-EVENT blackout block (LAW-017)':'TRADED INTO EVENT ✗'}},
];
let STRESS_LAST=null;
CMD.define({id:'stress.run',label:'Run stress range',purpose:'Replay the failure library against the current build — red on any divergence',
 run:()=>{STRESS_LAST=STRESS.map(st=>{const actual=st.run();return{...st,actual,pass:actual===st.exp}});
  SVR.audit('SVR StressRange','test','Stress range: '+STRESS_LAST.filter(x=>x.pass).length+'/'+STRESS.length+' behave as specified');
  UI.toast('Stress range: '+STRESS_LAST.filter(x=>x.pass).length+'/'+STRESS.length+' green','ok','STRESS');render()}});

/* ── CALIBRATION LEDGER — per-seat reliability, deciles × hit-rate, Brier ── */
const CALIB_LEDGER=[
 {seat:'S00',rows:[[95,88,42],[85,80,61],[75,72,58],[65,57,44]],brier:0.163,note:'slightly under-confident at the top — acceptable direction'},
 {seat:'S12',rows:[[90,86,38],[80,77,52],[70,66,47],[60,52,31]],brier:0.148,note:'best-calibrated seat on the desk'},
 {seat:'S14',rows:[[90,81,29],[80,74,44],[70,64,39],[60,55,27]],brier:0.171,note:'stable'},
 {seat:'S18',rows:[[85,64,22],[75,58,31],[65,51,26],[55,48,19]],brier:0.238,note:'WORST-CALIBRATED THIS WEEK — vendor-noise misreads; retrain queued (S34)'},
 {seat:'S21',rows:[[80,61,18],[70,55,24],[60,49,21],[50,46,15]],brier:0.226,note:'over-confident — consistent with sentiment being context, never trigger'},
];
/* ── ASK INBOX — the desk queues questions; answers embed as ground truth ── */
const ASKS=[
 {id:'ASK-042',q:'PLTR displacement scored 58 and ran +1.8R (STP-0908). Should the 55–60 band trade at reduced size, or stay rejected?',
  ev:['STP-0908','LS-118','AUT-file'],opts:['Reduced size in trend regimes only','Keep hard floor at 60','Need 20 more shadow samples'],state:'OPEN',sla:'2d'},
 {id:'ASK-041',q:'AMD contract veto normalized 20 minutes later (AUT-117). Approve LS-121 WAIT_FOR_SPREAD to A/B at 30 samples, or extend to 45?',
  ev:['AUT-117','LS-121','OPT-007'],opts:['30 samples is the bar (GOV-030)','Extend to 45 for regime split'],state:'OPEN',sla:'5d'},
 {id:'ASK-039',q:'Vendor pre-announcement noise has no doctrine (ERR-028). Author the rule, or let S18 propose one for your review?',
  ev:['ERR-028','S18-NEWS-009'],opts:['I will author it (Training Studio)','S18 drafts, I review'],state:'ANSWERED',ans:'S18 drafts, I review',sla:'—'},
];
CMD.define({id:'ask.answer',label:'Answer ask card',purpose:'Your answer embeds as labeled ground truth — the desk learns from it',
 run:a=>{const[id,idx]=a.split('|');const card=ASKS.find(x=>x.id===id);if(!card||card.state==='ANSWERED')return;
  card.state='ANSWERED';card.ans=card.opts[+idx];
  SVR.audit('HUMAN (owner)','ask',id+' answered: "'+card.ans+'" — embedded as labeled ground truth');
  UI.toast(id+' → embedded ✓ as ground truth. The desk will cite your answer.','gold','ASK INBOX');render()}});

/* ── MHH BOARD — mistake/habit/history flaws with live correction lines ── */
const MHH=[
 {id:'MHH-H1',who:'HUMAN',flaw:'Chasing the first displacement candle',steps:['Named: 31 tagged cases','Owned: worst pattern in the taxonomy','Correction authored','Injected at gate-time','Verifying: 6 sessions silent'],line:'“First return only — the displacement candle itself is a chase, not an entry.”',silent:6,goal:10},
 {id:'MHH-M1',who:'MACHINE',flaw:'S18 misclassifies vendor pre-announcement noise as catalyst',steps:['Named: ERR-028','Owned: S18 drift 12.4% vote-flip','Correction drafted (S18-NEWS-009)','Awaiting your authorship (ASK-039)','—'],line:'“Vendor PR cadence ≠ catalyst. Tier-1 wires only inside event windows.”',silent:2,goal:10},
 {id:'MHH-H2',who:'HUMAN',flaw:'Early exits before T3 on winners',steps:['Named: runner-discipline leak','Owned: costs ~0.9R per winner','Correction: trail template locked','Injected: S27 owns the runner','Verifying: A/B cohort'],line:'“The runner belongs to the FSM, not to your nerves.”',silent:4,goal:10},
];
/* ── SAMPLE-BLOCK TRACKER — Douglas 20-trade blocks, P&L blurred mid-block ── */
const BLOCKS=[
 {pb:'MMBM Reversal × Day',n:14,of:20,flawless:12,worst:'−6R pre-accepted',pnl:'+7.2R',done:false},
 {pb:'OTE Continuation × Swing',n:20,of:20,flawless:17,worst:'−7R pre-accepted',pnl:'+11.4R',done:true},
 {pb:'Silver Bullet × Day',n:7,of:20,flawless:7,worst:'−5R pre-accepted',pnl:'+2.1R',done:false},
];

/* ── BAROMETER — DET-LEDGER positions 1–4, ambient on MARKETS ── */
const BAROMETER={p1:9,p2:5,p3:4,p4:2,note:'Position 1–2 (constructive) 70% vs 3–4 (deteriorating) 30% · day-over-day +4pts',divergence:false};
function barometerStrip(){
 const tot=BAROMETER.p1+BAROMETER.p2+BAROMETER.p3+BAROMETER.p4;
 const good=Math.round((BAROMETER.p1+BAROMETER.p2)/tot*100);
 return'<div class="baro"><span class="mono i2" style="font-size:9px;letter-spacing:1px">BAROMETER · DET-LEDGER</span>'+
  '<span class="bnum up">P1 '+BAROMETER.p1+'</span><span class="bnum up" style="opacity:.7">P2 '+BAROMETER.p2+'</span><span class="bnum dn" style="opacity:.7">P3 '+BAROMETER.p3+'</span><span class="bnum dn">P4 '+BAROMETER.p4+'</span>'+
  '<div class="gauge" style="flex:1;min-width:120px"><i style="width:'+good+'%"></i></div><span class="mono" style="font-size:10.5px">'+good+'% constructive</span>'+
  (BAROMETER.divergence?chip('DIVERGENCE — index highs vs deteriorating ledger','ch-blk','⛔'):chip('NO DIVERGENCE','ch-ok','✓'))+
  '<span class="i2" style="font-size:9.5px">'+BAROMETER.note+'</span></div>';
}

/* ── in-app changelog — every release documents a failure and its fix ── */
const CHANGELOG=[
 ['V14.0 ESTATE','Found: a 5-year desk needs organs a 1-year desk lacks — and the audit skill proved review was still single-lens. Fix: 14 new workspaces (internals, playbooks, fundamentals, factors, sizing lab, pre-mortem, hedge desk, capital ledger, pattern lab, coach, briefing, SLO observatory, releases, AUDIT ARMY with 8 executable passes incl. the SVR gate attack list + source self-scan), estate deepening across 10 existing views (29-detector registry, playbook FSMs, nine tests, case law). The army’s own S1 catch on first run (an over-broad self-scan) was fixed with the check refined — the audit audits itself.'],
 ['V13.0 LIVE SPINE','Found: the transport seam only probed — no tab could actually go live. Fix: real zero-dep backend (backend/atlas-server.mjs): live quotes/candles (Stooq→Yahoo, strictly validated), server-side risk law + tokens, hash-chained persisted audit ledger, SSE stream. Client fails closed at every seam; SIM fallback is always labeled.'],
 ['V12.3 STUDIO','Found: the chart was a picture, not an instrument. Fix: interactive Chart Studio Pro — pan/zoom/crosshair, 8 drawing tools, R-ruler, position tool wired to the live 5R gate, PNG export, VC-corpus filing.'],
 ['V12.1 SYNCHRONY','Found: the app×brain gap matrix (23 missing organs). Fix: boot self-test, golden runner, stress range, calibration ledger, ask inbox, MHH board, block tracker, barometer, ivory packet, universe caps — all real.'],
 ['V12.0','Found: domain hotkeys shadowed packet enum keys (caught by Playwright). Fix: judgment-room precedence.'],
 ['V11.1','Found: consolidation dropped legacy capabilities. Fix: full-feature merge, 63 routes → verified homes.'],
 ['V11.0','Found: 464 inline handlers, fabricated QA, token theater in legacy. Fix: command contract, real integrity suite, honest DEMO framing.'],
];
const RULES_VERSION='rules v13.4 · KB 13.3-candidate paired';

/* ── ASK conversion from autopsy (needs_user_rule → ask card) ── */
CMD.define({id:'ask.fromAutopsy',label:'Convert to ask card',purpose:'A needs-user-rule finding becomes a question card — one tap',
 run:a=>{ASKS.unshift({id:'ASK-'+(43+ASKS.length),q:'From '+a+': should flow-absence degrade (ADVISORY-ABSENT) instead of blocking when flow is confirmation-tier?',ev:[a,'INF-021','LAW-006'],opts:['Degrade — flow is confirmation-tier','Keep blocking — freshness is freshness'],state:'OPEN',sla:'3d'});
  SVR.audit('HUMAN (owner)','ask','Autopsy '+a+' converted to ask card');
  UI.toast('Ask card created — answer it in Review → Ask Inbox','gold','ASK');go('review','asks')}});

/* ── VIEWS ── */
VIEWS['review.asks']=function(){
 let h=vhead('REVIEW · ask inbox','The desk queues its questions; your answers embed as labeled ground truth',
  'A terminal that only celebrates trades feels broken exactly when the system works best — principled refusal generates questions, and questions generate doctrine.');
 h+=ASKS.map(c=>'<div class="panel'+(c.state==='OPEN'?' gold':'')+'"><div class="ph"><span class="t">'+c.id+'</span><span class="spacer"></span>'+(c.state==='OPEN'?chip('OPEN · SLA '+c.sla,'ch-live','◆'):chip('EMBEDDED ✓','ch-ok','✓'))+'</div><div class="pb">'+
  '<div style="font-size:12.5px;line-height:1.6;margin-bottom:8px">'+U.esc(c.q)+'</div>'+
  '<div class="row" style="margin-bottom:8px">'+c.ev.map(e=>'<span class="tag">'+U.esc(e)+'</span>').join('')+'</div>'+
  (c.state==='OPEN'?'<div class="btnrow">'+c.opts.map((o,i)=>'<button class="btn sm pri" data-cmd="ask.answer" data-arg="'+c.id+'|'+i+'">'+U.esc(o)+'</button>').join('')+'</div>'
   :kv('YOUR ANSWER','<b>'+U.esc(c.ans)+'</b> — embedded as ground truth; the desk cites it'))+'</div></div>').join('');
 return h;
};

CMD.define({id:'zone.inspect',label:'Zone inspector',purpose:'Every zone answers four questions — why valid · what invalidates · which contract · early/clean/late',audit:false,
 run:a=>{const s2=symBy(S.sym);const z={
  FVG:['Fair value gap '+(s2.levels.entry?U.fmt(s2.levels.entry*0.997)+'–'+U.fmt(s2.levels.entry*1.0005):'—')+' (DET-041)','Displacement left an imbalance; first return is the highest-quality entry the model knows.','A close through the far side of the gap — the imbalance is then absorbed, thesis dead.','21DTE Δ.42 call — survives the time-stop window; 7DTE dies on theta before T2 can pay.','CLEAN if this is the FIRST return · EARLY if price has not swept the pool · LATE after two touches (third-touch rule).'],
  OB:['Order block '+(s2.levels.stop?U.fmt(s2.levels.stop*1.001)+'–'+U.fmt(s2.levels.stop*1.007):'—')+' (DET-052)','Last opposing candle before displacement — where the trapped side was built.','Trading through the block body on closing basis — the footprint failed.','Same contract as the FVG entry; the OB is the deeper alternative fill.','EARLY at first touch without reaction · CLEAN on reaction + LTF shift · LATE once mitigated twice.'],
  POOL:['Liquidity pool — '+U.esc(s2.levels.poolAbove||'—')+' (DET-044)','Resting stops = fuel. The draw on liquidity is the reason the trade can pay 5R.','Pools never re-arm; once swept, this magnet is SPENT forever.','Targets live here, not entries — T2 sits at the untaken pool.','Not an entry zone — timing grammar answers WHERE, not WHEN.']}[a];
  UI.modal('ZONE INSPECTOR · '+a+' — the four questions',
   kv('ZONE',z[0])+kv('1 · WHY VALID',z[1])+kv('2 · WHAT INVALIDATES',z[2])+kv('3 · WHICH CONTRACT',z[3])+kv('4 · EARLY / CLEAN / LATE',z[4])+
   '<div class="i2" style="font-size:10.5px;margin-top:8px">Doctrine: a zone that cannot answer all four questions is decoration, not evidence (LAW-010).</div>',
   '<button class="btn" data-cmd="ui.closeModal">Close</button>')}});
