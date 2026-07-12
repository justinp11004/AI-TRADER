/* ═══════════ V14 · KNOWLEDGE ESTATE — deepening wraps, zero new workspaces ═══════════
   This module registers NOTHING. It deepens ten existing workspaces additively
   with the desk's accumulated estate: the deterministic detector registry, the
   playbook FSM mirror, Wyckoff's nine tests + cause arithmetic, the greeks/DTE
   doctrine, the event blackout engine, alert-fatigue economics, replay
   discipline, decided case law, queue triage doctrine, and the operating loop.
   Prefix: CMD est.* · globals EST_*. Wrap pattern only — old view + estate. */

const EST_W=(key,extra)=>{const old=VIEWS[key];if(!old)return;VIEWS[key]=function(a){return old(a)+extra(a)}};

/* ═══════════ 1 · DETECTOR REGISTRY — the deterministic estate ═══════════
   Every promotion, FSM transition, and veto in this desk traces to one of
   these detectors. They are cheap, boring, and testable — which is the point:
   the raw universe gets ZERO model calls; these run on all 5,234 symbols. */
const EST_DETS=[
 /* ── Liquidity family ── */
 {id:'DET-001',nm:'Equal highs/lows pool',fam:'Liquidity',
  inputs:'swing H/L series 15m–4H · ATR(14)',
  thr:'2+ touches within 0.15×ATR of each other (HUM-118)',ckKey:null,
  emits:'pool object → pool state machine · PB-01/PB-02 draw targets · DET-011 input',
  fp:'round-number chop mints fake pools out of noise',
  guard:'a pool arms a setup only with a named trapped side (LAW-003)',
  def:'Two or more swing extremes at effectively the same price are resting-order liquidity: stops '+
    'above equal highs, stops below equal lows. The desk treats the level as a magnet, not a wall.',
  math:'cluster(H_i) where |H_i − H_j| ≤ 0.15 × ATR14, i≠j, touches ≥ 2 → '+
    'pool{price=mean(H_i), side, touches, born_at}',
  fails:[['Round-number clusters read as engineered pools','tolerance scales in basis points, and DET-009-style 00-level proximity downweights the score'],
         ['Pool counted after it was already swept on a lower timeframe','pool state machine — swept pools are SPENT forever, never re-armed (see research.structure)']],
  seats:'S12 SMC Structure · S13 Structure Mapping',feeds:'PB-01 · PB-02 · DET-011',
  now:()=>{const s=symBy(S.sym);return s?S.sym+' pools — above: '+(s.levels.poolAbove||'none named')+
    ' · below: '+(s.levels.poolBelow||'none named'):null}},
 {id:'DET-004',nm:'Session high/low',fam:'Liquidity',
  inputs:'session boundary clock (Asia / London / NY) · session H/L',
  thr:'prior-session extreme untouched at NY open registers as a candidate pool',ckKey:null,
  emits:'sweep candidates → PB-02 stage 1 · the Asia-low object the NVDA packet cites',
  fp:'holiday and half-day sessions mint thin, meaningless extremes',
  guard:'session must carry ≥ 60% of median session volume to register at all',
  def:'Session extremes are the most reliably attacked liquidity on the clock: Asia range for the '+
    'London raid, London extremes for the NY raid. The 194.30 '+
    'Asia low that funded PKT-2231 was this detector firing.',
  math:'per session s ∈ {ASIA, LDN, NY}: pool = extreme(s) if untouched(t > close(s)) ∧ '+
    'vol(s) ≥ 0.6 × median20(vol(s))',
  fails:[['DST transitions shift session windows and mislabel the extreme','session table keyed to exchange calendar, never to wall-clock offsets'],
         ['Overnight gap opens beyond the extreme — pool "taken" without a sweep','gap-through pools are marked CONSUMED_BY_GAP: no trapped side, no PB-02 candidacy']],
  seats:'S12 · S14 ICT Execution',feeds:'PB-02 · DET-011',
  now:()=>'clock now: '+CLOCK.phase()+(CLOCK.killzone()?' · '+CLOCK.killzone():'')+' · NVDA Asia low 194.30 = TAKEN 10:14'},
 {id:'DET-007',nm:'Trendline liquidity',fam:'Liquidity',
  inputs:'3+ touch diagonals on 1H / 4H / D',
  thr:'≥ 3 touches · linear fit R² ≥ 0.93 · slope within ±45° render range',ckKey:null,
  emits:'diagonal stop-cluster estimate → DET-011 · raid candidates when a crowded line breaks',
  fp:'every operator’s hand-drawn line is treated as real liquidity — most are private fictions',
  guard:'only diagonals visible on the timeframes OTHER traders actually chart (1H/4H/D) '+
    'count; 5m diagonals are noise by decree',
  def:'A clean multi-touch trendline is a stop factory: every touch adds trailing stops '+
    'just beneath it. The desk does not trade the '+
    'line — it trades the raid THROUGH the line and the failure after.',
  math:'fit y=mx+b over pivot set P, |P| ≥ 3; accept if R² ≥ 0.93; cluster_est = Σ '+
    'stops(P_i) modeled at 1.2 × touch count',
  fails:[['Curve-fit diagonals redrawn until they "work"','pivots are machine-selected fractals — the detector never sees a human-drawn line'],
         ['Steep lines (>45°) break constantly and mean nothing','slope window rejects them; steep trend = use structure ladder instead']],
  seats:'S13 · S12',feeds:'DET-011 · PB-03'},
 {id:'DET-009',nm:'Round-number magnet',fam:'Liquidity',
  inputs:'distance from price to 00 / 50 levels · ADR(20)',
  thr:'within 0.25×ADR of a 00 level — tolerance scales in basis points, never dollars',ckKey:null,
  emits:'context weight into pool scoring (DET-001 downweight) · psychological-level annotations',
  fp:'on high-priced names EVERYTHING is “near” a round number — dollar tolerance is the lie',
  guard:'basis-point scaling plus context-only typing: this detector may weight, never trigger',
  def:'Round numbers collect resting orders because humans think in them — real, but weak, liquidity. '+
    'Its main job is defensive: keeping DET-001 from crowning a psychological cluster as an engineered pool.',
  math:'magnet iff |px − nearest00| ≤ 0.25 × ADR20; weight = 1 − dist/(0.25×ADR); emitted as context, typed WEIGHT',
  fails:[['Treating the magnet as support/resistance in its own right','typed WEIGHT — no playbook may cite DET-009 as a level; it only adjusts other scores'],
         ['Dollar-based tolerance breaking on a $600 name vs a $20 name','ADR-relative scaling is the entire fix — 0.25×ADR means the same thing at every price']],
  seats:'S12 · S16 Indicator Support',feeds:'DET-001 score adjustment · SPY 600-round note in the watch data'},
 {id:'DET-011',nm:'Stop-cluster estimator',fam:'Liquidity',
  inputs:'pools from DET-001/004/007 · protected swing registry',
  thr:'cluster score ≥ 70/100 — 2+ independent pool sources agree within 0.2×ATR',ckKey:null,
  emits:'THE draw-on-liquidity object every packet must name (LAW-002)',
  fp:'symmetric clusters on both sides of price carry zero directional information',
  guard:'requires side imbalance ≥ 1.6:1 before it will arm a directional bias',
  def:'The composite answer to "where would price go if it went looking for fuel?" — every '+
    'verification packet cites its output in §6 Liquidity map. No cluster, no draw, no trade (LAW-002).',
  math:'score = 40·sources_agree + 30·recency_decay + 30·untouched; bias armed iff score ≥ 70 ∧ side_ratio ≥ 1.6',
  fails:[['Both-sides clusters produce confident nonsense','imbalance gate — symmetric books emit NO_DRAW, an honest null'],
         ['Stale clusters from last week outrank fresh ones','recency decay halves weight every 5 sessions untested']],
  seats:'S12 · S00 Head Director',feeds:'every PB target ladder · packet §6'},
 /* ── Displacement family ── */
 {id:'DET-031',nm:'Displacement body multiple',fam:'Displacement',
  inputs:'candle body vs 20-bar median body',
  thr:'body ≥ '+ck('detect.displacement_body')+'× the 20-bar median body',ckKey:'detect.displacement_body',
  emits:'displacement candidate event → DET-035 composite · MSS qualification (DET-047)',
  fp:'wide bars in dead tape (low RVOL) look like displacement but move nothing',
  guard:'DET-032 volume multiple must co-fire on the same bar or the candidate dies',
  def:'Displacement is intent made visible: a candle whose body dwarfs recent bodies, evidencing '+
    'aggressive one-sided execution. It is the difference '+
    'between a sweep that traps and a drift that means nothing.',
  math:'disp_body = body(t) / median20(body) ≥ '+ck('detect.displacement_body')+' where body = |close − open|',
  fails:[['News bar spikes body without follow-through','DET-034 follow-through requirement before any FSM consumes it'],
         ['Median contaminated by a prior shock bar','median is winsorized at the 90th percentile — one monster bar cannot raise its own bar']],
  seats:'S14 · S13',feeds:'DET-035 · DET-047 · PB-02',
  now:()=>'threshold live: '+ck('detect.displacement_body')+'× body · NVDA 10:18 MSS bar scored 74/100 on the DET-035 composite'},
 {id:'DET-032',nm:'Displacement volume multiple',fam:'Displacement',
  inputs:'bar volume vs 20-bar median volume',
  thr:'volume ≥ '+ck('detect.displacement_vol')+'× the 20-bar median volume',ckKey:'detect.displacement_vol',
  emits:'effort certificate attached to DET-031 candidates → DET-035',
  fp:'time-of-day volume (open/close auctions) triggers naive multiples constantly',
  guard:'baseline is a time-of-day volume curve, never a flat 20-bar median at the open',
  def:'Price without volume is opinion. This detector certifies that the displacement bar carried real '+
    'participation — the effort side of effort-vs-result.',
  math:'disp_vol = vol(t) / curve20(vol, tod(t)) ≥ '+ck('detect.displacement_vol')+' — curve20 = same-minute-of-session median',
  fails:[['Auction prints (open rotation, MOC) read as effort','auction windows excluded from the numerator by session mask'],
         ['Halt-reopen volume spikes certify garbage','post-halt bars quarantined 5 minutes — DET-071 shock regime owns them']],
  seats:'S11 Volume Effort/Result · S14',feeds:'DET-035 · PB-02 · PB-03'},
 {id:'DET-034',nm:'Follow-through bar',fam:'Displacement',
  inputs:'bar t+1 after a DET-031/032 co-fire',
  thr:'next bar holds ≥ 50% of the displacement range and closes directional',ckKey:null,
  emits:'displacement CONFIRMED event — the input DET-047 MSS actually requires',
  fp:'exhaustion gaps produce a violent bar with an immediate full retrace',
  guard:'DET-073 effort-vs-result must NOT flag divergence on the same bar pair',
  def:'One bar is a claim; the second bar is the audit. Displacement that cannot hold half its own '+
    'range within one bar was absorption wearing a costume, and this detector is where that lie dies.',
  math:'confirm iff low(t+1) ≥ mid(range_t) [longs] ∧ close(t+1) in top 40% of bar ∧ ¬DET-073(t, t+1)',
  fails:[['Slow bleed after the big bar technically "holds" mid','directional-close clause — holding mid while closing weak fails'],
         ['Confirmation chased as an entry (the #1 journal leak, 31 cases)','entry model is first-return (DET-041), never the confirmation bar itself']],
  seats:'S14 · S13',feeds:'DET-047 · PB-03 · PB-05 · PB-08'},
 {id:'DET-035',nm:'Displacement composite score',fam:'Displacement',
  inputs:'DET-031 body · DET-032 volume · DET-034 follow-through · closure location',
  thr:'promotes at ≥ 60/100 — LS-118 proposes raising to 65 (A/B live, 41-trade evidence)',ckKey:null,
  emits:'the single 0–100 number packets cite (NVDA §5: "displacement 74/100")',
  fp:'the 60–65 border band drags expectancy: +0.34R in-band vs +1.12R above 65',
  guard:'border-band trades are tagged and fed to LS-118 regardless of outcome (packet §19)',
  def:'The composite exists so "was that real displacement?" has one auditable answer instead of four '+
    'arguments. Weights are versioned '+
    'config, not vibes; the border band is the desk’s live experiment.',
  math:'score = 35·min(body_mult/2,1) + 30·min(vol_mult/2.5,1) + 20·follow_through + 15·close_location',
  fails:[['Score inflation when all four inputs are mediocre-but-present','component floors: any input below its own floor caps the composite at 55'],
         ['Threshold argued per-trade in hindsight','threshold is config under court control — LS-118 is the ONLY path that moves it (LAW-013)']],
  seats:'S13 · S14 · S31 Learning Suggestion',feeds:'PB-02 · PB-05 · LS-118 evidence stream'},
 /* ── Structure family ── */
 {id:'DET-041',nm:'Fair value gap (FVG)',fam:'Structure',
  inputs:'3-bar window · ATR(14)',
  thr:'gap between bar1 high and bar3 low ≥ 0.15×ATR, unmitigated',ckKey:null,
  emits:'entry zones under the first-return doctrine → PB-02 · PB-07 · chart annotations',
  fp:'chop produces dozens of micro-gaps that mean nothing',
  guard:'only FVGs born of qualified displacement (DET-031+032 co-fire) are entry-grade',
  def:'A three-candle imbalance where price moved so fast one side never traded. The '+
    'desk’s entry model is the FIRST return into a '+
    'displacement-born FVG — the 195.90–196.30 zone in PKT-2231 is this object.',
  math:'FVG_bull = [high(t−2), low(t)] where low(t) > high(t−2), width ≥ 0.15×ATR14, born with DET-035 ≥ 60',
  fails:[['Second and third returns traded like the first','return counter on the zone object — first return only; later touches are decayed to context'],
         ['Gap "filled" by a wick then treated as still valid','mitigation is wick-inclusive: touched is touched']],
  seats:'S14 · S15 Supply/Demand',feeds:'PB-02 · PB-07 · research.chart zones'},
 {id:'DET-044',nm:'Breaker block',fam:'Structure',
  inputs:'failed breakout leg · origin order block · reclaim close',
  thr:'origin block of the failed breakout reclaimed on a closing basis',ckKey:null,
  emits:'PB-09 zones · pool-spend ledger entries (pools never re-arm)',
  fp:'the third "retest" of a breaker is decay dressed as strength',
  guard:'freshness decay: touch 1 full weight · touch 2 half · touch 3 rejected (AUT-116 catalyst-reset '+
    'exception in evidence gathering)',
  def:'When a breakout fails, the order block that launched it flips: trapped breakout traders defend '+
    'their exit at the same level that betrayed them. The '+
    'AMD 170.60 failure trap is this detector’s live output.',
  math:'breaker = OB(origin) flipped iff close crosses back through OB after '+
    'sweep(extreme); polarity inverts on reclaim',
  fails:[['Breaker counted while the larger range says the breakout was never real','DET-057 range context gates candidacy — no breaker inside undeclared chop'],
         ['Trapped side already exited on the first retest','DET-011 re-estimates the remaining cluster after each touch; empty trap = dead breaker']],
  seats:'S12 · S13',feeds:'PB-09 · PB-03'},
 {id:'DET-047',nm:'Market structure shift (MSS)',fam:'Structure',
  inputs:'last opposing swing · displacement certificate from DET-034/035',
  thr:'close through the last opposing swing WITH displacement (score ≥ 60)',ckKey:null,
  emits:'FORMING→ARMED and ARMED→TRIGGERED transitions in most playbook FSMs',
  fp:'mid-range MSS with no prior sweep is a continuation trap, not a reversal',
  guard:'an MSS qualifies only AFTER a liquidity event (DET-001/004 fire) — sweep first, shift second, always',
  def:'The qualified break: structure has actually changed hands, evidenced by displacement through '+
    'the last swing that mattered. TSLA '+
    'sits ARMED right now because exactly this object has not printed.',
  math:'MSS iff close beyond swing_opp ∧ DET-035 ≥ 60 ∧ ∃ sweep_event(t−k, k ≤ 12 bars)',
  fails:[['Wick-through counted as a break','closing basis only — wicks are raids, closes are verdicts'],
         ['MSS in the middle of a range promoted without a trapped side','sweep-precedence clause above; LAW-003 named in the rejection']],
  seats:'S13 · S14',feeds:'PB-01/02/05/07/09 transitions · TSLA unmet condition'},
 {id:'DET-052',nm:'Order block',fam:'Structure',
  inputs:'last opposing candle before displacement · zone freshness ledger',
  thr:'unmitigated · born with DET-035 ≥ 60 · located on the correct side of equilibrium (DET-055)',ckKey:null,
  emits:'PB-07 demand zones · structural stop anchors (the 195.40 OB under the NVDA entry)',
  fp:'every red candle before a green move gets labeled — decoration, not behavior (LAW-010)',
  guard:'an OB without a displacement birth certificate is furniture and renders dimmed',
  def:'The last opposing candle before institutional intent showed itself — where the position was '+
    'built. Valid ones anchor stops (below '+
    'the OB = below the position); invalid ones are chart decoration.',
  math:'OB = last opp candle in [t−3, t−1] of a DET-035 ≥ 60 leg; fresh iff untouched since birth; '+
    'premium/discount side check via DET-055',
  fails:[['Zone drawn from a leg with no displacement','birth-certificate rule — no DET-035 pass, no OB object exists at all'],
         ['Third mitigation traded like the first','shares the DET-044 decay schedule: 1.0 / 0.5 / rejected']],
  seats:'S15 · S14',feeds:'PB-07 · stop anchors in packet §13'},
 {id:'DET-055',nm:'Premium/discount locator',fam:'Structure',
  inputs:'qualified swing pair (DET-047-certified anchors)',
  thr:'above 50% of the dealing range = premium · below = discount · ±2% dead zone at equilibrium',ckKey:null,
  emits:'side-of-range gate: PB-01/PB-05 buy discount only; shorts sell premium only',
  fp:'wrong range anchors silently flip the entire read',
  guard:'anchors must be qualified swings, not arbitrary wicks — an unqualified range emits nothing',
  def:'Longs bought in premium pay retail prices for institutional risk. The locator is a one-line '+
    'arithmetic with one hard rule: the '+
    'desk does not buy premium or sell discount, ever, in any playbook.',
  math:'eq = (range_hi + range_lo) / 2; state = px > eq·1.02 ? PREMIUM : px < eq·0.98 ? DISCOUNT : EQUILIBRIUM',
  fails:[['Nested ranges disagree (4H discount, 15m premium)','ladder rule: the entry timeframe defers to the setup timeframe — conflicts render '+
    'as EQUILIBRIUM, which permits nothing'],
         ['Range rolled forward mid-trade to justify holding','range anchors freeze at packet assembly; re-anchoring requires a new packet rev']],
  seats:'S12 · S14',feeds:'PB-01 · PB-05 · dealing-range panel in research.structure'},
 {id:'DET-057',nm:'Dealing-range alignment',fam:'Structure',
  inputs:'nested qualified ranges across D / 4H / 15m',
  thr:'alignment score ≥ 60/100 across three frames or the symbol has NO_RANGE',ckKey:null,
  emits:'the range object research.structure renders · context gate for DET-044/055',
  fp:'chop has no valid range — forcing one invents signal from noise',
  guard:'declares NO_RANGE below 60 — an honest null that blocks every range-dependent playbook',
  def:'Ranges only mean something when the ladder agrees on where they are. QQQ’s "HTF bias unresolved '+
    'on 4H" unmet condition is this detector refusing to guess.',
  math:'align = 100 − Σ frame_disagreement(anchor_i, anchor_j) normalized; NO_RANGE iff align < 60',
  fails:[['Equilibrium markets scored as weak trends','the null state exists precisely for this — no campaign is a valid finding (Wyckoff doctrine)'],
         ['One frame’s stale anchors poison the stack','anchor freshness decays per frame; stale frames drop out of the vote rather than vote wrong']],
  seats:'S12 · S10 Wyckoff Campaign',feeds:'DET-055 · DET-044 · QQQ unmet gate'},
 /* ── Wyckoff family ── */
 {id:'DET-061',nm:'Selling climax (SC)',fam:'Wyckoff',
  inputs:'RVOL regime (DET-071) · bar range vs ATR · close location',
  thr:'RVOL ≥ 3× · range ≥ 2×ATR · close off the lows by ≥ 40% of range',ckKey:null,
  emits:'campaign candidate → S10 lane · PB-04 stage 0 · phase-A open',
  fp:'news capitulation that keeps falling — a climax that wasn’t',
  guard:'requires an automatic rally (AR) within 5 bars or the SC label is revoked in the ledger',
  def:'The panic bar that transfers stock from weak hands to the composite operator. It opens a '+
    'POSSIBLE campaign — nothing more. The '+
    'label is provisional until the AR proves someone big was buying.',
  math:'SC iff RVOL ≥ 3 ∧ range ≥ 2×ATR14 ∧ (close − low)/range ≥ 0.4; revoked unless '+
    'AR(range ≥ 1×ATR up) within 5 bars',
  fails:[['First leg of a crash labeled SC','AR revocation clause — no rally, no climax, label deleted with an audit row'],
         ['Climax "confirmed" on the same bar it prints','one label per bar-close, review at t+5; the desk does not front-run its own detector']],
  seats:'S10 · S11',feeds:'PB-04 · phase engine'},
 {id:'DET-063',nm:'Spring / upthrust',fam:'Wyckoff',
  inputs:'range extreme registry · close-back window · volume signature',
  thr:'sweep of a range extreme with close back inside within 3 bars (HUM-119)',ckKey:null,
  emits:'PB-02 / PB-04 triggers · the 10:14 NVDA spring object',
  fp:'a genuine breakout mislabeled as a spring — direction ambiguity at the moment it matters most',
  guard:'HUM-119 three-bar rule + volume grammar: effort INTO the extreme, result REJECTS it — both or neither',
  def:'The engineered false break: price takes the obvious level, finds nothing behind it, and snaps '+
    'back — trapping everyone who believed. Springs and '+
    'upthrusts are the same event mirrored; both are DET-063.',
  math:'spring iff low(t) < range_lo ∧ close(t+k) > range_lo, k ≤ 3 ∧ vol(t) ≥ 1.5×curve ∧ close(t) in upper half',
  fails:[['Breakout that retests and goes — the mirror-image error','3-bar deadline is hard: bar 4 outside = breakout, the label flips, and PB-02 stands down'],
         ['Spring called on the second sweep of a SPENT pool','pool ledger: swept pools cannot spring — there is nothing left to trap']],
  seats:'S10 · S14',feeds:'PB-02 · PB-04 · HUM-119 A/B cohort'},
 {id:'DET-065',nm:'SOS / SOW',fam:'Wyckoff',
  inputs:'range boundary (creek/ice) · spread + volume expansion',
  thr:'range expansion ≥ 1.5×ATR with volume expansion ≥ 1.5× crossing the boundary in phase D',ckKey:null,
  emits:'phase-D confirmation → LPS/LPSY watch (DET-067) · T1-acceptance signature',
  fp:'SOS directly into the overhead supply of a LARGER distribution range',
  guard:'DET-057 must show the higher frame is not capping — the ladder outranks the schematic',
  def:'Sign of strength: the markup attempt that clears the creek with effort AND result agreeing. '+
    'What T1 acceptance looks like on the '+
    'NVDA campaign — pending as of this snapshot, and honestly labeled so.',
  math:'SOS iff close > creek ∧ range ≥ 1.5×ATR ∧ vol ≥ 1.5×curve ∧ phase = D',
  fails:[['Strength into a bigger wall','ladder veto via DET-057 — a 15m SOS under a daily supply shelf emits at half weight'],
         ['Low-volume drift over the creek counted as SOS','both expansions required; drift is phase-C noise, not phase-D evidence']],
  seats:'S10 · S13',feeds:'PB-04 · campaign progression chip rail'},
 {id:'DET-067',nm:'LPS / LPSY',fam:'Wyckoff',
  inputs:'post-SOS pullback series · per-dip volume',
  thr:'pullback holds above the spring/ice with volume diminishing on EACH successive dip',ckKey:null,
  emits:'PB-04 entry zone — the last place demand proves itself before markup',
  fp:'an LPS that is actually a re-distribution shelf under a lower high',
  guard:'rising-volume "LPS" is distribution wearing a costume — the volume grammar is the '+
    'tell, and it is enforced per dip',
  def:'Last point of support: the final, quieter test where supply fails to reappear. It is the '+
    'highest-quality Wyckoff entry because the campaign has already shown its hand three times by now.',
  math:'LPS iff min(pullback) > spring_low ∧ vol(dip_n) < vol(dip_n−1) ∀n ∧ SOS on record',
  fails:[['Entry at the second LPS after the move is obvious','LPS entries decay like zones: the first is the trade, the third is exit liquidity'],
         ['LPSY mirror missed in shorts — hope reads support into supply','the detector is direction-symmetric by construction; the operator’s bias is not, '+
           'which is why the packet cites the detector']],
  seats:'S10',feeds:'PB-04 · NVDA "LPS forming" line in research.wyckoff'},
 /* ── Volume family ── */
 {id:'DET-071',nm:'RVOL regime classifier',fam:'Volume',
  inputs:'session-normalized relative volume (time-of-day curve)',
  thr:'dead < 0.7 · normal 0.7–1.5 · elevated 1.5–3.0 · shock > 3.0',ckKey:null,
  emits:'regime tag consumed by DET-061, PB-03 arming, alert thresholds, scanner anomaly stage',
  fp:'split-adjusted history or halt-reopens spike naive RVOL to fiction',
  guard:'baseline is the same-minute-of-session median over 20 sessions, corporate-action adjusted',
  def:'Participation context for every other volume read. A displacement in dead tape is a lie; churn '+
    'in shock tape is a battle. Nothing volume-flavored is interpreted without this tag attached.',
  math:'RVOL(t) = vol(t) / median20(vol at same minute-of-session); regime = band(RVOL)',
  fails:[['Naive 20-day average calls every open "elevated"','the time-of-day curve IS the fix — 09:31 compares to twenty other 09:31s'],
         ['Shock regime treated as tradeable energy','shock hands control to PB-03 rules only; every other playbook stands down at RVOL > 3']],
  seats:'S11 · S05 Universe Scanner',feeds:'DET-061 · PB-03 · scanner anomaly stage',
  now:()=>{const s=symBy(S.sym);return s?S.sym+' RVOL '+U.fmt(s.rvol,1)+'× → '+(s.rvol>3?'SHOCK':s.rvol>=1.5?'ELEVATED':s.rvol>=0.7?'NORMAL':'DEAD')+
    ' regime':null}},
 {id:'DET-073',nm:'Effort-vs-result divergence',fam:'Volume',
  inputs:'volume z-score · range z-score per bar',
  thr:'volume z ≥ +2 with range z ≤ 0 — heavy effort, no result',ckKey:null,
  emits:'absorption warnings → S11 lane · BLOCKS DET-034 confirmation on the same bar pair',
  fp:'lunch-hour dribble mimics absorption when both z-scores are meaningless',
  guard:'decision-grade only inside killzones (DET-081); outside, it logs and shuts up',
  def:'Wyckoff’s third law as a detector: when effort and result disagree, the market is '+
    'telling you where the other side is hiding. '+
    'High volume that moves nothing means someone is absorbing everything.',
  math:'diverge iff z(vol) ≥ 2 ∧ z(range) ≤ 0 over the 20-bar session-normalized window',
  fails:[['Thin-tape false positives at lunch','killzone gating — the doldrums produce z-scores, not information'],
         ['Absorption read as a top when it is a handoff','direction is NOT emitted — only the divergence; the campaign read (S10) owns direction']],
  seats:'S11 · S10',feeds:'DET-034 veto input · packet §9'},
 {id:'DET-075',nm:'Churn detector',fam:'Volume',
  inputs:'N-bar window at a zone · cumulative delta proxy · range compression',
  thr:'3+ bars at a zone · cumulative progress ≤ 0.25×ATR · volume ≥ 1.5× curve',ckKey:null,
  emits:'zone-defended signal → PB-07 mitigation quality score',
  fp:'pre-event coiling reads as churn — the market is waiting, not fighting',
  guard:'suppressed entirely inside DET-083 event windows; waiting is not defending',
  def:'Heavy trade, no travel, AT a level someone should care about. Churn at a demand zone means the '+
    'zone is being defended with real money — the difference between mitigation and evaporation.',
  math:'churn iff bars_at_zone ≥ 3 ∧ |Σ progress| ≤ 0.25×ATR ∧ vol_sum ≥ 1.5× expected',
  fails:[['Coiling before CPI scored as zone defense','DET-083 suppression window — churn logic is off inside '+ck(
    'risk.event_window_hrs')+'h of a binary event'],
         ['Churn at a level nobody named','zone-registry join: churn only scores AT registered DET-052/044 objects — churn in a vacuum is noise']],
  seats:'S11 · S15',feeds:'PB-07 quality gate'},
 {id:'DET-077',nm:'Absorption signature',fam:'Volume',
  inputs:'aggressive-volume estimate into a level · progress since first touch',
  thr:'aggressive volume ≥ 2× median into a level with ≤ 0.25×ATR of progress',ckKey:null,
  emits:'the "no absorption signature above" clearance line in packet §9',
  fp:'iceberg inference without depth data is exactly that — inference',
  guard:'output is typed INFERENCE in the semantic taxonomy and can never be a sole trigger',
  def:'The passive side eating everything the aggressive side sends. Its absence above the NVDA entry '+
    'is what makes the path to the draw '+
    'credible; its presence would have downgraded the packet a full grade.',
  math:'absorb iff aggr_vol(level) ≥ 2× median ∧ progress ≤ 0.25×ATR since first touch; '+
    'typed INFERENCE (no L3 data in demo tier)',
  fails:[['Demo tier has no true depth feed — overclaiming precision','honest typing: INFERENCE, rendered with method; production tier upgrades the input, not the claim'],
         ['One large passive print read as a wall','persistence requirement across ≥ 3 touches before the signature stands']],
  seats:'S11',feeds:'packet §9 clearance · PB-07'},
 /* ── Context family ── */
 {id:'DET-081',nm:'Killzone window',fam:'Context',
  inputs:'exchange clock (CLOCK.killzone runtime)',
  thr:'NY-AM 09:50–11:00 · NY-PM 13:30–16:00 (TIM-003)',ckKey:null,
  emits:'timing gate for PB-02/PB-03 triggers · expectancy split +1.31R inside vs +0.42R outside',
  fp:'none — it is a clock. The failure mode is HUMAN: forcing trades because the window is open',
  guard:'the window permits; it never commands. An open killzone with no setup is a closed killzone',
  def:'The two windows where institutional order flow concentrates and the desk’s entire measured edge '+
    'lives. Outside them the same signals fire with a '+
    'third of the expectancy — the journal proved it, so the gate enforces it.',
  math:'kz(t) = t ∈ [09:50, 11:00] ∪ [13:30, 16:00] ET; runtime = CLOCK.killzone()',
  fails:[['Operator treats the window as a quota','the coach flags entries in the last 10 minutes of a window at 2× scrutiny — deadline trades are tilt trades'],
         ['Half-day sessions shift the windows','exchange calendar feed owns the boundaries, not the wall clock']],
  seats:'S14 · S24 Personality Router',feeds:'PB-02 · PB-03 · MEM-03 gate',
  now:()=>'now: '+(CLOCK.killzone()||'OUTSIDE killzones — triggers gated, analysis unrestricted')},
 {id:'DET-083',nm:'Event proximity',fam:'Context',
  inputs:'event calendar (dual source) · event classes FOMC/CPI/NFP/OPEX/earnings',
  thr:'binary event inside '+ck('risk.event_window_hrs')+'h arms the blackout',ckKey:'risk.event_window_hrs',
  emits:'RISK-EVENT gate code · packet TTL compression · DET-075 suppression · LAW-017 enforcement',
  fp:'rescheduled events and timezone errors — the calendar lies more often than the tape',
  guard:'dual calendar source; on disagreement or unknown, FAIL CLOSED: unknown = inside the window',
  def:'The detector behind the blackout engine in Markets → Calendar. It converts a calendar into an '+
    'enforced gate: no new correlated entries inside the '+
    'window, no exceptions negotiated at the moment of temptation.',
  math:'blackout iff ∃ event e: class(e) ∈ BINARY ∧ t_event − t_now ≤ '+ck('risk.event_window_hrs')+
    'h ∧ corr(sym, e.underlying) ≥ 0.5',
  fails:[['Event moved and the stale window blocks a clean trade','dual-source reconcile every 15m; a lost trade to a stale calendar is a P2 defect, filed and fixed'],
         ['Single-name event blocking the index book','correlation clause scopes the blackout to correlated size only']],
  seats:'S19 Earnings Event · S01 Risk Officer',feeds:'markets.calendar · packet §11 · PB-08 stage 0'},
 {id:'DET-085',nm:'Correlation regime',fam:'Context',
  inputs:'rolling 20d pairwise correlations across the promoted set',
  thr:'pairwise ρ ≥ 0.75 folds names into one exposure cluster (cap input '+ck('risk.max_sector_exposure')+
    '% '+'equity)',ckKey:'risk.max_sector_exposure',
  emits:'cluster map → S33 exposure sums · the "NVDA+AMD = ONE bet at 0.84" reading',
  fp:'correlations spike toward 1 in a crash — suddenly every cluster merges',
  guard:'regime-conditional matrix: crash regime collapses the book to a single ONE-BET '+
    'cluster by design, not by surprise',
  def:'Position count is a vanity metric; cluster count is the risk. This detector is why the desk '+
    'sees two semiconductor longs as one 0.84-correlated bet and sizes accordingly.',
  math:'cluster: transitive closure of {(i,j): ρ20(i,j) ≥ 0.75}; exposure = Σ risk over cluster vs '+ck(
    'risk.max_sector_exposure')+
    '%',
  fails:[['Stable-period correlations trusted into a vol spike','VIX-conditioned matrix swap at regime boundaries — the crash matrix pre-exists the crash'],
         ['Sector labels used instead of measured correlation','labels are display only; the math clusters on returns, which is how it catches cross-sector twins']],
  seats:'S33 Portfolio Exposure · S01',feeds:'RISK-041 reading · portfolio.exposure'},
 /* ── Options family ── */
 {id:'DET-091',nm:'Spread gate',fam:'Options',
  inputs:'NBBO bid/ask of the candidate contract · 20s sample window',
  thr:'spread ≤ '+ck('options.max_spread_pct')+'% of mid or the contract is vetoed (OPT-007)',ckKey:'options.max_spread_pct',
  emits:'the S22 liquidity veto — the exact blocker holding PKT-2234 (AMD 175C at 8.9%)',
  fp:'quote flicker at the open reads a tradeable contract as untouchable',
  guard:'3-sample median over 20 seconds, never a single NBBO snapshot; LS-121 adds a WAIT '+
    'state when this is the ONLY blocker',
  def:'A bad contract invalidates a good chart (LAW-009). The spread is the toll both ways: at '+ck(
    'options.max_spread_pct')+
    '% you pay a sixth of the position crossing twice before the thesis earns anything.',
  math:'spread_pct = (ask − bid) / mid × 100; veto iff median3(spread_pct, 20s) > '+ck('options.max_spread_pct'),
  fails:[['Terminal rejection of a spread that normalizes in 20 minutes (AUT-117: +3.4R lost)',
    'LS-121 WAIT_FOR_SPREAD — 14/30 paper samples in; the veto becomes a timed wait, never a bypass'],
         ['Open-auction flicker','the 20s median clause exists for exactly this window']],
  seats:'S22 Options Desk (veto)',feeds:'packet §12 · PKT-2234 blocker',
  now:()=>'AMD 175C last read 8.9% > '+ck('options.max_spread_pct')+'% cap — VETO standing · desk re-runs 11:00'},
 {id:'DET-093',nm:'IV rank band',fam:'Options',
  inputs:'IV rank vs 52-week range · event-adjusted term structure',
  thr:'debit structures require IVR ≤ '+ck('options.iv_rank_debit_max')+' · bands: <25 cheap · 25–55 fair · >55 rich',ckKey:'options.iv_rank_debit_max',
  emits:'structure selection (long premium vs spread) → S22 contract pipeline · COIN "favor equity" read',
  fp:'raw IVR looks fair near earnings because the event bump IS the rank — it lies exactly when it matters',
  guard:'event-adjusted IVR strips the earnings bump before banding; the raw number is never consumed',
  def:'Buying premium at IVR 77 is paying a crush tax before the thesis starts. The band decides the '+
    'STRUCTURE, never the trade: rich vol turns a call into a spread or the option into shares.',
  math:'IVR = (IV − 52w_low) / (52w_high − 52w_low) × 100, event-adjusted; debit allowed iff IVR ≤ '+ck(
    'options.iv_rank_debit_max'),
  fails:[['Post-crush "cheap" vol bought into a dead tape','IVR is a structure input, not a signal — cheap vol with no setup buys nothing'],
         ['Term structure inversion missed by a single-tenor rank','front/back ratio rides along; inversion flags a regime note to S08 (HUM-117 lineage)']],
  seats:'S22 · S19',feeds:'packet §12 · OPT-014 doctrine'},
 {id:'DET-095',nm:'OI wall locator',fam:'Options',
  inputs:'open interest by strike · gamma proximity weighting',
  thr:'wall = strike OI ≥ 4× adjacent-strike median AND ≥ '+ck('options.min_oi')+' contracts',ckKey:'options.min_oi',
  emits:'pin-risk flag → 0DTE MOC blackout logic (LS-117 lineage) · SPY 601 pin note on TRD-0907',
  fp:'deep-ITM legacy OI from months-old positioning is inert mass, not a wall',
  guard:'OI is weighted by gamma proximity — walls only matter where gamma lives, near the money, near expiry',
  def:'Large open interest near the money bends the tape toward it into expiry as hedgers '+
    'defend. The 601 pin note on the live SPY '+
    'credit spread is this detector, and LS-117’s MOC blackout is its case law.',
  math:'wall(k) iff OI(k) ≥ 4 × median(OI(k±1..3)) ∧ OI(k) ≥ '+ck('options.min_oi')+'; weight × Γ(k, dte)',
  fails:[['Stale OI treated as fresh conviction','OI delta vs prior day rides with the level — walls that stopped growing decay'],
         ['Pin traded as a certainty instead of a gravity','emits a flag and a blackout, never an entry; pin gravity is context (CC-13 discipline applies)']],
  seats:'S22 · S23 Options Flow',feeds:'LS-117 blackout · portfolio pin notes'},
];
const EST_FAMS=['ALL','Liquidity','Displacement','Structure','Wyckoff','Volume','Context','Options'];

