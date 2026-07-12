/* ═══════════ V14 · PART 26 — COMMAND & SYSTEM DEEP ═══════════
   Three organs. The Morning Briefing compiler (command.briefing): the desk’s
   07:00 document, ASSEMBLED LIVE from application state — every section derives
   from a real store and cites the workspace that owns it. The SLO & Performance
   Observatory (system.slo): render costs MEASURED this session by wrapping the
   real render(), never claimed. Release Governance (system.releases): the
   shipping discipline — changelog defects, a computed SHIP/HOLD verdict,
   migration gates, a rollback drill that executes real structural checks. */

DOMAINS.command.ws.push({id:'briefing',label:'Morning Briefing'});
DOMAINS.system.ws.push({id:'slo',label:'SLO Observatory'});
DOMAINS.system.ws.push({id:'releases',label:'Releases'});

/* ── governed thresholds this part cites (same registration pattern as V12.1 caps) ── */
Object.assign(CONFIG,{
 'slo.render_budget_ms':{v:50,unit:'ms',law:'SLO-021',why:'Full render() pass budget. A slow desk misses exits — sustained breach feeds the degradation ladder (LAW-006 family), not a shrug'},
 'brief.read_budget_s':{v:90,unit:'seconds',law:'BRF-001',why:'Morning briefing read budget. Six sections, one action, ninety seconds — longer is research, not a briefing'},
});
['slo.render_budget_ms','brief.read_budget_s'].forEach(k=>{PROV_TIPS[k]=k+' = '+CONFIG[k].v+' '+CONFIG[k].unit+'\n'+CONFIG[k].why});

/* ═══════════ CSD_SLO · render instrumentation — measured, not claimed ═══════════
   render is wrapped ONCE, here, at module load — before the boot engine fires
   its first pass, so sample #1 is the boot render itself. Ring buffer, cap 200:
   the instrument obeys the same bounded-stream law it exists to verify. */
const CSD_SLO={buf:[],cap:200,
 rec(ms){this.buf.push({t:S.tick,ms,view:S.domain+'.'+(S.ws||(DOMAINS[S.domain]?DOMAINS[S.domain].ws[0].id:'boot'))});
  if(this.buf.length>this.cap)this.buf.shift()},
 stats(){const a=this.buf.map(x=>x.ms).slice().sort((m,n)=>m-n);if(!a.length)return null;
  const q=f=>a[Math.min(a.length-1,Math.round(f*(a.length-1)))];
  return{n:a.length,last:this.buf[this.buf.length-1].ms,med:q(0.5),p95:q(0.95),max:a[a.length-1],
   mean:a.reduce((acc,x)=>acc+x,0)/a.length}},
 byView(){const m={};this.buf.forEach(sm=>{(m[sm.view]=m[sm.view]||[]).push(sm.ms)});
  return Object.entries(m).map(([view,arr])=>{const srt=arr.slice().sort((x,y)=>x-y);
   return{view,n:arr.length,med:srt[Math.floor(srt.length/2)],max:srt[srt.length-1]}})
   .sort((x,y)=>y.med-x.med)}};
const CSD_render0=render;
render=function(){const t0=performance.now();CSD_render0();CSD_SLO.rec(performance.now()-t0)};
let CSD_BENCH=null;

/* ═══════════ CSD_BRIEF · briefing state + live compiler ═══════════ */
const CSD_BRIEF={ack:false,ackAt:null,gen:1,mdCount:0};
const CSD_FSMRANK={TRIGGERED:0,ARMED:1,FORMING:2,CANDIDATE:3,SCANNING:4};

/* the compiler: every field below is READ from a live store at call time.
   Nothing is cached, nothing is stored — recompile and the document moves
   with the state. That is the entire point of an assembled briefing. */
function CSD_briefData(){
 const maxR=ck('risk.max_open_risk_R');
 const posture={regime:REGIME.label,doctrine:REGIME.posture,riskMode:S.riskMode,kill:S.kill,
  dataHealth:S.dataHealth,openR:S.openRiskR,maxR,headroom:maxR-S.openRiskR,
  read:S.kill?'HALTED — the kill switch owns every order path. Nothing in this document authorizes an entry until the halt reason is resolved and the resume is logged.'
   :S.riskMode!=='NORMAL'?('risk_mode '+S.riskMode+' — the sizing ladder is engaged. Today’s plan bends to the ledger, not the other way around.')
   :'Full risk authority. '+REGIME.posture};
 const hunt=SYMS.filter(sy=>CSD_FSMRANK[sy.fsm]<=2)
  .sort((a,b)=>(CSD_FSMRANK[a.fsm]-CSD_FSMRANK[b.fsm])||(b.rs-a.rs)).slice(0,3)
  .map(sy=>{const L=sy.levels||{};
   const den=sy.bias==='SHORT'?(L.stop-L.entry):(L.entry-L.stop);
   const rr=den>0&&L.t2?Math.abs(L.t2-L.entry)/den:0;
   return{sym:sy.sym,setup:sy.setup,fsm:sy.fsm,bias:sy.bias,entry:L.entry,stop:L.stop,t1:L.t1,t2:L.t2,rr,
    unmet:sy.unmet||[],note:sy.note}});
 const evWin=ck('risk.event_window_hrs');
 const landmines={rows:EVENTS,evWin,
  law:'No new entries inside '+evWin+'h of a binary event. The window is computed by the risk engine, not remembered by you — LAW-017 is enforcement, not advice.'};
 const learning={court:COURT.slice(0,2),memory:MEMORY.slice(0,2)};
 const gmap={'A':95,'A-':91,'B+':88,'B':84,'B-':80,'C+':77,'C':73,'C-':70};
 const graded=JOURNAL.filter(j=>gmap[j.grade]);
 const score=graded.length?Math.round(graded.reduce((acc,j)=>acc+gmap[j.grade],0)/graded.length):null;
 const composite=score===null?'—':score>=93?'A':score>=90?'A-':score>=87?'B+':score>=83?'B':score>=80?'B-':score>=77?'C+':'C';
 const yesterday={rows:JOURNAL.slice(0,5),score,composite,
  correctRejects:JOURNAL.filter(j=>/correct rejection/.test(j.outcome||'')).length,
  missed:JOURNAL.filter(j=>/missed winner/.test(j.outcome||'')).length,
  dayPnl:S.dayPnl,weekPnl:S.weekPnl,dayLossUsedR:S.dayLossUsedR};
 /* THE ONE THING — a briefing that ends without a single named action is a newspaper */
 const q=PACKETS.filter(pk=>pk.state==='READY_FOR_HUMAN');
 let one;
 if(S.kill)one={k:'RUN THE RESUME PROTOCOL',go:'command.cockpit',goLabel:'Command → Cockpit',
  txt:'The desk is halted'+(S.killReason?' — '+S.killReason:'')+'. Resolve the reason for the halt, then clear it through desk resume (logged, owner-only). Open positions were never touched; only NEW order paths are locked. Nothing else on this page matters until this is done.'};
 else if(q.length)one={k:'JUDGE '+q[0].id,go:'decisions.queue',goLabel:'Decisions → Queue',
  txt:q[0].sym+' '+q[0].dir+' · '+q[0].playbook+' · grade '+q[0].grade+' · '+U.mmss(q[0].ttl)+' on the TTL clock. A complete packet is waiting on the only thing the machine cannot supply: your judgment. After the TTL the evidence is stale by law (GOV-021) and the packet archives itself unjudged.'};
 else if(hunt.length)one={k:'TRIGGER PLAN — '+hunt[0].sym,go:'markets.scanner',goLabel:'Markets → Scanner',
  txt:hunt[0].sym+' '+hunt[0].setup+' is the ranked-first setup ('+hunt[0].fsm+'). Plan: entry '+U.fmt(hunt[0].entry)+' · stop '+U.fmt(hunt[0].stop)+' · T2 path '+U.fmt(hunt[0].rr,2)+'R. '+(hunt[0].unmet.length?'Unmet before anything happens: '+hunt[0].unmet.join(' · ')+'. Watch the gate, not the price.':'All conditions met — expect a packet, then judge it.')};
 else one={k:'NO_TRADE IS THE POSITION',go:'markets.scanner',goLabel:'Markets → Scanner',
  txt:'Nothing triggered, nothing armed, nothing pending. The funnel is working — rejection is its default state. Stand aside and let the heartbeat run.'};
 return{posture,hunt,landmines,learning,yesterday,one,q,at:CLOCK.hms()};
}

/* the SAME data, serialized as a real markdown file — one compiler, two surfaces */
function CSD_briefMd(){
 const b=CSD_briefData(),L=[];
 L.push('# ATLAS MORNING BRIEFING — '+CLOCK.hm()+' ET (sim)');
 L.push('');
 L.push('> DEMO — assembled live from application state at '+b.at+' · seed '+ck('demo.seed')+' · generation '+CSD_BRIEF.gen);
 L.push('> Read budget: '+ck('brief.read_budget_s')+'s (BRF-001). One action at the end. Sign it or argue with it — never skim it.');
 L.push('');
 L.push('## A · POSTURE — source: Markets → Regime');
 L.push('- Regime: '+b.posture.regime+' · risk_mode '+b.posture.riskMode+' · data '+b.posture.dataHealth+(b.posture.kill?' · KILL ENGAGED':''));
 L.push('- Open risk: '+U.fmt(b.posture.openR,2)+'R of '+b.posture.maxR+'R cap (risk.max_open_risk_R) — headroom '+U.fmt(b.posture.headroom,2)+'R');
 L.push('- Read: '+b.posture.read);
 L.push('');
 L.push('## B · THE HUNT — source: Markets → Scanner');
 b.hunt.forEach((hh,i)=>{
  L.push((i+1)+'. **'+hh.sym+'** '+hh.setup+' · '+hh.fsm+' · '+hh.bias+' — entry '+U.fmt(hh.entry)+' / stop '+U.fmt(hh.stop)+' / T1 '+U.fmt(hh.t1)+' / T2 '+U.fmt(hh.t2)+' ('+U.fmt(hh.rr,2)+'R path)');
  L.push('   unmet: '+(hh.unmet.length?hh.unmet.join(' · '):'all conditions met'))});
 if(!b.hunt.length)L.push('- Nothing above CANDIDATE. A quiet hunt list is information, not failure.');
 L.push('');
 L.push('## C · LANDMINES — source: Markets → Calendar');
 b.landmines.rows.forEach(ev=>L.push('- '+ev.t+' — '+ev.what+' ['+ev.cls+']'+(ev.block?' · BLACKOUT ARMS':'')+' — '+ev.impact));
 L.push('- LAW-017: '+b.landmines.law);
 L.push('');
 L.push('## D · OVERNIGHT LEARNING — source: Review → Learning Court / AI Memory');
 b.learning.court.forEach(cc=>L.push('- '+cc.id+' ['+cc.stage+'] '+cc.title+' — '+cc.evidence));
 b.learning.memory.forEach(mm=>L.push('- '+mm.id+' ['+mm.cat+'] '+mm.txt));
 L.push('');
 L.push('## E · YESTERDAY’S GRADE — source: Review → Journal');
 L.push('- Composite process grade: '+b.yesterday.composite+(b.yesterday.score!==null?' ('+b.yesterday.score+'/100 across '+b.yesterday.rows.length+' recent entries)':''));
 L.push('- Correct rejections on record: '+b.yesterday.correctRejects+' · missed winners: '+b.yesterday.missed+' (both are data — LAW-018)');
 L.push('- Running P&L (paper): day '+U.money(b.yesterday.dayPnl)+' · week '+U.money(b.yesterday.weekPnl)+' · day-loss used '+U.fmt(b.yesterday.dayLossUsedR,2)+'R of '+ck('risk.max_day_loss_R')+'R');
 b.yesterday.rows.forEach(j=>L.push('- '+j.t+' '+j.id+' '+j.sym+' ['+j.kind+'] '+j.what+' → '+j.outcome));
 L.push('');
 L.push('## F · THE ONE THING');
 L.push('**'+b.one.k+'** — '+b.one.txt);
 L.push('');
 L.push('---');
 L.push(CSD_BRIEF.ack?'Acknowledged '+CSD_BRIEF.ackAt+' ET (sim) by HUMAN (owner) — on the ledger.':'UNSIGNED at export time. A brief nobody signed graded nobody at the close.');
 L.push('DEMO document · synthetic session · deterministic seed '+ck('demo.seed')+' · rules '+RULES_VERSION);
 return L.join('\n');
}

