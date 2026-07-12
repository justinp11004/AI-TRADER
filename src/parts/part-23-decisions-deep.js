/* ═══════════ V14 · DECISIONS DEEP — Sizing Lab + Pre-Mortem Engine ═══════════
   Two instruments the desk was missing between "packet arrives" and "enum fires":
   1) decisions.sizing   — the sizing formula opened up as a laboratory bench:
      every term live, every constraint named, Kelly as a cautionary exhibit.
   2) decisions.premortem — assume the active packet already died; work the
      causes backwards into monitors, tripwires and pre-committed responses.
   Contract: pure JS · no network · localRng only · every control CMD-registered. */

DOMAINS.decisions.ws.push({id:'sizing',label:'Sizing Lab'});
DOMAINS.decisions.ws.push({id:'premortem',label:'Pre-Mortem'});

/* ── module state (all mutations audited where they matter) ── */
const DECD_TIERS=[
 {t:'B', m:0.50, note:'paper-only tier — a B idea never touches live capital regardless of size'},
 {t:'A', m:0.75, note:'standard conviction — the workhorse tier'},
 {t:'A+',m:1.00, note:'full formula. There is no tier above this — conviction never multiplies UP'},
];
const DECD_SIZE={
  riskPct:0.60,                                  // desk default per MEM-01 (0.6%), ceiling is config
  stopd:(PACKETS[0]&&PACKETS[0].rmath.riskPer)||2.70,
  conv:1,                                        // index into DECD_TIERS — default tier A
  kelly:null,                                    // playbook name for the Kelly explorer (lazy init)
};
const DECD_LADDER={rung:0,streak:0,cool:false,log:[]};
const DECD_PM={pkt:null,filedAt:null,acks:{'stop-is-real':false,'size-is-set':false,'modes-read':false}};
const DECD_DDCACHE={};

/* ── helpers ── */
function DECD_pkt(){return pktBy(S.packet)||PACKETS[0]||null}
function DECD_vote(p,seat){return p&&p.votes?p.votes.find(v=>v.seat===seat)||null:null}
function DECD_pktDelta(p){
  /* delta assumption is READ from the packet's own S22 vote text, not invented.
     If the packet never states one, fall back to 0.50 and say so. */
  const v=DECD_vote(p,'S22');
  if(v){const m=v.txt.match(/delta\s*\.(\d+)/i);if(m)return{d:parseFloat('0.'+m[1]),src:'S22 vote on '+p.id}}
  return{d:0.50,src:'fallback assumption — packet states no delta'};
}
function DECD_mx(p){
  const r=p.rmath,s=symBy(p.sym),dir=p.dir==='LONG'?1:-1;
  const risk=Math.abs(r.entry-r.stop)||1e-9,px=s?s.px:r.entry;
  return{r,s,dir,risk,px,unmet:(s&&s.unmet)||[],ttlMax:ck('packet.ttl_min')*60};
}
function DECD_trip(p,k){
  /* tripwire level derived from rmath: entry minus k×risk in the trade direction */
  const m=DECD_mx(p),lvl=m.r.entry-m.dir*k*m.risk;
  return{lvl,txt:U.fmt(m.r.entry)+' '+(m.dir>0?'−':'+')+' '+k+'×'+U.fmt(m.risk)+' = '+U.fmt(lvl)};
}

/* ── sizing engine — size = (equity × risk% × conviction) ÷ stop-distance ── */
function DECD_clusterNow(){const p=DECD_pkt();return p&&p.rmath.sectorPct!=null?p.rmath.sectorPct:0}
function DECD_sizeCalc(){
  const t=DECD_TIERS[DECD_SIZE.conv]||DECD_TIERS[1];
  const effPct=DECD_SIZE.riskPct*t.m;
  const reqUSD=S.equity*effPct/100;
  const oneR=S.equity*0.01;                       // builder parity: 1R ≡ 1% of equity
  const caps=[
   {id:'REQUEST',   nm:'Your request',        usd:reqUSD,prov:null,
    read:U.fmt(DECD_SIZE.riskPct,2)+'% × '+t.t+' tier '+U.fmt(t.m,2)+'× = '+U.fmt(effPct,2)+'% of equity'},
   {id:'PER-TRADE', nm:'Per-trade cap',       usd:S.equity*ck('risk.max_trade_risk_pct')/100,prov:'risk.max_trade_risk_pct',
    read:ck('risk.max_trade_risk_pct')+'% hard ceiling — a ceiling, never a target'},
   {id:'OPEN-RISK', nm:'Open-risk headroom',  usd:Math.max(0,ck('risk.max_open_risk_R')-S.openRiskR)*oneR,prov:'risk.max_open_risk_R',
    read:U.fmt(S.openRiskR,2)+'R already deployed of '+ck('risk.max_open_risk_R')+'R — headroom '+U.fmt(Math.max(0,ck('risk.max_open_risk_R')-S.openRiskR),2)+'R'},
   {id:'CLUSTER',   nm:'Cluster-cap headroom',usd:Math.max(0,ck('risk.max_sector_exposure')-DECD_clusterNow())*S.equity/100,prov:'risk.max_sector_exposure',
    read:U.fmt(DECD_clusterNow(),1)+'% correlated exposure standing of '+ck('risk.max_sector_exposure')+'% — correlated risk counts as ONE bet'},
   {id:'DAY-BREAKER',nm:'Day-breaker headroom',usd:Math.max(0,ck('risk.max_day_loss_R')-S.dayLossUsedR)*oneR,prov:'risk.max_day_loss_R',
    read:U.fmt(S.dayLossUsedR,2)+'R of the '+ck('risk.max_day_loss_R')+'R daily circuit used — one trade may never be able to blow the day'},
  ];
  const grant=Math.min.apply(null,caps.map(c=>c.usd));
  const binder=caps.slice().sort((a,b)=>a.usd-b.usd)[0];
  const stopd=Math.max(0.01,DECD_SIZE.stopd);
  const shares=Math.floor(grant/stopd);
  const ctCons=Math.floor(grant/(stopd*100));
  const del=DECD_pktDelta(DECD_pkt()||{});
  const ctDelta=Math.floor(shares/(del.d*100));
  return{t,effPct,reqUSD,caps,grant,binder,stopd,shares,ctCons,ctDelta,del,oneR};
}
function DECD_sizeOutHTML(){
  const c=DECD_sizeCalc();
  let h='<div class="banner '+(c.binder.id==='REQUEST'?'info':'warn')+'" style="margin-bottom:8px"><span class="bico">'+(c.binder.id==='REQUEST'?'◈':'!')+'</span><div>'+
   (c.binder.id==='REQUEST'
    ?'<b>No cap binds — your request is the constraint.</b> Every governor sits above the ask; the formula itself is doing the limiting, which is the healthy state.'
    :'<b>BINDING CONSTRAINT: '+c.binder.nm+'</b> '+(c.binder.prov?prov(c.binder.prov):'')+' — the request of '+U.money(c.reqUSD)+' is cut to '+U.money(c.binder.usd)+'. '+U.esc(c.binder.read))+'</div></div>';
  h+=tbl(['Constraint','>Allows ($ risk)','Reading',''],c.caps.map(x=>
   '<tr'+(x.id===c.binder.id&&c.binder.id!=='REQUEST'?' style="background:var(--warn-bg)"':'')+'>'+
   '<td class="mono" style="font-size:10.5px"><b>'+x.id+'</b>'+(x.prov?' '+prov(x.prov):'')+'</td>'+
   '<td class="r num">'+U.money(x.usd)+'</td>'+
   '<td class="i1" style="font-size:10.5px">'+U.esc(x.read)+'</td>'+
   '<td>'+(x.id===c.binder.id?chip('BINDS',c.binder.id==='REQUEST'?'ch-info':'ch-warn','◆'):'<span class="i2" style="font-size:10px">clear</span>')+'</td></tr>').join(''));
  h+='<div class="rproof" style="margin-top:8px">'+
   '<div class="rrow"><span class="lab">Granted risk</span><span class="mono">'+U.money(c.grant)+' = '+U.fmt(c.grant/S.equity*100,2)+'% equity</span></div>'+
   '<div class="rrow"><span class="lab">÷ stop-distance '+U.fmt(c.stopd,2)+'</span><span class="mono"><b>'+U.int(c.shares)+' shares</b></span></div>'+
   '<div class="rrow"><span class="lab">Contracts · conservative road ('+U.money(c.stopd*100)+'/ct = stop×100)</span><span class="mono"><b>'+c.ctCons+' ct</b></span></div>'+
   '<div class="rrow"><span class="lab">Contracts · delta road ('+U.int(c.shares)+' sh ÷ '+U.fmt(c.del.d,2)+'×100 sh/ct · delta from '+U.esc(c.del.src)+')</span><span class="mono">'+c.ctDelta+' ct</span></div></div>';
  if(c.t.t==='B')h+='<div style="margin-top:8px">'+chip('PAPER-ONLY TIER','ch-demo','◈')+' <span class="i2" style="font-size:10.5px">B-conviction never routes live regardless of size '+prov('LAW-009')+'</span></div>';
  if(DECD_LADDER.cool)h+='<div class="banner blk" style="margin-top:8px"><span class="bico">⛔</span><div><b>Ladder-sim cooldown is ARMED (2 reds).</b> In production this console would refuse new size until the cooldown clears — rendered here because the lab reads the sim state '+prov('MM-004','MM-004 — money-management doctrine: risk steps down after losses; 2-loss cooldown arms at rung 2')+'</div></div>';
  h+='<div class="i2" style="font-size:10.5px;margin-top:8px">R convention: builder parity — 1R ≡ 1% of equity = '+U.money(c.oneR)+'. Sizes round DOWN, never up (the fraction you cannot afford is the fraction you do not take). The prior trade’s outcome is absent from every term above by construction '+prov('LAW-012')+'.</div>';
  return h;
}
function DECD_sizePatch(){
  /* targeted DOM patch — spec: no full render on input */
  const o=document.getElementById('size-out');if(o)o.innerHTML=DECD_sizeOutHTML();
  const rv=document.getElementById('decd-riskv');if(rv)rv.textContent=U.fmt(DECD_SIZE.riskPct,2)+'%';
  const sv=document.getElementById('decd-stopv');if(sv)sv.textContent='$'+U.fmt(DECD_SIZE.stopd,2);
  const cv2=document.getElementById('decd-convv');if(cv2){const t=DECD_TIERS[DECD_SIZE.conv];cv2.textContent=t.t+' · '+U.fmt(t.m,2)+'×'}
}

