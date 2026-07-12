/* ═══════════ AUDIT ARMY · 12 expert seats, executable passes ═══════════
   From the atlas-audit-army skill: "review 1000×" means the coverage
   matrix (screens × personas × states) EXECUTED and counted — never a
   number typed into a report. Passes below run real assertions against
   the live application, including a source self-scan (the app greps its
   own <script> at runtime) and the full gate attack list against SVR.
   Findings carry severity, evidence, and status; false positives are
   TRIAGED with reasons, never deleted. */

const ARMY_SEATS=[
 ['DEV','Frontend Architect','dead controls, orphan routes, purpose-less screens, IA drift from the 7 domains'],
 ['DEV','Runtime/State Engineer','duplicate ids, listener/timer leaks across rerenders, layered-override conflicts'],
 ['DEV','Data-Truth Engineer','every visible number’s provenance; derived-vs-stored tie-outs; watermarks; determinism'],
 ['DEV','Security Engineer','authority in the browser, secrets in client, innerHTML sinks vs esc(), mode escalation via reload'],
 ['DEV','SRE / Performance','unbounded arrays, rerender storms, stream backpressure, budgets (bundle, tick cost)'],
 ['DEV','Accessibility Auditor','keyboard-only operation, focus-visible, contrast, no color-only status'],
 ['TRADE','Scalper (0DTE)','alert→order ≤3 interactions; spread+quote-age at decision point; one-key flatten; killzone gates'],
 ['TRADE','Day Trader','session structure, event blackouts pre-entry, management rail truth, day-loss ladder visible'],
 ['TRADE','Swing Trader','HTF alignment ladder, DTE-band enforcement (LAW-016), theta/vega honesty, packet expiry'],
 ['TRADE','Options Market Maker','crossed/locked quotes, impossible Greeks, spread math, contract gates (LAW-009)'],
 ['TRADE','Risk Officer','attack every gate: 5R (LAW-004), ladders, caps, kill switch in every state; any bypass = S0'],
 ['TRADE','Compliance Auditor','LAW-007 completeness, LAW-018 rejection journaling, enum canon (LAW-014), claims language'],
];
const ARMY_STATES=['nominal','stale-data','LLM-degraded','kill-switch','empty','loading','error','first-run'];
const ARMY_SEV={S0:'path to capital loss or gate bypass',S1:'trust-destroying falsehood',S2:'decision-quality degradation',S3:'friction',S4:'polish'};

/* findings ledger — seeded with REAL historical rows (first-pass V11 run
   + the static-auditor run against this very build), then grown by passes */
const ARMY_LEDGER=[
 {id:'F-0001',sev:'S1',persona:'Frontend Architect',check:'dead-control',screen:'legacy V11 sweep',state:'nominal',
  finding:"onclick handler 'if' never defined (3 sites)",evidence:'grep onclick="if(',status:'TRIAGED-FP',
  note:'inline onclick="if(...)" typed-confirm gates in LEGACY files, not dead controls; this rebuild has zero inline onclick (integrity-checked)'},
 {id:'F-0002',sev:'S2',persona:'SRE / Performance',check:'unbounded-stream',screen:'flow tape',state:'nominal',
  finding:'FLOW grew without a cap (memory over a session)',evidence:'grep FLOW (V11 first pass)',status:'FIXED',
  note:'rebuild caps every stream — ledger 600, alerts 80, blotter bounded; STREAMS pass below re-proves it each run'},
 {id:'F-0003',sev:'S1',persona:'Compliance Auditor',check:'claims-language',screen:'portfolio.account',state:'nominal',
  finding:"forbidden claim text: 'guaranteed'",evidence:'static_audit.py sweep',status:'TRIAGED-FP',
  note:'the string appears only inside the honesty banner "No return is guaranteed, ever" — quoting a forbidden claim to forbid it is compliant; CLAIMS pass below applies context triage automatically'},
 {id:'F-0004',sev:'S2',persona:'Compliance Auditor',check:'enum-drift',screen:'review.autopsy',state:'nominal',
  finding:"'APPROVED_AND_FAILED' flagged as non-canonical decision state",evidence:'static_audit.py against this build',status:'TRIAGED-FP',
  note:'it is an autopsy CLASSIFICATION (confusion-matrix cell), not a decision enum; decision enums remain the 9 canonical (LAW-014)'},
 {id:'F-0005',sev:'S2',persona:'Compliance Auditor',check:'enum-drift',screen:'decisions.packet',state:'nominal',
  finding:"'APPROVED_LIVE_PENDING_TOKEN' flagged vs an older canon list",evidence:'static_audit.py CANON_STATES (V10 lineage)',status:'TRIAGED-FP',
  note:'canonical PACKET state in THIS constitution (ENUMS.PACKET); the auditor shipped an older canon — calibration drift in the tool, not the app'},
];
let ARMY_FSEQ=5;
const ARMY_RUNS={};   // passId -> {at,cells,found,detail[]}
const ARMY_FILTER={sev:'ALL',status:'ALL'};
function armyFind(sev,persona,check,screen,state,finding,evidence,status,note){
  ARMY_LEDGER.unshift({id:'F-'+String(++ARMY_FSEQ).padStart(4,'0'),sev,persona,check,screen,state,finding,evidence,status:status||'OPEN',note:note||''});
  if(ARMY_LEDGER.length>400)ARMY_LEDGER.pop();
}

