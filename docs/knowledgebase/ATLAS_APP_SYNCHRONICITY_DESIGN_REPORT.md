---
id: v13_4_app_synchronicity_report
title: "ATLAS APP × BRAIN SYNCHRONICITY — Frontend Corpus Audit, Requirements Reconciliation & V11 Design Specification"
layer: software_spec
load_target: rag
status: PROPOSED (requires_justin_review: true)
sources: [18 uploaded terminal builds, MASTER_FINAL_V3.1 canon (01_CORE complete), V9 redesign session, Command-OS polish session, SIM-0001, runtime contract layer]
date: 2026-07-11
---

# ATLAS APP × BRAIN SYNCHRONICITY REPORT

## Part 0 — Executive Summary

Eighteen terminal builds were audited file-by-file: route registries extracted, feature keywords
counted, lineage reconstructed against the two build sessions that produced them, and the whole
corpus reconciled against the V3.1 brain — the frontend binding contract (10_HUMAN_INTERFACE/01),
the 19-section verification packet, the seventeen runtime schemas, the tool registry, the
scheduler, the conformance suite, and the SIM-0001 build list.

**The verdict in one paragraph.** You do not have eighteen apps; you have **three product lanes
at different maturities**, and the best app is not any single file — it is a convergence.
Lane 1 (the Command OS lane, culminating in `atlas-ai-trader__3_.html`, 509KB, 67 routes,
**zero `Math.random`**) has the cleanest engineering discipline and the honest simulation layer.
Lane 2 (the PRIME lane, culminating in `ATLAS_PRIME_V10_PRODUCTION_SCALE_FABRIC.html`, 1.18MB,
95 routes) has the deepest feature breadth, including an executive suite and systems views the
brain genuinely needs. Lane 3 (the `index*` Master Admin lane, 37–80KB) is a lightweight
ops/admin console — a different product that should be absorbed, not maintained. The V9
Production builds contribute the strongest *human-factors* inventions of the whole corpus (the
paper-document packet, the semantic color law, the 6-gate LIVE checklist, the reject-with-
forward-outcome flow, missed-winner postmortems) — several of which **regressed out of the
later builds** and must be restored.

**The synchronicity thesis.** The canon already states the app's entire constitution in one
line: *"The UI renders only schema objects; it computes nothing"* (frontend contract, LAW-014
surface). Every gap found in this audit is a violation or an absence of that law: views that
compute locally instead of rendering state, transports that don't exist (zero WebSocket, zero
Supabase, zero Telegram across all eighteen files), brain objects with no surface (calibration
ledger, ask ledger, MHH board, sample blocks, golden-test runner, stress-scenario range, boot
self-test panel, intake/absorption status, barometer, config-version changelog), and simulated
data where contract payloads should flow. Part V specifies **ATLAS PRIME V11 "SYNCHRONY"** —
one app, the V9 seven-stage operating loop as primary navigation, the full route superset
mapped beneath it, every panel stamped with its schema source, WebSocket topic, owning agent
seat, and freshness state, and a tri-mode data plane (SIM / PAPER / LIVE) where SIM replays the
golden fixtures and stress scenarios — turning the terminal itself into the conformance runner.

---

### 0.1 The universe-scale mandate (Principal directive, 2026-07-11)

A standing requirement is hereby elevated to first-class: **ATLAS analyzes 5,000+ symbols
simultaneously, at constant rate, always** — the full optionable universe under continuous
machine surveillance, with the listed universe (7,123 tickers already seeded in the bundle's
universe workbook) under daily coverage. This is not a scanner feature; it is an architectural
invariant that shapes the engine, the transport, the storage, and the interface. Addendum A
specifies it end to end; the gap matrix gains rows 41–44 for it; phases W2 and W4 gain
scale-acceptance gates for it. The one-sentence version of the whole design: **the engine
watches 5,000 constantly so the firm only ever thinks about the survivors** — deterministic
columnar workers score the universe every cycle, and the 34 LLM seats receive only tier
promotions, exactly as the stack's universe-economics law and Wyckoff's own cold-read protocol
(ordinary fluctuations earn no attention; repeated strength promotes to detailed watch)
already command.

---

## Part I — The Frontend Corpus: Complete Audit

### 1.1 Inventory and lineage

| File | Size | Routes | Math.random | Reading |
|---|---:|---:|---:|---|
| atlas-ai-trader.html | 239KB | 19 | 11 | Command OS base ("Autonomous Quant Terminal") |
| atlas-ai-trader__1_.html | 239KB | 19 | 11 | Byte-duplicate of the base |
| atlas-ai-trader__2_.html | 284KB | 22 | 13 | Base + first expansion pass |
| **atlas-ai-trader__3_.html** | **509KB** | **67** | **0** | **Command OS current — today's polish session; smoke-matrix validated** |
| index.html | 37KB | — | 0 | Master Admin Frontend Preview V13 |
| index_1_.html | 58KB | — | 1 | Master Admin V14 Preview |
| index__1_.html | 61KB | — | 0 | Master Admin V15 |
| index_3_.html | 80KB | — | 1 | Master Admin Rebuild |
| index_4_.html | 59KB | — | 1 | Master Admin Rebuild (variant) |
| index_5_.html / index_5___1_.html | 60KB ×2 | — | 2 | "Enterprise Command OS" admin variant (duplicates) |
| ATLAS_AI_TRADER_PRIME_V6_INSTITUTIONAL.html | 887KB | 81 | 1 | PRIME lane, institutional pass |
| ATLAS_AI_TRADER_PRIME_V7_BILLION_DOLLAR_OS.html | 950KB | 85 | 1 | PRIME V7 |
| ATLAS_AI_TRADER_PRIME_V8_TAB_INTELLIGENCE_OS.html | 1.11MB | 86 | 1 | PRIME V8 (the 43-visible-tab, 6-nav-group build) |
| ATLAS_Prime_V9_Production.html (+ __1_ duplicate) | 1.12MB ×2 | 86 | 1 | The 7-loop institutional redesign |
| **ATLAS_PRIME_V10_PRODUCTION_SCALE_FABRIC.html** | **1.18MB** | **95** | 6 | **PRIME current — widest breadth** |
| ATLAS_AI_TRADER_CHART_STUDIO_V4.html | 728KB | 76 | 0 | Dedicated charting product sharing the core route fabric |