/* ── golden fixtures: two frozen test vectors per detector — re-run on every
     rules change, exactly like the golden packets. A detector that cannot
     state its own fixtures is untestable and therefore unshippable. ── */
const EST_VEC={
 'DET-001':['IN: highs 203.28 / 203.31 / 203.33, ATR 2.10 → tolerance 0.315 → OUT: pool{203.31, buy-side, 3 touches}',
            'IN: highs 203.28 / 204.80, ATR 2.10 → spread 1.52 > tolerance → OUT: no pool (two swings, no cluster)'],
 'DET-004':['IN: Asia session H/L 197.90/194.30, NY open 09:30, both untouched, session vol 0.9× '+
   'median → OUT: 2 candidate pools',
            'IN: half-day session vol 0.31× median → OUT: nothing — extremes of a ghost session do not register'],
 'DET-007':['IN: pivots (t1,188.4)(t5,191.2)(t9,194.1), R²=0.97, slope 31° → OUT: diagonal + cluster estimate',
            'IN: 2 pivots only → OUT: nothing — two points is a line, not liquidity'],
 'DET-009':['IN: SPY 601.24, nearest00 600, ADR 4.8 → dist 1.24 > 0.25×ADR 1.20 → OUT: no magnet '+
   'weight (barely — and honestly)',
            'IN: NVDA 196.74 vs 200, ADR 6.2 → dist 3.26 > 1.55 → OUT: nothing; the 199.20 PDH pool stands unadjusted'],
 'DET-011':['IN: DET-001 pool 203.31 + DET-004 PDH 203.15, gap 0.16 < 0.2×ATR → OUT: cluster '+
   'score 82, side ratio 2.1:1 → draw ARMED',
            'IN: equal clusters above AND below (ratio 1.1:1) → OUT: NO_DRAW — symmetric books emit the honest null'],
 'DET-031':['IN: body 2.41, median20 body 1.55 → 1.55× ≥ '+ck('detect.displacement_body')+'× → OUT: candidate (awaits DET-032)',
            'IN: body 1.80, median20 1.55 → 1.16× → OUT: nothing — a big-ish bar is not intent'],
 'DET-032':['IN: vol 84k, same-minute curve20 41k → 2.05× ≥ '+ck('detect.displacement_vol')+'× → OUT: effort certificate',
            'IN: 09:30 auction bar 3.1× flat-median but 0.9× curve20 → OUT: nothing — the curve is the whole point'],
 'DET-034':['IN: disp range 194.90–196.40, bar t+1 low 195.71 ≥ mid 195.65, close top 30% → OUT: CONFIRMED',
            'IN: bar t+1 holds mid but closes bottom quarter → OUT: fail — held ground, lost the argument'],
 'DET-035':['IN: body 1.9× · vol 2.3× · follow-through ✓ · close 88th pctile → OUT: 74/100 (the PKT-2231 number)',
            'IN: all four inputs at their floors → OUT: capped 55 — four mediocrities do not sum to conviction'],
 'DET-041':['IN: bars h(t−2)=195.90, l(t)=196.30, ATR 2.1 → width 0.40 ≥ 0.315, born of DET-035 '+
   '74 → OUT: entry-grade FVG 195.90–196.30',
            'IN: same gap born of a 41-score drift leg → OUT: context-grade only — renders dimmed, triggers nothing'],
 'DET-044':['IN: breakout origin OB 170.20–170.60, sweep to 171.9 fails, close 170.1 back '+
   'through → OUT: breaker (AMD live)',
            'IN: third retest of the same breaker → OUT: rejected — touch 3 is decay, the trapped side already left'],
 'DET-047':['IN: close 196.42 > swing 196.30, DET-035 74, sweep on record 10:14 → OUT: MSS (the 10:18 NVDA shift)',
            'IN: wick to 196.55, close 196.11 → OUT: nothing — raids are not verdicts'],
 'DET-052':['IN: last opposing candle 195.40 before a 74-score leg, untouched, discount side → OUT: OB, stop-anchor grade',
            'IN: red candle before a 38-score drift → OUT: no object — no birth certificate, no block'],
 'DET-055':['IN: range 194.10–210.30, px 196.74 → eq 202.20, px < eq×0.98 → OUT: DISCOUNT',
            'IN: px 201.90, inside ±2% of eq → OUT: EQUILIBRIUM — permits nothing, honestly'],
 'DET-057':['IN: D/4H/15m anchors within tolerance → align 78 → OUT: range object → DET-055 may speak',
            'IN: 4H anchors stale 9 sessions → frame drops out → align 52 → OUT: NO_RANGE (the QQQ state)'],
 'DET-061':['IN: RVOL 3.4× · range 2.3×ATR · close 47% off low → OUT: SC provisional; AR deadline t+5',
            'IN: same bar, no AR by t+5 → OUT: label revoked, audit row written — a climax that keeps falling was a step'],
 'DET-063':['IN: low 194.28 < range_lo 194.30, close t+1 194.95 back inside, vol 2.3× → OUT: spring (NVDA 10:14)',
            'IN: close still below at bar 4 → OUT: label flips to breakout; PB-02 stands down (HUM-119)'],
 'DET-065':['IN: close over creek, range 1.7×ATR, vol 1.8×, phase D → OUT: SOS',
            'IN: same geometry under a daily supply shelf (DET-057 veto) → OUT: SOS at half weight, ladder note attached'],
 'DET-067':['IN: dips 0.9× → 0.7× → 0.5× volume, all above spring → OUT: LPS forming (NVDA current read)',
            'IN: dip 3 on RISING volume → OUT: LPSY suspicion — campaign review, entry refused'],
 'DET-071':['IN: 10:18 vol vs twenty other 10:18s → 2.3× → OUT: ELEVATED regime tag',
            'IN: halt-reopen bar 11× → OUT: quarantined 5 minutes; shock regime owns the bar, nothing else may read it'],
 'DET-073':['IN: z(vol) +2.6, z(range) −0.3, inside killzone → OUT: divergence — absorption warning, DET-034 blocked',
            'IN: same z-pair at 12:40 lunch → OUT: logged, not decision-grade — doldrums z-scores are noise'],
 'DET-075':['IN: 4 bars at OB, progress 0.11×ATR, vol 1.7× expected → OUT: zone-defended → PB-07 quality up',
            'IN: same signature at T−20h to CPI → OUT: suppressed — waiting is not defending (DET-083 window)'],
 'DET-077':['IN: 2.4× aggressive vol into 199.20, progress 0.14×ATR, 3 touches → OUT: absorption flag, typed INFERENCE',
            'IN: one large passive print, one touch → OUT: nothing — persistence is the signature, size is not'],
 'DET-081':['IN: t=10:26 ET → OUT: NY-AM killzone open (the PKT-2231 entry stamp)',
            'IN: t=12:15 → OUT: closed — triggers gated, analysis unrestricted, expectancy memo attached'],
 'DET-083':['IN: CPI T+2d 08:30, now T+1d 07:00, corr(SPY)=1.0 → OUT: blackout armed at T−'+ck(
   'risk.event_window_hrs')+
   'h (LAW-017)',
            'IN: calendar sources disagree on the print time → OUT: INSIDE window by definition — fail closed'],
 'DET-085':['IN: ρ20(NVDA,AMD)=0.84 ≥ 0.75 → OUT: one semis cluster; open + pending = ONE bet (RISK-041)',
            'IN: VIX regime flips to crash matrix → OUT: clusters merge to ONE-BET book-wide, by design not surprise'],
 'DET-091':['IN: AMD 175C samples 8.7/9.1/8.9% → median 8.9 > '+ck('options.max_spread_pct')+
   '% → OUT: OPT-007 veto (PKT-2234)',
            'IN: open flicker 11.2/3.4/3.2% → median 3.4 → OUT: pass — the single bad snapshot never decides'],
 'DET-093':['IN: NVDA IVR 41 event-adjusted, debit request → 41 ≤ '+ck('options.iv_rank_debit_max')+
   ' → OUT: long premium permitted',
            'IN: COIN raw IVR 77 → OUT: debit refused — favor spreads or equity (OPT-014); the '+
              'crush tax is not negotiable'],
 'DET-095':['IN: SPY 601 OI 4.8× adjacent median, 0DTE → OUT: wall + pin flag (the TRD-0907 note)',
            'IN: deep-ITM 540 strike, huge stale OI, Γ≈0 → OUT: nothing — inert mass is not gravity'],
};
/* ── tuning history: the last material retune per detector, with its authority ── */
const EST_TUNE={
 'DET-001':'0.20×ATR → 0.15×ATR via HUM-118 (LC-004) — +0.21R measured on n=34',
 'DET-004':'session-volume floor added after two half-day ghost pools reached committee (P2 defects, retuned)',
 'DET-007':'R² floor 0.90 → 0.93 — nightly batch showed the 0.90–0.93 band was mostly hindsight lines',
 'DET-009':'dollar tolerance → 0.25×ADR basis-point scaling; typed WEIGHT (context-only) at the same retune',
 'DET-011':'side-imbalance gate 1.4 → 1.6 after symmetric-book false bias flags (3 cases, one reached a packet)',
 'DET-031':'stable since v12.4 — LS-118 targets the composite (DET-035), not this component',
 'DET-032':'flat median → time-of-day curve in v12.9; false displacement calls at the open fell by an order of magnitude',
 'DET-034':'directional-close clause added after the slow-bleed-holds-mid cohort (7 cases) graded negative',
 'DET-035':'promote-at 60; LS-118 proposes 65 — IN REVIEW, 41-trade evidence, regime-split validation pending',
 'DET-041':'entry-grade birth certificate requirement added v13.0 — chop FVGs demoted to context',
 'DET-044':'touch-decay schedule formalized v13.1; AUT-116 catalyst-reset exception in evidence gathering',
 'DET-047':'sweep-precedence clause hardened after mid-range MSS continuation traps (Pareto: late entry family)',
 'DET-052':'premium/discount side check added — OBs on the wrong side of eq were decoration with coordinates',
 'DET-055':'±2% equilibrium dead zone added — knife-edge premium/discount flips were generating churn, not signal',
 'DET-057':'NO_RANGE null state added v12.8 — the honest null ended forced-range reads in chop',
 'DET-061':'AR revocation window 3 → 5 bars after two real climaxes were revoked too early (missed campaigns)',
 'DET-063':'close-back window pinned to 3 bars via HUM-119 (LC-006) — in A/B with an RVOL-split arm',
 'DET-065':'ladder veto (DET-057) attached after SOS-into-supply losses clustered in the journal',
 'DET-067':'per-dip volume grammar enforced — the rising-volume LPS costume is the #1 Wyckoff FP on record',
 'DET-071':'corporate-action adjustment added after a split turned RVOL into fiction for a week',
 'DET-073':'killzone gating added — lunch z-scores were 40% of raw divergence flags and 0% of useful ones',
 'DET-075':'event-window suppression via DET-083 — pre-CPI coiling is waiting, not defending',
 'DET-077':'typed INFERENCE at birth (semantic taxonomy) — precision honesty is the tune',
 'DET-081':'windows unchanged since TIM-003 — the killzone split (+1.31R vs +0.42R) re-validates monthly',
 'DET-083':'dual-source reconcile cadence 60m → 15m after a rescheduled print slipped a stale window',
 'DET-085':'crash-matrix swap added — the correlation spike must pre-exist the crash it describes',
 'DET-091':'single NBBO snapshot → 3-sample/20s median; LS-121 WAIT state is the pending workflow tune',
 'DET-093':'raw IVR → event-adjusted IVR — the raw number lies exactly when it matters most',
 'DET-095':'gamma-proximity weighting added — deep-ITM legacy OI no longer reads as a wall',
};
const EST_FLT={q:'',fam:'ALL'};

