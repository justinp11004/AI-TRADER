/* ═══════════ V11.1 FULL-FEATURE MERGE ═══════════
   Every capability of legacy V6–V10 gets a real home inside the seven
   domains. Nothing removed; everything recompartmentalized. This module
   ADDS workspaces and upgrades views in place — it never monkey-patches
   render pipelines (the legacy antipattern this rebuild retired). */

/* ── full 24-symbol universe (legacy Q2 canon) ── */
const UNIVERSE24=[
 ['NVDA',196.74,'MMBM Reversal','TRIGGERED','Semis'],['TSLA',412.66,'OTE Continuation','ARMED','Autos'],
 ['AMD',171.42,'Breaker Retest','FORMING','Semis'],['META',611.80,'Silver Bullet','FORMING','Mega-tech'],
 ['QQQ',529.77,'PD Array Rotation','FORMING','Index'],['SPY',601.24,'Killzone Sweep','SCANNING','Index'],
 ['MSFT',447.92,'OTE Continuation','SCANNING','Mega-tech'],['AAPL',232.60,'Breaker Retest','SCANNING','Mega-tech'],
 ['AMZN',224.05,'MMBM Reversal','SCANNING','Mega-tech'],['GOOGL',188.40,'Silver Bullet','SCANNING','Mega-tech'],
 ['NFLX',881.20,'Earnings Drift','SCANNING','Media'],['CRM',332.15,'PD Array Rotation','SCANNING','Software'],
 ['AVGO',238.66,'OTE Continuation','CANDIDATE','Semis'],['SMCI',44.18,'MMSM Reversal','SCANNING','Semis'],
 ['COIN',288.90,'Killzone Sweep','SCANNING','Crypto'],['PLTR',82.35,'OTE Continuation','SCANNING','Software'],
 ['MU',112.74,'Breaker Retest','SCANNING','Semis'],['ORCL',171.02,'PD Array Rotation','SCANNING','Software'],
 ['XOM',109.44,'Range Fade','SCANNING','Energy'],['JPM',265.80,'Range Fade','SCANNING','Banks'],
 ['IWM',228.31,'Killzone Sweep','SCANNING','Index'],['TLT',88.92,'Macro Drift','SCANNING','Rates'],
 ['GLD',272.10,'Macro Drift','SCANNING','Metals'],['UNH',521.66,'Earnings Drift','SCANNING','Health'],
].map(r=>({sym:r[0],px:r[1],setup:r[2],fsm:r[3],sector:r[4],chg:(RNG.r()-0.45)*2.4,rvol:0.6+RNG.r()*2.4,rs:Math.floor(RNG.r()*99)+1}));

/* ── chart workstation state (UI prefs only — never authority) ── */
const CHARTX={tf:'5m',type:'candles',ema20:true,ema50:false,vwap:true,zones:true,replay:false,replayAt:100,wall:false};
const TFS=['1M','1W','1D','4H','1H','15m','5m','1m'];
const TF_NOTES={ // Vision Desk canon — per-TF machine read for the active thesis symbol
 '1M':['UP','Campaign intact above the yearly protected low — nothing tactical here, but nothing broken either.'],
 '1W':['UP','Protected low 168.40 holds; no ladder conflict between weekly and daily.'],
 '1D':['UP','BOS 03-12 · price in the discount of the dealing range — pullbacks are for buying until the protected low fails.'],
 '4H':['DISCOUNT','Phase D re-accumulation: spring and test complete. The range is resolving upward.'],
 '1H':['SHIFTING','Reclaim through mid-range; watching for acceptance above equilibrium.'],
 '15m':['OTE','Tagged the 62–79% OTE — the 70.5% level is the A+ tag. A 5m MSS here arms the trigger.'],
 '5m':['TRIGGER','MSS 10:18 with displacement 74/100 — the machine trigger this packet is built on.'],
 '1m':['ENTRY','Sweep of a 1m pool then reclaim. Earlier is front-running the 5m; later gives worse R.']};