/* 5 archived briefings — demo twins, kept so the loop visibly closes:
   posture stated → one-thing named → ack time → grade AT THE CLOSE. */
const CSD_BRIEF_HIST=[
 {d:'T-1d · Fri',posture:'RISK-ON ROTATION',one:'Judge PKT-2214 (NVDA MMBM) before the killzone opens',ack:'07:03',grade:'A- · +5.2R closed on the named setup — plan and tape agreed'},
 {d:'T-2d · Thu',posture:'RISK-ON · breadth thinning',one:'TSLA runner: honor the 25/50/75 template — no manual exits',ack:'07:11',grade:'A · template executed to the letter, +5.4R, slippage −0.4bps'},
 {d:'T-3d · Wed',posture:'CHOP — scalp extremes only',one:'Stand aside 11:45–13:15; nothing below grade A trades',ack:'07:02',grade:'B+ · one paper scalp, flat day — standing aside was the trade'},
 {d:'T-4d · Tue',posture:'RISK-ON into CPI shadow',one:'Trim index-correlated size before the blackout arms (LAW-017)',ack:'07:22 · LATE',grade:'B- · late ack, size trimmed 40 minutes behind plan — the ack time IS the finding'},
 {d:'T-5d · Mon',posture:'RISK-OFF EXTREME · reversal watch',one:'No knife-catching: MMBM needs the reclaim, not the low',ack:'07:05',grade:'A- · two rejections, both process-correct by autopsy'},
];

/* ── briefing commands ── */
CMD.define({id:'brief.jump',label:'Open source workspace',purpose:'Every briefing section cites the workspace that owns its data — jump straight to it',audit:false,
 run:a=>{const[dd,ww]=String(a||'').split('.');if(DOMAINS[dd])go(dd,ww)}});
CMD.define({id:'brief.ack',label:'Acknowledge briefing',purpose:'Sign the 07:00 document — the ack is the pre-commitment the close gets graded against',
 pre:()=>CSD_BRIEF.ack?'Already acknowledged at '+CSD_BRIEF.ackAt+' — one signature per session; recompile does not un-sign a signed day':null,
 run:()=>{CSD_BRIEF.ack=true;CSD_BRIEF.ackAt=CLOCK.hms();
  const b=CSD_briefData();
  SVR.audit('HUMAN (owner)','brief','briefing acknowledged — posture '+REGIME.label+' · risk_mode '+S.riskMode+' · one-thing: '+b.one.k);
  UI.toast('Briefing acknowledged '+CSD_BRIEF.ackAt+' — the close will be graded against what you just signed','gold','MORNING BRIEFING');render()}});
CMD.define({id:'brief.md',label:'Download briefing (.md)',purpose:'The same live-assembled document as a real markdown file — one compiler, two surfaces',
 run:()=>{CSD_BRIEF.mdCount++;
  const blob=new Blob([CSD_briefMd()],{type:'text/markdown'});
  const a2=document.createElement('a');a2.href=URL.createObjectURL(blob);a2.download='ATLAS_morning_briefing_demo.md';a2.click();
  setTimeout(()=>URL.revokeObjectURL(a2.href),4000);
  SVR.audit('HUMAN (owner)','export','Morning briefing exported as markdown — generation '+CSD_BRIEF.gen+' · assembled from live stores, not a template');
  UI.toast('Briefing downloaded — a real .md file, compiled from the same state as the screen','ok','EXPORT')}});
CMD.define({id:'brief.refresh',label:'Recompile briefing',purpose:'Re-derive every section from current stores — nothing on this document is cached',audit:false,
 run:()=>{CSD_BRIEF.gen++;UI.toast('Recompiled from live stores — generation '+CSD_BRIEF.gen+'. If a number moved, the state moved.','','BRIEFING');render()}});
CMD.define({id:'brief.hist',label:'Archived briefing',purpose:'Read a past briefing next to its grade-at-close — the loop closes or the brief was theater',audit:false,
 run:a=>{const r2=CSD_BRIEF_HIST[+a];if(!r2)return;
  UI.drawer('<div class="dhead"><span class="dt">ARCHIVED BRIEFING · '+U.esc(r2.d)+'</span><span class="pill">demo twin · grade-at-close attached</span><button class="dx" data-cmd="ui.closeDrawer">ESC</button></div>'+
   '<div class="dbody">'+
   kv('POSTURE AS STATED',U.esc(r2.posture))+
   kv('THE ONE THING',U.esc(r2.one))+
   kv('ACKNOWLEDGED',U.esc(r2.ack)+(r2.ack.includes('LATE')?' — <span class="dn">the read budget exists because this happens</span>':''))+
   kv('GRADE AT CLOSE',U.esc(r2.grade))+
   '<div class="banner info" style="margin-top:10px"><span class="bico">i</span><div><b>Why archives matter:</b> the briefing is a pre-commitment device. Its value is only provable AFTER the close, when the stated one-thing is compared against what the operator actually did. An unauditable brief is a horoscope.</div></div>'+
   '</div>')}});