/* ── Kelly explorer — from the BT register, with the estimation-error caveat in lights ── */
function DECD_kellyPB(){
  if(!DECD_SIZE.kelly){const p=DECD_pkt();DECD_SIZE.kelly=(p&&p.playbook)||PLAYBOOKS[0].nm}
  return PLAYBOOKS.find(x=>x.nm===DECD_SIZE.kelly)||PLAYBOOKS[0];
}
function DECD_kellyStats(pb){
  /* loss normalized to −1R (stops are law); payoff b derived so the register's
     expectancy reconciles: exp = p·b − q  →  b = (exp + q) ÷ p */
  const p=parseFloat(pb.bt.win)/100,q=1-p,exp=parseFloat(pb.bt.exp);
  const b=(exp+q)/p;
  const f=Math.max(0,(b*p-q)/b);
  return{p,q,b,f,exp,n:pb.bt.n,id:pb.bt.id};
}
function DECD_ddSim(p,b,f,seed){
  /* deterministic 200-path × 120-trade drawdown study — localRng, replayable */
  const key=seed+'|'+f.toFixed(4);
  if(DECD_DDCACHE[key])return DECD_DDCACHE[key];
  const r=localRng(key),dds=[];let ruin=0;
  for(let k=0;k<200;k++){
    let eq=1,peak=1,mdd=0;
    for(let t=0;t<120;t++){
      eq*=(r()<p)?(1+f*b):(1-f);
      if(eq>peak)peak=eq;
      const dd=1-eq/peak;if(dd>mdd)mdd=dd;
    }
    dds.push(mdd);if(mdd>=0.5)ruin++;
  }
  dds.sort((a,b2)=>a-b2);
  const out={med:dds[100],p95:dds[190],ruin:ruin/200};
  DECD_DDCACHE[key]=out;return out;
}
function DECD_drawKelly(ks){
  POSTRENDER.push(()=>{
    const cv=document.getElementById('decd-cv-kelly');if(!cv)return;
    const W=cv.width=cv.clientWidth*2,H=cv.height=250*2,x=cv.getContext('2d');if(W<20)return;
    x.fillStyle='#070B12';x.fillRect(0,0,W,H);
    const fmax=Math.min(0.95,ks.f*1.9+0.02);
    const g=f=>ks.p*Math.log(1+ks.b*f)+ks.q*Math.log(1-Math.min(f,0.999));
    const N=180,pts=[];let gmin=0,gmax=0;
    for(let i=0;i<=N;i++){const f=fmax*i/N,gv=g(f);pts.push([f,gv]);if(gv<gmin)gmin=gv;if(gv>gmax)gmax=gv}
    gmin=Math.min(gmin,-gmax*0.3);
    const L=76,Rp=24,PX=f=>L+f/fmax*(W-L-Rp),PY=gv=>H*0.86-(gv-gmin)/((gmax-gmin)||1)*(H*0.72);
    x.strokeStyle='rgba(151,166,192,.07)';x.lineWidth=1;x.font='15px monospace';
    for(let i=0;i<=4;i++){const gy=gmin+(gmax-gmin)*i/4,y=PY(gy);
      x.beginPath();x.moveTo(L,y);x.lineTo(W-Rp,y);x.stroke();
      x.fillStyle='#67748C';x.fillText((gy*100).toFixed(1)+'%',8,y+5)}
    x.strokeStyle='rgba(151,166,192,.25)';x.setLineDash([5,5]);
    x.beginPath();x.moveTo(L,PY(0));x.lineTo(W-Rp,PY(0));x.stroke();x.setLineDash([]);
    x.strokeStyle='#5AA7FF';x.lineWidth=3;x.beginPath();
    pts.forEach(([f,gv],i)=>{i?x.lineTo(PX(f),PY(gv)):x.moveTo(PX(f),PY(gv))});x.stroke();
    const marks=[[ks.f,'f* '+(ks.f*100).toFixed(1)+'%','#F2637C'],[ks.f/2,'½ '+(ks.f*50).toFixed(1)+'%','#E7B653'],[ks.f/4,'¼ '+(ks.f*25).toFixed(1)+'%','#2FD6A0'],[0.01,'DESK 1.0%','#9FABBF']];
    marks.forEach(([f,lb,col],i)=>{if(f>fmax)return;const X=PX(f);
      x.strokeStyle=col;x.setLineDash([6,5]);x.beginPath();x.moveTo(X,H*0.10);x.lineTo(X,H*0.88);x.stroke();x.setLineDash([]);
      x.fillStyle=col;x.fillText(lb,Math.min(X+6,W-150),H*(0.16+i*0.075))});
    x.fillStyle='#67748C';
    x.fillText('growth rate per trade vs fraction risked · curve peaks at f*, halves are nearly as fast with a fraction of the pain',L,H*0.965);
  });
}

/* ── R-distribution — 60-trade demo ledger, every row on screen, stats tie out ── */
const DECD_RDIST=(()=>{
  const r=localRng('decd-rdist-v1'),rows=[];
  for(let i=0;i<60;i++){
    const w=r()<0.34;let R;
    if(w){R=1.5+r()*5.5;if(r()<0.18)R+=2.5}                      // right tail: runners past T2
    else{R=(r()<0.15)?-(0.2+r()*0.5):-(0.8+r()*0.25)}            // scratches + honored full stops
    rows.push(Math.round(R*100)/100);
  }
  return rows;
})();
function DECD_rdistStats(){
  const n=DECD_RDIST.length,sum=DECD_RDIST.reduce((a,b)=>a+b,0),mean=sum/n;
  const sd=Math.sqrt(DECD_RDIST.reduce((a,b)=>a+(b-mean)*(b-mean),0)/(n-1));
  const wins=DECD_RDIST.filter(v=>v>0).length;
  return{n,sum,mean,sd,wins,hit:wins/n};
}
function DECD_drawRdist(){
  POSTRENDER.push(()=>{
    const cv=document.getElementById('decd-cv-rdist');if(!cv)return;
    const W=cv.width=cv.clientWidth*2,H=cv.height=200*2,x=cv.getContext('2d');if(W<20)return;
    x.fillStyle='#070B12';x.fillRect(0,0,W,H);
    const lo=-1.5,hi=9,step=0.5,nb=Math.round((hi-lo)/step);
    const bins=new Array(nb).fill(0);
    DECD_RDIST.forEach(v=>{const i=U.clamp(Math.floor((v-lo)/step),0,nb-1);bins[i]++});
    const maxc=Math.max.apply(null,bins)||1,bw=(W-70)/nb;
    x.strokeStyle='rgba(151,166,192,.07)';x.font='15px monospace';
    for(let i=1;i<=3;i++){const y=H*0.84-i/3*H*0.66;x.beginPath();x.moveTo(30,y);x.lineTo(W-20,y);x.stroke()}
    bins.forEach((c,i)=>{
      const X=30+i*bw,h2=c/maxc*H*0.66,neg=(lo+i*step)<0;
      x.fillStyle=neg?'rgba(242,99,124,.75)':'rgba(47,214,160,.72)';
      x.fillRect(X+bw*0.12,H*0.84-h2,bw*0.76,h2);
      if(c){x.fillStyle='#9FABBF';x.fillText(String(c),X+bw*0.3,H*0.84-h2-8)}
    });
    x.fillStyle='#67748C';
    for(let v=-1;v<=9;v+=1){const X=30+((v-lo)/step)*bw;x.fillText((v>0?'+':'')+v+'R',X-14,H*0.93)}
    const st=DECD_rdistStats(),mx=30+((st.mean-lo)/step)*bw;
    x.strokeStyle='#E7B653';x.setLineDash([6,5]);x.beginPath();x.moveTo(mx,H*0.08);x.lineTo(mx,H*0.86);x.stroke();x.setLineDash([]);
    x.fillStyle='#E7B653';x.fillText('E[R] '+U.sign(st.mean,2),Math.min(mx+8,W-140),H*0.13);
  });
}

/* ── loss ladder — MM-004 walked as a simulator, never touching live risk_mode ── */
function DECD_rungPct(rung){return Math.max(0.25,ck('risk.max_trade_risk_pct')-rung*ck('risk.loss_ladder_step'))}
function DECD_ladderHTML(){
  const rows=[0,1,2,3].map(rg=>{
    const pct=DECD_rungPct(rg),usd=S.equity*pct/100,cur=rg===DECD_LADDER.rung;
    return'<tr'+(cur?' style="background:'+(DECD_LADDER.cool?'var(--blk-bg)':'var(--warn-bg)')+'"':'')+'>'+
     '<td class="mono"><b>RUNG '+rg+'</b></td>'+
     '<td class="r num">'+U.fmt(pct,2)+'%</td>'+
     '<td class="r num">'+U.money(usd)+'</td>'+
     '<td class="i2" style="font-size:10.5px">'+(rg===0?'formula base — the ceiling, not a target':rg===1?'first red: −'+ck('risk.loss_ladder_step')+'% '+prov('risk.loss_ladder_step'):rg===2?'second red: cooldown ARMS here (MM-004 rung-2 doctrine)':'floor rung — below this the answer is NO_TRADE, not smaller')+'</td>'+
     '<td>'+(cur?(DECD_LADDER.cool?chip('COOLDOWN','ch-blk','⛔'):chip('CURRENT','ch-warn','◆')):'<span class="i2" style="font-size:10px">—</span>')+'</td></tr>';
  }).join('');
  let h=tbl(['Rung','>Risk %','>$ at '+U.moneyK(S.equity),'Doctrine',''],rows);
  if(DECD_LADDER.cool)h+='<div class="banner blk" style="margin:8px 0"><span class="bico">⛔</span><div><b>COOLDOWN ARMED — '+DECD_LADDER.streak+' consecutive reds.</b> New entries: none until reset. This is the behavioral tripwire: after two formulaic losses the next risk is TIME, not size (MEM-01 · MM-004).</div></div>';
  h+='<div class="btnrow" style="margin:8px 0">'+
   CMD.btn('size.simloss',null,'sm neg','Simulate a loss')+
   CMD.btn('size.simwin',null,'sm pos','Simulate a win')+
   CMD.btn('size.simreset',null,'sm','Reset sim')+
   '<span class="pill">SIM ONLY — walks module state, never the desk’s live risk_mode</span></div>';
  if(DECD_LADDER.log.length)h+='<div class="hr"></div>'+DECD_LADDER.log.map(e=>kv(e.t,'<span class="mono" style="font-size:10.5px">'+U.esc(e.txt)+'</span>')).join('');
  h+='<div class="i2" style="font-size:10.5px;margin-top:8px">Wins recover ONE rung and never lift the base above the formula — a 5-win streak still sizes at rung 0, no higher '+prov('LAW-012')+'. Losses step down '+ck('risk.loss_ladder_step')+'%/rung '+prov('risk.loss_ladder_step')+'. The ladder is arithmetic, not mood.</div>';
  return h;
}

/* ── size.* commands ── */
CMD.define({id:'size.risk',label:'Sizing: risk %',purpose:'Pre-tier risk slider — recomputes into #size-out, no full render',audit:false,
  run:(a,el)=>{if(el)DECD_SIZE.riskPct=U.clamp(parseFloat(el.value)||DECD_SIZE.riskPct,0.1,2);DECD_sizePatch()}});
CMD.define({id:'size.stopd',label:'Sizing: stop distance',purpose:'Stop-distance slider ($/share) — denominator of the formula',audit:false,
  run:(a,el)=>{if(el)DECD_SIZE.stopd=U.clamp(parseFloat(el.value)||DECD_SIZE.stopd,0.25,12);DECD_sizePatch()}});
CMD.define({id:'size.conv',label:'Sizing: conviction tier',purpose:'Conviction slider — B 0.5× (paper-only) · A 0.75× · A+ 1.0×',audit:false,
  run:(a,el)=>{if(el)DECD_SIZE.conv=U.clamp(Math.round(parseFloat(el.value))||0,0,2);DECD_sizePatch()}});
CMD.define({id:'size.recalc',label:'Recompute size',purpose:'Re-run the constraint ledger into the output region directly',audit:false,
  run:()=>DECD_sizePatch()});
CMD.define({id:'size.loadpkt',label:'Load packet stop',purpose:'Pull stop-distance from the active packet’s rmath',audit:false,
  run:()=>{const p=DECD_pkt();if(!p){UI.toast('No packet in scope','warn','SIZING LAB');return}
   DECD_SIZE.stopd=Math.abs(p.rmath.entry-p.rmath.stop);
   UI.toast('Stop-distance loaded from '+p.id+': $'+U.fmt(DECD_SIZE.stopd,2)+' ('+U.fmt(p.rmath.entry,2)+' − '+U.fmt(p.rmath.stop,2)+')','','SIZING LAB');
   render()}});
CMD.define({id:'size.kelly',label:'Kelly playbook',purpose:'Point the Kelly explorer at a different BT-register row',audit:false,
  run:a=>{if(PLAYBOOKS.find(x=>x.nm===a)){DECD_SIZE.kelly=a;render()}}});