Housekeeping findings before features: three byte-duplicates exist (`__1_` of the base, `__1_`
of V9, `index_5___1_`) and should be pruned; and V8/V9/V10 all still carry the internal
`<title>` "ATLAS Prime V7 — Billion-Dollar Trading Operating System" — a version-hygiene defect
that matters because the brain's changelog discipline (17_RUNTIME_CONTRACT) requires the
running app to display its true `rules_version` pairing.

### 1.2 Lane 1 — Command OS (`atlas-ai-trader` series)

The base (19 routes) grew to 22, then today's session rebuilt it into the 67-route Command OS
with a smoke-test matrix and the single most important engineering property in the corpus:
**zero `Math.random`** — every number on screen flows from a deterministic simulation layer
rather than noise, which is precisely the substrate needed to swap in real WebSocket payloads
without re-architecting views. Its route registry, extracted verbatim:

**Q-family (Quant Terminal, 15):** Q1 Morning Brief · Q2 Markets · Q3 Scanner · Q4 Ticker
Dossier · Q5 Chart Workspace · Q6 Contract Lab · Q7 Flow · Q8 Positions · Q9 Risk Cockpit ·
Q10 Performance Lab · Q11 Journal · Q12 Backtest Lab · Q13 Ledger · Q14 Integrations ·
Q15 Settings/Auth.
**C-family (Command, 9):** C1 Verification Queue · C2 Packet Detail · C3 Live Rail · C4 Agent
Board · C5 Agent Deep-Dive · C6 Learning Court · C7 Config Governance · C8 Mode & Session ·
C9 Evidence Export.
**M-family (Mind, 7):** M1 Consciousness Graph · M2 Compounding Program · M3 Scenario
Engine·DB · M4 API Command Center · M5 Training Studio · M6 Eval & Drift Lab · M7 Knowledge
Base.
**A-family (Autonomy, 3):** A1 Autonomous Engine · A2 Trading Personalities · A3 Autonomous
Blotter·ML corpus.
**V-family (Vision, 3):** V1 Vision Desk·Multi-TF · V2 Setup Archive · V3 Brain Console.

Feature-keyword density confirms real depth, not shells: kill-switch logic (86 references),
approval tokens (41), TTL countdowns (48), reject flows (66), evidence handling (47), replay
(35), drift (33), 5R (43 references), and — significantly — **39 direct LAW-0xx citations**,
meaning the constitution is quoted inside the UI copy. Killzones (20), Wyckoff (9), RVOL (26),
regime (38) show the perception vocabulary is surfaced. Calibration appears 8 times — a seed of
the calibration organ already exists here. Priority taxonomy discovered in the code: every
surfaced item carries a P0–P3 class (**P0 Capital-or-safety-now · P1 Decision-needed/integrity ·
P2 Awareness · P3 Record**) with tier weights — an attention system the brain's language
protocol never specified but should adopt canonically.

### 1.3 Lane 2 — PRIME (V6 → V10)

V6 (81 routes) through V8 established the breadth; the V9 session (documented in the build
log) executed the institutional redesign: the visible 43-tab sprawl was collapsed into a
**seven-stage operating loop — Desk → Market → Hunt → Judge → Trade → Risk → Learn — plus
System**, nothing deeper than two clicks. V9's signature inventions, each verified against the
session record:

1. **The paper-document Verification Packet** — the only light-colored, serif/ivory surface in
   the dark terminal, physically representing LAW-007's "a human must sign." The strongest
   single UX idea in the corpus.
2. **The semantic color law** — gold = human signature required, green = long/pass, red =
   halt/short, blue = informational — with the Saira / IBM Plex Sans/Mono/Serif type system.
3. **The full sign flow** — type APPROVE → token issued with TTL → execution gate spends the
   token → paper position created. This is the L6 approval-token architecture of the runtime
   contract, already built as UX.
4. **PAPER default, LIVE locked behind a six-gate checklist** — LAW-008's promotion ladder as
   an interface.
5. **Reject flow with forward outcome tracking** and **missed-winner postmortems** (PM-031
   NFLX, PM-029 PLTR, PM-027 flow audit) — LAW-018's "rejected trades journal too," rendered.
6. **Purpose strips naming the owning agent seat on every panel**, an **Explain mode** (`?`)
   annotating every control, a **⌘K command palette**, a **two-step kill switch reachable from
   any screen**, and an **8-release in-app changelog** (V9.0–V9.7) each documenting a simulated
   failure and its fix.

V10 (95 routes) kept the full C/M/Q/A/V fabric and added two families. The **E-suite
(Executive, 10):** E0 Investment Committee · E1 Decision Review · E2 Opportunity Autopsy ·
E3 Operations Center · E4 Executive OS · E5 1,000-Upgrade Control · E6 Safety & Validation ·
E7 Institutional Launch · E8 Tab Production Matrix · E9 Eight-Pass Validation. The **S-suite
(Systems, 6):** S1 Market Brain · S2 Decision DAG · S3 Data Spine · S4 Contract Matrix ·
S5 Execution Gate · S6 Production Readiness — this S-suite maps almost one-to-one onto the
stack build order (data spine, LangGraph DAG, execution gate) and onto the new runtime-contract
layer, which is why V10 matters despite its bulk. Keyword depth peaks here: replay 112,
evidence 116, reject 108, 5R 94, calibration 20, verification-packet 7. A regression note:
V10 reintroduced 6 `Math.random` sites into a lane that V9 had nearly cleaned.

### 1.4 Lane 3 — Master Admin (`index*` series)

Six small builds (V13 → V15 → "Enterprise Command OS") forming an **operator/admin console**:
KB and agent administration, simplified packet approval (APPROVE 7–11 references), Wyckoff/5R
vocabulary present but thin, no tokens, no TTL, no kill-switch depth. Its legitimate unique
value is the *administration* frame — user/settings/connector management — which V11 should
absorb as a System-area capability rather than a separate product. Recommendation: freeze the
lane.

### 1.5 Chart Studio V4

728KB, 76 routes, zero `Math.random` — a professional charting product sharing the same core
route fabric (C/M/Q/S/V present) with the chart workspace as its center of gravity. Two
strategic facts: (a) it proves the canvas rendering engine can carry annotation overlays at
production quality; (b) the L8 stack spec designates TradingView Lightweight Charts as the
rendering engine with engine annotations as overlays — so Studio's role in V11 is to donate its
drawing/annotation UX (the tools that will label VC-corpus charts) on top of the Lightweight
Charts substrate, not to remain a parallel renderer.

---

## Part II — The Consolidated Feature Superset

Deduplicating all eighteen builds yields the complete feature estate. Everything below exists
somewhere in the corpus today (lane of best implementation in parentheses).

