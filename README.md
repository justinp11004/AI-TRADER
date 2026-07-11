# ATLAS Prime — Decision Operating System (V13 LIVE SPINE · complete estate)

**Open `index.html` in any browser. That's the app.** Boots in DEMO mode: seeded, deterministic, watermarked synthetic data — no broker, no live claims.

## Go live — the real backend ships in this repo

```bash
node backend/atlas-server.mjs        # zero dependencies · Node ≥ 18 · port 8000
```

Then in the app: **SYSTEM → Integrations → Connect**. On success every data tab flips to the real feed:

- **Live quotes** stream over SSE every 2.5s (Stooq → Yahoo provider chain, strictly validated) into the watchlist, scanner, regime, cockpit, positions, exposure, account — and the macro tape (ES/NQ/VIX/DXY/10Y/CL/GC) goes real via futures/index tickers.
- **Real OHLCV candles** power the Chart Studio on every timeframe (1m → 1M), with the provenance labeled in the OHLC header.
- Demo plan levels **rebase proportionally** to the live price scale once (R-multiples are scale-invariant), so zones, gates, and the 5R math stay coherent.
- **Risk law, approval tokens, and the audit ledger are enforced server-side too**: every local risk verdict is re-run on the server (a parity mismatch raises a P0), every audit entry and token is attested into a **hash-chained, persisted** server ledger (`backend/data/ledger.jsonl`).

Honesty is enforced at every seam, by construction:

- No server → the demo adapter stays active and says so (fail-closed, never fiction).
- Server up but market providers unreachable → **SIM FEED (server)** label everywhere; every value is stamped `synthetic:true`; nothing ever claims live.
- Feed stale >15s → automatic fall-back to the demo adapter, audited (LAW-006).
- Live **data** never raises **authority**: orders remain paper/demo; mode escalation still requires the governed ladder + step-up auth.

ATLAS is a decision operating system for an AI-assisted trading desk, not a collection of dashboards. One human operator answers, within seconds: what is the market doing, what deserves attention, what evidence supports the idea, what invalidates it, is there an honest 5R path, what does the risk engine say, and what is the next safe action. A valid outcome is often **NO_TRADE**.

## The seven domains (keys 1–7 · ⌘K jumps anywhere · F focus · ? shortcut map)

1. **COMMAND** — what needs me right now (one dominant next action, always)
2. **MARKETS** — regime, deterministic scanner funnel (5,234 → 3 with named reasons), watchlist, events
3. **RESEARCH** — one synchronized symbol dossier: interactive Chart Studio, structure & liquidity, Wyckoff, options, flow, catalysts, history
4. **DECISIONS** — verification queue → 19-section packet → risk proof → canonical-enum decision → journal
5. **PORTFOLIO** — plan-driven positions inside the management envelope, orders with honest fills, risk cockpit, compounding program
6. **REVIEW** — journal, opportunity autopsy (missed winners, rejected-then-ran, good misses), calibration, learning court
7. **SYSTEM** — health & drills, the 34-seat agent council, config + the 18 laws, permissions, audit ledger, real integrity checks, the live-spine transport seam, feature-flagged autonomy lab

## What was rebuilt and why

The previous artifacts (`legacy/reference/`, GEN0→V10 plus Chart Studio V4 — eleven generations) accreted **63 routes, 96 competing view definitions, a 9-deep render patch chain, 464 inline onclick handlers**, and a QA suite that fabricated its own pass results. Full forensics: `docs/legacy-route-map.md`, `docs/legacy-data-truth-audit.md`, `docs/legacy-button-audit.csv`. **Every legacy capability is preserved** — the complete route → home map is `docs/legacy-feature-preservation.md`.

V11+ is a ground-up rebuild: seven domains (ADR-001), a command contract so dead buttons are structurally impossible (ADR-003), and a server boundary whose contracts were designed for a 1:1 backend swap — **V13 performs that swap for real**: `backend/atlas-server.mjs` implements the same `/v1/*` contracts (`health · quotes · candles · risk/check · token/issue|redeem · audit · stream`) that the in-page SVR simulated, and the in-page integrity suite runs **real assertions** and renders whatever actually happens.

## Verification (this build, in a real browser)

- 42/42 workspaces render · **0 console errors** · boot self-test S1–S8: 8/8 · golden fixtures 5/5 · stress range 4/4
- **13/13 integrity checks** (enum canon, 5R gate blocks sub-5R, spread veto blocks OPT-007 breach, token single-use + hash-bound, R recomputed from levels, all commands wired, live spine fails closed)
- **Live spine, end-to-end via Playwright**: server contract smoke (risk law blocks sub-5R server-side, token hash-binding + replay refusal, ledger hash-chain linkage verified), browser connect → SSE quotes move prices → risk parity attested with 0 mismatches → audit entries mirrored with server hashes → chart flips to spine candles with the provenance label → integrity stays green while connected → explicit disconnect restores the demo adapter
- Kill-switch halt/resume, packet decision → journal → token, stale-data drill → risk-engine denial, Chart Studio drawing tools + position tool 5R gate, vision wall, replay scrubber, committee rail, autonomy-lab corpus, the teach loop, the Copilot (⌘J), the Trade Builder verdict ladder, AI Memory rules, keyboard enum decisions, and the pocket-gate preview: all exercised end-to-end via Playwright

## Honesty rules

In DEMO every market value is synthetic and says so (top-bar watermark + seed); when the live spine is connected the top-bar states the actual feed (`● live feed` vs `◈ sim feed (server) · no live claim`). APPROVE_LIVE, mode escalation, and autonomous-live are **disabled with the truthful reason** rather than pretending. No return is guaranteed, ever — see `docs/READINESS.md` for the evidence-linked readiness matrix and what remains before real capital.