CMD.define({id:'size.simloss',label:'Ladder sim: loss',purpose:'Walk one simulated loss down the MM-004 ladder',audit:false,
  run:()=>{DECD_LADDER.streak++;DECD_LADDER.rung=Math.min(3,DECD_LADDER.rung+1);
   const armed=DECD_LADDER.streak>=2&&!DECD_LADDER.cool;if(armed)DECD_LADDER.cool=true;
   const pct=DECD_rungPct(DECD_LADDER.rung);
   const msg='LADDER SIM loss #'+DECD_LADDER.streak+' → rung '+DECD_LADDER.rung+' ('+U.fmt(pct,2)+'% = '+U.money(S.equity*pct/100)+')'+(DECD_LADDER.cool?' · COOLDOWN '+(armed?'ARMS':'holding'):'');
   DECD_LADDER.log.unshift({t:CLOCK.hms(),txt:msg});if(DECD_LADDER.log.length>8)DECD_LADDER.log.pop();
   SVR.audit('HUMAN (owner)','sizing',msg);render()}});
CMD.define({id:'size.simwin',label:'Ladder sim: win',purpose:'Walk one simulated win — recovers one rung, never above base',audit:false,
  run:()=>{const released=DECD_LADDER.cool;DECD_LADDER.streak=0;DECD_LADDER.cool=false;
   DECD_LADDER.rung=Math.max(0,DECD_LADDER.rung-1);
   const pct=DECD_rungPct(DECD_LADDER.rung);
   const msg='LADDER SIM win → recover one rung → rung '+DECD_LADDER.rung+' ('+U.fmt(pct,2)+'%)'+(released?' · cooldown RELEASED by discipline reset (sim)':'')+' · no size-up beyond formula (LAW-012)';
   DECD_LADDER.log.unshift({t:CLOCK.hms(),txt:msg});if(DECD_LADDER.log.length>8)DECD_LADDER.log.pop();
   SVR.audit('HUMAN (owner)','sizing',msg);render()}});
CMD.define({id:'size.simreset',label:'Ladder sim: reset',purpose:'Return the simulator to rung 0, clear the walk log',audit:false,
  run:()=>{DECD_LADDER.rung=0;DECD_LADDER.streak=0;DECD_LADDER.cool=false;DECD_LADDER.log=[];
   SVR.audit('HUMAN (owner)','sizing','LADDER SIM reset → rung 0 · streak 0 · cooldown clear');render()}});
function DECD_cardPayload(){
  const c=DECD_sizeCalc(),p=DECD_pkt();
  return{doc:'ATLAS SIZE CARD',mode:'DEMO — synthetic session, no live claim',at:CLOCK.hms()+' ET',
   packet:p?p.id+' '+p.sym+' '+p.dir:'none in scope',
   inputs:{equity:S.equity,risk_pct_pre_tier:DECD_SIZE.riskPct,tier:c.t.t,tier_mult:c.t.m,effective_pct:+c.effPct.toFixed(3),stop_distance:+c.stopd.toFixed(2)},
   constraints:c.caps.map(x=>({id:x.id,allows_usd:+x.usd.toFixed(2),prov:x.prov||'operator request'})),
   binding:c.binder.id,granted_usd:+c.grant.toFixed(2),
   size:{shares:c.shares,contracts_conservative:c.ctCons,contracts_delta_adjusted:c.ctDelta,delta_assumption:c.del.d,delta_source:c.del.src},
   ladder:{rung:DECD_LADDER.rung,cooldown:DECD_LADDER.cool},
   provenance:['risk.max_trade_risk_pct','risk.max_open_risk_R','risk.max_sector_exposure','risk.max_day_loss_R','MM-004','LAW-012']};
}
CMD.define({id:'size.card',label:'Generate size card',purpose:'One-screen sizing record: inputs, binding constraint, final size, provenance chain — audited',
  run:()=>{const c=DECD_sizeCalc(),p=DECD_pkt();
   SVR.audit('HUMAN (owner)','sizing','SIZE CARD generated · '+(p?p.id:'no packet')+' · '+U.fmt(c.effPct,2)+'% eff ('+c.t.t+' tier) · binder '+c.binder.id+' · granted '+U.money(c.grant)+' → '+c.shares+' sh / '+c.ctCons+' ct');
   UI.modal('◆ SIZE CARD — '+CLOCK.hms()+' ET',
    '<div style="margin-bottom:8px">'+chip('DEMO','ch-demo','◈')+' '+(p?chip(p.id+' · '+p.sym+' '+p.dir,'ch-info','◆'):'')+(c.t.t==='B'?' '+chip('PAPER-ONLY TIER','ch-demo','◈'):'')+'</div>'+
    kv('EQUITY',U.money(S.equity)+' paper')+
    kv('RISK REQUEST',U.fmt(DECD_SIZE.riskPct,2)+'% × '+c.t.t+' '+U.fmt(c.t.m,2)+'× = '+U.fmt(c.effPct,2)+'% = '+U.money(c.reqUSD))+
    kv('STOP DISTANCE','$'+U.fmt(c.stopd,2)+' /share'+(p?' (packet rmath: '+U.fmt(p.rmath.entry,2)+' − '+U.fmt(p.rmath.stop,2)+')':''))+
    kv('BINDING CONSTRAINT','<b>'+c.binder.id+'</b> — allows '+U.money(c.binder.usd)+(c.binder.prov?' '+prov(c.binder.prov):' (your request is below every cap)'))+
    kv('GRANTED',U.money(c.grant)+' = '+U.fmt(c.grant/S.equity*100,2)+'% equity')+
    kv('FINAL SIZE','<b>'+U.int(c.shares)+' shares</b> · '+c.ctCons+' ct conservative · '+c.ctDelta+' ct delta-adjusted (Δ '+U.fmt(c.del.d,2)+')')+
    kv('LADDER','rung '+DECD_LADDER.rung+' ('+U.fmt(DECD_rungPct(DECD_LADDER.rung),2)+'%)'+(DECD_LADDER.cool?' · COOLDOWN ARMED':''))+
    kv('PROVENANCE',prov('risk.max_trade_risk_pct')+' '+prov('risk.max_open_risk_R')+' '+prov('risk.max_sector_exposure')+' '+prov('risk.max_day_loss_R')+' '+prov('MM-004','MM-004 — ladder step doctrine: risk steps down after losses; 2-loss cooldown at rung 2')+' '+prov('LAW-012'))+
    '<div class="i2" style="font-size:10.5px;margin-top:8px">The card is a record, not an authority: any order still routes through SVR.riskCheck and the token gate. NO TOKEN · NO ORDER · NO ADMIN BYPASS.</div>',
    '<button class="btn" data-cmd="ui.closeModal">Close</button><button class="btn pri" data-cmd="size.export">Download JSON</button>')}});
CMD.define({id:'size.export',label:'Export size card',purpose:'Download the size card as JSON — honestly labeled DEMO',
  run:()=>{const blob=new Blob([JSON.stringify(DECD_cardPayload(),null,2)],{type:'application/json'});
   const u=URL.createObjectURL(blob),a=document.createElement('a');
   a.href=u;a.download='atlas-size-card-DEMO.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),800);
   SVR.audit('HUMAN (owner)','sizing','SIZE CARD exported as JSON (DEMO-watermarked payload)');
   UI.toast('Size card downloaded — payload carries mode:DEMO, no live claim','ok','EXPORT')}});

