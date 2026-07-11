# Legacy route map — V10 final state → V11 seven domains

Forensic facts about `legacy/reference/ATLAS_V10_PRODUCTION_SCALE_FABRIC.html` (7,621 lines):

- **63 routes** across **11 nav-array groups**, re-grouped at render time into 6 PX groups (the third competing nav scheme in one file).
- **96 static `VIEWS.<id>=` assignments** for those 63 routes — Q5 alone defined **6×**; C2/Q2/Q4/Q6/Q8 defined 3×; 18 routes defined 2× — plus one dynamic pass re-wrapping all 54 legacy views.
- `render` reassigned/wrapped **9×** (a 9-deep closure chain per frame); `renderSide` overridden 3×; two competing 1-second heartbeats.
- **464 inline `onclick=` handlers**, 12 localStorage keys (including operator notes pitched as audit artifacts).
- Generational history: V7 = base + 6 internal patch layers → V8 appended a per-route spec/QA layer → V9 appended a 7-workspace nav overlay → **V10 deleted V9 entirely** and appended the P-layer.

## Consolidation map (63 → 7)

| V11 domain | Absorbs legacy routes | Overlap cluster it collapses |
|---|---|---|
| **COMMAND** | A0, E4, P1, Q1(summary), C3(summary) | Three generations of "one command surface" (A0/E4/P1) rebuilt once |
| **MARKETS** | Q1, Q2, Q3, P2, P5, S1, Q7(context), C8(session) | Scanner/funnel cluster Q3+P5+S1+P2 → one funnel with rejection economics |
| **RESEARCH** | Q4, Q5, V1, Q6(symbol tabs), Q7(symbol), M3(symbol memory) | Q5's six chart implementations + V1 → one synchronized dossier |
| **DECISIONS** | C1, C2, E0, S2, S5, C3(trace), C9(evidence) | Approval cluster C1/C2/E0/S5/S2 → queue + packet + risk proof + history |
| **PORTFOLIO** | Q8, Q9, Q10(account), Q13(orders), M2 | Positions/risk/exposure/account; compounding program lives with capital |
| **REVIEW** | Q11, E1, E2, C6, M5, M6, Q10, Q12, V2, M3(replay) | Learning cluster → journal, autopsy, performance, court, replay |
| **SYSTEM** | C4, C5, M1, M4, Q14, Q15, C7, C8(mode), C9, E3, S3, S4, S6, E5–E9, P3, P4, P6–P9, A1–A3(lab), M7, V3 | All ops/readiness/agent-org/plumbing theater → health, agents, config, integrations, permissions, audit, integrity, autonomy-lab |

Dropped as **pure duplication or self-referential theater** (their honest content was absorbed):
E8/E9 (spec matrix + fake 200-scenario suite → replaced by real integrity checks), P9 (self-referential "preservation registry"), E5 ("1,000-upgrade" registry), S6/E7/E3/P7 (readiness/ops narratives → one honest readiness matrix in docs + SYSTEM → Health).
