/* ═══════════ view helpers ═══════════ */
function panel(t,why,body,opts){opts=opts||{};return'<div class="panel'+(opts.cls?' '+opts.cls:'')+'"><div class="ph"><span class="t">'+t+'</span>'+(why?'<span class="why">'+why+'</span>':'')+(opts.head?'<span class="spacer"></span>'+opts.head:'')+'</div><div class="pb'+(opts.flush?' flush':'')+'">'+body+'</div></div>'}
function vhead(kick,title,sub,chips){return'<div class="vhead"><div class="kick">'+kick+'</div><h2>'+title+(chips?' '+chips:'')+'</h2>'+(sub?'<div class="sub">'+sub+'</div>':'')+'</div>'}
function tbl(cols,rows){return'<div class="tblwrap"><table class="tbl"><thead><tr>'+cols.map(c=>'<th'+(c.startsWith('>')?' class="r"':'')+'>'+c.replace(/^>/,'')+'</th>').join('')+'</tr></thead><tbody>'+rows+'</tbody></table></div>'}
function kv(k,v){return'<div class="kv"><span class="k">'+k+'</span><span class="v">'+v+'</span></div>'}
function voteChips(votes){return'<span class="votes">'+votes.map(x=>{const s=SEATBY[x.seat];return'<span class="vote '+x.verdict+'" title="'+U.esc(x.seat+' '+(s?s.nm:'')+' — '+x.verdict.toUpperCase()+'\n'+x.txt+(x.hard.length?'\nHARD: '+x.hard.join(' · '):''))+'">'+x.seat.slice(1)+'</span>'}).join('')+'</span>'}
function voteSummary(votes){const c={pass:0,advisory:0,abstain:0,block:0};votes.forEach(v=>c[v.verdict]++);return c.pass+'p · '+c.advisory+'a · '+c.abstain+'ab · <span class="'+(c.block?'dn':'i2')+'">'+c.block+'b</span>'}
function fmtTTL(p){return p.state==='READY_FOR_HUMAN'||p.state==='RISK_BLOCKED'?U.mmss(p.ttl):'—'}
/* deterministic per-symbol candle series (isolated PRNG — global stream untouched) */
function localRng(seedStr){let s=0;for(let i=0;i<seedStr.length;i++)s=(Math.imul(s,31)+seedStr.charCodeAt(i))>>>0;return()=>{s|=0;s=(s+0x6D2B79F5)|0;let t=Math.imul(s^(s>>>15),1|s);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296}}
const _candleCache={};
function candles(sym,n){n=n||96;const key=sym+'|'+n;if(_candleCache[key])return _candleCache[key];
  const s=symBy(sym),r=localRng('atlas-v11-'+key),out=[];let px=(s?s.px:100)*0.965;
  for(let i=0;i<n;i++){
    const drift=i>n*0.55?0.0009:0.0001;                       // engineered: sweep→displacement at 55%
    let o=px,mv=(r()-0.48)*0.008+drift;
    if(i===Math.floor(n*0.55)){mv=-0.012}                     // the sweep candle
    if(i===Math.floor(n*0.55)+2){mv=0.016}                    // displacement reclaim
    let c=o*(1+mv),hi=Math.max(o,c)*(1+r()*0.003),lo=Math.min(o,c)*(1-r()*0.003),vol=0.4+r()*(i===Math.floor(n*0.55)?2.4:1);
    out.push({o,c,h:hi,l:lo,v:vol});px=c}
  const anchor=(s?s.px:100)/px;out.forEach(cd=>{cd.o*=anchor;cd.c*=anchor;cd.h*=anchor;cd.l*=anchor});
  _candleCache[key]=out;return out}
