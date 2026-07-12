/* ═══════════ DEMO DATA · deterministic, watermarked, seeded ═══════════
   Everything below is synthetic. It exists so every workflow can be
   exercised honestly end-to-end. Field shapes mirror the canonical
   schemas so the real backend swaps in without UI changes.
   Content lineage: extracted from the V7–V10 knowledge base (canon). */
RNG.set(ck('demo.seed'));

/* ── THE FIRM — 34 seats, 8 groups (V13 canon). Five veto seats. ── */
const SEATS=[
 {id:'S00',nm:'Head Director',grp:'Executive',tier:'Opus',cad:'per-pipeline',veto:false,ch:'Integrator, not vote-averager. Resolves conflicts by the authority hierarchy; grades setups; owns the packet thesis.'},
 {id:'S01',nm:'Risk Officer',grp:'Executive',tier:'Opus',cad:'per-pipeline',veto:true,ch:'Absolute veto. Wraps the deterministic risk engine with judgment. Can block, never approve. Veto on rule, never on mood.'},
 {id:'S02',nm:'Data Integrity',grp:'Executive',tier:'Haiku',cad:'15s',veto:true,ch:'Stale = block. Owns freshness SLOs, provenance, feed health.'},
 {id:'S03',nm:'Learning Governance',grp:'Executive',tier:'Opus',cad:'daily',veto:false,ch:'Rule-change court. Evidence bar, versioned diffs, human sign-off, rollback plans. Nothing self-applies.'},
 {id:'S04',nm:'Data Orchestrator',grp:'Data / Intel',tier:'Haiku',cad:'30s',veto:false,ch:'Feed scheduling, normalization, freshness stamps into consciousness state.'},
 {id:'S05',nm:'Universe Scanner',grp:'Data / Intel',tier:'Haiku',cad:'30s',veto:false,ch:'Scores the whole universe deterministically; promotes symbols for LLM attention.'},
 {id:'S06',nm:'KB Librarian',grp:'Data / Intel',tier:'Haiku',cad:'on-demand',veto:false,ch:'Hybrid retrieval with agent-owner filters. Stay-in-lane enforced at retrieval.'},
 {id:'S07',nm:'Daily Setup Report',grp:'Data / Intel',tier:'Sonnet',cad:'08:30 ET',veto:false,ch:'The morning brief: regime, calendar, ranked setups, learning digest.'},
 {id:'S08',nm:'Market Regime',grp:'Market Context',tier:'Sonnet',cad:'10m',veto:false,ch:'Classifies regime; extreme readings outrank HTF context in the hierarchy.'},
 {id:'S09',nm:'Relative Strength',grp:'Market Context',tier:'Sonnet',cad:'10m',veto:false,ch:'RS/RW ranks vs index and sector; leader doctrine.'},
 {id:'S10',nm:'Wyckoff Campaign',grp:'Technical Court',tier:'Sonnet',cad:'per-pipeline',veto:false,ch:'Campaign/phase/events read. Never forces a schematic onto equilibrium.'},
 {id:'S11',nm:'Volume Effort/Result',grp:'Technical Court',tier:'Sonnet',cad:'per-pipeline',veto:false,ch:'Effort vs result, RVOL context, volume confirmation gate.'},
 {id:'S12',nm:'SMC Structure',grp:'Technical Court',tier:'Sonnet',cad:'per-pipeline',veto:false,ch:'HTF→LTF structure map: BOS/CHoCH, PD arrays, premium/discount.'},
 {id:'S13',nm:'Structure Mapping',grp:'Technical Court',tier:'Sonnet',cad:'per-pipeline',veto:false,ch:'Qualified-break confirmation; protected swings; ladder alignment.'},
 {id:'S14',nm:'ICT Execution',grp:'Technical Court',tier:'Sonnet',cad:'per-pipeline',veto:false,ch:'Execution model: displacement, FVG/OB entries, OTE, killzone timing.'},
 {id:'S15',nm:'Supply/Demand Mitigation',grp:'Technical Court',tier:'Sonnet',cad:'per-pipeline',veto:false,ch:'Zone freshness, mitigation decay, inversion states.'},
 {id:'S16',nm:'Indicator Support',grp:'Technical Court',tier:'Haiku',cad:'per-pipeline',veto:false,ch:'Secondary confirmations only; never originates. Context, not trigger.'},
 {id:'S17',nm:'Company Intelligence',grp:'Catalyst Court',tier:'Sonnet',cad:'daily',veto:false,ch:'Filings, ownership, insider activity, forensic flags into the ticker record.'},
 {id:'S18',nm:'News Catalyst',grp:'Catalyst Court',tier:'Sonnet',cad:'5m',veto:false,ch:'Catalysts explain moves, never override structure.'},
 {id:'S19',nm:'Earnings Event',grp:'Catalyst Court',tier:'Sonnet',cad:'daily',veto:false,ch:'Event windows, expected vs implied move, four archetypes classifier.'},
 {id:'S20',nm:'Forensic Fundamentals',grp:'Catalyst Court',tier:'Sonnet',cad:'weekly',veto:false,ch:'Accrual quality, dilution, red flags. Slow truth under fast price.'},
 {id:'S21',nm:'Social Sentiment',grp:'Catalyst Court',tier:'Haiku',cad:'15m',veto:false,ch:'Tertiary evidence. Sentiment is context, never trigger (CC-13).'},
 {id:'S22',nm:'Options Desk',grp:'Options / Instrument',tier:'Sonnet',cad:'per-pipeline',veto:true,ch:'Contract pipeline + liquidity veto. An impossible contract kills an A+ chart.'},
 {id:'S23',nm:'Options Flow',grp:'Options / Instrument',tier:'Sonnet',cad:'5m',veto:false,ch:'Sweeps/blocks as confirmation-tier evidence only.'},
 {id:'S24',nm:'Personality Router',grp:'Options / Instrument',tier:'Haiku',cad:'per-pipeline',veto:false,ch:'Routes each setup to the matching rule-set trader personality.'},
 {id:'S25',nm:'Execution Router',grp:'Execution / Mgmt',tier:'Haiku',cad:'per-order',veto:false,ch:'Limit-order policy, slippage budget, child orders. Refuses tokenless orders at code level.'},
 {id:'S26',nm:'Stop/Target 5R',grp:'Execution / Mgmt',tier:'Haiku',cad:'per-pipeline',veto:true,ch:'Deterministic 5R proof math. LAW-001/002/004 enforcing component.'},
 {id:'S27',nm:'Trade Manager',grp:'Execution / Mgmt',tier:'Sonnet',cad:'30s/pos',veto:false,ch:'Runs the approved template FSM. Tightens risk only; never widens, never adds.'},
 {id:'S28',nm:'Verification Packet',grp:'Human / Learning / Risk',tier:'Sonnet',cad:'per-pipeline',veto:false,ch:'Assembles the 19 sections. Missing anything → HUMAN_VERIFICATION_BLOCKED.'},
 {id:'S29',nm:'Journal Coach',grp:'Human / Learning / Risk',tier:'Sonnet',cad:'post-trade',veto:false,ch:'Process-graded post-mortems at decision time, not hindsight. Failure-taxonomy tags.'},
 {id:'S30',nm:'Backtest Validation',grp:'Human / Learning / Risk',tier:'Sonnet',cad:'nightly',veto:false,ch:'Replays; forces playbook rules into computable form; gates promotions.'},
 {id:'S31',nm:'Learning Suggestion',grp:'Human / Learning / Risk',tier:'Sonnet',cad:'nightly',veto:false,ch:'Mines journal + telemetry into evidence-backed config/prompt diffs. Proposes only.'},
 {id:'S32',nm:'Reporting',grp:'Human / Learning / Risk',tier:'Haiku',cad:'EOD',veto:false,ch:'EOD digest, P&L attribution, cost-of-firm accounting.'},
 {id:'S33',nm:'Portfolio Exposure',grp:'Human / Learning / Risk',tier:'Haiku',cad:'1m',veto:true,ch:'Cluster & correlation sums; feeds Risk Officer gate 6. Risk Court seat.'},
];
const SEATBY=U.by(SEATS,'id');
const SEATGROUPS=['Executive','Data / Intel','Market Context','Technical Court','Catalyst Court','Options / Instrument','Execution / Mgmt','Human / Learning / Risk'];
/* pipeline: 14 machine steps + step 15 HUMAN (hard edge, token — not a callback) */
const PIPELINE=[['S04','fresh?'],['S08','regime'],['S09','RS'],['S10','Wyckoff'],['S12','SMC map'],['S13','confirm'],['S14','ICT model'],['S11','volume'],['S18','catalyst'],['S22','contract'],['S24','router'],['S01','risk'],['S00','director'],['S28','packet']];
const HIERARCHY='Risk veto → Data → Regime (extreme) → HTF → Wyckoff → SMC/ICT → Contract → Catalyst → Sentiment';