/* ═══════════ COMMAND · morning briefing — the 07:00 document, compiled live ═══════════ */
VIEWS['command.briefing']=function(){
 const b=CSD_briefData();
 const src=(route,label)=>'<button class="btn sm" data-cmd="brief.jump" data-arg="'+route+'" style="background:#E5DEC9;border-color:#C9BFA5;color:#403820;font-size:9px;padding:2px 8px" title="Source of record — every section names the workspace that owns its data">SOURCE · '+U.esc(label)+'</button>';
 let h=vhead('COMMAND · morning briefing compiler','The 07:00 document — assembled from live stores, never stored',
  'Every section below is DERIVED at render time: posture from REGIME + risk state, the hunt from the scanner FSM, landmines from the calendar, learning from the court, the grade from the journal. Recompile and the document moves with the state — that is the point. Read budget '+ck('brief.read_budget_s')+'s '+prov('brief.read_budget_s')+'.',
  CSD_BRIEF.ack?chip('ACKNOWLEDGED '+CSD_BRIEF.ackAt,'ch-ok','✓'):chip('UNSIGNED','ch-warn','!'));
 h+='<div class="btnrow" style="margin-bottom:12px">'+
  CMD.btn('brief.ack',null,'gold','◆ Acknowledge — sign the day')+
  CMD.btn('brief.md',null,'','Download .md — real file')+
  CMD.btn('brief.refresh',null,'sm','Recompile from stores')+
  '<span class="pill">generation '+CSD_BRIEF.gen+' · assembled '+b.at+' ET (sim)</span>'+
  (CSD_BRIEF.mdCount?'<span class="pill">'+CSD_BRIEF.mdCount+' export'+(CSD_BRIEF.mdCount>1?'s':'')+' this session</span>':'')+
 '</div>';
 /* ── the ivory document — a document a human signs, not a widget ── */
 h+='<div class="ivory"><h3>MORNING BRIEFING — '+CLOCK.hm()+' ET (SIM) · GENERATION '+CSD_BRIEF.gen+'</h3>'+
  '<div style="font-size:10.5px;color:#6B5F3E;margin-bottom:8px">DEMO session — every number below is read from the running stores at compile time. Six sections, one action, '+ck('brief.read_budget_s')+' seconds. The desk would rather you read this than the tape for the first 90 seconds of your day.</div>';
 /* §A POSTURE */
 h+='<details class="isec" open><summary>§A · POSTURE — where the desk stands before the first quote matters</summary><div>'+
  '<div style="margin-bottom:6px">'+src('markets.regime','Markets → Regime')+'</div>'+
  '<b>'+U.esc(b.posture.regime)+'</b> · risk_mode <b>'+U.esc(b.posture.riskMode)+'</b> · data <b>'+U.esc(b.posture.dataHealth)+'</b>'+(b.posture.kill?' · <b style="color:#8a1f1f">KILL ENGAGED</b>':'')+'<br>'+
  'Open risk <b>'+U.fmt(b.posture.openR,2)+'R</b> of <b>'+b.posture.maxR+'R</b> cap ('+prov('risk.max_open_risk_R')+') — headroom '+U.fmt(b.posture.headroom,2)+'R. '+
  U.esc(b.posture.read)+
  '<div style="margin-top:5px;font-size:11px">'+
   REGIME.supports.map(sp=>'<span style="color:#2c5c34">SUPPORTS</span> — '+U.esc(sp)).join('<br>')+'<br>'+
   REGIME.cautions.map(ca=>'<span style="color:#7a5b1e">CAUTION</span> — '+U.esc(ca)).join('<br>')+
  '</div>'+
  '<div style="margin-top:5px;font-family:var(--mono);font-size:10.5px;color:#403820">session '+U.esc(CLOCK.phase())+' · '+U.esc(CLOCK.killzone()||'outside killzones')+' · tape '+TAPE.slice(0,4).map(tp=>tp[0]+' '+U.fmt(tp[1],tp[1]>1000?1:2)+' ('+U.pct(tp[2],1)+')').join(' · ')+' <span style="font-size:9px">— tape rows are demo twins</span></div>'+
  '</div></details>';
 /* §B THE HUNT */
 h+='<details class="isec" open><summary>§B · THE HUNT — top '+b.hunt.length+' setups, ranked TRIGGERED → ARMED → FORMING</summary><div>'+
  '<div style="margin-bottom:6px">'+src('markets.scanner','Markets → Scanner')+'</div>'+
  (b.hunt.length?b.hunt.map((hh,i)=>
   '<div style="padding:5px 0;border-bottom:1px dotted #C9BFA5">'+
   '<b>'+(i+1)+' · '+U.esc(hh.sym)+'</b> — '+U.esc(hh.setup)+' · '+U.esc(hh.fsm)+' · '+U.esc(hh.bias)+
   '<br><span style="font-family:var(--mono);font-size:11px">entry '+U.fmt(hh.entry)+' · stop '+U.fmt(hh.stop)+' · T1 '+U.fmt(hh.t1)+' · T2 '+U.fmt(hh.t2)+' — T2 path '+U.fmt(hh.rr,2)+'R vs the TRUE stop</span>'+
   '<br>'+(hh.unmet.length?'UNMET: '+hh.unmet.map(U.esc).join(' · ')+' — <i>watch the gate, not the price</i>':'<b>all conditions met</b> — expect a packet')+
   '</div>').join('')
  :'Nothing above CANDIDATE this morning. A quiet hunt list is information — the funnel’s default answer is no.')+
  '</div></details>';
 /* §C LANDMINES */
 h+='<details class="isec" open><summary>§C · LANDMINES — what can hurt you today, with enforcement attached</summary><div>'+
  '<div style="margin-bottom:6px">'+src('markets.calendar','Markets → Calendar')+' <span style="font-size:9.5px;color:#6B5F3E">calendar rows are demo twins</span></div>'+
  b.landmines.rows.map(ev=>'<div style="padding:3px 0"><b>'+U.esc(ev.t)+'</b> — '+U.esc(ev.what)+' ['+U.esc(ev.cls)+']'+(ev.block?' · <b style="color:#8a1f1f">BLACKOUT ARMS</b>':'')+'<br><span style="font-size:11px">'+U.esc(ev.impact)+'</span></div>').join('')+
  '<div style="margin-top:6px;padding-top:6px;border-top:1px solid #C9BFA5">'+U.esc(b.landmines.law)+' '+prov('LAW-017')+' '+prov('risk.event_window_hrs')+'</div>'+
  '</div></details>';
 /* §D OVERNIGHT LEARNING */
 h+='<details class="isec" open><summary>§D · OVERNIGHT LEARNING — what the desk learned while you slept, verbatim</summary><div>'+
  '<div style="margin-bottom:6px">'+src('review.court','Review → Learning Court')+' '+src('review.memory','Review → AI Memory')+'</div>'+
  b.learning.court.map(cc=>'<div style="padding:3px 0"><b>'+U.esc(cc.id)+'</b> ['+U.esc(cc.stage)+'] '+U.esc(cc.title)+'<br><span style="font-size:11px">'+U.esc(cc.evidence)+'</span></div>').join('')+
  b.learning.memory.map(mm=>'<div style="padding:3px 0"><b>'+U.esc(mm.id)+'</b> ['+U.esc(mm.cat)+'] <span style="font-size:11px">'+U.esc(mm.txt)+'</span></div>').join('')+
  '<div style="margin-top:4px;font-size:10.5px;color:#6B5F3E">Court entries deploy only through governance (LAW-013). Nothing above changed a rule overnight — it changed the evidence.</div>'+
  '</div></details>';
 /* §E YESTERDAY'S GRADE */
 h+='<details class="isec" open><summary>§E · YESTERDAY’S GRADE — process, not outcome</summary><div>'+
  '<div style="margin-bottom:6px">'+src('review.journal','Review → Journal')+'</div>'+
  'Composite process grade <b>'+U.esc(b.yesterday.composite)+'</b>'+(b.yesterday.score!==null?' ('+b.yesterday.score+'/100 across '+b.yesterday.rows.length+' recent entries — derived, not stored)':'')+
  ' · correct rejections <b>'+b.yesterday.correctRejects+'</b> · missed winners <b>'+b.yesterday.missed+'</b> — both are data (LAW-018).<br>'+
  '<span style="font-family:var(--mono);font-size:11px">paper P&amp;L: day '+U.money(b.yesterday.dayPnl)+' · week '+U.money(b.yesterday.weekPnl)+' · day-loss used '+U.fmt(b.yesterday.dayLossUsedR,2)+'R of '+ck('risk.max_day_loss_R')+'R</span>'+
  b.yesterday.rows.slice(0,3).map(j=>'<div style="padding:3px 0;font-size:11px"><b>'+U.esc(j.t)+' '+U.esc(j.id)+' '+U.esc(j.sym)+'</b> — '+U.esc(j.what)+' → '+U.esc(j.outcome)+'</div>').join('')+
  '</div></details>';
 /* §F THE ONE THING */
 h+='<details class="isec" open><summary>§F · THE ONE THING — the single dominant action, derived from state</summary><div>'+
  '<div style="margin-bottom:6px">'+src(b.one.go,b.one.goLabel)+'</div>'+
  '<b style="font-size:13px">'+U.esc(b.one.k)+'</b><br><span style="font-size:12px;line-height:1.6">'+U.esc(b.one.txt)+'</span>'+
  '<div style="margin-top:6px;font-size:10.5px;color:#6B5F3E">Derivation rule, visible: kill engaged → resume protocol · packets awaiting → judge · else → top ranked setup’s trigger plan · else → NO_TRADE. The rule chose, not the mood.</div>'+
  '</div></details>';
 h+='<div class="sigline"><span>OPERATOR ACKNOWLEDGEMENT — '+(CSD_BRIEF.ack?'SIGNED '+CSD_BRIEF.ackAt+' ET (SIM) <span class="goldseal">◆ ACKNOWLEDGED</span>':'UNSIGNED — the trading day has not officially started')+'</span><span class="mono">gen '+CSD_BRIEF.gen+' · seed '+ck('demo.seed')+' · '+RULES_VERSION+'</span></div></div>';
 /* ── below the document: why the ritual exists, and proof the loop closes ── */
 h+='<div class="grid g2" style="margin-top:12px">';
 h+=panel('BRIEFING DISCIPLINE — why a written brief beats vibes','pre-commitment · audit trail · the 90-second budget',
  kv('PRE-COMMITMENT','The brief is compiled and signed BEFORE the open. At 09:31 adrenaline edits memory freely — it cannot edit a signed document on the ledger. The one-thing you acknowledged at 07:00 is the standard your 15:59 self is graded against.')+
  kv('AUDIT TRAIL','brief.ack lands in the append-only ledger with actor, time, and hash — next to the kill switches and the packet decisions, because it is the same class of act: a commitment. At the close, grade-at-close is written against the stated posture and one-thing. The loop closes or the brief was theater.')+
  kv('THE '+ck('brief.read_budget_s')+'-SECOND BUDGET','Six sections, one action '+prov('brief.read_budget_s')+'. A brief that takes ten minutes is research wearing a briefing’s clothes — and the T-4d archive below shows exactly what a late read costs. If it reads long, cut the brief, never the budget.')+
  kv('WHAT THE BRIEF REFUSES','Predictions. Price targets without invalidations. “Feels like a big day.” The document states posture, gates, and one action — classification, never prophecy. A valid briefing can end in NO_TRADE and often should.'));
 h+=panel('BRIEFING HISTORY — the loop, closing','date · posture · one-thing · ack · grade at close · <span class="demo-wm">demo twins</span>',
  tbl(['Date','Posture','The one thing','Ack','Grade at close'],
   [['TODAY',U.esc(REGIME.label),U.esc(b.one.k),CSD_BRIEF.ack?U.esc(CSD_BRIEF.ackAt):'—','<span class="i2">open — graded at the close</span>']]
   .concat(CSD_BRIEF_HIST.map((r2,i)=>[U.esc(r2.d),U.esc(r2.posture),U.esc(r2.one),(r2.ack.includes('LATE')?'<span class="dn">'+U.esc(r2.ack)+'</span>':U.esc(r2.ack)),U.esc(r2.grade)]))
   .map((r2,i)=>'<tr'+(i===0?' style="background:var(--live-bg)"':' class="click"'+(i>0?' data-cmd="brief.hist" data-arg="'+(i-1)+'"':''))+'><td class="mono" style="font-size:10.5px">'+r2[0]+'</td><td class="i1" style="font-size:10.5px">'+r2[1]+'</td><td class="i1" style="font-size:10.5px">'+r2[2]+'</td><td class="mono" style="font-size:10.5px">'+r2[3]+'</td><td class="i2" style="font-size:10.5px">'+r2[4]+'</td></tr>').join(''))+
  '<div class="i2" style="font-size:10.5px;padding:8px 12px">Click an archived row for the full document-and-grade pairing. The one late ack in this window (T-4d) cost 40 minutes of unplanned exposure — the read budget is not a style preference.</div>',{flush:true});
 h+='</div>';
 /* ── the projection map: proof the document is derived, not stored ── */
 h+=panel('COMPILER TRACE — which store each section read, this render','the briefing is a projection of state; this is the projection map, with live counts',
  tbl(['§','Section','Store read at compile time','Items this render','Owning workspace'],[
   ['A','Posture','REGIME + S.riskMode / S.openRiskR / S.dataHealth / S.kill + CLOCK phase','1 regime · 4 scalars · '+REGIME.supports.length+'+'+REGIME.cautions.length+' doctrine lines','markets.regime'],
   ['B','The hunt','SYMS filtered fsm ∈ {TRIGGERED, ARMED, FORMING}, ranked by stage then RS; R paths recomputed from levels',b.hunt.length+' of '+SYMS.length+' promoted symbols','markets.scanner'],
   ['C','Landmines','EVENTS (demo calendar) + risk.event_window_hrs arithmetic',EVENTS.length+' rows · 1 law','markets.calendar'],
   ['D','Overnight learning','COURT[0..1] + MEMORY[0..1], quoted verbatim with ids',b.learning.court.length+' court · '+b.learning.memory.length+' memory','review.court · review.memory'],
   ['E','Yesterday’s grade','JOURNAL graded entries → composite (derived, never stored) + S.dayPnl / S.weekPnl',JOURNAL.length+' journal rows in store','review.journal'],
   ['F','The one thing','derivation rule over S.kill → READY_FOR_HUMAN queue → ranked hunt','queue depth '+b.q.length+' → '+U.esc(b.one.k),U.esc(b.one.go)],
  ].map(r2=>'<tr><td class="mono"><b>'+r2[0]+'</b></td><td class="i1" style="font-size:11px">'+r2[1]+'</td><td class="i2" style="font-size:10.5px">'+r2[2]+'</td><td class="mono" style="font-size:10px">'+r2[3]+'</td><td class="mono" style="font-size:10px">'+r2[4]+'</td></tr>').join(''))+
  '<div class="i2" style="font-size:10.5px;padding:8px 12px"><b>Falsifiable claim:</b> press Recompile, watch the generation counter step and every count above re-read. If a packet expires or an alert fires between generations, the document moves — because it was never a document at rest, only state wearing one.</div>',{flush:true});
 return h;
};