function drawPrice(cvId,sym,opts){POSTRENDER.push(()=>{const cv=document.getElementById(cvId);if(!cv)return;opts=opts||{};
  const W=cv.width=cv.clientWidth*2,H=cv.height=(opts.h||300)*2,x=cv.getContext('2d');
  const data=candles(sym,opts.n||96),s=symBy(sym);
  const lows=data.map(c=>c.l),his=data.map(c=>c.h);let lo=Math.min(...lows),hi=Math.max(...his);
  if(s&&s.levels&&s.levels.stop){lo=Math.min(lo,s.levels.stop*0.998);hi=Math.max(hi,(opts.full?s.levels.t2:s.levels.t1)*1.002||hi)}
  const pad=(hi-lo)*0.04;lo-=pad;hi+=pad;
  const AX=88,cw=(W-AX)/data.length,py=p=>H-((p-lo)/(hi-lo))*(H*0.82)-H*0.02;
  x.fillStyle='#070B12';x.fillRect(0,0,W,H);
  x.strokeStyle='rgba(151,166,192,.08)';x.lineWidth=1;x.font='18px '+'monospace';x.fillStyle='#67748C';
  const step=(hi-lo)/5;for(let i=0;i<=5;i++){const p=lo+step*i,y=py(p);x.beginPath();x.moveTo(0,y);x.lineTo(W-AX,y);x.stroke();x.fillText(p.toFixed(p>1000?0:2),W-AX+8,y+6)}
  /* zones: FVG + OB from level fractions (deterministic annotations) */
  if(s&&s.levels&&s.levels.entry&&opts.zones!==false){
    const zx=(W-AX)*0.57;
    x.fillStyle='rgba(90,167,255,.10)';x.fillRect(zx,py(s.levels.entry*1.0005),(W-AX)-zx,py(s.levels.entry*0.997)-py(s.levels.entry*1.0005));
    x.fillStyle='rgba(90,167,255,.7)';x.font='16px monospace';x.fillText('FVG · DET-041',zx+8,py(s.levels.entry)-8);
    x.fillStyle='rgba(47,214,160,.10)';x.fillRect(zx*0.94,py(s.levels.stop*1.007),(W-AX)-zx*0.94,py(s.levels.stop*1.001)-py(s.levels.stop*1.007));
    x.fillStyle='rgba(47,214,160,.7)';x.fillText('OB · DET-052',zx*0.94+8,py(s.levels.stop*1.004)+22)}
  data.forEach((c,i)=>{const X=i*cw,up=c.c>=c.o;
    x.strokeStyle=up?'rgba(47,214,160,.85)':'rgba(242,99,124,.85)';x.beginPath();x.moveTo(X+cw/2,py(c.h));x.lineTo(X+cw/2,py(c.l));x.stroke();
    x.fillStyle=up?'rgba(47,214,160,.85)':'rgba(242,99,124,.85)';const y1=py(Math.max(c.o,c.c)),y2=py(Math.min(c.o,c.c));x.fillRect(X+cw*0.18,y1,Math.max(2,cw*0.64),Math.max(2,y2-y1));
    x.fillStyle='rgba(90,167,255,.25)';x.fillRect(X+cw*0.18,H-c.v*H*0.07,Math.max(2,cw*0.64),c.v*H*0.07)});
  if(s&&s.levels&&s.levels.entry&&opts.levels!==false){
    const lv=[['ENTRY',s.levels.entry,'#5AA7FF'],['STOP',s.levels.stop,'#FF4D5F'],['T1',s.levels.t1,'#2FD6A0'],['T2 · 5R',s.levels.t2,'#2FD6A0'],['T3',s.levels.t3,'#2FD6A0']];
    x.font='16px monospace';lv.forEach(([nm,p,col])=>{if(!p)return;const y=py(p);if(y<0||y>H)return;
      x.strokeStyle=col;x.setLineDash([7,5]);x.beginPath();x.moveTo(0,y);x.lineTo(W-AX,y);x.stroke();x.setLineDash([]);
      x.fillStyle=col;x.fillText(nm+' '+p.toFixed(2),10,y-6)})}
})}
function drawBars(cvId,pairs,color){POSTRENDER.push(()=>{const cv=document.getElementById(cvId);if(!cv)return;
  const W=cv.width=cv.clientWidth*2,H=cv.height=(cv.dataset.h||170)*2,x=cv.getContext('2d');
  x.fillStyle='#070B12';x.fillRect(0,0,W,H);const max=Math.max(...pairs.map(p=>p[1]));
  const bw=W/pairs.length;x.font='15px monospace';
  pairs.forEach(([k,v],i)=>{const h=(v/max)*(H*0.62),X=i*bw;
    x.fillStyle=color||'rgba(90,167,255,.55)';x.fillRect(X+bw*0.12,H*0.78-h,bw*0.76,h);
    x.fillStyle='#9FABBF';x.fillText(String(v),X+bw*0.12,H*0.78-h-8);
    x.fillStyle='#67748C';x.save();x.translate(X+bw*0.5,H*0.82);x.rotate(0.5);x.fillText(String(k).slice(0,16),0,8);x.restore()})})}
