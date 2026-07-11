# ADR-003 — Every control is a command contract

**Status:** accepted · **Date:** 2026-07-11

## Context
The legacy audit found 464 inline onclick handlers and ~40 cosmetic controls: buttons that toasted success without doing anything (fake key rotation, fake exports, fake failovers), and a QA suite that fabricated pass results. A confusing or lying control in a capital-critical UI is a defect class, not a polish issue.

## Decision
No control exists outside the command registry:

```js
CMD.define({ id, label, purpose, pre(arg) -> reason|null, run(arg), audit })
```

- Rendering goes through `CMD.btn(id, arg)`: if preconditions fail, the button renders **disabled with the human-readable reason** (hover shows it). "Not configured" and "unavailable in this mode" are first-class states.
- One delegated `click` listener dispatches `data-cmd`/`data-arg`. Unregistered commands surface as INTEGRITY toasts + console errors — they cannot fail silently.
- Every state-changing command writes an audit row with actor + hash.
- The integrity suite cross-checks every `data-cmd` in every rendered workspace against the registry at boot.

## Consequences
- A dead button is a *detected build failure*, not a user discovery.
- The registry doubles as the seed of the production command contract (permission, idempotency, telemetry fields attach here in Phase 2+).