function drawChartX(cvId,sym,opts){POSTRENDER.push(()=>{const cv=document.getElementById(cvId);if(!cv)return;opts=opts||{};
  const W=cv.width=cv.clientWidth*2,H=cv.height=(opts.h||300)*2,x=cv.getContext('2d');
  const all=candles(sym,opts.n||110),cut=opts.replay?Math.max(12,Math.floor(all.length*opts.replayAt/100)):all.length;
  const data=all.slice(0,cut),s=symBy(sym);
  const lows=data.map(c=>c.l),his=data.map(c=>c.h);let lo=Math.min(...lows),hi=Math.max(...his);
  if(s&&s.levels&&s.levels.stop&&!opts.replay){lo=Math.min(lo,s.levels.stop*0.998);hi=Math.max(hi,(s.levels.t2||hi)*1.002)}
  const pad=(hi-lo)*0.04;lo-=pad;hi+=pad;
  const AX=88,cw=(W-AX)/data.length,py=p=>H-((p-lo)/(hi-lo))*(H*0.80)-H*0.03;
  x.fillStyle='#070B12';x.fillRect(0,0,W,H);
  x.strokeStyle='rgba(151,166,192,.08)';x.lineWidth=1;x.font='17px monospace';
  const step=(hi-lo)/5;for(let i=0;i<=5;i++){const p=lo+step*i,y=py(p);x.beginPath();x.moveTo(0,y);x.lineTo(W-AX,y);x.stroke();x.fillStyle='#67748C';x.fillText(p.toFixed(p>1000?0:2),W-AX+8,y+6)}
  if(opts.zones&&s&&s.levels&&s.levels.entry){
    const zx=(W-AX)*0.57;
    x.fillStyle='rgba(90,167,255,.10)';x.fillRect(zx,py(s.levels.entry*1.0005),(W-AX)-zx,py(s.levels.entry*0.997)-py(s.levels.entry*1.0005));
    x.fillStyle='rgba(90,167,255,.7)';x.fillText('FVG · DET-041',zx+8,py(s.levels.entry)-8);
    x.fillStyle='rgba(47,214,160,.10)';x.fillRect(zx*0.94,py(s.levels.stop*1.007),(W-AX)-zx*0.94,py(s.levels.stop*1.001)-py(s.levels.stop*1.007));
    x.fillStyle='rgba(47,214,160,.7)';x.fillText('OB · DET-052',zx*0.94+8,py(s.levels.stop*1.004)+20)}
  /* series */
  if(opts.type==='line'||opts.type==='area'){
    x.beginPath();data.forEach((c,i)=>{const X=i*cw+cw/2,Y=py(c.c);i?x.lineTo(X,Y):x.moveTo(X,Y)});
    x.strokeStyle='#5AA7FF';x.lineWidth=2.5;x.stroke();
    if(opts.type==='area'){x.lineTo(cut*cw,H);x.lineTo(0,H);x.closePath();const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'rgba(90,167,255,.20)');g.addColorStop(1,'rgba(90,167,255,0)');x.fillStyle=g;x.fill()}
  }else{
    data.forEach((c,i)=>{const X=i*cw,up=c.c>=c.o;
      x.strokeStyle=up?'rgba(47,214,160,.85)':'rgba(242,99,124,.85)';x.beginPath();x.moveTo(X+cw/2,py(c.h));x.lineTo(X+cw/2,py(c.l));x.stroke();
      x.fillStyle=up?'rgba(47,214,160,.85)':'rgba(242,99,124,.85)';const y1=py(Math.max(c.o,c.c)),y2=py(Math.min(c.o,c.c));x.fillRect(X+cw*0.18,y1,Math.max(2,cw*0.64),Math.max(2,y2-y1));
      x.fillStyle='rgba(90,167,255,.22)';x.fillRect(X+cw*0.18,H-c.v*H*0.06,Math.max(2,cw*0.64),c.v*H*0.06)})}
  /* indicators */
  const ema=(n)=>{const k=2/(n+1);let e=data[0].c;return data.map(c=>(e=c.c*k+e*(1-k)))};
  if(opts.ema20){const e=ema(20);x.beginPath();e.forEach((v,i)=>{const X=i*cw+cw/2,Y=py(v);i?x.lineTo(X,Y):x.moveTo(X,Y)});x.strokeStyle='rgba(231,182,83,.8)';x.lineWidth=1.6;x.stroke()}
  if(opts.ema50){const e=ema(50);x.beginPath();e.forEach((v,i)=>{const X=i*cw+cw/2,Y=py(v);i?x.lineTo(X,Y):x.moveTo(X,Y)});x.strokeStyle='rgba(157,141,248,.8)';x.lineWidth=1.6;x.stroke()}
  if(opts.vwap){let cum=0,cv2=0;const w=data.map(c=>{const tp=(c.h+c.l+c.c)/3;cum+=tp*c.v;cv2+=c.v;return cum/cv2});
    x.beginPath();w.forEach((v,i)=>{const X=i*cw+cw/2,Y=py(v);i?x.lineTo(X,Y):x.moveTo(X,Y)});x.strokeStyle='rgba(87,199,227,.7)';x.setLineDash([3,4]);x.stroke();x.setLineDash([])}
  if(opts.bb){const n2=20,k2=2;const sma=data.map((c,i)=>{const w2=data.slice(Math.max(0,i-n2+1),i+1);return w2.reduce((a2,c2)=>a2+c2.c,0)/w2.length});
    const sd=data.map((c,i)=>{const w2=data.slice(Math.max(0,i-n2+1),i+1);const m=sma[i];return Math.sqrt(w2.reduce((a2,c2)=>a2+(c2.c-m)*(c2.c-m),0)/w2.length)});
    [1,-1].forEach(sg=>{x.beginPath();sma.forEach((m,i)=>{const X=i*cw+cw/2,Y=py(m+sg*k2*sd[i]);i?x.lineTo(X,Y):x.moveTo(X,Y)});x.strokeStyle='rgba(157,141,248,.4)';x.lineWidth=1.2;x.stroke()})}
  if(opts.rsi){const per=14;let g=0,l2=0;const rsi=data.map((c,i)=>{if(!i)return 50;const ch2=c.c-data[i-1].c;g=(g*(per-1)+Math.max(ch2,0))/per;l2=(l2*(per-1)+Math.max(-ch2,0))/per;return l2===0?100:100-100/(1+g/l2)});
    const y0=H*0.86,hh=H*0.13;x.fillStyle='rgba(12,18,32,.85)';x.fillRect(0,y0,W-AX,hh);
    [30,70].forEach(lv=>{const Y=y0+hh-(lv/100)*hh;x.strokeStyle='rgba(151,166,192,.2)';x.setLineDash([3,4]);x.beginPath();x.moveTo(0,Y);x.lineTo(W-AX,Y);x.stroke();x.setLineDash([])});
    x.beginPath();rsi.forEach((v,i)=>{const X=i*cw+cw/2,Y=y0+hh-(v/100)*hh;i?x.lineTo(X,Y):x.moveTo(X,Y)});x.strokeStyle='rgba(231,182,83,.85)';x.lineWidth=1.6;x.stroke();
    x.fillStyle='#67748C';x.fillText('RSI(14)',8,y0+16)}
  if(opts.levels!==false&&s&&s.levels&&s.levels.entry&&!opts.mini){
    [['ENTRY',s.levels.entry,'#5AA7FF'],['STOP',s.levels.stop,'#FF4D5F'],['T1',s.levels.t1,'#2FD6A0'],['T2 · 5R',s.levels.t2,'#2FD6A0'],['T3',s.levels.t3,'#2FD6A0']].forEach(([nm,p,col])=>{
      if(!p)return;const y=py(p);if(y<0||y>H)return;
      x.strokeStyle=col;x.setLineDash([7,5]);x.beginPath();x.moveTo(0,y);x.lineTo(W-AX,y);x.stroke();x.setLineDash([]);
      x.fillStyle=col;x.fillText(nm+' '+p.toFixed(2),10,y-6)})}
  if(opts.replay){x.fillStyle='rgba(214,178,94,.9)';x.font='18px monospace';x.fillText('REPLAY · bar '+cut+'/'+all.length+' · no future leakage',12,26)}
})}
CMD.define({id:'chartx.set',label:'Chart setting',purpose:'Chart workstation preference (UI only — never authority)',audit:false,
  run:a=>{const[k,v2]=a.split('=');if(k==='tf')CHARTX.tf=v2;else if(k==='type')CHARTX.type=v2;else CHARTX[k]=!CHARTX[k];render()}});