/* ═══════════ SLO commands — real execution, real numbers ═══════════ */
CMD.define({id:'slo.bench',label:'Run render benchmark',purpose:'Execute 50 REAL sequential render() passes and report measured total/avg — expect a ~1–2s freeze; the freeze IS the measurement',
 run:()=>{const N=50,t0=performance.now();
  for(let i=0;i<N;i++)render();
  const total=performance.now()-t0;
  CSD_BENCH={n:N,total,avg:total/N,at:CLOCK.hms(),view:S.domain+'.'+S.ws};
  SVR.audit('HUMAN (owner)','bench','Render benchmark: '+N+' real passes on '+CSD_BENCH.view+' · total '+total.toFixed(1)+'ms · avg '+(total/N).toFixed(2)+'ms/render');
  UI.toast('Benchmark: '+N+' renders · '+total.toFixed(0)+'ms total · '+(total/N).toFixed(2)+'ms avg — all 50 samples landed in the ring buffer','ok','SLO BENCH');render()}});
CMD.define({id:'slo.reset',label:'Clear ring buffer',purpose:'Start a fresh measurement window — export first if the old samples matter; dropped is dropped',
 run:()=>{const n=CSD_SLO.buf.length;CSD_SLO.buf.length=0;
  SVR.audit('HUMAN (owner)','slo','Render ring buffer cleared — '+n+' samples dropped, fresh measurement window opened');
  UI.toast('Buffer cleared — '+n+' samples dropped. The re-render you are looking at is sample #1 of the new window.','','SLO');render()}});
CMD.define({id:'slo.export',label:'Export measurements (JSON)',purpose:'Download the raw ring buffer + bench result — the evidence behind every number on this screen',
 run:()=>{const st=CSD_SLO.stats();
  const bundle={exported:CLOCK.hms()+' ET (sim)',mode:S.mode,
   note:'REAL render() timings measured in this browser session via performance.now() — the only honestly-measurable SLO tier in DEMO. Target-tier SLOs are config, not readings.',
   budget_ms:ck('slo.render_budget_ms'),stats:st,bench:CSD_BENCH,samples:CSD_SLO.buf};
  const blob=new Blob([JSON.stringify(bundle,null,2)],{type:'application/json'});
  const a2=document.createElement('a');a2.href=URL.createObjectURL(blob);a2.download='ATLAS_slo_measurements.json';a2.click();
  setTimeout(()=>URL.revokeObjectURL(a2.href),4000);
  SVR.audit('HUMAN (owner)','export','SLO measurement bundle exported — '+(st?st.n:0)+' raw samples + bench, verbatim');
  UI.toast('Measurement bundle downloaded — raw samples included, nothing summarized away','ok','EXPORT')}});
CMD.define({id:'slo.raw',label:'Raw samples',purpose:'Last 20 ring-buffer rows verbatim — audit the instrument, not just its summary',audit:false,
 run:()=>{const budget=ck('slo.render_budget_ms');
  UI.drawer('<div class="dhead"><span class="dt">RAW RENDER SAMPLES · last 20 of '+CSD_SLO.buf.length+'</span><span class="pill">performance.now() · measured</span><button class="dx" data-cmd="ui.closeDrawer">ESC</button></div>'+
   '<div class="dbody">'+
   (CSD_SLO.buf.length?CSD_SLO.buf.slice(-20).reverse().map(sm=>'<div class="kv"><span class="k">tick '+sm.t+'</span><span class="v mono" style="font-size:11px">'+U.fmt(sm.ms,2)+'ms · '+U.esc(sm.view)+(sm.ms>budget?' <span class="dn">OVER BUDGET</span>':'')+'</span></div>').join('')
    :'<div class="empty"><div class="e1">NO SAMPLES</div>The buffer was just cleared — navigate once and come back.</div>')+
   '<div class="banner info" style="margin-top:8px"><span class="bico">i</span><div>A summary you cannot decompose into raw rows is a claim, not a measurement. These are the rows.</div></div></div>')}});
CMD.define({id:'slo.refresh',label:'Refresh readings',purpose:'Re-render — which itself lands one more sample in the buffer (observer effect, disclosed)',audit:false,run:()=>render()});

