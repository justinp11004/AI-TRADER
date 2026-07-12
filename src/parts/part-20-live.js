/* ═══════════ NET · LIVE SPINE adapter — the real transport boundary ═══════════
   backend/atlas-server.mjs is a real zero-dependency Node service: live
   quotes/candles (Stooq → Yahoo, strictly validated), server-side risk law,
   single-use tokens, a hash-chained persistent audit ledger, and an SSE
   tick stream. This adapter is FAIL-CLOSED at every seam:
   · no server → demo adapter, said out loud (never fiction)
   · server in SIM mode → labeled "SIM FEED", never claimed as live
   · feed stale >15s → automatic fall-back to demo, audited
   Authority still flows one way: UI renders verdicts, servers own law. */
const NET={
  on:false, base:null, es:null, health:null, mode:null,
  lastBeat:0, qApplied:0, attested:0, esErrs:0,
  parity:{n:0,match:0,mismatch:0,last:null},
  candles:{}, _inflight:{},
  /* macro tape → real provider tickers (US10Y arrives as ^TNX = yield×10) */
  TAPE_MAP:{'ES':'ES=F','NQ':'NQ=F','VIX':'^VIX','DXY':'DX-Y.NYB','US10Y':'^TNX','CL':'CL=F','GC':'GC=F'},

  symList(){
    const eq=SYMS.map(s=>s.sym+':'+s.px.toFixed(2));
    const mac=TAPE.map(t=>this.TAPE_MAP[t[0]]+':'+t[1]);
    return encodeURIComponent(eq.concat(mac).join(','));
  },
  async get(path,ms){
    const ctl=new AbortController();const to=setTimeout(()=>ctl.abort(),ms||6000);
    try{const res=await fetch(this.base+path,{signal:ctl.signal});
      if(!res.ok)throw new Error('HTTP '+res.status);return await res.json()}
    finally{clearTimeout(to)}
  },
  async post(path,body){
    const res=await fetch(this.base+path,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});
    if(!res.ok)throw new Error('HTTP '+res.status);return await res.json();
  },

  async connect(base){
    this.base=base;
    const h=await this.get('/v1/health',3500);
    if(!h||!h.ok)throw new Error('health not ok');
    this.on=true;this.health=h;this.mode=h.mode;this.lastBeat=Date.now();
    this.qApplied=0;this.attested=0;this.esErrs=0;this.parity={n:0,match:0,mismatch:0,last:null};
    this.candles={};this._inflight={};
    const q=await this.get('/v1/quotes?syms='+this.symList());
    this.applyQuotes(q.quotes,q.mode);
    this.es=new EventSource(this.base+'/v1/stream?syms='+this.symList());
    this.es.addEventListener('hello',ev=>{this.lastBeat=Date.now();this.health=JSON.parse(ev.data)});
    this.es.addEventListener('beat',ev=>{this.lastBeat=Date.now();this.health=JSON.parse(ev.data);this.mode=this.health.mode});
    this.es.addEventListener('quotes',ev=>{const d=JSON.parse(ev.data);this.lastBeat=Date.now();this.applyQuotes(d.quotes,d.mode)});
    this.es.onerror=()=>{this.esErrs++};
    this.fetchCandles(S.sym,CHARTX.tf);
    return h;
  },
  disconnect(reason){
    if(this.es){this.es.close();this.es=null}
    const was=this.on;this.on=false;this.mode=null;
    if(was)SVR.audit('SVR Transport','backend','Backend DISCONNECTED — '+(reason||'operator')+' · demo adapter restored, fail-closed');
    render();
  },

  /* apply a quote batch: real quotes rebase demo plan levels ONCE
     (proportional — R-multiples are scale-invariant), sim quotes continue
     the demo baseline so nothing jumps. Every row keeps its provenance. */
  applyQuotes(quotes,mode){
    this.mode=mode||this.mode;
    SYMS.forEach(s=>{const q=quotes[s.sym];if(!q||!isFinite(q.px))return;
      if(!q.synthetic&&!s._rebased){const f=q.px/s.px;
        if(isFinite(f)&&f>0){if(Math.abs(f-1)>0.02&&s.levels)['stop','entry','t1','t2','t3'].forEach(k=>{if(typeof s.levels[k]==='number')s.levels[k]*=f});
          s._rebased=f;for(const k in _candleCache)delete _candleCache[k];
          SVR.audit('SVR Transport','feed',s.sym+' plan levels rebased ×'+U.fmt(f,4)+' to live price scale — R-multiples unchanged')}}
      s.px=q.px;s.chg=q.chgPct;s._src=q.provider;s._syn=q.synthetic;s._asof=q.asof});
    TAPE.forEach(t=>{const q=quotes[this.TAPE_MAP[t[0]]];if(!q||!isFinite(q.px))return;
      t[1]=t[0]==='US10Y'?q.px/10:q.px;t[2]=q.chgPct});
    this.qApplied++;
    renderTop();
    const key=S.domain+'.'+S.ws;
    if(key==='research.chart'&&!CHARTX.wall){if(typeof cproDraw==='function')cproDraw()}
    else if(NET._LIVEVIEWS[key]&&this.qApplied%2===0)render();
  },
  _LIVEVIEWS:{'command.cockpit':1,'markets.regime':1,'markets.watch':1,'markets.scanner':1,'research.overview':1,'portfolio.positions':1,'portfolio.exposure':1,'portfolio.account':1},

  /* candle service: one master series per sym|tf, sliced per caller */
  candle(sym,n){
    const key=sym+'|'+CHARTX.tf;
    const m=this.candles[key];
    if(!m){this.fetchCandles(sym,CHARTX.tf);return null}
    const out=m.arr.slice(-n);out.live=m.live;return out;
  },
  fetchCandles(sym,tf){
    const key=sym+'|'+tf;
    if(this._inflight[key]||this.candles[key])return;
    this._inflight[key]=true;
    const s=symBy(sym);
    this.get('/v1/candles?sym='+encodeURIComponent(sym)+'&tf='+encodeURIComponent(tf)+'&n=400&px='+(s?s.px.toFixed(2):0),9000)
      .then(d=>{if(!d||!Array.isArray(d.candles)||d.candles.length<20)throw new Error('bad candle payload');
        this.candles[key]={arr:d.candles,live:{provider:d.provider,synthetic:d.synthetic,tf:d.tf,asof:d.asof}};
        delete this._inflight[key];
        if(S.domain==='research'&&S.ws==='chart'){if(CHARTX.wall)render();else if(typeof cproDraw==='function')cproDraw()}
        else if(NET._LIVEVIEWS[S.domain+'.'+S.ws])render()})
      .catch(()=>{delete this._inflight[key]});
  },
  feedLabel(){
    if(!this.on)return null;
    const age=Math.max(0,Math.round((Date.now()-this.lastBeat)/1000));
    return this.mode==='LIVE'?{cls:'ok',txt:'● LIVE FEED · '+age+'s'}:{cls:'warn',txt:'◈ SIM FEED (server) · no live claim'};
  },
};