CMD.define({id:'chartx.notes',label:'Download TA notes',purpose:'Generate the multi-timeframe technical read as a Markdown file (real download)',
  run:()=>{const s=symBy(S.sym);
    const md='# ATLAS Technical Read — '+s.sym+' ('+s.name+')\n_Generated '+CLOCK.hms()+' ET (sim) · DEMO data · seed '+ck('demo.seed')+'_\n\n'+
      '**Thesis:** '+s.note+'\n\n**Playbook:** '+s.setup+' · lifecycle '+s.fsm+'\n\n## Timeframe ladder\n\n'+
      TFS.map(tf=>'- **'+tf+' · '+TF_NOTES[tf][0]+'** — '+TF_NOTES[tf][1]).join('\n')+
      '\n\n## Levels\n- Draw above: '+s.levels.poolAbove+'\n- Pool below: '+s.levels.poolBelow+
      (s.levels.entry?'\n- Plan: entry '+s.levels.entry+' · stop '+s.levels.stop+' · T2(5R) '+s.levels.t2:'')+
      '\n\n> Higher timeframes justify; lower timeframes trigger (AX-M7). DEMO — not investment advice.\n';
    const blob=new Blob([md],{type:'text/markdown'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='ATLAS_TA_'+s.sym+'_demo.md';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),4000);
    SVR.audit('HUMAN (owner)','export','TA notes exported for '+s.sym+' — filed to archive as SHADOW');
    UI.toast('TA notes downloaded — real file, honestly DEMO-labeled','ok','VISION DESK')}});