/* ── detector table (patched in place on filter input — focus survives) ── */
function EST_detTable(){
  const q=EST_FLT.q.toLowerCase();
  const rows=EST_DETS.filter(d=>(EST_FLT.fam==='ALL'||d.fam===EST_FLT.fam)&&(!q||(d.id+' '+d.nm+' '+d.fam+
    ' '+d.inputs+' '+d.emits+' '+d.fp).toLowerCase().includes(q)));
  return tbl(['ID','Detector','Family','Inputs','Threshold','Emits →','False-positive mode','Guard'],
    rows.map(d=>'<tr class="click" data-cmd="est.det" data-arg="'+d.id+'">'+
      '<td class="mono" style="font-size:10.5px"><b>'+d.id+'</b></td>'+
      '<td style="font-size:11px"><b>'+U.esc(d.nm)+'</b></td>'+
      '<td><span class="tag">'+d.fam+'</span></td>'+
      '<td class="i2" style="font-size:10px">'+U.esc(d.inputs)+'</td>'+
      '<td class="i1" style="font-size:10px">'+U.esc(d.thr)+(d.ckKey?' '+prov(d.ckKey):'')+'</td>'+
      '<td class="i1" style="font-size:10px">'+U.esc(d.emits)+'</td>'+
      '<td class="i2" style="font-size:10px;color:var(--warn)">'+U.esc(d.fp)+'</td>'+
      '<td class="i2" style="font-size:10px">'+U.esc(d.guard)+'</td></tr>').join('')||
    '<tr><td colspan="8"><div class="empty" style="padding:16px"><div class="e1">NO DETECTOR MATCHES</div>“'+U.esc(EST_FLT.q)+
      '” — the estate is finite on purpose. 28 detectors, each earning its compute.</div></td></tr>')+
  '<div class="i2" style="font-size:10px;padding:7px 12px">'+rows.length+' of '+EST_DETS.length+
    ' detectors shown · click any row for the full contract · thresholds citing a config key are '+
    'numeric truth (LAW-015); the rest are '+
    'versioned detector constants — promoting them to config keys is an open LS-track item.</div>';
}
CMD.define({id:'est.detq',label:'Filter detectors',purpose:'Live-filter the detector registry (patches the table in place)',audit:false,run:(a,el)=>{
  EST_FLT.q=el?el.value:'';const host=document.getElementById('est-det-host');if(host)host.innerHTML=EST_detTable();}});
CMD.define({id:'est.detfam',label:'Detector family',purpose:'Filter the registry to one detector family',audit:false,run:a=>{EST_FLT.fam=a||'ALL';render()}});
CMD.define({id:'est.det',label:'Detector contract',purpose:'Open the full deterministic contract for one detector',audit:false,run:a=>{
  const d=EST_DETS.find(x=>x.id===a);if(!d)return;
  let nowLine=null;try{nowLine=d.now?d.now():null}catch(e){nowLine=null}
  UI.drawer('<div class="dhead"><span class="dt">'+d.id+' · '+U.esc(d.nm)+'</span><span class="pill">'+d.fam+
    ' family · deterministic · zero LLM calls</span><button class="dx" data-cmd="ui.closeDrawer">ESC</button></div>'+
   '<div class="dbody">'+
   kv('DEFINITION','<span style="font-size:11.5px;line-height:1.6">'+U.esc(d.def)+'</span>')+
   kv('MATH SKETCH','<span class="mono" style="font-size:10.5px;color:var(--paper)">'+U.esc(d.math)+'</span>')+
   kv('THRESHOLD','<span style="font-size:11.5px">'+U.esc(d.thr)+'</span>'+(d.ckKey?' '+prov(d.ckKey):' <span class="i2" style="font-size:10px">— detector constant, versioned with rules ('+U.esc(RULES_VERSION)+
     '); changes route through the court (LAW-013)</span>'))+
   kv('EMITS','<span style="font-size:11.5px">'+U.esc(d.emits)+'</span>')+
   (nowLine?kv('READING NOW','<span class="mono" style="font-size:10.5px">'+U.esc(nowLine)+'</span> <span class="demo-wm">demo twin</span>'):'')+
   '<div class="hr"></div>'+
   '<div class="kick" style="font-family:var(--mono);font-size:9.5px;letter-spacing:1.2px;color:var(--ink2);margin-bottom:6px">KNOWN FAILURE MODES — AND THE GUARD THAT ANSWERS EACH</div>'+
   d.fails.map(f=>'<div class="banner warn" style="margin-bottom:6px"><span '+
     'class="bico">!</span><div><b style="font-size:11px">'+U.esc(f[0])+
     '</b><div class="i1" style="font-size:10.5px;margin-top:2px">GUARD: '+U.esc(f[1])+
     '</div></div></div>').join('')+
   '<div class="hr"></div>'+
   '<div class="kick" style="font-family:var(--mono);font-size:9.5px;letter-spacing:1.2px;color:var(--ink2);margin-bottom:6px">GOLDEN '+
     'FIXTURES — FROZEN TEST VECTORS, RE-RUN ON EVERY RULES CHANGE</div>'+
   (EST_VEC[d.id]||[]).map(v2=>'<div class="kv"><span class="k">▸</span><span class="v"><span class="mono" '+
     'style="font-size:10px;line-height:1.6">'+U.esc(v2)+
     '</span></span></div>').join('')+
   kv('TUNING HISTORY','<span style="font-size:10.5px">'+U.esc(EST_TUNE[d.id]||'no material retune on record')+
     '</span>')+
   '<div class="hr"></div>'+
   kv('CONSUMED BY','<span style="font-size:11px">'+U.esc(d.seats)+' · feeds: '+U.esc(d.feeds)+'</span>')+
   kv('CONTRACT RULE','<span style="font-size:11px">A detector emits evidence objects, never verdicts. '+
     'If a named pattern lacks a detector trace, it is decoration '+prov('LAW-010')+'. '+
     'If a detector and a narrative disagree, the detector is the record.</span>')+
   '</div>');}});

/* ── family charters: what each detector family may claim — and may never ── */
const EST_FAMCH=[
 ['Liquidity','WHERE the fuel is: pools, clusters, session extremes, the draw.',
  'may NEVER claim direction — a pool is a magnet, not a forecast. Direction belongs to Structure + Wyckoff.',
  'DET-001 · 004 · 007 · 009 · 011'],
 ['Displacement','WHETHER intent showed: body, effort, follow-through, the composite score.',
  'may NEVER claim an entry — the displacement bar itself is a chase by definition (LC-001). '+
    'Entries belong to first-return objects.',
  'DET-031 · 032 · 034 · 035'],
 ['Structure','WHERE the market changed hands: FVG, OB, breaker, MSS, premium/discount, the range.',
  'may NEVER claim campaign context — a 15m MSS says nothing about the 4H cause. '+
    'Context belongs to Wyckoff + the ladder.',
  'DET-041 · 044 · 047 · 052 · 055 · 057'],
 ['Wyckoff','WHAT campaign is underway: climax, spring, SOS, LPS — phase and cause.',
  'may NEVER be forced onto equilibrium — no schematic fits everything, and NO '+
    'CAMPAIGN is a valid, tradeless finding.',
  'DET-061 · 063 · 065 · 067'],
 ['Volume','WHETHER effort agrees with result: regime, divergence, churn, absorption.',
  'may NEVER originate a trade — volume confirms, contradicts, or warns. Origination belongs to playbook FSMs.',
  'DET-071 · 073 · 075 · 077'],
 ['Context','WHEN the desk may act: killzones, event windows, correlation regime.',
  'may NEVER be overridden by pattern quality — an A+ chart inside a blackout is an A+ '+
    'chart you do not trade (LAW-017).',
  'DET-081 · 083 · 085'],
 ['Options','WHETHER the instrument can carry the thesis: spread, IV band, OI walls.',
  'may NEVER approve — the family holds a veto (S22) and nothing else. A perfect contract on a '+
    'C-grade chart is still a C-grade trade.',
  'DET-091 · 093 · 095'],
];

/* ── system.health ← the detector registry ── */
EST_W('system.health',()=>{
  const fams={};EST_DETS.forEach(d=>fams[d.fam]=(fams[d.fam]||0)+1);
  const cfgBacked=EST_DETS.filter(d=>d.ckKey).length;
  /* ── estate coherence: cross-references re-verified at every render ── */
  const estChk=[
   ['detector ids unique',new Set(EST_DETS.map(d=>d.id)).size===EST_DETS.length,
    EST_DETS.length+' ids, no collisions'],
   ['every family is a known family',EST_DETS.every(d=>EST_FAMS.includes(d.fam)),
    Object.keys(fams).length+' families, all registered in the filter rail'],
   ['golden fixtures: 2 per detector',EST_DETS.every(d=>(EST_VEC[d.id]||[]).length===2),
    EST_DETS.filter(d=>(EST_VEC[d.id]||[]).length===2).length+'/'+EST_DETS.length+' carry both vectors'],
   ['tuning history complete',EST_DETS.every(d=>!!EST_TUNE[d.id]),
    'every contract states its last material retune'],
   ['config citations resolve',EST_DETS.every(d=>!d.ckKey||CONFIG[d.ckKey]!==undefined),
    cfgBacked+' ck() citations, all resolve against CONFIG (LAW-015)'],
   ['playbook detector citations resolve',
    typeof EST_PBS!=='undefined'&&EST_PBS.every(p=>p.dets.every(id=>EST_DETS.some(d=>d.id===id))),
    'all 8 FSMs cite only registered detectors'],
   ['every FSM has a management template',
    typeof EST_PB_MGMT!=='undefined'&&EST_PBS.every(p=>!!EST_PB_MGMT[p.id]),
    'post-TRIGGERED behavior pre-committed for all 8'],
   ['case files carry docket metadata',
    typeof EST_CASE_META!=='undefined'&&EST_CASES.every(c=>!!EST_CASE_META[c.id]),
    'timeline + cost-while-open on all 6 landmark cases'],
  ];
  const estPass=estChk.filter(c=>c[1]).length;
  return panel('DETECTOR REGISTRY — the deterministic estate, all '+EST_DETS.length+' contracts',
    'every promotion and veto traces to a row here; these run on all '+U.int(ck(
    'scan.universe_size'))+
    ' symbols with zero LLM calls — the funnel’s economics start in this table',
    '<div class="row" style="margin-bottom:9px"><input class="inp" placeholder="filter by id, name, '+
      'input, emission… (patches in place)" value="'+U.esc(EST_FLT.q)+
      '" data-cmdin="est.detq" style="max-width:340px">'+
    EST_FAMS.map(f=>'<button class="btn sm'+(EST_FLT.fam===f?' pri':'')+'" data-cmd="est.detfam" data-arg="'+f+
      '">'+f+(f==='ALL'?'':' '+(fams[f]||0))+'</button>').join('')+
      '</div>'+
    '<div id="est-det-host">'+EST_detTable()+'</div>')+
  panel('DETECTOR DOCTRINE — why the estate is deterministic','the boring layer is the load-bearing layer',
    '<div class="grid g4">'+
    stat('Detectors',EST_DETS.length,Object.keys(fams).length+' families · each with a named false-positive mode')+
    stat('Config-backed thresholds',cfgBacked+' of '+EST_DETS.length,'cited via ck() — the rest are versioned constants '+prov(
      'LAW-015'))+
    stat('LLM calls per detector run','0','always — the raw universe never touches a model')+
    stat('Cost per symbol-minute','$0.00006','why '+U.int(ck('scan.universe_size'))+' symbols is affordable')+
      '</div>'+
    kv('THE CONTRACT','<span style="font-size:11px">Detectors emit typed evidence objects onto the bus; '+
      'seats consume them and argue. A seat may '+
      'overrule a narrative; nothing overrules a detector reading — you retune the detector through '+
        'the court instead (LS-118 is the live example, displacement 60→65).</span>')+
    kv('FALSE-POSITIVE ACCOUNTING','<span style="font-size:11px">Every detector row names its dominant FP mode and the guard that '+
      'answers it. An FP without a guard '+
      'is an open defect; an FP the operator discovers before the registry does is a P2 against this table.</span>')+
    kv('COVERAGE HONESTY','<span style="font-size:11px">DET-077 absorption is typed INFERENCE — the demo tier has no depth '+
      'feed and says so. Precision claims scale with input quality, never ahead of it.</span>'))+
  panel('FAMILY CHARTERS — what each family may claim, and may never','lane discipline exists at the detector layer too; most bad trades are one family '+
    'answering another family’s question',
    tbl(['Family','May claim','May NEVER claim','Members'],
      EST_FAMCH.map(f=>'<tr>'+
        '<td><b style="font-size:11px">'+f[0]+'</b></td>'+
        '<td class="i1" style="font-size:10.5px">'+U.esc(f[1])+'</td>'+
        '<td class="i1" style="font-size:10.5px;color:var(--warn)">'+U.esc(f[2])+'</td>'+
        '<td class="mono" style="font-size:9px">'+f[3]+'</td></tr>').join(''))+
    '<div class="i2" style="font-size:10.5px;padding:8px 12px">'+
    'The charter is enforceable because emissions are typed: a Liquidity object carries no direction field to leak, '+
    'a Volume object carries no trigger field to fire. Type systems are cheaper than '+
      'discipline and never tired.</div>',{flush:true})+
  panel('DETECTOR CHANGE LOG — recent retunes, each with its authority','a detector changes through the court or it does not change '+prov(
    'LAW-013'),
    [['v13.2','DET-091','single NBBO snapshot → 3-sample/20s median','open-flicker false vetoes at the bell'],
     ['v13.2','DET-083','dual-source reconcile 60m → 15m','a rescheduled print slipped through a stale window'],
     ['v13.1','DET-044','touch-decay schedule formalized (1.0 / 0.5 / reject)','third-touch breakers graded as fresh'],
     ['v13.1','DET-035','composite re-baselined post BT-0428','border-band drag quantified (+0.34R vs +1.12R)'],
     ['v13.0','DET-041','entry-grade birth certificate required','chop FVGs reaching committee as entries'],
     ['v12.9','DET-032','flat median → time-of-day curve','order-of-magnitude drop in false open displacement'],
     ['pending','DET-035','promote-at 60 → 65','LS-118 — IN REVIEW, regime-split validation outstanding'],
     ['pending','DET-091','terminal veto → WAIT_FOR_SPREAD when sole blocker','LS-121 — A/B PAPER at 14/30 samples']]
    .map(r=>'<div class="kv"><span class="k">'+r[0]+' · '+r[1]+'</span><span class="v">'+
      '<span style="font-size:11px">'+U.esc(r[2])+'</span>'+
      '<div class="i2" style="font-size:10px;margin-top:2px">DEFECT IT KILLED: '+U.esc(r[3])+
        '</div></span></div>').join('')+
    '<div class="i2" style="font-size:10.5px;margin-top:6px">The V9 release discipline applies to '+
      'detectors too: no retune ships without the named defect it kills. '+
    'A tune without a defect is drift with paperwork.</div>'+
    '<div class="hr"></div>'+
    '<div class="kick" style="font-family:var(--mono);font-size:9.5px;letter-spacing:1.2px;color:var(--ink2);margin-bottom:6px">'+
      'ESTATE COHERENCE — CROSS-REFERENCES RE-VERIFIED AT THIS RENDER · '+estPass+'/'+estChk.length+'</div>'+
    tbl(['Check','State','Detail'],estChk.map(c=>'<tr'+(c[1]?'':' style="background:var(--blk-bg)"')+'>'+
      '<td style="font-size:11px">'+U.esc(c[0])+'</td>'+
      '<td>'+(c[1]?chip('HOLDS','ch-ok','✓'):chip('BROKEN','ch-blk','✕'))+'</td>'+
      '<td class="i2" style="font-size:10px">'+U.esc(c[2])+'</td></tr>').join(''))+
    '<div class="i2" style="font-size:10px;margin-top:6px">These are executed assertions over the '+
      'live registry objects, not stored claims — '+
      'edit the estate and break a cross-reference, and this table goes red at the next render. '+
      'The estate audits itself because nobody else will do it at 2am.</div>');
});

/* ═══════════ 2 · PLAYBOOK FSM REGISTRY — the machine mirror of strategy ═══════════
   Every setup is a finite-state machine over the canonical SETUP enum
   (SCANNING→CANDIDATE→FORMING→ARMED→TRIGGERED, LAW-014). Transitions are
   computable conditions citing detector ids — no state advances on narrative. */