/* ═══════════ SYSTEM · SLO & performance observatory ═══════════ */
VIEWS['system.slo']=function(){
 const budget=ck('slo.render_budget_ms');
 const st=CSD_SLO.stats();
 const verdict=st?(st.p95<=budget?'PASS':'BREACH'):null;
 let h=vhead('SYSTEM · SLO & performance observatory','Measured this session — not claimed',
  'The RENDER BUDGET numbers below were measured by wrapping the real render() at module load: every pass this session landed in a 200-sample ring with its true cost. Where DEMO cannot measure a production SLO, the two-tier table says TARGET and cites the config key instead of inventing a reading.',
  verdict?chip('RENDER p95 '+verdict,verdict==='PASS'?'ch-ok':'ch-blk',verdict==='PASS'?'✓':'⛔'):chip('WARMING UP','ch-mut','·'));
 /* (a) render budget — live stats from the actual buffer */
 h+='<div class="grid g4">'+
  stat('Last render',st?U.fmt(st.last,1)+'ms':'—','the pass that painted this screen — measured, not claimed')+
  stat('Median',st?U.fmt(st.med,1)+'ms':'—',st?'across '+st.n+' real passes · mean '+U.fmt(st.mean,1)+'ms':'no samples yet')+
  stat('p95 vs budget',st?'<span class="'+(st.p95<=budget?'up':'dn')+'">'+U.fmt(st.p95,1)+'ms</span> <span class="i2" style="font-size:11px">/ '+budget+'ms</span>':'—','budget '+prov('slo.render_budget_ms')+' · max '+(st?U.fmt(st.max,1)+'ms':'—'))+
  stat('Ring buffer',(st?st.n:0)+' / '+CSD_SLO.cap,'the instrument obeys its own bounded-stream law')+
 '</div>';
 h+='<div class="btnrow" style="margin:2px 0 12px">'+
  CMD.btn('slo.bench',null,'gold','⚡ Bench: 50 real renders')+
  CMD.btn('slo.raw',null,'sm','Raw samples')+
  CMD.btn('slo.export',null,'sm','Export JSON')+
  CMD.btn('slo.reset',null,'sm','Clear buffer')+
  CMD.btn('slo.refresh',null,'sm','Refresh')+
  '<span class="pill">every number on this screen decomposes into raw rows — press Raw samples to check the instrument</span></div>';
 /* (b) histogram + timeline canvases from the buffer */
 h+='<div class="grid g2">';
 h+=panel('RENDER-TIME HISTOGRAM','distribution of measured passes · red bucket = over the '+budget+'ms budget',
  '<canvas id="csd-hist" class="cv" style="width:100%;height:190px"></canvas>'+
  '<div class="i2" style="font-size:10.5px;margin-top:6px">After a bench run the histogram carries the 50-pass spike — the bench’s fingerprint. That is disclosure, not contamination: the instrument records everything that renders.</div>');
 h+=panel('RENDER TIMELINE — buffer order','each point is one real pass · gold dashes = budget',
  '<canvas id="csd-spark" class="cv" style="width:100%;height:190px"></canvas>'+
  '<div class="i2" style="font-size:10.5px;margin-top:6px">Spikes correlate with heavy views (canvas-dense workspaces) and with the bench. A flat line near zero would mean the instrument is lying — real UIs have texture.</div>');
 h+='</div>';
 POSTRENDER.push(()=>{const cv=document.getElementById('csd-hist');if(!cv)return;
  const W=cv.width=cv.clientWidth*2,H=cv.height=190*2,x=cv.getContext('2d');
  x.fillStyle='#070B12';x.fillRect(0,0,W,H);
  const buf=CSD_SLO.buf;x.font='15px monospace';
  if(!buf.length){x.fillStyle='#67748C';x.fillText('no samples yet — navigate once',24,48);return}
  const BK=11,bw=budget/10,bins=new Array(BK).fill(0);
  buf.forEach(sm=>{bins[Math.min(BK-1,Math.floor(sm.ms/bw))]++});
  const max=Math.max(...bins,1),colW=W/BK;
  x.strokeStyle='rgba(151,166,192,.07)';[0.25,0.5,0.75].forEach(f=>{x.beginPath();x.moveTo(0,H*0.78*f);x.lineTo(W,H*0.78*f);x.stroke()});
  bins.forEach((n,i)=>{const bh=n/max*(H*0.62),X=i*colW;
   x.fillStyle=i===BK-1?'rgba(242,99,124,.62)':'rgba(90,167,255,.55)';
   x.fillRect(X+colW*0.12,H*0.78-bh,colW*0.76,bh);
   x.fillStyle='#9FABBF';if(n)x.fillText(String(n),X+colW*0.34,H*0.78-bh-8);
   x.fillStyle=i===BK-1?'rgba(242,99,124,.8)':'#67748C';
   x.fillText(i===BK-1?'≥'+budget:String(Math.round(i*bw))+'–'+Math.round((i+1)*bw),X+colW*0.08,H*0.92)});
  x.fillStyle='#67748C';x.fillText('ms per render() pass · n='+buf.length+' · measured this session',18,H*0.99)});
 POSTRENDER.push(()=>{const cv=document.getElementById('csd-spark');if(!cv)return;
  const W=cv.width=cv.clientWidth*2,H=cv.height=190*2,x=cv.getContext('2d');
  x.fillStyle='#070B12';x.fillRect(0,0,W,H);
  const buf=CSD_SLO.buf;x.font='15px monospace';
  if(!buf.length){x.fillStyle='#67748C';x.fillText('no samples yet',24,48);return}
  const top=Math.max(budget*1.3,...buf.map(sm=>sm.ms));
  const py=v2=>H-(v2/top)*(H*0.8)-H*0.08;
  x.strokeStyle='rgba(214,178,94,.55)';x.setLineDash([7,5]);x.beginPath();x.moveTo(0,py(budget));x.lineTo(W,py(budget));x.stroke();x.setLineDash([]);
  x.fillStyle='rgba(214,178,94,.8)';x.fillText('budget '+budget+'ms',10,py(budget)-8);
  x.strokeStyle='#5AA7FF';x.lineWidth=2;x.beginPath();
  buf.forEach((sm,i)=>{const X=buf.length>1?i/(buf.length-1)*W:0,Y=py(Math.min(sm.ms,top));i?x.lineTo(X,Y):x.moveTo(X,Y)});x.stroke();
  buf.forEach((sm,i)=>{if(sm.ms>budget){const X=buf.length>1?i/(buf.length-1)*W:0;
   x.fillStyle='rgba(242,99,124,.85)';x.beginPath();x.arc(X,py(Math.min(sm.ms,top)),5,0,7);x.fill()}});
  x.fillStyle='#67748C';x.fillText('oldest → newest · red dots breach the budget',18,H*0.99)});
 /* error budget — the p95 allowance, spent visibly */
 const over=CSD_SLO.buf.filter(sm=>sm.ms>budget).length;
 const share=st?over/st.n*100:0;
 const consumed=Math.min(100,Math.round(share/5*100));
 h+='<div class="grid g2">';
 h+=panel('ERROR BUDGET — the 5% allowance a p95 SLO implies','breaches are a spend account, not a mood · computed from the same buffer',
  '<div class="grid g3">'+
   stat('Breaches',over+' <span class="i2" style="font-size:11px">/ '+(st?st.n:0)+'</span>','passes over '+budget+'ms in the buffer')+
   stat('Breach share','<span class="'+(share<=5?'up':'dn')+'">'+U.fmt(share,1)+'%</span>','allowance: 5% — that is what “p95 under budget” means')+
   stat('Budget consumed',consumed+'%','of the 5% allowance for this window')+
  '</div>'+
  '<div class="gauge" style="margin-top:8px"><i style="width:'+consumed+'%'+(consumed>80?';background:var(--warn)':'')+'"></i></div>'+
  '<div class="i2" style="font-size:10.5px;margin-top:8px">The SRE move, applied to a trading desk: an error budget turns “feels fast” into arithmetic. While budget remains, feature work proceeds; when it is spent, performance work outranks features — the same primacy rule that puts risk above conviction everywhere else in this build.</div>');
 h+=panel('INSTRUMENT SELF-CHECK','the observatory audits its own instrument, every render — verdicts are live assertions',
  [['Wrapper installed — samples accumulate',CSD_SLO.buf.length>0,'buffer n='+CSD_SLO.buf.length+' (this very render will append one more)'],
   ['Ring cap honored (bounded-stream law)',CSD_SLO.buf.length<=CSD_SLO.cap,CSD_SLO.buf.length+' ≤ '+CSD_SLO.cap],
   ['Every sample finite and non-negative',CSD_SLO.buf.every(sm=>isFinite(sm.ms)&&sm.ms>=0),'NaN in a measurement pipeline is a silent lie — asserted, not assumed'],
   ['Every sample carries view attribution',CSD_SLO.buf.every(sm=>sm.view&&sm.view.includes('.')),'the leaderboard is only as honest as its labels'],
  ].map(cr=>'<div class="kv"><span class="k">'+(cr[1]?chip('PASS','ch-ok','✓'):chip('FAIL','ch-blk','✕'))+'</span><span class="v"><b style="font-size:11px">'+cr[0]+'</b> <span class="i2" style="font-size:10px">— '+cr[2]+'</span></span></div>').join('')+
  '<div class="i2" style="font-size:10.5px;margin-top:6px">A FAIL row here invalidates every other number on this page — which is exactly why the checks render first-class instead of living in a console nobody reads.</div>');
 h+='</div>';
 /* (c) slow view leaderboard */
 const lv=CSD_SLO.byView();
 h+='<div class="grid g2">';
 h+=panel('SLOW VIEW LEADERBOARD','median measured ms per workspace — worst first; optimization targets, ranked by evidence',
  lv.length?tbl(['Workspace','>n','>Median ms','>Max ms','Verdict'],
   lv.map(r2=>'<tr'+(r2.med>budget?' style="background:var(--blk-bg)"':'')+'><td class="mono" style="font-size:10.5px">'+U.esc(r2.view)+'</td><td class="r num">'+r2.n+'</td><td class="r num">'+U.fmt(r2.med,1)+'</td><td class="r num i2">'+U.fmt(r2.max,1)+'</td><td>'+(r2.med<=budget?chip('PASS','ch-ok','✓'):chip('BREACH','ch-blk','⛔'))+'</td></tr>').join(''))
  :'<div class="empty"><div class="e1">NO SAMPLES</div>Navigate a few workspaces and return — the leaderboard builds itself from real passes.</div>',{flush:true});
 /* (d) store pressure — real lengths right now vs their caps */
 const rings=[
  ['SVR.ledger — audit stream',SVR.ledger.length,600,'unshift + pop past 600 (part-04 ring)'],
  ['ALERTS — alert inbox',ALERTS.length,80,'pushAlert() pops past 80'],
  ['BLOTTER — autonomy corpus',BLOTTER.length,40,'blotterStep() pops past 40'],
  ['CSD_SLO.buf — this instrument',CSD_SLO.buf.length,200,'shift past 200 — the observer obeys its own law'],
 ];
 const workflow=[['PACKETS',PACKETS.length,'one per verified candidate'],['JOURNAL',JOURNAL.length,'one per decision, taken or rejected (LAW-018)'],['COURT',COURT.length,'one per governed proposal'],['MEMORY',MEMORY.length,'one per operator rule'],['ARCHIVE',ARCHIVE.length,'one per setup autopsy'],['ASKS',ASKS.length,'one per open question']];
 h+=panel('STORE PRESSURE — live array sizes vs caps, right now','the V11 fix, shown being true: every high-frequency stream is ring-bounded',
  rings.map(([nm,len,cap,how])=>{const pct=Math.min(100,Math.round(len/cap*100));
   return'<div class="kv"><span class="k" style="font-size:10px">'+U.esc(nm)+'</span><span class="v"><div class="gauge" style="width:150px;display:inline-block;vertical-align:middle"><i style="width:'+pct+'%'+(pct>85?';background:var(--warn)':'')+'"></i></div> <span class="mono" style="font-size:11px">'+len+' / '+cap+'</span> <span class="i2" style="font-size:9.5px">('+pct+'%) · '+U.esc(how)+'</span></span></div>'}).join('')+
  '<div class="hr"></div>'+
  '<div class="i2" style="font-size:10.5px;margin-bottom:6px"><b>Workflow stores — no ring on purpose:</b> these grow only by governed action (a packet, a journal entry, a court case), so they are bounded by workflow, not by buffer. Counts right now:</div>'+
  '<div class="row">'+workflow.map(([nm,len,why])=>'<span class="tag" title="'+U.esc(why)+'">'+nm+' '+len+'</span>').join('')+'</div>'+
  '<div class="i2" style="font-size:10.5px;margin-top:8px">The legacy build appended to unbounded arrays until the tab died — a memory leak wearing a feature’s clothes. Every stream above is capped, and this panel reads the real lengths every render so the claim stays checkable.</div>');
 h+='</div>';
 /* (e) tick cost — a REAL benchmark button */
 h+=panel('TICK COST — benchmarked, on demand','slo.bench runs 50 sequential REAL render() calls and reports what actually happened',
  (CSD_BENCH?'<div class="grid g4">'+
    stat('Passes',CSD_BENCH.n,'sequential, synchronous, real')+
    stat('Total',U.fmt(CSD_BENCH.total,1)+'ms','wall-clock for the full loop')+
    stat('Avg / render','<span class="'+(CSD_BENCH.avg<=budget?'up':'dn')+'">'+U.fmt(CSD_BENCH.avg,2)+'ms</span>','vs '+budget+'ms budget '+prov('slo.render_budget_ms'))+
    stat('Context',U.esc(CSD_BENCH.view),'ran '+CSD_BENCH.at+' ET (sim) — heavier views bench slower, as they should')+
   '</div>'
   :'<div class="empty"><div class="e1">NOT RUN THIS SESSION</div>No stored number is shown because no measurement exists yet. Press the button — the result is whatever actually happens.</div>')+
  '<div class="btnrow" style="margin-top:8px">'+CMD.btn('slo.bench',null,'gold','⚡ Run the 50-pass benchmark')+'<span class="pill">ENGINE cadence: tick every 2s · '+S.tick+' ticks so far this session</span></div>'+
  '<div class="i2" style="font-size:10.5px;margin-top:6px">Honesty note: the bench measures the render half of a tick — state mutation (price drift, TTL decrement) is microseconds by comparison and rides along inside the ENGINE interval. The 50 passes land in the ring buffer, visibly.</div>');
 /* (f) two-tier SLO table — measured vs target, never blended */
 h+=panel('TARGET SLOs vs WHAT DEMO CAN MEASURE','two tiers, never blended: a TARGET row shows its config key, not a fabricated reading',
  tbl(['SLO','Threshold','Tier','This session','Provenance'],[
   ['Full render() pass p95',budget+'ms','<b class="up">MEASURED</b>',st?U.fmt(st.p95,1)+'ms · '+verdict+' ('+st.n+' samples)':'no samples yet',prov('slo.render_budget_ms')],
   ['Bench avg (50 passes)',budget+'ms','<b class="up">MEASURED</b>',CSD_BENCH?U.fmt(CSD_BENCH.avg,2)+'ms on '+U.esc(CSD_BENCH.view):'bench not run — press the button above',prov('slo.render_budget_ms')],
   ['Packet build p95 (TRIGGERED → delivered)',ck('slo.packet_p95_s')+'s','TARGET','not measurable in DEMO — no real pipeline latency exists here; a number would be fiction',prov('slo.packet_p95_s')],
   ['Quote feed freshness',ck('slo.feed_quote_ms')+'ms','TARGET','demo twin ages in Health are scenario data, watermarked as such',prov('slo.feed_quote_ms')],
   ['Options chain freshness',ck('slo.feed_chain_ms')+'ms','TARGET','same — TWIN until the Phase 2 data spine',prov('slo.feed_chain_ms')],
   ['Full-universe cycle',ck('scan.universe_cycle_s')+'s','TARGET','the 21.4s reading in Health is a demo twin of the budget being met',prov('scan.universe_cycle_s')],
  ].map(r2=>'<tr><td class="i1" style="font-size:11px">'+r2[0]+'</td><td class="r num">'+r2[1]+'</td><td class="mono" style="font-size:10px">'+r2[2]+'</td><td class="i2" style="font-size:10.5px">'+r2[3]+'</td><td>'+r2[4]+'</td></tr>').join('')),{flush:true});
 /* doctrine: performance is a risk control */
 h+='<div class="banner warn"><span class="bico">!</span><div><b>Performance is a risk control, not a vanity metric.</b> May 6, 2010: during the flash crash the consolidated tape ran up to tens of seconds behind reality while the index fell ~9% — desks acting on stale screens sold the bottom and bought the rip. A terminal that renders slow is a desk that exits late; the render budget is a stop-loss on your own reaction time. Sustained breach here follows the same ladder as a stale feed: name the dependency, enter DEGRADED, and let the risk gate block what the degraded surface cannot safely approve '+prov('LAW-006')+'.</div></div>';
 h+='<div class="banner info"><span class="bico">◈</span><div><b>Why this workspace exists:</b> every other screen in this build makes claims about discipline. This one submits the build itself to the same standard — measured, budgeted, and rendered verbatim, including the breaches.</div></div>';
 return h;
};

