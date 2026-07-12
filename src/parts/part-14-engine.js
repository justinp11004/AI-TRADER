/* ═══════════ ENGINE · demo heartbeat — one loop, no decorator towers ═══════════
   The legacy stacked 13 render wrappers and two competing 1s intervals.
   Here: ONE 2s tick that mutates state, then targeted DOM patches. */
const ENGINE={
  n:0,
  tick(){this.n++;S.tick=this.n;CLOCK.tick();
    /* drift promoted symbols (seeded stream — deterministic session).
       When the LIVE SPINE is connected the real feed owns prices; the
       local generator stands down instead of fighting it. */
    if(typeof NET==='undefined'||!NET.on){
      SYMS.forEach(s=>{const d=(RNG.r()-0.492)*0.0011;s.px*=(1+d);s.chg+=d*100});
      TAPE.forEach(t=>{t[1]*=(1+(RNG.r()-0.5)*0.0006)});
    }
    /* packet TTLs — expiry is a hard transition */
    PACKETS.forEach(p=>{if(p.state==='READY_FOR_HUMAN'||p.state==='RISK_BLOCKED'){p.ttl-=2;
      if(p.ttl===300)pushAlert('P1',p.id+' expires in 5:00 — evidence goes stale (GOV-021)','decisions.packet',p.id);
      if(p.ttl<=0){p.ttl=0;p.state='EXPIRED';SVR.audit('SVR PacketFSM','packet',p.id+' EXPIRED — TTL exceeded, unjudged. Auto-reopen on same-hash fresh trigger is LS-track (AUT-115).');pushAlert('P1',p.id+' EXPIRED unjudged','decisions.queue')}}});
    /* open positions drift */
    if(this.n%3===0)POSITIONS.forEach(p=>{if(p.fsm==='MANAGING')p.uR+=(RNG.r()-0.47)*0.03});
    if(this.n%4===0)S.dayPnl+=(RNG.r()-0.46)*9;
    /* ambient ledger telemetry */
    if(this.n%9===0){const seat=RNG.pick(SEATS.filter(s=>['15s','30s','1m','5m','10m'].includes(s.cad)));
      SVR.audit(seat.id+' '+seat.nm,'telemetry',RNG.pick(['heartbeat OK — lane clean, schema valid','cadence sweep complete — no anomalies','freshness stamp written to consciousness state','universe delta processed — no promotions this cycle']))}
    if(typeof blotterStep==='function')blotterStep(this.n);
    if(S.domain==='system'&&S.ws==='autonomy'&&S.autonomyLab&&this.n%4===0)render();
    /* targeted patches — full render only if user is on a live-updating view */
    renderTop();
    if(S.domain==='decisions'){const el=document.getElementById('pk-ttl');if(el){const p=pktBy(S.packet);if(p)el.textContent=fmtTTL(p)}}
    if((S.domain==='markets'&&(S.ws==='regime'||S.ws==='watch'))&&this.n%6===0)render();
    if(S.domain==='system'&&S.ws==='audit'&&this.n%9===0)render();
  },
  start(){setInterval(()=>{try{this.tick()}catch(e){console.error('tick',e)}},2000)},
};

/* ═══════════ BOOT ═══════════ */
(function boot(){
  document.title='ATLAS Prime — Decision OS · DEMO';
  render();
  INTEGRITY.run();
  BOOTTEST.run();
  ENGINE.start();
  setTimeout(()=>UI.toast('DEMO session — seeded, deterministic (seed '+ck('demo.seed')+'). Synthetic data, no broker, no live claims. Press ? for keys, ⌘K to jump.','','ATLAS PRIME V11'),500);
  SVR.audit('SYSTEM','boot','ATLAS Prime V11 booted — 7 domains · '+Object.keys(VIEWS).length+' workspaces · '+Object.keys(CMD.reg).length+' registered commands · integrity '+INTEGRITY.results.pass+'/'+INTEGRITY.results.total);
})();