const EST_PBS=[
 {id:'PB-01',nm:'Stacked PD Swing',regimes:'risk-on · rotation — never squeeze',
  dets:['DET-055','DET-057','DET-052','DET-047','DET-011'],
  inval:'daily close back into premium of the anchoring range — the stack broke',
  target:'opposing range extreme first, then the external pool DET-011 names',
  fsm:[{t:'SCANNING→CANDIDATE',c:'weekly + daily + 4H all read DISCOUNT (DET-055) with ladder alignment ≥ 60 (DET-057)',k:'any frame flips to premium → back to SCANNING'},
       {t:'CANDIDATE→FORMING',c:'DET-011 names a draw above with side imbalance ≥ 1.6:1',k:'draw dissolves (cluster score < 70) → CANDIDATE'},
       {t:'FORMING→ARMED',c:'4H pullback holds discount at a fresh DET-052 order block',k:'OB mitigated without reaction → SCANNING'},
       {t:'ARMED→TRIGGERED',c:'15m MSS out of the OB (DET-047 — sweep-first clause applies)',k:'MSS fails HUM-119 3-bar audit → ARMED'}],
  map:'NVDA’s weekly/daily/4H stack currently reads discount-of-range on all three frames — PB-01 '+
    'would anchor at the same 195.40 OB the live PB-02 campaign uses for its stop.'},
 {id:'PB-02',nm:'Liquidity Sweep → MSS → First Return',regimes:'all except squeeze · best in risk-on reversal windows (MMBM lineage)',
  dets:['DET-001','DET-004','DET-031','DET-032','DET-035','DET-047','DET-041','DET-081'],
  inval:'close back inside the swept range (HUM-119 3-bar) or the entry FVG traded through',
  target:'T1 nearest pool · T2 the measured/equal-highs pool — the 5R level '+'(risk.min_rr)',
  fsm:[{t:'SCANNING→CANDIDATE',c:'untaken pool (DET-001/004) sits inside HTF discount (DET-055)',k:'pool taken by gap-through → SCANNING (CONSUMED_BY_GAP)'},
       {t:'CANDIDATE→FORMING',c:'the sweep prints: pool taken with effort — DET-004 fire + DET-071 elevated',k:'sweep runs > 3 bars without rejection → breakout, label flips, stand down'},
       {t:'FORMING→ARMED',c:'MSS with displacement: DET-047 + DET-035 ≥ 60 on the shift bar',k:'no MSS within 12 bars of the sweep → the trap failed → SCANNING'},
       {t:'ARMED→TRIGGERED',c:'FIRST return into the displacement FVG (DET-041) inside a killzone (DET-081)',k:'FVG traded through or second return → spent → SCANNING'}],
  map:'This IS the live NVDA campaign — PKT-2231 in your queue is this FSM at TRIGGERED, '+
    'stamped step by step below.'},
 {id:'PB-03',nm:'Volatility Reclaim',regimes:'post-event · risk-off snapbacks — forbidden inside the DET-083 window itself',
  dets:['DET-071','DET-034','DET-044','DET-075'],
  inval:'a second shock leg — RVOL re-expands past 3× against the reclaim',
  target:'mean of the pre-shock range first, then the opposing extreme',
  fsm:[{t:'SCANNING→CANDIDATE',c:'RVOL shock regime (DET-071 > 3×) with range expansion beyond prior value',k:'shock decays without structure → SCANNING'},
       {t:'CANDIDATE→FORMING',c:'churn subsides and a reclaim bar closes back inside prior value (DET-034 grammar)',k:'value rejection — close back outside → CANDIDATE'},
       {t:'FORMING→ARMED',c:'breaker forms at the failure origin (DET-044) with trapped side confirmed',k:'breaker traded through on close → SCANNING'},
       {t:'ARMED→TRIGGERED',c:'first retest holds the breaker on diminishing volume',k:'retest arrives on RISING volume → distribution costume → SCANNING'}],
  map:'Overlay: had NVDA’s 10:14 sweep been a full RVOL-shock flush, PB-03 would wait for value '+
    'reclaim instead of the FVG return — same levels, later '+
    'entry, wider stop, and the 5R math would fail at T2. The FSMs disagree so the desk doesn’t have to.'},
 {id:'PB-04',nm:'Wyckoff LPS',regimes:'any — campaigns outrank sessions; the slowest and highest-conviction book',
  dets:['DET-061','DET-063','DET-065','DET-067','DET-073'],
  inval:'LPS undercuts the spring low on rising volume — the campaign read was wrong',
  target:'the P&F cause count (see Cause & Targets in research.wyckoff) — the count IS the target logic',
  fsm:[{t:'SCANNING→CANDIDATE',c:'SC + AR printed (DET-061 survives its 5-bar revocation window); range declared',k:'no AR → SC label revoked → SCANNING'},
       {t:'CANDIDATE→FORMING',c:'spring + test (DET-063): effort into the low, result rejects it, test on lower volume',k:'HUM-119 3-bar breach → breakdown, not spring → SCANNING'},
       {t:'FORMING→ARMED',c:'SOS out of the creek (DET-065) with both expansions and no DET-073 divergence',k:'SOS into a larger frame’s supply (DET-057 veto) → FORMING at half weight'},
       {t:'ARMED→TRIGGERED',c:'LPS holds above the spring on diminishing per-dip volume (DET-067)',k:'rising-volume “LPS” → LPSY suspicion → campaign review, not entry'}],
  map:'NVDA’s 4H is currently read as re-accumulation phase D: spring 10:14, test 10:24 at 0.6× '+
    'volume, LPS forming above 196.30 — PB-04 and PB-02 are the '+
    'same tape at two tempos, which is why their targets agree at 210.'},
 {id:'PB-05',nm:'RS Continuation',regimes:'risk-on ONLY — this playbook is the regime trade; it dies first when breadth turns',
  dets:['DET-055','DET-034','DET-047','DET-081','DET-085'],
  inval:'RS percentile drops below 70 mid-trade — leadership lost is thesis lost, exit is mechanical',
  target:'prior high pool, then measured extension of the anchoring leg',
  fsm:[{t:'SCANNING→CANDIDATE',c:'RS ≥ 85th percentile vs index 20d (S09 rank) with the index itself in uptrend',k:'index uptrend breaks → the whole book stands down'},
       {t:'CANDIDATE→FORMING',c:'leader pulls back to discount (DET-055) while the index makes equal lows — relative divergence',k:'leader makes new relative lows → demoted, RS was stale'},
       {t:'FORMING→ARMED',c:'DET-034 follow-through off the discount zone; cluster exposure clear (DET-085)',k:'cluster already at cap → ARMED blocked by S33, honestly'},
       {t:'ARMED→TRIGGERED',c:'15m MSS in trend direction (DET-047), killzone preferred (DET-081)',k:'trigger outside killzone → half size by doctrine or wait'}],
  map:'NVDA RS sits at the 94th percentile vs QQQ — PB-05 would have entered the same 196.80 zone on '+
    'the relative-divergence read alone; the desk took PB-02 '+
    'because the sweep gave it a cheaper, harder invalidation (194.10 vs a 4H swing).'},
 {id:'PB-07',nm:'Demand Mitigation',regimes:'rotation · range — weak in high-vol trend where zones get run without ceremony',
  dets:['DET-052','DET-041','DET-075','DET-047'],
  inval:'zone traded through on a closing basis — mitigated zones are spent, exactly like pools',
  target:'origin high of the displacement leg that built the zone, then the external pool',
  fsm:[{t:'SCANNING→CANDIDATE',c:'fresh DET-052 demand born of displacement, unmitigated, correct side of equilibrium',k:'zone ages past 10 sessions untested → decayed → SCANNING'},
       {t:'CANDIDATE→FORMING',c:'first return into the zone — mitigation begins',k:'gap through the zone → spent without a trade → SCANNING'},
       {t:'FORMING→ARMED',c:'churn defends the zone (DET-075): sellers spend, price holds',k:'no churn — zone slices → the demand evaporated → SCANNING'},
       {t:'ARMED→TRIGGERED',c:'LTF MSS out of the zone (DET-047)',k:'MSS fails → one more test allowed (touch 2 at half weight), then done'}],
  map:'The 195.40 NVDA order block IS a PB-07 object — the live campaign uses it as the stop anchor '+
    'rather than the entry because PB-02’s FVG return paid '+
    'first. One structure, two playbooks, one packet: the FSMs share detectors, never conclusions.'},
 {id:'PB-08',nm:'Post-Earnings Drift',regimes:'any except risk-off extreme · entries only AFTER the DET-083 window exits',
  dets:['DET-083','DET-093','DET-071','DET-034'],
  inval:'close below day-1 low — the archetype was misclassified and the drift thesis dies with it',
  target:'measured move of the gap leg · drift window capped at 15 sessions, time-stop enforced',
  fsm:[{t:'SCANNING→CANDIDATE',c:'print released; S19 classifies the archetype (implied vs realized gap read); DET-083 window EXITED',k:'inside the window → nothing exists yet by law (LAW-017)'},
       {t:'CANDIDATE→FORMING',c:'beat-and-raise-leader archetype: day-1 range holds VWAP into the close',k:'beat-and-fade signature (gap into supply, red close) → the trap archetype → stand down'},
       {t:'FORMING→ARMED',c:'day-2/3 pullback holds day-1 value; IV crush complete (DET-093 band normalized)',k:'IV still event-bloated → premium pays the crush tax → wait or use stock'},
       {t:'ARMED→TRIGGERED',c:'break of day-1 high with DET-034 follow-through',k:'break on dead RVOL (DET-071 < 1) → drift without sponsorship → ARMED'}],
  map:'NVDA reports T+21d — PB-08 is dormant on it by definition until after the print. The worked '+
    'levels below show what the drift math would need: a '+
    'post-print day-1 range whose measured move clears 5R against a day-1-low stop, or PB-08 files NO_TRADE.'},
 {id:'PB-09',nm:'Breaker Retest',regimes:'rotation · risk-on — the current AMD candidate is this FSM sitting at FORMING',
  dets:['DET-044','DET-047','DET-011','DET-091'],
  inval:'close back through the breaker — the trap failed to spring and the trapped side escaped',
  target:'trapped-side stops first (relative equal highs), then the weekly pool',
  fsm:[{t:'SCANNING→CANDIDATE',c:'breakout fails; origin block identified (DET-044 candidate) with a trapped side',k:'no trapped side — the breakout just faded → LAW-003 downgrade'},
       {t:'CANDIDATE→FORMING',c:'reclaim closes through the block; DET-011 confirms the stop cluster above',k:'reclaim on a wick only → raids are not verdicts → CANDIDATE'},
       {t:'FORMING→ARMED',c:'breaker holds its first retest',k:'retest slices on close → SCANNING, breaker dead'},
       {t:'ARMED→TRIGGERED',c:'LTF MSS off the breaker AND the contract gates clear — DET-091 spread inside cap',k:'chart triggers, contract vetoed → WAIT, not entry (the AMD lesson, OPT-007 → LS-121)'}],
  map:'AMD is this FSM live: 170.60 failure trap, breaker holding, chart A-quality — and TRIGGERED is '+
    'blocked at the last transition by DET-091 (175C spread '+
    '8.9%). The FSM encoding is why the desk can say precisely WHERE it is stuck.'},
];
/* ── post-TRIGGERED management templates + dominant failure per machine ── */
const EST_PB_MGMT={
 'PB-01':{tpl:'T1 opposing minor: 25% off, stop→BE · T2 range extreme: 50%, stop→T1 · T3 external pool: runner '+
   'on 4H swings · time-stop: no T1 in 3 sessions → flatten',
          fail:'the stack un-stacks quietly — one frame flips premium and the operator “waits for '+
            'confirmation” of what already happened',tag:'ladder-drift'},
 'PB-02':{tpl:'25/50/75 doctrine: T1 25% + BE · T2 50% + stop→T1 (the 5R level) · T3 runner trailing 5m swings '+
   '· time-stop: no T1 by 14:00 → flatten (PKT-2231 carries exactly this)',
          fail:'entering the displacement candle instead of the first return — the #1 journal tag, '+
            '31 cases, the reason LC-001 exists',tag:'chasing'},
 'PB-03':{tpl:'T1 mean of pre-shock range: 33% · T2 opposing value edge: 33%, stop→BE · rest on 15m structure '+
   '· hard time-stop 90m — reclaims that stall are re-shocks loading',
          fail:'catching the second shock leg because the first reclaim “almost held” — shock '+
            'regimes get two legs more often than one',tag:'knife-catch'},
 'PB-04':{tpl:'scale at SOS retest, LPS confirm, and count-zone approach · stop below spring low, never '+
   'tightened into the noise · campaign horizon: sessions to weeks, sized for it (LAW-016)',
          fail:'treating a re-distribution shelf as an LPS — the rising-volume dip is the tell the grammar exists to catch',tag:'costume-LPS'},
 'PB-05':{tpl:'T1 prior high pool: 25% + BE · T2 measured extension: 50% · runner while RS ≥ 85th · MECHANICAL '+
   'exit the session RS prints < 70 — leadership lost is thesis lost, no debate clause',
          fail:'holding through an RS breakdown because the chart “still looks fine” — the chart '+
            'lags the rank by exactly the losing stretch',tag:'stale-leadership'},
 'PB-07':{tpl:'T1 origin high: 33% + BE · T2 external pool: 33% · zone re-entry allowed ONCE (touch 2, half '+
   'size) · mitigated-through on close = full exit, the zone is spent',
          fail:'averaging into a slicing zone — mitigation and evaporation look identical for the first three minutes',tag:'zone-denial'},
 'PB-08':{tpl:'T1 gap-fill measured half: 25% · T2 full measured move: 50% · drift runner max 15 sessions, '+
   'then time-stop regardless · never through the NEXT event window (DET-083 re-arms)',
          fail:'trading the archetype before day-1 closes — beat-and-raise and beat-and-fade are indistinguishable at 10:00',tag:'archetype-rush'},
 'PB-09':{tpl:'T1 trapped-side stops: 33% + BE · T2 weekly pool: 33% · runner on 1H swings · contract re-check '+
   'at every add point — the gate that blocked entry can re-block scale-ins (DET-091)',
          fail:'entering on the chart while the contract gate is red — the AMD temptation, live in '+
            'the queue right now as PKT-2234',tag:'contract-blindness'},
};
CMD.define({id:'est.pb',label:'Playbook FSM',purpose:'Full FSM walkthrough for one playbook, with the NVDA worked example on live levels',audit:false,run:a=>{
  const pb=EST_PBS.find(x=>x.id===a);if(!pb)return;
  const s=symBy('NVDA'),L=s&&s.levels;
  let worked='';
  if(L&&L.entry){
    const den=(L.entry-L.stop)||1e-9,r1=(L.t1-L.entry)/den,r2=(L.t2-L.entry)/den,r3=(L.t3-L.entry)/den;
    worked=kv('MAPPING','<span style="font-size:11.5px">'+U.esc(pb.map)+'</span>')+
     kv('LIQUIDITY FRAME','<span style="font-size:11px">below: '+U.esc(L.poolBelow||'—')+' · above (the draw): '+U.esc(L.poolAbove||'—')+
       '</span>')+
     kv('PLAN ARITHMETIC','<span class="mono" style="font-size:11px">E '+U.fmt(L.entry)+' · TRUE stop '+U.fmt(L.stop)+
       ' · risk/share $'+U.fmt(L.entry-L.stop,2)+
       '</span>')+
     kv('R LADDER','<span class="mono" style="font-size:11px">T1 '+U.fmt(L.t1)+' = '+U.fmt(r1,2)+
       'R · T2 '+U.fmt(L.t2)+
       ' = <b class="up">'+U.fmt(r2,2)+
       'R</b> · T3 '+U.fmt(L.t3)+' = '+U.fmt(r3,2)+'R</span> — the 5R contract clears at '+(r2>=5?'T2':r3>=5?'T3':'<span class="dn">NO LEVEL — this plan would be REJECTED</span>')+
       ' '+prov('risk.min_rr'))+
     (pb.id==='PB-02'
       ?kv('THE ACTUAL TAPE','<span style="font-size:11px">Asia low 194.30 swept 10:14 (DET-004) → 5m MSS 10:18 through '+
         '196.30, displacement 74/100 (DET-047 + '+
         'DET-035) → first FVG return 195.90–196.30 taken 10:26 (DET-041, killzone open per DET-081). '+
           'This is PKT-2231 — grade A-, live in your queue.</span>')
       :'<div class="banner info"><span class="bico">i</span><div><b>Classroom overlay:</b> '+
         'NVDA’s live tape is a PB-02 campaign. The '+
         'numbers above are its real current plan levels re-used for arithmetic; the '+pb.id+
           ' mapping is instructional, not a live signal. The desk never runs two FSMs into one entry.</div></div>');
  }else{
    worked='<div class="empty"><div class="e1">NVDA LEVELS UNAVAILABLE</div>Worked example withheld rather '+
      'than faked — computed truth or nothing.</div>';
  }
  UI.drawer('<div class="dhead"><span class="dt">'+pb.id+' · '+U.esc(pb.nm)+'</span><span class="pill">FSM over the canonical SETUP enum '+
    '(LAW-014)</span><button class="dx" data-cmd="ui.closeDrawer">ESC</button></div>'+
   '<div class="dbody">'+
   kv('HOME REGIMES','<span style="font-size:11.5px">'+U.esc(pb.regimes)+'</span>')+
   kv('REQUIRED DETECTORS','<span class="mono" style="font-size:10.5px">'+pb.dets.join(' · ')+
     '</span> <span class="i2" style="font-size:10px">— each is a row in System → Health '+
     '→ Detector Registry</span>')+
   (function(){
     /* scenario-memory join: only where the grid actually carries this machine — no invented rows */
     const rowNm=pb.id==='PB-02'?'MMBM Reversal':pb.id==='PB-09'?'Breaker Retest':null;
     if(!rowNm||typeof SCENARIO==='undefined')return kv('SCENARIO MEMORY',
       '<span class="i2" style="font-size:11px">no expectancy row yet — the 1.28M-replay '+
         'grid predates this machine’s codification; '+
       'the nightly batch backfills registered FSMs in id order</span>');
     const head=SCENARIO.grid[0],row=SCENARIO.grid.find(r=>r[0]===rowNm);
     if(!row)return'';
     return kv('SCENARIO MEMORY','<span class="mono" style="font-size:10.5px">'+
       head.slice(1).map((rg,i)=>rg+' '+row[i+1]).join(' · ')+
       '</span> <span class="i2" style="font-size:10px">— from the '+SCENARIO.rows+'-replay grid (Markets → Regime); '+
       'the desk trades only cells that survive</span>');
   })()+
   '<div class="hr"></div>'+
   '<div class="kick" style="font-family:var(--mono);font-size:9.5px;letter-spacing:1.2px;color:var(--ink2);margin-bottom:6px">THE MACHINE — EVERY TRANSITION, ITS CONDITION, AND ITS KILL</div>'+
   pb.fsm.map((f,i)=>'<div class="banner '+(i===3?'gold':'info')+'" style="margin-bottom:6px"><span class="bico">'+(i===3?'◆':'▸')+
     '</span><div><b class="mono" style="font-size:10.5px">'+U.esc(f.t)+
     '</b><div class="i1" style="font-size:11px;margin-top:3px">CONDITION: '+U.esc(f.c)+
     '</div><div class="i2" style="font-size:10.5px;margin-top:2px;color:var(--warn)">KILL: '+U.esc(f.k)+
       '</div></div></div>').join('')+
   kv('INVALIDATION (post-trigger)','<span style="font-size:11.5px;color:var(--warn)">'+U.esc(pb.inval)+
     '</span> '+prov('LAW-001'))+
   kv('TARGET LOGIC','<span style="font-size:11.5px">'+U.esc(pb.target)+'</span> '+prov('LAW-002'))+
   (EST_PB_MGMT[pb.id]?
     kv('MANAGEMENT TEMPLATE','<span style="font-size:11px;line-height:1.6">'+U.esc(EST_PB_MGMT[pb.id].tpl)+
       '</span> — pre-committed; the FSM runs it, the mood does not')+
     kv('DOMINANT FAILURE','<span style="font-size:11px;color:var(--warn)">'+U.esc(EST_PB_MGMT[pb.id].fail)+
       '</span> <span class="tag">'+EST_PB_MGMT[pb.id].tag+
       '</span>')
    :'')+
   '<div class="hr"></div>'+
   '<div class="kick" style="font-family:var(--mono);font-size:9.5px;letter-spacing:1.2px;color:var(--ink2);margin-bottom:6px">WORKED EXAMPLE — NVDA, '+
     'ACTUAL CURRENT LEVELS <span class="demo-wm">demo twin</span></div>'+
   worked+
   '</div>');}});

/* ── research.structure ← the playbook FSM registry ── */
EST_W('research.structure',()=>{
  return panel('PLAYBOOK FSM REGISTRY — 8 machines, one enum','the machine mirror of the strategy layer: SCANNING→CANDIDATE→FORMING→ARMED→TRIGGERED '+prov(
    'LAW-014')+
    ' · no state advances on narrative — every transition cites a detector · click a row for the full walkthrough',
    tbl(['PB','Name','FSM chain — per-transition condition','Detectors','Invalidation','Target logic','Home regimes'],
      EST_PBS.map(pb=>'<tr class="click" data-cmd="est.pb" data-arg="'+pb.id+'">'+
        '<td class="mono" style="font-size:10.5px"><b>'+pb.id+'</b></td>'+
        '<td style="font-size:11px"><b>'+U.esc(pb.nm)+'</b></td>'+
        '<td class="mono" style="font-size:9px;line-height:1.7">'+pb.fsm.map(f=>'<span style="color:var(--info)">'+U.esc(f.t.split(
          '→')[1])+'</span> ← '+U.esc(f.c)).join('<br>')+
          '</td>'+
        '<td class="mono" style="font-size:9px">'+pb.dets.join('<br>')+'</td>'+
        '<td class="i2" style="font-size:10px;color:var(--warn)">'+U.esc(pb.inval)+'</td>'+
        '<td class="i2" style="font-size:10px">'+U.esc(pb.target)+'</td>'+
        '<td class="i2" style="font-size:10px">'+U.esc(pb.regimes)+'</td></tr>').join('')),{flush:true})+
  panel('FSM DOCTRINE — why setups are machines','a setup that cannot be encoded cannot be audited, backtested, or trusted',
    '<div class="grid g4">'+
    stat('Machines',EST_PBS.length,'over one canonical 5-state enum — no bespoke states, ever')+
    stat('Transitions','32','each with a computable condition AND a named kill path')+
    stat('Detector citations',[...new Set(EST_PBS.flatMap(p=>p.dets))].length+' distinct','every condition resolves to a registry row — zero vibes-based transitions')+
    stat('Live right now','NVDA PB-02 @ TRIGGERED','TSLA PB @ ARMED · AMD PB-09 @ FORMING (contract-blocked)')+
      '</div>'+
    kv('ONE-WAY LAW','<span style="font-size:11px">Transitions only advance on evidence and only reset to SCANNING — '+
      'there is no “almost ARMED.” A kill '+
      'condition fires, the state falls, and the reason lands in the ledger. The FSM '+
        'cannot be argued with mid-formation, which is '+
      'precisely its value at 10:26 with the tape moving.</span>')+
    kv('WHERE STUCK IS VISIBLE','<span style="font-size:11px">Encoding AMD as PB-09 is why the desk can say “blocked '+
      'at ARMED→TRIGGERED by DET-091” instead of '+
      '“waiting on AMD.” A stuck FSM names its blocker; a stuck narrative names a feeling.</span>')+
    kv('BACKTEST CONTRACT','<span style="font-size:11px">S30 replays these exact transition rules — the FSM in '+
      'production and the FSM in backtest are the '+
      'same code path, which is what makes the parity gate (BT↔live divergence) meaningful '+
        'instead of decorative.</span>'))+
  panel('TRANSITION AUDIT — the promoted set, machine-stated','every promoted symbol IS one of these machines in one of these states — read live from the '+
    'store, stamped where the tape stamped it',
    tbl(['Sym','Machine','State now','Last transition evidence','What advances it','What kills it'],
      SYMS.filter(s2=>s2.levels&&s2.levels.entry).map(s2=>{
        const pbGuess=s2.sym==='NVDA'?'PB-02':s2.sym==='AMD'?'PB-09':s2.sym==='TSLA'?'PB-02 (OTE variant)':s2.sym==='META'?'PB-02 (window class)':'PB-01';
        return'<tr>'+
        '<td class="mono"><b>'+s2.sym+'</b></td>'+
        '<td class="i1" style="font-size:10.5px">'+pbGuess+' · '+U.esc(s2.setup)+'</td>'+
        '<td>'+lc(s2.fsm)+'</td>'+
        '<td class="i2" style="font-size:10px">'+U.esc(s2.sym==='NVDA'?'sweep 10:14 → MSS 10:18 (74/100) → first return 10:26 — chain complete, packet live':(s2.unmet[0]||'conditions met'))+
          '</td>'+
        '<td class="i1" style="font-size:10px">'+U.esc(s2.fsm==='TRIGGERED'?'nothing — the machine is done; the decision is yours now (LAW-007)':s2.unmet.length?s2.unmet.join(
          ' · '):'next detector fire')+
          '</td>'+
        '<td class="i2" style="font-size:10px;color:var(--warn)">'+U.esc(s2.sym==='NVDA'?'5m close back below 195.90':s2.sym==='TSLA'?'daily close below 404.20 OTE floor':s2.sym==='AMD'?'close back through the 170.60 breaker':'HTF range resolution against bias')+
          '</td></tr>'}).join(''))+
    '<div class="i2" style="font-size:10.5px;padding:8px 12px">'+
    'The audit line is the FSM’s whole value: at any moment, every candidate can state its machine, '+
      'its state, its evidence, and its kill — '+
    'in detector ids and prices, not adjectives. A candidate that cannot fill this row is not a candidate.</div>',{flush:true})+
  panel('SPENT OBJECTS LEDGER — one decay law for every structure object','pools, zones, breakers and FVGs all die the same way: they are consumed by use — nothing here ever re-arms',
    tbl(['Object','Born when','Spent when','Partial-use schedule','Re-arm policy'],[
     ['Liquidity pool (DET-001/004)','2+ qualified touches / untouched session extreme','the sweep — one raid consumes the magnet forever',
       'none — pools are binary: armed or spent','NEVER. The trapped side the sweep created persists; the magnet does not'],
     ['FVG (DET-041)','displacement leg leaves a 3-bar imbalance','traded through on any basis (wick-inclusive)',
       'first return = the entry · second return = context · third = exit liquidity','NEVER — a “refilled” gap is a new object only if a new displacement births it'],
     ['Order block (DET-052)','last opposing candle before certified displacement','mitigated through on a closing basis',
       'touch 1 full weight · touch 2 half · touch 3 rejected','NEVER — AUT-116’s catalyst-reset is the only exception under evidence, and it mints a NEW zone'],
     ['Breaker (DET-044)','failed breakout origin reclaimed on close','close back through — the trap released its prisoners',
       'same 1.0 / 0.5 / reject schedule as zones','NEVER — an escaped trapped side cannot be re-trapped at the same price'],
     ['Draw / cluster (DET-011)','2+ independent pool sources agree','constituent pools spent, or 5 sessions untested',
       'weight halves every 5 untested sessions','recomputed continuously — the only object that refreshes, because it is derived, not placed'],
    ].map(r=>'<tr>'+
      '<td><b style="font-size:11px">'+r[0]+'</b></td>'+
      '<td class="i1" style="font-size:10px">'+U.esc(r[1])+'</td>'+
      '<td class="i1" style="font-size:10px;color:var(--warn)">'+U.esc(r[2])+'</td>'+
      '<td class="i2" style="font-size:10px">'+U.esc(r[3])+'</td>'+
      '<td class="i2" style="font-size:10px">'+U.esc(r[4])+'</td></tr>').join(''))+
    '<div class="i2" style="font-size:10.5px;padding:8px 12px">'+
      'The unification matters under fire: when price returns to a level at 15:40, the only question '+
        'is WHICH ledger state the object is in — '+
      'not a debate about whether “the level still counts.” Spent is spent, uniformly, across every '+
        'object family, and the packet cites the ledger state, not the operator’s hope.</div>',{flush:true});
});

