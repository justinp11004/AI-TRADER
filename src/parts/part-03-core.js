/* ═══════════ U · utilities ═══════════ */
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const U={
  esc:s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),
  fmt:(n,d=2)=>Number(n).toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d}),
  int:n=>Number(n).toLocaleString('en-US'),
  money:n=>(n<0?'-$':'$')+U.fmt(Math.abs(n),2),
  moneyK:n=>{const a=Math.abs(n),s=n<0?'-$':'$';return a>=1e6?s+U.fmt(a/1e6,2)+'M':a>=1e4?s+U.fmt(a/1e3,1)+'k':s+U.fmt(a,2)},
  pct:(n,d=2)=>(n>=0?'+':'')+U.fmt(n,d)+'%',
  sign:(n,d=2)=>(n>=0?'+':'')+U.fmt(n,d),
  R:(n,d=2)=>(n>=0?'+':'')+U.fmt(n,d)+'R',
  ago:m=>m<1?'just now':m<60?Math.round(m)+'m ago':U.fmt(m/60,1)+'h ago',
  mmss:s=>{s=Math.max(0,Math.round(s));return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')},
  hash8:s=>{let h=0x811c9dc5;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193)}return('0000000'+(h>>>0).toString(16)).slice(-8)},
  cls:(...a)=>a.filter(Boolean).join(' '),
  clamp:(n,lo,hi)=>Math.min(hi,Math.max(lo,n)),
  by:(arr,k)=>Object.fromEntries(arr.map(x=>[x[k],x])),
};
const chip=(txt,cls,ico)=>'<span class="chip '+cls+'" data-ico="'+(ico||'●')+'">'+U.esc(txt)+'</span>';
const lc=st=>'<span class="lc lc-'+U.esc(st)+'">'+U.esc(st.replace(/_/g,' '))+'</span>';
const prov=(id,tip,kind)=>'<span class="prov '+(kind||(id.startsWith('LAW')?'law':id.includes('.')?'cfg':''))+'" title="'+U.esc(tip||PROV_TIPS[id]||id)+'">'+U.esc(id)+'</span>';
const stat=(k,v,s,extra)=>'<div class="stat'+(extra?' '+extra:'')+'"><div class="k">'+k+'</div><div class="v">'+v+'</div>'+(s?'<div class="s">'+s+'</div>':'')+'</div>';
const fresh=(label,age,slo)=>{const cls=age>slo*3?'dead':age>slo?'warn':'';return '<span class="fresh '+cls+'">'+U.esc(label)+' · '+(age<1?'<1s':Math.round(age)+'s')+'</span>'};

/* ═══════════ RNG · seeded determinism (demo replayability) ═══════════ */
const RNG=(()=>{let s=0xA71A5;const set=x=>{s=x>>>0};const r=()=>{s|=0;s=(s+0x6D2B79F5)|0;let t=Math.imul(s^(s>>>15),1|s);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296};
  return{set,r,pick:a=>a[Math.floor(r()*a.length)],range:(lo,hi)=>lo+r()*(hi-lo),gauss:()=>{let u=0,v=0;while(!u)u=r();while(!v)v=r();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)}}})();

/* ═══════════ CLOCK · simulated exchange time (ET) ═══════════ */
const CLOCK=(()=>{
  let mins=10*60+31, sec=41;                     // boots 10:31:41 ET — mid RTH
  const tick=()=>{sec+=2;if(sec>=60){sec-=60;mins++}if(mins>=16*60+5)mins=4*60};
  const hm=()=>String(Math.floor(mins/60)).padStart(2,'0')+':'+String(mins%60).padStart(2,'0');
  const hms=()=>hm()+':'+String(Math.floor(sec)).padStart(2,'0');
  const phase=()=>mins<9*60+30?'PRE-MARKET':mins<10*60?'NY OPEN DRIVE':mins<11*60+30?'NY AM SESSION':mins<13*60?'LUNCH DOLDRUMS':mins<15*60?'NY PM SESSION':mins<16*60?'CLOSING HOUR':'AFTER HOURS';
  const killzone=()=>mins>=9*60+50&&mins<=11*60?'NY-AM KILLZONE':mins>=13*60+30&&mins<=16*60?'NY-PM KILLZONE':null;
  return{tick,hm,hms,phase,killzone,mins:()=>mins};
})();