function drawCalibration(cvId){POSTRENDER.push(()=>{const cv=document.getElementById(cvId);if(!cv)return;
  const W=cv.width=cv.clientWidth*2,H=cv.height=200*2,x=cv.getContext('2d');
  x.fillStyle='#070B12';x.fillRect(0,0,W,H);
  x.strokeStyle='rgba(151,166,192,.25)';x.setLineDash([5,5]);x.beginPath();x.moveTo(W*0.06,H*0.9);x.lineTo(W*0.96,H*0.08);x.stroke();x.setLineDash([]);
  x.strokeStyle='#5AA7FF';x.lineWidth=3;x.beginPath();
  CALIB.forEach(([c,r],i)=>{const X=W*0.06+(c-30)/70*(W*0.9),Y=H*0.9-(r-30)/70*(H*0.82);i?x.lineTo(X,Y):x.moveTo(X,Y)});x.stroke();
  x.fillStyle='#5AA7FF';CALIB.forEach(([c,r])=>{const X=W*0.06+(c-30)/70*(W*0.9),Y=H*0.9-(r-30)/70*(H*0.82);x.beginPath();x.arc(X,Y,5,0,7);x.fill()});
  x.fillStyle='#67748C';x.font='16px monospace';x.fillText('stated confidence → realized hit-rate · diagonal = perfect calibration',W*0.06,H*0.97)})}
function drawEquityCurve(cvId,seedKey,base){POSTRENDER.push(()=>{const cv=document.getElementById(cvId);if(!cv)return;
  const W=cv.width=cv.clientWidth*2,H=cv.height=(cv.dataset.h||190)*2,x=cv.getContext('2d');
  const r=localRng('eq-'+seedKey);let eq=base,pts=[];for(let i=0;i<130;i++){eq*=(1+(r()-0.46)*0.012);pts.push(eq)}
  const lo=Math.min(...pts)*0.99,hi=Math.max(...pts)*1.01;
  x.fillStyle='#070B12';x.fillRect(0,0,W,H);
  x.strokeStyle='rgba(151,166,192,.15)';x.setLineDash([4,5]);const by=H-((base-lo)/(hi-lo))*H*0.86-H*0.06;x.beginPath();x.moveTo(0,by);x.lineTo(W,by);x.stroke();x.setLineDash([]);
  const grd=x.createLinearGradient(0,0,0,H);grd.addColorStop(0,'rgba(47,214,160,.22)');grd.addColorStop(1,'rgba(47,214,160,0)');
  x.beginPath();pts.forEach((p,i)=>{const X=i/(pts.length-1)*W,Y=H-((p-lo)/(hi-lo))*H*0.86-H*0.06;i?x.lineTo(X,Y):x.moveTo(X,Y)});
  x.strokeStyle='#2FD6A0';x.lineWidth=2.5;x.stroke();x.lineTo(W,H);x.lineTo(0,H);x.closePath();x.fillStyle=grd;x.fill();
  const last=pts[pts.length-1];x.fillStyle='#2FD6A0';x.beginPath();x.arc(W-4,H-((last-lo)/(hi-lo))*H*0.86-H*0.06,6,0,7);x.fill()})}