/* ═══════════ 3 · WYCKOFF ESTATE — nine tests, cause arithmetic, conduct ═══════════ */
/* the nine buying tests, evaluated by stated proxy against the demo twin’s fields */
function EST_nine(s){
  if(!s)return[];
  const L=s.levels||{},den=(L.entry&&L.stop)?(L.entry-L.stop):0;
  const r2=den>0?(L.t2-L.entry)/den:0;
  return[
   {n:1,test:'Downside objective accomplished',wy:'The P&F count to the downside has been fulfilled — the decline has run its course.',
    proxy:'pool below marked TAKEN in the liquidity map (sweep-of-lows stands in for a fulfilled downside count)',
    read:L.poolBelow||'no pool named',pass:/TAKEN/i.test(L.poolBelow||'')},
   {n:2,test:'Preliminary support / climax / test printed',wy:'PS, SC and ST are on the chart — the transfer from weak hands has begun.',
    proxy:'a structural stop exists below (stop > 0) and the FSM has advanced past CANDIDATE',
    read:'stop '+(L.stop?U.fmt(L.stop):'—')+' · FSM '+s.fsm,pass:!!L.stop&&['FORMING','ARMED',
      'TRIGGERED'].includes(s.fsm)},
   {n:3,test:'Activity bullish',wy:'Volume expands on rallies and shrinks on reactions.',
    proxy:'RVOL ≥ 1.5× the session-normalized baseline (the twin cannot split rally/reaction volume — said plainly)',
    read:'RVOL '+U.fmt(s.rvol,1)+'×',pass:s.rvol>=1.5},
   {n:4,test:'Downward stride broken',wy:'The supply line of the decline has been penetrated.',
    proxy:'day change positive — the cheapest honest stand-in for a broken downtrend on twin data',
    read:U.pct(s.chg),pass:s.chg>0},
   {n:5,test:'Higher supports',wy:'Reactions hold at successively higher levels.',
    proxy:'price holding at or above the entry zone (px ≥ entry × 0.995) with an entry defined',
    read:L.entry?U.fmt(s.px)+' vs entry '+U.fmt(L.entry):'no entry defined',pass:!!L.entry&&s.px>=L.entry*0.995},
   {n:6,test:'Higher tops',wy:'Rallies carry to successively higher levels.',
    proxy:'day change ≥ +0.5% with a LONG bias on record',
    read:U.pct(s.chg)+' · bias '+s.bias,pass:s.chg>=0.5&&s.bias==='LONG'},
   {n:7,test:'Stock stronger than the market',wy:'The issue is more responsive on rallies and more resistant on reactions than the index.',
    proxy:'RS percentile ≥ 70 vs QQQ 20d (S09 rank — this one is a real relative measure, not a proxy)',
    read:'RS '+s.rs+'th pct',pass:s.rs>=70},
   {n:8,test:'Base forming — cause built',wy:'A horizontal price line of sufficient length exists to support an advance.',
    proxy:'a named playbook structure beyond SCANNING — the FSM itself is the base detector',
    read:s.setup+' · '+s.fsm,pass:s.fsm!=='SCANNING'},
   {n:9,test:'Profit at least 3× the risk',wy:'The estimated upside must be a multiple of the indicated risk.',
    proxy:'computed live from plan levels: (T2 − entry) ÷ (entry − stop) ≥ 3 — this desk’s own '+
      'bar is 5R, stricter than Wyckoff’s',
    read:den>0?U.fmt(r2,2)+'R at T2':'no plan levels',pass:den>0&&r2>=3},
  ];
}
/* ── per-test depth: what Wyckoff meant · the tape signature · the classic FP · this desk’s stricter analogue ── */
const EST_NINE_DEEP={
 1:{meant:'The decline projected by the distribution count above has been fully paid — sellers '+
   'got everything the cause owed them.',
    tape:'the terminal flush lands ON a measured objective or a major pool and rejects — the NVDA '+
      'Asia-low sweep at a session extreme is the intraday-scale rhyme',
    fptell:'declaring the objective “close enough” 3% early because you want the trade — the '+
      'count is arithmetic, not a mood',
    desk:'the desk requires the pool to be marked TAKEN by DET-004/001, not merely approached — an '+
      'approach is an invitation to a lower price'},
 2:{meant:'The stopping action is on the chart in sequence: someone with size began absorbing the decline, publicly.',
    tape:'PS volume swell → SC extreme bar closing off the lows → AR vacuum rally → ST on lighter volume; '+
      'order matters more than any single bar',
    fptell:'labeling every big red bar “SC” in a downtrend — without the AR within 5 bars, '+
      'DET-061 revokes the label in the ledger',
    desk:'the FSM analogue: a structural stop must EXIST below (the stopping action defines '+
      'it) before any state past CANDIDATE'},
 3:{meant:'Effort is arriving on the side of the campaign: rallies draw volume, reactions starve it.',
    tape:'ascending volume ridges under advances, shrinking dribble on dips — visible at a glance on the volume pane',
    fptell:'total volume up because of an unrelated catalyst — participation is not the same as SPONSORSHIP',
    desk:'proxy honesty: the twin reads RVOL ≥ 1.5× only; the production tier splits '+
      'rally/reaction volume per DET-071’s session curve'},
 4:{meant:'The mechanical downtrend is broken — the supply line that contained every rally has '+
   'been penetrated with intent.',
    tape:'a close through the supply line WITH displacement (DET-031 grammar), not a drift '+
      'across a decayed line nobody defends',
    fptell:'penetration on shrinking volume into overhead supply — the line broke because '+
      'sellers left, not because buyers arrived',
    desk:'the desk reads stride through structure, not lines: a qualified MSS (DET-047) is '+
      'the computable form of this test'},
 5:{meant:'Each reaction bottoms above the last — demand is raising its bid, not defending one level.',
    tape:'a staircase of higher swing lows, each printed with a lighter dip than the last (DET-067 grammar)',
    fptell:'two higher lows made of overlapping chop — higher supports need SEPARATED swings the ladder can certify',
    desk:'the FSM analogue is zone-hold: price at or above the entry zone after the trigger; losing the '+
      'zone resets the machine, not the story'},
 6:{meant:'Rallies are reaching — each push closes ground above the last, confirming demand '+
   'can move price, not just hold it.',
    tape:'expansion legs that CLOSE near their highs; the advance is doing work, not wicking '+
      'into supply and retreating',
    fptell:'higher highs by wick only — raids above the range are test 6’s counterfeit (and DET-063’s business)',
    desk:'the desk demands the draw be REACHED on a closing basis before a target counts as '+
      'achieved — wicks pay nobody'},
 7:{meant:'The issue outruns the market both ways: more responsive on rallies, more resistant on reactions.',
    tape:'the RS line makes new highs BEFORE price does; on index red days the issue closes flat or green',
    fptell:'RS “strength” that is only the sector rising — measure against BOTH the index and '+
      'the sector, or crown nothing',
    desk:'S09’s 20d percentile vs QQQ, live in every packet; PB-05 makes this single test into an entire machine'},
 8:{meant:'A cause of sufficient width exists — time and volume spent sideways that the markup can later cash.',
    tape:'a horizontal congestion the P&F can count, with the composite grammar (SC→spring→test) inside it',
    fptell:'any consolidation called a base — a drift channel has width but no cause; no stopping action, no count',
    desk:'the Cause & Targets panel above does the arithmetic on this test: 9 columns × 3 boxes × the unit, or WATCH'},
 9:{meant:'The projected reward must be a multiple of the indicated risk — Wyckoff demanded 3:1 before commitment.',
    tape:'the count objective sits multiples away from the stopping-action low that defines the risk',
    fptell:'reward measured to a hope, risk measured to a convenience — both ends of the ratio must be STRUCTURAL prices',
    desk:'this desk’s floor is 5R against the TRUE stop '+'(LAW-004, locked) — stricter than the master, because leverage and slippage were not his problems'},
};
CMD.define({id:'est.test',label:'Nine-tests deep dive',purpose:'Full doctrine for one Wyckoff buying test — meaning, tape signature, classic false '+
  'positive, and this desk’s analogue',audit:false,run:a=>{
  const n=+a,deep=EST_NINE_DEEP[n];if(!deep)return;
  const s=symBy(S.sym);
  const t=(EST_nine(s)||[]).find(x=>x.n===n);
  UI.drawer('<div class="dhead"><span class="dt">TEST '+n+' OF 9 · '+(t?U.esc(t.test):'')+'</span>'+
    '<span class="pill">Wyckoff buying tests · deterministic proxy tier</span>'+
    '<button class="dx" data-cmd="ui.closeDrawer">ESC</button></div>'+
   '<div class="dbody">'+
   (t?kv('VERDICT ON '+U.esc(s?s.sym:'—'),(t.pass?chip('PASS','ch-ok','✓'):chip('FAIL','ch-neg','✕'))+
     ' <span class="mono" style="font-size:10.5px">'+U.esc(t.read)+'</span> <span class="demo-wm">demo twin</span>'):'')+
   kv('WHAT WYCKOFF MEANT','<span style="font-size:11.5px;line-height:1.6">'+U.esc(deep.meant)+'</span>')+
   kv('THE TAPE SIGNATURE','<span style="font-size:11.5px;line-height:1.6">'+U.esc(deep.tape)+'</span>')+
   '<div class="banner warn" style="margin:8px 0"><span class="bico">!</span><div><b>THE CLASSIC FALSE POSITIVE</b>'+
     '<div class="i1" style="font-size:11px;margin-top:3px">'+U.esc(deep.fptell)+'</div></div></div>'+
   kv('THIS DESK’S ANALOGUE','<span style="font-size:11.5px;line-height:1.6">'+U.esc(deep.desk)+'</span>')+
   (t?kv('PROXY USED IN THE TABLE','<span class="i2" style="font-size:11px">'+U.esc(t.proxy)+'</span>'):'')+
   '<div class="i2" style="font-size:10.5px;margin-top:8px">The nine tests are a checklist against '+
     'eagerness, not a scoring system for hope: '+
     'a test you cannot articulate failing is a test you have not run.</div>'+
   '</div>');}});
const EST_CONDUCT=[
 'You are trading against professionals who planned this session before you woke up — '+
   'act accordingly or stand aside.',
 'Never take a position without knowing the exact price at which you are wrong (LAW-001); hope is not a level.',
 'The market does not know you exist, so your entry price is sentimental to exactly one person in it.',
 'Judge the market by its own action, never by the news that explains the action afterward.',
 'When in doubt, do nothing — doubt is information, and NO_TRADE is a journaled position on this desk (LAW-018).',
 'A stop-out is the price of certainty, paid once; a widened stop is the same bill '+
   'with interest, paid in installments.',
 'Trade the campaign, not the wiggle: reasons live on the higher timeframe, triggers '+
   'on the lower — never the reverse (LAW-016).',
 'Volume is the effort, price is the result; when they disagree, believe the '+
   'disagreement over your thesis (DET-073).',
 'Never meet a margin call — it is the market’s written verdict on the position, and '+
   'you accept verdicts by flattening.',
 'Keep the record of every operation and read it weekly: the ledger is the only '+
   'teacher on the floor that does not flatter.',
];
EST_W('research.wyckoff',()=>{
  const s=symBy(S.sym);
  const tests=EST_nine(s);
  const passed=tests.filter(t=>t.pass).length;
  const verdict=passed===9?'<span class="up">9/9 — campaign long eligible (all tests answered)</span>':passed>=7?'<span style="color:var(--warn)">'+passed+
    '/9 — partial: the campaign is forming, the entry is not earned yet</span>':'<span class="dn">'+passed+
      '/9 — no campaign: fewer than seven tests is a WATCH at best</span>';
  let h=panel('THE NINE TESTS — Wyckoff’s buying tests on '+(s?s.sym:'—'),'each test names its ORIGINAL requirement and the deterministic proxy used against '+
    'the demo twin’s fields — where the proxy is '+
    'weaker than the doctrine, it says so · click any row for the full test doctrine · '+
      '<span class="demo-wm">demo twin</span>',
    tbl(['#','The test','Wyckoff’s requirement','Proxy evaluated here','Reading','Verdict'],
      tests.map(t=>'<tr class="click" data-cmd="est.test" data-arg="'+t.n+'"'+(t.pass?'':' style="background:var(--warn-bg)"')+
        '><td class="mono">'+t.n+'</td>'+
        '<td style="font-size:11px"><b>'+U.esc(t.test)+'</b></td>'+
        '<td class="i2" style="font-size:10px">'+U.esc(t.wy)+'</td>'+
        '<td class="i1" style="font-size:10px">'+U.esc(t.proxy)+'</td>'+
        '<td class="mono" style="font-size:10px">'+U.esc(t.read)+'</td>'+
        '<td>'+(t.pass?chip('PASS','ch-ok','✓'):chip('FAIL','ch-neg','✕'))+'</td></tr>').join(''))+
    '<div style="padding:9px 12px"><b style="font-size:12px">'+verdict+'</b><div class="i2" style="font-size:10.5px;margin-top:4px">Doctrine: the tests are '+
      'sequential in spirit — a 9/9 built on a '+
      'failed test 1 is a miscount. They are cheap to run and expensive to ignore; the desk runs them '+
        'on every campaign candidate before S10 spends a token.</div></div>',{flush:true});
  /* ── cause & targets: point-and-figure arithmetic on live plan levels ── */
  const L=s&&s.levels;
  let cause;
  if(L&&L.entry&&L.stop){
    const box=Math.max(0.25,Math.round(s.px*0.003*100)/100),cols=9,rev=3;
    const full=L.stop+cols*rev*box,conservative=L.stop+6*rev*box;
    cause='<div class="grid g4">'+
      stat('Box size','$'+U.fmt(box,2),'0.3% of price by convention — the twin has no tick-level P&F feed, said plainly')+
      stat('Cause width',cols+' columns','from the 4H re-accumulation read (the campaign panel above)')+
      stat('Reversal','3-box','standard 3-box reversal count')+
      stat('Count line','$'+U.fmt(L.stop,2),'counted from the spring-low support, per doctrine')+'</div>'+
      kv('THE ARITHMETIC','<span class="mono" style="font-size:11px">'+cols+' cols × '+rev+' boxes × $'+U.fmt(box,2)+
        ' = $'+U.fmt(cols*rev*box,2)+' of cause → target '+U.fmt(L.stop,2)+
        ' + '+U.fmt(cols*rev*box,2)+' ≈ <b>'+U.fmt(full,2)+'</b></span>')+
      kv('CONSERVATIVE COUNT','<span class="mono" style="font-size:11px">6 of '+cols+' cols → '+U.fmt(L.stop,2)+
        ' + '+U.fmt(6*rev*box,2)+' ≈ <b>'+U.fmt(conservative,2)+
        '</b></span> — the phase-C-only count, taken when phase D is not yet proven')+
      kv('CROSS-CHECK vs PLAN','<span style="font-size:11px">Full count '+U.fmt(full,2)+' vs plan T2 '+U.fmt(L.t2,2)+
        ' — Δ $'+U.fmt(Math.abs(full-L.t2),2)+
        '. '+(Math.abs(full-L.t2)<=s.px*0.01?'<b class="up">Two independent methods land on one level</b> — the measured-move pool and the '+
          'P&F count agree, which is what makes T2 credible rather than hopeful.':'The count and the plan disagree by more than 1% — the desk trades the SMALLER claim and journals the gap.')+
        '</span>')+
      kv('LAW OF CAUSE & EFFECT','<span style="font-size:11px">The size of the cause bounds the effect — a 9-column '+
        'base cannot pay a 30-column dream. When the '+
        'count cannot reach 5R against the true stop, the count has answered the trade question '+prov(
          'risk.min_rr')+'.</span>');
  }else{
    cause='<div class="empty"><div class="e1">NO CAMPAIGN COUNTED</div>'+(s?s.sym:'This symbol')+
      ' has no accumulation claim on record — a cause cannot be counted where no cause is claimed. '+
      'Context symbols get context, not targets.</div>';
  }
  h+=panel('CAUSE & TARGETS — the point-and-figure count','accumulation width × unit × reversal = the effect the cause can pay for · computed on live plan '+
    'levels · <span class="demo-wm">demo twin</span>',cause);
  h+=panel('OPERATOR CONDUCT CODE — ten rules, distilled','the Wyckoff conduct doctrine with the varnish removed; each rule is one sentence '+
    'because a rule that needs two is a debate',
    EST_CONDUCT.map((r,i)=>kv(String(i+1).padStart(2,'0'),'<span style="font-size:11.5px;line-height:1.6">'+U.esc(r)+
      '</span>')).join(''));
  h+=panel('SCHEMATIC GRAMMAR — accumulation and its mirror, event by event','the two grammars share a skeleton; the tell is always the VOLUME signature at the extreme — '+
    'direction is the last thing to trust',
    tbl(['Accumulation','Distribution mirror','What the event means','The volume tell'],[
     ['PS — preliminary support','PSY — preliminary supply','the first big player leans against the trend; the move continues, but on notice',
       'volume swells for the first time against the trend'],
     ['SC — selling climax','BC — buying climax','the public capitulates INTO the operator’s bid/offer; the transfer begins (DET-061)',
       'extreme volume, extreme range, close well off the extreme'],
     ['AR — automatic rally','AR — automatic reaction','the vacuum after the climax — it defines the range’s other boundary',
       'easy travel on modest volume: nobody left to fight'],
     ['ST — secondary test','ST — secondary test','the extreme revisited to measure what supply/demand remains',
       'MUST be lighter than the climax, or the climax label was wrong'],
     ['Spring','UT / UTAD','the engineered false break — the trap that funds the markup/markdown (DET-063)',
       'effort into the extreme, result rejects it, close back inside ≤ 3 bars (HUM-119)'],
     ['Test (of spring)','Test (of UT)','the trap re-checked on lighter volume before commitment',
       'the NVDA 10:24 bar: 0.6× the spring’s volume — textbook'],
     ['SOS — sign of strength','SOW — sign of weakness','the campaign shows its hand out of the range (DET-065)',
       'range AND volume expansion together, out of the creek/through the ice'],
     ['LPS — last point of support','LPSY — last point of supply','the final, quieter pullback before the trend leg (DET-067)',
       'diminishing volume on EVERY dip — one rising-volume dip breaks the grammar'],
    ].map(r=>'<tr>'+
      '<td class="mono" style="font-size:10.5px"><b>'+r[0]+'</b></td>'+
      '<td class="mono" style="font-size:10.5px">'+r[1]+'</td>'+
      '<td class="i1" style="font-size:10.5px">'+U.esc(r[2])+'</td>'+
      '<td class="i2" style="font-size:10px">'+U.esc(r[3])+'</td></tr>').join(''))+
    '<div class="i2" style="font-size:10.5px;padding:8px 12px">'+
    'Grammar discipline: events must appear in order, each certified by its detector, or there is no schematic — '+
    'a spring without a climax behind it is just a sweep (still tradeable, but as PB-02, not as a campaign). '+
    'The UTAD that is ABSENT from the NVDA range is the distribution tell the desk keeps checking '+
      'for, on schedule, out of respect for the mirror.</div>',{flush:true});
  return h;
});