/* research.chart is defined in the chart-pro module (part-19) — one view, one definition */

/* ── DECISIONS · Committee Rail (absorbs legacy C3 Live Rail) ── */
const RAIL={landed:5,scrub:100};
CMD.define({id:'rail.scrub',label:'Rail replay scrub',purpose:'Time-travel the committee run — every frame is a ledger read',audit:false,run:(a,el)=>{RAIL.scrub=+el.value;render()}});
VIEWS['decisions.rail']=function(){
  const p=PACKETS[0];
  const upto=Math.floor(PIPELINE.length*RAIL.scrub/100);
  let h=vhead('DECISIONS · committee rail','Watch the firm think — 14 machine steps, then you',
    'Fan-out steps 2–9 run parallel after freshness; gates 10–12 are sequential — any block short-circuits to the Director. Step 15 is a hard edge: a human token, not a callback.');
  h+='<div class="row" style="margin-bottom:10px"><span class="mono i2" style="font-size:10px">REPLAY RUN-NVDA-1042</span><input type="range" min="7" max="100" value="'+RAIL.scrub+'" style="flex:1;max-width:420px" data-cmdin="rail.scrub"><span class="mono i2" style="font-size:10px">'+upto+'/'+PIPELINE.length+' steps</span></div>';
  h+=panel('PIPELINE RUN — RUN-NVDA-1042 → '+p.id,'each landed vote is a ledger read; content hashes verify nothing was rewritten',
    '<div class="tl">'+PIPELINE.slice(0,Math.min(upto,PIPELINE.length)).map((st,i)=>{
      const seat=SEATBY[st[0]];const vote=p.votes.find(v2=>v2.seat===st[0]);
      return'<div class="tle '+(vote?(vote.verdict==='pass'?'good':vote.verdict==='block'?'bad':'hot'):'')+'"><span class="tt">step '+(i+1)+' · '+st[1]+'</span><br><b class="mono" style="font-size:11px;cursor:pointer" data-cmd="nav.system.agents" data-arg="'+st[0]+'">'+st[0]+' '+seat.nm+'</b> '+(vote?chip(vote.verdict,vote.verdict==='pass'?'ch-ok':vote.verdict==='advisory'?'ch-warn':vote.verdict==='block'?'ch-blk':'ch-mut','·')+' <span class="i1" style="font-size:11px">'+U.esc(vote.txt)+'</span>':'<span class="i2" style="font-size:10.5px">deterministic gate — no vote artifact required</span>')+'</div>'}).join('')+
    (upto>=PIPELINE.length?'<div class="tle hot"><span class="tt">step 15 · HUMAN</span><br><b class="mono" style="font-size:11px">YOU</b> '+chip(p.state.replace(/_/g,' '),p.state==='READY_FOR_HUMAN'?'ch-live':'ch-ok','◆')+' <span class="i1" style="font-size:11px">'+(p.state==='READY_FOR_HUMAN'?'awaiting your enum — TTL '+fmtTTL(p):'decided '+(p.decision||p.state)+' at '+(p.decidedAt||'—'))+'</span></div>':'')+'</div>');
  h+='<div class="grid g2">';
  h+=panel('CONFLICT RESOLUTION — named, never averaged','the hierarchy is the tiebreaker',
    kv('CONFLICT','S21 crowded-heat (92nd pctile) vs S09 leader-strength (RS 94)')+
    kv('RESOLUTION','Hierarchy: sentiment is context, never trigger (CC-13). S09 doctrine stands; S21 recorded as dissent — visible forever.')+
    kv('HIERARCHY','<span style="font-size:10.5px">'+HIERARCHY+'</span>'));
  h+=panel('RUN TELEMETRY','bounded fan-out economics',
    kv('SEATS INVOKED',p.votes.length+' of 34 — committee fan-out is bounded ('+ck('agents.committee_max_fanout')+' parallel max) '+prov('agents.committee_max_fanout'))+
    kv('SHORT-CIRCUITS','0 this run · AMD run 10:21 short-circuited at step 10 (S22 contract veto)')+
    kv('BUDGET','Packet build 17.4s < '+ck('slo.packet_p95_s')+'s p95 '+prov('slo.packet_p95_s')));
  h+='</div>';
  return h;
};