/* ═══════════ RELEASE governance — data ═══════════ */
/* migration gates — what a release must pass; per-gate demo honesty */
const CSD_GATES=[
 {gate:'Schema migration dry-run',tier:'PRODUCTION-ONLY',
  what:'Forward + backward migration executed against a production snapshot; row counts and checksums reconciled before and after.',
  state:()=>'NOT DEMO-SATISFIABLE — there is no schema in-page. The event envelope already carries schema_id atlas.v13.* so the production gate has something to check.',
  deep:'In production this runs against a restored snapshot, never the live store. The dry-run must complete BOTH directions: a migration you cannot reverse is a one-way door wearing a release’s clothes. Reconciliation is arithmetic (row counts, checksums), not eyeballing.'},
 {gate:'Golden-packet regression',tier:'DEMO-SATISFIABLE',
  what:'Every golden fixture re-scored under the candidate rules; any diff blocks the release until explained or fixed.',
  state:()=>GOLDEN_LAST?(GOLDEN_LAST.filter(g=>g.pass).length+'/'+GOLDEN_LAST.length+' MATCH — run this session, diffs rendered verbatim in Integrity'):'NOT RUN THIS SESSION — the gate is therefore unproven, and unproven blocks',
  deep:'The production corpus is 48 packets; the in-page slice runs 5 executable fixtures against the live boundary. The principle is identical: a rules change that silently re-grades an old decision is a regression even if every new decision looks fine. v13.3-candidate is BLOCKED on exactly this gate: 46/48.'},
 {gate:'Rollback rehearsal',tier:'DEMO-SATISFIABLE',
  what:'The downgrade path is executed, not assumed: state written by the new version must be readable by the old one.',
  state:()=>CSD_ROLLBACK?(CSD_ROLLBACK.pass+'/'+CSD_ROLLBACK.total+' structural checks green — rehearsed '+CSD_ROLLBACK.at):'NOT REHEARSED THIS SESSION — press the drill button below; a rollback you have not rehearsed is a rumor',
  deep:'The drill checks the actual shapes of PACKETS and JOURNAL against the keys the prior version requires — executed in-page, results verbatim. In production this extends to replaying a day of events through the old binary. The safe rollback path is recorded BEFORE the switch, mirroring the step-up authentication doctrine.'},
 {gate:'Docs updated — changelog names the defect',tier:'DEMO-SATISFIABLE',
  what:'The release entry states what was FOUND and what the FIX was. No named defect, no release.',
  state:()=>{const c2=CHANGELOG[0]||['',''];return /Found:/.test(c2[1])&&/Fix:/.test(c2[1])?'SATISFIED — latest entry ('+c2[0]+') carries both a Found and a Fix clause; checked against the real array, not asserted':'FAILING — latest changelog entry lacks the Found/Fix discipline'},
  deep:'This gate is checkable by grep, which is the point: discipline that survives automation is discipline; the rest is intention. The check on this page parses the live CHANGELOG array every render.'},
 {gate:'Audit army pass',tier:'PRODUCTION-ONLY (in-page slice exists)',
  what:'Independent multi-agent audit sweep over the candidate build: dead controls, unwired commands, dishonest labels.',
  state:()=>INTEGRITY.results?('in-page slice: integrity '+INTEGRITY.results.pass+'/'+INTEGRITY.results.total+' — the full army (per-domain auditors + adversarial pass) is a production ritual'):'in-page slice not run this session',
  deep:'The V11 rebuild exists because an audit found 464 inline handlers and a QA suite that tested the length of its own copy. The army institutionalizes that audit: it runs on every release candidate, and its findings file as defects, not comments.'},
];
let CSD_ROLLBACK=null;
/* rules × KB certification lattice — the pairing doctrine made explicit */
const CSD_COMPAT={rules:['rules v13.2','rules v13.3-candidate','rules v13.4'],kb:['KB 13.1','KB 13.2','KB 13.3-candidate'],
 cell:{'rules v13.2|KB 13.1':['CERTIFIED','golden 48/48 on the historic pair'],
  'rules v13.2|KB 13.2':['CERTIFIED','the prior shipping pair (v13.2 active era)'],
  'rules v13.2|KB 13.3-candidate':['UNTESTED','never regression-run together — untested means blocked in practice'],
  'rules v13.3-candidate|KB 13.1':['BLOCKED','golden 46/48 — two regressions unresolved'],
  'rules v13.3-candidate|KB 13.2':['BLOCKED','same two regressions; the candidate is the problem, not the KB'],
  'rules v13.3-candidate|KB 13.3-candidate':['BLOCKED','a blocked rules version certifies nothing'],
  'rules v13.4|KB 13.1':['BLOCKED','KB 13.1 predates detector renames — retrieval would cite ghosts'],
  'rules v13.4|KB 13.2':['UNTESTED','skipped — 13.4 was certified directly against its paired KB'],
  'rules v13.4|KB 13.3-candidate':['CERTIFIED · SHIPPING PAIR','the pairing in RULES_VERSION — ships together or not at all']}};
/* deprecation register — four retirements, each with the guard that keeps it dead */
const CSD_DEPREC=[
 {nm:'The 63-route sprawl',died:'V11.1',
  why:'63 ungoverned routes, many orphaned — features landed as new pages instead of homes, and nobody could say which routes worked.',
  migration:'7 domains × governed workspaces. Every legacy route received a verified home or a written obituary in the merge log.',
  guard:'INTEGRITY · “Every workspace has a view” — an orphan route cannot re-enter without failing the build'},
 {nm:'Inline onclick handlers (464 of them)',died:'V11.0',
  why:'Unauditable, unpermissioned, untestable — a click did whatever the string said, with no registry, no preconditions, no audit hook.',
  migration:'The data-cmd command contract: one delegated listener, every control registered with label, purpose, precondition, audit flag.',
  guard:'INTEGRITY · “Every rendered control is a registered command” — an unwired data-cmd fails the suite by name'},
 {nm:'The fake QA suite',died:'V11.0',
  why:'The legacy “200-scenario suite” measured the length of its own copy and reported green forever. Confidence theater is worse than no tests.',
  migration:'INTEGRITY real assertions + BOOTTEST S1–S8 + golden fixtures + stress range — all executed against the running app, results rendered verbatim.',
  guard:'The suites render whatever happened, including failures — a red row on screen is the guard'},
 {nm:'Unseeded randomness',died:'V11.0',
  why:'Irreproducible sessions: a bug you cannot replay is a bug you cannot fix, and a demo that differs per reload is a demo you cannot certify.',
  migration:'Global RNG seeded by demo.seed + localRng(seed) per series — this exact session is reproducible from one uint32.',
  guard:'GOLDEN · GT-SWING-001 determinism fixture — identical candles every render, or the fixture diffs'},
];

/* the SHIP/HOLD rule — arithmetic, not opinion */
function CSD_readiness(){
 const i=INTEGRITY.results,bt=BOOTTEST.results,g=GOLDEN_LAST,sr=STRESS_LAST,why=[];
 if(!i)why.push('integrity suite has not run');
 else if(i.pass<i.total)why.push('integrity '+i.pass+'/'+i.total+' — a red assertion ships nothing');
 if(!bt)why.push('boot self-test has not run');
 else if(bt.pass<8)why.push('boot S1–S8 at '+bt.pass+'/8 — risk_mode pins BLOCKED until green');
 if(!g)why.push('golden fixtures NOT RUN this session — the regression gate is unproven, and unproven means HOLD');
 else{const bad=g.filter(x=>!x.pass);if(bad.length)why.push('golden diffs standing: '+bad.map(x=>x.id).join(', '))}
 if(sr){const bad=sr.filter(x=>!x.pass);if(bad.length)why.push('stress divergence: '+bad.map(x=>x.id).join(', '))}
 return{ship:!why.length,why};
}

/* ── release commands ── */
CMD.define({id:'rel.runall',label:'Run readiness battery',purpose:'Execute INTEGRITY + BOOT S1–S8 against the running app NOW — the scorecard re-renders from whatever actually happened',
 run:()=>{INTEGRITY.run();BOOTTEST.run();
  SVR.audit('HUMAN (owner)','release','Readiness battery executed: integrity '+INTEGRITY.results.pass+'/'+INTEGRITY.results.total+' · boot '+BOOTTEST.results.pass+'/8 — results rendered, not summarized');
  UI.toast('Integrity '+INTEGRITY.results.pass+'/'+INTEGRITY.results.total+' · Boot '+BOOTTEST.results.pass+'/8. Golden fixtures still gate SHIP — run them in System → Integrity.','ok','RELEASES');render()}});