/* ═══════════ 4 · OPTIONS ESTATE — greeks under fire, DTE doctrine, strikes ═══════════ */
const EST_GREEKS=[
 {g:'DELTA',betray:'Gap risk beyond the hedge band — delta assumes you can trade the path; gaps skip the path.',
  worked:'NVDA 200C Δ.42 ×2 cts = 84 share-equivalents. A −4% overnight gap on a $196.74 stock is '+
    '−$7.87/share ≈ −$661 of mark before any stop can act — the '+
    '194.10 stop cannot execute inside a gap. This is WHY event windows close entries (LAW-017): the '+
      'stop is a limit on paths, not on gaps.',
  when:'overnight holds · event prints · halt reopens'},
 {g:'GAMMA',betray:'The pin and the weekend flip — gamma is a friend at 21 DTE and a landmine at 0 DTE near a wall.',
  worked:'The live SPY 0DTE 601/599 credit spread sits against a DET-095 OI wall at 601. Near the strike '+
    'into Friday close, position gamma explodes: a 0.3% '+
    'wiggle (±$1.80 on SPY) swings the spread by more than the entire week’s theta collection. And '+
      'after the bell, assignment risk survives the weekend '+
    'even though the hedge cannot — the MOC blackout (LS-117) exists because six of seven losing '+
      '0DTE trades held through exactly this window.',
  when:'expiry day · OI walls · Friday 15:45–16:00'},
 {g:'THETA',betray:'The decay cliff inside 21 DTE — theta is not linear, and a stalled thesis pays compounding rent.',
  worked:'The NVDA 21DTE 200C bleeds −$8.4/day/ct today (−$16.8/day on the pair). Hold the same option to '+
    '10 DTE and the daily burn roughly doubles; the final '+
    'week it roughly doubles again. A thesis that needs 15 more days from inside 21 DTE is renting '+
      'time it cannot afford — the 14:00 time-stop on the '+
    'position is not impatience, it is arithmetic.',
  when:'DTE < 21 · stalls at structure · “give it one more day”'},
 {g:'VEGA',betray:'IV crush after the event — you were long the move AND long the fear; the fear leaves first.',
  worked:'Vega 12.1 on the NVDA call: an event print that drops IV 38 → 28 costs 12.1 × 10 = −$121/ct '+
    'even if spot never moves. The implied '+
    'move is a price you pay, not a forecast you earn (S19 doctrine) — which is why the '+
      'desk buys premium at IVR 41 (under the '+ck(
      'options.iv_rank_debit_max')+
    ' debit cap '+'per OPT-014) and refuses it at COIN’s IVR 77.',
  when:'earnings · CPI/FOMC · any binary the chain already priced'},
 {g:'RHO',betray:'Ignored until it isn’t — rate sensitivity sleeps at 21 DTE and wakes up in LEAPS.',
  worked:'On the 21DTE 200C, a 25bp repricing moves the option under $2/ct — noise. On a 120 DTE '+
    'position-personality contract, a 50bp shift moves the mark '+
    'more than a full day of theta. The personality × DTE matrix below is also a rho map: the swing '+
      'book can ignore it; the position book that ignores it '+
    'is short a bond trade it never sized.',
  when:'DTE > 90 · rate-decision regimes · LEAPS books'},
];
EST_W('research.options',()=>{
  let h=panel('GREEKS UNDER FIRE — how each greek betrays you at the worst time','pre-committed numeric expectations are the only defense; every worked example below '+
    'uses the live paper book’s actual contract',
    EST_GREEKS.map(x=>'<div class="banner '+(x.g==='RHO'?'info':'warn')+'" style="margin-bottom:7px"><span class="bico">'+(x.g==='RHO'?'i':'!')+
      '</span><div>'+
      '<b class="mono" style="font-size:11px">'+x.g+'</b> — <span style="font-size:11px">'+U.esc(x.betray)+'</span>'+
      '<div class="i1" style="font-size:10.5px;line-height:1.65;margin-top:4px">'+U.esc(x.worked)+'</div>'+
      '<div class="i2" style="font-size:9.5px;margin-top:3px">FIRES WHEN: '+U.esc(x.when)+'</div></div></div>').join(
        ''));
  h+=panel('DTE DOCTRINE — personality × DTE band','a scalp cannot become a swing '+prov('LAW-016')+
    ' — the matrix is enforced by S24 routing, not remembered by the operator',
    tbl(['Personality','DTE band','Chart ladder','Theta posture','Enforcement'],[
     ['Scalp','0–1','1m–5m triggers · 15m context','theta is the enemy — minutes matter','time-stop same session, always; 0DTE credit obeys the 15:45 MOC blackout (LS-117)'],
     ['Day','0–5','5m–15m · 1H context','theta hostile after lunch','flat by close unless the playbook names an overnight clause — none currently do'],
     ['Swing','14–45','15m–4H · D context','theta budgeted in the plan (NVDA: −$16.8/day, named in §12)',
       'DTE must cover thesis duration ×2 · earnings inside DTE flags at T-7d (the AMD conflict)'],
     ['Position','60–120','4H–W · M context','theta traded for vega/rho exposure — a different asset, honestly',
       'court-approved playbooks only; none promoted yet — the book is honest about being empty'],
    ].map(r=>'<tr><td><b style="font-size:11px">'+r[0]+'</b></td><td class="mono">'+r[1]+'</td><td class="i1" style="font-size:10.5px">'+r[2]+
      '</td><td class="i1" style="font-size:10.5px">'+r[3]+
      '</td><td class="i2" style="font-size:10px">'+r[4]+'</td></tr>').join(''))+
    '<div class="kick" style="font-family:var(--mono);font-size:9.5px;letter-spacing:1.2px;color:var(--ink2);margin:10px 12px 6px">VIOLATION ANATOMY — '+
      'WHAT A SCALP-BECOME-SWING ACTUALLY COSTS (THE SLOW BLEED)</div>'+
    tbl(['T','State of the trade','Option mark','The lie being told'],[
     ['Hour 0','0DTE 197.5C bought $1.20 · plan: −$0.48 stop, out by 11:30','$1.20','none yet — the plan is honest'],
     ['11:30','thesis invalid (no MSS) but “it’s only down a bit”','$0.94','“the level still holds” — the trigger, not the level, was the thesis'],
     ['Close','held overnight — a 0DTE rolled into tomorrow’s 1DTE by hope','$0.62','“it owes me” — LAW-012 exists because P&L debts are fiction'],
     ['Day 2, 14:00','delta decayed OTM, theta 4× the entry rate','$0.31','“lottery ticket now, might as well hold” — the position has become a different '+
       'instrument, unsized and unapproved'],
     ['Expiry','out of the money','$0.00','planned risk $48/ct · realized $120/ct = 2.5× the plan, plus two days of attention tax on every other trade'],
    ].map(r=>'<tr><td class="mono" style="font-size:10px">'+r[0]+'</td><td class="i1" style="font-size:10.5px">'+r[1]+
      '</td><td class="r num">'+r[2]+'</td><td class="i2" style="font-size:10px;color:var(--warn)">'+r[3]+
      '</td></tr>').join(''))+
    '<div class="i2" style="font-size:10.5px;padding:8px 12px">The bleed is slow on purpose — every '+
      'step down is small enough to rationalize. The FSM '+
      'refuses the first step: horizon extension is FORBIDDEN by the management envelope, and the '+
        'amendment path (AMD-114 style) requires your token. <span '+
      'class="demo-wm">worked example · demo</span></div>',{flush:true});
  h+=panel('STRIKE SELECTION LADDER — ITM / ATM / OTM vs conviction','the strike is a statement about HOW you are right; pick it after the setup grade, never before',
    tbl(['Ladder','Delta band','What it buys','What it costs','When the desk uses it'],[
     ['ITM','.60–.75','intrinsic floor · survives being early or partially wrong · lowest theta ratio',
       'most premium at risk per contract · caps contract count under the risk budget',
       'anticipatory entries would need it — which is why the desk, which forbids '+
         'anticipatory entries, rarely holds it'],
     ['ATM','.45–.55','maximum gamma per dollar · fastest payoff on an immediate move','maximum theta rent · dies fastest on a stall',
       'confirmed triggers with tight expected time-to-T1 — the default when the trigger IS the thesis'],
     ['OTM','.25–.40','cheapest exposure to the 5R path · convexity into T2/T3','needs displacement to pay · a stall is fatal, not inconvenient',
       'A-grade setups with a named draw and a fresh trigger — NVDA 200C at Δ.42 sits at '+
         'this band’s top edge, deliberately'],
     ['Lottery OTM','< .20','a story','everything, slowly','never — no detector can certify a 6σ move, and the chain gates (DET-091/093/095) '+
       'run before any strike argument is even heard'],
    ].map(r=>'<tr'+(r[0]==='Lottery OTM'?' style="background:var(--blk-bg)"':'')+'><td><b style="font-size:11px">'+r[0]+
      '</b></td><td class="mono">'+r[1]+
      '</td><td class="i1" style="font-size:10.5px">'+r[2]+'</td><td class="i1" style="font-size:10.5px">'+r[3]+
        '</td><td class="i2" style="font-size:10px">'+r[4]+
      '</td></tr>').join(''))+
    '<div style="padding:8px 12px">'+kv('THE DECISION RULE','<span style="font-size:11px">Conviction picks the band; confirmation picks the '+
      'moment. Confirmed trigger + defined draw → '+
      'Δ.40–.50 (the desk default — ride T1→T2 without paying the full ATM theta bill). Less '+
        'conviction does not buy a cheaper strike — '+
      'it buys NO strike: sub-.25 delta is a grade problem wearing a discount, and the '+
        'grade is the thing to fix.</span>')+
      '</div>',{flush:true});
  h+=panel('CONTRACT PRE-FLIGHT — the ten checks S22 runs before any strike argument is heard',
    'sequential and fail-fast: most candidate contracts die at check 2 or 3, which is the design working',
    [['1','Underlying setup grade ≥ B','a contract cannot upgrade a chart — LAW-009 cuts one way only'],
     ['2','Spread ≤ '+ck('options.max_spread_pct')+'% of mid (DET-091, 3-sample median)','the toll both ways; the AMD killer, live in the queue'],
     ['3','OI ≥ '+ck('options.min_oi')+' · volume ≥ '+ck('options.min_volume'),'you must be able to LEAVE at a fair price on a bad day, not just enter on a good one'],
     ['4','IVR band fits the structure (DET-093, event-adjusted)','debit under '+ck('options.iv_rank_debit_max')+
       ' IVR; above it, spreads or stock — the crush tax is not negotiable'],
     ['5','DTE covers thesis duration × 2 (LAW-016)','half your DTE is theta’s, not yours — budget like it'],
     ['6','No binary event inside DTE without a named plan','the AMD 14DTE × earnings-T+9d conflict flags at T-7d, automatically'],
     ['7','Delta band matches the ladder rung chosen above','a Δ.18 “ATM-ish” call is a category error with a fill price'],
     ['8','Theta bill priced into the plan (§12 of the packet)','NVDA: −$16.8/day on the pair, named BEFORE entry — rent you agreed to, not rent you discover'],
     ['9','Alternatives priced and beaten on the record','PKT-2231 §12 rejected three structures with reasons — a chosen contract without '+
       'rejected rivals is a default, not a decision'],
     ['10','Exit liquidity imagined at the TARGET, not the entry','OI thins above round numbers; a 5R path through a liquidity desert pays 4R after the exit spread']]
    .map(r=>'<div class="kv"><span class="k">CHK '+r[0]+'</span><span class="v">'+
      '<b style="font-size:11px">'+U.esc(r[1])+'</b>'+
      '<div class="i2" style="font-size:10px;margin-top:2px">'+U.esc(r[2])+'</div></span></div>').join('')+
    '<div class="banner info" style="margin-top:8px"><span class="bico">i</span><div>'+
    'Checks 2–4 are DETECTOR gates (vetoes, unappealable); checks 1 and 5–10 are DESK doctrine '+
      '(arguable in the court, with evidence). '+
    'Knowing which kind of rule is refusing you is half of options discipline — you retune a gate, '+
      'you argue a doctrine, and you never bypass either at 10:26 with the tape moving.</div></div>');
  return h;
});

/* ═══════════ 5 · BLACKOUT ENGINE — markets.calendar ═══════════ */
EST_W('markets.calendar',()=>{
  let h=panel('THE BLACKOUT ENGINE — how the event window actually gates','computed by DET-083 from the calendar, enforced by the risk engine as RISK-EVENT — never '+
    'remembered, never negotiated at the moment of temptation',
    tbl(['Gate','Arms at','What locks','What stays open'],[
     ['T−'+ck('risk.event_window_hrs')+'h · NO NEW ENTRIES','event minus '+ck('risk.event_window_hrs')+
       'h — the window is config, not judgment',
       'new entries in correlated size — the risk engine returns RISK-EVENT '+
       ' on any plan whose underlying correlates ≥ 0.5 with the event','uncorrelated book · management of existing positions · analysis (the desk keeps '+
         'thinking, it stops committing)'],
     ['T−2h · MANAGEMENT ONLY','event minus 2h','adds of any kind, even inside the envelope · packet assembly for correlated names (TTLs inside '+
       'the window compress automatically)','tighten stops · take profits · flatten — the reduce-only half of the envelope'],
     ['T−0 · FLAT-OR-HEDGED','the print itself','everything directional and correlated','index binaries (FOMC/CPI/NFP): flat or defined-risk hedged, by doctrine. '+
       'Single-name earnings: no position through the print, '+
       'full stop — PB-08 exists precisely so there is a sanctioned way to trade the AFTERMATH instead'],
     ['T+30m · RE-OPEN PROTOCOL','thirty minutes after','nothing — but the post-event playbook below owns the first half hour',
       'normal operations resume once DET-071 exits shock regime and the calendar arms the next window'],
    ].map(r=>'<tr><td class="mono" style="font-size:10.5px"><b>'+r[0]+'</b></td><td class="i2" style="font-size:10px">'+r[1]+
      '</td><td class="i1" style="font-size:10.5px;color:var(--warn)">'+r[2]+
      '</td><td class="i1" style="font-size:10.5px">'+r[3]+'</td></tr>').join(''))+
    '<div class="i2" style="font-size:10.5px;padding:8px 12px">'+prov('LAW-017')+' '+prov('risk.event_window_hrs')+
      ' · Fail-closed clause: if the dual-source calendar disagrees or an event time is unknown, the '+
      'desk is INSIDE the window by definition. A blackout you can argue with is a suggestion.</div>'+
    '<div style="padding:0 12px 10px">'+
    '<div class="kick" style="font-family:var(--mono);font-size:9.5px;letter-spacing:1.2px;color:var(--ink2);margin:4px 0 6px">'+
      'GATES ARMED RIGHT NOW — DERIVED FROM THE LIVE EVENTS STORE, NOT REMEMBERED</div>'+
    EVENTS.map(e=>'<div class="kv"><span class="k">'+U.esc(e.t)+'</span><span class="v">'+
      '<b style="font-size:11px">'+U.esc(e.what)+'</b> '+
      (e.block
        ?chip('BLACKOUT ARMS T−'+ck('risk.event_window_hrs')+'h','ch-blk','⛔')
        :e.cls==='MACRO'
          ?chip('TIME-STOP DOCTRINE','ch-warn','!')
          :chip('TRACKED · DTE-CONFLICT WATCH','ch-mut','·'))+
      '<div class="i2" style="font-size:10px;margin-top:2px">'+U.esc(e.impact)+'</div></span></div>').join('')+
    '</div>',{flush:true});
  h+=panel('EVENT CLASSES — implied vs realized, and the asymmetry','the implied move is a price, not a forecast (S19) · representative magnitudes · '+
    '<span class="demo-wm">demo twin</span>',
    tbl(['Event','Typical implied (ATM straddle)','Typical realized','The asymmetry that matters'],[
     ['FOMC','±1.1% SPX on the day','median ≈ 0.7% — under implied most meetings','the tail is the product: dot-shift meetings print 2.5%+ — implied over-prices the median to pay '+
       'for the meeting that matters, and you cannot know which one that is from the outside'],
     ['CPI','±0.9%','median ≈ 0.6%','asymmetric by surprise sign: hot prints move ~1.6× cool prints of equal surprise — the market '+
       'fears the tightening tail more than it enjoys relief'],
     ['NFP','±0.7%','median ≈ 0.5%','the revision eats the headline: the first reaction fades on the prior-month revision often '+
       'enough that the first 30 minutes are a coin with edge-shaped decoration'],
     ['OPEX','not a print — a flow regime','pin gravity into 15:30, unclipped after','gamma pins price to DET-095 walls while dealers are long it, then releases it when they are not '+
       '— Friday “support” at a wall dies at 15:31 by mechanism, not sentiment'],
     ['Earnings (single name)','NVDA current: ±6.8% (IVR 41)','8q realized avg 5.1%','implied is rich vs history in roughly two of three names — and selling the move through the '+
       'print is STILL forbidden here, because the one-in-three tail eats the year '+
       '(LAW-017: binary events are not tradeable edges on this desk)'],
    ].map(r=>'<tr><td><b style="font-size:11px">'+r[0]+'</b></td><td class="r num">'+r[1]+'</td><td class="r num i2">'+r[2]+
      '</td><td class="i1" style="font-size:10px">'+r[3]+
      '</td></tr>').join('')),{flush:true});
  h+=panel('POST-EVENT PLAYBOOK — the first 30 minutes, by outcome quadrant','CPI worked as the template; the quadrant is decided by the print AND the tape’s answer to it — '+
    'the second axis is the one that pays',
    '<div class="grid g2">'+
    ['<b>INLINE print × market UP</b> — relief drift. Doctrine: chase nothing; let the first 15m '+
      'range define; the trade is PB-02 off the first sweep of '+
      'that reaction range, not the range itself. Most inline-up opens that gap-and-go '+
        'without a sweep retrace inside 40 minutes.',
     '<b>INLINE print × market DOWN</b> — the “sell the relief” trap or real distribution; the print '+
       'won’t tell you which. Doctrine: fade only at '+
       'pre-mapped HTF levels and only with DET-031 displacement confirming the fade — an inline print '+
         'that cannot hold its own relief is information, but '+
       'only structure converts it to a trade.',
     '<b>HOT print × market UP</b> — the squeeze quadrant, the most dangerous cell on the board. '+
       'Doctrine: do NOT short the first spike; wait for the '+
       'DET-063 upthrust signature (extreme taken, close back inside within 3 bars). No signature by '+
         'T+30m = no trade, and that is a complete answer.',
     '<b>HOT print × market DOWN</b> — confirmation cascade. Doctrine: no knife-catching, no entries '+
       'at all in the first 30 minutes; then PB-03 volatility '+
       'reclaim only, and only after DET-071 exits shock (RVOL back under 3×). The reclaim pays better '+
         'than the bottom-tick, and it exists.']
    .map(q=>'<div class="banner info" style="margin-bottom:0"><span class="bico">▸</span><div '+
      'style="font-size:10.5px;line-height:1.65">'+q+
      '</div></div>').join('')+'</div>'+
    '<div class="i2" style="font-size:10.5px;margin-top:8px">The 30-minute rule is not humility '+
      'theater — post-print spreads, RVOL shock, and algorithmic '+
      'repricing make the first half hour the most expensive execution window of the day. The desk’s '+
        'edge resumes when the microstructure does.</div>');
  h+=panel('EVENT CASE FILES — three windows the engine already paid for','the blackout is not a theory; these are its receipts from the demo lineage · <span '+
    'class="demo-wm">demo twin</span>',
    [['CASE · THE HELD SCALP','FOMC minutes day, prior cycle','A 0DTE scalp thesis was still open at 13:52 with the 13:45 time-stop ignored “for '+
      'one more rotation.” The minutes headline '+
      'repriced the curve; the scalp gapped through its stop for −2.1R against a planned −0.4R.',
      'The 13:45 time-stop moved from doctrine to enforcement: the FSM now flattens scalps into index '+
        'vol events mechanically. Realized −0.4R plans stay −0.4R realities.'],
     ['CASE · THE EARNINGS “HEDGE”','single-name print, T−1h','A swing position was “hedged through” a print with a put whose IV carried the entire implied '+
       'move. The stock moved 4.9% — INSIDE '+
       'the ±6.8% implied — and the position STILL lost on the crush: the hedge cost more than the move paid.',
      'The flat-or-hedged doctrine got its second clause: hedged means DEFINED-RISK NET of crush, '+
        'priced at event IV, or it means flat. PB-08 exists so the '+
        'aftermath is tradeable without the print being survivable.'],
     ['CASE · THE OPEX ANCHOR','monthly OPEX Friday','A breakout thesis kept “finding support” at a strike into Friday afternoon — DET-095 wall '+
       'gravity read as demand. At 15:31 the pin released and the level evaporated in four minutes.',
      'OPEX Fridays now carry a standing annotation: strike-adjacent support inside the pin window is '+
        'MECHANISM, not structure, and PB entries may not cite '+
        'it as a level. The wall detector emits pin flags, never support claims.']]
    .map(c2=>'<div class="banner warn" style="margin-bottom:8px"><span class="bico">!</span><div>'+
      '<b style="font-size:11px">'+c2[0]+'</b> <span class="i2" style="font-size:10px">· '+c2[1]+'</span>'+
      '<div class="i1" style="font-size:10.5px;line-height:1.65;margin:4px 0">'+U.esc(c2[2])+'</div>'+
      '<div class="i2" style="font-size:10.5px"><b>WHAT IT BOUGHT:</b> '+U.esc(c2[3])+'</div></div></div>').join('')+
    '<div class="i2" style="font-size:10.5px">Every gate in the engine above traces to a receipt '+
      'like these. Rules without receipts are superstitions; the desk keeps the receipts attached.</div>');
  return h;
});