/* ── VIEW · decisions.sizing — position sizing laboratory ── */
VIEWS['decisions.sizing']=function(){
  const p=DECD_pkt();
  if(!p)return vhead('DECISIONS · position sizing laboratory','No packet in scope',
    'The lab benches the sizing formula against a live packet; the pipeline has produced none this session — which is itself a valid state: rejection is the default, and a formula with no trade to size costs nothing.')+
   panel('THE FORMULA — idle','size = (equity × risk% × conviction) ÷ stop-distance',
    '<div class="empty"><div class="e1">NO ACTIVE PACKET</div>Every term below is wired to live stores; the stop-distance term is wired to a packet’s rmath and there is no packet. The console, Kelly explorer, loss ladder and R-distribution remain available the moment one arrives. The desk would rather show you an empty bench than a fabricated worked example.</div>')+
   panel('DOCTRINE WHILE IDLE — the four terms and how each betrays you','the formula is an instrument, not a black box',
    kv('TERM 1 · EQUITY','S.equity — the paper account, marked live. Failure shape: sizing against yesterday’s equity after a drawdown, so every position downstream is quietly a little too big. The lab reads it at render time, never from a cached copy.')+
    kv('TERM 2 · RISK %','ceiling '+ck('risk.max_trade_risk_pct')+'% '+prov('risk.max_trade_risk_pct')+' — a ceiling, never a target. Desk default is 0.6% (MEM-01). Failure shape: the ceiling drifts into being the default because nobody wrote down why it should not.')+
    kv('TERM 3 · CONVICTION','A+ 1.0× · A 0.75× · B 0.5× paper-only — conviction only multiplies DOWN from the cap, never up '+prov('LAW-012')+'. Failure shape: grade inflation, the #3 Pareto tag — a B idea wearing an A grade collects A size.')+
    kv('TERM 4 · STOP DISTANCE','structural, from the packet’s rmath — never tightened to buy more size '+prov('risk.min_rr')+'. Failure shape: the denominator is the only term the operator can shrink at will, which is exactly why LAW-004 forbids it.')+
    kv('WHILE YOU WAIT','The Kelly explorer, the MM-004 loss ladder and the 60-trade R-distribution below the fold all run on register and ledger data and need no packet. The scanner funnel is doing its job: most sessions SHOULD pass through this screen without a trade to size.'));
  const c=DECD_sizeCalc();
  const gradeTier=p.grade.startsWith('A+')?2:p.grade.startsWith('A')?1:0;
  const gt=DECD_TIERS[gradeTier];
  const capPct=ck('risk.max_trade_risk_pct');
  const pktRisk=Math.abs(p.rmath.entry-p.rmath.stop);
  const fUSD=S.equity*capPct/100*gt.m;
  const fShares=Math.floor(fUSD/pktRisk);
  const fCtCons=Math.floor(fUSD/(pktRisk*100));
  const del=DECD_pktDelta(p);
  const fCtDelta=Math.floor(fShares/(del.d*100));
  let h=vhead('DECISIONS · position sizing laboratory','The formula is an instrument, not a black box',
   'size = (equity × risk% × conviction) ÷ stop-distance — every term live, every constraint named, every output auditable. The number that reaches an order was never typed by anyone; it fell out of arithmetic you can see.',
   chip(p.id+' · '+p.sym+' '+p.dir,'ch-info','◆')+' '+chip('GRADE '+p.grade,'ch-live','◆'));
  h+='<div class="grid g4">'+
   stat('Equity',U.moneyK(S.equity),'S.equity · paper account')+
   stat('Per-trade cap',U.money(S.equity*capPct/100),capPct+'% '+prov('risk.max_trade_risk_pct'))+
   stat('Open-risk headroom',U.fmt(Math.max(0,ck('risk.max_open_risk_R')-S.openRiskR),2)+'R',U.fmt(S.openRiskR,2)+'R of '+ck('risk.max_open_risk_R')+'R deployed '+prov('risk.max_open_risk_R'))+
   stat('Ladder rung',DECD_LADDER.rung+' · '+U.fmt(DECD_rungPct(DECD_LADDER.rung),2)+'%',DECD_LADDER.cool?'<span class="dn">COOLDOWN ARMED</span>':'sim state · MM-004 walk below')+'</div>';
  /* (a) the formula, opened up */
  h+='<div class="grid g21">';
  h+=panel('THE FORMULA — every term live, sourced and provenanced','size = (equity × risk% × conviction-multiplier) ÷ stop-distance',
   '<div class="code" style="font-size:13px;margin-bottom:10px">size = ( equity × risk% × conviction ) ÷ stop-distance</div>'+
   tbl(['Term','Live value','Source','How this term fails you'],[
    ['equity',U.money(S.equity),'S.equity — paper account, marked live','stale equity after a drawdown → every size downstream is quietly too big'],
    ['risk%',capPct+'% ceiling '+prov('risk.max_trade_risk_pct'),'CONFIG risk.max_trade_risk_pct — numeric truth (LAW-015)','the ceiling gets treated as a target; it is a ceiling — desk default is 0.6% (MEM-01)'],
    ['conviction',gt.t+' tier → '+U.fmt(gt.m,2)+'× (grade '+p.grade+')','tier table below — grade maps to multiplier, never the reverse','grade inflation converts B ideas into A size — the #3 failure tag on the Pareto (19 cases)'],
    ['stop-distance','$'+U.fmt(pktRisk,2)+' = '+U.fmt(p.rmath.entry,2)+' − '+U.fmt(p.rmath.stop,2),p.id+' rmath — structural stop, below the spring low + buffer','tightened to buy more shares — LAW-004 forbids manufacturing the math '+prov('risk.min_rr')],
   ].map(r=>'<tr><td class="mono" style="font-size:11px"><b>'+r[0]+'</b></td><td class="num">'+r[1]+'</td><td class="i1" style="font-size:10.5px">'+r[2]+'</td><td class="i2" style="font-size:10.5px">'+r[3]+'</td></tr>').join(''))+
   '<div class="hr"></div>'+
   '<div class="rproof">'+
    '<div class="rrow"><span class="lab">Worked, with the live packet</span><span class="mono">'+U.money(S.equity)+' × '+U.fmt(capPct,2)+'% × '+U.fmt(gt.m,2)+' = '+U.money(fUSD)+'</span></div>'+
    '<div class="rrow"><span class="lab">÷ stop-distance $'+U.fmt(pktRisk,2)+'</span><span class="mono"><b>'+U.int(fShares)+' shares</b></span></div>'+
    '<div class="rrow"><span class="lab">Contracts · conservative road ($'+U.fmt(pktRisk*100,0)+'/ct = stop × 100)</span><span class="mono"><b>'+fCtCons+' ct</b></span></div>'+
    '<div class="rrow"><span class="lab">Contracts · delta road ('+U.int(fShares)+' ÷ '+U.fmt(del.d,2)+'×100 · Δ from '+U.esc(del.src)+')</span><span class="mono">'+fCtDelta+' ct</span></div></div>'+
   '<div class="i2" style="font-size:10.5px;margin-top:8px">The desk sizes options on the conservative road — full stop-distance × 100/ct — never the delta road. Delta is a model output; the stop is a law. The delta road is shown so the assumption is visible, not so it is used.</div>'+
   '<div class="hr"></div>'+
   '<div class="kv" style="border:none"><span class="k">STOP-DISTANCE SENSITIVITY</span><span class="v i2" style="font-size:10px">why the denominator is the term LAW-004 guards — same '+U.money(fUSD)+' granted risk, five hypothetical stops:</span></div>'+
   tbl(['Stop distance','>× structural','>Shares','What actually happened to the trade'],[0.5,0.75,1.0,1.5,2.0].map(k=>{
     const sd2=pktRisk*k,sh2=Math.floor(fUSD/sd2);
     return'<tr'+(k===1?' style="background:var(--live-bg)"':k<1?' style="background:var(--blk-bg)"':'')+'>'+
      '<td class="mono">$'+U.fmt(sd2,2)+'</td><td class="r num">'+U.fmt(k,2)+'×</td><td class="r num">'+U.int(sh2)+'</td>'+
      '<td class="i2" style="font-size:10.5px">'+(k<1?'MORE shares, but the stop now sits INSIDE noise — the invalidation is fictional and the R math with it. This row is what LAW-004 forbids you to manufacture.':k===1?'the structural stop from '+p.id+' rmath — where the idea is actually wrong':'fewer shares for the same risk — legitimate when structure genuinely sits wider; the formula absorbs it without drama')+'</td></tr>'}).join(''))+
   '<div class="i2" style="font-size:10.5px;margin:6px 0 0">Shares scale with 1/stop: halving the denominator doubles the position and tells you nothing new about the trade. Size is the OUTPUT of where the stop belongs — never the input that decides it '+prov('risk.min_rr')+'.</div>'+
   '<div class="banner info" style="margin-top:8px"><span class="bico">i</span><div><b>Reconciliation, honestly:</b> '+p.id+' carries '+U.money(p.rmath.riskUSD)+' ('+U.fmt(p.rmath.riskUSD/S.equity*100,2)+'%) from the risk officer’s own path; the lab formula at '+gt.t+' tier yields '+U.money(fUSD)+'. A divergence &gt; 0 is information — the tier doctrine is stricter than the raw cap, and this panel exists precisely to make that drift visible before it compounds.</div></div>');
  h+=panel('CONVICTION TIERS — the multiplier only points down','tier-cap doctrine: A+ earns the formula, never more',
   tbl(['Tier','Multiplier','Standing'],DECD_TIERS.slice().reverse().map(t=>'<tr'+(t.t===gt.t?' style="background:var(--warn-bg)"':'')+'>'+
    '<td class="mono"><b>'+t.t+'</b>'+(t.t===gt.t?' ← '+p.grade:'')+'</td><td class="r num">'+U.fmt(t.m,2)+'×</td><td class="i1" style="font-size:10.5px">'+U.esc(t.note)+(t.t==='B'?' '+chip('PAPER-ONLY','ch-demo','◈'):'')+'</td></tr>').join(''))+
   '<div class="hr"></div>'+
   kv('DOCTRINE','Conviction multiplies DOWN from the cap. There is no 1.25×, no “table pounding” tier, no override field. A streak of wins changes nothing '+prov('LAW-012'))+
   kv('WHY','Every sizing disaster in the journal starts with an exception to the multiplier. The tier table has three rows so there is nothing to argue about.')+
   kv('B-TIER LAW','0.5× AND paper-only — halving a bad idea does not make it a good one; it makes it a small bad idea. Paper is where those go to be counted '+prov('LAW-009')));
  h+='</div>';
  /* (b) interactive console */
  const tNow=DECD_TIERS[DECD_SIZE.conv];
  h+=panel('INTERACTIVE SIZING CONSOLE — move a term, watch the constraint that binds','recomputes into the output region directly; nothing here is an order',
   '<div class="row" style="gap:10px;margin-bottom:6px"><span class="mono i2" style="font-size:10px;width:150px">RISK % (pre-tier)</span>'+
    '<input type="range" min="0.10" max="2.00" step="0.05" value="'+DECD_SIZE.riskPct+'" data-cmdin="size.risk" style="flex:1">'+
    '<span class="mono" id="decd-riskv" style="font-size:11px;width:70px;text-align:right">'+U.fmt(DECD_SIZE.riskPct,2)+'%</span></div>'+
   '<div class="i2" style="font-size:9.5px;margin:-2px 0 8px 160px">desk default 0.6% (MEM-01) · config ceiling '+capPct+'% — the slider deliberately runs past the cap so you can watch the cap bind</div>'+
   '<div class="row" style="gap:10px;margin-bottom:6px"><span class="mono i2" style="font-size:10px;width:150px">STOP DISTANCE $/sh</span>'+
    '<input type="range" min="0.25" max="12" step="0.05" value="'+DECD_SIZE.stopd+'" data-cmdin="size.stopd" style="flex:1">'+
    '<span class="mono" id="decd-stopv" style="font-size:11px;width:70px;text-align:right">$'+U.fmt(DECD_SIZE.stopd,2)+'</span></div>'+
   '<div class="row" style="gap:10px;margin-bottom:6px"><span class="mono i2" style="font-size:10px;width:150px">CONVICTION TIER</span>'+
    '<input type="range" min="0" max="2" step="1" value="'+DECD_SIZE.conv+'" data-cmdin="size.conv" style="flex:1">'+
    '<span class="mono" id="decd-convv" style="font-size:11px;width:70px;text-align:right">'+tNow.t+' · '+U.fmt(tNow.m,2)+'×</span></div>'+
   '<div class="btnrow" style="margin-bottom:10px">'+CMD.btn('size.recalc',null,'sm','Recompute')+CMD.btn('size.loadpkt',null,'sm','Load '+p.id+' stop')+CMD.btn('size.card',null,'sm gold','◆ Generate size card')+'</div>'+
   '<div id="size-out">'+DECD_sizeOutHTML()+'</div>');
  /* (c) kelly explorer */
  const pb=DECD_kellyPB(),ks=DECD_kellyStats(pb);
  const fr=[['FULL f*',ks.f],['HALF f*/2',ks.f/2],['QUARTER f*/4',ks.f/4],['DESK 1.0% cap',0.01]];
  const sens=[-0.05,0,0.05].map(dp=>[-1,0,1].map(db=>{
    const p2=U.clamp(ks.p+dp,0.02,0.98),b2=Math.max(0.2,ks.b+db);
    return Math.max(0,(b2*p2-(1-p2))/b2)}));
  h+=panel('KELLY EXPLORER — why the desk laughs politely at full Kelly','win/payoff from the BT register '+U.esc(ks.id)+' (n='+ks.n+') · <span class="demo-wm">demo backtests</span>',
   '<div class="row" style="margin-bottom:8px"><span class="seg">'+PLAYBOOKS.map(x=>'<button class="'+(x.nm===pb.nm?'on':'')+'" data-cmd="size.kelly" data-arg="'+U.esc(x.nm)+'">'+U.esc(x.nm)+'</button>').join('')+'</span></div>'+
   '<div class="grid g2"><div>'+
    kv('INPUTS','win '+U.fmt(ks.p*100,0)+'% · expectancy '+U.sign(ks.exp,2)+'R · n='+ks.n+' — straight from the register row, nothing re-fit')+
    kv('PAYOFF b','(exp + q) ÷ p = ('+U.fmt(ks.exp,2)+' + '+U.fmt(ks.q,2)+') ÷ '+U.fmt(ks.p,2)+' = <b>'+U.fmt(ks.b,2)+'R</b> per winner — assumes every loss is exactly −1R, true only when stops are honored, which is the point')+
    kv('FULL KELLY f*','(b·p − q) ÷ b = ('+U.fmt(ks.b,2)+'×'+U.fmt(ks.p,2)+' − '+U.fmt(ks.q,2)+') ÷ '+U.fmt(ks.b,2)+' = <b>'+U.fmt(ks.f*100,1)+'%</b> of equity per trade')+
    kv('LADDER DOWN','½ Kelly '+U.fmt(ks.f*50,1)+'% · ¼ Kelly '+U.fmt(ks.f*25,1)+'% · desk cap '+capPct+'% — the desk sits at roughly f*/'+U.fmt(ks.f/0.01,0))+
   '</div><div>'+
    '<div class="kv" style="border:none"><span class="k">SENSITIVITY f*</span><span class="v i2" style="font-size:10px">estimation error dominates — ±5 pts of win%, ±1R of payoff:</span></div>'+
    tbl(['win% \\ payoff','>b−1R','>b','>b+1R'],sens.map((row,i)=>'<tr><td class="mono" style="font-size:10px">'+U.fmt((ks.p+[-0.05,0,0.05][i])*100,0)+'%</td>'+row.map((f,j)=>'<td class="r num'+(i===1&&j===1?' up':'')+'">'+U.fmt(f*100,1)+'%</td>').join('')+'</tr>').join(''))+
    '<div class="i2" style="font-size:10px;margin-top:4px">A 5-point miss on win% moves f* by '+U.fmt(Math.abs(sens[1][1]-sens[0][1])*100,1)+' points. Your estimate of p is a demo backtest; the market’s p is not obliged to match it.</div>'+
   '</div></div>'+
   '<canvas id="decd-cv-kelly" class="cv" style="width:100%;height:250px;margin-top:8px"></canvas>'+
   tbl(['Fraction','>f','>median maxDD','>p95 maxDD','>P(−50% drawdown)'],fr.map(([nm,f])=>{
     const d=DECD_ddSim(ks.p,ks.b,f,'decd-dd-'+pb.nm);
     return'<tr'+(nm.startsWith('FULL')?' style="background:var(--blk-bg)"':nm.startsWith('DESK')?' style="background:var(--live-bg)"':'')+'><td class="mono" style="font-size:10.5px"><b>'+nm+'</b></td><td class="r num">'+U.fmt(f*100,1)+'%</td><td class="r num">'+U.fmt(d.med*100,0)+'%</td><td class="r num">'+U.fmt(d.p95*100,0)+'%</td><td class="r num '+(d.ruin>0.05?'dn':'up')+'">'+U.fmt(d.ruin*100,1)+'%</td></tr>'}).join(''))+
   '<div class="i2" style="font-size:10.5px;padding:6px 2px 0">Drawdown study: 200 deterministic paths × 120 trades per fraction (localRng, replayable — same table every session). Median is the expected life; p95 is the life you must survive to see the median.</div>'+
   '<div class="hr"></div>'+
   '<div class="kv" style="border:none"><span class="k">KELLY ACROSS THE REGISTER</span><span class="v i2" style="font-size:10px">every playbook’s f*, derived the same way — note how the desk cap sits below every quarter-Kelly on the board:</span></div>'+
   tbl(['Playbook','>win','>exp','>b derived','>f*','>¼ f*','>cap ÷ f*'],PLAYBOOKS.map(x=>{
     const k2=DECD_kellyStats(x);
     return'<tr'+(x.nm===pb.nm?' style="background:var(--live-bg)"':'')+'>'+
      '<td style="font-size:11px">'+U.esc(x.nm)+' <span class="mono i2" style="font-size:9px">'+U.esc(k2.id)+' n='+k2.n+'</span></td>'+
      '<td class="r num">'+U.fmt(k2.p*100,0)+'%</td>'+
      '<td class="r num">'+U.sign(k2.exp,2)+'R</td>'+
      '<td class="r num">'+U.fmt(k2.b,2)+'R</td>'+
      '<td class="r num">'+U.fmt(k2.f*100,1)+'%</td>'+
      '<td class="r num">'+U.fmt(k2.f*25,1)+'%</td>'+
      '<td class="r num i2">1/'+U.fmt(k2.f/0.01,0)+'</td></tr>'}).join(''))+
   '<div class="i2" style="font-size:10.5px;padding:6px 2px 0">Six different edges, one sizing law: the register’s f* values range '+U.fmt(Math.min.apply(null,PLAYBOOKS.map(x=>DECD_kellyStats(x).f))*100,1)+'–'+U.fmt(Math.max.apply(null,PLAYBOOKS.map(x=>DECD_kellyStats(x).f))*100,1)+'% and the desk trades '+ck('risk.max_trade_risk_pct')+'% regardless — because the column that matters is n, and none of these samples is large enough to bet a quarter of the theoretical optimum on.</div>'+
   '<div class="banner gold" style="margin-top:8px"><span class="bico">◆</span><div><b>Doctrine:</b> the desk trades ≤ quarter-Kelly — in practice far below it — because estimation error dominates the growth argument '+prov('MM-004','MM-004 — money-management doctrine: fractional sizing because p and b are estimates; the ladder steps down after losses')+'. Full Kelly is optimal only for the p and b you do not actually know; half the fraction keeps ~75% of the growth and sheds most of the p95 drawdown. The cap '+prov('risk.max_trade_risk_pct')+' is not timidity, it is epistemics.</div></div>');
  /* (d) loss ladder + (e) r-distribution */
  h+='<div class="grid g2">';
  h+=panel('LOSS LADDER SIMULATOR — MM-004 walked by hand','start 1.0% · step −'+ck('risk.loss_ladder_step')+'%/loss · 2-loss cooldown arms at rung 2',DECD_ladderHTML());
  const st=DECD_rdistStats();
  const sd075=st.sd*S.equity*0.0075,sd100=st.sd*S.equity*0.01;
  h+=panel('R-DISTRIBUTION — 60 realized trades, all rows on screen','<span class="demo-wm">demo ledger</span> · stats derive from the SAME rows below — audit the tie-out yourself',
   '<canvas id="decd-cv-rdist" class="cv" style="width:100%;height:200px"></canvas>'+
   '<div class="grid g4" style="margin-top:8px">'+
    stat('Expectancy',U.sign(st.mean,2)+'R','Σ '+U.sign(st.sum,2)+'R ÷ '+st.n+' rows — the mean IS the sum over the rows')+
    stat('Std dev',U.fmt(st.sd,2)+'R','sample, n−1 — the width of the histogram, not a promise')+
    stat('Hit rate',U.fmt(st.hit*100,0)+'%',st.wins+' of '+st.n+' rows &gt; 0')+
    stat('Tie-out','Σ = '+U.sign(st.sum,2)+'R','recompute it — every row is rendered below')+'</div>'+
   '<div class="hr"></div>'+
   '<div class="mono" style="font-size:10px;line-height:1.9;letter-spacing:0.3px">'+DECD_RDIST.map(v=>'<span class="'+(v>0?'up':'dn')+'" style="display:inline-block;width:52px">'+U.sign(v,2)+'</span>').join('')+'</div>'+
   '<div class="banner info" style="margin-top:8px"><span class="bico">i</span><div><b>What one more 0.25% of risk does to variance:</b> at 0.75% risk, one stdev of a single trade is '+U.fmt(st.sd,2)+'R × '+U.money(S.equity*0.0075)+'/R = '+U.money(sd075)+'; at 1.00% it is '+U.money(sd100)+' — dollars-at-risk up 33%, P&amp;L <i>variance</i> up '+U.fmt(((1.0/0.75)*(1.0/0.75)-1)*100,0)+'% (variance scales with the square) while expectancy rises only linearly. A −2R day costs '+U.money(2*S.equity*0.0075)+' at 0.75% but '+U.money(2*S.equity*0.01)+' at 1.00% — which is exactly the day-breaker '+prov('risk.max_day_loss_R')+'. The extra quarter-point buys volatility, not edge.</div></div>');
  h+='</div>';
  h+='<div class="banner info"><span class="bico">◈</span><div><b>Exit paths:</b> the lab computes nothing authoritative — a size becomes real only inside a packet, through '+'<button class="btn sm" data-cmd="nav.decisions.riskproof">Risk Proof</button> <button class="btn sm" data-cmd="nav.decisions.packet" data-arg="'+p.id+'">'+p.id+'</button> <button class="btn sm" data-cmd="nav.ws" data-arg="premortem">Pre-Mortem</button>'+' — and the same engine that would reject a reckless size here rejects it there.</div></div>';
  DECD_drawKelly(ks);
  DECD_drawRdist();
  return h;
};