CMD.define({id:'rel.rollback',label:'Rehearse rollback',purpose:'Simulate the v13.4 → v13.2 downgrade: structural compatibility of LIVE state, checked in-page, results verbatim',
 run:()=>{const c2=[];const need=(nm,cond,detail)=>c2.push({nm,pass:!!cond,detail});
  const pk=PACKETS[0]||{};
  const rk=['entry','stop','t1','t2','t3','riskUSD','riskR','rr'];
  need('PACKETS[*].rmath carries '+rk.join('/'),
   PACKETS.length>0&&PACKETS.every(x=>x.rmath&&rk.every(k=>typeof x.rmath[k]==='number')),
   PACKETS.length+' packets scanned · keys on '+(pk.id||'—')+': '+Object.keys(pk.rmath||{}).slice(0,9).join(','));
  need('PACKETS[*].state ∈ canonical enum (LAW-014 survives downgrade)',
   PACKETS.every(x=>ENUMS.PACKET.includes(x.state)),
   'states found: '+[...new Set(PACKETS.map(x=>x.state))].join(' · '));
  need('PACKETS[*].planHash present (8-hex) — token binding intact',
   PACKETS.every(x=>/^[0-9a-f]{8}$/.test(String(x.planHash||''))),
   'hash-bound approval must survive the downgrade or every open token dies with it');
  need('JOURNAL rows carry t / id / sym / kind / what',
   JOURNAL.length>0&&JOURNAL.every(j=>['t','id','sym','kind','what'].every(k=>k in j)),
   JOURNAL.length+' rows scanned, zero exempted');
  need('JOURNAL grades parse on the v13.2 scale',
   JOURNAL.every(j=>!j.grade||/^[ABC][+-]?$/.test(j.grade)),
   'grades present: '+[...new Set(JOURNAL.map(j=>j.grade).filter(Boolean))].join(' '));
  need('Ledger rows hash-stamped (audit chain readable by old reader)',
   SVR.ledger.length>0&&SVR.ledger.every(l=>l.h&&String(l.h).length===8),
   SVR.ledger.length+' rows · head #'+(SVR.ledger[0]?SVR.ledger[0].h:'—'));
  need('CONFIG keys all cite provenance (LAW-015 portability)',
   Object.values(CONFIG).every(cf=>cf.law),
   Object.keys(CONFIG).length+' keys — a threshold without a rule cannot migrate in either direction');
  CSD_ROLLBACK={at:CLOCK.hms(),target:'v13.4 → v13.2 (last certified pair below the candidate)',checks:c2,
   pass:c2.filter(x=>x.pass).length,total:c2.length};
  SVR.audit('HUMAN (owner)','release','Rollback drill '+CSD_ROLLBACK.target+': '+CSD_ROLLBACK.pass+'/'+CSD_ROLLBACK.total+' structural checks green — per-check results rendered verbatim');
  UI.toast('Rollback drill: '+CSD_ROLLBACK.pass+'/'+CSD_ROLLBACK.total+' checks green — report below','ok','ROLLBACK DRILL');render()}});
CMD.define({id:'rel.jump',label:'Open workspace',purpose:'Deep link into the owning workspace',audit:false,
 run:a=>{const[dd,ww]=String(a||'').split('.');if(DOMAINS[dd])go(dd,ww)}});
CMD.define({id:'rel.gate',label:'Migration gate detail',purpose:'What this gate proves — in production, and honestly in DEMO',audit:false,
 run:a=>{const g=CSD_GATES[+a];if(!g)return;
  UI.modal('MIGRATION GATE · '+U.esc(g.gate),
   kv('TIER',U.esc(g.tier))+
   kv('WHAT IT PROVES','<span style="font-size:11.5px;line-height:1.6">'+U.esc(g.what)+'</span>')+
   kv('STATE FOR THIS BUILD','<span style="font-size:11.5px">'+U.esc(g.state())+'</span>')+
   kv('DOCTRINE','<span style="font-size:11.5px;line-height:1.6">'+U.esc(g.deep)+'</span>'),
   '<button class="btn" data-cmd="ui.closeModal">Close</button>')}});
CMD.define({id:'rel.export',label:'Export readiness report',purpose:'Download the current SHIP/HOLD verdict + every suite result as JSON — the artifact a release review reads',
 run:()=>{const v2=CSD_readiness();
  const bundle={exported:CLOCK.hms()+' ET (sim)',mode:S.mode,rules:RULES_VERSION,
   verdict:v2.ship?'SHIP':'HOLD',reasons:v2.why,
   integrity:INTEGRITY.results,boottest:BOOTTEST.results,golden:GOLDEN_LAST,stress:STRESS_LAST,
   rollback_drill:CSD_ROLLBACK,
   gates:CSD_GATES.map(g=>({gate:g.gate,tier:g.tier,state:g.state()})),
   note:'DEMO readiness report — suite results are real in-page executions; TARGET-tier gates state their production-only status instead of pretending'};
  const blob=new Blob([JSON.stringify(bundle,null,2)],{type:'application/json'});
  const a2=document.createElement('a');a2.href=URL.createObjectURL(blob);a2.download='ATLAS_release_readiness.json';a2.click();
  setTimeout(()=>URL.revokeObjectURL(a2.href),4000);
  SVR.audit('HUMAN (owner)','export','Release readiness report exported — verdict '+(v2.ship?'SHIP':'HOLD')+(v2.why.length?' · '+v2.why.length+' named reason(s)':''));
  UI.toast('Readiness report downloaded — verdict '+(v2.ship?'SHIP':'HOLD')+', reasons named','ok','EXPORT')}});