/* ═══════════ 6 · ALERT FATIGUE DOCTRINE — markets.alerts ═══════════ */
const EST_MUTED={};
const EST_ACTIONS=[
 ['P0 · KILL-TRIP','{RESUME_DESK after cause resolved · FLATTEN_DEFENSIVE}','analysis in the hot path is forbidden — resolve first, understand second; the ledger will still be there'],
 ['P0 · BROKER-REJECT','{RECONCILE · LOCK_NEW_ORDERS}','never auto-resend (RB-03) — a reject means the desk and the broker disagree about reality, and reality wins'],
 ['P0 · PAST-INVALIDATION','{FLATTEN · nothing else}','the level that made the trade wrong has printed; every second of “context” is a widened stop by another name'],
 ['P1 · PACKET-READY','{JUDGE · EXPLICIT_DEFER (logged) · LET_TTL_EXPIRE (billed as decision debt)}',
   'silence is a choice and it is journaled as one (LAW-018)'],
 ['P1 · TTL-CLOSING','{JUDGE_NOW · RELEASE}','re-fires once at TTL−5:00 and never again — an alert that nags trains you to ignore it'],
 ['P2 · SETUP-ARMED','{READ_AT_BATCH · PROMOTE_TO_WATCH}','batched every '+ck('alerts.p2_batch_min')+'m '+
   '— armed is not triggered; the FSM will page you when it is'],
 ['P2 · DRILL / BRIEF READY','{READ_AT_BATCH}','awareness only; nothing is asked of you'],
 ['P3 · TELEMETRY','{NOTHING}','reading P3 in real time is a process smell — it exists for reconstruction, not for attention'],
];
EST_W('markets.alerts',()=>{
  let h=panel('ALERT FATIGUE DOCTRINE — the P0–P3 economy','page · act · batch · log — attention is the desk’s scarcest capital and this is its budget',
    '<div class="grid g4">'+
    stat('P0 = PAGE','interrupts life','capital or safety NOW · breaks quiet hours · repeats until acknowledged')+
    stat('P1 = ACT','interrupts work','a decision with a deadline · once + badge · one re-fire at TTL−5:00')+
    stat('P2 = BATCH','waits '+ck('alerts.p2_batch_min')+'m','awareness · never repeats '+prov(
      'alerts.p2_batch_min'))+
    stat('P3 = LOG','never surfaces','reconstruction fuel · reading it live is a smell')+'</div>'+
    kv('THE FALSE-PAGE BUDGET','<span style="font-size:11px">More than <b>2 false P0s in a week</b> and the pager gets retuned '+
      '— mandatorily, as a court item, '+
      'with the emitting detector named. A false page is booked as a P2 defect against its emitter, '+
        'not shrugged off as “better safe.”</span>')+
    kv('THE CRY-WOLF ARITHMETIC','<span style="font-size:11px">The decay the budget assumes: ack latency roughly doubles for each '+
      'week carrying 3+ false pages — '+
      '45s → 90s → 3m+. At 3 minutes, a REAL broker-reject page has already cost the '+
        'spread twice over. Alert fatigue is not a mood '+
      'problem; it is a measurable tax on the one channel that must stay expensive. The '+
        'budget exists to keep P0 meaning P0.</span>')+
    kv('MISCLASSIFICATION LAW','<span style="font-size:11px">An alert delivered above its class steals attention; below its '+
      'class, it hides risk. Both directions '+
      'are P2 defects with named emitters — the taxonomy panel above is a contract, and '+
        'contracts have breach consequences.</span>')+
    '<div class="hr"></div>'+
    '<div class="kick" style="font-family:var(--mono);font-size:9.5px;letter-spacing:1.2px;color:var(--ink2);margin-bottom:6px">'+
      'THE ATTENTION P&amp;L — WHAT AN INTERRUPTION ACTUALLY COSTS</div>'+
    '<div class="grid g4">'+
    stat('A P0, honored','~4 min','full context switch + resolution + re-entry into whatever it interrupted')+
    stat('A false P0','~9 min','the 4 minutes, plus distrust: the next REAL page gets triaged instead of obeyed')+
    stat('A P2 read at batch','~20 sec','amortized inside a planned review window — nearly free by design '+prov(
      'alerts.p2_batch_min'))+
    stat('A P2 read instantly','~90 sec','the same information at 4× the price, paid in focus during the killzone')+
      '</div>'+
    kv('THE BOOK-LEVEL READ','<span style="font-size:11px">A week of disciplined classes costs the operator '+
      'roughly 20 minutes of interruption. '+
      'A week of sloppy classes costs over two hours — AND degrades the P0 channel the '+
        'desk cannot afford to degrade. '+
      'The taxonomy is not tidiness; it is the spread between those two numbers, collected daily.</span>'));
  h+=panel('ALERT → ACTION — each class maps to its ONLY allowed responses','an alert whose response set is “it depends” is not an alert, it is anxiety with a timestamp',
    tbl(['Alert class','Allowed responses (closed enum)','Why the set is closed'],
      EST_ACTIONS.map(r=>'<tr'+(r[0].startsWith('P0')?' style="background:var(--blk-bg)"':'')+
        '><td class="mono" style="font-size:10.5px"><b>'+r[0]+
        '</b></td><td class="mono" style="font-size:10px;color:var(--paper)">'+U.esc(r[1])+
        '</td><td class="i1" style="font-size:10.5px">'+U.esc(r[2])+'</td></tr>').join(''))+
    '<div class="i2" style="font-size:10.5px;padding:8px 12px">Closed response sets are the same '+
      'idea as decision enums (LAW-014) applied to '+
      'interruptions: when the pager fires at 15:47 the last thing the operator should be '+
        'doing is inventing options.</div>',{flush:true});
  h+=panel('SESSION MUTE CONSOLE — est.mute demo','mutes dim a class in THIS inbox for THIS session · audited · P0 is constitutionally unmutable — '+
    'the button will refuse and say why',
    '<div class="btnrow" style="margin-bottom:8px">'+
    CMD.btn('est.mute','P0','sm','P0 — try it')+
    ['P1','P2','P3'].map(c=>'<button class="btn sm'+(EST_MUTED[c]?' warn':'')+'" data-cmd="est.mute" data-arg="'+c+
      '">'+(EST_MUTED[c]?'UNMUTE ':'Mute ')+c+
      '</button>').join('')+
      '</div>'+
    kv('MUTED NOW','<span class="mono">'+(Object.keys(EST_MUTED).filter(k=>EST_MUTED[k]).join(' · ')||'nothing')+
      '</span>'+(Object.keys(EST_MUTED).some(k=>EST_MUTED[k])?' — rows of a muted class render dimmed below; the ledger records every alert regardless. Muting '+
      'changes what you see, never what happened.':''))+
    kv('HONESTY','<span style="font-size:11px">In DEMO the mute is presentational: it dims matching '+
      'inbox rows and journals the choice. In '+
      'production it additionally suppresses delivery for the session — with the same hard exception: '+
        'no path, in any mode, mutes P0. '+
      'The kill page reaches you or the desk halts trying.</span>')+
    (Object.keys(EST_MUTED).some(k=>EST_MUTED[k])?'<div style="margin-top:8px">'+ALERTS.filter(a=>EST_MUTED[a.cls]).slice(0,5).map(a=>'<div class="kv" style="opacity:.38"><span class="k">'+a.t+
      '</span><span class="v">'+
      chip(a.cls,'ch-mut','·')+' '+U.esc(a.msg)+' <span class="tag">muted this session</span></span></div>').join('')+
      '</div>':''));
  h+=panel('PAGER TUNING LEDGER — every retune, with its before/after','the false-page budget has teeth only if breaches leave records · <span class="demo-wm">demo lineage</span>',
    tbl(['When','What paged falsely','The retune','>False P0/wk before','>After'],[
     ['v13.1','feed-freshness P0 on single dropped heartbeat','breach requires 2 consecutive missed beats before paging',
       '3.2','0.4'],
     ['v12.9','kill-adjacent P0 on broker RECON timeout','timeout classified P1-reconcile unless order state diverges',
       '2.6','0.7'],
     ['v12.7','TTL-expiry paged P0 instead of P1','expiry is a decision-debt event, not a capital event — reclassed',
       '2.1','—'],
     ['v12.5','duplicate P0 on kill + its own audit echo','dedupe on correlation id; one event, one page',
       '1.8','0.9'],
    ].map(r=>'<tr>'+
      '<td class="mono" style="font-size:10px">'+r[0]+'</td>'+
      '<td class="i1" style="font-size:10.5px">'+U.esc(r[1])+'</td>'+
      '<td class="i1" style="font-size:10.5px">'+U.esc(r[2])+'</td>'+
      '<td class="r num">'+r[3]+'</td><td class="r num up">'+r[4]+'</td></tr>').join(''))+
    '<div class="i2" style="font-size:10.5px;padding:8px 12px">'+
    'Note the v12.7 row: the fix was reclassification, not suppression — the event still '+
      'surfaces, at the priority it earns. '+
    'Retuning never deletes information; it re-prices attention.</div>',{flush:true});
  return h;
});
CMD.define({id:'est.mute',label:'Mute alert class',purpose:'Session-mute a non-P0 alert class — audited, presentational in DEMO, never touches P0',
  pre:a=>a==='P0'?'P0 cannot be muted — capital-or-safety pages are constitutionally unmutable. No mode, no role, '+
    'no session flag suppresses a P0. This refusal is the feature.':null,
  run:a=>{if(!['P1','P2','P3'].includes(a))return;
    EST_MUTED[a]=!EST_MUTED[a];
    SVR.audit('HUMAN (owner)','alert','Class '+a+' '+(EST_MUTED[a]?'MUTED for session — presentational dim, ledger unaffected':'unmuted')+
      ' via est.mute');
    UI.toast(a+(EST_MUTED[a]?' muted for this session — the ledger still records everything; P0 remains unmutable.':' unmuted.'),EST_MUTED[a]?'warn':'ok',
      'ALERT ECONOMY');render();}});

/* ═══════════ 7 · REPLAY DISCIPLINE — review.replay ═══════════ */
const EST_EXERCISES=[
 {id:'cold',nm:'COLD READ',
  method:'Open the chart replay at a random T with the symbol name covered. Five minutes: write bias, the '+
    'two levels that matter, and TRADE or NO_TRADE with '+
    'the invalidation. Then step forward 20 bars and grade the READ, not the outcome.',
  trains:'seeing structure without narrative — the symbol’s story is the first thing hindsight fakes',
  tell:'if your read changes when the name is revealed, you were trading the name'},
 {id:'decision',nm:'DECISION REPLAY',
  method:'Pull a decided packet from the archive. Rebuild the decision from §1–§19 exactly as they stood '+
    'at assembly (plan-hash + freshness stamp pin the '+
    'snapshot). Decide again with the enum keys. Compare to your logged decision.',
  trains:'consistency — the drift between the two decisions IS the finding, and it is usually a mood you can name',
  tell:'a different verdict on identical evidence means one of the two decisions was not about the evidence'},
 {id:'counterfactual',nm:'COUNTERFACTUAL STRESS',
  method:'Take one approved trade. Move the entry ±1 candle; move the stop to each adjacent structural '+
    'level; recompute the R ladder each time. If the edge '+
    'dies under a one-candle shift, it was execution luck wearing a thesis.',
  trains:'robustness honesty — real structural edges survive small perturbations; curve-fit ones shatter',
  tell:'a 5R plan that becomes 2.8R when the entry slips one bar was always a 2.8R plan with good timing'},
];
let EST_TRN_SEQ=0;
CMD.define({id:'est.exercise',label:'File replay exercise',purpose:'File the chosen exercise to the journal as a training entry (LAW-018 — training is a decision too)',run:a=>{
  const ex=EST_EXERCISES.find(x=>x.id===a);if(!ex)return;
  EST_TRN_SEQ++;
  JOURNAL.unshift({t:CLOCK.hm(),id:'TRN-'+String(EST_TRN_SEQ).padStart(3,'0'),sym:S.sym,kind:'TRAINING',
    what:'Replay exercise filed: '+ex.nm+' on '+S.sym+' — '+ex.method.slice(0,80)+'…',grade:'—',
    outcome:'training block open',lesson:'Trains: '+ex.trains});
  SVR.audit('HUMAN (owner)','journal','Replay exercise filed: '+ex.nm+' on '+S.sym+' (TRN-'+String(EST_TRN_SEQ).padStart(3,
    '0')+') — graded on read quality, never on hindsight P&L');
  UI.toast(ex.nm+' filed to the journal as TRN-'+String(EST_TRN_SEQ).padStart(3,'0')+' — Review → Journal has the entry. Run it before the close; unfiled intentions decay faster than packets.',
    'gold','REPLAY DISCIPLINE');
  render();}});
EST_W('review.replay',()=>{
  let h=panel('REPLAY DISCIPLINE — point-in-time reconstruction rules','no lookahead is a mechanical property here, not a promise: the replay clock hides everything after T',
    kv('THE CLOCK HIDES THE FUTURE','<span style="font-size:11px">Research → Chart → REPLAY does exactly this, mechanically: the '+
      'scrub truncates the candle series at '+
      'T — bars after the clock are not dimmed or de-emphasized, they are NOT RENDERED — '+
        'and the canvas stamps “REPLAY · no future '+
      'leakage” so a screenshot can never masquerade as foresight. What you cannot see, '+
        'you cannot accidentally use.</span>')+
    kv('SNAPSHOTS PIN THE EVIDENCE','<span style="font-size:11px">Decisions are re-graded only against packet-time snapshots: the '+
      'plan-hash and freshness stamp freeze '+
      'what was knowable at assembly. “I would have seen the reversal coming” is not an '+
        'argument available in this room — the packet '+
      'shows precisely what was visible, and nothing else was.</span>')+
    kv('OUTCOME BLINDNESS','<span style="font-size:11px">The process grade is written BEFORE the outcome column unblurs '+
      '(the Douglas sample-block discipline '+
      'in Performance applies here too). Grading a read after seeing the result is how hindsight '+
        'launders itself into confidence.</span>')+
    kv('DETERMINISM','<span style="font-size:11px">Seeded runs: same seed, same series, every time '+prov(
      'demo.seed')+'. A replay that cannot be reproduced is an anecdote with a user interface.</span>'));
  h+=panel('THE THREE EXERCISES — deliberate practice with a filing path','each files to the journal via est.exercise — a training rep that isn’t recorded didn’t happen (LAW-018)',
    EST_EXERCISES.map(ex=>'<div class="banner gold" style="margin-bottom:8px"><span class="bico">◆</span><div style="flex:1">'+
      '<b style="font-size:11.5px">'+ex.nm+'</b>'+
      '<div class="i1" style="font-size:10.5px;line-height:1.65;margin:4px 0">METHOD: '+U.esc(ex.method)+'</div>'+
      '<div class="i2" style="font-size:10.5px">TRAINS: '+U.esc(ex.trains)+'</div>'+
      '<div class="i2" style="font-size:10px;margin-top:2px;color:var(--warn)">THE TELL: '+U.esc(ex.tell)+'</div>'+
      '<div class="btnrow" style="margin-top:6px">'+CMD.btn('est.exercise',ex.id,'sm gold','File '+ex.nm+
        ' on '+S.sym+' →')+'</div></div></div>').join('')+
    '<div class="i2" style="font-size:10.5px">Cadence doctrine: one exercise per session minimum on '+
      'no-trade days — the desk that only practices while '+
      'positioned is practicing being positioned, not practicing judgment. Filed entries appear in '+
        'Review → Journal as TRN-* rows.</div>');
  h+=panel('WHAT REPLAY CANNOT TEACH — the honest boundary','a training tool that hides its blind spots trains overconfidence; these four are structural, not fixable',
    kv('YOUR FILLS','<span style="font-size:11px">Replay fills at the printed price. Live, your order IS part of the '+
      'tape: queue position, partial fills, and the spread you cross are all absent. '+
      'The fill model v2.1 narrows this gap in paper; replay does not even try — treat '+
        'replay R as gross, never net.</span>')+
    kv('YOUR FEAR','<span style="font-size:11px">A replay drawdown costs nothing and teaches nothing about the hand '+
      'hovering over the flatten button. '+
      'The sample-block discipline (Performance) trains composure; replay trains reads. Confusing the '+
        'two produces operators who are brilliant at 2× speed and blind at 1×.</span>')+
    kv('THE NEWS YOU KNEW','<span style="font-size:11px">You cannot un-know that the week you are replaying ended in a '+
      'crash or a squeeze. Random-T cold reads blunt this; nothing removes it. '+
      'Grade reads harder when you recognize the tape — recognition is contamination wearing a compliment.</span>')+
    kv('REGIME YOU LIVED THROUGH','<span style="font-size:11px">Replaying 2021 breakouts teaches 2021. The scenario engine’s '+
      'regime split exists because edges are regime-local; '+
      'a replay curriculum must sample regimes you find uncomfortable, or it is nostalgia with a scrub bar.</span>'));
  h+=panel('THE REP GRADING RUBRIC — how a filed TRN entry gets scored','five axes, 0–2 each, graded the NEXT session against the stepped-forward tape — '+
    'never the same day, never against P&L',
    tbl(['Axis','0 — failed','1 — partial','2 — clean'],[
     ['BIAS','wrong side of the subsequent 20 bars','right side, wrong conviction (hedged prose)',
       'right side, stated in one falsifiable sentence'],
     ['LEVELS','neither named level mattered','one of two levels drew a reaction','both levels were where the tape actually fought'],
     ['TRIGGER','entered on feel or not at all when valid','right trigger family, wrong bar',
       'named the detector-grade trigger before it printed'],
     ['INVALIDATION','none stated, or stated after the fact','stated but placed by convenience',
       'structural, priced, and it would have been honored'],
     ['RESTRAINT','forced a trade on a NO_TRADE tape','traded a C-read at C-size','said NO_TRADE when no was the answer — full marks'],
    ].map(r=>'<tr>'+
      '<td class="mono" style="font-size:10.5px"><b>'+r[0]+'</b></td>'+
      '<td class="i2" style="font-size:10px;color:var(--warn)">'+U.esc(r[1])+'</td>'+
      '<td class="i1" style="font-size:10px">'+U.esc(r[2])+'</td>'+
      '<td class="i1" style="font-size:10px">'+U.esc(r[3])+'</td></tr>').join(''))+
    '<div class="i2" style="font-size:10.5px;padding:8px 12px">'+
      '8/10 or better across five consecutive reps in one regime unlocks the next regime in the curriculum — '+
      'the same evidence-before-privilege ladder the strategies themselves climb (SIM → PAPER → PARITY). '+
      'The rubric never sees P&L: a 10/10 read of a tape that went nowhere is a 10/10 read, and a '+
        'lucky guess stays a 2/10 forever.</div>',{flush:true});
  return h;
});

/* ═══════════ 8 · CASE LAW LIBRARY — review.court ═══════════ */
const EST_CASES=[
 {id:'LC-001',nm:'The Chase Case — promote-now vs first-return',seats:'S05 Universe Scanner vs S14 ICT Execution',sym:'NVDA',
  dispute:'S05 pushed immediate promotion on the displacement candle; S14 held that the displacement '+
    'candle itself is a chase, not an entry — the entry model is the FIRST return, or nothing.',
  evidence:'Journal mining: 31 chased-displacement cases, the #1 failure tag in the record. Expectancy on '+
    'chase entries −0.4R vs +1.2R on first-return entries across the same signals.',
  ruling:'Entry model wins categorically. Promotion may accelerate; ENTRY waits for the first FVG return, '+
    'without exception, in every playbook that consumes DET-041.',
  minted:'The first-return entry gate — codified into PB-02/PB-07 as a hard transition condition (LS-104 '+
    'lineage; the 31-case Pareto bar in Performance is its ongoing receipt).',
  dissent:'S05, preserved: “Promotion latency costs candidates in fast tape. Rejected on evidence, revisit '+
    'if funnel misses exceed 2/month.” It has hit that bar zero months since.'},
 {id:'LC-002',nm:'The Honest-R Case — a valid chart that could not pay',seats:'S10 Wyckoff Campaign vs S26 Stop/Target 5R',sym:'TSLA',
  dispute:'S10 approved a chart-valid short campaign; S26 computed 4.2R best honest path against the TRUE '+
    'structural stop. S10 argued the read quality warranted flexibility on the floor.',
  evidence:'The 5R proof math, recomputed live from levels — and the counter-history: every prior '+
    '“flexibility” request traced to a stop being tightened to manufacture the ratio.',
  ruling:'LAW-004 wins by construction — it is locked and no evidence quantity reopens it. Blocked, '+
    'shadow-tracked. The stop cannot move because the math wants it to.',
  minted:'The shadow-track mandate: every 5R rejection is tracked to its counterfactual (the Setup '+
    'Archive exists because of this case). Rejections became data instead of arguments.',
  dissent:'S10, preserved: “A 4.2R A-read beats a 5.1R B-read.” Governance answer, on the record: possibly '+
    '— and LS-112 later tried to lower the floor with that '+
    'exact argument, and was rejected as unconstitutional. The floor is not a parameter.'},
 {id:'LC-003',nm:'The Impossible Contract Case','seats':'S12 + S14 vs S22 Options Desk',sym:'AMD',
  dispute:'Structure and execution both approved an A-quality chart; S22 vetoed on contract: spread 8.6% over the '+ck(
    'options.max_spread_pct')+'% cap. Two seats argued the chart should outrank a temporary liquidity condition.',
  evidence:'AUT-117: the spread normalized within 20 minutes and the thesis ran +3.4R without '+
    'the desk. Six weeks of history: 11 packets '+
    'terminally rejected on OPT-007 alone, 7 normalized within 30m, 5 hit T1+.',
  ruling:'The veto STANDS — a bad contract invalidates a good chart (LAW-009), and no chart quality buys '+
    'back an untradeable instrument. But the rejection’s '+
    'SHAPE was wrong: terminal where it should have been temporal.',
  minted:'LS-121 · WAIT_FOR_SPREAD packet state (ttl 45m, auto re-run when the ONLY blocker is OPT-007) — '+
    'in paper A/B at 14/30 samples right now. The court fixed the workflow, not the law.',
  dissent:'S14, preserved verbatim in PKT-2234’s dissent block today: “Recommend WAIT for spread '+
    'normalization rather than reject.” The dissent became the diff — this is the system’s proudest artifact.'},
 {id:'LC-004',nm:'The Pool Definition Case — what counts as equal highs',seats:'S12 SMC Structure vs S13 Structure Mapping',sym:'multiple',
  dispute:'S12 registered near-equal highs as pools on visual proximity; S13 rejected half of them as '+
    'noise. Two seats, two pool maps, one bus — the packets inherited the disagreement.',
  evidence:'34-trade sample graded against both definitions: pools with 2+ touches inside 0.15×ATR resolved '+
    'as real draws at +0.21R marginal expectancy; looser clusters resolved at noise.',
  ruling:'The tighter definition is THE definition. A pool is 2+ touches within 0.15×ATR, '+
    'machine-verified — visual proximity is retired as an argument anywhere on the desk.',
  minted:'HUM-118, applied — now the literal threshold inside DET-001 and cited in the NVDA packet’s '+
    'liquidity map (“equal highs 203.30 · qualified pool”).',
  dissent:'S12, preserved: “ATR-relative tolerance under-counts pools on compressed-vol regimes.” Tagged '+
    'for regime-split review if compressed-vol misses accumulate; none yet.'},
 {id:'LC-005',nm:'The Regime Override Case — pattern vs term structure',seats:'S08 Market Regime vs S14 ICT Execution',sym:'MMBM class-wide',
  dispute:'S14 held that a valid MMBM sequence is tradeable in any regime — the pattern IS the edge. S08 '+
    'held that VIX term-structure inversion is an extreme '+
    'reading that outranks any pattern (hierarchy: extremes outrank HTF).',
  evidence:'Six MMBM setups during inversion windows, blocked on S08’s advisory in paper: five would have '+
    'lost. The pattern’s edge measurably inverts when the vol curve does.',
  ruling:'Extreme readings outrank pattern, per the standing hierarchy. MMBM entries are prohibited '+
    'during term-structure inversion — not downgraded, prohibited.',
  minted:'HUM-117, applied: “No MMBM entries when VIX term structure inverts — regime overrides pattern.” '+
    'Blocked 6 setups since; 5 would have lost. The rule pays rent.',
  dissent:'S14, preserved: “Five of six is a small sample.” True, on the record — and the rule’s ongoing '+
    'block-log is the growing sample; it is reviewed at n=20 by standing order.'},
 {id:'LC-006',nm:'The Three-Bar Verdict — sweep or breakout',seats:'S13 Structure Mapping vs S14 ICT Execution',sym:'class-wide',
  dispute:'How long may price stay beyond a swept level before the “sweep” is actually a breakout? S14 '+
    'argued for judgment per context; S13 argued that judgment '+
    'at the hard right edge is where accounts die, and demanded a number.',
  evidence:'Labeled corpus of sweep-vs-breakout events: rejections that close back inside within 3 bars '+
    'resolve as sweeps at high fidelity; beyond 3 bars the balance flips decisively to continuation.',
  ruling:'A number over a feeling: close back inside within 3 bars or the label flips to breakout, '+
    'everywhere, uniformly — detectors, playbooks, and the spring definition all inherit it.',
  minted:'HUM-119, in A/B cohort — already enforced inside DET-063 and PB-02’s stand-down clause. One '+
    'number retired a thousand future arguments at the worst possible moment to be having them.',
  dissent:'S14, preserved: “Three is arbitrary; the right number varies by RVOL regime.” The A/B carries '+
    'an RVOL-split arm for exactly this — the dissent designed half the experiment.'},
];
/* ── docket metadata: how long each case took, and what the dispute cost while open ── */
const EST_CASE_META={
 'LC-001':{docket:'docketed on journal evidence → sampled 3 weeks → ruled',cost:'31 chased entries at −0.4R average while the dispute stayed informal — the most '+
   'expensive un-filed case in the record'},
 'LC-002':{docket:'ruled same session — constitutional questions do not sample',cost:'zero direct; the shadow-track mandate it minted has since priced every 5R rejection honestly'},
 'LC-003':{docket:'AUT-117 autopsy → docketed → LS-121 drafted inside a week',cost:'one measured +3.4R counterfactual, plus 10 prior OPT-007 terminal rejects re-graded as probable waits'},
 'LC-004':{docket:'two-definition split ran 34 trades before anyone filed it',cost:'packets inherited contradictory pool maps for a month — three graded “low '+
   'confidence” on what was actually a definitions bug'},
 'LC-005':{docket:'blocked-setup log accumulated 6 samples in paper → ruled',cost:'none realized — the advisory block held while the evidence accumulated; the system’s cheapest case'},
 'LC-006':{docket:'filed the session after a right-edge argument ate 20 minutes of a killzone',cost:'the 20 minutes — and the near-miss of a breakout traded as a sweep with a stop inside the continuation'},
};
CMD.define({id:'est.case',label:'Case file',purpose:'Open the full decided-case record — dispute, evidence, ruling, minted rule, preserved dissent',audit:false,run:a=>{
  const c=EST_CASES.find(x=>x.id===a);if(!c)return;
  const m=EST_CASE_META[c.id];
  UI.drawer('<div class="dhead"><span class="dt">'+c.id+' · '+U.esc(c.nm)+'</span><span class="pill">decided · dissent preserved by design</span><button class="dx" '+
    'data-cmd="ui.closeDrawer">ESC</button></div>'+
   '<div class="dbody">'+
   kv('PARTIES','<span style="font-size:11.5px">'+U.esc(c.seats)+' · scope: '+U.esc(c.sym)+'</span>')+
   kv('THE DISPUTE','<span style="font-size:11.5px;line-height:1.6">'+U.esc(c.dispute)+'</span>')+
   kv('THE EVIDENCE','<span style="font-size:11.5px;line-height:1.6">'+U.esc(c.evidence)+'</span>')+
   '<div class="banner gold" style="margin:8px 0"><span class="bico">◆</span><div><b>RULING</b><div '+
     'class="i1" style="font-size:11px;margin-top:3px">'+U.esc(c.ruling)+
     '</div></div></div>'+
   kv('RULE MINTED','<span style="font-size:11.5px;line-height:1.6">'+U.esc(c.minted)+'</span>')+
   '<div class="banner warn" style="margin-top:8px"><span class="bico">◮</span><div><b>DISSENT — '+
     'PRESERVED</b><div class="i1" style="font-size:11px;margin-top:3px">'+U.esc(c.dissent)+
     '</div></div></div>'+
   (m?'<div class="hr"></div>'+
     kv('DOCKET TIMELINE','<span style="font-size:11px">'+U.esc(m.docket)+'</span>')+
     kv('COST WHILE OPEN','<span style="font-size:11px;color:var(--warn)">'+U.esc(m.cost)+'</span>')
    :'')+
   '<div class="i2" style="font-size:10.5px;margin-top:8px">Dissents are never deleted: today’s '+
     'dissent is tomorrow’s diff (LC-003 proved it). A court '+
     'that erases its minority opinions is just a queue with robes.</div>'+
   '</div>');}});
