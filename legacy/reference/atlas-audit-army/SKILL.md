---
name: atlas-audit-army
description: Deep expert-army audit and upgrade protocol for the ATLAS Prime trading platform (any version — monolith HTML or atlas-prime repo). Use whenever the user asks to audit, review, stress-test, QA, red-team, find what's broken/missing, "review 1000 times", "test from every angle", or upgrade ATLAS to production quality. Also trigger before any release claim, after any merge of layers, and whenever a new ATLAS HTML or repo build is uploaded — run at minimum the static auditor and report the findings ledger.
---

# ATLAS Expert-Army Audit

Turns "review this app 1000× from billions of angles" into a bounded, evidence-based protocol:
**12 expert seats × every screen × 8 states × ordered passes**, with a findings ledger where
every row has severity, evidence, and a repro. No fabricated pass counts — coverage is the
matrix, proof is the ledger.

## How to run
1. Read `references/system-prompt.md` — the full audit doctrine (roles, passes, severity, honesty contract). Adopt it for the session.
2. Run the deterministic auditor first (no browser needed):
   `python scripts/static_audit.py <app.html> ledger/findings.csv`
   For the repo track, also run `python -m pytest services/api/tests -q`.
3. Pick the battalion for the request: developer defects → `references/developer-audit.md`;
   trading-fitness → `references/scalper-audit.md`, `references/daytrader-audit.md`,
   `references/swing-audit.md`; gates/safety → `references/risk-security-audit.md`.
   Walk each applicable screen against the checklist; append rows to the ledger
   (template: `assets/findings-ledger-template.csv`).
4. Triage: false-positives get status `TRIAGED-FP` with a reason — never silently dropped.
5. Fix in severity order (S0→S4). **Every S0–S2 fix ships with a regression check**
   (extend `static_audit.py`, the VM smoke harness, or pytest) before it's called done.
6. Report in the six-part cycle format defined in the system prompt. Never claim a pass
   count that wasn't executed; state coverage as "N of M matrix cells".

## Coverage math (what makes the "army" real)
Screens (63 in V11 / 7 domains) × personas (12) × states (nominal, stale-data, LLM-degraded,
kill-switch, empty, loading, error, first-run) ≈ **6,000 auditable cells**. The protocol makes
each cell cheap to judge (checklists) and impossible to fake (evidence column).

## Ships with
- `scripts/static_audit.py` — dead controls, R-math tie-out (LAW-004/015), duplicate ids,
  enum canon (LAW-014), stream caps, determinism, forbidden-claims sweep.
- `ledger/first-pass-v11-findings.csv` — a real calibration run against V11 (triaged).
- Five persona checklists + the full system prompt in `references/`.