/* ── symbols under active analysis (promoted set of the demo funnel) ── */
const SYMS=[
 {sym:'NVDA',name:'NVIDIA',px:196.74,chg:+2.31,rvol:2.3,rs:94,ivr:41,setup:'MMBM Reversal',fsm:'TRIGGERED',bias:'LONG',sector:'Semis',
  note:'Engineered sweep of Asia low into HTF discount; displacement reclaim through 196.30. First FVG return taken.',
  levels:{stop:194.10,entry:196.80,t1:199.80,t2:210.30,t3:217.05,poolAbove:'PDH 199.20 · equal highs 203.30 · 210 measured-move pool',poolBelow:'Asia low 194.30 (TAKEN 10:14)'},
  unmet:[]},
 {sym:'TSLA',name:'Tesla',px:412.66,chg:+1.12,rvol:1.7,rs:81,ivr:52,setup:'OTE Continuation',fsm:'ARMED',bias:'LONG',sector:'Autos/Tech',
  note:'Daily uptrend pullback into 62–79% OTE of the last expansion leg. 70.5% tag is the A+ level. No MSS, no trade.',
  levels:{stop:404.20,entry:409.50,t1:415.80,t2:428.90,t3:441.00,poolAbove:'Weekly high 428.90',poolBelow:'Monday low 405.10 (untaken)'},
  unmet:['Awaiting 5m MSS confirmation on close','Displacement ≥ detect.displacement_body required']},
 {sym:'AMD',name:'Adv. Micro Devices',px:171.42,chg:+0.87,rvol:1.9,rs:88,ivr:47,setup:'Breaker Retest',fsm:'FORMING',bias:'LONG',sector:'Semis',
  note:'4H breaker holding after the breakout-seller trap at 170.60. Chart is A-quality; the CONTRACT is the blocker.',
  levels:{stop:169.80,entry:171.60,t1:173.40,t2:175.20,t3:180.60,poolAbove:'175.20 relative-equal highs · 180.60 weekly pool',poolBelow:'170.60 failure trap (trapped shorts)'},
  unmet:['OPT-007: 175C spread 8.9% > 8.0% cap — desk re-runs at 11:00','§9 recertification after RVOL feed gap 10:19–10:21']},
 {sym:'META',name:'Meta Platforms',px:611.80,chg:-0.62,rvol:1.2,rs:64,ivr:38,setup:'Silver Bullet',fsm:'FORMING',bias:'SHORT',sector:'Mega-tech',
  note:'LTF distribution under PDH inside the 10:00–11:00 window — counter-regime short; paper-only precedent (PKT-2228).',
  levels:{stop:616.10,entry:612.90,t1:609.70,t2:596.90,t3:589.50,poolAbove:'PDH 614.40',poolBelow:'596.90 gap pool'},
  unmet:['Counter-regime: S08 advisory caps this at paper size']},
 {sym:'QQQ',name:'Nasdaq-100 ETF',px:529.77,chg:+0.51,rvol:1.1,rs:76,ivr:16,setup:'PD Array Rotation',fsm:'FORMING',bias:'LONG',sector:'Index',
  note:'Rotating between premium supply and discount demand of the weekly dealing range.',
  levels:{stop:524.10,entry:527.40,t1:531.00,t2:536.80,t3:541.20,poolAbove:'ATH pool 536.80',poolBelow:'527.00 CE of weekly FVG'},
  unmet:['HTF bias unresolved on 4H — needs qualified close']},
 {sym:'SPY',name:'S&P 500 ETF',px:601.24,chg:+0.44,rvol:1.0,rs:70,ivr:18,setup:'Killzone Sweep',fsm:'SCANNING',bias:'CONTEXT',sector:'Index',
  note:'Regime anchor — breadth 68% advancers, VIX 14.2 drifting lower. Not a directional idea today.',
  levels:{stop:0,entry:0,t1:0,t2:0,t3:0,poolAbove:'ATH 604.80',poolBelow:'600 round + Friday low 598.60'},
  unmet:['No sweep of an interest pool yet']},
];
const symBy=s=>SYMS.find(x=>x.sym===s);