**Market & intelligence:** Morning Brief (CmdOS) · Markets board (CmdOS) · Scanner (CmdOS) ·
Ticker Dossier / Stock Intelligence DB with per-ticker deep pages reachable by clicking any
symbol anywhere (V6/V7 pillar) · Chart Workspace (Studio) · Multi-timeframe Vision Desk
(CmdOS) · Flow view (CmdOS) · Killzone/session awareness (both flagships) · Regime surfaces
(V10 densest) · Setup Archive (CmdOS).

**Judgment & governance:** Verification Queue → Packet Detail (both) · the paper-document
packet with gold-signature semantics (V9) · Live Rail streaming pipeline-stage votes (both) ·
Agent Board 34 seats + Agent Deep-Dive with Live/History/Future/Governance tabs (V6/V7
pillar → C4/C5) · Learning Court (both) · Config Governance (both) · rule promotion ladder
requiring principal signature (V9) · reject flow with reason codes and forward outcome tracking
(V9) · missed-winner postmortems (V9) · Investment Committee / Decision Review / Opportunity
Autopsy (V10 E-suite).

**Execution & risk:** Positions blotter (CmdOS) · Contract Lab (CmdOS) · Risk Cockpit (CmdOS) ·
approval tokens with TTL countdowns (CmdOS/V9/V10) · type-APPROVE sign flow → token → gate →
position (V9) · two-step kill switch from any screen (V9; kill logic densest in V10) · PAPER
default with LIVE behind six gates (V9) · Execution Gate systems view (V10 S5) · Ledger
(CmdOS Q13).

**Learning & performance:** Journal (CmdOS) · Performance Lab with equity curve and trade
analytics (V6/V7 pillar → Q10) · Backtest Lab (CmdOS) · Replay depth (V10, 112 refs) · Eval &
Drift Lab (M6) · Training Studio (M5) · calibration seeds (V10/CmdOS) · Autonomous Blotter as
ML corpus (A3) · in-app release changelog with failure→fix entries (V9).

**Mind & system:** Consciousness Graph (M1) · Scenario Engine·DB (M3) · Knowledge Base browser
(M7) · Brain Console (V3) · API Command Center (M4) · Integrations health board (V6/V7 pillar →
Q14) · Data Spine / Decision DAG / Market Brain / Production Readiness (V10 S-suite) ·
Compounding Program (M2) · Trading Personalities (A2) · Settings/Auth shell (Q15) · Evidence
Export with content hashing (C9) · Mode & Session control (C8).

**UX systems:** semantic color law (V9) · P0–P3 priority taxonomy (CmdOS) · purpose strips
naming owning seats (V9) · Explain mode (V9; present in flagships) · ⌘K palette (V9) · TTL
chips (flagships) · LAW citations rendered in-context (39–43 per flagship) · deterministic
simulation layer with zero-noise data (CmdOS/Studio).

This is a genuinely elite estate — roughly seventy distinct capabilities. The problem V11
solves is not invention; it is **binding**: connecting this estate to the brain's contract so
every one of those panels renders truth instead of theater.

---

## Part III — What the Brain Actually Requires the App to Do

This section is derived line-by-line from the V3.1 canon: the frontend binding contract
(10_HUMAN_INTERFACE/01), the verification packet spec (10/00), the language protocol (10/02),
the consciousness state (01_MIND/00), the runtime contract (17_RUNTIME_CONTRACT), the schemas
directory (17 objects), the conformance suite (18_CONFORMANCE), and the SIM-0001 build list.
These are requirements, not preferences — most carry a LAW number.

### 3.1 The constitutional rendering law

The frontend contract states the whole architecture in two sentences: *the UI renders only
schema objects; it computes nothing* — and *all enums everywhere come from schemas; the UI can
never invent a decision state* (the LAW-014 surface). Operationally this means: every number,
grade, state word, and countdown on screen must be traceable to a field in one of the seventeen
schemas (`trade_plan`, `agent_vote`, `verification_packet`, `consciousness_state`,
`ticker_intel`, `trade_outcome_review`, `learning_suggestion`, `evt_event`, `feed_bar`,
`feed_quote`, `feed_option_chain_row`, `feed_catalyst_item`, `execution_fill`,
`calibration_row`, `ask_ledger_card`, `mhh_record`, `stress_scenario`) or to a config key
(LAW-015: config is the single source of numeric truth). Any view computing its own expectancy,
its own R, or its own grade is out of contract — the brain computes; the app shows.

### 3.2 The eight contracted surfaces (canon-mandated views)

The binding contract enumerates the mandatory surfaces and their exact bindings: **Head
Director Live Rail** bound to pipeline-stage events in agents.yaml order plus the agent_vote
stream, blockers rendered red with `hard_blockers[]` verbatim; **Agent Status board** for all
34 seats with heartbeat and last vote, going amber when a vote is staler than that seat's
cadence (the DataIntegrity mirror); **Director Packet** bound to the packet schema, its
generate button server-enabled only at 19/19 sections complete; **Human Actions** bound to the
section-17 enum (APPROVE_LIVE · APPROVE_REDUCED_SIZE · APPROVE_PAPER_ONLY · WAIT_FOR_TRIGGER ·
MODIFY_LEVELS · REJECT_BAD_TRADE · REJECT_BAD_CONTRACT · REJECT_NEEDS_MORE_DATA ·
LOG_AND_REVIEW) with rejection reason codes stored verbatim; **Learning Queue** bound to
learning_suggestion plus governance status with the rejected-store visible (anti-nag
transparency); **Kill Switch / MODE / LATENCY** bound to global consciousness_state, with
KILL_SWITCH_ACTIVE locking all order UI; the **Quant Terminal views** (command, agents, intel,
risk, smartmoney, builder) bound respectively to global state, votes, 22-section ticker
records, the risk-engine snapshot with limits-versus-used and cluster sums, liquidity and zone
chart overlays drawn from `state.liquidity`/`state.zones`, and a read-only playbooks.yaml
editor gated by governance; and **Evidence Export** producing packet + votes + state snapshot,
content-hashed. The contract even fixes the transport vocabulary: WebSocket topics
`state.global`, `state.symbol.{X}`, `votes.{trade_id}`, `packets`, `fills`, `learning`.

### 3.3 The interaction doctrine and language protocol