/* ═══════════ COMMAND · cockpit — "What needs me right now?" ═══════════ */
VIEWS['command.cockpit']=function(){
  const q=PACKETS.filter(p=>p.state==='READY_FOR_HUMAN');
  const blocked=PACKETS.filter(p=>p.state==='RISK_BLOCKED');
  const managing=POSITIONS.filter(p=>p.fsm==='MANAGING'||p.fsm==='SCALING'||p.fsm==='WORKING');
  const amend=AMENDMENTS.filter(a=>a.st==='PENDING');
  /* next best action — one, ranked */
  let nba;
  if(S.kill)nba={k:'DESK HALTED',t:'Resume the desk when the reason for the halt is resolved',s:'Kill switch active — every order path is locked. Open positions were untouched.',go:CMD.btn('desk.resume',null,'gold','RESUME DESK')};
  else if(q.length)nba={k:'DECISION REQUIRED',t:q[0].id+' · '+q[0].sym+' '+q[0].dir+' · '+q[0].playbook+' · grade '+q[0].grade,s:'19/19 sections · '+voteSummary(q[0].votes)+' · TTL '+fmtTTL(q[0])+' — after that the evidence is stale by law (GOV-021).',go:CMD.btn('nav.decisions.packet',q[0].id,'gold','JUDGE THE PACKET')};
  else if(amend.length)nba={k:'AMENDMENT PENDING',t:amend[0].id+' · '+amend[0].ask,s:amend[0].why,go:CMD.btn('nav.portfolio.positions',null,'pri','REVIEW AMENDMENT')};
  else if(managing.length)nba={k:'MANAGE',t:managing[0].sym+' — '+managing[0].nextAction,s:'Positions run the approved template FSM. The desk asks you only at envelope edges.',go:CMD.btn('nav.portfolio.positions',null,'pri','OPEN POSITIONS')};
  else nba={k:'ALL CLEAR',t:'No decision pending — the funnel is working for you',s:FUNNEL[0].v.toLocaleString()+' symbols under heartbeat · '+FUNNEL[4].v+' in committee · next packet will page P1.',go:CMD.btn('nav.markets.scanner',null,'','OPEN SCANNER')};
  let h=vhead('COMMAND · the daily operating cockpit','What needs me right now?',
    'One dominant action, always. Everything else on this screen is a summary that deep-links to its owning domain — full tables live there, not here.');
  h+='<div class="nba"><div><div class="nk">'+nba.k+'</div><div class="nt">'+U.esc(nba.t)+'</div><div class="ns">'+nba.s+'</div></div><div class="ngo">'+nba.go+'</div></div>';
  /* strip: regime · session · risk capacity */
  h+='<div class="grid g4">'+
    stat('Regime','<span style="font-size:13px">'+REGIME.label+'</span>',REGIME.breadth+' · VIX '+REGIME.vix)+
    stat('Session',CLOCK.phase(),(CLOCK.killzone()||'outside killzones')+' · '+CLOCK.hm()+' ET')+
    stat('Open risk',U.fmt(S.openRiskR,2)+'R <span class="i2" style="font-size:11px">/ '+ck('risk.max_open_risk_R')+'R</span>','headroom '+U.fmt(ck('risk.max_open_risk_R')-S.openRiskR,2)+'R '+prov('risk.max_open_risk_R'))+
    stat('Day P&L · paper','<span class="'+(S.dayPnl>=0?'up':'dn')+'">'+U.money(S.dayPnl)+'</span>','breaker '+U.fmt(S.dayLossUsedR,1)+'R of '+ck('risk.max_day_loss_R')+'R used '+prov('risk.max_day_loss_R'))+
  '</div>';
  h+=panel('EXECUTIVE BRIEF — the four things (E4 doctrine)','best setup · hidden risk · most important rejection · next human action',
    '<div class="grid g4">'+
    stat('Best setup','NVDA MMBM','packet live · grade A- · 5.00R @ T2')+
    stat('Highest hidden risk','Semis correlation','NVDA open + AMD pending = ONE bet at 0.84 (RISK-041)')+
    stat('Most important rejection','TSLA short','4.2R < 5R — the floor held. Shadow-tracked.')+
    stat('Next human action',q.length?'Judge '+q[0].id:'None — funnel working','see the action bar above')+'</div>');
  h+='<div class="grid g2" style="margin-top:12px">';
  /* left: decisions awaiting + blockers */
  h+='<div class="stack">';
  h+=panel('AWAITING YOUR JUDGMENT','LAW-007 — no human, no live trade',
    q.length?q.map(p=>'<div class="kv" style="cursor:pointer" data-cmd="nav.decisions.packet" data-arg="'+p.id+'"><span class="k">'+p.id+'</span><span class="v"><b>'+p.sym+' '+p.dir+'</b> · '+p.playbook+' · '+p.grade+' · '+voteSummary(p.votes)+' · <span class="mono" style="color:var(--live)">TTL '+fmtTTL(p)+'</span></span></div>').join(''):'<div class="empty"><div class="e1">QUEUE CLEAR</div>Nothing needs your judgment. Rejection is the system’s default state.</div>',
    {head:CMD.btn('nav.decisions.queue',null,'sm','Full queue')});
  h+=panel('HARD BLOCKERS & STALE DEPENDENCIES','fail-closed, named, and owned',
    (blocked.length?blocked.map(p=>'<div class="blocker" style="cursor:pointer" data-cmd="nav.decisions.packet" data-arg="'+p.id+'"><span class="bi">⛔</span><div><b>'+p.id+' '+p.sym+'</b> — '+p.votes.filter(v=>v.verdict==='block').map(v=>U.esc(v.hard.join(' · '))).join(' · ')+'<div class="i2" style="font-size:10.5px;margin-top:2px">'+U.esc(p.dissent[0]?p.dissent[0].note:'')+'</div></div></div>').join(''):'')+
    (S.dataHealth!=='NOMINAL'?'<div class="blocker"><span class="bi">⛔</span><div><b>DATA '+S.dataHealth+'</b> — live approval blocked per LAW-006</div></div>':'')+
    (!blocked.length&&S.dataHealth==='NOMINAL'?'<div class="empty"><div class="e1">NO BLOCKERS</div>All dependencies fresh · no vetoes standing.</div>':''));
  h+='</div>';
  /* right: positions + pipeline */
  h+='<div class="stack">';
  h+=panel('OPEN POSITIONS — required actions','plan-driven; the FSM manages, you supervise',
    managing.length?managing.map(p=>'<div class="kv" style="cursor:pointer" data-cmd="nav.portfolio.positions"><span class="k">'+p.sym+' '+p.dir+'</span><span class="v">'+lc(p.fsm)+' <span class="mono '+(p.uR>=0?'up':'dn')+'">'+U.R(p.uR)+'</span> · '+U.esc(p.nextAction)+'</span></div>').join(''):'<div class="empty"><div class="e1">FLAT</div>No open positions.</div>',
    {head:CMD.btn('nav.portfolio.positions',null,'sm','Portfolio')});
  h+=panel('PIPELINE NOW','deterministic funnel → bounded committee → human',
    '<div class="funnel">'+FUNNEL.map((f,i)=>'<div class="fstage'+(i===FUNNEL.length-1&&q.length?' hot':'')+'"><div class="fk">'+f.k+'</div><div class="fv">'+f.v.toLocaleString()+'</div><div class="fd">'+f.pct+'</div></div>').join('')+'</div>'+
    '<div class="i2" style="font-size:10.5px;margin-top:8px">Early rejection is the economics: 93%+ of compute never leaves the deterministic stages. '+prov('scan.universe_cycle_s')+'</div>',
    {head:CMD.btn('nav.markets.scanner',null,'sm','Scanner')});
  h+=panel('CRITICAL ALERTS','P0 pages · P1 acts today',
    ALERTS.filter(a=>a.cls==='P0'||a.cls==='P1').slice(0,4).map(a=>'<div class="kv"'+(a.route?' style="cursor:pointer" data-cmd="nav.'+a.route+'"'+(a.arg?' data-arg="'+a.arg+'"':''):'')+'><span class="k">'+a.t+'</span><span class="v">'+chip(a.cls,a.cls==='P0'?'ch-blk':'ch-live',a.cls==='P0'?'⛔':'●')+' '+U.esc(a.msg)+'</span></div>').join('')||'<div class="empty">No critical alerts.</div>',
    {head:'<button class="btn sm" data-cmd="ui.alerts">Inbox</button>'});
  h+='</div></div>';
  h+='<div class="banner info" style="margin-top:2px"><span class="bico">◈</span><div><b>Prime directive:</b> Do not predict. Classify context. Wait for manipulation. Require confirmation. Define risk. Manage the trade. Learn from outcome. <button class="btn sm gold" data-cmd="onboard" style="margin-left:8px">View the discipline contract</button> <button class="btn sm pri" data-cmd="ui.copilot">◈ Ask the copilot (⌘J)</button></div></div>';
  return h;
};