/* ── playbooks (canon list + backtest gates) ── */
const PLAYBOOKS=[
 {nm:'MMBM Reversal',cls:'reversal',def:'Engineered sweep into HTF discount + displacement reclaim; disproven by close back inside the swept range. SMT not required for model 2.',bt:{id:'BT-0437',n:412,exp:'+1.21R',win:'34%',pf:1.9,parity:'96.4%',gate:'HOLD — live parity Δ3.6% > 3%'}},
 {nm:'OTE Continuation',cls:'continuation',def:'Weekly uptrend, daily pullback, 4H discount, 15m OTE 62–79% tag (70.5% is A+), 5m displacement trigger.',bt:{id:'BT-0442',n:388,exp:'+1.34R',win:'36%',pf:2.1,parity:'97.2%',gate:'PASS'}},
 {nm:'Breaker Retest',cls:'continuation',def:'4H breaker reclaim + retest; trapped breakout sellers fund the move.',bt:{id:'BT-0419',n:240,exp:'+0.62R',win:'31%',pf:1.4,parity:'95.2%',gate:'HOLD'}},
 {nm:'Silver Bullet',cls:'window',def:'10:00–11:00 killzone FVG with clean HTF draw above/below.',bt:{id:'BT-0428',n:196,exp:'+0.87R',win:'29%',pf:1.7,parity:'97.7%',gate:'PASS — paper→small approved 03-12'}},
 {nm:'0DTE Credit',cls:'premium',def:'Defined-risk credit structures; MOC blackout 15:45–16:00 (EVT-014 · LS-117). PROHIBITED in squeeze regime — the scenario DB is why.',bt:{id:'BT-0431',n:288,exp:'+0.44R',win:'71%',pf:1.6,parity:'98.1%',gate:'PASS'}},
 {nm:'PD Array Rotation',cls:'range',def:'Premium→discount rotation inside a defined HTF dealing range.',bt:{id:'BT-0445',n:171,exp:'+0.71R',win:'44%',pf:1.5,parity:'96.8%',gate:'PASS'}},
];

/* ── verification packets — the central decision artifact ── */
function v(seat,verdict,txt,hard){return{seat,verdict,txt,hard:hard||[]}}
const PACKETS=[
 {id:'PKT-2231',sym:'NVDA',dir:'LONG',instrument:'NVDA 21DTE 200C ×2',playbook:'MMBM Reversal',grade:'A-',gradeN:87,
  state:'READY_FOR_HUMAN',ttl:ck('packet.ttl_min')*60-260,sections:19,assembled:'10:29:41',rev:1,
  planHash:U.hash8('PKT-2231|196.80|194.10|199.80|210.30|217.05|200C21DTE|2'),
  rmath:{entry:196.80,stop:194.10,riskPer:2.70,t1:199.80,t2:210.30,t3:217.05,r1:1.11,r2:5.00,r3:7.50,fiveTarget:'T2',contracts:2,riskUSD:540,riskR:1.0,spreadPct:3.1,eventHrs:21*24,sectorPct:1.1,rr:5.0},
  freshTxt:'DATA_OK 10:29:38 ET — all 8 feeds within SLO',missing:[],
  fiveR:{why:'Target sits at untaken liquidity (equal highs → measured-move pool) inside the HTF leg.',kills:'Loss of structural stop · regime flip to risk-off extreme · contract spread blowout.',optionPath:'Delta .42→.58 into T2; theta drag −$16.8/day; IV stable regime.'},
  votes:[v('S08','pass','Regime risk-on rotation; breadth 68%; supports leader longs.'),
         v('S09','pass','RS 94th percentile vs QQQ; leader doctrine satisfied.'),
         v('S10','pass','Re-accumulation read: spring + test complete on 4H; Phase D.'),
         v('S11','pass','RVOL 2.3; sweep-candle effort confirmed by result (no absorption).'),
         v('S12','pass','Daily BOS up; discount of dealing range; DOL = PDH 199.20 → equal highs, then 210-zone measured-move pool.'),
         v('S13','pass','Qualified break: 5m MSS with displacement through 196.30.'),
         v('S14','pass','FVG 195.90–196.30 first return; OTE 62–79% overlap; NY-AM killzone.'),
         v('S15','pass','Demand zone fresh, unmitigated; no opposing supply until 199.'),
         v('S16','advisory','RSI divergence minor on 15m — context only, not trigger.'),
         v('S17','pass','No forensic flags; insider net-neutral 90d.'),
         v('S18','pass','No conflicting news; semis tape supportive.'),
         v('S19','pass','Earnings 21d out — outside risk.event_window_hrs.'),
         v('S20','pass','Accrual quality clean; no dilution overhang.'),
         v('S21','advisory','Social heat elevated (92nd percentile) — treated as tertiary (CC-13).'),
         v('S22','pass','200C 21DTE: spread 3.1% < options.max_spread_pct; OI 14.2k; delta .42.'),
         v('S23','advisory','Flow: 2 sweeps at ask in 200C today — confirmation-tier only.'),
         v('S26','pass','5R proof: T2 210.30 = 5.00R ≥ risk.min_rr (LAW-004). Stop structural 194.10.'),
         v('S33','pass','Semis cluster 1.1% < risk.max_sector_exposure; open risk 1.42R < 3.0R.'),
         v('S01','pass','Risk verdict PASS. Size 2ct = $540 = 0.9% < risk.max_trade_risk_pct.')],
  dissent:[{seat:'S21',note:'Social heat elevated — crowded-trade risk; treated as tertiary context per CC-13, not a blocker.'}],
  secs:[
   ['Trade snapshot','NVDA · LONG · options (21DTE 200C ×2) · swing class · playbook MMBM Reversal · grade A- (87) · quote 196.74 / 196.78'],
   ['Strategy classification','Model: MMBM Reversal (allowed list #2). Why: engineered sweep of Asia low into HTF discount + displacement reclaim. Disproven by: 5m close back below 195.90. Class: reversal.'],
   ['Market regime','Risk-on rotation; VIX 14.2 drifting; breadth 68% advancers. Supports thesis. No extreme reading (S08 outranked by nothing here).'],
   ['HTF structure','Weekly up (protected low 168.40) · Daily up, BOS 03-12, discount of range · 4H Phase D re-accumulation. Bias+draw defined: DOL 199.80 → 210.30 (equal highs → measured-move pool). No ladder conflict.'],
   ['LTF execution model','5m MSS 10:18 with displacement 74/100; entry model FVG first-return; trigger armed 10:26; verdict: CONFIRMED (not early, not chasing — first return).'],
   ['Liquidity map','Taken: Asia low 194.30 (sweep 10:14). Untaken: PDH 199.20, equal highs 203.30. TRAPPED SIDE: late shorts from the 194.30 sweep now underwater above 196.30 — their covering fuels leg one.'],
   ['Wyckoff read','Re-accumulation: spring (10:14) → test (10:24, lower volume) → LPS forming. Phase D. No forcing — schematic elements present.'],
   ['SMC/ICT evidence checklist','Sweep ✓ · Displacement ✓ (74) · FVG ✓ 195.90–196.30 · OB ✓ 195.40 · OTE ✓ 62–79% · Killzone ✓ NY-AM · SMT: not required for model 2.'],
   ['Volume / effort-result','RVOL 2.3. Sweep candle: high effort, closed strong = result. Test: low volume ✓. No absorption signature above.'],
   ['RS / RW','RS 94th percentile vs QQQ 20d; leader of semis complex; sector RS 88th.'],
   ['News / earnings / event risk','Earnings T-21d (outside risk.event_window_hrs). No FOMC/CPI within window. No pending litigation events. Semis tape supportive.'],
   ['Options contract quality','CHOSEN: 21DTE 200C ×2 — delta .42, spread 3.1%, OI 14.2k, vol 6.1k, IV 38 (IVR 41 < options.iv_rank_debit_max). REJECTED: 7DTE 197.5C (theta cliff pre-T2 path), 45DTE 205C (vega drag, pays for time the thesis doesn’t need), 200/210 call spread (caps T3 leg; 5R still holds but skew unfavorable).'],
   ['Entry / stop / targets / management','Entry 196.80 lim · Stop 194.10 (structural: below spring low + buffer) · T1 199.80 (25% off, stop→BE) · T2 210.30 (50% off, stop→T1) · T3 217.05 (runner, trail 5m swings). Template: 25/50/75 doctrine. Time invalidation: no T1 by 14:00 → flatten.'],
   ['Risk calculation','Risk/ct $270 ×2 = $540 = 0.9% equity < risk.max_trade_risk_pct. Open risk after: 2.42R < risk.max_open_risk_R. Day-loss headroom intact (0 of risk.max_day_loss_R used).'],
   ['Agent votes','19 voting seats: 15 pass · 3 advisory · 0 block. Conflicts named: S21 crowded-heat vs S09 leader-strength → resolved by hierarchy (sentiment is context).'],
   ['Missing / weak data','None material. ORATS surface not subscribed — IV term read from chain only (adequate for 21DTE).'],
   ['Human decision','Canonical enums only (LAW-014). APPROVE_LIVE requires 19/19 (LAW-007) + LIVE_HUMAN_APPROVED mode + fresh token — unavailable in DEMO.'],
   ['Human feedback','Agree with the MMBM read? Prefer the call spread instead? Entry earlier at OB 195.40, or is FVG-return correct?'],
   ['Learning capture','Tag for review: displacement-score threshold 60 vs 65 (LS-118 pending). Outcome will feed the sample either way.']],
  },
 {id:'PKT-2234',sym:'AMD',dir:'LONG',instrument:'AMD 14DTE 175C ×3',playbook:'Breaker Retest',grade:'B+',gradeN:78,
  state:'RISK_BLOCKED',ttl:ck('packet.ttl_min')*60-540,sections:17,assembled:'10:21:07',rev:1,
  planHash:U.hash8('PKT-2234|171.60|169.80|175C14DTE|3'),
  rmath:{entry:171.60,stop:169.80,riskPer:1.80,t1:173.40,t2:175.20,t3:180.60,r1:1.0,r2:2.0,r3:5.0,fiveTarget:'T3',contracts:3,riskUSD:540,riskR:1.0,spreadPct:8.9,eventHrs:9*24,sectorPct:1.1,rr:5.0},
  freshTxt:'DATA_OK 10:21:02 ET',missing:['§9 Volume/effort-result — RVOL feed gap 10:19–10:21','§12 Options contract quality — spread breach'],
  votes:[v('S12','pass','4H breaker holding; structure aligned.'),
         v('S14','pass','Retest entry model valid; killzone ok.'),
         v('S11','abstain','RVOL window gapped 10:19–10:21 — cannot certify effort/result.'),
         v('S22','block','175C spread 8.9% > options.max_spread_pct — liquidity veto. An impossible contract kills an A+ chart.',['OPT-007 spread 8.9% > 8.0%']),
         v('S26','pass','5R path exists at T3 = 5.0R — math passes IF the contract passes.'),
         v('S01','block','Blocked pending S22 veto + S11 abstention. No clean packet, no trade (LAW-007).',['UPSTREAM_BLOCK S22','MISSING §9'])],
  dissent:[{seat:'S14',note:'Chart-side A-quality. Recommend WAIT for spread normalization rather than reject — desk re-runs at 11:00.'}],
  secs:null},
 {id:'PKT-2228',sym:'META',dir:'SHORT',instrument:'META 10DTE 605P ×1',playbook:'Silver Bullet',grade:'B',gradeN:74,
  state:'APPROVED_PAPER',decision:'APPROVE_PAPER_ONLY',decidedAt:'10:07:12',ttl:0,sections:19,assembled:'09:58:20',rev:1,tokenId:'TKN-8841',
  planHash:U.hash8('PKT-2228|612.90|616.10|605P10DTE|1'),
  rmath:{entry:612.90,stop:616.10,riskPer:3.20,t1:609.70,t2:596.90,t3:589.50,r1:1.0,r2:5.0,r3:7.3,fiveTarget:'T2',contracts:1,riskUSD:320,riskR:0.6,spreadPct:4.2,eventHrs:600,sectorPct:0.4,rr:5.0,counterRegime:true},
  freshTxt:'DATA_OK 09:58 ET',missing:[],
  votes:[v('S12','pass','LTF distribution under PDH.'),v('S14','pass','Silver Bullet window entry valid.'),
         v('S08','advisory','Regime risk-on — counter-regime short; size discipline advised.'),
         v('S26','pass','5R at T2 596.90.'),v('S01','pass','Pass with counter-regime note → paper recommended.')],
  dissent:[{seat:'S08',note:'Counter-regime short in risk-on tape — paper-only recommended, and that is what the human chose.'}],
  secs:null},
];
const pktBy=id=>PACKETS.find(p=>p.id===id);