/* candles(): live master series when connected, demo generator otherwise */
const _demoCandles=candles;
candles=function(sym,n){n=n||96;
  if(NET.on){const arr=NET.candle(sym,n);if(arr)return arr}
  return _demoCandles(sym,n)};

/* ── SVR bridging: local stays authoritative for UI latency; the server
      attests. A verdict mismatch is a P0 — parity breaches are never quiet. ── */
const _svrAudit=SVR.audit.bind(SVR);
SVR.audit=function(actor,kind,msg){
  _svrAudit(actor,kind,msg);
  if(NET.on&&kind!=='telemetry'){const e=SVR.ledger[0];
    NET.post('/v1/audit',{actor,kind,msg}).then(r=>{if(r&&r.ok){e.att=r.entry.h;NET.attested++}}).catch(()=>{})}
};
const _svrRisk=SVR.riskCheck.bind(SVR);
SVR.riskCheck=function(plan){
  const v=_svrRisk(plan);
  if(NET.on){NET.post('/v1/risk/check',{plan,state:{kill:S.kill,riskMode:S.riskMode,equity:S.equity,openRiskR:S.openRiskR,dataHealth:S.dataHealth}})
    .then(sv=>{NET.parity.n++;
      if(sv.verdict===v.verdict)NET.parity.match++;
      else{NET.parity.mismatch++;NET.parity.last='local '+v.verdict+' vs server '+sv.verdict;
        pushAlert('P0','RISK PARITY BREACH — local '+v.verdict+' vs server '+sv.verdict+' · fail toward the stricter verdict','system.integrations');
        _svrAudit('SVR Parity','risk','PARITY MISMATCH — local='+v.verdict+' server='+sv.verdict+' · investigate before any approval')}})
    .catch(()=>{})}
  return v;
};
const _svrIssue=SVR.issueToken.bind(SVR);
SVR.issueToken=function(packetId,planHash,decision){
  const t=_svrIssue(packetId,planHash,decision);
  if(NET.on)NET.post('/v1/token/issue',{packetId,planHash,decision})
    .then(r=>{if(r&&r.ok){t.srvId=r.token.id;NET.attested++;
      _svrAudit('SVR TokenIssuer','token',t.id+' attested server-side as '+r.token.id+' — dual-ledger bound')}}).catch(()=>{});
  return t;
};

