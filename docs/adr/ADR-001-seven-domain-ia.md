# ADR-001 — Exactly seven primary domains

**Status:** accepted · **Date:** 2026-07-11

## Context
V10 carried 63 routes in 11 nav groups with three competing navigation schemes stacked in one file. The operator reported clicking tabs without knowing their purpose. Forensic audit found seven overlap clusters (e.g. three generations of "one command surface": A0, E4, P1; six implementations of the chart workstation).

## Decision
Exactly seven primary domains, each answering one operator question:

| # | Domain | Question |
|---|---|---|
| 1 | COMMAND | What needs me right now? |
| 2 | MARKETS | Where is opportunity forming? |
| 3 | RESEARCH | What is true about this one symbol? |
| 4 | DECISIONS | Should this trade happen? |
| 5 | PORTFOLIO | How is capital deployed and protected? |
| 6 | REVIEW | Are we getting better, with evidence? |
| 7 | SYSTEM | Who can do what · what happened · is it healthy? |

Sub-workspaces are tabs inside a domain, never new primary navigation. Entities (packets, symbols, seats) are arguments, never tabs. **Adding a primary domain requires a new ADR.**

## Consequences
- The 34 agent seats become a SYSTEM diagnostic view, not 34 navigation targets.
- Ops/readiness narrative routes (E5–E9, S6, P7–P9) collapse into SYSTEM → Health/Integrity plus honest docs.
- Every screen carries a one-line purpose statement in its header; the rail shows each domain's question permanently.