/* ── pre-mortem failure-mode taxonomy — 12 modes · 4 families ──
   Every check is DETERMINISTIC: it reads the packet's actual fields (rmath
   distances, votes, unmet[], ttl) and the live stores. Score = hits, 0–3,
   arithmetic rendered so an auditor can re-add it. */
const DECD_FAMS=[
 ['STRUCTURE','the chart lied'],
 ['LIQUIDITY','the door was smaller than the room'],
 ['EVENT','the calendar outranked the chart'],
 ['OPERATOR','the human was the failure mode'],
];
const DECD_MODES=[
 {id:'SF-01',fam:'STRUCTURE',nm:'Sweep was a breakout',
  tape:'The “sweep” never re-enters the range: consecutive closes beyond the swept level, pullbacks get sold at the level, displacement never prints back through.',
  ck:p=>{const m=DECD_mx(p),v13=DECD_vote(p,'S13');return[
   {t:'Qualified-reclaim vote (S13 pass) '+(v13&&v13.verdict==='pass'?'on file — evidence AGAINST':'MISSING'),hit:!(v13&&v13.verdict==='pass')},
   {t:'FSM still waiting on MSS/displacement: '+(m.unmet.filter(u=>/MSS|displacement/i.test(u)).map(U.esc).join(' · ')||'no such unmet condition'),hit:m.unmet.some(u=>/MSS|displacement/i.test(u))},
   {t:'Quote '+U.fmt(m.px)+' already on the wrong side of entry '+U.fmt(m.r.entry),hit:m.dir*(m.px-m.r.entry)<0},
  ]},
  kill:p=>{const tr=DECD_trip(p,0.5);return{
   dies:'the sweep was real supply, not manipulation — the reclaim fails, and keeps failing',
   mon:'5m closes relative to the swept level; displacement quality on any reclaim attempt (DET-031/032)',
   trip:'5m close beyond '+tr.txt+' (entry − 0.5×risk)',resp:'EXIT',
   why:'a failed reclaim IS the disproof (LAW-001) — there is no thesis left to reduce'}}},
 {id:'SF-02',fam:'STRUCTURE',nm:'Level was a liquidity magnet',
  tape:'Price grinds toward your stop shelf without volume, wicks through the obvious level, then snaps back after the stops print — your invalidation was the destination.',
  ck:p=>{const m=DECD_mx(p);const d=Math.abs(m.r.stop-Math.round(m.r.stop*2)/2);
   const pool=m.s&&m.s.levels?(m.dir>0?m.s.levels.poolBelow:m.s.levels.poolAbove):'';return[
   {t:'Stop '+U.fmt(m.r.stop)+' sits $'+U.fmt(d,2)+' off a round/half shelf (crowd threshold $0.15)',hit:d<=0.15},
   {t:'Stop distance '+U.fmt(m.risk/m.r.entry*100,2)+'% of entry — tight enough to sit with the crowd (<1.5%)',hit:m.risk/m.r.entry<0.015},
   {t:'Named pool behind the stop: '+(pool?U.esc(pool):'none named')+(/TAKEN/i.test(pool||'')?' — already TAKEN, evidence against':''),hit:!!pool&&!/TAKEN/i.test(pool)},
  ]},
  kill:p=>{const tr=DECD_trip(p,0.75);return{
   dies:'the market trades TO your stop, not from it — the shelf is the draw on liquidity',
   mon:'tape behavior on approach to the shelf: RVOL expansion = engineered raid; quiet drift = rotation',
   trip:'touch of '+tr.txt+' (entry − 0.75×risk) without RVOL ≥ '+ck('detect.displacement_vol')+'×',resp:'REDUCE',
   why:'half off ahead of the shelf; the stop itself stays where structure says — never widened (envelope law)'}}},
 {id:'SF-03',fam:'STRUCTURE',nm:'HTF conflict ignored',
  tape:'Every LTF trigger works for an hour and dies at the same HTF level; the 4H closes against you while the 5m keeps looking perfect.',
  ck:p=>{const m=DECD_mx(p),v8=DECD_vote(p,'S08');return[
   {t:'Counter-regime flag on the plan (rmath.counterRegime = '+(!!p.rmath.counterRegime)+')',hit:!!p.rmath.counterRegime},
   {t:'S08 regime vote: '+(v8?v8.verdict:'absent')+(v8&&v8.verdict!=='pass'?' — not a clean pass':''),hit:!!v8&&v8.verdict!=='pass'},
   {t:'Unmet HTF condition: '+(m.unmet.filter(u=>/HTF|bias|4H|qualified close/i.test(u)).map(U.esc).join(' · ')||'none'),hit:m.unmet.some(u=>/HTF|bias|4H|qualified close/i.test(u))},
  ]},
  kill:p=>{const tr=DECD_trip(p,1.0);return{
   dies:'the LTF story is a countertrend scalp wearing swing clothes — ladder misalignment (LAW-016)',
   mon:'4H closes vs the packet bias; the HTF ladder in Research → Structure',
   trip:'any 4H close beyond '+tr.txt+' (entry − 1.0×risk) = structural disproof at the higher rung',resp:'EXIT',
   why:'HTF outranks LTF by hierarchy — when the ladder disagrees, the higher timeframe wins, always'}}},
 {id:'LQ-01',fam:'LIQUIDITY',nm:'Thin-book slippage',
  tape:'Prints skip levels; the paper fill assumes a book that is not there; every exit fills two–three ticks beyond where the plan said it would.',
  ck:p=>{const m=DECD_mx(p);return[
   {t:'RVOL '+(m.s?U.fmt(m.s.rvol,1)+'×':'n/a')+' — participation thin below 1.3×',hit:!!m.s&&m.s.rvol<1.3},
   {t:'Spread '+U.fmt(p.rmath.spreadPct||0,1)+'% already ≥ half the OPT-007 cap ('+ck('options.max_spread_pct')/2+'%)',hit:p.rmath.spreadPct!=null&&p.rmath.spreadPct>=ck('options.max_spread_pct')/2},
   {t:'Size '+(p.rmath.contracts||0)+' contracts — multi-lot exit into one chain (≥3 flags)',hit:(p.rmath.contracts||0)>=3},
  ]},
  kill:p=>({
   dies:'the exit costs more than the plan modeled — slippage quietly eats the R math from both ends',
   mon:'live spread vs the '+U.fmt(p.rmath.spreadPct||0,1)+'% stamped at assembly; depth at T1 before the trim',
   trip:'spread prints > '+ck('options.max_spread_pct')+'% (the OPT-007 line '+'· LAW-009) at any management point',resp:'REDUCE',
   why:'cut the lot count while the door is still normal width — the last contract always pays the worst price'})},
 {id:'LQ-02',fam:'LIQUIDITY',nm:'Spread blowout at entry',
  tape:'Mid is a fiction: quotes 8–10% wide, displayed size flickers, the fill and the mark disagree the moment you own it.',
  ck:p=>{const m=DECD_mx(p),v22=DECD_vote(p,'S22');return[
   {t:'Spread '+U.fmt(p.rmath.spreadPct||0,1)+'% ≥ 75% of the OPT-007 cap ('+U.fmt(ck('options.max_spread_pct')*0.75,1)+'%)',hit:p.rmath.spreadPct!=null&&p.rmath.spreadPct>=ck('options.max_spread_pct')*0.75},
   {t:'S22 Options Desk verdict: '+(v22?v22.verdict.toUpperCase():'absent'),hit:!!v22&&v22.verdict!=='pass'},
   {t:'OPT-007/spread condition on the unmet list: '+(m.unmet.filter(u=>/OPT-007|spread/i.test(u)).map(U.esc).join(' · ')||'none'),hit:m.unmet.some(u=>/OPT-007|spread/i.test(u))},
  ]},
  kill:p=>({
   dies:'the contract is the trade — and the contract is impossible. A bad contract kills an A+ chart (LAW-009)',
   mon:'the scheduled spread re-run (LS-121 lane); OI and day volume at the chosen strike',
   trip:'spread > '+ck('options.max_spread_pct')+'% '+'at decision time — the veto line, not a judgment call',resp:'HOLD',
   why:'WAIT, not entry: spreads normalize within 30m in most of the history (AUT-117) — re-run when the door reopens'})},
 {id:'LQ-03',fam:'LIQUIDITY',nm:'Crowded exit door',
  tape:'Heat, flow and RVOL all confirm the same direction — then one red candle turns confirmation into a queue, and everyone’s exit is your fill.',
  ck:p=>{const m=DECD_mx(p),v21=DECD_vote(p,'S21'),v23=DECD_vote(p,'S23');return[
   {t:'S21 social-heat vote: '+(v21?v21.verdict+' — crowding on the record':'absent'),hit:!!v21&&v21.verdict!=='pass'},
   {t:'RVOL '+(m.s?U.fmt(m.s.rvol,1)+'×':'n/a')+' ≥ 2.0× — the move is already crowded',hit:!!m.s&&m.s.rvol>=2},
   {t:'Flow confirmation on record (S23 '+(v23?v23.verdict:'absent')+') — the crowd is IN, not coming',hit:!!v23&&v23.verdict!=='abstain'},
  ]},
  kill:p=>{const tr=DECD_trip(p,0.5);return{
   dies:'the marginal buyer arrived before you did — distribution into your confirmation',
   mon:'RVOL decay while price stalls; S23 flow flipping to closing prints; heat percentile rolling over',
   trip:'5m close beyond '+tr.txt+' (entry − 0.5×risk) with RVOL ≥ 1.5×',resp:'REDUCE',
   why:'half off into the first crack; the runner keeps its structural stop — crowding is context, the stop is law'}}},
 {id:'EV-01',fam:'EVENT',nm:'Repricing inside blackout',
  tape:'A scheduled print lands and the tape gaps through levels — no structure, pure repricing; stops fill at the far side of the gap.',
  ck:p=>{const ev=EVENTS.find(e=>e.t.startsWith('Today'));let near=false,evTxt='none today';
   if(ev){const mm=ev.t.match(/(\d{1,2}):(\d{2})/);if(mm){const em=+mm[1]*60+ +mm[2];near=Math.abs(em-CLOCK.mins())<=90;evTxt=U.esc(ev.what)+' at '+mm[0]}}
   return[
   {t:'Binary event '+(p.rmath.eventHrs!=null?Math.round(p.rmath.eventHrs)+'h out':'undated')+' — inside 2× the '+ck('risk.event_window_hrs')+'h blackout window',hit:p.rmath.eventHrs!=null&&p.rmath.eventHrs<ck('risk.event_window_hrs')*2},
   {t:'Macro event on TODAY’s calendar: '+evTxt,hit:!!ev},
   {t:'Session clock within 90m of the event window right now',hit:near},
  ]},
  kill:p=>({
   dies:'the trade is alive when the calendar goes off — event repricing does not negotiate with structure',
   mon:'Markets → Calendar enforcement chips; the time-stop discipline on every open scalp',
   trip:'clock reaches T−15m of the event with the position on (today: scalps flat by 13:45 for the 14:00 print)',resp:'EXIT',
   why:'binary events are not tradeable edges here (LAW-017) — flat is the position, and it is a position'})},
 {id:'EV-02',fam:'EVENT',nm:'Correlated macro shock',
  tape:'Nothing idiosyncratic happens to your name — the whole cluster reprices at once and every “independent” position turns out to be the same bet.',
  ck:p=>{const vix=parseFloat(REGIME.vix);return[
   {t:'Same-name exposure already open: '+(POSITIONS.some(x=>x.sym===p.sym)?POSITIONS.filter(x=>x.sym===p.sym).map(x=>x.id).join(' · ')+' — this packet ADDS to '+p.sym:'none'),hit:POSITIONS.some(x=>x.sym===p.sym)},
   {t:'Cluster at '+U.fmt(p.rmath.sectorPct||0,1)+'% of the '+ck('risk.max_sector_exposure')+'% cap (≥60% utilization flags)',hit:p.rmath.sectorPct!=null&&p.rmath.sectorPct>=ck('risk.max_sector_exposure')*0.6},
   {t:'VIX '+U.esc(REGIME.vix)+' — below 16, the shock cushion is thin (complacency tape)',hit:!isNaN(vix)&&vix<16},
  ]},
  kill:p=>({
   dies:p.sym+' plus the open book is ONE bet — a beta shock takes them together, correlation goes to 1 exactly when you need it not to',
   mon:'S33 cluster sum every minute; index correlation of open R in Portfolio → Exposure',
   trip:'cluster sum > '+ck('risk.max_sector_exposure')+'% '+'or open risk > '+ck('risk.max_open_risk_R')+'R after any add',resp:'REDUCE',
   why:'cut the most correlated leg first — the cap counts correlated risk as one position because the market does'})},
 {id:'EV-03',fam:'EVENT',nm:'Earnings leak drift',
  tape:'A slow, senseless drift against structure days before the print — someone knows, and the tape whispers before the wire talks.',
  ck:p=>{const m=DECD_mx(p);const dm=p.instrument&&p.instrument.match(/(\d+)DTE/);const dte=dm?+dm[1]:null;return[
   {t:'Earnings '+(p.rmath.eventHrs!=null?Math.round(p.rmath.eventHrs/24)+'d out':'undated')+' — inside the 30d drift zone',hit:p.rmath.eventHrs!=null&&p.rmath.eventHrs<=30*24},
   {t:'Contract '+(dte!=null?dte+'DTE':'no DTE stated')+' crosses or brushes the event ('+(p.rmath.eventHrs!=null?Math.round(p.rmath.eventHrs/24)+'d':'—')+')',hit:dte!=null&&p.rmath.eventHrs!=null&&dte*24>=p.rmath.eventHrs},
   {t:'IVR '+(m.s?m.s.ivr:'n/a')+' ≥ 45 — the options market is already pre-positioning',hit:!!m.s&&m.s.ivr>=45},
  ]},
  kill:p=>({
   dies:'the position becomes an earnings bet by accident — duration and event misaligned (LAW-016, S22 DTE-conflict lane)',
   mon:'S19 implied-vs-history read; the S22 DTE/event conflict flag that arms at T−7d',
   trip:'T−'+Math.max(1,Math.round(ck('risk.event_window_hrs')/24))+'d 16:00 — no swing exposure into the '+ck('risk.event_window_hrs')+'h window '+'(LAW-017)',resp:'REDUCE',
   why:'roll size down as the window approaches; the event itself is never the edge on this desk'})},
 {id:'OP-01',fam:'OPERATOR',nm:'Late chase entry',
  tape:'The fill prints three–four candles after displacement, far from the zone; the first normal pullback puts the position at max pain immediately.',
  ck:p=>{const m=DECD_mx(p);const adv=m.dir*(m.px-m.r.entry)/m.risk;const used=(m.ttlMax-(p.ttl||0))/m.ttlMax;return[
   {t:'Quote already '+U.fmt(adv,2)+'×risk beyond entry (chase line 0.3×) — the move left without you',hit:adv>0.3},
   {t:'Packet evidence '+U.fmt(U.clamp(used,0,1)*100,0)+'% through its TTL — staleness invites chasing',hit:used>0.5},
   {t:'Killzone check right now: '+(CLOCK.killzone()||CLOCK.phase()+' — OUTSIDE any killzone'),hit:!CLOCK.killzone()},
  ]},
  kill:p=>{const m=DECD_mx(p),cap=m.r.entry+m.dir*0.25*m.risk;return{
   dies:'you paid the trapped-trader premium instead of collecting it — the #1 journal failure tag (31 cases)',
   mon:'fill distance vs zone edge in the blotter; the first-return rule in the entry model (S14)',
   trip:'fills accepted only between the zone edge and '+U.fmt(m.r.entry)+' '+(m.dir>0?'+':'−')+' 0.25×'+U.fmt(m.risk)+' = '+U.fmt(cap)+' — beyond the band, no order exists',resp:'HOLD',
   why:'no fill beyond the band — a missed trade costs 0R, and NO_TRADE is a position'}}},
 {id:'OP-02',fam:'OPERATOR',nm:'Revenge add',
  tape:'Loss, then immediately bigger risk on a worse chart — the next trade is about the P&L, not the setup.',
  ck:p=>[
   {t:'Day P&L '+U.money(S.dayPnl)+' — red tape is the precondition for revenge',hit:S.dayPnl<0},
   {t:'risk_mode '+S.riskMode+' — a breaker or cooldown is already speaking',hit:S.riskMode!=='NORMAL'},
   {t:'Sizing-lab ladder sim: rung '+DECD_LADDER.rung+(DECD_LADDER.cool?' · COOLDOWN':'')+' — pressure state read across the lab',hit:DECD_LADDER.rung>0||DECD_LADDER.cool},
  ],
  kill:p=>({
   dies:'the operator overrides the formula after a red — LAW-012 exists because this is the default human failure, not the rare one',
   mon:'the loss ladder rung; minutes since last stop-out; MEM rules injected at gate-time',
   trip:'2 consecutive reds → cooldown arms at rung 2 '+'(MM-004) — this tripwire is behavioral, not a price',resp:'HOLD',
   why:'formulaic risk only: the next trade is taken at ladder size or it is not taken'})},
 {id:'OP-03',fam:'OPERATOR',nm:'Management drift from plan',
  tape:'The template says trim; the hand hovers; “one more candle” — deviation compounds until the plan is decoration over a discretionary trade.',
  ck:p=>[
   {t:'Open-position template deviation: '+(POSITIONS.filter(x=>(x.dev||0)>=10).map(x=>x.id+' dev '+x.dev).join(' · ')||'all inside 10 pts'),hit:POSITIONS.some(x=>(x.dev||0)>=10)},
   {t:'Out-of-envelope amendment pending: '+(AMENDMENTS.filter(a=>a.st==='PENDING').map(a=>a.id).join(' · ')||'none'),hit:AMENDMENTS.some(a=>a.st==='PENDING')},
   {t:POSITIONS.length+' concurrent positions — attention is the scarcest resource on the desk (≥3 flags)',hit:POSITIONS.length>=3},
  ],
  kill:p=>({
   dies:'death by a thousand small overrides — no single breach big enough to name, all of them drift',
   mon:'S27 deviation score per position, every 30s; every manual order compared against the approved template',
   trip:'deviation score ≥ 25 OR any action outside the envelope enum (widen/add/extend are FORBIDDEN rows)',resp:'HOLD',
   why:'the FSM manages, the human supervises — outside the envelope means an amendment mini-packet through the same token gate, never a hand on the wheel'})},
];
function DECD_pmScores(p){
  return DECD_MODES.map((m,i)=>{const checks=m.ck(p);return{m,i,checks,score:checks.filter(c=>c.hit).length}})
   .sort((a,b)=>b.score-a.score||a.i-b.i);
}
const DECD_SEATMODE={S21:'LQ-03',S23:'LQ-03',S16:'SF-01',S13:'SF-01',S12:'SF-01',S08:'SF-03',S22:'LQ-02',S11:'LQ-01',S26:'SF-02',S33:'EV-02',S19:'EV-03',S18:'EV-01',S27:'OP-03',S14:'OP-01',S01:'OP-02'};
const DECD_CF=[
 {pkt:'PKT-2141',sym:'COIN',mode:'OP-01',died:'−1.0R',caught:'Fill printed 4 candles past displacement — the chase checks were 3/3 at entry time',saved:'+1.0R — the entry band refuses the fill entirely'},
 {pkt:'PKT-2150',sym:'AMD',mode:'LQ-02',died:'−1.3R (slippage carried it past the stop)',caught:'Spread sat at 82% of the OPT-007 cap at assembly, and widening',saved:'+0.3R of the overrun — the stop itself was already law'},
 {pkt:'PKT-2168',sym:'META',mode:'SF-03',died:'−1.0R',caught:'Counter-regime flag plus S08 advisory, both on the packet face',saved:'+1.0R — the HOLD response never enters the trade'},
 {pkt:'PKT-2177',sym:'TSLA',mode:'SF-02',died:'−1.0R (wick through the shelf, then full reversal)',caught:'Stop parked $0.08 off the round level with the pool below untaken',saved:'+0.5R — REDUCE at the −0.75×risk tripwire halves the hit'},
 {pkt:'PKT-2183',sym:'NVDA',mode:'LQ-03',died:'−0.9R',caught:'Heat 96th pctile + RVOL 2.8× + flow all-in: 3/3 on the crowding checks',saved:'+0.45R — half off at the first 5m crack under the trigger'},
 {pkt:'PKT-2190',sym:'SPY',mode:'EV-01',died:'−1.6R (gap through the stop at the print)',caught:'CPI at T−18h — inside the '+ck('risk.event_window_hrs')+'h window by plain arithmetic',saved:'+1.6R — the LAW-017 EXIT means flat before the print'},
];