/* ── the app's own source, for the self-scan pass ── */
function armySource(){let s='';for(const sc of document.scripts)s+=sc.textContent||'';return s}

/* ── PASS defs: each returns {cells, detail[{nm,pass,info}]} and files findings ── */
const ARMY_PASSES=[
 {id:'truth',nm:'1 · TRUTH — provenance, tie-outs, determinism',run(){
   const d=[];let cells=0;
   PACKETS.forEach(p=>{const r=p.rmath;if(!r||!r.entry)return;cells++;
     const risk=Math.abs(r.entry-r.stop),dir=r.stop<r.entry?1:-1;let bad=null;
     [['r1',r.t1],['r2',r.t2],['r3',r.t3]].forEach(([k,t])=>{if(t==null||r[k]==null)return;
       const calc=dir*(t-r.entry)/risk;if(Math.abs(calc-r[k])>0.06)bad=k+' stored '+r[k]+' vs derived '+calc.toFixed(2)});
     if(bad){armyFind('S1','Data-Truth Engineer','rmath-tieout','decisions.packet','nominal',p.id+': '+bad,'recomputed from levels','OPEN');d.push({nm:p.id+' R tie-out',pass:false,info:bad})}
     else d.push({nm:p.id+' R tie-out',pass:true,info:'r1/r2/r3 re-derived from levels within 0.06'})});
   const a=candles('__det',60),b=candles('__det',60);cells++;
   const det=a===b||a.every((c,i)=>c.c===b[i].c);
   d.push({nm:'determinism — same seed, same series',pass:det,info:det?'two pulls byte-identical (seeded PRNG only)':'series diverged — unseeded randomness somewhere'});
   if(!det)armyFind('S1','Data-Truth Engineer','determinism','global','nominal','candle series not reproducible','candles() twice differed','OPEN');
   let wm=0,tot=0;Object.keys(VIEWS).forEach(k=>{try{const h=VIEWS[k]();tot++;if(h.includes('demo-wm')||h.includes('demo twin')||h.includes('DEMO'))wm++}catch(e){}});POSTRENDER.length=0;cells+=tot;
   d.push({nm:'watermark coverage',pass:wm>=tot*0.6,info:wm+'/'+tot+' workspaces carry an explicit demo/provenance marker'});
   return{cells,detail:d}}},
 {id:'gates',nm:'2 · GATES — the attack list, executed against SVR',run(){
   const d=[];let cells=0;const base=PACKETS[0]&&PACKETS[0].rmath?{...PACKETS[0].rmath}:{entry:100,stop:99,rr:6,riskUSD:300,riskR:0.5};
   const attack=(nm,fn,expectCode)=>{cells++;try{const v=fn();const hit=v.codes&&v.codes.some(c=>c.code===expectCode);
     d.push({nm,pass:!!hit,info:hit?'BLOCKED with '+expectCode+' — gate held':'NOT BLOCKED — expected '+expectCode});
     if(!hit)armyFind('S0','Risk Officer','gate-bypass','decisions.riskproof','nominal',nm+' did not block','SVR.riskCheck returned '+v.verdict,'OPEN')}
     catch(e){d.push({nm,pass:false,info:'threw: '+e.message});armyFind('S0','Risk Officer','gate-crash','decisions.riskproof','error',nm+' crashed the gate','exception '+e.message,'OPEN')}};
   attack('sub-5R live path',()=>SVR.riskCheck({...base,rr:4.9}),'RISK-5R');
   attack('oversize (risk% breach)',()=>SVR.riskCheck({...base,riskUSD:S.equity*0.02}),'RISK-SIZE');
   attack('open-risk cap breach',()=>SVR.riskCheck({...base,riskR:ck('risk.max_open_risk_R')+1}),'RISK-OPEN');
   attack('bad contract on good chart (9% spread)',()=>SVR.riskCheck({...base,spreadPct:9}),'OPT-007');
   attack('entry inside event blackout',()=>SVR.riskCheck({...base,eventHrs:3}),'RISK-EVENT');
   attack('correlated cluster past cap',()=>SVR.riskCheck({...base,sectorPct:ck('risk.max_sector_exposure')+1}),'RISK-SECTOR');
   attack('expired evidence snapshot',()=>SVR.riskCheck({...base,fresh:false}),'DATA-SNAP');
   cells++;{const k0=S.kill;S.kill=true;const v=SVR.riskCheck(base);S.kill=k0;
     const hit=v.codes.some(c=>c.code==='RISK-KILL');
     d.push({nm:'trade through kill switch',pass:hit,info:hit?'RISK-KILL — no order path while halted':'kill switch ignorable — S0'});
     if(!hit)armyFind('S0','Risk Officer','kill-bypass','global','kill-switch','riskCheck passed while kill active','state-restored probe','OPEN')}
   cells++;{const h0=S.dataHealth;S.dataHealth='DEGRADED';const v=SVR.riskCheck(base);S.dataHealth=h0;
     const hit=v.codes.some(c=>c.code==='DATA-STALE');
     d.push({nm:'approve on stale feed (LAW-006)',pass:hit,info:hit?'DATA-STALE denial':'stale feed approved — S0'});
     if(!hit)armyFind('S0','Risk Officer','stale-approve','system.health','stale-data','stale data did not block','state-restored probe','OPEN')}
   cells++;{const tk=SVR.issueToken('ARMY-PROBE','h-army','APPROVE_PAPER_ONLY');
     const wrong=SVR.redeemToken(tk.id,'h-tampered'),right=SVR.redeemToken(tk.id,'h-army'),replay=SVR.redeemToken(tk.id,'h-army');
     const ok=!wrong.ok&&wrong.code==='TKN-HASH'&&right.ok&&!replay.ok&&replay.code==='TKN-USED';
     d.push({nm:'stale/tampered/replayed approval token',pass:ok,info:ok?'hash-bind refused · single-use enforced · replay refused':'token contract broken — S0'});
     if(!ok)armyFind('S0','Risk Officer','token-replay','decisions.riskproof','nominal','approval token reusable or unbound','issue/redeem probe','OPEN')}
   return{cells,detail:d}}},
 {id:'flow',nm:'3 · FLOW — dead controls, orphan routes, purpose lines',run(){
   const d=[];let cells=0;const cmds=new Set();let fails=[];
   const wsIds=Object.entries(DOMAINS).flatMap(([dm,x])=>x.ws.map(w=>dm+'.'+w.id));cells=wsIds.length;
   wsIds.forEach(id=>{try{const h=VIEWS[id]();h.replace(/data-cmd="([^"]+)"/g,(m,c)=>{cmds.add(c);return m})}catch(e){fails.push(id)}});POSTRENDER.length=0;
   const unwired=[...cmds].filter(c=>!CMD.reg[c]);
   d.push({nm:'every rendered control registered',pass:unwired.length===0,info:unwired.length?unwired.join(', '):cmds.size+' distinct commands, all wired'});
   unwired.forEach(c=>armyFind('S1','Frontend Architect','dead-control','multiple','nominal','data-cmd "'+c+'" unregistered','render sweep','OPEN'));
   const orphan=Object.keys(VIEWS).filter(k=>!wsIds.includes(k));
   d.push({nm:'no orphan routes',pass:orphan.length===0,info:orphan.length?orphan.join(', ')+' unreachable from nav':'every view reachable from the seven domains'});
   orphan.forEach(k=>armyFind('S2','Frontend Architect','orphan-route',k,'nominal','view defined but unreachable','VIEWS key sweep','OPEN'));
   d.push({nm:'render integrity',pass:fails.length===0,info:fails.length?fails.join('; '):wsIds.length+' workspaces render without throwing'});
   return{cells,detail:d}}},
 {id:'streams',nm:'4 · STREAMS — every buffer capped, proven now',run(){
   const d=[];const checks=[['SVR.ledger',SVR.ledger.length,600],['ALERTS',ALERTS.length,80],['ARMY_LEDGER',ARMY_LEDGER.length,400],
     ['JOURNAL',JOURNAL.length,999],['BLOTTER',typeof BLOTTER!=='undefined'?BLOTTER.length:0,999]];
   checks.forEach(([nm,len,cap])=>{const ok=len<=cap;
     d.push({nm:nm+' within cap',pass:ok,info:len+' / '+cap});
     if(!ok)armyFind('S2','SRE / Performance','unbounded-stream','system.audit','nominal',nm+' at '+len+' exceeds '+cap,'live length read','OPEN')});
   return{cells:checks.length,detail:d}}},
 {id:'claims',nm:'5 · CLAIMS — forbidden language, context-triaged',run(){
   const d=[];let cells=0;const words=['guaranteed','10x monthly','always profitable','risk-free'];
   const negation=/no return|forbidden|fantasy|prohibit|never|is not|isn.t|describing a/i;let open=0,fp=0;
   Object.keys(VIEWS).forEach(k=>{let h='';try{h=VIEWS[k]()}catch(e){return}cells++;
     const plain=h.replace(/<[^>]+>/g,' ');
     words.forEach(w=>{let i=plain.toLowerCase().indexOf(w);
       while(i>-1){const ctx=plain.slice(Math.max(0,i-90),i+90);
         if(negation.test(ctx)){fp++}
         else{open++;armyFind('S1','Compliance Auditor','claims-language',k,'nominal','"'+w+'" outside a negation context','context: …'+ctx.trim().slice(0,80)+'…','OPEN')}
         i=plain.toLowerCase().indexOf(w,i+1)}})});POSTRENDER.length=0;
   d.push({nm:'forbidden-claims sweep',pass:open===0,info:open+' open · '+fp+' context-triaged (honesty banners quoting the claim to forbid it)'});
   return{cells,detail:d}}},
 {id:'selfscan',nm:'6 · SOURCE SELF-SCAN — the app greps its own script',run(){
   const d=[];const src=armySource();const cells=5;
   /* inline HTML attribute handlers only (attribute form, quote-anchored) —
      element-property listeners are registered JS behavior, not dead-control
      risk. Exactly 3 benign sites are this scanner's own strings: the F-0001
      seed evidence, its triage note, and this regex literal. */
   const onclicks=(src.match(/onclick="/g)||[]).length;
   d.push({nm:'zero inline onclick attributes',pass:onclicks<=3,info:onclicks+' matches (3 allowed: this scanner’s own pattern strings) — the app wires controls via data-cmd only'});
   if(onclicks>3)armyFind('S1','Frontend Architect','inline-onclick','source','nominal',(onclicks-3)+' inline onclick attribute site(s) beyond the scanner’s own strings','self-scan','OPEN');
   const mr=(src.match(/Math\.random/g)||[]).length;
   d.push({nm:'no unseeded randomness',pass:mr<=2,info:mr+' Math.random mentions (≤2: scanner patterns) — data uses seeded PRNGs only'});
   if(mr>2)armyFind('S1','Data-Truth Engineer','determinism','source','nominal',mr+' Math.random sites','self-scan','OPEN');
   const ls=(src.match(/localStorage|sessionStorage/g)||[]).length;
   d.push({nm:'no client-side persistence of authority',pass:ls<=2,info:ls+' storage mentions (≤2: scanner) — reload never carries authority (mode ladder holds)'});
   if(ls>2)armyFind('S1','Security Engineer','client-authority','source','first-run','storage use found — authority could survive reload','self-scan','OPEN');
   const ev=(src.match(/\beval\s*\(/g)||[]).length;
   d.push({nm:'no eval',pass:ev<=1,info:ev+' eval mentions (≤1: scanner pattern)'});
   const secrets=(src.match(/sk-[A-Za-z0-9]{20}|API_KEY\s*=|Bearer [A-Za-z0-9._-]{20}/g)||[]).length;
   d.push({nm:'no secrets in client',pass:secrets===0,info:secrets+' credential-shaped strings — keys live server-side, never in the browser'});
   if(secrets)armyFind('S0','Security Engineer','secret-in-client','source','nominal',secrets+' credential-shaped strings','self-scan','OPEN');
   return{cells,detail:d}}},
 {id:'perf',nm:'7 · PERFORMANCE — measured, not claimed',run(){
   const d=[];const t0=performance.now();const v=VIEWS[S.domain+'.'+S.ws];let n=0;
   for(let i=0;i<10;i++){try{v&&v()}catch(e){}n++}POSTRENDER.length=0;
   const per=(performance.now()-t0)/Math.max(1,n);
   d.push({nm:'current view render cost',pass:per<50,info:per.toFixed(1)+'ms avg over '+n+' builds vs 50ms budget (measured now)'});
   if(per>=50)armyFind('S3','SRE / Performance','render-budget',S.domain+'.'+S.ws,'nominal','view builds in '+per.toFixed(0)+'ms > 50ms budget','10-build benchmark','OPEN');
   const src=armySource();const kb=Math.round(src.length/1024);
   d.push({nm:'bundle weight honesty',pass:true,info:kb+'KB of script — single file by design; budget review at 1,024KB'});
   return{cells:2,detail:d}}},
 {id:'journaling',nm:'8 · COMPLIANCE — LAW-018 journaling & packet completeness',run(){
   const d=[];let cells=0;
   const p=PACKETS[0];cells++;
   const full=p&&p.secs&&p.secs.length===19&&p.votes&&p.votes.length===19;
   d.push({nm:'LAW-007 · 19/19 sections + votes on golden packet',pass:!!full,info:full?p.id+' complete':'incomplete packet could reach approval'});
   if(!full)armyFind('S1','Compliance Auditor','packet-incomplete','decisions.packet','nominal','golden packet not 19/19','p.secs/p.votes length','OPEN');
   cells++;const rejects=JOURNAL.filter(j=>j.kind==='REJECTED').length;
   d.push({nm:'LAW-018 · rejections are journaled data',pass:rejects>0,info:rejects+' rejection records in the journal — rejection reasons are data'});
   cells++;const audited=SVR.ledger.filter(l=>l.kind==='decision').length;
   d.push({nm:'decisions land in the audit ledger',pass:audited>0,info:audited+' decision rows with actor + hash'});
   return{cells,detail:d}}},
];

function armyRunPass(id){
  const p=ARMY_PASSES.find(x=>x.id===id);if(!p)return;
  const r=p.run();
  ARMY_RUNS[id]={at:CLOCK.hms(),cells:r.cells,found:r.detail.filter(x=>!x.pass).length,detail:r.detail};
  SVR.audit('AUDIT ARMY','army','Pass "'+p.nm+'" executed — '+r.cells+' cells · '+r.detail.filter(x=>!x.pass).length+' failing checks · findings ledger updated');
}
function armyCells(){
  const screens=Object.keys(VIEWS).length;
  const total=screens*ARMY_SEATS.length*ARMY_STATES.length;
  const done=Object.values(ARMY_RUNS).reduce((a,r)=>a+r.cells,0);
  return{screens,total,done};
}

CMD.define({id:'army.runall',label:'Run all passes',purpose:'Execute every audit pass against the live application — results and findings are whatever actually happened',
  run:()=>{ARMY_PASSES.forEach(p=>armyRunPass(p.id));render();
    const open=ARMY_LEDGER.filter(f=>f.status==='OPEN').length;
    UI.toast('All 8 passes executed — '+armyCells().done+' cells this session · '+open+' OPEN findings','ok','AUDIT ARMY')}});
CMD.define({id:'army.pass',label:'Run pass',purpose:'Execute one ordered audit pass',audit:false,run:a=>{armyRunPass(a);render()}});
CMD.define({id:'army.filter',label:'Filter ledger',purpose:'Filter the findings ledger',audit:false,
  run:a=>{const[k,v]=a.split('=');ARMY_FILTER[k]=v;render()}});
CMD.define({id:'army.triage',label:'Triage finding',purpose:'Open the triage form — status changes carry reasons, never silence',
  run:a=>{const f=ARMY_LEDGER.find(x=>x.id===a);if(!f)return;
    UI.modal('TRIAGE '+f.id,'<div class="kv"><span class="k">FINDING</span><span class="v">'+U.esc(f.finding)+'</span></div>'+
      '<div class="kv"><span class="k">STATUS</span><span class="v"><select id="army-st" class="inp">'+['OPEN','FIXED','TRIAGED-FP','WONTFIX'].map(s=>'<option'+(f.status===s?' selected':'')+'>'+s+'</option>').join('')+'</select></span></div>'+
      '<div class="kv"><span class="k">REASON</span><span class="v"><input id="army-note" class="inp" value="'+U.esc(f.note||'')+'" placeholder="required for TRIAGED-FP / WONTFIX" maxlength="200"></span></div>',
      '<button class="btn" data-cmd="ui.closeModal">Cancel</button><button class="btn pri" data-cmd="army.triage.save" data-arg="'+f.id+'">Save triage</button>')}});
CMD.define({id:'army.triage.save',label:'Save triage',purpose:'Persist the triage decision to the ledger',
  run:a=>{const f=ARMY_LEDGER.find(x=>x.id===a);if(!f)return;
    const st=$('#army-st'),note=$('#army-note');const s=st?st.value:f.status,n=note?note.value.trim():'';
    if((s==='TRIAGED-FP'||s==='WONTFIX')&&!n){UI.toast('A reason is required — false positives are triaged, never silently dropped','warn','AUDIT ARMY');return}
    f.status=s;f.note=n||f.note;UI.closeModal();
    SVR.audit('HUMAN (owner)','army',f.id+' triaged → '+s+(n?' · '+n:''));render()}});
CMD.define({id:'army.add',label:'File finding',purpose:'Manually file a finding — the operator is the 13th seat',
  run:()=>{UI.modal('FILE A FINDING',
    '<div class="kv"><span class="k">SEVERITY</span><span class="v"><select id="army-sev" class="inp">'+Object.keys(ARMY_SEV).map(s=>'<option>'+s+'</option>').join('')+'</select></span></div>'+
    '<div class="kv"><span class="k">SCREEN</span><span class="v"><input id="army-scr" class="inp" value="'+U.esc(S.domain+'.'+S.ws)+'"></span></div>'+
    '<div class="kv"><span class="k">FINDING</span><span class="v"><input id="army-fin" class="inp" placeholder="what is wrong, specifically" maxlength="160"></span></div>'+
    '<div class="kv"><span class="k">EVIDENCE</span><span class="v"><input id="army-ev" class="inp" placeholder="repro / where seen" maxlength="120"></span></div>',
    '<button class="btn" data-cmd="ui.closeModal">Cancel</button><button class="btn pri" data-cmd="army.add.save">File it</button>')}});
CMD.define({id:'army.add.save',label:'Save finding',purpose:'Append the manual finding to the ledger',
  run:()=>{const fin=$('#army-fin');if(!fin||!fin.value.trim()){UI.toast('A finding needs substance','warn','AUDIT ARMY');return}
    armyFind(($('#army-sev')||{}).value||'S3','HUMAN (owner)','manual',($('#army-scr')||{}).value||'—','nominal',fin.value.trim(),($('#army-ev')||{}).value||'operator observation','OPEN');
    UI.closeModal();SVR.audit('HUMAN (owner)','army','Manual finding filed: '+fin.value.trim().slice(0,80));render()}});
CMD.define({id:'army.csv',label:'Export ledger CSV',purpose:'Download the findings ledger — the CSV contract from the audit doctrine',
  run:()=>{const rows=[['id','severity','persona','check','screen','state','finding','evidence','status','triage_note']]
    .concat(ARMY_LEDGER.map(f=>[f.id,f.sev,f.persona,f.check,f.screen,f.state,f.finding,f.evidence,f.status,f.note]));
    const csv=rows.map(r=>r.map(c=>'"'+String(c??'').replace(/"/g,'""')+'"').join(',')).join('\n');
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='ATLAS_audit_findings.csv';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),4000);
    SVR.audit('HUMAN (owner)','export','Findings ledger exported — '+ARMY_LEDGER.length+' rows');UI.toast('Findings ledger downloaded — '+ARMY_LEDGER.length+' rows','ok','AUDIT ARMY')}});
CMD.define({id:'army.report',label:'Cycle report',purpose:'Assemble the six-part cycle report from live results — never a vibe',
  run:()=>{const c=armyCells();const bySev={};ARMY_LEDGER.forEach(f=>{if(f.status==='OPEN')bySev[f.sev]=(bySev[f.sev]||0)+1});
    const worst=ARMY_LEDGER.filter(f=>f.status==='OPEN').sort((a,b)=>a.sev.localeCompare(b.sev)).slice(0,3);
    const ran=Object.entries(ARMY_RUNS).map(([id,r])=>{const p=ARMY_PASSES.find(x=>x.id===id);return '- '+p.nm+' — '+r.cells+' cells, '+r.found+' failing, at '+r.at});
    const md=['# ATLAS AUDIT ARMY — CYCLE REPORT','','## 1 · What was found',
      Object.keys(bySev).length?Object.entries(bySev).map(([s,n])=>s+': '+n+' open ('+ARMY_SEV[s]+')').join(' · '):'0 open findings across executed cells',
      worst.length?'Worst: '+worst.map(f=>f.id+' ['+f.sev+'] '+f.finding).join(' | '):'',
      '','## 2 · What was executed',...(ran.length?ran:['- no passes this session — run them; coverage is counted, not claimed']),
      '','## 3 · Coverage honesty','Executed '+c.done+' of '+c.total+' matrix cells ('+c.screens+' screens × 12 seats × 8 states). Unexecuted cells are UNKNOWN, not passing.',
      '','## 4 · Evidence','Every row in ATLAS_audit_findings.csv carries evidence; every status change carries a reason.',
      '','## 5 · What remains open',ARMY_LEDGER.filter(f=>f.status==='OPEN').map(f=>'- '+f.id+' ['+f.sev+'] '+f.finding).join('\n')||'- nothing open in the current ledger',
      '','## 6 · Next highest-leverage slice','Re-run GATES after any SVR change; extend states coverage (stale-data/kill cells) via the drill panel.'].join('\n');
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([md],{type:'text/markdown'}));a.download='ATLAS_audit_cycle_report.md';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),4000);
    SVR.audit('AUDIT ARMY','army','Cycle report generated — '+c.done+'/'+c.total+' cells · '+(ARMY_LEDGER.filter(f=>f.status==='OPEN').length)+' open');
    UI.toast('Six-part cycle report downloaded — coverage stated as executed cells, never a typed number','gold','AUDIT ARMY')}});

DOMAINS.system.ws.push({id:'audits',label:'Audit Army'});
VIEWS['system.audits']=function(){
  const c=armyCells();
  let h=vhead('SYSTEM · audit army','12 expert seats · 8 ordered passes · a findings ledger where every row has evidence',
    '"Review 1000×" means the coverage matrix executed and counted — never a number typed into a report. Passes below run REAL assertions against this running application, including the gate attack list and a source self-scan.');
  h+='<div class="btnrow" style="margin-bottom:12px"><button class="btn pri" data-cmd="army.runall">⚔ Run all 8 passes now</button>'+
     '<button class="btn sm" data-cmd="army.add">+ File finding</button><button class="btn sm" data-cmd="army.csv">↓ Ledger CSV</button>'+
     '<button class="btn sm gold" data-cmd="army.report">Six-part cycle report</button>'+
     '<span class="pill">executed '+U.int(c.done)+' of '+U.int(c.total)+' matrix cells this session</span></div>';
  h+='<div class="grid g2">';
  h+=panel('THE HONESTY CONTRACT','adopted verbatim from the audit doctrine — praise is worthless; unfound defects are expensive',
    [['Coverage','the matrix ('+c.screens+' screens × 12 seats × 8 states = '+U.int(c.total)+' cells), executed and counted'],
     ['Findings','severity + evidence + repro — or it does not exist'],
     ['Clean areas','stated as "checked N cells, 0 findings" — never "perfect"'],
     ['False positives','triaged with reasons in the ledger, never deleted'],
     ['Fixes','a fix without a regression check is not fixed'],
     ['Forbidden','fabricated pass counts · profitability claims · averaging severities · hiding dissent between seats']]
    .map(r=>kv(r[0],'<span style="font-size:11px">'+r[1]+'</span>')).join(''));
  h+=panel('SEVERITY LAW','max across seats, never the mean · any synthetic-as-live = S1 minimum · any law bypass = S0',
    Object.entries(ARMY_SEV).map(([s,t])=>kv(s,'<span style="font-size:11px;color:'+(s==='S0'?'var(--blk)':s==='S1'?'var(--warn)':'var(--ink1)')+'">'+U.esc(t)+'</span>')).join('')+
    '<div class="hr"></div>'+kv('STATES','<span class="mono" style="font-size:10px">'+ARMY_STATES.join(' · ')+'</span>'));
  h+='</div>';
  h+=panel('THE ARMY — 12 SEATS','two battalions; a finding’s severity is the max across every seat that sees it',
    tbl(['Battalion','Seat','Mandate'],ARMY_SEATS.map(s=>'<tr><td>'+chip(s[0]==='DEV'?'DEVELOPER':'TRADING',s[0]==='DEV'?'ch-info':'ch-live',s[0]==='DEV'?'⌗':'◆')+'</td><td><b style="font-size:11.5px">'+s[1]+'</b></td><td class="i1" style="font-size:11px">'+U.esc(s[2])+'</td></tr>').join('')),{flush:true});
  h+=panel('ORDERED PASSES — executed against the live app','each RUN re-executes real assertions; results render verbatim, failures file findings automatically',
    tbl(['Pass','Last run','Cells','Failing','',''],ARMY_PASSES.map(p=>{const r=ARMY_RUNS[p.id];
      return '<tr><td style="font-size:11.5px"><b>'+U.esc(p.nm)+'</b></td><td class="mono" style="font-size:10.5px">'+(r?r.at:'—')+'</td><td class="mono">'+(r?r.cells:'—')+'</td><td>'+(r?(r.found?'<b style="color:var(--blk)">'+r.found+'</b>':'<span class="up">0</span>'):'—')+'</td>'+
      '<td><button class="btn sm" data-cmd="army.pass" data-arg="'+p.id+'">Run</button></td></tr>'}).join('')),{flush:true});
  const lastRun=Object.entries(ARMY_RUNS);
  if(lastRun.length){
    h+='<div class="grid g2">';
    lastRun.slice(-4).forEach(([id,r])=>{const p=ARMY_PASSES.find(x=>x.id===id);
      h+=panel(p.nm.toUpperCase(),'ran '+r.at+' · '+r.cells+' cells',
        r.detail.map(t=>kv(t.pass?'✓':'✕','<b style="font-size:11px;color:'+(t.pass?'var(--pos)':'var(--blk)')+'">'+U.esc(t.nm)+'</b> — <span class="i1" style="font-size:10.5px">'+U.esc(t.info)+'</span>')).join(''))});
    h+='</div>';
  }
  const fl=ARMY_LEDGER.filter(f=>(ARMY_FILTER.sev==='ALL'||f.sev===ARMY_FILTER.sev)&&(ARMY_FILTER.status==='ALL'||f.status===ARMY_FILTER.status));
  const sevBtn=s=>'<button class="btn sm'+(ARMY_FILTER.sev===s?' pri':'')+'" data-cmd="army.filter" data-arg="sev='+s+'">'+s+'</button>';
  const stBtn=s=>'<button class="btn sm'+(ARMY_FILTER.status===s?' pri':'')+'" data-cmd="army.filter" data-arg="status='+s+'">'+s+'</button>';
  h+=panel('FINDINGS LEDGER — '+fl.length+' of '+ARMY_LEDGER.length+' rows','append-only in spirit: status changes carry reasons; the CSV contract is exportable above',
    '<div class="btnrow" style="margin-bottom:8px">'+['ALL','S0','S1','S2','S3','S4'].map(sevBtn).join('')+'<span class="tsep"></span>'+['ALL','OPEN','FIXED','TRIAGED-FP','WONTFIX'].map(stBtn).join('')+'</div>'+
    tbl(['ID','Sev','Seat','Screen','Finding · evidence','Status',''],fl.slice(0,60).map(f=>'<tr'+(f.sev==='S0'&&f.status==='OPEN'?' style="background:var(--blk-bg)"':'')+'><td class="mono" style="font-size:10px">'+f.id+'</td>'+
      '<td>'+chip(f.sev,f.sev==='S0'?'ch-blk':f.sev==='S1'?'ch-warn':'ch-info','!')+'</td>'+
      '<td class="i1" style="font-size:10.5px">'+U.esc(f.persona)+'</td><td class="mono" style="font-size:10px">'+U.esc(f.screen)+'</td>'+
      '<td style="font-size:11px"><b>'+U.esc(f.finding)+'</b><div class="i2" style="font-size:10px">'+U.esc(f.evidence)+(f.note?' · <i>'+U.esc(f.note)+'</i>':'')+'</div></td>'+
      '<td>'+chip(f.status,f.status==='OPEN'?'ch-warn':f.status==='FIXED'?'ch-ok':'ch-mut',f.status==='OPEN'?'!':'✓')+'</td>'+
      '<td><button class="btn sm" data-cmd="army.triage" data-arg="'+f.id+'">Triage</button></td></tr>').join('')),{flush:true});
  h+=panel('WHY AN ARMY, NOT A REVIEWER','the audit doctrine in one paragraph',
    '<div class="i1" style="font-size:11.5px;line-height:1.75">A single reviewer praises; an army with named seats and an evidence contract finds. The developer battalion attacks the software (dead controls, leaks, sinks, determinism); the trading battalion attacks the desk (gates, freshness at the decision point, claims language, journaling). Severity is the <b>max</b> across seats because a "minor" UI issue that hides a stale quote is an S1 to the scalper seat. The matrix is honest about what was NOT checked: '+U.int(c.total-c.done)+' cells are currently UNKNOWN — unknown is not passing. '+prov('LAW-018')+' '+prov('LAW-014')+'</div>');
  return h;
};