EST_W('review.court',()=>{
  let h=panel('CASE LAW LIBRARY — six landmark decided cases','the rules above did not fall from the sky: each was minted by a real seat-vs-seat dispute, '+
    'decided on evidence, with the dissent preserved · click a case for the full record',
    tbl(['Case','The dispute','Ruling (one line)','Rule minted','Dissent'],
      EST_CASES.map(c=>'<tr class="click" data-cmd="est.case" data-arg="'+c.id+'">'+
        '<td class="mono" style="font-size:10.5px"><b>'+c.id+'</b><div class="i2" style="font-size:9px;margin-top:2px">'+U.esc(c.seats)+
          '</div></td>'+
        '<td class="i1" style="font-size:10.5px">'+U.esc(c.nm)+'</td>'+
        '<td class="i1" style="font-size:10px">'+U.esc(c.ruling.split('.')[0]+'.')+'</td>'+
        '<td class="i2" style="font-size:10px;color:var(--paper)">'+U.esc(c.minted.split(' — ')[0].split(
          '.')[0])+'</td>'+
        '<td>'+chip('PRESERVED','ch-warn','◮')+'</td></tr>').join(''))+
    '<div class="i2" style="font-size:10.5px;padding:8px 12px">Pattern worth noticing: in three of '+
      'six cases the DISSENT eventually shaped the law '+
      '(LC-003’s wait-state, LC-006’s RVOL-split arm, LC-002’s shadow-tracking). Preserving the losing '+
        'argument is not courtesy — it is R&D.</div>',{flush:true});
  h+=panel('CONFLICT RESOLUTION LADDER — how disagreements actually resolve','four rungs, strictly ordered; a conflict may climb, never skip — and one thing at '+
    'the top can never be appealed',
    [['1 · SEAT vs SEAT','The bus itself resolves most conflicts: lanes and the authority hierarchy ('+
      'Risk → Data → Regime-extreme → HTF → Wyckoff → SMC/ICT → Contract → Catalyst → Sentiment) rank '+
      'the claims. Most “conflicts” are two seats at different altitudes both being right.'],
     ['2 · EVIDENCE STANDARD','Unresolved by rank → both claims must cite rule IDs and evidence refs or be '+
       'discarded as opinion. Claims that survive get '+
       'sampled: the dispute becomes a measurement (LC-004’s 34-trade grading, LC-005’s six-setup block log).'],
     ['3 · THE COURT','A measured dispute with stakes becomes a docket item: named parties, exact diff, '+
       'evidence bar (GOV-030 n≥30), human sign-off, '+
       'rollback plan. Output is case law — the library above — and the dissent is filed WITH the ruling.'],
     ['4 · THE CONSTITUTION','Some questions are pre-answered and the court may not hear them: the 18 laws. '+
       'LS-112 tried (lower the 5R floor with good '+
       'evidence) and was rejected as unconstitutional, not as unpersuasive — the distinction is the whole point.']]
    .map(r=>kv(r[0],'<span style="font-size:11px;line-height:1.6">'+r[1]+'</span>')).join('')+
    '<div class="banner blk" style="margin-top:8px"><span '+
      'class="bico">⛔</span><div><b>NEVER APPEALABLE:</b> the Risk Officer veto '+prov(
      'LAW-005')+'. No override exists in any mode, for any actor, with any evidence, at any rung of this ladder. '+
      'Every other rule in this room was argued into existence; this one is the room.</div></div>');
  h+=panel('PRECEDENT INDEX — where each minted rule is enforced today','case law that does not bind is commentary; every ruling names the code path that now carries it',
    tbl(['Case','Rule minted','Now enforced in','Enforcement status'],[
     ['LC-001','first-return entry gate','PB-02 / PB-07 ARMED→TRIGGERED transitions · DET-041 return counter',
       'APPLIED — the chased-entry journal tag doubles as its regression test'],
     ['LC-002','shadow-track every 5R rejection','the Setup Archive + counterfactual tracker (Review → Autopsy)',
       'APPLIED — pass-discipline 71% is its ongoing output'],
     ['LC-003','WAIT_FOR_SPREAD packet state','LS-121 diff against the packet FSM · DET-091 workflow',
       'A/B PAPER 14/30 — the dissent that became a diff'],
     ['LC-004','pool = 2+ touches within 0.15×ATR','DET-001 threshold (HUM-118) · packet §6 liquidity maps',
       'APPLIED — cited verbatim in PKT-2231'],
     ['LC-005','no MMBM during VIX term inversion','S08 extreme-reading override (HUM-117) · PB-02 regime gate',
       'APPLIED — 6 blocked, 5 saved; standing review at n=20'],
     ['LC-006','sweep label flips at 3 bars','DET-063 close-back window (HUM-119) · PB-02 stand-down clause',
       'A/B COHORT — the RVOL-split arm is running'],
    ].map(r=>'<tr>'+
      '<td class="mono" style="font-size:10.5px"><b>'+r[0]+'</b></td>'+
      '<td class="i1" style="font-size:10.5px">'+U.esc(r[1])+'</td>'+
      '<td class="i1" style="font-size:10px">'+U.esc(r[2])+'</td>'+
      '<td class="i2" style="font-size:10px">'+U.esc(r[3])+'</td></tr>').join(''))+
    '<div class="i2" style="font-size:10.5px;padding:8px 12px">'+
      'The index is the court’s audit trail read in the other direction: given a rule in '+
        'force, find the dispute that paid for it. '+
      'A binding rule with no case behind it is either constitutional — or unexamined, and the docket '+
        'keeps a lane for exactly those.</div>',{flush:true});
  return h;
});

/* ═══════════ 9 · TRIAGE DOCTRINE — decisions.queue ═══════════ */
EST_W('decisions.queue',()=>{
  const live=PACKETS.filter(p=>p.state==='READY_FOR_HUMAN'||p.state==='RISK_BLOCKED');
  const byFresh=live.slice().sort((a,b)=>b.ttl-a.ttl);
  const expired=PACKETS.filter(p=>p.state==='EXPIRED').length;
  let h=panel('TRIAGE DOCTRINE — newest evidence first, never FIFO','evidence decays monotonically and the TTL is the decay contract '+prov(
    'packet.ttl_min')+
    ' — FIFO is fair to packets; the desk is fair to truth',
    kv('THE ORDERING RULE','<span style="font-size:11px">The queue is judged by remaining evidence freshness (TTL), not '+
      'arrival order. A packet assembled at '+
      '10:29 outranks one assembled at 10:21 even though the older one “was here first” — because at '+
        'decision time the only question is '+
      'which snapshot most resembles the present. Age is not seniority here; age is decay.</span>')+
    (byFresh.length?'<div class="kick" style="font-family:var(--mono);font-size:9.5px;letter-spacing:1.2px;color:var(--ink2);margin:8px 0 4px">THE LIVE QUEUE, BOTH ORDERINGS — COMPUTED FROM ACTUAL PACKETS</div>'+
      tbl(['Packet','Assembled','>TTL left','FIFO rank','Triage rank','Why'],
        byFresh.map((p,i)=>{const fifo=live.slice().sort((a,b)=>a.assembled<b.assembled?-1:1).findIndex(x=>x.id===p.id)+1;
          return'<tr><td class="mono"><b>'+p.id+'</b> '+p.sym+'</td><td class="mono" style="font-size:10px">'+p.assembled+
            '</td><td class="r num">'+U.mmss(p.ttl)+
            '</td><td class="r num i2">#'+fifo+'</td><td class="r num"><b>#'+(i+1)+'</b></td><td class="i2" style="font-size:10px">'+(p.state==='RISK_BLOCKED'?'blocked — triaged for awareness, not judgment':i===0?'freshest evidence · judge first':'older snapshot · decays sooner')+
            '</td></tr>'}).join('')):'<div class="empty" style="margin-top:8px"><div class="e1">QUEUE EMPTY</div>Nothing to triage — '+
              'which is itself the correct output most of the day.</div>'));
  h+=panel('THE 90-SECOND READ — four sections before the other fifteen','the packet is built so every kill-shot is cheap; read in kill-shot order and most '+
    'packets never cost you the full nineteen',
    tbl(['Seconds','Read','Section','Why FIRST'],[
     ['0–20','THE RISK MATH','§13 Entry/stop/targets + §14 Risk calculation','If the R ladder or sizing fails at current quote, nothing else matters — and it is the section '+
       'most likely to have drifted since '+
       'assembly. The desk recomputes it live; you verify you believe the stop is structural.'],
     ['20–40','THE INVALIDATION','§2 Strategy classification — the “disproven by” sentence','A thesis without a crisp disproof is not a thesis (LAW-001). If you cannot restate the '+
       'invalidation from memory after reading it, '+
       'reject on LOW_CONFIDENCE — that reflex is calibrated, trust it.'],
     ['40–65','THE DISSENT','§15 Agent votes — blocks first, then advisories','Fifteen passes tell you what the committee agreed on; the two advisories tell you '+
       'what it is worried about. Dissent is the '+
       'highest-information-per-word text in the packet — it is the only part arguing WITH you.'],
     ['65–90','THE FRESHNESS','§16 Missing/weak data + the assembly stamp + TTL','What was weak at assembly and what has aged since. A packet judged at TTL 02:00 is a different '+
       'object than the same packet at TTL 20:00 — the stamp tells you which one you are holding.'],
    ].map(r=>'<tr><td class="mono" style="font-size:10.5px">'+r[0]+'</td><td><b style="font-size:11px">'+r[1]+
      '</b></td><td class="mono" style="font-size:10px">'+r[2]+
      '</td><td class="i1" style="font-size:10.5px">'+r[3]+'</td></tr>').join(''))+
    '<div class="i2" style="font-size:10.5px;padding:8px 12px">The other fifteen sections exist for '+
      'the packets that SURVIVE these four — then you read '+
      'everything, because you are about to sign it (LAW-007). The protocol is a filter, never a substitute.</div>',{flush:true});
  h+=panel('DECISION DEBT — what unjudged packets cost','silence is a decision with worse bookkeeping; the desk bills it like one',
    '<div class="grid g4">'+
    stat('Expired unjudged · session',expired,expired?'each one journaled (LAW-018) — silence is on the record':'zero — the queue is being worked')+
    stat('Rebuild cost','≈ '+ck('slo.packet_p95_s')+'s p95','a lapsed packet must be fully reassembled '+prov(
      'slo.packet_p95_s'))+
    stat('The window','often does not wait','AUT-115: the A-grade trigger fired 7 minutes after expiry — same plan, no packet, no trade')+
    stat('Calibration cost','1 lost sample','an unjudged packet grades nobody — the Director’s calibration curve starves quietly')+
      '</div>'+
    kv('THE AUT-115 CONTRACT (auto-reopen)','<span style="font-size:11px">When the SAME plan-hash receives a fresh trigger '+
      'inside 60 minutes of expiry, the packet '+
      'auto-reopens as rev+1 with fresh freshness stamps and a compressed TTL — instead of rebuilding '+
        'from zero while the window closes. '+
      'Status: FIX PROPOSED → Learning Court; the workflow gap is named, measured, and in the pipeline '+
        'rather than recurring silently.</span>')+
    kv('THE HONEST LEDGER LINE','<span style="font-size:11px">LET_TTL_EXPIRE is a legal response to a P1 — but it '+
      'journals as a decision with a named cost, '+
      'exactly like APPROVE and REJECT do. The debt metaphor is literal: unjudged packets accrue '+
        'interest in missed windows and starved '+
      'calibration, and this panel is the statement.</span>'));
  h+=panel('TRIAGE ANTI-PATTERNS — five ways operators break queues','each observed in the wild, each with the correction the protocol already contains',
    tbl(['Anti-pattern','What it looks like','Why it fails','The correction'],[
     ['FIFO piety','judging oldest-first because it feels fair','fairness to packets is unfairness to truth — the oldest snapshot least resembles '+
       'the market you are deciding into',
       'TTL-descending order; the queue header already sorts it for you'],
     ['Cherry-reading','opening the A- before the B+ regardless of TTL','grade measures setup quality at assembly, not decision urgency — a B+ at TTL 02:00 is due NOW',
       'freshness outranks grade; grade breaks ties only'],
     ['The full read','all 19 sections, top to bottom, every packet','19 sections × 4 minutes × a 3-packet queue = the freshest packet judged stale',
       'the 90-second protocol above — kill-shots first, full read only for survivors'],
     ['Blocked-packet grooming','studying RISK_BLOCKED packets you cannot act on','blocked packets are awareness, not work — the desk re-runs them itself (AMD at 11:00)',
       'triage renders them below the line; read the blocker line, move on'],
     ['Queue camping','refreshing an empty queue instead of working the loop','decision quality comes from PERCEIVE/ORIENT/REFLECT time, not from staring at DECIDE',
       'the P1 pager exists precisely so you can leave; let it page'],
    ].map(r=>'<tr>'+
      '<td><b style="font-size:11px">'+r[0]+'</b></td>'+
      '<td class="i1" style="font-size:10.5px">'+U.esc(r[1])+'</td>'+
      '<td class="i1" style="font-size:10.5px;color:var(--warn)">'+U.esc(r[2])+'</td>'+
      '<td class="i2" style="font-size:10px">'+U.esc(r[3])+'</td></tr>').join('')),{flush:true});
  return h;
});

/* ═══════════ 10 · OPERATING LOOP — command.cockpit ═══════════ */
CMD.define({id:'est.loop',label:'Open loop stage',purpose:'Jump to the domain that owns this stage of the operating loop',audit:false,run:a=>{
  if(!a)return;const parts=a.split('.');go(parts[0],parts[1]||null);}});
EST_W('command.cockpit',()=>{
  const q=PACKETS.filter(p=>p.state==='READY_FOR_HUMAN').length;
  const blocked=PACKETS.filter(p=>p.state==='RISK_BLOCKED').length;
  const acting=POSITIONS.filter(p=>p.fsm==='MANAGING'||p.fsm==='SCALING'||p.fsm==='WORKING').length;
  const feedsOk=(typeof FEEDS!=='undefined')?FEEDS.filter(f=>f.st==='OK').length+'/'+FEEDS.filter(f=>f.st!=='OFF').length:'—';
  const jToday=JOURNAL.filter(j=>String(j.t).includes(':')).length;
  const stages=[
   {k:'PERCEIVE',v:S.dataHealth,d:'feeds '+feedsOk+' within SLO — perception degrades by dependency, never vaguely',go:'system.health',hot:S.dataHealth!=='NOMINAL'},
   {k:'ORIENT',v:REGIME.label,d:REGIME.breadth+' · the regime outranks single-name enthusiasm',go:'markets.regime',hot:false},
   {k:'DECIDE',v:q+' awaiting',d:blocked+' blocked upstream · triage newest-evidence-first, never FIFO',go:'decisions.queue',hot:q>0},
   {k:'ACT',v:acting+' open',d:U.fmt(S.openRiskR,2)+'R open risk of '+ck('risk.max_open_risk_R')+
     'R — the FSM manages, you supervise',go:'portfolio.positions',hot:false},
   {k:'REFLECT',v:jToday+' entries today',d:'taken AND rejected, all journaled — rejection reasons are data (LAW-018)',go:'review.journal',hot:false},
  ];
  let h=panel('THE OPERATING LOOP — Perceive → Orient → Decide → Act → Reflect','one loop, three clocks: the 2s engine tick runs it for machines, the session runs it for you, '+
    'the nightly batch runs it for the '+
    'rules · every stage reads LIVE from its owning store — click through',
    '<div class="funnel">'+stages.map((st,i)=>'<div class="fstage'+(st.hot?' hot':'')+'" style="cursor:pointer;min-width:130px" data-cmd="est.loop" data-arg="'+st.go+
      '"><div class="fk">'+(i+1)+' · '+st.k+
      '</div><div class="fv" style="font-size:12px">'+U.esc(String(st.v))+'</div><div class="fd">'+st.d+
        '</div></div>').join('')+
      '</div>'+
    '<div class="i2" style="font-size:10.5px;margin-top:8px">The loop is a cycle, not a line: '+
      'REFLECT feeds PERCEIVE — journal patterns become memory '+
      'rules become gate conditions (MEM-03 was born exactly this way). A desk that skips stage 5 runs '+
        'stages 1–4 on last month’s self.</div>');
  h+=panel('WHERE THE LOOP BREAKS — the named failure at every stage','each stage has one canonical way to rot, and the desk holds a specific countermeasure against '+
    'each — vagueness is how loops die',
    tbl(['Stage','How it breaks','The desk’s counter'],[
     ['PERCEIVE','a stale feed silently trusted — perception fails without announcing it','per-dependency freshness SLOs; breach blocks that dependency’s consumers and nothing else, fail-closed '+
       '(LAW-006). The drill buttons in System → Health exist so the first stale feed you meet is never a live one'],
     ['ORIENT','yesterday’s regime traded today — orientation lags reality by exactly one comfortable narrative',
       'S08 re-reads every 10 minutes; extreme readings outrank HTF context in the hierarchy; HUM-117 '+
       'proves the override has teeth (blocked 6, saved 5)'],
     ['DECIDE','the queue judged FIFO, or not at all — decision debt compounding as “busy”','packet TTLs '+prov(
       'packet.ttl_min')+' make evidence decay explicit · newest-first triage · LET_TTL_EXPIRE journals as a '+
         'decision with a named cost'],
     ['ACT','management by mood — the position becomes an argument between you and the tape',
       'the approved template FSM manages; the envelope law makes stop-widening INEXPRESSIBLE, not just '+
       'discouraged; outside the envelope '+
       'requires an amendment through the token gate (AMD-114 is one, pending now)'],
     ['REFLECT','outcome-graded review — winners canonized, disciplined losses prosecuted','process grades written at decision time (S29) · outcome blindness in blocks · the review '+
       'refusals: do not reward luck, do not punish disciplined losses'],
    ].map(r=>'<tr><td class="mono" style="font-size:10.5px"><b>'+r[0]+'</b></td><td class="i1" style="font-size:10.5px;color:var(--warn)">'+r[1]+
      '</td><td class="i1" style="font-size:10.5px">'+r[2]+
      '</td></tr>').join(''))+
    '<div class="i2" style="font-size:10.5px;padding:8px 12px">Provenance note: every number in the '+
      'loop strip above is read from live stores at render '+
      '(S.dataHealth · REGIME · PACKETS · POSITIONS · JOURNAL) — the loop panel can never disagree '+
        'with the domains it points at, because it has no numbers '+
      'of its own.</div>',{flush:true});
  h+=panel('THE THREE CLOCKS — one loop at three speeds','machine, operator, and rules run the same five stages on different cadences; most operational '+
    'confusion is two clocks being read as one',
    tbl(['Clock','Cadence','Who runs it','Perceive → Reflect at this speed','What it may change'],[
     ['ENGINE','2s tick','the deterministic spine','feeds → regime tag → packet TTLs → position FSM heartbeats → ledger telemetry',
       'positions inside their envelope; NOTHING about rules or risk limits'],
     ['SESSION','open → close','you','morning brief → regime read → queue triage → supervision → journal + exercises',
       'decisions (the enums) and amendments — through the token gate only'],
     ['NIGHTLY','02:00 batch + EOD review','S30/S31 + the court','scenario replays → drift monitors → learning proposals → court dockets → versioned diffs',
       'the rules themselves — with evidence, sign-off, and rollback (LAW-013)'],
    ].map(r=>'<tr>'+
      '<td class="mono" style="font-size:10.5px"><b>'+r[0]+'</b></td>'+
      '<td class="mono" style="font-size:10px">'+r[1]+'</td>'+
      '<td class="i1" style="font-size:10.5px">'+r[2]+'</td>'+
      '<td class="i1" style="font-size:10px">'+U.esc(r[3])+'</td>'+
      '<td class="i2" style="font-size:10px">'+U.esc(r[4])+'</td></tr>').join(''))+
    '<div class="i2" style="font-size:10.5px;padding:8px 12px">'+
    'The separation is the safety property: the fast clock cannot touch rules, the slow clock cannot '+
      'touch positions, and the middle clock — you — '+
    'touches both only through gates (enums, tokens, court). A desk where one clock can do '+
      'everything is a desk one bad hour from empty.</div>',{flush:true});
  return h;
});
