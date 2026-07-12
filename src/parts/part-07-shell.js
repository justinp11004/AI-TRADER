/* ═══════════ DOMAINS · exactly seven. Adding one requires an ADR. ═══════════ */
const DOMAINS={
  command:{ico:'◈',label:'COMMAND',key:'1',purpose:'What needs me right now?',
    ws:[{id:'cockpit',label:'Cockpit'}]},
  markets:{ico:'◫',label:'MARKETS',key:'2',purpose:'Where is opportunity forming?',
    ws:[{id:'regime',label:'Regime & Macro'},{id:'scanner',label:'Scanner Funnel'},{id:'watch',label:'Watchlist'},{id:'calendar',label:'Calendar & Events'},{id:'alerts',label:'Alert Center'}]},
  research:{ico:'◉',label:'RESEARCH',key:'3',purpose:'One symbol, every angle — synchronized',
    ws:[{id:'overview',label:'Overview'},{id:'chart',label:'Chart'},{id:'structure',label:'Structure & Liquidity'},{id:'wyckoff',label:'Wyckoff & Volume'},{id:'options',label:'Options & Contract'},{id:'flow',label:'Flow'},{id:'catalysts',label:'Catalysts'},{id:'history',label:'ATLAS History'}]},
  decisions:{ico:'◆',label:'DECISIONS',key:'4',purpose:'Evidence → governed decision',
    ws:[{id:'queue',label:'Verification Queue'},{id:'packet',label:'Packet Detail'},{id:'builder',label:'Trade Builder'},{id:'rail',label:'Committee Rail'},{id:'riskproof',label:'Risk Proof'},{id:'history',label:'Decision History'}]},
  portfolio:{ico:'▤',label:'PORTFOLIO',key:'5',purpose:'How is capital deployed and protected?',
    ws:[{id:'positions',label:'Positions'},{id:'orders',label:'Orders & Fills'},{id:'risk',label:'Risk Cockpit'},{id:'exposure',label:'Exposure'},{id:'account',label:'Paper Account'}]},
  review:{ico:'↻',label:'REVIEW',key:'6',purpose:'Are we getting better, with evidence?',
    ws:[{id:'journal',label:'Journal'},{id:'autopsy',label:'Opportunity Autopsy'},{id:'performance',label:'Performance & Calibration'},{id:'court',label:'Learning Court'},{id:'memory',label:'AI Memory'},{id:'asks',label:'Ask Inbox'},{id:'replay',label:'Replay & Backtest'}]},
  system:{ico:'⚙',label:'SYSTEM',key:'7',purpose:'Who can do what · what happened · is it healthy?',
    ws:[{id:'health',label:'Health & Freshness'},{id:'inbox',label:'Manager Inbox'},{id:'agents',label:'Agent Council'},{id:'knowledge',label:'Knowledge Base'},{id:'config',label:'Config & Laws'},{id:'integrations',label:'Integrations'},{id:'permissions',label:'Permissions'},{id:'audit',label:'Audit Ledger'},{id:'integrity',label:'Integrity Checks'},{id:'autonomy',label:'Autonomy Lab'}]},
};