/* ── premort.* commands ── */
CMD.define({id:'premort.ack',label:'Pre-mortem acknowledgment',purpose:'Toggle one of the three ritual acknowledgments — module state, audited',audit:false,
  run:a=>{if(!(a in DECD_PM.acks))return;
   DECD_PM.acks[a]=!DECD_PM.acks[a];
   const p=DECD_pkt(),n=Object.values(DECD_PM.acks).filter(Boolean).length;
   SVR.audit('HUMAN (owner)','premortem','ACK '+a+' → '+(DECD_PM.acks[a]?'ACKNOWLEDGED':'withdrawn')+' · '+(p?p.id:'no packet')+' · ritual '+n+'/3');
   if(n===3)UI.toast('3/3 acknowledged — the kill list is now yours, not the desk’s','gold','PRE-MORTEM RITUAL');
   render()}});
CMD.define({id:'premort.reset',label:'Reset ritual',purpose:'Clear all three acknowledgments for the packet in scope',audit:false,
  run:()=>{Object.keys(DECD_PM.acks).forEach(k=>DECD_PM.acks[k]=false);DECD_PM.filedAt=null;
   SVR.audit('HUMAN (owner)','premortem','Ritual RESET — acknowledgments cleared for '+(DECD_PM.pkt||'—'));
   UI.toast('Ritual cleared — re-read before re-acknowledging','','PRE-MORTEM');render()}});