/* ═══════════ MARKETS ═══════════ */
VIEWS['markets.regime']=function(){
  let h=vhead('MARKETS · opportunity environment','Regime & Macro',
    'The regime outranks single-name enthusiasm (authority hierarchy). Extreme readings outrank HTF context.');
  h+='<div class="grid g4">'+
    stat('Regime','<span style="font-size:13px">'+REGIME.label+'</span>','S08 · 10m cadence')+
    stat('Breadth',REGIME.breadth,'advancers on primary tape')+
    stat('VIX','14.21 <span class="dn" style="font-size:11px">−2.1%</span>','drifting lower — supports risk')+
    stat('Posture','<span style="font-size:12px">LONG LEADERS</span>','counter-regime shorts → paper tier')+'</div>';
  h+='<div class="grid g2" style="margin-top:12px">';
  h+=panel('INDEX TAPE','demo twins · watermarked synthetic',
    tbl(['Instrument','>Last','>Chg'],TAPE.map(([k,v,c])=>'<tr><td class="mono">'+k+'</td><td class="r num">'+U.fmt(v,2)+'</td><td class="r num '+(c>=0?'up':'dn')+'">'+U.pct(c,2)+'</td></tr>').join(''))+'<div style="padding:8px 12px 4px"><span class="demo-wm">demo data</span></div>',{flush:true});
  h+=panel('BAROMETER — the position ledger, ambient','DET-LEDGER positions 1–4 · divergence alarm wired to Command P1',barometerStrip());
  h+=panel('MARKET INTERNALS','the tape under the tape · <span class="demo-wm">demo</span>',
    '<div class="grid g4">'+stat('ADV / DEC','382 : 118','2.1:1 — healthy participation')+stat('TRIN (Arms)','0.82','buying pressure confirmed')+stat('Up / Down vol','71% / 29%','effort agrees with breadth')+stat('New highs / lows','142 / 38','expansion, not churn')+
    stat('US 10Y','4.18% <span class="dn" style="font-size:10px">−3bp</span>','duration tailwind')+stat('DXY','103.4 <span class="dn" style="font-size:10px">−0.1%</span>','dollar neutral')+stat('Regime score','72 / 100','risk-on, not euphoric')+stat('Doctrine','<span style="font-size:11px">LONG LEADERS</span>','chop = scalp extremes only · event-risk = stand aside')+'</div>');
  h+=panel('SECTOR ROTATION QUILT','where leadership actually lives today · <span class="demo-wm">demo</span>',sectorQuilt());
  h+=panel('WHAT THE REGIME PERMITS','rendered from S08 output — not vibes',
    REGIME.supports.map(s=>'<div class="kv"><span class="k up">SUPPORTS</span><span class="v">'+s+'</span></div>').join('')+
    REGIME.cautions.map(s=>'<div class="kv"><span class="k" style="color:var(--warn)">CAUTION</span><span class="v">'+s+'</span></div>').join('')+
    kv('HIERARCHY','<span class="i1" style="font-size:11px">'+HIERARCHY+'</span>'));
  h+='</div>';
  h+=panel('SCENARIO MEMORY — playbook × regime expectancy','1.28M scenario replays; the desk trades only cells that survive',
    tbl(SCENARIO.grid[0].map((c,i)=>i?'>'+c:'Playbook'),SCENARIO.grid.slice(1).map(r=>'<tr><td>'+r[0]+'</td>'+r.slice(1).map(x=>'<td class="r num '+(x.startsWith('−')||x.startsWith('-')?'dn':'up')+'">'+x+'</td>').join('')+'</tr>').join(''))+
    '<div class="banner blk" style="margin:10px 12px"><span class="bico">⛔</span><div><b>Standing prohibition:</b> '+SCENARIO.ban+'</div></div>',{flush:true});
  h+=panel('MORNING BRIEF — 08:30 ET · S07 Daily Setup Report','regime, ranked setups, landmines, and what the desk learned overnight',
    '<div class="grid g2"><div>'+
    kv('POSTURE','Risk-on rotation · long leaders in leading sectors · counter-regime shorts capped at paper')+
    kv('RANKED A-CLASS','1. NVDA MMBM Reversal (packet live) · 2. TSLA OTE Continuation (armed, needs MSS)')+
    kv('WATCH-CLASS','AMD Breaker Retest (contract-blocked, re-run 11:00) · QQQ PD Rotation (bias unresolved)')+
    '</div><div>'+
    kv('LANDMINES','FOMC minutes 14:00 (scalp time-stop 13:45) · CPI T+2d arms blackout T+1d')+
    kv('OVERNIGHT LEARNING','LS-121 A/B 14/30 samples · golden-packet regression 48/48 on v13.2')+
    kv('COST OF FIRM','≈$41/day LLM tiered+cached · scan economics: 93%+ rejected before any model call')+
    '</div></div>');
  return h;
};
VIEWS['markets.scanner']=function(){
  let h=vhead('MARKETS · deterministic universe funnel','Scanner Funnel',
    'Cheap deterministic code sweeps everything; expensive committee attention is earned, never sprayed. Every promotion AND rejection has a named reason.');
  h+='<div class="funnel" style="margin-bottom:12px"><div class="fstage"><div class="fk">LISTED · T3</div><div class="fv">7,123</div><div class="fd">daily coverage · EOD deep pass</div></div>'+FUNNEL.map(f=>'<div class="fstage"><div class="fk">'+f.k+'</div><div class="fv">'+f.v.toLocaleString()+'</div><div class="fd">'+f.pct+' · '+f.d+'</div></div>').join('')+'</div>';
  h+='<div class="banner gold" style="margin-bottom:12px"><span class="bico">◆</span><div><b>The hard invariant:</b> LLM symbol-touches per day are bounded by promotions, never by universe size — caps '+prov('universe.t1_max')+' '+prov('universe.active_watch_max')+' '+prov('universe.promotions_per_day_max')+'. The engine watches 5,000 constantly so the firm only ever thinks about the survivors.</div></div>';
  h+='<div class="grid g2">';
  h+=panel('ACTIVE CANDIDATES','click → full dossier in Research',
    tbl(['Sym','Stage','FSM','Why here (promotion / rejection reason)'],SCANROWS.map(r=>'<tr class="click'+(r.stage==='REJECTED'||r.stage==='ELIGIBILITY'?' dim':'')+'" data-cmd="research.open" data-arg="'+r.sym+'"><td class="mono"><b>'+r.sym+'</b></td><td class="mono" style="font-size:10px">'+r.stage+'</td><td>'+lc(r.fsm)+'</td><td class="i1" style="font-size:11px">'+U.esc(r.why)+'</td></tr>').join('')),{flush:true});
  h+=panel('REJECTION ECONOMICS — today','93.1% of compute never leaves the deterministic stages',
    tbl(['Reason','>Count','>Share'],REJECT_ECON.map(([k,n,p])=>'<tr><td>'+k+'</td><td class="r num">'+n.toLocaleString()+'</td><td class="r num i2">'+p+'</td></tr>').join(''))+
    '<div class="i2" style="font-size:10.5px;padding:8px 12px">“AI score” alone never promotes. Structure events, liquidity gates, and playbook criteria do '+prov('LAW-010')+'. Promotion economics: ≈$30/day for the promoted set vs ≈$3k/day if every symbol got full committee attention — the funnel IS the budget.</div>',{flush:true});
  h+='</div>';
  return h;
};
CMD.define({id:'research.open',label:'Open dossier',purpose:'Full symbol workspace in Research',audit:false,run:a=>{
  if(!symBy(a)){UI.toast(a+' is heartbeat-tier — not promoted. Deep dossiers are earned by evidence, not clicks (promotion rules in Scanner).','','FUNNEL');return}
  S.sym=a;go('research','overview')}});