/* ═══════════ CONFIG · runtime numeric truth (atlas_config.yaml mirror) ═══════════ */
const CONFIG={
  'risk.max_trade_risk_pct':{v:1.0,unit:'%equity',law:'RISK-011',why:'Hard per-trade risk ceiling; sizing formula input'},
  'risk.max_open_risk_R':{v:3.0,unit:'R',law:'RISK-020',why:'Sum of open-position risk may never exceed this'},
  'risk.max_day_loss_R':{v:2.0,unit:'R',law:'RISK-014',why:'Daily loss circuit. Breach → risk_mode BLOCKED — hard state transition (LAW-011)'},
  'risk.max_week_loss_R':{v:5.0,unit:'R',law:'RISK-015',why:'Weekly loss circuit → desk locks to review-only'},
  'risk.min_rr':{v:5.0,unit:'R multiple',law:'LAW-004 · LOCKED',why:'Realistic 5R against the TRUE structural stop. Sub-5R rejected by construction. Constitutional — no path edits this'},
  'risk.max_sector_exposure':{v:2.5,unit:'%equity',law:'RISK-031',why:'Correlated cluster cap — NVDA+AMD count as one bet'},
  'risk.loss_ladder_step':{v:0.25,unit:'%/rung',law:'MM-004',why:'Risk steps DOWN per ladder rung after losses; 2-loss cooldown arms at rung 2'},
  'risk.event_window_hrs':{v:24,unit:'hours',law:'EVT-002',why:'No new entries inside event window (FOMC/CPI/earnings) — LAW-017'},
  'packet.ttl_min':{v:25,unit:'min',law:'GOV-021',why:'Packet expiry after assembly; stale evidence cannot be approved'},
  'packet.sections_required':{v:19,unit:'sections',law:'LAW-007 · LOCKED',why:'All 19 sections required for APPROVE_LIVE'},
  'token.ttl_sec':{v:120,unit:'seconds',law:'GOV-024 · LOCKED',why:'Approval token TTL; single-use; plan-hash bound. Execution refuses expired tokens'},
  'options.max_spread_pct':{v:8.0,unit:'%',law:'OPT-007',why:'Liquidity veto: max bid/ask spread of mid. A bad contract kills a good chart (LAW-009)'},
  'options.min_oi':{v:500,unit:'contracts',law:'OPT-008',why:'Liquidity veto: minimum open interest'},
  'options.min_volume':{v:200,unit:'contracts',law:'OPT-009',why:'Liquidity veto: minimum day volume'},
  'options.iv_rank_debit_max':{v:55,unit:'IVR',law:'OPT-014',why:'Above this IVR prefer spreads over long premium'},
  'detect.displacement_body':{v:1.25,unit:'× body',law:'DET-031',why:'Displacement candle body multiple threshold'},
  'detect.displacement_vol':{v:1.5,unit:'× vol',law:'DET-032',why:'Displacement volume multiple threshold'},
  'scan.universe_size':{v:5234,unit:'symbols',law:'SLO-001',why:'US-listed deterministic heartbeat universe (2,840 optionable)'},
  'scan.universe_cycle_s':{v:30,unit:'seconds',law:'SLO-002',why:'Full-universe feature-engine cycle budget (RTH)'},
  'slo.packet_p95_s':{v:120,unit:'seconds',law:'SLO-004',why:'TRIGGERED → packet-delivered p95 budget'},
  'slo.feed_quote_ms':{v:800,unit:'ms',law:'SLO-011',why:'Quote feed freshness SLO; breach → DEGRADED, blocks approval'},
  'slo.feed_chain_ms':{v:2500,unit:'ms',law:'SLO-012',why:'Options chain freshness SLO'},
  'alerts.p2_batch_min':{v:15,unit:'min',law:'ALR-003',why:'P2 alert batching window; only P0 breaks quiet hours'},
  'agents.committee_max_fanout':{v:9,unit:'seats',law:'AGT-004',why:'Bounded committee per candidate — never all 34 seats'},
  'demo.seed':{v:685013,unit:'uint32',law:'DEMO',why:'RNG seed — this exact demo session is reproducible'},
};
const ck=k=>CONFIG[k]?CONFIG[k].v:'⚠missing:'+k;
const PROV_TIPS={};for(const k in CONFIG)PROV_TIPS[k]=k+' = '+CONFIG[k].v+' '+CONFIG[k].unit+'\n'+CONFIG[k].why;