CMD.define({id:'premort.mode',label:'Open failure mode',purpose:'Full evidence breakdown for one mode in a drawer',audit:false,
  run:a=>{const p=DECD_pkt();if(!p)return;
   const md=DECD_MODES.find(x=>x.id===a);if(!md)return;
   const checks=md.ck(p),score=checks.filter(c=>c.hit).length,k=md.kill(p);
   const cf=DECD_CF.filter(x=>x.mode===md.id);
   UI.drawer('<div class="dhead"><span class="dt">'+md.id+' · '+U.esc(md.nm).toUpperCase()+'</span><span class="pill">'+md.fam+' family · scored vs '+p.id+'</span><button class="dx" data-cmd="ui.closeDrawer">ESC</button></div>'+
    '<div class="dbody">'+
    kv('ON THE TAPE','<span style="font-size:11.5px;line-height:1.6">'+U.esc(md.tape)+'</span>')+
    '<div class="hr"></div>'+
    checks.map(c2=>'<div class="kv"><span class="k mono" style="color:'+(c2.hit?'var(--warn)':'var(--pos)')+'">'+(c2.hit?'+1':'+0')+'</span><span class="v" style="font-size:11px">'+c2.t+'</span></div>').join('')+
    kv('SCORE',checks.map(c2=>c2.hit?'+1':'+0').join(' ')+' = <b>'+score+'/3</b> — the arithmetic is the whole model; no hidden weighting')+
    '<div class="hr"></div>'+
    '<div class="banner '+(score>=2?'warn':'info')+'"><span class="bico">'+(score>=2?'!':'i')+'</span><div><b>This trade dies if</b> '+U.esc(k.dies)+'.<br><span class="i2" style="font-size:10.5px">MONITOR: '+U.esc(k.mon)+'</span><br><span class="mono" style="font-size:10.5px;color:var(--live)">TRIPWIRE: '+k.trip+'</span><br>'+chip(k.resp,k.resp==='EXIT'?'ch-blk':k.resp==='REDUCE'?'ch-warn':'ch-info',k.resp==='EXIT'?'⛔':'!')+' <span class="i2" style="font-size:10.5px">'+U.esc(k.why)+'</span></div></div>'+
    (cf.length?'<div class="hr"></div><div class="kv" style="border:none"><span class="k">PRIOR DEATHS BY THIS MODE</span><span class="v demo-wm">demo archive</span></div>'+cf.map(x=>kv(x.pkt+' '+x.sym,'<span style="font-size:11px">'+U.esc(x.caught)+' · died '+U.esc(x.died)+' · '+U.esc(x.saved)+'</span>')).join(''):'')+
    '</div>')}});
CMD.define({id:'premort.file',label:'File pre-mortem',purpose:'Write the kill list + ritual state to the journal (LAW-018 — rituals are data too)',
  run:()=>{const p=DECD_pkt();if(!p){UI.toast('No packet in scope — nothing to pre-mortem','warn','PRE-MORTEM');return}
   const top=DECD_pmScores(p).slice(0,3);
   const n=Object.values(DECD_PM.acks).filter(Boolean).length;
   JOURNAL.unshift({t:CLOCK.hm(),id:p.id,sym:p.sym,kind:'PREMORTEM',
    what:'Pre-mortem filed · kill list: '+top.map(x=>x.m.id+' '+x.score+'/3').join(' · ')+' · ritual '+n+'/3',
    grade:p.grade,outcome:'—',
    lesson:'Tripwires pre-committed before capital: '+top.map(x=>x.m.nm+' → '+x.m.kill(p).resp).join(' · ')});
   DECD_PM.filedAt=CLOCK.hms();
   SVR.audit('HUMAN (owner)','premortem','PRE-MORTEM FILED for '+p.id+' · top modes '+top.map(x=>x.m.id+'('+x.score+'/3)').join(' ')+' · ritual '+n+'/3 · responses pre-committed (LAW-018)');
   UI.toast('Pre-mortem filed to the journal — the cheap lesson is on record before the expensive one can happen','gold','PRE-MORTEM');
   render()}});