/* ── positions (plan-driven; management FSM; envelope law) ── */
const POSITIONS=[
 {id:'TRD-0912',sym:'NVDA',dir:'LONG',instrument:'21DTE 200C ×2',mode:'PAPER',fsm:'MANAGING',stage:'25% next',
  entryPlan:196.80,entryAct:196.83,stop:194.10,t1:199.80,t2:210.30,t3:217.05,uR:+0.62,dev:12,
  nextAction:'T1 199.80 → take 25%, stop→BE',packet:'PKT-2231',thesis:'INTACT',inval:'5m close < 195.90',timeStop:'No T1 by 14:00 → flatten',
  greeks:{delta:.42,theta:-8.4,vega:12.1,iv:38},cnote:'theta −$16.8/day ×2 · IV stable · spread 3.0%'},
 {id:'TRD-0907',sym:'SPY',dir:'SHORT',instrument:'0DTE 601P credit spread ×4',mode:'PAPER',fsm:'MANAGING',stage:'50% done',
  entryPlan:1.42,entryAct:1.40,stop:2.10,t1:0.95,t2:0.55,t3:0.20,uR:+1.15,dev:4,
  nextAction:'T2 0.55 → close half of remainder',packet:'PKT-2219',thesis:'INTACT',inval:'Break of 602.40 with breadth thrust',timeStop:'MOC risk window 15:45 per playbook (EVT-014)',
  greeks:{delta:-.18,theta:+22.0,vega:-4.2,iv:14},cnote:'credit decays for us · pin risk at 601 into close'},
 {id:'TRD-0899',sym:'META',dir:'SHORT',instrument:'10DTE 605P ×1',mode:'PAPER',fsm:'WORKING',stage:'0%',
  entryPlan:612.90,entryAct:null,stop:616.10,t1:609.70,t2:596.90,t3:589.50,uR:0,dev:0,
  nextAction:'Working limit 612.90 — unfilled 34m · time-cancel 11:30',packet:'PKT-2228',thesis:'PENDING FILL',inval:'5m close > 614.40',timeStop:'Cancel 11:30 unless amendment approved',
  greeks:{delta:-.38,theta:-6.1,vega:8.8,iv:38},cnote:'paper-only approval TKN-8841'},
];
const CLOSED_POSITIONS=[
 {id:'TRD-0894',sym:'TSLA',dir:'LONG',instrument:'21DTE 245C ×2',fsm:'AUDITED',res:'+5.4R',note:'Journaled JRN-0912 · slippage −0.4bps vs plan · 25/50/75 executed to template'},
];
const ENVELOPE=['Tighten risk — allowed','Take profits — allowed','Flatten early — allowed','Widen stop — FORBIDDEN','Add to a loser — FORBIDDEN','Extend horizon (scalp→swing) — FORBIDDEN (LAW-016)','Anything outside envelope → amendment mini-packet through the same token gate'];
const AMENDMENTS=[
 {id:'AMD-114',trd:'TRD-0899',from:'S27 Trade Manager',ask:'Extend time-cancel 11:30 → 12:30 (unfilled limit; structure intact)',why:'OUTSIDE envelope — time extension requires human token (envelope law). The FSM cannot self-authorize.',st:'PENDING'},
];

