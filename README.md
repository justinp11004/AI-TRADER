# ATLAS Prime — Decision Operating System (V11.1 · full-feature merge)

**Open `index.html` in any browser. That's the app.** DEMO mode: seeded, deterministic, watermarked synthetic data — no broker, no live claims.

ATLAS is a decision operating system for an AI-assisted trading desk, not a collection of dashboards. One human operator answers, within seconds: what is the market doing, what deserves attention, what evidence supports the idea, what invalidates it, is there an honest 5R path, what does the risk engine say, and what is the next safe action. A valid outcome is often **NO_TRADE**.

## The seven domains (keys 1–7 · ⌘K jumps anywhere · F focus · ? shortcut map)

1. **COMMAND** — what needs me right now (one dominant next action, always)
2. **MARKETS** — regime, deterministic scanner funnel (5,234 → 3 with named reasons), watchlist, events
3. **RESEARCH** — one synchronized symbol dossier: chart, structure & liquidity, Wyckoff, options, flow, catalysts, history
4. **DECISIONS** — verification queue → 19-section packet → risk proof → canonical-enum decision → journal
5. **PORTFOLIO** — plan-driven positions inside the management envelope, orders with honest fills, risk cockpit, compounding program
6. **REVIEW** — journal, opportunity autopsy (missed winners, rejected-then-ran, good misses), calibration, learning court
7. **SYSTEM** — health & drills, the 34-seat agent council, config + the 18 laws, permissions, audit ledger, real integrity checks, feature-flagged autonomy lab

## What was rebuilt and why

The previous artifact (`legacy/reference/`, V6→V10) accreted **63 routes, 96 competing view definitions, a 9-deep render patch chain, 464 inline onclick handlers**, and a QA suite that fabricated its own pass results. Full forensics: `docs/legacy-route-map.md`, `docs/legacy-data-truth-audit.md`, `docs/legacy-button-audit.csv`. **Every legacy capability is preserved** — the complete 63-route → V11.1 map is `docs/legacy-feature-preservation.md`.

V11 is a ground-up rebuild: seven domains (ADR-001), a command contract so dead buttons are structurally impossible (ADR-003), a simulated server boundary whose contracts match the target `/v1/*` API for a 1:1 backend swap, and an in-page integrity suite that runs **real assertions** and renders whatever actually happens.

## Verification (this build, in a real browser)

- 38/38 workspaces render · **0 console errors**
- 12/12 integrity checks (enum canon, 5R gate blocks sub-5R, spread veto blocks OPT-007 breach, token single-use + hash-bound, R recomputed from levels, all commands wired)
- Kill-switch halt/resume, packet decision → journal → token, stale-data drill → risk-engine denial, vision wall, replay scrubber, committee rail, autonomy-lab corpus, and the teach loop (lesson → quiz-back → HUM chunk → court): all exercised end-to-end via Playwright

## Honesty rules

Every market value is synthetic and says so (top-bar watermark + seed). APPROVE_LIVE, mode escalation, and autonomous-live are **disabled with the truthful reason** rather than pretending. No return is guaranteed, ever — see `docs/READINESS.md` for the evidence-linked readiness matrix and what remains before real capital (Phases 2–8: data spine, backend, agent runtime, paper broker, then governed live).