/* ── SYSTEM · Knowledge Base (absorbs legacy M7 + V3 retrieval doctrine) ── */
VIEWS['system.knowledge']=function(){
  let h=vhead('SYSTEM · knowledge base','137 doctrine files · 20 layers · lane-filtered retrieval',
    'Constitution and config load deterministically — never by vector similarity. Legacy layers are lineage: they can inform, they cannot silently override current rules.');
  h+='<div class="grid g4">'+stat('Files','137','1.91 MB · 15,892 lines')+stat('Layers','20','00_CONSTITUTION → 16_ICT_UNIFIED + lineage')+stat('Rule IDs','48','unique, cited across doctrine')+stat('KB chunks','18,442','hybrid retrieval · lane-filtered')+'</div>';
  h+='<div class="grid g2" style="margin-top:12px">';
  h+=panel('LAYER INDEX','authority tier descends with layer number',
    tbl(['Layer','Role','Authority'],[
     ['00_CONSTITUTION','The 18 laws + operator boundaries','SUPREME — deterministic load'],
     ['11_RUNTIME_CONFIG','atlas_config + schemas + agents + playbooks','NUMERIC TRUTH (LAW-015)'],
     ['01_MIND … 10_HUMAN_INTERFACE','Operating doctrine per faculty','CURRENT CORE'],
     ['13_SYSTEM_PROMPTS','Agent role definitions','CURRENT CORE'],
     ['05_SOFTWARE_MASTER_BUILD_SPEC','Implementation intent','SPEC'],
     ['03_V12_REFERENCE + 99_source_volumes','Snapshots, source volumes','LINEAGE ONLY — cannot override'],
    ].map(r=>'<tr><td class="mono" style="font-size:10.5px">'+r[0]+'</td><td class="i1" style="font-size:11px">'+r[1]+'</td><td class="i2" style="font-size:10px">'+r[2]+'</td></tr>').join('')),{flush:true});
  h+=panel('MOST-CITED RULES','what the doctrine actually leans on',
    tbl(['Rule','>Citations','Meaning'],[['LAW-015',48,'Config is numeric truth'],['LAW-001',41,'No structural invalidation → no trade'],['LAW-012',23,'Prior outcome cannot alter next trade’s risk'],['LAW-004',21,'Realistic 5R against the TRUE stop'],['LAW-017',13,'Event blackouts enforced'],['ICT-001',10,'Displacement + FVG entry doctrine'],['EXE-*',10,'Execution router rules']].map(r=>'<tr><td class="mono" style="color:var(--live)">'+r[0]+'</td><td class="r num">'+r[1]+'</td><td class="i1" style="font-size:11px">'+r[2]+'</td></tr>').join('')),{flush:true});
  h+='</div>';
  h+=panel('EVIDENCE VAULT','every artifact addressable, hashed, and exportable',
    '<div class="grid g3">'+VAULT.map(f=>'<div class="stat"><div class="k">▣ '+U.esc(f[0])+'</div><div class="v" style="font-size:11px;font-family:var(--mono)">'+U.esc(f[1])+'</div><div class="s">'+U.esc(f[2])+'</div></div>').join('')+'</div>');
  h+=panel('RETRIEVAL DOCTRINE','how agents read the library without leaving their lane',
    kv('HYBRID RANK','0.65 × cosine (pgvector HNSW) + 0.35 × lexical ts_rank')+
    kv('LANE FILTER','agent_owners metadata filters at retrieval — no seat reads another seat’s doctrine')+
    kv('DETERMINISTIC','Constitution + active config bypass vector search entirely — loaded verbatim, versioned')+
    kv('INSPECTION','Every decision stores its retrieved chunk hashes — a human can inspect exactly what the seat read')+
    kv('BLOCKING','Doctrine/config version mismatch blocks live decisions until reconciled'));
  return h;
};

