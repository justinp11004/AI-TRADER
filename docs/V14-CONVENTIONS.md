# ATLAS Prime V14 module authoring spec (read fully before writing code)

You are writing ONE JavaScript part-file for ATLAS Prime — a single-file, dependency-free,
institutional trading decision OS in honest DEMO mode. Your file is concatenated into a big
`<script>` with ~20 other parts. It loads AFTER all core parts and BEFORE the boot engine.

## Calibrate style first (mandatory)
Read these files for voice, density, and patterns before writing:
- parts/part-08-view-command.js  (view helpers: panel/vhead/tbl/kv, canvas via POSTRENDER, candles)
- parts/part-16-v12.js           (interactive commands, builder pattern, drawers)
- parts/part-13-view-system.js   (lines 1–180: dense doctrine views, integrity suite style)
All paths relative to /tmp/claude-0/-home-user-AI-TRADER/cab049c8-29db-55e1-9110-a7b59ba7191d/scratchpad/

## Hard contracts (violating any of these breaks the build)
1. Pure JS only. No `<script>` tags, no imports, no Math.random (use `localRng('your-seed')`),
   no Date.now-dependent logic for data (CLOCK is the sim clock), no fetch/network, no localStorage.
2. Register new workspaces at the TOP of your file:
   `DOMAINS.markets.ws.push({id:'internals',label:'Internals'});`
3. One view per workspace: `VIEWS['markets.internals']=function(){ return html; };`
   Must return a string >2000 chars and NEVER throw, even if stores are empty. No async.
4. EVERY interactive control: `data-cmd` (+ optional `data-arg`), and every id you use in
   data-cmd MUST be defined in YOUR file via CMD.define({id,label,purpose,run,(pre),(audit:false)}).
   NO inline onclick — the integrity suite fails the build if a data-cmd is unregistered.
   Range inputs use `data-cmdin` (fires on input event, handler gets (arg,el), read el.value).
5. Unique namespaces — use YOUR assigned prefix for all CMD ids (e.g. 'intern.*') and all
   module-level consts (e.g. INTERN_*). Do not redefine or wrap any existing global or view
   unless your module spec explicitly says so.
6. Canvas drawing: unique element ids; draw inside `POSTRENDER.push(()=>{ ... })` registered
   during your view function; pattern:
   `const cv=document.getElementById('xx');if(!cv)return;const W=cv.width=cv.clientWidth*2,H=cv.height=<h>*2,x=cv.getContext('2d');`
   Style: bg fill '#070B12'; grid strokes 'rgba(151,166,192,.07)'; font '15px monospace' at 2x scale.
7. Escape every dynamic string with `U.esc()` before inserting into HTML.
8. HONESTY LAW: never present synthetic values as live. Panels whose numbers are scenario data
   carry `<span class="demo-wm">demo twin</span>` in the panel head or purpose line. Where a number
   CAN be derived from real in-app stores (candles(), JOURNAL, POSITIONS, SVR.ledger, INTEGRITY
   results), DERIVE it — computed truth beats stored fiction. Never write the words
   "guaranteed", "risk-free" or "10x" except inside explicit forbidden-claims doctrine.
9. Provenance: cite laws/config on gating numbers: `prov('LAW-004')`, `prov('risk.min_rr')`,
   and use `ck('config.key')` for thresholds — never hardcode a number that exists in CONFIG.
10. Comment discipline: section banners like `/* ── sizing formula ── */` and contracts only.
    No narration comments, no TODOs, no placeholders. Every panel has a real purpose line.

## Available globals (use these, define nothing global outside your prefix)
- Utils: U.esc/fmt/int/money/moneyK/pct/sign/R/ago/mmss/hash8/clamp/by · $ · $$ · localRng(seed)
- HTML helpers: panel(title,why,body,{flush,cls,head}) · vhead(kick,title,sub,chips) ·
  tbl([cols],rowsHtml) — prefix col with '>' for right-align · kv(k,v) · chip(txt,cls,ico) ·
  lc(state) · prov(id,tip) · stat(k,v,sub) · fresh(label,ageS,sloS)
- Chips: ch-ok ch-warn ch-blk ch-info ch-live ch-demo ch-mut · classes: btn sm pri gold ·
  btnrow row pill tag banner info|warn stat mono i1 i2 up dn gauge meter grid g2|g3|g4 hr
  demo-wm empty e1 tblwrap sel spark cv kbd
- State: S (mode,riskMode,kill,domain,ws,sym,packet,equity,dayPnl,weekPnl,openRiskR,
  dayLossUsedR,dataHealth,tick) · STORE.set(patch) · go(domain,ws,arg) · render() · CLOCK.hm/hms/phase/killzone/mins
- Data stores: SYMS (24 rows: sym,name,px,chg,rvol,rs,ivr,setup,fsm,bias,sector,note,levels{stop,entry,t1,t2,t3},unmet)
  · symBy(sym) · TAPE [[sym,px,chg]..] · REGIME · PACKETS (p.rmath{entry,stop,t1,t2,t3,r1,r2,r3,riskUSD,riskR,rr},
  p.votes,p.secs,p.state,p.ttl,p.grade,p.planHash) · pktBy(id) · POSITIONS · CLOSED_POSITIONS · JOURNAL ·
  ALERTS · pushAlert(cls,msg,route,arg) · ARCHIVE · COURT · MEMORY · ASKS · SEATS (34 agent seats) · SEATBY ·
  BLOTTER · CHANGELOG · RULES_VERSION · LAWS/LAWBY (18 laws) · ENUMS · CONFIG · ck(key) ·
  candles(sym,n) → [{o,h,l,c,v}] deterministic (or live when NET.on) · drawPrice(cvId,sym,opts) ·
  NET (live spine adapter: .on .mode .health .parity .attested) · CHARTX · INTEGRITY.results · BOOTTEST.results
- Server boundary: SVR.audit(actor,kind,msg) · SVR.riskCheck(plan) · SVR.ledger · CMD.btn(id,arg,cls,label)
- UI: UI.toast(msg,cls,kicker) · UI.modal(title,body,foot) · UI.closeModal() · UI.drawer(html) · UI.closeDrawer()

## Voice
Institutional, terse, opinionated, honest. Purpose lines explain WHY the panel exists for the
operator ("higher timeframes justify; lower timeframes trigger"). Doctrine text is specific and
numeric, referencing laws/config/detectors (DET-041 FVG, DET-052 OB, S-seat ids). A valid answer
is often NO_TRADE. Never hype. The desk would rather miss than bleed.

## Deliverable
Write your file to the exact path given in your module spec. Target 2,000–2,600 lines of REAL,
dense code — no padding, no repeated boilerplate, no giant data blobs of near-identical rows
(vary content meaningfully). Interactivity is mandatory: multiple working commands per workspace
(toggles, selectors, simulators, generators, downloads via Blob+URL.createObjectURL, drawers,
modals). Every workspace must be genuinely useful to a professional operator on day one.
When done, reply ONLY with: line count, list of workspaces registered, list of CMD ids defined,
list of canvas ids used, and any globals you defined (all must carry your prefix).