/* ═══════════ shell renderers ═══════════ */
function renderTop(){
  const q=PACKETS.filter(p=>p.state==='READY_FOR_HUMAN');
  const openPct=U.clamp(S.openRiskR/ck('risk.max_open_risk_R')*100,0,100);
  const dayPct=U.clamp(S.dayLossUsedR/ck('risk.max_day_loss_R')*100,0,100);
  const meterCls=v=>v>=85?'crit':v>=60?'warn':'';
  document.body.classList.toggle('halted',!!S.kill);
  document.body.classList.toggle('mode-live',S.mode.startsWith('LIVE'));
  $('#topbar').innerHTML=
    '<div class="brand"><span class="bdot"></span>ATLAS PRIME</div>'+
    chip(S.mode,'ch-demo','◈')+
    chip('RISK '+S.riskMode,S.riskMode==='NORMAL'?'ch-ok':S.riskMode==='REDUCED'?'ch-warn':'ch-blk',S.riskMode==='NORMAL'?'✓':'!')+
    chip('DATA '+S.dataHealth,S.dataHealth==='NOMINAL'?'ch-ok':'ch-warn',S.dataHealth==='NOMINAL'?'✓':'!')+
    (S.kill?chip('DESK HALTED','ch-blk','⛔'):'')+
    '<div class="tsep"></div>'+
    '<div class="tstat click" data-cmd="nav.portfolio.risk" title="Open-risk capacity → Risk Cockpit"><span class="k">Open risk</span><span class="v">'+U.fmt(S.openRiskR,2)+'R / '+U.fmt(ck('risk.max_open_risk_R'),1)+'R</span><span class="meter"><i class="'+meterCls(openPct)+'" style="width:'+openPct+'%"></i></span></div>'+
    '<div class="tstat click" data-cmd="nav.portfolio.risk" title="Daily loss circuit breaker headroom"><span class="k">Day breaker</span><span class="v">'+U.fmt(S.dayLossUsedR,2)+'R / '+U.fmt(ck('risk.max_day_loss_R'),1)+'R</span><span class="meter"><i class="'+meterCls(dayPct)+'" style="width:'+Math.max(dayPct,2)+'%"></i></span></div>'+
    '<div class="tstat"><span class="k">Day P&L · paper</span><span class="v '+(S.dayPnl>=0?'up':'dn')+'">'+U.money(S.dayPnl)+'</span></div>'+
    '<div class="tstat click" data-cmd="nav.decisions.queue" title="Verification packets awaiting your decision"><span class="k">Awaiting you</span><span class="v" style="color:var(--live)">'+q.length+(q.length?' · '+U.mmss(Math.min(...q.map(p=>p.ttl)))+' min TTL':' · clear')+'</span></div>'+
    '<div class="tright">'+
      (typeof NET!=='undefined'&&NET.on
        ?(NET.mode==='LIVE'
          ?'<span class="demo-wm" style="color:var(--pos);border-color:rgba(47,214,160,.45)" title="LIVE SPINE connected — real market quotes ('+U.esc((SYMS[0]&&SYMS[0]._src)||'provider')+'), streamed over SSE. Orders remain paper/demo — data is live, authority is not.">● live feed · '+Math.max(0,Math.round((Date.now()-NET.lastBeat)/1000))+'s</span>'
          :'<span class="demo-wm" style="color:var(--warn);border-color:rgba(231,182,83,.45)" title="Backend connected but market providers are unreachable from the server — server-side SIM walk. Every value is stamped synthetic; nothing claims live.">◈ sim feed (server) · no live claim</span>')
        :'<span class="demo-wm" title="Every market value on screen is synthetic, generated by seed '+ck('demo.seed')+'. No live feed, no broker, no performance claim.">demo data · seed '+ck('demo.seed')+'</span>')+
      '<button class="btn sm" data-cmd="ui.alerts" title="Alert inbox (P0 pages · P1 acts · P2 batches · P3 logs)">Alerts'+(ALERTS.some(a=>!a.ackd&&a.cls!=='P3')?' <span style="color:var(--live)">●</span>':'')+'</button>'+
      '<button class="btn sm pri" data-cmd="ui.copilot" title="Ask the desk — Ctrl/⌘ J. It will say NO when no is the answer.">◈ Copilot</button>'+
      '<button class="btn sm" data-cmd="ui.palette" title="Jump anywhere — Ctrl/⌘ K">⌘K</button>'+
      '<div id="clockbox"><div class="ph">'+CLOCK.phase()+(CLOCK.killzone()?' · '+CLOCK.killzone():'')+'</div>'+CLOCK.hms()+' ET<div class="meter" style="width:100%;margin-top:2px"><i style="width:'+U.clamp((CLOCK.mins()-570)/(960-570)*100,0,100)+'%;background:var(--info)"></i></div></div>'+
      '<button id="kill" title="Hold 0.7s — locks every order path server-side (GOV kill). Does not flatten."><div class="fill"></div><span>⛔ KILL</span></button>'+
      '<button id="resume" class="btn gold sm" data-cmd="desk.resume">RESUME DESK</button>'+
    '</div>';
  wireKill();
}
function renderRail(){
  const q=PACKETS.filter(p=>p.state==='READY_FOR_HUMAN').length;
  const blockers=PACKETS.filter(p=>p.state==='RISK_BLOCKED').length;
  $('#rail').innerHTML=
    '<div class="dr-mode"><div class="m1">◈ DEMO MODE</div><div class="m2">Synthetic deterministic data. No broker, no live orders, no performance claims. Mode changes are server-gated.</div></div>'+
    Object.entries(DOMAINS).map(([id,d])=>{
      const badge=id==='decisions'&&q?'<span class="dbadge">'+q+'</span>':'<span class="dkey">'+d.key+'</span>';
      const dot=id==='markets'&&blockers?'<span class="ddot" title="Blocked packet upstream"></span>':'';
      return'<button class="dom'+(S.domain===id?' on':'')+'" data-cmd="nav" data-arg="'+id+'" role="link" aria-current="'+(S.domain===id)+'">'+dot+'<span class="dico">'+d.ico+'</span><span class="dlabel">'+d.label+'</span>'+badge+'</button>'+
      '<div class="dr-purpose">'+d.purpose+'</div>';
    }).join('')+
    '<div class="dr-foot">SESSION <b>'+CLOCK.phase()+'</b><br>EQUITY <b>'+U.moneyK(S.equity)+'</b> paper<br>BUILD <b>V14 ESTATE</b> · '+RULES_VERSION+'<br>KEYS <b>1–7</b> domains · <b>⌘K</b> jump<br><b>F</b> focus · <b>?</b> shortcut map</div>';
}
function renderSubnav(){
  const d=DOMAINS[S.domain];
  const counts={queue:()=>PACKETS.filter(p=>p.state==='READY_FOR_HUMAN').length,positions:()=>POSITIONS.filter(p=>p.fsm==='MANAGING'||p.fsm==='SCALING').length,alerts:()=>ALERTS.filter(a=>!a.ackd).length};
  $('#subnav').innerHTML=d.ws.map(w=>{
    const n=counts[w.id]?counts[w.id]():null;
    return'<button class="snav'+(S.ws===w.id?' on':'')+(w.id==='queue'&&n?' attn':'')+'" role="tab" aria-selected="'+(S.ws===w.id)+'" data-cmd="nav.ws" data-arg="'+w.id+'">'+w.label+(n!=null&&n>0?'<span class="cnt">'+n+'</span>':'')+'</button>';
  }).join('')+
  '<span id="crumb">'+d.label+' <b>/</b> '+U.esc((d.ws.find(w=>w.id===S.ws)||d.ws[0]).label)+(S.wsArg?' <b>/</b> '+U.esc(S.wsArg):'')+'</span>';
}
function render(){
  renderTop();renderRail();renderSubnav();
  const d=DOMAINS[S.domain];
  const fn=VIEWS[S.domain+'.'+S.ws]||VIEWS[S.domain+'.'+d.ws[0].id];
  $('#vwrap').innerHTML=fn?fn(S.wsArg):'<div class="empty"><div class="e1">VIEW NOT WIRED</div>'+S.domain+'.'+S.ws+' — this is a build error, report it.</div>';
  (POSTRENDER.splice(0)).forEach(f=>{try{f()}catch(e){console.error('postrender',e)}});
}
const VIEWS={};const POSTRENDER=[];