/* ── orders & fills (paper fill model v2.1 — spread/queue/slippage aware) ── */
const ORDERS=[
 {id:'ORD-3341',t:'10:31:02',sym:'NVDA',side:'BUY',what:'200C 21DTE ×2 LMT',state:'FILLED',fill:'2/2 @ mid+$0.02 · slippage $4.00 · 1.8s · fill model v2.1',link:'TRD-0912'},
 {id:'ORD-3338',t:'09:41:17',sym:'SPY',side:'SELL',what:'601/599P 0DTE ×4 LMT 1.42 cr',state:'FILLED',fill:'4/4 @ 1.40 · slippage $8.00 · 6.2s',link:'TRD-0907'},
 {id:'ORD-3340',t:'09:56:44',sym:'META',side:'BUY',what:'605P 10DTE ×1 LMT 612.90(u)',state:'WORKING',fill:'0/1 — resting at limit · time-cancel 11:30',link:'TRD-0899'},
 {id:'ORD-3327',t:'09:33:50',sym:'COIN',side:'—',what:'(no order) packet rejected pre-order',state:'CANCELED',fill:'REJECT_BAD_TRADE · CHASING — limit discipline, no chase',link:'PKT-2226'},
];

/* ── journal — every decision, taken AND rejected (LAW-018) ── */
const JOURNAL=[
 {t:'10:07',id:'PKT-2228',sym:'META',kind:'DECISION',what:'APPROVE_PAPER_ONLY · counter-regime short honored at paper size',grade:'B',outcome:'open — working',lesson:'Counter-regime discipline: the paper tier is the pressure valve.'},
 {t:'09:52',id:'PKT-2226',sym:'COIN',kind:'REJECTED',what:'REJECT_BAD_TRADE · CHASING — 4th 5m candle past displacement, no first-return',grade:'C+',outcome:'would-be −1.0R ✓ correct rejection',lesson:'The chasing filter earned its keep. Entry model exists for a reason.'},
 {t:'09:47',id:'PKT-2225',sym:'TSLA',kind:'REJECTED',what:'REJECT_NEEDS_MORE_DATA · flow feed degraded 3m',grade:'B',outcome:'would-be +2.1R ✗ missed winner',lesson:'AUTOPSY AUT-118: freshness gate correct by law; feed redundancy is the real fix (INF-021).'},
 {t:'Fri',id:'PKT-2214',sym:'NVDA',kind:'DECISION',what:'APPROVE_PAPER_ONLY · MMBM long',grade:'A-',outcome:'+5.2R closed',lesson:'T2 doctrine held through midday chop — trail rules validated.'},
 {t:'Fri',id:'PKT-2211',sym:'AAPL',kind:'REJECTED',what:'REJECT_BAD_TRADE · NO_5R — best structural path 3.1R',grade:'B-',outcome:'ran 2.8R ✓ correct rejection',lesson:'The 5R filter rejected a "winner" that never met the bar — the system working, not failing.'},
 {t:'Thu',id:'TRD-0894',sym:'TSLA',kind:'CLOSED',what:'25/50/75 executed to template · runner trailed out',grade:'A',outcome:'+5.4R',lesson:'Process grade A independent of outcome. Slippage −0.4bps.'},
];

