# Developer battalion checklist (per screen unless noted)
Dead & wired: every button/row/shortcut does something or states why not · no `onclick` to undefined fns · no route unreachable from nav · Escape/back always works from modals.
State & lifecycle: rerender adds no duplicate listeners/timers (count before/after 20 renders) · intervals cleared on route change · no duplicate DOM ids after render · layered overrides: exactly one shell owns #side/#view chrome.
Data truth: every number derivable → derive, don't store (LAW-015) · derived-vs-stored tie-out on any r/R, %, P&L · all synthetic values watermarked · seeded PRNG only, no raw Math.random · timestamps show source vs ingest where material.
Injection & escape: user/dynamic strings pass esc() before innerHTML · no template building from untrusted fields · attribute contexts quoted.
Memory & perf (global): every unshift/push stream has a cap · tables >200 rows virtualized or paginated · tick handler cost bounded (no full-app innerHTML per tick) · canvases sized once per resize, not per frame.
Contracts: enums match constitution (LAW-014) · config keys cited where a number gates behavior (rtag/cite) · no hardcoded threshold that exists in atlas_config.yaml.