/* ═══════════ LAWS · constitution (displayed here, enforced in SVR) ═══════════ */
const LAWS=[
 ['LAW-001','No structural invalidation → no trade. Every idea names the exact price where it is wrong.'],
 ['LAW-002','No structural or liquidity target → no trade. A draw on liquidity must exist and be named.'],
 ['LAW-003','No trapped counterparty → downgrade or reject. Someone must be wrong and forced to pay.'],
 ['LAW-004','Live trades require a realistic ≥5R path against the TRUE structural stop. Never tighten a stop to manufacture 5R.'],
 ['LAW-005','Risk Officer veto is absolute. No override exists in any mode, for any actor.'],
 ['LAW-006','Stale, missing, or contradictory data blocks live approval. Freshness is enforced per dependency.'],
 ['LAW-007','Every live execution requires a complete verification packet (19/19 sections) and explicit human approval.'],
 ['LAW-008','Autonomous live trading is forbidden until governed promotion criteria are met and the owner explicitly arms it.'],
 ['LAW-009','A bad option contract invalidates a good chart. Naked short options are forbidden. Unpromoted strategies are paper-only.'],
 ['LAW-010','Labels without behavior are decoration. A named pattern must show liquidity, displacement, structure, and context evidence.'],
 ['LAW-011','Daily and weekly loss limits are hard state transitions, not warnings.'],
 ['LAW-012','The prior trade’s outcome cannot alter the next trade’s formulaic risk. No revenge sizing, no house-money sizing.'],
 ['LAW-013','Agents may propose rule changes with evidence; only human governance deploys them.'],
 ['LAW-014','Every decision uses canonical enums. Free-text approval does not exist.'],
 ['LAW-015','Runtime config is numeric truth. Prose never overrides a threshold.'],
 ['LAW-016','Personality, duration, chart ladder, and contract DTE must stay aligned. A scalp cannot become a swing.'],
 ['LAW-017','Event blackouts are enforced (risk.event_window_hrs). Binary events are not tradeable edges here.'],
 ['LAW-018','Every taken AND rejected decision creates a journal record. Rejection reasons are data.'],
];
const LAWBY=U.by(LAWS.map(([id,text])=>({id,text})),'id');
LAWS.forEach(([id,t])=>PROV_TIPS[id]=id+'\n'+t);

/* ═══════════ ENUMS · canonical (LAW-014) ═══════════ */
const ENUMS={
  MODES:['DEMO','REPLAY','PAPER','LIVE_REVIEW','LIVE_HUMAN_APPROVED'],
  DECISIONS:['APPROVE_LIVE','APPROVE_REDUCED_SIZE','APPROVE_PAPER_ONLY','WAIT_FOR_TRIGGER','MODIFY_LEVELS','REJECT_BAD_TRADE','REJECT_BAD_CONTRACT','REJECT_NEEDS_MORE_DATA','LOG_AND_REVIEW'],
  REJECT_REASONS:['WRONG_STRUCTURE','NO_5R','BAD_OPTIONS_CHAIN','NEWS_RISK','CHASING','LOW_CONFIDENCE','ARCHIVE_AS_LEARNING_EXAMPLE'],
  SETUP:['SCANNING','CANDIDATE','FORMING','ARMED','TRIGGERED'],
  PACKET:['FORMING','READY_FOR_RISK','RISK_BLOCKED','READY_FOR_HUMAN','APPROVED_PAPER','APPROVED_LIVE_PENDING_TOKEN','REJECTED','EXPIRED'],
  ORDER:['ORDER_SUBMITTED','WORKING','PARTIAL_FILL','FILLED','CANCELED','REJECTED_BY_BROKER','UNKNOWN'],
  POSITION:['MANAGING','SCALING','CLOSED','AUDITED'],
  RISK_MODE:['NORMAL','REDUCED','COOLDOWN','BLOCKED'],
  ALERT:['P0','P1','P2','P3'],
  VERDICT:['pass','advisory','abstain','block'],
};

/* ═══════════ STORE · central state + pub/sub ═══════════ */
const STORE={
  s:{
    mode:'DEMO', riskMode:'NORMAL', kill:false, killReason:'',
    domain:'command', ws:null, wsArg:null,           // routing: domain / workspace / argument
    sym:'NVDA', packet:'PKT-2231', seat:'S12',
    equity:60000, dayPnl:684.20, weekPnl:2140.55, openRiskR:1.42, dayLossUsedR:0.0,
    dataHealth:'NOMINAL', llm:'NOMINAL',
    focusmode:false, autonomyLab:false,
    tick:0,
  },
  subs:[],
  set(patch){Object.assign(this.s,patch);this.subs.forEach(f=>f(this.s))},
  sub(f){this.subs.push(f)},
};
const S=STORE.s;