/* ── Setup Archive (legacy V2) → appended into Review · Autopsy via ARCHIVE data ── */
const ARCHIVE=[
 ['STP-0931','NVDA','TAKEN','+0.62R open','MMBM Reversal','—'],
 ['STP-0928','TSLA','LIVE-QUEUE','armed','OTE Continuation','—'],
 ['STP-0924','AMD','REJECTED','WOULD +2.3R','Breaker Retest','MISS — contract gate (OPT-007) blocked it; LS-121 A/B running'],
 ['STP-0919','META','TAKEN(paper)','−0.3R open','Silver Bullet','counter-regime honored at paper'],
 ['STP-0913','COIN','REJECTED','WOULD −1.0R','Killzone Sweep','correct — chasing filter'],
 ['STP-0908','PLTR','PASSED','WOULD +1.8R','OTE Continuation','MISS — displacement scored 58, just under threshold; feeds LS-118 review'],
 ['STP-0901','AAPL','REJECTED','WOULD +2.8R ran, never 5R','Breaker Retest','correct — 5R bar is the bar'],
 ['STP-0893','MU','PASSED','WOULD +1.2R','Earnings Drift','earnings T-1 exclusion — rule costs winners AND prevents blowups; net-correct'],
];

/* ── Training Studio (legacy M5 teach loop) ── */
let HUM_SEQ=120;
CMD.define({id:'teach.submit',label:'Submit lesson',purpose:'Teach the desk a rule: structured lesson → quiz-back → HUM chunk → court A/B',
  run:()=>{const t=$('#th-title'),m=$('#th-miss'),c=$('#th-correct'),iv=$('#th-inval');
    if(!t.value.trim()||!c.value.trim()){UI.toast('Title and correct read are required — a lesson without a rule is a vibe','warn','TRAINING');return}
    const title=t.value.trim(),miss=m.value.trim()||'—',correct=c.value.trim(),inval=iv.value.trim()||'—';
    UI.modal('QUIZ-BACK — the desk restates your lesson',
      '<div class="i1" style="line-height:1.65;font-size:12px">Before anything is minted, the machine proves it understood:</div>'+
      '<div class="code" style="margin-top:8px">RULE: '+U.esc(title)+'\nWHAT I MISSED: '+U.esc(miss)+'\nCORRECT READ: '+U.esc(correct)+'\nINVALIDATION: '+U.esc(inval)+'\nLANES: Technical Court (S10–S16)\nPIPELINE: HUM chunk → Learning Court → paper A/B cohort → doctrine</div>'+
      '<div class="i2" style="font-size:10.5px;margin-top:8px">Confirm mints HUM-'+(HUM_SEQ+1)+' and files an LS proposal. Nothing touches live rules without the court + your sign-off (LAW-013).</div>',
      '<button class="btn" data-cmd="ui.closeModal">Revise</button><button class="btn gold" data-cmd="teach.confirm" data-arg="'+U.esc(title).replace(/"/g,'&quot;')+'">Confirm — mint HUM chunk</button>')}});
CMD.define({id:'teach.confirm',label:'Confirm lesson',purpose:'Mint the HUM chunk and file to court',
  run:a=>{HUM_SEQ++;const id='HUM-'+HUM_SEQ;
    HUMAN_LESSONS.unshift({id,rule:a,effect:'A/B cohort forming — n=0/30 (GOV-030)'});
    COURT.unshift({id:'LS-'+(130+HUM_SEQ%100),title:a,from:'HUMAN teach-loop ('+id+')',stage:'PROPOSED',evidence:'Human-authored lesson; awaiting paper A/B evidence (n≥30, effect ≥0.3R).',diff:'kb.chunk += '+id+' (Technical Court lanes)',risk:'None until promoted — paper-observable only',needs:'30 A/B samples'});
    SVR.audit('HUMAN (owner)','teach',id+' minted — "'+a+'" → Learning Court + paper A/B cohort');
    UI.closeModal();UI.toast(id+' minted → court + A/B cohort. The desk never edits itself without your sign-off.','gold','TRAINING STUDIO');go('review','court')}});

/* ── AUTOLEARN stream (legacy V3 Brain Console self-proposals) ── */
const AUTOLEARN=[
 {id:'MM-LUNCH-001',conf:.86,txt:'Lunch 11:30–13:30 expectancy −0.21R vs +1.1R in killzones → propose lunch-throttle: no new entries 11:45–13:15 unless grade ≥ A'},
 {id:'DET-PD-071',conf:.79,txt:'70.5% OTE tags average +1.4R vs +0.9R for 62% tags → weight 70.5% tags higher in promotion scoring'},
 {id:'OPT-016',conf:.74,txt:'30-minute re-check before terminal contract-block — spread normalizes within 30m in 64% of vetoes'},
 {id:'DET-DISP-055',conf:.68,txt:'Soft-floor 55–60 displacement with reduced size instead of hard reject — needs regime split'},
 {id:'S18-NEWS-009',conf:.81,txt:'Vendor pre-announcement noise misclassified as catalyst — flagged for human authorship, not auto-fix'},
];

/* ── consciousness map (legacy M1) — SVG cortex render ── */
const CORTEX=[['PERCEPTION',['S04','S05','S06','S10','S11','S12','S13','S14','S15']],['INTEL',['S16','S17','S18','S19','S20','S21']],['OPTIONS',['S22','S23','S24','S25']],['STRATEGY',['S08','S09','S26']],['RISK',['S01','S33']],['JUDGMENT',['S00','S28']],['MEMORY',['S02','S07','S32']],['LEARNING',['S29','S30','S31','S03']],['EXECUTION',['S27']]];
const AXONS=[['S12','S13'],['S13','S14'],['S14','S26'],['S11','S26'],['S10','S26'],['S22','S26'],['S26','S00'],['S09','S00'],['S08','S00'],['S21','S00'],['S18','S00'],['S01','S00'],['S00','S28'],['S28','S27'],['S02','S01'],['S17','S20'],['S05','S12'],['S33','S01'],['S29','S03'],['S31','S29'],['S07','S00']];
function cortexSVG(){
  const cols=CORTEX.length,W=1560,H=340,cw=W/cols,pos={};
  let g='';
  CORTEX.forEach(([nm,ids],ci)=>{
    g+='<rect x="'+(ci*cw+6)+'" y="26" width="'+(cw-12)+'" height="'+(H-40)+'" rx="8" fill="rgba(18,26,43,.5)" stroke="rgba(151,166,192,.12)"/>';
    g+='<text x="'+(ci*cw+cw/2)+'" y="18" text-anchor="middle" font-family="monospace" font-size="10" letter-spacing="1.5" fill="#67748C">'+nm+'</text>';
    ids.forEach((id,i)=>{const x=ci*cw+cw/2,y=52+i*((H-80)/Math.max(ids.length,1));pos[id]=[x,y]});});
  AXONS.forEach(([a,b])=>{const p1=pos[a],p2=pos[b];if(!p1||!p2)return;
    g+='<path d="M'+p1[0]+','+p1[1]+' Q'+((p1[0]+p2[0])/2)+','+((p1[1]+p2[1])/2-26)+' '+p2[0]+','+p2[1]+'" fill="none" stroke="rgba(90,167,255,.18)" stroke-width="1.4"/>'});
  CORTEX.forEach(([,ids])=>ids.forEach(id=>{const [x,y]=pos[id],s=SEATBY[id];
    g+='<g style="cursor:pointer" data-cmd="nav.system.agents" data-arg="'+id+'"><circle cx="'+x+'" cy="'+y+'" r="11" fill="'+(s.veto?'rgba(255,77,95,.14)':'rgba(90,167,255,.10)')+'" stroke="'+(s.veto?'rgba(214,178,94,.8)':'rgba(90,167,255,.45)')+'" stroke-width="'+(s.veto?'2':'1.2')+'"/><text x="'+x+'" y="'+(y+3)+'" text-anchor="middle" font-family="monospace" font-size="8.5" fill="#E9EEF6">'+id.slice(1)+'</text><text x="'+x+'" y="'+(y+24)+'" text-anchor="middle" font-family="monospace" font-size="7.5" fill="#67748C">'+s.nm.split(' ')[0]+'</text></g>'}));
  return'<div style="overflow-x:auto"><svg viewBox="0 0 '+W+' '+H+'" style="min-width:1100px;width:100%;background:var(--bg0);border:1px solid var(--line);border-radius:6px">'+g+'</svg></div>'+
  '<div class="legend" style="margin-top:6px"><span><i style="background:rgba(214,178,94,.8)"></i>gold ring = veto seat</span><span><i style="background:rgba(90,167,255,.45)"></i>edge = real dependency from the pipeline DAG</span></div>'+
  '<div class="i2" style="font-size:10.5px;margin-top:4px">Teamwork law: no seat sees another’s prompt — only schema outputs on the bus. The Director integrates; it never averages.</div>';
}

/* ── autonomy blotter (legacy A1/A3) — honest sim corpus, zero survivorship ── */
const BLOTTER=[];let BLOT_SEQ=8100;
function blotterStep(n){
  if(!S.autonomyLab||S.kill)return;
  BLOTTER.forEach(b=>{if(b.st==='OPEN'){b.prog+=0.08+RNG.r()*0.1;b.curR=b.outR*Math.min(1,b.prog)*(0.7+0.3*Math.sin(b.prog*6));
    if(b.prog>=1){b.st='CLOSED';b.curR=b.outR;SVR.audit(b.who+' (auto)','blotter',b.id+' closed '+U.R(b.outR)+' — corpus n grows, win or lose (zero survivorship)')}}});
  if(n%10===0&&BLOTTER.filter(b=>b.st==='OPEN').length<4){
    const p=RNG.pick(PERSONAS),u=RNG.pick(UNIVERSE24);
    const win=RNG.r()<parseFloat(p.win)/100,outR=win?(0.8+RNG.r()*(p.id==='swing'?6:2.5)):-(0.4+RNG.r()*0.6);
    BLOTTER.unshift({id:'ATO-'+(++BLOT_SEQ),t:CLOCK.hm(),who:p.nm,ico:p.ico,sym:u.sym,pb:RNG.pick(p.books),st:'OPEN',prog:0,curR:0,outR});
    if(BLOTTER.length>40)BLOTTER.pop()}
}

/* ── Monte Carlo cone (legacy M2) — honest label: 140 seeded paths ── */
function drawCone(cvId){POSTRENDER.push(()=>{const cv=document.getElementById(cvId);if(!cv)return;
  const W=cv.width=cv.clientWidth*2,H=cv.height=230*2,x=cv.getContext('2d');
  const r=localRng('cone-'+ck('demo.seed')),N=170,P=140,paths=[];
  for(let p=0;p<P;p++){let eq=Math.log(1000),row=[eq];for(let i=0;i<N;i++){eq+=0.011+(r()-0.5)*0.06;row.push(eq)}paths.push(row)}
  const lo=Math.log(500),hi=Math.log(200000);
  const py=v=>H-((v-lo)/(hi-lo))*H*0.9-H*0.05,px=i=>i/N*W;
  x.fillStyle='#070B12';x.fillRect(0,0,W,H);
  x.font='16px monospace';
  [1000,10000,100000].forEach(g2=>{const y=py(Math.log(g2));x.strokeStyle='rgba(151,166,192,.18)';x.setLineDash([4,5]);x.beginPath();x.moveTo(0,y);x.lineTo(W,y);x.stroke();x.setLineDash([]);x.fillStyle='#67748C';x.fillText('$'+(g2/1000)+'k',W-70,y-5)});
  const bands=[[0.1,0.9,'rgba(90,167,255,.08)'],[0.25,0.75,'rgba(90,167,255,.13)']];
  bands.forEach(([a,b,col])=>{x.beginPath();
    for(let i=0;i<=N;i++){const col2=paths.map(p=>p[i]).sort((m,n2)=>m-n2);x[i?'lineTo':'moveTo'](px(i),py(col2[Math.floor(P*a)]))}
    for(let i=N;i>=0;i--){const col2=paths.map(p=>p[i]).sort((m,n2)=>m-n2);x.lineTo(px(i),py(col2[Math.floor(P*b)]))}
    x.closePath();x.fillStyle=col;x.fill()});
  x.beginPath();for(let i=0;i<=N;i++){const col2=paths.map(p=>p[i]).sort((m,n2)=>m-n2);x[i?'lineTo':'moveTo'](px(i),py(col2[Math.floor(P*0.5)]))}
  x.strokeStyle='#5AA7FF';x.lineWidth=2.5;x.stroke();
  x.beginPath();paths[7].forEach((v,i)=>x[i?'lineTo':'moveTo'](px(i),py(v)));x.strokeStyle='rgba(214,178,94,.85)';x.lineWidth=1.6;x.stroke();
  const hit=paths.filter(p=>Math.max(...p)>=Math.log(100000)).length;
  x.fillStyle='#E9EEF6';x.font='18px monospace';x.fillText('P(touch $100k ≤ '+N+' trades) ≈ '+Math.round(hit/P*100)+'% · 140 seeded paths · exp +1.04R · win 34% · payoff 3.9:1 · DEMO',14,28);
})}

/* delegated input events for sliders — no inline handlers anywhere */
document.addEventListener('input',e=>{const el=e.target.closest('[data-cmdin]');if(el)CMD.run(el.dataset.cmdin,el.dataset.arg,el)});