/* ── opportunity autopsy — every rejection tracked to its counterfactual ── */
const AUTOPSIES=[
 {id:'AUT-118',sym:'TSLA',date:'Today 09:47',cls:'MISSED_WINNER',outcome:'+2.1R counterfactual',gap:'DATA GAP',
  verdictLine:'Rejection PROCESS-CORRECT (LAW-006) · OUTCOME-NEGATIVE.',
  finding:'Options-flow feed degraded for 3 minutes exactly as PKT-2225 assembled. The freshness gate blocked approval — correctly. The miss is an infrastructure gap, not a judgment gap.',
  fix:'INF-021: dual flow provider + per-dependency degrade (flow is confirmation-tier; packet could proceed with flow marked ADVISORY-ABSENT).',status:'FIX PROPOSED → Learning Court'},
 {id:'AUT-117',sym:'AMD',date:'Yesterday',cls:'REJECTED_THEN_RAN',outcome:'+3.4R counterfactual',gap:'RULE GAP',
  verdictLine:'Rejection PROCESS-CORRECT (OPT-007) · rule still improvable.',
  finding:'Spread was 8.6% at decision time; normalized to 4% within 20 minutes. The thesis played out fully. The desk lost the trade to contract quality, not chart quality.',
  fix:'LS-121: WAIT_FOR_SPREAD packet state with auto re-run when the ONLY blocker is OPT-007 and structure remains valid.',status:'A/B IN PAPER (14/30 samples)'},
 {id:'AUT-116',sym:'COIN',date:'T-2d',cls:'REJECTED_THEN_RAN',outcome:'+5.7R counterfactual',gap:'RULE GAP',
  verdictLine:'Third-touch rule rejected a runner — test an exception, do not delete the rule.',
  finding:'Setup rejected on third-touch degradation; a fresh catalyst reset the zone quality and it ran +5.7R. The rule is right on average and wrong here.',
  fix:'Test a catalyst-reset exception for zone freshness; keep third-touch doctrine intact.',status:'EVIDENCE GATHERING'},
 {id:'AUT-115',sym:'META',date:'T-3d',cls:'EXPIRED_UNJUDGED',outcome:'A-grade trigger fired post-expiry',gap:'WORKFLOW GAP',
  verdictLine:'Packet TTL correct; workflow lost a valid plan.',
  finding:'The A-grade trigger arrived 7 minutes after packet expiry. Same plan-hash, fresh trigger — but the desk had to rebuild from scratch and missed the window.',
  fix:'Auto-reopen an expired packet when the same plan hash receives a fresh trigger inside 60m.',status:'FIX PROPOSED → Learning Court'},
 {id:'AUT-114',sym:'NVDA',date:'T-3d',cls:'GOOD_MISS',outcome:'−2.2R avoided',gap:'NONE',
  verdictLine:'Rejection PROCESS-CORRECT · OUTCOME-POSITIVE.',
  finding:'Graded A- but S13 flagged the "sweep" as a mid-range raid with no trapped side (LAW-003). Price broke the would-be stop within 40 minutes.',
  fix:'None. Archived to the golden set — the trapped-counterparty law IS the edge.',status:'ARCHIVED · GOLDEN SET'},
 {id:'AUT-113',sym:'TSLA',date:'T-4d',cls:'APPROVED_AND_FAILED',outcome:'−1.0R realized',gap:'DATA WEIGHT',
  verdictLine:'The −1R stop worked. Do not widen the stop.',
  finding:'Approved trade failed on a headline the desk had down-weighted. Loss was formulaic and contained — process intact, source-credibility weighting improvable.',
  fix:'Increase source-credibility weighting for tier-1 wires in S18. Stop doctrine unchanged.',status:'APPLIED v13.2'},
];
const SHADOW_STATS={passRate:'71%',note:'A desk that passes correctly ~70%+ of the time is protecting capital, not missing edge. Every pass is shadow-tracked to its counterfactual (V2 archive doctrine).'};

/* ── learning court — governed rule-change pipeline (LAW-013) ── */
const COURT=[
 {id:'LS-118',title:'Raise displacement promotion threshold 60 → 65',from:'S31 Learning Suggestion',stage:'IN REVIEW',
  evidence:'41-trade sample: border band (60–65) expectancy +0.34R vs +1.12R above 65. Border trades drag the book.',
  diff:'detect.displacement_body: promote-at 60 → 65',risk:'Reduces candidate count ~9% — regime-split validation pending',needs:'Regime-split (trend vs chop) before deploy'},
 {id:'LS-121',title:'Add WAIT_FOR_SPREAD packet state',from:'S32 via AUT-117',stage:'A/B PAPER',
  evidence:'6 weeks: 11 packets terminally rejected on OPT-007 alone; 7 normalized within 30m; 5 hit T1+. EV ≈ +0.31R/occurrence.',
  diff:'packet.states += WAIT_FOR_SPREAD (ttl 45m, auto re-run when spread < cap)',risk:'Low — paper-observable, human gate unchanged',needs:'30 paper samples (14/30)'},
 {id:'LS-117',title:'MOC blackout 15:45–16:00 for 0DTE credit',from:'S30 Backtest Validation',stage:'APPROVED · v13.2',
  evidence:'6 of 7 losing 0DTE trades held through the MOC imbalance window.',
  diff:'playbook.zerodte_credit.blackout += ["15:45-16:00"] (EVT-014)',risk:'None — pure restriction',needs:'—'},
 {id:'LS-112',title:'Lower min RR to 4R for Silver Bullet',from:'S31 Learning Suggestion',stage:'REJECTED BY GOVERNANCE',
  evidence:'Insufficient — below evidence bar (GOV-030 min n=30).',
  diff:'risk.min_rr: 5.0 → 4.0 (scoped)',risk:'CONSTITUTIONAL VIOLATION — LAW-004 is locked. The 5R floor is not a parameter.',needs:'Nothing. Rejected-store visible by design (anti-nag).'},
 {id:'INF-021',title:'Redundant options-flow provider',from:'S32 via AUT-118',stage:'PROPOSED',
  evidence:'One missed +2.1R winner traced to a single-provider flow gap. Flow is confirmation-tier — absence should degrade, not block.',
  diff:'data.flow: single → dual provider; per-dependency degrade policy',risk:'Cost +$75/mo · moderate complexity',needs:'Owner approval + budget'},
];
const HUMAN_LESSONS=[
 {id:'HUM-118',rule:'Equal highs need 2+ touches within 0.15×ATR to count as a pool',effect:'+0.21R (n=34)'},
 {id:'HUM-117',rule:'No MMBM entries when VIX term structure inverts — regime overrides pattern',effect:'Blocked 6 setups · 5 would have lost'},
 {id:'HUM-119',rule:'A sweep must close back inside the range within 3 bars or it is a breakout',effect:'In A/B cohort'},
];

/* ── review metrics (process vs outcome, calibration, failure taxonomy) ── */
const CONFUSION={tp:{n:12,ex:'NVDA-041 +6.2R'},fp:{n:4,ex:'AAPL-048 — stale ranking not invalidated'},tn:{n:47,ex:'today’s early rejects'},fn:{n:3,ex:'TSLA AUT-118 +2.1R missed'},avoided:'−1.8R avoided',missed:'+10.6R counterfactual only'};
const ROOTCAUSE=[['Rule gap',31],['Workflow gap',27],['Execution gap',24],['Data gap',18]];
const PARETO=[['Late entry / chasing',31],['News misclassification',22],['Grade inflation (catalyst)',19],['Premature exit',14],['Stale-data abstain',9],['Contract mis-fit',7],['Other',6]];
const CALIB=[[95,88],[85,79],[75,71],[65,58],[55,54],[45,41],[35,33]];
const EXPECT=[['MMBM Reversal',18,'33%','+1.21R'],['OTE Continuation',22,'36%','+1.34R'],['Silver Bullet',14,'29%','+0.87R'],['0DTE Credit',31,'71%','+0.44R'],['Breaker Retest',16,'31%','+0.62R']];
const REVIEW_REFUSALS=['Do not reward luck','Do not punish disciplined losses','Do not delete selectivity','Change one variable at a time'];

/* ── scenario engine (long-term memory) ── */
const SCENARIO={rows:'1,284,770',note:'Nightly batch replays playbook × regime × session × IVR permutations. Narrowing 1.28M scenarios → a handful of plays is the product.',
 grid:[['','Risk-on','Rotation','Risk-off','Squeeze'],
  ['OTE Continuation','+1.61R','+1.12R','+0.22R','−0.08R'],
  ['MMBM Reversal','+1.21R','+1.02R','+0.41R','+0.18R'],
  ['Silver Bullet','+0.87R','+0.71R','+0.32R','+0.11R'],
  ['0DTE Credit','+0.51R','+0.44R','+0.12R','−0.38R'],
  ['Breaker Retest','+0.62R','+0.55R','+0.19R','+0.02R']],
 ban:'Red cell (0DTE Credit × Squeeze −0.38R) is a standing prohibition — the DB is why.'};

