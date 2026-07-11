# Readiness matrix — honest, evidence-linked

No claim below exceeds its evidence. "Live trading readiness" is **0%** by design until Phases 2–8 exist.

| Capability | State | Evidence |
|---|---|---|
| Seven-domain IA, 36 workspaces | ✅ SHIPPED | Playwright click-through: 36/36 workspaces render, 0 console errors |
| Command contract (no dead/cosmetic controls) | ✅ SHIPPED | Integrity check "every rendered control is a registered command" — PASS across all workspaces |
| Canonical enums (LAW-014) | ✅ SHIPPED | Integrity check + `ENUMS` module |
| 5R floor / spread veto / breakers in a deterministic risk engine | ✅ SHIPPED (demo boundary) | Integrity checks: sub-5R plan → BLOCK; 9% spread → BLOCK; stale-data drill → DATA-STALE denial (browser-verified) |
| Approval token: single-use, TTL, plan-hash bound | ✅ SHIPPED (demo boundary) | Integrity check: wrong-hash refused, replay refused |
| Kill switch: hold-to-arm → typed confirm → order paths locked → tokens invalidated → resume | ✅ SHIPPED | Playwright: full halt/resume cycle exercised |
| Golden packet (19 sections, 19 votes, dissent) | ✅ SHIPPED | PKT-2231 content extracted verbatim from legacy canon; integrity check confirms 19/19 |
| Decision → journal → token flow | ✅ SHIPPED | Playwright: APPROVE_PAPER_ONLY journaled, FSM → APPROVED_PAPER, token issued |
| Demo watermarking / no live claims | ✅ SHIPPED | Persistent top-bar watermark + rail banner + mode ladder; integrity check "no live claims in DEMO" |
| Real market data | ✅ SHIPPED (V13) | `backend/atlas-server.mjs`: Stooq → Yahoo provider chain, strictly validated; SSE stream into every data tab; unreachable providers degrade to a **labeled** SIM feed (`synthetic:true` on every value) — verified end-to-end via Playwright |
| Real backend | ✅ SHIPPED (V13, single-node) | Zero-dep Node service implementing the `/v1/*` contract the SVR boundary was designed for: server-side risk law (sub-5R blocked server-side, browser-verified), single-use hash-bound tokens, hash-chained persisted audit ledger, health/stream. FastAPI/Postgres/Redis fabric remains the scale-out path (Phase 2+) |
| LLM agent runtime | ❌ NOT BUILT | Phase 4 — five-agent proof first (S08, S12, S01, S00, S28) |
| Paper broker adapter | ❌ NOT BUILT | Phase 5 — fill model doctrine documented, not connected |
| Live execution | ❌ FORBIDDEN | Phase 8 only, after drills + independent safety review; UI already refuses honestly |
| Return guarantees | ❌ NONE, EVER | Guarantee claims are prohibited by the product's own constitution |

## What "done" meant for this phase
The spec's Definition-of-Done items satisfiable without a backend, all verified in a real browser:
old HTML no longer the runtime ✓ · exactly seven domains ✓ · every visible control works or states why not ✓ · modes cannot be confused ✓ · no synthetic value presented as live ✓ · frontend cannot approve risk/execution (boundary module + disabled-with-reason) ✓ · every decision including rejection journaled ✓ · no uncaught console errors ✓.