/* ═══════════ core navigation + chrome commands ═══════════ */
CMD.define({id:'nav',label:'Go to domain',purpose:'Switch primary domain',audit:false,run:a=>go(a)});
CMD.define({id:'nav.ws',label:'Go to workspace',purpose:'Switch workspace tab',audit:false,run:a=>go(S.domain,a)});
['command.cockpit','markets.regime','markets.scanner','markets.watch','markets.alerts','research.overview','research.options','decisions.queue','decisions.packet','decisions.riskproof','portfolio.positions','portfolio.risk','portfolio.exposure','review.journal','review.autopsy','review.court','system.health','system.agents','system.config','system.audit','system.integrity'].forEach(r=>{
  const[dom,ws]=r.split('.');
  CMD.define({id:'nav.'+r,label:'Open '+ws,purpose:'Deep link → '+r,audit:false,run:a=>go(dom,ws,a||null)});
});
CMD.define({id:'ui.palette',label:'Command palette',purpose:'Jump to any screen, symbol, packet, or agent',audit:false,run:()=>Palette.open()});
CMD.define({id:'ui.focus',label:'Focus mode',purpose:'Hide chrome for chart/packet review',audit:false,run:()=>{S.focusmode=!S.focusmode;document.body.classList.toggle('focusmode',S.focusmode);UI.toast(S.focusmode?'Focus mode — press F to exit':'Focus mode off','','VIEW')}});
CMD.define({id:'ui.alerts',label:'Alert inbox',purpose:'P0 pages immediately · P1 acts today · P2 batches '+ck('alerts.p2_batch_min')+'m · P3 logs',audit:false,run:()=>{
  UI.drawer('<div class="dhead"><span class="dt">ALERT INBOX</span><span class="pill">P0 breaks quiet hours · P2 batched '+ck('alerts.p2_batch_min')+'m</span><button class="dx" data-cmd="ui.closeDrawer">ESC</button></div><div class="dbody">'+
    ALERTS.map(a=>'<div class="kv" style="cursor:'+(a.route?'pointer':'default')+'" '+(a.route?'data-cmd="nav.'+a.route+'"'+(a.arg?' data-arg="'+U.esc(a.arg)+'"':''):'')+'><span class="k">'+a.t+'</span><span class="v">'+chip(a.cls,a.cls==='P0'?'ch-blk':a.cls==='P1'?'ch-live':a.cls==='P2'?'ch-info':'ch-mut',a.cls==='P0'?'⛔':'●')+' '+U.esc(a.msg)+'</span></div>').join('')+'</div>');
  ALERTS.forEach(a=>a.ackd=true);renderTop();
}});
CMD.define({id:'ui.closeDrawer',label:'Close',purpose:'Close drawer',audit:false,run:()=>UI.closeDrawer()});
CMD.define({id:'ui.closeModal',label:'Close',purpose:'Close modal',audit:false,run:()=>UI.closeModal()});
CMD.define({id:'desk.resume',label:'Resume desk',purpose:'Clear kill switch — logged, owner-only',
  pre:()=>S.kill?null:'Desk is not halted',
  run:()=>UI.modal('RESUME DESK','<p class="i1" style="line-height:1.6">Clears <span class="mono">kill_switch</span>; risk_mode returns to NORMAL. Open positions were never touched — the kill switch locks <b>new</b> order paths only. This action is logged with identity + surface.</p>',
    '<button class="btn" data-cmd="ui.closeModal">Cancel</button><button class="btn gold" data-cmd="desk.resume.confirm">RESUME</button>')});