/* ── compounding program (ring-fenced program cohort account) ── */
const STAGES=[
 {s:'S1',span:'$1k → $2.5k',risk:'1.0% · 1ct',need:'n≥20 · exp≥+0.8R · DD≤12%',gate:'parity <5% on active playbooks'},
 {s:'S2',span:'$2.5k → $6k',risk:'1.0% · 2ct',need:'n≥25 · +0.9R · DD≤14%',gate:'0 discipline breaches'},
 {s:'S3',span:'$6k → $15k',risk:'0.9% · 3ct',need:'n≥30 · +1.0R · DD≤15%',gate:'2 playbooks fully promoted'},
 {s:'S4',span:'$15k → $35k',risk:'0.9% · 4ct',need:'n≥35 · +1.0R · DD≤15%',gate:'slippage ≤3bps sustained'},
 {s:'S5',span:'$35k → $70k',risk:'0.8% · 6ct',need:'n≥40 · +1.0R · DD≤12%',gate:'multi-cluster correlation caps proven'},
 {s:'S6',span:'$70k → $100k',risk:'0.7% · 8ct',need:'n≥40 · +1.0R · DD≤10%',gate:'graduation review — human sign-off'},
];
const PROGRAM={equity:8420,stage:'S3',started:'2026-01-12',exp:'+1.04R blended (n=106)',dd:'−8.9% (ceiling 15% → auto-demote to S2 sizing)',
 promo:'S2→S3 promotion 03-02 after 31 trades · +1.12R · maxDD 9.4%. Demotion is a feature — the program never argues with the ledger.'};

/* ── autonomy lab (paper-only, LAW-008; feature-flagged) ── */
const PERSONAS=[
 {id:'scalper',ico:'⚡',nm:'Scalper',horizon:'2 min – 1 hr',risk:'0.4%/trade · max 3 open',target:'1.5–2.5R',dte:'0DTE',sessions:'KZ-AM · KZ-PM',n:342,eq:34200,win:'64%',
  doctrine:'Surgical high-frequency. Theta is the enemy — edge is volume of clean setups, not size.',books:['Micro-FVG Reclaim','Liquidity Sweep','1m MSS Break','Momentum Ignition']},
 {id:'day',ico:'☀',nm:'Day Trader',horizon:'30 min – close',risk:'0.7%/trade · max 2 open',target:'3–5R',dte:'0–2 DTE',sessions:'OPEN · KZ-AM · KZ-PM',n:128,eq:52600,win:'54%',
  doctrine:'One clean thesis at a time, flat by the close.',books:['OTE Continuation','Breaker Retest','Silver Bullet','MMBM Reversal']},
 {id:'swing',ico:'🌙',nm:'Swing Trader',horizon:'days – months',risk:'0.9%/trade · max 4 open',target:'5–12R',dte:'14–45 DTE',sessions:'any',n:47,eq:41800,win:'41%',
  doctrine:'Patient, big-R. The compounding engine leans on this book.',books:['HTF OTE','Weekly Breaker','Accumulation Phase D','Monthly Continuation']},
];
const FRONTIER=[['Scalper 0DTE debit','64%','+75%','−44%','+31%/trade','USED'],['Day-trader structural','54%','+123%','−54%','+50%/trade','USED'],['Swing HTF debit','41%','+203%','−72%','+55%/trade','USED'],['Premium-selling credit','89%','+22%','−215%','+9%/trade','NOT USED'],['Far-OTM condors','93%','+14%','−310%','+4%/trade','NOT USED — one −310% tail erases ~22 winners']];

/* ── scanner funnel (deterministic stages; LLM only after promotion) ── */
const FUNNEL=[
 {k:'UNIVERSE HEARTBEAT',v:5234,pct:'100%',d:'US-listed · cheap deterministic pass, every symbol, every minute'},
 {k:'ELIGIBILITY / LIQUIDITY',v:2840,pct:'54.3%',d:'Optionable, ADV, spread, data-quality gates'},
 {k:'ANOMALY / EVENT',v:312,pct:'5.96%',d:'RVOL z-spike · gap · level break · sweep signature'},
 {k:'SETUP HYPOTHESES',v:64,pct:'1.22%',d:'Named playbook structure forming'},
 {k:'COMMITTEE REVIEW',v:14,pct:'0.27%',d:'Bounded LLM fan-out ≤ '+ck('agents.committee_max_fanout')+' seats'},
 {k:'RISK-VALID PLANS',v:5,pct:'0.10%',d:'5R proof + exposure + event window clear'},
 {k:'HUMAN PACKETS',v:3,pct:'0.057%',d:'PKT-2231 live in queue · 2 decided'},
];
const REJECT_ECON=[['No liquid options market',1884,'36.0%'],['No anomaly / event',1926,'36.8%'],['No playbook structure',248,'4.7%'],['No realistic 5R',29,'0.6%'],['Contract spread / IV',15,'0.3%'],['Event / data block',9,'0.2%'],['Correlation / capacity',5,'0.1%'],['Packet incomplete / TTL',2,'0.04%']];
const SCANROWS=[
 {sym:'NVDA',stage:'PACKET',why:'Sweep → displacement → FVG first-return · RS 94 · committee 15p/3a/0b',fsm:'TRIGGERED'},
 {sym:'TSLA',stage:'ARMED',why:'70.5% OTE tagged · awaiting 5m MSS on close (hard gate)',fsm:'ARMED'},
 {sym:'AMD',stage:'COMMITTEE',why:'Breaker holds · BLOCKED: OPT-007 spread 8.9% — re-run 11:00',fsm:'FORMING'},
 {sym:'QQQ',stage:'HYPOTHESIS',why:'PD rotation forming · HTF bias unresolved on 4H',fsm:'FORMING'},
 {sym:'META',stage:'HYPOTHESIS',why:'Silver Bullet window · counter-regime — paper ceiling',fsm:'FORMING'},
 {sym:'MSFT',stage:'ANOMALY',why:'Daily BOS but mid-range — no draw on liquidity (LAW-002)',fsm:'CANDIDATE'},
 {sym:'AVGO',stage:'ANOMALY',why:'Equal-highs magnet 1290 · needs sweep-side confirmation',fsm:'CANDIDATE'},
 {sym:'COIN',stage:'REJECTED',why:'CHASING — 4 candles past displacement (PKT-2226 rejected 09:52)',fsm:'SCANNING'},
 {sym:'GOOG',stage:'ELIGIBILITY',why:'RS 47th percentile — laggard in a leader tape',fsm:'SCANNING'},
];