VIEWS['markets.watch']=function(){
  let h=vhead('MARKETS · promoted watchlist','Watchlist',
    'Only promoted symbols. Each row states its playbook, lifecycle stage, and exactly what remains unmet — nothing is ambiguous about why it hasn’t triggered.');
  h+=panel('','',tbl(['Sym','>Last','>Chg','>RVOL','>RS','>IVR','Playbook','Lifecycle','Unmet conditions (verbatim from playbook FSM)'],
    SYMS.map(s=>'<tr class="click" data-cmd="research.open" data-arg="'+s.sym+'"><td class="mono"><b>'+s.sym+'</b></td><td class="r num">'+U.fmt(s.px)+'</td><td class="r num '+(s.chg>=0?'up':'dn')+'">'+U.pct(s.chg)+'</td><td class="r num">'+U.fmt(s.rvol,1)+'×</td><td class="r num">'+s.rs+'</td><td class="r num">'+s.ivr+'</td><td>'+s.setup+'</td><td>'+lc(s.fsm)+'</td><td class="i1" style="font-size:10.5px">'+(s.unmet.length?s.unmet.map(u=>'· '+U.esc(u)).join('<br>'):'<span class="up">all conditions met</span>')+'</td></tr>').join('')),{flush:true});
  h+=panel('FULL COMMAND UNIVERSE — 24 instruments','deterministic heartbeat tier; promotion is earned by evidence, never by attention',
    tbl(['Sym','Sector','>Last','>Chg','>RVOL','>RS','Playbook lens','Lifecycle'],
      UNIVERSE24.map(u=>'<tr class="click'+(symBy(u.sym)?'':' dim')+'" data-cmd="research.open" data-arg="'+u.sym+'"><td class="mono"><b>'+u.sym+'</b></td><td class="i2" style="font-size:10px">'+u.sector+'</td><td class="r num">'+U.fmt(u.px)+'</td><td class="r num '+(u.chg>=0?'up':'dn')+'">'+U.pct(u.chg)+'</td><td class="r num">'+U.fmt(u.rvol,1)+'×</td><td class="r num">'+u.rs+'</td><td class="i1" style="font-size:10.5px">'+u.setup+'</td><td>'+lc(u.fsm)+'</td></tr>').join('')),{flush:true});
  return h;
};
VIEWS['markets.calendar']=function(){
  let h=vhead('MARKETS · event risk','Calendar & Events','Event blackouts are enforced, not advisory (LAW-017). '+prov('risk.event_window_hrs'));
  h+=panel('','',tbl(['When','Event','Class','Enforcement impact',''],EVENTS.map(e=>'<tr'+(e.block?' style="background:var(--warn-bg)"':'')+'><td class="mono">'+e.t+'</td><td><b>'+e.what+'</b></td><td>'+chip(e.cls,e.cls==='MACRO'?'ch-info':'ch-warn','◆')+'</td><td class="i1">'+U.esc(e.impact)+'</td><td>'+(e.block?chip('BLACKOUT ARMS','ch-blk','⛔'):chip('TRACKED','ch-mut','·'))+'</td></tr>').join('')),{flush:true});
  h+='<div class="grid g2">';
  h+=panel('EARNINGS DETAIL — implied vs history','S19 doctrine: the implied move is a price, not a forecast · <span class="demo-wm">demo</span>',
    tbl(['Sym','Report','>IVR','>Implied ±','>8q realized','S19 read'],[
     ['NVDA','T+21d AMC','41','±6.8%','5.1% avg','Implied rich vs history — sell-the-move structures viable AFTER the window, never through it'],
     ['AMD','T+9d AMC','47','±7.4%','6.2% avg','14DTE contract crosses the event — DTE/event conflict flags at T+7d (LAW-016)'],
     ['TSLA','deliveries T+6d','52','±8.2%','7.7% avg','IV-crush + event-risk window: no new swing exposure into the print; size down if held'],
     ['COIN','T+16d AMC','77','±9.8%','8.9% avg','IVR 77 — premium rich; favor equity exposure over the option (OPT-014)'],
    ].map(r=>'<tr><td class="mono"><b>'+r[0]+'</b></td><td class="mono" style="font-size:10.5px">'+r[1]+'</td><td class="r num">'+r[2]+'</td><td class="r num">'+r[3]+'</td><td class="r num i2">'+r[4]+'</td><td class="i1" style="font-size:10.5px">'+r[5]+'</td></tr>').join('')),{flush:true});
  h+=panel('BLACKOUT ARITHMETIC — when the gate actually closes','the window is computed, not remembered '+prov('risk.event_window_hrs'),
    kv('RULE','No new entries inside '+ck('risk.event_window_hrs')+'h of a binary event (LAW-017). The risk engine computes this — you never have to.')+
    kv('CPI T+2d 08:30','Blackout arms T+1d 08:30 for index-correlated size — SPY spread must be flat or reduced-only by then')+
    kv('NVDA T+21d','Swing eligible until T-1d 16:00 · packet TTLs inside the final week shorten automatically')+
    kv('FOMC minutes 14:00','Not a blackout — a time-stop: scalps flat by 13:45, swings hold with stops honored')+
    kv('WEEK AHEAD','Mon PMI · Wed FOMC minutes ✓today · Thu claims · Fri OPEX — pin risk rises into Friday close'));
  h+='</div>';
  return h;
};
VIEWS['markets.alerts']=function(){
  let h=vhead('MARKETS · alert center','Alert Center','P0 interrupts life · P1 interrupts work · P2 waits ('+ck('alerts.p2_batch_min')+'m batch) · P3 is silent. If everything beeps, nothing is an alarm — a misclassified alert is itself a P2 defect.');
  h+=panel('TAXONOMY — the alert contract','misclassified alerts are themselves P2 defects',
    tbl(['Class','Meaning','Delivery','Repeat rule'],[
     ['P0','Capital or safety, NOW — kill trip · broker reject · past invalidation · token misuse','Pages + takeover · breaks quiet hours','Repeats until acknowledged'],
     ['P1','Decision needed / integrity — packet awaiting, TTL closing, blocked upstream','Once + persistent badge','Re-fires at TTL-5:00'],
     ['P2','Awareness — brief ready, setup armed, drill results','Batched every '+ck('alerts.p2_batch_min')+'m '+prov('alerts.p2_batch_min'),'Never repeats'],
     ['P3','Record — telemetry, cycle stats','Ledger only, silent','—'],
    ].map(r=>'<tr><td>'+chip(r[0],r[0]==='P0'?'ch-blk':r[0]==='P1'?'ch-live':r[0]==='P2'?'ch-info':'ch-mut',r[0]==='P0'?'⛔':'●')+'</td><td class="i1" style="font-size:11px">'+r[1]+'</td><td class="i2" style="font-size:10.5px">'+r[2]+'</td><td class="i2" style="font-size:10.5px">'+r[3]+'</td></tr>').join('')),{flush:true});
  h+=panel('INBOX — every alert with its reading','an alert without an interpretation is noise',
    ALERTS.map((a,i)=>'<div class="kv"><span class="k">'+a.t+'</span><span class="v">'+chip(a.cls,a.cls==='P0'?'ch-blk':a.cls==='P1'?'ch-live':a.cls==='P2'?'ch-info':'ch-mut',a.cls==='P0'?'⛔':'●')+' '+U.esc(a.msg)+
      '<div class="i2" style="font-size:10px;margin-top:2px">ATLAS · '+(a.cls==='P1'?'act inside the TTL or the evidence archives itself':a.cls==='P0'?'this interrupted you on purpose — resolve before anything else':a.cls==='P2'?'awareness only — nothing is asked of you':'recorded for reconstruction')+'</div>'+
      '<span class="btnrow" style="margin-top:4px">'+(a.route?'<button class="btn sm pri" data-cmd="nav.'+a.route+'"'+(a.arg?' data-arg="'+a.arg+'"':'')+'>Open</button>':'')+(a.ackd?'<span class="tag">acknowledged</span>':'<button class="btn sm" data-cmd="alert.ack" data-arg="'+i+'">Acknowledge</button>')+'</span></span></div>').join(''));
  return h;
};
CMD.define({id:'alert.ack',label:'Acknowledge alert',purpose:'Mark handled — P0s stop repeating only through this',run:a=>{const al=ALERTS[+a];if(al){al.ackd=true;SVR.audit('HUMAN (owner)','alert','Acknowledged: '+al.msg.slice(0,60));render()}}});