CMD.define({id:'desk.resume.confirm',label:'Resume confirmed',purpose:'Finalize resume',run:()=>{S.kill=false;S.killReason='';S.riskMode='NORMAL';SVR.audit('HUMAN (owner)','kill','Kill switch cleared — desk resumed');UI.closeModal();UI.toast('Desk resumed — risk_mode NORMAL','ok','KILL SWITCH');render()}});

/* kill switch — hold-to-arm 700ms, then typed confirm */
let killT=null,killP=0;
function wireKill(){
  const k=$('#kill');if(!k)return;
  const fill=k.querySelector('.fill');
  const reset=()=>{clearInterval(killT);killT=null;killP=0;if(fill)fill.style.transform='scaleX(0)'};
  k.onpointerdown=e=>{e.preventDefault();if(S.kill)return;
    killT=setInterval(()=>{killP+=0.05/0.7;fill.style.transform='scaleX('+Math.min(1,killP)+')';
      if(killP>=1){reset();UI.modal('⛔ HALT THE DESK',
        '<p class="i1" style="line-height:1.65">This does <b>not</b> flatten positions. It sets <span class="mono">kill_switch:true</span> server-side: the execution gateway refuses every new order, all approval tokens invalidate, and a P0 pages the owner. Defensive management (reduce-only) stays available. '+prov('LAW-005')+' '+prov('LAW-011')+'</p><p class="i2" style="margin-top:8px">Kill-switch behavior is tested across every order state before any live promotion.</p>',
        '<button class="btn" data-cmd="ui.closeModal">Cancel</button><button class="btn danger" data-cmd="desk.kill">HALT THE DESK</button>')}},50)};
  k.onpointerup=k.onpointerleave=k.onpointercancel=reset;
}
CMD.define({id:'desk.kill',label:'HALT confirmed',purpose:'Engage kill switch',run:()=>{
  S.kill=true;S.killReason='manual — operator halt';S.riskMode='BLOCKED';
  Object.values(SVR.tokens).forEach(t=>t.used=true);
  SVR.audit('HUMAN (owner)','kill','KILL SWITCH engaged — all order paths locked, open tokens invalidated');
  pushAlert('P0','KILL SWITCH ACTIVE — desk halted by operator','system.audit');
  UI.closeModal();render();
}});