/* ── market tape / regime ── */
const TAPE=[['ES',6123.50,+0.31],['NQ',22184.2,+0.44],['VIX',14.21,-2.1],['DXY',103.12,-0.08],['US10Y',4.183,+0.2],['CL',71.24,-0.5],['GC',2712.4,+0.3]];
const REGIME={label:'RISK-ON ROTATION',breadth:'68% advancers',vix:'14.2 drifting lower',posture:'Long leaders in leading sectors; counter-regime shorts capped at paper.',
 supports:['Leader longs (NVDA, semis complex)','Index continuation structures'],cautions:['Crowded-heat names (S21 92nd pctile on NVDA)','Counter-regime shorts — paper tier only']};

/* ── calendar / events ── */
const EVENTS=[
 {t:'Today 14:00',what:'FOMC minutes',cls:'MACRO',impact:'Index vol event — time-stop all scalps 13:45',block:false},
 {t:'T+2d 08:30',what:'CPI print',cls:'MACRO',impact:'risk.event_window_hrs blackout arms T+1d 08:30 for index-correlated size (LAW-017)',block:true},
 {t:'T+9d AMC',what:'AMD earnings',cls:'EARNINGS',impact:'14DTE contract crosses the event — S22 flags DTE/event conflict at T+7d',block:false},
 {t:'T+21d AMC',what:'NVDA earnings',cls:'EARNINGS',impact:'Outside window — swing eligible until T-1d',block:false},
];

/* ── alerts ── */
const ALERTS=[];
function pushAlert(cls,msg,route,arg){ALERTS.unshift({cls,msg,route:route||null,arg:arg||null,t:CLOCK.hm(),ackd:false});if(ALERTS.length>80)ALERTS.pop()}
pushAlert('P2','Daily brief ready — regime: risk-on rotation · 2 setups A-class','markets.regime');
pushAlert('P1','PKT-2231 NVDA LONG · grade A- · TTL '+ck('packet.ttl_min')+'m — awaiting your decision','decisions.packet','PKT-2231');
pushAlert('P2','TSLA OTE Continuation ARMED — waiting on 5m MSS','markets.watch');
pushAlert('P2','AMD packet RISK_BLOCKED — OPT-007 spread veto · desk re-runs 11:00','decisions.packet','PKT-2234');
pushAlert('P3','Universe cycle 21.4s (budget '+ck('scan.universe_cycle_s')+'s) · 5,234 symbols',null);

/* ── seed audit ledger ── */
[['S04 Data Orchestrator','feed','Quote freshness sweep — 8/8 feeds within SLO (slo.feed_quote_ms)'],
 ['S05 Universe Scanner','scan','Universe cycle 21.4s — promoted: NVDA TSLA AMD (3 of 5,234)'],
 ['S08 Market Regime','vote','Regime: risk-on rotation, breadth 68% — supports longs in leaders'],
 ['S12 SMC Structure','vote','NVDA HTF bullish — daily BOS, PD discount, DOL = PDH 199.20'],
 ['S13 Structure Mapping','vote','NVDA qualified break — 5m MSS with displacement through 196.30'],
 ['S14 ICT Execution','vote','NVDA displacement 74/100 + FVG 195.90–196.30 first return'],
 ['S11 Volume Effort/Result','vote','NVDA RVOL 2.3 — effort confirmed by result on sweep candle'],
 ['S22 Options Desk','vote','NVDA 200C 21DTE chosen — spread 3.1% < options.max_spread_pct'],
 ['S26 Stop/Target 5R','gate','5R proof: T2 210.30 = 5.00R ≥ risk.min_rr — PASS (LAW-004)'],
 ['S33 Portfolio Exposure','gate','Semis cluster 1.1% < 2.5% — clear'],
 ['S01 Risk Officer','gate','Risk verdict PASS — 2ct · $540 · day-loss headroom 2.0R intact'],
 ['S28 Verification Packet','packet','PKT-2231 assembled 19/19 — queued for human (LAW-007)'],
 ['S22 Options Desk','gate','AMD 175C spread 8.9% > 8.0% — VETO (OPT-007). Packet blocked.'],
].forEach(r=>SVR.audit(r[0],r[1],r[2]));

/* ── feeds / integrations health (demo twins of the target vendor set) ── */
const FEEDS=[
 {nm:'Equities quotes/bars',prov:'Polygon Advanced — demo twin',slo:ck('slo.feed_quote_ms')+'ms',age:0.42,st:'OK',cost:'$199/mo'},
 {nm:'Options chains/Greeks',prov:'ThetaData — demo twin',slo:ck('slo.feed_chain_ms')+'ms',age:0.66,st:'OK',cost:'$120/mo'},
 {nm:'Options flow',prov:'Unusual Whales — demo twin',slo:'5s',age:2.1,st:'OK',cost:'$75/mo',note:'Single provider — INF-021 proposes redundancy'},
 {nm:'News / catalysts',prov:'Benzinga — demo twin',slo:'30s',age:4.8,st:'OK',cost:'$110/mo'},
 {nm:'Earnings calendar',prov:'Finnhub — demo twin',slo:'daily',age:0,st:'OK',cost:'$0'},
 {nm:'Filings',prov:'EDGAR sec-api — demo twin',slo:'5m',age:31,st:'OK',cost:'$49/mo'},
 {nm:'Broker · paper',prov:'Tradier sandbox — demo twin',slo:'2s recon',age:0.9,st:'OK',cost:'$0',note:'Fill model v2.1 — spread/queue/slippage aware'},
 {nm:'Broker · live',prov:'NOT CONFIGURED',slo:'—',age:null,st:'OFF',note:'Live adapter disabled by default until Phase 8 gates pass'},
 {nm:'LLM runtime',prov:'Claude tier-router — demo twin',slo:'p95 6s',age:1.8,st:'OK',cost:'≈$41/day tiered+cached',note:'Opus judgment · Sonnet desks · Haiku scans'},
];

/* ── token doctrine (rendered in Decisions → Risk Proof) ── */
const TOKEN_DOCTRINE={claims:{trade_id:'RUN-NVDA-1042',plan_hash:'sha256:79e2…18af',user:'principal:owner',mode:'live_human_gated',limits:'{size:2, max_price:4.82, stop:194.10}',iat:'10:14:04 ET',exp:'10:16:04 ET (+120s)',nonce:'one-time-use'},
 preflight:['Signature + expiry valid','Exact plan hash — entry, stop, targets, instrument, size cannot drift','Kill switch clear','Data fresh per dependency','risk_mode permits','5R remains honest at current quote','Spread / slippage inside tolerance','Exposure still clear','Event window clear (LAW-017)','Broker capability confirmed'],
 rule:'NO TOKEN · NO ORDER · NO ADMIN BYPASS'};
