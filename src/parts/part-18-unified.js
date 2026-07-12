/* ═══════════ V12.2 · UNIFIED-build absorption (final deltas) ═══════════ */

/* chart: Bollinger + RSI pane + alert-from-chart */
CHARTX.bb=false;CHARTX.rsi=false;
CMD.define({id:'chart.alert',label:'Alert at last price',purpose:'Create a real P2 price alert from the chart (routes to Alert Center)',
 run:()=>{const s2=symBy(S.sym);pushAlert('P2',s2.sym+' price alert armed at '+U.fmt(s2.px)+' — created from chart',null);
  SVR.audit('HUMAN (owner)','alert','Chart alert armed: '+s2.sym+' @ '+U.fmt(s2.px));
  UI.toast('Alert armed at '+U.fmt(s2.px)+' — see Markets → Alert Center','ok','CHART ALERT');render()}});

/* L2 microstructure demo twin */
function microPanel(){
 const s2=symBy(S.sym),r=localRng('l2-'+s2.sym),spr=s2.px*0.0002;
 let book='';for(let i=4;i>=0;i--){const asz=Math.round(200+r()*1800),ap=s2.px+spr*(i+1);book+='<div class="kv" style="padding:2px 0;border:none"><span class="k" style="width:auto"><span class="mono dn">'+U.fmt(ap)+'</span></span><span class="v"><div class="gauge" style="width:'+(asz/20)+'px;max-width:160px"><i style="background:var(--neg)"></i></div> <span class="mono i2" style="font-size:9.5px">'+asz+'</span></span></div>'}
 book+='<div class="kv" style="border:none"><span class="k" style="width:auto;color:var(--info)">MID '+U.fmt(s2.px)+'</span><span class="v i2" style="font-size:9.5px">spread '+U.fmt(spr*2,2)+' ('+U.fmt(spr*2/s2.px*100,3)+'%)</span></div>';
 for(let i=0;i<5;i++){const bsz=Math.round(200+r()*1800),bp=s2.px-spr*(i+1);book+='<div class="kv" style="padding:2px 0;border:none"><span class="k" style="width:auto"><span class="mono up">'+U.fmt(bp)+'</span></span><span class="v"><div class="gauge" style="width:'+(bsz/20)+'px;max-width:160px"><i></i></div> <span class="mono i2" style="font-size:9.5px">'+bsz+'</span></span></div>'}
 let tape='';for(let i=0;i<8;i++){const sz=Math.round(50+r()*r()*4000);tape+='<div class="kv" style="padding:2px 0;border:none"><span class="k" style="width:52px">10:'+String(31-i).padStart(2,'0')+'</span><span class="v mono" style="font-size:10px"><span class="'+(r()>0.45?'up':'dn')+'">'+U.fmt(s2.px*(1+(r()-0.5)*0.001))+'</span> × '+sz+(sz>3000?' <span style="color:var(--warn)">BLOCK</span>':'')+'</span></div>'}
 return'<div class="grid g2"><div><div class="kv" style="border:none"><span class="k">L2 BOOK · 5 LEVELS</span><span class="v demo-wm">demo twin</span></div>'+book+'</div><div><div class="kv" style="border:none"><span class="k">TIME & SALES</span><span class="v i2" style="font-size:9.5px">blocks ≥3,000 flagged</span></div>'+tape+'</div></div>';
}

/* backend transport seam moved to the LIVE SPINE adapter (part-20-live) —
   the V12 probe grew into a real connect/stream/fail-closed lifecycle. */