Every zone click must answer four questions — why is it valid, what invalidates it, which
contract fits, is this early/clean/late (the TradingView-cockpit doctrine). All copy obeys the
language protocol: "sweep confirmed" only after reclaim; "CHoCH warning" until MSS confirms;
never "guaranteed," never "this has to fill," never identity claims about who is buying — the
app's microcopy is a compliance surface, not decoration. The Director's six self-audit answers
render with every final decision. And the anti-drift rule extends to the UI: text arriving in
feed payloads (news headlines, filings) renders as data and is never executed as instruction.

### 3.4 State, freshness, and the risk_mode FSM as ambient truth

The consciousness state is the working memory and the UI is its mirror at two scopes — global
and per-symbol (the 22-section ticker record). Three of its fields must be *ambient*, visible
from every route: `risk_mode` (normal / reduced / cooldown / blocked / kill_switch — each with
its exact UI consequence, e.g. cooldown shows the timer, blocked disables entry surfaces,
kill_switch locks order UI pending explicit human reset), `freshness` (LAW-006: stale data
visibly poisons everything downstream — every panel needs a staleness chip fed by feed
timestamps against the freshness gate), and `autonomy` mode with LAW-008's promotion ladder
rendered as the six-gate LIVE checklist V9 already built.

### 3.5 The runtime-contract obligations (new since V3.1)

The tool registry makes the UI's privilege model explicit: order controls exist only where seat
25's `place_order_intent` is legal, and the approval-token flow (packet → typed APPROVE →
token with TTL → gate spends token → `execution_fill` → journal) is the only path to a fill —
tokenless order attempts must be *impossible to express* in the interface, not merely refused
by the server. `scheduler.yaml` obliges cadence indicators: each panel shows which clock feeds
it (1m/5m/15m/1h/EOD/overnight) and when it last ticked. `BOOT_AND_SELFTEST` obliges a visible
boot report: the eight LAW smoke tests (S1–S8) render green before the session opens, and any
FAIL pins the terminal in `risk_mode: blocked` with the failing test named. The changelog
discipline obliges the app to display its `rules_version` and refuse to run against a
mismatched KB index — the drift guard as a login-screen fact.

### 3.6 Surfaces the learning organs demand (new since the V13.4 additions)

Each new schema is a view waiting to exist. `calibration_row` demands a **Calibration Ledger**:
per-seat reliability curves (stated confidence decile vs realized hit rate, Brier score,
regime-filtered) — the honest answer to "which agent's read was wrong," rendered. 
`ask_ledger_card` demands an **Ask Inbox**: Justin's queued question cards with evidence
attachments (EVT ids, VC charts, packet links), tap-to-answer options, and the promise that
answers embed as labeled ground truth. `mhh_record` demands an **MHH Board**: open flaws
(human and machine), their five steps, the injected correction line, sessions-silent counters.
`sample_blocks` demands a **Block Tracker**: the Douglas 20-trade blocks per playbook ×
personality, pre-accepted worst case, flawless-execution rate as the primary metric, PnL
visible only at block boundaries — the UI must literally refuse mid-block P&L judgment framing.
`stress_scenario` demands a **Stress Range**: run the scenario library against the current
build, expected-vs-actual gate behavior, red on any divergence. The conformance suite demands a
**Golden-Test Runner**: fixtures executed against the engine with input/expected/actual diffs —
CI's green light as a first-class view. The intake tier demands an **Absorption Status** board:
each intake item's ladder position (PENDING → absorbed → deconflicted → PROPOSED delta →
approved → merged) with conflict-ledger items (CR-A1..A3) surfaced. And the visual corpus
demands a **VC Browser**: annotated charts with sidecar metadata, machine-vs-operator label
diffs when the engine goes live.

### 3.7 The perception layer on the chart

The chart workspace is not a chart; it is the debugging window into the machine's eyes ("see
what agents see"). Required overlays, all driven by `evt_event` and per-symbol state, never
drawn freehand by the UI: HTF pools (EQH/EQL, PDH/PDL, PWH/PWL), dealing range with EQ and
premium/discount shading, OTE band, zones with mitigation counts and freshness, displacement
legs with scores, killzone time shading, entry/stop/target boxes from trade_plan, the DOL
marker, and the barometer strip (DET-LEDGER positions 1–4). Studio's annotation tooling becomes
the human-side counterpart: the operator draws, the sidecar YAML is generated, VC-corpus
entries accrue.

### 3.8 What the SIM-0001 refusal obliges the app to show

The dry run proved the pipeline's most common early output will be principled refusal. The app
must make refusal *legible and valuable*: every NO_TRADE / WATCH_ONLY carries its
hard_blockers verbatim, its two-sided conditional hypotheses with required confirmations, and
one-tap conversion of any `needs_user_rule` into an ask-ledger card. A terminal that only
celebrates trades will feel broken during exactly the phase when the system is working best.

---

## Part IV — The Gap Matrix: Corpus vs. Requirements

Legend: **EXISTS** (built and credible) · **PARTIAL** (present but incomplete against spec) ·
**SIM-ONLY** (built but fed by local simulation with no transport) · **MISSING** (no surface).
Evidence cites lane and extraction counts.

