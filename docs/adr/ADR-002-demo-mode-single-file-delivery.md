# ADR-002 — Phase 1 ships as a dependency-free single-file DEMO app

**Status:** accepted · **Date:** 2026-07-11

## Context
The production spec targets React+TS+Vite over FastAPI/Postgres/Redis. None of that runtime exists yet in this repository, no credentials or data subscriptions are provisioned, and the operator's working loop is "open an HTML file." Shipping a half-built toolchain that cannot run would violate the spec's own rule: *keep the application runnable*.

## Decision
Phase 1 delivers `index.html`: the complete seven-domain application in **DEMO mode** — dependency-free, opens by double-click, every value watermarked synthetic, deterministic by seed.

Discipline is preserved *inside* the file as if it were the production codebase:
- **No inline handlers** — one delegated listener; every control is a registered command with `{id, label, purpose, preconditions, run, audit}`. Failed preconditions render the control disabled **with the reason**.
- **Server boundary** — risk engine, token issuer, packet FSM, audit ledger live in `SVR.*` with the same shapes as the target `/v1/*` API, so the real backend swaps 1:1.
- **Canonical enums everywhere** (LAW-014); config keys carry provenance (LAW-015).
- **Honest QA** — an in-page integrity suite runs real assertions (enum canon, 5R gate, token single-use/hash-bind, all views render, all commands wired) and renders results verbatim.

## Consequences
- The old HTML is no longer the runtime application (spec's first Definition-of-Done item) — it is preserved under `legacy/reference/`.
- The single-file rule of the production spec is deliberately deferred, not ignored: Phases 2+ move to `apps/web` + `services/api` per the spec. This ADR records the divergence and its reason.
- Nothing in DEMO can pretend to be live: mode ladder is rendered, APPROVE_LIVE and mode transitions are disabled with truthful explanations.