/* ── VIEW · decisions.premortem — assume the packet died; explain it first ── */
VIEWS['decisions.premortem']=function(){
  const p=DECD_pkt();
  if(!p)return vhead('DECISIONS · pre-mortem engine','No packet in scope',
    'Nothing to kill — the pipeline has produced no packet this session. The engine only ever runs against a real packet’s fields; it does not rehearse on hypotheticals.')+
   panel('THE METHOD, WHILE IDLE','work the failure backwards before the capital goes forward',
    kv('STEP 1','Assume the trade is already dead. Not “might fail” — dead. The stop printed, the R is gone, and the only question left is the one worth asking early: what killed it?')+
    kv('STEP 2','Score 12 named failure modes in 4 families (Structure · Liquidity · Event · Operator) against the packet’s own fields — votes, rmath distances, unmet conditions, TTL. Three deterministic checks per mode, +1 each, arithmetic on screen. No hidden weighting, no vibes.')+
    kv('STEP 3','The top three become the kill list: a monitor (what to watch), a tripwire (a level derived from rmath — e.g. entry − 0.5×risk), and a pre-committed response from the enum {EXIT · REDUCE · HOLD-with-reason}. Decided now, while you are calm and unpositioned.')+
    kv('STEP 4','Acknowledge the three-line ritual — stop is real, size is set (LAW-012), kill list read — then file the whole thing to the journal '+prov('LAW-018')+' and only then judge the packet.')+
    kv('WHY','A post-mortem invoices you in R and a court cycle. A pre-mortem invoices you in minutes. Same lesson, two prices — and the committee already argues against every trade; this engine makes YOU do it too, with receipts.'));
  if(DECD_PM.pkt!==p.id){DECD_PM.pkt=p.id;Object.keys(DECD_PM.acks).forEach(k=>DECD_PM.acks[k]=false);DECD_PM.filedAt=null}
  const scored=DECD_pmScores(p),top=scored.slice(0,3);
  const nAck=Object.values(DECD_PM.acks).filter(Boolean).length;
  const diss=p.votes.filter(v=>v.verdict==='block'||v.verdict==='abstain');
  const adv=p.votes.filter(v=>v.verdict==='advisory');
  let h=vhead('DECISIONS · pre-mortem engine','Assume '+p.id+' is already dead — now explain it',
   'The stop printed. The R is gone. Working backwards from that certainty, 12 named failure modes are scored against the packet’s own fields — then the top three become monitors, tripwires and pre-committed responses, decided while you are still calm.',
   chip(p.sym+' '+p.dir+' · '+p.playbook,'ch-info','◆')+' '+lc(p.state));
  h+='<div class="grid g4">'+
   stat('Assumed dead',p.id,U.esc(p.instrument)+' · grade '+p.grade)+
   stat('Loudest mode',top[0].m.id+' · '+top[0].score+'/3','<span style="font-size:11px">'+U.esc(top[0].m.nm)+'</span>')+
   stat('Ritual',nAck+'/3',nAck===3?'<span class="up">ACKNOWLEDGED</span>':'acknowledgments below')+
   stat('Filed',DECD_PM.filedAt||'not yet','premort.file → journal, kind PREMORTEM')+'</div>';
  /* (a) taxonomy — 12 modes, 4 families */
  DECD_FAMS.forEach(([fam,motto])=>{
    const rows=scored.filter(x=>x.m.fam===fam).sort((a,b)=>a.i-b.i);
    h+=panel(fam+' — “'+motto+'”','three named modes · deterministic evidence from '+p.id+'’s own fields · click a card for the full breakdown',
     '<div class="grid g3">'+rows.map(x=>{
      const arith=x.checks.map(c2=>c2.hit?'+1':'+0').join(' ')+' = '+x.score+'/3';
      return'<div class="stat" style="cursor:pointer;'+(x.score>=2?'border-color:var(--warn);':'')+'" data-cmd="premort.mode" data-arg="'+x.m.id+'">'+
       '<div class="k">'+x.m.id+' · <span class="mono" style="color:'+(x.score>=2?'var(--warn)':x.score===1?'var(--ink1)':'var(--pos)')+'">'+arith+'</span></div>'+
       '<div class="v" style="font-size:12px">'+U.esc(x.m.nm)+'</div>'+
       '<div class="s" style="line-height:1.5;margin-top:3px">'+U.esc(x.m.tape)+'</div>'+
       '<div style="margin-top:6px">'+x.checks.map(c2=>'<div class="row" style="gap:6px;align-items:flex-start;margin-bottom:2px"><span class="mono" style="font-size:9.5px;color:'+(c2.hit?'var(--warn)':'var(--pos)')+'">'+(c2.hit?'✚':'·')+'</span><span class="i2" style="font-size:9.5px;line-height:1.45">'+c2.t+'</span></div>').join('')+'</div></div>'}).join('')+'</div>');
  });
  /* (b) kill list */
  h+=panel('KILL LIST — the top three, converted into commitments','“this trade dies if…” · monitor · tripwire from rmath · pre-committed response enum',
   top.map((x,i)=>{const k=x.m.kill(p);return'<div class="banner '+(i===0?'blk':'warn')+'" style="margin-bottom:8px"><span class="bico">'+(i===0?'⛔':'!')+'</span><div style="flex:1">'+
    '<b>'+(i+1)+' · '+x.m.id+' '+U.esc(x.m.nm)+'</b> <span class="mono" style="font-size:10px">'+x.checks.map(c2=>c2.hit?'+1':'+0').join(' ')+' = '+x.score+'/3</span>'+
    '<div class="i1" style="font-size:11.5px;margin:4px 0">This trade dies if '+U.esc(k.dies)+'.</div>'+
    kv('MONITOR','<span style="font-size:11px">'+U.esc(k.mon)+'</span>')+
    kv('TRIPWIRE','<span class="mono" style="font-size:10.5px;color:var(--live)">'+k.trip+'</span>')+
    kv('RESPONSE',chip(k.resp,k.resp==='EXIT'?'ch-blk':k.resp==='REDUCE'?'ch-warn':'ch-info',k.resp==='EXIT'?'⛔':'!')+' <span class="i2" style="font-size:10.5px">'+U.esc(k.why)+'</span>')+
    '</div></div>'}).join('')+
   '<div class="i2" style="font-size:10.5px">The response is chosen NOW, from the enum {EXIT · REDUCE · HOLD-with-reason} — at the tripwire there is nothing left to decide, only something to execute. Deciding under fire is how the Pareto’s top tags get written.');
  /* (e) dissent amplifier */
  h+=panel('DISSENT AMPLIFIER — the committee’s bear case, enlarged','block and abstain votes cannot hide in a chip; each maps to a named failure mode',
   (diss.length?'':'<div class="banner info" style="margin-bottom:8px"><span class="bico">i</span><div>No block or abstain votes on '+p.id+' — the loudest remaining dissent is advisory-tier, amplified below so it cannot hide in a vote chip.</div></div>')+
   (diss.length?diss:adv).map(v=>{const mid=DECD_SEATMODE[v.seat]||'SF-01';const md=DECD_MODES.find(x=>x.id===mid);return'<div class="banner '+(v.verdict==='block'?'blk':'warn')+'" style="margin-bottom:8px"><span class="bico">'+(v.verdict==='block'?'⛔':'◮')+'</span><div style="flex:1">'+
    '<b style="font-size:12px">'+v.seat+' '+(SEATBY[v.seat]?SEATBY[v.seat].nm:'')+'</b> '+chip(v.verdict.toUpperCase(),v.verdict==='block'?'ch-blk':v.verdict==='abstain'?'ch-mut':'ch-warn',v.verdict==='block'?'✕':'!')+
    '<div class="i1" style="font-size:12px;line-height:1.6;margin:4px 0">'+U.esc(v.txt)+'</div>'+
    (v.hard&&v.hard.length?'<div class="mono" style="font-size:10px;color:var(--blk);margin-bottom:4px">'+v.hard.map(U.esc).join(' · ')+'</div>':'')+
    '<span class="tag" style="cursor:pointer" data-cmd="premort.mode" data-arg="'+mid+'">maps to '+mid+' · '+(md?U.esc(md.nm):'')+'</span></div></div>'}).join('')+
   (p.dissent&&p.dissent.length?'<div class="hr"></div>'+p.dissent.map(d=>kv('RECORDED DISSENT · '+d.seat,'<span style="font-size:11px">'+U.esc(d.note)+'</span>')).join(''):'')+
   '<div class="banner gold" style="margin-top:8px"><span class="bico">◆</span><div><b>Most credible bear case, synthesized:</b> '+top[0].m.id+' '+U.esc(top[0].m.nm)+' ('+top[0].score+'/3) voiced nearest by '+U.esc((diss[0]||adv[0]||{seat:'the taxonomy'}).seat||'the taxonomy')+' — if it plays out, the pre-committed answer is '+top[0].m.kill(p).resp+' at <span class="mono">'+top[0].m.kill(p).trip+'</span>. Argue with that sentence now, or obey it later.</div></div>');
  /* (c) counterfactual library */
  h+=panel('COUNTERFACTUAL LIBRARY — six deaths this engine would have priced','<span class="demo-wm">demo archive</span> · R saved assumes the tripwire had been honored, which is the hard part',
   tbl(['Packet','Mode','What the pre-mortem would have caught','>Died','>R saved if honored'],DECD_CF.map(x=>{
    const md=DECD_MODES.find(z=>z.id===x.mode);
    return'<tr><td class="mono"><b>'+x.pkt+'</b> '+x.sym+'</td><td class="mono" style="font-size:10px;cursor:pointer" data-cmd="premort.mode" data-arg="'+x.mode+'">'+x.mode+' '+(md?U.esc(md.nm):'')+'</td><td class="i1" style="font-size:10.5px">'+U.esc(x.caught)+'</td><td class="r num dn">'+U.esc(x.died)+'</td><td class="r num up">'+U.esc(x.saved)+'</td></tr>'}).join(''))+
   '<div class="banner warn" style="margin:8px 12px"><span class="bico">!</span><div><b>Say the bias out loud:</b> this library is hindsight-selected by construction — it contains only deaths whose mode we later named, and none of the trades where a 3/3 flag fired and nothing died. Read it as “the engine speaks the right language”, never as “the engine is 6-for-6”. The hit-rate panel below carries the honest denominator.</div></div>',{flush:true});
  /* (d) the ritual */
  const ackDef=[
   ['stop-is-real','THE STOP IS REAL','I accept the stop as final. It will not be widened, argued with, or “given room”. It is where the idea is wrong.',prov('LAW-001')],
   ['size-is-set','SIZE IS SET','Size never grows post-entry. No adds to losers, no house-money adds to winners — the formula sized this trade once.',prov('LAW-012')],
   ['modes-read','KILL LIST READ','I read the kill list. The tripwires above are pre-commitments I made to myself, not suggestions the desk made to me.',''],
  ];
  h+=panel('THE RITUAL — three acknowledgments, then judge the packet',''+(nAck===3?'complete':nAck+'/3 outstanding'),
   '<div style="margin-bottom:10px">'+(nAck===3?chip('3/3 ACKNOWLEDGED','ch-ok','✓'):chip(nAck+'/3 ACKNOWLEDGED','ch-warn','!'))+' <span class="pill">acks bind to '+p.id+' — changing packets clears them</span></div>'+
   ackDef.map(([key,t,d,pv])=>'<div class="kv" style="align-items:flex-start"><span class="k"><button class="btn sm'+(DECD_PM.acks[key]?' pri':'')+'" data-cmd="premort.ack" data-arg="'+key+'">'+(DECD_PM.acks[key]?'✓ ':'')+t+'</button></span><span class="v" style="font-size:11px;line-height:1.6">'+d+' '+pv+'</span></div>').join('')+
   '<div class="btnrow" style="margin-top:10px">'+CMD.btn('premort.file',null,'gold','▣ File pre-mortem to journal')+CMD.btn('premort.reset',null,'sm','Reset ritual')+'<button class="btn sm" data-cmd="nav.decisions.packet" data-arg="'+p.id+'">→ Judge '+p.id+'</button></div>'+
   '<div class="banner info" style="margin-top:10px"><span class="bico">i</span><div><b>Honest scope:</b> in DEMO this ritual is advisory — nothing enforces it beyond your own discipline. In production it would gate APPROVE_LIVE the same way the 19/19 section check does (LAW-007): the enum stays dark until 3/3. The gap between “would” and “does” is stated here so it cannot be mistaken for a working control.</div></div>');
  /* closing grid: hit-rate honesty + doctrine */
  h+='<div class="grid g2">';
  h+=panel('PRE-MORTEM HIT-RATE — with the denominator attached','<span class="demo-wm">demo stats</span> · a flag is cheap; the tripwire is the product',
   '<div class="grid g2">'+
    stat('Died trades, archive','23','every demo-archive trade that hit its stop or worse')+
    stat('Fatal mode in top-3','15 of 23','65% — the engine usually speaks the right language')+
    stat('Flagged but ignored','6 of 15','the tripwire existed and was not honored — the failure is upstream of the engine')+
    stat('Unflagged deaths','8 of 23','modes the taxonomy missed — each one is a candidate 13th mode')+'</div>'+
   '<div class="hr"></div>'+
   kv('THE OTHER DENOMINATOR','61 surviving trades carried 38 top-3 flags that never fired. Read 65% as recall on deaths, not precision — most flags are false alarms, and that is the correct operating point for a warning system whose false-alarm cost is one paragraph of reading.')+
   kv('WHAT WOULD CHANGE IT','Every unflagged death goes to the journal with a failure-taxonomy tag (S29); three of the same tag is a proposal for mode #13 — through the court, not through enthusiasm (LAW-013).'));
  h+=panel('DOCTRINE — why the pre-mortem beats the post-mortem','the same lesson, at two prices',
   kv('THE PRICE LIST','A post-mortem invoices in R: AUT-113 paid −1.0R to learn a source-weighting lesson, then the Learning Court spent a version cycle deploying the fix. A pre-mortem prices the identical lesson at the cost of reading it before entry.')+
   kv('THE COURT STILL OWNS IT','Nothing here changes a rule. Filed pre-mortems are journal records (LAW-018); patterns in them become evidence the court can act on '+prov('LAW-013')+' — the pre-mortem moves the classroom before the capital, it does not replace the judge.')+
   kv('WHY IT WORKS','Prospective hindsight: “it failed — why?” recruits the adversarial reading that “will it work?” suppresses. The committee already argues against the trade (S21’s dissent stands on '+p.id+'); this panel makes YOU argue against it too, with tripwires as the receipts.')+
   kv('THE TELL','If you cannot write the kill list, you do not understand the trade well enough to size it. Route back through '+'<button class="btn sm" data-cmd="nav.ws" data-arg="sizing">Sizing Lab</button> and '+'<button class="btn sm" data-cmd="nav.decisions.riskproof">Risk Proof</button> before any enum.')+
   kv('AND WHEN IT DIES ANYWAY','A death that followed the plan is a process win (the journal grades process, not outcome). The pre-mortem’s job was never to prevent the death — it was to make the death cost exactly −1R and one lesson, instead of −1R and one identity crisis.'));
  h+='</div>';
  return h;
};