/* ── staleness watchdog: a dead feed can never keep painting (LAW-006) ── */
setInterval(()=>{
  if(NET.on&&Date.now()-NET.lastBeat>15000){
    NET.disconnect('feed stale >15s — automatic fail-closed (LAW-006)');
    pushAlert('P1','Live feed went stale — desk fell back to the demo adapter automatically','system.integrations');
    UI.toast('Feed stale >15s — demo adapter restored. Fail-closed is automatic, not optional.','warn','LIVE SPINE');
  }
},5000);

/* ── transport commands (replace the V12 probe-only seam) ── */
CMD.define({id:'backend.connect',label:'Connect backend',
  purpose:'Connect the LIVE SPINE (backend/atlas-server.mjs): health-checked, SSE-streamed, fail-closed. Success flips every data tab to the real feed; failure keeps the demo adapter and says so',
  run:async()=>{
    const inp=$('#api-base');const base=(inp&&inp.value.trim())||'http://127.0.0.1:8000';
    UI.toast('Probing '+base+'/v1/health …','','TRANSPORT');
    try{
      const h=await NET.connect(base);
      SVR.audit('SVR Transport','backend','Backend CONNECTED at '+base+' — '+h.version+' · feed mode '+h.mode+' · ledger head '+h.ledger.head+' · risk law now server-attested');
      UI.toast(h.mode==='LIVE'
        ?'LIVE SPINE connected — real quotes streaming ('+Object.entries(h.providers).filter(([k,v])=>v.ok).map(([k])=>k).join('/')+'). Demo plan levels rebase to live scale.'
        :'Backend connected in SIM mode — market providers unreachable from the server. Every value stays labeled synthetic; nothing claims live.',
        h.mode==='LIVE'?'gold':'warn','LIVE SPINE');
      render();
    }catch(e){
      NET.on=false;if(NET.es){NET.es.close();NET.es=null}
      SVR.audit('SVR Transport','backend','Backend unreachable ('+(e.name==='AbortError'?'timeout':e.message)+') — demo adapter remains active, fail-closed');
      UI.toast('Backend unavailable — demo adapter remains active. No panel renders fiction; that is the point.','warn','FAIL-CLOSED');
    }
  }});
CMD.define({id:'backend.disconnect',label:'Disconnect',
  purpose:'Close the live feed and restore the demo adapter — explicit, audited',
  pre:()=>NET.on?null:'Not connected — the demo adapter is already active',
  run:()=>{NET.disconnect('operator command');UI.toast('Live spine disconnected — demo adapter restored','','TRANSPORT')}});