/* ═══════════ SYSTEM · releases — five years of shipping discipline ═══════════ */
VIEWS['system.releases']=function(){
 const v2=CSD_readiness();
 const i=INTEGRITY.results,bt=BOOTTEST.results;
 let h=vhead('SYSTEM · release governance','No release without a named defect it kills',
  'The timeline below is the REAL in-app changelog: every release states what was found broken and what fixed it. The scorecard is computed from actual suite results in this session — a suite that has not run reads NOT RUN, and NOT RUN means HOLD. Nothing on this page is aspirational.',
  v2.ship?chip('SHIP','ch-ok','✓'):chip('HOLD','ch-blk','⛔'));
 h+='<div class="banner gold"><span class="bico">◆</span><div><b>Shipping pair, prominently:</b> <span class="mono">'+U.esc(RULES_VERSION)+'</span> — rules and knowledge are certified TOGETHER. A rules version without its paired KB is not a smaller release; it is no release (compatibility lattice below).</div></div>';
 /* (a) release timeline from the real CHANGELOG */
 h+=panel('RELEASE TIMELINE — the real CHANGELOG array, every entry','found-broken → fixed; the V9 discipline that survived every rebuild since',
  '<div class="kv"><span class="k" style="color:var(--gold)">V14 · IN FLIGHT</span><span class="v"><span class="tag">this session’s build</span> <span class="i1" style="font-size:11px">Depth pass across all seven domains. Its changelog entry is written when its defect list closes — the discipline, applied to itself, in front of you.</span></span></div>'+
  CHANGELOG.map(c2=>{const m=String(c2[1]).split(/\s*Fix:\s*/);const found=(m[0]||'').replace(/^Found:\s*/,'');const fix=m[1]||'';
   return'<div class="kv"><span class="k">'+U.esc(c2[0])+'</span><span class="v"><span class="dn" style="font-size:9.5px;letter-spacing:1px">DEFECT</span> <span class="i1" style="font-size:11px">'+U.esc(found)+'</span>'+(fix?'<br><span class="up" style="font-size:9.5px;letter-spacing:1px">FIX</span> <span class="i1" style="font-size:11px">'+U.esc(fix)+'</span>':'')+'</span></div>'}).join('')+
  '<div class="i2" style="font-size:10.5px;margin-top:6px">Read the left column top to bottom: every version number exists because something specific was broken. A release justified by “improvements” would not survive this table’s format — the format is the policy.</div>');
 /* cadence stats — computed from the real array, so the discipline claim is checkable */
 const relMajors=CHANGELOG.filter(c2=>/^V\d+\.0/.test(c2[0])).length;
 const relClean=CHANGELOG.filter(c2=>/Found:/.test(c2[1])&&/Fix:/.test(c2[1])).length;
 h+='<div class="grid g4">'+
  stat('Entries in CHANGELOG',CHANGELOG.length,'rendered above in full — none summarized away')+
  stat('Major versions',relMajors,'V-dot-zero entries; the rest are consolidation and defect kills')+
  stat('Found/Fix discipline','<span class="'+(relClean===CHANGELOG.length?'up':'dn')+'">'+relClean+'/'+CHANGELOG.length+'</span>','entries carrying BOTH clauses — parsed live, not asserted')+
  stat('Rules pairing','<span style="font-size:11px" class="mono">'+U.esc(RULES_VERSION)+'</span>','the certified pair this build runs')+
 '</div>';
 /* (b) readiness scorecard — live from actual suite results */
 h+=panel('READINESS SCORECARD — computed from THIS session’s suite runs','RUN / NOT-RUN honesty per suite · the verdict’s arithmetic is printed, not implied',
  '<div class="grid g4">'+
   stat('Integrity suite',i?('<span class="'+(i.pass===i.total?'up':'dn')+'">'+i.pass+'/'+i.total+'</span>'):'<span class="i2">NOT RUN</span>',i?'ran '+i.at+' · real assertions vs the running app':'runs at boot — if this reads NOT RUN, that is itself a finding')+
   stat('Boot self-test S1–S8',bt?('<span class="'+(bt.pass===8?'up':'dn')+'">'+bt.pass+'/8</span>'):'<span class="i2">NOT RUN</span>',bt?'ran '+bt.at+' · any FAIL pins risk_mode BLOCKED':'not executed this session')+
   stat('Golden fixtures',GOLDEN_LAST?('<span class="'+(GOLDEN_LAST.every(x=>x.pass)?'up':'dn')+'">'+GOLDEN_LAST.filter(x=>x.pass).length+'/'+GOLDEN_LAST.length+'</span>'):'<span class="i2">NOT RUN<br>THIS SESSION</span>',GOLDEN_LAST?'diffs rendered verbatim in Integrity':'unproven regression gate = HOLD, by rule')+
   stat('Stress range',STRESS_LAST?('<span class="'+(STRESS_LAST.every(x=>x.pass)?'up':'dn')+'">'+STRESS_LAST.filter(x=>x.pass).length+'/'+STRESS_LAST.length+'</span>'):'<span class="i2">NOT RUN<br>THIS SESSION</span>',STRESS_LAST?'expected vs actual gate behavior':'a drill, not a gate — red divergence blocks; not-run does not')+
  '</div>'+
  '<div class="hr"></div>'+
  tbl(['Verdict condition','Reading right now','Rule'],[
   ['INTEGRITY all green',i?(i.pass+'/'+i.total+(i.pass===i.total?' ✓':' ✕')):'not run ✕','required — a red assertion ships nothing'],
   ['BOOTTEST 8/8',bt?(bt.pass+'/8'+(bt.pass===8?' ✓':' ✕')):'not run ✕','required — a failed law smoke test pins the desk BLOCKED'],
   ['GOLDEN run + all MATCH',GOLDEN_LAST?(GOLDEN_LAST.filter(x=>x.pass).length+'/'+GOLDEN_LAST.length+(GOLDEN_LAST.every(x=>x.pass)?' ✓':' ✕')):'not run this session ✕','required — regressions hide exactly where nobody re-runs fixtures'],
   ['STRESS as-spec IF run',STRESS_LAST?(STRESS_LAST.filter(x=>x.pass).length+'/'+STRESS_LAST.length+(STRESS_LAST.every(x=>x.pass)?' ✓':' ✕')):'not run — no penalty','divergence blocks; absence does not (drill, not gate)'],
  ].map(r2=>'<tr><td class="i1" style="font-size:11px">'+r2[0]+'</td><td class="mono" style="font-size:10.5px">'+r2[1]+'</td><td class="i2" style="font-size:10.5px">'+r2[2]+'</td></tr>').join(''))+
  '<div class="banner '+(v2.ship?'gold':'blk')+'" style="margin-top:10px"><span class="bico">'+(v2.ship?'◆':'⛔')+'</span><div><b>VERDICT: '+(v2.ship?'SHIP':'HOLD')+'.</b> '+(v2.ship?'All required conditions green, golden run and matching. This exact arithmetic — not enthusiasm — is what promotes a build.':'Named reason'+(v2.why.length>1?'s':'')+': '+v2.why.map(U.esc).join(' · ')+'. The verdict names its blockers so the fix list writes itself.')+'</div></div>'+
  '<div class="btnrow" style="margin-top:8px">'+
   CMD.btn('rel.runall',null,'gold','▶ Run battery now (integrity + boot)')+
   '<button class="btn sm" data-cmd="rel.jump" data-arg="system.integrity">Golden + stress live in Integrity →</button>'+
   CMD.btn('rel.export',null,'sm','Export readiness JSON')+
  '</div>');
 /* (c) migration gates */
 h+=panel('MIGRATION GATES — what a release must pass','per-gate state for THIS build · demo-satisfiable vs production-only, separated honestly',
  tbl(['Gate','Tier','What it proves','State for this build',''],CSD_GATES.map((g,idx)=>
   '<tr><td><b style="font-size:11px">'+U.esc(g.gate)+'</b></td><td class="mono" style="font-size:9.5px">'+U.esc(g.tier)+'</td><td class="i1" style="font-size:10.5px">'+U.esc(g.what)+'</td><td class="i2" style="font-size:10.5px">'+U.esc(g.state())+'</td><td><button class="btn sm" data-cmd="rel.gate" data-arg="'+idx+'">Detail</button></td></tr>').join(''))+
  '<div class="i2" style="font-size:10.5px;padding:8px 12px">A PRODUCTION-ONLY row saying so is this page working as designed: the alternative — a green checkmark on a gate that never ran — is exactly the fake-QA defect this build was born to kill.</div>',{flush:true});
 /* (d) rollback drill */
 h+=panel('ROLLBACK DRILL — the downgrade path, rehearsed','structural checks executed in-page against live state · results verbatim, per check',
  '<div class="btnrow" style="margin-bottom:10px">'+CMD.btn('rel.rollback',null,'pri','⟲ Rehearse rollback v13.4 → v13.2')+(CSD_ROLLBACK?'<span class="pill">last drill '+CSD_ROLLBACK.at+' · '+CSD_ROLLBACK.pass+'/'+CSD_ROLLBACK.total+' green</span>':'<span class="pill">not rehearsed this session</span>')+'</div>'+
  (CSD_ROLLBACK?
   '<div class="kv"><span class="k">TARGET</span><span class="v mono" style="font-size:11px">'+U.esc(CSD_ROLLBACK.target)+'</span></div>'+
   tbl(['Structural check','Verdict','Evidence (verbatim from the check)'],CSD_ROLLBACK.checks.map(c2=>
    '<tr'+(c2.pass?'':' style="background:var(--blk-bg)"')+'><td class="i1" style="font-size:11px">'+U.esc(c2.nm)+'</td><td>'+(c2.pass?chip('PASS','ch-ok','✓'):chip('FAIL','ch-blk','✕'))+'</td><td class="mono i2" style="font-size:10px">'+U.esc(c2.detail)+'</td></tr>').join(''))+
   '<div class="i2" style="font-size:10.5px;margin-top:6px">'+(CSD_ROLLBACK.pass===CSD_ROLLBACK.total?'Every shape the prior version requires is present in live state — the downgrade door opens. In production this drill extends to replaying a session’s events through the old binary.':'A FAIL above means state written by this build would strand the prior version — the release CANNOT ship until the shape is reconciled or migrated both ways.')+'</div>'
   :'<div class="empty"><div class="e1">NOT REHEARSED</div>A rollback you have not rehearsed is a rumor. The drill checks that PACKETS and JOURNAL shapes still satisfy the prior version’s reader — real keys, real rows, executed when you press the button.</div>'));
 /* worked example: the candidate the gates are currently holding */
 h+=panel('CASE STUDY — why v13.3-candidate is BLOCKED','a blocked candidate is the system working, rendered as evidence rather than apology',
  kv('THE CANDIDATE','v13.3 — detector re-baselining follow-through from BT-0428, plus two threshold nudges from the LS-118 review track.')+
  kv('THE GATE THAT CAUGHT IT','Golden-packet regression: 46/48. Two fixtures diffed when the corpus was re-scored under candidate rules — the release stopped there, before any human argument about whether the diffs “matter”.')+
  kv('REGRESSION 1','A historic event-window packet re-scored as approvable: the candidate’s re-derived blackout arithmetic shaved the window by one bar-close. A packet the desk correctly refused in February would sail through today. That is not a tuning difference; that is LAW-017 behaving differently across versions.')+
  kv('REGRESSION 2','A golden A- packet re-graded B+ with no input change: grade stability across rules versions is a fixture because the grade feeds size, and silent grade drift is silent size drift (LAW-012’s formulaic-risk doctrine, upstream).')+
  kv('THE RESOLUTION PATH','Fix the arithmetic or write the diff into doctrine WITH a court entry (LAW-013) — a golden fixture may only change on purpose, in public, with a name attached. Until one of those happens, the matrix below reads BLOCKED for every 13.3 pairing.')+
  '<div class="i2" style="font-size:10.5px;margin-top:6px">Counterfactual worth stating: without the gate, both regressions ship silently and surface months later as “the desk feels looser lately”. Feelings are not a rollback trigger; fixtures are.</div>');
 /* (e) compatibility matrix */
 h+='<div class="grid g2">';
 h+=panel('COMPATIBILITY MATRIX — rules × KB certification','ships as a certified pair or not at all · demo lineage v13.x',
  tbl(['',...CSD_COMPAT.kb],CSD_COMPAT.rules.map(rv=>
   '<tr><td class="mono" style="font-size:10.5px"><b>'+U.esc(rv)+'</b></td>'+CSD_COMPAT.kb.map(kb=>{
    const cell=CSD_COMPAT.cell[rv+'|'+kb]||['UNTESTED',''];
    const cls=cell[0].startsWith('CERTIFIED')?'ch-ok':cell[0]==='BLOCKED'?'ch-blk':'ch-mut';
    return'<td>'+chip(cell[0],cls,cell[0].startsWith('CERTIFIED')?'✓':cell[0]==='BLOCKED'?'⛔':'·')+'<div class="i2" style="font-size:9.5px;margin-top:3px">'+U.esc(cell[1])+'</div></td>'}).join('')+'</tr>').join(''))+
  '<div class="i2" style="font-size:10.5px;padding:8px 12px"><b>The pairing doctrine:</b> rules decide, the KB explains and retrieves — let them drift apart and the desk cites doctrine that no longer governs it. UNTESTED is treated as BLOCKED at deploy time; certification is earned by a joint golden run, never by adjacency in a version number.</div>',{flush:true});
 /* (f) deprecation register */
 h+=panel('DEPRECATION REGISTER — four retirements over the program’s life','why it died · what replaced it · the guard that keeps it dead',
  CSD_DEPREC.map(dp=>'<div class="banner info" style="margin-bottom:8px"><span class="bico">✕</span><div><b>'+U.esc(dp.nm)+'</b> <span class="tag">retired '+U.esc(dp.died)+'</span>'+
   '<div class="i1" style="font-size:11px;margin:4px 0">WHY IT DIED — '+U.esc(dp.why)+'</div>'+
   '<div class="i1" style="font-size:11px;margin:4px 0">MIGRATION — '+U.esc(dp.migration)+'</div>'+
   '<div class="i2" style="font-size:10.5px">REGRESSION GUARD — '+U.esc(dp.guard)+'</div></div></div>').join('')+
  '<div class="i2" style="font-size:10.5px">A deprecation without a guard is a pause, not a retirement. Each entry above names the executable check that fails the build if the corpse twitches.</div>');
 h+='</div>';
 /* release doctrine */
 h+=panel('RELEASE DOCTRINE — three tenets, all enforced somewhere on this page','the discipline is only real where a mechanism holds it',
  kv('1 · NO RELEASE WITHOUT A NAMED DEFECT','Every changelog entry above opens with what was FOUND. If a candidate cannot name the defect it kills, it is a refactor riding a release train — park it. The docs gate parses the live CHANGELOG for the Found/Fix clauses on every render.')+
  kv('2 · FEATURE FLAGS OVER LONG BRANCHES','The autonomy lab ships dark behind a flag in this very build — merged, integrated, OFF. Long-lived branches rot and merge as surprises; a flag ships the risk in the open where the integrity suite and the kill switch can reach it.')+
  kv('3 · TWO-PERSON RULE FOR LAW CHANGES','Agents propose with evidence; only human governance deploys '+prov('LAW-013')+'. No single actor — human or machine — moves a constitutional threshold alone: the court stages the diff, the human signs it, the ledger records both. The 5R floor survived a formally-argued lowering attempt (LS-112) precisely because the rule held.')+
  '<div class="banner info" style="margin-top:8px"><span class="bico">◈</span><div><b>Why governance lives next to the kill switch:</b> a bad release is a position with unbounded size and no stop. The gates above are its risk engine — and like the trading gates, they fail closed.</div></div>');
 return h;
};
