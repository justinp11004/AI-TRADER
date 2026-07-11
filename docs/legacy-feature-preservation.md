# Feature preservation map — every legacy capability and where it lives now

Directive honored: **merge and unify all features; remove none.** All 63 legacy routes (V6–V10) **plus the four early prototypes (GEN0–GEN3)** map below.
Unlike the legacy "P9 preservation registry" (which passed by checking that a function existed in the same file), every claim here is browser-verified: 38 workspaces click-tested, 0 console errors.

| Legacy route(s) | Capability | V11.1 home |
|---|---|---|
| A0 · E4 · P1 | Unified command center / executive OS / scale command | **COMMAND → Cockpit** (one next-best action; summaries deep-link) |
| Q1 | Morning brief | **MARKETS → Regime** (Morning Brief panel: posture, ranked setups, landmines, overnight learning, cost of firm) |
| Q2 | Full universe with sectors + NBBO-style table | **MARKETS → Watchlist** (24-instrument command universe + promoted set) |
| Q3 · P5 · S1 · P2 | Scanner / candidate funnel / market brain / universe scheduler | **MARKETS → Scanner Funnel** (stage counts + rejection economics) + tier/cadence spec in **SYSTEM → Health** |
| Calendar (Q1/C8) | Event risk & blackouts | **MARKETS → Calendar & Events** |
| Q4 | Ticker dossier | **RESEARCH → Overview / Structure / Wyckoff / Catalysts / History** (symbol-synchronized) |
| Q5 (×6 rewrites) · V1 · Chart Studio V4 | Chart Studio + Vision Desk multi-TF | **RESEARCH → Chart** — now a full interactive engine (Studio V4 lineage): pan/drag · wheel-zoom (clamp 30–360 bars) · timestamp-keyed crosshair with price tag · 8 drawing tools (cursor/trend/hline/zone/fib/measure/**position**/note) with T·L·Z·B·R·P·X hotkeys · EMA20/50/**200**/VWAP/BB/RSI(14) · clickable detector-cited FVG(DET-041)/OB(DET-052) zones → four-questions inspector · AI structure overlay (pivot grammar HH/HL/LH/LL + sweep + displacement + auto-fib incl. gold 70.5% A+ level) · deterministic replay scrubber (no future leakage) · 8-TF vision wall · TA-notes .md download. **ATLAS-native additions absent from Studio V4:** the **R-ruler** (measure tool reads $/%/bars/**R vs plan stop**), the **position tool** (3 clicks → entry/stop/target runs the *same live 5R gate* as the packet pipeline, PASS/BLOCK audited), **PNG snapshot export** (annotations included), and **file-to-VC-corpus** (annotated read → Setup Archive as SHADOW, counterfactual-tracked). |
| Q6 | Contract lab / chain with gates | **RESEARCH → Options & Contract** (chosen-vs-rejected + full chain with OPT-007/008/009 gate chips) |
| Q7 | Options flow tape | **RESEARCH → Flow** (session tape + confirmation-tier doctrine) |
| C1 · E0 | Verification queue / investment committee | **DECISIONS → Verification Queue** |
| C2 | Packet detail (19 sections, votes, dissent) | **DECISIONS → Packet Detail** (golden PKT-2231 verbatim) |
| C3 · S2 | Live rail / decision DAG | **DECISIONS → Committee Rail** (14-step replay scrubber, conflict resolution, run telemetry) |
| S5 | Execution gate / token / preflight | **DECISIONS → Risk Proof** (token claims + 10-check preflight + NO TOKEN·NO ORDER doctrine) |
| E1 | Decision review TP/FP/TN/FN | **REVIEW → Opportunity Autopsy** (confusion matrix + root causes) |
| E2 · V2 | Opportunity autopsy / setup archive shadow-tracking | **REVIEW → Opportunity Autopsy** (6 cases + STP archive table) |
| Q8 | Positions + management FSM | **PORTFOLIO → Positions** (envelope law, amendments, flatten) |
| Q9 | Risk cockpit | **PORTFOLIO → Risk Cockpit** |
| Q13 | Orders/fills ledger | **PORTFOLIO → Orders & Fills** + **SYSTEM → Audit Ledger** |
| M2 | Compounding program $1k→$100k | **PORTFOLIO → Paper Account** (stage ladder + 140-path seeded cone, honestly labeled) |
| Q10 · M6 | Performance lab / eval & drift | **REVIEW → Performance & Calibration** (expectancy, calibration curve, failure Pareto, per-seat drift, golden-packet regression) |
| Q11 | Journal | **REVIEW → Journal** |
| Q12 · M3 | Backtest lab / scenario engine | **REVIEW → Replay & Backtest** (BT register + parity gates + 1.28M-scenario memory) + expectancy grid in **MARKETS → Regime** |
| C6 · M5 · V3 | Learning court / training studio / brain console | **REVIEW → Learning Court** (proposals + teach loop with quiz-back minting HUM chunks + self-learning stream) |
| C4 · C5 · M1 · P6 | Agent board / deep-dive / consciousness graph / runtime | **SYSTEM → Agent Council** (34 seats, pipeline, SVG consciousness map, per-seat deep-dive) |
| M7 | Knowledge base browser | **SYSTEM → Knowledge Base** (layers, most-cited rules, retrieval doctrine) |
| C7 · Q15 | Config governance / settings & auth | **SYSTEM → Config & Laws** + **SYSTEM → Permissions** |
| C8 | Mode & session / degraded drills | **SYSTEM → Health** (drills) + **SYSTEM → Permissions** (mode ladder) |
| C9 | Evidence export | **SYSTEM → Audit Ledger** (real JSON download) |
| Q14 · M4 · S3 · P3 | Integrations / API command center / data spine / streaming fabric | **SYSTEM → Integrations** (honest TWIN / NOT CONFIGURED states) + fabric spec in **SYSTEM → Health** |
| A1 · A2 · A3 | Autonomous engine / personalities / ML blotter | **SYSTEM → Autonomy Lab** (feature-flagged, paper-only per LAW-008: 3 personas, frontier table, live sim-corpus blotter with zero survivorship) |
| E3 · P7 | Operations center / reliability | **SYSTEM → Health** (SLOs, runbooks RB-01…08, drills) |
| S4 · P9 · E8 | Contract matrix / feature registry / tab spec matrix | This document + the command registry itself (every control is a typed contract) |
| E9 | 200-scenario validation | **SYSTEM → Integrity Checks** — real assertions replacing the fabricated suite |
| S6 · E5 · E6 · E7 · P8 | Readiness / upgrade program / safety / launch / capacity-cost | `docs/READINESS.md` + capacity & unit economics in **SYSTEM → Health** |

## Early prototypes (GEN0 Enterprise OS · GEN1/GEN2 Quant Terminal · GEN3 Command OS ancestor)

| Prototype feature | V12 home |
|---|---|
| AI Copilot — "a disciplined quant analyst that will tell you NO TRADE" (⌘J, drawer chat) | Top bar **◈ Copilot** + ⌘J, everywhere |
| Trade Builder — manual plan, 12 confluence chips, verdict ladder REJECTED→WATCH_ONLY→APPROVED_REDUCED_SIZE→APPROVED | **DECISIONS → Trade Builder** (runs the same SVR risk engine as packets) |
| Editable AI Memory — lockable operator rules, CRITICAL flags, learning-queue promotions | **REVIEW → AI Memory** |
| Onboarding "discipline contract" (5R minimum · structural stops · no-trade is a position · kill switch armed) | Command banner + ⌘K "Discipline contract" |
| Manager Inbox + Conflict Resolution Board + Automation Schedules | **SYSTEM → Manager Inbox** |
| Sector rotation quilt + market internals (TRIN, ADV/DEC, up/down vol, highs/lows, regime score) | **MARKETS → Regime** |
| Behavioral risk guards (revenge-trade, post-11:00 overtrading, 2-red cooldown, PDT counter) + kill-switch auto-engage conditions + portfolio Greeks | **PORTFOLIO → Risk Cockpit** |
| P&L calendar heatmap + mistake taxonomy + rule-follow% + pattern detection | **REVIEW → Journal** |
| Key statistics (short interest, beta, ATR, dark-pool ratio) + intel grade + analyst/ownership + S/R liquidity ladder | **RESEARCH → Overview** |
| Whale/net-premium flow stats + suspicious-flow discounting | **RESEARCH → Flow** |
| Wyckoff campaign event-chip progression (PS→SC→AR→ST→Spring→Test→SOS→LPS) + P&F cause target | **RESEARCH → Wyckoff & Volume** |
| Keyboard 1–9 = decision enums (judgment room is keyboard-first) | **DECISIONS → Packet Detail** |
| "Rejection reasons considered" — the desk argues against itself | **DECISIONS → Packet Detail** |
| Telegram pocket-gate preview + never-on-mobile doctrine | **DECISIONS → Packet Detail** + Permissions |
| Session-phase expectancy (lunch −0.21R → throttle proposal) + grade-monotonicity test | **REVIEW → Performance** |
| Strategy promotion pipeline FSM (SIM→PAPER→PARITY→LIVE-min→SCALE) | **REVIEW → Replay & Backtest** |
| Per-seat forward plans ("the mesh always knows its next move") + reasoning streams | **SYSTEM → Agent Council** (deep-dive) |
| Session progress bar · evidence vault · go-live QA gates · alert doctrine ("P0 interrupts life") | Top bar · Knowledge Base · Integrity · Alert Center |
| Promotion economics ($30/day promoted vs $3k/day naive) | **MARKETS → Scanner** |

## SYNCHRONY report organs (app x brain reconciliation, v13_4)

| Report mandate | V12.1 home | Nature |
|---|---|---|
| Boot Self-Test S1-S8 (eight LAW smoke tests) | **SYSTEM → Integrity** — runs at every session open | REAL assertions against the live boundary |
| Golden-Test Runner (GT fixtures, input/expected/actual) | **SYSTEM → Integrity** | REAL — 5 fixtures execute, diffs rendered verbatim |
| Stress Range (failure library vs current build) | **SYSTEM → Integrity** | REAL — 4 scenarios execute |
| Calibration Ledger (per-seat deciles, Brier) | **REVIEW → Performance** | Demo data, honest shape |
| Ask Inbox (questions → answers embed as ground truth) | **REVIEW → Ask Inbox** | Interactive roundtrip works |
| MHH Board (flaws, five steps, correction lines) | **REVIEW → AI Memory** | Demo data, honest shape |
| Sample-Block Tracker (Douglas blocks, P&L blurred mid-block) | **REVIEW → Performance** | CSS-enforced psychology |
| Barometer / Position Ledger (DET-LEDGER 1-4) | **MARKETS → Regime** (ambient strip) | Demo data |
| Ivory paper-document packet + signature line (V9 crown jewel) | **DECISIONS → Packet Detail** | Restored |
| Six Director self-audit answers per decision | **DECISIONS → Packet Detail** | Restored |
| Zone-click four-questions inspector | **RESEARCH → Chart** | Interactive |
| Config changelog (failure→fix per release) + rules_version badge | **SYSTEM → Config** + rail foot | Real history of this build |
| Universe tier caps (t1_max 300 / watch 50 / promotions 40) + health SLAs + the hard invariant | **CONFIG** + **MARKETS → Scanner** + **SYSTEM → Health** | Config + spec surfaces |
| needs_user_rule → ask-card conversion (SIM-0001 refusal doctrine) | **REVIEW → Autopsy** (AUT-118 button) | Interactive |

## V11 UNIFIED build absorption (final delta pass)

| UNIFIED capability | V12.2 home |
|---|---|
| Chart: Bollinger bands · RSI(14) sub-pane · alert-from-chart (arms a real P2 alert) | **RESEARCH → Chart** |
| L2 order book (5 levels) + Time & Sales with block flags | **RESEARCH → Flow** (demo twin, watermarked) |
| Correlation heat-matrix (NVDA·AMD 0.84 → cluster cap evidence, RISK-041) | **PORTFOLIO → Exposure** |
| Compute & queue fabric: worker pools, autoscale policy, backpressure lanes, event topics + envelope contract | **SYSTEM → Health** |
| LLM invocation policy (raw universe = 0 model calls) + tier routing + spend bound | **SYSTEM → Agent Council** |
| S6 production-audit P0 findings (vote drift, human int-cast, missing fan-in, early risk gate, scale misconception) — kept visible as fixed-by-construction | **SYSTEM → Integrity** |
| Graduated capital ladder (replay → paper parity → shadow → limited live → scaled: NOT EARNED) | **SYSTEM → Integrity** |
| E4 executive brief (best setup · hidden risk · most important rejection · next human action) | **COMMAND → Cockpit** |
| Real backend transport seam — /v1/health probe, fail-closed, never renders fiction | **SYSTEM → Integrations** |
| Small-scale cost meter ($1,473/mo single-operator twin of the $12.9k fabric) | **SYSTEM → Integrations** |