| # | Requirement (source) | Status | Evidence & gap detail |
|---|---|---|---|
| 1 | UI renders schemas only, computes nothing (contract) | PARTIAL | Views exist; no schema validation at render; local computation present in all lanes |
| 2 | Live Rail w/ verbatim hard_blockers (contract) | SIM-ONLY | C3 both flagships; no votes.{trade_id} transport |
| 3 | Agent Board 34 seats + staleness amber (contract) | SIM-ONLY | C4/C5 + V6-pillar Ops Center; heartbeat simulated |
| 4 | 19-section Packet, server-gated generate (LAW-007) | PARTIAL | Packet views exist (refs 2–7); 19/19 server flag absent; V9 paper-document styling is the target treatment |
| 5 | Section-17 enum + reason codes verbatim (contract) | PARTIAL | APPROVE/reject flows dense (52–108 refs); enum fidelity unverified; reason-code persistence absent |
| 6 | Sign flow: typed APPROVE → TTL token → gate → fill (L6) | EXISTS (V9) / SIM-ONLY | Full flow built in V9; tokens 41–64 refs, TTL 48–54; no server issuance, no execution_fill payloads |
| 7 | Kill switch: two-step, any screen, locks order UI (LAW-011/kill spec) | EXISTS / SIM-ONLY | kill refs 86–104; state lock local only |
| 8 | risk_mode FSM ambient w/ exact per-mode consequences | PARTIAL | Mode & Session (C8) exists; per-mode UI consequences not systematically enforced |
| 9 | Freshness/LATENCY chips everywhere (LAW-006) | PARTIAL | Latency concepts present; no per-panel staleness against feed timestamps |
| 10 | PAPER default, LIVE behind 6 gates (LAW-008) | EXISTS (V9) | Restore into V11; wire gates to promotion-ladder config |
| 11 | Learning Queue + visible rejected-store (LAW-013) | PARTIAL | C6 Learning Court both flagships; rejected-store visibility unverified |
| 12 | Config Governance, read-only editor gated (contract) | EXISTS | C7 both flagships |
| 13 | Evidence Export, content-hashed (contract) | EXISTS | C9; hashing present per session record |
| 14 | Ticker 22-section dossier (contract/intel view) | EXISTS | Q4 + V6 Stock-Intelligence pillar — strongest inherited feature |
| 15 | Risk Cockpit: limits vs used + cluster sums (contract) | PARTIAL | Q9 exists; correlation-cluster sums vs config unverified |
| 16 | Chart overlays from state (pools/zones/PD/killzones/boxes) | PARTIAL | Studio proves rendering; overlays not bound to evt_event/state objects |
| 17 | Zone-click four-questions interaction (doctrine) | MISSING | Not found in any lane |
| 18 | Six self-audit answers rendered per decision | MISSING | Not found |
| 19 | Language-protocol-compliant microcopy | PARTIAL | LAW citations rendered (39–43); protected-vocabulary linting absent |
| 20 | WebSocket transport, contract topics | MISSING | 0 references in all 18 files |
| 21 | Supabase Auth + persistence (L8) | MISSING | 0 references; Q15 is a shell |
| 22 | Telegram approval parity (L6) | MISSING | 0 references |
| 23 | Broker abstraction / order-intent payloads (schemas) | MISSING | No execution_fill / order-intent wiring |
| 24 | Calibration Ledger view (calibration_row) | PARTIAL-SEED | calibration refs 8–20; no reliability-curve view |
| 25 | Ask Inbox (ask_ledger_card) | MISSING | 0 across corpus |
| 26 | MHH Board (mhh_record) | MISSING | 0 across corpus |
| 27 | Sample-Block Tracker w/ boundary-only P&L (Douglas) | MISSING | 1–2 stray mentions only |
| 28 | Golden-Test Runner (18_CONFORMANCE) | MISSING | "golden" 3 refs, no runner |
| 29 | Stress Range (stress_scenario) | PARTIAL | M3 Scenario Engine·DB exists — right bones, wrong payloads; not bound to stress schema/CI |
| 30 | Boot Self-Test panel (S1–S8) | MISSING | No surface; V10 E9 "Eight-Pass Validation" is adjacent bones |
| 31 | Intake/Absorption status board (07 tier) | MISSING | No surface |
| 32 | VC corpus browser + annotation export | PARTIAL | Studio annotation UX exists; no sidecar generation, no diff view |
| 33 | Barometer / Position-Ledger view (DET-LEDGER, CC-15) | MISSING | barometer 1 stray ref per flagship |
| 34 | rules_version display + KB-mismatch refusal (changelog discipline) | MISSING | Title strings literally wrong (V8–V10 say "V7") |
| 35 | Reject-with-forward-outcome + postmortems (LAW-018) | EXISTS (V9) → REGRESSED | postmortem = 0 in CmdOS __3_ and V10; must be restored |
| 36 | Scheduler cadence indicators per panel | MISSING | No cadence stamps |
| 37 | P0–P3 priority taxonomy | EXISTS (CmdOS) | Adopt canonically; not yet in canon — reverse-absorb into 10_HUMAN_INTERFACE |
| 38 | ⌘K palette, Explain mode, purpose strips | EXISTS (V9; Explain in flagships) | Carry forward |
| 39 | Zero-noise data layer (no Math.random on live path) | EXISTS (CmdOS __3_, Studio) | The convergence base; V10 regressed to 6 sites |
| 40 | GEX / dealer-positioning panel | MISSING (correctly) | Blocked on Batch A2 absorption — placeholder only |
| 41 | Universe funnel at 5,000+ constant (mandate 0.1) | MISSING | Q3 Scanner is a list, not a funnel; no universe counters/heatmap/promotion stream in any lane |
| 42 | Universe-scale WS topics (summary/promotions/anomalies) | MISSING | Contract topics are per-symbol only; naive per-symbol subscription is impossible at 5,000 |
| 43 | Engine throughput budget (full-universe pass SLAs) | MISSING | No stated compute budget anywhere in corpus or build spec |
| 44 | Per-tier storage & retention policy at universe scale | MISSING | DB schema has market_bars; no hypertable/partition/retention design for 5,000×minutes |

**Summary counts: 8 EXISTS · 13 PARTIAL/SIM-ONLY · 23 MISSING** (rows 41–44 added under the universe-scale mandate) — and the nineteen missing
items cluster almost perfectly into two classes: *transport* (20–23) and *the learning/
conformance organs* (24–34). Which is the deepest finding of this audit: the corpus already
built the trading terminal; what it has never built is the **learning institution around it** —
precisely the organs this project added to the brain this week. The app and the brain have the
same gap profile, which makes the convergence design straightforward.

---

## Part V — ATLAS PRIME V11 "SYNCHRONY": The Convergence Design Specification

One app. The Command OS `__3_` build is the **engineering base** (zero-noise data layer, 67
disciplined routes, smoke matrix). V10 donates its **breadth** (E-suite, S-suite). V9 donates
its **human-factors layer** (paper packet, semantic color law, sign flow, six-gate LIVE,
postmortems, palette, Explain, purpose strips). Studio donates its **annotation tooling**. The
admin lane donates its administration frame into System and is then retired. Below is the
specification a build session can execute directly.

### 5.1 Information architecture: the seven-loop spine over the route superset

Primary navigation is V9's operating loop — because it mirrors the 20-step pipeline and the
cognitive cycle (PERCEIVE→ORIENT→DECIDE→ACT→REFLECT) rather than a feature taxonomy. Every
route from every lane maps beneath it; nothing is deeper than two clicks; the ⌘K palette
reaches everything in one.

