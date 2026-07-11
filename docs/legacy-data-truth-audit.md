# Legacy data-truth audit — what the V10 prototype fabricated

Severity: **HIGH** = presented as authoritative/live, must be a real backend in production; **MED** = plausible telemetry that misleads; **LOW** = narrative copy.

| # | Feature | What it faked | Sev | V11 disposition |
|---|---|---|---|---|
| 1 | Global seeded LCG + "CI-grep clean" claim | Claim was false — raw `Math.random` in V5 uid + the whole PX layer | HIGH | One seeded stream + isolated per-surface PRNGs; no `Math.random` in state paths |
| 2 | 24-symbol price walk, index tape with `livedot` | All prices/chg/RVOL/RS/IVR synthesized per tick, implied streaming | HIGH | Same synthesis, honestly labeled: persistent DEMO watermark + seed shown in the top bar |
| 3 | Authored candles with pattern always present; fake NBBO, L2 book, T&S | Chart "detections" were hardcoded labels | HIGH | Kept as deterministic demo annotations, each citing its detector id; DEMO framing throughout |
| 4 | Fake options chain with "py_vollib" claims; fabricated UW flow | Liquidity vetoes evaluated synthetic numbers | HIGH | Demo twin labeled; veto logic is real code in the server-boundary module |
| 5 | Client-side risk math cited as authority; Day P&L literally a random walk | LAW/RISK citations on invented figures | HIGH | Deterministic risk engine with structured reason codes (`SVR.riskCheck`), property-checked by the in-page integrity suite |
| 6 | Token/approval theater — "Writes token to Postgres… no admin bypass" from client state | Two-actor gate was a UI boolean | HIGH | Token issuer modeled at a server boundary: single-use, TTL, plan-hash bound — verified by real checks; APPROVE_LIVE honestly disabled in DEMO |
| 7 | "Append-only ledger" = 400-row JS array; `langfuse://` links to nowhere | Audit-grade claims on browser state | HIGH | Ledger kept but described truthfully; evidence export is a real JSON download labeled DEMO |
| 8 | Fake integration console: masked API keys, test calls that "200 OK" with no I/O | Implied credentials existed client-side | HIGH | Integrations page shows target set + honest state (`TWIN` / `NOT CONFIGURED`); no keys rendered, ever |
| 9 | "200-scenario QA suite" that tested the length of its own copy; exported CI-looking JSON | Fabricated pass evidence | HIGH | Replaced by an integrity suite running real assertions against the running app; failures render as FAILED |
| 10 | Autonomous personas whose trade outcomes were decided at idea creation | "ML corpus" was scripted fiction | HIGH | Autonomy lab is feature-flagged, paper-only doctrine, ARM-LIVE button disabled with the honest reason (LAW-008) |
| 11 | WebSocket/Kafka topics/worker fabric copy with no sockets anywhere | Streaming fabric was pure copy | MED | Not claimed. Production data plane is specified in docs, not simulated as live |
| 12 | Clock used viewer's local timezone, always labeled "ET" | Wrong for every non-Eastern viewer | LOW | Sim clock is explicit simulated ET, independent of viewer timezone |
| 13 | Operator notes/acks in localStorage pitched as governed records | Browser state as audit | HIGH | Browser storage holds nothing authority-like |

**The one real seam worth keeping:** the legacy's optional backend adapter contract — `GET /v1/health`, `/v1/state/global`, `/v1/universe/snapshot`, `/v1/packets`, `POST /v1/packets/{id}/decision`, `/v1/orders/preview` — is the correct starting skeleton for the production API. The V11 `SVR.*` module mirrors these shapes so the swap is 1:1.