/* ═══════════ command palette ═══════════ */
const Palette={sel:0,items:[],
  open(){const p=$('#palette');p.classList.add('on');$('#scrim').classList.add('on');
    p.innerHTML='<input id="palq" placeholder="Jump to domain, workspace, symbol, packet, agent, law…" autocomplete="off"><div id="pallist"></div>';
    const inp=$('#palq');inp.focus();this.sel=0;
    const paint=()=>{$('#pallist').innerHTML=this.items.map((it,i)=>'<div class="pitem'+(i===this.sel?' sel':'')+'" data-pi="'+i+'"><span class="pk">'+U.esc(it.k)+'</span>'+U.esc(it.label)+'<span class="pgo">↵</span></div>').join('')||'<div class="pitem">No matches</div>';
      $$('#pallist .pitem').forEach(el=>el.onclick=()=>{const i=+el.dataset.pi;if(this.items[i]){this.close();this.items[i].go()}})};
    const build=q=>{q=(q||'').toLowerCase();const out=[];
      Object.entries(DOMAINS).forEach(([id,d])=>d.ws.forEach(w=>{const lbl=d.label+' / '+w.label;if(!q||lbl.toLowerCase().includes(q))out.push({k:d.label,label:w.label+' — '+d.purpose,go:()=>go(id,w.id)})}));
      SYMS.forEach(s=>{if(!q||s.sym.toLowerCase().includes(q))out.push({k:s.sym,label:'Research — '+s.name+' · '+s.setup,go:()=>{S.sym=s.sym;go('research','overview')}})});
      PACKETS.forEach(p=>{if(!q||(p.id+' '+p.sym).toLowerCase().includes(q))out.push({k:p.id,label:'Packet — '+p.sym+' '+p.dir+' · '+p.state,go:()=>go('decisions','packet',p.id)})});
      SEATS.forEach(s=>{if(!q||(s.id+' '+s.nm).toLowerCase().includes(q))out.push({k:s.id,label:'Agent — '+s.nm+' · '+s.cortex,go:()=>go('system','agents',s.id)})});
      LAWS.forEach(([id,t])=>{if(q&&(id.toLowerCase().includes(q)||t.toLowerCase().includes(q)))out.push({k:id,label:t.slice(0,72)+'…',go:()=>go('system','config')})});
      [{k:'⌘J',label:'Copilot — ask the desk (it will say no)',go:()=>CMD.run('ui.copilot')},{k:'CONTRACT',label:'Discipline contract — replay onboarding',go:()=>CMD.run('onboard')}].forEach(x=>{if(!q||x.label.toLowerCase().includes(q))out.push(x)});
      return out.slice(0,14)};
    this.items=build('');paint();
    inp.oninput=()=>{this.items=build(inp.value);this.sel=0;paint()};
    inp.onkeydown=e=>{
      if(e.key==='ArrowDown'){e.preventDefault();this.sel=Math.min(this.items.length-1,this.sel+1);paint()}
      else if(e.key==='ArrowUp'){e.preventDefault();this.sel=Math.max(0,this.sel-1);paint()}
      else if(e.key==='Enter'){const it=this.items[this.sel];if(it){this.close();it.go()}}
      else if(e.key==='Escape')this.close()};
  },
  close(){$('#palette').classList.remove('on');if(!$('#drawer').classList.contains('on'))$('#scrim').classList.remove('on')},
};

/* keyboard map */
document.addEventListener('keydown',e=>{
  if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();Palette.open();return}
  if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='j'){e.preventDefault();CMD.run('ui.copilot');return}
  if(e.target.matches('input,select,textarea'))return;
  if(e.key==='Escape'){UI.closeDrawer();UI.closeModal();Palette.close();return}
  if(S.domain==='decisions'&&S.ws==='packet'&&/^[1-9]$/.test(e.key)){
    const d=ENUMS.DECISIONS[+e.key-1];const p=pktBy(S.packet);
    if(d&&p&&p.state==='READY_FOR_HUMAN'){
      if(d==='APPROVE_LIVE'){UI.toast('APPROVE_LIVE unavailable in DEMO — LIVE_HUMAN_APPROVED mode + fresh token required (LAW-007 · GOV-024)','warn','KEY '+e.key)}
      else CMD.run('pkt.decide',p.id+'|'+d)}
    return}
  const dom=Object.entries(DOMAINS).find(([,d])=>d.key===e.key);
  if(dom){go(dom[0]);return}
  if(e.key.toLowerCase()==='f'){CMD.run('ui.focus');return}
  if(e.key==='?'){UI.modal('KEYBOARD MAP',
    '<div class="kv"><span class="k">1–7</span><span class="v">Switch primary domain</span></div>'+
    '<div class="kv"><span class="k">⌘K / Ctrl K</span><span class="v">Command palette — jump anywhere</span></div>'+
    '<div class="kv"><span class="k">1–9 on Packet</span><span class="v">Fire a decision enum — the desk is keyboard-first (same gates apply)</span></div>'+
    '<div class="kv"><span class="k">⌘J / Ctrl J</span><span class="v">Copilot — ask the desk</span></div>'+
    '<div class="kv"><span class="k">F</span><span class="v">Focus mode (hide chrome)</span></div>'+
    '<div class="kv"><span class="k">ESC</span><span class="v">Close drawer / modal / palette</span></div>'+
    '<div class="kv"><span class="k">?</span><span class="v">This map</span></div>',
    '<button class="btn" data-cmd="ui.closeModal">Close</button>')}
});