**DESK** (the operator's morning) — Q1 Morning Brief · A0 Unified Command Center · E4
Executive OS · P0–P3 priority stream · Boot Self-Test report (new) · rules_version badge (new).
**MARKET** (perceive) — Q2 Markets · regime panel · Q3 Scanner · V1 Vision Desk · Q7 Flow ·
Barometer/Position-Ledger (new) · killzone clock · S1 Market Brain.
**HUNT** (orient) — Q4 Ticker Dossier (22-section state mirror) · Q5 Chart Workspace with the
full overlay stack + Studio annotation tools + VC Browser (new) · V2 Setup Archive · M3
Scenario Engine · hypothesis board (scanning/forming/armed from per-symbol state).
**JUDGE** (decide) — C1 Verification Queue · C2 Packet Detail (the ivory paper document) · C3
Live Rail · C4/C5 Agent Board & Deep-Dive · Q6 Contract Lab · E0 Investment Committee · E1
Decision Review · the six self-audit block (new) · zone-click four-questions inspector (new).
**TRADE** (act) — Q8 Positions · S5 Execution Gate · token desk (TTL) · fills tape
(execution_fill) · Q13 Ledger.
**RISK** (guard) — Q9 Risk Cockpit (limits vs used, cluster sums) · risk_mode FSM panel ·
kill-switch (two-step, ambient) · exposure by correlation cluster · event-blackout calendar.
**LEARN** (reflect) — Q11 Journal · Q10 Performance Lab · Q12 Backtest Lab · replay · C6
Learning Court + visible rejected-store · Calibration Ledger (new) · Ask Inbox (new) · MHH
Board (new) · Sample-Block Tracker (new) · E2 Opportunity Autopsy + restored postmortems ·
M6 Eval & Drift Lab.
**SYSTEM** — C7 Config Governance · C8 Mode & Session · C9 Evidence Export · M4 API Command
Center · Q14 Integrations · Q15 Settings/Auth (Supabase) · M7 Knowledge Base · Absorption
Status (new) · Golden-Test Runner (new) · Stress Range (new) · S3 Data Spine · S6 Production
Readiness · in-app changelog (config_versions) · admin-lane user management.
Retired as tabs, kept as build artifacts: E5 1,000-Upgrade Control, E8 Tab Production Matrix,
E9 Eight-Pass Validation (their content folds into Golden-Test Runner and the changelog).

### 5.2 The panel contract (the binding law, made mechanical)

Every panel in V11 declares a five-field header contract, rendered as V9's purpose strip
extended: **(1) schema source** (`agent_vote`, `verification_packet`, …) — dev-mode click
shows the raw validated object; **(2) WebSocket topic** it subscribes to; **(3) owning seat(s)**
(the purpose strip: "This panel is Seat 26 — StopTarget5R"); **(4) cadence stamp** from
scheduler.yaml with last-tick time; **(5) freshness chip** (fresh/amber/stale per LAW-006
gates). A build-time linter walks every view and fails the build if any panel lacks the
contract or renders a field not present in its declared schema — that linter *is* requirement
#1 enforced, and it is how "computes nothing" stops being a slogan.

### 5.3 The tri-mode data plane (the synchronicity core)

One payload vocabulary, three sources, switchable in C8 Mode & Session:

**SIM** — the deterministic layer the `__3_` build already has, upgraded to speak schemas: the
simulator emits `feed_*`, `evt_event`, `agent_vote`, `verification_packet`, `execution_fill`
objects — the same shapes the server will send. Crucially, SIM's scenario source is the
**conformance suite**: golden fixtures and stress_scenario files replay through the UI, which
turns the terminal into the visual conformance runner (expected vs actual gate behavior,
diffed on screen). SIM is not a demo; it is the test harness.
**PAPER** — FastAPI + WebSocket per the L8 spec, topics exactly as contracted (`state.global`,
`state.symbol.{X}`, `votes.{trade_id}`, `packets`, `fills`, `learning`) plus three new topics
for the organs (`calibration`, `ask`, `events`). Every inbound message is schema-validated
client-side; a validation failure renders as a DataIntegrity incident, never as a blank panel.
**LIVE** — identical transport, Tradier live tokens, unlocked only by the six-gate checklist
wired to the promotion-ladder config, with `live_auto_any: forbidden` rendered as a physically
absent control, not a disabled one.

Mode is ambient: the entire chrome tints per mode (SIM = blue edge, PAPER = default, LIVE =
gold edge), because the single most expensive UI bug possible is a human confusing modes.

### 5.4 The approval spine (LAW-007 end to end)

The signature flow, specified as one uninterruptible sequence the UI enforces: Verification
Queue shows only server-flagged 19/19-complete packets → Packet Detail renders the ivory
document with the required 5R proof block verbatim (entry · structural stop · risk per unit ·
T1/T2/T3 · which target reaches 5R · why realistic · what kills the path · expected option
behavior) → the human types APPROVE (V9's friction, kept deliberately) and selects a
section-17 enum → server issues an approval token with TTL, rendered as a countdown chip →
S5 Execution Gate is the only surface that can spend it → `execution_fill` arrives on `fills`
and simultaneously writes the journal row → rejection paths capture reason codes verbatim and
open a forward-outcome tracker automatically (the V9 reject flow, now persistent). Telegram
parity: the same packet summary, same enum buttons, same token issuance through the bot —
one approval spine, two doors. Every step audit-logs; C9 Evidence Export hashes the bundle.

### 5.5 Specifications for the eleven new views

**Boot Self-Test (DESK/SYSTEM):** eight rows S1–S8, each with law citation, last-run result,
duration; any FAIL pins a red banner terminal-wide and risk_mode: blocked until green.
**Calibration Ledger (LEARN):** grid seats × confidence deciles; cell = n, hit rate, Brier;
regime filter; per-seat reliability curve sparkline; worst-calibrated seat of the week
surfaced to DESK as a P2 item.
**Ask Inbox (LEARN + DESK badge):** cards from ask_ledger_card with evidence chips linking to
EVT ids, VC charts, packets; tap-an-option or free-text answer; answered cards show
"embedded ✓"; SLA aging so questions don't rot.
**MHH Board (LEARN):** open flaws split human|machine; five-step accordion; correction line
shown as the exact string injected in real time; sessions-silent progress bar to resolution.
**Sample-Block Tracker (LEARN):** per playbook × personality, 20 slots filling; pre-accepted
worst case displayed at block start; flawless-execution rate as the headline stat; P&L number
literally blurred until the boundary — the interface enforcing Douglas.
**Golden-Test Runner (SYSTEM):** fixture list by family (GT-SWING/STRUCT/DISP/LIQ/ZONE/5R/
PSY/KILL/SCORE/ROUTE/PIPE); run-all; per-fixture input/expected/actual triptych with diff
highlighting; regression law surfaced ("every C-game loss must add a fixture" with an add-
from-journal button).
**Stress Range (SYSTEM):** stress_scenario library; select build + scenario; expected gate
behavior vs actual, row-by-row; historical-replay class shows the tape alongside the gate log.
**Absorption Status (SYSTEM):** intake items on the ladder PENDING → absorbed → deconflicted →
PROPOSED → approved → merged; CR-items listed with rulings; one-click open of the source doc.
**Barometer / Position Ledger (MARKET):** the tracked list with positions 1–4 and mandatory
reasons[] citing EVT ids; the aggregate %1+%2 vs %3+%4 strip with day-over-day deltas; the
divergence alarm (index at highs while barometer deteriorates) wired to DESK P1.
**VC Browser (HUNT):** corpus grid filterable by playbook/regime/outcome; entry opens chart +
sidecar; when the engine is live, an overlay-diff mode shows machine labels vs operator labels
with agreement scoring — the chart-reading exam, visible.
**Config Versions / Changelog (SYSTEM):** the V9 changelog pattern bound to the
config_versions table: every rules_version with diff, approving human, learning_suggestion
lineage, and post-change monitoring window status.

### 5.6 Chart workspace binding

Lightweight Charts as the substrate (L8), Studio's toolset on top, and a strict rule: the
overlay layer draws only `evt_event` and state objects — pools, zones (with mitigation count
badges), dealing range + EQ + OTE shading, displacement legs with scores, killzone shading
from config sessions, DOL marker, trade boxes from trade_plan. The operator's freehand
annotations live on a separate human layer that exports the VC sidecar. Zone-click opens the
four-questions inspector populated from the zone object and the contract selector's last
verdict. This is "see what agents see" — the debugging tool the stack spec demanded.

### 5.7 Performance and platform budget

A 1.2MB single file with 95 routes already strains parse time; V11 will exceed it. Budget:
lazy view mounting (views compile on first visit — the `__3_` registry pattern supports it),
virtualized tables for blotter/journal/ledger, canvas-only charts, WebSocket message batching
at 250ms UI frames with immediate paint for P0 events, and IndexedDB for offline packet/journal
cache (note: browser storage works in the deployed app but not if a file is previewed inside a
Claude artifact — preview with the SIM plane instead). The L8 escape hatch stands: when
single-file state pain arrives, split to Vite+React without changing the panel contract —
the contract, not the bundler, is the architecture. Supabase Auth gates everything before any
real account data renders (Q15 becomes real first, not last).

---

## Part VI — Build Sequence and Acceptance Criteria

Sequenced to deliver synchronicity earliest, aligned with the stack build order and the
SIM-0001 dependency list. Each phase has a hard acceptance gate; no phase ships on vibes.

**Phase W1 — Convergence skeleton.** Fork `__3_` as the base; port V9's human-factors layer
(paper packet, semantic colors, sign flow, six-gate LIVE, palette, Explain, purpose strips,
postmortem views); import V10's E/S routes under the seven-loop IA; retire duplicates and the
admin lane; fix version strings. *Accept:* all target routes mount; zero Math.random; smoke
matrix green; title/rules_version correct.
**Phase W2 — Schema-native SIM.** Replace the local sim vocabulary with the seventeen schemas;
build the panel-contract linter; add freshness chips and cadence stamps; SIM replays the four
seed golden fixtures + GT expected/actual diffing. *Accept:* linter passes 100% of panels;
GT-SWING-001, GT-5R-FAKE-MATH-001, GT-PSY-REVENGE-001, GT-KILL-001 all render correct
expected-vs-actual; boot panel shows S1–S8 simulated green; **and the SIM plane synthesizes a full
5,000-symbol universe** — counters, promotion events, and anomaly top-N streaming at contract
rates — proving the funnel views and the client's 60fps budget before any real feed exists.
**Phase W3 — The organs.** Build the eleven new views against SIM payloads (calibration rows,
ask cards, MHH records, sample blocks, stress runs, absorption board, barometer, VC browser,
changelog). *Accept:* every new schema object has a rendering home; ask-card round-trip
(question → answer → embedded ✓) works in SIM.
**Phase W4 — Transport.** FastAPI + WebSocket per contract topics; Supabase Auth; client-side
schema validation on every message with DataIntegrity incident rendering; PAPER mode live
against the data spine as it lands (bars → quotes → chain → calendar → broker sandbox, the
SIM-0001 order). *Accept:* pull the network cable test — every panel degrades to stale-amber,
none renders fiction; reconnect recovers state from snapshots. **Scale gates:** the engine
completes a full-universe 5-minute feature pass in ≤60 seconds and the 1-minute T0/T1 pass in
≤10 seconds (5× headroom on the cadence clock); `universe.summary` sustains its 5-second beat
under full load; the client holds 60fps with the universe stream on and never mounts more than
~200 symbol rows in the DOM.
**Phase W5 — The approval spine end-to-end.** Token issuance server-side, TTL enforcement, S5
gate spending, Telegram parity, execution_fill → journal write, reject → forward-outcome
tracker. *Accept:* the eight boot smoke tests pass against the real server (tokenless refuse;
stale block; fake-math reject; stop-widen reject; hard-limit block; kill-switch on heartbeat
loss; malformed-vote packet block; tool-lane deny) — S1–S8 green on real transport, rendered
in the boot panel.
**Phase W6 — LIVE readiness (locked).** Six-gate checklist wired to promotion-ladder config;
LIVE chrome; Tradier live token path present but empty per env.template. *Accept:* LIVE
remains unopenable until every gate reads true from real data; the control for autonomous live
does not exist in the DOM.

**Definition of done for V11 overall:** every panel carries the five-field contract · zero
Math.random reachable in PAPER/LIVE code paths · every WS message schema-validates · all golden
fixtures green in the Runner · the boot report is a public artifact of every session · and one
full human journey works without leaving contract: watch a hypothesis form on the chart →
packet completes 19/19 → ivory document → typed APPROVE → token → gate → paper fill → journal
row → outcome review → a calibration row and (if warranted) an ask card or suggestion appear
in LEARN. That journey is synchronicity, demonstrated.

---

## Part VII — Decision Items for Justin

1. **Canonical lane:** confirm `__3_` Command OS as the V11 base with V9/V10 donations (this
   report's recommendation), or direct otherwise.
2. **Admin lane:** approve retirement into SYSTEM, or keep as a separate ops console.
3. **Chart engine:** approve Lightweight-Charts substrate + Studio tools per L8, or keep
   Studio's renderer as primary.
4. **Restorations:** approve reinstating V9 postmortems, palette, and reject-outcome tracking
   as W1 requirements (they regressed out of both current flagships).
5. **Route retirements:** approve folding E5/E8/E9 meta-tabs into Runner + changelog.
6. **Reverse-absorption:** approve adding the P0–P3 priority taxonomy and the semantic color
   law to canon (10_HUMAN_INTERFACE) so brain and app share one attention language.
7. **Naming:** approve "ATLAS PRIME V11 — SYNCHRONY" and the rules_version pairing display.
8. **Split trigger:** pre-authorize the Vite+React split when the single file crosses an
   agreed pain threshold (suggested: >2.5MB or >400ms parse on your machine), holding the
   panel contract invariant.

Standing next actions on approval: W1 convergence build session; the config-completeness audit
(unvalued keys table) offered previously; Batch A2 absorption so the GEX placeholder can become
a panel. The estate is elite, the brain is contracted, and the distance between them is now a
sequenced checklist rather than a mystery.

## Addendum A — Universe-Scale Operation: 5,000+ Symbols at Constant Rate

### A.1 What the canon already provides (cite, don't reinvent)

The brain was built for this and the audit confirms it. The tier system (01_MIND/01) is the
load-bearing structure: **T0** command instruments for regime; **T1** the liquid optionable
tradeable list (~150–300 symbols, full-ladder analysis); **T2** all optionable (~4,000–5,000,
anomaly monitors); **T3** all listed (7,123-row universe sheet, daily basics) — with the
promotion ladder T3→T2 on anomaly, T2→T1 on liquid+optionable+catalyst, T1→ActiveWatch on
hypothesis forming, and demotion mirroring on decay. The cognitive-cycle clock already scopes
cadence by tier (1m for T0/T1-active, 5m adding promoted T2, EOD/overnight for the universe),
now machine-mirrored in scheduler.yaml. The stack's universe-economics law states the cost
model outright: *Python workers score the whole universe; only promoted symbols get LLM
attention* — the difference between ~$30/day and ~$3,000/day. Sponsorship-class migration
(07b) and the cold-read promotion doctrine (06b) are the Wyckoff ancestry of the same design.
The mandate therefore changes no law; it sets the **rates, budgets, and surfaces** that make
the law real at 5,000-constant.

### A.2 The hard invariant

**LLM symbol-touches per day are bounded by promotions, never by universe size.** The 34
seats do not loop over 5,000 tickers — the deterministic engine (Polars+Numba, columnar) runs
the universe every cycle and emits `evt_event` streams and tier-promotion events; the firm
convenes only on survivors. Config caps make it enforceable: `universe.t1_max` (default 300),
`universe.active_watch_max` (default 50), `universe.promotions_per_day_max` (default 40,
governed-learnable). Any design that puts an LLM in the per-symbol scan loop violates the
stack thesis and the budget simultaneously; the linter for this is a daily token-spend-per-seat
panel in SYSTEM.

### A.3 Engine throughput specification

Columnar, per-timeframe, whole-universe passes — never per-symbol loops. Budgets (5× headroom
on the cadence clock, enforced as SLAs on the S6 Production Readiness board):
**EOD/overnight, T3 (7,123):** full daily-bar ingest + basics + position-ledger recompute in
≤ 20 min of the overnight window. **5m, T2+T1 (≈5,000):** swing/structure/liquidity/RVOL/
displacement incremental update in ≤ 60 s per pass (~85 symbols/s columnar — comfortably
single-box with vectorized kernels; the pass is incremental on new bars, not recompute-from-
zero). **1m, T0+T1-active (≈200–500):** sweep/spread/RVOL-spike tick in ≤ 10 s. **Event
volume:** across 5,000 symbols expect thousands of EVT_* per session — `evt_events` becomes a
Timescale hypertable partitioned by day with per-tier retention (T3: EOD events only; T2: 30-
day rolling for sub-daily; T1/promoted: full history), and compression after 7 days. Quotes at
universe scale come from snapshot endpoints and the aggregates channel (per-minute bars,
all-symbols, standard on the chosen L3 tier); **options chains are fetched only for T1 and
promoted T2** — chains for 5,000 are both impossible and pointless, and the contract selector
only ever runs on survivors anyway.

### A.4 Transport at scale (four new WebSocket topics)

The client must never subscribe per-symbol across the universe. Additions to the contract
topic set: **`universe.summary`** — counters and deltas on a 5-second beat (listed → optionable
→ passing filters → anomalies-now → promoted-today, plus barometer aggregate and sector
heat vector); **`universe.promotions`** — tier-change events with the triggering evidence
(EVT ids), the feed for HUNT; **`anomalies.topN`** — ranked shortlists per anomaly class
(sweep-quality, RVOL, RS-break, sponsorship-migration, capping-suspected), N ≤ 50 each;
**`barometer`** — the DET-LEDGER aggregate strip. Per-symbol topics (`state.symbol.{X}`)
subscribe only on dossier/chart open and unsubscribe on close. Server-side filter/sort/page
for any full-table request; the DOM row budget stays ≤ ~200 under virtualization.

### A.5 Interface at scale (what MARKET/HUNT become)

Q3 Scanner is redesigned from a list into a **funnel**: the top strip shows the living
counters (7,123 → optionable → filtered → anomalous → promoted), each stage clickable; the
body is a canvas sector/cluster heatmap plus the anomaly top-N boards; the full-universe table
exists but is an on-demand, virtualized, server-paged drill — never the default render.
Promotion events land in HUNT as cards carrying their evidence chips, one tap from Ticker
Dossier. The ⌘K palette resolves any of 7,123 symbols instantly from a compact client-side
index (ticker/name/tier, ~200KB); everything heavier fetches on open. The Barometer strip
(Part V.5) is ambient on MARKET with the divergence alarm wired to DESK P1. A **Universe
Health** panel joins SYSTEM: pass durations vs SLA, event throughput, feed lag per source,
token-spend per seat — the mandate's own instruments.

### A.6 Acceptance additions (bound into W2/W4 above)

W2: SIM synthesizes the full 5,000-symbol universe (counters, promotions, top-N at contract
rates) and the client holds 60fps. W4: engine SLAs green on real data (≤60s universe 5m pass,
≤10s 1m pass), `universe.summary` beat stable under load, chains fetched for survivors only,
and the token-spend panel proves the invariant: a full trading day at 5,000-constant with LLM
spend bounded by the promotion caps, not the universe.

— End of Report —
